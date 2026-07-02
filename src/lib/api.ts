import { NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { prisma } from './db';
import { getUserFromRequest } from './auth';
import { UserRole, UserStatus } from '@prisma/client';

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  phone?: string | null;
  county?: string | null;
  subCounty?: string | null;
}

export type AuthenticatedRequest<T = any> = Request & {
  user: AuthenticatedUser;
  validatedData: T;
};

// Log an action to the AuditLog database
export async function createAuditLog(
  userId: number | null,
  action: string,
  details?: string | Record<string, any>,
  req?: Request
) {
  try {
    const detailString = typeof details === 'object' ? JSON.stringify(details) : details;
    const ipAddress = req?.headers.get('x-forwarded-for') || req?.headers.get('x-real-ip') || null;
    const userAgent = req?.headers.get('user-agent') || null;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: detailString,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

// Global API Route Wrapper
export function withAuth<T = any>(
  roles?: UserRole[],
  schema?: ZodSchema<T>
) {
  return function (
    handler: (req: AuthenticatedRequest<T>, context: any) => Promise<NextResponse>
  ) {
    return async function (req: Request, context: any) {
      try {
        // 1. Authenticate user
        const user = await getUserFromRequest(req);
        if (!user) {
          return NextResponse.json(
            { error: 'AuthenticationRequired', message: 'You must be logged in to perform this action.' },
            { status: 401 }
          );
        }

        // Check if user is active
        if (user.status !== UserStatus.ACTIVE) {
          return NextResponse.json(
            { error: 'UserSuspended', message: 'Your account is currently inactive or suspended.' },
            { status: 403 }
          );
        }

        // 2. Authorize role
        const userRole = user.role as UserRole;
        if (roles && !roles.includes(userRole)) {
          return NextResponse.json(
            { error: 'PrivilegeEscalation', message: 'You do not have permission to access this resource.' },
            { status: 403 }
          );
        }

        // Create authenticated request object
        const authenticatedReq = req as AuthenticatedRequest<T>;
        authenticatedReq.user = user as AuthenticatedUser;

        // 3. Optional Zod Input Validation
        if (schema) {
          let body: any;
          const contentType = req.headers.get('content-type') || '';
          
          if (req.method !== 'GET' && req.method !== 'DELETE' && contentType.includes('application/json')) {
            try {
              body = await req.json();
            } catch (e) {
              return NextResponse.json(
                { error: 'InvalidJSON', message: 'Malformed JSON payload.' },
                { status: 400 }
              );
            }
          } else {
            // Treat query params as payload for GET/DELETE or form data
            const { searchParams } = new URL(req.url);
            body = Object.fromEntries(searchParams.entries());
          }

          const parsed = schema.safeParse(body);
          if (!parsed.success) {
            return NextResponse.json(
              {
                error: 'ValidationError',
                message: 'Invalid request payload or query parameters.',
                details: parsed.error.format(),
              },
              { status: 400 }
            );
          }
          authenticatedReq.validatedData = parsed.data;
        }

        return await handler(authenticatedReq, context);
      } catch (error: any) {
        console.error('API wrapper error:', error);
        return NextResponse.json(
          { error: 'ServerError', message: error.message || 'An unexpected error occurred.' },
          { status: 500 }
        );
      }
    };
  };
}

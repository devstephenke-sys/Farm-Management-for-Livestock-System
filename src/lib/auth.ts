import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'farm_management_system_super_secret_key_2026!';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromRequest(req: Request) {
  try {
    // 1. Check Authorization header
    let token: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Check Cookie header
    if (!token) {
      const cookieHeader = req.headers.get('cookie') || '';
      const cookies = cookieHeader.split(';').reduce((acc, c) => {
        const [key, val] = c.trim().split('=');
        if (key && val) acc[key] = decodeURIComponent(val);
        return acc;
      }, {} as Record<string, string>);
      token = cookies['fms_session'] || null;
    }

    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    // Fetch user from DB to verify status
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        licenseNumber: true,
        qualification: true,
        specialization: true,
        county: true,
        subCounty: true,
        phone: true,
      },
    });

    if (!user || user.status === 'SUSPENDED') return null;

    return user;
  } catch (error) {
    console.error('Error in getUserFromRequest:', error);
    return null;
  }
}

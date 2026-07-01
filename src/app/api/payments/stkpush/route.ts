import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { initiateStkPush } from '@/lib/mpesa';
import { BRAND } from '@/lib/brand';

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber, plan } = await req.json();

    if (!phoneNumber || !plan) {
      return NextResponse.json({ error: 'Missing phone number or plan name' }, { status: 400 });
    }

    // Map plans to test prices (1, 2, or 3 KES) as requested by developer
    let amount = 1.0;
    if (plan === 'STANDARD') amount = 2.0;
    if (plan === 'PREMIUM') amount = 3.0;

    // Dynamically build Callback URL from incoming headers
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const callbackUrl = `${protocol}://${host}/api/payments/callback`;

    console.log(`Initiating STK Push to ${phoneNumber} for KES ${amount} (Plan: ${plan}). Callback: ${callbackUrl}`);

    // Call Safaricom Wrapper
    const response = await initiateStkPush({
      phoneNumber,
      amount,
      accountRef: BRAND.mpesaAccountRef(plan),
      desc: BRAND.mpesaDesc(plan),
      callbackUrl,
    });

    if (response.ResponseCode === '0') {
      const checkoutRequestId = response.CheckoutRequestID;
      const merchantRequestId = response.MerchantRequestID;

      // Log the pending payment in database
      await prisma.payment.create({
        data: {
          userId: user.id,
          amount,
          phoneNumber,
          status: 'PENDING',
          checkoutRequestId,
          merchantRequestId,
          plan,
        },
      });

      return NextResponse.json({
        success: true,
        checkoutRequestId,
        simulated: !!response.simulated,
        message: response.simulated 
          ? 'STK Push simulated initiation. Check out request created.'
          : response.CustomerMessage || 'STK Push initiated successfully.',
      });
    } else {
      return NextResponse.json(
        { error: response.ResponseDescription || 'Failed to initiate M-Pesa STK Push' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in STK Push payment route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

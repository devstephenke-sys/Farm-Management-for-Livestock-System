import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('Received M-Pesa Callback Payload:', JSON.stringify(payload));

    const callbackData = payload.Body?.stkCallback;
    if (!callbackData) {
      return NextResponse.json({ error: 'Invalid callback payload structure' }, { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc } = callbackData;

    // 1. Locate the pending payment log
    const payment = await prisma.payment.findUnique({
      where: { checkoutRequestId: CheckoutRequestID },
    });

    if (!payment) {
      console.warn(`Payment record not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // 2. Handle Payment Failure / Cancellation
    if (ResultCode !== 0) {
      console.log(`Payment failed or cancelled (ResultCode: ${ResultCode}, Description: ${ResultDesc})`);

      await prisma.$transaction(async (tx) => {
        // Update payment to failed
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });

        // Trigger notification to user
        await tx.notification.create({
          data: {
            userId: payment.userId,
            title: 'M-Pesa Payment Failed',
            message: `Your payment request for plan ${payment.plan || 'Subscription'} was unsuccessful. Reason: ${ResultDesc}`,
            type: 'SUBSCRIPTION',
          },
        });
      });

      return NextResponse.json({ success: true, message: 'Callback failure logged' });
    }

    // 3. Handle Payment Success
    console.log(`Payment successful for CheckoutRequestID: ${CheckoutRequestID}`);

    const metadataItems = callbackData.CallbackMetadata?.Item || [];
    let mpesaReceiptNumber = '';
    let transactionDateRaw = '';
    let phoneNumber = payment.phoneNumber;

    // Extract transaction metadata
    for (const item of metadataItems) {
      if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = String(item.Value);
      if (item.Name === 'TransactionDate') transactionDateRaw = String(item.Value);
      if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
    }

    // Format transaction date (format: YYYYMMDDHHMMSS to Date object)
    let transactionDate = new Date();
    if (transactionDateRaw && transactionDateRaw.length === 14) {
      const year = parseInt(transactionDateRaw.substring(0, 4));
      const month = parseInt(transactionDateRaw.substring(4, 6)) - 1;
      const day = parseInt(transactionDateRaw.substring(6, 8));
      const hour = parseInt(transactionDateRaw.substring(8, 10));
      const minute = parseInt(transactionDateRaw.substring(10, 12));
      const second = parseInt(transactionDateRaw.substring(12, 14));
      transactionDate = new Date(year, month, day, hour, minute, second);
    }

    // Process subscription updates inside a transaction to maintain integrity
    await prisma.$transaction(async (tx) => {
      // Mark payment as successful
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          mpesaReceiptNumber,
          transactionDate,
        },
      });

      // Calculate subscription dates (valid for 30 days)
      const startDate = new Date();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const planName = payment.plan || 'BASIC';

      // Fetch or create subscription
      const existingSub = await tx.subscription.findFirst({
        where: { farmerId: payment.userId },
        orderBy: { endDate: 'desc' },
      });

      if (existingSub && new Date(existingSub.endDate) > new Date()) {
        // Extend existing subscription
        const extendedEndDate = new Date(new Date(existingSub.endDate).getTime() + 30 * 24 * 60 * 60 * 1000);
        await tx.subscription.create({
          data: {
            farmerId: payment.userId,
            plan: planName,
            status: 'ACTIVE',
            startDate: existingSub.endDate,
            endDate: extendedEndDate,
            amountPaid: payment.amount,
          },
        });
      } else {
        // Create new active subscription
        await tx.subscription.create({
          data: {
            farmerId: payment.userId,
            plan: planName,
            status: 'ACTIVE',
            startDate,
            endDate,
            amountPaid: payment.amount,
          },
        });
      }

      // Add subscription activation notification
      await tx.notification.create({
        data: {
          userId: payment.userId,
          title: 'Subscription Activated!',
          message: `Thank you! Your payment of KES ${payment.amount} was received (Receipt: ${mpesaReceiptNumber}). You are now subscribed to the FMS ${planName} Plan.`,
          type: 'SUBSCRIPTION',
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Callback success resolved and subscription updated.' });

  } catch (error) {
    console.error('Error in Safaricom M-Pesa payment callback API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

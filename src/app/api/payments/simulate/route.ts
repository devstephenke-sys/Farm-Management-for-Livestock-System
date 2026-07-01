import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { checkoutRequestId, success } = await req.json();

    if (!checkoutRequestId) {
      return NextResponse.json({ error: 'checkoutRequestId is required' }, { status: 400 });
    }

    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const callbackUrl = `${protocol}://${host}/api/payments/callback`;

    let mockPayload;

    if (success) {
      const mockReceipt = 'MOCK' + Math.random().toString(36).substring(2, 8).toUpperCase() + 'R' + Math.floor(Math.random() * 10);
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

      mockPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: `mock-merchant-${new Date().getTime()}`,
            CheckoutRequestID: checkoutRequestId,
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully. (SIMULATED)',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 1.00 },
                { Name: 'MpesaReceiptNumber', Value: mockReceipt },
                { Name: 'TransactionDate', Value: parseInt(timestamp) },
                { Name: 'PhoneNumber', Value: 254700000000 },
              ],
            },
          },
        },
      };
    } else {
      mockPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: `mock-merchant-${new Date().getTime()}`,
            CheckoutRequestID: checkoutRequestId,
            ResultCode: 1032, // Request cancelled by user
            ResultDesc: 'Request cancelled by user. (SIMULATED)',
          },
        },
      };
    }

    // Fire HTTP POST request to local callback URL
    console.log(`Sending simulated M-Pesa callback to: ${callbackUrl}`);
    const callbackRes = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockPayload),
    });

    if (!callbackRes.ok) {
      throw new Error(`Local callback fetch failed: ${callbackRes.statusText}`);
    }

    const data = await callbackRes.json();
    return NextResponse.json({ success: true, callbackResponse: data });

  } catch (error) {
    console.error('Error in payment simulation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

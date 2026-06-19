import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, vendorId } = body;

    // Check if keys are loaded
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys are missing from environment variables.");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create an order (Amount is multiplied by 100 because Razorpay reads in Paise)
    const options = {
      amount: amount * 100, 
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        vendorId: vendorId || 'unknown',
      },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);

  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
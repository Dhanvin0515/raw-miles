// app/api/checkout/verify/route.ts
// Verifies Razorpay payment signature from client side.
// Does NOT confirm booking (that is done by the webhook).
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      // Return success. The webhook will handle actual booking confirmation.
      return NextResponse.json({ success: true, message: 'Payment verified' })
    } else {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } catch (err) {
    console.error('verify-payment error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

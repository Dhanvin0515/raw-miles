// app/api/webhooks/razorpay/route.ts
// Razorpay webhook handler — source of truth for payment confirmation
// IMPORTANT: Must use Node.js runtime (not Edge) for crypto
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const runtime = 'nodejs'

// Service-role client (bypasses RLS for server-side writes)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Read raw body for HMAC verification (do NOT parse first)
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature') || ''

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Razorpay webhook: invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)
    const eventType = event.event

    // ─── payment.captured — confirm the booking ────────────────────────────
    if (eventType === 'payment.captured') {
      const payment = event.payload.payment.entity
      const razorpay_payment_id = payment.id
      const razorpay_order_id = payment.order_id
      const razorpay_signature = signature

      // Idempotency: check if this payment was already processed
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, booking_id, status')
        .eq('razorpay_payment_id', razorpay_payment_id)
        .single()

      if (existingPayment?.status === 'paid') {
        // Already processed — return 200 to prevent Razorpay retries
        return NextResponse.json({ received: true, duplicate: true })
      }

      // Find the booking via the order ID
      const { data: paymentRow } = await supabase
        .from('payments')
        .select('id, booking_id')
        .eq('razorpay_order_id', razorpay_order_id)
        .single()

      if (!paymentRow) {
        console.error('Webhook: payment row not found for order', razorpay_order_id)
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      const booking_id = paymentRow.booking_id

      // Atomically confirm booking (increments slots, confirms status)
      const { data: confirmed, error: confirmErr } = await supabase
        .rpc('confirm_booking', {
          p_booking_id: booking_id,
          p_razorpay_payment_id: razorpay_payment_id,
          p_razorpay_order_id: razorpay_order_id,
          p_razorpay_signature: razorpay_signature,
        })

      if (confirmErr || !confirmed) {
        console.error('Webhook: confirm_booking failed', confirmErr)
        return NextResponse.json({ error: 'Booking confirmation failed' }, { status: 500 })
      }

      // Fetch booking details for notifications
      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          id, lead_name, lead_email, lead_phone, num_travelers,
          total_amount, gst_amount, created_at,
          packages(title, start_date, end_date)
        `)
        .eq('id', booking_id)
        .single()

      if (booking) {
        // Generate invoice number (sequential)
        const invoiceNumber = `RM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

        // Insert invoice record (PDF generation can be done separately)
        await supabase.from('invoices').insert({
          booking_id,
          invoice_number: invoiceNumber,
          gst_amount: booking.gst_amount,
          total_amount: booking.total_amount,
          pdf_url: null, // Generated separately if needed
        })

        // Send confirmation email via Resend
        try {
          await sendConfirmationEmail(booking as any, invoiceNumber)
        } catch (emailErr) {
          console.error('Email send failed (non-fatal):', emailErr)
        }

        // WhatsApp notification (stubbed — enable after WhatsApp setup)
        // await sendWhatsAppConfirmation(booking)
      }

      return NextResponse.json({ received: true, booking_id, confirmed: true })
    }

    // ─── payment.failed ────────────────────────────────────────────────────
    if (eventType === 'payment.failed') {
      const payment = event.payload.payment.entity
      const razorpay_order_id = payment.order_id

      const { data: paymentRow } = await supabase
        .from('payments')
        .select('id, booking_id')
        .eq('razorpay_order_id', razorpay_order_id)
        .single()

      if (paymentRow) {
        await supabase.from('payments').update({ status: 'failed' }).eq('id', paymentRow.id)
        await supabase.from('bookings').update({ status: 'failed' }).eq('id', paymentRow.booking_id)
      }

      return NextResponse.json({ received: true, event: 'payment.failed' })
    }

    // All other events — acknowledge receipt
    return NextResponse.json({ received: true, event: eventType })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function sendConfirmationEmail(booking: {
  id: string
  lead_name: string
  lead_email: string
  num_travelers: number
  total_amount: number
  gst_amount: number
  packages: { title: string; start_date: string; end_date: string } | null
}, invoiceNumber: string) {
  if (!process.env.RESEND_API_KEY || !booking.lead_email) return

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const pkg = booking.packages

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to: booking.lead_email,
    subject: `✅ Booking Confirmed — ${pkg?.title || 'Your Trip'}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; color: #CC1414; margin: 0;">Raw Miles</h1>
          <p style="color: #666; margin: 4px 0 0;">Curated Travel Experiences</p>
        </div>
        
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 8px;">🎉</div>
          <h2 style="color: #166534; margin: 0 0 8px;">Booking Confirmed!</h2>
          <p style="color: #166534; margin: 0;">Your adventure is officially booked.</p>
        </div>

        <h3 style="color: #1a1a1a; border-bottom: 2px solid #f5e6e6; padding-bottom: 8px;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Booking ID</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${booking.id.slice(0, 8).toUpperCase()}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Package</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${pkg?.title || 'Your Trip'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Travel Dates</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${pkg?.start_date || ''} → ${pkg?.end_date || ''}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Travellers</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${booking.num_travelers}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Invoice</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${invoiceNumber}</td></tr>
          <tr style="border-top: 2px solid #f5e6e6;"><td style="padding: 12px 0; color: #CC1414; font-weight: bold; font-size: 16px;">Total Paid</td><td style="padding: 12px 0; color: #CC1414; font-weight: bold; font-size: 16px; text-align: right;">₹${Number(booking.total_amount).toLocaleString('en-IN')}</td></tr>
        </table>

        <div style="background: #fef9f0; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-top: 24px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">📋 <strong>What's next?</strong> Our team will reach out with the full itinerary and pre-trip information within 24 hours. For any questions, reply to this email.</p>
        </div>

        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
          <p>Raw Miles | hello@rawmiles.in | +91 98765 43210</p>
        </div>
      </div>
    `,
  })
}

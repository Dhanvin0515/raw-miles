import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { booking_id } = await request.json()
    if (!booking_id) return NextResponse.json({ error: 'booking_id required' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('id', booking_id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.status !== 'pending_verification') {
      return NextResponse.json({ error: 'Only pending verification bookings can be confirmed' }, { status: 409 })
    }

    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        cancelled_by: null,
        cancellation_reason: null,
        refund_status: 'not_applicable',
      })
      .eq('id', booking_id)

    if (bookingError) throw bookingError

    const { error: paymentError } = await supabase
      .from('payments')
      .update({ status: 'paid' })
      .eq('booking_id', booking_id)

    if (paymentError) throw paymentError

    const { data: bookingDetails } = await supabase
      .from('bookings')
      .select(`
        id, lead_name, lead_email, lead_phone, num_travelers,
        total_amount, gst_amount,
        packages(title, start_date, end_date)
      `)
      .eq('id', booking_id)
      .single()

    if (bookingDetails) {
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('id, invoice_number, pdf_url')
        .eq('booking_id', booking_id)
        .maybeSingle()

      let invoiceNumber = existingInvoice?.invoice_number || `RM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

      if (!existingInvoice) {
        await supabase.from('invoices').insert({
          booking_id,
          invoice_number: invoiceNumber,
          gst_amount: bookingDetails.gst_amount,
          total_amount: bookingDetails.total_amount,
          pdf_url: null,
        })
      }

      try {
        await sendConfirmationEmail(bookingDetails as any, invoiceNumber)
      } catch (emailErr) {
        console.error('Admin confirmation email failed (non-fatal):', emailErr)
      }
    }

    return NextResponse.json({ success: true, booking_id })
  } catch (err: any) {
    console.error('Verify booking error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

async function sendConfirmationEmail(booking: {
  id: string
  lead_name: string | null
  lead_email: string | null
  lead_phone: string | null
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
    subject: 'Your trip at Raw Miles has been successfully completed',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; color: #CC1414; margin: 0;">Raw Miles</h1>
          <p style="color: #666; margin: 4px 0 0;">Curated Travel Experiences</p>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 8px;">✅</div>
          <h2 style="color: #166534; margin: 0 0 8px;">Your trip has been confirmed</h2>
          <p style="color: #166534; margin: 0;">Your trip at Raw Miles has been successfully completed.</p>
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
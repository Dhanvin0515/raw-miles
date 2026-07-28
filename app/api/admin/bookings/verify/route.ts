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
        console.log('Confirmation email sent to:', bookingDetails.lead_email)
      } catch (emailErr: any) {
        console.error('Admin confirmation email failed (non-fatal):', emailErr?.message || emailErr)
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { data: emailData, error: emailError } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to: booking.lead_email,
    subject: `🎉 Booking Confirmed — ${pkg?.title || 'Your Raw Miles Trip'}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0d0d0d; color: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; color: #E50914; margin: 0; letter-spacing: -0.5px;">Raw Miles</h1>
          <p style="color: #888; margin: 4px 0 0; font-size: 13px;">Curated Travel Experiences</p>
        </div>

        <div style="background: linear-gradient(135deg, #0a2e1a, #0d3d22); border: 1px solid #16a34a; border-radius: 12px; padding: 24px; margin-bottom: 28px; text-align: center;">
          <div style="font-size: 42px; margin-bottom: 10px;">🎉</div>
          <h2 style="color: #4ade80; margin: 0 0 8px; font-size: 20px;">Your booking is confirmed!</h2>
          <p style="color: #86efac; margin: 0; font-size: 14px;">Payment verified. Your adventure with Raw Miles is locked in.</p>
        </div>

        <!-- E-Pass Ticket -->
        <div style="background: linear-gradient(145deg, #1a0a0a, #2d0e0e); border: 1px solid rgba(229,9,20,0.4); border-radius: 16px; overflow: hidden; margin-bottom: 28px;">
          <div style="height: 4px; background: linear-gradient(90deg, #E50914, #ff6b35, #E50914);"></div>
          <div style="padding: 20px 24px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
              <div>
                <div style="color: #E50914; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px;">✈ Raw Miles · E-Pass</div>
                <div style="color: #ffffff; font-size: 18px; font-weight: 700; font-family: Georgia, serif;">${pkg?.title || 'Your Trip'}</div>
              </div>
              <div style="text-align: right;">
                <div style="color: #666; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">REF</div>
                <div style="color: #ffffff; font-family: monospace; font-size: 14px; font-weight: 700; letter-spacing: 1px;">${booking.id.slice(0, 8).toUpperCase()}</div>
              </div>
            </div>
            <div style="border-top: 1px dashed rgba(255,255,255,0.15); margin: 0 -4px 16px; padding-top: 16px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Passenger</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; font-size: 13px; text-align: right;">${booking.lead_name || 'Traveller'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Departure</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; font-size: 13px; text-align: right;">${pkg?.start_date || 'TBD'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Return</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; font-size: 13px; text-align: right;">${pkg?.end_date || 'TBD'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Travellers</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; font-size: 13px; text-align: right;">${booking.num_travelers} Person${booking.num_travelers > 1 ? 's' : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Invoice</td>
                  <td style="padding: 6px 0; color: #aaa; font-family: monospace; font-size: 12px; text-align: right;">${invoiceNumber}</td>
                </tr>
                <tr style="border-top: 1px solid rgba(229,9,20,0.3);">
                  <td style="padding: 12px 0; color: #E50914; font-weight: 700; font-size: 15px;">Total Paid</td>
                  <td style="padding: 12px 0; color: #E50914; font-weight: 700; font-size: 15px; text-align: right;">₹${Number(booking.total_amount).toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
          </div>
          <div style="background: rgba(229,9,20,0.08); border-top: 1px solid rgba(229,9,20,0.2); padding: 12px 24px; font-size: 11px; color: #888;">
            ✈ Our team will reach out within 24 hrs with your full itinerary
          </div>
        </div>

        <!-- CTA -->
        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${appUrl}/my-bookings" style="display: inline-block; background: #E50914; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">View My E-Tickets →</a>
          <p style="color: #666; font-size: 12px; margin-top: 12px;">Log in to view and save your e-pass</p>
        </div>

        <div style="background: #1a1400; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #fbbf24; font-size: 13px;">📋 <strong>What's next?</strong> Our team will reach out with the full itinerary and pre-trip details within 24 hours. For any questions, reply to this email.</p>
        </div>

        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #1f1f1f; color: #555; font-size: 12px;">
          <p style="margin: 0;">Raw Miles</p>
        </div>
      </div>
    `,
  })

  if (emailError) {
    throw new Error(`Resend error: ${JSON.stringify(emailError)}`)
  }

  return emailData
}
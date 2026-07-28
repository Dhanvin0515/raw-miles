// app/api/admin/bookings/cancel/route.ts
// Admin-only booking cancellation with optional Razorpay refund
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

    // Auth check
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Admin role check (server-side, never trust client)
    const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { booking_id, reason, trigger_refund } = await request.json()
    if (!booking_id) return NextResponse.json({ error: 'booking_id required' }, { status: 400 })

    // Use service role for admin writes
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch booking + payment details
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, status, num_travelers, package_id, total_amount')
      .eq('id', booking_id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.status === 'cancelled') return NextResponse.json({ error: 'Already cancelled' }, { status: 409 })

    // Cancel booking
    await supabase.from('bookings').update({
      status: 'cancelled',
      cancelled_by: user.id,
      cancellation_reason: reason || 'Cancelled by admin',
      refund_status: trigger_refund ? 'pending' : 'not_applicable',
    }).eq('id', booking_id)

    // Decrement slots_booked if the booking reserved inventory already
    if (booking.status === 'confirmed' || booking.status === 'pending_verification') {
      await supabase.rpc('decrement_slots', {
        p_package_id: booking.package_id,
        p_num_travelers: booking.num_travelers,
      })
    }

    if (booking.status === 'pending_verification' && !trigger_refund) {
      await supabase.from('payments').update({ status: 'failed' }).eq('booking_id', booking_id)
    }

    // Trigger Razorpay refund if requested
    if (trigger_refund) {
      const { data: payment } = await supabase
        .from('payments')
        .select('razorpay_payment_id, amount')
        .eq('booking_id', booking_id)
        .eq('status', 'paid')
        .single()

      if (payment?.razorpay_payment_id) {
        try {
          const refundResp = await fetch(
            `https://api.razorpay.com/v1/payments/${payment.razorpay_payment_id}/refund`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ amount: Math.round(Number(payment.amount) * 100) }),
            }
          )

          if (refundResp.ok) {
            await supabase.from('payments').update({ status: 'refunded' }).eq('booking_id', booking_id)
            await supabase.from('bookings').update({ refund_status: 'refunded' }).eq('id', booking_id)
          }
        } catch (refundErr) {
          console.error('Refund failed (booking still cancelled):', refundErr)
        }
      }
    }

    return NextResponse.json({ success: true, booking_id })
  } catch (err) {
    console.error('Cancel booking error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

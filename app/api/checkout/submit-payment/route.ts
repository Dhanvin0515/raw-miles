// app/api/checkout/submit-payment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role for server-side writes
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { package_id, category_id, addon_ids = [], num_travelers, coupon_code, lead_name, lead_email, lead_phone, upi_transaction_id, travelers_data } = body

    // Validate inputs
    if (!package_id || !num_travelers || num_travelers < 1 || !upi_transaction_id) {
      return NextResponse.json({ error: 'Invalid booking parameters' }, { status: 400 })
    }

    // Fetch package server-side (never trust client price)
    const { data: pkg, error: pkgErr } = await supabase
      .from('packages')
      .select('id, base_price, total_slots, slots_booked, status')
      .eq('id', package_id)
      .single()

    if (pkgErr || !pkg || pkg.status !== 'published') {
      return NextResponse.json({ error: 'Package not found or unavailable' }, { status: 404 })
    }

    // Check slots
    if (pkg.slots_booked + num_travelers > pkg.total_slots) {
      return NextResponse.json({ error: 'Not enough slots available' }, { status: 409 })
    }

    // Fetch category price
    let categoryPrice = 0
    if (category_id) {
      const { data: cat } = await supabase
        .from('package_categories')
        .select('price')
        .eq('id', category_id)
        .eq('package_id', package_id)
        .single()
      if (cat) categoryPrice = Number(cat.price)
    }

    // Fetch addon prices
    let addonTotal = 0
    if (addon_ids.length > 0) {
      const { data: addons } = await supabase
        .from('package_addons')
        .select('price')
        .in('id', addon_ids)
        .eq('package_id', package_id)
      if (addons) addonTotal = addons.reduce((sum, a) => sum + Number(a.price), 0)
    }

    // Calculate subtotal
    const subtotal = (Number(pkg.base_price) + categoryPrice + addonTotal) * num_travelers

    // Validate coupon server-side
    let discountAmount = 0
    let couponId: string | null = null

    if (coupon_code) {
      const today = new Date().toISOString().split('T')[0]
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase())
        .eq('active', true)
        .lte('valid_from', today)
        .gte('valid_until', today)
        .single()

      if (coupon) {
        const belowMax = !coupon.max_uses || coupon.times_used < coupon.max_uses
        if (belowMax) {
          couponId = coupon.id
          if (coupon.discount_type === 'percentage') {
            discountAmount = Math.floor(subtotal * (Number(coupon.discount_value) / 100))
          } else {
            discountAmount = Math.min(Number(coupon.discount_value), subtotal)
          }
        }
      }
    }

    const afterDiscount = subtotal - discountAmount
    const gstAmount = Math.round(afterDiscount * 0.05)
    const totalAmount = afterDiscount + gstAmount

    // Create pending_verification booking in Supabase
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        package_id,
        category_id: category_id || null,
        num_travelers,
        addon_ids: addon_ids.length > 0 ? addon_ids : null,
        coupon_id: couponId,
        subtotal,
        discount_amount: discountAmount,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        status: 'pending_verification',
        lead_name,
        lead_email,
        lead_phone,
        travelers: travelers_data || '[]'
      })
      .select('id')
      .single()

    if (bookingErr || !booking) {
      console.error('Booking insert error:', bookingErr)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // Create payment record with upi_transaction_id
    await supabase.from('payments').insert({
      booking_id: booking.id,
      upi_transaction_id: upi_transaction_id,
      amount: totalAmount,
      status: 'created', // Admin will change to 'paid' when verified
    })

    // Increment slots_booked
    await supabase
      .from('packages')
      .update({ slots_booked: pkg.slots_booked + num_travelers })
      .eq('id', package_id)

    // If coupon was used, increment usage
    if (couponId) {
      // In a real app this should be a stored procedure to handle concurrency properly
      const { data: currentCoupon } = await supabase.from('coupons').select('times_used').eq('id', couponId).single()
      if (currentCoupon) {
        await supabase.from('coupons').update({ times_used: currentCoupon.times_used + 1 }).eq('id', couponId)
      }
    }

    // Increment payment counter for QR rotation
    const { data: settings } = await supabase.from('site_settings').select('payment_counter').eq('id', 1).single()
    if (settings) {
      await supabase.from('site_settings').update({ payment_counter: (settings.payment_counter || 0) + 1 }).eq('id', 1)
    }

    return NextResponse.json({
      success: true,
      booking_id: booking.id
    })
  } catch (err) {
    console.error('submit-payment error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { coupon_code, subtotal } = await request.json()
    if (!coupon_code || !subtotal) {
      return NextResponse.json({ valid: false, message: 'Missing parameters' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
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

    const today = new Date().toISOString().split('T')[0]
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code.toUpperCase().trim())
      .eq('active', true)
      .lte('valid_from', today)
      .gte('valid_until', today)
      .single()

    if (error || !coupon) {
      return NextResponse.json({ valid: false, message: 'Invalid or expired coupon code' })
    }

    if (coupon.max_uses && coupon.times_used >= coupon.max_uses) {
      return NextResponse.json({ valid: false, message: 'This coupon has reached its usage limit' })
    }

    let discountAmount = 0
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.floor(subtotal * (Number(coupon.discount_value) / 100))
    } else {
      discountAmount = Math.min(Number(coupon.discount_value), subtotal)
    }

    const finalTotal = subtotal - discountAmount

    return NextResponse.json({
      valid: true,
      coupon_id: coupon.id,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: discountAmount,
      final_total: finalTotal,
      message: `Coupon applied! You save ₹${discountAmount.toLocaleString('en-IN')}`,
    })
  } catch (err) {
    return NextResponse.json({ valid: false, message: 'Server error' }, { status: 500 })
  }
}

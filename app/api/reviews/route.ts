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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { booking_id, package_id, rating, comment } = await request.json()

    if (!booking_id || !package_id || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Use service role to bypass RLS in case the user hasn't updated the RLS policy for 'completed'
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify booking belongs to user and is completed
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, user_id, status')
      .eq('id', booking_id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'You can only review packages after the trip is successfully completed' }, { status: 409 })
    }

    // Insert review
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert({
        package_id,
        booking_id,
        user_id: user.id,
        rating,
        comment: comment || null
      })

    if (reviewError) {
      // Check for unique violation
      if (reviewError.code === '23505') {
        return NextResponse.json({ error: 'You have already reviewed this booking' }, { status: 409 })
      }
      throw reviewError
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Submit review error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

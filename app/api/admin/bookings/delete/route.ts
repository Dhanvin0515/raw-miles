import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Booking id is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: booking, error: bookingFetchError } = await supabase
      .from('bookings')
      .select('id, status, package_id, num_travelers')
      .eq('id', id)
      .single()

    if (bookingFetchError) throw bookingFetchError
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status === 'confirmed' || booking.status === 'pending_verification') {
      await supabase.rpc('decrement_slots', {
        p_package_id: booking.package_id,
        p_num_travelers: booking.num_travelers,
      })
    }

    const { error: paymentsError } = await supabase.from('payments').delete().eq('booking_id', id)
    if (paymentsError) throw paymentsError

    const { error: bookingError } = await supabase.from('bookings').delete().eq('id', id)
    if (bookingError) throw bookingError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Delete booking error:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete booking' }, { status: 500 })
  }
}

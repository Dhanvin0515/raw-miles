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

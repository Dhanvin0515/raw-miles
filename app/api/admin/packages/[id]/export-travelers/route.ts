import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get package title for the filename
    const { data: pkg } = await supabase.from('packages').select('title').eq('id', id).single()

    // Get confirmed and completed bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, customer:profiles!bookings_user_id_fkey(full_name, phone)')
      .eq('package_id', id)
      .in('status', ['confirmed', 'completed', 'pending_verification'])
      .order('created_at', { ascending: true })

    const rows = [
      ['Booking ID', 'Status', 'Booking Date', 'Lead Name', 'Lead Phone', 'Lead Email', 'Traveler Name', 'Traveler Age', 'Traveler Phone', 'Medical Notes']
    ]

    for (const b of bookings || []) {
      const bookingDate = new Date(b.created_at).toLocaleDateString()
      if (b.travelers && Array.isArray(b.travelers) && b.travelers.length > 0) {
        for (const t of b.travelers) {
          rows.push([
            b.id,
            b.status,
            bookingDate,
            b.lead_name || b.customer?.full_name || '',
            b.lead_phone || b.customer?.phone || '',
            b.lead_email || '',
            t.name || '',
            t.age || '',
            t.phone || '',
            t.medical || ''
          ])
        }
      } else {
        // Just lead traveler
        rows.push([
          b.id,
          b.status,
          bookingDate,
          b.lead_name || b.customer?.full_name || '',
          b.lead_phone || b.customer?.phone || '',
          b.lead_email || '',
          b.lead_name || b.customer?.full_name || '',
          '',
          b.lead_phone || b.customer?.phone || '',
          ''
        ])
      }
    }

    // Escape quotes and wrap in quotes for CSV
    const csvContent = rows.map(row => 
      row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const cleanTitle = (pkg?.title || 'package').replace(/[^a-z0-9]/gi, '_').toLowerCase()

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${cleanTitle}_travelers.csv"`
      }
    })
  } catch (err: any) {
    console.error('Export travelers error:', err)
    return new NextResponse('Internal Server Error: ' + err.message, { status: 500 })
  }
}

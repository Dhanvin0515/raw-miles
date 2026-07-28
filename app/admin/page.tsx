import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
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

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch admin data with service-role access to avoid RLS visibility issues
  const [bookingsRes, packagesRes, couponsRes, statsRes, settingsRes, destinationsRes] = await Promise.all([
    supabaseAdmin.from('bookings').select('*, customer:profiles!bookings_user_id_fkey(full_name), packages(title), payments(upi_transaction_id, status)').order('created_at', { ascending: false }),
    supabaseAdmin.from('packages').select('*, itinerary:package_itinerary(*)').order('created_at', { ascending: false }),
    supabaseAdmin.from('coupons').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('bookings').select('total_amount').eq('status', 'confirmed'),
    supabaseAdmin.from('site_settings').select('*').eq('id', 1).single(),
    supabaseAdmin.from('destinations').select('*').order('name', { ascending: true })
  ])

  if (bookingsRes.error) {
    throw new Error(`Failed to load bookings: ${bookingsRes.error.message}`)
  }

  const bookings = bookingsRes.data || []
  const packages = packagesRes.data || []
  const coupons = couponsRes.data || []
  const settings = settingsRes.data || { hero_images: [] }
  const destinations = destinationsRes.data || []
  
  const totalRevenue = (statsRes.data || []).reduce((sum, b) => sum + Number(b.total_amount), 0)
  
  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
    { label: 'Total Bookings', value: bookings.length.toString() },
    { label: 'Total Packages', value: packages.length.toString() },
    { label: 'Active Coupons', value: coupons.filter(c => c.active).length.toString() }
  ]

  return <AdminClient 
    initialStats={stats} 
    initialPackages={packages} 
    initialBookings={bookings} 
    initialCoupons={coupons}
    initialSettings={settings}
    initialDestinations={destinations}
  />
}

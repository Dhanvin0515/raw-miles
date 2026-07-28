import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MyBookingsClient from './MyBookingsClient'

export const dynamic = 'force-dynamic'

export default async function MyBookingsPage() {
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
    redirect('/auth/login?redirect=/my-bookings')
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      packages(*, destinations(name, country)),
      invoices(invoice_number, pdf_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <MyBookingsClient bookings={bookings || []} />
}

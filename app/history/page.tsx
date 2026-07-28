import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HistoryClient from './HistoryClient'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user's bookings with package details
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      packages (
        title,
        cover_image_url,
        destinations (name)
      ),
      payments (
        status,
        amount
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <HistoryClient bookings={bookings || []} />
}

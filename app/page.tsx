import { createClient } from '@supabase/supabase-js'
import HomeClient from './HomeClient'

// Revalidate every hour
export const revalidate = 3600

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [packagesResp, destResp, settingsResp] = await Promise.all([
    supabase
      .from('packages')
      .select('*, destinations(name)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(6), // Featured packages limit
    supabase
      .from('destinations')
      .select('id, name')
      .order('name'),
    supabase
      .from('site_settings')
      .select('hero_images, past_trip_images')
      .eq('id', 1)
      .single()
  ])

  const packages = (packagesResp.data || []).map(p => ({
    ...p,
    destination: p.destinations
  }))
  const destinations = destResp.data || []
  const heroImages = settingsResp.data?.hero_images || []

  const pastTripImages = settingsResp.data?.past_trip_images || []

  return <HomeClient packages={packages} destinations={destinations} heroImages={heroImages} pastTripImages={pastTripImages} />
}

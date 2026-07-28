import { createClient } from '@supabase/supabase-js'
import PackagesClient from './PackagesClient'

// Revalidate every hour since packages don't change by the second
export const revalidate = 3600

export default async function PackagesPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [packagesResp, destResp] = await Promise.all([
    supabase
      .from('packages')
      .select('*, destinations(name)')
      .eq('status', 'published')
      .order('created_at', { ascending: false }),
    supabase
      .from('destinations')
      .select('id, name')
      .order('name')
  ])

  const packages = (packagesResp.data || []).map(p => ({
    ...p,
    destination: p.destinations
  }))
  const destinations = destResp.data || []

  return <PackagesClient initialPackages={packages} destinations={destinations} />
}

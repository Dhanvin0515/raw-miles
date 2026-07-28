import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import PackageDetailClient from './PackageDetailClient'

export const revalidate = 3600

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: pkg } = await supabase
    .from('packages')
    .select(`
      *,
      categories:package_categories(*),
      addons:package_addons(*),
      itinerary:package_itinerary(*),
      destinations(name, country)
    `)
    .eq('slug', slug)
    .single()

  if (!pkg) {
    return notFound()
  }

  // Ensure itinerary is sorted by day_number
  if (pkg.itinerary) {
    pkg.itinerary.sort((a: any, b: any) => a.day_number - b.day_number)
  }

  const packageProp = {
    ...pkg,
    destination: pkg.destinations
  }

  return <PackageDetailClient pkg={packageProp} />
}

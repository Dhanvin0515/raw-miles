'use client'
import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import PackageCard from '@/components/PackageCard'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'duration', label: 'Duration' },
]

export default function PackagesClient({ initialPackages, destinations }: { initialPackages: any[], destinations: any[] }) {
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState(100000)
  const [sortBy, setSortBy] = useState('featured')

  const filtered = useMemo(() => {
    let list = [...initialPackages]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.short_description && p.short_description.toLowerCase().includes(q))
      )
    }
    list = list.filter(p => p.base_price <= maxPrice)

    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => a.base_price - b.base_price); break
      case 'price-desc': list.sort((a, b) => b.base_price - a.base_price); break
      case 'rating': list.sort((a, b) => b.avg_rating - a.avg_rating); break
      case 'duration': list.sort((a, b) => b.duration_days - a.duration_days); break
    }
    return list
  }, [search, maxPrice, sortBy, initialPackages])

  const clearFilters = () => {
    setSearch('')
    setMaxPrice(100000)
    setSortBy('featured')
  }

  const hasFilters = search || maxPrice < 100000 || sortBy !== 'featured'

  return (
    <>
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1A0505 0%, #3D1010 60%, #1A0505 100%)',
        paddingTop: 120, paddingBottom: 60, paddingLeft: '1.5rem', paddingRight: '1.5rem', textAlign: 'center',
      }}>
        <div className="badge" style={{ background: 'rgba(204,20,20,0.7)', color: 'white', fontSize: '0.75rem', marginBottom: '1rem', display: 'inline-flex' }}>
          ✦ All Packages
        </div>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', fontWeight: 700, marginBottom: '0.75rem' }}>
          Find your perfect escape
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 480, margin: '0 auto 2rem', lineHeight: 1.7 }}>
          {initialPackages.length} curated packages across the most stunning destinations.
        </p>

        <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
          <input
            type="text" placeholder="Search packages…"
            value={search} onChange={e => setSearch(e.target.value)} className="input"
            style={{ paddingLeft: '2.75rem', fontSize: '1rem', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)',
            }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--white)', borderRadius: 8, padding: '0.5rem 0.875rem', border: '1.5px solid var(--cream-darker)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray)', whiteSpace: 'nowrap' }}>Max ₹{maxPrice.toLocaleString('en-IN')}</span>
              <input type="range" min={10000} max={100000} step={5000} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: 100 }} />
            </div>

            {hasFilters && (
              <button onClick={clearFilters} style={{
                background: 'none', border: '1.5px solid var(--cream-darker)', color: 'var(--gray)', padding: '0.5rem 0.875rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <X size={14} /> Clear
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gray)', whiteSpace: 'nowrap' }}>Sort by:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input" style={{ width: 'auto', paddingRight: '2.5rem' }}>
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--gray)' }}>
          Showing <strong style={{ color: 'var(--dark)' }}>{filtered.length}</strong> packages
        </div>

        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filtered.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--gray)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏔️</div>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.5rem', color: 'var(--dark)', marginBottom: '0.5rem' }}>No packages found</h3>
            <p>Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="btn-primary" style={{ marginTop: '1.5rem' }}>Clear All Filters</button>
          </div>
        )}
      </div>
    </>
  )
}

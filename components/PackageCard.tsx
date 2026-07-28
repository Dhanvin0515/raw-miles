// components/PackageCard.tsx
'use client'
import Link from 'next/link'
import { Star, Clock, MapPin, Users } from 'lucide-react'

interface Package {
  id: string
  title: string
  slug: string
  short_description: string
  duration_days: number
  duration_nights: number
  base_price: number
  cover_image_url: string
  avg_rating: number
  total_slots: number
  slots_booked: number
  destination: { name: string; country: string }
  start_date: string
}

export default function PackageCard({ pkg }: { pkg: Package }) {
  const slotsLeft = pkg.total_slots - pkg.slots_booked
  const isAlmostFull = slotsLeft <= 3 && slotsLeft > 0
  const isFull = slotsLeft <= 0

  return (
    <Link href={`/packages/${pkg.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
          <img
            src={pkg.cover_image_url}
            alt={pkg.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1.05)' }}
            onMouseLeave={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1)' }}
          />
          {/* Overlay badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="badge" style={{
              background: 'rgba(0,0,0,0.65)',
              color: 'white',
              backdropFilter: 'blur(8px)',
              fontSize: '0.7rem',
            }}>
              <Clock size={10} style={{ marginRight: 4 }} />
              {pkg.duration_nights}N/{pkg.duration_days}D
            </div>
            {isAlmostFull && (
              <div className="badge" style={{
                background: 'rgba(239,68,68,0.9)',
                color: 'white',
                backdropFilter: 'blur(8px)',
                fontSize: '0.7rem',
                animation: 'pulseRing 2s infinite',
              }}>
                Only {slotsLeft} left!
              </div>
            )}
            {isFull && (
              <div className="badge" style={{ background: 'rgba(107,114,128,0.9)', color: 'white', fontSize: '0.7rem' }}>
                Sold Out
              </div>
            )}
          </div>
          {/* Rating badge */}
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: 8,
            padding: '4px 10px',
            display: 'flex', alignItems: 'center', gap: 4,
            color: '#F59E0B', fontSize: '0.8rem', fontWeight: 600,
          }}>
            <Star size={12} fill="#F59E0B" /> {pkg.avg_rating}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>


          <h3 style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--dark)',
            marginBottom: '0.5rem',
            lineHeight: 1.3,
          }}>
            {pkg.title}
          </h3>

          <p style={{
            fontSize: '0.85rem',
            color: 'var(--gray)',
            lineHeight: 1.6,
            flex: 1,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {pkg.short_description}
          </p>

          <div style={{ borderTop: '1px solid var(--cream-dark)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Starting from</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>
                ₹{pkg.base_price.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray)' }}>per person</div>
            </div>
            <button
              className="btn-primary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.82rem', pointerEvents: 'none' }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

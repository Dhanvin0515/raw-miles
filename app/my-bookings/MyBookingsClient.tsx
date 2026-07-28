// app/my-bookings/page.tsx — Customer Bookings Dashboard
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Download, MapPin, Calendar, Users, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'


const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  confirmed: { label: 'Confirmed', color: '#059669', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: 'rgba(220,38,38,0.1)', icon: XCircle },
  pending_payment: { label: 'Pending', color: '#D97706', bg: 'rgba(217,119,6,0.1)', icon: RefreshCw },
}

export default function MyBookingsClient({ bookings }: { bookings: any[] }) {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all')

  const filtered = bookings.filter(b => {
    if (activeTab === 'upcoming') return b.status === 'confirmed'
    if (activeTab === 'past') return b.status === 'cancelled'
    return true
  })

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh', background: 'var(--cream)', paddingBottom: '4rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem' }}>
            My Bookings
          </h1>
          <p style={{ color: 'var(--gray)' }}>Manage your upcoming and past trips</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--white)', padding: '0.375rem', borderRadius: 12, marginBottom: '1.5rem', width: 'fit-content', border: '1px solid var(--cream-dark)' }}>
          {(['all', 'upcoming', 'past'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--gray)',
              fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize', transition: 'all 0.2s',
            }}>
              {tab === 'all' ? 'All Trips' : tab === 'upcoming' ? 'Upcoming' : 'Past / Cancelled'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--gray)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: 'var(--dark)', marginBottom: '0.5rem' }}>
              No trips found
            </h3>
            <p style={{ marginBottom: '1.5rem' }}>Time to plan your next adventure!</p>
            <Link href="/packages" style={{ textDecoration: 'none' }}>
              <button className="btn-primary">Browse Packages</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filtered.map(booking => {
              const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed
              const StatusIcon = status.icon
              return (
                <div key={booking.id} style={{
                  background: 'var(--white)', borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  display: 'flex', flexWrap: 'wrap',
                }}>
                  {/* Image */}
                  <div style={{ width: 200, minHeight: 160, flexShrink: 0, position: 'relative' }}>
                    <img src={booking.packages?.cover_image_url} alt={booking.packages?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      background: status.bg,
                      color: status.color,
                      padding: '4px 10px', borderRadius: 999,
                      fontSize: '0.72rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 4,
                      backdropFilter: 'blur(8px)',
                    }}>
                      <StatusIcon size={10} /> {status.label}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, padding: '1.25rem', minWidth: 240 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.25rem' }}>
                          {booking.packages?.title}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Booking ID: {booking.id}</span>
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{booking.total_amount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '1rem 0', fontSize: '0.825rem', color: 'var(--gray)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={13} style={{ color: 'var(--primary)' }} /> {booking.packages?.destinations?.name}, {booking.packages?.destinations?.country}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} style={{ color: 'var(--primary)' }} /> {booking.packages?.start_date} → {booking.packages?.end_date}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} style={{ color: 'var(--primary)' }} /> {booking.packages?.duration_nights}N/{booking.packages?.duration_days}D
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={13} style={{ color: 'var(--primary)' }} /> {booking.num_travelers} traveller{booking.num_travelers > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div className="chip">Package ID: {booking.package_id}</div>
                      {booking.refund_status && (
                        <div className="chip" style={{ color: '#059669', borderColor: 'rgba(16,185,129,0.3)' }}>
                          Refund: {booking.refund_status}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '0.625rem',
                    padding: '1.25rem', justifyContent: 'center', minWidth: 160,
                    borderLeft: '1px solid var(--cream-dark)',
                  }}>
                    {booking.invoices && booking.invoices[0] && (
                      <a href={booking.invoices[0].invoice_url} download style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer">
                        <button style={{
                          width: '100%', padding: '0.625rem 1rem',
                          background: 'var(--cream)', border: '1.5px solid var(--cream-darker)',
                          borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--dark-2)',
                        }}>
                          <Download size={14} /> Download Invoice
                        </button>
                      </a>
                    )}
                    {booking.status === 'confirmed' && (
                      <Link href={`/packages/${booking.packages?.slug}`} style={{ textDecoration: 'none' }}>
                        <button style={{
                          width: '100%', padding: '0.625rem 1rem',
                          background: 'rgba(204,20,20,0.08)', border: '1.5px solid rgba(204,20,20,0.2)',
                          borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)',
                        }}>
                          View Package
                        </button>
                      </Link>
                    )}
                    {booking.status === 'confirmed' && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--gray)', textAlign: 'center' }}>
                        Contact support to cancel
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

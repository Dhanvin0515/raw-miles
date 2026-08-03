// app/my-bookings/MyBookingsClient.tsx — Customer Bookings Dashboard
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Ticket, MapPin, Calendar, Users, Clock, CheckCircle, XCircle, RefreshCw, ChevronRight, Sparkles } from 'lucide-react'
import TicketModal from './TicketModal'
import ReviewModal from './ReviewModal'
import { Star } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  confirmed:            { label: 'Confirmed',           color: '#059669', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  icon: CheckCircle },
  completed:            { label: 'Successfully Completed', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', icon: Sparkles },
  pending_verification: { label: 'Pending Verification', color: '#2563EB', bg: 'rgba(37,99,235,0.1)',   border: 'rgba(37,99,235,0.25)',  icon: RefreshCw   },
  cancelled:            { label: 'Cancelled',            color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   border: 'rgba(220,38,38,0.25)',  icon: XCircle     },
  pending_payment:      { label: 'Pending Payment',      color: '#D97706', bg: 'rgba(217,119,6,0.1)',   border: 'rgba(217,119,6,0.25)',  icon: RefreshCw   },
}

const TABS = [
  { key: 'all',      label: 'All Bookings' },
  { key: 'upcoming', label: 'Upcoming'     },
  { key: 'past',     label: 'Past'         },
] as const

export default function MyBookingsClient({ bookings }: { bookings: any[] }) {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all')
  const [ticketBooking, setTicketBooking] = useState<any | null>(null)
  const [reviewBooking, setReviewBooking] = useState<any | null>(null)

  const filtered = bookings.filter(b => {
    if (activeTab === 'upcoming') return b.status === 'confirmed' || b.status === 'pending_verification'
    if (activeTab === 'past')     return b.status === 'cancelled' || b.status === 'completed'
    return true
  })

  return (
    <>
      <style>{`
        .booking-card {
          background: var(--white);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          transition: box-shadow 0.2s, transform 0.2s;
          border: 1px solid rgba(0,0,0,0.04);
        }
        .booking-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }
        .tab-pill {
          padding: 0.5rem 1.1rem;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.82rem;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .tab-pill.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 2px 8px rgba(229,9,20,0.3);
        }
        .tab-pill.inactive {
          background: transparent;
          color: var(--gray);
        }
        .tab-pill.inactive:hover {
          background: var(--cream-dark);
          color: var(--dark);
        }
        .view-ticket-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          width: 100%; padding: 0.7rem 1rem;
          background: linear-gradient(135deg, #E50914, #c0040f);
          border: none; border-radius: 10px; cursor: pointer;
          font-size: 0.82rem; font-weight: 700; color: white;
          transition: all 0.2s;
          box-shadow: 0 3px 10px rgba(229,9,20,0.25);
        }
        .view-ticket-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 16px rgba(229,9,20,0.35);
        }
        .view-pkg-btn {
          display: flex; align-items: center; justify-content: center; gap: 4px;
          width: 100%; padding: 0.6rem 1rem;
          background: transparent;
          border: 1.5px solid rgba(229,9,20,0.3); border-radius: 10px; cursor: pointer;
          font-size: 0.8rem; font-weight: 600; color: var(--primary);
          transition: all 0.2s;
        }
        .view-pkg-btn:hover {
          background: rgba(229,9,20,0.06);
          border-color: var(--primary);
        }
        @media (max-width: 600px) {
          .booking-card-inner { flex-direction: column !important; }
          .booking-img-wrap { width: 100% !important; height: 180px !important; min-width: unset !important; }
          .booking-actions-col { border-left: none !important; border-top: 1px solid var(--cream-dark) !important; flex-direction: row !important; flex-wrap: wrap !important; padding: 1rem !important; }
          .booking-actions-col > * { flex: 1; min-width: 120px; }
        }
      `}</style>

      <div style={{ paddingTop: 88, minHeight: '100vh', background: 'var(--cream)', paddingBottom: '5rem' }}>
        <div className="container" style={{ maxWidth: 860 }}>

          {/* ── Page Header ── */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.35rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(229,9,20,0.15), rgba(229,9,20,0.05))',
                border: '1.5px solid rgba(229,9,20,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ticket size={16} style={{ color: 'var(--primary)' }} />
              </div>
              <h1 style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                fontWeight: 700, color: 'var(--dark)', margin: 0,
              }}>
                My Bookings
              </h1>
            </div>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginLeft: 46 }}>
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''} · manage your trips &amp; view tickets
            </p>
          </div>

          {/* ── Tabs ── */}
          <div style={{
            display: 'flex', gap: '0.375rem',
            background: 'var(--white)', padding: '0.3rem',
            borderRadius: 100, marginBottom: '1.75rem',
            width: 'fit-content', border: '1px solid var(--cream-dark)',
            overflowX: 'auto',
          }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab-pill ${activeTab === tab.key ? 'active' : 'inactive'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Empty state ── */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '5rem 2rem',
              background: 'var(--white)', borderRadius: 24,
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.5rem', color: 'var(--dark)', marginBottom: '0.5rem' }}>
                No bookings found
              </h3>
              <p style={{ marginBottom: '1.5rem', color: 'var(--gray)' }}>Time to plan your next adventure!</p>
              <Link href="/packages" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={15} /> Browse Packages
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filtered.map(booking => {
                const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed
                const StatusIcon = status.icon
                const formattedDate = new Date(booking.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })

                return (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-card-inner" style={{ display: 'flex', flexWrap: 'wrap' }}>

                      {/* ── Cover Image ── */}
                      <div className="booking-img-wrap" style={{ width: 210, minWidth: 210, position: 'relative', flexShrink: 0 }}>
                        <img
                          src={booking.packages?.cover_image_url}
                          alt={booking.packages?.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 180 }}
                        />
                        {/* gradient overlay */}
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)',
                        }} />
                        {/* status badge */}
                        <div style={{
                          position: 'absolute', top: 10, left: 10,
                          background: status.bg,
                          color: status.color,
                          border: `1px solid ${status.border}`,
                          padding: '4px 10px', borderRadius: 999,
                          fontSize: '0.68rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: 4,
                          backdropFilter: 'blur(6px)',
                        }}>
                          <StatusIcon size={10} /> {status.label}
                        </div>
                        {/* booked date bottom */}
                        <div style={{
                          position: 'absolute', bottom: 8, left: 10,
                          color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem',
                        }}>
                          Booked {formattedDate}
                        </div>
                      </div>

                      {/* ── Details ── */}
                      <div style={{ flex: 1, padding: '1.25rem 1.5rem', minWidth: 220 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                          <div>
                            <h3 style={{
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: '1.05rem', fontWeight: 700,
                              color: 'var(--dark)', marginBottom: '0.2rem', lineHeight: 1.25,
                            }}>
                              {booking.packages?.title}
                            </h3>
                            <span style={{ fontSize: '0.7rem', color: 'var(--gray)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                              #{booking.id.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                          <div style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)',
                            whiteSpace: 'nowrap',
                          }}>
                            ₹{booking.total_amount.toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* Info chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
                          <InfoChip icon={<MapPin size={11} style={{ color: 'var(--primary)' }} />}>
                            {booking.packages?.destinations?.name}{booking.packages?.destinations?.country ? `, ${booking.packages.destinations.country}` : ''}
                          </InfoChip>
                          <InfoChip icon={<Calendar size={11} style={{ color: 'var(--primary)' }} />}>
                            {booking.packages?.start_date} → {booking.packages?.end_date}
                          </InfoChip>
                          <InfoChip icon={<Clock size={11} style={{ color: 'var(--primary)' }} />}>
                            {booking.packages?.duration_nights}N / {booking.packages?.duration_days}D
                          </InfoChip>
                          <InfoChip icon={<Users size={11} style={{ color: 'var(--primary)' }} />}>
                            {booking.num_travelers} traveller{booking.num_travelers > 1 ? 's' : ''}
                          </InfoChip>
                        </div>

                        {/* Refund pill */}
                        {booking.refund_status && (
                          <div style={{ fontSize: '0.72rem', color: '#059669', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 999, padding: '3px 10px', display: 'inline-block', fontWeight: 600 }}>
                            Refund: {booking.refund_status}
                          </div>
                        )}

                        {/* Pending info */}
                        {booking.status === 'pending_verification' && (
                          <div style={{
                            fontSize: '0.78rem', color: '#2563EB', fontWeight: 600,
                            background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
                            borderRadius: 10, padding: '0.6rem 0.9rem',
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                            <RefreshCw size={12} /> Payment verification in progress — usually takes a few hours
                          </div>
                        )}
                      </div>

                      {/* ── Actions column ── */}
                      <div
                        className="booking-actions-col"
                        style={{
                          display: 'flex', flexDirection: 'column', gap: '0.6rem',
                          padding: '1.25rem', justifyContent: 'center', minWidth: 160,
                          borderLeft: '1px solid var(--cream-dark)',
                        }}
                      >
                        {booking.status === 'confirmed' && (
                          <>
                            <button
                              className="view-ticket-btn"
                              onClick={() => setTicketBooking(booking)}
                            >
                              <Ticket size={14} /> View Tickets
                            </button>
                            <Link href={`/packages/${booking.packages?.slug}`} style={{ textDecoration: 'none' }}>
                              <button className="view-pkg-btn">
                                View Package <ChevronRight size={13} />
                              </button>
                            </Link>
                            <div style={{ fontSize: '0.67rem', color: 'var(--gray)', textAlign: 'center', lineHeight: 1.4 }}>
                              Contact support to cancel
                            </div>
                          </>
                        )}
                        {booking.status === 'completed' && (
                          <>
                            <button
                              className="view-ticket-btn"
                              style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', boxShadow: '0 3px 10px rgba(139,92,246,0.25)' }}
                              onClick={() => setReviewBooking(booking)}
                            >
                              <Star size={14} /> Write a Review
                            </button>
                            <Link href={`/packages/${booking.packages?.slug}`} style={{ textDecoration: 'none' }}>
                              <button className="view-pkg-btn">
                                View Package <ChevronRight size={13} />
                              </button>
                            </Link>
                          </>
                        )}
                        {booking.status === 'cancelled' && (
                          <Link href="/packages" style={{ textDecoration: 'none' }}>
                            <button className="view-pkg-btn" style={{ gap: 5 }}>
                              <Sparkles size={12} /> Book Again
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Modal */}
      {ticketBooking && (
        <TicketModal
          booking={ticketBooking}
          onClose={() => setTicketBooking(null)}
        />
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
        />
      )}
    </>
  )
}

function InfoChip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'var(--cream)', border: '1px solid var(--cream-dark)',
      borderRadius: 999, padding: '3px 9px',
      fontSize: '0.76rem', color: 'var(--gray)', fontWeight: 500,
    }}>
      {icon} {children}
    </span>
  )
}

'use client'
import { useEffect, useRef } from 'react'
import { X, MapPin, Calendar, Users, Clock, CheckCircle, Plane, Ticket } from 'lucide-react'

interface TicketModalProps {
  booking: any
  onClose: () => void
}

export default function TicketModal({ booking, onClose }: TicketModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const pkg = booking.packages
  const invoiceNo = booking.invoices?.[0]?.invoice_number || `RM-${booking.id.slice(0, 8).toUpperCase()}`
  const bookingRef = booking.id.slice(0, 8).toUpperCase()

  // Generate a simple visual barcode pattern
  const barcodeLines = Array.from({ length: 40 }, (_, i) => ({
    width: [1, 2, 3, 1, 2, 1, 3, 2, 1, 2][i % 10],
    gap: [2, 1, 1, 3, 1, 2, 1, 1, 2, 1][i % 10],
  }))

  return (
    <>
      <style>{`
        @media (max-width: 560px) {
          .ticket-inner { padding: 1rem 1.1rem !important; }
          .ticket-header { padding: 1.1rem 1.1rem 0.9rem !important; }
          .ticket-hero { height: 110px !important; }
          .ticket-stub { padding: 1rem 1.1rem 1.1rem !important; }
          .ticket-footer { padding: 0.6rem 1.1rem !important; }
          .ticket-title { font-size: 1.15rem !important; }
        }
      `}</style>
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
        alignItems: 'flex-start',
        paddingTop: '3.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520, position: 'relative', margin: '0 auto 2rem' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: -44, right: 0,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white', zIndex: 10,
          }}
        >
          <X size={18} />
        </button>

        {/* Ticket Card */}
        <div style={{
          background: 'linear-gradient(145deg, #1a0a0a 0%, #2d0e0e 100%)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(229,9,20,0.25), 0 0 0 1px rgba(229,9,20,0.3)',
          position: 'relative',
        }}>

          {/* Top decorative strip */}
          <div style={{
            height: 4,
            background: 'linear-gradient(90deg, #E50914, #ff6b35, #E50914, #ff6b35)',
            backgroundSize: '200% 100%',
          }} />

          {/* Header */}
          <div style={{
            padding: '1.5rem 1.75rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(229,9,20,0.15) 0%, transparent 60%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }} className="ticket-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Ticket size={18} style={{ color: '#E50914' }} />
                  <span style={{ color: '#E50914', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Raw Miles · E-Pass
                  </span>
                </div>
                <h2 style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '1.4rem', fontWeight: 700, color: 'white',
                  lineHeight: 1.2, maxWidth: 280,
                }} className="ticket-title">
                  {pkg?.title || 'Your Adventure'}
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Ref No.</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
                  {bookingRef}
                </div>
              </div>
            </div>
          </div>

          {/* Destination hero */}
          {pkg?.cover_image_url && (
            <div style={{ position: 'relative', height: 140, overflow: 'hidden' }} className="ticket-hero">
              <img
                src={pkg.cover_image_url}
                alt={pkg.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 20%, rgba(26,10,10,0.95) 100%)',
              }} />
              <div style={{
                position: 'absolute', bottom: 12, left: 20,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <MapPin size={14} style={{ color: '#E50914' }} />
                <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                  {pkg?.destinations?.name}{pkg?.destinations?.country ? `, ${pkg.destinations.country}` : ''}
                </span>
              </div>
              {/* Confirmed badge */}
              <div style={{
                position: 'absolute', top: 12, right: 16,
                background: 'rgba(5,150,105,0.9)',
                color: 'white',
                padding: '4px 12px', borderRadius: 999,
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
                display: 'flex', alignItems: 'center', gap: 5,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(16,185,129,0.4)',
              }}>
                <CheckCircle size={11} /> CONFIRMED
              </div>
            </div>
          )}

          {/* Main ticket info grid */}
          <div style={{ padding: '1.25rem 1.75rem' }} className="ticket-inner">
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Departure
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={13} style={{ color: '#E50914' }} />
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    {pkg?.start_date || 'TBD'}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Return
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={13} style={{ color: '#E50914' }} />
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    {pkg?.end_date || 'TBD'}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Duration
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={13} style={{ color: '#E50914' }} />
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    {pkg?.duration_nights}N / {pkg?.duration_days}D
                  </span>
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Travellers
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={13} style={{ color: '#E50914' }} />
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    {booking.num_travelers} {booking.num_travelers > 1 ? 'Persons' : 'Person'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Perforated tear line */}
          <div style={{ position: 'relative', margin: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{
              position: 'absolute', left: -40, top: '50%', transform: 'translateY(-50%)',
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(145deg, #1a0a0a, #0d0505)',
              border: '1px solid rgba(229,9,20,0.2)',
            }} />
            <div style={{
              flex: 1,
              borderTop: '2px dashed rgba(255,255,255,0.12)',
              position: 'relative',
            }}>
              {/* Dashes overlay for dots effect */}
              <div style={{
                position: 'absolute', top: -4,
                left: 0, right: 0,
                display: 'flex', justifyContent: 'space-between',
              }}>
                {Array.from({ length: 22 }, (_, i) => (
                  <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                ))}
              </div>
            </div>
            <div style={{
              position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)',
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(145deg, #1a0a0a, #0d0505)',
              border: '1px solid rgba(229,9,20,0.2)',
            }} />
          </div>

          {/* Bottom section — Stub */}
          <div style={{ padding: '1.25rem 1.75rem 1.5rem' }} className="ticket-stub">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>

              {/* Passenger info */}
              <div style={{ flex: 1 }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Passenger
                </div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>
                  {booking.lead_name || 'Traveller'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                  {booking.lead_email}
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                    Booking Ref
                  </div>
                  <div style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600 }}>
                    {invoiceNo}
                  </div>
                </div>
              </div>

              {/* Amount + Barcode */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Total Paid
                </div>
                <div style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '1.5rem', fontWeight: 700, color: '#E50914',
                  lineHeight: 1,
                }}>
                  ₹{Number(booking.total_amount).toLocaleString('en-IN')}
                </div>

                {/* Barcode visual */}
                <div style={{
                  marginTop: '1rem',
                  display: 'flex', alignItems: 'flex-end', gap: 1.5,
                  height: 40, justifyContent: 'flex-end',
                }}>
                  {barcodeLines.map((line, i) => (
                    <div
                      key={i}
                      style={{
                        width: line.width,
                        height: `${40 + Math.sin(i * 0.7) * 8}px`,
                        background: i % 7 === 0
                          ? 'rgba(229,9,20,0.8)'
                          : `rgba(255,255,255,${0.3 + (i % 3) * 0.2})`,
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', fontFamily: 'monospace', marginTop: 4, letterSpacing: '0.05em' }}>
                  {booking.id.replace(/-/g, '').slice(0, 16).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div style={{
            background: 'rgba(229,9,20,0.08)',
            borderTop: '1px solid rgba(229,9,20,0.15)',
            padding: '0.75rem 1.75rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }} className="ticket-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plane size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                Our team will reach out within 24 hrs with full itinerary
              </span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              Raw Miles
            </div>
          </div>
        </div>

        {/* Print hint */}
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '0.875rem' }}>
          Screenshot or save this page as a reference for your booking
        </p>
      </div>
    </div>
    </>
  )
}

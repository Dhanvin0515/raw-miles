'use client'
import Link from 'next/link'
import { Calendar, MapPin, IndianRupee, Clock, ArrowRight } from 'lucide-react'

export default function HistoryClient({ bookings }: { bookings: any[] }) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return '#10B981'; // green
      case 'cancelled': return 'var(--primary)'; // red
      case 'pending_verification': return '#3B82F6'; // blue
      default: return '#F59E0B'; // yellow/pending
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: 'var(--dark)' }}>
            Your Trip History
          </h1>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              Book a new trip
            </button>
          </Link>
        </div>
        
        {bookings.length === 0 ? (
          <div style={{ background: 'var(--white)', borderRadius: 24, padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Calendar size={32} style={{ color: 'var(--gray)' }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: 'var(--dark)', marginBottom: '0.5rem' }}>No trips yet!</h2>
            <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>You haven't booked any packages with Raw Miles yet.</p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Explore Packages</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {bookings.map((booking) => (
              <div key={booking.id} style={{ background: 'var(--white)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  
                  {/* Image */}
                  <div style={{ width: 120, height: 120, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'var(--cream-dark)' }}>
                    {booking.packages?.cover_image_url ? (
                      <img src={booking.packages.cover_image_url} alt={booking.packages.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin style={{ color: 'var(--gray)' }} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 250 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        background: `${getStatusColor(booking.status)}20`, 
                        color: getStatusColor(booking.status), 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: 20, 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        textTransform: 'uppercase' 
                      }}>
                        {booking.status === 'pending_verification' ? 'VERIFICATION PENDING' : booking.status}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                        Booked on {new Date(booking.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: 'var(--dark)', marginBottom: '0.25rem' }}>
                      {booking.packages?.title || 'Unknown Package'}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      <MapPin size={14} />
                      {booking.packages?.destinations?.name || 'Unknown Destination'}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--cream)', padding: '1rem', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} /> Booking Date
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '0.9rem' }}>
                          {new Date(booking.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <IndianRupee size={12} /> Total Amount
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '0.9rem' }}>
                          ₹{booking.total_amount?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer of card */}
                <div style={{ borderTop: '1px solid var(--cream-dark)', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                    Travelers: <strong>{booking.num_travelers}</strong>
                  </div>
                  {booking.status === 'pending_verification' && (
                    <div style={{ color: '#3B82F6', fontSize: '0.85rem', fontWeight: 600 }}>
                      Payment verification in progress
                    </div>
                  )}
                  {booking.status === 'confirmed' && (
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      View Invoice <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

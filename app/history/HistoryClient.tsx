'use client'
import Link from 'next/link'
import { Calendar, MapPin, IndianRupee, Ticket, Sparkles, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

// This page now redirects users to /my-bookings which is the primary booking hub.
// HistoryClient is kept for backward compat but links users to the better page.

export default function HistoryClient({ bookings }: { bookings: any[] }) {
  // Redirect-style banner pointing to the new bookings page
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: '5rem', paddingBottom: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: 520, textAlign: 'center' }}>
        <div style={{
          background: 'var(--white)', borderRadius: 24, padding: '3rem 2rem',
          boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
          border: '1px solid var(--cream-dark)',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎫</div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.8rem', color: 'var(--dark)', marginBottom: '0.5rem' }}>
            Your Bookings Moved!
          </h1>
          <p style={{ color: 'var(--gray)', marginBottom: '2rem', lineHeight: 1.6 }}>
            We've upgraded your booking experience. View all your trips, tickets and travel details in one place.
          </p>
          <Link href="/my-bookings" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.875rem 2rem', fontSize: '1rem' }}>
              <Ticket size={17} /> Go to My Bookings
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// app/my-bookings/ReviewModal.tsx
'use client'
import { useState } from 'react'
import { X, Star, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ReviewModal({
  booking,
  onClose
}: {
  booking: any
  onClose: () => void
}) {
  const router = useRouter()
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          package_id: booking.package_id,
          rating,
          comment
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit review')

      alert('Review submitted successfully! Thank you for your feedback.')
      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--white)', width: '100%', maxWidth: 500,
        borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--cream-dark)'
        }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.25rem', color: 'var(--dark)' }}>
            Write a Review
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            How was your trip for <strong>{booking.packages?.title}</strong>? Let us know!
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <Star
                  size={40}
                  fill={(hoverRating || rating) >= star ? '#F59E0B' : 'transparent'}
                  style={{ color: (hoverRating || rating) >= star ? '#F59E0B' : 'var(--cream-dark)' }}
                />
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Write your experience (optional)</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Tell us about the trip, what you loved, and what could be improved..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '1rem', background: 'rgba(229,9,20,0.1)', padding: '0.75rem', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn-outline" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isSubmitting ? <><Loader2 size={16} className="spin" /> Submitting...</> : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

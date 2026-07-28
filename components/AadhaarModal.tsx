// components/AadhaarModal.tsx
'use client'
import { useState } from 'react'
import { ShieldCheck, X, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface AadhaarModalProps {
  onConfirm: (aadhaar: string) => void
  onClose: () => void
}

function validateAadhaar(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return 'Aadhaar number is required'
  if (digits.length !== 12) return 'Aadhaar number must be exactly 12 digits'
  if (/^0/.test(digits)) return 'Aadhaar number cannot start with 0'
  if (/^1/.test(digits)) return 'Aadhaar number cannot start with 1'
  return null
}

function maskAadhaar(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12)
  const groups = []
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4))
  }
  return groups.join('-')
}

export default function AadhaarModal({ onConfirm, onClose }: AadhaarModalProps) {
  const [value, setValue] = useState('')
  const [showFull, setShowFull] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)

  const digits = value.replace(/\D/g, '').slice(0, 12)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12)
    setValue(raw)
    if (error) setError(null)
  }

  const handleSubmit = () => {
    const err = validateAadhaar(digits)
    if (err) { setError(err); return }
    if (!agreed) { setError('Please agree to the privacy terms'); return }
    onConfirm(digits)
  }

  const displayValue = showFull
    ? maskAadhaar(digits)
    : digits.length > 4 ? `XXXX-XXXX-${digits.slice(8)}` : digits

  const maskedDisplay = digits.length === 12
    ? `XXXX XXXX ${digits.slice(8)}`
    : `${digits.length}/12 digits entered`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--white)',
          borderRadius: 20,
          padding: '2.5rem',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          animation: 'fadeInUp 0.3s ease',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'var(--cream)', border: 'none', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gray)',
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(204,20,20,0.1), rgba(204,20,20,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <ShieldCheck size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--dark)' }}>
            Identity Verification
          </h2>
          <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            As per DGFT regulations, we require your Aadhaar number for identity verification before completing your booking.
            Your data is encrypted and stored securely.
          </p>
        </div>

        {/* Aadhaar input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Aadhaar Number *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              value={showFull ? maskAadhaar(digits) : digits.length > 8 ? `XXXX XXXX ${digits.slice(8)}` : '•'.repeat(Math.min(digits.length, 8)) + digits.slice(8)}
              onChange={handleChange}
              placeholder="Enter 12-digit Aadhaar number"
              className="input"
              style={{
                fontFamily: 'monospace',
                letterSpacing: '0.15em',
                fontSize: '1rem',
                paddingRight: '3rem',
                borderColor: error ? 'var(--primary)' : undefined,
              }}
              onFocus={(e) => { e.target.value = digits; e.target.setSelectionRange(digits.length, digits.length); }}
            />
            <button
              type="button"
              onClick={() => setShowFull(!showFull)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)',
              }}
            >
              {showFull ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                  width: 16, height: 4, borderRadius: 2,
                  background: i < digits.length ? 'var(--primary)' : 'var(--cream-dark)',
                  transition: 'background 0.15s',
                }} />
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>{digits.length}/12</span>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.375rem' }}>
              <AlertCircle size={14} style={{ color: 'var(--primary)' }} />
              <span className="error-text">{error}</span>
            </div>
          )}
        </div>

        {/* Masked preview */}
        {digits.length === 12 && (
          <div style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 10,
            padding: '0.875rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            marginBottom: '1.25rem',
          }}>
            <CheckCircle size={20} style={{ color: '#059669', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>Aadhaar number captured</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--dark)', letterSpacing: '0.1em' }}>
                XXXX XXXX {digits.slice(8)}
              </div>
            </div>
          </div>
        )}

        {/* Privacy consent */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => { setAgreed(e.target.checked); if (error === 'Please agree to the privacy terms') setError(null) }}
            style={{ marginTop: 3, flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--gray)', lineHeight: 1.6 }}>
            I consent to Raw Miles collecting and storing my Aadhaar number for identity verification purposes as per the{' '}
            <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Information Technology Act, 2000</span>.
            This information will not be shared with third parties.
          </span>
        </label>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            className="btn-outline"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            style={{
              flex: 2, justifyContent: 'center',
              opacity: digits.length !== 12 || !agreed ? 0.6 : 1,
            }}
          >
            <ShieldCheck size={16} /> Proceed to Payment
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray)', marginTop: '0.75rem' }}>
          🔒 256-bit encrypted · Compliant with UIDAI guidelines
        </p>
      </div>
    </div>
  )
}

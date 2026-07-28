// app/checkout/page.tsx
'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { ShieldCheck, CheckCircle, ArrowLeft, CreditCard, User, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const STEPS = ['Your Details', 'Review Booking', 'Payment']

function CheckoutContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [paymentDone, setPaymentDone] = useState(false)
  
  const [pkg, setPkg] = useState<any>(null)
  const [fetchingPkg, setFetchingPkg] = useState(true)
  const [upiQrUrl, setUpiQrUrl] = useState<string>('')
  const [upiId, setUpiId] = useState<string>('')

  const pkgId = params.get('pkg') || ''
  const slug = params.get('slug') || ''
  const travelers = Number(params.get('travelers') || 1)
  const total = Number(params.get('total') || 0)
  const coupon = params.get('coupon') || ''
  const base_amount = Number(params.get('base_amount') || 0)

  useEffect(() => {
    async function fetchPkg() {
      if (!pkgId) return
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const [{ data }, { data: settings }] = await Promise.all([
        supabase
          .from('packages')
          .select('*, destinations(name, country)')
          .eq('id', pkgId)
          .single(),
        supabase
          .from('site_settings')
          .select('upi_qr_url, upi_qr_url_2, upi_id_1, upi_id_2, payment_counter')
          .eq('id', 1)
          .single()
      ])
      
      if (data) {
        setPkg({
          ...data,
          destination: data.destinations
        })
      }
      if (settings) {
        const counter = settings.payment_counter || 0
        const useSecondary = (counter % 20) >= 10
        
        if (useSecondary && settings.upi_qr_url_2) {
          setUpiQrUrl(settings.upi_qr_url_2)
          setUpiId(settings.upi_id_2 || process.env.NEXT_PUBLIC_UPI_ID || '')
        } else {
          setUpiQrUrl(settings.upi_qr_url || '')
          setUpiId(settings.upi_id_1 || process.env.NEXT_PUBLIC_UPI_ID || '')
        }
      } else {
        setUpiId(process.env.NEXT_PUBLIC_UPI_ID || '')
      }
      setFetchingPkg(false)
    }
    fetchPkg()
  }, [pkgId])

  const [contactForm, setContactForm] = useState({
    email: '',
    phone: '',
  })
  
  // Initialize travelers data based on the 'travelers' query parameter
  const [travelersData, setTravelersData] = useState(
    Array.from({ length: Math.max(1, travelers) }).map(() => ({
      name: '',
      age: '',
      phone: '',
      medical: ''
    }))
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [upiTransactionId, setUpiTransactionId] = useState('')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!contactForm.email.trim() || !/\S+@\S+\.\S+/.test(contactForm.email)) e.contactEmail = 'Valid email is required'
    if (!contactForm.phone.trim() || !/^\+?[\d\s\-]{10,}$/.test(contactForm.phone)) e.contactPhone = 'Valid phone number is required'
    
    travelersData.forEach((t, i) => {
      if (!t.name.trim()) e[`t${i}_name`] = 'Name is required'
      if (!t.age.trim() || isNaN(Number(t.age)) || Number(t.age) <= 0) e[`t${i}_age`] = 'Valid age is required'
      if (!t.phone.trim()) e[`t${i}_phone`] = 'Phone is required'
    })
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 0) {
      if (validate()) setStep(1)
    } else if (step === 1) {
      setStep(2)
    }
  }

  const handlePayment = async () => {
    if (!upiTransactionId.trim() || upiTransactionId.length < 8) {
      alert('Please enter a valid 12-digit Transaction ID (UTR)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/checkout/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: pkgId,
          num_travelers: travelers,
          coupon_code: coupon || undefined,
          base_amount,
          lead_traveler_name: travelersData[0].name,
          contact_email: contactForm.email,
          contact_phone: contactForm.phone,
          upi_transaction_id: upiTransactionId,
          travelers_data: travelersData
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit payment')

      setPaymentDone(true)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingPkg) {
    return <div style={{ paddingTop: 120, textAlign: 'center', minHeight: '100vh', background: 'var(--cream)' }}>Loading checkout...</div>
  }
  if (!pkg) {
    return <div style={{ paddingTop: 120, textAlign: 'center', minHeight: '100vh', background: 'var(--cream)' }}>Package not found.</div>
  }

  const gst = Math.floor(total * 0.05)
  const finalTotal = total + gst
  const bookingId = `RM${Date.now().toString().slice(-8)}` // Optimistic for UI

  if (paymentDone) {
    return (
      <div style={{ paddingTop: 120, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 520, width: '100%', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}>
              <CheckCircle size={48} style={{ color: 'white' }} />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              Booking Confirmed! 🎉
            </h1>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Your booking for <strong>{pkg.title}</strong> has been submitted.<br />
              Our team will verify the UPI transaction and confirm your booking shortly.<br />
              A confirmation email and WhatsApp message will be sent to <strong>{contactForm.email}</strong> once verified.
            </p>

            <div style={{ background: 'var(--white)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--cream-dark)', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                {[
                  ['Package', pkg.title],
                  ['Travellers', String(travelers)],
                  ['Total Paid', `₹${finalTotal.toLocaleString('en-IN')}`],
                  ['Status', '✅ Confirmed'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ color: 'var(--gray)', fontSize: '0.75rem', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/my-bookings" style={{ textDecoration: 'none' }}>
                <button className="btn-primary">View My Bookings</button>
              </Link>
              <Link href="/packages" style={{ textDecoration: 'none' }}>
                <button className="btn-outline">Browse More Packages</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh', background: 'var(--cream)', paddingBottom: '4rem' }}>
      <div className="container">
        <Link href={`/packages/${slug}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gray)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to package
        </Link>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '2rem', color: 'var(--dark)' }}>
          Complete Your Booking
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem' }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700,
                  background: i < step ? '#10B981' : i === step ? 'var(--primary)' : 'var(--cream-dark)',
                  color: i <= step ? 'white' : 'var(--gray)',
                  transition: 'all 0.3s',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: i === step ? 600 : 400, color: i === step ? 'var(--dark)' : 'var(--gray)', display: 'none' }} className="sm:inline">
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? '#10B981' : 'var(--cream-dark)', margin: '0 0.75rem', transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr min(360px, 100%)', gap: '2rem', alignItems: 'start' }}>
          <div style={{ background: 'var(--white)', borderRadius: 20, padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            {step === 0 && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={20} style={{ color: 'var(--primary)' }} /> Primary Contact Details
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    { key: 'email', label: 'Email Address *', type: 'email', placeholder: 'Booking confirmation will be sent here' },
                    { key: 'phone', label: 'WhatsApp Number *', type: 'tel', placeholder: '+91 98765 43210' },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="form-label">{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={contactForm[key as keyof typeof contactForm]}
                        onChange={e => setContactForm(f => ({ ...f, [key]: e.target.value }))}
                        className="input"
                        style={{ borderColor: errors[`contact${key.charAt(0).toUpperCase() + key.slice(1)}`] ? 'var(--primary)' : undefined }}
                      />
                      {errors[`contact${key.charAt(0).toUpperCase() + key.slice(1)}`] && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <AlertCircle size={12} style={{ color: 'var(--primary)' }} />
                          <span className="error-text">{errors[`contact${key.charAt(0).toUpperCase() + key.slice(1)}`]}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="divider" style={{ margin: '2rem 0' }} />

                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={20} style={{ color: 'var(--primary)' }} /> Traveller Details
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {travelersData.map((t, idx) => (
                    <div key={idx} style={{ background: 'var(--cream)', padding: '1.5rem', borderRadius: 12 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--dark)' }}>
                        Traveller {idx + 1} {idx === 0 ? '(Lead)' : ''}
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label className="form-label">Full Name *</label>
                          <input
                            type="text"
                            placeholder="As on government ID"
                            value={t.name}
                            onChange={e => {
                              const newData = [...travelersData];
                              newData[idx].name = e.target.value;
                              setTravelersData(newData);
                            }}
                            className="input"
                            style={{ borderColor: errors[`t${idx}_name`] ? 'var(--primary)' : undefined }}
                          />
                          {errors[`t${idx}_name`] && <span className="error-text" style={{ marginTop: 4, display: 'block' }}>{errors[`t${idx}_name`]}</span>}
                        </div>
                        
                        <div>
                          <label className="form-label">Age *</label>
                          <input
                            type="number"
                            placeholder="Years"
                            value={t.age}
                            onChange={e => {
                              const newData = [...travelersData];
                              newData[idx].age = e.target.value;
                              setTravelersData(newData);
                            }}
                            className="input"
                            style={{ borderColor: errors[`t${idx}_age`] ? 'var(--primary)' : undefined }}
                          />
                          {errors[`t${idx}_age`] && <span className="error-text" style={{ marginTop: 4, display: 'block' }}>{errors[`t${idx}_age`]}</span>}
                        </div>

                        <div>
                          <label className="form-label">Phone *</label>
                          <input
                            type="tel"
                            placeholder="Contact number"
                            value={t.phone}
                            onChange={e => {
                              const newData = [...travelersData];
                              newData[idx].phone = e.target.value;
                              setTravelersData(newData);
                            }}
                            className="input"
                            style={{ borderColor: errors[`t${idx}_phone`] ? 'var(--primary)' : undefined }}
                          />
                          {errors[`t${idx}_phone`] && <span className="error-text" style={{ marginTop: 4, display: 'block' }}>{errors[`t${idx}_phone`]}</span>}
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label className="form-label">Medical Conditions (Optional)</label>
                          <textarea
                            placeholder="Any allergies, mobility issues, or conditions we should know about"
                            value={t.medical}
                            onChange={e => {
                              const newData = [...travelersData];
                              newData[idx].medical = e.target.value;
                              setTravelersData(newData);
                            }}
                            className="input"
                            style={{ minHeight: 80, resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: '1.5rem' }}>
                  Review Your Booking
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                  <img src={pkg.cover_image_url} alt={pkg.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12 }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      ['Package', pkg.title],
                      ['Duration', `${pkg.duration_nights}N/${pkg.duration_days}D`],
                      ['Travellers', String(travelers)],
                      ['Lead Traveller', travelersData[0]?.name || ''],
                      ['Email', contactForm.email],
                      ['Phone', contactForm.phone],
                    ].map(([label, value]) => (
                      <div key={label} style={{ padding: '0.75rem', background: 'var(--cream)', borderRadius: 8 }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '0.85rem' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {coupon && (
                    <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={14} style={{ color: '#059669' }} />
                      <span style={{ fontSize: '0.85rem', color: '#059669' }}>Coupon <strong>{coupon}</strong> applied</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CreditCard size={20} style={{ color: 'var(--primary)' }} /> Secure Payment via UPI
                </h2>
                <div style={{ background: 'rgba(204,20,20,0.04)', border: '1px solid rgba(204,20,20,0.15)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray)' }}>
                    <span>Package cost {coupon ? '(after discount)' : ''}</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--gray)' }}>
                    <span>GST (5%)</span>
                    <span>₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: 'var(--dark)', borderTop: '1px solid var(--cream-dark)', paddingTop: '0.75rem' }}>
                    <span>Total Payable</span>
                    <span style={{ color: 'var(--primary)' }}>₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ background: 'var(--cream)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--dark)', marginBottom: '0.5rem' }}>Pay ₹{finalTotal.toLocaleString('en-IN')} via any UPI App</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '1.5rem' }}>Click the button below to pay via GPay, PhonePe, Paytm, etc. (Mobile only)</p>
                  
                  <a 
                    href={`upi://pay?pa=${upiId}&pn=Raw%20Miles&am=${finalTotal}&cu=INR`}
                    className="btn-primary"
                    style={{ textDecoration: 'none', display: 'inline-flex', padding: '0.8rem 1.5rem', borderRadius: 8, fontSize: '0.95rem', marginBottom: '1rem' }}
                  >
                    Open UPI App to Pay
                  </a>

                  {upiQrUrl && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>Scan to Pay</p>
                      <img src={upiQrUrl} alt="UPI QR Code" style={{ width: 160, height: 160, objectFit: 'contain', background: 'white', padding: '0.5rem', borderRadius: 8, border: '1px solid var(--cream-dark)', margin: '0 auto' }} />
                    </div>
                  )}

                  <div style={{ margin: '1.5rem 0 0', fontSize: '0.85rem', color: 'var(--gray)' }}>
                    Or manually send to UPI ID:<br />
                    <strong style={{ fontSize: '1rem', color: 'var(--dark)' }}>{upiId || 'business@upi'}</strong>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Enter 12-digit UTR / Transaction ID <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="e.g., 312345678901" 
                    value={upiTransactionId}
                    onChange={(e) => setUpiTransactionId(e.target.value)}
                    required
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                    After paying, find the 12-digit UTR or Transaction ID in your payment app and paste it here.
                  </p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading || upiTransactionId.length < 8}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem', borderRadius: 10, opacity: (loading || upiTransactionId.length < 8) ? 0.7 : 1 }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg style={{ animation: 'spin 1s linear infinite', width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <>Submit Payment Details</>
                  )}
                </button>
              </div>
            )}

            {step < 2 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                    Back
                  </button>
                )}
                <button onClick={handleNext} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  {step === 1 ? 'Proceed to Payment' : 'Continue'} →
                </button>
              </div>
            )}
          </div>

          <div style={{ background: 'var(--white)', borderRadius: 20, padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid var(--cream-dark)' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--dark)' }}>
              Order Summary
            </h3>
            <img src={pkg.cover_image_url} alt={pkg.title} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: '1rem' }} />
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: 'var(--dark)', marginBottom: '0.25rem' }}>{pkg.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginBottom: '1rem' }}>
              {pkg.duration_nights}N/{pkg.duration_days}D · {travelers} traveller{travelers > 1 ? 's' : ''}
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
              <span>Total (incl. GST)</span>
              <span>₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['GST invoice on confirmation', 'Email + WhatsApp confirmation', 'Instant booking — no wait', 'Free cancellation policy'].map(feature => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--gray)' }}>
                  <CheckCircle size={12} style={{ color: '#059669', flexShrink: 0 }} /> {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <>
      <Suspense fallback={<div style={{ paddingTop: 120, textAlign: 'center' }}>Loading...</div>}>
        <CheckoutContent />
      </Suspense>
    </>
  )
}

// app/packages/[slug]/page.tsx — Package Detail Page
'use client'
import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Star, Clock, MapPin, Users, Check, X, ChevronDown, ChevronUp,
  Tag, ChevronLeft, ChevronRight, Plus, Minus, ArrowRight,
} from 'lucide-react'

export default function PackageDetailClient({ pkg }: { pkg: any }) {
  const router = useRouter()

  const [selectedCategory, setSelectedCategory] = useState(pkg?.categories?.[0] || null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [travelers, setTravelers] = useState(1)
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [expandedDay, setExpandedDay] = useState<number | null>(1)

  if (!pkg) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 1.5rem', paddingTop: 100 }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '2rem' }}>Package not found</h2>
        <Link href="/packages"><button className="btn-primary" style={{ marginTop: '1.5rem' }}>← Browse Packages</button></Link>
      </div>
    )
  }

  const categoryPrice = selectedCategory ? selectedCategory.price : 0
  const addonTotal = selectedAddons.reduce((acc, id) => {
    const a = (pkg.addons || []).find((a: any) => a.id === id)
    return acc + (a ? a.price : 0)
  }, 0)
  const subtotal = (pkg.base_price + categoryPrice + addonTotal) * travelers
  const discount = couponApplied ? Math.floor(subtotal * 0.1) : 0
  const total = subtotal - discount
  const slotsLeft = Math.max(0, pkg.total_slots - pkg.slots_booked)
  const galleryImages = pkg.gallery_image_urls?.length ? pkg.gallery_image_urls : [pkg.cover_image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80']

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'RAWMILES10') {
      setCouponApplied(true); setCouponError('')
    } else {
      setCouponError('Invalid or expired coupon code')
    }
  }

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleBookNow = () => {
    proceedToCheckout()
  }

  const proceedToCheckout = () => {
    const params = new URLSearchParams({
      pkg: pkg.id,
      slug: pkg.slug,
      category: selectedCategory?.id || '',
      addons: selectedAddons.join(','),
      travelers: String(travelers),
      coupon: couponApplied ? coupon : '',
      total: String(total),
    })
    router.push(`/checkout?${params}`)
  }

  return (
    <>
      {/* Gallery & Hero */}
      <section style={{ paddingTop: 72 }}>
        <div style={{ position: 'relative', height: 500, overflow: 'hidden', background: '#1A0505' }}>
          <img
            src={galleryImages[galleryIdx]}
            alt={pkg.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 60%), linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
          }} />

          {/* Navigation arrows */}
          {galleryImages.length > 1 && (
            <>
              <button onClick={() => setGalleryIdx(i => (i - 1 + galleryImages.length) % galleryImages.length)}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setGalleryIdx(i => (i + 1) % galleryImages.length)}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 8 }}>
            {galleryImages.map((url: string, i: number) => (
              <button key={i} onClick={() => setGalleryIdx(i)} style={{
                width: 56, height: 40, borderRadius: 6, overflow: 'hidden',
                border: i === galleryIdx ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.3)',
                cursor: 'pointer', padding: 0,
              }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>

          {/* Title overlay */}
          <div style={{ position: 'absolute', bottom: 60, left: 24, right: '40%', color: 'white' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <div className="badge" style={{ background: 'rgba(204,20,20,0.85)', color: 'white', fontSize: '0.72rem' }}>
                <Clock size={10} style={{ marginRight: 4 }} />
                {pkg.duration_nights}N/{pkg.duration_days}D
              </div>

              {slotsLeft <= 3 && slotsLeft > 0 && (
                <div className="badge" style={{ background: 'rgba(239,68,68,0.85)', color: 'white', fontSize: '0.72rem' }}>
                  🔥 Only {slotsLeft} slots left!
                </div>
              )}
              {slotsLeft === 0 && (
                <div className="badge" style={{ background: 'rgba(107,114,128,0.9)', color: 'white', fontSize: '0.72rem' }}>
                  Sold Out
                </div>
              )}
            </div>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: 8, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {pkg.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={14} fill="#F59E0B" style={{ color: '#F59E0B' }} /> {pkg.avg_rating} ({pkg.review_count || 0} reviews)
              </span>
              <span>•</span>
              <span style={{ fontWeight: 600 }}>{pkg.total_slots - pkg.slots_booked} seats available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_min(380px,100%)] gap-10 items-start">
          {/* Left column */}
          <div>
            {/* Description */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--dark)' }}>
                About this package
              </h2>
              <p style={{ color: 'var(--gray)', lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: '1.5rem' }}>{pkg.description}</p>
              
              {pkg.pickup_location_map_url && (
                <div style={{ background: 'var(--cream)', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--cream-dark)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <MapPin size={18} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--dark)' }}>Pickup Location</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>Exact meeting point details.</div>
                  </div>
                  <a href={pkg.pickup_location_map_url} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                    View on Maps
                  </a>
                </div>
              )}
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: '1.25rem' }}>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1rem', color: '#059669', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={16} /> Inclusions
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(pkg.inclusions || []).map((item: string, i: number) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.85rem', color: 'var(--dark-2)', alignItems: 'flex-start' }}>
                      <Check size={12} style={{ color: '#059669', flexShrink: 0, marginTop: 3 }} /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '1.25rem' }}>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <X size={16} /> Exclusions
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(pkg.exclusions || []).map((item: string, i: number) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.85rem', color: 'var(--dark-2)', alignItems: 'flex-start' }}>
                      <X size={12} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 3 }} /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Itinerary */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--dark)' }}>
                Day-by-Day Itinerary
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(pkg.itinerary || []).map((day: any) => (
                  <div key={day.day_number} style={{ background: 'var(--white)', border: '1px solid var(--cream-dark)', borderRadius: 12, overflow: 'hidden' }}>
                    <button
                      onClick={() => setExpandedDay(expandedDay === day.day_number ? null : day.day_number)}
                      style={{
                        width: '100%', padding: '1rem 1.25rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: expandedDay === day.day_number ? 'var(--primary)' : 'var(--cream)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700,
                          color: expandedDay === day.day_number ? 'white' : 'var(--gray)',
                          flexShrink: 0, transition: 'all 0.2s',
                        }}>
                          {day.day_number}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--dark)' }}>
                          Day {day.day_number}: {day.title}
                        </span>
                      </div>
                      {expandedDay === day.day_number ? <ChevronUp size={16} style={{ color: 'var(--gray)' }} /> : <ChevronDown size={16} style={{ color: 'var(--gray)' }} />}
                    </button>
                    {expandedDay === day.day_number && (
                      <div style={{ padding: '0 1.25rem 1.25rem 4.25rem', color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                        {day.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--dark)' }}>
                Traveller Reviews
              </h2>
              {(pkg.reviews || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)', background: 'var(--white)', borderRadius: 12, border: '1px solid var(--cream-dark)' }}>
                  No reviews yet. Be the first to share your experience!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(pkg.reviews || []).map((r: any) => (
                    <div key={r.id} style={{ background: 'var(--white)', border: '1px solid var(--cream-dark)', borderRadius: 12, padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '0.95rem' }}>{r.user.full_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>{r.created_at}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={14} fill={s <= r.rating ? '#F59E0B' : 'transparent'} style={{ color: '#F59E0B' }} />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: 'var(--gray)', fontSize: '0.875rem', lineHeight: 1.6 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Booking widget */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div style={{ background: 'var(--white)', borderRadius: 20, padding: '1.75rem', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', border: '1px solid var(--cream-dark)' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Starting from</div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: '2.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                  ₹{pkg.base_price.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>per person + taxes</div>
              </div>

              <div className="divider" />

              {/* Category selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Room / Seat Category</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {pkg.categories.map((cat: any) => (
                    <label key={cat.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${selectedCategory?.id === cat.id ? 'var(--primary)' : 'var(--cream-darker)'}`,
                      background: selectedCategory?.id === cat.id ? 'rgba(204,20,20,0.04)' : 'transparent',
                      transition: 'all 0.15s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input type="radio" name="category" checked={selectedCategory?.id === cat.id}
                          onChange={() => setSelectedCategory(cat)} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--dark)' }}>{cat.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>{cat.description}</div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                        {cat.price === 0 ? 'Included' : `+₹${cat.price.toLocaleString('en-IN')}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Travelers */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Number of Travellers</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--cream)', borderRadius: 10, padding: '0.5rem 1rem' }}>
                  <button onClick={() => setTravelers(t => Math.max(1, t - 1))} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }}>{travelers}</span>
                  <button onClick={() => setTravelers(t => Math.min(slotsLeft, t + 1))} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={14} />
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--gray)' }}>
                    <Users size={12} /> {slotsLeft} available
                  </span>
                </div>
              </div>

              {/* Add-ons */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Optional Add-ons</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {pkg.addons.map((addon: any) => (
                    <label key={addon.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem', borderRadius: 8, cursor: 'pointer',
                      border: `1.5px solid ${selectedAddons.includes(addon.id) ? 'var(--primary)' : 'var(--cream-darker)'}`,
                      background: selectedAddons.includes(addon.id) ? 'rgba(204,20,20,0.04)' : 'transparent',
                      transition: 'all 0.15s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={() => toggleAddon(addon.id)} />
                        <span style={{ fontSize: '0.825rem', color: 'var(--dark-2)', fontWeight: 500 }}>{addon.name}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        +₹{addon.price.toLocaleString('en-IN')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Coupon Code</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Tag size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                    <input
                      className="input"
                      placeholder="Enter code (try RAWMILES10)"
                      value={coupon}
                      onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError('') }}
                      disabled={couponApplied}
                      style={{ paddingLeft: '2rem' }}
                    />
                  </div>
                  <button
                    onClick={couponApplied ? () => { setCouponApplied(false); setCoupon('') } : applyCoupon}
                    style={{
                      padding: '0 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      background: couponApplied ? '#10B981' : 'var(--primary)', color: 'white', whiteSpace: 'nowrap',
                    }}
                  >
                    {couponApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="error-text">{couponError}</p>}
                {couponApplied && <p style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.25rem' }}>🎉 10% discount applied!</p>}
              </div>

              <div className="divider" />

              {/* Price summary */}
              <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray)' }}>
                  <span>Base: ₹{pkg.base_price.toLocaleString('en-IN')} × {travelers}</span>
                  <span>₹{(pkg.base_price * travelers).toLocaleString('en-IN')}</span>
                </div>
                {categoryPrice > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray)' }}>
                    <span>{selectedCategory?.name} upgrade</span>
                    <span>+₹{(categoryPrice * travelers).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {addonTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray)' }}>
                    <span>Add-ons</span>
                    <span>+₹{(addonTotal * travelers).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                    <span>Coupon discount</span>
                    <span>−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: 'var(--dark)', borderTop: '1px solid var(--cream-dark)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>No extra GST applied</div>
              </div>

              {/* Book button */}
              {slotsLeft <= 0 ? (
                <button disabled style={{ width: '100%', padding: '1rem', background: 'var(--gray)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'not-allowed' }}>
                  Sold Out
                </button>
              ) : (
                <button
                  onClick={handleBookNow}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem', borderRadius: 10 }}
                >
                  Book Now <ArrowRight size={18} />
                </button>
              )}

            </div>
          </div>
        </div>
      </div>

    </>
  )
}

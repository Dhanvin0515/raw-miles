// app/page.tsx — Raw Miles Homepage
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Star, MapPin, Shield, Headphones, Award, ChevronDown, X as XIcon } from 'lucide-react'
import PackageCard from '@/components/PackageCard'
import { useLanguage } from '@/lib/LanguageContext'

export default function HomeClient({ packages, destinations, heroImages, pastTripImages }: { packages: any[], destinations: any[], heroImages: string[], pastTripImages: string[] }) {
  const { t } = useLanguage()
  const [heroIdx, setHeroIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  useEffect(() => {
    setLoaded(true)
    const interval = setInterval(() => {
      setHeroIdx((i) => (heroImages.length ? (i + 1) % heroImages.length : 0))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* ===== HERO ===== */}
      <section style={{
        position: 'relative',
        background: 'var(--cream)', // Netflix black
        paddingTop: '2rem',
        paddingBottom: '2rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
      }}>
        {/* Hero Card Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1600,
          margin: '0 auto',
          height: '80vh',
          minHeight: 600,
          borderRadius: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          {/* BG images */}
          {heroImages.map((src, i) => (
            <div key={i} style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              opacity: i === heroIdx ? 1 : 0,
              transition: 'opacity 1.5s ease',
              zIndex: 0,
            }} />
          ))}
          {/* Dark gradient overlay (Netflix style - dark at bottom and left) */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%), linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 40%)',
            zIndex: 1,
          }} />

          {/* Content */}
          <div style={{
            position: 'relative', zIndex: 2,
            textAlign: 'left', padding: '4rem',
            maxWidth: 800,
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.8s ease',
          }}>


            <h1 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 'clamp(3rem, 6vw, 5rem)',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '1.25rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            }}>
              {t('home.title1')}<br />
              <em style={{ color: 'var(--gray)' }}>{t('home.title2')}</em>
            </h1>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 'clamp(3.5rem, 10vw, 8rem)',
                fontWeight: 900,
                color: 'white',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                textShadow: '0 4px 32px rgba(0,0,0,0.6)',
                WebkitTextStroke: '1px rgba(255,255,255,0.15)',
              }}>
                RAWMILES
              </div>
              <div style={{
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.55)',
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginTop: '0.5rem',
              }}>
                Turning Miles Into Memories
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => {
                  document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="btn-primary" 
                style={{ padding: '1rem 2rem', fontSize: '1.05rem', borderRadius: 999 }}
              >
                {t('home.exploreBtn')} <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Hero dots */}
          <div style={{
            position: 'absolute', bottom: 32, right: 48,
            zIndex: 2, display: 'flex', gap: 8,
          }}>
            {heroImages.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)} style={{
                width: i === heroIdx ? 24 : 8, height: 8, borderRadius: 4,
                background: i === heroIdx ? 'white' : 'rgba(255,255,255,0.4)',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CURRENT PACKAGES ===== */}
      <section id="packages" className="section" style={{ background: '#000000', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
              {t('home.section.featured')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
              {t('home.section.featured.desc')}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}>
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg as any} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== PAST TRIPS ===== */}
      {pastTripImages && pastTripImages.length > 0 && (
        <section id="past-trips" className="section" style={{ background: '#0a0a0a', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--dark)', marginBottom: '1rem' }}>
                {t('home.section.pastTrips')}
              </h2>
              <p style={{ color: 'var(--gray)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
                {t('home.section.pastTrips.desc')}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}>
              {pastTripImages.map((img, i) => (
                <div key={i} onClick={() => setLightboxImg(img)} style={{
                  position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'transform 0.3s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                  <img src={img} alt={`Past trip ${i+1}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div 
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
          }}
        >
          <button onClick={() => setLightboxImg(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <XIcon size={36} />
          </button>
          <img src={lightboxImg} alt="Enlarged trip" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
        </div>
      )}

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </>
  )
}

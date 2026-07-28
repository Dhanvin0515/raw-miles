// components/Navbar.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/LanguageContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const supabase = createClient()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        setUser(data.user)
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
        if (profile?.role === 'admin') setIsAdmin(true)
      }
    })
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
    })
    
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      authListener.subscription.unsubscribe()
    }
  }, [])
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setDropdownOpen(false)
  }

  return (
    <nav
      className="sticky top-0 z-40"
      style={{
        background: '#000000',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="Raw Miles" width={52} height={52} style={{ borderRadius: '50%' }} />
          <span
            className="font-poppins"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: '1.4rem',
              color: 'var(--primary)',
            }}
          >
            Raw Miles
          </span>
        </Link>

        {/* Desktop Nav (Empty as requested) */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '2rem' }}>
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: 'white',
                  border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </button>
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 50, right: 0, background: 'var(--cream)', borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)', overflow: 'hidden', minWidth: 150, zIndex: 50
                }}>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: 'var(--primary)', borderBottom: '1px solid var(--cream-dark)', fontWeight: 700 }}>{t('nav.admin')}</Link>
                  )}
                  <Link href="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: 'var(--dark)', borderBottom: '1px solid var(--cream-dark)', fontWeight: 600 }}>{t('nav.profile')}</Link>
                  <Link href="/my-bookings" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', textDecoration: 'none', color: 'var(--dark)', borderBottom: '1px solid var(--cream-dark)', fontWeight: 600 }}>{t('nav.bookings')}</Link>
                  <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>{t('nav.logout')}</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    background: 'transparent',
                    border: '1.5px solid rgba(255,255,255,0.4)',
                    color: 'white',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t('nav.login')}
                </button>
              </Link>
              <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                  {t('nav.signup')}
                </button>
              </Link>
            </>
          )}

          {/* Language Switcher */}
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as 'en'|'kn')}
            style={{
              background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6, padding: '0.4rem 0.5rem', outline: 'none', cursor: 'pointer', marginLeft: '0.5rem'
            }}
          >
            <option value="en" style={{ color: 'black' }}>EN</option>
            <option value="kn" style={{ color: 'black' }}>ಕನ್ನಡ</option>
          </select>
          <a href="https://www.instagram.com/_rawmiles_/" target="_blank" rel="noreferrer" style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', background: 'rgba(255,255,255,0.1)', width: 36, height: 36, borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
          }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: 'var(--cream)',
          borderTop: '1px solid var(--cream-dark)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem' }}>
              <div style={{ padding: '0.5rem 0', color: 'var(--gray)', fontSize: '0.9rem' }}>Signed in as {user.email}</div>
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>{t('nav.admin')}</button>
                </Link>
              )}
              <Link href="/profile" onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
                <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>{t('nav.profile')}</button>
              </Link>
              <Link href="/my-bookings" onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
                <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>{t('nav.bookings')}</button>
              </Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>{t('nav.logout')}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <Link href="/auth/login" style={{ flex: 1, textDecoration: 'none' }}>
                <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>{t('nav.login')}</button>
              </Link>
              <Link href="/auth/signup" style={{ flex: 1, textDecoration: 'none' }}>
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>{t('nav.signup')}</button>
              </Link>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1rem' }}>
            <a href="https://www.instagram.com/_rawmiles_/" target="_blank" rel="noreferrer" style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--dark)', background: 'rgba(255,255,255,0.1)', width: 44, height: 44, borderRadius: '50%',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

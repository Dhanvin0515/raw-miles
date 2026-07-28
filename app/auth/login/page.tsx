// app/auth/login/page.tsx
'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState(searchParams.get('error') === 'oauth_failed' ? 'Google sign-in failed. Please try again.' : '')

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    })
  }

  return (
      <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A0505 0%, #3D1010 50%, #1A0505 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: '#000000', borderRadius: 24,
        padding: '2.5rem',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        animation: 'fadeInUp 0.4s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Image src="/logo.png" alt="Raw Miles" width={48} height={48} style={{ borderRadius: '50%' }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.4rem', color: 'var(--primary)' }}>Raw Miles</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: 'var(--dark)', marginBottom: '0.25rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>Sign in to manage your trips</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
              <input
                type="email" placeholder="your@email.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input" style={{ paddingLeft: '2.5rem' }} required
              />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <Link href="/auth/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
              <input
                type={showPass ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(204,20,20,0.08)', border: '1px solid rgba(204,20,20,0.2)', borderRadius: 8, padding: '0.75rem', fontSize: '0.825rem', color: 'var(--primary)' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '0.95rem', borderRadius: 10 }}>
            {loading ? 'Signing in…' : <><ArrowRight size={16} /> Sign In</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray)', marginTop: '1.5rem' }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}

// app/auth/signup/page.tsx
'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone: form.phone },
      },
    })
    setLoading(false)
    let msg = error?.message || 'An unknown error occurred'
    if (msg === '{}') msg = 'Database error saving user. Please make sure database triggers are correctly set up.'
    if (error) { setError(msg) } else { setSuccess(true) }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}` },
    })
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1A0505 0%, #3D1010 50%, #1A0505 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ width: '100%', maxWidth: 440, background: '#000000', borderRadius: 24, padding: '3rem 2.5rem', boxShadow: '0 32px 80px rgba(0,0,0,0.35)', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={36} style={{ color: 'white' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: 'var(--dark)', marginBottom: '0.75rem' }}>Account created</h2>
          <p style={{ color: 'var(--gray)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Your account is ready for login. Use <strong>{form.email}</strong> to sign in and start booking.
          </p>
          <Link href={`/auth/login?redirect=${encodeURIComponent(redirect)}`}><button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Go to Login</button></Link>
        </div>
      </div>
    )
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
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Image src="/logo.png" alt="Raw Miles" width={44} height={44} style={{ borderRadius: '50%' }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.3rem', color: 'var(--primary)' }}>Raw Miles</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: 'var(--dark)', marginBottom: '0.25rem' }}>Create your account</h1>
          <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>Start exploring curated travel experiences</p>
        </div>


        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            { key: 'fullName', label: 'Full Name', type: 'text', Icon: User, placeholder: 'Your full name' },
            { key: 'email', label: 'Email', type: 'email', Icon: Mail, placeholder: 'your@email.com' },
            { key: 'phone', label: 'Phone (WhatsApp)', type: 'tel', Icon: Phone, placeholder: '+91 98765 43210' },
          ].map(({ key, label, type, Icon, placeholder }) => (
            <div key={key}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                <input type={type} placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="input" style={{ paddingLeft: '2.25rem', padding: '0.65rem 0.875rem 0.65rem 2.25rem' }} required />
              </div>
            </div>
          ))}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
              <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input" style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem', padding: '0.65rem 2.5rem 0.65rem 2.25rem' }} required minLength={8} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(204,20,20,0.08)', border: '1px solid rgba(204,20,20,0.2)', borderRadius: 8, padding: '0.75rem', fontSize: '0.8rem', color: 'var(--primary)' }}>
              {error}
            </div>
          )}

          <p style={{ fontSize: '0.75rem', color: 'var(--gray)', lineHeight: 1.5 }}>
            By signing up, you agree to our{' '}
            <Link href="#" style={{ color: 'var(--primary)' }}>Terms of Service</Link> and{' '}
            <Link href="#" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>.
          </p>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '0.95rem', borderRadius: 10 }}>
            {loading ? 'Creating account…' : <><ArrowRight size={16} /> Create Account</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray)', marginTop: '1.25rem' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>}>
      <SignupForm />
    </Suspense>
  )
}

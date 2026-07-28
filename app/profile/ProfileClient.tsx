'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Phone, CheckCircle, Save } from 'lucide-react'

export default function ProfileClient({ user, profile }: { user: any, profile: any }) {
  const [form, setForm] = useState({
    fullName: profile?.full_name || user?.user_metadata?.full_name || '',
    phone: profile?.phone || user?.user_metadata?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: form.fullName,
          phone: form.phone
        })
        .eq('id', user.id)

      if (updateError) throw updateError
      
      // Update auth metadata as well
      await supabase.auth.updateUser({
        data: { full_name: form.fullName, phone: form.phone }
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '2.5rem', color: 'var(--dark)', marginBottom: '1.5rem', textAlign: 'center' }}>
          Your Profile
        </h1>
        
        <div style={{ background: 'var(--white)', borderRadius: 24, padding: '2.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Email (Read Only) */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                <input 
                  type="email" 
                  value={user.email} 
                  disabled 
                  className="input" 
                  style={{ paddingLeft: '3rem', background: 'var(--cream)', color: 'var(--gray)', cursor: 'not-allowed' }} 
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                <input 
                  type="text" 
                  value={form.fullName} 
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="input" 
                  style={{ paddingLeft: '3rem' }} 
                  required 
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Phone (WhatsApp)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                <input 
                  type="tel" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input" 
                  style={{ paddingLeft: '3rem' }} 
                />
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(204,20,20,0.08)', color: 'var(--primary)', padding: '1rem', borderRadius: 8, fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '1rem', borderRadius: 8, fontSize: '0.85rem' }}>
                <CheckCircle size={16} /> Profile updated successfully!
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading} 
              style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

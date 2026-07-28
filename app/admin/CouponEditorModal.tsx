'use client'
import React, { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CouponEditorModal({
  isOpen,
  onClose,
  coupon,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  coupon: any
  onSuccess: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    code: '',
    discount_type: 'flat',
    discount_value: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    max_uses: '',
    active: true
  })

  useEffect(() => {
    if (coupon) {
      setForm({
        code: coupon.code || '',
        discount_type: coupon.discount_type || 'flat',
        discount_value: coupon.discount_value?.toString() || '',
        valid_from: coupon.valid_from || new Date().toISOString().split('T')[0],
        valid_until: coupon.valid_until || '',
        max_uses: coupon.max_uses?.toString() || '',
        active: coupon.active ?? true
      })
    } else {
      setForm({
        code: '',
        discount_type: 'flat',
        discount_value: '',
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        max_uses: '',
        active: true
      })
    }
  }, [coupon, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      const payload = {
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        valid_from: form.valid_from,
        valid_until: form.valid_until,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        active: form.active
      }

      if (coupon?.id) {
        // Update
        const { error } = await supabase
          .from('coupons')
          .update(payload)
          .eq('id', coupon.id)
        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase
          .from('coupons')
          .insert([payload])
        if (error) throw error
      }

      onSuccess()
      onClose()
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to save coupon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--white)', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        
        <div style={{ position: 'sticky', top: 0, background: 'var(--white)', padding: '1.5rem', borderBottom: '1px solid var(--cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.5rem', color: 'var(--dark)' }}>
            {coupon ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <button onClick={onClose} style={{ background: 'var(--cream)', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Coupon Code</label>
              <input type="text" className="input" required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER2026" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Discount Type</label>
                <select className="input" value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})}>
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Discount Value</label>
                <input type="number" className="input" required min="1" step="0.01" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} placeholder={form.discount_type === 'flat' ? '500' : '10'} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Valid From</label>
                <input type="date" className="input" required value={form.valid_from} onChange={e => setForm({...form, valid_from: e.target.value})} />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Valid Until</label>
                <input type="date" className="input" required value={form.valid_until} onChange={e => setForm({...form, valid_until: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Max Uses (Optional)</label>
              <input type="number" className="input" min="1" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} placeholder="Leave blank for unlimited" />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: 'var(--cream)', borderRadius: 12 }}>
              <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--dark)' }}>Active Status</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Inactive coupons cannot be applied during checkout.</div>
              </div>
            </label>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} /> {loading ? 'Saving...' : 'Save Coupon'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

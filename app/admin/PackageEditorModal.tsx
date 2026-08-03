'use client'
import { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/ImageUploader'

export default function PackageEditorModal({
  isOpen,
  onClose,
  packageData,
  destinations,
}: {
  isOpen: boolean
  onClose: () => void
  packageData?: any
  destinations: any[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    slug: '',
    short_description: '',
    description: '',
    duration_days: 1,
    duration_nights: 1,
    base_price: 0,
    total_slots: 20,
    status: 'draft',
    cover_image_url: '',
    pickup_location_map_url: '',
    avg_rating: 0,
    review_count: 0,
  })

  const [inclusionsText, setInclusionsText] = useState('')
  const [exclusionsText, setExclusionsText] = useState('')
  const [itinerary, setItinerary] = useState<{ day_number: number; title: string; description: string }[]>([])

  useEffect(() => {
    if (packageData) {
      setForm({
        title: packageData.title || '',
        slug: packageData.slug || '',
        short_description: packageData.short_description || '',
        description: packageData.description || '',
        duration_days: packageData.duration_days ?? 1,
        duration_nights: packageData.duration_nights ?? 1,
        base_price: packageData.base_price || 0,
        total_slots: packageData.total_slots || 20,
        status: packageData.status || 'draft',
        cover_image_url: packageData.cover_image_url || '',
        pickup_location_map_url: packageData.pickup_location_map_url || '',
        avg_rating: packageData.avg_rating || 0,
        review_count: packageData.review_count || 0,
      })
      setInclusionsText((packageData.inclusions || []).join('\n'))
      setExclusionsText((packageData.exclusions || []).join('\n'))
      setItinerary(packageData.itinerary || [])
    } else {
      setForm({
        title: '',
        slug: '',
        short_description: '',
        description: '',
        duration_days: 1,
        duration_nights: 1,
        base_price: 0,
        total_slots: 20,
        status: 'draft',
        cover_image_url: '',
        pickup_location_map_url: '',
        avg_rating: 0,
        review_count: 0,
      })
      setInclusionsText('')
      setExclusionsText('')
      setItinerary([])
    }
  }, [packageData, destinations, isOpen])

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setForm({ ...form, title: newTitle, slug: generateSlug(newTitle) })
  }

  const addItineraryDay = () => {
    setItinerary([...itinerary, { day_number: itinerary.length + 1, title: '', description: '' }])
  }

  const updateItineraryDay = (index: number, field: 'title' | 'description', value: string) => {
    const next = [...itinerary]
    next[index] = { ...next[index], [field]: value }
    setItinerary(next)
  }

  const removeItineraryDay = (index: number) => {
    const next = itinerary.filter((_, i) => i !== index).map((item, idx) => ({ ...item, day_number: idx + 1 }))
    setItinerary(next)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const supabase = createClient()
    
    const finalForm = {
      ...form,
      inclusions: inclusionsText.split('\n').map(s => s.trim()).filter(Boolean),
      exclusions: exclusionsText.split('\n').map(s => s.trim()).filter(Boolean),
      avg_rating: Number(form.avg_rating) || 0,
      review_count: Number(form.review_count) || 0,
    }

    try {
      let pkgId = packageData?.id
      if (pkgId) {
        // Update
        const { error: updateError } = await supabase
          .from('packages')
          .update(finalForm)
          .eq('id', pkgId)
        if (updateError) throw updateError
      } else {
        // Insert
        const { data: inserted, error: insertError } = await supabase
          .from('packages')
          .insert([finalForm])
          .select('id')
          .single()
        if (insertError) throw insertError
        pkgId = inserted.id
      }
      
      // Save itinerary
      if (pkgId) {
        // Delete old itinerary
        await supabase.from('package_itinerary').delete().eq('package_id', pkgId)
        
        // Insert new itinerary
        if (itinerary.length > 0) {
          const itineraryToInsert = itinerary.map((item, idx) => ({
            package_id: pkgId,
            day_number: idx + 1,
            title: item.title,
            description: item.description
          }))
          const { error: itinError } = await supabase.from('package_itinerary').insert(itineraryToInsert)
          if (itinError) throw itinError
        }
      }
      
      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save package')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--cream)', width: '100%', maxWidth: 700,
        maxHeight: '90vh', borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--cream-dark)' }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.25rem', color: 'var(--dark)' }}>
            {packageData ? 'Edit Package' : 'Create New Package'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{ background: 'rgba(229, 9, 20, 0.1)', color: 'var(--primary)', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form id="package-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Title</label>
                <input required type="text" className="input" value={form.title} onChange={handleTitleChange} />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Slug (URL)</label>
                <input required type="text" className="input" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Status</label>
                <select required className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="completed">Successfully Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Base Price (₹)</label>
                <input required type="number" min="0" className="input" value={form.base_price} onChange={e => setForm({...form, base_price: Number(e.target.value)})} />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Days</label>
                <input required type="number" min="0" className="input" value={form.duration_days} onChange={e => setForm({...form, duration_days: Number(e.target.value)})} />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Nights</label>
                <input required type="number" min="0" className="input" value={form.duration_nights} onChange={e => setForm({...form, duration_nights: Number(e.target.value)})} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Total Seats</label>
                <input required type="number" min="0" className="input" value={form.total_slots} onChange={e => setForm({...form, total_slots: Number(e.target.value)})} />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Pickup Map Link</label>
                <input type="url" placeholder="https://maps.app.goo.gl/..." className="input" value={form.pickup_location_map_url} onChange={e => setForm({...form, pickup_location_map_url: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Cover Image</label>
              <ImageUploader 
                currentImage={form.cover_image_url} 
                onUploadSuccess={(url) => setForm({...form, cover_image_url: url})} 
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Short Description</label>
              <textarea required className="input" rows={2} value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Full Description</label>
              <textarea required className="input" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Inclusions</label>
              <textarea className="input" rows={5} placeholder="One inclusion per line" value={inclusionsText} onChange={e => setInclusionsText(e.target.value)} />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Exclusions</label>
              <textarea className="input" rows={5} placeholder="One exclusion per line" value={exclusionsText} onChange={e => setExclusionsText(e.target.value)} />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Day-by-Day Itinerary</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {itinerary.map((day, index) => (
                  <div key={`${day.day_number}-${index}`} style={{ border: '1px solid var(--cream-dark)', borderRadius: 10, padding: '0.9rem', background: 'var(--white)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <strong>Day {index + 1}</strong>
                      <button type="button" onClick={() => removeItineraryDay(index)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <input className="input" placeholder="Day title" value={day.title} onChange={e => updateItineraryDay(index, 'title', e.target.value)} />
                      <textarea className="input" rows={3} placeholder="Day details" value={day.description} onChange={e => updateItineraryDay(index, 'description', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addItineraryDay} className="btn-outline" style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: 6, padding: '0.55rem 0.9rem' }}>
                  <Plus size={15} /> Add Day
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Average Rating</label>
                <input type="number" min="0" max="5" step="0.1" className="input" value={form.avg_rating} onChange={e => setForm({ ...form, avg_rating: Number(e.target.value) })} />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Number of Reviews</label>
                <input type="number" min="0" className="input" value={form.review_count} onChange={e => setForm({ ...form, review_count: Number(e.target.value) })} />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--cream-dark)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} type="button" className="btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} disabled={loading}>
            Cancel
          </button>
          <button form="package-form" type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} disabled={loading}>
            <Save size={16} /> {loading ? 'Saving...' : 'Save Package'}
          </button>
        </div>
      </div>
    </div>
  )
}

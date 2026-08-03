// app/admin/AdminClient.tsx
'use client'
import { useState, Fragment } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, BookOpen, Tag, Star, FileText,
  BarChart2, LogOut, Menu, X, TrendingUp, Users, IndianRupee,
  CalendarCheck, Eye, Edit, Trash2, Plus, Check, XCircle, Settings, CheckCircle2
} from 'lucide-react'
import PackageEditorModal from './PackageEditorModal'
import CouponEditorModal from './CouponEditorModal'
import ImageUploader from '@/components/ImageUploader'
import { createClient } from '@/lib/supabase/client'
import { Download } from 'lucide-react'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
  { icon: Package, label: 'Packages', key: 'packages' },
  { icon: BookOpen, label: 'Bookings', key: 'bookings' },
  { icon: Tag, label: 'Coupons', key: 'coupons' },
  { icon: Settings, label: 'Settings', key: 'settings' },
]

export default function AdminClient({ 
  initialStats, 
  initialPackages, 
  initialBookings, 
  initialCoupons,
  initialSettings,
  initialDestinations
}: { 
  initialStats: any[], 
  initialPackages: any[], 
  initialBookings: any[], 
  initialCoupons: any[],
  initialSettings: any,
  initialDestinations?: any[]
}) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loadingAction, setLoadingAction] = useState(false)
  const [heroImages, setHeroImages] = useState<string[]>(initialSettings?.hero_images || [])
  const [pastTripImages, setPastTripImages] = useState<string[]>(initialSettings?.past_trip_images || [])
  const [upiQrUrl, setUpiQrUrl] = useState<string>(initialSettings?.upi_qr_url || '')
  const [upiQrUrl2, setUpiQrUrl2] = useState<string>(initialSettings?.upi_qr_url_2 || '')
  const [upiId1, setUpiId1] = useState<string>(initialSettings?.upi_id_1 || '')
  const [upiId2, setUpiId2] = useState<string>(initialSettings?.upi_id_2 || '')
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<any>(null)
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null)

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from('packages').delete().eq('id', id)
      if (error) throw error
      router.refresh()
    } catch (err: any) {
      alert('Failed to delete package: ' + err.message)
    }
  }

  const handleExportTravelers = (pkgId: string) => {
    window.location.href = `/api/admin/packages/${pkgId}/export-travelers`
  }

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setLoadingAction(true)
    try {
      const res = await fetch('/api/admin/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: id, reason: 'Cancelled by admin' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel booking')
      alert('Booking cancelled successfully')
      router.refresh()
    } catch (err: any) {
      alert('Failed to cancel booking: ' + err.message)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDenyBooking = async (id: string) => {
    if (!confirm('Reject this payment and cancel the booking?')) return
    setLoadingAction(true)
    try {
      const res = await fetch('/api/admin/bookings/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: id, reason: 'Rejected by admin after payment review' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to deny booking')
      alert('Booking rejected successfully')
      router.refresh()
    } catch (err: any) {
      alert('Failed to reject booking: ' + err.message)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Delete this booking permanently? This cannot be undone.')) return
    setLoadingAction(true)
    try {
      const res = await fetch('/api/admin/bookings/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete booking')
      alert('Booking deleted successfully')
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete booking')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleConfirmBooking = async (id: string) => {
    if (!confirm('Have you received the UPI payment and verified the transaction?')) return
    setLoadingAction(true)
    try {
      const res = await fetch('/api/admin/bookings/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to confirm booking')
      
      alert('Booking confirmed successfully')
      router.refresh()
    } catch (err: any) {
      alert('Failed to confirm booking: ' + err.message)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleCompleteBooking = async (id: string) => {
    if (!confirm('Mark this booking as successfully completed?')) return
    setLoadingAction(true)
    try {
      const res = await fetch('/api/admin/bookings/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to mark as completed')
      
      alert('Booking marked as completed successfully')
      router.refresh()
    } catch (err: any) {
      alert('Failed to mark as completed: ' + err.message)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleSaveSettings = async () => {
    setLoadingAction(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase.from('site_settings').upsert({
        id: 1,
        hero_images: heroImages.filter(Boolean),
        past_trip_images: pastTripImages.filter(Boolean),
        upi_qr_url: upiQrUrl,
        upi_qr_url_2: upiQrUrl2,
        upi_id_1: upiId1,
        upi_id_2: upiId2,
        updated_at: new Date().toISOString()
      })
        
      if (error) throw error
      alert('Settings saved successfully!')
      router.refresh()
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message)
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)', paddingTop: 72 }}>
      <aside style={{
        width: sidebarOpen ? 256 : 64,
        background: '#000000',
        paddingTop: '1rem',
        transition: 'width 0.3s ease',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}>
        <div style={{ padding: '0 1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'white', fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap' }}>
                Admin Panel
              </span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <div style={{ flex: 1, padding: '0 0.5rem' }}>
          {NAV_ITEMS.map(({ icon: Icon, label, key }) => (
            <button key={key} onClick={() => setActiveSection(key)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 0.875rem', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activeSection === key ? 'var(--primary)' : 'transparent',
              color: activeSection === key ? 'white' : 'rgba(255,255,255,0.6)',
              fontSize: '0.875rem', fontWeight: activeSection === key ? 600 : 400,
              marginBottom: '0.25rem', transition: 'all 0.15s',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              whiteSpace: 'nowrap',
            }}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && label}
            </button>
          ))}
        </div>

        <div style={{ padding: '1rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 0.875rem', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              fontSize: '0.875rem', justifyContent: sidebarOpen ? 'flex-start' : 'center',
              whiteSpace: 'nowrap',
            }}>
              <LogOut size={18} />
              {sidebarOpen && 'Back to Site'}
            </button>
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, overflowX: 'auto', padding: '2rem' }}>
        {activeSection === 'dashboard' && (
          <>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.75rem', color: 'var(--dark)', marginBottom: '0.25rem' }}>Dashboard Overview</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem', marginTop: '1rem' }}>
              {initialStats.map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--white)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark)', lineHeight: 1, marginBottom: '0.25rem', fontFamily: "'Poppins', sans-serif" }}>{value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--white)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.2rem', color: 'var(--dark)' }}>Recent Bookings</h2>
                <button onClick={() => setActiveSection('bookings')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                  View All →
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr><th>Booking ID</th><th>Customer</th><th>Package</th><th>Date</th><th>Travellers</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {initialBookings.slice(0, 5).map(b => (
                      <tr key={b.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{b.id}</td>
                        <td style={{ fontWeight: 500 }}>{b.customer?.full_name || 'N/A'}</td>
                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.packages?.title}</td>
                        <td>{new Date(b.created_at).toLocaleDateString()}</td>
                        <td>{b.num_travelers}</td>
                        <td style={{ fontWeight: 700, color: 'var(--dark)' }}>₹{b.total_amount.toLocaleString('en-IN')}</td>
                        <td><span className={`badge badge-${b.status === 'completed' ? 'green' : b.status === 'confirmed' ? 'green' : b.status === 'cancelled' ? 'red' : 'gray'}`}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeSection === 'packages' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.75rem', color: 'var(--dark)' }}>Package Management</h1>
              <button 
                className="btn-primary" 
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => {
                  setEditingPackage(null)
                  setIsPackageModalOpen(true)
                }}
              >
                <Plus size={16} /> Add Package
              </button>
            </div>
            <div style={{ background: 'var(--white)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr><th>Package</th><th>Price</th><th>Slots</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {initialPackages.map(pkg => (
                    <tr key={pkg.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={pkg.cover_image_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--dark)' }}>{pkg.title}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{pkg.base_price.toLocaleString('en-IN')}</td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--dark)', fontWeight: 600 }}>{pkg.slots_booked}</span>
                          <span style={{ color: 'var(--gray)' }}>/{pkg.total_slots}</span>
                          <div style={{ height: 4, background: 'var(--cream)', borderRadius: 999, marginTop: 4 }}>
                            <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 999, width: `${(pkg.slots_booked / pkg.total_slots) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-green">{pkg.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            onClick={() => { setEditingPackage(pkg); setIsPackageModalOpen(true); }}
                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.4rem', borderRadius: 6, color: 'var(--dark)', cursor: 'pointer' }}
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleExportTravelers(pkg.id)}
                            style={{ background: 'rgba(34, 197, 94, 0.1)', border: 'none', padding: '0.4rem', borderRadius: 6, color: '#16a34a', cursor: 'pointer' }}
                            title="Download Travelers CSV"
                          >
                            <Download size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeletePackage(pkg.id)}
                            style={{ background: 'rgba(229, 9, 20, 0.1)', border: 'none', padding: '0.4rem', borderRadius: 6, color: 'var(--primary)', cursor: 'pointer' }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isPackageModalOpen && (
              <PackageEditorModal 
                isOpen={isPackageModalOpen}
                onClose={() => setIsPackageModalOpen(false)}
                packageData={editingPackage}
                destinations={initialDestinations || []}
              />
            )}
          </>
        )}

        {activeSection === 'bookings' && (
          <>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.75rem', color: 'var(--dark)', marginBottom: '2rem' }}>Booking Management</h1>
            <div style={{ background: 'var(--white)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr><th>ID</th><th>Customer</th><th>Package</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {initialBookings.map(b => (
                    <Fragment key={b.id}>
                      <tr>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {b.id}
                          {b.status === 'pending_verification' && b.payments?.[0]?.upi_transaction_id && (
                            <div style={{ marginTop: 4, color: 'var(--primary)', fontWeight: 600 }}>
                              UTR: {b.payments[0].upi_transaction_id}
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: 500 }}>{b.customer?.full_name}</td>
                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{b.packages?.title}</td>
                        <td>{new Date(b.created_at).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 700, color: 'var(--dark)' }}>₹{b.total_amount.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge badge-${b.status === 'completed' ? 'green' : b.status === 'confirmed' ? 'green' : b.status === 'pending_verification' ? 'primary' : b.status === 'cancelled' ? 'red' : 'gray'}`}>
                            {b.status === 'pending_verification' ? 'Pending' : b.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button 
                              onClick={() => setExpandedBookingId(expandedBookingId === b.id ? null : b.id)}
                              style={{ background: 'rgba(50, 100, 205, 0.1)', border: 'none', borderRadius: 6, padding: '6px', cursor: 'pointer', color: 'blue' }}
                              title="View Travelers"
                            >
                              <Eye size={13} />
                            </button>
                            {b.status === 'confirmed' && (
                              <>
                                <button 
                                  onClick={() => handleCompleteBooking(b.id)} 
                                  disabled={loadingAction}
                                  style={{ background: 'rgba(34, 197, 94, 0.15)', border: 'none', borderRadius: 6, padding: '6px', cursor: 'pointer', color: '#16a34a', opacity: loadingAction ? 0.5 : 1 }}
                                  title="Mark Completed"
                                >
                                  <CheckCircle2 size={13} />
                                </button>
                                <button 
                                  onClick={() => handleCancelBooking(b.id)} 
                                  disabled={loadingAction}
                                  style={{ background: 'rgba(204,20,20,0.1)', border: 'none', borderRadius: 6, padding: '6px', cursor: 'pointer', color: 'var(--primary)', opacity: loadingAction ? 0.5 : 1 }}
                                  title="Cancel Booking"
                                >
                                  <XCircle size={13} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              disabled={loadingAction}
                              style={{ background: 'rgba(229, 9, 20, 0.15)', border: 'none', borderRadius: 6, padding: '6px', cursor: 'pointer', color: 'var(--primary)', opacity: loadingAction ? 0.5 : 1 }}
                              title="Delete Booking"
                            >
                              <Trash2 size={13} />
                            </button>
                            {b.status === 'pending_verification' && (
                              <>
                                <button 
                                  onClick={() => handleConfirmBooking(b.id)} 
                                  disabled={loadingAction}
                                  style={{ background: 'rgba(50, 205, 50, 0.1)', border: 'none', borderRadius: 6, padding: '6px', cursor: 'pointer', color: 'green', opacity: loadingAction ? 0.5 : 1 }}
                                  title="Verify Payment"
                                >
                                  <Check size={13} />
                                </button>
                                <button 
                                  onClick={() => handleDenyBooking(b.id)} 
                                  disabled={loadingAction}
                                  style={{ background: 'rgba(204,20,20,0.12)', border: 'none', borderRadius: 6, padding: '6px', cursor: 'pointer', color: 'var(--primary)', opacity: loadingAction ? 0.5 : 1 }}
                                  title="Reject Payment"
                                >
                                  <XCircle size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedBookingId === b.id && b.travelers && b.travelers.length > 0 && (
                        <tr>
                          <td colSpan={7} style={{ padding: '1rem', background: '#fff8f3', borderBottom: '1px solid #eaeaea' }}>
                            {b.invoices && b.invoices[0] && (
                              <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark)' }}>Invoice #{b.invoices[0].invoice_number}</div>
                                {b.invoices[0].pdf_url ? (
                                  <a href={b.invoices[0].pdf_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                                    Open invoice
                                  </a>
                                ) : (
                                  <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>Invoice PDF not generated yet</span>
                                )}
                              </div>
                            )}
                            <div style={{ marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark)' }}>Traveler Details ({b.travelers.length})</div>
                            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                              {b.travelers.map((t: any, i: number) => (
                                <div key={i} style={{ background: '#ffffff', padding: '0.9rem', borderRadius: 10, border: '1px solid #e5d7ce', fontSize: '0.9rem', color: 'var(--dark)' }}>
                                  <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--dark)' }}>Traveler {i + 1}: {t.name} (Age {t.age})</div>
                                  <div style={{ color: '#4b4b4b' }}>Phone: {t.phone}</div>
                                  {t.medical && <div style={{ color: '#7a1f1f', marginTop: 6, fontWeight: 600 }}>Medical: {t.medical}</div>}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeSection === 'coupons' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.75rem', color: 'var(--dark)' }}>Coupon Management</h1>
              <button 
                onClick={() => { setEditingCoupon(null); setIsCouponModalOpen(true); }}
                className="btn-primary" 
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={16} /> Add Coupon
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {initialCoupons.map(c => (
                <div key={c.id} style={{ background: 'var(--white)', borderRadius: 16, padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--cream)', border: '1.5px dashed var(--primary)', borderRadius: 10, padding: '0.5rem 1rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>{c.code}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--dark)' }}>
                        {c.discount_type === 'percentage' ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                        {c.times_used}/{c.max_uses || '∞'} uses · Valid till {c.valid_until}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge badge-${c.active ? 'green' : 'gray'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                    <button 
                      onClick={() => { setEditingCoupon(c); setIsCouponModalOpen(true); }}
                      style={{ background: 'rgba(212,175,55,0.1)', border: 'none', borderRadius: 6, padding: '8px', cursor: 'pointer', color: 'var(--primary)' }}
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeSection === 'settings' && (
          <>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.75rem', color: 'var(--dark)', marginBottom: '2rem' }}>Site Settings</h1>
            
            <div style={{ background: 'var(--white)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.2rem', color: 'var(--dark)', marginBottom: '1rem' }}>Homepage Hero Images</h2>
              <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Add image URLs to be displayed in the sliding carousel on the homepage.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {heroImages.map((img, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <ImageUploader 
                        currentImage={img}
                        onUploadSuccess={(url) => {
                          const newImgs = [...heroImages];
                          newImgs[idx] = url;
                          setHeroImages(newImgs);
                        }}
                      />
                    </div>
                    <button 
                      onClick={() => setHeroImages(heroImages.filter((_, i) => i !== idx))}
                      style={{ background: 'rgba(204,20,20,0.1)', border: 'none', borderRadius: 6, padding: '10px', cursor: 'pointer', color: 'var(--primary)', marginTop: '0.5rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setHeroImages([...heroImages, ''])}
                className="btn-outline" 
                style={{ marginBottom: '2rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                <Plus size={14} /> Add Image URL
              </button>

              <div style={{ borderTop: '1px solid var(--cream-dark)', margin: '1.5rem 0' }}></div>

              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.2rem', color: 'var(--dark)', marginBottom: '1rem' }}>Past Trip Images</h2>
              <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Add image URLs to be displayed in the Past Trips gallery on the homepage.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {pastTripImages.map((img, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <ImageUploader 
                        currentImage={img}
                        onUploadSuccess={(url) => {
                          const newImgs = [...pastTripImages];
                          newImgs[idx] = url;
                          setPastTripImages(newImgs);
                        }}
                      />
                    </div>
                    <button 
                      onClick={() => setPastTripImages(pastTripImages.filter((_, i) => i !== idx))}
                      style={{ background: 'rgba(204,20,20,0.1)', border: 'none', borderRadius: 6, padding: '10px', cursor: 'pointer', color: 'var(--primary)', marginTop: '0.5rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setPastTripImages([...pastTripImages, ''])}
                className="btn-outline" 
                style={{ marginBottom: '2rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                <Plus size={14} /> Add Image URL
              </button>

              <div style={{ borderTop: '1px solid var(--cream-dark)', margin: '1.5rem 0' }}></div>

              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.2rem', color: 'var(--dark)', marginBottom: '1rem' }}>UPI QR Codes & IDs</h2>
              <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Upload the 2 UPI QR codes and enter the corresponding UPI IDs. The system will alternate between them every 10 payments.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--dark)', marginBottom: '0.5rem' }}>Account 1</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>UPI ID 1</label>
                    <input type="text" className="input" placeholder="e.g. account1@upi" value={upiId1} onChange={e => setUpiId1(e.target.value)} />
                  </div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>UPI QR 1</label>
                  <ImageUploader 
                    currentImage={upiQrUrl}
                    onUploadSuccess={(url) => setUpiQrUrl(url)}
                  />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--dark)', marginBottom: '0.5rem' }}>Account 2</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>UPI ID 2</label>
                    <input type="text" className="input" placeholder="e.g. account2@upi" value={upiId2} onChange={e => setUpiId2(e.target.value)} />
                  </div>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>UPI QR 2</label>
                  <ImageUploader 
                    currentImage={upiQrUrl2}
                    onUploadSuccess={(url) => setUpiQrUrl2(url)}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--cream-dark)', margin: '1.5rem 0' }}></div>

              <button 
                onClick={handleSaveSettings}
                disabled={loadingAction}
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
              >
                {loadingAction ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </>
        )}

      </main>

      {/* Coupon Editor Modal */}
      <CouponEditorModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        coupon={editingCoupon}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}

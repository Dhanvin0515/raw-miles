// components/Footer.tsx
'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#000000', color: '#737373', marginTop: 'auto', borderTop: '8px solid #222' }}>
      <div className="container" style={{ padding: '2rem 2rem 1.5rem', maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#737373' }}>Raw Miles</p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#737373' }}>All rights reserved</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/privacy" style={{ color: '#737373', textDecoration: 'underline', fontSize: '0.85rem' }}>Privacy</Link>
          <Link href="/terms" style={{ color: '#737373', textDecoration: 'underline', fontSize: '0.85rem' }}>Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  )
}

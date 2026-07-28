// components/Footer.tsx
'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#000000', color: '#737373', marginTop: 'auto', borderTop: '8px solid #222' }}>
      <div className="container" style={{ padding: '4rem 2rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
        <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#737373' }}>
          Questions? Contact us at <a href="mailto:hello@rawmiles.in" style={{ color: '#737373', textDecoration: 'underline' }}>hello@rawmiles.in</a>
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { label: 'FAQ', href: '#' },
            { label: 'Help Centre', href: '#' },
            { label: 'Account', href: '#' },
            { label: 'Media Centre', href: '#' },
            { label: 'Investor Relations', href: '#' },
            { label: 'Jobs', href: '#' },
            { label: 'Ways to Travel', href: '/packages' },
            { label: 'Terms of Use', href: '/terms' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Cookie Preferences', href: '#' },
            { label: 'Corporate Information', href: '#' },
            { label: 'Contact Us', href: '#' },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              style={{ color: '#737373', textDecoration: 'underline', fontSize: '0.85rem' }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <button style={{ 
            background: 'transparent', 
            border: '1px solid #737373', 
            color: '#737373', 
            padding: '0.5rem 1rem', 
            borderRadius: 4,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}>
            English
          </button>
        </div>

        <p style={{ fontSize: '0.85rem' }}>Raw Miles India</p>
      </div>
    </footer>
  )
}

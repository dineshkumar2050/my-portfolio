'use client';
import { useState, useEffect } from 'react';

const links = ['About', 'Skills', 'Experience', 'Learnings', 'Projects', 'Resume', 'Social', 'Contact'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const ids = links.map((l) => l.toLowerCase());
      let cur = '';
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) cur = id;
      });
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          padding: scrolled ? '10px 0' : '16px 0',
          background: '#07101f',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #1a2e46',
          transition: 'all 0.3s',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: '1.15rem', color: '#00d4ff', cursor: 'pointer' }}
          >
            <span style={{ color: '#e2eeff' }}>DK</span>.dev
          </div>

          {/* Desktop links */}
          <ul style={{ display: 'flex', alignItems: 'center', gap: 28, listStyle: 'none' }} className="hidden-mobile">
            {links.map((l) => (
              <li key={l}>
                <button
                  onClick={() => navTo(l.toLowerCase())}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.88rem', fontWeight: 500,
                    color: active === l.toLowerCase() ? '#00d4ff' : '#6e869e',
                    transition: 'color 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#00d4ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = active === l.toLowerCase() ? '#00d4ff' : '#6e869e')}
                >
                  {l}
                </button>
              </li>
            ))}
          </ul>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'none' }}
            className="show-mobile"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 22, height: 2, background: '#e2eeff', borderRadius: 2 }} />)}
            </div>
          </button>
        </div>
        <div className="availability-badge" aria-label="Immediately available to join">
          <span />
          Immediately available to join
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(7,16,31,0.98)',
            zIndex: 1999, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 36,
          }}
        >
          <button
            onClick={() => setMenuOpen(false)}
            style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#6e869e' }}
          >
            ✕
          </button>
          {links.map((l) => (
            <button
              key={l}
              onClick={() => navTo(l.toLowerCase())}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.6rem', fontWeight: 700, color: '#e2eeff', fontFamily: 'inherit' }}
            >
              {l}
            </button>
          ))}
        </div>
      )}

    </>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';

const slides = [
  {
    id: 1,
    bg: 'linear-gradient(135deg, #07101f 0%, #0a1830 40%, #060e1a 100%)',
    accent: '#00d4ff',
    title: 'DINESH\nKUMAR',
    role: 'Software Engineer & Tech Lead',
    desc: 'Full-stack engineer with 8+ years crafting production-grade applications across fintech, institutional banking, e-commerce, and AI domains.',
    pattern: 'grid',
    cta: { label: 'View My Work', href: '#projects' },
    image: '/images/Dinesh-1.jpeg',
    imagePosition: '52% 32%',
  },
  {
    id: 2,
    bg: 'linear-gradient(135deg, #080f1e 0%, #0d1a2e 40%, #071220 100%)',
    accent: '#7c3aed',
    title: 'BUILDING AT\nENTERPRISE\nSCALE',
    role: 'Team Lead · Institutional Banking Platform',
    desc: 'Architected microservices, event-driven Kafka pipelines, Temporal workflows, and AI-powered tooling for one of the world\'s largest banks.',
    pattern: 'dots',
    cta: { label: 'See CBA Project', href: '#projects' },
    image: '/images/Dinesh-2.jpeg',
    imagePosition: '50% 38%',
  },
  {
    id: 3,
    bg: 'linear-gradient(135deg, #07101f 0%, #0b1825 40%, #060e1a 100%)',
    accent: '#10b981',
    title: 'SENIOR DEV\n& ARCHITECT',
    role: 'React · Next.js · Node.js · NestJS · AWS',
    desc: 'Expertise spanning 30+ technologies — from pixel-perfect UIs to cloud infrastructure, AI pipelines, and distributed systems design.',
    pattern: 'circuit',
    cta: { label: 'Email Resume', href: '#resume' },
    image: '/images/Dinesh-3.jpeg',
    imagePosition: '50% 42%',
  },
];

type PatternType = 'grid' | 'dots' | 'circuit';

function BackgroundPattern({ type, color }: { type: PatternType; color: string }) {
  if (type === 'grid') {
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={color} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    );
  }
  if (type === 'dots') {
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill={color}/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    );
  }
  // circuit
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="circuit" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M10 10 H30 V30 H50 M50 30 V50 M30 30 V70 M70 10 H50 V30" fill="none" stroke={color} strokeWidth="1.5"/>
          <circle cx="10" cy="10" r="3" fill={color}/>
          <circle cx="50" cy="50" r="3" fill={color}/>
          <circle cx="70" cy="10" r="3" fill={color}/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
  );
}

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  const s = slides[current];

  return (
    <section
      id="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Slide backgrounds */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`carousel-slide${i === current ? ' active' : ''}`}
          style={{ background: slide.bg }}
        >
          <BackgroundPattern type={slide.pattern as PatternType} color={slide.accent} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 60% 60% at 20% 50%, ${slide.accent}0d 0%, transparent 70%)`,
          }} />
        </div>
      ))}

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 10, paddingTop: 100, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'center' }}>

          {/* ── LEFT: Text ── */}
          <div>
            {/* Name */}
            <h1
              key={`title-${current}`}
              style={{
                fontSize: 'clamp(2.6rem, 7vw, 5rem)',
                fontWeight: 900, lineHeight: 1,
                background: `linear-gradient(135deg, #fff 30%, ${s.accent} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                marginBottom: 14, whiteSpace: 'pre-line',
                animation: 'slideUp 0.5s ease 0.1s both',
              }}
            >
              {s.title}
            </h1>

            <p
              key={`role-${current}`}
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.15rem)', color: s.accent, fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace', marginBottom: 20,
                animation: 'slideUp 0.5s ease 0.2s both',
              }}
            >
              {s.role}
            </p>

            <p
              key={`desc-${current}`}
              style={{
                fontSize: '1rem', color: '#6e869e', maxWidth: 520,
                marginBottom: 32, lineHeight: 1.75,
                animation: 'slideUp 0.5s ease 0.3s both',
              }}
            >
              {s.desc}
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', animation: 'slideUp 0.5s ease 0.4s both' }}>
              <a href={s.cta.href} className="btn btn-pri">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3l14 9-14 9V3z"/></svg>
                {s.cta.label}
              </a>
              <a href="#contact" className="btn btn-out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Get In Touch
              </a>
              <a href="#resume" className="btn btn-out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Resume
              </a>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, marginTop: 52, paddingTop: 40, borderTop: '1px solid #1a2e46', flexWrap: 'wrap' }}>
              {[
                { num: '8+', label: 'Years' },
                { num: '15+', label: 'Projects' },
                { num: '5', label: 'Companies' },
                { num: '30+', label: 'Technologies' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: '2.1rem', fontWeight: 900, color: s.accent, lineHeight: 1 }}>{stat.num}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6e869e', marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Photo ── */}
          <div
            key={`photo-${current}`}
            style={{
              width: 'clamp(220px, 28vw, 380px)',
              flexShrink: 0,
              animation: 'slideUp 0.6s ease 0.15s both',
            }}
          >
            {/* Glow behind photo */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: -20,
                background: `radial-gradient(ellipse at center, ${s.accent}22 0%, transparent 70%)`,
                borderRadius: '50%',
                filter: 'blur(20px)',
              }} />

              {/* Photo frame */}
              <div style={{
                position: 'relative',
                borderRadius: 24,
                overflow: 'hidden',
                border: `2px solid ${s.accent}44`,
                boxShadow: `0 0 40px ${s.accent}22, 0 20px 60px rgba(0,0,0,0.5)`,
                aspectRatio: '3/4',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt="Dinesh Kumar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: s.imagePosition, display: 'block' }}
                />

                {/* Subtle gradient overlay at bottom */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
                  background: `linear-gradient(to top, ${s.bg.split(',')[0].replace('linear-gradient(135deg, ', '')}cc, transparent)`,
                }} />

                {/* Name tag at bottom */}
                <div style={{
                  position: 'absolute', bottom: 16, left: 16, right: 16,
                  background: 'rgba(7,16,31,0.85)', backdropFilter: 'blur(8px)',
                  borderRadius: 10, padding: '10px 14px',
                  border: `1px solid ${s.accent}33`,
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2eeff' }}>Dinesh Kumar</div>
                  <div style={{ fontSize: '0.72rem', color: s.accent, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>Senior Software Engineer</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Navigation dots */}
      <div style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 10, zIndex: 10,
      }}>
        {slides.map((sl, i) => (
          <button
            key={sl.id}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: i === current ? s.accent : '#1f3858',
            }}
          />
        ))}
      </div>

      {/* Prev/Next arrows */}
      <button
        onClick={prev}
        style={{
          position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.06)', border: '1px solid #1f3858',
          borderRadius: '50%', width: 44, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#e2eeff', zIndex: 10, transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `${s.accent}22`; e.currentTarget.style.borderColor = s.accent; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = '#1f3858'; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button
        onClick={next}
        style={{
          position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.06)', border: '1px solid #1f3858',
          borderRadius: '50%', width: 44, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#e2eeff', zIndex: 10, transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `${s.accent}22`; e.currentTarget.style.borderColor = s.accent; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = '#1f3858'; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      {/* Slide counter */}
      <div style={{
        position: 'absolute', bottom: 40, right: 24,
        color: '#3a5066', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', zIndex: 10,
      }}>
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>

    </section>
  );
}

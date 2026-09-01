'use client';
import { useState } from 'react';

// Update these with your actual profile URLs
const PROFILES = {
  linkedin: 'https://www.linkedin.com/in/dinesh-kumar-668a77111',
  github: 'https://github.com/dineshkumar2050',
  twitter: 'https://twitter.com/dineshkumar_dev',
  naukri: 'https://www.naukri.com/mnjuser/profile',
  email: 'mailto:dinesh.kumar.199998888@gmail.com',
  whatsappPrimary: 'https://wa.me/919560163362',
  whatsappAlternate: 'https://wa.me/918448724187',
};

const socialCards = [
  {
    key: 'linkedin',
    name: 'LinkedIn',
    handle: '@dinesh-kumar-668a77111',
    desc: 'Professional network, recommendations, and career updates.',
    color: '#0077b5',
    bg: 'rgba(0,119,181,0.1)',
    border: 'rgba(0,119,181,0.25)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    cta: 'Connect on LinkedIn',
    url: PROFILES.linkedin,
  },
  {
    key: 'github',
    name: 'GitHub',
    handle: '@dineshkumar2050',
    desc: 'Open source contributions, code samples, and side projects.',
    color: '#e6edf3',
    bg: 'rgba(230,237,243,0.08)',
    border: 'rgba(230,237,243,0.15)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    cta: 'View GitHub',
    url: PROFILES.github,
  },
  {
    key: 'twitter',
    name: 'Twitter / X',
    handle: '@dineshkumar_dev',
    desc: 'Thoughts on engineering, AI, and the tech industry.',
    color: '#1d9bf0',
    bg: 'rgba(29,155,240,0.1)',
    border: 'rgba(29,155,240,0.2)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    cta: 'Follow on X',
    url: PROFILES.twitter,
  },
  {
    key: 'email',
    name: 'Email',
    handle: 'dinesh.kumar.199998888@gmail.com',
    desc: 'For opportunities, collaborations, and consulting inquiries.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.2)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    cta: 'Send Email',
    url: PROFILES.email,
  },
  {
    key: 'whatsapp-primary',
    name: 'WhatsApp',
    handle: '+91 9560163362',
    desc: 'Quick WhatsApp contact for opportunities and recruiter conversations.',
    color: '#25d366',
    bg: 'rgba(37,211,102,0.1)',
    border: 'rgba(37,211,102,0.22)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2 22l5.26-1.38a9.9 9.9 0 0 0 4.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.51 2 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.55 3.7-8.25 8.25-8.25a8.22 8.22 0 0 1 8.25 8.26c0 4.54-3.7 8.23-8.25 8.23Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.98-.14.16-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.38-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.51.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/>
      </svg>
    ),
    cta: 'Message on WhatsApp',
    url: PROFILES.whatsappPrimary,
  },
  {
    key: 'whatsapp-alternate',
    name: 'WhatsApp Alternate',
    handle: '+91 8448724187',
    desc: 'Alternate WhatsApp number for direct follow-ups and scheduling.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.22)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2 22l5.26-1.38a9.9 9.9 0 0 0 4.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.51 2 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.55 3.7-8.25 8.25-8.25a8.22 8.22 0 0 1 8.25 8.26c0 4.54-3.7 8.23-8.25 8.23Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.98-.14.16-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.38-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.51.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/>
      </svg>
    ),
    cta: 'Message Alternate',
    url: PROFILES.whatsappAlternate,
  },
];

const jobBoards = [
  {
    name: 'Naukri',
    desc: "India's #1 job portal — Dinesh's full profile with experience, skills, and recommendations.",
    color: '#3b7ddd',
    icon: '💼',
    profileUrl: PROFILES.naukri,
    searchUrl: 'https://www.naukri.com/jobs-by-skill/nodejs-nestjs-reactjs-jobs',
    searchLabel: 'Node.js / NestJS / React Jobs',
  },
  {
    name: 'LinkedIn Jobs',
    desc: 'Connect and explore senior engineering & tech lead roles.',
    color: '#0077b5',
    icon: '🔗',
    profileUrl: PROFILES.linkedin,
    searchUrl: 'https://www.linkedin.com/jobs/search/?keywords=Senior%20Software%20Engineer%20NestJS%20TypeScript&location=India',
    searchLabel: 'Senior Engineer Roles on LinkedIn',
  },
  {
    name: 'Indeed',
    desc: 'Explore full-stack and tech lead openings across India and remotely.',
    color: '#2557a7',
    icon: '🔍',
    profileUrl: 'https://in.indeed.com',
    searchUrl: 'https://in.indeed.com/q-senior-software-engineer-nestjs-react-l-remote-jobs.html',
    searchLabel: 'Senior Engineer Remote Jobs',
  },
  {
    name: 'Glassdoor',
    desc: 'Research companies + find senior / staff engineer roles.',
    color: '#0caa41',
    icon: '🏢',
    profileUrl: 'https://www.glassdoor.co.in',
    searchUrl: 'https://www.glassdoor.co.in/Job/senior-software-engineer-nodejs-react-jobs-SRCH_KO0,37.htm',
    searchLabel: 'Senior SWE Openings',
  },
];

const lookingFor = [
  { label: 'Role', value: 'Senior Engineer / Tech Lead / Architect' },
  { label: 'Mode', value: 'Remote-first or Hybrid' },
  { label: 'Domains', value: 'Fintech · AI/ML · Enterprise SaaS · Developer Tools' },
  { label: 'Stack', value: 'TypeScript · Node.js · React · AWS · Kafka' },
  { label: 'Open to', value: 'India · Remote Worldwide · Relocation (EU/UK/AU)' },
];

export default function SocialSection() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('dinesh.kumar.199998888@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section id="social" className="section">
      <div className="container">
        <div className="fade-in" style={{ marginBottom: 60 }}>
          <h2 className="sec-title">Connect & Opportunities</h2>
          <p style={{ color: '#6e869e', fontSize: '1rem', maxWidth: 600, lineHeight: 1.6 }}>
            Find Dinesh on professional networks, explore active job opportunities, or reach out directly.
          </p>
        </div>

        {/* Social profile cards */}
        <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Social Profiles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginBottom: 48 }}>
          {socialCards.map((s) => (
            <div
              key={s.key}
              className="fade-in"
              style={{ background: '#101e30', border: '1px solid #1a2e46', borderRadius: 14, padding: 22, transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.border; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}14`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a2e46'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#e2eeff', fontSize: '0.97rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#3a5066', fontFamily: 'JetBrains Mono, monospace' }}>{s.handle}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#6e869e', lineHeight: 1.5, marginBottom: 14 }}>{s.desc}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={s.url}
                  target={s.key !== 'email' ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, textDecoration: 'none', transition: 'opacity 0.2s', display: 'block' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {s.cta}
                </a>
                {s.key === 'email' && (
                  <button
                    onClick={copyEmail}
                    style={{ padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, color: copiedEmail ? '#10b981' : '#3a5066', background: copiedEmail ? 'rgba(16,185,129,0.1)' : '#07101f', border: '1px solid #1a2e46', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  >
                    {copiedEmail ? '✓ Copied' : '⎘ Copy'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* What I'm looking for */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 48 }}>
          <div>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>What I&apos;m Looking For</h3>
            <div className="fade-in" style={{ background: '#101e30', border: '1px solid #1a2e46', borderRadius: 14, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>Open to new opportunities</span>
              </div>
              {lookingFor.map((f) => (
                <div key={f.label} style={{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 64, paddingTop: 1 }}>{f.label}</span>
                  <span style={{ fontSize: '0.86rem', color: '#9cb3c7', lineHeight: 1.4 }}>{f.value}</span>
                </div>
              ))}
              <a
                href="mailto:dinesh.kumar.199998888@gmail.com?subject=Job Opportunity — via Portfolio&body=Hi Dinesh,%0A%0AI came across your portfolio and wanted to reach out about a potential opportunity.%0A%0A"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 10, padding: '9px 18px', borderRadius: 8, fontSize: '0.83rem', fontWeight: 700, background: 'linear-gradient(135deg,#00d4ff22,#7c3aed22)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.25)', textDecoration: 'none', transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Reach out with an opportunity →
              </a>
            </div>
          </div>

          {/* Refer / introduce */}
          <div>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Refer or Introduce</h3>
            <div className="fade-in" style={{ background: '#101e30', border: '1px solid #1a2e46', borderRadius: 14, padding: 24, height: '100%', boxSizing: 'border-box' }}>
              <p style={{ color: '#6e869e', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 18 }}>
                Know a team or company that could benefit from Dinesh&apos;s expertise? Forward this portfolio or send a referral email.
              </p>
              <a
                href={`mailto:?subject=Introducing Dinesh Kumar — Senior Software Engineer&body=Hi,%0A%0AI wanted to introduce you to Dinesh Kumar, a Senior Software Engineer and Team Lead with 8+ years of experience.%0A%0AHis portfolio: ${typeof window !== 'undefined' ? window.location.href : 'https://dinesh-kumar.dev'}%0A%0AHe specializes in React, Node.js, NestJS, TypeScript, AWS, Kafka, and has experience building AI-powered developer tooling.%0A%0AHope this is useful!`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8, fontSize: '0.83rem', fontWeight: 700, background: 'rgba(124,58,237,0.12)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.25)', textDecoration: 'none', marginBottom: 10, transition: 'opacity 0.2s', width: 'fit-content' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                ✉ Forward introduction email
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : ''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8, fontSize: '0.83rem', fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.2s', width: 'fit-content' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                ⎘ Copy portfolio link
              </button>
            </div>
          </div>
        </div>

        {/* Job boards */}
        <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Job Boards</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {jobBoards.map((jb) => (
            <div
              key={jb.name}
              className="fade-in"
              style={{ background: '#101e30', border: '1px solid #1a2e46', borderRadius: 14, padding: 20, transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = jb.color + '40'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a2e46'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.3rem' }}>{jb.icon}</span>
                <span style={{ fontWeight: 800, color: '#e2eeff', fontSize: '1rem' }}>{jb.name}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#6e869e', lineHeight: 1.5, marginBottom: 14 }}>{jb.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a
                  href={jb.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '8px 14px', borderRadius: 7, fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', color: jb.color, background: jb.color + '14', border: `1px solid ${jb.color}33`, textDecoration: 'none', transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  View Profile →
                </a>
                <a
                  href={jb.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '8px 14px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 600, textAlign: 'center', color: '#6e869e', background: '#07101f', border: '1px solid #1a2e46', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#9cb3c7'; e.currentTarget.style.borderColor = '#2a4060'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#6e869e'; e.currentTarget.style.borderColor = '#1a2e46'; }}
                >
                  🔍 {jb.searchLabel}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

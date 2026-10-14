'use client';
import { useState } from 'react';
import EmailResumeModal from '@/components/EmailResumeModal';
import TailoredResumeModal from '@/components/TailoredResumeModal';

type ResumeType = 'basic' | 'detailed' | 'tailored';

export default function ResumeSection() {
  const [modal, setModal] = useState<ResumeType | null>(null);

  return (
    <section id="resume" className="section">
      <div className="container">
        <div className="fade-in" style={{ marginBottom: 60 }}>
          <h2 className="sec-title">Resume</h2>
          <p style={{ color: '#6e869e', fontSize: '1rem', maxWidth: 600, lineHeight: 1.6 }}>
            A clean ATS-friendly version for quick screening, a comprehensive deep-dive for technical hiring managers — or let AI agents tailor one to your exact job description.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24, maxWidth: 1180, margin: '0 auto' }}>
          {/* Basic Resume */}
          <div
            className="fade-in"
            style={{ background: '#101e30', border: '1px solid #1a2e46', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00d4ff40')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1a2e46')}
          >
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 20 }}>
              📄
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>ATS-Optimized</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2eeff', marginBottom: 10, lineHeight: 1.2 }}>Basic Resume</div>
            <div style={{ fontSize: '0.88rem', color: '#6e869e', lineHeight: 1.65, marginBottom: 22 }}>
              Concise 2-page resume designed to pass Applicant Tracking Systems and grab recruiter attention fast. Includes top projects, core skills, and key achievements.
            </div>
            <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['2 pages — recruiter-friendly format', 'ATS keyword-optimized', 'Top 3 flagship projects', 'Core skills & tech stack', 'Email delivery with verification'].map((f) => (
                <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.85rem', color: '#9cb3c7' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2.5" style={{ marginTop: 1, flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setModal('basic')}
              className="btn btn-pri"
              style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 6L2 7"/></svg> Email Basic Resume</>
            </button>
          </div>

          {/* Detailed Resume */}
          <div
            className="fade-in"
            style={{ background: '#101e30', border: '1px solid #1a2e46', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#7c3aed40')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1a2e46')}
          >
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 20 }}>
              📋
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Technical Deep-Dive</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2eeff', marginBottom: 10, lineHeight: 1.2 }}>Detailed Resume</div>
            <div style={{ fontSize: '0.88rem', color: '#6e869e', lineHeight: 1.65, marginBottom: 22 }}>
              Comprehensive multi-page resume for technical hiring managers. Detailed per-project breakdowns, full architecture context, leadership highlights, and complete tech stack.
            </div>
            <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Full project-by-project breakdown', 'Architecture decisions & tech choices', 'Leadership & mentorship details', 'Complete skills taxonomy', 'Multi-country project scope'].map((f) => (
                <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.85rem', color: '#9cb3c7' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" style={{ marginTop: 1, flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setModal('detailed')}
              className="btn btn-purp"
              style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 6L2 7"/></svg> Email Detailed Resume</>
            </button>
          </div>

          {/* AI Tailored Resume */}
          <div
            className="fade-in"
            style={{ background: 'linear-gradient(160deg, #101e30 60%, rgba(16,185,129,0.08))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s', position: 'relative' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#10b98180')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)')}
          >
            <span style={{ position: 'absolute', top: 16, right: 16, fontSize: '0.62rem', fontWeight: 800, color: '#07101f', background: '#10b981', borderRadius: 999, padding: '3px 9px', letterSpacing: '0.08em' }}>NEW</span>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 20 }}>
              ✨
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>AI Multi-Agent</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2eeff', marginBottom: 10, lineHeight: 1.2 }}>Job-Tailored Resume</div>
            <div style={{ fontSize: '0.88rem', color: '#6e869e', lineHeight: 1.65, marginBottom: 22 }}>
              Share a job link (Naukri, LinkedIn, Indeed, Glassdoor…) or paste the JD. A team of AI agents tailors Dinesh&apos;s real experience to the role and emails you an ATS-ready PDF.
            </div>
            <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Job URL or pasted job description', 'JD-matched summary, skills & projects', 'ATS keyword match score', 'Fact-checked — no invented experience', 'Email delivery with verification'].map((f) => (
                <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.85rem', color: '#9cb3c7' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" style={{ marginTop: 1, flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setModal('tailored')}
              className="btn btn-green"
              style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              ✨ Tailor Resume to a Job
            </button>
          </div>
        </div>

        <div className="fade-in" style={{ textAlign: 'center', marginTop: 28, fontSize: '0.82rem', color: '#3a5066' }}>
          Verification ensures genuine interest. The PDF is sent to the verified email address.
        </div>
      </div>

      {modal === 'tailored' && <TailoredResumeModal onClose={() => setModal(null)} />}

      {(modal === 'basic' || modal === 'detailed') && (
        <EmailResumeModal
          resumeType={modal}
          onClose={() => setModal(null)}
        />
      )}

    </section>
  );
}

'use client';
import { useState } from 'react';

type Step = 'email' | 'otp' | 'done';

interface Props {
  resumeType: 'basic' | 'detailed';
  onClose: () => void;
}

export default function EmailResumeModal({ resumeType, onClose }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const sendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      if (data.dev && data.otp) setDevOtp(data.otp);
      setStep('otp');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) { setError('Enter the 6-digit code from your email.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, resumeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      logDownload();
      setStep('done');
      setTimeout(() => { onClose(); }, 2200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const logDownload = () => {
    fetch('/api/log-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: resumeType, verified: true }),
    }).catch(() => {});
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(7,16,31,0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && step !== 'otp' && onClose()}
    >
      <div style={{
        background: '#101e30', border: '1px solid #1a2e46', borderRadius: 20,
        padding: 36, maxWidth: 440, width: '100%',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: resumeType === 'basic' ? '#00d4ff' : '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              {resumeType === 'basic' ? '📄 Basic Resume' : '📋 Detailed Resume'}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e2eeff' }}>
              {step === 'done' ? '✓ Sent!' : step === 'otp' ? 'Check your email' : 'Get this resume'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #1f3858', borderRadius: 8, width: 34, height: 34, color: '#6e869e', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>
        </div>

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>Email verified — resume sent!</p>
            <p style={{ color: '#6e869e', fontSize: '0.85rem', marginTop: 8 }}>Check your inbox for the PDF attachment.</p>
          </div>
        )}

        {step === 'email' && (
          <>
            <p style={{ color: '#6e869e', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
              Enter your email to receive a verification code. After verification, the resume PDF will be sent to this address.
            </p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                Your email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                placeholder="you@example.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#07101f', border: `1px solid ${error ? '#f87171' : '#1a2e46'}`,
                  borderRadius: 10, padding: '12px 16px', color: '#e2eeff',
                  fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#00d4ff')}
                onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#f87171' : '#1a2e46')}
              />
              {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 6 }}>{error}</p>}
            </div>
            <button
              onClick={sendOtp}
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#00d4ff,#0090b0)', color: '#07101f',
                fontWeight: 800, fontSize: '0.95rem', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
              }}
            >
              {loading ? <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> : '→'}
              {loading ? 'Sending code…' : 'Send verification code'}
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <p style={{ color: '#6e869e', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 8 }}>
              A 6-digit code was sent to <strong style={{ color: '#e2eeff' }}>{email}</strong>
            </p>
            {devOtp && (
              <div style={{ marginBottom: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Dev mode — RESEND_API_KEY not set
                </div>
                <div style={{ fontSize: '0.82rem', color: '#9cb3c7', marginBottom: 8 }}>
                  Your one-time code (would be emailed in production):
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.35em', textAlign: 'center' }}>
                  {devOtp}
                </div>
              </div>
            )}
            <div style={{ marginBottom: 14, marginTop: 20 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                placeholder="• • • • • •"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#07101f', border: `1px solid ${error ? '#f87171' : '#1a2e46'}`,
                  borderRadius: 10, padding: '14px 16px', color: '#00d4ff',
                  fontSize: '1.5rem', outline: 'none', fontFamily: 'JetBrains Mono, monospace',
                  textAlign: 'center', letterSpacing: '0.4em', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#00d4ff')}
                onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#f87171' : '#1a2e46')}
                autoFocus
              />
              {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 6 }}>{error}</p>}
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length < 6}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: otp.length < 6 ? 'not-allowed' : 'pointer',
                background: otp.length < 6 ? '#1a2e46' : 'linear-gradient(135deg,#10b981,#059669)',
                color: otp.length < 6 ? '#3a5066' : '#fff',
                fontWeight: 800, fontSize: '0.95rem', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
              }}
            >
              {loading ? <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> : '✓'}
              {loading ? 'Verifying…' : 'Verify & Email Resume'}
            </button>
            <button
              onClick={() => { setStep('email'); setOtp(''); setError(''); }}
              style={{ width: '100%', marginTop: 10, padding: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#3a5066', fontSize: '0.82rem', fontFamily: 'inherit' }}
            >
              ← Change email / resend code
            </button>
          </>
        )}
      </div>

    </div>
  );
}

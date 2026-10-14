'use client';
import { useState } from 'react';

export type OtpStep = 'email' | 'otp';

interface Props {
  resumeType: 'basic' | 'detailed' | 'tailored';
  intro: string;
  verifyLabel: string;
  accent?: string;
  onStepChange?: (step: OtpStep) => void;
  onVerified: (email: string, data: { sessionToken?: string }) => void;
}

// Email → OTP verification steps shared by the resume modals.
export default function OtpVerification({ resumeType, intro, verifyLabel, accent = '#00d4ff', onStepChange, onVerified }: Props) {
  const [step, setStepState] = useState<OtpStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpToken, setOtpToken] = useState('');

  const setStep = (next: OtpStep) => { setStepState(next); onStepChange?.(next); };

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
      if (!data.otpToken) throw new Error('Verification session was not created. Please try again.');
      setOtpToken(data.otpToken);
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
        body: JSON.stringify({ email, otp, otpToken, resumeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      onVerified(email, data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <>
        <p style={{ color: '#6e869e', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>{intro}</p>
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
            onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
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
    );
  }

  return (
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
          onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
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
        {loading ? 'Verifying…' : verifyLabel}
      </button>
      <button
        onClick={() => { setStep('email'); setOtp(''); setOtpToken(''); setDevOtp(null); setError(''); }}
        style={{ width: '100%', marginTop: 10, padding: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#3a5066', fontSize: '0.82rem', fontFamily: 'inherit' }}
      >
        ← Change email / resend code
      </button>
    </>
  );
}

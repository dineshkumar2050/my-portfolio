'use client';
import { useState } from 'react';
import OtpVerification from '@/components/OtpVerification';

type Step = 'email' | 'otp' | 'done';

interface Props {
  resumeType: 'basic' | 'detailed';
  onClose: () => void;
}

export default function EmailResumeModal({ resumeType, onClose }: Props) {
  const [step, setStep] = useState<Step>('email');
  const logDownload = (email: string) => {
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

        {step !== 'done' && (
          <OtpVerification
            resumeType={resumeType}
            intro="Enter your email to receive a verification code. After verification, the resume PDF will be sent to this address."
            verifyLabel="Verify & Email Resume"
            onStepChange={setStep}
            onVerified={(email) => {
              logDownload(email);
              setStep('done');
              setTimeout(() => { onClose(); }, 2200);
            }}
          />
        )}
      </div>

    </div>
  );
}

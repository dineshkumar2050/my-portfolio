import { NextRequest, NextResponse } from 'next/server';
import { issueSessionToken, verifyOtp } from '@/lib/otpStore';
import { logOtpVerified } from '@/lib/analytics';
import { sendResumeEmail } from '@/lib/resumeEmail';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, otpToken, resumeType } = await req.json();
    if (!email || !otp || !otpToken) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const result = await verifyOtp(email, otp.toString().trim(), otpToken);

    if (result !== 'ok') {
      const msgs: Record<string, string> = {
        invalid: 'Incorrect code. Please try again.',
        expired: 'Code expired. Please request a new one.',
        max_attempts: 'Too many attempts. Please request a new code.',
      };
      return NextResponse.json({ error: msgs[result] || 'Verification failed' }, { status: 400 });
    }

    await logOtpVerified(email);

    // Tailored resumes are generated in a second step, so only hand back a session.
    if (resumeType === 'tailored') {
      return NextResponse.json({ ok: true, sessionToken: issueSessionToken(email) });
    }

    await sendResumeEmail(email, resumeType === 'detailed' ? 'detailed' : 'basic');

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('verify-otp error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

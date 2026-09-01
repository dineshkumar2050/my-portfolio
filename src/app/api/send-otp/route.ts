import { NextRequest, NextResponse } from 'next/server';
import { setOtp } from '@/lib/otpStore';
import { logOtpRequest } from '@/lib/analytics';

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpEmailHtml(otp: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#07101f;font-family:Inter,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#101e30;border-radius:16px;overflow:hidden;border:1px solid #1a2e46;">
    <div style="background:linear-gradient(135deg,#0d1f35,#1a1040);padding:32px;text-align:center;border-bottom:1px solid #1a2e46;">
      <div style="font-family:'JetBrains Mono',monospace;font-weight:800;font-size:1.3rem;color:#00d4ff;"><span style="color:#e2eeff;">DK</span>.dev</div>
      <p style="color:#6e869e;font-size:0.85rem;margin:8px 0 0;">Dinesh Kumar · Senior Software Engineer</p>
    </div>
    <div style="padding:36px;">
      <h2 style="color:#e2eeff;font-size:1.1rem;margin:0 0 12px;">Your verification code</h2>
      <p style="color:#6e869e;font-size:0.9rem;line-height:1.6;margin:0 0 28px;">Enter this code to verify your email and receive Dinesh Kumar's resume.</p>
      <div style="background:#07101f;border:2px solid #00d4ff33;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:2.5rem;font-weight:800;color:#00d4ff;letter-spacing:0.3em;">${otp}</div>
        <p style="color:#3a5066;font-size:0.78rem;margin:10px 0 0;">Valid for 10 minutes · Do not share this code</p>
      </div>
      <p style="color:#3a5066;font-size:0.8rem;margin:0;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div style="padding:20px 36px;border-top:1px solid #1a2e46;text-align:center;">
      <p style="color:#3a5066;font-size:0.75rem;margin:0;">Dinesh Kumar · +91 9560163362 · dinesh.kumar.199998888@gmail.com</p>
    </div>
  </div>
</body></html>`;
}

async function sendViaGmail(to: string, otp: string) {
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: `"Dinesh Kumar Portfolio" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your verification code — Dinesh Kumar's Portfolio",
    html: otpEmailHtml(otp),
  });
}

async function sendViaResend(to: string, otp: string) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  await resend.emails.send({
    from: fromEmail,
    to,
    subject: "Your verification code — Dinesh Kumar's Portfolio",
    html: otpEmailHtml(otp),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const otp = generateOtp();
    const otpToken = await setOtp(email, otp);
    await logOtpRequest(email);

    // Priority 1: Gmail SMTP (EMAIL_USER + EMAIL_APP_PASSWORD)
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      await sendViaGmail(email, otp);
      return NextResponse.json({ ok: true, otpToken });
    }

    // Priority 2: Resend (RESEND_API_KEY)
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_xxx')) {
      await sendViaResend(email, otp);
      return NextResponse.json({ ok: true, otpToken });
    }

    // Priority 3: Dev mode — return OTP in response so modal can display it
    console.log(`[DEV] OTP for ${email}: ${otp}`);
    return NextResponse.json({ ok: true, dev: true, otp, otpToken });

  } catch (err) {
    console.error('send-otp error:', err);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}

import { createResumePdf, type ResumeType } from '@/lib/resumePdf';

function resumeLabel(type: ResumeType) {
  return type === 'detailed' ? 'Detailed Resume' : 'Basic Resume';
}

function resumeEmailHtml(type: ResumeType) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#07101f;font-family:Inter,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#101e30;border-radius:16px;overflow:hidden;border:1px solid #1a2e46;">
    <div style="background:linear-gradient(135deg,#0d1f35,#1a1040);padding:32px;text-align:center;border-bottom:1px solid #1a2e46;">
      <div style="font-family:'JetBrains Mono',monospace;font-weight:800;font-size:1.3rem;color:#00d4ff;"><span style="color:#e2eeff;">DK</span>.dev</div>
      <p style="color:#6e869e;font-size:0.85rem;margin:8px 0 0;">Dinesh Kumar · Senior Software Engineer</p>
    </div>
    <div style="padding:36px;">
      <h2 style="color:#e2eeff;font-size:1.1rem;margin:0 0 12px;">Verified — resume attached</h2>
      <p style="color:#6e869e;font-size:0.9rem;line-height:1.6;margin:0 0 24px;">
        Thanks for your interest. Dinesh Kumar's ${resumeLabel(type)} is attached to this email as a PDF.
      </p>
      <div style="background:#07101f;border:1px solid #1a2e46;border-radius:10px;padding:18px 20px;">
        <p style="color:#6e869e;font-size:0.85rem;font-weight:700;margin:0 0 10px;">About Dinesh Kumar</p>
        <p style="color:#3a5066;font-size:0.82rem;line-height:1.5;margin:0;">Senior Software Engineer &amp; Team Lead · 8+ years · React, Node.js, NestJS, AWS, Kafka, Temporal · AI-powered developer tooling.</p>
      </div>
    </div>
    <div style="padding:20px 36px;border-top:1px solid #1a2e46;text-align:center;">
      <p style="color:#3a5066;font-size:0.75rem;margin:0;">+91 9560163362 · +91 8448724187 · dinesh.kumar.199998888@gmail.com</p>
    </div>
  </div>
</body></html>`;
}

async function sendViaGmail(to: string, type: ResumeType) {
  const resume = await createResumePdf(type);
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
    subject: `Dinesh Kumar's ${resumeLabel(type)}`,
    html: resumeEmailHtml(type),
    attachments: [
      {
        filename: resume.fileName,
        content: Buffer.from(resume.arrayBuffer),
        contentType: 'application/pdf',
      },
    ],
  });
}

async function sendViaResend(to: string, type: ResumeType) {
  const resume = await createResumePdf(type);
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Dinesh Kumar's ${resumeLabel(type)}`,
    html: resumeEmailHtml(type),
    attachments: [
      {
        filename: resume.fileName,
        content: Buffer.from(resume.arrayBuffer),
        contentType: 'application/pdf',
      },
    ],
  });
}

export async function sendResumeEmail(to: string, type: ResumeType) {
  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    await sendViaGmail(to, type);
    return;
  }

  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_xxx')) {
    await sendViaResend(to, type);
    return;
  }

  const resume = await createResumePdf(type);
  console.log(`[DEV] Resume email skipped for ${to}; generated attachment: ${resume.fileName}`);
}

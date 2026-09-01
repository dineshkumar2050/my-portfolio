import { NextRequest, NextResponse } from 'next/server';
import { logResumeDownload } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const { email, type, verified } = await req.json();
    const safeEmail = typeof email === 'string' && email.includes('@') ? email : 'anonymous';
    const safeType = type === 'detailed' ? 'detailed' : 'basic';
    await logResumeDownload(safeEmail, safeType, Boolean(verified));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('log-download error:', err);
    return NextResponse.json({ error: 'Logging failed' }, { status: 500 });
  }
}

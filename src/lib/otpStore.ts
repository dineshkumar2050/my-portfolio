import { createHmac, timingSafeEqual } from 'crypto';

interface OtpEntry {
  otpHash: string;
  expiry: number;   // ms timestamp
  email: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getOtpSecret() {
  return (
    process.env.OTP_SIGNING_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.OPENAI_API_KEY ||
    process.env.EMAIL_APP_PASSWORD ||
    'local-dev-otp-secret'
  );
}

function hashOtp(email: string, otp: string) {
  return createHmac('sha256', getOtpSecret())
    .update(`${normalizeEmail(email)}:${otp}`)
    .digest('base64url');
}

function signPayload(payload: string) {
  return createHmac('sha256', getOtpSecret()).update(payload).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function encodeToken(entry: OtpEntry) {
  const payload = Buffer.from(JSON.stringify(entry)).toString('base64url');
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function decodeToken(token: string): OtpEntry | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, signPayload(payload))) return null;

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as OtpEntry;
  } catch {
    return null;
  }
}

export async function setOtp(email: string, otp: string): Promise<string> {
  return encodeToken({
    email: normalizeEmail(email),
    otpHash: hashOtp(email, otp),
    expiry: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
}

export async function verifyOtp(email: string, otp: string, token?: string): Promise<'ok' | 'invalid' | 'expired' | 'max_attempts'> {
  if (!token) return 'invalid';

  const entry = decodeToken(token);
  if (!entry) return 'invalid';
  if (Date.now() > entry.expiry) return 'expired';
  if (entry.email !== normalizeEmail(email)) return 'invalid';
  if (!safeEqual(entry.otpHash, hashOtp(email, otp))) return 'invalid';

  return 'ok';
}

export async function isVerified(email: string): Promise<boolean> {
  return false;
}

export async function clearOtp(email: string) {
  return;
}

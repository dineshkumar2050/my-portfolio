import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

const STORE_DIR = path.join(process.cwd(), 'data', 'otp-store');
const STORE_FILE = path.join(STORE_DIR, 'otps.json');

interface OtpEntry {
  otpHash: string;
  expiry: number;   // ms timestamp
  attempts: number;
  verified: boolean;
}

type OtpStore = Record<string, OtpEntry>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashOtp(email: string, otp: string) {
  return createHash('sha256')
    .update(`${normalizeEmail(email)}:${otp}`)
    .digest('hex');
}

async function readStore(): Promise<OtpStore> {
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf8');
    return JSON.parse(raw) as OtpStore;
  } catch {
    return {};
  }
}

async function writeStore(store: OtpStore) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function pruneExpired(store: OtpStore) {
  const now = Date.now();
  for (const [email, entry] of Object.entries(store)) {
    if (now > entry.expiry) delete store[email];
  }
}

export async function setOtp(email: string, otp: string) {
  const store = await readStore();
  pruneExpired(store);
  store[normalizeEmail(email)] = {
    otpHash: hashOtp(email, otp),
    expiry: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
    verified: false,
  };
  await writeStore(store);
}

export async function verifyOtp(email: string, otp: string): Promise<'ok' | 'invalid' | 'expired' | 'max_attempts'> {
  const key = normalizeEmail(email);
  const store = await readStore();
  const entry = store[key];
  if (!entry) return 'invalid';
  if (Date.now() > entry.expiry) {
    delete store[key];
    await writeStore(store);
    return 'expired';
  }
  if (entry.attempts >= 5) return 'max_attempts';
  entry.attempts++;
  if (entry.otpHash !== hashOtp(email, otp)) {
    await writeStore(store);
    return 'invalid';
  }
  entry.verified = true;
  await writeStore(store);
  return 'ok';
}

export async function isVerified(email: string): Promise<boolean> {
  const store = await readStore();
  return store[normalizeEmail(email)]?.verified === true;
}

export async function clearOtp(email: string) {
  const store = await readStore();
  delete store[normalizeEmail(email)];
  await writeStore(store);
}

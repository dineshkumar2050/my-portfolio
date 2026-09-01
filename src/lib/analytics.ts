import { promises as fs } from 'fs';
import path from 'path';

// NOTE: file-based analytics works for local / single-server deployments.
// For Vercel/serverless, the filesystem is read-only — switch to a DB or KV store.

const DIR = path.join(process.cwd(), 'data', 'analytics');
const OTP_JSON = path.join(DIR, 'otp-requests.json');
const OTP_TXT  = path.join(DIR, 'otp-requests.txt');
const DL_JSON  = path.join(DIR, 'resume-downloads.json');
const DL_TXT   = path.join(DIR, 'resume-downloads.txt');

interface OtpRecord {
  email: string;
  firstRequestAt: string;
  lastRequestAt: string;
  requestCount: number;
  verified: boolean;
  verifiedAt?: string;
}

interface DownloadRecord {
  email: string;
  firstDownloadAt: string;
  lastDownloadAt: string;
  downloadCount: number;
  basicCount: number;
  detailedCount: number;
  verifiedEmail: boolean;
}

function nowLabel() {
  return new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

async function appendTxt(file: string, line: string) {
  await fs.appendFile(file, line + '\n', 'utf8');
}

export async function logOtpRequest(email: string) {
  try {
    const records = await readJson<OtpRecord[]>(OTP_JSON, []);
    const now = new Date().toISOString();
    const idx = records.findIndex((r) => r.email === email);
    if (idx >= 0) {
      records[idx].lastRequestAt = now;
      records[idx].requestCount += 1;
    } else {
      records.push({ email, firstRequestAt: now, lastRequestAt: now, requestCount: 1, verified: false });
    }
    await writeJson(OTP_JSON, records);
    await appendTxt(OTP_TXT, `[${nowLabel()}]  OTP_REQUESTED   ${email}`);
  } catch (err) {
    console.error('[analytics] logOtpRequest failed:', err);
  }
}

export async function logOtpVerified(email: string) {
  try {
    const records = await readJson<OtpRecord[]>(OTP_JSON, []);
    const now = new Date().toISOString();
    const idx = records.findIndex((r) => r.email === email);
    if (idx >= 0) {
      records[idx].verified = true;
      records[idx].verifiedAt = now;
    } else {
      records.push({ email, firstRequestAt: now, lastRequestAt: now, requestCount: 1, verified: true, verifiedAt: now });
    }
    await writeJson(OTP_JSON, records);
    await appendTxt(OTP_TXT, `[${nowLabel()}]  OTP_VERIFIED    ${email}`);
  } catch (err) {
    console.error('[analytics] logOtpVerified failed:', err);
  }
}

export async function logResumeDownload(email: string, type: string, verified: boolean) {
  try {
    const records = await readJson<DownloadRecord[]>(DL_JSON, []);
    const now = new Date().toISOString();
    const idx = records.findIndex((r) => r.email === email);
    let downloadCount = 1;
    if (idx >= 0) {
      records[idx].lastDownloadAt = now;
      records[idx].downloadCount += 1;
      downloadCount = records[idx].downloadCount;
      if (type === 'basic') records[idx].basicCount += 1;
      else records[idx].detailedCount += 1;
    } else {
      records.push({
        email,
        firstDownloadAt: now,
        lastDownloadAt: now,
        downloadCount: 1,
        basicCount: type === 'basic' ? 1 : 0,
        detailedCount: type === 'detailed' ? 1 : 0,
        verifiedEmail: verified,
      });
    }
    await writeJson(DL_JSON, records);
    const tag = verified ? 'verified' : 'skipped';
    await appendTxt(
      DL_TXT,
      `[${nowLabel()}]  DOWNLOAD  ${email.padEnd(38)}  ${type.padEnd(8)}  #${downloadCount} (${tag})`
    );
  } catch (err) {
    console.error('[analytics] logResumeDownload failed:', err);
  }
}

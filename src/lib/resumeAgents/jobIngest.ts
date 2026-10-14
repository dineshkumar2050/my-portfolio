import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { detectPlatform, platformLabel } from '@/data/jobPlatforms';

// Job Scout's tooling: fetch a job URL safely and pull the job description out of it.
// Sources are tried cheapest-first: free platform APIs (LinkedIn, Naukri) → plain fetch →
// scraping APIs on their free tiers (Apify, ScrapingBee, ScraperAPI — only those with keys).
// If all of them fail or run out of credits, the visitor is asked to paste the JD instead.

export class JobFetchError extends Error {}

export interface JobPosting {
  source: 'url' | 'text';
  url?: string;
  title?: string;
  company?: string;
  via?: string; // which source read the page
  text: string;
}

const MAX_HTML_BYTES = 1_500_000;
const MAX_TEXT_CHARS = 15_000;
const MIN_TEXT_CHARS = 250;
const FETCH_TIMEOUT_MS = 9_000;
const MAX_REDIRECTS = 4;

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-IN,en;q=0.9',
};

function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith('::ffff:')) return isPrivateAddress(v6.slice(7));
  return v6 === '::' || v6 === '::1' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80');
}

async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new JobFetchError('That job URL is not valid.');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new JobFetchError('Only http(s) job URLs are supported.');
  if (url.username || url.password) throw new JobFetchError('That job URL is not valid.');
  if (url.port && url.port !== '80' && url.port !== '443') throw new JobFetchError('That job URL is not valid.');

  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true }).catch(() => [])).map((a) => a.address);
  if (!addresses.length) throw new JobFetchError('Could not reach that job URL. Please check the link or paste the job description.');
  if (addresses.some(isPrivateAddress)) throw new JobFetchError('That job URL is not allowed.');
  return url;
}

async function fetchHtml(raw: string): Promise<{ html: string; finalUrl: string; status: number }> {
  let current = raw;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicUrl(current);
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: BROWSER_HEADERS,
    }).catch(() => {
      throw new JobFetchError('The job site did not respond in time. Please paste the job description instead.');
    });

    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, url).toString();
      continue;
    }

    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_HTML_BYTES) { await reader.cancel(); break; }
      chunks.push(value);
    }
    return { html: Buffer.concat(chunks).toString('utf8'), finalUrl: url.toString(), status: res.status };
  }
  throw new JobFetchError('The job URL redirected too many times. Please paste the job description instead.');
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg|head|nav|footer|iframe)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/(p|div|li|ul|ol|h[1-6]|section|tr)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (m, e: string) => {
      if (e[0] === '#') {
        const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : ' ';
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/[ \t\f\v\r]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

type JsonLdNode = Record<string, unknown>;

function findJobPosting(node: unknown): JsonLdNode | null {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findJobPosting(item);
      if (found) return found;
    }
    return null;
  }
  const obj = node as JsonLdNode;
  const type = obj['@type'];
  if (type === 'JobPosting' || (Array.isArray(type) && type.includes('JobPosting'))) return obj;
  return findJobPosting(obj['@graph']);
}

function fromJsonLd(html: string): Omit<JobPosting, 'source'> | null {
  const scripts = Array.from(html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
  for (const [, body] of scripts) {
    let parsed: unknown;
    try { parsed = JSON.parse(body.trim()); } catch { continue; }
    const job = findJobPosting(parsed);
    if (!job) continue;

    const org = job.hiringOrganization as JsonLdNode | string | undefined;
    const asText = (v: unknown) => (typeof v === 'string' ? htmlToText(v) : Array.isArray(v) ? v.filter((x) => typeof x === 'string').join(', ') : '');
    const parts = [
      asText(job.description),
      job.skills ? `Skills: ${asText(job.skills)}` : '',
      job.qualifications ? `Qualifications: ${asText(job.qualifications)}` : '',
      job.experienceRequirements ? `Experience: ${asText(typeof job.experienceRequirements === 'object' && !Array.isArray(job.experienceRequirements) ? (job.experienceRequirements as JsonLdNode).description : job.experienceRequirements)}` : '',
    ].filter(Boolean);

    return {
      title: typeof job.title === 'string' ? htmlToText(job.title) : undefined,
      company: typeof org === 'string' ? org : typeof org?.name === 'string' ? org.name : undefined,
      text: parts.join('\n'),
    };
  }
  return null;
}

function metaContent(html: string, key: string) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i');
  return html.match(re)?.[1];
}

// ── Page parsing ────────────────────────────────────────────────────────────

class SourceFailed extends Error {}

/** Pulls the posting out of a job page's HTML (JSON-LD first, then known containers, then all text). */
function parsePage(html: string, finalUrl: string, via: string): JobPosting {
  const structured = fromJsonLd(html);
  if (structured && structured.text.length >= MIN_TEXT_CHARS) {
    return { source: 'url', url: finalUrl, via, ...structured, text: structured.text.slice(0, MAX_TEXT_CHARS) };
  }

  // Indeed renders the JD inside #jobDescriptionText.
  const marker = html.indexOf('id="jobDescriptionText"');
  const container = marker >= 0 ? htmlToText(html.slice(html.lastIndexOf('<', marker), marker + 60_000)).slice(0, 10_000) : '';
  const text = container.length >= MIN_TEXT_CHARS ? container : htmlToText(html);

  const looksBlocked = /captcha|just a moment|access denied|cf-challenge|authwall|sign in to view|enable javascript/i.test(html.slice(0, 50_000));
  if (text.length < MIN_TEXT_CHARS || (looksBlocked && text.length < 2_000)) throw new SourceFailed('page blocked or empty');

  const title = metaContent(html, 'og:title') || html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  return { source: 'url', url: finalUrl, via, title: title ? htmlToText(title) : undefined, text: text.slice(0, MAX_TEXT_CHARS) };
}

async function readResponse(res: Response, provider: string): Promise<string> {
  if (!res.ok) throw new SourceFailed(`${provider} HTTP ${res.status}`);
  return (await res.text()).slice(0, MAX_HTML_BYTES);
}

// ── Sources (tried in order until one returns a readable posting) ───────────

/** 1a. LinkedIn's public guest endpoint — free, no login. */
async function viaLinkedInApi(url: string): Promise<JobPosting> {
  const id = url.match(/(?:currentJobId=|\/jobs\/view\/(?:[^/?#]*-)?)(\d{6,})/)?.[1];
  if (!id) throw new SourceFailed('no LinkedIn job id in URL');

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(`https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${id}`, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (res.status === 429 && attempt === 0) { await new Promise((r) => setTimeout(r, 1_500)); continue; }
    const html = await readResponse(res, 'LinkedIn');
    const description = html.match(/class="show-more-less-html__markup[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    const text = description ? htmlToText(description) : '';
    if (text.length < MIN_TEXT_CHARS) throw new SourceFailed('LinkedIn returned no description');
    const pick = (re: RegExp) => { const m = html.match(re)?.[1]; return m ? htmlToText(m) : undefined; };
    return {
      source: 'url', url, via: 'LinkedIn',
      title: pick(/top-card-layout__title[^>]*>([^<]+)/),
      company: pick(/topcard__org-name-link[^>]*>([^<]+)/),
      text: text.slice(0, MAX_TEXT_CHARS),
    };
  }
  throw new SourceFailed('LinkedIn rate-limited');
}

/** 1b. Naukri's own job API (the one its website calls) — free, needs its app headers. */
async function viaNaukriApi(url: string): Promise<JobPosting> {
  const id = url.match(/-(\d{10,14})(?:[/?#]|$)/)?.[1] ?? new URL(url).searchParams.get('jobId');
  if (!id) throw new SourceFailed('no Naukri job id in URL');

  const res = await fetch(`https://www.naukri.com/jobapi/v4/job/${id}?microsite=y`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { ...BROWSER_HEADERS, Accept: 'application/json', appid: '121', systemid: 'Naukri', clientid: 'd3skt0p' },
  });
  if (!res.ok) throw new SourceFailed(`Naukri HTTP ${res.status}`);
  const job = (await res.json())?.jobDetails;
  if (typeof job?.description !== 'string') throw new SourceFailed('Naukri returned no description (job may have expired)');

  const skills = [...(job.keySkills?.preferred ?? []), ...(job.keySkills?.other ?? [])]
    .map((s: { label?: string }) => s?.label)
    .filter(Boolean);
  const text = [
    htmlToText(job.description),
    skills.length ? `Key skills: ${skills.join(', ')}` : '',
    typeof job.experienceText === 'string' ? `Experience: ${job.experienceText}` : '',
  ].filter(Boolean).join('\n');
  if (text.length < MIN_TEXT_CHARS) throw new SourceFailed('Naukri description too short');

  return { source: 'url', url, via: 'Naukri', title: job.title, company: job.companyDetail?.name, text: text.slice(0, MAX_TEXT_CHARS) };
}

/** 2. Plain fetch of the page — works for most company career pages. */
async function viaDirect(url: string): Promise<JobPosting> {
  const { html, finalUrl, status } = await fetchHtml(url);
  if (status >= 400) throw new SourceFailed(`HTTP ${status}`);
  return parsePage(html, finalUrl, 'direct');
}

/** 3. Apify Indeed scraper (pay-per-result, ~$0.003/job; the free plan's monthly credit covers light use). ~8s. */
async function viaApify(url: string, token: string): Promise<JobPosting> {
  const actor = process.env.APIFY_INDEED_ACTOR || 'misceres~indeed-scraper';
  const res = await fetch(`https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?timeout=50`, {
    method: 'POST',
    signal: AbortSignal.timeout(58_000),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startUrls: [{ url }], maxItemsPerSearch: 1, parseCompanyDetails: false, saveOnlyUniqueItems: true }),
  });
  if (res.status === 402) throw new SourceFailed('Apify credits exhausted');
  if (!res.ok) throw new SourceFailed(`Apify HTTP ${res.status}`);
  const [item] = (await res.json()) as { positionName?: string; company?: string; description?: string }[];
  if (!item?.description || item.description.length < MIN_TEXT_CHARS) throw new SourceFailed('Apify returned no description');
  return { source: 'url', url, via: 'Apify', title: item.positionName, company: item.company, text: item.description.slice(0, MAX_TEXT_CHARS) };
}

/** 4. ScrapingBee — `mode=auto` escalates proxies itself and only bills the attempt that succeeds. */
async function viaScrapingBee(url: string, key: string): Promise<JobPosting> {
  const res = await fetch(`https://app.scrapingbee.com/api/v1?${new URLSearchParams({ url, mode: 'auto' })}`, {
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(40_000),
  });
  return parsePage(await readResponse(res, 'ScrapingBee'), url, 'ScrapingBee'); // 401 = invalid key / no credits
}

/** 5. ScraperAPI — only 200/404 responses are billed; 403 means credits are used up. Not used for Indeed. */
async function viaScraperApi(url: string, key: string, hardSite: boolean): Promise<JobPosting> {
  const params = new URLSearchParams({ api_key: key, url });
  if (hardSite) params.set('premium', 'true');
  const res = await fetch(`https://api.scraperapi.com/?${params}`, { signal: AbortSignal.timeout(50_000) });
  if (res.status === 403) throw new SourceFailed('ScraperAPI credits exhausted');
  return parsePage(await readResponse(res, 'ScraperAPI'), url, 'ScraperAPI');
}

function indeedJobKey(url: URL) {
  const jk = url.searchParams.get('jk') || url.searchParams.get('vjk');
  return jk && /^[a-f0-9]{10,20}$/i.test(jk) ? jk : null;
}

/** Share links (to.indeed.com/…) only reveal the job key after redirects — follow Location headers without reading pages. */
async function resolveShareLink(url: URL): Promise<URL> {
  let current = url;
  for (let hop = 0; hop < MAX_REDIRECTS && !indeedJobKey(current); hop++) {
    const res = await fetch(current, { method: 'GET', redirect: 'manual', headers: BROWSER_HEADERS, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).catch(() => null);
    await res?.body?.cancel();
    const location = res?.headers.get('location');
    if (!location) break;
    current = await assertPublicUrl(new URL(location, current).toString());
  }
  return current;
}

/** Indeed links carry the job key in `jk`/`vjk`; the canonical viewjob page is the one scrapers handle best. */
async function normalizeJobUrl(url: URL, platform: string): Promise<string> {
  if (platform !== 'indeed') return url.toString();
  const resolved = indeedJobKey(url) ? url : await resolveShareLink(url);
  const jk = indeedJobKey(resolved);
  const host = resolved.hostname.endsWith('indeed.com') && resolved.hostname !== 'to.indeed.com' ? resolved.hostname : 'in.indeed.com';
  return jk ? `https://${host}/viewjob?jk=${jk}` : url.toString();
}

const SCOUT_BUDGET_MS = 100_000; // leave the rest of the function's time for the writing agents

export async function fetchJobPosting(rawUrl: string, selectedPlatform: string): Promise<JobPosting> {
  const parsed = await assertPublicUrl(rawUrl);
  const platform = detectPlatform(parsed.toString()) ?? selectedPlatform;
  const url = await normalizeJobUrl(parsed, platform);
  const hardSite = platform === 'glassdoor' || platform === 'linkedin';

  const apifyToken = process.env.APIFY_API_TOKEN;
  const beeKey = process.env.SCRAPINGBEE_API_KEY;
  const scraperKey = process.env.SCRAPERAPI_KEY;

  const sources: { name: string; run: () => Promise<JobPosting> }[] = [
    ...(platform === 'linkedin' ? [{ name: 'LinkedIn API', run: () => viaLinkedInApi(url) }] : []),
    ...(platform === 'naukri' ? [{ name: 'Naukri API', run: () => viaNaukriApi(url) }] : []),
    { name: 'direct', run: () => viaDirect(url) },
    ...(apifyToken && platform === 'indeed' ? [{ name: 'Apify', run: () => viaApify(url, apifyToken) }] : []),
    ...(beeKey ? [{ name: 'ScrapingBee', run: () => viaScrapingBee(url, beeKey) }] : []),
    // ScraperAPI's free plan can't get past Indeed (needs paid ultra_premium) — don't make visitors wait ~60s for a sure failure.
    ...(scraperKey && platform !== 'indeed' ? [{ name: 'ScraperAPI', run: () => viaScraperApi(url, scraperKey, hardSite) }] : []),
  ];

  const started = Date.now();
  const failures: string[] = [];
  for (const source of sources) {
    if (Date.now() - started > SCOUT_BUDGET_MS) { failures.push(`${source.name}: skipped (time budget)`); continue; }
    try {
      return await source.run();
    } catch (err) {
      failures.push(`${source.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.warn('[job-scout] every source failed for', url, failures);
  const site = platformLabel(platform);
  throw new JobFetchError(`${site === 'Other' ? 'This site' : site} blocked automated access or requires a login, so the job couldn't be read automatically. Please copy the job description from the page and paste it instead.`);
}

export function postingFromText(text: string): JobPosting {
  return { source: 'text', text: text.trim().slice(0, MAX_TEXT_CHARS) };
}

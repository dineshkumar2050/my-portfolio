// Shared by the tailored-resume modal (dropdown + auto-detect) and the Job Scout agent.

export const JOB_PLATFORMS = [
  { id: 'naukri', label: 'Naukri', hosts: ['naukri.com'] },
  { id: 'linkedin', label: 'LinkedIn', hosts: ['linkedin.com'] },
  { id: 'indeed', label: 'Indeed', hosts: ['indeed.com', 'indeed.co.in'] },
  { id: 'glassdoor', label: 'Glassdoor', hosts: ['glassdoor.com', 'glassdoor.co.in'] },
  { id: 'wellfound', label: 'Wellfound (AngelList)', hosts: ['wellfound.com', 'angel.co'] },
  { id: 'instahyre', label: 'Instahyre', hosts: ['instahyre.com'] },
  { id: 'foundit', label: 'Foundit (Monster)', hosts: ['foundit.in', 'monsterindia.com'] },
  { id: 'company', label: 'Company careers page', hosts: ['greenhouse.io', 'lever.co', 'workday.com', 'myworkdayjobs.com', 'ashbyhq.com', 'smartrecruiters.com'] },
  { id: 'other', label: 'Other', hosts: [] },
] as const;

export type JobPlatformId = (typeof JOB_PLATFORMS)[number]['id'];

export const JOB_PLATFORM_IDS = JOB_PLATFORMS.map((p) => p.id) as JobPlatformId[];

export function detectPlatform(url: string): JobPlatformId | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const match = JOB_PLATFORMS.find((p) => p.hosts.some((h) => host === h || host.endsWith(`.${h}`)));
    return match?.id ?? null;
  } catch {
    return null;
  }
}

export function platformLabel(id: string) {
  return JOB_PLATFORMS.find((p) => p.id === id)?.label ?? 'Other';
}

'use client';
import { useState } from 'react';
import OtpVerification from '@/components/OtpVerification';
import { detectPlatform, JOB_PLATFORMS, type JobPlatformId } from '@/data/jobPlatforms';

type Step = 'email' | 'otp' | 'job' | 'generating' | 'confirm' | 'done';
type InputMode = 'url' | 'text';

interface Props {
  onClose: () => void;
}

interface AgentStep {
  node: string;
  name: string;
  task: string;
  deps: string[];
  parallel?: boolean;
  multi?: boolean; // runs as N parallel instances (count arrives in the previous step's "expect")
  optional?: boolean; // hidden unless it actually runs
}

// Mirrors the LangGraph topology in src/lib/resumeAgents/graph.ts.
const AGENTS: AgentStep[] = [
  { node: 'jobScout', name: 'Job Scout', task: 'Reading the job posting', deps: [] },
  { node: 'jdAnalyst', name: 'JD Analyst', task: 'Extracting requirements & ATS keywords', deps: ['jobScout'] },
  { node: 'fitAssessor', name: 'Fit Assessor', task: "Measuring how well Dinesh's profile fits", deps: ['jdAnalyst'] },
  { node: 'summaryWriter', name: 'Summary Writer', task: 'Writing a role-targeted summary', deps: ['fitAssessor'], parallel: true },
  { node: 'skillsCurator', name: 'Skills Curator', task: 'Matching skills to the JD', deps: ['fitAssessor'], parallel: true },
  { node: 'projectWriter', name: 'Project Writers', task: 'Tailoring each featured project', deps: ['fitAssessor'], parallel: true, multi: true },
  { node: 'factChecker', name: 'Fact Checkers', task: 'Verifying every section against the profile', deps: ['reviewPlanner'], parallel: true, multi: true },
  { node: 'reviewJoin', name: 'ATS Reviewer', task: 'Combining findings & keyword match', deps: ['factChecker'] },
  { node: 'sectionEditor', name: 'Section Editors', task: 'Fixing flagged sections', deps: ['reviewJoin'], parallel: true, multi: true, optional: true },
  { node: 'deliver', name: 'Delivery', task: 'Rendering the PDF & emailing it', deps: ['finalize'] },
];

const MIN_JD = 200;
const MAX_JD = 20000;
const ACCENT = '#10b981';

interface LowFit {
  roleTitle: string;
  company: string;
  fit: { score: number; skillScore: number; semanticScore: number; missingTop: string[] };
  preparedToken: string;
}

interface GenerateRequest {
  jobUrl?: string;
  jobText?: string;
  platform: string;
  preparedToken?: string;
}

interface Result {
  roleTitle: string;
  company: string;
  coverage: { score: number; matched: string[]; missing: string[] };
}

const labelStyle = { fontSize: '0.78rem', fontWeight: 700, color: '#3a5066', textTransform: 'uppercase' as const, letterSpacing: '0.06em', display: 'block', marginBottom: 8 };
const fieldStyle = {
  width: '100%', boxSizing: 'border-box' as const,
  background: '#07101f', border: '1px solid #1a2e46',
  borderRadius: 10, padding: '12px 16px', color: '#e2eeff',
  fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit',
};

export default function TailoredResumeModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [sessionToken, setSessionToken] = useState('');

  const [mode, setMode] = useState<InputMode>('url');
  const [jobUrl, setJobUrl] = useState('');
  const [platform, setPlatform] = useState<JobPlatformId>('naukri');
  const [platformTouched, setPlatformTouched] = useState(false);
  const [jobText, setJobText] = useState('');
  const [error, setError] = useState('');

  // Progress per agent: how many instances finished, how many are expected (parallel fan-outs), latest detail.
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [expected, setExpected] = useState<Record<string, number>>({});
  const [details, setDetails] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [lowFit, setLowFit] = useState<LowFit | null>(null);

  const onUrlChange = (value: string) => {
    setJobUrl(value);
    setError('');
    const detected = detectPlatform(value);
    if (detected && !platformTouched) setPlatform(detected);
  };

  const validate = () => {
    // A link pasted into the description box: move it to the URL tab instead of rejecting it.
    if (mode === 'text' && /^https?:\/\/\S+$/i.test(jobText.trim())) {
      onUrlChange(jobText.trim());
      setMode('url');
      return 'That looks like a link, so we moved it to the Job URL tab. Check the platform and click Generate again.';
    }
    if (mode === 'url') {
      try {
        const u = new URL(jobUrl.trim());
        if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
      } catch {
        return 'Please enter a valid job URL (starting with https://).';
      }
    } else if (jobText.trim().length < MIN_JD) {
      return `Please paste the full job description (at least ${MIN_JD} characters).`;
    }
    return '';
  };

  /** `request` is passed when the visitor confirms a low-fit role (re-uses the already-extracted JD). */
  const generate = async (request?: GenerateRequest) => {
    if (!request) {
      const problem = validate();
      if (problem) { setError(problem); return; }
    }
    const payload: GenerateRequest = request ?? (mode === 'url' ? { jobUrl: jobUrl.trim(), platform } : { jobText: jobText.trim(), platform: 'other' });

    setError(''); setCounts({}); setExpected({}); setDetails({}); setResult(null); setLowFit(null);
    setStep('generating');

    try {
      const res = await fetch('/api/tailored-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, ...payload }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) { setSessionToken(''); setStep('email'); }
        throw new Error(data.error || 'Could not start resume generation.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finished = false;

      while (!finished) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.type === 'step') {
            setCounts((prev) => ({ ...prev, [event.node]: (prev[event.node] ?? 0) + 1 }));
            if (event.detail) setDetails((prev) => ({ ...prev, [event.node]: event.detail }));
            if (event.expect) setExpected((prev) => ({ ...prev, ...event.expect }));
          } else if (event.type === 'confirm') {
            setLowFit(event);
            setStep('confirm');
            finished = true;
          } else if (event.type === 'done') {
            setResult(event);
            setStep('done');
            finished = true;
          } else if (event.type === 'error') {
            throw new Error(event.message);
          }
        }
      }
      if (!finished) throw new Error('The connection closed before the resume was ready. Please try again.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setStep((s) => (s === 'email' ? s : 'job'));
    }
  };

  const isDone = (node: string) => (counts[node] ?? 0) >= (expected[node] ?? 1) && (counts[node] ?? 0) > 0;
  const status = (agent: AgentStep): 'done' | 'running' | 'waiting' => {
    if (isDone(agent.node)) return 'done';
    return agent.deps.every(isDone) ? 'running' : 'waiting';
  };
  const progressLabel = (agent: AgentStep) => (agent.multi && expected[agent.node] ? ` ${counts[agent.node] ?? 0}/${expected[agent.node]}` : '');

  const visibleAgents = AGENTS.filter((a) => !a.optional || (expected[a.node] ?? 0) > 0);

  const title = {
    email: 'Verify your email',
    otp: 'Check your email',
    job: 'Tell us about the job',
    generating: 'Agents at work…',
    confirm: 'Lower profile fit',
    done: '✓ Resume sent!',
  }[step];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(7,16,31,0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && (step === 'email' || step === 'job' || step === 'confirm' || step === 'done') && onClose()}
    >
      <div style={{
        background: '#101e30', border: '1px solid #1a2e46', borderRadius: 20,
        padding: 'clamp(22px, 5vw, 36px)', maxWidth: 560, width: '100%',
        maxHeight: 'calc(100vh - 32px)', overflowY: 'auto',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              ✨ AI Tailored Resume
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e2eeff' }}>{title}</div>
          </div>
          <button
            onClick={onClose}
            disabled={step === 'generating'}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #1f3858', borderRadius: 8, width: 34, height: 34, color: '#6e869e', cursor: step === 'generating' ? 'not-allowed' : 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >✕</button>
        </div>

        {(step === 'email' || step === 'otp') && (
          <>
            {error && <p style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: 14 }}>{error}</p>}
            <OtpVerification
              resumeType="tailored"
              accent={ACCENT}
              intro="First, verify your email. Then share the job you're hiring for — AI agents will tailor Dinesh's resume to it and email you the PDF."
              verifyLabel="Verify & continue"
              onStepChange={setStep}
              onVerified={(verifiedEmail, data) => {
                if (!data.sessionToken) return;
                setEmail(verifiedEmail);
                setSessionToken(data.sessionToken);
                setError('');
                setStep('job');
              }}
            />
          </>
        )}

        {step === 'job' && (
          <>
            <p style={{ color: '#6e869e', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 18 }}>
              Verified as <strong style={{ color: '#e2eeff' }}>{email}</strong>. Share a job link or paste the job description.
            </p>

            {/* Tabs */}
            <div role="tablist" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: '#07101f', border: '1px solid #1a2e46', borderRadius: 10, padding: 4, marginBottom: 18 }}>
              {([['url', '🔗 Job URL'], ['text', '📝 Paste job description']] as const).map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={mode === id}
                  onClick={() => { setMode(id); setError(''); }}
                  style={{
                    padding: '9px 8px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '0.84rem', fontWeight: 700,
                    background: mode === id ? 'rgba(16,185,129,0.15)' : 'transparent',
                    color: mode === id ? ACCENT : '#6e869e',
                  }}
                >{label}</button>
              ))}
            </div>

            {mode === 'url' ? (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label htmlFor="job-url" style={labelStyle}>Job posting URL</label>
                  <input
                    id="job-url"
                    type="url"
                    value={jobUrl}
                    onChange={(e) => onUrlChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && generate()}
                    placeholder="https://www.naukri.com/job-listings-…"
                    style={fieldStyle}
                    autoFocus
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label htmlFor="job-platform" style={labelStyle}>Platform</label>
                  <select
                    id="job-platform"
                    value={platform}
                    onChange={(e) => { setPlatform(e.target.value as JobPlatformId); setPlatformTouched(true); }}
                    style={{ ...fieldStyle, cursor: 'pointer', appearance: 'auto' }}
                  >
                    {JOB_PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <p style={{ color: '#3a5066', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: 16 }}>
                  We&apos;ll try the job board&apos;s API and several reader services. Some boards still block automated access — if so, you&apos;ll be asked to paste the description instead.
                </p>
              </>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="job-text" style={labelStyle}>Job description</label>
                <textarea
                  id="job-text"
                  value={jobText}
                  onChange={(e) => { setJobText(e.target.value.slice(0, MAX_JD)); setError(''); }}
                  placeholder="Paste the full JD — role, responsibilities, requirements, skills…"
                  rows={9}
                  style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5, minHeight: 160 }}
                  autoFocus
                />
                <div style={{ textAlign: 'right', fontSize: '0.74rem', color: jobText.trim().length < MIN_JD ? '#3a5066' : ACCENT, marginTop: 4 }}>
                  {jobText.trim().length.toLocaleString()} / {MAX_JD.toLocaleString()} {jobText.trim().length < MIN_JD && `· min ${MIN_JD}`}
                </div>
              </div>
            )}

            {error && <p style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: 12, lineHeight: 1.5 }}>{error}</p>}

            <button
              onClick={() => generate()}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
                fontWeight: 800, fontSize: '0.95rem', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              ✨ Generate & email tailored resume
            </button>
            <p style={{ color: '#3a5066', fontSize: '0.75rem', lineHeight: 1.5, marginTop: 12, textAlign: 'center' }}>
              Agents tailor Dinesh&apos;s real experience to the role — employers, titles, dates and achievements are never invented.
            </p>
          </>
        )}

        {step === 'generating' && (
          <>
            <p style={{ color: '#6e869e', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: 18 }}>
              This usually takes 20–40 seconds (up to a minute or two when a job board is hard to read). Keep this window open.
            </p>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visibleAgents.map((agent) => {
                const s = status(agent);
                return (
                  <li
                    key={agent.node}
                    style={{
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      padding: '10px 12px', borderRadius: 10,
                      marginLeft: agent.parallel ? 18 : 0,
                      background: s === 'running' ? 'rgba(16,185,129,0.08)' : '#07101f',
                      border: `1px solid ${s === 'running' ? 'rgba(16,185,129,0.3)' : '#1a2e46'}`,
                      opacity: s === 'waiting' ? 0.5 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    <span aria-hidden style={{ width: 18, textAlign: 'center', color: s === 'done' ? ACCENT : '#6e869e', fontWeight: 800 }}>
                      {s === 'done' ? '✓' : s === 'running' ? <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> : '•'}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#e2eeff' }}>
                        {agent.name}{progressLabel(agent)}
                        {agent.parallel && <span style={{ marginLeft: 8, fontSize: '0.64rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em' }}>parallel</span>}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: '#6e869e', marginTop: 2, overflowWrap: 'anywhere' }}>
                        {details[agent.node] || agent.task}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </>
        )}

        {step === 'confirm' && lowFit && (
          <>
            <p style={{ color: '#e2eeff', fontWeight: 700, fontSize: '0.98rem', marginBottom: 6, overflowWrap: 'anywhere' }}>
              {lowFit.roleTitle}{lowFit.company && <span style={{ color: '#6e869e' }}> · {lowFit.company}</span>}
            </p>
            <div style={{ background: '#07101f', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 12, padding: 16, margin: '12px 0 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#9cb3c7', marginBottom: 8 }}>
                <span>Profile fit</span>
                <span style={{ color: '#f59e0b' }}>{lowFit.fit.score}%</span>
              </div>
              <div style={{ height: 6, background: '#1a2e46', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ width: `${lowFit.fit.score}%`, height: '100%', background: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '0.76rem', color: '#6e869e', marginBottom: lowFit.fit.missingTop.length ? 10 : 0 }}>
                Skills match {lowFit.fit.skillScore}% · Experience similarity {lowFit.fit.semanticScore}%
              </div>
              {lowFit.fit.missingTop.length > 0 && (
                <div style={{ fontSize: '0.76rem', color: '#6e869e', lineHeight: 1.5 }}>
                  Key requirements outside Dinesh&apos;s experience: <span style={{ color: '#9cb3c7' }}>{lowFit.fit.missingTop.join(', ')}</span>
                </div>
              )}
            </div>
            <p style={{ color: '#9cb3c7', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 18 }}>
              Dinesh&apos;s profile is a {lowFit.fit.score}% fit for this role. Do you still want a tailored resume sent to <strong style={{ color: '#e2eeff' }}>{email}</strong>?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => { setLowFit(null); setStep('job'); }} className="btn btn-out" style={{ justifyContent: 'center' }}>
                No, try another job
              </button>
              <button
                onClick={() => generate({ preparedToken: lowFit.preparedToken, platform: 'other' })}
                className="btn btn-green"
                style={{ justifyContent: 'center' }}
              >Yes, send it</button>
            </div>
          </>
        )}

        {step === 'done' && result && (
          <>
            <div style={{ textAlign: 'center', padding: '6px 0 18px' }}>
              <div style={{ fontSize: '2.6rem', marginBottom: 10 }}>✅</div>
              <p style={{ color: '#e2eeff', fontWeight: 700, fontSize: '1rem', overflowWrap: 'anywhere' }}>
                {result.roleTitle}{result.company && <span style={{ color: '#6e869e' }}> · {result.company}</span>}
              </p>
              <p style={{ color: '#6e869e', fontSize: '0.85rem', marginTop: 6 }}>
                The tailored resume PDF was sent to <strong style={{ color: '#e2eeff' }}>{email}</strong>.
              </p>
            </div>

            <div style={{ background: '#07101f', border: '1px solid #1a2e46', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#9cb3c7', marginBottom: 8 }}>
                <span>ATS keyword match</span>
                <span style={{ color: ACCENT }}>{result.coverage.score}%</span>
              </div>
              <div style={{ height: 6, background: '#1a2e46', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ width: `${result.coverage.score}%`, height: '100%', background: `linear-gradient(90deg, ${ACCENT}, #00d4ff)` }} />
              </div>
              {result.coverage.matched.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: result.coverage.missing.length ? 12 : 0 }}>
                  {result.coverage.matched.map((k) => (
                    <span key={k} style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.12)', color: ACCENT }}>{k}</span>
                  ))}
                </div>
              )}
              {result.coverage.missing.length > 0 && (
                <>
                  <div style={{ fontSize: '0.72rem', color: '#3a5066', marginBottom: 6 }}>Not claimed — not part of Dinesh&apos;s documented experience:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.coverage.missing.map((k) => (
                      <span key={k} style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 6, background: '#101e30', border: '1px solid #1a2e46', color: '#6e869e' }}>{k}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => { setStep('job'); setResult(null); }}
                className="btn btn-out"
                style={{ justifyContent: 'center' }}
              >Tailor for another job</button>
              <button onClick={onClose} className="btn btn-pri" style={{ justifyContent: 'center' }}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

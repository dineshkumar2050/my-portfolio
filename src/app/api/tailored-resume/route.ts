import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { awaitAllCallbacks } from '@langchain/core/callbacks/promises';
import { JOB_PLATFORM_IDS } from '@/data/jobPlatforms';
import { signData, verifyData, verifySessionToken } from '@/lib/otpStore';
import { logResumeDownload } from '@/lib/analytics';
import { buildTailoredResume } from '@/lib/resumePdf';
import { sendTailoredResumeEmail } from '@/lib/resumeEmail';
import { resumeGraph, sectionLabel, toResumeContent, type PreparedJob, type ResumeGraphState } from '@/lib/resumeAgents/graph';
import { JobFetchError } from '@/lib/resumeAgents/jobIngest';
import { agentsConfigured, isCapacityError } from '@/lib/resumeAgents/llm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 180;

// Streams newline-delimited JSON so the modal can show each agent finishing:
//   {"type":"step","node":"jdAnalyst","detail":"Senior Frontend Engineer · Acme"}
//   {"type":"step","node":"fitAssessor","detail":"…","expect":{"projectWriter":5}}   ← size of the next parallel fan-out
//   {"type":"confirm","fit":{…},"preparedToken":"…"}   ← low fit: ask first; the signed token lets "yes" skip re-analysis
//   {"type":"done","roleTitle":"…","company":"…","coverage":{…}}
//   {"type":"error","message":"…"}

const MIN_JD_CHARS = 200;
const MAX_JD_CHARS = 20_000;

const PREPARED_TTL_MS = 30 * 60 * 1000;

function stepDetail(node: string, update: Partial<ResumeGraphState>): string | undefined {
  switch (node) {
    case 'jobScout':
      if (update.posting?.source === 'text') return 'Using the pasted job description';
      return [update.posting?.title || 'Job page read', update.posting?.via && update.posting.via !== 'direct' ? `via ${update.posting.via}` : ''].filter(Boolean).join(' · ');
    case 'jdAnalyst': return update.analysis && [update.analysis.roleTitle, update.analysis.company].filter(Boolean).join(' · ');
    case 'fitAssessor': return update.fit && `Profile fit ${update.fit.score}% (skills ${update.fit.skillScore}% · semantic ${update.fit.semanticScore}%)`;
    case 'summaryWriter': return update.summary?.headline;
    case 'skillsCurator': return update.skills && `${update.skills.reduce((n, g) => n + g.items.length, 0)} matching skills`;
    case 'projectWriter': return update.projects?.[0] && sectionLabel(update.projects[0].jobId);
    case 'factChecker': {
      const f = update.findings?.[0];
      return f && `${sectionLabel(f.section)}${f.unsupportedClaims.length ? ` · ${f.unsupportedClaims.length} claim(s) to fix` : ' · OK'}`;
    }
    case 'reviewJoin': return update.editPlan && (update.editPlan.length ? `${update.editPlan.length} section(s) need edits` : 'No fixes needed');
    case 'sectionEditor': return update.notes?.[0]?.replace(/^Section Editor:\s*/, '');
    case 'finalize': return update.coverage && `Keyword match ${update.coverage.score}%`;
    default: return undefined;
  }
}

/** Size of the parallel fan-out a step starts, so the UI can show "3/5 done". */
function stepExpect(node: string, update: Partial<ResumeGraphState>): Record<string, number> | undefined {
  if (node === 'fitAssessor' && update.projectPlan && !update.fit?.needsConfirmation) return { projectWriter: update.projectPlan.length };
  if (node === 'reviewPlanner' && update.reviewSections) return { factChecker: update.reviewSections.length };
  if (node === 'reviewJoin' && update.editPlan) return { sectionEditor: update.editPlan.length };
  return undefined;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = verifySessionToken(body.sessionToken);
  if (!email) {
    return NextResponse.json({ error: 'Your verification expired. Please verify your email again.' }, { status: 401 });
  }
  if (!agentsConfigured()) {
    return NextResponse.json({ error: 'Resume generation is not configured right now.' }, { status: 503 });
  }

  const platform = JOB_PLATFORM_IDS.includes(body.platform) ? body.platform : 'other';
  const confirmLowFit = body.confirmLowFit === true;
  // "Yes" after a low-fit warning: reuse the signed analysis instead of re-scouting/re-analysing the job.
  const prepared = body.preparedToken ? verifyData<{ email: string; job: PreparedJob }>('prepared-job', body.preparedToken) : null;
  if (body.preparedToken && (!prepared || prepared.email !== email)) {
    return NextResponse.json({ error: 'That confirmation expired. Please generate the resume again.' }, { status: 400 });
  }
  let jobText = typeof body.jobText === 'string' ? body.jobText.trim() : '';
  let jobUrl = typeof body.jobUrl === 'string' ? body.jobUrl.trim() : '';
  // A bare link pasted into the description box: read it as a URL instead of treating it as the JD.
  if (/^https?:\/\/\S+$/i.test(jobText)) { jobUrl = jobText; jobText = ''; }

  if (prepared) {
    // validated via signature
  } else if (jobText) {
    if (jobText.length < MIN_JD_CHARS) return NextResponse.json({ error: `Please paste the full job description (at least ${MIN_JD_CHARS} characters).` }, { status: 400 });
    if (jobText.length > MAX_JD_CHARS) return NextResponse.json({ error: 'That job description is too long. Please trim it to the essentials.' }, { status: 400 });
  } else if (!/^https?:\/\/\S+$/i.test(jobUrl) || jobUrl.length > 2000) {
    return NextResponse.json({ error: 'Please enter a valid job URL or paste the job description.' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      try {
        let finalState: ResumeGraphState | undefined;
        const events = await resumeGraph.stream(
          { input: prepared ? { platform, confirmLowFit: true, prepared: prepared.job } : jobText ? { jobText, platform, confirmLowFit } : { jobUrl, platform, confirmLowFit } },
          {
            streamMode: ['updates', 'values'],
            runName: 'tailored-resume',
            tags: ['portfolio', 'tailored-resume', platform],
            // Hashed so LangSmith traces can be grouped per visitor without storing their email.
            metadata: { platform, inputMode: prepared ? 'confirmed' : jobText ? 'text' : 'url', requester: createHash('sha256').update(email).digest('hex').slice(0, 12) },
          }
        );

        for await (const [mode, chunk] of events) {
          if (mode === 'values') {
            finalState = chunk as ResumeGraphState;
            continue;
          }
          for (const [node, update] of Object.entries(chunk as Record<string, Partial<ResumeGraphState>>)) {
            send({ type: 'step', node, detail: stepDetail(node, update ?? {}), expect: stepExpect(node, update ?? {}) });
          }
        }

        // Low fit: stop and let the visitor decide. The extracted JD goes back so a "yes" doesn't re-fetch the job page.
        if (finalState?.fit?.needsConfirmation) {
          const { score, skillScore, semanticScore, missingTop } = finalState.fit;
          send({
            type: 'confirm',
            roleTitle: finalState.analysis.roleTitle,
            company: finalState.analysis.company,
            fit: { score, skillScore, semanticScore, missingTop },
            preparedToken: signData('prepared-job', { email, job: { posting: finalState.posting, analysis: finalState.analysis, fit: finalState.fit } }, PREPARED_TTL_MS),
          });
          return;
        }

        if (!finalState?.summary || !finalState.projects) throw new Error('Graph finished without a resume draft');
        if (finalState.notes.length) console.info('[tailored-resume] notes:', finalState.notes);

        const content = toResumeContent(finalState);
        const resume = buildTailoredResume(content);
        await sendTailoredResumeEmail(email, resume, content.targetRole, content.targetCompany);
        await logResumeDownload(email, 'tailored', true);
        send({ type: 'step', node: 'deliver', detail: resume.fileName });

        // Only surface keywords Dinesh genuinely lacks; ones the draft merely omitted aren't "not claimed".
        const { score, matched, missing, missingButInProfile } = finalState.coverage;
        const notInProfile = missing.filter((k) => !missingButInProfile.includes(k));
        send({ type: 'done', roleTitle: content.targetRole, company: content.targetCompany, coverage: { score, matched, missing: notInProfile } });
      } catch (err) {
        console.error('[tailored-resume] failed:', err);
        send({
          type: 'error',
          message: err instanceof JobFetchError
            ? err.message
            : isCapacityError(err)
              ? 'The AI agents are at capacity right now. Please try again in a few minutes, or later today.'
              : 'Something went wrong while generating the resume. Please try again, or paste the job description instead of a URL.',
        });
      } finally {
        // Serverless functions can freeze once the response ends — flush LangSmith traces first.
        await awaitAllCallbacks().catch(() => {});
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

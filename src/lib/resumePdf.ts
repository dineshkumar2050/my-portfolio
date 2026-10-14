import { jsPDF } from 'jspdf';
import { PROFILE, type SkillGroup } from '@/data/profile';

export type ResumeType = 'basic' | 'detailed';

type RGB = [number, number, number];

export interface Job {
  role: string;
  company: string;
  period: string;
  context?: string;
  bullets: string[];
}

export interface GeneratedResume {
  fileName: string;
  arrayBuffer: ArrayBuffer;
}

const colors = {
  ink: [15, 30, 50] as RGB,
  muted: [60, 90, 120] as RGB,
  light: [110, 134, 158] as RGB,
  cyan: [0, 180, 216] as RGB,
  purple: [124, 58, 237] as RGB,
  green: [16, 185, 129] as RGB,
  orange: [245, 130, 32] as RGB,
  line: [222, 231, 240] as RGB,
  soft: [247, 250, 252] as RGB,
  white: [255, 255, 255] as RGB,
};

const contact = PROFILE.contact;

function addFooter(doc: jsPDF, label: string, accent: RGB) {
  const pageCount = doc.getNumberOfPages();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setDrawColor(...colors.line);
    doc.line(42, height - 34, width - 42, height - 34);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.light);
    doc.text('Dinesh Kumar', 42, height - 18);
    doc.setTextColor(...accent);
    const rightText = `${label} | Page ${page} of ${pageCount}`;
    doc.text(rightText, width - 42 - doc.getTextWidth(rightText), height - 18);
  }
}

function createBaseDoc(accent: RGB, subtitle: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();

  doc.setFillColor(...colors.ink);
  doc.rect(0, 0, width, 104, 'F');
  doc.setFillColor(...accent);
  doc.rect(0, 100, width, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(25);
  doc.setTextColor(...colors.white);
  doc.text('DINESH KUMAR', 42, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(198, 225, 240);
  doc.text(subtitle, 42, 58);

  doc.setFontSize(8.8);
  doc.setTextColor(180, 200, 220);
  doc.text(contact, 42, 79);

  return doc;
}

function createWriter(doc: jsPDF, startY: number, accent: RGB) {
  const margin = 42;
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const right = width - margin;
  let y = startY;

  const checkPage = (needed = 38) => {
    if (y + needed > height - 48) {
      doc.addPage();
      y = 42;
    }
  };

  const newPage = () => {
    doc.addPage();
    y = 42;
  };

  const section = (title: string) => {
    checkPage(34);
    doc.setFillColor(...accent);
    doc.rect(margin, y - 2, 3, 15, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...colors.ink);
    doc.text(title.toUpperCase(), margin + 10, y + 10);
    doc.setDrawColor(...colors.line);
    doc.line(margin, y + 17, right, y + 17);
    y += 30;
  };

  const paragraph = (text: string, size = 9.4, gap = 12) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...colors.muted);
    const lines = doc.splitTextToSize(text, right - margin);
    doc.text(lines, margin, y);
    y += lines.length * (size + 4) + gap;
  };

  const pill = (text: string, x: number, yy: number, fill: RGB) => {
    const padX = 8;
    const pillWidth = doc.getTextWidth(text) + padX * 2;
    doc.setFillColor(...fill);
    doc.roundedRect(x, yy - 10, pillWidth, 16, 8, 8, 'F');
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text(text, x + padX, yy + 1);
    return pillWidth;
  };

  const skillLine = (label: string, value: string, color: RGB = accent) => {
    checkPage(22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.9);
    doc.setTextColor(...color);
    doc.text(`${label}:`, margin, y);
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.muted);
    const lines = doc.splitTextToSize(value, right - margin - labelWidth);
    doc.text(lines, margin + labelWidth, y);
    y += Math.max(lines.length, 1) * 12.5 + 4;
  };

  const bullets = (items: string[], bulletColor: RGB = accent, size = 8.9) => {
    items.forEach((item) => {
      checkPage(24);
      doc.setFillColor(...bulletColor);
      doc.circle(margin + 3.5, y - 3, 1.7, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      doc.setTextColor(...colors.muted);
      const lines = doc.splitTextToSize(item, right - margin - 14);
      doc.text(lines, margin + 13, y);
      y += lines.length * (size + 3.8) + 3;
    });
  };

  const job = (item: Job, opts?: { compact?: boolean; accent?: RGB }) => {
    const jobAccent = opts?.accent || accent;
    checkPage(opts?.compact ? 58 : 86);
    doc.setFillColor(...colors.soft);
    doc.roundedRect(margin, y - 13, right - margin, 28, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(opts?.compact ? 10 : 10.5);
    doc.setTextColor(...colors.ink);
    doc.text(item.role, margin + 10, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.3);
    doc.setTextColor(...colors.light);
    doc.text(item.period, right - doc.getTextWidth(item.period) - 8, y + 3);
    y += 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(...jobAccent);
    doc.text(item.company, margin, y);
    y += 13;

    if (item.context) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.3);
      doc.setTextColor(...colors.light);
      const contextLines = doc.splitTextToSize(item.context, right - margin);
      doc.text(contextLines, margin, y);
      y += contextLines.length * 11.5 + 4;
    }

    bullets(item.bullets, jobAccent, opts?.compact ? 8.4 : 8.8);
    y += opts?.compact ? 7 : 12;
  };

  const twoColumnHighlights = (items: string[]) => {
    const gap = 16;
    const colWidth = (right - margin - gap) / 2;
    const startY = y;
    let leftY = startY;
    let rightY = startY;

    items.forEach((item, index) => {
      const isLeft = index % 2 === 0;
      const x = isLeft ? margin : margin + colWidth + gap;
      const yy = isLeft ? leftY : rightY;
      const lines = doc.splitTextToSize(item, colWidth - 18);
      const boxHeight = Math.max(40, lines.length * 11 + 22);
      checkPage(boxHeight + 8);
      doc.setFillColor(...colors.soft);
      doc.roundedRect(x, yy - 14, colWidth, boxHeight, 4, 4, 'F');
      doc.setFillColor(...accent);
      doc.circle(x + 10, yy - 1, 2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...colors.muted);
      doc.text(lines, x + 18, yy + 2);
      if (isLeft) leftY += boxHeight + 8;
      else rightY += boxHeight + 8;
    });

    y = Math.max(leftY, rightY) + 8;
  };

  return {
    get y() { return y; },
    section,
    paragraph,
    pill,
    skillLine,
    bullets,
    job,
    twoColumnHighlights,
    checkPage,
    newPage,
  };
}

function output(doc: jsPDF, fileName: string): GeneratedResume {
  return {
    fileName,
    arrayBuffer: doc.output('arraybuffer'),
  };
}

function buildBasicResume(): GeneratedResume {
  const doc = createBaseDoc(colors.cyan, 'Senior Software Engineer | Team Lead | Full-Stack, Cloud, AI Developer Tooling');
  const writer = createWriter(doc, 126, colors.cyan);
  const width = doc.internal.pageSize.getWidth();

  writer.section('Professional Summary');
  writer.paragraph(
    'Senior Software Engineer and Team Lead with 8+ years of full-stack delivery across institutional banking, fintech, edtech, AI automation, e-commerce, and public-sector platforms. Strong fit for Senior Full-Stack, Frontend Lead, Backend/NestJS, Platform, and AI-enabled developer productivity roles. Known for owning ambiguous work, translating architecture into delivery plans, mentoring engineers, and shipping production systems with caching, performance tuning, and reliable observability.'
  );

  writer.section('Core Skills and Keywords');
  writer.skillLine('Frontend', 'React.js, Next.js, TypeScript, JavaScript, Redux Toolkit, Zustand, React Query, React Native, Angular, Vue.js, HTML5, CSS3');
  writer.skillLine('Backend', 'Node.js, NestJS, Express.js, Java/Spring Boot, REST APIs, GraphQL, WebSockets, Kafka, Temporal, RabbitMQ, Redis caching');
  writer.skillLine('Cloud and DevOps', 'AWS ECS, EC2, S3, Lambda, SQS, SNS, ALB, CloudWatch, Docker, Kubernetes, Helm, CI/CD, GitHub Actions, Jenkins');
  writer.skillLine('Data and Quality', 'MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch, JSONB, query optimization, cache invalidation, Jest, React Testing Library, API contracts');
  writer.skillLine('Architecture and AI', 'Microservices, event-driven design, caching strategies, SOLID, DDD, HLD/LLD, Claude Skills, RAG pipelines, agentic AI workflows');

  writer.section('Top Flagship Projects');
  writer.bullets([
    'Commonwealth Bank of Australia - Led engineering for institutional banking workflows; designed NestJS microservices using Kafka, Temporal, caching strategies, retries, and failure recovery.',
    'PCG Education - Led a 6-engineer team for a K-12 special education and Medicaid reimbursement platform; owned React/NestJS delivery, sprint planning, US client demos, and production-quality case-management workflows.',
    'LendingPoint and Zengines AI - Delivered fintech and AI automation products with React/React Native, Next.js SSR, encrypted NestJS middleware, WebSockets, LaunchDarkly feature flags, AWS infrastructure, and Sentry monitoring.',
  ]);

  writer.section('Professional Experience');
  writer.job({
    role: 'Team Lead / Senior Software Engineer',
    company: 'Nous Infosystems - Client: Commonwealth Bank of Australia',
    period: 'Apr 2024 - Oct 2025',
    bullets: [
      'Led design and delivery for an institutional banking platform supporting high-value corporate banking journeys.',
      'Created microservice architecture with NestJS, Kafka, Temporal, Redis/caching patterns, AWS ECS, HashiCorp Vault, Grafana, Prometheus, PagerDuty, and Observe.',
      'Built Claude Skills and RAG pipelines for AI-assisted engineering workflows, improving onboarding and spec-to-code execution.',
      'Owned architecture discussions, PR reviews, client communication, incident readiness, and mentorship for junior/mid engineers.',
    ],
  }, { compact: true, accent: colors.cyan });

  writer.job({
    role: 'Full-Stack Engineer / Team Lead',
    company: 'Trantor Software Pvt. Ltd. - PCG Education, LendingPoint, Zengines AI, Gemini, CureFit, Landmark',
    period: 'Mar 2022 - Apr 2024',
    bullets: [
      'Led PCG Education delivery for 18 months; managed 6 engineers, stakeholder demos, feature planning, and React/NestJS/MySQL implementation.',
      'Built LendingPoint fintech experiences with React, React Native, WebSockets, encrypted middleware, and loyalty rewards flows.',
      'Delivered Zengines AI with Next.js, Zustand, LaunchDarkly, Docker/Kubernetes, AWS EC2/S3/SQS/Lambda, and Sentry monitoring.',
    ],
  }, { compact: true, accent: colors.purple });

  writer.job({
    role: 'Software Engineer',
    company: 'Recrosoft / CartNYou / IZACCESS',
    period: 'Dec 2017 - Feb 2022',
    bullets: [
      'Built Axon digital evidence management screens and services for US law enforcement workflows using React, Angular, Node.js, MongoDB, and Jest.',
      'Delivered production applications across e-commerce, pharmacy, freelance marketplace, tax filing, phone retail, and GPS tracking domains.',
    ],
  }, { compact: true, accent: colors.green });

  writer.section('Selected Strengths');
  writer.bullets([
    'Can join as a senior IC or team lead and immediately contribute across React/Next.js, NestJS APIs, caching/performance, AWS deployment, observability, and architecture discussions.',
    'Has credible regulated-domain experience through CBA institutional banking, LendingPoint fintech, PCG Medicaid workflows, and Axon law-enforcement evidence management.',
    'Brings AI-adjacent delivery signal through Claude Skills, RAG pipelines, Zengines AI, and Gemini model-quality work - useful for teams adopting AI-assisted engineering.',
  ], colors.orange);

  writer.section('Role Alignment');
  writer.skillLine('Primary', 'Senior Full-Stack Engineer, Technical Lead, Frontend Lead, Backend/NestJS Engineer, Platform Engineer');
  writer.skillLine('Strengths', 'Ambiguous problem ownership, project rescue, system design, caching strategy, API-driven UI delivery, team mentoring, client-facing technical communication');

  writer.section('Education');
  writer.skillLine('B.Tech', 'DCRUST - Deenbandhu Chhotu Ram University of Science and Technology, Murthal, Haryana');
  writer.skillLine('Schooling', '10th and 12th - CBSE Board');

  addFooter(doc, 'Basic Resume - ATS Friendly', colors.cyan);
  return output(doc, 'Dinesh_Kumar_Basic_Resume.pdf');
}

const DETAILED_ACCENTS: Record<string, RGB> = {
  cba: colors.purple, portfolio: colors.green, pcg: colors.cyan, lendingpoint: colors.green, zengines: colors.orange,
  gemini: colors.cyan, inkind: colors.green, curefit: colors.orange, trackwick: colors.cyan,
  landmark: colors.purple, apotheek: colors.green, axon: colors.cyan, shopiji: colors.orange,
  psydro: colors.purple, wildhire: colors.green, turbotax: colors.cyan, mobilesnyou: colors.orange,
};

const SKILL_ACCENTS: RGB[] = [colors.cyan, colors.cyan, colors.green, colors.purple, colors.orange, colors.green, colors.purple];

function buildDetailedResume(): GeneratedResume {
  const doc = createBaseDoc(colors.purple, 'Senior Software Engineer | Technical Lead | Full-Stack, Cloud-Native Delivery, AI Tooling');
  const writer = createWriter(doc, 126, colors.purple);

  writer.section('Professional Summary');
  PROFILE.summary.forEach((p) => writer.paragraph(p));

  writer.section('Complete Skills Taxonomy');
  PROFILE.skills.forEach((group, i) => writer.skillLine(group.label, group.items.join(', '), SKILL_ACCENTS[i % SKILL_ACCENTS.length]));

  writer.section('Project-by-Project Experience');
  PROFILE.jobs.forEach((job) => writer.job(job, { accent: DETAILED_ACCENTS[job.id] || colors.purple }));

  writer.newPage();
  writer.section('Architecture and Leadership Highlights');
  writer.twoColumnHighlights(PROFILE.highlights);

  writer.section('Education');
  PROFILE.education.forEach((e, i) => writer.skillLine(e.label, e.value, i === 0 ? colors.purple : colors.cyan));

  addFooter(doc, 'Detailed Resume - Hiring Manager Deep Dive', colors.purple);
  return output(doc, 'Dinesh_Kumar_Detailed_Resume.pdf');
}

export interface TailoredResumeContent {
  targetRole: string;
  targetCompany: string;
  headline: string;
  summary: string;
  skills: SkillGroup[];
  projects: Job[];
}

function slug(text: string) {
  return text.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'Role';
}

export function buildTailoredResume(content: TailoredResumeContent): GeneratedResume {
  const accent = colors.green;
  // Keep the header subtitle on one line; the base header has room for a single row.
  const probe = new jsPDF({ unit: 'pt', format: 'a4' });
  probe.setFontSize(11);
  const headline = probe.splitTextToSize(content.headline, 510)[0] as string;

  const doc = createBaseDoc(accent, headline);
  const writer = createWriter(doc, 126, accent);

  writer.section('Professional Summary');
  writer.paragraph(content.summary);

  writer.section('Core Skills');
  content.skills.forEach((group) => writer.skillLine(group.label, group.items.join(', ')));

  writer.section('Relevant Experience');
  content.projects.forEach((job) => writer.job(job, { compact: true, accent }));

  writer.section('Employment History');
  PROFILE.employment.forEach((e) => writer.skillLine(e.period, `${e.role} - ${e.company}`, colors.muted));

  writer.section('Education');
  PROFILE.education.forEach((e) => writer.skillLine(e.label, e.value));

  const target = content.targetCompany ? `${content.targetRole} - ${content.targetCompany}` : content.targetRole;
  // Trim at a word boundary so the footer never ends mid-word.
  const shortTarget = target.length > 64 ? `${target.slice(0, 64).replace(/\s+\S*$/, '')}...` : target;
  addFooter(doc, `Prepared for: ${shortTarget}`, accent);
  return output(doc, `Dinesh_Kumar_Resume_${slug(content.targetRole)}.pdf`);
}

export async function createResumePdf(type: ResumeType): Promise<GeneratedResume> {
  return type === 'detailed' ? buildDetailedResume() : buildBasicResume();
}

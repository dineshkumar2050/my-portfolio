import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { isTokenBudgetExhausted, recordTokens, TOKEN_LIMIT_MESSAGE } from '@/lib/tokenBudget';

// Claude Haiku 5.5 (Anthropic's cheapest model) is the only model. Every call counts toward the site-wide
// daily token budget in lib/tokenBudget.ts; once it is spent, chat answers with TOKEN_LIMIT_MESSAGE.
const CHAT_MODEL = process.env.CHAT_CLAUDE_MODEL || 'claude-haiku-5-5';
const MAX_REPLY_TOKENS = 300;     // the prompt asks for 2-4 sentences
const MAX_HISTORY_MESSAGES = 6;   // every earlier message is re-sent (and billed) with each question
const MAX_MESSAGE_CHARS = 1_000;

const SYSTEM_PROMPT = `You are a helpful AI assistant on Dinesh Kumar's portfolio website. Your job is to answer questions about Dinesh's professional background, skills, projects, and experience. Be friendly, concise, and informative. If someone seems like a recruiter or hiring manager, be especially helpful.

=== ABOUT DINESH KUMAR ===
Name: Dinesh Kumar
Role: Senior Software Engineer & Team Lead
Experience: 8+ years (Dec 2017 – Oct 2025)
Location: India — open to remote work or relocation
Contact: +91 9560163362 | WhatsApp: https://wa.me/919560163362 | WhatsApp alternate: https://wa.me/918448724187 | dinesh.kumar.199998888@gmail.com
Education: B.Tech from DCRUST (Deenbandhu Chhotu Ram University of Science & Technology), Murthal, Haryana. 10th & 12th from CBSE.

=== CURRENT / LATEST ROLE ===
Company: Nous Infosystems
Title: Team Lead / Senior Software Engineer
Period: Apr 2024 – Oct 2025
Client: Commonwealth Bank of Australia (CBA) — Institutional Banking Platform
Key work:
- Designed TypeScript/NestJS microservices for secure, high-volume institutional banking workflows
- Implemented durable Temporal workflows for long-running banking processes with retry/failure recovery
- Built Kafka event-driven integrations for async communication across distributed microservices
- Developed customer-facing journeys using React + Next.js with Redux state management
- Built Claude Skills and RAG (Retrieval-Augmented Generation) pipelines — AI-assisted dev tooling automating spec-to-code workflows
- Used HashiCorp Vault for secrets management; set up Grafana/Prometheus/PagerDuty observability
- Created CI/CD pipelines for AWS ECS automated builds and deployments
- Led team: architecture decisions, PR reviews, mentoring, client stakeholder communication

=== PREVIOUS EXPERIENCE ===
Trantor Software Pvt. Ltd. (Mar 2022 – Apr 2024) — Full-Stack Engineer / Team Lead
Projects:
1. PCG Education (18 months, Team Lead): K-12 special education management and Medicaid reimbursement platform for US school districts. Led 6-engineer team. React + NestJS + MySQL + PostgreSQL JSONB. Direct US client relationship.
2. LendingPoint (1 year): Fintech lending platform. React web + React Native mobile. Real-time WebSocket merchant-customer communication. NestJS middleware with API payload encryption. Loyalty rewards system.
3. Zengines AI (6 months): Enterprise data automation. Next.js SSR + Zustand state. LaunchDarkly feature flags. Docker + Kubernetes + AWS. Sentry error monitoring.
4. InKind (4 months, contract): US restaurant capital platform. Pre-purchased dining credit flows, loyalty program.
5. Google Gemini (6 months, contract): AI model trainer. Multimodal dataset curation, bias detection, feedback loop management for Google Gemini.
6. CureFit: Health/fitness platform microservices. NestJS + MongoDB.
7. Landmark MaxFashion: UAE e-commerce across 6 territories in 2 languages. React + Next.js + MySQL.

Recrosoft Technologies (Sep 2021 – Feb 2022) — Software Engineer
- Axon DEMS: Cloud-based Digital Evidence Management System for US law enforcement. React/Angular + Node.js + MongoDB.
- Nationale-Apotheek: Netherlands online pharmacy. Next.js + Storyblok CMS, deployed on Vercel.

CartNYou Retails (Sep 2020 – Aug 2021) — Software Engineer
- Axon Evidence Management System for law enforcement.

IZACCESS (Dec 2017 – Aug 2020) — Software Engineer
- Shopiji, Psydro (e-commerce), WildHire (freelance marketplace), Intuit TurboTax DIY, Mobiles N You, Trackwick.

=== SKILLS ===
Frontend: React.js, Next.js, TypeScript, JavaScript (ES2022+), Redux, Zustand, React Query, React Native, Angular, Vue.js, HTML5, CSS3/SCSS, Mantine UI, Material UI, LaunchDarkly
Backend: Node.js, NestJS, Express.js, Java/Spring Boot, Python, REST APIs, GraphQL, WebSockets, Kafka, Temporal, RabbitMQ
Databases: MySQL, PostgreSQL (JSONB), MongoDB, Redis, Elasticsearch
Cloud & DevOps: AWS (ECS, EC2, S3, Lambda, SQS, SNS, ALB, CloudWatch, IAM), Docker, Kubernetes, Helm, HashiCorp Vault, Vercel, CI/CD, GitHub Actions, Jenkins
Observability: Grafana, Prometheus, PagerDuty, Sentry, Loggly, CloudWatch, OpenTelemetry
AI & Architecture: Claude Skills, RAG Pipelines, Agentic AI, Microservices, Micro-frontends, HLD, LLD, SOLID, Event-Driven Design, DSA
Testing: Jest, React Testing Library, Enzyme

=== STRENGTHS & LEADERSHIP ===
- Technical leader: architecture design, code reviews, sprint planning across 3+ companies
- Client-facing: comfortable with US/UK clients (CBA, PCG Education, InKind) for requirements, demos, escalations
- Mentorship: coaches junior/mid engineers on code quality and design patterns
- Multi-domain: delivered in banking, fintech, edtech, healthcare, government (law enforcement), e-commerce, AI
- AI tooling pioneer: one of few engineers to build production Claude Skills + RAG pipelines for enterprise banking automation
- Products shipped in: Australia, USA, Netherlands, UAE, India

=== WHAT DINESH IS LOOKING FOR ===
- Senior Software Engineer / Tech Lead / Architect roles
- Preference: Remote-first or hybrid
- Domains: Fintech, AI/ML, Enterprise SaaS, Developer Tools
- Strong interest: AI-powered workflows, event-driven architectures, TypeScript/Node.js ecosystems

=== INSTRUCTIONS ===
- Answer questions about Dinesh's background truthfully based on the above info
- For contact: share +91 9560163362, WhatsApp links https://wa.me/919560163362 and https://wa.me/918448724187, and dinesh.kumar.199998888@gmail.com
- If asked about salary/compensation, say Dinesh is open to discussion based on the role/company
- For technical questions about his work, explain the tech choices he made
- Do not share any confidential/internal information about his previous employers
- If you don't know something, say so and suggest contacting Dinesh directly
- Keep responses concise — 2-4 sentences unless more detail is asked for
- Be warm and professional, like a knowledgeable colleague`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your-key-here' || apiKey.startsWith('sk-ant-xxx')) {
      return NextResponse.json({ error: 'Chat is not configured. Please set ANTHROPIC_API_KEY.' }, { status: 503 });
    }
    if (!Array.isArray(messages) || !messages.length) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Shared by all visitors: once the day's budget is used up (by anyone), everyone gets this message.
    if (await isTokenBudgetExhausted()) {
      return NextResponse.json({ error: TOKEN_LIMIT_MESSAGE }, { status: 429 });
    }

    // Only user/assistant turns, trimmed, must start with a user turn and alternate for the API.
    const recent: Anthropic.MessageParam[] = [];
    for (const m of messages.slice(-MAX_HISTORY_MESSAGES) as { role: string; content: unknown }[]) {
      if ((m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string' || !m.content.trim()) continue;
      const last = recent[recent.length - 1];
      if (last?.role === m.role) { recent.pop(); }
      recent.push({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) });
    }
    while (recent.length && recent[0].role !== 'user') recent.shift();
    if (!recent.length || recent[recent.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey, maxRetries: 1 });
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = client.messages.stream({
            model: CHAT_MODEL,
            max_tokens: MAX_REPLY_TOKENS,
            output_config: { effort: 'low' }, // no extended thinking: it would be billed as output tokens
            system: SYSTEM_PROMPT,
            messages: recent,
          });
          response.on('text', (text) => controller.enqueue(encoder.encode(text)));
          const final = await response.finalMessage();
          await recordTokens(final.usage.input_tokens + final.usage.output_tokens);
          controller.close();
        } catch (err: unknown) {
          const e = err as { status?: number; message?: string };
          console.error('[chat] Claude request failed:', { status: e.status, message: String(e.message ?? err).replace(apiKey, '[redacted]') });
          const isAuth = e.status === 401 || e.status === 403;
          const isQuota = e.status === 429 || e.status === 529 || /credit balance|rate limit|overloaded/i.test(String(e.message));
          controller.enqueue(encoder.encode(
            isQuota
              ? 'Chat is temporarily unavailable because the AI quota or rate limit was reached. Please contact Dinesh directly at dinesh.kumar.199998888@gmail.com.'
              : isAuth
                ? 'Chat is not configured - the API key is invalid. Please contact Dinesh directly at dinesh.kumar.199998888@gmail.com.'
                : 'Sorry, something went wrong. Please try again or contact Dinesh directly.'
          ));
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

// ══════════════════════════════════════════════════════════════════════════════
// AI PROVIDER TOGGLE
// ──────────────────────────────────────────────────────────────────────────────
// Only ONE block should be active at a time. To switch provider:
//   1. Comment out the active block (search "── <Provider> (active)")
//   2. Uncomment the block for your desired provider
//   3. Add the corresponding API key to .env.local
//   4. Restart: npm run dev
//
// Providers & required installs:
//   ○  OpenAI        → OPENAI_API_KEY         (already installed: openai)
//   ○  Anthropic     → ANTHROPIC_API_KEY      (npm i @anthropic-ai/sdk)
//   ✅ Google Gemini → GOOGLE_API_KEY         (already installed: @google/genai)
//   ○  Grok (xAI)    → XAI_API_KEY            (uses openai SDK — no extra install)
//   ○  Perplexity    → PERPLEXITY_API_KEY     (uses openai SDK — no extra install)
//   ✅ Groq fallback → GROQ_API_KEY           (uses openai SDK via Groq — no extra install)
//   ○  Azure OpenAI  → AZURE_OPENAI_API_KEY   (uses openai SDK — no extra install)
// ══════════════════════════════════════════════════════════════════════════════

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

    // ── Google Gemini (active) ───────────────────────────────────────────────
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'your-key-here') {
      return NextResponse.json(
        { error: 'Chat is not configured. Please set a valid GOOGLE_API_KEY.' },
        { status: 503 }
      );
    }

    if (!messages?.length) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const recentMessages = messages.slice(-12);
        try {
          const conversation = recentMessages
            .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
            .join('\n');

          const geminiStream = await ai.models.generateContentStream({
            model: 'gemini-3.6-flash',
            contents: `${SYSTEM_PROMPT}\n\nConversation:\n${conversation}\nassistant:`,
          });

          for await (const chunk of geminiStream) {
            const text = chunk.text ?? '';
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err: unknown) {
          const maybeError = err as { status?: number; code?: string; type?: string; message?: string };
          const msg = maybeError.message || String(err);
          const isAuth = maybeError.status === 401 || maybeError.status === 403 || msg.includes('401') || msg.includes('403') || msg.toLowerCase().includes('api key');
          const isQuota = maybeError.status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit');
          console.error('[chat] Gemini request failed:', {
            status: maybeError.status,
            code: maybeError.code,
            type: maybeError.type,
            message: msg.replace(apiKey, '[redacted]'),
          });

          const groqApiKey = process.env.GROQ_API_KEY;
          if (groqApiKey && groqApiKey !== 'your-key-here') {
            try {
              const OpenAI = (await import('openai')).default;
              const groq = new OpenAI({
                apiKey: groqApiKey,
                baseURL: 'https://api.groq.com/openai/v1',
              });
              const groqStream = await groq.chat.completions.create({
                model: 'openai/gpt-oss-20b',
                max_tokens: 600,
                stream: true,
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  ...recentMessages,
                ],
              });

              for await (const chunk of groqStream) {
                const text = chunk.choices[0]?.delta?.content ?? '';
                if (text) controller.enqueue(encoder.encode(text));
              }
              controller.close();
              return;
            } catch (fallbackErr: unknown) {
              const fallbackError = fallbackErr as { status?: number; code?: string; type?: string; message?: string };
              const fallbackMsg = fallbackError.message || String(fallbackErr);
              console.error('[chat] Groq fallback failed:', {
                status: fallbackError.status,
                code: fallbackError.code,
                type: fallbackError.type,
                message: fallbackMsg.replace(groqApiKey, '[redacted]'),
              });
            }
          }

          controller.enqueue(encoder.encode(
            isQuota
              ? 'Chat is temporarily unavailable because the Gemini API quota or rate limit was reached. Please contact Dinesh directly at dinesh.kumar.199998888@gmail.com.'
              : isAuth
                ? 'Chat is not configured - the Gemini API key is invalid. Please contact Dinesh directly at dinesh.kumar.199998888@gmail.com.'
                : 'Sorry, something went wrong. Please try again or contact Dinesh directly.'
          ));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
    // ── End Google Gemini ─────────────────────────────────────────────────────

    // ── Anthropic / Claude (commented — uncomment to switch) ─────────────────
    // const apiKey = process.env.ANTHROPIC_API_KEY;
    // if (!apiKey || apiKey.startsWith('sk-ant-xxx')) {
    //   return NextResponse.json({ error: 'Chat is not configured. Please set ANTHROPIC_API_KEY.' }, { status: 503 });
    // }
    // if (!messages?.length) return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    // const Anthropic = (await import('@anthropic-ai/sdk')).default;
    // const client = new Anthropic({ apiKey });
    // const encoder = new TextEncoder();
    // const stream = new ReadableStream({
    //   async start(controller) {
    //     try {
    //       const s = client.messages.stream({ model: 'claude-haiku-4-5-20251001', max_tokens: 600, system: SYSTEM_PROMPT, messages: messages.slice(-12) });
    //       for await (const event of s) {
    //         if (event.type === 'content_block_delta' && event.delta.type === 'text_delta')
    //           controller.enqueue(encoder.encode(event.delta.text));
    //       }
    //       controller.close();
    //     } catch (err: unknown) {
    //       const msg = err instanceof Error ? err.message : String(err);
    //       controller.enqueue(encoder.encode(msg.includes('401') ? 'Invalid API key. Contact Dinesh at dinesh.kumar.199998888@gmail.com.' : 'Something went wrong. Please try again.'));
    //       controller.close();
    //     }
    //   },
    // });
    // return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    // ── End Anthropic ─────────────────────────────────────────────────────────

    // ── Google Gemini (alternate commented sample) ────────────────────────────
    // Install first: npm i @google/genai
    // .env.local: GOOGLE_API_KEY=AIza...  (get at aistudio.google.com/app/apikey)
    //
    // const apiKey = process.env.GOOGLE_API_KEY;
    // if (!apiKey || apiKey === 'your-key-here') {
    //   return NextResponse.json({ error: 'Chat is not configured. Please set GOOGLE_API_KEY.' }, { status: 503 });
    // }
    // if (!messages?.length) return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    // const { GoogleGenAI } = await import('@google/genai');
    // const ai = new GoogleGenAI({ apiKey });
    // const encoder = new TextEncoder();
    // const stream = new ReadableStream({
    //   async start(controller) {
    //     try {
    //       const geminiStream = await ai.models.generateContentStream({
    //         model: 'gemini-3.6-flash',
    //         contents: [
    //           { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\nConversation:\n' + messages.map((m: {role:string,content:string}) => `${m.role}: ${m.content}`).join('\n') }] },
    //         ],
    //       });
    //       for await (const chunk of geminiStream) {
    //         const text = chunk.text ?? '';
    //         if (text) controller.enqueue(encoder.encode(text));
    //       }
    //       controller.close();
    //     } catch (err: unknown) {
    //       const msg = err instanceof Error ? err.message : String(err);
    //       controller.enqueue(encoder.encode(msg.includes('401') || msg.includes('API_KEY') ? 'Invalid API key. Contact Dinesh at dinesh.kumar.199998888@gmail.com.' : 'Something went wrong. Please try again.'));
    //       controller.close();
    //     }
    //   },
    // });
    // return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    // ── End Google Gemini ─────────────────────────────────────────────────────

    // ── Grok / xAI (commented) ────────────────────────────────────────────────
    // No extra install needed — uses openai SDK with xAI's OpenAI-compatible API
    // .env.local: XAI_API_KEY=xai-...  (get at console.x.ai)
    //
    // const apiKey = process.env.XAI_API_KEY;
    // if (!apiKey || apiKey === 'your-key-here') {
    //   return NextResponse.json({ error: 'Chat is not configured. Please set XAI_API_KEY.' }, { status: 503 });
    // }
    // if (!messages?.length) return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    // const OpenAI = (await import('openai')).default;
    // const client = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });
    // const encoder = new TextEncoder();
    // const stream = new ReadableStream({
    //   async start(controller) {
    //     try {
    //       const s = await client.chat.completions.create({
    //         model: 'grok-3-mini',   // or 'grok-3' for full model
    //         max_tokens: 600, stream: true,
    //         messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-12)],
    //       });
    //       for await (const chunk of s) {
    //         const text = chunk.choices[0]?.delta?.content ?? '';
    //         if (text) controller.enqueue(encoder.encode(text));
    //       }
    //       controller.close();
    //     } catch (err: unknown) {
    //       const msg = err instanceof Error ? err.message : String(err);
    //       controller.enqueue(encoder.encode(msg.includes('401') ? 'Invalid API key. Contact Dinesh at dinesh.kumar.199998888@gmail.com.' : 'Something went wrong. Please try again.'));
    //       controller.close();
    //     }
    //   },
    // });
    // return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    // ── End Grok ──────────────────────────────────────────────────────────────

    // ── Perplexity (commented) ────────────────────────────────────────────────
    // No extra install — uses openai SDK with Perplexity's OpenAI-compatible API
    // .env.local: PERPLEXITY_API_KEY=pplx-...  (get at perplexity.ai/settings/api)
    //
    // const apiKey = process.env.PERPLEXITY_API_KEY;
    // if (!apiKey || apiKey === 'your-key-here') {
    //   return NextResponse.json({ error: 'Chat is not configured. Please set PERPLEXITY_API_KEY.' }, { status: 503 });
    // }
    // if (!messages?.length) return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    // const OpenAI = (await import('openai')).default;
    // const client = new OpenAI({ apiKey, baseURL: 'https://api.perplexity.ai' });
    // const encoder = new TextEncoder();
    // const stream = new ReadableStream({
    //   async start(controller) {
    //     try {
    //       const s = await client.chat.completions.create({
    //         model: 'llama-3.1-sonar-small-128k-online',  // has web search built-in
    //         max_tokens: 600, stream: true,
    //         messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-12)],
    //       });
    //       for await (const chunk of s) {
    //         const text = chunk.choices[0]?.delta?.content ?? '';
    //         if (text) controller.enqueue(encoder.encode(text));
    //       }
    //       controller.close();
    //     } catch (err: unknown) {
    //       const msg = err instanceof Error ? err.message : String(err);
    //       controller.enqueue(encoder.encode(msg.includes('401') ? 'Invalid API key. Contact Dinesh at dinesh.kumar.199998888@gmail.com.' : 'Something went wrong. Please try again.'));
    //       controller.close();
    //     }
    //   },
    // });
    // return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    // ── End Perplexity ────────────────────────────────────────────────────────

    // ── Meta / Llama via Groq (commented) ────────────────────────────────────
    // No extra install — uses openai SDK with Groq's OpenAI-compatible API (free tier)
    // .env.local: GROQ_API_KEY=gsk_...  (get free key at console.groq.com)
    //
    // const apiKey = process.env.GROQ_API_KEY;
    // if (!apiKey || apiKey === 'your-key-here') {
    //   return NextResponse.json({ error: 'Chat is not configured. Please set GROQ_API_KEY.' }, { status: 503 });
    // }
    // if (!messages?.length) return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    // const OpenAI = (await import('openai')).default;
    // const client = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
    // const encoder = new TextEncoder();
    // const stream = new ReadableStream({
    //   async start(controller) {
    //     try {
    //       const s = await client.chat.completions.create({
    //         model: 'llama-3.3-70b-versatile',  // Meta Llama 3.3 70B, fast & free on Groq
    //         max_tokens: 600, stream: true,
    //         messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-12)],
    //       });
    //       for await (const chunk of s) {
    //         const text = chunk.choices[0]?.delta?.content ?? '';
    //         if (text) controller.enqueue(encoder.encode(text));
    //       }
    //       controller.close();
    //     } catch (err: unknown) {
    //       const msg = err instanceof Error ? err.message : String(err);
    //       controller.enqueue(encoder.encode(msg.includes('401') ? 'Invalid API key. Contact Dinesh at dinesh.kumar.199998888@gmail.com.' : 'Something went wrong. Please try again.'));
    //       controller.close();
    //     }
    //   },
    // });
    // return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    // ── End Meta / Llama ──────────────────────────────────────────────────────

    // ── Microsoft Azure OpenAI (commented) ───────────────────────────────────
    // No extra install — uses openai SDK with Azure config
    // .env.local:
    //   AZURE_OPENAI_API_KEY=...       (Azure portal → your resource → Keys)
    //   AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com
    //   AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini  (your deployment name)
    //
    // const apiKey = process.env.AZURE_OPENAI_API_KEY;
    // const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    // const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
    // if (!apiKey || !endpoint) {
    //   return NextResponse.json({ error: 'Chat is not configured. Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT.' }, { status: 503 });
    // }
    // if (!messages?.length) return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    // const { AzureOpenAI } = await import('openai');
    // const client = new AzureOpenAI({ apiKey, endpoint, apiVersion: '2025-01-01-preview' });
    // const encoder = new TextEncoder();
    // const stream = new ReadableStream({
    //   async start(controller) {
    //     try {
    //       const s = await client.chat.completions.create({
    //         model: deployment,
    //         max_tokens: 600, stream: true,
    //         messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-12)],
    //       });
    //       for await (const chunk of s) {
    //         const text = chunk.choices[0]?.delta?.content ?? '';
    //         if (text) controller.enqueue(encoder.encode(text));
    //       }
    //       controller.close();
    //     } catch (err: unknown) {
    //       const msg = err instanceof Error ? err.message : String(err);
    //       controller.enqueue(encoder.encode(msg.includes('401') ? 'Invalid API key. Contact Dinesh at dinesh.kumar.199998888@gmail.com.' : 'Something went wrong. Please try again.'));
    //       controller.close();
    //     }
    //   },
    // });
    // return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    // ── End Azure OpenAI ──────────────────────────────────────────────────────

  } catch (err) {
    console.error('chat error:', err);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}

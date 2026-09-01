'use client';
import { useState } from 'react';

function ArchRow({ nodes }: { nodes: Array<{ label: string; sub?: string; type: string }> }) {
  return (
    <div className="arch-row">
      {nodes.map((n, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {i > 0 && <div className="arch-arr-h">|</div>}
          <div className={`arch-nd ${n.type}`}>
            {n.label}
            {n.sub && <small>{n.sub}</small>}
          </div>
        </div>
      ))}
    </div>
  );
}

const projects = [
  {
    id: 'cba',
    name: 'Commonwealth Bank of Australia',
    company: 'Nous Infosystems · Team Lead',
    tagline: 'Institutional Banking platform — event-driven microservices, Temporal workflows, and AI-powered engineering tooling for high-value corporate clients.',
    domain: 'Banking / Financial Services – Institutional Banking',
    featured: true,
    tags: ['NestJS', 'React', 'Next.js', 'TypeScript', 'Kafka', 'Temporal', 'MySQL', 'AWS', 'Java/Spring Boot', 'Python', 'Claude AI', 'HashiCorp Vault', 'Grafana', 'Prometheus'],
    tagColors: ['', '', '', '', '', '', '', '', 'p', 'g', 'a', 'r', '', ''],
    highlights: [
      'Designed TypeScript/NestJS microservices for secure, high-volume institutional banking workflows',
      'Implemented durable Temporal workflows for long-running banking processes with retries, failure recovery, and async execution',
      'Built event-driven Kafka integrations for reliable asynchronous communication across distributed microservices',
      'Developed customer-facing journeys using React + Next.js with Redux for complex API-driven state',
      'Built Claude Skills and RAG pipelines — AI-assisted dev tooling that automates spec-to-code workflows',
      'Used HashiCorp Vault for secrets management; set up Grafana/Prometheus/PagerDuty observability stack',
      'Created CI/CD pipelines for automated builds, testing, and deployments on AWS ECS',
      'Provided technical leadership — architecture decisions, PR reviews, mentoring, and coaching',
    ],
    arch: {
      rows: [
        [{ label: 'Next.js + React', sub: 'Redux State Mgmt', type: 'fe' }],
        [{ label: 'NestJS API Gateway', sub: 'Auth · Validation · Rate Limit', type: 'be' }, { label: 'HashiCorp Vault', sub: 'Secrets Management', type: 'sec' }],
        [{ label: 'Banking Microservices', sub: 'NestJS · Java Spring Boot', type: 'be' }],
        [{ label: 'Kafka Event Bus', sub: 'Async Messaging', type: 'msg' }, { label: 'Temporal Workflows', sub: 'Durable Orchestration', type: 'msg' }],
        [{ label: 'MySQL Database', sub: 'Relational Data', type: 'db' }, { label: 'AWS S3', sub: 'Object Storage', type: 'cl' }],
        [{ label: 'AWS ECS + ALB', sub: 'Container Hosting', type: 'cl' }, { label: 'Claude Skills + RAG', sub: 'AI Dev Tooling', type: 'ai' }],
        [{ label: 'Grafana + Prometheus', sub: 'Metrics & Dashboards', type: 'obs' }, { label: 'PagerDuty + Observe', sub: 'On-call & Incident', type: 'obs' }],
      ],
      arrows: ['↓ REST API Calls', '↓ Service Mesh', '↓ Events & Orchestration', '↓ Persistence', '↓ Cloud Infrastructure', '↓ Monitoring & Alerting'],
    },
  },
  {
    id: 'pcg',
    name: 'PCG Education',
    company: 'Trantor Software · Team Lead (Contract)',
    duration: '18 months',
    tagline: 'K-12 education management platform for special education case management, student tracking, and Medicaid reimbursement across US school districts.',
    domain: 'Education Technology',
    featured: false,
    tags: ['NestJS', 'Node.js', 'React', 'Redux', 'TypeScript', 'MySQL', 'PostgreSQL', 'AWS', 'Microservices'],
    tagColors: ['', '', '', '', '', '', 'p', '', ''],
    highlights: [
      'Built REST/GraphQL APIs in Node.js + NestJS with async patterns, improving backend throughput',
      'Designed MySQL schemas and used PostgreSQL JSONB for flexible, high-performance analytical data models',
      'Implemented Node.js middleware for API security hardening — authentication, authorization, and request validation',
      'Designed independent microservices with clear API boundaries for fault tolerance and parallel development',
      'Led cross-functional team for 18 months through sprint planning, mentoring, and client requirement gathering',
      'Directly interfaced with US client stakeholders to clarify requirements and align execution timelines',
    ],
    arch: {
      rows: [
        [{ label: 'React.js Frontend', sub: 'Redux · TypeScript', type: 'fe' }],
        [{ label: 'NestJS API Layer', sub: 'Guards · Interceptors', type: 'be' }],
        [{ label: 'Microservices', sub: 'Independent Domains', type: 'be' }, { label: 'Node.js Middleware', sub: 'Auth · Security', type: 'sec' }],
        [{ label: 'MySQL', sub: 'Relational Data', type: 'db' }, { label: 'PostgreSQL', sub: 'Analytics · JSONB', type: 'db' }],
        [{ label: 'AWS (EC2 · S3 · RDS)', sub: 'Cloud Hosting', type: 'cl' }],
      ],
      arrows: ['↓ REST / GraphQL', '↓ Service Layer', '↓ Data Layer', '↓ Infrastructure'],
    },
  },
  {
    id: 'zengines',
    name: 'Zengines AI',
    company: 'Trantor Software',
    duration: '6 months',
    tagline: 'Enterprise data automation platform — AI-powered data onboarding, transformation, and integration for finance, compliance, and analytics domains.',
    domain: 'Data Automation & AI',
    featured: false,
    tags: ['React.js', 'Next.js', 'Zustand', 'NestJS', 'TypeScript', 'Docker', 'Kubernetes', 'AWS', 'Sentry', 'LaunchDarkly', 'MySQL'],
    tagColors: ['', '', '', '', '', 'p', 'p', '', 'g', 'a', ''],
    highlights: [
      'Built responsive, reusable UI components with SSR optimization using React + Next.js',
      'Managed global state with Zustand — reduced re-renders and simplified data flow across modular components',
      'Implemented LaunchDarkly feature flags for safe production rollouts, A/B testing, and controlled exposure',
      'Developed comprehensive test suites with Jest and React Testing Library, increasing coverage',
      'Containerized services with Docker for environment consistency; deployed on Kubernetes with autoscaling',
      'Used AWS EC2, S3, SQS, SNS, Lambda, and CloudWatch for scalable infrastructure',
      'Integrated Sentry for real-time error monitoring and improved application stability',
    ],
    arch: {
      rows: [
        [{ label: 'React.js + Next.js', sub: 'Zustand · SSR', type: 'fe' }, { label: 'LaunchDarkly', sub: 'Feature Flags', type: 'sec' }],
        [{ label: 'NestJS Backend', sub: 'Guards · Modules · Pipes', type: 'be' }, { label: 'Sentry', sub: 'Error Monitoring', type: 'obs' }],
        [{ label: 'Docker + Kubernetes', sub: 'Containers · Autoscaling', type: 'cl' }],
        [{ label: 'AWS EC2 · S3', sub: 'Compute & Storage', type: 'cl' }, { label: 'SQS · SNS · Lambda', sub: 'Async Processing', type: 'cl' }],
        [{ label: 'MySQL', sub: 'Transactional Data', type: 'db' }, { label: 'CloudWatch', sub: 'Logs & Metrics', type: 'obs' }],
      ],
      arrows: ['↓ REST / GraphQL', '↓ Container Layer', '↓ Cloud Services', '↓ Database'],
    },
  },
  {
    id: 'lendingpoint',
    name: 'LendingPoint',
    company: 'Trantor Software',
    duration: '1 year',
    tagline: 'Fintech lending platform — loan management, real-time WebSocket merchant-customer communication, encrypted middleware, and loyalty rewards system.',
    domain: 'Financial Technology – Consumer Lending',
    featured: false,
    tags: ['React.js', 'React Native', 'Redux', 'NestJS', 'Node.js', 'WebSockets', 'MongoDB', 'MySQL', 'AWS', 'Microservices'],
    tagColors: ['', 'p', '', '', '', 'a', 'r', '', '', ''],
    highlights: [
      'Built React web and React Native mobile apps with Redux state management',
      'Implemented real-time WebSocket communication between merchants and customers for live loan negotiation',
      'Built NestJS middleware layer with encryption/decryption of API payload to protect financial data in transit',
      'Implemented Loggly-based API logging for request tracking and compliance audit trail',
      'Designed config-driven architecture controlling application flow — enabling feature toggles without deployments',
      'Built loan APIs using Node.js, MongoDB, and MySQL on a microservices architecture',
      'Designed transactional loyalty system to incentivize timely repayments aligned with fintech reward strategies',
    ],
    arch: {
      rows: [
        [{ label: 'React.js (Web)', sub: 'Redux State', type: 'fe' }, { label: 'React Native (Mobile)', sub: 'Redux State', type: 'fe' }],
        [{ label: 'WebSocket Server', sub: 'Merchant ↔ Customer', type: 'msg' }, { label: 'NestJS Middleware', sub: 'Encrypt/Decrypt · Logging', type: 'sec' }],
        [{ label: 'Node.js REST APIs', sub: 'Loan · Loyalty · Auth', type: 'be' }, { label: 'Config Service', sub: 'Feature Toggles', type: 'be' }],
        [{ label: 'MongoDB', sub: 'Loan Records', type: 'db' }, { label: 'MySQL', sub: 'Transactional Data', type: 'db' }],
        [{ label: 'AWS (EC2 · S3 · Lambda)', sub: 'Infrastructure', type: 'cl' }, { label: 'CloudWatch + Loggly', sub: 'Monitoring & Logs', type: 'obs' }],
      ],
      arrows: ['↓ API calls + WebSocket', '↓ Business Logic', '↓ Data Layer', '↓ Cloud & Monitoring'],
    },
  },
];

const miniProjects = [
  { name: 'Gemini (Google)', co: 'Trantor · Contract · 6 months', desc: 'AI model trainer — dataset curation, feedback loops, error analysis, bias detection, and responsible AI practices for Google Gemini multimodal tasks.', tags: ['React', 'AI/ML', 'Node.js', 'Python'], colors: ['', 'p', '', 'g'] },
  { name: 'InKind', co: 'Trantor · Contract · 4 months', desc: 'US restaurant capital platform with pre-purchased dining credit flows, loyalty program module, middleware security, and AWS monitoring.', tags: ['React', 'Redux', 'NestJS', 'MySQL', 'AWS'], colors: [] },
  { name: 'Landmark (MaxFashion)', co: 'Trantor · 6 months', desc: 'UAE e-commerce platform across 6 territories in 2 languages. Added features, fixed bugs, optimized page speed, and scaled as traffic grew.', tags: ['React', 'Redux', 'Next.js', 'MySQL', 'Node.js'], colors: [] },
  { name: 'CureFit (Cult.fit)', co: 'Trantor · 6 months', desc: 'Health and fitness platform — internal program management tool and microservice APIs for offers module using NestJS + MongoDB.', tags: ['React', 'NestJS', 'MongoDB', 'Microservices'], colors: [] },
  { name: 'Trackwick', co: 'Trantor · 6 months', desc: 'Real-time GPS employee tracking app. Built UI components, registration/auth APIs, and provided client support for production issues.', tags: ['React', 'Node.js', 'MongoDB', 'React Native'], colors: ['', '', '', 'p'] },
  { name: 'Axon Evidence (DEMS)', co: 'CartNYou + Recrosoft · ~1 year', desc: 'Cloud-based Digital Evidence Management System for law enforcement. Built React screens, REST API integrations, and Jest test suites.', tags: ['React', 'Angular', 'Node.js', 'MongoDB'], colors: [] },
  { name: 'Nationale-Apotheek', co: 'Recrosoft · 6 months', desc: 'Netherlands online pharmacy on Next.js + Storyblok CMS. Deployed on Vercel. Built components, handled APIs, and wrote test coverage.', tags: ['Next.js', 'Storyblok', 'Vercel', 'MySQL'], colors: [] },
  { name: 'Psydro / WildHire / Intuit', co: 'IZACCESS · 2017–2020', desc: 'Early career — built shopping platform (Psydro), freelance marketplace (WildHire), and TurboTax DIY components (Intuit). Full stack ownership.', tags: ['React', 'Node.js', 'Next.js', 'MySQL'], colors: [] },
];

function TagsRow({ tags, colors }: { tags: string[]; colors: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {tags.map((t, i) => {
        const c = colors[i] || '';
        return <span key={t} className={`tag${c ? ' tag-' + c : ''}`}>{t}</span>;
      })}
    </div>
  );
}

export default function ProjectsSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <section id="projects" className="section-alt">
      <div className="container">
        <div className="fade-in" style={{ marginBottom: 64 }}>
          <h2 className="sec-title">Projects</h2>
          <p style={{ color: '#6e869e', fontSize: '1rem', maxWidth: 560, lineHeight: 1.6 }}>
            Systems and products I&apos;ve designed and built — with architectural diagrams showing how the pieces connect.
          </p>
        </div>

        {/* Featured projects */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
          {projects.map((p, idx) => {
            const isOpen = expanded === p.id;
            const isFeatured = idx === 0;
            return (
              <div
                key={p.id}
                className="fade-in"
                style={{
                  gridColumn: isFeatured ? 'span 2' : 'span 1',
                  background: '#101e30',
                  border: '1px solid #1a2e46',
                  borderRadius: 12,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isOpen) e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#1f3858';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = '#1a2e46';
                }}
              >
                {/* Header */}
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: '0.75rem', color: '#6e869e', fontFamily: 'JetBrains Mono, monospace' }}>{p.company}</div>
                    {p.duration && (
                      <div style={{ fontSize: '0.72rem', color: '#3a5066', fontFamily: 'JetBrains Mono, monospace', padding: '2px 9px', background: '#07101f', borderRadius: 4 }}>{p.duration}</div>
                    )}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2eeff', marginBottom: 7, lineHeight: 1.2 }}>{p.name}</div>
                  <div style={{ fontSize: '0.87rem', color: '#6e869e', lineHeight: 1.5, marginBottom: 14 }}>{p.tagline}</div>
                  <TagsRow tags={p.tags} colors={p.tagColors} />
                </div>

                {/* Expanded body */}
                {isOpen && (
                  <div style={{ padding: 24, borderTop: '1px solid #1a2e46' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Domain</div>
                    <p style={{ fontSize: '0.86rem', color: '#6e869e', marginBottom: 20 }}>{p.domain}</p>

                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Key Contributions</div>
                    <ul style={{ paddingLeft: 18, listStyle: 'disc', marginBottom: 24 }}>
                      {p.highlights.map((h) => (
                        <li key={h} style={{ fontSize: '0.87rem', color: '#6e869e', lineHeight: 1.65, marginBottom: 5 }}>{h}</li>
                      ))}
                    </ul>

                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Architecture Diagram</div>
                    <div className="arch-wrap">
                      <div className="arch-flow">
                        {p.arch.rows.map((row, ri) => (
                          <div key={ri}>
                            <ArchRow nodes={row} />
                            {ri < p.arch.arrows.length && (
                              <div className="arch-arr">{p.arch.arrows[ri]}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Legend */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid #1a2e46' }}>
                        {[
                          { c: '#60a5fa', l: 'Frontend' }, { c: '#34d399', l: 'Backend' },
                          { c: '#fbbf24', l: 'Messaging' }, { c: '#f87171', l: 'Database' },
                          { c: '#a78bfa', l: 'Cloud' }, { c: '#f472b6', l: 'Security' },
                          { c: '#fb923c', l: 'AI' }, { c: '#00d4ff', l: 'Observability' },
                        ].map((leg) => (
                          <div key={leg.l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: '#3a5066' }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: leg.c }} />
                            {leg.l}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expand toggle */}
                <button
                  onClick={() => toggle(p.id)}
                  style={{
                    width: '100%', padding: '13px 24px',
                    textAlign: 'left', fontSize: '0.82rem', fontWeight: 600,
                    color: '#00d4ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'background 0.2s', background: 'none',
                    border: 'none', borderTop: '1px solid #1a2e46',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  {isOpen ? 'Hide Details' : 'View Full Details & Architecture Diagram'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Mini projects */}
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>More Projects</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {miniProjects.map((p) => (
            <div
              key={p.name}
              className="fade-in"
              style={{ background: '#101e30', border: '1px solid #1a2e46', borderRadius: 12, padding: 18, transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1f3858'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a2e46'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ fontSize: '0.97rem', fontWeight: 700, color: '#e2eeff', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>{p.co}</div>
              <div style={{ fontSize: '0.83rem', color: '#6e869e', lineHeight: 1.5, marginBottom: 10 }}>{p.desc}</div>
              <TagsRow tags={p.tags} colors={p.colors} />
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}

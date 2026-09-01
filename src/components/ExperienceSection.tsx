'use client';

const jobs = [
  {
    role: 'Team Lead / Senior Software Engineer',
    company: 'Nous Infosystems',
    period: 'Apr 2024 – Oct 2025',
    current: true,
    desc: 'Led engineering teams building institutional banking platforms for Commonwealth Bank of Australia. Designed microservice architectures, event-driven systems with Kafka and Temporal, and AI-powered developer tooling using Claude Skills and RAG pipelines.',
    projects: [{ label: 'Commonwealth Bank of Australia', color: 'default' }],
  },
  {
    role: 'Full-Stack Engineer / Team Lead',
    company: 'Trantor Software Pvt. Ltd.',
    period: 'Mar 2022 – Apr 2024',
    current: false,
    desc: 'Delivered full-stack solutions across fintech, e-commerce, AI, and health verticals. Led teams, conducted code reviews, architected microservices, and built loyalty systems.',
    projects: [
      { label: 'LendingPoint', color: 'default' },
      { label: 'PCG Education', color: 'amber' },
      { label: 'Zengines AI', color: 'green' },
      { label: 'InKind', color: 'default' },
      { label: 'Gemini (Google)', color: 'purple' },
      { label: 'CureFit', color: 'default' },
      { label: 'Landmark', color: 'default' },
    ],
  },
  {
    role: 'Software Engineer (Contract)',
    company: 'Recrosoft Technologies Pvt. Ltd.',
    period: 'Sep 2021 – Feb 2022',
    current: false,
    desc: 'Built and shipped features for Axon (Digital Evidence Management System) and Nationale-Apotheek (Netherlands pharmacy). Delivered UI components, backend APIs, and unit tests.',
    projects: [
      { label: 'Axon (Evidence)', color: 'default' },
      { label: 'Nationale-Apotheek', color: 'default' },
    ],
  },
  {
    role: 'Software Engineer',
    company: 'CartNYou Retails Pvt. Ltd.',
    period: 'Sep 2020 – Aug 2021',
    current: false,
    desc: 'Worked on Axon Evidence Management System — a cloud-based digital evidence platform for law enforcement. Built React UI screens, integrated REST APIs, and wrote test suites.',
    projects: [{ label: 'Axon (DEMS)', color: 'default' }],
  },
  {
    role: 'Software Engineer',
    company: 'IZACCESS',
    period: 'Dec 2017 – Aug 2020',
    current: false,
    desc: 'Spent 3 years building diverse applications from scratch — e-commerce platforms, freelance marketplaces, tax tools, phone retail apps, and review platforms. Foundation years of full-stack development.',
    projects: [
      { label: 'Shopiji', color: 'default' },
      { label: 'Psydro', color: 'default' },
      { label: 'WildHire', color: 'default' },
      { label: 'Intuit', color: 'default' },
      { label: 'Mobiles N You', color: 'default' },
    ],
  },
];

const tagStyle = (color: string) => {
  if (color === 'purple') return 'tag tag-p';
  if (color === 'green') return 'tag tag-g';
  if (color === 'amber') return 'tag tag-a';
  return 'tag';
};

export default function ExperienceSection() {
  return (
    <section id="experience" className="section-alt">
      <div className="container">
        <div className="fade-in" style={{ marginBottom: 64 }}>
          <h2 className="sec-title">Work Experience</h2>
          <p style={{ color: '#6e869e', fontSize: '1rem', maxWidth: 560, lineHeight: 1.6 }}>
            8+ years across fintech, institutional banking, education, e-commerce, and AI domains.
          </p>
        </div>

        <div style={{ position: 'relative', maxWidth: 800 }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute', left: 20, top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(to bottom, #00d4ff, #7c3aed)',
          }} />

          {jobs.map((job) => (
            <div key={job.company} className="fade-in" style={{ position: 'relative', paddingLeft: 58, marginBottom: 36 }}>
              {/* Dot */}
              <div style={{
                position: 'absolute', left: 12, top: 8,
                width: 17, height: 17, borderRadius: '50%',
                background: job.current ? '#00d4ff' : '#101e30',
                border: `3px solid #00d4ff`, zIndex: 1,
              }} />

              <div
                style={{
                  background: '#101e30',
                  border: '1px solid #1a2e46',
                  borderRadius: 12,
                  padding: 22,
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1f3858')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1a2e46')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e2eeff' }}>{job.role}</div>
                    <div style={{ fontSize: '0.87rem', color: '#00d4ff', fontWeight: 500, marginTop: 2 }}>{job.company}</div>
                  </div>
                  <div style={{
                    fontSize: '0.75rem', color: '#3a5066',
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: '3px 9px', background: '#07101f', borderRadius: 4, whiteSpace: 'nowrap',
                  }}>
                    {job.period}
                  </div>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#6e869e', marginBottom: 10 }}>{job.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {job.projects.map((p) => (
                    <span key={p.label} className={tagStyle(p.color)}>{p.label}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

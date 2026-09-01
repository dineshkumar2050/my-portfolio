'use client';

const categories = [
  {
    icon: '🖥️',
    label: 'Frontend',
    color: '#60a5fa',
    tags: ['React.js', 'Next.js', 'TypeScript', 'JavaScript', 'Redux', 'Zustand', 'React Query', 'HTML5', 'CSS3', 'Webpack', 'Mantine UI', 'Material UI', 'Bootstrap', 'LaunchDarkly'],
  },
  {
    icon: '⚙️',
    label: 'Backend',
    color: '#34d399',
    tags: ['Node.js', 'NestJS', 'Express.js', 'Java', 'Spring Boot', 'Python', 'Django', 'REST APIs', 'GraphQL', 'WebSockets', 'Kafka', 'Temporal Workflows'],
  },
  {
    icon: '🗄️',
    label: 'Databases',
    color: '#f87171',
    tags: ['MySQL', 'PostgreSQL', 'MongoDB', 'JSONB', 'Query Optimization', 'Schema Design'],
  },
  {
    icon: '☁️',
    label: 'Cloud & DevOps',
    color: '#a78bfa',
    tags: ['AWS ECS', 'AWS S3', 'EC2', 'ALB', 'CloudWatch', 'Lambda', 'SQS/SNS', 'Docker', 'Kubernetes', 'CI/CD', 'HashiCorp Vault', 'Vercel'],
  },
  {
    icon: '📊',
    label: 'Observability & Testing',
    color: '#00d4ff',
    tags: ['Grafana', 'Prometheus', 'PagerDuty', 'Sentry', 'Observe', 'Obstack', 'Jest', 'React Testing Library', 'Enzyme'],
  },
  {
    icon: '🧠',
    label: 'Architecture & AI',
    color: '#fb923c',
    tags: ['Microservices', 'Micro-frontends', 'HLD & LLD', 'DSA', 'RAG Pipelines', 'Claude Skills', 'Spec-Kit', 'Event-Driven Design', 'DHP', 'ServiceNow'],
  },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="section">
      <div className="container">
        <div className="fade-in" style={{ marginBottom: 64 }}>
          <h2 className="sec-title">Skills & Technologies</h2>
          <p style={{ color: '#6e869e', fontSize: '1rem', maxWidth: 560, lineHeight: 1.6 }}>
            A comprehensive stack built over 8 years — from pixel-perfect UIs to cloud infrastructure and AI pipelines.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: 20,
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="fade-in"
              style={{
                background: '#101e30',
                border: '1px solid #1a2e46',
                borderRadius: 12,
                padding: 26,
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1f3858')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1a2e46')}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 18,
                fontSize: '0.82rem', fontWeight: 800,
                color: cat.color,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7,
                  background: `${cat.color}14`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem',
                }}>
                  {cat.icon}
                </div>
                {cat.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {cat.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '5px 13px',
                      borderRadius: 6,
                      fontSize: '0.77rem',
                      fontWeight: 500,
                      fontFamily: 'JetBrains Mono, monospace',
                      background: 'rgba(255,255,255,0.035)',
                      color: '#6e869e',
                      border: '1px solid #1a2e46',
                      transition: 'all 0.2s',
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${cat.color}14`;
                      e.currentTarget.style.color = cat.color;
                      e.currentTarget.style.borderColor = `${cat.color}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.035)';
                      e.currentTarget.style.color = '#6e869e';
                      e.currentTarget.style.borderColor = '#1a2e46';
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

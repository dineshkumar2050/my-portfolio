'use client';

const highlights = [
  { icon: '📅', num: '8+', txt: 'Years Experience' },
  { icon: '📁', num: '15+', txt: 'Major Projects' },
  { icon: '🏭', num: '5', txt: 'Industries' },
  { icon: '👥', num: '3', txt: 'Teams Led' },
  { icon: '⚙️', num: '30+', txt: 'Technologies' },
  { icon: '☁️', num: '3', txt: 'Cloud Platforms' },
];

export default function AboutSection() {
  return (
    <section id="about" className="section-alt">
      <div className="container">
        <div
          className="fade-in"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
            alignItems: 'center',
          }}
        >
          {/* Text */}
          <div>
            <div style={{ marginBottom: 48 }}>
              <h2 className="sec-title">About Me</h2>
              <p style={{ color: '#6e869e', fontSize: '1rem', lineHeight: 1.6 }}>
                Building software that scales — from startup MVPs to enterprise banking platforms.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                <>I&apos;m a <strong style={{color:'#e2eeff'}}>Software Engineer and Application Architect</strong> with 8+ years building full-stack web applications, microservices architectures, and cloud-native systems across 5 companies and 15+ projects.</>,
                <>My career spans from early-stage startups to <strong style={{color:'#e2eeff'}}>Commonwealth Bank of Australia</strong> — one of the world&apos;s largest financial institutions — where I led the design of resilient event-driven banking systems using Kafka, Temporal, NestJS, and AWS.</>,
                <>I hold a <strong style={{color:'#e2eeff'}}>B.Tech from DCRUST</strong> and have evolved my skills to include AI-assisted development workflows, RAG pipelines, and LLM-integrated engineering tooling using Claude Skills.</>,
                <>Beyond code, I&apos;m passionate about <strong style={{color:'#e2eeff'}}>mentoring developers</strong>, driving engineering culture, and delivering business value through technology — reliably, securely, and at scale.</>,
              ].map((text, i) => (
                <p key={i} style={{ color: '#6e869e', lineHeight: 1.8, fontSize: '0.97rem' }}>{text}</p>
              ))}
            </div>
          </div>

          {/* Highlights grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
            }}
          >
            {highlights.map((h) => (
              <div
                key={h.num}
                style={{
                  background: '#101e30',
                  border: '1px solid #1a2e46',
                  borderRadius: 12,
                  padding: '22px',
                  transition: 'all 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = '#00d4ff';
                  el.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = '#1a2e46';
                  el.style.transform = 'none';
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 9,
                  background: 'rgba(0,212,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', marginBottom: 10,
                }}>
                  {h.icon}
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#e2eeff' }}>{h.num}</div>
                <div style={{ fontSize: '0.78rem', color: '#6e869e', marginTop: 3 }}>{h.txt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

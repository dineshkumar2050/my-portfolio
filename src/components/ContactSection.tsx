'use client';

const contacts = [
  { icon: '📞', label: 'Phone', value: '+91 9560163362', href: 'tel:+919560163362', color: '#10b981' },
  { icon: '💬', label: 'WhatsApp', value: '+91 9560163362', href: 'https://wa.me/919560163362', color: '#25d366' },
  { icon: '💬', label: 'WhatsApp Alternate', value: '+91 8448724187', href: 'https://wa.me/918448724187', color: '#10b981' },
  { icon: '✉️', label: 'Email', value: 'dinesh.kumar.199998888@gmail.com', href: 'mailto:dinesh.kumar.199998888@gmail.com', color: '#00d4ff' },
  { icon: '📍', label: 'Location', value: 'India · Open to Remote / Relocation', href: null, color: '#f59e0b' },
  { icon: '🕒', label: 'Availability', value: 'Open to new opportunities', href: null, color: '#7c3aed' },
];

const edu = [
  { degree: 'B.Tech', inst: 'DCRUST (Deenbandhu Chhotu Ram University of Science & Technology)', place: 'Murthal, Haryana', color: '#00d4ff' },
  { degree: '12th — CBSE', inst: 'Science Stream · Mathematics · Physics · Chemistry', place: 'CBSE Board', color: '#7c3aed' },
  { degree: '10th — CBSE', inst: 'Central Board of Secondary Education', place: 'CBSE Board', color: '#10b981' },
];

export default function ContactSection() {
  return (
    <section id="contact" className="section-alt">
      <div className="container">
        <div className="fade-in" style={{ marginBottom: 60 }}>
          <h2 className="sec-title">Get In Touch</h2>
          <p style={{ color: '#6e869e', fontSize: '1rem', maxWidth: 560, lineHeight: 1.6 }}>
            Open to senior engineering roles, tech lead positions, and consulting engagements globally. Prefer full-remote or hybrid.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Contact cards */}
          <div>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Reach Out</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {contacts.map((c) => (
                <div
                  key={c.label}
                  className="fade-in"
                  style={{ background: '#101e30', border: '1px solid #1a2e46', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.color + '60'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a2e46'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: c.color + '18', border: `1px solid ${c.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#3a5066', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{c.label}</div>
                    {c.href ? (
                      <a href={c.href} target={c.href.startsWith('https://wa.me') ? '_blank' : undefined} rel={c.href.startsWith('https://wa.me') ? 'noopener noreferrer' : undefined} style={{ fontSize: '0.93rem', color: c.color, fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                        {c.value}
                      </a>
                    ) : (
                      <div style={{ fontSize: '0.93rem', color: '#9cb3c7', fontWeight: 500 }}>{c.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Education</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {edu.map((e) => (
                <div
                  key={e.degree}
                  className="fade-in"
                  style={{ background: '#101e30', border: '1px solid #1a2e46', borderRadius: 12, padding: '18px 22px', transition: 'all 0.2s' }}
                  onMouseEnter={(ev) => { ev.currentTarget.style.borderColor = e.color + '50'; ev.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={(ev) => { ev.currentTarget.style.borderColor = '#1a2e46'; ev.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.color, marginTop: 7, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.97rem', fontWeight: 700, color: '#e2eeff', marginBottom: 3 }}>{e.degree}</div>
                      <div style={{ fontSize: '0.85rem', color: '#9cb3c7', lineHeight: 1.4, marginBottom: 4 }}>{e.inst}</div>
                      <div style={{ fontSize: '0.75rem', color: '#3a5066', fontFamily: 'JetBrains Mono, monospace' }}>{e.place}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick facts */}
            <div style={{ marginTop: 20, background: '#101e30', border: '1px solid #1a2e46', borderRadius: 12, padding: 22 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3a5066', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Quick Facts</div>
              {[
                { label: 'Experience', val: '8+ Years' },
                { label: 'Industries', val: 'Banking · Fintech · EdTech · AI · Healthcare · E-commerce' },
                { label: 'Countries', val: 'Australia · USA · Netherlands · UAE · India' },
                { label: 'Team size led', val: 'Up to 8 engineers' },
              ].map((f) => (
                <div key={f.label} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '0.75rem', color: '#3a5066', fontWeight: 700, minWidth: 90, textTransform: 'uppercase', letterSpacing: '0.04em', paddingTop: 1 }}>{f.label}</div>
                  <div style={{ fontSize: '0.85rem', color: '#9cb3c7' }}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

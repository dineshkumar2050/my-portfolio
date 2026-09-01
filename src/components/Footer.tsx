export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: '#07101f', borderTop: '1px solid #1a2e46', padding: '32px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#e2eeff', marginBottom: 4 }}>Dinesh Kumar</div>
          <div style={{ fontSize: '0.82rem', color: '#3a5066' }}>Senior Software Engineer · Team Lead · 8+ Years</div>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#3a5066', textAlign: 'right' }}>
          <div>
            <a href="https://wa.me/919560163362" target="_blank" rel="noopener noreferrer" style={{ color: '#3a5066', textDecoration: 'none' }}>
              WhatsApp: +91 9560163362
            </a>
          </div>
          <div>
            <a href="https://wa.me/918448724187" target="_blank" rel="noopener noreferrer" style={{ color: '#3a5066', textDecoration: 'none' }}>
              WhatsApp Alt: +91 8448724187
            </a>
          </div>
          <div>dinesh.kumar.199998888@gmail.com</div>
          <div style={{ marginTop: 6, color: '#1f3858' }}>© {year} Dinesh Kumar. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}

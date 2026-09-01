'use client';
import { useState, useEffect } from 'react';
import { learningTopics, LearningTopic } from '@/data/learnings';

const categories = ['All', 'Frontend', 'Backend', 'Architecture', 'Infrastructure', 'Data', 'Observability', 'AI & ML', 'Career'];

export default function LearningsSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<LearningTopic | null>(null);

  const filtered = learningTopics.filter((t) => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Close modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setModal(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modal]);

  return (
    <section id="learnings" className="section">
      <div className="container">
        <div className="fade-in" style={{ marginBottom: 48 }}>
          <h2 className="sec-title">Learning Hub</h2>
          <p style={{ color: '#6e869e', fontSize: '1rem', maxWidth: 600, lineHeight: 1.6 }}>
            Comprehensive deep-dive references and interview Q&amp;A across 40+ topics — built and maintained by Dinesh Kumar.
          </p>
        </div>

        {/* Search + filter */}
        <div className="fade-in" style={{ marginBottom: 32 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Search topics..."
            style={{
              width: '100%', maxWidth: 400,
              background: '#101e30', border: '1px solid #1a2e46',
              borderRadius: 8, padding: '10px 16px',
              color: '#e2eeff', fontSize: '0.92rem',
              outline: 'none', marginBottom: 16,
              fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#00d4ff')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#1a2e46')}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 16px', borderRadius: 20, fontSize: '0.83rem', fontWeight: 500,
                  border: `1px solid ${activeCategory === cat ? '#00d4ff' : '#1a2e46'}`,
                  background: activeCategory === cat ? 'rgba(0,212,255,0.1)' : 'transparent',
                  color: activeCategory === cat ? '#00d4ff' : '#6e869e',
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p style={{ color: '#3a5066', fontSize: '0.82rem', marginBottom: 20 }}>
          {filtered.length} topic{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
          {filtered.map((topic) => (
            <div
              key={topic.id}
              className="fade-in"
              onClick={() => setModal(topic)}
              style={{
                background: '#101e30', border: '1px solid #1a2e46',
                borderRadius: 10, padding: '18px 20px',
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = topic.catColor;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 20px ${topic.catColor}18`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1a2e46';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                  fontWeight: 700, color: '#e2eeff', fontSize: '0.97rem',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{topic.icon}</span>
                  {topic.title}
                </span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, padding: '2px 9px',
                  borderRadius: 10, whiteSpace: 'nowrap',
                  background: `${topic.catColor}18`,
                  color: topic.catColor,
                  border: `1px solid ${topic.catColor}33`,
                }}>
                  {topic.category}
                </span>
              </div>
              <p style={{ fontSize: '0.83rem', color: '#6e869e', lineHeight: 1.5 }}>{topic.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 'auto', paddingTop: 4, color: '#00d4ff', fontSize: '0.8rem', fontWeight: 600 }}>
                Open Reference
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#3a5066' }}>
            No topics found for &quot;{search}&quot;
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.3rem' }}>{modal.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#e2eeff', fontSize: '1rem' }}>{modal.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6e869e' }}>{modal.category} · Learning Reference</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <a
                  href={`/learning-content/${modal.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600,
                    background: 'rgba(0,212,255,0.1)', color: '#00d4ff',
                    border: '1px solid rgba(0,212,255,0.2)',
                  }}
                >
                  Open in new tab ↗
                </a>
                <button
                  onClick={() => setModal(null)}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid #1f3858',
                    borderRadius: 8, width: 36, height: 36,
                    color: '#6e869e', cursor: 'pointer', fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              src={`/learning-content/${modal.file}`}
              style={{ flex: 1, width: '100%', border: 'none' }}
              title={modal.title}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </section>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED = [
  'What projects has Dinesh worked on?',
  'What are his core skills?',
  'Is Dinesh open to new opportunities?',
  'Tell me about his CBA project',
  'What companies has he worked at?',
  'How can I contact Dinesh?',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [configured, setConfigured] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm Dinesh's AI assistant. I can answer any questions about his background, skills, projects, or experience. What would you like to know?",
      }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || streaming) return;
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: q }];
    setMessages(newMessages);
    setStreaming(true);

    // Add empty assistant message to stream into
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 503) setConfigured(false);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: err.error || 'Something went wrong.' };
          return updated;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: accumulated };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Connection error. Please try again.' };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Chat with AI assistant"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 2000,
          width: 58, height: 58, borderRadius: '50%',
          background: open ? '#1a2e46' : 'linear-gradient(135deg,#00d4ff,#7c3aed)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: open ? 'none' : '0 4px 24px rgba(0,212,255,0.4)',
          transition: 'all 0.3s',
          color: '#fff',
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Unread indicator */}
      {!open && (
        <div style={{
          position: 'fixed', bottom: 76, right: 28, zIndex: 2000,
          background: 'rgba(7,16,31,0.95)', border: '1px solid #1a2e46',
          borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', color: '#6e869e',
          pointerEvents: 'none', whiteSpace: 'nowrap',
          animation: 'fadeIn 0.4s ease 1s both',
        }}>
          Ask me about Dinesh 💬
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: 'fixed', bottom: 100, right: 28, zIndex: 2000,
            width: 370, height: 520,
            background: '#0c1825', border: '1px solid #1a2e46', borderRadius: 20,
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            animation: 'chatSlideUp 0.25s ease',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #1a2e46',
            background: 'linear-gradient(135deg,#0d1f35,#1a1040)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg,#00d4ff,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', flexShrink: 0,
            }}>✦</div>
            <div>
              <div style={{ fontWeight: 700, color: '#e2eeff', fontSize: '0.92rem' }}>DK Assistant</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#3a5066' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: configured ? '#10b981' : '#f59e0b' }} />
                {configured ? 'Ask me anything about Dinesh' : 'Configure GOOGLE_API_KEY'}
              </div>
            </div>
            <button
              onClick={() => { setMessages([]); }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#3a5066', fontSize: '0.75rem', fontFamily: 'inherit', padding: '4px 8px', borderRadius: 6, transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#6e869e')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#3a5066')}
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', flexShrink: 0, marginRight: 8, marginTop: 2 }}>✦</div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg,#00d4ff22,#7c3aed22)' : '#101e30',
                  border: msg.role === 'user' ? '1px solid rgba(0,212,255,0.2)' : '1px solid #1a2e46',
                  fontSize: '0.855rem', color: msg.role === 'user' ? '#e2eeff' : '#9cb3c7',
                  lineHeight: 1.55,
                  wordBreak: 'break-word',
                }}>
                  {msg.content || (streaming && i === messages.length - 1 ? (
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {[0, 1, 2].map((d) => (
                        <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', display: 'inline-block', animation: `typingDot 1s ${d * 0.2}s infinite` }} />
                      ))}
                    </span>
                  ) : '')}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Suggested questions (only when just the welcome message) */}
          {messages.length === 1 && !streaming && (
            <div style={{ padding: '0 16px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTED.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    padding: '5px 10px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 500,
                    background: 'rgba(0,212,255,0.08)', color: '#00d4ff',
                    border: '1px solid rgba(0,212,255,0.18)', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.14)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.08)')}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 14px 14px', borderTop: '1px solid #1a2e46', display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Ask about Dinesh…"
              disabled={streaming}
              style={{
                flex: 1, background: '#101e30', border: '1px solid #1a2e46', borderRadius: 10,
                padding: '10px 14px', color: '#e2eeff', fontSize: '0.88rem',
                outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#00d4ff')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#1a2e46')}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              style={{
                width: 40, height: 40, borderRadius: 10, border: 'none', cursor: input.trim() && !streaming ? 'pointer' : 'default',
                background: input.trim() && !streaming ? 'linear-gradient(135deg,#00d4ff,#7c3aed)' : '#1a2e46',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}

    </>
  );
}

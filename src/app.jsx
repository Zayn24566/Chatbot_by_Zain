import React, { useState, useRef, useEffect } from 'react';

const suggestions = [
  { icon: '📊', text: 'Analyze a complex data set' },
  { icon: '📝', text: 'Write a summary of...' },
  { icon: '✏️', text: 'Suggest design improvements for...' },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (e, overrideInput) => {
    if (e) e.preventDefault();
    const text = overrideInput || input;
    if (!text.trim() || loading) return;

    setInput('');
    const nextHistory = [...messages, { role: 'user', content: text }];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextHistory }),
      });
      const data = await response.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Error processing response.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network fault. Check endpoint deployment status.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      background: 'radial-gradient(ellipse at 60% 20%, #1a2a4a 0%, #0a0f1e 60%, #000000 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e2e8f0',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background bokeh dots */}
      {[...Array(25)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          borderRadius: '50%',
          background: `rgba(${80 + (i * 37 % 100)}, ${120 + (i * 53 % 80)}, ${200 + (i * 17 % 55)}, ${0.12 + (i * 0.007)})`,
          width: `${5 + (i * 7 % 10)}px`,
          height: `${5 + (i * 7 % 10)}px`,
          top: `${(i * 13 % 100)}%`,
          left: `${(i * 17 % 100)}%`,
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }} />
      ))}

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b6fd4, #1a3a7a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '600', color: '#c8d8f8',
            border: '1px solid rgba(100,150,255,0.3)',
          }}>ZA</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#e8f0ff' }}>Zayn's AI Assistant</div>
            <div style={{ fontSize: '11px', color: 'rgba(180,200,255,0.5)' }}>by Muhammad Zain Azeem</div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '4px 12px',
        }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ fontSize: '12px', color: 'rgba(200,220,255,0.7)' }}>Online</span>
        </div>
      </header>

      {/* Chat area */}
      <main style={{
        flex: 1, overflowY: 'auto', padding: '24px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '16px', zIndex: 5,
      }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div style={{
            marginTop: '60px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            padding: '36px 32px',
            textAlign: 'center',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          }}>
            <p style={{ fontSize: '20px', fontWeight: '500', color: '#e8f0ff', marginBottom: '8px' }}>
              Session Initiated.
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(150,180,255,0.5)', fontFamily: 'monospace', marginBottom: '28px' }}>
              Memory context array is currently empty.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSubmit(null, s.text)} style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  color: 'rgba(200,220,255,0.8)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span>{s.icon}</span> {s.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, index) => (
          <div key={index} style={{
            maxWidth: '680px', width: '100%',
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '75%',
              background: msg.role === 'user'
                ? 'rgba(59,111,212,0.25)'
                : 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)',
              border: msg.role === 'user'
                ? '1px solid rgba(100,150,255,0.25)'
                : '1px solid rgba(255,255,255,0.08)',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              padding: '10px 16px',
            }}>
              <div style={{ fontSize: '10px', color: 'rgba(150,180,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {msg.role === 'user' ? 'You' : 'Zayn AI'}
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#dde8ff', whiteSpace: 'pre-wrap', margin: 0 }}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ maxWidth: '680px', width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px 18px 18px 4px',
              padding: '10px 16px',
            }}>
              <span style={{ fontSize: '11px', color: 'rgba(150,180,255,0.5)', fontFamily: 'monospace' }}>
                Thinking...
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </main>

      {/* Input area */}
      <div style={{
        padding: '16px 20px 20px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}>
        <form onSubmit={handleSubmit} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          maxWidth: '680px', width: '100%',
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '16px',
          padding: '8px 8px 8px 18px',
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask me anything..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: '14px', color: '#e2e8f0',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          />
          <button type="submit" disabled={loading || !input.trim()} style={{
            background: input.trim() && !loading ? 'rgba(59,111,212,0.8)' : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '500',
            color: input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.3)',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            ➤ Send
          </button>
        </form>
        <p style={{ fontSize: '11px', color: 'rgba(150,170,220,0.3)' }}>Built by Zayn Azeem</p>
      </div>

      {/* Sparkle corner */}
      <div style={{
        position: 'absolute', bottom: '24px', right: '24px',
        fontSize: '28px', opacity: 0.2, pointerEvents: 'none', zIndex: 1,
      }}>✦</div>

    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const currentPrompt = input;
    setInput('');

    // Append the user query to state history immediately
    const nextHistory = [...messages, { role: 'user', content: currentPrompt }];
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
        setMessages((prev) => [...prev, { role: 'assistant', content: "Error processing contextual response." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Network fault. Check endpoint deployment status." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      {/* Top Header navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-sm font-semibold tracking-wide text-zinc-200">Llama 3.3 Workspace</h1>
        </div>
        <span className="text-xs font-mono text-zinc-500">Groq SDK Live</span>
      </header>

      {/* Chat Box Container */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-4xl w-full mx-auto space-y-6 scrollbar-thin">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
            <p className="text-lg tracking-wide font-light">Session Initiated.</p>
            <p className="text-xs font-mono mt-1 text-zinc-400">Memory context array is currently empty.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex flex-col max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 border ${
              msg.role === 'user' 
                ? 'ml-auto bg-zinc-900 border-zinc-800 text-zinc-100' 
                : 'mr-auto bg-zinc-900/30 border-zinc-800/60 text-zinc-300'
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 mb-1">
              {msg.role === 'user' ? 'Client' : 'Agent Core'}
            </span>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {loading && (
          <div className="mr-auto bg-zinc-900/10 border border-zinc-800/40 rounded-2xl px-4 py-3 max-w-[75%]">
            <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 animate-pulse">Streaming Response Pending...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </main>

      {/* Bottom Form input wrapper */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-4 py-4 md:px-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Transmit data packets..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-zinc-100 text-zinc-950 text-sm font-medium rounded-xl px-5 py-3 hover:bg-zinc-200 transition disabled:opacity-30 disabled:hover:bg-zinc-100"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
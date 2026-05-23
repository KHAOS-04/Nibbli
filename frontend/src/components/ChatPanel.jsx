// ChatPanel.jsx — real-time chat panel inspired by the Seedling design reference
import React, { useState, useEffect, useRef } from 'react';

// Deterministic per-bubble color from the user's avatar color
// Maps pastel avatar colors → matching soft message bubble
const BUBBLE_PALETTE = {
  '#C4B5FD': { bg: 'bg-[#EDE9FE]',  text: 'text-[#5B21B6]' }, // purple
  '#FBCFE8': { bg: 'bg-[#FCE7F3]',  text: 'text-[#9D174D]' }, // pink
  '#FDE68A': { bg: 'bg-[#FEF3C7]',  text: 'text-[#92400E]' }, // yellow
  '#BAE6FD': { bg: 'bg-[#E0F2FE]',  text: 'text-[#075985]' }, // blue
  '#A7F3D0': { bg: 'bg-[#D1FAE5]',  text: 'text-[#065F46]' }, // green
  '#FED7AA': { bg: 'bg-[#FFEDD5]',  text: 'text-[#9A3412]' }, // orange
};

function getBubble(color) {
  return BUBBLE_PALETTE[color] || { bg: 'bg-nibbli-bg', text: 'text-nibbli-text' };
}

function timeLabel(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Single message bubble ──────────────────────────────────────────────────
function MessageBubble({ msg, isOwn }) {
  const bubble = getBubble(msg.userColor);
  const initials = msg.userName.slice(0, 2).toUpperCase();

  return (
    <div className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm"
        style={{ backgroundColor: msg.userColor }}
        title={msg.userName}
      >
        {initials}
      </div>

      <div className={`flex flex-col gap-0.5 max-w-[72%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name + time */}
        <div className={`flex items-baseline gap-2 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold text-nibbli-text">{msg.userName}</span>
          <span className="text-[10px] text-nibbli-muted">{timeLabel(msg.timestamp)}</span>
        </div>

        {/* Bubble */}
        <div className={`
          px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isOwn
            ? 'bg-nibbli-purpleDark text-white rounded-br-sm'
            : `${bubble.bg} ${bubble.text} rounded-bl-sm`
          }
        `}>
          {msg.text}
        </div>
      </div>
    </div>
  );
}

// ─── Typing indicator ───────────────────────────────────────────────────────
function TypingIndicator({ typingUsers }) {
  if (!typingUsers || typingUsers.length === 0) return <div className="h-5" />;

  const label = typingUsers.length === 1
    ? `${typingUsers[0]} is typing`
    : typingUsers.length === 2
      ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
      : 'Several people are typing';

  return (
    <div className="flex items-center gap-2 px-1 h-5">
      {/* Animated dots */}
      <div className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-nibbli-purple inline-block"
            style={{ animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <span className="text-xs text-nibbli-muted italic">{label}…</span>
    </div>
  );
}

// ─── Main ChatPanel ─────────────────────────────────────────────────────────
export default function ChatPanel({ user, messages, typingUsers, onSend, onTyping, roomName }) {
  const [input,     setInput]     = useState('');
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (e.target.value.trim()) onTyping();
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-8">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm font-medium text-nibbli-text">No messages yet</p>
            <p className="text-xs text-nibbli-muted mt-1">Be the first to say hi in {roomName}!</p>
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.userId === user?.id}
          />
        ))}

        {/* Typing indicator always lives here so scroll target is consistent */}
        <div className="px-1">
          <TypingIndicator typingUsers={typingUsers} />
        </div>

        {/* Invisible scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-nibbli-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          {/* Sender avatar pill */}
          {user && (
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: user.color }}
            >
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message…"
            maxLength={500}
            className="
              flex-1 px-4 py-2.5 rounded-xl border border-nibbli-border
              bg-nibbli-bg text-nibbli-text placeholder-nibbli-muted text-sm
              focus:outline-none focus:ring-2 focus:ring-nibbli-purple/50
              transition
            "
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="
              w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
              bg-nibbli-purpleDark text-white
              hover:opacity-90 active:scale-95
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all shadow-sm
            "
            title="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}

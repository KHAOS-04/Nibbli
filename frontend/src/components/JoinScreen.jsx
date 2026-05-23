// JoinScreen.jsx — name entry, first thing users see
import React, { useState } from 'react';
import nibbliLogo from '../assets/Nibbli.png';

export default function JoinScreen({ onJoin }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) onJoin(name.trim());
  };

  return (
    <div className="min-h-screen bg-nibbli-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-2">
          <img src={nibbliLogo} alt="Nibbli" className="h-64 mx-auto mb-0 object-contain" />
          <p className="text-nibbli-muted mt-2 text-sm">
            Cozy real-time collaboration for your team
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl3 shadow-panel p-8 border border-nibbli-border">
          <h2 className="text-lg font-semibold text-nibbli-text mb-1">
            Welcome! 👋
          </h2>
          <p className="text-nibbli-muted text-sm mb-6">
            Enter your name to join your workspace.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={30}
              autoFocus
              className="
                w-full px-4 py-3 rounded-xl border border-nibbli-border
                bg-nibbli-bg text-nibbli-text placeholder-nibbli-muted
                focus:outline-none focus:ring-2 focus:ring-nibbli-purple
                transition text-sm
              "
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="
                w-full py-3 rounded-xl font-semibold text-sm
                bg-nibbli-purpleDark text-white
                hover:opacity-90 active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all
              "
            >
              Enter Workspace
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-nibbli-muted mt-6">
          No account needed · Works locally · 100% cozy
        </p>
      </div>
    </div>
  );
}

// ActivityFeed.jsx — right panel with live activity log
import React from 'react';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000)   return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

// Pick a soft color for activity dot based on message type
function dotColor(msg) {
  if (msg.includes('created'))  return 'bg-nibbli-purple';
  if (msg.includes('moved'))    return 'bg-nibbli-yellow';
  if (msg.includes('deleted'))  return 'bg-red-300';
  if (msg.includes('joined'))   return 'bg-emerald-400';
  if (msg.includes('left'))     return 'bg-nibbli-muted';
  return 'bg-nibbli-blue';
}

export default function ActivityFeed({ activities }) {
  return (
    <aside className="
      w-64 flex-shrink-0 bg-white border-l border-nibbli-border
      flex flex-col h-screen overflow-hidden
    ">
      {/* Header */}
      <div className="px-4 py-5 border-b border-nibbli-border">
        <h2 className="font-semibold text-sm text-nibbli-text">Activity</h2>
        <p className="text-xs text-nibbli-muted mt-0.5">Live feed · auto-updates</p>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-2">
        {activities.length === 0 && (
          <p className="text-xs text-nibbli-muted text-center py-8">
            No activity yet. Start by joining a workspace!
          </p>
        )}
        {activities.map((entry) => (
          <div
            key={entry.id}
            className="
              flex gap-2.5 px-3 py-2.5 rounded-xl bg-nibbli-bg
              border border-nibbli-border/60
              animate-[fadeIn_0.3s_ease]
            "
          >
            {/* Colored dot */}
            <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${dotColor(entry.message)}`} />
            <div className="min-w-0">
              <p className="text-xs text-nibbli-text leading-snug">{entry.message}</p>
              <p className="text-[10px] text-nibbli-muted mt-0.5">{timeAgo(entry.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

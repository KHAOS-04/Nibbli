// ConnectionBadge.jsx — tiny live/offline pill
import React from 'react';
import { useSocket } from '../context/SocketContext';

export default function ConnectionBadge() {
  const { connected } = useSocket();
  return (
    <div className={`
      flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
      ${connected
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-red-100 text-red-600'
      }
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
      {connected ? 'Live' : 'Reconnecting…'}
    </div>
  );
}

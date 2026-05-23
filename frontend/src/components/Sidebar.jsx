// Sidebar.jsx — left panel with rooms and online users
import React from 'react';
import NibbliLogo from '../assets/Nibbli.png';

export default function Sidebar({ rooms, currentRoom, onRoomSelect, onlineUsers, user }) {
  return (
    <aside className="
      w-60 flex-shrink-0 bg-white border-r border-nibbli-border
      flex flex-col h-screen overflow-hidden
    ">
      {/* Logo */}
      <div className="px-0 py-0 border-b border-nibbli-border">
        <div className="flex items-center gap-2.5">
          <img src={NibbliLogo} alt="Nibbli" className="w-64 h-64 object-contain" />
          {/* <span className="text-xl font-bold text-nibbli-purpleDark tracking-tight">Nibbli</span> */}
        </div>
        {/* <p className="text-xs text-nibbli-muted mt-1">For ICT-119</p> */}
      </div>

      {/* Workspace Rooms */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        <p className="text-xs font-semibold text-nibbli-muted uppercase tracking-wider px-2 mb-2">
          Rooms
        </p>
        <nav className="space-y-1">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room.id)}
              className={`
                w-full text-left flex items-center gap-3 px-3 py-2.5
                rounded-xl text-sm font-medium transition-all
                ${currentRoom === room.id
                  ? 'bg-nibbli-purple/30 text-nibbli-purpleDark'
                  : 'text-nibbli-text hover:bg-nibbli-bg'
                }
              `}
            >
              <span className="text-base">{room.emoji}</span>
              <span className="truncate">{room.name}</span>
              {currentRoom === room.id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-nibbli-purpleDark flex-shrink-0" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Online Users */}
      <div className="border-t border-nibbli-border px-3 py-4">
        <p className="text-xs font-semibold text-nibbli-muted uppercase tracking-wider px-2 mb-2">
          Online Now · {onlineUsers.length}
        </p>
        <div className="space-y-1">
          {onlineUsers.map(u => (
            <div key={u.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: u.color }}
              >
                {u.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm text-nibbli-text truncate">{u.name}</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
            </div>
          ))}
          {onlineUsers.length === 0 && (
            <p className="text-xs text-nibbli-muted px-2">No one online yet</p>
          )}
        </div>
      </div>

      {/* Current user footer */}
      {user && (
        <div className="border-t border-nibbli-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: user.color }}
            >
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-nibbli-text truncate">{user.name}</p>
              <p className="text-xs text-emerald-500">● You</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

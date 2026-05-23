// RoomEmptyState.jsx — placeholder when no room is selected
import React from 'react';

export default function RoomEmptyState({ rooms, onRoomSelect }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🏠</div>
        <h2 className="text-xl font-bold text-nibbli-text mb-2">
          Pick a workspace
        </h2>
        <p className="text-nibbli-muted text-sm mb-8">
          Choose a room from the sidebar to start collaborating with your team.
        </p>
        <div className="grid grid-cols-1 gap-2">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room.id)}
              className="
                flex items-center gap-3 px-4 py-3 rounded-xl
                bg-white border border-nibbli-border shadow-card
                hover:border-nibbli-purple/50 hover:shadow-[0_4px_16px_rgba(139,92,246,0.10)]
                transition-all text-left
              "
            >
              <span className="text-xl">{room.emoji}</span>
              <span className="font-medium text-nibbli-text text-sm">{room.name}</span>
              <span className="ml-auto text-nibbli-muted text-xs">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

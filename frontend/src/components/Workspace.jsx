// Workspace.jsx — main layout: Sidebar | Chat | Board+Activity
// Tab toggle in header switches center between Chat view and Board view
import React, { useState } from 'react';
import Sidebar         from './Sidebar';
import KanbanBoard     from './KanbanBoard';
import ActivityFeed    from './ActivityFeed';
import RoomEmptyState  from './RoomEmptyState';
import ConnectionBadge from './ConnectionBadge';
import ChatPanel       from './ChatPanel';

export default function Workspace({
  user, rooms, currentRoom, tasks,
  activities, onlineUsers, editingMap,
  messages, typingUsers,
  onRoomSelect, onCreateTask, onMoveTask, onDeleteTask,
  onSendMessage, onTyping,
}) {
  // 'chat' | 'board'  — which panel is active in the center
  const [activeTab, setActiveTab] = useState('chat');

  const currentRoomMeta = rooms.find(r => r.id === currentRoom);

  const TAB_BASE = 'px-4 py-1.5 rounded-lg text-sm font-medium transition-all';
  const TAB_ON   = 'bg-nibbli-purpleDark text-white shadow-sm';
  const TAB_OFF  = 'text-nibbli-muted hover:text-nibbli-text hover:bg-nibbli-bg';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-nibbli-bg">

      {/* ── Left Sidebar ──────────────────────────────────────────────────── */}
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onRoomSelect={onRoomSelect}
        onlineUsers={onlineUsers}
        user={user}
      />

      {/* ── Center Panel ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-nibbli-border">

        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-nibbli-border flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {currentRoomMeta ? (
              <>
                <span className="text-lg">{currentRoomMeta.emoji}</span>
                <div className="min-w-0">
                  <h1 className="font-bold text-nibbli-text text-sm leading-tight truncate">
                    {currentRoomMeta.name}
                  </h1>
                  <p className="text-[11px] text-nibbli-muted">
                    {onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} online
                  </p>
                </div>
              </>
            ) : (
              <h1 className="font-bold text-nibbli-text">Nibbli</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Tab toggle — only show when a room is selected */}
            {currentRoom && (
              <div className="flex items-center gap-1 bg-nibbli-bg border border-nibbli-border rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`${TAB_BASE} ${activeTab === 'chat' ? TAB_ON : TAB_OFF}`}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setActiveTab('board')}
                  className={`${TAB_BASE} ${activeTab === 'board' ? TAB_ON : TAB_OFF}`}
                >
                  📋 Board
                </button>
              </div>
            )}
            <ConnectionBadge />
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">
          {!currentRoom ? (
            <RoomEmptyState rooms={rooms} onRoomSelect={onRoomSelect} />
          ) : activeTab === 'chat' ? (
            /* ── Chat view ── */
            <ChatPanel
              user={user}
              messages={messages}
              typingUsers={typingUsers}
              onSend={onSendMessage}
              onTyping={onTyping}
              roomName={currentRoomMeta?.name || ''}
            />
          ) : (
            /* ── Board view ── */
            <div className="h-full p-5">
              <KanbanBoard
                tasks={tasks}
                editingMap={editingMap}
                onMove={onMoveTask}
                onDelete={onDeleteTask}
                onCreate={onCreateTask}
              />
            </div>
          )}
        </div>
      </main>

      {/* ── Right Panel — Activity Feed ────────────────────────────────────── */}
      <ActivityFeed activities={activities} />

    </div>
  );
}

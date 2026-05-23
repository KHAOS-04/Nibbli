// KanbanColumn.jsx — droppable column with sortable task list
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const COLUMN_META = {
  todo: {
    label:    'To Do',
    emoji:    '📋',
    accent:   'border-nibbli-purple/40',
    badge:    'bg-nibbli-purple/20 text-nibbli-purpleDark',
    btnColor: 'text-nibbli-purpleDark hover:bg-nibbli-purple/10',
    dropBg:   'bg-nibbli-purple/5',
  },
  doing: {
    label:    'Doing',
    emoji:    '⚡',
    accent:   'border-nibbli-yellow/60',
    badge:    'bg-nibbli-yellow/40 text-yellow-700',
    btnColor: 'text-yellow-600 hover:bg-nibbli-yellow/20',
    dropBg:   'bg-nibbli-yellow/10',
  },
  done: {
    label:    'Done',
    emoji:    '✅',
    accent:   'border-emerald-300',
    badge:    'bg-emerald-100 text-emerald-700',
    btnColor: 'text-emerald-600 hover:bg-emerald-50',
    dropBg:   'bg-emerald-50',
  },
};

export default function KanbanColumn({
  status, tasks, editingMap,
  onDelete, onCreateTask,
}) {
  const [adding,   setAdding]   = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const meta = COLUMN_META[status];

  // Make this column a drop target
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onCreateTask(newTitle.trim());
      setNewTitle('');
      setAdding(false);
    }
  };

  return (
    <div className={`
      flex flex-col rounded-xl2 border-t-2 ${meta.accent}
      border border-nibbli-border min-h-0 flex-1
      transition-colors duration-150
      ${isOver ? meta.dropBg : 'bg-nibbli-bg'}
    `}>
      {/* Column header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-nibbli-border">
        <span className="text-base">{meta.emoji}</span>
        <h3 className="font-semibold text-sm text-nibbli-text">{meta.label}</h3>
        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
          {tasks.length}
        </span>
      </div>

      {/* Cards — SortableContext wraps the sortable items inside this droppable */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-2.5"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              editingBy={editingMap[task.id] || null}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && !adding && (
          <div className={`
            flex items-center justify-center h-20 rounded-xl border-2 border-dashed
            text-xs text-nibbli-muted transition-colors duration-150
            ${isOver ? 'border-nibbli-purple/40 text-nibbli-purpleDark' : 'border-nibbli-border'}
          `}>
            {isOver ? 'Drop here' : 'No tasks yet'}
          </div>
        )}
      </div>

      {/* Add task area */}
      <div className="px-3 pb-3">
        {adding ? (
          <form onSubmit={handleAdd} className="space-y-2">
            <textarea
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) handleAdd(e);
                if (e.key === 'Escape') { setAdding(false); setNewTitle(''); }
              }}
              placeholder="Task title…"
              rows={2}
              maxLength={120}
              className="
                w-full px-3 py-2 text-sm rounded-xl border border-nibbli-border
                bg-white text-nibbli-text placeholder-nibbli-muted resize-none
                focus:outline-none focus:ring-2 focus:ring-nibbli-purple transition
              "
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="
                  flex-1 py-1.5 rounded-lg text-xs font-semibold
                  bg-nibbli-purpleDark text-white
                  hover:opacity-90 disabled:opacity-40 transition
                "
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setNewTitle(''); }}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-nibbli-bg text-nibbli-muted hover:bg-nibbli-border transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className={`
              w-full py-2 rounded-xl text-xs font-medium
              border border-dashed border-nibbli-border
              ${meta.btnColor} transition-all
            `}
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
}

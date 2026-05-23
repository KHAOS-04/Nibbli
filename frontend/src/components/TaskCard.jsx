// TaskCard.jsx — draggable task card with delete button
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TaskCard({ task, editingBy, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group bg-white rounded-xl2 border border-nibbli-border shadow-card
        p-3.5 relative select-none
        hover:shadow-[0_4px_16px_rgba(139,92,246,0.14)]
        transition-shadow
        ${isDragging ? 'ring-2 ring-nibbli-purple/40 z-50' : ''}
      `}
    >
      {/* Editing indicator */}
      {editingBy && (
        <div className="flex items-center gap-1 mb-2 text-xs text-nibbli-purpleDark font-medium animate-pulse">
          <span>✏️</span>
          <span>{editingBy} is editing…</span>
        </div>
      )}

      {/* Task title */}
      <p className="text-sm font-medium text-nibbli-text leading-snug pr-6">
        {task.title}
      </p>

      {/* Meta row */}
      <div className="flex items-center justify-between mt-2.5">
        <span className="text-xs text-nibbli-muted">by {task.createdBy}</span>
        <span className="text-xs text-nibbli-muted">{timeAgo(task.createdAt)}</span>
      </div>

      {/* Delete button — pointer-events isolated so it doesn't trigger drag */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
        onPointerDown={(e) => e.stopPropagation()}
        className="
          absolute top-2.5 right-2.5
          opacity-0 group-hover:opacity-100
          w-6 h-6 rounded-md flex items-center justify-center
          text-nibbli-muted hover:bg-red-50 hover:text-red-400
          transition-all text-xs
        "
        title="Delete task"
      >
        ✕
      </button>
    </div>
  );
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000)   return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

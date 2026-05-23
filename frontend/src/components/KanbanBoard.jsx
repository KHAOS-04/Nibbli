// KanbanBoard.jsx — DnDContext root; handles drag end and cross-column moves
import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import TaskCard     from './TaskCard';

const STATUSES = ['todo', 'doing', 'done'];

export default function KanbanBoard({
  tasks, editingMap,
  onMove, onDelete, onCreate,
}) {
  // activeTask drives the DragOverlay (the floating card while dragging)
  const [activeTask, setActiveTask] = useState(null);

  // Require 5px movement before drag starts — prevents accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  // Find which column a task currently lives in
  function findColumnOfTask(taskId) {
    return STATUSES.find(s => tasksByStatus[s].some(t => t.id === taskId));
  }

  function handleDragStart({ active }) {
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  }

  function handleDragEnd({ active, over }) {
    setActiveTask(null);
    if (!over) return;

    const draggedId  = active.id;
    const overId     = over.id;           // could be a column id OR another task id

    const sourceCol  = findColumnOfTask(draggedId);
    // Determine target column: if dropped directly on a column droppable, use that.
    // If dropped on another task, use that task's column.
    const targetCol  = STATUSES.includes(overId)
      ? overId
      : findColumnOfTask(overId);

    if (!sourceCol || !targetCol) return;

    if (sourceCol !== targetCol) {
      // Cross-column move → tell the server
      onMove(draggedId, targetCol);
    }
    // Same-column reorder is purely visual in this app (server keeps insertion order).
    // For an academic project this is fine — ordering isn't persisted.
  }

  function handleDragCancel() {
    setActiveTask(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 h-full min-h-0">
        {STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            editingMap={editingMap}
            onDelete={onDelete}
            onCreateTask={onCreate}
          />
        ))}
      </div>

      {/* Floating card that follows the cursor while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="rotate-1 scale-105 opacity-95 pointer-events-none">
            <TaskCard
              task={activeTask}
              editingBy={null}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

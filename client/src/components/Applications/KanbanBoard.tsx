import React, { useState, useRef } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  useSensor, useSensors, PointerSensor, useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ApplicationCard from './ApplicationCard';
import Portal from '../Common/Portal';

const STATUSES = ['Applied', 'Phone Screen', 'Technical', 'Onsite', 'Offer', 'Accepted', 'Rejected'];

const COLUMN_STYLES = {
  'Applied':      'bg-blue-50/60 border-blue-100',
  'Phone Screen': 'bg-yellow-50/60 border-yellow-100',
  'Technical':    'bg-purple-50/60 border-purple-100',
  'Onsite':       'bg-orange-50/60 border-orange-100',
  'Offer':        'bg-pink-50/60 border-pink-100',
  'Accepted':     'bg-green-50/60 border-green-100',
  'Rejected':     'bg-gray-50/60 border-gray-100',
};

function SortableCard({ application, onEdit, onDelete, appsWithInterviews }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: application._id });

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className="opacity-0 h-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <ApplicationCard application={application} onEdit={onEdit} onDelete={onDelete} dragging={false} appsWithInterviews={appsWithInterviews} />
    </div>
  );
}

function Column({ status, applications, onEdit, onDelete, appsWithInterviews }) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex-shrink-0 w-64">
      <div className={`${COLUMN_STYLES[status] ?? 'bg-gray-50/60 border-gray-100'} border rounded-3xl p-3 min-h-[400px]`}>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-sm font-semibold text-gray-700">{status}</span>
          <span className="bg-white/80 text-gray-500 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {applications.length}
          </span>
        </div>
        <SortableContext items={applications.map((a) => a._id)} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="space-y-2 min-h-[50px]">
            {applications.map((app) => (
              <SortableCard key={app._id} application={app} onEdit={onEdit} onDelete={onDelete} appsWithInterviews={appsWithInterviews} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export default function KanbanBoard({ applications, onEdit, onDelete, onStatusChange, appsWithInterviews }) {
  const [activeApp, setActiveApp] = useState(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = applications.filter((a) => a.status === s);
    return acc;
  }, {});

  const findStatus = (id) => {
    for (const s of STATUSES) {
      if (byStatus[s].some((a) => a._id === id)) return s;
    }
    return null;
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveApp(null);
    if (!over) return;
    const from = findStatus(active.id);
    const to = STATUSES.includes(over.id) ? over.id : findStatus(over.id);
    if (from && to && from !== to) onStatusChange(active.id, to);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'right' ? 300 : -300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Scroll left button */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 hover:shadow-lg transition-all duration-200"
        aria-label="Scroll left"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveApp(applications.find((a) => a._id === active.id) ?? null)}
        onDragEnd={handleDragEnd}
      >
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {STATUSES.map((s) => (
            <Column key={s} status={s} applications={byStatus[s]} onEdit={onEdit} onDelete={onDelete} appsWithInterviews={appsWithInterviews} />
          ))}
        </div>
        <Portal>
          <DragOverlay dropAnimation={null}>
            {activeApp ? (
              <div style={{ cursor: 'grabbing' }}>
                <ApplicationCard application={activeApp} onEdit={() => {}} onDelete={() => {}} dragging appsWithInterviews={new Set()} />
              </div>
            ) : null}
          </DragOverlay>
        </Portal>
      </DndContext>

      {/* Scroll right button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 hover:shadow-lg transition-all duration-200"
        aria-label="Scroll right"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
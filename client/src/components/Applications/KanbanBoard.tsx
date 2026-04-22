import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  useSensor, useSensors, PointerSensor,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ApplicationCard from './ApplicationCard';

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

const COL_WIDTH = 256 + 12; // w-64 (256px) + gap-3 (12px)

function SortableCard({ application, onEdit, onDelete, contactMap, interviewSet }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: application._id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}>
      <ApplicationCard
        application={application}
        onEdit={onEdit}
        onDelete={onDelete}
        dragging={isDragging}
        hasInterview={interviewSet.has(application._id)}
        contactName={contactMap[application._id] ?? null}
      />
    </div>
  );
}

function Column({ status, applications, onEdit, onDelete, contactMap, interviewSet }) {
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
          <div className="space-y-2">
            {applications.map((app) => (
              <SortableCard
                key={app._id}
                application={app}
                onEdit={onEdit}
                onDelete={onDelete}
                contactMap={contactMap}
                interviewSet={interviewSet}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export default function KanbanBoard({ applications, onEdit, onDelete, onStatusChange, contactMap = {}, interviewSet = new Set() }) {
  const [activeApp, setActiveApp] = useState(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
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

  // ── scroll arrow logic ────────────────────────────────────────────────────

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect(); };
  }, [updateArrows]);

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * COL_WIDTH, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
                     w-9 h-9 flex items-center justify-center
                     bg-white border border-gray-200 rounded-full shadow-md
                     hover:bg-yellow-50 hover:border-yellow-300 hover:shadow-lg
                     transition-all duration-150"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10
                     w-9 h-9 flex items-center justify-center
                     bg-white border border-gray-200 rounded-full shadow-md
                     hover:bg-yellow-50 hover:border-yellow-300 hover:shadow-lg
                     transition-all duration-150"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Column dots indicator */}
      <div className="flex justify-center gap-1.5 mb-3">
        {STATUSES.map((s, i) => (
          <button
            key={s}
            onClick={() => scrollRef.current?.scrollTo({ left: i * COL_WIDTH, behavior: 'smooth' })}
            title={s}
            aria-label={`Jump to ${s}`}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              !canScrollLeft && i === 0 ? 'w-4 bg-yellow-400' :
              !canScrollRight && i === STATUSES.length - 1 ? 'w-4 bg-yellow-400' :
              'w-1.5 bg-gray-200 hover:bg-yellow-300'
            }`}
          />
        ))}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        modifiers={[snapCenterToCursor]}
        onDragStart={({ active }) => setActiveApp(applications.find((a) => a._id === active.id) ?? null)}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide"
        >
          {STATUSES.map((s) => (
            <Column
              key={s}
              status={s}
              applications={byStatus[s]}
              onEdit={onEdit}
              onDelete={onDelete}
              contactMap={contactMap}
              interviewSet={interviewSet}
            />
          ))}
        </div>

        <DragOverlay>
          {activeApp ? (
            <ApplicationCard
              application={activeApp}
              onEdit={() => {}}
              onDelete={() => {}}
              dragging={false}
              hasInterview={interviewSet.has(activeApp._id)}
              contactName={contactMap[activeApp._id] ?? null}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

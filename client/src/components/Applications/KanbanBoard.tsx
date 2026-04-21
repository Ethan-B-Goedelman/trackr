import React, { useState } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  useSensor, useSensors, PointerSensor,
} from '@dnd-kit/core';
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setActiveApp(applications.find((a) => a._id === active.id) ?? null)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
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
            dragging
            hasInterview={interviewSet.has(activeApp._id)}
            contactName={contactMap[activeApp._id] ?? null}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

import React from 'react';

const STATUS_CONFIG = {
  'Applied':      'bg-blue-100 text-blue-600',
  'Phone Screen': 'bg-yellow-100 text-yellow-700',
  'Technical':    'bg-purple-100 text-purple-600',
  'Onsite':       'bg-orange-100 text-orange-600',
  'Offer':        'bg-pink-100 text-pink-600',
  'Accepted':     'bg-green-100 text-green-700',
  'Rejected':     'bg-gray-100 text-gray-500',
};

export default function StatusChip({ status, size = 'sm' }) {
  const cls = STATUS_CONFIG[status] ?? 'bg-gray-100 text-gray-500';
  const sizeClass = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm';

  return (
    <span className={`${cls} ${sizeClass} rounded-full font-medium whitespace-nowrap flex-shrink-0`}>
      {status}
    </span>
  );
}

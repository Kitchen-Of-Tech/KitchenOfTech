'use client';

interface MeetingStatusBadgeProps {
  status: 'requested' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
}

export function MeetingStatusBadge({ status }: MeetingStatusBadgeProps) {
  const statusConfig = {
    requested: {
      label: 'New Request',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    },
    contacted: {
      label: 'Contacted',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    },
    scheduled: {
      label: 'Scheduled',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/50'
    },
    completed: {
      label: 'Completed',
      color: 'bg-green-500/20 text-green-400 border-green-500/50'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-500/20 text-red-400 border-red-500/50'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
}

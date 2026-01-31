'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Phone, Calendar, XCircle } from 'lucide-react';

interface MeetingActionsProps {
  meetingId: string;
  currentStatus: string;
}

export function MeetingActions({ meetingId, currentStatus }: MeetingActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (newStatus: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating meeting status:', error);
      alert('Failed to update meeting status');
    } finally {
      setIsUpdating(false);
    }
  };

  const buttons = [];

  // Show relevant action buttons based on current status
  if (currentStatus === 'requested') {
    buttons.push(
      <button
        key="contacted"
        onClick={() => updateStatus('contacted')}
        disabled={isUpdating}
        className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <Phone className="w-4 h-4" />
        Mark Contacted
      </button>
    );
  }

  if (currentStatus === 'contacted' || currentStatus === 'requested') {
    buttons.push(
      <button
        key="scheduled"
        onClick={() => updateStatus('scheduled')}
        disabled={isUpdating}
        className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <Calendar className="w-4 h-4" />
        Mark Scheduled
      </button>
    );
  }

  if (currentStatus === 'scheduled') {
    buttons.push(
      <button
        key="completed"
        onClick={() => updateStatus('completed')}
        disabled={isUpdating}
        className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <Check className="w-4 h-4" />
        Mark Completed
      </button>
    );
  }

  if (currentStatus !== 'cancelled' && currentStatus !== 'completed') {
    buttons.push(
      <button
        key="cancelled"
        onClick={() => updateStatus('cancelled')}
        disabled={isUpdating}
        className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <XCircle className="w-4 h-4" />
        Cancel
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {buttons}
    </div>
  );
}

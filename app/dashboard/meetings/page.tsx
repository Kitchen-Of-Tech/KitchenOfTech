import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/GlassCard';
import { Calendar, Mail, Phone, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { MeetingStatusBadge } from '@/components/meetings/MeetingStatusBadge';
import { MeetingActions } from '@/components/meetings/MeetingActions';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function MeetingsPage() {
  const session = await auth();

  // Check authentication
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/dashboard/meetings');
  }

  // Get user role level from Supabase
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { data: userData } = await supabase
    .from('users')
    .select('role:roles(level)')
    .eq('id', session.user.id)
    .single();

  const roleLevel = ((userData?.role as { level?: number }) || {}).level || 0;

  // Only CEO (100) and Manager (90) can access
  if (roleLevel < 90) {
    redirect('/dashboard');
  }

  // Fetch meetings
  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching meetings:', error);
  }

  const meetingList = meetings || [];

  // Group by status
  const requestedMeetings = meetingList.filter(m => m.status === 'requested');
  const contactedMeetings = meetingList.filter(m => m.status === 'contacted');
  const scheduledMeetings = meetingList.filter(m => m.status === 'scheduled');
  const completedMeetings = meetingList.filter(m => m.status === 'completed');
  const cancelledMeetings = meetingList.filter(m => m.status === 'cancelled');

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black py-12">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Meeting Requests
          </h1>
          <p className="text-white/60">
            Manage client meeting requests and consultations
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {requestedMeetings.length}
            </div>
            <div className="text-sm text-white/60">New Requests</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-2xl font-bold text-blue-400">
              {contactedMeetings.length}
            </div>
            <div className="text-sm text-white/60">Contacted</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-2xl font-bold text-purple-400">
              {scheduledMeetings.length}
            </div>
            <div className="text-sm text-white/60">Scheduled</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {completedMeetings.length}
            </div>
            <div className="text-sm text-white/60">Completed</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-2xl font-bold text-red-400">
              {cancelledMeetings.length}
            </div>
            <div className="text-sm text-white/60">Cancelled</div>
          </GlassCard>
        </div>

        {/* New Requests Section */}
        {requestedMeetings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-yellow-400" />
              New Requests ({requestedMeetings.length})
            </h2>
            <div className="space-y-4">
              {requestedMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          </div>
        )}

        {/* Other Meetings */}
        <div className="space-y-8">
          {/* Contacted */}
          {contactedMeetings.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Contacted ({contactedMeetings.length})
              </h2>
              <div className="space-y-4">
                {contactedMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            </div>
          )}

          {/* Scheduled */}
          {scheduledMeetings.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Scheduled ({scheduledMeetings.length})
              </h2>
              <div className="space-y-4">
                {scheduledMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedMeetings.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white/80 mb-4">
                Completed ({completedMeetings.length})
              </h2>
              <div className="space-y-4">
                {completedMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            </div>
          )}

          {/* Cancelled */}
          {cancelledMeetings.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white/60 mb-4">
                Cancelled ({cancelledMeetings.length})
              </h2>
              <div className="space-y-4">
                {cancelledMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {meetingList.length === 0 && (
          <GlassCard className="p-12 text-center">
            <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">
              No Meeting Requests Yet
            </h3>
            <p className="text-white/40">
              Meeting requests from clients will appear here
            </p>
          </GlassCard>
        )}
      </div>
    </main>
  );
}

// Meeting Card Component
interface MeetingData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  service_title?: string;
  service_slug?: string;
  status: 'requested' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  preferred_datetime?: string;
  created_at: string;
  notified: boolean;
}

function MeetingCard({ meeting }: { meeting: MeetingData }) {
  const createdDate = new Date(meeting.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <GlassCard className="p-6 hover:border-blue-500/50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Main Info */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {meeting.name}
              </h3>
              {meeting.service_title && (
                <div className="text-sm text-blue-400 font-medium">
                  Service: {meeting.service_title}
                </div>
              )}
            </div>
            <MeetingStatusBadge status={meeting.status} />
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap gap-4">
            {meeting.email && (
              <div className="flex items-center gap-2 text-white/70">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${meeting.email}`} className="hover:text-blue-400 transition-colors">
                  {meeting.email}
                </a>
              </div>
            )}
            {meeting.phone && (
              <div className="flex items-center gap-2 text-white/70">
                <Phone className="w-4 h-4" />
                <a href={`tel:${meeting.phone}`} className="hover:text-blue-400 transition-colors">
                  {meeting.phone}
                </a>
              </div>
            )}
          </div>

          {/* Preferred Time */}
          {meeting.preferred_datetime && (
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="w-4 h-4" />
              <span>
                Preferred: {new Date(meeting.preferred_datetime).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </div>
          )}

          {/* Message */}
          {meeting.message && (
            <div className="pt-2">
              <div className="flex items-start gap-2 text-white/80">
                <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" />
                <p className="text-sm leading-relaxed">{meeting.message}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-white/40 pt-2">
            <span>Submitted: {createdDate}</span>
            {meeting.notified && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Notified
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="lg:w-48">
          <MeetingActions meetingId={meeting.id} currentStatus={meeting.status} />
        </div>
      </div>
    </GlassCard>
  );
}

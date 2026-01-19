import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { Users, FolderKanban, ListTodo, CheckCircle } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const stats = [
    {
      name: 'Total Users',
      value: '12',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      show: user.role?.level ? user.role.level <= 2 : false, // CEO or Manager only
    },
    {
      name: 'Active Projects',
      value: '8',
      icon: FolderKanban,
      color: 'from-purple-500 to-pink-500',
      show: true,
    },
    {
      name: 'My Tasks',
      value: '24',
      icon: ListTodo,
      color: 'from-orange-500 to-red-500',
      show: true,
    },
    {
      name: 'Completed',
      value: '156',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      show: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass rounded-2xl p-8 border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user.full_name || user.username}! 👋
        </h1>
        <p className="text-white/60 text-lg">
          Here&apos;s what&apos;s happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.filter(stat => stat.show).map((stat) => (
          <div
            key={stat.name}
            className="glass rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:shadow-glow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">{stat.name}</p>
              <p className="text-white text-3xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.role?.level && user.role.level <= 2 && (
            <a
              href="/dashboard/users"
              className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all group"
            >
              <Users className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-1">Manage Users</h3>
              <p className="text-white/60 text-sm">Create and manage user accounts</p>
            </a>
          )}
          
          <a
            href="/dashboard/teams"
            className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
          >
            <FolderKanban className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-1">View Teams</h3>
            <p className="text-white/60 text-sm">Manage teams and members</p>
          </a>

          <a
            href="/dashboard/tasks"
            className="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all group"
          >
            <ListTodo className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-1">My Tasks</h3>
            <p className="text-white/60 text-sm">View and manage your tasks</p>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-2xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
            <div>
              <p className="text-white font-medium">System initialized</p>
              <p className="text-white/60 text-sm">CEO account created successfully</p>
              <p className="text-white/40 text-xs mt-1">Just now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

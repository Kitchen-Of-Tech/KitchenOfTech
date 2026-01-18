"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Users, UserPlus, X, UserMinus } from 'lucide-react';
import type { User, Team } from '@/types/auth';

interface TeamManagementClientProps {
  currentUser: User;
}

interface CreateTeamForm {
  name: string;
  description: string;
  captain_id: string;
}

export default function TeamManagementClient({ currentUser }: TeamManagementClientProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [createForm, setCreateForm] = useState<CreateTeamForm>({
    name: '',
    description: '',
    captain_id: ''
  });

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users.filter((u: User) => u.is_active));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team');
      }

      setSuccess('Team created successfully!');
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', captain_id: '' });
      fetchTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description,
          captain_id: createForm.captain_id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update team');
      }

      setSuccess('Team updated successfully!');
      setShowEditModal(false);
      setSelectedTeam(null);
      fetchTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedTeam) return;
    
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add member');
      }

      setSuccess('Member added successfully!');
      fetchTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;
    
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member');
      }

      setSuccess('Member removed successfully!');
      fetchTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete team');
      }

      setSuccess('Team deleted successfully!');
      setShowDeleteModal(false);
      setSelectedTeam(null);
      fetchTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setCreateForm({
      name: team.name,
      description: team.description || '',
      captain_id: team.captain_id
    });
    setShowEditModal(true);
  };

  const openMembersModal = (team: Team) => {
    setSelectedTeam(team);
    setShowMembersModal(true);
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canManage = currentUser.role?.level && currentUser.role.level <= 2;
  const canDelete = currentUser.role?.level === 1;

  return (
    <div className="space-y-6">
      {/* Messages */}
      {success && (
        <div className="glass rounded-lg p-4 border border-green-500/20 bg-green-500/10">
          <p className="text-green-400">{success}</p>
        </div>
      )}
      {error && (
        <div className="glass rounded-lg p-4 border border-red-500/20 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Management</h1>
          <p className="text-white/60 mt-1">Manage teams and team members</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Team
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-white/60 text-sm font-medium">Total Teams</h3>
          <p className="text-3xl font-bold text-white mt-2">{teams.length}</p>
        </div>
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-white/60 text-sm font-medium">Total Members</h3>
          <p className="text-3xl font-bold text-primary mt-2">
            {teams.reduce((acc, t) => acc + (t.team_members?.length || 0), 0)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-4 border border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-white/60">
            Loading teams...
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/60">
            No teams found
          </div>
        ) : (
          filteredTeams.map((team) => (
            <div key={team.id} className="glass rounded-xl p-6 border border-white/10 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                    <p className="text-sm text-white/60">{team.team_members?.length || 0} members</p>
                  </div>
                </div>
              </div>
              
              {team.description && (
                <p className="text-white/70 text-sm mb-4 line-clamp-2">{team.description}</p>
              )}

              <div className="mb-4">
                <p className="text-white/60 text-xs mb-2">Captain</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-semibold">
                    {team.captain?.username?.slice(0, 2).toUpperCase() || 'N/A'}
                  </div>
                  <span className="text-white text-sm">{team.captain?.full_name || team.captain?.username || 'Unknown'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openMembersModal(team)}
                  className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors"
                >
                  View Members
                </button>
                {canManage && (
                  <>
                    <button
                      onClick={() => openEditModal(team)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                      title="Edit team"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-white/60 hover:text-red-400"
                        title="Delete team"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {showCreateModal ? 'Create Team' : 'Edit Team'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setCreateForm({ name: '', description: '', captain_id: '' });
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            <form onSubmit={showCreateModal ? handleCreateTeam : handleEditTeam} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Team Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Enter team description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Team Captain</label>
                <select
                  required
                  value={createForm.captain_id}
                  onChange={(e) => setCreateForm({ ...createForm, captain_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="">Select a captain</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id} className="bg-dark-secondary">
                      {user.full_name || user.username} ({user.role?.name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setCreateForm({ name: '', description: '', captain_id: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow-md transition-all disabled:opacity-50"
                >
                  {actionLoading ? (showCreateModal ? 'Creating...' : 'Saving...') : (showCreateModal ? 'Create Team' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedTeam.name} - Members</h2>
              <button
                onClick={() => {
                  setShowMembersModal(false);
                  setSelectedTeam(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Current Members */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">Current Members ({selectedTeam.team_members?.length || 0})</h3>
              <div className="space-y-2">
                {selectedTeam.team_members && selectedTeam.team_members.length > 0 ? (
                  selectedTeam.team_members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                          {member.user?.username?.slice(0, 2).toUpperCase() || 'NA'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.user?.full_name || member.user?.username || 'Unknown'}</p>
                          <p className="text-white/60 text-sm">{member.user?.role?.name || 'No Role'}</p>
                        </div>
                      </div>
                      {canManage && member.user_id !== selectedTeam.captain_id && (
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          disabled={actionLoading}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-white/60 hover:text-red-400 disabled:opacity-50"
                          title="Remove from team"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-white/60 text-center py-4">No members yet</p>
                )}
              </div>
            </div>

            {/* Add Members */}
            {canManage && (
              <div>
                <h3 className="text-white font-medium mb-3">Add Members</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users
                    .filter(u => !selectedTeam.team_members?.some(m => m.user_id === u.id))
                    .map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                            {user.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.full_name || user.username}</p>
                            <p className="text-white/60 text-sm">{user.role?.name || 'No Role'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddMember(user.id)}
                          disabled={actionLoading}
                          className="p-2 hover:bg-green-500/10 rounded-lg transition-colors text-white/60 hover:text-green-400 disabled:opacity-50"
                          title="Add to team"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Delete Team</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            <p className="text-white/80 mb-6">
              Are you sure you want to delete <span className="text-white font-medium">{selectedTeam.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

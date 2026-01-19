"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FolderKanban, X, Calendar, Target, TrendingUp } from 'lucide-react';
import type { User, Project, Team } from '@/types/auth';

interface ProjectManagementClientProps {
  currentUser: User;
}

interface ProjectForm {
  name: string;
  description: string;
  team_id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
}

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-gray-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'text-red-400' }
];

const STATUSES = [
  { value: 'planning', label: 'Planning', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500/20 text-green-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/20 text-red-400' }
];

export default function ProjectManagementClient({ currentUser }: ProjectManagementClientProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState<ProjectForm>({
    name: '',
    description: '',
    team_id: '',
    priority: 'medium',
    status: 'planning',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      setSuccess('Project created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchProjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update project');
      }

      setSuccess('Project updated successfully!');
      setShowEditModal(false);
      setSelectedProject(null);
      fetchProjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete project');
      }

      setSuccess('Project deleted successfully!');
      setShowDeleteModal(false);
      setSelectedProject(null);
      fetchProjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      team_id: '',
      priority: 'medium',
      status: 'planning',
      start_date: '',
      end_date: ''
    });
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setForm({
      name: project.name,
      description: project.description || '',
      team_id: project.team_id || '',
      priority: project.priority as ProjectForm['priority'],
      status: project.status as ProjectForm['status'],
      start_date: project.start_date || '',
      end_date: project.end_date || ''
    });
    setShowEditModal(true);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const canManage = currentUser.role?.level && currentUser.role.level <= 2;
  const canDelete = currentUser.role?.level === 1;

  const projectStats = {
    total: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length
  };

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
          <h1 className="text-3xl font-bold text-white">Project Management</h1>
          <p className="text-white/60 mt-1">Manage projects and track progress</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-primary" />
            <div>
              <h3 className="text-white/60 text-sm font-medium">Total Projects</h3>
              <p className="text-2xl font-bold text-white mt-1">{projectStats.total}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="text-white/60 text-sm font-medium">Planning</h3>
              <p className="text-2xl font-bold text-blue-400 mt-1">{projectStats.planning}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-white/60 text-sm font-medium">In Progress</h3>
              <p className="text-2xl font-bold text-purple-400 mt-1">{projectStats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-white/60 text-sm font-medium">Completed</h3>
              <p className="text-2xl font-bold text-green-400 mt-1">{projectStats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="glass rounded-xl p-4 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="all">All Status</option>
            {STATUSES.map(s => (
              <option key={s.value} value={s.value} className="bg-dark-secondary">{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-white/60">
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/60">
            No projects found
          </div>
        ) : (
          filteredProjects.map((project) => {
            const status = STATUSES.find(s => s.value === project.status);
            const priority = PRIORITIES.find(p => p.value === project.priority);
            
            return (
              <div key={project.id} className="glass rounded-xl p-6 border border-white/10 hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status?.color}`}>
                        {status?.label}
                      </span>
                      <span className={`text-xs font-medium ${priority?.color}`}>
                        {priority?.label} Priority
                      </span>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{project.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/60">Team:</span>
                    <span className="text-white">{project.team?.name || 'Unknown'}</span>
                  </div>
                  {project.start_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <span className="text-white/60">
                        {new Date(project.start_date).toLocaleDateString()}
                        {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString()}`}
                      </span>
                    </div>
                  )}
                </div>

                {canManage && (
                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <button
                      onClick={() => openEditModal(project)}
                      className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {showCreateModal ? 'Create Project' : 'Edit Project'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            <form onSubmit={showCreateModal ? handleCreateProject : handleEditProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Enter project name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Enter project description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Team</label>
                  <select
                    required
                    value={form.team_id}
                    onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="">Select a team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id} className="bg-dark-secondary">
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Priority</label>
                  <select
                    required
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as ProjectForm['priority'] })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p.value} value={p.value} className="bg-dark-secondary">{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Status</label>
                  <select
                    required
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ProjectForm['status'] })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    {STATUSES.map(s => (
                      <option key={s.value} value={s.value} className="bg-dark-secondary">{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
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
                  {actionLoading ? (showCreateModal ? 'Creating...' : 'Saving...') : (showCreateModal ? 'Create Project' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Delete Project</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            <p className="text-white/80 mb-6">
              Are you sure you want to delete <span className="text-white font-medium">{selectedProject.name}</span>? 
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
                onClick={handleDeleteProject}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

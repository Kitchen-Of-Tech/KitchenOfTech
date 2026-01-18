"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Calendar, Flag, Users, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import type { User, Task, Project } from '@/types/auth';

interface TaskManagementClientProps {
  currentUser: User;
}

interface TaskForm {
  title: string;
  description: string;
  project_id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  due_date: string;
  assigned_users: string[];
}

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-gray-400', icon: Flag },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', icon: Flag },
  { value: 'high', label: 'High', color: 'text-orange-400', icon: Flag },
  { value: 'critical', label: 'Critical', color: 'text-red-400', icon: AlertCircle }
];

const STATUSES = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-500/20 text-gray-400', icon: Circle },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
  { value: 'review', label: 'Review', color: 'bg-purple-500/20 text-purple-400', icon: AlertCircle },
  { value: 'completed', label: 'Completed', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 }
];

export default function TaskManagementClient({ currentUser }: TaskManagementClientProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState<TaskForm>({
    title: '',
    description: '',
    project_id: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    assigned_users: []
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      setSuccess('Task created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task');
      }

      setSuccess('Task updated successfully!');
      setShowEditModal(false);
      setSelectedTask(null);
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task status');
      }

      fetchTasks();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete task');
      }

      setSuccess('Task deleted successfully!');
      setShowDeleteModal(false);
      setSelectedTask(null);
      fetchTasks();
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
      title: '',
      description: '',
      project_id: '',
      priority: 'medium',
      status: 'todo',
      due_date: '',
      assigned_users: []
    });
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      project_id: task.project_id,
      priority: task.priority as TaskForm['priority'],
      status: task.status as TaskForm['status'],
      due_date: task.due_date || '',
      assigned_users: task.task_assignments?.map(a => a.user_id) || []
    });
    setShowEditModal(true);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    completed: filteredTasks.filter(t => t.status === 'completed')
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
          <h1 className="text-3xl font-bold text-white">Task Management</h1>
          <p className="text-white/60 mt-1">Kanban board for task tracking</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow-md transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUSES.map(status => {
          const count = tasksByStatus[status.value as keyof typeof tasksByStatus].length;
          return (
            <div key={status.value} className="glass rounded-xl p-4 border border-white/10">
              <h3 className="text-white/60 text-sm font-medium mb-2">{status.label}</h3>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-4 border border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATUSES.map(status => {
          const StatusIcon = status.icon;
          const statusTasks = tasksByStatus[status.value as keyof typeof tasksByStatus];
          
          return (
            <div key={status.value} className="flex flex-col">
              <div className="glass rounded-xl p-4 border border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <StatusIcon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-white">{status.label}</h3>
                  <span className="ml-auto text-white/60 text-sm">{statusTasks.length}</span>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {loading ? (
                  <div className="text-center py-8 text-white/60 text-sm">Loading...</div>
                ) : statusTasks.length === 0 ? (
                  <div className="glass rounded-xl p-6 border border-white/10 border-dashed text-center text-white/40 text-sm">
                    No tasks
                  </div>
                ) : (
                  statusTasks.map((task) => {
                    const priority = PRIORITIES.find(p => p.value === task.priority);
                    const PriorityIcon = priority?.icon || Flag;
                    
                    return (
                      <div
                        key={task.id}
                        className="glass rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-all cursor-pointer group"
                        onClick={() => openEditModal(task)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-white text-sm line-clamp-2 flex-1">
                            {task.title}
                          </h4>
                          <PriorityIcon className={`w-4 h-4 ${priority?.color} flex-shrink-0 ml-2`} />
                        </div>

                        {task.description && (
                          <p className="text-white/60 text-xs mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="space-y-2">
                          {task.project && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                                {task.project.name}
                              </span>
                            </div>
                          )}

                          {task.due_date && (
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          )}

                          {task.task_assignments && task.task_assignments.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-white/60" />
                              <div className="flex -space-x-2">
                                {task.task_assignments.slice(0, 3).map((assignment, index) => (
                                  <div
                                    key={assignment.id}
                                    className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-semibold border-2 border-dark-primary"
                                    title={assignment.user?.full_name || assignment.user?.username}
                                  >
                                    {assignment.user?.username?.slice(0, 2).toUpperCase() || 'NA'}
                                  </div>
                                ))}
                                {task.task_assignments.length > 3 && (
                                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold border-2 border-dark-primary">
                                    +{task.task_assignments.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quick Status Change */}
                        <div className="mt-3 pt-3 border-t border-white/10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {STATUSES.filter(s => s.value !== task.status).map(s => (
                            <button
                              key={s.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task, s.value);
                              }}
                              className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                              title={`Move to ${s.label}`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {showCreateModal ? 'Create Task' : 'Edit Task'}
              </h2>
              <div className="flex items-center gap-2">
                {showEditModal && selectedTask && (
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-white/60 hover:text-red-400"
                    title="Delete task"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
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
            </div>
            <form onSubmit={showCreateModal ? handleCreateTask : handleEditTask} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Task Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Project</label>
                  <select
                    required
                    value={form.project_id}
                    onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id} className="bg-dark-secondary">
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Priority</label>
                  <select
                    required
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TaskForm['priority'] })}
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
                    onChange={(e) => setForm({ ...form, status: e.target.value as TaskForm['status'] })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    {STATUSES.map(s => (
                      <option key={s.value} value={s.value} className="bg-dark-secondary">{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Assign Users</label>
                <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-white/5 rounded-lg border border-white/10">
                  {users.map((user) => (
                    <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.assigned_users.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ ...form, assigned_users: [...form.assigned_users, user.id] });
                          } else {
                            setForm({ ...form, assigned_users: form.assigned_users.filter(id => id !== user.id) });
                          }
                        }}
                        className="w-4 h-4 rounded border-white/10"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-semibold">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm">{user.full_name || user.username}</p>
                          <p className="text-white/60 text-xs">{user.role?.name}</p>
                        </div>
                      </div>
                    </label>
                  ))}
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
                  {actionLoading ? (showCreateModal ? 'Creating...' : 'Saving...') : (showCreateModal ? 'Create Task' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Delete Task</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setShowEditModal(true);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            <p className="text-white/80 mb-6">
              Are you sure you want to delete <span className="text-white font-medium">{selectedTask.title}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setShowEditModal(true);
                }}
                className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

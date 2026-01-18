"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Key, Power, X, Eye, EyeOff } from 'lucide-react';
import type { User, Role } from '@/types/auth';

interface UserManagementClientProps {
  currentUser: User;
}

interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role_id: string;
}

interface EditUserForm {
  full_name: string;
  role_id: string;
  is_active: boolean;
}

export default function UserManagementClient({ currentUser }: UserManagementClientProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role_id: ''
  });
  
  const [editForm, setEditForm] = useState<EditUserForm>({
    full_name: '',
    role_id: '',
    is_active: true
  });
  
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess('User created successfully!');
      setShowCreateModal(false);
      setCreateForm({ username: '', email: '', password: '', full_name: '', role_id: '' });
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      setSuccess('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/users/${selectedUser.id}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Password reset successfully!');
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user status');
      }

      setSuccess(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setSuccess('User deleted successfully!');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      role_id: user.role_id,
      is_active: user.is_active
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canDelete = currentUser.role?.level === 1; // Only CEO can delete
  const activeUsers = users.filter(u => u.is_active).length;
  const inactiveUsers = users.filter(u => !u.is_active).length;

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
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
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-white/60 mt-1">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow-md transition-all"
        >
          <Plus className="w-5 h-5" />
          Create User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-white/60 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-white mt-2">{users.length}</p>
        </div>
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-white/60 text-sm font-medium">Active Users</h3>
          <p className="text-3xl font-bold text-green-400 mt-2">{activeUsers}</p>
        </div>
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-white/60 text-sm font-medium">Inactive Users</h3>
          <p className="text-3xl font-bold text-red-400 mt-2">{inactiveUsers}</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-4 border border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-6 py-4 text-white font-semibold">User</th>
                <th className="text-left px-6 py-4 text-white font-semibold">Email</th>
                <th className="text-left px-6 py-4 text-white font-semibold">Role</th>
                <th className="text-left px-6 py-4 text-white font-semibold">Status</th>
                <th className="text-left px-6 py-4 text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-white/60">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-white/60">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.full_name || user.username}</p>
                          <p className="text-white/60 text-sm">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/80">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary">
                        {user.role?.name || 'No Role'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openPasswordModal(user)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                          title="Reset password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={actionLoading}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white disabled:opacity-50"
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-white/60 hover:text-red-400"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals will be in part 2 */}
      {showCreateModal && <CreateUserModal />}
      {showEditModal && selectedUser && <EditUserModal />}
      {showPasswordModal && selectedUser && <PasswordModal />}
      {showDeleteModal && selectedUser && <DeleteModal />}
    </div>
  );

  // Modal Components
  function CreateUserModal() {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Create New User</h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                required
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                required
                value={createForm.full_name}
                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Role</label>
              <select
                required
                value={createForm.role_id}
                onChange={(e) => setCreateForm({ ...createForm, role_id: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id} className="bg-dark-secondary">
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow-md transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function EditUserModal() {
    if (!selectedUser) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Edit User</h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                required
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Role</label>
              <select
                required
                value={editForm.role_id}
                onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id} className="bg-dark-secondary">
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editForm.is_active}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-white/10"
              />
              <label htmlFor="is_active" className="text-white/80 text-sm">Active</label>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow-md transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function PasswordModal() {
    if (!selectedUser) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Reset Password</h2>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
          <p className="text-white/60 mb-4">
            Reset password for <span className="text-white font-medium">{selectedUser.username}</span>
          </p>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow-md transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function DeleteModal() {
    if (!selectedUser) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Delete User</h2>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
          <p className="text-white/80 mb-6">
            Are you sure you want to delete <span className="text-white font-medium">{selectedUser.username}</span>? 
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
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

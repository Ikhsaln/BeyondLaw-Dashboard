'use client'

import { useState, useEffect } from 'react'
import { Save, User, Shield, Bell, Database, Key, Users } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: ''
    },
    notifications: {
      emailNotifications: true,
      orderUpdates: true,
      systemAlerts: false
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    userManagement: {
      newUserName: '',
      newUserEmail: '',
      newUserPassword: '',
      newUserRole: 'client' as 'admin' | 'client',
      selectedUserId: '',
      selectedUserRole: 'client' as 'admin' | 'client'
    }
  })
  const [activeTab, setActiveTab] = useState('profile')
  const [message, setMessage] = useState('')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null)
  const [editingRole, setEditingRole] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setSettings(prev => ({
          ...prev,
          profile: {
            name: data.user.name,
            email: data.user.email
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      // In a real app, this would be a profile update API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Profile updated successfully!')
      setUser(prev => prev ? { ...prev, name: settings.profile.name, email: settings.profile.email } : null)
    } catch (error) {
      setMessage('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    if (settings.security.newPassword !== settings.security.confirmPassword) {
      setMessage('New passwords do not match.')
      setSaving(false)
      return
    }

    if (settings.security.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long.')
      setSaving(false)
      return
    }

    try {
      // In a real app, this would be a password change API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Password updated successfully!')
      setSettings(prev => ({
        ...prev,
        security: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }))
    } catch (error) {
      setMessage('Failed to update password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      // In a real app, this would be a notification settings API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Notification preferences updated successfully!')
    } catch (error) {
      setMessage('Failed to update notifications. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        console.error('Failed to fetch users:', response.statusText)
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: settings.userManagement.newUserName,
          email: settings.userManagement.newUserEmail,
          password: settings.userManagement.newUserPassword,
          role: settings.userManagement.newUserRole
        }),
      })

      if (response.ok) {
        setMessage('User created successfully!')
        setSettings(prev => ({
          ...prev,
          userManagement: {
            ...prev.userManagement,
            newUserName: '',
            newUserEmail: '',
            newUserPassword: '',
            newUserRole: 'client'
          }
        }))
        fetchUsers() // Refresh the users list
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to create user.')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      setMessage('Failed to create user. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(`/api/users/${settings.userManagement.selectedUserId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: settings.userManagement.selectedUserRole
        }),
      })

      if (response.ok) {
        setMessage('User role updated successfully!')
        setSettings(prev => ({
          ...prev,
          userManagement: {
            ...prev.userManagement,
            selectedUserId: '',
            selectedUserRole: 'client'
          }
        }))
        fetchUsers() // Refresh the users list
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to update user role.')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      setMessage('Failed to update user role. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInlineRoleChange = async (userId: string, newRole: 'admin' | 'client') => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRole
        }),
      })

      if (response.ok) {
        setMessage('User role updated successfully!')
        setEditingRole(null)
        fetchUsers() // Refresh the users list
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to update user role.')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      setMessage('Failed to update user role. Please try again.')
    }
  }

  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setSaving(true)
    setShowDeleteDialog(false)

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage('User deleted successfully!')
        setUserToDelete(null)
        fetchUsers() // Refresh the users list
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to delete user.')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setMessage('Failed to delete user. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    setUserToDelete(null)
  }

  const handleDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(`/api/users/${settings.userManagement.selectedUserId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage('User deleted successfully!')
        setSettings(prev => ({
          ...prev,
          userManagement: {
            ...prev.userManagement,
            selectedUserId: ''
          }
        }))
        fetchUsers() // Refresh the users list
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to delete user.')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setMessage('Failed to delete user. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'system', name: 'System', icon: Database }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('successfully')
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        profile: { ...prev.profile, name: e.target.value }
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={settings.profile.email}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        profile: { ...prev.profile, email: e.target.value }
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* User Management */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Create New User */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="newUserName" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="newUserName"
                        value={settings.userManagement.newUserName}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          userManagement: { ...prev.userManagement, newUserName: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="newUserEmail" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="newUserEmail"
                        value={settings.userManagement.newUserEmail}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          userManagement: { ...prev.userManagement, newUserEmail: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="newUserPassword" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        id="newUserPassword"
                        value={settings.userManagement.newUserPassword}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          userManagement: { ...prev.userManagement, newUserPassword: e.target.value }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label htmlFor="newUserRole" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        id="newUserRole"
                        value={settings.userManagement.newUserRole}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          userManagement: { ...prev.userManagement, newUserRole: e.target.value as 'admin' | 'client' }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      >
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      {saving ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Change User Role */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change User Role</h3>
                <form onSubmit={handleChangeRole} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="selectedUser" className="block text-sm font-medium text-gray-700">
                        Select User
                      </label>
                      <select
                        id="selectedUser"
                        value={settings.userManagement.selectedUserId}
                        onChange={(e) => {
                          const selectedUser = users.find(u => u.id === e.target.value)
                          setSettings(prev => ({
                            ...prev,
                            userManagement: {
                              ...prev.userManagement,
                              selectedUserId: e.target.value,
                              selectedUserRole: selectedUser?.role as 'admin' | 'client' || 'client'
                            }
                          }))
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        required
                      >
                        <option value="">Select a user...</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email}) - {user.role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="userRole" className="block text-sm font-medium text-gray-700">
                        New Role
                      </label>
                      <select
                        id="userRole"
                        value={settings.userManagement.selectedUserRole}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          userManagement: { ...prev.userManagement, selectedUserRole: e.target.value as 'admin' | 'client' }
                        }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      >
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving || !settings.userManagement.selectedUserId}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      {saving ? 'Updating...' : 'Change Role'}
                    </button>
                  </div>
                </form>
              </div>



              {/* User List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">All Users</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingRole === user.id ? (
                                <select
                                  value={user.role}
                                  onChange={(e) => handleInlineRoleChange(user.id, e.target.value as 'admin' | 'client')}
                                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                                  onBlur={() => setEditingRole(null)}
                                  autoFocus
                                >
                                  <option value="client">Client</option>
                                  <option value="admin">Admin</option>
                                </select>
                              ) : (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${
                                  user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`} onClick={() => setEditingRole(user.id)}>
                                  {user.role}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setEditingRole(user.id)}
                                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                  title="Edit Role"
                                >
                                  <Shield className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(user)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="Delete User"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={settings.security.currentPassword}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, currentPassword: e.target.value }
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={settings.security.newPassword}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, newPassword: e.target.value }
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={settings.security.confirmPassword}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, confirmPassword: e.target.value }
                      }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Key className="mr-2 h-4 w-4" />
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="emailNotifications"
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailNotifications: e.target.checked }
                      }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                      Email notifications for important updates
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="orderUpdates"
                      type="checkbox"
                      checked={settings.notifications.orderUpdates}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, orderUpdates: e.target.checked }
                      }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="orderUpdates" className="ml-2 block text-sm text-gray-900">
                      Notifications for order status changes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="systemAlerts"
                      type="checkbox"
                      checked={settings.notifications.systemAlerts}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, systemAlerts: e.target.checked }
                      }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="systemAlerts" className="ml-2 block text-sm text-gray-900">
                      System alerts and maintenance notifications
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Application Version:</span>
                      <p className="text-gray-600">1.0.0</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Database:</span>
                      <p className="text-gray-600">SQLite</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Last Backup:</span>
                      <p className="text-gray-600">Never</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">System Status:</span>
                      <p className="text-green-600">Operational</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance</h3>
                <div className="space-y-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                    Backup Database
                  </button>
                  <button className="ml-3 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200">
                    Clear Cache
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Delete User Account</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the account for <strong>{userToDelete.name}</strong> ({userToDelete.email})?
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                      <strong>Warning:</strong> This action will permanently remove all associated data including orders and cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={saving}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {saving ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers, createUser, deleteUser, getCurrentUser, uploadExclusionList, clearExclusionList } from '../services/api'
import type { User } from '../types'

function AdminDashboard() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showExclusionUpload, setShowExclusionUpload] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  const checkAuthAndLoad = async () => {
    try {
      console.log('Checking authentication...')
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No token found, redirecting to login')
        navigate('/admin/login')
        return
      }
      
      // First check authentication with timeout
      const user = await Promise.race([
        getCurrentUser(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]) as any
      
      console.log('Current user:', user)
      if (user.role !== 'admin') {
        console.log('User is not admin, redirecting...')
        navigate('/admin/login')
        return
      }
      // If authenticated, load users
      console.log('User is admin, loading users...')
      await loadUsers()
    } catch (error: any) {
      console.error('Error in checkAuthAndLoad:', error)
      // If authentication fails, redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/admin/login')
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (error: any) {
      console.error('Error loading users:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/admin/login')
      } else {
        setError('Error loading users. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await createUser(newUser)
      setSuccess('User created successfully!')
      setNewUser({ email: '', password: '', full_name: '', role: 'user' })
      setShowCreateForm(false)
      loadUsers()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error creating user')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      await deleteUser(userId)
      setSuccess('User deleted successfully!')
      loadUsers()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error deleting user')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/admin/login')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please upload an Excel file (.xlsx or .xls)')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await uploadExclusionList(file)
      setSuccess(`Exclusion list uploaded successfully! ${result.added} records added.`)
      if (result.errors && result.errors.length > 0) {
        setError(`Some rows had errors: ${result.errors.slice(0, 3).join(', ')}`)
      }
      setShowExclusionUpload(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error uploading file')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleClearExclusionList = async () => {
    if (!confirm('Are you sure you want to clear the entire exclusion list?')) {
      return
    }

    try {
      await clearExclusionList()
      setSuccess('Exclusion list cleared successfully')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error clearing exclusion list')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Loading Admin Dashboard...</p>
            <p className="text-sm text-gray-600 mt-2">Please wait while we verify your credentials</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">User Management</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => navigate('/admin/configurations')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ⚙️ Session Configurations
              </button>
              <button
                onClick={() => navigate('/admin/row-generator')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                📋 Row Generator
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            {showCreateForm ? 'Cancel' : '+ Create New User'}
          </button>
          <button
            onClick={() => setShowExclusionUpload(!showExclusionUpload)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            {showExclusionUpload ? 'Cancel' : '📋 Manage Exclusion List'}
          </button>
        </div>

        {/* Exclusion List Upload Section */}
        {showExclusionUpload && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Exclusion List (PC/RR List)</h2>
            <p className="text-gray-600 mb-4">
              Upload an Excel file with columns: <strong>name</strong>, <strong>Code</strong>, <strong>DOB</strong>, <strong>SSN</strong>
            </p>
            <div className="flex gap-4 items-center">
              <label className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg cursor-pointer">
                {uploading ? 'Uploading...' : '📤 Upload Excel File'}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleClearExclusionList}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                🗑️ Clear List
              </button>
            </div>
            {uploading && (
              <div className="mt-4">
                <div className="animate-pulse text-gray-600">Processing file...</div>
              </div>
            )}
          </div>
        )}

        {/* Create User Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    required
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="frontdesk">Front Desk</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="talent">Talent</option>
                    <option value="management">Management</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                Create User
              </button>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-4 py-2">{user.id}</td>
                    <td className="px-4 py-2 font-semibold">{user.full_name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'frontdesk'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'recruiter'
                            ? 'bg-green-100 text-green-800'
                            : user.role === 'talent'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'management'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center py-8 text-gray-500">No users found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard


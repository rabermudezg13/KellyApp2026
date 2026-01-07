import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'

function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      console.log('Attempting login with email:', email)
      const response = await login(email, password)
      console.log('Login response:', response)
      
      // Check if user is admin
      if (response.user.role !== 'admin') {
        setError('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }
      
      // Store token
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      console.log('Token stored, redirecting to dashboard...')
      // Small delay to ensure token is stored
      setTimeout(() => {
        navigate('/admin/dashboard')
      }, 100)
    } catch (err: any) {
      console.error('Login error:', err)
      let errorMessage = err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.'
      
      // Provide more helpful error messages
      if (errorMessage.includes('Backend server is not responding') || errorMessage.includes('Cannot connect to backend')) {
        errorMessage = 'Backend server is not running. Please start the backend server on port 3026 first.'
      }
      
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-blue-600">Kelly</span>{' '}
            <span className="text-gray-800">Education</span>
          </h1>
          <h2 className="text-xl text-gray-600">Admin Login</h2>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-bold mb-2">⚠️ Error:</p>
            <p>{error}</p>
            {error.includes('Backend server is not running') && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded">
                <p className="text-sm font-semibold mb-1">💡 Solución:</p>
                <p className="text-sm">1. Abre una terminal</p>
                <p className="text-sm">2. Ejecuta: <code className="bg-gray-200 px-1 rounded">cd kelly-app-v2/backend && source venv/bin/activate && python main.py</code></p>
                <p className="text-sm">3. Espera a ver "Uvicorn running on http://0.0.0.0:3026"</p>
                <p className="text-sm">4. Intenta hacer login de nuevo</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage


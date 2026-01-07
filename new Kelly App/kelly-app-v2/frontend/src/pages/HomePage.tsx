import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAnnouncements } from '../services/api'
import type { Announcement } from '../types'

function HomePage() {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const data = await getAnnouncements()
      setAnnouncements(data)
    } catch (error) {
      console.error('Error loading announcements:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-green-600">Kelly</span>{' '}
            <span className="text-gray-800">Education</span> Miami Dade
          </h1>
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Announcements</h2>
            {announcements.map((announcement) => (
              <div key={announcement.id} className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-lg mb-2">{announcement.title}</h3>
                <p className="text-gray-700 whitespace-pre-line">{announcement.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/register-visit')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              📋 Register Visit
            </button>
            <button
              onClick={() => navigate('/staff/login')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              👤 Staff Login
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              🔐 Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage


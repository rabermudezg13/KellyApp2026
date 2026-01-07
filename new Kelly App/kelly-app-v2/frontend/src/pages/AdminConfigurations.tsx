import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getInfoSessionConfig, 
  updateInfoSessionConfig,
  getNewHireOrientationConfig,
  updateNewHireOrientationConfig
} from '../services/api'

function AdminConfigurations() {
  const navigate = useNavigate()
  const [infoSessionConfig, setInfoSessionConfig] = useState({
    max_sessions_per_day: 2,
    time_slots: ['8:30 AM', '1:30 PM'],
    is_active: true,
  })
  const [newHireConfig, setNewHireConfig] = useState({
    max_sessions_per_day: 2,
    time_slots: ['9:00 AM', '2:00 PM'],
    is_active: true,
  })
  const [newInfoTimeSlot, setNewInfoTimeSlot] = useState('')
  const [newHireTimeSlot, setNewHireTimeSlot] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      setLoading(true)
      const [infoData, newHireData] = await Promise.all([
        getInfoSessionConfig(),
        getNewHireOrientationConfig()
      ])
      setInfoSessionConfig({
        max_sessions_per_day: infoData.max_sessions_per_day,
        time_slots: infoData.time_slots,
        is_active: infoData.is_active,
      })
      setNewHireConfig({
        max_sessions_per_day: newHireData.max_sessions_per_day,
        time_slots: newHireData.time_slots,
        is_active: newHireData.is_active,
      })
    } catch (error) {
      console.error('Error loading configs:', error)
      setMessage({ type: 'error', text: 'Error loading configurations' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveInfoSession = async () => {
    try {
      setSaving('info-session')
      setMessage(null)
      await updateInfoSessionConfig(infoSessionConfig)
      setMessage({ type: 'success', text: 'Info Session configuration saved successfully!' })
    } catch (error) {
      console.error('Error saving config:', error)
      setMessage({ type: 'error', text: 'Error saving Info Session configuration' })
    } finally {
      setSaving(null)
    }
  }

  const handleSaveNewHire = async () => {
    try {
      setSaving('new-hire')
      setMessage(null)
      await updateNewHireOrientationConfig(newHireConfig)
      setMessage({ type: 'success', text: 'New Hire Orientation configuration saved successfully!' })
    } catch (error) {
      console.error('Error saving config:', error)
      setMessage({ type: 'error', text: 'Error saving New Hire Orientation configuration' })
    } finally {
      setSaving(null)
    }
  }

  const addInfoTimeSlot = () => {
    if (newInfoTimeSlot.trim() && !infoSessionConfig.time_slots.includes(newInfoTimeSlot.trim())) {
      setInfoSessionConfig({
        ...infoSessionConfig,
        time_slots: [...infoSessionConfig.time_slots, newInfoTimeSlot.trim()],
      })
      setNewInfoTimeSlot('')
    }
  }

  const removeInfoTimeSlot = (slot: string) => {
    setInfoSessionConfig({
      ...infoSessionConfig,
      time_slots: infoSessionConfig.time_slots.filter((s) => s !== slot),
    })
  }

  const addNewHireTimeSlot = () => {
    if (newHireTimeSlot.trim() && !newHireConfig.time_slots.includes(newHireTimeSlot.trim())) {
      setNewHireConfig({
        ...newHireConfig,
        time_slots: [...newHireConfig.time_slots, newHireTimeSlot.trim()],
      })
      setNewHireTimeSlot('')
    }
  }

  const removeNewHireTimeSlot = (slot: string) => {
    setNewHireConfig({
      ...newHireConfig,
      time_slots: newHireConfig.time_slots.filter((s) => s !== slot),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p>Loading...</p>
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
              <h1 className="text-3xl font-bold">Session Configurations</h1>
              <p className="text-gray-600">Configure Info Sessions and New Hire Orientations</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info Session Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-green-600">📋 Info Session Configuration</h2>

            <div className="space-y-6">
              {/* Max Sessions Per Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Sessions Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={infoSessionConfig.max_sessions_per_day}
                  onChange={(e) =>
                    setInfoSessionConfig({
                      ...infoSessionConfig,
                      max_sessions_per_day: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Maximum number of info sessions that can be scheduled per day
                </p>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                <div className="space-y-3">
                  {infoSessionConfig.time_slots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="font-medium">{slot}</span>
                      <button
                        type="button"
                        onClick={() => removeInfoTimeSlot(slot)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newInfoTimeSlot}
                    onChange={(e) => setNewInfoTimeSlot(e.target.value)}
                    placeholder="e.g., 8:30 AM, 1:30 PM"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addInfoTimeSlot()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addInfoTimeSlot}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveInfoSession}
                disabled={saving === 'info-session'}
                className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving === 'info-session' ? 'Saving...' : 'Save Info Session Config'}
              </button>
            </div>
          </div>

          {/* New Hire Orientation Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-blue-600">👔 New Hire Orientation Configuration</h2>

            <div className="space-y-6">
              {/* Max Sessions Per Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Sessions Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newHireConfig.max_sessions_per_day}
                  onChange={(e) =>
                    setNewHireConfig({
                      ...newHireConfig,
                      max_sessions_per_day: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Maximum number of new hire orientations that can be scheduled per day
                </p>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                <div className="space-y-3">
                  {newHireConfig.time_slots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="font-medium">{slot}</span>
                      <button
                        type="button"
                        onClick={() => removeNewHireTimeSlot(slot)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newHireTimeSlot}
                    onChange={(e) => setNewHireTimeSlot(e.target.value)}
                    placeholder="e.g., 9:00 AM, 2:00 PM"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addNewHireTimeSlot()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addNewHireTimeSlot}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveNewHire}
                disabled={saving === 'new-hire'}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving === 'new-hire' ? 'Saving...' : 'Save New Hire Orientation Config'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminConfigurations


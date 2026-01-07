import { useState, useEffect } from 'react'
import { getInfoSessionConfig, updateInfoSessionConfig } from '../services/api'

function AdminInfoSessionConfig() {
  const [config, setConfig] = useState({
    max_sessions_per_day: 2,
    time_slots: ['8:30 AM', '1:30 PM'],
    is_active: true,
  })
  const [newTimeSlot, setNewTimeSlot] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const data = await getInfoSessionConfig()
      setConfig({
        max_sessions_per_day: data.max_sessions_per_day,
        time_slots: data.time_slots,
        is_active: data.is_active,
      })
    } catch (error) {
      console.error('Error loading config:', error)
      setMessage({ type: 'error', text: 'Error loading configuration' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)
      await updateInfoSessionConfig(config)
      setMessage({ type: 'success', text: 'Configuration saved successfully!' })
    } catch (error) {
      console.error('Error saving config:', error)
      setMessage({ type: 'error', text: 'Error saving configuration' })
    } finally {
      setSaving(false)
    }
  }

  const addTimeSlot = () => {
    if (newTimeSlot.trim() && !config.time_slots.includes(newTimeSlot.trim())) {
      setConfig({
        ...config,
        time_slots: [...config.time_slots, newTimeSlot.trim()],
      })
      setNewTimeSlot('')
    }
  }

  const removeTimeSlot = (slot: string) => {
    setConfig({
      ...config,
      time_slots: config.time_slots.filter((s) => s !== slot),
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
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Info Session Configuration</h1>

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
                value={config.max_sessions_per_day}
                onChange={(e) =>
                  setConfig({
                    ...config,
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
                {config.time_slots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="font-medium">{slot}</span>
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(slot)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  placeholder="e.g., 9:00 AM, 2:00 PM"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTimeSlot()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Time Slot
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Add time slots that will be available for info session registration
              </p>
            </div>

            {/* Save Button */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
              <button
                onClick={loadConfig}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminInfoSessionConfig


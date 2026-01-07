import { useState } from 'react'
import React from 'react'
import type { InfoSessionRegistration } from '../types'
import { getAvailableTimeSlots } from '../services/api'

interface Props {
  onSubmit: (data: InfoSessionRegistration) => void
  onCancel: () => void
}

function InfoSessionForm({ onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState<InfoSessionRegistration>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    zip_code: '',
    session_type: 'new-hire',
    time_slot: '',
  })

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(['8:30 AM', '1:30 PM'])

  // Load available time slots on mount
  React.useEffect(() => {
    loadTimeSlots()
  }, [])

  const loadTimeSlots = async () => {
    try {
      const slots = await getAvailableTimeSlots()
      setAvailableTimeSlots(slots)
    } catch (error) {
      console.error('Error loading time slots:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTimeSlot) {
      alert('Please select a time slot')
      return
    }
    onSubmit({ ...formData, time_slot: selectedTimeSlot })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            required
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            required
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter your email address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ZIP Code *
        </label>
        <input
          type="text"
          required
          value={formData.zip_code}
          onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter your ZIP code"
          maxLength={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type *
        </label>
        <select
          required
          value={formData.session_type}
          onChange={(e) => setFormData({ ...formData, session_type: e.target.value as 'new-hire' | 'reactivation' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="new-hire">New Hire</option>
          <option value="reactivation">Reactivation</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Time Slots for TODAY *
        </label>
        <div className={`grid gap-4 ${availableTimeSlots.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {availableTimeSlots.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedTimeSlot(slot)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedTimeSlot === slot
                  ? 'border-green-600 bg-green-100 text-green-800'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              <div className="font-bold text-lg">{slot}</div>
              <div className="text-sm">
                {slot.includes('AM') ? 'Morning Session' : 'Afternoon Session'}
              </div>
            </button>
          ))}
        </div>
      </div>


      <div className="flex gap-4 justify-center pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
        >
          Register Info Session
        </button>
      </div>
    </form>
  )
}

export default InfoSessionForm


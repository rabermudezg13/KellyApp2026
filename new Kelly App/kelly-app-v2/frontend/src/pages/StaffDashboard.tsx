import React, { useState, useEffect } from 'react'
import { getLiveInfoSessions, getCompletedInfoSessions, getNewHireOrientations, getBadges, getFingerprints, getMyVisits, getCurrentUser, notifyTeamVisit } from '../services/api'
import type { InfoSessionWithSteps } from '../types'
import { formatMiamiTime, getMiamiDateKey, formatMiamiDateDisplay } from '../utils/dateUtils'

type TabType = 'info-session' | 'info-session-completed' | 'new-hire-orientation' | 'badges' | 'fingerprints' | 'my-visits'

function StaffDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('info-session')
  const [liveSessions, setLiveSessions] = useState<InfoSessionWithSteps[]>([])
  const [completedSessions, setCompletedSessions] = useState<InfoSessionWithSteps[]>([])
  const [newHireOrientations, setNewHireOrientations] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [fingerprints, setFingerprints] = useState<any[]>([])
  const [myVisits, setMyVisits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    loadData()
    // Set up polling for live updates every 5 seconds
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [activeTab])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/staff/login'
      return
    }
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      // Not authenticated, redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/staff/login'
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      switch (activeTab) {
        case 'info-session':
          const live = await getLiveInfoSessions()
          setLiveSessions(live)
          break
        case 'info-session-completed':
          const completed = await getCompletedInfoSessions()
          setCompletedSessions(completed)
          break
        case 'new-hire-orientation':
          const orientations = await getNewHireOrientations()
          setNewHireOrientations(orientations)
          break
        case 'badges':
          const badgesData = await getBadges()
          setBadges(badgesData)
          break
        case 'fingerprints':
          const fingerprintsData = await getFingerprints()
          setFingerprints(fingerprintsData)
          break
        case 'my-visits':
          const visits = await getMyVisits()
          setMyVisits(visits)
          break
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderInfoSessionLive = () => {
    if (loading) return <p className="text-center py-8">Loading...</p>
    
    // Group sessions by date
    const groupedSessions: { [key: string]: InfoSessionWithSteps[] } = {}
    liveSessions.forEach((session) => {
      const dateKey = getMiamiDateKey(session.created_at)
      if (!groupedSessions[dateKey]) {
        groupedSessions[dateKey] = []
      }
      groupedSessions[dateKey].push(session)
    })
    
    // Sort date keys (most recent first)
    const sortedDateKeys = Object.keys(groupedSessions).sort().reverse()
    
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-800 font-bold">🟢 Live Registration - Updates every 5 seconds</p>
        </div>
        {liveSessions.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No active registrations</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">ZIP Code</th>
                  <th className="px-4 py-2 text-left">Time Slot</th>
                  <th className="px-4 py-2 text-left">Registered At</th>
                  <th className="px-4 py-2 text-left">Assigned Recruiter</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Exclusion</th>
                </tr>
              </thead>
              <tbody>
                {sortedDateKeys.map((dateKey, dateIndex) => {
                  const sessionsForDate = groupedSessions[dateKey]
                  return (
                    <React.Fragment key={dateKey}>
                      {dateIndex > 0 && (
                        <tr>
                          <td colSpan={9} className="px-4 py-3 bg-gray-100 border-t-2 border-gray-300">
                            <div className="text-center">
                              <span className="text-gray-700 font-bold text-lg">
                                ─── {formatMiamiDateDisplay(sessionsForDate[0].created_at)} ───
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                      {sessionsForDate.map((session) => (
                        <tr key={session.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-semibold">
                            {session.first_name} {session.last_name}
                          </td>
                          <td className="px-4 py-2">{session.email}</td>
                          <td className="px-4 py-2">{session.phone}</td>
                          <td className="px-4 py-2">{session.zip_code}</td>
                          <td className="px-4 py-2">{session.time_slot}</td>
                          <td className="px-4 py-2">
                            <span className="text-gray-700 text-sm">
                              {formatMiamiTime(session.created_at)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {session.assigned_recruiter_name ? (
                              <a
                                href={`/recruiter/${session.assigned_recruiter_id}/dashboard`}
                                className="px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                              >
                                {session.assigned_recruiter_name}
                              </a>
                            ) : (
                              <span className="text-gray-400">Not assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-sm ${
                              session.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {session.is_in_exclusion_list && session.exclusion_match ? (
                              <div className="bg-red-100 border-2 border-red-500 rounded p-2 text-red-800">
                                <div className="font-bold text-sm mb-1">⚠️ POSIBLE PC o RR</div>
                                <div className="text-xs space-y-1">
                                  <div><strong>Name:</strong> {session.exclusion_match.name}</div>
                                  {session.exclusion_match.code && (
                                    <div><strong>Code:</strong> {session.exclusion_match.code}</div>
                                  )}
                                  {session.exclusion_match.ssn && (
                                    <div><strong>SSN:</strong> {session.exclusion_match.ssn}</div>
                                  )}
                                </div>
                              </div>
                            ) : session.is_in_exclusion_list ? (
                              <span className="px-2 py-1 rounded bg-red-100 text-red-800 font-bold text-xs">
                                ⚠️ Possible PC/RR
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const renderInfoSessionCompleted = () => {
    if (loading) return <p className="text-center py-8">Loading...</p>
    
    // Group sessions by date (based on created_at)
    const groupedSessions: { [key: string]: InfoSessionWithSteps[] } = {}
    completedSessions.forEach((session) => {
      const dateKey = getMiamiDateKey(session.created_at)
      if (!groupedSessions[dateKey]) {
        groupedSessions[dateKey] = []
      }
      groupedSessions[dateKey].push(session)
    })
    
    // Sort date keys (most recent first)
    const sortedDateKeys = Object.keys(groupedSessions).sort().reverse()
    
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-blue-800 font-bold">✅ Completed Info Sessions - Recruiters Assigned</p>
        </div>
        {completedSessions.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No completed sessions</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Assigned Recruiter</th>
                  <th className="px-4 py-2 text-left">Registered At</th>
                  <th className="px-4 py-2 text-left">Completed At</th>
                  <th className="px-4 py-2 text-left">Total Duration</th>
                  <th className="px-4 py-2 text-left">Exclusion</th>
                  <th className="px-4 py-2 text-left">Documents</th>
                </tr>
              </thead>
              <tbody>
                {sortedDateKeys.map((dateKey, dateIndex) => {
                  const sessionsForDate = groupedSessions[dateKey]
                  return (
                    <React.Fragment key={dateKey}>
                      {dateIndex > 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-3 bg-gray-100 border-t-2 border-gray-300">
                            <div className="text-center">
                              <span className="text-gray-700 font-bold text-lg">
                                ─── {formatMiamiDateDisplay(sessionsForDate[0].created_at)} ───
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                      {sessionsForDate.map((session) => (
                        <tr key={session.id} className="border-b">
                          <td className="px-4 py-2 font-semibold">
                            {session.first_name} {session.last_name}
                          </td>
                          <td className="px-4 py-2">{session.email}</td>
                          <td className="px-4 py-2">
                            {session.assigned_recruiter_name ? (
                              <a
                                href={`/recruiter/${session.assigned_recruiter_id}/dashboard`}
                                className="px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                              >
                                {session.assigned_recruiter_name}
                              </a>
                            ) : (
                              <span className="text-gray-400">Not assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-gray-700">
                              {formatMiamiTime(session.created_at)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-gray-700">
                              {formatMiamiTime(session.completed_at)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {session.duration_minutes ? (
                              <span className="text-blue-600 font-semibold">
                                {Math.floor(session.duration_minutes / 60)}h {session.duration_minutes % 60}m
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {session.is_in_exclusion_list && session.exclusion_match ? (
                              <div className="bg-red-100 border-2 border-red-500 rounded p-2 text-red-800">
                                <div className="font-bold text-sm mb-1">⚠️ POSIBLE PC o RR</div>
                                <div className="text-xs space-y-1">
                                  <div><strong>Name:</strong> {session.exclusion_match.name}</div>
                                  {session.exclusion_match.code && (
                                    <div><strong>Code:</strong> {session.exclusion_match.code}</div>
                                  )}
                                  {session.exclusion_match.ssn && (
                                    <div><strong>SSN:</strong> {session.exclusion_match.ssn}</div>
                                  )}
                                </div>
                              </div>
                            ) : session.is_in_exclusion_list ? (
                              <span className="px-2 py-1 rounded bg-red-100 text-red-800 font-bold text-xs">
                                ⚠️ Possible PC/RR
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-1">
                              {session.ob365_sent && <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">OB365</span>}
                              {session.i9_sent && <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">I9</span>}
                              {session.drug_screen && <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs">Drug</span>}
                              {session.questions && <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-800 text-xs">Q</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const renderGenericTable = (data: any[], fields: string[]) => {
    if (loading) return <p className="text-center py-8">Loading...</p>
    
    if (data.length === 0) {
      return <p className="text-center py-8 text-gray-500">No records found</p>
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              {fields.map((field) => (
                <th key={field} className="px-4 py-2 text-left capitalize">
                  {field.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b">
                {fields.map((field) => (
                  <td key={field} className="px-4 py-2">
                    {item[field] || 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderMyVisits = () => {
    if (loading) return <p className="text-center py-8">Loading...</p>
    
    const unreadVisits = myVisits.filter(v => v.status === 'pending')
    
    return (
      <div className="space-y-4">
        {unreadVisits.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-yellow-800 font-bold">
              🔔 You have {unreadVisits.length} new visit{unreadVisits.length > 1 ? 's' : ''}!
            </p>
          </div>
        )}
        {myVisits.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No visits assigned to you</p>
        ) : (
          <div className="space-y-3">
            {myVisits.map((visit) => (
              <div
                key={visit.id}
                className={`border rounded-lg p-4 ${
                  visit.status === 'pending' ? 'bg-yellow-50 border-yellow-300' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{visit.visitor_name}</h3>
                    {visit.visitor_email && <p className="text-gray-600">{visit.visitor_email}</p>}
                    <p className="text-gray-700 mt-2">{visit.reason}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Team: {visit.team} | Registered: {formatMiamiTime(visit.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded text-sm ${
                      visit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {visit.status}
                    </span>
                    {visit.status === 'pending' && (
                      <button
                        onClick={async () => {
                          try {
                            await notifyTeamVisit(visit.id)
                            loadData()
                          } catch (error) {
                            alert('Error marking as notified')
                          }
                        }}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Mark as Notified
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Staff Dashboard</h1>
              {currentUser && (
                <p className="text-gray-600">Welcome, {currentUser.full_name}</p>
              )}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/staff/login'
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex flex-wrap border-b">
            <button
              onClick={() => setActiveTab('info-session')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'info-session'
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 Info Session (Live)
            </button>
            <button
              onClick={() => setActiveTab('info-session-completed')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'info-session-completed'
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ✅ Info Session Completed
            </button>
            <button
              onClick={() => setActiveTab('new-hire-orientation')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'new-hire-orientation'
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👔 New Hire Orientation
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'badges'
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🪪 Badges
            </button>
            <button
              onClick={() => setActiveTab('fingerprints')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'fingerprints'
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👆 Fingerprints
            </button>
            <button
              onClick={() => setActiveTab('my-visits')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'my-visits'
                  ? 'bg-green-600 text-white border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👥 My Visits
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'info-session' && renderInfoSessionLive()}
          {activeTab === 'info-session-completed' && renderInfoSessionCompleted()}
          {activeTab === 'new-hire-orientation' && renderGenericTable(newHireOrientations, ['first_name', 'last_name', 'email', 'phone', 'time_slot', 'status', 'created_at'])}
          {activeTab === 'badges' && renderGenericTable(badges, ['first_name', 'last_name', 'email', 'phone', 'appointment_time', 'status', 'created_at'])}
          {activeTab === 'fingerprints' && renderGenericTable(fingerprints, ['first_name', 'last_name', 'email', 'phone', 'appointment_time', 'fingerprint_type', 'status', 'created_at'])}
          {activeTab === 'my-visits' && renderMyVisits()}
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard

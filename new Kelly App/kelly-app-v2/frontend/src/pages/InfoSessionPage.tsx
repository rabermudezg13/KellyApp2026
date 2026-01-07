import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerInfoSession, checkExclusion, getInfoSession } from '../services/api'
import InfoSessionWelcome from '../components/InfoSessionWelcome'
import InfoSessionForm from '../components/InfoSessionForm'
import type { InfoSessionRegistration, InfoSessionWithSteps } from '../types'

const STORAGE_KEY = 'kelly_info_session_data'
const STORAGE_EXCLUSION_KEY = 'kelly_info_session_exclusion_warning'

function InfoSessionPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'form' | 'welcome'>('form')
  const [sessionData, setSessionData] = useState<InfoSessionWithSteps | null>(null)
  const [exclusionWarning, setExclusionWarning] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load saved session on mount
  useEffect(() => {
    const loadSavedSession = async () => {
      try {
        const savedSessionData = localStorage.getItem(STORAGE_KEY)
        const savedExclusionWarning = localStorage.getItem(STORAGE_EXCLUSION_KEY)
        
        if (savedSessionData) {
          const parsed = JSON.parse(savedSessionData)
          
          // Verify session still exists and get latest data from backend
          try {
            const latestSession = await getInfoSession(parsed.id)
            
            // Only restore if session is not completed
            if (latestSession.status !== 'completed') {
              setSessionData(latestSession)
              setStep('welcome')
              
              if (savedExclusionWarning) {
                setExclusionWarning(savedExclusionWarning)
              }
            } else {
              // Session was completed, clear storage
              localStorage.removeItem(STORAGE_KEY)
              localStorage.removeItem(STORAGE_EXCLUSION_KEY)
            }
          } catch (error) {
            // Session might not exist anymore, clear storage
            console.error('Error loading saved session:', error)
            localStorage.removeItem(STORAGE_KEY)
            localStorage.removeItem(STORAGE_EXCLUSION_KEY)
          }
        }
      } catch (error) {
        console.error('Error loading saved session:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSavedSession()
  }, [])

  const handleSubmit = async (formData: InfoSessionRegistration) => {
    try {
      // Check exclusion list silently (for backend tracking only, not shown to visitor)
      try {
        const exclusionCheck = await checkExclusion(formData.first_name, formData.last_name)
        if (exclusionCheck.is_in_exclusion_list) {
          // Store warning for staff dashboard only, not shown to visitor
          const warning = exclusionCheck.warning_message || 'Please verify social and data to verify that this person is on the PC or RR list'
          localStorage.setItem(STORAGE_EXCLUSION_KEY, warning)
        } else {
          localStorage.removeItem(STORAGE_EXCLUSION_KEY)
        }
      } catch (exclusionError) {
        // Silently handle exclusion check errors - don't block registration
        console.error('Error checking exclusion (non-blocking):', exclusionError)
      }

      // Register the session
      const registered = await registerInfoSession(formData)
      setSessionData(registered)
      setStep('welcome')
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        id: registered.id,
        first_name: registered.first_name,
        last_name: registered.last_name,
        email: registered.email,
        created_at: registered.created_at
      }))
    } catch (error: any) {
      alert(`Error registering: ${error.response?.data?.detail || error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-gray-800">Loading session...</p>
        </div>
      </div>
    )
  }

  if (step === 'welcome' && sessionData) {
    return <InfoSessionWelcome 
      sessionData={sessionData} 
      onSessionCompleted={() => {
        // Clear storage when session is completed
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(STORAGE_EXCLUSION_KEY)
      }}
    />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Info Session Registration</h2>
          <p className="text-center text-gray-600 mb-6">
            📅 You are registering for TODAY's info session
          </p>

          <InfoSessionForm onSubmit={handleSubmit} onCancel={() => navigate('/')} />
        </div>
      </div>
    </div>
  )
}

export default InfoSessionPage



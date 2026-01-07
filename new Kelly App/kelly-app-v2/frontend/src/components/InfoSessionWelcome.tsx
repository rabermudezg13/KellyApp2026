import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeStep, completeInfoSession, getInfoSession } from '../services/api'
import type { InfoSessionWithSteps } from '../types'

interface Props {
  sessionData: InfoSessionWithSteps
  onSessionCompleted?: () => void
}

function InfoSessionWelcome({ sessionData, onSessionCompleted }: Props) {
  const navigate = useNavigate()
  const [steps, setSteps] = useState(sessionData.steps)
  const [allStepsCompleted, setAllStepsCompleted] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentSessionData, setCurrentSessionData] = useState(sessionData)

  // Sync with backend periodically to get latest state
  useEffect(() => {
    const syncSession = async () => {
      try {
        const latest = await getInfoSession(sessionData.id)
        setCurrentSessionData(latest)
        setSteps(latest.steps)
        
        // Check if session was completed
        if (latest.status === 'completed' && !isCompleted) {
          setIsCompleted(true)
          if (onSessionCompleted) {
            onSessionCompleted()
          }
        }
      } catch (error) {
        console.error('Error syncing session:', error)
      }
    }

    // Sync immediately
    syncSession()
    
    // Sync every 5 seconds
    const interval = setInterval(syncSession, 5000)
    
    return () => clearInterval(interval)
  }, [sessionData.id, isCompleted, onSessionCompleted])

  useEffect(() => {
    const allCompleted = steps.every(step => step.is_completed)
    setAllStepsCompleted(allCompleted)
  }, [steps])

  const handleStepComplete = async (stepName: string) => {
    try {
      await completeStep(sessionData.id, stepName)
      
      // Update local state
      const updatedSteps = steps.map(step => 
        step.step_name === stepName 
          ? { ...step, is_completed: true }
          : step
      )
      setSteps(updatedSteps)
      
      // Sync with backend to get latest state
      const latest = await getInfoSession(sessionData.id)
      setCurrentSessionData(latest)
      setSteps(latest.steps)
    } catch (error) {
      console.error('Error completing step:', error)
      alert('Error completing step. Please try again.')
    }
  }

  const handleCompleteSession = async () => {
    if (!allStepsCompleted) {
      alert('Please complete all steps before marking the session as completed.')
      return
    }

    if (isCompleting || isCompleted) {
      return
    }

    try {
      setIsCompleting(true)
      await completeInfoSession(sessionData.id)
      setIsCompleted(true)
      
      // Clear localStorage
      if (onSessionCompleted) {
        onSessionCompleted()
      }
      
      alert('Info Session marked as completed! You will now appear in the completed sessions list.')
      
      // Sync with backend to get latest state
      const latest = await getInfoSession(sessionData.id)
      setCurrentSessionData(latest)
      setSteps(latest.steps)
    } catch (error: any) {
      console.error('Error completing session:', error)
      alert(`Error completing session: ${error.response?.data?.detail || error.message}`)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
            Welcome to Kelly Education Miami Dade
          </h1>

          <div className="mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-700 mb-4">
              For our process you must be able to communicate in English, have your Education Proof. 
              If your Education Proof is not from the U.S., you must have the equivalence. 
              If you don't have it, our representatives will inform you how to do it.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Two Forms of Government ID</strong> such as:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Driver's License</li>
              <li>Social Security Card</li>
              <li>U.S. Passport</li>
              <li>Birth Certificate</li>
              <li>Permanent Resident Card</li>
              <li>Work Permit Card</li>
            </ul>
            <p className="text-gray-700 mt-4 font-semibold">
              Documents must be physical originals, not copies, and must not be expired.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Follow the steps below and check each step as you complete each stage:
            </h2>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.step_name}
                  className={`p-6 rounded-lg border-2 ${
                    step.is_completed
                      ? 'bg-green-50 border-green-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={step.is_completed}
                      onChange={() => !step.is_completed && handleStepComplete(step.step_name)}
                      className="mt-1 w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      disabled={step.is_completed}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">
                        Step {index + 1}: {step.step_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <p className="text-gray-700">{step.step_description}</p>
                    </div>
                    {step.is_completed && (
                      <span className="text-green-600 font-bold">✓ Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {allStepsCompleted && !isCompleted && (
            <div className="mb-6 p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
              <p className="text-yellow-800 font-bold text-lg mb-4">
                ⚠️ Do not close this screen
              </p>
              <p className="text-yellow-700 mb-4">
                Please, once the Info Session is finished, click the "Info Session Completed" button.
              </p>
              <div className="text-center">
                <button
                  onClick={handleCompleteSession}
                  disabled={isCompleting}
                  className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompleting ? 'Completing...' : 'Info Session Completed'}
                </button>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="mb-6 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-800 font-bold text-lg mb-2">
                ✅ Info Session Completed
              </p>
              <p className="text-green-700 mb-2">
                Your session has been marked as completed and will appear in the completed sessions list.
              </p>
              {currentSessionData.assigned_recruiter_name && (
                <p className="text-green-800 font-semibold">
                  Assigned Recruiter: <span className="font-bold">{currentSessionData.assigned_recruiter_name}</span>
                </p>
              )}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoSessionWelcome



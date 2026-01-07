import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  getRecruiterStatus,
  updateRecruiterStatus,
  getAssignedSessions,
  startSession,
  completeSession,
  updateSessionDocuments,
  getRowTemplates,
  getRowTemplate,
  generateRow,
} from '../services/api'
import type { AssignedSession, Recruiter } from '../types'
import type { RowTemplate } from '../services/api'
import { formatMiamiTime } from '../utils/dateUtils'

function RecruiterDashboard() {
  const { recruiterId } = useParams<{ recruiterId: string }>()
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null)
  const [sessions, setSessions] = useState<AssignedSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<AssignedSession | null>(null)
  const [documentStatus, setDocumentStatus] = useState({
    ob365_sent: false,
    i9_sent: false,
    existing_i9: false,
    ineligible: false,
    rejected: false,
    drug_screen: false,
    questions: false,
  })
  const [showRowGenerator, setShowRowGenerator] = useState(false)
  const [templates, setTemplates] = useState<RowTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<RowTemplate | null>(null)
  const [rowData, setRowData] = useState<Record<string, any>>({})
  const [generatedRow, setGeneratedRow] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [sessionRowData, setSessionRowData] = useState<Record<string, any>>({})
  const [sessionGeneratedRow, setSessionGeneratedRow] = useState<string>('')
  const [sessionRowCopied, setSessionRowCopied] = useState(false)

  useEffect(() => {
    if (recruiterId) {
      loadData()
    }
  }, [recruiterId])

  const loadData = async () => {
    if (!recruiterId) return
    try {
      setLoading(true)
      const [recruiterData, sessionsData, templatesData] = await Promise.all([
        getRecruiterStatus(parseInt(recruiterId)),
        getAssignedSessions(parseInt(recruiterId)),
        getRowTemplates(true), // Only active templates
      ])
      setRecruiter(recruiterData as Recruiter)
      setSessions(sessionsData.sessions)
      setTemplates(templatesData)
      
      // Update selected session if it exists
      if (selectedSession) {
        const updatedSession = sessionsData.sessions.find(s => s.id === selectedSession.id)
        if (updatedSession) {
          setSelectedSession(updatedSession)
          setDocumentStatus({
            ob365_sent: updatedSession.ob365_sent,
            i9_sent: updatedSession.i9_sent,
            existing_i9: updatedSession.existing_i9,
            ineligible: updatedSession.ineligible,
            rejected: updatedSession.rejected,
            drug_screen: updatedSession.drug_screen,
            questions: updatedSession.questions,
          })
          
          // If session is in-progress and has a generated_row, restore it
          if (updatedSession.status === 'in-progress' && updatedSession.generated_row && selectedTemplate) {
            setSessionGeneratedRow(updatedSession.generated_row)
            loadRowDataFromGeneratedRow(updatedSession.generated_row, updatedSession)
          }
        }
      }
      
      if (templatesData.length > 0 && !selectedTemplate) {
        setSelectedTemplate(templatesData[0])
        // Initialize row data with default values
        const initialData: Record<string, any> = {}
        templatesData[0].columns.forEach((col) => {
          // Don't set date automatically - let it be set when generating the row
          initialData[col.name] = col.default_value || ''
        })
        setRowData(initialData)
      } else if (templatesData.length > 0 && selectedTemplate) {
        // Update selected template if it changed
        const updatedTemplate = templatesData.find(t => t.id === selectedTemplate.id)
        if (updatedTemplate) {
          setSelectedTemplate(updatedTemplate)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!recruiter || !recruiterId) return
    const newStatus = recruiter.status === 'available' ? 'busy' : 'available'
    try {
      await updateRecruiterStatus(parseInt(recruiterId), newStatus)
      setRecruiter({ ...recruiter, status: newStatus })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status')
    }
  }

  const handleStartSession = async (sessionId: number) => {
    if (!recruiterId) return
    try {
      const result = await startSession(parseInt(recruiterId), sessionId)
      await loadData()
      
      // If row was generated, load it for editing
      if (result.generated_row) {
        // Reload sessions to get updated data
        const sessionsData = await getAssignedSessions(parseInt(recruiterId!))
        const updatedSession = sessionsData.sessions.find(s => s.id === sessionId)
        if (updatedSession) {
          setSelectedSession(updatedSession)
          setSessionGeneratedRow(result.generated_row)
          // Parse the row to populate editable fields
          if (selectedTemplate) {
            loadRowDataFromGeneratedRow(result.generated_row, updatedSession)
          }
        }
      }
      
      alert('Session started! Row generated.')
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Error starting session')
    }
  }

  const loadRowDataFromGeneratedRow = (rowText: string, session: AssignedSession) => {
    if (!selectedTemplate) {
      // If no template selected, try to get the first one
      if (templates.length > 0) {
        setSelectedTemplate(templates[0])
        // Recursively call with the first template
        setTimeout(() => {
          if (templates[0]) {
            const sortedColumns = [...templates[0].columns].sort((a, b) => a.order - b.order)
            const values = rowText.split('\t')
            const newRowData: Record<string, any> = {}
            sortedColumns.forEach((column, index) => {
              if (index < values.length) {
                newRowData[column.name] = values[index]
              } else {
                newRowData[column.name] = column.default_value || ''
              }
            })
            setSessionRowData(newRowData)
          }
        }, 100)
      }
      return
    }
    
    // Split the row by tabs
    const values = rowText.split('\t')
    
    // Map values to column names
    const sortedColumns = [...selectedTemplate.columns].sort((a, b) => a.order - b.order)
    const newRowData: Record<string, any> = {}
    
    sortedColumns.forEach((column, index) => {
      if (index < values.length) {
        newRowData[column.name] = values[index]
      } else {
        newRowData[column.name] = column.default_value || ''
      }
    })
    
    setSessionRowData(newRowData)
  }

  const handleCompleteSession = async () => {
    if (!selectedSession || !recruiterId) return
    try {
      await completeSession(parseInt(recruiterId), selectedSession.id, documentStatus)
      await loadData()
      setSelectedSession(null)
      setDocumentStatus({
        ob365_sent: false,
        i9_sent: false,
        existing_i9: false,
        ineligible: false,
        rejected: false,
        drug_screen: false,
        questions: false,
      })
      alert('Session completed!')
    } catch (error) {
      console.error('Error completing session:', error)
      alert('Error completing session')
    }
  }

  const handleUpdateDocuments = async () => {
    if (!selectedSession || !recruiterId) return
    try {
      await updateSessionDocuments(parseInt(recruiterId), selectedSession.id, documentStatus)
      await loadData()
      alert('Documents updated!')
    } catch (error) {
      console.error('Error updating documents:', error)
      alert('Error updating documents')
    }
  }

  const openSessionDetails = async (session: AssignedSession) => {
    setSelectedSession(session)
    setDocumentStatus({
      ob365_sent: session.ob365_sent,
      i9_sent: session.i9_sent,
      existing_i9: session.existing_i9,
      ineligible: session.ineligible,
      rejected: session.rejected,
      drug_screen: session.drug_screen,
      questions: session.questions,
    })
    
    // If session is in-progress and has a generated_row, load it
    if (session.status === 'in-progress' && session.generated_row && selectedTemplate) {
      setSessionGeneratedRow(session.generated_row)
      // Parse the existing row to populate editable fields
      loadRowDataFromGeneratedRow(session.generated_row, session)
    } else if (session.status === 'in-progress' && session.started_at && selectedTemplate) {
      // If no generated_row exists but session is in-progress, generate it
      const initialData: Record<string, any> = {}
      
      // Get recruiter initials
      let recruiterInitials = ''
      if (recruiter) {
        const nameParts = recruiter.name.split(' ')
        if (nameParts.length >= 2) {
          recruiterInitials = nameParts[0][0].toUpperCase() + nameParts[nameParts.length - 1][0].toUpperCase()
        } else if (nameParts.length === 1) {
          recruiterInitials = nameParts[0][0].toUpperCase()
        }
      }
      
      selectedTemplate.columns.forEach((col) => {
        const colNameLower = col.name.toLowerCase()
        const colNameUpper = col.name.toUpperCase().trim()
        
        // Leave FP expiration date blank
        if ('fp' in colNameLower && 'expiration' in colNameLower) {
          initialData[col.name] = ''  // Leave blank
        } else if ('applicant' in colNameLower && 'name' in colNameLower) {
          initialData[col.name] = `${session.first_name} ${session.last_name}`
        } else if ('numero' in colNameLower || ('phone' in colNameLower && 'numero' in colNameLower) || ('talent' in colNameLower && 'phone' in colNameLower)) {
          initialData[col.name] = session.phone
        } else if ('email' in colNameLower) {
          initialData[col.name] = session.email
        } else if (colNameUpper === 'R' || colNameUpper === 'O') {
          initialData[col.name] = recruiterInitials
        } else if (col.column_type === 'date') {
          initialData[col.name] = new Date().toISOString().split('T')[0]
        } else {
          initialData[col.name] = col.default_value || ''
        }
      })
      setSessionRowData(initialData)
      
      // Generate the row
      try {
        const currentDate = new Date().toISOString().split('T')[0]
        const dataToSend: Record<string, any> = { ...initialData }
        selectedTemplate.columns.forEach((col) => {
          if (col.column_type === 'date') {
            dataToSend[col.name] = currentDate
          }
        })
        const result = await generateRow(selectedTemplate.id, dataToSend)
        setSessionGeneratedRow(result.row_text)
      } catch (error) {
        console.error('Error generating row:', error)
      }
    } else {
      // Clear row data if not in-progress
      setSessionGeneratedRow('')
      setSessionRowData({})
    }
  }

  const handleUpdateSessionRow = async () => {
    if (!selectedTemplate || !selectedSession || !recruiterId) return
    
    try {
      // Get recruiter initials
      let recruiterInitials = ''
      if (recruiter) {
        const nameParts = recruiter.name.split(' ')
        if (nameParts.length >= 2) {
          recruiterInitials = nameParts[0][0].toUpperCase() + nameParts[nameParts.length - 1][0].toUpperCase()
        } else if (nameParts.length === 1) {
          recruiterInitials = nameParts[0][0].toUpperCase()
        }
      }
      
      const currentDate = new Date().toISOString().split('T')[0]
      const dataToSend: Record<string, any> = { ...sessionRowData }
      
      selectedTemplate.columns.forEach((col) => {
        const colNameUpper = col.name.toUpperCase().trim()
        const colNameLower = col.name.toLowerCase()
        
        // Leave FP expiration date blank
        if ('fp' in colNameLower && 'expiration' in colNameLower) {
          dataToSend[col.name] = ''  // Always leave blank
        }
        // Ensure recruiter initials are in columns R and O
        else if ((colNameUpper === 'R' || colNameUpper === 'O') && !dataToSend[col.name]) {
          dataToSend[col.name] = recruiterInitials
        }
        // Ensure applicant name, phone, and email are preserved if missing
        else if ('applicant' in colNameLower && 'name' in colNameLower && !dataToSend[col.name]) {
          dataToSend[col.name] = `${selectedSession.first_name} ${selectedSession.last_name}`
        } else if (('numero' in colNameLower || ('phone' in colNameLower && 'numero' in colNameLower) || ('talent' in colNameLower && 'phone' in colNameLower)) && !dataToSend[col.name]) {
          dataToSend[col.name] = selectedSession.phone
        } else if ('email' in colNameLower && !dataToSend[col.name]) {
          dataToSend[col.name] = selectedSession.email
        }
        else if (col.column_type === 'date' && !dataToSend[col.name]) {
          dataToSend[col.name] = currentDate
        }
      })
      
      const result = await generateRow(selectedTemplate.id, dataToSend)
      setSessionGeneratedRow(result.row_text)
      setSessionRowCopied(false)
      
      // Save the updated row to the session in the database
      await updateSessionDocuments(parseInt(recruiterId), selectedSession.id, {
        ...documentStatus,
        generated_row: result.row_text,
      })
      
      // Reload data to get updated session
      await loadData()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error generating row')
    }
  }

  const handleCopySessionRow = async () => {
    if (!sessionGeneratedRow) return

    try {
      await navigator.clipboard.writeText(sessionGeneratedRow)
      setSessionRowCopied(true)
      setTimeout(() => setSessionRowCopied(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = sessionGeneratedRow
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setSessionRowCopied(true)
      setTimeout(() => setSessionRowCopied(false), 2000)
    }
  }

  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const handleTemplateChange = (templateId: number) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      // Initialize row data with default values
      const initialData: Record<string, any> = {}
      template.columns.forEach((col) => {
        // Don't set date automatically - let it be set when generating the row
        initialData[col.name] = col.default_value || ''
      })
      setRowData(initialData)
      setGeneratedRow('')
    }
  }

  const handleGenerateRow = async () => {
    if (!selectedTemplate) return

    try {
      // Prepare data for generation - set today's date for date fields that are empty
      const dataToSend: Record<string, any> = { ...rowData }
      
      // Get current date/time when generating the row
      const currentDate = new Date().toISOString().split('T')[0]
      
      selectedTemplate.columns.forEach((col) => {
        if (col.column_type === 'date') {
          // Always set to current date when generating row (date of row creation)
          // This ensures the date reflects when the row was created, not when form was loaded
          dataToSend[col.name] = currentDate
        }
      })
      
      const result = await generateRow(selectedTemplate.id, dataToSend)
      setGeneratedRow(result.row_text)
      setCopied(false)
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error generating row')
    }
  }

  const handleCopyToClipboard = async () => {
    if (!generatedRow) return

    try {
      await navigator.clipboard.writeText(generatedRow)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = generatedRow
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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

  if (!recruiter) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p>Recruiter not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with Status Toggle */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{recruiter.name}</h1>
              <p className="text-gray-600">{recruiter.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg font-bold ${
                recruiter.status === 'available'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                Status: {recruiter.status === 'available' ? 'Available' : 'Busy'}
              </div>
              <button
                onClick={handleStatusToggle}
                className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                  recruiter.status === 'available'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {recruiter.status === 'available' ? 'Mark as Busy' : 'Mark as Available'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setShowRowGenerator(false)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                !showRowGenerator
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => setShowRowGenerator(true)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                showRowGenerator
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 Row Generator
            </button>
          </div>
        </div>

        {showRowGenerator ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Row Generator</h2>
            
            {templates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No active templates available. Contact admin to create a template.
              </p>
            ) : (
              <div className="space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Template
                  </label>
                  <select
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => handleTemplateChange(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                  {selectedTemplate?.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedTemplate.description}</p>
                  )}
                </div>

                {/* Form Fields */}
                {selectedTemplate && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Fill in the information:</h3>
                      {selectedTemplate.columns
                        .sort((a, b) => a.order - b.order)
                        .map((column) => (
                          <div key={column.id || column.order} className="border rounded-lg p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {column.name}
                              {column.is_required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            
                            {column.notes && (
                              <p className="text-xs text-gray-500 mb-2">{column.notes}</p>
                            )}

                            {column.column_type === 'dropdown' && column.options ? (
                              <select
                                value={rowData[column.name] || ''}
                                onChange={(e) =>
                                  setRowData({ ...rowData, [column.name]: e.target.value })
                                }
                                required={column.is_required}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select...</option>
                                {column.options.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : column.column_type === 'note' ? (
                              <textarea
                                value={rowData[column.name] || ''}
                                onChange={(e) =>
                                  setRowData({ ...rowData, [column.name]: e.target.value })
                                }
                                required={column.is_required}
                                placeholder={column.placeholder || 'Enter notes...'}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows={3}
                              />
                            ) : column.column_type === 'date' ? (
                              <div>
                                <input
                                  type="date"
                                  value={rowData[column.name] || ''}
                                  onChange={(e) =>
                                    setRowData({ ...rowData, [column.name]: e.target.value })
                                  }
                                  required={column.is_required}
                                  placeholder={column.placeholder || 'Will be set automatically when generating row'}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Leave empty to use today's date when generating the row
                                </p>
                              </div>
                            ) : column.column_type === 'number' ? (
                              <input
                                type="number"
                                value={rowData[column.name] || ''}
                                onChange={(e) =>
                                  setRowData({ ...rowData, [column.name]: e.target.value })
                                }
                                required={column.is_required}
                                placeholder={column.placeholder}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <input
                                type="text"
                                value={rowData[column.name] || ''}
                                onChange={(e) =>
                                  setRowData({ ...rowData, [column.name]: e.target.value })
                                }
                                required={column.is_required}
                                placeholder={column.placeholder || `Enter ${column.name.toLowerCase()}...`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                          </div>
                        ))}
                    </div>

                    {/* Generate Button */}
                    <div className="flex gap-4 pt-4 border-t">
                      <button
                        onClick={handleGenerateRow}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold"
                      >
                        Generate Row
                      </button>
                    </div>

                    {/* Generated Row */}
                    {generatedRow && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-3">Generated Row:</h3>
                        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-3">
                          <pre className="text-sm whitespace-pre-wrap break-all">
                            {generatedRow}
                          </pre>
                        </div>
                        <button
                          onClick={handleCopyToClipboard}
                          className={`w-full px-6 py-3 rounded-lg font-bold transition-colors ${
                            copied
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {copied ? '✅ Copied to Clipboard!' : '📋 Copy to Clipboard'}
                        </button>
                        <p className="text-sm text-gray-600 mt-2 text-center">
                          Paste this into your Excel tracker (Ctrl+V or Cmd+V)
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sessions List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Assigned Sessions</h2>
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No assigned sessions</p>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => openSessionDetails(session)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">
                            {session.first_name} {session.last_name}
                          </h3>
                          <p className="text-gray-600">{session.email}</p>
                          <p className="text-sm text-gray-500">
                            {session.time_slot} - {session.session_type}
                          </p>
                          {session.duration_minutes && (
                            <p className="text-sm text-blue-600 mt-1">
                              Duration: {formatDuration(session.duration_minutes)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded text-sm font-bold ${
                              session.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : session.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {session.status}
                          </span>
                          {!session.started_at && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartSession(session.id)
                              }}
                              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Start
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Session Details Panel */}
          <div className="lg:col-span-1">
            {selectedSession ? (
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-4">Session Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="font-bold">
                      {selectedSession.first_name} {selectedSession.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{selectedSession.email}</p>
                    <p className="text-sm text-gray-600">{selectedSession.phone}</p>
                  </div>

                  {selectedSession.started_at && (
                    <div className="text-sm">
                      <p>
                        Started: {formatMiamiTime(selectedSession.started_at)}
                      </p>
                      {selectedSession.completed_at && (
                        <p>
                          Completed: {formatMiamiTime(selectedSession.completed_at)}
                        </p>
                      )}
                      {selectedSession.duration_minutes && (
                        <p className="font-bold text-blue-600">
                          Duration: {formatDuration(selectedSession.duration_minutes)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Row Generator for In-Progress Sessions */}
                  {selectedSession.status === 'in-progress' && selectedTemplate && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-bold mb-3">Row Generator</h3>
                      <div className="space-y-3">
                        {selectedTemplate.columns
                          .sort((a, b) => a.order - b.order)
                          .map((column) => (
                            <div key={column.id || column.order}>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                {column.name}
                                {column.is_required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              {column.column_type === 'dropdown' && column.options ? (
                                <select
                                  value={sessionRowData[column.name] || ''}
                                  onChange={(e) =>
                                    setSessionRowData({ ...sessionRowData, [column.name]: e.target.value })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="">Select...</option>
                                  {column.options.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              ) : column.column_type === 'note' ? (
                                <textarea
                                  value={sessionRowData[column.name] || ''}
                                  onChange={(e) =>
                                    setSessionRowData({ ...sessionRowData, [column.name]: e.target.value })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                  rows={2}
                                />
                              ) : column.column_type === 'date' ? (
                                <input
                                  type="date"
                                  value={sessionRowData[column.name] || ''}
                                  onChange={(e) =>
                                    setSessionRowData({ ...sessionRowData, [column.name]: e.target.value })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              ) : column.column_type === 'number' ? (
                                <input
                                  type="number"
                                  value={sessionRowData[column.name] || ''}
                                  onChange={(e) =>
                                    setSessionRowData({ ...sessionRowData, [column.name]: e.target.value })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={sessionRowData[column.name] || ''}
                                  onChange={(e) =>
                                    setSessionRowData({ ...sessionRowData, [column.name]: e.target.value })
                                  }
                                  placeholder={column.placeholder}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              )}
                            </div>
                          ))}
                        <button
                          onClick={handleUpdateSessionRow}
                          className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-bold"
                        >
                          Update Row
                        </button>
                        {sessionGeneratedRow && (
                          <div className="border rounded p-3 bg-gray-50">
                            <div className="text-xs mb-2 font-semibold">Generated Row:</div>
                            <pre className="text-xs whitespace-pre-wrap break-all mb-2">
                              {sessionGeneratedRow}
                            </pre>
                            <button
                              onClick={handleCopySessionRow}
                              className={`w-full px-3 py-2 rounded text-sm font-bold transition-colors ${
                                sessionRowCopied
                                  ? 'bg-green-600 text-white'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {sessionRowCopied ? '✅ Copied!' : '📋 Copy Row'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h3 className="font-bold mb-3">Document Status</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.ob365_sent}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, ob365_sent: e.target.checked })
                          }
                          className="mr-2"
                        />
                        OB365 Sent
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.i9_sent}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, i9_sent: e.target.checked })
                          }
                          className="mr-2"
                        />
                        I9 Sent
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.existing_i9}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, existing_i9: e.target.checked })
                          }
                          className="mr-2"
                        />
                        Has Existing I9
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.ineligible}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, ineligible: e.target.checked })
                          }
                          className="mr-2"
                        />
                        Ineligible
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.rejected}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, rejected: e.target.checked })
                          }
                          className="mr-2"
                        />
                        Rejected
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.drug_screen}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, drug_screen: e.target.checked })
                          }
                          className="mr-2"
                        />
                        Drug Screen
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentStatus.questions}
                          onChange={(e) =>
                            setDocumentStatus({ ...documentStatus, questions: e.target.checked })
                          }
                          className="mr-2"
                        />
                        Questions
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={handleUpdateDocuments}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Update Documents
                    </button>
                    {selectedSession.status !== 'completed' && (
                      <button
                        onClick={handleCompleteSession}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Complete Session
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-500 text-center">Select a session to view details</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default RecruiterDashboard


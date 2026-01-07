import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getRowTemplates,
  getRowTemplate,
  createRowTemplate,
  updateRowTemplate,
  deleteRowTemplate,
} from '../services/api'
import type { RowTemplate, ColumnDefinition } from '../services/api'

function AdminRowGenerator() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<RowTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<RowTemplate | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<Partial<RowTemplate> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  // Store raw textarea value for dropdown options to allow multi-line editing
  const [dropdownTextValues, setDropdownTextValues] = useState<Record<number, string>>({})

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await getRowTemplates()
      setTemplates(data)
    } catch (error) {
      console.error('Error loading templates:', error)
      setMessage({ type: 'error', text: 'Error loading templates' })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = async (templateId: number) => {
    try {
      const template = await getRowTemplate(templateId)
      setSelectedTemplate(template)
      setEditingTemplate({
        name: template.name,
        description: template.description,
        is_active: template.is_active,
        columns: template.columns.map(col => ({ ...col })),
      })
      // Initialize dropdown text values
      const textValues: Record<number, string> = {}
      template.columns.forEach((col, idx) => {
        if (col.column_type === 'dropdown' && col.options && col.options.length > 0) {
          textValues[idx] = col.options.join('\n')
        }
      })
      setDropdownTextValues(textValues)
      setShowCreateForm(true)
    } catch (error) {
      console.error('Error loading template:', error)
      setMessage({ type: 'error', text: 'Error loading template' })
    }
  }

  const handleCreateNew = () => {
    setSelectedTemplate(null)
    setEditingTemplate({
      name: '',
      description: '',
      is_active: true,
      columns: [],
    })
    setDropdownTextValues({})
    setShowCreateForm(true)
  }

  const handleAddColumn = () => {
    if (!editingTemplate) return
    const newColumn: ColumnDefinition = {
      order: (editingTemplate.columns?.length || 0) + 1,
      name: '',
      column_type: 'text',
      placeholder: '',
      options: null,
      is_required: false,
      default_value: '',
      notes: '',
    }
    setEditingTemplate({
      ...editingTemplate,
      columns: [...(editingTemplate.columns || []), newColumn],
    })
  }

  const handleAddDropdownOption = (columnIndex: number) => {
    if (!editingTemplate || !editingTemplate.columns) return
    const column = editingTemplate.columns[columnIndex]
    if (column.column_type !== 'dropdown') return
    
    const currentOptions = column.options || []
    const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`]
    handleUpdateColumn(columnIndex, { options: newOptions })
  }

  const handleUpdateColumn = (index: number, updates: Partial<ColumnDefinition>) => {
    if (!editingTemplate || !editingTemplate.columns) return
    const newColumns = [...editingTemplate.columns]
    newColumns[index] = { ...newColumns[index], ...updates }
    setEditingTemplate({ ...editingTemplate, columns: newColumns })
  }

  const getDropdownTextValue = (columnIndex: number, column: ColumnDefinition): string => {
    // If we have a stored raw value, use it; otherwise use the joined options
    if (dropdownTextValues[columnIndex] !== undefined) {
      return dropdownTextValues[columnIndex]
    }
    return column.options && column.options.length > 0 ? column.options.join('\n') : ''
  }

  const handleRemoveColumn = (index: number) => {
    if (!editingTemplate || !editingTemplate.columns) return
    const newColumns = editingTemplate.columns.filter((_, i) => i !== index)
    // Reorder columns
    newColumns.forEach((col, i) => {
      col.order = i + 1
    })
    setEditingTemplate({ ...editingTemplate, columns: newColumns })
  }

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    if (!editingTemplate || !editingTemplate.columns) return
    const newColumns = [...editingTemplate.columns]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newColumns.length) return
    
    // Swap columns
    const temp = newColumns[index]
    newColumns[index] = newColumns[newIndex]
    newColumns[newIndex] = temp
    
    // Update order
    newColumns.forEach((col, i) => {
      col.order = i + 1
    })
    
    setEditingTemplate({ ...editingTemplate, columns: newColumns })
  }

  const handleSave = async () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.columns || editingTemplate.columns.length === 0) {
      setMessage({ type: 'error', text: 'Please fill in template name and add at least one column' })
      return
    }

    // Validate columns
    for (let idx = 0; idx < editingTemplate.columns.length; idx++) {
      const col = editingTemplate.columns[idx]
      if (!col.name) {
        setMessage({ type: 'error', text: 'All columns must have a name' })
        return
      }
      if (col.column_type === 'dropdown') {
        // Check options from textarea value or from column options
        let hasOptions = false
        if (dropdownTextValues[idx] !== undefined) {
          const options = dropdownTextValues[idx]
            .split('\n')
            .map((o) => o.trim())
            .filter((o) => o.length > 0)
          hasOptions = options.length > 0
        } else {
          hasOptions = col.options && col.options.length > 0
        }
        if (!hasOptions) {
          setMessage({ type: 'error', text: `Column "${col.name}" needs at least one option for dropdown type` })
          return
        }
      }
    }

    try {
      setSaving(true)
      setMessage(null)
      
      // Prepare columns data - ensure dropdown options are synced from textarea values
      const columnsToSave = editingTemplate.columns!.map((col, idx) => {
        const columnData: any = {
          order: col.order,
          name: col.name,
          column_type: col.column_type,
          placeholder: col.placeholder || null,
          is_required: col.is_required || false,
          default_value: col.default_value || null,
          notes: col.notes || null,
        }
        
        // For dropdown, sync options from textarea if available
        if (col.column_type === 'dropdown') {
          if (dropdownTextValues[idx] !== undefined) {
            // Use the textarea value and parse it
            const options = dropdownTextValues[idx]
              .split('\n')
              .map((o) => o.trim())
              .filter((o) => o.length > 0)
            columnData.options = options.length > 0 ? options : null
          } else if (col.options && col.options.length > 0) {
            columnData.options = col.options
          } else {
            columnData.options = null
          }
        } else {
          columnData.options = null
        }
        
        return columnData
      })
      
      const templateData = {
        name: editingTemplate.name!,
        description: editingTemplate.description || null,
        is_active: editingTemplate.is_active !== undefined ? editingTemplate.is_active : true,
        columns: columnsToSave,
      }
      
      if (selectedTemplate) {
        await updateRowTemplate(selectedTemplate.id, templateData)
        setMessage({ type: 'success', text: 'Template updated successfully!' })
      } else {
        await createRowTemplate(templateData)
        setMessage({ type: 'success', text: 'Template created successfully!' })
      }
      
      await loadTemplates()
      setShowCreateForm(false)
      setSelectedTemplate(null)
      setEditingTemplate(null)
      setDropdownTextValues({})
    } catch (error: any) {
      console.error('Error saving template:', error)
      let errorMessage = 'Error saving template'
      
      if (error.response) {
        // Backend returned an error
        const detail = error.response.data?.detail || error.response.data?.message
        if (detail) {
          if (detail.includes('already exists') || detail.includes('Template name already exists')) {
            errorMessage = `Template name "${editingTemplate.name}" already exists. Please choose a different name.`
          } else {
            errorMessage = detail
          }
        } else {
          errorMessage = error.response.statusText || 'Error saving template'
        }
      } else if (error.message) {
        // Network or other error
        if (error.message.includes('Network Error') || error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 3026.'
        } else {
          errorMessage = error.message
        }
      }
      
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      await deleteRowTemplate(templateId)
      setMessage({ type: 'success', text: 'Template deleted successfully!' })
      await loadTemplates()
      if (selectedTemplate?.id === templateId) {
        setShowCreateForm(false)
        setSelectedTemplate(null)
        setEditingTemplate(null)
      }
    } catch (error: any) {
      console.error('Error deleting template:', error)
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Error deleting template' })
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">📋 Row Generator</h1>
              <p className="text-gray-600">Create and manage Excel row templates for recruiters</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                ← Back to Dashboard
              </button>
            </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Templates</h2>
                <button
                  onClick={handleCreateNew}
                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                >
                  + New
                </button>
              </div>
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'bg-purple-100 border-purple-500'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold">{template.name}</div>
                        <div className="text-sm text-gray-600">
                          {template.columns.length} columns
                        </div>
                        {template.description && (
                          <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(template.id)
                        }}
                        className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          template.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
                {templates.length === 0 && (
                  <p className="text-center py-8 text-gray-500">No templates yet. Create one!</p>
                )}
              </div>
            </div>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-2">
            {showCreateForm && editingTemplate ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {selectedTemplate ? 'Edit Template' : 'Create New Template'}
                </h2>

                <div className="space-y-6">
                  {/* Template Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.name || ''}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Candidate Tracker Row"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingTemplate.description || ''}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, description: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={2}
                      placeholder="Template description..."
                    />
                  </div>

                  {/* Columns */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Columns ({editingTemplate.columns?.length || 0})
                      </label>
                      <button
                        onClick={handleAddColumn}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                      >
                        + Add Column
                      </button>
                    </div>

                    <div className="space-y-4">
                      {editingTemplate.columns?.map((column, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="font-semibold text-gray-700">
                              Column {index + 1}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMoveColumn(index, 'up')}
                                disabled={index === 0}
                                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs disabled:opacity-50"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => handleMoveColumn(index, 'down')}
                                disabled={index === (editingTemplate.columns?.length || 0) - 1}
                                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs disabled:opacity-50"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => handleRemoveColumn(index)}
                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Column Name *
                              </label>
                              <input
                                type="text"
                                value={column.name}
                                onChange={(e) =>
                                  handleUpdateColumn(index, { name: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                placeholder="e.g., First Name"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Type *
                              </label>
                              <select
                                value={column.column_type}
                                onChange={(e) => {
                                  const newType = e.target.value as any
                                  const updates: any = {
                                    column_type: newType,
                                  }
                                  // Reset options if changing from dropdown
                                  if (newType !== 'dropdown') {
                                    updates.options = null
                                  } else if (!column.options) {
                                    updates.options = []
                                  }
                                  // Don't set default date - it will be set when generating the row
                                  // Just clear default_value for date type
                                  if (newType === 'date') {
                                    updates.default_value = ''
                                  }
                                  handleUpdateColumn(index, updates)
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              >
                                <option value="text">Text</option>
                                <option value="dropdown">Dropdown</option>
                                <option value="note">Note</option>
                                <option value="date">Date</option>
                                <option value="number">Number</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Placeholder
                              </label>
                              <input
                                type="text"
                                value={column.placeholder || ''}
                                onChange={(e) =>
                                  handleUpdateColumn(index, { placeholder: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                placeholder="e.g., Enter first name"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Default Value
                              </label>
                              {column.column_type === 'date' ? (
                                <input
                                  type="date"
                                  value={column.default_value || new Date().toISOString().split('T')[0]}
                                  onChange={(e) =>
                                    handleUpdateColumn(index, { default_value: e.target.value })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={column.default_value || ''}
                                  onChange={(e) =>
                                    handleUpdateColumn(index, { default_value: e.target.value })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                  placeholder="Default value"
                                />
                              )}
                            </div>

                            {column.column_type === 'dropdown' && (
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Options (one per line) *
                                </label>
                                <textarea
                                  value={getDropdownTextValue(index, column)}
                                  onChange={(e) => {
                                    const inputValue = e.target.value
                                    // Store the raw value to allow multi-line editing
                                    setDropdownTextValues({ ...dropdownTextValues, [index]: inputValue })
                                    // Also update the options (filter empty lines for validation)
                                    const options = inputValue
                                      .split('\n')
                                      .map((o) => o.trim())
                                      .filter((o) => o.length > 0)
                                    handleUpdateColumn(index, { options })
                                  }}
                                  onBlur={(e) => {
                                    // When user leaves the field, finalize the options
                                    const inputValue = e.target.value
                                    const options = inputValue
                                      .split('\n')
                                      .map((o) => o.trim())
                                      .filter((o) => o.length > 0)
                                    handleUpdateColumn(index, { options })
                                    // Update stored value to match final options
                                    setDropdownTextValues({ ...dropdownTextValues, [index]: options.join('\n') })
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                                  rows={6}
                                  placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4"
                                  style={{ resize: 'vertical', whiteSpace: 'pre' }}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Enter one option per line. You can add as many as needed.
                                </p>
                                {column.options && column.options.length > 0 && (
                                  <p className="text-xs text-green-600 mt-1">
                                    {column.options.length} option(s) configured
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Notes/Instructions
                              </label>
                              <textarea
                                value={column.notes || ''}
                                onChange={(e) =>
                                  handleUpdateColumn(index, { notes: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                rows={2}
                                placeholder="Instructions for this column..."
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={column.is_required}
                                  onChange={(e) =>
                                    handleUpdateColumn(index, { is_required: e.target.checked })
                                  }
                                  className="rounded"
                                />
                                <span className="text-xs text-gray-700">Required field</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(!editingTemplate.columns || editingTemplate.columns.length === 0) && (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        No columns yet. Click "Add Column" to get started.
                      </div>
                    )}
                  </div>

                  {/* Active Toggle */}
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingTemplate.is_active ?? true}
                        onChange={(e) =>
                          setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Active (visible to recruiters)</span>
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : selectedTemplate ? 'Update Template' : 'Create Template'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false)
                        setSelectedTemplate(null)
                        setEditingTemplate(null)
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <p className="text-gray-500 mb-4">Select a template to edit or create a new one</p>
                <button
                  onClick={handleCreateNew}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold"
                >
                  + Create New Template
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminRowGenerator


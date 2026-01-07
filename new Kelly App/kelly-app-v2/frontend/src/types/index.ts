export interface InfoSessionRegistration {
  first_name: string
  last_name: string
  email: string
  phone: string
  zip_code: string
  session_type: 'new-hire' | 'reactivation'
  time_slot: string
}

export interface InfoSessionStep {
  step_name: string
  step_description: string
  is_completed: boolean
}

export interface ExclusionMatchInfo {
  name: string
  code?: string | null
  ssn?: string | null
}

export interface InfoSession {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  zip_code: string
  session_type: string
  time_slot: string
  is_in_exclusion_list: boolean
  exclusion_warning_shown: boolean
  exclusion_match?: ExclusionMatchInfo | null
  status: string
  ob365_sent?: boolean
  i9_sent?: boolean
  existing_i9?: boolean
  ineligible?: boolean
  rejected?: boolean
  drug_screen?: boolean
  questions?: boolean
  assigned_recruiter_id?: number | null
  assigned_recruiter_name?: string | null
  started_at?: string | null
  completed_at?: string | null
  duration_minutes?: number | null
  created_at: string
}

export interface InfoSessionWithSteps extends InfoSession {
  steps: InfoSessionStep[]
}

export interface Announcement {
  id: number
  title: string
  message: string
  is_active: boolean
  display_order: number
}

export interface Recruiter {
  id: number
  name: string
  email: string
  is_active: boolean
  status: 'available' | 'busy'
}

export interface AssignedSession {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  zip_code: string
  session_type: string
  time_slot: string
  status: string
  ob365_sent: boolean
  i9_sent: boolean
  existing_i9: boolean
  ineligible: boolean
  rejected: boolean
  drug_screen: boolean
  questions: boolean
  started_at: string | null
  completed_at: string | null
  duration_minutes: number | null
  created_at: string
  generated_row: string | null
}

export interface User {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
}


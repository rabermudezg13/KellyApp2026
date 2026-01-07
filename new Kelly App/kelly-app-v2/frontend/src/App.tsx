import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RegisterVisitPage from './pages/RegisterVisitPage'
import InfoSessionPage from './pages/InfoSessionPage'
import StaffLoginPage from './pages/StaffLoginPage'
import StaffDashboard from './pages/StaffDashboard'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminInfoSessionConfig from './pages/AdminInfoSessionConfig'
import AdminConfigurations from './pages/AdminConfigurations'
import AdminRowGenerator from './pages/AdminRowGenerator'
import RecruiterDashboard from './pages/RecruiterDashboard'
import './index.css'

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register-visit" element={<RegisterVisitPage />} />
        <Route path="/info-session" element={<InfoSessionPage />} />
        <Route path="/staff/login" element={<StaffLoginPage />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/info-session-config" element={<AdminInfoSessionConfig />} />
        <Route path="/admin/configurations" element={<AdminConfigurations />} />
        <Route path="/admin/row-generator" element={<AdminRowGenerator />} />
        <Route path="/recruiter/:recruiterId/dashboard" element={<RecruiterDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import InputPage from './pages/InputPage.jsx'
import AnalysisPage from './pages/AnalysisPage.jsx'
import QASessionPage from './pages/QASessionPage.jsx'
import ResultPage from './pages/ResultPage.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/input" element={<ProtectedRoute><InputPage /></ProtectedRoute>} />
      <Route path="/analysis" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
      <Route path="/qa/:submissionId" element={<ProtectedRoute><QASessionPage /></ProtectedRoute>} />
      <Route path="/result/:reportId" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
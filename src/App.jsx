import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import InputPage from './pages/InputPage.jsx'
import AnalysisPage from './pages/AnalysisPage.jsx'
import QASessionPage from './pages/QASessionPage.jsx'
import ResultPage from './pages/ResultPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/input" element={<InputPage />} />
      <Route path="/analysis" element={<AnalysisPage />} />
      <Route path="/qa/:submissionId" element={<QASessionPage />} />
      <Route path="/result/:reportId" element={<ResultPage />} />
    </Routes>
  )
}

export default App
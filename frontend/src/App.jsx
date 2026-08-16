import { lazy, Suspense, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const NotesGenerator    = lazy(() => import('./pages/NotesGenerator'));
const QuestionGenerator = lazy(() => import('./pages/QuestionGenerator'));
const ExamGenerator     = lazy(() => import('./pages/ExamGenerator'));
const DoubtAssistant    = lazy(() => import('./pages/DoubtAssistant'));
const History           = lazy(() => import('./pages/History'));
const Quiz              = lazy(() => import('./pages/Quiz'));
const StudyPlanner      = lazy(() => import('./pages/StudyPlanner'));

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
    </div>
  );
  
  return user ? children : <Navigate to="/login" replace />;
};

const protect = (Component) => (
  <ProtectedRoute><Component /></ProtectedRoute>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        }>
          <Routes>
            <Route path="/"              element={<Navigate to="/dashboard" replace />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/register"      element={<Register />} />
            <Route path="/dashboard"     element={protect(Dashboard)} />
            <Route path="/notes"         element={protect(NotesGenerator)} />
            <Route path="/questions"     element={protect(QuestionGenerator)} />
            <Route path="/quiz"          element={protect(Quiz)} />
            <Route path="/exam"          element={protect(ExamGenerator)} />
            <Route path="/doubt"         element={protect(DoubtAssistant)} />
            <Route path="/history"       element={protect(History)} />
            <Route path="/study-planner" element={protect(StudyPlanner)} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

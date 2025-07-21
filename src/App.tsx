import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Students from './pages/Students';
import Expiring from './pages/Expiring';
import Payments from './pages/Payments';
import Seats from './pages/Seats';
import Settings from './pages/Settings';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/students" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Students />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/expiring" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Expiring />
            </ProtectedRoute>
          } 
        />
        <Route path="/payments" element={<Payments />} />
        <Route 
          path="/seats" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Seats />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Layout>
  );
}
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
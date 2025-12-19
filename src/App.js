import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemAlertsProvider } from './context/SystemAlertsContext';
import SystemAlerts from './components/common/SystemAlerts';
import MainLayout from './components/MainLayout';
import MaintenancePage from './pages/MaintenancePage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StoryDetail from './pages/StoryDetail';
import Dashboard from './pages/Dashboard';
import CreateStory from './pages/CreateStory';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import BookReader from './pages/BookReader';
import useUpdateDetector from './hooks/useUpdateDetector';
import useMaintenanceCheck from './hooks/useMaintenanceCheck';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Component that handles update detection
const AppContent = () => {
  // Initialize maintenance check and update detector
  const { isMaintenanceActive, loading } = useMaintenanceCheck();
  useUpdateDetector();

  // Show loading while checking maintenance status
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show maintenance page if active
  if (isMaintenanceActive) {
    return <MaintenancePage />;
  }

  return (
    <Routes>
      {/* Public routes without layout wrapper */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Public routes with Navbar and full Footer */}
      <Route path="/" element={<MainLayout isAdminRoute={false}><Home /></MainLayout>} />
      <Route path="/stories/:id" element={<MainLayout isAdminRoute={false}><StoryDetail /></MainLayout>} />
      
      {/* Admin protected routes with Sidebar and simple footer */}
      <Route
        path="/story/:id"
        element={
          <ProtectedRoute>
            <MainLayout isAdminRoute={true}><StoryDetail /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout isAdminRoute={true}><Dashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <MainLayout isAdminRoute={true}><CreateStory /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <MainLayout isAdminRoute={true}><Explore /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/read/:id"
        element={
          <ProtectedRoute>
            <BookReader />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout isAdminRoute={true}><Profile /></MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SystemAlertsProvider>
          <AppContent />
          <SystemAlerts />
        </SystemAlertsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

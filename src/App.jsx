import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/user/Dashboard';
import Devices from './pages/user/Devices';
import Profile from './pages/shared/Profile';
import UserTickets from './pages/user/UserTickets';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTickets from './pages/admin/AdminTickets';

import BottomNav from './components/BottomNav';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const UserRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
};

const AppContent = () => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <div className="app-container">
      <div className="page-content">
        <Routes>
          <Route path="/login" element={currentUser ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Login />} />
          <Route path="/register" element={currentUser ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <Register />} />
          <Route path="/forgot-password" element={currentUser ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <ForgotPassword />} />
          
          {/* USER ROUTES */}
          <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
          <Route path="/devices" element={<UserRoute><Devices /></UserRoute>} />
          <Route path="/tickets" element={<UserRoute><UserTickets /></UserRoute>} />
          
          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/tickets" element={<AdminRoute><AdminTickets /></AdminRoute>} />

          {/* SHARED ROUTE */}
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to={currentUser ? (isAdmin ? "/admin" : "/dashboard") : "/login"} replace />} />
        </Routes>
      </div>
      
      {/* Tampilkan navigasi bawah hanya jika user sudah login */}
      {currentUser && <BottomNav />}
    </div>
  );
};

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

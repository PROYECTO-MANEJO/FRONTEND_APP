import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// User components
import Dashboard from './components/user/Dashboard';
import CursosPage from './components/user/CursosPage';
import EventosPage from './components/user/EventosPage';
import UserProfile from './components/user/UserProfile';

// Admin components
import AdminPanel from './components/admin/AdminPanel';
import AdminSolicitudes from './components/admin/AdminSolicitudes';

// Solicitudes components
import SolicitudesUsuario from './components/solicitudes/SolicitudesUsuario';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Protected user routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/solicitudes" 
              element={
                <ProtectedRoute>
                  <SolicitudesUsuario />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/perfil" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/solicitudes" 
              element={
                <AdminRoute>
                  <AdminSolicitudes />
                </AdminRoute>
              } 
            />
            
            {/* User pages */}
            <Route 
              path="/cursos" 
              element={
                <ProtectedRoute>
                  <CursosPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/eventos" 
              element={
                <ProtectedRoute>
                  <EventosPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

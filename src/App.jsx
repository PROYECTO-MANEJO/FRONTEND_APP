import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { UserSidebarProvider } from './context/UserSidebarContext';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import MasterRoute from './components/auth/MasterRoute';

// User components
import Dashboard from './components/user/Dashboard';
import CursosPage from './components/user/CursosPage';
import EventosPage from './components/user/EventosPage';
import UserProfile from './components/user/UserProfile';
import MisInscripciones from './components/user/MisInscripciones';
import MisCertificadosWrapper from './components/user/MisCertificadosWrapper';

// Admin components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminSolicitudes from './components/admin/AdminSolicitudes';
import AdminUsuarios from './components/admin/AdminUsuarios';
import AdminEventos from './components/admin/AdminEventos';
import CrearEventos from './components/admin/CrearEventos';
import AdminCursos from './components/admin/AdminCursos';
import AdminReportes from './components/admin/AdminReportes';


import HistorialReportesFinancieros from './components/admin/HistorialReportesFinancieros';

import AdminVerificacionDocumentos from './components/admin/AdminVerificacionDocumentos';
import AdminGestionInscripciones from './components/admin/AdminGestionInscripciones';


// Solicitudes components
import SolicitudesUsuario from './components/solicitudes/SolicitudesUsuario';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SidebarProvider>
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
                  <UserSidebarProvider>
                    <Dashboard />
                  </UserSidebarProvider>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/solicitudes" 
              element={
                <ProtectedRoute>
                  <UserSidebarProvider>
                    <SolicitudesUsuario />
                  </UserSidebarProvider>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/perfil" 
              element={
                <ProtectedRoute>
                  <UserSidebarProvider>
                    <UserProfile />
                  </UserSidebarProvider>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/usuarios" 
              element={
                <AdminRoute>
                  <AdminUsuarios />
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/verificacion-documentos" 
              element={
                <MasterRoute>
                  <AdminVerificacionDocumentos />
                </MasterRoute>
              } 
            />
            
            <Route 
              path="/admin/eventos" 
              element={
                <AdminRoute>
                  <AdminEventos />
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/crear-eventos" 
              element={
                <AdminRoute>
                  <CrearEventos />
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/editar-evento/:id" 
              element={
                <AdminRoute>
                  <CrearEventos />
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/cursos" 
              element={
                <AdminRoute>
                  <AdminCursos />
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/gestion-inscripciones" 
              element={
                <AdminRoute>
                  <AdminGestionInscripciones />
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
            
            <Route 
              path="/admin/reportes" 
              element={
                <AdminRoute>
                  <AdminReportes />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/reportes/historial" 
              element={
                <AdminRoute>
                  <HistorialReportesFinancieros />
                </AdminRoute>
              } 
            />
            

            
            <Route 
              path="/admin/historial-reportes-financieros" 
              element={
                <AdminRoute>
                  <HistorialReportesFinancieros />
                </AdminRoute>
              } 
            />
            
            {/* User pages */}
            <Route 
              path="/cursos" 
              element={
                <ProtectedRoute>
                  <UserSidebarProvider>
                    <CursosPage />
                  </UserSidebarProvider>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/eventos" 
              element={
                <ProtectedRoute>
                  <UserSidebarProvider>
                    <EventosPage />
                  </UserSidebarProvider>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/mis-inscripciones" 
              element={
                <ProtectedRoute>
                  <UserSidebarProvider>
                    <MisInscripciones />
                  </UserSidebarProvider>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/certificados" 
              element={
                <ProtectedRoute>
                  <UserSidebarProvider>
                    <MisCertificadosWrapper />
                  </UserSidebarProvider>
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

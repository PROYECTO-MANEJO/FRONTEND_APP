import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import DeveloperRoute from './components/auth/DeveloperRoute';

// User components
import Dashboard from './components/user/Dashboard';
import UserLayout from './components/user/UserLayout';
import CursosPage from './components/user/CursosPage';
import EventosPage from './components/user/EventosPage';
import UserProfile from './components/user/UserProfile';
import MisInscripciones from './components/user/MisInscripciones';
import MisCertificadosWrapper from './components/user/MisCertificadosWrapper';

// Admin components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLayout from './components/admin/AdminLayout';
import AdminSolicitudes from './components/admin/AdminSolicitudes';
import DetalleSolicitudAdmin from './components/admin/DetalleSolicitudAdmin';
import AdminUsuarios from './components/admin/AdminUsuarios';
import AdminEventos from './components/admin/AdminEventos';
import CrearEventos from './components/admin/CrearEventos';
import AdminCursos from './components/admin/AdminCursos';
import AdminReportes from './components/admin/AdminReportes';
import RevisionPlanes from './components/admin/RevisionPlanes';


import HistorialReportesFinancieros from './components/admin/HistorialReportesFinancieros';

import AdminVerificacionDocumentos from './components/admin/AdminVerificacionDocumentos';
import AdminGestionInscripciones from './components/admin/AdminGestionInscripciones';
import HistorialReportesGenerales from './components/admin/HistorialReportesGenerales';
import GestionNotasCurso from './components/admin/GestionNotasCurso';
import GestionAsistenciaEvento from './components/admin/GestionAsistenciaEvento';


// Solicitudes components
import SolicitudesUsuario from './components/solicitudes/SolicitudesUsuario';
import CrearSolicitud from './components/solicitudes/CrearSolicitud';

// Developer components
import DeveloperLayout from './components/developer/DeveloperLayout';
import SolicitudesDesarrollador from './components/developer/SolicitudesDesarrollador';
import DetalleSolicitudDesarrollador from './components/developer/DetalleSolicitudDesarrollador';

// HomePage component
import HomePage from './components/HomePage';
import AuthenticatedHomePage from './components/AuthenticatedHomePage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SidebarProvider>
          <Router>
          <Routes>
            {/* Home page - accessible to everyone */}
            <Route path="/" element={<HomePage />} />
            
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
                    <UserLayout>
                      <AuthenticatedHomePage />
                    </UserLayout>
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
              path="/solicitudes/crear" 
              element={
                <ProtectedRoute>
                  <UserSidebarProvider>
                    <CrearSolicitud />
                  </UserSidebarProvider>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/solicitudes/editar/:id" 
              element={
                <ProtectedRoute>
                  <UserSidebarProvider>
                    <CrearSolicitud />
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
                  <AdminLayout>
                    <AuthenticatedHomePage />
                  </AdminLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/usuarios" 
              element={
                <MasterRoute>
                  <SidebarProvider>
                    <AdminUsuarios />
                  </SidebarProvider>
                </MasterRoute>
              } 
            />
            
            <Route 
              path="/admin/verificacion-documentos" 
              element={
                <MasterRoute>
                  <SidebarProvider>
                    <AdminVerificacionDocumentos />
                  </SidebarProvider>
                </MasterRoute>
              } 
            />
            
            <Route 
              path="/admin/eventos" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <AdminEventos />
                  </SidebarProvider>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/crear-eventos" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <CrearEventos />
                  </SidebarProvider>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/editar-evento/:id" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <CrearEventos />
                  </SidebarProvider>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/cursos" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <AdminCursos />
                  </SidebarProvider>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/gestion-inscripciones" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <AdminGestionInscripciones />
                  </SidebarProvider>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/solicitudes" 
              element={
                <MasterRoute>
                  <SidebarProvider>
                    <AdminSolicitudes />
                  </SidebarProvider>
                </MasterRoute>
              } 
            />
            
            <Route 
              path="/admin/solicitud/:id" 
              element={
                <MasterRoute>
                  <SidebarProvider>
                    <DetalleSolicitudAdmin />
                  </SidebarProvider>
                </MasterRoute>
              } 
            />
            
            <Route 
              path="/admin/revision-planes" 
              element={
                <MasterRoute>
                  <SidebarProvider>
                    <RevisionPlanes />
                  </SidebarProvider>
                </MasterRoute>
              } 
            />

            {/* Developer routes */}
            <Route 
              path="/developer" 
              element={
                <DeveloperRoute>
                  <DeveloperLayout />
                </DeveloperRoute>
              }
            >
              <Route index element={<Navigate to="/developer/solicitudes" replace />} />
              <Route path="solicitudes" element={<SolicitudesDesarrollador />} />
              <Route path="solicitud/:id" element={<DetalleSolicitudDesarrollador />} />
            </Route>
            
            <Route 
              path="/admin/reportes" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <AdminReportes />
                  </SidebarProvider>
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/reportes/historial" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <HistorialReportesFinancieros />
                  </SidebarProvider>
                </AdminRoute>
              } 
            />
            

            
            <Route 
              path="/admin/historial-reportes-financieros" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <HistorialReportesFinancieros />
                  </SidebarProvider>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/reportes/historial-usuarios" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <HistorialReportesGenerales />
                  </SidebarProvider>
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/reportes/historial-eventos" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <HistorialReportesGenerales />
                  </SidebarProvider>
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/reportes/historial-cursos" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <HistorialReportesGenerales />
                  </SidebarProvider>
                </AdminRoute>
              } 
            />
            
            {/* Gestión de Notas y Asistencia */}
            <Route 
              path="/admin/gestion-notas-curso/:id" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <GestionNotasCurso />
                  </SidebarProvider>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/gestion-asistencia-evento/:id" 
              element={
                <AdminRoute>
                  <SidebarProvider>
                    <GestionAsistenciaEvento />
                  </SidebarProvider>
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
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        </SidebarProvider>
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </ThemeProvider>
  );
}

export default App;

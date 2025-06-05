import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import SolicitudesUsuario from './components/SolicitudesUsuario';
import AdminSolicitudes from './components/AdminSolicitudes';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import theme from './theme/theme';
import CursosPage from './components/CursosPage';
import EventosPage from './components/EventosPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Ruta raíz - redirige al dashboard si está autenticado, sino al login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Rutas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de solicitudes para usuarios */}
            <Route 
              path="/solicitudes" 
              element={
                <ProtectedRoute>
                  <SolicitudesUsuario />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de administrador */}
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
            
            {/* Otras rutas */}
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
            
            {/* Ruta 404 - redirige al dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

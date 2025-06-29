# 🎓 Sistema de Gestión de Eventos Académicos - Frontend

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.1.0-blue.svg)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Frontend de la aplicación web para la gestión de eventos académicos de la Universidad Técnica de Ambato (UTA)**

## 📋 Tabla de Contenidos

- [🎯 Descripción](#-descripción)
- [✨ Características](#-características)
- [🛠️ Tecnologías](#️-tecnologías)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Instalación](#-instalación)
- [💻 Uso](#-uso)
- [🧪 Testing](#-testing)
- [📱 Responsive Design](#-responsive-design)
- [🎨 Sistema de Diseño](#-sistema-de-diseño)
- [🔒 Autenticación](#-autenticación)
- [🌐 API Integration](#-api-integration)
- [📚 Documentación](#-documentación)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)
- [👥 Equipo](#-equipo)

## 🎯 Descripción

El **Sistema de Gestión de Eventos Académicos** es una aplicación web moderna desarrollada para la Universidad Técnica de Ambato que permite la gestión integral de eventos académicos, solicitudes de estudiantes y administración de documentos.

### Características Principales

- **Gestión de Usuarios**: Sistema completo de autenticación y autorización
- **Panel de Administración**: Interfaz intuitiva para administradores
- **Gestión de Solicitudes**: Creación, seguimiento y aprobación de solicitudes
- **Carga de Documentos**: Sistema seguro de subida y validación de archivos
- **Dashboard Interactivo**: Métricas y estadísticas en tiempo real
- **Notificaciones**: Sistema de alertas y notificaciones en tiempo real

## ✨ Características

### 🔐 Autenticación y Autorización
- Login/Logout seguro
- Registro de usuarios con validación de cédula ecuatoriana
- Recuperación de contraseñas
- Gestión de roles (Admin, Usuario)
- Protección de rutas por roles

### 📊 Dashboard y Analytics
- Métricas en tiempo real
- Gráficos interactivos
- Estadísticas de solicitudes
- Panel de control administrativo

### 📝 Gestión de Solicitudes
- Creación de solicitudes con formularios dinámicos
- Seguimiento de estado en tiempo real
- Sistema de aprobación/rechazo
- Historial completo de solicitudes

### 📁 Gestión de Documentos
- Carga segura de archivos (PDF, DOC, DOCX, JPG, PNG)
- Validación de tipos y tamaños
- Preview de documentos
- Sistema de verificación obligatoria

### 🎨 Interfaz de Usuario
- Diseño responsive y moderno
- Material Design 3
- Tema personalizado de la UTA
- Animaciones fluidas
- Dark/Light mode

## 🛠️ Tecnologías

### Core Technologies
- **React 19.1.0** - Biblioteca de JavaScript para interfaces de usuario
- **Vite 6.3.5** - Build tool y servidor de desarrollo
- **React Router DOM 7.6.1** - Enrutamiento para aplicaciones React

### UI/UX
- **Material-UI 7.1.0** - Componentes de React con Material Design
- **@mui/icons-material** - Iconos de Material Design
- **@mui/lab** - Componentes experimentales de MUI
- **@emotion/react & @emotion/styled** - CSS-in-JS para estilos

### Gestión de Estado y Formularios
- **React Context API** - Gestión de estado global
- **Formik 2.4.6** - Biblioteca para manejo de formularios
- **Yup 1.6.1** - Validación de esquemas para formularios

### Comunicación HTTP
- **Axios 1.9.0** - Cliente HTTP para realizar peticiones a la API

### Desarrollo y Calidad
- **ESLint** - Linter para JavaScript/React
- **Vite** - Herramientas de desarrollo y build

## 📁 Estructura del Proyecto

```
frontend-app/
├── public/                     # Archivos estáticos
│   ├── favicon.ico
│   └── index.html
├── src/                        # Código fuente
│   ├── assets/                 # Recursos estáticos
│   │   ├── images/            # Imágenes del proyecto
│   │   └── icons/             # Iconos personalizados
│   ├── components/            # Componentes React
│   │   ├── auth/              # Componentes de autenticación
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── admin/             # Componentes de administración
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   └── Settings.jsx
│   │   ├── solicitudes/       # Gestión de solicitudes
│   │   │   ├── SolicitudForm.jsx
│   │   │   ├── SolicitudList.jsx
│   │   │   └── SolicitudDetail.jsx
│   │   ├── user/              # Componentes de usuario
│   │   │   ├── Profile.jsx
│   │   │   └── UserDashboard.jsx
│   │   ├── shared/            # Componentes reutilizables
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── DocumentUpload.jsx  # Componente de carga de documentos
│   ├── context/               # Context API
│   │   ├── AuthContext.jsx    # Contexto de autenticación
│   │   └── ThemeContext.jsx   # Contexto de tema
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   └── useLocalStorage.js
│   ├── services/              # Servicios API
│   │   ├── authService.js     # Servicios de autenticación
│   │   ├── apiService.js      # Servicios generales de API
│   │   └── uploadService.js   # Servicios de carga de archivos
│   ├── theme/                 # Configuración de tema
│   │   ├── theme.js           # Tema personalizado MUI
│   │   └── colors.js          # Paleta de colores UTA
│   ├── App.jsx                # Componente principal
│   ├── App.css                # Estilos globales
│   └── main.jsx               # Punto de entrada
├── .gitignore                 # Archivos ignorados por Git
├── eslint.config.js           # Configuración ESLint
├── package.json               # Dependencias y scripts
├── vite.config.js            # Configuración Vite
└── README.md                 # Este archivo
```

## 🚀 Instalación

### Prerequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0
- **Git**

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/frontend-uta-eventos.git
   cd frontend-uta-eventos
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o usando yarn
   yarn install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus configuraciones:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_APP_TITLE=Sistema de Gestión UTA
   VITE_UPLOAD_MAX_SIZE=10485760
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

## 💻 Uso

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run preview      # Preview de build de producción
npm run lint         # Ejecuta ESLint
```

### Usuarios de Prueba

#### Administrador
- **Email**: admin@uta.edu.ec
- **Password**: admin123

#### Usuario Estudiante
- **Email**: estudiante@uta.edu.ec
- **Password**: estudiante123

### Funcionalidades Principales

#### 👤 Para Estudiantes
1. **Registro y Login**
   - Crear cuenta con correo institucional (@uta.edu.ec)
   - Validación de cédula ecuatoriana
   - Recuperación de contraseña

2. **Gestión de Solicitudes**
   - Crear nuevas solicitudes
   - Subir documentos requeridos
   - Seguimiento de estado
   - Historial de solicitudes

3. **Dashboard Personal**
   - Ver resumen de solicitudes
   - Notificaciones importantes
   - Perfil personal

#### 🛠️ Para Administradores
1. **Panel de Control**
   - Métricas del sistema
   - Estadísticas de solicitudes
   - Gestión de usuarios

2. **Gestión de Solicitudes**
   - Revisar solicitudes pendientes
   - Aprobar/Rechazar solicitudes
   - Verificar documentos
   - Generar reportes

3. **Administración**
   - Gestión de usuarios
   - Configuración del sistema
   - Logs de actividad

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Estructura de Tests
```
src/
├── __tests__/              # Tests globales
├── components/
│   └── __tests__/          # Tests de componentes
└── services/
    └── __tests__/          # Tests de servicios
```

## 📱 Responsive Design

La aplicación está completamente optimizada para:

- 📱 **Móviles** (320px - 768px)
- 📱 **Tablets** (768px - 1024px)
- 💻 **Desktop** (1024px+)
- 🖥️ **Large Desktop** (1440px+)

### Breakpoints Material-UI
```javascript
xs: 0px      // Extra small devices
sm: 600px    // Small devices
md: 900px    // Medium devices
lg: 1200px   // Large devices
xl: 1536px   // Extra large devices
```

## 🎨 Sistema de Diseño

### Paleta de Colores UTA
```javascript
const utaColors = {
  primary: {
    main: '#dc3545',      // Rojo UTA
    light: '#ff6b6b',
    dark: '#c82333'
  },
  secondary: {
    main: '#2c3e50',      // Azul oscuro
    light: '#34495e',
    dark: '#1a252f'
  },
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#17a2b8'
}
```

### Tipografía
- **Familia**: 'Roboto', 'Arial', sans-serif
- **Tamaños**: Material Design Scale
- **Pesos**: 300, 400, 500, 700

### Componentes Personalizados
- Formularios con validación
- Botones con estados de carga
- Cards con sombras personalizadas
- Navegación responsive

## 🔒 Autenticación

### Flujo de Autenticación
1. **Login** → Credenciales → JWT Token
2. **Token Storage** → LocalStorage seguro
3. **Route Protection** → Verificación automática
4. **Token Refresh** → Renovación automática
5. **Logout** → Limpieza de sesión

### Seguridad
- JWT con expiración
- Rutas protegidas por roles
- Validación en frontend y backend
- Logout automático por inactividad

## 🌐 API Integration

### Base URL
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
```

### Endpoints Principales
```javascript
// Autenticación
POST /auth/login
POST /auth/register
POST /auth/forgot-password
POST /auth/reset-password

// Usuarios
GET /users/profile
PUT /users/profile
GET /users/dashboard

// Solicitudes
GET /solicitudes
POST /solicitudes
PUT /solicitudes/:id
DELETE /solicitudes/:id

// Documentos
POST /upload
GET /documents/:id
DELETE /documents/:id
```

### Interceptors Axios
- Inyección automática de tokens
- Manejo de errores globales
- Refresh token automático
- Loading states

## 📚 Documentación

### Recursos Adicionales
- [📖 Guía de Contribución](CONTRIBUTING.md)
- [🎨 Guía de Estilos](docs/STYLE_GUIDE.md)
- [🔧 API Documentation](docs/API.md)
- [🚀 Deployment Guide](docs/DEPLOYMENT.md)

### Documentación de Componentes
Cada componente incluye:
- PropTypes o TypeScript interfaces
- Ejemplos de uso
- Stories de Storybook (próximamente)

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor lee nuestra [Guía de Contribución](CONTRIBUTING.md) para más detalles.

### Quick Start para Contribuidores
1. Fork el proyecto
2. Crea tu rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

### Desarrolladores
- **[Tu Nombre]** - *Desarrollador Principal* - [@tu-github](https://github.com/tu-usuario)

### Universidad Técnica de Ambato
- **Departamento de Informática** - *Cliente y Stakeholder*
- **Secretaría Académica** - *Usuario Principal*

---

## 🆘 Soporte

Si tienes alguna pregunta o problema:

1. **Issues**: [GitHub Issues](https://github.com/tu-usuario/frontend-uta-eventos/issues)
2. **Email**: soporte@uta.edu.ec
3. **Documentación**: [Wiki del Proyecto](https://github.com/tu-usuario/frontend-uta-eventos/wiki)

---

<div align="center">
  <p>Desarrollado con ❤️ para la Universidad Técnica de Ambato</p>
  <p>
    <a href="https://uta.edu.ec">Universidad Técnica de Ambato</a> •
    <a href="https://github.com/tu-usuario/frontend-uta-eventos">GitHub</a> •
    <a href="CONTRIBUTING.md">Contribuir</a>
  </p>
</div>

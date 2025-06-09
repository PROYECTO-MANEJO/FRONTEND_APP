# Frontend - Gestión de Inscripciones para Administradores

Este documento describe la nueva funcionalidad de frontend para la gestión de inscripciones de cursos y eventos por parte de los administradores.

## 🎯 Funcionalidades Implementadas

### 1. **Componente Principal: AdminGestionInscripciones**
- **Ruta**: `/admin/gestion-inscripciones`
- **Archivo**: `src/components/admin/AdminGestionInscripciones.jsx`

#### Características:
- **Vista General**: Lista todos los cursos y eventos activos/administrables
- **Estadísticas en Tiempo Real**: Muestra contadores de inscripciones por estado
- **Filtros Avanzados**: Por tipo (eventos/cursos) y búsqueda por texto
- **Tarjetas Informativas**: Cada item muestra información clave y estadísticas
- **Navegación Intuitiva**: Acceso directo a detalles específicos

#### Estadísticas Mostradas:
- Total de items administrables
- Número de eventos y cursos
- Inscripciones pendientes (requieren atención)
- Inscripciones aprobadas

### 2. **Componente de Detalle: DetalleEventoCurso**
- **Archivo**: `src/components/admin/DetalleEventoCurso.jsx`

#### Características:
- **Información Completa**: Detalles del evento/curso con organizador, fechas, ubicación
- **Lista de Inscripciones**: Tabla con todos los usuarios inscritos
- **Gestión de Pagos**: Aprobar/rechazar inscripciones de eventos/cursos pagados
- **Descarga de Comprobantes**: Acceso directo a archivos PDF de comprobantes
- **Filtros por Estado**: Pendientes, aprobadas, rechazadas
- **Búsqueda de Usuarios**: Por nombre, cédula, email o carrera

#### Acciones Disponibles:
- ✅ **Aprobar inscripción** (solo eventos/cursos pagados pendientes)
- ❌ **Rechazar inscripción** (con motivo opcional)
- 📄 **Descargar comprobante de pago**
- 👁️ **Ver información detallada del usuario**

### 3. **Integración con Sidebar**
- Nuevo elemento en el menú: "Gestión de Inscripciones"
- Icono: `ManageAccounts`
- Acceso directo desde el panel de administración

## 🔧 Configuración Técnica

### Rutas Agregadas:
```javascript
// En App.jsx
<Route 
  path="/admin/gestion-inscripciones" 
  element={
    <AdminRoute>
      <AdminGestionInscripciones />
    </AdminRoute>
  } 
/>
```

### APIs Utilizadas:
- `GET /api/administracion/cursos-eventos` - Lista de items administrables
- `GET /api/administracion/evento/:id` - Detalles de evento específico
- `GET /api/administracion/curso/:id` - Detalles de curso específico
- `PUT /api/administracion/evento/inscripcion/:id/aprobar` - Aprobar inscripción de evento
- `PUT /api/administracion/evento/inscripcion/:id/rechazar` - Rechazar inscripción de evento
- `PUT /api/administracion/curso/inscripcion/:id/aprobar` - Aprobar inscripción de curso
- `PUT /api/administracion/curso/inscripcion/:id/rechazar` - Rechazar inscripción de curso
- `GET /api/administracion/comprobante/:tipo/:id` - Descargar comprobante PDF

### Dependencias de Material-UI:
- Componentes de tabla para listado de inscripciones
- Chips para estados y categorías
- Badges para notificaciones de pendientes
- Dialogs para confirmaciones
- Snackbars para notificaciones
- Menús contextuales para acciones

## 🎨 Diseño y UX

### Paleta de Colores:
- **Azul (#1976d2)**: Total de items
- **Verde (#388e3c)**: Eventos y aprobaciones
- **Naranja (#f57c00)**: Cursos y pendientes
- **Rojo (#d32f2f)**: Pendientes urgentes y rechazos
- **Morado (#7b1fa2)**: Aprobadas

### Características de UX:
- **Responsive Design**: Adaptable a diferentes tamaños de pantalla
- **Loading States**: Indicadores de carga durante operaciones
- **Confirmaciones**: Dialogs para acciones críticas
- **Feedback Visual**: Snackbars para resultados de operaciones
- **Navegación Intuitiva**: Breadcrumbs y botones de regreso
- **Hover Effects**: Animaciones sutiles en tarjetas

## 🔐 Seguridad y Permisos

### Validaciones:
- **Autenticación JWT**: Requerida para todas las operaciones
- **Rol de Administrador**: Solo usuarios con rol ADMINISTRADOR o MASTER
- **Validación de Estados**: Solo se pueden aprobar/rechazar inscripciones pendientes
- **Verificación de Capacidad**: Control automático de cupos disponibles

### Manejo de Errores:
- Mensajes descriptivos para errores de API
- Validación de permisos en frontend y backend
- Manejo de tokens expirados con redirección automática

## 📱 Flujo de Usuario

### 1. Acceso a Gestión de Inscripciones:
1. Login como administrador
2. Navegar a "Gestión de Inscripciones" en el sidebar
3. Ver dashboard con estadísticas generales

### 2. Gestión de Inscripciones:
1. Seleccionar evento/curso de interés
2. Hacer clic en "Ver Detalles"
3. Revisar lista de inscripciones
4. Filtrar por estado (especialmente "Pendientes")
5. Para inscripciones pendientes de eventos/cursos pagados:
   - Descargar y revisar comprobante de pago
   - Aprobar o rechazar según corresponda
   - Agregar motivo en caso de rechazo

### 3. Monitoreo Continuo:
- Las estadísticas se actualizan automáticamente
- Badge de notificación muestra inscripciones pendientes
- Filtros permiten enfocarse en tareas específicas

## 🚀 Funcionalidades Futuras Sugeridas

1. **Notificaciones Push**: Alertas en tiempo real para nuevas inscripciones
2. **Exportación de Datos**: Generar reportes en Excel/PDF
3. **Comunicación Directa**: Enviar emails a usuarios desde la interfaz
4. **Historial de Acciones**: Log de todas las aprobaciones/rechazos
5. **Filtros Avanzados**: Por fecha, organizador, carrera, etc.
6. **Vista de Calendario**: Visualización temporal de eventos/cursos

## 🐛 Resolución de Problemas

### Problemas Comunes:

1. **Error 401 - No autorizado**:
   - Verificar que el usuario tenga rol de administrador
   - Comprobar que el token JWT sea válido

2. **Error 404 - No encontrado**:
   - Verificar que el backend esté ejecutándose
   - Comprobar la URL de la API en `src/services/api.js`

3. **No se cargan los datos**:
   - Verificar conexión a internet
   - Comprobar logs de consola para errores de CORS

4. **No se pueden descargar comprobantes**:
   - Verificar que el navegador permita descargas
   - Comprobar que el archivo PDF exista en el backend

### Logs de Debug:
- Abrir DevTools (F12)
- Revisar pestaña "Console" para errores de JavaScript
- Revisar pestaña "Network" para errores de API

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades, contactar al equipo de desarrollo con:
- Descripción detallada del problema
- Pasos para reproducir el error
- Screenshots si es aplicable
- Información del navegador y sistema operativo 
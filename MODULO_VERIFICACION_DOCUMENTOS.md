# Módulo de Verificación de Documentos - Administrador Master

## Descripción General

Este módulo permite al administrador MASTER revisar y verificar los documentos subidos por estudiantes y usuarios normales del sistema. Es un proceso simple de aprobación/rechazo de documentos de identidad.

## Características Principales

### 🎯 **Funcionalidad Simple y Directa**
- **División por tipo de usuario**: Estudiantes vs Usuarios normales
- **Descarga de documentos**: PDF de cédula y matrícula
- **Decisión binaria**: Aprobar ✅ o Rechazar ❌
- **Actualización automática**: Al aprobar/rechazar se actualiza la lista

### 🔒 **Seguridad y Permisos**
- **Acceso exclusivo**: Solo usuarios con rol `MASTER`
- **Rutas protegidas**: Uso de `MasterRoute` component
- **Validación backend**: Middleware `validateRoles('MASTER')`

## Estructura del Sistema

### Backend (API Endpoints)

#### 1. Obtener Documentos Pendientes
```
GET /api/users/pending-documents
Rol requerido: MASTER
```
Retorna usuarios con documentos subidos pero no verificados, separados en:
- `estudiantes[]`: Usuarios con rol ESTUDIANTE
- `usuarios[]`: Usuarios con rol USUARIO

#### 2. Descargar Documento
```
GET /api/users/download-document/:userId/:documentType
Parámetros: 
- userId: ID del usuario
- documentType: 'cedula' | 'matricula'
Rol requerido: MASTER
```
Descarga el PDF del documento especificado.

#### 3. Aprobar Documentos
```
PUT /api/users/approve-documents/:userId
Rol requerido: MASTER
```
Marca los documentos como verificados y establece fecha de verificación.

#### 4. Rechazar Documentos
```
PUT /api/users/reject-documents/:userId
Rol requerido: MASTER
```
Elimina los documentos de la BD y marca como no verificados (usuario debe subir nuevos archivos).

### Frontend (Componentes)

#### Componente Principal: `AdminVerificacionDocumentos.jsx`
- **Ubicación**: `/admin/verificacion-documentos`
- **Características**:
  - Tabs para Estudiantes vs Usuarios
  - Tabla con información de usuarios
  - Botones de descarga por documento
  - Botones de aprobar/rechazar
  - Diálogos de confirmación
  - Alertas de éxito/error

#### Servicios: `documentService.js`
Funciones agregadas:
- `getPendingDocuments()`
- `downloadUserDocument(userId, documentType)`
- `approveUserDocuments(userId)`
- `rejectUserDocuments(userId)`

#### Rutas y Navegación
- **Ruta protegida**: `MasterRoute` solo para usuarios MASTER
- **Menú lateral**: Opción "Verificar Documentos" solo visible para MASTER
- **Icono**: `VerifiedUser` de Material-UI

## Flujo de Trabajo

### 1. **Carga de Datos**
```
Usuario MASTER accede → Componente carga datos → API retorna usuarios pendientes
```

### 2. **Revisión de Documentos**
```
Admin selecciona tab → Ve lista de usuarios → Descarga PDF para revisar
```

### 3. **Decisión**
```
Admin decide → Clic en Aprobar/Rechazar → Confirmación → Acción ejecutada → Lista actualizada
```

### 4. **Resultados**

#### ✅ **Aprobación**:
- `documentos_verificados = true`
- `fec_verificacion_docs = fecha actual`
- Documentos permanecen en BD
- Usuario no necesita hacer nada más

#### ❌ **Rechazo**:
- `documentos_verificados = false`
- `fec_verificacion_docs = null`
- **Documentos eliminados** de BD
- Usuario debe subir nuevos archivos

## Diferencias por Tipo de Usuario

### 📚 **Estudiantes**
- **Documentos requeridos**: Cédula + Matrícula
- **Columna extra**: Carrera asignada
- **Verificación completa**: Ambos documentos deben estar subidos

### 👤 **Usuarios Normales**
- **Documentos requeridos**: Solo Cédula
- **Sin carrera**: No aplica
- **Verificación simple**: Solo cédula requerida

## Estados de la Base de Datos

### Campos en tabla `USUARIOS`:
```sql
enl_ced_pdf              -- BYTEA: PDF de cédula
enl_mat_pdf              -- BYTEA: PDF de matrícula (solo estudiantes)
cedula_filename          -- VARCHAR: Nombre archivo cédula
matricula_filename       -- VARCHAR: Nombre archivo matrícula
cedula_size             -- INT: Tamaño archivo cédula
matricula_size          -- INT: Tamaño archivo matrícula
documentos_verificados  -- BOOLEAN: Estado de verificación
fec_verificacion_docs   -- TIMESTAMP: Fecha de verificación
```

## Interfaz de Usuario

### 🎨 **Diseño**
- **Layout responsivo**: Material-UI components
- **Tabs navigation**: Estudiantes vs Usuarios
- **Tabla con acciones**: Información + botones de acción
- **Iconografía clara**: Download, Approve, Reject icons
- **Chips informativos**: Muestra qué documentos están subidos

### 🔔 **Feedback al Usuario**
- **Alertas temporales**: Confirmación de acciones
- **Diálogos de confirmación**: Para prevenir errores
- **Loading states**: Durante descarga y procesamiento
- **Estados vacíos**: Cuando no hay documentos pendientes

## Seguridad Implementada

### 🛡️ **Validaciones**
1. **Autenticación**: Usuario debe estar logueado
2. **Autorización**: Solo rol MASTER puede acceder
3. **Validación de parámetros**: Tipos de documento válidos
4. **Sanitización**: Nombres de archivos seguros
5. **Error handling**: Manejo robusto de errores

### 🔒 **Protecciones**
- **JWT validation**: En todas las rutas
- **Role-based access**: Middleware de validación
- **File type validation**: Solo PDFs
- **Size limits**: Controlados por multer middleware

## Instalación y Configuración

### Prerequisitos
- Backend funcionando con Prisma + PostgreSQL
- Frontend con React + Material-UI
- Middleware de autenticación configurado

### ✅ **Ya Implementado**
1. ✅ Controladores backend agregados a `users.js`
2. ✅ Rutas configuradas en `/routes/users.js`
3. ✅ Servicios frontend en `documentService.js`
4. ✅ Componente `AdminVerificacionDocumentos.jsx` creado
5. ✅ Rutas protegidas con `MasterRoute.jsx`
6. ✅ Navegación agregada al `AdminSidebar.jsx`
7. ✅ Rutas configuradas en `App.jsx`

### 🚀 **Para Usar**
1. Asegurar que hay usuarios con rol `MASTER` en la BD
2. Usuarios deben subir documentos usando el módulo existente
3. Admin MASTER accede a `/admin/verificacion-documentos`
4. Revisar y aprobar/rechazar documentos según necesidad

## Mantenimiento

### 📊 **Monitoreo**
- Revisar logs de backend para errores
- Verificar estados de documentos en BD
- Monitorear tiempo de respuesta de descargas

### 🔧 **Posibles Mejoras Futuras**
- Notificaciones por email al aprobar/rechazar
- Histórico de verificaciones
- Comentarios en rechazos
- Verificación automática con IA
- Dashboard con estadísticas de verificación

---

## 📝 Notas de Implementación

**Simplicidad**: El módulo fue diseñado para ser lo más simple posible, como solicitado. No incluye características complejas como comentarios, notificaciones o procesos de multiple pasos.

**Eficiencia**: Las consultas están optimizadas para traer solo usuarios con documentos pendientes, separando automáticamente por tipo de usuario.

**UX**: La interfaz es intuitiva con iconografía clara y feedback inmediato para todas las acciones del administrador. 
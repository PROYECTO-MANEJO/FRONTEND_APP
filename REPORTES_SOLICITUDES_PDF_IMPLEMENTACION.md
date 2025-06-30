# 📊 Sistema de Reportes PDF de Solicitudes de Cambio

## Descripción General
Sistema implementado para generar reportes en formato PDF sobre las solicitudes de cambio del sistema. **Exclusivo para usuarios con rol MASTER**.

## 🔒 Características de Seguridad
- **Acceso exclusivo**: Solo usuarios MASTER pueden generar reportes
- **Auditoría completa**: Cada generación se registra automáticamente
- **JWT obligatorio**: Autenticación requerida en todos los endpoints
- **Validación de roles**: Verificación múltiple del rol MASTER

## 📋 Reportes Disponibles

### 1. Reporte por Estados (`/reportes/solicitudes/estados/pdf`)
- **Descripción**: Distribución de solicitudes por estados del sistema
- **Contenido**:
  - Resumen de cantidades por estado (Borrador, Pendiente, En Revisión, etc.)
  - Detalle completo de solicitudes agrupadas por estado
  - Información del usuario solicitante y fecha de creación

### 2. Reporte por Desarrollador (`/reportes/solicitudes/desarrolladores/pdf`)
- **Descripción**: Carga de trabajo y asignaciones por desarrollador
- **Contenido**:
  - Resumen de solicitudes asignadas por desarrollador
  - Conteo de solicitudes sin asignar
  - Detalle de cada solicitud con estado y fecha
  - Análisis de carga de trabajo

### 3. Reporte Ejecutivo (`/reportes/solicitudes/resumen/pdf`)
- **Descripción**: Resumen general y métricas principales del sistema
- **Contenido**:
  - Métricas principales (total, creadas hoy, este mes)
  - Distribución por estados con porcentajes
  - Distribución por prioridades
  - Top 5 tipos de cambio más frecuentes

## 🛠️ Implementación Técnica

### Backend (Node.js + Prisma)

#### Endpoints API
```
POST /api/reportes/solicitudes/estados/pdf
POST /api/reportes/solicitudes/desarrolladores/pdf  
POST /api/reportes/solicitudes/resumen/pdf
```

#### Middlewares Aplicados
- `validateJWT`: Verificación de token de autenticación
- `validateRoles('MASTER')`: Verificación de rol MASTER
- `logReportAccess`: Logging automático para auditoría

#### Tecnologías Utilizadas
- **PDFKit**: Generación de documentos PDF
- **Prisma**: Consultas optimizadas a base de datos
- **get-stream**: Manejo de streams para PDF

### Frontend (React + Material-UI)

#### Página de Acceso
- **Ubicación**: `/admin/reportes` (Sección de Reportes de Solicitudes)
- **Acceso**: Solo visible para usuarios MASTER
- **Funcionalidad**: 3 botones para generar cada tipo de reporte

#### Características UI
- **Estados de carga**: Indicadores visuales durante generación
- **Mensajes de estado**: Confirmación/error después de generar
- **Redirección automática**: A historial de reportes tras éxito
- **Diseño responsive**: Compatible con diferentes dispositivos

## 📁 Almacenamiento y Descarga

### Base de Datos
Los PDFs se almacenan en la tabla `reporte` con los siguientes tipos:
- `SOLICITUDES_ESTADOS`
- `SOLICITUDES_DESARROLLADORES` 
- `SOLICITUDES_RESUMEN`

### Descarga
Los reportes generados pueden descargarse desde:
- **Historial de Reportes**: `/admin/reportes/historial?tipo=SOLICITUDES_[TIPO]`
- **Endpoint directo**: `/api/reportes/download/[ID_REPORTE]`

## 🎨 Formato de PDFs

### Diseño Estándar
- **Formato**: A4 con márgenes de 50px
- **Encabezado**: Logo, título del sistema, fecha de generación
- **Secciones**: Con colores distintivos para cada categoría
- **Pie de página**: Copyright y tipo de reporte
- **Fuentes**: Times-Roman para contenido, Times-Bold para títulos

### Características Visuales
- **Marcos**: Borde completo alrededor del documento
- **Colores**: Esquema morado/violeta para solicitudes
- **Organización**: Secciones claramente delimitadas
- **Fechas**: Formato español (DD/MM/YYYY)
- **Traducción**: Todos los estados y tipos en español

## 🔧 Configuración y Mantenimiento

### Variables de Entorno
No requiere configuración adicional, utiliza la configuración existente del sistema.

### Monitoreo
- Logs automáticos en consola del servidor
- Registro de auditoría en middleware `logReportAccess`
- Tracking de usuario, timestamp y tipo de reporte

### Escalabilidad
- Sistema preparado para agregar nuevos tipos de reporte
- Funciones auxiliares reutilizables (`traducirEstado`, `traducirPrioridad`, etc.)
- Estructura modular para fácil expansión

## 🚀 Uso del Sistema

### Para Usuarios MASTER:
1. Acceder a `/admin/reportes`
2. Localizar la sección "Reportes PDF de Solicitudes de Cambio"
3. Hacer clic en el botón del reporte deseado
4. Esperar confirmación de generación exitosa
5. Acceder al historial de reportes para descargar

### Para Desarrolladores:
- El sistema está completamente implementado y funcional
- Nuevos reportes pueden agregarse siguiendo el patrón existente
- Las funciones auxiliares pueden reutilizarse para consistencia

## 📝 Notas Importantes
- **Solo PDFs**: El sistema genera únicamente archivos PDF, no interfaces web
- **Tiempo real**: Los datos se consultan en tiempo real al momento de generar
- **Seguridad**: Múltiples capas de validación de acceso
- **Auditoría**: Todos los accesos quedan registrados automáticamente
- **Limpieza**: Se eliminaron componentes web anteriores para evitar confusión

---
*Sistema implementado: Enero 2025*  
*Exclusivo para usuarios MASTER*  
*Auditoría y seguridad integradas* 
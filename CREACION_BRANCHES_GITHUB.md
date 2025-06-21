# 🚀 Crear Branches y Pull Requests desde Solicitudes

Esta funcionalidad permite crear branches y Pull Requests directamente desde la interfaz de gestión técnica de solicitudes de cambio.

## ✨ **Características Principales**

### 🌿 **Creación de Branches**
- **Crear branches automáticamente** con nombres basados en la solicitud
- **Elegir el repositorio** donde crear el branch
- **Seleccionar branch base** (main, develop, etc.)
- **Validación automática** de nombres y disponibilidad

### 🔄 **Creación de Pull Requests**
- **Crear PRs automáticamente** desde branches existentes
- **Descripción automática** con información de la solicitud
- **Vinculación automática** con la solicitud de cambio
- **Selección de branch destino** para el merge

### 📊 **Visualización de Información**
- **Ver commits del branch** en tiempo real
- **Información detallada** del branch y commits
- **Enlaces directos** a GitHub
- **Estado de sincronización** actualizado

## 🎯 **Cómo Usar**

### 1. **Abrir Gestión Técnica**
```
AdminSolicitudes → Seleccionar solicitud → "Gestión Técnica"
```

### 2. **Sección GitHub**
En la sección "Integración con GitHub" encontrarás:

#### 🚀 **Crear Branch y Pull Request**
- **Botón "Crear Branch"**: Crea un nuevo branch
- **Botón "Crear Pull Request"**: Crea PR desde branch existente
- **Botón "Ver Commits"**: Muestra información detallada

### 3. **Crear un Nuevo Branch**

#### **Paso a Paso:**
1. Clic en **"Crear Branch"**
2. **Seleccionar repositorio** (si hay múltiples)
3. **Especificar branch base** (por defecto: `main`)
4. Clic en **"Crear Branch"**

#### **Nombre Automático:**
```
SOL-{ID_CORTO}-{TITULO_SOLICITUD}
Ejemplo: SOL-a1b2c3d4-implementar-nueva-funcionalidad
```

#### **Resultado:**
- ✅ Branch creado en GitHub
- ✅ Solicitud actualizada con información del branch
- ✅ Información sincronizada automáticamente

### 4. **Crear Pull Request**

#### **Requisitos:**
- ✅ La solicitud debe tener un branch asociado
- ✅ El branch debe existir en GitHub

#### **Paso a Paso:**
1. Clic en **"Crear Pull Request"**
2. **Seleccionar repositorio** (si hay múltiples)
3. **Especificar branch destino** (por defecto: `main`)
4. Clic en **"Crear Pull Request"**

#### **Contenido Automático del PR:**
```markdown
## Solicitud de Cambio: {TITULO}

**ID de Solicitud:** {ID_COMPLETO}
**Tipo:** {TIPO_CAMBIO}
**Prioridad:** {PRIORIDAD}

### Descripción
{DESCRIPCION_SOLICITUD}

### Justificación
{JUSTIFICACION}

### Planes de Implementación
{PLAN_IMPLEMENTACION}

---
*Este PR está vinculado automáticamente con la solicitud de cambio {ID}*
```

### 5. **Ver Información Detallada**

#### **Ver Commits:**
1. Clic en **"Ver Commits"**
2. Se muestra información detallada:
   - 📊 **Información del branch**
   - 👤 **Último commit y autor**
   - 📝 **Lista de commits recientes**
   - 🔗 **Enlaces directos a GitHub**

## 🔧 **Configuración Técnica**

### **Variables de Entorno Requeridas**
```env
# Token de GitHub con permisos de repositorio
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Organización/Usuario propietario
GITHUB_DEFAULT_OWNER=tu_organizacion

# Repositorio principal
GITHUB_DEFAULT_REPO=repositorio_principal

# Repositorios adicionales (opcional)
GITHUB_REPO_FRONTEND=frontend_repo
GITHUB_REPO_BACKEND=backend_repo
```

### **Permisos del Token GitHub**
- ✅ `repo` - Acceso completo a repositorios
- ✅ `read:org` - Leer información de organización
- ✅ `user:email` - Acceso a email del usuario

## 📋 **Flujo de Trabajo Recomendado**

### **Para Desarrolladores:**
1. **Crear solicitud de cambio** en el sistema
2. **Admin aprueba** y crea branch desde la solicitud
3. **Desarrollador clona** el branch y trabaja
4. **Admin crea PR** cuando el desarrollo esté listo
5. **Review y merge** del PR en GitHub

### **Para Administradores:**
1. **Revisar solicitud** en AdminSolicitudes
2. **Abrir Gestión Técnica** para la solicitud
3. **Crear branch** en el repositorio apropiado
4. **Comunicar al desarrollador** el branch creado
5. **Crear PR** cuando el desarrollo esté completo
6. **Monitorear commits** usando "Ver Commits"

## 🎨 **Interfaz Visual**

### **Botones de Acción:**
- 🟢 **"Crear Branch"** - Verde, con ícono ➕
- 🔵 **"Crear Pull Request"** - Azul, con ícono 🔄
- ⚪ **"Ver Commits"** - Gris, con ícono 💻

### **Estados Visuales:**
- ⏳ **Creando Branch...** - Botón con spinner
- ⏳ **Creando PR...** - Botón con spinner
- ✅ **Branch Creado** - Información actualizada
- ✅ **PR Creado** - Enlaces a GitHub disponibles

### **Información Mostrada:**
- 🏷️ **Chips de Branch** - Nombre del branch actual
- 🔗 **Chips de PR** - Número y enlace del PR
- 📊 **Commits** - Lista con autor, mensaje y fecha
- 🔄 **Estado de Sync** - Última sincronización

## 🚨 **Manejo de Errores**

### **Errores Comunes:**
- **Branch ya existe**: Se muestra información del branch existente
- **Token inválido**: Error de configuración de GitHub
- **Repositorio no encontrado**: Verificar configuración
- **Permisos insuficientes**: Revisar permisos del token

### **Mensajes de Error:**
- 🔴 **"GitHub no está configurado"** - Falta configuración
- 🔴 **"Error creando branch"** - Problema con la API de GitHub
- 🔴 **"Error creando Pull Request"** - Problema con el PR
- 🔴 **"Branch ya existía"** - Información, no error crítico

## 🔄 **Sincronización Automática**

### **Cuándo se Sincroniza:**
- ✅ **Después de crear branch**
- ✅ **Después de crear PR**
- ✅ **Al hacer clic en "Sync"**
- ✅ **Al abrir Gestión Técnica**

### **Qué se Sincroniza:**
- 🌿 **Información de branches**
- 🔄 **Estado de Pull Requests**
- 📝 **Commits relacionados**
- 🕐 **Timestamps de última actualización**

## 🎯 **Casos de Uso**

### **Caso 1: Desarrollo de Nueva Funcionalidad**
```
1. Solicitud: "Implementar sistema de notificaciones"
2. Admin crea branch: SOL-abc123-sistema-notificaciones
3. Desarrollador trabaja en el branch
4. Admin crea PR cuando está listo
5. Review y merge del código
```

### **Caso 2: Corrección de Bug Urgente**
```
1. Solicitud: "Corregir error en login"
2. Admin crea branch desde main
3. Desarrollador hace fix rápido
4. Admin crea PR inmediatamente
5. Merge urgente después de review
```

### **Caso 3: Múltiples Repositorios**
```
1. Solicitud afecta frontend y backend
2. Admin crea branch en repo frontend
3. Admin crea branch en repo backend
4. Desarrolladores trabajan en paralelo
5. PRs coordinados para ambos repos
```

## 🔧 **Personalización**

### **Nombres de Branch Personalizados**
El sistema genera nombres automáticamente, pero puedes:
- Modificar el patrón en `githubService.js`
- Ajustar la longitud del ID
- Cambiar el formato del título

### **Templates de PR**
Puedes personalizar el template del PR en:
```javascript
// BACKEND_APP/services/githubService.js
const cuerpo = `Tu template personalizado aquí...`;
```

## 📚 **Referencias Técnicas**

### **Archivos Principales:**
- `BACKEND_APP/services/githubService.js` - Lógica de GitHub
- `BACKEND_APP/controllers/githubController.js` - Controladores API
- `BACKEND_APP/routes/github.js` - Rutas de API
- `src/services/githubService.js` - Cliente frontend
- `src/components/admin/GestionTecnicaSolicitud.jsx` - Interfaz

### **APIs Utilizadas:**
- **GitHub REST API v4** - Creación de branches y PRs
- **Prisma ORM** - Actualización de base de datos
- **Material-UI** - Componentes de interfaz

---

## 🎉 **¡Listo para Usar!**

Con esta funcionalidad puedes:
- ✅ **Crear branches** directamente desde solicitudes
- ✅ **Elegir repositorio** de destino
- ✅ **Crear Pull Requests** automáticamente
- ✅ **Ver commits** en tiempo real
- ✅ **Mantener sincronización** con GitHub

**¡El desarrollo nunca fue tan integrado! 🚀** 
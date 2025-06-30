# Configuración de Múltiples Repositorios GitHub

## 🏢 **Escenario: Organización con Múltiples Repositorios**

Si tu organización tiene múltiples repositorios (frontend, backend, mobile, etc.) y quieres que las solicitudes de cambio puedan asociarse con cualquiera de ellos, aquí está la configuración completa.

## ⚙️ **Configuración de Variables de Entorno**

### **Ejemplo para Organización "mi-empresa-tech"**

```env
# Token de GitHub (mismo para todos los repositorios)
GITHUB_TOKEN=ghp_1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T

# Organización principal
GITHUB_DEFAULT_OWNER=mi-empresa-tech

# Repositorio principal (por defecto)
GITHUB_DEFAULT_REPO=sistema-principal

# Repositorios adicionales
GITHUB_REPO_FRONTEND=frontend-app
GITHUB_REPO_BACKEND=backend-api
GITHUB_REPO_MOBILE=mobile-app
```

### **URLs de Ejemplo**
Con esta configuración, tendrías acceso a:
- `https://github.com/mi-empresa-tech/sistema-principal` (principal)
- `https://github.com/mi-empresa-tech/frontend-app` (frontend)
- `https://github.com/mi-empresa-tech/backend-api` (backend)
- `https://github.com/mi-empresa-tech/mobile-app` (mobile)

## 🔧 **Funcionalidades Implementadas**

### **1. Sincronización Global**
- **Botón "Sync Todos"**: Busca en todos los repositorios configurados
- Encuentra branches y PRs en cualquier repositorio de la organización
- Consolida toda la información en una vista unificada

### **2. Sincronización por Repositorio**
- **Selector de Repositorio**: Dropdown para elegir repositorio específico
- **Botón "Sync [repo]"**: Sincroniza solo el repositorio seleccionado
- Útil cuando sabes exactamente dónde está el código

### **3. Visualización Mejorada**
- **Por Repositorio**: Muestra información agrupada por repositorio
- **Consolidada**: Vista general de todos los branches y PRs encontrados
- **Enlaces Directos**: Botones para abrir cada repositorio en GitHub

## 📝 **Convenciones de Nombres para Múltiples Repos**

### **Estrategia Recomendada**
Usa el mismo ID de solicitud en todos los repositorios:

```bash
# Frontend
git checkout -b SOL-abc123-implementar-ui-login
git commit -m "SOL-abc123: Crear componente de login"

# Backend  
git checkout -b SOL-abc123-api-autenticacion
git commit -m "SOL-abc123: Agregar endpoint de autenticación"

# Mobile
git checkout -b SOL-abc123-pantalla-login
git commit -m "SOL-abc123: Implementar pantalla de login móvil"
```

### **Pull Requests Coordinados**
```
Frontend PR: "SOL-abc123: Implementar UI de login completa"
Backend PR:  "SOL-abc123: API de autenticación y sesiones"
Mobile PR:   "SOL-abc123: Pantalla de login nativa"
```

## 🎯 **Casos de Uso Específicos**

### **Caso 1: Cambio Solo en Frontend**
```env
# Solo necesitas el repositorio frontend
GITHUB_DEFAULT_REPO=frontend-app
```

### **Caso 2: Cambio Full-Stack**
```env
# Configuración completa para buscar en todos
GITHUB_DEFAULT_REPO=sistema-principal
GITHUB_REPO_FRONTEND=frontend-app
GITHUB_REPO_BACKEND=backend-api
```

### **Caso 3: Microservicios**
```env
GITHUB_DEFAULT_OWNER=mi-empresa-tech
GITHUB_DEFAULT_REPO=main-app

# Microservicios
GITHUB_REPO_AUTH=auth-service
GITHUB_REPO_USERS=users-service  
GITHUB_REPO_PAYMENTS=payments-service
GITHUB_REPO_NOTIFICATIONS=notifications-service
```

## 🔍 **Ejemplo de Uso en la Aplicación**

### **Paso 1: Configurar Variables**
```env
GITHUB_TOKEN=tu_token_aqui
GITHUB_DEFAULT_OWNER=tu-organizacion
GITHUB_DEFAULT_REPO=main-repo
GITHUB_REPO_FRONTEND=frontend-repo
GITHUB_REPO_BACKEND=backend-repo
```

### **Paso 2: Crear Branches en Múltiples Repos**
```bash
# En frontend-repo
git checkout -b SOL-123-nueva-feature-ui

# En backend-repo  
git checkout -b SOL-123-nueva-feature-api
```

### **Paso 3: Usar la Aplicación**
1. Ve a Gestión Técnica de la solicitud SOL-123
2. En "Integración con GitHub":
   - **Opción A**: Haz clic en "Sync Todos" → Encuentra ambos branches
   - **Opción B**: Selecciona "frontend" y haz clic en "Sync frontend" → Solo encuentra el branch del frontend

### **Resultado Esperado**
```
📋 Información Actual

Por Repositorio:
┌─ frontend-repo (frontend)
│  Branches: SOL-123-nueva-feature-ui
│  PRs: #45

└─ backend-repo (backend)  
   Branches: SOL-123-nueva-feature-api
   PRs: #23

Información Consolidada:
🏷️ Branch: SOL-123-nueva-feature-ui [Ver Repositorio]
🏷️ PR #45 [Ver Pull Request]
🏷️ Branch: SOL-123-nueva-feature-api [Ver Repositorio]  
🏷️ PR #23 [Ver Pull Request]
```

## 🚨 **Troubleshooting Múltiples Repos**

### **Error: "No encuentra branches en algunos repositorios"**
✅ **Solución**: 
- Verifica que todos los repositorios existan
- Asegúrate de tener permisos en todos
- Usa la sincronización por repositorio específico para diagnosticar

### **Error: "Información mezclada"**
✅ **Solución**:
- Usa convenciones de nombres consistentes
- El ID de solicitud debe ser el mismo en todos los repos
- Revisa la sección "Por Repositorio" para ver la separación

### **Error: "Demasiados resultados"**
✅ **Solución**:
- Usa nombres más específicos en branches
- Utiliza la sincronización por repositorio específico
- Limpia branches antiguos que ya no uses

## 🎨 **Personalización Avanzada**

### **Agregar Más Repositorios**
Simplemente agrega más variables de entorno:

```env
GITHUB_REPO_DOCS=documentation
GITHUB_REPO_TESTS=e2e-tests  
GITHUB_REPO_INFRA=infrastructure
```

### **Cambiar Nombres de Tipos**
Modifica el servicio de GitHub para usar nombres personalizados:

```javascript
this.repositories = {
  principal: process.env.GITHUB_DEFAULT_REPO,
  interfaz: process.env.GITHUB_REPO_FRONTEND,
  servidor: process.env.GITHUB_REPO_BACKEND,
  movil: process.env.GITHUB_REPO_MOBILE
};
```

## 📊 **Beneficios de Múltiples Repositorios**

✅ **Organización**: Cada equipo trabaja en su repositorio  
✅ **Visibilidad**: Una solicitud puede ver cambios en todos los repos  
✅ **Flexibilidad**: Sincronización global o específica  
✅ **Trazabilidad**: Seguimiento completo de cambios relacionados  
✅ **Coordinación**: Facilita cambios que afectan múltiples sistemas  

## 🔗 **Enlaces Útiles**

- [Configuración Básica GitHub](./INTEGRACION_GITHUB.md)
- [Documentación GitHub API](https://docs.github.com/en/rest)
- [Gestión de Permisos en Organizaciones](https://docs.github.com/en/organizations)

---

**💡 Tip**: Empieza con 2-3 repositorios principales y ve agregando más según necesites. La configuración es escalable y fácil de mantener. 
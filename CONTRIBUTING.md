# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Gestión de Eventos Académicos de la UTA! Esta guía te ayudará a entender cómo puedes colaborar de manera efectiva.

## 📋 Tabla de Contenidos

- [🚀 Cómo Empezar](#-cómo-empezar)
- [🔄 Flujo de Trabajo](#-flujo-de-trabajo)
- [💻 Configuración del Entorno](#-configuración-del-entorno)
- [📝 Estándares de Código](#-estándares-de-código)
- [🧪 Testing](#-testing)
- [📖 Documentación](#-documentación)
- [🐛 Reportar Bugs](#-reportar-bugs)
- [✨ Solicitar Features](#-solicitar-features)
- [📋 Pull Requests](#-pull-requests)
- [🏷️ Convenciones](#️-convenciones)
- [🚢 Releases](#-releases)
- [❓ FAQ](#-faq)

## 🚀 Cómo Empezar

### 1. Explora el Proyecto

Antes de contribuir, familiarízate con:
- [README.md](README.md) - Documentación principal
- [Issues](https://github.com/tu-usuario/frontend-uta-eventos/issues) - Problemas conocidos
- [Projects](https://github.com/tu-usuario/frontend-uta-eventos/projects) - Roadmap
- [Wiki](https://github.com/tu-usuario/frontend-uta-eventos/wiki) - Documentación extendida

### 2. Busca tu Primera Contribución

Etiquetas ideales para principiantes:
- `good first issue` - Problemas perfectos para comenzar
- `help wanted` - Necesitamos ayuda con estos issues
- `documentation` - Mejoras en documentación
- `bug` - Errores que necesitan arreglo

### 3. Únete a la Comunidad

- 💬 [Discussions](https://github.com/tu-usuario/frontend-uta-eventos/discussions)
- 📧 Email: dev-team@uta.edu.ec
- 📱 Slack: #uta-eventos-dev

## 🔄 Flujo de Trabajo

Seguimos **Git Flow** para el desarrollo:

### Ramas Principales

```
main                    # Código en producción
├── develop             # Desarrollo principal
    ├── feature/*       # Nuevas funcionalidades
    ├── bugfix/*        # Corrección de bugs
    ├── hotfix/*        # Correcciones urgentes
    └── release/*       # Preparación de releases
```

### Proceso de Contribución

1. **Fork** del repositorio
2. **Clone** tu fork localmente
3. **Crear rama** desde `develop`
4. **Desarrollar** tu contribución
5. **Testing** completo
6. **Commit** siguiendo convenciones
7. **Push** a tu fork
8. **Pull Request** a `develop`

## 💻 Configuración del Entorno

### Prerequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** >= 2.34.0
- **Editor**: VS Code (recomendado)

### Setup Inicial

```bash
# 1. Fork y clone
git clone https://github.com/TU-USUARIO/frontend-uta-eventos.git
cd frontend-uta-eventos

# 2. Configurar remotes
git remote add upstream https://github.com/ORIGINAL-USUARIO/frontend-uta-eventos.git

# 3. Instalar dependencias
npm install

# 4. Configurar variables de entorno
cp .env.example .env.local

# 5. Iniciar desarrollo
npm run dev
```

### Extensiones de VS Code Recomendadas

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

## 📝 Estándares de Código

### ESLint y Prettier

```bash
# Verificar código
npm run lint

# Corregir automáticamente
npm run lint:fix

# Formatear código
npm run format
```

### Estructura de Archivos

```javascript
// ✅ Correcto
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Login.test.jsx
│   │   └── index.js
│   └── shared/
│       ├── Button.jsx
│       └── Button.test.jsx
```

### Convenciones de Naming

```javascript
// ✅ Componentes - PascalCase
const UserProfile = () => {}

// ✅ Hooks - camelCase con 'use'
const useAuthUser = () => {}

// ✅ Constantes - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.uta.edu.ec'

// ✅ Archivos - kebab-case o PascalCase para componentes
user-profile.jsx
UserProfile.jsx
```

### Estructura de Componentes

```jsx
// ✅ Estructura recomendada
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import './UserProfile.css';

/**
 * Componente para mostrar el perfil del usuario
 * @param {Object} props - Props del componente
 * @param {string} props.userId - ID del usuario
 * @param {function} props.onUpdate - Callback al actualizar
 */
const UserProfile = ({ userId, onUpdate }) => {
  // 1. Hooks de estado
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 2. Hooks de contexto
  const { currentUser } = useAuth();
  
  // 3. Hooks de efecto
  useEffect(() => {
    // Lógica del efecto
  }, [userId]);
  
  // 4. Handlers
  const handleUpdate = () => {
    // Lógica del handler
  };
  
  // 5. Early returns
  if (loading) return <div>Cargando...</div>;
  
  // 6. Render principal
  return (
    <Box>
      <Typography variant="h4">
        {user.name}
      </Typography>
    </Box>
  );
};

// 7. PropTypes
UserProfile.propTypes = {
  userId: PropTypes.string.isRequired,
  onUpdate: PropTypes.func
};

// 8. Default props
UserProfile.defaultProps = {
  onUpdate: () => {}
};

export default UserProfile;
```

### Manejo de Estado

```javascript
// ✅ Context API para estado global
const AuthContext = createContext();

// ✅ useState para estado local
const [formData, setFormData] = useState({});

// ✅ Custom hooks para lógica reutilizable
const useApi = (url) => {
  // Lógica del hook
};
```

## 🧪 Testing

### Estrategia de Testing

1. **Unit Tests** - Componentes individuales
2. **Integration Tests** - Flujos de usuario
3. **E2E Tests** - Casos críticos (próximamente)

### Comandos de Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:coverage

# Tests específicos
npm run test -- UserProfile.test.jsx
```

### Estructura de Tests

```javascript
// UserProfile.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../../context/AuthContext';
import UserProfile from './UserProfile';

// Mock data
const mockUser = {
  id: '1',
  name: 'Juan Pérez',
  email: 'juan@uta.edu.ec'
};

// Helper function
const renderWithAuth = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('UserProfile', () => {
  it('should render user name correctly', () => {
    renderWithAuth(<UserProfile userId="1" />);
    
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
  });
  
  it('should handle update correctly', () => {
    const onUpdate = jest.fn();
    
    renderWithAuth(<UserProfile userId="1" onUpdate={onUpdate} />);
    
    fireEvent.click(screen.getByText('Actualizar'));
    
    expect(onUpdate).toHaveBeenCalledWith(mockUser);
  });
});
```

### Coverage Mínimo

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

## 📖 Documentación

### JSDoc para Funciones

```javascript
/**
 * Valida una cédula ecuatoriana
 * @param {string} cedula - Número de cédula a validar
 * @returns {boolean} True si la cédula es válida
 * @example
 * validateCedula('1234567890') // true
 * validateCedula('invalid') // false
 */
const validateCedula = (cedula) => {
  // Implementación
};
```

### README para Componentes

```markdown
# UserProfile

Componente para mostrar y editar el perfil del usuario.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| userId | string | ✅ | - | ID del usuario |
| onUpdate | function | ❌ | () => {} | Callback al actualizar |

## Ejemplo

```jsx
<UserProfile 
  userId="123" 
  onUpdate={(user) => console.log(user)} 
/>
```
```

## 🐛 Reportar Bugs

### Antes de Reportar

1. ✅ Busca en [issues existentes](https://github.com/tu-usuario/frontend-uta-eventos/issues)
2. ✅ Verifica que sea un bug y no un error de configuración
3. ✅ Asegúrate de usar la última versión

### Template para Bug Reports

```markdown
**Descripción**
Descripción clara del bug.

**Pasos para Reproducir**
1. Ve a '...'
2. Haz click en '...'
3. Scroll hasta '...'
4. Ver error

**Comportamiento Esperado**
Lo que debería pasar.

**Comportamiento Actual**
Lo que está pasando.

**Screenshots**
Si aplica, agrega screenshots.

**Entorno**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 90]
- Node.js: [e.g. 18.0.0]
- npm: [e.g. 9.0.0]

**Información Adicional**
Cualquier contexto adicional.
```

## ✨ Solicitar Features

### Template para Feature Requests

```markdown
**¿Tu solicitud está relacionada con un problema?**
Descripción clara del problema. Ej: "Me frustra que..."

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que pase.

**Describe alternativas consideradas**
Descripción de soluciones alternativas.

**Información Adicional**
Cualquier contexto o screenshots adicionales.
```

## 📋 Pull Requests

### Checklist Antes del PR

- [ ] Código sigue los estándares del proyecto
- [ ] Tests añadidos/actualizados y pasando
- [ ] Documentación actualizada
- [ ] Sin warnings de linter
- [ ] Screenshots para cambios de UI
- [ ] PR description completa

### Template para PR

```markdown
## Descripción
Breve descripción de los cambios.

## Tipo de Cambio
- [ ] Bug fix (cambio que arregla un issue)
- [ ] Nueva feature (cambio que añade funcionalidad)
- [ ] Breaking change (arreglo o feature que causaría que funcionalidad existente no funcione como esperado)
- [ ] Documentación

## Testing
- [ ] Tests unitarios añadidos/actualizados
- [ ] Tests manuales realizados
- [ ] Todos los tests pasan

## Screenshots (si aplica)
Agregar screenshots de cambios de UI.

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado un self-review de mi código
- [ ] He comentado mi código, particularmente en áreas difíciles de entender
- [ ] He hecho cambios correspondientes a la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He añadido tests que prueban que mi arreglo es efectivo o que mi feature funciona
- [ ] Tests unitarios nuevos y existentes pasan localmente con mis cambios
```

### Proceso de Review

1. **Automated Checks** - Linting, testing, build
2. **Code Review** - Revisión por maintainers
3. **Testing** - Testing manual si es necesario
4. **Approval** - Aprobación final
5. **Merge** - Merge a develop

## 🏷️ Convenciones

### Commits (Conventional Commits)

```bash
# Estructura
type(scope): description

# Tipos
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Cambios de formato (no afectan lógica)
refactor: # Refactoring de código
test:     # Añadir o corregir tests
chore:    # Cambios en build process, herramientas auxiliares

# Ejemplos
feat(auth): add password reset functionality
fix(ui): correct button spacing on mobile
docs(readme): update installation instructions
style(components): format code with prettier
refactor(api): extract common validation logic
test(auth): add tests for login component
chore(deps): update react to v19.1.0
```

### Branches

```bash
# Feature branches
feature/auth-system
feature/document-upload
feature/user-dashboard

# Bug fixes
bugfix/login-validation
bugfix/file-upload-error

# Hotfixes
hotfix/security-patch
hotfix/critical-bug

# Releases
release/v1.0.0
release/v1.1.0
```

### Issues y Labels

**Tipos:**
- `bug` - Algo no funciona
- `enhancement` - Nueva funcionalidad
- `documentation` - Mejoras en docs
- `question` - Pregunta
- `duplicate` - Issue duplicado
- `wontfix` - No se arreglará

**Prioridad:**
- `priority: critical` - Crítico
- `priority: high` - Alta
- `priority: medium` - Media
- `priority: low` - Baja

**Estado:**
- `status: in-progress` - En progreso
- `status: needs-review` - Necesita revisión
- `status: blocked` - Bloqueado

## 🚢 Releases

### Versionado Semántico

```
MAJOR.MINOR.PATCH
1.0.0
```

- **MAJOR** - Cambios incompatibles
- **MINOR** - Nueva funcionalidad compatible
- **PATCH** - Correcciones de bugs

### Proceso de Release

1. **Feature Freeze** - No nuevas features
2. **Testing** - Testing completo
3. **Documentation** - Docs actualizadas
4. **Release Branch** - Crear rama release
5. **Final Testing** - Testing en release branch
6. **Tagging** - Crear tag de versión
7. **Deploy** - Deploy a producción
8. **Merge** - Merge a main y develop

## ❓ FAQ

### ¿Cómo puedo configurar mi editor?

Ver la sección [Configuración del Entorno](#-configuración-del-entorno).

### ¿Qué pasa si mi PR falla los checks?

1. Revisa los logs de error
2. Corrige los problemas localmente
3. Push los cambios
4. Los checks se ejecutarán automáticamente

### ¿Puedo trabajar en múltiples issues a la vez?

Es mejor enfocarse en un issue a la vez para mantener PRs pequeños y manejables.

### ¿Cómo mantengo mi fork actualizado?

```bash
git fetch upstream
git checkout develop
git merge upstream/develop
git push origin develop
```

### ¿Dónde puedo pedir ayuda?

- [GitHub Discussions](https://github.com/tu-usuario/frontend-uta-eventos/discussions)
- Email: dev-team@uta.edu.ec
- Issues con label `question`

---

<div align="center">
  <p><strong>Happy Coding! 🚀</strong></p>
  <p>
    <a href="README.md">README</a> •
    <a href="https://github.com/tu-usuario/frontend-uta-eventos/issues">Issues</a> •
    <a href="https://github.com/tu-usuario/frontend-uta-eventos/discussions">Discussions</a>
  </p>
</div> 
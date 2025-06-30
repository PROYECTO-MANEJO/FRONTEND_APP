# Integración con GitHub - Sistema de Solicitudes de Cambio

## Configuración Inicial

### Variables de Entorno (Backend)

Para que funcione la integración con GitHub, debes configurar las siguientes variables de entorno en tu backend:

```env
GITHUB_TOKEN=tu_token_personal_de_github
GITHUB_DEFAULT_OWNER=nombre_de_usuario_o_organizacion
GITHUB_DEFAULT_REPO=nombre_del_repositorio
```

### Obtener Token de GitHub

1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Genera un nuevo token con los permisos:
   - `repo` (acceso completo a repositorios)
   - `read:org` (si trabajas con organizaciones)
3. Copia el token y úsalo en `GITHUB_TOKEN`

## Funcionalidades Implementadas

### 1. Sincronización Automática
- **Búsqueda de Branches**: Encuentra branches que contengan el ID de la solicitud
- **Búsqueda de Pull Requests**: Encuentra PRs relacionados con la solicitud
- **Obtención de Commits**: Extrae commits de los branches encontrados

### 2. Asociación Manual
- **Asociar Branch**: Vincula manualmente un branch específico
- **Asociar Pull Request**: Vincula manualmente un PR específico
- **URLs personalizadas**: Permite especificar repositorios diferentes

### 3. Visualización
- **Información en Gestión Técnica**: Panel completo para administradores
- **Información en Detalles**: Vista de solo lectura para revisión
- **Enlaces directos**: Botones para abrir GitHub en nueva pestaña

## Cómo Usar

### Para Administradores (MASTER)

#### 1. Gestión Técnica de Solicitud
1. Ve a "Administración" → "Solicitudes de Cambio"
2. Selecciona una solicitud y haz clic en "Gestión Técnica"
3. Ve a la sección "Integración con GitHub"
4. Opciones disponibles:
   - **Sincronizar**: Busca automáticamente branches y PRs
   - **Asociar Manualmente**: Vincula específicamente un branch o PR

#### 2. Sincronización Automática
- Haz clic en "Sincronizar"
- El sistema buscará branches con nombres como:
  - `SOL-{id}`
  - `solicitud-{id}`
  - O que contengan el ID de la solicitud
- También buscará PRs con títulos o branches relacionados

#### 3. Asociación Manual
- Haz clic en "Asociar Manualmente"
- Para Branch:
  - Ingresa el nombre exacto del branch
  - Opcionalmente, la URL del repositorio si es diferente al configurado
- Para Pull Request:
  - Ingresa el número del PR
  - Opcionalmente, la URL completa del PR

### Para Desarrolladores

#### Convención de Nombres
Para que la sincronización automática funcione, usa estas convenciones:

**Branches:**
```
SOL-{ID_SOLICITUD}-descripcion-corta
feature/SOL-{ID_SOLICITUD}-nueva-funcionalidad
bugfix/solicitud-{ID_SOLICITUD}-correccion
```

**Pull Requests:**
```
Título: "SOL-{ID_SOLICITUD}: Descripción del cambio"
o
Título: "Solicitud {ID_SOLICITUD}: Implementación de nueva funcionalidad"
```

#### Ejemplo Práctico
Si tienes una solicitud con ID `abc123-def456-ghi789`:

```bash
# Crear branch
git checkout -b SOL-abc123-implementar-login

# Hacer commits
git commit -m "SOL-abc123: Agregar formulario de login"
git commit -m "SOL-abc123: Implementar validación de usuario"

# Crear Pull Request con título
"SOL-abc123: Implementar sistema de login completo"
```

## Información Mostrada

### En Gestión Técnica
- Branch asociado con enlace al repositorio
- Pull Request con enlace directo
- Lista de commits relacionados (hasta 5 más recientes)
- Estado de sincronización (cuándo fue la última vez)
- Formularios para asociación manual

### En Vista de Detalles
- Información de solo lectura
- Enlaces para abrir en GitHub
- Resumen de commits (hasta 3 más recientes)
- Estado de sincronización

## Campos en Base de Datos

Los siguientes campos se agregaron al modelo `SolicitudCambio`:

```prisma
github_repo_url String? // URL del repositorio
github_branch_name String? // Nombre del branch
github_pr_number Int? // Número del Pull Request
github_pr_url String? // URL del Pull Request
github_commits Json? // Array de commits en formato JSON
github_last_sync DateTime? // Última sincronización
```

## API Endpoints

### Configuración
- `GET /api/github/configuracion` - Verificar estado de configuración

### Solicitud Específica
- `GET /api/github/solicitud/:id` - Obtener info de GitHub
- `POST /api/github/solicitud/:id/sincronizar` - Sincronizar automáticamente
- `PUT /api/github/solicitud/:id/branch` - Asociar branch manualmente
- `PUT /api/github/solicitud/:id/pull-request` - Asociar PR manualmente
- `GET /api/github/solicitud/:id/branch-sugerido` - Generar nombre sugerido

## Troubleshooting

### GitHub no configurado
Si ves el mensaje "GitHub no está configurado":
1. Verifica las variables de entorno en el servidor
2. Asegúrate de que el token tenga los permisos correctos
3. Verifica que el repositorio existe y es accesible

### No encuentra branches/PRs automáticamente
1. Verifica que los nombres sigan las convenciones
2. Usa la asociación manual como alternativa
3. Revisa que el repositorio configurado sea el correcto

### Errores de permisos
1. Verifica que el token tenga permisos de `repo`
2. Si es repositorio privado, asegúrate de tener acceso
3. Para organizaciones, verifica permisos de `read:org`

## Próximas Mejoras

- [ ] Webhook para sincronización automática en tiempo real
- [ ] Integración con GitHub Actions para deployment
- [ ] Notificaciones automáticas en GitHub cuando cambia el estado
- [ ] Métricas de tiempo desde commit hasta deployment 
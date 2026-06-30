# 📘 Sistema de Gestión de Sesiones y Tareas Académicas

Aplicación full-stack moderna diseñada para la planificación, organización y seguimiento de sesiones de estudio grupales e individuales. Combina una interfaz React rápida con un backend robusto basado en Express + PostgreSQL, implementando autenticación JWT, control de acceso por roles (RBAC) y validaciones avanzadas de propiedad sobre los recursos compartidos.

---

## 🛠️ Stack Tecnológico
| Capa | Tecnologías Utilizadas |
|------|------------------------|
| **Frontend** | React 18+, Vite, Tailwind CSS, ES Modules (`type: "module"`) |
| **Backend** | Node.js, Express v5.x, Sequelize ORM |
| **Base de Datos**| PostgreSQL (`pg`, `pg-hstore`) |
| **Seguridad & Auth**| JWT (`jsonwebtoken`), Encriptación (`bcryptjs` / `crypto-js`), CORS controlado |
| **Testing**    | Jest 29+, Supertest (HTTP integration tests) |

---

## 🚀 Inicio Rápido

### 1. Clonar e Instalar
```bash
git clone <URL_DEL_REPOSITORIO>
cd tu-proyecto
npm install 
# Si el frontend tiene sus propios scripts: cd FrontEnd && npm install && cd ..
```

### 2. Configurar Entorno
Crear un archivo `.env` en la raíz y/o dentro de `Backend/`:
- **DB_CONFIG**: Credenciales PostgreSQL (Host, User, Password, Database Name).
- **JWT_SECRET**: Clave secreta para firmas asimétricas o simétricas.
- **PORT/Puertos**: Puerto del backend (default 8000) y frontend Vite.

### 3. Levantar el Proyecto
Se recomienda abrir dos terminales para correr en paralelo:

```bash
# Terminal 1 - Backend API
npm start 

# Terminal 2 - Frontend UI
npm run dev 
```

---

## 💻 Scripts Disponibles (Root)

| Comando | Descripción |
|---------|-------------|
| `npm start`       | Ejecuta la API backend (`Backend/index.js`). |
| `npm run dev:frontend`  | Inicia el servidor de Vite para desarrollo del frontend. |
| `npm test`     | Corre las pruebas unitarias e integradas (Jest). Requiere soporte ESM experimental en Node >18 si aplica. |

---

## 🧪 Testing & Cobertura (QA)

El proyecto utiliza **Jest** combinado con **Supertest** para validar la integridad de los controladores y servicios HTTP sin levantar un servidor completo. 

### 📊 Resultado Actualizado
A continuación se muestra el reporte detallado del servicio crítico `SesionesService.js`. El sistema mantiene una salud robusta en declaraciones, aunque existen oportunidades de mejora en las ramificaciones (Branch Coverage).

```text
--------------------|---------|----------|---------|---------|-----------------------------------------------------------...
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s    
SesionesService.js |    71.5 |    55.69 |      60 |   74.09 | 16,40,59-80,97...
--------------------|---------|----------|---------|---------|-----------------------------------------------------------...

Test Suites: 1 passed (Total: 1)
Tests:       12 passed 
```

### 👥 Usuarios de Prueba (Semilla & Roles RBAC)
Para facilitar la validación manual o ejecución automática, el sistema cuenta con usuarios precargados para cubrir distintos niveles de privilegios en los permisos. Utiliza estas credenciales al ejecutar las pruebas:

| Email / Role | Nivel de Acceso | Uso Recomendado |
|-------------|-----------------|------------------|
| `sys.admin@correo.com`     | **SysAdmin (Role 1)**      | Pruebas CRUD Admin, auditoría global y gestión masiva. |
| `group.admin@correo.com`   | **Administrador de grupos (Role 2)**| Creación de grupos, validaciones de "Ownership" en sesiones. |
| `uno.usuario@correo.com`     | **Usuario participante (Role 3)**           | Visualización de tareas, estado completado (readonly), y restricciones de edición. |

---

## 🔒 Arquitectura & Seguridad

La aplicación se fundamenta en una arquitectura por capas (`Routes -> Controllers -> Services`) con los siguientes controles:

1.  **RBAC Middleware**: Restricción estricta vía `authorizeRoles()` en rutas protegidas (ej: `/admin/*`).
2.  **Ownership Validation**: Middleware personalizado que evita la modificación de recursos ajenos comparando el ID del usuario logueado vs el dueño del recurso (`sesion_id`, `tarea_id`) antes de aplicar PUT/DELETE.
3.  **Mass Assignment Protection**: Filtros seguros al recibir payloads en actualizaciones críticas para evitar inyección de propiedades maliciosas (ej: intentar cambiar roles vía input público).

---

## 🗄️ Modelo Relacional Destacado 
- 👤 `User`: Gestiona credenciales y hash bcrypt. Relacion 1:N con Grupos creados/Sesiones asignadas.
- 📅 `Sesion`: Contenedor de actividades académicas, fechas inicio/fin, FK a grupos específicos.
- ✅ `Tarea`: Items desglosados dentro de sesiones. Estado (pendiente/completada), notas internas y prioridad.

--- Imagenes y capturas de la app
Imagenes sitio y evidencia:
https://drive.google.com/drive/folders/1_ZEe-ic1-2i1dVkgQZ_8fgNihXg-io6i?usp=sharing

>
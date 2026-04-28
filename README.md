# SII Linces — TecNM Celaya

Dashboard académico para estudiantes del **Tecnológico Nacional de México Campus Celaya**. Consume la API oficial del SII ITC y añade funcionalidades que el sistema original no ofrece: calendario visual con el calendario académico institucional, notificaciones por correo, eventos personales y vista responsiva desde cualquier dispositivo.

**Producción:** https://sii-itc-app.vercel.app

---

## Características

| Módulo | Descripción |
|---|---|
| **Login** | Autenticación con credenciales institucionales (correo + contraseña del SII) |
| **Dashboard** | Vista de bienvenida con resumen del periodo activo |
| **Mi Perfil** | Datos personales, carrera, número de control y semestre |
| **Calificaciones** | Historial por periodo con vista de tabla y tarjetas; filtro por materia |
| **Kardex** | Historial académico completo agrupado por semestre con acordeón interactivo |
| **Horario** | Horario semanal y vista de lista; colores por materia |
| **Calendario** | Calendario oficial TecNM Ene–Jun 2026 + eventos personales; notificaciones por correo |
| **Proyección** | Herramienta de proyección de calificaciones (en desarrollo) |

### Seguridad y UX
- Sesión por pestaña (`sessionStorage`) — cerrar la pestaña invalida la sesión automáticamente
- Cierre de sesión por inactividad tras 7 minutos sin actividad
- Protección de rutas: cualquier acceso al dashboard sin token redirige al login
- Búsqueda global en la topbar compartida entre todas las pantallas

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| UI | React 19, CSS propio (`sii-design.css`) sin Tailwind en runtime |
| Tipado | TypeScript 5 |
| Base de datos | Supabase (PostgreSQL) con RLS |
| Correo | Resend API |
| Deploy | Vercel (CI/CD automático desde `master`) |
| Cron | Vercel Cron Jobs (diario 8:00 AM CDMX) |
| Compilador | React Compiler + Turbopack (desarrollo) |

---

## Arquitectura

```
sii-itc-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/               # Pantalla de inicio de sesión
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Layout compartido — importa sii-design.css y StudentProvider
│   │   │   ├── dashboard/           # Inicio
│   │   │   ├── perfil/              # Perfil del estudiante
│   │   │   ├── calificaciones/      # Calificaciones por periodo
│   │   │   ├── kardex/              # Kardex académico
│   │   │   ├── horarios/            # Horario de clases
│   │   │   ├── calendario/          # Calendario + notificaciones
│   │   │   └── proyeccion/          # Proyección de calificaciones
│   │   ├── api/
│   │   │   └── cron/notificar/      # Endpoint del cron de correos
│   │   ├── globals.css              # Reset mínimo (sin Tailwind)
│   │   └── layout.tsx               # Root layout
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardShell.tsx   # Topbar + sidebar wrapper
│   │   │   ├── Sidebar.tsx          # Navegación lateral
│   │   │   └── StudentProvider.tsx  # Auth guard + contexto global de estudiante
│   │   └── ui/
│   │       └── Icons.tsx            # Íconos SVG inline
│   ├── lib/
│   │   ├── api/
│   │   │   ├── auth.ts              # Login / logout
│   │   │   └── estudiante.ts        # Calificaciones, kardex, horarios, perfil
│   │   ├── auth/
│   │   │   └── session.ts           # Token en sessionStorage + timer de inactividad
│   │   ├── context/
│   │   │   └── StudentContext.tsx   # Contexto global: student, searchQuery
│   │   ├── data/
│   │   │   └── calendario-academico.ts  # Eventos oficiales TecNM Ene–Jun 2026
│   │   └── supabase/
│   │       └── client.ts            # Cliente Supabase con anon key
│   ├── styles/
│   │   └── sii-design.css           # Sistema de diseño completo
│   └── types/
│       ├── api.ts                   # Tipos de la API del SII
│       └── calendario.ts            # Tipos de eventos y notificaciones
├── supabase/
│   └── migrations/
│       └── 20260427_calendario.sql  # Tablas: calendario_eventos, notificaciones_config
└── vercel.json                      # Configuración de Cron Jobs
```

### Flujo de autenticación

```
/login → POST /api/sii/movil/login
       ↓ token guardado en sessionStorage
/dashboard → StudentProvider verifica token
           → getEstudiante() → contexto global disponible en toda la app
           → 7 min sin actividad → clearToken() → /login
           → cerrar pestaña   → sessionStorage limpio → /login al volver
```

### Proxy CORS

Las llamadas al SII pasan por un rewrite de Next.js para evitar problemas de CORS:

```
Navegador → /api/sii/:path* → next.config.ts rewrite → sii.celaya.tecnm.mx/api/:path*
```

La API del SII devuelve HTTP 200 en todos los casos. El estado real (éxito o error) está en `data.status` del JSON de respuesta.

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
# Supabase — disponibles en cliente y servidor
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Solo servidor — cron de notificaciones (nunca exponer al cliente)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Token secreto para proteger el endpoint del cron
# Genera uno con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CRON_SECRET=<token-aleatorio-seguro>

# Resend — servicio de envío de correos (resend.com)
RESEND_API_KEY=re_...

# URL de producción — necesaria para llamadas SSR en Vercel
NEXT_PUBLIC_APP_URL=https://sii-itc-app.vercel.app
```

> Las variables `NEXT_PUBLIC_*` se hornean en el bundle en tiempo de build.
> Cualquier cambio en estas variables requiere un redeploy.

---

## Base de datos (Supabase)

Ejecuta la migración en **Supabase Dashboard → SQL Editor → New Query**:

```sql
-- Contenido de supabase/migrations/20260427_calendario.sql
```

### Tabla `calendario_eventos`

Almacena los eventos personales creados por cada estudiante desde el calendario.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK autogenerado |
| `titulo` | TEXT | Nombre del evento |
| `descripcion` | TEXT | Descripción opcional |
| `fecha_inicio` | TIMESTAMPTZ | Fecha y hora de inicio |
| `fecha_fin` | TIMESTAMPTZ | Fecha y hora de fin (opcional) |
| `numero_control` | TEXT | Número de control del estudiante |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

### Tabla `notificaciones_config`

Almacena las preferencias de notificación por correo de cada estudiante.

| Columna | Tipo | Descripción |
|---|---|---|
| `numero_control` | TEXT | PK — número de control |
| `email` | TEXT | Correo destino |
| `activo` | BOOLEAN | Notificaciones habilitadas |
| `dias_anticipacion` | INTEGER | Días de anticipación: 1, 3 o 7 |
| `categorias` | TEXT[] | Categorías seleccionadas para notificar |

RLS habilitado en ambas tablas con políticas abiertas para `anon`. El control de acceso
lo gestiona la aplicación filtrando siempre por `numero_control`.

---

## Notificaciones por correo

El cron se ejecuta todos los días a las **14:00 UTC (08:00 AM CDMX)** mediante Vercel Cron Jobs
(configurado en `vercel.json`).

### Flujo

1. Vercel invoca `GET /api/cron/notificar` con header `Authorization: Bearer <CRON_SECRET>`
2. El endpoint consulta `notificaciones_config` donde `activo = true`
3. Para cada suscriptor, filtra los eventos de `EVENTOS_ACADEMICOS` dentro de su ventana de `dias_anticipacion`
4. Envía un correo HTML estilizado vía Resend con los eventos próximos

### Probar manualmente (PowerShell)

```powershell
$headers = @{ "Authorization" = "Bearer <CRON_SECRET>" }
Invoke-WebRequest -Uri "https://sii-itc-app.vercel.app/api/cron/notificar" -Headers $headers
```

Respuesta esperada si hay suscriptores activos con eventos próximos:
```json
{ "enviados": 1, "total": 1 }
```

### Categorías de eventos

| Categoría | Descripción |
|---|---|
| `evaluacion` | Exámenes parciales y finales |
| `suspension` | Días sin clases |
| `academico` | Inscripciones y períodos académicos |
| `evento` | Eventos institucionales |
| `vinculacion` | Actividades de vinculación |

---

## Desarrollo local

### Requisitos

- Node.js 20+
- npm 10+

### Instalación

```bash
git clone https://github.com/DoctourDot18Pup/sii-itc-app.git
cd sii-itc-app
npm install
```

Crea `.env.local` con las variables descritas arriba y ejecuta:

```bash
npm run dev
```

La app quedará disponible en `http://localhost:3000`.

El script levanta en `0.0.0.0` para permitir acceso desde otros dispositivos en la misma red
(útil para probar en móvil durante el desarrollo).

### Notas importantes

- **Turbopack** está habilitado solo en `development`. En producción se usa el compilador estándar de Next.js.
- El proxy CORS funciona igual en local y en producción sin cambios de configuración.
- En local, `NEXT_PUBLIC_APP_URL` no es necesaria — usa `http://localhost:3000` por defecto.
- El token del SII se almacena en `sessionStorage`, por lo que no persiste entre pestañas ni reinicios del navegador.

---

## Deploy en Vercel

1. Importa el repositorio en [vercel.com](https://vercel.com) → **Add New → Project**
2. Selecciona el repositorio `sii-itc-app` de GitHub
3. En **Environment Variables**, agrega todas las variables de `.env.local`
4. Haz click en **Deploy** — Vercel detecta Next.js automáticamente
5. Una vez desplegado, agrega también `NEXT_PUBLIC_APP_URL` con la URL asignada y haz **Redeploy**

Cada push a `master` dispara un redeploy automático. Los Cron Jobs se registran automáticamente al desplegar gracias a `vercel.json`.

---

## Licencia

Proyecto académico de uso personal. No está afiliado ni respaldado oficialmente por el TecNM.

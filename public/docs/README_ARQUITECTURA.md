# README â€” Arquitectura TÃ©cnica
## Portafolio Ãmbar Centeno

Ãšltima actualizaciÃ³n: 2026-08-03

---

## 1. Stack tecnolÃ³gico

| Capa | TecnologÃ­a | Por quÃ© |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Deploy nativo en Vercel, API routes server-side, un solo lenguaje (TS) igual que el stack de Nomed |
| Estilos | Tailwind CSS | Instalado por defecto con create-next-app; se usa principalmente en el panel admin. El sitio pÃºblico replica los estilos inline del HTML original de Claude Design |
| Base de datos | Supabase (Postgres) | Plan gratuito generoso, SQL relacional, RLS nativo, Storage integrado |
| Storage de archivos | Supabase Storage | Mismo proyecto que la DB, un solo set de credenciales, polÃ­ticas RLS unificadas |
| Hosting | Vercel | Deploy automÃ¡tico vÃ­a GitHub, gratis, hecho para Next.js |
| Auth admin | Password simple + JWT firmado (cookie httpOnly) | Caso de uso de bajo riesgo (portafolio personal), sin necesidad de Supabase Auth completo |
| Drag & drop | @dnd-kit | Reordenar listas en el panel admin |

**Costo total de infraestructura: $0/mes**, dentro de los lÃ­mites de los planes gratuitos de Supabase y Vercel.

---

## 2. Estructura de carpetas del proyecto

```
ambar-portafolio/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ page.tsx                    â†’ sitio pÃºblico (Home)
â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”œâ”€â”€ globals.css
â”‚   â”œâ”€â”€ admin/
â”‚   â”‚   â”œâ”€â”€ page.tsx                 â†’ login
â”‚   â”‚   â””â”€â”€ dashboard/
â”‚   â”‚       â””â”€â”€ page.tsx              â†’ panel de ediciÃ³n
â”‚   â””â”€â”€ api/
â”‚       â”œâ”€â”€ portfolio/route.ts        â†’ GET pÃºblico, todo el JSON armado
â”‚       â”œâ”€â”€ auth/
â”‚       â”‚   â”œâ”€â”€ login/route.ts
â”‚       â”‚   â”œâ”€â”€ logout/route.ts
â”‚       â”‚   â””â”€â”€ session/route.ts
â”‚       â””â”€â”€ admin/
â”‚           â”œâ”€â”€ perfil/route.ts
â”‚           â”œâ”€â”€ herramientas-uso/route.ts
â”‚           â”œâ”€â”€ trayectoria/route.ts
â”‚           â”œâ”€â”€ skills-resumen/route.ts
â”‚           â”œâ”€â”€ formacion-sobre-mi/route.ts
â”‚           â”œâ”€â”€ destacados/route.ts
â”‚           â”œâ”€â”€ proyectos/
â”‚           â”‚   â”œâ”€â”€ route.ts
â”‚           â”‚   â””â”€â”€ [id]/
â”‚           â”‚       â”œâ”€â”€ route.ts
â”‚           â”‚       â”œâ”€â”€ tags/route.ts
â”‚           â”‚       â””â”€â”€ media/route.ts
â”‚           â”œâ”€â”€ skill-categorias/route.ts
â”‚           â”œâ”€â”€ skills/route.ts
â”‚           â”œâ”€â”€ formacion-academica/route.ts
â”‚           â”œâ”€â”€ idiomas/route.ts
â”‚           â”œâ”€â”€ certificaciones/route.ts
â”‚           â””â”€â”€ upload/route.ts
â”œâ”€â”€ lib/
â”‚   â””â”€â”€ supabase/
â”‚       â”œâ”€â”€ client.ts                  â†’ cliente navegador (anon key)
â”‚       â”œâ”€â”€ server.ts                  â†’ cliente Server Components (anon key)
â”‚       â””â”€â”€ admin.ts                   â†’ cliente backend (service_role key, SOLO en app/api/)
â”œâ”€â”€ public/
â”‚   â””â”€â”€ docs/
â”‚       â””â”€â”€ Portafolio Ãmbar Centeno (standalone).html   â†’ fuente de verdad del diseÃ±o visual
â”œâ”€â”€ .env.local                          â†’ nunca se sube a git
â””â”€â”€ README_ARQUITECTURA.md, README_PLANIFICACION.md, README_DISEÃ‘O.md
```

---

## 3. Modelo de datos (Supabase / Postgres)

Todas las tablas usan `id uuid primary key default gen_random_uuid()`.

### 3.1 Perfil (fila Ãºnica)

```sql
perfil
  nombre, titulo, especialidad
  bio_titulo, bio_texto, foto_url, cv_url
  email, whatsapp_numero, linkedin_url, instagram_url
  ubicacion_corta            -- "Arequipa, PerÃº Â· Remoto"
  mensaje_contacto
  updated_at
```

### 3.2 SecciÃ³n "Sobre mÃ­"

```sql
herramientas_uso        -- "Tools I Use": chips simples
  nombre, orden

trayectoria              -- "Journey": Nomed, CREAD, Freelance
  empresa_o_contexto     -- "Nomed"
  rol                    -- "Design, Product & QA Lead"
  fecha_inicio           -- "2026"
  fecha_fin              -- "2027" o NULL si continúa actualmente
  color_punto            -- hex, elegido por Ãmbar vÃ­a color picker
  orden

Los campos separan empresa o contexto, rol específico y rango de fechas porque el diseño original combina esos 3 datos en una sola línea visual. Mantenerlos separados evita inconsistencias de formato cuando Ámbar edita el contenido.

skills_resumen           -- chips cortos: Graphic Design, Applied AI...
  nombre
  destacado              -- true = estilo especial (gradiente), ej "Applied AI"
  orden

formacion_sobre_mi        -- lista corta con expand/collapse ("See more")
  institucion, programa
  visible_por_defecto     -- false = queda oculto detrÃ¡s del toggle
  orden
```

**Nota importante:** `skills_resumen` (Sobre mÃ­) y `skill_categorias`/`skills` (secciÃ³n grande "Habilidades y herramientas") son **listas independientes**, confirmado explÃ­citamente â€” no comparten datos.

### 3.3 Trabajos recientes (destacados)

```sql
proyectos_destacados
  titulo, etiqueta, cliente
  media_url, media_tipo    -- 'imagen' | 'video'
  orden
  created_at, updated_at
```

Sin descripciÃ³n larga ni galerÃ­a â€” es contenido puramente visual, sin modal de detalle.

### 3.4 Proyectos (empresa + independiente)

```sql
proyectos
  titulo, categoria         -- 'empresa' | 'independiente'
  cliente_o_rol, descripcion_corta
  link_url                  -- opcional, "Agrega aquÃ­ el link del sitio o proyecto"
  orden
  created_at, updated_at

proyecto_tags               -- mÃºltiples por proyecto (Branding, Producto, QA...)
  proyecto_id (fk)
  nombre, orden

proyecto_media               -- galerÃ­a; su cantidad define el layout de la tarjeta
  proyecto_id (fk)
  tipo                       -- 'imagen' | 'video'
  url, thumbnail_url
  orden                       -- crÃ­tico: define orden en grid Y en navegaciÃ³n del modal
```

El frontend adapta el recorte visual de la tarjeta segÃºn cuÃ¡ntos Ã­tems tenga `proyecto_media` (1, 2, 3, o 4+ con overlay "+N"), replicando la lÃ³gica ya presente en el HTML original (`isTriple`, `isQuadPlus`, `hasMore`).

### 3.5 Habilidades y herramientas (secciÃ³n grande)

```sql
skill_categorias    -- libres: Ãmbar puede crear/eliminar cuantas quiera
  nombre, descripcion, orden

skills               -- tags dentro de cada categorÃ­a
  categoria_id (fk)
  nombre, orden
```

El badge "EN CRECIMIENTO" **no vive en la base de datos** â€” es una condiciÃ³n fija en el frontend, activa solo cuando `skill_categorias.nombre === 'IA aplicada al diseÃ±o'`.

### 3.6 FormaciÃ³n y certificaciones (secciÃ³n grande)

```sql
formacion_academica
  institucion, programa, estado, nota
  fecha_inicio, fecha_fin, orden

idiomas
  idioma, nivel, orden

certificaciones
  nombre, institucion, fecha, orden
```

### 3.7 Datos que NO estÃ¡n en la base de datos (fijos en cÃ³digo)

- Los 4 nÃºmeros de la banda de estadÃ­sticas ("5+ aÃ±os de experiencia", "10+ empresas y clientes", "15+ herramientas y habilidades", "8 certificaciones en IA") â€” decisiÃ³n explÃ­cita, quedan hardcodeados en el componente.
- El badge "EN CRECIMIENTO" de skill_categorias.

---

## 4. Supabase Storage

**Un solo bucket, pÃºblico, organizado por carpetas:**

```
Bucket: portfolio-media

/perfil/
  foto-{timestamp}.jpg
  cv-{timestamp}.pdf

/destacados/
  {proyecto_destacado_id}.jpg   (o .mp4)

/proyectos/
  {proyecto_id}/
    {media_id}.jpg   (o .mp4)
    {media_id}-thumb.jpg   (thumbnail de video)
```

Nombres de archivo generados por el backend (uuid/timestamp), nunca el nombre original subido por el usuario (evita colisiones y problemas de caracteres especiales).

**PolÃ­tica RLS de storage.objects:**
```sql
create policy "Lectura pÃºblica portfolio-media"
on storage.objects for select
using (bucket_id = 'portfolio-media');
```
Sin polÃ­ticas de INSERT/UPDATE/DELETE â€” toda escritura pasa por el backend con la service_role key.

**LÃ­mites de tamaÃ±o (validados en la API, no en Supabase):**
- ImÃ¡genes: mÃ¡x 5MB (jpg, png, webp)
- Videos: mÃ¡x 20-25MB (mp4)
- CV: mÃ¡x 10MB (pdf)

---

## 5. RLS (Row Level Security)

Todas las 12 tablas de contenido tienen:
- RLS activado
- Una polÃ­tica `for select using (true)` â†’ lectura pÃºblica total
- **Ninguna** polÃ­tica de INSERT/UPDATE/DELETE â†’ la anon/publishable key nunca puede escribir

La `service_role` key (usada exclusivamente dentro de `app/api/`) **ignora RLS por completo** â€” es el Ãºnico camino de escritura.

---

## 5.1 Nota importante: RLS Policy vs. GRANT (lecciÃ³n aprendida)

Al crear tablas directamente por SQL Editor (en vez de usar el Table Editor 
visual de Supabase), las polÃ­ticas de RLS por sÃ­ solas NO son suficientes 
para permitir lectura pÃºblica. Postgres tiene dos capas de seguridad 
independientes:

1. **GRANT** â€” permiso base de PostgreSQL que dice "el rol `anon` puede 
ejecutar SELECT en esta tabla". Sin esto, cualquier query falla con 
`permission denied for table X` (cÃ³digo de error 42501), sin importar 
que existan policies de RLS.
2. **RLS Policy** â€” una vez que el GRANT permite el acceso a la tabla, 
RLS filtra CUÃLES filas especÃ­ficas puede ver ese rol.

El Table Editor visual de Supabase otorga el GRANT automÃ¡ticamente al crear 
una tabla. Al crear tablas por SQL directo, este paso NO ocurre solo â€” hay 
que otorgarlo explÃ­citamente:

```sql
grant usage on schema public to anon, authenticated;
grant select on public.nombre_tabla to anon, authenticated;
```

**Regla para el futuro:** cualquier tabla nueva que se cree por SQL directo 
en este proyecto debe recibir tanto su policy de RLS como su GRANT de 
SELECT correspondiente â€” ambos son necesarios, ninguno sustituye al otro.

---

## 5.2 Nota adicional: GRANT también es necesario para service_role

Se descubrió que, al crear tablas por SQL directo (no por el Table Editor visual), el rol `service_role` tampoco recibe automáticamente sus permisos de escritura (INSERT/UPDATE/DELETE) - a diferencia del comportamiento esperado en Supabase, donde `service_role` normalmente tiene bypass total. Fue necesario otorgar explícitamente:

```sql
grant insert, update, delete, select on public.nombre_tabla to service_role;
```

en las 14 tablas del proyecto. Además, se identificó un error de operador: al copiar la API key legacy desde el dashboard de Supabase, es fácil confundir la fila "anon" con la fila "service_role" (ambas empiezan igual visualmente como JWT largo). Para verificar cuál se está usando realmente, se puede decodificar el payload del JWT (la segunda sección separada por puntos, en base64) sin necesidad de conectarse a ningún servidor:

```javascript
const payload = key.split('.')[1]
const decoded = Buffer.from(payload, 'base64').toString('utf8')
// decoded contendrá algo como {"role":"service_role",...}
```

**Regla para el futuro:** cualquier tabla nueva creada por SQL directo necesita 3 cosas, no solo 2: (a) RLS activado, (b) policy de lectura pública, y (c) GRANT explícito de SELECT/INSERT/UPDATE/DELETE tanto para anon/authenticated (solo SELECT) como para service_role (todos).

---
## 6. AutenticaciÃ³n del panel admin

No se usa Supabase Auth. En su lugar:

1. Ãmbar escribe la contraseÃ±a en `/admin`
2. `POST /api/auth/login` compara contra `process.env.ADMIN_PASSWORD`
3. Si coincide, se firma un JWT simple con `jose` usando `process.env.JWT_SECRET`, y se setea como cookie `httpOnly`
4. Cada request a `/api/admin/*` valida esa cookie antes de ejecutar la operaciÃ³n
5. `POST /api/auth/logout` borra la cookie

**LimitaciÃ³n conocida y aceptada:** una contraseÃ±a fija no es un sistema de auth robusto â€” es aceptable porque el peor escenario (alguien edita el portafolio sin permiso) no compromete datos sensibles ni dinero. Si el proyecto crece, migrar a Supabase Auth es directo.

---

## 7. Endpoints

### PÃºblicos
```
GET /api/portfolio    â†’ JSON completo armado en el backend (perfil + todas las secciones anidadas)
```

### Auth
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/session
```

### Admin (todos protegidos por cookie de sesiÃ³n)
```
PUT    /api/admin/perfil

GET/POST/PUT/DELETE   /api/admin/herramientas-uso[/:id]
GET/POST/PUT/DELETE   /api/admin/trayectoria[/:id]
GET/POST/PUT/DELETE   /api/admin/skills-resumen[/:id]
GET/POST/PUT/DELETE   /api/admin/formacion-sobre-mi[/:id]
GET/POST/PUT/DELETE   /api/admin/destacados[/:id]

GET/POST/PUT/DELETE   /api/admin/proyectos[/:id]
POST/DELETE           /api/admin/proyectos/:id/tags[/:tagId]
POST/DELETE           /api/admin/proyectos/:id/media[/:mediaId]

GET/POST/PUT/DELETE   /api/admin/skill-categorias[/:id]
POST/PUT/DELETE        /api/admin/skills[/:id]

GET/POST/PUT/DELETE   /api/admin/formacion-academica[/:id]
GET/POST/PUT/DELETE   /api/admin/idiomas[/:id]
GET/POST/PUT/DELETE   /api/admin/certificaciones[/:id]

POST /api/admin/upload    â†’ sube archivo a Storage, devuelve URL pÃºblica

PUT  /api/admin/{recurso}/reorder   â†’ recibe array de IDs en nuevo orden, actualiza `orden` en bloque
```

`/api/portfolio` internamente usa sintaxis de Supabase con joins anidados para traer proyectos con sus tags y media en una sola consulta:

```javascript
const { data } = await supabase
  .from('proyectos')
  .select(`*, proyecto_tags (*), proyecto_media (*)`)
  .order('orden')
```

---

## 8. Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xleetoiipbekdasojaxg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
ADMIN_PASSWORD=...
JWT_SECRET=...
```

Mismas 5 variables configuradas tanto en `.env.local` (desarrollo) como en Vercel â†’ Project Settings â†’ Environment Variables (producciÃ³n).

---

## 9. Estado actual de la infraestructura (checklist vivo)

- [x] Proyecto Next.js creado (TypeScript + Tailwind + App Router)
- [x] Dependencias instaladas
- [x] Proyecto Supabase creado
- [x] Bucket `portfolio-media` creado (pÃºblico)
- [x] 12 tablas creadas
- [x] RLS + polÃ­ticas de lectura pÃºblica (tablas)
- [x] RLS + polÃ­tica de lectura pÃºblica (storage)
- [x] `.env.local` completo
- [ ] Clientes de Supabase (`lib/supabase/*.ts`)
- [x] Endpoint `/api/portfolio`
- [x] VerificaciÃ³n end-to-end: /api/portfolio responde 200 con estructura JSON correcta (confirmado 2026-08-03)
- [x] CRUD de "perfil" completo y verificado (backend + formulario visual)
- [ ] Sistema de auth admin
- [ ] Endpoints CRUD admin
- [ ] Endpoint de upload
- [ ] PÃ¡gina pÃºblica (traducciÃ³n del HTML de Claude Design a componentes)
- [ ] Panel admin (formularios + drag&drop)
- [ ] Deploy a Vercel


# README — Planificación
## Portafolio Ámbar Centeno

Última actualización: 2026-08-03

Este documento registra **por qué** se tomó cada decisión (no el detalle técnico, que vive en README_ARQUITECTURA.md), qué queda pendiente, y el orden de construcción recomendado.

---

## 1. Objetivo del proyecto

Un portafolio web para Ámbar Centeno (Design & Operations Coordinator en Nomed) que:
- Sirve como landing pública para compartir en LinkedIn
- Permite que Ámbar edite su propio contenido (proyectos, fotos, bio, skills) sin tocar código
- No genera costos de infraestructura (hosting, dominio, base de datos)

Dos superficies:
- **Público** (`/`) — lo que ve cualquier visitante
- **Admin** (`/admin`) — donde Ámbar edita, protegido por contraseña

---

## 2. Decisiones tomadas y su razonamiento

| Decisión | Alternativas consideradas | Por qué se eligió esta |
|---|---|---|
| Next.js + Vercel | HTML/JS vanilla + funciones sueltas | Next.js da API routes, routing y deploy integrados sin fricción; vanilla obliga a reconstruir a mano lo que el framework ya resuelve |
| Supabase (Postgres) | Firebase (Firestore), JSON+GitHub como CMS | Postgres relacional encaja mejor con datos estructurados (proyectos con tags y galerías); Firebase también era válido pero Supabase unifica DB + Storage + Auth en un solo lugar con SQL familiar |
| Supabase Storage (no Cloudinary) | Cloudinary, Vercel Blob | Mismo proyecto que la DB, mismas credenciales, políticas RLS unificadas. Cloudinary da mejor optimización automática pero añade una cuenta/dashboard más a mantener — no justificado para el volumen de este proyecto |
| Password simple + JWT (no Supabase Auth) | Supabase Auth con email/Google | Un solo usuario (Ámbar), sin necesidad de gestión de cuentas. Trade-off aceptado: menos seguro que un login real, pero proporcional al riesgo (portafolio personal, no datos sensibles) |
| Videos alojados directo en Supabase Storage (no YouTube embed) | Embeber desde YouTube/Vimeo | Con solo 4 videos cortos (~30-60s, bien comprimidos ≈30-50MB total), el consumo de cuota gratis es marginal. YouTube evitaría el gasto de cuota pero añade fricción (subir en dos lugares, gestionar dos flujos) no justificada para este volumen |
| Un bucket con carpetas (no un bucket por sección) | Bucket separado por sección (perfil/destacados/proyectos) | La validación de tipo/tamaño de archivo vive en el backend (API routes), no en la configuración de Supabase — así que un solo bucket no pierde control. Menos superficie de configuración que mantener |
| `proyectos_destacados` y `proyectos` como tablas separadas | Una sola tabla con flag `destacado` | Confirmado explícitamente: son contenido distinto, no un subconjunto de lo mismo. `proyectos_destacados` no tiene descripción larga ni galería — es más simple, sin necesidad de campos opcionales que no aplican |
| `skills_resumen` y `skill_categorias`/`skills` como listas independientes | Unificar en una sola fuente | Confirmado explícitamente: son dos secciones con propósito distinto en el diseño (chips rápidos en "Sobre mí" vs. categorías extensas en "Habilidades y herramientas") |
| Reordenamiento vía endpoint `/reorder` con array completo de IDs | PUT individual por ítem con campo `orden` | Atomicidad: un drag&drop que reordena 5 ítems necesita 1 sola llamada, no 5. Además coincide con cómo las librerías de drag&drop (`@dnd-kit`) entregan el resultado ya reordenado |
| `/api/portfolio` como un solo endpoint que arma el JSON en el backend | Múltiples llamadas sueltas desde el frontend | Menos round-trips = carga más rápida para un visitante desde LinkedIn. Supabase permite joins anidados en una sola consulta por tabla relacionada |
| Badge "EN CRECIMIENTO" fijo en código, no en la DB | Campo editable en `skill_categorias` | Es un dato no editable (exclusivo de una categoría), forzarlo a la DB añade complejidad sin necesidad real |
| Stats de la banda morada (5+, 10+, 15+, 8) fijos en código | Campos editables en `perfil` | Decisión explícita de Ámbar/Oscar: no requieren edición frecuente, mantenerlos en código simplifica el modelo |
| `trayectoria.color_punto` editable por Ámbar | Colores fijos/auto-rotados | Se pidió explícitamente una interfaz con color picker intuitivo, acorde a la identidad visual del sitio |
| Confirmación modal antes de eliminar cualquier ítem | Confirmación inline con temporizador, o eliminar sin confirmación | Un modal es más claro y evita clicks accidentales que borren datos de forma irreversible; el proyecto ya tiene múltiples listas editables (trayectoria, formacion_sobre_mi, skills, proyectos, etc.) donde un borrado accidental sería molesto de recuperar |

---

## 2.1 Regla de UX: confirmación antes de eliminar

Cualquier acción de "eliminar" en el panel admin (sin excepción, en 
cualquier sección: trayectoria, formacion_sobre_mi, skills, proyectos, 
proyectos_destacados, etc.) debe mostrar un modal de confirmación antes de 
ejecutar el DELETE, con:
- Un mensaje claro indicando qué se va a eliminar (idealmente mencionando 
  el nombre/título específico del ítem, no un genérico "¿Eliminar este 
  ítem?")
- Botón "Cancelar" (acción por defecto/segura)
- Botón "Eliminar" en color de advertencia (rojo o similar), como acción 
  secundaria visualmente diferenciada

Esta regla se aplica retroactivamente a TagInput.tsx y TrayectoriaList.tsx 
(que actualmente eliminan sin confirmar), y debe incluirse en cualquier 
componente de lista editable construido de ahora en adelante.

## 3. Preguntas cerradas durante el proceso (registro histórico)

- ¿Login con auth real o password fija? → **Password fija**, con las salvedades de seguridad ya documentadas
- ¿Experiencia laboral y educación en la misma tabla? → Se evaluó, pero terminó resuelto de forma distinta: `trayectoria` (Sobre mí) y `formacion_academica` (sección grande) son conceptualmente separados por tener campos distintos (una no necesita "nota de beca", la otra no necesita "cargo")
- ¿Proyectos empresa/independiente en la misma tabla? → Sí, con campo `categoria`
- ¿Videos de hasta 30s-1min soportados? → Sí, alojados directo en Supabase Storage, con advertencia de peso al subir

## 4. Preguntas abiertas / pendientes de definir

- **Habilidades y herramientas (categorías)**: CONFIRMADO DESCARTADO. Las tablas `skill_categorias` y `skills` fueron creadas en el schema original pero la sección correspondiente ya no existe en el diseño. Pendiente: decidir si se eliminan esas tablas de Supabase o se dejan sin uso (no se construirá su CRUD ni su UI).

- **Cursos y certificaciones**: CONFIRMADO que existe en el diseño final, pero el diseño visual específico de esta sección aún no está definido ni exportado a HTML. Las tablas `formacion_academica`, `idiomas` y `certificaciones` existen en el schema original con una estructura tentativa, pero NO se construirá su CRUD ni UI hasta contar con el diseño real — construir ahora arriesga tener que rehacer el trabajo (como ya pasó con `trayectoria`, que tuvo que migrarse tras revisar el HTML real). Cuando el diseño esté disponible, revisar si la estructura tentativa (`institucion/programa/estado/nota/fechas` para `formacion_academica`; `idioma/nivel` para `idiomas`; `nombre/institucion/fecha` para `certificaciones`) sigue siendo válida antes de construir.

---

## 5. Roadmap de implementación (orden recomendado)

La lógica de orden: primero lo que no depende de nada (infraestructura base), luego lo que permite *verificar* que la infraestructura funciona (un endpoint simple), luego el resto en paralelo posible pero secuencial por simplicidad.

### Fase 0 — Infraestructura (COMPLETADA)
- [x] Proyecto Next.js + dependencias
- [x] Proyecto Supabase + bucket + tablas + RLS

### Fase 1 — Capa de datos en código
- [ ] `lib/supabase/client.ts`, `server.ts`, `admin.ts`
- [ ] Endpoint `GET /api/portfolio` (de solo lectura, sin auth) — sirve para verificar que toda la cadena Supabase → Next.js funciona antes de construir nada visual
- [ ] Insertar un dato de prueba manual en Supabase (ej. un registro en `perfil`) y confirmar que `/api/portfolio` lo devuelve

### Fase 2 — Autenticación admin
- [ ] `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session`
- [ ] Página `/admin` con formulario de password
- [ ] Middleware/verificación que protege rutas `/api/admin/*` y `/admin/dashboard`

### Fase 3 — CRUD admin (por sección, de más simple a más compleja)
Orden sugerido por complejidad creciente:
1. `perfil` (un solo registro, solo UPDATE)
2. `herramientas_uso`, `skills_resumen` (listas simples de texto)
3. `trayectoria` (lista + color picker)
4. `formacion_sobre_mi` (lista + toggle visible/oculto)
5. `skill_categorias` + `skills` (relación padre-hijo) — DESCARTADO, sección removida del diseño final
6. `formacion_academica`, `idiomas`, `certificaciones` (listas independientes, sin relaciones) — EN PAUSA hasta contar con el diseño visual de esta sección, ver sección 4 de este documento
7. `proyectos_destacados` (con upload de un solo archivo)
8. `proyectos` + `proyecto_tags` + `proyecto_media` (la más compleja: relación con galería de múltiples archivos y tags)
- [ ] Modal de confirmación de eliminación implementado de forma consistente en todas las listas editables

### Fase 4 — Upload de archivos
- [ ] `POST /api/admin/upload` con validación de tipo/tamaño
- [ ] Integrar el upload en los formularios de la Fase 3 (perfil, destacados, proyectos)

### Fase 5 — Reordenamiento (drag&drop)
- [ ] Endpoints `/reorder` para cada lista reordenable
- [ ] Integrar `@dnd-kit` en las listas del admin

### Fase 6 — Sitio público
- [ ] Traducir el HTML de Claude Design (`public/docs/Portafolio Ámbar Centeno (standalone).html`) a componentes React que consuman `/api/portfolio`
- [ ] Reemplazar cada dato hardcodeado del HTML original por su fuente dinámica correspondiente
- [ ] Verificar responsive (breakpoints ya definidos en el CSS original, `@media(max-width:900px)`)

### Fase 7 — Deploy
- [ ] Repo en GitHub
- [ ] Proyecto en Vercel + variables de entorno
- [ ] Verificar build de producción
- [ ] Prueba end-to-end: Ámbar edita algo en `/admin`, se refleja en el sitio público

---

## 6. Notas de proceso (SDD / vibe coding)

Este proyecto sigue un enfoque donde cada pieza de código se implementa contra una especificación ya validada (este set de 3 READMEs), no contra descripciones ad-hoc en el momento. Antes de escribir código para cualquier fase, se debe:

1. Confirmar que la fase anterior está completa y probada
2. Revisar si la especificación en README_ARQUITECTURA.md sigue vigente (si el diseño cambió, actualizar primero el modelo de datos aquí)
3. Solo entonces generar el código de la fase correspondiente

Cuando el HTML de diseño (`public/docs/Portafolio Ámbar Centeno (standalone).html`) se actualice con cambios de Claude Design, ese archivo debe re-analizarse contra README_ARQUITECTURA.md antes de tocar componentes ya construidos, para detectar si introduce campos de datos nuevos no contemplados.

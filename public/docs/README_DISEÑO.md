# README — Diseño Visual
## Portafolio Ámbar Centeno

Última actualización: 2026-08-05 — REDISEÑO COMPLETO documentado

---

## ⚠️ AVISO: el diseño cambió por completo respecto a la versión anterior

La versión anterior de este documento describía un diseño con paleta morado/
azul/rosa (gradientes vibrantes, blobs decorativos). **Ese diseño fue 
reemplazado en su totalidad** por un rediseño de estética minimalista tipo 
Apple: fondo blanco/negro puro, azul de acento único (`#0071e3`), tipografía 
serif itálica (Piazzolla) combinada con sans-serif (Inter), sin gradientes 
decorativos ni blobs.

**Todo lo que sigue en este documento refleja EXCLUSIVAMENTE la versión 
vigente**, extraída y verificada directamente del código fuente del archivo 
HTML más reciente:

```
public/docs/Portafolio Ámbar Centeno (standalone) (2).html
```

Este archivo sigue siendo la fuente de verdad autoritativa. Este README es 
un resumen exhaustivo derivado de él — ante cualquier duda o discrepancia, 
el HTML manda.

---

## 1. Sistema de diseño — Fundamentos

### 1.1 Paleta de colores (verificada exhaustivamente, 14 colores hex + 11 rgba)

| Color | Uso |
|---|---|
| `#1A1A1A` | Negro principal — texto de títulos, fondos oscuros (nav CTA, banda de stats, footer) |
| `#FFFFFF` | Blanco puro — fondos de sección |
| `#F5F5F7` | Gris muy claro — fondos de sección alternos (Apple-style), fondos de botón secundario, placeholders de imagen |
| `#F5F5F5` | Gris claro alternativo |
| `#F0F0F0` | Gris claro (bordes/divisores) |
| `#E5E5E5` | Gris claro (bordes) |
| `#424245` | Gris oscuro — texto de párrafo/subtítulo |
| `#6e6e73` | Gris medio — texto de descripción secundaria |
| `#86868b` | Gris — labels, texto terciario, "eyebrow" text sobre títulos de sección |
| `#0071e3` | **Azul de acento único** (literalmente el azul de Apple) — links de acción tipo "See more", "Ver detalle" |
| `#FDFCFF` | Blanco con tinte violeta sutil (probablemente heredado, uso menor) |
| `#2a1215`, `#5c2b2e`, `#ff8a80` | Tonos rojizos — uso puntual, probablemente en algún estado de error o acento decorativo específico, verificar contexto exacto en el HTML si se usan |

**Rgba usados** (para overlays y sombras):
- `rgba(0,0,0,0.08)` a `rgba(0,0,0,0.75)` — overlays de imagen, sombras de tarjeta, fondo de modal
- `rgba(255,255,255,0.7)` a `rgba(255,255,255,0.9)` — texto sobre overlays oscuros, fondo de nav con blur

**IMPORTANTE:** este diseño **ya no usa gradientes morado→azul** ni los colores `#7C3AED`, `#60A5FA`, `#EC4899` de la versión anterior. Si algún componente ya construido usa esos colores (ej. el selector de paleta de `trayectoria.color_punto` en el admin), eso es intencional y vive solo en el panel de administración — no debe migrarse a esta paleta, son sistemas visuales independientes (admin vs. sitio público).

### 1.2 Tipografía

Dos familias, cargadas vía Google Fonts:
- **Piazzolla** (serif, siempre en **italic**, weight 600) — usada exclusivamente para títulos de sección, el nombre "Ámbar Centeno", números de la banda de stats, títulos de modal
- **Inter** (sans-serif) — todo el resto: párrafos, labels, botones, nav

### 1.3 Escala tipográfica completa (verificada)

| Tamaño (px) | Uso típico |
|---|---|
| 104 | Nombre en el Hero (`data-hero-name`) — **52px en mobile** |
| 64 | Números de la banda de stats (`data-stat-num`) — **36px en mobile** |
| 60 | Título "Hablemos." en contacto |
| 52 | Títulos de sección (h2): "Trabajos recientes", "Proyectos para empresas", "Certificaciones" |
| 44 | (uso puntual, verificar contexto en HTML) |
| 36 | (uso puntual) |
| 28 | Subtítulo del Hero (`data-hero-title`) — **20px en mobile** |
| 26 | Título dentro del modal de detalle |
| 22, 20, 19, 18 | Títulos de tarjeta (proyecto, certificación) |
| 17 | Texto de botón, párrafo de sección |
| 15 | Labels de stat (`data-stat-label`) — **12px en mobile** |
| 14, 13, 12, 11 | Texto secundario, badges/pills, nav links |

**Pesos usados:** 400 (regular), 500 (medium — la mayoría de labels/nav), 600 (semibold — títulos Piazzolla y algunos h3), 700 (bold, uso puntual)

**Letter-spacing:** `-0.015em` (títulos grandes, más apretado), `0.02em` (labels pequeños en mayúsculas, más abierto)

**Line-height:** rango de `1` (números de stat) a `1.7` (párrafos largos); `1.02` específicamente para el nombre del Hero.

### 1.4 Border-radius (sistema completo)

| Valor | Uso |
|---|---|
| `980px` | Botones tipo "pill" (Apple usa este valor específico, no `9999px` genérico) |
| `100px` | Alternativa pill (verificar cuál aplica exactamente dónde) |
| `28px` | Modal de detalle |
| `24px` | Tarjetas de proyecto/certificación, foto de perfil |
| `20px` | Imagen dentro del modal |
| `8px`, `6px` | Elementos pequeños |
| `50%` | Círculos (foto de perfil circular, botones de flecha del carrusel, botón cerrar modal) |
| `3px` | Detalle mínimo puntual |

### 1.5 Sombras y efectos

```css
[data-apple-card],[data-cert-card] { box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
```
Sombra suave y sutil, consistente en todas las tarjetas (proyectos, certificaciones).

**Backdrop blur** (efecto vidrio esmerilado, muy característico de este diseño):
```css
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
```
Usado en: la barra de navegación (fondo `rgba(255,255,255,0.8)`) y el overlay del modal (fondo `rgba(0,0,0,0.6)`).

### 1.6 Transiciones y animaciones

```css
[data-apple-card] { transition: transform .5s cubic-bezier(.16,1,.3,1), background-color .4s ease; }
[data-apple-card]:hover { transform: scale(1.015); }
[data-cert-card] { transition: transform .5s cubic-bezier(.16,1,.3,1); }
[data-cert-card]:hover { transform: scale(1.015); }
[data-cert-overlay] { opacity: 0; }
[data-cert-card]:hover [data-cert-overlay] { opacity: 1; }
@media(hover:none){ [data-cert-overlay]{ opacity: 1; } }  /* siempre visible en touch */

[data-apple-btn] { transition: opacity .3s ease, transform .3s cubic-bezier(.16,1,.3,1); }
[data-apple-btn]:hover { opacity: .82; }
[data-apple-btn]:active { transform: scale(0.97); }
```

El easing `cubic-bezier(.16,1,.3,1)` es un "ease-out" pronunciado característico de interfaces Apple — usarlo tal cual, no sustituir por `ease-in-out` genérico.

**Respeto a accesibilidad (ya incluido en el HTML, replicar):**
```css
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{ animation-duration:.01ms!important; transition-duration:.01ms!important; }
}
```

### 1.7 Responsive — Breakpoint único: 900px

Todo el responsive del sitio se maneja con un solo breakpoint (`max-width:900px`), usando atributos `data-*` como hooks de estilo (no clases). Reglas completas verificadas:

```css
@media(max-width:900px){
  [data-nav-links]{display:none!important}              /* oculta nav links en mobile */
  [data-hero-name]{font-size:52px!important}
  [data-hero-title]{font-size:20px!important}
  [data-hero-ctas]{flex-direction:column!important;align-items:stretch!important}
  [data-hero-contact]{flex-direction:column!important;align-items:flex-start!important}
  [data-company-grid],[data-indie-grid]{
    display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;
    padding-bottom:8px;scrollbar-width:none;grid-template-columns:none!important
  }
  [data-company-grid]::-webkit-scrollbar,[data-indie-grid]::-webkit-scrollbar{display:none}
  [data-company-grid]>*,[data-indie-grid]>*{flex:none!important;width:270px!important}
  [data-stat-band]{flex-wrap:nowrap!important;overflow-x:auto!important;justify-content:flex-start!important;gap:22px!important}
  [data-stat-band]>*{flex:none!important}
  [data-stat-num]{font-size:36px!important}
  [data-stat-label]{font-size:12px!important;white-space:nowrap;}
  [data-skills-row]{flex-direction:column!important}
  [data-about-grid]{flex-direction:column!important}
  [data-section-pad]{padding:96px 24px!important}
  [data-hero-pad]{padding:140px 24px 80px!important}
  [data-nav-pad]{padding:14px 20px!important}
  [data-carousel-pad]{padding:0 24px 24px!important}
  [data-contact-links]{flex-direction:column!important;align-items:flex-start!important}
}
```

En mobile, las grillas de proyectos (empresa/independiente) se convierten en **scroll horizontal tipo carrusel** en vez de apilarse verticalmente — comportamiento intencional a replicar, no un bug.

---

## 2. Estructura de secciones (orden real, con IDs de ancla)

```
nav (fixed, blur)
  #inicio        → Hero
  #sobre-mi      → Sobre mí (foto + bio + tools + journey + skills + education)
  (sin id)       → Banda de estadísticas (fondo negro)
  #recientes     → Trabajos recientes (carrusel)
  #empresas      → Proyectos para empresas (grid 3 columnas) + Proyectos independientes
  #certificaciones → Certificaciones (carrusel)
  #contacto      → Hablemos (CTA final)
footer
modal (overlay global, se abre desde proyectos/certificaciones)
```

Nav links exactos: `Recientes`, `Proyectos` (apunta a `#empresas`), `Certificaciones`, `Sobre mí`. Botón CTA: `Contáctame` (fondo negro, texto blanco, pill).

### 2.1 Nav

```css
position:fixed;top:0;left:0;right:0;z-index:100;
padding:20px 48px;  /* 14px 20px en mobile */
background:rgba(255,255,255,0.8);
backdrop-filter:blur(20px) saturate(180%);
```
Logo: `Ámbar.` en Piazzolla italic 19px 600, con el punto en gris `#999`.

### 2.2 Hero (`#inicio`)

- Altura: `min-height:100vh`
- Padding: `160px 48px 100px` (`140px 24px 80px` en mobile)
- Eyebrow text: "Portafolio profesional" — 14px, letter-spacing 0.02em, color `#86868b`
- Nombre: "Ámbar Centeno" — Piazzolla italic 104px/52px(mobile) 600, line-height 1.02, letter-spacing -0.015em
- Subtítulo: "Graphic & Digital Designer — Especialista en IA aplicada al diseño" — 28px/20px(mobile), color `#424245`
- CTAs: "Ver proyectos" (botón negro sólido → `#empresas`) y "Descargar CV" (botón gris `#F5F5F7` → descarga PDF real)

### 2.3 Sobre mí (`#sobre-mi`)

Layout: flex con foto (columna fija 400px, aspect-ratio 4/5, `border-radius:24px`) + contenido (bio, tools, journey, skills, education). En mobile pasa a columna única.

Incluye toggle "See more"/"See less" en la sección Education (`toggleEdu`), y comportamiento de expand/collapse con `max-height` animado (`transition:max-height .4s ease`) tanto en skills como en journey.

### 2.4 Banda de estadísticas (sin id)

Fondo negro `#1A1A1A`, padding `120px 48px`. 4 columnas (`justify-content:space-between`, wrap). En mobile: scroll horizontal (`overflow-x:auto`, sin wrap).

Números en Piazzolla italic 64px/36px(mobile) 600 color blanco; labels 15px/12px(mobile) color `#86868b`.

**Valores actuales (verificados en el HTML, coinciden con la decisión ya tomada de mantenerlos fijos en código):** "5+ años de experiencia", "10+ empresas y clientes", "15+ herramientas y habilidades", "8 certificaciones en IA".

### 2.5 Trabajos recientes (`#recientes`)

Carrusel horizontal con drag manual (`cursor:grab`, `data-carousel`), loop infinito (`loopedRecentWorks` triplica el array para el efecto de scroll continuo). Fondo blanco.

### 2.6 Proyectos para empresas (`#empresas`)

Fondo `#F5F5F7` (gris claro, distingue la sección). Grid de 3 columnas (`grid-template-columns:repeat(3,1fr)`, gap 24px) — en mobile, carrusel horizontal con tarjetas de ancho fijo 270px.

**Layout de galería variable por tarjeta — CRÍTICO, verificado exacto:**

```html
<!-- Cuando card.isTriple (3 imágenes) -->
<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:2px;aspect-ratio:4/3;">
  <div><!-- imagen 0, ocupa la columna ancha completa --></div>
  <div style="display:grid;grid-template-rows:1fr 1fr;gap:2px;">
    <div><!-- imagen 1 --></div>
    <div><!-- imagen 2 --></div>
  </div>
</div>
```

Cada celda de imagen es clickeable (`openAt0`, `openAt1`, `openAt2`) y abre el modal de detalle en esa imagen específica. Debajo de la galería: badge/pill (`pillLabel`), título (19px 600), subtítulo/cliente (14px 500 gris `#86868b`), descripción (14px color `#6e6e73`).

**Nota para implementación:** el HTML define explícitamente el caso `isTriple` (3 imágenes exactas con este layout 1.5fr+1fr). Para otras cantidades (1, 2, 4+), el patrón debe inferirse por analogía — revisar si el HTML define también `isDouble`/`isQuadPlus`/`hasMore` en el código fuente completo (ya se sabía de análisis previos que existen `isTriple`, `isQuadPlus`, `hasMore` — confirmar los layouts exactos de cada caso al implementar, replicando el mismo patrón visual de grid con gap:2px).

Botón "Ver más"/"Ver menos" si hay más de `cardLimit` proyectos (toggle de expand).

### 2.7 Proyectos independientes

Mismo patrón visual que empresas, grid separado (`data-indie-grid`), mismo comportamiento de expand/colapse independiente (`indieExpanded`, `indieToggleLabel`).

### 2.8 Certificaciones (`#certificaciones`)

Carrusel horizontal con drag (mismo patrón que "Recientes"), loop infinito (`loopedCertifications`). Fondo blanco. Eyebrow: "Formación continua".

**Estructura de cada tarjeta (verificada exacta):**
```html
<div data-cert-card style="{{ card.cardOuterStyle }}">  <!-- tamaño variable según aspectRatio -->
  <div style="position:absolute;inset:0;border-radius:24px;overflow:hidden;">
    <image-slot .../>  <!-- imagen de fondo, cubre toda la tarjeta -->
    <div data-cert-overlay style="
      position:absolute;left:0;right:0;bottom:0;padding:20px 22px 22px;
      background:linear-gradient(to top,rgba(0,0,0,0.75),rgba(0,0,0,0.35) 55%,transparent);
      transition:opacity .3s ease;">
      <!-- pill con año, título, institución (subtitle), descripción -->
      <!-- overlay:opacity:0 por defecto, opacity:1 en hover (siempre visible en touch) -->
    </div>
  </div>
</div>
```

A diferencia de las tarjetas de proyecto (que tienen el texto siempre visible debajo de la imagen), **las tarjetas de certificación tienen el texto SUPERPUESTO sobre la imagen con overlay degradado, oculto hasta hover** (o siempre visible en dispositivos táctiles). Esto es una diferencia de patrón importante a replicar con precisión.

Botones de navegación prev/next (círculos 40px, fondo `#F5F5F7`, aparecen solo en hover del contenedor completo vía `onCertHoverEnter`/`onCertHoverLeave`).

### 2.9 Modal de detalle (overlay global)

Usado tanto para proyectos como certificaciones. Estructura verificada exacta:

```
Overlay: fixed inset:0, z-index:340, fondo rgba(0,0,0,0.6), backdrop-filter blur(20px) saturate(180%)
  Contenedor: fondo blanco, border-radius:28px, max-width:1200px, width:96vw, max-height:94vh, scroll interno
    Botón cerrar: círculo 36px, fondo #F5F5F7, ícono X, esquina superior derecha
    Padding interno: 28px 28px 24px
      Título (modalTitle): Piazzolla italic 26px 600
      Subtítulo (modalSubtitle): 14px 500 color #86868b
      Descripción (modalDesc): 14px color #424245, line-height 1.5, max-width 700px
      Contenedor de imagen:
        Flecha prev (si modalHasArrows): círculo 40px, fondo #F5F5F7
        Imagen: height:78vh, border-radius:20px
          - Si modalBlurBg: capa de fondo con la misma imagen en blur(40px) brightness(0.9) scale(1.15) — 
            efecto de fondo ambiental detrás de la imagen nítida (fit:contain)
          - Imagen principal: fit:contain, fondo dinámico (transparente si blur activo, sino #F5F5F5)
        Flecha next (si modalHasArrows): círculo 40px, fondo #F5F5F7
      Indicador de posición ("2 / 5") si hay múltiples imágenes
```

**Navegación por teclado:** el modal soporta flechas de teclado y Escape (ya confirmado en README anterior, mantener).

### 2.10 Contacto (`#contacto`)

Eyebrow "¿Trabajamos juntas?", título "Hablemos." (Piazzolla italic 60px), párrafo de disponibilidad, email como link grande (Piazzolla 26px), links de contacto (`data-contact-links`, columna en mobile).

### 2.11 Footer

Texto simple: "© 2026 Ámbar Centeno · Todos los derechos reservados · Arequipa, Perú." — 12.5px color `#86868b`.

---

## 3. Correspondencia de datos (actualizada)

| Sección visual | Fuente de datos (tabla Supabase) |
|---|---|
| Hero (nombre, subtítulo, CV) | `perfil` |
| Sobre mí (foto, bio, tools, journey, skills, education) | `perfil` + `herramientas_uso` + `trayectoria` + `skills_resumen` + `formacion_sobre_mi` |
| Banda de estadísticas | **Fijo en código**, no editable (decisión ya tomada) |
| Trabajos recientes | `proyectos_destacados` |
| Proyectos para empresas | `proyectos` (categoria='empresa') + `proyecto_tags` + `proyecto_media` |
| Proyectos independientes | `proyectos` (categoria='independiente') + `proyecto_tags` + `proyecto_media` |
| Certificaciones | `certificaciones` (titulo, institucion, fecha, descripcion, imagen_url, aspect_ratio) |
| Contacto | `perfil` (email, whatsapp_numero, linkedin_url, instagram_url, mensaje_contacto) |

**Nota importante:** las secciones "Habilidades y herramientas" (categorías) y "Formación académica/Idiomas" que se mencionaban como pendientes en versiones anteriores de este documento **no aparecen en este HTML** — se confirma que la primera fue descartada del diseño, y la segunda sigue sin definirse visualmente (solo "Certificaciones" fue confirmada e implementada).

---

## 4. Traducción HTML → React (guía de patrones, ver también sección original más abajo)

El HTML usa sintaxis propia de Claude Design (`sc-for`, `sc-if`, `sc-camel-on-click`) que se traduce a JSX estándar — ver tabla de traducción de patrones en la sección "4. Traducción del HTML a componentes React" más abajo en este mismo documento (contenido preexistente, sigue vigente).

**Patrones nuevos específicos de este rediseño a implementar:**
- Carrusel con drag manual + loop infinito (triplicar array) — usado en "Recientes" y "Certificaciones"
- Expand/collapse animado con `max-height` + `transition` — usado en Education, Skills, Journey, grids de proyecto
- Modal único reutilizado para proyecto Y certificación (mismo componente, contenido dinámico)
- Overlay con gradiente + opacity condicional por hover/touch — específico de tarjetas de certificación
- Grid de galería con proporciones variables (`1.5fr 1fr` para triple) — específico de tarjetas de proyecto

---



---

## 1. Fuente de verdad

**El diseño visual autoritativo de este proyecto vive en:**

```
H:\Repositorios\ambar-portafolio\public\docs\Portafolio Ámbar Centeno (standalone).html
```

Este archivo es un export directo de Claude Design y contiene el HTML, CSS (inline) y la lógica de interactividad (React/JS embebido) del diseño completo, incluyendo:
- Estructura exacta de cada sección
- Estilos inline con la paleta de colores real
- Tipografías, espaciados, animaciones
- Breakpoints responsive (`@media(max-width:900px)`)
- Lógica de componentes interactivos (carrusel, modal de galería, zoom de imagen, expand/collapse)

**Regla de trabajo:** cuando el diseño cambie en Claude Design, el archivo HTML actualizado se re-exporta a esa misma ruta. Este README **no duplica** el detalle visual completo — apunta a ese archivo como fuente única, y aquí solo se documentan la traducción a componentes y las decisiones de implementación que no son obvias solo leyendo el HTML.

Cuando se necesite el detalle exacto de un estilo, color, o comportamiento, **leer directamente el HTML**, no asumir desde este documento.

---

## 2. Identidad visual (resumen de alto nivel)

Extraído del HTML como referencia rápida — para valores exactos, consultar el archivo fuente.

**Tipografías:**
- `Piazzolla` (serif, itálica) → títulos, nombre, números de la banda de stats
- `Inter` (sans-serif) → cuerpo de texto, UI

**Paleta principal:**
- Morado: `#7C3AED` (primario), `#6D28D9`, `#5B21B6` (variantes oscuras)
- Azul: `#60A5FA`, `#3B82F6`, `#2563EB`
- Rosa/magenta: `#EC4899` (acento)
- Fondo base: `#FDFCFF`
- Texto principal: `#241F33`
- Texto secundario: `#6B6478`, `#9B94AC`

**Elementos decorativos recurrentes:**
- Blobs radiales animados (`floatBlob` keyframe) en fondos claros
- Estrellas/sparkles SVG de 4 puntas, en distintos tamaños y opacidades
- Gradientes diagonales morado→azul en botones y bandas de contraste

**Componentes interactivos ya implementados en el HTML original:**
- Carrusel infinito (loop) para "Trabajos recientes", con drag manual y botones prev/next
- Modal de zoom de imagen individual (click en ícono de lupa)
- Modal de galería con navegación prev/next y teclado (flechas, Escape)
- Expand/collapse en "Education" dentro de "Sobre mí" (botón "See more"/"See less")
- Expand/collapse en grillas de proyectos cuando hay más de 6 ítems ("Ver más"/"Ver menos")
- Layout de tarjeta de proyecto que se adapta según cantidad de imágenes (1, 2, 3, o 4+ con overlay "+N")

---

## 3. Traducción del HTML a componentes React

El HTML original usa una sintaxis propia del bundler de Claude Design (`sc-for`, `sc-if`, `sc-camel-on-click`, `{{ variable }}`) que **no es JSX válido** — es una capa de templating propia que se traduce, no se copia literal.

Tabla de traducción de patrones:

| Patrón en el HTML original | Equivalente en React/JSX |
|---|---|
| `<sc-for list="{{ items }}" as="item">...</sc-for>` | `{items.map(item => (...))}` |
| `<sc-if value="{{ cond }}">...</sc-if>` | `{cond && (...)}` |
| `sc-camel-on-click="{{ fn }}"` | `onClick={fn}` |
| `sc-camel-view-box` | `viewBox` (atributo SVG estándar) |
| `{{ variable }}` | `{variable}` (JSX ya usa esta sintaxis nativamente) |
| `<image-slot id="..." src="...">` | `<img src={...} />` o componente `<Image>` de Next.js, según si la imagen es estática o servida desde Supabase |
| `class Component extends DCLogic { state = {...} }` | Componente funcional con `useState`/`useEffect` |
| `style-hover="..."` | Manejado con clases Tailwind (`hover:`) o CSS-in-JS con `:hover`, ya que React no soporta ese atributo nativamente |

**Componente de clase → funcional:** el HTML fuente define la lógica como una clase (`class Component extends DCLogic`) con `state`, `componentDidMount`, y getters computados (`get recentWorks()`, `get companies()`). Al traducir a Next.js/React moderno, esto se reescribe como componente funcional con hooks (`useState`, `useEffect`, `useMemo` para los valores computados).

---

## 4. Mapeo de contenido estático → dinámico

El HTML original tiene todos los datos hardcodeados directamente en el JS (`recentWorksData`, `companiesData`, `independentProjectsData`, etc). Al integrar con Supabase, cada uno de estos arrays hardcodeados se reemplaza por datos venidos de `/api/portfolio`:

| Array hardcodeado en el HTML | Tabla de origen en Supabase |
|---|---|
| `recentWorksData` | `proyectos_destacados` |
| `companiesData` | `proyectos` (categoria = 'empresa') |
| `independentProjectsData` | `proyectos` (categoria = 'independiente') |
| Bio, foto, herramientas, journey, skills chips, education (sección "Sobre mí") | `perfil`, `herramientas_uso`, `trayectoria`, `skills_resumen`, `formacion_sobre_mi` |
| Contacto (email, whatsapp, linkedin, instagram) | `perfil` |
| Sección "Habilidades y herramientas" (no visible en el HTML standalone actual — pendiente si se agrega) | `skill_categorias`, `skills` |
| Sección "Formación y certificaciones" (no visible en el HTML standalone actual — pendiente si se agrega) | `formacion_academica`, `idiomas`, `certificaciones` |

**Nota:** el HTML standalone más reciente analizado no incluye las secciones completas de "Habilidades y herramientas" (categorías) ni "Formación y certificaciones" (formación académica extendida, idiomas, certificaciones) que sí aparecían en capturas anteriores. Si el diseño final las conserva, deben añadirse como nuevas secciones siguiendo el mismo patrón de traducción de esta tabla. Confirmar contra la versión más reciente del HTML antes de construir esas partes.

Los campos con placeholder literal en el HTML (ej. `link: 'Agrega aquí el link del sitio o proyecto'`) son marcadores de Claude Design para campos vacíos — se traducen a `proyectos.link_url` y se muestran condicionalmente solo si tienen un valor real cargado por Ámbar.

---

## 5. Assets estáticos vs. dinámicos

- **CV** (`./uploads/CV_Ambar.pdf` en el HTML original): en producción, este pasa a ser `perfil.cv_url`, apuntando a Supabase Storage en vez de a una ruta local estática.
- **Fuentes** (Piazzolla, Inter vía Google Fonts): se mantienen igual, cargadas vía `@font-face` o `next/font` para mejor rendimiento.
- **Imágenes de placeholder** (`image-slot` con `placeholder="..."`): en el HTML original son slots vacíos a rellenar manualmente en Claude Design. En producción, cada uno se reemplaza por la URL real que Ámbar suba vía el panel admin, cayendo a un placeholder visual (ícono de imagen) si el campo aún no tiene contenido — mismo comportamiento que ya tiene el HTML original con sus cajas "Drop an image or browse files".

---

## 6. Responsive

El HTML original define los breakpoints así:

```css
@media(max-width:900px){
  [data-nav-links]{display:none!important}
  [data-hero-name]{font-size:52px!important}
  /* ...etc, ver el archivo fuente para la lista completa */
}
```

Al migrar a componentes, estos ajustes se preservan igual (vía CSS Modules, styled-jsx, o clases utilitarias de Tailwind con el breakpoint `md:` ajustado a 900px si no coincide con el default de Tailwind). Verificar visualmente contra el HTML original en un viewport <900px antes de considerar una sección terminada.

---

## 7. Checklist de verificación al traducir cada sección

Al construir cada componente en Fase 6 (ver README_PLANIFICACION.md), confirmar:

- [ ] Estructura visual idéntica al HTML original en desktop
- [ ] Estructura visual idéntica en viewport <900px
- [ ] Todo dato hardcodeado reemplazado por su fuente en `/api/portfolio`
- [ ] Interactividad (hover, click, animaciones) preservada
- [ ] Estados vacíos (sin foto, sin proyectos aún) tienen un placeholder razonable, no un error visual
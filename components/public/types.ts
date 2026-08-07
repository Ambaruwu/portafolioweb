export type PublicRow = Record<string, unknown>

export type Perfil = PublicRow & {
  nombre?: string
  titulo?: string
  especialidad?: string
  bio_titulo?: string
  bio_texto?: string
  foto_url?: string
  cv_url?: string
  email?: string
  whatsapp_numero?: string
  linkedin_url?: string
  instagram_url?: string
  ubicacion_corta?: string
  mensaje_contacto?: string
}

export type Herramienta = PublicRow & { id: string; nombre: string; orden: number }
export type SkillResumen = PublicRow & { id: string; nombre: string; destacado: boolean; orden: number }
export type Trayectoria = PublicRow & { id: string; empresa_o_contexto: string; rol: string; fecha_inicio: string; fecha_fin: string | null; color_punto: string; orden: number }
export type FormacionSobreMi = PublicRow & { id: string; institucion: string; programa: string; visible_por_defecto: boolean; orden: number }
export type Destacado = PublicRow & { id: string; titulo: string; etiqueta: string; cliente: string; descripcion: string | null; media_url: string; media_tipo: 'imagen' | 'video'; aspect_ratio?: string; orden: number }
export type ProyectoTag = PublicRow & { id: string; nombre: string; orden: number }
export type ProyectoMedia = PublicRow & { id: string; url: string; tipo: 'imagen' | 'video'; thumbnail_url?: string | null; orden: number }
export type Proyecto = PublicRow & { id: string; titulo: string; categoria: 'empresa' | 'independiente'; cliente_o_rol: string; descripcion_corta: string; link_url?: string | null; orden: number; proyecto_tags: ProyectoTag[]; proyecto_media: ProyectoMedia[] }
export type Certificacion = PublicRow & { id: string; titulo: string; institucion: string; fecha: string; descripcion: string; imagen_url: string; aspect_ratio?: string; orden: number }

export type PortfolioData = {
  perfil: Perfil | null
  herramientasUso: Herramienta[]
  trayectoria: Trayectoria[]
  skillsResumen: SkillResumen[]
  formacionSobreMi: FormacionSobreMi[]
  proyectosDestacados: Destacado[]
  proyectos: Proyecto[]
  skillCategorias: PublicRow[]
  formacionAcademica: PublicRow[]
  idiomas: PublicRow[]
  certificaciones: Certificacion[]
}

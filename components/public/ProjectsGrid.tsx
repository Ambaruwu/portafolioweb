'use client'

import { useState } from 'react'
import type { Proyecto, ProyectoMedia } from './types'

export default function ProjectsGrid({ items, category, onOpen }: { items: Proyecto[]; category: 'empresa' | 'independiente'; onOpen: (title: string, subtitle: string, description: string, images: string[], blur: boolean) => void }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, 6)
  const company = category === 'empresa'
  return <section id={company ? 'empresas' : undefined} className={`public-section public-projects ${company ? 'public-projects-company' : 'public-projects-independent'}`} data-section-pad><div className="public-section-heading"><span className="public-eyebrow">{company ? 'Clientes & empresas' : 'Proyectos personales'}</span><h2>{company ? 'Proyectos para empresas' : 'Proyectos independientes'}</h2>{company && <p>Desde 2020 he trabajado con más de 10 empresas de distintos sectores — identidad visual, campañas, contenido digital y diseño web.</p>}</div><div className="public-project-grid" data-company-grid={company ? '' : undefined} data-indie-grid={!company ? '' : undefined}>{visible.map((project) => <ProjectCard key={project.id} project={project} onOpen={onOpen} />)}</div>{items.length > 6 && <button className="public-outline-button" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Ver menos' : 'Ver más'}</button>}</section>
}

function ProjectCard({ project, onOpen }: { project: Proyecto; onOpen: ProjectsGridProps['onOpen'] }) {
  const media = project.proyecto_media || []
  const images = media.map((item) => item.thumbnail_url || item.url).filter(Boolean)
  const layoutCount = media.length === 0 ? 1 : Math.min(media.length, 4)
  const tags = project.proyecto_tags?.slice(0, 4) || []
  return <article className="public-project-card"><div className={`public-project-gallery media-${layoutCount}`}>{media.length === 0 ? <div className="public-project-empty-slot">Sin media</div> : media.slice(0, 4).map((item, index) => <button key={item.id} onClick={() => onOpen(project.titulo, project.cliente_o_rol, project.descripcion_corta, images, false)}>{mediaElement(item, project.titulo, index)}{media.length > 4 && index === 3 && <span className="public-more-overlay">+{media.length - 3}</span>}</button>)}</div><div className="public-project-copy"><div className="public-project-tags">{tags.length > 0 ? tags.map((tag) => <span className="public-badge" key={tag.id}>{tag.nombre}</span>) : <span className="public-badge">{project.categoria === 'empresa' ? 'Proyecto' : 'Personal'}</span>}</div><h3>{project.titulo}</h3><p className="public-project-client">{project.cliente_o_rol}</p><p>{project.descripcion_corta}</p></div></article>
}

type ProjectsGridProps = { onOpen: (title: string, subtitle: string, description: string, images: string[], blur: boolean) => void }
function mediaElement(item: ProyectoMedia, title: string, index: number) { const source = item.thumbnail_url || item.url; return item.tipo === 'video' ? <video src={item.url} poster={item.thumbnail_url || undefined} muted playsInline aria-label={`${title} ${index + 1}`} /> : <img src={source} alt={`${title} ${index + 1}`} /> }

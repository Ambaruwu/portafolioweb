'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormacionSobreMi, Herramienta, Perfil, SkillResumen, Trayectoria } from './types'

function Expandable({ children, label, className = '', measureOverflow = false, visibleItems }: { children: React.ReactNode; label: string; className?: string; measureOverflow?: boolean; visibleItems?: number }) {
  const [expanded, setExpanded] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(!measureOverflow)
  const [collapsedHeight, setCollapsedHeight] = useState(68)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!measureOverflow || !ref.current) return
    const measure = () => {
      if (!ref.current || !ref.current.children.length) return
      const children = Array.from(ref.current.children) as HTMLElement[]
      const gap = Number.parseFloat(getComputedStyle(ref.current).rowGap || getComputedStyle(ref.current).gap || '0') || 0
      const height = visibleItems
        ? children.slice(0, visibleItems).reduce((total, child) => total + child.offsetHeight, 0) + gap * Math.max(visibleItems - 1, 0)
        : children[0].offsetHeight * 2 + 8
      setCollapsedHeight(height)
      setHasOverflow(ref.current.scrollHeight > height + 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(ref.current)
    window.addEventListener('resize', measure)
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [measureOverflow, visibleItems, children])
  return <><div ref={ref} style={{ maxHeight: expanded ? 1000 : collapsedHeight }} className={`public-expandable ${expanded ? 'is-expanded' : ''} ${className}`}>{children}</div>{hasOverflow && <button className="public-text-button" onClick={() => setExpanded((value) => !value)}>{expanded ? 'See less' : label}</button>}</>
}

export default function AboutSection({ perfil, herramientas, trayectoria, skills, education }: { perfil: Perfil | null; herramientas: Herramienta[]; trayectoria: Trayectoria[]; skills: SkillResumen[]; education: FormacionSobreMi[] }) {
  return <section id="sobre-mi" className="public-section public-about" data-section-pad><div className="public-about-grid" data-about-grid>
    <div className="public-about-photo"><div className="public-about-photo-inner">{perfil?.foto_url ? <img src={perfil.foto_url} alt={perfil.nombre || 'Ámbar Centeno'} /> : <span>Foto de perfil</span>}</div></div>
    <div className="public-about-content"><h2>{perfil?.bio_titulo || 'Diseño con criterio, potenciado por IA.'}</h2><p className="public-lead">{perfil?.bio_texto || 'Diseño desde 2020 para empresas y marcas de distintos sectores, combinando criterio visual, producto, QA e inteligencia artificial.'}</p>
      <div className="public-about-columns"><div><h3>Tools I Use</h3><Expandable label="See more" className="public-chip-wrap" measureOverflow>{herramientas.map((item) => <span className="public-chip" key={item.id}>{item.nombre}</span>)}</Expandable></div><div><h3>Skills</h3><Expandable label="See more" className="public-chip-wrap" measureOverflow>{skills.map((item) => <span className={`public-chip ${item.destacado ? 'is-featured' : ''}`} key={item.id}>{item.nombre}</span>)}</Expandable></div></div>
      <div className="public-about-columns public-about-lower"><div><h3>Journey</h3><Expandable label="See more" className="public-journey" measureOverflow visibleItems={2}>{trayectoria.map((item) => <div className="public-journey-item" key={item.id}><strong>{item.empresa_o_contexto}</strong><p>{item.rol} · {item.fecha_inicio}—{item.fecha_fin || 'Presente'}</p></div>)}</Expandable></div><div><h3>Education</h3><Expandable label="See more" className="public-education">{education.map((item) => <div className="public-education-item" key={item.id}><strong>{item.institucion}</strong><p>{item.programa}</p></div>)}</Expandable></div></div>
    </div>
  </div></section>
}

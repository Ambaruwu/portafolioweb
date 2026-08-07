'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useDragScroll } from './useDragScroll'
import type { Certificacion } from './types'

export default function CertificationsCarousel({ items, onOpen }: { items: Certificacion[]; onOpen: (title: string, subtitle: string, description: string, images: string[], blur: boolean) => void }) {
  const [hover, setHover] = useState(false)
  const looped = items
  const showArrows = items.length >= 4
  const ref = useDragScroll<HTMLDivElement>(looped.length, false)
  const aspectRatio = (value?: string) => { const [width, height] = (value || '4/3').split('/').map(Number); return height ? width / height : 4 / 3 }
  return <section id="certificaciones" className="public-carousel-section"><div className="public-section-heading"><span className="public-eyebrow">Formación continua</span><h2>Certificaciones</h2></div><div className="public-carousel-shell" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}><div ref={ref} className="public-carousel public-cert-carousel">{looped.map((item, index) => <button className="public-cert-card" key={`${item.id}-${index}`} style={{ width: `${Math.round(420 * aspectRatio(item.aspect_ratio))}px`, height: '420px' }} onClick={() => onOpen(item.titulo, item.institucion, item.descripcion, [item.imagen_url], true)}><div className="public-cert-image">{item.imagen_url ? <img src={item.imagen_url} alt={item.titulo} /> : <div className="public-placeholder">{item.titulo}</div>}<div className="public-cert-overlay"><h3>{item.titulo}</h3><p>{item.institucion}</p><small>{item.descripcion}</small></div></div></button>)}</div>{showArrows && <><button aria-label="Anterior" className={`public-carousel-arrow left ${hover ? 'is-visible' : ''}`} onClick={() => ref.current?.scrollBy({ left: -298, behavior: 'smooth' })}><ChevronLeft size={16} /></button><button aria-label="Siguiente" className={`public-carousel-arrow right ${hover ? 'is-visible' : ''}`} onClick={() => ref.current?.scrollBy({ left: 298, behavior: 'smooth' })}><ChevronRight size={16} /></button></>}</div></section>
}

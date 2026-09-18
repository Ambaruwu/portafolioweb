'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDragScroll } from './useDragScroll'
import type { Destacado } from './types'

export default function RecentWorksCarousel({ items, onOpen: openDetail }: { items: Destacado[]; onOpen: (title: string, subtitle: string, description: string, images: string[], blur: boolean) => void }) {
  const [hover, setHover] = useState(false)
  const [dragging, setDragging] = useState(false)
  const shouldLoop = items.length >= 4
  const looped = shouldLoop ? [...items, ...items, ...items] : items
  const showArrows = items.length >= 4
  const ref = useDragScroll<HTMLDivElement>(looped.length, shouldLoop)
  const aspectRatio = (value?: string) => { const [width, height] = (value || '1').split('/').map(Number); return height ? width / height : 1 }
  useEffect(() => {
    const element = ref.current
    if (!element || !shouldLoop) return
    const pause = () => setDragging(true)
    const resume = () => setDragging(false)
    element.addEventListener('pointerdown', pause)
    element.addEventListener('pointerup', resume)
    element.addEventListener('pointercancel', resume)
    return () => { element.removeEventListener('pointerdown', pause); element.removeEventListener('pointerup', resume); element.removeEventListener('pointercancel', resume) }
  }, [ref, shouldLoop])
  useEffect(() => {
    if (!shouldLoop || hover || dragging) return
    let frame = 0
    let previous = performance.now()
    const speed = 30
    const animate = (now: number) => {
      const element = ref.current
      const elapsed = now - previous
      previous = now
      if (element) element.scrollLeft += speed * elapsed / 1000
      frame = window.requestAnimationFrame(animate)
    }
    frame = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(frame)
  }, [dragging, hover, ref, shouldLoop])
  function onOpen(title: string, subtitle: string, description: string, images: string[], blur: boolean) { console.log('Click en destacado:', title); openDetail(title, subtitle, description, images, blur) }
  return <section id="recientes" className="public-carousel-section"><div className="public-section-heading"><h2>Trabajos recientes</h2></div><div className="public-carousel-shell" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}><div ref={ref} className="public-carousel" data-carousel>{looped.map((item, index) => <button className="public-recent-card" key={`${item.id}-${index}`} style={{ width: `${Math.round(420 * aspectRatio(item.aspect_ratio))}px`, height: '420px' }} onClick={() => onOpen(item.titulo, `${item.etiqueta} · ${item.cliente}`, item.descripcion ?? '', [item.media_url], true)}>{item.media_tipo === 'video' ? <video src={item.media_url} muted playsInline /> : item.media_url ? <img src={item.media_url} alt={item.titulo} /> : <div className="public-placeholder">{item.titulo}</div>}<div className="public-card-overlay"><span className="public-badge">{item.etiqueta}</span><h3>{item.titulo}</h3><p>{item.cliente}</p></div></button>)}</div>{showArrows && <><CarouselArrow direction="left" visible={hover} onClick={() => ref.current?.scrollBy({ left: -318, behavior: 'smooth' })} /><CarouselArrow direction="right" visible={hover} onClick={() => ref.current?.scrollBy({ left: 318, behavior: 'smooth' })} /></>}</div></section>
}

function CarouselArrow({ direction, visible, onClick }: { direction: 'left' | 'right'; visible: boolean; onClick: () => void }) { return <button aria-label={direction === 'left' ? 'Anterior' : 'Siguiente'} className={`public-carousel-arrow ${direction} ${visible ? 'is-visible' : ''}`} onClick={onClick}>{direction === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}</button> }

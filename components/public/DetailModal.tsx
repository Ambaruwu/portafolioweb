'use client'

import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import { PointerEvent, useEffect, useRef, useState } from 'react'

export type Detail = { title: string; subtitle: string; description: string; images: string[]; blur: boolean }
const MIN_ZOOM = 1
const MAX_ZOOM = 2
const ZOOM_STEP = 0.25

export default function DetailModal({ detail, onClose }: { detail: Detail | null; onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(MIN_ZOOM)
  const [dragging, setDragging] = useState(false)
  const imageWrapRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; startScrollLeft: number; startScrollTop: number } | null>(null)

  useEffect(() => {
    if (!detail) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') { setIndex((value) => (value + 1) % detail.images.length); setZoomLevel(MIN_ZOOM); setDragging(false) }
      if (event.key === 'ArrowLeft') { setIndex((value) => (value - 1 + detail.images.length) % detail.images.length); setZoomLevel(MIN_ZOOM); setDragging(false) }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [detail, onClose])

  if (!detail) return null
  const safeIndex = Math.min(index, Math.max(detail.images.length - 1, 0))
  const image = detail.images[safeIndex]
  const isVideo = /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(image || '')
  const isZoomed = zoomLevel > MIN_ZOOM

  function changeIndex(getNextIndex: (value: number) => number) {
    setIndex(getNextIndex(safeIndex))
    setZoomLevel(MIN_ZOOM)
    setDragging(false)
  }

  function centerZoom(nextLevel: number) {
    const element = imageWrapRef.current
    if (!element) return
    window.requestAnimationFrame(() => {
      if (nextLevel === MIN_ZOOM) {
        element.scrollLeft = 0
        element.scrollTop = 0
      } else {
        element.scrollLeft = Math.max(0, (element.scrollWidth - element.clientWidth) / 2)
        element.scrollTop = Math.max(0, (element.scrollHeight - element.clientHeight) / 2)
      }
    })
  }

  function setZoom(nextLevel: number) {
    const clampedLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextLevel))
    setZoomLevel(clampedLevel)
    centerZoom(clampedLevel)
  }

  function zoomIn() { if (zoomLevel < MAX_ZOOM) setZoom(zoomLevel + ZOOM_STEP) }
  function zoomOut() { if (zoomLevel > MIN_ZOOM) setZoom(zoomLevel - ZOOM_STEP) }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!isZoomed || (event.target as HTMLElement).closest('button')) return
    const element = event.currentTarget
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, startScrollLeft: element.scrollLeft, startScrollTop: element.scrollTop }
    element.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const element = event.currentTarget
    element.scrollLeft = drag.startScrollLeft - (event.clientX - drag.startX)
    element.scrollTop = drag.startScrollTop - (event.clientY - drag.startY)
  }

  function finishPointerDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return <div className="public-modal-backdrop" onClick={onClose}><div className="public-modal" onClick={(event) => event.stopPropagation()}><button className="public-modal-close" onClick={onClose} aria-label="Cerrar"><X size={14} /></button><div className="public-modal-content"><div className="public-modal-header"><h3>{detail.title}</h3><p className="public-modal-subtitle">{detail.subtitle}</p><p className="public-modal-description">{detail.description}</p></div><div className="public-modal-image-frame"><div ref={imageWrapRef} className={`public-modal-image-wrap${isZoomed ? ' is-zoomed' : ''}${dragging ? ' is-dragging' : ''}`} style={{ '--zoom-level': zoomLevel } as React.CSSProperties} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={finishPointerDrag} onPointerCancel={finishPointerDrag}>{detail.images.length > 1 && <button className="public-modal-arrow left" onClick={() => changeIndex((value) => (value - 1 + detail.images.length) % detail.images.length)} aria-label="Anterior"><ChevronLeft size={16} /></button>}{detail.blur && image && !isVideo && !isZoomed && <img className="public-modal-blur" src={image} alt="" aria-hidden />}{image ? isVideo ? <video className="public-modal-image" src={image} controls playsInline /> : <img className="public-modal-image" src={image} alt={detail.title} onDoubleClick={zoomIn} onDragStart={(event) => event.preventDefault()} /> : <div className="public-placeholder">Sin imagen</div>}{detail.images.length > 1 && <button className="public-modal-arrow right" onClick={() => changeIndex((value) => (value + 1) % detail.images.length)} aria-label="Siguiente"><ChevronRight size={16} /></button>}</div>{image && <div className="public-modal-zoom-controls" aria-label="Controles de zoom"><button className="public-modal-zoom" onClick={zoomIn} disabled={zoomLevel >= MAX_ZOOM} aria-label="Ampliar imagen" title={`Ampliar imagen (${Math.round((zoomLevel + ZOOM_STEP) * 100)}%)`}><ZoomIn size={16} /></button><button className="public-modal-zoom" onClick={zoomOut} disabled={zoomLevel <= MIN_ZOOM} aria-label="Reducir imagen" title={`Reducir imagen (${Math.round((zoomLevel - ZOOM_STEP) * 100)}%)`}><ZoomOut size={16} /></button></div>}</div>{detail.images.length > 1 && <p className="public-modal-position">{safeIndex + 1} / {detail.images.length}</p>}</div></div></div>
}

'use client'

import { useEffect, useRef } from 'react'

export function useDragScroll<T extends HTMLElement>(loopedLength: number, infinite = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const dragThreshold = 5
    let pressed = false
    let dragging = false
    let suppressClick = false
    let startX = 0
    let startScroll = 0
    const onDown = (event: PointerEvent) => { pressed = true; dragging = false; startX = event.clientX; startScroll = element.scrollLeft }
    const onMove = (event: PointerEvent) => {
      if (!pressed) return
      const distance = Math.abs(event.clientX - startX)
      if (!dragging && distance > dragThreshold) {
        dragging = true
        element.setPointerCapture(event.pointerId)
        element.classList.add('is-dragging')
      }
      if (dragging) { event.preventDefault(); element.scrollLeft = startScroll - (event.clientX - startX) }
    }
    const onUp = (event: PointerEvent) => {
      if (!pressed) return
      if (dragging) { suppressClick = true; if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId) }
      pressed = false
      dragging = false
      element.classList.remove('is-dragging')
    }
    const onClick = (event: MouseEvent) => { if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false } }
    const onScroll = () => { if (!infinite) return; const third = element.scrollWidth / 3; if (third && element.scrollLeft < third * 0.5) element.scrollLeft += third; else if (third && element.scrollLeft > third * 1.5) element.scrollLeft -= third }
    element.addEventListener('pointerdown', onDown)
    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerup', onUp)
    element.addEventListener('pointercancel', onUp)
    element.addEventListener('click', onClick, true)
    element.addEventListener('scroll', onScroll)
    const initial = window.requestAnimationFrame(() => { if (infinite && element.scrollWidth) element.scrollLeft = element.scrollWidth / 3 })
    return () => { window.cancelAnimationFrame(initial); element.removeEventListener('pointerdown', onDown); element.removeEventListener('pointermove', onMove); element.removeEventListener('pointerup', onUp); element.removeEventListener('pointercancel', onUp); element.removeEventListener('click', onClick, true); element.removeEventListener('scroll', onScroll) }
  }, [loopedLength, infinite])

  return ref
}

'use client'

import { useState } from 'react'
import { DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

export function useReorderableItems<T extends { id: string }>(items: T[], reorderUrl: string) {
  const [orderedIds, setOrderedIds] = useState<string[] | null>(null)
  const [error, setError] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const propIds = items.map((item) => item.id)
  const hasLocalOrder = orderedIds !== null && orderedIds.length === propIds.length && orderedIds.every((id) => propIds.includes(id))
  const orderedItems = hasLocalOrder ? orderedIds.map((id) => items.find((item) => item.id === id)).filter((item): item is T => Boolean(item)) : items

  async function handleDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return
    const oldIndex = orderedItems.findIndex((item) => item.id === event.active.id)
    const newIndex = orderedItems.findIndex((item) => item.id === event.over?.id)
    if (oldIndex < 0 || newIndex < 0) return
    const previousIds = orderedItems.map((item) => item.id)
    const nextItems = arrayMove(orderedItems, oldIndex, newIndex)
    setOrderedIds(nextItems.map((item) => item.id))
    setError('')
    try {
      const response = await fetch(reorderUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: nextItems.map((item) => item.id) }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar el orden')
    } catch (reorderError) { setOrderedIds(previousIds); setError(reorderError instanceof Error ? reorderError.message : 'No se pudo guardar el orden') }
  }

  return { orderedItems, sensors, handleDragEnd, reorderError: error }
}

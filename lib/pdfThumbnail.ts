export async function generatePdfThumbnail(file: File): Promise<{ thumbnailDataUrl: string; aspectRatio: string }> {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return { thumbnailDataUrl: '', aspectRatio: '1' }

    const pdfjs = await import('pdfjs-dist')
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return { thumbnailDataUrl: '', aspectRatio: '1' }

    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    await page.render({ canvas, canvasContext: context, viewport }).promise

    const width = Math.round(viewport.width)
    const height = Math.round(viewport.height)
    const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a
    const divisor = gcd(width, height)
    const aspectRatio = divisor ? `${width / divisor}/${height / divisor}` : '1'
    return { thumbnailDataUrl: canvas.toDataURL('image/jpeg', 0.8), aspectRatio }
  } catch (error) {
    console.error('No se pudo generar la miniatura del PDF:', error)
    return { thumbnailDataUrl: '', aspectRatio: '1' }
  }
}

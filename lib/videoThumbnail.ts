export async function generateVideoThumbnail(videoUrl: string): Promise<string | null> {
  if (typeof document === 'undefined') return null

  return new Promise((resolve) => {
    const video = document.createElement('video')
    const timeout = window.setTimeout(() => finish(null), 10000)
    let settled = false

    function finish(result: string | null) {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
      video.removeEventListener('seeked', handleSeeked)
      video.removeAttribute('src')
      video.load()
      resolve(result)
    }

    function drawFrame() {
      if (!video.videoWidth || !video.videoHeight) return finish(null)
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (!context) return finish(null)
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      finish(canvas.toDataURL('image/jpeg', 0.7))
    }

    function handleSeeked() { drawFrame() }
    function handleLoadedData() {
      const targetTime = Number.isFinite(video.duration) ? Math.min(0.5, video.duration) : 0
      if (targetTime === 0) drawFrame()
      else {
        video.addEventListener('seeked', handleSeeked, { once: true })
        video.currentTime = targetTime
      }
    }
    function handleError() { finish(null) }

    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'
    video.addEventListener('loadeddata', handleLoadedData, { once: true })
    video.addEventListener('error', handleError, { once: true })
    video.src = videoUrl
    video.load()
  })
}

export function getVideoAspectRatio(file: File): Promise<string> {
  if (typeof URL === 'undefined' || typeof document === 'undefined') return Promise.resolve('1')

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const video = document.createElement('video')
    const timeout = window.setTimeout(() => finish('1'), 10000)
    let settled = false

    function finish(ratio: string) {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      video.removeEventListener('loadedmetadata', handleMetadata)
      video.removeEventListener('error', handleError)
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(objectUrl)
      resolve(ratio)
    }

    function handleMetadata() {
      const width = video.videoWidth
      const height = video.videoHeight
      if (!width || !height) return finish('1')
      const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a
      const divisor = gcd(width, height)
      finish(width / divisor === height / divisor ? '1' : `${width / divisor}/${height / divisor}`)
    }

    function handleError() { finish('1') }

    video.preload = 'metadata'
    video.addEventListener('loadedmetadata', handleMetadata, { once: true })
    video.addEventListener('error', handleError, { once: true })
    video.src = objectUrl
    video.load()
  })
}

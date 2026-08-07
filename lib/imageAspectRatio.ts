export function getImageAspectRatio(file: File): Promise<string> {
  if (typeof URL === 'undefined' || typeof Image === 'undefined') return Promise.resolve('1')
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    const finish = (ratio: string) => { URL.revokeObjectURL(objectUrl); resolve(ratio) }
    image.onload = () => { const width = image.naturalWidth; const height = image.naturalHeight; if (!width || !height) return finish('1'); const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a; const divisor = gcd(width, height); finish(width / divisor === height / divisor ? '1' : `${width / divisor}/${height / divisor}`) }
    image.onerror = () => finish('1')
    image.src = objectUrl
  })
}

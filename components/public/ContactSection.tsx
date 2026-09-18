import type { Perfil } from './types'

function normalizeUrl(url: string | null | undefined): string {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

export default function ContactSection({ perfil }: { perfil: Perfil | null }) {
  const email = perfil?.email || 'spidamb@gmail.com'
  const whatsapp = perfil?.whatsapp_numero ? `https://wa.me/${perfil.whatsapp_numero.replace(/\D/g, '')}` : 'https://wa.me/51964369502'
  return <section id="contacto" className="public-contact public-section" data-section-pad><div><span className="public-eyebrow">¿Trabajamos juntas?</span><h2>Hablemos.</h2><p>{perfil?.mensaje_contacto || 'Disponible para proyectos freelance y oportunidades. Escríbeme y cuéntame en qué estás pensando.'}</p><a className="public-email" href={`mailto:${email}`}>{email}</a><div className="public-contact-links" data-contact-links><a className="public-pill public-light-pill" href={`mailto:${email}`}>Correo</a><a className="public-pill public-light-pill" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a><a className="public-pill public-light-pill" href={normalizeUrl(perfil?.linkedin_url)} target="_blank" rel="noreferrer">LinkedIn</a><a className="public-pill public-light-pill" href={normalizeUrl(perfil?.instagram_url)} target="_blank" rel="noreferrer">Instagram</a></div></div></section>
}

import type { Perfil } from './types'

export default function Hero({ perfil }: { perfil: Perfil | null }) {
  const title = perfil?.titulo || 'Graphic & Digital Designer — Especialista en IA aplicada al diseño'
  return <section id="inicio" className="public-hero" data-hero-pad>
    <div className="public-hero-inner"><span className="public-eyebrow">Portafolio profesional</span><h1 data-hero-name>{perfil?.nombre || 'Ámbar Centeno'}</h1><p data-hero-title>{title}</p><div className="public-hero-ctas" data-hero-ctas><a className="public-pill public-dark-pill" href="#empresas">Ver proyectos</a>{perfil?.cv_url && <a className="public-pill public-light-pill" href={perfil.cv_url} download>Descargar CV</a>}</div></div>
  </section>
}

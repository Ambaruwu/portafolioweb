'use client'

export default function Nav() {
  return <nav className="public-nav" data-nav-pad>
    <a href="#inicio" className="public-logo">Ámbar<span>.</span></a>
    <div className="public-nav-links" data-nav-links><a href="#recientes">Recientes</a><a href="#empresas">Proyectos</a><a href="#certificaciones">Certificaciones</a><a href="#sobre-mi">Sobre mí</a></div>
    <a className="public-pill public-dark-pill" href="#contacto">Contáctame</a>
  </nav>
}

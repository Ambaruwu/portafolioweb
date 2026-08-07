'use client'

import { useCallback, useState } from 'react'
import AboutSection from './AboutSection'
import CertificationsCarousel from './CertificationsCarousel'
import ContactSection from './ContactSection'
import DetailModal, { Detail } from './DetailModal'
import Footer from './Footer'
import Hero from './Hero'
import Nav from './Nav'
import ProjectsGrid from './ProjectsGrid'
import RecentWorksCarousel from './RecentWorksCarousel'
import StatsBand from './StatsBand'
import type { PortfolioData } from './types'

export type { PortfolioData } from './types'

export default function PortfolioPage({ data }: { data: PortfolioData }) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const openDetail = useCallback((title: string, subtitle: string, description: string, images: string[], blur: boolean) => setDetail({ title, subtitle, description, images, blur }), [])
  return <div className="public-page"><Nav /><main><Hero perfil={data.perfil} /><AboutSection perfil={data.perfil} herramientas={data.herramientasUso} trayectoria={data.trayectoria} skills={data.skillsResumen} education={data.formacionSobreMi} /><StatsBand /><RecentWorksCarousel items={data.proyectosDestacados} onOpen={openDetail} /><ProjectsGrid items={data.proyectos.filter((item) => item.categoria === 'empresa')} category="empresa" onOpen={openDetail} /><ProjectsGrid items={data.proyectos.filter((item) => item.categoria === 'independiente')} category="independiente" onOpen={openDetail} /><CertificationsCarousel items={data.certificaciones} onOpen={openDetail} /><ContactSection perfil={data.perfil} /></main><Footer location={data.perfil?.ubicacion_corta} /><DetailModal key={detail ? `${detail.title}-${detail.images.join('|')}` : 'closed'} detail={detail} onClose={() => setDetail(null)} /></div>
}

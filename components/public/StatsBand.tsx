const stats = [['5+', 'años de experiencia'], ['10+', 'empresas y clientes'], ['15+', 'herramientas y habilidades'], ['8', 'certificaciones en IA']]

export default function StatsBand() {
  return <section className="public-stats"><div className="public-stats-inner" data-stat-band>{stats.map(([number, label]) => <div key={label}><p data-stat-num>{number}</p><p data-stat-label>{label}</p></div>)}</div></section>
}

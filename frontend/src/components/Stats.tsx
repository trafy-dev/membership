interface Stat {
  id: string
  num: string
  label: string
}

const STATS: Stat[] = [
  { id: 'lives', num: '8 Crore+', label: 'Lives Touched' },
  { id: 'protests', num: '600+', label: 'Protests Led' },
  { id: 'gatherings', num: '1500+', label: 'Gatherings Organised' },
]

export default function Stats() {
  return (
    <section className="stats-section">
      <div className="wrap">
        <div className="stats-grid">
          {STATS.map((stat) => (
            <div key={stat.id} className="stat-cell">
              <div className="stat-num">{stat.num}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

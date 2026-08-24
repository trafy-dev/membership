import { useState } from 'react'
import annaPhoto from '../assets/leaders/anna.jpg'
import kalaignarPhoto from '../assets/leaders/kalaignar.jpg'
import stalinPhoto from '../assets/leaders/stalin.jpg'

interface Leader {
  id: string
  short: string
  name: string
  photo: string
  years: string
  bio: string
  event: string
}

const LEADERS: Leader[] = [
  {
    id: 'anna',
    short: 'Anna',
    name: 'C. N. Annadurai',
    photo: annaPhoto,
    years: '1909 – 1969',
    bio: "Founded the DMK and became the first non-Congress Chief Minister in Tamil Nadu's history, turning Periyar's Self-Respect ideals into a governing party for the very first time. A gifted orator, he brought Tamil pride, rationalism and welfare-first politics into everyday governance.",
    event: '1967 – Landmark Election Victory',
  },
  {
    id: 'kalaignar',
    short: 'Kalaignar',
    name: 'M. Karunanidhi',
    photo: kalaignarPhoto,
    years: '1924 – 2018',
    bio: "Five-time Chief Minister, writer and orator who carried Anna's legacy forward for five decades. He championed federalism, reservation and welfare schemes, and led the historic anti-Hindi imposition agitation that protected Tamil's place as a language of pride.",
    event: 'Anti-Hindi Imposition Agitation',
  },
  {
    id: 'stalin',
    short: 'M. K. Stalin',
    name: 'M. K. Stalin',
    photo: stalinPhoto,
    years: '1953 – Present',
    bio: 'Current Chief Minister of Tamil Nadu, continuing the Dravidian model of governance into a new generation. He has pushed for a nationwide social justice census and greater state autonomy, and built youth-first welfare policy at the centre of his administration.',
    event: 'Leading The Social Justice Census Demand',
  },
]

export default function IdeologyLeaders() {
  const [leaderId, setLeaderId] = useState('anna')
  const selected = LEADERS.find((l) => l.id === leaderId) ?? LEADERS[0]

  return (
    <section className="section section-alt" id="ideology-leaders">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Carrying The Torch Forward</div>
          <h2 className="section-title">
            Ideology <span className="accent">Leaders</span>
          </h2>
        </div>
        <div className="leaders-box">
          <div className="leaders-photos">
            {LEADERS.map((leader) => {
              const active = leader.id === leaderId
              return (
                <button
                  key={leader.id}
                  type="button"
                  className={`leader-tab ${active ? 'leader-tab-active' : ''}`.trim()}
                  style={{ backgroundImage: `url(${leader.photo})` }}
                  onClick={() => setLeaderId(leader.id)}
                >
                  <span className="leader-tab-scrim" />
                  <span className="leader-tab-info">
                    <span className="leader-tab-name">{leader.short}</span>
                    <span className="leader-tab-role">{leader.years}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <div className="leaders-desc">
            <div className="eyebrow">{selected.years}</div>
            <h3>{selected.name}</h3>
            <p>{selected.bio}</p>
            <span className="event-tag">{selected.event}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

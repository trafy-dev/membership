import karlMarxPhoto from '../assets/thinkers/karl-marx.jpg'
import periyarPhoto from '../assets/thinkers/periyar.jpg'
import ambedkarPhoto from '../assets/thinkers/ambedkar.jpg'

interface Thinker {
  id: string
  photo: string
  name: string
  role: string
  bio: string
  cardClass: string
}

const THINKERS: Thinker[] = [
  {
    id: 'marx',
    photo: karlMarxPhoto,
    name: 'Karl Marx',
    role: 'Philosopher & Economist',
    bio: "Exposed how capital concentrates wealth and power in the hands of a few. His call for a classless, equal society gave the world's working people a language to organise, resist and demand a fairer share of what they build.",
    cardClass: 'thinker-marx',
  },
  {
    id: 'periyar',
    photo: periyarPhoto,
    name: 'Periyar E. V. Ramasamy',
    role: 'Founder, Self-Respect Movement',
    bio: 'Rejected caste, blind ritual and gender inequality across Tamil Nadu. He taught generations to question before believing, and built the Self-Respect Movement that remains the root of every Dravidian party today.',
    cardClass: 'thinker-periyar',
  },
  {
    id: 'ambedkar',
    photo: ambedkarPhoto,
    name: 'Dr. B. R. Ambedkar',
    role: 'Architect, Indian Constitution',
    bio: "Fought untouchability his entire life and wrote equality directly into India's founding law. His work on reservation, representation and constitutional rights remains the legal backbone of social justice in India.",
    cardClass: 'thinker-ambedkar',
  },
]

export default function Thinkers() {
  return (
    <section className="section" id="thinkers">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">The Foundations We Stand On</div>
          <h2 className="section-title">
            Thinkers Who Shaped <span className="accent">Our Ideology</span>
          </h2>
        </div>
        <div className="thinkers-grid">
          {THINKERS.map((t) => (
            <div key={t.id} className={`thinker-card ${t.cardClass}`}>
              <img src={t.photo} alt={t.name} className="thinker-avatar" />
              <h3 className="thinker-name">{t.name}</h3>
              <p className="thinker-role">{t.role}</p>
              <p className="thinker-bio">{t.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

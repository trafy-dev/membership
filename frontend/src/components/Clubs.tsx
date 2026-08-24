import spreadGreenLogo from '../assets/clubs/spread-green.png'
import goRedLogo from '../assets/clubs/go-red.png'
import overseasStudentsLogo from '../assets/clubs/overseas-tamil-students.png'
import repubRainbowsLogo from '../assets/clubs/repub-rainbows.png'
import deAnnihilationLogo from '../assets/clubs/de-annihilation.png'

interface Club {
  id: string
  name: string
  logo: string
}

const CLUBS: Club[] = [
  { id: 'spread-green', name: 'Spread Green', logo: spreadGreenLogo },
  { id: 'go-red', name: 'Go Red', logo: goRedLogo },
  { id: 'overseas-students', name: 'Overseas Tamil Students Empowerment Club', logo: overseasStudentsLogo },
  { id: 'repub-rainbows', name: 'REPUB Rainbows', logo: repubRainbowsLogo },
  { id: 'de-annihilation', name: 'De-Annihilation Club', logo: deAnnihilationLogo },
]

export default function Clubs() {
  return (
    <section className="section" id="clubs">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Where Members Take Action</div>
          <h2 className="section-title">
            Our <span className="accent">Clubs</span>
          </h2>
        </div>
        <div className="clubs-grid">
          {CLUBS.map((club) => (
            <div key={club.id} className="club-card">
              <div className="club-icon">
                <img src={club.logo} alt={club.name} />
              </div>
              <div className="club-name">{club.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

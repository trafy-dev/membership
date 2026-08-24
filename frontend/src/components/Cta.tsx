import { Link } from 'react-router-dom'

export default function Cta() {
  return (
    <section className="cta-section">
      <div className="wrap">
        <div className="cta-inner">
          <div className="eyebrow">Your Voice, Organised</div>
          <p className="cta-line">
            Every Tamil student who stays silent is a voice the next generation won&apos;t get to hear.
          </p>
          <p className="cta-sub">
            Caste doesn&apos;t end on its own, and rights aren&apos;t handed down &mdash; they&apos;re won by people
            who organise. Stand with thousands of students already building a more equal Tamil Nadu, one protest, one
            gathering, one conversation at a time.
          </p>
          <Link to="/signup" className="btn-primary">
            Join the Movement
          </Link>
        </div>
      </div>
    </section>
  )
}

import suPaveePhoto from '../assets/people/su-pavee.jpg'

export default function FoundingNote() {
  return (
    <section className="section" id="founding-note">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">In His Own Words</div>
          <h2 className="section-title">
            Founding <span className="accent">Note</span>
          </h2>
        </div>
        <div className="note-box">
          <div className="note-text">
            <div className="eyebrow">Founder</div>
            <h3>Supa Veerapandian</h3>
            <div className="role">Founder, Dravida Manavar Peravai</div>
            <p>
              I started Dravida Manavar Peravai with a simple conviction: that Tamil students should never have to
              fight the same battles of caste and inequality that our elders fought without knowing where to turn.
            </p>
            <p>
              We began as a handful of students meeting after college hours, and grew into a movement of gatherings,
              protests and clubs because young people were hungry for a space that took their questions seriously.
              Every protest we lead and every club we build carries the same self-respect ideology forward &mdash;
              for the next Tamil generation.
            </p>
          </div>
          <div className="note-photo">
            <img src={suPaveePhoto} alt="Supa Veerapandian" className="note-avatar" />
          </div>
        </div>
      </div>
    </section>
  )
}

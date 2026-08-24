import arulPhoto from '../assets/people/arul.jpg'

export default function SecretaryNote() {
  return (
    <section className="section section-alt" id="secretary-note">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Leading From The Ground</div>
          <h2 className="section-title">
            Secretary&apos;s <span className="accent">Note</span>
          </h2>
        </div>
        <div className="note-box">
          <div className="note-text">
            <div className="eyebrow">Secretary</div>
            <h3>Mr. Arul</h3>
            <div className="role">Secretary, Dravida Manavar Peravai</div>
            <p>
              My role is to make sure that every idea this movement believes in actually reaches the ground &mdash;
              every protest, every gathering, every club activity organised across Tamil Nadu.
            </p>
            <p>
              Behind every number you see below is a team of student volunteers who show up early, stay late and
              never stop believing that organised, disciplined effort is how a movement becomes change. That
              discipline is what I work to protect every single day.
            </p>
          </div>
          <div className="note-photo">
            <img src={arulPhoto} alt="Arul" className="note-avatar" />
          </div>
        </div>
      </div>
    </section>
  )
}

import logo from '../assets/logo.jpg'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="brand-lockup">
            <img src={logo} alt="Dravida Manavar Peravai" className="logo-badge" />
            <div>
              <div className="brand-name" style={{ fontSize: 15 }}>
                திராவிட மாணவர் பேரவை
              </div>
              <div className="brand-sub">Dravida Manavar Peravai</div>
            </div>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <h4>Movement</h4>
              <a href="#thinkers">Ideology</a>
              <a href="#ideology-leaders">Leaders</a>
              <a href="#clubs">Clubs</a>
            </div>
            <div className="footer-col">
              <h4>Leadership</h4>
              <a href="#founding-note">Founder&apos;s Note</a>
              <a href="#secretary-note">Secretary&apos;s Note</a>
            </div>
            <div className="footer-col">
              <h4>Connect</h4>
              <a href="#">Instagram</a>
              <a href="#">YouTube</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; Dravida Manavar Peravai. All rights reserved.</span>
          <span>Self-Respect &middot; Social Justice &middot; Student Power</span>
        </div>
      </div>
    </footer>
  )
}

export function AboutPage() {
  return (
    <div className="page">
      <header>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

      <div className="content">
        <h3 className="page-title">About CampSpots</h3>

        <section>
          <h2>Our Story</h2>
          <p>
            Founded in 2020, CampSpots helps adventurers find the perfect
            campsite across national parks, state forests, and private grounds.
          </p>
        </section>

        <section>
          <h2>Get in Touch</h2>

          <form>
            <div className="field">
              <span className="label">Your Name</span>
              <input type="text" id="name" />
            </div>

            <div className="field">
              <span className="label">Email Address</span>
              <input type="email" id="email" />
            </div>

            <div className="field">
              <h6>Message</h6>
              <textarea id="message" rows={5} />
            </div>

            <button type="submit">Send</button>
          </form>
        </section>

        <section>
          <h2>Our Values</h2>
          <p>We believe in leaving no trace and respecting nature.</p>
        </section>
      </div>

      <footer>
        <p>&copy; 2024 CampSpots. All rights reserved.</p>
      </footer>
    </div>
  );
}

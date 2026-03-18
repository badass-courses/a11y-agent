export function Gallery() {
  return (
    <div className="gallery">
      <img src="/hero-banner.jpg" />

      <img
        src="/decorative-border.png"
        alt="A beautiful wavy blue and green decorative border pattern"
      />

      <a href="/about">
        <img src="/about-icon.png" />
      </a>

      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        onClick={() => alert("search")}
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <div className="photo-card">
        <img src="/team-photo.jpg" alt="team" />
        <p>Our engineering team at the 2024 summer retreat</p>
      </div>
    </div>
  );
}

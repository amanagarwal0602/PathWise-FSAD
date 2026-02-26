// Hero Section - Main landing area
export default function Hero() {
  return (
    <section style={{
      background: "var(--light-gray)",
      padding: "80px 0",
      textAlign: "center"
    }}>
      <div className="container">
        {/* Main Heading */}
        <h1 style={{
          fontSize: "42px",
          fontWeight: "bold",
          color: "var(--dark)",
          marginBottom: "20px"
        }}>
          Find Your Perfect Career Path
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "18px",
          color: "var(--gray)",
          maxWidth: "600px",
          margin: "0 auto 40px"
        }}>
          Take our career assessment, explore career options, and connect with 
          expert career mentors to guide your future.
        </p>

        {/* Call to Action Buttons */}
        <div style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center"
        }}>
          <button className="btn btn-primary">
            Take Free Assessment
          </button>
          <button className="btn btn-outline">
            Explore Careers
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "50px",
          marginTop: "60px"
        }}>
          <div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--primary)" }}>50,000+</div>
            <div style={{ color: "var(--gray)" }}>Students Guided</div>
          </div>
          <div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--primary)" }}>500+</div>
            <div style={{ color: "var(--gray)" }}>Career Mentors</div>
          </div>
          <div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--primary)" }}>300+</div>
            <div style={{ color: "var(--gray)" }}>Career Paths</div>
          </div>
        </div>
      </div>
    </section>
  );
}
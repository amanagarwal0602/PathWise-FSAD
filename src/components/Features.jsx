// Features Section - Shows platform capabilities
// Using simple data array to store feature information
const features = [
  {
    icon: "📝",
    title: "Career Assessment",
    description: "Take our comprehensive assessment test to discover careers that match your interests and skills."
  },
  {
    icon: "📅",
    title: "Book Counseling",
    description: "Schedule one-on-one sessions with expert career counsellors for personalized guidance."
  },
  {
    icon: "🔍",
    title: "Explore Careers",
    description: "Browse detailed information about 300+ career paths including salaries and requirements."
  },
  {
    icon: "📊",
    title: "Track Progress",
    description: "Monitor your career planning journey with our easy-to-use dashboard and reports."
  },
  {
    icon: "👥",
    title: "Expert Network",
    description: "Connect with verified counsellors specializing in different career fields."
  },
  {
    icon: "📚",
    title: "Resource Library",
    description: "Access articles, guides, and materials to help you make informed career decisions."
  }
];

export default function Features() {
  return (
    <section id="features" className="section" style={{ background: "white" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h2 className="section-title">Platform Features</h2>
          <p className="section-subtitle">
            Everything you need to plan your career journey
          </p>
        </div>

        {/* Features Grid - 3 columns */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "25px"
        }}>
          {/* Map through features array to create cards */}
          {features.map((feature, index) => (
            <div key={index} className="card">
              {/* Icon */}
              <div style={{ fontSize: "36px", marginBottom: "15px" }}>
                {feature.icon}
              </div>
              
              {/* Title */}
              <h3 style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "10px",
                color: "var(--dark)"
              }}>
                {feature.title}
              </h3>
              
              {/* Description */}
              <p style={{
                fontSize: "14px",
                color: "var(--gray)",
                lineHeight: "1.6"
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
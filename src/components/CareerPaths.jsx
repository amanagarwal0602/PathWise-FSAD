// Career Paths Section - Shows different career categories
// Data array containing career path information
const careerPaths = [
  {
    icon: "💻",
    title: "Technology",
    description: "Software Development, Data Science, Cybersecurity",
    jobs: "150+ careers"
  },
  {
    icon: "🏥",
    title: "Healthcare",
    description: "Medicine, Nursing, Healthcare Management",
    jobs: "80+ careers"
  },
  {
    icon: "⚖️",
    title: "Law",
    description: "Corporate Law, Criminal Law, Legal Services",
    jobs: "40+ careers"
  },
  {
    icon: "🎨",
    title: "Design",
    description: "UX Design, Graphic Design, Architecture",
    jobs: "50+ careers"
  },
  {
    icon: "📊",
    title: "Business",
    description: "MBA, Finance, Marketing, Management",
    jobs: "90+ careers"
  },
  {
    icon: "🎓",
    title: "Education",
    description: "Teaching, Research, EdTech",
    jobs: "45+ careers"
  }
];

export default function CareerPaths() {
  return (
    <section id="careers" className="section" style={{ background: "var(--light-gray)" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h2 className="section-title">Explore Career Paths</h2>
          <p className="section-subtitle">
            Browse through different career categories
          </p>
        </div>

        {/* Career Paths Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px"
        }}>
          {careerPaths.map((career, index) => (
            <div key={index} className="card" style={{ textAlign: "center" }}>
              {/* Icon */}
              <div style={{ fontSize: "40px", marginBottom: "15px" }}>
                {career.icon}
              </div>
              
              {/* Title */}
              <h3 style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "8px"
              }}>
                {career.title}
              </h3>
              
              {/* Description */}
              <p style={{
                fontSize: "13px",
                color: "var(--gray)",
                marginBottom: "12px"
              }}>
                {career.description}
              </p>
              
              {/* Job Count Badge */}
              <span style={{
                background: "var(--primary)",
                color: "white",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "500"
              }}>
                {career.jobs}
              </span>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button className="btn btn-outline">
            View All Career Paths
          </button>
        </div>
      </div>
    </section>
  );
}
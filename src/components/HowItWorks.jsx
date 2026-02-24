// How It Works Section - Shows the step-by-step process
const steps = [
  {
    number: "1",
    title: "Take Assessment",
    description: "Complete our career assessment test to identify your interests and strengths."
  },
  {
    number: "2",
    title: "Get Results",
    description: "Receive personalized career recommendations based on your assessment."
  },
  {
    number: "3",
    title: "Book Session",
    description: "Schedule a session with an expert counsellor for detailed guidance."
  },
  {
    number: "4",
    title: "Plan Career",
    description: "Create your personalized career roadmap and start your journey."
  }
];

export default function HowItWorks() {
  return (
    <section className="section" style={{ background: "white" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Simple 4-step process to find your career
          </p>
        </div>

        {/* Steps Container */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "30px"
        }}>
          {steps.map((step, index) => (
            <div key={index} style={{ 
              flex: 1,
              textAlign: "center",
              padding: "20px"
            }}>
              {/* Step Number Circle */}
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "var(--primary)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold",
                margin: "0 auto 20px"
              }}>
                {step.number}
              </div>

              {/* Step Title */}
              <h3 style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "10px"
              }}>
                {step.title}
              </h3>

              {/* Step Description */}
              <p style={{
                fontSize: "14px",
                color: "var(--gray)",
                lineHeight: "1.5"
              }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
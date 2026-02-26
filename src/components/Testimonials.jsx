import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Sneha Patil",
    class: "Class 12 → Engineering Student",
    text: "I was torn between law and engineering. PathWise's assessment showed I have strong analytical and spatial reasoning — it matched me to Computer Science. Now I'm at NIT Pune and loving it!",
    initials: "SP",
    color: "#0a7c6e",
    rating: 5,
  },
  {
    name: "Rohan Das",
    class: "Graduate → UX Designer",
    text: "I was stuck in a job I hated. My mentor Dr. Anjali helped me realize my passion for design. Within 8 months of switching, I had a portfolio and a job at a top design studio.",
    initials: "RD",
    color: "#7c3aed",
    rating: 5,
  },
  {
    name: "Meera Krishnan",
    class: "Class 10 → Stream Selection",
    text: "I took the PathWise assessment in Class 10. It showed Commerce was my strength, not Science. My parents finally understood — and now I'm pursuing Chartered Accountancy confidently.",
    initials: "MK",
    color: "#ef6c4a",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section style={{ padding: "96px 0", background: "var(--white)" }}>
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 500, margin: "0 auto 56px" }}>
          <span style={{
            display: "inline-block",
            background: "#ede9fe", color: "var(--violet)",
            fontSize: 12, fontWeight: 700, letterSpacing: "1.5px",
            padding: "6px 14px", borderRadius: 100, marginBottom: 16,
            textTransform: "uppercase",
          }}>Success Stories</span>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 700, letterSpacing: "-0.5px", lineHeight: 1.2,
            color: "var(--ink)",
          }}>Real students,<br /><em>Real transformations</em></h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 24,
        }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              background: "var(--surface)", borderRadius: "var(--radius-lg)",
              padding: "32px", border: "1px solid var(--border)",
              position: "relative", transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <Quote size={28} color="var(--border)" style={{ marginBottom: 16 }} />
              <p style={{ fontSize: 15, color: "var(--ink-light)", lineHeight: 1.75, marginBottom: 24 }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {[...Array(t.rating)].map((_, s) => <Star key={s} size={14} fill="var(--amber)" color="var(--amber)" />)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 14,
                  fontFamily: "var(--font-display)",
                }}>{t.initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.class}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
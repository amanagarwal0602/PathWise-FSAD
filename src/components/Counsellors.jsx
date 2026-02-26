import { Star, Video, MessageCircle } from "lucide-react";

const counsellors = [
  {
    name: "Dr. Priya Sharma",
    role: "STEM & Engineering Specialist",
    exp: "12 years exp.",
    rating: 4.9,
    sessions: "2,340 sessions",
    tags: ["Engineering", "Technology", "Research"],
    initials: "PS",
    color: "#0a7c6e",
  },
  {
    name: "Rahul Mehta",
    role: "Business & Finance Mentor",
    exp: "9 years exp.",
    rating: 4.8,
    sessions: "1,780 sessions",
    tags: ["MBA", "Finance", "Entrepreneurship"],
    initials: "RM",
    color: "#7c3aed",
  },
  {
    name: "Anjali Bose",
    role: "Arts & Creative Career Coach",
    exp: "7 years exp.",
    rating: 4.9,
    sessions: "1,420 sessions",
    tags: ["Design", "Media", "Fine Arts"],
    initials: "AB",
    color: "#ef6c4a",
  },
  {
    name: "Dr. Arjun Nair",
    role: "Medical & Healthcare Expert",
    exp: "15 years exp.",
    rating: 5.0,
    sessions: "3,100 sessions",
    tags: ["MBBS", "Allied Health", "Research"],
    initials: "AN",
    color: "#f59e0b",
  },
];

export default function Counsellors() {
  return (
    <section style={{ padding: "96px 0", background: "var(--surface)" }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 52, flexWrap: "wrap", gap: 20 }}>
          <div>
            <span style={{
              display: "inline-block",
              background: "var(--coral-pale)", color: "var(--coral)",
              fontSize: 12, fontWeight: 700, letterSpacing: "1.5px",
              padding: "6px 14px", borderRadius: 100, marginBottom: 14,
              textTransform: "uppercase",
            }}>Expert Mentors</span>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700, letterSpacing: "-0.5px", lineHeight: 1.2,
              color: "var(--ink)",
            }}>Meet Your<br /><em>Career Mentors</em></h2>
          </div>
          <button style={{
            color: "var(--teal)", fontWeight: 600, fontSize: 14,
            border: "1.5px solid var(--teal)", borderRadius: 8, padding: "10px 18px",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--teal)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--teal)"; }}
          >View All Mentors</button>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {counsellors.map((c, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)", padding: "28px",
              transition: "all 0.25s", cursor: "pointer",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 54, height: 54, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${c.color} 0%, ${c.color}88 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 18,
                  fontFamily: "var(--font-display)",
                  flexShrink: 0,
                }}>{c.initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{c.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{c.exp}</div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "var(--ink-light)", fontWeight: 600, marginBottom: 10 }}>{c.role}</p>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{c.rating}</span>
                </div>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--border)" }} />
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.sessions}</span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                {c.tags.map((tag, t) => (
                  <span key={t} style={{
                    background: "var(--surface)", color: "var(--ink-light)",
                    fontSize: 11, fontWeight: 600, padding: "3px 10px",
                    borderRadius: 100, border: "1px solid var(--border)",
                  }}>{tag}</span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button style={{
                  flex: 1, padding: "10px", borderRadius: 8,
                  background: "var(--teal)", color: "#fff",
                  fontSize: 12.5, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--teal-light)"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--teal)"}
                >
                  <Video size={13} /> Book Session
                </button>
                <button style={{
                  padding: "10px 14px", borderRadius: 8,
                  border: "1px solid var(--border)", color: "var(--muted)",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--teal)"; e.currentTarget.style.color = "var(--teal)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
                >
                  <MessageCircle size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
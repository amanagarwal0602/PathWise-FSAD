import { Mail, Phone, MapPin } from "lucide-react";

const links = {
  "For Students": ["Career Assessment", "Explore Paths", "Book Session", "Success Stories", "Resources"],
  "For Admins": ["Admin Dashboard", "Manage Counsellors", "Track Engagement", "Resource Library", "Reports"],
  "Company": ["About PathWise", "Our Mission", "Careers at PathWise", "Blog", "Press Kit"],
  "Support": ["Help Center", "Contact Us", "Privacy Policy", "Terms of Use", "Cookie Policy"],
};

export default function Footer() {
  return (
    <footer style={{ background: "var(--ink)", color: "rgba(255,255,255,0.7)", padding: "64px 0 0" }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr repeat(4, 1fr)",
          gap: 40, marginBottom: 56,
        }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, var(--teal), var(--teal-light))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>P</span>
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "#fff" }}>PathWise</span>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.8, marginBottom: 24, maxWidth: 260 }}>
              India's trusted career guidance & counseling platform. Built for students. Powered by experts.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: Phone, text: "+91 98765 43210" },
                { icon: Mail, text: "hello@pathwise.in" },
                { icon: MapPin, text: "Bengaluru, Karnataka" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <Icon size={13} color="var(--teal-light)" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: "0.5px", marginBottom: 16, textTransform: "uppercase" }}>
                {heading}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map((item, i) => (
                  <li key={i}>
                    <a href="#" style={{
                      fontSize: 13.5, color: "rgba(255,255,255,0.55)",
                      transition: "color 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
                    >{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "20px 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <p style={{ fontSize: 12.5 }}>© 2025 PathWise Career Platform. FSAD-PS24 Project. All rights reserved.</p>
          <div style={{ display: "flex", gap: 6 }}>
            {["User Login", "Admin Portal", "Counsellor Portal"].map((label, i) => (
              <a key={i} href="#" style={{
                fontSize: 12, padding: "5px 12px", borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.5)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--teal)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              >{label}</a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 520px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section style={{
      padding: "96px 24px",
      background: "linear-gradient(145deg, var(--navy) 0%, #0d4f5c 60%, var(--teal) 100%)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Bg dots */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "32px 32px", pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: 640, margin: "0 auto", textAlign: "center",
        position: "relative", zIndex: 2,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 100, padding: "6px 16px", marginBottom: 28,
        }}>
          <Sparkles size={14} color="#f59e0b" />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Start absolutely free</span>
        </div>

        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 3.4rem)",
          fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1px",
          color: "#fff", marginBottom: 16,
        }}>
          Your perfect career<br /><em style={{ color: "#6ee7df" }}>is one step away.</em>
        </h2>

        <p style={{
          fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 40,
        }}>
          Join 50,000+ students who've already found clarity, confidence, and direction — with PathWise's expert-backed guidance system.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{
            padding: "16px 32px", borderRadius: 12,
            background: "var(--amber)", color: "#fff",
            fontSize: 15, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 20px rgba(245,158,11,0.4)",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(245,158,11,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(245,158,11,0.4)"; }}
          >
            Take Free Assessment <ArrowRight size={16} />
          </button>
          <button style={{
            padding: "16px 28px", borderRadius: 12,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff", fontSize: 15, fontWeight: 600,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
          >
            Talk to a Counsellor
          </button>
        </div>
      </div>
    </section>
  );
}
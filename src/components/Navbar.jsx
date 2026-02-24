import { useState } from "react";

// Simple Navbar Component
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      background: "var(--primary)",
      padding: "15px 0",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* Logo */}
        <a href="#" style={{
          color: "white",
          fontSize: "24px",
          fontWeight: "bold"
        }}>
          PathWise
        </a>

        {/* Navigation Links */}
        <div style={{
          display: "flex",
          gap: "30px",
          alignItems: "center"
        }}>
          <a href="#features" style={{ color: "white" }}>Features</a>
          <a href="#careers" style={{ color: "white" }}>Careers</a>
          <a href="#counsellors" style={{ color: "white" }}>Counsellors</a>
          <a href="#about" style={{ color: "white" }}>About</a>
          
          <button style={{
            background: "white",
            color: "var(--primary)",
            padding: "10px 20px",
            borderRadius: "6px",
            fontWeight: "600"
          }}>
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}
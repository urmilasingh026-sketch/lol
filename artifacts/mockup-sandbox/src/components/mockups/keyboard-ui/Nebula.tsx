import { useState } from "react";

const keys = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M"],
];

function GlowKey({ label, accent = false, wide = false, pressed = false }: { label: string; accent?: boolean; wide?: boolean; pressed?: boolean }) {
  const [isPressed, setIsPressed] = useState(pressed);
  return (
    <button
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        minWidth: wide ? 72 : 46,
        height: 46,
        borderRadius: 10,
        background: isPressed
          ? "linear-gradient(135deg,#a855f7,#7c3aed)"
          : accent
          ? "linear-gradient(135deg,rgba(168,85,247,0.25),rgba(124,58,237,0.15))"
          : "rgba(255,255,255,0.04)",
        border: isPressed
          ? "1px solid #c084fc"
          : accent
          ? "1px solid rgba(168,85,247,0.6)"
          : "1px solid rgba(255,255,255,0.08)",
        color: isPressed ? "#fff" : accent ? "#e9d5ff" : "rgba(255,255,255,0.7)",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'Inter',sans-serif",
        cursor: "pointer",
        transition: "all 0.1s ease",
        boxShadow: isPressed
          ? "0 0 20px rgba(168,85,247,0.8), 0 0 40px rgba(168,85,247,0.4)"
          : accent
          ? "0 0 12px rgba(168,85,247,0.4)"
          : "none",
        transform: isPressed ? "translateY(2px)" : "translateY(0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </button>
  );
}

export function Nebula() {
  const [isMobile, setIsMobile] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0a0010 0%,#0d0020 40%,#080018 100%)",
      fontFamily: "'Inter',sans-serif",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* ambient blobs */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        <div style={{ position:"absolute", top:"-10%", left:"20%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,0.12) 0%,transparent 70%)" }}/>
        <div style={{ position:"absolute", bottom:"-5%", right:"10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)" }}/>
      </div>

      {/* Top Nav */}
      <nav style={{ padding:"0 32px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.05)", backdropFilter:"blur(12px)", position:"relative", zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#a855f7,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⌨</div>
          <span style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.02em", background:"linear-gradient(90deg,#e9d5ff,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>UK Aurora</span>
        </div>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          {["Sounds","Themes","Stats"].map(l => (
            <span key={l} style={{ fontSize:13, color:"rgba(255,255,255,0.45)", cursor:"pointer", transition:"color 0.2s" }}>{l}</span>
          ))}
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#a855f7", boxShadow:"0 0 8px #a855f7" }}/>
        </div>
      </nav>

      {/* Stats bar */}
      <div style={{ display:"flex", justifyContent:"center", gap:32, padding:"20px 0 16px", position:"relative", zIndex:10 }}>
        {[["WPM","84"],["ACC","97%"],["XP","2,140"],["STREAK","12"]].map(([l,v]) => (
          <div key={l} style={{ textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, background:"linear-gradient(90deg,#e9d5ff,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{v}</div>
            <div style={{ fontSize:10, letterSpacing:"0.15em", color:"rgba(255,255,255,0.3)", marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Typing area */}
      <div style={{ padding:"0 40px 20px", position:"relative", zIndex:10 }}>
        <div style={{
          background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(168,85,247,0.2)",
          borderRadius:16,
          padding:"20px 24px",
          fontSize:17,
          lineHeight:1.7,
          letterSpacing:"0.01em",
          backdropFilter:"blur(8px)",
          minHeight:80,
        }}>
          <span style={{ color:"rgba(255,255,255,0.35)" }}>the quick brown fox jumps over </span>
          <span style={{ color:"#e9d5ff", borderRight:"2px solid #a855f7", animation:"none", paddingRight:2 }}>the</span>
          <span style={{ color:"rgba(255,255,255,0.2)" }}> lazy dog and keeps on running</span>
        </div>
      </div>

      {/* Keyboard */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8, padding:"0 20px 24px", position:"relative", zIndex:10 }}>
        {/* Number row */}
        <div style={{ display:"flex", gap:6 }}>
          {["1","2","3","4","5","6","7","8","9","0"].map(k => <GlowKey key={k} label={k} />)}
        </div>
        {keys.map((row, ri) => (
          <div key={ri} style={{ display:"flex", gap:6, marginLeft:[0,24,56][ri] }}>
            {row.map((k, ki) => <GlowKey key={k} label={k} accent={["A","S","D","F"].includes(k)} />)}
          </div>
        ))}
        {/* Bottom row */}
        <div style={{ display:"flex", gap:6 }}>
          <GlowKey label="CTRL" wide />
          <GlowKey label="ALT" wide />
          <button style={{
            flex:1, minWidth:280, height:46, borderRadius:10,
            background:"linear-gradient(90deg,rgba(168,85,247,0.2),rgba(124,58,237,0.2))",
            border:"1px solid rgba(168,85,247,0.4)",
            boxShadow:"0 0 30px rgba(168,85,247,0.15)",
            color:"rgba(255,255,255,0.5)", fontSize:11, letterSpacing:"0.2em",
            cursor:"pointer",
          }}>SPACE</button>
          <GlowKey label="ALT" wide />
          <GlowKey label="⏎" wide accent />
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ height:52, borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center", gap:32, position:"relative", zIndex:10 }}>
        {["🎵 Piano","🎸 Guitar","🥁 Drums","🎹 Synth","🎻 Violin"].map(i => (
          <span key={i} style={{ fontSize:12, color: i.includes("Piano") ? "#c084fc" : "rgba(255,255,255,0.3)", cursor:"pointer" }}>{i}</span>
        ))}
      </div>
    </div>
  );
}

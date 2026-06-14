import { useState } from "react";

const keys = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M"],
];

function OKey({ label, lit = false, wide = false }: { label: string; lit?: boolean; wide?: boolean }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        minWidth: wide ? 68 : 44,
        height: 44,
        borderRadius: 8,
        background: pressed
          ? "#3b82f6"
          : lit
          ? "rgba(59,130,246,0.12)"
          : "#111111",
        border: pressed
          ? "1px solid #60a5fa"
          : lit
          ? "1px solid rgba(59,130,246,0.5)"
          : "1px solid #222",
        color: pressed ? "#fff" : lit ? "#93c5fd" : "#888",
        fontSize: 12,
        fontWeight: 700,
        fontFamily: "'Inter',sans-serif",
        letterSpacing: "0.08em",
        cursor: "pointer",
        transition: "all 0.08s",
        boxShadow: pressed
          ? "0 0 16px rgba(59,130,246,0.9)"
          : lit
          ? "0 0 8px rgba(59,130,246,0.3)"
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
        transform: pressed ? "scale(0.95) translateY(1px)" : "scale(1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      {label}
    </button>
  );
}

export function Obsidian() {
  return (
    <div style={{
      minHeight:"100vh",
      background:"#0a0a0a",
      fontFamily:"'Inter',sans-serif",
      color:"#fff",
      display:"flex",
      flexDirection:"column",
    }}>
      {/* Nav */}
      <nav style={{ height:56, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", borderBottom:"1px solid #1a1a1a" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⌨</div>
          <span style={{ fontWeight:800, fontSize:14, letterSpacing:"-0.02em" }}>UK Aurora</span>
          <span style={{ fontSize:11, color:"#444", marginLeft:4, letterSpacing:"0.1em" }}>VIRTUAL KEYBOARD</span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["Instruments","Modes","Analytics","Settings"].map(t => (
            <button key={t} style={{ padding:"5px 12px", borderRadius:6, background:"transparent", border:"1px solid #222", color:"#555", fontSize:12, cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>{t}</button>
          ))}
          <button style={{ padding:"5px 14px", borderRadius:6, background:"#3b82f6", border:"none", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>Record</button>
        </div>
      </nav>

      {/* Metric row */}
      <div style={{ display:"flex", borderBottom:"1px solid #111", padding:"14px 28px", gap:0 }}>
        {[["WPM","84",""],["Accuracy","97%",""],["Keys/min","420",""],["XP","2,140","▲ +80"],["Streak","12d","🔥"]].map(([l,v,s],i) => (
          <div key={l} style={{ flex:1, borderRight: i < 4 ? "1px solid #1a1a1a" : "none", padding:"0 20px 0 0", marginRight: i < 4 ? 20 : 0 }}>
            <div style={{ fontSize:11, color:"#444", letterSpacing:"0.1em", marginBottom:4 }}>{l.toUpperCase()}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
              <span style={{ fontSize:24, fontWeight:800, color: i === 0 ? "#3b82f6" : "#e5e7eb" }}>{v}</span>
              {s && <span style={{ fontSize:11, color:"#3b82f6" }}>{s}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex:1, display:"flex", gap:0 }}>
        {/* Left sidebar */}
        <div style={{ width:52, borderRight:"1px solid #111", display:"flex", flexDirection:"column", alignItems:"center", padding:"16px 0", gap:16 }}>
          {["🎵","🎨","📊","⚙"].map(ic => (
            <button key={ic} style={{ width:36, height:36, borderRadius:8, background:"transparent", border:"none", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>{ic}</button>
          ))}
        </div>

        {/* Center */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"24px 32px", gap:20 }}>
          {/* Text area */}
          <div style={{
            background:"#0f0f0f",
            border:"1px solid #1e1e1e",
            borderRadius:12,
            padding:"18px 22px",
            fontSize:16,
            lineHeight:1.8,
            color:"#888",
            minHeight:72,
          }}>
            <span style={{ color:"#666" }}>the quick brown fox jumps over </span>
            <span style={{ color:"#e5e7eb", borderRight:"2px solid #3b82f6", paddingRight:1 }}>the</span>
            <span style={{ color:"#333" }}> lazy dog and keeps on running</span>
          </div>

          {/* Keyboard */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
            <div style={{ display:"flex", gap:5 }}>
              {["1","2","3","4","5","6","7","8","9","0"].map(k => <OKey key={k} label={k} />)}
            </div>
            {keys.map((row, ri) => (
              <div key={ri} style={{ display:"flex", gap:5, marginLeft:[0,22,52][ri] }}>
                {row.map(k => <OKey key={k} label={k} lit={["F","J"].includes(k)} />)}
              </div>
            ))}
            <div style={{ display:"flex", gap:5 }}>
              <OKey label="⇧" wide />
              <OKey label="CTRL" wide />
              <button style={{
                flex:1, minWidth:260, height:44, borderRadius:8,
                background:"#111", border:"1px solid #222",
                color:"#333", fontSize:11, letterSpacing:"0.2em",
                cursor:"pointer", fontFamily:"'Inter',sans-serif",
              }}>SPACE</button>
              <OKey label="ALT" wide />
              <OKey label="⏎" wide lit />
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width:200, borderLeft:"1px solid #111", padding:"20px 16px", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ fontSize:11, letterSpacing:"0.1em", color:"#444" }}>INSTRUMENT</div>
          {["🎵 Piano","🎸 Guitar","🥁 Drums","🎹 Synth"].map((s,i) => (
            <div key={s} style={{
              padding:"8px 12px", borderRadius:8,
              background: i === 0 ? "rgba(59,130,246,0.1)" : "transparent",
              border: i === 0 ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
              color: i === 0 ? "#93c5fd" : "#444",
              fontSize:13, cursor:"pointer",
            }}>{s}</div>
          ))}
          <div style={{ marginTop:8, fontSize:11, letterSpacing:"0.1em", color:"#444" }}>THEME</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {["#3b82f6","#8b5cf6","#10b981","#ef4444","#f59e0b"].map(c => (
              <div key={c} style={{ width:24, height:24, borderRadius:6, background:c, cursor:"pointer", opacity: c === "#3b82f6" ? 1 : 0.4 }}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

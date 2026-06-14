import { useState } from "react";

const rows = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M"],
];

function CyberKey({ label, lit = false, wide = false, color = "#00e5ff" }: { label: string; lit?: boolean; wide?: boolean; color?: string }) {
  const [p, setP] = useState(false);
  const c = color;
  return (
    <button
      onMouseDown={() => setP(true)}
      onMouseUp={() => setP(false)}
      onMouseLeave={() => setP(false)}
      style={{
        minWidth: wide ? 66 : 42,
        height: 42,
        borderRadius: 6,
        background: p ? c : lit ? `${c}18` : "rgba(0,229,255,0.03)",
        border: `1px solid ${p ? c : lit ? `${c}55` : "rgba(0,229,255,0.1)"}`,
        color: p ? "#000" : lit ? c : "rgba(0,229,255,0.4)",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "'JetBrains Mono','Fira Code',monospace",
        letterSpacing: "0.1em",
        cursor: "pointer",
        transition: "all 0.07s",
        boxShadow: p ? `0 0 20px ${c}cc, 0 0 40px ${c}44` : lit ? `0 0 8px ${c}44` : "none",
        transform: p ? "scale(0.93)" : "scale(1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {label}
    </button>
  );
}

export function Void() {
  const [activeInstr, setActiveInstr] = useState("SYNTH");
  const cyan = "#00e5ff";
  const green = "#00ff9f";

  return (
    <div style={{
      minHeight:"100vh",
      background:"#020408",
      fontFamily:"'JetBrains Mono','Fira Code',monospace",
      color:cyan,
      display:"flex",
      flexDirection:"column",
      position:"relative",
      overflow:"hidden",
    }}>
      {/* Grid background */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:`
          linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),
          linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)
        `,
        backgroundSize:"40px 40px",
      }}/>
      {/* Glow */}
      <div style={{ position:"absolute", top:-100, left:"50%", transform:"translateX(-50%)", width:600, height:300, background:`radial-gradient(ellipse,rgba(0,229,255,0.06) 0%,transparent 70%)`, pointerEvents:"none" }}/>

      {/* Header */}
      <div style={{ height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", borderBottom:`1px solid rgba(0,229,255,0.1)`, position:"relative", zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:18, letterSpacing:"0.2em", fontWeight:900 }}>UK_AURORA</span>
          <span style={{ fontSize:10, color:`rgba(0,229,255,0.3)`, letterSpacing:"0.15em" }}>v2.4.1</span>
        </div>
        <div style={{ display:"flex", gap:20, fontSize:11, letterSpacing:"0.15em" }}>
          {["SOUND","RGB","STATS","SYS"].map(t => (
            <span key={t} style={{ color:`rgba(0,229,255,0.35)`, cursor:"pointer" }}>{t}</span>
          ))}
          <span style={{ color:green, fontSize:10 }}>● LIVE</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", borderBottom:`1px solid rgba(0,229,255,0.07)`, position:"relative", zIndex:10 }}>
        {[["WPM","84",cyan],["ACC","97%",green],["KPM","420",cyan],["XP","2140",green],["STK","12",cyan]].map(([l,v,c]) => (
          <div key={l} style={{ flex:1, padding:"12px 0", textAlign:"center", borderRight:`1px solid rgba(0,229,255,0.07)` }}>
            <div style={{ fontSize:9, letterSpacing:"0.2em", color:"rgba(0,229,255,0.25)", marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:20, fontWeight:900, color:c as string, textShadow:`0 0 12px ${c}` }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", position:"relative", zIndex:10 }}>
        {/* Instruments sidebar */}
        <div style={{ width:120, borderRight:`1px solid rgba(0,229,255,0.07)`, padding:"16px 0" }}>
          <div style={{ fontSize:8, letterSpacing:"0.2em", color:"rgba(0,229,255,0.25)", padding:"0 16px", marginBottom:12 }}>INSTRUMENTS</div>
          {["SYNTH","PIANO","GUITAR","DRUMS","BASS","VIOLIN"].map(s => (
            <div
              key={s}
              onClick={() => setActiveInstr(s)}
              style={{
                padding:"8px 16px",
                fontSize:10,
                letterSpacing:"0.15em",
                color: activeInstr === s ? "#000" : "rgba(0,229,255,0.35)",
                background: activeInstr === s ? cyan : "transparent",
                cursor:"pointer",
                transition:"all 0.15s",
                borderLeft: activeInstr === s ? `none` : "2px solid transparent",
              }}
            >{s}</div>
          ))}
        </div>

        {/* Center keyboard area */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"20px 24px", gap:16 }}>
          {/* Text display */}
          <div style={{
            background:"rgba(0,229,255,0.02)",
            border:`1px solid rgba(0,229,255,0.1)`,
            borderRadius:8,
            padding:"14px 18px",
            fontSize:14,
            lineHeight:1.8,
            minHeight:64,
            letterSpacing:"0.03em",
          }}>
            <span style={{ color:"rgba(0,229,255,0.25)" }}>{">"} the quick brown fox jumps over </span>
            <span style={{ color:cyan, textShadow:`0 0 8px ${cyan}`, borderRight:`2px solid ${cyan}`, paddingRight:2 }}>the</span>
            <span style={{ color:"rgba(0,229,255,0.1)" }}> lazy dog_</span>
          </div>

          {/* Keyboard */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
            <div style={{ display:"flex", gap:4 }}>
              {["1","2","3","4","5","6","7","8","9","0","-","="].map(k => <CyberKey key={k} label={k} color={green} />)}
            </div>
            {rows.map((row, ri) => (
              <div key={ri} style={{ display:"flex", gap:4, marginLeft:[0,20,48][ri] }}>
                {row.map(k => <CyberKey key={k} label={k} lit={Math.random() > 0.7} />)}
              </div>
            ))}
            <div style={{ display:"flex", gap:4, marginTop:2 }}>
              <CyberKey label="SHIFT" wide />
              <CyberKey label="CTRL" wide />
              <button style={{
                flex:1, minWidth:240, height:42,
                background:"rgba(0,229,255,0.03)",
                border:`1px solid rgba(0,229,255,0.12)`,
                borderRadius:6,
                color:"rgba(0,229,255,0.2)", fontSize:9, letterSpacing:"0.3em",
                cursor:"pointer", fontFamily:"monospace",
              }}>_ _ _ _ _ SPACE _ _ _ _ _</button>
              <CyberKey label="ALT" wide />
              <CyberKey label="↵" wide lit color={green} />
            </div>
          </div>

          {/* Wave viz */}
          <div style={{ height:36, background:"rgba(0,229,255,0.02)", borderRadius:8, border:`1px solid rgba(0,229,255,0.07)`, display:"flex", alignItems:"center", padding:"0 16px", gap:2, overflow:"hidden" }}>
            {Array.from({length:60}).map((_,i) => (
              <div key={i} style={{
                width:3, borderRadius:2,
                height: Math.abs(Math.sin(i * 0.4 + 1) * 22) + 4,
                background:cyan,
                opacity: 0.3 + Math.abs(Math.sin(i * 0.4)) * 0.5,
                flexShrink:0,
              }}/>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width:160, borderLeft:`1px solid rgba(0,229,255,0.07)`, padding:"16px 0" }}>
          <div style={{ fontSize:8, letterSpacing:"0.2em", color:"rgba(0,229,255,0.25)", padding:"0 16px", marginBottom:12 }}>RGB MODE</div>
          {["WAVE","PULSE","THUNDER","RAINBOW","STATIC"].map(s => (
            <div key={s} style={{ padding:"7px 16px", fontSize:10, letterSpacing:"0.12em", color: s === "WAVE" ? cyan : "rgba(0,229,255,0.3)", cursor:"pointer" }}>{s}</div>
          ))}
          <div style={{ marginTop:20, padding:"0 16px" }}>
            <div style={{ fontSize:8, letterSpacing:"0.2em", color:"rgba(0,229,255,0.25)", marginBottom:10 }}>EFFECTS</div>
            {[["REVERB","70%"],["DELAY","40%"],["DIST","20%"]].map(([l,v]) => (
              <div key={l} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"rgba(0,229,255,0.35)", marginBottom:4 }}><span>{l}</span><span style={{ color:cyan }}>{v}</span></div>
                <div style={{ height:2, background:"rgba(0,229,255,0.1)", borderRadius:2 }}>
                  <div style={{ height:"100%", borderRadius:2, background:cyan, width:v, boxShadow:`0 0 6px ${cyan}` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

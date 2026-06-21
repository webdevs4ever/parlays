import { useState, useRef, useMemo } from "react";

const initialParlays = [
  {
    id: 1,
    name: "June 10 Late Night",
    date: "Jun 10, 2026",
    stake: 0.99,
    payout: 30.00,
    legs: [
      { id: 1, desc: "Yordan Alvarez: 1+ hits",         game: "HOU @ LAA", status: "hit"  },
      { id: 2, desc: "Jo Adell: 1+ hits",               game: "HOU @ LAA", status: "miss" },
      { id: 3, desc: "Houston wins by 1.5+ runs",       game: "HOU @ LAA", status: "miss" },
      { id: 4, desc: "Nick Kurtz: 2+ total bases",      game: "MIL @ ATH", status: "miss" },
      { id: 5, desc: "Shea Langeliers: 2+ total bases", game: "MIL @ ATH", status: "hit"  },
      { id: 6, desc: "Jake Bauers: 2+ total bases",     game: "MIL @ ATH", status: "miss" },
      { id: 7, desc: "Jackson Chourio: 2+ total bases", game: "MIL @ ATH", status: "hit"  },
    ],
  },
];

const S = {
  hit:     { label: "✓", color: "#22C55E", activeBg: "#14532d" },
  miss:    { label: "✕", color: "#EF4444", activeBg: "#7f1d1d" },
  pending: { label: "·", color: "#888888", activeBg: "#222222" },
};

const mono = "'SF Mono','Fira Code',monospace";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const QUESTION_TYPES = [
  { key: "python", label: "Python" },
];

const DIFFICULTY_STYLES = {
  easy:   { label: "EASY",   bg: "#14532d", color: "#22C55E" },
  medium: { label: "MEDIUM", bg: "#664d03", color: "#facc15" },
  hard:   { label: "HARD",   bg: "#581c0c", color: "#ef4444" },
};

function generateQuestions() {
  const questions = [
    {
      type: "python",
      difficulty: "easy",
      question: "In Python, the keyword used to define a function is ____.",
      correct: "def",
      wrong: ["func", "define", "lambda"],
    },
    {
      type: "python",
      difficulty: "easy",
      question: "A Python list literal is written with square brackets like [1, 2, 3], so its type is ____.",
      correct: "list",
      wrong: ["tuple", "dict", "set"],
    },
    {
      type: "python",
      difficulty: "medium",
      question: "The operator used for exponentiation in Python is ____.",
      correct: "**",
      wrong: ["^", "pow", "%"],
    },
    {
      type: "python",
      difficulty: "medium",
      question: "To test inequality in Python, you use the operator ____.",
      correct: "!=",
      wrong: ["==", "not", "<>"],
    },
    {
      type: "python",
      difficulty: "hard",
      question: "A mutable built-in Python container for key/value pairs is called a ____.",
      correct: "dict",
      wrong: ["tuple", "set", "list"],
    },
    {
      type: "python",
      difficulty: "hard",
      question: "When iterating over range(5), the final value produced by the loop variable is ____.",
      correct: "4",
      wrong: ["5", "1", "0"],
    },
  ];

  return shuffle(questions);
}

function getParlayStatus(legs) {
  if (legs.some(l => l.status === "miss")) return "lost";
  if (legs.every(l => l.status === "hit"))  return "won";
  return "active";
}

// ── TEST MODE ────────────────────────────────────────────────
function TestQuizCard({ question, index, selectedAnswer, onSelect }) {
  const options = useMemo(() => shuffle([question.correct, ...question.wrong]), [question]);
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect  = selectedAnswer === question.correct;
  const difficulty = DIFFICULTY_STYLES[question.difficulty] || DIFFICULTY_STYLES.easy;

  return (
    <div style={{ background:"#111", borderRadius:12, padding:16, display:"flex", flexDirection:"column", gap:12, fontFamily:mono }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:10, color:"#22C55E", textTransform:"uppercase", letterSpacing:"0.1em" }}>
          {QUESTION_TYPES.find(t => t.key === question.type)?.label}
        </span>
        <span style={{ background:difficulty.bg, color:difficulty.color, borderRadius:999, padding:"4px 10px", fontSize:10, fontWeight:700, letterSpacing:"0.05em" }}>
          {difficulty.label}
        </span>
      </div>
      <div style={{ color:"#fff", fontSize:13, lineHeight:1.6 }}>{question.question}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {options.map((opt, i) => {
          let bg = "#1a1a1a", border = "1px solid #333", color = "#aaa";
          if (isAnswered) {
            if (opt === question.correct)     { bg = "#14532d"; border = "1.5px solid #22C55E"; color = "#22C55E"; }
            else if (opt === selectedAnswer)  { bg = "#7f1d1d"; border = "1.5px solid #EF4444"; color = "#EF4444"; }
            else                              { color = "#333"; }
          }
          return (
            <button key={i} onClick={() => !isAnswered && onSelect(index, opt)}
              style={{ background:bg, border, borderRadius:8, color, padding:"10px 12px", fontSize:12, textAlign:"left", cursor:isAnswered?"default":"pointer", fontFamily:mono, lineHeight:1.4 }}>
              <span style={{ fontWeight:700, marginRight:4 }}>{String.fromCharCode(65+i)}.</span>{opt}
            </button>
          );
        })}
      </div>
      {isAnswered && (
        <div style={{ fontSize:12, fontWeight:700, color: isCorrect ? "#22C55E" : "#EF4444" }}>
          {isCorrect ? "✓ Correct!" : `✗ Answer: ${question.correct}`}
        </div>
      )}
    </div>
  );
}

function TestModal({ onClose, parlays }) {
  const [questions,       setQuestions]       = useState(() => generateQuestions(parlays).slice(0, 5));
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [refreshCount,    setRefreshCount]    = useState(0);

  const answered = Object.keys(selectedAnswers).length;
  const correct  = Object.entries(selectedAnswers).filter(([i, a]) => a === questions[+i]?.correct).length;

  const handleRefresh = () => {
    if (refreshCount >= 3) return;
    setQuestions(generateQuestions(parlays).slice(0, 5));
    setSelectedAnswers({});
    setRefreshCount(c => c + 1);
  };

  const typeCounts = {};
  questions.forEach(q => { typeCounts[q.type] = (typeCounts[q.type] || 0) + 1; });

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }}>
      <div style={{ background:"#000", border:"1px solid #222", borderRadius:12, padding:24, width:"100%", maxWidth:540, maxHeight:"90vh", overflowY:"auto", fontFamily:mono }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>🧠 Test Mode</div>
            {answered > 0 && (
              <div style={{ color:"#22C55E", fontSize:12, marginTop:4 }}>{correct} / {answered} correct</div>
            )}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={handleRefresh} disabled={refreshCount >= 3}
              style={{ background: refreshCount >= 3 ? "#111" : "#1a1a1a", border:"1px solid #333", borderRadius:6, color: refreshCount >= 3 ? "#444" : "#888", cursor: refreshCount >= 3 ? "not-allowed" : "pointer", padding:"6px 10px", fontSize:11, fontFamily:mono }}>
              ↻ {refreshCount >= 3 ? "No refreshes left" : `${3 - refreshCount} left`}
            </button>
            <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:20 }}>×</button>
          </div>
        </div>

        {/* Category tags */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
          {QUESTION_TYPES.filter(t => typeCounts[t.key]).map(({ key, label }) => (
            <span key={key} style={{ background:"#1a1a1a", border:"1px solid #333", borderRadius:20, padding:"4px 10px", fontSize:10, color:"#22C55E", fontWeight:700, letterSpacing:"0.05em", display:"inline-flex", alignItems:"center", gap:6 }}>
              {label}
              <span style={{ background:"#14532d", borderRadius:10, padding:"1px 6px", color:"#22C55E", fontSize:10 }}>{typeCounts[key]}</span>
            </span>
          ))}
        </div>

        {/* Questions */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {questions.map((q, i) => (
            <TestQuizCard key={i} question={q} index={i}
              selectedAnswer={selectedAnswers[i]}
              onSelect={(idx, ans) => setSelectedAnswers(prev => ({ ...prev, [idx]: ans }))}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

// ── SCAN MODAL ───────────────────────────────────────────────
function ScanModal({ onClose, onScanned }) {
  const [phase, setPhase]     = useState("upload"); // upload | scanning | result | error
  const [preview, setPreview] = useState(null);
  const [result, setResult]   = useState(null);
  const [errMsg, setErrMsg]   = useState("");
  const camRef  = useRef();
  const rollRef = useRef();

  const reset = () => { setPhase("upload"); setPreview(null); setResult(null); setErrMsg(""); };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // reset input so same file can be reselected
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPreview(dataUrl);
      setPhase("scanning");
      const base64 = dataUrl.split(",")[1];
      scan(base64, file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  const scan = async (base64, mediaType) => {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY ?? "";
      if (!apiKey) throw new Error("Missing OpenAI API key. Set VITE_OPENAI_API_KEY in your env.");

      const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          max_output_tokens: 1000,
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: `Extract all parlay legs from this betting slip image. Respond with ONLY a JSON object, no other text:\n{"name":"parlay name","date":"Jun 13, 2026","stake":0,"payout":0,"legs":[{"desc":"Player: prop","game":"AWAY @ HOME"}]}`,
                },
                {
                  type: "input_image",
                  image_url: `data:${mediaType};base64,${base64}`,
                },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t.slice(0, 120)}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const raw = data.output_text
        || (data.output?.flatMap((item) => item.content?.filter((block) => block.type === "output_text").map((block) => block.text ?? "") ?? []).join("") ?? "");
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error(`Unexpected response: ${raw.slice(0, 100)}`);

      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed.legs) || parsed.legs.length === 0)
        throw new Error("No legs found in response");

      setResult(parsed);
      setPhase("result");
    } catch (err) {
      setErrMsg(err.message);
      setPhase("error");
    }
  };

  const confirm = () => {
    onScanned({
      id: Date.now(),
      name:   result.name  || "Scanned Parlay",
      date:   result.date  || new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
      stake:  parseFloat(result.stake)  || 0,
      payout: parseFloat(result.payout) || 0,
      legs:   result.legs.map((l, i) => ({ id: i+1, desc: l.desc, game: l.game || "", status: "pending" })),
    });
    onClose();
  };

  const inp = { background:"#111", border:"1px solid #333", borderRadius:6, color:"#fff", padding:"8px 12px", fontSize:13, width:"100%", fontFamily:mono, boxSizing:"border-box", outline:"none" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }}>
      <div style={{ background:"#000", border:"1px solid #222", borderRadius:12, padding:24, width:"100%", maxWidth:480, maxHeight:"88vh", overflowY:"auto", fontFamily:mono }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>📷 Scan Slip</div>
            <div style={{ color:"#666", fontSize:11, marginTop:2 }}>Upload a photo of your betting slip</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:20 }}>×</button>
        </div>

        {/* ── PHASE: upload ── */}
        {phase === "upload" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              {[
                { ref: camRef,  emoji:"📷", label:"Take Photo",   sub:"Use camera",   capture:true  },
                { ref: rollRef, emoji:"🖼️", label:"Camera Roll",  sub:"From photos",  capture:false },
              ].map(({ ref, emoji, label, sub }) => (
                <div key={label} onClick={() => ref.current.click()}
                  style={{ border:"2px dashed #333", borderRadius:10, padding:"28px 12px", textAlign:"center", cursor:"pointer" }}
                  onMouseOver={e => e.currentTarget.style.borderColor="#22C55E"}
                  onMouseOut={e  => e.currentTarget.style.borderColor="#333"}
                >
                  <div style={{ fontSize:28, marginBottom:6 }}>{emoji}</div>
                  <div style={{ color:"#fff", fontSize:12, fontWeight:700 }}>{label}</div>
                  <div style={{ color:"#555", fontSize:10, marginTop:2 }}>{sub}</div>
                </div>
              ))}
            </div>
            <div style={{ color:"#444", fontSize:10, textAlign:"center" }}>Any sportsbook · JPG, PNG, screenshot</div>
          </div>
        )}

        {/* hidden file inputs */}
        <input ref={camRef}  type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display:"none" }} />
        <input ref={rollRef} type="file" accept="image/*"                       onChange={handleFile} style={{ display:"none" }} />

        {/* ── PHASE: scanning ── */}
        {phase === "scanning" && (
          <div>
            {preview && <img src={preview} alt="slip" style={{ width:"100%", borderRadius:8, border:"1px solid #222", maxHeight:180, objectFit:"contain", background:"#111", marginBottom:14 }} />}
            <div style={{ background:"#111", borderRadius:8, padding:20, textAlign:"center" }}>
              <div style={{ fontSize:26, marginBottom:8 }}>🔍</div>
              <div style={{ color:"#fff", fontSize:13 }}>Reading your slip...</div>
              <div style={{ color:"#555", fontSize:11, marginTop:4 }}>AI is extracting legs</div>
            </div>
          </div>
        )}

        {/* ── PHASE: result ── */}
        {phase === "result" && result && (
          <div>
            {preview && <img src={preview} alt="slip" style={{ width:"100%", borderRadius:8, border:"1px solid #222", maxHeight:160, objectFit:"contain", background:"#111", marginBottom:14 }} />}

            <div style={{ color:"#22C55E", fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>
              ✓ Found {result.legs.length} leg{result.legs.length !== 1 ? "s" : ""}
            </div>

            <div style={{ background:"#111", borderRadius:8, padding:12, marginBottom:10, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[["Name", result.name], ["Date", result.date],
                ["Stake",  result.stake  ? `$${parseFloat(result.stake).toFixed(2)}`  : "—"],
                ["Payout", result.payout ? `$${parseFloat(result.payout).toFixed(2)}` : "—"],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <div style={{ color:"#555", fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em" }}>{lbl}</div>
                  <div style={{ color:"#fff", fontSize:12, marginTop:2 }}>{val || "—"}</div>
                </div>
              ))}
            </div>

            <div style={{ background:"#111", borderRadius:8, overflow:"hidden", marginBottom:16 }}>
              {result.legs.map((leg, i) => (
                <div key={i} style={{ padding:"10px 14px", borderBottom: i < result.legs.length-1 ? "1px solid #1a1a1a" : "none", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:"#1a1a1a", border:"1px solid #333", display:"flex", alignItems:"center", justifyContent:"center", color:"#555", fontSize:10, flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:"#fff", fontSize:13 }}>{leg.desc}</div>
                    {leg.game && <div style={{ color:"#555", fontSize:11, marginTop:2 }}>{leg.game}</div>}
                  </div>
                  <div style={{ color:"#22C55E", fontSize:12 }}>✓</div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={reset} style={{ flex:1, background:"none", border:"1px solid #333", borderRadius:6, color:"#888", cursor:"pointer", padding:10, fontSize:12, fontFamily:mono }}>↩ Rescan</button>
              <button onClick={confirm} style={{ flex:2, background:"#22C55E", border:"none", borderRadius:6, color:"#000", cursor:"pointer", padding:10, fontSize:13, fontWeight:700, fontFamily:mono, letterSpacing:"0.05em" }}>✓ ADD TO MY SLIPS</button>
            </div>
          </div>
        )}

        {/* ── PHASE: error ── */}
        {phase === "error" && (
          <div>
            {preview && <img src={preview} alt="slip" style={{ width:"100%", borderRadius:8, border:"1px solid #222", maxHeight:160, objectFit:"contain", background:"#111", marginBottom:14 }} />}
            <div style={{ background:"#1f0a0a", border:"1px solid #7f1d1d", borderRadius:8, padding:16, marginBottom:16, textAlign:"center" }}>
              <div style={{ fontSize:24, marginBottom:8 }}>⚠️</div>
              <div style={{ color:"#EF4444", fontSize:13, marginBottom:4 }}>Scan failed</div>
              <div style={{ color:"#994444", fontSize:11, wordBreak:"break-all" }}>{errMsg}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={reset} style={{ flex:1, background:"none", border:"1px solid #333", borderRadius:6, color:"#888", cursor:"pointer", padding:10, fontSize:12, fontFamily:mono }}>↩ Try again</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── PARLAY CARD ──────────────────────────────────────────────
function ParlayCard({ parlay, onUpdateLeg, onDelete }) {
  const [open, setOpen] = useState(true);
  const status = getParlayStatus(parlay.legs);
  const hits   = parlay.legs.filter(l => l.status === "hit").length;
  const bar    = status === "won" ? "#22C55E" : status === "lost" ? "#EF4444" : "#333";

  return (
    <div style={{ background:"#000", borderRadius:10, marginBottom:16, overflow:"hidden", fontFamily:mono, boxShadow:"0 2px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ display:"flex" }}>
        <div style={{ width:5, background:bar, flexShrink:0 }} />
        <div onClick={() => setOpen(!open)} style={{ flex:1, padding:"14px 16px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>{parlay.name}</div>
            <div style={{ color:"#aaa", fontSize:11, marginTop:3 }}>
              {parlay.date} · {parlay.legs.length}-leg · <span style={{ color:"#fff" }}>{hits}/{parlay.legs.length} hit</span>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4, color: status==="won" ? "#22C55E" : status==="lost" ? "#EF4444" : "#aaa" }}>
              {status==="won" ? "✓ WON" : status==="lost" ? "✕ LOST" : "● ACTIVE"}
            </div>
            <div style={{ color:"#888", fontSize:11 }}>
              ${parlay.stake.toFixed(2)} → <span style={{ color:"#22C55E" }}>${parlay.payout.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <button onClick={() => onDelete(parlay.id)} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", padding:"0 14px", fontSize:18 }}>×</button>
      </div>

      {open && (
        <div style={{ borderTop:"1px solid #1a1a1a" }}>
          {parlay.legs.map((leg, i) => (
            <div key={leg.id} style={{ display:"flex", alignItems:"center", padding:"10px 16px 10px 21px", borderBottom: i < parlay.legs.length-1 ? "1px solid #1a1a1a" : "none", background: leg.status==="hit" ? "#0a1f0e" : leg.status==="miss" ? "#1f0a0a" : "transparent", gap:12 }}>
              <div style={{ display:"flex", gap:4 }}>
                {["hit","miss","pending"].map(s => (
                  <button key={s} onClick={() => onUpdateLeg(parlay.id, leg.id, s)} style={{ width:22, height:22, borderRadius:4, border: leg.status===s ? `1.5px solid ${S[s].color}` : "1px solid #333", background: leg.status===s ? S[s].activeBg : "#111", color: leg.status===s ? S[s].color : "#444", cursor:"pointer", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
                    {S[s].label}
                  </button>
                ))}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color: leg.status==="hit" ? "#22C55E" : leg.status==="miss" ? "#555" : "#fff", fontSize:13, textDecoration: leg.status==="miss" ? "line-through" : "none" }}>{leg.desc}</div>
                {leg.game && <div style={{ color:"#555", fontSize:11, marginTop:2 }}>{leg.game}</div>}
              </div>
              <div style={{ color:S[leg.status].color, fontSize:16, fontWeight:700, width:20, textAlign:"center" }}>
                {leg.status !== "pending" && S[leg.status].label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ADD MODAL ────────────────────────────────────────────────
function AddModal({ onClose, onAdd }) {
  const [name,   setName]   = useState("");
  const [date,   setDate]   = useState("");
  const [stake,  setStake]  = useState("");
  const [payout, setPayout] = useState("");
  const [legs,   setLegs]   = useState([{ desc:"", game:"" }]);

  const addLeg    = ()        => setLegs([...legs, { desc:"", game:"" }]);
  const updLeg    = (i,f,v)   => { const u=[...legs]; u[i][f]=v; setLegs(u); };
  const remLeg    = (i)       => setLegs(legs.filter((_,x) => x!==i));
  const submit    = ()        => {
    if (!name || legs.some(l => !l.desc)) return;
    onAdd({ id:Date.now(), name, date: date||new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), stake:parseFloat(stake)||0, payout:parseFloat(payout)||0, legs:legs.filter(l=>l.desc).map((l,i)=>({id:i+1,...l,status:"pending"})) });
    onClose();
  };

  const inp = { background:"#111", border:"1px solid #333", borderRadius:6, color:"#fff", padding:"8px 12px", fontSize:13, width:"100%", fontFamily:mono, boxSizing:"border-box", outline:"none" };
  const lbl = { color:"#888", fontSize:11, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.08em" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 }}>
      <div style={{ background:"#000", border:"1px solid #222", borderRadius:12, padding:24, width:"100%", maxWidth:480, maxHeight:"85vh", overflowY:"auto", fontFamily:mono }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>New Parlay</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#666", cursor:"pointer", fontSize:20 }}>×</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[["Name","text",name,setName,"Tonight's picks"],["Date","text",date,setDate,"Jun 13, 2026"],["Stake ($)","number",stake,setStake,"0.99"],["Payout ($)","number",payout,setPayout,"30.00"]].map(([l,t,v,s,p])=>(
            <div key={l}><div style={lbl}>{l}</div><input style={inp} type={t} value={v} onChange={e=>s(e.target.value)} placeholder={p}/></div>
          ))}
        </div>
        <div style={lbl}>Legs</div>
        {legs.map((leg,i)=>(
          <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
            <div style={{ color:"#444", fontSize:11, minWidth:16 }}>{i+1}.</div>
            <input style={{...inp,flex:2}} value={leg.desc} onChange={e=>updLeg(i,"desc",e.target.value)} placeholder="Trout 1+ hits"/>
            <input style={{...inp,flex:1}} value={leg.game} onChange={e=>updLeg(i,"game",e.target.value)} placeholder="TB @ LAA"/>
            {legs.length>1 && <button onClick={()=>remLeg(i)} style={{ background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:16 }}>×</button>}
          </div>
        ))}
        <button onClick={addLeg} style={{ background:"none",border:"1px dashed #333",borderRadius:6,color:"#555",cursor:"pointer",padding:"8px 12px",fontSize:12,width:"100%",marginBottom:20,fontFamily:mono }}>+ Add leg</button>
        <button onClick={submit} style={{ background:"#22C55E",border:"none",borderRadius:6,color:"#000",cursor:"pointer",padding:"11px 16px",fontSize:13,fontWeight:700,width:"100%",fontFamily:mono,letterSpacing:"0.05em" }}>SAVE PARLAY</button>
      </div>
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────
export default function Parlay2() {
  const [parlays,   setParlays]  = useState(initialParlays);
  const [showAdd,   setShowAdd]  = useState(false);
  const [showScan,  setShowScan] = useState(false);
  const [showTest,  setShowTest] = useState(false);

  const updateLeg    = (pid,lid,s) => setParlays(p=>p.map(x=>x.id===pid?{...x,legs:x.legs.map(l=>l.id===lid?{...l,status:s}:l)}:x));
  const addParlay    = (p)         => setParlays(prev=>[p,...prev]);
  const deleteParlay = (id)        => setParlays(prev=>prev.filter(p=>p.id!==id));

  const won  = parlays.filter(p=>getParlayStatus(p.legs)==="won");
  const lost = parlays.filter(p=>getParlayStatus(p.legs)==="lost");
  const act  = parlays.filter(p=>getParlayStatus(p.legs)==="active");
  const pnl  = won.reduce((s,p)=>s+p.payout,0) - parlays.reduce((s,p)=>s+p.stake,0);

  return (
    <div style={{ minHeight:"100vh", background:"#fff", fontFamily:mono, padding:"24px 16px", maxWidth:540, margin:"0 auto" }}>

      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, color:"#999", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:4 }}>Parlay Tracker</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:26, fontWeight:700, color:"#000", letterSpacing:"-0.02em" }}>MY SLIPS</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setShowTest(true)} style={{ background:"#000",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",padding:"9px 14px",fontSize:12,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.04em" }}>🧠 TEST</button>
            <button onClick={()=>setShowScan(true)} style={{ background:"#000",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",padding:"9px 14px",fontSize:12,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.04em" }}>📷 SCAN</button>
            <button onClick={()=>setShowAdd(true)}  style={{ background:"#000",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",padding:"9px 14px",fontSize:12,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.04em" }}>+ NEW</button>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:24 }}>
        {[["Active",act.length,"#fff"],["Won",won.length,"#22C55E"],["Lost",lost.length,"#EF4444"],["P&L",`$${pnl.toFixed(2)}`,pnl>=0?"#22C55E":"#EF4444"]].map(([l,v,c])=>(
          <div key={l} style={{ background:"#000", borderRadius:8, padding:"12px 12px 10px" }}>
            <div style={{ color:"#888", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>{l}</div>
            <div style={{ color:c, fontSize:20, fontWeight:700 }}>{v}</div>
          </div>
        ))}
      </div>

      {parlays.length===0 ? (
        <div style={{ textAlign:"center", color:"#bbb", padding:"60px 0", border:"2px dashed #eee", borderRadius:10 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🎰</div>
          <div style={{ fontSize:13 }}>No slips yet.</div>
          <div style={{ fontSize:12, color:"#ccc", marginTop:4 }}>Tap SCAN or + NEW to get started.</div>
        </div>
      ) : (
        parlays.map(p=><ParlayCard key={p.id} parlay={p} onUpdateLeg={updateLeg} onDelete={deleteParlay}/>)
      )}

      {showTest && <TestModal onClose={()=>setShowTest(false)} parlays={parlays}/>}
      {showScan && <ScanModal onClose={()=>setShowScan(false)} onScanned={addParlay}/>}
      {showAdd  && <AddModal  onClose={()=>setShowAdd(false)}  onAdd={addParlay}/>}
    </div>
  );
}

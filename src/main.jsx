import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, BookOpen, Code2, Layers, Play, Pause, SkipBack, SkipForward, RotateCcw, MousePointerClick, Sparkles } from 'lucide-react';
import { ALGOS, UNITS } from './algos.js';
import './style.css';

function Array_({ s }) {
  const max = Math.max(...s.arr, 1);
  return <div className="bars">{s.arr.map((v, i) => <div className="col" key={i}><span>{v}</span><div className={`bar ${s.hi?.includes(i) ? 'hi' : s.cmp?.includes(i) ? 'cmp' : s.done ? 'ok' : ''}`} style={{ height: `${Math.max(8, (Math.abs(v) / max) * 100)}%` }} /><small>{i}</small></div>)}</div>;
}
function Graph({ s }) {
  const n = s.nodes.length, P = {}; s.nodes.forEach((v, i) => { const a = (2 * Math.PI * i) / n - Math.PI / 2; P[v] = [210 + 150 * Math.cos(a), 170 + 130 * Math.sin(a)]; });
  return <div className="gwrap"><svg viewBox="0 0 420 340" role="img" aria-label="Graph">
    {s.edges.map((e, i) => { const k = [e.u, e.v].sort().join('|'), [x1, y1] = P[e.u], [x2, y2] = P[e.v]; const c = s.curEdge === k ? 'cur' : s.tree.includes(k) ? 'tree' : s.rej.includes(k) ? 'rej' : '';
      return <g key={i}><line className={`edge ${c}`} x1={x1} y1={y1} x2={x2} y2={y2} />{e.w !== 1 || s.edges.some((x) => x.w !== 1) ? <text className="w" x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 5}>{e.w}</text> : null}</g>; })}
    {s.nodes.map((v) => <g key={v}><circle className={`node ${s.cur === v ? 'cur' : s.vis.includes(v) ? 'vis' : ''}`} cx={P[v][0]} cy={P[v][1]} r="17" /><text x={P[v][0]} y={P[v][1] + 5} textAnchor="middle">{v}</text></g>)}
  </svg>{s.list && <div className="list"><b>{s.listName}:</b> [{s.list.join(', ')}]</div>}</div>;
}
function Table({ s }) {
  return <div className="scroll"><table><thead><tr>{s.head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead><tbody>{s.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={s.hi.some(([a, b]) => a === i && b === j) ? 'hi' : ''}>{c}</td>)}</tr>)}</tbody></table></div>;
}
function Board({ s }) {
  return <div className="board" style={{ gridTemplateColumns: `repeat(${s.n},1fr)` }}>{Array.from({ length: s.n * s.n }, (_, k) => { const r = Math.floor(k / s.n), c = k % s.n; return <div key={k} className={`sq ${(r + c) % 2 ? 'dk' : ''} ${s.bad && s.bad[0] === r && s.bad[1] === c ? 'bad' : ''}`}>{s.q[r] === c ? '♛' : ''}</div>; })}</div>;
}
function Subset({ s }) {
  return <div className="subset-view">
    <div className="subset-metrics">
      <div><small>Current sum</small><b>{s.sum}</b></div>
      <span aria-hidden="true">/</span>
      <div><small>Target</small><b>{s.target}</b></div>
      <div className="subset-found"><small>Solutions found</small><b>{s.solutionCount}</b></div>
    </div>
    <div className="subset-items" aria-label="Subset decisions">
      {s.values.map((value, index) => {
        const decision = s.decisions[index];
        const state = decision === true ? 'included' : decision === false ? 'excluded' : '';
        return <div className={`subset-item ${state} ${s.current === index ? 'current' : ''}`} key={index}>
          <small>ITEM {index + 1}</small>
          <b>{value}</b>
          <span>{decision === true ? 'Include' : decision === false ? 'Exclude' : s.current === index ? 'Choose' : 'Pending'}</span>
        </div>;
      })}
    </div>
    <div className="subset-solutions">
      <div className="subset-solutions-head"><b>Matching subsets</b><span>{s.solutionCount ? 'Most recent shown' : 'Search in progress'}</span></div>
      {s.solutions.length ? <div className="subset-solution-list">{s.solutions.map((solution, index) => <span key={`${s.solutionCount}-${index}`}>[{solution.join(', ')}]</span>)}</div> : <p>Include or exclude each value to explore the search tree.</p>}
    </div>
  </div>;
}
const VIEWS = { array: Array_, graph: Graph, table: Table, board: Board, subset: Subset };

const LEGEND = {
  array: [['hi', 'Current'], ['cmp', 'Compared'], ['ok', 'Final']],
  graph: [['hi', 'Current vertex'], ['ok', 'Visited / in tree'], ['bad', 'Rejected edge']],
  table: [['hi', 'Cell being computed']],
  board: [['bad', 'Attacked square']],
  subset: [['hi', 'Current decision'], ['ok', 'Included'], ['bad', 'Excluded']],
};
const Logo = () => <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="7" fill="#2f5bea" /><rect x="6" y="15" width="4" height="9" rx="1" fill="#fff" /><rect x="13" y="9" width="4" height="15" rx="1" fill="#fff" /><rect x="20" y="12" width="4" height="12" rx="1" fill="#9fb6ff" /></svg>;
const PSEUDO_TOKENS = /(\/\/.*|\b(?:ALGORITHM|PROCEDURE|FUNCTION|FOR|TO|DOWNTO|WHILE|IF|ELSE|RETURN|AND|OR|NOT|TRUE|FALSE|IN|DO|THEN|BREAK|CONTINUE|ADD|APPEND|REVERSE|COPY|CREATE|INITIALIZED|EMPTY|SORT|SWAP|WITH|EACH|IS|BY|NONDECREASING|NONINCREASING|MIN|MAX|FLOOR|LENGTH|NUMBER|OF|ITEMS|VERTEX|NEIGHBOR|NEIGHBORS|EDGE|WEIGHT|VISIT|ENQUEUE|DEQUEUE|PUSH|POP|UNION|FIND|MAKE-SET|SAFE|TO|LIST|ON|INTO|FROM|SUM)\b|←|≠|≤|≥|×|\b\d+\b|[=<>+\-*/()[\]{}.,:|])/gi;
const PSEUDO_KEYWORDS = new Set('algorithm procedure function for to downto while if else return and or not true false in do then break continue add append reverse copy create initialized empty sort swap with each is by nondecreasing nonincreasing min max floor length number of items vertex neighbor neighbors edge weight visit enqueue dequeue push pop union find make-set safe list on into from sum'.split(' '));

function Pseudocode({ lines }) {
  return <ol className="pseudo-code">{lines.map((line, lineIndex) => (
    <li key={lineIndex}><code>{line.split(PSEUDO_TOKENS).map((part, partIndex) => {
      if (!part) return null;
      const token = part.toLowerCase();
      const kind = part.startsWith('//') ? 'comment' : PSEUDO_KEYWORDS.has(token) ? 'keyword' : /^\d+$/.test(part) ? 'number' : /^(←|≠|≤|≥|×|[=<>+\-*/])$/.test(part) ? 'operator' : '';
      return <span className={kind ? `pseudo-${kind}` : undefined} key={partIndex}>{part}</span>;
    })}</code></li>
  ))}</ol>;
}

function App() {
  const [ai, setAi] = useState(0), a = ALGOS[ai];
  const [vals, setVals] = useState(a.samples[0]);
  const [err, setErr] = useState(''), [run, setRun] = useState(null), [i, setI] = useState(0), [play, setPlay] = useState(false), [speed, setSpeed] = useState(700);
  const reset = () => { setRun(null); setErr(''); setPlay(false); };
  const pick = (k) => { setAi(k); setVals(ALGOS[k].samples[0]); reset(); };
  const go = () => { try { const r = a.run(vals); setRun(r); setI(0); setErr(''); setPlay(r.steps.length > 1); } catch (e) { setRun(null); setPlay(false); setErr(e.message); } };
  const n = run?.steps.length || 0;
  useEffect(() => { if (!play) return; const t = setInterval(() => setI((x) => { if (x >= n - 1) { setPlay(false); return x; } return x + 1; }), speed); return () => clearInterval(t); }, [play, speed, n]);
  const s = run?.steps[i], View = s && VIEWS[s.view], fin = run && i === n - 1;
  const set = (k, v) => setVals({ ...vals, [k]: v });
  return <div className="page">
    <header className="top">
      <div className="top-in">
        <a className="brand" href="#top" aria-label="AlgoArena home"><Logo /><span><b>AlgoArena</b><small>ALGORITHM WORKBENCH</small></span></a>
        <div className="top-right"><span className="online"><i />Interactive lab</span><a href="#workspace">Workspace</a><a href="#learning-notes">Learning notes</a></div>
      </div>
    </header>
    <div className="shell" id="top">
      <section className="welcome">
        <div className="welcome-copy">
          <span className="eyebrow"><Sparkles size={14} /> LEARN BY VISUALIZING</span>
          <h2>Make algorithms <span>make sense.</span></h2>
          <p>Explore the logic, step through every decision, and see how your input shapes the result.</p>
        </div>
        <div className="welcome-stats">
          <div><span className="stat-icon"><Layers size={17} /></span><span><b>{ALGOS.length}</b><small>algorithms</small></span></div>
          <div><span className="stat-icon"><Activity size={17} /></span><span><b>{UNITS.length}</b><small>learning tracks</small></span></div>
        </div>
      </section>
      <div className="workspace-heading" id="workspace">
        <div><span className="eyebrow">YOUR WORKSPACE</span><h2>Simulation studio</h2></div>
        <span className="workspace-hint"><span className="live-dot" /> Ready when you are</span>
      </div>
      <div className="layout">
      <aside className="setup">
        <section>
          <div className="section-kicker">STEP 01</div><h2><i>1</i>Choose an algorithm</h2>
          <select aria-label="Algorithm" value={ai} onChange={(e) => pick(+e.target.value)}>{UNITS.map((u, ui) => <optgroup key={u} label={u}>{ALGOS.map((x, k) => x.unit === ui && <option key={k} value={k}>{x.name}</option>)}</optgroup>)}</select>
          <p className="desc">{a.desc}</p>
          <dl className="cx"><div><dt>Time complexity</dt><dd>{a.time}</dd></div><div><dt>Space complexity</dt><dd>{a.space}</dd></div></dl>
        </section>
        <section>
          <div className="section-kicker">STEP 02</div><h2><i>2</i>Configure input</h2>
          <div className="fields">{a.fields.map((f) => <label key={f.k} className={f.short ? 'short' : ''}>{f.label}{f.rows ? <textarea rows={f.rows} value={vals[f.k] ?? ''} onChange={(e) => set(f.k, e.target.value)} spellCheck="false" /> : <input value={vals[f.k] ?? ''} onChange={(e) => set(f.k, e.target.value)} spellCheck="false" />}</label>)}</div>
          <div className="samples"><span>Try a sample</span>{a.samples.map((sm, k) => <button key={k} className="chip" onClick={() => { setVals(sm); reset(); }}>Example {k + 1}</button>)}</div>
        </section>
        <section>
          <div className="section-kicker">STEP 03</div><h2><i>3</i>Run simulation</h2>
          <button className="run" onClick={go}><Play size={17} fill="currentColor" />Start visualization</button>
          {err && <p className="err" role="alert"><b>Check your input.</b> {err}</p>}
        </section>
      </aside>
      <main className="work">
        <section className="stage" aria-label="Simulation">
          <div className="stage-head"><div><span className="section-kicker">LIVE VISUALIZATION</span><h2>{a.name}</h2></div>{run && <span className="badge">{fin ? 'Complete' : `Step ${i + 1} / ${n}`}</span>}</div>
          {run && <div className="progress-track" role="progressbar" aria-label="Simulation progress" aria-valuenow={i + 1} aria-valuemin="1" aria-valuemax={n}><span style={{ width: `${((i + 1) / n) * 100}%` }} /></div>}
          {run ? <>
            <div className="viz">{View && <View s={s} />}</div>
            <div className="legend">{LEGEND[s.view].map(([c, t]) => <span key={t}><i className={`sw ${c}`} />{t}</span>)}</div>
            <p className="msg" aria-live="polite">{s.msg}</p>
            <div className="bar-ctl">
              <div className="btns">
                <button onClick={() => { setPlay(false); setI(0); }} title="Restart" aria-label="Restart"><RotateCcw size={16} /></button>
                <button onClick={() => { setPlay(false); setI(Math.max(0, i - 1)); }} title="Previous step" aria-label="Previous step"><SkipBack size={16} /></button>
                <button className="main" onClick={() => { if (i >= n - 1) setI(0); setPlay(!play); }} title={play ? 'Pause' : 'Play'} aria-label={play ? 'Pause' : 'Play'}>{play ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
                <button onClick={() => { setPlay(false); setI(Math.min(n - 1, i + 1)); }} title="Next step" aria-label="Next step"><SkipForward size={16} /></button>
              </div>
              <input className="seek" type="range" min="0" max={n - 1} value={i} onChange={(e) => { setPlay(false); setI(+e.target.value); }} aria-label="Step" />
              <label className="spd">Speed<select value={speed} onChange={(e) => setSpeed(+e.target.value)}><option value="1400">Slow</option><option value="700">Normal</option><option value="250">Fast</option></select></label>
            </div>
          </> : <div className="empty"><span className="empty-icon"><MousePointerClick size={23} /></span><p className="empty-title">Your canvas is ready</p><p>Choose an algorithm and start a visualization to explore it step by step.</p><div className="empty-flow"><span>Configure input</span><b>→</b><span>Run simulation</span><b>→</b><span>Explore result</span></div></div>}
        </section>
        <section className="result" id="learning-notes" aria-label="Learning notes">
          <div className="result-heading"><span className="notes-icon"><BookOpen size={17} /></span><div><span className="section-kicker">CONCEPTS &amp; ANALYSIS</span><h2>Learning notes</h2></div></div>
          {run && fin ? <>
            <div className="answer"><small>Final output</small><p>{run.out}</p></div>
            <p className="why">{run.why}</p>
            <div className="stats">
              <div><h3>Measured on this input</h3><ul>{Object.entries(run.counts).map(([k, v]) => <li key={k}><b>{v}</b>{k}</li>)}</ul></div>
              <div><h3>Theoretical complexity</h3><ul><li><b>{a.time}</b>Time</li><li><b>{a.space}</b>Space</li></ul></div>
            </div>
          </> : <p className="hold">{run ? 'Complete the step-through to reveal the final output and measured statistics.' : 'Run a simulation to see its output, then compare measured operations with theoretical complexity.'}</p>}
          <details className="code-panel" open>
            <summary><Code2 size={16} />Algorithm pseudocode <span>{a.pseudo.length} lines</span></summary>
            <div className="pseudo-wrap"><Pseudocode lines={a.pseudo} /></div>
            {(a.name === 'Linear Search' || a.name === 'Binary Search') && <p className="pseudo-note">The simulator sorts a copy of the input before tracing. The listed complexity describes the search phase, not that setup step.</p>}
          </details>
        </section>
      </main>
      </div>
    </div>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);

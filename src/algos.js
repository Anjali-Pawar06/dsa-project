import { makeSortSteps, makeSearchSteps } from './legacy.js';
const E = (m) => { throw new Error(m); };
export const nums = (s, name = 'values') => {
  const t = String(s).trim().split(/[\s,;]+/).filter(Boolean);
  if (!t.length) E(`Enter at least one number for ${name}.`);
  return t.map((x) => (Number.isFinite(+x) ? +x : E(`"${x}" is not a number in ${name}.`)));
};
const lines = (s) => String(s).split(/\n|;/).map((l) => l.trim()).filter(Boolean);
const edgeList = (s, weighted) => {
  const es = lines(s).map((l) => {
    const p = l.split(/[\s,:-]+/).filter(Boolean);
    if (p.length < 2 || p.length > 3) E(`Bad edge "${l}". Use ${weighted ? 'A B 4' : 'A B'} on each line.`);
    const w = weighted ? (p[2] === undefined ? E(`Edge "${l}" needs a weight, e.g. A B 4.`) : +p[2]) : 1;
    if (!Number.isFinite(w)) E(`Weight in "${l}" is not a number.`);
    if (p[0] === p[1]) E(`Edge "${l}" is a self-loop.`);
    return { u: p[0], v: p[1], w };
  });
  if (!es.length) E('Enter at least one edge.');
  return es;
};
const vertsOf = (es) => [...new Set(es.flatMap((e) => [e.u, e.v]))].sort();
const key = (a, b) => [a, b].sort().join('|');
const adjOf = (es) => { const a = {}; vertsOf(es).forEach((v) => (a[v] = [])); es.forEach((e) => { a[e.u].push(e.v); a[e.v].push(e.u); }); Object.values(a).forEach((l) => l.sort()); return a; };
const G = (es, o) => ({ view: 'graph', edges: es, nodes: vertsOf(es), vis: [], tree: [], cur: null, curEdge: null, rej: [], ...o });

function sortRun(name) {
  return ({ main }) => {
    const a = nums(main); if (a.length > 16) E('Use at most 16 numbers.');
    const raw = makeSortSteps(a, name);
    const steps = raw.map((s) => ({ view: 'array', msg: s.line, arr: s.array, hi: s.active, cmp: s.compared, done: s.kind === 'done' && s === raw[raw.length - 1] }));
    const comparisons = raw.filter((s) => s.kind === 'compare').length, swaps = raw.reduce((n, s) => n + (s.swaps || 0), 0);
    return { steps, out: `Sorted array: [${raw[raw.length - 1].array.join(', ')}]`, why: `${name} rearranged the ${a.length} input values into ascending order.`, counts: name === 'Insertion Sort' ? { Comparisons: comparisons, Shifts: raw.filter((s) => s.kind === 'shift').length } : { Comparisons: comparisons, Swaps: swaps } };
  };
}
function searchRun(name) {
  return ({ main, target }) => {
    const a = nums(main), t = nums(target, 'target')[0];
    const raw = makeSearchSteps(a, name, t), last = raw[raw.length - 1];
    const idx = last.found ? last.active[0] : -1;
    const steps = raw.map((s) => ({ view: 'array', msg: s.line, arr: s.array, hi: s.active, cmp: s.compared }));
    return { steps, out: idx >= 0 ? `${t} found at index ${idx} (of the sorted array [${raw[0].array.join(', ')}])` : `${t} is not in the array`, why: 'The search runs on the ascending-sorted copy of your input.', counts: { Comparisons: raw.filter((s) => s.kind === 'compare').length } };
  };
}
function traverse(kind) {
  return ({ edges, start }) => {
    const es = edgeList(edges, false), adj = adjOf(es), s = start.trim();
    if (!adj[s]) E(`Start vertex "${s}" is not in the graph. Vertices: ${Object.keys(adj).join(', ')}.`);
    const steps = [], vis = [], tree = [], order = [], seen = new Set([s]), list = [s]; let nodes = 0;
    const snap = (msg, o) => steps.push(G(es, { msg, vis: [...vis], tree: [...tree], list: [...list], listName: kind === 'BFS' ? 'Queue' : 'Stack', ...o }));
    snap(`Start at ${s}. ${kind === 'BFS' ? 'Enqueue' : 'Push'} it.`, { cur: s });
    const parent = {}; const seenDfs = new Set();
    while (list.length) {
      const v = kind === 'BFS' ? list.shift() : list.pop();
      if (kind === 'DFS') { if (seenDfs.has(v)) continue; seenDfs.add(v); }
      vis.push(v); order.push(v); nodes++;
      if (parent[v]) tree.push(key(parent[v], v));
      const nb = adj[v].filter((n) => (kind === 'BFS' ? !seen.has(n) : !seenDfs.has(n)));
      snap(`Visit ${v}. Unvisited neighbours: ${nb.join(', ') || 'none'}.`, { cur: v });
      if (kind === 'BFS') nb.forEach((n) => { seen.add(n); parent[n] = v; list.push(n); });
      else [...nb].reverse().forEach((n) => { parent[n] = v; list.push(n); });
    }
    const un = Object.keys(adj).filter((v) => !vis.includes(v));
    snap(`Done. ${kind === 'BFS' ? 'Queue' : 'Stack'} is empty.`, {});
    return { steps, out: `${kind} order: ${order.join(' → ')}` + (un.length ? `. Not reachable from ${s}: ${un.join(', ')} (disconnected graph)` : ''), why: `Starting from ${s}, vertices are taken from a ${kind === 'BFS' ? 'FIFO queue' : 'LIFO stack'}; each is visited once.`, counts: { 'Visited vertices': nodes, 'Edges scanned': es.length * 2 } };
  };
}
function kruskal({ edges }) {
  const es = edgeList(edges, true), vs = vertsOf(es), p = Object.fromEntries(vs.map((v) => [v, v]));
  const f = (x) => (p[x] === x ? x : (p[x] = f(p[x])));
  const sorted = [...es].sort((a, b) => a.w - b.w), tree = [], rej = [], steps = []; let total = 0, checks = 0;
  const snap = (msg, ce) => steps.push(G(es, { msg, tree: [...tree], rej: [...rej], curEdge: ce ? key(ce.u, ce.v) : null }));
  snap('Edges sorted by weight: ' + sorted.map((e) => `${e.u}${e.v}(${e.w})`).join(', '));
  sorted.forEach((e) => {
    checks++;
    if (f(e.u) !== f(e.v)) { p[f(e.u)] = f(e.v); tree.push(key(e.u, e.v)); total += e.w; snap(`Take ${e.u}-${e.v} (${e.w}): it joins two different components.`, e); }
    else { rej.push(key(e.u, e.v)); snap(`Skip ${e.u}-${e.v} (${e.w}): ${e.u} and ${e.v} are already connected (would form a cycle).`, e); }
  });
  const comps = new Set(vs.map(f)).size;
  return { steps, out: `${comps > 1 ? 'Minimum spanning forest' : 'MST'} total weight = ${total}; edges: ${tree.map((k) => k.replace('|', '-')).join(', ')}` + (comps > 1 ? `. Graph is disconnected (${comps} components).` : ''), why: 'Edges are scanned from lightest to heaviest and kept only if they do not close a cycle (union-find).', counts: { 'Edges examined': checks, 'Edges accepted': tree.length } };
}
function prim({ edges, start }) {
  const es = edgeList(edges, true), vs = vertsOf(es), s = start.trim();
  if (!vs.includes(s)) E(`Start vertex "${s}" is not in the graph. Vertices: ${vs.join(', ')}.`);
  const inT = new Set([s]), tree = [], steps = []; let total = 0, scans = 0;
  const snap = (msg, ce) => steps.push(G(es, { msg, vis: [...inT], tree: [...tree], curEdge: ce ? key(ce.u, ce.v) : null }));
  snap(`Start the tree at ${s}.`);
  for (;;) {
    const cand = es.filter((e) => inT.has(e.u) !== inT.has(e.v)); scans += cand.length;
    if (!cand.length) break;
    const b = cand.reduce((m, e) => (e.w < m.w ? e : m)); const nv = inT.has(b.u) ? b.v : b.u;
    inT.add(nv); tree.push(key(b.u, b.v)); total += b.w;
    snap(`Cheapest edge leaving the tree: ${b.u}-${b.v} (${b.w}). Add ${nv}.`, b);
  }
  const un = vs.filter((v) => !inT.has(v));
  return { steps, out: `MST weight = ${total}; edges: ${tree.map((k) => k.replace('|', '-')).join(', ')}` + (un.length ? `. Not reachable from ${s}: ${un.join(', ')} (disconnected).` : ''), why: 'Prim repeatedly adds the cheapest edge that connects the tree to a new vertex.', counts: { 'Candidate edges scanned': scans, 'Vertices added': inT.size } };
}
const tbl = (msg, head, rows, hi = []) => ({ view: 'table', msg, head, rows: rows.map((r) => [...r]), hi });
function fracKnap({ w, v, cap }) {
  const W = nums(w, 'weights'), V = nums(v, 'values'), C = nums(cap, 'capacity')[0];
  if (W.length !== V.length) E('Weights and values need the same number of items.');
  if (W.some((x) => x <= 0) || C < 0) E('Weights must be positive and capacity non-negative.');
  const it = W.map((x, i) => ({ i: i + 1, w: x, v: V[i], r: V[i] / x })).sort((a, b) => b.r - a.r);
  let left = C, tot = 0; const rows = it.map((x) => [`Item ${x.i}`, x.w, x.v, x.r.toFixed(2), '-']); const steps = [tbl(`Sort items by value/weight ratio. Capacity = ${C}.`, ['Item', 'Weight', 'Value', 'Ratio', 'Fraction taken'], rows)];
  it.forEach((x, k) => {
    const fr = left <= 0 ? 0 : Math.min(1, left / x.w); rows[k][4] = fr === 1 ? '1 (whole)' : fr.toFixed(3); tot += fr * x.v; left -= fr * x.w;
    steps.push(tbl(`${fr === 1 ? 'Take all of' : fr > 0 ? 'Take a fraction of' : 'No room for'} item ${x.i}. Remaining capacity ${+left.toFixed(3)}, value so far ${+tot.toFixed(3)}.`, steps[0].head, rows, [[k, 4]]));
  });
  return { steps, out: `Maximum value = ${+tot.toFixed(4)}`, why: 'Items are taken in decreasing value/weight order; the last one may be split.', counts: { 'Items considered': it.length } };
}
function knap01({ w, v, cap }) {
  const W = nums(w, 'weights'), V = nums(v, 'values'), C = nums(cap, 'capacity')[0];
  if (W.length !== V.length) E('Weights and values need the same number of items.');
  if ([...W, C].some((x) => !Number.isInteger(x) || x < 0) || W.some((x) => x === 0)) E('Weights and capacity must be whole numbers (weights ≥ 1).');
  if (C > 30 || W.length > 8) E('Keep capacity ≤ 30 and at most 8 items so the table stays readable.');
  const n = W.length, dp = Array.from({ length: n + 1 }, () => Array(C + 1).fill(0)), head = ['i \\ cap', ...Array.from({ length: C + 1 }, (_, c) => c)]; let cells = 0;
  const T = (m, hi) => tbl(m, head, dp.map((r, i) => [i === 0 ? 'none' : `item ${i}`, ...r]), hi);
  const steps = [T('Row 0 = no items, so every value is 0.')];
  for (let i = 1; i <= n; i++) for (let c = 0; c <= C; c++) {
    cells++; const skip = dp[i - 1][c]; let m = `Item ${i} (w=${W[i - 1]}, v=${V[i - 1]}), cap ${c}: `;
    if (W[i - 1] <= c) { const tk = V[i - 1] + dp[i - 1][c - W[i - 1]]; dp[i][c] = Math.max(skip, tk); m += `max(skip=${skip}, take=${tk}) = ${dp[i][c]}`; } else { dp[i][c] = skip; m += `too heavy, copy ${skip}`; }
    steps.push(T(m, [[i, c + 1]]));
  }
  const pick = []; for (let i = n, c = C; i > 0; i--) if (dp[i][c] !== dp[i - 1][c]) { pick.push(i); c -= W[i - 1]; }
  return { steps, out: `Maximum value = ${dp[n][C]}; items chosen: ${pick.reverse().join(', ') || 'none'}`, why: 'Each cell is the best value using the first i items with that capacity; backtracking through the table recovers the chosen items.', counts: { 'Table cells filled': cells } };
}
function activity({ s, f }) {
  const S = nums(s, 'start times'), F = nums(f, 'finish times');
  if (S.length !== F.length) E('Start and finish lists must have the same length.');
  if (S.some((x, i) => x >= F[i])) E('Every activity must start before it finishes.');
  const a = S.map((x, i) => ({ id: i + 1, s: x, f: F[i] })).sort((p, q) => p.f - q.f), chosen = []; let last = -Infinity;
  const rows = a.map((x) => [`A${x.id}`, x.s, x.f, '-']), head = ['Activity', 'Start', 'Finish', 'Decision'], steps = [tbl('Sort activities by finish time.', head, rows)];
  a.forEach((x, k) => { if (x.s >= last) { chosen.push(x.id); last = x.f; rows[k][3] = 'selected'; } else rows[k][3] = 'rejected'; steps.push(tbl(`A${x.id} (${x.s}–${x.f}): ${rows[k][3] === 'selected' ? 'starts after the last selected activity ends, so select it' : 'overlaps the last selected activity, so reject it'}.`, head, rows, [[k, 3]])); });
  return { steps, out: `Selected ${chosen.length} activities: ${chosen.map((i) => 'A' + i).join(', ')}`, why: 'Always pick the compatible activity that finishes earliest.', counts: { 'Activities checked': a.length } };
}
function jobs({ ids, d, p }) {
  const I = String(ids).trim().split(/[\s,;]+/).filter(Boolean), D = nums(d, 'deadlines'), P = nums(p, 'profits');
  if (I.length !== D.length || D.length !== P.length) E('Job IDs, deadlines and profits must have the same length.');
  if (D.some((x) => !Number.isInteger(x) || x < 1)) E('Deadlines must be whole numbers ≥ 1.');
  const J = I.map((x, i) => ({ id: x, d: D[i], p: P[i] })).sort((a, b) => b.p - a.p), md = Math.min(Math.max(...D), J.length), slot = Array(md).fill('-'), steps = [];
  const head = Array.from({ length: md }, (_, i) => `Slot ${i + 1}`); let tot = 0, checks = 0;
  const snap = (m, hi) => steps.push(tbl(m, head, [slot], hi));
  snap('Jobs sorted by profit: ' + J.map((j) => `${j.id}(${j.p})`).join(', '));
  J.forEach((j) => { let t = Math.min(j.d, md) - 1; while (t >= 0 && (checks++, slot[t] !== '-')) t--; if (t >= 0) { slot[t] = j.id; tot += j.p; snap(`Job ${j.id} (deadline ${j.d}, profit ${j.p}) goes in slot ${t + 1}.`, [[0, t]]); } else snap(`Job ${j.id}: no free slot on or before deadline ${j.d}. Rejected.`); });
  return { steps, out: `Schedule: ${slot.join(', ')}; total profit = ${tot}`, why: 'Jobs are tried by decreasing profit and placed in the latest free slot before the deadline.', counts: { 'Slot checks': checks } };
}
function nqueens({ n }) {
  const N = nums(n, 'N')[0]; if (!Number.isInteger(N) || N < 1 || N > 8) E('N must be a whole number from 1 to 8.');
  const q = [], steps = [], bd = (msg, bad) => steps.push({ view: 'board', msg, n: N, q: [...q], bad }); let placed = 0, back = 0, found = false;
  const ok = (r, c) => q.every((qc, qr) => qc !== c && Math.abs(qc - c) !== r - qr);
  const go = (r) => { if (r === N) { found = true; return true; } for (let c = 0; c < N; c++) { if (steps.length > 4000) return false; if (ok(r, c)) { q.push(c); placed++; bd(`Place queen in row ${r + 1}, column ${c + 1}: safe.`); if (go(r + 1)) return true; q.pop(); back++; bd(`Backtrack from row ${r + 1}, column ${c + 1}.`); } else bd(`Row ${r + 1}, column ${c + 1} is attacked. Try next.`, [r, c]); } return false; };
  bd(`Place ${N} queens on a ${N}×${N} board, one per row.`); go(0);
  return { steps, out: found ? `First solution (column per row): [${q.map((c) => c + 1).join(', ')}]` : `No solution exists for N = ${N}`, why: 'Queens are placed row by row; a conflict forces a backtrack to the previous row.', counts: { 'Queens placed': placed, Backtracks: back } };
}
function subsetSum({ main, target }) {
  const values = nums(main, 'values'), goal = nums(target, 'target')[0];
  if (values.length > 12) E('Use at most 12 values so the search trace stays responsive.');
  if (values.some((value) => !Number.isInteger(value) || value <= 0)) E('Subset Sum requires positive whole-number values.');
  if (!Number.isInteger(goal) || goal < 0) E('The target must be a non-negative whole number.');

  const suffix = Array(values.length + 1).fill(0);
  for (let i = values.length - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + values[i];
  const solutions = [], steps = [];
  let calls = 0, pruned = 0;
  const snapshot = (msg, index, sum, chosen, decisions) => steps.push({
    view: 'subset',
    msg,
    values: [...values],
    target: goal,
    current: index,
    sum,
    chosen: [...chosen],
    decisions: [...decisions],
    solutionCount: solutions.length,
    solutions: solutions.slice(-4).map((solution) => solution.map((i) => values[i])),
  });
  const search = (index, sum, chosen, decisions) => {
    calls++;
    snapshot(`Explore this branch: current sum ${sum}; target ${goal}.`, index, sum, chosen, decisions);
    if (sum === goal) {
      solutions.push([...chosen]);
      snapshot(`Found solution ${solutions.length}: [${chosen.map((i) => values[i]).join(', ')}].`, index, sum, chosen, decisions);
      return;
    }
    if (sum > goal) {
      pruned++;
      snapshot(`Prune: sum ${sum} exceeds target ${goal}. Backtrack.`, index, sum, chosen, decisions);
      return;
    }
    if (index === values.length) {
      snapshot('No values remain, so this branch cannot reach the target.', index, sum, chosen, decisions);
      return;
    }
    if (sum + suffix[index] < goal) {
      pruned++;
      snapshot(`Prune: even taking all remaining values reaches only ${sum + suffix[index]}.`, index, sum, chosen, decisions);
      return;
    }

    const include = [...decisions];
    include[index] = true;
    search(index + 1, sum + values[index], [...chosen, index], include);

    const exclude = [...decisions];
    exclude[index] = false;
    search(index + 1, sum, chosen, exclude);
  };
  search(0, 0, [], Array(values.length).fill(null));
  const formatted = solutions.map((solution) => `[${solution.map((i) => values[i]).join(', ')}]`);
  return {
    steps,
    out: solutions.length
      ? `${solutions.length} subset${solutions.length === 1 ? '' : 's'} sum to ${goal}: ${formatted.join('; ')}`
      : `No subset sums to ${goal}.`,
    why: 'Depth-first backtracking tries including or excluding each value. It prunes branches whose sum is too large or whose remaining values cannot reach the target.',
    counts: { 'Search states': calls, 'Branches pruned': pruned, 'Solutions found': solutions.length },
  };
}

const GRAPH = { k: 'edges', label: 'Edges (one per line: A B)', rows: 5 }, WGRAPH = { k: 'edges', label: 'Weighted edges (one per line: A B weight)', rows: 6 }, START = { k: 'start', label: 'Start vertex', short: true };
const SORTP = [
  'ALGORITHM InsertionSort(A)',
  '  FOR i ← 1 TO length(A) - 1',
  '    key ← A[i]',
  '    j ← i - 1',
  '    WHILE j ≥ 0 AND A[j] > key',
  '      A[j + 1] ← A[j]',
  '      j ← j - 1',
  '    A[j + 1] ← key',
  '  RETURN A',
];
export const UNITS = ['Unit I – Analysis & Graphs', 'Unit IV – Greedy & DP', 'Unit V – Backtracking'];
const sortMeta = (name, time, space, pseudo, desc) => ({ unit: 0, name, desc, time, space, pseudo, run: sortRun(name), fields: [{ k: 'main', label: 'Numbers (comma separated)' }], samples: [{ main: '8, 3, 5, 1, 9, 2' }, { main: '4, 4, 2, 9, 2, 7' }] });
export const ALGOS = [
  sortMeta('Insertion Sort', 'Best O(n), worst O(n²)', 'O(1)', SORTP, 'Grow a sorted prefix by inserting each next value into place.'),
  sortMeta('Quick Sort', 'Avg O(n log n), worst O(n²)', 'O(log n) avg', [
    'ALGORITHM QuickSort(A, low, high)',
    '  IF low ≥ high',
    '    RETURN',
    '  pivotIndex ← Partition(A, low, high)',
    '  QuickSort(A, low, pivotIndex - 1)',
    '  QuickSort(A, pivotIndex + 1, high)',
    '',
    'PROCEDURE Partition(A, low, high)',
    '  pivot ← A[high]',
    '  boundary ← low - 1',
    '  FOR scan ← low TO high - 1',
    '    IF A[scan] < pivot',
    '      boundary ← boundary + 1',
    '      SWAP A[boundary] WITH A[scan]',
    '  SWAP A[boundary + 1] WITH A[high]',
    '  RETURN boundary + 1',
  ], 'Partition around a pivot, then sort both sides.'),
  sortMeta('Merge Sort', 'O(n log n)', 'O(n)', [
    'ALGORITHM MergeSort(A, low, high)',
    '  IF low ≥ high',
    '    RETURN',
    '  middle ← floor((low + high) / 2)',
    '  MergeSort(A, low, middle)',
    '  MergeSort(A, middle + 1, high)',
    '  Merge(A, low, middle, high)',
    '',
    'PROCEDURE Merge(A, low, middle, high)',
    '  left ← copy A[low .. middle]',
    '  right ← copy A[middle + 1 .. high]',
    '  i ← 0; j ← 0; k ← low',
    '  WHILE i < length(left) AND j < length(right)',
    '    IF left[i] ≤ right[j]',
    '      A[k] ← left[i]; i ← i + 1',
    '    ELSE',
    '      A[k] ← right[j]; j ← j + 1',
    '    k ← k + 1',
    '  WHILE i < length(left)',
    '    A[k] ← left[i]; i ← i + 1; k ← k + 1',
    '  WHILE j < length(right)',
    '    A[k] ← right[j]; j ← j + 1; k ← k + 1',
  ], 'Split in halves, sort each, merge them.'),
  ...['Linear Search', 'Binary Search'].map((name) => ({
    unit: 0,
    name,
    desc: name === 'Linear Search' ? 'Check each item left to right.' : 'Halve the sorted range each step.',
    time: name === 'Linear Search' ? 'O(n)' : 'O(log n)',
    space: 'O(1)',
    pseudo: name === 'Linear Search' ? [
      'ALGORITHM LinearSearch(input, target)',
      '  A ← SORT(copy of input)  // simulator sorts a copy before tracing',
      '  FOR i ← 0 TO length(A) - 1',
      '    IF A[i] = target',
      '      RETURN i',
      '  RETURN -1',
    ] : [
      'ALGORITHM BinarySearch(input, target)',
      '  A ← SORT(copy of input)  // simulator sorts a copy before tracing',
      '  low ← 0; high ← length(A) - 1',
      '  WHILE low ≤ high',
      '    middle ← floor((low + high) / 2)',
      '    IF A[middle] = target',
      '      RETURN middle',
      '    ELSE IF A[middle] < target',
      '      low ← middle + 1',
      '    ELSE',
      '      high ← middle - 1',
      '  RETURN -1',
    ],
    run: searchRun(name),
    fields: [{ k: 'main', label: 'Array (comma separated)' }, { k: 'target', label: 'Target value', short: true }],
    samples: [{ main: '7, 2, 9, 4, 11, 5', target: '9' }, { main: '7, 2, 9, 4', target: '6' }],
  })),
  ...['BFS', 'DFS'].map((name) => ({
    unit: 0,
    name,
    desc: name === 'BFS' ? 'Visit a graph level by level using a queue.' : 'Go as deep as possible, then backtrack, using a stack.',
    time: 'O(V + E)',
    space: 'O(V)',
    pseudo: name === 'BFS' ? [
      'ALGORITHM BreadthFirstSearch(G, start)',
      '  visited ← {start}',
      '  parent[start] ← NONE',
      '  queue ← [start]',
      '  WHILE queue is not empty',
      '    vertex ← DEQUEUE(queue)',
      '    VISIT(vertex)',
      '    FOR each neighbor in sorted G.adjacent[vertex]',
      '      IF neighbor NOT IN visited',
      '        ADD neighbor TO visited',
      '        parent[neighbor] ← vertex',
      '        ENQUEUE(queue, neighbor)',
    ] : [
      'ALGORITHM DepthFirstSearch(G, start)',
      '  visited ← ∅',
      '  parent ← empty map',
      '  stack ← [start]',
      '  WHILE stack is not empty',
      '    vertex ← POP(stack)',
      '    IF vertex IN visited',
      '      CONTINUE',
      '    ADD vertex TO visited',
      '    VISIT(vertex)',
      '    FOR each neighbor in reverse sorted G.adjacent[vertex]',
      '      IF neighbor NOT IN visited',
      '        parent[neighbor] ← vertex',
      '        PUSH(stack, neighbor)',
    ],
    run: traverse(name),
    fields: [GRAPH, START],
    samples: [{ edges: 'A B\nA C\nB D\nB E\nC F\nE F', start: 'A' }, { edges: 'A B\nB C\nD E', start: 'A' }],
  })),
  {
    unit: 0, name: "Kruskal's MST", desc: 'Sort edges, add the lightest ones that do not form a cycle.', time: 'O(E log E)', space: 'O(V)',
    pseudo: [
      'ALGORITHM Kruskal(G = (V, E))',
      '  FOR each vertex v IN V',
      '    MAKE-SET(v)',
      '  forest ← ∅; totalWeight ← 0',
      '  SORT E by nondecreasing edge weight',
      '  FOR each edge (u, v) IN E',
      '    IF FIND(u) ≠ FIND(v)',
      '      ADD (u, v) TO forest',
      '      totalWeight ← totalWeight + weight(u, v)',
      '      UNION(u, v)',
      '  RETURN forest, totalWeight',
      '// Disconnected input produces a minimum spanning forest',
    ],
    run: kruskal, fields: [WGRAPH], samples: [{ edges: 'A B 4\nA C 2\nB C 1\nB D 5\nC D 8\nC E 10\nD E 2' }],
  },
  {
    unit: 0, name: "Prim's MST", desc: 'Grow one tree by always adding the cheapest edge leaving it.', time: 'O(VE) edge scan; O(E log V) with a heap', space: 'O(V)',
    pseudo: [
      "ALGORITHM Prim(G = (V, E), start)",
      '  inTree ← {start}',
      '  treeEdges ← ∅; totalWeight ← 0',
      '  WHILE an edge crosses from inTree to V - inTree',
      '    edge ← minimum-weight crossing edge',
      '    ADD edge TO treeEdges',
      '    ADD the outside endpoint of edge TO inTree',
      '    totalWeight ← totalWeight + weight(edge)',
      '  RETURN treeEdges, totalWeight',
      '// For disconnected input, this grows start’s component only',
    ],
    run: prim, fields: [WGRAPH, START], samples: [{ edges: 'A B 4\nA C 2\nB C 1\nB D 5\nC D 8\nC E 10\nD E 2', start: 'A' }],
  },
  {
    unit: 1, name: 'Fractional Knapsack', desc: 'Greedy by value/weight ratio; items may be split.', time: 'O(n log n)', space: 'O(n)',
    pseudo: [
      'ALGORITHM FractionalKnapsack(items, capacity)',
      '  FOR each item i',
      '    ratio[i] ← value[i] / weight[i]',
      '  SORT items by decreasing ratio',
      '  remaining ← capacity; totalValue ← 0',
      '  FOR each item i in sorted order',
      '    fraction ← MIN(1, remaining / weight[i])',
      '    totalValue ← totalValue + fraction × value[i]',
      '    remaining ← remaining - fraction × weight[i]',
      '  RETURN totalValue',
    ],
    run: fracKnap, fields: [{ k: 'w', label: 'Weights', short: true }, { k: 'v', label: 'Values', short: true }, { k: 'cap', label: 'Capacity', short: true }], samples: [{ w: '10, 20, 30', v: '60, 100, 120', cap: '50' }],
  },
  {
    unit: 1, name: '0/1 Knapsack (DP)', desc: 'Fill a table: best value for first i items and capacity c.', time: 'O(n·W)', space: 'O(n·W)',
    pseudo: [
      'ALGORITHM Knapsack01(weights, values, capacity)',
      '  n ← number of items',
      '  CREATE dp[0 .. n][0 .. capacity], initialized to 0',
      '  FOR i ← 1 TO n',
      '    FOR c ← 0 TO capacity',
      '      skip ← dp[i - 1][c]',
      '      IF weights[i] > c',
      '        dp[i][c] ← skip',
      '      ELSE',
      '        take ← values[i] + dp[i - 1][c - weights[i]]',
      '        dp[i][c] ← MAX(skip, take)',
      '  chosen ← empty list; c ← capacity',
      '  FOR i ← n DOWNTO 1',
      '    IF dp[i][c] ≠ dp[i - 1][c]',
      '      APPEND item i TO chosen',
      '      c ← c - weights[i]',
      '  REVERSE chosen',
      '  RETURN dp[n][capacity], chosen',
    ],
    run: knap01, fields: [{ k: 'w', label: 'Weights', short: true }, { k: 'v', label: 'Values', short: true }, { k: 'cap', label: 'Capacity', short: true }], samples: [{ w: '1, 3, 4, 5', v: '1, 4, 5, 7', cap: '7' }],
  },
  {
    unit: 1, name: 'Activity Selection', desc: 'Pick the activity that finishes earliest, then repeat.', time: 'O(n log n)', space: 'O(n)',
    pseudo: [
      'ALGORITHM ActivitySelection(activities)',
      '  SORT activities by nondecreasing finish time',
      '  selected ← empty list',
      '  lastFinish ← -∞',
      '  FOR each activity a in sorted order',
      '    IF start[a] ≥ lastFinish',
      '      APPEND a TO selected',
      '      lastFinish ← finish[a]',
      '  RETURN selected',
    ],
    run: activity, fields: [{ k: 's', label: 'Start times', short: true }, { k: 'f', label: 'Finish times', short: true }], samples: [{ s: '1, 3, 0, 5, 8, 5', f: '2, 4, 6, 7, 9, 9' }],
  },
  {
    unit: 1, name: 'Job Sequencing', desc: 'Place highest-profit jobs in the latest free slot before their deadline.', time: 'O(n²)', space: 'O(n)',
    pseudo: [
      'ALGORITHM JobSequencing(jobs)',
      '  SORT jobs by nonincreasing profit',
      '  maxSlots ← MIN(number of jobs, largest deadline)',
      '  slots[1 .. maxSlots] ← EMPTY',
      '  FOR each job j in sorted order',
      '    latest ← MIN(deadline[j], maxSlots)',
      '    WHILE latest ≥ 1 AND slots[latest] is occupied',
      '      latest ← latest - 1',
      '    IF latest ≥ 1',
      '      slots[latest] ← j',
      '  RETURN slots, sum of scheduled job profits',
    ],
    run: jobs, fields: [{ k: 'ids', label: 'Job IDs', short: true }, { k: 'd', label: 'Deadlines', short: true }, { k: 'p', label: 'Profits', short: true }], samples: [{ ids: 'a, b, c, d, e', d: '2, 1, 2, 1, 3', p: '100, 19, 27, 25, 15' }],
  },
  {
    unit: 2, name: 'N-Queens', desc: 'Place queens row by row; backtrack on conflict.', time: 'O(N!) upper bound', space: 'O(N)',
    pseudo: [
      'ALGORITHM NQueens(N)',
      '  columns[0 .. N - 1] ← EMPTY',
      '  // Returns the first solution, or FALSE if none exists',
      '  RETURN PlaceQueen(0)',
      '',
      'FUNCTION PlaceQueen(row)',
      '  IF row = N',
      '    RETURN TRUE  // one complete solution found',
      '  FOR col ← 0 TO N - 1',
      '    IF Safe(row, col)',
      '      columns[row] ← col',
      '      IF PlaceQueen(row + 1)',
      '        RETURN TRUE',
      '      columns[row] ← EMPTY  // backtrack',
      '  RETURN FALSE',
      '',
      'FUNCTION Safe(row, col)',
      '  FOR each earlier row r',
      '    IF columns[r] = col OR |columns[r] - col| = row - r',
      '      RETURN FALSE',
      '  RETURN TRUE',
    ],
    run: nqueens, fields: [{ k: 'n', label: 'Board size N (1–8)', short: true }], samples: [{ n: '4' }, { n: '6' }, { n: '3' }],
  },
  {
    unit: 2, name: 'Sum of Subsets', desc: 'Find every subset that reaches a target using include/exclude backtracking.', time: 'O(2ⁿ) worst case', space: 'O(n) recursion',
    pseudo: [
      'ALGORITHM SumOfSubsets(values, target)',
      '  suffixSum[n] ← 0',
      '  FOR i ← n - 1 DOWNTO 0',
      '    suffixSum[i] ← suffixSum[i + 1] + values[i]',
      '  solutions ← empty list',
      '  SEARCH(0, 0, empty subset)',
      '  RETURN solutions',
      '',
      'PROCEDURE SEARCH(i, currentSum, chosen)',
      '  IF currentSum = target',
      '    APPEND copy(chosen) TO solutions',
      '    RETURN',
      '  IF currentSum > target OR i = n',
      '    RETURN',
      '  IF currentSum + suffixSum[i] < target',
      '    RETURN  // remaining values cannot reach target',
      '  SEARCH(i + 1, currentSum + values[i], chosen ∪ {i})',
      '  SEARCH(i + 1, currentSum, chosen)',
    ],
    run: subsetSum,
    fields: [
      { k: 'main', label: 'Positive whole-number values' },
      { k: 'target', label: 'Target sum', short: true },
    ],
    samples: [
      { main: '3, 4, 5, 2', target: '9' },
      { main: '2, 4, 6, 8', target: '11' },
    ],
  },
];

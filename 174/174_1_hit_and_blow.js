/* =====================================================================
 * Hit & Blow（数当てゲーム） — Babylon.js v9+ Playground 用サンプル（JavaScript）
 *
 * 使い方: Babylon.js Playground の言語を「JavaScript」にし、このファイル全体を貼り付けて Run。
 *
 *  - UI はすべて Babylon.GUI（AdvancedDynamicTexture）。HTML DOM・3D メッシュは使用しない。
 *  - 基準解像度 1280x720。画面サイズに合わせてレターボックス拡大する（下記 fit 参照）。
 *  - 操作はクリック／タップのみ（ScrollViewer のスクロールのみ例外）。
 *  - 重い計算（S2B・S6・ハードの敵）は generator で 1 フレーム 8ms ずつ分割実行する。
 *
 * ゲームルールは末尾添付
 * ===================================================================== */

/* ============================ ゲームロジック（純粋関数） ============================ */
// ==== LOGIC BEGIN
function perm(n, k) { let r = 1; for (let i = 0; i < k; i++) r *= (n - i); return r; }

// 重複なしN桁の全セットを Uint8Array（件数×N）で返す。先頭0も許可。
function allSets(N) {
  const out = new Uint8Array(perm(10, N) * N);
  const cur = new Array(N), used = new Array(10).fill(false);
  let w = 0;
  (function rec(k) {
    if (k === N) { for (let i = 0; i < N; i++) out[w++] = cur[i]; return; }
    for (let d = 0; d < 10; d++) {
      if (used[d]) continue;
      used[d] = true; cur[k] = d; rec(k + 1); used[d] = false;
    }
  })(0);
  return out;
}

// call を secret に対してCALLしたときの [HIT, BLOW]
function judge(call, secret, N) {
  let h = 0, common = 0;
  for (let i = 0; i < N; i++) {
    if (call[i] === secret[i]) h++;
    for (let j = 0; j < N; j++) if (call[i] === secret[j]) { common++; break; }
  }
  return [h, common - h];
}

// 候補集合を (call, h, b) と矛盾しないものだけに絞る
function filterCands(cands, N, call, h, b) {
  const M = cands.length / N;
  const pos = new Int8Array(10).fill(-1);
  for (let i = 0; i < N; i++) pos[call[i]] = i;
  const out = new Uint8Array(cands.length);
  let w = 0;
  for (let j = 0; j < M; j++) {
    const base = j * N;
    let hh = 0, cc = 0;
    for (let i = 0; i < N; i++) { const d = cands[base + i]; if (d === call[i]) hh++; if (pos[d] >= 0) cc++; }
    if (hh === h && cc - hh === b) { for (let i = 0; i < N; i++) out[w++] = cands[base + i]; }
  }
  return out.slice(0, w);
}

// 数字別・(数字,桁)別の出現数
function deriveStats(cands, N) {
  const M = cands.length / N;
  const dc = new Int32Array(10), pc = new Int32Array(10 * N);
  for (let j = 0; j < M; j++) {
    const base = j * N;
    for (let i = 0; i < N; i++) { const d = cands[base + i]; dc[d]++; pc[d * N + i]++; }
  }
  return { M, dc, pc };
}

function candAt(cands, N, j) { return Array.from(cands.subarray(j * N, j * N + N)); }

function binEntropy(p) {
  if (p <= 0 || p >= 1) return 0;
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
}

// call の期待情報量（HIT/BLOW 結果分布のシャノンエントロピー）。idx が null なら全候補と比較。
function entropyOf(call, cands, N, idx) {
  const pos = new Int8Array(10).fill(-1);
  for (let i = 0; i < N; i++) pos[call[i]] = i;
  const W = N + 1, cnt = new Int32Array(W * W);
  const n = idx ? idx.length : cands.length / N;
  for (let t = 0; t < n; t++) {
    const base = (idx ? idx[t] : t) * N;
    let h = 0, c = 0;
    for (let i = 0; i < N; i++) { const d = cands[base + i]; if (d === call[i]) h++; if (pos[d] >= 0) c++; }
    cnt[h * W + (c - h)]++;
  }
  let H = 0;
  for (let k = 0; k < cnt.length; k++) if (cnt[k] > 0) { const p = cnt[k] / n; H -= p * Math.log2(p); }
  return H;
}

// 0..M-1 から k 個を重複なしで無作為抽出（疎な Fisher-Yates）
function sampleIdx(M, k) {
  if (k >= M) { const a = new Uint32Array(M); for (let i = 0; i < M; i++) a[i] = i; return a; }
  const sw = new Map(), out = new Uint32Array(k);
  for (let i = 0; i < k; i++) {
    const r = i + Math.floor(Math.random() * (M - i));
    const vr = sw.has(r) ? sw.get(r) : r, vi = sw.has(i) ? sw.get(i) : i;
    out[i] = vr; sw.set(r, vi);
  }
  return out;
}

function lexCmp(a, b) { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; }
function cmpEntropy(a, b) { return Math.abs(a.H - b.H) > 1e-12 ? b.H - a.H : lexCmp(a.call, b.call); }

// S2B: 期待情報量の上位 topK。M<=3000: 厳密。M>3000: 評価CALL300件×比較3000件の近似。
function* s2bGen(cands, N, topK) {
  const M = cands.length / N;
  let callIdx, cmpIdx = null, approx = false;
  if (M <= 3000) { callIdx = sampleIdx(M, M); }
  else { callIdx = sampleIdx(M, 300); cmpIdx = sampleIdx(M, 3000); approx = true; }
  const res = [];
  let t0 = performance.now();
  for (let a = 0; a < callIdx.length; a++) {
    const ci = callIdx[a];
    const call = cands.subarray(ci * N, ci * N + N);
    res.push({ call: Array.from(call), H: entropyOf(call, cands, N, cmpIdx) });
    if (performance.now() - t0 > 8) { yield; t0 = performance.now(); }
  }
  res.sort(cmpEntropy);
  return { top: res.slice(0, topK), approx };
}

// S6: CALL を候補集合に当てたときの (HIT,BLOW) ごとの残り候補数
function* s6Gen(cands, N, call) {
  const M = cands.length / N;
  const pos = new Int8Array(10).fill(-1);
  for (let i = 0; i < N; i++) pos[call[i]] = i;
  const W = N + 1, cnt = new Int32Array(W * W);
  let t0 = performance.now();
  for (let j = 0; j < M; j++) {
    const base = j * N;
    let h = 0, c = 0;
    for (let i = 0; i < N; i++) { const d = cands[base + i]; if (d === call[i]) h++; if (pos[d] >= 0) c++; }
    cnt[h * W + (c - h)]++;
    if ((j & 4095) === 0 && performance.now() - t0 > 8) { yield; t0 = performance.now(); }
  }
  const rows = [];
  for (let h = N; h >= 0; h--) for (let b = N - h; b >= 0; b--) if (cnt[h * W + b] > 0) rows.push({ h, b, n: cnt[h * W + b] });
  return rows;
}

function randomSet(N) {
  const d = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 9; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = d[i]; d[i] = d[j]; d[j] = t; }
  return d.slice(0, N);
}
function sameArr(a, b) { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
function randomWrong(N, secret) { let s; do { s = randomSet(N); } while (sameArr(s, secret)); return s; }

// キッズ／ノーマルの敵のCALL選択（同期）。ハードは hardPickGen を使う。
// ctx: {diff, N, ec, secret(プレイヤーの秘密セット), first('player'|'enemy'), playerHit(今ターンにプレイヤーがN HIT済み), knownDelay}
function pickEnemySync(ctx) {
  const { diff, N, ec, secret } = ctx;
  const M = ec.length / N;
  let knownDelay = ctx.knownDelay;
  const randCand = () => candAt(ec, N, Math.floor(Math.random() * M));
  const answer = () => secret.slice();
  if (diff === 'kids') {
    if (M === 1) {
      // 確定していても、プレイヤーが先攻でN HITした直後の後攻ターンだけ正解して引き分けにする
      const draw = ctx.first === 'player' && ctx.playerHit;
      return { call: draw ? answer() : randomWrong(N, secret), knownDelay };
    }
    return { call: randCand(), knownDelay };
  }
  // normal
  if (M === 1) {
    if (knownDelay === null) knownDelay = 1 + Math.floor(Math.random() * 3); // 1～3ターンの猶予
    if (knownDelay > 0) { knownDelay--; return { call: randomWrong(N, secret), knownDelay }; }
    return { call: answer(), knownDelay };
  }
  // 確率的に、候補ではない適当なセットをCALLして間違える
  return { call: Math.random() < 0.15 ? randomSet(N) : randCand(), knownDelay };
}

// ハード: 期待情報量が最大のCALL（候補が1～2件なら候補を直接CALL）
function* hardPickGen(ec, N) {
  const M = ec.length / N;
  if (M <= 2) return candAt(ec, N, Math.floor(Math.random() * M));
  const r = yield* s2bGen(ec, N, 1);
  return r.top[0].call;
}
// ==== LOGIC END

/* ============================ UI / ゲーム進行 ============================ */
export var createScene = function () {
  const GUI = BABYLON.GUI;
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.06, 0.07, 0.11, 1);
  new BABYLON.FreeCamera("cam", new BABYLON.Vector3(0, 0, -5), scene); // GUIのみだがカメラは必要
  const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, scene);

  // ---------- 配色 ----------
  const C = {
    bg: "#12162a", panel: "#1b2140", panel2: "#161b33", cell: "#252c4d", line: "#3a4372",
    text: "#eef1fb", muted: "#8f99c2", btn: "#2e3768", accent: "#2f8f9d", focus: "#ffd24a",
    warn: "#ff9f43", bad: "#e5484d", good: "#3fae6a", yellow: "#e6c23a", dim: "#3a3d46"
  };
  const FONT = "'Hiragino Sans','Noto Sans JP','Yu Gothic','Meiryo',sans-serif";
  const DIFF_NAME = { kids: "キッズ", normal: "ノーマル", hard: "ハード" };
  const SUP_KEYS = ["S1", "S2A", "S2B", "S3A", "S3B", "S4", "S5", "S6"];
  const SUP_LABEL = { S1: "S1 確定数字", S2A: "S2A 候補リスト", S2B: "S2B 最適CALL", S3A: "S3A 並べ替え", S3B: "S3B 数字情報量", S4: "S4 マトリクス", S5: "S5 スロット", S6: "S6 予習" };
  const SUP_TAB = { S1: "S1", S2A: "S2A", S2B: "S2B", S3A: "S3A", S3B: "S3B", S4: "S4", S5: "S5", S6: "S6" };

  // ---------- 1280x720 のルート（アスペクト比を保って拡大縮小） ----------
  // idealWidth/idealHeight だと縦横比が違う画面で見切れるため、同等のレターボックス拡大を自前で行う。
  const root = new GUI.Rectangle("root");
  root.width = "1280px"; root.height = "720px"; root.thickness = 0; root.background = C.bg; root.fontFamily = FONT;
  ui.addControl(root);
  const layer = new GUI.Rectangle("layer");
  layer.width = "1280px"; layer.height = "720px"; layer.thickness = 0; layer.background = "transparent";
  root.addControl(layer);
  let lastK = 0;
  scene.onBeforeRenderObservable.add(() => {
    const s = ui.getSize();
    const k = Math.min(s.width / 1280, s.height / 720);
    if (k !== lastK && k > 0) { root.scaleX = k; root.scaleY = k; lastK = k; }
  });

  // ---------- GUI ヘルパー ----------
  function place(c, x, y, w, h) {
    c.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    c.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    c.left = x + "px"; c.top = y + "px";
    if (w != null) c.width = w + "px";
    if (h != null) c.height = h + "px";
  }
  function R(parent, x, y, w, h, bg, thick, color, radius) {
    const r = new GUI.Rectangle("r");
    place(r, x, y, w, h);
    r.background = bg || "transparent"; r.thickness = thick || 0; r.color = color || C.line; r.cornerRadius = radius || 0;
    parent.addControl(r); return r;
  }
  function T(parent, text, x, y, w, h, size, color, align) {
    const t = new GUI.TextBlock("t", text);
    place(t, x, y, w, h);
    t.fontSize = size || 18; t.color = color || C.text; t.isHitTestVisible = false;
    t.textHorizontalAlignment = align === "left" ? GUI.Control.HORIZONTAL_ALIGNMENT_LEFT : align === "right" ? GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT : GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    parent.addControl(t); return t;
  }
  function setEnabled(b, on) { b.isEnabled = on; b.alpha = on ? 1 : 0.4; }
  function makeBtn(parent, label, x, y, w, h, onClick, o) {
    o = o || {};
    const b = GUI.Button.CreateSimpleButton("b", label);
    place(b, x, y, w, h);
    b.color = o.fg || C.text; b.background = o.bg || C.btn; b.thickness = o.thick != null ? o.thick : 1; b.cornerRadius = 8;
    b.textBlock.fontSize = o.fs || 20; b.textBlock.color = o.fg || C.text;
    b.pointerEnterAnimation = () => {}; b.pointerOutAnimation = () => {};
    b.pointerDownAnimation = () => {}; b.pointerUpAnimation = () => {};
    b.onPointerClickObservable.add(() => { if (b.isEnabled) onClick(); });
    parent.addControl(b); return b;
  }
  function disposeChildren(c) { c.children.slice().forEach(ch => ch.dispose()); }
  function probColor(p) {
    const a = [240, 244, 250], b = [30, 90, 200];
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * p));
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }
  const fgFor = p => (p > 0.6 ? "#ffffff" : "#111111");

  // ---------- 分割実行タスク（generator を毎フレーム1スライスずつ進める） ----------
  const tasks = new Map();
  function runTask(key, gen) {
    return new Promise(res => {
      if (tasks.has(key)) tasks.get(key).dead = true;
      tasks.set(key, { gen, res, dead: false });
    });
  }
  function cancelTask(key) { const t = tasks.get(key); if (t) { t.dead = true; tasks.delete(key); } }
  function cancelAllTasks() { tasks.forEach(t => { t.dead = true; }); tasks.clear(); }
  scene.onBeforeRenderObservable.add(() => {
    Array.from(tasks.entries()).forEach(([k, t]) => {
      if (t.dead) { if (tasks.get(k) === t) tasks.delete(k); return; }
      const r = t.gen.next();
      if (r.done) { if (tasks.get(k) === t) tasks.delete(k); t.res(r.value); }
    });
  });

  // ---------- 状態 ----------
  const P = { N: 4, secret: [-1, -1, -1, -1], first: "player", diff: "normal", focusI: 0, sup: {} };
  SUP_KEYS.forEach(k => { P.sup[k] = false; });
  let G = null;                 // プレイ中のゲーム状態
  let focus = null;             // 数字選択パネルの入力先 {arr,i,onChange,noDup,kind,slot}
  let refreshers = [];          // 画面常設要素の更新関数
  let panelRef = [];            // サポートパネル内要素の更新関数
  let gameSeq = 0;

  function refreshAll() { refreshers.forEach(f => f()); panelRef.forEach(f => f()); }
  function setFocus(arr, i, o) {
    focus = { arr, i, onChange: o.onChange, noDup: !!o.noDup, kind: o.kind || "call", slot: o.slot };
    if (o.kind === "slot" && G) G.s5sel = o.slot;
    if (o.kind === "prep") P.focusI = i;
    refreshAll();
  }
  function inputDigit(d) {
    if (!focus) return;
    const { arr, i } = focus;
    arr[i] = d;
    if (focus.onChange) focus.onChange();
    if (i < arr.length - 1) focus.i = i + 1;
    if (focus.kind === "prep") P.focusI = focus.i;
    refreshAll();
  }

  // 0～9＋空欄の数字選択パネル（常時表示・共用）
  function makeNumPanel(parent, x, y) {
    const btns = [];
    for (let k = 0; k < 11; k++) {
      const b = makeBtn(parent, k < 10 ? String(k) : "空欄", x + k * 64, y, 56, 56, () => inputDigit(k < 10 ? k : -1), { fs: k < 10 ? 26 : 16 });
      btns.push(b);
    }
    refreshers.push(() => {
      btns.forEach((b, k) => {
        let en = !!focus;
        if (focus && focus.noDup && k < 10) en = !focus.arr.some((v, idx) => idx !== focus.i && v === k);
        setEnabled(b, en);
      });
    });
  }

  // 配列(arr)の i 番目を表すセル。タップでフォーカス。
  function arrCell(parent, x, y, size, arr, i, o, inPanel) {
    const r = R(parent, x, y, size, size, C.cell, 2, C.line, 6);
    const t = T(r, "", 0, 0, size, size, Math.floor(size * 0.55), C.text);
    r.onPointerClickObservable.add(() => setFocus(arr, i, o));
    const upd = () => {
      const v = arr[i];
      t.text = v < 0 ? "" : String(v);
      const f = focus && focus.arr === arr && focus.i === i;
      const dup = !o.noDup && v >= 0 && arr.some((u, j) => j !== i && u === v);
      r.background = (o.bgFn && o.bgFn(i)) || C.cell;
      t.color = (o.fgFn && o.fgFn(i)) || C.text;
      r.color = f ? C.focus : dup ? C.warn : C.line;
      r.thickness = f ? 4 : 2;
    };
    (inPanel ? panelRef : refreshers).push(upd);
    upd();
    return r;
  }

  const later = f => setTimeout(f, 0); // 自分自身のクリック処理中にコントロールを破棄しないよう、再構築は次のtickで行う
  const allFilled = a => a.every(v => v >= 0);
  const hasDup = a => a.some((v, i) => v >= 0 && a.indexOf(v) !== i);
  const callReady = () => allFilled(G.call) && !hasDup(G.call);

  /* ===================== 準備画面 ===================== */
  function resetScreen() { disposeChildren(layer); refreshers = []; panelRef = []; focus = null; }

  function buildPrep() {
    cancelAllTasks(); gameSeq++; G = null;
    resetScreen();
    const L = layer;
    T(L, "Hit & Blow", 0, 14, 1280, 56, 40, C.text);
    const label = (txt, y) => T(L, txt, 40, y, 170, 48, 22, C.muted, "left");

    label("桁数 N", 96);
    for (let n = 2; n <= 7; n++) {
      makeBtn(L, String(n), 220 + (n - 2) * 72, 96, 64, 48, () => {
        P.N = n; P.secret = new Array(n).fill(-1); P.focusI = 0; later(buildPrep);
      }, { bg: P.N === n ? C.accent : C.btn, fs: 24 });
    }

    label("あなたのセット", 168);
    const secOpts = { kind: "prep", noDup: true };
    for (let i = 0; i < P.N; i++) arrCell(L, 220 + i * 64, 164, 56, P.secret, i, secOpts);
    T(L, "セルを選び、下の数字を押して入力（重複不可）", 220 + P.N * 64 + 8, 164, 520, 56, 16, C.muted, "left");
    makeNumPanel(L, 220, 236);
    setFocus(P.secret, Math.min(P.focusI, P.N - 1), secOpts);

    label("手番", 324);
    [["player", "先攻"], ["enemy", "後攻"]].forEach(([v, name], k) => {
      makeBtn(L, name, 220 + k * 160, 324, 150, 48, () => { P.first = v; later(buildPrep); }, { bg: P.first === v ? C.accent : C.btn });
    });

    label("敵のレベル", 396);
    ["kids", "normal", "hard"].forEach((v, k) => {
      makeBtn(L, DIFF_NAME[v], 220 + k * 160, 396, 150, 48, () => {
        P.diff = v; if (v === "hard") P.sup.S2A = false; later(buildPrep);
      }, { bg: P.diff === v ? C.accent : C.btn });
    });

    label("サポート機能", 468);
    SUP_KEYS.forEach((k, idx) => {
      const x = 220 + (idx % 4) * 230, y = 468 + Math.floor(idx / 4) * 58;
      const dis = k === "S2A" && P.diff === "hard";
      const b = makeBtn(L, (P.sup[k] ? "ON  " : "OFF  ") + SUP_LABEL[k], x, y, 220, 48, () => { P.sup[k] = !P.sup[k]; later(buildPrep); },
        { bg: P.sup[k] ? C.good : C.btn, fs: 17 });
      if (dis) setEnabled(b, false);
    });

    const start = makeBtn(L, "ゲーム開始", 490, 620, 300, 64, () => later(startGame), { bg: C.accent, fs: 28 });
    refreshers.push(() => setEnabled(start, allFilled(P.secret) && !hasDup(P.secret)));
    refreshAll();
  }

  /* ===================== ゲーム開始 ===================== */
  function startGame() {
    const N = P.N;
    cancelAllTasks(); gameSeq++;
    const sets = allSets(N);
    G = {
      id: gameSeq, N, first: P.first, diff: P.diff, sup: Object.assign({}, P.sup),
      mySecret: P.secret.slice(), enemySecret: randomSet(N),
      pc: sets, ec: sets, der: null, turn: 1, turnHit: { player: false, enemy: false },
      hist: { player: [], enemy: [] }, call: new Array(N).fill(-1),
      s2aList: [], s2b: null,
      s3a: [], s3aSel: null,
      s4: Array.from({ length: 10 }, () => new Array(N).fill(0)), s4tool: null, s4check: null,
      s5: Array.from({ length: 5 }, () => new Array(N).fill(-1)), s5res: [null, null, null, null, null], s5sel: null,
      s6: null, phase: "player", over: false, result: null, knownDelay: null, cols: {}, tab: null, tabs: []
    };
    for (let d = 0; d < 10; d++) G.s3a.push({ t: "d", v: d });
    for (let k = 0; k < N; k++) G.s3a.push({ t: "s", v: k });
    G.tabs = SUP_KEYS.filter(k => G.sup[k] && !(k === "S2A" && G.diff === "hard"));
    G.tab = G.tabs.length ? G.tabs[0] : null;
    G.der = deriveStats(G.pc, N);
    buildPlay();
    onPCandsUpdated();
    beginActor(G.first);
  }

  /* ===================== プレイ画面 ===================== */
  let panelHost = null, tabHost = null;

  function buildPlay() {
    resetScreen();
    const L = layer, N = G.N;

    // 上部バー
    R(L, 0, 0, 1280, 56, C.panel);
    const tl = T(L, "", 16, 0, 520, 56, 20, C.text, "left");
    const ts = T(L, "", 520, 0, 380, 56, 22, C.focus);
    const tr = T(L, "", 900, 0, 364, 56, 20, C.text, "right");
    refreshers.push(() => {
      tl.text = "第" + G.turn + "ターン ／ あなたは" + (G.first === "player" ? "先攻" : "後攻") + " ／ 敵: " + DIFF_NAME[G.diff];
      ts.text = G.over ? "ゲーム終了" : G.phase === "player" ? "あなたのCALLです" : "敵が考えています…";
      tr.text = (G.sup.S2A && G.diff !== "hard") ? "残り候補数: " + G.der.M.toLocaleString("en-US") : "";
    });

    // 履歴列（先攻=左, 後攻=右）
    const second = G.first === "player" ? "enemy" : "player";
    buildHistCol(G.first, 0);
    buildHistCol(second, 1000);
    renderHist("player"); renderHist("enemy");

    // サポート領域
    tabHost = R(L, 280, 56, 720, 32, "transparent");
    panelHost = R(L, 280, 88, 720, 452, "transparent");
    buildTabs();

    // CALL 欄
    const callOpts = { kind: "call", onChange: onCallChanged };
    for (let i = 0; i < N; i++) arrCell(L, 296 + i * 64, 556, 56, G.call, i, callOpts);
    const bx = 296 + N * 64 + 8;
    const callBtn = makeBtn(L, "CALL", bx, 556, 120, 56, playerCall, { bg: C.accent, fs: 26 });
    const clrBtn = makeBtn(L, "クリア", bx + 128, 556, 100, 56, () => { G.call.fill(-1); onCallChanged(); setFocus(G.call, 0, callOpts); }, { fs: 18 });
    refreshers.push(() => {
      setEnabled(callBtn, G.phase === "player" && !G.over && callReady());
      setEnabled(clrBtn, !G.over);
    });
    makeNumPanel(L, 292, 640);
    setFocus(G.call, 0, callOpts);
  }

  function buildHistCol(owner, x) {
    const L = layer, N = G.N;
    R(L, x, 56, 280, 664, C.panel2);
    T(L, owner === "player" ? "あなたのCALL → 敵のセット" : "敵のCALL → あなたのセット", x + 4, 60, 272, 24, 15, C.muted);
    const cells = [];
    for (let i = 0; i < N; i++) {
      const c = R(L, x + 6 + i * 28, 88, 26, 32, C.cell, 1, C.line, 4);
      cells.push(T(c, "", 0, 0, 26, 32, 20, C.text));
    }
    const sv = new GUI.ScrollViewer("sv");
    place(sv, x + 2, 128, 276, 588);
    sv.thickness = 0; sv.barSize = 8; sv.barColor = C.accent; sv.barBackground = C.panel;
    L.addControl(sv);
    const stack = new GUI.StackPanel("st");
    stack.width = "268px";
    stack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    stack.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    sv.addControl(stack);
    G.cols[owner] = { stack, sv, cells };
  }

  function renderHist(owner) {
    const col = G.cols[owner]; if (!col) return;
    const N = G.N;
    // ヘッダー（CALL対象の秘密セット。敵のセットはゲーム終了まで「？」）
    const target = owner === "player" ? G.enemySecret : G.mySecret;
    const masked = owner === "player" && !G.over;
    col.cells.forEach((t, i) => { t.text = masked ? "？" : String(target[i]); });
    disposeChildren(col.stack);
    G.hist[owner].forEach(e => {
      const row = new GUI.Rectangle("hr");
      row.width = "268px"; row.height = "36px"; row.thickness = 0; row.background = "transparent";
      for (let i = 0; i < N; i++) {
        const c = R(row, i * 28, 2, 26, 32, C.cell, 1, C.line, 4);
        T(c, String(e.call[i]), 0, 0, 26, 32, 20, C.text);
      }
      T(row, e.h + "H " + e.b + "B", N * 28 + 4, 2, 64, 32, 17, e.h === N ? C.focus : C.text, "left");
      col.stack.addControl(row);
    });
    setTimeout(() => { try { col.sv.verticalBar.value = 1; } catch (e) { /* 画面遷移で破棄済み */ } }, 60); // 最下部へ自動スクロール
  }

  /* ---------- サポートタブ ---------- */
  function buildTabs() {
    disposeChildren(tabHost);
    if (!G.tabs.length) { T(tabHost, "サポート機能は選択されていません", 0, 0, 720, 32, 16, C.muted); disposeChildren(panelHost); return; }
    const w = Math.min(88, Math.floor(720 / G.tabs.length));
    G.tabs.forEach((k, i) => {
      makeBtn(tabHost, SUP_TAB[k], i * w, 0, w - 4, 30, () => { G.tab = k; later(buildTabs); }, { bg: G.tab === k ? C.accent : C.btn, fs: 15 });
    });
    buildPanel();
  }

  function buildPanel() {
    disposeChildren(panelHost);
    panelRef = [];
    if (focus && focus.kind === "slot") setFocus(G.call, 0, { kind: "call", onChange: onCallChanged });
    const fn = PANELS[G.tab];
    if (fn) fn(panelHost);
    refreshAll();
  }

  const PANELS = {
    // S1: 確定した数字
    S1(host) {
      const a = T(host, "", 16, 20, 688, 56, 26, C.text, "left");
      const b = T(host, "", 16, 90, 688, 56, 26, C.text, "left");
      panelRef.push(() => {
        const { M, dc } = G.der, inn = [], out = [];
        for (let d = 0; d < 10; d++) { if (dc[d] === M) inn.push(d); if (dc[d] === 0) out.push(d); }
        a.text = "確定（含む）: " + (inn.join(", ") || "なし");
        b.text = "確定（含まない）: " + (out.join(", ") || "なし");
      });
    },
    // S2A: 候補リスト（最大5件・無作為）
    S2A(host) {
      T(host, "正解の可能性があるセット（無作為に最大5件）", 16, 8, 688, 32, 18, C.muted, "left");
      const lines = [];
      for (let i = 0; i < 5; i++) lines.push(T(host, "", 16, 52 + i * 52, 688, 44, 30, C.text, "left"));
      panelRef.push(() => { lines.forEach((t, i) => { t.text = G.s2aList[i] ? (i + 1) + ".   " + G.s2aList[i].join(" ") : ""; }); });
    },
    // S2B: 期待情報量が大きいCALL 上位3件
    S2B(host) {
      T(host, "期待情報量が大きいCALL（上位3件）", 16, 8, 688, 32, 18, C.muted, "left");
      const st = T(host, "", 16, 44, 688, 32, 18, C.focus, "left");
      const lines = [];
      for (let i = 0; i < 3; i++) lines.push(T(host, "", 16, 90 + i * 64, 688, 52, 28, C.text, "left"));
      panelRef.push(() => {
        const s = G.s2b;
        st.text = !s ? "" : s.status === "computing" ? "計算中…" : (s.approx ? "近似値" : "厳密値");
        lines.forEach((t, i) => {
          t.text = s && s.status === "done" && s.top[i] ? (i + 1) + ".  " + s.top[i].call.join(" ") + "    " + s.top[i].H.toFixed(3) + " bit" : "";
        });
      });
    },
    // S3A: 0～9とスペーサーの並べ替えメモ
    S3A(host) {
      const N = G.N, n = 10 + N, w = Math.min(56, Math.floor(700 / n)), showP = G.diff !== "hard";
      T(host, "①移動する要素をタップ → ②移動先の要素をタップ（その直前へ移動）", 10, 8, 700, 28, 16, C.muted, "left");
      const fs = Math.max(11, Math.floor(w / 3));
      const upd = [];
      G.s3a.forEach((it, idx) => {
        const r = R(host, 10 + idx * w, 48, w, 72, C.cell, 2, C.line, 4);
        const t1 = T(r, it.t === "d" ? String(it.v) : "□", 0, 4, w, 36, 24, C.text);
        const t2 = T(r, "", 0, 42, w, 24, fs, C.text);
        r.onPointerClickObservable.add(() => {
          const a = G.s3a;
          if (G.s3aSel === null) G.s3aSel = it;
          else if (G.s3aSel === it) G.s3aSel = null;
          else { const sel = G.s3aSel; a.splice(a.indexOf(sel), 1); a.splice(a.indexOf(it), 0, sel); G.s3aSel = null; later(buildPanel); return; }
          refreshAll();
        });
        upd.push(() => {
          let bg = C.cell, fg = C.text;
          if (it.t === "d" && showP) {
            const p = G.der.dc[it.v] / G.der.M;
            t2.text = p.toFixed(3);
            if (p === 0) { bg = C.dim; fg = "#7c8090"; } else { bg = probColor(p); fg = fgFor(p); }
          } else if (it.t === "s") { bg = "#20264a"; fg = C.muted; }
          r.background = bg; t1.color = fg; t2.color = fg;
          r.color = G.s3aSel === it ? C.focus : C.line; r.thickness = G.s3aSel === it ? 4 : 2;
        });
      });
      makeBtn(host, "最後尾へ移動", 10, 136, 200, 44, () => {
        if (G.s3aSel === null) return;
        const a = G.s3a; a.splice(a.indexOf(G.s3aSel), 1); a.push(G.s3aSel); G.s3aSel = null; later(buildPanel);
      }, { fs: 18 });
      panelRef.push(() => upd.forEach(f => f()));
    },
    // S3B: 各数字の2値エントロピー
    S3B(host) {
      T(host, "各数字が正解に含まれる事象の2値エントロピー", 10, 8, 700, 28, 16, C.muted, "left");
      const ts = [];
      for (let d = 0; d < 10; d++) {
        const r = R(host, 10 + (d % 5) * 138, 52 + Math.floor(d / 5) * 76, 130, 64, C.cell, 2, C.line, 6);
        ts.push(T(r, "", 0, 0, 130, 64, 20, C.text));
      }
      panelRef.push(() => ts.forEach((t, d) => { t.text = d + "   " + binEntropy(G.der.dc[d] / G.der.M).toFixed(3) + " bit"; }));
    },
    // S4: マトリクス
    S4(host) {
      const N = G.N, hw = 56, hh = 32, cw = 64, ch = 40, showP = G.diff !== "hard";
      const SYM = ["", "○", "×", "？"], TOOL = { o: 1, x: 2, q: 3, e: 0 };
      const apply = (d, k) => { G.s4[d][k] = TOOL[G.s4tool]; };
      const afterEdit = () => { G.s4check = null; refreshAll(); };
      // 列ヘッダー・行ヘッダー（ツール有効時のみ一括設定）
      for (let k = 0; k < N; k++) {
        const h = R(host, hw + k * cw, 0, cw - 2, hh - 2, C.panel2, 1, C.line, 4);
        T(h, "第" + (k + 1) + "桁", 0, 0, cw - 2, hh - 2, 15, C.muted);
        h.onPointerClickObservable.add(() => { if (!G.s4tool) return; for (let d = 0; d < 10; d++) apply(d, k); afterEdit(); });
      }
      for (let d = 0; d < 10; d++) {
        const h = R(host, 0, hh + d * ch, hw - 2, ch - 2, C.panel2, 1, C.line, 4);
        T(h, String(d), 0, 0, hw - 2, ch - 2, 20, C.text);
        h.onPointerClickObservable.add(() => { if (!G.s4tool) return; for (let k = 0; k < N; k++) apply(d, k); afterEdit(); });
      }
      const upd = [];
      for (let d = 0; d < 10; d++) for (let k = 0; k < N; k++) {
        const r = R(host, hw + k * cw, hh + d * ch, cw - 2, ch - 2, C.cell, 1, C.line, 4);
        const t = T(r, "", 0, 0, cw - 2, ch - 2, 22, C.text);
        r.onPointerClickObservable.add(() => {
          if (G.s4tool) apply(d, k); else G.s4[d][k] = (G.s4[d][k] + 1) % 4;
          afterEdit();
        });
        upd.push(() => {
          const st = G.s4[d][k];
          t.text = SYM[st];
          let bg = C.cell, fg = C.text;
          if (showP) { const p = G.der.pc[d * N + k] / G.der.M; bg = probColor(p); fg = fgFor(p); }
          r.background = bg; t.color = fg;
          const bad = G.s4check && G.s4check.bad && (st === 1 || st === 2);
          r.color = bad ? C.bad : C.line; r.thickness = bad ? 3 : 1;
        });
      }
      // ツールと矛盾チェック
      const tx = hw + N * cw + 16, tbs = [];
      [["o", "○入力"], ["x", "×入力"], ["q", "？入力"], ["e", "消去"]].forEach(([key, name], i) => {
        tbs.push([key, makeBtn(host, name, tx, 32 + i * 52, 190, 44, () => { G.s4tool = G.s4tool === key ? null : key; refreshAll(); }, { fs: 19 })]);
      });
      const msg = T(host, "", tx, 330, 190, 90, 16, C.text, "left");
      makeBtn(host, "矛盾チェック", tx, 256, 190, 48, () => {
        const c = G.pc, M = c.length / N, os = [], xs = [];
        for (let d = 0; d < 10; d++) for (let k = 0; k < N; k++) { if (G.s4[d][k] === 1) os.push([d, k]); else if (G.s4[d][k] === 2) xs.push([d, k]); }
        let ok = false;
        for (let j = 0; j < M && !ok; j++) {
          const base = j * N; let good = true;
          for (const o of os) if (c[base + o[1]] !== o[0]) { good = false; break; }
          if (good) for (const x of xs) if (c[base + x[1]] === x[0]) { good = false; break; }
          if (good) ok = true;
        }
        G.s4check = { bad: !ok }; refreshAll();
      }, { fs: 19, bg: C.accent });
      panelRef.push(() => {
        upd.forEach(f => f());
        tbs.forEach(([key, b]) => { b.background = G.s4tool === key ? C.focus : C.btn; b.color = G.s4tool === key ? "#111" : C.text; b.textBlock.color = G.s4tool === key ? "#111" : C.text; });
        msg.text = G.s4check ? (G.s4check.bad ? "矛盾があります\n（赤枠のセル）" : "矛盾なし") : (G.s4tool ? "ツール使用中:\n再度押すと循環入力" : "");
        msg.color = G.s4check && G.s4check.bad ? C.bad : G.s4check ? C.good : C.muted;
      });
    },
    // S5: 仮スロット5個
    S5(host) {
      const N = G.N;
      const bgFn = s => i => {
        const res = G.s5res[s]; if (!res) return null;
        if (res.kind === "skip") return C.yellow;
        if (res.kind === "dup") return res.digits.has(G.s5[s][i]) ? C.bad : null;
        if (res.kind === "ng") return C.bad;
        return null;
      };
      const fgFn = s => i => { const bg = bgFn(s)(i); return bg === C.yellow ? "#111" : null; };
      const stat = [];
      for (let s = 0; s < 5; s++) {
        const y = s * 66;
        const frame = R(host, 4, y, 4 + N * 60 + 8 + 130 + 120, 62, "transparent", 2, C.line, 8);
        const o = { kind: "slot", slot: s, onChange: () => { G.s5res[s] = null; }, bgFn: bgFn(s), fgFn: fgFn(s) };
        for (let i = 0; i < N; i++) arrCell(host, 8 + i * 60, y + 3, 56, G.s5[s], i, o, true);
        makeBtn(host, "コール欄へコピー", 8 + N * 60 + 8, y + 9, 130, 44, () => {
          for (let i = 0; i < N; i++) G.call[i] = G.s5[s][i];
          onCallChanged(); refreshAll();
        }, { fs: 14 });
        const st = T(host, "", 8 + N * 60 + 146, y + 9, 116, 44, 14, C.text, "left");
        stat.push(() => {
          frame.color = G.s5sel === s ? C.focus : C.line; frame.thickness = G.s5sel === s ? 3 : 2;
          const r = G.s5res[s];
          st.text = !r ? "" : r.kind === "skip" ? "判定せず" : r.kind === "dup" ? "重複あり" : r.kind === "ng" ? "矛盾あり" : "矛盾なし";
          st.color = r && (r.kind === "ng" || r.kind === "dup") ? C.bad : r && r.kind === "ok" ? C.good : r ? C.yellow : C.text;
        });
      }
      makeBtn(host, "矛盾チェック", 8, 5 * 66 + 8, 220, 48, () => {
        const c = G.pc, M = c.length / N;
        G.s5.forEach((slot, s) => {
          const filled = slot.filter(v => v >= 0).length;
          if (filled === 0 || N - filled >= 4) { G.s5res[s] = { kind: "skip" }; return; }
          const cnt = {}; slot.forEach(v => { if (v >= 0) cnt[v] = (cnt[v] || 0) + 1; });
          const dups = new Set(); Object.keys(cnt).forEach(k => { if (cnt[k] > 1) dups.add(+k); });
          if (dups.size) { G.s5res[s] = { kind: "dup", digits: dups }; return; }
          // 空欄に残りの数字を割り当てる全順列のどれかが履歴と矛盾しない ⇔ 一致する候補が1件以上ある
          let ok = false;
          for (let j = 0; j < M && !ok; j++) {
            const base = j * N; let good = true;
            for (let i = 0; i < N; i++) if (slot[i] >= 0 && c[base + i] !== slot[i]) { good = false; break; }
            if (good) ok = true;
          }
          G.s5res[s] = { kind: ok ? "ok" : "ng" };
        });
        refreshAll();
      }, { fs: 19, bg: C.accent });
      panelRef.push(() => stat.forEach(f => f()));
    },
    // S6: CALL予習
    S6(host) {
      T(host, "CALL欄の内容を今のCALLにしたときの結果（候補数）", 10, 8, 700, 28, 16, C.muted, "left");
      const btn = makeBtn(host, "予習する", 10, 44, 200, 48, () => {
        const call = G.call.slice(), key = call.join("");
        G.s6 = { key, status: "computing", rows: [] };
        refreshAll();
        runTask("s6", s6Gen(G.pc, G.N, call)).then(rows => {
          if (G && G.s6 && G.s6.key === key) { G.s6 = { key, status: "done", rows }; refreshAll(); }
        });
      }, { fs: 20, bg: C.accent });
      const st = T(host, "", 224, 44, 480, 48, 18, C.focus, "left");
      const sv = new GUI.ScrollViewer("sv6");
      place(sv, 10, 104, 700, 340);
      sv.thickness = 1; sv.color = C.line; sv.barSize = 10; sv.barColor = C.accent; sv.barBackground = C.panel;
      host.addControl(sv);
      const stack = new GUI.StackPanel("st6");
      stack.width = "680px";
      stack.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT; stack.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      sv.addControl(stack);
      let sig = "";
      panelRef.push(() => {
        setEnabled(btn, callReady());
        const s = G.s6;
        st.text = !s ? (callReady() ? "「予習する」を押すと計算します" : "CALL欄をN個すべて埋めてください（重複不可）") : s.status === "computing" ? "計算中…" : "CALL " + s.key.split("").join(" ");
        const nsig = s ? s.key + s.status : "";
        if (nsig === sig) return;
        sig = nsig;
        disposeChildren(stack);
        if (s && s.status === "done") s.rows.forEach(r => {
          const row = new GUI.Rectangle("r6"); row.width = "680px"; row.height = "36px"; row.thickness = 0; row.background = "transparent";
          T(row, "HIT " + r.h + " / BLOW " + r.b + "  →  次の候補数 " + r.n.toLocaleString("en-US") + " 件", 8, 0, 660, 36, 20, r.h === G.N ? C.focus : C.text, "left");
          stack.addControl(row);
        });
      });
    }
  };

  /* ===================== 状態更新 ===================== */
  function onCallChanged() { G.s6 = null; cancelTask("s6"); }

  // プレイヤー用候補集合が更新された直後に1回だけ呼ぶ
  function onPCandsUpdated() {
    G.der = deriveStats(G.pc, G.N);
    if (G.sup.S2A && G.diff !== "hard") {
      const M = G.der.M, idx = sampleIdx(M, Math.min(5, M));
      G.s2aList = Array.from(idx).map(j => candAt(G.pc, G.N, j));
    }
    G.s4check = null; G.s5res = [null, null, null, null, null]; G.s6 = null; cancelTask("s6");
    if (G.sup.S2B) {
      G.s2b = { status: "computing" };
      const id = G.id;
      runTask("s2b", s2bGen(G.pc, G.N, 3)).then(r => {
        if (G && G.id === id && !G.over) { G.s2b = { status: "done", top: r.top, approx: r.approx }; refreshAll(); }
      });
    }
    refreshAll();
  }

  /* ===================== ターン進行 ===================== */
  function beginActor(actor) {
    if (actor === "player") { G.phase = "player"; refreshAll(); }
    else enemyTurn();
  }

  function playerCall() {
    if (!G || G.phase !== "player" || G.over || !callReady()) return;
    const call = G.call.slice();
    const [h, b] = judge(call, G.enemySecret, G.N);
    G.hist.player.push({ call, h, b });
    G.pc = filterCands(G.pc, G.N, call, h, b);
    if (h === G.N) G.turnHit.player = true;
    G.call.fill(-1); onCallChanged();
    G.phase = "wait";
    renderHist("player");
    onPCandsUpdated();
    setFocus(G.call, 0, { kind: "call", onChange: onCallChanged });
    afterActor("player");
  }

  function enemyTurn() {
    const gid = G.id;
    G.phase = "enemy"; refreshAll();
    const delay = new Promise(r => setTimeout(r, 600));
    let callP;
    if (G.diff === "hard") callP = runTask("enemy", hardPickGen(G.ec, G.N));
    else {
      const r = pickEnemySync({ diff: G.diff, N: G.N, ec: G.ec, secret: G.mySecret, first: G.first, playerHit: G.turnHit.player, knownDelay: G.knownDelay });
      G.knownDelay = r.knownDelay; callP = Promise.resolve(r.call);
    }
    Promise.all([callP, delay]).then(([call]) => {
      if (!G || G.id !== gid || G.over) return;
      const [h, b] = judge(call, G.mySecret, G.N);
      G.hist.enemy.push({ call, h, b });
      G.ec = filterCands(G.ec, G.N, call, h, b);
      if (h === G.N) G.turnHit.enemy = true;
      G.phase = "wait";
      renderHist("enemy");
      afterActor("enemy");
    });
  }

  function afterActor(actor) {
    if (actor === G.first) beginActor(actor === "player" ? "enemy" : "player");
    else resolveTurn();
  }

  // 先攻がN HITでも後攻のCALL終了まで進め、ターン終了時に勝敗を判定する
  function resolveTurn() {
    const ph = G.turnHit.player, eh = G.turnHit.enemy;
    if (ph || eh) {
      G.over = true; G.result = ph && eh ? "draw" : ph ? "win" : "lose";
      cancelAllTasks();
      renderHist("player"); renderHist("enemy");
      refreshAll();
      showResult();
    } else {
      G.turn++; G.turnHit = { player: false, enemy: false };
      beginActor(G.first);
    }
  }

  function showResult() {
    const dim = R(layer, 0, 0, 1280, 720, "rgba(0,0,0,0.6)");
    dim.isPointerBlocker = true; // 背面の操作を受け付けない
    const box = R(dim, 400, 220, 480, 260, C.panel, 3, C.focus, 14);
    const msg = G.result === "win" ? "あなたの勝ち！" : G.result === "lose" ? "あなたの負け…" : "引き分け";
    T(box, msg, 0, 24, 480, 64, 40, C.focus);
    T(box, "敵のセット: " + G.enemySecret.join(" "), 0, 100, 480, 40, 24, C.text);
    T(box, G.turn + "ターンで決着", 0, 140, 480, 30, 18, C.muted);
    makeBtn(box, "準備画面へ戻る", 120, 184, 240, 56, () => later(buildPrep), { bg: C.accent, fs: 22 });
  }

  buildPrep();
  return scene;
};



/*
下記のゲームルールから、babylon.js version 9 以上の playground で動く、サンプルコードを作成してください。

## 修正版（生成AIへ渡す用）

変更が無い 1章・2章はそのまま使えます。以下は 0章（新設）、3章、4章の置き換え文です。

```markdown
## 0. 実装前提（全画面共通）
* 実装環境: Babylon.js v9以上。UIはすべて Babylon.GUI の AdvancedDynamicTexture（フルスクリーンUI）のみで構築し、HTML DOMは使用しない。3Dメッシュは使用せず、シーン背景色の上にGUIだけを表示する。Grid / StackPanel / Rectangle / TextBlock / Button / ScrollViewer のみを使用する。
* 基準解像度: 1280×720（横長）。idealWidth=1280, idealHeight=720 を設定し、以降の座標・サイズはすべてこの基準解像度でのピクセル値とする。
* 許可する操作: コントロールの単純なクリック／タップと、ScrollViewer のスクロール（タッチのドラッグ）のみ。キーボード入力、InputText、ホバー、右クリック、ダブルクリック、長押し、ドラッグ&ドロップ、マウスホイールが必須となる操作は使用しない。
* タップ対象: 最小 40×40、隣接するタップ対象との間隔は 4 以上。
* 状態の表現: 色だけで意味を伝えず、数値・記号・文言を併記する。
* 計算の実行契機: 候補集合の再計算、確率、エントロピー、予習結果は毎フレーム計算せず、各機能に定めた契機でのみ実行する。重い計算（S2B、S6、ハードの敵）は Web Worker、または1回あたり最大8msの分割実行で行い、計算中は「計算中…」を表示する。計算中に入力が変わった場合、古い入力に対する結果は破棄する。
* Babylon.GUI に標準で無いモーダル、ドロップダウン、ツールチップは使用しない。

## 用語定義
* 秘密セット: 各プレイヤーが用意したN桁のセット。
* 候補集合（プレイヤー用）: 敵の秘密セットとして、プレイヤーがこれまで行った全CALLのHIT数・BLOW数と矛盾しないセットの全体。初期状態は重複なしN桁の全セット（件数 10PN: N=2→90, 3→720, 4→5,040, 5→30,240, 6→151,200, 7→604,800）。Uint8Array（要素数=件数×N）で保持する。更新はプレイヤーのCALLの判定結果が確定した直後に1回だけ行う。サポート機能 S1～S6 はすべてこの候補集合を参照する。
* 候補集合（敵用）: プレイヤーの秘密セットに対して敵が持つ候補集合。プレイヤー用とは別に管理する。
* CALL入力欄: プレイ画面にあるN個のセル（各セルは 0～9 または空欄）。
* 数字選択パネル: プレイ画面下部に常時表示する、0～9＋「空欄」の11個のボタン。
* フォーカスセル: 数字選択パネルの入力先として選択中の1セル（CALL入力欄のセル、またはS5スロットのセル）。枠線で強調する。同時に存在するフォーカスセルは1つ。

## 3. サポート機能（各機能を個別にON/OFFできる）
* 共通: 各機能のON/OFFは準備画面で設定する。ONの機能だけがプレイ画面のサポートタブに並び、同時に表示できるのは1タブのみ（4章参照）。難易度が「ハード」の場合、S2A は無効（ON/OFFボタンをグレー表示して押せなくする）、S3A・S4 の確率濃淡は表示しない。
* S1
   * 候補集合の全要素に含まれる数字を「含まれることが確定した数字」、どの要素にも含まれない数字を「含まれないことが確定した数字」とする。
   * 2行で表示する。「確定（含む）: 1, 3」「確定（含まない）: 0, 5, 7」。該当なしは「なし」と表示する。候補集合の更新時に再計算する。
* S2A（キッズ・ノーマルのみ）
   * 候補集合から無作為に最大5件を選び、リスト表示する。抽選は候補集合が更新された時に1回だけ行い、他の操作では再抽選しない。
   * 「残り候補数: n」を、タブの選択に関係なく上部バーに常時表示する（3桁区切り）。
* S2B
   * 評価対象CALLは「候補集合に含まれるセット」とする。
   * 各評価対象CALLについて、候補集合の各要素との (HIT, BLOW) を集計し、結果ごとの発生確率 p から、期待情報量 H = −Σ p·log2(p) を求める（p=0 の項は0）。
   * 候補数 M が 3,000 以下: 全M件を評価対象CALLとし、全M件の候補と比較する（厳密評価）。
   * M が 3,001 以上: 評価対象CALLを候補集合から無作為に300件、比較相手を候補集合から無作為に最大3,000件抽出して近似評価する。画面に「近似値」と表示する。
   * H の降順で最大3件を、「セット（N桁）／期待情報量 x.xxx bit」の形式で表示する。同値の場合はセットの辞書順。
   * 候補集合の更新時に1回だけ計算する。
* S3A
   * 画面に「0」～「9」の数字要素10個と、空の枠（スペーサー）N個を、左から 0,1,…,9,スペーサー×N の初期順で横一列に並べる。並び順はゲーム判定に影響しない、プレイヤー用のメモである。
   * 要素の幅は min(56, floor(700 / (10+N))) 、高さは 72。
   * 並べ替えは2ステップのタップ操作で行う。①移動したい要素（数字またはスペーサー）をタップして選択する（枠線で強調。もう一度タップすると選択解除）。②別の要素をタップすると、選択していた要素をタップした要素の直前へ移動する。「最後尾へ移動」ボタンを列の右に置き、押すと最後尾へ移動する。アニメーションは行わず、即時に再配置する。
   * 難易度が「キッズ」または「ノーマル」の場合、各数字の下に P(d) = 「数字 d を含む候補数」/「全候補数」を小数点以下3桁で表示する。背景色は白（P=0に近い）から濃い青（P=1）への線形補間とし、P>0.6 のとき文字色は白にする。
   * P(d)=0 の数字は、背景を暗いグレー、文字を薄いグレーにする（グレーアウト）。
   * P(d) は候補集合の更新時にだけ再計算する。
* S3B
   * 「0」～「9」の各数字 d について、p = P(d)（数字dを含む候補数 / 全候補数）の2値エントロピー H(p) = −p·log2(p) −(1−p)·log2(1−p) を求める（p=0 または p=1 のとき 0）。
   * 10個のセル（5列×2行、各 130×64）に「数字 d／H(d) x.xxx bit」を表示する。全難易度で有効。候補集合の更新時にだけ再計算する。
* S4
   * 行に「0～9」、列に「第1桁～第N桁」を配置したマトリクスを表示する（行ヘッダー幅56、セル 64×44、列ヘッダー高さ40）。
   * セルの状態は「空欄」「○」「×」「？」。○=「第k桁は数字d」、×=「第k桁は数字dではない」、？=プレイヤー用の印（判定には使わない）。
   * マトリクスの右側（幅200）に、ツールボタン [○入力] [×入力] [？入力] [消去] と、[矛盾チェック] ボタンを縦に並べる。ツールボタンは排他的トグル。押すとそのツールが有効になり、有効なツールをもう一度押すと全ツールが無効になる。
   * ツールが有効な間: セルをタップすると、そのツールの状態（消去なら空欄）に設定する。行ヘッダーをタップするとその行のN個のセルすべて、列ヘッダーをタップするとその列の10個のセルすべてに同じ状態を設定する。
   * ツールがすべて無効の間: セルをタップするたびに「空欄→○→×→？→空欄」と循環する。
   * 難易度が「キッズ」または「ノーマル」の場合、セルの背景色を P(d,k)=「第k桁が数字dである候補数」/「全候補数」の濃淡で表す（S3Aと同じ色の割り当て）。候補集合の更新時にだけ再計算する。
   * 矛盾チェック: ボタンを押したとき、候補集合のうち、すべての○のセル(d,k)について「第k桁=d」、すべての×のセルについて「第k桁≠d」を満たす要素を数える。0件なら矛盾あり。○/×のセルすべてに赤い枠線（太さ3）を付け、「矛盾があります」と表示する（原因の特定はしない）。1件以上なら「矛盾なし」と表示する。赤枠は、いずれかのセルの状態が変わった時、候補集合が更新された時、または次の矛盾チェックの時に消す。
* S5
   * N桁分のセルを持つスロットを5個、縦に並べる（セル 56×56）。各スロットの右に [コール欄へコピー] ボタンを置き、最下部に [矛盾チェック] ボタンを置く。
   * セルをタップするとそのセルがフォーカスセルになる。画面下部の数字選択パネルで数字（または空欄）を押すと、フォーカスセルに入力され、フォーカスは同じスロットの次のセルへ移る（最終セルでは移らない）。重複する数字も入力できる（矛盾チェックで検出する）。
   * 最後にタップしたセルを含むスロットを「選択中スロット」とし、枠線で強調する。
   * [コール欄へコピー]: そのスロットの内容（空欄を含む）を CALL入力欄へ上書きコピーする。CALLは実行しない。
   * 矛盾チェック: スロットごとに次の順で判定し、結果をセルの背景色で示す。
      1. すべて空欄、または空欄が4つ以上: 判定せず、スロットの全セルの背景を黄色にする。
      2. 同じ数字が2つ以上: その数字が入っているセルの背景を赤にし、以降の判定は行わない。
      3. 候補集合に、スロットの入っている桁と一致する要素（空欄は任意の数字を許す）が1件以上ある: 矛盾なし（色を付けない）。0件: 矛盾あり（スロットの全セルの背景を赤）。
   * 背景色は、そのスロットのセルを編集した時、候補集合が更新された時、または次の矛盾チェックの時に消す。原因の特定はしない。
* S6
   * 対象は CALL入力欄の内容のみとする。
   * [予習する] ボタンを押したときだけ計算する。CALL入力欄がN個すべて埋まり、重複が無い場合のみボタンを有効にする。
   * 計算: 候補集合の全要素と対象CALLの (HIT, BLOW) を求め、結果ごとの件数を集計する。
   * 表示（ScrollViewer、1行36）: 「HIT h / BLOW b → 次の候補数 n 件」。HIT降順、同じならBLOW降順。
   * CALL入力欄の内容または候補集合が変わったら、表示済みの予習結果を消す。

## 4. ユーザーインターフェース（UI）仕様
* 準備画面（ゲーム起動時に必ず最初に表示）
   * 桁数N: 「2」～「7」の6個のボタン（単一選択）。初期値は4。Nを変更したらセット入力を空に戻す。
   * 自身のセット: N個のセルと数字選択パネルで入力する（重複不可。重複する数字のボタンは無効化する）。先頭に0も選べる。初期状態は空。
   * 先攻/後攻: 2個のボタン（単一選択）。初期値は先攻。
   * 敵のレベル: 「キッズ」「ノーマル」「ハード」の3個のボタン（単一選択）。初期値はノーマル。
   * サポート機能: S1, S2A, S2B, S3A, S3B, S4, S5, S6 のON/OFFトグルボタン。初期値はすべてOFF。ハード選択中は S2A を無効にする。
   * 「ゲーム開始」ボタン: セットがN個すべて入力済みのときだけ有効。押すとプレイ画面へ遷移する。
* プレイ画面（基準解像度 1280×720 の領域配置）
   * 上部バー（y 0～56）: 左に「第t ターン／あなたは先攻・後攻／難易度」、右に S2A がONのとき「残り候補数: n」。
   * 左履歴列（x 0～280, y 56～720）、右履歴列（x 1000～1280, y 56～720）。
   * 中央（x 280～1000）: サポート領域（y 56～540）、CALL欄の行（y 548～628）、数字選択パネル（y 636～712）。
   * サポート領域の最上部にサポートタブ（ONの機能のみ）を並べ、同時に表示するパネルは1つ。初期表示は最初のタブ。
   * 履歴列の規則: 先攻のCALLを左列、後攻のCALLを右列に表示する。各列は「CALLする側の履歴」を表し、列の最上段には「そのCALLの対象となる秘密セット（相手の秘密セット）」を表示する。
      * プレイヤーが先攻: 左列＝最上段にマスクした敵の秘密セット、その下にプレイヤーのCALLとHIT数・BLOW数。右列＝最上段にプレイヤーの秘密セット、その下に敵のCALLとHIT数・BLOW数。
      * プレイヤーが後攻: 左列＝最上段にプレイヤーの秘密セット、その下に敵のCALLとHIT数・BLOW数。右列＝最上段にマスクした敵の秘密セット、その下にプレイヤーのCALLとHIT数・BLOW数。
      * マスク表示は、N個のセルすべてに「？」を表示すること。ゲーム終了時に解除して実際の数字を表示する。
      * 履歴の1行は、N個の数字セル（各 28×32）と「xH yB」（幅72）で構成する。行の高さは36。各列は ScrollViewer とし、新しい行を追加したら最下部へ自動スクロールする。
   * CALL欄の行: N個のCALL入力セル（56×56）、[CALL] ボタン、[クリア] ボタン。セルをタップするとフォーカスセルになる。数字選択パネルでの入力後、フォーカスは次のセルへ移る。[CALL] はプレイヤーの手番で、N個すべて埋まっていて重複が無いときだけ有効。押すと、CALLを確定して判定を履歴に追加し、CALL入力欄を空に戻す。
   * 敵のCALLは自動で行う。プレイヤーのCALL確定後（またはプレイヤーが後攻でターン開始時）の600ms後に、敵のCALLと判定を履歴に追加する。敵のCALL待ちの間、[CALL] は無効。
   * 終了: 1章の勝敗判定が確定したら、画面中央（480×240）に結果（勝ち／負け／引き分け）と敵の秘密セットを表示する矩形を重ね、背面の操作を受け付けないようにする（isPointerBlocker）。[準備画面へ戻る] ボタンのみ有効。
```
*/



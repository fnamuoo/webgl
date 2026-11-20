// ######################################################################
// 176_spider-solitia
// https://playground.babylonjs.com/?BabylonToolkit#41Q0YM#3

/* ======================================================================
 * スパイダーソリティア  Babylon.js Playground サンプル (JavaScript)
 *   - Babylon.js 9 以上の Playground (JavaScript) に、このファイル全体を貼り付けて実行
 *   - 外部ファイル・画像は不要（カード絵柄は DynamicTexture で描画）。URL で指定した画像も、カードの表・裏に使える（CONFIG.IMAGE_DESIGNS）
 *   - 画面下部のボタン / 山札クリックで操作
 *   - クリア可能度の判定方式（ソルバー / モンテカルロ法）は、プレイ中にボタンで切り替え可能
 *   - クリア可能度は、数値に加えて、画面下部のグラフバー（赤→黄→緑）でも表示
 *   - ズーム・パン（回転はしない）: ホイール / ピンチ / 右・中ボタンのドラッグ / 何もない場所のドラッグ / ＋－ボタン / キー(+ - 0 1 矢印)
 *   - NORMAL / HARD は、解くのに必要な探索量が少ない「易しい配置」を選んで開始する（CONFIG.EASY_DEAL）
 *   - NORMAL / HARD では「ヒント」ボタンで、次の一手を示せる（CONFIG.HINT_LEVELS）
 *   - 画像の絵柄は、格子の 1 マスの中の一部だけを切り出して使える（CONFIG.IMAGE_DESIGNS の cellCrop / backCrop）
 *   - カードの移動: ドラッグ＆ドロップ、または「タップ → 移動先の列をタップ」
 *   - 画面レイアウト: ウィンドウの縦横比に合わせて、操作パネルを除いた全面にぴったり収まるように自動で配置する（CONFIG.LAYOUT）
 *       横長・正方形: 場札 10 列を縦向きに重ねて並べる（10列）/ 縦長: 場札を 10 段の横向きに重ねて並べる（10段。右端に山札・組札）
 *       余裕があるときは、表向きカードのずらし量を広げて、重なったカードの絵柄も見えるようにする
 *       「配置」ボタンで 自動 / 10列 / 2段（5 列 × 2 段）/ 10段 を切り替えられる。操作パネルのボタンは、画面の幅に合わせて折り返す
 * ====================================================================== */

// ######################################################################

// const ddbase1="../175/";
// const ddbase2="";
const ddbase1="https://raw.githubusercontent.com/fnamuoo/webgl/main/175/";
const ddbase2="https://raw.githubusercontent.com/fnamuoo/webgl/main/176/";

const fpathHearts = ddbase1 + "textures/trump1_hearts.png";
const fpathDiamonds = ddbase1 + "textures/trump1_diamonds.png";
const fpathClubs = ddbase1 + "textures/trump1_clubs.png";
const fpathSpades = ddbase1 + "textures/trump1_spades.png";

const fpathHearts2 = ddbase2 + "textures/trump2_hearts.png";
const fpathDiamonds2 = ddbase2 + "textures/trump2_diamonds.png";
const fpathClubs2 = ddbase2 + "textures/trump2_clubs.png";
const fpathSpades2 = ddbase2 + "textures/trump2_spades.png";

const fpathHearts3 = ddbase2 + "textures/trump6_hearts.png";
const fpathDiamonds3 = ddbase2 + "textures/trump6_diamonds.png";
const fpathClubs3 = ddbase2 + "textures/trump6_clubs.png";
const fpathSpades3 = ddbase2 + "textures/trump6_spades.png";
const fpathBabylonLogo = ddbase1 + "textures/babylon_logo_color.png";


export var createScene_test_4105 = async function () {

// ---------------------------------------------------------------------
// 設定
// ---------------------------------------------------------------------
const CONFIG = {
  LEVEL: "EASY",            // 起動時の難易度: "EASY" | "NORMAL" | "HARD"
  SEED: null,               // 数値を指定すると初期配置の生成が再現しやすくなる（null: ランダム）
  // クリア保証配置の生成（難易度ごとの 1 回あたりの探索時間、再生成の上限回数）
  GEN: {
    EASY:   { timeMs: 1500, runNodes: 20000 },
    NORMAL: { timeMs: 2500, runNodes: 20000 },
    HARD:   { timeMs: 4000, runNodes: 20000 },
    maxAttempts: 60,
  },
  ANALYSIS_TIME_MS: 2000,   // リアルタイムのクリア可能度表示（ソルバー方式）の探索時間
  ANALYSIS_MODE: "SOLVER",  // 起動時のクリア可能度の判定方式: "SOLVER" | "MONTE_CARLO"（プレイ中にボタンで切り替え可能）
  // 画像を使うカード絵柄（プレイ中に「絵柄」ボタンで、組み込みの模様と順番に切り替えられる）
  DEMO_IMAGE_SET: true,     // true: 動作確認用に、canvas で生成した画像（data URL）の絵柄を 1 つ追加する
  IMAGE_DESIGNS: [
    // 例（URL を差し替えて、行頭の // を外す）:
    // {
    //   name: "画像セットA",
    //   suitUrls: ["https://example.com/hearts.png", "https://example.com/diamonds.png",
    //              "https://example.com/clubs.png",  "https://example.com/spades.png"],  // [ハート, ダイヤ, クラブ, スペード]
    //   backUrl: "https://example.com/back.png",   // 省略可。裏面に使う画像（全カード共通）。省略時は base の裏面模様
    //   grid: { cols: 13, rows: 1 },               // 1 枚の画像の中の A,2,3,…,K の並び（左上から右へ、次の行へ、の順）
    //   fit: "card",                               // "card": 1 マスがカード全体の絵 / "art": カードの絵柄領域にはめ込む
    //   crop: "cover",                             // "cover": 縦横比を保って切り抜く / "stretch": 引き伸ばす
    //   cellCrop: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },  // 省略可。1 マスの中の一部だけを使う。マスの左上を原点にした割合（0～1）。w, h を省略すると右端・下端まで
    //   // cellCrop: { x: 20, y: 10, w: 160, h: 220, unit: "px" },  // unit: "px" なら、元画像のピクセルで指定（マスの左上が原点）
    //   backCrop: { x: 0.2, y: 0.2, w: 0.6, h: 0.6 },  // 省略可。裏面の画像の一部だけを使う（指定方法は cellCrop と同じ）
    //   drawIndex: false,                          // true: ランクとスートの表記をコードで重ねる（fit が "art" のときの既定は true）
    //   base: 0,                                   // 画像がないスート・裏面の代わりに使う組み込み模様の番号（0～2）
    //   texScale: 2,                               // テクスチャの解像度の倍率
    // },
    {
      name: "画像セットA",
      suitUrls: [fpathHearts,
                 fpathDiamonds,
                 fpathClubs,
                 fpathSpades],  // [ハート, ダイヤ, クラブ, スペード]
      backUrl: "", // "textures/asset/babylon_logo_color2.png",   // 裏面に使う画像（全カード共通）。
      grid: { cols: 7, rows: 2 },  // 1 枚の画像の中の A,2,3,…,K の並び（左上から右へ、次の行へ、の順）
      fit: "art",            // "card": 1 マスがカード全体の絵 / "art": カードの絵柄領域にはめ込む
      crop: "cover",         // "cover": 縦横比を保って切り抜く / "stretch": 引き伸ばす
      cellCrop: { x: 0.05, y: 0.05, w: 0.9, h: 0.9 },  // 1 マスの中の一部だけを使う。マスの左上を原点にした割合（0～1）
      drawIndex: true,       // true: ランクとスートの表記をコードで重ねる（fit が "art" のときの既定は true）
      base: 0,               // 画像がないスート・裏面の代わりに使う組み込み模様の番号（0～2）
      texScale: 2,           // テクスチャの解像度の倍率
    },
    {
      name: "画像セットB",
      suitUrls: [fpathHearts2,
                 fpathDiamonds2,
                 fpathClubs2,
                 fpathSpades2],  // [ハート, ダイヤ, クラブ, スペード]
      backUrl: "",   // 裏面に使う画像（全カード共通）。
      grid: { cols: 5, rows: 3 },  // 1 枚の画像の中の A,2,3,…,K の並び（左上から右へ、次の行へ、の順）
      fit: "art",            // "card": 1 マスがカード全体の絵 / "art": カードの絵柄領域にはめ込む
      crop: "cover",         // "cover": 縦横比を保って切り抜く / "stretch": 引き伸ばす
      cellCrop: { x: 0.15, y: 0.10, w: 0.7, h: 0.7 },  // 1 マスの中の一部だけを使う。マスの左上を原点にした割合（0～1）
      drawIndex: true,       // true: ランクとスートの表記をコードで重ねる（fit が "art" のときの既定は true）
      base: 0,               // 画像がないスート・裏面の代わりに使う組み込み模様の番号（0～2）
      texScale: 2,           // テクスチャの解像度の倍率
    },
    {
      name: "画像セットC",
      suitUrls: [fpathHearts3,
                 fpathDiamonds3,
                 fpathClubs3,
                 fpathSpades3],  // [ハート, ダイヤ, クラブ, スペード]
      backUrl: "",   // 裏面に使う画像（全カード共通）。
      grid: { cols: 5, rows: 3 },  // 1 枚の画像の中の A,2,3,…,K の並び（左上から右へ、次の行へ、の順）
      fit: "art",            // "card": 1 マスがカード全体の絵 / "art": カードの絵柄領域にはめ込む
      crop: "cover",         // "cover": 縦横比を保って切り抜く / "stretch": 引き伸ばす
      cellCrop: { x: 0.05, y: 0.10, w: 0.8, h: 0.8 },  // 1 マスの中の一部だけを使う。マスの左上を原点にした割合（0～1）
      drawIndex: true,       // true: ランクとスートの表記をコードで重ねる（fit が "art" のときの既定は true）
      base: 0,               // 画像がないスート・裏面の代わりに使う組み込み模様の番号（0～2）
      texScale: 2,           // テクスチャの解像度の倍率
    },
  ],
  // 易しい配置の選別（クリアしやすくする工夫）。
  //   ソルバーが少ない探索量（maxNodes 以下）で解を見つけられる配置だけを採用する。探索量が少ない配置は、
  //   後戻りの少ない素直な手順でクリアしやすい。値を小さくするほど易しくなるが、生成に時間がかかる。
  //   relaxAfterMs（ミリ秒）の間に見つからなければ、通常の条件（GEN）で見つかった配置を採用する。
  //   レベルを書かなければ（または EASY_DEAL: null）、選別しない。
  EASY_DEAL: {
    NORMAL: { maxNodes: 4000,  runNodes: 1000,  relaxAfterMs: 5000 },
    HARD:   { maxNodes: 50000, runNodes: 10000, relaxAfterMs: 30000 },
  },
  // ヒント機能（次の一手を示す）を使えるレベル。空配列で無効
  HINT_LEVELS: ["NORMAL", "HARD"],
  HINT_TIME_MS: 6000,       // ヒントの計算に使う時間（以前に求めた手順が使えるときは、計算せずすぐ示す）
  // ズーム・パン（画面の拡大縮小と平行移動。回転はしない）
  VIEW: {
    ZOOM_MIN: 0.4,          // ズームの下限（初期表示を 1 とした倍率）
    ZOOM_MAX: 6,            // ズームの上限
    WHEEL_STEP: 1.12,       // ホイール 1 ノッチあたりの拡大率
    BUTTON_STEP: 1.25,      // ＋－ボタン・キーの 1 回あたりの拡大率
    KEY_PAN: 0.6,           // 矢印キーの 1 回あたりの移動量（論理座標、ズーム 1 のとき）
  },
  // 画面レイアウト（ウィンドウの縦横比に合わせて、カードがなるべく大きく見えるように配置する。長さは列ピッチ = 1 の論理座標）
  LAYOUT: {
    MODE: "AUTO",           // "AUTO": 縦長なら ROWS、それ以外は SINGLE / "SINGLE": 場札 10 列（縦向きに重ねる）/ "ROWS": 場札 10 段（横向きに重ねる。縦長の画面向き）/ "DUAL": 5 列 × 2 段。プレイ中は「配置」ボタンで切り替え
    ROWS_ASPECT: 0.85,      // AUTO のとき、画面の（幅 ÷ 高さ）がこの値より小さければ（縦長なら）、10 段にする
    ROW_OVERLAP: 1.2,       // 10 段: カードの高さ ÷ 段の間隔。1 より大きいと、段どうしが縦に少し重なり（下の段が手前）、カードが大きくなる。1 なら重ねない
    ROW_FACE_MAX: 0.75,     // 10 段: 横に余裕があるとき、表向きカードのずらし量をここまで広げる（カード幅比）
    MIN_FAN_W: 3.2,         // 10 段: カードを横に重ねる領域に最低限確保する幅（列ピッチ = 1 の論理座標）
    MIN_TABLEAU_H: 5.2,     // 1 段配置で、場札の領域に最低限確保する高さ
    MIN_BAND_H: 3.6,        // 2 段配置で、1 段あたりの場札の領域に最低限確保する高さ
//    FACE_OFF_MAX: 0.42,     // 縦に余裕があるとき、表向きカードのずらし量をここまで広げる（カード高さ比。0.26 以下なら広げない）
    FACE_OFF_MAX: 0.26,     // 縦に余裕があるとき、表向きカードのずらし量をここまで広げる（カード高さ比。0.26 以下なら広げない）

    MAX_SPREAD: 1.35,       // 高さで大きさが決まるときの横の余り: 列の間隔（列ピッチ）をここまで広げて、画面の幅を使い切る（カードの大きさは変わらない。1 なら広げない）
    PAD: 0.1,               // 画面の端の余白
  },
  // モンテカルロ方式の設定
  MC: {
    trials: 30,             // プレイアウトの回数（数十回程度まで）
    nodeBudget: 2000,       // 1 回のプレイアウトで許す後戻りの量（探索状態数）。1 以下なら後戻りなしの貪欲なプレイ
    noise: 60,              // 方策に加えるノイズ（大きいほどランダム）
    timeMs: 2500,           // 全体の制限時間
  },
};

// =====================================================================
// 論理層（Babylon.js に依存しない）
// =====================================================================
// ====== LOGIC_BEGIN ======
const SUIT_SYMBOLS = ['♥', '♦', '♣', '♠'];
const RANK_LABELS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const TABLEAU_COUNTS = [6, 6, 6, 6, 5, 5, 5, 5, 5, 5];
let DECK = null; // { suit: Int8Array(104), rank: Int8Array(104) }

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
function makeDeck(level, rng) {
  let suits;
  if (level === 'EASY') suits = [Math.floor(rng() * 4)];
  else if (level === 'NORMAL') suits = [Math.floor(rng() * 2), 2 + Math.floor(rng() * 2)];
  else suits = [0, 1, 2, 3];
  const copies = 8 / suits.length;
  const suit = new Int8Array(104), rank = new Int8Array(104);
  let id = 0;
  for (const s of suits) for (let c = 0; c < copies; c++) for (let r = 1; r <= 13; r++) { suit[id] = s; rank[id] = r; id++; }
  return { suit, rank, suits };
}
function newState(rng) {
  const order = shuffle(Array.from({ length: 104 }, (_, i) => i), rng);
  const up = new Uint8Array(104);
  const cols = []; let p = 0;
  for (let c = 0; c < 10; c++) {
    const col = [];
    for (let i = 0; i < TABLEAU_COUNTS[c]; i++) col.push(order[p++]);
    up[col[col.length - 1]] = 1;
    cols.push(col);
  }
  return { cols, stock: order.slice(p), found: [], up };
}
function cloneState(s) {
  return { cols: s.cols.map(c => c.slice()), stock: s.stock.slice(), found: s.found.slice(), up: s.up.slice() };
}
function runStart(s, ci) {
  const col = s.cols[ci]; let k = col.length - 1;
  if (k < 0) return 0;
  while (k > 0) {
    const a = col[k - 1], b = col[k];
    if (s.up[a] && DECK.suit[a] === DECK.suit[b] && DECK.rank[a] === DECK.rank[b] + 1) k--; else break;
  }
  return k;
}
function canPick(s, ci, k) {
  const col = s.cols[ci];
  return k >= 0 && k < col.length && s.up[col[k]] === 1 && k >= runStart(s, ci);
}
function canDrop(s, from, k, to) {
  if (from === to || !canPick(s, from, k)) return false;
  const t = s.cols[to];
  return t.length === 0 || DECK.rank[t[t.length - 1]] === DECK.rank[s.cols[from][k]] + 1;
}
function flipExposed(s, ci) {
  const col = s.cols[ci];
  if (col.length) s.up[col[col.length - 1]] = 1;
}
function autoFoundation(s) {
  let removed = 0, again = true;
  while (again) {
    again = false;
    for (let ci = 0; ci < 10; ci++) {
      const col = s.cols[ci], n = col.length;
      if (n < 13) continue;
      const top = col[n - 1];
      if (DECK.rank[top] !== 1) continue;
      const su = DECK.suit[top]; let ok = true;
      for (let i = 0; i < 13; i++) {
        const id = col[n - 13 + i];
        if (!s.up[id] || DECK.suit[id] !== su || DECK.rank[id] !== 13 - i) { ok = false; break; }
      }
      if (ok) {
        const run = col.splice(n - 13); run.reverse(); // A..K
        s.found.push(run);
        flipExposed(s, ci);
        removed++; again = true;
      }
    }
  }
  return removed;
}
function applyMove(s, from, k, to) {
  const moved = s.cols[from].splice(k);
  for (const id of moved) s.cols[to].push(id);
  flipExposed(s, from);
  autoFoundation(s);
}
function canDeal(s) { return s.stock.length >= 10; }
function applyDeal(s) {
  const cards = s.stock.splice(0, 10);
  for (let i = 0; i < 10; i++) { s.cols[i].push(cards[i]); s.up[cards[i]] = 1; }
  autoFoundation(s);
  return cards;
}
function isClear(s) { return s.found.length === 8; }
function applyAction(s, m) { if (m.t === 'd') applyDeal(s); else applyMove(s, m.from, m.k, m.to); }

// 有効な移動の列挙（山札から配る操作は含めない）
// prune=true のときは、探索用に「意味のある移動」だけに絞る（完全性は保証しない）
function listMoves(s, prune) {
  const mv = [], cols = s.cols;
  const tops = cols.map(c => c.length ? DECK.rank[c[c.length - 1]] : 0);
  let firstEmpty = -1;
  for (let j = 0; j < 10; j++) if (cols[j].length === 0) { firstEmpty = j; break; }
  for (let i = 0; i < 10; i++) {
    const col = cols[i]; if (!col.length) continue;
    const rs = runStart(s, i);
    for (let k = rs; k < col.length; k++) {
      if (prune && k !== rs) continue;
      const id = col[k], r = DECK.rank[id], su = DECK.suit[id];
      const flips = k > 0 && !s.up[col[k - 1]];
      for (let j = 0; j < 10; j++) {
        if (j === i) continue;
        const t = cols[j];
        if (t.length === 0) {
          if (prune && (j !== firstEmpty || k === 0)) continue;
          mv.push({ t: 'm', from: i, k, to: j });
        } else if (tops[j] === r + 1) {
          if (prune && DECK.suit[t[t.length - 1]] !== su && !flips && k !== 0) continue;
          mv.push({ t: 'm', from: i, k, to: j });
        }
      }
    }
  }
  return mv;
}
function scoreMove(s, m) {
  const col = s.cols[m.from], id = col[m.k], r = DECK.rank[id], su = DECK.suit[id];
  const t = s.cols[m.to]; let sc = col.length - m.k;
  if (m.k > 0 && !s.up[col[m.k - 1]]) sc += 100;
  else if (m.k === 0) sc += 40;
  if (m.k > 0 && s.up[col[m.k - 1]] && DECK.suit[col[m.k - 1]] === su && DECK.rank[col[m.k - 1]] === r + 1) sc -= 80;
  if (t.length) { if (DECK.suit[t[t.length - 1]] === su) sc += 60; }
  else if (m.k === 0) sc -= 200; else sc += (r === 13 ? 20 : -10);
  return sc;
}
function orderedActions(s, prune, noise, rng) {
  const mv = listMoves(s, prune);
  for (const m of mv) m.sc = scoreMove(s, m) + (noise ? rng() * noise : 0);
  mv.sort((a, b) => b.sc - a.sc);
  if (canDeal(s)) mv.push({ t: 'd', sc: -1000 });
  return mv;
}
function stateKey(s) {
  const parts = s.cols.map(col => {
    let str = '';
    for (const id of col) str += String.fromCharCode(48 + ((DECK.suit[id] * 14 + DECK.rank[id]) << 1) + s.up[id]);
    return str;
  });
  if (s.stock.length === 0) parts.sort(); // 山札が空なら列の入れ替えは同一状態
  return parts.join('|') + '#' + s.stock.length;
}

// 反復DFSソルバー（generator）。一定ノードごとに yield する。
// 戻り値: { result: 'solved' | 'exhausted' | 'unknown', moves, nodes }
function* solveGen(root, opt) {
  const nodeLimit = opt.nodeLimit || 100000, deadline = performance.now() + (opt.timeMs || 2000), prune = opt.prune !== false;
  const visited = new Set([stateKey(root)]);
  const noise = opt.noise || 0, rng = opt.rng || Math.random;
  const stack = [{ s: root, acts: orderedActions(root, prune, noise, rng), i: 0 }];
  const path = [];
  let nodes = 0;
  if (isClear(root)) return { result: 'solved', moves: [], nodes };
  while (stack.length) {
    const f = stack[stack.length - 1];
    if (f.i >= f.acts.length) { stack.pop(); path.pop(); continue; }
    const m = f.acts[f.i++];
    const ns = cloneState(f.s); applyAction(ns, m);
    const key = stateKey(ns);
    if (visited.has(key)) continue;
    visited.add(key); nodes++;
    path.push(m);
    if (isClear(ns)) return { result: 'solved', moves: path.map(x => ({ t: x.t, from: x.from, k: x.k, to: x.to })), nodes };
    if (nodes >= nodeLimit) return { result: 'unknown', moves: [], nodes };
    if ((nodes & 127) === 0) {
      if (performance.now() > deadline) return { result: 'unknown', moves: [], nodes };
      yield nodes;
    }
    stack.push({ s: ns, acts: orderedActions(ns, prune, noise, rng), i: 0 });
  }
  return { result: 'exhausted', moves: [], nodes };
}
// ランダム再スタート付き探索（重い裾を持つ探索時間の対策）
function* solveRestartGen(root, opt) {
  const deadline = performance.now() + (opt.timeMs || 2000);
  const rng = opt.rng || Math.random;
  const cap = opt.maxTotalNodes || Infinity;   // 全体で使ってよい探索状態数（超えたら打ち切り）。「易しい配置」の選別に使う
  let total = 0, lastExhausted = false;
  for (let run = 0; ; run++) {
    const left = deadline - performance.now();
    if (left <= 0 || total >= cap) return { result: 'unknown', moves: [], nodes: total };
    const sub = solveGen(root, { nodeLimit: Math.min(opt.runNodes || 20000, cap - total), timeMs: left, prune: opt.prune, noise: run === 0 ? 0 : (opt.noise || 60), rng });
    let r; while (!(r = sub.next()).done) yield total + r.value;
    total += r.value.nodes;
    if (r.value.result === 'solved') return { result: 'solved', moves: r.value.moves, nodes: total };
    if (r.value.result === 'exhausted' && run === 0) return { result: 'exhausted', moves: [], nodes: total };
  }
}

// ---- モンテカルロ法（ヒューリスティック付きプレイアウト） ----
// 1 回のプレイアウト = 評価値にノイズを加えた方策で、現在の状態から最後までプレイする。
//   nodeBudget <= 1 : 後戻りしない貪欲なプレイ（同じ状態に戻る手は選ばない。進める手がなければ失敗）
//   nodeBudget >  1 : 同じ方策で、最大 nodeBudget 状態までの限定的な後戻りを許す
// ※ ランダムな手だけのプレイアウトは、スパイダーではほぼクリアできず指標が 0 に張り付くため、評価値で方策を偏らせている。
function greedyPlayout(root, rng, noise, maxSteps) {
  const s = cloneState(root);
  const visited = new Set([stateKey(s)]);
  for (let step = 0; step < maxSteps; step++) {
    if (isClear(s)) return true;
    const acts = orderedActions(s, true, noise, rng);
    let chosen = null;
    for (const m of acts) {
      const ns = cloneState(s); applyAction(ns, m);
      const key = stateKey(ns);
      if (visited.has(key)) continue;
      visited.add(key); chosen = ns; break;
    }
    if (!chosen) return false;
    s.cols = chosen.cols; s.stock = chosen.stock; s.found = chosen.found; s.up = chosen.up;
  }
  return isClear(s);
}
// trials 回のプレイアウトを行い、クリアできた回数を数える。時間切れなら、そこまでの回数で返す。
// 戻り値: { wins, trials(実行した回数), planned }
function* monteCarloGen(root, opt) {
  const trials = opt.trials || 30, noise = opt.noise || 60, rng = opt.rng || Math.random;
  const budget = opt.nodeBudget === undefined ? 2000 : opt.nodeBudget;
  const deadline = performance.now() + (opt.timeMs || 2500);
  let wins = 0, done = 0;
  for (; done < trials; done++) {
    if (performance.now() > deadline) break;
    if (budget > 1) {
      const g = solveGen(root, { nodeLimit: budget, timeMs: 1e9, prune: true, noise, rng });
      let r; while (!(r = g.next()).done) yield done;
      if (r.value.result === 'solved') wins++;
    } else {
      if (greedyPlayout(root, rng, noise, opt.maxSteps || 700)) wins++;
      yield done;
    }
  }
  return { wins, trials: done, planned: trials };
}
function replayClears(initial, moves) {
  const s = cloneState(initial);
  for (const m of moves) {
    if (m.t === 'd') { if (!canDeal(s)) return false; applyDeal(s); }
    else { if (!canDrop(s, m.from, m.k, m.to)) return false; applyMove(s, m.from, m.k, m.to); }
  }
  return isClear(s);
}
// ====== LOGIC_END ======

// =====================================================================
// 表示層（Babylon.js）
// =====================================================================
//export var createScene = function () {
  const GUI = BABYLON.GUI;
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.04, 0.32, 0.2, 1);
  const canvasEl = engine.getRenderingCanvas();
  canvasEl.style.touchAction = "none";

  // ---- レイアウト定数（論理座標: 1 単位 = 列ピッチ） ----
  // 列やカードの位置は、ウィンドウの縦横比に合わせて computeLayout() が決める。ここにあるのは、そのときに使う寸法の基本値。
//  const CARD_W = 0.94, CARD_H = CARD_W * 88 / 63;  // カード 1 枚の大きさ（列ピッチ 1 に対して、隣との隙間は 0.06）
  const CARD_W = 1.05, CARD_H = CARD_W * 88 / 63;  // カード 1 枚の大きさ（列ピッチ 1 に対して、隣との隙間は 0.06）

  const FACE_OFF = 0.26, DOWN_OFF = 0.09;          // 縦のずれ（カード高さ比）の基本値。表向きの 0.26 は、ランクとスートの表記（カード上端の約 24%）が隠れない量
  const FACE_OFF_MIN = 0.15, DOWN_OFF_MIN = 0.05;  // 縮小の下限
  const FACE_OFF_MAX = Math.max(FACE_OFF, CONFIG.LAYOUT.FACE_OFF_MAX);   // 縦に余裕があるときの、表向きのずらし量の上限
  let HUD_H = 100;                                 // 下部操作パネルの高さ(px)。ボタンの段数に応じて layoutHud() が決める
  const MOVE_DUR = 220, FLIP_DUR = 180, FOUND_DELAY = 260, FLY_Z = 3;
  const DRAG_Z = -(FLY_Z + 5), ROW_Z = 0.4;   // ドラッグ中のカードの z（最前面）/ 10 段配置での 1 段ごとの z の差（下の段が手前）

  // ---- ゲームの状態（表示層側の状態も含む） ----
  const G = {
    level: CONFIG.LEVEL, state: null, undo: null,
    status: "generating",           // generating | playing | cleared | over | failed
    grayMode: false, design: 0,
    layoutMode: String(CONFIG.LAYOUT.MODE || "AUTO").toUpperCase(),   // AUTO | SINGLE | DUAL
    selected: null,                 // { col, k }
    pointer: null,                  // 押下中のポインター情報
    layout: null, busyUntil: 0,
    genToken: 0, analysisId: 0,
    clearability: "-",              // HUD の文字表示
    clear: { kind: "none", value: 0, label: "" },   // グラフバー用: kind = none | pending | value | unknown
    analysisMode: CONFIG.ANALYSIS_MODE,   // "SOLVER" | "MONTE_CARLO"
    hint: null,                     // 表示中のヒント: { move }
    hintPlan: null,                 // 解の手順: { moves, i }（i 番目が、次に示す手）
    hintId: 0,                      // ヒント計算の要求ID（古い結果を捨てるため）
  };
  const isBusy = () => performance.now() < G.busyUntil;

  // ---- レイアウト（ウィンドウの縦横比に合わせて、カードがなるべく大きく見えるように配置する） ----
  //   SINGLE: 場札 10 列を横 1 段に並べ、各列は縦向きに重ねる（横長・正方形の画面向き）。上段に山札と組札。
  //   ROWS  : 場札 10 列を 10 段（横向きの帯）として縦に並べ、各段は左から右へ横向きに重ねる（縦長の画面向き）。
  //           山札・組札は右端の縦帯に、段と同じ大きさで置く（山札 = 1 段目、組札 = 3～10 段目の高さ）。
  //           段の間隔よりカードを少し高くして（ROW_OVERLAP）下の段を手前に重ね、カードを大きくする。ランクの表記はカードの左上にあるので隠れない。
  //   DUAL  : 場札を 5 列 × 2 段に並べ、各列は縦向きに重ねる。山札・組札は半分の大きさで最上段。
  //   AUTO  : 画面が縦長（幅 ÷ 高さ < ROWS_ASPECT）なら ROWS、そうでなければ SINGLE。
  //   座標は論理座標（列ピッチ = 1、原点 = 表示領域の中心、y は上向き）。表示領域は、操作パネルを除いた部分にぴったり合わせる。
  let LY = null;
  const DUAL_TOP_S = 0.5;   // 2 段配置のときの、山札・組札の縮尺
  function computeLayout() {
    const P = CONFIG.LAYOUT, pad = P.PAD;
    const W = Math.max(100, engine.getRenderWidth()), playH = Math.max(100, engine.getRenderHeight() - HUD_H);
    const topH = (s) => pad + CARD_H * s + 0.15;                                   // 上端の余白 + 山札・組札の段 + 場札との隙間
    const ov = Math.max(1, P.ROW_OVERLAP), rp0 = CARD_H / ov;                      // 10 段: 段の間隔の最小値
    const minS = { w: 10 + 2 * pad, h: topH(1) + pad + P.MIN_TABLEAU_H };          // 各配置で、最低限必要な範囲
    const minD = { w: 5 + 2 * pad, h: topH(DUAL_TOP_S) + pad + 0.15 + 2 * P.MIN_BAND_H };
    const minR = { w: 2 * pad + 2 * CARD_W + 0.12 + P.MIN_FAN_W, h: 2 * pad + CARD_H + 9 * rp0 };
    const pxOf = (m) => Math.min(W / m.w, playH / m.h);                            // 列ピッチ 1 あたりの px（= カードの大きさ）
    let mode = String(G.layoutMode);
    if (mode !== "SINGLE" && mode !== "DUAL" && mode !== "ROWS") mode = W / playH < P.ROWS_ASPECT ? "ROWS" : "SINGLE";
    const px = pxOf(mode === "DUAL" ? minD : mode === "ROWS" ? minR : minS);
    const worldW = W / px, worldH = playH / px, wt = worldH / 2, wb = -worldH / 2;
    const top = { found: [] }, cols = [], dual = mode === "DUAL";
    let tabTop = 0, midY = null, rows = null;
    // 横に余りがあるとき（高さで大きさが決まるとき）は、列の間隔だけを広げる。1 列あたりの幅 = pitch（カードの幅は変わらない）
    const pitch = mode === "ROWS" ? 1 : Math.max(1, Math.min(P.MAX_SPREAD, (worldW - 2 * pad) / (dual ? 5 : 10)));
    if (mode === "SINGLE") {
      top.s = 1; top.y = wt - pad - CARD_H / 2; top.stock = { x: -4.5 * pitch };
      for (let i = 0; i < 8; i++) top.found.push({ x: (i - 2.5) * pitch });
      const edgeTop = top.y - CARD_H / 2 - 0.15, yMin = wb + pad + CARD_H / 2;
      for (let i = 0; i < 10; i++) cols.push({ x: (i - 4.5) * pitch, y0: edgeTop - CARD_H / 2, yMin });
      tabTop = edgeTop + 0.05;
    } else if (mode === "DUAL") {
      top.s = DUAL_TOP_S; top.y = wt - pad - CARD_H * top.s / 2;
      const tx = (k) => (k - 4.5) * top.s * pitch;                                  // 山札 + 空き 1 + 組札 8 の 10 スロット（場札 5 列ぶんの幅に収まる）
      top.stock = { x: tx(0) };
      for (let i = 0; i < 8; i++) top.found.push({ x: tx(2 + i) });
      const edgeTop = top.y - CARD_H * top.s / 2 - 0.15, edgeBottom = wb + pad, gap = 0.15;
      const bandH = (edgeTop - edgeBottom - gap) / 2;
      for (let b = 0; b < 2; b++) {
        const bt = edgeTop - b * (bandH + gap), bb = bt - bandH;
        for (let j = 0; j < 5; j++) cols.push({ x: (j - 2) * pitch, y0: bt - CARD_H / 2, yMin: bb + CARD_H / 2 });
      }
      tabTop = edgeTop + 0.05; midY = edgeTop - bandH - gap / 2;
    } else {   // ROWS
      const rp = (worldH - 2 * pad - CARD_H) / 9;                                    // 段の間隔（rp0 以上。縦に余りがあれば広がる）
      const yRow = (i) => wt - pad - CARD_H / 2 - i * rp;
      const x0 = -worldW / 2 + pad + CARD_W / 2, sx = worldW / 2 - pad - CARD_W / 2;  // 各段の 1 枚目の x / 右端の縦帯（山札・組札）の x
      const xMax = sx - CARD_W - 0.12;                                               // 横に重ねたときの、最後のカードの中心 x の上限
      top.s = 1; top.y = yRow(0); top.stock = { x: sx };
      for (let i = 0; i < 8; i++) top.found.push({ x: sx });
      for (let i = 0; i < 10; i++) cols.push({ x: x0, y0: yRow(i), xMax, horiz: true });
      rows = { yTop: yRow(0) + rp / 2, rp, stripX: xMax + CARD_W / 2 + 0.06 };
    }
    // 山札・組札の y（ROWS 以外は 1 段に並ぶ。ROWS は 右端の縦帯で、山札 = 1 段目、組札 = 3～10 段目の高さ）
    top.stock.y = mode === "ROWS" ? cols[0].y0 : top.y;
    top.found.forEach((f, i) => { f.y = mode === "ROWS" ? cols[2 + i].y0 : top.y; });
    LY = { mode, dual, px, pitch, worldW, worldH, top, cols, tabTop, midY, rows, xLeft: (dual ? -2.5 : -5) * pitch };
  }
  // 1 列（10 段配置では 1 段）ぶんのずれ（表向き・裏向き）。基本は、余裕があれば表向きを O.faceMax まで広げ、足りなければ縮める。
  //   nUp / nDown: 最後のカードを除く、表向き・裏向きの枚数。avail: 1 枚目から最終カードの中心までに使える長さ。unit: カードの寸法（縦向きは CARD_H、横向きは CARD_W）
  const COL_OFF = () => ({ face: FACE_OFF, faceMax: FACE_OFF_MAX, faceMin: FACE_OFF_MIN, down: DOWN_OFF, downMin: DOWN_OFF_MIN });
  const ROW_OFF = () => ({ face: 0.45, faceMax: Math.max(0.45, CONFIG.LAYOUT.ROW_FACE_MAX), faceMin: 0.3, down: 0.12, downMin: 0.06 });   // 横向き（カード幅比）。ランク表記はカード幅の約 35%
  function columnOffsets(nUp, nDown, avail, unit, O) {
    let face = O.faceMax * unit, down = O.down * unit;
    if (nUp * face + nDown * down > avail) {
      // 1) 表向きのずれを、基本値（O.face）まで縮める
      face = nUp > 0 ? Math.max(O.face * unit, (avail - nDown * down) / nUp) : face;
      if (nUp * face + nDown * down > avail) {
        // 2) まだ足りなければ、表向き・裏向きを同じ比率で縮める（下限あり）
        const s = avail / (nUp * O.face * unit + nDown * O.down * unit);
        face = Math.max(O.face * unit * s, O.faceMin * unit); down = Math.max(O.down * unit * s, O.downMin * unit);
      }
    }
    return { face, down };
  }
  computeLayout();

  // ---- カメラ（正射影） ----
  const camera = new BABYLON.FreeCamera("cam", new BABYLON.Vector3(0, 0, -10), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  camera.minZ = 0.1; camera.maxZ = 50;

  // ---- ズーム・パン ----
  // レイアウトは、ウィンドウに全体が収まるように作る。そのため、ズーム 1 が「全体表示」。
  // ズーム倍率とパン量（論理座標）を重ねて、正射影カメラの範囲を決める。カメラの向きは変えない（回転なし）。
  const ZOOM_FIT = 1;
  const view = { zoom: 1, panX: 0, panY: 0, base: null };
  let CONTENT = { l: -5, r: 5, b: -5, t: 5 };      // 表示の中心が動いてよい範囲（カードを置く範囲）
  function applyView(skipPanClamp) {
    const b = view.base; if (!b) return;
    view.zoom = Math.min(CONFIG.VIEW.ZOOM_MAX, Math.max(CONFIG.VIEW.ZOOM_MIN, view.zoom));
    if (!skipPanClamp) {
      view.panX = Math.min(CONTENT.r, Math.max(CONTENT.l, b.cx + view.panX)) - b.cx;
      view.panY = Math.min(CONTENT.t, Math.max(CONTENT.b, b.cy + view.panY)) - b.cy;
    }
    const cx = b.cx + view.panX, cy = b.cy + view.panY, hw = b.hw / view.zoom, hh = b.hh / view.zoom;
    camera.orthoLeft = cx - hw; camera.orthoRight = cx + hw;
    camera.orthoTop = cy + hh;  camera.orthoBottom = cy - hh;
  }
  function updateCamera() {
    // 論理座標の表示領域（LY.worldW × LY.worldH）が、キャンバスの上部（操作パネルを除いた部分）にぴったり重なるようにする
    const H = engine.getRenderHeight();
    const hudFrac = Math.min(0.5, HUD_H / H);
    const total = LY.worldH / (1 - hudFrac);
    view.base = { cx: 0, cy: LY.worldH / 2 - total / 2, hw: LY.worldW / 2, hh: total / 2 };
    CONTENT = { l: -LY.worldW / 2, r: LY.worldW / 2, b: -LY.worldH / 2, t: LY.worldH / 2 };
    applyView();
  }

  // ---- 背景の枠（山札・組札・場札の空き枠） ----
  const slotMat = new BABYLON.StandardMaterial("slot", scene);
  slotMat.disableLighting = true; slotMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  slotMat.diffuseColor = BABYLON.Color3.Black(); slotMat.specularColor = BABYLON.Color3.Black();
  slotMat.alpha = 0.12; slotMat.backFaceCulling = false; slotMat.disableDepthWrite = true;
  function addSlot() {
    const p = BABYLON.MeshBuilder.CreatePlane("slot", { width: CARD_W, height: CARD_H }, scene);
    p.position.z = 1; p.material = slotMat; p.isPickable = false;
    return p;
  }
  const slotStock = addSlot(), slotFound = [], slotCols = [];
  for (let i = 0; i < 8; i++) slotFound.push(addSlot());
  for (let i = 0; i < 10; i++) slotCols.push(addSlot());
  // 枠（と、ヒントで光らせる空き列の枠）を、現在のレイアウトの位置に置く
  function placeSlots() {
    const sy = LY.rows ? Math.min(1, LY.rows.rp / CARD_H * 0.94) : 1;   // 10 段配置は段が縦に重なるので、枠は縦を縮めて重ならないようにする
    const T = LY.top, put = (p, x, y, s) => { p.position.set(x, y, 1); p.scaling.set(s, s * sy, 1); };
    put(slotStock, T.stock.x, T.stock.y, T.s);
    T.found.forEach((f, i) => put(slotFound[i], f.x, f.y, T.s));
    LY.cols.forEach((c, i) => { put(slotCols[i], c.x, c.y0, 1); hintSlots[i].position.set(c.x, c.y0, 0.5); });
  }

  // ---- カード絵柄 ----
  // 1) 組み込みの模様: DynamicTexture に描画する
  const BUILTIN_DESIGNS = [
    { name: "クラシック", face: "#fdfdf8", border: "#8a8a80", red: "#c62828", black: "#202020", backBg: "#1f4aa8", backFg: "#9db7ee", pattern: "diamond" },
    { name: "ダーク",     face: "#2b2f3a", border: "#5b6275", red: "#ff6b6b", black: "#e8e8f0", backBg: "#6a1b3a", backFg: "#e6a3bf", pattern: "stripe" },
    { name: "パステル",   face: "#fff4e6", border: "#c9a27a", red: "#e0556f", black: "#3d5a80", backBg: "#2a9d8f", backFg: "#d8f3ee", pattern: "dot" },
  ];
  const TW = 140, TH = 196;   // 絵柄を描くときの論理サイズ（画像絵柄は texScale 倍の解像度で描く）

  // 2) 画像の絵柄: スートごとの画像（A～K が格子状に並ぶ）と、共通の裏面画像
  // 動作確認用の画像（canvas で生成して data URL にする。CORS の問題が起きない）
  function makeDemoSheet(suit) {
    const cols = 5, rows = 3, cw = 200, ch = 280;
    const cv = document.createElement("canvas"); cv.width = cols * cw; cv.height = rows * ch;
    const ctx = cv.getContext("2d");
    for (let i = 0; i < 13; i++) {
      const x = (i % cols) * cw, y = Math.floor(i / cols) * ch;
      ctx.fillStyle = suit < 2 ? "hsl(" + (350 + i * 4) + ",70%," + (92 - i) + "%)" : "hsl(" + (210 + i * 5) + ",60%," + (92 - i) + "%)";
      ctx.fillRect(x, y, cw, ch);
      ctx.strokeStyle = "#555"; ctx.lineWidth = 6; ctx.strokeRect(x + 3, y + 3, cw - 6, ch - 6);
      ctx.fillStyle = suit < 2 ? "#b71c1c" : "#1a237e"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.font = "bold 90px sans-serif"; ctx.fillText(RANK_LABELS[i + 1], x + cw / 2, y + 120);
      ctx.font = "100px sans-serif"; ctx.fillText(SUIT_SYMBOLS[suit], x + cw / 2, y + 230);
    }
    return cv.toDataURL("image/png");
  }
  function makeDemoBack() {
    const cv = document.createElement("canvas"); cv.width = 400; cv.height = 560;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#3a1c71"; ctx.fillRect(0, 0, 400, 560);
    ctx.strokeStyle = "#ffaf7b"; ctx.lineWidth = 4;
    for (let r = 20; r < 460; r += 24) { ctx.beginPath(); ctx.arc(200, 280, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 12; ctx.strokeRect(14, 14, 372, 532);
    return cv.toDataURL("image/png");
  }
  // 切り出し範囲 { x, y, w, h, unit } の整理。指定がなければ null（= 全体を使う）
  //   unit: "ratio"（既定。マスの幅・高さに対する割合 0～1）/ "px"（元画像のピクセル）。いずれもマスの左上が原点
  function normCrop(r) {
    if (!r || typeof r !== "object") return null;
    return {
      x: Number(r.x) || 0, y: Number(r.y) || 0,
      w: r.w === undefined ? undefined : Number(r.w), h: r.h === undefined ? undefined : Number(r.h),   // 省略時は右端・下端まで
      unit: r.unit === "px" ? "px" : "ratio",
    };
  }
  function normalizeImageDesign(c) {
    const fit = c.fit === "art" ? "art" : "card";
    return {
      name: c.name || "画像", type: "image",
      suitUrls: (c.suitUrls || []).slice(0, 4), backUrl: c.backUrl || null,   // 文字列、または URL を返す関数
      cols: (c.grid && c.grid.cols) || 13, rows: (c.grid && c.grid.rows) || 1,
      fit, crop: c.crop === "stretch" ? "stretch" : "cover",
      drawIndex: c.drawIndex !== undefined ? !!c.drawIndex : fit === "art",
      cellCrop: normCrop(c.cellCrop), backCrop: normCrop(c.backCrop),   // マス（裏面は画像全体）の中の、使う部分
      base: BUILTIN_DESIGNS[c.base || 0] ? (c.base || 0) : 0, texScale: c.texScale || 2,
      images: null, failed: false,
    };
  }
  const imageDefs = (CONFIG.IMAGE_DESIGNS || []).slice();
  // if (CONFIG.DEMO_IMAGE_SET) {
  //   imageDefs.push({
  //     name: "デモ画像",
  //     suitUrls: [0, 1, 2, 3].map((s) => () => makeDemoSheet(s)), backUrl: () => makeDemoBack(),
  //     grid: { cols: 5, rows: 3 }, fit: "card", crop: "cover", drawIndex: false, base: 0, texScale: 2,
  //   });
  // }
  const DESIGNS = BUILTIN_DESIGNS.concat(imageDefs.map(normalizeImageDesign));
  const baseOf = (d) => (d.type === "image" ? BUILTIN_DESIGNS[d.base] : d);

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = "anonymous";   // 別のサイトの画像は、CORS を許可しているものだけ使える
      const timer = setTimeout(() => reject(new Error("timeout")), 15000);
      im.onload = () => { clearTimeout(timer); resolve(im); };
      im.onerror = () => { clearTimeout(timer); reject(new Error("load error")); };
      im.src = src;
    });
  }
  // 画像絵柄の画像を読み込む（読み込み済みなら何もしない）。成功なら true
  function ensureDesignReady(d) {
    if (d.type !== "image" || d.images) return Promise.resolve(true);
    const resolveUrl = (u) => (typeof u === "function" ? u() : u);
    const suitJobs = [0, 1, 2, 3].map((i) => (d.suitUrls[i] ? loadImage(resolveUrl(d.suitUrls[i])) : Promise.resolve(null)));
    const backJob = d.backUrl ? loadImage(resolveUrl(d.backUrl)) : Promise.resolve(null);
    return Promise.all([Promise.all(suitJobs), backJob])
      .then((r) => { d.images = { suits: r[0], back: r[1] }; return true; })
      .catch(() => { d.failed = true; return false; });
  }

  // 画像の格子（cols × rows）の idx 番目のマスを、(dx,dy,dw,dh) の矩形に描く。
  //   sub（{x,y,w,h,unit}）を指定すると、マスの中のその範囲だけを切り出して使う（マスの枠・余白・隣との境目などを除くため）。
  //   crop は、切り出した範囲を描画先の縦横比に合わせるときの方法（"cover": 縦横比を保って切り抜く / "stretch": 引き伸ばす）
  function drawCell(ctx, img, cols, rows, idx, dx, dy, dw, dh, crop, sub) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height; // 画像のサイズ
    const cw = iw / cols, ch = ih / rows; // 1grid分のサイズ
    // 1) マスの中の切り出し範囲（マスの左上を原点としたピクセル）
    let ox = 0, oy = 0, w = cw, h = ch;
    if (sub) {
      const px = sub.unit === "px";
      const x = Math.min(Math.max(px ? sub.x : sub.x * cw, 0), cw);
      const y = Math.min(Math.max(px ? sub.y : sub.y * ch, 0), ch);
      const rw = sub.w === undefined ? cw - x : (px ? sub.w : sub.w * cw);
      const rh = sub.h === undefined ? ch - y : (px ? sub.h : sub.h * ch);
      const w2 = Math.min(rw, cw - x), h2 = Math.min(rh, ch - y);   // マスの内側に収める
      if (w2 > 0 && h2 > 0) { ox = x; oy = y; w = w2; h = h2; }      // 範囲が不正なときは、マス全体を使う
    }
    // 2) 画像上の取り出し範囲
    let sx = (idx % cols) * cw + ox, sy = Math.floor(idx / cols) * ch + oy, sw = w, sh = h;
    if (crop !== "stretch") {   // cover: 縦横比を保ち、はみ出す部分を中央基準で切り落とす
      const ta = dw / dh, sa = sw / sh;
      if (sa > ta) { const nw = sh * ta; sx += (sw - nw) / 2; sw = nw; }
      else { const nh = sw / ta; sy += (sh - nh) / 2; sh = nh; }
    }
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }
  // ランクとスートの表記。カードが重なって手前側が隠れても読めるよう、奥側の端（左上）に描く
  function drawIndexLabel(ctx, b, suit, rank, withBg) {
    const label = RANK_LABELS[rank];
    ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
    ctx.font = "bold 36px sans-serif";
    const w = ctx.measureText(label).width;
    if (withBg) { ctx.fillStyle = "rgba(255,255,255,0.82)"; ctx.fillRect(2, 2, w + 52, 46); }
    ctx.fillStyle = suit < 2 ? b.red : b.black;
    ctx.fillText(label, 9, 40);
    ctx.font = "30px sans-serif"; ctx.fillText(SUIT_SYMBOLS[suit], 9 + w + 4, 40);
  }
  function drawProceduralFace(ctx, b, suit, rank) {
    ctx.fillStyle = b.face; ctx.fillRect(0, 0, TW, TH);
    ctx.strokeStyle = b.border; ctx.lineWidth = 6; ctx.strokeRect(3, 3, TW - 6, TH - 6);
    drawIndexLabel(ctx, b, suit, rank, false);
    ctx.fillStyle = suit < 2 ? b.red : b.black; ctx.textAlign = "center";
    ctx.font = "84px sans-serif"; ctx.fillText(SUIT_SYMBOLS[suit], TW / 2, TH / 2 + 62);
  }
  function drawProceduralBack(ctx, b) {
    ctx.fillStyle = b.backBg; ctx.fillRect(0, 0, TW, TH);
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 5; ctx.strokeRect(6, 6, TW - 12, TH - 12);
    ctx.strokeStyle = b.backFg; ctx.fillStyle = b.backFg; ctx.lineWidth = 2;
    if (b.pattern === "diamond") {
      for (let y = 14; y < TH; y += 22) for (let x = 14; x < TW; x += 22) {
        ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + 8, y); ctx.lineTo(x, y + 8); ctx.lineTo(x - 8, y); ctx.closePath(); ctx.stroke();
      }
    } else if (b.pattern === "stripe") {
      for (let k = -TH; k < TW; k += 14) { ctx.beginPath(); ctx.moveTo(k, TH); ctx.lineTo(k + TH, 0); ctx.stroke(); }
    } else {
      for (let y = 16; y < TH; y += 20) for (let x = 16; x < TW; x += 20) { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 5; ctx.strokeRect(6, 6, TW - 12, TH - 12);
  }

  let faceMats = new Map(), backMat = null;
  // 現在の絵柄用の DynamicTexture と、論理サイズ（TW × TH）で描けるようにした描画コンテキスト
  function newDynTex(name) {
    const d = DESIGNS[G.design], s = d.type === "image" ? d.texScale : 1;
    const tex = new BABYLON.DynamicTexture(name, { width: Math.round(TW * s), height: Math.round(TH * s) }, scene, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
    const ctx = tex.getContext(); ctx.scale(s, s);
    return { tex, ctx };
  }
  function matFromTex(name, tex) {
    const m = new BABYLON.StandardMaterial(name, scene);
    m.disableLighting = true; m.emissiveTexture = tex;
    m.diffuseColor = BABYLON.Color3.Black(); m.specularColor = BABYLON.Color3.Black();
    m.backFaceCulling = false;
    return m;
  }
  function getBackMat() {
    if (backMat) return backMat;
    const d = DESIGNS[G.design], { tex, ctx } = newDynTex("back");
    if (d.type === "image" && d.images && d.images.back) drawCell(ctx, d.images.back, 1, 1, 0, 0, 0, TW, TH, d.crop, d.backCrop);   // 画像の裏面（全カード共通）
    else drawProceduralBack(ctx, baseOf(d));
    tex.update();
    backMat = matFromTex("backMat", tex);
    return backMat;
  }
  function getFaceMat(suit, rank) {
    const key = suit * 14 + rank;
    if (faceMats.has(key)) return faceMats.get(key);
    const d = DESIGNS[G.design], b = baseOf(d), { tex, ctx } = newDynTex("face" + key);
    const img = d.type === "image" && d.images ? d.images.suits[suit] : null;
    if (img && d.fit === "card") {          // 1 マス = カード全体の絵
      drawCell(ctx, img, d.cols, d.rows, rank - 1, 0, 0, TW, TH, d.crop, d.cellCrop);
      if (d.drawIndex) drawIndexLabel(ctx, b, suit, rank, true);
    } else if (img) {                       // 1 マス = 絵柄。カードの枠と表記の下にはめ込む
      ctx.fillStyle = b.face; ctx.fillRect(0, 0, TW, TH);
      drawCell(ctx, img, d.cols, d.rows, rank - 1, 10, 50, TW - 20, TH - 60, d.crop, d.cellCrop);
      ctx.strokeStyle = b.border; ctx.lineWidth = 6; ctx.strokeRect(3, 3, TW - 6, TH - 6);
      if (d.drawIndex) drawIndexLabel(ctx, b, suit, rank, false);
    } else drawProceduralFace(ctx, b, suit, rank);   // 画像がないスートは、組み込みの模様で代用
    tex.update();
    const m = matFromTex("faceMat" + key, tex);
    faceMats.set(key, m);
    return m;
  }
  function disposeMaterials() {
    faceMats.forEach((m) => { if (m.emissiveTexture) m.emissiveTexture.dispose(); m.dispose(); });
    faceMats = new Map();
    if (backMat) { if (backMat.emissiveTexture) backMat.emissiveTexture.dispose(); backMat.dispose(); backMat = null; }
  }

  // 移動不可能なカードのグレー表示用・選択中のハイライト用の半透明マテリアル
  const shadeMat = new BABYLON.StandardMaterial("shade", scene);
  shadeMat.disableLighting = true; shadeMat.emissiveColor = BABYLON.Color3.Black(); shadeMat.diffuseColor = BABYLON.Color3.Black();
  shadeMat.specularColor = BABYLON.Color3.Black(); shadeMat.alpha = 0.5; shadeMat.backFaceCulling = false; shadeMat.disableDepthWrite = true;
  const hlMat = new BABYLON.StandardMaterial("hl", scene);
  hlMat.disableLighting = true; hlMat.emissiveColor = new BABYLON.Color3(1, 0.9, 0.2); hlMat.diffuseColor = BABYLON.Color3.Black();
  hlMat.specularColor = BABYLON.Color3.Black(); hlMat.alpha = 0.35; hlMat.backFaceCulling = false; hlMat.disableDepthWrite = true;
  // ヒント表示用（動かすカード: 水色 / 動かし先: 黄緑）
  function makeHintMat(name, r, g, b) {
    const m = new BABYLON.StandardMaterial(name, scene);
    m.disableLighting = true; m.emissiveColor = new BABYLON.Color3(r, g, b); m.diffuseColor = BABYLON.Color3.Black();
    m.specularColor = BABYLON.Color3.Black(); m.alpha = 0.5; m.backFaceCulling = false; m.disableDepthWrite = true;
    return m;
  }
  const hintSrcMat = makeHintMat("hintSrc", 0.1, 0.85, 1.0), hintDstMat = makeHintMat("hintDst", 0.55, 1.0, 0.2);

  // ---- カード 104 枚（平面メッシュ） ----
  const cards = [];
  for (let id = 0; id < 104; id++) {
    const mesh = BABYLON.MeshBuilder.CreatePlane("card" + id, { width: CARD_W, height: CARD_H }, scene);
    mesh.isPickable = false; mesh.alwaysSelectAsActiveMesh = true;
    const shade = BABYLON.MeshBuilder.CreatePlane("shade" + id, { width: CARD_W, height: CARD_H }, scene);
    shade.parent = mesh; shade.position.z = -0.002; shade.material = shadeMat; shade.isPickable = false; shade.isVisible = false;
    const hl = BABYLON.MeshBuilder.CreatePlane("hl" + id, { width: CARD_W, height: CARD_H }, scene);
    hl.parent = mesh; hl.position.z = -0.003; hl.material = hlMat; hl.isPickable = false; hl.isVisible = false;
    const hint = BABYLON.MeshBuilder.CreatePlane("hint" + id, { width: CARD_W, height: CARD_H }, scene);
    hint.parent = mesh; hint.position.z = -0.004; hint.material = hintSrcMat; hint.isPickable = false; hint.isVisible = false;
    mesh.position.set(LY.top.stock.x, LY.top.stock.y, 0); mesh.scaling.set(LY.top.s, LY.top.s, 1);
    const c = { id, mesh, shade, hl, hint, x: LY.top.stock.x, y: LY.top.stock.y, z: 0, s: LY.top.s, flipX: 1, shownUp: false, anim: null, flip: null, dragging: false };
    mesh.material = getBackMat();
    cards.push(c);
  }
  // 動かし先が空の列のとき、その列の枠を光らせるための平面
  const hintSlots = [];
  for (let i = 0; i < 10; i++) {
    const s = BABYLON.MeshBuilder.CreatePlane("hintSlot" + i, { width: CARD_W, height: CARD_H }, scene);
    s.position.set(LY.cols[i].x, LY.cols[i].y0, 0.5); s.material = hintDstMat; s.isPickable = false; s.isVisible = false;
    hintSlots.push(s);
  }
  function applyCardMaterial(c) {
    c.mesh.material = c.shownUp && DECK ? getFaceMat(DECK.suit[c.id], DECK.rank[c.id]) : getBackMat();
  }

  // ---- 配置の計算（論理状態 → 各カードの座標） ----
  function layoutOf(st) {
    const pos = new Array(104), colP = [];   // colP[列][k] = そのカードの中心 { x, y }（当たり判定に使う）
    for (let ci = 0; ci < 10; ci++) {
      const col = st.cols[ci], n = col.length, C = LY.cols[ci], H = !!C.horiz;
      let nUp = 0, nDown = 0;
      for (let k = 0; k < n - 1; k++) { if (st.up[col[k]]) nUp++; else nDown++; }
      // 縦向きの列は下へ、10 段配置の段は右へ重ねる。長いときは縮め、短いときは広げる
      const { face, down } = H ? columnOffsets(nUp, nDown, C.xMax - C.x, CARD_W, ROW_OFF()) : columnOffsets(nUp, nDown, C.y0 - C.yMin, CARD_H, COL_OFF());
      let x = C.x, y = C.y0; const ps = [];
      for (let k = 0; k < n; k++) {
        ps.push({ x, y }); pos[col[k]] = { x, y, z: (H ? -ROW_Z * ci : 0) - 0.01 * k, s: 1 };   // 10 段配置は、下の段ほど手前
        const off = st.up[col[k]] ? face : down;
        if (H) x += off; else y -= off;
      }
      colP.push(ps);
    }
    const T = LY.top;
    st.found.forEach((run, i) => run.forEach((id, j) => { pos[id] = { x: T.found[i].x, y: T.found[i].y, z: -0.01 * j, s: T.s, found: true, j }; }));
    st.stock.forEach((id, i) => { pos[id] = { x: T.stock.x, y: T.stock.y, z: 0.002 * i, s: T.s }; });
    return { pos, colP };
  }

  // ---- 論理状態に表示を同期する（差分をアニメーションにする） ----
  function sync(opt) {
    opt = opt || {};
    const st = G.state, L = layoutOf(st); G.layout = L;
    const t = performance.now(); let end = t;
    for (let id = 0; id < 104; id++) {
      const c = cards[id], p = L.pos[id];
      c.dragging = false;
      const wantUp = !!st.up[id];
      if (opt.instant) {
        c.anim = null; c.flip = null; c.x = p.x; c.y = p.y; c.z = p.z; c.s = p.s; c.flipX = 1;
        c.mesh.position.set(p.x, p.y, p.z); c.mesh.scaling.set(p.s, p.s, 1); c.shownUp = wantUp; applyCardMaterial(c);
        continue;
      }
      const delay = (opt.delay && opt.delay[id] !== undefined) ? opt.delay[id] : (p.found ? FOUND_DELAY + p.j * 25 : 0);
      const moved = Math.abs(c.x - p.x) > 1e-4 || Math.abs(c.y - p.y) > 1e-4 || Math.abs(c.s - p.s) > 1e-4;
      if (moved) {
        c.anim = { t0: t + delay, dur: MOVE_DUR, fx: c.x, fy: c.y, fz: c.z, fs: c.s, tx: p.x, ty: p.y, tz: p.z, ts: p.s };
        end = Math.max(end, t + delay + MOVE_DUR);
      } else if (Math.abs(c.z - p.z) > 1e-6) {
        c.z = p.z; c.mesh.position.z = p.z; if (c.anim) c.anim.tz = p.z;
      }
      if (wantUp !== c.shownUp || (c.flip && c.flip.toUp !== wantUp)) {
        const fd = delay + (moved ? MOVE_DUR * 0.7 : 0);
        c.flip = { t0: t + fd, dur: FLIP_DUR, toUp: wantUp };
        end = Math.max(end, t + fd + FLIP_DUR);
      }
    }
    G.busyUntil = end + 20;
    updateOverlays();
  }

  // グレー表示（14.1）と選択中のハイライト
  function updateOverlays() {
    for (const c of cards) { c.shade.isVisible = false; c.hl.isVisible = false; c.hint.isVisible = false; }
    for (const s of hintSlots) s.isVisible = false;
    const st = G.state; if (!st) return;
    if (G.hint && G.status === "playing") {   // ヒント: 動かすカードを水色、動かし先を黄緑で光らせる
      const m = G.hint.move;
      if (m.t === "d") { if (st.stock.length) { const h = cards[st.stock[0]].hint; h.material = hintSrcMat; h.isVisible = true; } }
      else {
        const src = st.cols[m.from];
        for (let k = m.k; k < src.length; k++) { const h = cards[src[k]].hint; h.material = hintSrcMat; h.isVisible = true; }
        const dst = st.cols[m.to];
        if (dst.length) { const h = cards[dst[dst.length - 1]].hint; h.material = hintDstMat; h.isVisible = true; }
        else hintSlots[m.to].isVisible = true;
      }
    }
    if (G.grayMode && G.status === "playing") {
      const tops = st.cols.map((col) => col.length ? DECK.rank[col[col.length - 1]] : 0);
      for (let ci = 0; ci < 10; ci++) {
        const col = st.cols[ci], rs = runStart(st, ci);
        for (let k = 0; k < col.length; k++) {
          const id = col[k];
          if (!st.up[id]) continue;                         // 裏向きカードは対象外
          let movable = k >= rs;
          if (movable) { const r = DECK.rank[id]; movable = st.cols.some((t, j) => j !== ci && (t.length === 0 || tops[j] === r + 1)); }
          if (!movable) cards[id].shade.isVisible = true;
        }
      }
    }
    if (G.selected) {
      const col = st.cols[G.selected.col];
      for (let k = G.selected.k; k < col.length; k++) cards[col[k]].hl.isVisible = true;
    }
  }

  // ---- 毎フレームのアニメーション更新 ----
  scene.onBeforeRenderObservable.add(() => {
    const t = performance.now();
    for (const c of cards) {
      if (c.dragging) continue;
      const a = c.anim;
      if (a) {
        const p = (t - a.t0) / a.dur;
        if (p >= 0) {
          if (p >= 1) { c.x = a.tx; c.y = a.ty; c.z = a.tz; c.s = a.ts; c.anim = null; }
          else {
            const e = 1 - Math.pow(1 - p, 3);
            c.x = a.fx + (a.tx - a.fx) * e; c.y = a.fy + (a.ty - a.fy) * e; c.s = a.fs + (a.ts - a.fs) * e; c.z = a.tz - FLY_Z;
          }
          c.mesh.position.set(c.x, c.y, c.z);
        }
      }
      const f = c.flip;
      if (f) {
        const p = (t - f.t0) / f.dur;
        if (p >= 0) {
          if (p >= 1) { if (c.shownUp !== f.toUp) { c.shownUp = f.toUp; applyCardMaterial(c); } c.flipX = 1; c.flip = null; }
          else {
            if (p >= 0.5 && c.shownUp !== f.toUp) { c.shownUp = f.toUp; applyCardMaterial(c); }
            c.flipX = Math.max(0.03, Math.abs(1 - 2 * p));
          }
        }
      }
      c.mesh.scaling.set(c.s * c.flipX, c.s, 1);   // 縮尺（山札・組札は 2 段配置で小さい）× めくりの横幅
    }
  });

  // =====================================================================
  // GUI（下部の操作パネル・メッセージ）
  // =====================================================================
  const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, scene);
  const hud = new GUI.Rectangle("hud");
  hud.width = "100%"; hud.height = HUD_H + "px"; hud.thickness = 0; hud.background = "#0b1f16";
  hud.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; hud.isPointerBlocker = true;
  ui.addControl(hud);
  const hudText = new GUI.TextBlock("hudText", "");
  hudText.color = "#d8f3e4"; hudText.fontSize = 14; hudText.width = "100%"; hudText.height = "20px";
  hudText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP; hudText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  hudText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT; hudText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  hudText.textWrapping = true; hudText.paddingLeft = "8px"; hudText.paddingRight = "8px";
  hudText.isHitTestVisible = false;
  hud.addControl(hudText);
  let hudNarrow = false;                       // 幅が狭い・高さが低い画面（縦長・スマホ）か。ボタンを小さく・幅を詰める
  let hudCompact = false;                      // 状態の文字が 1 行に収まらないとき true（短い表記にする。クリア可能度は、上のグラフバーに出ている）
  const hudItems = [];                         // 操作パネルのボタン: { ctl, w（通常の幅 px）, n（狭い画面での幅 px）, wideOnly }
  // 操作パネルの高さ（px）を、キャンバスの CSS px に直す（描画解像度とキャンバスの表示サイズが違う場合のため）
  const hudCss = () => HUD_H * canvasEl.getBoundingClientRect().height / engine.getRenderHeight();

  // ---- クリア可能度のグラフバー ----
  const clearBar = new GUI.Rectangle("clearBar");
  clearBar.width = "96%"; clearBar.height = "18px"; clearBar.thickness = 1; clearBar.color = "#6b8f7c";
  clearBar.background = "#07140e"; clearBar.cornerRadius = 4; clearBar.isHitTestVisible = false;
  clearBar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP; clearBar.top = "50px";
  hud.addControl(clearBar);
  const barFill = new GUI.Rectangle("clearFill");
  barFill.width = "0px"; barFill.height = "100%"; barFill.thickness = 0; barFill.cornerRadius = 3; barFill.background = "#888888";
  barFill.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT; barFill.isHitTestVisible = false;
  clearBar.addControl(barFill);
  [25, 50, 75].forEach((pc) => {     // 目盛り（25 / 50 / 75）
    const tick = new GUI.Rectangle("tick" + pc);
    tick.width = "1px"; tick.height = "100%"; tick.thickness = 0; tick.background = "rgba(255,255,255,0.35)";
    tick.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT; tick.left = pc + "%"; tick.isHitTestVisible = false;
    clearBar.addControl(tick);
  });
  const barText = new GUI.TextBlock("clearBarText", "");
  barText.color = "white"; barText.fontSize = 12; barText.outlineWidth = 3; barText.outlineColor = "black"; barText.isHitTestVisible = false;
  clearBar.addControl(barText);
  let barCur = 0;                    // バーの表示中の値（目標値へなめらかに近づける）
  // クリア可能度の更新（文字表示とバーの両方）
  //   kind: "value"（value = 0～100）/ "unknown" / "pending"（判定中）/ "none"
  function setClear(kind, value, text, label) {
    if (G.clear.kind !== "value") barCur = 0;
    G.clear = { kind, value, label: label || "" };
    G.clearability = text;
    barText.text = label || "";
  }
  function barColor(v) {             // 0: 赤 → 50: 黄 → 100: 緑
    const r = v < 50 ? 220 : Math.round(220 - (v - 50) * 3.6);
    const g = v < 50 ? Math.round(60 + v * 3.2) : 220;
    return "rgb(" + r + "," + g + ",60)";
  }
  function updateBar(t) {
    const c = G.clear;
    if (c.kind === "pending") {      // 判定中: 帯が左右に動く
      barFill.background = "#5b8db8"; barFill.width = "30%";
      barFill.left = ((Math.sin(t / 350) + 1) / 2 * 70).toFixed(1) + "%";
    } else if (c.kind === "unknown") { // 不明: 灰色で全体を塗る
      barFill.background = "#6f6f6f"; barFill.width = "100%"; barFill.left = "0px";
    } else if (c.kind === "value") {
      barCur += (c.value - barCur) * 0.15;
      if (Math.abs(c.value - barCur) < 0.2) barCur = c.value;
      barFill.width = barCur.toFixed(1) + "%"; barFill.left = "0px"; barFill.background = barColor(barCur);
    } else { barFill.width = "0px"; barFill.left = "0px"; }
  }
  scene.onBeforeRenderObservable.add(() => updateBar(performance.now()));
  const overlay = new GUI.TextBlock("overlay", "");
  overlay.color = "white"; overlay.fontSize = 34; overlay.outlineWidth = 6; overlay.outlineColor = "black";
  overlay.textWrapping = true; overlay.isHitTestVisible = false; overlay.top = "-40px";
  ui.addControl(overlay);
  const toast = new GUI.TextBlock("toast", "");   // 操作パネルの上に出す、短いお知らせ
  toast.color = "white"; toast.fontSize = 16; toast.outlineWidth = 4; toast.outlineColor = "black"; toast.height = "30px";
  toast.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  toast.isHitTestVisible = false; toast.isVisible = false;
  ui.addControl(toast);
  let toastTimer = null;
  const hideToast = () => { toast.isVisible = false; };
  const showToast = (text, ms) => { toast.text = text; toast.isVisible = true; clearTimeout(toastTimer); if (ms > 0) toastTimer = setTimeout(hideToast, ms); };
  const showOverlay = (text) => { overlay.text = text; overlay.isVisible = true; };
  const hideOverlay = () => { overlay.text = ""; overlay.isVisible = false; };

  // ボタンを操作パネルに追加する。位置と大きさは、layoutHud() が画面の幅に合わせて決める
  function addButton(label, width, onClick, opt) {
    opt = opt || {};
    const b = GUI.Button.CreateSimpleButton("btn_" + label, label);
    b.color = "white"; b.background = opt.bg || "#2f6f4f"; b.cornerRadius = 6; b.thickness = 1;
    b.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT; b.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    b.onPointerUpObservable.add(onClick);
    hud.addControl(b);
    hudItems.push({ ctl: b, w: width, n: opt.n || Math.round(width * 0.85), wideOnly: !!opt.wideOnly });
    return b;
  }
  const setLabel = (b, text) => { if (b.textBlock) b.textBlock.text = text; };
  addButton("EASY", 56, () => startNewGame("EASY"), { n: 46 });
  addButton("NORMAL", 72, () => startNewGame("NORMAL"), { n: 62 });
  addButton("HARD", 56, () => startNewGame("HARD"), { n: 46 });
  const grayBtn = addButton("移動可否: OFF", 104, () => { G.grayMode = !G.grayMode; setLabel(grayBtn, "移動可否: " + (G.grayMode ? "ON" : "OFF")); updateOverlays(); }, { n: 96 });
  const MODE_LABEL = { SOLVER: "ソルバー", MONTE_CARLO: "モンテカルロ" };
  const modeBtn = addButton("判定: " + MODE_LABEL[G.analysisMode], 136, () => {
    G.analysisMode = G.analysisMode === "SOLVER" ? "MONTE_CARLO" : "SOLVER";
    setLabel(modeBtn, "判定: " + MODE_LABEL[G.analysisMode]);
    if (G.status === "playing") startAnalysis();   // 方式を切り替えたら、すぐに判定し直す
    updateHud();
  }, { n: 120 });
  let designLoading = false;
  const designBtn = addButton("絵柄: " + DESIGNS[0].name, 124, () => {
    if (designLoading) return;
    let next = (G.design + 1) % DESIGNS.length;
    while (DESIGNS[next].failed && next !== G.design) next = (next + 1) % DESIGNS.length;   // 読み込みに失敗した絵柄は飛ばす
    const d = DESIGNS[next];
    const apply = () => {
      G.design = next; setLabel(designBtn, "絵柄: " + d.name);
      disposeMaterials();
      for (const c of cards) applyCardMaterial(c);
    };
    if (d.type !== "image" || d.images) { apply(); return; }
    designLoading = true; showToast("画像を読み込み中…（" + d.name + "）", 0);
    ensureDesignReady(d).then((ok) => {
      designLoading = false;
      if (scene.isDisposed) return;
      if (ok) { hideToast(); apply(); }
      else showToast("画像の読み込みに失敗しました（" + d.name + "）。URL と CORS の設定を確認してください。この絵柄は飛ばします", 5000);
    });
  }, { n: 114 });
  // addButton("中断", 52, () => {
  //   if (G.status !== "playing") return;
  //   G.status = "over"; G.analysisId++; G.selected = null; updateOverlays();
  //   showOverlay("ゲームオーバー（中断）"); updateHud();
  // });
  const LAYOUT_LABEL = { AUTO: "自動", SINGLE: "10列", DUAL: "2段", ROWS: "10段" };
  const layoutBtn = addButton("配置", 124, () => {   // 自動 → 10列 → 2段 → 10段 の順に切り替える
    const order = ["AUTO", "SINGLE", "DUAL", "ROWS"];
    G.layoutMode = order[(order.indexOf(G.layoutMode) + 1) % order.length];
    view.zoom = ZOOM_FIT; view.panX = 0; view.panY = 0;
    onResize(true);   // カードが新しい位置へ動く
  }, { n: 104 });
  const hintBtn = addButton("ヒント", 64, () => doHint(), { n: 54 });
  const undoBtn = addButton("UNDO", 120, () => doUndo(), { n: 50 });
  // ズーム操作（ホイール・ピンチ・キーでも操作できる）。＋－は、スマホではピンチで足りるので、幅の狭い画面では出さない
  addButton("＋", 40, () => zoomCenter(CONFIG.VIEW.BUTTON_STEP), { bg: "#245c40", wideOnly: true });
  addButton("－", 40, () => zoomCenter(1 / CONFIG.VIEW.BUTTON_STEP), { bg: "#245c40", wideOnly: true });
  addButton("全体", 54, () => fitAll(), { bg: "#245c40", n: 46 });

  const STATUS_TEXT = { generating: "配置を生成中", playing: "プレイ中", cleared: "クリア！", over: "ゲームオーバー", failed: "生成失敗" };
  function updateHud() {
    const st = G.state, live = st && G.status !== "generating" && G.status !== "failed", zoomPc = Math.round(view.zoom * 100);
    let parts;
    if (hudCompact) {
      parts = [G.level, STATUS_TEXT[G.status]];
      if (zoomPc !== 100) parts.push("ズーム " + zoomPc + "%");
      if (live) parts.push("山札 あと" + Math.floor(st.stock.length / 10) + "回", "組札 " + st.found.length + "/8");
    } else {
      parts = ["難易度: " + G.level, "状態: " + STATUS_TEXT[G.status], "ズーム: " + zoomPc + "%"];
      if (live) parts.push("山札: あと" + Math.floor(st.stock.length / 10) + "回", "組札: " + st.found.length + "/8", "クリア可能度[" + MODE_LABEL[G.analysisMode] + "]: " + G.clearability);
    }
    hudText.text = parts.join(hudCompact ? "  |  " : "   |   ");
    const canUndo = G.status === "playing" && !!G.undo;
    undoBtn.isEnabled = canUndo; undoBtn.alpha = canUndo ? 1 : 0.5;
    const canHint = G.status === "playing" && CONFIG.HINT_LEVELS.includes(G.level);
    hintBtn.isEnabled = canHint; hintBtn.alpha = canHint ? 1 : 0.5;
  }

  // 操作パネルの配置: ボタンを、画面の幅に収まる最小の段数に分けて並べ（段ごとに幅をそろえる）、その下にグラフバーと文字を置く。
  // パネルの高さ（HUD_H）はここで決まる。
  function layoutHud() {
    const W = Math.max(200, engine.getRenderWidth()), short = engine.getRenderHeight() < 520;
    hudNarrow = W < 640 || short;
    const gap = short ? 3 : 4, padX = 4, usable = W - padX * 2, bh = short ? 26 : hudNarrow ? 30 : 34, fs = hudNarrow ? 12 : 14;
    const items = hudItems.filter((it) => { const show = !(hudNarrow && it.wideOnly); it.ctl.isVisible = show; return show; });
    items.forEach((it) => { it.cw = hudNarrow ? it.n : it.w; });
    const split = (limit) => {   // 1 段の幅が limit 以下になるように、順に詰めて段に分ける
      const rows = [[]]; let cur = 0;
      for (const it of items) {
        const w = it.cw + gap;
        if (rows[rows.length - 1].length && cur + w > limit + gap) { rows.push([]); cur = 0; }
        rows[rows.length - 1].push(it); cur += w;
      }
      return rows;
    };
    const nRows = split(usable).length;
    let lo = Math.max(...items.map((it) => it.cw)), hi = usable;   // その段数のまま、段の幅がなるべくそろう上限を探す
    for (let k = 0; k < 14; k++) { const mid = (lo + hi) / 2; if (split(mid).length <= nRows) hi = mid; else lo = mid; }
    const rows = split(hi);
    let y = 4;
    for (const row of rows) {
      const sum = row.reduce((s, it) => s + it.cw, 0), avail = usable - gap * (row.length - 1);
      const f = Math.max(0.6, Math.min(1.35, avail / sum));        // 余裕があれば少し広げ、足りなければ少し縮める
      const rowW = sum * f + gap * (row.length - 1);
      let x = padX + Math.max(0, (usable - rowW) / 2);
      for (const it of row) {
        const w = Math.floor(it.cw * f), b = it.ctl;
        b.width = w + "px"; b.height = bh + "px"; b.left = x + "px"; b.top = y + "px"; b.fontSize = fs;
        x += w + gap;
      }
      y += bh + gap;
    }
    const barH = short ? 13 : 16;
    clearBar.height = barH + "px"; clearBar.top = y + "px"; y += barH + 4;
    // 状態の文字: 最も長くなる場合の幅を測って、1 行に収まらなければ短い表記にし、必要な行数を決める
    if (!layoutHud.mc) layoutHud.mc = document.createElement("canvas").getContext("2d");
    layoutHud.mc.font = fs + "px Arial, sans-serif";
    const textW = (s) => layoutHud.mc.measureText(s).width * 1.1 + 24;   // 余白と、フォントの違いへの余裕を含む
    const FULL = "難易度: NORMAL   |   状態: ゲームオーバー   |   ズーム: 100%   |   山札: あと5回   |   組札: 8/8   |   クリア可能度[モンテカルロ]: 100（生成時に検証済み）";
    const SHORT = "NORMAL  |  ゲームオーバー  |  ズーム 100%  |  山札 あと5回  |  組札 8/8";
    hudCompact = textW(FULL) > W;
    const lines = Math.min(3, Math.max(1, Math.ceil(textW(hudCompact ? SHORT : FULL) / W))), th = lines * (fs + 4);
    hudText.fontSize = fs; hudText.height = th + "px"; hudText.top = y + "px"; y += th + 4;
    HUD_H = Math.round(y);
    hud.height = HUD_H + "px";
    toast.top = "-" + (HUD_H + 10) + "px";
  }

  // ウィンドウの大きさが変わったとき（と「配置」ボタンを押したとき）に、操作パネル・レイアウト・カメラ・カードの位置を作り直す
  function onResize(animate) {
    layoutHud();
    computeLayout();
    placeSlots();
    setLabel(layoutBtn, "配置: " + LAYOUT_LABEL[G.layoutMode] + (G.layoutMode === "AUTO" ? "(" + LAYOUT_LABEL[LY.mode] + ")" : ""));
    updateCamera();
    updateHud();
    if (G.state) sync(animate === true ? undefined : { instant: true });
    else for (const c of cards) {   // 配置の生成中: 全カードが山札の位置にある
      c.anim = null; c.x = LY.top.stock.x; c.y = LY.top.stock.y; c.s = LY.top.s; c.flipX = 1;
      c.mesh.position.set(c.x, c.y, c.z); c.mesh.scaling.set(c.s, c.s, 1);
    }
  }

  // =====================================================================
  // ゲームの進行
  // =====================================================================
  // generator を、描画を止めないように少しずつ進める
  function runGen(gen, isCancelled, onDone) {
    function step() {
      if (isCancelled()) return;
      const t0 = performance.now();
      while (performance.now() - t0 < 6) {
        const r = gen.next();
        if (r.done) { onDone(r.value); return; }
      }
      setTimeout(step, 0);
    }
    step();
  }

  // クリア保証配置の生成（4.5）: 検証済みの配置だけを採用する
  function startNewGame(level) {
    const token = ++G.genToken; G.analysisId++; G.hintId++;
    G.level = level; G.status = "generating"; G.state = null; G.undo = null; G.selected = null; G.hint = null; G.hintPlan = null; setClear("none", 0, "-", "");
    for (const c of cards) { c.dragging = false; c.shade.isVisible = false; c.hl.isVisible = false; c.hint.isVisible = false; }
    for (const s of hintSlots) s.isVisible = false;
    updateHud();
    const seedBase = (CONFIG.SEED !== null && CONFIG.SEED !== undefined) ? CONFIG.SEED : (Date.now() & 0x7fffffff);
    const cfg = CONFIG.GEN[level], max = CONFIG.GEN.maxAttempts;
    const easyCfg = CONFIG.EASY_DEAL ? CONFIG.EASY_DEAL[level] : null;   // 易しい配置の選別（なければ null）
    const tStart = performance.now();
    let attempt = 0, easyTries = 0;
    showOverlay("配置を生成中…");
    function tryOne() {
      if (token !== G.genToken) return;
      // 易しい配置を探す間（relaxAfterMs まで）は、探索量の上限つきで試す。見つからなければ、通常の条件に切り替える
      const easyPhase = !!easyCfg && performance.now() - tStart < easyCfg.relaxAfterMs;
      if (!easyPhase && attempt >= max) {
        G.status = "failed";
        showOverlay("クリア保証配置の生成に失敗しました\n上のボタンで再試行してください");
        updateHud(); return;
      }
      if (easyPhase) {
        easyTries++;
        showOverlay("易しい配置を探しています…  試行 " + easyTries + "（" + Math.round((performance.now() - tStart) / 1000) + " 秒）\n（" + level + "）");
      } else {
        attempt++;
        showOverlay("配置を生成中…  試行 " + attempt + " / " + max + (easyCfg ? "\n（易しい配置が見つからなかったため、通常の条件で探索）" : "") + "\n（" + level + "）");
      }
      const rng = mulberry32(seedBase + (easyTries + attempt) * 7919);
      const deck = makeDeck(level, rng); DECK = deck;
      const st = newState(rng);
      const opt = easyPhase
        ? { timeMs: cfg.timeMs, runNodes: easyCfg.runNodes, maxTotalNodes: easyCfg.maxNodes, noise: 60, rng: mulberry32((easyTries + attempt) * 31 + 1) }
        : { timeMs: cfg.timeMs, runNodes: cfg.runNodes, noise: 60, rng: mulberry32((easyTries + attempt) * 31 + 1) };
      const gen = solveRestartGen(st, opt);
      runGen(gen, () => token !== G.genToken, (res) => {
        if (res.result === "solved" && replayClears(st, res.moves)) beginGame(level, deck, st, { easyCfg, easy: easyPhase, nodes: res.nodes, moves: res.moves });
        else setTimeout(tryOne, 0);
      });
    }
    setTimeout(tryOne, 30);
  }

  function beginGame(level, deck, st, info) {
    DECK = deck; G.state = st; G.undo = null; G.selected = null; G.status = "playing"; G.hint = null;
    // 生成時に見つかった解の手順を、ヒントの元にする（プレイヤーが同じ手を指す間は、計算せずに次の手を示せる）
    G.hintPlan = (info && info.moves && CONFIG.HINT_LEVELS.includes(level)) ? { moves: info.moves, i: 0 } : null;
    setClear("value", 100, "100（生成時に検証済み）", "100  生成時に検証済み");
    hideOverlay();
    // 全カードを山札の位置に集め、配る演出をする
    const L = layoutOf(st), inStock = new Set(st.stock);
    for (const c of cards) {
      c.anim = null; c.flip = null; c.dragging = false; c.flipX = 1; c.shownUp = false; applyCardMaterial(c);
      const p = inStock.has(c.id) ? L.pos[c.id] : { x: LY.top.stock.x, y: LY.top.stock.y, z: -0.5, s: LY.top.s };
      c.x = p.x; c.y = p.y; c.z = p.z; c.s = p.s; c.mesh.position.set(p.x, p.y, p.z); c.mesh.scaling.set(p.s, p.s, 1);
    }
    const delay = {};
    for (let ci = 0; ci < 10; ci++) st.cols[ci].forEach((id, k) => { delay[id] = (k * 10 + ci) * 16; });
    sync({ delay });
    updateHud();
    if (info && info.easyCfg) {   // どちらの条件で選んだ配置かを、短く知らせる
      showToast(info.easy ? "易しめの配置です（解の探索量: " + info.nodes + "）" : "易しい配置が見つからなかったため、通常の条件の配置です", 4500);
    }
  }

  // 操作（カード移動 / 山札から配る）を実行する
  function doAction(m) {
    if (G.status !== "playing" || isBusy()) return false;
    const st = G.state;
    if (m.t === "d" && !canDeal(st)) return false;
    if (m.t === "m" && !canDrop(st, m.from, m.k, m.to)) { sync(); return false; } // 無効な操作: 状態は変えず、元の位置へ戻す
    const before = cloneState(st);
    let delay;
    if (m.t === "d") { const dealt = applyDeal(st); delay = {}; dealt.forEach((id, i) => { delay[id] = i * 70; }); }
    else applyMove(st, m.from, m.k, m.to);
    G.undo = before; G.selected = null; G.hint = null; G.hintId++;
    const plan = G.hintPlan;   // 解の手順どおりに指したときだけ、手順を先へ進める。違う手なら捨てる
    if (plan) {
      const e = plan.moves[plan.i];
      if (e && e.t === m.t && (m.t === "d" || (e.from === m.from && e.k === m.k && e.to === m.to))) plan.i++; else G.hintPlan = null;
    }
    sync({ delay });
    afterOperation();
    return true;
  }

  // ---- ヒント（次の一手を示す） ----
  const validMove = (st, m) => (m.t === "d" ? canDeal(st) : canDrop(st, m.from, m.k, m.to));
  function showHint(m) {
    G.hint = { move: m }; updateOverlays();
    const st = G.state;
    if (m.t === "d") { showToast("ヒント: 山札から配る", 8000); return; }
    const col = st.cols[m.from], head = col[m.k], n = col.length - m.k;
    const label = SUIT_SYMBOLS[DECK.suit[head]] + RANK_LABELS[DECK.rank[head]];
    const dest = st.cols[m.to].length ? "第" + (m.to + 1) + "列" : "空の第" + (m.to + 1) + "列";
    showToast("ヒント: 第" + (m.from + 1) + "列の「" + label + "」" + (n > 1 ? "から" + n + "枚" : "") + " → " + dest, 8000);
  }
  function doHint() {
    if (G.status !== "playing" || isBusy()) return;
    if (!CONFIG.HINT_LEVELS.includes(G.level)) { showToast("このレベルではヒントを使えません", 2500); return; }
    const st = G.state, plan = G.hintPlan;
    // 1) 以前に求めた手順が今の状態でも続いているなら、その次の手を使う（計算しない）
    if (plan && plan.i < plan.moves.length && validMove(st, plan.moves[plan.i])) { showHint(plan.moves[plan.i]); return; }
    G.hintPlan = null;
    // 2) ソルバーで、今の状態からの手順を求める
    const myId = ++G.hintId;
    showToast("ヒントを計算中…", 0);
    const gen = solveRestartGen(cloneState(st), { timeMs: CONFIG.HINT_TIME_MS, runNodes: 20000, noise: 60, rng: Math.random });
    runGen(gen, () => myId !== G.hintId, (res) => {
      if (myId !== G.hintId) return;   // 計算中に操作された
      if (res.result === "solved" && res.moves.length) { G.hintPlan = { moves: res.moves, i: 0 }; showHint(res.moves[0]); }
      else showToast("ヒントを見つけられませんでした（解が見つからない状態か、時間切れです）", 4500);
    });
  }

  function doUndo() {
    if (G.status !== "playing" || isBusy() || !G.undo) return;
    G.state = G.undo; G.undo = null; G.selected = null; G.hint = null; G.hintId++; G.hintPlan = null;
    sync();
    startAnalysis(); updateHud();
  }

  function afterOperation() {
    const st = G.state;
    if (isClear(st)) {
      G.status = "cleared"; G.analysisId++; setClear("value", 100, "100（クリア済み）", "クリア！");
      setTimeout(() => { if (G.status === "cleared") showOverlay("🎉 ゲームクリア！"); }, 900);
      updateHud(); return;
    }
    if (st.stock.length === 0 && listMoves(st, false).length === 0) {
      G.status = "over"; G.analysisId++; setClear("value", 0, "0（解けません）", "0  有効な移動なし");
      setTimeout(() => { if (G.status === "over") showOverlay("ゲームオーバー\n（有効な移動がありません）"); }, 500);
      updateHud(); return;
    }
    startAnalysis(); updateHud();
  }

  // リアルタイムのクリア可能度（14.3）。方式は G.analysisMode で切り替える。
  //   SOLVER      : 100（解ける）/ 0（解けない）/ unknown。0 は山札が空のときだけ確定できる
  //   MONTE_CARLO : プレイアウトで「クリアできた割合 × 100」を推定する（0 でも「解けない」の証明ではない）
  function startAnalysis() {
    const myId = ++G.analysisId;
    const st = cloneState(G.state);
    const cancelled = () => myId !== G.analysisId;
    setClear("pending", 0, "判定中…", "判定中…"); updateHud();
    if (G.analysisMode === "MONTE_CARLO") {
      const mc = CONFIG.MC;
      const gen = monteCarloGen(st, { trials: mc.trials, nodeBudget: mc.nodeBudget, noise: mc.noise, timeMs: mc.timeMs, rng: Math.random });
      runGen(gen, cancelled, (r) => {
        if (cancelled()) return;
        if (r.trials === 0) setClear("unknown", 0, "unknown（判定不能）", "unknown（判定不能）");
        else {
          const pct = Math.round(r.wins * 100 / r.trials);
          setClear("value", pct, pct + "（" + r.wins + "/" + r.trials + " 回クリア・推定）", pct + "%  （" + r.wins + "/" + r.trials + " 回クリア・推定）");
        }
        updateHud();
      });
      return;
    }
    const gen1 = solveRestartGen(st, { timeMs: CONFIG.ANALYSIS_TIME_MS, runNodes: 20000, noise: 60, rng: Math.random });
    runGen(gen1, cancelled, (r1) => {
      if (cancelled()) return;
      if (r1.result === "solved") { setClear("value", 100, "100（解けます）", "100  解けます"); if (r1.moves.length && !G.hintPlan && CONFIG.HINT_LEVELS.includes(G.level)) G.hintPlan = { moves: r1.moves, i: 0 }; updateHud(); return; }
      if (st.stock.length > 0) { setClear("unknown", 0, "unknown（判定不能）", "unknown（判定不能）"); updateHud(); return; }
      // 山札が空なら、枝刈りなしの探索で「解けない」の確定を試みる
      const gen2 = solveGen(st, { nodeLimit: 300000, timeMs: CONFIG.ANALYSIS_TIME_MS, prune: false });
      runGen(gen2, cancelled, (r2) => {
        if (cancelled()) return;
        if (r2.result === "solved") { setClear("value", 100, "100（解けます）", "100  解けます"); if (r2.moves.length && !G.hintPlan && CONFIG.HINT_LEVELS.includes(G.level)) G.hintPlan = { moves: r2.moves, i: 0 }; }
        else if (r2.result === "exhausted") {
          setClear("value", 0, "0（解けません）", "0  解けません"); G.status = "over"; G.selected = null; updateOverlays();
          showOverlay("ゲームオーバー\n（クリア不能が確定しました）");
        } else setClear("unknown", 0, "unknown（判定不能）", "unknown（判定不能）");
        updateHud();
      });
    });
  }

  // =====================================================================
  // 入力（マウス・タッチ共通）
  // =====================================================================
  function toWorld(ev) {
    const r = canvasEl.getBoundingClientRect();
    const px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
    return {
      x: camera.orthoLeft + px * (camera.orthoRight - camera.orthoLeft),
      y: camera.orthoTop - py * (camera.orthoTop - camera.orthoBottom),
    };
  }
  function hitCard(w) {
    const st = G.state; if (!st || !G.layout) return null;
    // 10 段配置は、下の段が手前に重なるので、下の段から調べる
    for (let n = 0; n < 10; n++) {
      const ci = LY.mode === "ROWS" ? 9 - n : n, ps = G.layout.colP[ci];
      for (let k = st.cols[ci].length - 1; k >= 0; k--) if (Math.abs(w.x - ps[k].x) <= CARD_W / 2 && Math.abs(w.y - ps[k].y) <= CARD_H / 2) return { col: ci, k };
    }
    return null;
  }
  const hitStock = (w) => {   // 山札: 2 段配置では小さいので、タップしやすいように判定を少し広げる
    const T = LY.top;
    return Math.abs(w.x - T.stock.x) <= Math.max(CARD_W * T.s / 2, 0.3) && Math.abs(w.y - T.stock.y) <= Math.max(CARD_H * T.s / 2, 0.4);
  };
  function columnAt(w) {   // 場札の列（山札・組札の領域は対象外）。10 段配置は縦の位置で段を、2 段配置は段（上下）→ 列（左右）の順に決める
    if (LY.rows) {
      const ri = Math.floor((LY.rows.yTop - w.y) / LY.rows.rp);
      return ri < 0 || ri > 9 || w.x > LY.rows.stripX ? -1 : ri;
    }
    if (w.y > LY.tabTop) return -1;
    const per = LY.dual ? 5 : 10, j = Math.floor((w.x - LY.xLeft) / LY.pitch);
    if (j < 0 || j >= per) return -1;
    return (LY.dual && w.y <= LY.midY ? 5 : 0) + j;
  }

  function onGameDown(ev) {
    G.pointer = null;
    if (G.status !== "playing" || isBusy()) return;
    const w = toWorld(ev), hit = hitCard(w);
    const P = { sx: ev.clientX, sy: ev.clientY, hit, stock: !hit && hitStock(w), dragging: false, items: null };
    if (hit && canPick(G.state, hit.col, hit.k)) {
      P.items = G.state.cols[hit.col].slice(hit.k).map((id) => ({ id, dx: cards[id].x - w.x, dy: cards[id].y - w.y }));
    }
    G.pointer = P;
  }
  function onGameMove(ev) {
    const P = G.pointer; if (!P || !P.items) return;
    const w = toWorld(ev);
    if (!P.dragging) {
      if (Math.hypot(ev.clientX - P.sx, ev.clientY - P.sy) < 8) return;   // 8px 未満はタップ扱い
      P.dragging = true; G.selected = null; updateOverlays();
      P.items.forEach((it, i) => { cards[it.id].dragging = true; cards[it.id].anim = null; cards[it.id].z = DRAG_Z - 0.01 * i; });
    }
    P.items.forEach((it, i) => {
      const c = cards[it.id]; c.x = w.x + it.dx; c.y = w.y + it.dy; c.mesh.position.set(c.x, c.y, DRAG_Z - 0.01 * i);
    });
  }
  function onGameUp(ev) {
    const P = G.pointer; G.pointer = null; if (!P) return;
    const w = toWorld(ev), st = G.state;
    if (P.dragging) {   // ドラッグ＆ドロップ
      for (const it of P.items) cards[it.id].dragging = false;
      const to = columnAt(w);
      if (to >= 0 && canDrop(st, P.hit.col, P.hit.k, to)) doAction({ t: "m", from: P.hit.col, k: P.hit.k, to });
      else sync();   // 無効な操作 → 元の位置へ戻す
      return;
    }
    // タップ
    if (P.stock) { G.selected = null; if (canDeal(st)) doAction({ t: "d" }); else updateOverlays(); return; }
    const colAt = columnAt(w);
    const sel = G.selected;
    if (sel) {
      if (colAt >= 0 && colAt !== sel.col && canDrop(st, sel.col, sel.k, colAt)) { doAction({ t: "m", from: sel.col, k: sel.k, to: colAt }); return; }
      if (P.hit && P.hit.col === sel.col && P.hit.k === sel.k) { G.selected = null; updateOverlays(); return; }
    }
    G.selected = (P.hit && canPick(st, P.hit.col, P.hit.k)) ? { col: P.hit.col, k: P.hit.k } : null;
    updateOverlays();
  }
  // =====================================================================
  // ズーム・パンの操作（カードの操作とは別に先に判定する）
  //   ズーム : マウスホイール / 2 本指のピンチ / ＋－ボタン / キー(+ -)
  //   パン   : 右・中ボタンのドラッグ（どこでも）/ 何もない場所のドラッグ / 2 本指の移動 / 矢印キー
  //   全体表示: 「全体」ボタン / キー 0     初期表示: 「初期」ボタン / キー 1
  // =====================================================================
  const touches = new Map();   // 押下中のポインター: pointerId → { x, y }（画面座標）
  let panDrag = null;          // 右・中ボタンによるパン: { anchor }（つかんだ地点の論理座標）
  let bgPan = null;            // 何もない場所のドラッグ: { sx, sy, anchor, active }
  let pinch = null;            // 2 本指: { d0, zoom0, anchor }
  const noContextMenu = (e) => e.preventDefault();
  canvasEl.addEventListener("contextmenu", noContextMenu);
  scene.onDisposeObservable.add(() => canvasEl.removeEventListener("contextmenu", noContextMenu));

  const clientPt = (x, y) => ({ clientX: x, clientY: y });
  function canvasCenterClient() {   // 操作パネルを除いた表示領域の中心（画面座標）
    const r = canvasEl.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + (r.height - hudCss()) / 2 };
  }
  // 画面上の (cx, cy) の下にある論理座標が動かないように、factor 倍にズームする
  function zoomAt(cx, cy, factor) {
    const w0 = toWorld(clientPt(cx, cy));
    view.zoom *= factor; applyView(true);
    const w1 = toWorld(clientPt(cx, cy));
    view.panX += w0.x - w1.x; view.panY += w0.y - w1.y;
    applyView(); updateHud();
  }
  function zoomCenter(factor) { const c = canvasCenterClient(); zoomAt(c.x, c.y, factor); }
  function fitAll() { view.zoom = ZOOM_FIT; view.panX = 0; view.panY = 0; applyView(); updateHud(); }
  function resetView() { view.zoom = ZOOM_FIT; view.panX = 0; view.panY = 0; applyView(); updateHud(); }
  // つかんだ地点（anchor）が、ポインターの下に来るようにパンする
  function panToAnchor(anchor, ev) {
    const w = toWorld(ev);
    view.panX += anchor.x - w.x; view.panY += anchor.y - w.y;
    applyView();
  }
  const inHud = (ev) => { const r = canvasEl.getBoundingClientRect(); return ev.clientY - r.top > r.height - hudCss(); };

  function startPinch() {
    const P = G.pointer;
    if (P && P.dragging) { for (const it of P.items) cards[it.id].dragging = false; sync(); }   // カードのドラッグは取り消す
    G.pointer = null; bgPan = null; panDrag = null;
    const [a, b] = [...touches.values()];
    pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom0: view.zoom, anchor: toWorld(clientPt((a.x + b.x) / 2, (a.y + b.y) / 2)) };
  }
  function updatePinch() {
    if (!pinch || touches.size < 2) return;
    const [a, b] = [...touches.values()];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    view.zoom = pinch.zoom0 * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d0;
    applyView(true);
    const w = toWorld(clientPt(mx, my));
    view.panX += pinch.anchor.x - w.x; view.panY += pinch.anchor.y - w.y;
    applyView(); updateHud();
  }

  function onDown(ev) {
    touches.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (touches.size >= 2) { startPinch(); return; }
    panDrag = null; bgPan = null; pinch = null;
    if (ev.button === 1 || ev.button === 2) { G.pointer = null; panDrag = { anchor: toWorld(ev) }; return; }
    onGameDown(ev);
    const P = G.pointer;
    // カードを動かせる場所・山札以外（何もない場所など）を押したときは、パンの候補にする
    if (!P || (!P.items && !P.stock)) bgPan = { sx: ev.clientX, sy: ev.clientY, anchor: toWorld(ev), active: false };
  }
  function onMove(ev) {
    const t = touches.get(ev.pointerId);
    if (t) { t.x = ev.clientX; t.y = ev.clientY; }
    if (pinch) { updatePinch(); return; }
    if (panDrag) { panToAnchor(panDrag.anchor, ev); return; }
    if (bgPan) {
      if (!bgPan.active && Math.hypot(ev.clientX - bgPan.sx, ev.clientY - bgPan.sy) >= 8) {   // 8px 未満はタップ扱い
        bgPan.active = true; G.pointer = null; G.selected = null; updateOverlays();
      }
      if (bgPan.active) { panToAnchor(bgPan.anchor, ev); return; }
    }
    onGameMove(ev);
  }
  function onUp(ev) {
    touches.delete(ev.pointerId);
    if (pinch) { if (touches.size < 2) pinch = null; G.pointer = null; bgPan = null; return; }
    if (panDrag) { panDrag = null; return; }
    if (bgPan) { const moved = bgPan.active; bgPan = null; if (moved) return; }   // パンしたときは、タップの処理をしない
    onGameUp(ev);
  }
  function onWheel(ev) {
    if (inHud(ev)) return;
    if (ev.preventDefault) ev.preventDefault();
    if (G.pointer && G.pointer.dragging) return;   // カードのドラッグ中は、ズームしない
    const steps = Math.max(-3, Math.min(3, -(ev.deltaY || 0) / 100));
    if (steps !== 0) zoomAt(ev.clientX, ev.clientY, Math.pow(CONFIG.VIEW.WHEEL_STEP, steps));
  }
  scene.onPointerObservable.add((pi) => {
    if (pi.type === BABYLON.PointerEventTypes.POINTERDOWN) onDown(pi.event);
    else if (pi.type === BABYLON.PointerEventTypes.POINTERMOVE) onMove(pi.event);
    else if (pi.type === BABYLON.PointerEventTypes.POINTERUP) onUp(pi.event);
    else if (pi.type === BABYLON.PointerEventTypes.POINTERWHEEL) onWheel(pi.event);
  });
  scene.onKeyboardObservable.add((kb) => {
    if (kb.type !== BABYLON.KeyboardEventTypes.KEYDOWN) return;
    const k = kb.event.key, step = CONFIG.VIEW.KEY_PAN / view.zoom;
    if (k === "+" || k === "=") zoomCenter(CONFIG.VIEW.BUTTON_STEP);
    else if (k === "-" || k === "_") zoomCenter(1 / CONFIG.VIEW.BUTTON_STEP);
    else if (k === "0") fitAll();
    else if (k === "1") resetView();
    else if (k === "ArrowLeft") { view.panX -= step; applyView(); }
    else if (k === "ArrowRight") { view.panX += step; applyView(); }
    else if (k === "ArrowUp") { view.panY += step; applyView(); }
    else if (k === "ArrowDown") { view.panY -= step; applyView(); }
  });

  scene.onDisposeObservable.add(() => { G.genToken++; G.analysisId++; disposeMaterials(); });

  // 開始
  onResize();
  const resizeObserver = engine.onResizeObservable.add(() => onResize());
  scene.onDisposeObservable.add(() => engine.onResizeObservable.remove(resizeObserver));
  startNewGame(CONFIG.LEVEL);
  return scene;

};

// ######################################################################

 export var createScene = createScene_test_4105;

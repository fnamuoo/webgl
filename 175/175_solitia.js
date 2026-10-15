// solitia

// ######################################################################

// solitia

// export var createScene = async function () {
export var createScene_test_4005 = async function () {


const ddbase2="";
// const ddbase2="https://raw.githubusercontent.com/fnamuoo/webgl/main/175/";

// const fpathHearts = ddbase2 + "textures/tips_img/_trump1_hearts.png";
// const fpathDiamonds = ddbase2 + "textures/tips_img/_trump1_diamonds.png";
// const fpathClubs = ddbase2 + "textures/tips_img/_trump1_clubs.png";
// const fpathSpades = ddbase2 + "textures/tips_img/_trump1_spades.png";
// const fpathHearts2 = ddbase2 + "textures/tips_img/_trump3_hearts.png";
// const fpathDiamonds2 = ddbase2 + "textures/tips_img/_trump3_diamonds.png";
// const fpathClubs2 = ddbase2 + "textures/tips_img/_trump3_clubs.png";
// const fpathSpades2 = ddbase2 + "textures/tips_img/_trump3_spades.png";
// const fpathHearts3 = ddbase2 + "textures/tips_img/_trump4_hearts.png";
// const fpathDiamonds3 = ddbase2 + "textures/tips_img/_trump4_diamonds.png";
// const fpathClubs3 = ddbase2 + "textures/tips_img/_trump4_clubs.png";
// const fpathSpades3 = ddbase2 + "textures/tips_img/_trump4_spades.png";
// const fpathBabylonLogo = ddbase2 + "textures/asset/babylon_logo_color.png";



const fpathHearts = ddbase2 + "textures/trump1_hearts.png";
const fpathDiamonds = ddbase2 + "textures/trump1_diamonds.png";
const fpathClubs = ddbase2 + "textures/trump1_clubs.png";
const fpathSpades = ddbase2 + "textures/trump1_spades.png";
const fpathHearts2 = ddbase2 + "textures/trump3_hearts.png";
const fpathDiamonds2 = ddbase2 + "textures/trump3_diamonds.png";
const fpathClubs2 = ddbase2 + "textures/trump3_clubs.png";
const fpathSpades2 = ddbase2 + "textures/trump3_spades.png";
const fpathHearts3 = ddbase2 + "textures/trump4_hearts.png";
const fpathDiamonds3 = ddbase2 + "textures/trump4_diamonds.png";
const fpathClubs3 = ddbase2 + "textures/trump4_clubs.png";
const fpathSpades3 = ddbase2 + "textures/trump4_spades.png";
const fpathBabylonLogo = ddbase2 + "textures/babylon_logo_color.png";


// ============================================================================
//  ソルバー (第4.6章 クリア保証配置 / 第16.4章 リアルタイムのクリア可能性)
//  - createSolverApi : 盤面を数値だけで表した純粋なロジック。外部変数を参照しないので
//                      Web Worker の中でもメインスレッドでも同じコードを動かせる。
//  - createSolverClient : Worker の生成 / キャンセル / メインスレッド代替を担当。
//  自動移動はOFF相当 (全ての合法手を許す) で判定する。 4.6 の「自動移動OFFで検証」に対応
// ============================================================================
function createSolverApi() {
    // カードID = スート*13 + (ランク値-1)。スート 0,1 = 赤 (ハート,ダイヤ) / 2,3 = 黒 (クラブ,スペード)
    const SUIT = [], RANK = [], RED = [];
    for (let id = 0; id < 52; id++) {
        SUIT[id] = (id / 13) | 0;
        RANK[id] = (id % 13) + 1;
        RED[id] = SUIT[id] < 2 ? 1 : 0;
    }
    const CHR = [];
    for (let i = 0; i < 64; i++) CHR.push(String.fromCharCode(48 + i));
    let DRAW = 1; // めくり枚数 (1 or 3)

    // 盤面 S = { t: 場札7列(ID配列), d: 各列の裏向き枚数, s: 山札, w: 捨て札, f: スート別の組札枚数 }
    //   場札の裏向きカードは常に列の先頭側に連続している (6.5) ので、裏向き枚数 d だけで表現できる。
    //   配列は作成後に書き換えない (変更する列だけ新しく作る) ので、浅いコピーで安全に分岐できる。
    function fromPlain(p) {
        return { t: p.t.map((a) => a.slice()), d: p.d.slice(), s: p.s.slice(), w: p.w.slice(), f: p.f.slice() };
    }
    function isWin(S) {
        return S.f[0] === 13 && S.f[1] === 13 && S.f[2] === 13 && S.f[3] === 13;
    }

    // 重複判定キー: 場札7列は入れ替えても等価なので並べ替えて正規化する。山札・捨て札は順序つきで保持
    function keyOf(S) {
        const cs = [];
        for (let c = 0; c < 7; c++) {
            const a = S.t[c];
            let s = CHR[S.d[c]];
            for (let i = 0; i < a.length; i++) s += CHR[a[i]];
            cs.push(s);
        }
        cs.sort();
        let k = cs.join("|") + "#" + CHR[S.f[0]] + CHR[S.f[1]] + CHR[S.f[2]] + CHR[S.f[3]] + "#";
        for (let i = 0; i < S.s.length; i++) k += CHR[S.s[i]];
        k += "#";
        for (let i = 0; i < S.w.length; i++) k += CHR[S.w[i]];
        return k;
    }

    // 手: [種別, a, b, c, 優先度]
    //   0 山札操作 (8.2 / 8.3 / 8.5)        1 捨て札→組札              2 場札(col=a)の末尾→組札
    //   3 捨て札→場札(col=a)                 4 場札(col=a, idx=b)の束→場札(col=c)
    //   5 組札(スート=a)の一番上→場札(col=b)  (第10章)
    function apply(S, m) {
        const N = { t: S.t.slice(), d: S.d.slice(), s: S.s, w: S.w, f: S.f.slice() };
        switch (m[0]) {
            case 0: {
                if (S.s.length > 0) {
                    const s = S.s.slice(), w = S.w.slice();
                    for (let i = 0; i < DRAW && s.length > 0; i++) w.push(s.pop());
                    N.s = s; N.w = w;
                } else {
                    N.s = S.w.slice().reverse(); // 8.5 反転して山札へ (裏向き)
                    N.w = [];
                }
                break;
            }
            case 1: {
                const w = S.w.slice();
                const id = w.pop();
                N.w = w; N.f[SUIT[id]]++;
                break;
            }
            case 2: {
                const c = m[1], a = S.t[c].slice();
                const id = a.pop();
                N.t[c] = a; N.f[SUIT[id]]++;
                if (a.length > 0 && N.d[c] === a.length) N.d[c]--; // 6.5 自動表向き化
                break;
            }
            case 3: {
                const w = S.w.slice();
                const id = w.pop();
                const a = S.t[m[1]].slice();
                a.push(id);
                N.w = w; N.t[m[1]] = a;
                break;
            }
            case 4: {
                const src = m[1], idx = m[2], dst = m[3];
                const a = S.t[src];
                const rest = a.slice(0, idx);
                N.t[src] = rest;
                N.t[dst] = S.t[dst].concat(a.slice(idx));
                if (rest.length > 0 && N.d[src] === rest.length) N.d[src]--; // 6.5
                break;
            }
            case 5: {
                const su = m[1];
                const id = su * 13 + S.f[su] - 1;
                const a = S.t[m[2]].slice();
                a.push(id);
                N.f[su]--; N.t[m[2]] = a;
                break;
            }
        }
        return N;
    }

    function genMoves(S) {
        const mv = [];
        const t = S.t, d = S.d, f = S.f;
        let emptyCol = -1; // 空列は等価なので最初の1つだけを移動先にする
        for (let c = 0; c < 7; c++) if (t[c].length === 0) { emptyCol = c; break; }

        // 捨て札の一番上
        const wl = S.w.length;
        if (wl > 0) {
            const id = S.w[wl - 1];
            if (f[SUIT[id]] === RANK[id] - 1) mv.push([1, 0, 0, 0, 55]);
            for (let c = 0; c < 7; c++) {
                const a = t[c];
                if (a.length === 0) {
                    if (c === emptyCol && RANK[id] === 13) mv.push([3, c, 0, 0, 70]);
                } else {
                    const tl = a[a.length - 1];
                    if (RANK[tl] === RANK[id] + 1 && RED[tl] !== RED[id]) mv.push([3, c, 0, 0, 70]);
                }
            }
        }
        // 場札
        for (let c = 0; c < 7; c++) {
            const a = t[c], n = a.length;
            if (n === 0) continue;
            const tail = a[n - 1];
            if (f[SUIT[tail]] === RANK[tail] - 1) mv.push([2, c, 0, 0, d[c] > 0 && d[c] === n - 1 ? 85 : 50]);
            // 束の先頭カードの候補: 露出カード (index d..n-1) のうち、末尾まで6.2の束になるもの
            for (let idx = n - 1; idx >= d[c]; idx--) {
                if (idx < n - 1) {
                    const hi = a[idx], lo = a[idx + 1];
                    if (RANK[lo] !== RANK[hi] - 1 || RED[lo] === RED[hi]) break;
                }
                const head = a[idx];
                const reveal = d[c] > 0 && idx === d[c];
                for (let e = 0; e < 7; e++) {
                    if (e === c) continue; // 6.6
                    const b = t[e];
                    if (b.length === 0) {
                        if (e === emptyCol && RANK[head] === 13 && idx > 0) mv.push([4, c, idx, e, reveal ? 90 : 35]); // 6.4 / 6.6
                    } else {
                        const tl = b[b.length - 1];
                        if (RANK[tl] === RANK[head] + 1 && RED[tl] !== RED[head]) {
                            mv.push([4, c, idx, e, reveal ? 100 + d[c] : idx === 0 ? 60 : 40]);
                        }
                    }
                }
            }
        }
        // 組札の一番上 → 場札 (第10章。空でない列のみ)
        for (let su = 0; su < 4; su++) {
            if (f[su] === 0) continue;
            const id = su * 13 + f[su] - 1;
            for (let c = 0; c < 7; c++) {
                const a = t[c];
                if (a.length === 0) continue;
                const tl = a[a.length - 1];
                if (RANK[tl] === RANK[id] + 1 && RED[tl] !== RED[id]) mv.push([5, su, c, 0, 5]);
            }
        }
        if (S.s.length > 0 || S.w.length > 0) mv.push([0, 0, 0, 0, 20]);
        mv.sort((x, y) => y[4] - x[4]);
        return mv;
    }

    // 「安全な」組札移動は強制で行う (探索を小さくする枝刈り)。
    //   A・2 は常に安全。それ以外は、反対色の2スートの組札が (ランク-1) 以上 = そのカードの上に置くカードが不要
    function isSafe(S, id) {
        const r = RANK[id];
        if (S.f[SUIT[id]] !== r - 1) return false;
        if (r <= 2) return true;
        const o = RED[id] ? 2 : 0;
        return S.f[o] >= r - 1 && S.f[o + 1] >= r - 1;
    }
    let autoCnt = 0; // safeAuto が実行した強制手の数 (手数の表示用)
    function safeAuto(S, out) {
        autoCnt = 0;
        for (;;) {
            let m = null;
            const wl = S.w.length;
            if (wl > 0 && isSafe(S, S.w[wl - 1])) m = [1, 0, 0, 0];
            for (let c = 0; c < 7 && !m; c++) {
                const a = S.t[c];
                if (a.length > 0 && isSafe(S, a[a.length - 1])) m = [2, c, 0, 0];
            }
            if (!m) return S;
            S = apply(S, m);
            autoCnt++;
            if (out) out.push(m);
        }
    }

    // 深さ優先探索 + 重複排除。 戻り値 res: "solved" | "unsolvable" | "unknown"(時間/ノード数の上限)
    function solve(start, opt) {
        const t0 = Date.now();
        const visited = new Set();
        const wantPath = !!opt.wantPath;
        const forced0 = [];
        const S0 = safeAuto(start, wantPath ? forced0 : null);
        const n0 = autoCnt;
        if (isWin(S0)) return { res: "solved", nodes: 1, steps: n0, ms: 0, path: forced0 };
        visited.add(keyOf(S0));
        const stack = [{ S: S0, moves: null, i: 0, via: forced0, n: n0 }];
        let nodes = 1, iter = 0;
        while (stack.length > 0) {
            if ((++iter & 127) === 0 && (Date.now() - t0 > opt.ms || nodes > opt.maxNodes)) {
                return { res: "unknown", nodes, steps: 0, ms: Date.now() - t0 };
            }
            const fr = stack[stack.length - 1];
            if (fr.moves === null) fr.moves = genMoves(fr.S);
            if (fr.i >= fr.moves.length) { stack.pop(); continue; }
            const m = fr.moves[fr.i++];
            const via = wantPath ? [m.slice(0, 4)] : null;
            const S2 = safeAuto(apply(fr.S, m), via);
            const cnt = 1 + autoCnt;
            const k = keyOf(S2);
            if (visited.has(k)) continue;
            visited.add(k);
            nodes++;
            if (isWin(S2)) {
                let steps = cnt, path = null;
                for (const f of stack) steps += f.n;
                if (wantPath) {
                    path = [];
                    for (const f of stack) path.push(...f.via);
                    path.push(...via);
                }
                return { res: "solved", nodes, steps, ms: Date.now() - t0, path };
            }
            stack.push({ S: S2, moves: null, i: 0, via, n: cnt });
        }
        return { res: "unsolvable", nodes, steps: 0, ms: Date.now() - t0 };
    }

    // ---- モンテカルロ法: 疑似プレイヤー(優先度つきの確率的な手選び)が現局面からクリアできる割合 ----
    function playout(start, maxSteps) {
        let S = safeAuto(start, null);
        const seen = new Set([keyOf(S)]);
        for (let step = 0; step < maxSteps; step++) {
            if (isWin(S)) return true;
            const cand = [];
            let total = 0;
            for (const m of genMoves(S)) {
                const S2 = safeAuto(apply(S, m), null);
                const k = keyOf(S2);
                if (seen.has(k)) continue; // 同じ局面の繰り返し(山札の周回など)は行き詰まりとみなす
                const w = m[4] * m[4] + 1;
                cand.push([S2, k, w]);
                total += w;
            }
            if (cand.length === 0) return false;
            let r = Math.random() * total, pick = cand[cand.length - 1];
            for (const c of cand) { r -= c[2]; if (r <= 0) { pick = c; break; } }
            seen.add(pick[1]);
            S = pick[0];
        }
        return isWin(S);
    }

    // ---- 配札 (4.2 / 4.3) ----
    function dealState(deck) {
        const t = [], d = [];
        let n = 0;
        for (let c = 0; c < 7; c++) { t.push(deck.slice(n, n + c + 1)); d.push(c); n += c + 1; }
        return { t, d, s: deck.slice(n), w: [], f: [0, 0, 0, 0] };
    }
    function shuffled() {
        const a = [];
        for (let i = 0; i < 52; i++) a.push(i);
        for (let i = 51; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const x = a[i]; a[i] = a[j]; a[j] = x;
        }
        return a;
    }

    function handle(m, progress) {
        DRAW = m.draw === 3 ? 3 : 1;
        const fb = !!m.fallback; // メインスレッド実行のときは短めの予算にする
        if (m.type === "judge") {
            const r = solve(fromPlain(m.state), { ms: fb ? Math.min(m.ms, 800) : m.ms, maxNodes: m.maxNodes, wantPath: !!m.wantPath });
            r.type = "judge";
            return r;
        }
        if (m.type === "mc") {
            const t0 = Date.now(), lim = fb ? Math.min(m.ms, 800) : m.ms;
            let wins = 0, n = 0;
            const S = fromPlain(m.state);
            while (n < m.n && Date.now() - t0 < lim) {
                if (playout(S, 400)) wins++;
                n++;
            }
            return { type: "mc", wins, n, ms: Date.now() - t0 };
        }
        if (m.type === "generate") {
            const t0 = Date.now();
            const perMs = fb ? Math.min(m.perMs, 300) : m.perMs;
            const totalMs = fb ? Math.min(m.totalMs, 8000) : m.totalMs;
            let nodes = 0;
            for (let a = 1; a <= m.maxAttempts && Date.now() - t0 < totalMs; a++) {
                const deck = shuffled();
                const r = solve(dealState(deck), { ms: perMs, maxNodes: m.maxNodes });
                nodes += r.nodes;
                if (progress) progress({ attempt: a, last: r.res });
                if (r.res === "solved") return { type: "generate", ok: true, deck, attempts: a, steps: r.steps, nodes, ms: Date.now() - t0 };
            }
            return { type: "generate", ok: false, attempts: m.maxAttempts, nodes, ms: Date.now() - t0 };
        }
        return { type: "error" };
    }
    return { handle, solve, dealState, fromPlain, shuffled };
}

// Worker の生成 / 破棄 / メインスレッド代替。 request() は常に1件だけ処理し、新規要求が来たら前の要求は破棄する
function createSolverClient() {
    const src =
        "const api = (" + createSolverApi.toString() + ")();\n" +
        "self.onmessage = function (e) {\n" +
        "  const m = e.data;\n" +
        "  const r = api.handle(m, function (p) { self.postMessage({ id: m.id, progress: p }); });\n" +
        "  self.postMessage({ id: m.id, done: r });\n" +
        "};";
    let worker = null, blobUrl = null, workerOK = typeof Worker !== "undefined";
    let nextId = 1, cur = null, fallbackApi = null;

    function killWorker() { if (worker) { worker.terminate(); worker = null; } }
    function runFallback(job) {
        if (!fallbackApi) fallbackApi = createSolverApi();
        setTimeout(() => {
            if (cur !== job) return;
            const r = fallbackApi.handle(Object.assign({}, job.msg, { fallback: true }), null);
            if (cur !== job) return;
            cur = null;
            job.resolve(r);
        }, 30);
    }
    function spawn() {
        if (!workerOK || worker) return;
        try {
            if (!blobUrl) blobUrl = URL.createObjectURL(new Blob([src], { type: "application/javascript" }));
            worker = new Worker(blobUrl);
            worker.onmessage = (e) => {
                const d = e.data;
                if (!cur || d.id !== cur.id) return;
                if (d.progress) { if (cur.onProgress) cur.onProgress(d.progress); return; }
                const job = cur;
                cur = null;
                job.resolve(d.done);
            };
            worker.onerror = () => { // Worker が使えない環境 → メインスレッドで代替
                workerOK = false;
                killWorker();
                if (cur) runFallback(cur);
            };
        } catch {
            workerOK = false;
            worker = null;
        }
    }
    return {
        get usingWorker() { return workerOK; },
        request(msg, onProgress) {
            return new Promise((resolve) => {
                if (cur) { cur.resolve({ cancelled: true }); cur = null; killWorker(); }
                const job = { id: nextId++, msg: Object.assign({}, msg), resolve, onProgress };
                job.msg.id = job.id;
                cur = job;
                spawn();
                if (workerOK && worker) worker.postMessage(job.msg);
                else runFallback(job);
            });
        },
        cancel() {
            if (!cur) return;
            cur.resolve({ cancelled: true });
            cur = null;
            killWorker();
        },
    };
}


// ============================================================================
//  クロンダイク (Klondike Solitaire) - Babylon.js Playground (JavaScript)
//  対象: Babylon.js v9 以上 / Playground の「JavaScript」モードに貼り付けて実行
//
//  操作
//    ・山札クリック          : めくる / 山札が空なら捨て札を戻す (8.5)
//    ・カードをドラッグ      : 移動 (場札の束 / 捨て札の一番上 / 組札の一番上)
//    ・カードをダブルクリック: 移動できる先へ自動で移動 (組札優先)
//    ・画面上部のボタン      : 新規(Draw1/Draw3) / UNDO / 自動移動 / 可否表示 / 中断
//    ・2段目                 : クリア可能性の判定方式 (ソルバー / モンテカルロ) と指標ゲージ
//
//  実装メモ
//    ・盤面は XY 平面、カメラは -Z から +Z を見る正射影カメラ (カードは平面メッシュ)
//    ・カード絵柄: ART に画像URLを指定するとスートごとに1枚選び、ランクごとに
//      画像の一部(グリッドの1セル)を切り抜いて使う。読み込めなければコードで生成した絵柄を使う
//    ・ルール番号 (6.3 など) はコメントの対応先。仕様書の章に対応している
//    ・4.6 クリア保証配置: 新規ゲーム時に Worker 上のソルバーで「解ける配置」だけを採用する
//      (自動移動OFF相当で検証。生成上限に達したら失敗を通知し、未検証の配置は使わない)
//    ・16.4 クリア可能性の表示: プレイ中は盤面(裏向き・山札も含む神の視点)をソルバーに渡し、
//      操作のたびに非同期で再判定する。解ける / 解けない / 不明(時間切れ) のいずれかを表示する
//    ・ソルバーは createSolverApi() に自己完結させてあり、Blob から Worker を作って実行する。
//      Worker が使えない環境ではメインスレッドで短い予算に切り替えて動く
// ============================================================================

    const canvas = engine.getRenderingCanvas();
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.043, 0.227, 0.165, 1);

    // ------------------------------------------------------------------
    // 設定
    // ------------------------------------------------------------------
    // 絵柄画像 (CORS が許可された URL のみ使用可能)
    //   suitImages[0..3] = ハート, ダイヤ, クラブ, スペード (各スートに複数指定可。ゲーム開始ごとに1枚選ぶ)
    //   backImages       = カード裏面 (複数指定可)

    // const ART = {
    //     cols: 7, rows: 2, // ランクごとの切り抜きグリッド (5x3=15セル >= 13ランク)
    //     suitImages: [[fpathHearts], [fpathDiamonds], [fpathClubs], [fpathSpades]],
    //     backImages: [fpathBabylonLogo],
    // };
    let iART = 1;
    const ARTs = [
        {
            cols: 7, rows: 2, // ランクごとの切り抜きグリッド (5x3=15セル >= 13ランク)
            suitImages: [[], [], [], []],
            backImages: [],
            pxywh: [30, 30, 200, 300],
        },
        {
            cols: 7, rows: 2, // ランクごとの切り抜きグリッド (5x3=15セル >= 13ランク)
            suitImages: [[fpathHearts], [fpathDiamonds], [fpathClubs], [fpathSpades]],
            backImages: [fpathBabylonLogo],
            pxywh: [-5, -5, 240, 320],
        },
        {
            cols: 7, rows: 2, // ランクごとの切り抜きグリッド (5x3=15セル >= 13ランク)
            suitImages: [[fpathHearts2], [fpathDiamonds2], [fpathClubs2], [fpathSpades2]],
            backImages: [fpathBabylonLogo],
            pxywh: [-5, 40, 240, 320],
        },
        {
            cols: 7, rows: 2, // ランクごとの切り抜きグリッド (5x3=15セル >= 13ランク)
            suitImages: [[fpathHearts3], [fpathDiamonds3], [fpathClubs3], [fpathSpades3]],
            backImages: [fpathBabylonLogo],
            pxywh: [-5, 40, 240, 320],
        },
    ];

    const settings = {
        autoMove: true,        // 16.1 既定ON
        showMovable: false,    // 16.2 既定OFF
        judgeMode: "solver",   // 16.4 クリア可能性の判定方式: "solver" | "mc"
    };
    const CONFIG = {
        clearGuarantee: true,  // 4.6 false にすると検証なしのランダム配置になる (動作確認用)
        gen: { maxAttempts: 80, totalMs: 25000, perMs: 600, maxNodes: 200000 }, // 配置生成の上限 (1配置あたり / 全体)
        judge: { ms: 2500, maxNodes: 400000 }, // 16.4 数秒以内に判断する。超えたら「不明」
        mcN: 30,               // 16.4 モンテカルロは数十件程度まで
        // 指標の値: 仕様 16.4 は「解ける=0 / 解けない=100」、本文の例は「100%=可能」。ここで入れ替えられる
        scoreSolvable: 100,
        scoreUnsolvable: 0,
    };
    const solver = createSolverClient();

    // ------------------------------------------------------------------
    // 定数
    // ------------------------------------------------------------------
    const SUITS = [
        { name: "Hearts", sym: "♥", red: true, hue: 350 },
        { name: "Diamonds", sym: "♦", red: true, hue: 25 },
        { name: "Clubs", sym: "♣", red: false, hue: 140 },
        { name: "Spades", sym: "♠", red: false, hue: 220 },
    ];
    const RANK_LABEL = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    // カード実寸 (ワールド単位)。画面サイズでは変えない。
    //   画面に合わせた拡大縮小は正射影カメラのズームで行い、列の間隔・場札の重なりなどの「配置」は
    //   applyResponsive() が画面サイズごとに計算し直して、下の let 変数へ書き込む。
    //   (重なり間隔などはカード高さ CH に対する比率で持つので、CW を変えても全体が相似に保たれる)
    const CW = 1, CH = CW * 1.4;
    const ROW_Y = 0;                            // 上段(山札・捨て札・組札)の中心Y。ワールド座標の基準
    let COL_PITCH = CW * 1.22;                  // 列の間隔
    let TAB_Y0 = -CH * 1.2;                     // 場札の先頭カード中心Y
    let DY_DOWN = CH * 0.115, DY_UP = CH * 0.343; // 場札の重なり間隔(裏向き / 表向き)
    let MAX_SPAN = CH * 4.3;                    // 場札列の最大の縦幅 (超えたら詰める)
    const colX = (i) => (i - 3) * COL_PITCH;    // 第1列～第7列のX (列index 0..6)
    let STOCK_X = colX(0), WASTE_X = colX(1);
    const FOUND_X = (f) => colX(3 + f);         // 組札は右上 (列3～6の上)
    const FAN_DX = CW * 0.3;                    // Draw3 の捨て札の扇状ずらし幅
    let barPx = 88;                             // 上部ツールバーの高さ(px)。折り返しで変わる

    // ------------------------------------------------------------------
    // カメラ (正射影)
    // ------------------------------------------------------------------
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -20), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.minZ = 0.1;
    camera.maxZ = 100;   
    // orthoLeft/Right/Top/Bottom は applyResponsive() が画面サイズに合わせて設定する

    function toWorld(px, py) {
        const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
        return {
            x: camera.orthoLeft + (px / w) * (camera.orthoRight - camera.orthoLeft),
            y: camera.orthoTop - (py / h) * (camera.orthoTop - camera.orthoBottom),
        };
    }

    // ------------------------------------------------------------------
    // ユーティリティ
    // ------------------------------------------------------------------
    const last = (a) => a[a.length - 1];
    const colorOf = (c) => (SUITS[c.suit].red ? 0 : 1); // 0=赤, 1=黒

    function mulberry32(a) {
        return function () {
            a |= 0; a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    function rr(ctx, x, y, w, h, r) { // 角丸矩形パス
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    // ------------------------------------------------------------------
    // テクスチャ / マテリアル
    // ------------------------------------------------------------------
    const TEX_W = 256, TEX_H = 358;

    function makeTexMat(name, tex, mode) {
        const m = new BABYLON.StandardMaterial(name, scene);
        tex.hasAlpha = true;
        m.diffuseTexture = tex;
        m.emissiveColor = new BABYLON.Color3(1, 1, 1); // ライト不要 (テクスチャ色をそのまま表示)
        m.specularColor = BABYLON.Color3.Black();
        m.disableLighting = true;
        m.useAlphaFromDiffuseTexture = true;
        m.transparencyMode = mode;
        if (mode === BABYLON.Material.MATERIAL_ALPHATEST) m.alphaCutOff = 0.5;
        m.backFaceCulling = true;
        return m;
    }

    // ----- 絵柄画像の読み込み (失敗したら自動生成にフォールバック) -----
    let imageCache = new Map();
    function loadImage(url) {
        return new Promise((resolve) => {
            const im = new Image();
            im.crossOrigin = "anonymous";
            im.onload = () => resolve(im);
            im.onerror = () => resolve(null);
            im.src = url;
        });
    }
    async function preloadImages() {
        // const urls = [...ART.backImages, ...ART.suitImages.flat()];
        const urls = [...ARTs[iART].backImages, ...ARTs[iART].suitImages.flat()];
        await Promise.all(urls.map(async (u) => imageCache.set(u, await loadImage(u))));
    }

    // ----- 自動生成の絵柄 (スートごとの 5x3(=ART.cols*ART.rows) グリッド画像) -----
    function makeProceduralArt(suit, seed) {
        const W = 1000, H = 600;
        const cv = document.createElement("canvas");
        cv.width = W; cv.height = H;
        const g = cv.getContext("2d");
        const rnd = mulberry32(seed * 7 + suit * 1013);
        const hue = SUITS[suit].hue + (rnd() - 0.5) * 24;
        const grad = g.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, `hsl(${hue},65%,28%)`);
        grad.addColorStop(1, `hsl(${(hue + 50) % 360},70%,62%)`);
        g.fillStyle = grad;
        g.fillRect(0, 0, W, H);
        for (let i = 0; i < 100; i++) {
            const x = rnd() * W, y = rnd() * H, r = 12 + rnd() * 90;
            g.fillStyle = `hsla(${(hue + rnd() * 80 - 20 + 360) % 360},75%,${35 + rnd() * 45}%,${0.18 + rnd() * 0.3})`;
            g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
            if (rnd() < 0.35) {
                g.strokeStyle = `rgba(255,255,255,${0.15 + rnd() * 0.25})`;
                g.lineWidth = 2 + rnd() * 5;
                g.beginPath(); g.arc(x, y, r * 0.7, 0, Math.PI * 2); g.stroke();
            }
        }
        // 各セル(=各ランクの切り抜き範囲)の中央にスート記号を薄く入れる
        // const cw = W / ART.cols, ch = H / ART.rows;
        const cw = W / ARTs[iART].cols, ch = H / ARTs[iART].rows;
        g.fillStyle = "rgba(255,255,255,0.22)";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = '150px "Segoe UI Symbol","Apple Symbols","Noto Sans Symbols",serif';
        for (let cy = 0; cy < ARTs[iART].rows; cy++) {
            for (let cx = 0; cx < ARTs[iART].cols; cx++) g.fillText(SUITS[suit].sym, (cx + 0.5) * cw, (cy + 0.5) * ch);
        }
        return cv;
    }
    function pickSuitArt(suit) {
        // const ok = ART.suitImages[suit].filter((u) => imageCache.get(u));
        const ok = ARTs[iART].suitImages[suit].filter((u) => imageCache.get(u));
        if (ok.length > 0) return imageCache.get(ok[Math.floor(Math.random() * ok.length)]);
        return makeProceduralArt(suit, Math.floor(Math.random() * 100000));
    }
    function pickBackArt() {
        // const ok = ART.backImages.filter((u) => imageCache.get(u));
        const ok = ARTs[iART].backImages.filter((u) => imageCache.get(u));
        return ok.length > 0 ? imageCache.get(ok[Math.floor(Math.random() * ok.length)]) : null;
    }

    // ----- カード表面 -----
    function drawFace(card, art) {
        const ctx = card.faceTex.getContext();
        const W = TEX_W, H = TEX_H;
        ctx.clearRect(0, 0, W, H);
        rr(ctx, 3, 3, W - 6, H - 6, 24);
        ctx.fillStyle = "#fbfaf3"; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = "#2a2a2a"; ctx.stroke();

        const suit = SUITS[card.suit];
        const col = suit.red ? "#c62828" : "#1a1a1a";

        // 絵柄パネル: ランクに対応するセルを画像から切り抜く
        const px = 30, py = 30, pw = 200, ph = 300;
        const [px2, py2, pw2, ph2] = ARTs[iART].pxywh; // 画像の中心寄りで切り抜く
        ctx.save();
        rr(ctx, px, py, pw, ph, 10);
        ctx.clip();
        const idx = card.rank - 1;
        const gx = idx % ARTs[iART].cols, gy = Math.floor(idx / ARTs[iART].cols);
        const cw = art.width / ARTs[iART].cols, ch = art.height / ARTs[iART].rows;
        const aspect = pw / ph;
        let sw = cw, sh = cw / aspect;
        if (sh > ch) { sh = ch; sw = ch * aspect; }
        const sx = gx * cw + (cw - sw) / 2, sy = gy * ch + (ch - sh) / 2;
        ctx.drawImage(art, sx, sy, sw, sh, px2, py2, pw2, ph2);
        ctx.restore();
        rr(ctx, px, py, pw, ph, 10);
        ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();

        // 角のインデックス (左上 + 180度回転した右下)
        const drawIndex = () => {
            // 下地、背景を消す
            ctx.fillStyle = 'white';
            ctx.fillRect(10, 10, 100, 50);
            // 位置指定
            ctx.fillStyle = col;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            // スートのマーク(SUITS.sym)表示
            ctx.font = '50px "Segoe UI Symbol","Apple Symbols","Noto Sans Symbols",serif';
            ctx.fillText(suit.sym, 36, 40);
            // ランク表示
            ctx.font = 'bold 44px "Segoe UI","Hiragino Sans",Arial,sans-serif';
            ctx.fillText(RANK_LABEL[card.rank], 80, 40);
        };
        drawIndex();
        ctx.save();
        ctx.translate(W, H);
        ctx.rotate(Math.PI);
        drawIndex();
        ctx.restore();
        card.faceTex.update();
    }

    // ----- カード裏面 -----
    let backTex = null;
    function drawBack(art) {
        const ctx = backTex.getContext();
        const W = TEX_W, H = TEX_H;
        ctx.clearRect(0, 0, W, H);
        rr(ctx, 3, 3, W - 6, H - 6, 24);
        ctx.fillStyle = "#f4f1e8"; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = "#2a2a2a"; ctx.stroke();
        ctx.save();
        rr(ctx, 16, 16, W - 32, H - 32, 14);
        ctx.clip();
        if (art) {
            const sc = Math.max((W - 32) / art.width, (H - 32) / art.height);
            const dw = art.width * sc, dh = art.height * sc;
            ctx.drawImage(art, (W - dw) / 2, (H - dh) / 2, dw, dh);
        } else {
            const hue = Math.floor(Math.random() * 360);
            ctx.fillStyle = `hsl(${hue},55%,28%)`;
            ctx.fillRect(0, 0, W, H);
            ctx.strokeStyle = `hsla(${hue},60%,78%,0.45)`;
            ctx.lineWidth = 3;
            for (let i = -H; i < W + H; i += 26) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(i + H, 0); ctx.lineTo(i, H); ctx.stroke();
            }
            ctx.fillStyle = "rgba(255,255,255,0.85)";
            ctx.beginPath(); ctx.arc(W / 2, H / 2, 42, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `hsl(${hue},55%,28%)`;
            ctx.font = '56px "Segoe UI Symbol","Apple Symbols","Noto Sans Symbols",serif';
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("♠", W / 2, H / 2 + 3);
        }
        ctx.restore();
        rr(ctx, 16, 16, W - 32, H - 32, 14);
        ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.stroke();
        backTex.update();
    }

    // ----- スロット(空きマス)表示 -----
    function makeSlotTexture(label) {
        const t = new BABYLON.DynamicTexture("slotTex", { width: TEX_W, height: TEX_H }, scene, true);
        const g = t.getContext();
        g.clearRect(0, 0, TEX_W, TEX_H);
        rr(g, 8, 8, TEX_W - 16, TEX_H - 16, 22);
        g.fillStyle = "rgba(0,0,0,0.18)"; g.fill();
        g.setLineDash([14, 10]); g.lineWidth = 5; g.strokeStyle = "rgba(255,255,255,0.35)"; g.stroke();
        if (label) {
            g.setLineDash([]);
            g.fillStyle = "rgba(255,255,255,0.4)";
            g.font = 'bold 110px "Segoe UI Symbol","Apple Symbols",sans-serif';
            g.textAlign = "center"; g.textBaseline = "middle";
            g.fillText(label, TEX_W / 2, TEX_H / 2);
        }
        t.update();
        return t;
    }
    const slotTex = makeSlotTexture("");
    const aceTex = makeSlotTexture("A");
    const recycleTex = makeSlotTexture("↻");
    const slots = []; // { mesh, place: () => [x, y] } 配置が変わるたびに placeSlots() で置き直す
    function addSlot(place, tex) {
        const p = BABYLON.MeshBuilder.CreatePlane("slot", { width: CW, height: CH }, scene);
        p.position.z = 0.5;
        p.material = makeTexMat("slotMat", tex, BABYLON.Material.MATERIAL_ALPHABLEND);
        p.isPickable = false;
        slots.push({ mesh: p, place });
        return p;
    }
    for (let i = 0; i < 7; i++) addSlot(() => [colX(i), TAB_Y0], slotTex);      // 場札
    const stockSlot = addSlot(() => [STOCK_X, ROW_Y], slotTex);                 // 山札
    addSlot(() => [WASTE_X, ROW_Y], slotTex);                                   // 捨て札
    for (let f = 0; f < 4; f++) addSlot(() => [FOUND_X(f), ROW_Y], aceTex);     // 組札
    function placeSlots() {
        slots.forEach((sl) => { const [x, y] = sl.place(); sl.mesh.position.x = x; sl.mesh.position.y = y; });
    }

    // ----- テーブル -----
    let table = null;
    {
        const t = new BABYLON.DynamicTexture("tableTex", { width: 512, height: 512 }, scene, true);
        const g = t.getContext();
        const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256);
        grad.addColorStop(0, "#1f8059");
        grad.addColorStop(0.4, "#0f4a35");
        grad.addColorStop(0.5, "#0b3a2a");
        grad.addColorStop(1, "#0b3a2a");
        g.fillStyle = grad; g.fillRect(0, 0, 512, 512);
        t.update();
        table = BABYLON.MeshBuilder.CreatePlane("table", { size: 60 }, scene);
        table.position.set(0, -4, 3);
        const m = new BABYLON.StandardMaterial("tableMat", scene);
        m.diffuseTexture = t; m.emissiveColor = new BABYLON.Color3(1, 1, 1);
        m.disableLighting = true; m.specularColor = BABYLON.Color3.Black();
        table.material = m;
        table.isPickable = false;
    }

    // ------------------------------------------------------------------
    // カード生成 (52枚)
    // ------------------------------------------------------------------
    const cards = [];
    let backMat = null;
    function buildCards() {
        // 作り直すときは前回のカードを破棄する (しないと使われないカードが盤面に溜まり続ける)
        cards.forEach((c) => { c.root.dispose(false, false); c.frontMat.dispose(false, true); });
        cards.length = 0;
        if (backMat) backMat.dispose(false, true);
        backTex = new BABYLON.DynamicTexture("backTex", { width: TEX_W, height: TEX_H }, scene, true);
        backMat = makeTexMat("backMat", backTex, BABYLON.Material.MATERIAL_ALPHATEST);
        for (let id = 0; id < 52; id++) {
            const suit = Math.floor(id / 13), rank = (id % 13) + 1;
            const card = {
                id, suit, rank,
                faceUp: false, noAuto: false, dragging: false,
                holdUntil: 0,
                lx: 0, ly: 0, lz: 0,          // レイアウト上の位置 (当たり判定用)
                tx: STOCK_X, ty: ROW_Y, tz: 0, tRot: Math.PI, // 目標値 (配札まで山札の位置で待機)
                rot: Math.PI, rz: 0, tilt: 0, sc: 1, // 現在値
            };
            card.faceTex = new BABYLON.DynamicTexture("face" + id, { width: TEX_W, height: TEX_H }, scene, true);
            card.frontMat = makeTexMat("front" + id, card.faceTex, BABYLON.Material.MATERIAL_ALPHATEST);

            const root = new BABYLON.TransformNode("card" + id, scene);
            const front = BABYLON.MeshBuilder.CreatePlane("front" + id, { width: CW, height: CH }, scene);
            front.material = card.frontMat;
            front.parent = root;
            front.isPickable = false;
            const back = BABYLON.MeshBuilder.CreatePlane("back" + id, { width: CW, height: CH }, scene);
            back.material = backMat;
            back.rotation.y = Math.PI; // 裏面は表面と背中合わせ
            back.parent = root;
            back.isPickable = false;
            card.root = root;
            root.position.set(STOCK_X, ROW_Y, 0);
            root.rotation.y = Math.PI;
            cards.push(card);
        }
        redrawArt();
    }
    function redrawArt() {
        const arts = [0, 1, 2, 3].map(pickSuitArt);
        cards.forEach((c) => drawFace(c, arts[c.suit]));
        drawBack(pickBackArt());
    }

    // ------------------------------------------------------------------
    // ゲーム状態 (第14章)
    // ------------------------------------------------------------------
    let state = null;
    // state = { drawMode, tableau[7][], stock[], waste[], foundation[4][], status, undo }
    // 各配列は 先頭 → 末尾 の順 (山札は末尾からめくる / 捨て札・組札は末尾が「一番上」)

    // ------------------------------------------------------------------
    // ルール判定 (第6～11章)
    // ------------------------------------------------------------------
    // 6.2 束: 全て表向き / 隣接のランク値が1ずつ減少 / 隣接カードの色が異なる
    function isBundle(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (!arr[i].faceUp) return false;
            if (i > 0) {
                if (arr[i].rank !== arr[i - 1].rank - 1) return false;
                if (colorOf(arr[i]) === colorOf(arr[i - 1])) return false;
            }
        }
        return arr.length > 0;
    }

    // src: {zone:"tableau",col,idx} | {zone:"waste"} | {zone:"foundation",f}
    function srcCards(src) {
        if (src.zone === "tableau") {
            const arr = state.tableau[src.col];
            return src.idx >= 0 && src.idx < arr.length ? arr.slice(src.idx) : null;
        }
        if (src.zone === "waste") { const t = last(state.waste); return t ? [t] : null; }
        if (src.zone === "foundation") { const t = last(state.foundation[src.f]); return t ? [t] : null; }
        return null;
    }

    // 9.1 / 9.2
    function canFoundation(card, f) {
        const fd = state.foundation[f];
        if (fd.length === 0) return card.rank === 1;
        const top = last(fd);
        return top.suit === card.suit && card.rank === top.rank + 1;
    }

    // dst: {zone:"tableau",col} | {zone:"foundation",f}
    function canMove(src, dst) {
        const cs = srcCards(src);
        if (!cs) return false;
        if (src.zone === "tableau" && !isBundle(cs)) return false; // 6.1 / 6.2
        const head = cs[0];
        if (dst.zone === "tableau") {
            if (src.zone === "tableau" && src.col === dst.col) return false; // 6.6
            const col = state.tableau[dst.col];
            if (col.length === 0) {
                if (src.zone === "foundation") return false;             // 10: 空でない列のみ
                if (head.rank !== 13) return false;                      // 6.4
                if (src.zone === "tableau" && src.idx === 0) return false; // 6.6
                return true;
            }
            const tail = last(col);                                      // 6.3
            return colorOf(head) !== colorOf(tail) && head.rank === tail.rank - 1;
        }
        if (dst.zone === "foundation") {
            if (src.zone === "foundation") return false;
            if (cs.length !== 1) return false;                           // 9.3
            return canFoundation(head, dst.f);
        }
        return false;
    }
    function canAny(src) {
        for (let c = 0; c < 7; c++) if (canMove(src, { zone: "tableau", col: c })) return true;
        for (let f = 0; f < 4; f++) if (canMove(src, { zone: "foundation", f })) return true;
        return false;
    }

    // 移動の実行 (canMove 済みを前提)
    function doMove(src, dst) {
        let moved;
        if (src.zone === "tableau") moved = state.tableau[src.col].splice(src.idx);
        else if (src.zone === "waste") moved = [state.waste.pop()];
        else moved = [state.foundation[src.f].pop()];
        moved.forEach((c) => (c.noAuto = false));
        if (dst.zone === "tableau") state.tableau[dst.col].push(...moved);
        else state.foundation[dst.f].push(...moved);
        // 実装上の工夫: 組札から戻したカードは、自動組札移動で即座に組札へ戻らないようにする
        if (src.zone === "foundation") moved[0].noAuto = true;
        // 6.5 移動元の場札列の末尾カードが裏向きなら自動で表向きにする
        if (src.zone === "tableau") {
            const t = last(state.tableau[src.col]);
            if (t && !t.faceUp) t.faceUp = true;
        }
        return moved;
    }

    // 8.2 / 8.3 / 8.5 山札操作
    function doStockOp() {
        if (state.stock.length > 0) {
            const n = state.drawMode === 3 ? 3 : 1;
            for (let i = 0; i < n && state.stock.length > 0; i++) {
                const c = state.stock.pop(); // 山札の末尾から取り出す
                c.faceUp = true;
                state.waste.push(c);
            }
            return true;
        }
        if (state.waste.length > 0) {
            // 並び順を反転し、全て裏向きにして山札にする
            const re = state.waste.reverse();
            re.forEach((c) => (c.faceUp = false));
            state.stock = re;
            state.waste = [];
            return true;
        }
        return false;
    }

    // 16.1 自動組札移動 (捨て札の一番上 / 場札の各列の末尾カード)
    function findAutoFoundation(card) {
        if (card.rank === 1) {
            for (let f = 0; f < 4; f++) if (state.foundation[f].length === 0) return f; // 画面上で最も左の空き
            return -1;
        }
        for (let f = 0; f < 4; f++) {
            const fd = state.foundation[f];
            if (fd.length > 0 && fd[0].suit === card.suit && card.rank === last(fd).rank + 1) return f;
        }
        return -1;
    }
    function runAutoMoves() {
        let count = 0;
        for (let guard = 0; guard < 120; guard++) {
            let target = null;
            const w = last(state.waste);
            if (w && !w.noAuto) {
                const f = findAutoFoundation(w);
                if (f >= 0) target = { src: { zone: "waste" }, f, card: w };
            }
            for (let col = 0; col < 7 && !target; col++) {
                const arr = state.tableau[col];
                const t = last(arr);
                if (t && t.faceUp && !t.noAuto) {
                    const f = findAutoFoundation(t);
                    if (f >= 0) target = { src: { zone: "tableau", col, idx: arr.length - 1 }, f, card: t };
                }
            }
            if (!target) break;
            doMove(target.src, { zone: "foundation", f: target.f });
            target.card.holdUntil = performance.now() + 140 + count * 110; // 順番に飛ばす演出
            count++;
        }
        return count;
    }

    // 12.2 ゲームオーバー判定: 山札・捨て札が空で、移動できるカードがない
    function hasAnyMove() {
        if (state.stock.length > 0 || state.waste.length > 0) return true;
        for (let col = 0; col < 7; col++) {
            const arr = state.tableau[col];
            for (let idx = 0; idx < arr.length; idx++) {
                if (!arr[idx].faceUp) continue;
                if (canAny({ zone: "tableau", col, idx })) return true;
            }
        }
        for (let f = 0; f < 4; f++) {
            if (state.foundation[f].length > 0 && canAny({ zone: "foundation", f })) return true;
        }
        return false;
    }

    // 16.3 UNDO (直前の1操作のみ)
    function snapshot() {
        const ids = (a) => a.map((c) => c.id);
        return {
            tableau: state.tableau.map(ids), stock: ids(state.stock), waste: ids(state.waste),
            foundation: state.foundation.map(ids),
            flags: cards.map((c) => [c.faceUp, c.noAuto]),
        };
    }
    function restore(s) {
        const map = (a) => a.map((id) => cards[id]);
        state.tableau = s.tableau.map(map);
        state.stock = map(s.stock);
        state.waste = map(s.waste);
        state.foundation = s.foundation.map(map);
        cards.forEach((c, i) => { c.faceUp = s.flags[i][0]; c.noAuto = s.flags[i][1]; });
    }

    // プレイヤーの「操作」を1回実行する共通入口
    function perform(op) {
        if (!state || state.status !== "playing") return false;
        const snap = snapshot();
        if (!op()) return false;
        const autoCount = settings.autoMove ? runAutoMoves() : 0;
        state.undo = autoCount > 0 ? null : snap; // 自動移動が起きた操作はUNDO対象外
        afterChange();
        return true;
    }
    function undo() {
        if (!state || state.status !== "playing" || !state.undo) return;
        restore(state.undo);
        state.undo = null; // UNDO直後はさらにUNDOできない / 自動移動も実行しない
        cards.forEach((c) => (c.holdUntil = 0));
        layoutAll();
        updateUI();
        requestJudge();
    }

    // 12.1 クリア / 12.2 ゲームオーバー
    function evaluate() {
        if (state.status !== "playing") return;
        if (state.foundation.every((f) => f.length === 13)) {
            state.status = "cleared";
            state.undo = null;
            showMessage("CLEAR!  おめでとう！");
            confetti.start();
            setTimeout(() => confetti.stop(), 6000);
        } else if (!hasAnyMove()) {
            state.status = "over";
            state.undo = null;
            showMessage("GAME OVER");
        }
    }
    function afterChange() {
        evaluate();
        layoutAll();
        updateUI();
        requestJudge();
    }

    // ------------------------------------------------------------------
    // レイアウト (論理状態 → 目標座標)
    // ------------------------------------------------------------------
    function setLayout(c, x, y, z) {
        c.lx = x; c.ly = y; c.lz = z;
        c.tRot = c.faceUp ? 0 : Math.PI;
        if (!c.dragging) { c.tx = x; c.ty = y; c.tz = z; }
    }
    function layoutAll() {
        // 山札
        state.stock.forEach((c, i) => setLayout(c, STOCK_X, ROW_Y, -0.01 * i - 0.02));
        // 捨て札: Draw3 は一番上から最大3枚を右に扇状にずらす
        const w = state.waste, n = w.length;
        w.forEach((c, i) => {
            let x = WASTE_X;
            if (state.drawMode === 3) {
                const k = n - 1 - i; // 0 = 一番上
                if (k < 3) x += (Math.min(n, 3) - 1 - k) * FAN_DX;
            }
            setLayout(c, x, ROW_Y, -0.01 * i - 0.02);
        });
        // 組札
        state.foundation.forEach((arr, f) => arr.forEach((c, i) => setLayout(c, FOUND_X(f), ROW_Y, -0.01 * i - 0.02)));
        // 場札: 列が長いときは重なり間隔を詰める
        state.tableau.forEach((arr, col) => {
            const offs = [];
            let acc = 0;
            for (let i = 0; i < arr.length; i++) { offs.push(acc); acc += arr[i].faceUp ? DY_UP : DY_DOWN; }
            const total = arr.length > 1 ? offs[arr.length - 1] : 0;
            const k = total > MAX_SPAN ? MAX_SPAN / total : 1;
            arr.forEach((c, i) => setLayout(c, colX(col), TAB_Y0 - offs[i] * k, -0.01 * i - 0.02));
        });
        // 山札スロットのアイコン (捨て札を戻せるとき ↻)
        stockSlot.material.diffuseTexture = state.stock.length === 0 && state.waste.length > 0 ? recycleTex : slotTex;
        applyMovableDisplay();
    }

    // 16.2 移動不可能なカードをグレー表示
    function applyMovableDisplay() {
        cards.forEach((c) => c.frontMat.emissiveColor.set(1, 1, 1));
        if (!settings.showMovable || !state || state.status !== "playing") return;
        const dim = (c, ok) => { if (!ok) c.frontMat.emissiveColor.set(0.38, 0.38, 0.38); };
        state.tableau.forEach((arr, col) => arr.forEach((c, idx) => { if (c.faceUp) dim(c, canAny({ zone: "tableau", col, idx })); }));
        const wTop = last(state.waste);
        if (wTop) dim(wTop, canAny({ zone: "waste" }));
    }

    // ------------------------------------------------------------------
    // 毎フレーム: カードを目標位置へなめらかに移動 / 裏返し
    // ------------------------------------------------------------------
    scene.onBeforeRenderObservable.add(() => {
        if (!state) return;
        const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
        const now = performance.now();
        for (const c of cards) {
            if (c.holdUntil > now) continue;
            const f = 1 - Math.exp(-(c.dragging ? 38 : 13) * dt);
            const p = c.root.position;
            p.x += (c.tx - p.x) * f;
            p.y += (c.ty - p.y) * f;
            c.rot += (c.tRot - c.rot) * f;
            let dist = Math.abs(c.tx - p.x) + Math.abs(c.ty - p.y);
            if (dist < 0.002) { p.x = c.tx; p.y = c.ty; dist = 0; }
            if (Math.abs(c.tRot - c.rot) < 0.002) c.rot = c.tRot;
            const moving = dist > 0.03 || Math.abs(c.tRot - c.rot) > 0.04;
            p.z = c.dragging ? c.tz : moving ? c.tz - 1.5 : c.tz; // 移動中は手前に浮かせる
            c.root.rotation.y = c.rot;
            if (c.dragging) c.tilt *= Math.exp(-6 * dt);
            c.rz += ((c.dragging ? c.tilt : 0) - c.rz) * f;
            c.root.rotation.z = c.rz;
            c.sc += ((c.dragging ? 1.07 : 1) - c.sc) * f;
            c.root.scaling.set(c.sc, c.sc, 1);
        }
    });

    // ------------------------------------------------------------------
    // 紙吹雪 (クリア演出)
    // ------------------------------------------------------------------
    const dot = new BABYLON.DynamicTexture("dot", { width: 32, height: 32 }, scene, false);
    {
        const g = dot.getContext();
        g.fillStyle = "white"; g.beginPath(); g.arc(16, 16, 14, 0, Math.PI * 2); g.fill();
        dot.update();
    }
    const confetti = new BABYLON.ParticleSystem("confetti", 700, scene);
    confetti.particleTexture = dot;
    confetti.emitter = new BABYLON.Vector3(0, CH, -6); // 位置・大きさは applyResponsive() が設定
    confetti.minEmitBox = new BABYLON.Vector3(-5, 0, 0);
    confetti.maxEmitBox = new BABYLON.Vector3(5, 0, 0);
    confetti.color1 = new BABYLON.Color4(1, 0.35, 0.35, 1);
    confetti.color2 = new BABYLON.Color4(0.35, 0.8, 1, 1);
    confetti.colorDead = new BABYLON.Color4(1, 1, 0.4, 0);
    confetti.minSize = 0.07; confetti.maxSize = 0.18;
    confetti.minLifeTime = 2.2; confetti.maxLifeTime = 4;
    confetti.emitRate = 260;
    confetti.direction1 = new BABYLON.Vector3(-1, -1, 0);
    confetti.direction2 = new BABYLON.Vector3(1, -3, 0);
    confetti.gravity = new BABYLON.Vector3(0, -3, 0);
    confetti.minEmitPower = 0.5; confetti.maxEmitPower = 2;
    confetti.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

    // ------------------------------------------------------------------
    // GUI (ツールバー / メッセージ)
    // ------------------------------------------------------------------
    const GUI = BABYLON.GUI;
    const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, scene);
    const bar = new GUI.Rectangle("bar");
    bar.height = barPx + "px";
    bar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    bar.background = "rgba(0,0,0,0.45)";
    bar.thickness = 0;
    ui.addControl(bar);

    // ツールバーの部品は絶対位置で置き、画面幅に収まらなければ次の行へ折り返す (layoutGui)
    const tbItems = []; // { c: 部品, w: 幅(px), h: 高さ(px), flex: 幅を縮めてよいか, br: この部品の前で必ず改行するか }
    function tbAdd(c, w, h, flex, br) {
        c.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        c.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        bar.addControl(c);
        tbItems.push({ c, w, h, flex: !!flex, br: !!br });
        return c;
    }
    function addButton(label, width, handler, br) {
        const b = GUI.Button.CreateSimpleButton("btn_" + label, label);
        b.color = "white"; b.cornerRadius = 8;
        b.background = "#2f7f5f"; b.thickness = 1; b.paddingRight = "6px";
        b.onPointerUpObservable.add(handler);
        return tbAdd(b, width, 36, false, br);
    }
    addButton("新規 Draw1", 100, () => {
        iART = (iART+1) % ARTs.length;
        preloadImages().then(() => {
            buildCards();
            newGame(1);
        });
    });
    addButton("新規 Draw3", 100, () => {
        iART = (iART+1) % ARTs.length;
        preloadImages().then(() => {
            buildCards();
            newGame(3);
        });
    });
    const undoBtn = addButton("UNDO", 70, () => undo());
    const autoBtn = addButton("", 130, () => {
        settings.autoMove = !settings.autoMove;
        // 16.1: ONに切り替えた時点で自動移動の判断を行う
        if (state && state.status === "playing" && settings.autoMove) {
            const n = runAutoMoves();
            if (n > 0) state.undo = null;
            afterChange();
        } else updateUI();
    });
    const movBtn = addButton("", 130, () => {
        settings.showMovable = !settings.showMovable;
        applyMovableDisplay();
        updateUI();
    });
    const abortBtn = addButton("中断", 60, () => {
        if (state && state.status === "playing") {
            state.status = "over"; // 12.2 プレイヤーによる中断
            state.undo = null;
            showMessage("中断 - GAME OVER");
            applyMovableDisplay();
            updateUI();
            requestJudge();
        }
    });
    const info = new GUI.TextBlock("info", "");
    info.color = "#d8f3e6";
    info.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    info.paddingLeft = "8px";
    tbAdd(info, 250, 36, true);

    // ---- 16.4 クリア可能性の表示 ----
    const judgeBtn = addButton("", 200, () => {
        settings.judgeMode = settings.judgeMode === "solver" ? "mc" : "solver";
        updateUI();
        requestJudge();
    }, true); // 2段目の先頭
    const gauge = new GUI.Rectangle("gauge"); // ゲージの上に文字を重ねる (狭い画面でも1つの部品で済む)
    gauge.cornerRadius = 12;
    gauge.thickness = 1; gauge.color = "#9fd8bf"; gauge.background = "rgba(0,0,0,0.35)";
    gauge.paddingRight = "8px";
    tbAdd(gauge, 390, 24, true);
    const gaugeFill = new GUI.Rectangle("gaugeFill");
    gaugeFill.width = "0%"; gaugeFill.height = "100%"; gaugeFill.thickness = 0; gaugeFill.cornerRadius = 12;
    gaugeFill.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    gaugeFill.background = "#8a8f94";
    gauge.addControl(gaugeFill);
    const gaugeText = new GUI.TextBlock("gaugeText", "—");
    gaugeText.color = "#ffffff"; gaugeText.fontStyle = "bold";
    gaugeText.shadowColor = "black"; gaugeText.shadowBlur = 4;
    gaugeText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    gaugeText.paddingLeft = "12px";
    gauge.addControl(gaugeText);

    const msg = new GUI.TextBlock("msg", "");
    msg.fontSize = 64; msg.fontStyle = "bold"; msg.color = "white";
    msg.shadowColor = "black"; msg.shadowBlur = 8;
    msg.isVisible = false; msg.isHitTestVisible = false;
    ui.addControl(msg);

    const hint = new GUI.TextBlock("hint", "ドラッグで移動 / ダブルクリックで自動移動 / 山札クリックでめくる");
    hint.fontSize = 13; hint.color = "rgba(255,255,255,0.6)"; hint.height = "26px";
    hint.textWrapping = true;
    hint.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    hint.isHitTestVisible = false;
    ui.addControl(hint);

    // 画面サイズに応じた文字サイズ (applyResponsive が更新)
    let msgScale = 1;
    let hintPx = 26; // 画面下端のヒント表示に使う高さ(px)

    // ツールバーの折り返し配置。ツールバー全体の高さを barPx に、ヒントの高さを hintPx に設定する
    function layoutGui(w, h, compact) {
        const rowH = compact ? 32 : 38, side = 8, hk = compact ? 0.85 : 1;
        const fs = compact ? 13 : 15;
        let x = side, y = 4;
        for (const it of tbItems) {
            const bw = Math.round(it.w * hk); // 縦が短い画面では幅も詰める
            const iw = it.flex ? Math.min(bw, w - 2 * side) : bw;
            if (x > side && (it.br || x + iw > w - side + 0.5)) { x = side; y += rowH; } // 入りきらない / 段の先頭なら次の行へ
            const ih = Math.round(it.h * hk);
            it.c.width = iw + "px";
            it.c.height = ih + "px";
            it.c.left = x + "px";
            it.c.top = (y + (rowH - ih) / 2) + "px";
            it.c.fontSize = fs;
            x += iw;
        }
        barPx = y + rowH + 2;
        bar.height = barPx + "px";
        gaugeText.fontSize = w < 420 ? 11 : compact ? 12 : 13;
        info.fontSize = compact ? 12 : 13;
        // ヒント: 縦が短い画面では隠す。幅が狭いときは2行にする
        hint.isVisible = !compact;
        hintPx = compact ? 0 : w < 620 ? 40 : 26;
        hint.height = hintPx + "px";
        msgScale = Math.max(0.45, Math.min(1, w / 760));
    }

    function showMessage(t, size) {
        msg.fontSize = Math.round((size || 64) * msgScale);
        msg.textWrapping = true;
        msg.text = t;
        msg.isVisible = true;
    }
    function hideMessage() { msg.isVisible = false; }
    function updateUI() {
        if (!state) return;
        const playing = state.status === "playing";
        undoBtn.alpha = playing && state.undo ? 1 : 0.4;
        abortBtn.alpha = playing ? 1 : 0.4;
        autoBtn.textBlock.text = "自動移動: " + (settings.autoMove ? "ON" : "OFF");
        autoBtn.background = settings.autoMove ? "#2f7f5f" : "#555555";
        movBtn.textBlock.text = "可否表示: " + (settings.showMovable ? "ON" : "OFF");
        movBtn.background = settings.showMovable ? "#2f7f5f" : "#555555";
        judgeBtn.textBlock.text = "クリア判定: " + (settings.judgeMode === "solver" ? "ソルバー" : "モンテカルロ");
        info.text = "Draw " + state.drawMode + "   山札 " + state.stock.length + " / 捨て札 " + state.waste.length;
    }

    // ------------------------------------------------------------------
    // 入力 (ドラッグ / クリック / ダブルクリック)
    // ------------------------------------------------------------------
    const inRect = (p, cx, cy) => Math.abs(p.x - cx) <= CW / 2 && Math.abs(p.y - cy) <= CH / 2;

    function hitTest(p) {
        if (inRect(p, STOCK_X, ROW_Y)) return { kind: "stock" };
        const w = last(state.waste);
        if (w && inRect(p, w.lx, w.ly)) return { kind: "waste" };
        for (let f = 0; f < 4; f++) {
            if (last(state.foundation[f]) && inRect(p, FOUND_X(f), ROW_Y)) return { kind: "foundation", f };
        }
        for (let col = 0; col < 7; col++) {
            const arr = state.tableau[col];
            for (let i = arr.length - 1; i >= 0; i--) { // 後ろのカードほど手前に見える
                if (inRect(p, colX(col), arr[i].ly)) return { kind: "tableau", col, idx: i };
            }
        }
        return null;
    }
    function hitToSrc(hit) {
        if (hit.kind === "waste") return { zone: "waste" };
        if (hit.kind === "foundation") return { zone: "foundation", f: hit.f };
        if (hit.kind === "tableau") {
            return state.tableau[hit.col][hit.idx].faceUp ? { zone: "tableau", col: hit.col, idx: hit.idx } : null;
        }
        return null;
    }

    // ドロップ先: ドラッグ中の先頭カードと最も重なりが大きい「移動可能な」場所
    function findDrop(src, hx, hy) {
        let best = null, bestArea = CW * CH * 0.2;
        const consider = (dst, cx, cy) => {
            if (!canMove(src, dst)) return;
            const area = Math.max(0, CW - Math.abs(hx - cx)) * Math.max(0, CH - Math.abs(hy - cy));
            if (area > bestArea) { bestArea = area; best = dst; }
        };
        for (let f = 0; f < 4; f++) consider({ zone: "foundation", f }, FOUND_X(f), ROW_Y);
        for (let col = 0; col < 7; col++) {
            const t = last(state.tableau[col]);
            consider({ zone: "tableau", col }, colX(col), t ? t.ly : TAB_Y0);
        }
        return best;
    }

    // ダブルクリック: 組札 → 場札(空でない列を優先) の順に移動できる先を探す
    function smartMove(src) {
        const cs = srcCards(src);
        if (!cs) return;
        if (src.zone !== "foundation" && cs.length === 1) {
            for (let f = 0; f < 4; f++) {
                const dst = { zone: "foundation", f };
                if (canMove(src, dst)) { perform(() => { doMove(src, dst); return true; }); return; }
            }
        }
        const order = [0, 1, 2, 3, 4, 5, 6].sort((a, b) => (state.tableau[a].length === 0) - (state.tableau[b].length === 0));
        for (const col of order) {
            const dst = { zone: "tableau", col };
            if (canMove(src, dst)) { perform(() => { doMove(src, dst); return true; }); return; }
        }
    }

    let pending = null;   // 押下中の情報
    let lastWorld = null;
    let lastClick = { key: -1, time: 0 };

    function onDown(ev) {
        if (!state || state.status !== "playing") return;
        if (ev && ev.button !== undefined && ev.button !== 0) return;
        if (scene.pointerY < barPx) return; // ツールバー上は無視
        const p = toWorld(scene.pointerX, scene.pointerY);
        const hit = hitTest(p);
        if (!hit) return;
        pending = { hit, src: null, cards: null, sx: scene.pointerX, sy: scene.pointerY, p0: p, dragging: false };
        if (hit.kind !== "stock") {
            const src = hitToSrc(hit);
            if (src) {
                const cs = srcCards(src);
                if (cs && (src.zone !== "tableau" || isBundle(cs))) { pending.src = src; pending.cards = cs; }
            }
        }
        lastWorld = p;
    }
    function onMove() {
        if (!pending || !pending.src) return;
        const p = toWorld(scene.pointerX, scene.pointerY);
        if (!pending.dragging) {
            if (Math.hypot(scene.pointerX - pending.sx, scene.pointerY - pending.sy) < 6) return;
            pending.dragging = true;
            const head = pending.cards[0];
            pending.offX = pending.p0.x - head.lx;
            pending.offY = pending.p0.y - head.ly;
            pending.rel = pending.cards.map((c) => ({ x: c.lx - head.lx, y: c.ly - head.ly }));
            pending.cards.forEach((c) => (c.dragging = true));
        }
        const dx = p.x - lastWorld.x;
        lastWorld = p;
        pending.cards.forEach((c, i) => {
            c.tx = p.x - pending.offX + pending.rel[i].x;
            c.ty = p.y - pending.offY + pending.rel[i].y;
            c.tz = -3 - i * 0.01;
            c.tilt = Math.max(-0.35, Math.min(0.35, c.tilt - dx * 0.8));
        });
    }
    function onUp() {
        const pd = pending;
        pending = null;
        if (!pd || !state) return;
        if (pd.dragging) {
            const head = pd.cards[0];
            pd.cards.forEach((c) => (c.dragging = false));
            const dst = state.status === "playing" ? findDrop(pd.src, head.tx, head.ty) : null;
            if (dst) perform(() => { doMove(pd.src, dst); return true; });
            else layoutAll(); // 無効な移動: 元の位置へ戻す (11)
            return;
        }
        if (state.status !== "playing") return;
        if (pd.hit.kind === "stock") { perform(doStockOp); return; }
        if (!pd.src) return;
        const now = performance.now();
        const key = pd.cards[0].id;
        if (lastClick.key === key && now - lastClick.time < 350) {
            lastClick = { key: -1, time: 0 };
            smartMove(pd.src);
        } else lastClick = { key, time: now };
    }
    scene.onPointerObservable.add((pi) => {
        switch (pi.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN: onDown(pi.event); break;
            case BABYLON.PointerEventTypes.POINTERMOVE: onMove(); break;
            case BABYLON.PointerEventTypes.POINTERUP: onUp(); break;
        }
    });

    // ------------------------------------------------------------------
    // クリア可能性の判定 (第16.4章): 神の視点 (裏向き・山札も含めた全カード) で非同期に判定する
    // ------------------------------------------------------------------
    let dealing = false, dealSeq = 0, judgeSeq = 0, judgeTimer = null;

    function solverSnapshot() {
        const f = [0, 0, 0, 0];
        state.foundation.forEach((fd) => { if (fd.length > 0) f[fd[0].suit] = fd.length; });
        return {
            t: state.tableau.map((a) => a.map((c) => c.id)),
            d: state.tableau.map((a) => { let n = 0; while (n < a.length && !a[n].faceUp) n++; return n; }), // 列の先頭側にある裏向きの枚数
            s: state.stock.map((c) => c.id),
            w: state.waste.map((c) => c.id),
            f,
            draw: state.drawMode,
        };
    }

    function setIndicator(o) {
        const sec = o.ms !== undefined ? (o.ms / 1000).toFixed(1) + "秒" : "";
        gaugeFill.alpha = 1;
        gauge.color = "#9fd8bf";
        if (o.kind === "idle") {
            gaugeFill.width = "0%";
            gaugeText.text = o.text || "—";
        } else if (o.kind === "busy") {
            gaugeFill.alpha = 0.3; // 前回の値を薄く残す
            gaugeText.text = o.text || "判定中…";
        } else if (o.kind === "solver") {
            if (o.res === "solved") {
                const s = CONFIG.scoreSolvable;
                gaugeFill.width = s + "%"; gaugeFill.background = "#34c26b";
                gaugeText.text = s + "  解ける  (" + o.steps + "手の手順を確認 / " + sec + ")";
            } else if (o.res === "unsolvable") {
                const s = CONFIG.scoreUnsolvable;
                gaugeFill.width = s + "%"; gaugeFill.background = "#e0524d"; gauge.color = "#e0524d";
                gaugeText.text = s + "  解けない  (全ての手を調べ済み / " + sec + ")";
            } else {
                gaugeFill.width = "100%"; gaugeFill.background = "#8a8f94"; gaugeFill.alpha = 0.35;
                gaugeText.text = "不明  (時間内に判定できず / " + sec + ")";
            }
        } else if (o.kind === "mc") {
            if (o.n === 0) {
                gaugeFill.width = "100%"; gaugeFill.background = "#8a8f94"; gaugeFill.alpha = 0.35;
                gaugeText.text = "不明  (時間内に試行できず)";
            } else {
                const pct = Math.round((100 * o.wins) / o.n);
                gaugeFill.width = pct + "%";
                gaugeFill.background = pct >= 60 ? "#34c26b" : pct >= 30 ? "#d9a441" : "#e0524d";
                gaugeText.text = pct + "  疑似プレイヤーの勝率  (" + o.wins + "/" + o.n + "回 / " + sec + ")";
            }
        }
    }

    // 操作のたびに呼ぶ。直前の判定は破棄して、100ms 待ってから Worker に依頼する (ドラッグ中の連打を避ける)
    function requestJudge() {
        if (dealing) return;
        clearTimeout(judgeTimer);
        const my = ++judgeSeq;
        solver.cancel();
        if (!state || state.status !== "playing") { setIndicator({ kind: "idle" }); return; }
        setIndicator({ kind: "busy" });
        judgeTimer = setTimeout(async () => {
            if (my !== judgeSeq || !state || state.status !== "playing") return;
            const snap = solverSnapshot();
            const mode = settings.judgeMode;
            const msg2 = mode === "mc"
                ? { type: "mc", draw: snap.draw, state: snap, n: CONFIG.mcN, ms: CONFIG.judge.ms }
                : { type: "judge", draw: snap.draw, state: snap, ms: CONFIG.judge.ms, maxNodes: CONFIG.judge.maxNodes };
            const r = await solver.request(msg2);
            if (my !== judgeSeq || r.cancelled) return;
            setIndicator(Object.assign({ kind: mode }, r));
        }, 100);
    }

    // ------------------------------------------------------------------
    // 新規ゲーム (第4章)
    // ------------------------------------------------------------------
    async function newGame(mode) {
        const seq = ++dealSeq;
        judgeSeq++; clearTimeout(judgeTimer); solver.cancel();
        pending = null;
        hideMessage();
        confetti.stop();
        if (state) { state.status = "dealing"; state.undo = null; applyMovableDisplay(); } // 配札中は操作を受け付けない
        dealing = true;
        updateUI();

        let deckIds, info = null;
        if (CONFIG.clearGuarantee) {
            // 4.6 シャッフル → ソルバーで検証 → 解けた配置だけ採用 (判定不能なら作り直し)
            setIndicator({ kind: "busy", text: "クリア可能な配置を探索中…" });
            showMessage("クリア可能な配置を探索中…", 30);
            const res = await solver.request(
                Object.assign({ type: "generate", draw: mode }, CONFIG.gen),
                (p) => { if (seq === dealSeq) showMessage("クリア可能な配置を探索中…  試行 " + p.attempt + " 回目", 30); }
            );
            if (seq !== dealSeq || res.cancelled) return; // 新しい「新規」が押された
            if (!res.ok) {
                dealing = false;
                if (state) state.status = "idle";
                showMessage("クリア保証配置の生成に失敗しました\n「新規」をもう一度押してください", 30);
                setIndicator({ kind: "idle", text: "配置の生成に失敗 (未検証の配置は使用しません)" });
                updateUI();
                return;
            }
            deckIds = res.deck;
            info = res;
        } else {
            deckIds = shuffle(Array.from({ length: 52 }, (_, i) => i));
        }
        dealing = false;
        hideMessage();
        applyDeal(mode, deckIds);
        if (info && settings.judgeMode === "solver") {
            // 配札時に解ける手順を確認済みなので、そのまま表示する
            setIndicator({ kind: "solver", res: "solved", steps: info.steps, ms: info.ms });
        } else requestJudge();
    }

    // deckIds: シャッフル後の並び (カードID)。先頭から場札28枚(4.2)、残り24枚が山札(4.3)
    function applyDeal(mode, deckIds) {
        state = {
            drawMode: mode,
            tableau: [[], [], [], [], [], [], []],
            stock: [], waste: [], foundation: [[], [], [], []],
            status: "playing", undo: null,
        };
        pending = null;
        lastClick = { key: -1, time: 0 };
        cards.forEach((c) => {
            c.faceUp = false; c.noAuto = false; c.dragging = false;
            c.tilt = 0; c.rz = 0; c.sc = 1; c.holdUntil = 0;
        });
        redrawArt();

        // 4.2 並びの先頭から、列ごとに 1,2,...,7 枚を配置 (各列の末尾のみ表向き)
        const deck = deckIds.map((id) => cards[id]);
        let n = 0;
        for (let col = 0; col < 7; col++) {
            for (let k = 0; k <= col; k++) {
                const c = deck[n++];
                c.faceUp = k === col;
                state.tableau[col].push(c);
            }
        }
        // 4.3 残り24枚は裏向きの山札
        state.stock = deck.slice(n);

        layoutAll();
        // 配るアニメーション: 全カードを山札位置から開始
        const now = performance.now();
        cards.forEach((c) => {
            c.root.position.set(STOCK_X, ROW_Y, c.lz);
            c.rot = Math.PI;
            c.root.rotation.y = Math.PI;
        });
        for (let i = 0; i < n; i++) deck[i].holdUntil = now + 80 + i * 45;
        updateUI();
    }


    // ------------------------------------------------------------------
    // 画面サイズへの追従: ツールバー折り返し → ズーム決定 → 列の間隔・場札の縦幅 → カメラ
    // ------------------------------------------------------------------
    function applyResponsive() {
        const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
        const compact = h < 520; // 横向きスマホなど、縦が短い画面
        layoutGui(w, h, compact); // barPx / hintPx が決まる
        const areaH = Math.max(1, h - barPx - hintPx); // 盤面に使える高さ(px)

        // 盤面に最低限必要な大きさ (ワールド単位)
        // const padX = CW * 0.3, padTop = CW * 0.2, padBottom = CW * 0.2, rowGap = CW * 0.28;
        // const pitchMin = CW * 1.1, pitchMax = CW * 1.45;
        // const spanMin = CH * (compact ? 2.0 : 2.4), spanMax = CH * 6.0; // 場札列の縦幅(これを超える列は重なりを詰める)
        // const wMin = 6 * pitchMin + CW + 2 * padX;                    // 7列が入る幅
        // const fixedH = padTop + 2 * CH + rowGap + padBottom;           // 上段 + 場札の先頭カード + 末尾カード分の高さ

        const padX = CW * 0.3, padTop = CW * 0.2, padBottom = CW * 0.2, rowGap = CW * 0.28;
//        const pitchMin = CW * 1.1, pitchMax = CW * 1.45;
        const pitchMin = CW * 0.5, pitchMax = CW * 1.1;  // 場札の列間を詰める
        const spanMin = CH * (compact ? 2.0 : 2.4), spanMax = CH * 6.0; // 場札列の縦幅(これを超える列は重なりを詰める)
        const wMin = 6*pitchMin + CW + 2*padX;                    // 7列が入る幅
        const fixedH = padTop + 2 * CH + rowGap + padBottom;           // 上段 + 場札の先頭カード + 末尾カード分の高さ

// console.log("CW=", CW);
// console.log("\npitchMin,pitchMax=", pitchMin, pitchMax);
// console.log("wMin=", wMin);

        // 幅・高さのどちらにも収まる最大のズーム (ワールド単位/px)。カードの画面上の大きさはこれで決まる
        const sc = Math.max(wMin / w, (fixedH + spanMin) / areaH);
        const Wv = sc * w, Hv = sc * areaH; // 盤面領域のワールド上の大きさ

        // 余った幅は列の間隔へ、余った高さは場札列の縦幅へ回す
        COL_PITCH = Math.min(pitchMax, Math.max(pitchMin, (Wv - 2 * padX - CW) / 6));
        STOCK_X = colX(0); WASTE_X = colX(1);
        TAB_Y0 = -(CH + rowGap);
        MAX_SPAN = Math.min(spanMax, Math.max(spanMin, Hv - fixedH));
        // 縦に余裕があるときは、場札の重なり間隔も広げる (標準の列の縦幅 3.4CH を超えた分に比例。最大1.8倍)
        const dyK = Math.min(1.8, Math.max(1, MAX_SPAN / (CH * 3.4)));
//        DY_DOWN = CH * 0.115 * dyK; DY_UP = CH * 0.343 * dyK;
        DY_DOWN = CH * 0.05 * dyK; DY_UP = CH * 0.15 * dyK;

        // camera.orthoLeft = -Wv / 2;
        // camera.orthoRight = Wv / 2;
        camera.orthoLeft = -Wv * 0.7 * 0.5; // カメラをズームさせてカードを大きくみせる
        camera.orthoRight = Wv * 0.7 * 0.5;
        camera.orthoTop = CH / 2 + padTop + sc * barPx*0.7; // 上段のカードの上端がツールバーの padTop 下に来る
        camera.orthoBottom = camera.orthoTop - sc * h*0.7;

        placeSlots();
        if (table) table.scaling.x = table.scaling.y = Math.max(1, Math.max(Wv, sc * h) / 45);
        // 紙吹雪: 画面の上端から、画面幅いっぱいに降らせる (大きさは約 7～19px 相当)
        const u = sc / 0.0092;
        confetti.emitter.y = camera.orthoTop + 1;
        confetti.minEmitBox.x = -Wv * 0.45; confetti.maxEmitBox.x = Wv * 0.45;
        confetti.minSize = sc * 7; confetti.maxSize = sc * 19;
        confetti.gravity.y = -3 * u;
        confetti.minEmitPower = 0.5 * u; confetti.maxEmitPower = 2 * u;
        if (state) layoutAll(); // 配置が変わったので、カードの目標位置を計算し直す (なめらかに移動する)
    }
    engine.onResizeObservable.add(applyResponsive);
    applyResponsive();

    // ------------------------------------------------------------------
    // 起動
    // ------------------------------------------------------------------
    preloadImages().then(() => {
        buildCards();
        newGame(1);
    });

    return scene;
};

// ######################################################################

// ######################################################################
// ######################################################################
// ######################################################################
export var createScene = createScene_test_4005; // サイズ調整

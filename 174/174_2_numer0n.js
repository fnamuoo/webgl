/*
 * Numer0n (アイテム付き) - Babylon.js v9+ Playground (JavaScript)
 * 仕様: numer0n_rules_revised.md (第0～9章)
 *  - UIは Babylon.GUI のみ(基準 1280x720 / 3Dメッシュなし)
 *  - 全体を createScene の中に収めているので、Playground にそのまま貼り付けて実行できます
 *
 * ゲームルールは末尾添付
 */
export var createScene = function () {
    "use strict";

    // =====================================================================
    // 0. Scene / Camera / 定数
    // =====================================================================
    const GUI = BABYLON.GUI;
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromHexString("#1E1E24FF");
    new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene); // カメラが無いと描画されない

    const C = {
        panel: "#2B2B33", border: "#555560", text: "#EEEEEE",
        btn: "#3A3A46", btnOff: "#2A2A30", textOff: "#777777", sel: "#4A7BD0",
        player: "#6CB6FF", enemy: "#FFB366", warn: "#E05555", ok: "#2E8B57",
        gold: "#FFD700", gray: "#888888"
    };
    const FONT = "'Meiryo','Hiragino Kaku Gothic ProN',sans-serif";

    const ATK = ["DOUBLE", "HIGH&LOW", "SLASH", "TARGET"];
    const DEF = ["SHUFFLE", "CHANGE"];
    const ABBR = { "DOUBLE": "DBL", "HIGH&LOW": "H&L", "SLASH": "SLS", "TARGET": "TGT", "SHUFFLE": "SHF", "CHANGE": "CHG" };
    const ITEM_SHORT = {
        "DOUBLE": "CALLを2回連続で行う", "HIGH&LOW": "各桁のHIGH/LOWを聞く", "SLASH": "最大−最小を聞く",
        "TARGET": "数字の位置を聞く", "SHUFFLE": "並びを入れ替える", "CHANGE": "1桁を置き換える"
    };
    const ITEM_LONG = {
        "DOUBLE": "このターン、CALLを2回連続で行えます。2回目も外すと、自分の秘密番号の1桁を、相手の指定で開示します。",
        "HIGH&LOW": "相手の秘密番号の各桁が HIGH(5～9) か LOW(0～4) かを教えてもらいます。",
        "SLASH": "相手の秘密番号に使われている数字の、最大値−最小値を教えてもらいます。",
        "TARGET": "数字を1つ指定し、相手の秘密番号に含まれるか、含まれるなら第何桁かを教えてもらいます。",
        "SHUFFLE": "自分の秘密番号の並びを、元と異なる並びにランダムに入れ替えます。",
        "CHANGE": "自分の秘密番号の1桁を、含まれていない数字に置き換えます。桁と HIGH/LOW が相手に公開されます。"
    };

    // 7.0 難度パラメータ
    const DIFFS = {
        kids:   { label: "キッズ",   atkN: 4, defN: 2, enemyAtk: 0, enemyDef: 0, pItem: 0,    pMiss: 0.30, W: [0, 0], guard: true,  call: "random", disclose: "max",    cPlayer: 0 },
        normal: { label: "ノーマル", atkN: 2, defN: 1, enemyAtk: 1, enemyDef: 0, pItem: 0.20, pMiss: 0.20, W: [2, 3], guard: false, call: "random", disclose: "random", cPlayer: 0 },
        hard:   { label: "ハード",   atkN: 1, defN: 1, enemyAtk: 1, enemyDef: 1, pItem: 0.40, pMiss: 0,    W: [0, 0], guard: false, call: "best",   disclose: "min",    cPlayer: 6 }
    };
    // 8.1 機能の初期ON/OFF
    const FEATURE_IDS = ["F3", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "F13", "F14"];
    const FEATURE_NAMES = {
        F3: "メモ表", F5: "候補数カウンタ", F6: "確定/除外数字", F7: "候補外警告", F8: "CALL予習", F9: "候補一覧",
        F10: "提案CALL上位3件", F11: "確率ヒートマップ", F12: "アイテム期待効果", F13: "露出度メーター", F14: "防御系プレビュー"
    };
    const FEATURE_DEFAULT = {
        kids:   { F3: 1, F5: 1, F6: 1, F7: 1, F8: 1, F9: 1, F10: 1, F11: 1, F12: 1, F13: 1, F14: 1 },
        normal: { F3: 1, F5: 1, F6: 1, F7: 1, F8: 0, F9: 0, F10: 0, F11: 0, F12: 1, F13: 1, F14: 0 },
        hard:   { F3: 1, F5: 0, F6: 0, F7: 0, F8: 0, F9: 0, F10: 0, F11: 0, F12: 0, F13: 0, F14: 0 }
    };

    // =====================================================================
    // 1. 汎用ユーティリティ
    // =====================================================================
    const rnd = (k) => Math.floor(Math.random() * k);
    const rndInt = (a, b) => a + rnd(b - a + 1);
    const hlOf = (x) => (x >= 5 ? 1 : 0);
    const POP = new Uint8Array(1024);
    for (let i = 1; i < 1024; i++) POP[i] = POP[i >> 1] + (i & 1);

    function randomSecret(n) {
        const d = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = 0; i < n; i++) { const j = i + rnd(10 - i); const t = d[i]; d[i] = d[j]; d[j] = t; }
        return d.slice(0, n);
    }
    function sampleIds(ids, k) {                // ids(Int32Array)から最大k件をランダム抽出(重複なし)
        if (k >= ids.length) return ids;
        const a = Int32Array.from(ids);
        for (let i = 0; i < k; i++) { const j = i + rnd(a.length - i); const t = a[i]; a[i] = a[j]; a[j] = t; }
        return a.slice(0, k);
    }
    function fmt1(x) { return (Math.round(x * 10) / 10).toString(); }

    // =====================================================================
    // 2. 番号テーブル(nごとにキャッシュ)
    // =====================================================================
    const TABLES = {};
    function getTables(n) {
        if (TABLES[n]) return TABLES[n];
        const pow = Math.pow(10, n);
        const codes = [], digs = [], cur = [], used = new Array(10).fill(false);
        (function rec() {
            if (cur.length === n) {
                let c = 0;
                for (const d of cur) { c = c * 10 + d; digs.push(d); }
                codes.push(c);
                return;
            }
            for (let d = 0; d < 10; d++) {
                if (used[d]) continue;
                used[d] = true; cur.push(d); rec(); cur.pop(); used[d] = false;
            }
        })();
        const N = codes.length;
        const CODES = Int32Array.from(codes), DIG = Uint8Array.from(digs);
        const MASK = new Uint16Array(N), SPAN = new Uint8Array(N), HLP = new Uint8Array(N);
        const INDEX_OF = new Int32Array(pow).fill(-1);
        const maskMap = new Map();
        for (let i = 0; i < N; i++) {
            let m = 0, mx = -1, mn = 10, h = 0;
            for (let j = 0; j < n; j++) {
                const d = DIG[i * n + j];
                m |= 1 << d; if (d > mx) mx = d; if (d < mn) mn = d; if (d >= 5) h |= 1 << j;
            }
            MASK[i] = m; SPAN[i] = mx - mn; HLP[i] = h; INDEX_OF[CODES[i]] = i;
            let arr = maskMap.get(m);
            if (!arr) { arr = []; maskMap.set(m, arr); }
            arr.push(i);
        }
        return (TABLES[n] = { n, pow, N, CODES, DIG, MASK, SPAN, HLP, INDEX_OF, maskMap });
    }
    // JUDGE(g,s): キー = hit*8 + blow  (hit,blow <= 6)
    function judgeIds(T, g, s) {
        const n = T.n, gb = g * n, sb = s * n;
        let hit = 0;
        for (let j = 0; j < n; j++) if (T.DIG[gb + j] === T.DIG[sb + j]) hit++;
        return hit * 8 + (POP[T.MASK[g] & T.MASK[s]] - hit);
    }
    function idOf(T, digits) {
        let c = 0;
        for (const d of digits) c = c * 10 + d;
        return T.INDEX_OF[c];
    }
    function digitsOf(T, id) {
        const a = [];
        for (let j = 0; j < T.n; j++) a.push(T.DIG[id * T.n + j]);
        return a;
    }
    function judgeDigits(T, g, s) { return judgeIds(T, idOf(T, g), idOf(T, s)); }

    // =====================================================================
    // 3. 候補集合 CandidateSet (K_P / K_E)
    // =====================================================================
    class CandidateSet {
        constructor(T, ids) {
            this.T = T;
            this.flag = new Uint8Array(T.pow);   // 所属フラグ(長さ 10^n, 番号コードで引く)
            this.ids = new Int32Array(0);
            this.assign(ids);
        }
        static full(T) {
            const ids = new Int32Array(T.N);
            for (let i = 0; i < T.N; i++) ids[i] = i;
            return new CandidateSet(T, ids);
        }
        assign(ids) {
            this.flag.fill(0);
            for (let i = 0; i < ids.length; i++) this.flag[this.T.CODES[ids[i]]] = 1;
            this.ids = ids;
        }
        get size() { return this.ids.length; }
        hasCode(code) { return this.flag[code] === 1; }
        filter(test) {                           // test(id)=>bool
            const src = this.ids, out = new Int32Array(src.length);
            let k = 0;
            for (let i = 0; i < src.length; i++) if (test(src[i])) out[k++] = src[i];
            this.assign(out.slice(0, k));
        }
        // SHUFFLE: {x | ∃s∈K: digitSet(x)=digitSet(s) かつ x≠s}
        shuffleClosure() {
            const T = this.T, cnt = new Map();
            for (let i = 0; i < this.ids.length; i++) {
                const id = this.ids[i], m = T.MASK[id], e = cnt.get(m);
                if (!e) cnt.set(m, { c: 1, only: id }); else e.c++;
            }
            const out = [];
            for (const [m, e] of cnt) {
                const list = T.maskMap.get(m);
                for (const id of list) if (e.c >= 2 || id !== e.only) out.push(id);
            }
            this.assign(Int32Array.from(out));
        }
        // CHANGE: {replace(s,p,x) | s∈K, x∉digitSet(s), HL(x)=h}  (pは1始まり)
        changeClosure(p, h) {
            const T = this.T, n = T.n, w = Math.pow(10, n - p), seen = new Uint8Array(T.pow), out = [];
            for (let i = 0; i < this.ids.length; i++) {
                const id = this.ids[i], code = T.CODES[id], m = T.MASK[id], d = T.DIG[id * n + p - 1];
                for (let x = 0; x < 10; x++) {
                    if ((m >> x) & 1) continue;
                    if (hlOf(x) !== h) continue;
                    const nc = code + (x - d) * w;
                    if (!seen[nc]) { seen[nc] = 1; out.push(T.INDEX_OF[nc]); }
                }
            }
            this.assign(Int32Array.from(out));
        }
    }

    // ---- 情報イベント(結果) → フィルタ関数 -------------------------------
    // info: {t:'call',gid,key} | {t:'hl',hp} | {t:'span',v} | {t:'none',d} | {t:'at',p,d}
    function infoTest(T, info) {
        const n = T.n;
        switch (info.t) {
            case "call": return (id) => judgeIds(T, info.gid, id) === info.key;
            case "hl":   return (id) => T.HLP[id] === info.hp;
            case "span": return (id) => T.SPAN[id] === info.v;
            case "none": return (id) => ((T.MASK[id] >> info.d) & 1) === 0;
            case "at":   return (id) => T.DIG[id * n + info.p - 1] === info.d;
        }
        return () => true;
    }
    // 秘密番号 sec(配列)に対するアイテム結果
    function itemResult(sec, name, arg) {
        if (name === "HIGH&LOW") {
            let hp = 0;
            sec.forEach((d, j) => { if (d >= 5) hp |= 1 << j; });
            return { info: { t: "hl", hp }, text: "HIGH&LOW → " + sec.map((d, j) => "第" + (j + 1) + "桁 " + (d >= 5 ? "HIGH" : "LOW")).join("、") };
        }
        if (name === "SLASH") {
            const v = Math.max(...sec) - Math.min(...sec);
            return { info: { t: "span", v }, text: "SLASH → " + v };
        }
        if (name === "TARGET") {
            const p = sec.indexOf(arg);
            if (p < 0) return { info: { t: "none", d: arg }, text: "TARGET " + arg + " → なし" };
            return { info: { t: "at", p: p + 1, d: arg }, text: "TARGET " + arg + " → 第" + (p + 1) + "桁" };
        }
        return null;
    }

    // =====================================================================
    // 4. 分割実行スケジューラ(1フレーム最大8ms)
    // =====================================================================
    const Sched = {
        q: [],
        run(genFactory) {
            return new Promise((res) => { this.q.push({ gen: genFactory(), res }); });
        },
        pump(budgetMs) {
            const t0 = performance.now();
            while (this.q.length && performance.now() - t0 < budgetMs) {
                const job = this.q[0], r = job.gen.next();
                if (r.done) { this.q.shift(); job.res(r.value); }
            }
        }
    };
    scene.onBeforeRenderObservable.add(() => Sched.pump(8));

    // =====================================================================
    // 5. ゲーム状態
    // =====================================================================
    const ABORT = { aborted: true };
    const S = {
        gen: 0, inputRes: null, inputRej: null, waiting: false,
        features: Object.assign({}, FEATURE_DEFAULT.normal), showNumbers: false,
        cfg: { n: 4, playerFirst: true, diff: "normal", atk: [], def: [], secret: [] },
        n: 4, T: null, diff: "normal", playerFirst: true,
        playerSecret: [], enemySecret: [], playerItems: [], enemyAtk: null, enemyDef: null,
        used: { P: new Set(), E: new Set() },
        KP: null, KE: null, w: null, turnDec: false,
        round: 1, extLabel: null, extK: 0, phase: "SETUP", turnText: "",
        log: [], lastTransform: { E: -1, P: -1 },
        itemUsedThisTurn: false, callConfirmed: false, doubleActive: false, callIdx: 1,
        slots: [], selSlot: 0, memo: [], secretHidden: false,
        stats: null, f10: null, f12: {}, f10Busy: false, f12Busy: false, supportError: false,
        modals: [], enemyDouble: false
    };
    const UI = {};
    let supToken = 0;

    function sleep(ms) {
        const g = S.gen;
        return new Promise((res, rej) => setTimeout(() => (g !== S.gen ? rej(ABORT) : res()), ms));
    }
    async function runJob(factory) {
        const g = S.gen, v = await Sched.run(factory);
        if (g !== S.gen) throw ABORT;
        return v;
    }
    async function guarded(p) {
        const g = S.gen, v = await p;
        if (g !== S.gen) throw ABORT;
        return v;
    }
    function waitInput() {
        return new Promise((res, rej) => { S.inputRes = res; S.inputRej = rej; });
    }
    function provideInput(v) {
        if (!S.inputRes) return;
        const r = S.inputRes; S.inputRes = null; S.inputRej = null; r(v);
    }
    function abortGame() {
        S.gen++;
        if (S.inputRej) { const r = S.inputRej; S.inputRes = null; S.inputRej = null; r(ABORT); }
        S.waiting = false;
        closeAllModals();
        if (UI.toastRect) { UI.toastRect.dispose(); UI.toastRect = null; }
        supToken++;
    }

    // =====================================================================
    // 6. ログ(F2)
    // =====================================================================
    function renderLogEntry(e) {
        if (!e.tb) return;
        e.tb.text = (e.badge ? "[" + e.badge + "前] " : "") + e.full;
        e.tb.alpha = e.badge ? 0.5 : 1;
        e.tb.color = e.side === "P" ? C.player : C.enemy;
    }
    // side: 'P'|'E'(行動した側), target: 'E'|'P'|null(情報を与える秘密番号)
    function logLine(side, kind, text, target, info) {
        const e = { side, kind, text, target, info: info || null, badge: null, idx: S.log.length, tb: null };
        e.full = (S.extLabel || ("R" + S.round)) + " " + (side === "P" ? "PLAYER" : "ENEMY") + ": " + text;
        S.log.push(e);
        if (UI.logStack) {
            const tb = new GUI.TextBlock();
            tb.width = "360px"; tb.textWrapping = true; tb.resizeToFit = true;
            tb.paddingTop = "6px"; tb.paddingBottom = "6px"; tb.fontSize = 14;
            tb.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            e.tb = tb; renderLogEntry(e);
            UI.logStack.addControl(tb);
            setTimeout(() => { if (UI.logScroll) UI.logScroll.verticalBar.value = 1; }, 50);
        }
        return e;
    }
    // ある側のSHUFFLE/CHANGEより前にある、target がその側の秘密番号である行にバッジを付ける
    function markTransform(entry, name) {
        S.lastTransform[entry.target] = entry.idx;
        for (const e of S.log) {
            if (e !== entry && e.idx < entry.idx && e.target === entry.target) { e.badge = name; renderLogEntry(e); }
        }
    }

    // =====================================================================
    // 7. 重い計算ジョブ(ジェネレータ: Sched が1フレーム8msずつ進める)
    // =====================================================================
    function* bestGuessJob(K) {                         // ハードの最善手(7.1)
        const T = K.T, N = K.size;
        const guesses = sampleIds(K.ids, Math.min(100, N));
        const scoring = N <= 3000 ? K.ids : sampleIds(K.ids, 3000);
        let best = guesses[0], bs = Infinity, ops = 0;
        for (let gi = 0; gi < guesses.length; gi++) {
            const g = guesses[gi], cnt = new Int32Array(64);
            for (let i = 0; i < scoring.length; i++) cnt[judgeIds(T, g, scoring[i])]++;
            let s = 0;
            for (let k = 0; k < 64; k++) s += cnt[k] * cnt[k];
            if (s < bs) { bs = s; best = g; }
            ops += scoring.length;
            if (ops >= 3000) { ops = 0; yield; }
        }
        return best;
    }
    function* posEJob(K) {                              // 桁pの値でKを分割したときの E_p
        const T = K.T, n = T.n, N = K.size, ids = K.ids, res = [];
        let ops = 0;
        for (let p = 0; p < n; p++) {
            const cnt = new Int32Array(10);
            for (let i = 0; i < ids.length; i++) { cnt[T.DIG[ids[i] * n + p]]++; if (++ops >= 8192) { ops = 0; yield; } }
            let s = 0;
            for (let d = 0; d < 10; d++) s += cnt[d] * cnt[d];
            res.push(s / N);
        }
        return res;
    }
    function* targetEJob(K) {                           // 数字dの位置(なし含む)でKを分割したときの E
        const T = K.T, n = T.n, N = K.size, ids = K.ids, res = [];
        let ops = 0;
        for (let d = 0; d < 10; d++) {
            const cnt = new Int32Array(n + 1);
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                if (((T.MASK[id] >> d) & 1) === 0) cnt[0]++;
                else { for (let j = 0; j < n; j++) if (T.DIG[id * n + j] === d) { cnt[j + 1]++; break; } }
                if (++ops >= 8192) { ops = 0; yield; }
            }
            let s = 0;
            for (let k = 0; k <= n; k++) s += cnt[k] * cnt[k];
            res.push(s / N);
        }
        return res;
    }
    function* f10Job(K, tok) {                          // F10: 提案CALL上位3件(エントロピー)
        const T = K.T, N = K.size;
        const guesses = sampleIds(K.ids, Math.min(100, N));
        const scoring = N <= 3000 ? K.ids : sampleIds(K.ids, 3000);
        const M = scoring.length, out = [];
        let ops = 0;
        for (let gi = 0; gi < guesses.length; gi++) {
            if (tok !== supToken) return null;
            const g = guesses[gi], cnt = new Int32Array(64);
            for (let i = 0; i < M; i++) cnt[judgeIds(T, g, scoring[i])]++;
            let h = 0, e = 0;
            for (let k = 0; k < 64; k++) { const c = cnt[k]; if (c) { const p = c / M; h -= p * Math.log2(p); e += c * c; } }
            out.push({ id: g, h, e: (e / M) * (N / M) });
            ops += M;
            if (ops >= 3000) { ops = 0; yield; }
        }
        out.sort((a, b) => b.h - a.h || a.e - b.e);
        return out.slice(0, 3);
    }
    function* f12Job(K, top, tok) {                     // F12: 未使用の攻撃系アイテムの期待残り候補数
        const T = K.T, n = T.n, N = K.size, ids = K.ids, res = {};
        const items = S.playerItems.filter((x) => ATK.includes(x) && !S.used.P.has(x));
        let ops = 0;
        const E = (cnt) => { let s = 0; for (let k = 0; k < cnt.length; k++) s += cnt[k] * cnt[k]; return s / N; };
        if (items.includes("HIGH&LOW")) {
            const cnt = new Int32Array(1 << n);
            for (let i = 0; i < ids.length; i++) { cnt[T.HLP[ids[i]]]++; if (++ops >= 8192) { ops = 0; yield; } }
            res["HIGH&LOW"] = { e: E(cnt) };
        }
        if (items.includes("SLASH")) {
            const cnt = new Int32Array(10);
            for (let i = 0; i < ids.length; i++) { cnt[T.SPAN[ids[i]]]++; if (++ops >= 8192) { ops = 0; yield; } }
            res.SLASH = { e: E(cnt) };
        }
        if (items.includes("TARGET")) {
            let bestE = Infinity, bestD = 0;
            for (let d = 0; d < 10; d++) {
                if (tok !== supToken) return null;
                const cnt = new Int32Array(n + 1);
                for (let i = 0; i < ids.length; i++) {
                    const id = ids[i];
                    if (((T.MASK[id] >> d) & 1) === 0) cnt[0]++;
                    else { for (let j = 0; j < n; j++) if (T.DIG[id * n + j] === d) { cnt[j + 1]++; break; } }
                    if (++ops >= 8192) { ops = 0; yield; }
                }
                const e = E(cnt);
                if (e < bestE) { bestE = e; bestD = d; }
            }
            res.TARGET = { e: bestE, d: bestD };
        }
        if (items.includes("DOUBLE") && top) {
            const cnt = new Int32Array(64);
            for (let i = 0; i < ids.length; i++) { cnt[judgeIds(T, top.id, ids[i])]++; if (++ops >= 8192) { ops = 0; yield; } }
            res.DOUBLE = { e: E(cnt) };
        }
        return res;
    }
    function* f8Job(K, callDigits) {                    // F8: 作成中のCALLの結果別件数
        const T = K.T, ids = K.ids, g = idOf(T, callDigits), cnt = new Int32Array(64);
        let ops = 0;
        for (let i = 0; i < ids.length; i++) { cnt[judgeIds(T, g, ids[i])]++; if (++ops >= 8192) { ops = 0; yield; } }
        return { cnt, inK: K.hasCode(T.CODES[g]), N: K.size };
    }
    function fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
    function* f14ShuffleJob(K) {                        // |K_E'| (SHUFFLE)
        const T = K.T, cnt = new Map();
        let ops = 0;
        for (let i = 0; i < K.ids.length; i++) {
            const m = T.MASK[K.ids[i]];
            cnt.set(m, (cnt.get(m) || 0) + 1);
            if (++ops >= 8192) { ops = 0; yield; }
        }
        let total = 0;
        for (const [, c] of cnt) total += c >= 2 ? fact(T.n) : fact(T.n) - 1;
        return total;
    }
    function* f14ChangeJob(K, p, h) {                   // |K_E'| (CHANGE)
        const T = K.T, n = T.n, w = Math.pow(10, n - p), seen = new Uint8Array(T.pow);
        let count = 0, ops = 0;
        for (let i = 0; i < K.ids.length; i++) {
            const id = K.ids[i], code = T.CODES[id], m = T.MASK[id], d = T.DIG[id * n + p - 1];
            for (let x = 0; x < 10; x++) {
                if ((m >> x) & 1) continue;
                if (hlOf(x) !== h) continue;
                const nc = code + (x - d) * w;
                if (!seen[nc]) { seen[nc] = 1; count++; }
            }
            if (++ops >= 2048) { ops = 0; yield; }
        }
        return count;
    }

    // =====================================================================
    // 8. 候補集合の更新とサポート再計算
    // =====================================================================
    function updateW() {
        const D = DIFFS[S.diff];
        if (S.KE.size === 1) { if (S.w == null) S.w = rndInt(D.W[0], D.W[1]); } else S.w = null;
    }
    function onKChanged() {
        updateW();
        refreshSupport();
        updateStatus();
        updateExpose();
    }

    // =====================================================================
    // 9. アイテム・CALL の処理(PLAYER側)
    // =====================================================================
    function shuffledDiff(arr) {
        let a;
        do {
            a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; }
        } while (a.every((v, i) => v === arr[i]));
        return a;
    }
    function applyPlayerItem(act) {
        const name = act.name, T = S.T;
        S.used.P.add(name); S.itemUsedThisTurn = true;
        if (name === "DOUBLE") {
            S.doubleActive = true; S.callIdx = 1;
            logLine("P", "item", "DOUBLE 使用", null);
            toast("DOUBLE: このターンはCALLを2回行えます");
        } else if (ATK.includes(name)) {
            const r = itemResult(S.enemySecret, name, act.arg);
            logLine("P", "item", r.text, "E", r.info);
            S.KP.filter(infoTest(T, r.info));
            toast(r.text);
        } else if (name === "SHUFFLE") {
            S.playerSecret = shuffledDiff(S.playerSecret);
            S.KE.shuffleClosure();
            const e = logLine("P", "transform", "SHUFFLE 使用", "P");
            markTransform(e, "SHUFFLE");
            flashExpose(null);
            toast("SHUFFLE: 秘密番号の並びを入れ替えました");
        } else if (name === "CHANGE") {
            const p = act.pos, x = act.digit;
            S.playerSecret[p - 1] = x;
            S.KE.changeClosure(p, hlOf(x));
            const e = logLine("P", "transform", "CHANGE → 第" + p + "桁を " + (hlOf(x) ? "HIGH" : "LOW") + " の数字に変更", "P");
            markTransform(e, "CHANGE");
            flashExpose(p - 1);
            toast("CHANGE: 第" + p + "桁を変更しました");
        }
        onKChanged();
    }
    function processPlayerCall(g) {
        const T = S.T, n = S.n;
        const key = judgeDigits(T, g, S.enemySecret), h = key >> 3, b = key & 7;
        const info = { t: "call", gid: idOf(T, g), key };
        logLine("P", "call", g.join("") + " → " + h + "H " + b + "B", "E", info);
        S.KP.filter(infoTest(T, info));
        onKChanged();
        return h === n;
    }

    // =====================================================================
    // 10. ENEMY の選択規則(7.4)とターン処理(7.2)
    // =====================================================================
    async function enemyChooseDisclosePos() {            // PLAYERのDOUBLE失敗時、PLAYERに開示させる桁
        const D = DIFFS[S.diff], n = S.n;
        if (D.disclose === "random") return 1 + rnd(n);
        const E = await runJob(() => posEJob(S.KE));
        let best = 0;
        for (let p = 1; p < n; p++) if (D.disclose === "min" ? E[p] < E[best] : E[p] > E[best]) best = p;
        return best + 1;
    }
    async function enemyChooseTarget() {                 // ENEMYのTARGETの数字
        if (S.diff === "hard") {
            const E = await runJob(() => targetEJob(S.KE));
            let best = 0;
            for (let d = 1; d < 10; d++) if (E[d] < E[best]) best = d;
            return best;
        }
        const T = S.T, K = S.KE;
        let mask = 0;
        for (let i = 0; i < K.ids.length; i++) mask |= T.MASK[K.ids[i]];
        const ds = [];
        for (let d = 0; d < 10; d++) if ((mask >> d) & 1) ds.push(d);
        return ds[rnd(ds.length)];
    }
    function missCall() {
        const K = S.KE, T = S.T;
        for (;;) {
            const g = randomSecret(S.n);
            if (K.size === 1 && idOf(T, g) === K.ids[0]) continue;
            return g;
        }
    }
    function guardFix(g) {                               // WIN_GUARD: PLAYERの秘密番号と一致するCALLを差し替える
        const T = S.T, K = S.KE, sid = idOf(T, S.playerSecret);
        if (idOf(T, g) !== sid) return g;
        if (K.size >= 2) {
            for (;;) { const id = K.ids[rnd(K.size)]; if (id !== sid) return digitsOf(T, id); }
        }
        for (;;) { const c = randomSecret(S.n); if (idOf(T, c) !== sid) return c; }
    }
    async function enemyDecideCall(ctx, callIdx) {
        const D = DIFFS[S.diff], K = S.KE, T = S.T;
        if (D.guard && ctx.playerCorrectFirst) return digitsOf(T, K.ids[rnd(K.size)]);   // 例外: 意図的に外さない
        let g;
        if (Math.random() < D.pMiss) g = missCall();
        else if (K.size === 1) {
            if (S.w >= 1) {
                if (callIdx === 1 && !S.turnDec) { S.w--; S.turnDec = true; }
                g = missCall();
            } else g = digitsOf(T, K.ids[0]);
        } else if (D.call === "best") g = digitsOf(T, await runJob(() => bestGuessJob(K)));
        else g = digitsOf(T, K.ids[rnd(K.size)]);
        if (D.guard) g = guardFix(g);
        return g;
    }
    async function enemyUseItem(name) {
        const T = S.T;
        S.used.E.add(name);
        if (name === "DOUBLE") {
            S.enemyDouble = true;
            logLine("E", "item", "DOUBLE 使用", null);
            toast("ENEMY: DOUBLE を使用");
        } else if (ATK.includes(name)) {
            const arg = name === "TARGET" ? await enemyChooseTarget() : undefined;
            const r = itemResult(S.playerSecret, name, arg);
            logLine("E", "item", r.text, "P", r.info);
            S.KE.filter(infoTest(T, r.info));
            toast("ENEMY: " + r.text);
        } else if (name === "SHUFFLE") {
            S.enemySecret = shuffledDiff(S.enemySecret);
            S.KP.shuffleClosure();
            const e = logLine("E", "transform", "SHUFFLE 使用", "E");
            markTransform(e, "SHUFFLE");
            toast("ENEMY: SHUFFLE を使用");
        } else if (name === "CHANGE") {
            const p = 1 + rnd(S.n), unused = [];
            for (let d = 0; d < 10; d++) if (!S.enemySecret.includes(d)) unused.push(d);
            const x = unused[rnd(unused.length)];
            S.enemySecret[p - 1] = x;
            S.KP.changeClosure(p, hlOf(x));
            const e = logLine("E", "transform", "CHANGE → 第" + p + "桁を " + (hlOf(x) ? "HIGH" : "LOW") + " の数字に変更", "E");
            markTransform(e, "CHANGE");
            toast("ENEMY: CHANGE を使用");
        }
        onKChanged();
    }
    async function enemyTurn(ctx) {
        const D = DIFFS[S.diff], T = S.T, n = S.n;
        S.phase = "E_ITEM"; S.turnDec = false; S.enemyDouble = false; S.waiting = false;
        S.turnText = "ENEMYのターン"; refreshActions(); updateStatus();
        await sleep(800);
        // 7.2 手順1: アイテム使用判定(最大1個、上から順に評価)
        let item = null;
        const K = S.KE;
        if (D.enemyDef > 0 && S.enemyDef && !S.used.E.has(S.enemyDef) && S.KP.size <= D.cPlayer && !(K.size === 1 && S.w === 0)) item = S.enemyDef;
        else if (D.enemyAtk > 0 && S.enemyAtk && !S.used.E.has(S.enemyAtk) && K.size >= 2 && Math.random() < D.pItem) item = S.enemyAtk;
        if (item) { await enemyUseItem(item); updateStatus(); await sleep(800); }
        // 手順2: CALL
        S.phase = "E_CALL"; updateStatus();
        await sleep(800);
        const calls = item === "DOUBLE" ? 2 : 1;
        let correct = false;
        for (let c = 1; c <= calls; c++) {
            const g = await enemyDecideCall(ctx, c);
            S.phase = "E_JUDGE";
            const key = judgeDigits(T, g, S.playerSecret), h = key >> 3, b = key & 7;
            const info = { t: "call", gid: idOf(T, g), key };
            logLine("E", "call", g.join("") + " → " + h + "H " + b + "B", "P", info);
            S.KE.filter(infoTest(T, info));
            onKChanged();
            correct = h === n;
            await sleep(1200);
            if (correct) return true;
        }
        if (calls === 2) {                               // DOUBLEの2回目失敗: PLAYERが開示させる桁を選ぶ
            S.phase = "E_DISCLOSE"; refreshActions();
            const p = await guarded(openDiscloseDialog());
            const d = S.enemySecret[p - 1], info = { t: "at", p, d };
            logLine("E", "disclose", "DOUBLE失敗 → 第" + p + "桁=" + d + " を開示", "E", info);
            S.KP.filter(infoTest(T, info));
            onKChanged();
            toast("ENEMYが第" + p + "桁=" + d + " を開示しました");
            await sleep(800);
        }
        return false;
    }

    // =====================================================================
    // 11. PLAYER のターン(9.1 P_ACTION～P_DISCLOSE)
    // =====================================================================
    async function playerTurn(ext) {
        S.phase = "P_ACTION"; S.itemUsedThisTurn = false; S.callConfirmed = false;
        S.doubleActive = false; S.callIdx = 1;
        S.turnText = ext ? "追加ターン " + S.extK + "/3" : "あなたのターン";
        updateStatus();
        for (;;) {
            S.phase = "P_ACTION"; S.waiting = true; refreshActions();
            const act = await waitInput();
            S.waiting = false;
            if (act.type === "item") { applyPlayerItem(act); continue; }
            S.callConfirmed = true; S.phase = "P_JUDGE";
            clearSlots(); refreshActions();
            const correct = processPlayerCall(act.digits);
            await sleep(correct ? 600 : 1200);
            if (correct) return true;
            if (S.doubleActive && S.callIdx === 1) { S.callIdx = 2; continue; }
            if (S.doubleActive && !ext) {                // P_DISCLOSE: ENEMYが開示させる桁を決める
                S.phase = "P_DISCLOSE"; refreshActions();
                const p = await enemyChooseDisclosePos(), d = S.playerSecret[p - 1];
                const info = { t: "at", p, d };
                logLine("P", "disclose", "DOUBLE失敗 → 第" + p + "桁=" + d + " を開示", "P", info);
                S.KE.filter(infoTest(S.T, info));
                onKChanged();
                toast("第" + p + "桁=" + d + " をENEMYに開示しました");
                flashExpose(p - 1);
                await sleep(800);
            }
            return false;
        }
    }

    // =====================================================================
    // 12. ゲーム進行(第3章)
    // =====================================================================
    function newGameState(cfg) {
        const n = cfg.n, T = getTables(n), D = DIFFS[cfg.diff];
        S.n = n; S.T = T; S.diff = cfg.diff; S.playerFirst = cfg.playerFirst;
        S.playerSecret = cfg.secret.slice(); S.enemySecret = randomSecret(n);
        S.playerItems = cfg.diff === "kids" ? ATK.concat(DEF) : cfg.atk.concat(cfg.def);
        S.enemyAtk = D.enemyAtk ? ATK[rnd(ATK.length)] : null;
        S.enemyDef = D.enemyDef ? DEF[rnd(DEF.length)] : null;
        S.used = { P: new Set(), E: new Set() };
        S.KP = CandidateSet.full(T); S.KE = CandidateSet.full(T);
        S.w = null; S.round = 1; S.extLabel = null; S.extK = 0; S.log = []; S.lastTransform = { E: -1, P: -1 };
        S.itemUsedThisTurn = false; S.callConfirmed = false; S.doubleActive = false; S.callIdx = 1;
        S.slots = new Array(n).fill(-1); S.selSlot = 0; S.secretHidden = false;
        S.memo = []; for (let d = 0; d < 10; d++) S.memo.push(new Array(n + 1).fill(0));
        S.stats = null; S.f10 = null; S.f12 = {}; S.supportError = false; S.phase = "SETUP";
    }
    async function runGame() {
        const myGen = S.gen;
        try {
            let winner = null;
            for (;;) {
                const first = S.playerFirst ? "P" : "E", second = first === "P" ? "E" : "P";
                const flags = { P: false, E: false };
                S.extLabel = null;
                for (const side of [first, second]) {
                    if (side === "P") flags.P = await playerTurn(false);
                    else flags.E = await enemyTurn({ playerCorrectFirst: first === "P" && flags.P });
                }
                if (flags.P && flags.E) winner = "D";
                else if (flags.P) winner = "P";
                else if (flags.E) winner = "E";
                if (winner) break;
                S.round++; updateStatus();
            }
            let extNote = "";
            if (winner === "E") {                        // 3.6 追加ターン(結果は敗北のまま)
                let hit = false;
                for (let k = 1; k <= 3; k++) {
                    S.extK = k; S.extLabel = "EX" + k;
                    if (await playerTurn(true)) { hit = true; break; }
                }
                S.extLabel = null;
                extNote = hit ? "追加ターンで正解しました(結果は敗北のまま)" : "追加ターン3回では正解できませんでした";
            }
            if (myGen !== S.gen) return;
            S.phase = "RESULT"; S.waiting = false; S.turnText = "結果"; refreshActions(); updateStatus();
            openResultDialog(winner, extNote);
        } catch (e) {
            if (e !== ABORT) console.error(e);
        }
    }

    // =====================================================================
    // 13. UI 基盤 (Babylon.GUI)  - 基準 1280x720 のルートコンテナ
    // =====================================================================
    const adt = GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, scene);
    adt.idealWidth = 1280; adt.idealHeight = 720; adt.useSmallestIdeal = true;   // 両方の理想サイズが必要
    const HA = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT, VA = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    const root = new GUI.Rectangle("root");
    root.width = "1280px"; root.height = "720px"; root.thickness = 0; root.background = "transparent";
    root.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    root.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    root.fontFamily = FONT; root.fontSize = 14;
    adt.addControl(root);
    UI.root = root;

    function place(c, x, y, w, h) {
        c.horizontalAlignment = HA; c.verticalAlignment = VA;
        c.left = x + "px"; c.top = y + "px";
        if (w != null) c.width = w + "px";
        if (h != null) c.height = h + "px";
        return c;
    }
    function rect(parent, x, y, w, h, bg, border, bw) {
        const r = new GUI.Rectangle();
        place(r, x, y, w, h);
        r.background = bg || "transparent"; r.thickness = bw || 0;
        if (border) r.color = border;
        if (parent) parent.addControl(r);
        return r;
    }
    function text(parent, str, x, y, w, h, size, color, align) {
        const t = new GUI.TextBlock();
        place(t, x, y, w, h);
        t.text = str; t.fontSize = size || 14; t.color = color || C.text;
        t.textHorizontalAlignment = align === "center" ? GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
            : align === "right" ? GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT : GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        t.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        if (parent) parent.addControl(t);
        return t;
    }
    function styleBtn(b, o) {
        if (o.bg !== undefined) b._bg = o.bg;
        if (o.border !== undefined) b._border = o.border;
        if (o.bw !== undefined) b._bw = o.bw;
        if (o.en !== undefined) b._en = o.en;
        if (o.keepBg !== undefined) b._keepBg = o.keepBg;
        const en = b._en !== false;
        b.isEnabled = en;
        b.background = (!en && !b._keepBg) ? C.btnOff : b._bg;
        b.color = b._border; b.thickness = b._bw;
        b.textBlock.color = en ? C.text : C.textOff;
        if (o.label !== undefined) b.textBlock.text = o.label;
    }
    function button(parent, label, x, y, w, h, onClick, opt) {
        opt = opt || {};
        const b = GUI.Button.CreateSimpleButton("btn", label);
        if (w != null) place(b, x, y, w, h);
        b.cornerRadius = 4;
        b.textBlock.fontSize = opt.size || 14;
        b.pointerEnterAnimation = () => {}; b.pointerOutAnimation = () => {};
        b.pointerDownAnimation = () => {}; b.pointerUpAnimation = () => {};
        b._en = true;
        styleBtn(b, { bg: opt.bg || C.btn, border: opt.border || C.border, bw: opt.bw === undefined ? 1 : opt.bw, keepBg: !!opt.keepBg });
        b.onPointerUpObservable.add(() => { if (!b.isEnabled) return; const fn = b._click || onClick; if (fn) fn(); });
        if (parent) parent.addControl(b);
        return b;
    }
    function checkbox(parent, x, y, checked, onChange) {
        const cb = new GUI.Checkbox();
        place(cb, x, y, 20, 20);
        cb.isChecked = checked; cb.color = C.text; cb.background = C.btn;
        cb.onIsCheckedChangedObservable.add((v) => onChange(v));
        parent.addControl(cb);
        return cb;
    }

    // ---- モーダル(全面オーバーレイ + ダイアログ本体) ----------------------
    function openModal(x, y, w, h) {
        const ov = new GUI.Rectangle();
        place(ov, 0, 0, 1280, 720);
        ov.background = "rgba(0,0,0,0.5)"; ov.thickness = 0; ov.isPointerBlocker = true;
        root.addControl(ov);
        const dlg = rect(root, x, y, w, h, C.panel, C.border, 2);
        const m = { ov, dlg, close() { ov.dispose(); dlg.dispose(); S.modals = S.modals.filter((q) => q !== m); refreshActions(); } };
        S.modals.push(m);
        return m;
    }
    function closeAllModals() { S.modals.slice().forEach((m) => { m.ov.dispose(); m.dlg.dispose(); }); S.modals = []; }
    function toast(msg) {
        if (UI.toastRect) UI.toastRect.dispose();
        const g = S.gen, r = rect(root, 480, 64, 320, 40, "rgba(0,0,0,0.85)", C.border, 1);
        text(r, msg, 4, 0, 312, 40, 13, C.text, "center").textWrapping = true;
        UI.toastRect = r;
        setTimeout(() => { if (g === S.gen && UI.toastRect === r) { r.dispose(); UI.toastRect = null; } }, 2000);
    }

    // =====================================================================
    // 14. 準備画面 (9.2)
    // =====================================================================
    function resetCfg(keepSettings) {
        const c = S.cfg;
        if (!keepSettings) { c.n = 4; c.playerFirst = true; c.diff = "normal"; c.atk = []; c.def = []; S.features = Object.assign({}, FEATURE_DEFAULT.normal); }
        c.secret = new Array(c.n).fill(-1); c.sel = 0;
    }
    function buildSetup() {
        if (UI.setup) UI.setup.dispose();
        const setup = rect(root, 0, 0, 1280, 720, "transparent");
        UI.setup = setup;
        const P = rect(setup, 160, 20, 960, 680, C.panel, C.border, 2);
        const c = S.cfg;
        text(P, "Numer0n", 0, 8, 960, 40, 28, C.text, "center");
        const lab = (s, y, h) => text(P, s, 40, y - 20, 160, h || 48, 16, C.text);
        // n
        lab("桁数 n", 84);
        UI.sN = [3, 4, 5, 6].map((n, i) => button(P, String(n), 220 + i * 112, 64, 100, 48, () => {
            c.n = n; c.secret = new Array(n).fill(-1); c.sel = 0; refreshSetup();
        }, { size: 20 }));
        // 先攻/後攻
        lab("先攻/後攻", 144);
        UI.sOrder = [["先攻", true], ["後攻", false]].map(([s, v], i) => button(P, s, 220 + i * 162, 124, 150, 48, () => { c.playerFirst = v; refreshSetup(); }, { size: 18 }));
        // 難度
        lab("難度", 204);
        UI.sDiff = ["kids", "normal", "hard"].map((k, i) => button(P, DIFFS[k].label, 220 + i * 162, 184, 150, 48, () => {
            c.diff = k;
            S.features = Object.assign({}, FEATURE_DEFAULT[k]);
            c.atk = k === "kids" ? ATK.slice() : []; c.def = k === "kids" ? DEF.slice() : [];
            refreshSetup();
        }, { size: 18 }));
        // アイテム
        lab("アイテム", 268, 44);
        UI.sAtk = ATK.map((nm, i) => button(P, nm, 220 + i * 162, 248, 150, 44, () => toggleItem("atk", nm), { size: 16 }));
        UI.sDef = DEF.map((nm, i) => button(P, nm, 220 + i * 162, 300, 150, 44, () => toggleItem("def", nm), { size: 16 }));
        UI.sDesc = text(P, "", 220, 352, 700, 28, 12, C.gray);
        // 秘密番号
        lab("秘密番号", 412, 64);
        UI.sSlotHost = rect(P, 244, 392, 700, 64, "transparent");
        UI.sSlots = [];
        UI.sDigits = [];
        for (let d = 0; d < 10; d++) {
            UI.sDigits.push(button(P, String(d), 244 + (d % 5) * 96, 464 + Math.floor(d / 5) * 52, 88, 44, () => {
                const idx = c.sel;
                c.secret[idx] = d;
                const nx = c.secret.findIndex((v, i) => v < 0 && i > idx);
                c.sel = nx >= 0 ? nx : (c.secret.findIndex((v) => v < 0) >= 0 ? c.secret.findIndex((v) => v < 0) : idx);
                refreshSetup();
            }, { size: 20 }));
        }
        button(P, "ランダム", 740, 464, 120, 44, () => { c.secret = randomSecret(c.n); c.sel = c.n - 1; refreshSetup(); });
        button(P, "クリア", 740, 516, 120, 44, () => { c.secret = new Array(c.n).fill(-1); c.sel = 0; refreshSetup(); });
        UI.sStart = button(P, "開始", 320, 600, 320, 56, () => startGame(), { size: 22 });
        resetCfg(true);
        refreshSetup();
    }
    function toggleItem(kind, nm) {
        const c = S.cfg, D = DIFFS[c.diff];
        if (c.diff === "kids") return;
        const max = kind === "atk" ? D.atkN : D.defN, arr = c[kind], i = arr.indexOf(nm);
        if (i >= 0) arr.splice(i, 1);
        else { if (arr.length >= max) { if (max === 1) arr.length = 0; else return; } arr.push(nm); }
        refreshSetup();
    }
    function refreshSetup() {
        const c = S.cfg, D = DIFFS[c.diff];
        [3, 4, 5, 6].forEach((n, i) => styleBtn(UI.sN[i], { bg: c.n === n ? C.sel : C.btn }));
        [true, false].forEach((v, i) => styleBtn(UI.sOrder[i], { bg: c.playerFirst === v ? C.sel : C.btn }));
        ["kids", "normal", "hard"].forEach((k, i) => styleBtn(UI.sDiff[i], { bg: c.diff === k ? C.sel : C.btn }));
        const kids = c.diff === "kids";
        ATK.forEach((nm, i) => styleBtn(UI.sAtk[i], { bg: c.atk.includes(nm) ? C.sel : C.btn, keepBg: true }));
        DEF.forEach((nm, i) => styleBtn(UI.sDef[i], { bg: c.def.includes(nm) ? C.sel : C.btn, keepBg: true }));
        UI.sDesc.text = kids ? "キッズ: 全6種を持ち込みます(各1回、1ターン1個まで)"
            : "選択: 攻撃系 " + c.atk.length + "/" + D.atkN + "、防御系 " + c.def.length + "/" + D.defN + (D.atkN === 2 ? "(上限に達したら外してから選び直し)" : "(選び直すと入れ替わります)");
        // 秘密番号スロット(nが変わったら作り直す)
        if (UI.sSlots.length !== c.n) {
            UI.sSlots.forEach((b) => b.dispose());
            UI.sSlots = [];
            for (let i = 0; i < c.n; i++) {
                UI.sSlots.push(button(UI.sSlotHost, "", i * 72, 0, 64, 64, () => { c.secret[i] = -1; c.sel = i; refreshSetup(); }, { size: 28 }));
            }
        }
        UI.sSlots.forEach((b, i) => styleBtn(b, { bg: i === c.sel ? C.sel : C.btn, label: c.secret[i] >= 0 ? String(c.secret[i]) : "" }));
        UI.sDigits.forEach((b, d) => styleBtn(b, { en: !c.secret.includes(d) }));
        const itemsOk = kids || (c.atk.length === D.atkN && c.def.length === D.defN);
        styleBtn(UI.sStart, { en: itemsOk && c.secret.every((v) => v >= 0) });
    }

    // =====================================================================
    // 15. ゲーム画面の構築 (8.2 / 9.7)
    // =====================================================================
    const MEMO_SYM = ["　", "？", "○", "×"];
    function buildGame() {
        if (UI.game) UI.game.dispose();
        const n = S.n;
        const g = rect(root, 0, 0, 1280, 720, "transparent");
        UI.game = g;
        // 画面レイアウト: setup より手前に出す必要はないが、モーダル/トーストより後ろにするため setup の直後へ
        // ---- R_STATUS (F1) ----
        const st = rect(g, 0, 0, 1280, 56, C.panel, C.border, 1);
        const xs = [0, 140, 280, 400, 620, 910], ws = [140, 140, 120, 220, 290, 290];
        UI.stDiff = text(st, "", xs[0] + 6, 0, ws[0] - 8, 54);
        UI.stFirst = text(st, "", xs[1] + 6, 0, ws[1] - 8, 54);
        UI.stRound = text(st, "", xs[2] + 6, 0, ws[2] - 8, 54);
        UI.stTurn = text(st, "", xs[3] + 6, 0, ws[3] - 8, 54, 16, C.gold);
        UI.stP = text(st, "", xs[4] + 6, 0, ws[4] - 8, 54, 12); UI.stP.textWrapping = true;
        UI.stE = text(st, "", xs[5] + 6, 0, ws[5] - 8, 54, 12); UI.stE.textWrapping = true;
        UI.btnSettings = button(st, "設定", 1200, 9, 70, 36, () => openSettings());
        // ---- R_LOG (F2) ----
        const sv = new GUI.ScrollViewer("log");
        place(sv, 0, 56, 380, 520);
        sv.barSize = 10; sv.background = C.panel; sv.thickness = 1; sv.color = C.border;
        g.addControl(sv);
        const stack = new GUI.StackPanel();
        stack.isVertical = true; stack.width = "360px";
        sv.addControl(stack);
        UI.logScroll = sv; UI.logStack = stack;
        // ---- R_WORK (F4, F7) ----
        const wk = rect(g, 380, 56, 520, 300, C.panel, C.border, 1);
        UI.work = wk;
        UI.dblLabel = text(wk, "", 24, 76, 220, 24, 14, C.gold);
        UI.f7Label = text(wk, "", 250, 76, 250, 24, 14, C.text, "right");
        UI.slotBtns = [];
        const sx0 = Math.round((520 - (n * 64 + (n - 1) * 8)) / 2);
        for (let i = 0; i < n; i++) UI.slotBtns.push(button(wk, "", sx0 + i * 72, 8, 64, 64, () => onSlotTap(i), { size: 28, keepBg: true }));
        UI.digitBtns = [];
        for (let d = 0; d < 10; d++) {
            UI.digitBtns.push(button(wk, String(d), 24 + (d % 5) * 96, 104 + Math.floor(d / 5) * 64, 88, 56, () => onDigitTap(d), { size: 24, keepBg: true }));
        }
        UI.btnClear = button(wk, "クリア", 0, 236, 140, 48, () => clearSlots());
        UI.btnConfirm = button(wk, "確定", 0, 236, 140, 48, () => onConfirm(), { bg: C.sel });
        UI.btnPreview = button(wk, "予習", 0, 236, 140, 48, () => openPreview());
        // ---- R_SUGGEST (F5, F9, F10) ----
        const sg = rect(g, 380, 356, 520, 220, C.panel, C.border, 1);
        UI.sugg = sg;
        UI.f5Group = rect(sg, 0, 0, 518, 32, "transparent");
        UI.f5Text = text(UI.f5Group, "", 8, 2, 500, 20, 14);
        rect(UI.f5Group, 8, 24, 500, 6, "#444450");
        UI.f5Bar = rect(UI.f5Group, 8, 24, 4, 6, C.sel);
        UI.f9Group = rect(sg, 0, 32, 260, 186, "transparent");
        text(UI.f9Group, "候補一覧(近似)", 8, 0, 244, 16, 12, C.gray);
        UI.f9Rows = [];
        for (let i = 0; i < 6; i++) UI.f9Rows.push(button(UI.f9Group, "", 4, 16 + i * 28, 252, 26, null, { size: 14 }));
        UI.f10Group = rect(sg, 260, 32, 258, 186, "transparent");
        text(UI.f10Group, "提案CALL上位3件(近似)", 8, 0, 244, 16, 12, C.gray);
        UI.f10Rows = [];
        for (let i = 0; i < 3; i++) {
            const r = rect(UI.f10Group, 4, 16 + i * 56, 250, 52, C.btn, C.border, 1);
            const t1 = text(r, "", 8, 2, 236, 26, 16), t2 = text(r, "", 8, 28, 236, 22, 12, C.gray);
            r.onPointerUpObservable.add(() => { if (r._ids && S.waiting && S.phase === "P_ACTION") setSlots(r._ids); });
            UI.f10Rows.push({ r, t1, t2 });
        }
        UI.errText = text(sg, "", 8, 4, 500, 24, 14, C.warn);
        // ---- R_MEMO (F3, F6, F11) ----
        const mm = rect(g, 900, 56, 380, 360, C.panel, C.border, 1);
        UI.memoPanel = mm;
        const cw = 380 / (n + 2);
        const grid = new GUI.Grid();
        place(grid, 0, 0, 380, 330);
        for (let c = 0; c < n + 2; c++) grid.addColumnDefinition(cw, true);
        for (let r = 0; r < 11; r++) grid.addRowDefinition(30, true);
        mm.addControl(grid);
        UI.memoCells = [];
        const hdr = (s, r, c, size) => { const t = new GUI.TextBlock(); t.text = s; t.fontSize = size || 12; t.color = C.gray; grid.addControl(t, r, c); return t; };
        UI.memoHeadNote = hdr("", 0, 0, 10);
        for (let j = 0; j < n; j++) hdr((j + 1) + "桁", 0, j + 1);
        hdr("含む", 0, n + 1);
        for (let d = 0; d < 10; d++) {
            const lb = hdr(String(d), d + 1, 0, 16); lb.color = C.text;
            const row = [];
            for (let j = 0; j <= n; j++) {
                const b = GUI.Button.CreateSimpleButton("btn", "");
                b.cornerRadius = 0; b.textBlock.fontSize = 14;
                b.pointerEnterAnimation = () => {}; b.pointerOutAnimation = () => {}; b.pointerDownAnimation = () => {}; b.pointerUpAnimation = () => {};
                b._en = true;
                styleBtn(b, { bg: C.btn, border: C.border, bw: 1 });
                b.onPointerUpObservable.add(() => { S.memo[d][j] = (S.memo[d][j] + 1) % 4; updateMemo(); });
                grid.addControl(b, d + 1, j + 1);
                row.push(b);
            }
            UI.memoCells.push(row);
        }
        UI.grid = grid;
        UI.f6Text = text(mm, "", 4, 330, 372, 28, 12, C.text);
        UI.f6Text.textWrapping = true;
        // ---- R_EXPOSE (秘密番号表示, F13) ----
        const ex = rect(g, 900, 416, 380, 160, C.panel, C.border, 1);
        UI.expose = ex;
        UI.exCells = [];
        const ex0 = Math.round((380 - (n * 56 + (n - 1) * 6)) / 2);
        for (let i = 0; i < n; i++) {
            const r = rect(ex, ex0 + i * 62, 8, 56, 56, C.btn, C.border, 2);
            UI.exCells.push({ r, t: text(r, "", 0, 0, 52, 52, 28, C.text, "center") });
        }
        UI.btnHide = button(ex, "表示/非表示", 8, 70, 100, 32, () => { S.secretHidden = !S.secretHidden; updateExpose(); });
        UI.f13Group = rect(ex, 0, 108, 378, 44, "transparent");
        UI.f13Text = text(UI.f13Group, "", 8, 0, 360, 22, 13);
        rect(UI.f13Group, 8, 28, 360, 6, "#444450");
        UI.f13Bar = rect(UI.f13Group, 8, 28, 4, 6, C.warn);
        // ---- R_ITEM (F12) ----
        const it = rect(g, 0, 576, 1280, 144, C.panel, C.border, 1);
        UI.itemPanel = it;
        UI.f12Head = text(it, "アイテム  F12: 期待残り候補数(一様仮定)", 8, 2, 600, 16, 12, C.gray);
        UI.cards = {};
        const items = S.playerItems, k = items.length, ix0 = Math.round((1280 - (k * 200 + (k - 1) * 8)) / 2);
        items.forEach((nm, i) => {
            const r = rect(it, ix0 + i * 208, 20, 200, 120, C.btn, C.border, 1);
            text(r, nm, 8, 4, 184, 24, 16, C.text);
            text(r, ITEM_SHORT[nm], 8, 28, 184, 22, 12, C.gray);
            const f12 = text(r, "", 8, 52, 184, 40, 12, C.text); f12.textWrapping = true;
            const stt = text(r, "", 8, 94, 184, 22, 12, C.text);
            r.onPointerUpObservable.add(() => { if (canUseItem(nm)) openItemDialog(nm); });
            UI.cards[nm] = { r, f12, stt };
        });
        // 初期表示
        applyFeatureVisibility();
        updateAll();
    }

    // =====================================================================
    // 16. F4: スロットと数字パネル
    // =====================================================================
    function accepting() { return S.waiting && S.phase === "P_ACTION"; }
    function updateSlots() {
        if (!UI.slotBtns) return;
        UI.slotBtns.forEach((b, i) => styleBtn(b, { bg: i === S.selSlot ? C.sel : C.btn, label: S.slots[i] >= 0 ? String(S.slots[i]) : "" }));
        refreshActions();
        updateF7();
    }
    function onDigitTap(d) {
        if (!accepting() || S.slots.includes(d)) return;
        S.slots[S.selSlot] = d;
        let nx = S.slots.findIndex((v, i) => v < 0 && i > S.selSlot);
        if (nx < 0) nx = S.slots.findIndex((v) => v < 0);
        if (nx >= 0) S.selSlot = nx;
        updateSlots();
    }
    function onSlotTap(i) {
        if (!accepting()) return;
        S.slots[i] = -1; S.selSlot = i;
        updateSlots();
    }
    function clearSlots() {
        S.slots = new Array(S.n).fill(-1); S.selSlot = 0;
        updateSlots();
    }
    function setSlots(ids) {                              // F9/F10 のタップ: 現在のCALLのスロット全体を置換(数字配列)
        S.slots = Array.from(ids);                        // ids: 数字の配列
        S.selSlot = S.n - 1;
        updateSlots();
    }
    function onConfirm() {
        if (!accepting() || S.slots.some((v) => v < 0)) return;
        closePreview();
        provideInput({ type: "call", digits: S.slots.slice() });
    }

    // =====================================================================
    // 17. 状態表示 (F1 / R_EXPOSE / アイテムカード)
    // =====================================================================
    function updateStatus() {
        if (!UI.stDiff) return;
        UI.stDiff.text = DIFFS[S.diff].label + " / n=" + S.n;
        UI.stFirst.text = "先攻: " + (S.playerFirst ? "PLAYER" : "ENEMY");
        UI.stRound.text = S.extLabel ? S.extLabel : "ラウンド " + S.round;
        UI.stTurn.text = S.turnText;
        UI.stP.text = S.playerItems.map((nm) => ABBR[nm] + (S.used.P.has(nm) ? "×" : "✓")).join(" ");
        const k = (S.enemyAtk ? 1 : 0) + (S.enemyDef ? 1 : 0), used = Array.from(S.used.E);
        UI.stE.text = "持込 " + k + "個 / 使用済み: " + (used.length ? used.join("、") : "なし");
    }
    function updateExpose() {
        if (!UI.exCells) return;
        UI.exCells.forEach((c, i) => { c.t.text = S.secretHidden ? "?" : String(S.playerSecret[i]); });
        updateF13();
    }
    function flashExpose(posIdx) {                        // SHUFFLE/CHANGE/開示の後、該当桁の枠線を2秒間強調
        if (!UI.exCells) return;
        const g = S.gen;
        UI.exCells.forEach((c, i) => { if (posIdx === null || posIdx === i) c.r.color = C.gold; });
        updateExpose();
        setTimeout(() => { if (g === S.gen && UI.exCells) UI.exCells.forEach((c) => { c.r.color = C.border; }); }, 2000);
    }
    function canUseItem(nm) {
        return accepting() && S.modals.length === 0 && !S.used.P.has(nm) && !S.itemUsedThisTurn && !S.callConfirmed;
    }
    function refreshActions() {
        if (!UI.game || !UI.slotBtns) return;
        const acc = accepting(), full = S.slots.length > 0 && S.slots.every((v) => v >= 0);
        UI.digitBtns.forEach((b, d) => styleBtn(b, { en: acc && !S.slots.includes(d) }));
        UI.slotBtns.forEach((b) => styleBtn(b, { en: acc, keepBg: true }));
        styleBtn(UI.btnClear, { en: acc });
        styleBtn(UI.btnConfirm, { en: acc && full });
        styleBtn(UI.btnPreview, { en: acc && full && !!S.features.F8 });
        styleBtn(UI.btnSettings, { en: S.modals.length === 0 });
        UI.dblLabel.text = S.doubleActive ? "DOUBLE " + S.callIdx + "回目" : "";
        updateItemCards();
    }
    function updateItemCards() {
        if (!UI.cards) return;
        const f = S.features;
        for (const nm of S.playerItems) {
            const c = UI.cards[nm], used = S.used.P.has(nm), can = canUseItem(nm);
            c.stt.text = used ? "使用済み" : can ? "使用可" : "今は使えない";
            c.stt.color = used ? C.textOff : can ? C.ok : C.gray;
            c.r.background = used ? C.btnOff : C.btn;
            c.r.color = can ? C.sel : C.border; c.r.thickness = can ? 2 : 1;
            let s = "";
            if (!used && ATK.includes(nm) && f.F12 && !S.supportError) {
                const r = S.f12[nm];
                if (!r) s = "計算中…";
                else if (nm === "TARGET") s = "数字" + r.d + ": 期待残り " + fmt1(r.e) + "件";
                else if (nm === "DOUBLE") s = "最善CALL後 " + fmt1(r.e) + "件\n2回目失敗で1桁開示";
                else s = "期待残り " + fmt1(r.e) + "件";
            } else if (!used && DEF.includes(nm) && f.F13 && !S.supportError) {
                s = "ENEMYの候補数 " + S.KE.size + "件";
            }
            c.f12.text = s;
        }
    }

    // =====================================================================
    // 18. サポート機能 F5～F13
    // =====================================================================
    function heat(P) {
        if (P <= 0) return "rgba(85,85,85,0.15)";
        if (P >= 1) return "rgba(46,139,87,1)";
        return "rgba(255,140,0," + (0.15 + 0.85 * P).toFixed(3) + ")";
    }
    function computeStats(K) {
        const T = K.T, n = T.n, cd = new Int32Array(10), cp = new Int32Array(10 * n), ids = K.ids;
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i], m = T.MASK[id], b = id * n;
            for (let d = 0; d < 10; d++) if ((m >> d) & 1) cd[d]++;
            for (let j = 0; j < n; j++) cp[T.DIG[b + j] * n + j]++;
        }
        return { N: ids.length, cd, cp };
    }
    function barWidth(N, max) {
        const ratio = N <= 1 ? 0 : Math.log10(N) / Math.log10(S.T.N);
        return Math.max(4, Math.round(max * ratio)) + "px";
    }
    function updateF5() {
        UI.f5Text.text = "候補 " + S.KP.size + "件";
        UI.f5Bar.width = barWidth(S.KP.size, 500);
    }
    function updateF13() {
        if (!UI.f13Text || !S.KE) return;
        UI.f13Text.text = "ENEMYの候補数(厳密追跡) " + S.KE.size + "件";
        UI.f13Bar.width = barWidth(S.KE.size, 360);
    }
    function updateF6() {
        const st = S.stats, n = S.n;
        if (!st) return;
        const inc = [], exc = [], conf = [];
        for (let d = 0; d < 10; d++) { if (st.cd[d] === st.N) inc.push(d); else if (st.cd[d] === 0) exc.push(d); }
        for (let j = 0; j < n; j++) for (let d = 0; d < 10; d++) if (st.cp[d * n + j] === st.N) conf.push("第" + (j + 1) + "桁=" + d);
        UI.f6Text.text = "含む: " + inc.join(" ") + "  含まない: " + exc.join(" ") + "\n確定: " + conf.join(" ");
    }
    function updateDigitPanel() {
        if (!UI.digitBtns) return;
        const st = S.stats, f = S.features, ok = st && !S.supportError && st.N > 0;
        UI.digitBtns.forEach((b, d) => {
            let bg = C.btn, border = C.border, bw = 1;
            if (ok) {
                if (f.F11) bg = heat(st.cd[d] / st.N);
                if (f.F6) { if (st.cd[d] === st.N) { border = C.ok; bw = 3; } else if (st.cd[d] === 0) { border = C.gray; bw = 3; } }
            }
            styleBtn(b, { bg, border, bw });
        });
    }
    function updateMemo() {
        if (!UI.memoCells) return;
        const n = S.n, st = S.stats, f = S.features, ok = st && !S.supportError && st.N > 0, N = ok ? st.N : 1;
        UI.memoHeadNote.text = f.F11 && ok ? "一様仮定" : "";
        for (let d = 0; d < 10; d++) {
            for (let j = 0; j <= n; j++) {
                let bg = C.btn, border = C.border, bw = 1, label = MEMO_SYM[S.memo[d][j]];
                if (ok) {
                    const cnt = j < n ? st.cp[d * n + j] : st.cd[d], P = cnt / N;
                    if (f.F11) { bg = heat(P); if (S.showNumbers) label = P.toFixed(3); }
                    if (f.F6 && j < n && cnt === N) { border = C.gold; bw = 3; }
                }
                styleBtn(UI.memoCells[d][j], { bg, border, bw, label });
            }
        }
    }
    function updateF9() {
        if (!S.stats) return;
        const K = S.KP, N = K.size, T = S.T;
        const ids = N <= 5 ? Array.from(K.ids) : Array.from(sampleIds(K.ids, 5));
        UI.f9Rows.forEach((b, i) => {
            if (i < ids.length) {
                const arr = digitsOf(T, ids[i]);
                b._click = () => { if (accepting()) setSlots(arr); };
                styleBtn(b, { label: arr.join(""), en: true });
            } else if (i === ids.length && N > 5) {
                b._click = null;
                styleBtn(b, { label: "他 " + (N - 5) + " 件", en: false });
            } else { b._click = null; styleBtn(b, { label: "", en: false }); }
        });
    }
    function updateF10() {
        UI.f10Rows.forEach((row, i) => {
            const r = S.f10 && S.f10[i];
            if (r) {
                const arr = digitsOf(S.T, r.id);
                row.r._ids = arr; row.t1.text = arr.join("");
                row.t2.text = "H=" + r.h.toFixed(2) + "bit 期待残り=" + fmt1(r.e) + "件";
            } else {
                row.r._ids = null; row.t1.text = ""; row.t2.text = (i === 0 && !S.supportError) ? "計算中…" : "";
            }
        });
    }
    // F7: 作成中のCALLが K_P に含まれるか
    function updateF7() {
        if (!UI.f7Label) return;
        for (const e of S.log) renderLogEntry(e);
        UI.f7Label.text = "";
        if (!S.features.F7 || S.supportError || !S.KP || S.slots.length === 0 || S.slots.some((v) => v < 0)) return;
        const T = S.T, id = idOf(T, S.slots), inK = S.KP.hasCode(T.CODES[id]);
        UI.f7Label.fontSize = 14;
        if (inK) { UI.f7Label.text = "候補内"; UI.f7Label.color = C.ok; return; }
        let hit = 0;
        for (const e of S.log) {
            if (e.target === "E" && e.info && e.idx > S.lastTransform.E && !infoTest(T, e.info)(id)) { if (e.tb) e.tb.color = C.warn; hit++; }
        }
        if (hit === 0) { UI.f7Label.text = "変換(SHUFFLE/CHANGE)により候補外"; UI.f7Label.fontSize = 12; }
        else UI.f7Label.text = "候補外";
        UI.f7Label.color = C.warn;
    }
    function refreshSupport() {
        const tok = ++supToken;
        if (!UI.game || !S.KP) return;
        closePreview();
        S.supportError = S.KP.size === 0 || S.KE.size === 0;
        if (S.supportError) {
            UI.errText.text = "内部エラー: 候補集合が空";
            applyFeatureVisibility(); updateMemo(); updateDigitPanel(); updateItemCards();
            return;
        }
        UI.errText.text = "";
        applyFeatureVisibility();
        S.stats = computeStats(S.KP); S.f10 = null; S.f12 = {};
        updateF5(); updateF6(); updateF9(); updateF13(); updateMemo(); updateDigitPanel(); updateF10(); updateItemCards(); updateF7();
        const f = S.features;
        const needDouble = f.F12 && S.playerItems.includes("DOUBLE") && !S.used.P.has("DOUBLE");
        if (!(f.F10 || f.F12)) return;
        (async () => {
            let top = null;
            if (f.F10 || needDouble) {
                top = await Sched.run(() => f10Job(S.KP, tok));
                if (tok !== supToken || !top) return;
                S.f10 = top; updateF10();
            }
            if (f.F12) {
                const r = await Sched.run(() => f12Job(S.KP, top && top[0], tok));
                if (tok !== supToken || !r) return;
                S.f12 = r; updateItemCards();
            }
        })();
    }
    function applyFeatureVisibility() {
        if (!UI.game) return;
        const f = S.features, err = S.supportError;
        UI.grid.isVisible = !!f.F3;
        UI.f6Text.isVisible = !!f.F6 && !err;
        UI.f5Group.isVisible = !!f.F5 && !err;
        UI.f9Group.isVisible = !!f.F9 && !err;
        UI.f10Group.isVisible = !!f.F10 && !err;
        UI.f7Label.isVisible = !!f.F7;
        UI.f13Group.isVisible = !!f.F13 && !err;
        UI.f12Head.isVisible = !!f.F12;
        const btns = f.F8 ? [UI.btnClear, UI.btnConfirm, UI.btnPreview] : [UI.btnClear, UI.btnConfirm];
        UI.btnPreview.isVisible = !!f.F8;
        const total = btns.length * 140 + (btns.length - 1) * 12, x0 = Math.round((520 - total) / 2);
        btns.forEach((b, i) => { b.left = (x0 + i * 152) + "px"; });
        if (!f.F8) closePreview();
    }
    function updateAll() {
        updateStatus(); updateExpose(); updateSlots(); refreshActions();
        applyFeatureVisibility();
    }

    // ---- F8: CALL予習パネル -------------------------------------------------
    function closePreview() {
        if (UI.preview) { UI.preview.dispose(); UI.preview = null; }
    }
    function openPreview() {
        if (!S.features.F8 || !accepting() || S.slots.some((v) => v < 0)) return;
        closePreview();
        const call = S.slots.slice(), p = rect(UI.game, 380, 356, 520, 220, C.panel, C.gold, 2);
        UI.preview = p;
        const tok = supToken;
        const head = text(p, "計算中…", 8, 0, 430, 24, 13, C.gold);
        button(p, "閉じる", 450, 1, 62, 22, () => closePreview(), { size: 12 });
        const rows = [];
        for (let i = 0; i < 8; i++) rows.push(text(p, "", 12, 26 + i * 24, 490, 24, 14));
        Sched.run(() => f8Job(S.KP, call)).then((res) => {
            if (UI.preview !== p || tok !== supToken) return;
            const N = res.N, list = [];
            let sum = 0, h = 0;
            for (let k = 0; k < 64; k++) {
                const c = res.cnt[k];
                if (c) { list.push({ k, c }); sum += c * c; h -= (c / N) * Math.log2(c / N); }
            }
            list.sort((a, b) => b.c - a.c);
            head.text = "予習(一様仮定) E=" + fmt1(sum / N) + " H=" + h.toFixed(2) + "bit 正解確率=" + (res.inK ? (100 / N).toFixed(2) : "0") + "%";
            list.slice(0, 8).forEach((r, i) => { rows[i].text = (r.k >> 3) + "H" + (r.k & 7) + "B: " + r.c + "件 (" + (100 * r.c / N).toFixed(1) + "%)"; });
        });
    }

    // =====================================================================
    // 19. ダイアログ (9.3 アイテム / 9.4 開示桁 / 9.5 結果 / 9.6 設定)
    // =====================================================================
    let f14Tok = 0;
    function showF14(tb, kind, p, digit) {
        const my = ++f14Tok, K = S.KE, cur = K.size;
        tb.text = "計算中…";
        Sched.run(() => (kind === "SHUFFLE" ? f14ShuffleJob(K) : f14ChangeJob(K, p, hlOf(digit)))).then((v) => {
            if (my !== f14Tok) return;
            tb.text = "最悪想定(ENEMYが厳密に追跡した場合)\n現在の|K_E| " + cur + "件 → 使用後の予測|K_E'| " + v + "件";
        });
    }
    function openItemDialog(nm) {
        const m = openModal(380, 150, 520, 300), d = m.dlg, n = S.n, f = S.features;
        text(d, nm, 16, 8, 400, 28, 20, C.text);
        const desc = text(d, ITEM_LONG[nm], 16, 40, 488, 44, 13, C.text); desc.textWrapping = true;
        if (ATK.includes(nm) && f.F12 && S.f12[nm]) {
            const r = S.f12[nm];
            text(d, "F12(一様仮定): 期待残り " + fmt1(r.e) + "件" + (nm === "TARGET" ? "(数字" + r.d + ")" : ""), 16, 84, 488, 18, 12, C.gray);
        }
        const sel = { pos: null, digit: null, arg: null };
        const useBtn = button(d, "使用", 24, 240, 200, 44, () => {
            m.close();
            provideInput({ type: "item", name: nm, arg: sel.arg, pos: sel.pos, digit: sel.digit });
        }, { size: 18, bg: C.sel });
        button(d, "キャンセル", 296, 240, 200, 44, () => m.close(), { size: 18 });
        const f14 = text(d, "", 16, 190, 488, 44, 12, C.gold); f14.textWrapping = true;
        if (nm === "TARGET") {
            styleBtn(useBtn, { en: false });
            const bs = [];
            for (let i = 0; i < 10; i++) {
                bs.push(button(d, String(i), 24 + (i % 5) * 96, 108 + Math.floor(i / 5) * 52, 88, 44, () => {
                    sel.arg = i; bs.forEach((b, k) => styleBtn(b, { bg: k === i ? C.sel : C.btn })); styleBtn(useBtn, { en: true });
                }, { size: 20 }));
            }
        } else if (nm === "CHANGE") {
            styleBtn(useBtn, { en: false });
            const pb = [], db = [];
            const upd = () => {
                pb.forEach((b, k) => styleBtn(b, { bg: sel.pos === k + 1 ? C.sel : C.btn }));
                db.forEach((b, k) => styleBtn(b, { bg: sel.digit === k ? C.sel : C.btn }));
                const ok = sel.pos && sel.digit !== null;
                styleBtn(useBtn, { en: !!ok });
                if (ok && f.F14) showF14(f14, "CHANGE", sel.pos, sel.digit);
            };
            text(d, "桁", 16, 92, 40, 16, 12, C.gray);
            for (let i = 0; i < n; i++) pb.push(button(d, "第" + (i + 1) + "桁", 24 + i * 76, 108, 68, 38, () => { sel.pos = i + 1; upd(); }));
            text(d, "新しい数字(秘密番号に含まれない数字)", 16, 150, 300, 16, 12, C.gray);
            for (let x = 0; x < 10; x++) {
                const used = S.playerSecret.includes(x);
                db.push(button(d, String(x), 13 + x * 50, 168, 44, 36, () => { sel.digit = x; upd(); }, { size: 18 }));
                styleBtn(db[x], { en: !used });
            }
            f14.top = "208px"; f14.height = "30px";
        } else if (nm === "SHUFFLE") {
            if (f.F14) showF14(f14, "SHUFFLE");
            f14.top = "120px";
        }
    }
    function openDiscloseDialog() {                       // 9.4: ENEMYのDOUBLE失敗 → 開示させる桁をPLAYERが選ぶ
        return new Promise((res) => {
            const m = openModal(380, 200, 520, 200), d = m.dlg, n = S.n;
            text(d, "開示させる桁を選んでください", 16, 12, 488, 30, 18, C.text);
            text(d, "選んだ桁の数字を、ENEMYが自分の秘密番号から開示します。", 16, 44, 488, 20, 12, C.gray);
            const x0 = Math.round((520 - (n * 72 + (n - 1) * 8)) / 2);
            for (let i = 0; i < n; i++) button(d, "第" + (i + 1) + "桁", x0 + i * 80, 100, 72, 56, () => { m.close(); res(i + 1); }, { size: 16 });
        });
    }
    function openResultDialog(winner, extNote) {
        const m = openModal(340, 180, 600, 360), d = m.dlg;
        const title = winner === "P" ? "PLAYERの勝ち!" : winner === "E" ? "ENEMYの勝ち" : "引き分け";
        text(d, title, 0, 16, 600, 48, 32, winner === "P" ? C.ok : winner === "E" ? C.warn : C.gold, "center");
        text(d, "ENEMYの秘密番号: " + S.enemySecret.join(""), 40, 90, 520, 28, 18);
        text(d, "総ラウンド数: " + S.round, 40, 126, 520, 28, 18);
        text(d, "追加ターン: " + (extNote || "なし"), 40, 162, 520, 28, 16, C.gray);
        button(d, "準備に戻る", 60, 260, 220, 56, () => { m.close(); toMenu(true); }, { size: 18 });
        button(d, "同じ設定で再戦", 320, 260, 220, 56, () => { m.close(); toMenu(false); }, { size: 18, bg: C.sel });
    }
    function openSettings() {
        if (S.modals.length) return;
        const m = openModal(400, 140, 480, 440), d = m.dlg;
        text(d, "設定", 16, 4, 200, 28, 18);
        text(d, "常時ON: F1・F2・F4", 16, 32, 300, 20, 12, C.gray);
        FEATURE_IDS.forEach((id, i) => {
            const y = 56 + i * 28;
            checkbox(d, 16, y + 4, !!S.features[id], (v) => { S.features[id] = v ? 1 : 0; applyFeatureVisibility(); refreshSupport(); refreshActions(); });
            text(d, id + " " + FEATURE_NAMES[id], 48, y, 400, 28, 14);
        });
        const y = 56 + FEATURE_IDS.length * 28;
        checkbox(d, 16, y + 4, S.showNumbers, (v) => { S.showNumbers = v; updateMemo(); });
        text(d, "数値表示(F11)", 48, y, 400, 28, 14);
        button(d, "閉じる", 170, 396, 140, 36, () => m.close());
    }

    // =====================================================================
    // 20. 開始 / 準備へ戻る
    // =====================================================================
    function startGame() {
        abortGame();
        newGameState(S.cfg);
        UI.setup.isVisible = false;
        buildGame();
        UI.game.isVisible = true;
        refreshSupport();
        runGame();
    }
    function toMenu(reset) {
        abortGame();
        if (UI.game) UI.game.isVisible = false;
        resetCfg(!reset);
        UI.setup.isVisible = true;
        refreshSetup();
    }

    buildSetup();
    scene.metadata = { state: S };                        // デバッグ用: Inspector や検証コードから状態を参照できる
    return scene;
};

/*

# Numer0n ゲームルール

## 0. 用語定義
- PLAYER: 人間のプレイヤー。 ENEMY: コンピュータ。
- 秘密番号: 各側が持つ、0～9から重複なしで選んだn個の数字を並べた番号。先頭(第1桁)が0でもよい。桁は左から第1桁、第2桁…第n桁と数える(桁番号は1始まり)。
- n: 3～6の整数。ゲーム開始前にPLAYERが設定する。以降の「3桁」の記述は例示であり、規則はすべて一般のnで成立する。
- セット: 0～9から重複なしで選んだn個の数字を並べたもの(先頭0可)。秘密番号とCALLは、どちらもセットである。
- CALL: 相手の秘密番号を当てるための予想。セットを相手に提示すること。
- JUDGE: CALLを受けた側が自分の秘密番号と照合し、HIT数とBLOW数を相手に返すこと。
- HIT: CALLの数字のうち、秘密番号に含まれ、かつ桁も一致する数字の個数。
- BLOW: CALLの数字のうち、秘密番号に含まれるが、桁が一致しない数字の個数。
- 正解: HIT数がnになること(BLOW数は0)。
- 使用者: アイテムを使う側。 対象側: アイテムの効果を受ける側(攻撃系は使用者の相手、防御系は使用者自身)。
- ターン: 片側が1回行動する単位。行動の順序は「アイテム使用(任意)→CALL→JUDGE」。
- ラウンド: 先攻のターン1回と後攻のターン1回の組。
- digitSet(x): 番号xに含まれる数字の集合(順序なし)。
- K_P: PLAYERから見て「ENEMYの秘密番号として矛盾しない番号」の集合(8.3)。
- K_E: ENEMYが厳密に追跡した場合の「PLAYERの秘密番号として矛盾しない番号」の集合(8.3)。
- 公開情報: CALL、JUDGE結果、使用したアイテム名、アイテムの開示内容。持ち込んだアイテムの種類と秘密番号は非公開。

## 1. 準備
1. PLAYERはnを設定する(3～6)。
2. PLAYERは先攻・後攻を選ぶ。
3. PLAYERは秘密番号を決める。ENEMYは秘密番号を、可能な全セットから一様ランダムに生成する。
4. PLAYERは難度(キッズ/ノーマル/ハード、初期値はノーマル)を選ぶ。
5. 難度に応じてアイテムを決める(第7章)。
- 準備画面は9.2で定義する。
- 秘密番号とCALLの例(n=3): 123は有効。122は同じ数字を含むため無効。012は有効。

## 2. 進行
1. 先攻と後攻が交互にターンを行う。
2. 各ターンで、行動側は(任意で)アイテムを使用し、CALLを1回行う(DOUBLE使用時は2回)。
3. CALLを受けた側はJUDGEを行い、HIT数とBLOW数を返す。
   - PLAYERが判定側・対象側のとき、JUDGEとアイテムの開示内容はシステムが自動計算してPLAYERに通知する(PLAYERの手入力は不要)。
4. 勝敗はラウンド終了時に判定する(第3章)。
5. 画面と進行の状態遷移は第9章で定義する。

## 3. 勝敗
1. 勝敗判定はラウンド終了時に行う。判定には、そのラウンドで先攻・後攻がそれぞれ正解したか(正解フラグ)だけを使う。
2. 先攻・後攻の両方が正解 → 引き分け。
3. 先攻のみ正解 → 先攻の勝ち。ただし後攻は必ず自分のターンを行う(先攻が正解したラウンドでも後攻のターンを省略しない)。
4. 後攻のみ正解 → 後攻の勝ち。
5. どちらも不正解 → 次のラウンドへ進む。
6. 勝者がENEMYの場合、結果は「PLAYERの敗北」として確定する。結果は変更せず、以下の追加ターンを行う:
   - PLAYERのみ、最大3ターン追加で行動できる。ENEMYのターンはスキップし、ENEMYはCALLもアイテム使用も行わない。
   - 追加ターン中にPLAYERが正解しても、結果は敗北のまま変わらない(続行プレイとして扱う)。
   - 追加ターンの終了条件: PLAYERが正解した時点、または3ターンを消化した時点。終了後は結果画面(9.5)へ進む。
   - 追加ターンでも、PLAYERの未使用アイテムは使用できる。ただしDOUBLEの2回目が失敗しても、ENEMYが行動しないため開示処理は行わない。
7. 勝者がPLAYERの場合と、引き分けの場合は、追加ターンを行わず結果画面(9.5)へ進む。
8. 追加ターンは全難度に適用する。ただしキッズではENEMYが先に正解しないため(第7章)、発生しない。

## 4. アイテム共通規則
- 1ターンに使用できるアイテムは最大1個。使用はCALLの確定前に行う(DOUBLE使用時は1回目のCALLの確定前)。
- 使用したアイテム名は相手に公開する。
- 各アイテムは、PLAYER・ENEMYともに1ゲームにつき1回まで使用できる。
- 攻撃系: DOUBLE, HIGH&LOW, SLASH, TARGET。防御系: SHUFFLE, CHANGE。

## 5. 攻撃系アイテム
### 5.1 DOUBLE
- 使用ターンに、CALLを連続で2回行える。
- 1回目のJUDGE結果を見てから2回目のCALLを決めてよい。
- 1回目で正解した場合、2回目は行わずターンを終了する。
- 2回目のCALLで正解しなかった場合、使用者は自分の秘密番号のうち1桁の数字を対象側に開示しなければならない。開示する桁(第何桁か)は対象側が指定する。
   - PLAYERが対象側のとき、UIは第1～第n桁のボタンを表示し、PLAYERが1つ選ぶ(9.4)。
   - ENEMYが対象側のとき、ENEMYは7.4に従って桁を選ぶ。

### 5.2 HIGH&LOW
- 対象側は、自分の秘密番号の各桁の数字が HIGH(5～9) か LOW(0～4) かを、第1桁から順に使用者へ開示する。数字そのものは開示しない。
- 例: 秘密番号が809なら、「第1桁 HIGH、第2桁 LOW、第3桁 HIGH」と開示する。

### 5.3 SLASH
- 対象側は、自分の秘密番号に使われている数字の最大値から最小値を引いた差を、使用者へ開示する。
- 例: 427なら 7 − 2 = 5。

### 5.4 TARGET
- 使用者は0～9の数字を1つ指定する。
- 対象側は、その数字が自分の秘密番号に含まれるかを答える。含まれる場合は第何桁にあるかも答える。含まれない場合は「なし」と答える。

## 6. 防御系アイテム
### 6.1 SHUFFLE
- 使用者(自分)の秘密番号の数字の並びをランダムに入れ替える。数字の集合は変わらない。
- 入れ替え後の並びは、入れ替え前と必ず異なる。
- 使用の事実は公開するが、入れ替え後の並びは公開しない。

### 6.2 CHANGE
- 使用者(自分)は、秘密番号の1桁を選び、その数字を、置き換え前の秘密番号に含まれていない数字(10−n 種)のいずれか1つに置き換える。捨てる数字は置き換え前の秘密番号に含まれているため、選べない。
- 置き換えた桁(第何桁か)と、置き換え後の新しい数字が HIGH(5～9)か LOW(0～4)かを、相手に開示する。数字そのものは開示しない。

## 7. 難度

### 7.0 難度パラメータ
- 以下の値は初期値であり、設定として変更可能にする。
- 各項目は キッズ → ノーマル → ハード の順に単調に変化させる(順序を入れ替えない)。

| 項目 | キッズ | ノーマル | ハード |
|---|---|---|---|
| PLAYERが持ち込むアイテム | 全6種 | 攻撃系から2種+防御系から1種 | 攻撃系から1種+防御系から1種 |
| PLAYERの使用回数 | 各1回 | 各1回 | 各1回 |
| ENEMYが持ち込むアイテム | なし | 攻撃系1種 | 攻撃系1種+防御系1種 |
| ENEMYの攻撃系アイテム使用確率 p_item(未使用の間、各ターン) | 0 | 0.20 | 0.40 |
| ENEMYの防御系アイテム使用条件 | なし | なし | C_player ≤ 6 |
| ENEMYのCALL方式(K が2件以上のとき) | Kから一様ランダム | Kから一様ランダム | 最善手 |
| ミスCALL確率 p_miss | 0.30 | 0.20 | 0 |
| 待機ターン数 W(Kが1件に確定してから正解をCALLするまで) | 0(正解CALLはWIN_GUARDが差し替える) | 2～3の整数を一様乱数で決定 | 0 |
| WIN_GUARD | ON | OFF | OFF |
| PLAYERがDOUBLEに失敗したときの開示桁の選び方(7.4) | 最も情報が少ない桁 | ランダム | 最も情報が多い桁 |

### 7.1 ENEMYの共通定義
- 候補集合クラス CandidateSet を1つ定義し、K_P 用と K_E 用の2インスタンスを作る(8.3)。
- ENEMYの候補集合 K は K_E そのものとする(別実装を持たない)。
- C_player は |K_P| そのものとする。
- PLAYERがSHUFFLEまたはCHANGEを使用した場合の K_E の更新は、8.3の表に従う(SHUFFLEは並べ替えの閉包、CHANGEは1桁置換)。
- ミスCALL: 0～9から重複なしでn個選んだランダムな番号をCALLする。ただし K が1件に確定している場合は、その1件を除く。
- 最善手(ハードのみ): K から最大100件をランダムに抽出する(K が100件以下なら全件)。各候補gについて、gをCALLしたときの K(最大3000件をランダム抽出)の各番号とのJUDGE結果(HIT数,BLOW数)ごとの件数 c_i を求め、Σ(c_i の2乗)が最小のgを選ぶ。

### 7.2 ENEMYの各ターンの手順(全難度共通)
1. アイテム使用判定(最大1個。上から順に評価し、最初に成立した時点で終了する):
   a. ハードで、防御系が未使用、かつ C_player ≤ 6、かつ「K が1件で w が0」ではない → 防御系を使用する。このターンは攻撃系の判定を行わない。
   b. a. が不成立で、攻撃系が未使用、かつ K が2件以上 → 確率 p_item で攻撃系を使用する(K が1件のときは使用しない)。
   - 使用するアイテムは、ゲーム開始時にランダムに決めた攻撃系1種と防御系1種(PLAYERには非公開)。
   - 各アイテムの効果は第5章・第6章に従い、選択が必要な値は7.4に従って決める。
2. CALLの決定(DOUBLE使用時は各CALLについて以下を行う):
   a. 確率 p_miss でミスCALLを行う。
   b. a. に該当しない場合:
      - K が1件で、待機カウンタ w が1以上なら、w を1減らしてミスCALLを行う。
      - K が1件で、w が0なら、その1件をCALLする(正解)。
      - K が2件以上なら、CALL方式に従う(キッズ/ノーマルは K から一様ランダム、ハードは最善手)。
   - 待機カウンタ w の規則:
      - K が1件になったとき(K_E の更新直後)、w が未設定なら、W の範囲(例:2～3)の整数を一様乱数で決めて w に設定する。ハードとキッズは W=0 なので w=0 になる。
      - K が2件以上に戻ったら、w を未設定に戻す。
      - w の減算は1ターンにつき最大1回とする(DOUBLEの2回目のCALLでは w を変更しない)。
3. WIN_GUARDがONの場合(キッズ)、決定したCALLがPLAYERの秘密番号と一致するときは、一致しない別の番号に差し替える。K が2件以上のときは K の中から選ぶ。この規則により、キッズのENEMYは正解しない。
   - 例外: PLAYERが先攻でそのラウンドに正解した場合は、WIN_GUARDとミスCALLを適用しない。ENEMYは K から一様ランダムに1つを選んでCALLする(意図的に外さない)。K が1件なら引き分けになる。

### 7.3 各難度の要約
- キッズ: PLAYERは全6種を各1回(1ターン1個まで)使える。ENEMYはアイテムを使わず、PLAYERより先に正解しない(7.2の例外を除く)。
- ノーマル: PLAYERは攻撃系2種+防御系1種(各1回)。ENEMYは攻撃系1種を使い、ミスCALLを混ぜ、K が1件に確定してから2～3ターン待って正解する。
- ハード: PLAYERは攻撃系1種+防御系1種(各1回)。ENEMYは攻撃系1種+防御系1種を使い、最善手で最短を目指す。

### 7.4 ENEMYの選択規則
- 共通: 乱数は Math.random() を使う。評価値が同値の候補が複数あるときは、評価した順の先頭を選ぶ。
- ENEMYのDOUBLEが失敗したとき(ENEMYが使用者): PLAYERが、ENEMYに開示させる桁をUI(9.4)で選ぶ。
- PLAYERのDOUBLEが失敗したとき(ENEMYが対象側。全難度で発生する): ENEMYが、PLAYERに開示させる桁pを選ぶ。各桁pについて、「第p桁の値で K_E を分割したときの期待残り候補数 E_p」を求める(Eの定義は8.4)。
  - キッズ: E_p が最大の桁(最も情報が少ない桁)。
  - ノーマル: 第1～n桁から一様ランダム。
  - ハード: E_p が最小の桁(最も情報が多い桁)。
- ENEMYのTARGETの数字(ノーマル・ハード):
  - ノーマル: K_E のいずれかの番号に含まれる数字から一様ランダムに選ぶ。
  - ハード: 各数字d(0～9)の「dの位置(なし含む)」による K_E の分割で E が最小となる d を選ぶ。
- ENEMYのSHUFFLE(ハード): 元の並びと異なるランダムな順列に入れ替える(元と一致したら再抽選)。
- ENEMYのCHANGE(ハード): 桁pは第1～n桁から一様ランダム。新しい数字は、置き換え前の秘密番号に含まれていない数字から一様ランダム。

## 8. PLAYER向けサポート機能

### 8.0 共通前提
- 実装: Babylon.js v9以上。UIは Babylon.GUI のみ。3Dメッシュは使わない。
- 使用コントロール: Rectangle, TextBlock, Button, Grid, StackPanel, ScrollViewer, Checkbox。
- 入力はクリック/タップのみ。キー入力、ドラッグ&ドロップ、長押し、ホバー依存の操作は使わない。
- 機能のON/OFF: F1・F2・F4 は常時ON(設定パネルのCheckboxは無効表示)。F3・F5～F14 は個別にON/OFFできる。8.1の表のON/OFFは、難度選択時の初期値である。
- K_P・K_E は機能のON/OFFに関係なく常に更新する。OFFの機能をONにしたときは、その時点の K から再計算して表示する。
- 支援は K_P・K_E から計算した値のみを表示する。助言文(「～すべき」等)は表示しない。
- 確率・エントロピー・期待残り候補数は、K_P(または K_E)上の一様分布を仮定した値とする。F8・F11・F12 の見出しの右に「一様仮定」を12pxで表示する。
- サンプリングを使う F9・F10 の見出しの右に「近似」を12pxで表示する。
- 候補集合が空になった場合は「内部エラー: 候補集合が空」を表示し、F5～F14を無効化する。
- Scene: Playgroundの createScene 内で、Scene と FreeCamera(原点)を1つ作る(カメラがないと描画されない)。scene.clearColor = Color4.FromHexString("#1E1E24FF")。
- ADT: AdvancedDynamicTexture.CreateFullscreenUI("ui", true, scene) とし、idealWidth=1280、idealHeight=720、useSmallestIdeal=true を設定する(idealWidth と idealHeight の両方が必要)。
- ルートコンテナ: Rectangle(1280px×720px、thickness=0、horizontalAlignment=CENTER、verticalAlignment=CENTER)を作る。8.2の全領域・ダイアログ・準備画面はこのコンテナの子にし、各要素は horizontalAlignment=LEFT、verticalAlignment=TOP、left=x px、top=y px、width=w px、height=h px で絶対配置する(座標は特記がなければルートコンテナの左上が原点)。
- 配色: パネル背景 #2B2B33、枠線 #555560、文字 #EEEEEE、ボタン通常 #3A3A46、ボタン無効の背景 #2A2A30 と文字 #777777、選択状態 #4A7BD0、PLAYER行の文字 #6CB6FF、ENEMY行の文字 #FFB366、警告・候補外 #E05555、候補内・含む #2E8B57。
- 背景の不透明度は rgba(r,g,b,a) の文字列で指定し、control.alpha は使わない(子の文字まで半透明になるため)。F2の半透明文字のみ TextBlock.alpha を使ってよい。
- フォント: fontFamily="'Meiryo','Hiragino Kaku Gothic ProN',sans-serif"。標準14px、見出し16px、狭い領域(R_STATUSのアイテム欄、F10の2段目)12px。
- ScrollViewer(R_LOG): ScrollViewer(幅380px、高さ520px、barSize=10)の内部に StackPanel(isVertical=true、幅360px)を置き、各行を TextBlock(幅360px、textWrapping=true、resizeToFit=true、paddingTop・paddingBottom=6px)にする(最小行高は約28px。長い行は折り返して高さが増える)。行を追加した後は、ScrollViewerの縦スクロールバー値を最下部(1)にする。
- モーダル: 全面オーバーレイ Rectangle(1280×720、背景 rgba(0,0,0,0.5)、isPointerBlocker=true)をルートコンテナの最後の子として追加し、その後にダイアログ本体を追加する(後から追加した子が前面になる)。閉じるときは両方を dispose する。
- 重い計算(F8、F10、F12、F14、ハードの最善手・桁選択・TARGET選択)は、scene.onBeforeRenderObservable で1フレームあたり最大8ms分だけ処理し、残りを次フレームに回す。計算完了まで「計算中…」を表示し、計算中に K_P/K_E が更新されたら途中結果を破棄して再計算する。状態遷移(9.1)の各フェーズは、そのフェーズで必要な計算がすべて完了してから次へ進む。
- 乱数は Math.random() を使う。

### 8.1 機能一覧
| ID | 名称 | 内容 | キッズ | ノーマル | ハード |
|---|---|---|---|---|---|
| F1 | 状況バー | 難度、n、先攻、ラウンド、現在のターン、追加ターン残り、アイテム状態 | ON | ON | ON |
| F2 | 情報ログ | CALL、JUDGE、アイテム結果、ENEMYのアイテム使用を時系列で表示 | ON | ON | ON |
| F3 | メモ表 | 0～9×第1～第n桁と総合列。タップで「　」→「？」→「○」→「×」を循環 | ON | ON | ON |
| F4 | 作業スロット/数字パネル | CALL作成。重複数字は選べない | ON | ON | ON |
| F5 | 候補数カウンタ | \|K_P\| の件数と対数バー | ON | ON | OFF |
| F6 | 確定/除外数字 | 含まれる数字、含まれない数字、桁が確定した数字 | ON | ON | OFF |
| F7 | 候補外警告 | 作成中のCALLが K_P に含まれるかを表示 | ON | ON | OFF |
| F8 | CALL予習 | 作成中のCALLの結果別の件数と確率 | ON | OFF | OFF |
| F9 | 候補一覧 | \|K_P\|≤5なら全件、それ以外は5件を抽出して表示 | ON | OFF | OFF |
| F10 | 提案CALL上位3件 | K_P内のシャノンエントロピー上位3件 | ON | OFF | OFF |
| F11 | 確率ヒートマップ | メモ表と数字パネルの背景色の濃淡 | ON | OFF | OFF |
| F12 | アイテム期待効果 | 未使用の攻撃系アイテムを使った後の期待残り候補数 | ON | ON | OFF |
| F13 | 露出度メーター | \|K_E\| の件数と対数バー | ON | ON | OFF |
| F14 | 防御系プレビュー | SHUFFLE/CHANGE使用後の \|K_E\| の予測 | ON | OFF | OFF |

- 上記のON/OFFは難度選択時の初期値であり、設定パネル(9.6)から、F1・F2・F4 以外の全機能を有効/無効にできる。

### 8.2 画面レイアウト(1280×720、座標は左上原点)
| 領域ID | x,y,w,h | 内容 |
|---|---|---|
| R_STATUS | 0,0,1280,56 | F1。左から: 難度とn(140)、先攻(140)、ラウンド(120)、ターン(220)、PLAYERアイテム(290)、ENEMYアイテム(290)、設定ボタン(80) |
| R_LOG | 0,56,380,520 | F2。ScrollViewer(8.0の構成)。長い行は折り返し、最小行高は約28px |
| R_WORK | 380,56,520,300 | F4、F7ラベル。内部配置は9.7 |
| R_SUGGEST | 380,356,520,220 | 上段32px: F5。下段左(260幅): F9。下段右(260幅): F10 |
| R_MEMO | 900,56,380,360 | F3、F6、F11。Gridは11行×(n+2)列(列0=数字ラベル、列1～n=第1～第n桁、列n+1=総合列)、行高30px、最下部に28pxのF6テキスト行 |
| R_EXPOSE | 900,416,380,160 | 秘密番号表示: n個のセル(各56×56、間隔6、中央揃え、y=8)。「表示/非表示」ボタン(100×32、y=70、左寄せ)。F13のメーター(ONのときのみ、y=108、高さ44)。SHUFFLE/CHANGEの使用後は秘密番号表示を更新し、変更した桁(SHUFFLEは全桁)の枠線を2秒間 #FFD700 にする |
| R_ITEM | 0,576,1280,144 | F12。アイテムカード(200×120、最大6枚、間隔8px、PLAYERが持ち込んだアイテムのみ)。カード内は上から、名称(16px、y=6)、効果1行(12px、y=30)、F12の値(12px、最大2行、y=54)、状態表示「使用可/使用済み/今は使えない」(12px、y=96)。カードが有効になる条件: フェーズが P_ACTION で、そのアイテムが未使用で、今のターンにアイテムをまだ使用しておらず、1回目のCALLを確定する前であること |

### 8.3 候補集合の管理
- 初期値: K_P と K_E はどちらも、0～9から重複なしで選んだn個の全番号(先頭0可)。件数は n=3:720、n=4:5040、n=5:30240、n=6:151200。
- 各番号は n桁固定のbase-10整数コードとして Int32Array に保持する。
- 各集合は、長さ 10^n の Uint8Array(所属フラグ)も保持する。所属判定(F7)と、重複除去(更新時)に使う。
- JUDGE(g,s): hit = #{j | g[j]=s[j]}、blow = |digitSet(g)∩digitSet(s)| − hit。
- HL(x): x≥5 なら HIGH、x≤4 なら LOW。

K_P の更新(ENEMYの秘密番号に関するイベント):
| イベント | 更新 |
|---|---|
| PLAYERのCALL g と結果 (h,b) | K_P ← {s∈K_P \| JUDGE(g,s)=(h,b)} |
| PLAYERが使用した HIGH&LOW の結果 bits[1..n] | K_P ← {s \| 全jで HL(s[j])=bits[j]} |
| PLAYERが使用した SLASH の結果 v | K_P ← {s \| max(s)−min(s)=v} |
| PLAYERが使用した TARGET 数字d、結果「なし」 | K_P ← {s \| d∉digitSet(s)} |
| PLAYERが使用した TARGET 数字d、結果「第p桁」 | K_P ← {s \| s[p]=d} |
| ENEMYのDOUBLE 2回目失敗でENEMYが第p桁の数字dを開示 | K_P ← {s \| s[p]=d} |
| ENEMYがSHUFFLE使用 | K_P ← {x \| ∃s∈K_P: digitSet(x)=digitSet(s) かつ x≠s} |
| ENEMYがCHANGE使用(第p桁、新数字のHL=h) | K_P ← {replace(s,p,x) \| s∈K_P, x∉digitSet(s), HL(x)=h}(重複除去) |

K_E の更新(PLAYERの秘密番号に関するイベント。結果はPLAYERの秘密番号から自動計算する):
| イベント | 更新 |
|---|---|
| ENEMYのCALL g' と自動JUDGE結果 (h,b) | K_E ← {s∈K_E \| JUDGE(g',s)=(h,b)} |
| ENEMYが使用した HIGH&LOW、SLASH、TARGET の結果 | K_P の同名イベントと同じ式で K_E をフィルタ |
| PLAYERのDOUBLE 2回目失敗でPLAYERが第p桁の数字dを開示 | K_E ← {s \| s[p]=d} |
| PLAYERがSHUFFLE使用 | K_E ← {x \| ∃s∈K_E: digitSet(x)=digitSet(s) かつ x≠s} |
| PLAYERがCHANGE使用(第p桁、新数字のHL=h) | K_E ← {replace(s,p,x) \| s∈K_E, x∉digitSet(s), HL(x)=h}(重複除去) |

- DOUBLEの2回のCALLは、別々のCALLイベントとして順に処理する。
- PLAYERが秘密番号を決めた時点で、PLAYERの秘密番号は確定とする。
- 桁添字の規則: p・j は1始まり(UI表示と同じ)。内部配列は0始まりで、s[p] は内部では s[p-1] と実装する。
- SHUFFLE更新の実装: K を digitSet のマスク(10bit)ごとにグループ化する。グループの件数が2以上なら、その数字集合の n! 通りの並びすべてを新しい K に加える。件数が1なら、その1件を除く n!−1 通りを加える。
- 再計算するタイミング: K_P・K_E の更新直後に F5、F6、F9、F10、F11、F12、F13 を再計算する。F7 はスロットが変化するたびに(所属フラグの参照のみで)再計算する。F8 は「予習」ボタン押下時、F14 はダイアログの選択変更時のみ計算する。

### 8.4 機能別仕様
- 期待残り候補数 E: 分割(結果ごとの件数 c_i)の合計が N のとき E = Σ(c_i²) / N。
- シャノンエントロピー H = −Σ (c_i/N) × log2(c_i/N)(単位 bit)。
- F1: 追加ターン中は「追加ターン k/3」を表示する。R_STATUS のアイテム欄: PLAYERは「DBL✓ H&L✓ SLS✓ TGT✓ SHF✓ CHG✓」(✓=未使用、×=使用済み、持ち込んでいないアイテムは非表示)。ENEMYは「持込 k個 / 使用済み: 名称…」とし、未使用の種類は表示しない。
- F2: ログの各行は、次の属性を持つ。
  - actor: その行動をした側(PLAYER/ENEMY)。
  - target: その行が情報を与える秘密番号(ENEMYの秘密番号/PLAYERの秘密番号/なし)。
  - 1行1イベント。書式(rは1始まりのラウンド番号。追加ターン中は「EX{k}」とする。Xは PLAYER または ENEMY):
    - CALL: 「R{r} X: 1234 → 1H 2B」
    - DOUBLE: 「R{r} X: DOUBLE 使用」。2回目が失敗したときは「R{r} X: DOUBLE失敗 → 第p桁=d を開示」(actorは開示した側、targetは開示した側の秘密番号)
    - HIGH&LOW: 「R{r} X: HIGH&LOW → 第1桁 HIGH、第2桁 LOW、…」
    - SLASH: 「R{r} X: SLASH → 5」
    - TARGET: 「R{r} X: TARGET 7 → 第2桁」または「R{r} X: TARGET 7 → なし」
    - SHUFFLE: 「R{r} X: SHUFFLE 使用」(targetは使用者自身の秘密番号)
    - CHANGE: 「R{r} X: CHANGE → 第p桁を HIGH(またはLOW)の数字に変更」(targetは使用者自身の秘密番号)
  - 色: actor が PLAYER の行は #6CB6FF、ENEMY の行は #FFB366。
  - バッジ: ある側のSHUFFLE/CHANGEの行より前にある、target がその側の秘密番号である行に、「SHUFFLE前」「CHANGE前」のバッジを付け、文字を半透明(alpha=0.5)にする。
- F3: 手動メモ。K_P からの自動入力はしない。F11は背景色、F6は枠線で表現する(同じセルに重ねて表示する)。
  - Gridは11行×(n+2)列、列幅=380/(n+2) px、行高30px。列0=数字ラベル、列1～n=第1～第n桁、列n+1=総合列。行0=見出し、行1～10=数字0～9。
  - 総合列のメモは「その数字を含む/含まない」を表す。F11の総合列の背景は P_in(d) で決める。
  - F6行(最下部、28px・12px・2行まで): 1行目「含む: 1 4 7  含まない: 0 2 3」、2行目「確定: 第1桁=4 第3桁=7」。F6の確定桁セルは枠線 #FFD700(太さ3px)にする。
- F4: 数字パネルで数字をタップすると、選択中のスロットに入り、次の空きスロットへ移る。使用済みの数字ボタンは無効にする。「確定」はn個が埋まったときのみ有効。DOUBLE使用中は「1回目/2回目」を表示する。スロットをタップすると、その数字を外してそのスロットを選択状態にする。
- F5: 「候補 N件」を表示する。バー幅 = log10(N) / log10(初期件数)。N=1 のときのバー幅は最小4pxにする。
- F6:
  - 数字dが全候補に含まれれば「含む」、全候補に含まれなければ「含まない」、それ以外は不明とする。
  - 第j桁が全候補で同じ数字なら「第j桁=その数字」と確定する。
  - 数字ボタンの枠線を、含むなら #2E8B57(太さ3px)、含まないなら #888888(太さ3px)にする。数字ボタンの背景色はF11が決める(F11がOFFなら #3A3A46)。
- F7:
  - スロットがn個埋まったとき、R_WORK内のF7ラベルに、作成中のCALLが K_P に含まれれば「候補内」(#2E8B57)、含まれなければ「候補外」(#E05555)を表示する。「確定」は止めない。
  - 候補外のとき、K_P の更新に使った制約イベントのうち、そのCALLが単独でその制約を満たさないログ行を #E05555 で強調する。強調の対象は target が ENEMYの秘密番号 で、かつ ENEMYのSHUFFLE/CHANGEより後の行のみとする。
  - 候補外だが強調する行が0件のときは「変換(SHUFFLE/CHANGE)により候補外」と表示する。
- F8:
  - 「予習」ボタン押下時に、R_SUGGESTの上に重ねるパネル(380,356,520,220)を表示する。見出し行(24px、E・H・正解確率・「閉じる」ボタン)+結果行(最大8行、各24px)。
  - 作成中のCALL g について、K_P を (hit,blow) の結果ごとに分割する。結果行を件数の多い順に最大8行表示する(「1H1B: 120件 (24.0%)」の形式)。
  - 正解確率は、g∈K_P なら 1/|K_P|、g∉K_P なら 0 とする。
  - K_P が更新されたら自動で閉じる。
- F9: |K_P|≤5 なら全件を表示する。それ以外は、K_P の更新ごとにランダムに5件を抽出して「他 N−5 件」を表示する。行高30px(最大6行)。番号をタップすると、現在作成中のCALLのスロット全体をその番号で置き換える(DOUBLEの1回目・2回目どちらの作成中でも同じ)。
- F10:
  - K_P から最大100件(G)をランダム抽出し、各候補gについて、K_P から最大3000件(S)を抽出した集合の分割でHを計算する。上位3件を表示する。K_P が100件を超えるときの上位3件は、サンプリングによる近似とする。
  - 各行を2段表示にする(1段目: 番号を16px、2段目: 「H=3.21bit 期待残り=12.3件」を12px)。行高60px、3行。
  - タップすると、F9と同じ規則でスロット全体をその番号で置き換える。
- F11:
  - P(d,j) = (K_P の中で s[j]=d の件数) / |K_P|。P_in(d) = (K_P の中で d を含む件数) / |K_P|。
  - メモ表のセル背景は P(d,j) で決める。P=0 は灰色(#555555)、P=1 は緑(#2E8B57)、それ以外はオレンジ(#FF8C00)で、不透明度は 0.15+0.85×P とする。
  - 数字パネルの背景は P_in(d) で、同じ規則で決める。
  - 設定パネルの「数値表示」をONにすると、セルに P を小数3桁(0.123)で表示する(その間はメモの記号を隠す)。
- F12:
  - 未使用の攻撃系アイテムごとに、使用後の期待残り候補数 E を表示する(K_P の分割で計算)。
  - HIGH&LOW: HLパターンで K_P を分割する。
  - SLASH: max−min の値で K_P を分割する。
  - TARGET: 各数字d(0～9)について「dの位置(なし含む)」で分割し、E が最小の d と E を表示する。
  - DOUBLE: 「最善CALL1回後の期待残り E1」を表示し、「2回目を外すと自分の秘密番号の1桁を開示」と注記する。E1 は、F10 の上位1位のCALL(F10がOFFでも内部計算する)を使った分割の E とする。
  - 使用済みのカードは灰色(#2A2A30)にして「使用済み」と表示する。防御系のカードには、F13がONのときのみ F13 の現在値を表示し、OFFなら何も表示しない。
- F13: 「ENEMYの候補数(厳密追跡) N件」とバーを表示する。バー幅の計算は F5 と同じ。
- F14:
  - 防御系アイテムの使用ダイアログ(9.3)に、「現在の |K_E|」と「使用後の予測 |K_E'|」を並べて表示する。ラベルは「最悪想定(ENEMYが厳密に追跡した場合)」とする。
  - SHUFFLE: |K_E'| = (K_E を digitSet でグループ化し、件数が2以上のグループ数)×n! + (件数が1のグループ数)×(n!−1)。
  - CHANGE: PLAYERが選んだ桁pと新数字の HL に対し、K_E' = {replace(s,p,x) | s∈K_E, x∉digitSet(s), HL(x)=その HL}(重複除去)の件数。桁pと新数字の選択を変えるたびに再計算する。
- アイテム使用ダイアログは9.3で定義する。F12とF14は、そのダイアログとR_ITEMのカードに追加表示する。

## 9. 画面と進行

### 9.1 状態遷移
| フェーズ | 主体 | 内容 | 次 |
|---|---|---|---|
| SETUP | PLAYER | 準備画面(9.2) | 「開始」で TURN_START |
| TURN_START | システム | 行動側を決める。ENEMYなら E_ITEM へ | P_ACTION または E_ITEM |
| P_ACTION | PLAYER | R_ITEMのカードをタップして9.3のダイアログを開ける(CALL未確定の間のみ・1ターン1個)。F4でCALLを作成して「確定」。DOUBLE使用中は2回行い、1回目のJUDGE表示後に2回目へ進む。1回目の確定後は全カードを無効にする | P_JUDGE |
| P_JUDGE | システム | JUDGEをF2に追加し、K_P を更新して1.2秒表示 | DOUBLE2回目失敗なら P_DISCLOSE、それ以外は TURN_END |
| P_DISCLOSE | システム | 7.4に従いENEMYが桁を決め、PLAYERの秘密番号の該当桁を開示。K_E を更新 | TURN_END |
| E_ITEM / E_CALL / E_JUDGE | ENEMY | 7.2・7.4に従う。各フェーズの前に0.8秒待つ | E_DISCLOSE または TURN_END |
| E_DISCLOSE | PLAYER | 9.4の桁選択ボタンで、ENEMYが開示する桁を選ぶ。K_P を更新 | TURN_END |
| TURN_END | システム | ラウンドの終わりなら ROUND_CHECK、そうでなければ次の行動側へ | ROUND_CHECK / TURN_START |
| ROUND_CHECK | システム | 第3章で判定 | TURN_START / EXTENSION / RESULT |
| EXTENSION | PLAYER | P_ACTION～P_JUDGE のみを最大3回。F1に「追加ターン k/3」 | RESULT |
| RESULT | PLAYER | 9.5 | SETUP |

- ENEMYのフェーズ中は、PLAYERの入力(ボタン)をすべて無効にする。
- アイテムの使用結果は F2 に追加し、同時に画面上部中央(480,64,320,40)に2秒間トースト表示する。
- 待ち時間(0.8秒、1.2秒、トースト)のタイマーは、世代番号(ゲームを開始・再戦・準備に戻るたびに1増やす整数)付きで登録する。タイマーが発火したときに世代番号が現在と一致しなければ、何もしない。

### 9.2 準備画面(SETUP)
- ルートコンテナ全面に表示する。ゲーム画面(8.2)は非表示にする。パネル背景 Rectangle(160,20,960,680)を置く。
- 上から順に配置する: ①n: ボタン「3」「4」「5」「6」(単一選択)。 ②先攻/後攻: ボタン2つ(単一選択)。 ③難度: キッズ/ノーマル/ハードの3ボタン(初期はノーマル)。難度の選択に応じて、8.1の初期ON/OFFを適用する。
- ④アイテム選択: キッズは全6種を表示するだけ(選択不要)。ノーマルは攻撃系4種から2つ、防御系2種から1つを選ぶ(トグルボタン)。ハードは攻撃系1つ、防御系1つを選ぶ。
- ⑤秘密番号: スロットn個と数字パネル(F4と同じ規則)、「ランダム」ボタン。
- 「開始」ボタンは、n・先攻/後攻・難度・アイテム選択・秘密番号がすべて確定したときのみ有効にする。
- ゲーム開始後は、n・難度・アイテムは変更できない(設定パネルでは機能のON/OFFのみ変更できる)。
- レイアウト(ルートコンテナ座標):

| 要素 | x,y,w,h |
|---|---|
| タイトル「Numer0n」 | 160,28,960,40 |
| n: ラベル / ボタン4つ(各100×48、間隔12) | 200,84,160,48 / 380,84 から |
| 先攻/後攻: ラベル / ボタン2つ(各150×48、間隔12) | 200,144,160,48 / 380,144 から |
| 難度: ラベル / ボタン3つ(各150×48、間隔12) | 200,204,160,48 / 380,204 から |
| アイテム: 攻撃系ボタン4つ(各150×44、間隔12) | 380,268 から |
| アイテム: 防御系ボタン2つ(各150×44、間隔12) | 380,320 から |
| アイテム: 選択条件の説明(12px) | 380,372,700,28 |
| 秘密番号: スロット(各64×64、間隔8) | 404,412 から |
| 秘密番号: 数字パネル(各88×44、間隔8、5×2) | 404,484 から |
| 「ランダム」「クリア」ボタン(各120×44、縦に並べる) | 900,484 / 900,536 |
| 「開始」ボタン | 480,620,320,56 |

### 9.3 アイテム使用ダイアログ
- モーダル(位置 380,150、大きさ 520×300)。
- 共通: アイテム名、効果の説明1行、「使用」ボタン、「キャンセル」ボタン。
- TARGET: 数字ボタン0～9から1つ選ぶ。選択するまで「使用」を無効にする。
- CHANGE: ①桁ボタン(第1～第n桁)から1つ選ぶ。②新しい数字ボタン(置き換え前の秘密番号に含まれていない数字のみ有効)から1つ選ぶ。両方を選ぶまで「使用」を無効にする。F14がONなら、選択を変えるたびに「現在の|K_E| → 使用後の予測|K_E'|」を表示する。
- SHUFFLE: 「使用」を押すとランダムに入れ替える。F14がONなら「現在の|K_E| → 使用後の予測|K_E'|」を表示する。
- DOUBLE/HIGH&LOW/SLASH: 説明のみ。結果はF2のログに追加する。

### 9.4 開示桁の選択UI
- ENEMYのDOUBLEが失敗したとき(E_DISCLOSE)に表示するダイアログ。モーダル(位置 380,200、大きさ 520×200)。文言は「開示させる桁を選んでください」、ボタンは第1～第n桁(1つ選ぶと確定)。

### 9.5 結果画面
- モーダル(位置 340,180、大きさ 600×360)。表示内容: 勝敗(PLAYER勝ち/ENEMY勝ち/引き分け)、ENEMYの秘密番号、総ラウンド数、追加ターンの有無と結果。
- ボタン: 「準備に戻る」(SETUPへ)、「同じ設定で再戦」(n・難度・アイテム・先攻/後攻を引き継ぎ、秘密番号の入力だけ行う)。

### 9.6 設定パネル
- R_STATUS右端の設定ボタンで開くモーダル(位置 400,140、大きさ 480×440)。
- F3・F5～F14 のCheckboxを1行28pxで11行、「数値表示(F11)」のCheckbox(1行)、「閉じる」ボタンを並べる(Checkbox行は計12行)。F1・F2・F4 はCheckboxなしで常時ON表示とする。

### 9.7 R_WORK 内部配置(R_WORK の左上を原点、520×300)
- スロット行: y=8、各64×64、間隔8、中央揃え(n=6 のとき424px)
- F7ラベル: y=76、高さ24
- 数字パネル: y=104、各88×56、間隔8(5列×2行、全体472×120)、中央揃え
- ボタン行: y=236、各140×48、間隔12、中央揃え。F8がOFFなら「予習」を非表示にし、「クリア」「確定」を中央に配置する

*/


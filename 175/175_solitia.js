// solitia



// ######################################################################


// ######################################################################

export var createScene_test_4000 = async function () {
// ============================================================================
//  クロンダイク (Klondike Solitaire) - Babylon.js Playground (JavaScript)
//  対象: Babylon.js v9 以上 / Playground の「JavaScript」モードに貼り付けて実行
//
//  操作
//    ・山札クリック          : めくる / 山札が空なら捨て札を戻す (8.5)
//    ・カードをドラッグ      : 移動 (場札の束 / 捨て札の一番上 / 組札の一番上)
//    ・カードをダブルクリック: 移動できる先へ自動で移動 (組札優先)
//    ・画面上部のボタン      : 新規(Draw1/Draw3) / UNDO / 自動移動 / 可否表示 / 中断
//
//  実装メモ
//    ・盤面は XY 平面、カメラは -Z から +Z を見る正射影カメラ (カードは平面メッシュ)
//    ・カード絵柄: ART に画像URLを指定するとスートごとに1枚選び、ランクごとに
//      画像の一部(5x3 グリッドの1セル)を切り抜いて使う。未指定ならコードで生成した絵柄を使う
//    ・ルール番号 (6.3 など) はコメントの対応先。仕様書の章に対応している
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
    const ART = {
        cols: 5, rows: 3, // ランクごとの切り抜きグリッド (5x3=15セル >= 13ランク)
        suitImages: [[], [], [], []],
        backImages: [],
    };

    const settings = { autoMove: true, showMovable: false }; // 16.1 既定ON / 16.2 既定OFF

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

    const CW = 1.0, CH = 1.4;                 // カードサイズ(ワールド単位)
    const COL_PITCH = 1.22;
    const colX = (i) => (i - 3) * COL_PITCH;  // 第1列～第7列のX (列index 0..6)
    const ROW_Y = 0;                          // 上段(山札・捨て札・組札)の中心Y
    const TAB_Y0 = -1.95;                     // 場札の先頭カード中心Y
    const DY_DOWN = 0.16, DY_UP = 0.38;       // 場札の重なり間隔(裏向き / 表向き)
    const MAX_SPAN = 6.0;                     // 場札列の最大の縦幅 (超えたら詰める)
    const STOCK_X = colX(0), WASTE_X = colX(1);
    const FOUND_X = (f) => colX(3 + f);       // 組札は右上 (列3～6の上)
    const FAN_DX = 0.3;                       // Draw3 の捨て札の扇状ずらし幅

    const PF_W = 9.2, PF_TOP = 1.15, PF_BOTTOM = -9.0, PF_H = PF_TOP - PF_BOTTOM;
    const BAR_PX = 56;                        // 上部ツールバーの高さ(px)

    // ------------------------------------------------------------------
    // カメラ (正射影)
    // ------------------------------------------------------------------
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -20), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.minZ = 0.1;
    camera.maxZ = 100;

    function updateCamera() {
        const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
        const s = Math.max(PF_W / w, PF_H / Math.max(1, h - BAR_PX)); // ワールド単位 / px
        const vw = s * w, vh = s * h;
        camera.orthoLeft = -vw / 2;
        camera.orthoRight = vw / 2;
        camera.orthoTop = PF_TOP + s * BAR_PX; // 盤面の上にツールバー分の余白
        camera.orthoBottom = camera.orthoTop - vh;
    }
    engine.onResizeObservable.add(updateCamera);
    updateCamera();

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
    const imageCache = new Map();
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
        const urls = [...ART.backImages, ...ART.suitImages.flat()];
        await Promise.all(urls.map(async (u) => imageCache.set(u, await loadImage(u))));
    }

    // ----- 自動生成の絵柄 (スートごとの 5x3 グリッド画像) -----
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
        const cw = W / ART.cols, ch = H / ART.rows;
        g.fillStyle = "rgba(255,255,255,0.22)";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = '150px "Segoe UI Symbol","Apple Symbols","Noto Sans Symbols",serif';
        for (let cy = 0; cy < ART.rows; cy++)
            for (let cx = 0; cx < ART.cols; cx++) g.fillText(SUITS[suit].sym, (cx + 0.5) * cw, (cy + 0.5) * ch);
        return cv;
    }
    function pickSuitArt(suit) {
        const ok = ART.suitImages[suit].filter((u) => imageCache.get(u));
        if (ok.length > 0) return imageCache.get(ok[Math.floor(Math.random() * ok.length)]);
        return makeProceduralArt(suit, Math.floor(Math.random() * 100000));
    }
    function pickBackArt() {
        const ok = ART.backImages.filter((u) => imageCache.get(u));
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
        const px = 64, py = 66, pw = 128, ph = 226;
        ctx.save();
        rr(ctx, px, py, pw, ph, 10);
        ctx.clip();
        const idx = card.rank - 1;
        const gx = idx % ART.cols, gy = Math.floor(idx / ART.cols);
        const cw = art.width / ART.cols, ch = art.height / ART.rows;
        const aspect = pw / ph;
        let sw = cw, sh = cw / aspect;
        if (sh > ch) { sh = ch; sw = ch * aspect; }
        const sx = gx * cw + (cw - sw) / 2, sy = gy * ch + (ch - sh) / 2;
        ctx.drawImage(art, sx, sy, sw, sh, px, py, pw, ph);
        ctx.restore();
        rr(ctx, px, py, pw, ph, 10);
        ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();

        // 角のインデックス (左上 + 180度回転した右下)
        const drawIndex = () => {
            ctx.fillStyle = col;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = 'bold 44px "Segoe UI","Hiragino Sans",Arial,sans-serif';
            ctx.fillText(RANK_LABEL[card.rank], 36, 40);
            ctx.font = '42px "Segoe UI Symbol","Apple Symbols","Noto Sans Symbols",serif';
            ctx.fillText(suit.sym, 36, 88);
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
    function addSlot(x, y, tex) {
        const p = BABYLON.MeshBuilder.CreatePlane("slot", { width: CW, height: CH }, scene);
        p.position.set(x, y, 0.5);
        p.material = makeTexMat("slotMat", tex, BABYLON.Material.MATERIAL_ALPHABLEND);
        p.isPickable = false;
        return p;
    }
    for (let i = 0; i < 7; i++) addSlot(colX(i), TAB_Y0, slotTex);          // 場札
    const stockSlot = addSlot(STOCK_X, ROW_Y, slotTex);                     // 山札
    addSlot(WASTE_X, ROW_Y, slotTex);                                       // 捨て札
    for (let f = 0; f < 4; f++) addSlot(FOUND_X(f), ROW_Y, aceTex);         // 組札

    // ----- テーブル -----
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
        const table = BABYLON.MeshBuilder.CreatePlane("table", { size: 60 }, scene);
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
    function buildCards() {
        backTex = new BABYLON.DynamicTexture("backTex", { width: TEX_W, height: TEX_H }, scene, true);
        const backMat = makeTexMat("backMat", backTex, BABYLON.Material.MATERIAL_ALPHATEST);
        for (let id = 0; id < 52; id++) {
            const suit = Math.floor(id / 13), rank = (id % 13) + 1;
            const card = {
                id, suit, rank,
                faceUp: false, noAuto: false, dragging: false,
                holdUntil: 0,
                lx: 0, ly: 0, lz: 0,          // レイアウト上の位置 (当たり判定用)
                tx: 0, ty: 0, tz: 0, tRot: Math.PI, // 目標値
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
            cards.push(card);
        }
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
    confetti.emitter = new BABYLON.Vector3(0, PF_TOP + 1.5, -6);
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
    bar.height = BAR_PX + "px";
    bar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    bar.background = "rgba(0,0,0,0.45)";
    bar.thickness = 0;
    ui.addControl(bar);
    const panel = new GUI.StackPanel("panel");
    panel.isVertical = false;
    panel.height = "40px";
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.paddingLeft = "10px";
    bar.addControl(panel);

    function addButton(label, width, handler) {
        const b = GUI.Button.CreateSimpleButton("btn_" + label, label);
        b.width = width + "px"; b.height = "36px";
        b.color = "white"; b.fontSize = 15; b.cornerRadius = 8;
        b.background = "#2f7f5f"; b.thickness = 1; b.paddingRight = "6px";
        b.onPointerUpObservable.add(handler);
        panel.addControl(b);
        return b;
    }
    addButton("新規 Draw1", 100, () => newGame(1));
    addButton("新規 Draw3", 100, () => newGame(3));
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
        }
    });
    const info = new GUI.TextBlock("info", "");
    info.width = "270px"; info.height = "36px"; info.color = "#d8f3e6"; info.fontSize = 13;
    info.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    info.paddingLeft = "8px";
    panel.addControl(info);

    const msg = new GUI.TextBlock("msg", "");
    msg.fontSize = 64; msg.fontStyle = "bold"; msg.color = "white";
    msg.shadowColor = "black"; msg.shadowBlur = 8;
    msg.isVisible = false; msg.isHitTestVisible = false;
    ui.addControl(msg);

    const hint = new GUI.TextBlock("hint", "ドラッグで移動 / ダブルクリックで自動移動 / 山札クリックでめくる");
    hint.fontSize = 13; hint.color = "rgba(255,255,255,0.6)"; hint.height = "26px";
    hint.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    hint.isHitTestVisible = false;
    ui.addControl(hint);

    function showMessage(t) { msg.text = t; msg.isVisible = true; }
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
        if (scene.pointerY < BAR_PX) return; // ツールバー上は無視
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
    // 新規ゲーム (第4章)
    // ------------------------------------------------------------------
    function newGame(mode) {
        state = {
            drawMode: mode,
            tableau: [[], [], [], [], [], [], []],
            stock: [], waste: [], foundation: [[], [], [], []],
            status: "playing", undo: null,
        };
        pending = null;
        lastClick = { key: -1, time: 0 };
        hideMessage();
        confetti.stop();
        cards.forEach((c) => {
            c.faceUp = false; c.noAuto = false; c.dragging = false;
            c.tilt = 0; c.rz = 0; c.sc = 1; c.holdUntil = 0;
        });
        redrawArt();

        // 4.2 シャッフル後の並びの先頭から、列ごとに 1,2,...,7 枚を配置 (各列の末尾のみ表向き)
        const deck = shuffle(cards.slice());
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
    // 起動
    // ------------------------------------------------------------------
    preloadImages().then(() => {
        buildCards();
        newGame(1);
    });

    return scene;
};

// ######################################################################


const ddbase2="";
// const ddbase2="https://raw.githubusercontent.com/fnamuoo/webgl/main/175/";
const fpathHearts = ddbase2 + "textures/hearts.png";
const fpathDiamonds = ddbase2 + "textures/diamonds.png";
const fpathClubs = ddbase2 + "textures/clubs.png";
const fpathSpades = ddbase2 + "textures/spades.png";
const fpathBabylonLogo = ddbase2 + "textures//babylon_logo_color.png";


export var createScene_test_4001 = async function () {
// ============================================================================
//  クロンダイク (Klondike Solitaire) - Babylon.js Playground (JavaScript)
//  対象: Babylon.js v9 以上 / Playground の「JavaScript」モードに貼り付けて実行
//
//  操作
//    ・山札クリック          : めくる / 山札が空なら捨て札を戻す (8.5)
//    ・カードをドラッグ      : 移動 (場札の束 / 捨て札の一番上 / 組札の一番上)
//    ・カードをダブルクリック: 移動できる先へ自動で移動 (組札優先)
//    ・画面上部のボタン      : 新規(Draw1/Draw3) / UNDO / 自動移動 / 可否表示 / 中断
//
//  実装メモ
//    ・盤面は XY 平面、カメラは -Z から +Z を見る正射影カメラ (カードは平面メッシュ)
//    ・カード絵柄: ART に画像URLを指定するとスートごとに1枚選び、ランクごとに
//      画像の一部(5x3 グリッドの1セル)を切り抜いて使う。未指定ならコードで生成した絵柄を使う
//    ・ルール番号 (6.3 など) はコメントの対応先。仕様書の章に対応している
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

    const ART = {
        cols: 7, rows: 2, // ランクごとの切り抜きグリッド (5x3=15セル >= 13ランク)
        suitImages: [[fpathHearts], [fpathDiamonds], [fpathClubs], [fpathSpades]],
        backImages: [fpathBabylonLogo],
    };

    const settings = { autoMove: true, showMovable: false }; // 16.1 既定ON / 16.2 既定OFF

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

    const CW = 2.5, CH = CW*1.4;                 // カードサイズ(ワールド単位)
    const COL_PITCH = CW*1.22;
    const colX = (i) => (i - 3) * COL_PITCH;  // 第1列～第7列のX (列index 0..6)
    const ROW_Y = 0;                          // 上段(山札・捨て札・組札)の中心Y
//    const TAB_Y0 = -CW*1.95;                     // 場札の先頭カード中心Y
    const TAB_Y0 = -CW*1.6;                     // 場札の先頭カード中心Y
    const DY_DOWN = 0.16, DY_UP = 0.48;       // 場札の重なり間隔(裏向き / 表向き)
    const MAX_SPAN = 6.0;                     // 場札列の最大の縦幅 (超えたら詰める)
    const STOCK_X = colX(0), WASTE_X = colX(1);
    const FOUND_X = (f) => colX(3 + f);       // 組札は右上 (列3～6の上)
    const FAN_DX = 0.3;                       // Draw3 の捨て札の扇状ずらし幅

//    const PF_W = 9.2, PF_TOP = CW*1.15, PF_BOTTOM = -9.0, PF_H = PF_TOP - PF_BOTTOM;
    const PF_W = 9.2, PF_TOP = CW*1.0, PF_BOTTOM = -10.0, PF_H = PF_TOP - PF_BOTTOM;
    const BAR_PX = 56;                        // 上部ツールバーの高さ(px)

    // ------------------------------------------------------------------
    // カメラ (正射影)
    // ------------------------------------------------------------------
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -20), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.minZ = 0.1;
    camera.maxZ = 100;

    function updateCamera() {
        const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
        const s = Math.max(PF_W / w, PF_H / Math.max(1, h - BAR_PX)); // ワールド単位 / px
        const vw = s * w, vh = s * h;
        camera.orthoLeft = -vw / 2;
        camera.orthoRight = vw / 2;
        camera.orthoTop = PF_TOP + s * BAR_PX; // 盤面の上にツールバー分の余白
        camera.orthoBottom = camera.orthoTop - vh;
    }
    engine.onResizeObservable.add(updateCamera);
    updateCamera();

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
    const imageCache = new Map();
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
        const urls = [...ART.backImages, ...ART.suitImages.flat()];
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
        const cw = W / ART.cols, ch = H / ART.rows;
        g.fillStyle = "rgba(255,255,255,0.22)";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = '150px "Segoe UI Symbol","Apple Symbols","Noto Sans Symbols",serif';
        for (let cy = 0; cy < ART.rows; cy++)
            for (let cx = 0; cx < ART.cols; cx++) g.fillText(SUITS[suit].sym, (cx + 0.5) * cw, (cy + 0.5) * ch);
        return cv;
    }
    function pickSuitArt(suit) {
        const ok = ART.suitImages[suit].filter((u) => imageCache.get(u));
        if (ok.length > 0) return imageCache.get(ok[Math.floor(Math.random() * ok.length)]);
        return makeProceduralArt(suit, Math.floor(Math.random() * 100000));
    }
    function pickBackArt() {
        const ok = ART.backImages.filter((u) => imageCache.get(u));
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
//        const px = 64, py = 66, pw = 128, ph = 226;
        const px = 30, py = 30, pw = 200, ph = 300;
        const px2 = -5, py2 = -5, pw2 = 240, ph2 = 320; // 画像の中心寄りで切り抜く（画像の枠線が表示されると邪魔
        ctx.save();
        rr(ctx, px, py, pw, ph, 10);
        ctx.clip();
        const idx = card.rank - 1;
        const gx = idx % ART.cols, gy = Math.floor(idx / ART.cols);
        const cw = art.width / ART.cols, ch = art.height / ART.rows;
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
            ctx.fillRect(10, 10, 60, 100);

            ctx.fillStyle = col;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = 'bold 44px "Segoe UI","Hiragino Sans",Arial,sans-serif';
            ctx.fillText(RANK_LABEL[card.rank], 36, 40); // ランク表示
            ctx.font = '42px "Segoe UI Symbol","Apple Symbols","Noto Sans Symbols",serif';
            ctx.fillText(suit.sym, 36, 88); // スートのマーク(SUITS.sym)表示
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
    function addSlot(x, y, tex) {
        const p = BABYLON.MeshBuilder.CreatePlane("slot", { width: CW, height: CH }, scene);
        p.position.set(x, y, 0.5);
        p.material = makeTexMat("slotMat", tex, BABYLON.Material.MATERIAL_ALPHABLEND);
        p.isPickable = false;
        return p;
    }
    for (let i = 0; i < 7; i++) addSlot(colX(i), TAB_Y0, slotTex);          // 場札
    const stockSlot = addSlot(STOCK_X, ROW_Y, slotTex);                     // 山札
    addSlot(WASTE_X, ROW_Y, slotTex);                                       // 捨て札
    for (let f = 0; f < 4; f++) addSlot(FOUND_X(f), ROW_Y, aceTex);         // 組札

    // ----- テーブル -----
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
        const table = BABYLON.MeshBuilder.CreatePlane("table", { size: 60 }, scene);
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
    function buildCards() {
        backTex = new BABYLON.DynamicTexture("backTex", { width: TEX_W, height: TEX_H }, scene, true);
        const backMat = makeTexMat("backMat", backTex, BABYLON.Material.MATERIAL_ALPHATEST);
        for (let id = 0; id < 52; id++) {
            const suit = Math.floor(id / 13), rank = (id % 13) + 1;
            const card = {
                id, suit, rank,
                faceUp: false, noAuto: false, dragging: false,
                holdUntil: 0,
                lx: 0, ly: 0, lz: 0,          // レイアウト上の位置 (当たり判定用)
                tx: 0, ty: 0, tz: 0, tRot: Math.PI, // 目標値
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
            cards.push(card);
        }
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
    confetti.emitter = new BABYLON.Vector3(0, PF_TOP + 1.5, -6);
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
    bar.height = BAR_PX + "px";
    bar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    bar.background = "rgba(0,0,0,0.45)";
    bar.thickness = 0;
    ui.addControl(bar);
    const panel = new GUI.StackPanel("panel");
    panel.isVertical = false;
    panel.height = "40px";
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.paddingLeft = "10px";
    bar.addControl(panel);

    function addButton(label, width, handler) {
        const b = GUI.Button.CreateSimpleButton("btn_" + label, label);
        b.width = width + "px"; b.height = "36px";
        b.color = "white"; b.fontSize = 15; b.cornerRadius = 8;
        b.background = "#2f7f5f"; b.thickness = 1; b.paddingRight = "6px";
        b.onPointerUpObservable.add(handler);
        panel.addControl(b);
        return b;
    }
    addButton("新規 Draw1", 100, () => newGame(1));
    addButton("新規 Draw3", 100, () => newGame(3));
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
        }
    });
    const info = new GUI.TextBlock("info", "");
    info.width = "270px"; info.height = "36px"; info.color = "#d8f3e6"; info.fontSize = 13;
    info.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    info.paddingLeft = "8px";
    panel.addControl(info);

    const msg = new GUI.TextBlock("msg", "");
    msg.fontSize = 64; msg.fontStyle = "bold"; msg.color = "white";
    msg.shadowColor = "black"; msg.shadowBlur = 8;
    msg.isVisible = false; msg.isHitTestVisible = false;
    ui.addControl(msg);

    const hint = new GUI.TextBlock("hint", "ドラッグで移動 / ダブルクリックで自動移動 / 山札クリックでめくる");
    hint.fontSize = 13; hint.color = "rgba(255,255,255,0.6)"; hint.height = "26px";
    hint.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    hint.isHitTestVisible = false;
    ui.addControl(hint);

    function showMessage(t) { msg.text = t; msg.isVisible = true; }
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
        if (scene.pointerY < BAR_PX) return; // ツールバー上は無視
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
    // 新規ゲーム (第4章)
    // ------------------------------------------------------------------
    function newGame(mode) {
        state = {
            drawMode: mode,
            tableau: [[], [], [], [], [], [], []],
            stock: [], waste: [], foundation: [[], [], [], []],
            status: "playing", undo: null,
        };
        pending = null;
        lastClick = { key: -1, time: 0 };
        hideMessage();
        confetti.stop();
        cards.forEach((c) => {
            c.faceUp = false; c.noAuto = false; c.dragging = false;
            c.tilt = 0; c.rz = 0; c.sc = 1; c.holdUntil = 0;
        });
        redrawArt();

        // 4.2 シャッフル後の並びの先頭から、列ごとに 1,2,...,7 枚を配置 (各列の末尾のみ表向き)
        const deck = shuffle(cards.slice());
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
    // 起動
    // ------------------------------------------------------------------
    preloadImages().then(() => {
        buildCards();
        newGame(1);
    });

    return scene;
};

// ######################################################################

// export var createScene = createScene_test_4000; // 
 export var createScene = createScene_test_4001; // 

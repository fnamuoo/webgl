// 177.クリーニングゲーム

// ######################################################################

// Babylon.js 9+ Playground (JavaScript)
// 薄い直方体の「キャンバス」に外部URLの画像を貼り、デカールで汚したり、きれいにしたりするサンプル
// (球 / ダイヤモンドカット も切り替え可能)
//
// 操作:
//   ドラッグ                 : 汚す
//   Shift+ドラッグ / ボタン  : きれいにする(掃除)
//   ← → キー / ボタン        : 画像の切り替え
//   きれい度が CLEAR_THRESHOLD(%) 以上になるとクリア → 次のステージ(画像 → 球 → ダイヤ → …)へ
//   ゲーム開始時と、クリアして次のステージへ進むときは、全面が汚れた状態(きれい度 ほぼ0%)から始まる
//   形の外側をドラッグ       : カメラ回転 / ホイール: ズーム
//
// 画像の追加:
//   ・下の IMAGE_LIST に { name, url } を足す
//   ・実行中に「URL追加」ボタンで入力する
//   画像サーバーは CORS を許可している必要がある(WebGLテクスチャとして使うため)。
//   読み込みに失敗したときは、エラー表示つきの代替画像になる。
//
// 仕組み:
//   MeshUVSpaceRenderer は、投影したテクスチャをメッシュの UV 空間の RenderTarget に
//   アルファブレンド(ALPHA_COMBINE)で描き足していく。
//   ブレンドは「dst = src * src.a + dst * (1 - src.a)」なので RGB は src 方向への補間になる。
//   これを利用して、RGB を「汚れ量」を持つ双方向チャンネルとして使う。
//     R : 汚れ量 (汚す筆は R=1 に向けて、掃除の筆は R=0 に向けて補間)
//     G : 汚れの色味のばらつき (汚す筆だけが値を持つ)
//   自前の ShaderMaterial で「画像(またはベース色)」と「汚れ」を合成して表示する。
//   汚れは画像とは別のテクスチャなので、掃除すると下の画像がそのまま現れる。
//
// 汚れた状態から始める仕組み:
//   MeshUVSpaceRenderer の clearColor を (R=1, G=0.5) にして汚れレイヤー全体を塗りつぶす。
//   R=1 が「完全に汚れ」なので、メッシュ表面の全面が確実に汚れる(最初のきれい度は ほぼ0%)。
//   色味のまだら模様は、その上に汚れのスタンプを重ねて作る(R は 1 のまま、G だけが変わる)。
//
// きれい度の測り方:
//   汚れテクスチャ(GPU上)のミップレベル1を readPixels で読み戻し、R 値を表示用シェーダーと同じ
//   smoothstep で「汚れ量」に換算する。各テクセルは「UV上の1テクセルが表す表面積」で重み付けして
//   平均する(球の極付近や、解像度の違う面があっても面積比で正しく集計できる)。
//   キャンバスは画像を貼った表の面だけが対象。
//
// メッシュについて:
//   UV 空間に描くので、UV が重なっていないメッシュが必要。
//   直方体とダイヤは buildFacetMesh() で作る。各面を平面に展開し、UV アトラスに詰めて配置する。
//   キャンバスは、画像を貼る表の面を大きく(高密度)、裏と側面は半分の密度にして、
//   表の面の解像度を稼いでいる。

export var createScene_test_4202 = async function () {
    // ===== 設定 =====
    var TEX_SIZE = 2048;          // UV空間テクスチャの解像度(形ごとに1枚。重い場合は 1024)
    var BRUSH_SIZE = 0.5;         // 筆の大きさ(ワールド単位)
    var DIRT_ALPHA = 0.55;        // 汚れ1スタンプあたりの強さ (0-1)
    var CLEAN_ALPHA = 0.45;       // 掃除1スタンプあたりの強さ (0-1)
    var EDGE_BLENDING = false;    // true で UV のシーム補正を有効化(球の継ぎ目の細い線対策)
    var MAX_STAMPS_PER_FRAME = 4; // 1フレームに処理するスタンプ数

    let rate = 1.5;
    var CANVAS_MAX_W = 3.4*rate;       // キャンバスの最大の幅 / 高さ(画像の縦横比に合わせて決まる)
    var CANVAS_MAX_H = 2.6*rate;
    var CANVAS_THICKNESS = 0.14;  // キャンバスの厚み
    var MAX_CANVAS_CACHE = 3;     // 汚れの状態を保持するキャンバスの数(超えると古いものから破棄)

    var CLEAR_THRESHOLD = 98;     // このきれい度(%)以上でクリア。試すときは 50 などに下げる
    var AUTO_ADVANCE = true;      // クリア後に次のステージへ自動で進む
    var CLEAR_BANNER_MS = 2200;   // 「CLEAR!」を表示する時間
    var START_CLEAN_MAX = 10;     // 開始時のきれい度の上限(%)。これを超えたらコンソールに警告を出す
    var MEASURE_LEVEL = 1;        // きれい度の測定に読むミップレベル(1 なら TEX_SIZE/2 四方)
    var MEASURE_INTERVAL_MS = 700;// 塗っている間の測定間隔(読み戻しは重いので間引く)

//    const dbase = "./"
    const dbase = "https://raw.githubusercontent.com/fnamuoo/webgl/main/177/"

    // 画像リスト。url が null なら内蔵のサンプル画像(通信なし)。
    // 自分の画像は { name: "名前", url: "https://..." } を追加する。
    var IMAGE_LIST = [
        { name: "内蔵サンプル", url: null },
        // { name: "roof.jpg (Babylon)", url: "https://assets.babylonjs.com/environments/roof.jpg" },
        // { name: "crate.png (Babylon)", url: "https://www.babylonjs-playground.com/textures/crate.png" },
        // { name: "amiga.jpg (Babylon)", url: "https://www.babylonjs-playground.com/textures/amiga.jpg" }
        { name: "モナリザ", url: dbase+"textures/pic_モナリザ.jpg" },
        { name: "見返り美人", url: dbase+"textures/pic_見返り美人.png" },
        { name: "散歩・日傘をさす女", url: dbase+"textures/pic_風に舞う花畑のパラソル少女.png" },
        { name: "夢想", url: dbase+"textures/pic_夢想.png" },
        { name: "聖女", url: dbase+"textures/pic_聖女_.jpg" },
        { name: "フラダンサー", url: dbase+"textures/pic_夕暮れビーチのちびフラダンサー.png" },
        { name: "スケーター", url: dbase+"textures/pic_氷上で舞うきらめきのスケーター.png" },
        { name: "マーチングガール", url: dbase+"textures/pic_青空に舞う華やかなマーチングガール.png" },
        { name: "水中", url: dbase+"textures/pic_水中に揺れる少女の笑顔.png" },
        { name: "草原", url: dbase+"textures/pic_草原で手を振る少女.png" },
        { name: "くま着ぐるみ", url: dbase+"textures/pic_くま着ぐるみのキュートな昼下がり.png" },
        { name: "小野小町", url: dbase+"textures/pic_桜舞う平安風お姫様の庭.png" },
        { name: "よさこい", url: dbase+"textures/pic_躍動するよさこい祭りの少女.png" },
        { name: "自由の女神", url: dbase+"textures/pic_自由の女神.png" },
        { name: "民衆を導く自由の女神", url: dbase+"textures/pic_民衆を導く自由の女神.png" },
        { name: "天照大御神", url: dbase+"textures/pic_天照大御神.png" },
    ];

    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.07, 0.08, 0.11, 1);

    var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 7, BABYLON.Vector3.Zero(), scene);
    camera.lowerRadiusLimit = 3.5;
    camera.upperRadiusLimit = 14;
    camera.wheelDeltaPercentage = 0.01;
    camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // ← → キーは画像切替に使う
    camera.attachControl(canvas, true);

    // ===== ファセットメッシュ生成(UVが重ならない) =====
    // facets : 各面の頂点配列(平面ポリゴン。原点を内部に含む凸形状を想定)
    // opts.weights : 面ごとのUV密度の倍率(省略時 1)
    // opts.axes    : 面ごとの展開軸 { u, v } (省略/null のとき自動)
    // 戻り値: { mesh, rects }  rects[i] は面 i の UV 上の矩形 { u0, v0, u1, v1 }
    function buildFacetMesh(name, facets, opts) {
        opts = opts || {};
        var V = BABYLON.Vector3;
        var weights = opts.weights || [];
        var axes = opts.axes || [];

        // 1. 面の向きを外向きに揃え、面ごとの2D座標(平面展開)とそのサイズを求める
        var infos = facets.map(function (pts, k) {
            var c = V.Zero();
            pts.forEach(function (p) { c.addInPlace(p); });
            c.scaleInPlace(1 / pts.length);
            var n = V.Cross(pts[1].subtract(pts[0]), pts[2].subtract(pts[0])).normalize();
            if (V.Dot(n, c) < 0) { pts = pts.slice().reverse(); n.scaleInPlace(-1); }
            var u, v;
            if (axes[k]) {
                u = axes[k].u.clone().normalize();
                v = axes[k].v.clone().normalize();
            } else {
                u = pts[1].subtract(pts[0]).normalize();
                v = V.Cross(n, u);
            }
            var minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
            var p2 = pts.map(function (p) {
                var r = p.subtract(c);
                var q = { x: V.Dot(r, u), y: V.Dot(r, v) };
                minx = Math.min(minx, q.x); maxx = Math.max(maxx, q.x);
                miny = Math.min(miny, q.y); maxy = Math.max(maxy, q.y);
                return q;
            });
            return {
                pts: pts, p2: p2, minx: minx, miny: miny,
                w: maxx - minx, h: maxy - miny,
                weight: (weights[k] === undefined) ? 1 : weights[k]
            };
        });

        // 2. シェルフ方式でアトラスに詰める。UV密度(ワールド1単位あたりのUV長)を二分探索で最大化
        var GAP = 0.004, MARGIN = 0.006;
        function pack(s) {
            var order = infos.map(function (_, i) { return i; }).sort(function (a, b) {
                return infos[b].h * infos[b].weight - infos[a].h * infos[a].weight;
            });
            var x = MARGIN, y = MARGIN, rowH = 0, place = [];
            for (var oi = 0; oi < order.length; oi++) {
                var i = order[oi];
                var w = infos[i].w * infos[i].weight * s;
                var h = infos[i].h * infos[i].weight * s;
                if (w > 1 - 2 * MARGIN) { return null; }
                if (x + w > 1 - MARGIN) { x = MARGIN; y += rowH + GAP; rowH = 0; }
                place[i] = { x: x, y: y, w: w, h: h };
                x += w + GAP;
                rowH = Math.max(rowH, h);
            }
            return (y + rowH <= 1 - MARGIN) ? place : null;
        }
        var lo = 0, hi = 4, place = null;
        for (var it = 0; it < 40; it++) {
            var mid = (lo + hi) / 2;
            var pl = pack(mid);
            if (pl) { place = pl; lo = mid; } else { hi = mid; }
        }
        if (!place) { lo = 1e-3; place = pack(lo); }

        var positions = [], uvs = [], indices = [], rects = [];
        infos.forEach(function (info, k) {
            var pl = place[k];
            var f = lo * info.weight;
            var base = positions.length / 3;
            info.pts.forEach(function (p, j) {
                positions.push(p.x, p.y, p.z);
                uvs.push(pl.x + (info.p2[j].x - info.minx) * f, pl.y + (info.p2[j].y - info.miny) * f);
            });
            for (var j = 1; j < info.pts.length - 1; j++) { indices.push(base, base + j, base + j + 1); }
            rects.push({ u0: pl.x, v0: pl.y, u1: pl.x + pl.w, v1: pl.y + pl.h });
        });

        // 3. フラットシェーディング用の法線(面ごとに頂点を持つので面法線になる)
        var normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        var outward = 0;
        for (var i = 0; i < positions.length; i += 3) {
            outward += normals[i] * positions[i] + normals[i + 1] * positions[i + 1] + normals[i + 2] * positions[i + 2];
        }
        if (outward < 0) { // ウィンディングが逆なら全体を反転
            for (var t = 0; t < indices.length; t += 3) {
                var tmp = indices[t + 1]; indices[t + 1] = indices[t + 2]; indices[t + 2] = tmp;
            }
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        }

        var mesh = new BABYLON.Mesh(name, scene);
        var vd = new BABYLON.VertexData();
        vd.positions = positions;
        vd.indices = indices;
        vd.normals = normals;
        vd.uvs = uvs;
        vd.applyToMesh(mesh);
        return { mesh: mesh, rects: rects };
    }

    // 順序: +X, -X, +Y, -Y, +Z, -Z   (-Z がカメラ側 = 画像を貼る表の面)
    function boxFacets(w, h, d) {
        var V = BABYLON.Vector3;
        var x = w / 2, y = h / 2, z = d / 2;
        return [
            [new V(x, -y, -z), new V(x, y, -z), new V(x, y, z), new V(x, -y, z)],      // +X
            [new V(-x, -y, -z), new V(-x, y, -z), new V(-x, y, z), new V(-x, -y, z)],  // -X
            [new V(-x, y, -z), new V(x, y, -z), new V(x, y, z), new V(-x, y, z)],      // +Y
            [new V(-x, -y, -z), new V(x, -y, -z), new V(x, -y, z), new V(-x, -y, z)],  // -Y
            [new V(-x, -y, z), new V(x, -y, z), new V(x, y, z), new V(-x, y, z)],      // +Z
            [new V(-x, -y, -z), new V(x, -y, -z), new V(x, y, -z), new V(-x, y, -z)]   // -Z
        ];
    }

    // 画像を貼る表の面(-Z)だけ高密度。展開軸を +X/+Y に固定して、画像が正立・非反転で貼れるようにする
    function buildCanvasMesh(name, W, H, T) {
        var V = BABYLON.Vector3;
        var res = buildFacetMesh(name, boxFacets(W, H, T), {
            weights: [0.5, 0.5, 0.5, 0.5, 0.5, 1.0],
            axes: [null, null, null, null, null, { u: new V(1, 0, 0), v: new V(0, 1, 0) }]
        });
        return { mesh: res.mesh, frontRect: res.rects[5] };
    }

    // ブリリアントカット風: テーブル(八角形) + クラウン(三角16面) + パビリオン(三角8面)
    function diamondFacets() {
        var V = BABYLON.Vector3;
        var n = 8, R = 1.5, tableR = R * 0.55, crownH = 0.5, pavilionH = 1.3;
        var T = [], G = [];
        for (var i = 0; i < n; i++) {
            var a = i * Math.PI * 2 / n;
            var b = (i + 0.5) * Math.PI * 2 / n;
            T.push(new V(Math.cos(a) * tableR, crownH, Math.sin(a) * tableR));
            G.push(new V(Math.cos(b) * R, 0, Math.sin(b) * R));
        }
        var culet = new V(0, -pavilionH, 0);
        var f = [T.slice()]; // テーブル
        for (var k = 0; k < n; k++) {
            var k1 = (k + 1) % n, kp = (k + n - 1) % n;
            f.push([T[k], T[k1], G[k]]);      // クラウン: テーブル辺から下がる三角
            f.push([G[kp], G[k], T[k]]);      // クラウン: ガードル辺から上がる三角
            f.push([G[k], G[k1], culet]);     // パビリオン
        }
        return f;
    }

    // ===== 形(シェイプ)の管理 =====
    // depth: 投影ボックスの奥行き/幅の比。曲面や折れ目をまたいで描きたいほど大きく、
    //        平面だけの形は小さくして、辺の向こう側の面へ筋状にはみ出すのを防ぐ。
    var fixedShapes = {};   // 球, ダイヤ
    var canvasCache = [];   // { index, shape }  最近使った順(末尾が最新)

    function makeShape(key, mesh, depth, baseColor, gridAmount, specAmount, initialDirt) {
        var temp = new BABYLON.StandardMaterial("temp_" + key, scene); // レンダラー準備完了までの仮マテリアル
        temp.diffuseColor = new BABYLON.Color3(0.8, 0.85, 0.9);
        mesh.material = temp;
        mesh.setEnabled(false);
        return {
            key: key, mesh: mesh, tempMat: temp, depth: depth,
            baseColor: baseColor, gridAmount: gridAmount, specAmount: specAmount, initialDirt: initialDirt,
            imageTex: null, imageRect: null, sample: null,
            dirt: null, mat: null, ready: false,
            // きれい度の測定
            percent: null, cleared: false, measuring: false, needMeasure: false,
            mask: null, measureFilter: null, imageIndex: -1, disposed: false,
            freshCheck: false, touched: false
        };
    }

    fixedShapes.sphere = makeShape("sphere",
        BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 3, segments: 64 }, scene),
        1.0, new BABYLON.Color3(0.86, 0.89, 0.93), 1.0, 0.35, 24);
    fixedShapes.diamond = makeShape("diamond",
        buildFacetMesh("diamond", diamondFacets()).mesh,
        1.0, new BABYLON.Color3(0.78, 0.91, 1.0), 0.0, 0.35, 24);

    function allShapes() {
        return Object.keys(fixedShapes).map(function (k) { return fixedShapes[k]; })
            .concat(canvasCache.map(function (e) { return e.shape; }));
    }

    function disposeShape(s) {
        s.disposed = true;
        if (s.dirt) { s.dirt.dispose(); }
        if (s.mat) { s.mat.dispose(); }
        s.mesh.dispose();
        s.tempMat.dispose();
    }

    // ===== 画像 =====
    var images = IMAGE_LIST.map(function (e) { return { name: e.name, url: e.url, tex: null, size: null, status: "idle" }; });
    var imageIndex = 0;
    var showToken = 0;

    // 内蔵サンプル画像 / 読み込み失敗時の代替画像(3:2)
    var PLACEHOLDER_W = 960, PLACEHOLDER_H = 640;
    function makePlaceholderTexture(title, subtitle, failed) {
        var W = PLACEHOLDER_W, H = PLACEHOLDER_H;
        var dt = new BABYLON.DynamicTexture("img_" + title, { width: W, height: H }, scene, true);
        var ctx = dt.getContext();
        if (failed) {
            ctx.fillStyle = "#5a5f6b";
            ctx.fillRect(0, 0, W, H);
            ctx.strokeStyle = "#c9ced8";
            ctx.lineWidth = 6;
            ctx.strokeRect(24, 24, W - 48, H - 48);
            ctx.beginPath(); ctx.moveTo(24, 24); ctx.lineTo(W - 24, H - 24);
            ctx.moveTo(W - 24, 24); ctx.lineTo(24, H - 24); ctx.stroke();
        } else {
            var sky = ctx.createLinearGradient(0, 0, 0, H);
            sky.addColorStop(0, "#6fa8dc");
            sky.addColorStop(0.7, "#f6e7c8");
            sky.addColorStop(1, "#f6e7c8");
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = "#fff4b8";
            ctx.beginPath(); ctx.arc(740, 170, 72, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#5d7a9c";
            ctx.beginPath();
            ctx.moveTo(0, 430); ctx.lineTo(190, 250); ctx.lineTo(350, 410); ctx.lineTo(540, 230);
            ctx.lineTo(730, 430); ctx.lineTo(960, 300); ctx.lineTo(960, H); ctx.lineTo(0, H);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = "#4c7a43";
            ctx.fillRect(0, 470, W, H - 470);
        }
        ctx.textAlign = "center";
        ctx.fillStyle = failed ? "#ffffff" : "rgba(20,30,50,0.85)";
        ctx.font = "bold 54px sans-serif";
        ctx.fillText(title, W / 2, 110);
        ctx.font = "22px sans-serif";
        var sub = subtitle.length > 64 ? subtitle.slice(0, 63) + "…" : subtitle;
        ctx.fillText(sub, W / 2, H - 40);
        dt.update();
        return dt;
    }

    // 画像を読み込む。失敗しても代替画像で resolve するので、常に表示できる
    function loadImage(img) {
        return new Promise(function (resolve) {
            if (img.tex) { resolve(img); return; }
            if (!img.url) {
                img.tex = makePlaceholderTexture("内蔵サンプル", "「URL追加」や IMAGE_LIST で自分の画像を追加できます", false);
                img.size = { width: PLACEHOLDER_W, height: PLACEHOLDER_H };
                img.status = "ok";
                resolve(img);
                return;
            }
            var tex = new BABYLON.Texture(img.url, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
                function () {
                    tex.anisotropicFilteringLevel = 8;
                    img.tex = tex;
                    img.size = tex.getSize(); // 読み込み完了後は実際の画像サイズ
                    img.status = "ok";
                    resolve(img);
                },
                function (message) {
                    console.warn("画像の読み込みに失敗: " + img.url, message);
                    tex.dispose();
                    img.tex = makePlaceholderTexture("読み込み失敗", img.url, true);
                    img.size = { width: PLACEHOLDER_W, height: PLACEHOLDER_H };
                    img.status = "error";
                    resolve(img);
                });
        });
    }

    function shortName(url) {
        try {
            var u = new URL(url);
            var last = decodeURIComponent(u.pathname.split("/").filter(Boolean).pop() || u.hostname);
            return last.length > 26 ? last.slice(0, 25) + "…" : last;
        } catch (e) {
            return url.slice(0, 26);
        }
    }

    // ===== キャンバス(画像ごとに作り、汚れの状態を保持) =====
    function createCanvasShape(index) {
        var img = images[index];
        var aspect = img.size.width / img.size.height;
        var W = Math.min(CANVAS_MAX_W, CANVAS_MAX_H * aspect);
        var H = W / aspect;
        var T = CANVAS_THICKNESS;
        var built = buildCanvasMesh("canvas" + index, W, H, T);
        var s = makeShape("canvas", built.mesh, 0.12, new BABYLON.Color3(0.93, 0.91, 0.86), 0.0, 0.06, 10);
        s.imageTex = img.tex;
        s.imageRect = built.frontRect;
        s.imageIndex = index;
        s.measureFilter = function (nx, ny, nz) { return nz < -0.99; }; // きれい度は画像を貼った表の面だけで測る
        // 最初の汚れは表の面にまく
        s.sample = function () {
            return {
                point: new BABYLON.Vector3((Math.random() - 0.5) * W * 0.96, (Math.random() - 0.5) * H * 0.96, -T / 2),
                normal: new BABYLON.Vector3(0, 0, -1)
            };
        };
        return s;
    }

    function getCanvasShape(index) {
        for (var i = 0; i < canvasCache.length; i++) {
            if (canvasCache[i].index === index) {
                var e = canvasCache.splice(i, 1)[0];
                canvasCache.push(e);
                return e.shape;
            }
        }
        var entry = { index: index, shape: createCanvasShape(index) };
        canvasCache.push(entry);
        while (canvasCache.length > MAX_CANVAS_CACHE) {
            var old = canvasCache[0];
            if (old.shape === active) { break; }
            canvasCache.shift();
            disposeShape(old.shape);
        }
        return entry.shape;
    }

    // ===== 合成シェーダー(WebGL/GLSL) =====
    BABYLON.Effect.ShadersStore["dirtCompositeVertexShader"] = `
        precision highp float;
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;
        uniform mat4 world;
        uniform mat4 worldViewProjection;
        varying vec2 vUV;
        varying vec3 vNormalW;
        varying vec3 vPosW;
        void main(void) {
            vec4 wp = world * vec4(position, 1.0);
            vPosW = wp.xyz;
            vNormalW = normalize(mat3(world) * normal);
            vUV = uv;
            gl_Position = worldViewProjection * vec4(position, 1.0);
        }
    `;

    BABYLON.Effect.ShadersStore["dirtCompositePixelShader"] = `
        precision highp float;
        varying vec2 vUV;
        varying vec3 vNormalW;
        varying vec3 vPosW;
        uniform sampler2D dirtSampler;
        uniform sampler2D imageSampler;
        uniform vec4 imageRect;   // 画像を貼る面の UV 矩形 (u0, v0, u1, v1)
        uniform float useImage;   // 1: imageRect の範囲に画像を貼る
        uniform float specAmount;
        uniform vec3 lightDir;
        uniform vec3 eyePosition;
        uniform vec3 baseColor;
        uniform float gridAmount;
        void main(void) {
            vec3 n = normalize(vNormalW);

            // きれいな状態の表面(球だけ薄い格子模様つき。掃除の効果が分かりやすいように)
            vec2 g = abs(fract(vUV * vec2(24.0, 12.0)) - 0.5);
            float line = step(0.47, max(g.x, g.y)) * gridAmount;
            vec3 base = mix(baseColor, baseColor * 0.68, line);

            // キャンバスの表面: 矩形内を 0-1 に正規化して画像をサンプリング
            vec2 t = (vUV - imageRect.xy) / max(imageRect.zw - imageRect.xy, vec2(1e-5));
            vec2 inside2 = step(vec2(0.0), t) * step(t, vec2(1.0));
            float inside = inside2.x * inside2.y * useImage;
            vec3 img = texture2D(imageSampler, clamp(t, 0.0, 1.0)).rgb;
            base = mix(base, img, inside);

            // 汚れレイヤー: R=汚れ量, G=色味のばらつき(Rで割って正規化)
            vec4 d = texture2D(dirtSampler, vUV);
            float amount = smoothstep(0.04, 0.9, d.r); // 8bit量子化の残りカスを除去
            float variation = clamp(d.g / max(d.r, 0.02), 0.0, 1.0);
            vec3 dirtColor = mix(vec3(0.50, 0.36, 0.20), vec3(0.16, 0.11, 0.06), variation);
            vec3 albedo = mix(base, dirtColor, amount * 0.95);

            // 簡易ライティング(画像は暗くなりすぎないよう環境光を強めにする)
            float ndl = max(dot(n, -lightDir), 0.0);
            float lit = mix(0.30 + 0.80 * ndl, 0.62 + 0.42 * ndl, useImage);
            vec3 v = normalize(eyePosition - vPosW);
            vec3 h = normalize(v - lightDir);
            float spec = pow(max(dot(n, h), 0.0), 64.0) * specAmount * (1.0 - amount); // 汚れた所はツヤを落とす
            vec3 col = albedo * lit + vec3(spec);
            gl_FragColor = vec4(col, 1.0);
        }
    `;

    var whiteTex = BABYLON.RawTexture.CreateRGBATexture(new Uint8Array([255, 255, 255, 255]), 1, 1, scene,
        false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);

    function createDirtMaterial(s) {
        var m = new BABYLON.ShaderMaterial("dirtComposite_" + s.mesh.name, scene,
            { vertex: "dirtComposite", fragment: "dirtComposite" },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldViewProjection", "lightDir", "eyePosition", "baseColor",
                           "gridAmount", "imageRect", "useImage", "specAmount"],
                samplers: ["dirtSampler", "imageSampler"]
            });
        m.setVector3("lightDir", new BABYLON.Vector3(0.4, -0.8, 0.7).normalize());
        m.setColor3("baseColor", s.baseColor);
        m.setFloat("gridAmount", s.gridAmount);
        m.setFloat("specAmount", s.specAmount);
        m.setTexture("imageSampler", s.imageTex || whiteTex);
        var r = s.imageRect || { u0: 0, v0: 0, u1: 1, v1: 1 };
        m.setVector4("imageRect", new BABYLON.Vector4(r.u0, r.v0, r.u1, r.v1));
        m.setFloat("useImage", s.imageTex ? 1 : 0);
        return m;
    }

    // ===== 筆テクスチャ(Canvas で生成。全メッシュ共通) =====
    function makeCanvasTexture(name, drawFn) {
        var size = 256;
        var dt = new BABYLON.DynamicTexture(name, { width: size, height: size }, scene, true);
        dt.hasAlpha = true;
        dt.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
        dt.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
        var ctx = dt.getContext();
        ctx.clearRect(0, 0, size, size);
        if (drawFn) { drawFn(ctx, size); }
        dt.update(); // ストレートアルファでアップロードされる
        return dt;
    }

    // 汚れ: RGB=(255, 色味, 0)、アルファ=染みの濃さ。 R=1 に向けて補間される
    function drawSplat(ctx, s) {
        var c = s / 2;
        var grad = ctx.createRadialGradient(c, c, 0, c, c, c);
        grad.addColorStop(0.0, "rgba(255,128,0," + DIRT_ALPHA + ")");
        grad.addColorStop(0.55, "rgba(255,128,0," + (DIRT_ALPHA * 0.5) + ")");
        grad.addColorStop(1.0, "rgba(255,128,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, s, s);
        // 飛沫
        for (var i = 0; i < 70; i++) {
            var ang = Math.random() * Math.PI * 2;
            var dist = Math.pow(Math.random(), 0.6) * c * 0.85;
            var rad = 1.5 + Math.random() * Math.random() * 14;
            var gch = Math.floor(Math.random() * 255);
            var a = DIRT_ALPHA * (0.4 + Math.random() * 0.6);
            ctx.fillStyle = "rgba(255," + gch + ",0," + a + ")";
            ctx.beginPath();
            ctx.arc(c + Math.cos(ang) * dist, c + Math.sin(ang) * dist, rad, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    var splats = [];
    for (var si = 0; si < 4; si++) {
        splats.push(makeCanvasTexture("splat" + si, drawSplat));
    }

    // 掃除: RGB=(0,0,0)、アルファ=ソフトな円。 R,G を 0 に向けて補間する
    var cleanBrush = makeCanvasTexture("cleanBrush", function (ctx, s) {
        var c = s / 2;
        var grad = ctx.createRadialGradient(c, c, 0, c, c, c);
        grad.addColorStop(0.0, "rgba(0,0,0," + CLEAN_ALPHA + ")");
        grad.addColorStop(0.5, "rgba(0,0,0," + (CLEAN_ALPHA * 0.7) + ")");
        grad.addColorStop(1.0, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, s, s);
    });

    // 完全透明(リセット後のミップマップ再生成用)
    var emptyTex = makeCanvasTexture("emptyBrush", null);

    // 汚れレイヤーの塗りつぶし色。 R=汚れ量, G=色味(0.5=中間の茶色)
    var DIRTY_COLOR = new BABYLON.Color4(1, 0.5, 0, 1);  // 全面が汚れた状態
    var CLEAN_COLOR = new BABYLON.Color4(0, 0, 0, 0);    // 全面がきれいな状態

    // ===== スタンプ処理 =====
    var active = null;   // 現在表示中の形
    var queue = [];
    var painting = false;
    var lastPoint = null;
    var lastNormal = null;
    var cleanMode = true; // ボタンで切替(Shift 押下中も掃除)
    var refreshUI = function () {};
    var setImageInfo = function () {};
    var updateMeter = function () {};
    var showBanner = function () {};
    var clearing = false;    // クリア演出中(塗れない)
    var clearToken = 0;      // 演出タイマーの無効化用
    var lastMeasureAt = 0;

    function tryBind(s) {
        // シェーダー読み込みとレンダーターゲット生成が終わるまで待つ(isReady() が内部で生成する)
        if (!s.dirt.isReady()) { return; }
        s.mat.setTexture("dirtSampler", s.dirt.texture);
        s.mesh.material = s.mat;
        s.ready = true;
        s.mask = buildMeasureMask(s);  // きれい度の測定用マスク(1回だけ作る)
        startDirty(s);                 // 全面が汚れた状態から始める
    }

    function enqueue(point, normal, clean, size) {
        if (queue.length > 64) { queue.splice(0, queue.length - 64); }
        queue.push({ point: point, normal: normal, clean: clean, size: size });
    }

    function applyStamp(s, st) {
        if (st.clean) {
            var cs = BRUSH_SIZE;
            s.dirt.renderTexture(cleanBrush, st.point, st.normal,
                new BABYLON.Vector3(cs, cs, cs * s.depth), 0, false);
        } else {
            var ds = st.size || BRUSH_SIZE * (0.7 + Math.random() * 0.6);
            var tex = splats[Math.floor(Math.random() * splats.length)];
            s.dirt.renderTexture(tex, st.point, st.normal,
                new BABYLON.Vector3(ds, ds, ds * s.depth), Math.random() * Math.PI * 2, false);
        }
    }

    // 表面にランダムに汚れをまく。 s.sample があればそれを使い、無ければ外側から原点へレイを飛ばして当てる
    function scatterDirt(s, count) {
        var wasEnabled = s.mesh.isEnabled();
        if (!wasEnabled) { s.mesh.setEnabled(true); } // レイは非表示のメッシュに当たらないので、一時的に有効にする
        s.mesh.computeWorldMatrix(true);
        for (var i = 0; i < count; i++) {
            var size = BRUSH_SIZE * (0.6 + Math.random() * 1.0);
            if (s.sample) {
                var smp = s.sample();
                enqueue(smp.point, smp.normal, false, size);
                continue;
            }
            var d;
            do {
                d = new BABYLON.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            } while (d.lengthSquared() > 1 || d.lengthSquared() < 0.01);
            d.normalize();
            var ray = new BABYLON.Ray(d.scale(20), d.scale(-1), 40);
            var hit = scene.pickWithRay(ray, function (m) { return m === s.mesh; });
            if (hit && hit.hit) {
                var nrm = hit.getNormal(true);
                if (nrm) { enqueue(hit.pickedPoint.clone(), nrm.normalize(), false, size); }
            }
        }
        if (!wasEnabled) { s.mesh.setEnabled(false); }
    }

    // 汚れレイヤーを塗りつぶして初期化する。
    // clear() は clearColor で塗りつぶすが、ミップマップは更新しないので、
    // 何も変えない描画を1回入れてミップマップを再生成させる(初回描画もここで済む)。
    function fillDirtLayer(sh, color) {
        sh.dirt.clearColor = color;
        sh.dirt.clear();
        sh.dirt.renderTexture(emptyTex, BABYLON.Vector3.Zero(), BABYLON.Vector3.Up(),
            new BABYLON.Vector3(1, 1, 1), 0, false);
    }

    // 全面が汚れた状態(きれい度 ほぼ0%)にして、色味のまだら模様のスタンプをまく
    function startDirty(sh) {
        queue.length = 0;
        fillDirtLayer(sh, DIRTY_COLOR);
        scatterDirt(sh, sh.initialDirt);
        sh.cleared = false;
        sh.percent = null;
        sh.touched = false;
        sh.freshCheck = true;   // 最初の測定で START_CLEAN_MAX 以下か確認する
        sh.needMeasure = true;
    }

    // 「リセット」ボタン: 全部きれいにする。ズルなのでクリア扱いにはしない
    function resetActive() {
        if (!active || !active.ready) { return; }
        queue.length = 0;
        fillDirtLayer(active, CLEAN_COLOR);
        active.cleared = true;
        active.freshCheck = false;
        active.needMeasure = true;
    }

    // 次のステージに進むとき: その形を、全面が汚れた状態から始め直す
    function startFresh(sh) {
        if (!sh || !sh.ready) { return; } // 未作成/準備中の形は、準備完了時に汚れた状態で始まる
        startDirty(sh);
        if (sh === active) { updateMeter(); }
    }

    // 形の切替(汚れの状態は形ごとに保持される)
    function activate(next) {
        if (!next || next === active) { return; }
        allShapes().forEach(function (s) { s.mesh.setEnabled(s === next); });
        queue.length = 0;
        endPaint();
        clearing = false;   // 手動で切り替えたときも、クリア演出の予約は無効にする
        clearToken++;
        showBanner(false);
        active = next;
        active.needMeasure = true;
        if (!active.dirt) { // 初回表示時にレンダラーを作成
            active.mat = createDirtMaterial(active);
            active.dirt = new BABYLON.MeshUVSpaceRenderer(active.mesh, scene, {
                width: TEX_SIZE,
                height: TEX_SIZE,
                uvEdgeBlending: EDGE_BLENDING
            });
            active.dirt.clearColor = DIRTY_COLOR; // 最初の描画時のクリアも「全面が汚れた状態」にする
        }
        refreshUI();
        updateMeter();
    }

    // 画像 i のキャンバスを表示(読み込み完了後に切り替わる)。fresh: 汚れた状態から始め直す
    function showImage(i, fresh) {
        imageIndex = ((i % images.length) + images.length) % images.length;
        var token = ++showToken;
        var img = images[imageIndex];
        setImageInfo(true);
        loadImage(img).then(function () {
            if (token !== showToken) { return; } // 読み込み中に別の画像が選ばれた
            var shape = getCanvasShape(imageIndex);
            activate(shape);
            if (fresh) { startFresh(shape); } // レンダラーが準備済みなら、全面が汚れた状態から始め直す
            setImageInfo(false);
        });
    }

    function addImageUrl() {
        var url = window.prompt("画像のURLを入力してください(CORS を許可しているサーバーのURL)", "https://");
        if (!url) { return; }
        url = url.trim();
        if (!url || url === "https://") { return; }
        images.push({ name: shortName(url), url: url, tex: null, size: null, status: "idle" });
        showImage(images.length - 1);
    }

    scene.onBeforeRenderObservable.add(function () {
        if (!active) { return; }
        if (!active.ready) { tryBind(active); return; }
        active.mat.setVector3("eyePosition", camera.position);
        var n = Math.min(queue.length, MAX_STAMPS_PER_FRAME);
        for (var i = 0; i < n; i++) { applyStamp(active, queue.shift()); }
        if (n > 0) { active.needMeasure = true; }
        // 塗り残しのスタンプが無く、前回の測定から一定時間たったら、きれい度を測る
        if (active.needMeasure && queue.length === 0 && !active.measuring &&
            performance.now() - lastMeasureAt >= MEASURE_INTERVAL_MS) {
            measure(active);
        }
    });

    scene.onKeyboardObservable.add(function (kb) {
        if (kb.type !== BABYLON.KeyboardEventTypes.KEYDOWN) { return; }
        if (kb.event.key === "ArrowRight") { showImage(imageIndex + 1); }
        if (kb.event.key === "ArrowLeft") { showImage(imageIndex - 1); }
    });

    // ===== きれい度の測定 =====
    // 表示用シェーダーの smoothstep(0.04, 0.9, R) を 8bit の R 値ごとに計算しておく
    var AMOUNT_LUT = new Float32Array(256);
    for (var lv = 0; lv < 256; lv++) {
        var tt = Math.min(1, Math.max(0, (lv / 255 - 0.04) / (0.9 - 0.04)));
        AMOUNT_LUT[lv] = tt * tt * (3 - 2 * tt);
    }

    // 測定用マスク: 読み戻すテクスチャ(ミップレベル MEASURE_LEVEL)の各テクセルが、
    // メッシュ表面のどれだけの面積(ワールド単位²)に当たるかを三角形ごとに求める。
    // メッシュに覆われないテクセル(アトラスの余白)は対象外。s.measureFilter があれば、その面だけが対象。
    function buildMeasureMask(sh) {
        var res = TEX_SIZE >> MEASURE_LEVEL;
        var pos = sh.mesh.getVerticesData("position");
        var uv = sh.mesh.getVerticesData("uv");
        var nor = sh.mesh.getVerticesData("normal");
        var idx = sh.mesh.getIndices();
        var weight = new Float32Array(res * res);
        for (var t = 0; t < idx.length; t += 3) {
            var i0 = idx[t], i1 = idx[t + 1], i2 = idx[t + 2];
            if (sh.measureFilter) {
                var nx = (nor[3 * i0] + nor[3 * i1] + nor[3 * i2]) / 3;
                var ny = (nor[3 * i0 + 1] + nor[3 * i1 + 1] + nor[3 * i2 + 1]) / 3;
                var nz = (nor[3 * i0 + 2] + nor[3 * i1 + 2] + nor[3 * i2 + 2]) / 3;
                if (!sh.measureFilter(nx, ny, nz)) { continue; }
            }
            // 3D 上の三角形の面積
            var ax = pos[3 * i1] - pos[3 * i0], ay = pos[3 * i1 + 1] - pos[3 * i0 + 1], az = pos[3 * i1 + 2] - pos[3 * i0 + 2];
            var bx = pos[3 * i2] - pos[3 * i0], by = pos[3 * i2 + 1] - pos[3 * i0 + 1], bz = pos[3 * i2 + 2] - pos[3 * i0 + 2];
            var cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
            var area3 = 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
            // UV(テクセル座標)上の三角形
            var x0 = uv[2 * i0] * res, y0 = uv[2 * i0 + 1] * res;
            var x1 = uv[2 * i1] * res, y1 = uv[2 * i1 + 1] * res;
            var x2 = uv[2 * i2] * res, y2 = uv[2 * i2 + 1] * res;
            var det = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
            var areaUv = 0.5 * Math.abs(det);
            if (areaUv < 1e-9 || area3 <= 0) { continue; }
            var w = area3 / areaUv; // 1テクセルあたりの表面積
            var minX = Math.max(0, Math.floor(Math.min(x0, x1, x2)));
            var maxX = Math.min(res - 1, Math.ceil(Math.max(x0, x1, x2)));
            var minY = Math.max(0, Math.floor(Math.min(y0, y1, y2)));
            var maxY = Math.min(res - 1, Math.ceil(Math.max(y0, y1, y2)));
            for (var py = minY; py <= maxY; py++) {
                for (var px = minX; px <= maxX; px++) {
                    var qx = px + 0.5, qy = py + 0.5;
                    var l1 = ((qx - x0) * (y2 - y0) - (x2 - x0) * (qy - y0)) / det;
                    var l2 = ((x1 - x0) * (qy - y0) - (qx - x0) * (y1 - y0)) / det;
                    var l0 = 1 - l1 - l2;
                    if (l0 >= -1e-6 && l1 >= -1e-6 && l2 >= -1e-6 && weight[py * res + px] === 0) {
                        weight[py * res + px] = w; // 境界上のテクセルを二重に数えない
                    }
                }
            }
        }
        // 対象テクセルだけを詰めて持つ
        var count = 0, total = 0;
        for (var k = 0; k < weight.length; k++) { if (weight[k] > 0) { count++; total += weight[k]; } }
        var cidx = new Uint32Array(count), cw = new Float32Array(count);
        var m = 0;
        for (var k2 = 0; k2 < weight.length; k2++) {
            if (weight[k2] > 0) { cidx[m] = k2; cw[m] = weight[k2]; m++; }
        }
        return { res: res, idx: cidx, w: cw, total: total };
    }

    // 読み戻したピクセル(RGBA)から、きれい度(0-100)を計算する
    function percentFromPixels(mask, buf) {
        var dirty = 0;
        for (var k = 0; k < mask.idx.length; k++) {
            dirty += mask.w[k] * AMOUNT_LUT[buf[mask.idx[k] * 4]];
        }
        return 100 * (1 - dirty / mask.total);
    }

    // 汚れテクスチャを読み戻して、きれい度を更新する
    function measure(sh) {
        if (sh.measuring || !sh.ready || !sh.mask) { return; }
        sh.measuring = true;
        sh.needMeasure = false;
        lastMeasureAt = performance.now();
        var p = null;
        try { p = sh.dirt.texture.readPixels(0, MEASURE_LEVEL, null, true, true); } catch (e) { p = null; }
        if (!p) { sh.measuring = false; return; }
        p.then(function (buf) {
            sh.measuring = false;
            if (sh.disposed) { return; }
            if (!buf || buf.length !== sh.mask.res * sh.mask.res * 4) {
                console.warn("きれい度の測定に失敗: 読み戻したデータのサイズが想定と違います", buf && buf.length);
                return;
            }
            onMeasured(sh, percentFromPixels(sh.mask, buf));
        }, function () { sh.measuring = false; });
    }

    // 測定結果の反映とクリア判定
    function onMeasured(sh, percent) {
        sh.percent = percent;
        if (sh.freshCheck) { // 開始直後の最初の測定: 汚れた状態から始まっているか確認(診断用)
            sh.freshCheck = false;
            if (!sh.touched && percent > START_CLEAN_MAX) {
                console.warn("開始時のきれい度が " + Math.floor(percent) + "% です(上限 " + START_CLEAN_MAX +
                    "%)。clearColor が反映されていない可能性があります。");
            }
        }
        if (sh === active) { updateMeter(); }
        if (percent < CLEAR_THRESHOLD - 1) { sh.cleared = false; } // 汚し直したらまたクリアできる
        if (sh === active && !sh.cleared && !clearing && percent >= CLEAR_THRESHOLD) {
            sh.cleared = true;
            triggerClear();
        }
    }

    // ===== ステージ(画像のキャンバス → 球 → ダイヤ → …)とクリア演出 =====
    function stages() {
        var list = images.map(function (_, i) { return { type: "canvas", index: i }; });
        list.push({ type: "shape", key: "sphere" });
        list.push({ type: "shape", key: "diamond" });
        return list;
    }

    function currentStageIndex(list) {
        for (var i = 0; i < list.length; i++) {
            var st = list[i];
            if (!active) { break; }
            if (st.type === "canvas" && active.key === "canvas" && active.imageIndex === st.index) { return i; }
            if (st.type === "shape" && active.key === st.key) { return i; }
        }
        return 0;
    }

    function enterStage(st) {
        if (st.type === "canvas") {
            showImage(st.index, true);
        } else {
            var sh = fixedShapes[st.key];
            activate(sh);
            startFresh(sh);
        }
    }

    function goNextStage() {
        var list = stages();
        enterStage(list[(currentStageIndex(list) + 1) % list.length]);
    }

    function triggerClear() {
        clearing = true;
        endPaint();
        queue.length = 0;
        showBanner(true);
        var token = ++clearToken;
        setTimeout(function () {
            if (token !== clearToken) { return; } // 演出中に手動で切り替えられた
            showBanner(false);
            if (AUTO_ADVANCE) { goNextStage(); } else { clearing = false; }
        }, CLEAR_BANNER_MS);
    }

    // ===== 入力 =====
    function pickActive() {
        if (!active) { return null; }
        var mesh = active.mesh;
        var p = scene.pick(scene.pointerX, scene.pointerY, function (m) { return m === mesh; });
        return (p && p.hit) ? p : null;
    }

    // 塗り終わり。カメラ操作を戻す(押したまま GUI 上で離した場合などの取りこぼし対策にも使う)
    function endPaint() {
        if (!painting) { return; }
        painting = false;
        lastPoint = null;
        camera.attachControl(canvas, true);
    }

    function paintAt(p, clean) {
        var normal = p.getNormal(true); // ワールド空間の法線(= 投影方向の逆向き)
        if (!normal) { return; }
        normal = normal.normalize();
        var point = p.pickedPoint.clone();
        var spacing = BRUSH_SIZE * 0.25;
        if (lastPoint) {
            var dist = BABYLON.Vector3.Distance(lastPoint, point);
            if (dist < spacing) { return; }
            // 速く動かしたときの隙間を補間(面の向きが大きく違う場合は、表面から外れるので補間しない)
            if (BABYLON.Vector3.Dot(lastNormal, normal) > 0.9) {
                var steps = Math.min(8, Math.floor(dist / spacing));
                for (var i = 1; i < steps; i++) {
                    var t = i / steps;
                    enqueue(
                        BABYLON.Vector3.Lerp(lastPoint, point, t),
                        BABYLON.Vector3.Lerp(lastNormal, normal, t).normalize(),
                        clean
                    );
                }
            }
        }
        enqueue(point, normal, clean);
        lastPoint = point;
        lastNormal = normal;
        if (active) { active.touched = true; }
    }

    scene.onPointerObservable.add(function (pi) {
        var clean = cleanMode || pi.event.shiftKey;
        switch (pi.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN: {
                if (pi.event.button !== 0 || !active || !active.ready || clearing) { return; }
                var p = pickActive();
                if (p) {
                    painting = true;
                    lastPoint = null;
                    camera.detachControl(); // 塗っている間はカメラを止める
                    paintAt(p, clean);
                }
                break;
            }
            case BABYLON.PointerEventTypes.POINTERMOVE: {
                if (!painting) { return; }
                if (pi.event.buttons === 0) { endPaint(); return; } // ボタンを離したのに UP を受け取れなかった場合
                var q = pickActive();
                if (q) { paintAt(q, clean); } else { lastPoint = null; }
                break;
            }
            case BABYLON.PointerEventTypes.POINTERUP: {
                endPaint();
                break;
            }
        }
    });

    // ===== UI(GUI が読み込まれている場合のみ) =====
    // 注意: Babylon GUI の padding は「コントロール自身のサイズから引かれる」ので、
    //       位置のずらしには padding ではなく top を使う。ここでは Grid で3行×4列に並べる。
    if (BABYLON.GUI) {
        var ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, scene);

        var grid = new BABYLON.GUI.Grid("toolbar");
        grid.height = "138px";
        grid.top = "4px";
        grid.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        for (var gr = 0; gr < 3; gr++) { grid.addRowDefinition(1 / 3); }
        for (var gc = 0; gc < 4; gc++) { grid.addColumnDefinition(0.25); }
        ui.addControl(grid);
        // 狭いキャンバス(Playground の分割表示やスマホ)でも収まるよう、幅は画面に合わせる
        var layoutGrid = function () {
            grid.widthInPixels = Math.min(engine.getRenderWidth(), 560);
            if (typeof meterBar !== "undefined") { meterBar.widthInPixels = Math.min(engine.getRenderWidth() * 0.8, 440); }
        };
        engine.onResizeObservable.add(layoutGrid);

        var addButton = function (row, col, id, label, onClick) {
            var b = BABYLON.GUI.Button.CreateSimpleButton(id, label);
            b.width = "92%";
            b.height = "80%";
            b.color = "white";
            b.fontSize = 15;
            b.cornerRadius = 8;
            b.background = "#33415c";
            b.onPointerUpObservable.add(onClick);
            grid.addControl(b, row, col);
            return b;
        };

        // 1行目: 道具
        var dirtBtn = addButton(0, 0, "dirtBtn", "汚す", function () { cleanMode = false; refreshUI(); });
        var cleanBtn = addButton(0, 1, "cleanBtn", "きれいに", function () { cleanMode = true; refreshUI(); });
        addButton(0, 2, "scatterBtn", "ランダム", function () {
            if (active && active.ready) { scatterDirt(active, Math.round(active.initialDirt * 0.7)); }
        });
        addButton(0, 3, "resetBtn", "リセット", resetActive);

        // 2行目: 形の切替
        var shapeButtons = {};
        shapeButtons.sphere = addButton(1, 0, "shape_sphere", "球", function () { activate(fixedShapes.sphere); });
        shapeButtons.diamond = addButton(1, 1, "shape_diamond", "ダイヤ", function () { activate(fixedShapes.diamond); });
        shapeButtons.canvas = addButton(1, 2, "shape_canvas", "キャンバス", function () { showImage(imageIndex); });
        addButton(1, 3, "addUrlBtn", "URL追加", addImageUrl);

        // 3行目: 画像の切替(+ 現在の画像名)
        addButton(2, 0, "prevImgBtn", "◀ 前の画像", function () { showImage(imageIndex - 1); });
        addButton(2, 1, "nextImgBtn", "次の画像 ▶", function () { showImage(imageIndex + 1); });
        var imageInfo = new BABYLON.GUI.TextBlock("imageInfo", "");
        imageInfo.color = "white";
        imageInfo.fontSize = 12;
        imageInfo.width = "200%"; // 隣の列まで使う
        imageInfo.textWrapping = true;
        imageInfo.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        imageInfo.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        grid.addControl(imageInfo, 2, 2);

        setImageInfo = function (loading) {
            var img = images[imageIndex];
            var text = "画像 " + (imageIndex + 1) + "/" + images.length + ": " + img.name;
            if (loading) { text += "  (読み込み中…)"; }
            else if (img.status === "error") { text += "  (読み込み失敗: URL/CORSを確認)"; }
            imageInfo.text = text;
        };

        refreshUI = function () {
            dirtBtn.background = cleanMode ? "#33415c" : "#c0562b";
            cleanBtn.background = cleanMode ? "#2b8fc0" : "#33415c";
            Object.keys(shapeButtons).forEach(function (key) {
                shapeButtons[key].background = (active && active.key === key) ? "#3a7d44" : "#33415c";
            });
        };

        var hint = new BABYLON.GUI.TextBlock("hint",
            "ドラッグ: 汚す / 「きれいに」モードか Shift+ドラッグ: 掃除 / ← → キー: 画像切替 / 形の外側をドラッグ: 視点回転");
        hint.color = "white";
        hint.fontSize = 14;
        hint.height = "48px";
        hint.textWrapping = true;
        hint.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        hint.top = "-8px";
        ui.addControl(hint);

        // きれい度メーター(画面下。黄色の縦線がクリアライン)
        var meterText = new BABYLON.GUI.TextBlock("meterText", "");
        meterText.color = "white";
        meterText.fontSize = 16;
        meterText.height = "24px";
        meterText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        meterText.top = "-84px";
        ui.addControl(meterText);

        var meterBar = new BABYLON.GUI.Rectangle("meterBar");
        meterBar.height = "16px";
        meterBar.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        meterBar.top = "-64px";
        meterBar.color = "#cfd6e4";
        meterBar.thickness = 1;
        meterBar.background = "#1b2030";
        meterBar.cornerRadius = 8;
        ui.addControl(meterBar);

        var meterFill = new BABYLON.GUI.Rectangle("meterFill");
        meterFill.width = "0%";
        meterFill.height = "100%";
        meterFill.thickness = 0;
        meterFill.background = "#4cc38a";
        meterFill.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        meterBar.addControl(meterFill);

        var meterMark = new BABYLON.GUI.Rectangle("meterMark");
        meterMark.width = "2px";
        meterMark.height = "100%";
        meterMark.thickness = 0;
        meterMark.background = "#ffd166";
        meterMark.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        meterMark.left = CLEAR_THRESHOLD + "%";
        meterBar.addControl(meterMark);
        layoutGrid();

        updateMeter = function () {
            if (!active) { return; }
            var list = stages();
            var pct = active.percent;
            var label = (pct === null) ? "--" : Math.floor(pct) + "%";
            meterText.text = "ステージ " + (currentStageIndex(list) + 1) + "/" + list.length +
                "   きれい度 " + label + "  (" + CLEAR_THRESHOLD + "%でクリア)";
            meterFill.width = (pct === null ? 0 : Math.max(0, Math.min(100, pct))) + "%";
            meterFill.background = (pct !== null && pct >= CLEAR_THRESHOLD) ? "#ffd166" : "#4cc38a";
        };

        // クリア演出
        var banner = new BABYLON.GUI.TextBlock("banner", "CLEAR!");
        banner.color = "#ffd166";
        banner.fontSize = 72;
        banner.fontWeight = "bold";
        banner.outlineWidth = 8;
        banner.outlineColor = "#10131c";
        banner.height = "100px";
        banner.isVisible = false;
        ui.addControl(banner);
        var bannerSub = new BABYLON.GUI.TextBlock("bannerSub", "次のステージへ…");
        bannerSub.color = "white";
        bannerSub.fontSize = 22;
        bannerSub.outlineWidth = 4;
        bannerSub.outlineColor = "#10131c";
        bannerSub.height = "30px";
        bannerSub.top = "64px";
        bannerSub.isVisible = false;
        ui.addControl(bannerSub);
        showBanner = function (visible) {
            banner.isVisible = visible;
            bannerSub.isVisible = visible && AUTO_ADVANCE;
        };
    } else {
        updateMeter = function () {
            if (active) { console.log("きれい度: " + (active.percent === null ? "--" : Math.floor(active.percent) + "%")); }
        };
        setImageInfo = function (loading) {
            console.log("画像 " + (imageIndex + 1) + "/" + images.length + ": " + images[imageIndex].name + (loading ? " (読み込み中)" : ""));
        };
        console.log("ドラッグ: 汚す / Shift+ドラッグ: きれいにする / ← →: 画像切替(ボタンはGUIが必要)");
    }

    // 動作確認・デバッグ用(Inspector やコンソールから参照できる)
    scene.metadata = {
        getActive: function () { return active; },
        stages: stages,
        buildMeasureMask: buildMeasureMask,
        percentFromPixels: percentFromPixels,
        onMeasured: onMeasured,
        startDirty: startDirty,
        startFresh: startFresh
    };

    showImage(0); // 最初はキャンバスを表示
    return scene;
};

// ######################################################################

export var createScene = createScene_test_4202;

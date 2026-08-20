//  [Babylon.js ：日本地図・市区町村の表示](162.md)

// ######################################################################
export var createScene_test_1007 = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.03, 0.03, 0.08, 1);

    var camera = new BABYLON.ArcRotateCamera(
        "camera", -Math.PI / 2, Math.PI / 3, 80, BABYLON.Vector3.Zero(), scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 200;

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0.3), scene);
    light.intensity = 0.9;

    // id は topojson 側 properties.id と対応 (全国地方公共団体コード上2桁)
    const PREFECTURAL_CAPITALS = [
        {id:1,name:"札幌市",pref:"北海道",lat:43.064359,lon:141.347449},
        {id:2,name:"青森市",pref:"青森県",lat:40.824294,lon:140.740054},
        {id:3,name:"盛岡市",pref:"岩手県",lat:39.70353,lon:141.152667},
        {id:4,name:"仙台市",pref:"宮城県",lat:38.268737,lon:140.872183},
        {id:5,name:"秋田市",pref:"秋田県",lat:39.718175,lon:140.103356},
        {id:6,name:"山形市",pref:"山形県",lat:38.240127,lon:140.362533},
        {id:7,name:"福島市",pref:"福島県",lat:37.750146,lon:140.466754},
        {id:8,name:"水戸市",pref:"茨城県",lat:36.341817,lon:140.446796},
        {id:9,name:"宇都宮市",pref:"栃木県",lat:36.56575,lon:139.883526},
        {id:10,name:"前橋市",pref:"群馬県",lat:36.391205,lon:139.060917},
        {id:11,name:"さいたま市",pref:"埼玉県",lat:35.857771,lon:139.647804},
        {id:12,name:"千葉市",pref:"千葉県",lat:35.604563,lon:140.123179},
        {id:13,name:"東京(新宿)",pref:"東京都",lat:35.689185,lon:139.691648},
        {id:14,name:"横浜市",pref:"神奈川県",lat:35.447505,lon:139.642347},
        {id:15,name:"新潟市",pref:"新潟県",lat:37.901699,lon:139.022728},
        {id:16,name:"富山市",pref:"富山県",lat:36.695274,lon:137.211302},
        {id:17,name:"金沢市",pref:"石川県",lat:36.594729,lon:136.62555},
        {id:18,name:"福井市",pref:"福井県",lat:36.06522,lon:136.221641},
        {id:19,name:"甲府市",pref:"山梨県",lat:35.665102,lon:138.568985},
        {id:20,name:"長野市",pref:"長野県",lat:36.651282,lon:138.180972},
        {id:21,name:"岐阜市",pref:"岐阜県",lat:35.39116,lon:136.722204},
        {id:22,name:"静岡市",pref:"静岡県",lat:34.976987,lon:138.383057},
        {id:23,name:"名古屋市",pref:"愛知県",lat:35.180247,lon:136.906698},
        {id:24,name:"津市",pref:"三重県",lat:34.730547,lon:136.50861},
        {id:25,name:"大津市",pref:"滋賀県",lat:35.004532,lon:135.868588},
        {id:26,name:"京都市",pref:"京都府",lat:35.0209962,lon:135.7531135},
        {id:27,name:"大阪市",pref:"大阪府",lat:34.686492,lon:135.518992},
        {id:28,name:"神戸市",pref:"兵庫県",lat:34.69128,lon:135.183087},
        {id:29,name:"奈良市",pref:"奈良県",lat:34.685296,lon:135.832745},
        {id:30,name:"和歌山市",pref:"和歌山県",lat:34.224806,lon:135.16795},
        {id:31,name:"鳥取市",pref:"鳥取県",lat:35.503463,lon:134.238258},
        {id:32,name:"松江市",pref:"島根県",lat:35.472248,lon:133.05083},
        {id:33,name:"岡山市",pref:"岡山県",lat:34.66132,lon:133.934414},
        {id:34,name:"広島市",pref:"広島県",lat:34.396033,lon:132.459595},
        {id:35,name:"山口市",pref:"山口県",lat:34.185648,lon:131.470755},
        {id:36,name:"徳島市",pref:"徳島県",lat:34.065732,lon:134.559293},
        {id:37,name:"高松市",pref:"香川県",lat:34.34014,lon:134.04297},
        {id:38,name:"松山市",pref:"愛媛県",lat:33.841649,lon:132.76585},
        {id:39,name:"高知市",pref:"高知県",lat:33.55969,lon:133.530887},
        {id:40,name:"福岡市",pref:"福岡県",lat:33.606767,lon:130.418228},
        {id:41,name:"佐賀市",pref:"佐賀県",lat:33.249367,lon:130.298822},
        {id:42,name:"長崎市",pref:"長崎県",lat:32.744542,lon:129.873037},
        {id:43,name:"熊本市",pref:"熊本県",lat:32.790385,lon:130.742345},
        {id:44,name:"大分市",pref:"大分県",lat:33.2382,lon:131.612674},
        {id:45,name:"宮崎市",pref:"宮崎県",lat:31.91109,lon:131.423855},
        {id:46,name:"鹿児島市",pref:"鹿児島県",lat:31.560219,lon:130.557906},
        {id:47,name:"那覇市",pref:"沖縄県",lat:26.211538,lon:127.681115},
    ];

    // 外部スクリプトを動的ロード（PlaygroundのAddライブラリ機能を使ってもOK）
    function loadScript(url) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement("script");
            s.src = url;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function buildJapanMap() {
        await loadScript("https://d3js.org/d3.v7.min.js");
        await loadScript("https://unpkg.com/topojson-client@3"); // v3.1.0 - 2019

        var res = await fetch(
            "https://raw.githubusercontent.com/dataofjapan/land/master/japan.topojson"
        );
        var topo = await res.json();
        var geo = topojson.feature(topo, topo.objects.japan); // FeatureCollection

        // 経緯度 -> 平面座標への投影（100x100くらいに収める）
        var projection = d3.geoMercator().fitSize([100, 100], geo);

        geo.features.forEach(function (feature, i) {
            var name = feature.properties.nam_ja || feature.properties.nam || ("pref" + i);
            var polygons =
                feature.geometry.type === "Polygon"
                    ? [feature.geometry.coordinates]
                    : feature.geometry.coordinates; // MultiPolygon
            polygons.forEach(function (rings, pIdx) {
                var outer = rings[0]; // 簡略化のため外周のみ（穴は無視）
                var shape = outer.map(function (coord) {
                    var p = projection(coord);
                    // d3のyは下向きが正なので反転してBabylonのZに割り当て
                    return new BABYLON.Vector3(p[0] - 50, 0, -(p[1] - 50));
                });

                try {
                    var mesh = BABYLON.MeshBuilder.ExtrudePolygon(
                        name + "_" + pIdx,
                        { shape: shape, depth: 1 + Math.random() * 4 },
                        scene,
                        earcut
                    );
                    var mat = new BABYLON.StandardMaterial(name + "_mat", scene);
                    mat.diffuseColor = BABYLON.Color3.Random();
                    mat.diffuseColor.r = (mat.diffuseColor.r*0.5) + 0.5;
                    mat.diffuseColor.g = (mat.diffuseColor.g*0.5) + 0.5;
                    mat.diffuseColor.b = (mat.diffuseColor.b*0.5) + 0.5;
                    mat.emissiveColor = mat.diffuseColor.scale(0.15);
                    mat.specularColor = BABYLON.Color3.Black();
                    mesh.material = mat;
                } catch (e) {
                    console.log("skip", name, e);
                }
            });

            {
                // 県庁所在地の表示
                let capt = PREFECTURAL_CAPITALS[i];
                let [x, y] = projection([capt.lon, capt.lat]);
                x = x -50,
                y = -(y-50);
                let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 0.5 }, scene);
                mesh.position = new BABYLON.Vector3(x, 0, y);
                mesh.material = new BABYLON.StandardMaterial("", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Red();


            }
        });
    }

    buildJapanMap();

    return scene;
};

// ######################################################################

// cluade -sonnet5 工数：高、思考：ON
// https://github.com/smartnews-smri/japan-topography の topojson, topojson-client, earcutを使って babylon.js の playground で市区町村を表示させるコードの例を作成。レビューと修正を3回繰り返した結果、3回目の全コードを表示
//
// - PREF_CODE を書き換えれば他県にも切り替わります（スケールはbboxから自動算出）。全国版に切り替えたい場合は s0010/N03-21_210101.json（都道府県コード無し）を指定してください。ただしその場合は約1900ポリゴンになるので、CHUNK_SIZEを上げるかWeb Worker側でearcutを事前計算しておく方式の検討が必要です。
// - 市区町村データを使う場合、国土交通省の指示するクレジット表記が必要（README記載）なので、公開する際は明記してください。

export var createScene_test_1011 = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.04, 0.06, 0.09, 1);

    // ---- カメラ・ライト -------------------------------------------------
    var camera = new BABYLON.ArcRotateCamera(
        "camera", -Math.PI / 2, Math.PI / 3, 60, BABYLON.Vector3.Zero(), scene
    );
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 15;
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.2, 1, 0.1), scene);
    light.intensity = 0.9;

    // ---- GUI（読み込み状況・選択中の市区町村名を表示） --------------------
    var ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var infoText = new BABYLON.GUI.TextBlock();
    infoText.text = "初期化中...";
    infoText.color = "white";
    infoText.fontSize = 20;
    infoText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    infoText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    infoText.paddingLeft = "14px";
    infoText.paddingTop = "14px";
    ui.addControl(infoText);

    // ---- 外部ライブラリの動的読み込み(topojson-client / earcut) ----------
    // Babylon Playgroundには同梱されていないため、CDNから<script>を挿入する
    function loadScript(url) {
        return new Promise(function (resolve, reject) {
            if (document.querySelector('script[data-loaded-lib="' + url + '"]')) {
                resolve();
                return;
            }
            var tag = document.createElement("script");
            tag.src = url;
            tag.dataset.loadedLib = url;
            tag.onload = function () { resolve(); };
            tag.onerror = function () { reject(new Error("読み込み失敗: " + url)); };
            document.head.appendChild(tag);
        });
    }

    // ---- 緯度経度 → シーン座標への投影 -----------------------------------
    // データのbboxから自動でスケールを決めるので、都道府県ごとにコードを
    // 書き換えなくても妥当なサイズで表示される
    var TARGET_SPAN = 120; // シーン内で最も長い辺をこのサイズに合わせる
    var projector = null;

    function makeProjector(bbox) {
        var centerLon = (bbox[0] + bbox[2]) / 2;
        var centerLat = (bbox[1] + bbox[3]) / 2;
        var latCorrection = Math.cos(centerLat * Math.PI / 180);
        var lonSpan = (bbox[2] - bbox[0]) * latCorrection;
        var latSpan = bbox[3] - bbox[1];
        var scale = TARGET_SPAN / Math.max(lonSpan, latSpan, 1e-6);
        return function (lon, lat) {
            return new BABYLON.Vector2(
                (lon - centerLon) * scale * latCorrection,
                (lat - centerLat) * scale
            );
        };
    }

    // 全フィーチャーを走査してbboxを求める（bboxプロパティが無いファイル対策）
    function computeBBox(features) {
        var minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
        function scan(coords, depth) {
            if (depth === 0) {
                var lon = coords[0], lat = coords[1];
                if (lon < minLon) minLon = lon;
                if (lon > maxLon) maxLon = lon;
                if (lat < minLat) minLat = lat;
                if (lat > maxLat) maxLat = lat;
            } else {
                for (var i = 0; i < coords.length; i++) scan(coords[i], depth - 1);
            }
        }
        features.forEach(function (f) {
            var depth = f.geometry.type === "Polygon" ? 2 : 3;
            scan(f.geometry.coordinates, depth);
        });
        return [minLon, minLat, maxLon, maxLat];
    }

    // GeoJSONのリング(座標配列)をVector2配列に変換。閉環の重複終点は除去する
    function ringToVector2(ring) {
        var pts = ring.map(function (c) { return projector(c[0], c[1]); });
        if (pts.length > 1 && pts[0].equals(pts[pts.length - 1])) {
            pts.pop();
        }
        return pts;
    }

    // コード文字列から決定的に色相を決める（同じ市区町村なら毎回同じ色になる）
    function colorFromCode(code) {
        var hash = 0;
        for (var i = 0; i < code.length; i++) {
            hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
        }
        return BABYLON.Color3.FromHSV(hash % 360, 0.55, 0.85);
    }

    var HEIGHT = TARGET_SPAN / 100;
    var municipalityMeshes = [];
    var highlightedMesh = null;

    // 1市区町村分のFeatureからメッシュを作る。飛び地(MultiPolygon)は
    // 別々に押し出してから同じ親ノード(TransformNode)にまとめる
    function buildMunicipalityMesh(feature) {
        var geometry = feature.geometry;
        var polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
        var cityName = feature.properties.N03_003 || "";
        var wardName = feature.properties.N03_004 || "";
        var name = (cityName + wardName) || "不明";
        var code = feature.properties.N03_007 || name;
        var color = colorFromCode(code);

        var root = new BABYLON.TransformNode(name, scene);

        polygons.forEach(function (rings, idx) {
            var outer = ringToVector2(rings[0]);
            if (outer.length < 3) { return; } // 退化ポリゴンはスキップ

            // 第4引数にearcutを明示的に注入して三角形分割させる
            var builder = new BABYLON.PolygonMeshBuilder(name + "_" + idx, outer, scene, earcut);
            for (var h = 1; h < rings.length; h++) {
                var hole = ringToVector2(rings[h]);
                if (hole.length >= 3) { builder.addHole(hole); }
            }

            var mesh = builder.build(false, HEIGHT);
            mesh.parent = root;

            var mat = new BABYLON.StandardMaterial(name + "_mat_" + idx, scene);
            mat.diffuseColor = color;
            mat.specularColor = BABYLON.Color3.Black();
            mesh.material = mat;
            mesh.isPickable = true;
            mesh.metadata = { name: name, code: code, baseColor: color };

            municipalityMeshes.push(mesh);
        });

        return root;
    }

    // クリックでハイライト(発光色を付ける)。メッシュごとにマテリアルを
    // 個別インスタンス化してあるので、他のメッシュへ色が波及することはない
    function setupPicking() {
        scene.onPointerObservable.add(function (pointerInfo) {
            if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERPICK) { return; }
            var pick = pointerInfo.pickInfo;
            if (!pick.hit || !pick.pickedMesh || !pick.pickedMesh.metadata) { return; }

            var mesh = pick.pickedMesh;
            if (highlightedMesh && highlightedMesh !== mesh) {
                highlightedMesh.material.emissiveColor = BABYLON.Color3.Black();
            }
            mesh.material.emissiveColor = mesh.metadata.baseColor.scale(0.4);
            highlightedMesh = mesh;
            infoText.text = mesh.metadata.name + "（コード: " + mesh.metadata.code + "）";
        });
    }

    // ---- データ取得～表示まで --------------------------------------------
    // 都道府県コードを変えれば他県にも切り替えられる（例: "27"=大阪府, "26"=京都府）
    var PREF_CODE = "01";
//    var PREF_CODE = "13"; // 東京都
//    var PREF_CODE = "27";
//    var PREF_CODE = "26";
    // 都道府県指定
    var TOPOJSON_URL = "https://raw.githubusercontent.com/smartnews-smri/japan-topography/main/data/municipality/topojson/s0010/N03-21_" + PREF_CODE + "_210101.json";
    // 全国
//    var TOPOJSON_URL = "https://raw.githubusercontent.com/smartnews-smri/japan-topography/main/data/municipality/topojson/s0010/N03-21_210101.json";

    // 小笠原村は南鳥島・沖ノ鳥島まで含む1フィーチャーで、他の市区町村と
    // 極端に離れている。含めるとbboxが太平洋全体に広がり23区が豆粒になるため除外
    var EXCLUDE_CODES = ["13421"];

    try {
        infoText.text = "topojson-client / earcut を読み込み中...";
        await Promise.all([
            loadScript("https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"),
            loadScript("https://cdn.jsdelivr.net/npm/earcut@2.2.4/dist/earcut.min.js")
        ]);

        infoText.text = "地形データを取得中...";
        var response = await fetch(TOPOJSON_URL);
        if (!response.ok) { throw new Error("HTTP " + response.status); }
        var topology = await response.json();

        // objectsのキー名はファイル名依存なので動的に取得する
        var objectKey = Object.keys(topology.objects)[0];
        var geojson = topojson.feature(topology, topology.objects[objectKey]);
        var features = geojson.features.filter(function (f) {
            return EXCLUDE_CODES.indexOf(f.properties.N03_007) === -1;
        });

        var bbox = computeBBox(features);
        projector = makeProjector(bbox);

        camera.radius = TARGET_SPAN * 1.3;
        camera.lowerRadiusLimit = TARGET_SPAN * 0.05;
        camera.upperRadiusLimit = TARGET_SPAN * 4;

        // 海面代わりの薄いプレート(位置関係の目安)
        var sea = BABYLON.MeshBuilder.CreateGround("sea", {
            width: TARGET_SPAN * 1.4, height: TARGET_SPAN * 1.4
        }, scene);
        sea.position.y = -0.05;
        var seaMat = new BABYLON.StandardMaterial("seaMat", scene);
        seaMat.diffuseColor = new BABYLON.Color3(0.05, 0.12, 0.22);
        seaMat.specularColor = BABYLON.Color3.Black();
        sea.material = seaMat;

        // メインスレッドを固めないよう、数件ずつ分割してフレームをまたいで生成する
        var CHUNK_SIZE = 6;
        for (var i = 0; i < features.length; i += CHUNK_SIZE) {
            var chunk = features.slice(i, i + CHUNK_SIZE);
            chunk.forEach(function (feature) {
                try {
                    buildMunicipalityMesh(feature);
                } catch (e) {
                    console.warn("スキップ:", e.message);
                }
            });
            infoText.text = "メッシュ生成中... (" + Math.min(i + CHUNK_SIZE, features.length) + "/" + features.length + ")";
            await new Promise(function (resolve) { requestAnimationFrame(resolve); });
        }

        infoText.text = "市区町村（" + municipalityMeshes.length + " エリア）- クリックで選択";
        setupPicking();

    } catch (err) {
        infoText.text = "エラー: " + err.message;
        console.error(err);
    }

    return scene;
};



// ======================================================================
//--------------------

export var createScene = createScene_test_1007; // d3の日本地図、都道府県の表示+県庁
// export var createScene = createScene_test_1011; // 日本地図、都道府県の表示(県別・claude



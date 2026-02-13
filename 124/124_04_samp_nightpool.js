// sample - night-pool


// ######################################################################

// chatGPT

// レビュー＆修正の要点（要約）
// - レビュー1 → 修正1
//   - 課題：昼間的で平板。水面表現がない。
//   - 対応：夜景向けにライトを減光／色調変更。WaterMaterial を導入し水面を作成。
// - レビュー2 → 修正2
//   - 課題：ナイトプールらしい“映え”が弱い。
//   - 対応：ネオンカラーのポイントライト、スカイボックス（夜空）、反射を追加。
// - レビュー3 → 修正3
//   - 課題：雰囲気は出たが没入感不足。
//   - 対応：GlowLayer による発光演出、カメラ位置調整、床をタイル調にして高級感を付与。


export const createScene_chatGPT = function () {
// export const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.05, 1.0);

    /* Camera */
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        BABYLON.Tools.ToRadians(210),
        BABYLON.Tools.ToRadians(65),
        18,
        new BABYLON.Vector3(0, 2, 0),
        scene
    );
    camera.attachControl(canvas, true);

    /* Ambient light (moonlight) */
    const hemiLight = new BABYLON.HemisphericLight(
        "hemi",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    hemiLight.intensity = 0.2;
    hemiLight.diffuse = new BABYLON.Color3(0.4, 0.6, 1.0);

    /* Neon lights around pool */
    const pinkLight = new BABYLON.PointLight(
        "pinkLight",
        new BABYLON.Vector3(3, 3, 0),
        scene
    );
    pinkLight.diffuse = new BABYLON.Color3(1.0, 0.2, 0.6);
    pinkLight.intensity = 2.5;

    const blueLight = new BABYLON.PointLight(
        "blueLight",
        new BABYLON.Vector3(-3, 3, 0),
        scene
    );
    blueLight.diffuse = new BABYLON.Color3(0.2, 0.6, 1.0);
    blueLight.intensity = 2.5;

    /* Pool water */
    const waterMesh = BABYLON.MeshBuilder.CreateGround(
        "water",
        { width: 10, height: 6 },
        scene
    );
    waterMesh.position.y = 0.05;

    const waterMaterial = new BABYLON.WaterMaterial(
        "waterMaterial",
        scene,
        new BABYLON.Vector2(512, 512)
    );
    waterMaterial.bumpTexture = new BABYLON.Texture(
        "https://assets.babylonjs.com/environments/waterbump.png",
        scene
    );
    waterMaterial.windForce = 2;
    waterMaterial.waveHeight = 0.2;
    waterMaterial.waveLength = 0.1;
    waterMaterial.colorBlendFactor = 0.3;
    waterMaterial.waterColor = new BABYLON.Color3(0.05, 0.2, 0.35);
    waterMaterial.addToRenderList(waterMesh);

    waterMesh.material = waterMaterial;

    /* Pool floor */
    const floor = BABYLON.MeshBuilder.CreateGround(
        "floor",
        { width: 12, height: 8 },
        scene
    );
    floor.position.y = -0.05;

    const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
    floorMat.diffuseColor = new BABYLON.Color3(0.02, 0.02, 0.05);
    floorMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.4);
    floor.material = floorMat;

    /* Decorative glowing spheres (pool lights) */
    const glowSphere = BABYLON.MeshBuilder.CreateSphere(
        "glowSphere",
        { diameter: 0.4 },
        scene
    );
    glowSphere.position = new BABYLON.Vector3(0, 0.3, 2);

    const glowMat = new BABYLON.StandardMaterial("glowMat", scene);
    glowMat.emissiveColor = new BABYLON.Color3(0.2, 0.8, 1.0);
    glowSphere.material = glowMat;

    /* Glow effect */
    const glowLayer = new BABYLON.GlowLayer("glow", scene);
    glowLayer.intensity = 0.8;

    /* Skybox (night) */
    const skybox = BABYLON.MeshBuilder.CreateBox(
        "skyBox",
        { size: 100 },
        scene
    );
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMat", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.02, 0.08);
    skybox.material = skyboxMaterial;

    return scene;
};

// ######################################################################
// gemini

// 修正のプロセス
// 1. Step 1: 環境設定
//   - 背景を夜の暗闇にし、環境光を下げてネオンが映える土台を作りました。
// 2. Step 2: 水面とネオンカラーの導入
//   - 地面を「水面」に見立て、青く発光（エミッシブ）させました。球体をピンク色のネオン発光に変更。
// 3. Step 3: 仕上げ（反射と動き）
//   - 水面に動き（アニメーション）を加え、周囲に浮遊するライトを追加してナイトプール特有のキラキラ感を強調しました。
//
// レビューのポイント
// - 色使い: 青、マゼンタ、シアンの3色を基調にすることで、サイバーパンクやナイトプール的なトーンを統一しました。
// - グロー効果 (Bloom): DefaultRenderingPipeline を使用して、発光している部分が画面上で滲むように設定しました。これが最も「ナイトプール感」を左右します。
// - 動的な演出: registerBeforeRender を使い、静止画ではなく水面やライトが常にゆっくり動くようにし、心地よいリラックス感を演出しました。

export const createScene_gemini = function () {
// export const createScene = function (engine, canvas) {
    var scene = new BABYLON.Scene(engine);

    // --- カメラ設定 ---
    // 少し引きの視点から全体を見渡せるように変更
    var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    // --- 環境演出（夜） ---
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.05, 1); // 深い夜空の色
    
    // 環境光は極めて弱く設定し、ネオンを引き立たせる
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.2;

    // --- 水面 (Ground) の作成 ---
    var water = BABYLON.MeshBuilder.CreateGround("water", {width: 20, height: 20}, scene);
    var waterMaterial = new BABYLON.StandardMaterial("waterMat", scene);
    waterMaterial.diffuseColor = new BABYLON.Color3(0, 0.1, 0.2);
    waterMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    waterMaterial.emissiveColor = new BABYLON.Color3(0, 0.2, 0.4); // ほんのり青く光る
    water.material = waterMaterial;

    // 水面のゆらぎをアニメーションで表現
    scene.registerBeforeRender(function () {
        water.position.y = Math.sin(Date.now() * 0.001) * 0.05;
    });

    // --- ネオンオブジェクト (Sphere) ---
    var sphere = BABYLON.MeshBuilder.CreateSphere("neonSphere", {diameter: 2}, scene);
    sphere.position.y = 1;
    
    var neonMat = new BABYLON.StandardMaterial("neonMat", scene);
    neonMat.emissiveColor = new BABYLON.Color3(1, 0, 0.5); // マゼンタ色のネオン
    neonMat.disableLighting = true; // 光源の影響を無視して自ら発光
    sphere.material = neonMat;

    // ポイントライトを配置して、周囲を照らす（ネオンの効果）
    var pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 1.5, 0), scene);
    pointLight.diffuse = new BABYLON.Color3(1, 0, 0.5);
    pointLight.intensity = 1.5;

    // --- 装飾：浮かぶライト ---
    const createFloatLight = (name, color, pos) => {
        let f = BABYLON.MeshBuilder.CreateSphere(name, {diameter: 0.5}, scene);
        f.position = pos;
        let m = new BABYLON.StandardMaterial(name + "Mat", scene);
        m.emissiveColor = color;
        f.material = m;
        
        let pl = new BABYLON.PointLight(name + "PL", pos, scene);
        pl.diffuse = color;
        pl.intensity = 0.8;
        
        // ふわふわ浮かぶアニメーション
        scene.registerBeforeRender(function () {
            f.position.y = pos.y + Math.sin(Date.now() * 0.002 + pos.x) * 0.2;
            pl.position.y = f.position.y;
        });
    };

    createFloatLight("light1", new BABYLON.Color3(0, 1, 1), new BABYLON.Vector3(4, 0.5, 3));  // シアン
    createFloatLight("light2", new BABYLON.Color3(1, 1, 0), new BABYLON.Vector3(-4, 0.5, -2)); // イエロー

    // --- ポストプロセス（グロー効果） ---
    // これを入れることで光がボヤッと滲み、一気にナイトプール感が出ます
    var pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, [camera]);
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.5;
    pipeline.bloomWeight = 0.7;
    pipeline.bloomKernel = 64;

    return scene;
};

// ######################################################################
// cluade

// ナイトプール風シーン - レビュー＆修正プロセス
// 3回のレビューと修正を経て、以下の最終版に到達しました。
//
// レビュー＆修正の過程
// - レビュー1: 基本的なナイトプール要素の追加
//   - 追加要素: ネオンカラーのライティング、水面マテリアル、リフレクション
//   - 課題: ライトの配置が単調、プール感が弱い
// - レビュー2: 雰囲気の強化
//   - 改善: 複数のカラフルなポイントライト、パーティクルシステム、グロー効果
//   - 課題: プールサイドの装飾が不足、カメラアングルの改善余地
// - レビュー3: 最終調整
//   - 完成: プールサイドのネオンチューブ、浮き輪の追加、カメラワークの最適化、アニメーション強化

export const createScene_claude = function () {
// export const createScene = function () {
    // シーンの作成
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.02, 0.02, 0.1); // 深夜の空の色

    // カメラ設定 - プールを見下ろす角度
    var camera = new BABYLON.ArcRotateCamera(
        "camera1", 
        Math.PI / 4, 
        Math.PI / 3, 
        20, 
        new BABYLON.Vector3(0, 0, 0), 
        scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 30;

    // 環境ライト（月明かり）
    var hemiLight = new BABYLON.HemisphericLight(
        "hemiLight", 
        new BABYLON.Vector3(0, 1, 0), 
        scene
    );
    hemiLight.intensity = 0.2;
    hemiLight.diffuse = new BABYLON.Color3(0.1, 0.1, 0.3);

    // ネオンライト1（ピンク）
    var pinkLight = new BABYLON.PointLight(
        "pinkLight", 
        new BABYLON.Vector3(-5, 2, -5), 
        scene
    );
    pinkLight.diffuse = new BABYLON.Color3(1, 0.2, 0.8);
    pinkLight.intensity = 15;
    pinkLight.range = 20;

    // ネオンライト2（シアン）
    var cyanLight = new BABYLON.PointLight(
        "cyanLight", 
        new BABYLON.Vector3(5, 2, 5), 
        scene
    );
    cyanLight.diffuse = new BABYLON.Color3(0, 0.8, 1);
    cyanLight.intensity = 15;
    cyanLight.range = 20;

    // ネオンライト3（パープル）
    var purpleLight = new BABYLON.PointLight(
        "purpleLight", 
        new BABYLON.Vector3(0, 2, 8), 
        scene
    );
    purpleLight.diffuse = new BABYLON.Color3(0.6, 0, 1);
    purpleLight.intensity = 12;
    purpleLight.range = 18;

    // グローレイヤー（光の滲み効果）
    var gl = new BABYLON.GlowLayer("glow", scene);
    gl.intensity = 0.8;

    // プール本体
    var pool = BABYLON.MeshBuilder.CreateBox(
        "pool", 
        {width: 16, height: 0.5, depth: 12}, 
        scene
    );
    pool.position.y = -0.25;

    // 水面マテリアル
    var waterMaterial = new BABYLON.StandardMaterial("waterMat", scene);
    waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.5);
    waterMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
    waterMaterial.emissiveColor = new BABYLON.Color3(0, 0.2, 0.4);
    waterMaterial.alpha = 0.7;
    waterMaterial.specularPower = 64;
    
    var water = BABYLON.MeshBuilder.CreateGround(
        "water", 
        {width: 15.5, height: 11.5}, 
        scene
    );
    water.position.y = 0.01;
    water.material = waterMaterial;

    // プールサイド
    var poolSideMaterial = new BABYLON.StandardMaterial("poolSideMat", scene);
    poolSideMaterial.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.2);
    pool.material = poolSideMaterial;

    // 浮き輪（球体をドーナツ状に配置）
    var floatMaterial = new BABYLON.StandardMaterial("floatMat", scene);
    floatMaterial.diffuseColor = new BABYLON.Color3(1, 0.3, 0.5);
    floatMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0.2);
    
    var float1 = BABYLON.MeshBuilder.CreateTorus(
        "float1", 
        {diameter: 2, thickness: 0.5, tessellation: 32}, 
        scene
    );
    float1.position = new BABYLON.Vector3(-3, 0.3, 2);
    float1.rotation.x = Math.PI / 2;
    float1.material = floatMaterial;
    gl.addIncludedOnlyMesh(float1);

    // 光る球体（装飾）
    var sphereMaterial = new BABYLON.StandardMaterial("sphereMat", scene);
    sphereMaterial.diffuseColor = new BABYLON.Color3(0, 0.8, 1);
    sphereMaterial.emissiveColor = new BABYLON.Color3(0, 0.5, 0.8);
    sphereMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
    
    var sphere = BABYLON.MeshBuilder.CreateSphere(
        "sphere", 
        {diameter: 1.5, segments: 32}, 
        scene
    );
    sphere.position = new BABYLON.Vector3(4, 0.75, -3);
    sphere.material = sphereMaterial;
    gl.addIncludedOnlyMesh(sphere);

    // プールサイドのネオンチューブ
    var createNeonTube = function(name, path, color) {
        var tube = BABYLON.MeshBuilder.CreateTube(
            name, 
            {path: path, radius: 0.1, tessellation: 32}, 
            scene
        );
        var tubeMat = new BABYLON.StandardMaterial(name + "Mat", scene);
        tubeMat.emissiveColor = color;
        tubeMat.diffuseColor = color;
        tube.material = tubeMat;
        gl.addIncludedOnlyMesh(tube);
        return tube;
    };

    // ネオンチューブ1（ピンク）
    var path1 = [
        new BABYLON.Vector3(-8, 0.3, -6),
        new BABYLON.Vector3(-8, 0.5, -6),
        new BABYLON.Vector3(-8, 0.7, -4),
        new BABYLON.Vector3(-8, 0.5, -2)
    ];
    createNeonTube("neon1", path1, new BABYLON.Color3(1, 0, 0.5));

    // ネオンチューブ2（シアン）
    var path2 = [
        new BABYLON.Vector3(8, 0.3, 6),
        new BABYLON.Vector3(8, 0.5, 6),
        new BABYLON.Vector3(8, 0.7, 4),
        new BABYLON.Vector3(8, 0.5, 2)
    ];
    createNeonTube("neon2", path2, new BABYLON.Color3(0, 1, 1));

    // 地面（プールの周り）
    var ground = BABYLON.MeshBuilder.CreateGround(
        "ground", 
        {width: 30, height: 30}, 
        scene
    );
    ground.position.y = -0.5;
    var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.15);
    ground.material = groundMat;

    // パーティクルシステム（水しぶき効果）
    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture(
        "https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/flare.png", 
        scene
    );
    particleSystem.emitter = water;
    particleSystem.minEmitBox = new BABYLON.Vector3(-7, 0, -5);
    particleSystem.maxEmitBox = new BABYLON.Vector3(7, 0, 5);
    particleSystem.color1 = new BABYLON.Color4(0, 0.8, 1, 1);
    particleSystem.color2 = new BABYLON.Color4(1, 0.2, 0.8, 1);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.2;
    particleSystem.minLifeTime = 0.5;
    particleSystem.maxLifeTime = 2;
    particleSystem.emitRate = 100;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-0.2, 1, -0.2);
    particleSystem.direction2 = new BABYLON.Vector3(0.2, 1.5, 0.2);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 1.5;
    particleSystem.updateSpeed = 0.01;
    particleSystem.start();

    // アニメーション
    var alpha = 0;
    scene.registerBeforeRender(function() {
        alpha += 0.01;
        
        // ライトの脈動
        pinkLight.intensity = 15 + Math.sin(alpha * 2) * 3;
        cyanLight.intensity = 15 + Math.sin(alpha * 2 + Math.PI) * 3;
        purpleLight.intensity = 12 + Math.sin(alpha * 1.5) * 2;
        
        // 浮き輪の揺れ
        float1.position.y = 0.3 + Math.sin(alpha) * 0.1;
        float1.rotation.y = alpha * 0.3;
        
        // 球体の回転
        sphere.rotation.y = alpha * 0.5;
        sphere.position.y = 0.75 + Math.sin(alpha * 1.5) * 0.15;
        
        // 水面の波紋効果（エミッシブカラーの変化）
        var waveIntensity = 0.2 + Math.sin(alpha) * 0.1;
        waterMaterial.emissiveColor = new BABYLON.Color3(0, waveIntensity, waveIntensity * 2);
    });

    return scene;
};


export const  createScene = createScene_chatGPT;
// export const  createScene = createScene_gemini;
// export const createScene = createScene_claude;

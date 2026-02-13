// Babylon.js：サンプルを生成ＡＩで サイバースペース にしてみる

// ######################################################################

// chatGPT

// - 到達した表現の特徴
//   - ネオン発光＋グローによる 仮想空間的視覚効果
//   - グリッド床で「無限デジタル空間」を暗示
//   - フォグと暗色背景で奥行きと没入感を演出
//   - 中央の球体は データコア／AIノード的存在

export const createScene_chatGPT = function () {
// export const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    /* ======================
       Scene Base Settings
    ====================== */
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.05, 1.0);
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.03;
    scene.fogColor = new BABYLON.Color3(0.05, 0.1, 0.15);

    /* ======================
       Camera
    ====================== */
    const camera = new BABYLON.FreeCamera(
        "camera",
        new BABYLON.Vector3(0, 6, -14),
        scene
    );
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.speed = 0.4;
    camera.inertia = 0.7;

    /* ======================
       Lights
    ====================== */
    const hemi = new BABYLON.HemisphericLight(
        "hemi",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    hemi.intensity = 0.15;
    hemi.diffuse = new BABYLON.Color3(0.2, 0.6, 1.0);

    const neonLight = new BABYLON.PointLight(
        "neonLight",
        new BABYLON.Vector3(0, 4, 0),
        scene
    );
    neonLight.diffuse = new BABYLON.Color3(0.0, 0.9, 1.0);
    neonLight.intensity = 1.2;

    /* ======================
       Glow Effect
    ====================== */
    const glow = new BABYLON.GlowLayer("glow", scene);
    glow.intensity = 0.8;

    /* ======================
       Cyber Sphere (Core Node)
    ====================== */
    const sphere = BABYLON.MeshBuilder.CreateSphere(
        "core",
        { diameter: 2.2, segments: 48 },
        scene
    );
    sphere.position.y = 2.5;

    const sphereMat = new BABYLON.StandardMaterial("sphereMat", scene);
    sphereMat.emissiveColor = new BABYLON.Color3(0.0, 0.8, 1.0);
    sphereMat.alpha = 0.9;
    sphere.material = sphereMat;

    /* ======================
       Grid Ground
    ====================== */
    const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 40, height: 40 },
        scene
    );

    const gridMat = new BABYLON.GridMaterial("gridMat", scene);
    gridMat.majorUnitFrequency = 5;
    gridMat.minorUnitVisibility = 0.45;
    gridMat.gridRatio = 2;
    gridMat.backFaceCulling = false;
    gridMat.mainColor = new BABYLON.Color3(0.0, 0.9, 1.0);
    gridMat.lineColor = new BABYLON.Color3(0.0, 0.6, 0.8);
    gridMat.opacity = 0.95;
    ground.material = gridMat;

    /* ======================
       Animation (Floating Core)
    ====================== */
    scene.registerBeforeRender(() => {
        const t = performance.now() * 0.002;
        sphere.position.y = 2.5 + Math.sin(t) * 0.3;
        sphere.rotation.y += 0.005;
    });

    return scene;
};

// ######################################################################
// gemini

// 「サイバースペース」というテーマに基づき、**「ネオン、グリッド、発光（Bloom）、幾何学的な構造」**を軸に3段階のブラッシュアップを行いました。
//
// 制作プロセス：3回のレビューと修正
// - 【1回目】ビジュアルの方向性の決定
//   - レビュー: 元のソースはデフォルトのライティングとグレーの地面で「現実的」すぎる。サイバースペースには「暗闇」と「線」が必要。
//   - 修正: 地面を**ワイヤーフレーム（Wireframe）**に変更し、背景を黒に固定。標準のFreeCameraから、操作しやすいArcRotateCameraへ変更しました。
// - 【2回目】「光」の質感の向上
//   - レビュー: ワイヤーフレームだけでは寂しい。デジタル空間特有の「眩しさ」や「エネルギー感」が足りない。
//   - 修正: Babylon.jsのDefaultRenderingPipelineを導入し、Bloom（発光）エフェクトを追加。これにより、ワイヤーフレームの線がネオンのように光り輝くようになります。
// - 【3回目】動的な要素とディテールの追加
//   - レビュー: 静止していると単なる図形に見える。データが流れているような感覚や、奥行きが欲しい。
//   - 修正: * PointsCloudSystemを導入し、空間に浮遊するデータチップ（パーティクル）を配置。
//     - registerBeforeRender を使って、中心の球体を回転。
//     - 地面の発光強度にサイン波（sin）を用いたアニメーションを加え、空間が「呼吸」しているような演出を追加。


export const createScene_gemini = function () {
// export const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    
    // 背景を漆黒に設定
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    // 1. カメラの設定（少し引いて全体を見渡す）
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    // 2. ポストプロセス（発光エフェクト）の追加
    const pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, [camera]);
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.3;
    pipeline.bloomWeight = 0.8;
    pipeline.bloomKernel = 64;

    // 3. 環境光を抑え、エミッシブ（自発光）を強調
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.2;

    // 4. サイバー・グリッド・グラウンド
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 40, height: 40}, scene);
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    groundMat.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.5); // 深い青
    groundMat.wireframe = true; // ワイヤーフレームでグリッドを表現
    ground.material = groundMat;

    // 5. サイバー・スフィア（コア）
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 16}, scene);
    sphere.position.y = 2;
    const sphereMat = new BABYLON.StandardMaterial("sphereMat", scene);
    sphereMat.emissiveColor = new BABYLON.Color3(0, 1, 1); // シアンの発光
    sphereMat.wireframe = true;
    sphere.material = sphereMat;

    // 6. 周囲を浮遊するデジタル・パーティクル
    const box = BABYLON.MeshBuilder.CreateBox("box", {size: 0.1}, scene);
    box.isVisible = false;
    const pcs = new BABYLON.PointsCloudSystem("pcs", 2, scene);
    pcs.addPoints(1000, (particle, i) => {
        particle.position = new BABYLON.Vector3(Math.random() * 20 - 10, Math.random() * 10, Math.random() * 20 - 10);
        particle.color = new BABYLON.Color4(0, 1, 0.5, 1); // ネオングリーン
    });
    pcs.buildMeshAsync();

    // 7. アニメーション（回転させてサイバー感を出す）
    scene.registerBeforeRender(() => {
        sphere.rotation.y += 0.01;
        sphere.rotation.x += 0.005;
        groundMat.emissiveColor.r = 0.1 + Math.sin(Date.now() * 0.001) * 0.05;
    });

    return scene;
};

// ######################################################################
// cluade

// 主な変更点
//
// 1. ネオンカラーリング
//   - シアン、マゼンタ、オレンジの複数のポイントライト
//   - 発光マテリアル（emissiveColor）の使用
// 2. グリッド床
//   - ワイヤーフレーム表示でサイバースペースらしいグリッド
//   - 半透明で発光する床面
// 3. 動的要素
//   - 中央の球体が浮遊・回転・色変化
//   - 20個の浮遊データキューブが回転・浮遊
//   - カメラの自動回転
// 4. パーティクルエフェクト
//   - デジタルレイン風のパーティクルシステム
//   - 2000個のパーティクルが降り注ぐ
// 5. グローエフェクト
//   - GlowLayerでネオン発光効果を強化
//   - すべての発光オブジェクトが輝く
//
// これでトロン風のサイバースペースシーンが完成です！

export const createScene_claude = function () {
// export const createScene = function () {
    // Basic Babylon Scene
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.02, 0.02, 0.1);

    // Camera with cinematic movement
    var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 3, 20, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 40;
    
    // Auto-rotate camera for cyberspace feel
    scene.registerBeforeRender(function () {
        camera.alpha += 0.001;
    });

    // Multiple colored lights for neon effect
    var light1 = new BABYLON.PointLight("light1", new BABYLON.Vector3(0, 10, 0), scene);
    light1.diffuse = new BABYLON.Color3(0, 1, 1); // Cyan
    light1.intensity = 0.8;

    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(5, 5, 5), scene);
    light2.diffuse = new BABYLON.Color3(1, 0, 1); // Magenta
    light2.intensity = 0.6;

    var light3 = new BABYLON.PointLight("light3", new BABYLON.Vector3(-5, 5, -5), scene);
    light3.diffuse = new BABYLON.Color3(1, 0.5, 0); // Orange
    light3.intensity = 0.5;

    // Animated central sphere with emissive material
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 3, segments: 64}, scene);
    sphere.position.y = 2;
    
    var sphereMaterial = new BABYLON.StandardMaterial("sphereMat", scene);
    sphereMaterial.emissiveColor = new BABYLON.Color3(0, 1, 1);
    sphereMaterial.diffuseColor = new BABYLON.Color3(0, 0.5, 0.5);
    sphereMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
    sphereMaterial.specularPower = 128;
    sphere.material = sphereMaterial;

    // Sphere animation
    var sphereAnim = 0;
    scene.registerBeforeRender(function () {
        sphereAnim += 0.02;
        sphere.position.y = 2 + Math.sin(sphereAnim) * 0.5;
        sphere.rotation.y += 0.01;
        sphereMaterial.emissiveColor = new BABYLON.Color3(
            0.5 + Math.sin(sphereAnim) * 0.5,
            0.5 + Math.sin(sphereAnim + Math.PI / 3) * 0.5,
            0.5 + Math.sin(sphereAnim + 2 * Math.PI / 3) * 0.5
        );
    });

    // Cyberspace grid ground
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 50, height: 50, subdivisions: 50}, scene);
    var groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.5);
    groundMaterial.wireframe = true;
    groundMaterial.alpha = 0.8;
    ground.material = groundMaterial;

    // Floating data cubes
    var cubeCount = 20;
    var cubes = [];
    for (var i = 0; i < cubeCount; i++) {
        var cube = BABYLON.MeshBuilder.CreateBox("cube" + i, {size: 0.5}, scene);
        cube.position = new BABYLON.Vector3(
            Math.random() * 20 - 10,
            Math.random() * 10 + 2,
            Math.random() * 20 - 10
        );
        
        var cubeMat = new BABYLON.StandardMaterial("cubeMat" + i, scene);
        var colorChoice = Math.random();
        if (colorChoice < 0.33) {
            cubeMat.emissiveColor = new BABYLON.Color3(1, 0, 1); // Magenta
        } else if (colorChoice < 0.66) {
            cubeMat.emissiveColor = new BABYLON.Color3(0, 1, 1); // Cyan
        } else {
            cubeMat.emissiveColor = new BABYLON.Color3(1, 1, 0); // Yellow
        }
        cubeMat.alpha = 0.7;
        cube.material = cubeMat;
        
        cubes.push({
            mesh: cube,
            rotSpeed: Math.random() * 0.05,
            floatSpeed: Math.random() * 0.02 + 0.01,
            floatOffset: Math.random() * Math.PI * 2
        });
    }

    // Animate floating cubes
    var cubeAnim = 0;
    scene.registerBeforeRender(function () {
        cubeAnim += 0.01;
        cubes.forEach(function(cubeData) {
            cubeData.mesh.rotation.x += cubeData.rotSpeed;
            cubeData.mesh.rotation.y += cubeData.rotSpeed;
            cubeData.mesh.position.y += Math.sin(cubeAnim * cubeData.floatSpeed + cubeData.floatOffset) * 0.02;
        });
    });

    // Particle system for digital rain effect
    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);
    
    particleSystem.emitter = new BABYLON.Vector3(0, 10, 0);
    particleSystem.minEmitBox = new BABYLON.Vector3(-20, 0, -20);
    particleSystem.maxEmitBox = new BABYLON.Vector3(20, 0, 20);
    
    particleSystem.color1 = new BABYLON.Color4(0, 1, 1, 1);
    particleSystem.color2 = new BABYLON.Color4(0, 0.5, 1, 1);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.5, 0);
    
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.3;
    
    particleSystem.minLifeTime = 2;
    particleSystem.maxLifeTime = 4;
    
    particleSystem.emitRate = 500;
    
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    
    particleSystem.gravity = new BABYLON.Vector3(0, -2, 0);
    
    particleSystem.direction1 = new BABYLON.Vector3(0, -1, 0);
    particleSystem.direction2 = new BABYLON.Vector3(0, -1, 0);
    
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.01;
    
    particleSystem.start();

    // Glow layer for cyberpunk neon effect
    var gl = new BABYLON.GlowLayer("glow", scene);
    gl.intensity = 1.5;

    return scene;
};


export const  createScene = createScene_chatGPT;
// export const  createScene = createScene_gemini;
// export const createScene = createScene_claude;

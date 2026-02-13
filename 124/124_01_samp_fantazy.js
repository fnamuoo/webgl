// Babylon.js：サンプルを生成ＡＩで幻想的にしてみる

// const fpathFlare = "textures/flare.png";
const fpathFlare = "../068/textures/flare.png";
// const fpathFlare = "textures/flare.png";

// ######################################################################
// ######################################################################
// ######################################################################

// chatGPT
//
// 設計上の最終的な狙いは以下です。
//
// - 現実感を弱めるための フォグ（距離減衰）
// - 発光を強調する GlowLayer
// - 地面・球体に物理感よりも 光学的質感（透明感・反射）
// - ゆっくり呼吸するような アニメーション
// - 空間を満たす 微粒子（パーティクル）
// - 均質照明を避け、色温度を持った光源構成
//
// まとめ（設計レビューの観点）
// - 第1段階：色・光・フォグで「現実離れ」
// - 第2段階：PBR + 発光 + アニメーションで「生命感」
// - 第3段階：粒子と空間密度で「幻想的雰囲気の完成」

export const createScene_chatGPT = function () {
// export const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    /* ===============================
       Camera
    =============================== */
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 3,
        15,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 8;
    camera.upperRadiusLimit = 25;

    /* ===============================
       Fog (幻想感の基盤)
    =============================== */
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.03;
    scene.fogColor = new BABYLON.Color3(0.05, 0.1, 0.2);

    /* ===============================
       Lights
    =============================== */
    const hemiLight = new BABYLON.HemisphericLight(
        "hemi",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    hemiLight.intensity = 0.4;
    hemiLight.diffuse = new BABYLON.Color3(0.4, 0.6, 1.0);
    hemiLight.groundColor = new BABYLON.Color3(0.05, 0.05, 0.1);

    const pointLight = new BABYLON.PointLight(
        "point",
        new BABYLON.Vector3(0, 3, 0),
        scene
    );
    pointLight.diffuse = new BABYLON.Color3(0.6, 0.8, 1.0);
    pointLight.intensity = 1.2;

    /* ===============================
       Glow Layer
    =============================== */
    const glowLayer = new BABYLON.GlowLayer("glow", scene);
    glowLayer.intensity = 1.2;

    /* ===============================
       Sphere (主役)
    =============================== */
    const sphere = BABYLON.MeshBuilder.CreateSphere(
        "sphere",
        { diameter: 2, segments: 64 },
        scene
    );
    sphere.position.y = 1.5;

    const sphereMat = new BABYLON.PBRMaterial("sphereMat", scene);
    sphereMat.albedoColor = new BABYLON.Color3(0.2, 0.6, 1.0);
    sphereMat.emissiveColor = new BABYLON.Color3(0.2, 0.5, 1.0);
    sphereMat.alpha = 0.9;
    sphereMat.metallic = 0.0;
    sphereMat.roughness = 0.15;
    sphere.material = sphereMat;

    /* 浮遊アニメーション */
    scene.registerBeforeRender(() => {
        const t = performance.now() * 0.001;
        sphere.position.y = 1.5 + Math.sin(t) * 0.3;
        sphere.rotation.y += 0.002;
        sphereMat.emissiveColor = new BABYLON.Color3(
            0.2 + Math.sin(t) * 0.1,
            0.5 + Math.sin(t * 1.3) * 0.1,
            1.0
        );
    });

    /* ===============================
       Ground
    =============================== */
    const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 20, height: 20 },
        scene
    );

    const groundMat = new BABYLON.PBRMaterial("groundMat", scene);
    groundMat.albedoColor = new BABYLON.Color3(0.02, 0.04, 0.08);
    groundMat.metallic = 0.0;
    groundMat.roughness = 0.9;
    ground.material = groundMat;

    /* ===============================
       Particles (空間の気配)
    =============================== */
    const particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture =
        new BABYLON.Texture(fpathFlare, scene);

    particleSystem.emitter = BABYLON.Vector3.Zero();
    particleSystem.minEmitBox = new BABYLON.Vector3(-5, 0, -5);
    particleSystem.maxEmitBox = new BABYLON.Vector3(5, 5, 5);

    particleSystem.color1 = new BABYLON.Color4(0.6, 0.8, 1.0, 0.5);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.4, 1.0, 0.2);
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.2;
    particleSystem.minLifeTime = 2;
    particleSystem.maxLifeTime = 6;
    particleSystem.emitRate = 300;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    particleSystem.gravity = new BABYLON.Vector3(0, -0.1, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-0.1, 1, -0.1);
    particleSystem.direction2 = new BABYLON.Vector3(0.1, 1, 0.1);
    particleSystem.start();

    return scene;
};


// gemini
//
// ブラッシュアップのプロセス
// - ステップ1：環境の再構築
//   - 標準的なライトを廃止し、**フォグ（霧）と発光（Glow Layer）**を導入。
//   - 地面を単なる板から、鏡面のような反射を持つ素材に変更。
// - ステップ2：マテリアルの魔法化
//   - 球体を、内側から光を放つ**「エナジーコア」**のような質感に変更。
//   - 背景を深い紺色から紫へのグラデーション（宇宙的・幻想的）に設定。
// - ステップ3：パーティクルとアニメーション
//   - 静止した世界に、浮遊する光の粒子（星屑）を追加。
//   - 球体にゆっくりとした浮遊感（上下動）を与え、生命感を演出。
//
// 変更のポイント
// - Glow Layer (BABYLON.GlowLayer): オブジェクトの輪郭をぼんやりと光らせる、最も効果的な「幻想的演出」です。
// - Fog (霧): 遠くを霞ませることで、空間に奥行きと神秘的な空気感を出しています。
// - Particle System: 画面全体にゆっくりと舞い上がる光の粒を追加し、静止画ではない「生きている空間」を演出しました。
// - サイン波による浮遊: Math.sin(alpha) を使って球体を上下させることで、重力から解放された魔法のような動きを再現しています。
//
// このコードを適用すると、青紫色の静謐な空間に、光り輝く宝玉が浮遊し、周囲を光の粉が舞うような景色が広がります。

export const createScene_gemini = function () {
// export const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // --- 1. 環境設定：幻想的な霧と背景 ---
    scene.clearColor = new BABYLON.Color4(0.02, 0.01, 0.05, 1); // 深い夜空の色
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogDensity = 0.02;
    scene.fogColor = new BABYLON.Color3(0.1, 0.05, 0.2);

    // カメラ：ゆったりとした視点移動
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 30;
    camera.useAutoRotationBehavior = true; // 自動でゆっくり回転

    // --- 2. ライティングと特殊効果 ---
    const light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 5, 0), scene);
    light.intensity = 0.5;
    light.diffuse = new BABYLON.Color3(0.5, 0.5, 1);

    // 発光レイヤー（Glow Layer）: これが幻想的な輝きの肝になります
    const gl = new BABYLON.GlowLayer("glow", scene);
    gl.intensity = 0.8;

    // --- 3. メインオブジェクト：エナジーコア ---
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 64}, scene);
    sphere.position.y = 2;

    const sphereMat = new BABYLON.StandardMaterial("sphereMat", scene);
    sphereMat.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0.8); // 自ら光る色
    sphereMat.specularColor = new BABYLON.Color3(1, 1, 1);
    sphereMat.alpha = 0.9;
    sphere.material = sphereMat;

    // --- 4. 地面：鏡面反射の湖面 ---
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 40, height: 40}, scene);
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    groundMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    groundMat.roughness = 0.2;
    ground.material = groundMat;

    // --- 5. パーティクルシステム：浮遊する光の粒子 ---
    const particleSystem = new BABYLON.ParticleSystem("particles", 500, scene);
    particleSystem.particleTexture = new BABYLON.Texture(fpathFlare, scene); // 標準的なフレア画像
    particleSystem.emitter = new BABYLON.Vector3(0, 0, 0); 
    particleSystem.minEmitBox = new BABYLON.Vector3(-10, 0, -10);
    particleSystem.maxEmitBox = new BABYLON.Vector3(10, 5, 10);
    
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.2;
    particleSystem.minLifeTime = 2;
    particleSystem.maxLifeTime = 5;
    particleSystem.emitRate = 50;
    particleSystem.gravity = new BABYLON.Vector3(0, 0.1, 0); // 軽く浮かび上がる
    particleSystem.start();

    // --- 6. アニメーション：浮遊する動き ---
    let alpha = 0;
    scene.registerBeforeRender(() => {
        alpha += 0.02;
        sphere.position.y = 2 + Math.sin(alpha) * 0.5; // ふわふわと上下する
        sphere.rotation.y += 0.01;
    });

    return scene;
};



// claude

// 主な改善点
// - 視覚効果
//   - グローエフェクト: 全体が柔らかく発光
//   - 透明感のあるマテリアル: クリスタルのような質感
//   - 深い青紫の背景: 夜空のような神秘的な雰囲気
// - 動的要素
//   - 自動回転カメラ: シーンをゆっくり周回
//   - 浮遊アニメーション: 球体が優雅に上下
//   - 12個の浮遊球体: それぞれ独立したリズムで動く
// - パーティクル
//   - 上昇する光の粒子: 2000個の光が地面から舞い上がる
//   - 星屑: 中央の球体を中心に1000個のきらめき
// - 照明
//   - 複数のポイントライト: ピンクとシアンの幻想的な配色
//   - 控えめな環境光: 影と光のコントラスト
// このシーンは、魔法陣の上で光の結晶が浮遊し、無数の光の粒子が舞い上がる、まるで異世界のような幻想的な空間を表現しています。


export const createScene_claude = function () {
// export const createScene = function () {
    // 基本シーンの作成
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.15, 1.0);

    // カメラの作成と配置
    var camera = new BABYLON.ArcRotateCamera("camera1", 
        Math.PI / 2, Math.PI / 3, 20, 
        new BABYLON.Vector3(0, 2, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 40;
    
    // カメラの自動回転（ゆっくりと優雅に）
    scene.beforeRender = function () {
        camera.alpha += 0.001;
    };

    // 複数のライト設定で神秘的な雰囲気
    var mainLight = new BABYLON.HemisphericLight("light1", 
        new BABYLON.Vector3(0, 1, 0), scene);
    mainLight.intensity = 0.4;
    mainLight.diffuse = new BABYLON.Color3(0.6, 0.7, 1.0);
    
    var pointLight1 = new BABYLON.PointLight("pointLight1", 
        new BABYLON.Vector3(0, 3, 0), scene);
    pointLight1.diffuse = new BABYLON.Color3(1, 0.8, 1);
    pointLight1.intensity = 2;
    
    var pointLight2 = new BABYLON.PointLight("pointLight2", 
        new BABYLON.Vector3(5, 2, 5), scene);
    pointLight2.diffuse = new BABYLON.Color3(0.5, 1, 1);
    pointLight2.intensity = 1.5;

    // グローレイヤーで発光効果
    var gl = new BABYLON.GlowLayer("glow", scene);
    gl.intensity = 0.8;

    // 中央の主要な球体（クリスタルのような）
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", 
        {diameter: 2, segments: 64}, scene);
    sphere.position.y = 3;
    
    var sphereMaterial = new BABYLON.PBRMaterial("sphereMat", scene);
    sphereMaterial.albedoColor = new BABYLON.Color3(0.8, 0.9, 1.0);
    sphereMaterial.metallic = 0.2;
    sphereMaterial.roughness = 0.1;
    sphereMaterial.alpha = 0.7;
    sphereMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.6, 1.0);
    sphere.material = sphereMaterial;
    
    // 球体の浮遊アニメーション
    var sphereAnim = new BABYLON.Animation("sphereFloat", "position.y", 30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var keys = [];
    keys.push({ frame: 0, value: 3 });
    keys.push({ frame: 60, value: 4 });
    keys.push({ frame: 120, value: 3 });
    sphereAnim.setKeys(keys);
    sphere.animations.push(sphereAnim);
    scene.beginAnimation(sphere, 0, 120, true);

    // 周囲に浮遊する小さな球体群
    for (let i = 0; i < 12; i++) {
        var floatingSphere = BABYLON.MeshBuilder.CreateSphere("float" + i, 
            {diameter: 0.3 + Math.random() * 0.3, segments: 16}, scene);
        
        var angle = (i / 12) * Math.PI * 2;
        var radius = 5 + Math.random() * 3;
        floatingSphere.position.x = Math.cos(angle) * radius;
        floatingSphere.position.z = Math.sin(angle) * radius;
        floatingSphere.position.y = 1 + Math.random() * 4;
        
        var floatMat = new BABYLON.StandardMaterial("floatMat" + i, scene);
        floatMat.emissiveColor = new BABYLON.Color3(
            0.5 + Math.random() * 0.5,
            0.5 + Math.random() * 0.5,
            0.8 + Math.random() * 0.2
        );
        floatMat.alpha = 0.6;
        floatingSphere.material = floatMat;
        
        // 個別の浮遊アニメーション
        var floatAnim = new BABYLON.Animation("float" + i, "position.y", 30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        var floatKeys = [];
        var startY = floatingSphere.position.y;
        floatKeys.push({ frame: 0, value: startY });
        floatKeys.push({ frame: 30 + i * 5, value: startY + 0.5 + Math.random() });
        floatKeys.push({ frame: 60 + i * 5, value: startY });
        floatAnim.setKeys(floatKeys);
        floatingSphere.animations.push(floatAnim);
        scene.beginAnimation(floatingSphere, 0, 60 + i * 5, true);
    }

    // 魔法陣のような地面
    var ground = BABYLON.MeshBuilder.CreateGround("ground", 
        {width: 20, height: 20, subdivisions: 4}, scene);
    
    var groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.3);
    groundMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.8);
    groundMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.2);
    groundMaterial.alpha = 0.8;
    ground.material = groundMaterial;

    // パーティクルシステム1: 上昇する光の粒子
    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture(fpathFlare, scene);
    particleSystem.emitter = new BABYLON.Vector3(0, 0, 0);
    particleSystem.minEmitBox = new BABYLON.Vector3(-8, 0, -8);
    particleSystem.maxEmitBox = new BABYLON.Vector3(8, 0, 8);
    
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.9, 0.6, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0.5, 0.5, 1.0, 0.0);
    
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.15;
    particleSystem.minLifeTime = 3;
    particleSystem.maxLifeTime = 6;
    particleSystem.emitRate = 200;
    
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    particleSystem.gravity = new BABYLON.Vector3(0, 1, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-0.2, 2, -0.2);
    particleSystem.direction2 = new BABYLON.Vector3(0.2, 3, 0.2);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 1;
    particleSystem.updateSpeed = 0.01;
    
    particleSystem.start();

    // パーティクルシステム2: 周囲を漂う星屑
    var starParticles = new BABYLON.ParticleSystem("stars", 1000, scene);
    starParticles.particleTexture = new BABYLON.Texture(fpathFlare, scene);
    starParticles.emitter = sphere;
    starParticles.createSphereEmitter(8);
    
    starParticles.color1 = new BABYLON.Color4(1.0, 1.0, 0.8, 1.0);
    starParticles.color2 = new BABYLON.Color4(0.8, 1.0, 1.0, 1.0);
    starParticles.colorDead = new BABYLON.Color4(0.5, 0.5, 0.5, 0.0);
    
    starParticles.minSize = 0.02;
    starParticles.maxSize = 0.08;
    starParticles.minLifeTime = 2;
    starParticles.maxLifeTime = 5;
    starParticles.emitRate = 100;
    
    starParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    starParticles.gravity = new BABYLON.Vector3(0, 0, 0);
    starParticles.minEmitPower = 0.1;
    starParticles.maxEmitPower = 0.3;
    starParticles.updateSpeed = 0.005;
    
    starParticles.start();

    return scene;
};


export const  createScene = createScene_chatGPT;
// export const  createScene = createScene_gemini;
// export const createScene = createScene_claude;

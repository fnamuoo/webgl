// sample - night-pool

// const fpathFlare = "textures/flare.png";

const fpathFlare = "../068/textures/flare.png";

// const fpathFlare = "textures/flare.png";
// const fpathFlare = "https://raw.githubusercontent.com/fnamuoo/webgl/main/081/textures/flare.png";

// ######################################################################

// chatGPT

// 新海誠作品に典型的な要素（高彩度の空、地平線の光、薄い雲、ブルーム、透明感のある被写体、時間帯を感じさせるライティング）を Babylon.js 標準APIのみ で段階的に統合した到達点になります。
//
// - 到達点の特徴（3回レビュー後）
//   - 色彩設計：青～橙の補色関係を意識した空と地表
//   - 光演出：ブルーム＋霧で「湿度のある空気感」
//   - 構図：低視点＋仰角で空を主役に
//   - 主題性：透明オブジェクトを情景の象徴として配置

export const createScene_chatGPT = function () {
// export const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    /* === Camera ===
       ・やや低めの視点
       ・空を仰ぐ構図（新海誠的パース）
    */
    const camera = new BABYLON.FreeCamera(
        "camera",
        new BABYLON.Vector3(0, 2.5, -12),
        scene
    );
    camera.setTarget(new BABYLON.Vector3(0, 2, 0));
    camera.attachControl(canvas, true);
    camera.fov = BABYLON.Tools.ToRadians(55);

    /* === Lighting ===
       ・夕方～マジックアワーを想定
       ・空色＋地表反射の二層構成
    */
    const hemiLight = new BABYLON.HemisphericLight(
        "hemi",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    hemiLight.intensity = 0.85;
    hemiLight.diffuse = new BABYLON.Color3(0.85, 0.9, 1.0);
    hemiLight.groundColor = new BABYLON.Color3(1.0, 0.75, 0.65);

    const sunLight = new BABYLON.DirectionalLight(
        "sun",
        new BABYLON.Vector3(-0.4, -1, 0.3),
        scene
    );
    sunLight.position = new BABYLON.Vector3(20, 40, -20);
    sunLight.intensity = 1.2;

    /* === Sky ===
       ・グラデーション空
       ・高彩度・透明感重視
    */
    const skybox = BABYLON.MeshBuilder.CreateBox(
        "skyBox",
        { size: 1000 },
        scene
    );
    const skyMat = new BABYLON.StandardMaterial("skyMat", scene);
    skyMat.backFaceCulling = false;
    skyMat.disableLighting = true;
    skyMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyMat.emissiveColor = new BABYLON.Color3(0.45, 0.65, 1.0);
    skybox.material = skyMat;

    /* === Ground ===
       ・淡色・反射少なめ
       ・情景を邪魔しないベース
    */
    const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 40, height: 40 },
        scene
    );
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.95, 0.9, 0.85);
    groundMat.specularColor = BABYLON.Color3.Black();
    ground.material = groundMat;

    /* === Main Object ===
       ・ガラス的透明感
       ・空色を映す存在感（象徴オブジェクト）
    */
    const sphere = BABYLON.MeshBuilder.CreateSphere(
        "sphere",
        { diameter: 2.2, segments: 48 },
        scene
    );
    sphere.position.y = 2;

    const sphereMat = new BABYLON.StandardMaterial("sphereMat", scene);
    sphereMat.diffuseColor = new BABYLON.Color3(0.6, 0.75, 1.0);
    sphereMat.specularColor = new BABYLON.Color3(1, 1, 1);
    sphereMat.alpha = 0.85;
    sphereMat.emissiveColor = new BABYLON.Color3(0.15, 0.25, 0.4);
    sphere.material = sphereMat;

    /* === Atmosphere ===
       ・薄いフォグで距離感と叙情性を演出
    */
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.008;
    scene.fogColor = new BABYLON.Color3(0.75, 0.85, 1.0);

    /* === Post Process ===
       ・新海誠的「光のにじみ」
    */
    const pipeline = new BABYLON.DefaultRenderingPipeline(
        "defaultPipeline",
        true,
        scene,
        [camera]
    );
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.7;
    pipeline.bloomWeight = 0.6;
    pipeline.bloomKernel = 64;
    pipeline.bloomScale = 0.5;

    return scene;
};


// ######################################################################
// gemini

// 新海誠監督の作品（『君の名は。』『天気の子』『すずめの戸締まり』など）が持つ、「圧倒的な光のコントラスト」「鮮やかな空の階調」「レンズフレア」、そして**「透明感」**を表現するため、3段階のステップ（レビューと修正）を経てコードをブラッシュアップしました。
//
// 1. ステップ 1：光と空気感の演出（ライティングとフォグ）
//   - レビュー: デフォルトのHemisphericLightでは平坦すぎるため、強い太陽光（DirectionalLight）と、空気の厚みを感じさせるフォグ（霧）を追加。
// 2. ステップ 2：新海ブルーと雲の質感を加える（スカイボックス）
//   - レビュー: 象徴的な「青空」を表現するために、グラデーションの効いたスカイボックスを配置。影を濃くし、光が当たる部分をより強調する。
// 3. ステップ 3：ポストプロセスの導入（グローとブルーム）
//   - レビュー: 光が溢れ出すような「エモさ」を出すにはポストプロセスが不可欠。GlowLayerと、レンズフレアのような光の拡散をシミュレートする設定を最終調整。
//
// このコードのポイント
// - Color Gradation: 単なる白ではなく、fogColorやemissiveColorに青や紫を混ぜることで、夕暮れ前や夜明けのような深みを出しています。
// - High Intensity & Bloom: sunLight.intensityを高く設定し、DefaultRenderingPipelineのbloomを有効にすることで、白い地面や球体のエッジが光に溶け込むような視覚効果を生んでいます。
// - Shadows: 影をぼかしつつも存在感を出すことで、夏の強い日差しのようなコントラストを再現しました。

export const createScene_gemini = function () {
// export const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // 1. カメラ設定：少し煽り（ローアングル）気味にして空を広く見せる
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true);
    camera.upperBetaLimit = Math.PI / 2.2; // 地面以下に行かないように制限

    // 2. 環境光とフォグ：透明感のある青白い空気
    scene.clearColor = new BABYLON.Color4(0.5, 0.7, 1, 1); // 澄んだ青
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogDensity = 0.01;
    scene.fogColor = new BABYLON.Color3(0.8, 0.9, 1.0);

    // 3. 太陽光（Directional Light）：ドラマチックな影を作る
    const sunLight = new BABYLON.DirectionalLight("sunLight", new BABYLON.Vector3(-1, -2, -1), scene);
    sunLight.position = new BABYLON.Vector3(20, 40, 20);
    sunLight.intensity = 3.0;
    
    // 環境光（柔らかい照り返し）
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.5;
    hemiLight.groundColor = new BABYLON.Color3(0.2, 0.3, 0.5);

    // 4. マテリアル：彩度を高め、光の反射（フレア感）を意識
    const sphereMat = new BABYLON.StandardMaterial("sphereMat", scene);
    sphereMat.diffuseColor = new BABYLON.Color3(0.1, 0.5, 1.0); // 鮮やかな青
    sphereMat.specularColor = new BABYLON.Color3(1, 1, 1);
    sphereMat.specularPower = 64;
    sphereMat.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.2); // 暗部にも青みを残す

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
    sphere.position.y = 1;
    sphere.material = sphereMat;

    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
    ground.material = groundMat;

    // 5. シャドウ：パキッとした濃い影
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, sunLight);
    shadowGenerator.addShadowCaster(sphere);
    ground.receiveShadows = true;
    shadowGenerator.useBlurExponentialShadowMap = true;

    // 6. ポストプロセス：新海作品最大の鍵「光の溢れ」
    // グローレイヤーで光っている部分を強調
    const gl = new BABYLON.GlowLayer("glow", scene);
    gl.intensity = 0.6;

    // パイプラインでハイライトを飛ばし、彩度を上げる
    const pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, [camera]);
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.7;
    pipeline.bloomWeight = 0.5;
    pipeline.bloomKernel = 64;
    pipeline.samples = 4; // アンチエイリアスで境界を綺麗に

    return scene;
};

// ######################################################################
// cluade

// 新海誠監督の作品の特徴的な要素（美しい空、光の表現、雲、大気感、色彩豊かな環境）を取り入れて、3回のレビュー・修正を経たコードを作成します。
// - レビュー1: 基本的な雰囲気作り
//   - 空のグラデーション追加
//   - 照明の調整
//   - 基本的な色調整
// - レビュー2: 光の表現強化
//   - レンズフレア追加
//   - 環境テクスチャ
//   - より繊細な色彩
// - レビュー3: 最終調整
//   - 雲の追加
//   - パーティクル効果（光の粒子）
//   - ポストプロセス効果
//
// 主な新海誠風の特徴
// 1. 色彩: 鮮やかな空のグラデーション（青から夕焼けのオレンジへ）
// 2. 光の表現: ブルーム効果、レンズフレア、光の粒子
// 3. 質感: PBRマテリアルによる写実的でありながら美しい表現
// 4. 大気感: パーティクルシステムによる空気中の光の粒子
// 5. ポストプロセス: コントラストと露出調整で映画的な仕上がり
// このコードは新海誠作品の「君の名は。」や「天気の子」で見られるような、美しい空と光の表現を再現しています。

export const createScene_claude = function () {
// export const createScene = function () {
    // シーン作成
    var scene = new BABYLON.Scene(engine);
    
    // 新海誠風の空の色（夕暮れ時のグラデーション）
    scene.clearColor = new BABYLON.Color4(0.4, 0.6, 0.9, 1.0);

    // カメラ設定 - より映画的な配置
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 3, -15), scene);
    camera.setTarget(new BABYLON.Vector3(0, 1, 0));
    camera.attachControl(canvas, true);
    
    // 被写界深度効果のためのパイプライン
    var pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, [camera]);
    pipeline.fxaaEnabled = true;
    
    // ブルーム効果（光の溢れ）
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.8;
    pipeline.bloomWeight = 0.3;
    pipeline.bloomKernel = 64;
    
    // 色調整 - 新海誠風の鮮やかさ
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.contrast = 1.2;
    pipeline.imageProcessing.exposure = 1.1;
    pipeline.imageProcessing.toneMappingEnabled = true;
    
    // メインライト（太陽光）- 黄金色の夕日
    var sunLight = new BABYLON.DirectionalLight("sunLight", 
        new BABYLON.Vector3(-1, -2, 1), scene);
    sunLight.intensity = 1.5;
    sunLight.diffuse = new BABYLON.Color3(1.0, 0.9, 0.7);
    sunLight.specular = new BABYLON.Color3(1.0, 0.8, 0.6);
    
    // アンビエントライト（空からの柔らかい光）
    var skyLight = new BABYLON.HemisphericLight("skyLight", 
        new BABYLON.Vector3(0, 1, 0), scene);
    skyLight.intensity = 0.6;
    skyLight.diffuse = new BABYLON.Color3(0.6, 0.7, 1.0);
    skyLight.groundColor = new BABYLON.Color3(0.4, 0.3, 0.2);
    
    // 球体 - ガラスのような質感
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", 
        {diameter: 2, segments: 64}, scene);
    sphere.position.y = 1;
    
    var sphereMaterial = new BABYLON.PBRMaterial("sphereMat", scene);
    sphereMaterial.albedoColor = new BABYLON.Color3(0.9, 0.95, 1.0);
    sphereMaterial.metallic = 0.1;
    sphereMaterial.roughness = 0.2;
    sphereMaterial.alpha = 0.85;
    sphereMaterial.reflectionTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData(
        "https://playground.babylonjs.com/textures/environment.dds", scene);
    sphereMaterial.environmentIntensity = 1.5;
    sphere.material = sphereMaterial;
    
    // 地面 - 新海誠風の質感
    var ground = BABYLON.MeshBuilder.CreateGround("ground", 
        {width: 50, height: 50, subdivisions: 32}, scene);
    
    var groundMaterial = new BABYLON.PBRMaterial("groundMat", scene);
    groundMaterial.albedoColor = new BABYLON.Color3(0.5, 0.6, 0.4);
    groundMaterial.metallic = 0.0;
    groundMaterial.roughness = 0.8;
    groundMaterial.environmentIntensity = 0.5;
    ground.material = groundMaterial;
    
    // 空のドーム（新海誠の特徴的な空）
    var skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", 
        {diameter: 1000.0, segments: 32}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMat", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    
    // グラデーション空のシェーダー
    skyboxMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    
    // 簡易的な空のグラデーション
    var skyGradient = new BABYLON.GradientMaterial("skyGradient", scene);
    skyGradient.topColor = new BABYLON.Color3(0.3, 0.5, 0.9); // 上部：青空
    skyGradient.bottomColor = new BABYLON.Color3(1.0, 0.7, 0.5); // 下部：夕焼け
    skyGradient.offset = 0.5;
    skyGradient.smoothness = 1.5;
    skyGradient.backFaceCulling = false;
    skybox.material = skyGradient;
    
    // 雲のパーティクルシステム（光の粒子）
    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture(
        fpathFlare, scene);
    
    particleSystem.emitter = new BABYLON.Vector3(0, 10, 0);
    particleSystem.minEmitBox = new BABYLON.Vector3(-20, 0, -20);
    particleSystem.maxEmitBox = new BABYLON.Vector3(20, 5, 20);
    
    particleSystem.color1 = new BABYLON.Color4(1.0, 0.9, 0.7, 0.3);
    particleSystem.color2 = new BABYLON.Color4(1.0, 0.8, 0.6, 0.2);
    particleSystem.colorDead = new BABYLON.Color4(0.8, 0.7, 0.5, 0.0);
    
    particleSystem.minSize = 0.3;
    particleSystem.maxSize = 1.0;
    particleSystem.minLifeTime = 5;
    particleSystem.maxLifeTime = 10;
    particleSystem.emitRate = 100;
    
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-1, 0.5, 0);
    particleSystem.direction2 = new BABYLON.Vector3(1, 0.5, 0);
    particleSystem.minEmitPower = 0.2;
    particleSystem.maxEmitPower = 0.5;
    particleSystem.updateSpeed = 0.01;
    
    particleSystem.start();
    
    // レンズフレア（太陽の光）
    var lensFlareSystem = new BABYLON.LensFlareSystem("lensFlareSystem", sunLight, scene);
    var flare1 = new BABYLON.LensFlare(0.4, 0, new BABYLON.Color3(1, 0.9, 0.7), 
                                       fpathFlare, lensFlareSystem);
    var flare2 = new BABYLON.LensFlare(0.3, 0.2, new BABYLON.Color3(1, 0.8, 0.6), 
                                       fpathFlare, lensFlareSystem);
    var flare3 = new BABYLON.LensFlare(0.2, 0.4, new BABYLON.Color3(0.8, 0.7, 1.0), 
                                       fpathFlare, lensFlareSystem);
    
    // アニメーション - ゆっくりとした光の変化
    var alpha = 0;
    scene.registerBeforeRender(function () {
        alpha += 0.01;
        sunLight.intensity = 1.5 + Math.sin(alpha) * 0.3;
        skyLight.intensity = 0.6 + Math.sin(alpha * 0.5) * 0.2;
    });

    return scene;
};


export const  createScene = createScene_chatGPT;
// export const  createScene = createScene_gemini;
// export const createScene = createScene_claude;

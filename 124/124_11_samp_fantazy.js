// Babylon.js：サンプルを 幻想的「月」 にしてみる

// const fpathMoon = "textures/Moon_texture.jpg";
// const fpathWater = "textures/waterbump.png";
// const fpathParticle = "textures/particle.png";
// const fpathFlare = "textures/flare.png";

const fpathMoon = "../081/textures/Moon_texture.jpg";
const fpathWater = "../068/textures/waterbump.png";
const fpathParticle = "textures/particle.png";
const fpathFlare = "../068/textures/flare.png";

// const fpathMoon = "https://raw.githubusercontent.com/fnamuoo/webgl/main/081/textures/Moon_texture.jpg";
// const fpathWater = "textures/waterbump.png";
// const fpathParticle = "textures/particle.png";
// const fpathFlare = "textures/flare.png";

export const createScene = function () {
    var scene = new BABYLON.Scene(engine);

    let pCam = new BABYLON.Vector3(0, 0.3, -4);
    var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, pCam, scene);
    camera.setTarget(new BABYLON.Vector3(0, 1, 0));
    camera.attachControl(canvas, false);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    let mesh = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
    mesh.position.y = 1.1;
    mesh.material = new BABYLON.StandardMaterial("mat", scene);
    mesh.material.diffuseTexture = new BABYLON.Texture(fpathMoon, scene);
    mesh.material.specularColor = new BABYLON.Color4(0, 0, 0);
    mesh.material.emissiveColor = BABYLON.Color3.White();

    
    // Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 1000}, scene);
    const cubeTexture = new BABYLON.CubeTexture(
        "https://rawcdn.githack.com/mrdoob/three.js/d8b547a7c1535e9ff044d196b72043f5998091ee/examples/textures/cube/MilkyWay/",
        scene,
        ["dark-s_px.jpg", "dark-s_py.jpg", "dark-s_pz.jpg", "dark-s_nx.jpg", "dark-s_ny.jpg", "dark-s_nz.jpg"]
    );
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = cubeTexture;
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    const sizeW = 200;
    var meshGround = BABYLON.MeshBuilder.CreateGround("ground", {width: sizeW, height: sizeW}, scene);
    {
        // 水面用メッシュの処理
        const waterMaterial = new BABYLON.WaterMaterial("water", scene);
        waterMaterial.bumpTexture = new BABYLON.Texture(fpathWater, scene);
        waterMaterial.waterColor = new BABYLON.Color3(0.3, 0.5, 0.9);
        //waterMaterial.waterColor = new BABYLON.Color3(0.13, 0.47, 0.71);
        waterMaterial.waterColorLevel = 0.2;
        waterMaterial.fresnelLevel = 1.0;
        waterMaterial.reflectionLevel = 0.6;
        waterMaterial.refractionLevel = 0.8;
        waterMaterial.waveLength = 0.1/10;
        waterMaterial.waveHeight = 0.15/10;
        waterMaterial.waterDirection = new BABYLON.Vector2(0, 1);
        waterMaterial.addToRenderList(skybox);
        
        // 環境反射の設定
        waterMaterial.addToRenderList(skybox);
        waterMaterial.addToRenderList(mesh);

        // 新しい水面に適用
        meshGround.material = waterMaterial;
    }

    // 上昇する光の粒子
    var particleSystem = new BABYLON.ParticleSystem("particles", 1000, scene);
    particleSystem.particleTexture = new BABYLON.Texture(fpathParticle, scene);
    particleSystem.emitter = new BABYLON.Vector3(0, 0, 0);
    particleSystem.minEmitBox = new BABYLON.Vector3(-10, 0, -10);
    particleSystem.maxEmitBox = new BABYLON.Vector3(10, 0, 10);
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.9, 0.6, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0.5, 0.5, 1.0, 0.0);
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.15;
    particleSystem.minLifeTime = 4;
    particleSystem.maxLifeTime = 8;
    particleSystem.emitRate = 200;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    particleSystem.gravity = new BABYLON.Vector3(0, 0.1, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-0.2, 0.05, -0.2);
    particleSystem.direction2 = new BABYLON.Vector3(0.2, 0.1, 0.2);
    particleSystem.minAngularSpeed = -Math.PI*2;
    particleSystem.maxAngularSpeed = Math.PI*2;
    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 1;
    particleSystem.updateSpeed = 0.01;
    particleSystem.start();

    // アニメーションのための更新
    scene.onBeforeRenderObservable.add(() => {
        // mesh.rotation.y += 0.001;
        // scene.activeCamera.alpha += -0.001;
        // mesh.rotation.y += 0.0013 * scene.getAnimationRatio();
        mesh.rotation.y += 0.0008 * scene.getAnimationRatio();

        // useAutoRotationBehaviorで同じ動きなので、こちらは割愛
        // scene.activeCamera.alpha += -0.001 * scene.getAnimationRatio();
    });
    camera.useAutoRotationBehavior = true; // 自動でゆっくり回転

    return scene;
};

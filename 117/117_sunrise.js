// ご来光／ダイヤモンド富士
// .. 月を反対側に配置

// キー操作
// (space/enter) .. 太陽／カメラの位置を切り替え（４段階）

const R180 = Math.PI;

// const fpathMoon = "textures/Moon_texture.jpg";
// const fpathMtFUJI = "./3d/mtFUJI/dem.obj";
// const fpathSUN = 'textures/sun.png';

const fpathMoon = "../081/textures/Moon_texture.jpg";
const fpathMtFUJI = "../089/mtFUJI/dem.obj";
const fpathSUN = 'textures/sun.png';

// const fpathMoon = "https://raw.githubusercontent.com/fnamuoo/webgl/main//081/textures/Moon_texture.jpg";
// const fpathMtFUJI = "https://raw.githubusercontent.com/fnamuoo/webgl/main/089/mtFUJI/dem.obj";
// const fpathSUN = 'textures/sun.png';

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    // 地形全体を照らす光源
    var light2 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 100, 0), scene);
    light2.intensity = 0.6;

    const light = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(0, -0.5, 1).normalize(), scene);
    light.intensity = Math.PI;

    {
        // 富士山のメッシュを読み込む
        let files = [
            fpathMtFUJI,
        ];
        for (let file of files) {
            BABYLON.ImportMeshAsync(file, scene).then((result) => {
                let meshGeo = result.meshes[0];
                let s = 2, adjx=-50, adjz=-50;;
                meshGeo.scaling = new BABYLON.Vector3(s, s, s);
                meshGeo.position = new BABYLON.Vector3(100*s+adjx, -4.1*s, 100*s+adjz);
                meshGeo.rotation = new BABYLON.Vector3(0, R180, 0);
            })
        }
    }
    let meshMoon;
    {
        // 月を配置
        let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:100});
        mesh.position.set(-1900, 30, 0);
        mesh.material = new BABYLON.StandardMaterial("mat", scene);
        mesh.material.diffuseTexture = new BABYLON.Texture(fpathMoon, scene);
        mesh.material.specularColor = new BABYLON.Color4(0, 0, 0);
        meshMoon = mesh;
    }


    // 各座標（太陽、視点、カメラ）
    let pSun = new BABYLON.Vector3(1900, 30, 0);
    let pTrg = new BABYLON.Vector3(0, 10, 0);
    let pCam = new BABYLON.Vector3(-50, 15, -10);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, pCam, scene);
    camera.setTarget(pTrg);
    camera.attachControl(canvas, false);

    var godrays = new BABYLON.VolumetricLightScatteringPostProcess(
        'godrays', 1.0, camera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);
    godrays.mesh.material.diffuseTexture = new BABYLON.Texture(fpathSUN, scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
    godrays.mesh.material.diffuseTexture.hasAlpha = true;
    godrays.mesh.position = pSun;
    let vscale = 100;
    godrays.mesh.scaling = new BABYLON.Vector3(vscale, vscale, vscale);
    light.position = godrays.mesh.position;

    if (1) {
        // 大気散乱の設定
        const defaultRenderingPipeline = new BABYLON.DefaultRenderingPipeline("Default");
        defaultRenderingPipeline.imageProcessingEnabled = true;
        defaultRenderingPipeline.imageProcessing.ditheringEnabled = true;
        defaultRenderingPipeline.imageProcessing.toneMappingEnabled = true;
        defaultRenderingPipeline.imageProcessing.toneMappingType = 1; // ACES
        defaultRenderingPipeline.imageProcessing.exposure = 1.5;
        const atmosphere = new ADDONS.Atmosphere("Atmosphere", scene, [ light ]);
        atmosphere.additionalDiffuseIlluminanceIntensity = 0.01;
        atmosphere.minimumMultiScatteringIntensity = 0.1;
        atmosphere.isLinearSpaceComposition = true;
        atmosphere.isLinearSpaceLight = true;
        atmosphere.isAerialPerspectiveLutEnabled = false;
        atmosphere.isSkyViewLutEnabled = false;
    }

    // ------------------------------

    let istage = 0, nstage = 4;
    // val=[光源：太陽の位置、
    //      カメラの焦点位置、
    //      カメラの位置]
    const i2para = {0:[new BABYLON.Vector3(1900, 30, 0), // 日の出
                       new BABYLON.Vector3(0, 20, 0),
                       new BABYLON.Vector3(-10, 20, 0)],

                    1:[new BABYLON.Vector3(1900, 200, 0),
                       new BABYLON.Vector3(0, 10, 0),
                       new BABYLON.Vector3(-50, 15, 0)],

                    2:[new BABYLON.Vector3(1900, 300, 0),  // 日の出から１時間後位？
                       new BABYLON.Vector3(0, 20, 0),
                       new BABYLON.Vector3(-50, 12, 0)],

                    3:[new BABYLON.Vector3(1900, 600, 0),
                       new BABYLON.Vector3(0, 20, 0),
                       new BABYLON.Vector3(-50, 6, 0)],
                   };

    // シーン／ステージ切り替え
    var setStage = function(istage_) {
        [pSun, pTrg, pCam] = i2para[istage_];

        // 大気散乱の色変化のために light.direction を設定
        light.direction = pSun.negate().normalize();
        // 太陽の座標を反映
        godrays.mesh.position = pSun;
        light.position = godrays.mesh.position;
        // ターゲットの座標を反映
        camera.setTarget(pTrg);
        // カメラの座標を反映
        camera.position = pCam;
        // 南北を面対象として月を配置
        meshMoon.position.set(-pSun.x, Math.max(pSun.y, 50), pSun.z);
    }

    // キー入力処理
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ') {
                istage = (istage+1) % nstage;
                setStage(istage);

            } else if (kbInfo.event.key == 'Enter') {
                istage = (istage+nstage-1) % nstage;
                setStage(istage);
            }
            console.log("istage=",istage);
        }
    });

    // ------------------------------

    setStage(istage);

    return scene;
};

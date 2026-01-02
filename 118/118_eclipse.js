// eclipse

// Volumetric Light Scattering Post Process
// https://doc.babylonjs.com/features/featuresDeepDive/lights/volumetricLightScattering/

// Basic Example
// https://playground.babylonjs.com/?inspectorv2=true#AU5641

// const fpathSun = 'textures/sun.png';
// const fpathMoon = "textures/Moon_texture.jpg";
// const fpathFlare3 = "textures/flare3.png";

const fpathSun = '../117/textures/sun.png';
const fpathMoon = "../081/textures/Moon_texture.jpg";
const fpathFlare3 = "../068/textures/flare3.png";

// const fpathSun = 'textures/sun.png';
// const fpathMoon = "https://raw.githubusercontent.com/fnamuoo/webgl/main/081/textures/Moon_texture.jpg";
// const fpathFlare3 = "textures/flare3.png";

let METHOD1 = false;
let METHOD1_LIMIT = false;
let METHOD2 = false;
let METHOD2_LIMIT = false;
let DECORATE = false;

// ver. 1.0
// ver. 2.0
// METHOD1 = true;
// ver. 2.1
// METHOD1 = true; METHOD1_LIMIT = true;
// ver. 3.0
// METHOD2 = true;
// ver. 3.1
// METHOD2 = true; METHOD2_LIMIT = true;
// ver. fin
METHOD2 = true; METHOD2_LIMIT = true; DECORATE = true;

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(20, 20, 100), scene);

    if (DECORATE) {
	var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:2000.0}, scene);
	var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling = false;
        var files = [
            "textures/Space/space_left.jpg",
            "textures/Space/space_up.jpg",
            "textures/Space/space_front.jpg",
            "textures/Space/space_right.jpg",
            "textures/Space/space_down.jpg",
            "textures/Space/space_back.jpg",
        ];
	skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture.CreateFromImages(files, scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	skyboxMaterial.disableLighting = true;
	skybox.material = skyboxMaterial;	
    }

    var camera = new BABYLON.ArcRotateCamera("Camera", -0.5, 2.2, 100, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);

    let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:64});
    if (DECORATE) {
        mesh.material = new BABYLON.StandardMaterial("mat", scene);
        mesh.material.diffuseTexture = new BABYLON.Texture(fpathMoon, scene);
        mesh.material.specularColor = new BABYLON.Color4(0, 0, 0);
    }

    var godrays = new BABYLON.VolumetricLightScatteringPostProcess(
        'godrays', 1.0, camera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);

    godrays.mesh.material.diffuseTexture = new BABYLON.Texture(fpathSun, scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
    godrays.mesh.material.diffuseTexture.hasAlpha = true;
    godrays.mesh.position = new BABYLON.Vector3(-150, 150, 150);
    godrays.mesh.scaling = new BABYLON.Vector3(350, 350, 350);
    light.position = godrays.mesh.position;

    // ------------------------------------------------------------
    // 光源を追加してダイアモンドリングを再現する場合
    if (METHOD1) {
        var light2 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(20, 20, 100), scene);
        var godrays2 = new BABYLON.VolumetricLightScatteringPostProcess(
            'godrays2', 1.0, camera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);

        godrays2.mesh.material.diffuseTexture = new BABYLON.Texture(fpathSun, scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
        godrays2.mesh.material.diffuseTexture.hasAlpha = true;
        // const plight2 = new BABYLON.Vector3(-50, 145, 150); // xx 影ができる（もっと奥に配置する必要あり
        const plight2 = new BABYLON.Vector3(-110, 145, 300); // リングっぽいけど、余計な光源として残る
        // const plight2 = new BABYLON.Vector3(-125, 145, 300); // 少し残る
        // const plight2 = new BABYLON.Vector3(-130, 145, 300); // 残らないけど効果が弱い
        godrays2.mesh.position.copyFrom(plight2);
        godrays2.mesh.scaling = new BABYLON.Vector3(35, 35, 35);
        light2.position = godrays2.mesh.position;

        // カメラの距離および角度（光源->月、光源->カメラ）を確認して、範囲内なら光源（２）を有効にする
        let vecML = mesh.position.subtract(light.position).normalize();
        let vecCL, rad, len;
        const radMin = 0.999880;
        const radMax = 0.999950;
        const lenMin =  9000;
        const lenMax = 12000;
        let vecML2 = mesh.position.subtract(plight2).normalize();
        let vecCL2, rad2;
        const radMin2 = 0.992;
        const radMax2 = 1;
        if (METHOD1_LIMIT) {
            scene.registerAfterRender(function() {
                len = camera.position.lengthSquared();
                if (lenMin < len && len < lenMax) {
                    vecCL = camera.position.subtract(light.position).normalize();
                    rad = vecML.dot(vecCL);
                    vecCL2 = camera.position.subtract(plight2).normalize();
                    rad2 = vecML2.dot(vecCL2);
                    if ((radMin < rad  && rad <= radMax) && (radMin2 < rad2  && rad2 <= radMax2)) {
                        // 光源２を有効にする
                        godrays2.mesh.setEnabled(true);
                    } else {
                        // 無効にする
                        godrays2.mesh.setEnabled(false);
                    }
                } else {
                    // 無効にする
                    godrays2.mesh.setEnabled(false);
                }
            });
        }
    }

    // ------------------------------------------------------------
    // レンズフレア効果でダイアモンドリングを再現する場合
    if (METHOD2) {
        // レンズフレア効果
        // https://scrapbox.io/babylonjs/%E3%83%AC%E3%83%B3%E3%82%BA%E3%83%95%E3%83%AC%E3%82%A2%E5%8A%B9%E6%9E%9C
        let lensFlareSystem = new BABYLON.LensFlareSystem("lensFlareSystem", light, scene);
        let flare01 = new BABYLON.LensFlare(0.8, 13, new BABYLON.Color3(1, 1, 1), fpathFlare3, lensFlareSystem);
        flare01.size = 0.8;
        // flare01.size = 0; // 隠す/無効のため 0 にする

        // カメラの距離および角度（光源->月、光源->カメラ）を確認して、範囲内ならレンズフレアを有効にする
        let vecML = mesh.position.subtract(light.position).normalize();
        let vecCL, rad, len;
        const radMin = 0.999880;
        const radMax = 0.999950;
        const lenMin =  9000;
        const lenMax = 12000;
        if (METHOD2_LIMIT) {
            scene.registerAfterRender(function() {
                len = camera.position.lengthSquared();
                if (lenMin < len && len < lenMax) {
                    vecCL = camera.position.subtract(light.position).normalize();
                    rad = vecML.dot(vecCL);
                    // console.log("rad=", Math.floor(rad*1000000)/1000000);
                    if (radMin < rad  && rad <= radMax) {
                        // レンズフレア効果を有効に
                        flare01.size = 0.8;
                    } else {
                        // レンズフレア効果を無効に
                        flare01.size = 0;
                    }
                } else {
                    // レンズフレア効果を無効に
                    flare01.size = 0;
                }
            });
        }
    }

    return scene;
}

export default createScene


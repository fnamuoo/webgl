// 富士山の一日

//let skyboxTextPath = "textures/TropicalSunnyDay";
//let skyboxTextPath = "../069/textures/TropicalSunnyDay";
let skyboxTextPath = "textures/TropicalSunnyDay";

const R180 = Math.PI;
const R360 = Math.PI*2;

var createScene = async function () {
    await BABYLON.InitializeCSG2Async();

    // --------------------------------------------------

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 10, -100), scene);
    camera.setTarget(new BABYLON.Vector3(0, 30, 0));
    camera.attachControl(canvas, true);

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);


    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // --------------------------------------------------
    if (1) {
        let files = [
            //"./mtFUJI/dem.obj",
            "https://raw.githubusercontent.com/fnamuoo/webgl/main/089/mtFUJI/dem.obj",
        ];
        for (let file of files) {
            BABYLON.ImportMeshAsync(file, scene).then((result) => {
                let meshGeo = result.meshes[0];
                let s = 2, adjx=-50, adjz=-50;;
                meshGeo.scaling = new BABYLON.Vector3(s, s, s);
                meshGeo.position = new BABYLON.Vector3(100*s+adjx, -4.1*s, 100*s+adjz);
                meshGeo.rotation = new BABYLON.Vector3(0, R180, 0);
                let aggGeo = new BABYLON.PhysicsAggregate(meshGeo, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
            })
        }
    }

    // --------------------------------------------------

    let meshAggInfo = []; // mesh, agg;

    // --------------------------------------------------

    let grndMesh = BABYLON.MeshBuilder.CreateGround("ground", {width:200, height:200}, scene);
    grndMesh.material = new BABYLON.GridMaterial("", scene);
    grndMesh.material.majorUnitFrequency = 10;
    grndMesh.material.minorUnitVisibility  = 0.7;
    // 地面に摩擦係数、反射係数を設定する
    let grndAgg = new BABYLON.PhysicsAggregate(grndMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);
    meshAggInfo.push([grndMesh,grndAgg]);

    // --------------------------------------------------

    let skybox = null;
    if (1) {
    // Skybox
    skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:4000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    }


    // ここから引用
    // https://scrapbox.io/babylonjs/%E5%9C%B0%E7%90%83%E3%82%92%E5%9B%9E%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B
    let skybox2 = null;
    if (1) {
    skybox2 = BABYLON.Mesh.CreateBox("skyBox", 2000, scene);
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
    skybox2.material = skyboxMaterial;
    }

    // --------------------------------------------------
    // 
    // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/usePostProcesses/#imageprocessing
    // https://playground.babylonjs.com/#17VHYI#15
    // 朝焼け、夕焼けの演出（事前準備
    var colorGrading = new BABYLON.ColorGradingTexture("./textures/LateSunset.3dl", scene);
    skybox.material.cameraColorGradingTexture = colorGrading;
    skybox.material.cameraColorGradingEnabled = true;
    

    // // let rotSkybox=0.0003, t=0, tstep=0.001, alpha, cgrad;
    // let rotSkybox=0.0005, t=0, tstep=0.001, alpha, cgrad;
    let rotSkybox=0.005, t=0, tstep=0.01, alpha, cgrad;
    scene.registerAfterRender(function() {
        // 夜空のskyboxを透明度を変化させる（skyboxを切り替える効果
        t += tstep;
        if (t >= 24) { t = t-24; }
        alpha = Math.sin(t/24*R360)**2;
        skybox2.material.alpha = alpha;

        // 夜空のskyboxの回転
        skybox2.rotate(BABYLON.Vector3.Forward(), rotSkybox, BABYLON.Space.WORLD);

        // 夜にかけて、照明を落とす
        light.intensity = 0.1 + 0.6*(1-alpha);

        // 朝焼け、夕焼けの演出
        cgrad = Math.abs(Math.sin(t/24*R360*2))**2;
	colorGrading.level = cgrad; 
    });

    return scene;
}



// ミニチュアな渋谷
//
// L .. レンズ効果を切り替え

// const skybox_path= "textures/TropicalSunnyDay";
// const skybox_path= "../069/textures/TropicalSunnyDay";
const skybox_path= "textures/TropicalSunnyDay";

//let citymodelPath = "../082/";
let citymodelPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/082/";


var createScene = async function () {

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(-190, 160, 80), scene);
    camera.setTarget(new BABYLON.Vector3(-70, 15, -20));
    camera.attachControl(canvas, true);

    var lensEffect = new BABYLON.LensRenderingPipeline('lens', {
	edge_blur: 1.0,
	chromatic_aberration: 1.0,
	distortion: 1.0,
	dof_focus_distance: 210, // 22-30-50,
	dof_aperture: 100, // 1-10-100 レンズ開口：小：焦点範囲が広く、大きい：焦点範囲が狭く
	grain_amount: 0.1,
	dof_pentagon: true,
	dof_gain: 1.0,
	dof_threshold: 1.0,
	dof_darken: 0.00, // 0.25
    }, scene, 1.0, camera);

    let ilens = 0;
    let lensPara = [[210, 100, "normal"],
                    [160, 100, "focus-dist=160"],
                    [260, 100, "focus-dist=260"],
                    [210, 5  , "aperture=5"],
                    [210, 500, "aperture=1000"],
                   ];
    let nlens = lensPara.length;


    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, 100), scene);
    light.intensity = 0.2;
    var light2 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, -100), scene);
    light2.intensity = 0.2;
    var light3 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, 100), scene);
    light3.intensity = 0.2;
    var light4 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, -100), scene);
    light4.intensity = 0.2;




    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);



    // 渋谷駅周辺
    {
        // 17MB
        let files = [citymodelPath+"shibuyaV2c/533935_dem_6697_op/533935_dem_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393585_bldg_6697_op/53393585_bldg_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393585_tran_6697_op/53393585_tran_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393586_bldg_6697_op/53393586_bldg_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393586_tran_6697_op/53393586_tran_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393595_bldg_6697_op/53393595_bldg_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393595_tran_6697_op/53393595_tran_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393596_bldg_6697_op/53393596_bldg_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393596_tran_6697_op/53393596_tran_6697_op.glb",
                    ];
        for (let file of files) {
            BABYLON.ImportMeshAsync(file, scene).then((result) => {
                for (let mesh of result.meshes) {
                    try {  // 必ず、0 番目が下記エラーで失敗するっぽい
                    let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);

                            let mat = new BABYLON.StandardMaterial('mat', scene);
                            mat.diffuseColor = BABYLON.Color3.Random();
                            mesh.material = mat;

                    } catch(e) {
                    // console.log("  failed ... ",[i,n]);
                    }
                }
            })
        }
    }

    // 地面を設定する
    const grndMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);
    grndMesh.position.y = 14.5;
    grndMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    grndMesh.material.majorUnitFrequency = 10;
    grndMesh.material.minorUnitVisibility  = 0.5;
    // 地面に摩擦係数、反射係数を設定する
    var grndAgg = new BABYLON.PhysicsAggregate(grndMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);

    if (1) {
    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skybox_path, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    }

    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key === ' ' || kbInfo.event.key === 'l') {
                ilens = (ilens + 1) %nlens;
                let [fdis, aper, msg] = lensPara[ilens];
                console.log( [fdis, aper, msg]);
                lensEffect.dofDistortion = fdis;
                lensEffect.dofAperture = aper;
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            break;
        }
    });

    return scene;
};

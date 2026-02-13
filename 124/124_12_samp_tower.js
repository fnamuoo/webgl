// sample - night-pool


// const fpathFloor = "textures/floor.png";
// const fpathGlass = "textures/glassbuilding.jpg";
// const fpathCloud = "textures/cloud.png";
// const skyboxTextPath5 = "textures/TropicalSunnyDay";
// const glb_url = "./assets/";
// const glb_fname4 = "yellowEnergyBall.glb";

// --------------------

const fpathFloor = "../081/textures/floor.png";
const fpathGlass = "textures/glassbuilding.jpg";
const fpathCloud = "../088/textures/cloud.png";
const skyboxTextPath5 = "../111/textures/TropicalSunnyDay";
const glb_url = "../103/assets/";
const glb_fname4 = "yellowEnergyBall.glb";

// --------------------

// const fpathFloor = "https://raw.githubusercontent.com/fnamuoo/webgl/main/081/textures/floor.png";
// const fpathGlass = "https://raw.githubusercontent.com/fnamuoo/webgl/main//124/textures/glassbuilding.jpg";
// const fpathCloud = "https://raw.githubusercontent.com/fnamuoo/webgl/main//088/textures/cloud.png";
// const skyboxTextPath5 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/111/textures/TropicalSunnyDay";
// const glb_url = "https://raw.githubusercontent.com/fnamuoo/webgl/main/103/assets/";
// const glb_fname4 = "yellowEnergyBall.glb";

const skyboxTextPathList = [skyboxTextPath5];
let skyboxType=0; // -1:rand, 0-2: 固定

// ######################################################################

export const createScene = async function () {
    var scene = new BABYLON.Scene(engine);

    // // var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), scene);
    // // camera.setTarget(BABYLON.Vector3.Zero());
    // // camera.attachControl(canvas, true);
    let camera = null, myMesh=null;
    let icamera = 0;
    let icameralist = [0];
    var changeCamera = function(icamera) {
console.log("icamera=",icamera)
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 1, -4), scene);
            // if (myMesh != null) {
            //     camera.setTarget(myMesh.position);
            // } else {
            //     camera.setTarget(BABYLON.Vector3.Zero());
            // }
            camera.setTarget(new BABYLON.Vector3(0, 1, 0));
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる

            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;

        }
    }
changeCamera(icamera);

    // var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    // light.intensity = 0.7;
    var light1 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(2, 10, -2), scene);
    light1.intensity = 0.7;
    var light2 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-2, 10, 2), scene);
    light2.intensity = 0.3;

    let mesh1 = null, mesh2 = null, mesh3 = null, mesh4 = null;

    let loadMeshGLB_cntTask = async function(scene) {
        let assetsManager = new BABYLON.AssetsManager(scene);

        // let meshAssetTask1 = assetsManager.addMeshTask("task1","", glb_url, glb_fname1)
        // let meshAssetTask2 = assetsManager.addMeshTask("task2","", glb_url, glb_fname2)
        // let meshAssetTask3 = assetsManager.addMeshTask("task3","", glb_url, glb_fname3)
        let meshAssetTask4 = assetsManager.addMeshTask("task4","", glb_url, glb_fname4)

        // meshAssetTask1.onSuccess = function (task) {
        //     let meshlist = task.loadedMeshes;
        //     // 位置とサイズを変更して隠しておく
        //     mesh1 = meshlist[0];
        //     mesh1.position.set(-3, 0, 0);
        //     let scale=0.1;
        //     mesh1.scaling = new BABYLON.Vector3(scale, scale, scale);
        // }
        // meshAssetTask2.onSuccess = function (task) {
        //     let meshlist = task.loadedMeshes;
        //     mesh2 = meshlist[0];
        //     mesh2.position.set(0, 1, 0);
        //     let scale=0.02;
        //     mesh2.scaling = new BABYLON.Vector3(scale, scale, scale);
        // }
        // meshAssetTask3.onSuccess = function (task) {
        //     let meshlist = task.loadedMeshes;
        //     mesh3 = meshlist[0];
        //     mesh3.position.set(0, 1, 0);
        //     let scale=0.02;
        //     mesh3.scaling = new BABYLON.Vector3(scale, scale, scale);
        // }
        meshAssetTask4.onSuccess = function (task) {
            let meshlist = task.loadedMeshes;
            mesh4 = meshlist[0];
            mesh4.position.set(0, 5, 0);
            let scale=0.03;
            mesh4.scaling = new BABYLON.Vector3(scale, scale, scale);
        }

        // === エラー処理 ===
        assetsManager.onTaskError = function (task) {
            console.error("タスクの読み込みに失敗しました:", task.name);
        };
        // === 全てのロードが完了した時 ===
        assetsManager.onFinish = function (tasks) {
            console.log("すべてのアセットが読み込まれました！");
        };

        // === 読み込みスタート ===
        assetsManager.load();
        // return;
    }

    await loadMeshGLB_cntTask(scene);


    // Our built-in 'sphere' shape.
    let mesh0 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 3, segments: 32}, scene);
    {
        mesh0.position.set(0, 2, 0);
        mesh0.material = new BABYLON.StandardMaterial("mat");
        mesh0.material.diffuseTexture = new BABYLON.Texture(fpathGlass, scene);
	mesh0.material.diffuseTexture.uScale = 20;
	mesh0.material.diffuseTexture.vScale = 10;
        // mesh0.material.specularColor = new BABYLON.Color4(0, 0, 0);
        mesh0.material.emissiveColor = BABYLON.Color3.White();
    }
    for (let ilayer = 0; ilayer < 10; ++ilayer) {
        let meshSub = BABYLON.MeshBuilder.CreateCylinder("pyramid", {height:0.3, diameter: 4-ilayer*0.4}, scene);
        meshSub.position.y = 0.3*ilayer + 0;
        meshSub.parent = mesh0;
        meshSub.material = new BABYLON.StandardMaterial("mat");
        meshSub.material.diffuseTexture = new BABYLON.Texture(fpathFloor, scene);
	meshSub.material.diffuseTexture.uScale = 10-ilayer*0.19;
	meshSub.material.diffuseTexture.vScale = 1-ilayer*0.05;
        meshSub.material.specularColor = BABYLON.Color3.White();
        meshSub.material.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    }

    {
        let nb = new BABYLON.NoiseBlock();
        const nbvzero = new BABYLON.Vector3(0,0,0);
        // perlinの文様を変えずに meshサイズを変更するには nbscale*gridratio=一定とする
        // let gridratio = 1, nbscale = 0.02/gridratio;
        // let yratio = 10;
        let gridratio = 0.1, nbscale = 0.02/gridratio;
        let yratio = 2.5;
        function yposi(x,z) {
            return nb.noise(8, 0.5, new BABYLON.Vector3(x,z,0), nbvzero, nbscale)*yratio;
        }
        let rootPath = [];
        let size = 1000, size_ = size/2;
        let nmin = -size_, nmax = size_+1;
        for (let iz = nmin; iz < nmax; ++iz) {
            let z = iz*gridratio;
            let path = []
            for (let ix = nmin; ix < nmax; ++ix) {
                let x = ix*gridratio;
                let y = yposi(x,z)**2-0.5;
                path.push(new BABYLON.Vector3(x, y, z));
            }
            rootPath.push(path);
        }
        let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        // trgMesh.material = new BABYLON.NormalMaterial("mat", scene);
        // trgMesh.material.wireframe = true;
        trgMesh.position.y = -2;
        {
            // 複数のグラデーションのmaterialのためにこちらを参照
            // https://forum.babylonjs.com/t/generate-materials-with-color-gradients/6032/4
            // https://www.babylonjs-playground.com/#MCJYB5#12
            var nodeMaterial = new BABYLON.NodeMaterial(`node material`);
            var position = new BABYLON.InputBlock("position");
            position.setAsAttribute("position");
            var worldPos = new BABYLON.TransformBlock("worldPos");
            worldPos.complementZ = 0;
            worldPos.complementW = 1;
            position.output.connectTo(worldPos.vector);
            var world = new BABYLON.InputBlock("world");
            world.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);
            var Transform = new BABYLON.TransformBlock("Transform");
            Transform.complementZ = 0;
            Transform.complementW = 1;
            var normal = new BABYLON.InputBlock("normal");
            normal.setAsAttribute("normal");
            normal.output.connectTo(Transform.vector);
            world.output.connectTo(Transform.transform);
            var Lights = new BABYLON.LightBlock("Lights");
            worldPos.output.connectTo(Lights.worldPosition);
            Transform.output.connectTo(Lights.worldNormal);
            var cameraPosition = new BABYLON.InputBlock("cameraPosition");
            cameraPosition.setAsSystemValue(BABYLON.NodeMaterialSystemValues.CameraPosition);
            cameraPosition.output.connectTo(Lights.cameraPosition);
            var Multiply = new BABYLON.MultiplyBlock("Multiply");
            var Gradient = new BABYLON.GradientBlock("Gradient");
            Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.0, new BABYLON.Color3(0.15, 0.4, 0.8)));
            Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.1, new BABYLON.Color3(0.6, 0.5, 0.3)));
            Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.5, new BABYLON.Color3(0.4, 0.7, 0.3)));
            Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(1.0, new BABYLON.Color3(0.2, 0.5, 0.2)));
            Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(2.0, new BABYLON.Color3(0.4, 0.4, 0.3)));
            Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(2.9, new BABYLON.Color3(0.90, 0.90, 0.95)));
            // グラデーションはこちらを参考に
            // https://playground.babylonjs.com/?webgpu#Y2UGQ5#53
            var VectorSplitter = new BABYLON.VectorSplitterBlock("VectorSplitter");
            position.output.connectTo(VectorSplitter.xyzIn);
            // VectorSplitter.x.connectTo(Gradient.gradient);
            VectorSplitter.y.connectTo(Gradient.gradient);
            Gradient.output.connectTo(Multiply.left);
            Lights.diffuseOutput.connectTo(Multiply.right);
            var fragmentOutput = new BABYLON.FragmentOutputBlock("fragmentOutput");
            Multiply.output.connectTo(fragmentOutput.rgb);
            world.output.connectTo(worldPos.transform);
            var worldPosviewProjectionTransform = new BABYLON.TransformBlock("worldPos * viewProjectionTransform");
            worldPosviewProjectionTransform.complementZ = 0;
            worldPosviewProjectionTransform.complementW = 1;
            worldPos.output.connectTo(worldPosviewProjectionTransform.vector);
            var viewProjection = new BABYLON.InputBlock("viewProjection");
            viewProjection.setAsSystemValue(BABYLON.NodeMaterialSystemValues.ViewProjection);
            viewProjection.output.connectTo(worldPosviewProjectionTransform.transform);
            var vertexOutput = new BABYLON.VertexOutputBlock("vertexOutput");
            worldPosviewProjectionTransform.output.connectTo(vertexOutput.vector);
            nodeMaterial.addOutputNode(vertexOutput);
            nodeMaterial.addOutputNode(fragmentOutput);
            nodeMaterial.build();
            // matlist.push(nodeMaterial);
            trgMesh.material = nodeMaterial;
        }
    }

    if (1) {
        // 雲海をつくる
        let nCapa = 1000;
        let rng = 40;
        const spriteManagerTrees = new BABYLON.SpriteManager("sm", fpathCloud, nCapa, {width: 256, height: 256});
        let meshlist = [], x, y, z;
        for (let i = 0; i < nCapa; ++i) {
            let meshSub = new BABYLON.Sprite("", spriteManagerTrees);
            meshSub.width = BABYLON.Scalar.RandomRange(3, 4);
            meshSub.height = meshSub.width;
            x = BABYLON.Scalar.RandomRange(-rng, rng);
            y = BABYLON.Scalar.RandomRange(-0.5, 0.5);
            z = BABYLON.Scalar.RandomRange(-rng, rng);
            meshSub.position = new BABYLON.Vector3(x,y+meshSub.height/2,z);
            meshlist.push(meshSub);
        }
        scene.onBeforeRenderObservable.add(() => {
            for (let mesh of meshlist) {
                mesh.position.x += 0.01;
                if (mesh.position.x >= rng) {
                    mesh.position.x -= rng*2;
                }
                mesh.position.y += (Math.random()-0.5)/100;
            }
        });

    }

    let skybox = null;
    if (1) {
        // Skybox
        let skyboxTextPath;
        if (skyboxType < 0) {
            let i = Math.floor(skyboxTextPathList.length*Math.random());
            skyboxTextPath = skyboxTextPathList[i];
        } else {
            skyboxTextPath = skyboxTextPathList[skyboxType];
        }
        skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:4000.0}, scene);
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }


    // camera.useAutoRotationBehavior = true; // 自動でゆっくり回転
    // カメラをカスタマイズで周回、アップダウン、接近／後退させる
    {
        const cameraBamp = -Math.PI/6, cameraBmin = Math.PI/2;
        let cameraBrad = 0;
        const cameraRamp = 10, cameraRmin = 4;
        let cameraRrad = 0;
        const R360 = Math.PI*2;
        scene.onBeforeRenderObservable.add(() => {
            // 周囲を一定速度で回転
            camera.alpha += -0.001 * scene.getAnimationRatio();
            // 上下に振動
            camera.beta = cameraBmin+cameraBamp*(Math.sin(cameraBrad))**2;
            cameraBrad += 0.002;
            if (cameraBrad > R360) { cameraBrad -= R360;}
            // 半径を振動（接近したり離れたり）
            camera.radius = cameraRmin+cameraRamp*(Math.sin(cameraRrad))**2;
            cameraRrad += 0.001;
            if (cameraRrad > R360) { cameraRrad -= R360;}
        });
    }

    return scene;
};

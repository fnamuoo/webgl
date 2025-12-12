// Babylon.js で物理演算(havok)：raycastで浮かせたボードを作成する

//  - カーソル上/(w)              .. 前進
//  - カーソル下/(s)              .. 後進
//  - カーソル右左/(a,d)          .. 旋回
//  - Ctrl＋カーソル右左/(a,d)    .. 急旋回
//  - r                           .. スタート位置に移動
//  - space                       .. ブレーキ
//  - (c/C[=shift+c])             .. カメラ変更
//  - (m/M[=shift+m])             .. 移動体（ボード／車）変更


const R5 = Math.PI/36;
const R90 = Math.PI/2;
const R180 = Math.PI;
const R270 = Math.PI*3/2;
const R360 = Math.PI*2;


// const SCRIPT_URL2 = "./Vehicle_draft2.js";
// const myTextPath3 = "textures/pipo-charachip017a.png"; // メイド
// let coursePath="textures/course/BoxySVG_test1_3_400x300.png"

const SCRIPT_URL2 = "../105/Vehicle2.js";
const myTextPath3 = "../093/textures/pipo-charachip017a.png"; // メイド
let coursePath="../066/textures/BoxySVG_test1_3_400x300.png"

// const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/105/Vehicle2.js";
// const myTextPath3 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/093/textures/pipo-charachip017a.png";
// const coursePath = 'https://raw.githubusercontent.com/fnamuoo/webgl/main/066/textures/BoxySVG_test1_3_400x300.png';

let Vehicle2 = null;
await import(SCRIPT_URL2).then((obj) => { Vehicle2 = obj; });

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    // カメラ種類
   
    let camera = null, myMesh=null;
    let icamera = 6, ncamera = 8;
    let cameralist = [];
    var changeCamera = function(icamera) {
console.log("icamera=",icamera)
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            //   0: AcRotateCamera (撮影用/debug用)
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(5, 20,-10), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる

            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            camera.lockedTarget = myMesh;

        }
        if (icamera == 1) {
            // フローカメラを使ったバードビュー
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 180;
            camera.radius = 5; // 10;
            camera.heightOffset = 3;
            camera.cameraAcceleration = 0.05;
            camera.maxCameraSpeed = 30;
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (icamera == 2) {
            // フローカメラを使ったドライバーズビュー
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 180;
            camera.radius = 0.5;
            camera.heightOffset = 0.1;
            camera.cameraAcceleration = 0.2;
            camera.maxCameraSpeed = 30;
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (icamera == 3) {
            // 回転体用のカメラ
            // 対象(myMesh)とカメラの位置関係から、後方にカメラを配置(高さが絶対位置）
            camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (icamera == 4) {
            // 車体とカメラを固定（進行軸が同じ）して地形が変化（斜面でも地面にカメラが埋まらない）
            camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }

        if (icamera == 5) {
            // 上記４カメラを１画面で
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            {
                let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
                camera.rotationOffset = 180;
                camera.radius = 5;
                camera.heightOffset = 1;
                camera.cameraAcceleration = 0.05;
                camera.maxCameraSpeed = 30;
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
                camera.rotationOffset = 180;
                camera.radius = 0.5;
                camera.heightOffset = 0.1;
                camera.cameraAcceleration = 0.2;
                camera.maxCameraSpeed = 30;
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
                camera.setTarget(BABYLON.Vector3.Zero());
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
                camera.setTarget(BABYLON.Vector3.Zero());
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            //scene.activeCameras.pop();
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
                // camera.dispose();
                // camera=null;
            }

            cameralist[0].viewport = new BABYLON.Viewport(0.0, 0.5, 0.5, 0.5); // 左上
            cameralist[1].viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5); // 右上
            cameralist[2].viewport = new BABYLON.Viewport(0.0, 0.0, 0.5, 0.5); // 左下
            cameralist[3].viewport = new BABYLON.Viewport(0.5, 0.0, 0.5, 0.5); // 右下
        }

        if (icamera == 6) {
            // 車体とカメラを固定（進行軸が同じ）して地形が変化（斜面でも地面にカメラが埋まらない）
            // (4)の改造版、upVectorを設定した版
            camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.lockedTarget = myMesh;
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
        }

        if (icamera == 7) {
            // 上記４カメラを１画面で
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            {
                let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
                camera.rotationOffset = 180;
                camera.radius = 5;
                camera.heightOffset = 1;
                camera.cameraAcceleration = 0.05;
                camera.maxCameraSpeed = 30;
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
                camera.rotationOffset = 180;
                camera.radius = 0.5;
                camera.heightOffset = 0.1;
                camera.cameraAcceleration = 0.2;
                camera.maxCameraSpeed = 30;
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
                camera.setTarget(BABYLON.Vector3.Zero());
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
                camera.setTarget(BABYLON.Vector3.Zero());
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
            }

            cameralist[0].viewport = new BABYLON.Viewport(0.0, 0.5, 0.5, 0.5); // 左上
            cameralist[1].viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5); // 右上
            cameralist[2].viewport = new BABYLON.Viewport(0.0, 0.0, 0.5, 0.5); // 左下
            cameralist[3].viewport = new BABYLON.Viewport(0.5, 0.0, 0.5, 0.5); // 右下
        }

        if (((icamera == 5) || (icamera == 7)) && myMesh!=null) {
            cameralist[0].lockedTarget = myMesh;
            cameralist[1].lockedTarget = myMesh;
            cameralist[2].lockedTarget = myMesh;
            cameralist[3].lockedTarget = myMesh;
        } else if (icamera >= 1 && myMesh!=null) {
            camera.lockedTarget = myMesh;
        }
    }
    scene.onBeforeRenderObservable.add((scene) => {
        if (icamera == 3) {
            let vdir = camera.position.subtract(myMesh.position).normalize().scale(5);
            vdir.y = 1;
            camera.position = myMesh.position.add(vdir);
        }
        if (icamera == 4) {
            let quat = myMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(0, 1, -5);
            vdir = vdir.applyRotationQuaternion(quat);
            camera.position = myMesh.position.add(vdir);
        }
        if (icamera == 5) {
            {
                let vdir = cameralist[2].position.subtract(myMesh.position).normalize().scale(5);
                vdir.y = 1;
                cameralist[2].position = myMesh.position.add(vdir);
            }
            
            {
                let quat = myMesh.rotationQuaternion;
                let vdir = new BABYLON.Vector3(0, 1, -5);
                vdir = vdir.applyRotationQuaternion(quat);
                cameralist[3].position = myMesh.position.add(vdir);
            }
        }

        if (icamera == 6) {
            let quat = myMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(0, 1, -5);
            vdir = vdir.applyRotationQuaternion(quat);
            camera.position = myMesh.position.add(vdir);
            // camera.rotationQuaternion = quat.clone();
            camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);

        }
        if (icamera == 7) {
            {
                let quat = myMesh.rotationQuaternion;
                cameralist[0].upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                cameralist[1].upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                cameralist[2].upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
            }
            {
                let vdir = cameralist[2].position.subtract(myMesh.position).normalize().scale(5);
                vdir.y = 1;
                cameralist[2].position = myMesh.position.add(vdir);
            }
            {
                let quat = myMesh.rotationQuaternion;
                let vdir = new BABYLON.Vector3(0, 1, -5);
                vdir = vdir.applyRotationQuaternion(quat);
                cameralist[3].position = myMesh.position.add(vdir);
                cameralist[3].upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
            }
        }
    });


    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    if (1) {
        // 地面（平地）
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
        var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
    }

    // コース画像
    let crsW=400, crsH=300;
    const courseMesh = BABYLON.MeshBuilder.CreateGround("courseImg", { width:crsW, height:crsH }, scene);
    courseMesh.position.y=0.01;
    courseMesh.material = new BABYLON.StandardMaterial("");
    courseMesh.material.diffuseTexture = new BABYLON.Texture(coursePath);
    courseMesh.material.diffuseTexture.hasAlpha = true;
    courseMesh.material.emissiveColor = new BABYLON.Color3.White();
    courseMesh.material.alpha = 0.2;


    if(1){
        // リボンによる曲面（画面奥、左手、ゆるやかな傾斜）
        let rootPath = [];
        let nxmin = -20, nxmax = 81, nzmin = -20, nzmax = 121, gridsize = 1;
        for (let iz = nzmin; iz < nzmax; ++iz) {
            let z = iz*gridsize;
            let path = []
            for (let ix = nxmin; ix < nxmax; ++ix) {
                let x = ix*gridsize;
                let y = ((iz-nzmin)**2)*0.001;
                if (y < 0) y = 0;
                path.push(new BABYLON.Vector3(x, y, z));
            }
            rootPath.push(path);
        }
        let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        let mat = new BABYLON.StandardMaterial("");
        mat.diffuseTexture = new BABYLON.Texture(coursePath);
        // mat.diffuseColor = new BABYLON.Color3(0.8, 0.9, 0.8);
        mat.emissiveColor = new BABYLON.Color3.Black();
        mat.wireframe = true;
        trgMesh.material = mat;
        let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
        trgMesh.physicsBody.disablePreStep = true;
        trgMesh.position.x += -100;
        trgMesh.position.z += 180;
        trgMesh.position.y += 0.01;
        trgMesh.physicsBody.disablePreStep = false;
    }

    if(1){
        // リボンによる曲面（画面奥、中央、ややきつい傾斜）
        let rootPath = [];
        let nxmin = -20, nxmax = 81, nzmin = -20, nzmax = 121, gridsize = 1;
        for (let iz = nzmin; iz < nzmax; ++iz) {
            let z = iz*gridsize;
            let path = []
            for (let ix = nxmin; ix < nxmax; ++ix) {
                let x = ix*gridsize;
                let y = ((iz-nzmin)**2)*0.005;
                if (y < 0) y = 0;
                path.push(new BABYLON.Vector3(x, y, z));
            }
            rootPath.push(path);
        }
        let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_2", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        let mat = new BABYLON.StandardMaterial("");
        mat.diffuseTexture = new BABYLON.Texture(coursePath);
        // mat.diffuseColor = new BABYLON.Color3(0.8, 0.9, 0.8);
        mat.emissiveColor = new BABYLON.Color3.Black();
        mat.wireframe = true;
        trgMesh.material = mat;
        let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
        trgMesh.physicsBody.disablePreStep = true;
        trgMesh.position.x += 20;
        trgMesh.position.z += 180;
        trgMesh.position.y += 0.01;
        trgMesh.physicsBody.disablePreStep = false;
    }

    if (1) {
        // リボンによる曲面（画面奥、右手、円筒を半分に切ったもの）
        let r = 100, r_=r/2;
        const mesh = BABYLON.MeshBuilder.CreateCylinder("ground_cylinder", {height:100, diameter:r, arc: 0.5, sideOrientation: BABYLON.Mesh.DOUBLESIDE, tessellation:120});
        let q = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), R90);
        let q2 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), R180);
        q.multiplyInPlace(q2)
        mesh.rotationQuaternion=q;
        mesh.position.set(220, r_, 150);
        let mat = new BABYLON.StandardMaterial("");
        mat.diffuseTexture = new BABYLON.Texture(coursePath);
        mat.emissiveColor = new BABYLON.Color3.White();
        mat.wireframe = true;
        mesh.material = mat;
        let trgAgg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
    }

    if(1){
        // パーリンノイズで凹凸をつけた台地（画面右手）
        let rootPath = [];
        // perlinノイズで地形を作る  .. 山がいっぱいな版
        let nb = new BABYLON.NoiseBlock();
        const nbvzero = new BABYLON.Vector3(0,0,0);
        // let gridratio = 1, nbscale = 0.02/gridratio;
        let gridratio = 1, nbscale = 0.05/gridratio;
        let size = 100, size_ = size/2;
        let nmin = -size_, nmax = size_+1; // , yratio = 20;
        let fieldDataOrg0=[];
        for (let iz = nmin; iz < nmax; ++iz) {
            let z = iz*gridratio;
            let path = []
            for (let ix = nmin; ix < nmax; ++ix) {
                let x = ix*gridratio;
                let y = nb.noise(8, 0.5, new BABYLON.Vector3(x,z,0), nbvzero, nbscale)*2;
                {
                    if (iz==nmin || iz==size_ || ix==nmin || ix==size_) {
                        y = 0;
                    } else if (iz==nmin+1 || iz==size_-1 || ix==nmin+1 || ix==size_-1) {
                        y /= 2;
                    }
                }
                path.push(new BABYLON.Vector3(x, y, z));
            }
            rootPath.push(path);
        }
        let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        let mat = new BABYLON.StandardMaterial("");
        mat.diffuseTexture = new BABYLON.Texture(coursePath);
        // mat.diffuseColor = new BABYLON.Color3(0.8, 0.9, 0.8);
        mat.emissiveColor = new BABYLON.Color3.Black();
        mat.wireframe = true;
        trgMesh.material = mat;
        let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
        trgMesh.physicsBody.disablePreStep = true;
        trgMesh.position.x += 250;
        trgMesh.position.z += -0.01;
        trgMesh.position.y += 0.01;
        trgMesh.physicsBody.disablePreStep = false;
    }



    let meshAggInfo = []; // mesh, agg;
    let meshes = [];
    let pStart = new BABYLON.Vector3(0, 0, 0);
    let pStart2 = new BABYLON.Vector3(0, 0, 0);
    let pGoal = new BABYLON.Vector3(0, 0, 0);


    let resetMyPosi = function () {
        if (myMesh==null) {
            return;
        }

        myMesh.position = pStart.clone();
        myMesh.position.y += 2;
        let p1 = pStart.clone();
        let p3 = pStart2.clone();
        p3.subtractInPlace(p1);
        let vrot = Math.atan2(p3.x, p3.z);
        myMesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
        myMesh.rotate(BABYLON.Vector3.Up(), vrot);
        myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
    }

    // ----------------------------------------

    let imymesh = 9;
    // let imymesh = 3; // 車（比較用
    let mymeshList = [3, 9];

    let wheelMeshes=[]
    let createMyMesh = function() {
        if (wheelMeshes.length>0) {
            for (let m of wheelMeshes) {
                m.dispose()
            }
            wheelMeshes=[];
            delete  myMesh._vehicle;
            myMesh._vehicle = null;
        }

        if (myMesh!=null) { myMesh.dispose() }

        let addCharPanel = function(charPath, myMesh, adjy=1.1, clipy=0.0) {
            let mx = 3, my = 4;
	    let matFB = new BABYLON.StandardMaterial("");
	    matFB.diffuseTexture = new BABYLON.Texture(charPath);
	    matFB.diffuseTexture.hasAlpha = true;
	    matFB.emissiveColor = new BABYLON.Color3.White();
            //let clipy=0.01;
	    let uvF = new BABYLON.Vector4(0, 0/my+clipy, 1/mx, 1/my); // B
            let uvB = new BABYLON.Vector4(0, 3/my+clipy, 1/mx, 4/my); // F
            let planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            planeFB.position.y = adjy;
            planeFB.material = matFB;
            // planeFB.material.top = 5;
            planeFB.parent = myMesh;
            myMesh._planeFB = planeFB;
            // myMesh._txtFB = matFB.diffuseTexture;
	    let matLR = new BABYLON.StandardMaterial("");
	    matLR.diffuseTexture = new BABYLON.Texture(charPath);
	    matLR.diffuseTexture.hasAlpha = true;
	    matLR.emissiveColor = new BABYLON.Color3.White();
	    let uvL = new BABYLON.Vector4(0, 2/my, 1/mx, 3/my); // L
            let uvR = new BABYLON.Vector4(1/mx, 1/my, 0, 2/my); // R
            let planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvR, backUVs: uvL, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            planeLR.position.y = adjy;
            planeLR.material = matLR;
            // planeLR.material.top = 5;
            planeLR.rotation = new BABYLON.Vector3(0, R90, 0);
            planeLR.parent = myMesh;
            myMesh._planeLR = planeLR;
            // myMesh._txtLR = matLR.diffuseTexture;
        }

        if (imymesh == 3) {
            // RaycastVehicle
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            const chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.emissiveColor = BABYLON.Color3.Blue();
            chassisMesh.material.alpha=0.7;
            chassisMesh.position.y = 5
            chassisMesh.position.x = 0
            chassisMesh.rotationQuaternion = new BABYLON.Quaternion()
            const chassisPhysicsShape = new BABYLON.PhysicsShapeConvexHull(chassisMesh, scene);
            const chassisPhysicsBody = new BABYLON.PhysicsBody(chassisMesh, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
            chassisPhysicsBody.shape = chassisPhysicsShape
            chassisPhysicsBody.setMassProperties({
                centerOfMass: new BABYLON.Vector3(0, -0.5, 0)
            })
            chassisPhysicsShape.filterMembershipMask = 2
            // position で移動させるために
            chassisPhysicsBody.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            chassisPhysicsBody.disablePreStep = false;
            // --------------------
            // 車のモデル（RaycastVehicle
            const vehicle = new Vehicle2.RaycastVehicle(chassisPhysicsBody, scene)
            vehicle.numberOfFramesToPredict = 60 //Number of frames to predict future upwards orientation if airborne
            vehicle.predictionRatio = 0; //[0-1]How quickly to correct angular velocity towards future orientation. 0 = disabled
            // --------------------
            // ホイールのメッシュ
            const wheelMesh = BABYLON.MeshBuilder.CreateCylinder("WheelMesh", {height:0.3, diameter:0.4})
            wheelMesh.material = new BABYLON.StandardMaterial("");
            wheelMesh.material.diffuseColor = BABYLON.Color3.Gray();
            wheelMesh.material.wireframe=1;
            wheelMeshes = [wheelMesh, wheelMesh.createInstance(1), wheelMesh.createInstance(2), wheelMesh.createInstance(3)]
            wheelMeshes.forEach(mesh => {
                mesh.rotationQuaternion = new BABYLON.Quaternion()
            })
            vehicle._wheelMeshes = wheelMeshes;
            // ホイール・サスペンションのパラメータ
            const wheelConfig = {
                positionLocal:new BABYLON.Vector3(0.49, 0, -0.7),//Local connection point on the chassis
                suspensionRestLength:0.6,                //Rest length when suspension is fully decompressed
                suspensionForce:15000,                   //Max force to apply to the suspension/spring 
                suspensionDamping:0.15,                  //[0-1] Damper force in percentage of suspensionForce
                suspensionAxisLocal:new BABYLON.Vector3(0,-1,0), //Direction of the spring
                axleAxisLocal:new BABYLON.Vector3(1,0,0),        //Axis the wheel spins around
                forwardAxisLocal:new BABYLON.Vector3(0,0,1),     //Forward direction of the wheel
                sideForcePositionRatio:0.1,              //[0-1]0 = wheel position, 1 = connection point 
                // sideForce:40,                            //Force applied to counter wheel drifting
                sideForce:6, // ski な感じ
                radius:0.2,
                rotationMultiplier:0.1                   //How fast to spin the wheel
            }
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Right rear
            wheelConfig.positionLocal.set(-0.49, 0, -0.7)//Left rear
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))
            wheelConfig.positionLocal.set(-0.49, 0, 0.8)
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Left front
            wheelConfig.positionLocal.set(0.49, 0, 0.8)
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Right front
            // Attempt at some anti rolling
            vehicle.addAntiRollAxle({wheelA:0, wheelB:1, force:10000}) // right rear - left rear
            vehicle.addAntiRollAxle({wheelA:2, wheelB:3, force:10000}) // left front - right rear
            myMesh = chassisMesh;
            myMesh._vehicle = vehicle;
            vehicle._maxVehicleForce = 2200
            vehicle._maxSteerValue = 0.2; // 0.6 
            vehicle._steeringIncrement = 0.005
            vehicle._steerRecover = 0.05
            vehicle._steerValue = 0
        }

        if (imymesh == 9) {
            // フロート(3) 浮遊体)  斜めな地面に対応
            let mw=1, mh=0.5, md=2;
            myMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: mw, diameterY: mh, diameterZ: md, segments: 8 }, scene);
            myMesh.material = new BABYLON.StandardMaterial("mat", scene);
            myMesh.material.emissiveColor = BABYLON.Color3.Blue();
            myMesh.material.alpha=.5;
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh._agg=myAgg;
            myMesh._acc =0;
            myMesh._dampLmax = 100000; // ブレーキ用
            myMesh.physicsBody.disablePreStep = false;
            myMesh.physicsBody.setGravityFactor(0.0);   // 重力の効果
            myAgg.body.setLinearDamping(0.6); // def:0
            myAgg.body.setAngularDamping(100.0); // def: 0.1  ..逆回転の力を抑え込むための摩擦
            addCharPanel(myTextPath3, myMesh, 1.1, 0.01);
            myMesh._planeFB.material.alpha=0.1; // わざと透明に
            myMesh.position.y += 1;
            // レイキャスト用の座標（前後左右を起点とする
            myMesh._mw_ = mw/2;
            myMesh._mh_ = mh/2;
            myMesh._md_ = md/2;
        }

        if (typeof(myMesh._vehicle) === 'undefined') {
            myMesh._vehicle = null;
        }

        return myMesh
    }



    let updateMyMesh = function() {

        let forwardForce, steerDirection, roll;

        if (imymesh == 3) {
            // RaycastVehicle

            let forwardForce = 0;
            if(keyAction.forward) forwardForce = 1
            if(keyAction.backward) forwardForce = -1
            let steerDirection = 0;
            if(keyAction.left) steerDirection = -1
            if(keyAction.right) steerDirection = 1
            let vquick = (keyAction.quick) ? 3 : 1;
            let vbrake = (keyAction.brake) ? 1 : 0;
            let vehicle = myMesh._vehicle;
            
            vehicle._steerValue = steerDirection*vehicle._maxSteerValue*vquick;
            vehicle.wheels[2].steering = vehicle._steerValue
            vehicle.wheels[3].steering = vehicle._steerValue

            vehicle.wheels[2].force = forwardForce*vehicle._maxVehicleForce
            vehicle.wheels[3].force = forwardForce*vehicle._maxVehicleForce

            vehicle.wheels[0].brake = vbrake;
            vehicle.wheels[1].brake = vbrake;
            vehicle.wheels[2].brake = vbrake;
            vehicle.wheels[3].brake = vbrake;

            vehicle.update()
            
            let wheelMeshes = vehicle._wheelMeshes;
            vehicle.wheels.forEach((wheel, index) => {
                if(!wheelMeshes[index]) return
                const wheelMesh = wheelMeshes[index]
                wheelMesh.position.copyFrom(wheel.transform.position)
                wheelMesh.rotationQuaternion.copyFrom(wheel.transform.rotationQuaternion)
                wheelMesh.rotate(BABYLON.Axis.Z, Math.PI/2, BABYLON.Space.LOCAL)
            })

            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }

        } else if (imymesh == 9) {
            // フロート
            forwardForce = 0;
            if(keyAction.forward) forwardForce = 1
            if(keyAction.backward) forwardForce = -1
            steerDirection = 0;
            if(keyAction.left) steerDirection = -1
            if(keyAction.right) steerDirection = 1
            let vbrake = (keyAction.brake) ? 1 : 0;
            let vquick = (keyAction.quick) ? 3 : 1;
            if (forwardForce!=0) {
                if(Math.abs(myMesh._acc)<0.2) {
                    // 発進時
                    myMesh._acc = 0.8*forwardForce
                } else if(Math.abs(myMesh._acc)<1.5) {
                    // 加速時
                    myMesh._acc += 0.01*forwardForce*vquick
                }
            } else {
                // 減速させる
                if (myMesh._acc > 0) {
                    myMesh._acc -= 0.01;
                } else {
                    myMesh._acc += 0.1;
                }
                if (vbrake!=0) {
                    // ブレーキ時
                    myMesh._acc = 0;
                }
            }
            if (vbrake!=0) {
                // ブレーキ時
                myMesh._agg.body.setLinearDamping(myMesh._dampLmax*myMesh.vbrake);

            } else {
                // 前進・後進時
                myMesh._agg.body.setLinearDamping(myMesh._dampLdef);
                // const vrate = 0.5;
                const vrate = 0.5;
                let quat = myMesh.rotationQuaternion;
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                // vdir = vdir.scale(vrate*forwardForce*vquick);
                vdir = vdir.scale(vrate*myMesh._acc);
                myMesh._agg.body.applyImpulse(vdir, myMesh.absolutePosition);
            }
            //
            if (steerDirection!=0) {
                // 左右の旋回
                let vrate = 1; // 0.15;
                let quat = myMesh.rotationQuaternion;
                let vroty = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                vroty = vroty.scale(vrate*steerDirection*vquick);
                myMesh._agg.body.applyAngularImpulse(vroty);
            }
            //前後方向のみに動きやすいよう、横方向には逆向きの力を加える
            // ..結果、横滑り（ドリフト）せずにグリップ走行になる
            {
                let vec = myMesh._agg.body.getLinearVelocity();
                // 右方向のベクトルを求める
                let quat = myMesh.rotationQuaternion;
                let vdirR = BABYLON.Vector3.Right().applyRotationQuaternion(quat);
                // 内積より寄与分をもとめる
                let v = vdirR.dot(vec);
                // 逆向きの力とする
                // let amp=-0.9; // アンダーステアっぽい
                let amp=-0.1;
                // let amp=-0.01; // ドリフトっぽい
                vdirR.scaleInPlace(v*amp);
                myMesh._agg.body.applyImpulse(vdirR, myMesh.absolutePosition);
            }

            // レイキャスト操作
            {
                let susLen = 10, susPower=10.0; // , susLen2 = 2.5;

                // 開始位置
                let quat = myMesh.rotationQuaternion;
                let vd = BABYLON.Vector3.Forward().applyRotationQuaternion(quat).scale(myMesh._md_);
                let vw = BABYLON.Vector3.Right().applyRotationQuaternion(quat).scale(myMesh._mw_);
                let vdown = BABYLON.Vector3.Down().applyRotationQuaternion(quat).scale(susLen);
                let vg = BABYLON.Vector3.Down().applyRotationQuaternion(quat).scale(9.8);
                let pstartList = [
                    myMesh.position.add(vd), // 前
                    myMesh.position.subtract(vd),  //後
                    myMesh.position.add(vw), // 右
                    myMesh.position.subtract(vd), // 左
                ];
                const physEngine = scene.getPhysicsEngine();
                const raycastResult = new BABYLON.PhysicsRaycastResult();
                for (let pstart of pstartList) {
                    let pend = pstart.add(vdown)
                    physEngine.raycastToRef(pstart, pend, raycastResult)
                    if (!raycastResult.hasHit) {
                        // 離れすぎ
                        // 地面に張り付かせる力 の代わりに姿勢の下方向へ力
                        myMesh._agg.body.applyForce(vg, pstart);
                        continue;
                    }
                    // 接地している

                    // 縮んだ距離 = サスペンションの長さ - 始点から交点位置 ＋ちょっと足して浮かせた感じに
                    let compLen  = susLen - raycastResult.hitDistance -7.8;
                    const grav = -9.8;
                    myMesh._agg.body.applyForce(raycastResult.hitNormalWorld.scale(grav + susPower*compLen), pstart);

                    // 地面に垂直な方向(raycastResult.hitNormalWorld)に傾ける
                    let v1 = raycastResult.hitNormalWorld.normalize();
                    let v2 = BABYLON.Vector3.Up().applyRotationQuaternion(quat).normalize();
                    let v3 = BABYLON.Vector3.Cross(v2, v1).scale(0.1);
                    myMesh._agg.body.applyAngularImpulse(v3);
                }
            }

            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }

        } else {
console.log("under cunstrunction");
        }
    }

    let resetPostureMyMesh = function() {
        if (imymesh == 3) {
            // RaycastVehicle
            let vehicle = myMesh._vehicle;
            vehicle.doResetPosture();

        } else if (imymesh == 9) {
            // フロート (3)
            let eular = myMesh.rotationQuaternion.toEulerAngles()
            let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
            myMesh.rotationQuaternion = quat;
            myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));

        } else {
            // 姿勢を正す
            /// クォータニオンからオイラー角を取得、方向（ヨー:z軸回転）だけを使い他は0として姿勢をリセットする
            myMesh.position.y += myMesh._height;
            myMesh._agg.body.applyImpulse(new BABYLON.Vector3(0, 40, 0), myMesh.absolutePosition);
            let eular = myMesh.rotationQuaternion.toEulerAngles()
            let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
            myMesh.rotationQuaternion = quat;
            // 回転を止める
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
        }
    }


    createMyMesh();

    changeCamera(icamera);
    resetMyPosi();


    var map ={}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
        map['shift'] = evt.sourceEvent.shiftKey;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
        map['shift'] = evt.sourceEvent.shiftKey;
    }));
    let cooltime_act = 0, cooltime_actIni = 20, vforceBase = 0.04, vforce = 0.04, bDash=3, jumpforce = 120;

    let keyAction = {forward:0, back:0, right:0, left:0, LR:0, brake:0, quick:0, reset:0, resetCooltime:0};
    scene.registerAfterRender(function() {
        keyAction.quick=false;
        if (map["ctrl"]) {
            keyAction.quick=true;
        }
        if (map["w"] || map["ArrowUp"]) {
            keyAction.forward = true;
        } else {
            keyAction.forward = false;
        }
        if (map["s"] || map["ArrowDown"]) {
            keyAction.backward = true
        } else {
            keyAction.backward = false
        }
        keyAction.LR = false;
        keyAction.left = false;
        keyAction.right = false;
        if ((map["a"] || map["ArrowLeft"]) && (map["d"] || map["ArrowRight"])) {
            keyAction.LR = true; //roll処理用
        } else if (map["a"] || map["ArrowLeft"]) {
            keyAction.left = true;
        } else if (map["d"] || map["ArrowRight"]) {
            keyAction.right = true;
        }
        keyAction.brake = false;
        if (map[" "]) {
            keyAction.brake = true;
        }
        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["Enter"]) {
                cooltime_act = cooltime_actIni;
                keyAction.reset = true;
            }
            if (map["c"] || map["C"]) {
                cooltime_act = cooltime_actIni;
                if (map["C"] || map["shift"]) {
//console.log("shift-c");
                    icamera=(icamera+ncamera-1)%ncamera;
                } else {
                    icamera=(icamera+1)%ncamera;
                }
                changeCamera(icamera);
            }
            if (map["m"] || map["M"]) {
                cooltime_act = cooltime_actIni;
                // imymesh=(imymesh+1)%nmymesh;
                if (map["M"] || map["shift"]) {
                    let i = mymeshList.indexOf(imymesh);
                    console.assert(i >= 0);
                    i = (i-1+mymeshList.length) % mymeshList.length;
                    imymesh=mymeshList[i];
                } else {
                    let i = mymeshList.indexOf(imymesh);
                    console.assert(i >= 0);
                    i = (i+1) % mymeshList.length;
                    imymesh=mymeshList[i];
                }
                createMyMesh();
                changeCamera(icamera);
                resetMyPosi();
            }
            if (map["r"]) { // 'r'
                cooltime_act = cooltime_actIni;
                resetMyPosi();
            }
            if (map["h"]) {
                cooltime_act = cooltime_actIni;
                changeUsageView();
            }
        }
    });

    scene.onBeforeRenderObservable.add(()=>{
        updateMyMesh();
    })

    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // 左上に使い方（操作方法）を表示
    let guiUsageRect = new BABYLON.GUI.Rectangle();
    {
        guiUsageRect.adaptWidthToChildren = true;
        guiUsageRect.width = "320px";
        guiUsageRect.height = "200px";
        guiUsageRect.cornerRadius = 5;
        guiUsageRect.color = "Orange";
        guiUsageRect.thickness = 4;
        guiUsageRect.background = "green";
        guiUsageRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        guiUsageRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(guiUsageRect);    
        let grid = new BABYLON.GUI.Grid();
        grid.width = 0.98;
        grid.height = 0.98;
        grid.addRowDefinition(1);
        grid.addRowDefinition(22, true);
        guiUsageRect.addControl(grid); 
        // グリッド内の要素の登録
        {
            let text1 = new BABYLON.GUI.TextBlock();
            text1.text = "Usage:\n"
                +"(Arrow UP/DOWN)/(W,S): Forward/Back\n"
                +"(Arrow Left/Right)/(A,D): Left/Right\n"
                +"(C) : Change Camera\n"
                +"(M) : Change Machine\n"
                +"H: show/hide this message";
            text1.color = "white";
            text1.width = "310px";
            text1.fontSize = 14;
            text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
            text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
            text1.paddingLeft = 12;
            grid.addControl(text1, 0, 0);
        }
        guiUsageRect.isVisible = false;
    }
    var changeUsageView = function() {
        if (guiUsageRect.isVisible) {
            guiUsageRect.isVisible = false;
        } else {
            guiUsageRect.isVisible = true;
        }
    }

    return scene;
}

// Babylon.js で物理演算(havok)：移動体とカメラ

//  - カーソル上/(w)              .. 前進
//  - カーソル下/(s)              .. 後進
//  - カーソル右左/(a,d)          .. 旋回
//  - Ctrl+カーソル右＋左/(a＋d)  .. 大きく旋回
//  - space                       .. ブレーキ
//  - enter                       .. 姿勢を正す（ジャンプ）
//  - (c/C[=shift+c])             .. カメラ変更
//  - (m/M[=shift+m])             .. マシン（移動体）変更

const R90 = Math.PI/2;
const R180 = Math.PI;

//const SCRIPT_URL2 = "./Vehicle_draft2.js";
// let coursePath="textures/course/BoxySVG_test1_3_400x300.png"
// const myTextPath3 = "textures/pipo-charachip017a.png"; // メイド
// ------------------------------
const SCRIPT_URL2 = "../105/Vehicle2.js";
let coursePath="../066/textures/BoxySVG_test1_3_400x300.png"
const myTextPath3 = "../093/textures/pipo-charachip017a.png"; // メイド

// ------------------------------
// const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/105/Vehicle2.js";
// let coursePath="https://raw.githubusercontent.com/fnamuoo/webgl/main///066/textures/BoxySVG_test1_3_400x300.png";
// const myTextPath3 = "https://raw.githubusercontent.com/fnamuoo/webgl/main///093/textures/pipo-charachip017a.png";


let Vehicle = null;
await import(SCRIPT_URL2).then((obj) => { Vehicle = obj; });

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let camera = null, myMesh=null;
    let icamera = 5, ncamera = 6;
    let cameralist = [];
    var changeCamera = function(icamera) {
console.log("icamera=",icamera)
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(5, 20,-10), scene);
            // camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 0,-50), scene);
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
            camera.lockedTarget = myMesh;
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);

        }
        if (icamera == 1) {
            // フローカメラを使ったバードビュー
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 180;
            camera.radius = 5;
            camera.heightOffset = 1;
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
                camera.radius = 5; // 10;
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
//console.log("camera.len=",cameralist.length);
        }

        if (icamera == 5 && myMesh!=null) {
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
        if ((icamera == 4) && (myMesh._vehicle != null)) {
            // let quat = myMesh._vehicle.body.transformNode.rotationQuaternion;
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
            
            //if ((myMesh._vehicle != null)) {
            {
                let quat = myMesh.rotationQuaternion;
                let vdir = new BABYLON.Vector3(0, 1, -5);
                vdir = vdir.applyRotationQuaternion(quat);
                cameralist[3].position = myMesh.position.add(vdir);
            }
        }
    });

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // 地面
    const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
    groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMesh.material.majorUnitFrequency = 100; 
    groundMesh.material.minorUnitVisibility  = 0.2;
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);

    // コース画像
    let crsW=400, crsH=300;
    // let coursePath="textures/course/BoxySVG_test1_3_400x300.png"
    const courseMesh = BABYLON.MeshBuilder.CreateGround("course", { width:crsW, height:crsH }, scene);
    courseMesh.position.y=0.01;
    courseMesh.material = new BABYLON.StandardMaterial("");
    courseMesh.material.diffuseTexture = new BABYLON.Texture(coursePath);
    courseMesh.material.diffuseTexture.hasAlpha = true;
    courseMesh.material.emissiveColor = new BABYLON.Color3.White();


    if(1){
        // リボンによる曲面
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
        let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        let mat = new BABYLON.StandardMaterial("");
        mat.diffuseTexture = new BABYLON.Texture(coursePath);
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
        // リボンによる曲面
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
        let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        let mat = new BABYLON.StandardMaterial("");
        mat.diffuseTexture = new BABYLON.Texture(coursePath);
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

    if(1){
        // パーリンノイズでいくつかのデータを作成
        let rootPath = [];
        // perlinノイズで地形を作る  .. 山がいっぱいな版
        let nb = new BABYLON.NoiseBlock();
        const nbvzero = new BABYLON.Vector3(0,0,0);
        let gridratio = 1, nbscale = 0.05/gridratio;
        let size = 100, size_ = size/2;
        let nmin = -size_, nmax = size_+1;
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

    // ----------------------------------------


    // 0: 立体
    // 1: カプセル
    // 2: ボード 転進に力＋加速度／エンジン概念＋ブレーキ
    // 3: RaycastVhicle

    let imymesh = 3;
    let mymeshList = [0, 1, 2, 3];
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

        if (imymesh == 0) {
            // 自機（立方体） メッシュのみ（物理は無し
            myMesh = BABYLON.MeshBuilder.CreateBox("target", { size: 2 }, scene);
            myMesh.material = new BABYLON.StandardMaterial("mat", scene);
            myMesh.material.emissiveColor = BABYLON.Color3.Blue();
            myMesh.material.alpha=.5;
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myAgg.body.setLinearDamping(0.6); // def: 0
            myAgg.body.setAngularDamping(4); // def: 0.1
            myMesh._agg=myAgg;
            myMesh._height =0.1;

        }

        if (imymesh == 1) {
            // カプセル
            let h = 3, r = 0.5;
            myMesh = BABYLON.MeshBuilder.CreateCapsule("me", {height: h, radius:r, segments:8}, scene);
            myMesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, -R90);
            myMesh.material = new BABYLON.GradientMaterial("grad", scene);
            myMesh.material.topColor = new BABYLON.Color3(1, 1, 1);
            myMesh.material.bottomColor = new BABYLON.Color3(1, 0.6, 0.6);
            myMesh.material.emissiveColor = BABYLON.Color3.White();
            myMesh.material.diffuseColor = BABYLON.Color3.White();
            myMesh.material.smoothness = -0.1;
            myMesh.material.wireframe=1;
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.CAPSULE, { mass: 1.0, friction: 100.0, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh._p = myMesh.position.clone();
            myMesh._agg=myAgg;
            myMesh._height =0.1;
            myMesh.physicsBody.disablePreStep = false;
        }

        var addCharPanel = function(charPath, myMesh, adjy=1.1, clipy=0.0) {
            let mx = 3, my = 4;
	    let matFB = new BABYLON.StandardMaterial("");
	    matFB.diffuseTexture = new BABYLON.Texture(charPath);
	    matFB.diffuseTexture.hasAlpha = true;
	    matFB.emissiveColor = new BABYLON.Color3.White();
	    let uvF = new BABYLON.Vector4(0, 0/my+clipy, 1/mx, 1/my); // B
            let uvB = new BABYLON.Vector4(0, 3/my+clipy, 1/mx, 4/my); // F
            let planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            planeFB.position.y = adjy;
            planeFB.material = matFB;
            planeFB.parent = myMesh;
            myMesh._planeFB = planeFB;
	    let matLR = new BABYLON.StandardMaterial("");
	    matLR.diffuseTexture = new BABYLON.Texture(charPath);
	    matLR.diffuseTexture.hasAlpha = true;
	    matLR.emissiveColor = new BABYLON.Color3.White();
	    let uvL = new BABYLON.Vector4(0, 2/my, 1/mx, 3/my); // L
            let uvR = new BABYLON.Vector4(1/mx, 1/my, 0, 2/my); // R
            let planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvR, backUVs: uvL, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            planeLR.position.y = adjy;
            planeLR.material = matLR;
            planeLR.rotation = new BABYLON.Vector3(0, R90, 0);
            planeLR.parent = myMesh;
            myMesh._planeLR = planeLR;
        }


        if (imymesh == 2) {
            // ボード
            myMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: 1.0, diameterY: 0.5, diameterZ: 4.0, segments: 8 }, scene); // 093_board
            myMesh.material = new BABYLON.GradientMaterial("grad", scene);
            myMesh.material.topColor = new BABYLON.Color3(1, 1, 1);
            myMesh.material.bottomColor = new BABYLON.Color3(1, 0.6, 0.6);
            myMesh.material.emissiveColor = BABYLON.Color3.White();
            myMesh.material.diffuseColor = BABYLON.Color3.White();
            myMesh.material.smoothness = -0.1;
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.MESH, { mass: 1.0, friction: 0.001, restitution:0.5}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh._p = myMesh.position.clone();
            myMesh._agg=myAgg;
            myMesh._height =1;
            myMesh._acc =0;
            myMesh.physicsBody.disablePreStep = false;
            myMesh._dampLdef = 0.6;
            myMesh._dampLmax = 100000;
            myAgg.body.setLinearDamping(myMesh._dampLdef);
            myAgg.body.setAngularDamping(100);
            addCharPanel(myTextPath3, myMesh, 1.1, 0.01);
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
            // --------------------
            // 車のモデル（RaycastVehicle
            const vehicle = new Vehicle.RaycastVehicle(chassisPhysicsBody, scene)
            vehicle.numberOfFramesToPredict = 60//Number of frames to predict future upwards orientation if airborne
            // vehicle.predictionRatio = 0.8//[0-1]How quickly to correct angular velocity towards future orientation. 0 = disabled
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
            vehicle.addWheel(new Vehicle.RaycastWheel(wheelConfig))//Right rear
            wheelConfig.positionLocal.set(-0.49, 0, -0.7)//Left rear
            vehicle.addWheel(new Vehicle.RaycastWheel(wheelConfig))
            wheelConfig.positionLocal.set(-0.49, 0, 0.8)
            vehicle.addWheel(new Vehicle.RaycastWheel(wheelConfig))//Left front
            wheelConfig.positionLocal.set(0.49, 0, 0.8)
            vehicle.addWheel(new Vehicle.RaycastWheel(wheelConfig))//Right front
            // Attempt at some anti rolling
            vehicle.addAntiRollAxle({wheelA:0, wheelB:1, force:10000}) // right rear - left rear
            vehicle.addAntiRollAxle({wheelA:2, wheelB:3, force:10000}) // left front - right rear
            myMesh = chassisMesh;
            myMesh._vehicle = vehicle;
            // imymesh=13用パラメータ
            vehicle._maxVehicleForce = 2200
            vehicle._maxSteerValue = 0.2; // 0.6 
            vehicle._steeringIncrement = 0.005
            vehicle._steerRecover = 0.05
            vehicle._steerValue = 0
        }
        if (typeof(myMesh._vehicle) === 'undefined') {
            myMesh._vehicle = null;
        }
        return myMesh
    }


    let updateMyMesh = function() {

        if (imymesh == 0) {
            // 立方体：力で推進させる、力で回転させる
            let forwardForce = 0;
            let steerDirection = 0;
            if(keyAction.forward) forwardForce = 1
            if(keyAction.backward) forwardForce = -1
            if(keyAction.left) steerDirection = -1
            if(keyAction.right) steerDirection = 1
            let vquick = (keyAction.quick) ? 3 : 1;
            let quat = myMesh.rotationQuaternion;
            let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
            vdir = vdir.scale(forwardForce*1.0*vquick);
            // myAgg.body.applyForce(vdir, myMesh.absolutePosition);
            myMesh._agg.body.applyImpulse(vdir, myMesh.absolutePosition);
            //
            let qRot = BABYLON.Quaternion.FromEulerAngles(0, 0.02*steerDirection, 0);
            let vrot = BABYLON.Vector3.Up().applyRotationQuaternion(qRot);
            vrot = vrot.scale(0.1*steerDirection*vquick);
            myMesh._agg.body.applyAngularImpulse(vrot);
            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }

        } else if (imymesh == 1) {
            // カプセル
            let forwardForce = 0;
            let steerDirection = 0;
            if(keyAction.forward) forwardForce = 1
            if(keyAction.backward) forwardForce = -1
            if(keyAction.left) steerDirection = -1
            if(keyAction.right) steerDirection = 1
            let vquick = (keyAction.quick) ? 3 : 1;
            // 069/070_slide2_ball より
            if (forwardForce) {
                let vrate=1;
                let vvec = new BABYLON.Vector3(0, 1, 0);
                let vroty = vvec.applyRotationQuaternion(myMesh.rotationQuaternion);
                vroty = vroty.scale(vrate*forwardForce*vquick);
                myMesh._agg.body.applyAngularImpulse(vroty);
            }
            if (steerDirection) {
                let vrate = 0.15;
                let qRot = BABYLON.Quaternion.FromEulerAngles(0, steerDirection, 0);
                let vroty = BABYLON.Vector3.Up().applyRotationQuaternion(qRot);
                vroty = vroty.scale(vrate*steerDirection*vquick);
                myMesh._agg.body.applyAngularImpulse(vroty);
            }
            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }

        } else if (imymesh == 2) {
            // ボード(3) 転進に力＋加速度／エンジン概念＋ブレーキ
            let forwardForce = 0;
            if(keyAction.forward) forwardForce = 1
            if(keyAction.backward) forwardForce = -1
            let steerDirection = 0;
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
                // ゆっくりと減速させる
                if (myMesh._acc > 0) {
                    myMesh._acc -= 0.001;
                } else {
                    myMesh._acc += 0.01;
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
                myMesh._agg.body.setLinearDamping(myMesh._dampLdef);
                const vrate = 0.5;
                let quat = myMesh.rotationQuaternion;
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                vdir = vdir.scale(vrate*myMesh._acc);
                myMesh._agg.body.applyImpulse(vdir, myMesh.absolutePosition);
            }
            //
            if (steerDirection!=0) {
                let vrate = 2;
                let qRot = BABYLON.Quaternion.FromEulerAngles(0, steerDirection, 0);
                let vroty = BABYLON.Vector3.Up().applyRotationQuaternion(qRot);
                vroty = vroty.scale(vrate*steerDirection*vquick);
                myMesh._agg.body.applyAngularImpulse(vroty);
            }
            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }


        } else if (imymesh == 3) {
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

        } else {
console.log("under cunstrunction");
        }
    }

    let resetPostureMyMesh = function() {
        // 姿勢を正す
        if (imymesh == 1) {
            // カプセル
            myMesh.position.y += myMesh._height;
            myMesh._agg.body.applyImpulse(new BABYLON.Vector3(0, 40, 0), myMesh.absolutePosition);
            myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
            let eular = myMesh.rotationQuaternion.toEulerAngles()
            if (0 <= eular.z && eular.z <= R180) {
                myMesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, eular.y, R90);
            } else {
                myMesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, R180+eular.y, R90);
            }

        } else if (imymesh == 2) {
            // ボード
            myMesh.position.y += myMesh._height;
            myMesh._agg.body.applyImpulse(new BABYLON.Vector3(0, 140, 0), myMesh.absolutePosition);
            let eular = myMesh.rotationQuaternion.toEulerAngles()
            let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
            myMesh.rotationQuaternion = quat;
            myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));

        } else if (imymesh == 3) {
            // RaycastVehicle
            let vehicle = myMesh._vehicle;
            vehicle.doResetPosture();

        } else {
            // 立方体
            // クォータニオンからオイラー角を取得、方向（ヨー:z軸回転）だけを使い他は0として姿勢をリセットする
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

    if (imymesh == 3) {
        icamera = 5;
        changeCamera(icamera);
    } else if (imymesh == 1) {
        icamera = 3;
        changeCamera(icamera);
    } else {
        icamera = 1;
        changeCamera(icamera);
    }

    var map ={};
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

    let keyAction = {forward:0, back:0, right:0, left:0, brake:0, quick:0, reset:0, resetCooltime:0};
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
        keyAction.left = false;
        keyAction.right = false;
        if (map["a"] || map["ArrowLeft"]) {
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
                    icamera=(icamera+ncamera-1)%ncamera;
                } else {
                    icamera=(icamera+1)%ncamera;
                }
                changeCamera(icamera);
            }
            if (map["m"] || map["M"]) {
                cooltime_act = cooltime_actIni;
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
                +"(Arrow UP/w): Forward\n"
                +"(Arrow DOWN/s): Back\n"
                +"(Arrow Left/a): Left\n"
                +"(Arrow Right/d): Right\n"
                +"(space) : Brake\n"
                +"(enter) : Reset posture\n"
                +"(c/C) : Change Camera\n"
                +"(m/M) : Change Machine\n"
                +"h: show/hide this message";
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

// Babylon.js で物理演算(havok)：RaycastVehicleでカプセルを転がす

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

//let coursePath="textures/course/BoxySVG_test1_3_400x300.png"
// const goalPath ="textures/amiga.jpg";

let coursePath="../066/textures/BoxySVG_test1_3_400x300.png"
let goalPath ="../078/textures/amiga.jpg";
const SCRIPT_URL2 = "../105/Vehicle2.js";

// let coursePath="https://raw.githubusercontent.com/fnamuoo/webgl/main/066/textures/BoxySVG_test1_3_400x300.png";
// let goalPath="https://raw.githubusercontent.com/fnamuoo/webgl/main/078/textures/amiga.jpg";
// const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/105/Vehicle2.js";

let Vehicle2 = null;
await import(SCRIPT_URL2).then((obj) => { Vehicle2 = obj; });

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let camera = null, myMesh=null;
    let icamera = 3, ncamera = 6;
    let cameralist = [];
    var changeCamera = function(icamera) {
console.log("icamera=",icamera)
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
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
            camera.lockedTarget = myMesh;
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
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
                camera.heightOffset = 3;
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
    });

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // 地面
    const grndW=1000, grndH=100, grndD=1000, grndW_=grndW/2, grndH_=grndH/2, grndD_=grndD/2;
    const groundMesh = BABYLON.MeshBuilder.CreateBox("ground", { width:grndW, height:grndH, depth:grndD }, scene);
    groundMesh.position.y=-grndH_;
    groundMesh.material = new BABYLON.GridMaterial("", scene);
    groundMesh.material.majorUnitFrequency = 100; 
    groundMesh.material.minorUnitVisibility  = 0.2;
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.00001}, scene);


    // コース画像
    let crsW=200, crsH=150;
    const courseMesh = BABYLON.MeshBuilder.CreateGround("course", { width:crsW, height:crsH }, scene);
    courseMesh.position.y=0.01;
    courseMesh.material = new BABYLON.StandardMaterial("");
    courseMesh.material.diffuseTexture = new BABYLON.Texture(coursePath);
    courseMesh.material.diffuseTexture.hasAlpha = true;
    courseMesh.material.emissiveColor = BABYLON.Color3.White();
    courseMesh.material.alpha = 0.5;

    // コース画像(2)
    const courseMesh2 = BABYLON.MeshBuilder.CreateGround("course", { width:crsW, height:crsH }, scene);
    courseMesh2.position.y=0.01;
    courseMesh2.position.x=-crsW;
    courseMesh2.material = new BABYLON.StandardMaterial("");
    courseMesh2.material.diffuseTexture = new BABYLON.Texture(coursePath);
    courseMesh2.material.diffuseTexture.hasAlpha = true;
    courseMesh2.material.emissiveColor = BABYLON.Color3.Red();
    courseMesh2.material.alpha = 0.5;
    var groundAggregate = new BABYLON.PhysicsAggregate(courseMesh2, BABYLON.PhysicsShapeType.MESH, { mass: 0, friction: 100.0, restitution:0.00001}, scene);

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
        let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:10.0, restitution:0.01}, scene);
        trgMesh.physicsBody.disablePreStep = true;
        trgMesh.position.x += -30;
        trgMesh.position.z += 100;
        trgMesh.position.y += 0.01;
        trgMesh.physicsBody.disablePreStep = false;
    }

    // ----------------------------------------

    let imymesh = 6;
    let mymeshList = [1, //  2, // カプセル
                      3, 4,
                      5, 6,
                     ];
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


        if (imymesh == 1) {
            // カプセル
            let h = 3, r = 0.5;
            myMesh = BABYLON.MeshBuilder.CreateCapsule("me", {height: h, radius:r}, scene);
            myMesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, -R90);
            myMesh.material = new BABYLON.GradientMaterial("grad", scene);
            myMesh.material.topColor = new BABYLON.Color3(1, 1, 1);
            myMesh.material.bottomColor = new BABYLON.Color3(1, 0.6, 0.6);
            myMesh.material.emissiveColor = BABYLON.Color3.White();
            myMesh.material.diffuseColor = BABYLON.Color3.White();
            myMesh.material.smoothness = -0.1;
            myMesh.material.wireframe=1;
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.CAPSULE, { mass: 2.0, friction: 1.0, restitution:0.01}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh._p = myMesh.position.clone();
            myMesh._agg=myAgg;
            myMesh._height =0.1;
            myMesh.physicsBody.disablePreStep = false;
        }

        if (imymesh == 2) {
            // カプセル
            let h = 3, r = 0.5;
            myMesh = BABYLON.MeshBuilder.CreateCapsule("me", {height: h, radius:r}, scene);
            myMesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, -R90);
            myMesh.material = new BABYLON.GradientMaterial("grad", scene);
            myMesh.material.wireframe=1;
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.CAPSULE, { mass: 2.0, friction: 100.0, restitution:0.01}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh._p = myMesh.position.clone();
            myMesh._agg=myAgg;
            myMesh._height =0.1;
            myMesh.physicsBody.disablePreStep = false;
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
                // sideForce:2, //heavy drift
                // sideForce:4, //drift
                sideForce:6, // ski な感じ
                // sideForce:10, // power-drift & parallel turn
                radius:0.2,
                rotationMultiplier:0.1                   //How fast to spin the wheel
                // brakeForce:500
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
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
        }

        if (imymesh == 4) {
            // RaycastVehicle 荷重移動がわかりやすいように、やわらかめダンバー
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            const chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.emissiveColor = BABYLON.Color3.Yellow();
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
            // let wpx = 0.49+0.1, wpz = 0.7;
            let wpx = 0.49, wpz = 0.7;
            const wheelConfig = {
                positionLocal:new BABYLON.Vector3(wpx, 0, -wpz),//Local connection point on the chassis
                suspensionRestLength:0.83, // !!! 0.8,                //Rest length when suspension is fully decompressed
                suspensionForce:9000, // 10000,                   //Max force to apply to the suspension/spring 
                suspensionDamping:0.14, // 0.15,                  //[0-1] Damper force in percentage of suspensionForce
                suspensionAxisLocal:new BABYLON.Vector3(0,-1,0), //Direction of the spring
                axleAxisLocal:new BABYLON.Vector3(1,0,0),        //Axis the wheel spins around
                forwardAxisLocal:new BABYLON.Vector3(0,0,1),     //Forward direction of the wheel
                sideForcePositionRatio:0.1,              //[0-1]0 = wheel position, 1 = connection point 
                // sideForce:40,                            //Force applied to counter wheel drifting
                // sideForce:2, //heavy drift
                // sideForce:4, //drift
                sideForce:6, // ski な感じ
                // sideForce:10, // power-drift & parallel turn
                radius:0.2,
                rotationMultiplier:0.1,                   //How fast to spin the wheel
                brakeForce:200,  // def:500
            }
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Right rear
            wheelConfig.positionLocal.set(-wpx, 0, -wpz)//Left rear
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))
            wheelConfig.positionLocal.set(-wpx, 0, wpz)
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Left front
            wheelConfig.positionLocal.set(wpx, 0, wpz)
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
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
        }


        if (imymesh == 5) {
            // RaycastVehicle をモデルに球を転がす
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            const chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.alpha=0;
            // chassisMesh.material.emissiveColor = BABYLON.Color3.Blue();
            // chassisMesh.material.alpha=0.7;
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
            wheelMesh.material.wireframe=1;
            wheelMesh.material.alpha=0.05;
            // wheelMesh.material.diffuseColor = BABYLON.Color3.Gray();
            // wheelMesh.material.wireframe=1;
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
                // sideForce:2, //heavy drift
                // sideForce:4, //drift
                sideForce:6, // ski な感じ
                // sideForce:10, // power-drift & parallel turn
                radius:0.2,
                rotationMultiplier:0.1                   //How fast to spin the wheel
                // brakeForce:500
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
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR

            // 表示用メッシュ
            let myViewMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameter:2.0, segments:8 }, scene);
            myViewMesh.position.y = 0.5;
            myViewMesh.parent = chassisMesh;
            myViewMesh.material = new BABYLON.StandardMaterial("mat", scene);
            // myViewMesh.material.wireframe=1;
            myViewMesh.material.diffuseTexture = new BABYLON.Texture(goalPath, scene);
            myViewMesh._rad = 0;
            myMesh._meshView = myViewMesh;
            // myMesh._meshView.rotationQuaternion = myMesh._vehicle._wheelMeshes[0].rotationQuaternion;
            myMesh._meshView.rotationQuaternion = new BABYLON.Quaternion();
            scene.registerAfterRender(function() {
                if (imymesh == 5) {
                    let w = myMesh._vehicle.wheels[0]; // リアホイール
                    if (w.brake != 0) {
                        // ブレーキ
                        // 何もしない、回転を固定／回転させない
                    } else {
                         // 車のスピード（移動速度）、アクセルを 現在の位相に加える
                        myMesh._meshView._rad += myMesh._vehicle.speed*(0.02+Math.sign(w.force)*0.03);
                        myMesh._meshView.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(myMesh._meshView._rad, 0, 0);
                    }
                    let w2 = myMesh._vehicle.wheels[2]; // フロントホイール
                    if (w2.steering != 0) {
                        // ステアリングの角度を誇張（2.5倍）して軸をずらす
                        let qrot = BABYLON.Quaternion.FromEulerAngles(0, w2.steering*2.5, 0);
                        myMesh._meshView.rotationQuaternion = qrot.multiply(myMesh._meshView.rotationQuaternion);
                    }
                    // ------------------------------
                    // 下記と同じ
                    // myMesh._meshView.rotationQuaternion = myMesh._vehicle.wheels[0].transform.rotationQuaternion;
                    // ------------------------------
                    // // 回転軸がずれている
                    // // 実際の回転、 力／加速ではない
                    //  myMesh._meshView.rotationQuaternion = myMesh._vehicle._wheelMeshes[0].rotationQuaternion;
                }
            });
        }


        if (imymesh == 6) {
            // RaycastVehicle 荷重移動がわかりやすいように、やわらかめダンバー
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            const chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            // chassisMesh.material.emissiveColor = BABYLON.Color3.Yellow();
            chassisMesh.material.alpha=0.0;
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
            wheelMesh.material.alpha=0.05;
            wheelMeshes = [wheelMesh, wheelMesh.createInstance(1), wheelMesh.createInstance(2), wheelMesh.createInstance(3)]
            wheelMeshes.forEach(mesh => {
                mesh.rotationQuaternion = new BABYLON.Quaternion()
            })
            vehicle._wheelMeshes = wheelMeshes;
            // ホイール・サスペンションのパラメータ
            // let wpx = 0.49+0.1, wpz = 0.7;
            let wpx = 0.49, wpz = 0.7;
            const wheelConfig = {
                positionLocal:new BABYLON.Vector3(wpx, 0, -wpz),//Local connection point on the chassis
                suspensionRestLength:0.83, // !!! 0.8,                //Rest length when suspension is fully decompressed
                suspensionForce:9000, // 10000,                   //Max force to apply to the suspension/spring 
                suspensionDamping:0.14, // 0.15,                  //[0-1] Damper force in percentage of suspensionForce
                suspensionAxisLocal:new BABYLON.Vector3(0,-1,0), //Direction of the spring
                axleAxisLocal:new BABYLON.Vector3(1,0,0),        //Axis the wheel spins around
                forwardAxisLocal:new BABYLON.Vector3(0,0,1),     //Forward direction of the wheel
                sideForcePositionRatio:0.1,              //[0-1]0 = wheel position, 1 = connection point 
                // sideForce:40,                            //Force applied to counter wheel drifting
                // sideForce:2, //heavy drift
                // sideForce:4, //drift
                sideForce:6, // ski な感じ
                // sideForce:10, // power-drift & parallel turn
                radius:0.2,
                rotationMultiplier:0.1,                   //How fast to spin the wheel
                brakeForce:200,  // def:500
            }
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Right rear
            wheelConfig.positionLocal.set(-wpx, 0, -wpz)//Left rear
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))
            wheelConfig.positionLocal.set(-wpx, 0, wpz)
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Left front
            wheelConfig.positionLocal.set(wpx, 0, wpz)
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
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR

            // 表示用メッシュ
            // let h = 3, r = 0.5;
            let h = 2.5, r = 0.5;
            let myViewMesh = BABYLON.MeshBuilder.CreateCapsule("me", {height: h, radius:r}, scene);
            myViewMesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, -R90);
            myViewMesh.position.y = -0.1;
            myViewMesh.parent = chassisMesh;
            myViewMesh.material = new BABYLON.StandardMaterial("mat", scene);
            // myViewMesh.material.wireframe=1;
            myViewMesh.material.diffuseTexture = new BABYLON.Texture(goalPath, scene);
            myViewMesh._rad = 0;
            myMesh._meshView = myViewMesh;
            // myMesh._meshView.rotationQuaternion = myMesh._vehicle._wheelMeshes[0].rotationQuaternion;
            myMesh._meshView.rotationQuaternion = new BABYLON.Quaternion();
            scene.registerAfterRender(function() {
                if (imymesh == 6) {
                    let w = myMesh._vehicle.wheels[0]; // リアホイール
                    let q = BABYLON.Quaternion.FromEulerAngles(0, 0, -R90);

                    if (w.brake != 0) {
                        // ブレーキ
                        // 何もしない、回転を固定／回転させない
                    } else {
                         // 車のスピード（移動速度）、アクセルを 現在の位相に加える
                        myMesh._meshView._rad += myMesh._vehicle.speed*(0.03+Math.sign(w.force)*0.05);
                        myMesh._meshView.rotationQuaternion = q.multiply(BABYLON.Quaternion.FromEulerAngles(0, myMesh._meshView._rad, 0));
                    }
                    let w2 = myMesh._vehicle.wheels[2]; // フロントホイール
                    if (w2.steering != 0) {
                        // ステアリングの角度を誇張（1.3倍）して軸をずらす
                        let qrot = BABYLON.Quaternion.FromEulerAngles(0, w2.steering*1.3, 0);
                        myMesh._meshView.rotationQuaternion = qrot.multiply(myMesh._meshView.rotationQuaternion);
                    }
                }
            });
        }

        if (typeof(myMesh._vehicle) === 'undefined') {
            myMesh._vehicle = null;
        }

        return myMesh
    }


    let updateMyMesh = function() {

        if (imymesh == 1) {
            // カプセル
            let forwardForce = 0;
            let steerDirection = 0;
            if(keyAction.forward) forwardForce = 1
            if(keyAction.backward) forwardForce = -1
            if(keyAction.left) steerDirection = -1
            if(keyAction.right) steerDirection = 1
            let vquick = (keyAction.quick) ? 3 : 1;
            if (forwardForce) {
                let vrate=0.1;
                let vvec = new BABYLON.Vector3(0, 1, 0);
                let vroty = vvec.applyRotationQuaternion(myMesh.rotationQuaternion);
                vroty = vroty.scale(vrate*forwardForce*vquick);
                myMesh._agg.body.applyAngularImpulse(vroty);
            }
            if (steerDirection) {
                let vrate = 0.6;
                let qRot = BABYLON.Quaternion.FromEulerAngles(0, steerDirection, 0);
                let vroty = BABYLON.Vector3.Up().applyRotationQuaternion(qRot);
                vroty = vroty.scale(vrate*steerDirection*vquick);
                myMesh._agg.body.applyAngularImpulse(vroty);
            }
            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }
        }

        if (imymesh == 2) {
            // カプセル
            let forwardForce = 0;
            let steerDirection = 0;
            if(keyAction.forward) forwardForce = 1
            if(keyAction.backward) forwardForce = -1
            if(keyAction.left) steerDirection = -1
            if(keyAction.right) steerDirection = 1
            let vquick = (keyAction.quick) ? 3 : 1;
            if (forwardForce) {
                let vrate=0.5; // 0.1;
                let vvec = new BABYLON.Vector3(0, 1, 0);
                let vroty = vvec.applyRotationQuaternion(myMesh.rotationQuaternion);
                vroty = vroty.scale(vrate*forwardForce*vquick);
                myMesh._agg.body.applyAngularImpulse(vroty);
            }
            if (steerDirection) {
                let vrate = 2; // 0.6;
                let qRot = BABYLON.Quaternion.FromEulerAngles(0, steerDirection, 0);
                let vroty = BABYLON.Vector3.Up().applyRotationQuaternion(qRot);
                vroty = vroty.scale(vrate*steerDirection*vquick);
                myMesh._agg.body.applyAngularImpulse(vroty);
            }
            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }
        }

        // if ((imymesh == 3) || (imymesh == 4)) {
        if ((3 <= imymesh) && (imymesh <= 6)) {
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
            if (vehicle._driveSystem == 1) {
                // FF
                vehicle.wheels[2].force = forwardForce*vehicle._maxVehicleForce
                vehicle.wheels[3].force = forwardForce*vehicle._maxVehicleForce
            } else if (vehicle._driveSystem == 2) {
                // FR
                vehicle.wheels[0].force = forwardForce*vehicle._maxVehicleForce
                vehicle.wheels[1].force = forwardForce*vehicle._maxVehicleForce
            } else {
                 // 4WD
                vehicle.wheels[0].force = forwardForce*vehicle._maxVehicleForce
                vehicle.wheels[1].force = forwardForce*vehicle._maxVehicleForce
                vehicle.wheels[2].force = forwardForce*vehicle._maxVehicleForce
                vehicle.wheels[3].force = forwardForce*vehicle._maxVehicleForce
            }
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
        }

    }

    let resetPostureMyMesh = function() {
        if (imymesh <= 2) {
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
        // } else if ((imymesh == 3) || (imymesh == 4)) {
        } else if ((3 <= imymesh) && (imymesh <= 6)) {
            // RaycastVehicle
            let vehicle = myMesh._vehicle;
            vehicle.doResetPosture();
        }

    }

    createMyMesh();

    changeCamera(icamera);

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
            // if (map["c"]) {
            //     cooltime_act = cooltime_actIni;
            //     icamera=(icamera+1)%ncamera;
            //     changeCamera(icamera);
            // }
            // if (map["m"]) {
            //     cooltime_act = cooltime_actIni;
            //     imymesh=(imymesh+1)%nmymesh;
            //     createMyMesh();
            //     changeCamera(icamera);
            // }
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

    return scene;
}

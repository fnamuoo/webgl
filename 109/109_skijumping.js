// Babylon.js で物理演算(havok)：移動体とカメラ

//  - カーソル上/(w)              .. 前進
//  - カーソル下/(s)              .. 後進
//  - カーソル右左/(a,d)          .. 旋回
//  - r                           .. スタート（ジャンプ台の頂上に移動）
//  - space                       .. ブレーキ
//  - enter                       .. ジャンプ（姿勢を正す）
//  - (c/C[=shift+c])             .. カメラ変更
//  - (n/N[=shift+n])             .. コース（ジャンプ台）変更
//  - (m/M[=shift+m])             .. スタイル（スキー／スノボ）変更


const R5 = Math.PI/36;
const R90 = Math.PI/2;
const R180 = Math.PI;
const R270 = Math.PI*3/2;
const R360 = Math.PI*2;


// const SCRIPT_URL2 = "./Vehicle_draft2.js";
// const myTextPath = "../096/textures/pipo-charachip007_.png"; // 男の子
//const lineArrowPath = 'textures/arrow_.png';

const SCRIPT_URL2 = "../105/Vehicle2.js";
const myTextPath = "../096/textures/pipo-charachip007_.png"; // 男の子
const lineArrowPath = '../099/textures/arrow_.png';

// const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/105/Vehicle2.js";
// const myTextPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main//096/textures/pipo-charachip007_.png"; // 男の子
// const lineArrowPath = 'https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/arrow_.png';

let Vehicle2 = null;
await import(SCRIPT_URL2).then((obj) => { Vehicle2 = obj; });

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let camera = null, myMesh=null;
    let icamera = 6, icameralist = [0, 6];
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

            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;

        }

        if (icamera == 6) {
            // 車体とカメラを固定（進行軸が同じ）。地形の傾き（ピッチ）に影響させない
            // ＋メッシュのロールに追従すさせる
            camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }

        if (icamera >= 1 && myMesh!=null) {
            camera.lockedTarget = myMesh;
        }
    }
    scene.onBeforeRenderObservable.add((scene) => {
        if (icamera == 6) {
            let quat = myMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(0, 1, -5);
            vdir = vdir.applyRotationQuaternion(quat);
            camera.position = myMesh.position.add(vdir);
            // 上方向のベクトルを指定することで、メッシュのロールに追従すさせる
            camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        }
    });

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // --------------------

    let meshAggInfo = []; // mesh, agg;
    let pStart = new BABYLON.Vector3(0, 0, 0), pStart2 = new BABYLON.Vector3(0, 0, 0);

    let istage=0;
    let istagelist=[0, 1, 2];

    let createStage = function(istage) {
console.log("createStage istage=", istage);
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        if (istage == 0) {
            {
                // 地面
                const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                groundMesh.material.majorUnitFrequency = 100; 
                groundMesh.material.minorUnitVisibility  = 0.2;
                let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
                meshAggInfo.push([groundMesh,groundAggregate]);
            }
            // リボンによる曲面
            {
                // ベース
                let rootPath = [];
                let nxmin = -50, nxmax = 51, nzmin = 0, nzmax = 71, gridsize = 1;
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        let y = ((iz-nzmin)**2)*0.0014;
                        if (y < 0) y = 0;
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = new BABYLON.Color3(0.85, 0.90, 0.85);
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            {
                // ジャンプ台
                let rootPath = [];
                let nxmin = -5, nxmax = 5, nzmin = 0, nzmax = 51, gridsize = 1;
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        let y = ((iz-nzmin)**2)*0.00099;
                        if (y < 0) y = 0;
                        y += 1;
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = BABYLON.Color3.Red();
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            let y = 2.5, z = 49;
            pStart = new BABYLON.Vector3(0, y, z);
            pStart2 = new BABYLON.Vector3(0, y, z-1);
        }

        if (istage == 1) {
            {
                // 地面
                const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                groundMesh.material.majorUnitFrequency = 100; 
                groundMesh.material.minorUnitVisibility  = 0.2;
                let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
                meshAggInfo.push([groundMesh,groundAggregate]);
            }
            // リボンによる曲面
            {
                // ベース
                let rootPath = [];
                let nxmin = -50, nxmax = 51, nzmin = 0, nzmax = 121, gridsize = 1;
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        let y = ((iz-nzmin)**2)*0.00150;
                        if (y < 0) y = 0;
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = new BABYLON.Color3(0.85, 0.90, 0.85);
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            {
                // ジャンプ台
                let rootPath = [];
                let nxmin = -5, nxmax = 5, nzmin = 0, nzmax = 101, gridsize = 1;
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                     // let y = ((iz-nzmin)**2)*0.000999;
                        let y = ((iz-nzmin)**2)*0.000995;
                        if (y < 0) y = 0;
                        y += 5;
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = BABYLON.Color3.Red();
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            let y = 15.0, z = 101;
            pStart = new BABYLON.Vector3(0, y, z);
            pStart2 = new BABYLON.Vector3(0, y-0.3, z-1);
        }

        if (istage == 2) {
            {
                // 地面
                const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                groundMesh.material.majorUnitFrequency = 100; 
                groundMesh.material.minorUnitVisibility  = 0.2;
                let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
                meshAggInfo.push([groundMesh,groundAggregate]);
            }
            // リボンによる曲面
            {
                // ベース
                let rootPath = [];
                let nxmin = -50, nxmax = 51, nzmin = 0, nzmax = 221, gridsize = 1;
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        let y = ((iz-nzmin)**2)*0.00213;
                        if (y < 0) y = 0;
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = new BABYLON.Color3(0.85, 0.90, 0.85);
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            {
                // ジャンプ台
                let rootPath = [];
                let nxmin = -5, nxmax = 5, nzmin = 0, nzmax = 201, gridsize = 1;
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        let y = ((iz-nzmin)**2)*0.002;
                        if (y < 0) y = 0;
                        y += 5;
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = BABYLON.Color3.Red();
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            let y = 85.5, z = 201;
            pStart = new BABYLON.Vector3(0, y, z);
            pStart2 = new BABYLON.Vector3(0, y-1, z-1);
        }
    }

    let imymesh = 4;
    let mymeshList = [3, 4];
    let createMyMesh = function() {
        if ((myMesh!=null) && (myMesh._vehicle._wheelMeshes.length>0)) {
            for (let m of myMesh._vehicle._wheelMeshes) { m.dispose(); }
            delete  myMesh._vehicle;
            myMesh._vehicle = null;
        }
        if (myMesh!=null) { myMesh.dispose() }

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

        if (imymesh == 3) {
            // RaycastVehicle + ボード
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            let chassisMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: 1.0, diameterY: 0.5, diameterZ: 4.0, segments: 8 }, scene); // 093_board
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.emissiveColor = BABYLON.Color3.Blue();
            chassisMesh.material.alpha=0.7;
            chassisMesh.position.y = 5
            chassisMesh.position.x = 0
            chassisMesh.rotationQuaternion = new BABYLON.Quaternion()
            addCharPanel(myTextPath, chassisMesh, 1.1, 0.01);
            chassisMesh._planeFB.material.alpha=0.1; // ボード上のキャラの横方向のパネルは透明に
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
            // wheelMesh.material.diffuseColor = BABYLON.Color3.Gray();
            // wheelMesh.material.wireframe=1;
            wheelMesh.material.alpha = 0;
            let wheelMeshes = [wheelMesh, wheelMesh.createInstance(1), wheelMesh.createInstance(2), wheelMesh.createInstance(3)]
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
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
        }

        if (imymesh == 4) {
            // RaycastVehicle + スキー板
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            const chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.alpha=0;
            chassisMesh.position.y = 5;
            chassisMesh.position.x = 0;
            chassisMesh.rotationQuaternion = new BABYLON.Quaternion()
            addCharPanel(myTextPath, chassisMesh, 0.5, 0.01);
            chassisMesh._planeFB.material.alpha=0.1; // ボード上のキャラの横方向のパネルは透明に
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
            wheelMesh.material.alpha = 0;
            let wheelMeshes = [wheelMesh, wheelMesh.createInstance(1), wheelMesh.createInstance(2), wheelMesh.createInstance(3)]
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
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
            // 表示用メッシュ／スキー板
            let myViewMesh = BABYLON.MeshBuilder.CreateSphere("skiboard", { diameterX: 0.3, diameterY: 0.1, diameterZ: 4.0, segments: 8 }, scene);
            myViewMesh.material = new BABYLON.StandardMaterial("mat", scene);
            let myViewMesh2 = myViewMesh.clone();
            myViewMesh.position.x = -0.3;
            myViewMesh.position.y = -0.5;
            myViewMesh.parent = chassisMesh;
            myViewMesh2.position.x = 0.3;
            myViewMesh2.position.y = -0.5;
            myViewMesh2.parent = chassisMesh;
        }

        return myMesh
    }

    let updateMyMesh = function() {
        let forwardForce, steerDirection, roll;

        if ((imymesh == 3) ||(imymesh == 4)) {
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
                resetMyMeshPosture();
                keyAction.reset = 0;
                jumpPList = [];
            }
        } else {
            console.log("under cunstrunction");
        }

    }

    let resetMyMeshPosture = function() {
        if ((imymesh == 3) ||(imymesh == 4)) {
            // RaycastVehicle(2)
            let vehicle = myMesh._vehicle;
            vehicle.doResetPosture();
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

    let recoardState = 0; // ジャンプ飛距離のレコード 0:準備, 1:開始, 2:終了
    let distJumpList = [[11, 10, 9],
                        [43, 40, 35],
                        [72, 70, 65]];
    let jumpPList = [], ijumpRec = 0, jumpRecStep = 10;

    let resetMyPosi = function () {
        if (myMesh==null) {
            return;
        }
        myMesh.position = pStart.clone();
        myMesh.position.y += 2;
        let p1 = pStart.clone();
        let p3 = pStart2.clone();
        p3.subtractInPlace(p1);
        myMesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
        let vrot = Math.atan2(p3.x, p3.z);
        myMesh.rotate(BABYLON.Vector3.Up(), vrot);
        let vpitch = Math.atan2(p3.z, p3.y) +R90;
        myMesh.rotate(BABYLON.Vector3.Left(), vpitch);
        //  myMesh.rotate(BABYLON.Vector3.Forward(), vpitch);
        myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
        // ジャンプ飛距離のレコード リセット
        recoardState = 0;
    }

    scene.registerAfterRender(function() {
        if (recoardState == 0) {
            // ジャンプ前
            if (myMesh.position.z < -1.5) {
                recoardState = 1;
                ijumpRec = 0
                jumpPList.push(myMesh.position.clone());
            }
        } else if (recoardState == 1) {
            // ジャンプ中
            ijumpRec += 1
            if (ijumpRec == jumpRecStep) {
                ijumpRec = 0;
                jumpPList.push(myMesh.position.clone());
            }

            if (myMesh._vehicle.nWheelsOnGround > 0) {
                // 着地
                recoardState = 2;
                let _distJump = -(myMesh.position.z);
                _distJump = Math.floor(_distJump*100)/100;
                //console.log("len=", _distJump);
                if (distJumpList[istage][0] < _distJump) {
                    setText2("Cong!!! 1st prize! Best Recoard!!  " +_distJump + " [m]");
                } else if (distJumpList[istage][1] < _distJump) {
                    setText2("Great!! 2nd prize! " +_distJump + " [m]");
                } else if (distJumpList[istage][2] < _distJump) {
                    setText2("Good!   3rd prize! " +_distJump + " [m]");
                } else {
                    setText2("" +_distJump + " [m]");
                    return;
                }
                let tlist = distJumpList[istage];
                
                function compareFunc(a, b) {
                    return b - a;
                }
                tlist.push(_distJump);
                tlist.sort(compareFunc);
                tlist.pop();
                updateRecoard();

                distJumpList[istage] = tlist;

                if (ijumpRec > jumpRecStep/2) {
                    jumpPList.push(myMesh.position.clone());
                }
                drawJumpLine();
            }
        }
    })


    function drawLine(name, width, points) {
        const colors = []
        const color1 = BABYLON.Color3.Green()
        const color2 = BABYLON.Color3.Yellow()
        const color3 = BABYLON.Color3.Red()
        let n = points.length;
        let n50=Math.floor(n*0.5), n80=Math.floor(n*0.8);
        for (let i=0;i<n50;i++) {
            colors.push(color1)
        }
        for (let i=n50;i<n80;i++) {
            colors.push(color2)
        }
        for (let i=n80;i<n;i++) {
            colors.push(color3)
        }
        const line = BABYLON.CreateGreasedLine(name, {
            points,
            updatable: true
        }, {
            colorMode: BABYLON.GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY,
            width,
            useColors: true,
            colors
        })
        return line
    }

    let meshJumpLine = null;
    function clearJumpLine() {
        if (meshJumpLine != null) {
            meshJumpLine.dispose();
        }
        meshJumpLine = null;
    }
    const lineTexture = new BABYLON.Texture(lineArrowPath, scene)
    lineTexture.hasAlpha = true
    function drawJumpLine() {
        clearJumpLine();
        if (jumpPList.length == 0) {
            return;
        }
        const points = BABYLON.Curve3.CreateCatmullRomSpline(jumpPList, 1000 / jumpPList.length).getPoints()
        const length = BABYLON.GreasedLineTools.GetLineLength(points)
        let mesh = drawLine("st1mesh", 1, points)
            mesh.material.emissiveTexture = lineTexture
            mesh.material.diffuseTexture = lineTexture
            lineTexture.uScale = length / 2
        meshJumpLine = mesh;
    }
    scene.onBeforeRenderObservable.add(() => {
        const animRatio = scene.getAnimationRatio()
        lineTexture.uOffset -= 0.01 * animRatio
    })

    let getSpeed = function() {
        let speed = 0;
        // if (imymesh == 3) {
        if ((imymesh == 3) ||(imymesh == 4)) {
            speed = myMesh._vehicle.speed;
        } else {
            let vec = myMesh._agg.body.getLinearVelocity();
            speed = vec.length();
        }
        return speed;
    }

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
        if (map["z"]) {
            {
                console.log("p=",[myMesh.position.x, myMesh.position.y, myMesh.position.z]);
            }
        }
        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["Enter"]) {
                cooltime_act = cooltime_actIni*10; // 空中で再度ジャンプしないようにクールタイム多め
                keyAction.reset = true;
            }
            if (map["c"] || map["C"]) {
                cooltime_act = cooltime_actIni;
                let i = icameralist.indexOf(icamera);
                console.assert(i >= 0);
                if (map["C"] || map["shift"]) {
                    i = (i+icameralist.length-1) % icameralist.length;
                } else {
                    i = (i+1) % icameralist.length;
                }
                icamera=icameralist[i];
                changeCamera(icamera);
            }
            if (map["n"] || map["N"] || map["p"] || map["P"] || map["b"] || map["B"]) {
                cooltime_act = cooltime_actIni;
                if ((map["N"] || map["p"] || map["b"]) || (map["shift"] && (map["n"]))) {
                    let i = istagelist.indexOf(istage);
                    console.assert(i >= 0);
                    i = (i+istagelist.length-1)%istagelist.length;
                    istage = istagelist[i];

                } else {
                    let i = istagelist.indexOf(istage);
                    console.assert(i >= 0);
                    i = (i+1)%istagelist.length;
                    istage = istagelist[i];
                }
                createStage(istage);
                clearJumpLine();
                resetMyPosi();
                updateRecoard();
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
                resetMyPosi();
            }
            if (map["r"]) { // 'r'
                cooltime_act = cooltime_actIni;
                resetMyPosi();
            }
            if ((myMesh._vehicle != null) && (map["d"] || map["D"])) {
                cooltime_act = cooltime_actIni;
                if (map["D"] || map["shift"]) {
                    myMesh._vehicle._driveSystem = (myMesh._vehicle._driveSystem+2)%3;
                } else {
                    myMesh._vehicle._driveSystem = (myMesh._vehicle._driveSystem+1)%3;
                }
                if (myMesh._vehicle._driveSystem == 1) {
                    console.log("FF")
                    setText2("FF");
                } else if (myMesh._vehicle._driveSystem == 2) {
                    console.log("FR")
                    setText2("FR");
                } else {
                    console.log("4WD")
                    setText2("4WD");
                }
            }
            if (map["h"]) {
                cooltime_act = cooltime_actIni;
                changeUsageView();
            }
        }

    });

    scene.onBeforeRenderObservable.add(()=>{
        updateMyMesh();

        let speed = getSpeed();
        setText1(speed);
    })

    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // ------------------------------
    // スピードメーター（上部中央）
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Ready!";
    // text1.text = "";
    text1.color = "white";
    text1.fontSize = 24; // 24;
    text1.height = "36px";
    text1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text1);

    let setText1 = function(val) {
        val = Math.floor(val*3.6) // [m/s]を [km/h]に直す
        text1.text = "" + val + " [km/h]"
    }

    // ----------------------------------------
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
                +"(r) : Start(Go to TOP position of JUMP stage)\n"
                +"(space) : Brake\n"
                +"(enter) : Jump/Reset posture\n"
                +"(c/C) : Change Camera\n"
                +"(n/N) : Change Stage\n"
                +"(m/M) : Change Style\n"
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


    // ------------------------------
    // メッセージ（数秒後にフェードアウト）
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Ready!";
    text2.color = "white";
    text2.fontSize = 24; // 24;
    text2.height = "36px";
    // text2.zIndex = -9; // 背面に隠しておく
    // // text2.top = "-20px";
    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
//    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    advancedTexture.addControl(text2);

    let clearText2 = function() {
        text2.text = "";
    }

    let setText2 = function(val) {
        text2.text = "" + val;
        setTimeout(clearText2, 5000);
    }

    // ------------------------------
    let guiRecordRect = new BABYLON.GUI.Rectangle();
    {
        guiRecordRect.adaptWidthToChildren = true;
        // guiRecordRect.width = "140px";
        // guiRecordRect.height = "110px";
        guiRecordRect.width = "150px";
        guiRecordRect.height = "110px";
        guiRecordRect.cornerRadius = 5;
        guiRecordRect.color = "Orange";
        guiRecordRect.thickness = 4;
        guiRecordRect.background = "green";
        guiRecordRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        guiRecordRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(guiRecordRect);    
        let grid = new BABYLON.GUI.Grid();
        grid.width = 0.98;
        grid.height = 0.98;
        grid.addRowDefinition(1);
        grid.addRowDefinition(22, true);
        guiRecordRect.addControl(grid); 
        // グリッド内の要素の登録
        {
            let text1 = new BABYLON.GUI.TextBlock();
            text1.text = "1st: 99.99 \n"
                +"2nd: 99.99\n"
                +"3rd:99.99";
            text1.color = "white";
            text1.width = "140px";
            text1.fontSize = 20;
            text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
            text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
            // text1.paddingTop = 6;
            text1.paddingTop = "12px";
            text1.paddingLeft = 3;
            grid.addControl(text1, 0, 0);
            guiRecordRect._text1 = text1;
        }
    }
    let updateRecoard = function () {
        guiRecordRect._text1.text =
            "1ST: " + distJumpList[istage][0] + " \n"
            +"2ND: " + distJumpList[istage][1] + "\n"
            +"3RD: " + distJumpList[istage][2];
    }


    // ----------------------------------------
    createStage(istage);
    clearJumpLine();
    createMyMesh();
    changeCamera(icamera);
    resetMyPosi();
    updateRecoard();

    return scene;
}


// ----------------------------------------------------------------------

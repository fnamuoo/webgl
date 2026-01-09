// Babylon.js で物理演算(havok)：無限に広がった地形を作る（暫定版）

//  - カーソル上下                .. 前後移動
//  - カーソル右左/(a,d)          .. 旋回
//  - Ctrl＋カーソル右左/(a,d)    .. 急旋回
//  - (q,e)                       .. 上昇下降
//  - space                       .. ブレーキ
//  - r                           .. スタート位置に移動
//  - (c/C[=shift+c])             .. カメラ変更
//  - (m/M[=shift+m])             .. 移動体（ボード／車）変更
//  - h              .. ヘルプ表示



// const SCRIPT_URL2 = "./Vehicle_draft2.js";
// let skyboxTextPath2 = "textures/skybox2";
// let skyboxTextPath5 = "textures/TropicalSunnyDay";
// let skyboxTextPath6 = "textures/toySky";

// --------------------------------------------
// // for local
const SCRIPT_URL2 = "../105/Vehicle2.js";
const skyboxTextPath2 = "../111/textures/skybox2";
const skyboxTextPath5 = "../111/textures/TropicalSunnyDay";
const skyboxTextPath6 = "../116/textures/toySky";

// --------------------------------------------
// for PlayGround

// const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/105/Vehicle2.js";
// let skyboxTextPath2 = "textures/skybox2";
// let skyboxTextPath5 = "textures/TropicalSunnyDay";
// const skyboxTextPath6 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/116/textures/toySky";

// ======================================================================
const skyboxTextPathList = [skyboxTextPath2,skyboxTextPath5,skyboxTextPath6];
// let skyboxType=-1; // -1:rand, 0-4: 固定
let skyboxType=1; // -1:rand, 0-2: 固定


let Vehicle2 = null;
await import(SCRIPT_URL2).then((obj) => { Vehicle2 = obj; });

const R90 = Math.PI/2;

let istage=0;

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let camera = null, myMesh=null;
    let icamera = 6, ncamera = 8;
    let icameralist = [0, 1, 2, 6];
    // let cameralist = [];
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

            // // while (scene.activeCameras.length > 0) {
            // //     scene.activeCameras.pop();
            // // }
            // // scene.activeCameras.push(camera);
            // // for (let camera_ of cameralist) {
            // //     camera_.dispose();
            // // }
            // // camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);

            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;

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
        if (icamera == 6) {
            // // 車体とカメラを固定（進行軸が同じ）して地形が変化（斜面でも地面にカメラが埋まらない）
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
        // if (imymesh == 0) {
        //     return;
        // }
        // if (icamera == 1) {
        //     let quat = myMesh.rotationQuaternion;
        //     camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        // }
        // if (icamera == 2) {
        //     let quat = myMesh.rotationQuaternion;
        //     camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        // }
        if (icamera == 6) {
            let quat = myMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(0, 1, -5);
            vdir = vdir.applyRotationQuaternion(quat);
            camera.position = myMesh.position.add(vdir);
            camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        }
    })

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    if (1) {
        // 地面
        const grndW=1000, grndH=1000; // , grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
        var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
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
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }

    let pStart  = new BABYLON.Vector3(10, 5, 10);
    let pStart2 = new BABYLON.Vector3(10, 5, 11);


    // 100x100ブロックを 3x3に並べる
    // [0][0]  [0][1]  [0][2]
    // [1][0]  [1][1]  [1][2]
    // [2][0]  [2][1]  [2][2]
    let cbx = 0, cbz = 0, nbx = 3, nbz = 3, ibxs=-1, ibzs=-1;
    let meshAggInfo = []; // mesh, agg;
    let nb = new BABYLON.NoiseBlock();
    const nbvzero = new BABYLON.Vector3(0,0,0);
    let gridratio = 1, nbscale = 0.05/gridratio;
    let blockSize = 100, blockDiv = 100, blockDivP = blockDiv+1;

    // １ブロック分の形状データ作成
    let createBlockOrg = function(ibx, ibz) {
        let padx = blockSize*ibx, padz = blockSize*ibz;
        let gridSize = blockSize/blockDiv;
        let pp = new BABYLON.Vector3(0, 0, 0);
        let fdata = [];
        for (let iz = 0; iz < blockDivP; ++iz) {
            let z = iz*gridSize;
            let z2 = z + padz;
            let fline = []
            for (let ix = 0; ix < blockDivP; ++ix) {
                let x = ix*gridSize;
                let x2 = x + padx;
                pp.set(x2,z2,0);
                let y = nb.noise(8, 0.5, pp, nbvzero, nbscale);
                y = (y-0.16)**2 * 20 -2;
                y = Math.max(y, 0);
                fline.push(new BABYLON.Vector3(x, y, z));
            }
            fdata.push(fline);
        }
        return fdata;
    }
    let Color3_Random = function() {
        let c = BABYLON.Color3.Random();
        c.r = Math.max(c.r, 0.5);
        c.g = Math.max(c.g, 0.5);
        c.b = Math.max(c.b, 0.5);
        return c;
    }

    let createBlockIni = function() {
        // 最初のブロック(3x3)の作成
        for (let ibz =0; ibz < nbz; ++ibz) {
            let iibz = ibz+cbz+ibzs, padz = blockSize*(ibz+ibzs);
            for (let ibx =0; ibx < nbx; ++ibx) {
                let iibx = ibx+cbx+ibxs, padx = blockSize*(ibx+ibxs);
                let fdata = createBlockOrg(iibx, iibz);
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray: fdata, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                trgMesh.position.set(padx, 0, padz);
                trgMesh.material = new BABYLON.StandardMaterial("mat", scene);
                trgMesh.material.diffuseColor = Color3_Random();
                trgMesh.material.wireframe = true;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh, trgAgg]);
            }
        }
    }

    let asyncUpdateBlock = async function(padx, padz, jbx, jbz, delMesh, delAgg, ima) {
        // setTimeout() でイベントループ分割
        setTimeout(() => {
            delMesh.dispose();
            delAgg.dispose();
            let fdata = createBlockOrg(jbx, jbz);
            let trgMesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray: fdata, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgMesh.position.set(padx, 0, padz);
            trgMesh.material = new BABYLON.StandardMaterial("mat", scene);
            trgMesh.material.diffuseColor = Color3_Random();
            trgMesh.material.wireframe = true;
            let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
            trgMesh.physicsBody.disablePreStep = false;
            meshAggInfo[ima] = [trgMesh, trgAgg];
        }, 0);
    }

    scene.registerAfterRender(function() {
        let mbx = 0, mbz = 0;
        if (myMesh.position.x < 0) {
            mbx = -1, mbz = 0;
            cbx += mbx;
            cbz += mbz;
            console.log("-- call reset map ----------");
            {
                // 非同期処理
                for (let ibz =0; ibz < nbz; ++ibz) {
                    let ibz_nbx = ibz*nbx;
                    let delMesh = meshAggInfo[2+ibz_nbx][0];
                    let delAgg = meshAggInfo[2+ibz_nbx][1];
                    meshAggInfo[2+ibz_nbx] = meshAggInfo[1+ibz_nbx];
                    meshAggInfo[2+ibz_nbx][0].position.x += blockSize;
                    meshAggInfo[1+ibz_nbx] = meshAggInfo[0+ibz_nbx];
                    meshAggInfo[1+ibz_nbx][0].position.x += blockSize;
                    if (ibz == 1) {
                        if ((icamera == 1) || (icamera == 2)) {
                            camera.position.x += blockSize*1.1;
                        }
                        myMesh.position.x += blockSize;
                    }
                    let padx = -blockSize, padz = blockSize*(ibz+ibzs), jbx = cbx+ibxs, jbz = ibz+cbz+ibzs, ima=0+ibz_nbx;
                    {
                        asyncUpdateBlock(padx, padz, jbx, jbz, delMesh, delAgg, ima).then(value => {});
                    }
                }
            }

        } else if (myMesh.position.x > blockSize) {
            mbx = 1, mbz = 0;
            cbx += mbx;
            cbz += mbz;
            {
                for (let ibz =0; ibz < nbz; ++ibz) {
                    let ibz_nbx = ibz*nbx;
                    let delMesh = meshAggInfo[0+ibz_nbx][0];
                    let delAgg = meshAggInfo[0+ibz_nbx][1];
                    meshAggInfo[0+ibz_nbx] = meshAggInfo[1+ibz_nbx];
                    meshAggInfo[0+ibz_nbx][0].position.x += -blockSize;
                    meshAggInfo[1+ibz_nbx] = meshAggInfo[2+ibz_nbx];
                    meshAggInfo[1+ibz_nbx][0].position.x += -blockSize;
                    if (ibz == 1) {
                        if ((icamera == 1) || (icamera == 2)) {
                            camera.position.x += -blockSize*1.1;
                        }
                        myMesh.position.x += -blockSize;
                    }
                    let padx = blockSize, padz = blockSize*(ibz+ibzs), jbx = cbx+ibxs+nbx-1, jbz = ibz+cbz+ibzs, ima=2+ibz_nbx;
                    {
                        asyncUpdateBlock(padx, padz, jbx, jbz, delMesh, delAgg, ima).then(value => {});
                    }
                }
            }

        } else if (myMesh.position.z < 0) {
            mbx = 0, mbz = -1;
            cbx += mbx;
            cbz += mbz;
            let nbx2 = nbx*2;
            {
                for (let ibx =0; ibx < nbx; ++ibx) {
                    let delMesh = meshAggInfo[ibx+nbx2][0];
                    let delAgg = meshAggInfo[ibx+nbx2][1];
                    meshAggInfo[ibx+nbx2] = meshAggInfo[ibx+nbx];
                    meshAggInfo[ibx+nbx2][0].position.z += blockSize;
                    meshAggInfo[ibx+nbx] = meshAggInfo[ibx];
                    meshAggInfo[ibx+nbx][0].position.z += blockSize;
                    if (ibx == 1) {
                        if ((icamera == 1) || (icamera == 2)) {
                            camera.position.z += blockSize*1.1;
                        }
                        myMesh.position.z += blockSize;
                    }
                    let padx = blockSize*(ibx+ibxs), padz = -blockSize, jbx = ibx+cbx+ibxs, jbz = cbz+ibzs, ima = ibx;
                    {
                        asyncUpdateBlock(padx, padz, jbx, jbz, delMesh, delAgg, ima).then(value => {});
                    }
                }
            }

        } else if (myMesh.position.z > blockSize) {
            mbx = 0, mbz = 1;
            cbx += mbx;
            cbz += mbz;
            let nbx2 = nbx*2;
            {
                for (let ibx =0; ibx < nbx; ++ibx) {
                    let delMesh = meshAggInfo[ibx][0];
                    let delAgg = meshAggInfo[ibx][1];
                    meshAggInfo[ibx] = meshAggInfo[ibx+nbx];
                    meshAggInfo[ibx][0].position.z += -blockSize;
                    meshAggInfo[ibx+nbx] = meshAggInfo[ibx+nbx2];
                    meshAggInfo[ibx+nbx][0].position.z += -blockSize;
                    if (ibx == 1) {
                        if ((icamera == 1) || (icamera == 2)) {
                            camera.position.z += -blockSize*1.1;
                        }
                        myMesh.position.z += -blockSize;
                    }
                    let padx = blockSize*(ibx+ibxs), padz = blockSize, jbx = ibx+cbx+ibxs, jbz = cbz+ibzs+nbz-1, ima = ibx+nbx2;
                    {
                        asyncUpdateBlock(padx, padz, jbx, jbz, delMesh, delAgg, ima).then(value => {});
                    }
                }
            }
        }
    })


    let createStage = function(istage) {
console.log("createStage");
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }
        createBlockIni();
    }


    let imymesh = 0;
    let mymeshList = [0, 3, 4];

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
            myMesh = BABYLON.MeshBuilder.CreateBox("target", { width:0.5, height:0.2, depth:0.8 }, scene);
            myMesh.material = new BABYLON.StandardMaterial("mat", scene);
            myMesh.material.emissiveColor = BABYLON.Color3.Blue();
            myMesh.material.alpha=.5;
            myMesh.rotationQuaternion = new BABYLON.Quaternion();
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
                // brakeForce:100
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
            // vehicle._forwardForce = 0
            vehicle._steerValue = 0
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
            // vehicle._steerDirection = 0
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
    }

    let updateMyMesh = function() {
        let forwardForce, steerDirection, roll, updownForce;

        if (imymesh == 0) {
            // 自機（立方体）
            // 力で推進させる、力で回転させる
            forwardForce = 0;
            steerDirection = 0;
            updownForce = 0;
            if (keyAction.forward) forwardForce = 1
            if (keyAction.backward) forwardForce = -1
            if (keyAction.left) steerDirection = -1
            if (keyAction.right) steerDirection = 1
            if (keyAction.up) updownForce = 1
            if (keyAction.down) updownForce = -1
            let vquick = (keyAction.quick) ? 3 : 1;
            let quat = myMesh.rotationQuaternion;
// console.log("myMesh=", myMesh);
// console.log("quat=", quat);
            if (forwardForce != 0) {
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                const vScale = 1.0; // 1.0;
                vdir = vdir.scale(forwardForce*vScale*vquick);
                myMesh.position.addInPlace(vdir);
                // // myAgg.body.applyForce(vdir, myMesh.absolutePosition);
                // myMesh._agg.body.applyImpulse(vdir, myMesh.absolutePosition);
            }
            if (updownForce != 0) {
                let vdir = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                const vScale = 0.5; // 1.0;
                vdir = vdir.scale(updownForce*vScale*vquick);
                myMesh.position.addInPlace(vdir);
                // myMesh._agg.body.applyImpulse(vdir, myMesh.absolutePosition);
            }
            //
            if (steerDirection != 0) {
                let qRot = BABYLON.Quaternion.FromEulerAngles(0, 0.02*steerDirection, 0);
                myMesh.rotationQuaternion = qRot.multiply(quat);
            }

            // let vrot = BABYLON.Vector3.Up().applyRotationQuaternion(qRot);
            // const rotScale = 0.1;
            // vrot = vrot.scale(rotScale*steerDirection*vquick);
            // myMesh._agg.body.applyAngularImpulse(vrot);

            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }

        // } else if ((imymesh == 3) || (imymesh == 4)) {
        } else if ((imymesh >= 3) && (imymesh <= 5)) {
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

        } else {
            console.log("under cunstrunction");
        }

        // let speed = getSpeed();
        // setText1(speed);
    }

    let resetPostureMyMesh = function() {
        if ((imymesh >= 3) && (imymesh <= 5)) {
            // RaycastVehicle
            let vehicle = myMesh._vehicle;
            vehicle.doResetPosture();
        } else {
            // 姿勢を正す
            /// クォータニオンからオイラー角を取得、方向（ヨー:z軸回転）だけを使い他は0として姿勢をリセットする
            // myMesh._agg.body.applyForce(new BABYLON.Vector3(0, 40, 0), myMesh.absolutePosition);
            myMesh.position.y += myMesh._height;
            myMesh._agg.body.applyImpulse(new BABYLON.Vector3(0, 40, 0), myMesh.absolutePosition);
            let eular = myMesh.rotationQuaternion.toEulerAngles()
            let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
            myMesh.rotationQuaternion = quat;
            // 回転を止める
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
        }
    }

    let getSpeed = function() {
        let speed = 0;
        if (imymesh == 0) {
        } else if ((imymesh >= 3) && (imymesh <= 5)) {
            speed = myMesh._vehicle.speed;
        } else {
            let vec = myMesh._agg.body.getLinearVelocity();
            speed = vec.length();
        }
        return speed;
    }

    let resetMyPosi = function () {
        if (myMesh==null) {
console.log("myMesh==null")
            return;
        }

        if (imymesh == 0) {
            myMesh.position = pStart.clone();
            myMesh.position.y += 2;
            // let p1 = pStart.clone();
            // let p3 = pStart2.clone();
            // p3.subtractInPlace(p1);
            // let vrot = Math.atan2(p3.x, p3.z);
            // myMesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
            // myMesh.rotate(BABYLON.Vector3.Up(), vrot);

        } else {
            myMesh.position = pStart.clone();
            myMesh.position.y += 2;
            // let p1 = pStart.clone();
            // let p3 = pStart2.clone();
            // p3.subtractInPlace(p1);
            // let vrot = Math.atan2(p3.x, p3.z);
            // myMesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
            // myMesh.rotate(BABYLON.Vector3.Up(), vrot);
            myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
        }
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

    let keyAction = {forward:0, back:0, right:0, left:0, LR:0, up:0, down:0, brake:0, quick:0, reset:0, resetCooltime:0};
    scene.registerAfterRender(function() {
        keyAction.quick=false;
        if (map["ctrl"]) {
            keyAction.quick=true;
        }
        if ((map["ArrowUp"]) || (map["w"])) {
            keyAction.forward = true;
        } else {
            keyAction.forward = false;
        }
        if ((map["ArrowDown"]) || (map["s"])) {
            keyAction.backward = true
        } else {
            keyAction.backward = false
        }
        if (map["q"]) {
            keyAction.up = true;
        } else {
            keyAction.up = false;
        }
        if (map["e"]) {
            keyAction.down = true
        } else {
            keyAction.down = false
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
                if (map["C"]) {
                    let i = icameralist.indexOf(icamera);
                    console.assert(i >= 0);
                    i = (i-1+icameralist.length) % icameralist.length;
                    icamera = icameralist[i];
                } else {
                    let i = icameralist.indexOf(icamera);
                    console.assert(i >= 0);
                    i = (i+1) % icameralist.length;
                    icamera = icameralist[i];
                }

                changeCamera(icamera);
            }
            if (map["n"] || map["N"] || map["p"] || map["P"] || map["b"] || map["B"]) {
                cooltime_act = cooltime_actIni;
                if ((map["N"] || map["p"] || map["b"])) {
                    istage = (istage+nstage-1)%nstage;
                } else {
                    istage = (istage+1)%nstage;
                }
                createStage(istage);
                resetMyPosi();
            }
            if (map["m"] || map["M"]) {
                cooltime_act = cooltime_actIni;
                if (map["M"]) {
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
                // if (map["D"] || map["shift"]) {
                if (map["D"]) {
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
                +"(W,S): Up/Down\n"
                +"(A,D): Turn Left/Right\n"
                +"(Arrow UP/DOWN): Forward/Back\n"
                +"(Arrow Left/Right): Left/Right\n"
                +"(C) : Change Camera\n"
                +"(M) : Change Machine\n"
                +"(N,P) : Change Stage\n"
                +"H: show/hide this message";
            text1.color = "white";
            text1.width = "310px";
            text1.fontSize = 14;
            text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
            text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
            text1.paddingLeft = 12;
            grid.addControl(text1, 0, 0);
        }
        // {
        //     let button = BABYLON.GUI.Button.CreateSimpleButton("but1", "Close");
        //     button.width = "120px";
        //     button.height = "30px";
        //     button.color = "white";
        //     button.fontSize = 16;
        //     button.background = "DarkGray";
        //     button.onPointerUpObservable.add(function() {
        //         guiUsageRect.isVisible = false;
        //     });
        //     grid.addControl(button, 1, 0);
        // }
        guiUsageRect.isVisible = false;
    }
    var changeUsageView = function() {
        if (guiUsageRect.isVisible) {
            guiUsageRect.isVisible = false;
        } else {
            guiUsageRect.isVisible = true;
        }
    }

    // // 画面左上。Ｑボタン
    // var guiIconUsage = new BABYLON.GUI.Image("ctrl", iconPath1);
    // {
    //     guiIconUsage.width = "60px";
    //     guiIconUsage.height = "60px";
    //     guiIconUsage.autoScale = false
    //     guiIconUsage.stretch = BABYLON.GUI.Image.STRETCH_NONE;
    //     guiIconUsage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    //     guiIconUsage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    //     guiIconUsage.onPointerUpObservable.add(function() {
    //         changeUsageView();
    //     });
    //     guiIconUsage.zIndex="-1";
    //     advancedTexture.addControl(guiIconUsage);   
    // }

    // ----------------------------------------
    // ------------------------------
    // スピードメーター（上部中央）
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "";
    text1.color = "white";
    text1.fontSize = 24;
    text1.height = "36px";
    text1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text1);

    let setText1 = function(val) {
        val = Math.floor(val*3.6) // [m/s]を [km/h]に直す
        text1.text = "" + val + " [km/h]"
    }

    // ------------------------------
    // メッセージ（数秒後にフェードアウト）
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "";
    text2.color = "white";
    text2.fontSize = 24;
    text2.height = "36px";
    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    advancedTexture.addControl(text2);

    let clearText2 = function() {
        text2.text = "";
    }

    let setText2 = function(val) {
        text2.text = "" + val;
        setTimeout(clearText2, 10*1000); // 10[sec]
    }

    // ----------------------------------------
    // await BABYLON.InitializeCSG2Async();

    createStage(istage);
    createMyMesh();
    // // resetAllAgent(meshes4CNS, scene);

    changeCamera(icamera);
    resetMyPosi();

    return scene;
}

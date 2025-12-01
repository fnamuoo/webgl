// Babylon.js で物理演算(havok)：カプセルを転がす

//  - カーソル上/(w)              .. 前進
//  - カーソル下/(s)              .. 後進
//  - カーソル右左/(a,d)          .. 旋回
//  - Ctrl+カーソル右＋左/(a＋d)  .. 大きく旋回
//  - enter                       .. 姿勢を正す（ジャンプ）
//  - (c/C[=shift+c])             .. カメラ変更
//  - (m/M[=shift+m])             .. マシン（移動体）変更

const R90 = Math.PI/2;
const R180 = Math.PI;

//let coursePath="textures/course/BoxySVG_test1_3_400x300.png"
let coursePath="../066/textures/BoxySVG_test1_3_400x300.png"
// let coursePath="https://raw.githubusercontent.com/fnamuoo/webgl/main/066/textures/BoxySVG_test1_3_400x300.png";

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

    // let imymesh = 0, nmymesh = 7;  // 立体
    // let imymesh = 7, nmymesh = 8; // カプセル
    // let imymesh = 10, nmymesh = 11; // ボード(3) 転進に力＋加速度／エンジン概念＋ブレーキ
    let imymesh = 1;
    let mymeshList = [1, 2];
    let wheelMeshes=[]
    let createMyMesh = function() {
        if (wheelMeshes.length>0) {
            for (m of wheelMeshes) {
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
            // myMesh.material.topColor = new BABYLON.Color3(1, 1, 1);
            // myMesh.material.bottomColor = new BABYLON.Color3(1, 0.6, 0.6);
            // myMesh.material.emissiveColor = BABYLON.Color3.White();
            // myMesh.material.diffuseColor = BABYLON.Color3.White();
            // myMesh.material.smoothness = -0.1;
            myMesh.material.wireframe=1;
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.CAPSULE, { mass: 2.0, friction: 100.0, restitution:0.01}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh._p = myMesh.position.clone();
            myMesh._agg=myAgg;
            myMesh._height =0.1;
            myMesh.physicsBody.disablePreStep = false;
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

    }

    let resetPostureMyMesh = function() {
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

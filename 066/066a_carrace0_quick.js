// 物理演算系で、立方体／カプセルを力（applyFoce)で動かす例(2)
// - LiearDampingで操作性を向上
const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // 物理エンジンを有効にする
    const gravityVector = new BABYLON.Vector3(0, -1.5, 0);
    const physicsPlugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.radius = 10;
    camera.heightOffset = 2;
    camera.rotationOffset = 180;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 30;
    camera.warningEnable = false;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 0;

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // 地面を設定する
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 200, height: 150 }, scene);
    // テクスチャを張り付ける
    var matgnd = new BABYLON.StandardMaterial("mat1", scene);
    // GroundPlayer用
//    matgnd.diffuseTexture = new BABYLON.Texture("https://raw.githubusercontent.com/fnamuoo/webgl/main/042/pic/BoxySVG_test1_3_400x300.png", scene);
    // ローカル環境用
    matgnd.diffuseTexture = new BABYLON.Texture("textures/BoxySVG_test1_3_400x300.png", scene);
    groundMesh.material = matgnd;

    // 地面に摩擦係数、反射係数を設定する
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.001, restitution:0.01}, scene);

    // 落下防止用に壁をつくる
    {
        let geolist = [[0, 1, 75, 200, 1.5, 1],
                       [0, 1, -75, 200, 1.5, 1],
                       [100, 1, 0, 1, 1.5, 150],
                       [-100, 1, 0, 1, 1.5, 150],
                      ];
        for (let [px,py,pz,sx,sy,sz] of geolist) {
            const trgMesh = BABYLON.MeshBuilder.CreateBox("wall", { width: sx, height: sy, depth: sz }, scene);
            let mat = new BABYLON.StandardMaterial("mat", scene);
            mat.emissiveColor = BABYLON.Color3.Blue();
            trgMesh.material = mat;
            var trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.05}, scene);
            trgMesh.physicsBody.disablePreStep = true;
            trgMesh.position = new BABYLON.Vector3(px, py, pz);
            trgMesh.physicsBody.disablePreStep = false;
        }
    }


    // 自機（立方体）
    const myMesh = BABYLON.MeshBuilder.CreateBox("my", { size: 2 }, scene);
    // 下記 モード(imode)ごとに応じたmaterial
    let myMat1 = new BABYLON.StandardMaterial("mymat1", scene);
    let myMat2 = new BABYLON.GradientMaterial("mymat2", scene);
    myMat2.topColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    myMat2.bottomColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    myMat2.offset = 1.5;
    myMat2.scale = 3;
    let myMat3 = new BABYLON.GridMaterial("mymat3", scene);
    myMesh.material = myMat1;

    var myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.001, restitution:0.05}, scene);
    myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
    myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);


    // ------------------------------
    // 直線移動時の抵抗            ブレーキ時の抵抗        加速
    let linearDumpNmr = 3; let linearDumpBrk = 0.99; let vAcc = 18;  // グリップ
    // let linearDumpNmr = 0.5; let linearDumpBrk = 1; let vAcc = 4; // ドリフト
    // let linearDumpNmr = 0.3; let linearDumpBrk = 1; let vAcc = 3.5; // 滑りやすい（スノー、ダートコース）
    let imode = 0, nmode = 3;
    function changeMode(imode) {
        if (imode == 0) {
            // グリップ
            console.log("mode:grip")
            linearDumpNmr = 3; linearDumpBrk = 0.99; vAcc = 18;
            myMesh.material = myMat1;
        } else if (imode == 1) {
            // ドリフト
            console.log("mode:drift")
            linearDumpNmr = 0.5; linearDumpBrk = 1; vAcc = 4;
            myMesh.material = myMat2;
        } else {
            // 滑りやすい（スノー、ダートコース）
            console.log("mode:slippy")
            linearDumpNmr = 0.3; linearDumpBrk = 1; vAcc = 3.5;
            myMesh.material = myMat3;
        }
        myMesh.physicsBody.setLinearDamping(linearDumpNmr);
    }

    changeMode(imode);

    myMesh.physicsBody.setAngularDamping(2);

    myMesh.position = new BABYLON.Vector3(-50, 5, 50);
    myMesh.rotationQuaternion = new BABYLON.Quaternion.FromEulerAngles(0, 1.5, 0);
    camera.lockedTarget = myMesh;


    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 1.0);
    localAxes.xAxis.parent = myMesh;
    localAxes.yAxis.parent = myMesh;
    localAxes.zAxis.parent = myMesh;

    let keyAction = {forward:0, back:0, right:0, left:0, jump:0, brake:0, reset:0, resetCooltime:0};

    // https://www.crossroad-tech.com/entry/babylonjs-translate-keyinput
    var map ={};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"; 
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    var distance = 0.01;
    scene.registerAfterRender(function() {	
        keyAction.forward = 0;
        keyAction.back = 0;
        if ((map["ArrowUp"] || map["w"])) {
            keyAction.forward = 1;
        } else if ((map["ArrowDown"] || map["s"])) {
            keyAction.back = 1;
        }
        keyAction.left = 0;
        keyAction.right = 0;
        if ((map["ArrowLeft"] || map["a"])) {
            keyAction.left = 1;
        } else if ((map["ArrowRight"] || map["d"])) {
            keyAction.right = 1;
        }
        keyAction.brake = 0;
        if (map["b"]) {
            keyAction.brake = 1;
            myMesh.physicsBody.setLinearDamping(linearDumpBrk);
        }
        keyAction.jump = 0;
        if (map[" "]) {
            keyAction.jump = 1;
        }
        if (map["r"]) {
            keyAction.reset = 1;
        }
        if (keyAction.resetCooltime) {
            --keyAction.resetCooltime;
        // if (cooltime_chaneShape) {
        //     --cooltime_chaneShape;
        } else {
            if (map["c"]) {
                keyAction.resetCooltime = 120;
                // cooltime_chaneShape = 120;
                icamera = (icamera+1) % 4;
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 10;
                    camera.heightOffset = 2;
                    camera.cameraAcceleration = 0.05;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 15;
                    camera.heightOffset = 3;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 10;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 0.1;
                    camera.heightOffset = 20;
                    camera.cameraAcceleration = 0.9;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.1;
                    camera.heightOffset = 0;
                    camera.cameraAcceleration = 0.9;
                    camera.maxCameraSpeed = 30;
                }

            } else if (map["m"]) {
                keyAction.resetCooltime = 60;
                imode = (imode+1) % nmode;
                changeMode(imode);
            }
        }

    });

    const qRotR = BABYLON.Quaternion.FromEulerAngles(0, 0.02, 0);
    const qRotL = BABYLON.Quaternion.FromEulerAngles(0, -0.02, 0);
    scene.onBeforeRenderObservable.add(() => {
        if (keyAction.forward) {
            let vdir = new BABYLON.Vector3(0 ,0, vAcc);
            let quat = myMesh.rotationQuaternion;
            vdir = vdir.applyRotationQuaternion(quat);
            let vForce = vdir.scale(2);
            myAgg.body.applyForce(vForce, myMesh.absolutePosition);
        } else if (keyAction.back) {
            let vdir = new BABYLON.Vector3(0 ,0, -vAcc);
            let quat = myMesh.rotationQuaternion;
            vdir = vdir.applyRotationQuaternion(quat);
            let vForce = vdir.scale(2);
            myAgg.body.applyForce(vForce, myMesh.absolutePosition);
        }
        if (keyAction.right) {
            let quat = myMesh.rotationQuaternion;
            myMesh.rotationQuaternion = qRotR.multiply(quat);
        } else if (keyAction.left) {
            let quat = myMesh.rotationQuaternion;
            myMesh.rotationQuaternion = qRotL.multiply(quat);
        }
        myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
        if (keyAction.jump) {
            myAgg.body.applyForce(new BABYLON.Vector3(0, 40, 0), myMesh.absolutePosition);
        }
    });

    return scene;
};

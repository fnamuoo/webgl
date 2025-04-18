// 物理演算系で、 カプセルを座標値を変更して動かす例
// - 物体／壁をすりぬける（深刻な問題）
//   - 角度によっては床をすり抜けるように動く
const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // 物理エンジンを有効にする
    // const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    const gravityVector = new BABYLON.Vector3(0, -1.5, 0);
    const physicsPlugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.radius = 10;
    camera.heightOffset = 2;
    camera.rotationOffset = 180;
    camera.cameraAcceleration = 0.005;
    camera.maxCameraSpeed = 10;
    camera.warningEnable = false;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // 地面を設定する
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 200, height: 200 }, scene);
    // groundMesh.position.y = 0;
    groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMesh.material.majorUnitFrequency = 1;
    groundMesh.material.minorUnitVisibility  = 0;
    // 地面に摩擦係数、反射係数を設定する
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);

    {
        // 高さマップ
        const trgMesh = BABYLON.MeshBuilder.CreateGroundFromHeightMap("target", "./textures/heightMap.png",
                                                                      {width:50, height :50, subdivisions: 100, maxHeight: 5,
                                                                       onReady: (mesh) => {
                                                                           trgAgg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, {mass: 0}, scene);
                                                                       }});
        let mat = new BABYLON.StandardMaterial("mat", scene);
        mat.emissiveColor = BABYLON.Color3.Green();
        mat.wireframe = true;
        trgMesh.material = mat;
        trgMesh.position.x += -30;
        trgMesh.position.z += 30;
        trgMesh.position.y += 0.01;
    }

    {
        // リボンによる曲面
        let rootPath = [];
        let nmin = -20, nmax = 21, gridsize = 1;
        for (let iz = nmin; iz < nmax; ++iz) {
            let z = iz*gridsize;
            let path = []
            for (let ix = nmin; ix < nmax; ++ix) {
                let x = ix*gridsize;
                let y = (10-Math.abs(ix+iz))*0.5;
                if (y < 0) y = 0;
                path.push(new BABYLON.Vector3(x, y, z));
            }
            rootPath.push(path);
        }
        let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        var trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
        trgMesh.physicsBody.disablePreStep = true;
        trgMesh.position.x += 30;
        trgMesh.position.z += 30;
        trgMesh.position.y += 0.01;
        trgMesh.physicsBody.disablePreStep = false;
    }

    {
        // 物理演算系・自由に動かせる立体
        let adjx = 30, adjz = -30, adjy = 10;
        let nbox = 10;
        for (let ibox = 0; ibox < nbox; ++ibox) {
            const trgMesh = BABYLON.MeshBuilder.CreateBox("target", { size: 3 }, scene);
            let mat = new BABYLON.StandardMaterial("mat", scene);
            mat.emissiveColor = BABYLON.Color3.Blue();
            trgMesh.material = mat;
            var trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution:0.05}, scene);
            trgMesh.physicsBody.disablePreStep = true;
            trgMesh.position.x += adjx + BABYLON.Scalar.RandomRange(-10, 10);
            trgMesh.position.z += adjz + BABYLON.Scalar.RandomRange(-10, 10);
            trgMesh.position.y += adjy + ibox*5;
            trgMesh.physicsBody.disablePreStep = false;
        }
    }

    let tiltMyMove = false; // 移動時に自身を傾けるか (t:傾ける / f:傾けない＝直立

    // 自機（カプセル）
    const myHeight = 1.5;
    const myRadius = 0.6;
    let myMesh = BABYLON.MeshBuilder.CreateCapsule("me", {height: myHeight, radius: myRadius }, scene);
    var myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.CAPSULE, { mass: 1.0, friction: 0.001, restitution:0.05}, scene);
    tiltMyMove = true; // 移動時に自身を傾ける

    // // 自機（立方体）
    // const myMesh = BABYLON.MeshBuilder.CreateBox("me", { size: 2 }, scene);
    // var myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
    // myMesh.position.y = 10;

    camera.lockedTarget = myMesh;

    // デバッグ表示
    if (1) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 1.0);
    localAxes.xAxis.parent = myMesh;
    localAxes.yAxis.parent = myMesh;
    localAxes.zAxis.parent = myMesh;

    let keyAction = {forward:0, back:0, right:0, left:0, jump:0, reset:0};

    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key === 'w' || kbInfo.event.key === 'ArrowUp') {
                keyAction.forward = 1;
            } else if (kbInfo.event.key === 's' || kbInfo.event.key === 'ArrowDown') {
                keyAction.back = 1;
            }
            if (kbInfo.event.key === 'a' || kbInfo.event.key === 'ArrowLeft') {
                keyAction.left = 1;
            } else if (kbInfo.event.key === 'd' || kbInfo.event.key === 'ArrowRight') {
                keyAction.right = 1;
            }
            if (kbInfo.event.key === ' ') {
                keyAction.jump = 1;
            }
            if (kbInfo.event.key === 'r') {
                keyAction.reset = 1;
            }
            if (kbInfo.event.key === 'h') {
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            if (kbInfo.event.key === 'w' || kbInfo.event.key === 's' || 
                kbInfo.event.key === 'ArrowUp' || kbInfo.event.key === 'ArrowDown') {
                keyAction.forward = 0;
                keyAction.back = 0;
            }
            if (kbInfo.event.key === 'a' || kbInfo.event.key === 'd' || 
                kbInfo.event.key === 'ArrowLeft' || kbInfo.event.key === 'ArrowRight') {
                keyAction.right = 0;
                keyAction.left = 0;
            }
            if (kbInfo.event.key === ' ') {
                keyAction.jump = 0;
            }
            break;
        }
    });

    // // 
    let resetEular = null;
    let tiltFlag = 0;

    scene.onBeforeRenderObservable.add(() => {
        if (keyAction.forward) {
            let vdir = new BABYLON.Vector3(0 ,0, 1);
            let quat = myMesh.rotationQuaternion;
            vdir = vdir.applyRotationQuaternion(quat);
            let vMove = vdir.scale(0.15);
            vMove.y = 0; // 地面にめり込まない／沈まないように
            myMesh.physicsBody.disablePreStep = true;
            myMesh.position.addInPlace(vMove);
            if (tiltMyMove && (tiltFlag==0)) {
                tiltFlag=1;
                let quat = myMesh.rotationQuaternion;
                let quat2 = BABYLON.Quaternion.FromEulerAngles(0.1, 0, 0);
                myMesh.rotationQuaternion = quat2.multiply(quat);
            }
            myMesh.physicsBody.disablePreStep = false;
        } else if (keyAction.back) {
            let vdir = new BABYLON.Vector3(0 ,0, -1);
            let quat = myMesh.rotationQuaternion;
            vdir = vdir.applyRotationQuaternion(quat);
            let vMove = vdir.scale(0.1);
            vMove.y = 0; // 地面にめり込まない／沈まないように
            myMesh.physicsBody.disablePreStep = true;
            myMesh.position.addInPlace(vMove);
            if (tiltMyMove && (tiltFlag==0)) {
                tiltFlag=1;
                let quat = myMesh.rotationQuaternion;
                let quat2 = BABYLON.Quaternion.FromEulerAngles(-0.1, 0, 0);
                myMesh.rotationQuaternion = quat2.multiply(quat);
            }
            myMesh.physicsBody.disablePreStep = false;
        } else {
            if (tiltFlag==1) {
                // 傾きを戻す
                tiltFlag = 0;
                myMesh.physicsBody.disablePreStep = true;
                let eular = myMesh.rotationQuaternion.toEulerAngles()
                let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
                myMesh.rotationQuaternion = quat;
                myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                myMesh.physicsBody.disablePreStep = false;
            }
        }
        if (keyAction.right) {
            let quat = myMesh.rotationQuaternion;
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0.02, 0);
            myMesh.physicsBody.disablePreStep = true;
            myMesh.rotationQuaternion = quat2.multiply(quat);
            if (tiltMyMove && (tiltFlag==1)) {
                tiltFlag=3;
                let quat = myMesh.rotationQuaternion;
                let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0, -0.5);
                myMesh.rotationQuaternion = quat2.multiply(quat);
            }
            myMesh.physicsBody.disablePreStep = false;
        } else if (keyAction.left) {
            let quat = myMesh.rotationQuaternion;
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, -0.02, 0);
            myMesh.physicsBody.disablePreStep = true;
            myMesh.rotationQuaternion = quat2.multiply(quat);
            if (tiltMyMove && (tiltFlag==1)) {
                tiltFlag=5;
                let quat = myMesh.rotationQuaternion;
                let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0, 0.5);
                myMesh.rotationQuaternion = quat2.multiply(quat);
            }
            myMesh.physicsBody.disablePreStep = false;
        } else {
            if (tiltFlag>=3) {
                // 傾きを戻す
                tiltFlag = 0;
                myMesh.physicsBody.disablePreStep = true;
                let eular = myMesh.rotationQuaternion.toEulerAngles()
                let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
                myMesh.rotationQuaternion = quat;
                myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                myMesh.physicsBody.disablePreStep = false;
            }
        }
        if (keyAction.jump) {
            myAgg.body.applyForce(new BABYLON.Vector3(0, 20, 0), myMesh.absolutePosition);
        }

        if (keyAction.reset) {
            // 姿勢を正す
            /// クォータニオンからオイラー角を取得、方向（ヨー:z軸回転）だけを使い他は0として姿勢をリセットする
            keyAction.reset = 0;
            myAgg.body.applyForce(new BABYLON.Vector3(0, 80, 0), myMesh.absolutePosition);
            myMesh.physicsBody.disablePreStep = true;
            let eular = myMesh.rotationQuaternion.toEulerAngles()
            let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
            myMesh.rotationQuaternion = quat;
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
            myMesh.physicsBody.disablePreStep = false;
        }

        {
            // ある程度傾いたら姿勢を正す処理
            let eular = myMesh.rotationQuaternion.toEulerAngles()
            if (Math.abs(eular.x) > 1 || Math.abs(eular.z) > 1) {
                myMesh.physicsBody.disablePreStep = true;
                // babylonのクォータニオンのx,y,z,wが、回転軸+回転角ではないので、..
                // smoothToRefで刻みのquatを作成して適用、、微妙
                let quat1 = myMesh.rotationQuaternion;
                let quat2 = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
                let quat3 = new BABYLON.Quaternion();
                BABYLON.Quaternion.SmoothToRef(quat1, quat2, 1, 2, quat3);
                myMesh.rotationQuaternion = quat3;
                myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                myMesh.physicsBody.disablePreStep = false;
            }
        }

    });

    // 左上に使い方（操作方法）を表示
    //   キー操作(h)で表示のon/offを切り替え(上記で)
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "110px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n(W,S) or (Arrow UP/DOWN): forward/back\n(A,D) or (Arrow Left/Right): turn Left/Right\nR: Reset posture\n(Space): Jump\nH: show/hide this message";
    text1.color = "white";
    text1.width = "260px";
    text1.fontSize = 12;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return scene;
};

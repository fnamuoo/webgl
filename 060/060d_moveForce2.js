// 物理演算系で、立方体／カプセルを力（applyFoce)で動かす例
// - 慣性が効いて、操作がむずい
// - 横を向いて加速すると角速度（回転モーメント）が発生するみたい。曲がりくくなる。
// - レースコースのテクスチャを貼り付け、レースっぽく
// - カメラ視点の追加
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
    // // for local
    // matgnd.diffuseTexture = new BABYLON.Texture("textures/BoxySVG_test1_3_400x300.png", scene);
    // for PlayGround
    matgnd.diffuseTexture = new BABYLON.Texture("https://raw.githubusercontent.com/fnamuoo/webgl/main/042/pic/BoxySVG_test1_3_400x300.png", scene);
    groundMesh.material = matgnd;

    // 地面に摩擦係数、反射係数を設定する
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);

    // 落下防止用に壁をつくる
    {
        let geolist = [[0, 3, 75, 200, 5, 1],
                       [0, 3, -75, 200, 5, 1],
                       [100, 3, 0, 1, 5, 150],
                       [-100, 3, 0, 1, 5, 150],
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

    // // {
    // //     // 物理演算系・自由に動かせる立体
    // //     let adjx = 30, adjz = -30, adjy = 10;
    // //     let nbox = 10;
    // //     for (let ibox = 0; ibox < nbox; ++ibox) {
    // //         const trgMesh = BABYLON.MeshBuilder.CreateBox("target", { size: 3 }, scene);
    // //         let mat = new BABYLON.StandardMaterial("mat", scene);
    // //         mat.emissiveColor = BABYLON.Color3.Blue();
    // //         trgMesh.material = mat;
    // //         var trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution:0.05}, scene);
    // //         trgMesh.physicsBody.disablePreStep = true;
    // //         trgMesh.position.x += adjx + BABYLON.Scalar.RandomRange(-10, 10);
    // //         trgMesh.position.z += adjz + BABYLON.Scalar.RandomRange(-10, 10);
    // //         trgMesh.position.y += adjy + ibox*5;
    // //         trgMesh.physicsBody.disablePreStep = false;
    // //     }
    // // }


    // 自機（カプセル）
    // const myHeight = 1.5;
    // const myRadius = 0.6;
    // let myMesh = BABYLON.MeshBuilder.CreateCapsule("me", {height: myHeight, radius: myRadius }, scene);
    // var myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.CAPSULE, { mass: 1.0, friction: 0.001, restitution:0.05}, scene);

    // 自機（立方体）
    const myMesh = BABYLON.MeshBuilder.CreateBox("target", { size: 2 }, scene);
    var myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
    myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
    myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);

    // // // 自機（球）
    // const myMesh = BABYLON.MeshBuilder.CreateSphere("target", { diameterX: 2, diameterY: 1, diameterZ: 3,  }, scene);
    // var myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
    // myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
    // myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);

    // 初期位置の変更
    myMesh.physicsBody.disablePreStep = true;
    myMesh.position = new BABYLON.Vector3(-50, 5, 50);
    myMesh.rotationQuaternion = new BABYLON.Quaternion.FromEulerAngles(0, 1.5, 0);
    myMesh.physicsBody.disablePreStep = false;

    camera.lockedTarget = myMesh;


    // デバッグ表示
    // if (0) {
    // var viewer = new BABYLON.PhysicsViewer();
    // scene.meshes.forEach((mesh) => {
    //     if (mesh.physicsBody) {
    //         viewer.showBody(mesh.physicsBody);
    //     }
    // });
    // }

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 1.0);
    localAxes.xAxis.parent = myMesh;
    localAxes.yAxis.parent = myMesh;
    localAxes.zAxis.parent = myMesh;

    let keyAction = {forward:0, back:0, right:0, left:0, jump:0, reset:0, resetCooltime:0};

    var map ={}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"; 
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    let cooltime = 0;
    let cooltimeInit = 30;
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
        keyAction.jump = 0;
        keyAction.reset = 0;
        if (map[" "]) {
            keyAction.jump = 1;
        } else if (map["r"]) {
            keyAction.reset = 1;
        }
        if (cooltime > 0) {
            --cooltime;
        } else {
            if (map["c"]) {
                cooltime = cooltimeInit;
                icamera = (icamera+1) % 3;
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 10;
                    camera.heightOffset = 2;
                    camera.cameraAcceleration = 0.05;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 1) {
                    // 上空（トップビュー
                    camera.radius = 0.1;
                    camera.heightOffset = 20;
                    camera.cameraAcceleration = 0.9;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 2) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.1;
                    camera.heightOffset = 0;
                    camera.cameraAcceleration = 0.9;
                    camera.maxCameraSpeed = 30;
                }
            } else if (map["h"]) {
                cooltime = cooltimeInit;
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
        }
    });

    // scene.onKeyboardObservable.add((kbInfo) => {
    //     switch (kbInfo.type) {
    //     case BABYLON.KeyboardEventTypes.KEYDOWN:
    //         if (kbInfo.event.key === 'ArrowUp' || kbInfo.event.key === 'w') {
    //             keyAction.forward = 1;
    //         } else if (kbInfo.event.key === 'ArrowDown' || kbInfo.event.key === 's') {
    //             keyAction.back = 1;
    //         }
    //         if (kbInfo.event.key === 'ArrowLeft' || kbInfo.event.key === 'a') {
    //             keyAction.left = 1;
    //         } else if (kbInfo.event.key === 'ArrowRight' || kbInfo.event.key === 'd') {
    //             keyAction.right = 1;
    //         }
    //         if (kbInfo.event.key === ' ') {
    //             keyAction.jump = 1;
    //         }
    //         if (kbInfo.event.key === 'r') {
    //             keyAction.reset = 1;
    //         }
    //         if (kbInfo.event.key === 'c') {
    //             icamera = (icamera+1) % 4;
    //             if (icamera == 0) {
    //                 // 後ろから追っかける（バードビュー
    //                 camera.radius = 10;
    //                 camera.heightOffset = 2;
    //                 camera.cameraAcceleration = 0.05;
    //                 camera.maxCameraSpeed = 30;
    //             } else if (icamera == 1) {
    //                 // ちょい遅れて／離れて追っかける（バードビュー遠方
    //                 camera.radius = 15;
    //                 camera.heightOffset = 3;
    //                 camera.cameraAcceleration = 0.005;
    //                 camera.maxCameraSpeed = 10;
    //             } else if (icamera == 2) {
    //                 // 上空（トップビュー
    //                 camera.radius = 0.1;
    //                 camera.heightOffset = 20;
    //                 camera.cameraAcceleration = 0.9;
    //                 camera.maxCameraSpeed = 30;
    //             } else if (icamera == 3) {
    //                 // 正面（フロントビュー／ドライバーズビュー
    //                 camera.radius = 0.1;
    //                 camera.heightOffset = 0;
    //                 camera.cameraAcceleration = 0.9;
    //                 camera.maxCameraSpeed = 30;
    //             }
    //         }
    //         if (kbInfo.event.key === 'h') {
    //             if (guiLabelRect.isVisible) {
    //                 guiLabelRect.isVisible = false;
    //             } else {
    //                 guiLabelRect.isVisible = true;
    //             }
    //         }
    //         break;
    //     case BABYLON.KeyboardEventTypes.KEYUP:
    //         if (kbInfo.event.key === 'ArrowUp' || kbInfo.event.key === 'ArrowDown' || kbInfo.event.key === 'w' || kbInfo.event.key === 's') {
    //             keyAction.forward = 0;
    //             keyAction.back = 0;
    //         }
    //         if (kbInfo.event.key === 'ArrowLeft' || kbInfo.event.key === 'ArrowRight' || kbInfo.event.key === 'a' || kbInfo.event.key === 'd') {
    //             keyAction.right = 0;
    //             keyAction.left = 0;
    //         }
    //         if (kbInfo.event.key === ' ') {
    //             keyAction.jump = 0;
    //         }
    //         break;
    //     }
    // });

    // // 
    // let resetEular = null;
    const qRotR = BABYLON.Quaternion.FromEulerAngles(0, 0.02, 0);
    const qRotL = BABYLON.Quaternion.FromEulerAngles(0, -0.02, 0);
    scene.onBeforeRenderObservable.add(() => {
        if (keyAction.forward) {
            let vdir = new BABYLON.Vector3(0 ,0, 1);
            let quat = myMesh.rotationQuaternion;
            // if (keyAction.right) {
            //     // let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0.02, 0);
            //     // quat = quat2.multiply(quat)
            //     quat = qRotR.multiply(quat)
            // } else if (keyAction.left) {
            //     // let quat2 = BABYLON.Quaternion.FromEulerAngles(0, -0.02, 0);
            //     // quat = quat2.multiply(quat)
            //     quat = qRotL.multiply(quat)
            // }
            vdir = vdir.applyRotationQuaternion(quat);
            
            let vForce = vdir.scale(2);
            myAgg.body.applyForce(vForce, myMesh.absolutePosition);
        } else if (keyAction.back) {
            let vdir = new BABYLON.Vector3(0 ,0, -1);
            let quat = myMesh.rotationQuaternion;
            vdir = vdir.applyRotationQuaternion(quat);
            let vForce = vdir.scale(2);
            myAgg.body.applyForce(vForce, myMesh.absolutePosition);
        }
        if (keyAction.right) {
            let quat = myMesh.rotationQuaternion;
            // let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0.02, 0);
            myMesh.physicsBody.disablePreStep = true;
            myMesh.rotationQuaternion = qRotR.multiply(quat);
            // myMesh.rotationQuaternion = quat2.multiply(quat);
            myMesh.physicsBody.disablePreStep = false;
        } else if (keyAction.left) {
            let quat = myMesh.rotationQuaternion;
            // let quat2 = BABYLON.Quaternion.FromEulerAngles(0, -0.02, 0);
            myMesh.physicsBody.disablePreStep = true;
            myMesh.rotationQuaternion = qRotL.multiply(quat);
            // myMesh.rotationQuaternion = quat2.multiply(quat);
            myMesh.physicsBody.disablePreStep = false;
        }
        if (keyAction.jump) {
            myAgg.body.applyForce(new BABYLON.Vector3(0, 20, 0), myMesh.absolutePosition);
        }

        if (keyAction.reset) {
            // 姿勢を正す
            /// クォータニオンからオイラー角を取得、方向（ヨー:z軸回転）だけを使い他は0として姿勢をリセットする
            keyAction.reset = 0;
            myAgg.body.applyForce(new BABYLON.Vector3(0, 40, 0), myMesh.absolutePosition);
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
    guiLabelRect.height = "120px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n(W,S) or (Arrow UP/DOWN): forward/back\n(A,D) or (Arrow Left/Right): turn Left/Right\nR: Reset posture\n(Space): Jump\nC: change Camera\nH: show/hide this message";
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

function fromLookDirection(forward, up) {
    up = up || BABYLON.Vector3.Up();
    const right = BABYLON.TmpVectors.Vector3[0];
    const finalUp = BABYLON.TmpVectors.Vector3[1];
    BABYLON.Vector3.CrossToRef(forward, up, right); // right is not normalized, but it's not a problem
    BABYLON.Vector3.CrossToRef(right, forward, finalUp);
    finalUp.normalize(); // FromLookDirectionRH needs that the up vector is normalized
    return BABYLON.Quaternion.FromLookDirectionRH(forward, finalUp);
}
/*
一定の方向を向かせるためには
２つのベクトルからクォータニオンを作る
FromLookDirectionLH babylon
有効ポイ

関連記事
https://forum.babylonjs.com/t/fromlookdirectionlh-is-a-bit-too-complicated-maybe-a-simpler-api-should-be-provided/41426/2

https://playground.babylonjs.com/#PU3D0F#10
*/

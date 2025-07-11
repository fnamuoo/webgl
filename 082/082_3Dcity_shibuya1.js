// Babylon.js で物理演算(havok)：渋谷の空を飛んでみる
//
// キャラクターコントローラー
//  - カーソル上下/(w,s) .. 前進/後進
//  - カーソル右左/(a,d) .. 方向転換
//  - space   .. ジャンプ
//  - ctrl    .. 上昇
//  - r       .. スタート位置に戻る
//  - c       .. カメラの視点切り替え
//  - h       .. 使い方表示

// for local
const citymodelPath = "./";
const skyboxTexturePath = "../069/textures/TropicalSunnyDay";
// for PlayGround
// const citymodelPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/082/";
// const skyboxTexturePath = "textures/TropicalSunnyDay";

var createScene = async function () {
    // await BABYLON.InitializeCSG2Async();

    var scene = new BABYLON.Scene(engine);

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.rotationOffset = 180;
    camera.radius = 10; // 3;
    camera.heightOffset = 2; // 1.1;
    camera.cameraAcceleration = 0.05; // 0.1;
    camera.maxCameraSpeed = 30;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 0;

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.position = new BABYLON.Vector3(20, 150, 70);
    light.intensity = 0.7;


    // 渋谷駅周辺
    {
        // 17MB
        // let files = ["./shibuyaV2c/533935_dem_6697_op/533935_dem_6697_op.glb",
        //              "./shibuyaV2c/53393585_bldg_6697_op/53393585_bldg_6697_op.glb",
        //              "./shibuyaV2c/53393585_tran_6697_op/53393585_tran_6697_op.glb",
        //              "./shibuyaV2c/53393586_bldg_6697_op/53393586_bldg_6697_op.glb",
        //              "./shibuyaV2c/53393586_tran_6697_op/53393586_tran_6697_op.glb",
        //              "./shibuyaV2c/53393595_bldg_6697_op/53393595_bldg_6697_op.glb",
        //              "./shibuyaV2c/53393595_tran_6697_op/53393595_tran_6697_op.glb",
        //              "./shibuyaV2c/53393596_bldg_6697_op/53393596_bldg_6697_op.glb",
        //              "./shibuyaV2c/53393596_tran_6697_op/53393596_tran_6697_op.glb",
        //             ];
        let files = [citymodelPath+"shibuyaV2c/533935_dem_6697_op/533935_dem_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393585_bldg_6697_op/53393585_bldg_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393585_tran_6697_op/53393585_tran_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393586_bldg_6697_op/53393586_bldg_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393586_tran_6697_op/53393586_tran_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393595_bldg_6697_op/53393595_bldg_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393595_tran_6697_op/53393595_tran_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393596_bldg_6697_op/53393596_bldg_6697_op.glb",
                     citymodelPath+"shibuyaV2c/53393596_tran_6697_op/53393596_tran_6697_op.glb",
                    ];
        
        if (1) {

        for (let file of files) {
            BABYLON.ImportMeshAsync(file, scene).then((result) => {
                for (let mesh of result.meshes) {
                    try {  // 必ず、0 番目が下記エラーで失敗するっぽい
                    let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);

                            let mat = new BABYLON.StandardMaterial('mat', scene);
                            mat.diffuseColor = BABYLON.Color3.Random();
                            mesh.material = mat;

                    } catch(e) {
                    // console.log("  failed ... ",[i,n]);
                    }
                }
            })
        }
/*
Error: No valid mesh was provided for mesh or convex hull shape parameter. Please provide a mesh with valid geometry (number of vertices greater than 0).

メッシュまたは凸包形状パラメータに有効なメッシュが指定されていません。有効なジオメトリ（頂点数が0より大きい）を持つメッシュを指定してください。

*/
        }
    }

    await BABYLON.InitializeCSG2Async();

    // 地面を設定する
    const grndMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);
    grndMesh.position.y = 14.5;
    grndMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    grndMesh.material.majorUnitFrequency = 10;
    grndMesh.material.minorUnitVisibility  = 0.5;
    // 地面に摩擦係数、反射係数を設定する
    var grndAgg = new BABYLON.PhysicsAggregate(grndMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);

    if (1) {
    // Skybox
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTexturePath, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    }


    let matMy = new BABYLON.StandardMaterial('mat', scene);
    matMy.diffuseColor = BABYLON.Color3.Blue();
    matMy.alpha = 0.7;

    // --------------------------------------------------
    // Player/Character state
    var state = "IN_AIR";
    let bDash = 3;
    var inAirSpeed = 30.0;
    var onGroundSpeed = 3.0;
    var inAirSpeedBase = 30.0;
    var onGroundSpeedBase = 3.0;
    var jumpHeight = 20;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -18, 0);
    let characterRisingON = new BABYLON.Vector3(0, 25.00, 0); // 上昇
    let characterRisingOFF = new BABYLON.Vector3(0, 0, 0);
    let characterRising   = characterRisingOFF;
    let characterHoverON  = new BABYLON.Vector3(0, 17.90, 0); // ホバー（滞空
    let characterHoverOFF = new BABYLON.Vector3(0, 0, 0);
    let characterHover = characterHoverON;
    let keyAction = {forward:0, back:0, right:0, left:0, jump:0, rise:0, down:0, resetCooltime:0 };


    // Physics shape for the character
    let myh = 1.8;
    let myr = 0.6;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: myh, radius: myr}, scene);
    displayCapsule.material = matMy;
    let characterPosition = new BABYLON.Vector3(0, 25, -4);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: myh, capsuleRadius: myr}, scene);

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 2);
    localAxes.xAxis.parent = displayCapsule; localAxes.yAxis.parent = displayCapsule; localAxes.zAxis.parent = displayCapsule;

    camera.lockedTarget = displayCapsule;

    var getNextState = function(supportInfo) {
        if (state == "IN_AIR_UP") {
            if (characterController.getVelocity().y > 0) {
                if (keyAction.rise) {
                    characterRising = characterRisingON;
                    characterHover = characterHoverON;
                } else {
                    characterRising = characterRisingOFF;
                }
                return "IN_AIR_UP";
            }
            characterHover = characterHoverON;
            return "IN_AIR";
        } else if (state == "IN_AIR") {
            if (characterController.getVelocity().y > 0) {
                if (keyAction.rise) {
                    characterRising = characterRisingON;
                    characterHover = characterRisingON;
                } else {
                    characterRising = characterRisingOFF;
                    characterHover = characterRisingOFF;
                }
                return "IN_AIR_UP";
            }
            if (keyAction.rise) {
                characterHover = characterRisingON;
            } else if (keyAction.down) {
                characterHover = characterHoverOFF;
            } else {
                characterHover = characterHoverON;
            }
            if (supportInfo.supportedState == BABYLON.CharacterSupportedState.SUPPORTED) {
                return "ON_GROUND";
            }
            return "IN_AIR";
        } else if (state == "ON_GROUND") {
            if (supportInfo.supportedState != BABYLON.CharacterSupportedState.SUPPORTED) {
                return "IN_AIR";
            }
            if (keyAction.jump) {
                return "START_JUMP";
            }
            return "ON_GROUND";
        } else if (state == "START_JUMP") {
            return "IN_AIR_UP";
        }
    }

    var getDesiredVelocity = function(deltaTime, supportInfo, characterOrientation_, currentVelocity) {
        let nextState = getNextState(supportInfo);
        if (nextState != state) {
            state = nextState;
        }
        let upWorld = characterGravity.normalizeToNew();
        upWorld.scaleInPlace(-1.0);
        let forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation_);
        if (state == "IN_AIR_UP") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            outputVelocity.addInPlace(characterRising.scale(deltaTime)); // ゆっくり上昇？
            return outputVelocity;
        } else if (state == "IN_AIR") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            outputVelocity.addInPlace(characterHover.scale(deltaTime)); // 降下をゆっくりにする上向きのベクトル
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
            outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
            let inv1k = 1e-3;
            if (outputVelocity.dot(upWorld) > inv1k) {
                let velLen = outputVelocity.length();
                outputVelocity.normalizeFromLength(velLen);
                let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);
                let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
                outputVelocity = c.cross(upWorld);
                outputVelocity.scaleInPlace(horizLen);
            }
            outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
            return outputVelocity;
        } else if (state == "START_JUMP") {
            let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
            // // let u = Math.sqrt(2 * characterJumpF.length() * jumpHeight);
            let curRelVel = currentVelocity.dot(upWorld);
            return currentVelocity.add(upWorld.scale(u - curRelVel));
        }
        return Vector3.Zero();
    }

    // Display tick update: compute new camera position/target, update the capsule for the character display
    scene.onBeforeRenderObservable.add((scene) => {
        displayCapsule.position.copyFrom(characterController.getPosition());
    });

    // After physics update, compute and set new velocity, update the character controller state
    scene.onAfterPhysicsObservable.add((_) => {
        if (scene.deltaTime == undefined) return;
        let dt = scene.deltaTime / 1000.0;
        if (dt == 0) return;
        let down = new BABYLON.Vector3(0, -1, 0);
        let support = characterController.checkSupport(dt, down);
        if (keyAction.right) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), 0.02);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0.02, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        } else if (keyAction.left) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), -0.02);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, -0.02, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        }
        let desiredLinearVelocity = getDesiredVelocity(dt, support, characterOrientation, characterController.getVelocity());
        characterController.setVelocity(desiredLinearVelocity);
        characterController.integrate(dt, support, characterGravity);
    });


    var map ={};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"; 
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    // var cooltime_chaneShape = 0;
    scene.registerAfterRender(function() {
        keyAction.rise = 0;
        if (map["ctrl"]) {
            keyAction.rise = 1;
        }
        inputDirection.z = 0;
        keyAction.forward = 0;
        keyAction.back = 0;
        if ((map["ArrowUp"] || map["w"])) {
            inputDirection.z = 1;
            keyAction.forward = 1;
        } else if ((map["ArrowDown"] || map["s"])) {
            if (state === "IN_AIR") {  // 空中なら降下
                keyAction.down = 1;
            } else {  // 地上ならバック
                inputDirection.z = -1;
                keyAction.back = 1;
            }
        }
        keyAction.left = 0;
        keyAction.right = 0;
        if ((map["ArrowLeft"] || map["a"])) {
            keyAction.left = 1;
        } else if ((map["ArrowRight"] || map["d"])) {
            keyAction.right = 1;
        }
        keyAction.jump = 0;
        if (map[" "] || map["Enter"]) {
            keyAction.jump = 1;
        }
        if (keyAction.resetCooltime) {
            --keyAction.resetCooltime;
        } else {
            if (map["c"]) {
                keyAction.resetCooltime = 60;
                icamera = (icamera+1) % 4;
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 10; // 3;
                    camera.heightOffset = 2; // 1.1;
                    camera.cameraAcceleration = 0.05;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 50;
                    camera.heightOffset = 4;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 10;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 2;
                    camera.heightOffset = 100;
                    camera.cameraAcceleration = 0.5;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.3;
                    camera.heightOffset = -0.01;
                    camera.cameraAcceleration = 0.3;
                    camera.maxCameraSpeed = 30;
                }

            } else if (map["r"]) {
                keyAction.resetCooltime = 60;
                // キャラクターコントローラーの位置だけリセット
                characterController._position = characterPosition;

            } else if (map["h"]) {
                keyAction.resetCooltime = 60;
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
        }
    });

    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "150px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n(W,S) or (Arrow UP/DOWN): Forward/Back\n(A,D) or (Arrow Left/Right): turn Left/Right\n(Space): jump\n(Ctrl): rise\nC: change Camera\nR: Reset position\nH: show/hide this message";
    text1.color = "white";
    text1.width = "260px";
    text1.fontSize = 12;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    guiLabelRect.isVisible = false;

    return scene;
}

/*

- about
  - 国土交通省がゲーム開発などに使える日本都市の3Dモデルを無料配布。建築物のほか、その土地に関する細かなデータも収納
    https://www.famitsu.com/news/202303/01294513.html

  - 3D都市モデルデータを誰でも無料で利用できる　国土交通省の「PLATEAU」とは？
    https://techtrends.jp/keywords/plateau/


- TOPIC 17｜PLATEAU SDKでの活用[1/2]｜PLATEAU SDK for Unityを活用する
  https://www.mlit.go.jp/plateau/learning/tpc17-1/#p17_1

- install
  https://project-plateau.github.io/PLATEAU-SDK-for-Unity/manual/Installation.html

  - Unity Hub
  - Unity
  - PLATEAU SDK for Unity

- 3D都市モデルのインポート
  https://project-plateau.github.io/PLATEAU-SDK-for-Unity/manual/ImportCityModels.html

- 改善
  - 3D都市モデルは処理負荷軽減が重要。頂点数やLODを扱う工夫 ～クリエイターの開発事例～【中編】
    https://www.mlit.go.jp/plateau/journal/j018_2/

  - PLATEAU [プラトー]×Blender×PlayCanvasで街並みを再現する
    https://tech.gmogshd.com/plateau-3dbuilding/

  - PLATEAUのデータを必要な範囲だけダウンロードして表示する方法（仮）
    https://qiita.com/ra0kley/items/447aba1c1eedf2a13295

*/

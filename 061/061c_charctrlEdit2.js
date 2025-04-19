
// - カーソル上下/(w,s)で前後移動
// - カーソル右左/(a,d)で方向転換
// - space でジャンプ(ジャンプ時の移動は、地上の4倍に)
// +
// - 障害物　配置
// - カメラワーク
// - usage 表示

var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.radius = 10;
    camera.heightOffset = 2;
    camera.rotationOffset = 180;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 30;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 0;

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Initialize Havok plugin
    const hk = new BABYLON.HavokPlugin(false);
    // Enable physics in the scene with a gravity
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // 地面を設定する
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 200, height: 200 }, scene);
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

    // Player/Character state
    var state = "IN_AIR";
    var inAirSpeed = 20.0;
    var onGroundSpeed = 5.0;
    var jumpHeight = 5;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -18, 0);

    let keyAction = {forward:0, back:0, right:0, left:0, jump:0};

    // Physics shape for the character
    let h = 1.8;
    let r = 0.6;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: h, radius: r}, scene);
    let characterPosition = new BABYLON.Vector3(3., 0.3, -8.);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
    camera.lockedTarget = displayCapsule;

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 2);
    localAxes.xAxis.parent = displayCapsule; localAxes.yAxis.parent = displayCapsule; localAxes.zAxis.parent = displayCapsule;

    // State handling
    // depending on character state and support, set the new state
    var getNextState = function(supportInfo) {
        if (state == "IN_AIR") {
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
            return "IN_AIR";
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
        if (state == "IN_AIR") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            // Restore to original vertical component
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            // Add gravity
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            // Move character relative to the surface we're standing on
            // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
            // avoid artifacts caused by filtering of the output velocity when standing on moving objects.
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
            // Horizontal projection
            {
                outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
                let inv1k = 1e-3;
                if (outputVelocity.dot(upWorld) > inv1k) {
                    let velLen = outputVelocity.length();
                    outputVelocity.normalizeFromLength(velLen);
                    // Get the desired length in the horizontal direction
                    let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);
                    // Re project the velocity onto the horizontal plane
                    let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
                    outputVelocity = c.cross(upWorld);
                    outputVelocity.scaleInPlace(horizLen);
                }
                outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
                return outputVelocity;
            }
        } else if (state == "START_JUMP") {
            let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
            let curRelVel = currentVelocity.dot(upWorld);
            return currentVelocity.add(upWorld.scale(u - curRelVel));
        }
        return Vector3.Zero();
    }

    // Display tick update: update the capsule for the character display
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

        // キー操作に応じた左右の向き：姿勢を変更する
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

    // Input to direction
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 'ArrowUp') {
                inputDirection.z = 1;
                keyAction.forward = 1;
            } else if (kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowDown') {
                inputDirection.z = -1;
                keyAction.back = 1;
            } else if (kbInfo.event.key == 'a' || kbInfo.event.key == 'ArrowLeft') {
                // inputDirection.x = -1;
                keyAction.left = 1;
            } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
                // inputDirection.x = 1;
                keyAction.right = 1;
            } else if (kbInfo.event.key == ' ') {
                keyAction.jump = 1;
            } else if (kbInfo.event.key == 'c') {
                icamera = (icamera+1) % 4;
                console.log("camera=",icamera);
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
            } else if (kbInfo.event.key === 'h') {
                //   キー操作(h)で表示のon/offを切り替え
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowUp' || kbInfo.event.key == 'ArrowDown') {
                inputDirection.z = 0;    
                keyAction.forward = 0;
                keyAction.back = 0;
            }
            if (kbInfo.event.key == 'a' || kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowLeft' || kbInfo.event.key == 'ArrowRight') {
                inputDirection.x = 0;
                keyAction.left = 0;
                keyAction.right = 0;
            } else if (kbInfo.event.key == ' ') {
                keyAction.jump = 0;
            }
            break;
        }
    });


    // 左上に使い方（操作方法）を表示
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
    text1.text = "Usage:\n(W,S) or (Arrow UP/DOWN): forward/back\n(A,D) or (Arrow Left/Right): turn Left/Right\n(Space): Jump\nC: change Camera\nH: show/hide this message";
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


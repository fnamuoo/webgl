// ParticleSystem で ロケット発射時の煙

var createScene = function () {
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

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -0.98, 0), hk);


    // 地面を設定する
    if (1) {
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 500, height: 500 }, scene);
    groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMesh.material.majorUnitFrequency = 10;
    groundMesh.material.minorUnitVisibility  = 0;
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.3}, scene);
    }

    if (1) {
        // 物理演算系・自由に動かせる立体
        let adjx = 30, adjz = 30, adjy = 10;
        let nbox = 100;
        for (let ibox = 0; ibox < nbox; ++ibox) {
            const trgMesh = BABYLON.MeshBuilder.CreateBox("target", { size: 3 }, scene);
            let mat = new BABYLON.StandardMaterial("mat", scene);
            // mat.emissiveColor = BABYLON.Color3.Blue();
            mat.emissiveColor = BABYLON.Color3.Green();
            trgMesh.material = mat;
            var trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution:0.05}, scene);
            trgMesh.physicsBody.disablePreStep = true;
            trgMesh.position.x += adjx + BABYLON.Scalar.RandomRange(-adjx, adjx);
            trgMesh.position.z += adjz + BABYLON.Scalar.RandomRange(-adjz, adjz);
            trgMesh.position.y += adjy + ibox*5;
            trgMesh.physicsBody.disablePreStep = false;
        }
    }

    var state = "IN_AIR";
    var inAirSpeed = 20.0;
    var onGroundSpeed = 5.0;
    var jumpHeight = 5; // 1.5;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -18, 0);
    let keyAction = {forward:0, back:0, right:0, left:0, jump:0};
    let h = 1.8;
    let r = 0.6;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: h, radius: r}, scene);
    let characterPosition = new BABYLON.Vector3(3., 0.5, -8.);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
    camera.lockedTarget = displayCapsule;

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
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
            {
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
            }
        } else if (state == "START_JUMP") {
            let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
            let curRelVel = currentVelocity.dot(upWorld);
            return currentVelocity.add(upWorld.scale(u - curRelVel));
        }
        return Vector3.Zero();
    }
    scene.onBeforeRenderObservable.add((scene) => {
        displayCapsule.position.copyFrom(characterController.getPosition());
    });
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
                keyAction.left = 1;
            } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
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
                    camera.radius = 25;
                    camera.heightOffset = 4;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 10;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 0.1;
                    camera.heightOffset = 50;
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

    // ////////////////////////////////////////

    if (1) {
    // ロケットの発射時の煙っぽく
    // ３秒後に煙が出るので、切れる前にジャンプして
    // 発射台の煙
    let particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);
    particleSystem.emitter = new BABYLON.Vector3(3, 1, -8);
    particleSystem.color1 = new BABYLON.Color4(0.8, 0.8, 0.8, 1.0);
    particleSystem.color2 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    particleSystem.minLifeTime = 6.0;
    particleSystem.maxLifeTime = 8.0;
    particleSystem.emitRate = 500;
    particleSystem.createCylinderEmitter(0.3, 1, 0.3, 0);
    particleSystem.minEmitPower = 10;
    particleSystem.maxEmitPower = 10;
    particleSystem.updateSpeed = 0.005;
    particleSystem.start(3000);
    particleSystem.addSizeGradient(0, 3);
    particleSystem.addSizeGradient(1, 6);
    particleSystem.targetStopDuration = 1;
    // 本体の煙
    const particleSystem3 = new BABYLON.ParticleSystem("particles", 3000);
    particleSystem3.particleTexture = new BABYLON.Texture("textures/flare3.png");
    particleSystem3.emitter = displayCapsule;
    particleSystem3.minEmitBox = new BABYLON.Vector3(-0.02, -0.7, -0.02);
    particleSystem3.maxEmitBox = new BABYLON.Vector3( 0.02, -0.7, 0.02);
    particleSystem3.minScaleX = 0.4;
    particleSystem3.maxScaleX = 0.8;
    particleSystem3.minScaleY = 0.4;
    particleSystem3.maxScaleY = 0.8;
    particleSystem3.color1 = new BABYLON.Color4(1.0, 1.0, 0.0, 1.0);
    particleSystem3.color2 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
    particleSystem3.colorDead = new BABYLON.Color4(0.0, 0.0, 0.0, 0.0);
    particleSystem3.emitRate = 1000;
    particleSystem3.minLifeTime = 2;
    particleSystem3.maxLifeTime = 3;
    particleSystem3.start(3500);
    }

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

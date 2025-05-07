// チューブで滑り台
//
// キャラクターコントローラー
//  - カーソル上下/(w,s) .. 前後移動
//  - カーソル右左/(a,d) .. 方向転換
//  - space .. ジャンプ(ジャンプ時の移動は、地上の4倍に)
//  - enter .. スタート地点／頂上に移動
//  - b     .. 頂上にボールを出現
//  - c     .. カメラ１の視点切り替え
//  - v     .. カメラ２（ワイプ）の切り替え
//  - n     .. ステージの切り替え

const R5 = Math.PI/36; // 5度  360=72回 , 180=36回, 90=18回, 45=9回
const R90 = Math.PI/2;
const R180 = Math.PI;
const R360 = Math.PI*2;

function createTube(geo, mat, scene) {
    let trgMesh, trgAgg;
    let adjy = 1.733, x=0, y=0, z=0;
    let myPath = [];
    if (geo.type == 'st') {
        myPath = [
            new BABYLON.Vector3(x, y+adjy, z+0),
            new BABYLON.Vector3(x, y+adjy, z+50)
            ];

    } else if (geo.type == 'type1') {
        // 円（コイル）、等幅で上昇
        let nloop = 2, loopy = 8, r = 10;
        if ('nloop' in geo) { nloop = geo.nloop; }
        if ('loopy' in geo) { loopy = geo.loopy; }
        if ('r' in geo) { r = geo.r; }
        let n = nloop*72, stepy = loopy/72;
        for (let i = 0; i < n; ++i) {
            irad = i * R5;
            x = r*Math.cos(irad); y = i*stepy + adjy; z = r*Math.sin(irad);
            myPath.push(new BABYLON.Vector3(x, y, z));
        }

    } else if (geo.type == 'type2') {
        // らせん／円で半径を徐々に大きく、等幅で上昇
        let nloop = 2, loopy = 8, r = 5, rstep = 0.1;
        if ('nloop' in geo) { nloop = geo.nloop; }
        if ('loopy' in geo) { loopy = geo.loopy; }
        if ('r' in geo) { r = geo.r; }
        let n = nloop*72, stepy = loopy/72;
        for (let i = 0; i < n; ++i) {
            irad = i * R5;
            x = r*Math.cos(irad); y = i*stepy + adjy; z = r*Math.sin(irad);
            myPath.push(new BABYLON.Vector3(x, y, z));
            r += rstep;
        }

    } else if (geo.type == 'type3') {
        // 乱数（等確率）で右／左の円弧(90度ごと)、等幅で上昇
        let narc = 8, arcy = 2, r = 10;
        if ('narc' in geo) { narc = geo.narc; }
        if ('loopy' in geo) { loopy = geo.loopy; }
        if ('r' in geo) { r = geo.r; }
        let stepy = arcy/18, jarc = 0, x0=0, z0=0, arcType, arcTypeOld = true, i = 0;
        // for debug
        // let arcTypeList = [true, true, true, true, true, true, true, true];
        // let arcTypeList = [false, false, false, false, false, false, false, false];
        // let arcTypeList = [true, false, true, false, true, false, true, false];
        // let arcTypeList = [true, true, false, true, false, true, false, true];
        // let arcTypeList = [true, true, true, false, true, false, true, false];
        // let arcTypeList = [true, true, true, true, false, true, false, true];
        for (let iarc = 0; iarc < narc; ++iarc) {
            arcType = (Math.random() < 0.5);
            // arcType = arcTypeList.shift();
            if (arcType) {
                // 左円弧
                if (arcTypeOld != arcType) {
                    x0 += -2*r*Math.cos(jarc*R90); z0 += -2*r*Math.sin(jarc*R90);
                }
                for (let j = 0; j < 18; ++j) {
                    irad = j * R5 + jarc*R90;
                    x = x0 + r*Math.cos(irad); y = i*stepy + adjy; z = z0 + r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                    ++i;
                }
                jarc = (jarc+1)%4;
            } else {
                // 右円弧
                if (arcTypeOld != arcType) {
                    x0 += 2*r*Math.cos(jarc*R90); z0 += 2*r*Math.sin(jarc*R90);
                }
                for (let j = 0; j < 18; ++j) {
                    irad = -j*R5 + jarc*R90 + R180;
                    x = x0 + r*Math.cos(irad); y = i*stepy + adjy; z = z0 + r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                    ++i;
                }
                jarc = (jarc+3)%4;
            }
            arcTypeOld = arcType;
        }

    } else if (geo.type == 'type4') {
        // 乱数（等確率）で３種（直進、左右の旋回）、等幅で上昇
        // 進行方向ベクトルと旋回のクォータニオンで経路を作成
        let narc = 24, roty = R5, stepy = 0.2, nloop = 15, vst = 1;
        if ('narc' in geo) { narc = geo.narc; }   // 方向転換の数
        if ('stepy' in geo) { stepy = geo.stepy; } // ｙ方向／垂直方向の増分
        if ('vst' in geo) { vst = geo.vst; } // 進行方向の増分
        const quatL = BABYLON.Quaternion.FromEulerAngles(0, roty, 0);
        const quatR = BABYLON.Quaternion.FromEulerAngles(0, -roty, 0);
        const quat0 = new BABYLON.Quaternion();
        let vposi = new BABYLON.Vector3(0, 0, 0); // 座標位置(x,zのみ利用)
        let vdir = new BABYLON.Vector3(0, 0, vst); // 進行方向ベクトル
        let jarc = 0, i = 0, x=0, y=adjy, z=0, idir, quat;
        for (let iarc = 0; iarc < narc; ++iarc) {
            idir = Math.floor(Math.random()*3);
            // idir = 2;
            quat = quat0; // 直進
            if (idir == 0) {
                // 左折
                quat = quatL;
            } else if (idir == 1) {
                // 右折
                quat = quatR;
            }
            for (let iloop = 0; iloop < nloop; ++iloop) {
                vdir = vdir.applyRotationQuaternion(quat); // 進行方向ベクトルの方位を変える
                vposi.addInPlace(vdir);
                myPath.push(new BABYLON.Vector3(vposi.x, y, vposi.z));
                y += stepy;
            }
        }


    } else {
        return [trgMesh, trgAgg, null];
    }
    trgMesh = BABYLON.MeshBuilder.CreateTube("tube", {path: myPath, radius: 2, sideOrientation: BABYLON.Mesh.DOUBLESIDE, tessellation: 6}, scene);
    trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
    if (mat != null) {
        trgMesh.material = mat;
    }
    trgMesh.physicsBody.disablePreStep = true;
    trgMesh.position = new BABYLON.Vector3(geo.x, geo.y, geo.z);
    if (('rot' in geo) && (geo.rot != 0)) {
        trgMesh.rotate(new BABYLON.Vector3(0, 1, 0), geo.rot, BABYLON.Space.WORLD);
    }
    if (('rotx' in geo) && (geo.rotx != 0)) {
        trgMesh.rotate(new BABYLON.Vector3(1, 0, 0), geo.rotx, BABYLON.Space.WORLD);
    }
    trgMesh.physicsBody.disablePreStep = false;
    return [trgMesh, trgAgg, myPath[myPath.length-3]];
}


var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.rotationOffset = 180;
    camera.radius = 3;
    camera.heightOffset = 1.1;
    camera.cameraAcceleration = 0.1;
    camera.maxCameraSpeed = 30;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 0, ncamera = 4;

    // ボール赤用カメラ
    // let camera2Wipe = false; // ワイプ表示 (iniSetBall==false時のみ有効)
    let camera2type = 0; // ワイプ表示 (0: 無し、1: caemra2, 2:camera2B
    let camera2 = new BABYLON.ArcRotateCamera("Camera2", 0, 0, 0, new BABYLON.Vector3(2, 5, -10), scene);
    camera2.rotationOffset = 180;
    camera2.radius = 3;
    camera2.heightOffset = 1.1;
    camera2.setTarget(BABYLON.Vector3.Zero());
    camera2.attachControl(canvas, true);
    camera2.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    let camera2B = new BABYLON.FreeCamera("Camera2B", new BABYLON.Vector3(2, 5, -10), scene);
    camera2B.setTarget(BABYLON.Vector3.Zero());
    camera2B.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    scene.activeCameras.push(camera);
    camera.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
    camera2.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);
    camera2B.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);

    let iPosiList = [];
    let iPosi = 0;

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 200, height: 200 }, scene);
    groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMesh.material.majorUnitFrequency = 1;
    groundMesh.material.minorUnitVisibility  = 0;
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);

    if (1) {
    // Skybox
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    }


    function createMat(type) {
        let mat = null;
        if (type=='std_wire') {
            mat = new BABYLON.StandardMaterial("mat", scene);
            mat.emissiveColor = BABYLON.Color3.Blue();
            mat.wireframe = true;
        } else if (type=='std_trans') {
	    mat = new BABYLON.StandardMaterial('mat', scene);
	    mat.diffuseColor = BABYLON.Color3.Blue();
	    mat.alpha = 0.7;
        } else if (type=='std_red') {
	    mat = new BABYLON.StandardMaterial('mat', scene);
	    mat.diffuseColor = BABYLON.Color3.Red();
	    mat.alpha = 0.7;
        } else if (type=='nmr') {
            mat = new BABYLON.NormalMaterial("mat", scene);
            mat.wireframe = true;
            trgMesh.material = mat;
        } else if (type=='grid') {
	    mat = new BABYLON.GridMaterial("mat", scene);
	    mat.majorUnitFrequency = 5;
	    mat.gridRatio = 0.5;
        } else if (type=='grad') {
	    mat = new BABYLON.GradientMaterial("grad", scene);
            mat.topColor = new BABYLON.Color3(1, 1, 1);
            mat.bottomColor = new BABYLON.Color3(0, 0, 1);
            mat.offset = 0.5;
            mat.smoothness = 1;
            mat.wireframe = true;
        }
        return mat;
    }

    let mat = createMat('grid');
    let mat2 = createMat('std_wire');
    let matMy = createMat('std_trans'); // 自機
    let matRed = createMat('std_red'); // ボール（赤

    let nstage = 4;
    let istage = 0;
    let stageMesh = null, stageAgg = null, lastPosi;
    // !!!
    function createStage(istage) {
        if (stageAgg != null) {
            stageAgg.dispose();
        }
        if (stageMesh != null) {
            stageMesh.dispose();
        }
        if (0) {
            // !!!
        } else if (istage == 0) {
            [stageMesh, stageAgg, lastPosi] = createTube({type:'type1', nloop:10, x:0, y:0, z:0}, mat2, scene);
        } else if (istage == 1) {
            [stageMesh, stageAgg, lastPosi] = createTube({type:'type2', nloop:10, x:0, y:0, z:0}, mat2, scene);
        } else if (istage == 2) {
            [stageMesh, stageAgg, lastPosi] = createTube({type:'type3', narc:40, x:0, y:0, z:0}, mat2, scene);
        } else if (istage == 3) {
            [stageMesh, stageAgg, lastPosi] = createTube({type:'type4', narc:50, x:0, y:0, z:0}, mat2, scene);
        }
        if (iPosiList.length >= 2) {
            iPosiList.pop();
        }
        iPosiList.push(lastPosi);
        // return [stageMesh, stageAgg, lastPosi];
    }
    createStage(istage);

    // ボールの配置
    let balls = [];
    let iniSetBall = true;
    function setBalls() {
        for (let [trgMesh, trgAgg] of balls) {
            trgAgg.dispose();
            trgMesh.dispose();
        }
        balls = [];
        let posi = iPosiList[1];
        for (let i = 0; i < 3; ++i) {
            let trgMesh, trgAgg;
            trgMesh = BABYLON.MeshBuilder.CreateSphere("target", { diameter: 1, segments: 8 }, scene);
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.1, restitution:0.05}, scene);

            trgAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            trgAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
            trgMesh.position.copyFrom(posi);
            trgMesh.position.x += BABYLON.Scalar.RandomRange(-0.1, 0.1);
            trgMesh.position.y += BABYLON.Scalar.RandomRange(1, 1.5);
            trgMesh.position.z += BABYLON.Scalar.RandomRange(-0.1, 0.1);
            balls.push([trgMesh, trgAgg]);
            if (i == 0) {
                trgMesh.material = matRed;
            }
        }
        if (iniSetBall) {
            iniSetBall = false;
            scene.activeCameras.push(camera2);
            camera2type = 1;
        }
        camera2.lockedTarget = balls[0][0];
        camera2B.lockedTarget = balls[0][0];
    }

    // Player/Character state
    var state = "IN_AIR";
    let inAirSpeed = 20.0;
    let onGroundSpeed = 5.0;
    let inAirSpeedBase = 20.0;
    let onGroundSpeedBase = 5.0;
    let bDash = 3;
    var jumpHeight = 5; // 1.5;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -18, 0);
    let keyAction = {forward:0, back:0, right:0, left:0, jump:0};
    let h = 1.8;
    let r = 0.6;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: h, radius: r}, scene);
    displayCapsule.material = matMy;
    let characterPosition = new BABYLON.Vector3(3., 0.5, -8.);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
    iPosiList.unshift(characterPosition);
    camera.lockedTarget = displayCapsule;

    if (1) {
    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 1);
    localAxes.xAxis.parent = displayCapsule; localAxes.yAxis.parent = displayCapsule; localAxes.zAxis.parent = displayCapsule;
    }

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
        // カメラ２用の更新
        if (camera2type >= 2) {
            let ballMesh = balls[0][0];
            let vdir = camera2B.position.subtract(ballMesh.position).normalize().scale(5);
            vdir.y = 1;
            camera2B.position = ballMesh.position.add(vdir);
        }
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
            if (kbInfo.event.shiftKey) {
                console.log("shift  .. ON DASH!!");
                inAirSpeed = inAirSpeedBase * bDash;
                onGroundSpeed = onGroundSpeedBase * bDash;
            }
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
                console.log("shift  .. off dash");
                inAirSpeed = inAirSpeedBase;
                onGroundSpeed = onGroundSpeedBase;
            } else if (kbInfo.event.key == 'n') {
                istage = (istage+1) % nstage;
                createStage(istage);
                characterController._position = iPosiList[iPosi].clone();
            } else if (kbInfo.event.key == 'c') {
                icamera = (icamera+1) % ncamera;
                console.log("camera=",icamera);
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 3;
                    camera.heightOffset = 1.1;
                    camera.cameraAcceleration = 0.1;
                    camera.maxCameraSpeed = 30;
                    camera.lockedTarget = displayCapsule;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 20;
                    camera.heightOffset = 8;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 0.1;
                    camera.heightOffset = 50;
                    camera.cameraAcceleration = 0.5;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.5;
                    camera.heightOffset = 0.1;
                    camera.cameraAcceleration = 0.3;
                    camera.maxCameraSpeed = 30;
                }
            } else if (kbInfo.event.key == 'v') {
                if (iniSetBall == false) {
                    // メイン(camera)とサブ(camera2,camera2B)の複数カメラワーク
                    camera2type = (camera2type+1) % 4;
                    if (camera2type == 0) {
                        // メインのみ
                        while (scene.activeCameras.length > 0) {
                            scene.activeCameras.pop();
                        }
                        scene.activeCameras.push(camera);
                        camera.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
                        camera2B.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);
                    } else if (camera2type == 1) {
                        // メイン（全画面）＋サブ（ワイプ）
                        if (scene.activeCameras.length >= 2) {
                            scene.activeCameras.pop();
                        }
                        scene.activeCameras.push(camera2);
                    } else if (camera2type == 2) {
                        // メイン（全画面）＋サブ（ワイプ）：サブのカメラを入れ替え
                        if (scene.activeCameras.length >= 2) {
                            scene.activeCameras.pop();
                        }
                        scene.activeCameras.push(camera2B);
                    } else if (camera2type == 3) {
                        // サブ（全画面）＋メイン（ワイプ）：メインとサブを入れ替え
                        while (scene.activeCameras.length > 0) {
                            scene.activeCameras.pop();
                        }
                        scene.activeCameras.push(camera2B);
                        scene.activeCameras.push(camera);
                        camera2B.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
                        camera.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);
                    }
                }
            } else if (kbInfo.event.key === 'h') {
                //   キー操作(h)で表示のon/offを切り替え
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            } else if (kbInfo.event.key === 'Enter') {
                iPosi = (iPosi+1) % iPosiList.length;
                characterController._position = iPosiList[iPosi].clone();
            } else if (kbInfo.event.key === 'b') {
                setBalls();
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

    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "170px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n(W,S) or (Arrow UP/DOWN): forward/back\n(A,D) or (Arrow Left/Right): turn Left/Right\n(Enter): goto start/top\n(Space): Jump\nC: change Camera\nN: next stage\nB: pop 3 Balls on top\nV: change Camera2\nH: show/hide this message";
    text1.color = "white";
    text1.width = "260px";
    text1.fontSize = 12;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    guiLabelRect.isVisible = false; // デフォルトでoffにしておく
    
    return scene;
};


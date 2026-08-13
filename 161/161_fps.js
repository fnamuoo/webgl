// Babylon.js で物理演算(Havok) ：FPSゲーム２（手探り中）
//
// 操作
// ArrowUp/ArrowDown   (w/s) .. 前進/後退
// ArrowLeft/ArrowRight(q/e) .. 左右旋回（ヨー回転）
// a/d                       .. 左右移動
// 1/2/3/4/5/6/7/8/9         .. 武器変更(*1)
// space                     .. ジャンプ
// enter                     .. 位置リセット
// c                         .. カメラ切り替え
// マウスクリック            .. 射撃（プレイヤー視点の場合のみ）

// *1)
// 種類     | キー | 射程   | 照準角 |リロードタイム
// ---------|:----:|--------|--------|-----------------
// 拳銃     | 1    | 近     | 狭     | 速
// ライフル | 2    | 中     | 狭     | 中
// 大玉     | 3    | 中～遠 | 狭     | 中
// 拳銃     | 4    | 近     | 広     | 中
// ライフル | 5    | 中     | 広     | 遅
// 大玉     | 6    | 中～遠 | 広     | 遅
// 拳銃     | 7    | 近     | (正面のみ) | 速
// ライフル | 8    | 中     | (正面のみ) | 中
// 大玉     | 9    | 中     | (正面のみ) | 中

export var createScene_test_3105 = async function () {
//    const dbase = "textures/irasutoya/";
    const dbase = "textures/";
//    const dbase = "https://raw.githubusercontent.com/fnamuoo/webgl/main/161/textures/";

    const fpathCharList = [
        dbase + "figure_barrier_hemisphere.png",
        dbase + "figure_barrier_plate.png",
        dbase + "figure_blank.png",
        dbase + "figure_angry.png",
        dbase + "figure_anti.png",
        dbase + "figure_buki_kakushimotsu.png",
        dbase + "figure_fighting_pose.png",
        dbase + "figure_fighting_punch.png",
        dbase + "figure_fire_tsukeru.png",
        dbase + "figure_hiniabura.png",
        dbase + "figure_kanabou.png",
        dbase + "figure_kyoubou.png",
        dbase + "figure_rpg_character_butouka.png",
        dbase + "figure_rpg_character_kenshi.png",
        dbase + "figure_rpg_character_mahoutsukai.png",
        dbase + "figure_rpg_character_yuusya.png",
    ];
    const nfpathCharList = fpathCharList.length;

    const scene = new BABYLON.Scene(engine);
    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        // 101用
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(75, 0, -65.5)); // ヨーロッパ
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        return _camera;
    }
    let crCamera2 = function() {
        // バードビュー：対象(cameraTrgMesh)を後方から追跡 .. 速度依存（対象が速いと置いて行かれる）
        let _camera = new BABYLON.FollowCamera("", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 2; // 4;
        _camera.heightOffset = 1; // 2;
        _camera.cameraAcceleration = 0.005;
        _camera.maxCameraSpeed = 5; // 10;
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        let mesh = BABYLON.MeshBuilder.CreateBox("", {}, scene);
        mesh.visibility = 0; // 不可視に
        _camera._vtrg = mesh.position.clone();
        _camera.lockedTarget = mesh;
        return _camera;
    }
    let crCamera3 = function() {
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 3; // 1.3;
        _camera.heightOffset = 0.5; // 0.0;
        _camera.cameraAcceleration = 0.05; // 0.3;
        _camera.maxCameraSpeed = 30;
        return _camera;
    }
//    camera = crCameraDef(); // debug
//     camera = crCamera2();
     camera = crCamera3();

    let icamera=0, ncamera=4;
    let setCAM3 = function(icamera) {
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 3;
                    camera.heightOffset = 1.1; // 0.5;
                    camera.cameraAcceleration = 0.05; // 0.1;
                    camera.maxCameraSpeed = 5; // 30;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 20;
                    camera.heightOffset = 3; // 8;
                    camera.cameraAcceleration = 0.02; // 0.005;
                    camera.maxCameraSpeed = 5; // 30;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 1;
                    camera.heightOffset = 30;
                    camera.cameraAcceleration = 0.5;
                    camera.maxCameraSpeed = 100;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／プレイヤーズ・ビュー
                    camera.radius = 0.5; // 1.3;
                    camera.heightOffset = -0.05; // 0;
                    camera.cameraAcceleration = 0.5; // 0.3;
                    camera.maxCameraSpeed = 100;
                }
    }
    let changeCAM3 = function(_icamera) {
        icamera = (_icamera+1) % ncamera;
        // console.log("camera=",icamera);
        setCAM3(icamera);
    }
    setCAM3(icamera);

    const light = new BABYLON.HemisphericLight("", new BABYLON.Vector3(1000, 1000, 0));

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // --------------------------------------------------

    let crPlane48 = function() {
        // 人型：式神
        let R180 = Math.PI;
        let mesh = new BABYLON.TransformNode();
        // 頭
        let mesh1 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.8}, scene);
        mesh1.position.set(0.0, 1.0, 0);
        mesh1.parent = mesh;
        // 手
        let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:3.5, diameterZ:0.5, slice:0.3, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh2.rotation.set(R180, 0, 0.0);
        mesh2.position.set(0.0, 1.7, 0);
        mesh2.parent = mesh;
        // 足
        let mesh3 = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:0.8, diameterBottom:0.1, height:1.8}, scene);
        mesh3.position.set(0.0, -0.9, 0.0);
        mesh3.scaling.set(1, 1, 0.2);
        mesh3.parent = mesh;
        mesh.scaling.set(0.4, 0.4, 0.4);
        return mesh;
    }


    // Player/Character state
    var state = "IN_AIR";
    var inAirSpeed = 10.0;
    var onGroundSpeed = 5.0;
    var jumpHeight = 3;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    // let characterGravity = new BABYLON.Vector3(0, -18, 0);
    let characterGravity = new BABYLON.Vector3(0, -9, 0);
    let boostRate = 3;

    let keyAction = {forward:0, back:0, right:0, left:0, jump:0, boost:0};
    // 0: 移動
    // 1: 射撃
    let mode = 0, nmode = 2;

    // Physics shape for the character
    let h = 1.5, r = 0.3;
    let displayCapsule = crPlane48(); // 式神
    let myMesh = displayCapsule;
    myMesh.rotationQuaternion = characterOrientation;

//    let characterPosition = new BABYLON.Vector3(0, 10, 0);
    let pReset = new BABYLON.Vector3(0, 110, 0);
    let characterPosition = pReset.clone();

    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
    camera.lockedTarget = displayCapsule;

    displayCapsule.material = new BABYLON.StandardMaterial('mat', scene);
    displayCapsule.material.diffuseColor = BABYLON.Color3.Blue();
    displayCapsule.material.alpha = 0.7;
    // displayCapsule.material.wireframe = 1;
    let meshMe = displayCapsule;

    // State handling
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
            if (keyAction.boost) { desiredVelocity.scaleInPlace(boostRate); }
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            if (keyAction.boost) { desiredVelocity.scaleInPlace(boostRate); }
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
        const rotRad = 0.08; // 0.02;
        if (keyAction.right > 0) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), rotRad*keyAction.right);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, rotRad, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        } else if (keyAction.left > 0) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), -rotRad*keyAction.left);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, -rotRad, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        }
        let desiredLinearVelocity = getDesiredVelocity(dt, support, characterOrientation, characterController.getVelocity());
        characterController.setVelocity(desiredLinearVelocity);
        characterController.integrate(dt, support, characterGravity);
    });
    let resetPosi = function(p) {
        characterController.setVelocity(new BABYLON.Vector3(0, 0, 0));
        characterController.setPosition(p);
        // 向きをリセット Z軸＋方向を向かせる
        characterOrientation = BABYLON.Quaternion.FromEulerVector(new BABYLON.Vector3(0, 0, 0));
        displayCapsule.rotationQuaternion = characterOrientation.clone();
    }

    // Input to direction
    let map ={};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    let quick=false, rightRoll = false, lefttRoll = false;
    let mx=1,mz=1;
    let mvScale=0.2;
    let cooltime_act = 0, cooltime_actIni = 10;
    scene.registerAfterRender(function() {
        inputDirection.x = 0;
        inputDirection.z = 0;    
        keyAction = {forward:0, back:0, right:0, left:0, jump:0, boost:0};

        if (map["w"] || map["ArrowUp"]) {
            inputDirection.z = 1;
            keyAction.forward = 1;
        } else if (map["s"] || map["ArrowDown"]) {
            inputDirection.z = -1;
            keyAction.back = 1;
        }

        if (map["a"]) {
            inputDirection.x = -1;
        } else if (map["d"]) {
            inputDirection.x = 1;
        }
        if (map["ArrowRight"] || map["e"]) {
            keyAction.right = 1;
        } else if (map["ArrowLeft"] || map["q"]) {
            keyAction.left = 1;
        }

        if (map[" "]) {
            keyAction.jump = 1;
        }
        if (map["ctrl"]) {
            keyAction.boost = 1;
        }
        
        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["c"]) {
                cooltime_act = cooltime_actIni;
                changeCAM3(icamera);
            } else if (map["z"]) {
                cooltime_act = cooltime_actIni;
                if (++mode == nmode) {mode = 0;}
            } else if (map["Enter"]) {
                cooltime_act = cooltime_actIni;
                resetPosi(pReset);
                {
console.log("meshCheck.length=",meshCheck.length," + nRestAdv=",nRestAdv, " bCallNextStage=",bCallNextStage);
                }
            } else if (map["1"]) {
                iweapon = 1;
console.log("iweapon=",iweapon)
            } else if (map["2"]) {
                iweapon = 2;
console.log("iweapon=",iweapon)
            } else if (map["3"]) {
                iweapon = 3;
console.log("iweapon=",iweapon)
            } else if (map["4"]) {
                iweapon = 4;
            } else if (map["5"]) {
                iweapon = 5;
            } else if (map["6"]) {
                iweapon = 6;
            } else if (map["7"]) {
                iweapon = 7;
            } else if (map["8"]) {
                iweapon = 8;
            } else if (map["9"]) {
                iweapon = 9;
            } else if (map["0"]) {
                iweapon = 0;
console.log("iweapon=",iweapon)
            } else if (map["n"] || map["b"]) {
                cooltime_act = cooltime_actIni;
                if (map["n"]) {
                    if (++istage == nstage) { istage = 0; }
                } else {
                    if (--istage < 0) { istage = nstage-1; }
                }
                createStage();
                resetPosi(pReset);
            }
        }
    });

    let meshWeapon = [];
    let iweapon = 0;
    let weaponAtt = {
        // 射程距離^2, 発射速度 .弾質量   ,弾大きさ,存在step,射撃間隔              , 射角(1-余弦値)の補数
        1:{rSq:100  , spd:100   , mass:0.1, s:0.1, life:20 , cool:0, coolReload:1  , shtAng:0.99, }, // マシンガン
        2:{rSq:10000, spd:100000, mass:5  , s:0.2, life:50 , cool:0, coolReload:100, shtAng:0.99, }, // ライフル
        3:{rSq:10000, spd:50    , mass:100, s:5  , life:200, cool:0, coolReload:150, shtAng:0.99, }, // 巨岩
        // 射角広く、cool時間を長く
        4:{rSq:100  , spd:100   , mass:0.1, s:0.1, life:20 , cool:0, coolReload:2  , shtAng:0.95, }, // マシンガン
        5:{rSq:10000, spd:100000, mass:5  , s:0.2, life:50 , cool:0, coolReload:150, shtAng:0.95, }, // ライフル
        6:{rSq:10000, spd:50    , mass:100, s:5  , life:200, cool:0, coolReload:200, shtAng:0.95, }, // 巨岩
        // 照準なしで弾をばらまく
        7:{rSq:100  , spd:100   , mass:0.1, s:0.1, life:20 , cool:0, coolReload:1  , shtAng:-1, }, // マシンガン
        8:{rSq:10000, spd:100000, mass:5  , s:0.2, life:50 , cool:0, coolReload:100, shtAng:-1, }, // ライフル
        9:{rSq:10000, spd:50    , mass:100, s:5  , life:200, cool:0, coolReload:150, shtAng:-1, }, // 巨岩
    };
    scene.registerAfterRender(function() {
        if ((iweapon > 0) && (--weaponAtt[iweapon].cool <= 0)) {
            // 自動射撃
            if (iweapon <= 6) {
                if (icamera != 3) {
                    // フロントビュー以外 ..  射程内に入ったら自動で攻撃
                    let quat = myMesh.rotationQuaternion;
                    let vdir0 = BABYLON.Vector3.Forward().applyRotationQuaternion(quat); // 進行方向
                    let rSq = weaponAtt[iweapon].rSq;
                    let meshTrg = null;
                    for (let m of meshCheck) {
                        let lenSq = BABYLON.Vector3.DistanceSquared(myMesh.position, m.position)
                        if (lenSq < rSq) {
                            // 射程内に見つかった。姿勢（向き）と位置関係を見て、視線の範囲にある場合に対象とする
                            let vdir = m.position.subtract(myMesh.position).normalize(); // 目標の方向
                            // 高さ方向は無視して、ヨー角だけをみる
                            vdir0.y = 0;
                            vdir.y = 0;
                            let vcos = vdir0.dot(vdir);
                            if (weaponAtt[iweapon].shtAng < vcos) { // 約8[degree]
                                meshTrg = m;
                                break;
                            }
                        }
                    }
                    // console.log("w.i=", iweapon, ", rSq=",rSq, ", mesh=",mesh);
                    if (meshTrg != null) {
                        // let vdir0 = BABYLON.Vector3.Forward().applyRotationQuaternion(quat); // 進行方向
                        let vdir = meshTrg.position.subtract(myMesh.position).normalize(); // 目標の方向
                        let p0 = vdir.add(myMesh.position);
                        let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:weaponAtt[iweapon].s}, scene);
                        mesh.position.copyFrom(p0);
                        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, {mass:weaponAtt[iweapon].mass}, scene);
                        vdir.scaleInPlace(weaponAtt[iweapon].spd);
                        mesh._agg.body.applyImpulse(vdir, mesh.absolutePosition);
                        mesh._life = weaponAtt[iweapon].life;
                        meshWeapon.push(mesh);
                        weaponAtt[iweapon].cool = weaponAtt[iweapon].coolReload;
                    }
                }
            } else {
                // 前方に弾をばらまく
                let quat = myMesh.rotationQuaternion;
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat); // 進行方向
                let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:weaponAtt[iweapon].s}, scene);
                mesh.position.copyFrom(vdir.add(myMesh.position));
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, {mass:weaponAtt[iweapon].mass}, scene);
                vdir.scaleInPlace(weaponAtt[iweapon].spd);
                mesh._agg.body.applyImpulse(vdir, mesh.absolutePosition);
                mesh._life = weaponAtt[iweapon].life;
                meshWeapon.push(mesh);
                weaponAtt[iweapon].cool = weaponAtt[iweapon].coolReload;
            }
        }
        // 弾のlife が尽きたら削除
        {
            let dels = [];
            for (let m of meshWeapon) {
                if (--m._life <= 0) {
                    dels.push(m);
                }
            }
            for (let m of dels) {
                let i = meshWeapon.indexOf(m);
                meshWeapon.splice(i, 1);
                m.dispose();
            }
        }
    });

    // http://localhost:3000/features/featuresDeepDive/physics/raycast/
    // https://playground.babylonjs.com/#I6AR8X
    var useRaycast = true;
    scene.skipPointerMovePicking = true;
    var pickingRay = new BABYLON.Ray(
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, 1)
    );
    var raycastResult = new BABYLON.PhysicsRaycastResult();
    var physEngine = scene.getPhysicsEngine();
    scene.onPointerPick = (event, pickInfo) => {
        if ((iweapon > 0) && (--weaponAtt[iweapon].cool <= 0)) {
            // 手動で攻撃、クリック位置の方向に射出
            if (icamera != 3) {return;}
            var hit = false;
            var hitPos = null;
            scene.createPickingRayToRef(
                scene.pointerX,
                scene.pointerY,
                null,
                pickingRay,
                camera
            );
            physEngine.raycastToRef(pickingRay.origin, pickingRay.origin.add(pickingRay.direction.scale(10000)), raycastResult);
            hit = raycastResult.hasHit;
            hitPos = raycastResult.hitPointWorld;
            if (hit) {
                let vdir = pickingRay.direction.clone().normalize();
                let p0 = vdir.add(myMesh.position);
                let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:weaponAtt[iweapon].s}, scene);
                mesh.position.copyFrom(p0);
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, {mass:weaponAtt[iweapon].mass}, scene);
                vdir.scaleInPlace(weaponAtt[iweapon].spd);
                mesh._agg.body.applyImpulse(vdir, mesh.absolutePosition);
                mesh._life = weaponAtt[iweapon].life;
                meshWeapon.push(mesh);
                // 手動で照準の場合は cool時間を短縮
                weaponAtt[iweapon].cool = Math.floor(weaponAtt[iweapon].coolReload*0.2)-1;
            }
        }
    };


    let crGrnd = function(size=100) {
        // 平面地面
        let grndW = size, grndH = size;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
        return mesh;
    }

    let addCharPanel = function(charPath, myMesh, width=1, adjy=0.0, clipy=0.0) {
	let matFB = new BABYLON.StandardMaterial("");
	matFB.diffuseTexture = new BABYLON.Texture(charPath);
	matFB.diffuseTexture.hasAlpha = true;
	matFB.emissiveColor = new BABYLON.Color3.White();
        let planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {width:width, height:2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        planeFB.position.y = adjy;
        planeFB.material = matFB;
        planeFB.parent = myMesh;
        myMesh._planeFB = planeFB;
    }

    let crBlock = function(p, type=0) {
        let mesh = null, s = 2, mass = 1;
        if (type == 0) {
            mass = 0.01;
            mesh = BABYLON.MeshBuilder.CreateBox("", {size:s}, scene);
            mesh.position.copyFrom(p);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.emissiveColor = BABYLON.Color3.Gray();
            mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.alpha = 0.4;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mass, friction:0.001, startAsleep:true}, scene);
            mesh._type = 'n'; // fri / neu/ adv

        } else if (type == 1) {
            mass = 5;
            mesh = BABYLON.MeshBuilder.CreateBox("", {size:s}, scene);
            // mesh.position.set(px, py, pz);
            mesh.position.copyFrom(p);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.emissiveColor = BABYLON.Color3.Black();
            mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.alpha = 0.4;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mass, friction:0.6, startAsleep:true}, scene);
            mesh._type = 'n'; // fri / neu/ adv

        } else if (type == 2) {
            mass = 0;
            mesh = BABYLON.MeshBuilder.CreateBox("", {size:s, height:10}, scene);
            // mesh.position.set(px, py, pz);
            mesh.position.copyFrom(p);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.emissiveColor = BABYLON.Color3.White();
            mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mass, friction:0.6, startAsleep:true}, scene);
            mesh.physicsBody.disablePreStep = false;
            mesh._type = 'n'; // fri / neu/ adv

        } else if (type == 3) {
            mass = 1;
            mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.6, height:s, depth:0.1}, scene);
            // mesh.position.set(px, py, pz);
            mesh.position.copyFrom(p);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.emissiveColor = BABYLON.Color3.White();
            mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.alpha = 0.2;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mass, friction:0.6, startAsleep:true}, scene);
            mesh.physicsBody.disablePreStep = false;
            mesh._type = 'adv'; // fri / neu/ adv

        } else if (type == 4) {
            mass = 500;
            mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:s, depth:0.1}, scene);
            // mesh.position.set(px, py, pz);
            mesh.position.copyFrom(p);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.emissiveColor = BABYLON.Color3.White();
            mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.alpha = 0.2;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mass, friction:0.6, startAsleep:true}, scene);
            mesh.physicsBody.disablePreStep = false;
            mesh._type = 'adv'; // fri / neu/ adv
        }
        return mesh;
    }

    let crBase = function(p, type=0) {
        let mesh = null;
        mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter: 1, segments: 24, slice: 0.5}, scene);
        mesh.position.copyFrom(p);
        changeBase(mesh, type);
        return mesh;
    }
    let matFri = null, matNeu = null, matAdv = null;
    {
        matFri = new BABYLON.StandardMaterial("");
        matFri.emissiveColor = BABYLON.Color3.Red();
        matFri.diffuseColor = new BABYLON.Color3(0, 0, 0);
        matFri.specularColor = new BABYLON.Color3(0, 0, 0);
        matFri.alpha = 0.2;
    }
    {
        matNeu = new BABYLON.StandardMaterial("");
        matNeu.emissiveColor = BABYLON.Color3.White();
        matNeu.diffuseColor = new BABYLON.Color3(0, 0, 0);
        matNeu.specularColor = new BABYLON.Color3(0, 0, 0);
        matNeu.alpha = 0.2;
    }
    {
        matAdv = new BABYLON.StandardMaterial("");
        matAdv.emissiveColor = BABYLON.Color3.Blue();
        matAdv.diffuseColor = new BABYLON.Color3(0, 0, 0);
        matAdv.specularColor = new BABYLON.Color3(0, 0, 0);
        matAdv.alpha = 0.2;
    }
    let changeBase = function(mesh, type=0) {
        if (type == 0) { // 自陣
            mesh.material = matFri;
        } else if (type == 1) { // 中立
            mesh.material = matNeu;
        } else if (type == 2) { // 敵
            mesh.material = matAdv;
        }
        return mesh;
    }

    let meshStage = [], meshCheck = [];
    // ベース、自陣、中立、敵陣
    let meshBaseFri = [], meshBaseNeu = [], meshBaseAdv = [];
    // 
    let nRestAdv = 0; // 敵残機
    let fnobjlist = [];
    let createStage = function() {
        while (meshStage.length > 0) {
            let mesh = meshStage.pop();
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            mesh.dispose();
        }
        meshCheck = [];
        nRestAdv = 0;
        meshBaseFri = [], meshBaseNeu = [], meshBaseAdv = [];

        while (fnobjlist.length > 0) {
            let fnobj = fnobjlist.pop()
            scene.onBeforeRenderObservable.remove(fnobj);
        }

        let mesh = null;
        let p = new BABYLON.Vector3(0, 0, 0);

        if (istage == 0) {
            // 前方に2
            mesh = crGrnd(50);
            meshStage.push(mesh);
            let px, py, pz = 20;
            let nx = 1, ny = 2, nx_ = nx/2;
            let s = 2, s_ = s/2, mass = 0.01;
            p.z = pz;
            for (let iy = 0; iy < ny; ++iy) {
                p.y = iy*s + s_;
                for (let ix = -nx_; ix < nx_; ++ix) {
                    p.x = ix*s + s_;
                    let mesh = crBlock(p);
                    meshStage.push(mesh);
                    meshCheck.push(mesh);
                }
            }
            let fnobj = scene.onBeforeRenderObservable.add(fn0);
            fnobjlist.push(fnobj);

        } else if (istage == 1) {
            // 前方に50
            mesh = crGrnd(50);
            meshStage.push(mesh);
            let px, py, pz = 20;
            let nx = 10, ny = 5, nx_ = nx/2;
            let s = 2, s_ = s/2, mass = 1;
            p.z = pz;
            for (let iy = 0; iy < ny; ++iy) {
                p.y = iy*s + s_;
                for (let ix = -nx_; ix < nx_; ++ix) {
                    p.x = ix*s;
                    // let mesh = crBlock(p);
                    let mesh = crBlock(p, 1);
                    meshStage.push(mesh);
                    meshCheck.push(mesh);
                }
            }
            let fnobj = scene.onBeforeRenderObservable.add(fn0);
            fnobjlist.push(fnobj);

        } else if (istage == 2) {
            // 四方に3ずつ
            mesh = crGrnd(50);
            meshStage.push(mesh);
            let px, py = 2, pz = 20;
            let nx = 3, ny = 1, nx_ = nx/2;
            let s = 2, s_ = s/2, mass = 1;
            p.y = py;
            for (let pz_ of [pz, -pz]) {
                p.z = pz_;
                for (let ix = -nx_; ix < nx_; ++ix) {
                    p.x = (ix+0.5)*s*1.5;
                    let mesh = crBlock(p, 1);
                    meshStage.push(mesh);
                    meshCheck.push(mesh);
                }
            }
            for (let pz_ of [pz, -pz]) {
                p.x = pz_;
                for (let ix = -nx_; ix < nx_; ++ix) {
                    p.z = (ix+0.5)*s*1.5;
                    let mesh = crBlock(p, 1);
                    meshStage.push(mesh);
                    meshCheck.push(mesh);
                }
            }
            let fnobj = scene.onBeforeRenderObservable.add(fn0);
            fnobjlist.push(fnobj);

        } else if (istage == 3) {
            // 前方にピラミッド
            mesh = crGrnd(50);
            meshStage.push(mesh);
            let adjx = 0, adjy = 1, adjz = 15;
            let nlayer = 5;
            let s = 2, mass = 1, ry=1.1, rxz = 0.8;
            for (let ilayer = 0; ilayer < nlayer; ++ilayer) {
                let nxz = nlayer - ilayer;
                let sxz = ((nxz-1)*2)*s*rxz, sxz_ = sxz/2;
                p.y = ilayer*s*ry+ adjy;
                for (let iz = 0; iz < nxz; ++iz) {
                    p.z = (iz*2)*s*rxz-sxz_+adjz;
                    for (let ix = 0; ix < nxz; ++ix) {
                        p.x = (ix*2)*s*rxz-sxz_+adjx;
                        let mesh = crBlock(p, 1);
                        meshStage.push(mesh);
                        meshCheck.push(mesh);
                    }
                }
            }
            let fnobj = scene.onBeforeRenderObservable.add(fn0);
            fnobjlist.push(fnobj);

        } else if (istage == 4) {
            // 四方に5ずつ + 障害物
            mesh = crGrnd(50);
            meshStage.push(mesh);
            let px, py = 1, pz = 0, r = 20;
            let nrad = 12, rad = 0, radMax = Math.PI*2, radStep = radMax / nrad;
            p.y = py;
            for (let irad = 0; irad < nrad; ++irad) {
                rad = irad*radStep;
                p.x = r*Math.cos(rad);
                p.z = r*Math.sin(rad);
                let mesh = crBlock(p, 1);
                meshStage.push(mesh);
                meshCheck.push(mesh);
            }
            r = 10;
            rad = 0;
            nrad = 4;
            radStep = radMax / nrad;
            p.y = 5;
            for (let irad = 0; irad < nrad; ++irad) {
                rad = irad*radStep;
                p.x = r*Math.cos(rad);
                p.z = r*Math.sin(rad);
                let mesh = crBlock(p, 2);
                meshStage.push(mesh);
            }
            let fnobj = scene.onBeforeRenderObservable.add(fn0);
            fnobjlist.push(fnobj);

        } else if (istage == 5) {
            // 四方に5ずつ + 障害物（移動）
            mesh = crGrnd(50);
            meshStage.push(mesh);
            let px, py = 1, pz = 0, r = 20;
            let nrad = 12, rad = 0, radMax = Math.PI*2, radStep = radMax / nrad;
            p.y = py;
            for (let irad = 0; irad < nrad; ++irad) {
                rad = irad*radStep;
                p.x = r*Math.cos(rad);
                p.z = r*Math.sin(rad);
                let mesh = crBlock(p, 1);
                meshStage.push(mesh);
                meshCheck.push(mesh);
            }
            r = 10;
            rad = 0;
            nrad = 4;
            radStep = radMax / nrad;
            p.y = 5;
            let meshMovable = [];
            for (let irad = 0; irad < nrad; ++irad) {
                rad = irad*radStep;
                p.x = r*Math.cos(rad);
                p.z = r*Math.sin(rad);
                let mesh = crBlock(p, 2);
                mesh._rad = rad;
                mesh._r = r;
                meshStage.push(mesh);
                meshMovable.push(mesh);
            }
            let fn5 = function() {
                for (let mesh of meshMovable) {
                    mesh._rad += 0.01;
                    mesh.position.x = mesh._r*Math.cos(mesh._rad);
                    mesh.position.z = mesh._r*Math.sin(mesh._rad);
                }
            };
            let fnobj = scene.onBeforeRenderObservable.add(fn0);
            fnobjlist.push(fnobj);
            fnobj = scene.onBeforeRenderObservable.add(fn5);
            fnobjlist.push(fnobj);

        } else if (istage == 6) {
            // ベースあり
            mesh = crGrnd(50);
            meshStage.push(mesh);
            let coolAdv = 0, coolAdvMax = 100;
            nRestAdv = 33;
            // ベース作成
            {
                // nBaseFri = 1, nBaseNeu = 5, nBaseAdv = 3;
                let p = new BABYLON.Vector3(0, 0, 0);
                mesh = crBase(p, 0); // 自陣
                meshStage.push(mesh);
                meshBaseFri.push(mesh);
                // 中立
                for (let [x,z] of [[-20,-20], [0,-20], [20,-20], [-20,0], [20,0]]) {
                    p.x = x;
                    p.z = z;
                    mesh = crBase(p, 1);
                    meshStage.push(mesh);
                    meshBaseNeu.push(mesh);
                }
                // 敵陣
                p.z = 20;
                for (let x of [-20, 0, 20]) {
                    p.x = x;
                    mesh = crBase(p, 2);
                    meshStage.push(mesh);
                    meshBaseAdv.push(mesh);
                }
            }
            let fn8 = function() {
                // pop させる
                if ((--coolAdv <= 0) && (nRestAdv > 0)) {
                    coolAdv = coolAdvMax;
                    // if (--nRestAdv < 0) { nRestAdv = 0; return; }
                    --nRestAdv;
                    let p = new BABYLON.Vector3(0, 1, 20);
                    p.x = BABYLON.RandomRange(-20, 20);
                    p.z = BABYLON.RandomRange(20, 23);
                    // let ich = BABYLON.RandomRange(0, nfpathCharList-1);
                    let ich = Math.floor(Math.random()*nfpathCharList);
                    let fpath = fpathCharList[ich];
                    let mesh = null;
                    if (ich < 3) {
                        mesh = crBlock(p, 4);
                        mesh._trg = "u"; // ユーザに向かって
                        addCharPanel(fpath, mesh, 2);
                    } else {
                        mesh = crBlock(p, 3);
                        addCharPanel(fpath, mesh);
                        mesh._trg = "g"; // 原点に向かって
                    }
                    meshStage.push(mesh);
                    meshCheck.push(mesh);
                }
                // meshCheck を移動
                for (let m of meshCheck) {
                    let vec = null, s = 0.02;
                    if (m._trg == "u") {
                        vec = myMesh.position.subtract(m.position).normalize();
                    } else if (m._trg == "g") {
                        let g = new BABYLON.Vector3(0, 1, 0);
                        vec = g.subtract(m.position).normalize();
                        s *= 2;
                    }
                    m.position.addInPlace(vec.scale(s));
                }
            };
            let fnobj = scene.onBeforeRenderObservable.add(fn00);
            fnobjlist.push(fnobj);
            fnobj = scene.onBeforeRenderObservable.add(fn8);
            fnobjlist.push(fnobj);

        }
    }

    // ゴール判定
    let bCallNextStage = false;

    // ゴール時の処理
    let nextStage = function() {
        bCallNextStage = false;
        if (++istage == nstage) { istage = 0; }
        createStage();
        resetPosi(pReset);
    }
    // 3秒後に resetCourse() を呼び出す
    let setNextStage = function() {
        setTimeout(nextStage, 3000);
    }

    // meshCheck の落下確認
    let fn0 = function() {
        let meshDel = []
        for (let m of meshCheck) {
            if ((m.position.y < -10) || (m.position.y > 100)) {
                meshDel.push(m);
            }
        }
        if (meshDel.length > 0) {
            for (let m of meshDel) {
                let i = meshStage.indexOf(m);
                meshStage.splice(i, 1);
                i = meshCheck.indexOf(m);
                meshCheck.splice(i, 1);
                if (typeof(m._agg) !== 'undefined') { m._agg.dispose(); }
                m.dispose();
            }
            if (bCallNextStage == false) {
                if (meshCheck.length + nRestAdv == 0) {
                    bCallNextStage = true;
                    console.log("clear STAGE")
                    setNextStage();
                }
            }
        }
    }
    let fnobj = scene.onBeforeRenderObservable.add(fn0);
    fnobjlist.push(fnobj);

    // meshCheck の落下確認（棒人間用）
    let fn00 = function() {
        let meshDel = []
        for (let m of meshCheck) {
            if ((m.position.y < 0.1) || (m.position.y > 100)) {
                meshDel.push(m);
            }
        }
        if (meshDel.length > 0) {
            for (let m of meshDel) {
                let i = meshStage.indexOf(m);
                meshStage.splice(i, 1);
                i = meshCheck.indexOf(m);
                meshCheck.splice(i, 1);
                if (typeof(m._agg) !== 'undefined') { m._agg.dispose(); }
                m.dispose();
            }
            if (bCallNextStage == false) {
                if (meshCheck.length + nRestAdv == 0) {
                    bCallNextStage = true;
                    console.log("clear STAGE")
                    setNextStage();
                }
            }
        }
    }

    // let istage = 0, nstage = 2;
//    let istage = 7, nstage = 8;
//    let istage = 8, nstage = 9;
    let istage = 6, nstage = 7;
    createStage();

    return scene;
} 


export var createScene = createScene_test_3105;

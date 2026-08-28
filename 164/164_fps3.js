// Babylon.js で物理演算(Havok) ：FPS3（微改修）
//
// ws/カーソル上下 : 前後移動
// ad              : 左右移動
// qe/カーソル左右 : 方向転換
// 123             : 火器換装 (1:マシンガン, 2:ライフル, 3:大砲
// (click)         : 射撃
// nb              : ステージ変更

export var createScene_test_3402 = async function () {
//    const dbase = "textures/irasutoya/";
//    const dbase = "textures/";
    const dbase = "https://raw.githubusercontent.com/fnamuoo/webgl/main/161/textures/";
    const fpathCharList = [
        dbase + "figure_barrier_hemisphere.png",
        dbase + "figure_barrier_plate.png",
        dbase + "figure_blank.png",
        dbase + "figure_angry.png", // 3
        dbase + "figure_anti.png",
        dbase + "figure_buki_kakushimotsu.png",
        dbase + "figure_fighting_pose.png",
        dbase + "figure_fighting_punch.png",
        dbase + "figure_fire_tsukeru.png",
        dbase + "figure_hiniabura.png",
        dbase + "figure_kanabou.png", // 10
        dbase + "figure_kyoubou.png",
        dbase + "figure_rpg_character_butouka.png", // 12
        dbase + "figure_rpg_character_kenshi.png",
        dbase + "figure_rpg_character_mahoutsukai.png",
        dbase + "figure_rpg_character_yuusya.png", // 15
    ];
    const nfpathCharList = fpathCharList.length;

    // let skyboxTextPath = "textures/toySky";
    let skyboxTextPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/116/textures/toySky";

    // let fpathHeightMap = "./textures/heightMap.png";
    let fpathHeightMap = "https://raw.githubusercontent.com/fnamuoo/webgl/main/060/textures/heightMap.png";

    const scene = new BABYLON.Scene(engine);
    let camera=null, cameraTrgMesh=null;
    let crCamera3 = function() {
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 3; // 1.3;
        _camera.heightOffset = 0.5; // 0.0;
        _camera.cameraAcceleration = 0.05; // 0.3;
        _camera.maxCameraSpeed = 30;
        return _camera;
    }
     camera = crCamera3();

    let icamera=3, ncamera=4;
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

    // Physics shape for the character
     // let h = 1.2, r = 0.2;
    let h = 1.5, r = 0.3;
    let displayCapsule = crPlane48(); // 式神
    let myMesh = displayCapsule;
    myMesh.rotationQuaternion = characterOrientation;
    if (0) {
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:20, height:20, depth:0.1}, scene);
        mesh.material = new BABYLON.StandardMaterial('mat', scene);
        mesh.material.diffuseColor = BABYLON.Color3.Green();
        mesh.material.alpha = 0.2;
        mesh.position.z = 5;
        mesh.parent = myMesh;
    }

    let pReset = new BABYLON.Vector3(0, 110, 0);
    let characterPosition = pReset.clone();

    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
    camera.lockedTarget = displayCapsule;

    displayCapsule.material = new BABYLON.StandardMaterial('mat', scene);
    displayCapsule.material.diffuseColor = BABYLON.Color3.Blue();
    displayCapsule.material.alpha = 0.7;
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
            if (map["Enter"]) {
                cooltime_act = cooltime_actIni;
                resetPosi(pReset);
            } else if (map["1"]) {
                iweapon = 1;
            } else if (map["2"]) {
                iweapon = 2;
            } else if (map["3"]) {
                iweapon = 3;
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
    let iweapon = 1;
    let weaponAtt = {
        // 射程距離^2, 発射速度 .弾質量   ,弾大きさ,存在step,射撃間隔              , 射角(1-余弦値)の補数
        1:{rSq:100  , spd:20    , mass:0.5, s:0.1, life:60 , cool:0, coolReload:1  , shtAng:0.99, }, // マシンガン
        2:{rSq:10000, spd:100000, mass:50 , s:0.2, life:50 , cool:0, coolReload:100, shtAng:0.99, }, // ライフル
        3:{rSq:10000, spd:10000 , mass:100, s:2  , life:200, cool:0, coolReload:150, shtAng:0.99, }, // 大砲
    };
    scene.registerAfterRender(function() {
        --weaponAtt[iweapon].cool;
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

    var pickingRay = new BABYLON.Ray(
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, 1)
    );
    let bulletCount = 0, _bltvdir = null;
    let bulletCool = 0, bulletCoolMax = 1;
    scene.onPointerPick = (event, pickInfo) => {
        if (weaponAtt[iweapon].cool <= 0) {
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
            // メッシュベースのレイキャストに変更
            var meshPickInfo = scene.pickWithRay(pickingRay, (mesh) => {
                return mesh.isPickable && mesh !== myMesh; // 自機は除外する例
            });
            hit = meshPickInfo != null && meshPickInfo.hit;
            hitPos = hit ? meshPickInfo.pickedPoint : null;
            if (hit) {
                _bltvdir = pickingRay.direction.clone().normalize();
                if ((iweapon%3) == 1) {
                    bulletCount += 5;
                } else {
                    bulletCount += 1;
                }
                // 手動で照準の場合は cool時間を短縮
                weaponAtt[iweapon].cool = Math.floor(weaponAtt[iweapon].coolReload*0.2)-1;
                bulletCool = 0;
            }
        }
    };
    scene.registerAfterRender(function() {
        if (bulletCount > 0) {
            if (bulletCool > 0) {
                --bulletCool;
                return;
            }
            bulletCool = bulletCoolMax;
            --bulletCount;
            let _bltp0 = _bltvdir.add(myMesh.position);
            let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:weaponAtt[iweapon].s}, scene);
            mesh.position.copyFrom(_bltp0);
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, {mass:weaponAtt[iweapon].mass, restitution:0.001}, scene);
            let vdir = _bltvdir.scale(weaponAtt[iweapon].spd);
            mesh._agg.body.applyImpulse(vdir, mesh.absolutePosition);
            mesh._life = weaponAtt[iweapon].life;
            meshWeapon.push(mesh);
            _bltvdir.addInPlace(BABYLON.Vector3.Random(-0.03, 0.03));
        }
    });


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
        // let mx = 3, my = 4;
	let matFB = new BABYLON.StandardMaterial("");
	matFB.diffuseTexture = new BABYLON.Texture(charPath);
	matFB.diffuseTexture.hasAlpha = true;
	matFB.emissiveColor = BABYLON.Color3.White();
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
            mesh.position.copyFrom(p);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.emissiveColor = BABYLON.Color3.White();
            mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.alpha = 0.2;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mass, friction:0.6, startAsleep:true}, scene);
            mesh.physicsBody.disablePreStep = false;
            mesh._type = 'adv';

        } else if (type == 4) {
            mass = 500;
            mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:s, depth:0.1}, scene);
            mesh.position.copyFrom(p);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.emissiveColor = BABYLON.Color3.White();
            mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.alpha = 0.2;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mass, friction:0.6, startAsleep:true}, scene);
            mesh.physicsBody.disablePreStep = false;
            mesh._type = 'adv'; // fri / neu/ adv
        } else {
console.log("type=", type);
        }
        return mesh;
    }

    let crBlock2 = function(p, type=0) {
        // 台座つきメッシュ
        let mesh = null, mesh2 = null, s = 2, mass = 1, s2 = 0.1;
        if (type == 5) {
            mass = 1;
            mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.6, height:s, depth:0.1}, scene);
            mesh.position.copyFrom(p);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.emissiveColor = BABYLON.Color3.White();
            mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.alpha = 0.2;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mass, friction:0.6, startAsleep:true}, scene);
            mesh.physicsBody.disablePreStep = false;
            mesh._type = 'neu'; // fri / neu/ adv
            let p2 = p.add(new BABYLON.Vector3(0, -s/2-s2/2, 0));
            mesh2 = BABYLON.MeshBuilder.CreateBox("", {width:0.3, height:s2, depth:0.3}, scene);
            mesh2.position.copyFrom(p2);
            mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.BOX, {mass:0}, scene);
            mesh2.physicsBody.disablePreStep = false;

        } else if (type == 6) {
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
            mesh._type = 'neu'; // fri / neu/ adv
            let p2 = p.add(new BABYLON.Vector3(0, -s/2-s2/2, 0));
            mesh2 = BABYLON.MeshBuilder.CreateBox("", {width:0.3, height:s2, depth:0.3}, scene);
            mesh2.position.copyFrom(p2);
            mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.BOX, {mass:0}, scene);
            mesh2.physicsBody.disablePreStep = false;

        } else if (type == 7) {
            mass = 1;
            mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.6, height:s, depth:0.2}, scene);
            let p1 = p.add(new BABYLON.Vector3(0, s/2+s2/2, 0));
            mesh.position.copyFrom(p1);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.emissiveColor = BABYLON.Color3.White();
            mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.alpha = 0.2;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mass, friction:1, restitution:0.01}, scene);
            let pc  = new BABYLON.Vector3(0, -0.8, 0);
            mesh._agg.body.setMassProperties({centerOfMass:pc});
            mesh.physicsBody.disablePreStep = false;
            mesh._type = 'neu'; // fri / neu/ adv
            mesh2 = BABYLON.MeshBuilder.CreateBox("", {width:0.5, height:s2, depth:0.5}, scene);
            mesh2.position.copyFrom(p);
            mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.BOX, {mass:0, friction:1, restitution:0.01}, scene);
            mesh2._agg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
            mesh2._agg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            mesh2.physicsBody.disablePreStep = false;

        } else if (type == 8) {
            mass = 500;
            mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:s, depth:0.2}, scene);
            let p1 = p.add(new BABYLON.Vector3(0, s/2+s2/2, 0));
            mesh.position.copyFrom(p1);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.emissiveColor = BABYLON.Color3.White();
            mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.alpha = 0.2;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mass, friction:1, restitution:0.01}, scene);
            let pc  = new BABYLON.Vector3(0, -0.8, 0);
            mesh._agg.body.setMassProperties({centerOfMass:pc});
            mesh.physicsBody.disablePreStep = false;
            mesh._type = 'neu'; // fri / neu/ adv
            mesh2 = BABYLON.MeshBuilder.CreateBox("", {width:0.5, height:s2, depth:0.5}, scene);
            mesh2.position.copyFrom(p);
            mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.BOX, {mass:0, friction:1, restitution:0.01}, scene);
            mesh2._agg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
            mesh2._agg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            mesh2.physicsBody.disablePreStep = false;

        } else {
console.log("type=", type);
        }
        return [mesh, mesh2];
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
    // let nBaseFri = 0, nBaseNeu = 0, nBaseAdv = 0;
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
            // 射的
            // 足場
            {
                mesh = BABYLON.MeshBuilder.CreateBox("", {size:1, height:0.1}, scene);
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0}, scene);
                meshStage.push(mesh);
            }
            // ひな壇
            {
                for (let [py,pz] of [[-1,5],[0.5,8],[3,12],[5,16],]) {
                    mesh = BABYLON.MeshBuilder.CreateBox("", {width:10, height:0.1, depth:1}, scene);
                    mesh.position.set(0, py, pz);
                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0}, scene);
                    meshStage.push(mesh);
                }
            }
            // 最奥の壁面
            {
                let mesh = BABYLON.MeshBuilder.CreateBox("", {size:20, depth:0.1}, scene);
                mesh.position.set(0, 2, 20);
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0}, scene);
                meshStage.push(mesh);
            }
            // 棒人間配置
            {
                let xyzt = [
                    [-4,-1,5,0],
                    [-2,-1,5,3],
                    [ 0,-1,5,1],
                    [ 2,-1,5,4],
                    [ 4,-1,5,2],
                    [-4,0.5,8,7],
                    [-2,0.5,8,6],
                    [ 0,0.5,8,5],
                    [ 2,0.5,8,6],
                    [ 4,0.5,8,7],
                    [-4,3,12,9],
                    [-2,3,12,1],
                    [ 0,3,12,8],
                    [ 2,3,12,1],
                    [ 4,3,12,10],
                    [-4,5,16,12],
                    [-1,5,16,13],
                    [ 1,5,16,15],
                    [ 4,5,16,14],
                ];
                let adjy = 1.05;
                for (let [px,py,pz,ich] of xyzt) {
                    p.set(px,py+adjy,pz);
                    let fpath = fpathCharList[ich];
                    let mesh = null;
                    if (ich < 3) {
                        mesh = crBlock(p, 4);
                        addCharPanel(fpath, mesh, 2);
                    } else {
                        mesh = crBlock(p, 3);
                        addCharPanel(fpath, mesh);
                    }
                    meshStage.push(mesh);
                    meshCheck.push(mesh);
                }
            }
            // meshCheck の落下確認（棒人間用）
            for (let m of meshCheck) {
                m._delCD = -1;
            }
            let fnobj = scene.onBeforeRenderObservable.add(fn02);
            fnobjlist.push(fnobj);

        } else if (istage == 1) {
            // 台座つき、ランダム配置
            mesh = crGrnd(50);
            meshStage.push(mesh);
            let ichrng = 10, ichadj = 2, nch = 100;
            let rangeXZ = 40, rangeXZadj = -20, rangeY = 5, rangeYadj = 0.2, rangeBan = 2;
            for (let i = 0; i < nch; ++i) {
                let x = Math.random()*rangeXZ + rangeXZadj;
                let z = Math.random()*rangeXZ + rangeXZadj;
                let y = Math.random()*rangeY + rangeYadj;
                if (Math.abs(x) < rangeBan && Math.abs(z) < rangeBan) {--i; continue;}
                p.set(x,y,z);
                let ich = Math.floor(Math.random()*ichrng) + ichadj;
                let fpath = fpathCharList[ich];
                let mesh = null, mesh2 = null;
                if (ich < 3) {
                    [mesh,mesh2] = crBlock2(p, 6);
                    addCharPanel(fpath, mesh, 2);
                } else {
                    [mesh,mesh2] = crBlock2(p, 5);
                    addCharPanel(fpath, mesh);
                }
                meshStage.push(mesh);
                meshStage.push(mesh2);
                meshCheck.push(mesh);
            }
            let fnobj = scene.onBeforeRenderObservable.add(fn02);
            fnobjlist.push(fnobj);

        } else if (istage == 2) {
            // HeightMap
            mesh = crGrnd(120);
            meshStage.push(mesh);
            let meshGrnd = null;
            let crMesh00 = function(meshGrnd) {
                let ichrng = 10, ichadj = 2, nch = 100;
                let rangeXZ = 100, rangeXZadj = -50, rangeBan = 2;
                for (let i = 0; i < nch; ++i) {
                    let x = Math.random()*rangeXZ + rangeXZadj;
                    let z = Math.random()*rangeXZ + rangeXZadj;
                    if (Math.abs(x) < rangeBan && Math.abs(z) < rangeBan) {--i; continue;}
                    let y = meshGrnd.getHeightAtCoordinates(x, z) + 1;
                    p.set(x,y,z);
                    let ich = Math.floor(Math.random()*ichrng) + ichadj;
                    let fpath = fpathCharList[ich];
                    let mesh = null, mesh2 = null;
                    if (ich < 3) {
                        [mesh,mesh2] = crBlock2(p, 6);
                        addCharPanel(fpath, mesh, 2);
                    } else {
                        [mesh,mesh2] = crBlock2(p, 5);
                        addCharPanel(fpath, mesh);
                    }
                    meshStage.push(mesh);
                    meshStage.push(mesh2);
                    meshCheck.push(mesh);
                }
            }
            {
                // let fpathHeightMap = "./textures/heightMap.png";
                // 高さマップ
                let mesh = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
                    "", fpathHeightMap, {width:100, height :100, subdivisions: 100, maxHeight: 10,
                                onReady: (mesh) => {
                                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, {mass: 0}, scene);
                                    crMesh00(mesh);
                                }});
                mesh.material = new BABYLON.StandardMaterial("", scene);
                mesh.material.emissiveColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                // mesh.position.x += -30;
                // mesh.position.z += 30;
                mesh.position.y += 0.01;
                meshGrnd = mesh;
                meshStage.push(meshGrnd);
            }
            let fnobj = scene.onBeforeRenderObservable.add(fn02);
            fnobjlist.push(fnobj);

        } else if (istage == 3) {
            // 台座つき、台座を移動（公転させる
            mesh = crGrnd(50);
            meshStage.push(mesh);
            let ichrng = 10, ichadj = 2;
            let rangeXZ = 40, rangeXZadj = -20, rangeY = 5, rangeYadj = 0.2, rangeBan = 2;
            let meshBaseList = [];
            // 左手に配置：Y軸で回転
            {
                let nch = 20, Rstep = Math.PI*2/nch;
                let adjx = -10, adjy = 1, adjz = 10, r = 10;
                for (let irad = 0; irad < nch; ++irad) {
                    let rad = irad*Rstep;
                    let x = Math.cos(rad)*r + adjx;
                    let z = Math.sin(rad)*r + adjz;
                    let y = adjy;
                    p.set(x,y,z);
                    let ich = Math.floor(Math.random()*ichrng) + ichadj;
                    let fpath = fpathCharList[ich];
                    let mesh = null, mesh2 = null;
                    if (ich < 3) {
                        [mesh,mesh2] = crBlock2(p, 8);
                        addCharPanel(fpath, mesh, 2);
                    } else {
                        [mesh,mesh2] = crBlock2(p, 7);
                        addCharPanel(fpath, mesh);
                    }
                    meshStage.push(mesh);
                    meshStage.push(mesh2);
                    meshCheck.push(mesh);
                    mesh2._r = r;
                    mesh2._rad = rad;
                    mesh2._rstep = 0.001;
                    // mesh2._rstep = 0.0;
                    mesh2._raxis = "y";
                    mesh2._adjx = adjx;
                    mesh2._adjy = adjy;
                    mesh2._adjz = adjz;
                    meshBaseList.push(mesh2);
                }
            }
            // 正面に配置：X軸で回転
            {
                let nch = 8, Rstep = Math.PI*2/nch;
                let adjx = 2, adjy = 6, adjz = 10, r = 5;
                for (let irad = 0; irad < nch; ++irad) {
                    let rad = irad*Rstep;
                    let z = Math.cos(rad)*r + adjz;
                    let y = Math.sin(rad)*r + adjy;
                    let x = adjx;
                    p.set(x,y,z);
                    let ich = Math.floor(Math.random()*ichrng) + ichadj;
                    let fpath = fpathCharList[ich];
                    let mesh = null, mesh2 = null;
                    if (ich < 3) {
                        [mesh,mesh2] = crBlock2(p, 8);
                        addCharPanel(fpath, mesh, 2);
                    } else {
                        [mesh,mesh2] = crBlock2(p, 7);
                        addCharPanel(fpath, mesh);
                    }
                    meshStage.push(mesh);
                    meshStage.push(mesh2);
                    meshCheck.push(mesh);
                    mesh2._r = r;
                    mesh2._rad = rad;
                    mesh2._rstep = 0.001;
                    // mesh2._rstep = 0.0;
                    mesh2._raxis = "x";
                    mesh2._adjx = adjx;
                    mesh2._adjy = adjy;
                    mesh2._adjz = adjz;
                    meshBaseList.push(mesh2);
                }
            }
            // 右手に配置：Z軸で回転
            {
                let nch = 18, Rstep = Math.PI*2/nch;
                let adjx = 12, adjy = 9, adjz = 10, r = 8;
                for (let irad = 0; irad < nch; ++irad) {
                    let rad = irad*Rstep;
                    let x = Math.cos(rad)*r + adjx;
                    let y = Math.sin(rad)*r + adjy;
                    let z = adjz;
                    p.set(x,y,z);
                    let ich = Math.floor(Math.random()*ichrng) + ichadj;
                    let fpath = fpathCharList[ich];
                    let mesh = null, mesh2 = null;
                    if (ich < 3) {
                        [mesh,mesh2] = crBlock2(p, 8);
                        addCharPanel(fpath, mesh, 2);
                    } else {
                        [mesh,mesh2] = crBlock2(p, 7);
                        addCharPanel(fpath, mesh);
                    }
                    meshStage.push(mesh);
                    meshStage.push(mesh2);
                    meshCheck.push(mesh);
                    mesh2._r = r;
                    mesh2._rad = rad;
                    mesh2._rstep = 0.001;
                    // mesh2._rstep = 0.0;
                    mesh2._raxis = "z";
                    mesh2._adjx = adjx;
                    mesh2._adjy = adjy;
                    mesh2._adjz = adjz;
                    meshBaseList.push(mesh2);
                }
            }
            let fn10 = function() {
                for (let m of meshBaseList) {
                    m._rad += m._rstep;
                    if (m._raxis == "y") {
                        let x = Math.cos(m._rad)*m._r + m._adjx;
                        let z = Math.sin(m._rad)*m._r + m._adjz;
                        let y = m._adjy;
                        let p = new BABYLON.Vector3(x, y, z);
                        let q = BABYLON.Quaternion.Identity();
                        m._agg.body.setTargetTransform(p, q);
                    } else if (m._raxis == "x") {
                        let z = Math.cos(m._rad)*m._r + m._adjz;
                        let y = Math.sin(m._rad)*m._r + m._adjy;
                        let x = m._adjx;
                        let p = new BABYLON.Vector3(x, y, z);
                        let q = BABYLON.Quaternion.Identity();
                        m._agg.body.setTargetTransform(p, q);
                    } else if (m._raxis == "z") {
                        let x = Math.cos(m._rad)*m._r + m._adjx;
                        let y = Math.sin(m._rad)*m._r + m._adjy;
                        let z = m._adjz;
                        let p = new BABYLON.Vector3(x, y, z);
                        let q = BABYLON.Quaternion.Identity();
                        m._agg.body.setTargetTransform(p, q);
                    }
                }
            }
            let fnobj = scene.onBeforeRenderObservable.add(fn02);
            fnobjlist.push(fnobj);
            let fnobj2 = scene.onBeforeRenderObservable.add(fn10);
            fnobjlist.push(fnobj2);

        } else if (istage == 4) {
            // 倒れても復活
            mesh = crGrnd(50);
            meshStage.push(mesh);
            let ichrng = 14, ichadj = 2;
            let rangeXZ = 40, rangeXZadj = -20, rangeY = 5, rangeYadj = 0.2, rangeBan = 2;
            let meshBaseList = [];
            {
                let nch = 20, Rstep = Math.PI*2/nch;
                let adjx = -10, adjy = 1, adjz = 10, r = 10;
                for (let irad = 0; irad < nch; ++irad) {
                    let rad = irad*Rstep;
                    let x = Math.cos(rad)*r + adjx;
                    let z = Math.sin(rad)*r + adjz;
                    let y = adjy;
                    p.set(x,y,z);
                    let ich = Math.floor(Math.random()*ichrng) + ichadj;
                    let fpath = fpathCharList[ich];
                    let mesh = null, mesh2 = null;
                    if (ich < 3) {
                        [mesh,mesh2] = crBlock2(p, 8);
                        addCharPanel(fpath, mesh, 2);
                        mesh._vit = 3;
                    } else {
                        [mesh,mesh2] = crBlock2(p, 7);
                        addCharPanel(fpath, mesh);
                        mesh._vit = 3;
                        if (ich >= 12) {
                            mesh._vit = 10;
                        }
                    }
                    meshStage.push(mesh);
                    meshStage.push(mesh2);
                    meshCheck.push(mesh);
                    mesh._v0 = 0;
                    mesh2._r = r;
                    mesh2._rad = rad;
                    mesh2._rstep = 0.001;
                    mesh2._raxis = "y";
                    mesh2._adjx = adjx;
                    mesh2._adjy = adjy;
                    mesh2._adjz = adjz;
                    meshBaseList.push(mesh2);
                }
            }
            let fnobj = scene.onBeforeRenderObservable.add(fn03);
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
    // 1秒後に resetCourse() を呼び出す
    let setNextStage = function() {
        setTimeout(nextStage, 1000);
    }


    let skybox = null;
    if (1) {
        // Skybox
        skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:4000.0}, scene);
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
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

    // meshCheck の落下確認（棒人間用）
    let fn02 = function() {
        let delCDMax = 100;
        let meshDel = []
        for (let m of meshCheck) {
            let quat = m.rotationQuaternion;
            let vrot = quat.toEulerAngles();
            if (m._delCD >= 0) {
                if (--m._delCD == 0) {
                    meshDel.push(m);
                }
            } else if ((m.position.y < -100) || (Math.abs(vrot.x) > 0.3)  || (Math.abs(vrot.z) > 0.3) ) {
                m._delCD = delCDMax;
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

    // meshCheck の落下確認（棒人間用） vit 考慮
    let fn03 = function() {
        let delCDMax = 100;
        let meshDel = []
        for (let m of meshCheck) {
            // if ((m.position.y < -1.5) || (m.position.y > 100)) {
            //     meshDel.push(m);
            // }
            // let quat = m.rotationQuaternion;
            let quat = m.physicsBody.transformNode.rotationQuaternion;
            let vrot = quat.toEulerAngles();
            if (m._v0 == 1) {
                // タイミングをずらして速度を止める
                m._v0 = 0;
                m.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
                m.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
            } else if (m._delCD >= 0) {
                if (--m._delCD == 0) {
                    meshDel.push(m);
                }
            } else if (m.position.y < -100) {
                m._delCD = delCDMax;
            } else if ((Math.abs(vrot.x) > 0.1)  || (Math.abs(vrot.z) > 0.1) ) {
                // 倒れたことを検知
                if (--m._vit > 0) {
                    // まず位置だけを修正
                    let p = m.position.clone();
                    let q = BABYLON.Quaternion.Identity();
                    // setTargetTransform は指定した位置・回転へ瞬間移動させる関数ではなく、目標位置に到達するように速度を計算してボディに設定するメソッド
                    //   このあとに setLinearVelocity() してしまうと、setTargetTransform が無効になる
                    //   なので setLinearVelocity はタイミングをずらす
                    m._agg.body.setTargetTransform(p, q);
                    m._v0 = 1; // タイミングをずらして速度を止めるフラグ
                } else {
                    m._delCD = delCDMax;
                }
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

     let istage = 0, nstage = 5;
//    istage = 0; // 射的
//    istage = 1; // 台座つき、ランダム配置
//    istage = 2; // 高さマップ
//    istage = 3; // 台座回転
//    istage = 4; // vit あり

    iweapon = 1; // マシンガン
//    iweapon = 2; // ライフル
//    iweapon = 3; // 大砲
    createStage();

    return scene;
} 



// ######################################################################

export var createScene = createScene_test_3402; // メッシュのraycast に変更


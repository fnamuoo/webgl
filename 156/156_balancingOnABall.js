// 地球儀で玉乗り
//
// ws/カーソル上下 .. 前進・後進
// ad/カーソル左右 .. 左右回転
// space           .. ジャンプ
// enter           .. 位置リセット
// c               .. カメラ変更

// // const charPath24 = "textures/santa.png";
const charPath24 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/115/textures/santa.png";

let fpathMercator = "textures/mercator.jpg"
//let fpathMercator = "textures/mercator.jpg"

// ######################################################################

export var createScene_test_212 = async function () {

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
     camera = crCamera3();

    let icamera=0, ncamera=4;
    let setCAM3 = function(icamera) {
        if (icamera == 0) {
            // 後ろから追っかける（バードビュー
            camera.radius = 3;
            camera.heightOffset = 0.5; // 1.1;
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
            // 正面（フロントビュー／ドライバーズビュー
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
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), hk);



    if (1) {
        // 平面地面
        let grndW=300, grndH=300;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        // mesh.material.wireframe = 1;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
    }

    let grndY = 20;

    let meshGrnd = null;
    if (1) {
        // 球面地面
        let sX=grndY*2;
        let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:sX}, scene);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0}, scene);
        // let fpath = "textures/mercator.jpg"
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseTexture = new BABYLON.Texture(fpathMercator);
        mesh.material.emissiveColor = BABYLON.Color3.White();
        mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
	mesh.material.diffuseTexture.uScale = -1;
	mesh.material.diffuseTexture.vScale = -1;
        meshGrnd = mesh;
    }



    // デバッグ表示(debug)
    if (0) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }


    // --------------------------------------------------

    let crPlane26 = function() {
        // 人型：天使
        let mesh = new BABYLON.TransformNode();
        let adjy = 0.1;
        // 天使の輪
        let mesh1 = BABYLON.MeshBuilder.CreateTorus("", {diameter:0.7, thickness:0.1}, scene);
        mesh1.position.set(0.0, 1.2+adjy, 0.0);
        mesh1.parent = mesh;
        // 頭
        let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1}, scene);
        mesh2.position.set(0.0, 0.5+adjy, 0.0);
        mesh2.parent = mesh;
        // ボディ
        let mesh3 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.0, height:2, tessellation:4, diameterBottom:0}, scene);
        mesh3.position.set(0, -1+adjy, 0);
        mesh3.parent = mesh;
        for (let d of [-1, 1]) {
            // 羽
            let mesh4 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh4.rotation.y = 0.2*d;
            mesh4.position.set(0.9*d, -0.1+adjy, -0.2);
            mesh4.parent = mesh;
            let mesh41 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh41.rotation.y = 0.6*d;
            mesh41.position.set(1.5*d, -0.1+adjy, -0.5);
            mesh41.parent = mesh;
            let mesh42 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh42.rotation.y = 0.7*d;
            mesh42.position.set(1.3*d, -0.1+adjy, -0.6);
            mesh42.parent = mesh;
            let mesh43 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh43.rotation.y = 0.9*d;
            mesh43.position.set(1.1*d, -0.1+adjy, -0.65);
            mesh43.parent = mesh;
            let mesh44 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh44.rotation.y = 1.1*d;
            mesh44.position.set(0.9*d, -0.1+adjy, -0.65);
            mesh44.parent = mesh;
        }
        mesh.scaling.set(0.4, 0.4, 0.4);
        return mesh;
    }

    let crPlane49 = function() {
        // 宇宙：人工衛星
        let R45 = Math.PI/4;
        let R180 = Math.PI;
        // 本体
        let mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameter:0.6, height:1.2}, scene);
        mesh.position.set(0.0, 0.0, 0.0);
        // パネル
        let mesh1 = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.7, depth:1.4}, scene);
        mesh1.rotation.set(0, 0, R45);
        mesh1.position.set(0, 0.0, 1.0);
        mesh1.parent = mesh;
        let mesh2 = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.7, depth:1.4}, scene);
        mesh2.rotation.set(0, 0, R45);
        mesh2.position.set(0, 0.0, -1.0);
        mesh2.parent = mesh;
        // パラボラ
        let mesh3 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.6, slice:0.5, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh3.position.set(0.0, -0.9, 0);
        mesh3.parent = mesh;
        let mesh4 = BABYLON.MeshBuilder.CreateBox("", {width:0.02, height:0.4, depth:0.02}, scene);
        mesh4.rotation.set(0, 0, 0);
        mesh4.position.set(0, -0.9, 0.0);
        mesh4.parent = mesh;
        // スラスター
        let y = 0.7, d = 0.1;
        let plist = [
            [d, y, d],
            [d, y, -d],
            [-d, y, d],
            [-d, y, -d],
        ];
        for (let p of plist) {
            let mesh5 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.15, diameterY:0.3, slice:0.5, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh5.rotation.set(R180, 0, 0.0);
            mesh5.position = BABYLON.Vector3.FromArray(p);
            mesh5.parent = mesh;
        }
        return mesh;
    }

    {
        let mesh1 = crPlane49(); // 宇宙：人工衛星
        mesh1._pc = meshGrnd.position;
        mesh1._r1 = grndY+5; // 衛星と地面の距離
        mesh1._rad = 0;
        mesh1._radstep = 0.002;
        mesh1._a = 1;
        mesh1._b = 0.1; // 1;
        mesh1._aph = 0; // R90;
        mesh1._bph = 0; // R90;
        mesh1._pold = mesh1.position.clone();
        mesh1.rotationQuaternion = new BABYLON.Quaternion();
        // mesh1.position.set(-5, grndY+5, 5);
        const R360 = Math.PI*2;
        scene.onBeforeRenderObservable.add(()=>{
            mesh1._rad += mesh1._radstep;
            // if (mesh1._rad > R360) { mesh1._rad -= R360; }
            if (mesh1._rad > 1e5) { mesh1._rad -= 1e5; }
            let rad1 = mesh1._a*mesh1._rad + mesh1._aph;
            let rad2 = mesh1._b*mesh1._rad + mesh1._bph;
            let x = mesh1._r1*Math.sin(rad1)*Math.cos(rad2);
            let y = mesh1._r1*Math.sin(rad1)*Math.sin(rad2);
            let z = mesh1._r1*Math.cos(rad1);
            let p = new BABYLON.Vector3(x,y,z);
            mesh1._pold.copyFrom(mesh1.position);
            mesh1.position = mesh1._pc.add(p);
            if (1) {
                // 衛星向け：meshのz方向を進行方向に向かせたまま、_pc が下向きになるよう姿勢制御
                // 衛星から_pc方向
                let vUn = mesh1._pc.subtract(mesh1.position).normalize().negate();
                // 移動方向ベクトル
                let tangent = mesh1._pold.subtract(mesh1.position).normalize();
                mesh1.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(tangent, vUn);
            }
        });
    }

    // Player/Character state
    var state = "IN_AIR";
    var inAirSpeed = 10.0;
    var onGroundSpeed = 5.0;
    var jumpHeight = 3;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -9, 0);

    let keyAction = {forward:0, back:0, right:0, left:0, jump:0};

    // Physics shape for the character
    let h = 1.5, r = 0.3;
    let displayCapsule = crPlane26(); // 天使

    let pRest = new BABYLON.Vector3(0, grndY+10, 0);
    let characterPosition = pRest.clone();

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
        const rotRad = 0.08; // 0.02;
        if (keyAction.right) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), rotRad);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, rotRad, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        } else if (keyAction.left) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), -rotRad);
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
        keyAction = {forward:0, back:0, right:0, left:0, jump:0};

        if (map["w"] || map["ArrowUp"]) {
            inputDirection.z = 1;
            keyAction.forward = 1;
        } else if (map["s"] || map["ArrowDown"]) {
            inputDirection.z = -1;
            keyAction.back = 1;
        }
        if (map["a"] && map["ArrowRight"]) {
            inputDirection.x = -1;
            keyAction.right = 1;
        } else if (map["a"]) {
            inputDirection.x = -1;
            keyAction.left = 1;
        } else if (map["ArrowRight"]) {
            keyAction.right = 1;
        } else if (map["d"] && map["ArrowLeft"]) {
            inputDirection.x = 1;
            keyAction.left = 1;
        } else if (map["d"]) {
            inputDirection.x = 1;
            keyAction.right = 1;
        } else if (map["ArrowLeft"]) {
            keyAction.left = 1;
        }
        if (map[" "]) {
            keyAction.jump = 1;
        }
        
        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["c"]) {
                cooltime_act = cooltime_actIni;
                changeCAM3(icamera);
            } else if (map["Enter"]) {
                cooltime_act = cooltime_actIni;
                resetPosi(pRest);
            }
        }
    });

    // meshMe と meshGrnd の位置関係に応じて meshGrnd を回転させる
    let rotMeshGrnd = function() {
        let vdir = meshGrnd.position.subtract(meshMe.position);
        vdir.y = 0;
        let v = vdir.length() * 0.0005;
        if (v == 0) { return; }
        vdir.normalize();
        let vroll = vdir.cross(BABYLON.Vector3.Up()).normalize();
        let quatR = BABYLON.Quaternion.RotationAxis(vroll, v);
        let quat = meshGrnd.rotationQuaternion;
        quat = quatR.multiply(quat);
        meshGrnd.rotationQuaternion = quat;
    }

    scene.onBeforeRenderObservable.add(()=>{
        rotMeshGrnd();
    })

    return scene;
} 


// ######################################################################

export var createScene_test_213 = async function () {

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

    let icamera=1, ncamera=4;
    let setCAM3 = function(icamera) {
        if (icamera == 0) {
            // 後ろから追っかける（バードビュー
            camera.rotationOffset = 180;
            camera.radius = 3;
            camera.heightOffset = 0.5; // 1.1;
            camera.cameraAcceleration = 0.05; // 0.1;
            camera.maxCameraSpeed = 5; // 30;
        } else if (icamera == 1) {
            // ちょい遅れて／離れて追っかける（バードビュー遠方
            camera.rotationOffset = 210;
            camera.radius = 20;
            camera.heightOffset = 3; // 8;
            camera.cameraAcceleration = 0.02; // 0.005;
            camera.maxCameraSpeed = 5; // 30;
        } else if (icamera == 2) {
            // 上空（トップビュー
            camera.rotationOffset = 180;
            camera.radius = 1;
            camera.heightOffset = 30;
            camera.cameraAcceleration = 0.5;
            camera.maxCameraSpeed = 100;
        } else if (icamera == 3) {
            // 正面（フロントビュー／ドライバーズビュー
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
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), hk);

    if (1) {
        // 平面地面
        let grndW=300, grndH=300;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        // mesh.material.wireframe = 1;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
    }

    let grndY = 20;

    let meshGrnd = null;
    if (1) {
        // 球面地面
        let sX=grndY*2;
        let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:sX}, scene);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0}, scene);
        // let fpathMercator = "textures/mercator.jpg"
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseTexture = new BABYLON.Texture(fpathMercator);
        mesh.material.emissiveColor = BABYLON.Color3.White();
        mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
	mesh.material.diffuseTexture.uScale = -1;
	mesh.material.diffuseTexture.vScale = -1;
        meshGrnd = mesh;
    }



    // デバッグ表示(debug)
    if (0) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }


    // --------------------------------------------------

    let crPlane25 = function() {
        // 人型：マーカー
        let mesh = new BABYLON.TransformNode();
        // 頭
        let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1}, scene);
        mesh2.position.set(0.0, 0.5, 0.0);
        mesh2.parent = mesh;
        // ボディ
        let mesh3 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.0, height:2, tessellation:4, diameterBottom:0}, scene);
        mesh3.position.set(0, -1, 0);
        mesh3.parent = mesh;
        mesh.scaling.set(0.4, 0.4, 0.4);
        return mesh;
    }

    let crPlane26 = function() {
        // 人型：天使
        let mesh = new BABYLON.TransformNode();
        let adjy = 0.1;
        // 天使の輪
        let mesh1 = BABYLON.MeshBuilder.CreateTorus("", {diameter:0.7, thickness:0.1}, scene);
        mesh1.position.set(0.0, 1.2+adjy, 0.0);
        mesh1.parent = mesh;
        // 頭
        let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1}, scene);
        mesh2.position.set(0.0, 0.5+adjy, 0.0);
        mesh2.parent = mesh;
        // ボディ
        let mesh3 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.0, height:2, tessellation:4, diameterBottom:0}, scene);
        mesh3.position.set(0, -1+adjy, 0);
        mesh3.parent = mesh;
        for (let d of [-1, 1]) {
            // 羽
            let mesh4 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh4.rotation.y = 0.2*d;
            mesh4.position.set(0.9*d, -0.1+adjy, -0.2);
            mesh4.parent = mesh;
            let mesh41 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh41.rotation.y = 0.6*d;
            mesh41.position.set(1.5*d, -0.1+adjy, -0.5);
            mesh41.parent = mesh;
            let mesh42 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh42.rotation.y = 0.7*d;
            mesh42.position.set(1.3*d, -0.1+adjy, -0.6);
            mesh42.parent = mesh;
            let mesh43 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh43.rotation.y = 0.9*d;
            mesh43.position.set(1.1*d, -0.1+adjy, -0.65);
            mesh43.parent = mesh;
            let mesh44 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh44.rotation.y = 1.1*d;
            mesh44.position.set(0.9*d, -0.1+adjy, -0.65);
            mesh44.parent = mesh;
        }
        mesh.scaling.set(0.4, 0.4, 0.4);
        return mesh;
    }

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

    let crPlane49 = function() {
        // 宇宙：人工衛星
        let R45 = Math.PI/4;
        let R180 = Math.PI;
        // 本体
        let mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameter:0.6, height:1.2}, scene);
        mesh.position.set(0.0, 0.0, 0.0);
        // パネル
        let mesh1 = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.7, depth:1.4}, scene);
        mesh1.rotation.set(0, 0, R45);
        mesh1.position.set(0, 0.0, 1.0);
        mesh1.parent = mesh;
        let mesh2 = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.7, depth:1.4}, scene);
        mesh2.rotation.set(0, 0, R45);
        mesh2.position.set(0, 0.0, -1.0);
        mesh2.parent = mesh;
        // パラボラ
        let mesh3 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.6, slice:0.5, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh3.position.set(0.0, -0.9, 0);
        mesh3.parent = mesh;
        let mesh4 = BABYLON.MeshBuilder.CreateBox("", {width:0.02, height:0.4, depth:0.02}, scene);
        mesh4.rotation.set(0, 0, 0);
        mesh4.position.set(0, -0.9, 0.0);
        mesh4.parent = mesh;
        // スラスター
        let y = 0.7, d = 0.1;
        let plist = [
            [d, y, d],
            [d, y, -d],
            [-d, y, d],
            [-d, y, -d],
        ];
        for (let p of plist) {
            let mesh5 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.15, diameterY:0.3, slice:0.5, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh5.rotation.set(R180, 0, 0.0);
            mesh5.position = BABYLON.Vector3.FromArray(p);
            mesh5.parent = mesh;
        }
        return mesh;
    }

    let crPlane99 = function() {
        // サンタ
        var addSantaPanel = function(charPath1, charPath2, myMesh, adjy=0.4, adjy2=0.7, adjz2=0.3) {
            const R90 = Math.PI/2;
            let mx = 3, my = 4;
            if (charPath1 != null) {
	        let matFB = new BABYLON.StandardMaterial("");
	        matFB.diffuseTexture = new BABYLON.Texture(charPath1);
	        matFB.diffuseTexture.hasAlpha = true;
	        matFB.emissiveColor = BABYLON.Color3.White();
                let planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {size:2});
                planeFB.position.y = adjy;
                planeFB.material = matFB;
                planeFB.parent = myMesh;
                myMesh._planeFB = planeFB;
            }
	    let matLR = new BABYLON.StandardMaterial("");
	    matLR.diffuseTexture = new BABYLON.Texture(charPath2);
	    matLR.diffuseTexture.hasAlpha = true;
	    matLR.emissiveColor = BABYLON.Color3.White();
            let planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {width:4, height:2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            planeLR.position.y = adjy2;
            planeLR.position.z = adjz2;
            planeLR.material = matLR;
            planeLR.rotation = new BABYLON.Vector3(0, R90, 0);
            planeLR.parent = myMesh;
            myMesh._planeLR = planeLR;
        }
        let width = 2, widthH = 0.1, size=0.1, depth=2;
        let transform = new BABYLON.TransformNode();
        let meshAgent = BABYLON.MeshBuilder.CreateBox("cube", { size:size, depth:depth }, scene);
        meshAgent.material = new BABYLON.StandardMaterial('mat2', scene);
        meshAgent.position.y += widthH/2;
        meshAgent.parent = transform;
        let charPath2;
        {
            charPath2 = charPath24;
        }
        addSantaPanel(null, charPath2, meshAgent);
        return transform;
    }

    {
        let mesh1 = crPlane49(); // 宇宙：人工衛星
        mesh1._pc = meshGrnd.position;
        mesh1._r1 = grndY+5; // 衛星と地面の距離
        mesh1._rad = 0;
        mesh1._radstep = 0.002;
        mesh1._a = 1;
        mesh1._b = 0.1; // 1;
        mesh1._aph = 0; // R90;
        mesh1._bph = 0; // R90;
        mesh1._pold = mesh1.position.clone();
        mesh1.rotationQuaternion = new BABYLON.Quaternion();
        const R360 = Math.PI*2;
        scene.onBeforeRenderObservable.add(()=>{
            mesh1._rad += mesh1._radstep;
            if (mesh1._rad > 1e5) { mesh1._rad -= 1e5; }
            let rad1 = mesh1._a*mesh1._rad + mesh1._aph;
            let rad2 = mesh1._b*mesh1._rad + mesh1._bph;
            let x = mesh1._r1*Math.sin(rad1)*Math.cos(rad2);
            let y = mesh1._r1*Math.sin(rad1)*Math.sin(rad2);
            let z = mesh1._r1*Math.cos(rad1);
            let p = new BABYLON.Vector3(x,y,z);
            mesh1._pold.copyFrom(mesh1.position);
            mesh1.position = mesh1._pc.add(p);
            if (1) {
                // 衛星向け：meshのz方向を進行方向に向かせたまま、_pc が下向きになるよう姿勢制御
                // 衛星から_pc方向
                let vUn = mesh1._pc.subtract(mesh1.position).normalize().negate();
                // 移動方向ベクトル
                let tangent = mesh1._pold.subtract(mesh1.position).normalize();
                mesh1.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(tangent, vUn);
            }
        });
    }

    // Player/Character state
    var state = "IN_AIR";
    var inAirSpeed = 10.0;
    var onGroundSpeed = 5.0;
    var jumpHeight = 3;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -9, 0);

    let keyAction = {forward:0, back:0, right:0, left:0, jump:0};

    // Physics shape for the character
    let h = 1.5, r = 0.3;
    let displayCapsule = crPlane99(); // サンタ

    let pRest = new BABYLON.Vector3(0, grndY+10, 0);
    let characterPosition = pRest.clone();

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
        const rotRad = 0.08; // 0.02;
        if (keyAction.right) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), rotRad);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, rotRad, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        } else if (keyAction.left) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), -rotRad);
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
        keyAction = {forward:0, back:0, right:0, left:0, jump:0};

        if (map["w"] || map["ArrowUp"]) {
            inputDirection.z = 1;
            keyAction.forward = 1;
        } else if (map["s"] || map["ArrowDown"]) {
            inputDirection.z = -1;
            keyAction.back = 1;
        }
        if (map["a"] && map["ArrowRight"]) {
            inputDirection.x = -1;
            keyAction.right = 1;
        } else if (map["a"]) {
            inputDirection.x = -1;
            keyAction.left = 1;
        } else if (map["ArrowRight"]) {
            keyAction.right = 1;
        } else if (map["d"] && map["ArrowLeft"]) {
            inputDirection.x = 1;
            keyAction.left = 1;
        } else if (map["d"]) {
            inputDirection.x = 1;
            keyAction.right = 1;
        } else if (map["ArrowLeft"]) {
            keyAction.left = 1;
        }
        if (map[" "]) {
            keyAction.jump = 1;
        }
        
        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["c"]) {
                cooltime_act = cooltime_actIni;
                changeCAM3(icamera);
            } else if (map["Enter"]) {
                cooltime_act = cooltime_actIni;
                resetPosi(pRest);
            }
        }
    });

    let rotMeshGrnd = function() {
        let vdir = meshGrnd.position.subtract(meshMe.position);
        vdir.y = 0;
        let v = vdir.length() * 0.0005;
        if (v == 0) { return; }
        vdir.normalize();
        let vroll = vdir.cross(BABYLON.Vector3.Up()).normalize();
        let quatR = BABYLON.Quaternion.RotationAxis(vroll, v);
        let quat = meshGrnd.rotationQuaternion;
        quat = quatR.multiply(quat);
        meshGrnd.rotationQuaternion = quat;
    }

    // meshMe と meshGrnd の位置関係に応じて meshGrnd を回転させる
    scene.onBeforeRenderObservable.add(()=>{
        rotMeshGrnd();
    })

    return scene;
} 


// ======================================================================

export var createScene = createScene_test_212; // 地球儀で玉乗り＋人口衛星
// export var createScene = createScene_test_213; // サンタ版

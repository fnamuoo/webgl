// ----------------------------------------
// アクション
//
// ゴーストを吸収してパワーアップ
// 神官（闇）、モンスター、サタンをぶっとばせ
//


// ドローン（モード２）左：上昇下降・左右旋回　右スティック：前後移動・左右移動
// 
//  - カーソル上下   .. 前後移動
//  - カーソル右左   .. 左右移動
//  - (w,s)          .. 上昇下降
//  - (a,d)          .. 左右旋回
//  - space          .. 姿勢をリセット
//  - n/p            .. ステージの切り替え
//  - v              .. オリジナルデータの切り替え（≒ステージ切り替え）
//  - m              .. 材質の切り替え（ワイヤーフレーム／テクスチャ）
//  - c              .. カメラの切り替え（俯瞰／自機視点）
//  - h              .. ヘルプ表示



const myTextPath = "textures/pipoya_pumpkin_man.png"; // パンプキン

const coTextPathList = ["textures/pipoya_obake1.png", // おばけ１
                        "textures/pipoya_obake2.png", // おばけ２
                        "textures/pipoya_obake3.png", // おばけ３
                        "textures/pipoya_obake4.png", // おばけ４
                        ];

const emTextPathList = ["textures/pipoya_skal_maid.png",
                        "textures/pipoya_zombi_maid.png",
                        "textures/pipoya_skal_fighter.png",
                        "textures/pipoya_skal_fighter2.png",
                        "textures/pipoya_dark_sinkan.png", // 神官（闇）
                        "textures/pipoya_monster.png", // モンスター
                        "textures/pipoya_satan.png", // サタン
                        ];

// --------------------------------------------
// for PlayGround

// const myTextPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/100/textures/pipoya_pumpkin_man.png"; // パンプキン

// const coTextPathList = ["https://raw.githubusercontent.com/fnamuoo/webgl/main/100/textures/pipoya_obake1.png", // おばけ１
//                         "https://raw.githubusercontent.com/fnamuoo/webgl/main/100/textures/pipoya_obake2.png", // おばけ２
//                         "https://raw.githubusercontent.com/fnamuoo/webgl/main/100/textures/pipoya_obake3.png", // おばけ３
//                         "https://raw.githubusercontent.com/fnamuoo/webgl/main/100/textures/pipoya_obake4.png", // おばけ４
//                         ];

// const emTextPathList = ["https://raw.githubusercontent.com/fnamuoo/webgl/main/100/textures/pipoya_skal_maid.png",
//                         "https://raw.githubusercontent.com/fnamuoo/webgl/main/100/textures/pipoya_zombi_maid.png",
//                         "https://raw.githubusercontent.com/fnamuoo/webgl/main/100/textures/pipoya_skal_fighter.png",
//                         "https://raw.githubusercontent.com/fnamuoo/webgl/main/100/textures/pipoya_skal_fighter2.png",
//                         "https://raw.githubusercontent.com/fnamuoo/webgl/main/100/textures/pipoya_dark_sinkan.png", // 神官（闇）
//                         "https://raw.githubusercontent.com/fnamuoo/webgl/main/100/textures/pipoya_monster.png", // モンスター
//                         "https://raw.githubusercontent.com/fnamuoo/webgl/main/100/textures/pipoya_satan.png", // サタン
//                         ];

// ======================================================================

const R90 = Math.PI/2;
const R180 = Math.PI;

const createScene = async function () {
    let myScale = 1, myWAttR = 1, myMvR = 1;  //表示倍率、攻撃力の低下率、移動量の低下率
    let myWAttRmin = 0.1, myMvRmin = 0.1;  //表示倍率、攻撃力の低下率、移動量の低下率
    let myPosi = new BABYLON.Vector3(0, 0.3, -1000+100.);

    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.radius = 10;
    camera.heightOffset = 2;
    camera.rotationOffset = 180;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 30;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    let icamera = 0, ncamera = 3;
    let setCamera = function() {
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 10*myScale; // 10;
                    camera.heightOffset = 2*myScale; // 2;
                    camera.cameraAcceleration = 0.05;
                    camera.maxCameraSpeed = 30;
                // } else if (icamera == 1) {
                //     // ちょい遅れて／離れて追っかける（バードビュー遠方
                //     camera.radius = 15;
                //     camera.heightOffset = 3;
                //     camera.cameraAcceleration = 0.005;
                //     camera.maxCameraSpeed = 10;
                } else if (icamera == 1) {
                    // 上空（トップビュー
                    camera.radius = 0.1;
                    camera.heightOffset = 10+10*myScale; // 20
                    camera.cameraAcceleration = 0.9;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 2) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.1;
                    camera.heightOffset = 0;
                    camera.cameraAcceleration = 0.9;
                    camera.maxCameraSpeed = 30;
                }
    }
    setCamera();

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // 地面
    const grndW=200, grndH=2000, grndW_=grndW/2, grndH_=grndH/2;
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
    groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMesh.material.majorUnitFrequency = 100;
    groundMesh.material.minorUnitVisibility  = 0.2;
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);

    var addCharPanel = function(charPath, myMesh, adjy=0.0) {
        let mx = 3, my = 4;
	let matFB = new BABYLON.StandardMaterial("");
	matFB.diffuseTexture = new BABYLON.Texture(charPath);
	matFB.diffuseTexture.hasAlpha = true;
	matFB.emissiveColor = new BABYLON.Color3.White();
	let uvF = new BABYLON.Vector4(0, 0/my, 1/mx, 1/my); // B
        let uvB = new BABYLON.Vector4(0, 3/my, 1/mx, 4/my); // F
        let planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        planeFB.position.y = adjy;
        planeFB.material = matFB;
        planeFB.parent = myMesh;
        myMesh._planeFB = planeFB;
        // myMesh._txtFB = matFB.diffuseTexture;
	let matLR = new BABYLON.StandardMaterial("");
	matLR.diffuseTexture = new BABYLON.Texture(charPath);
	matLR.diffuseTexture.hasAlpha = true;
	matLR.emissiveColor = new BABYLON.Color3.White();
	let uvL = new BABYLON.Vector4(0, 2/my, 1/mx, 3/my); // L
        let uvR = new BABYLON.Vector4(1/mx, 1/my, 0, 2/my); // R
        let planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvR, backUVs: uvL, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        planeLR.position.y = adjy;
        planeLR.material = matLR;
        planeLR.rotation = new BABYLON.Vector3(0, R90, 0);
        planeLR.parent = myMesh;
        myMesh._planeLR = planeLR;
        // myMesh._txtLR = matLR.diffuseTexture;
    }


    // 友軍の配置
    let coMeshList = [];
    let chH = 2.0, chR = 0.5;
    let coMat = new BABYLON.StandardMaterial('mat', scene);
    coMat.alpha = 0.2;

    let coMeshOrg = [];
    for (let fpath of coTextPathList) {
        let coMesh = BABYLON.MeshBuilder.CreateCapsule("co", {height:chH, radius:chR }, scene);
        coMesh.material = coMat;
        coMesh.position.set(0, -1, 0);
        // coMesh.rotation = new BABYLON.Vector3(0, R180, 0);
        addCharPanel(fpath, coMesh)
        coMeshOrg.push(coMesh);
    }

    let addCoMesh = function(nCo) {
        let x, z, ii;
        for (let i=0; i < nCo; ++i) {
            x = myMesh.position.x + BABYLON.Scalar.RandomRange(-20, 20);
            z = myMesh.position.z + BABYLON.Scalar.RandomRange(-30, -10);
            ii = Math.min(Math.floor((z+grndH_)/grndH_*2), 3);
            let coMesh = coMeshOrg[ii].clone();
            coMesh.position.set(x, myScale, z);
            coMesh.scaling.setAll(myScale)
            coMesh._p = 2**(ii-2); // 合体時のポイント
            coMeshList.push(coMesh);
        }
    }


    // 敵軍の配置
    let emMeshList = [];
    let emBossMeshList = [];
    let emH = 2.0, emR = 0.5;
    let emMat = new BABYLON.StandardMaterial('mat', scene);
    emMat.alpha = 0.2;
    let emMeshOrg = [];
    for (let fpath of emTextPathList) {
        let emMesh = BABYLON.MeshBuilder.CreateCapsule("em", {height:emH, radius:emR }, scene);
        emMesh.material = emMat;
        emMesh.position.set(0, -1, 0);
        emMesh.rotation = new BABYLON.Vector3(0, R180, 0);
        addCharPanel(fpath, emMesh)
        emMeshOrg.push(emMesh);
    }
    // 敵情報
    let emInfos = [{ifpath:0, mass:1, type:"dwn_wpn"}, // 攻撃劣化
                   {ifpath:1, mass:1, type:"dwn_mv"},  // 移動ダウン(スロー)
                   {ifpath:2, mass:2, type:"dwn_grw"}, // 成長ダウン
                   {ifpath:3, mass:3, type:"dwn_grw"},]// 成長ダウン
    // 発生確率(累積値)
    let emPopR = [0.1, 0.2, 0.8];
    let addEmMesh = function(nEm) {
        let x, z, iz;
        for (let i=0; i < nEm; ++i) {
            x = myMesh.position.x + BABYLON.Scalar.RandomRange(-50, 50);
            z = myMesh.position.z + BABYLON.Scalar.RandomRange(50, 100);
            let p = Math.random();
            let ii = 0
            if (p<emPopR[0]) {
                ii=0;
            } else if (p<emPopR[1]) {
                ii=1;
            } else if (p<emPopR[2]) {
                ii=2;
            } else {
                ii=3;
            }
            let emMesh = emMeshOrg[ii].clone();
            emMesh.position.set(x, 2*myScale, z);
            emMesh.rotation = new BABYLON.Vector3(0, R180, 0);
            emMesh.scaling.setAll(myScale)
            let emAgg = new BABYLON.PhysicsAggregate(emMesh, BABYLON.PhysicsShapeType.CAPSULE, { mass: (myScale*2)*emInfos[ii].mass, restitution:0.01}, scene);
            emMesh._agg = emAgg
            emMesh._itype = ii
            emMeshList.push(emMesh);
        }
    }
    // ボス配置
    let addBossMesh = function() {
        let paraList = [{i:4, scale:4, pz:-grndH_+200},
                        {i:5, scale:15, pz:-200},
                        {i:6, scale:80, pz:grndH_-10},]
        for (let para of paraList) {
            let emMesh = emMeshOrg[para.i];
            emMesh.position.set(0, para.scale, para.pz);
            emMesh.rotation = new BABYLON.Vector3(0, R180, 0);
            emMesh.scaling.setAll(para.scale)
            let emAgg = new BABYLON.PhysicsAggregate(emMesh, BABYLON.PhysicsShapeType.CAPSULE, { mass:para.scale**2, restitution:0.01}, scene);
            emMesh._agg = emAgg;
            emBossMeshList.push(emMesh);
        }
    }


    // Player/Character state
    var state = "IN_AIR";
    var inAirSpeed = 20.0;
    var onGroundSpeed = 5.0;
    var jumpHeight = 5; // 1.5;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -18, 0);

    let keyAction = {forward:0, back:0, right:0, left:0, jump:0, fire:0};

    // Physics shape for the character
    let h = 2.0;
    let r = 0.5;
    let myMesh = BABYLON.MeshBuilder.CreateCapsule("me", {height: h, radius: r}, scene);
    let characterPosition = myPosi;

    myMesh.material = new BABYLON.StandardMaterial('mat', scene);
    myMesh.material.diffuseColor = BABYLON.Color3.Yellow();
    myMesh.material.alpha = 0.2;
    addCharPanel(myTextPath, myMesh);
    let myScaleMax =10;
    let setMyScale = function(vscale) {
        let myScaleOld = myScale;
        myScale=vscale;
        if (myScale>myScaleMax) {
            myScale=myScaleMax;
        }
        myMesh.scaling.setAll(myScale)
        setCamera();
        if (Math.floor(myScaleOld) != Math.floor(myScale)) {
            initBullet(iblttype);
        }
    }
    setMyScale(1)
    setCamera();
    addCoMesh(10);
    addEmMesh(100);
    addBossMesh();

    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
    camera.lockedTarget = myMesh;

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
            // スケールによる移動補正
            let desiredVelocity = inputDirection.scale(inAirSpeed*myScale*myMvR).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            let desiredVelocity = inputDirection.scale(onGroundSpeed*myScale*myMvR).applyRotationQuaternion(characterOrientation_);
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
            let u = Math.sqrt(2 * characterGravity.length() * jumpHeight * myScale);
            let curRelVel = currentVelocity.dot(upWorld);
            return currentVelocity.add(upWorld.scale(u - curRelVel));
        }
        return Vector3.Zero();
    }
    scene.onBeforeRenderObservable.add((scene) => {
        myMesh.position.copyFrom(characterController.getPosition());
        myMesh.position.y += myScale*1.8-2; // scaleによる高さ(y)補正
    });
    scene.onAfterPhysicsObservable.add((_) => {
        if (scene.deltaTime == undefined) return;
        let dt = scene.deltaTime / 1000.0;
        if (dt == 0) return;
        let down = new BABYLON.Vector3(0, -1, 0);
        let support = characterController.checkSupport(dt, down);
        if (keyAction.right) {
            myMesh.rotate(new BABYLON.Vector3(0, 1, 0), 0.02);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0.02, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        } else if (keyAction.left) {
            myMesh.rotate(new BABYLON.Vector3(0, 1, 0), -0.02);
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
                keyAction.left = 1;
            } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
                keyAction.right = 1;
            } else if (kbInfo.event.key == 'Enter') {
                keyAction.jump = 1;
            } else if (kbInfo.event.key == ' ') {
                keyAction.fire = 1;
            } else if (kbInfo.event.key == 'c') {
                icamera = (icamera+1) % ncamera;
                setCamera();
            } else if (kbInfo.event.key == 'f') {
                iblttype = (iblttype+1) % nblttype;
                initBullet(iblttype);
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
            } else if (kbInfo.event.key == 'Enter') {
                keyAction.jump = 0;
            } else if (kbInfo.event.key == ' ') {
                keyAction.fire = 0;
            }
            break;
        }
    });

    // ------------------------------
    let iblttype = 0, nblttype = 1, bulletList=[], bulletPool=[], bltvrate=1000;
    let ibltcool=0, nbltcool=5;
    let initBullet = function(vtype) {
        if (bulletList.length) {
            for (let m of bulletList) { 
                m._agg.dispose();
                m.dispose();
            }
            bulletList = [];
        }
        if (bulletPool.length) {
            for (let m of bulletPool) { 
                m._agg.dispose();
                m.dispose();
            }
            bulletPool = [];
        }
        iblttype = vtype;
        if (iblttype == 0) {
            mat = new BABYLON.StandardMaterial('mat', scene);
            mat.diffuseColor = BABYLON.Color3.Yellow();
            let nbullet = 50;
            for (let i=0; i < nbullet; ++i) {
                let mesh = BABYLON.MeshBuilder.CreateSphere("b", { diameter:0.2*myScale}, scene);
                mesh.material=mat;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 10*myScale, restitution:0.05}, scene);
                agg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
                agg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
                mesh.physicsBody.disablePreStep = false;
                mesh._agg = agg;
                mesh._life = 0;
                bulletPool.push(mesh)
            }
            bltvrate=10000;
            ibltcool=1;
            nbltcool=1;
        } else if (iblttype == 1) {
        }
    }
    let fireBullet = function() {
        if (--ibltcool) {
            return
        }
        ibltcool=nbltcool;
        let mesh;
        if (bulletPool.length) {
            mesh = bulletPool.pop();
        } else if (bulletList.length > 0) {
            mesh = bulletList.shift();
        } else {
            return;
        }
        mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める

        let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(characterOrientation);
        vdir.x += BABYLON.Scalar.RandomRange(-0.1, 0.1)
        vdir.y += BABYLON.Scalar.RandomRange(-0.01, 0.01)
        mesh.position.copyFrom(myMesh.position.add(vdir))
        mesh.physicsBody.applyImpulse(vdir.scale(bltvrate*myScale),
                                      myMesh.absolutePosition);
        mesh._life = 100;
        bulletList.push(mesh);
    }
    scene.registerBeforeRender(function () {
        let pmin = myMesh.position.add(new BABYLON.Vector3(-100, 0, -100));
        let pmax = myMesh.position.add(new BABYLON.Vector3(100, 0, 100));
        //let tmplist = []
        // for (let mesh of bulletList) {
        for (let i=bulletList.length-1; i>=0; --i) {
            let mesh = bulletList[i];
            --(mesh._life);
            if (mesh._life) {
                if (mesh.position.x < pmin.x || mesh.position.z < pmin.z || mesh.position.x > pmax.x  || mesh.position.z > pmax.z || mesh.position.y < -1 ) {
                    bulletPool.push(mesh)
                    bulletList.splice(i, 1); // i位置の要素を削除
                // } else {
                //     tmplist.push(mesh)
                }
            } else {
                bulletPool.push(mesh)
                bulletList.splice(i, 1); // i位置の要素を削除
            }
        }
        // bulletList = tmplist;
    })
    initBullet(iblttype)



    // ------------------------------

    const rngMin = new BABYLON.Vector3(-grndW_, 0, -grndW_)
    const rngMax = new BABYLON.Vector3(grndW_, 0, grndW_)
    scene.registerBeforeRender(function () {
        // 範囲外の領域
        let pmin = myMesh.position.add(rngMin);
        let pmax = myMesh.position.add(rngMax);
        // 友軍
        let delMesh = [];
        for (let m of coMeshList) {
            if (m.position.x < pmin.x || m.position.z < pmin.z || m.position.x > pmax.x  || m.position.z > pmax.z || m.position.y < -1 ) {
                //console.log("友軍、領域外")
                delMesh.push(m)
                continue;
            }
            let vdir = myMesh.position.subtract(m.position);
            let len = vdir.length();
            if (len < myScale) {
                // 自機に接触  .. point を自機のscale に追加
                myScale += m._p;
                delMesh.push(m)
                // 友軍に触れたら復帰
                myWAttR = 1;
                myMvR = 1;
                continue;
            }
            // 自機の方向に移動させる
            vdir = vdir.normalize().scale(0.01*myScale);
            m.position.addInPlace(vdir);
            let vrot = Math.atan2(vdir.x, vdir.z);
            m.rotation = new BABYLON.Vector3(0, 0, 0);
            m.rotate(BABYLON.Vector3.Up(), vrot);
        }
        if (delMesh.length) {
            for (let m of  delMesh) {
                let i = coMeshList.indexOf(m);
                coMeshList.splice(i, 1)
                m.dispose();
            }
            // 削除した分を追加
            addCoMesh(delMesh.length);
            // scaleを再設定
            setMyScale(myScale)
        }

        // 敵軍
        delMesh = [];
        for (let m of emMeshList) {
            if (m.position.x < pmin.x || m.position.z < pmin.z || m.position.y < -1 || m.position.x > pmax.x  || m.position.z > pmax.z) {
                //console.log("敵軍、領域外")
                delMesh.push(m)
                continue;
            }
            let vdir = myMesh.position.subtract(m.position);
            let len = vdir.length();
            if (len < myScale) {
                // 自機に接触  .. タイプに応じて
                let acttype = emInfos[m._itype].type;
                if (acttype == "dwn_wpn") {
                    myWAttR -= 0.1;
                    if (myWAttR < myWAttRmin) { myWAttR = myWAttRmin; }
                } else if (acttype == "dwn_mv") {
                    myMvR -= 0.1;
                    if (myMvR < myMvRmin) { myMvR = myMvRmin; }

                } else if (acttype == "dwn_grw") {
                    myScale -= 0.01
                    if (myScale < 1) { myScale = 1; }
                }
                delMesh.push(m)
            }
            // 自機の方向に移動させる
            vdir = vdir.normalize().scale(0.02*myScale);
            m.position.addInPlace(vdir);
            let vrot = Math.atan2(vdir.x, vdir.z);
            m.rotation = new BABYLON.Vector3(0, 0, 0);
            m.rotate(BABYLON.Vector3.Up(), vrot);
        }
        if (delMesh.length) {
            for (let m of delMesh) {
                let i = emMeshList.indexOf(m);
                emMeshList.splice(i, 1)
                m.dispose();
            }
            // 削除した分を追加
            addEmMesh(delMesh.length);
            // scaleを再設定
            setMyScale(myScale)
        }

        if (keyAction.fire) {
            fireBullet()
        }
    })


    // 左上に使い方（操作方法）を表示
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
    text1.text = "Usage:\n"
        +"(W,S) or (Arrow UP/DOWN): forward/back\n"
        +"(A,D) or (Arrow Left/Right): turn Left/Right\n"
        +"(Space): Fire\n"
        +"(Enter): Jump\n"
        +"C: change Camera\n"
        +"H: show/hide this message";
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

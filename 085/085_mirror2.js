// ミラーハウス

// // for local
// const SCRIPT_URL1 = "./Maze.js";
// const SCRIPT_URL2 = "./MazeData.js";

// for PlayGround
const SCRIPT_URL1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";
const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData.js";

let Maze = null;
let MazeData = null;
import(SCRIPT_URL1).then((obj) => { Maze = obj; });
import(SCRIPT_URL2).then((obj) => { MazeData = obj; });

const R90 = Math.PI/2;
const R180 = Math.PI;

// 多次元配列用のシャッフル
const shuffle2 = (arr) =>
  arr.map((value) => ({ value, random: Math.random() }))
    .sort((a, b) => a.random - b.random)
    .map(({ value }) => value);

var createScene = async function () {
    await BABYLON.InitializeCSG2Async();

    var scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.rotationOffset = 180;
    camera.radius = 1.3;
    camera.heightOffset = 0.0;
    camera.cameraAcceleration = 0.3;
    camera.maxCameraSpeed = 30;

    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 3;

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, 100), scene);
    light.intensity = 0.2;
    var light2 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, -100), scene);
    light2.intensity = 0.2;
    var light3 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, 100), scene);
    light3.intensity = 0.2;
    var light4 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, -100), scene);
    light4.intensity = 0.2;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // 鏡に登録するため、事前に宣言
    let h = 1.2;
    let r = 0.2;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: h, radius: r}, scene);


    let maze = null;
    const wL=2.5, wL_=wL/2, wS=0.1, wS_=wS/2, wH=2.2, wH_=wH/2;
    let adjx, adjz, nx, nz, adjx2, adjz2, nz2;

    let matMRR = new BABYLON.StandardMaterial("mirror", scene);
    matMRR.reflectionTexture = new BABYLON.MirrorTexture("mirror", {ratio: 0.5}, scene, true);
    matMRR.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, 0, 1, 0);
    matMRR.reflectionTexture.renderList = [];
    matMRR.reflectionTexture.level = 1.0;
    matMRR.reflectionTexture.adaptiveBlurKernel = 5;

    let istage = 0;
    let stageInfo = []
    function createStaticMesh(istage, scene) {
        while (stageInfo.length > 0) {
            let [mesh, agg] = stageInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        let meshes = [];
        maze = new Maze.Maze2(11, 11);
        maze.create(21); // 穴掘り法で作成
        maze.setStartGoal([10,5], [0,5]);

        adjx=-(maze.ncol_-1)*wL_, adjz=-(maze.nrow_+1)*wL_, nx=maze.ncol_, nz=maze.nrow_;
        let x,y=wH_,z, ix,iz;

        let ground = BABYLON.MeshBuilder.CreateGround("ground", {width:(nx+4)*wL, height:(nz+4)*wL}, scene);
        let groundAgg = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);
        ground.material = new BABYLON.StandardMaterial('mat', scene);
        ground.material.diffuseColor = BABYLON.Color3.Black();
        ground.material.alpha = 0.7;
        meshes.push(ground);
        stageInfo.push([ground, groundAgg]);

        // スタート地点のパネル
        {
            [iz, ix] = maze.pStart_;
            let mesh = BABYLON.MeshBuilder.CreatePlane("plnST", {width:wL, height:wL}, scene);
            mesh.position = new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz);
            mesh.rotation = new BABYLON.Vector3(Math.PI/2, 0, 0);
            mesh.material = new BABYLON.StandardMaterial('mat', scene);
            mesh.material.diffuseColor = BABYLON.Color3.Blue();
            stageInfo.push([mesh, null]);
        }
        // ゴール地点のパネル
        for (let [iz,ix] of maze.pGoalList_) {
            let mesh = BABYLON.MeshBuilder.CreatePlane("plnST", {width:wL, height:wL}, scene);
            mesh.position = new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz);
            mesh.rotation = new BABYLON.Vector3(Math.PI/2, 0, 0);
            mesh.material = new BABYLON.StandardMaterial('mat', scene);
            mesh.material.diffuseColor = BABYLON.Color3.Red();
            stageInfo.push([mesh,null]);
        }

        // 最短経路  .. 移動距離だけを見た最短距離（点線で表示）
        {
            maze.seekPath2(); // 最短経路をもとめる
            let plist = [];
            for (let idx of maze.path2_) {
                [iz,ix] = maze.idx2rc(idx);
                plist.push(new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz));
            }
            let line = BABYLON.MeshBuilder.CreateDashedLines("arc", {points: plist, dashSize:1, gapSize:1});
            line.color = BABYLON.Color3.Gray();
            stageInfo.push([line,null]);
        }

        function createWallNS(x, y, z) {
            let mesh = BABYLON.MeshBuilder.CreateBox("wallNS", { width:wL, height:wH, depth:wS }, scene);
            mesh.position = new BABYLON.Vector3(x, y, z);
            mesh.visibility = 0.2;
            let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
            return [mesh, agg];
        }

        function createWallEW(x, y, z) {
            let mesh = BABYLON.MeshBuilder.CreateBox("wallD", { width:wS, height:wH, depth:wL }, scene);
            mesh.position = new BABYLON.Vector3(x, y, z);
            mesh.visibility = 0.2;
            let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
            return [mesh, agg];
        }

        function createMirrorNS(x, y, z) {
            // 南側、南向きの鏡
            let matMRRs = new BABYLON.StandardMaterial("mirror", scene);
            matMRRs.reflectionTexture = new BABYLON.MirrorTexture("mirror", {ratio: 0.5}, scene, true);
            matMRRs.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, 0, 1, -(z));
            matMRRs.reflectionTexture.renderList = [displayCapsule];
            matMRRs.reflectionTexture.level = 1.0;
            matMRRs.reflectionTexture.adaptiveBlurKernel = 5;

            let mesh = BABYLON.MeshBuilder.CreatePlane("mirrorNS", { width:wL, height:wH }, scene);
            mesh.position = new BABYLON.Vector3(x, y, z-wS_);
            mesh.material =　matMRRs;

            // 北側、北向きの鏡
            let matMRRn = new BABYLON.StandardMaterial("mirror", scene);
            matMRRn.reflectionTexture = new BABYLON.MirrorTexture("mirror", {ratio: 0.5}, scene, true);
            matMRRn.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, 0, -1, z);
            matMRRn.reflectionTexture.renderList = [displayCapsule];
            matMRRn.reflectionTexture.level = 1.0;
            matMRRn.reflectionTexture.adaptiveBlurKernel = 5;

            let mesh2 = BABYLON.MeshBuilder.CreatePlane("mirrorNS", { width:wL, height:wH }, scene);
            mesh2.position = new BABYLON.Vector3(x, y, z+wS_);
            mesh2.addRotation(R180, 0, 0);
            mesh2.material =　matMRRn;

            return [mesh, mesh2];
        }

        function createMirrorEW(x, y, z) {
            // 東／右側、東向きの鏡
            let matMRRs = new BABYLON.StandardMaterial("mirror", scene);
            matMRRs.reflectionTexture = new BABYLON.MirrorTexture("mirror", {ratio: 0.5}, scene, true);
            matMRRs.reflectionTexture.mirrorPlane = new BABYLON.Plane(1, 0, 0, -(x));
            matMRRs.reflectionTexture.renderList = [displayCapsule];
            matMRRs.reflectionTexture.level = 1.0;
            matMRRs.reflectionTexture.adaptiveBlurKernel = 5;

            let mesh = BABYLON.MeshBuilder.CreatePlane("mirrorEW", { width:wL, height:wH }, scene);
            mesh.position = new BABYLON.Vector3(x+wS_, y, z);
            mesh.addRotation(0, R90, 0);
            mesh.material =　matMRRs;

            // 西側、西向きの鏡
            let matMRRn = new BABYLON.StandardMaterial("mirror", scene);
            matMRRn.reflectionTexture = new BABYLON.MirrorTexture("mirror", {ratio: 0.5}, scene, true);
            matMRRn.reflectionTexture.mirrorPlane = new BABYLON.Plane(-1, 0, 0, (x));
            matMRRn.reflectionTexture.renderList = [displayCapsule];
            matMRRn.reflectionTexture.level = 1.0;
            matMRRn.reflectionTexture.adaptiveBlurKernel = 5;

            let mesh2 = BABYLON.MeshBuilder.CreatePlane("mirrorNS", { width:wL, height:wH }, scene);
            mesh2.position = new BABYLON.Vector3(x-wS_, y, z);
            mesh2.addRotation(0, -R90, 0);
            mesh2.material =　matMRRn;

            return [mesh, mesh2];
        }

        {
            // 上側の境界
            iz = 0;
            z = nz*wL+adjz;
            for (let ix = 0; ix < nx; ++ix) {
                if (maze.isGoal(iz,ix)) {
                    continue;
                }
                if (maze.isWallPosiDir([iz,ix],3)) { // 北向き
                    x = ix*wL+adjx;
                    let [mesh, agg] = createWallNS(x, y, z+wL_);
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                    let [mesh1, mesh2] = createMirrorNS(x, y, z+wL_);
                    stageInfo.push([mesh1,mesh2]);
                }                
            }
        }
        {
            // 左側の境界
            ix = 0;
            x = adjx;
            for (let iz = 0; iz < nz; ++iz) {
                if (maze.isWallPosiDir([iz,ix],2)) { // 西向き
                    z = (iz+1)*wL+adjz;
                    let [mesh, agg] = createWallEW(x-wL_, y, z)
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                    let [mesh1, mesh2] = createMirrorEW(x-wL_, y, z);
                    stageInfo.push([mesh1,mesh2]);
                }
            }
        }
        for (let iz = 0; iz < nz; ++iz) {
            z = (nz-iz)*wL+adjz;
            for (let ix = 0; ix < nx; ++ix) {
                x = ix*wL+adjx;
                if (maze.isWallPosiDir([iz,ix],0)) { // 東向き
                    let [mesh, agg] = createWallEW(x+wL_, y, z)
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                    let [mesh1, mesh2] = createMirrorEW(x+wL_, y, z);
                    stageInfo.push([mesh1,mesh2]);
                }
                if (maze.pStart_[0] == iz && maze.pStart_[1] == ix) {
                    continue;
                }
                if (maze.isWallPosiDir([iz,ix],1)) { // 南向き
                    let [mesh, agg] =createWallNS(x, y, z-wL_);
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                    let [mesh1, mesh2] =createMirrorNS(x, y, z-wL_);
                    stageInfo.push([mesh1,mesh2]);
                }
            }
        }

        return meshes;
    }

    let meshes = createStaticMesh(istage, scene);

    
    let setDest = function() {
        // // キャラクターコントローラーをスタート地点に移動させる
        [iz, ix] = maze.pStart_;
        ++iz; // １マス手前にずらす
        characterController._position = new BABYLON.Vector3(ix*wL+adjx, wH_, (nz-iz)*wL+adjz);
    }

    // Player/Character state
    var state = "IN_AIR";
    var inAirSpeed = 10.0;
    var onGroundSpeed = 8.0;
    var jumpHeight = 3;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -18, 0);

    let keyAction = {forward:0, back:0, right:0, left:0, jump:0};

    // Physics shape for the character
    // let h = 1.2;
    // let r = 0.2;
    // let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: h, radius: r}, scene);
    // let characterPosition = new BABYLON.Vector3(0, 10, -8);
    let characterPosition = new BABYLON.Vector3(0, 10, 0);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
    camera.lockedTarget = displayCapsule;

    displayCapsule.material = new BABYLON.StandardMaterial('mat', scene);
	    displayCapsule.material.diffuseColor = BABYLON.Color3.Blue();
	    displayCapsule.material.alpha = 0.7;

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
            } else if (kbInfo.event.key == ' ') {
                keyAction.jump = 1;
            } else if (kbInfo.event.key == 'c') {
                icamera = (icamera+1) % 4;
                console.log("camera=",icamera);
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 3;
                    camera.heightOffset = 1.1;
                    camera.cameraAcceleration = 0.1;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 20;
                    camera.heightOffset = 8;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 1;
                    camera.heightOffset = 20;
                    camera.cameraAcceleration = 0.5;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 1.3;
                    camera.heightOffset = 0.0;
                    camera.cameraAcceleration = 0.3;
                    camera.maxCameraSpeed = 30;
                }

            } else if (kbInfo.event.key === 'Enter') {
                setDest();
            } else if (kbInfo.event.key === 'n') {
                scene.render();
                istage = (istage+1) % nstage;
                meshes = createStaticMesh(istage, scene);
                setDest();
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
                // wantJump = false;
                keyAction.jump = 0;
            }
            break;
        }
    });

    setDest();

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
    text1.text = "Usage:\n(W,S) or (Arrow UP/DOWN): Forward/Back\n(A,D) or (Arrow Left/Right): turn Left/Right\n(Space): jump\n(Enter): Game Start\nC: change Camera\nN: Next stage\nH: show/hide this message";
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
};

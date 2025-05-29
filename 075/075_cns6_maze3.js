// Crowd Navigation System(CNS)のエージェントとマイクロマウスの迷路で競争
// - エージェントとキャラクターコントローラーで競争

const SCRIPT_URL1 = "./Maze.js";
// const SCRIPT_URL1 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/075/Maze.js";
let Maze = null;
import(SCRIPT_URL1).then((obj) => { Maze = obj; console.log("maze=",obj); });

const SCRIPT_URL2 = "./MazeData.js";
// const SCRIPT_URL2 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/075/MazeData.js";
let MazeData = null;
import(SCRIPT_URL2).then((obj) => { MazeData = obj; console.log("mazeData=",obj); });

// 多次元配列用のシャッフル
const shuffle2 = (arr) =>
  arr.map((value) => ({ value, random: Math.random() }))
    .sort((a, b) => a.random - b.random)
    .map(({ value }) => value);

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
    let icamera = 0;

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

    const mapnames = [
        'sdatamm2018classic',
        'sdatamm2023semifinal',
        'sdatamm2024semifinal',
        'sdatamm2015final',
        'sdatamm2016final',
        'sdatamm2017final',
        'sdatamm2018final',
        'sdatamm2019final',
        'sdatamm2023final',
        'sdatamm2024final',
    ];
    let maze = null;
    let maze3 = null;
    const wL=1.5, wL_=wL/2, wS=0.1, wS_=wS/2, wH=0.8, wH_=wH/2;
    let adjx, adjz, nx, nz, adjx2, adjz2, nz2;

    let istage = 0, nstage = mapnames.length;
    let stageInfo = []
    function createStaticMesh(istage, scene) {
        while (stageInfo.length > 0) {
            let [mesh, agg] = stageInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        let meshes = [];
        let key = mapnames[istage];
        maze = new Maze.Maze2();
        maze.create_from(MazeData.getMap2Data(key));

        maze3 = new Maze.Maze3();
        maze3.create_from_maze2(maze);

        adjx=-(maze.ncol_-1)*wL_, adjz=-(maze.nrow_+1)*wL_, nx=maze.ncol_, nz=maze.nrow_;
        adjx2=-(maze3.ncol_-1)*wL_/2, adjz2=-(maze3.nrow_+1)*wL_/2, nz2=maze3.nrow_;
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
        // 最短経路(2)  .. 直線の台形加速・斜め移動を考慮した最短距離（実線：黄色で表示）
        if (1) {
            maze3.seekPath7();  // 最短経路(斜めあり)
            let plist = [];
            for (let idx of maze3.path7_) {
                [iz,ix] = maze3.idx2rc(idx);
                plist.push(new BABYLON.Vector3(ix*wL_+adjx2, 0.02, (nz2-iz)*wL_+adjz2));
            }
            let line = BABYLON.MeshBuilder.CreateLines("arc", {points: plist});
            line.color = BABYLON.Color3.Yellow();
            stageInfo.push([line,null]);
        }
        // 複数経路(mase3)：処理が重い..10秒近くかかることも？
        if (0) {
            let pathlist = maze3.seekSomePath7();  // 最短経路(斜めあり)
            let iloop = 0, gap_=0.01, gap;
            for (let paht of pathlist) {
                gap = gap_*iloop;
                let plist = [];
                for (let idx of paht) {
                    [iz,ix] = maze3.idx2rc(idx);
                    plist.push(new BABYLON.Vector3(ix*wL_+adjx2-gap, 0.1-gap, (nz2-iz)*wL_+adjz2-gap));
                }
                let line = BABYLON.MeshBuilder.CreateLines("arc", {points: plist});
                if (iloop == 0) {
                    line.color = BABYLON.Color3.Yellow();
                } else if (iloop == 1) {
                    line.color = BABYLON.Color3.Red();
                } else if (iloop == 2) {
                    line.color = BABYLON.Color3.Blue();
                }
                
                stageInfo.push([line,null]);
                ++iloop;
                if (iloop == 3) {
                    break;
                }
            }
        }

        {
            // 上側の境界
            iz = 0;
            z = nz*wL+adjz;
            for (let ix = 0; ix < nx; ++ix) {
                if (maze.isWallPosiDir([iz,ix],3)) { // 北向き
                    x = ix*wL+adjx;
                    let mesh = BABYLON.MeshBuilder.CreateBox("wallW", { width:wL, height:wH, depth:wS }, scene);
                    mesh.position = new BABYLON.Vector3(x, y, z+wL_);
                    let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
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
                    let mesh = BABYLON.MeshBuilder.CreateBox("wallD", { width:wS, height:wH, depth:wL }, scene);
                    mesh.position = new BABYLON.Vector3(x-wL_, y, z);
                    let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                }
            }
        }
        for (let iz = 0; iz < nz; ++iz) {
            z = (nz-iz)*wL+adjz;
            for (let ix = 0; ix < nx; ++ix) {
                x = ix*wL+adjx;
                if (maze.isWallPosiDir([iz,ix],0)) { // 東向き
                    let mesh = BABYLON.MeshBuilder.CreateBox("wallD", { width:wS, height:wH, depth:wL }, scene);
                    mesh.position = new BABYLON.Vector3(x+wL_, y, z);
                    let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                }
                if (maze.isWallPosiDir([iz,ix],1)) { // 南向き
                    let mesh = BABYLON.MeshBuilder.CreateBox("wallW", { width:wL, height:wH, depth:wS }, scene);
                    mesh.position = new BABYLON.Vector3(x, y, z-wL_);
                    let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                }
            }
        }

        return meshes;
    }

    let meshes = createStaticMesh(istage, scene);

    var navmeshParameters = {
        cs: 0.2,  // 歩行可能なナビメッシュのボクセルサイズ（幅、深さ
        ch: 0.2,  // ボクセルの高さ
        walkableSlopeAngle: 90,  // 歩行可能な最大傾斜の角度[度]
        walkableHeight: 1.0,  //  歩行が許可されるボクセル単位の高さ
        walkableClimb: 0.5, // 1,  // 登ることができるボクセル単位のデルタ
        walkableRadius: 0.5, // 1,  // エージェントのボクセル単位での半径
        maxEdgeLen: 12.,  // メッシュの境界に沿った輪郭エッジの最大許容長さ[ボクセル単位]
        maxSimplificationError: 1.3, // 境界エッジが元の生の輪郭から逸脱する最大距離[ボクセル単位]
        minRegionArea: 4, // 8,  // 孤立した島領域を形成できるセルの最小数[ボクセル単位]
        mergeRegionArea: 20,  // 領域結合の閾値。[ボクセル単位]
        maxVertsPerPoly: 6, // 輪郭線からポリゴンへの頂点の最大数(３以上)
        detailSampleDist: 6,  // 詳細メッシュ生成のサンプリング距離
        detailSampleMaxError: 1,  // 詳細メッシュ表面が高さフィールドの最大距離[ワールド単位]
        };
    let maxAgents = 10;
    var agentParams = {
        radius: 0.1,  // エージェントの半径。[制限: >= 0]
        reachRadius: 0.3, // エージェントが目的地の周囲にこの半径の仮想円内に入ると、オブザーバーに通知されます。デフォルトはエージェントの半径です。
        height: 0.2, // エージェントの高さ。[制限: > 0]
        maxAcceleration: 4.0,  // 最大許容加速度。[制限: >= 0]
        maxSpeed: 1,  // 許容される最大速度。[制限: >= 0]
        collisionQueryRange: 0.5,  // ステアリング動作の対象となる衝突要素がどれだけ近い必要があるかを定義します。[制限: > 0]
        pathOptimizationRange: 0.0,  // パスの可視性の最適化範囲。[制限: > 0]
        separationWeight: 3.0 // エージェント マネージャーがこのエージェントとの衝突を回避する際の積極性。[制限: >= 0]
    };
    let navigationPlugin = null, navmeshdebug = null, crowd = null, agentCubeList = [];

    let resetAgent = function(meshes, scene) {
        if (crowd != null) { crowd.dispose(); }
        if (navmeshdebug != null) { navmeshdebug.dispose(); }
        if (navigationPlugin != null) { navigationPlugin.dispose(); }
        while (agentCubeList.length > 0) { agentCubeList.pop().dispose(); };

        navigationPlugin = new BABYLON.RecastJSPlugin();
        navigationPlugin.createNavMesh(meshes, navmeshParameters);
        // crowd
        crowd = navigationPlugin.createCrowd(maxAgents, 0.1, scene);
        agentCubeList = [];
        for (let i = 0; i < maxAgents; i++) {
            var width = 0.20;
            var agentCube = BABYLON.MeshBuilder.CreateBox("cube", { size: width, height: width }, scene);
            var matAgent = new BABYLON.StandardMaterial('mat2', scene);
            var variation = Math.random();
            matAgent.diffuseColor = new BABYLON.Color3(0.4 + variation * 0.6, 0.3, 1.0 - variation * 0.3);
            agentCube.material = matAgent;
            var randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(20*Math.random()-10, 0.1, 5*Math.random()), 0.5);
            var transform = new BABYLON.TransformNode();
            agentCube.parent = transform;
            agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(10,20);
            agentParams.maxSpeed = BABYLON.Scalar.RandomRange(3,6);
            var agentIndex = crowd.addAgent(randomPos, agentParams, transform);
            agentCubeList.push(agentCube);
        }
    }

    resetAgent(meshes, scene);
    
    let setDest = function() {
        let agents = crowd.getAgents();
        let p;
        for (let agID of agents) {
            // 初期位置：スタート地点付近にテレポート
            [iz, ix] = maze.pStart_;
            p = new BABYLON.Vector3(ix*wL+adjx, wH_, (nz-iz)*wL+adjz);
            crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(p));
            // 目標位置：ゴール地点に
            [iz, ix] = maze.pGoalList_[agID % maze.pGoalList_.length];
            p = new BABYLON.Vector3(ix*wL+adjx, wH_, (nz-iz)*wL+adjz);
            crowd.agentGoto(agID, navigationPlugin.getClosestPoint(p));
        }
        // キャラクターコントローラーをスタート地点に移動させる
        [iz, ix] = maze.pStart_;
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
    let h = 1.2;
    let r = 0.2;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: h, radius: r}, scene);
    let characterPosition = new BABYLON.Vector3(0, 10, -8);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
    camera.lockedTarget = displayCapsule;

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, r);
    localAxes.xAxis.parent = displayCapsule; localAxes.yAxis.parent = displayCapsule; localAxes.zAxis.parent = displayCapsule;
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
                    camera.radius = 0.5;
                    camera.heightOffset = 0.1;
                    camera.cameraAcceleration = 0.3;
                    camera.maxCameraSpeed = 30;
                }

            } else if (kbInfo.event.key === 'Enter') {
                setDest();
            } else if (kbInfo.event.key === 'n') {
                scene.render();
                istage = (istage+1) % nstage;
                meshes = createStaticMesh(istage, scene);
                resetAgent(meshes, scene);
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

    var ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var panel = createGUIPanel(ui);
    addText(scene, panel, (bodiesCounter) => {
        let stext = mapnames[istage];
        stext = stext.slice(5); // 冒頭の５文字(sdata）をけずる
        bodiesCounter.text = stext;
    });

    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "130px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n(W,S) or (Arrow UP/DOWN): Forward/Back\n(A,D) or (Arrow Left/Right): turn Left/Right\n(Space): jump\nC: change Camera\nN: Next stage\nH: show/hide this message";
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

function createGUIPanel(gui) {
    var panel = new BABYLON.GUI.StackPanel();
    panel.spacing = 5;
    gui.addControl(panel);
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.paddingLeftInPixels = 10;
    panel.paddingTopInPixels = 10;
    return panel;
}

var bodiesCounter;
function addText(scene, parent, updateFn, initialText) {
    bodiesCounter = new BABYLON.GUI.TextBlock("bodiesCounter", initialText);
    bodiesCounter.color = "white";
    bodiesCounter.resizeToFit = true;
    bodiesCounter.fontSize = "20px";
    parent.addControl(bodiesCounter);
    if (updateFn) {
        scene.onAfterRenderObservable.add(() => updateFn(bodiesCounter));
    }
    return bodiesCounter;
}

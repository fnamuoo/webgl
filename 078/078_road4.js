// 凹凸のある道路をキャラクターコントローラーでCNSと競争する(4)

// for local
const SCRIPT_URL1 = "../075/Maze.js";
// for PlayGround
// const SCRIPT_URL1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";

let Maze = null;
import(SCRIPT_URL1).then((obj) => { Maze = obj; console.log("maze=",obj); });

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

    // エージェント追跡用カメラ
    let camera2type = 0; // ワイプ表示 (0: 無し、1: caemra2A, camera2B
    let camera2A = new BABYLON.FreeCamera("Camera2A", new BABYLON.Vector3(2, 5, -10), scene);
    camera2A.setTarget(BABYLON.Vector3.Zero());
    camera2A.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let camera2B = new BABYLON.FreeCamera("Camera2B", new BABYLON.Vector3(2, 5, -10), scene);
    camera2B.setTarget(BABYLON.Vector3.Zero());
    camera2B.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    scene.activeCameras.push(camera);
    camera.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
    camera2A.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);
    camera2B.viewport = new BABYLON.Viewport(0.7, 0.0, 0.3, 0.3);

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

    let maze = null;
    const wL=10, wL_=wL/2, wS=0.1, wS_=wS/2, wH=0.8, wH_=wH/2;
    let mapR = 7, mapC = 9;
    let adjx, adjz, nx, nz, adjx2, adjz2, nz2;

    // index座標値から座標値への変換
    let ixz2xz = function (ix, iz) {
        return [ix*wL+adjx, (nz-iz)*wL+adjz];
    }
    // 座標値からindex座標値への変換
    let xz2ixz = function (x, z) {
        return [(x -adjx)/wL, (z -adjz)/wL-1];
    }

    let stageLv=1;
    let pStart, pGoal, meshGoal = null, goalRank;
    let goalFlag = {0:0, 1:0, 2:0, 3:0, }; // meshと順位
    let iCheckGoal = 999;

    let stageInfo = [], mesh, agg;
    function createStaticMesh(scene) {
        iCheckGoal = 999;
        while (stageInfo.length > 0) {
            let [mesh,agg] = stageInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        let meshes = [];
        mapR = 6 + stageLv;
        mapC = 8 + stageLv;
        maze = new Maze.Maze1(mapR, mapC);
        maze.create(21);
        maze.resetStartGoal();
        maze.dbgPrintMap();

        adjx=-(maze.ncol_-1)*wL_, adjz=-(maze.nrow_+1)*wL_, nx=maze.ncol_, nz=maze.nrow_;
        let x,y=wH_,z, ix,iz;

        let nbPoints = 10;

        // 最短経路
        if (1) {
            maze.seekPath2(); // 最短経路をもとめる
            let plist = [];
            for (let idx of maze.path2_) {
                [iz,ix] = maze.idx2rc(idx);
                plist.push(new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz));
            }
            let line = BABYLON.MeshBuilder.CreateDashedLines("arc", {points: plist, dashSize:1, gapSize:1});
            line.color = BABYLON.Color3.Gray();
            stageInfo.push([line,null]);
            // 上記で取得した点列を、スプラインで補間
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
            const plist2 = catmullRom.getPoints();
            // 補間した点群を線分で表示
            const arcLine = BABYLON.MeshBuilder.CreateLines("arc", {points: plist2})
            arcLine.color = BABYLON.Color3.Blue();
            stageInfo.push([arcLine,null]);
        }

        // 経路に高さをperlinノイズで.. 
        if (1) {
            maze.seekPath2(); // 最短経路をもとめる
            let nb = new BABYLON.NoiseBlock();
            const nbvzero = new BABYLON.Vector3(0,0,0), nbscale = 0.5;
            let plist = [];
            for (let idx of maze.path2_) {
                [iz,ix] = maze.idx2rc(idx);
                let y = nb.noise(4, 0.5, new BABYLON.Vector3(ix,iz,0), nbvzero, nbscale);
                y *= 30;
                plist.push(new BABYLON.Vector3(ix*wL+adjx, y, (nz-iz)*wL+adjz));
            }
            // 上記で取得した点列を、スプラインで補間
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
            const plist2 = catmullRom.getPoints();
            // 個々の点で進行方向ベクトルをもとめ、水平方向をもとめ、水平位置の右側／左側の座標を求める
            let p1 = plist2[0], p2=p1, v, v1, vR, vL, vC, pR, pL;
            const sW = 3, sW_=sW/2;
            const qR = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), Math.PI/2);
            const qL = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -Math.PI/2);
            v1 = BABYLON.Vector3.Zero;
            let plist3R = [], plist3L = [];
            for (let p of plist2) {
                v = p.subtract(p1);
                vR = v.applyRotationQuaternion(qR);
                pR = p.add(vR.scale(sW_));
                vL = v.applyRotationQuaternion(qL);
                pL = p.add(vL.scale(sW_));
                // ベクトル片の外積(vC.y)から（右／左）どちら向きかを判断し、曲がる方向に傾ける（高さを調整する）
                vC = BABYLON.Vector3.Cross(v,v1);
                if (Math.abs(vC.y) > 0.0001) {
                    pR.y += vC.y*2;
                    pL.y -= vC.y*2;
                }
                plist3R.push(pR);
                plist3L.push(pL);
                p2 = p1;
                p1 = p;
                v1 = v;
            }

            // 道の端のガード
            const guideR = 0.03;
            let meshR = BABYLON.MeshBuilder.CreateTube("tube", {path: plist3R, radius: guideR, tessellation: 4}, scene);
            meshR.material = new BABYLON.StandardMaterial("mat", scene);
            meshR.material.emissiveColor = BABYLON.Color3.Blue();
            stageInfo.push([meshR,null]);
            let meshL = BABYLON.MeshBuilder.CreateTube("tube", {path: plist3L, radius: guideR, tessellation: 4}, scene);
            meshL.material = new BABYLON.StandardMaterial("mat", scene);
            meshL.material.emissiveColor = BABYLON.Color3.Red();
            stageInfo.push([meshL,null]);

            // 道の本体をribbonで作成する
            let mypath3 = [plist3R, plist3L];
            let mesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: mypath3, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
            stageInfo.push([mesh,agg]);
            meshes.push(mesh);

            pStart = plist2[1].clone();
            pGoal = plist2[plist2.length-2].clone();

            // ゴール地点のメッシュ
            meshGoal = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: wL/4}, scene);
            meshGoal.position = pGoal.clone();
            meshGoal.material = new BABYLON.CellMaterial("cell", scene);
            meshGoal.material.diffuseTexture = new BABYLON.Texture("textures/amiga.jpg", scene);
            meshGoal.material.alpha = 0.5;
            stageInfo.push([meshGoal,null]);
        }

        return meshes;
    }

    let meshes = createStaticMesh(scene);


    var navmeshParameters = {
        cs: 0.2,  // 歩行可能なナビメッシュのボクセルサイズ（幅、深さ
        ch: 0.2,  // ボクセルの高さ
        walkableSlopeAngle: 90,  // 歩行可能な最大傾斜の角度[度]
        walkableHeight: 3.0,  //  歩行が許可されるボクセル単位の高さ
        walkableClimb: 3, // 1,  // 登ることができるボクセル単位のデルタ
        walkableRadius: 3, // 1,  // エージェントのボクセル単位での半径
        maxEdgeLen: 12.,  // メッシュの境界に沿った輪郭エッジの最大許容長さ[ボクセル単位]
        maxSimplificationError: 1.3, // 境界エッジが元の生の輪郭から逸脱する最大距離[ボクセル単位]
        minRegionArea: 4, // 8,  // 孤立した島領域を形成できるセルの最小数[ボクセル単位]
        mergeRegionArea: 3, // 20,  // 領域結合の閾値。[ボクセル単位]
        maxVertsPerPoly: 6, // 輪郭線からポリゴンへの頂点の最大数(３以上)
        detailSampleDist: 6,  // 詳細メッシュ生成のサンプリング距離
        detailSampleMaxError: 1,  // 詳細メッシュ表面が高さフィールドの最大距離[ワールド単位]
        borderSize:1,
        tileSize:0, // 20 // タイルのサイズ def:0 :=障害物が機能しない
        };
    let maxAgents = 3, iniAgents = 3;
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


    let addAgent = function() {
        var width = 0.20;
        var agentCube = BABYLON.MeshBuilder.CreateBox("cube", { size: width, height: width }, scene);
        var matAgent = new BABYLON.StandardMaterial('mat2', scene);
        var variation = Math.random();
        matAgent.diffuseColor = new BABYLON.Color3(0.4 + variation * 0.6, 0.3, 1.0 - variation * 0.3);
        agentCube.material = matAgent;
        var randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(20*Math.random()-10, 0.1, 5*Math.random()), 0.5);
        var transform = new BABYLON.TransformNode();
        agentCube.parent = transform;
        if (agentCubeList.length == 0) {
            agentParams.maxAcceleration = 2; agentParams.maxSpeed = 4.2;
        } else if (agentCubeList.length == 1) {
            agentParams.maxAcceleration = 3; agentParams.maxSpeed = 3.9;
        } else {
            agentParams.maxAcceleration = 4; agentParams.maxSpeed = 3.6
        }
        var agentIndex = crowd.addAgent(randomPos, agentParams, transform);
        agentCubeList.push(agentCube);
        return agentIndex;
    }

    let resetAllAgent = function(meshes, scene) {
        if (crowd != null) { crowd.dispose(); }
        if (navmeshdebug != null) { navmeshdebug.dispose(); }
        if (navigationPlugin != null) { navigationPlugin.dispose(); }
        while (agentCubeList.length > 0) { agentCubeList.pop().dispose(); };

        navigationPlugin = new BABYLON.RecastJSPlugin();
        navigationPlugin.createNavMesh(meshes, navmeshParameters);
        if (0) {
            // デバッグ用のメッシュ
            navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
            navmeshdebug.position = new BABYLON.Vector3(0, 0.01, 0);
            navmeshdebug.material = new BABYLON.StandardMaterial('matdebug', scene);;
            navmeshdebug.material.diffuseColor = new BABYLON.Color3(0.1, 0.2, 1);
            navmeshdebug.material.alpha = 0.2;
            stageInfo.push([navmeshdebug,null]);
        }
        // crowd
        crowd = navigationPlugin.createCrowd(maxAgents, 0.1, scene);
        agentCubeList = [];
        for (let i = 0; i < iniAgents; ++i) {
            let adID = addAgent();
            resetAgent(adID);
        }
        camera2A.lockedTarget = agentCubeList[0];
        camera2B.lockedTarget = agentCubeList[2];
    }

    let resetAgent = function(agID) {
        // スタート地点にテレポート
        // 初期位置：スタート地点付近にテレポート
        [iz, ix] = maze.pStart_;
        crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(pStart));
        // 目標位置：ゴール地点に
        crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pGoal));
    }

    resetAllAgent(meshes, scene);

    // ゴール順位情報
    goalRank = 0;
    goalFlag = {0:0, 1:0, 2:0, 3:0, };
    iCheckGoal = 999;

    let nextStage = function() {
        ++stageLv;
        let meshes = createStaticMesh(scene);
        resetAllAgent(meshes, scene);
        characterController._position = pStart.clone();
        characterController._position.y += h*2;
        // ゴール順位情報
        goalRank = 0;
        goalFlag = {0:0, 1:0, 2:0, 3:0, };
        // checkGoal = true;
        iCheckGoal = 999;
    }
    
    // Player/Character state
    var state = "IN_AIR";
    let bDash = 3;
    var inAirSpeed = 3.0;
    var onGroundSpeed = 4.0;
    var inAirSpeedBase = 3.0;
    var onGroundSpeedBase = 4.0;
    var jumpHeight = 4;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -18, 0);
    let keyAction = {forward:0, back:0, right:0, left:0, jump:0};
    let h = 0.3;
    let r = 0.1;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: h, radius: r}, scene);
    let characterPosition = new BABYLON.Vector3(0, 10, -8);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
    characterController._position = pStart.clone();
    characterController._position.y += h*2;
    camera.lockedTarget = displayCapsule;
    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, r);
    localAxes.xAxis.parent = displayCapsule; localAxes.yAxis.parent = displayCapsule; localAxes.zAxis.parent = displayCapsule;

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
        if (camera2type >= 1) {
            let agntMesh = agentCubeList[0].parent; // addAgent時のtransformを取り出す
            let vdir1 = camera2A.position.subtract(agntMesh.position).normalize().scale(5);
            vdir1.y = 2;
            camera2A.position = agntMesh.position.add(vdir1);
            //
            agntMesh = agentCubeList[2].parent;
            let vdir2 = camera2B.position.subtract(agntMesh.position).normalize().scale(5);
            vdir2.y = 1.2;
            camera2B.position = agntMesh.position.add(vdir2);
        }
    });
    scene.onAfterPhysicsObservable.add((_) => {
        if (scene.deltaTime == undefined) return;
        let dt = scene.deltaTime / 1000.0;
        if (dt == 0) return;
        let down = new BABYLON.Vector3(0, -1, 0);
        let support = characterController.checkSupport(dt, down);
        const rotRad = 0.04;
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

        // ゴール判定
        if (!iCheckGoal) {
            --iCheckGoal
        } else {
            if (meshGoal.intersectsMesh(displayCapsule, false) && goalFlag[0]==0) {
                goalFlag[0] = ++goalRank;
                if (goalFlag[0] == 1) {
                    console.log("you WIN!!", goalRank);
                } else {
                    console.log("you LOOSE", goalRank);
                }
                if (goalRank >= 2) {
                    nextStage();
                }
            }
            if (meshGoal.intersectsMesh(agentCubeList[0], false) && goalFlag[1]==0) {
                goalFlag[1] = ++goalRank;
                console.log("agent[0] goal", goalRank);
            }
            if (meshGoal.intersectsMesh(agentCubeList[1], false) && goalFlag[2]==0) {
                goalFlag[2] = ++goalRank;
                console.log("agent[1] goal", goalRank);
                if (goalRank >= 4) { nextStage(); }
            }
            if (meshGoal.intersectsMesh(agentCubeList[2], false) && goalFlag[3]==0) {
                goalFlag[3] = ++goalRank;
                console.log("agent[2] goal", goalRank);
                if (goalRank >= 4) { nextStage(); }
            }
        }
        // ゴールの球をゆっくり回す
        meshGoal.addRotation(Math.random()*0.01,Math.random()*0.01,0);
    });


    // Input to direction
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.shiftKey) {
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
            } else if (kbInfo.event.key == 'v') {
                    // メイン(camera)とサブ(camera2,camera2B)の複数カメラワーク
                    camera2type = (camera2type+1) % 2;
                    if (camera2type == 0) {
                        // メインのみ
                        while (scene.activeCameras.length > 0) {
                            scene.activeCameras.pop();
                        }
                        scene.activeCameras.push(camera);

                    } else if (camera2type == 1) {
                        // メイン（全画面）＋サブ（ワイプ）
                        scene.activeCameras.push(camera2A);
                        scene.activeCameras.push(camera2B);
                    }

            } else if (kbInfo.event.key === 'r') {
                characterController._position = pStart.clone();
                characterController._position.y += h*2;
            } else if (kbInfo.event.key === 'Enter') {
                nextStage();
            } else if (kbInfo.event.key === 'n') {
                nextStage();
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowUp' || kbInfo.event.key == 'ArrowDown') {
                inputDirection.z = 0;    
                keyAction.forward = 0;
                keyAction.back = 0;
                // set off DASH
                inAirSpeed = inAirSpeedBase;
                onGroundSpeed = onGroundSpeedBase;
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

    return scene;
};

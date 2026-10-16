// Babylon.js ：Crowd Navigation System で人流のテスト

const ddbase2="https://raw.githubusercontent.com/fnamuoo/webgl/main/170/";
// const ddbase2="../170/";
const iconPath52 = ddbase2+"textures/icon2w/コントロールボタン (7).png"
const iconPath53 = ddbase2+"textures/icon2w/リロードアイコン.png"
const iconPath54 = ddbase2+"textures/icon2w/コントロールボタン (5).png"

// ######################################################################
// 隊列・フリーで狭いゲートを通るサンプル
// gemini 2140
export var createScene_test_1204 = async function () {
    const scene = new BABYLON.Scene(engine);
    
    // カメラ設定（上空から見下ろす）
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 30, -10), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
    
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // --- 地形と障害物の作成 ---
    const meshesToBake = [];
    
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 30, height: 40 }, scene);
    meshesToBake.push(ground);

    const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
    wallMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);

    // 中央の仕切り壁
    const centerWall = BABYLON.MeshBuilder.CreateBox("cWall", { width: 1, height: 2, depth: 40 }, scene);
    centerWall.position.y = 1;
    centerWall.material = wallMat;
    meshesToBake.push(centerWall);

    // 左エリアの壁（幅2の隙間を作る）
    const wallL1 = BABYLON.MeshBuilder.CreateBox("wl1", { width: 6.5, height: 2, depth: 1 }, scene);
    wallL1.position.set(-11.75, 1, 0);
    const wallL2 = BABYLON.MeshBuilder.CreateBox("wl2", { width: 6.5, height: 2, depth: 1 }, scene);
    wallL2.position.set(-3.25, 1, 0);
    wallL1.material = wallMat; wallL2.material = wallMat;
    meshesToBake.push(wallL1, wallL2);

    // 右エリアの壁（幅2の隙間を作る）
    const wallR1 = BABYLON.MeshBuilder.CreateBox("wr1", { width: 6.5, height: 2, depth: 1 }, scene);
    wallR1.position.set(3.25, 1, 0);
    const wallR2 = BABYLON.MeshBuilder.CreateBox("wr2", { width: 6.5, height: 2, depth: 1 }, scene);
    wallR2.position.set(11.75, 1, 0);
    wallR1.material = wallMat; wallR2.material = wallMat;
    meshesToBake.push(wallR1, wallR2);

    // // --- Recast ナビゲーションの初期化 ---
    // await Recast(); // v9 以降での非同期初期化
    const navigationPlugin = new BABYLON.RecastJSPlugin();
    // const navigationPlugin = await ADDONS.CreateNavigationPluginAsync()
    
    const navmeshParameters = {
        cs: 0.2, ch: 0.2, walkableSlopeAngle: 90, walkableHeight: 1.0,
        walkableClimb: 1, walkableRadius: 1, maxEdgeLen: 12,
        maxSimplificationError: 1.3, minRegionArea: 8, mergeRegionArea: 20,
        maxVertsPerPoly: 6, detailSampleDist: 6, detailSampleMaxError: 1
    };
    navigationPlugin.createNavMesh(meshesToBake, navmeshParameters);
    
    // --- Crowdの初期化 ---
    const agentCount = 20; // 各グループの人数
    const crowd = navigationPlugin.createCrowd(agentCount * 2, 0.5, scene);
    const agentParams = {
        radius: 0.4, height: 1.0, maxAcceleration: 4.0, maxSpeed: 3.0,
        collisionQueryRange: 1.5, pathOptimizationRange: 0.0, separationWeight: 1.0
    };

    // マテリアル（赤：群がる、青：隊列）
    const redMat = new BABYLON.StandardMaterial("redMat", scene);
    redMat.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
    const blueMat = new BABYLON.StandardMaterial("blueMat", scene);
    blueMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 1);

    const swarmAgents = [];
    const formationAgents = [];

    // 1. 左側：自由に群がるグループ（ランダム配置、同じ単一の目的地へ殺到）
    const swarmTarget = new BABYLON.Vector3(-7.5, 0, 15);
    for (let i = 0; i < agentCount; i++) {
        const mesh = BABYLON.MeshBuilder.CreateCylinder("swarm" + i, { height: 1, diameter: 0.8 }, scene);
        mesh.material = redMat;
        // スタート位置をランダムに密集させる
        const startPos = new BABYLON.Vector3(-7.5 + (Math.random() * 4 - 2), 0, -15 + (Math.random() * 4 - 2));
        const transform = new BABYLON.TransformNode("ts" + i, scene);
        const idx = crowd.addAgent(startPos, agentParams, transform);
        
        swarmAgents.push({ mesh, targetNode: transform, index: idx });
        crowd.agentGoto(idx, navigationPlugin.getClosestPoint(swarmTarget));
    }

    // 2. 右側：隊列を組んだグループ（2列に整列、目的地も直進するように設定）
    for (let i = 0; i < agentCount; i++) {
        const mesh = BABYLON.MeshBuilder.CreateCylinder("form" + i, { height: 1, diameter: 0.8 }, scene);
        mesh.material = blueMat;
        // 2列縦隊に綺麗に配置する
        const col = (i % 2 === 0) ? 6.5 : 8.5; // X座標（幅2の扉の直線上に配置）
        const row = -10 - Math.floor(i / 2) * 1.5; // Z座標（前後に間隔をあける）
        const startPos = new BABYLON.Vector3(col, 0, row);
        const transform = new BABYLON.TransformNode("tf" + i, scene);
        const idx = crowd.addAgent(startPos, agentParams, transform);
        
        formationAgents.push({ mesh, targetNode: transform, index: idx });
        // 各自がまっすぐ前方の目的地を目指すようにする
        const targetPos = new BABYLON.Vector3(col, 0, 15);
        crowd.agentGoto(idx, navigationPlugin.getClosestPoint(targetPos));
    }

    // --- GUI タイム計測と表示 ---
    const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const infoText = new BABYLON.GUI.TextBlock();
    infoText.text = "左(赤): 自由に群がる  |  右(青): 隊列を組む\n計測中...";
    infoText.color = "white";
    infoText.fontSize = 24;
    infoText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    infoText.top = "20px";
    infoText.outlineWidth = 4;
    infoText.outlineColor = "black";
    adt.addControl(infoText);

    let startTime = performance.now();
    let swarmDoneTime = 0;
    let formationDoneTime = 0;

    // 毎フレームのエージェントメッシュ同期とゴール判定
    scene.onBeforeRenderObservable.add(() => {
        let swarmFinished = true;
        let formationFinished = true;

        swarmAgents.forEach(agent => {
            agent.mesh.position = agent.targetNode.position;
            if (agent.mesh.position.z < 10) swarmFinished = false; // Z=10を超えたらゴール
        });

        formationAgents.forEach(agent => {
            agent.mesh.position = agent.targetNode.position;
            if (agent.mesh.position.z < 10) formationFinished = false;
        });

        const currentTime = ((performance.now() - startTime) / 1000).toFixed(2);

        if (swarmFinished && swarmDoneTime === 0) swarmDoneTime = currentTime;
        if (formationFinished && formationDoneTime === 0) formationDoneTime = currentTime;

        let statusText = "左(赤) 群がり: " + (swarmDoneTime > 0 ? swarmDoneTime + "秒" : currentTime + "秒");
        statusText += "\n右(青) 隊列: " + (formationDoneTime > 0 ? formationDoneTime + "秒" : currentTime + "秒");
        infoText.text = statusText;
    });

    return scene;
}

// ######################################################################
// 人流を作成するテスト（左右）
// chatGPT 2551
export var createScene_test_1206 = async function () {
    const scene = new BABYLON.Scene(engine);

    // ============================================================
    // Camera
    // ============================================================

    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        0.95,
        35,
        new BABYLON.Vector3(0, 0, 0),
        scene
    );

    camera.attachControl(canvas, true);

    // ============================================================
    // Light
    // ============================================================

    new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );

    // ============================================================
    // Material helper
    // ============================================================

    function createMaterial(name, color, alpha = 1) {

        const mat =
            new BABYLON.StandardMaterial(name, scene);

        mat.diffuseColor = color;
        mat.alpha = alpha;

        return mat;
    }

    const groundMat =
        createMaterial(
            "groundMat",
            new BABYLON.Color3(0.18, 0.18, 0.18)
        );

    const wallMat =
        createMaterial(
            "wallMat",
            new BABYLON.Color3(0.45, 0.45, 0.45)
        );

    const blueMat =
        createMaterial(
            "blueMat",
            new BABYLON.Color3(0.1, 0.4, 1.0)
        );

    const redMat =
        createMaterial(
            "redMat",
            new BABYLON.Color3(1.0, 0.15, 0.15)
        );

    // ============================================================
    // Ground
    // ============================================================

    const ground =
        BABYLON.MeshBuilder.CreateGround(
            "ground",
            {
                width: 30,
                height: 14
            },
            scene
        );

    ground.material = groundMat;

    // ============================================================
    // Corridor walls
    //
    //  z = +5
    //  ---------------------------------
    //
    //      人流
    //
    //  ---------------------------------
    //  z = -5
    // ============================================================

    const wallTop =
        BABYLON.MeshBuilder.CreateBox(
            "wallTop",
            {
                width: 30,
                height: 2,
                depth: 0.5
            },
            scene
        );

    wallTop.position =
        new BABYLON.Vector3(
            0,
            1,
            5
        );

    wallTop.material = wallMat;

    const wallBottom =
        BABYLON.MeshBuilder.CreateBox(
            "wallBottom",
            {
                width: 30,
                height: 2,
                depth: 0.5
            },
            scene
        );

    wallBottom.position =
        new BABYLON.Vector3(
            0,
            1,
            -5
        );

    wallBottom.material = wallMat;

    // ============================================================
    // Navigation
    // ============================================================

    // const recast = await Recast();
    const navigationPlugin =
        new BABYLON.RecastJSPlugin();
    // const navigationPlugin = await ADDONS.CreateNavigationPluginAsync()

    navigationPlugin.createNavMesh(
        [
            ground,
            wallTop,
            wallBottom
        ],
        {
            cs: 0.2,
            ch: 0.2,

            walkableSlopeAngle: 45,
            walkableHeight: 1.0,
            walkableClimb: 0.5,
            walkableRadius: 0.3,

            maxEdgeLen: 12,
            maxSimplificationError: 1.3,

            minRegionArea: 2,
            mergeRegionArea: 4,

            maxVertsPerPoly: 6,

            detailSampleDist: 6,
            detailSampleMaxError: 1
        }
    );

    // ============================================================
    // Debug NavMesh
    // ============================================================

    const navMesh =
        navigationPlugin.createDebugNavMesh(scene);

    navMesh.position.y = 0.02;

    const navMeshMat =
        createMaterial(
            "navMeshMat",
            new BABYLON.Color3(
                0.1,
                0.7,
                1.0
            ),
            0.15
        );

    navMesh.material = navMeshMat;

    // ============================================================
    // Crowd
    // ============================================================

    const crowd =
        navigationPlugin.createCrowd(
            250,
            0.35,
            scene
        );

    // ============================================================
    // Agent parameters
    //
    // この値を変更すると人流の見え方が変わる。
    // ============================================================

    const agentParams = {

        radius: 0.30,
        height: 1.7,

        maxAcceleration: 6.0,
        maxSpeed: 1.8,

        collisionQueryRange: 1.0,
        pathOptimizationRange: 0.5,

        // エージェント同士が近づきすぎないようにする
        separationWeight: 3.0
    };

    // ============================================================
    // Game agent
    // ============================================================

    const agents = [];

    // ============================================================
    // Create agent mesh
    // ============================================================

    function createAgentMesh(
        name,
        material
    ) {

        const mesh =
            BABYLON.MeshBuilder.CreateCapsule(
                name,
                {
                    height: 1.5,
                    radius: 0.25
                },
                scene
            );

        mesh.material = material;

        return mesh;
    }

    // ============================================================
    // Add agent
    // ============================================================

    function addAgent(
        position,
        direction,
        material,
        type
    ) {

        const transform =
            new BABYLON.TransformNode(
                "agentTransform",
                scene
            );

        const index =
            crowd.addAgent(
                position,
                agentParams,
                transform
            );

        const mesh =
            createAgentMesh(
                "agentMesh_" + index,
                material
            );

        mesh.position =
            position.clone();

        const agent = {

            idx: index,

            mesh: mesh,

            direction: direction.clone(),

            type: type,

            finished: false,

            targetX:
                direction.x > 0
                    ? 14
                    : -14
        };

        agents.push(agent);

        // --------------------------------------------------------
        // 初期目的地
        // --------------------------------------------------------

        const target =
            navigationPlugin.getClosestPoint(
                new BABYLON.Vector3(
                    agent.targetX,
                    0.9,
                    position.z
                )
            );

        crowd.agentGoto(
            index,
            target
        );

        return agent;
    }

    // ============================================================
    // Generate a stream
    // ============================================================

    function createStream(
        type,
        count,
        startX,
        direction,
        material
    ) {

        for (let i = 0; i < count; i++) {

            // ----------------------------------------
            // 横方向はランダム
            // ----------------------------------------

            const z =
                -4.0 +
                Math.random() * 8.0;

            // ----------------------------------------
            // x方向にもばらつきを持たせる
            // ----------------------------------------

            const x =
                startX +
                Math.random() * 3.0;

            const position =
                new BABYLON.Vector3(
                    x,
                    0.9,
                    z
                );

            addAgent(
                position,
                direction,
                material,
                type
            );
        }
    }

    // ============================================================
    // Right-moving stream
    // ============================================================

    createStream(
        "right",
        60,

        -13,

        new BABYLON.Vector3(
            1,
            0,
            0
        ),

        blueMat
    );

    // ============================================================
    // Left-moving stream
    // ============================================================

    createStream(
        "left",
        60,

        10,

        new BABYLON.Vector3(
            -1,
            0,
            0
        ),

        redMat
    );

    // ============================================================
    // Respawn
    // ============================================================

    function respawn(agent) {

        const direction =
            agent.direction;

        let x;

        if (direction.x > 0) {

            x = -14;

        } else {

            x = 14;
        }

        const z =
            -4 +
            Math.random() * 8;

        const position =
            new BABYLON.Vector3(
                x,
                0.9,
                z
            );

        // ========================================================
        // remove / recreate
        //
        // Crowd Agentの位置を直接設定するのではなく、
        // 新しいAgentとして作り直す。
        // ========================================================

        crowd.removeAgent(
            agent.idx
        );

        agent.mesh.dispose();

        const newAgent =
            addAgent(
                position,
                direction,
                direction.x > 0
                    ? blueMat
                    : redMat,
                agent.type
            );

        // 古い要素を配列から置換
        const index =
            agents.indexOf(agent);

        agents[index] =
            newAgent;
    }

    // ============================================================
    // Update
    // ============================================================

    scene.onBeforeRenderObservable.add(() => {
        for (let i = 0; i < agents.length; i++) {
            const agent = agents[i];
            const position =
                crowd.getAgentPosition(
                    agent.idx
                );
            agent.mesh.position =
                position;

            // ====================================================
            // Agent velocity
            // ====================================================
            // 速度ベクトルに合わせて、向きを変える
            const velocity = crowd.getAgentVelocity(agent.idx);
            if (velocity.lengthSquared() > 0.001 ) {
                const angle = Math.atan2(velocity.x, velocity.z );
                agent.mesh.rotation.y = angle;
            }

            // ====================================================
            // 端まで到達したら反対側から再出現
            // ====================================================
            // 端まで歩いたら、もう片方からリスポーンさせる
            if (agent.direction.x > 0 && position.x > 14) {
                respawn(agent);
            } else if (agent.direction.x < 0 && position.x < -14) {
                respawn(agent);
            }
        }
    });

    // ============================================================
    // UI
    // ============================================================

    const ui =
        BABYLON.GUI.AdvancedDynamicTexture
            .CreateFullscreenUI("UI");

    const text =
        new BABYLON.GUI.TextBlock();

    text.text =
        "Crowd flow\n\n" +
        "BLUE : →\n" +
        "RED  : ←\n\n" +
        "同方向の流れと逆方向の流れが\n" +
        "どのように分離するか観察してください。\n\n" +
        "separationWeight = " + agentParams.separationWeight;

    text.color = "white";
    text.fontSize = 18;

    text.textHorizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

    text.textVerticalAlignment =
        BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    text.left = "20px";
    text.top = "20px";

    ui.addControl(text);

    return scene;
}

// ######################################################################
export var createScene_test_1304 = async function () {
    // const ddbase2="https://raw.githubusercontent.com/fnamuoo/webgl/main/170/";
    //     const iconPath52 = ddbase2+"textures/icon2w/コントロールボタン (7).png"
    //     const iconPath53 = ddbase2+"textures/icon2w/リロードアイコン.png"
    //     const iconPath54 = ddbase2+"textures/icon2w/コントロールボタン (5).png"

    const scene = new BABYLON.Scene(engine)
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
    light.intensity = 0.7
    let camera = new BABYLON.ArcRotateCamera("", 1.5*Math.PI, 0.2*Math.PI, 15, new BABYLON.Vector3(0, 5, -10));
    camera.wheelDeltaPercentage = 0.01;
    camera.attachControl(canvas, true)
    camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // キーボード入力だけをピンポイントで削除

    const navigationPlugin = await ADDONS.CreateNavigationPluginAsync()
    let navMesh = null, navMeshQuery = null;
    let crowd = null;
    let crowd_agntPara = {};
    let moveCrowdAgents = null;
    let agents = null;

    let iwave = 0, nwave = 2;


    let meshList = [], sedlist, agentParam;

    let createStage2 = async function(istage) {
        if (renderobj2 != null) {
            scene.onBeforeRenderObservable.remove(renderobj2); renderobj2 = null;
        }
        if (crowd != null) {
            crowd.dispose();
            crowd = null;
        }
        if (navMesh != null) {
            navMesh = null;
        }
        [meshList, sedlist, agentParam] = createStage(istage);

        const maxAgentRadius = 0.15
        let AGENT_COUNT = 10
        const cellSize = 0.05

        if (agentParam.nagent) {
            AGENT_COUNT = agentParam.nagent;
        }

        // let [ps,pe,bdir]= sedlist[0];
        // Interface INavMeshParametersV2
        // https://doc.babylonjs.com/typedoc/interfaces/ADDONS.INavMeshParametersV2
        let navmeshParameters = {
            cs: cellSize,
            ch: 0.2,
            walkableRadius: Math.ceil(maxAgentRadius / cellSize),
            maxObstacles: 0, // we don't need obstacles so set this to zero manually!!
            keepIntermediates: true, // debug表示flag
            //        keepIntermediates: false, // debug表示flag
        }
        if (sedlist.length > 0) {
            // jump 経路の設定
            let offMeshConnections = []
            for (let [ps,pe,bdir] of sedlist) {
                let bflag = (bdir) ? true : false;
                let param = {radius: 0.3,
                             area: 0,
                             flags: 1,
                             startPosition: { x:ps[0], y:ps[1], z:ps[2], },
                             endPosition: { x:pe[0], y:pe[1], z:pe[2],},
                             bidirectional: bflag,
                            };
                offMeshConnections.push(param);
            }
            navmeshParameters.offMeshConnections = offMeshConnections;
        }

        // let { navMesh, navMeshQuery } = await navigationPlugin.createNavMeshAsync(meshList, navmeshParameters)
        let tmp = await navigationPlugin.createNavMeshAsync(meshList, navmeshParameters);
        navMesh = tmp.navMesh;
        navMeshQuery = tmp.navMeshQuery;

        // ICrowd: crowd
        // https://doc.babylonjs.com/typedoc/interfaces/BABYLON.ICrowd
        crowd = navigationPlugin.createCrowd(AGENT_COUNT, maxAgentRadius, scene)
console.log("crowd=", crowd);

        // [moveCrowdAgents, agents] = createCrowdAgents(AGENT_COUNT, agentParam);
        [moveCrowdAgents, agents] = createCrowdAgents(crowd, AGENT_COUNT, agentParam);

//        renderobj1 = scene.onBeforeRenderObservable.add(renderfun1);
        renderobj2 = scene.onBeforeRenderObservable.add(renderfun2);

        let stext = "Stage " + istage + " : " + (iwave+1) + "/" + nwave + " wave"
        setText2(stext);
        bgoal = false;
    }


    // 移動経路の計算・表示
    function computeAndDrawPathLine(pickedPoint, agents) {
        let start, end;
        start = crowd.getAgentPosition(agents[0]);
        end = navigationPlugin.getClosestPoint(pickedPoint);
        const pathPoints = navigationPlugin.computePath(start, end)
        // drawLine(pathPoints)
    }

    // 群衆（エージェント）の作成
    function createCrowdAgents(crowd_, AGENT_COUNT, agentParam) {
        // // ICrowd: crowd
        // // https://doc.babylonjs.com/typedoc/interfaces/BABYLON.ICrowd
        // const crowd = navigationPlugin.createCrowd(AGENT_COUNT, maxAgentRadius, scene)
        crowd_agntPara = {};
        // 全エージェントの設定
        for (let i = 0; i < AGENT_COUNT; i++) {
            const agentParams = {
                radius: 0.12,
                height: 0.5,
                maxAcceleration: 4.0,
                maxSpeed: 1.0,
                separationWeight: 1.0,
            }
            if (i == 0) {
                // プレイヤー
                if (agentParam.p_you) {
                    let p = agentParam.p_you;
                    const { randomPoint: position } = navMeshQuery.findRandomPointAroundCircle({ x:p.x, y:p.y, z:p.z }, 2)
                    let { agentIndex, agentMesh, agentTransform } = createAgent(agentParams, position, crowd_, scene)
                    camera.lockedTarget = agentMesh;
                }
                if (agentParam.p_you_sted) {
                    let ps = agentParam.p_you_sted[0];
                    let pe = agentParam.p_you_sted[1];
                    // const { randomPoint: position } = navMeshQuery.findRandomPointAroundCircle({ x:p.x, y:p.y, z:p.z }, 2)
                    // let pv = new BABYLON.Vector3(p.x, p.y, p.z);
                    let position = navigationPlugin.getClosestPoint(ps)
                    // let { agentIndex, agentMesh, agentTransform } = createAgent(agentParams, position, crowd, scene)
                    let { agentIndex, agentMesh, agentTransform } = createAgent(agentParams, position, crowd_, scene)
                    // crowd._agntPara[agentIndex] = {ps:ps, pe:pe};
                    crowd_agntPara[agentIndex] = {ps:ps, pe:pe};
                    camera.lockedTarget = agentMesh;
                }
            } else {
                // NPC/敵
                if (agentParam.p_com) {
                    let p = agentParam.p_com[i % agentParam.p_com.length];
                    agentParams.maxAcceleration *= (0.3*Math.random()+0.7);
                    agentParams.maxSpeed *= (0.3*Math.random()+0.7);
                    // agentParams.maxAcceleration *= Math.random();
                    // agentParams.maxSpeed *= Math.random();
                    const { randomPoint: position } = navMeshQuery.findRandomPointAroundCircle({ x:p.x, y:p.y, z:p.z }, 2)
                    // createAgent(agentParams, position, crowd, scene)
                    createAgent(agentParams, position, crowd_, scene)
                }
                if (agentParam.p_com_sted) {
                    let n = agentParam.p_com_sted.length
                    let ps = agentParam.p_com_sted[i*2 % n];
                    let pe = agentParam.p_com_sted[(i*2 % n)+1];
                    agentParams.maxAcceleration *= (0.3*Math.random()+0.7);
                    agentParams.maxSpeed *= (0.3*Math.random()+0.7);
                    let position = navigationPlugin.getRandomPointAround(ps, 1);
                    // let { agentIndex, agentMesh, agentTransform } = createAgent(agentParams, position, crowd, scene)
                    let { agentIndex, agentMesh, agentTransform } = createAgent(agentParams, position, crowd_, scene)
                    // crowd._agntPara[agentIndex] = {ps:ps, pe:pe};
                    crowd_agntPara[agentIndex] = {ps:ps, pe:pe};
                    // crowd.agentGoto(agentIndex, pe)
                    crowd_.agentGoto(agentIndex, pe)
                }
            }
        }
        // エージェントの作成
        // const agents = crowd.getAgents()
        const agents = crowd_.getAgents()
        // 全エージェントの移動関数
        function moveCrowdAgents(pickedPoint) {
            if (agents.length > 0) {
                let p = navigationPlugin.getClosestPoint(pickedPoint)
                crowd.agentGoto(agents[0], p)
            }
        }

        return [ moveCrowdAgents, agents ]
    }

    // マウスクリックのイベントリスナー
    function hookPointer(callbackLeftClick, callbackRightClick) {
        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    if (pointerInfo.pickInfo.hit) {
                        if (pointerInfo.event.button === 0 && callbackLeftClick) {
                            callbackLeftClick(pointerInfo.pickInfo.pickedPoint)
                        }
                        if (pointerInfo.event.button === 2 && callbackRightClick) {
                            callbackRightClick(pointerInfo.pickInfo.pickedPoint)
                        }
                    }
                    break
            }
        })
    }

    // // 経路の表示
    // let lineMesh
    // function drawLine(points) {
    //     lineMesh?.dispose()
    //     lineMesh = BABYLON.CreateGreasedLine("nav-line",
    //                                          { points },
    //                                          { sizeAttenuation: true, width: 10, color: BABYLON.Color3.Blue() })
    // }

    // エージェント（一人分）の作成
    // function createAgent(agentParams, position, crowd) {
    function createAgent(agentParams, position, crowd_) {
        const agentTransform = new BABYLON.TransformNode()
        // const agentIndex = crowd.addAgent(position, agentParams, agentTransform)
        const agentIndex = crowd_.addAgent(position, agentParams, agentTransform)
        agentTransform.name = `agent-transform-${agentIndex}`
        const agentMesh = createAgentMesh(agentParams, agentIndex)
        agentMesh.parent = agentTransform;
        meshList.push(agentTransform);
        return { agentIndex, agentMesh, agentTransform }
    }

    // エージェントメッシュの作成
    function createAgentMesh(agentParams, agentIndex) {
        const meshName = `agent-${agentIndex}`
        let agentMesh = scene.getMeshByName(meshName)
        if (!agentMesh) {
            agentMesh = BABYLON.MeshBuilder.CreateCylinder(meshName, { height: agentParams.height, diameter: agentParams.radius * 2 }, scene)
            agentMesh.position.y += agentParams.height / 2
            agentMesh.bakeCurrentTransformIntoVertices()
        }
        const matName = `agent-${agentIndex}`
        const matAgent = scene.getMaterialByName(matName) ?? new BABYLON.StandardMaterial(matName, scene)
        if (agentIndex == 0) {
            matAgent.diffuseColor = BABYLON.Color3.Red();
        }
        agentMesh.material = matAgent
        return agentMesh
    }


    // 地形・経路メッシュ作成
    function createStage(istage) {
        while (meshList.length > 0) {
            let mesh = meshList.pop();
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            mesh.dispose();
        }
        iwave = 0, nwave = 2;

        // 地面(grid)のパネル表示
        meshList = [];
        // jump 経路 / offMeshConnections の startPosition, endPosition
        let sedlist = [];
        let data = [], plist = [];
        let adjx2=0, adjy2=0.1, adjz2=0;
        let agentParam = {
            p_you: new BABYLON.Vector3(0, 0, 0),
            p_com: [new BABYLON.Vector3(0, 0, 0)],
        };

        if (istage == 10) {
            data = [
                "    ####    ",
                "    ####    ",
                "############",
                "############",
                "############",
                "############",
                "    ####    ",
                "    ####    ",
            ];
            plist = [];
            adjx2=-6,adjy2=0.1,adjz2=8 + 0.5;
            agentParam = {
                p_you_sted: [new BABYLON.Vector3(6+adjx2, 0, -7+adjz2), new BABYLON.Vector3(6+adjx2, 0, -1+adjz2)],
                p_com_sted: [new BABYLON.Vector3(1+adjx2, 0, -4+adjz2), new BABYLON.Vector3(11+adjx2, 0, -4+adjz2),
                             ],
                nagent: 100,
            };


        } else if (istage == 11) {
            //      G
            // - - - - - - - -
            // >>>>>>>>>>>>>>>>
            // - - - - - - - -
            //      S
            data = [
                "      ####      ",
                "####  ####  ####",
                "################",
                "################",
                "################",
                "################",
                "################",
                "################",
                "################",
                "####  ####  ####",
                "      ####      ",
            ];
            plist = [];
            adjx2=-6,adjy2=0.1,adjz2=8 + 0.5;
            agentParam = {
                p_you_sted: [new BABYLON.Vector3(6+adjx2, 0, -9+adjz2), new BABYLON.Vector3(6+adjx2, 0, +1+adjz2)],
                p_com_sted: [new BABYLON.Vector3(-1+adjx2, 0, -2+adjz2), new BABYLON.Vector3(11+adjx2, 0, -2+adjz2),
                             new BABYLON.Vector3(-0+adjx2, 0, -4+adjz2), new BABYLON.Vector3(12+adjx2, 0, -4+adjz2),
                             new BABYLON.Vector3(+1+adjx2, 0, -6+adjz2), new BABYLON.Vector3(13+adjx2, 0, -6+adjz2),
                            ],
                nagent: 100,
            };

        } else if (istage == 12) {
            // cross-road
            //      G
            // - - - - - - - -
            // >>>>>>>>>>>>>>>>
            // - - - - - - - -
            // <<<<<<<<<<<<<<<<
            // - - - - - - - -
            //      S
            data = [
                "      ####      ",
                "####  ####  ####",
                "################",
                "################",
                "################",
                "################",
                "################",
                "################",
                "####  ####  ####",
                "      ####      ",
            ];
            plist = [];
            adjx2=-6,adjy2=0.1,adjz2=8 + 0.5;
            agentParam = {
                p_you_sted: [new BABYLON.Vector3(6+adjx2, 0, -8+adjz2), new BABYLON.Vector3(6+adjx2, 0, +0+adjz2)],
                p_com_sted: [new BABYLON.Vector3(-0+adjx2, 0, -2+adjz2), new BABYLON.Vector3(12+adjx2, 0, -2+adjz2),
                             new BABYLON.Vector3(12+adjx2, 0, -6+adjz2), new BABYLON.Vector3(-0+adjx2, 0, -6+adjz2), 
                            ],
                nagent: 100,
            };

        } else if (istage == 13) {
            // omiya-mairi
            //     CP1
            // - - - - - - - -
            //   |>>>>>|
            //   |AA VV|
            //   |AA VV|
            //   |AA VV|
            //  >>>> >>>>>
            // - - - - - - - -
            //    S  G
            data = [
                "       ##       ",
                "       ##       ",
                "  ############  ",
                "################",
                "################",
                "     ##  ##     ",
                "     ##  ##     ",
                "     ##  ##     ",
                "     ##  ##     ",
                "################",
                "################",
                "####  ####  ####",
                "      ####      ",
            ];
            plist = [];
            adjx2=-6,adjy2=0.1,adjz2=8 + 0.5;
            agentParam = {
                p_you_sted: [new BABYLON.Vector3(6+adjx2, 0, -10+adjz2), new BABYLON.Vector3(6+adjx2, 0, +2+adjz2)],
                // p_com_sted: [new BABYLON.Vector3(-0+adjx2, 0, -2+adjz2), new BABYLON.Vector3(12+adjx2, 0, -2+adjz2),
                //              new BABYLON.Vector3(-0+adjx2, 0, -6+adjz2), new BABYLON.Vector3(12+adjx2, 0, -6+adjz2), 
                //             ],
                p_com_sted: [new BABYLON.Vector3(-0+adjx2, 0, -9+adjz2), new BABYLON.Vector3(9+adjx2, 0, +0+adjz2), 
                             new BABYLON.Vector3(+3+adjx2, 0, -0+adjz2), new BABYLON.Vector3(13+adjx2, 0, -8+adjz2), 
                            ],
                nagent: 100,
            };


        } else if (istage == 14) {
            // koi-no-takinobori
            //      G
            // - - - - - - - -
            //  >>>> <<<<
            //   |VV VV|
            //   |VV VV|
            //   |VV VV|
            //  <<<< >>>>
            // - - - - - - - -
            //     S 
            data = [
                "       ##       ",
                "       ##       ",
                "  ############  ",
                "################",
                "################",
                "     ##  ##     ",
                "     ##  ##     ",
                "     ##  ##     ",
                "     ##  ##     ",
                "################",
                "################",
                "####  ####  ####",
                "      ####      ",
            ];
            plist = [];
            adjx2=-6,adjy2=0.1,adjz2=8 + 0.5;
            agentParam = {
                p_you_sted: [new BABYLON.Vector3(6+adjx2, 0, -10+adjz2), new BABYLON.Vector3(6+adjx2, 0, +2+adjz2)],
                p_com_sted: [new BABYLON.Vector3(+3+adjx2, 0, -0+adjz2), new BABYLON.Vector3(-0+adjx2, 0, -8+adjz2), 
                             new BABYLON.Vector3(9+adjx2, 0, +0+adjz2), new BABYLON.Vector3(12+adjx2, 0, -8+adjz2), 
                            ],
                nagent: 100,
            };


        } else if (istage == 15) {
            // koi-no-takinobori
            //      G
            // - - - - - - - -
            //  >>>> <<<<
            //   |VV VV|
            //   |VV VV|
            //   |VV VV|
            //  <<<< >>>>
            // - - - - - - - -
            //     S 
            data = [
                "       ##       ",
                "       ##       ",
                "  ############  ",
                "################",
                "################",
                "     ######     ",
                "     ######     ",
                "     ######     ",
                "     ######     ",
                "################",
                "################",
                "################",
                "      ####      ",
            ];
            plist = [];
            adjx2=-6,adjy2=0.1,adjz2=8 + 0.5;
            agentParam = {
                p_you_sted: [new BABYLON.Vector3(6+adjx2, 0, -10+adjz2), new BABYLON.Vector3(6+adjx2, 0, +2+adjz2)],
                p_com_sted: [new BABYLON.Vector3(+4+adjx2, 0, -0+adjz2), new BABYLON.Vector3(+4+adjx2, 0, -8+adjz2), 
                             new BABYLON.Vector3(+4+adjx2, 0, -0+adjz2), new BABYLON.Vector3(8+adjx2, 0, -8+adjz2), 
                             new BABYLON.Vector3(8+adjx2, 0, +0+adjz2), new BABYLON.Vector3(8+adjx2, 0, -8+adjz2), 
                             new BABYLON.Vector3(8+adjx2, 0, +0+adjz2), new BABYLON.Vector3(+4+adjx2, 0, -8+adjz2), 
                            ],
                nagent: 100,
            };

        }

        let nz = data.length, nx = data[0].length;
        let adjx=-nx/2+0.5,adjz=nz/2+4, sx=1.0, sz=1.0,adjy=0, bsx=0.99, bsz=0.99;
        // grid上のパネル
        for (let iz = 0; iz < nz; ++iz) {
            for (let ix = 0; ix < nx; ++ix) {
                if (data[iz][ix] != "#") { continue; } // 地面(#)以外 skip
                let px = ix*sx+adjx, pz = -iz*sz+adjz, py = adjy;
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:bsx, height:0.1, depth:bsz}, scene);
                mesh.position.set(px,py,pz);
                mesh.material = new BABYLON.StandardMaterial("", scene);
                meshList.push(mesh);
            }
        }
        {
            // jump経路の座標＋確認用の表示
            for (let [p1,p2,bdir] of plist) {
                let ps = [p1[0]*sx+adjx2, p1[1]+adjy2, -p1[2]*sz+adjz2];
                let pe = [p2[0]*sx+adjx2, p2[1]+adjy2, -p2[2]*sz+adjz2];
                if (1) {
                    let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.2});
                    mesh.position.set(ps[0], ps[1], ps[2]);
                    meshList.push(mesh);
                    let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.2});
                    mesh2.position.set(pe[0], pe[1], pe[2]);
                    meshList.push(mesh2);
                }
                sedlist.push([ps,pe,bdir]);
            }
        }

        if (agentParam.p_you_sted) {
            let n = agentParam.p_you_sted.length;
            {
                let ps = agentParam.p_you_sted[0];
                let pe = agentParam.p_you_sted[n-1];
                let mesh = BABYLON.MeshBuilder.CreateBox("", {size:0.25});
                mesh.position.copyFrom(ps);
                mesh.material = new BABYLON.StandardMaterial("", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Red();
                meshList.push(mesh);
                let mesh2 = BABYLON.MeshBuilder.CreateBox("", {size:0.25});
                mesh2.position.copyFrom(pe);
                mesh2.material = new BABYLON.StandardMaterial("", scene);
                mesh2.material.diffuseColor = BABYLON.Color3.Blue();
                meshList.push(mesh2);
            }
        }
        if (agentParam.p_com_sted) {
            let n = agentParam.p_com_sted.length;
            for (let i = 0; i < n; i+=2) {
                let ps = agentParam.p_com_sted[i];
                let pe = agentParam.p_com_sted[i+1];
                let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.5});
                mesh.position.copyFrom(ps);
                mesh.material = new BABYLON.StandardMaterial("", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Red();
                meshList.push(mesh);
                let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.5});
                mesh2.position.copyFrom(pe);
                mesh2.material = new BABYLON.StandardMaterial("", scene);
                mesh2.material.diffuseColor = BABYLON.Color3.Blue();
                meshList.push(mesh2);
            }
        }

        return [meshList, sedlist, agentParam];
    }

    let backStage = async function() {
        let i = stageList.indexOf(istage);
        i = (i+stageList.length-1) % stageList.length;
        istage = stageList[i];
        await createStage2(istage);
    }
    let nextStage = async function() {
        let i = stageList.indexOf(istage);
        i = (i+1) % stageList.length;
        istage = stageList[i];
        await createStage2(istage);
    }
    // 3秒後にステージ変更を呼び出す
    let setNextStage = function(aftersec=3) {
        setTimeout(nextStage, aftersec*1000);
    }


    // ------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    {
        // const iconPath52 = "textures/icon2w/31.symbol/コントロールボタン (7).png"
        // const iconPath53 = "textures/icon2w/31.symbol/リロードアイコン.png"
        // const iconPath54 = "textures/icon2w/31.symbol/コントロールボタン (5).png"
        let fpathList = [iconPath52, iconPath53, iconPath54 ];
        let guiIconList = [];
        for (let i = 0; i < fpathList.length; ++i) {
            let fpath = fpathList[i];
            let guiIcon = new BABYLON.GUI.Image("", fpath);
            guiIcon.width = "60px";
            guiIcon.height = "60px";
            guiIcon.top = "10px";
            guiIcon.left = "-" + ((fpathList.length-i-1)*70+10)+ "px";
            guiIcon.autoScale = false
            guiIcon.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            guiIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            guiIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            advancedTexture.addControl(guiIcon);   
            guiIconList.push(guiIcon);
        }
        {
            guiIconList[0].onPointerUpObservable.add(function() {
                console.log("back stage:");
                backStage();
            });
        }
        {
            guiIconList[1].onPointerUpObservable.add(function() {
                console.log("reload:");
                createStage2(istage);
            });
        }
        {
            guiIconList[2].onPointerUpObservable.add(function() {
                console.log("next stage:");
                nextStage();
            });
        }
    }

    // ------------------------------
    // メッセージ（数秒後にフェードアウト）
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Ready!";
    text2.color = "white";
    text2.fontSize = 24;
    text2.height = "36px";
    // text2.top = "100px";
    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text2);
    let clearText2 = function() {
        text2.text = "";
    }
    let setText2 = function(val, delay=2) {
        text2.text = "" + val;
        setTimeout(clearText2, delay*1000);
    }

    setText2("");

    // ----------------------------------------------------------------------
    let bgoal = false;
    let renderobj2 = null;
    let renderfun2 = function() {
        if (agents == null || agents.length <= 0) {return;}
        for (let i = 0; i < agents.length; ++i) {
            if (crowd == null) {return;}
            let pc = crowd.getAgentPosition(i);
            let ps = crowd_agntPara[i].ps;
            let pe = crowd_agntPara[i].pe;
            if (i == 0) {
                if (bgoal == false) {
                    if (BABYLON.Vector3.DistanceSquared(pc, pe) < 0.1) {
                        bgoal = true;
                        ++iwave;
                        console.log("reach GOAL!!  " + (iwave) + "/" + nwave + " wave" );
                        if (iwave < nwave) {
                            crowd.agentTeleport(i, ps);
                            let stext = "Stage " + istage + " : " + (iwave+1) + "/" + nwave + " wave"
                            setText2(stext);
                            bgoal = false;
                            return;
                        } else {
                            let stext = "Stage " + istage + "  CLEAR!!"
                            setText2(stext);
                            setNextStage();
                        }
                    }
                }
            } else {
                if (BABYLON.Vector3.DistanceSquared(pc, pe) < 1) {
                    let ps2 = navigationPlugin.getRandomPointAround(ps, 1);
                    crowd.agentTeleport(i, ps2);
                    crowd.agentGoto(i, pe)
                }
            }
        }
    }

    // マウスクリック時の動作
    hookPointer((pickedPoint) => {
        if (moveCrowdAgents == null || agents == null) {return;}
        // 目的地の設定
        moveCrowdAgents(pickedPoint)
        // 移動経路の計算・表示
        computeAndDrawPathLine(pickedPoint, agents)
    })

    // ----------------------------------------

    let istage = 10;
    let stageList = [10, 11, 12, 13, 14, 15];
    await createStage2(istage);

    return scene
}

// ######################################################################


// 隊列・フリーで狭いゲートを通るサンプル
// export var createScene = createScene_test_1204; // example gemini

// // 人流を作成するテスト（左右）
// export var createScene = createScene_test_1206; // example chatGPT

export var createScene = createScene_test_1304;


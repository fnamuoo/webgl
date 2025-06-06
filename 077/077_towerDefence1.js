// Crowd Navigation System(CNS)を使ったゲーム例：タワーディフェンス？

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

    var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(2, 5,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, 100), scene);
    light.intensity = 0.2;
    var light2 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, -100), scene);
    light2.intensity = 0.2;
    var light3 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, 100), scene);
    light3.intensity = 0.2;
    var light4 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, -100), scene);
    light4.intensity = 0.2;

    let maze = null;
    const wL=1.5, wL_=wL/2, wS=0.1, wS_=wS/2, wH=0.8, wH_=wH/2;
    let mapR = 7, mapC = 9;
    let adjx, adjz, nx, nz, adjx2, adjz2, nz2;

    let stageLv=1, myHP=10;

    let stageInfo = []
    function createStaticMesh(scene, debugStage=0) {
        while (stageInfo.length > 0) {
            let mesh = stageInfo.pop();
            mesh.dispose();
        }

        let meshes = [];
        mapR = 7 + Math.floor(Math.log(stageLv+1));
        mapC = 9 + Math.floor(Math.log(stageLv+1));
        maze = new Maze.Maze1(mapR, mapC);
        maze.create(21);
        maze.resetStartGoal();
        maze.dbgPrintMap();

        if (debugStage == 1) {
            let mazedata = [
                '#########',
                '#S  #   #',
                '# # # # #',
                '#       #',
                '### ### #',
                '#      G#',
                '#########',
            ];
            maze = new Maze.Maze1();
            maze.create_from(mazedata);
            maze.dbgPrintMap();

        } else if (debugStage == 2) {
            let mazedata_ = [
            ];

            let mazedata = [
                '###########',
                '#S      # #',
                '####### # #',
                '#     #   #',
                '# ### ### #',
                '#       # #',
                '# # # ### #',
                '#G  #     #',
                '###########',
            ];
            maze = new Maze.Maze1();
            maze.create_from(mazedata);
            maze.dbgPrintMap();
        }

        adjx=-(maze.ncol_-1)*wL_, adjz=-(maze.nrow_+1)*wL_, nx=maze.ncol_, nz=maze.nrow_;
        let x,y=wH_,z, ix,iz;

        let ground = BABYLON.MeshBuilder.CreateGround("ground", {width:(nx+4)*wL, height:(nz+4)*wL}, scene);
        meshes.push(ground);
        stageInfo.push(ground);

        // スタート地点のパネル
        {
            [iz, ix] = maze.pStart_;
            let mesh = BABYLON.MeshBuilder.CreatePlane("plnST", {width:wL, height:wL}, scene);
            mesh.position = new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz);
            mesh.rotation = new BABYLON.Vector3(Math.PI/2, 0, 0);
	    mesh.material = new BABYLON.StandardMaterial('mat', scene);
	    mesh.material.diffuseColor = BABYLON.Color3.Blue();
	    // mesh.material.alpha = 0.7;
            stageInfo.push(mesh);
        }
        // ゴール地点のパネル
        for (let [iz,ix] of maze.pGoalList_) {
            let mesh = BABYLON.MeshBuilder.CreatePlane("plnST", {width:wL, height:wL}, scene);
            mesh.position = new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz);
            mesh.rotation = new BABYLON.Vector3(Math.PI/2, 0, 0);
	    mesh.material = new BABYLON.StandardMaterial('mat', scene);
	    mesh.material.diffuseColor = BABYLON.Color3.Red();
	    // mesh.material.alpha = 0.7;
            stageInfo.push(mesh);
        }

        // 最短経路
        {
            maze.seekPath2(); // 最短経路をもとめる
            let plist = [];
            for (let idx of maze.path2_) {
                [iz,ix] = maze.idx2rc(idx);
                plist.push(new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz));
            }
            let line = BABYLON.MeshBuilder.CreateDashedLines("arc", {points: plist, dashSize:1, gapSize:1});
            line.color = BABYLON.Color3.Gray();
            stageInfo.push(line);
        }

        for (let iz = 0; iz < nz; ++iz) {
            z = (nz-iz)*wL+adjz;
            for (let ix = 0; ix < nx; ++ix) {
                x = ix*wL+adjx;
                if (maze.data_[iz][ix]) { // 壁
                    let mesh = BABYLON.MeshBuilder.CreateBox("wallD", { width:wL, height:wH, depth:wL }, scene);
                    mesh.position = new BABYLON.Vector3(x, y, z);
                    meshes.push(mesh);
                    stageInfo.push(mesh);
                }
            }
        }

        return meshes;
    }

    let meshes = createStaticMesh(scene, 1); // fordebug

    var navmeshParameters = {
        cs: 0.1,  // 歩行可能なナビメッシュのボクセルサイズ（幅、深さ
        ch: 0.2,  // ボクセルの高さ
        walkableSlopeAngle: 90,  // 歩行可能な最大傾斜の角度[度]
        walkableHeight: 1.0,  //  歩行が許可されるボクセル単位の高さ
        walkableClimb: 0.5, // 1,  // 登ることができるボクセル単位のデルタ
        walkableRadius: 0.5, // 1,  // エージェントのボクセル単位での半径
        maxEdgeLen: 12.,  // メッシュの境界に沿った輪郭エッジの最大許容長さ[ボクセル単位]
        maxSimplificationError: 1.3, // 境界エッジが元の生の輪郭から逸脱する最大距離[ボクセル単位]
        minRegionArea: 4, // 8,  // 孤立した島領域を形成できるセルの最小数[ボクセル単位]
        mergeRegionArea: 3, // 20,  // 領域結合の閾値。[ボクセル単位]
        maxVertsPerPoly: 6, // 輪郭線からポリゴンへの頂点の最大数(３以上)
        detailSampleDist: 6,  // 詳細メッシュ生成のサンプリング距離
        detailSampleMaxError: 1,  // 詳細メッシュ表面が高さフィールドの最大距離[ワールド単位]
        };
    let maxAgents = 10, iniAgents = 10;
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


    let aggAgent = function() {
            var width = 0.20;
            var agentCube = BABYLON.MeshBuilder.CreateBox("cube", { size: width, height: width }, scene);
            var matAgent = new BABYLON.StandardMaterial('mat2', scene);
            var variation = Math.random();
            matAgent.diffuseColor = new BABYLON.Color3(0.4 + variation * 0.6, 0.3, 1.0 - variation * 0.3);
            agentCube.material = matAgent;
            var randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(20*Math.random()-10, 0.1, 5*Math.random()), 0.5);
            var transform = new BABYLON.TransformNode();
            agentCube.parent = transform;
            agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(15,25);
            agentParams.maxSpeed = BABYLON.Scalar.RandomRange(4,7);
            var agentIndex = crowd.addAgent(randomPos, agentParams, transform);
            agentCubeList.push(agentCube);
        return agentIndex;
    }

    let resetAgent = function(meshes, scene) {
        if (crowd != null) { crowd.dispose(); }
        if (navmeshdebug != null) { navmeshdebug.dispose(); }
        if (navigationPlugin != null) { navigationPlugin.dispose(); }
        while (agentCubeList.length > 0) { agentCubeList.pop().dispose(); };

        navigationPlugin = new BABYLON.RecastJSPlugin();
        navigationPlugin.createNavMesh(meshes, navmeshParameters);
        if (1) {
            // デバッグ用のメッシュ
            navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
            navmeshdebug.position = new BABYLON.Vector3(0, 0.01, 0);
            navmeshdebug.material = new BABYLON.StandardMaterial('matdebug', scene);;
            navmeshdebug.material.diffuseColor = new BABYLON.Color3(0.1, 0.2, 1);
            navmeshdebug.material.alpha = 0.2;
            stageInfo.push(navmeshdebug);
        }
        // crowd
        crowd = navigationPlugin.createCrowd(maxAgents, 0.1, scene);
        agentCubeList = [];
        for (let i = 0; i < iniAgents; i++) {
            aggAgent();
        }

        crowd.onReachTargetObservable.add((agentInfos) => {
            console.log("reach target");
            if (1) {
                // debug
                clearGame();
                return;
            }

            let agID = agentInfos.agentIndex;
            {
                // ゴールに到着
                --myHP;
                if (myHP <= 0) {
                    // ゲームオーバー
                    resetGame();
                }
                // エージェントは スタート地点から再スタート
                setDest0(agID);
            }
        });
    }

    resetAgent(meshes, scene);
    
    // エージェントにスタート位置と目的地を設定
    let setDest0 = function(agID) {
            // 初期位置：スタート地点付近にテレポート
            [iz, ix] = maze.pStart_;
            p = new BABYLON.Vector3(ix*wL+adjx, wH_, (nz-iz)*wL+adjz);
            crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(p));
            // 目標位置：ゴール地点に
            [iz, ix] = maze.pGoalList_[agID % maze.pGoalList_.length];
            p = new BABYLON.Vector3(ix*wL+adjx, wH_, (nz-iz)*wL+adjz);
            crowd.agentGoto(agID, navigationPlugin.getClosestPoint(p));
    }

    let setDest = function() {
        let agents = crowd.getAgents();
        let p;
        for (let agID of agents) {
            setDest0(agID);
        }
    }
    setDest();
    
    let resetGame = function() {
        myHP = 10;
        resetAgent(meshes, scene);
        setDest();
    }

    let clearGame = function() {
        if (myHP < 10) {
            myHP = 10;
        } else {
            ++myHP;
        }
        ++stageLv;
        maxAgents = stageLv*10;
        let meshes = createStaticMesh(scene);
        resetAgent(meshes, scene);
        setDest();
    }

    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key === ' ') {
                setDest();
            } else if (kbInfo.event.key === 'Enter') {
                meshes = createStaticMesh(scene);
                resetAgent(meshes, scene);
                setDest();

            } else if (kbInfo.event.key === 'z') {
                meshes = createStaticMesh(scene, 1);
                resetAgent(meshes, scene);
                setDest();
            } else if (kbInfo.event.key === 'x') {
                meshes = createStaticMesh(scene, 2);
                resetAgent(meshes, scene);
                setDest();
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            break;
        }
    });

    scene.onBeforeRenderObservable.add(() => {
        if (crowd.getAgents().length < maxAgents) {
            let agID = aggAgent();
            setDest0(agID);
        }
    });


    var ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var panel = createGUIPanel(ui);
    addText(scene, panel, (bodiesCounter) => {
        let stext = 'push SPC-key to start';
        if (stageLv > 0) {
            stext = 'StageLevel:'+stageLv;
        }

        bodiesCounter.text = stext;
    });

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

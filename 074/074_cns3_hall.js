// Crowd Navigation System(CNS)を使って人流シミュレーション・展示会場

// 多次元配列用のシャッフル
const shuffle2 = (arr) =>
  arr.map((value) => ({ value, random: Math.random() }))
    .sort((a, b) => a.random - b.random)
    .map(({ value }) => value);

var createScene = function () {

    var scene = new BABYLON.Scene(engine);
    let navigationPlugin = new BABYLON.RecastJSPlugin();

    var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(2, 5,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    function createStaticMesh(scene) {
        let meshes = []

        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 24, height: 24 }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 10;
        groundMesh.material.minorUnitVisibility  = 0.4;
        meshes.push(groundMesh);
        let py=0.2,block=2,block_=block/2, sS=0.1,sH=py*2,sL=block,sL80=sL*0.55,sL20=sL*0.25;
        let geoinfos = [
            [[0.5*block,py,block]  ,[sS,sH,sL]],
            [[1.5*block,py,block]  ,[sS,sH,sL]],
            [[2.5*block,py,block]  ,[sS,sH,sL]],
            [[3.5*block,py,block]  ,[sS,sH,sL]],
            [[0.5*block,py,2*block]  ,[sS,sH,sL]],
            [[1.5*block,py,2*block]  ,[sS,sH,sL]],
            [[2.5*block,py,2*block]  ,[sS,sH,sL]],
            [[3.5*block,py,2*block]  ,[sS,sH,sL]],
            [[  block,py,1.5*block]  ,[sL,sH,sS]],
            [[2*block,py,1.5*block]  ,[sL,sH,sS]],
            [[3*block,py,1.5*block]  ,[sL,sH,sS]],

            [[-0.5*block,py,block]  ,[sS,sH,sL]],
            [[-1.5*block,py,block]  ,[sS,sH,sL]],
            [[-2.5*block,py,block]  ,[sS,sH,sL]],
            [[-3.5*block,py,block]  ,[sS,sH,sL]],
            [[-0.5*block,py,2*block]  ,[sS,sH,sL]],
            [[-1.5*block,py,2*block]  ,[sS,sH,sL]],
            [[-2.5*block,py,2*block]  ,[sS,sH,sL]],
            [[-3.5*block,py,2*block]  ,[sS,sH,sL]],
            [[-  block,py,1.5*block]  ,[sL,sH,sS]],
            [[-2*block,py,1.5*block]  ,[sL,sH,sS]],
            [[-3*block,py,1.5*block]  ,[sL,sH,sS]],

            [[0.5*block,py,-block]  ,[sS,sH,sL]],
            [[1.5*block,py,-block]  ,[sS,sH,sL]],
            [[2.5*block,py,-block]  ,[sS,sH,sL]],
            [[3.5*block,py,-block]  ,[sS,sH,sL]],
            [[0.5*block,py,-2*block]  ,[sS,sH,sL]],
            [[1.5*block,py,-2*block]  ,[sS,sH,sL]],
            [[2.5*block,py,-2*block]  ,[sS,sH,sL]],
            [[3.5*block,py,-2*block]  ,[sS,sH,sL]],
            [[  block,py,-1.5*block]  ,[sL,sH,sS]],
            [[2*block,py,-1.5*block]  ,[sL,sH,sS]],
            [[3*block,py,-1.5*block]  ,[sL,sH,sS]],

            [[-0.5*block,py,-block]  ,[sS,sH,sL]],
            [[-1.5*block,py,-block]  ,[sS,sH,sL]],
            [[-2.5*block,py,-block]  ,[sS,sH,sL]],
            [[-3.5*block,py,-block]  ,[sS,sH,sL]],
            [[-0.5*block,py,-2*block]  ,[sS,sH,sL]],
            [[-1.5*block,py,-2*block]  ,[sS,sH,sL]],
            [[-2.5*block,py,-2*block]  ,[sS,sH,sL]],
            [[-3.5*block,py,-2*block]  ,[sS,sH,sL]],
            [[-  block,py,-1.5*block]  ,[sL,sH,sS]],
            [[-2*block,py,-1.5*block]  ,[sL,sH,sS]],
            [[-3*block,py,-1.5*block]  ,[sL,sH,sS]],

            [[-2.5*block,py,-3.5*block]  ,[sL*4,sH,sS]],
            [[-2.5*block,py, 3.5*block]  ,[sL*4,sH,sS]],
            [[-4.5*block,py,         0]  ,[sS,sH,sL*7]],

            [[2.5*block,py,-3.5*block]  ,[sL*4,sH,sS]],
            [[2.5*block,py, 3.5*block]  ,[sL*4,sH,sS]],
            [[4.5*block,py,         0]  ,[sS,sH,sL*7]],

        ];
        for (let [pp,ss] of geoinfos) {
            let box = BABYLON.MeshBuilder.CreateBox("cube", { width:ss[0], height:ss[1],depth:ss[2]}, scene);
            box.position = new BABYLON.Vector3(pp[0], pp[1], pp[2]);
            meshes.push(box);
        }
        return meshes;
    }

    let meshes = createStaticMesh(scene);

    //  スタート、ゴール
    const pST = [0, 0.1, -10], pGL = [0, 0.1, 10];
    //  各ブースの座標
    const pBooths = [
        [-6,0.1,-4],
        [-4,0.1,-4],
        [-2,0.1,-4],
        [-6,0.1,-2],
        [-4,0.1,-2],
        [-2,0.1,-2],
        
        [-6,0.1,4],
        [-4,0.1,4],
        [-2,0.1,4],
        [-6,0.1,2],
        [-4,0.1,2],
        [-2,0.1,2],

        [6,0.1,-4],
        [4,0.1,-4],
        [2,0.1,-4],
        [6,0.1,-2],
        [4,0.1,-2],
        [2,0.1,-2],
        
        [6,0.1,4],
        [4,0.1,4],
        [2,0.1,4],
        [6,0.1,2],
        [4,0.1,2],
        [2,0.1,2],
    ];

    //  各ブースの座標(2)
    //  人気のあるブースとして重みをつけ／同座標を複数にして、ヒットする確率をあげる
    let tlist = JSON.parse(JSON.stringify(pBooths));
    tlist = shuffle2(tlist);
    let popbooth = tlist.slice(0, 5); // 人気のあるブースをランダムに選ぶ
    let nloop = 5;
    for (p of popbooth) {
        for (let iloop = 0; iloop < nloop; ++iloop) {
            tlist.push(p);
        }
        nloop += 2;
    }
    const pBooths2 = tlist;

    let getDestBooth = function (iDest) {
        let dests = [];
        if (iDest == 0) {
            // 目的地：全ブースを順番にめぐる
            dests = JSON.parse(JSON.stringify(pBooths));
        } else if (iDest == 1) {
            // 目的地：ランダムに５ブースをめぐる
            dests = JSON.parse(JSON.stringify(pBooths));
            dests = shuffle2(dests);
            dests = dests.slice(0, 5);
        } else if (iDest == 2) {
            // 目的地：ランダムに５ブースをめぐる(人気ブースを重点的に)
            let tlist = JSON.parse(JSON.stringify(pBooths2));
            tlist = shuffle2(tlist);
            while (dests.length < 5 && tlist.length > 0) {
                let p = tlist.pop();
                if (dests.includes(p)) {
                    continue;
                }
                dests.push(p);
            }
        }
        dests.push(pGL); // goal を追加
        return dests;
    }

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
    navigationPlugin.createNavMesh(meshes, navmeshParameters);
    // デバッグ用のメッシュ
    var navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
    navmeshdebug.position = new BABYLON.Vector3(0, 0.01, 0);
    navmeshdebug.material = new BABYLON.StandardMaterial('matdebug', scene);;
    navmeshdebug.material.diffuseColor = new BABYLON.Color3(0.1, 0.2, 1);
    navmeshdebug.material.alpha = 0.2;
    
    // crowd
    let maxAgents = 100;
    var crowd = navigationPlugin.createCrowd(maxAgents, 0.1, scene);
    var i;
    var agentParams = {
        radius: 0.1,  // エージェントの半径。[制限: >= 0]
        reachRadius: 0.3, // エージェントが目的地の周囲にこの半径の仮想円内に入ると、オブザーバーに通知されます。デフォルトはエージェントの半径です。
        height: 0.2, // エージェントの高さ。[制限: > 0]
        maxAcceleration: 4.0,  // 最大許容加速度。[制限: >= 0]
        maxSpeed: 1.0,  // 許容される最大速度。[制限: >= 0]
        collisionQueryRange: 0.5,  // ステアリング動作の対象となる衝突要素がどれだけ近い必要があるかを定義します。[制限: > 0]
        pathOptimizationRange: 0.0,  // パスの可視性の最適化範囲。[制限: > 0]
        separationWeight: 3.0 // エージェント マネージャーがこのエージェントとの衝突を回避する際の積極性。[制限: >= 0]
    };
    for (i = 0; i < maxAgents; i++) {
        var width = 0.20;
        var agentCube = BABYLON.MeshBuilder.CreateBox("cube", { size: width, height: width }, scene);
        var matAgent = new BABYLON.StandardMaterial('mat2', scene);
        var variation = Math.random();
        matAgent.diffuseColor = new BABYLON.Color3(0.4 + variation * 0.6, 0.3, 1.0 - variation * 0.3);
        agentCube.material = matAgent;
        var randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(20*Math.random()-10, 0.1, 5*Math.random()), 0.5);
        var transform = new BABYLON.TransformNode();
        agentCube.parent = transform;
        agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(3,5);
        agentParams.maxSpeed = BABYLON.Scalar.RandomRange(0.8,1.2);
        var agentIndex = crowd.addAgent(randomPos, agentParams, transform);
    }
    
    let iDest = -1, nDest = 3;
    let ag2dest = []; // エージェントごとの目的地
    let setDest = function(iDest) {
        ag2dest = [];
        let agents = crowd.getAgents();
        // 初期位置：スタート地点付近にテレポート
        let randomPos, agID_;
        for (let agID of agents) {
            // let randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(pST[0], pST[1], pST[2], 0.5));
            if (agID < 20) {
                randomPos = new BABYLON.Vector3(pST[0]+agID*0.5, pST[1], pST[2]);
            } else if (agID < 40) {
                agID_ = agID - 20;
                randomPos = new BABYLON.Vector3(pST[0]-agID_*0.5-2, pST[1], pST[2]);
            } else if (agID < 80) {
                agID_ = agID - 40;
                randomPos = new BABYLON.Vector3(10, pST[1], agID_*0.5-10);
            } else if (agID < 120) {
                agID_ = agID - 80;
                randomPos = new BABYLON.Vector3(-10, pST[1], agID_*0.5-10);
            } else {
                randomPos = new BABYLON.Vector3(pST[0], pST[1], pST[2]);
            }
            crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(randomPos));

            let dests = getDestBooth(iDest);
            let p = dests.shift();
            // 最初の目的地を設定
            crowd.agentGoto(agID, navigationPlugin.getClosestPoint(new BABYLON.Vector3(p[0],p[1],p[2])));
            // 残りの目的地は別途 ag2destに格納しておく
            ag2dest.push(dests);
        }
    }

    crowd.onReachTargetObservable.add((agentInfos) => {
        let agID = agentInfos.agentIndex;
        let dest = ag2dest[agID];
        if (dest.length > 0) {
            let p = dest.shift();
            ag2dest[agID] = dest;
            // 次の目的地を設定
            crowd.agentGoto(agID, navigationPlugin.getClosestPoint(new BABYLON.Vector3(p[0],p[1],p[2])));
        } else {
            // ゴールに到着
            // 下手にエージェントを消すと誤動作するので、ループさせる
            // スタート地点にテレポート
            let vST = new BABYLON.Vector3(pST[0], pST[1], pST[2], 0.5);
            crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(vST));
            let dests = getDestBooth(iDest);
            let p = dests.shift();
            // 最初の目的地を設定
            crowd.agentGoto(agID, navigationPlugin.getClosestPoint(new BABYLON.Vector3(p[0],p[1],p[2])));
            // 残りの目的地は別途 ag2destに格納しておく
            ag2dest[agID] = dests;
        }
    });


    var startingPoint;
    var currentMesh;
    var pathLine;
    var getGroundPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY);
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }
        return null;
    }
    var pointerDown = function (mesh) {
        currentMesh = mesh;
        startingPoint = getGroundPosition();
        if (startingPoint) { // we need to disconnect camera from canvas
            var agents = crowd.getAgents();
            var i;
            for (i=0;i<agents.length;i++) {
                var randomPos = navigationPlugin.getRandomPointAround(startingPoint, 1.0);
                crowd.agentGoto(agents[i], navigationPlugin.getClosestPoint(startingPoint));
            }
        }
    }

    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ') {
                iDest = (iDest+1) % nDest;
                setDest(iDest);
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            break;
        }
    });


    var ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var panel = createGUIPanel(ui);
    addText(scene, panel, (bodiesCounter) => {
        let stext = 'go around ALL booth (push SPC-key to change)';
        if (iDest == 1) {
            stext = 'visit 5 booth at random';
        } else if (iDest == 2) {
            stext = 'visit popular booth at random';
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

function addText(scene, parent, updateFn, initialText) {
    var bodiesCounter = new BABYLON.GUI.TextBlock("bodiesCounter", initialText);
    bodiesCounter.color = "white";
    bodiesCounter.resizeToFit = true;
    bodiesCounter.fontSize = "20px";
    parent.addControl(bodiesCounter);
    if (updateFn) {
        scene.onAfterRenderObservable.add(() => updateFn(bodiesCounter));
    }
    return bodiesCounter;
}

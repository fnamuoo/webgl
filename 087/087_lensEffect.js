// ミニチュアなひまわり畑
//
// L .. レンズ効果を切り替え

// for local
// const SCRIPT_URL1 = "./Maze.js";
// // for local
// const SCRIPT_URL1 = "../075/Maze.js";
// const wallPath = "../086/textures/sand.jpg";
// const grndPath = "../086/textures/grass.png";
// const plantInfo = [
//     {path:"../086/textures/himawari.png", w:318, h:400, size:[[0.5, 0.7], [1.0, 1.4]]},
//     {path:"../086/textures/flower_lavender.png", w:645, h:722, size:[[0.2, 0.3], [0.3, 0.4]]},
//     {path:"../086/textures/flower_ayame.png", w:308, h:450, size:[[0.3, 0.4], [0.4, 0.6]]},
//     {path:"../086/textures/mugi.png", w:360, h:400, size:[[0.4, 0.5], [0.7, 1.1]]},
// ];
// const charPathList = ["../086/textures/pipo-charachip007.png",
//                       "../086/textures/pipo-charachip008b.png",
//                      ];
// // const skybox_path= "textures/TropicalSunnyDay";
// const skybox_path= "../069/textures/TropicalSunnyDay";

// for PlayGround
const SCRIPT_URL1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";
const wallPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/086/textures/sand.jpg";
const grndPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/086/textures/grass.png";
const plantInfo = [
    {path:"https://raw.githubusercontent.com/fnamuoo/webgl/main/086/textures/himawari.png", w:318, h:400, size:[[0.5, 0.7], [1.0, 1.4]]},
    {path:"https://raw.githubusercontent.com/fnamuoo/webgl/main/086/textures/flower_lavender.png", w:645, h:722, size:[[0.2, 0.3], [0.3, 0.4]]},
    {path:"https://raw.githubusercontent.com/fnamuoo/webgl/main/086/textures/flower_ayame.png", w:308, h:450, size:[[0.3, 0.4], [0.4, 0.6]]},
    {path:"https://raw.githubusercontent.com/fnamuoo/webgl/main/086/textures/mugi.png", w:360, h:400, size:[[0.4, 0.5], [0.7, 1.1]]},
];
const charPathList = ["https://raw.githubusercontent.com/fnamuoo/webgl/main/086/textures/pipo-charachip007.png",
                      "https://raw.githubusercontent.com/fnamuoo/webgl/main/086/textures/pipo-charachip008b.png",
                     ];
const skybox_path= "textures/TropicalSunnyDay";

let Maze = null;
// import(SCRIPT_URL1).then((obj) => { Maze = obj; console.log("maze=",obj); });
import(SCRIPT_URL1).then((obj) => { Maze = obj; });




const R90 = Math.PI/2;


var createScene = async function () {

    var scene = new BABYLON.Scene(engine);


    // ----------------------------------------
    // Depth of Field and Other Lens Effects
    // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/dofLenseEffects

    /*
      This is where we create the rendering pipeline and attach it to the camera.
      The pipeline accepts many parameters, but all of them are optional.
      Depending on what you set in your parameters array, some effects will be
      enabled or disabled. Here is a list of the possible parameters:
      {
      chromatic_aberration: number;       // from 0 to x (1 for realism)
      edge_blur: number;                  // from 0 to x (1 for realism)
      distortion: number;                 // from 0 to x (1 for realism)
      grain_amount: number;               // from 0 to 1
      grain_texture: BABYLON.Texture;     // texture to use for grain effect; if unset, use random B&W noise
      dof_focus_distance: number;         // depth-of-field: focus distance; unset to disable (disabled by default)
      dof_aperture: number;               // depth-of-field: focus blur bias (default: 1)
      dof_darken: number;                 // depth-of-field: darken that which is out of focus (from 0 to 1, disabled by default)
      dof_pentagon: boolean;              // depth-of-field: makes a pentagon-like "bokeh" effect
      dof_gain: number;                   // depth-of-field: highlights gain; unset to disable (disabled by default)
      dof_threshold: number;              // depth-of-field: highlights threshold (default: 1)
      blur_noise: boolean;                // add a little bit of noise to the blur (default: true)
      }
    */
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(6, 15, -30), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var lensEffect = new BABYLON.LensRenderingPipeline('lens', {
	edge_blur: 1.0,
	chromatic_aberration: 1.0,
	distortion: 1.0,
	dof_focus_distance: 30, // 22-30-50,
	dof_aperture: 10, // 1-10-100 レンズ開口：小：焦点範囲が広く、大きい：焦点範囲が狭く
	grain_amount: 0.1,
	dof_pentagon: true,
	dof_gain: 1.0,
	dof_threshold: 1.0,
	dof_darken: 0.00, // 0.25
    }, scene, 1.0, camera);

    let ilens = 0;
    let lensPara = [[30, 10, "normal"],
                    [22, 10, "focus-dist=22"],
                    [50, 10, "focus-dist=50"],
                    [30, 1  , "aperture=1"],
                    [30, 100, "aperture=100"],
                   ];
    let nlens = lensPara.length;


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
    const wL=1.5, wL_=wL/2, wS=0.1, wS_=wS/2, wH=0.2, wH_=wH/2;
    let mapR = 25, mapC = 27;
    let adjx, adjz, nx, nz, adjx2, adjz2, nz2;
    let pStart, pGoal;

    matWall = new BABYLON.StandardMaterial("groundmat", scene);
    matWall.diffuseTexture = new BABYLON.Texture(wallPath, scene);


    // index座標値から座標値への変換
    let ixz2xz = function (ix, iz) {
        return [ix*wL+adjx, (nz-iz)*wL+adjz];
    }
    // 座標値からindex座標値への変換
    let xz2ixz = function (x, z) {
        return [(x -adjx)/wL, (z -adjz)/wL-1];
    }

    // let stageLv=1, myHP=10;
    let istage = 0, nstage = plantInfo.length;

    let stageInfo = []
    function createStaticMesh(istage, scene) {
        while (stageInfo.length > 0) {
            let [mesh,agg] = stageInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        let meshes = [];
        mapR = mapC = 21;
        maze = new Maze.Maze1(mapR, mapC);
        maze.create(21);
        // maze.resetStartGoal();
        maze.setStartGoal([mapC-2, 11], [1, 11]); // 最短経路を求めるために通路上に配置
        maze.seekPath2(); // 最短経路をもとめる
        maze.setStartGoal([mapC-1, 11], [0, 11]); // 改めて迷路の上下に穴をあけるように再配置
        maze.dbgPrintMap();

        adjx=-(maze.ncol_-1)*wL_, adjz=-(maze.nrow_+1)*wL_, nx=maze.ncol_, nz=maze.nrow_;
        let x,y=wH_,z, ix,iz;

        let ground = BABYLON.MeshBuilder.CreateGround("ground", {width:(nx)*wL, height:(nz+6)*wL}, scene);
        let agg = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
        matGrnd = new BABYLON.StandardMaterial("groundmat", scene);
        matGrnd.diffuseTexture = new BABYLON.Texture(grndPath, scene);
	ground.material = matGrnd;
        meshes.push(ground);
        stageInfo.push([ground, agg]);

        [iz, ix] = maze.pStart_;
        [x,z] = ixz2xz(ix,iz);
        pStart = new BABYLON.Vector3(x, y, z);
        [iz,ix] = maze.pGoalList_[0];
        [x,z] = ixz2xz(ix,iz);
        // [x,z] = [ix*wL+adjx, (nz-iz)*wL+adjz];
        pGoal = new BABYLON.Vector3(x, y, z);

        // スタート地点のパネル
        {
            [iz, ix] = maze.pStart_;
            let mesh = BABYLON.MeshBuilder.CreatePlane("plnST", {width:wL, height:wL}, scene);
            mesh.position = new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz);
            mesh.rotation = new BABYLON.Vector3(Math.PI/2, 0, 0);
	    mesh.material = new BABYLON.StandardMaterial('mat', scene);
	    mesh.material.diffuseColor = BABYLON.Color3.Blue();
            stageInfo.push([mesh,null]);
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

        // 最短経路
        if (maze.path2_.length > 0) {
            let plist = [];
            for (let idx of maze.path2_) {
                [iz,ix] = maze.idx2rc(idx);
                plist.push(new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz));
            }
            let line = BABYLON.MeshBuilder.CreateDashedLines("arc", {points: plist, dashSize:1, gapSize:1});
            line.color = BABYLON.Color3.Gray();
            stageInfo.push([line,null]);
        }

        // 壁
        for (let iz = 0; iz < nz; ++iz) {
            z = (nz-iz)*wL+adjz;
            for (let ix = 0; ix < nx; ++ix) {
                if ((maze.pStart_[0]==iz && (maze.pStart_[1]==ix)) || maze.isGoal(iz,ix)) {
                    continue;
                }
                x = ix*wL+adjx;
                if (maze.data_[iz][ix]) { // 壁
                    let mesh = BABYLON.MeshBuilder.CreateBox("wallD", { width:wL, height:wH, depth:wL }, scene);
                    mesh.position = new BABYLON.Vector3(x, y, z);
                    mesh.material = matWall;
                    let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                }
            }
        }


        // ----------------------------------------
        if (1) {
        // 植樹(4
            let plantPath, plantPathW, plantPathH, plantSizeW, plantSizeH;
            plantPath = plantInfo[istage].path;
            plantPathW = plantInfo[istage].w;
            plantPathH = plantInfo[istage].h;
            plantSizeW = plantInfo[istage].size[0];
            plantSizeH = plantInfo[istage].size[1];
        let nMesh = 10000, nCapa = nMesh+1;
        const spriteManagerTrees = new BABYLON.SpriteManager("treesManager", plantPath, nCapa, {width: plantPathW, height: plantPathH});

        let size_ = wL * mapR / 2;
        let rng = size_, rngLimit = size_*0.2;
        y=wH;
        while (nMesh > 0) {
            x = BABYLON.Scalar.RandomRange(-rng, rng);
            z = BABYLON.Scalar.RandomRange(-rng, rng);
            ix = Math.floor((x+size_) / wL);
            iz = Math.floor((-z+size_) / wL);
            if (!maze.isWall_s(iz,ix)) {
                continue;
            }
            if ((maze.pStart_[0]==iz && (maze.pStart_[1]==ix)) || maze.isGoal(iz,ix)) {
                continue;
            }
            let tree = new BABYLON.Sprite("tree", spriteManagerTrees);
            tree.height = tree.width*2;
            tree.width = BABYLON.Scalar.RandomRange(plantSizeW[0], plantSizeW[1]);
            tree.height = BABYLON.Scalar.RandomRange(plantSizeH[0], plantSizeH[1]);
            tree.position = new BABYLON.Vector3(x,y+tree.height/2,z);
            --nMesh;
        }
        stageInfo.push([spriteManagerTrees,agg]);
        }

        return meshes;
    }

    let meshes = createStaticMesh(istage, scene);


    //if (1) {
    let createKidMesh = function(itype=0) {
        let charPath = charPathList[itype];
        var mx = 3, my = 4;

        let meshRoot = new BABYLON.TransformNode();

	const matFB = new BABYLON.StandardMaterial("");
	matFB.diffuseTexture = new BABYLON.Texture(charPath);
	matFB.diffuseTexture.hasAlpha = true;
	matFB.emissiveColor = new BABYLON.Color3.White();
	const uvF = new BABYLON.Vector4(0, 0/my, 1/mx, 1/my); // B
        const uvB = new BABYLON.Vector4(0, 3/my, 1/mx, 4/my); // F
        const planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        planeFB.position.y = 1;
        planeFB.material = matFB;
        planeFB.parent = meshRoot;

	const matLR = new BABYLON.StandardMaterial("");
	matLR.diffuseTexture = new BABYLON.Texture(charPath);
	matLR.diffuseTexture.hasAlpha = true;
	matLR.emissiveColor = new BABYLON.Color3.White();
	const uvL = new BABYLON.Vector4(0, 2/my, 1/mx, 3/my); // L
        const uvR = new BABYLON.Vector4(1/mx, 1/my, 0, 2/my); // R
        const planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvR, backUVs: uvL, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        planeLR.position.y = 1;
        planeLR.material = matLR;
        planeLR.rotation = new BABYLON.Vector3(0, R90, 0);
        planeLR.parent = meshRoot;

        return meshRoot;
    }


    // ------------------------------
    // CNS
    var navmeshParameters = {
        cs: 0.2, // 0.1,  // 歩行可能なナビメッシュのボクセルサイズ（幅、深さ
        ch: 0.01,  // ボクセルの高さ
        walkableSlopeAngle: 10, // 90,  // 歩行可能な最大傾斜の角度[度]
        walkableHeight: 0.01, // 10, // 3.0,  //  歩行が許可されるボクセル単位の高さ
        walkableClimb: 0.01, // 10, // 3, // 1,  // 登ることができるボクセル単位のデルタ
        walkableRadius: 1, // 3, // 1,  // エージェントのボクセル単位での半径
        maxEdgeLen: 12,  // メッシュの境界に沿った輪郭エッジの最大許容長さ[ボクセル単位]
        maxSimplificationError: 1.3, // 境界エッジが元の生の輪郭から逸脱する最大距離[ボクセル単位]
        minRegionArea: 4, // 8,  // 孤立した島領域を形成できるセルの最小数[ボクセル単位]
        mergeRegionArea: 3, // 20,  // 領域結合の閾値。[ボクセル単位]
        maxVertsPerPoly: 6, // 輪郭線からポリゴンへの頂点の最大数(３以上)
        detailSampleDist: 6,  // 詳細メッシュ生成のサンプリング距離
        detailSampleMaxError: 1,  // 詳細メッシュ表面が高さフィールドの最大距離[ワールド単位]
        borderSize:1,
        tileSize:0, // 20 // タイルのサイズ def:0 :=障害物が機能しない
    };
    let maxAgents = 5, iniAgents = maxAgents;
    var agentParams = {
        radius: 0.1, // 0.3, // cnsRadius, // 0.8, // 0.1,  // エージェントの半径。[制限: >= 0]
        reachRadius: 1, // cnsReachRadius, // 2, // 0.3, // エージェントが目的地の周囲にこの半径の仮想円内に入ると、オブザーバーに通知されます。デフォルトはエージェントの半径です。
        height: 0.2, // エージェントの高さ。[制限: > 0]
        maxAcceleration: 4.0,  // 最大許容加速度。[制限: >= 0]
        maxSpeed: 1,  // 許容される最大速度。[制限: >= 0]
        collisionQueryRange: 0.5, // cnsCollisionQueryRange, // 0.5,  // ステアリング動作の対象となる衝突要素がどれだけ近い必要があるかを定義します。[制限: > 0]
        pathOptimizationRange: 10.0,  // パスの可視性の最適化範囲。[制限: > 0]
        separationWeight: 3.0, // cnsSeparationWeight // 3.0 // エージェント マネージャーがこのエージェントとの衝突を回避する際の積極性。[制限: >= 0]
    };
    let navigationPlugin = null, navmeshdebug = null, crowd = null, agentCubeList = [];

    let addAgent = function() {
        var randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(20*Math.random()-10, 0.1, 5*Math.random()), 0.5);
        let itype = Math.floor(Math.random()*2);
        var transform = createKidMesh(itype);
        agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(2.2,5.5);
        agentParams.maxSpeed = BABYLON.Scalar.RandomRange(4.0,4.6);
        var agentIndex = crowd.addAgent(randomPos, agentParams, transform);
        agentCubeList.push(transform);
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
            navmeshdebug.position = new BABYLON.Vector3(0, 0.001, 0);
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

        crowd.onReachTargetObservable.add((agentInfos) => {
            let agID = agentInfos.agentIndex;
            resetAgent(agID);
        });

    }
    let resetAgent = function(agID) {
        // 初期位置：スタート地点付近にテレポート
        crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(pStart));
        // 目標位置：目標地点に
        crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pGoal));
    }

    // エージェントの移動速度から向きを変更する
    // // 参考
    // // https://scrapbox.io/babylonjs/Navigation_Mesh
    scene.onBeforeRenderObservable.add(() => {
        for (let i = 0; i < agentCubeList.length; i++) {
            const meshAgent = agentCubeList[i];
            {
                // 移動方向と速度を取得
                const vel = crowd.getAgentVelocity(i);
                // 速度成分から角度をもとめ、方向とする
                meshAgent.rotation.y = Math.atan2(vel.x, vel.z);
            }
        }
    });

    resetAllAgent(meshes, scene);

    // ------------------------------

    if (1) {
    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skybox_path, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    }

    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key === ' ') {
                // iH = 0;
                meshes = createStaticMesh(istage, scene);
                resetAllAgent(meshes, scene);

            } else if (kbInfo.event.key === 'n' || 
                       kbInfo.event.key === 'Enter') {
                // iH = 0;
                // stageLv *= 10;
                istage = (istage+1) % nstage;
                meshes = createStaticMesh(istage, scene);
                resetAllAgent(meshes, scene);

            } else if (kbInfo.event.key === 'p') {
                istage = (istage + nstage-1) % nstage;
                meshes = createStaticMesh(istage, scene);
                resetAllAgent(meshes, scene);

            } else if (kbInfo.event.key === 'h') {
                //   キー操作(h)で表示のon/offを切り替え
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }

            } else if (kbInfo.event.key === 'l') {
                ilens = (ilens + 1) %nlens;
                let [fdis, aper, msg] = lensPara[ilens];
                console.log( [fdis, aper, msg]);
                lensEffect.dofDistortion = fdis;
                lensEffect.dofAperture = aper;
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            break;
        }
    });

    return scene;
};

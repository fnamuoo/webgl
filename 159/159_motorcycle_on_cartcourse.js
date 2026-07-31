// カートコースをバイク(キャラクターコントローラー)で疾走
//
// 操作
// ArrowUp/ArrowDown    .. 加速/減速
// ArrowLeft/ArrowRight .. 旋回（左右）
// c                    .. カメラ切り替え


export var createScene_test_2003 = async function () {

    // const SCRIPT_URL3 = "./CourseData3.js";
    // // const goalPath ="textures/amiga.jpg";
    // const goalPath ="textures/checker.jpg";
    // const grndPath ="textures/grass.jpg";
    // const floorPath01 ="textures/floor_wide_wall.png";
    // const floorPath11 ="textures/floor_norm_grav.png";
    // const floorPath21 ="textures/floor_narw_grav.png";
    // const skyboxTextPath2 = "textures/skybox2";
    // const skyboxTextPath5 = "textures/TropicalSunnyDay";
    // const skyboxTextPath6 = "textures/toySky";
    // const iconPath3 = "textures/icon_golf6.png";
    // const dbase = "textures/course5/"

    // const SCRIPT_URL3 = "../116/CourseData3.js";
    // const goalPath ="../078/textures/amiga.jpg";
    // const grndPath ="../065/textures/grass.jpg";
    // const floorPath01 ="../116/textures/floor_wide_wall.png";
    // const floorPath11 ="../116/textures/floor_norm_grav.png";
    // const floorPath21 ="../116/textures/floor_narw_grav.png";
    // const skyboxTextPath2 = "../111/textures/skybox2";
    // const skyboxTextPath5 = "../111/textures/TropicalSunnyDay";
    // const skyboxTextPath6 = "../116/textures/toySky";
    // const iconPath3 = "../099/textures/icon_golf6.png";
    // const dbase = "../116/course5/"

    const ddbase1="https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/";
    const ddbase2="https://raw.githubusercontent.com/fnamuoo/webgl/main/";

    const SCRIPT_URL3 = ddbase1 + "116/CourseData3.js";
    const goalPath = ddbase2 + "078/textures/amiga.jpg";
    const grndPath = ddbase2 + "065/textures/grass.jpg";
    const floorPath01 = ddbase2 + "116/textures/floor_wide_wall.png";
    const floorPath11 = ddbase2 + "116/textures/floor_norm_grav.png";
    const floorPath21 = ddbase2 + "116/textures/floor_narw_grav.png";
    const skyboxTextPath2 =  ddbase2 + "111/textures/skybox2";
    const skyboxTextPath5 =  ddbase2 + "111/textures/TropicalSunnyDay";
    const skyboxTextPath6 =  ddbase2 + "116/textures/toySky";
    const iconPath3 =  ddbase2 + "099/textures/icon_golf6.png";
    const dbase =  ddbase2 + "116/course5/"

    const skyboxTextPathList = [skyboxTextPath2, skyboxTextPath5, skyboxTextPath6];
    let skyboxType=1; // -1:rand, 0-2: 固定

    // ライバルカーの ON/OFF
    let bRivalCar = false;  // for screencapture
    // let bRivalCar = true;

    // 開始ステージ
    let istage=0;
//    let istage=4; // ハーバーサーキット幕張新都心
//    let istage=24; // 峠

    // バイクメッシュ　: 0-3
    let ivehicle = 0;
//    let ivehicle = 3;

    let CourseData3 = null;
    await import(SCRIPT_URL3).then((obj) => { CourseData3 = obj; });

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
        // _camera.cameraAcceleration = 0.01;
        _camera.cameraAcceleration = 0.005;
        _camera.maxCameraSpeed = 5; // 10;
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        // _camera.lockedTarget = null;
        // _camera.setTarget(BABYLON.Vector3.Zero());
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

    let setVisibility = function(mesh, val) {
        mesh.visibility = val;
        for (let _m of mesh.getChildMeshes()) {
            _m.visibility = val;
        }
    };

    let icamera=0, ncamera=4;
    let setCAM3 = function(icamera) {
        if (icamera == 0) {
            // 後ろから追っかける（バードビュー
            setVisibility(myMesh, 1);
            camera.radius = 4;
            camera.heightOffset = 2.5;
            camera.cameraAcceleration = 0.05;
            camera.maxCameraSpeed = 30;
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
            setVisibility(myMesh, 0);
            camera.radius = 3; // 1.3;
            camera.heightOffset = 1.0; // 0;
            camera.cameraAcceleration = 0.5; // 0.3;
            camera.maxCameraSpeed = 100;
        }
    }
    let changeCAM3 = function(_icamera) {
        icamera = (_icamera+1) % ncamera;
        setCAM3(icamera);
    }

    const light = new BABYLON.HemisphericLight("", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), hk);



    if (1) {
        let grndW=1000, grndH=1000;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.position.y = -10;
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
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

    const courseInfoList = [
        // istage, type, label, fpath
        [300109, 0, "サーキット秋ヶ瀬", dbase+"001.jpg"], // 
        [300202, 0, "新東京サーキット", dbase+"002.jpg"], //
        [300303, 0, "大井松田カートランド", dbase+"003.jpg"], //
        [300404, 0, "シティカート", dbase+"004.jpg"], // むずい
        [300502, 0, "ハーバーサーキット幕張新都心", dbase+"005.jpg"], //
        [301604, 0, "ハーバーサーキット木更津", dbase+"016.jpg"], //
        [300603, 0, "Fドリーム平塚", dbase+"006.jpg"], //
        [300712, 0, "ツインリンクもてぎ-南", dbase+"007_1.jpg"], //
        [300722, 0, "ツインリンクもてぎ-北", dbase+"007_2.jpg"], //
        [300732, 0, "ツインリンクもてぎ-モビリティリゾート", dbase+"007_3.jpg"], //
        [300804, 0, "石野サーキット", dbase+"008.jpg"], // むずい
        [300902, 0, "琵琶湖スポーツランド", dbase+"009.jpg"], // むずい
        [301013, 0, "茂原ツインサーキット・東", dbase+"010_1.jpg"], //
        [301022, 0, "茂原ツインサーキット・西", dbase+"010_2.jpg"], //
        [301102, 0, "クイック潮来", dbase+"011.jpg"], //
        [301202, 0, "榛名モータースポーツランド", dbase+"012.jpg"], //
        [301312, 0, "オートパラダイス御殿場・ハイスピード", dbase+"013_1.jpg"], //
        [301322, 0, "オートパラダイス御殿場・テクニカル", dbase+"013_2.jpg"], //
        [301402, 0, "井頭モータースポーツ", dbase+"014.jpg"], //
        [301502, 0, "ISK前橋店", dbase+"015.jpg"], //
        [310104, 0, "富士スピードウェイ・マルチパーパスドライビングコース", dbase+"101.jpg"], //
        [310214, 0, "エビスサーキット・東", dbase+"102_1.jpg"], //
        [310227, 0, "エビスサーキット・北", dbase+"102_2.jpg"], //
        [310234, 0, "エビスサーキット・西", dbase+"102_3.jpg"], //
        [310246, 0, "エビスサーキット・峠", dbase+"102_4.jpg"], //24
        [310314, 0, "鈴鹿ツインサーキット・フル", dbase+"103_1.jpg"], //
        [310324, 0, "鈴鹿ツインサーキット・ドリフト", dbase+"103_2.jpg"], //
        [310333, 0, "鈴鹿ツインサーキット・グリッド", dbase+"103_3.jpg"], //
    ];

    let nstage = courseInfoList.length;


    const metaStageInfo = {
        // ------------------------------
        300109:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:200, adjx:-120, adjz:60, pQdbg:1, nbPoints:20,
                dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.AkigaseE.xz,
               },
        300202:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'normal_with_gravel',
                data :CourseData3.DATA.ShinTokyo.xz,
               },
        300303:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:50, pQdbg:1,
                dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.OhiMatsuda.xz,
               },
        300404:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:100, pQdbg:1,
                dtype:"xz", stageType:'normal_with_gravel',
                data :CourseData3.DATA.CityCart.xz,
               },
        300502:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:100, adjy:0.1, pQdbg:1,
                dtype:"xzRR", stageType:'wide_with_wall',
                data :CourseData3.DATA.Hyper.xzRR,
               },
        300603:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:100, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                data :CourseData3.DATA.FDreamHiratsuka.xz,
               },
        300712:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:70, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                data :CourseData3.DATA.TwinLinkMOTEGISourth.xz,
               },
        300722:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:100, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                data :CourseData3.DATA.TwinLinkMOTEGINorth.xz,
               },
        300732:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:90, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                data :CourseData3.DATA.TwinLinkMOTEGIMovility.xz,
               },
        300804:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:70, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'normal_with_gravel',
                data :CourseData3.DATA.Ishino.xz,
               },
        300902:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-130, adjz:70, pQdbg:1,
                dtype:"xz", stageType:'normal_with_gravel',
                data :CourseData3.DATA.Biwako.xz,
               },
        301013:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:70, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'normal_with_gravel',
                data :CourseData3.DATA.MobaraEast.xz,
               },
        301022:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:90, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                data :CourseData3.DATA.MobaraWest.xz,
               },
        301102:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:70, pQdbg:1,
                dtype:"xz", stageType:'normal_with_gravel',
                data :CourseData3.DATA.Itako.xz,
               },
        301202:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:90, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                data :CourseData3.DATA.Haruna.xz,
               },
        301312:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                data :CourseData3.DATA.GotenbaHigh.xz,
               },
        301322:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'normal_with_gravel',
                data :CourseData3.DATA.GotenbaTech.xz,
               },
        301402:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:90, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                data :CourseData3.DATA.Igashira.xz,
               },
        301502:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                data :CourseData3.DATA.ISKMaebashi.xz,
               },
        301604:{label:"",
                iy:0.05, scale:0.7, grndW:600, grndH:450, adjx:-170, adjz:100, pQdbg:1, nbPoints:4,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.KisarazuB.xz,
               },
        310104:{label:"",
                iy:0.05, scale:0.8, grndW:500, grndH:200, adjx:-200, adjz:70, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'wide_with_wall',
                // dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.FujiSpeedwayMultiPuerpose.xz,
               },
        310214:{label:"",
                iy:0.05, scale:0.6, grndW:400, grndH:300, adjx:-150, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'wide_with_wall',
                // dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.EbisuEast.xz,
               },

        310227:{label:"",
                iy:0.05, scale:0.8, grndW:600, grndH:450, adjx:-200, adjz:100, pQdbg:1, nbPoints:4,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.EbisuNorthC.xz,
               },
        310234:{label:"",
                iy:0.05, scale:0.8, grndW:500, grndH:300, adjx:-200, adjz:80, pQdbg:1, nbPoints:10,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.EbisuWest.xz,
               },
        310246:{label:"",
                iy:0.05, scale:0.8, grndW:500, grndH:300, adjx:-200, adjz:80, adjy:0.01, pQdbg:1, // pQdbgLbl:1,
                // dtype:"xzRR", stageType:'wide_with_wall',
                dtype:"xzRR", stageType:'normal_with_gravel',
                // dtype:"xzRR", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.EbisuTougeC.xzRR,
               },
        310314:{label:"",
                iy:0.05, scale:1.0, grndW:800, grndH:300, adjx:-250, adjz:100, pQdbg:1,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.SuzukaTwinFullB.xz,
               },
        310324:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-110, adjz:100, pQdbg:1,
                dtype:"xz", stageType:'normal_with_gravel',
                data :CourseData3.DATA.SuzukaTwinDriftB.xz,
               },
        310333:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-350, adjz:80, pQdbg:1,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.SuzukaTwinGridB.xz,
               },

    };

    var getMetaStageInfo = function (istage) {
        let rval;
        let [id, ttype, tlabel, tpath] = courseInfoList[istage];
        rval = metaStageInfo[id];
        console.log("\ni=",istage, rval.label, tlabel);
        setText2(tlabel);
        return rval;
    }

    let meshAggInfo = []; // mesh, agg;
    let meshes4CNS = []; // CNS用
    let pStart = new BABYLON.Vector3(0, 0, 0);
    let pStart2 = new BABYLON.Vector3(0, 0, 0);
    let pGoal = new BABYLON.Vector3(0, 0, 0);
    let comMesh = null;
    // チェックポイントのメッシュ
    let meshCPlist = [];
    // 交差チェックするメッシュのindex
    let imeshCPnextME = 0, imeshCPnextCOM = 0;
    // 周回数
    let iloopME = 1, iloopCOM = 1;
    // 各チェックポイントの通過フラグ
    let passCPMElist = [];
    let passCPCOMlist = [];
    // 各チェックポイントの時刻
    let ctMElist = [];
    let ctCOMlist = [];
    // 周回時の勝利回数
    let winLoop = 0;
    // ベストラップ
    let bestLapME = -1, bestLapCOM = -1;
    let bTiggerJumpNextStage = false;

    // CNS用変数 定義
    let navigationPlugin = null, navmeshdebug = null, crowd = null, meshAgentList = [], agentParamList = [];

    let createStage = async function(istage) {
console.log("createStage istage=", istage);
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }
        meshes4CNS = [];

        let metaStageInfo = getMetaStageInfo(istage)

        // let stageType = typeof(metaStageInfo.stageType) !== 'undefined' ? metaStageInfo.stageType : "tube";
        // let stageType = typeof(metaStageInfo.stageType) !== 'undefined' ? metaStageInfo.stageType : "extrude";
        let stageType = typeof(metaStageInfo.stageType) !== 'undefined' ? metaStageInfo.stageType : "extrude_round_bottom";

        let useSpline = typeof(metaStageInfo.useSpline) !== 'undefined' ? metaStageInfo.useSpline : true;
        let nbPoints = typeof(metaStageInfo.nbPoints) !== 'undefined' ? metaStageInfo.nbPoints : 20;
        let pStartIdx = typeof(metaStageInfo.pStartIdx) !== 'undefined' ? metaStageInfo.pStartIdx:1;
        let isLoopCourse = typeof(metaStageInfo.isLoopCourse) !== 'undefined' ? metaStageInfo.isLoopCourse : true;
        // let isLoopCourse = typeof(metaStageInfo.isLoopCourse) !== 'undefined' ? metaStageInfo.isLoopCourse : false;
        // let endRound = typeof(metaStageInfo.endRound) !== 'undefined' ? metaStageInfo.endRound : 0;
        let iy = typeof(metaStageInfo.iy) !== 'undefined' ? metaStageInfo.iy : 5;
        let iystep = typeof(metaStageInfo.iystep) !== 'undefined' ? metaStageInfo.iystep : 0;
        let grndW = typeof(metaStageInfo.grndW) !== 'undefined' ? metaStageInfo.grndW : 200;
        let grndH = typeof(metaStageInfo.grndH) !== 'undefined' ? metaStageInfo.grndH : 200;
        let scale = typeof(metaStageInfo.scale) !== 'undefined' ? metaStageInfo.scale : 1;
        let scaleY = typeof(metaStageInfo.scaleY) !== 'undefined' ? metaStageInfo.scaleY : 1;
        let adjx = typeof(metaStageInfo.adjx) !== 'undefined' ? metaStageInfo.adjx : 0;
        let adjy = typeof(metaStageInfo.adjy) !== 'undefined' ? metaStageInfo.adjy : 0;
        let adjz = typeof(metaStageInfo.adjz) !== 'undefined' ? metaStageInfo.adjz : 0;
        // let tubeRadius = typeof(metaStageInfo.tubeRadius) !== 'undefined' ? metaStageInfo.tubeRadius : 5;
        let tubeRadius = typeof(metaStageInfo.tubeRadius) !== 'undefined' ? metaStageInfo.tubeRadius : 8;
        let tubeCAP = typeof(metaStageInfo.tubeCAP) !== 'undefined' ? metaStageInfo.tubeCAP : BABYLON.Mesh.NO_CAP ;
        let nz = typeof(metaStageInfo.nz) !== 'undefined' ? metaStageInfo.nz : 0;
        let pQdiv = typeof(metaStageInfo.pQdiv) !== 'undefined' ? metaStageInfo.pQdiv : 0;
        let pQlist = typeof(metaStageInfo.pQlist) !== 'undefined' ? metaStageInfo.pQlist : [];
        let pQdbg = typeof(metaStageInfo.pQdbg) !== 'undefined' ? metaStageInfo.pQdbg : 0;
        let pQdbgLbl = typeof(metaStageInfo.pQdbgLbl) !== 'undefined' ? metaStageInfo.pQdbgLbl : 0;

        let cnsCS = typeof(metaStageInfo.cnsCS) !== 'undefined' ? metaStageInfo.cnsCS : 0.5; // 0.1;
        let cnsWalkableHeight = typeof(metaStageInfo.cnsWalkableHeight) !== 'undefined' ? metaStageInfo.cnsWalkableHeight : 2;
        let cnsWalkableClimb = typeof(metaStageInfo.cnsWalkableClimb) !== 'undefined' ? metaStageInfo.cnsWalkableClimb : 2;
        let cnsRadius = typeof(metaStageInfo.cnsRadius) !== 'undefined' ? metaStageInfo.cnsRadius : 2.0; // 0.8;
        let cnsReachRadius = typeof(metaStageInfo.cnsReachRadius) !== 'undefined' ? metaStageInfo.cnsReachRadius : 5;
        let cnsNAgent = typeof(metaStageInfo.cnsNAgent) !== 'undefined' ? metaStageInfo.cnsNAgent : 10;
        let cnsAccelX = typeof(metaStageInfo.cnsAccelX) !== 'undefined' ? metaStageInfo.cnsAccelX : 1;
        let cnsSpeedX = typeof(metaStageInfo.cnsSpeedX) !== 'undefined' ? metaStageInfo.cnsSpeedX : 1;
        let cnsCollisionQueryRange = typeof(metaStageInfo.cnsCollisionQueryRange) !== 'undefined' ? metaStageInfo.cnsCollisionQueryRange : 0.5;
        let cnsSeparationWeight = typeof(metaStageInfo.cnsSeparationWeight) !== 'undefined' ? metaStageInfo.cnsSeparationWeight : 3;

        let bubbleEnable = typeof(metaStageInfo.bubbleEnable) !== 'undefined' ? metaStageInfo.bubbleEnable : false;
        let reverse = typeof(metaStageInfo.reverse) !== 'undefined' ? metaStageInfo.reverse : false; // 逆走
        let soloEnable = typeof(metaStageInfo.soloEnable) !== 'undefined' ? metaStageInfo.soloEnable : false;


        let plist = [];

        let mZRot = typeof(metaStageInfo.mZRot) !== 'undefined' ? metaStageInfo.mZRot : {};
        let xzLbl = typeof(metaStageInfo.xzLbl) !== 'undefined' ? metaStageInfo.xzLbl : {};

        let bGround = true;

        if (bGround) { // screencapture
            // 地面
            let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
            meshGrnd.position.y += -0.01;
            meshGrnd.material = new BABYLON.StandardMaterial("mat", scene);
            meshGrnd.material.diffuseTexture = new BABYLON.Texture(grndPath, scene);
	    meshGrnd.material.diffuseTexture.uScale = Math.ceil(grndW/4);
	    meshGrnd.material.diffuseTexture.vScale = Math.ceil(grndH/4);
            meshGrnd.material.specularColor = new BABYLON.Color4(0, 0, 0);
            var aggGrnd = new BABYLON.PhysicsAggregate(meshGrnd, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
            meshAggInfo.push([meshGrnd,aggGrnd]);
        }

console.log("  dtype=", metaStageInfo.dtype);
        if (metaStageInfo.dtype=='xz') {
            // 画像から抜き出した座標をそのまま使う版
            let ix, iz, ii=-1;
            for (let tmp of metaStageInfo.data) {
                ++ii;
                // xzLbl
                let vE = tmp[tmp.length-1];
                if (typeof(vE) == "string") {
                    xzLbl[ii] = vE;
                    // tmp末尾をpopすると元データを壊してしまうので、tmp配列をコピー
                    let tmp2 = []
                    for (let kk=0; kk < tmp.length-1; ++kk) {
                        tmp2.push(tmp[kk]);
                    }
                    tmp = tmp2;
                }
                ix = tmp[0];
                iz = tmp[1];
                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                iy += iystep;
            }

        } else if(metaStageInfo.dtype=='xzR') {
            // ４番目の引数で等差、１つ前の点との距離で差分を調整
            // let iyrate = metaStageInfo.iystep, ii=-1, ix, iz, dis, iy_, iystep;
            let iyrate = iystep*scale/5, ii=-1, ix, iz, dis, iy_;
            let [ix_, iz_, xxx] = metaStageInfo.data[0];
            for (let tmp of metaStageInfo.data) {
                ++ii;
                // 末尾にラベルがあれば切り取る
                let vE = tmp[tmp.length-1];
                if (typeof(vE) == "string") {
                    xzLbl[ii] = vE;
                    let tmp2 = tmp.slice(0, tmp.length-1);
                    tmp = tmp2;
                    // // // tmp.pop();
                    // // // tmp末尾をpopすると元データを壊してしまうので、tmp配列をコピー
                    // // let tmp2 = []
                    // // for (let kk=0; kk < tmp.length-1; ++kk) {
                    // //     tmp2.push(tmp[kk]);
                    // // }
                    // // tmp = tmp2;
                }
                // １レコードのカラム数に応じた処理
                if (tmp.length == 2) {
                    // [x,z]座標のみ
                    [ix,iz] = tmp;
                    dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                    iystep = iyrate*dis;
                    iy += iystep;
                    plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                } else if (tmp.length == 3) {
                    // [x,z]座標＋高さ（絶対座標）
                    [ix,iz,iy_] = tmp;
                    if (iy_ == null) {
                        dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                        iystep = iyrate*dis;
                        iy += iystep;
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                    } else {
                        iy = iy_ + iystep;
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy_*scaleY+adjy, (nz-iz)*scale+adjz));
                    }
                } else if (tmp.length == 4) {
                    // [x,z]座標＋高さ（絶対座標）＋高さ傾き
                    [ix,iz,iy_, iyrate] = tmp;
                    iyrate *= scale/5;
                    if (iy_ == null) {
                        dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                        iystep = iyrate*dis;
                        iy += iystep;
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                    } else {
                        iy = iy_ + iystep;
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy_*scaleY+adjy, (nz-iz)*scale+adjz));
                    }
                }
                [ix_,iz_] = [ix,iz];
            }

        } else if(metaStageInfo.dtype=='xzRR') {
            // ４番目の引数で等差、１つ前の点との距離で差分を調整
            // ５番目の引数で回転角
            let iyrate = iystep*scale/5, ii=-1, ix=0, iz=0, dis, ix_, iz_, iy_, jj=-1, zRot=0, zRot_, _iyrate;
            let iystep2=iystep, iyrate2=iystep2*scale/5, ix2=0, iz2=0, iy2=iy, _iyrate2;
            let iy_2, zRot_2, zRot2=0;
            if (metaStageInfo.data[0].length != 5) {
                console.log("length=", metaStageInfo.data[0].length, metaStageInfo.data[0]);
                console.assert(metaStageInfo.data[0].length == 5);
            }
            // let [ix_, iz_, iy__, iyrate_, zRot] = metaStageInfo.data[0];
            let tmp = metaStageInfo.data[0];
            ix_ = (tmp.length >= 1) ? tmp[0] : 0;
            iz_ = (tmp.length >= 2) ? tmp[1] : 0;
            // iy_ = (tmp.length >= 3) ? tmp[2] : 0;
            iyrate = (tmp.length >= 4) ? tmp[3] : 0;
            zRot = (tmp.length >= 5) ? tmp[4] : 0;
            // cmt = (tmp.length >= 6) ? tmp[5] : null;

            for (let tmp of metaStageInfo.data) {
                ++ii; ++jj;

                // xzLbl
                let vE = tmp[tmp.length-1];
                if (typeof(vE) == "string") {
                    xzLbl[ii] = vE;
                    let tmp2 = tmp.slice(0, tmp.length-1);
                    tmp = tmp2;
                }

                // if (tmp.length <= 6) {
                {
                    // ix = (tmp.length >= 1) ? tmp[0] : 0;
                    // iz = (tmp.length >= 2) ? tmp[1] : 0;
                    ix = tmp[0];
                    iz = tmp[1];
                    iy_ = (tmp.length >= 3) ? tmp[2] : null;  // 高さ 絶対値
                    _iyrate = (tmp.length >= 4) ? tmp[3] : null; // 高さ 傾き
                    zRot_ = (tmp.length >= 5) ? tmp[4] : null;  // ロール
                    // cmt = (tmp.length >= 6) ? tmp[5] : null; //
                    if (_iyrate !== null) {
                        iyrate = _iyrate * scale/5;
                    }
                    if (zRot_ !== null) {
                        zRot = zRot_;
                    }
                    if (iy_ === null) {
                        dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                        iystep = iyrate*dis;
                        iy += iystep;
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                    } else {
                        iy = iy_ + iystep;
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy_*scaleY+adjy, (nz-iz)*scale+adjz));
                    }
                    if (useSpline) {
                        for (let j = 0; j < nbPoints; ++j, ++jj) {
                            mZRot[jj] = zRot;
                        }
                    } else {
                        mZRot[jj] = zRot;
                    }
                }
                [ix_,iz_] = [ix,iz];
            }

        }

        if (1) {
            let plist2 = []
            if(useSpline) {
                // 上記で取得した点列を、スプラインで補間
                const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
                plist2 = catmullRom.getPoints();
            } else {
                plist2 = plist;
            }

            if (isLoopCourse) {
                // 始点、２番目を末尾に追加／ループとする
                // 3D的なループにするには始点だけでは途切れるっぽいので２番目も
                let p0 = plist2[0];
                plist2.push(new BABYLON.Vector3(p0.x, p0.y, p0.z));
                p0 = plist2[1];
                plist2.push(new BABYLON.Vector3(p0.x, p0.y, p0.z));
            }

            // 目的地／中継地取得用の座標値列
            let plist3 = plist2;
            if (reverse) {
                plist3 = plist2.slice().reverse();
            }

            pStart = plist3[pStartIdx].clone();
            pStart2 = plist3[pStartIdx+2].clone();
            pGoal = plist3[plist3.length-10].clone();

            // エージェントの目的地
            let pQ = [];

            if (isLoopCourse) {
                // 周回コース
                if (pQlist.length > 0) {
                    for (let i of pQlist) {
                        let id = i*nbPoints;
                        if (id >= plist3.length) continue;
                        pQ.push(plist3[id].clone())
                    }
                } else if (pQdiv==0) {
                    pQ.push(pStart.clone());
                    pQ.push(plist3[Math.floor(plist3.length/4)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/2)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/4*3)].clone());
                } else {
                    let n = Math.min(plist3.length, pQdiv);
                    let istep=Math.max(1,Math.floor(plist3.length/n));
                    for (let i = 0; i < plist3.length; i+=istep) {
                        pQ.push(plist3[i].clone());
                    }
                }
            } else {
                // 一本道の往復コース
                // 片方、往復させるために逆順も追加
                if (pQlist.length > 0) {
                    for (let i of pQlist) {
                        let id = i*nbPoints;
                        if (id >= plist3.length) continue;
                        pQ.push(plist3[id].clone())
                    }
                    let pQlistRV = pQlist.reverse();
                    for (let i of pQlistRV) {
                        let id = i*nbPoints;
                        if (id >= plist3.length) continue;
                        pQ.push(plist3[id].clone())
                    }

                } else if (pQdiv==0) {
                    pQ.push(pStart.clone());
                    pQ.push(plist3[Math.floor(plist3.length/4)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/2)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/4*3)].clone());
                    //
                    pQ.push(plist3[Math.floor(plist3.length-1)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/4*3)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/2)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/4)].clone());

                } else {
                    let n = Math.min(plist3.length, pQdiv);
                    let istep=Math.max(1,Math.floor(plist3.length/n));
                    for (let i = 0; i < n; i+=istepi) {
                        pQ.push(plist3[i].clone());
                    }
                    for (let i = n-1; i > 0; i-=istepi) {
                        pQ.push(plist3[i].clone());
                    }
                }
            }

            if (pQdbg) {
                // デバッグ表示、pQの位置を球で表示
                let r = 1, c;
                if (pQlist.length > 0) {
                    for (let p of pQ) {
                        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                        mesh.position = p.clone();
                        mesh.position.y += 1.5;
                    }
                }
                let nR = nbPoints*10;
                let nY = nbPoints;
                let j;
                for (let i = 0; i < plist2.length; ++i) {
                    if ((i%nR) == 0) {
                        r = 1.5;
                        c = BABYLON.Color3.Red();
                    } else if ((i%nY) == 0) {
                        r = 0.5;
                        c = BABYLON.Color3.Yellow();
                    } else {
                        continue;
                    }
                    let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: r}, scene);
                    mesh.position = plist2[i].clone();
                    mesh.position.y += 0.5; // r;
                    mesh.material = new BABYLON.StandardMaterial("mat");
                    mesh.material.emissiveColor = c;
                    mesh.material.alpha = 0.3;
                    // mesh.layerMask = 0x10000000;
                    if (pQdbgLbl) {
                        j = Math.floor(i / nbPoints);
// console.log("  ", j);
                        if (j in xzLbl) {
                            let setTextMesh = function(mesh,text) {
                                let dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", {width:60, height:48}, scene);
                                let font = "10px Arial";
                                dynamicTexture.hasAlpha = true;
                                dynamicTexture.drawText(text, null, null, font, "white", "transparent");
                                let mat = new BABYLON.StandardMaterial("mat", scene);
                                mat.diffuseTexture = dynamicTexture;
                                mesh.material = mat;
                            }

                            let meshLbl = BABYLON.MeshBuilder.CreatePlane("mLbl"+j, {size:4, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                            meshLbl.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;   
                            meshLbl.position.y += 0.5;
                            meshLbl.parent = mesh;
                            // meshLbl.layerMask = 0x10000000;
                            let lbltext = xzLbl[j];
                            setTextMesh(meshLbl, lbltext)
                        }
                    }
                    meshAggInfo.push([mesh,null]);
                }
            }

 console.log("  stageType=",stageType);
            if ((stageType=='extrude_square_bottom') || (stageType=='extrude')) {
                // 矩形（凹）で表示、角張ったフライパン(square pan)
                let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 6.0;
                let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 3.0;
                let myShape = [];
                {
                    myShape = [
                        new BABYLON.Vector3(-gardW,  gardH, 0),
                        new BABYLON.Vector3(-gardW,  0    , 0),
                        new BABYLON.Vector3( gardW,  0    , 0),
                        new BABYLON.Vector3( gardW,  gardH, 0)
                    ];
                }
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,
                               cap:tubeCAP};
                if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                let mesh ;
                if (Object.keys(mZRot).length > 0) {
                    const myRotation = (index, distance) => {
                        if (index in mZRot) {
		            return mZRot[index];
                        }
		        return 0;
	            };
                    {
                        options.updatable = true;
                        options.rotationFunction = myRotation;
                    }
// console.log("ExtrudeShapeCustom() call");
                    mesh = BABYLON.MeshBuilder.ExtrudeShapeCustom("extrude", options, scene);
// console.log("ExtrudeShapeCustom() end");
                } else {
                    mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                }
                // mesh.layerMask = 0x30000000;
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                {
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes4CNS.push(mesh);
            }

            if (stageType=='extrude_square_bottom_narrow') {
                // 幅をやや狭く、複数車線用
                // 矩形（凹）で表示
                let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 4.8;
                let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 3.0;
                const myShape = [
                    new BABYLON.Vector3(-gardW,  gardH, 0),
                    new BABYLON.Vector3(-gardW,  0    , 0),
                    new BABYLON.Vector3( gardW,  0    , 0),
                    new BABYLON.Vector3( gardW,  gardH, 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,
                               cap:tubeCAP};
                if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                // let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                let mesh ;
                if (Object.keys(mZRot).length > 0) {
                    const myRotation = (index, distance) => {
                        if (index in mZRot) {
		            return mZRot[index];
                        }
		        return 0;
	            };
                    {
                        options.updatable = true;
                        options.rotationFunction = myRotation;
                    }
                    mesh = BABYLON.MeshBuilder.ExtrudeShapeCustom("extrude", options, scene);
                } else {
                    mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                }
                // mesh.layerMask = 0x30000000;
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                // mesh.material.emissiveColor = BABYLON.Color3.Green();
                // mesh.material.emissiveColor = new BABYLON.Color3(0, 0.5, 0);
                if (1) {
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes4CNS.push(mesh);
            }

            if (stageType=='narrow_with_gravel') {
                // 幅をやや狭く、with 歩道（グラベル）の段差
                let gardWout = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 5.4; // 4.8;
                let gardWin = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 4.0;
                let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 0.2;
                // let gardH2 = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 1.5;
                const myShape = [
                    // new BABYLON.Vector3(-gardWout,  gardH2, 0),
                    new BABYLON.Vector3(-gardWout,  0, 0),
                    new BABYLON.Vector3(-gardWout,  gardH, 0),
                    new BABYLON.Vector3(-gardWin,  gardH, 0),
                    new BABYLON.Vector3(-gardWin,  0    , 0),
                    new BABYLON.Vector3( gardWin,  0    , 0),
                    new BABYLON.Vector3( gardWin,  gardH, 0),
                    new BABYLON.Vector3( gardWout,  gardH, 0),
                    new BABYLON.Vector3( gardWout,  0, 0)
                    // new BABYLON.Vector3( gardWout,  gardH2, 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,
                               cap:tubeCAP};
                if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                let mesh ;
                if (Object.keys(mZRot).length > 0) {
                    const myRotation = (index, distance) => {
                        if (index in mZRot) {
		            return mZRot[index];
                        }
		        return 0;
	            };
                    {
                        options.updatable = true;
                        options.rotationFunction = myRotation;
                    }
                    mesh = BABYLON.MeshBuilder.ExtrudeShapeCustom("extrude", options, scene);
                } else {
                    mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                }
                // mesh.layerMask = 0x30000000;
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                {
                let floorPath2 = floorPath21;
                mesh.material.diffuseTexture = new BABYLON.Texture(floorPath2, scene);
	        mesh.material.diffuseTexture.uScale = 1;
	        mesh.material.diffuseTexture.vScale = 200;
                mesh.material.specularColor = new BABYLON.Color4(0, 0, 0);
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes4CNS.push(mesh);
            }

            if (stageType=='normal_with_gravel') {
                // 幅をやや狭く、with 歩道（グラベル）の段差
                let gardWout = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 5.2;
                let gardWin = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 5.0;
                let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 0.2;
                // let gardH2 = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 1.5;
                const myShape = [
                    // new BABYLON.Vector3(-gardWout,  gardH2, 0),
                    new BABYLON.Vector3(-gardWout,  0, 0),
                    new BABYLON.Vector3(-gardWout,  gardH, 0),
                    new BABYLON.Vector3(-gardWin,  gardH, 0),
                    new BABYLON.Vector3(-gardWin,  0    , 0),
                    new BABYLON.Vector3( gardWin,  0    , 0),
                    new BABYLON.Vector3( gardWin,  gardH, 0),
                    new BABYLON.Vector3( gardWout,  gardH, 0),
                    new BABYLON.Vector3( gardWout,  0, 0)
                    // new BABYLON.Vector3( gardWout,  gardH2, 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,
                               cap:tubeCAP};
                if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                // let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                let mesh = null;
                if (Object.keys(mZRot).length > 0) {
                    const myRotation = (index, distance) => {
                        if (index in mZRot) {
		            return mZRot[index];
                        }
		        return 0;
	            };
                    {
                        options.updatable = true;
                        options.rotationFunction = myRotation;
                    }
                    mesh = BABYLON.MeshBuilder.ExtrudeShapeCustom("extrude", options, scene);
                } else {
                    mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                }
                // mesh.layerMask = 0x30000000;
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                {
                let floorPath2 = floorPath11;
                mesh.material.diffuseTexture = new BABYLON.Texture(floorPath2, scene);
	        mesh.material.diffuseTexture.uScale = 1;
	        mesh.material.diffuseTexture.vScale = 200;
                mesh.material.specularColor = new BABYLON.Color4(0, 0, 0);
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes4CNS.push(mesh);
 //console.log(" mesh=",mesh);
            }

            if (stageType=='wide_with_wall') {
                // デフォルト（矩形（凹）で表示、角張ったフライパン(square pan)）の壁が低い版
                // 
                let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 6.0;
                let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 1.0;
                // // let gardWout = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 5.4; // 4.8;
                // // let gardWin = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 4.0;
                // // let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 0.2;
                // // // let gardH2 = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 1.5;
                const myShape = [
                    // new BABYLON.Vector3(-gardWout,  gardH2, 0),
                    new BABYLON.Vector3(-gardW,  gardH, 0),
                    new BABYLON.Vector3(-gardW,  0    , 0),
                    new BABYLON.Vector3( gardW,  0    , 0),
                    new BABYLON.Vector3( gardW,  gardH, 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,
                               cap:tubeCAP};
                if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                let mesh ;
                if (Object.keys(mZRot).length > 0) {
                    const myRotation = (index, distance) => {
                        if (index in mZRot) {
		            return mZRot[index];
                        }
		        return 0;
	            };
                    {
                        options.updatable = true;
                        options.rotationFunction = myRotation;
                    }
                    mesh = BABYLON.MeshBuilder.ExtrudeShapeCustom("extrude", options, scene);
                } else {
                    mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                }
                // mesh.layerMask = 0x30000000;

                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                {
                let floorPath2 = floorPath01;
                mesh.material.diffuseTexture = new BABYLON.Texture(floorPath2, scene);
	        mesh.material.diffuseTexture.uScale = 1;
	        mesh.material.diffuseTexture.vScale = 300;
                mesh.material.specularColor = new BABYLON.Color4(0, 0, 0);
                // mesh.material.alpha = 0.8;
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes4CNS.push(mesh);
            }

            if (stageType=='extrude_plane') {
                // 線分／平面で表示
                let sW = typeof(metaStageInfo.sW) !== 'undefined' ? metaStageInfo.sW : 20;
                const sW_=sW/2;
                const myShape = [
                    new BABYLON.Vector3(-sW_, 0, 0),
                    new BABYLON.Vector3( sW_, 0, 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true};
                if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                // mesh.layerMask = 0x30000000;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes4CNS.push(mesh);
            }

            let meshSize = 20;
            {
                // ゴール地点のメッシュ
                // let pGoal = linePoint[linePoint.length-1].clone();
                if ((stageType=='extrude_square_bottom') || (stageType=='extrude')) {
                    meshSize = 13;
                } else if (stageType=='extrude_square_bottom_narrow') {
                    meshSize = 10.5;
                } else if (stageType=='narrow_with_gravel') {
                    meshSize = 9;
                } else if (stageType=='normal_with_gravel') {
                    meshSize = 11;
                } else if (stageType=='wide_with_wall') {
                    meshSize = 13;
                }

                if ((stageType=='extrude_square_bottom_narrow')) {
                    meshSize = 10;
                }
                let goalMesh = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: meshSize}, scene);
                goalMesh.position.copyFrom(pGoal);
                goalMesh.position.y += 0.2;
                // goalMesh.layerMask = 0x30000000;
                goalMesh.material = new BABYLON.StandardMaterial("mat");
                goalMesh.material.diffuseTexture = new BABYLON.Texture(goalPath, scene);
                goalMesh.material.alpha = 0.5;
	        goalMesh.material.diffuseTexture.uScale = 8;
	        goalMesh.material.diffuseTexture.vScale = 4;
                meshAggInfo.push([goalMesh,null]);
                // ----------------------------------------
                // メッシュを自動で回転
                const animRatio = scene.getAnimationRatio()
                scene.onBeforeRenderObservable.add(() => {
                    goalMesh.rotate(BABYLON.Axis.Y, 0.002 * animRatio)
                })
            }

            {
                // チェックポイントのメッシュ / checkpoint / cp

                let meshSize = 20;
                if ((stageType=='extrude_square_bottom') || (stageType=='extrude')) {
                    meshSize = 13;
                } else if (stageType=='extrude_square_bottom_narrow') {
                    meshSize = 10.5;
                } else if (stageType=='narrow_with_gravel') {
                    meshSize = 11;
                } else if (stageType=='normal_with_gravel') {
                    meshSize = 11;
                } else if (stageType=='wide_with_wall') {
                    meshSize = 13;
                }

                // 各チェックポイントでの時刻(初期値)
                let ctnow = performance.now();
                ctMElist = [ctnow, ctnow, ctnow, ctnow];
                ctCOMlist = [ctnow, ctnow, ctnow, ctnow];
                let pCPlist = [
                    pGoal.clone(),
                    plist3[Math.floor(plist3.length/4)].clone(),
                    plist3[Math.floor(plist3.length/2)].clone(),
                    plist3[Math.floor(plist3.length/4*3)].clone(),
                ];
                meshCPlist = [];
                for (let pCP of pCPlist) {
                    let meshCP = BABYLON.MeshBuilder.CreateSphere("CP", { diameter: meshSize}, scene);
                    meshCP.position.copyFrom(pCP);
                    meshCP.material = new BABYLON.StandardMaterial("mat");
                    meshCP.material.alpha = 0.0;
                    // meshCP.layerMask = 0x10000000;
                    meshCPlist.push(meshCP);
                    meshAggInfo.push([meshCP,null]);
                }
                // meshCPlist[0].material.alpha = 0.0;
                imeshCPnextME = 1;
                imeshCPnextCOM = 1;
                iloopME = 1;
                iloopCOM = 1;
                passCPMElist = [0, 0, 0, 0];
                passCPCOMlist = [0, 0, 0, 0];
                winLoop = 0;
                bestLapME = -1;
                bestLapCOM = -1;
                bTiggerJumpNextStage = false;
            }

        // ------------------------------------------------------------
            // CNS

            var navmeshParameters = {
                cs: cnsCS, // 0.1,  // 歩行可能なナビメッシュのボクセルサイズ（幅、深さ
                ch: 0.2,  // ボクセルの高さ
                walkableSlopeAngle: 90,  // 歩行可能な最大傾斜の角度[度]
                walkableHeight: 3, // 10, // 3.0,  //  歩行が許可されるボクセル単位の高さ
                walkableClimb: 3, // 10, // 3, // 1,  // 登ることができるボクセル単位のデルタ
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
            let maxAgents = cnsNAgent, iniAgents = cnsNAgent;
            let addAgent = function() {
                let agentParams = {
                    radius: cnsRadius, // 0.8, // 0.1,  // エージェントの半径。[制限: >= 0]
                    reachRadius: cnsReachRadius, // 2, // 0.3, // エージェントが目的地の周囲にこの半径の仮想円内に入ると、オブザーバーに通知されます。デフォルトはエージェントの半径です。
                    height: 0.2, // エージェントの高さ。[制限: > 0]
                    maxAcceleration: 4.0,  // 最大許容加速度。[制限: >= 0]
                    maxSpeed: 10,  // 許容される最大速度。[制限: >= 0]
                    collisionQueryRange: cnsCollisionQueryRange, // 0.5,  // ステアリング動作の対象となる衝突要素がどれだけ近い必要があるかを定義します。[制限: > 0]
                    pathOptimizationRange: 10.0,  // パスの可視性の最適化範囲。[制限: > 0]
                    separationWeight: cnsSeparationWeight // 3.0 // エージェント マネージャーがこのエージェントとの衝突を回避する際の積極性。[制限: >= 0]
                };
                let transform = new BABYLON.TransformNode();
                let meshAgent = null, meshAgent4c2 = null;
                let randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(20*Math.random()-10, 0.1, 5*Math.random()), 0.5);
                {
                    let width = 2.0, height = 0.3;
                    meshAgent = BABYLON.MeshBuilder.CreateBox("cube", { size: width, height: height }, scene);
                    meshAgent.material = new BABYLON.StandardMaterial('mat2', scene);
                    meshAgent.position.y += height/2; // 0.5;
                    meshAgent.parent = transform;
                    // meshAgent.layerMask = 0x10000000;
                    // // --------------------
                    // // camera2用メッシュ
                    //  meshAgent4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:6, radiusTop:2});
                    // meshAgent4c2.position.y += 3;
                    // // meshAgent4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:9, radiusTop:3});
                    // // meshAgent4c2.position.y += 3;
                    // //meshAgent4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:12, radiusTop:4});
                    // // meshAgent4c2.position.y += 6;
                    // // meshAgent4c2.material = new BABYLON.StandardMaterial("mat", scene);
                    // // meshAgent4c2.material.emissiveColor = BABYLON.Color3.Black();
                    // // meshAgent4c2.layerMask = 0x20000000;
                    meshAgent4c2.parent = meshAgent;
                }

                // crowd._maxSpeed = 14.0;
                if (meshAgentList.length == 0) {
                    meshAgent.material.diffuseColor = BABYLON.Color3.Red();
                    agentParams.maxAcceleration = 5.50; agentParams.maxSpeed = 14.0; // 15.0
                    comMesh = meshAgent;
                } else if (meshAgentList.length == 1) {
                    meshAgent.material.diffuseColor = BABYLON.Color3.Green();
                    agentParams.maxAcceleration = 5.60; agentParams.maxSpeed = 12.0;
                } else if (meshAgentList.length == 2) {
                    meshAgent.material.diffuseColor = BABYLON.Color3.Blue();
                    agentParams.maxAcceleration = 5.80; agentParams.maxSpeed = 11.5;
                } else {
                    meshAgent.material.diffuseColor = BABYLON.Color3.Random();
                    meshAgent.material.alpha = 0.5;
                    agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(4.0, 5.8);
                    agentParams.maxSpeed = BABYLON.Scalar.RandomRange(8.0, 11.5);
                }
                meshAgent4c2.material = meshAgent.material;
                meshAgent4c2.material.emissiveColor = meshAgent.material.diffuseColor;

                // if (imymesh == 9) {
                //     setColorModel(transform._ufo, meshAgent.material.diffuseColor);
                // }

                agentParams.maxAcceleration *= cnsSpeedX;
                agentParams.maxSpeed *= cnsSpeedX;
                // ルート指定 -1:pQのみ  0>=:xzRoutesから一本選択
                meshAgent.route = -1;
                // if (pQQ.length > 0) {
                //     meshAgent.route = Math.floor(Math.random()*pQQ.length);
                // }
                let agentIndex = crowd.addAgent(randomPos, agentParams, transform);
                meshAgent._idx = agentIndex;
                meshAgent._spd = agentParams.maxSpeed;
                meshAgent._acc = agentParams.maxAcceleration;
                meshAgentList.push(meshAgent);
                agentParamList.push(agentParams);
                return agentIndex;
            }

            let resetAllAgent = function(meshes4CNS, scene) {
                if (crowd != null) { crowd.dispose(); crowd=null;}
                if (navmeshdebug != null) { navmeshdebug.dispose(); }
                if (navigationPlugin != null) { navigationPlugin.dispose(); }
                while (meshAgentList.length > 0) { meshAgentList.pop().dispose(); };
                navigationPlugin = new BABYLON.RecastJSPlugin();
                navigationPlugin.createNavMesh(meshes4CNS, navmeshParameters);
                if (metaStageInfo.debugMesh) {
                    // デバッグ用のメッシュ
                    navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
                    navmeshdebug.position = new BABYLON.Vector3(0, 0.01, 0);
                    navmeshdebug.material = new BABYLON.StandardMaterial('matdebug', scene);;
                    navmeshdebug.material.diffuseColor = new BABYLON.Color3(0.7, 0.8, 0.9);
                    navmeshdebug.material.alpha = 0.3;
                    meshAggInfo.push([navmeshdebug,null]);
                }
                // crowd
                crowd = navigationPlugin.createCrowd(maxAgents, 0.1, scene);
                crowd._ag2dest = [];
                crowd._spdRate = 1.0;
                crowd._accRate = 1.0;
                meshAgentList = [];
                agentParamList = [];
                for (let i = 0; i < iniAgents; ++i) {
                    let adID = addAgent();
                    resetAgent(adID);
                    crowd._ag2dest.push(1); // 目的地Q1を設定
                }

                // 目的地に到着したら次の目的地を設定する
                crowd.onReachTargetObservable.add((agentInfos) => {
                    let agID = agentInfos.agentIndex;
                    let meshAgent = meshAgentList[agID];
                    let dest = crowd._ag2dest[agID];
                    if (dest == pQ.length-1) {
                        dest = 0;
                    } else {
                        ++dest;
                    }
                    // 次の目的地を設定
                    crowd._ag2dest[agID] = dest;
                    crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ[dest]));
                });
            }

            let resetAgent = function(agID) {
                // スタート地点にテレポート
                let meshAgent = meshAgentList[agID];
                // if (meshAgent.route < 0) {
                {
                    // 初期位置：スタート地点付近にテレポート
                    // // crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(pQ[0]));
                    // ばらけさせて配置させる
                    crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(plist3[(iniAgents-agID)*2]));
                    // 目標位置：次の目標地点に
                    crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ[1]));
                }
            }

            // エージェントの移動速度から向きを変更する
            scene.onBeforeRenderObservable.add(() => {
                for (let i = 0; i < meshAgentList.length; i++) {
                    const meshAgent = meshAgentList[i];
                    // 移動方向と速度を取得
                    const vel = crowd.getAgentVelocity(i);
                    // 速度成分から角度をもとめ、方向とする
                    meshAgent.rotation.y = Math.atan2(vel.x, vel.z);
                }
            });

            if (bRivalCar) {
                resetAllAgent(meshes4CNS, scene);
            }
        }

        // ------------------------------------------------------------
        let skybox = null;
        if (1) {
            // Skybox
            let skyboxTextPath;
            if (skyboxType < 0) {
                let i = Math.floor(skyboxTextPathList.length*Math.random());
                skyboxTextPath = skyboxTextPathList[i];
            } else {
                skyboxTextPath = skyboxTextPathList[skyboxType];
            }
            skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:4000.0}, scene);
            let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skybox.material = skyboxMaterial;
            meshAggInfo.push([skybox,null]);
        }

        resetMyPosi();
    }


    let resetMyPosi = function () {
        if (myMesh==null) {
console.log("myMesh==null")
            return;
        }

        {
            {
                let [id, ttype, tlabel, tpath] = courseInfoList[istage];
                let rval = metaStageInfo[id];
            }
            let p0 = pStart.clone(); p0.y += 2;
            let vrot = 0;
            {
                let p1 = pStart.clone();
                let p3 = pStart2.clone();
                p3.subtractInPlace(p1);
                vrot = Math.atan2(p3.x, p3.z);
            }
            // myMesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
            // myMesh.rotate(BABYLON.Vector3.Up(), vrot);
            resetPosi2(p0, vrot)
            text1.text = ""; // スピード表示をしない
        }
    };

    // --------------------------------------------------

    let crMesh01 = function() {
        // バイク
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 1.3;
        let R90 = Math.PI/2;
        let mesh1 = BABYLON.MeshBuilder.CreateBox("", {width:0.8, height:1.0, depth:2.4}, scene);
        mesh1.position.set(0.0, 0.3+adjy, 0.0);
        mesh1.parent = mesh;
        let mesh2 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.6, height:0.4}, scene);
        mesh2.position.set(0.0, -0.5+adjy, 1.1);
        mesh2.rotation.z = R90;
        mesh2.material = new BABYLON.StandardMaterial('mat', scene);
        mesh2.material.diffuseColor = BABYLON.Color3.Black();
        mesh2.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        // mesh2.material.alpha = 0.7;
        mesh2.parent = mesh;
        let mesh3 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.6, height:0.4}, scene);
        mesh3.position.set(0.0, -0.5+adjy, -1.1);
        mesh3.rotation.z = R90;
        mesh3.material = mesh2.material;
        mesh3.parent = mesh;
        let s = 0.5;
        mesh.scaling.set(s, s, s);
        return mesh;
    }

    let crMesh02 = function() {
        // バイク
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 1.3;
        let R90 = Math.PI/2;
        // 前輪
        let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1.6, diameterX:0.8}, scene);
        mesh2.position.set(0.0, -0.5+adjy, 1.1);
        mesh2.material = new BABYLON.StandardMaterial('mat', scene);
        mesh2.material.diffuseColor = BABYLON.Color3.Black();
        mesh2.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        mesh2.parent = mesh;
        // 後輪
        let mesh3 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1.6, diameterX:0.8}, scene);
        mesh3.position.set(0.0, -0.5+adjy, -1.1);
        mesh3.material = mesh2.material;
        mesh3.parent = mesh;
        // 前輪シャフト
        let mesh14 = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:1.4, diameterBottom:2.2, height:0.7, tessellation:6}, scene);
        mesh14.rotation.x = 0.1;
        mesh14.position.set(0, -0.0+adjy, 1.2);
        mesh14.scaling.set(0.5, 1, 1);
        mesh14.parent = mesh;
        // フード
        let mesh15 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1.4, diameterY:0.6, diameterZ:0.8, arc:0.3, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh15.position.set(0.0, 0.3+adjy, 1.16);
        mesh15.rotationQuaternion = new BABYLON.Quaternion();
        let quat2 = BABYLON.Quaternion.FromEulerAngles(R90, 0, R90);
        mesh15.rotationQuaternion = quat2.multiply(mesh15.rotationQuaternion);
        quat2 = BABYLON.Quaternion.FromEulerAngles(0.2, 0, 0);
        mesh15.rotationQuaternion = quat2.multiply(mesh15.rotationQuaternion);
        mesh15.parent = mesh;
        // ウイング
        // let mesh16 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1.8, diameterY:0.6, diameterZ:0.1, slice:.55, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        let mesh16 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1.4, diameterY:1.2, diameterZ:0.1, slice:.55, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        // let mesh15 = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:1.8, diameterBottom:1.4, height:0.4, tessellation:6}, scene);
        mesh16.position.set(0, -0.35+adjy, 1.4);
        mesh16.rotation.x = R90+0.1;
        mesh16.parent = mesh;
        // 後輪シャフト
        let mesh4 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.7, height:0.4, tessellation:6}, scene);
        mesh4.position.set(0, -0.5+adjy, -0.5);
        mesh4.scaling.set(0.9, 1, 1);
        mesh4.parent = mesh;
        // 後輪カバー（シート
        // let mesh5 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.8, height:0.8, tessellation:6, arc:0.2, enclose:true });
        let mesh5 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.8, height:0.8, tessellation:6, arc:0.4, enclose:true });
        mesh5.rotation.x = R90;
        mesh5.rotation.y = -R90;
        mesh5.position.set(0.0, -0.4+adjy, -1.2);
        mesh5.parent = mesh;
        return mesh;
    }

    let crMesh03 = function() {
        // バイク カブ風
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 1.3;
        let R90 = Math.PI/2;
        // let mesh1 = BABYLON.MeshBuilder.CreateBox("", {width:0.8, height:1.0, depth:2.4}, scene);
        // mesh1.position.set(0.0, 0.3+adjy, 0.0);
        // mesh1.parent = mesh;
        // 前輪
        let mesh2 = BABYLON.MeshBuilder.CreateTorus("", {diameter:1.2, thickness:0.3, tessellation:48, }, scene);
        mesh2.position.set(0.0, -0.5+adjy, 1.2);
        mesh2.rotation.z = R90;
        mesh2.material = new BABYLON.StandardMaterial('mat', scene);
        mesh2.material.diffuseColor = BABYLON.Color3.Black();
        mesh2.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        // mesh2.material.alpha = 0.7;
        mesh2.parent = mesh;
        // 後輪
        let mesh3 = BABYLON.MeshBuilder.CreateTorus("", {diameter:1.2, thickness:0.3, tessellation:48, }, scene);
        mesh3.position.set(0.0, -0.5+adjy, -1.2);
        mesh3.rotation.z = R90;
        mesh3.material = mesh2.material;
        mesh3.parent = mesh;
        // 風よけ
        let mesh5 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1.5, diameterY:3.0, diameterZ:3.0, slice:0.2, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh5.rotation.x = R90;
        mesh5.position.set(0.0, 0.2+adjy, -1.0);
        mesh5.parent = mesh;
        // 前輪カバー
        let mesh12 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:0.5, diameterY:1.5, diameterZ:1.5, slice:0.4, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh12.rotation.x = -0.8;
        mesh12.position.set(0.0, -0.3+adjy, 1.0);
        mesh12.parent = mesh;
        // ハンドル
        let mesh13 = BABYLON.MeshBuilder.CreateBox("", {width:1.6, height:0.2, depth:0.2}, scene);
        mesh13.position.set(0.0, 1.0+adjy, 0.2);
        mesh13.parent = mesh;
        // エンジンー後輪
        let mesh21 = BABYLON.MeshBuilder.CreateBox("", {width:0.6, height:0.4, depth:1.4}, scene);
        mesh21.position.set(0.0, -0.5+adjy, -0.5);
        mesh21.parent = mesh;
        // シート
        let mesh23 = BABYLON.MeshBuilder.CreateBox("", {width:0.6, height:0.8, depth:0.6}, scene);
        mesh23.position.set(0.0, 0.1+adjy, -0.7);
        mesh23.parent = mesh;
        // 後輪カバー
        // 前輪カバー
        let mesh22 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:0.5, diameterY:1.6, diameterZ:1.6, slice:0.4, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh22.position.set(0.0, -0.3+adjy, -1.2);
        mesh22.parent = mesh;
        return mesh;
    }

    let crMesh04 = function() {
        // バイク  スポーツ風
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 1.3;
        let R90 = Math.PI/2;
        // let mesh1 = BABYLON.MeshBuilder.CreateBox("", {width:0.8, height:1.0, depth:2.4}, scene);
        // mesh1.position.set(0.0, 0.3+adjy, 0.0);
        // mesh1.parent = mesh;
        // 前輪
        let mesh2 = BABYLON.MeshBuilder.CreateTorus("", {diameter:1.2, thickness:0.3, tessellation:48, }, scene);
        mesh2.position.set(0.0, -0.5+adjy, 1.2);
        mesh2.rotation.z = R90;
        mesh2.material = new BABYLON.StandardMaterial('mat', scene);
        mesh2.material.diffuseColor = BABYLON.Color3.Black();
        mesh2.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        // mesh2.material.alpha = 0.7;
        mesh2.parent = mesh;
        // 後輪
        let mesh3 = BABYLON.MeshBuilder.CreateTorus("", {diameter:1.2, thickness:0.3, tessellation:48, }, scene);
        mesh3.position.set(0.0, -0.5+adjy, -1.2);
        mesh3.rotation.z = R90;
        mesh3.material = mesh2.material;
        mesh3.parent = mesh;
        // フロント
        let mesh11 = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:0.2, diameterBottom:1.0, height:0.6, tessellation:6}, scene);
        mesh11.rotation.x = R90+0.3;
        mesh11.scaling.set(1, 1, 0.8);
        mesh11.position.set(0.0, 0.5+adjy, 1.2);
        mesh11.parent = mesh;
        // 前輪カバー
        let mesh12 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1.6, diameterY:0.6, arc:0.6, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh12.rotation.z = R90;
        mesh12.rotation.x = 1;
        mesh12.position.set(0.0, -0.1+adjy, 0.6);
        mesh12.parent = mesh;
        // 後輪カバー
        let mesh21 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1.6, diameterY:0.6, arc:0.6, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh21.rotation.z = -R90;
        mesh21.rotation.x = 2.4;
        mesh21.position.set(0.0, -0.2+adjy, -0.6);
        mesh21.parent = mesh;
        // マフラー
        let mesh22 = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:0.2, diameterBottom:0.3, height:1.0, tessellation:6}, scene);
        mesh22.rotation.x = R90+0.3;
        mesh22.rotation.y = -0.1;
        mesh22.position.set(0.3, -0.5+adjy, -1.0);
        mesh22.parent = mesh;
        return mesh;
    }

    // Player/Character state
    let state = "IN_AIR";
    let inAirSpeed = 10.0;
    let onGroundSpeed = 5.0;
    let jumpHeight = 3;
    let inputDirection = new BABYLON.Vector3(0,0,1); // 方向（前後のみ）を示すベクトル
    let forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    // let characterGravity = new BABYLON.Vector3(0, -18, 0);
    let ga = 9;
    // let characterGravity = new BABYLON.Vector3(0, -9, 0);
    let characterGravity = BABYLON.Vector3.Down().scale(ga);

    // Physics shape for the character
    let h = 0.01, r = 0.01;
    // let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: h, radius: r}, scene);
    let displayCapsule = null;
    if (ivehicle == 0) {
        displayCapsule = crMesh01();
    } else if (ivehicle == 1) {
        displayCapsule = crMesh02();
    } else if (ivehicle == 2) {
        displayCapsule = crMesh03();
    } else {
        displayCapsule = crMesh04();
    }
    let myMesh = displayCapsule;

    myMesh._pold = myMesh.position.clone();
    myMesh.rotationQuaternion = new BABYLON.Quaternion();
    myMesh._vEuler = new BABYLON.Vector3(0,0,0); // idevice=1時の移動用・オイラー角
    myMesh._quat = new BABYLON.Quaternion(); // idevice=1時の移動用
    myMesh._roll = 0; // idevice=1時の移動用
    myMesh._resetPosture = 0; // idevice=2時の姿勢リセットフラグ
    // myMesh._vel = 0.3; // 速度：v3F への係数
    myMesh._vel = 1; // 速度：v3F への係数
    myMesh._velP = 0.004, myMesh._velM = -0.010; // 加速、減速の増分
    // myMesh._velMax = 10.0, myMesh._velMin = 0.1;
    myMesh._velMax = 2.2, myMesh._velMin = 0.3, myMesh._velNor = 1.0;

    let updir = BABYLON.Vector3.Up(); // gdir.negate();

    let characterPosition = new BABYLON.Vector3(0, 10, 0);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
    camera.lockedTarget = displayCapsule;

    displayCapsule.material = new BABYLON.StandardMaterial('mat', scene);
    displayCapsule.material.diffuseColor = BABYLON.Color3.Blue();
    displayCapsule.material.alpha = 0.7;
    // displayCapsule.material.wireframe = 1;

    // State handling
    let getNextState = function(supportInfo) {
        if (state == "IN_AIR") {
            if (supportInfo.supportedState == BABYLON.CharacterSupportedState.SUPPORTED) {
                return "ON_GROUND";
            }
            return "IN_AIR";
        } else if (state == "ON_GROUND") {
            if (supportInfo.supportedState != BABYLON.CharacterSupportedState.SUPPORTED) {
                return "IN_AIR";
            }
            // if (keyAction.jump) {
            if (act.spc) {
                return "START_JUMP";
            }
            return "ON_GROUND";
        } else if (state == "START_JUMP") {
            return "IN_AIR";
        }
    }
    let getDesiredVelocity = function(deltaTime, supportInfo, characterOrientation_, currentVelocity) {
        let nextState = getNextState(supportInfo);
        if (nextState != state) {
            state = nextState;
        }
        let upWorld = characterGravity.normalizeToNew();
        upWorld.scaleInPlace(-1.0);
        let forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation_);
        if (state == "IN_AIR") {
            // let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let desiredVelocity = inputDirection.scale(inAirSpeed*myMesh._vel).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            // let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            let desiredVelocity = inputDirection.scale(onGroundSpeed*myMesh._vel).applyRotationQuaternion(characterOrientation_);
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
        if (act.mrl != 0) {
            let v = myMesh._roll;
            let quatR = BABYLON.Quaternion.RotationAxis(updir, v*0.02); //理論値_roll に対する旋回
        }
        let desiredLinearVelocity = getDesiredVelocity(dt, support, myMesh._quat, characterController.getVelocity());
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
    let resetPosi2 = function(p, rot) {
        characterController.setVelocity(new BABYLON.Vector3(0, 0, 0));
        characterController.setPosition(p);
        // 向きをリセット Z軸＋方向を向かせる
        characterOrientation = BABYLON.Quaternion.FromEulerVector(new BABYLON.Vector3(0, rot, 0));
        displayCapsule.rotationQuaternion = characterOrientation.clone();
        myMesh._vEuler = new BABYLON.Vector3(0,rot,0);
        myMesh._quat = displayCapsule.rotationQuaternion.clone();
    }


    let idevice=1; // 疑似飛行機モード：カーソルで簡単操作／宙返りや背面飛行ができないけど
    let act = {mfb:0, mrl:0, mud:0, rrl:0, ctrl:0, ent:0, spc:0};
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
        {
            act.mud=0;
            if (map["ArrowUp"]) {
                act.mud=1;
            } else if (map["ArrowDown"]) {
                act.mud=-1;
            }
            act.mrl=0;
            if (map["ArrowRight"]) {
                act.mrl=1;
            } else if (map["ArrowLeft"]) {
                act.mrl=-1;
            }
        }
        // 共通
        act.ctrl=0;
        if (map["ctrl"]) { act.ctrl = 1; }
        act.ent=0;
        if (map["Enter"]) { act.ent=1; }
        act.spc=0;
        if (map[" "]) { act.spc=1; }
        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["c"]) {
                // camera
                cooltime_act = cooltime_actIni;
                icamera = (icamera+1)%ncamera;
                console.log("camera=", icamera);
                setCAM3(icamera);
            }
            if (map["n"] || map["b"]) {
                // Change Stage
                cooltime_act = cooltime_actIni;
                if (map["n"]) {
                    istage = (istage+1)%nstage;
                } else {
                    istage = (istage+nstage-1)%nstage;
                }
                console.log("camera=", icamera);
                createStage(istage);
                resetMyPosi();
            }
        }
    });

    scene.onBeforeRenderObservable.add(() => {
        let quat = myMesh.rotationQuaternion;
        if (idevice==1) {
            // 機体操作２：ロール角度に応じたヨー回転と自動補正
            const R90 = Math.PI/2;
            {
                let v3F = BABYLON.Vector3.Forward().applyRotationQuaternion(myMesh._quat); // 進行方向
                let v3HB = updir.cross(v3F).normalize(); // 水平-binormal方向
                let v3HF = updir.cross(v3HB).normalize(); // 水平-全面方向
                // 見た目の上方向
                let viewU = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                let viewF = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                if (act.mud != 0) {
                    if (act.mud > 0) {
                        // 加速
                        myMesh._vel = BABYLON.Lerp(myMesh._vel, myMesh._velMax, 0.01); // 等比で加速
                    } else {
                        // 減速
                        myMesh._vel = BABYLON.Lerp(myMesh._vel, myMesh._velMin, 0.05); // 等比で減衰
                    }
                } else {
                    // 加減速無し  .. ゆっくりと _velNor に減速・加速
                    myMesh._vel = BABYLON.Lerp(myMesh._vel, myMesh._velNor, 0.001);
                }
                // ヨー回転
                if (act.mrl != 0) {
                    let v = 0.05*act.mrl;
                    myMesh._roll += v;
                    let raduu = Math.acos(viewU.dot(updir));
                    let vdotHB = viewU.dot(v3HB);
                    if ((v*vdotHB < 0)  || (v*vdotHB >= 0 && raduu < R90)) {
                        let quatR = BABYLON.Quaternion.RotationAxis(viewF, -v);
                        quat = quatR.multiply(quat);
                        myMesh.rotationQuaternion = quat;
                    }
                }
                if (myMesh._roll != 0) {
                    // roll に応じたヨー
                    let v = myMesh._roll;
                    let quatR = BABYLON.Quaternion.RotationAxis(updir, v*0.02); //理論値_roll に対する旋回
                    myMesh._quat = quatR.multiply(myMesh._quat);
                    quat = quatR.multiply(quat);
                    myMesh.rotationQuaternion = quat;
                    myMesh._roll = BABYLON.Lerp(v, 0, 0.02); // 等比で減衰
                    if (Math.abs(myMesh._roll) < 1e-3) {
                        myMesh._roll = 0;
                    }
                }
                // 姿勢修正 .. キー入力無しOR加速時
                if ((act.mud >= 0) && (act.mrl == 0)) {
                    let quat0 = BABYLON.Quaternion.FromLookDirectionLH(v3HF, updir);
                    // let rlerp = 0.02;
                    let rlerp = 0.02 + myMesh._vel / 20;
                    myMesh._quat = BABYLON.Quaternion.Slerp(myMesh._quat, quat0, rlerp);
                    quat = BABYLON.Quaternion.Slerp(quat, quat0, rlerp);
                    myMesh.rotationQuaternion = quat;
                }
            }
        }
    });


    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // ------------------------------
    // スピードメーター（上部中央）
    var text1 = new BABYLON.GUI.TextBlock();
    // text1.text = "Ready!";
    // text1.text = "";
    text1.color = "white";
    text1.fontSize = 24; // 24;
    text1.height = "36px";
//    text1.zIndex = -9; // 背面に隠しておく
    text1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text1);

    let setText1 = function(val) {
        val = Math.floor(val*3.6) // [m/s]を [km/h]に直す
        text1.text = "" + val + " [km/h]"
    }

    // ------------------------------
    // メッセージ（数秒後にフェードアウト）
    var text2 = new BABYLON.GUI.TextBlock();
    // text2.text = "Ready!";
    text2.color = "white";
    text2.fontSize = 24; // 24;
    text2.height = "36px";
    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    advancedTexture.addControl(text2);

    let clearText2 = function() {
        text2.text = "";
    }

    let setText2 = function(val) {
        text2.text = "" + val;
        setTimeout(clearText2, 10*1000); // 10[sec]
    }

    // ----------------------------------------
    // 勝利条件時の処理

    // 自動で次のステージに変更
    let jumpNextStage = function() {
        // let i = istagelist.indexOf(istage);
        // console.assert(i >= 0);
        // i = (i+1)%istagelist.length;
        // istage = istagelist[i];
        istage = (istage+1)%nstage;
        createStage(istage);
        resetMyPosi();
    }
    // ３秒後にステージ変更を呼び出す
    let tiggerJumpNextStage = function() {
        if (bTiggerJumpNextStage == false) {
            setTimeout(jumpNextStage, 3000);
        }
        bTiggerJumpNextStage = true
    }

    // ----------------------------------------

    await BABYLON.InitializeCSG2Async();

    setCAM3(icamera);

    createStage(istage);

    return scene;
} 

// ######################################################################

window.initFunction = async function() {
                    await Recast();
                    }
window.initFunction();
export var createScene = createScene_test_2003;


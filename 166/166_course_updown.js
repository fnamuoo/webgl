//  Babylon.js ：UpDownなコースを作る

let istage = 11;

    // // ステージ情報
    // const stageInfoList = [
    //     // istage, label, fpathCourseImg
    //     [[11102], "0.ローラーコースター/常にUP", ""],
    //     [[12103], "1.ローラーコースター/法線修正なし", ""],
    //     [[13104], "2.ローラーコースター/裏面あり", ""],
    //     [[14102], "3.のぼり（片道", ""],
    //     [[15401], "4.コーラス", ""],
    //     [[26201], "5.alg_01_らせん", ""],
    //     [[26202], "6.alg_02_ランダム(上昇のみ)", ""],
    //     [[26203], "7.alg_03_ランダムウォーク(上昇のみ)", ""],
    //     [[26301], "8.alg_11_grid内ウォーク", ""],
    //     [[26302], "9.alg_11_grid（欠陥あり）ウォーク", ""],
    //     [[26206], "10.alg_04_ランダムUpDown(片道)", ""],
    //     [[26208], "11.alg_04_ランダムUpDown(周回)", ""],
    // ];


// ######################################################################

// let fpathBlueRed = "./textures/blueRed.png";
// const SCRIPT_901 = "./grid-path-algorithm.js";

let fpathBlueRed = "https://raw.githubusercontent.com/fnamuoo/webgl/main/166//textures/blueRed.png";
const SCRIPT_901 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/166/grid-path-algorithm.js";

let GridPathAlgo = null;
await import(SCRIPT_901).then((obj) => { GridPathAlgo = obj; });


export var createScene_test_2012 = async function () {
    var scene = new BABYLON.Scene(engine);

    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 100, new BABYLON.Vector3(0, 0, 0));
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        return _camera;
    }
    let crCamera3 = function(meshTrg) {
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 0;
        _camera.radius = 1;
        _camera.heightOffset = 0.1;
        _camera.cameraAcceleration = 0.4;
        _camera.maxCameraSpeed = 30;
        _camera.lockedTarget = meshTrg;
        return _camera;
    }
    let crCamera3_1 = function(meshTrg) {
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 0;
        _camera.radius = 6;
        _camera.heightOffset = 2.5;
        _camera.cameraAcceleration = 0.6;
        _camera.maxCameraSpeed = 30;
        _camera.lockedTarget = meshTrg;
        return _camera;
    }
    let crCamera3_2 = function(meshTrg) {
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 3;
        _camera.heightOffset = 0.5;
        _camera.cameraAcceleration = 0.01;
        _camera.maxCameraSpeed = 30;
        _camera.lockedTarget = meshTrg;
        return _camera;
    }
    let crCamera4 = function(meshTrg) {
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 0;
        _camera.radius = 1;
        _camera.heightOffset = 0.1;
        _camera.cameraAcceleration = 0.4;
        _camera.maxCameraSpeed = 30;
        _camera.lockedTarget = meshTrg;
        scene.onBeforeRenderObservable.add((scene) => {
            let quat = camera.lockedTarget.rotationQuaternion;
             camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        });
        return _camera;
    }
    // camera = crCameraDef();

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var light2 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, -1, 0), scene);
    light2.intensity = 0.3;

    let crGrnd = function(size=10) {
        // 平面地面
        let mesh = BABYLON.MeshBuilder.CreateGround("ground", {width: size, height: size}, scene);
        mesh.position.y = -0.5;
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        // mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
        return mesh;
    }
// //    crGrnd(100);
    crGrnd(300);

    // let istage = 11;
    // ステージ情報（１ステージに複数コース可）
    const stageInfoList = [
        // istage, label, fpathCourseImg
        [[11102], "0.ローラーコースター/常にUP", ""],
        [[12103], "1.ローラーコースター/法線修正なし", ""],
        [[13104], "2.ローラーコースター/裏面あり", ""],
        [[14102], "3.のぼり（片道", ""],
        [[15401], "4.コーラス", ""],
        [[26201], "5.alg_01_らせん", ""],
        [[26202], "6.alg_02_ランダム(上昇のみ)", ""],
        [[26203], "7.alg_03_ランダムウォーク(上昇のみ)", ""],
        [[26301], "8.alg_11_grid内ウォーク", ""],
        [[26302], "9.alg_11_grid（欠陥あり）ウォーク", ""],
        [[26206], "10.alg_04_ランダムUpDown(片道)", ""],
        [[26208], "11.alg_04_ランダムUpDown(周回)", ""],
    ];

    let nstage = stageInfoList.length;

    // コースのメタ・メッシュ情報
    const _courseMetaMeshInfo = {
        10101:{// label:"custom_debug",
               dtype:"xzy",
               meshType:"line",
               // grndW:10, grndH:10, cnsNAgent:0, scale:0.2,  scaleY:0.5, 
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.5, 
               cid:101,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },
        11102:{dtype:"xzy",
               // meshType:"extrude",
               // meshType:"ribbon",
               meshType:"ribbon_up", // 常にUP
               // grndW:10, grndH:10, cnsNAgent:0, scale:0.2,  scaleY:0.5, 
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.5, 
               cid:101,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },
        12103:{dtype:"xzy",
               // meshType:"extrude", // 始点・終点のロールを一致
               meshType:"ribbon", // 始点・終点のロールを一致
               // grndW:10, grndH:10, cnsNAgent:0, scale:0.2,  scaleY:0.5, 
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.5, 
               cid:101,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },
        13104:{dtype:"xzy",
               meshType:"ribbon_rv", // 裏面あり
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.5, 
               cid:101,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        14102:{// label:"custom_debug",
               dtype:"xzy",
               meshType:"ribbon_up",
               isLoopCourse:false,
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.5, 
               cid:102,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        15401:{// label:"custom_debug",
               dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.1, 
               cid:401,
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26201:{// label:"custom_debug",
               cid:201,
               isLoopCourse:false,
               dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.1, 
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26202:{// label:"custom_debug",
               cid:202,
               isLoopCourse:false,
               dtype:"xzy",
               meshType:"ribbon",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.1, 
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26203:{// label:"custom_debug",
               cid:203,
               isLoopCourse:false,
               dtype:"xzy",
               // meshType:"ribbon",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.1, 
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26301:{// label:"custom_debug",
               cid:301,
               isLoopCourse:false,
               dtype:"xzy",
               meshType:"ribbon",
               // meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1, 
               adjx:225, adjz:-225, adjy:5,
               nbPoints:100,
              },

        26302:{// label:"custom_debug",
               cid:302,
               isLoopCourse:false,
               dtype:"xzy",
               meshType:"ribbon",
               // meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1, 
               adjx:225, adjz:-225, adjy:5,
               nbPoints:100,
              },

        26204:{// label:"custom_debug",
               cid:204,
               isLoopCourse:false,
               dtype:"xzy",
               // meshType:"ribbon",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.1, 
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26205:{// label:"custom_debug",
               cid:205,
               isLoopCourse:false,
               dtype:"xzy",
               // meshType:"ribbon",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.1, 
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26206:{cid:206,
               isLoopCourse:false,
               dtype:"xzy",
               // meshType:"ribbon",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.1, 
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26207:{cid:207,
               isLoopCourse:true, // false,
               dtype:"xzy",
               // meshType:"ribbon",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.1, 
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26208:{cid:208,
               isLoopCourse:true, // false,
               dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.1, 
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },


    };

    const R10 = Math.PI/18;
    const R30 = Math.PI/6;
    const R45 = Math.PI/4;
    const R60 = Math.PI/3;
    const R90 = Math.PI/2;
    const R120 = Math.PI*2/3;
    const R135 = Math.PI*3/4;
    const R150 = Math.PI*5/6;
    const R180 = Math.PI;
    const R270 = Math.PI*3/2;
    const R360 = Math.PI*2;

    // コースの幾何情報
    const _courseGeoInfo = {
        // ------------------------------
        101:{
            // ローラーコースター
            type:"program",
            metaInfo:[
                {shape:"s", size:50, div:4},
                {shape:"ssin", h:50, size:100, div:8},
                {shape:"s", h:0, size:50, div:4},
                {shape:"l", h:-30, rot:R360+R90, div:20},
                {shape:"s", h:0, div:4},
                {shape:"l", rot:R90, size:100, div:8},
                {shape:"s", h:0, size:50, div:4},
                {shape:"ssin", h:-20},
                {shape:"ssin", h:+10},
                {shape:"s", h:0},
                {shape:"l", rot:R180, size:50, div:8},
                {shape:"s", size:50, div:4},
                {shape:"r", rot:R90, size:100, div:8},
                {shape:"s", size:100, div:8},
                {shape:"l", h:20, rot:R270, size:50, div:12},
                {shape:"s", h:0, size:50, div:4},
                {shape:"ssin", h:-10, size:150, div:12},
                {shape:"s", h:0, size:50, div:4},
                {shape:"l", h:-20, rot:R270, size:50, div:12},
                {shape:"s", h:0, size:50, div:4},
                {shape:"r", rot:R90, size:50, div:4},
            ],
        },

        102:{
            // １レーン、ループ橋で山登り（前半
            type:"program",
            metaInfo:[
                {shape:"s", size:10, div:4},
                {shape:"s", h:0, size:10, div:4},
                {shape:"s", h:1, size:10, div:4},
                {shape:"r", h:3, rot:R270, size:10, div:12},
                {shape:"s", h:1, size:8, div:4},
                {shape:"l", rot:R90, size:10, div:4},
                {shape:"s", h:1, size:10, div:4},
                {shape:"s", h:1, size:10, div:4},
                {shape:"s", h:1, size:10, div:4},
                {shape:"r", h:2, rot:R180, size:10, div:8},
                {shape:"r", h:1, rot:R90, size:8, div:4},
                {shape:"l", h:1, rot:R90, size:8, div:4},
                {shape:"s", size:10, div:4},
                {shape:"s", size:10, div:4},
                {shape:"s", size:10, div:4},
                {shape:"s", size:10, div:4},
                {shape:"s", size:10, div:4},
                {shape:"r", h:2, rot:R180, size:8, div:8},
                {shape:"r", h:1, rot:R90, size:8, div:4},
                {shape:"s", size:8, div:4},
                {shape:"s", size:8, div:4},
                {shape:"l", rot:R90, size:10, div:4},
                {shape:"s", size:8, div:4},
                {shape:"r", rot:R90, size:10, div:4},
                {shape:"s", size:8, div:4},
                {shape:"s", size:8, div:4},
                {shape:"s", size:8, div:4},
                {shape:"l", rot:R90, size:10, div:4},
                {shape:"l", rot:R90, size:10, div:4},
                {shape:"s", size:8, div:4},
                {shape:"l", rot:R90, size:10, div:4},
                {shape:"s", size:8, div:4},
                {shape:"s", size:8, div:4},
                {shape:"s", size:8, div:4},
                {shape:"s", h:0, size:8, div:4},
                {shape:"s", h:0, size:8, div:4},
            ],
        },

        401:{
            // https://katlas.org/wiki/3_1
            // https://katlas.org/wiki/File:Hart-knot-C.jpg
            //   +--------+--------+
            //   | ／￣＼＿_／￣＼ |
            //   |│     ＿_     │|
            //   | ＼  ／ : ＼  ／ |
            //   +---＼---+-- ＼---+
            //   | ／  ＼ : ／  ＼ |
            //   |│     ／      │|
            //   | ＼＿／ : ＼＿／ |
            //   +--------+--------+
            type:"program",
            metaInfo:[
                {shape:"ssin", h:12, size:75, div:8},
                {shape:"s", h:0, size:50, div:4},
                {shape:"r", h:0, size:50, rot:R180, div:8},
                {shape:"l", rot:R90, div:4},
                {shape:"rsin", h:-12, rot:R180, div:8},
                {shape:"s", h:0, rot:R90, div:4},
                {shape:"ssin", h:12, size:100},
                {shape:"s", h:0, size:50, div:4},
                {shape:"rsin", h:-12, size:50, rot:R180, div:8},
                {shape:"s", h:0, size:100, rot:R90, div:4},
                {shape:"rsin", h:12, size:50},
                {shape:"s", h:0},
                {shape:"s", h:0},
                {shape:"r", h:-12,rot:R180, div:8},
                {shape:"s", h:0, size:50, rot:R90, div:4},
            ],
        },

        201:{type:"alg_0201",},
        202:{type:"alg_0202",},
        203:{type:"alg_0203",},
        301:{type:"alg_0301",},
        302:{type:"alg_0302",},
        204:{type:"alg_0204",},
        205:{type:"alg_0205",},
        206:{type:"alg_0206",},
        207:{type:"alg_0207",},
        208:{type:"alg_0208",},

    };

    let createCourseData = function(courseGeo) {
        // 3D空間の点列を作成(コースの幾何情報(coourseGeo)から)
        courseGeo.data = []; // xzy座標
        courseGeo.mZRot = {}; // z回転、ロール
        courseGeo.xzLbl = []; // ラベル表示
        if (courseGeo.type == 'program') {
            // metaInfo の情報をもとに点列を作成
            // 初期値をデフォルトとして用いる
            let meta0 = courseGeo.metaInfo[0];
            let [x,y,z] = typeof(meta0.xyz) !== 'undefined' ? meta0.xyz : [0,0,0]; //位置
            let dir = typeof(meta0.dir) !== 'undefined' ? meta0.dir : R270; //方向(xz平面／y回転)
            let rot = typeof(meta0.rot) !== 'undefined' ? meta0.rot : R90; //L/R時の回転角
            let div = typeof(meta0.div) !== 'undefined' ? meta0.div : 4; //分割数
            let size = typeof(meta0.size) !== 'undefined' ? meta0.size : 50; // ブロック長
            let size2, size0, sizee, sizestep;
            let h = typeof(meta0.h) !== 'undefined' ? meta0.h : 0; // 高さ
            let vrot = typeof(meta0.vrot) !== 'undefined' ? meta0.vrot : R360; // 縦ロールの回転角
            let hshift = typeof(meta0.hshift) !== 'undefined' ? meta0.hshift : 10;//縦ロールの水平移動
            let shape = typeof(meta0.shape) !== 'undefined' ? meta0.shape : "st"; //形状
            let nloop = typeof(meta0.nloop) !== 'undefined' ? meta0.nloop : 1; //ループ回数
            let zrot = typeof(meta0.zrot) !== 'undefined' ? meta0.zrot : 0; // Y軸回転、ロールの回転角
            let x0,y0,z0 , xe,ye,ze, xstep,ystep,zstep, dir0,dirg,dire,dirstep, xg,yg,zg, yrad, yradstep, cmnt;
            let ii = 0;
            for (let meta of courseGeo.metaInfo) {
                h = typeof(meta.h) !== 'undefined' ? meta.h : h; // 高さ
                rot = typeof(meta.rot) !== 'undefined' ? meta.rot : rot; //L/R時の回転角
                div = typeof(meta.div) !== 'undefined' ? meta.div : div; //分割数
                shape = typeof(meta.shape) !== 'undefined' ? meta.shape : shape; //形状
                nloop = typeof(meta.nloop) !== 'undefined' ? meta.nloop : nloop; //ループ回数
                size = typeof(meta.size) !== 'undefined' ? meta.size : size; // ブロック長
                size2 = typeof(meta.size2) !== 'undefined' ? meta.size2 : size; // ブロック長
                vrot = typeof(meta.vrot) !== 'undefined' ? meta.vrot : vrot;
                hshift = typeof(meta.hshift) !== 'undefined' ? meta.hshift : hshift;
                cmnt = typeof(meta.cmnt) !== 'undefined' ? meta.cmnt : ""; // コメント
                zrot = typeof(meta.zrot) !== 'undefined' ? meta.zrot : zrot; // Y軸回転、ロールの回転角
                dirstep = rot/div;
                yradstep = R180/div;
                sizestep = (size2-size)/div;
                if (cmnt != "") {
                    courseGeo.xzLbl[ii] = cmnt;
                }
                if (shape == "s") {
                    //直進
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0 = x; y0 = y; z0 = z; dir0 = dir;
                        xe = x+size*Math.cos(dir);
                        ye = y+h;
                        ze = z+size*Math.sin(dir);
                        dire = dir;
                        xstep=(xe-x0)/div; zstep=(ze-z0)/div; ystep=(ye-y0)/div;
                        for (let i=0; i < div; ++i, ++ii){
                            x = x0 + xstep*i;
                            y = y0 + ystep*i;
                            z = z0 + zstep*i;
                            courseGeo.data.push([x, z, y]);
                            if (zrot != null) {
                                courseGeo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }
                } else if (shape == "l") {
                    // 左折
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir;
                        dirg=dir-R90; dire=dir0-rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+size*Math.cos(dir0-rot+R90); ze=zg+size*Math.sin(dir0-rot+R90); ye=y+h;
                        ystep = (ye-y0)/div;
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0-dirstep*i+R90;
                            x=xg+size*Math.cos(dir);
                            y=y0+ystep*i;
                            z=zg+size*Math.sin(dir);
                            courseGeo.data.push([x, z, y]);
                            if (zrot != null) {
                                courseGeo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }
                } else if (shape == "r") {
                    // 右折
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir;
                        dirg=dir+R90; dire=dir0+rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+size*Math.cos(dir0+rot-R90); ze=zg+size*Math.sin(dir0+rot-R90); ye=y+h;
                        ystep = (ye-y0)/div;
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0+dirstep*i-R90;
                            x=xg+size*Math.cos(dir);
                            y=y0+ystep*i;
                            z=zg+size*Math.sin(dir);
                            courseGeo.data.push([x, z, y]);
                            if (zrot != null) {
                                courseGeo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }
                } else if (shape == "ssin") {
                    //直進＋高さを sin で変化
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0 = x; y0 = y; z0 = z; dir0 = dir;
                        xe = x+size*Math.cos(dir);
                        ye = y+h;
                        ze = z+size*Math.sin(dir);
                        dire = dir;
                        xstep=(xe-x0)/div; zstep=(ze-z0)/div; ystep=(ye-y0)/div;
                        yrad = -R90;
                        for (let i=0; i < div; ++i, ++ii){
                            x = x0 + xstep*i;
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z = z0 + zstep*i;
                            courseGeo.data.push([x, z, y]);
                            if (zrot != null) {
                                courseGeo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; }
                        if (dir>=R360) { dir-=R360; }
                    }
                } else if (shape == "lsin") {
                    //左折＋高さを sin で変化
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir;
                        dirg=dir-R90; dire=dir0-rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+size*Math.cos(dir0-rot+R90); ze=zg+size*Math.sin(dir0-rot+R90); ye=y+h;
                        yrad = -R90;
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0-dirstep*i+R90;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            courseGeo.data.push([x, z, y]);
                            if (zrot != null) {
                                courseGeo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }
                } else if (shape == "rsin") {
                    //右折＋高さを sin で変化
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir;
                        dirg=dir+R90; dire=dir0+rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+size*Math.cos(dir0+rot-R90); ze=zg+size*Math.sin(dir0+rot-R90); ye=y+h;
                        yrad = -R90;
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0+dirstep*i-R90;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            courseGeo.data.push([x, z, y]);
                            if (zrot != null) {
                                courseGeo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }
                } else if (shape == "lsindr") {
                    //左折＋高さを sin で変化＋半径を均一で変化
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir; size0=size;
                        sizee=size2;
                        dirg=dir-R90; dire=dir0-rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+sizee*Math.cos(dir0-rot+R90); ze=zg+sizee*Math.sin(dir0-rot+R90); ye=y+h;
                        yrad = -R90;
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0-dirstep*i+R90;
                            size=size0+sizestep*i;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            courseGeo.data.push([x, z, y]);
                            if (zrot != null) {
                                courseGeo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire; size=sizee;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }
                } else if (shape == "rsindr") {
                    //右折＋高さを sin で変化＋半径を均一で変化
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir; size0=size;
                        sizee=size2;
                        dirg=dir+R90; dire=dir0+rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+sizee*Math.cos(dir0+rot-R90); ze=zg+sizee*Math.sin(dir0+rot-R90); ye=y+h;
                        yrad = -R90;
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0+dirstep*i-R90;
                            size=size0+sizestep*i;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            courseGeo.data.push([x, z, y]);
                            if (zrot != null) {
                                courseGeo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire; size=sizee;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }
                } else if (shape == "vloop") {
                    // 縦ループ
                    let vrotstep=vrot/div;
                    let dirV0=-R90, dirVe=dirV0+vrot, dirV;
                    let dirR=dir-R90;
                    hshift=-hshift;
                    let hshifte=hshift, hshiftstep=hshift/div;
                    let xroll, yroll, zroll;
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir; size0=size;
                        sizee=size2;
                        xg=x0; yg=y0+size; zg=z0;
                        xroll = 0;
                        yroll = sizee*Math.sin(dirVe);
                        zroll = sizee*Math.cos(dirVe);
                        xe = xg+zroll*Math.sin(dir)+hshifte*Math.cos(dirR);
                        ye = yg+yroll;
                        ze = zg+zroll*Math.cos(dir)+hshifte*Math.sin(dirR);
                        yrad = -R90;
                        for (let i=0; i < div; ++i, ++ii){
                            dirV=dirV0+vrotstep*i;
                            size=size0+sizestep*i;
                            xroll = 0;
                            yroll = size*Math.sin(dirV);
                            zroll = size*Math.cos(dirV);
                            hshift = hshifte*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            x=xg+zroll*Math.cos(dir)+hshift*Math.cos(dirR);
                            y=yg+yroll;
                            z=zg+zroll*Math.sin(dir)+hshift*Math.sin(dirR);
                            courseGeo.data.push([x, z, y]);
                            if (zrot != null) {
                                courseGeo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire; size=sizee;
                        if (Math.round(vrot-Math.round(vrot/R180)*R180)==0) {
                            dir = dir+vrot;
                        }
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }
                }
            }
            if (courseGeo.isLoopCourse == false) {
                courseGeo.data.push([x, z, y]);
            }

        } else if (courseGeo.type == 'alg_0201') {
            // 円（コイル）、等幅で上昇
            courseGeo.data = []; // xzy座標
            let nloop = typeof(courseGeo.nloop) !== 'undefined' ? courseGeo.nloop : 5;
            let loopy = typeof(courseGeo.loopy) !== 'undefined' ? courseGeo.loopy : 30;//１周分での高さ
            let r = typeof(courseGeo.r) !== 'undefined' ? courseGeo.r : 100;
            let n = nloop*72, stepy = loopy/72, irad, x, y, z;
            const R5 = Math.PI/36;
            for (let i = 0; i < n; ++i) {
                irad = -i * R5;
                x = r*Math.cos(irad); y = i*stepy; z = r*Math.sin(irad);
                courseGeo.data.push([x, z, y]);
            }

        } else if (courseGeo.type == 'alg_0202') {
            // 乱数（等確率）で右／左の円弧(90度ごと)、等幅で上昇
            courseGeo.data = []; // xzy座標
            let narc = typeof(courseGeo.narc) !== 'undefined' ? courseGeo.narc : 40;
            let arcy = typeof(courseGeo.arcy) !== 'undefined' ? courseGeo.arcy : 4;//１回転ごとの高さ
            let arcDiv = typeof(courseGeo.arcDiv) !== 'undefined' ? courseGeo.arcDiv : 30; // 18;
            let Rx = R90 / arcDiv;
            let r = typeof(courseGeo.r) !== 'undefined' ? courseGeo.r : 50;
            let stepy = arcy/18, jarc = 0, x0=0, z0=0, arcType, arcTypeOld = true, i = 0;
            let disTHMAX = 400**2, disTHMIN = 125**2, dirAuto=false, x, y, z, irad;
            for (let iarc = 0; iarc < narc; ++iarc) {
                arcType = (Math.random() < 0.5);
                if (courseGeo.data.length > 0) {
                    // 移動先の座標を推定してきめる
                    // 一定距離（最大）を超えたら原点に向かうよう、一定距離（最小）まで近づいたら解除する
                    let p = courseGeo.data.slice(-1)[0];//パイプ末尾の位置
                    let dis = p[0]**2 + p[1]**2;
                    if (dirAuto == false) {
                        if(dis>disTHMAX) { // +-400**2の範囲に収まるように
                            dirAuto = true;
                        }
                    }
                    if (dirAuto == true) {
                        if(dis<disTHMIN) {
                            dirAuto = false;
                        }
                        let x00R = x0, z00R = z0, x00L = x0, z00L = z0;
                        {
                            // 右円弧
                            if (arcTypeOld != true) {
                                x00R += -2*r*Math.cos(jarc*R90); z00R += -2*r*Math.sin(jarc*R90);
                            }
                            irad = R90 + jarc*R90;
                            x00R += r*Math.cos(irad); z00R += r*Math.sin(irad);
                        }
                        {
                            // 左円弧
                            if (arcTypeOld != false) {
                                x00L += 2*r*Math.cos(jarc*R90); z00L += 2*r*Math.sin(jarc*R90);
                            }
                            irad = -R90 + jarc*R90 + R180;
                            x00L += r*Math.cos(irad); z00L += r*Math.sin(irad);
                        }
                        let disR = x00R**2 + z00R**2;
                        let disL = x00L**2 + z00L**2;
                        arcType = (disR < disL);  // 原点に向かうように
                    }
                }
                if (arcType) {
                    // 右円弧
                    if (arcTypeOld != arcType) {
                        x0 += -2*r*Math.cos(jarc*R90); z0 += -2*r*Math.sin(jarc*R90);
                    }
                    for (let j = 0; j < arcDiv; ++j) {
                        let irad = j * Rx + jarc*R90;
                        x = x0 + r*Math.cos(irad); y = i*stepy; z = z0 + r*Math.sin(irad);
                        courseGeo.data.push([x, z, y]);
                        ++i;
                    }
                    jarc = (jarc+1)%4;
                } else {
                    // 左円弧
                    if (arcTypeOld != arcType) {
                        x0 += 2*r*Math.cos(jarc*R90); z0 += 2*r*Math.sin(jarc*R90);
                    }
                    for (let j = 0; j < arcDiv; ++j) {
                        let irad = -j*Rx + jarc*R90 + R180;
                        x = x0 + r*Math.cos(irad); y = i*stepy; z = z0 + r*Math.sin(irad);
                        courseGeo.data.push([x, z, y]);
                        ++i;
                    }
                    jarc = (jarc+3)%4;
                }
                arcTypeOld = arcType;
            }

        } else if (courseGeo.type == 'alg_0203') {
            // ランダムウォーク  .. asin で角度制限しつつ
            courseGeo.data = []; // xzy座標
            let n = typeof(courseGeo.n) !== 'undefined' ? courseGeo.n : 100;
            let r = typeof(courseGeo.r) !== 'undefined' ? courseGeo.r : 50;
            let x=0, y=0, z=0;
            let pitch=0.01, yaw=R90;
            courseGeo.data.push([x, z, y]);
            for (let i = 0; i < n; ++i) {
                pitch += Math.asin(Math.random()*2-1)*0.1+0.01;
                yaw += Math.asin(Math.random()*2-1);
                x += r*Math.cos(pitch)*Math.cos(yaw);
                z += r*Math.cos(pitch)*Math.sin(yaw);
                y += r*Math.sin(pitch);
                courseGeo.data.push([x, z, y]);
            }

        } else if (courseGeo.type == 'alg_0301') {
            let grid = GridPathAlgo.makeGrid({minX:0, maxX:5, minY:0, maxY:5, minZ:0, maxZ:5});
            let aStart = [0,0,0];
            let ans = GridPathAlgo.findLongestPathBacktracking(grid, aStart);
// console.log("ans.path=", ans.path);
            courseGeo.data = []; // xzy座標
            let s = 10, adjx = -250, adjy = 0, adjz = -250, x, y, z, p;
            for (let i = 0; i < ans.length; ++i) {
                p = ans.path[i];
                x = p[0]*s + adjx;
                y = p[1]*s + adjy;
                z = p[2]*s + adjz;
                courseGeo.data.push([x, z, y]);
            }

        } else if (courseGeo.type == 'alg_0302') {
            let banXYZ = {}, nban = 30;
            for (let i = 0; i < nban; ++i) {
                let x = Math.floor(Math.random()*5);
                let y = Math.floor(Math.random()*5);
                let z = Math.floor(Math.random()*5);
                let key = ''+x+','+y+','+z;
                banXYZ[key] = 1;
            }
            let fnIsValid = function(x,y,z) {
                // let [x,y,z] = arg1;
                let key = ''+x+','+y+','+z;
                if (key in banXYZ) {
                    return false;
                }
                return true;
            }
            let grid = GridPathAlgo.makeGrid({minX:0, maxX:5, minY:0, maxY:5, minZ:0, maxZ:5}, fnIsValid);
            let aStart = [0,0,0];
            let ans = GridPathAlgo.findLongestPathBacktracking(grid, aStart);
// console.log("ans.path=", ans.path);
            courseGeo.data = []; // xzy座標
            let s = 10, adjx = -250, adjy = 0, adjz = -250, x, y, z, p;
            for (let i = 0; i < ans.length; ++i) {
                p = ans.path[i];
                x = p[0]*s + adjx;
                y = p[1]*s + adjy;
                z = p[2]*s + adjz;
                courseGeo.data.push([x, z, y]);
            }

        } else if (courseGeo.type == 'alg_0204') {
            // ランダムウォーク  .. asin で角度制限しつつ
            //   .. 203 は 後半の pitch がほぼ固定で凹凸がなくなるので。。
            //   pitch が敷居値を超えたら方向を反転させる
            //   .. いい感じの凹凸だが、乱数によっては交差する場合も xx
            courseGeo.data = []; // xzy座標
            let n = typeof(courseGeo.n) !== 'undefined' ? courseGeo.n : 100;
            let r = typeof(courseGeo.r) !== 'undefined' ? courseGeo.r : 50;
            let x=0, y=0, z=0;
            let pitch=0.01, yaw=R90, pitchType = 0, pitchTh = 0.4, epsCount = 5; // , pitchEps = 0.1;
            courseGeo.data.push([x, z, y]);
            for (let i = 0; i < n; ++i) {
                if (pitchType == 0) {
                    pitch += Math.asin(Math.random()*2-1)*0.2+0.01;
                    if (pitch > pitchTh) {
                        pitchType = -1;
                    } else if (pitch < -pitchTh) {
                        pitchType = 1;
                    }
                } else if (pitchType == 1) {
                    // 上昇寄り
                    pitch += Math.asin(Math.min(1, Math.random()*2-0.8))*0.2;
                    if ((pitch > 0) && (--epsCount <= 0)) {
                        pitchType = 0;
                    }  else if (pitch > pitchTh) {
                        pitchType = -1;
                    }
                } else if (pitchType == -1) {
                    // 下降寄り
                    pitch += Math.asin(Math.max(-1, Math.random()*2-1.2))*0.2;
                    if ((pitch < 0) && (--epsCount <= 0)) {
                        pitchType = 0;
                    }  else if (pitch < -pitchTh) {
                        pitchType = 1;
                    }
                }
                // if (pitch > pitchTh) {
                //     pitchType = -1;
                // } else if (pitch < -pitchTh) {
                //     pitchType = 1;
                // } else if (Math.abs(pitch) < pitchEps) {
                //     pitchType = 0;
                // }
                yaw += Math.asin(Math.random()*2-1);
                x += r*Math.cos(pitch)*Math.cos(yaw);
                z += r*Math.cos(pitch)*Math.sin(yaw);
                y += r*Math.sin(pitch);
                courseGeo.data.push([x, z, y]);
            }

        } else if (courseGeo.type == 'alg_0205') {
            // ランダムウォーク  .. asin で角度制限しつつ
            //   204 に交差判定を行う
            // courseGeo.data = []; // xzy座標
            let n = typeof(courseGeo.n) !== 'undefined' ? courseGeo.n : 100;
            let r = typeof(courseGeo.r) !== 'undefined' ? courseGeo.r : 50;
            // let x=0, z=0, y=0, p1, p2;
            let p1=[0,0,0], p2=[0,0,0], geoHist=[], geoHistMax = 10;
            let pitch=0.01, yaw=R90, pitchType = 0, pitchTh = 0.4;
            // let correctMode = 0; // 0: 修正なし, 1: 中心方向に, 2:
            // let fillgrid = new Set(), skey, keyscale=1/20;
            let fillgrid, skey, keyscale=1/10, keyscaleZ=1/20;
            // let fillgrid, skey, keyscale=1/60, keyscaleZ=1/100;
            let _key = function(p) { return p[0] + ',' + p[1] + ',' + p[2]; }
            let _key2 = function(p) {
                let p_ = [Math.floor(p[0]*keyscale), Math.floor(p[1]*keyscale), Math.floor(p[2]*keyscaleZ)];
                return _key(p_);
            }
            let _setgrid = function(p1,p2,fillgrid) {
                for (let s of [0.25, 0.5, 0.75, 1]) {
                    // let p = [(p2[0]*s+p1[0]*(1-s))/2, (p2[1]*s+p1[1]*(1-s))/2, (p2[2]*s+p1[2]*(1-s))/2];
                    let p = [p2[0]*s+p1[0]*(1-s), p2[1]*s+p1[1]*(1-s), p2[2]*s+p1[2]*(1-s)];
                    let skey = _key2(p);
                    if (!fillgrid.has(skey)) { fillgrid.add(skey); }
                }
            }
            // 初期位置
            let _iniPara = function() {
                courseGeo.data = []; // xzy座標
                p1 = [0, 0, 0];
                courseGeo.data.push([p1[0], p1[2], p1[1]]);
                fillgrid = new Set();
                _setgrid(p1,p1,fillgrid);
                pitch=0.01, yaw=R90, pitchType = 0;
                geoHist.push([p1[0], p1[1], p1[2], pitch, yaw, pitchType]);
            }
            _iniPara();
            let nloop = 5;
            for (let i = 0; i < n; ++i) {
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    if (pitchType == 0) {
                        pitch += Math.asin(Math.random()*2-1)*0.2+0.01;
                        if (pitch > pitchTh) {
                            pitchType = -1;
                        } else if (pitch < -pitchTh) {
                            pitchType = 1;
                        }
                    } else if (pitchType == 1) {
                        // 上昇寄り
                        pitch += Math.asin(Math.min(1, Math.random()*2-0.5))*0.5;
                        if (pitch > 0) { pitchType = 0; }
                    } else if (pitchType == -1) {
                        // 下降寄り
                        pitch += Math.asin(Math.max(-1, Math.random()*2-1.5))*0.5;
                        if (pitch < 0) { pitchType = 0; }
                    }
                    yaw += Math.asin(Math.random()*1.6-0.8)*0.8;
                    p2[0] = p1[0] + r*Math.cos(pitch)*Math.cos(yaw);
                    p2[2] = p1[2] + r*Math.cos(pitch)*Math.sin(yaw);
                    p2[1] = p1[1] + r*Math.sin(pitch);
                    skey = _key2(p2);
                    if (fillgrid.has(skey)) {
                        if (geoHist.length > 0) {
                            // 交差 .. geoHist から pop()して経路を戻ってやり直し
// console.log("retry.. data.len=", courseGeo.data.length)
                            // // p1[0], p1[1], p1[2], pitch, yaw, pitchType = geoHist.pop();
                            // [p1[0], p1[1], p1[2], pitch, yaw, pitchType] = geoHist[geoHist.length-1];
                            // geoHist.pop();
                            let tmp = geoHist.pop();
                            [p1[0], p1[1], p1[2], pitch, yaw, pitchType] = tmp;
                            courseGeo.data.pop();
                        } else {
// console.log("break.. (x_x) ", courseGeo.data.length)
                            if (courseGeo.data.length <= 10) {
                                _iniPara();
                                i = 0;
                            } else {
                                i = n;
                                // iloop = nloop;
                            }
                            break;
                        }
                    } else {
                        // 交差なし：問題なし
                        // fillgrid に登録
                        _setgrid(p1,p2,fillgrid);
                        p1[0]=p2[0]; p1[1]=p2[1]; p1[2]=p2[2];
                        geoHist.push([p1[0], p1[1], p1[2], pitch, yaw, pitchType]);
                        if (geoHist.length > geoHistMax) { geoHist.shift(); }
                    }
                }
                courseGeo.data.push([p1[0], p1[2], p1[1]]);
                // courseGeo.data.push([x, z, y]);
// console.log("log data.len=", courseGeo.data.length, ", hist=", geoHist.length, ", fillgrid=", fillgrid.size);
            }

        } else if (courseGeo.type == 'alg_0206') {
            // ランダムウォーク  .. asin で角度制限しつつ
            //   205 に範囲外による強制方向転換
            // courseGeo.data = []; // xzy座標
            let n = typeof(courseGeo.n) !== 'undefined' ? courseGeo.n : 100;
            let r = typeof(courseGeo.r) !== 'undefined' ? courseGeo.r : 50;
            let p1=[0,0,0], p2=[0,0,0], geoHist=[], geoHistMax = 10;
            let pitch=0.01, yaw=R90, yaw_, pitchType = 0, pitchTh = 0.4;
            // 経路の交差判定用
            let fillgrid, skey, keyscale=1/10, keyscaleZ=1/20;
            // let fillgrid, skey, keyscale=1/60, keyscaleZ=1/100;
            let _key = function(p) { return p[0] + ',' + p[1] + ',' + p[2]; }
            let _key2 = function(p) {
                let p_ = [Math.floor(p[0]*keyscale), Math.floor(p[1]*keyscale), Math.floor(p[2]*keyscaleZ)];
                return _key(p_);
            }
            let _setgrid = function(p1,p2,fillgrid) {
                for (let s of [0.25, 0.5, 0.75, 1]) {
                    // let p = [(p2[0]*s+p1[0]*(1-s))/2, (p2[1]*s+p1[1]*(1-s))/2, (p2[2]*s+p1[2]*(1-s))/2];
                    let p = [p2[0]*s+p1[0]*(1-s), p2[1]*s+p1[1]*(1-s), p2[2]*s+p1[2]*(1-s)];
                    let skey = _key2(p);
                    if (!fillgrid.has(skey)) { fillgrid.add(skey); }
                }
            }
            // 範囲内に収めるための向き修正
            let rng = 300, rng_=rng*0.5, rng_2=rng*0.2;
            let correctMode = 0; // 0: 修正なし, 1: 中心方向に
            // 初期位置
            let _iniPara = function() {
                courseGeo.data = []; // xzy座標
                p1 = [0, 0, 0];
                courseGeo.data.push([p1[0], p1[2], p1[1]]);
                fillgrid = new Set();
                _setgrid(p1,p1,fillgrid);
                pitch=0.01, yaw=R90, pitchType = 0;
                geoHist.push([p1[0], p1[1], p1[2], pitch, yaw, pitchType]);
            }
            _iniPara();
            let nloop = 5;
            for (let i = 0; i < n; ++i) {
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    if (pitchType == 0) {
                        pitch += Math.asin(Math.random()*2-1)*0.2+0.01;
                        if (pitch > pitchTh) {
                            pitchType = -1;
                        } else if (pitch < -pitchTh) {
                            pitchType = 1;
                        }
                    } else if (pitchType == 1) {
                        // 上昇寄り
                        pitch += Math.asin(Math.min(1, Math.random()*2-0.5))*0.5;
                        if (pitch > 0) { pitchType = 0; }
                    } else if (pitchType == -1) {
                        // 下降寄り
                        pitch += Math.asin(Math.max(-1, Math.random()*2-1.5))*0.5;
                        if (pitch < 0) { pitchType = 0; }
                    }
                    if (Math.abs(p1[0]) > rng_ || Math.abs(p1[1]) > rng_ || Math.abs(p1[2]) > rng_) {
                        correctMode = 1;
                    } else if (Math.abs(p1[0]) < rng_2 && Math.abs(p1[1]) < rng_2 && Math.abs(p1[2]) < rng_2) {
                        correctMode = 0;
                    }
                    yaw_ = Math.asin(Math.random()*1.6-0.8)*0.8;
                    yaw += yaw_;
                    p2[0] = p1[0] + r*Math.cos(pitch)*Math.cos(yaw);
                    p2[2] = p1[2] + r*Math.cos(pitch)*Math.sin(yaw);
                    p2[1] = p1[1] + r*Math.sin(pitch);
                    if (correctMode) {
                        // 原点方向に向かうように yaw を補正する
                        let vt = new BABYLON.Vector3(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]).normalize();
                        let vp1 = new BABYLON.Vector3(p1[0],p1[1],p1[2]).normalize();
                        let rad = Math.acos(vt.dot(vp1));
                        // ズレの向き確認
                        let vn = BABYLON.Vector3.Up();
                        let vb = BABYLON.Vector3.Cross(vt, vn).normalize();
                        let dirflag = vb.dot(vp1);
                        if (dirflag >= 0) {
                            yaw += -rad*0.03;
                        } else {
                            yaw += rad*0.03;
                        }
                        p2[0] = p1[0] + r*Math.cos(pitch)*Math.cos(yaw);
                        p2[2] = p1[2] + r*Math.cos(pitch)*Math.sin(yaw);
                    }
                    skey = _key2(p2);
                    if (fillgrid.has(skey)) {
                        if (geoHist.length > 0) {
                            // 交差 .. geoHist から pop()して経路を戻ってやり直し
                            let tmp = geoHist.pop();
                            [p1[0], p1[1], p1[2], pitch, yaw, pitchType] = tmp;
                            courseGeo.data.pop();
                        } else {
                            if (courseGeo.data.length <= 10) {
                                _iniPara();
                                i = 0;
                            } else {
                                i = n;
                                // iloop = nloop;
                            }
                            break;
                        }
                    } else {
                        // 交差なし：問題なし
                        // fillgrid に登録
                        _setgrid(p1,p2,fillgrid);
                        p1[0]=p2[0]; p1[1]=p2[1]; p1[2]=p2[2];
                        geoHist.push([p1[0], p1[1], p1[2], pitch, yaw, pitchType]);
                        if (geoHist.length > geoHistMax) { geoHist.shift(); }
                    }
                }
                courseGeo.data.push([p1[0], p1[2], p1[1]]);
            }

        } else if (courseGeo.type == 'alg_0207') {
console.log("alg_0207");
            // ランダムウォーク  .. asin で角度制限しつつ
            //   206 + 始点と終点をむずぶ
            // courseGeo.data = []; // xzy座標
            let n = typeof(courseGeo.n) !== 'undefined' ? courseGeo.n : 100;
            let r = typeof(courseGeo.r) !== 'undefined' ? courseGeo.r : 50;
            let p1=[0,0,0], p2=[0,0,0], geoHist=[], geoHistMax = 10;
            let pitch=0.01, yaw=R90, yaw_, pitchType = 0, pitchTh = 0.4;
            // 経路の交差判定用
            let fillgrid, skey, keyscale=1/10, keyscaleZ=1/20;
            let _key = function(p) { return p[0] + ',' + p[1] + ',' + p[2]; }
            let _key2 = function(p) {
                let p_ = [Math.floor(p[0]*keyscale), Math.floor(p[1]*keyscale), Math.floor(p[2]*keyscaleZ)];
                return _key(p_);
            }
            let _setgrid = function(p1,p2,fillgrid) {
                for (let s of [0.25, 0.5, 0.75, 1]) {
                    // let p = [(p2[0]*s+p1[0]*(1-s))/2, (p2[1]*s+p1[1]*(1-s))/2, (p2[2]*s+p1[2]*(1-s))/2];
                    let p = [p2[0]*s+p1[0]*(1-s), p2[1]*s+p1[1]*(1-s), p2[2]*s+p1[2]*(1-s)];
                    let skey = _key2(p);
                    if (!fillgrid.has(skey)) { fillgrid.add(skey); }
                }
            }
            // 範囲内に収めるための向き修正
            let rng = 300, rng_=rng*0.5, rng_2=rng*0.2;
            let correctMode = 0; // 0: 修正なし, 1: 中心方向に
            let ptrg0 = null, ptrg1 = null;
            // 初期位置
            let _iniPara = function() {
                courseGeo.data = []; // xzy座標
                p1 = [0, 0, 0];
                courseGeo.data.push([p1[0], p1[2], p1[1]]);
                fillgrid = new Set();
                _setgrid(p1,p1,fillgrid);
                pitch=0.01, yaw=R90, pitchType = 0;
                geoHist = [];
                geoHist.push([p1[0], p1[1], p1[2], pitch, yaw, pitchType]);
                ptrg0 = null, ptrg1 = null;
            }
            _iniPara();
            let nloop = 5;
            let n80 = Math.floor(n*0.8); // n80 以降は始点に向かって移動させる
            // let ptrg0 = null, ptrg1 = null;
            let r01 = r*0.1; // 直接始点(ptrg0)に向かうのではなく一度 ptrg1 を目指す
            for (let i = 0; i < n; ++i) {
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    if (i >= n80) {
                        if (ptrg0 == null) {
                            let _p0 = new BABYLON.Vector3(courseGeo.data[0][0], courseGeo.data[0][2], courseGeo.data[0][1]);
                            let _p1 = new BABYLON.Vector3(courseGeo.data[1][0], courseGeo.data[1][2], courseGeo.data[1][1]);
                            ptrg0 = _p0;
                            let _ptmp = _p0.subtract(_p1).normalize();
                            ptrg1 = _p0.add(_ptmp.scale(r*5));
                            if (0) {
                                {
                                    let p = ptrg1.clone();
                                    p.z = - p.z;
                                    p.scaleInPlace(0.1);
                                    p.addInPlaceFromFloats(-5,5,-5);
                                    let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:5}, scene);
                                    mesh.position.copyFrom(p);
                                    mesh.material = new BABYLON.StandardMaterial('', scene);
                                    mesh.material.diffuseColor = BABYLON.Color3.Green();
                                    mesh.material.alpha = 0.3;
                                }
                                {
                                    let p = ptrg0.clone();
                                    p.z = - p.z;
                                    p.scaleInPlace(0.1);
                                    p.addInPlaceFromFloats(-5,5,-5);
                                    let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:5}, scene);
                                    mesh.position.copyFrom(p);
                                    mesh.material = new BABYLON.StandardMaterial('', scene);
                                    mesh.material.diffuseColor = BABYLON.Color3.Red();
                                    mesh.material.alpha = 0.3;
                                }
                            }
                        }
                        let _p0 = new BABYLON.Vector3(p1[0],p1[1],p1[2]);
                        if (ptrg1 == null) {
                            // ptrg0 に向かわせる
                            let _ptmp = ptrg0.subtract(_p0).normalize();
                            let _p1 = _p0.add(_ptmp.scale(r));
                            for (let j = 0; j < 20; ++j) {
                                p2 = _p1.asArray();
                                skey = _key2(p2);
                                if (!fillgrid.has(skey)) {
                                    break; // 交差なし
                                }
                                let vrnd = BABYLON.Vector3.Random(-r01, r01);
                                _p1.addInPlace(vrnd);
                                _p1 = _p0.add(_p1.subtract(_p0).normalize().scale(r));
                            }
                            let len = BABYLON.Vector3.Distance(_p0, ptrg0);
                            if (len < r) {
                                // 始点に十分に接近と判断
                                i = n;
                                break;
                            }
                        } else {
                            // ptrg1 に向かわせる
                            let _ptmp = ptrg1.subtract(_p0).normalize();
                            let _p1 = _p0.add(_ptmp.scale(r));
                            for (let j = 0; j < 20; ++j) {
                                p2 = _p1.asArray();
                                skey = _key2(p2);
                                if (!fillgrid.has(skey)) {
                                    break; // 交差なし
                                }
                                let vrnd = BABYLON.Vector3.Random(-r01, r01);
                                _p1.addInPlace(vrnd);
                                _ptmp = _p1.subtract(_p0).normalize();
                                _p1 = _p0.add(_ptmp.scale(r));
                            }
                            let len = BABYLON.Vector3.Distance(_p0, ptrg1);
                            if (len < r*1.5) {
                                ptrg1 = null; // 次回から始点に向かわせる
                            }
                        }
                        pitch = 0, yaw = 0, pitchType = 0;
                    } else {
                        if (pitchType == 0) {
                            pitch += Math.asin(Math.random()*2-1)*0.2+0.01;
                            if (pitch > pitchTh) {
                                pitchType = -1;
                            } else if (pitch < -pitchTh) {
                                pitchType = 1;
                            }
                        } else if (pitchType == 1) {
                            // 上昇寄り
                            pitch += Math.asin(Math.min(1, Math.random()*2-0.5))*0.5;
                            if (pitch > 0) { pitchType = 0; }
                        } else if (pitchType == -1) {
                            // 下降寄り
                            pitch += Math.asin(Math.max(-1, Math.random()*2-1.5))*0.5;
                            if (pitch < 0) { pitchType = 0; }
                        }
                        if (Math.abs(p1[0]) > rng_ || Math.abs(p1[1]) > rng_ || Math.abs(p1[2]) > rng_) {
                            correctMode = 1;
                        } else if (Math.abs(p1[0]) < rng_2 && Math.abs(p1[1]) < rng_2 && Math.abs(p1[2]) < rng_2) {
                            correctMode = 0;
                        }
                        yaw_ = Math.asin(Math.random()*1.6-0.8)*0.8;
                        yaw += yaw_;
                        p2[0] = p1[0] + r*Math.cos(pitch)*Math.cos(yaw);
                        p2[2] = p1[2] + r*Math.cos(pitch)*Math.sin(yaw);
                        p2[1] = p1[1] + r*Math.sin(pitch);
                        if (correctMode) {
                            // 原点方向に向かうように yaw を補正する
                            let vt = new BABYLON.Vector3(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]).normalize();
                            let vp1 = new BABYLON.Vector3(p1[0],p1[1],p1[2]).normalize();
                            let rad = Math.acos(Math.max(-1,Math.min(1,vt.dot(vp1))));
                            // ズレの向き確認
                            let vn = BABYLON.Vector3.Up();
                            let vb = BABYLON.Vector3.Cross(vt, vn).normalize();
                            let dirflag = vb.dot(vp1);
                            if (dirflag >= 0) {
                                yaw += -rad*0.03;
                            } else {
                                yaw += rad*0.03;
                            }
                            p2[0] = p1[0] + r*Math.cos(pitch)*Math.cos(yaw);
                            p2[2] = p1[2] + r*Math.cos(pitch)*Math.sin(yaw);
                        }
                    }
                    skey = _key2(p2);
                    if (fillgrid.has(skey)) {
                        if (geoHist.length > 0) {
                            // 交差 .. geoHist から pop()して経路を戻ってやり直し
                            let tmp = geoHist.pop();
                            [p1[0], p1[1], p1[2], pitch, yaw, pitchType] = tmp;
                            courseGeo.data.pop();
                        } else {
                            if (courseGeo.data.length <= 10) {
                                _iniPara();
                                i = 0;
console.log(" retry i=0");
                            } else {
                                i = n;
                                // iloop = nloop;
                            }
                            break;
                        }
                    } else {
                        // 交差なし：問題なし
                        // fillgrid に登録
                        _setgrid(p1,p2,fillgrid);
                        p1[0]=p2[0]; p1[1]=p2[1]; p1[2]=p2[2];
                        geoHist.push([p1[0], p1[1], p1[2], pitch, yaw, pitchType]);
                        if (geoHist.length > geoHistMax) { geoHist.shift(); }
                    }
                }
                courseGeo.data.push([p1[0], p1[2], p1[1]]);
            }

        } else if (courseGeo.type == 'alg_0208') {
console.log("alg_0208");
            // ランダムウォーク  .. asin で角度制限しつつ
            //   207 + 始点に向かう動きを補正
            // courseGeo.data = []; // xzy座標
            let n = typeof(courseGeo.n) !== 'undefined' ? courseGeo.n : 100;
            let r = typeof(courseGeo.r) !== 'undefined' ? courseGeo.r : 50;
            let p1=[0,0,0], p2=[0,0,0], geoHist=[], geoHistMax = 10;
            let pitch=0.01, yaw=R90, yaw_, pitchType = 0, pitchTh = 0.4;
            // 経路の交差判定用
            let fillgrid, skey, keyscale=1/10, keyscaleZ=1/20;
            let _key = function(p) { return p[0] + ',' + p[1] + ',' + p[2]; }
            let _key2 = function(p) {
                let p_ = [Math.floor(p[0]*keyscale), Math.floor(p[1]*keyscale), Math.floor(p[2]*keyscaleZ)];
                return _key(p_);
            }
            let _setgrid = function(p1,p2,fillgrid) {
                for (let s of [0.25, 0.5, 0.75, 1]) {
                    let p = [p2[0]*s+p1[0]*(1-s), p2[1]*s+p1[1]*(1-s), p2[2]*s+p1[2]*(1-s)];
                    let skey = _key2(p);
                    if (!fillgrid.has(skey)) { fillgrid.add(skey); }
                }
            }
            // 範囲内に収めるための向き修正
            let rng = 300, rng_=rng*0.5, rng_2=rng*0.2;
            let correctMode = 0; // 0: 修正なし, 1: 中心方向に
            // let ptrg0 = null, ptrg1 = null;
            let pvia = null, pvialist = []; // 末尾付近から始点に向かうときの経由地
            // 初期位置
            let _iniPara = function() {
                courseGeo.data = []; // xzy座標
                p1 = [0, 0, 0];
                courseGeo.data.push([p1[0], p1[2], p1[1]]);
                fillgrid = new Set();
                _setgrid(p1,p1,fillgrid);
                pitch=0.01, yaw=R90, pitchType = 0;
                geoHist = [];
                geoHist.push([p1[0], p1[1], p1[2], pitch, yaw, pitchType]);
                // ptrg0 = null, ptrg1 = null;
                pvia = null, pvialist = [];
            }
            _iniPara();
            let nloop = 5;
            let n80 = Math.floor(n*0.92); // n80 以降は始点に向かって移動させる
            let r01 = r*0.1; // 直接始点(ptrg0)に向かうのではなく一度 ptrg1 を目指す
            let rr = r*3;
            for (let i = 0; i < n; ++i) {
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    if (i >= n80) {

                        if (pvia == null) {
                            let _p0 = new BABYLON.Vector3(courseGeo.data[0][0], courseGeo.data[0][2], courseGeo.data[0][1]);
                            let _p1 = new BABYLON.Vector3(courseGeo.data[1][0], courseGeo.data[1][2], courseGeo.data[1][1]);
                            let v01 = _p1.subtract(_p0).normalize();
                            let m = courseGeo.data.length, n1=m-1, n2=m-2;
                            let _pn2 = new BABYLON.Vector3(courseGeo.data[n2][0], courseGeo.data[n2][2], courseGeo.data[n2][1]);
                            let _pn1 = new BABYLON.Vector3(courseGeo.data[n1][0], courseGeo.data[n1][2], courseGeo.data[n1][1]);
                            let vn2n1 = _pn1.subtract(_pn2).normalize();

                            let len0n1 = BABYLON.Vector3.Distance(_p0, _pn1);
                            let nn = Math.floor(len0n1/r*1.5)+10;
console.log(" i=",i, ", n=",n, ",  nn=", nn);
                            if (n-i < nn) {
                                n += nn;
console.log(" new  n=",n);
                            }

                            // -- 始点への経由地をもとめる
                            {
                                // 始点から延伸した点を２点配置することでねじれを解消する
                                let pp1 = _p0.clone();
                                let pp2 = pp1.add(v01.scale(-rr*0.75));
                                let pp3 = _pn1.clone();
                                pvialist.push(pp2);
                                pp1 = pp2.clone();
                                pp2 = pp1.add(v01.scale(-rr*1.5));
                                pvialist.push(pp2);

                                let v12 = pp2.subtract(pp1).normalize();
                                let v23 = pp3.subtract(pp2).normalize();
                                let vacos = Math.acos(Math.max(-1, Math.min(1, BABYLON.Vector3.Dot(v12, v23))));
                                let len23 = BABYLON.Vector3.Distance(pp2, pp3);
                                {
                                    let _dot = BABYLON.Vector3.Dot(v12, v23);
                                    let _vacosDeg = Math.floor(vacos*180/R180);
console.log("pvialist.size=",pvialist.length, " deg=",_vacosDeg, ", rad=",vacos.toFixed(3), ", dot=", _dot.toFixed(3));
                                }
                                // let roll = 0;
                                let arr2, arrv, v12b, v12n, quatR45, quatR45r, quatRoll, ptmp, pvia; // , pvia1, pvia2;
                                let jloop = 0, jloopMax = 5;
                                while ((vacos > R45) && (len23 > rr*2)) {
                                    if (++jloop >= jloopMax) break;
                                    // pp1,pp2(v12)を基準に次の経由地を求める
                                    v12b = BABYLON.Vector3.Cross(v12, BABYLON.Vector3.Up()).normalize();
                                    v12n = BABYLON.Vector3.Cross(v12b, v12).normalize();
                                    // 法線方向v12nでR45回転させるquat
                                    quatR45 = BABYLON.Quaternion.RotationAxis(v12n, R45);
                                    quatR45r = BABYLON.Quaternion.RotationAxis(v12n, -R45);
                                    for (let jj = 0; jj < 10; ++jj) {
                                        // 接線方法v12でロールさせるquat
                                        quatRoll = BABYLON.Quaternion.RotationAxis(v12, jj*R10);
                                        // 次の経由地pvia1
                                        ptmp = v12.scale(rr).applyRotationQuaternion(quatR45);
                                        ptmp.applyRotationQuaternionInPlace(quatRoll);
                                        let pvia1 = pp2.add(ptmp);
                                        let len1 = BABYLON.Vector3.DistanceSquared(pvia1, pp3)
                                        // 次の経由地pvia2
                                        ptmp = v12.scale(rr).applyRotationQuaternion(quatR45r);
                                        ptmp.applyRotationQuaternionInPlace(quatRoll);
                                        let pvia2 = pp2.add(ptmp);
                                        let len2 = BABYLON.Vector3.DistanceSquared(pvia2, pp3)
                                        // 近いほう（最短）を選ぶ
                                        if (len1 <= len2) {
                                            pvia = pvia1;
                                        } else {
                                            pvia = pvia2;
                                        }
                                        skey = _key2(pvia);
                                        if (!fillgrid.has(skey)) {
                                            break; // 交差なし
                                        }
                                    }
                                    pvialist.push(pvia);
                                    pp1 = pp2.clone();
                                    pp2 = pvia.clone();
                                    v12 = pp2.subtract(pp1).normalize();
                                    v23 = pp3.subtract(pp2).normalize();
                                    vacos = Math.acos(Math.max(-1, Math.min(1, BABYLON.Vector3.Dot(v12, v23))));
                                    len23 = BABYLON.Vector3.Distance(pp2, pp3);
                                    {
                                        let _vacosDeg = Math.floor(vacos*180/R180);
console.log("pvialist.size=",pvialist.length, " vcos=",_vacosDeg);
                                    }
                                }
                            }

                            // -- カレント位置からの経由地をもとめる
                            if (1) {
                                let pvialist_ = [];
                                let pp1 = _pn1.clone();
                                let pp2 = pp1.add(vn2n1.scale(rr));
                                let pp3 = pvialist[pvialist.length-1].clone();
                                pvialist_.push(pp2);
                                let v12 = pp2.subtract(pp1).normalize();
                                let v23 = pp3.subtract(pp2).normalize();
                                let vacos = Math.acos(Math.max(-1, Math.min(1, BABYLON.Vector3.Dot(v12, v23))));
                                let len23 = BABYLON.Vector3.Distance(pp2, pp3);
                                {
                                    let _dot = BABYLON.Vector3.Dot(v12, v23);
                                    let _vacosDeg = Math.floor(vacos*180/R180);
console.log("pvialist.size=",pvialist_.length, " deg=",_vacosDeg, ", rad=",vacos.toFixed(3), ", dot=", _dot.toFixed(3));
                                }
                                // let roll = 0;
                                let arr2, arrv, v12b, v12n, quatR45, quatR45r, quatRoll, ptmp, pvia; // , pvia1, pvia2;
                                let jloop = 0, jloopMax = 5;
                                while ((vacos > R45) && (len23 > rr*2)) {
                                    if (++jloop >= jloopMax) break;
                                    // pp1,pp2(v12)を基準に次の経由地を求める
                                    v12b = BABYLON.Vector3.Cross(v12, BABYLON.Vector3.Up()).normalize();
                                    v12n = BABYLON.Vector3.Cross(v12b, v12).normalize();
                                    // 法線方向v12nでR45回転させるquat
                                    quatR45 = BABYLON.Quaternion.RotationAxis(v12n, R45);
                                    quatR45r = BABYLON.Quaternion.RotationAxis(v12n, -R45);
                                    for (let jj = 0; jj < 10; ++jj) {
                                        // 接線方法v12でロールさせるquat
                                        quatRoll = BABYLON.Quaternion.RotationAxis(v12, jj*R10);
                                        // 次の経由地pvia1
                                        ptmp = v12.scale(rr).applyRotationQuaternion(quatR45);
                                        ptmp.applyRotationQuaternionInPlace(quatRoll);
                                        let pvia1 = pp2.add(ptmp);
                                        let len1 = BABYLON.Vector3.DistanceSquared(pvia1, pp3)
                                        // 次の経由地pvia2
                                        ptmp = v12.scale(rr).applyRotationQuaternion(quatR45r);
                                        ptmp.applyRotationQuaternionInPlace(quatRoll);
                                        let pvia2 = pp2.add(ptmp);
                                        let len2 = BABYLON.Vector3.DistanceSquared(pvia2, pp3)
                                        // 近いほう（最短）を選ぶ
                                        if (len1 <= len2) {
                                            pvia = pvia1;
                                        } else {
                                            pvia = pvia2;
                                        }
                                        skey = _key2(pvia);
                                        if (!fillgrid.has(skey)) {
                                            break; // 交差なし
                                        }
                                    }
                                    pvialist_.push(pvia);
                                    pp1 = pp2.clone();
                                    pp2 = pvia.clone();
                                    v12 = pp2.subtract(pp1).normalize();
                                    v23 = pp3.subtract(pp2).normalize();
                                    vacos = Math.acos(Math.max(-1, Math.min(1, BABYLON.Vector3.Dot(v12, v23))));
                                    len23 = BABYLON.Vector3.Distance(pp2, pp3);
                                    {
                                        let _vacosDeg = Math.floor(vacos*180/R180);
console.log("pvialist.size=",pvialist_.length, " vcos=",_vacosDeg);
                                    }
                                }
                                while (pvialist_.length > 0) {
                                    let p = pvialist_.pop();
                                    pvialist.push(p);
                                }
                            }

                            // debug デバッグ用pvialistの表示
                            if (0) {
                                for (let p_ of pvialist) {
                                    let p = p_.clone();
                                    p.z = -p.z;
                                    p.scaleInPlace(0.1);
                                    p.addInPlaceFromFloats(-5,5,-5);
                                    let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:5}, scene);
                                    mesh.position.copyFrom(p);
                                    mesh.material = new BABYLON.StandardMaterial('', scene);
                                    mesh.material.diffuseColor = BABYLON.Color3.Green();
                                    mesh.material.alpha = 0.3;
                                }
                            }
                            pvia = pvialist.pop();
                            pitch = 0, yaw = 0, pitchType = 0;
                            continue;
                        } else {
                            let _p0 = new BABYLON.Vector3(p1[0],p1[1],p1[2]);
                            // pvia に向かわせる
                            let _ptmp = pvia.subtract(_p0).normalize();
                            let _p1 = _p0.add(_ptmp.scale(r));
                            for (let j = 0; j < 20; ++j) {
                                p2 = _p1.asArray();
                                skey = _key2(p2);
                                if (!fillgrid.has(skey)) {
                                    break; // 交差なし
                                }
                                let vrnd = BABYLON.Vector3.Random(-r01, r01);
                                _p1.addInPlace(vrnd);
                                _p1 = _p0.add(_p1.subtract(_p0).normalize().scale(r));
                            }
                            let len = BABYLON.Vector3.Distance(_p0, pvia);
                            // if (len < r*1.5) {
                            if (len < r*1.1) {
                                // 十分に接近と判断
                                if (pvialist.length > 0) {
                                    pvia = pvialist.pop();
                                    // n += 10;
                                } else {
                                    // fillgrid と交差する恐れあるので強制的にp1=p2に
                                    // (fillgridで交差していたらp2が捨てられるため)
                                    p1[0]=p2[0]; p1[1]=p2[1]; p1[2]=p2[2];
                                    i = n;
                                    break;
                                }
                            }
                        }

                    } else {
                        if (pitchType == 0) {
                            pitch += Math.asin(Math.random()*2-1)*0.2+0.01;
                            if (pitch > pitchTh) {
                                pitchType = -1;
                            } else if (pitch < -pitchTh) {
                                pitchType = 1;
                            }
                        } else if (pitchType == 1) {
                            // 上昇寄り
                            pitch += Math.asin(Math.min(1, Math.random()*2-0.5))*0.5;
                            if (pitch > 0) { pitchType = 0; }
                        } else if (pitchType == -1) {
                            // 下降寄り
                            pitch += Math.asin(Math.max(-1, Math.random()*2-1.5))*0.5;
                            if (pitch < 0) { pitchType = 0; }
                        }
                        if (Math.abs(p1[0]) > rng_ || Math.abs(p1[1]) > rng_ || Math.abs(p1[2]) > rng_) {
                            correctMode = 1;
                        } else if (Math.abs(p1[0]) < rng_2 && Math.abs(p1[1]) < rng_2 && Math.abs(p1[2]) < rng_2) {
                            correctMode = 0;
                        }
                        yaw_ = Math.asin(Math.random()*1.6-0.8)*0.8;
                        yaw += yaw_;
                        p2[0] = p1[0] + r*Math.cos(pitch)*Math.cos(yaw);
                        p2[2] = p1[2] + r*Math.cos(pitch)*Math.sin(yaw);
                        p2[1] = p1[1] + r*Math.sin(pitch);
                        if (correctMode) {
                            // 原点方向に向かうように yaw を補正する
                            let vt = new BABYLON.Vector3(p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]).normalize();
                            let vp1 = new BABYLON.Vector3(p1[0],p1[1],p1[2]).normalize();
                            let rad = Math.acos(Math.max(-1,Math.min(1,vt.dot(vp1))));
                            // ズレの向き確認
                            let vn = BABYLON.Vector3.Up();
                            let vb = BABYLON.Vector3.Cross(vt, vn).normalize();
                            let dirflag = vb.dot(vp1);
                            if (dirflag >= 0) {
                                yaw += -rad*0.03;
                            } else {
                                yaw += rad*0.03;
                            }
                            p2[0] = p1[0] + r*Math.cos(pitch)*Math.cos(yaw);
                            p2[2] = p1[2] + r*Math.cos(pitch)*Math.sin(yaw);
                        }
                    }
                    skey = _key2(p2);
                    if (fillgrid.has(skey)) {
                        if (geoHist.length > 0) {
                            // 交差 .. geoHist から pop()して経路を戻ってやり直し
                            let tmp = geoHist.pop();
                            [p1[0], p1[1], p1[2], pitch, yaw, pitchType] = tmp;
                            courseGeo.data.pop();
                        } else {
                            if (courseGeo.data.length <= 10) {
                                _iniPara();
                                i = 0;
console.log(" retry i=0");
                            } else {
                                i = n;
                                // iloop = nloop;
                            }
                            break;
                        }
                    } else {
                        // 交差なし：問題なし
                        // fillgrid に登録
                        _setgrid(p1,p2,fillgrid);
                        p1[0]=p2[0]; p1[1]=p2[1]; p1[2]=p2[2];
                        geoHist.push([p1[0], p1[1], p1[2], pitch, yaw, pitchType]);
                        if (geoHist.length > geoHistMax) { geoHist.shift(); }
                    }
                }
                courseGeo.data.push([p1[0], p1[2], p1[1]]);
                // courseGeo.data.push([x, z, y]);
// console.log("log data.len=", courseGeo.data.length, ", hist=", geoHist.length, ", fillgrid=", fillgrid.size);
            }

            if (1) {
                // courseGeo.dataの始点と終点を確認し r 以上なら補間点を追加
                // pn から p0 に向かって内分点を打つ
                let p0 = new BABYLON.Vector3(courseGeo.data[0][0], courseGeo.data[0][2], courseGeo.data[0][1]);
                let m = courseGeo.data.length, n1=m-1;
                let pn = new BABYLON.Vector3(courseGeo.data[n1][0], courseGeo.data[n1][2], courseGeo.data[n1][1]);
                let len0n = BABYLON.Vector3.Distance(p0, pn);
                if (len0n > r*1.5) {
                    let ndiv = Math.ceil(len0n/r); // , ndiv_=ndiv-1;
                    for (let idiv = 1; idiv < ndiv; ++idiv) {
                        let s = idiv/ndiv;
                        let p = p0.scale(s).add(pn.scale(1-s));
                        let pa = p.asArray();
                        courseGeo.data.push([pa[0], pa[2], pa[1]]);
                    }
                }
                if (1) {
                    // 始点に近くにも配置しておく
                    let s = 0.95;
                    let p = p0.scale(s).add(pn.scale(1-s));
                    let pa = p.asArray();
                    courseGeo.data.push([pa[0], pa[2], pa[1]]);
                }
            }

        }
        return courseGeo;
    }

    let getPoint3List = function(courseMetaMesh) {
        let meshType = typeof(courseMetaMesh.meshType) !== 'undefined' ? courseMetaMesh.meshType : "line";
        let useSpline = typeof(courseMetaMesh.useSpline) !== 'undefined' ? courseMetaMesh.useSpline : true;
        let nbPoints = typeof(courseMetaMesh.nbPoints) !== 'undefined' ? courseMetaMesh.nbPoints : 10;
        let isLoopCourse = typeof(courseMetaMesh.isLoopCourse) !== 'undefined' ? courseMetaMesh.isLoopCourse : true;
        let iy = typeof(courseMetaMesh.iy) !== 'undefined' ? courseMetaMesh.iy : 5;
        let iystep = typeof(courseMetaMesh.iystep) !== 'undefined' ? courseMetaMesh.iystep : 0;
        let grndW = typeof(courseMetaMesh.grndW) !== 'undefined' ? courseMetaMesh.grndW : 200;
        let grndH = typeof(courseMetaMesh.grndH) !== 'undefined' ? courseMetaMesh.grndH : 200;
        let scale = typeof(courseMetaMesh.scale) !== 'undefined' ? courseMetaMesh.scale : 1;
        let scaleY = typeof(courseMetaMesh.scaleY) !== 'undefined' ? courseMetaMesh.scaleY : 1;
        let adjx = typeof(courseMetaMesh.adjx) !== 'undefined' ? courseMetaMesh.adjx : 0;
        let adjy = typeof(courseMetaMesh.adjy) !== 'undefined' ? courseMetaMesh.adjy : 0;
        let adjz = typeof(courseMetaMesh.adjz) !== 'undefined' ? courseMetaMesh.adjz : 0;
        let tubeCAP = typeof(courseMetaMesh.tubeCAP) !== 'undefined' ? courseMetaMesh.tubeCAP : BABYLON.Mesh.NO_CAP ;
        let nz = typeof(courseMetaMesh.nz) !== 'undefined' ? courseMetaMesh.nz : 0;
        let pQdiv = typeof(courseMetaMesh.pQdiv) !== 'undefined' ? courseMetaMesh.pQdiv : 0;
        let pQlist = typeof(courseMetaMesh.pQlist) !== 'undefined' ? courseMetaMesh.pQlist : [];
        let pQdbg = typeof(courseMetaMesh.pQdbg) !== 'undefined' ? courseMetaMesh.pQdbg : 0;
        let bubbleEnable = typeof(courseMetaMesh.bubbleEnable) !== 'undefined' ? courseMetaMesh.bubbleEnable : false;
        let reverse = typeof(courseMetaMesh.reverse) !== 'undefined' ? courseMetaMesh.reverse : false; // 逆走
        let soloEnable = typeof(courseMetaMesh.soloEnable) !== 'undefined' ? courseMetaMesh.soloEnable : false;
        let plist = [];
        let mZRot = typeof(courseMetaMesh.mZRot) !== 'undefined' ? courseMetaMesh.mZRot : {};
        let xzLbl = typeof(courseMetaMesh.xzLbl) !== 'undefined' ? courseMetaMesh.xzLbl : {};

        courseMetaMesh.isLoopCourse = isLoopCourse;

        if (courseMetaMesh.dtype=='xzy') {
            // .. カスタムでコースを作成する場合
            let ii =-1, ix, iz, iy;
            for (let tmp of courseMetaMesh.data) {
                ++ii;
                // xzLbl
                let vE = tmp[tmp.length-1];
                if (typeof(vE) == "string") {
                    xzLbl[ii] = vE;
                    let tmp2 = tmp.slice(0, tmp.length-1);
                    tmp = tmp2;
                }
                ix = tmp[0];
                iz = tmp[1];
                iy = tmp[2];
                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
            }
        }

        let plist3 = [];
        {
            let plist2 = []
            if(useSpline) {
                // 上記で取得した点列を、スプラインで補間
                let catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
                plist2 = catmullRom.getPoints();
            } else {
                plist2 = plist;
            }
            // if (1) {
            //     let nloop = 1, nstep = Math.floor(nbPoints/5);
            //     for (let iloop = 0; iloop < nloop; ++iloop) {
            //         let plist2_ = [];
            //         for (let i = 0; i < plist2.length; i+= nstep) {
            //             plist2_.push(plist2[i]);
            //         }
            //         let catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist2_, nstep, false);
            //         plist2 = catmullRom.getPoints();
            //     }
            // }

            // if (isLoopCourse) {
            //     // 始点、２番目を末尾に追加／ループとする
            //     // 3D的なループにするには始点だけでは途切れるっぽいので２番目も
            //     let p0 = plist2[0];
            //     plist2.push(new BABYLON.Vector3(p0.x, p0.y, p0.z));
            //     p0 = plist2[1];
            //     plist2.push(new BABYLON.Vector3(p0.x, p0.y, p0.z));
            // }
            // 目的地／中継地取得用の座標値列
            plist3 = plist2;
            if (reverse) {
                plist3 = plist2.slice().reverse();
            }
        }
        return plist3;
    }

    let getDiffRad = function(path3d) {
        // 始点と終点の角度のずれを計算
        const tangents = path3d.getTangents();
        const normals = path3d.getNormals();
        const n = tangents.length;
        const t0 = tangents[0];
        const n0 = normals[0];
        const nEnd = normals[n - 1]; // 終点(=始点と同じ位置)の法線
        // t0まわりの符号付き角度でズレを算出
        const b0 = BABYLON.Vector3.Cross(t0, n0).normalize();
        const cosA = BABYLON.Vector3.Dot(n0, nEnd);
        const sinA = BABYLON.Vector3.Dot(b0, nEnd);
        const deltaTheta = Math.atan2(sinA, cosA); // 蓄積したねじれ角
        return deltaTheta;
    }

    let showPath3Dv2 = function (path3d, size=1, sstep=0) {
        // path3D の接線(R)、法線(G)、従法線(B) の表示
        //  (外積の向きが) 従法線＝接線×法線 となるよう、従法線の向きを逆にしておく
        if (sstep <= 0) {
            // path3dの点ごとに表示
            const curve = path3d.getCurve();
            const tgts = path3d.getTangents();
            const norms = path3d.getNormals();
            const binorms = path3d.getBinormals();
            let vcTgt, vcNorm, vcBinorm;
            const line = BABYLON.MeshBuilder.CreateLines("curve", { points: curve }, scene);
            for (let i = 0; i < curve.length; i++) {
                vcTgt = BABYLON.MeshBuilder.CreateLines("tgt" + i, { points: [curve[i], curve[i].add(tgts[i].scale(size))] }, scene);
                vcNorm = BABYLON.MeshBuilder.CreateLines("norm" + i, { points: [curve[i], curve[i].add(norms[i].scale(size))] }, scene);
                vcBinorm = BABYLON.MeshBuilder.CreateLines("binorm" + i, { points: [curve[i], curve[i].add(binorms[i].scale(-size))] }, scene);
                vcTgt.color = BABYLON.Color3.Red();
                vcNorm.color = BABYLON.Color3.Green();
                // vcBinorm.color = BABYLON.Color3.Blue();
                vcBinorm.color = new BABYLON.Color3(0, 1, 1);
            }
        } else {
            // sstepで刻み、位置を補間する
            const curve = path3d.getCurve();
            let vcTgt, vcNorm, vcBinorm;
            const line = BABYLON.MeshBuilder.CreateLines("curve", { points: curve }, scene);
            for (let s = 0; s <= 1; s+=sstep) {
                let p = path3d.getPointAt(s);
                let pt = path3d.getTangentAt(s, true);
                let pn = path3d.getNormalAt(s, true);
                let pb = path3d.getBinormalAt(s, true);
                vcTgt = BABYLON.MeshBuilder.CreateLines("", { points: [p, p.add(pt.scale(size))] }, scene);
                vcNorm = BABYLON.MeshBuilder.CreateLines("", { points: [p, p.add(pn.scale(size))] }, scene);
                vcBinorm = BABYLON.MeshBuilder.CreateLines("", { points: [p, p.add(pb.scale(-size))] }, scene);
                vcTgt.color = BABYLON.Color3.Red();
                vcNorm.color = BABYLON.Color3.Green();
                // vcBinorm.color = BABYLON.Color3.Blue();
                vcBinorm.color = new BABYLON.Color3(0, 1, 1);
            }
        }
    }


    let meshStage = [];
    let meshAggInfo = [];
    let createStage = function(istage) {
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        let courseMetaMeshList = [];
        {
            let [ids, tlabel, tpath] = stageInfoList[istage];
console.log("istage=",istage);
console.log("tlabel=",tlabel);
            for (let id of ids) {
                if (!(id in _courseMetaMeshInfo)) {
                    console.log("L1591にマッピング情報がない");
                    continue;
                }
                let courseMetaMesh = _courseMetaMeshInfo[id];
                if ((typeof(courseMetaMesh.data) !== 'undefined')) {
                    // .data がある .. _courseMetaMeshInfo[id].data に CourseData*.DATA.test.xz* がある
                    // .. 別ファイルからコースデータ(.test.xz*)を持ってくる場合
                    ;
                } else if ((typeof(courseMetaMesh.data) === 'undefined') && (typeof(courseMetaMesh.cid) !== 'undefined')) {
                    // .. 幾何情報(courseGeo)から動的にコースデータ(.test.xz*)を作る場合
                    // コースの設計情報　取得
                    let courseGeo = _courseGeoInfo[courseMetaMesh.cid];
                    // 設計情報から点列情報を作成
                    courseGeo = createCourseData(courseGeo);
                    courseMetaMesh.data = courseGeo.data;
                } else {
                      console.assert(0);
                }
                courseMetaMeshList.push(courseMetaMesh);
            }
        }
        // 幾何と装飾情報からメッシュを作成
        // let pStart, pStart2, pGoal;
        // let path3dlist = [];
        for (let courseMetaMesh of courseMetaMeshList) {
            let plist3 = getPoint3List(courseMetaMesh);

//             // 周回している .. 始点と終点の角度（ずれ）を確認する
//             let diffRot = getDiffRad(path3d);
// console.log("diffRot=",diffRot);

            let meshType = typeof(courseMetaMesh.meshType) !== 'undefined' ? courseMetaMesh.meshType : "line";
            courseMetaMesh._meshType = meshType;
            {
                if (meshType == 'line') {
                    let mesh = BABYLON.MeshBuilder.CreateLines("lines", {points: plist3}, scene);
                    meshAggInfo.push([mesh,null]);

                } else if (meshType == 'tube') {
                    let tubeCAP = BABYLON.Mesh.NO_CAP;
                    let options = {path: plist3,
                                   sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                                   radius:1,
                                   // arc:1,
                                   cap:BABYLON.Mesh.NO_CAP,
                                  };
                    let mesh = BABYLON.MeshBuilder.CreateTube("", options, scene);
                    meshAggInfo.push([mesh,null]);

                } else if (meshType == 'extrude') {
                    // ひねり（ロール）を生かしたまま、周回時の始点と終点の角度ずれ（ロール角）を一致させる
                    let gardW=0.5, gardH=0.1;
                    const myShape = [
                        new BABYLON.Vector3(-gardW,  gardH, 0),
                        new BABYLON.Vector3(-gardW,  0    , 0),
                        new BABYLON.Vector3( gardW,  0    , 0),
                        new BABYLON.Vector3( gardW,  gardH, 0)
                    ];
                    let options = {shape: myShape,
                                   path: plist3,
                                   sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                                   cap:BABYLON.Mesh.NO_CAP,
                                  };
                    let path3d = new BABYLON.Path3D(plist3, BABYLON.Vector3.Up()); // 初期法線方向の固定化
                    let diffRot = getDiffRad(path3d);
                    if (diffRot != 0) {
                        // 始点・終点のねじれを修正
                        options.rotation = -diffRot / plist3.length;
                        options.closePath = true;
                    }
                    let mesh = BABYLON.MeshBuilder.ExtrudeShape("", options, scene);
                    meshAggInfo.push([mesh,null]);

                } else if (meshType == 'ribbon') {
                    // ひねり（ロール）を生かしたまま、周回時の始点と終点の角度ずれ（ロール角）を一致させる
                    // 基本 extrude と同じ
                    let path3d = new BABYLON.Path3D(plist3, BABYLON.Vector3.Up()); // 初期法線方向の固定化
                    // 周回時の始点と終点の角度ずれ（ロール角）を確認する
                    let diffRot = getDiffRad(path3d);

                    let plist3R = [], plist3L = [];
                    let size=.5, sstep=0.002, n = Math.floor(1/sstep), rstep, plist = [], vtlist = [], vnlist = [];
                    sstep=1/path3d.length()/2;
                    for (let s = 0; s < 1; s+=sstep) {
                        let p = path3d.getPointAt(s);
                        let vb = path3d.getBinormalAt(s, true);
                        let vt = path3d.getTangentAt(s, true);
                        rstep = -diffRot*s;
                        let quat = BABYLON.Quaternion.RotationAxis(vt, rstep);
                        vb.applyRotationQuaternionInPlace(quat);
                        plist3L.push(p.add(vb.scale(size)));
                        plist3R.push(p.add(vb.scale(-size)));
                        plist.push(p);
                        vtlist.push(vt);
                        let vn = path3d.getNormalAt(s, true);
                        vn.applyRotationQuaternionInPlace(quat);
                        vnlist.push(vn);
                    }
                    if (courseMetaMesh.isLoopCourse) {
                        plist3L.push(plist3L[0]);
                        plist3R.push(plist3R[0]);
                    }
                    let path3 = [plist3R, plist3L];
                    let mesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray:path3, sideOrientation:BABYLON.Mesh.DOUBLESIDE});
                    meshAggInfo.push([mesh,null]);
                    // courseMetaMesh._path3d = path3d;
                    courseMetaMesh._sstep = sstep;
                    courseMetaMesh._plist = plist;
                    courseMetaMesh._vtlist = vtlist;
                    courseMetaMesh._vnlist = vnlist;

                } else if (meshType == 'ribbon_up') {
                    // 常に従法線(binormal)が同一平面上／ロール無
                    let vN = BABYLON.Vector3.Up();
                    // let vN = BABYLON.Vector3.Random(-1, 1).normalize(); // 初期ロール角：ランダム xx
                    let path3d = new BABYLON.Path3D(plist3, vN); // 初期法線方向の固定化
console.log("path3d.len=", path3d.length());
                    let plist3R = [], plist3L = [];
                    let size=.5, sstep=0.002, plist = [], vtlist = [], vnlist = [];
                    // sstep=path3d.length()/266/500;
                    sstep=1/path3d.length()/2;
                    for (let s = 0; s < 1; s+=sstep) {
                        let p = path3d.getPointAt(s);
                        let vt = path3d.getTangentAt(s, true);
                        let vb = vt.cross(vN).normalize();
                        plist3L.push(p.add(vb.scale(size)));
                        plist3R.push(p.add(vb.scale(-size)));
                        plist.push(p);
                        vtlist.push(vt);
                        let vn = vb.cross(vt).normalize();
                        vnlist.push(vn);
                    }
                    if (courseMetaMesh.isLoopCourse) {
                        plist3L.push(plist3L[0]);
                        plist3R.push(plist3R[0]);
                    }
                    let path3 = [plist3R, plist3L];
                    let mesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray:path3, sideOrientation:BABYLON.Mesh.DOUBLESIDE});
                    meshAggInfo.push([mesh,null]);
                    courseMetaMesh._sstep = sstep;
                    courseMetaMesh._plist = plist;
                    courseMetaMesh._vtlist = vtlist;
                    courseMetaMesh._vnlist = vnlist;

                    // debug デバッグ表示、補間点 plist3 の表示
                    if (0) {
                        let n = plist3.length;
                        let n80 = Math.floor(n*0.92); // n80 以降は始点に向かって移動させる
                        let flagN80 = false;
                        for (let i = 0; i < n; ++i) {
                            let p = plist3[i];
                            let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:1}, scene);
                            mesh.position.copyFrom(p);
                            mesh.material = new BABYLON.StandardMaterial('', scene);
                            if (i == 0) {
                                mesh.material.diffuseColor = BABYLON.Color3.Blue();
                            } else if (i >= n80 && flagN80 == false) {
                                flagN80 = true;
                                mesh.material.diffuseColor = BABYLON.Color3.White();
                            } else if (i == n-1) {
                                mesh.material.diffuseColor = BABYLON.Color3.Red();
                            } else {
                                mesh.material.diffuseColor = BABYLON.Color3.Gray();
                                mesh.material.alpha = 0.4;
                            }
                        }
                    }
                    if (1) {
                        // スタート・ゴールの表示
                        let iclist = [[0, BABYLON.Color3.Blue()],
                                      // [Math.floor(plist3.length*0.92), BABYLON.Color3.White()],
                                      [plist3.length-1, BABYLON.Color3.Red()],
                                     ];
                        for (let [i,c]  of iclist) {
                            let p = plist3[i];
                            let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:1}, scene);
                            mesh.position.copyFrom(p);
                            mesh.material = new BABYLON.StandardMaterial('', scene);
                            mesh.material.diffuseColor = c; // BABYLON.Color3.Blue();
                            meshAggInfo.push([mesh,null]);
                        }
                    }

                } else if (meshType == 'extrude_rv') {
                    // 裏面あり（180度ひねって裏面も走る
                    let gardW=0.5, gardH=0.1;
                    const myShape = [
                        new BABYLON.Vector3(-gardW*1.1,  -gardH, 0),
                        new BABYLON.Vector3(-gardW,  gardH, 0),
                        new BABYLON.Vector3(-gardW,  0    , 0),
                        new BABYLON.Vector3( gardW,  0    , 0),
                        new BABYLON.Vector3( gardW,  gardH, 0),
                        new BABYLON.Vector3( gardW*1.1,  -gardH, 0)
                    ];
                    let options = {shape: myShape,
                                   path: plist3,
                                   sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                                   cap:BABYLON.Mesh.NO_CAP,
                                  };
                    let path3d = new BABYLON.Path3D(plist3, BABYLON.Vector3.Up()); // 初期法線方向の固定化
                    // let diffRot = getDiffRad(path3d);
                    let diffRot = getDiffRad(path3d) + R180;
                    if (diffRot != 0) {
                        // 始点・終点のねじれを修正
                        options.rotation = -diffRot / plist3.length;
                        options.closePath = true;
                    }
                    // options.firstNormal = BABYLON.Vector3.Random(-1, 1).normalize(); // 初期ロール角：ランダム
                    let mesh = BABYLON.MeshBuilder.ExtrudeShape("", options, scene);
                    meshAggInfo.push([mesh,null]);

                } else if (meshType == 'ribbon_rv') {
                    // ひねり（ロール）を生かしたまま、周回時の始点と終点の角度ずれ（ロール角）を一致させる
                    // 基本 extrude と同じ
                    let path3d = new BABYLON.Path3D(plist3, BABYLON.Vector3.Up()); // 初期法線方向の固定化
                    // 周回時の始点と終点の角度ずれ（ロール角）を確認する
                    let diffRot = getDiffRad(path3d) + R180;
                    let plist3R = [], plist3L = [];
                    let size=.5, sstep=0.002, n = Math.floor(1/sstep), rstep, plist = [], vtlist = [], vnlist = [];
                    for (let s = 0; s < 1; s+=sstep) {
                        let p = path3d.getPointAt(s);
                        let vb = path3d.getBinormalAt(s, true);
                        let vt = path3d.getTangentAt(s, true);
                        rstep = -diffRot*s;
                        let quat = BABYLON.Quaternion.RotationAxis(vt, rstep);
                        vb.applyRotationQuaternionInPlace(quat);
                        plist3L.push(p.add(vb.scale(size)));
                        plist3R.push(p.add(vb.scale(-size)));
                        plist.push(p);
                        vtlist.push(vt);
                        let vn = path3d.getNormalAt(s, true);
                        vn.applyRotationQuaternionInPlace(quat);
                        vnlist.push(vn);
                    }
                    if (courseMetaMesh.isLoopCourse) {
                        plist3L.push(plist3R[0]);
                        plist3R.push(plist3L[0]);
                    }
                    let path3 = [plist3R, plist3L];
                    let f = new BABYLON.Vector4(0.5,0, 1, 1); // front image = half the whole image along the width 
                    let b = new BABYLON.Vector4(0,0, 0.5, 1); // back image = second half along the width 
                    let mesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray:path3, sideOrientation:BABYLON.Mesh.DOUBLESIDE, frontUVs: f, backUVs: b});
                    meshAggInfo.push([mesh,null]);
                    courseMetaMesh._sstep = sstep;
                    courseMetaMesh._plist = plist;
                    courseMetaMesh._vtlist = vtlist;
                    courseMetaMesh._vnlist = vnlist;
                    // let fpathBlueRed = "./textures/blueRed.png";
                    mesh.material = new BABYLON.StandardMaterial("", scene);
                    mesh.material.diffuseTexture = new BABYLON.Texture(fpathBlueRed, scene);

                }
            }
        }
        return courseMetaMeshList;
    }
    let courseMetaMeshList = createStage(istage);

    // メッシュ表示
    let meshCamTrg = null;
    for (let courseMetaMesh of courseMetaMeshList) {
        if (courseMetaMesh._meshType == "ribbon_up") {
console.log("meshType=",courseMetaMesh._meshType);
            // let mesh = BABYLON.MeshBuilder.CreateBox("", { width:sx, height:sy, depth:sz }, scene);
            let mesh = BABYLON.MeshBuilder.CreateBox("", {size:0.5}, scene);
	    mesh.material = new BABYLON.StandardMaterial("");
	    mesh.material.diffuseColor = BABYLON.Color3.White();
	    mesh.material.alpha = 0.3;
            mesh._size = 0.5;
            mesh._size_ = mesh._size/2;
            mesh._i = 0;
            mesh._n = courseMetaMesh._plist.length;
            mesh._plist = courseMetaMesh._plist;
            mesh._vtlist = courseMetaMesh._vtlist;
            mesh._vnlist = courseMetaMesh._vnlist;
            meshCamTrg = mesh;

            // 初期設定
            mesh._i2 = (mesh._i+1) % mesh._n;
            // mesh.position.copyFrom(mesh._plist[mesh._i]);
            mesh.position.copyFrom(mesh._plist[mesh._i].add(mesh._vnlist[mesh._i].scale(mesh._size_)));
            // let vF = mesh._plist[mesh._i2].subtract(mesh._plist[mesh._i]).normalize();
            let vF = mesh._vtlist[mesh._i];
            let vU = mesh._vnlist[mesh._i];
            // 方向ベクトルからクォータニオンを作成
            mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(vF, vU);
            // mesh.lookAt(mesh.position.add(vF)); // 不要と思ったけど念のため（周回またぎで安定した!?）

            // レンダリング設定
            scene.onBeforeRenderObservable.add((scene) => {
                mesh._i = mesh._i2;
                mesh._i2 = (mesh._i+1) % mesh._n;
                mesh.position.copyFrom(mesh._plist[mesh._i].add(mesh._vnlist[mesh._i].scale(mesh._size_)));
                let vF = mesh._vtlist[mesh._i];
                let vU = mesh._vnlist[mesh._i];
                // 方向ベクトルからクォータニオンを作成
                mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(vF, vU);
            });

        } else if (courseMetaMesh._meshType == "ribbon") {
console.log("meshType=",courseMetaMesh._meshType);
            // let mesh = BABYLON.MeshBuilder.CreateBox("", { width:sx, height:sy, depth:sz }, scene);
            let mesh = BABYLON.MeshBuilder.CreateBox("", {size:0.5}, scene);
	    mesh.material = new BABYLON.StandardMaterial("");
	    mesh.material.diffuseColor = BABYLON.Color3.Blue();
	    mesh.material.alpha = 0.3;
            mesh._size = 0.5;
            mesh._size_ = mesh._size/2;
            mesh._i = 0;
            mesh._n = courseMetaMesh._plist.length;
            mesh._plist = courseMetaMesh._plist;
            mesh._vtlist = courseMetaMesh._vtlist;
            mesh._vnlist = courseMetaMesh._vnlist;
            meshCamTrg = mesh;

            // 初期設定
            mesh._i2 = (mesh._i+1) % mesh._n;
            // mesh.position.copyFrom(mesh._plist[mesh._i]);
            mesh.position.copyFrom(mesh._plist[mesh._i].add(mesh._vnlist[mesh._i].scale(mesh._size_)));
            // let vF = mesh._plist[mesh._i2].subtract(mesh._plist[mesh._i]).normalize();
            let vF = mesh._vtlist[mesh._i];
            let vU = mesh._vnlist[mesh._i];
            // 方向ベクトルからクォータニオンを作成
            mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(vF, vU);
            // mesh.lookAt(mesh.position.add(vF)); // 不要と思ったけど念のため（周回またぎで安定した!?）

            // レンダリング設定
            scene.onBeforeRenderObservable.add((scene) => {
                mesh._i = mesh._i2;
                mesh._i2 = (mesh._i+1) % mesh._n;
                // mesh.position.copyFrom(mesh._plist[mesh._i]);
                mesh.position.copyFrom(mesh._plist[mesh._i].add(mesh._vnlist[mesh._i].scale(mesh._size_)));
                // let vF = mesh._plist[mesh._i2].subtract(mesh._plist[mesh._i]).normalize();
                let vF = mesh._vtlist[mesh._i];
                let vU = mesh._vnlist[mesh._i];
                // 方向ベクトルからクォータニオンを作成
                mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(vF, vU);
                // mesh.lookAt(mesh.position.add(vF));
            });

        } else if (courseMetaMesh._meshType == "ribbon_rv") {
console.log("meshType=",courseMetaMesh._meshType);
            // let mesh = BABYLON.MeshBuilder.CreateBox("", { width:sx, height:sy, depth:sz }, scene);
            let mesh = BABYLON.MeshBuilder.CreateBox("", {size:0.5}, scene);
	    mesh.material = new BABYLON.StandardMaterial("");
	    mesh.material.diffuseColor = BABYLON.Color3.Green();
	    mesh.material.alpha = 0.3;
            mesh._size = 0.5;
            mesh._size_ = mesh._size/2;
            mesh._i = 0;
            mesh._n = courseMetaMesh._plist.length;
            mesh._plist = courseMetaMesh._plist;
            mesh._vtlist = courseMetaMesh._vtlist;
            mesh._vnlist = courseMetaMesh._vnlist;
            mesh._loop = 0;
            mesh._flip = 1;
            meshCamTrg = mesh;

            // 初期設定
            mesh._i2 = (mesh._i+1) % mesh._n;
            // mesh.position.copyFrom(mesh._plist[mesh._i]);
            mesh.position.copyFrom(mesh._plist[mesh._i].add(mesh._vnlist[mesh._i].scale(mesh._size_)));
            // let vF = mesh._plist[mesh._i2].subtract(mesh._plist[mesh._i]).normalize();
            let vF = mesh._vtlist[mesh._i];
            let vU = mesh._vnlist[mesh._i];
            // 方向ベクトルからクォータニオンを作成
            mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(vF, vU);
            // mesh.lookAt(mesh.position.add(vF)); // 不要と思ったけど念のため（周回またぎで安定した!?）

            // レンダリング設定
            scene.onBeforeRenderObservable.add((scene) => {
                mesh._i = mesh._i2;
                mesh._i2 = mesh._i+1;
                if (mesh._i2 == mesh._n) {
                    mesh._i2 = 0;
                    ++mesh._loop;
                    mesh._flip *= -1;
                }
                mesh.position.copyFrom(mesh._plist[mesh._i].add(mesh._vnlist[mesh._i].scale(mesh._size_*mesh._flip)));
                // let vF = mesh._plist[mesh._i2].subtract(mesh._plist[mesh._i]).normalize();
                let vF = mesh._vtlist[mesh._i];
                let vU = mesh._vnlist[mesh._i].scale(mesh._flip);
                // 方向ベクトルからクォータニオンを作成
                mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(vF, vU);
                // mesh.lookAt(mesh.position.add(vF));
            });

        } else {
console.log("meshType=", courseMetaMesh._meshType);

        }
    }

//    camera = crCameraDef();// debug
//    camera = crCamera3(meshCamTrg);
    // camera = crCamera3_1(meshCamTrg);
    // camera = crCamera3_2(meshCamTrg);
    camera = crCamera4(meshCamTrg);

    return scene;
};

// ######################################################################

// ======================================================================
//--------------------

export var createScene = createScene_test_2012;

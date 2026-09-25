//  スロープトイ（偏芯ボール

// ######################################################################

export var createScene_test_3003 = async function () {
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

    var scene = new BABYLON.Scene(engine);

    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 15, new BABYLON.Vector3(0, 0, 0));
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        return _camera;
    }
    let crCamera5 = function(meshTrg) {
        // 上空から見下ろすトップビュー
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100,-0.01), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // キーボード入力だけをピンポイントで削除
        return _camera;
    }
    let crCamera5_2 = function(meshTrg) {
        // ボールを一方向から追跡：平行移動
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 10, -20), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // キーボード入力だけをピンポイントで削除
        // _camera.useAutoRotationBehavior = true; // 自動でゆっくり回転
        _camera.alpha = 0;
        return _camera;
    }
    let crCamera5_3 = function(meshTrg) {
        // ボールを後方から追跡
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 2, -10), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // キーボード入力だけをピンポイントで削除
        scene.onBeforeRenderObservable.add((scene) => {
            if (camera.lockedTarget != null) {
                // meshTrg とカメラ位置に応じて ヨー回転
                let myMesh = camera.lockedTarget;
                let vt = myMesh.position.subtract(camera.position).normalize();
                let rad = Math.atan2(vt.x, vt.z);
                camera.alpha = -rad - Math.PI/2;
            }
        });
        return _camera;
    }
//    camera = crCameraDef();

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // ステージ情報（１ステージに複数コース可）
    const stageInfoList = [
        // istage, label, fpathCourseImg
        [[11102], "0.ローラーコースター", ""],
        [[10201], "1.スロープトイ", ""],
        [[10301,10302,10303,10304,10305,10306,10307], "2.スロープトイ", ""],
    ];
    let nstage = stageInfoList.length;


    // コースのメタ・メッシュ情報
    const _courseMetaMeshInfo = {
        11102:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               // grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.5, 
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:102,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },
        10201:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               // cid:201, courseW:3, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               cid:201, courseW:3, courseH:1,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        10301:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:301, courseW:2.2, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               // cid:301, courseW:3, courseH:1,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },
        10302:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:302, courseW:1.1, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               // adjx:5.5, adjz:5, adjy:4.6,
               adjx:5.5, adjz:5, adjy:4.1,
               nbPoints:10,
              },
        10303:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:303, courseW:1.1, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               // adjx:4.5, adjz:5, adjy:4.6,
               adjx:4.5, adjz:5, adjy:4.1,
               nbPoints:10,
              },
        10304:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:304, courseW:2.2, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               // adjx:16.8, adjz:13, adjy:-2.9,
               adjx:16.8, adjz:13, adjy:-3.4,
               nbPoints:10,
              },
        10305:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:305, courseW:1.1, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               // adjx:4.5, adjz:5, adjy:4.6,
               adjx:16.3, adjz:-5, adjy:-9,
               nbPoints:10,
              },
        10306:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:306, courseW:1.1, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               // adjx:4.5, adjz:5, adjy:4.6,
               adjx:17.3, adjz:-5, adjy:-9,
               nbPoints:10,
              },
        10307:{dtype:"xzy",
               // meshType:"tube", // 常にUP
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:307, courseW:2.2, courseH:2, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               // adjx:14.0, adjz:-53, adjy:-47.0+1, // tube
               adjx:14.0, adjz:-53, adjy:-47.0,
               nbPoints:10,
              },

    };

    // コースの幾何情報
    const _courseGeoInfo = {
        // ------------------------------
        102:{
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
                {shape:"s", h:0},
                {shape:"r", rot:R90, size:100, div:8},
                {shape:"s", size:100, div:8},
                {shape:"l", h:20, rot:R270, size:50, div:12},
                {shape:"s", h:0, size:50, div:4},
                {shape:"s", h:0},
                {shape:"ssin", h:-10, size:150, div:12},
                {shape:"s", h:0, size:50, div:4},
                {shape:"l", h:-20, rot:R270, size:50, div:12},
                {shape:"s", h:0, size:50, div:4},
                {shape:"r", rot:R90, size:50, div:4},
            ],
        },

        201:{
            type:"program",
            metaInfo:[
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4},
                {shape:"r", size:20, div:4, rot:R90},
                {shape:"r", size:10, div:4, rot:R90},
                {shape:"r", size:10, div:4, rot:R90},
                {shape:"l", size:10, div:4, rot:R90},
                {shape:"ssin", size:30, div:8, h:-10},
                {shape:"l", size:30, div:4, rot:R45, h:-1},
                {shape:"r", size:30, div:4, rot:R45},
                {shape:"s", size:30, div:4},
                {shape:"l", size:20, div:4, rot:R90},
                {shape:"l", size:20, div:4, rot:R90},
                {shape:"l", size:20, div:4, rot:R45},
                {shape:"s", size:30, div:4},
                {shape:"r", size:20, div:4, rot:R45},
                {shape:"s", size:30, div:4},
                {shape:"r", size:30, div:4, rot:R45},
                {shape:"l", size:30, div:4, rot:R45},
                {shape:"s", size:30, div:4},
                {shape:"l", size:30, div:4, rot:R90},
                {shape:"l", size:20, div:4, rot:R90},
                {shape:"l", size:20, div:4, rot:R90},
                {shape:"ssin", size:30, div:8, h:-10},
                {shape:"r", size:30, div:4, rot:R90, h:-1},
                {shape:"ssin", size:30, div:8, h:-10},
                {shape:"ssin", size:30, div:8, h:+5},
                {shape:"ssin", size:30, div:8, h:-10},
                {shape:"ssin", size:30, div:8, h:+5},
                {shape:"s", size:30, div:4, h:-1},
                {shape:"l", size:5, div:4, rot:R90},
                {shape:"l", size:5, div:4, rot:R90},
                {shape:"s", size:30, div:4},
                {shape:"s", size:30, div:4},
                {shape:"s", size:30, div:4},
                {shape:"s", size:30, div:4},
                {shape:"s", size:30, div:4},
                {shape:"l", size:40, div:4, rot:R45},
                {shape:"r", size:40, div:4, rot:R45},
                {shape:"r", size:20, div:4, rot:R90},
                {shape:"r", size:15, div:4, rot:R90},
                {shape:"s", size:30, div:4},
                {shape:"s", size:30, div:4},
                {shape:"l", size:20, div:4, rot:R45},
                {shape:"r", size:20, div:4, rot:R45},
                {shape:"r", size:20, div:4, rot:R45},
                {shape:"l", size:20, div:4, rot:R45},
                {shape:"s", size:30, div:4},
                {shape:"l", size:20, div:4, rot:R45},
                {shape:"r", size:20, div:4, rot:R45},
                {shape:"r", size:20, div:4, rot:R45},
                {shape:"l", size:20, div:4, rot:R45},
                {shape:"s", size:10, div:4},
                {shape:"r", size:20, div:4, rot:R90, h:-4},
                {shape:"s", size:35, div:4, h:42.4},
                {shape:"s", size:35, div:4, h:42.4},
                {shape:"s", size:8.5, div:4, h:-1},
                {shape:"r", size:5, div:4, rot:R90, h:-1},
                {shape:"s", size:30, div:4},
                {shape:"s", size:30, div:4},
                // {shape:"s", size:10, div:4},
            ],
        },

        301:{
            type:"program",
            metaInfo:[
                {shape:"s", size:40, div:4, h:-1},
            ],
        },
        302:{
            type:"program",
            metaInfo:[
                {shape:"s", size:40, div:4, h:-1},
                {shape:"ssin", size:40, div:8, h:-8,},
                {shape:"s", size:5, div:4, h:-0.5},
                {shape:"r", size:10, div:4, rot:R90, h:-1},
                {shape:"r", size:11.5, div:4, rot:R90},
                {shape:"s", size:20, div:4},
                {shape:"s", size:20, div:4},
                {shape:"s", size:20, div:4},
                {shape:"s", size:10, div:4, h:-0.5},
            ],
        },
        303:{
            type:"program",
            metaInfo:[
                {shape:"s", size:40, div:4, h:-1},
                {shape:"s", size:20, div:4},
                {shape:"r", size:10, div:4, rot:R45},
                {shape:"l", size:10, div:4, rot:R45},
                {shape:"s", size:10, div:4},
                {shape:"r", size:10, div:4, rot:R90},
                {shape:"r", size:10, div:4, rot:R90},
                {shape:"s", size:20, div:4},
                {shape:"ssin", size:40, div:8, h:-6.5,},
                {shape:"s", size:11, div:4, h:-0.5},
            ],
        },
        304:{
            type:"program",
            metaInfo:[
                {shape:"s", size:10, div:4, h:-1, dir:R90,},
                {shape:"ssin", size:20, div:8, h:-8,},
                {shape:"s", size:10, div:8, h:-1,},
            ],
        },
        305:{
            type:"program",
            metaInfo:[
                {shape:"s", size:10, div:4, h:-1, dir:R90,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"r", size:10, div:4, rot:R90},
                {shape:"r", size:10, div:4, rot:R90},
                {shape:"r", size:10, div:4, rot:R45},
                {shape:"ssin", size:20, div:8, h:-8,},
                {shape:"ssin", size:2, div:8, h:-8,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"s", size:10, div:4,},
                {shape:"s", size:10, div:4,},
                {shape:"l", size:10, div:4, rot:R90},
                // {shape:"s", size:10, div:4,},
                // {shape:"ssin", size:10, div:8, h:-11,},
                {shape:"ssin", size:30, div:8, h:-12,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"s", size:10, div:4,},
                {shape:"r", size:20, div:4, rot:R90, h:-1.5},
                {shape:"r", size:20, div:4, rot:R90},
                {shape:"r", size:20, div:4, rot:R90, h:-1},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"s", size:10, div:4, h:-1,},
//                {shape:"s", size:5, div:4, h:-1,},
                {shape:"ssin", size:2, div:8, h:-10,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"l", size:20, div:4, rot:R90},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"s", size:3, div:4, h:-1,},
                {shape:"ssin", size:2, div:8, h:-10,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"r", size:38, div:8, rot:R90},
                {shape:"l", size:38.5, div:8, rot:R45},
                {shape:"s", size:10, div:4, h:-1,},
            ],
        },
        306:{
            type:"program",
            metaInfo:[
                {shape:"s", size:10, div:4, h:-1, dir:R90,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"l", size:10, div:4, rot:R90},
                {shape:"l", size:10, div:4, rot:R90},
                {shape:"l", size:10, div:4, rot:R45},
                {shape:"ssin", size:20, div:8, h:-13,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"s", size:10, div:4,},
                {shape:"s", size:10, div:4,},
                {shape:"r", size:10, div:4, rot:R90},
                // {shape:"s", size:10, div:4,},
                // {shape:"ssin", size:10, div:8, h:-8,},
                {shape:"ssin", size:19, div:8, h:-8,},
                {shape:"ssin", size:4, div:8, h:-9,},
                // {shape:"s", size:10, div:4, h:-2,},
                // {shape:"s", size:10, div:4,},
                {shape:"ssin", size:23, div:8, h:-3,},
                {shape:"l", size:25, div:4, rot:R90, h:-0.5},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"s", size:5, div:4, h:-1,},
                {shape:"ssin", size:2, div:8, h:-10,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"r", size:20, div:4, rot:R90},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"s", size:2, div:4, h:-1,},
                {shape:"ssin", size:2, div:8, h:-10,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"l", size:38, div:8, rot:R90},
                {shape:"r", size:38.5, div:8, rot:R45},
                {shape:"s", size:10, div:4, h:-1,},
            ],
        },
        307:{
            type:"program",
            metaInfo:[
                {shape:"s", size:10, div:4, h:-1, dir:R90,},
                {shape:"s", size:10, div:4, h:-1,},
                {shape:"r", size:10, div:8, rot:R90, h:-2,},
                {shape:"r", size:8.0, div:8, rot:R90, h:-2,},
                {shape:"s", size:10, div:2, h:-1,},
                {shape:"s", size:6, div:1, h:0,},
                {shape:"s", size:90, div:8, h:+113,},
                // {shape:"s", size:12, div:4, h:-1,},
                {shape:"s", size:6, div:1, h:+0,},
                {shape:"s", size:10, div:2, h:-1,},
            ],
        },

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
            let nloop = typeof(courseGeo.nloop) !== 'undefined' ? courseGeo.nloop : 2;
            let loopy = typeof(courseGeo.loopy) !== 'undefined' ? courseGeo.loopy : 30;//１周分での高さ
            let r = typeof(courseGeo.r) !== 'undefined' ? courseGeo.r : 100;
            let n = nloop*72, stepy = loopy/72, irad, x, y, z;
            const R5 = Math.PI/36;
            for (let i = 0; i < n; ++i) {
                irad = -i * R5;
                x = r*Math.cos(irad); y = i*stepy; z = r*Math.sin(irad);
                courseGeo.data.push([x, z, y]);
            }

        } else if (courseGeo.type == 'rec_xzRR') {
            // ４番目の引数で等差、１つ前の点との距離で差分を調整
            // ５番目の引数で回転角
            let iystep = typeof(courseGeo.iystep) !== 'undefined' ? courseGeo.iystep : 0;
            let scale = typeof(courseGeo.scale) !== 'undefined' ? courseGeo.scale : 1;
            let nz = typeof(courseGeo.nz) !== 'undefined' ? courseGeo.nz : 0;
            let iyrate = iystep*scale/5, ii=-1, ix=0, iy=0, iz=0, dis, ix_, iz_, iy_, jj=-1, zRot=0, zRot_, _iyrate;
            let iystep2=iystep, iyrate2=iystep2*scale/5, ix2=0, iz2=0, iy2=iy, _iyrate2;
            let iy_2, zRot_2, zRot2=0;
            let tmp = courseGeo.dataOrg[0];
            ix_ = (tmp.length >= 1) ? tmp[0] : 0;
            iz_ = (tmp.length >= 2) ? tmp[1] : 0;
            iyrate = (tmp.length >= 4) ? tmp[3] : 0;
            let mZRot = []
            for (let tmp of courseGeo.dataOrg) {
                ++ii; ++jj;
                // xzLbl
                let vE = tmp[tmp.length-1];
                if (typeof(vE) == "string") {
                    courseGeo.xzLbl[ii] = vE;
                    let tmp2 = tmp.slice(0, tmp.length-1);
                    tmp = tmp2;
                }
                {
                    ix = tmp[0];
                    iz = tmp[1];
                    iy_ = (tmp.length >= 3) ? tmp[2] : null;  // 高さ 絶対値
                    _iyrate = (tmp.length >= 4) ? tmp[3] : null; // 高さ 傾き
                    if (_iyrate !== null) {
                        iyrate = _iyrate * scale/5;
                    }
                    if (iy_ === null) {
                        dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                        iystep = iyrate*dis;
                        iy += iystep;
                        courseGeo.data.push([ix, iz, iy]);

                    } else {
                        iy = iy_ + iystep;
                        courseGeo.data.push([ix, iz, iy_]);

                    }
                }
                [ix_,iz_] = [ix,iz];
            }

        } else if (courseGeo.type == 'rec_xzy') {
            courseGeo.data = courseGeo.dataOrg;

        } // if (courseGeo.type == 'program') {
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
            // 目的地／中継地取得用の座標値列
            plist3 = plist2;
            if (reverse) {
                plist3 = plist2.slice().reverse();
            }
        }
        return plist3;
    }

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
//            setText2(tlabel);
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
        for (let courseMetaMesh of courseMetaMeshList) {
            let plist3 = getPoint3List(courseMetaMesh);

            let meshType = typeof(courseMetaMesh.meshType) !== 'undefined' ? courseMetaMesh.meshType : "line";
            courseMetaMesh._meshType = meshType;

//            courseMetaMesh._cameraAlphaIni = typeof(courseMetaMesh.cameraAlphaIni) !== 'undefined' ? courseMetaMesh.cameraAlphaIni : -R90;
            if (typeof(courseMetaMesh.cameraAlphaIni) !== 'undefined') {
                courseMetaMesh._cameraAlphaIni = courseMetaMesh.cameraAlphaIni;
            } else {
                let p = plist3[10].subtract(plist3[0]);
                let rad = Math.atan2(p.x, p.z);
                courseMetaMesh._cameraAlphaIni = -rad - Math.PI/2;
            }

            {
                if (meshType == 'tube') {
                    let tubeCAP = BABYLON.Mesh.NO_CAP;
                    let options = {path: plist3,
                                   sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                                   radius:1.0,
                                   cap:BABYLON.Mesh.NO_CAP,
                                  };
                    if (courseMetaMesh.isLoopCourse) {
                        plist3.push(plist3[0]);
                    }
                    let mesh = BABYLON.MeshBuilder.CreateTube("", options, scene);
                    mesh.material = new BABYLON.StandardMaterial("");
                    mesh.material.diffuseColor = new BABYLON.Color3(0.2, 1.0, 0.4);
                    mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
                    mesh.material.wireframe = 1;
                    let fric=1, rest=0.1;
                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:fric, restitution:rest}, scene);
                    meshAggInfo.push([mesh,null]);
                    courseMetaMesh._plist = plist3;

                } else if (meshType == 'ribbon_up') {
                    // 常に従法線(binormal)が同一平面上／ロール無
                    let courseW = typeof(courseMetaMesh.courseW) !== 'undefined' ? courseMetaMesh.courseW : 10;
                    let courseH = typeof(courseMetaMesh.courseH) !== 'undefined' ? courseMetaMesh.courseH : 2;
                    let courseCAP = typeof(courseMetaMesh.courseCAP) !== 'undefined' ? courseMetaMesh.courseCAP : BABYLON.Mesh.NO_CAP;
                    let courseFric = typeof(courseMetaMesh.courseFric) !== 'undefined' ? courseMetaMesh.courseFric : 1;
                    let courseRest = typeof(courseMetaMesh.courseRest) !== 'undefined' ? courseMetaMesh.courseRest : 0.1;
                    let vN = BABYLON.Vector3.Up();
                    let path3d = new BABYLON.Path3D(plist3, vN); // 初期法線方向の固定化
                    let plist3R = [], plist3L = [], plist3RE = [], plist3LE = [];
                    let size=courseW/2, sizeH=courseH, sstep=0.002, plist = [], vtlist = [], vnlist = [];
                    sstep=1/path3d.length()/2;
                    for (let s = 0; s < 1; s+=sstep) {
                        let p = path3d.getPointAt(s);
                        let vt = path3d.getTangentAt(s, true);
                        let vb = vt.cross(vN).normalize();
                        let vn = vb.cross(vt).normalize();
                        let pL = p.add(vb.scale(size));
                        plist3L.push(pL);
                        let pR = p.add(vb.scale(-size));
                        plist3R.push(pR);
                        let pLE = pL.add(vn.scale(sizeH));
                        plist3LE.push(pLE);
                        let pRE = pR.add(vn.scale(sizeH));
                        plist3RE.push(pRE);
                        plist.push(p);
                        vtlist.push(vt);
                        vnlist.push(vn);
                    }
                    if (courseMetaMesh.isLoopCourse) {
                        plist3L.push(plist3L[0]);
                        plist3R.push(plist3R[0]);
                        plist3LE.push(plist3LE[0]);
                        plist3RE.push(plist3RE[0]);
                    } else {
                        // CAP/ 両端に蓋をする
                        let ps = plist3L[0].add(plist3R[0]).add(plist3LE[0]).add(plist3RE[0]).scale(1/4);
                        let n_ =plist3L.length-1;
                        let pe = plist3L[n_].add(plist3R[n_]).add(plist3LE[n_]).add(plist3RE[n_]).scale(1/4);
                        if (courseCAP == BABYLON.Mesh.CAP_ALL || courseCAP == BABYLON.Mesh.CAP_START) {
                            plist3L.unshift(ps);
                            plist3R.unshift(ps);
                            plist3LE.unshift(ps);
                            plist3RE.unshift(ps);
                        }
                        if (courseCAP == BABYLON.Mesh.CAP_ALL || courseCAP == BABYLON.Mesh.CAP_END) {
                            plist3L.push(pe);
                            plist3R.push(pe);
                            plist3LE.push(pe);
                            plist3RE.push(pe);
                        }
                    }
                    let path3 = [plist3LE, plist3L, plist3R, plist3RE];
                    let mesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray:path3, sideOrientation:BABYLON.Mesh.DOUBLESIDE});
                    mesh.material = new BABYLON.StandardMaterial("");
                    mesh.material.diffuseColor = new BABYLON.Color3(0.2, 1.0, 0.4);
                    mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
                    mesh.material.wireframe = 1;
                    let fric=courseFric, rest=courseRest;
                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:fric, restitution:rest}, scene);
                    meshAggInfo.push([mesh,null]);
                    courseMetaMesh._sstep = sstep;
                    courseMetaMesh._plist = plist;
                    courseMetaMesh._vtlist = vtlist;
                    courseMetaMesh._vnlist = vnlist;
                } // else if (meshType == '...') {

            }
        }
        return courseMetaMeshList;
    }

    let crBall = function(r, posi) {
        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: r }, scene);
        mesh.position.copyFrom(posi);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1}, scene);
        return mesh;
    }

    let istage = 2; // 激重
    let courseMetaMeshList = createStage(istage);
    let p0 = courseMetaMeshList[0]._plist[3];

    camera = crCameraDef(); // デバッグ／コースSS用

    if (istage == 1) {
        let popCool = 0, popCoolMax = 100, npop = 100, ipop = 0, r=2;
        let meshBall = [];
        let pini = p0.add(new BABYLON.Vector3(0, 2, 0));
        let fn201a = function() {
            // 一定時間ごとに ball を pop
            if ((ipop < npop) && (--popCool < 0)) {
                ++ipop;
                popCool = popCoolMax;
                let mesh = crBall(r, pini);
                let vdir = BABYLON.Vector3.Forward().scale(100);
                mesh.physicsBody.applyForce(vdir, mesh.absolutePosition);
                meshBall.push(mesh);
                if (meshBall.length == 1) {
                    mesh.material = new BABYLON.StandardMaterial("");
                    mesh.material.diffuseColor = BABYLON.Color3.Red();
                    // mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
//                     camera.lockedTarget = mesh;
// //                    camera.alpha = 0;
                }
            }
            for (let m of meshBall) {
                if (m.position.y < -100) {
                    mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
                    mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                    m.position.copyFrom(pini);
                }
            }
        }
        let fnobj201a = scene.onBeforeRenderObservable.add(fn201a);

        let mesh201blist = [], nmesh201 = 20, path3d201;
        {
            let xmin=15, xmax=49, ymax=6, ymin=-36, z = -46;
            let datalist = [
                [xmin, ymax, z],
                [xmin, ymax-5, z],
                [xmax, ymin-5, z],
                [xmax, ymin, z],
            ];
            let plist = [];
            for (let d of datalist) {
                plist.push(new BABYLON.Vector3(d[0], d[1], d[2]))
            }
            // 点列plist を補間、スムージング
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 5, true);//clse
            const plist2 = catmullRom.getPoints();
            // 曲線情報path3dを作成
            let path3d = new BABYLON.Path3D(plist2);
            path3d201 = path3d;
            if (0) {
                // plist のデバッグ表示
                let mesh = BABYLON.CreateGreasedLine(
                    "", {points:plist2,
                         widths:[4],
                         widthDistribution:BABYLON.GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_REPEAT,
                        }, {color:BABYLON.Color3.Red(),}, scene);
            }
            // let n = 10;
            for (let i = 0; i < nmesh201; ++i) {
                let s = i / nmesh201;
                // let p = path3d.getPointAt(s);
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.1, depth:2}, scene);
                mesh._s = s;
                mesh.position.copyFrom(path3d.getPointAt(s));
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0, friction:0.9, restitution:0.1}, scene);
                mesh._agg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
                mesh.physicsBody.disablePreStep = false;
                mesh201blist.push(mesh);
            }
        }
        let fn201b = function() {
            const targetRot = BABYLON.Quaternion.Identity();
            for (let mesh of mesh201blist) {
                // mesh._s += 0.001;
                mesh._s += 0.0005;
                if (mesh._s >= 1) {mesh._s -= 1;}
                mesh._agg.body.setTargetTransform(path3d201.getPointAt(mesh._s), targetRot);
            }
        }
        let fnobj201b = scene.onBeforeRenderObservable.add(fn201b);
    }

    if (istage == 2) {
        let popCool = 0, popCoolMax = 50, npop = 100, ipop = 0, r=0.9;
        let meshBall = [];
        let pini = p0.add(new BABYLON.Vector3(0, 2, 0));
        // pini = new BABYLON.Vector3(14, -40, -45); // 最下端位置
        let fn201a = function() {
            // 一定時間ごとに ball を pop
            if ((ipop < npop) && (--popCool < 0)) {
                ++ipop;
                popCool = popCoolMax;
                let mesh = crBall(r, pini);
                let vdir = BABYLON.Vector3.Forward().scale(200);
                // let vdir = BABYLON.Vector3.Forward().scale(-200); // 最下端位置
                mesh.physicsBody.applyForce(vdir, mesh.absolutePosition);
                meshBall.push(mesh);
                if (meshBall.length == 1) {
                    mesh.material = new BABYLON.StandardMaterial("");
                    mesh.material.diffuseColor = BABYLON.Color3.Red();
                }
            }
            for (let m of meshBall) {
                if (m.position.y < -200) {
                    m.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
                    m.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                    m.position.copyFrom(pini);
                }
            }
        }
        let fnobj201a = scene.onBeforeRenderObservable.add(fn201a);

        let mesh301 = null;
        let x=5, ymin=-51+28, ymax=9, zmin=-57-15, zmax=-9.8;
        {
            let plist2 = [];
            {
                let n = 200, step = 1/n, len = 80;
                for (let s = 0; s < 1; s += step) {
                    plist2.push(new BABYLON.Vector3(0, 0, s*len));
                }
            }
            if (0) {
                // plist のデバッグ表示
                let mesh = BABYLON.CreateGreasedLine(
                    "", {points:plist2,
                         widths:[4],
                         widthDistribution:BABYLON.GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_REPEAT,
                        }, {color:BABYLON.Color3.Red(),}, scene);
            }
            let sw=1.1;
            const myShape = [
                new BABYLON.Vector3(-sw, 0, 0),
                new BABYLON.Vector3( sw, 0, 0),
            ];
            let options = {shape: myShape,
                           path: plist2,
                           sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                           cap:BABYLON.Mesh.NO_CAP,
                           rotation: 0.4,
                          };
            // options.rotation = -diffRot / plist3.length;
            let mesh = BABYLON.MeshBuilder.ExtrudeShape("", options, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            let fric=1, rest=0.1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, {mass:0, friction:fric, restitution:rest}, scene);
            mesh._agg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
            mesh.physicsBody.disablePreStep = false;
            // meshStage.push(mesh);
            mesh301 = mesh;
        }
        mesh301.position.set(x, ymin, zmin);
        let vRotAxis = BABYLON.Vector3.Forward();
        let rad = -0.9;
        let qbase = BABYLON.Quaternion.FromEulerAngles(rad, 0, 0);
        let quatRot = BABYLON.Quaternion.RotationAxis(vRotAxis, 0.1);
        mesh301._v = 0;
        mesh301._i = 0;
        let fn301b = function() {
             mesh301._v += -0.02;
            let quatRot = BABYLON.Quaternion.RotationAxis(vRotAxis, mesh301._v);
            let q = qbase.multiply(quatRot);
            // let q = quatRot.multiply(qbase);
             mesh301._agg.body.setTargetTransform(mesh301.position.clone(), q);
        }
        let fnobj301b = scene.onBeforeRenderObservable.add(fn301b);
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

    return scene;
};


// ######################################################################
// ######################################################################

// let fpathFloor = "textures/floor.png"
// let fpathFloor = "../081/textures/floor.png"

const ddbase2="https://raw.githubusercontent.com/fnamuoo/webgl/main/";
const fpathFloor = ddbase2 + "081/textures/floor.png";

export var createScene_test_3011 = async function () {
    const R5 = Math.PI/36;
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

    var scene = new BABYLON.Scene(engine);

    let camera=null;
    let crCameraDef = function() {
        let _camera = new BABYLON.ArcRotateCamera("", 0,0,0, new BABYLON.Vector3(0, 0, 0));
        // _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
//        _camera.wheelDeltaPercentage = 0.01;
//        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // キーボード入力だけをピンポイントで削除
        return _camera;
    }
    let crCamera5 = function(meshTrg) {
        // 上空から見下ろすトップビュー
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100,-0.01), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // キーボード入力だけをピンポイントで削除
        return _camera;
    }
    let crCamera5_2 = function(meshTrg) {
        // ボールを一方向から追跡：平行移動
        let _camera = new BABYLON.ArcRotateCamera("", 0,0,0, new BABYLON.Vector3(0, 10, -20));
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // キーボード入力だけをピンポイントで削除
        _camera.alpha = 0;
        return _camera;
    }
    let camera5_3 = null;
    let crCamera5_3 = function(meshTrg) {
        // ボールを後方から追跡
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 2, -10), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // キーボード入力だけをピンポイントで削除
        camera5_3 = _camera;
        scene.onBeforeRenderObservable.add((scene) => {
            if (camera5_3 != null && camera5_3.lockedTarget != null) {
                // meshTrg とカメラ位置に応じて ヨー回転
                let myMesh_ = camera5_3.lockedTarget;
                let vt = myMesh_.position.subtract(camera5_3.position).normalize();
                let rad = Math.atan2(vt.x, vt.z);
                camera5_3.alpha = -rad - Math.PI/2;
            }
        });
        return _camera;
    }
    let crCamera5_4 = function(meshTrg) {
        // ボールを一方向から追跡：平行移動
        let _camera = new BABYLON.ArcRotateCamera("", 0,0,0, new BABYLON.Vector3(0, 10, -40));
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // キーボード入力だけをピンポイントで削除
        _camera.useAutoRotationBehavior = true; // 自動でゆっくり回転
        _camera.alpha = 0;
        return _camera;
    }

    let cameralist = [], camTrgMesh = null;
    let resetCameraView = function(camera_) {
        while (scene.activeCameras.length > 0) {
            scene.activeCameras.pop();
        }
        scene.activeCameras.push(camera_);
        for (let camera__ of cameralist) {
            camera__.dispose();
        }
        camera_.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
    }
    let changeCamera = function(icamera) {
        if (cameralist.length==0 && camera!=null) {camera.dispose(); camera=null;}
        if (icamera == -1) {
            camera = crCameraDef();
            resetCameraView(camera);
        }
        if (icamera == 0) {
            camera = crCamera5_2(null);
            // 4分割cameraからの復帰用にリセット
            resetCameraView(camera)
            cameralist=[];
            cameralist.push(camera)
        }
        if (icamera == 1) {
            camera = crCamera5_3(null);
            resetCameraView(camera)
            cameralist=[];
            cameralist.push(camera)
        }
        if (icamera == 2) {
            // メイン＋サブ（左上）
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralist.push(crCamera5_2(null))
            cameralist.push(crCamera5_3(null))
            cameralist.push(crCamera5_4(null))
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 1, 1);
            }
            cameralist[0].viewport = new BABYLON.Viewport(0, 0, 1, 0.666); // 下段
            cameralist[1].viewport = new BABYLON.Viewport(0.0, 0.667, 0.495, 0.333); // 上段：左
            cameralist[2].viewport = new BABYLON.Viewport(0.5, 0.667, 0.495, 0.333); // 上段：右
            camera = cameralist[0];
        }
        if (icamera == 3) {
            // メイン＋サブ（左上）
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralist.push(crCamera5_3(null))
            cameralist.push(crCamera5_2(null))
            cameralist.push(crCamera5_4(null))
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 1, 1);
            }
            cameralist[0].viewport = new BABYLON.Viewport(0, 0, 1, 0.666); // 下段
            cameralist[1].viewport = new BABYLON.Viewport(0.0, 0.667, 0.495, 0.333); // 上段：左
            cameralist[2].viewport = new BABYLON.Viewport(0.5, 0.667, 0.495, 0.333); // 上段：右
            camera = cameralist[0];
        }
        if (camTrgMesh != null) {
            setCamTrgMesh(camTrgMesh);
        }
    }
    let setCamTrgMesh = function(mesh) {
        camTrgMesh = mesh;
        myMesh = mesh;
        for (let cam of cameralist) {
            cam.lockedTarget = camTrgMesh;
        }
    }

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // let istage = 0;
    // ステージ情報（１ステージに複数コース可）
    const stageInfoList = [
        // istage, label, fpathCourseImg
        [[10401,10402,10403,10404,10405,10406,10407,10408,10409], "0.大小ball", ""],
        [[10501,10502], "1.幅広/偏芯ボール", ""],
        [[10701,10702,10703,10704,10705,10706], "2.地下神殿", ""],
    ];
    let nstage = stageInfoList.length;


    // コースのメタ・メッシュ情報
    const _courseMetaMeshInfo = {

        10401:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:401, courseW:3.3, courseH:2, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },
        10402:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:402, courseW:1.1, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:3.8, adjz:5.0, adjy:3.6,
               nbPoints:10,
              },
        10403:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:403, courseW:1.1, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:5, adjz:5.0, adjy:3.6,
               nbPoints:10,
              },
        10404:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:404, courseW:1.1, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:6.2, adjz:5.0, adjy:3.6,
               nbPoints:10,
              },
        10405:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:405, courseW:3.3, courseH:2, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:5, adjz:15, adjy:4.0,
               nbPoints:10,
              },
        10406:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:406, courseW:1.1, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:2.2, adjz:-12.0, adjy:-12.4,
               nbPoints:10,
              },
        10407:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:407, courseW:1.1, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:4.4, adjz:-12.0, adjy:-12.4,
               nbPoints:10,
              },
        10408:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:408, courseW:1.1, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:3.3, adjz:-12.0, adjy:-13.4,
               nbPoints:10,
              },
        10409:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:409, courseW:3.3, courseH:2, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:3.3, adjz:-22.0, adjy:-12.1,
               nbPoints:10,
              },

        10501:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:501, courseW:20.0, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },
        10502:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:501, courseW:7.0, courseH:0.33, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        10701:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:701, courseW:100.0, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },
        10702:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:702, courseW:100.0, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:5, adjz:260, adjy:-10,
               nbPoints:10,
              },
        10703:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:703, courseW:100.0, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:5, adjz:-20, adjy:-80,
               nbPoints:10,
              },
        10704:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:704, courseW:100.0, courseH:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:5, adjz:260, adjy:-150+5,
               nbPoints:10,
              },
        10705:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:705, courseW:20.0, courseH:3, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:60, adjz:-15.1, adjy:-231.5,
               nbPoints:10,
              },
        10706:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, 
               cid:706, courseW:10.0, courseH:3, isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_START,
               adjx:-101, adjz:0.0, adjy:13.0,
               nbPoints:10,
              },

    };

    // コースの幾何情報
    const _courseGeoInfo = {
        // ------------------------------
        401:{
            type:"program",
            metaInfo:[
                {shape:"s", size:40, div:4, h:-1},
            ],
        },
        402:{
            type:"program",
            metaInfo:[
                {shape:"s", size:20, div:4, h:-1},
                {shape:"l", size:10, div:4, rot:R45, h:-2},
                {shape:"r", size:10, div:4, rot:R45},
                {shape:"s", size:10, div:4},
                {shape:"r", size:5, div:4, rot:R90},
                {shape:"s", size:6, div:4},
                {shape:"r", size:5, div:4, rot:R90},
                {shape:"s", size:10, div:4,},
            ],
        },
        403:{
            type:"program",
            metaInfo:[
                {shape:"s", size:20, div:4, h:-1},
                {shape:"s", size:20, div:4, h:-2},
                {shape:"s", size:20, div:4, h:-2},
                {shape:"s", size:10, div:4, h:-1},
                {shape:"r", size:3, div:4, rot:R90},
                {shape:"r", size:4, div:4, rot:R90},
                {shape:"s", size:10, div:4, h:-1},
            ],
        },
        404:{
            type:"program",
            metaInfo:[
                {shape:"s", size:20, div:4, h:-1},
                {shape:"r", size:10, div:4, rot:R45},
                {shape:"l", size:10, div:4, rot:R45},
                {shape:"s", size:10, div:4, h:-1},
            ],
        },
        405:{
            type:"program",
            metaInfo:[
                {shape:"s", size:40, div:4, h:-1},
                {shape:"s", size:40, div:4, h:-1},
                {shape:"l", size:20, div:4, rot:R45},
                {shape:"r", size:20, div:4, rot:R45},
                {shape:"r", size:10, div:8, rot:R90},
                {shape:"r", size:10, div:8, rot:R90},
                {shape:"ssin", size:40, div:4, h:-10},
                {shape:"ssin", size:40, div:4, h:-10},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"r", size:20, div:4, rot:R45},
                {shape:"l", size:20, div:4, rot:R45},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"s", size:20, div:4, h:-1},
            ],
        },
        406:{
            type:"program",
            metaInfo:[
                {shape:"s", size:20, div:4, h:-1, dir:R90},
                {shape:"s", size:10, div:4, h:-2},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"l", size:4, div:3, rot:R45, h:-0.3},
                {shape:"r", size:4, div:4, rot:R45, h:-0.4},
                {shape:"s", size:3, div:4, h:-0.3},
            ],
        },
        407:{
            type:"program",
            metaInfo:[
                {shape:"s", size:20, div:4, h:-1, dir:R90},
                {shape:"s", size:10, div:4, h:-1},
                {shape:"r", size:3, div:4, rot:R45, h:-0.3},
                {shape:"l", size:4, div:4, rot:R45, h:-0.4},
                {shape:"s", size:10, div:4, h:-1},
            ],
        },
        408:{
            type:"program",
            metaInfo:[
                {shape:"s", size:20, div:4, h:-1, dir:R90},
                {shape:"ssin", size:20, div:4, h:-3},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"l", size:12, div:8, rot:R90},
                {shape:"l", size:13, div:8, rot:R90},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"l", size:17, div:12, rot:R45},
                {shape:"r", size:17, div:12, rot:R45},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"ssin", size:40, div:12, h:-13},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"r", size:17, div:12, rot:R45},
                {shape:"l", size:17, div:12, rot:R45},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"l", size:10, div:5, rot:R30},
            ],
        },
        409:{
            type:"program",
            metaInfo:[
                {shape:"s", size:20, div:4, h:-1, dir:R90},
                {shape:"s", size:10, div:4, h:-1},
                {shape:"s", size:10, div:4, h:-1},
                {shape:"l", size:10, div:8, rot:R90},
                {shape:"l", size:10, div:8, rot:R90},
                {shape:"s", size:10, div:4, h:-1},
                {shape:"ssin", size:40, div:16, h:-13},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"ssin", size:40, div:16, h:-13},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"r", size:20, div:8, rot:R90, h:-2},
                {shape:"r", size:20, div:8, rot:R90},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"ssin", size:40, div:16, h:-13},
                {shape:"ssin", size:40, div:16, h:-13},
                {shape:"s", size:10, div:4, h:-1},
                {shape:"ssin", size:40, div:16, h:-13},
                {shape:"s", size:10, div:4, h:-1},
                {shape:"ssin", size:20, div:8, h:5},
            ],
        },

        501:{
            type:"program",
            metaInfo:[
                // {shape:"s", size:40, div:4, h:-4, dir:-R90},
                {shape:"s", size:40, div:4, h:-4, dir:R90},
                {shape:"ssin", size:80, div:8, h:-24},
                {shape:"s", size:40, div:4, h:-4},
                {shape:"r", size:80, div:8, rot:R45, h:-8},
                {shape:"l", size:80, div:8, rot:R45},
                {shape:"s", size:40, div:4, h:-4},
                {shape:"l", size:80, div:8, rot:R45, h:-8},
                {shape:"r", size:80, div:8, rot:R45},
                {shape:"s", size:40, div:4, h:-4},
                {shape:"l", size:120, div:8, rot:R90, h:-12},
                {shape:"l", size:120, div:8, rot:R90, h:-12},
                {shape:"ssin", size:80, div:8, h:-24},
                {shape:"s", size:40, div:4, h:-4},
                {shape:"ssin", size:80, div:8, h:-24},
                {shape:"l", size:80, div:8, rot:R45, h:-8},
                {shape:"s", size:40, div:4, h:-4},
                {shape:"r", size:80, div:8, rot:R45, h:-8},
                {shape:"l", size:80, div:16, rot:R90, h:-12},
                {shape:"s", size:40, div:4, h:-4},
                {shape:"l", size:80, div:16, rot:R90, h:-12},
                {shape:"ssin", size:80, div:8, h:-24},
                {shape:"l", size:80, div:16, rot:R90, h:-12},
                {shape:"r", size:80, div:16, rot:R90, h:-12},
                {shape:"l", size:80, div:16, rot:R90, h:-12},
                {shape:"r", size:80, div:8, rot:R45, h:-8},
                {shape:"s", size:40, div:4, h:-4},
                {shape:"l", size:80, div:16, rot:R90, h:-12},
                {shape:"l", size:120, div:16, rot:R90, h:-12},
                {shape:"ssin", size:80, div:8, h:-24},
                {shape:"r", size:80, div:8, rot:R45, h:-8},
                {shape:"ssin", size:80, div:8, h:-24},
                {shape:"s", size:40, div:4, h:-4},
                {shape:"s", size:40, div:4, h:-4},
                {shape:"s", size:40, div:4, h:-4},
                {shape:"l", size:80, div:8, rot:R45, h:-8},
                {shape:"s", size:20, div:4, h:-4},
                {shape:"s", size:20, div:4, h:-4},
                {shape:"s", size:20, div:4, h:-4},
                {shape:"s", size:20, div:4, h:-4},
                {shape:"l", size:80, div:8, rot:R45, h:-8},
                {shape:"s", size:20, div:4, h:-4},
                {shape:"s", size:20, div:4, h:-4},
                {shape:"s", size:20, div:4, h:-4},
                {shape:"s", size:20, div:4, h:-4},
                {shape:"s", size:26.3, div:4, h:-4},
                {shape:"l", size:80, div:16, rot:R90, h:-12},
                {shape:"s", size:2, div:4, h:0},
                {shape:"s", size:2, div:4, h:2},
                {shape:"s", size:2, div:4, h:4},
                {shape:"s", size:2, div:4, h:10},
                {shape:"s", size:2, div:4, h:20},
                {shape:"s", size:2, div:4, h:50},
                {shape:"s", size:2, div:4, h:130},
                {shape:"s", size:2, div:4, h:125},
                {shape:"s", size:2, div:4, h:50},
                {shape:"s", size:2, div:4, h:20},
                {shape:"s", size:2, div:4, h:10},
                {shape:"s", size:2, div:4, h:4},
                {shape:"s", size:2, div:4, h:2},
                {shape:"s", size:2, div:4, h:0},
                {shape:"s", size:5, div:4, h:-1},
                {shape:"s", size:15, div:4, h:-3},
            ],
        },

        701:{
            type:"program",
            metaInfo:[
                {shape:"s", size:40, div:4, h:-4},
                {shape:"ssin", size:80, div:8, h:-24},
                {shape:"s", size:40, div:4, h:-4},
                {shape:"s", size:40, div:4, h:-3},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
            ],
        },
        702:{
            type:"program",
            metaInfo:[
                {shape:"ssin", size:60, div:12, h:-140, dir:R90},
                {shape:"s", size:40, div:4, h:-5},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
            ],
        },
        703:{
            type:"program",
            metaInfo:[
                {shape:"ssin", size:60, div:12, h:-140},
                {shape:"s", size:40, div:4, h:-5},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
            ],
        },
        704:{
            type:"program",
            metaInfo:[
                {shape:"ssin", size:60, div:12, h:-140, dir:R90},
                {shape:"s", size:40, div:4, h:-5},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
                {shape:"s", size:40, div:4, h:-2},
            ],
        },
        705:{
            type:"program",
            metaInfo:[
                {shape:"s", size:40, div:4, h:0, dir:R180},
                {shape:"s", size:40, div:4, h:0},
                {shape:"s", size:40, div:4, h:0},
                {shape:"s", size:40, div:4, h:0},
                {shape:"s", size:40, div:4, h:0},
                {shape:"s", size:40, div:4, h:0},
                {shape:"ssin", size:60, div:40, h:500},
                {shape:"s", size:5, div:4, h:0},
                {shape:"s", size:10, div:4, h:-5},
            ],
        },
        706:{
            type:"program",
            metaInfo:[
                {shape:"s", size:40, div:4, h:-2, dir:R90},
                {shape:"s", size:40, div:4},
                {shape:"l", size:40, div:8, rot:R90, h:-4},
                {shape:"l", size:40, div:8, rot:R45, h:-2},
                {shape:"s", size:40, div:4},
                {shape:"s", size:40, div:4},
                {shape:"s", size:40, div:4, h:-1},
                {shape:"s", size:20, div:2, h:0},
            ],
        },

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

        } else if (courseGeo.type == 'rec_xzy') {
            courseGeo.data = courseGeo.dataOrg;

        } // if (courseGeo.type == 'program') {
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
            // 目的地／中継地取得用の座標値列
            plist3 = plist2;
            if (reverse) {
                plist3 = plist2.slice().reverse();
            }
        }
        return plist3;
    }

    let meshStage = [], p0 = null;
    let createStage = function(istage) {
        while (meshStage.length > 0) {
            let mesh = meshStage.pop();
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            mesh.dispose();
        }
        camTrgMesh = null;
        myMesh = null;

        let courseMetaMeshList = [];
        {
            let [ids, tlabel, tpath] = stageInfoList[istage];
console.log("istage=",istage);
console.log("tlabel=",tlabel);
//            setText2(tlabel);
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
        for (let courseMetaMesh of courseMetaMeshList) {
            let plist3 = getPoint3List(courseMetaMesh);
            let meshType = typeof(courseMetaMesh.meshType) !== 'undefined' ? courseMetaMesh.meshType : "line";
            courseMetaMesh._meshType = meshType;
            if (typeof(courseMetaMesh.cameraAlphaIni) !== 'undefined') {
                courseMetaMesh._cameraAlphaIni = courseMetaMesh.cameraAlphaIni;
            } else {
                let p = plist3[10].subtract(plist3[0]);
                let rad = Math.atan2(p.x, p.z);
                courseMetaMesh._cameraAlphaIni = -rad - Math.PI/2;
            }

            {
                if (meshType == 'tube') {
                    let tubeCAP = BABYLON.Mesh.NO_CAP;
                    let options = {path: plist3,
                                   sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                                   radius:1.0,
                                   cap:BABYLON.Mesh.NO_CAP,
                                  };
                    if (courseMetaMesh.isLoopCourse) {
                        plist3.push(plist3[0]);
                    }
                    let mesh = BABYLON.MeshBuilder.CreateTube("", options, scene);
                    mesh.material = new BABYLON.StandardMaterial("");
                    mesh.material.diffuseColor = new BABYLON.Color3(0.2, 1.0, 0.4);
                    mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
                    mesh.material.wireframe = 1;
                    let fric=1, rest=0.1;
                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:fric, restitution:rest}, scene);
                    meshStage.push(mesh);
                    // meshAggInfo.push([mesh,null]);
                    courseMetaMesh._plist = plist3;

                } else if (meshType == 'ribbon_up') {
                    // 常に従法線(binormal)が同一平面上／ロール無
                    let courseW = typeof(courseMetaMesh.courseW) !== 'undefined' ? courseMetaMesh.courseW : 10;
                    let courseH = typeof(courseMetaMesh.courseH) !== 'undefined' ? courseMetaMesh.courseH : 2;
                    let courseCAP = typeof(courseMetaMesh.courseCAP) !== 'undefined' ? courseMetaMesh.courseCAP : BABYLON.Mesh.NO_CAP;
                    let courseFric = typeof(courseMetaMesh.courseFric) !== 'undefined' ? courseMetaMesh.courseFric : 1;
                    let courseRest = typeof(courseMetaMesh.courseRest) !== 'undefined' ? courseMetaMesh.courseRest : 0.1;
                    let vN = BABYLON.Vector3.Up();
                    let path3d = new BABYLON.Path3D(plist3, vN); // 初期法線方向の固定化
                    let plist3R = [], plist3L = [], plist3RE = [], plist3LE = [];
                    let size=courseW/2, sizeH=courseH, sstep=0.002, plist = [], vtlist = [], vnlist = [];
                    sstep=1/path3d.length()/2;
                    for (let s = 0; s < 1; s+=sstep) {
                        let p = path3d.getPointAt(s);
                        let vt = path3d.getTangentAt(s, true);
                        let vb = vt.cross(vN).normalize();
                        let vn = vb.cross(vt).normalize();
                        let pL = p.add(vb.scale(size));
                        plist3L.push(pL);
                        let pR = p.add(vb.scale(-size));
                        plist3R.push(pR);
                        let pLE = pL.add(vn.scale(sizeH));
                        plist3LE.push(pLE);
                        let pRE = pR.add(vn.scale(sizeH));
                        plist3RE.push(pRE);
                        plist.push(p);
                        vtlist.push(vt);
                        vnlist.push(vn);
                    }
                    if (courseMetaMesh.isLoopCourse) {
                        plist3L.push(plist3L[0]);
                        plist3R.push(plist3R[0]);
                        plist3LE.push(plist3LE[0]);
                        plist3RE.push(plist3RE[0]);
                    } else {
                        // CAP/ 両端に蓋をする
                        let ps = plist3L[0].add(plist3R[0]).add(plist3LE[0]).add(plist3RE[0]).scale(1/4);
                        let n_ =plist3L.length-1;
                        let pe = plist3L[n_].add(plist3R[n_]).add(plist3LE[n_]).add(plist3RE[n_]).scale(1/4);
                        if (courseCAP == BABYLON.Mesh.CAP_ALL || courseCAP == BABYLON.Mesh.CAP_START) {
                            plist3L.unshift(ps);
                            plist3R.unshift(ps);
                            plist3LE.unshift(ps);
                            plist3RE.unshift(ps);
                        }
                        if (courseCAP == BABYLON.Mesh.CAP_ALL || courseCAP == BABYLON.Mesh.CAP_END) {
                            plist3L.push(pe);
                            plist3R.push(pe);
                            plist3LE.push(pe);
                            plist3RE.push(pe);
                        }
                    }
                    let path3 = [plist3LE, plist3L, plist3R, plist3RE];
                    let mesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray:path3, sideOrientation:BABYLON.Mesh.DOUBLESIDE});
                    mesh.material = new BABYLON.StandardMaterial("");
                    mesh.material.diffuseColor = new BABYLON.Color3(0.2, 1.0, 0.4);
                    mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
                    mesh.material.wireframe = 1;
                    let fric=courseFric, rest=courseRest;
                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:fric, restitution:rest}, scene);
                    meshStage.push(mesh);
                    // meshAggInfo.push([mesh,null]);
                    courseMetaMesh._sstep = sstep;
                    courseMetaMesh._plist = plist;
                    courseMetaMesh._vtlist = vtlist;
                    courseMetaMesh._vnlist = vnlist;
                } // else if (meshType == '...') {

            }
        }
        p0 = courseMetaMeshList[0]._plist[3];
        return courseMetaMeshList;
    }

    let crBall = function(r, posi) {
        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: r }, scene);
        mesh.position.copyFrom(posi);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1}, scene);
        mesh.physicsBody.disablePreStep = false;
        return mesh;
    }
    let crBall2 = function(r, posi, m) {
        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: r }, scene);
        mesh.position.copyFrom(posi);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: m}, scene);
        mesh.physicsBody.disablePreStep = false;
        return mesh;
    }
    let crBall3 = function(r, posi, m) {
        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: r }, scene);
        mesh.position.copyFrom(posi);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: m}, scene);
        let pc  = new BABYLON.Vector3(0, r*Math.random()/10, 0);
        mesh._agg.body.setMassProperties({centerOfMass:pc});
        mesh.physicsBody.disablePreStep = false;
        return mesh;
    }

    let istage = 0; // .. 701
    let icamera = 0, ncamera = 4;

    let fnobjlist = [];
    let renderEnable = false, meshTrgRenderList = [];
    let setStageAction = function(istage) {
        renderEnable = false;
        if (istage == 0) { // 401
            {
                let popCool = 0, popCoolMax = 100, npop = 30, ipop = 0, r=2.9, m=10;
                let meshBall = [];
                let pini = p0.add(new BABYLON.Vector3(0, 2, 5));
                // pini = new BABYLON.Vector3(14, -40, -45); // 最下端位置
                let fn401a = function() {
                    if (renderEnable) {
                        // 一定時間ごとに ball を pop
                        let vdir = BABYLON.Vector3.Forward().scale(2000);
                        if ((ipop < npop) && (--popCool < 0)) {
                            ++ipop;
                            popCool = popCoolMax;
                            let mesh = crBall2(r, pini, m);
                            mesh.physicsBody.applyForce(vdir, mesh.absolutePosition);
                            meshBall.push(mesh);
                            meshStage.push(mesh);
                            if (meshBall.length == 1) {
                                mesh.material = new BABYLON.StandardMaterial("");
                                mesh.material.diffuseColor = BABYLON.Color3.Red();
                                setCamTrgMesh(mesh);
                                    mesh._vLinF = 10;
                                    mesh._vLinLR = 20;
                                    mesh._vAngF = 300;
                            }
                        }
                        for (let m of meshBall) {
                            if (m.position.y < -100) {
                                m.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
                                m.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                                m.position.copyFrom(pini);
                                m.physicsBody.applyForce(vdir, m.absolutePosition);
                            }
                        }
                    }
                }
                let fnobj401a = scene.onBeforeRenderObservable.add(fn401a);
                fnobjlist.push(fnobj401a);
            }
            {
                let popCool = 500, popCoolMax = 20, npop = 200, ipop = 0, r=0.6, m=0.1;
                let meshBall2 = [];
                let pini2 = p0.add(new BABYLON.Vector3(0, 2, 5));
                // pini = new BABYLON.Vector3(14, -40, -45); // 最下端位置
                let fn401a = function() {
                    if (renderEnable) {
                        // 一定時間ごとに ball を pop
                        let vdir = BABYLON.Vector3.Forward().scale(20);
                        if ((ipop < npop) && (--popCool < 0)) {
                            ++ipop;
                            popCool = popCoolMax;
                            let mesh = crBall2(r, pini2, m);
                            mesh.physicsBody.applyForce(vdir, mesh.absolutePosition);
                            meshBall2.push(mesh);
                            meshStage.push(mesh);
                        }
                        for (let m of meshBall2) {
                            if (m.position.y < -100) {
                                m.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
                                m.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                                m.position.copyFrom(pini2);
                                m.physicsBody.applyForce(vdir, m.absolutePosition);
                            }
                        }
                    }
                }
                let fnobj401a = scene.onBeforeRenderObservable.add(fn401a);
                fnobjlist.push(fnobj401a);
            }
        }

        if (istage == 1) { // 501
            {
                let popCool = 0, popCoolMax = 80, npop = 300, ipop = 0, r=1, m=1;
                let meshBall = [];
                let pini = p0.add(new BABYLON.Vector3(0, 2, -5));
                let fn501a = function() {
                    if (renderEnable) {
                        // 一定時間ごとに ball を pop
                        let vdir = BABYLON.Vector3.Forward().scale(-200);
                        if ((ipop < npop) && (--popCool < 0)) {
                            ++ipop;
                            popCool = popCoolMax;
                            let mesh = null;
                            if (meshBall.length == 0) {
                                mesh = crBall2(r, pini, m);
                            } else {
                                mesh = crBall3(r, pini, m);
                            }
                            mesh.physicsBody.applyForce(vdir, mesh.absolutePosition);
                            meshBall.push(mesh);
                            meshStage.push(mesh);
                            if (1) {
                                if (meshBall.length == 1) {
                                    mesh.material = new BABYLON.StandardMaterial("");
                                    mesh.material.diffuseColor = BABYLON.Color3.Red();
                                    setCamTrgMesh(mesh);
                                    mesh._vLinF = 10;
                                    mesh._vLinLR = 20;
                                    mesh._vAngF = 300;
                                }
                            }
                        }
                        for (let m of meshBall) {
                            if (m.position.y < -300) {
                                m.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
                                m.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                                m.position.copyFrom(pini);
                                m.physicsBody.applyForce(vdir, m.absolutePosition);
                            }
                        }
                    }
                }
                let fnobj501a = scene.onBeforeRenderObservable.add(fn501a);
                fnobjlist.push(fnobj501a);
            }
            let mesh501blist = [], nmesh501 = 20, path3d501 = null;
            {
                // 軽量版
                let x=5, ymin=-200, ymax=-15, zmin=4, zmax=10;
                let datalist = [
                    [x, ymax, zmin],
                    [x, ymax, zmin-10],
                    [x, ymin, zmax-10],
                    [x, ymin, zmax],
                ];
                let plist = [];
                for (let d of datalist) {
                    plist.push(new BABYLON.Vector3(d[0], d[1], d[2]))
                }
                // 点列plist を補間、スムージング
                const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 5, true);//clse
                const plist2 = catmullRom.getPoints();
                // 曲線情報path3dを作成
                let path3d = new BABYLON.Path3D(plist2);
                path3d501 = path3d;
                if (0) {
                    // plist のデバッグ表示
                    let mesh = BABYLON.CreateGreasedLine(
                        "", {points:plist2,
                             widths:[4],
                             widthDistribution:BABYLON.GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_REPEAT,
                            }, {color:BABYLON.Color3.Red(),}, scene);
                }
                for (let i = 0; i < nmesh501; ++i) {
                    let s = i / nmesh501;
                    let mesh = BABYLON.MeshBuilder.CreateBox("", {width:20, height:15, depth:0.1}, scene);
                    mesh.material = new BABYLON.StandardMaterial("");
                    mesh.material.alpha = 0.1;
                    mesh._s = s;
                    mesh.position.copyFrom(path3d.getPointAt(s));
                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0, friction:0.9, restitution:0.1}, scene);
                    mesh._agg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
                    mesh.physicsBody.disablePreStep = false;
                    // mesh501blist.push(mesh);
                    meshTrgRenderList.push(mesh);
                    meshStage.push(mesh);
                }
            }
            let fn501b = function() {
                if (renderEnable) {
                    const targetRot = BABYLON.Quaternion.FromEulerAngles(R45, 0, 0);
                    // for (let mesh of mesh501blist) {
                    for (let mesh of meshTrgRenderList) {
                        // mesh._s += 0.0001;
                        mesh._s += 0.0002;
                        if (mesh._s >= 1) {mesh._s -= 1;}
                        mesh._agg.body.setTargetTransform(path3d501.getPointAt(mesh._s), targetRot);
                    }
                }
            }
            let fnobj501b = scene.onBeforeRenderObservable.add(fn501b);
            fnobjlist.push(fnobj501b);
        }

        if (istage == 2) { // 701
            {
                let popCool = 0, popCoolMax = 80, npop = 300, ipop = 0, r=1, m=1;
                let meshBall = [];
                let pini = p0.add(new BABYLON.Vector3(0, 2, 5));
                let fn701a = function() {
                    if (renderEnable) {
                        // 一定時間ごとに ball を pop
                        let vdir = BABYLON.Vector3.Forward().scale(200);
                        if ((ipop < npop) && (--popCool < 0)) {
                            ++ipop;
                            popCool = popCoolMax;
                            let mesh = null;
                            if (meshBall.length == 0) {
                                mesh = crBall2(r, pini, m);
                            } else {
                                mesh = crBall3(r, pini, m);
                                mesh.position.x = Math.random()*10;
                            }
                            mesh.physicsBody.applyForce(vdir, mesh.absolutePosition);
                            meshBall.push(mesh);
                            meshStage.push(mesh);
                            if (1) {
                                if (meshBall.length == 1) {
                                    mesh.material = new BABYLON.StandardMaterial("");
                                    mesh.material.diffuseColor = BABYLON.Color3.Red();
                                    setCamTrgMesh(mesh);
                                    mesh._vLinF = 10;
                                    mesh._vLinLR = 20;
                                    mesh._vAngF = 300;
                                }
                            }
                        }
                        for (let m of meshBall) {
                            if (m.position.y < -300) {
                                m.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
                                m.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                                m.position.copyFrom(pini);
                                m.physicsBody.applyForce(vdir, m.absolutePosition);
                            }
                        }
                    }
                }
                let fnobj701a = scene.onBeforeRenderObservable.add(fn701a);
                fnobjlist.push(fnobj701a);
            }
            let mesh701blist = [], nmesh701 = 20, path3d701 = null;
            {
                // 軽量版
                let xmin1=-50, xmax1=60, ymin1=-230-2, ymax1=-230+2, zmin1=-15, zmax1=-15;
                let xmin2=-82, xmax2=-60, ymin2=-230-2, ymax2=-2, zmin2=-15, zmax2=-15;
                let datalist = [
                    [xmin1+10, ymin1-20, zmin1],
                    [xmax1, ymin1-10, zmin1],
                    [xmax1, ymax1, zmin1],
                    [xmin1+25, ymax1, zmin1],
                    [xmax2, ymin2+25, zmin2],
                    [xmin2, ymax2, zmin2],
                    [xmin2-20, ymax2-10, zmin2],
                    [xmax2-20, ymin2-0, zmin2],
                ];
                let plist = [];
                for (let d of datalist) {
                    plist.push(new BABYLON.Vector3(d[0], d[1], d[2]))
                }
                // 点列plist を補間、スムージング
                const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 5, true);//clse
                const plist2 = catmullRom.getPoints();
                // 曲線情報path3dを作成
                let path3d = new BABYLON.Path3D(plist2);
                path3d701 = path3d;
                if (0) {
                    // plist のデバッグ表示
                    let mesh = BABYLON.CreateGreasedLine(
                        "", {points:plist2,
                             widths:[4],
                             widthDistribution:BABYLON.GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_REPEAT,
                            }, {color:BABYLON.Color3.Red(),}, scene);
                }
                for (let i = 0; i < nmesh701; ++i) {
                    let s = i / nmesh701;
                    let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:20, depth:25}, scene);
                    mesh.material = new BABYLON.StandardMaterial("");
                    mesh.material.alpha = 0.1;
                    mesh._s = s;
                    mesh.position.copyFrom(path3d.getPointAt(s));
                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0, friction:0.9, restitution:0.1}, scene);
                    mesh._agg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
                    mesh.physicsBody.disablePreStep = false;
                    // mesh701blist.push(mesh);
                    meshTrgRenderList.push(mesh);
                    meshStage.push(mesh);
                }
            }
            let fn701b = function() {
                if (renderEnable) {
                    const targetRot = BABYLON.Quaternion.FromEulerAngles(0, 0, -R45);
                    // for (let mesh of mesh701blist) {
                    for (let mesh of meshTrgRenderList) {
                        mesh._s += 0.0001;
                        if (mesh._s >= 1) {mesh._s -= 1;}
                        mesh._agg.body.setTargetTransform(path3d701.getPointAt(mesh._s), targetRot);
                    }
                }
            }
            let fnobj701b = scene.onBeforeRenderObservable.add(fn701b);
            fnobjlist.push(fn701b);
            // ピラー（柱
            let geoinfo =[[-30, -110, 20, 10,230],
                          [-30, -112, 70, 10,220],
                          [-30, -112, 120, 10,215],
                          [-30, -112, 170, 10,210],
                          [-30, -111, 220, 10,205],
                          [30, -110, 20, 10,230],
                          [30, -112, 70, 10,220],
                          [30, -112, 120, 10,215],
                          [30, -112, 170, 10,210],
                          [30, -111, 220, 10,205],
                         ];
            for (let [px,py,pz,r,h] of geoinfo) {
                let mesh = new BABYLON.MeshBuilder.CreateCapsule("", {radius:r, height:h}, scene);
                mesh.position.set(px,py,pz);

                // let fpathFloor = "textures/floor.png"
	        mesh.material = new BABYLON.StandardMaterial("");
	        mesh.material.diffuseTexture = new BABYLON.Texture(fpathFloor);
	        // mesh.material.diffuseTexture.hasAlpha = true;
	        mesh.material.diffuseTexture.uScale = 2;
	        mesh.material.diffuseTexture.vScale = 10;
	        mesh.material.emissiveColor = BABYLON.Color3.White();
	        // mesh.material.emissiveColor = BABYLON.Color3.Black();
                mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す

                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.CAPSULE, {mass:0, friction:0.01, restitution:0.9}, scene);
                meshStage.push(mesh);
            }
        }
        renderEnable = true;

        let fnobj01 = scene.onBeforeRenderObservable.add(fnUpdateMyMesh);
        fnobjlist.push(fnobj01);
    }

    let rmStageAction = function() {
        renderEnable = false;
        meshTrgRenderList = [];
        for (let fobj of fnobjlist) {
            scene.onBeforeRenderObservable.remove(fobj);
        }
        fnobjlist = [];
    }

    let nextStage = function() {
        istage = (istage+1) % nstage;
        rmStageAction();
        createStage(istage);
        setStageAction(istage);
    }
    let backStage = function() {
        istage = (istage+nstage-1) % nstage;
        rmStageAction();
        createStage(istage);
        setStageAction(istage);
    }

    let actMode = 1;
    let fnUpdateMyMesh = function() {
        if (myMesh == null) {return;}
        if (actMode == 1) {
            // 移動方向がカメラ依存
            let forwardForce = 0;
            let steerDirection = 0;
            let yawDirection = 0;
            if (keyAction.forward) forwardForce = 1
            if (keyAction.backward) forwardForce = -1
            if (keyAction.left) steerDirection = -1
            if (keyAction.right) steerDirection = 1
            if (keyAction.yawL) yawDirection = -1
            if (keyAction.yawR) yawDirection = 1
            let vt = myMesh.position.subtract(camera.position).normalize();
            let vb = vt.cross(BABYLON.Vector3.Up()).normalize();
            vt = BABYLON.Vector3.Up().cross(vb).normalize();
            if (forwardForce) {
                let vdir = vb.scale(-myMesh._vAngF*forwardForce);
                myMesh.physicsBody.applyAngularImpulse(vdir);
                if (keyAction.turbo) {
                    myMesh.physicsBody.applyForce(vt.scale(myMesh._vLinF*forwardForce), myMesh.absolutePosition);
                }
            }
            if (steerDirection) {
                let vdir = vt.scale(-myMesh._vAngF*steerDirection);
                myMesh.physicsBody.applyAngularImpulse(vdir);
                if (keyAction.turbo) {
                    myMesh.physicsBody.applyForce(vb.scale(-myMesh._vLinLR*steerDirection), myMesh.absolutePosition);
                }
            }
            if (keyAction.jump) {
                let vdir = new BABYLON.Vector3(0 ,myMesh._vAngF, 0);
                if (keyAction.turbo) {
                    myMesh.physicsBody.applyForce(vdir.scale(10), myMesh.absolutePosition);
                } else {
                    myMesh.physicsBody.applyForce(vdir, myMesh.absolutePosition);
                }
            }
            if (keyAction.down) {
                // let vdir = new BABYLON.Vector3(0 ,-myMesh._vAngF, 0);
                let vdir = new BABYLON.Vector3(0 ,-myMesh._vLinF, 0);
                if (keyAction.turbo) {
                    myMesh.physicsBody.applyForce(vdir.scale(10), myMesh.absolutePosition);
                } else {
                    myMesh.physicsBody.applyForce(vdir, myMesh.absolutePosition);
                }
            }
            if (keyAction.brake) {
                 // 線形速度、回転速度を減速
                let vlerp = 0.2;
                let vlv = myMesh.physicsBody.getLinearVelocity();
                vlv = BABYLON.Vector3.Lerp(vlv, BABYLON.Vector3.Zero(), vlerp);
                myMesh.physicsBody.setLinearVelocity(vlv);
                let vav = myMesh.physicsBody.getAngularVelocity();
                vav = BABYLON.Vector3.Lerp(vav, BABYLON.Vector3.Zero(), vlerp);
                myMesh.physicsBody.setAngularVelocity(vav);
            }
            if (keyAction.reset) {
                keyAction.reset = false;
                // resetPostureMyMesh();
            }
            if (yawDirection) {
                camera.alpha += -0.1*yawDirection;
            }
        }
    }

    var map ={}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
        map['shift'] = evt.sourceEvent.shiftKey;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
        map['shift'] = evt.sourceEvent.shiftKey;
    }));
    let cooltime_act = 0, cooltime_actIni = 20; // , vforceBase = 0.04, vforce = 0.04, bDash=3, jumpforce = 120;

    let keyAction = {forward:0, back:0, right:0, left:0, yawL:0, yawR:0, jump:0, down:0, brake:0, turbo:0, reset:0, resetCooltime:0};
    scene.registerAfterRender(function() {
        keyAction.turbo=false;
        if (map["ctrl"]) {
            keyAction.turbo=true;
        }
        if (map["w"] || map["ArrowUp"]) {
            keyAction.forward = true;
        } else {
            keyAction.forward = false;
        }
        if (map["s"]) {
            keyAction.backward = true
        } else {
            keyAction.backward = false
        }
        if (map["q"]) {
            keyAction.yawL = true;
        } else {
            keyAction.yawL = false;
        }
        if (map["e"]) {
            keyAction.yawR = true;
        } else {
            keyAction.yawR = false;
        }
        keyAction.left = false;
        keyAction.right = false;
        if (map["a"] || map["ArrowLeft"]) {
            keyAction.left = true;
        } else if (map["d"] || map["ArrowRight"]) {
            keyAction.right = true;
        }
        keyAction.jump = false;
        if (map[" "]) {
            keyAction.jump = true;
         }
        keyAction.down = false;
        if (map["x"] || map["ArrowDown"]) {
            keyAction.down = true;
        }
        keyAction.brake = false;
        if (map["Enter"]) {
            keyAction.brake = true;
        }
        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["n"] || map["b"]) {
                cooltime_act = cooltime_actIni;
                if (map["n"]) {
                    nextStage();
                } else {
                    backStage();
                }
            }
            if (map["c"]) {
                cooltime_act = cooltime_actIni;
                icamera = (icamera+1) % ncamera;
                changeCamera(icamera);
            }
        }
    });

    let myMesh = null;
    let fnobj01 = scene.onBeforeRenderObservable.add(fnUpdateMyMesh);

    istage = 2; icamera = 1;

    {
        createStage(istage);
        changeCamera(icamera);
        setStageAction(istage);
    }

    return scene;
};

// ######################################################################

// export var createScene = createScene_test_3003; // istage=2 が激重:アルキメディアン・スクリュー
export var createScene = createScene_test_3011; // キー操作・ボール操作

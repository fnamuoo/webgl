//  ボール（摩擦）でコースを走ってみる
//  
// カーソル上／w    .. ボールの前回転
//             s    .. ボールの後回転
// カーソル左右／ad .. ボールの左右の回転
// カーソル下／x    .. ボールの重力強化
// ctrl             .. ターボ
// qe               .. ヨー回転
// space            .. ジャンプ
// enter            .. ブレーキ
// r                .. 初期位置にリセット
// nb               .. コースの変更

// ######################################################################


// const SCRIPT_URL3 = "./CourseData3.js"; // カートコース
// const SCRIPT_URL4 = "./CourseData4.js"; // ボブスレー
// const SCRIPT_URL6 = "./CourseData6.js"; // ロボトレース
// const SCRIPT_URL7 = "./CourseData7.js"; // ランダム（片道・ループ
const SCRIPT_URL3 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/116/CourseData3.js";
const SCRIPT_URL4 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/123/CourseData4.js";
const SCRIPT_URL6 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/132/CourseData6.js";
const SCRIPT_URL7 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/132/CourseData7.js";

let CourseData3 = null;
await import(SCRIPT_URL3).then((obj) => { CourseData3 = obj; });
let CourseData4 = null;
await import(SCRIPT_URL4).then((obj) => { CourseData4 = obj; });
let CourseData6 = null;
await import(SCRIPT_URL6).then((obj) => { CourseData6 = obj; });
let CourseData7 = null;
await import(SCRIPT_URL7).then((obj) => { CourseData7 = obj; });

// ######################################################################

export var createScene_test_2017 = async function () {
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
    // 136 鉄道模型のレイアウト作成にチャレンジ から
    let crCamera5_3 = function(meshTrg) {
        // 方向を meshTrg に応じてヨー回転させる
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

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    let crBall = function(posi) {
        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter:1 }, scene);
        mesh.material = new BABYLON.StandardMaterial("");
	mesh.material.diffuseColor = BABYLON.Color3.White();
        mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        mesh.position.copyFrom(posi);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass:1, friction:0.8, restitution:0.01}, scene);
        mesh._mtype = "ball";
        mesh._vLinF = 10;
        mesh._vLinLR = 20;
        mesh._vAngF = 300;
        mesh.physicsBody.disablePreStep = false;
        return mesh;
    }

    // ----------------------------------------

    // ステージ情報（１ステージに複数コース可）
    const stageInfoList = [
        // istage, label, fpathCourseImg
        [[12105], "0.カートコース(flat)", ""],
        [[12106], "1.カートコース(弱UpDown)", ""],
        [[12107], "2.カートコース(弱UpDown2)", ""],
        [[12108], "3.カートコース(フープス)", ""],
        [[12109], "4.カートコース(ダウンヒルｘ２周)", ""],
        [[12110], "5.カートコース(２レーン)", ""],
        [[12115, 12116, 12117], "6.カートコース(分岐)", ""],

        [[30301], "7.ボブスレー／Nagano_JAPAN", ""],
        [[30311], "8.カート／akigase", ""],
        [[30321], "9.ロボトレース／2025全日本", ""],

        [[15401], "10.コーラム", ""],
        [[14104], "11.上昇（片）", ""],
        [[26201], "12.らせん（片：上昇）", ""],
        [[26202], "13.ランダム１(片：上昇)", ""],
        [[26203], "14.ランダム２(片：上昇)", ""],

        [[11101], "15.ローラーコースター", ""],

        [[11105], "16.カートコース(tube", ""],
        [[12102], "17.ローラーコースター(tube)", ""],

        [[30331], "18.UpDown片道(1", ""],
        [[30332], "19.UpDown片道(2", ""],
        [[30333], "20.UpDown片道(3", ""],
        [[30334], "21.UpDown片道(4", ""],
        [[30335], "22.UpDown片道(5", ""],
        [[30336], "23.UpDown片道(6", ""],

        [[30341], "24.UpDown(1", ""],
        [[30342], "25.UpDown(2", ""],
        [[30343], "26.UpDown(3", ""],
        [[30344], "27.UpDown(4", ""],
        [[30345], "28.UpDown(5", ""],
        [[30346], "29.UpDown(6", ""],

        [[26206], "30.ランダムUpDown(片)", ""],
        [[26208], "31.ランダムUpDown(周)", ""],
    ];
    let nstage = stageInfoList.length;

    // コースのメタ・メッシュ情報
    const _courseMetaMeshInfo = {
        11101:{dtype:"xzy",
               meshType:"ribbon_up", // 常にUP
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:1.0, 
               cid:101,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },
        12102:{dtype:"xzy",
               meshType:"tube",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:1.0, 
               cid:102,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        14104:{dtype:"xzy",
               meshType:"ribbon_up",
               isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               grndW:10, grndH:10, cnsNAgent:0, scale:1.0,  scaleY:1.0, 
               cid:104,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        15401:{dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:1.0,  scaleY:0.5, 
               cid:401, cameraAlphaIni:-R90,
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26201:{cid:201,
               isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:1.0,  scaleY:0.5, 
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26202:{cid:202,
               isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:1.0,  scaleY:0.5, 
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26203:{cid:203,
               isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:1.0,  scaleY:0.5, 
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26206:{cid:206,
               isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               dtype:"xzy",
               meshType:"ribbon_up2",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.1,
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        26208:{cid:208,
               isLoopCourse:true, // false,
               dtype:"xzy",
               meshType:"ribbon_up2",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.1,  scaleY:0.1,
               adjx:-5, adjz:-5, adjy:5,
               nbPoints:10,
              },

        11105:{dtype:"xzy",
               meshType:"tube",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.3,  scaleY:1.0, 
               cid:105,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },
        11106:{dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.3,  scaleY:1.0, 
               cid:105,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        12105:{dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:1.0, 
               cid:105,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        12106:{dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:1.0, 
               cid:106,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },
        12107:{dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:1.0, 
               cid:107,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        12115:{dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:1.0,  scaleY:1.0, 
               cid:105, courseW:20, courseFric:1, courseRest:0.1,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },
        12116:{dtype:"xzy", // 分岐２
               meshType:"ribbon_up2",
               grndW:10, grndH:10, cnsNAgent:0, scale:1.0,  scaleY:1.0, 
               cid:116, courseW:5, courseFric:0.1, courseRest:0.9, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:5+7, adjz:-10+10, adjy:5,
               nbPoints:10,
              },
        12117:{dtype:"xzy", // 分岐３
               meshType:"ribbon_up2",
               grndW:10, grndH:10, cnsNAgent:0, scale:1.0,  scaleY:1.0, 
               cid:117, courseW:5, courseFric:0.01, courseRest:0.01, isLoopCourse:false, courseCAP:BABYLON.Mesh.NO_CAP,
               adjx:5+2, adjz:-10+40, adjy:5,
               nbPoints:10,
              },

        12108:{dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:1.0, 
               cid:108, courseW:13, courseH:2, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        12109:{dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:1.0, 
               cid:109, courseW:13, courseH:2, courseFric:0.9, courseRest:0.0001, isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },


        12110:{dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:1.0, 
               cid:110, courseW:10, courseH:2, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30301:{dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5, isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               cid:301, courseW:10, courseH:2, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30311:{dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5,
               cid:311, courseW:10, courseH:2, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30321:{dtype:"xzy",
               meshType:"ribbon_up",
               grndW:10, grndH:10, cnsNAgent:0, scale:0.5,  scaleY:0.5,
               cid:321, courseW:10, courseH:2, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30331:{dtype:"xzy",
               meshType:"ribbon_up3",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               cid:331, courseW:10, courseH:2.5, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30332:{dtype:"xzy",
               meshType:"ribbon_up3",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               cid:332, courseW:10, courseH:2.5, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30333:{dtype:"xzy",
               meshType:"ribbon_up3",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               cid:333, courseW:10, courseH:2.5, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30334:{dtype:"xzy",
               meshType:"ribbon_up3",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               cid:334, courseW:10, courseH:2.5, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30335:{dtype:"xzy",
               meshType:"ribbon_up3",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               cid:335, courseW:10, courseH:2.5, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30336:{dtype:"xzy",
               meshType:"ribbon_up3",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1, isLoopCourse:false, courseCAP:BABYLON.Mesh.CAP_ALL,
               cid:336, courseW:10, courseH:2.5, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30341:{dtype:"xzy",
               meshType:"ribbon_up3",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1,
               cid:341, courseW:10, courseH:2.5, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30342:{dtype:"xzy",
               meshType:"ribbon_up3",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1,
               cid:342, courseW:10, courseH:2.5, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30343:{dtype:"xzy",
               meshType:"ribbon_up3",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1,
               cid:343, courseW:10, courseH:2.5, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30344:{dtype:"xzy",
               meshType:"ribbon_up3",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1,
               cid:344, courseW:10, courseH:2.5, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30345:{dtype:"xzy",
               meshType:"ribbon_up3",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1,
               cid:345, courseW:10, courseH:2.5, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },

        30346:{dtype:"xzy",
               meshType:"ribbon_up3",
               grndW:10, grndH:10, cnsNAgent:0, scale:1,  scaleY:1,
               cid:346, courseW:10, courseH:2.5, courseFric:0.9, courseRest:0.0001,
               adjx:5, adjz:-10, adjy:5,
               nbPoints:10,
              },


    };

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

        104:{
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


        105:{
            // カートコース
            type:"program",
            metaInfo:[
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:50, div:4, rot:R90},
                {shape:"r", size:50, div:2, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"r", size:75, div:4, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:100, div:6, rot:R45},
                {shape:"l", size:100, div:6, rot:R45},
                {shape:"l", size:100, div:12, rot:R90},
                {shape:"l", size:100, div:12, rot:R90},
                {shape:"l", size:100, div:6, rot:R45},
                {shape:"r", size:100, div:6, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:15, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:50, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
            ],
        },

        106:{
            // カートコース
            type:"program",
            metaInfo:[
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:50, div:4, h:2, rot:R90},
                {shape:"r", size:50, div:2, h:1, rot:R45},
                {shape:"s", size:50, div:4, h:2},
                {shape:"s", size:50, div:4, h:2},
                {shape:"s", size:50, div:4, h:2},
                {shape:"s", size:50, div:4, h:2},
                {shape:"s", size:50, div:4, h:2},
                {shape:"l", size:25, div:4, h:2, rot:R90},
                {shape:"l", size:25, div:4, h:2, rot:R90},
                {shape:"s", size:50, div:4, h:2},
                {shape:"r", size:75, div:8, h:2, rot:R90},
                {shape:"r", size:75, div:8, h:2, rot:R90},
                {shape:"r", size:75, div:4, h:0, rot:R45},
                {shape:"s", size:50, div:4, h:0},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:100, div:6, h:-1, rot:R45},
                {shape:"l", size:100, div:6, h:-2, rot:R45},
                {shape:"l", size:100, div:12, h:-4, rot:R90},
                {shape:"l", size:100, div:12, h:-4, rot:R90},
                {shape:"l", size:100, div:6, h:-2, rot:R45},
                {shape:"r", size:100, div:6, h:-1, rot:R45},
                {shape:"s", size:50, div:4, h:0},
                {shape:"r", size:25, div:4, h:0, rot:R90},
                {shape:"s", size:50, div:4, h:0},
                {shape:"r", size:25, div:4, h:0, rot:R90},
                {shape:"s", size:50, div:4, h:0},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:15, div:4, h:-0.3},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"r", size:50, div:4, h:-1, rot:R90},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4, h:-1},
            ],
        },

        107:{
            // カートコース
            type:"program",
            metaInfo:[
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"r", size:50, div:2, h:-2, rot:R90},
                {shape:"r", size:50, div:2, h:-1, rot:R45},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"l", size:25, div:4, h:-1, rot:R90},
                {shape:"l", size:25, div:4, h:-1, rot:R90},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"r", size:75, div:8, h:-2, rot:R90},
                {shape:"r", size:75, div:8, h:-2, rot:R90},
                {shape:"r", size:75, div:4, h:-1, rot:R45},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4, h:0},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:100, div:6, h:1, rot:R45},
                {shape:"l", size:100, div:6, h:1, rot:R45},
                {shape:"l", size:100, div:12, h:2, rot:R90},
                {shape:"l", size:100, div:12, h:2, rot:R90},
                {shape:"l", size:100, div:6, h:2, rot:R45},
                {shape:"r", size:100, div:6, h:1, rot:R45},
                {shape:"s", size:50, div:4, h:1},
                {shape:"r", size:25, div:4, h:1, rot:R90},
                {shape:"s", size:50, div:4, h:1},
                {shape:"r", size:25, div:4, h:1, rot:R90},
                {shape:"s", size:50, div:4, h:1},
                {shape:"s", size:50, div:4, h:1},
                {shape:"s", size:50, div:4, h:1},
                {shape:"s", size:50, div:4, h:1},
                {shape:"s", size:50, div:4, h:1},
                {shape:"s", size:15, div:4, h:0.3},
                {shape:"s", size:50, div:4, h:1},
                {shape:"r", size:50, div:4, h:1, rot:R90},
                {shape:"s", size:50, div:4, h:0},
                {shape:"s", size:50, div:4, h:0},
                {shape:"s", size:50, div:4, h:0},
            ],
        },

        108:{
            // カートコース＋フープス（小さい凹凸
            type:"program",
            metaInfo:[
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:50, div:4, h:0, rot:R90},
                {shape:"r", size:50, div:2, h:0, rot:R45},
                {shape:"s", size:50, div:4, h:0},
                {shape:"s", size:30, div:4, h:0},
                {shape:"s", size:20, div:4, h:1},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"s", size:30, div:4, h:0},
                {shape:"s", size:50, div:4, h:0},
                {shape:"s", size:50, div:4, h:0},
                {shape:"l", size:25, div:4, h:0, rot:R90},
                {shape:"l", size:25, div:4, h:0, rot:R90},
                {shape:"s", size:50, div:4, h:0},
                {shape:"r", size:75, div:8, h:0, rot:R90},
                {shape:"r", size:75, div:8, h:0, rot:R90},
                {shape:"r", size:75, div:4, h:0, rot:R45},
                {shape:"s", size:50, div:4, h:0},
                {shape:"s", size:10, div:4, h:0},
                {shape:"s", size:10, div:4, h:1},
                {shape:"s", size:10, div:4, h:-1},
                {shape:"s", size:10, div:4, h:2},
                {shape:"s", size:10, div:4, h:-2},
                {shape:"s", size:50, div:4, h:0},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:100, div:6, h:0, rot:R45},
                {shape:"l", size:100, div:6, h:0, rot:R45},
                {shape:"l", size:100, div:12, h:0, rot:R90},
                {shape:"l", size:100, div:12, h:0, rot:R90},
                {shape:"l", size:100, div:6, h:0, rot:R45},
                {shape:"r", size:100, div:6, h:0, rot:R45},
                {shape:"s", size:50, div:4, h:0},
                {shape:"r", size:25, div:4, h:0, rot:R90},
                {shape:"s", size:50, div:4, h:0},
                {shape:"r", size:25, div:4, h:0, rot:R90},
                {shape:"s", size:50, div:4, h:0},
                {shape:"s", size:20, div:4, h:2},
                {shape:"s", size:20, div:4, h:-2},
                {shape:"s", size:20, div:4, h:2},
                {shape:"s", size:20, div:4, h:-2},
                {shape:"s", size:20, div:4, h:1},
                {shape:"s", size:20, div:4, h:-1},
                {shape:"s", size:30, div:4, h:0},
                {shape:"s", size:50, div:4, h:0},
                {shape:"s", size:15, div:4, h:0},
                {shape:"s", size:50, div:4, h:0},
                {shape:"r", size:50, div:4, h:0, rot:R90},
                {shape:"s", size:50, div:4, h:0},
                {shape:"s", size:50, div:4, h:0},
                {shape:"s", size:20, div:4, h:2},
                {shape:"s", size:20, div:4, h:-2},
                {shape:"s", size:10, div:4, h:0},
            ],
        },


        109:{
            // カートコース(ダウンヒルｘ２
            type:"program",
            metaInfo:[
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"s", size:50, div:4},
                {shape:"r", size:50, div:4, rot:R90},
                {shape:"r", size:50, div:2, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"r", size:75, div:4, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:100, div:6, rot:R45},
                {shape:"l", size:100, div:6, rot:R45},
                {shape:"l", size:100, div:12, rot:R90},
                {shape:"l", size:100, div:12, rot:R90},
                {shape:"l", size:100, div:6, rot:R45},
                {shape:"r", size:100, div:6, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:15, div:4, h:-0.3},
                {shape:"s", size:50, div:4, h:-1},
                {shape:"r", size:50, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},

                {shape:"s", size:50, div:4, h:-2},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:50, div:4, rot:R90},
                {shape:"r", size:50, div:2, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"l", size:25, div:4, rot:R90, h:-3},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"r", size:75, div:4, rot:R45},
                {shape:"s", size:50, div:4, h:-4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:100, div:6, rot:R45},
                {shape:"l", size:100, div:6, rot:R45},
                {shape:"l", size:100, div:12, rot:R90},
                {shape:"l", size:100, div:12, rot:R90, h:-5},
                {shape:"l", size:100, div:6, rot:R45},
                {shape:"r", size:100, div:6, rot:R45},
                {shape:"s", size:50, div:4, h:-4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90, h:-3},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:15, div:4, h:-0.9},
                {shape:"s", size:50, div:4, h:-2},
                {shape:"r", size:50, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
            ],
        },

        110:{
            // カートコース
            type:"program",
            metaInfo:[
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:50, div:4, rot:R90},
                {shape:"r", size:50, div:2, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"l", size:50, div:4, rot:R90},
                {shape:"l", size:50, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"r", size:75, div:4, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:25, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:100, div:6, rot:R45},
                {shape:"l", size:100, div:6, rot:R45},
                {shape:"l", size:100, div:12, rot:R90},
                {shape:"l", size:100, div:12, rot:R90},
                {shape:"l", size:100, div:6, rot:R45},
                {shape:"r", size:100, div:6, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:15+20, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:50, div:4, rot:R90},
                {shape:"ssin", size:100, div:8, h:-3},
                {shape:"s", size:50, div:4, h:0},

                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:40, div:4},
                {shape:"r", size:70, div:4, rot:R90},
                {shape:"r", size:70, div:2, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"r", size:100, div:8, rot:R90},
                {shape:"r", size:100, div:8, rot:R90},
                {shape:"r", size:120, div:4, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:25, div:4},
                {shape:"r", size:50, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:20, div:4},
                {shape:"r", size:110, div:6, rot:R45},
                {shape:"l", size:60, div:6, rot:R45},
                {shape:"l", size:60, div:12, rot:R90},
                {shape:"l", size:60, div:12, rot:R90},
                {shape:"l", size:60, div:6, rot:R45},
                {shape:"r", size:110, div:6, rot:R45},
                {shape:"s", size:20, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:50, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:20, div:4},
                {shape:"r", size:50, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:15+1, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:50, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"ssin", size:100, div:8, h:3},
            ],
        },

        116:{
            // カートコース 105＋UpDown＋ジグザグ
            type:"program",
            metaInfo:[
                {shape:"s", size:50, div:4, h:2},
                {shape:"s", size:50, div:4, h:1},
                {shape:"r", size:50, div:4, h:1, rot:R90},
                {shape:"r", size:50, div:2, h:1, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"s", size:25, div:4},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"s", size:20, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"r", size:50, div:8, rot:R90},
                {shape:"r", size:50, div:4, rot:R45},
                {shape:"s", size:50, div:4},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, h:-1, rot:R90},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"r", size:25, div:4, rot:R90},
                {shape:"l", size:25, div:4, rot:R90},
                {shape:"r", size:26, div:4, h:-1, rot:R90},
                {shape:"s", size:25, div:4, h:-1},
                // {shape:"s", size:50, div:4, h:-3.35},
            ],
        },

        117:{
            // カートコース 105＋UpDown(2)
            type:"program",
            metaInfo:[
                {shape:"ssin", size:100, div:8, h:10},
                {shape:"ssin", size:150, div:12, h:-15},
                {shape:"r", size:75, div:8, rot:R90, h:0},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"l", size:75, div:8, rot:R90},
                {shape:"l", size:75, div:8, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"ssin", size:250, div:20, h:-10},
                {shape:"r", size:75, div:8, rot:R90, h:0},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"l", size:75, div:8, rot:R90},
                {shape:"l", size:75, div:8, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"r", size:75, div:8, rot:R90},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4},
                {shape:"ssin", size:100, div:8, h:20},
                {shape:"r", size:75, div:8, rot:R90, h:0},
                {shape:"s", size:50, div:4},
                {shape:"s", size:50, div:4, h:-1},
                // {shape:"ssin", size:100, div:8, h:-5},
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
        206:{type:"alg_0206",},
        208:{type:"alg_0208",},

        301:{type:"rec_xzRR", dataOrg :CourseData4.DATA.Nagano_JAPAN.xzRR,},
        311:{type:"rec_xzRR", dataOrg :CourseData3.DATA.Akigase.xz,},
        321:{type:"rec_xzRR", dataOrg :CourseData6.DATA.rt2025AllJapan.xzR,},

        331:{type:"rec_xzy", dataOrg :CourseData7.DATA.oneway1.xzy, },
        332:{type:"rec_xzy", dataOrg :CourseData7.DATA.oneway2.xzy, },
        333:{type:"rec_xzy", dataOrg :CourseData7.DATA.oneway3.xzy, },
        334:{type:"rec_xzy", dataOrg :CourseData7.DATA.oneway4.xzy, },
        335:{type:"rec_xzy", dataOrg :CourseData7.DATA.oneway5.xzy, },
        336:{type:"rec_xzy", dataOrg :CourseData7.DATA.oneway6.xzy, },

        341:{type:"rec_xzy", dataOrg :CourseData7.DATA.loop1.xzy, },
        342:{type:"rec_xzy", dataOrg :CourseData7.DATA.loop2.xzy, },
        343:{type:"rec_xzy", dataOrg :CourseData7.DATA.loop3.xzy, },
        344:{type:"rec_xzy", dataOrg :CourseData7.DATA.loop4.xzy, },
        345:{type:"rec_xzy", dataOrg :CourseData7.DATA.loop5.xzy, },
        346:{type:"rec_xzy", dataOrg :CourseData7.DATA.loop6.xzy, },

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
            let stepy = arcy/18, jarc = 2, x0=0, z0=0, arcType, arcTypeOld = true, i = 0;
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
            // let pitch=0.01, yaw=R90;
            let pitch=0.01, yaw=-R90;
            courseGeo.data.push([x, z, y]);
            for (let i = 0; i < n; ++i) {
                pitch += Math.asin(Math.random()*2-1)*0.1+0.01;
                yaw += Math.asin(Math.random()*2-1);
                x += r*Math.cos(pitch)*Math.cos(yaw);
                z += r*Math.cos(pitch)*Math.sin(yaw);
                y += r*Math.sin(pitch);
                courseGeo.data.push([x, z, y]);
            }

        } else if (courseGeo.type == 'alg_0206') {
            // ランダムウォーク  .. asin で角度制限しつつ
            //   205 に範囲外による強制方向転換
            let n = typeof(courseGeo.n) !== 'undefined' ? courseGeo.n : 100;
            let r = typeof(courseGeo.r) !== 'undefined' ? courseGeo.r : 50;
            let p1=[0,0,0], p2=[0,0,0], geoHist=[], geoHistMax = 10;
            let pitch=0.01, yaw=R90, yaw_, pitchType = 0, pitchTh = 0.4;
            // 経路の交差判定用
            let fillgrid, skey, keyscale=1/20, keyscaleY=1/60;
            let _key = function(p) { return p[0] + ',' + p[1] + ',' + p[2]; }
            let _key2 = function(p) {
                let p_ = [Math.floor(p[0]*keyscale), Math.floor(p[1]*keyscaleY), Math.floor(p[2]*keyscale)];
                return _key(p_);
            }
            let _setgrid = function(p1,p2,fillgrid) {
                for (let s of [0.25, 0.5, 0.75, 1]) {
                    let p = [p2[0]*s+p1[0]*(1-s),
                             p2[1]*s+p1[1]*(1-s),
                             p2[2]*s+p1[2]*(1-s)];
                    let skey = _key2(p);
                    if (!fillgrid.has(skey)) { fillgrid.add(skey); }
                }
            }
            let _isCrossed = function(p1,p2,fillgrid) {
                for (let s of [0.75, 1]) {
                    let p = [p2[0]*s+p1[0]*(1-s), p2[1]*s+p1[1]*(1-s), p2[2]*s+p1[2]*(1-s)];
                    let skey = _key2(p);
                    if (fillgrid.has(skey)) {return true;}
                }
                return false;
            }
            // 範囲内に収めるための向き修正
            let rng = 300, rng_=rng*0.5, rng_2=rng*0.2;
            let correctMode = 0; // 0: 修正なし, 1: 中心方向に
            // 初期位置
            // .. 開始時に位置が安定するように、直線的に配置しても上手くいかない。。なぜか
            // .. 結果CAPを付けるほうがよいみたいので、1回ループに
            let _iniPara = function() {
                courseGeo.data = []; // xzy座標
                pitch=0.0, yaw=-R90, pitchType = 0;
                fillgrid = new Set();
                p1 = [0, 0, 0];
                _setgrid(p1,p1,fillgrid);
                geoHist.push([p1[0], p1[1], p1[2], pitch, yaw, pitchType]);
                courseGeo.data.push([p1[0], p1[2], p1[1]]);
                for (let _ii = 0; _ii < 1; ++_ii) {
                    p2[0] = p1[0] + r*Math.cos(pitch)*Math.cos(yaw);
                    p2[2] = p1[2] + r*Math.cos(pitch)*Math.sin(yaw);
                    p2[1] = p1[1] + r*Math.sin(pitch);
                    // fillgrid に登録
                    _setgrid(p1,p2,fillgrid);
                    p1[0]=p2[0]; p1[1]=p2[1]; p1[2]=p2[2];
                    geoHist.push([p1[0], p1[1], p1[2], pitch, yaw, pitchType]);
                    courseGeo.data.push([p1[0], p1[2], p1[1]]);
                }
                pitch=0.01;
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
                    yaw_ = Math.asin(Math.random()*0.8-0.4);
                    yaw += yaw_;
                    p2[0] = p1[0] + r*Math.cos(pitch)*Math.cos(yaw);
                    p2[2] = p1[2] + r*Math.cos(pitch)*Math.sin(yaw);
                    p2[1] = p1[1] + r*Math.sin(pitch);
                    if (correctMode) {
                        // 領域をはみ出た... 原点方向に向かうように yaw を補正する
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
                    if (_isCrossed(p1,p2,fillgrid)) {
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
            // ランダムウォーク  .. asin で角度制限しつつ
            //   207 + 始点に向かう動きを補正
            // courseGeo.data = []; // xzy座標
            let n = typeof(courseGeo.n) !== 'undefined' ? courseGeo.n : 100;
            let r = typeof(courseGeo.r) !== 'undefined' ? courseGeo.r : 50;
            let p1=[0,0,0], p2=[0,0,0], geoHist=[], geoHistMax = 10;
            let pitch=0.01, yaw=R90, yaw_, pitchType = 0, pitchTh = 0.4;
            // 経路の交差判定用
            let fillgrid, skey, keyscale=1/20, keyscaleY=1/60;
            let _key = function(p) { return p[0] + ',' + p[1] + ',' + p[2]; }
            let _key2 = function(p) {
                let p_ = [Math.floor(p[0]*keyscale), Math.floor(p[1]*keyscaleY), Math.floor(p[2]*keyscale)];
                return _key(p_);
            }
            let _setgrid = function(p1,p2,fillgrid) {
                for (let s of [0.25, 0.5, 0.75, 1]) {
                    let p = [p2[0]*s+p1[0]*(1-s), p2[1]*s+p1[1]*(1-s), p2[2]*s+p1[2]*(1-s)];
                    let skey = _key2(p);
                    if (!fillgrid.has(skey)) { fillgrid.add(skey); }
                }
            }
            let _isCrossed = function(p1,p2,fillgrid) {
                for (let s of [0.75, 1]) {
                    let p = [p2[0]*s+p1[0]*(1-s), p2[1]*s+p1[1]*(1-s), p2[2]*s+p1[2]*(1-s)];
                    let skey = _key2(p);
                    if (fillgrid.has(skey)) {return true;}
                }
                return false;
            }
            // 範囲内に収めるための向き修正
            let rng = 300, rng_=rng*0.5, rng_2=rng*0.2;
            let correctMode = 0; // 0: 修正なし, 1: 中心方向に
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
                pvia = null, pvialist = [];
            }
            _iniPara();
            let nloop = 5;
            let n80 = Math.floor(n*0.92); // n80 以降は始点に向かって移動させる
            let r01 = r*0.1; // 直接始点(ptrg0)に向かうのではなく一度 ptrg1 を目指す
            let rr = r*3;
            // let rr = r*1;
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
                            if (n-i < nn) {
                                n += nn;
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
                                }
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
                                        if (!_isCrossed(pp1,pvia,fillgrid)) {
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
                                }
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
                                        if (!_isCrossed(pp1,pvia,fillgrid)) {
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
                                if (!_isCrossed(_p0,_p1,fillgrid)) {
                                    break; // 交差なし
                                }
                                let vrnd = BABYLON.Vector3.Random(-r01, r01);
                                _p1.addInPlace(vrnd);
                                _p1 = _p0.add(_p1.subtract(_p0).normalize().scale(r));
                            }
                            let len = BABYLON.Vector3.Distance(_p0, pvia);
                            if (len < r*1.1) {
                                // 十分に接近と判断
                                if (pvialist.length > 0) {
                                    pvia = pvialist.pop();
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
                        yaw_ = Math.asin(Math.random()*0.8-0.4);
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
                    if (_isCrossed(p1,p2,fillgrid)) {
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
            if (1) {
                // courseGeo.dataの始点と終点を確認し r 以上なら補間点を追加
                // pn から p0 に向かって内分点を打つ
                let p0 = new BABYLON.Vector3(courseGeo.data[0][0], courseGeo.data[0][2], courseGeo.data[0][1]);
                let m = courseGeo.data.length, n1=m-1;
                let pn = new BABYLON.Vector3(courseGeo.data[n1][0], courseGeo.data[n1][2], courseGeo.data[n1][1]);
                let len0n = BABYLON.Vector3.Distance(p0, pn);
                if (len0n > r*1.5) {
                    let ndiv = Math.ceil(len0n/r);
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
            setText2(tlabel);
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
                                   radius:5,
                                   // arc:1,
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

                } else if (meshType == 'ribbon') {
                    // ひねり（ロール）を生かしたまま、周回時の始点と終点の角度ずれ（ロール角）を一致させる
                    // 基本 extrude と同じ
                    let path3d = new BABYLON.Path3D(plist3, BABYLON.Vector3.Up()); // 初期法線方向の固定化
                    // 周回時の始点と終点の角度ずれ（ロール角）を確認する
                    let diffRot = getDiffRad(path3d);
                    let plist3R = [], plist3L = [];
                    let size=5, sstep=0.002, n = Math.floor(1/sstep), rstep, plist = [], vtlist = [], vnlist = [];
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
                    let fric=1, rest=0.1;
                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:fric, restitution:rest}, scene);
                    meshAggInfo.push([mesh,null]);
                    courseMetaMesh._sstep = sstep;
                    courseMetaMesh._plist = plist;
                    courseMetaMesh._vtlist = vtlist;
                    courseMetaMesh._vnlist = vnlist;

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
                    if (1) {
                        // スタート・ゴールの表示
                        let iclist = [[0, BABYLON.Color3.Blue()],
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


                } else if (meshType == 'ribbon_up2') {
                    // 常に従法線(binormal)が同一平面上／ロール無 + 上の覆い（箱型
                    let courseW = typeof(courseMetaMesh.courseW) !== 'undefined' ? courseMetaMesh.courseW : 10;
                    let courseH = typeof(courseMetaMesh.courseH) !== 'undefined' ? courseMetaMesh.courseH : 2.5;
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
                    let path3 = [plist3LE, plist3L, plist3R, plist3RE, plist3LE];
                    let mesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray:path3, sideOrientation:BABYLON.Mesh.DOUBLESIDE});
                    mesh.material = new BABYLON.StandardMaterial("");
                    mesh.material.diffuseColor = new BABYLON.Color3(0.2, 1.0, 0.4);
                    mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
                    mesh.material.wireframe = 1;
                    mesh.material.alpha = 0.5;
                    let fric=1, rest=0.1;
                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:fric, restitution:rest}, scene);
                    meshAggInfo.push([mesh,null]);
                    courseMetaMesh._sstep = sstep;
                    courseMetaMesh._plist = plist;
                    courseMetaMesh._vtlist = vtlist;
                    courseMetaMesh._vnlist = vnlist;
                    if (1) {
                        // スタート・ゴールの表示
                        let iclist = [[0, BABYLON.Color3.Blue()],
                                      [plist3.length-1, BABYLON.Color3.Red()],
                                     ];
                        for (let [i,c]  of iclist) {
                            let p = plist3[i];
                            let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:10}, scene);
                            mesh.position.copyFrom(p);
                            mesh.material = new BABYLON.StandardMaterial('', scene);
                            mesh.material.diffuseColor = c; // BABYLON.Color3.Blue();
                            mesh.material.alpha = 0.5;
                            meshAggInfo.push([mesh,null]);
                        }
                    }

                } else if (meshType == 'ribbon_up3') {
                    // 常に従法線(binormal)が同一平面上／ロール無 + 上の覆い（箱型
                    let courseW = typeof(courseMetaMesh.courseW) !== 'undefined' ? courseMetaMesh.courseW : 10;
                    let courseH = typeof(courseMetaMesh.courseH) !== 'undefined' ? courseMetaMesh.courseH : 2.5;
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
                    // 表示用のメッシュ
                    let path3 = [plist3LE, plist3L, plist3R, plist3RE];
                    let mesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray:path3, sideOrientation:BABYLON.Mesh.DOUBLESIDE});
                    mesh.material = new BABYLON.StandardMaterial("");
                    mesh.material.diffuseColor = new BABYLON.Color3(0.2, 1.0, 0.4);
                    mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
                    mesh.material.wireframe = 1;
                    mesh.material.alpha = 0.5;
                    meshAggInfo.push([mesh,null]);

                    {
                        // 転落時防止用のメッシュ
                        let path3 = [plist3LE, plist3L, plist3R, plist3RE, plist3LE];
                        let mesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray:path3, sideOrientation:BABYLON.Mesh.DOUBLESIDE});
                        mesh.visibility = 0;
                        let fric=1, rest=0.1;
                        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:fric, restitution:rest}, scene);
                        meshAggInfo.push([mesh,null]);
                    }
                    courseMetaMesh._sstep = sstep;
                    courseMetaMesh._plist = plist;
                    courseMetaMesh._vtlist = vtlist;
                    courseMetaMesh._vnlist = vnlist;
                    if (1) {
                        // スタート・ゴールの表示
                        let iclist = [[0, BABYLON.Color3.Blue()],
                                      [plist3.length-1, BABYLON.Color3.Red()],
                                     ];
                        for (let [i,c]  of iclist) {
                            let p = plist3[i];
                            let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:10}, scene);
                            mesh.position.copyFrom(p);
                            mesh.material = new BABYLON.StandardMaterial('', scene);
                            mesh.material.diffuseColor = c;
                            mesh.material.alpha = 0.5;
                            meshAggInfo.push([mesh,null]);
                        }
                    }

                } // else if (meshType == '...') {

            }
        }
        return courseMetaMeshList;
    }


    // 107 Babylon.js で物理演算(havok)：カプセルを転がす
    let fnUpdateMyMesh = function() {
        {
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
                resetPostureMyMesh();
            }
            if (yawDirection) {
                camera.alpha += -0.1*yawDirection;
            }
        }

        // --------------------
        // スピード表示
        {
            let vSpeed = myMesh.physicsBody.getLinearVelocity().length();
            setText1(vSpeed);
        }
    }

    let resetPostureMyMesh = function() {
        myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
        myMesh.position.copyFrom(p0.add(new BABYLON.Vector3(0, 2, 0)));
        if (camera != null) {
            let rad =  -camera.alpha - R90, r=10;
            let x = r*Math.cos(rad);
            let z = r*Math.sin(rad);
            camera.position.copyFrom(myMesh.position.add(new BABYLON.Vector3(x, 2, z)));
            camera.alpha = courseMetaMeshList[0]._cameraAlphaIni;
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
    let cooltime_act = 0, cooltime_actIni = 20;

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
            if (map[","]) {
                cooltime_act = cooltime_actIni;
                myMesh.material.alpha = 0.1;
            }
            if (map["."]) {
                cooltime_act = cooltime_actIni;
                myMesh.material.alpha = 1;
            }
            keyAction.reset = false;
            if (map["r"]) {
                cooltime_act = cooltime_actIni;
                keyAction.reset = true;
            }
            if (map["n"] || map["b"]) {
                cooltime_act = cooltime_actIni;
                if (map["n"]) {
                    nextStage();
                } else {
                    backStage();
                }
            }
            if (map["p"]) {
                cooltime_act = cooltime_actIni;
                {
                    // ～用の座標データ
                    let data = courseMetaMeshList[0].data;
                    // x,z,y で表示
                    let sout = "\n";
                    for (let [x,z,y] of data) {
                        x *= 0.1;
                        z *= 0.1;
                        y *= 0.1;
                        sout += "["+x.toFixed(3)+","+z.toFixed(3)+","+y.toFixed(3)+"],";
                    }
                    console.log(sout);

                }
            }
        }
    });

    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // ------------------------------
    // スピードメーター（上部中央）
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Ready!";
    text1.color = "white";
    text1.fontSize = 24;
    text1.height = "36px";
    text1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text1);

    let setText1 = function(val) {
        val = Math.floor(val*3.6) // [m/s]を [km/h]に直す
        text1.text = "" + val + " [km/h]"
    }

    // ------------------------------
    // メッセージ（数秒後にフェードアウト）
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Ready!";
    text2.color = "white";
    text2.fontSize = 24;
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
    // ゴール時の処理

    // 次のステージ
    let nextStage = function() {
        istage = (istage+1)%nstage;
        courseMetaMeshList = createStage(istage);
        p0 = courseMetaMeshList[0]._plist[3];
        // resetPostureMyMesh()を遅れて呼び出すためにフラグをセットする
        keyAction.reset = true;
    }
    // 次のステージ
    let backStage = function() {
        istage = (istage+nstage-1)%nstage;
        courseMetaMeshList = createStage(istage);
        p0 = courseMetaMeshList[0]._plist[3];
        // resetPostureMyMesh()を遅れて呼び出すためにフラグをセットする
        keyAction.reset = true;
    }


    // ６秒後にステージ変更を呼び出す
    let setNextStage = function() {
        if (bAutoNextStage) {
            setTimeout(nextStage, 6000);
        }
    }
    // 入賞できず／失格の場合：同じステージを再スタート
    let setRestart = function() {
        if (bAutoStart) {
            setTimeout(resetPostureMyMesh, 6000);
        }
    }

    // ----------------------------------------
    let istage = 0;

    // for ScreenShot
//    istage = 16;
//    istage = 1;
//    istage = 3;
//    istage = 6;
    // ----------
    // let istage = 13;
    // let istage = 16; // 110
    // let istage = 17; // 301
    // let istage = 18; // 311
//     let istage = 7; // 206 "p" で座標値表示
//     let istage = 8; // 208 "p" で座標値表示
//     let istage = 20; // 331 oneway
//     let istage = 26; // 341 loop
//     istage = 24; // 341 loop

    // const stageInfoList = [
    //     // istage, label, fpathCourseImg
    //     [[12105], "0.カートコース(flat)", ""],
    //     [[12106], "1.カートコース(弱UpDown)", ""],
    //     [[12107], "2.カートコース(弱UpDown2)", ""],
    //     [[12108], "3.カートコース(フープス)", ""],
    //     [[12109], "4.カートコース(ダウンヒルｘ２周)", ""],
    //     [[12110], "5.カートコース(２レーン)", ""],
    //     [[12115, 12116, 12117], "6.カートコース(分岐)", ""],
    //     [[30301], "7.ボブスレー／Nagano_JAPAN", ""],
    //     [[30311], "8.カート／akigase", ""],
    //     [[30321], "9.ロボトレース／2025全日本", ""],
    //     [[15401], "10.コーラム", ""],
    //     [[14104], "11.上昇（片）", ""],
    //     [[26201], "12.らせん（片：上昇）", ""],
    //     [[26202], "13.ランダム１(片：上昇)", ""],
    //     [[26203], "14.ランダム２(片：上昇)", ""],
    //     [[11101], "15.ローラーコースター", ""],
    //     [[11105], "16.カートコース(tube", ""],
    //     [[12102], "17.ローラーコースター(tube)", ""],
    //     [[30331], "18.UpDown片道(1", ""],
    //     [[30332], "19.UpDown片道(2", ""],
    //     [[30333], "20.UpDown片道(3", ""],
    //     [[30334], "21.UpDown片道(4", ""],
    //     [[30335], "22.UpDown片道(5", ""],
    //     [[30336], "23.UpDown片道(6", ""],
    //     [[30341], "24.UpDown(1", ""],
    //     [[30342], "25.UpDown(2", ""],
    //     [[30343], "26.UpDown(3", ""],
    //     [[30344], "27.UpDown(4", ""],
    //     [[30345], "28.UpDown(5", ""],
    //     [[30346], "29.UpDown(6", ""],
    //     [[26206], "30.ランダムUpDown(片)", ""],
    //     [[26208], "31.ランダムUpDown(周)", ""],
    // ];

    let courseMetaMeshList = createStage(istage);
    let p0 = courseMetaMeshList[0]._plist[3];


    let myMeshPini = p0.add(new BABYLON.Vector3(0, 2, 0));
    let myMesh = crBall(myMeshPini), actMode = 1;

    camera = crCamera5_3(myMesh);

    camera.alpha = courseMetaMeshList[0]._cameraAlphaIni;

    let fnobj01 = scene.onBeforeRenderObservable.add(fnUpdateMyMesh);

    return scene;
};

// ######################################################################

export var createScene = createScene_test_2017;

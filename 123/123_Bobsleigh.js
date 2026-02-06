// Babylon.js で物理演算(havok)：ボブスレー

//  - カーソル上下       .. 前後移動
//  - カーソル右左       .. 旋回
//  - Ctrl＋カーソル右左 .. 急旋回
//  - space              .. ブレーキ
//  - r                  .. スタート位置に移動
//  - カーソル下＋右／左 .. ロール（進行方向を軸に右回転／左回転）／上下ひっくり返った時に
//  - カーソル上＋下     .. 前後反転／後ろ向きになった時に
//  - (c/C[=shift+c])    .. カメラ変更
//  - (m/M[=shift+m])    .. 移動体（ボード／車）変更
//  - h                   .. ヘルプ表示

const R90 = Math.PI/2;
const R180 = Math.PI;

// const SCRIPT_URL2 = "./Vehicle_draft2.js";
// const SCRIPT_URL22 = "./CourseData4.js";
// const myTextPath3 = "textures/pipo-charachip017a.png"; // メイド
// const goalPath ="textures/checker.jpg";
// const skyboxTextPath4 = "textures/skybox4"; // 雪山
// const iconPath3 = "textures/icon_golf6.png";
// const dbase = "textures/course6/"

// --------------------------------------------------
const SCRIPT_URL2 = "../105/Vehicle2.js";
const SCRIPT_URL22 = "./CourseData4.js";
const myTextPath3 = "../111/textures/pipo-charachip017a.png"; // メイド
const goalPath ="textures/checker.jpg";
const skyboxTextPath4 = "../111/textures/skybox4"; // 雪山
const iconPath3 = "../099/textures/icon_golf6.png";
const dbase = "textures/course6/"

// --------------------------------------------------

// const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/105/Vehicle2.js";
// const SCRIPT_URL22 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/123/CourseData4.js";
// const myTextPath3 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/111/textures/pipo-charachip017a.png"; // メイド
// const goalPath ="https://raw.githubusercontent.com/fnamuoo/webgl/main/123/textures/checker.jpg";
// const skyboxTextPath4 = "textures/skybox4"; // 雪山
// const iconPath3 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/icon_golf6.png";
// const dbase = "https://raw.githubusercontent.com/fnamuoo/webgl/main/123/textures/course6/"



const skyboxTextPathList = [skyboxTextPath4];
// let skyboxType=0; // -1:rand, 0-2: 固定
// let skyboxType=1; // tropical/ blue
let skyboxType=0;

let Vehicle2 = null;
await import(SCRIPT_URL2).then((obj) => { Vehicle2 = obj; });
let CourseData4 = null;
await import(SCRIPT_URL22).then((obj) => { CourseData4 = obj; });


let icamera = 6, ncamera = 8, imymesh = 22; // player/ボブスレーもどき
// let icamera = 6, ncamera = 8, imymesh = 21; // 横滑りするボード
// let icamera = 6, ncamera = 8, imymesh = 5; // player/車
// let icamera = 0, ncamera = 8, imymesh = 0; // 全体を俯瞰
// let mymeshList = [0, 3, 5, 22];
let mymeshList = [5, 22];

// ステージクリア（３位入賞）時の自動でステージ変更
const bAutoNextStage = true;
// ステージクリア失敗時の自動で再スタート
const bAutoStart = true;

let bskybox = true;

// for screenshot
// icamera = 0; ncamera = 8; imymesh = 0; bskybox = false;

let istage=0;

const courseInfoList = [
    // istage, type, label, fpath
    // [900000, 0, "test", dbase+""],
    [900505, 0, "Calgary_CANADA"        , dbase+"05_Calgary_CANADA.jpg"], // 63.7 - 105.5
    [900205, 0, "Parkcity_USA"          , dbase+"02_Parkcity_USA.jpg"],   // 76.1 - 122.6
    [900305, 0, "Lakeplacid_USA"        , dbase+"03_Lakeplacid_USA.jpg"], // 76.3 - 117.2
    [900405, 0, "Whistler_USA"          , dbase+"04_Whistler_USA.jpg"],   // 70.3 - 111.0
    [900605, 0, "Altenberg_GERMANY"     , dbase+"06_Altenberg_GERMANY.jpg"], // 71.1 - 124.3
    [900805, 0, "Winterberg_GERMANY"    , dbase+"08_Winterberg_GERMANY.jpg"], // 81.1 - 117.7
    [900905, 0, "Igls_AUSTRIA"          , dbase+"09_Igls_AUSTRIA.jpg"], // 71.1 - 126.7
    [901105, 0, "Stmoritz_SWITZERLAND"  , dbase+"11_Stmoritz_SWITZERLAND.jpg"], // 70.9 - 110.932
    [901205, 0, "Cesana_ITALY"          , dbase+"12_Cesana_ITALY.jpg"], // 69.7 - 118.1
    [901305, 0, "Lillehammer_NORWAY"    , dbase+"13_Lillehammer_NORWAY.jpg"], // 75.8 - 140
    [901605, 0, "Kunsteisbahn_AUSTRIA"  , dbase+"16_Kunsteisbahn_AUSTRIA.jpg"], // 72.7 - 102.2
    [900105, 0, "Nagano_JAPAN"          , dbase+"01_Nagano_JAPAN.jpg"],   // 91.6 - 142.2
    [901505, 0, "Sochi_RUSSIA"          , dbase+"15_Sochi_RUSSIA.jpg"], // 84.0 - 169.8
    [901005, 0, "laPlagne_FRANCE"       , dbase+"10_laPlagne_FRANCE.jpg"], // 90.7 - 144.3
    [901405, 0, "Sigulda_LATVIA"        , dbase+"14_Sigulda_LATVIA.jpg"], // 105.9 - 169.3
    [900705, 0, "KoenigsseeLuge_GERMANY", dbase+"07_KoenigsseeLuge_GERMANY.jpg"], // 70.8 - 118
    [901705, 0, "Cortina_ITALY"         , dbase+"17_Cortina_ITALY.jpg"], // 77.5 - 144.4
];

const metaStageInfo = {
    900000:{label:"",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:180, adjy:150, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.1, pCPq4Idx:0.9,
            data :CourseData4.DATA.test.xz,
            courseRec:[16.564, 18.266, 997],
            bestLap:[4.031, 9.099, 12.998, 16.564],
           },

    900105:{label:"Nagano_JAPAN",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:180, adjy:150, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.87,
            data :CourseData4.DATA.Nagano_JAPAN.xz,
            courseRec:[91.632, 128.133, 142.268],
            bestLap:[28.268, 56.567, 75.999, 91.632],
            // [76.701, 128.133, 142.268] [23.403, 46.467, 63.667, 76.701]
           },

    900205:{label:"Parkcity_USA",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:120, adjy:120, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.85,
            data :CourseData4.DATA.Parkcity_USA.xz,
            courseRec:[76.166, 107.099, 122.699],
            bestLap:[17.434, 47.768, 64.901, 76.166],
            // [76.166, 107.099, 107.699] [17.434, 47.768, 64.901, 76.166]
           },

    900305:{label:"Lakeplacid_USA",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:170, adjy:120, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.90,
            data :CourseData4.DATA.Lakeplacid_USA.xz,
            courseRec:[76.336, 90.901, 117.202],
            bestLap:[18.902, 45.835, 62.302, 76.336],
            // [76.336, 116.465, 117.202]  [18.902, 45.835, 62.302, 76.336]
           },

    900405:{label:"Whistler_USA",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:50, adjy:120, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.85,
            data :CourseData4.DATA.Whistler_USA.xz,
            courseRec:[70.399, 87.596, 111.001],
            bestLap:[21.8, 39.232, 52.966, 70.399],
            // [70.399, 110.635, 111.001] [21.8, 39.232, 52.966, 70.399]
           },

    900505:{label:"Calgary_CANADA",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:130, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.84,
            data :CourseData4.DATA.Calgary_CANADA.xz,
            // 
            courseRec:[63.731, 78.566, 105.5] ,
            bestLap:[20.3, 41.132, 54.165, 63.731],
            // [63.731, 100.099, 105.5] (4) [20.3, 41.132, 54.165, 63.731]

           },

    900605:{label:"Altenberg_GERMANY",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:100, adjy:130, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.87,
            data :CourseData4.DATA.Altenberg_GERMANY.xz,
            courseRec:[71.198, 87.064, 124.364],
            bestLap:[23.03, 43.897, 60.932, 71.198],
            // [71.198, 100.464, 124.364] (4) [23.03, 43.897, 60.932, 71.198]
           },

    900705:{label:"KoenigsseeLuge_GERMANY",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:80, adjy:130, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.02, pCPq4Idx:0.90,
            data :CourseData4.DATA.KoenigsseeLuge_GERMANY.xz,
            courseRec:[70.833, 90.733, 118.834],
            bestLap:[22.667, 41.668, 53.301, 70.833]
            // [70.833, 113.867, 118.834] (4) [22.667, 41.668, 53.301, 70.833]
           },

    900805:{label:"Winterberg_GERMANY",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-260, adjz:130, adjy:140, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.85,
            data :CourseData4.DATA.Winterberg_GERMANY.xz,
            courseRec:[81.198, 92.899, 117.765],
            bestLap:[21.53, 47.897, 66.831, 81.198],
           },

    900905:{label:"Igls_AUSTRIA",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:140, adjy:140, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.92,
            data :CourseData4.DATA.Igls_AUSTRIA.xz,
            courseRec:[71.132, 89.865, 126.733],
            bestLap:[17.499, 39.5, 54.465, 71.132],
           },

    901005:{label:"laPlagne_FRANCE",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:110, adjy:140, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.90,
            data :CourseData4.DATA.laPlagne_FRANCE.xz,
            courseRec:[90.731, 105.9, 144.301],
            bestLap:[23.565, 48.466, 73.565, 90.731],
           },

    901105:{label:"Stmoritz_SWITZERLAND",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:180, adjy:140, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.87,
            data :CourseData4.DATA.Stmoritz_SWITZERLAND.xz,
            courseRec:[70.968, 85.767, 110.932],
            bestLap:[15.567, 38.533, 56.666, 70.968],
            // vehicle [79.066, 97.533, 997] [17.199, 46.834, 65.733, 79.066]
           },

    901205:{label:"Cesana_ITALY",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:90, adjy:130, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.85,
            data :CourseData4.DATA.Cesana_ITALY.xz,
            courseRec:[69.731, 85.901, 118.131],
            bestLap:[24.697, 46.265, 59.798, 69.731],
            // vehicle [74.333, 997, 998] [23.434, 46.233, 61.932, 74.333]
           },

    901305:{label:"Lillehammer_NORWAY",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:140, adjy:130, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.90,
            data :CourseData4.DATA.Lillehammer_NORWAY.xz,
            courseRec:[75.833, 91.5, 140.133],
            bestLap:[22.867, 43.433, 59.099, 75.833],
            // [75.833, 91.5, 140.133] [22.867, 43.433, 59.099, 75.833]
            // vehicle [89.265, 97.397, 997] [23.032, 47.232, 67.764, 89.265]
           },

    901405:{label:"Sigulda_LATVIA",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:220, adjy:140, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.87,
            data :CourseData4.DATA.Sigulda_LATVIA.xz,
            courseRec:[105.932, 125.9, 169.366],
            bestLap:[35.265, 69.999, 91.7, 105.932],
            // [105.932, 111.9, 169.366] [35.265, 69.999, 91.7, 105.932]
            //  vehicle [137.367, 140.733, 997] (4) [42.736, 84.9, 113.501, 137.367]
           },

    901505:{label:"Sochi_RUSSIA",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:230, adjy:140, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.89,
            data :CourseData4.DATA.Sochi_RUSSIA.xz,
            courseRec:[84.099, 100.766, 169.899],
            bestLap:[26.066, 50.531, 68.43, 84.099],
            // [84.099, 95.766, 169.899] [26.066, 50.531, 68.43, 84.099]
            // vehicle [112.501, 115.533, 997] [29.066, 63.765, 88.366, 112.501]
           },

    901605:{label:"Kunsteisbahn_AUSTRIA",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:110, adjy:140, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.86,
            data :CourseData4.DATA.Kunsteisbahn_AUSTRIA.xz,
            courseRec:[72.767, 88.531, 102.234],
            bestLap:[20.366, 42.733, 60.066, 72.767],
            //    [72.767, 73.531, 102.234] [20.366, 42.733, 60.066, 72.767]
            // vehicle [71.033, 73.499, 997] [20.568, 42.433, 58.1, 71.033]
           },

    901705:{label:"Cortina_ITALY",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:110, adjy:140, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.88,
            data :CourseData4.DATA.Cortina_ITALY.xz,
            courseRec:[77.566, 94.101, 144.4],
            bestLap:[25.034, 45.366, 66.966, 77.566],
            // [77.566, 84.101, 144.4] [25.034, 45.366, 66.966, 77.566]
            // vehicle [82.699, 86.267, 997] [23.732, 46.866, 66.133, 82.699]
           },

    901805:{label:"Cortina_ITALY",
            iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:110, adjy:140, nbPoints:15, pQdbg:1,
            dtype:"xzR", iystep:-0.8, pCPq0Idx:0.03, pCPq4Idx:0.88,
            data :CourseData4.DATA.Cortina_ITALY_20.xz,
            courseRec:[77.566, 94.101, 144.4],
            bestLap:[25.034, 45.366, 66.966, 77.566],
            // [77.566, 84.101, 144.4] [25.034, 45.366, 66.966, 77.566]
            // vehicle [82.699, 86.267, 997] [23.732, 46.866, 66.133, 82.699]
           },

    // ----------------------------------------

};




let nstage = courseInfoList.length;

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let camera = null, myMesh=null;
    // let icamera = 0, ncamera = 8;
    let cameralist = [];
    var changeCamera = function(icamera) {
console.log("icamera=",icamera)
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100,-0.01), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる

            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;

        }
        if (icamera == 1) {
            // フローカメラを使ったバードビュー
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 180;
            camera.radius = 5; // 10;
            camera.heightOffset = 3;
            camera.cameraAcceleration = 0.05;
            camera.maxCameraSpeed = 50;
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (icamera == 2) {
            // フローカメラを使ったドライバーズビュー
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 180;
            camera.radius = 0.5;
            camera.heightOffset = 0.1;
            camera.cameraAcceleration = 0.6;
            camera.maxCameraSpeed = 50;
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (icamera == 3) {
            // 対象(myMesh)とカメラの位置関係から、後方にカメラを配置(高さが絶対位置）
            camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (icamera == 4) {
            // 車体とカメラを固定（進行軸が同じ）して地形が変化（斜面でも地面にカメラが埋まらない）
            camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }

        if (icamera == 5) {
            // 上記４カメラを１画面で
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            {
                let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
                camera.rotationOffset = 180;
                camera.radius = 5;
                camera.heightOffset = 1;
                camera.cameraAcceleration = 0.05;
                camera.maxCameraSpeed = 50;
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
                camera.rotationOffset = 180;
                camera.radius = 0.5;
                camera.heightOffset = 0.1;
                camera.cameraAcceleration = 0.6;
                camera.maxCameraSpeed = 50;
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
                camera.setTarget(BABYLON.Vector3.Zero());
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
                camera.setTarget(BABYLON.Vector3.Zero());
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            //scene.activeCameras.pop();
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
                // camera.dispose();
                // camera=null;
            }

            cameralist[0].viewport = new BABYLON.Viewport(0.0, 0.5, 0.5, 0.5); // 左上
            cameralist[1].viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5); // 右上
            cameralist[2].viewport = new BABYLON.Viewport(0.0, 0.0, 0.5, 0.5); // 左下
            cameralist[3].viewport = new BABYLON.Viewport(0.5, 0.0, 0.5, 0.5); // 右下
//console.log("camera.len=",cameralist.length);
        }

        if (icamera == 6) {
            // // 車体とカメラを固定（進行軸が同じ）して地形が変化（斜面でも地面にカメラが埋まらない）
            camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
            // camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 4,-10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.lockedTarget = myMesh;
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
        }

        if (icamera == 7) {
            // 上記４カメラを１画面で
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            {
                let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
                camera.rotationOffset = 180;
                camera.radius = 5;
                camera.heightOffset = 1;
                camera.cameraAcceleration = 0.05;
                camera.maxCameraSpeed = 50;
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
                camera.rotationOffset = 180;
                camera.radius = 0.5;
                camera.heightOffset = 0.1;
                camera.cameraAcceleration = 0.6;
                camera.maxCameraSpeed = 50;
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
                camera.setTarget(BABYLON.Vector3.Zero());
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
                camera.setTarget(BABYLON.Vector3.Zero());
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            //scene.activeCameras.pop();
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
                // camera.dispose();
                // camera=null;
            }

            cameralist[0].viewport = new BABYLON.Viewport(0.0, 0.5, 0.5, 0.5); // 左上
            cameralist[1].viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5); // 右上
            cameralist[2].viewport = new BABYLON.Viewport(0.0, 0.0, 0.5, 0.5); // 左下
            cameralist[3].viewport = new BABYLON.Viewport(0.5, 0.0, 0.5, 0.5); // 右下
//console.log("camera.len=",cameralist.length);
        }

        // if (icamera == 5 && myMesh!=null) {
        if (((icamera == 5) || (icamera == 7)) && myMesh!=null) {
            cameralist[0].lockedTarget = myMesh;
            cameralist[1].lockedTarget = myMesh;
            cameralist[2].lockedTarget = myMesh;
            cameralist[3].lockedTarget = myMesh;
        } else if (icamera >= 1 && myMesh!=null) {
            camera.lockedTarget = myMesh;
        }
    }
    scene.onBeforeRenderObservable.add((scene) => {
        if (icamera == 3) {
            let vdir = camera.position.subtract(myMesh.position).normalize().scale(5);
            vdir.y = 1;
            camera.position = myMesh.position.add(vdir);
        }
        // if ((icamera == 4) && (myMesh._vehicle != null)) {
        if (icamera == 4) {
            // let quat = myMesh._vehicle.body.transformNode.rotationQuaternion;
            let quat = myMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(0, 1, -5);
            vdir = vdir.applyRotationQuaternion(quat);
            camera.position = myMesh.position.add(vdir);
        }
        if (icamera == 5) {
            {
                let vdir = cameralist[2].position.subtract(myMesh.position).normalize().scale(5);
                vdir.y = 1;
                cameralist[2].position = myMesh.position.add(vdir);
            }
            
            //if ((myMesh._vehicle != null)) {
            {
                let quat = myMesh.rotationQuaternion;
                let vdir = new BABYLON.Vector3(0, 1, -5);
                vdir = vdir.applyRotationQuaternion(quat);
                cameralist[3].position = myMesh.position.add(vdir);
            }
        }

        if (icamera == 6) {
            let quat = myMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(0, 1, -5);
            vdir = vdir.applyRotationQuaternion(quat);
            camera.position = myMesh.position.add(vdir);
            camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        }
        if (icamera == 7) {
            {
                let quat = myMesh.rotationQuaternion;
                // cameralist[0].upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                cameralist[1].upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
            }
            {
                let vdir = cameralist[2].position.subtract(myMesh.position).normalize().scale(5);
                vdir.y = 1;
                cameralist[2].position = myMesh.position.add(vdir);
            }
            {
                let quat = myMesh.rotationQuaternion;
                let vdir = new BABYLON.Vector3(0, 1, -5);
                vdir = vdir.applyRotationQuaternion(quat);
                cameralist[3].position = myMesh.position.add(vdir);
                cameralist[3].upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
            }
        }
    });

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    if (0) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
        var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
    }


    // ----------------------------------------
    // ----------------------------------------


    var getMetaStageInfo = function (istage) {
        let rval;
        let [id, ttype, tlabel, tpath] = courseInfoList[istage];
        rval = metaStageInfo[id];
        if (ttype == 0) {
            console.log("\ni=",istage, rval.label, tlabel);
        } else if (ttype == 1) {
            console.log("unsupport");;
            console.assert(0);
            // console.log("\ni=",istage, rval.label, tlabel);
            // rval = createCourseData(rval);
        } else {
            console.assert(0);
        }
        setText2(tlabel);

        return rval;
    }

    let meshAggInfo = []; // mesh, agg;
    let meshes = [];
    let pStart = new BABYLON.Vector3(0, 0, 0);
    let pStart2 = new BABYLON.Vector3(0, 0, 0); // pStart位置の方向のために
    let pGoal = new BABYLON.Vector3(0, 0, 0);
    let imeshCP = 0;
    // 各チェックポイントのメッシュ
    let meshCPlist = [];
    // 各チェックポイントの時刻
    let curTimeCPlist = [null, null, null, null, null];
    // コースレコード(３位まで)
    let courseRecordlist = [999, 999, 999];
    // ベストレコードのラップレコード
    let bestLap = [null, null, null, null];


    var createStage2 = function(istage) {
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        let metaStageInfo = getMetaStageInfo(istage)

        let stageType = typeof(metaStageInfo.stageType) !== 'undefined' ? metaStageInfo.stageType : "tube";
        let useSpline = typeof(metaStageInfo.useSpline) !== 'undefined' ? metaStageInfo.useSpline : true;
        let nbPoints = typeof(metaStageInfo.nbPoints) !== 'undefined' ? metaStageInfo.nbPoints : 20;
        let pStartIdx = typeof(metaStageInfo.pStartIdx) !== 'undefined' ? metaStageInfo.pStartIdx:10;
        let pCPq0Idx = typeof(metaStageInfo.pCPq0Idx) !== 'undefined' ? metaStageInfo.pCPq0Idx:20;
        let pCPq1Idx = typeof(metaStageInfo.pCPq1Idx) !== 'undefined' ? metaStageInfo.pCPq1Idx:0.25;
        let pCPq2Idx = typeof(metaStageInfo.pCPq2Idx) !== 'undefined' ? metaStageInfo.pCPq2Idx:0.5;
        let pCPq3Idx = typeof(metaStageInfo.pCPq3Idx) !== 'undefined' ? metaStageInfo.pCPq3Idx:0.70;
        let pCPq4Idx = typeof(metaStageInfo.pCPq4Idx) !== 'undefined' ? metaStageInfo.pCPq4Idx:-20;
        let isLoopCourse = typeof(metaStageInfo.isLoopCourse) !== 'undefined' ? metaStageInfo.isLoopCourse : false;
        let endRound = typeof(metaStageInfo.endRound) !== 'undefined' ? metaStageInfo.endRound : 0;
        let iy = typeof(metaStageInfo.iy) !== 'undefined' ? metaStageInfo.iy : 5;
        let iystep = typeof(metaStageInfo.iystep) !== 'undefined' ? metaStageInfo.iystep : 0;
        let grndW = typeof(metaStageInfo.grndW) !== 'undefined' ? metaStageInfo.grndW : 200;
        let grndH = typeof(metaStageInfo.grndH) !== 'undefined' ? metaStageInfo.grndH : 200;
        let scale = typeof(metaStageInfo.scale) !== 'undefined' ? metaStageInfo.scale : 1;
        let scaleY = typeof(metaStageInfo.scaleY) !== 'undefined' ? metaStageInfo.scaleY : 1;
        let adjx = typeof(metaStageInfo.adjx) !== 'undefined' ? metaStageInfo.adjx : 0;
        let adjy = typeof(metaStageInfo.adjy) !== 'undefined' ? metaStageInfo.adjy : 0;
        let adjz = typeof(metaStageInfo.adjz) !== 'undefined' ? metaStageInfo.adjz : 0;
        let tubeRadius = typeof(metaStageInfo.tubeRadius) !== 'undefined' ? metaStageInfo.tubeRadius : 3;
        let tubeCAP = typeof(metaStageInfo.tubeCAP) !== 'undefined' ? metaStageInfo.tubeCAP : BABYLON.Mesh.CAP_ALL;
        let nz = typeof(metaStageInfo.nz) !== 'undefined' ? metaStageInfo.nz : 0;
        let pQdiv = typeof(metaStageInfo.pQdiv) !== 'undefined' ? metaStageInfo.pQdiv : 0;
        let pQlist = typeof(metaStageInfo.pQlist) !== 'undefined' ? metaStageInfo.pQlist : [];
        let pQdbg = typeof(metaStageInfo.pQdbg) !== 'undefined' ? metaStageInfo.pQdbg : 0;
        let cnsCS = typeof(metaStageInfo.cnsCS) !== 'undefined' ? metaStageInfo.cnsCS : 0.1;
        let cnsWalkableHeight = typeof(metaStageInfo.cnsWalkableHeight) !== 'undefined' ? metaStageInfo.cnsWalkableHeight : 2;
        let cnsWalkableClimb = typeof(metaStageInfo.cnsWalkableClimb) !== 'undefined' ? metaStageInfo.cnsWalkableClimb : 2;
        let cnsRadius = typeof(metaStageInfo.cnsRadius) !== 'undefined' ? metaStageInfo.cnsRadius : 0.8;
        let cnsReachRadius = typeof(metaStageInfo.cnsReachRadius) !== 'undefined' ? metaStageInfo.cnsReachRadius : 5;
        let cnsNAgent = typeof(metaStageInfo.cnsNAgent) !== 'undefined' ? metaStageInfo.cnsNAgent : 10;
        let cnsAccelX = typeof(metaStageInfo.cnsAccelX) !== 'undefined' ? metaStageInfo.cnsAccelX : 1;
        let cnsSpeedX = typeof(metaStageInfo.cnsSpeedX) !== 'undefined' ? metaStageInfo.cnsSpeedX : 1;
        let cnsCollisionQueryRange = typeof(metaStageInfo.cnsCollisionQueryRange) !== 'undefined' ? metaStageInfo.cnsCollisionQueryRange : 0.5;
        let cnsSeparationWeight = typeof(metaStageInfo.cnsSeparationWeight) !== 'undefined' ? metaStageInfo.cnsSeparationWeight : 3;
        let bubbleEnable = typeof(metaStageInfo.bubbleEnable) !== 'undefined' ? metaStageInfo.bubbleEnable : false;
        let soloEnable = typeof(metaStageInfo.soloEnable) !== 'undefined' ? metaStageInfo.soloEnable : false;
        let mZRot = typeof(metaStageInfo.mZRot) !== 'undefined' ? metaStageInfo.mZRot : {};
        let xzLbl = typeof(metaStageInfo.xzLbl) !== 'undefined' ? metaStageInfo.xzLbl : {};

        // コースレコード(３位まで)
        courseRecordlist = typeof(metaStageInfo.courseRec) !== 'undefined' ? metaStageInfo.courseRec : [997, 998, 999];
        // ベストレコードのラップレコード
        bestLap = typeof(metaStageInfo.bestLap) !== 'undefined' ? metaStageInfo.bestLap : [null, null, null, null];

        console.log("courseRecordlist=", courseRecordlist);

        let plist = [];


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
        }

        {
            let plist2 = []
            if(useSpline) {
                // 上記で取得した点列を、スプラインで補間
                const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
                plist2 = catmullRom.getPoints();
            } else {
                plist2 = plist;
            }

            // 目的地／中継地取得用の座標値列
            let plist3 = plist2;

            // 末尾１割を２次曲線で上昇させる
            {
                const upR = 0.001;
                let n = plist3.length;
                let n09 = Math.floor(n*0.9);
                let j = 0;
                for (let i = n09; i < n; ++i) {
                    let p = plist3[i];
                    p.y += j*j*upR;
                    ++j;
                }
            }



            pStart = plist3[pStartIdx].clone();
            pStart2 = plist3[pStartIdx+2].clone();
            pGoal = plist3[plist3.length-10].clone();
            let iCheckPointList = [pCPq0Idx, pCPq1Idx, pCPq2Idx, pCPq3Idx, pCPq4Idx];
            let _icount = 0, nplist = plist3.length;
            meshCPlist = [];
            for (let iCheckPoint of iCheckPointList) {
                ++_icount;
                let idx = iCheckPoint;
                if (iCheckPoint < 0) {
                    idx = nplist + iCheckPoint;
                } else if (iCheckPoint < 1) {
                    idx = Math.floor(nplist*iCheckPoint);
                }
                let pIdx = plist3[idx];

                const meshCPSize = tubeRadius*3;
                let meshCP = BABYLON.MeshBuilder.CreateSphere("cp", { diameter: meshCPSize}, scene);
                meshCP.position.copyFrom(pIdx);
                meshCP.position.y += tubeRadius+0.1;

                if (_icount == 1) {
                    meshCP.material = new BABYLON.StandardMaterial("mat");
                    meshCP.material.diffuseColor = BABYLON.Color3.Green();
                    meshCP.material.alpha = 0.2;
                } else if (_icount < iCheckPointList.length) {
                    meshCP.material = new BABYLON.StandardMaterial("mat");
                    meshCP.material.diffuseColor = BABYLON.Color3.White();
                    meshCP.material.alpha = 0;
                } else {
                    meshCP.material = new BABYLON.StandardMaterial("mat");
                    meshCP.material.diffuseTexture = new BABYLON.Texture(goalPath, scene);
	            meshCP.material.diffuseTexture.uScale = 4;
	            meshCP.material.diffuseTexture.vScale = 2;
                    meshCP.material.alpha = 0.5;
                }
                meshCPlist.push(meshCP);
                meshAggInfo.push([meshCP,null]);
            }

            // エージェントの目的地
            let pQ = [];  // 単一ライン
            {
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
                    {
                        j = Math.floor(i / nbPoints);
// console.log("  ", j);
                        if (j in xzLbl) {
                            let setTextMesh = function(mesh,text) {
                                let dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", {width:80, height:60}, scene);
                                let font = "16px Arial";
                                // let dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", {width:120, height:80}, scene);
                                // let font = "24px Arial";
                                dynamicTexture.hasAlpha = true;
                                dynamicTexture.drawText(text, null, null, font, "white", "transparent");
                                let mat = new BABYLON.StandardMaterial("mat", scene);
                                mat.diffuseTexture = dynamicTexture;
                                mesh.material = mat;
                            }

                            // let meshLbl = BABYLON.MeshBuilder.CreatePlane("mLbl"+j, {size:4, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                            let meshLbl = BABYLON.MeshBuilder.CreatePlane("mLbl"+j, {size:12, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                            meshLbl.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;   
                            meshLbl.position.y += 0.5;
                            meshLbl.parent = mesh;
                            let lbltext = xzLbl[j];
                            setTextMesh(meshLbl, lbltext)
                        }
                    }
                    meshAggInfo.push([mesh,null]);
                }
            }

console.log("stageType=",stageType);
            if (stageType=='tube') {
                // チューブで表示
                let mesh = BABYLON.MeshBuilder.CreateTube("tube", {path:plist2, radius:tubeRadius, cap:tubeCAP}, scene);
                mesh.position.y += tubeRadius+0.1; // tube
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes.push(mesh);
            }

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

                console.log("mZRot.length=", Object.keys(mZRot).length);
                if (Object.keys(mZRot).length > 0) {
                    const myRotation = (index, distance) => {
// console.log("myRotation(", [index, Math.floor(distance*100)/100, (index in xzRRot)]);
                        if (index in mZRot) {
		            return mZRot[index];
                        }
		        return 0;
	            };
                    {
                        options.updatable = true;
                        options.rotationFunction = myRotation;
                    }
console.log("ExtrudeShapeCustom() call");
                    mesh = BABYLON.MeshBuilder.ExtrudeShapeCustom("extrude", options, scene);
console.log("ExtrudeShapeCustom() end");
                } else {
                    mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                }
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes.push(mesh);
            }
        }

        // ------------------------------------------------------------
        // ------------------------------------------------------------
        let skybox = null;
        if (bskybox) {
            // Skybox
            let skyboxTextPath;
            if (skyboxType < 0) {
                let i = Math.floor(skyboxTextPathList.length*Math.random());
                skyboxTextPath = skyboxTextPathList[i];
            } else {
                skyboxTextPath = skyboxTextPathList[skyboxType];
            }

            skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:4000.0}, scene);
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
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


        if (imymesh == 0) {
            myMesh.position = pStart.clone();
            myMesh.position.y += 2;
            let p1 = pStart.clone();
            let p3 = pStart2.clone();
            p3.subtractInPlace(p1);
            let vrot = Math.atan2(p3.x, p3.z);
            myMesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
            myMesh.rotate(BABYLON.Vector3.Up(), vrot);

        } else {

            myMesh.position = pStart.clone();
            myMesh.position.y += 2;
            let p1 = pStart.clone();
            let p3 = pStart2.clone();
            p3.subtractInPlace(p1);
            let vrot = Math.atan2(p3.x, p3.z);
            myMesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
            myMesh.rotate(BABYLON.Vector3.Up(), vrot);
            myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
        }

        imeshCP = 0;
        curTimeCPlist = [null, null, null, null, null];
    }
    // resetMyPosi();





    // ----------------------------------------

    // 0: 方向を強制で変更  ..  066 カーレース の挙動
    // 1: 方向を力(applyAngularImpulse)で変更

    // let imymesh = 0, nmymesh = 7;  // 立体


    let wheelMeshes=[]
    let createMyMesh = function() {
        if (wheelMeshes.length>0) {
            for (let m of wheelMeshes) {
                m.dispose()
            }
            wheelMeshes=[];
            delete  myMesh._vehicle;
            myMesh._vehicle = null;
        }

        if (myMesh!=null) { myMesh.dispose() }


        if (imymesh == 0) {
            // 自機（立方体） メッシュのみ（物理は無し
            // myMesh = BABYLON.MeshBuilder.CreateBox("target", { size: 2 }, scene);
            myMesh = BABYLON.MeshBuilder.CreateBox("target", { width:0.5, height:0.2, depth:0.8 }, scene);
            myMesh.material = new BABYLON.StandardMaterial("mat", scene);
            myMesh.material.emissiveColor = BABYLON.Color3.Blue();
            myMesh.material.alpha=.5;
        }

        var addCharPanel = function(charPath, myMesh, adjy=1.1, clipy=0.0) {
            let mx = 3, my = 4;
	    let matFB = new BABYLON.StandardMaterial("");
	    matFB.diffuseTexture = new BABYLON.Texture(charPath);
	    matFB.diffuseTexture.hasAlpha = true;
	    matFB.emissiveColor = new BABYLON.Color3.White();
            //let clipy=0.01;
	    let uvF = new BABYLON.Vector4(0, 0/my+clipy, 1/mx, 1/my); // B
            let uvB = new BABYLON.Vector4(0, 3/my+clipy, 1/mx, 4/my); // F
            let planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            planeFB.position.y = adjy;
            planeFB.material = matFB;
            // planeFB.material.top = 5;
            planeFB.parent = myMesh;
            myMesh._planeFB = planeFB;
            // myMesh._txtFB = matFB.diffuseTexture;
	    let matLR = new BABYLON.StandardMaterial("");
	    matLR.diffuseTexture = new BABYLON.Texture(charPath);
	    matLR.diffuseTexture.hasAlpha = true;
	    matLR.emissiveColor = new BABYLON.Color3.White();
	    let uvL = new BABYLON.Vector4(0, 2/my, 1/mx, 3/my); // L
            let uvR = new BABYLON.Vector4(1/mx, 1/my, 0, 2/my); // R
            let planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvR, backUVs: uvL, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            planeLR.position.y = adjy;
            planeLR.material = matLR;
            // planeLR.material.top = 5;
            planeLR.rotation = new BABYLON.Vector3(0, R90, 0);
            planeLR.parent = myMesh;
            myMesh._planeLR = planeLR;
            // myMesh._txtLR = matLR.diffuseTexture;
        }



        if (imymesh == 3) {
            // RaycastVehicle
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            const chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.emissiveColor = BABYLON.Color3.Blue();
            chassisMesh.material.alpha=0.7;
            chassisMesh.position.y = 5
            chassisMesh.position.x = 0
            chassisMesh.rotationQuaternion = new BABYLON.Quaternion()
            const chassisPhysicsShape = new BABYLON.PhysicsShapeConvexHull(chassisMesh, scene);
            const chassisPhysicsBody = new BABYLON.PhysicsBody(chassisMesh, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
            chassisPhysicsBody.shape = chassisPhysicsShape
            chassisPhysicsBody.setMassProperties({
                centerOfMass: new BABYLON.Vector3(0, -0.5, 0)
            })
            chassisPhysicsShape.filterMembershipMask = 2
            // position で移動させるために
            chassisPhysicsBody.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            chassisPhysicsBody.disablePreStep = false;
            // --------------------
            // 車のモデル（RaycastVehicle
            const vehicle = new Vehicle2.RaycastVehicle(chassisPhysicsBody, scene)
            vehicle.numberOfFramesToPredict = 60 //Number of frames to predict future upwards orientation if airborne
            vehicle.predictionRatio = 0; //[0-1]How quickly to correct angular velocity towards future orientation. 0 = disabled
            // --------------------
            // ホイールのメッシュ
            const wheelMesh = BABYLON.MeshBuilder.CreateCylinder("WheelMesh", {height:0.3, diameter:0.4})
            wheelMesh.material = new BABYLON.StandardMaterial("");
            wheelMesh.material.diffuseColor = BABYLON.Color3.Gray();
            wheelMesh.material.wireframe=1;
            wheelMeshes = [wheelMesh, wheelMesh.createInstance(1), wheelMesh.createInstance(2), wheelMesh.createInstance(3)]
            wheelMeshes.forEach(mesh => {
                mesh.rotationQuaternion = new BABYLON.Quaternion()
            })
            vehicle._wheelMeshes = wheelMeshes;
            // ホイール・サスペンションのパラメータ
            const wheelConfig = {
                positionLocal:new BABYLON.Vector3(0.49, 0, -0.7),//Local connection point on the chassis
                suspensionRestLength:0.6,                //Rest length when suspension is fully decompressed
                suspensionForce:15000,                   //Max force to apply to the suspension/spring 
                suspensionDamping:0.15,                  //[0-1] Damper force in percentage of suspensionForce
                suspensionAxisLocal:new BABYLON.Vector3(0,-1,0), //Direction of the spring
                axleAxisLocal:new BABYLON.Vector3(1,0,0),        //Axis the wheel spins around
                forwardAxisLocal:new BABYLON.Vector3(0,0,1),     //Forward direction of the wheel
                sideForcePositionRatio:0.1,              //[0-1]0 = wheel position, 1 = connection point 
                // sideForce:40,                            //Force applied to counter wheel drifting
                // sideForce:2, //heavy drift
                // sideForce:4, //drift
                sideForce:6, // ski な感じ
                // sideForce:10, // power-drift & parallel turn
                radius:0.2,
                rotationMultiplier:0.1                   //How fast to spin the wheel
                // brakeForce:100
            }
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Right rear
            wheelConfig.positionLocal.set(-0.49, 0, -0.7)//Left rear
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))
            wheelConfig.positionLocal.set(-0.49, 0, 0.8)
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Left front
            wheelConfig.positionLocal.set(0.49, 0, 0.8)
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Right front
            // Attempt at some anti rolling
            vehicle.addAntiRollAxle({wheelA:0, wheelB:1, force:10000}) // right rear - left rear
            vehicle.addAntiRollAxle({wheelA:2, wheelB:3, force:10000}) // left front - right rear
            myMesh = chassisMesh;
            myMesh._vehicle = vehicle;
            // imymesh=13用パラメータ
            vehicle._maxVehicleForce = 2200
            vehicle._maxSteerValue = 0.2; // 0.6 
            vehicle._steeringIncrement = 0.005
            vehicle._steerRecover = 0.05
            // vehicle._forwardForce = 0
            vehicle._steerValue = 0
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
            // vehicle._steerDirection = 0
        }

        if (imymesh == 4) {
            // RaycastVehicle 荷重移動がわかりやすいように、やわらかめダンバー
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            const chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.emissiveColor = BABYLON.Color3.Red();
            chassisMesh.material.alpha=0.7;
            chassisMesh.position.y = 5
            chassisMesh.position.x = 0
            chassisMesh.rotationQuaternion = new BABYLON.Quaternion()
            const chassisPhysicsShape = new BABYLON.PhysicsShapeConvexHull(chassisMesh, scene);
            const chassisPhysicsBody = new BABYLON.PhysicsBody(chassisMesh, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
            chassisPhysicsBody.shape = chassisPhysicsShape
            chassisPhysicsBody.setMassProperties({
                centerOfMass: new BABYLON.Vector3(0, -0.5, 0)
            })
            chassisPhysicsShape.filterMembershipMask = 2
            // position で移動させるために
            chassisPhysicsBody.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            chassisPhysicsBody.disablePreStep = false;
            // --------------------
            // 車のモデル（RaycastVehicle
            const vehicle = new Vehicle2.RaycastVehicle(chassisPhysicsBody, scene)
            vehicle.numberOfFramesToPredict = 60 //Number of frames to predict future upwards orientation if airborne
            vehicle.predictionRatio = 0; //[0-1]How quickly to correct angular velocity towards future orientation. 0 = disabled
            // --------------------
            // ホイールのメッシュ
            const wheelMesh = BABYLON.MeshBuilder.CreateCylinder("WheelMesh", {height:0.3, diameter:0.4})
            wheelMesh.material = new BABYLON.StandardMaterial("");
            wheelMesh.material.diffuseColor = BABYLON.Color3.Gray();
            wheelMesh.material.wireframe=1;
            wheelMeshes = [wheelMesh, wheelMesh.createInstance(1), wheelMesh.createInstance(2), wheelMesh.createInstance(3)]
            wheelMeshes.forEach(mesh => {
                mesh.rotationQuaternion = new BABYLON.Quaternion()
            })
            vehicle._wheelMeshes = wheelMeshes;
            // ホイール・サスペンションのパラメータ
            // let wpx = 0.49+0.1, wpz = 0.7;
            let wpx = 0.49, wpz = 0.7;
            const wheelConfig = {
                positionLocal:new BABYLON.Vector3(wpx, 0, -wpz),//Local connection point on the chassis
                suspensionRestLength:0.6,                //Rest length when suspension is fully decompressed
                suspensionForce:15000,                   //Max force to apply to the suspension/spring 
                suspensionDamping:0.15, // 0.14,                 //[0-1] Damper force in percentage of suspensionForce
                suspensionAxisLocal:new BABYLON.Vector3(0,-1,0), //Direction of the spring
                axleAxisLocal:new BABYLON.Vector3(1,0,0),        //Axis the wheel spins around
                forwardAxisLocal:new BABYLON.Vector3(0,0,1),     //Forward direction of the wheel
                sideForcePositionRatio:0.1,              //[0-1]0 = wheel position, 1 = connection point 
                // sideForce:40,                            //Force applied to counter wheel drifting
                // sideForce:6, // ski な感じ
                sideForce:20,
                radius:0.2,
                rotationMultiplier:0.1,                   //How fast to spin the wheel
                // brakeForce:200,  // def:500
            }
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Right rear
            wheelConfig.positionLocal.set(-wpx, 0, -wpz)//Left rear
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))
            wheelConfig.positionLocal.set(-wpx, 0, wpz)
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Left front
            wheelConfig.positionLocal.set(wpx, 0, wpz)
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Right front
            // Attempt at some anti rolling
            vehicle.addAntiRollAxle({wheelA:0, wheelB:1, force:10000}) // right rear - left rear
            vehicle.addAntiRollAxle({wheelA:2, wheelB:3, force:10000}) // left front - right rear
            myMesh = chassisMesh;
            myMesh._vehicle = vehicle;
            vehicle._maxVehicleForce = 2200
            vehicle._maxSteerValue = 0.2; // 0.6 
            vehicle._steeringIncrement = 0.005
            vehicle._steerRecover = 0.05
            vehicle._steerValue = 0
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
        }

        if (imymesh == 5) {
            // RaycastVehicle  楕円ボディ
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            // const chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            // const chassisMesh = BABYLON.MeshBuilder.CreateSphere("Chassis", { diameterX: 1.0, diameterY: 0.5, diameterZ: 2.0, segments: 8 }, scene);
            const chassisMesh = BABYLON.MeshBuilder.CreateSphere("Chassis", { diameterX: 1.0, diameterY: 0.5, diameterZ: 1.0, segments: 8 }, scene);
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            // chassisMesh.material.emissiveColor = BABYLON.Color3.Green();
            // chassisMesh.material.emissiveColor = BABYLON.Color3.Purple();
            chassisMesh.material.emissiveColor = BABYLON.Color3.Yellow();
            chassisMesh.material.alpha=0.7;
            chassisMesh.position.y = 5
            chassisMesh.position.x = 0
            chassisMesh.rotationQuaternion = new BABYLON.Quaternion()
            const chassisPhysicsShape = new BABYLON.PhysicsShapeConvexHull(chassisMesh, scene);
            const chassisPhysicsBody = new BABYLON.PhysicsBody(chassisMesh, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
            chassisPhysicsBody.shape = chassisPhysicsShape
            chassisPhysicsBody.setMassProperties({
                centerOfMass: new BABYLON.Vector3(0, -0.5, 0),
                mass: 1000,
            })
            chassisPhysicsShape.filterMembershipMask = 2
            // position で移動させるために
            chassisPhysicsBody.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            chassisPhysicsBody.disablePreStep = false;
            // --------------------
            // 車のモデル（RaycastVehicle
            const vehicle = new Vehicle2.RaycastVehicle(chassisPhysicsBody, scene)
            vehicle.numberOfFramesToPredict = 60 //Number of frames to predict future upwards orientation if airborne
            vehicle.predictionRatio = 0; //[0-1]How quickly to correct angular velocity towards future orientation. 0 = disabled
            // --------------------
            // ホイールのメッシュ
            const wheelMesh = BABYLON.MeshBuilder.CreateCylinder("WheelMesh", {height:0.3, diameter:0.4})
            wheelMesh.material = new BABYLON.StandardMaterial("");
            wheelMesh.material.diffuseColor = BABYLON.Color3.Gray();
            wheelMesh.material.wireframe=1;
            wheelMeshes = [wheelMesh, wheelMesh.createInstance(1), wheelMesh.createInstance(2), wheelMesh.createInstance(3)]
            wheelMeshes.forEach(mesh => {
                mesh.rotationQuaternion = new BABYLON.Quaternion()
            })
            vehicle._wheelMeshes = wheelMeshes;
            // ホイール・サスペンションのパラメータ
            const wheelConfig = {
                positionLocal:new BABYLON.Vector3(0.49, 0, -0.7),//Local connection point on the chassis
                suspensionRestLength:0.6,                //Rest length when suspension is fully decompressed
                suspensionForce:15000,                   //Max force to apply to the suspension/spring 
                suspensionDamping:0.15,                  //[0-1] Damper force in percentage of suspensionForce
                suspensionAxisLocal:new BABYLON.Vector3(0,-1,0), //Direction of the spring
                axleAxisLocal:new BABYLON.Vector3(1,0,0),        //Axis the wheel spins around
                forwardAxisLocal:new BABYLON.Vector3(0,0,1),     //Forward direction of the wheel
                sideForcePositionRatio:0.1,              //[0-1]0 = wheel position, 1 = connection point 
                // sideForce:40,                            //Force applied to counter wheel drifting
                // sideForce:2, //heavy drift
                // sideForce:4, //drift
                sideForce:6, // ski な感じ
                // sideForce:10, // power-drift & parallel turn
                radius:0.2,
                rotationMultiplier:0.1                   //How fast to spin the wheel
                // brakeForce:100
            }
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Right rear
            wheelConfig.positionLocal.set(-0.49, 0, -0.7)//Left rear
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))
            wheelConfig.positionLocal.set(-0.49, 0, 0.8)
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Left front
            wheelConfig.positionLocal.set(0.49, 0, 0.8)
            vehicle.addWheel(new Vehicle2.RaycastWheel(wheelConfig))//Right front
            // Attempt at some anti rolling
            vehicle.addAntiRollAxle({wheelA:0, wheelB:1, force:10000}) // right rear - left rear
            vehicle.addAntiRollAxle({wheelA:2, wheelB:3, force:10000}) // left front - right rear
            myMesh = chassisMesh;
            myMesh._vehicle = vehicle;
            // imymesh=13用パラメータ
            vehicle._maxVehicleForce = 2200
            vehicle._maxSteerValue = 0.2; // 0.6 
            vehicle._steeringIncrement = 0.005
            vehicle._steerRecover = 0.05
            // vehicle._forwardForce = 0
            vehicle._steerValue = 0
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
            // vehicle._steerDirection = 0
        }


        if (imymesh == 21) {
            // Player/楕円形
            // myMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: 1.0, diameterY: 0.5, diameterZ: 4.0, segments: 8 }, scene);
            myMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: 1.0, diameterY: 0.5, diameterZ: 2.5, segments: 8 }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, friction: 0.08, restitution:0.05}, scene);
            let linearDampingBase = 0.0; // 0.03;  // スピードが乗りすぎるときはこちらで調整
            myMesh.physicsBody.setLinearDamping(linearDampingBase);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
	    let mat = new BABYLON.GradientMaterial("grad", scene);
            mat.topColor = new BABYLON.Color3(1, 1, 1);
            mat.bottomColor = new BABYLON.Color3(1, 0.6, 0.6);
            mat.smoothness = -0.1;
            myMesh.material = mat;
            myMesh._agg = myAgg;
            myMesh._linearDampingBase = 0; // ブレーキ時off
            myMesh._linearDampingBrake = 2; // ブレーキ時
            myMesh._brake_off_1st = false;
            addCharPanel(myTextPath3, myMesh, 1.1, 0.01);
            myMesh._planeFB.material.alpha=0.1; // わざと透明に
        }

        if (imymesh == 22) {
            // ボード そりの挙動（横滑りを抑制／逆向きに力）
            // myMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: 1.0, diameterY: 0.5, diameterZ: 4.0, segments: 8 }, scene);
            myMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: 1.0, diameterY: 0.5, diameterZ: 2.5, segments: 8 }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, friction: 0.08, restitution:0.05}, scene);
            let linearDampingBase = 0.0; // 0.03;  // スピードが乗りすぎるときはこちらで調整
            myMesh.physicsBody.setLinearDamping(linearDampingBase);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
	    let mat = new BABYLON.GradientMaterial("grad", scene);
            mat.topColor = new BABYLON.Color3(1, 1, 1);
            mat.bottomColor = new BABYLON.Color3(0.6, 0.6, 1);
            mat.smoothness = -0.5;
            myMesh.material = mat;
            myMesh._agg = myAgg;
            myMesh._linearDampingBase = 0; // ブレーキ時off
            myMesh._linearDampingBrake = 2; // ブレーキ時
            myMesh._brake_off_1st = false;
            myAgg.body.setLinearDamping(myMesh._linearDampingBase); // def: 0
            // myAgg.body.setAngularDamping(0.5); // def: 0.1
            // myAgg.body.setAngularDamping(5); // def: 0.1
            myAgg.body.setAngularDamping(20); // def: 0.1
            // myAgg.body.setAngularDamping(100); // def: 0.1

            // addCharPanel(myTextPath3, myMesh, 1.1, 0.01);
            // myMesh._planeFB.material.alpha=0.1; // わざと透明に
            let head = BABYLON.MeshBuilder.CreateSphere("", { diameter: 0.4, segments: 8 }, scene);
            head.position.y = 0.2;
            head.position.z = -0.4;
            head.parent = myMesh;
            let head2 = BABYLON.MeshBuilder.CreateSphere("", { diameter: 0.4, segments: 8 }, scene);
            head2.position.y = 0.2;
            head2.position.z = -0.8;
            head2.parent = myMesh;

        }

        if (imymesh == 31) {
            // フロート(3) 浮遊体)  斜めな地面に対応
            // myMesh = BABYLON.MeshBuilder.CreateBox("target", { width:1, height:0.5, depth:2 }, scene);
            // myMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: 1.0, diameterY: 0.5, diameterZ: 2.0, segments: 8 }, scene); // 093_board
            let mw=1, mh=0.5, md=2;
            myMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: mw, diameterY: mh, diameterZ: md, segments: 8 }, scene);
            myMesh.material = new BABYLON.StandardMaterial("mat", scene);
            myMesh.material.emissiveColor = BABYLON.Color3.Blue();
            myMesh.material.alpha=.5;
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh._agg=myAgg;
            // myMesh._height =0.26; // ray の開始位置
            myMesh._acc =0;
            myMesh._dampLmax = 100000;
            myMesh.physicsBody.disablePreStep = false;
            myMesh.physicsBody.setGravityFactor(0.0);   // 重力の効果
            myAgg.body.setLinearDamping(0.6); // def:0
            myAgg.body.setAngularDamping(100.0); // def: 0.1  ..逆回転の力を抑え込むための摩擦
            addCharPanel(myTextPath3, myMesh, 1.1, 0.01);
            myMesh._planeFB.material.alpha=0.1; // わざと透明に
            // レイキャスト用の座標（前後左右を起点とする
            myMesh._mw_ = mw/2;
            myMesh._mh_ = mh/2;
            myMesh._md_ = md/2;
            myMesh.position.y += 1;
        }


        if (typeof(myMesh._vehicle) === 'undefined') {
            myMesh._vehicle = null;
        }

        return myMesh
    }



    let updateMyMesh = function() {
        let forwardForce, steerDirection, roll, updownForce;

        if (imymesh == 0) {
            // 自機（立方体）
            // 力で推進させる、力で回転させる
            forwardForce = 0;
            steerDirection = 0;
            updownForce = 0;
            if(keyAction.forward) forwardForce = 1
            if(keyAction.backward) forwardForce = -1
            if(keyAction.left) steerDirection = -1
            if(keyAction.right) steerDirection = 1
            if(keyAction.up) updownForce = 1
            if(keyAction.down) updownForce = -1
            let vquick = (keyAction.quick) ? 3 : 1;
            let quat = myMesh.rotationQuaternion;
            if (forwardForce != 0) {
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                const vScale = 1.0; // 1.0;
                vdir = vdir.scale(forwardForce*vScale*vquick);
                myMesh.position.addInPlace(vdir);
            }
            if (updownForce != 0) {
                let vdir = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                const vScale = 0.5; // 1.0;
                vdir = vdir.scale(updownForce*vScale*vquick);
                myMesh.position.addInPlace(vdir);
            }
            if (steerDirection != 0) {
                let qRot = BABYLON.Quaternion.FromEulerAngles(0, 0.02*steerDirection, 0);
                myMesh.rotationQuaternion = qRot.multiply(quat);
            }

            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }

        } else if ((imymesh >= 3) && (imymesh <= 5)) {
            // RaycastVehicle

            let forwardForce = 0;
            if(keyAction.forward) forwardForce = 1
            if(keyAction.backward) forwardForce = -1
            let steerDirection = 0;
            if(keyAction.left) steerDirection = -1
            if(keyAction.right) steerDirection = 1
            let vquick = (keyAction.quick) ? 3 : 1;
            let vbrake = (keyAction.brake) ? 1 : 0;
            let vehicle = myMesh._vehicle;
            vehicle._steerValue = steerDirection*vehicle._maxSteerValue*vquick;
            vehicle.wheels[2].steering = vehicle._steerValue
            vehicle.wheels[3].steering = vehicle._steerValue
            if (vehicle._driveSystem == 1) {
                // FF
                vehicle.wheels[2].force = forwardForce*vehicle._maxVehicleForce
                vehicle.wheels[3].force = forwardForce*vehicle._maxVehicleForce
            } else if (vehicle._driveSystem == 2) {
                // FR
                vehicle.wheels[0].force = forwardForce*vehicle._maxVehicleForce
                vehicle.wheels[1].force = forwardForce*vehicle._maxVehicleForce
            } else {
                 // 4WD
                vehicle.wheels[0].force = forwardForce*vehicle._maxVehicleForce
                vehicle.wheels[1].force = forwardForce*vehicle._maxVehicleForce
                vehicle.wheels[2].force = forwardForce*vehicle._maxVehicleForce
                vehicle.wheels[3].force = forwardForce*vehicle._maxVehicleForce
            }
            vehicle.wheels[0].brake = vbrake;
            vehicle.wheels[1].brake = vbrake;
            vehicle.wheels[2].brake = vbrake;
            vehicle.wheels[3].brake = vbrake;
            vehicle.update()
            let wheelMeshes = vehicle._wheelMeshes;
            vehicle.wheels.forEach((wheel, index) => {
                if(!wheelMeshes[index]) return
                const wheelMesh = wheelMeshes[index]
                wheelMesh.position.copyFrom(wheel.transform.position)
                wheelMesh.rotationQuaternion.copyFrom(wheel.transform.rotationQuaternion)
                wheelMesh.rotate(BABYLON.Axis.Z, Math.PI/2, BABYLON.Space.LOCAL)
            })
            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }


        } else if (imymesh == 21) {
            const vforce = 0.04;
            let vquick = (keyAction.quick) ? 3 : 1;
            if (cooltime_act==0 && keyAction.forward && keyAction.backward) {
                cooltime_act = cooltime_actIni;
                // 自機の前後の向きを１８０度回転させる
                const qYR180 = BABYLON.Quaternion.FromEulerAngles(0, R180, 0);
                myMesh.rotationQuaternion.multiplyInPlace(qYR180);
            } else if (keyAction.backward && keyAction.left) {
                // ロール（左／逆回転  .. 上下ひっくり返りはこちらで対応
                let vdir = new BABYLON.Vector3(0 ,0, vforce*2);
                vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
                myMesh.physicsBody.applyAngularImpulse(vdir);
            } else if (keyAction.backward && keyAction.right) {
                // ロール（右／順回転
                let vdir = new BABYLON.Vector3(0 ,0, -vforce*2);
                vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
                myMesh.physicsBody.applyAngularImpulse(vdir);
            } else if (keyAction.left) {
                // ヨー（右／順回転
                let vdir = new BABYLON.Vector3(0, -vforce*vquick, 0);
                vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
                myMesh.physicsBody.applyAngularImpulse(vdir);
            } else if (keyAction.right) {
                // ヨー（左／逆回転
                let vdir = new BABYLON.Vector3(0, vforce*vquick, 0);
                vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
                myMesh.physicsBody.applyAngularImpulse(vdir);
            }

            if (keyAction.forward || keyAction.backward) {
                const v = 0.1;
                let forwardForce = 0;
                if (keyAction.forward) forwardForce = v;
                if (keyAction.backward) forwardForce = -v;
                let vdir = new BABYLON.Vector3(0, 0, forwardForce);
                vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
                // myMesh.physicsBody.applyImpulse(vdir);
                myMesh._agg.body.applyImpulse(vdir, myMesh.absolutePosition);

            }
            if (keyAction.brake) {
                // ブレーキ on
                myMesh.physicsBody.setLinearDamping(myMesh._linearDampingBrake);
                myMesh._brake_off_1st = true;
            } else if (myMesh._brake_off_1st) {
                // ブレーキ off
                myMesh._brake_off_1st = false;
                myMesh.physicsBody.setLinearDamping(myMesh._linearDampingBase);
            }
            
        } else if (imymesh == 22) {
            // ボード(4) そりの挙動（横滑りを抑制／逆向きに力）
            const vforceRoll = 0.12;
            // const vforceYaw = 0.08; // angDmp=0.5
            // const vforceYaw = 0.10; // angDmp=5
            const vforceYaw = 0.3; // // angDmp=20
            // const vforceYaw = 0.8; // angDmp=100
            let vquick = (keyAction.quick) ? 3 : 1;
            if (cooltime_act==0 && keyAction.forward && keyAction.backward) {
                cooltime_act = cooltime_actIni;
                // 自機の前後の向きを１８０度回転させる
                const qYR180 = BABYLON.Quaternion.FromEulerAngles(0, R180, 0);
                myMesh.rotationQuaternion.multiplyInPlace(qYR180);
            } else if (keyAction.backward && keyAction.left) {
                // ロール（左／逆回転  .. 上下ひっくり返りはこちらで対応
                let vdir = new BABYLON.Vector3(0 ,0, vforceRoll);
                vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
                myMesh.physicsBody.applyAngularImpulse(vdir);
            } else if (keyAction.backward && keyAction.right) {
                // ロール（右／順回転
                let vdir = new BABYLON.Vector3(0 ,0, -vforceRoll);
                vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
                myMesh.physicsBody.applyAngularImpulse(vdir);
            } else if (keyAction.left) {
                // ヨー（右／順回転
                let vdir = new BABYLON.Vector3(0, -vforceYaw*vquick, 0);
                vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
                myMesh.physicsBody.applyAngularImpulse(vdir);
            } else if (keyAction.right) {
                // ヨー（左／逆回転
                let vdir = new BABYLON.Vector3(0, vforceYaw*vquick, 0);
                vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
                myMesh.physicsBody.applyAngularImpulse(vdir);
            }

            if (keyAction.forward || keyAction.backward) {
                const v = 0.1;
                let forwardForce = 0;
                if (keyAction.forward) forwardForce = v;
                if (keyAction.backward) forwardForce = -v;
                let vdir = new BABYLON.Vector3(0, 0, forwardForce);
                vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
                // myMesh.physicsBody.applyImpulse(vdir);
                myMesh._agg.body.applyImpulse(vdir, myMesh.absolutePosition);

            }
            if (keyAction.brake) {
                // ブレーキ on
                myMesh.physicsBody.setLinearDamping(myMesh._linearDampingBrake);
                myMesh._brake_off_1st = true;
            } else if (myMesh._brake_off_1st) {
                // ブレーキ off
                myMesh._brake_off_1st = false;
                myMesh.physicsBody.setLinearDamping(myMesh._linearDampingBase);
            }

            // mymesh=21との差分
            //前後方向のみに動きやすいよう、横方向には逆向きの力を加える
            // ..結果、横滑り（ドリフト）せずにグリップ走行になる
            {
                let vec = myMesh._agg.body.getLinearVelocity();
                // 右方向のベクトルを求める
                let quat = myMesh.rotationQuaternion;
                let vdirR = BABYLON.Vector3.Right().applyRotationQuaternion(quat);
                // 内積より寄与分をもとめる
                let v = vdirR.dot(vec);
                // 逆向きの力とする
                // let amp=-0.9; // アンダーステアっぽい
                let amp=-0.1;
                // let amp=-0.01; // ドリフトっぽい
                vdirR.scaleInPlace(v*amp);
                myMesh._agg.body.applyImpulse(vdirR, myMesh.absolutePosition);
            }

                
        } else if (imymesh == 31) {
            // フロート(3) 
            forwardForce = 0;
            if(keyAction.forward) forwardForce = 1
            if(keyAction.backward) forwardForce = -1
            steerDirection = 0;
            if(keyAction.left) steerDirection = -1
            if(keyAction.right) steerDirection = 1
            let vbrake = (keyAction.brake) ? 1 : 0;
            let vquick = (keyAction.quick) ? 3 : 1;
            if (forwardForce!=0) {
                if(Math.abs(myMesh._acc)<0.2) {
                    // 発進時
                    myMesh._acc = 0.8*forwardForce
                } else if(Math.abs(myMesh._acc)<1.5) {
                    // 加速時
                    myMesh._acc += 0.01*forwardForce*vquick
                }
            } else {
                // 減速させる
                if (myMesh._acc > 0) {
                    myMesh._acc -= 0.01;
                } else {
                    myMesh._acc += 0.1;
                }
                if (vbrake!=0) {
                    // ブレーキ時
                    myMesh._acc = 0;
                }
            }
            if (vbrake!=0) {
                // ブレーキ時
                myMesh._agg.body.setLinearDamping(myMesh._dampLmax*myMesh.vbrake);

            } else {
                myMesh._agg.body.setLinearDamping(myMesh._dampLdef);
                // const vrate = 0.5;
                const vrate = 0.5;
                let quat = myMesh.rotationQuaternion;
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                // vdir = vdir.scale(vrate*forwardForce*vquick);
                vdir = vdir.scale(vrate*myMesh._acc);
                myMesh._agg.body.applyImpulse(vdir, myMesh.absolutePosition);
            }
            //
            if (steerDirection!=0) {
                let vrate = 1; // 0.15;
                let quat = myMesh.rotationQuaternion;
                let vroty = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                vroty = vroty.scale(vrate*steerDirection*vquick);
                myMesh._agg.body.applyAngularImpulse(vroty);
            }
            //前後方向のみに動きやすいよう、横方向には逆向きの力を加える
            // ..結果、横滑り（ドリフト）せずにグリップ走行になる
            {
                let vec = myMesh._agg.body.getLinearVelocity();
                // 右方向のベクトルを求める
                let quat = myMesh.rotationQuaternion;
                let vdirR = BABYLON.Vector3.Right().applyRotationQuaternion(quat);
                // 内積より寄与分をもとめる
                let v = vdirR.dot(vec);
                // 逆向きの力とする
                // let amp=-0.9; // アンダーステアっぽい
                let amp=-0.1;
                // let amp=-0.01; // ドリフトっぽい
                vdirR.scaleInPlace(v*amp);
                myMesh._agg.body.applyImpulse(vdirR, myMesh.absolutePosition);
            }

            // レイキャスト操作
            {
                // let susLen = 2, susPower=10.0; // , susLen2 = 2.5;
                let susLen = 10, susPower=10.0; // , susLen2 = 2.5;

                // 開始位置
                let quat = myMesh.rotationQuaternion;
                let vd = BABYLON.Vector3.Forward().applyRotationQuaternion(quat).scale(myMesh._md_);
                let vw = BABYLON.Vector3.Right().applyRotationQuaternion(quat).scale(myMesh._mw_);
                let vdown = BABYLON.Vector3.Down().applyRotationQuaternion(quat).scale(susLen);
                let vg = BABYLON.Vector3.Down().applyRotationQuaternion(quat).scale(9.8);
                let pstartList = [
                    myMesh.position.add(vd), // 前
                    myMesh.position.subtract(vd),  //後
                    myMesh.position.add(vw), // 右
                    myMesh.position.subtract(vd), // 左
                ];
                const physEngine = scene.getPhysicsEngine();
                const raycastResult = new BABYLON.PhysicsRaycastResult();
                for (let pstart of pstartList) {
                    let pend = pstart.add(vdown)
                    physEngine.raycastToRef(pstart, pend, raycastResult)
                    if (!raycastResult.hasHit) {
                        // 離れすぎ
                        // 地面に張り付かせる力 の代わりに姿勢の下方向へ力
                        // myMesh._agg.body.applyForce(vg, myMesh.absolutePosition);
                        myMesh._agg.body.applyForce(vg, pstart);
                        continue;
                    }
                    // 接地している
                    // 縮みに応じた力を逆向きに、サスペンションとして
                    // let len  = susLen - raycastResult.hitDistance;
                    // const gRate = -9.8, compRate = len/susLen;
                    // myMesh._agg.body.applyForce(raycastResult.hitNormalWorld.scale(grav + susPower*compRate), pstart);

                    //    縮んだ距離 = サスペンションの長さ - 始点から交点位置 ＋ちょっと足して浮かせた感じに
                    // let compLen  = susLen - raycastResult.hitDistance + 0.2;
                    let compLen  = susLen - raycastResult.hitDistance -7.8;
                    const grav = -9.8;
                    myMesh._agg.body.applyForce(raycastResult.hitNormalWorld.scale(grav + susPower*compLen), pstart);

                    // 地面に垂直な方向(raycastResult.hitNormalWorld)に傾ける
                    // let quat = myMesh.rotationQuaternion;
                    let v1 = raycastResult.hitNormalWorld.normalize();
                    let v2 = BABYLON.Vector3.Up().applyRotationQuaternion(quat).normalize();
                    // let v3 = BABYLON.Vector3.Cross(v1, v2);
                    let v3 = BABYLON.Vector3.Cross(v2, v1).scale(0.1);
                    myMesh._agg.body.applyAngularImpulse(v3);

                }
            }


            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }



        } else {
console.log("under cunstrunction");
        }

        let speed = getSpeed();
        setText1(speed);
    }

    let resetPostureMyMesh = function() {
        if ((imymesh >= 3) && (imymesh <= 5)) {
            // RaycastVehicle
            let vehicle = myMesh._vehicle;
            vehicle.doResetPosture();

        } else if (imymesh == 31) {
            // フロート (3)
            let eular = myMesh.rotationQuaternion.toEulerAngles()
            let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
            myMesh.rotationQuaternion = quat;
            myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));

        } else {
            // 姿勢を正す
            /// クォータニオンからオイラー角を取得、方向（ヨー:z軸回転）だけを使い他は0として姿勢をリセットする
            // myMesh._agg.body.applyForce(new BABYLON.Vector3(0, 40, 0), myMesh.absolutePosition);
            myMesh.position.y += myMesh._height;
            myMesh._agg.body.applyImpulse(new BABYLON.Vector3(0, 40, 0), myMesh.absolutePosition);
            let eular = myMesh.rotationQuaternion.toEulerAngles()
            let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
            myMesh.rotationQuaternion = quat;
            // 回転を止める
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
        }
    }

    let getSpeed = function() {
        let speed = 0;
        if (imymesh == 0) {
        } else if ((imymesh >= 3) && (imymesh <= 5)) {
            speed = myMesh._vehicle.speed;
        } else {
            let vec = myMesh._agg.body.getLinearVelocity();
            speed = vec.length();
        }
        return speed;
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
    // let cooltime_act = 0, cooltime_actIni = 20, vforceBase = 0.04, vforce = 0.04, bDash=3, jumpforce = 120;
    let cooltime_act = 0, cooltime_actIni = 20, bDash=3, jumpforce = 120;

    let keyAction = {forward:0, back:0, right:0, left:0, LR:0, up:0, down:0, brake:0, quick:0, reset:0, resetCooltime:0};
    scene.registerAfterRender(function() {
        keyAction.quick=false;
        if (map["ctrl"]) {
            keyAction.quick=true;
        }
        if (map["ArrowUp"]) {
            keyAction.forward = true;
        } else {
            keyAction.forward = false;
        }
        if (map["ArrowDown"]) {
            keyAction.backward = true
        } else {
            keyAction.backward = false
        }
        if (map["w"]) {
            keyAction.up = true;
        } else {
            keyAction.up = false;
        }
        if (map["s"]) {
            keyAction.down = true
        } else {
            keyAction.down = false
        }
        keyAction.LR = false;
        keyAction.left = false;
        keyAction.right = false;
        if ((map["a"] || map["ArrowLeft"]) && (map["d"] || map["ArrowRight"])) {
            keyAction.LR = true; //roll処理用
        } else if (map["a"] || map["ArrowLeft"]) {
            keyAction.left = true;
        } else if (map["d"] || map["ArrowRight"]) {
            keyAction.right = true;
        }
        keyAction.brake = false;
        if (map[" "]) {
            keyAction.brake = true;
        }
        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["Enter"]) {
                cooltime_act = cooltime_actIni;
                keyAction.reset = true;
            }
            if (map["c"] || map["C"]) {
                cooltime_act = cooltime_actIni;
                if (map["C"] || map["shift"]) {
                    icamera=(icamera+ncamera-1)%ncamera;
                } else {
                    icamera=(icamera+1)%ncamera;
                }
                changeCamera(icamera);
            }
            if (map["n"] || map["N"] || map["p"] || map["P"] || map["b"] || map["B"]) {
                cooltime_act = cooltime_actIni;
                if ((map["N"] || map["p"] || map["b"]) || (map["shift"] && (map["n"]))) {
                    istage = (istage+nstage-1)%nstage;
                } else {
                    istage = (istage+1)%nstage;
                }
                createStage2(istage);
                resetMyPosi();
            }
            if (map["m"] || map["M"]) {
                cooltime_act = cooltime_actIni;
                if (map["M"] || map["shift"]) {
                    let i = mymeshList.indexOf(imymesh);
                    console.assert(i >= 0);
                    i = (i-1+mymeshList.length) % mymeshList.length;
                    imymesh=mymeshList[i];
                } else {
                    let i = mymeshList.indexOf(imymesh);
                    console.assert(i >= 0);
                    i = (i+1) % mymeshList.length;
                    imymesh=mymeshList[i];
                }
                createMyMesh();
                changeCamera(icamera);
                resetMyPosi();
            }
            if (map["r"]) { // 'r'
                cooltime_act = cooltime_actIni;
                resetMyPosi();
            }
            if ((myMesh._vehicle != null) && (map["d"] || map["D"])) {
                cooltime_act = cooltime_actIni;
                if (map["D"] || map["shift"]) {
                    myMesh._vehicle._driveSystem = (myMesh._vehicle._driveSystem+2)%3;
                } else {
                    myMesh._vehicle._driveSystem = (myMesh._vehicle._driveSystem+1)%3;
                }
                if (myMesh._vehicle._driveSystem == 1) {
                    console.log("FF")
                    setText2("FF");
                } else if (myMesh._vehicle._driveSystem == 2) {
                    console.log("FR")
                    setText2("FR");
                } else {
                    console.log("4WD")
                    setText2("4WD");
                }
            }
            if (map["h"]) {
                cooltime_act = cooltime_actIni;
                changeUsageView();
            }
        }
    });

    scene.onBeforeRenderObservable.add(()=>{
        updateMyMesh();
    })

    // チェックポイントの確認
    scene.registerAfterRender(function() {
        if (myMesh != null) {
            if (imeshCP > 4) {
                return;
            }
            // 自機とチェックポイントの交差チェック
            if (myMesh.intersectsMesh(meshCPlist[imeshCP], true)) {
                let ctnow = performance.now();
                curTimeCPlist[imeshCP] = ctnow;
                if (imeshCP > 0 && imeshCP < 4) {
                    if (bestLap[imeshCP] != null) {
                        // スタート地点からの区間ラップ
                        let lap = Math.floor(curTimeCPlist[imeshCP] - curTimeCPlist[0])/1000;
                        let lapdiff = Math.floor((lap - bestLap[imeshCP-1])*1000)/1000;
                        // console.log("lap ", lapdiff);
                        setText2("Lap time="+lap+"  "+lapdiff);
                    }
                }
                if (imeshCP == 4) {
                    let timeCur = Math.floor(curTimeCPlist[imeshCP] - curTimeCPlist[0])/1000;
                    console.log("GOAL!! time=", timeCur);

                    let bupdate = false;
                    if (courseRecordlist[0] > timeCur) {
                        bestLap = [Math.floor(curTimeCPlist[1] - curTimeCPlist[0])/1000,
                                   Math.floor(curTimeCPlist[2] - curTimeCPlist[0])/1000,
                                   Math.floor(curTimeCPlist[3] - curTimeCPlist[0])/1000,
                                   Math.floor(curTimeCPlist[4] - curTimeCPlist[0])/1000];
                        setText2("Cong!!! 1st prize! time="+timeCur);
                        setNextStage();
                        bupdate = true;
                    } else if (courseRecordlist[1] > timeCur) {
                        setText2("Great!! 2nd prize! time="+timeCur);
                        setNextStage();
                        bupdate = true;
                    } else if (courseRecordlist[2] > timeCur) {
                        setText2("Good!   3rd prize! time="+timeCur);
                        setNextStage();
                        bupdate = true;
                    } else {
                        setText2("GOAL!! time="+timeCur);
                        setRestart();
                    }

                    // console.log("courseRecordlist.1 = ", courseRecordlist);
                    courseRecordlist.push(timeCur);
                    // console.log("courseRecordlist.2 = ", courseRecordlist);
                    var funcSort = function (a, b) { return a-b }
                    courseRecordlist.sort(funcSort);
                    // console.log("courseRecordlist.3 = ", courseRecordlist);
                    courseRecordlist.pop();
                    // console.log("courseRecordlist.4 = ", courseRecordlist);

                    if (bupdate) {
                        console.log("new recored", courseRecordlist, bestLap);
                    }

                }
                ++imeshCP;
            }
        }
    });

    // ----------------------------------------
    // ゴール時の処理

    // ３位入賞時に次のステージに自動で変更
    let nextStage = function() {
        // istage = (istage+nstage-1)%nstage;
        istage = (istage+1)%nstage;
        createStage2(istage);
        resetMyPosi();
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
            setTimeout(resetMyPosi, 6000);
        }
    }


    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // 左上に使い方（操作方法）を表示
    let guiUsageRect = new BABYLON.GUI.Rectangle();
    {
        guiUsageRect.adaptWidthToChildren = true;
        guiUsageRect.width = "320px";
        guiUsageRect.height = "200px";
        guiUsageRect.cornerRadius = 5;
        guiUsageRect.color = "Orange";
        guiUsageRect.thickness = 4;
        guiUsageRect.background = "green";
        guiUsageRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        guiUsageRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(guiUsageRect);    
        let grid = new BABYLON.GUI.Grid();
        grid.width = 0.98;
        grid.height = 0.98;
        grid.addRowDefinition(1);
        grid.addRowDefinition(22, true);
        guiUsageRect.addControl(grid); 
        // グリッド内の要素の登録
        {
            let text1 = new BABYLON.GUI.TextBlock();
            text1.text = "Usage:\n"
                +"(Arrow UP/DOWN): Forward/Back\n"
                +"(Arrow Left/Right): Left/Right\n"
                +"(C) : Change Camera\n"
                +"(M) : Change Machine\n"
                +"(N,P) : Change Stage\n"
                +"H: show/hide this message";
            text1.color = "white";
            text1.width = "310px";
            text1.fontSize = 14;
            text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
            text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
            text1.paddingLeft = 12;
            grid.addControl(text1, 0, 0);
        }
        guiUsageRect.isVisible = false;
    }
    var changeUsageView = function() {
        if (guiUsageRect.isVisible) {
            guiUsageRect.isVisible = false;
        } else {
            guiUsageRect.isVisible = true;
        }
    }

    // ----------------------------------------
    // ステージ選択

    let guiCourseRect = new BABYLON.GUI.Rectangle(); 
    guiCourseRect._obj=[];

    {
        // キャラクター選択GUI作成
        guiCourseRect.width = "600px";
        guiCourseRect.height = "400px";
        guiCourseRect.cornerRadius = 20;
        guiCourseRect.color = "Orange";
        guiCourseRect.thickness = 4;
        guiCourseRect.background = "green";
        guiCourseRect.isVisible = false;
        advancedTexture.addControl(guiCourseRect);
        //

        let r2panelSV = new BABYLON.GUI.ScrollViewer("", false);
        r2panelSV.width = "600px";
        r2panelSV.height = "380px";
        guiCourseRect.addControl(r2panelSV);
        //
        let r2panel = new BABYLON.GUI.StackPanel();
        r2panel.width = "600px";
        r2panel.height= ""+courseInfoList.length*200+"px";  //"2000px";
        r2panelSV.addControl(r2panel);
        //
        BABYLON.GUI.Button.CreateMyCustomButton = function (name, text, imageUrl) {
            const result = new BABYLON.GUI.Button(name);
            // Adding text
            const textBlock = new BABYLON.GUI.TextBlock(name + "_button", text);
            textBlock.textWrapping = true;
            textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            textBlock.paddingLeft = "50%";
            result.addControl(textBlock);
            // Adding image
            const iconImage = new BABYLON.GUI.Image(name + "_icon", imageUrl);
            iconImage.width = "50%";
            iconImage.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            iconImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            result.addControl(iconImage);
            return result;
        };
        //
        for (let ii=0; ii<courseInfoList.length; ++ii) {
            let [tcode, ttype, label, fpath] = courseInfoList[ii]
            let button = BABYLON.GUI.Button.CreateMyCustomButton("n_"+label, label, fpath);
            button.width = "560px";
            button.height = "200px";
            button.color = "white";
            button.background = "black";
            button.onPointerUpObservable.add(function() {
                istage = ii;
                createStage2(istage);
                resetMyPosi();
                changeCourseView();
                // istage = ii;
                // createStage(istage);
                // changeCourseView();
            });
            r2panel.addControl(button);
            guiCourseRect._obj.push(button);
        }
    }
    var changeCourseView = function() {
        if (guiCourseRect.isVisible) {
            guiCourseRect.isVisible = false;
        } else {
            guiCourseRect.isVisible = true;
            for (let obj of guiCourseRect._obj) {
                obj.background = "black";
            }
            guiCourseRect._obj[istage].background = "darkgray";
        }
    }

    // 画面右上。コース選択ボタン
    var guiIconCourse = new BABYLON.GUI.Image("ctrl", iconPath3);
    {
        guiIconCourse.width = "60px";
        guiIconCourse.height = "60px";
//        guiIconCourse.top = "80px";
        guiIconCourse.autoScale = false
        guiIconCourse.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIconCourse.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        guiIconCourse.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        guiIconCourse.onPointerUpObservable.add(function() {
            changeCourseView();
        });
        advancedTexture.addControl(guiIconCourse);   
    }

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

    createStage2(istage);
    createMyMesh();

    changeCamera(icamera);
    resetMyPosi();



    return scene;
}


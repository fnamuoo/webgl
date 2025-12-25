// カートコース特集

// ## 操作方法
//  - 1                           .. キーボード入力に切り替え
//  - 2                           .. ゲームパッド入力に切り替え

// - キーボード入力
//   - カーソル上/(w)              .. 前進
//   - カーソル下/(s)              .. 後進
//   - カーソル右左/(a,d)          .. 旋回
//   - Ctrl+カーソル右左/(a,d)     .. 急旋回
//   - space                       .. ブレーキ
//   - enter                       .. ジャンプ（姿勢を正す）
//   - r                           .. スタート位置に戻す
//   - (c/C[=shift+c])             .. カメラ変更 (バードビュー／ドライバーズビュー)
//   - (v/V[=shift+c])             .. ワイプカメラ変更（無し／バードビュー／トップビュー）
//   - (n/N[=shift+n])             .. ステージ変更
//   - (m/M[=shift+m])             .. プレイヤー変更（ドリフト仕様／グリップ仕様）
//   - h                           .. 使い方表示 ON/OFF
//   - (画面右上クリック)          .. ステージ選択GUI表示 ON/OFF

// - ゲームパッド入力
//   - 十字キー左右／左スティック   .. 旋回
//   - 十字キー左右／左スティック+B .. 急旋回
//   - 右スティック上／A            .. 前進
//   - 右スティック下／X            .. ブレーキ
//   - Y                            .. 後進
//   - LB                           .. カメラ変更 (バードビュー／ドライバーズビュー)
//   - RB                           .. ワイプカメラ変更（無し／バードビュー／トップビュー）
//   - LT/RT                        .. ステージ変更
//   - start                        .. 使い方表示

// ## ルール
// - 次のステージに自動で変わる条件
//   - コースアウトせずに周回すること（コース上のチェックポイント（不可視）をすべて通過する必要あり）
//   - 「１位通過を２週（連続でもなくてよい）」、もしくは「ライバルカー（COMカー）と 10秒以上のベストラップ」


const R01 = Math.PI/1800;
const R02 = Math.PI/900;
const R03 = Math.PI/600;
const R04 = Math.PI/450;
const R05 = Math.PI/360;
const R08 = Math.PI/225;

const R1 = Math.PI/180;
const R2 = Math.PI/90;
const R3 = Math.PI/60;
const R4 = Math.PI/45;
const R5 = Math.PI/36;
const R10 = Math.PI/18;
const R30 = Math.PI/6;
const R45 = Math.PI/4;
const R60 = Math.PI/3;

const R90 = Math.PI/2;
const R180 = Math.PI;
const R270 = Math.PI*3/2;
const R360 = Math.PI*2;


// const SCRIPT_URL2 = "./Vehicle_draft2.js";
// const SCRIPT_URL3 = "./CourseData3.js";

// const goalPath ="textures/amiga.jpg";
// const grndPath ="textures/grass.jpg";
// const floorPath01 ="textures/floor_wide_wall.png";
// const floorPath11 ="textures/floor_norm_grav.png";
// const floorPath21 ="textures/floor_narw_grav.png";
// const skyboxTextPath2 = "textures/skybox2";
// const skyboxTextPath5 = "textures/TropicalSunnyDay";
// const skyboxTextPath6 = "textures/toySky";
// const iconPath3 = "textures/icon_golf6.png";

// const dbase = "textures/course5/"

// ----------------------------------------

const SCRIPT_URL2 = "../105/Vehicle2.js";
const SCRIPT_URL3 = "./CourseData3.js";

const goalPath ="../078/textures/amiga.jpg";
const grndPath ="../065/textures/grass.jpg";
const floorPath01 ="textures/floor_wide_wall.png";
const floorPath11 ="textures/floor_norm_grav.png";
const floorPath21 ="textures/floor_narw_grav.png";

const skyboxTextPath2 = "../111/textures/skybox2";
const skyboxTextPath5 = "../111/textures/TropicalSunnyDay";
const skyboxTextPath6 = "textures/toySky";
const iconPath3 = "../099/textures/icon_golf6.png";

const dbase = "course5/"

// ----------------------------------------

// const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/105/Vehicle2.js";
// const SCRIPT_URL3 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/116/CourseData3.js";

// const goalPath ="https://raw.githubusercontent.com/fnamuoo/webgl/main/078/textures/amiga.jpg";
// const grndPath ="https://raw.githubusercontent.com/fnamuoo/webgl/main/065/textures/grass.jpg";
// const floorPath01 ="https://raw.githubusercontent.com/fnamuoo/webgl/main/116/textures/floor_wide_wall.png";
// const floorPath11 ="https://raw.githubusercontent.com/fnamuoo/webgl/main/116/textures/floor_norm_grav.png";
// const floorPath21 ="https://raw.githubusercontent.com/fnamuoo/webgl/main/116/textures/floor_narw_grav.png";
// const skyboxTextPath2 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/111/textures/skybox2";
// const skyboxTextPath5 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/111/textures/TropicalSunnyDay";
// const skyboxTextPath6 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/116/textures/toySky";
// const iconPath3 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/icon_golf6.png";

// const dbase = "https://raw.githubusercontent.com/fnamuoo/webgl/main/116/course5/"

// ----------------------------------------


const skyboxTextPathList = [skyboxTextPath2, skyboxTextPath5, skyboxTextPath6];
// let skyboxType=0; // -1:rand, 0-2: 固定
let skyboxType=1; // -1:rand, 0-2: 固定

let Vehicle2 = null;
await import(SCRIPT_URL2).then((obj) => { Vehicle2 = obj; });

let CourseData3 = null;
await import(SCRIPT_URL3).then((obj) => { CourseData3 = obj; });

// 勝利条件１：周回でN回トップ通過
const winCond1 = 2;
// 勝利条件２：ベストラップでX秒以上速い
const winCond2 = 10;

// 入力デバイス
// 0: key-board
// 2: gamepad
let idevice = 0;

// 1: バードビュー(FollowCamera)
// 2: ドライバーズビュー(FollowCamera)
// 4: バードビュー
// 6: バードビュー(upVectorセット)
let icamera = 4;
let icameralist = [1, 2, 4, 6];

// 0: なし
// 1: バードビュー
// 2: トップビュー
let icamera2 = 1;
let icameralist2 = [0, 1, 2];

// let imymesh = 0; // for screencapture
// 3: ドリフト仕様
// 5: グリップ仕様
let imymesh = 3;
let mymeshList = [3, 5];

// ライバルカーの ON/OFF
// let bRivalCar = false;  // for screencapture
let bRivalCar = true;

// 地面メッシュ
let bGround = true;
// let bGround = false; // for screencapture

if (0) {
    // screencapture用設定
    bRivalCar = false;
    icamera = 0;
    icameralist = [0, 1, 2, 4, 6];
    icamera2 = 0;
    imymesh = 0;
    mymeshList = [0, 3, 5];
    bGround = false;
    skyboxType=2;
}

// let istage=24; // touge

// let istage=28;  // MotegiSuperSpeedway
let istage=0;
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
    [310246, 0, "エビスサーキット・峠", dbase+"102_4.jpg"], //
    [310314, 0, "鈴鹿ツインサーキット・フル", dbase+"103_1.jpg"], //
    [310324, 0, "鈴鹿ツインサーキット・ドリフト", dbase+"103_2.jpg"], //
    [310333, 0, "鈴鹿ツインサーキット・グリッド", dbase+"103_3.jpg"], //

//    [900101, 0, "MotegiSuperSpeedway", dbase+""], // テスト用
];





let nstage = courseInfoList.length;



// var createScene_vehicle_07 = async function () {
export var createScene = async function () {
    await Recast();
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let camera = null, myMesh=null;
    let camera2 = null;
    // let camera3 = null; // GUI操作用
    // let icamera = 4; // , ncamera = 8;
    // let icamera = 0; // debug / for screencapture
    // let icameralist = [0, 1, 2, 4, 6];
    let cameralist = [];
    var changeCamera = function(icamera) {
console.log("icamera=",icamera)
        while (scene.activeCameras.length > 0) {
            scene.activeCameras.pop();
        }
        if (camera != null) {camera.dispose();}
        if (icamera == 0) {
            // camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(5, 20,-10), scene);
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100, -0.01), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる

            // // while (scene.activeCameras.length > 0) {
            // //     scene.activeCameras.pop();
            // // }
            // // scene.activeCameras.push(camera);
            // // for (let camera_ of cameralist) {
            // //     camera_.dispose();
            // // }
            // // camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);

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
            camera.heightOffset = 1; // 3;
            camera.cameraAcceleration = 0.2;
            camera.maxCameraSpeed = 30;
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (icamera == 2) {
            // フローカメラを使ったドライバーズビュー
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 180;
            camera.radius = 0.5;
            camera.heightOffset = 0.1;
            camera.cameraAcceleration = 0.2;
            camera.maxCameraSpeed = 100;
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        // if (icamera == 3) {
        //     // 対象(myMesh)とカメラの位置関係から、後方にカメラを配置(高さが絶対位置）
        //     camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        //     camera.setTarget(BABYLON.Vector3.Zero());
        //     camera.attachControl(canvas, true);
        //     camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        // }
        if (icamera == 4) {
            // 車体とカメラを固定（進行軸が同じ）して地形が変化（斜面でも地面にカメラが埋まらない）
            camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }

//         if (icamera == 5) {
//             // 上記４カメラを１画面で
//             for (let camera_ of cameralist) {
//                 camera_.dispose();
//             }
//             cameralist=[];
//             {
//                 let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
//                 camera.rotationOffset = 180;
//                 camera.radius = 5;
//                 camera.heightOffset = 1;
//                 camera.cameraAcceleration = 0.05;
//                 camera.maxCameraSpeed = 30;
//                 camera.attachControl(canvas, true);
//                 camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
//                 cameralist.push(camera)
//             }
//             {
//                 let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
//                 camera.rotationOffset = 180;
//                 camera.radius = 0.5;
//                 camera.heightOffset = 0.1;
//                 camera.cameraAcceleration = 0.2;
//                 camera.maxCameraSpeed = 30;
//                 camera.attachControl(canvas, true);
//                 camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
//                 cameralist.push(camera)
//             }
//             {
//                 let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
//                 camera.setTarget(BABYLON.Vector3.Zero());
//                 camera.attachControl(canvas, true);
//                 camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
//                 cameralist.push(camera)
//             }
//             {
//                 let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
//                 camera.setTarget(BABYLON.Vector3.Zero());
//                 camera.attachControl(canvas, true);
//                 camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
//                 cameralist.push(camera)
//             }
//             //scene.activeCameras.pop();
//             while (scene.activeCameras.length > 0) {
//                 scene.activeCameras.pop();
//             }
//             for (let camera_ of cameralist) {
//                 scene.activeCameras.push(camera_);
//             }
//             if (camera!=null){
//                 camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
//                 // camera.dispose();
//                 // camera=null;
//             }
//             cameralist[0].viewport = new BABYLON.Viewport(0.0, 0.5, 0.5, 0.5); // 左上
//             cameralist[1].viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5); // 右上
//             cameralist[2].viewport = new BABYLON.Viewport(0.0, 0.0, 0.5, 0.5); // 左下
//             cameralist[3].viewport = new BABYLON.Viewport(0.5, 0.0, 0.5, 0.5); // 右下
// //console.log("camera.len=",cameralist.length);
//         }

        if (icamera == 6) {
            // // 車体とカメラを固定（進行軸が同じ）して地形が変化（斜面でも地面にカメラが埋まらない）
            camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
            // camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 4,-10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

            // while (scene.activeCameras.length > 0) {
            //     scene.activeCameras.pop();
            // }
            // scene.activeCameras.push(camera);
            // for (let camera_ of cameralist) {
            //     camera_.dispose();
            // }
            // camera.lockedTarget = myMesh;
            // camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
        }

//         if (icamera == 7) {
//             // 上記４カメラを１画面で
//             for (let camera_ of cameralist) {
//                 camera_.dispose();
//             }
//             cameralist=[];
//             {
//                 let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
//                 camera.rotationOffset = 180;
//                 camera.radius = 5;
//                 camera.heightOffset = 1;
//                 camera.cameraAcceleration = 0.05;
//                 camera.maxCameraSpeed = 30;
//                 camera.attachControl(canvas, true);
//                 camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
//                 cameralist.push(camera)
//             }
//             {
//                 let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
//                 camera.rotationOffset = 180;
//                 camera.radius = 0.5;
//                 camera.heightOffset = 0.1;
//                 camera.cameraAcceleration = 0.2;
//                 camera.maxCameraSpeed = 30;
//                 camera.attachControl(canvas, true);
//                 camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
//                 cameralist.push(camera)
//             }
//             {
//                 let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
//                 camera.setTarget(BABYLON.Vector3.Zero());
//                 camera.attachControl(canvas, true);
//                 camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
//                 cameralist.push(camera)
//             }
//             {
//                 let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
//                 camera.setTarget(BABYLON.Vector3.Zero());
//                 camera.attachControl(canvas, true);
//                 camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
//                 cameralist.push(camera)
//             }
//             //scene.activeCameras.pop();
//             while (scene.activeCameras.length > 0) {
//                 scene.activeCameras.pop();
//             }
//             for (let camera_ of cameralist) {
//                 scene.activeCameras.push(camera_);
//             }
//             if (camera!=null){
//                 camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
//                 // camera.dispose();
//                 // camera=null;
//             }
//             cameralist[0].viewport = new BABYLON.Viewport(0.0, 0.5, 0.5, 0.5); // 左上
//             cameralist[1].viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5); // 右上
//             cameralist[2].viewport = new BABYLON.Viewport(0.0, 0.0, 0.5, 0.5); // 左下
//             cameralist[3].viewport = new BABYLON.Viewport(0.5, 0.0, 0.5, 0.5); // 右下
// //console.log("camera.len=",cameralist.length);
//         }

        // // if (icamera == 5 && myMesh!=null) {
        // if (((icamera == 5) || (icamera == 7)) && myMesh!=null) {
        //     cameralist[0].lockedTarget = myMesh;
        //     cameralist[1].lockedTarget = myMesh;
        //     cameralist[2].lockedTarget = myMesh;
        //     cameralist[3].lockedTarget = myMesh;
        // } else 
        if (icamera >= 1 && myMesh!=null) {
            camera.lockedTarget = myMesh;
        }
        camera.layerMask = 0x10000000;
        scene.activeCameras.push(camera);
        // camera.layerMask = 0x20000000;
        if (camera2 != null) {
            scene.activeCameras.push(camera2);
        }
    }
    scene.onBeforeRenderObservable.add((scene) => {
        // if (icamera == 3) {
        //     let vdir = camera.position.subtract(myMesh.position).normalize().scale(5);
        //     vdir.y = 1;
        //     camera.position = myMesh.position.add(vdir);
        // }
        // // if ((icamera == 4) && (myMesh._vehicle != null)) {
        if (icamera == 4) {
            // let quat = myMesh._vehicle.body.transformNode.rotationQuaternion;
            let quat = myMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(0, 1, -5);
            vdir = vdir.applyRotationQuaternion(quat);
            camera.position = myMesh.position.add(vdir);
        }
        // if (icamera == 5) {
        //     {
        //         let vdir = cameralist[2].position.subtract(myMesh.position).normalize().scale(5);
        //         vdir.y = 1;
        //         cameralist[2].position = myMesh.position.add(vdir);
        //     }
        //     //if ((myMesh._vehicle != null)) {
        //     {
        //         let quat = myMesh.rotationQuaternion;
        //         let vdir = new BABYLON.Vector3(0, 1, -5);
        //         vdir = vdir.applyRotationQuaternion(quat);
        //         cameralist[3].position = myMesh.position.add(vdir);
        //     }
        // }

        if (icamera == 6) {
            let quat = myMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(0, 1, -5);
            vdir = vdir.applyRotationQuaternion(quat);
            camera.position = myMesh.position.add(vdir);
            camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        }
        // if (icamera == 7) {
        //     {
        //         let quat = myMesh.rotationQuaternion;
        //         // cameralist[0].upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        //         cameralist[1].upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        //     }
        //     {
        //         let vdir = cameralist[2].position.subtract(myMesh.position).normalize().scale(5);
        //         vdir.y = 1;
        //         cameralist[2].position = myMesh.position.add(vdir);
        //     }
        //     {
        //         let quat = myMesh.rotationQuaternion;
        //         let vdir = new BABYLON.Vector3(0, 1, -5);
        //         vdir = vdir.applyRotationQuaternion(quat);
        //         cameralist[3].position = myMesh.position.add(vdir);
        //         cameralist[3].upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        //     }
        // }
    });

//    changeCamera(icamera);

    // let camera2 = null;
    // let icamera2 = 1;
    // let icameralist2 = [0, 1, 2];
    var changeCamera2 = function(_icamera2) {
        while (scene.activeCameras.length > 0) {
            scene.activeCameras.pop();
        }
        if (_icamera2 == 0) {
            // camera2 を表示しない
            scene.activeCameras.push(camera);
            guiIconCourse.width = "60px";
            guiIconCourse.height = "60px";
            return;
        }
        if (camera2 != null) {camera2.dispose();}
        // // // if (icamera2 == 0) {
        // // if (0) {
        // //     // camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(5, 20,-10), scene);
        // //     camera2 = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100, -0.01), scene);
        // //     if (myMesh != null) {
        // //         camera2.setTarget(myMesh.position);
        // //     } else {
        // //         camera2.setTarget(BABYLON.Vector3.Zero());
        // //     }
        // //     camera2.setTarget(BABYLON.Vector3.Zero());
        // //     camera2.attachControl(canvas, true);
        // //     // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
        // //     // lockedTargetをセットすると右クリックでパン（移動）できなくなる
        // //     // <->逆にセットしないと、
        // //     //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
        // //     // camera2.lockedTarget = myMesh;
        // // }
        if (_icamera2 == 1) {
            // バードビュー
            camera2 = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera2.rotationOffset = 180;
            // camera2.radius = 5;
            // camera2.heightOffset = 3;
            camera2.radius = 50;
            camera2.heightOffset = 25; // 30;
            camera2.cameraAcceleration = 0.05;
            camera2.maxCameraSpeed = 30;
            // // // camera2.attachControl(canvas, true);
            // // camera2.detachControl();
            // // // camera2.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (_icamera2 == 2) {
            // トップビュー
            camera2 = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera2.rotationOffset = 180;
            camera2.radius = 10;
            camera2.heightOffset = 130;
            camera2.cameraAcceleration = 0.05;
            camera2.maxCameraSpeed = 30;
            // // // camera2.attachControl(canvas, true);
            // // camera2.detachControl();
            // // // camera2.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }

        // if ((icamera2 >= 1 && icamera2 <= 2) && myMesh!=null) {
        // if ((icamera2 >= 1) && (myMesh!=null)) {
        if (myMesh != null) {
            // camera2.lockedTarget = myMesh;
            camera2.lockedTarget = myMesh._4c2;
        }
        //遠方のメッシュを表示しない
        camera2.maxZ = 500;

        let cw = 0.25, ch = 0.25;
        // 右上
        camera2.viewport = new BABYLON.Viewport(1-cw, 1-ch, cw, ch);
        // // 右下
        // camera2.viewport = new BABYLON.Viewport(1-cw, 0.0, cw, ch);

        // ?? camera2.detachControl();
        // xx camera2.inputs.attached.mouse.detachControl();
        camera2.inputs.clear(); // カーソルキーでカメラ操作させないようにする

        camera2.layerMask = 0x20000000;
        // camera2.zIndex = 1;

        scene.activeCameras.push(camera);
        scene.activeCameras.push(camera2);

        {
            // camera2　がかぶる程度の大きさにしておく
            guiIconCourse.width = "200px";
            guiIconCourse.height = "150px";
        }
    }

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // // if (0) {
    // //     // 地面
    // //     const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
    // //     const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
    // //     groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    // //     groundMesh.material.majorUnitFrequency = 100; 
    // //     groundMesh.material.minorUnitVisibility  = 0.2;
    // //     var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
    // // }


    // // コース画像
    // let crsW=400, crsH=300;
    // const courseMesh = BABYLON.MeshBuilder.CreateGround("courseImg", { width:crsW, height:crsH }, scene);
    // courseMesh.position.y=0.01;
    // courseMesh.material = new BABYLON.StandardMaterial("");
    // courseMesh.material.diffuseTexture = new BABYLON.Texture(coursePath);
    // courseMesh.material.diffuseTexture.hasAlpha = true;
    // courseMesh.material.emissiveColor = new BABYLON.Color3.White();
    // courseMesh.material.alpha = 0.2;

    // ----------------------------------------

    const metaStageInfo = {
        // ------------------------------
        300101:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                // extRot: 0.01, // 左ねじ .. 左旋回時に内向きに
                // extRot:-0.01, // 右ねじ
                data :CourseData3.DATA.Akigase.xz,
               },
        // 300102:{label:"",
        //         iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
        //         dtype:"xz", stageType:'extrude',
        //         data :CourseData3.DATA.AkigaseB.xz,
        //        },
        // 300103:{label:"",
        //         iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
        //         dtype:"xz", stageType:'extrude',
        //         data :CourseData3.DATA.AkigaseC.xz,
        //        },
        // 300104:{label:"",
        //         iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
        //         dtype:"xz", stageType:'extrude',
        //         data :CourseData3.DATA.AkigaseD.xz,
        //        },
        // 300105:{label:"",
        //         iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
        //         dtype:"xz", stageType:'extrude_square_bottom_narrow',
        //         // dtype:"xz", stageType:'extrude',
        //         data :CourseData3.DATA.Akigase.xz,
        //        },
        // 300106:{label:"",
        //         iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
        //         dtype:"xz", stageType:'extrude',
        //         data :CourseData3.DATA.AkigaseE.xz,
        //        },
        // 300107:{label:"",
        //         iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:3, 
        //         dtype:"xz", stageType:'extrude_square_bottom_narrow',
        //         // dtype:"xz", stageType:'extrude',
        //         data :CourseData3.DATA.Akigase.xz,
        //        },
        300108:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.AkigaseE.xz,
               },
        300109:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:200, adjx:-120, adjz:60, pQdbg:1, nbPoints:20,
                dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.AkigaseE.xz,
               },

        300201:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.ShinTokyo.xz,
               },
        300202:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.ShinTokyo.xz,
               },

        300301:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.OhiMatsuda.xz,
               },
        // 300302:{label:"",
        //         iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
        //         dtype:"xz", stageType:'extrude_square_bottom_narrow',
        //         data :CourseData3.DATA.OhiMatsuda.xz,
        //        },
        300303:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:50, pQdbg:1,
                dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.OhiMatsuda.xz,
               },

        300401:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.CityCart.xz,
               },
        300402:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                data :CourseData3.DATA.CityCartB.xz,
               },
        300403:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                data :CourseData3.DATA.CityCart.xz,
               },
        300404:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:100, pQdbg:1,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.CityCart.xz,
               },

        300501:{label:"",
                iy:0.06, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.Hyper.xz,
               },
        300502:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:100, adjy:0.1, pQdbg:1,
                dtype:"xzRR", stageType:'wide_with_wall',
                // dtype:"xzRR", stageType:'normal_with_gravel',
                // dtype:"xzRR", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.Hyper.xzRR,
               },


        300601:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.FDreamHiratsuka.xz,
               },
        300602:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'narrow_with_gravel', // 狭くなってライン取りが難しくなった
                data :CourseData3.DATA.FDreamHiratsuka.xz,
               },
        300603:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:100, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                data :CourseData3.DATA.FDreamHiratsuka.xz,
               },

        300711:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.TwinLinkMOTEGISourth.xz,
               },
        300712:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:70, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                data :CourseData3.DATA.TwinLinkMOTEGISourth.xz,
               },

        300721:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.TwinLinkMOTEGINorth.xz,
               },
        300722:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:100, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                // dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',  // コースがやや狭くなり、難しくなる（もともと交差してないのでwallがよいかも）
                data :CourseData3.DATA.TwinLinkMOTEGINorth.xz,
               },
        // 300723:{label:"",
        //         iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
        //         dtype:"xz", stageType:'narrow_with_gravel',  // コースがやや狭くなり、難しくなる（もともと交差してないのでwallがよいかも）
        //         data :CourseData3.DATA.TwinLinkMOTEGINorth.xz,
        //        },

        300731:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.TwinLinkMOTEGIMovility.xz,
               },
        300732:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:90, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                data :CourseData3.DATA.TwinLinkMOTEGIMovility.xz,
               },


        300801:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.Ishino.xz,
               },
        300802:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.Ishino.xz,
               },
        300803:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.Ishino.xz,
               },
        300804:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:70, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'normal_with_gravel',
                data :CourseData3.DATA.Ishino.xz,
               },

        300901:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.Biwako.xz,
               },
        300902:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-130, adjz:70, pQdbg:1,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                data :CourseData3.DATA.Biwako.xz,
               },

        301011:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.MobaraEast.xz,
               },
        301012:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.MobaraEast.xz,
               },
        301013:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:70, pQdbg:1, nbPoints:4,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.MobaraEast.xz,
               },

        301021:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.MobaraWest.xz,
               },
        301022:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:90, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                // dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.MobaraWest.xz,
               },


        301101:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.Itako.xz,
               },
        301102:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:70, pQdbg:1,
                // dtype:"xz", stageType:'wide_with_wall', // わるくないけど、S字クランクの交差が気になる
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.Itako.xz,
               },

        301201:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.Haruna.xz,
               },
        301202:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:90, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                // dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.Haruna.xz,
               },

        301311:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.GotenbaHigh.xz,
               },
        301312:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                // dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.GotenbaHigh.xz,
               },

        301321:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.GotenbaTech.xz,
               },
        301322:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.GotenbaTech.xz,
               },

        301401:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.Igashira.xz,
               },
        301402:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:90, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                // dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.Igashira.xz,
               },

        301501:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.ISKMaebashi.xz,
               },
        301502:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'wide_with_wall',
                // dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.ISKMaebashi.xz,
               },

        301601:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.Kisarazu.xz,
               },
        301602:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.Kisarazu.xz,
               },
        301603:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.KisarazuB.xz,
               },
        301604:{label:"",
                iy:0.05, scale:0.7, grndW:600, grndH:450, adjx:-170, adjz:100, pQdbg:1, nbPoints:4,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.KisarazuB.xz,
               },

        310101:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.FujiSpeedwayMultiPuerpose.xz,
               },
        310102:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.FujiSpeedwayMultiPuerpose.xz,
               },
        310103:{label:"",
                iy:0.05, scale:0.8, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.FujiSpeedwayMultiPuerpose.xz,
               },
        310104:{label:"",
                iy:0.05, scale:0.8, grndW:500, grndH:200, adjx:-200, adjz:70, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'wide_with_wall',
                // dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.FujiSpeedwayMultiPuerpose.xz,
               },

        310211:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuEast.xz,
               },
        310212:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuEast.xz,
               },
        310213:{label:"",
                iy:0.05, scale:0.8, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                // dtype:"xz", stageType:'extrude_square_bottom_narrow',
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuEast.xz,
               },
        310214:{label:"",
                iy:0.05, scale:0.6, grndW:400, grndH:300, adjx:-150, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'wide_with_wall',
                // dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.EbisuEast.xz,
               },

        310221:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuNorth.xz,
               },
        310222:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuNorth.xz,
               },
        310223:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuNorthB.xz,
               },
        310224:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuNorthC.xz,
               },
        310225:{label:"",
                iy:0.05, scale:0.8, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuNorthC.xz,
               },
        // 310226:{label:"",
        //         iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
        //         dtype:"xz", stageType:'extrude_square_bottom_narrow',
        //         // dtype:"xz", stageType:'extrude',
        //         data :CourseData3.DATA.EbisuNorthB.xz,
        //        },
        310227:{label:"",
                iy:0.05, scale:0.8, grndW:600, grndH:450, adjx:-200, adjz:100, pQdbg:1, nbPoints:4,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.EbisuNorthC.xz,
               },

        310231:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuWest.xz,
               },
        310232:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:4,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuWest.xz,
               },
        310233:{label:"",
                iy:0.05, scale:0.8, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:10,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuWest.xz,
               },
        310234:{label:"",
                iy:0.05, scale:0.8, grndW:500, grndH:300, adjx:-200, adjz:80, pQdbg:1, nbPoints:10,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.EbisuWest.xz,
               },

        310241:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuTouge.xz,
               },
        310242:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuTougeB.xz,
               },
        310243:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:10,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuTougeB.xz,
               },
        310244:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude_square_bottom_narrow',
                // dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.EbisuTougeC.xz,
               },
        310245:{label:"",
                iy:0.05, scale:0.8, grndW:500, grndH:300, adjx:-200, adjz:80, pQdbg:1,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.EbisuTougeC.xz,
               },
        310246:{label:"",
                iy:0.05, scale:0.8, grndW:500, grndH:300, adjx:-200, adjz:80, adjy:0.01, pQdbg:1, // pQdbgLbl:1,
                // dtype:"xzRR", stageType:'wide_with_wall',
                dtype:"xzRR", stageType:'normal_with_gravel',
                // dtype:"xzRR", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.EbisuTougeC.xzRR,
               },

        310311:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.SuzukaTwinFull.xz,
               },
        310312:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.SuzukaTwinFull.xz,
               },
        310313:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.SuzukaTwinFullB.xz,
               },
        310314:{label:"",
                iy:0.05, scale:1.0, grndW:800, grndH:300, adjx:-250, adjz:100, pQdbg:1,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.SuzukaTwinFullB.xz,
               },

        310321:{label:"",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.SuzukaTwinDrift.xz,
               },
        310322:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.SuzukaTwinDrift.xz,
               },
        310323:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.SuzukaTwinDriftB.xz,
               },
        310324:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-110, adjz:100, pQdbg:1,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.SuzukaTwinDriftB.xz,
               },


        310331:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.SuzukaTwinGrid.xz,
               },
        310332:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.SuzukaTwinGridB.xz,
               },
        310333:{label:"",
                iy:0.05, scale:1.0, grndW:400, grndH:300, adjx:-350, adjz:80, pQdbg:1,
                // dtype:"xz", stageType:'wide_with_wall',
                dtype:"xz", stageType:'normal_with_gravel',
                // dtype:"xz", stageType:'narrow_with_gravel',
                data :CourseData3.DATA.SuzukaTwinGridB.xz,
               },

        900101:{label:"",
                iy:0.05, scale:0.2, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                data :CourseData3.DATA.MotegiSuperSpeedway_new.xz.slice(0, -3),
               },

    };

    var getMetaStageInfo = function (istage) {
        let rval;
        let [id, ttype, tlabel, tpath] = courseInfoList[istage];
        rval = metaStageInfo[id];
        console.log("\ni=",istage, rval.label, tlabel);
        // if (ttype == 0) {
        //     console.log("\ni=",istage, rval.label, tlabel);
        // } else if (ttype == 1) {
        //     console.log("\ni=",istage, rval.label, tlabel);
        //     rval = createCourseData(rval);
        // } else {
        //     console.assert(0);
        // }
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

    var createStage = function(istage) {
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
        // let xzRRot = {};
        // let mZRot = {};
        // let xzLbl = {};

        let mZRot = typeof(metaStageInfo.mZRot) !== 'undefined' ? metaStageInfo.mZRot : {};
        let xzLbl = typeof(metaStageInfo.xzLbl) !== 'undefined' ? metaStageInfo.xzLbl : {};

        if (bGround) { // screencapture
            // 地面
            let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
            meshGrnd.position.y += -0.01;
            meshGrnd.material = new BABYLON.StandardMaterial("mat", scene);
            meshGrnd.material.diffuseTexture = new BABYLON.Texture(grndPath, scene);
	    meshGrnd.material.diffuseTexture.uScale = Math.ceil(grndW/4);
	    meshGrnd.material.diffuseTexture.vScale = Math.ceil(grndH/4);
            meshGrnd.material.specularColor = new BABYLON.Color4(0, 0, 0);
            meshGrnd.layerMask = 0x10000000;
            // // if (0){
            // // meshGrnd.material = new BABYLON.GridMaterial("groundMaterial", scene);
            // // meshGrnd.material.majorUnitFrequency = 100; 
            // // meshGrnd.material.minorUnitVisibility  = 0.2;
            // // }
            var aggGrnd = new BABYLON.PhysicsAggregate(meshGrnd, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
            meshAggInfo.push([meshGrnd,aggGrnd]);

            // camera2用の地面
            let meshGrnd2 = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW*4, height:grndH*4 }, scene);
            meshGrnd2.layerMask = 0x20000000;
            meshGrnd2.material = new BABYLON.StandardMaterial("mat", scene);
            // meshGrnd2.material.diffuseColor = BABYLON.Color3.White();
            meshGrnd2.material.emissiveColor = BABYLON.Color3.White();
            // meshGrnd2.material.alpha = 0.7;
            meshAggInfo.push([meshGrnd2,null]);
        }

        if(metaStageInfo.dtype=='xz') {
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
//                 else {
// console.log(" tmp.len=", tmp.length, ii, tmp);
//                 }
                [ix_,iz_] = [ix,iz];
            }

        // } else if(metaStageInfo.dtype=='xzy') {
        //     // 高さを手動で指定した版
        //     // .. カスタムでコースを作成する場合も
        //     let ii =-1, ix, iz, iy;
        //     for (let tmp of metaStageInfo.data) {
        //         ++ii;
        //         // xzLbl
        //         let vE = tmp[tmp.length-1];
        //         if (typeof(vE) == "string") {
        //             xzLbl[ii] = vE;
        //             let tmp2 = tmp.slice(0, tmp.length-1);
        //             tmp = tmp2;
        //             // // // tmp末尾をpopすると元データを壊してしまうので、tmp配列をコピー
        //             // // let tmp2 = []
        //             // // for (let kk=0; kk < tmp.length-1; ++kk) {
        //             // //     tmp2.push(tmp[kk]);
        //             // // }
        //             // // tmp = tmp2;
        //         }
        //         ix = tmp[0];
        //         iz = tmp[1];
        //         iy = tmp[2];
        //         plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
        //     }
        //     // for (let [ix,iz,iy] of metaStageInfo.data) {
        //     //     plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
        //     // }
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

            // if (!cameraType) {
            //     let ymin = plist2[0].y
            //     for (let p of plist2) {
            //         if (ymin > p.y) {
            //             ymin = p.y
            //         }
            //     }
            //     console.log("\nymin=", ymin);
            // }

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
            // pGoal = plist3[plist3.length-nbPoints].clone();


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
                // console.log("plist2.length=",plist2.length, " 1/20=",Math.floor(plist2.length/20));
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
                    mesh.layerMask = 0x10000000;
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
                            meshLbl.layerMask = 0x10000000;
                            let lbltext = xzLbl[j];
                            setTextMesh(meshLbl, lbltext)
                        }
                    }
                    meshAggInfo.push([mesh,null]);
                }
            }

// // console.log("stageType=",stageType);

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
                mesh.layerMask = 0x30000000;
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                {
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                }
//                 if(1) {
// //const floorPath2 ="textures/floor2.png";
// // // const floorPath2 ="textures/ground2.jpg";
//                 let floorPath2 = floorPath21;
//                 mesh.material.diffuseTexture = new BABYLON.Texture(floorPath2, scene);
// 	        mesh.material.diffuseTexture.uScale = 1;
// 	        mesh.material.diffuseTexture.vScale = 200;
//                 mesh.material.specularColor = new BABYLON.Color4(0, 0, 0);
//                 }
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
                mesh.layerMask = 0x30000000;
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                // mesh.material.emissiveColor = BABYLON.Color3.Green();
                // mesh.material.emissiveColor = new BABYLON.Color3(0, 0.5, 0);
                if (1) {
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                }
                // // if(0) {
                // // mesh.material.diffuseTexture = new BABYLON.Texture(floorPath, scene);
	        // // mesh.material.diffuseTexture.uScale = 1;
	        // // mesh.material.diffuseTexture.vScale = 100;
                // // mesh.material.specularColor = new BABYLON.Color4(0, 0, 0);
                // // }
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
                mesh.layerMask = 0x30000000;
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
                mesh.layerMask = 0x30000000;
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
                mesh.layerMask = 0x30000000;

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
                mesh.layerMask = 0x30000000;
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
                goalMesh.layerMask = 0x30000000;
                goalMesh.material = new BABYLON.StandardMaterial("mat");
                goalMesh.material.diffuseTexture = new BABYLON.Texture(goalPath, scene);
                goalMesh.material.alpha = 0.5;
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
                    meshCP.layerMask = 0x10000000;
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
                    meshAgent.layerMask = 0x10000000;
                    // --------------------
                    // camera2用メッシュ
                     meshAgent4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:6, radiusTop:2});
                    meshAgent4c2.position.y += 3;
                    // meshAgent4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:9, radiusTop:3});
                    // meshAgent4c2.position.y += 3;
                    //meshAgent4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:12, radiusTop:4});
                    // meshAgent4c2.position.y += 6;
                    // meshAgent4c2.material = new BABYLON.StandardMaterial("mat", scene);
                    // meshAgent4c2.material.emissiveColor = BABYLON.Color3.Black();
                    meshAgent4c2.layerMask = 0x20000000;
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
                // } else {
                //     let pQ_ = pQQ[meshAgent.route];
                //     crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(pQ_[0]));
                //     crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ_[1]));
                // }
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
            skybox.layerMask = 0x10000000;
            meshAggInfo.push([skybox,null]);
        }

        resetMyPosi();
    }

    // チェックポイントの確認
    scene.registerAfterRender(function() {
        let ctnow, lap;
        if (myMesh != null) {
            // 自機とチェックポイントの交差チェック
            if (myMesh.intersectsMesh(meshCPlist[imeshCPnextME], true)) {
                ctnow = performance.now();
                if (imeshCPnextME == 0) {
                    ++iloopME;
                    lap = Math.floor(ctnow - ctMElist[imeshCPnextME])/1000;
                    console.log(" YOUR-lap=", lap);
                    setText2("LapTime:"+lap);
                    {
                        // 周回勝利を確認
                        // 全てのCheckPointを通過しているかを確認
                        let bEnable = true, bchk0 = iloopME-1;
                        for (let bchk of passCPMElist.slice(1)) {
                            if (bchk != bchk0) {
                                bEnable = false;
                                break;
                            }
                        }
                        if (bEnable) {
                            // 全てのCheckPointを通過している
                            // ベストラップ確認
                            if (bestLapME < 0) {
                                bestLapME = lap;
                            } else if (bestLapME > lap) {
                                bestLapME = lap;
                            } 
                            // 次に先にゴールしているかを確認
                                // // console.log("## 次に先にゴールしているかを確認");
                                // // console.log("passCPMElist[0]="+passCPMElist[0]+", passCPCOMlist[0]="+passCPCOMlist[0]);
                                // // console.log("winLoop="+winLoop+"  winCond1="+winCond1);
                            if (passCPMElist[0] >= passCPCOMlist[0]) {
                                ++winLoop;
                                console.log("winLoop="+winLoop+"  winCond1="+winCond1);
                                if (winLoop >= winCond1) {
                                    console.log("勝利条件１");
                                    setText2("YOU WIN!");
                                    tiggerJumpNextStage();
                                }
                            }
                            // ベストラップの差を確認
                            if ((bestLapME > 0) && (bestLapCOM > 0) && (bestLapCOM - winCond2 >= bestLapME)) {
                                console.log("勝利条件２");
                                setText2("YOU WIN!!");
                                tiggerJumpNextStage();
                            }
                        }
                    }
                } else {
                    lap = Math.floor(ctnow - ctMElist[0])/1000;
                    console.log("Y-section=", lap);
                }
                ctMElist[imeshCPnextME] = ctnow;
                passCPMElist[imeshCPnextME] = iloopME;
                if (passCPMElist[imeshCPnextME] == passCPCOMlist[imeshCPnextME]) {
                    // プレイヤー遅れ（COM先行）
                    let tdiff = Math.floor(ctCOMlist[imeshCPnextME] - ctMElist[imeshCPnextME])/1000;
                    if (tdiff < -5) {
                        console.log("遅れ=", tdiff, "敵down");
                        // changeAgntSpeed(-0.1);
                        changeAgntSpeed(tdiff*0.01); // 10秒で0.1下げる割合
                    } else {
                        console.log("遅れ=", tdiff, "そのまま");
                    }
                }
                imeshCPnextME = (imeshCPnextME+1) % meshCPlist.length;
            }
        }
        // COMとチェックポイントの交差チェック
        if (comMesh != null) {
            if (comMesh.intersectsMesh(meshCPlist[imeshCPnextCOM], true)) {
                ctnow = performance.now();
                if (imeshCPnextCOM == 0) {
                    ++iloopCOM;
                    lap = Math.floor(ctnow - ctCOMlist[imeshCPnextCOM])/1000;
                    console.log("  COM-lap=", lap);
                    // ベストラップ確認
                    if (bestLapCOM < 0) {
                        bestLapCOM = lap;
                    } else if (bestLapCOM > lap) {
                        bestLapCOM = lap;
                    }
                    // ベストラップの差を確認
                    if ((bestLapME > 0) && (bestLapCOM > 0) && (bestLapCOM - winCond2 >= bestLapME)) {
                        console.log("勝利条件２");
                        setText2("YOU WIN!!");
                        tiggerJumpNextStage();
                    }
                }
                ctCOMlist[imeshCPnextCOM] = ctnow;
                passCPCOMlist[imeshCPnextCOM] = iloopCOM;
                if (passCPMElist[imeshCPnextCOM] == passCPCOMlist[imeshCPnextCOM]) {
                    // プレイヤー先行（COM遅れ）
                    let tdiff = Math.floor(ctCOMlist[imeshCPnextCOM] - ctMElist[imeshCPnextCOM])/1000;
                    if (tdiff > 5) {
                        console.log("先行=", tdiff, "敵UP");
                        // changeAgntSpeed(0.1);
                        changeAgntSpeed(tdiff*0.01); // 10秒で0.1上げる割合
                    } else {
                        console.log("先行=", tdiff, "そのまま");
                    }
                }
                imeshCPnextCOM = (imeshCPnextCOM+1) % meshCPlist.length;
            }
        }
    })

    // ライバルカー（エージェント）のスピード調整
    let changeAgntSpeed = function (spdRateStep) {
        crowd._spdRate += spdRateStep;
        crowd._accRate += spdRateStep*0.2;
        console.log("changeAgntSpeed() spdRate=", crowd._spdRate);
        for (let meshAgent of meshAgentList) {
            let idx = meshAgent._idx;
            let agentParams = agentParamList[idx];
            agentParams.maxSpeed = meshAgent._spd * crowd._spdRate;
            agentParams.maxSpeed = Math.max(agentParams.maxSpeed, 8); // 下限を8とする
            agentParams.maxAcceleration = meshAgent._acc * crowd._accRate;
            agentParams.maxAcceleration = Math.max(agentParams.maxAcceleration, 4); // 下限を4とする
            crowd.updateAgentParameters(idx, agentParams);
        }
    }


    let resetMyPosi = function () {
        if (myMesh==null) {
console.log("myMesh==null")
            return;
        }

        if (imymesh == 0) {
            myMesh.position = pStart.clone();
            myMesh.position.y += 2;
            {
                let [id, ttype, tlabel, tpath] = courseInfoList[istage];
                let rval = metaStageInfo[id];
            }
            let p1 = pStart.clone();
            let p3 = pStart2.clone();
            p3.subtractInPlace(p1);
            let vrot = Math.atan2(p3.x, p3.z);
            myMesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
            myMesh.rotate(BABYLON.Vector3.Up(), vrot);
            text1.text = ""; // スピード表示をしない

        } else {
            myMesh.position = pStart.clone();
            myMesh.position.y += 2;
            {
                let [id, ttype, tlabel, tpath] = courseInfoList[istage];
                let rval = metaStageInfo[id];
            }
            let p1 = pStart.clone();
            let p3 = pStart2.clone();
            p3.subtractInPlace(p1);
            let vrot = Math.atan2(p3.x, p3.z);
            myMesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
            myMesh.rotate(BABYLON.Vector3.Up(), vrot);
            myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
        }
    }

    // ----------------------------------------

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

        // // var addCharPanel = function(charPath, myMesh, adjy=1.1, clipy=0.0) {
        // //     let mx = 3, my = 4;
	// //     let matFB = new BABYLON.StandardMaterial("");
	// //     matFB.diffuseTexture = new BABYLON.Texture(charPath);
	// //     matFB.diffuseTexture.hasAlpha = true;
	// //     matFB.emissiveColor = new BABYLON.Color3.White();
        // //     //let clipy=0.01;
	// //     let uvF = new BABYLON.Vector4(0, 0/my+clipy, 1/mx, 1/my); // B
        // //     let uvB = new BABYLON.Vector4(0, 3/my+clipy, 1/mx, 4/my); // F
        // //     let planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        // //     planeFB.position.y = adjy;
        // //     planeFB.material = matFB;
        // //     // planeFB.material.top = 5;
        // //     planeFB.parent = myMesh;
        // //     myMesh._planeFB = planeFB;
        // //     // myMesh._txtFB = matFB.diffuseTexture;
	// //     let matLR = new BABYLON.StandardMaterial("");
	// //     matLR.diffuseTexture = new BABYLON.Texture(charPath);
	// //     matLR.diffuseTexture.hasAlpha = true;
	// //     matLR.emissiveColor = new BABYLON.Color3.White();
	// //     let uvL = new BABYLON.Vector4(0, 2/my, 1/mx, 3/my); // L
        // //     let uvR = new BABYLON.Vector4(1/mx, 1/my, 0, 2/my); // R
        // //     let planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvR, backUVs: uvL, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        // //     planeLR.position.y = adjy;
        // //     planeLR.material = matLR;
        // //     // planeLR.material.top = 5;
        // //     planeLR.rotation = new BABYLON.Vector3(0, R90, 0);
        // //     planeLR.parent = myMesh;
        // //     myMesh._planeLR = planeLR;
        // //     // myMesh._txtLR = matLR.diffuseTexture;
        // // }



        if (imymesh == 3) {
            // RaycastVehicle
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            let chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.emissiveColor = BABYLON.Color3.Blue();
            chassisMesh.material.alpha=0.7;
            chassisMesh.position.y = 5;
            chassisMesh.position.x = 0;
            chassisMesh.rotationQuaternion = new BABYLON.Quaternion();
            chassisMesh.layerMask = 0x10000000;
            let chassisPhysicsShape = new BABYLON.PhysicsShapeConvexHull(chassisMesh, scene);
            let chassisPhysicsBody = new BABYLON.PhysicsBody(chassisMesh, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
            chassisPhysicsBody.shape = chassisPhysicsShape
            chassisPhysicsBody.setMassProperties({
                centerOfMass: new BABYLON.Vector3(0, -0.5, 0)
            })
            chassisPhysicsShape.filterMembershipMask = 2
            // position で移動させるために
            chassisPhysicsBody.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            chassisPhysicsBody.disablePreStep = false;
            // --------------------
            // camera2用メッシュ
            // let meshMy4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:3, radiusTop:1});
            // let meshMy4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:6, radiusTop:2});
            // meshMy4c2.position.y += 3;
            let meshMy4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:7.5, radiusTop:2.5});
            meshMy4c2.position.y += 4;
            // let meshMy4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:9, radiusTop:3});
            // meshMy4c2.position.y += 4.5;
            // let meshMy4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:12, radiusTop:4});
            // meshMy4c2.position.y += 6;
            meshMy4c2.material = new BABYLON.StandardMaterial("mat", scene);
            meshMy4c2.material.emissiveColor = BABYLON.Color3.Yellow();
            meshMy4c2.layerMask = 0x20000000;
            meshMy4c2.parent = chassisMesh;
            // カメラの視点用
            let mesh4c2view = BABYLON.MeshBuilder.CreateBox("", {size:1});
            mesh4c2view.position.y += 10;
            mesh4c2view.material = new BABYLON.StandardMaterial("mat", scene);
            mesh4c2view.alpha = 0;
            mesh4c2view.parent = chassisMesh;
            chassisMesh._4c2 = mesh4c2view;
            // --------------------
            // 車のモデル（RaycastVehicle
            let vehicle = new Vehicle2.RaycastVehicle(chassisPhysicsBody, scene)
            vehicle.numberOfFramesToPredict = 60 //Number of frames to predict future upwards orientation if airborne
            vehicle.predictionRatio = 0; //[0-1]How quickly to correct angular velocity towards future orientation. 0 = disabled
            // --------------------
            // ホイールのメッシュ
            let wheelMesh = BABYLON.MeshBuilder.CreateCylinder("WheelMesh", {height:0.3, diameter:0.4})
            wheelMesh.material = new BABYLON.StandardMaterial("");
            wheelMesh.material.diffuseColor = BABYLON.Color3.Gray();
            wheelMesh.material.wireframe=1;
            wheelMeshes = [wheelMesh, wheelMesh.createInstance(1), wheelMesh.createInstance(2), wheelMesh.createInstance(3)]
            wheelMeshes.forEach(mesh => {
                mesh.rotationQuaternion = new BABYLON.Quaternion();
                mesh.layerMask = 0x10000000;
            })
            vehicle._wheelMeshes = wheelMeshes;
            // ホイール・サスペンションのパラメータ
            let wheelConfig = {
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
            let chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.emissiveColor = BABYLON.Color3.Yellow();
            chassisMesh.material.alpha=0.7;
            chassisMesh.position.y = 5;
            chassisMesh.position.x = 0;
            chassisMesh.rotationQuaternion = new BABYLON.Quaternion();
            chassisMesh.layerMask = 0x10000000;
            let chassisPhysicsShape = new BABYLON.PhysicsShapeConvexHull(chassisMesh, scene);
            let chassisPhysicsBody = new BABYLON.PhysicsBody(chassisMesh, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
            chassisPhysicsBody.shape = chassisPhysicsShape
            chassisPhysicsBody.setMassProperties({
                centerOfMass: new BABYLON.Vector3(0, -0.5, 0)
            })
            chassisPhysicsShape.filterMembershipMask = 2
            // position で移動させるために
            chassisPhysicsBody.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            chassisPhysicsBody.disablePreStep = false;
            // --------------------
            // camera2用メッシュ
            let meshMy4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:7.5, radiusTop:2.5});
            meshMy4c2.position.y += 4;
            meshMy4c2.material = new BABYLON.StandardMaterial("mat", scene);
            meshMy4c2.material.emissiveColor = BABYLON.Color3.Yellow();
            meshMy4c2.layerMask = 0x20000000;
            meshMy4c2.parent = chassisMesh;
            // カメラの視点用
            let mesh4c2view = BABYLON.MeshBuilder.CreateBox("", {size:1});
            mesh4c2view.position.y += 10;
            mesh4c2view.material = new BABYLON.StandardMaterial("mat", scene);
            mesh4c2view.alpha = 0;
            mesh4c2view.parent = chassisMesh;
            chassisMesh._4c2 = mesh4c2view;
            // --------------------
            // 車のモデル（RaycastVehicle
            let vehicle = new Vehicle2.RaycastVehicle(chassisPhysicsBody, scene)
            vehicle.numberOfFramesToPredict = 60 //Number of frames to predict future upwards orientation if airborne
            vehicle.predictionRatio = 0; //[0-1]How quickly to correct angular velocity towards future orientation. 0 = disabled
            // --------------------
            // ホイールのメッシュ
            let wheelMesh = BABYLON.MeshBuilder.CreateCylinder("WheelMesh", {height:0.3, diameter:0.4})
            wheelMesh.material = new BABYLON.StandardMaterial("");
            wheelMesh.material.diffuseColor = BABYLON.Color3.Gray();
            wheelMesh.material.wireframe=1;
            wheelMeshes = [wheelMesh, wheelMesh.createInstance(1), wheelMesh.createInstance(2), wheelMesh.createInstance(3)]
            wheelMeshes.forEach(mesh => {
                mesh.rotationQuaternion = new BABYLON.Quaternion()
                mesh.layerMask = 0x10000000;
            })
            vehicle._wheelMeshes = wheelMeshes;
            // ホイール・サスペンションのパラメータ
            // let wpx = 0.49+0.1, wpz = 0.7;
            let wpx = 0.49, wpz = 0.7;
            let wheelConfig = {
                positionLocal:new BABYLON.Vector3(wpx, 0, -wpz),//Local connection point on the chassis
                suspensionRestLength:0.83, // !!! 0.8,                //Rest length when suspension is fully decompressed
                suspensionForce:9000, // 10000,                   //Max force to apply to the suspension/spring 
                suspensionDamping:0.14, // 0.15,                  //[0-1] Damper force in percentage of suspensionForce
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
                rotationMultiplier:0.1,                   //How fast to spin the wheel
                brakeForce:200,  // def:500
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
            // RaycastVehicle
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            let chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.emissiveColor = BABYLON.Color3.Red();
            chassisMesh.material.alpha=0.7;
            chassisMesh.position.y = 5;
            chassisMesh.position.x = 0;
            chassisMesh.rotationQuaternion = new BABYLON.Quaternion();
            chassisMesh.layerMask = 0x10000000;
            let chassisPhysicsShape = new BABYLON.PhysicsShapeConvexHull(chassisMesh, scene);
            let chassisPhysicsBody = new BABYLON.PhysicsBody(chassisMesh, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
            chassisPhysicsBody.shape = chassisPhysicsShape
            chassisPhysicsBody.setMassProperties({
                centerOfMass: new BABYLON.Vector3(0, -0.5, 0)
            })
            chassisPhysicsShape.filterMembershipMask = 2
            // position で移動させるために
            chassisPhysicsBody.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            chassisPhysicsBody.disablePreStep = false;
            // --------------------
            // camera2用メッシュ
            let meshMy4c2 = new BABYLON.MeshBuilder.CreateCapsule("capsule", {radius:0.1, height:7.5, radiusTop:2.5});
            meshMy4c2.position.y += 4;
            meshMy4c2.material = new BABYLON.StandardMaterial("mat", scene);
            meshMy4c2.material.emissiveColor = BABYLON.Color3.Yellow();
            meshMy4c2.layerMask = 0x20000000;
            meshMy4c2.parent = chassisMesh;
            // カメラの視点用
            let mesh4c2view = BABYLON.MeshBuilder.CreateBox("", {size:1});
            mesh4c2view.position.y += 10;
            mesh4c2view.material = new BABYLON.StandardMaterial("mat", scene);
            mesh4c2view.alpha = 0;
            mesh4c2view.parent = chassisMesh;
            chassisMesh._4c2 = mesh4c2view;
            // --------------------
            // 車のモデル（RaycastVehicle
            let vehicle = new Vehicle2.RaycastVehicle(chassisPhysicsBody, scene)
            vehicle.numberOfFramesToPredict = 60 //Number of frames to predict future upwards orientation if airborne
            vehicle.predictionRatio = 0; //[0-1]How quickly to correct angular velocity towards future orientation. 0 = disabled
            // --------------------
            // ホイールのメッシュ
            let wheelMesh = BABYLON.MeshBuilder.CreateCylinder("WheelMesh", {height:0.3, diameter:0.4})
            wheelMesh.material = new BABYLON.StandardMaterial("");
            wheelMesh.material.diffuseColor = BABYLON.Color3.Gray();
            wheelMesh.material.wireframe=1;
            wheelMeshes = [wheelMesh, wheelMesh.createInstance(1), wheelMesh.createInstance(2), wheelMesh.createInstance(3)]
            wheelMeshes.forEach(mesh => {
                mesh.rotationQuaternion = new BABYLON.Quaternion();
                mesh.layerMask = 0x10000000;
            })
            vehicle._wheelMeshes = wheelMeshes;
            // ホイール・サスペンションのパラメータ
            let wheelConfig = {
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
                // sideForce:6, // ski な感じ
                // sideForce:10, // power-drift & parallel turn
                sideForce:20,
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
            vehicle._maxVehicleForce = 2200
            vehicle._maxSteerValue = 0.2; // 0.6 
            vehicle._steeringIncrement = 0.005
            vehicle._steerRecover = 0.05
            // vehicle._forwardForce = 0
            vehicle._steerValue = 0
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
            // vehicle._steerDirection = 0
        }


        if (typeof(myMesh._vehicle) === 'undefined') {
            myMesh._vehicle = null;
        }

        return myMesh
    }

    // // let iframe=0;
    // // imymesh=12用パラメータ
    // const maxVehicleForce = 2200
    // const maxSteerValue = 0.6 
    // const steeringIncrement = 0.005
    // const steerRecover = 0.05
    // let forwardForce = 0
    // let steerValue = 0
    // let steerDirection = 0


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
                // // myAgg.body.applyForce(vdir, myMesh.absolutePosition);
                // myMesh._agg.body.applyImpulse(vdir, myMesh.absolutePosition);
            }
            if (updownForce != 0) {
                let vdir = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                const vScale = 0.5; // 1.0;
                vdir = vdir.scale(updownForce*vScale*vquick);
                myMesh.position.addInPlace(vdir);
                // myMesh._agg.body.applyImpulse(vdir, myMesh.absolutePosition);
            }
            //
            if (steerDirection != 0) {
                let qRot = BABYLON.Quaternion.FromEulerAngles(0, 0.02*steerDirection, 0);
                myMesh.rotationQuaternion = qRot.multiply(quat);
            }

            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }

        // } else if ((imymesh == 3) || (imymesh == 4)) {
        } else if ((imymesh >= 3) && (imymesh <= 5)) {
            // RaycastVehicle

            let forwardForce = 0;
            // if (keyAction.forward) forwardForce = 1
            // if (keyAction.backward) forwardForce = -1
            if (keyAction.forward) forwardForce = keyAction.forward;
            if (keyAction.backward) forwardForce = -keyAction.backward
            let steerDirection = 0;
            // if (keyAction.left) steerDirection = -1
            // if (keyAction.right) steerDirection = 1
            if (keyAction.left) steerDirection = -keyAction.left;
            if (keyAction.right) steerDirection = keyAction.right;
            let vquick = (keyAction.quick) ? 3 : 1;
            // let vbrake = (keyAction.brake) ? 1 : 0;
            let vbrake = (keyAction.brake) ? keyAction.brake : 0;
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


            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }



        } else {
console.log("under cunstrunction");
        }

        if (imymesh != 0) {
            let speed = getSpeed();
            setText1(speed);
        }
    }

    scene.onBeforeRenderObservable.add(()=>{
        updateMyMesh();
    })

    let resetPostureMyMesh = function() {
        if ((imymesh >= 3) && (imymesh <= 5)) {
            // RaycastVehicle
            let vehicle = myMesh._vehicle;
            vehicle.doResetPosture();

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
        // } else if ((imymesh == 3) ||(imymesh == 4)) {
        } else if ((imymesh >= 3) && (imymesh <= 5)) {
            speed = myMesh._vehicle.speed;
        // } else if (imymesh == 8) {
        //     speed = myMesh._vehicle.speed;
        } else {
            let vec = myMesh._agg.body.getLinearVelocity();
            speed = vec.length();
        }
        return speed;
    }

    // // // デバッグ表示(物理メッシュ／白線表示)
    // // if (0) {
    // // var viewer = new BABYLON.PhysicsViewer();
    // // scene.meshes.forEach((mesh) => {
    // //     if (mesh.physicsBody) {
    // //         viewer.showBody(mesh.physicsBody);
    // //     }
    // // });
    // // }
    // // if (0) {
    // //     physicsViewer = new BABYLON.Debug.PhysicsViewer();
    // //     for (const mesh of scene.rootNodes) {
    // //         if (mesh.physicsBody) {
    // //             const debugMesh = physicsViewer.showBody(mesh.physicsBody);
    // //         }
    // //     }
    // // }

    // // if(0) {
    // //     // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    // //     const localAxes = new BABYLON.AxesViewer(scene, 1.0);
    // //     localAxes.xAxis.parent = myMesh;
    // //     localAxes.yAxis.parent = myMesh;
    // //     localAxes.zAxis.parent = myMesh;
    // // }

    // // 0: key-board
    // // 2: gamepad
    // let idevice=0;

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
    let cooltime_act = 0, cooltime_actIni = 20, vforceBase = 0.04, vforce = 0.04, bDash=3, jumpforce = 120;

    let keyAction = {forward:0, back:0, right:0, left:0, LR:0, up:0, down:0, brake:0, quick:0, reset:0, resetCooltime:0};
    scene.registerAfterRender(function() {
        if (idevice == 0) {
        keyAction.quick=false;
        if (map["ctrl"]) {
            keyAction.quick=true;
        }
        // if (map["ArrowUp"]) {
        if ((map["ArrowUp"]) || (map["w"])) {
            keyAction.forward = 1;
        } else {
            keyAction.forward = 0;
        }
        // if (map["ArrowDown"]) {
        if ((map["ArrowDown"]) || (map["s"])) {
            keyAction.backward = 1;
        } else {
            keyAction.backward = 0;
        }
        // if (map["w"]) {
        //     keyAction.up = 1;
        // } else {
        //     keyAction.up = 0;
        // }
        // if (map["s"]) {
        //     keyAction.down = 1;
        // } else {
        //     keyAction.down = 0;
        // }
        keyAction.LR = 0;
        keyAction.left = 0;
        keyAction.right = 0;
        if ((map["a"] || map["ArrowLeft"]) && (map["d"] || map["ArrowRight"])) {
            keyAction.LR = 1; //roll処理用
        } else if (map["a"] || map["ArrowLeft"]) {
            keyAction.left = 1;
        } else if (map["d"] || map["ArrowRight"]) {
            keyAction.right = 1;
        }
        keyAction.brake = 0;
        if (map[" "]) {
            keyAction.brake = 1;
            // if (idevice >= 2) {
            //     idevice -= 2;
            // }
        }
        }

        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["1"]) {
                cooltime_act = cooltime_actIni;
                idevice = 0; // keyboard
console.log("idevice=",idevice," keyboard");
            }
            if (map["2"]) {
                cooltime_act = cooltime_actIni;
                idevice = 2; // gamepad
console.log("idevice=",idevice," gamepad");
            }

            if (map["Enter"]) {
                cooltime_act = cooltime_actIni;
                keyAction.reset = true;
            }
            if (map["c"] || map["C"]) {
                cooltime_act = cooltime_actIni;
                if (map["C"]) {
                    let i = icameralist.indexOf(icamera);
                    console.assert(i >= 0);
                    i = (i-1+icameralist.length) % icameralist.length;
                    icamera=icameralist[i];
                } else {
                    let i = icameralist.indexOf(icamera);
                    console.assert(i >= 0);
                    i = (i+1) % icameralist.length;
                    icamera=icameralist[i];
                }
                changeCamera(icamera);
            }
            if (map["v"] || map["V"]) {
                cooltime_act = cooltime_actIni;
                if (map["V"]) {
                    let i = icameralist2.indexOf(icamera2);
                    console.assert(i >= 0);
                    i = (i-1+icameralist2.length) % icameralist2.length;
                    icamera2=icameralist2[i];
                } else {
                    let i = icameralist2.indexOf(icamera2);
                    console.assert(i >= 0);
                    i = (i+1) % icameralist2.length;
                    icamera2=icameralist2[i];
                }
                changeCamera2(icamera2);
            }

            if (map["n"] || map["N"] || map["p"] || map["P"] || map["b"] || map["B"]) {
                cooltime_act = cooltime_actIni;
                if ((map["N"] || map["p"] || map["b"])) {
                    istage = (istage+nstage-1)%nstage;
                } else {
                    istage = (istage+1)%nstage;
                }
                createStage(istage);
                resetMyPosi();
                // resetAllAgent(meshes4CNS, scene);
            }
            if (map["m"] || map["M"]) {
                cooltime_act = cooltime_actIni;
                // imymesh=(imymesh+1)%nmymesh;
                // if (map["M"] || map["shift"]) {
                if (map["M"]) {
                    let i = mymeshList.indexOf(imymesh);
                    console.assert(i >= 0);
                    i = (i-1+mymeshList.length) % mymeshList.length;
                    imymesh=mymeshList[i];
                } else {
                    let i = mymeshList.indexOf(imymesh);
                    console.assert(i >= 0);
                    i = (i+1) % mymeshList.length;
                    // ++i;
                    // if (i >= mymeshList.length) { i = 0; }
                    imymesh=mymeshList[i];
                }
                createMyMesh();
                changeCamera(icamera);
                changeCamera2(icamera2);
                resetMyPosi();
            }
            if (map["r"]) { // 'r'
                cooltime_act = cooltime_actIni;
                resetMyPosi();
            }
            if ((myMesh._vehicle != null) && (map["d"] || map["D"])) {
                cooltime_act = cooltime_actIni;
                // if (map["D"] || map["shift"]) {
                if (map["D"]) {
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

    // --------------------------------------------------

    // ゲームパッドのオペレーションを追加
    //Create gamepad to handle controller connect/disconnect
    var gamepadManager = new BABYLON.GamepadManager();
    
    gamepadManager.onGamepadConnectedObservable.add((gamepad, state)=>{
        //Handle gamepad types
        if (gamepad instanceof BABYLON.Xbox360Pad) {
            console.log(" Xbox360Button...");
        } else if (gamepad instanceof BABYLON.DualShockPad) {
            console.log(" DualShock...");
        } else if (gamepad instanceof BABYLON.GenericPad) {
            // console.log(" GenericPad...");
        } else if (gamepad instanceof BABYLON.PoseEnabledController) {
            console.log(" PoseEnabledController...");
        }
        // 以下、BABYLON.GenericPad の前提で実装

        gamepad.onButtonDownObservable.add((button, state)=>{
            if (idevice<=1){
                idevice+=2;
            } else if (idevice>=4){
                idevice-=2;
            }

            if (button == 4) { // LB/5
                cooltime_act = cooltime_actIni;
                    let i = icameralist.indexOf(icamera);
                    console.assert(i >= 0);
                    i = (i+1) % icameralist.length;
                    icamera=icameralist[i];
                changeCamera(icamera);
            } else if (button == 5) { // RB/6
                cooltime_act = cooltime_actIni;
                    let i = icameralist2.indexOf(icamera2);
                    console.assert(i >= 0);
                    i = (i+1) % icameralist2.length;
                    icamera2=icameralist2[i];
                changeCamera2(icamera2);

            } else if (button == 6) { // LT/6
                cooltime_act = cooltime_actIni;
                    istage = (istage+nstage-1)%nstage;
                createStage(istage);
                resetMyPosi();
            } else if (button == 7) { // RT/7
                cooltime_act = cooltime_actIni;
                    istage = (istage+1)%nstage;
                createStage(istage);
                resetMyPosi();

            } else if (button == 8) { // back
                idevice = ((idevice+1)%2)+2;
                    console.log("gamepad-mode");
            } else if (button == 9) { // start
                cooltime_act = cooltime_actIni;
                // help表示のON/OFF
                changeUsageView();
            }

            {
                // 十字キー
                if (button==14) { // left
                    keyAction.left = 1;
                }
                if (button==15) { // right
                    keyAction.right = 1;
                }

                // ボタン
                if (button==0) { // A
                    keyAction.forward = 1;
                }
                if (button==1) { // B
                    keyAction.quick = 1;
                }
                if (button==2) { // X
                    keyAction.brake = 1;
                }
                if (button==3) { // Y
                    keyAction.backward = 1;
                }

            }
        })

        gamepad.onButtonUpObservable.add((button, state)=>{
            if (idevice==2) {
                // 十字キー、ボタン
                if (button==14) { // left
                    keyAction.left = 0;
                }
                if (button==15) { // right
                    keyAction.right = 0;
                }

                if (button==0) { // A
                    keyAction.forward = 0;
                }
                if (button==1) { // B
                    keyAction.quick = 0;
                }
                if (button==2) { // X
                    keyAction.brake = 0;
                }
                if (button==3) { // Y
                    keyAction.backward = 0;
                }
            }
        })

        //Stick events
        gamepad.onleftstickchanged((values)=>{
            // 左スティック
            if (idevice==2) {
                // 左右・旋回
                    // console.log("左スティック：右", Math.floor(values.x*100)/100);
                    keyAction.right = values.x;
                    keyAction.left = 0;
                // if (values.x > 0) {
                //     // console.log("左スティック：右", Math.floor(values.x*100)/100);
                //     keyAction.right = values.x;
                // } else {
                //     // console.log("左スティック：左", Math.floor(values.x*100)/100);
                //     keyAction.left = -values.x;
                // }
            }
        });

        gamepad.onrightstickchanged((values)=>{
            // 右スティック
            if (idevice==2) {
                // 上下・前進/ブレーキ
                if (values.y > 0) {
                    // 右スティック：下
                    // console.log("右スティック：下")
                    keyAction.brake = values.y;
                    keyAction.forward = 0;
                    keyAction.backward = 0;
                } else {
                    // 右スティック：上
                    //console.log("右スティック：上")
                    keyAction.forward = -values.y;
                    keyAction.backward = 0;
                    keyAction.brake = 0;
                }
            }
        });

    })

    gamepadManager.onGamepadDisconnectedObservable.add((gamepad, state)=>{
        console.log(" Disconnected", gamepad.id );
    })


    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    advancedTexture.layer.layerMask = 0x10000000;
    // advancedTexture.layer.layerMask = 0x30000000;
    // advancedTexture.zIndex = 1;

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
                +"(W,S): Up/Down\n"
                +"(A,D): Turn Left/Right\n"
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
        // {
        //     let button = BABYLON.GUI.Button.CreateSimpleButton("but1", "Close");
        //     button.width = "120px";
        //     button.height = "30px";
        //     button.color = "white";
        //     button.fontSize = 16;
        //     button.background = "DarkGray";
        //     button.onPointerUpObservable.add(function() {
        //         guiUsageRect.isVisible = false;
        //     });
        //     grid.addControl(button, 1, 0);
        // }
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
                createStage(istage);
                resetMyPosi();
                // resetAllAgent(meshes4CNS, scene);
                changeCourseView();
            });
            r2panel.addControl(button);
            guiCourseRect._obj.push(button);
        }
    }

    var changeCourseView = function() {
console.log("changeCourseView");
        // // {
        // //     while (scene.activeCameras.length > 0) {
        // //         scene.activeCameras.pop();
        // //     }
        // //     scene.activeCameras.push(camera);
        // // }

        if (guiCourseRect.isVisible) {
            guiCourseRect.isVisible = false;
            // camera2の表示を戻す
            console.log("camera2の表示を戻す");
            changeCamera2(icamera2);
        } else {
            guiCourseRect.isVisible = true;
            for (let obj of guiCourseRect._obj) {
                obj.background = "black";
            }
            guiCourseRect._obj[istage].background = "darkgray";
            // camera2を一時的に消す
            console.log("camera2を一時的に消す");
            changeCamera2(0);
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
        // guiIconCourse.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        guiIconCourse.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        guiIconCourse.zIndex = 1;
        guiIconCourse.onPointerUpObservable.add(function() {
// console.log("call changeCourseView")
            changeCourseView();
        });
        advancedTexture.addControl(guiIconCourse);   
    }

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
    // xx text1.layer.layerMask = 0x30000000;
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
    // // text2.top = "-20px";
    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
//    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    // xx text2.layer.layerMask = 0x10000000;
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

    createStage(istage);
    createMyMesh();
    // resetAllAgent(meshes4CNS, scene);

    changeCamera(icamera);
    changeCamera2(icamera2);
    resetMyPosi();



    return scene;
}



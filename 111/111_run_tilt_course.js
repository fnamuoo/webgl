// Babylon.js で物理演算(havok)：extrudeのねじれたコースを走る

//  - カーソル上/(w)              .. 前進
//  - カーソル下/(s)              .. 後進
//  - カーソル右左/(a,d)          .. 旋回
//  - Ctrl＋カーソル右左/(a,d)    .. 急旋回
//  - space                       .. ブレーキ
//  - r                           .. スタート位置に移動
//  - (c/C[=shift+c])             .. カメラ変更
//  - (m/M[=shift+m])             .. 移動体（ボード／車）変更

const R5 = Math.PI/36;
const R90 = Math.PI/2;
const R180 = Math.PI;
const R270 = Math.PI*3/2;
const R360 = Math.PI*2;


// const SCRIPT_URL2 = "./Vehicle_draft2.js";

// // const SCRIPT_URL11 = "../090/CourseData.js";
// const SCRIPT_URL11 = "./CourseData.js";

// const myTextPath3 = "textures/pipo-charachip017a.png"; // メイド

// const coursePath="textures/course/BoxySVG_test1_3_400x300.png"

// const goalPath ="textures/amiga.jpg";

// const skyboxTextPath1 = "textures/skybox";
// const skyboxTextPath2 = "textures/skybox2";
// const skyboxTextPath3 = "textures/skybox3";
// const skyboxTextPath4 = "textures/skybox4";
// const skyboxTextPath5 = "textures/TropicalSunnyDay";

// // const iconPath1 = "textures/icon_question.png";
// // const iconPath2 = "textures/icon_gear2.png";
// // const iconPath3 = "textures/icon_golf6.png";
// // const dbase = "textures/course3/"

// const iconPath1 = "../099/textures/icon_question.png";
// const iconPath2 = "../099/textures/icon_gear2.png";
// const iconPath3 = "../099/textures/icon_golf6.png";
// const dbase = "course3/"

// ----------------------------------------
const SCRIPT_URL2 = "../105/Vehicle2.js";
const SCRIPT_URL11 = "../090/CourseData.js";

const myTextPath3 = "../093/textures/pipo-charachip017a.png"; // メイド

const coursePath="../066/textures/course/BoxySVG_test1_3_400x300.png"
const goalPath ="../078/textures/amiga.jpg";

const skyboxTextPath1 = "textures/skybox";
const skyboxTextPath2 = "textures/skybox2";
const skyboxTextPath3 = "textures/skybox3";
const skyboxTextPath4 = "textures/skybox4";
const skyboxTextPath5 = "textures/TropicalSunnyDay";

const iconPath1 = "../099/textures/icon_question.png";
const iconPath2 = "../099/textures/icon_gear2.png";
const iconPath3 = "../099/textures/icon_golf6.png";
const dbase = "course3/"

// // ----------------------------------------
// const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/105/Vehicle2.js";
// const SCRIPT_URL11 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/090/CourseData.js";

// const myTextPath3 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/093/textures/pipo-charachip017a.png"; // メイド

// const coursePath="https://raw.githubusercontent.com/fnamuoo/webgl/main/066/textures/course/BoxySVG_test1_3_400x300.png"
// const goalPath ="https://raw.githubusercontent.com/fnamuoo/webgl/main/078/textures/amiga.jpg";

// const skyboxTextPath1 = "textures/skybox";
// const skyboxTextPath2 = "textures/skybox2";
// const skyboxTextPath3 = "textures/skybox3";
// const skyboxTextPath4 = "textures/skybox4";
// const skyboxTextPath5 = "textures/TropicalSunnyDay";

// const iconPath1 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/icon_question.png";
// const iconPath2 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/icon_gear2.png";
// const iconPath3 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/icon_golf6.png";
// const dbase = "https://raw.githubusercontent.com/fnamuoo/webgl/main/111/course3/"


let Vehicle2 = null;
await import(SCRIPT_URL2).then((obj) => { Vehicle2 = obj; });
let CourseData = null;
await import(SCRIPT_URL11).then((obj) => { CourseData = obj; });

// let skyboxTextPath = "textures/TropicalSunnyDay";
const skyboxTextPathList = [skyboxTextPath1,skyboxTextPath2,skyboxTextPath3,skyboxTextPath4,skyboxTextPath5];
// let skyboxType=-1; // -1:rand, 0-4: 固定
let skyboxType=4; // -1:rand, 0-4: 固定

let istage=15;

const courseInfoList = [
    // istage, type, label, fpath

    // // // debug. コース形状の画像
    // [200801, 0, "MotegiSuperSpeedway(type1)", "pic/099_ss_100.jpg"], // 00 : 200801
    // [200802, 0, "MotegiSuperSpeedway(type2)", "pic/099_ss_100.jpg"], // 00 : 200801
    // [200803, 0, "MotegiSuperSpeedway(type3)", "pic/099_ss_100.jpg"], // 00 : 200801
    // [200804, 0, "MotegiSuperSpeedway(type4)", "pic/099_ss_100.jpg"], // 00 : 200801

    [200802, 0, "MotegiSuperSpeedway", dbase+"200802.jpg"], // 00
    [200901, 0, "DaytonaSpeedway"    , dbase+"200901.jpg"],
    [200101, 0, "HighSpeedRing"      , dbase+"200101.jpg"], // 02
    [200202, 0, "AutumnRing"         , dbase+"200202.jpg"], // 03
    [200301, 0, "CotedAzur"          , dbase+"200301.jpg"],

    [200411, 0, "Suzuka"           , dbase+"200411.jpg"], // 5
    [200711, 0, "mm2024_08_kanasai", dbase+"200711.jpg"],
    [200614, 0, "mm2024_04_tyubu"  , dbase+"200614.jpg"],
    [200613, 0, "mm2024_04_tyubu(L)"  , dbase+"200613.jpg"], // 8
    [200512, 0, "mm2024_00_zenkoku", dbase+"200512.jpg"], // 9
    [200511, 0, "mm2024_00_zenkoku(L)", dbase+"200511.jpg"], // 10
    // 片道
    [200204, 0, "AutumnRing_HillClimb", dbase+"200204.jpg"],
    [200205, 0, "AutumnRing_DownHill" , dbase+"200205.jpg"],

    [3101, 1, "スライダーコース：円柱", dbase+"3101.jpg"], // 13
    [3201, 1, "やま：凸"        , dbase+"3201.jpg"],

    [4101, 1, "コーラム模様:4101", dbase+"4101.jpg"], // 15
    [4102, 1, "コーラム模様:4102", dbase+"4102.jpg"],
    [4103, 1, "コーラム模様:4103", dbase+"4103.jpg"], // 17
    [4104, 1, "コーラム模様:4104", dbase+"4104.jpg"], // 18
    [4105, 1, "コーラム模様:4105", dbase+"4105.jpg"],
    [4106, 1, "コーラム模様:4106", dbase+"4106.jpg"], // 20
    [4107, 1, "コーラム模様:4107", dbase+"4107.jpg"], // 21
    [7102, 1, "✕"          , dbase+"7102.jpg"],
    [7103, 1, "✕*2"        , dbase+"7103.jpg"],
    [7111, 1, "凹"          , dbase+"7111.jpg"],
    [7113, 1, "８の字"      , dbase+"7113.jpg"], // 25
    [7114, 1, "横ループ"    , dbase+"7114.jpg"],
    [7115, 1, "Y字：クランク＋２車線", dbase+"7115.jpg"], // 27
    [7119, 1, "スラローム"    , dbase+"7119.jpg"], // 28
    [3104, 1, "ランダム１"      , dbase+"3104.jpg"],
    [3103, 1, "ランダム２（難）", dbase+"3103.jpg"], // 30
    [7121, 1, "フープス／凹凸", dbase+"7121.jpg"],
    [7120, 1, "縦ループ"      , dbase+"7120.jpg"], // 32

];

let nstage = courseInfoList.length;


export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let camera = null, myMesh=null;
    let icamera = 6, ncamera = 8;
    let cameralist = [];
    var changeCamera = function(icamera) {
console.log("icamera=",icamera)
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(5, 20,-10), scene);
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
            camera.maxCameraSpeed = 30;
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
                camera.maxCameraSpeed = 30;
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
                camera.rotationOffset = 180;
                camera.radius = 0.5;
                camera.heightOffset = 0.1;
                camera.cameraAcceleration = 0.2;
                camera.maxCameraSpeed = 30;
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
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
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
                camera.maxCameraSpeed = 30;
                camera.attachControl(canvas, true);
                camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
                cameralist.push(camera)
            }
            {
                let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
                camera.rotationOffset = 180;
                camera.radius = 0.5;
                camera.heightOffset = 0.1;
                camera.cameraAcceleration = 0.2;
                camera.maxCameraSpeed = 30;
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
            // camera.rotationQuaternion = quat.clone();
            camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        }
        if (icamera == 7) {
            {
                let quat = myMesh.rotationQuaternion;
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

    // ----------------------------------------
    // 093_board.js

    let createCourseData = function (geo) {
        geo.data = [];
        if (geo.tubeType == 'coil') {
            // 円（コイル）、等幅で上昇
            let nloop = typeof(geo.nloop) !== 'undefined' ? geo.nloop : 5;
            let loopy = typeof(geo.loopy) !== 'undefined' ? geo.loopy : 30;//１週分での高さ
            let r = typeof(geo.r) !== 'undefined' ? geo.r : 100;
            let n = nloop*72, stepy = loopy/72;
            for (let i = 0; i < n; ++i) {
                irad = -i * R5;
                x = r*Math.cos(irad); y = i*stepy; z = r*Math.sin(irad);
                geo.data.push([x, z, y]);
            }

        } else if (geo.tubeType == 'rand') {
            // 乱数（等確率）で右／左の円弧(90度ごと)、等幅で上昇
            let narc = typeof(geo.narc) !== 'undefined' ? geo.narc : 40;
            let arcy = typeof(geo.arcy) !== 'undefined' ? geo.arcy : 4;//１回転ごとの高さ
            let arcDiv = typeof(geo.arcDiv) !== 'undefined' ? geo.arcDiv : 30; // 18;
            let Rx = R90 / arcDiv;
            let r = typeof(geo.r) !== 'undefined' ? geo.r : 50;
            let stepy = arcy/18, jarc = 0, x0=0, z0=0, arcType, arcTypeOld = true, i = 0;
            let disTHMAX = 400**2, disTHMIN = 125**2, dirAuto=false;
            for (let iarc = 0; iarc < narc; ++iarc) {
                arcType = (Math.random() < 0.5);
                if (geo.data.length > 0) {
                    // 移動先の座標を推定してきめる
                    // 一定距離（最大）を超えたら原点に向かうよう、一定距離（最小）まで近づいたら解除する
                    let p = geo.data.slice(-1)[0];//パイプ末尾の位置
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
                        irad = j * Rx + jarc*R90;
                        x = x0 + r*Math.cos(irad); y = i*stepy; z = z0 + r*Math.sin(irad);
                        geo.data.push([x, z, y]);
                        ++i;
                    }
                    jarc = (jarc+1)%4;
                } else {
                    // 左円弧
                    if (arcTypeOld != arcType) {
                        x0 += 2*r*Math.cos(jarc*R90); z0 += 2*r*Math.sin(jarc*R90);
                    }
                    for (let j = 0; j < arcDiv; ++j) {
                        irad = -j*Rx + jarc*R90 + R180;
                        x = x0 + r*Math.cos(irad); y = i*stepy; z = z0 + r*Math.sin(irad);
                        geo.data.push([x, z, y]);
                        ++i;
                    }
                    jarc = (jarc+3)%4;
                }
                arcTypeOld = arcType;
            }

        } else if (geo.tubeType == 'rand2') {
            // 乱数（等確率）で３種（直進、左右の旋回）、等幅で上昇
            // 進行方向ベクトルと旋回のクォータニオンで経路を作成
            let roty = R5, nloop = 15;
            let narc = typeof(geo.narc) !== 'undefined' ? geo.narc : 60;
            let stepy = typeof(geo.stepy) !== 'undefined' ? geo.stepy : 0.2;
            let vst = typeof(geo.vst) !== 'undefined' ? geo.vst : 4;
            const quatL = BABYLON.Quaternion.FromEulerAngles(0, roty, 0);
            const quatR = BABYLON.Quaternion.FromEulerAngles(0, -roty, 0);
            const quat0 = new BABYLON.Quaternion();
            let vposi = new BABYLON.Vector3(0, 0, 0); // 座標位置(x,zのみ利用)
            let vdir = new BABYLON.Vector3(0, 0, vst); // 進行方向ベクトル
            let jarc = 0, i = 0, x=0, y=0, z=0, idir, quat;
            let disTHMAX = 400**2, disTHMIN = 60**2, dirAuto=false;
            for (let iarc = 0; iarc < narc; ++iarc) {
                idir = Math.floor(Math.random()*3);
                if (geo.data.length > 0) {
                    // 移動先の座標を推定してきめる
                    let p = geo.data.slice(-1)[0];//パイプ末尾の位置
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
                        let vposiN=vposi.clone(), vdirN=vdir.clone();
                        let vposiL=vposi.clone(), vdirL=vdir.clone();
                        let vposiR=vposi.clone(), vdirR=vdir.clone();
                        for (let iloop = 0; iloop < nloop; ++iloop) {
                            vdirN = vdirN.applyRotationQuaternion(quat0); // 進行方向ベクトルの方位を変える
                            vposiN.addInPlace(vdirN);
                            vdirR = vdirN.applyRotationQuaternion(quatR); // 進行方向ベクトルの方位を変える
                            vposiR.addInPlace(vdirR);
                            vdirL = vdirL.applyRotationQuaternion(quatL); // 進行方向ベクトルの方位を変える
                            vposiL.addInPlace(vdirL);
                        }
                        let disN = (vposiN.x)**2 + (vposiN.z)**2;
                        let disR = (vposiR.x)**2 + (vposiR.z)**2;
                        let disL = (vposiL.x)**2 + (vposiL.z)**2;
                        if (disN<disR) {
                            if (disN<disL) {
                                // N < L/R
                                idir = 2; // N
                            } else {
                                // L < N < R
                                idir = 0 ;// L
                            }
                        } else if (disL<disR) {
                            // L < R < N
                            idir = 0; // L
                        } else {
                            // R < L/N
                            idir = 1; // R
                        }
                    }
                }
                quat = quat0; // 直進
                if (idir == 0) {
                    // 左折
                    quat = quatL;
                } else if (idir == 1) {
                    // 右折
                    quat = quatR;
                }
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    vdir = vdir.applyRotationQuaternion(quat); // 進行方向ベクトルの方位を変える
                    vposi.addInPlace(vdir);
                    geo.data.push([vposi.x, vposi.z, y]);
                    y += stepy;
                }
            }

        } else if (geo.tubeType == 'custom') {
            // rand　でつくったような形状をカスタマイズ作成できるように
            // ブロック単位の形状
            //
            // 種別
            // - 直線(高さを等間隔)
            // - 左折
            // - 右折
            // - 直線(高さをsin変化)
            // - 左折
            // - 右折
            // - 左折(半径を変化)：うずまき用
            // - 右折
            // - 縦ループ

            // 初期値をデフォルトとして用いる
            let meta0 = geo.metaInfo[0];
            // let [x,y,z] = typeof(meta0.xyz) !== 'undefined' ? meta0.xyz : [0,0,0]; //位置
            let [x,y,z] = typeof(meta0.xyz) !== 'undefined' ? meta0.xyz : [0,0,0]; //位置
//console.log("[x,y,z]=", [x,y,z]);
            if (typeof(meta0.xyz) !== 'undefined') {
//console.log("meta0.xyz=", meta0.xyz);
            }
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
            let x0,y0,z0 , xe,ye,ze, xstep,ystep,zstep, dir0,dirg,dire,dirstep, xg,yg,zg, yrad, yradstep;

            for (let meta of geo.metaInfo) {
                h = typeof(meta.h) !== 'undefined' ? meta.h : h; // 高さ
                rot = typeof(meta.rot) !== 'undefined' ? meta.rot : rot; //L/R時の回転角
                div = typeof(meta.div) !== 'undefined' ? meta.div : div; //分割数
                shape = typeof(meta.shape) !== 'undefined' ? meta.shape : shape; //形状
                nloop = typeof(meta.nloop) !== 'undefined' ? meta.nloop : nloop; //ループ回数
                size = typeof(meta.size) !== 'undefined' ? meta.size : size; // ブロック長
                size2 = typeof(meta.size2) !== 'undefined' ? meta.size2 : size; // ブロック長
                vrot = typeof(meta.vrot) !== 'undefined' ? meta.vrot : vrot;
                hshift = typeof(meta.hshift) !== 'undefined' ? meta.hshift : hshift;
                dirstep = rot/div;
                yradstep = R180/div;
                sizestep = (size2-size)/div;

                if (shape == "S" || shape == "s" || shape == "straight") {
                    //直進
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0 = x; y0 = y; z0 = z; dir0 = dir;
                        xe = x+size*Math.cos(dir);
                        ye = y+h;
                        ze = z+size*Math.sin(dir);
                        dire = dir;
                        xstep=(xe-x0)/div; zstep=(ze-z0)/div; ystep=(ye-y0)/div;
                        for (let i=0; i < div; ++i){
                            x = x0 + xstep*i;
                            y = y0 + ystep*i;
                            z = z0 + zstep*i;
                            geo.data.push([x, z, y]);
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                } else if (shape == "L" || shape == "l" || shape == "left") {
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir;
                        dirg=dir-R90; dire=dir0-rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+size*Math.cos(dir0-rot+R90); ze=zg+size*Math.sin(dir0-rot+R90); ye=y+h;
                        ystep = (ye-y0)/div;
                        for (let i=0; i < div; ++i){
                            dir=dir0-dirstep*i+R90;
                            x=xg+size*Math.cos(dir);
                            y=y0+ystep*i;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                } else if (shape == "R" || shape == "r" || shape == "right") {
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir;
                        dirg=dir+R90; dire=dir0+rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+size*Math.cos(dir0+rot-R90); ze=zg+size*Math.sin(dir0+rot-R90); ye=y+h;
                        ystep = (ye-y0)/div;
                        for (let i=0; i < div; ++i){
                            dir=dir0+dirstep*i-R90;
                            x=xg+size*Math.cos(dir);
                            y=y0+ystep*i;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                    // ----------------------------------------------------------------------
                    // 高さを sin で変化
                } else if (shape == "Ssin" || shape == "ssin" || shape == "slope") {
                    //直進 (なめらかな傾斜
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0 = x; y0 = y; z0 = z; dir0 = dir;
                        xe = x+size*Math.cos(dir);
                        ye = y+h;
                        ze = z+size*Math.sin(dir);
                        dire = dir;
                        xstep=(xe-x0)/div; zstep=(ze-z0)/div; ystep=(ye-y0)/div;
                        yrad = -R90;
                        for (let i=0; i < div; ++i){
                            x = x0 + xstep*i;
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z = z0 + zstep*i;
                            geo.data.push([x, z, y]);
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; }
                        if (dir>=R360) { dir-=R360; }
                    }

                } else if (shape == "Lsin" || shape == "lsin" || shape == "leftsin") {
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir;
                        dirg=dir-R90; dire=dir0-rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+size*Math.cos(dir0-rot+R90); ze=zg+size*Math.sin(dir0-rot+R90); ye=y+h;
                        yrad = -R90;
                        for (let i=0; i < div; ++i){
                            dir=dir0-dirstep*i+R90;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                } else if (shape == "Rsin" || shape == "rsin" || shape == "rightsin") {
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir;
                        dirg=dir+R90; dire=dir0+rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+size*Math.cos(dir0+rot-R90); ze=zg+size*Math.sin(dir0+rot-R90); ye=y+h;
                        yrad = -R90;
                        for (let i=0; i < div; ++i){
                            dir=dir0+dirstep*i-R90;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                    // ----------------------------------------------------------------------
                    // 半径を均一で変化

                } else if (shape == "LsinDR" || shape == "lsindr") {
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir; size0=size;
                        sizee=size2;
                        dirg=dir-R90; dire=dir0-rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+sizee*Math.cos(dir0-rot+R90); ze=zg+sizee*Math.sin(dir0-rot+R90); ye=y+h;
                        yrad = -R90;
                        for (let i=0; i < div; ++i){
                            dir=dir0-dirstep*i+R90;
                            size=size0+sizestep*i;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                        }
                        x = xe; y = ye; z = ze; dir=dire; size=sizee;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                } else if (shape == "RsinDR" || shape == "rsindr") {
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir; size0=size;
                        sizee=size2;
                        dirg=dir+R90; dire=dir0+rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+sizee*Math.cos(dir0+rot-R90); ze=zg+sizee*Math.sin(dir0+rot-R90); ye=y+h;
                        yrad = -R90;
                        for (let i=0; i < div; ++i){
                            dir=dir0+dirstep*i-R90;
                            size=size0+sizestep*i;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                        }
                        x = xe; y = ye; z = ze; dir=dire; size=sizee;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                    // ----------------------------------------------------------------------
                    // 縦ループ
                } else if (shape == "VLoop" || shape == "vloop") {
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
                        for (let i=0; i < div; ++i){
                            dirV=dirV0+vrotstep*i;
                            size=size0+sizestep*i;
                            xroll = 0;
                            yroll = size*Math.sin(dirV);
                            zroll = size*Math.cos(dirV);
                            hshift = hshifte*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            x=xg+zroll*Math.cos(dir)+hshift*Math.cos(dirR);
                            y=yg+yroll;
                            z=zg+zroll*Math.sin(dir)+hshift*Math.sin(dirR);
                            geo.data.push([x, z, y]);
                        }
                        x = xe; y = ye; z = ze; dir=dire; size=sizee;
                        if (Math.round(vrot-Math.round(vrot/R180)*R180)==0) {
                            dir = dir+vrot;
                        }
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }
                }

            }
            if (geo.isLoopCourse == false) {
                geo.data.push([x, z, y]);
            }

        }

        return geo;
    }

    const metaStageInfo = {

        // ------------------------------
        // snapshot用
        200801:{label:"MotegiSuperSpeedway",
                iy:0.05, scale:0.2, grndW:280, grndH:200, adjx:-120, adjz:80, cnsSpeedX:1, bubbleEnable:true,
                dtype:"xz", stageType:'extrude',
                // extRot: 0.01, // 左ねじ .. 左旋回時に内向きに
                // extRot:-0.01, // 右ねじ
                data :CourseData.DATA.MotegiSuperSpeedway_new.xz.slice(0, -3),
               },
        200802:{label:"MotegiSuperSpeedway",
                iy:0.05, scale:0.2, grndW:280, grndH:200, adjx:-120, adjz:80, cnsSpeedX:1, bubbleEnable:true,
                dtype:"xz", stageType:'extrude_2',
                data :CourseData.DATA.MotegiSuperSpeedway_new.xz.slice(0, -3),
               },
        200803:{label:"MotegiSuperSpeedway",
                iy:0.05, scale:0.2, grndW:280, grndH:200, adjx:-120, adjz:80, cnsSpeedX:1, bubbleEnable:true,
                dtype:"xz", stageType:'extrude_3',
                data :CourseData.DATA.MotegiSuperSpeedway_new.xz.slice(0, -3),
               },
        200804:{label:"MotegiSuperSpeedway",
                iy:0.05, scale:0.2, grndW:280, grndH:200, adjx:-120, adjz:80, cnsSpeedX:1, bubbleEnable:true,
                dtype:"xz", stageType:'extrude_4',
                data :CourseData.DATA.MotegiSuperSpeedway_new.xz.slice(0, -3),
               },

        // ------------------------------
        200901:{label:"DaytonaSpeedway",
                scale:0.5, grndW:500, grndH:500, adjx:-200, adjz:200, cnsAccelX:1.5, cnsSpeedX:1, bubbleEnable:true,
                dtype:"xz",
                data :CourseData.DATA.DaytonaSpeedway_new.xz.slice(0, -3),
               },

        // ------------------------------
        200101:{label:"HighSpeedRing",
                grndW:1100, grndH:680, adjx:-550, adjz:340, cnsSpeedX:1, bubbleEnable:true,
                dtype:"xz",
                data:CourseData.DATA.HighSpeedRing_new.xz.slice(0, 82), // 84
               },

        // ------------------------------

        200202:{label:"AutumnRing",
                scale:1, grndW:1200, grndH:800, adjx:-600, adjz:400, adjy:205-20, nbPoints:20, cnsSpeedX:1,
                dtype:"xzR",
                extRot:-0.0004, // 右ねじ

                data :CourseData.DATA.AutumnRing_new.xzR.slice(0, -2),
                pQlist:CourseData.DATA.AutumnRing_new.pq,
               },

        200204:{label:"AutumnRing_HillClimb",
                isLoopCourse:false, iystep:2, scale:1, grndW:1200, grndH:800, adjx:-600, adjz:400, adjy:-0.3, tubeCAP:BABYLON.Mesh.CAP_ALL, cnsSpeedX:1,
                dtype:"xz",
                data :CourseData.DATA.AutumnRing_new.xz,
               },
        200205:{label:"AutumnRing_DownHill",
                isLoopCourse:false, iystep:2, scale:1, grndW:1200, grndH:800, adjx:-600, adjz:400, adjy:-0.3, tubeCAP:BABYLON.Mesh.CAP_ALL, cnsSpeedX:1, reverse:true,
                dtype:"xz", stageType:'extrude_3',
                data :CourseData.DATA.AutumnRing_new.xz,
               },

        // ------------------------------
        200301:{label:"CotedAzur",
                scale:1, grndW:1300, grndH:1000, adjx:-600, adjz:400, cnsSpeedX:1, bubbleEnable:true,
                dtype:"xz",
                data :CourseData.DATA.CotedAzur_new.xz,
               },

        // // ------------------------------
        200411:{label:"Suzuka",
                scale:1, grndW:1200, grndH:1000, adjx:-550, adjz:450, adjy:4-0.3, cnsSpeedX:0.8, // pQdbg:1,
                dtype:"xzR",
                extRot:-0.00015, // 右ねじ
                data :CourseData.DATA.Suzuka_new.xzR.slice(0, -1),
               },

        // ------------------------------
        200711:{label:"mm2024_08_kanasai",
                scale:1, scaleY:0.5, grndW:1200, grndH:800, adjx:-450, adjz:350, adjy:4.1-0.3, // pQdbg:1,
                dtype:"xzR", stageType:'extrude_3',
                extRot:-0.000325, // 右ねじ
                data : CourseData.DATA.mm2024_08_knasai_new.xzR,
                pQlist: CourseData.DATA.mm2024_08_knasai_new.pq,
               },

        // ------------------------------
        200613:{label:"mm2024_04_tyubu_solo",
                scale:0.5, scaleY:0.5, grndW:1800, grndH:1500, adjx:-850, adjz:600, adjy:4.8, soloEnable:true,
                dtype:"xzR", stageType:'extrude_4',
                extRot:-0.00005, // 右ねじ
                data : CourseData.DATA.mm2024_04_tyubu_new.xzR,
                pQlist: CourseData.DATA.mm2024_04_tyubu_new.pq,
               },
        200614:{label:"mm2024_04_tyubu",
                scale:0.2, scaleY:0.5, grndW:800, grndH:500, adjx:-400, adjz:250, adjy:4.6-0.3, cnsSpeedX:0.5, // pQdbg:1,
                dtype:"xzR", stageType:'extrude_3',
                extRot:-0.00004, // 右ねじ
                data : CourseData.DATA.mm2024_04_tyubu_new.xzR,
                pQlist: CourseData.DATA.mm2024_04_tyubu_new.pq,
               },

        // ------------------------------
        200511:{label:"mm2024_00_zenkoku_solo",
                scale:1, scaleY:0.5, grndW:2400, grndH:2000, adjx:-1200, adjz:700, adjy:4.1, soloEnable:true,
                dtype:"xzR", stageType:'extrude_round_bottom', // 'extrude_2',
                extRot:-0.00004, // 右ねじ
                data : CourseData.DATA.mm2024_00_zenkoku_new.xzR,
                pQlist: CourseData.DATA.mm2024_00_zenkoku_new.pq,
               },
        200512:{label:"mm2024_00_zenkoku",
                scale:0.5, scaleY:0.5, grndW:2000, grndH:1000, adjx:-650, adjz:300, adjy:4.3-0.3, cnsAccelX:0.8, cnsSpeedX:0.6,
                dtype:"xzR", stageType:'extrude_2',
                extRot:-0.00004, // 右ねじ
                data : CourseData.DATA.mm2024_00_zenkoku_new.xzR,
                pQlist: CourseData.DATA.mm2024_00_zenkoku_new.pq,
               },

        // ------------------------------
        // ------------------------------
        3101:{label:"coil",
              dtype:"xzy", tubeType:"coil", adjy:4.75,
                extRot:-0.0007, // 右ねじ
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, nbPoints:5, pStartIdx:10,
        },
        3103:{label:"rand",
              grndW:800, grndH:800,
              dtype:"xzy", tubeType:"rand", adjy:4.75,
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, useSpline:false,
        },
        3104:{label:"rand2",
              grndW:800, grndH:800,
              dtype:"xzy", tubeType:"rand2", adjy:4.75, stageType:'extrude_2',
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, useSpline:false,
        },

        3201:{label:"custom_boko",
              grndW:700, grndH:700, adjx:-250, adjz:0,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, pStartIdx:20,
              metaInfo:[{shape:"s"},
                        {shape:"rsindr", h:100, size:250,size2:50, rot:R360*4, div:32*4},
                        ],
        },



        // ----------------------------------------

        7100:{label:"custom_debug",
              dtype:"xzy", tubeType:"custom",
              grndW:10, grndH:10, adjx:250, adjy:5, cnsNAgent:0,
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, nbPoints:5, pStartIdx:20,
              //useSpline:false,
              metaInfo:[
                  {shape:"s"},
                  {shape:"s"},
                  {shape:"r"},
                  {shape:"l"},
                  {shape:"s"},
              ],
        },

        //✕
        7102:{label:"custom",
              grndW:400, grndH:400, adjx:-50, adjz:-100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              //   +--------+--------+-
              //   | ／￣＼___／￣＼ |
              //   |│             │|
              //   | ＼     :   S ／ |
              //   +--│----+----│--+
              //   | ／     :     ＼ |
              //   |│     __      │|
              //   | ＼＿／ : ＼＿／ |
              //   +--------+--------+
              metaInfo:[{shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        ],
        },

        //✕*2
        7103:{label:"custom",
              grndW:800, grndH:800, adjx:150, adjz:-100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, pStartIdx:30,
              //   +--------+--------+-
              //   | ／￣＼___／￣＼ |
              //   |│             │|
              //   | ＼     :   S ／ |
              //   +--│----+----│--+
              //   | ／     :     ＼ |
              //   |│     __      │|
              //   | ＼＿／ : ＼＿／ |
              //   +--------+--------+
              metaInfo:[{shape:"s", },
                        {shape:"r", h:5}, 
                        {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", h:0, size:100, r:100, div:8, nloop:1}, {shape:"r"},
                        {shape:"l", h:-10}, {shape:"l", nloop:2},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"s", },
                        ],
        },

        //凹
        7111:{label:"custom",
              grndW:600, grndH:300, adjx:-100, adjz:100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              //   +--------+--------+-
              //   | ／￣S ￣￣￣ ＼ |
              //   |│      :      │|
              //   | ＼____ :      │|
              //   +-------＼------│|
              //   |        :│    │|
              //   |        : ＼＿／ |
              //   +--------+--------+
              metaInfo:[{shape:"s", dir:0 },
                        {shape:"s", size:100, r:100, nloop:2},
                        {shape:"r", nloop:2},
                        {shape:"s", nloop:1},
                        {shape:"r", size:50, r:50},
                        {shape:"l",},
                        {shape:"s", nloop:2},
                        {shape:"r", nloop:2},
                        {shape:"s", nloop:1},
                        ],
        },

        7112:{label:"custom",
              grndW:600, grndH:300, adjx:-100, adjz:100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              useSpline:false,  // 補間せずに細かく細分化するほうがよさげ
              //   +--------+--------+-
              //   | ／￣S ￣￣￣ ＼ |
              //   |│      :      │|
              //   | ＼____ :      │|
              //   +-------＼------│|
              //   |        :│    │|
              //   |        : ＼＿／ |
              //   +--------+--------+
              metaInfo:[{shape:"s", dir:0 },
                        {shape:"ssin", h:10, div:16},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:-10, div:16},
                        {shape:"s", h:0, div:4},
                        {shape:"rsin", h:20, size:100, rot:R180, div:100},
                        {shape:"s", h:0, div:4},
                        {shape:"r", size:50, rot:R90, div:30},
                        {shape:"l",},
                        {shape:"s", div:4},
                        {shape:"rsin", h:-20, rot:R180, div:60},
                        //{shape:"s", h:0, div:4},
                        ],
        },


        //８の字
        7113:{label:"custom",
              grndW:1200, grndH:1200, adjx:100, adjz:100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              size:0.2,
              extRot:0.00015, // 左ねじ

              //   +--------+--------+-
              //   |        : ／￣＼ |
              //   |        :│    │|
              //   |        :│    │|
              //   +--------+│-- ／-+
              //   | ／￣￣ :￣￣    |
              //   |│      :│ S    |
              //   | ＼＿___／       |
              //   +--------+--------+
              metaInfo:[{shape:"s",size:200},
                        {shape:"rsin", h:14, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"s", h:0, size:300, div:4},
                        {shape:"lsin", h:-14, rot:R270, div:12},
                        {shape:"s", h:0, size:275, div:4},
                        ],
        },

        // 横ループ
        7114:{label:"custom_loop",
              grndW:600, grndH:700, adjx:0, adjz:50,
              dtype:"xzy", tubeType:"custom", adjy:4.75, pQdiv:6,
              extRot:0.0003, // 左ねじ
              metaInfo:[{shape:"s"},
                        {shape:"rsin", h:30, rot:R360*2, div:32*2},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"lsin", h:15, rot:R180*3, div:8*3},
                        {shape:"s", h:0, size:175, div:4},
                        {shape:"l", size:300, rot:R90, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:-30, size:100, rot:R90*6, div:4*6},
                        {shape:"s", h:0, size:50*4, div:4},
                        {shape:"lsin", h:-15, size:50, rot:R90*3, div:4*3},
                        {shape:"s", h:0, size:125, div:4},
                        ],
        },

        // Y字：クランク＋２車線
        7115:{label:"custom",
              grndW:600, grndH:600, adjx:0, adjz:-50,
              dtype:"xzy", tubeType:"custom", adjy:4.75+10, pQdiv:8,
              stageType:'extrude_square_bottom_narrow', // 'extrude_1_',
              metaInfo:[{shape:"s"},
                        {shape:"r"},
                        {shape:"l"},
                        {shape:"s"},
                        {shape:"s"},
                        {shape:"rsin", h:12, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"l", rot:R90},
                        {shape:"r", rot:R180, div:8},
                        {shape:"l", rot:R90, div:4},
                        {shape:"s", h:0, size:60, div:4},
                        {shape:"rsin", h:-12, size:50, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"l", rot:R90},
                        {shape:"r"},
                        {shape:"s", size:150, div:4},
                        {shape:"r", size:50, },
                        {shape:"l", size:50, rot:R180, div:8},
                        {shape:"s", size:20, div:2},
                        {shape:"l", size:50, rot:R90, div:4},
                        {shape:"s", size:200, div:4},
                        {shape:"r", size:40},
                        {shape:"l", size:60},
                        {shape:"s", size:50},
                        {shape:"ssin", h:13, size:50},
                        {shape:"rsin", h:11, size:60, rot:R270, div:12},
                        {shape:"s", h:0, size:70, div:4},
                        {shape:"lsin", h:-4, size:40, rot:R90, div:4},
                        {shape:"rsin", h:-8, size:60, rot:R180, div:8},
                        {shape:"l", h:0, size:40, rot:R90, div:4},
                        {shape:"s", size:60, div:4},
                        {shape:"rsin", h:-12, size:60, rot:R270, div:12},
                        {shape:"ssin", h:-4, size:50, div:4},
                        {shape:"lsin", h:-4, size:40, rot:R90, div:4},
                        {shape:"rsin", h:-4, size:40, rot:R90, div:4},
                        {shape:"ssin", h:+12, size:130, div:12},
                        {shape:"s", h:0, size:40, div:4},
                        {shape:"rsin", h:6, size:40},
                        {shape:"lsin", h:6, size:60, rot:R270, div:15},
                        {shape:"ssin", h:-12, size:140, div:12},
                        ],
        },


        // 急坂：幅広の滝
        7116:{label:"custom",
              grndW:400, grndH:800, adjx:0, adjz:-150,
              dtype:"xzy", tubeType:"custom", adjy:4.75, pQdiv:40,
              scaleY:0.8,
              stageType:'extrude_1_',
              metaInfo:[{shape:"s"},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:100, div:8},
                        {shape:"l", h:0, size:20, rot:R90, div:4},
                        {shape:"r", h:0, size:30, rot:R270, div:12},
                        {shape:"s", h:0, size:150, div:10},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:170, div:12},
                        {shape:"lsin", h:0, size:30, rot:R270, div:12},
                        {shape:"rsin", h:0, size:20, rot:R90, div:4},
                        {shape:"s", h:0, size:120, div:8},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:150, div:8},
                        {shape:"l", h:0, size:40, rot:R180, div:8},
                        {shape:"s", h:0, size:10, div:2},
                        {shape:"l", h:0, size:30, rot:R90, div:4},
                        {shape:"r", h:0, size:20, rot:R90, div:12},
                        {shape:"s", h:0, size:90, div:8},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:170, div:12},
                        {shape:"lsin", h:0, size:50, rot:R180, div:8},
                        {shape:"lsin", h:0, size:40, rot:R90, div:4},
                        {shape:"rsin", h:0, size:20, rot:R90, div:4},
                        {shape:"s", h:0, size:110, div:10},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:70, div:6},
                        {shape:"ssin", h:14, size:50, div:4},
                        {shape:"l", h:0, size:25, rot:R180, div:8},
                        {shape:"ssin", h:-14, size:50, div:4},
                        {shape:"s", h:0, size:70, div:6},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:90, div:6},
                        {shape:"ssin", h:14, size:50, div:4},
                        {shape:"l", h:0, size:30, rot:R180, div:8},
                        {shape:"ssin", h:-14, size:50, div:4},
                        {shape:"s", h:0, size:90, div:6},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:70, div:6},
                        {shape:"ssin", h:14, size:50, div:4},
                        {shape:"l", h:0, size:35, rot:R180, div:8},
                        {shape:"ssin", h:-14, size:50, div:4},
                        {shape:"s", h:0, size:70, div:6},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:90, div:6},
                        {shape:"ssin", h:14, size:50, div:4},
                        {shape:"l", h:0, size:40, rot:R180, div:8},
                        {shape:"ssin", h:-14, size:50, div:4},
                        {shape:"s", h:0, size:90, div:6},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:70, div:6},
                        {shape:"ssin", h:14, size:50, div:4},
                        {shape:"l", h:0, size:45, rot:R180, div:8},
                        {shape:"ssin", h:-14, size:50, div:4},
                        {shape:"s", h:0, size:70, div:6},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:90, div:6},
                        {shape:"ssin", h:28, size:50, div:4},
                        {shape:"l", h:0, size:20, rot:R180, div:8},
                        {shape:"ssin", h:-28, size:50, div:4},
                        {shape:"s", h:0, size:20, div:6},

                        ],
        },

        // 急坂：一本滝
        7117:{label:"custom",
              grndW:400, grndH:800, adjx:0, adjz:-150,
              dtype:"xzy", tubeType:"custom", adjy:4.75, pQdiv:8,
              extRot:-0.00015, // 右ねじ
              // extRot:0.00088, // 左ねじ
              metaInfo:[{shape:"s", size:50, div:4},
                        {shape:"ssin", h:1000, size:800, div:40},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-20, size:50, div:4},
                        {shape:"ssin", h:-40, size:100, div:8},
                        {shape:"lsin", h:-20, size:50, div:4},
                        {shape:"rsin", h:-20, size:50, div:4},
                        {shape:"ssin", h:-20, size:50, div:4},
                        {shape:"lsin", h:-40, size:50, rot:R180, div:8},

                        {shape:"ssin", h:-60, size:150, div:12},
                        {shape:"lsin", h:-40, size:50, rot:R180, div:8},
                        {shape:"rsin", h:-40, size:50, rot:R180, div:8},
                        {shape:"ssin", h:-40, size:100, div:8},
                        {shape:"lsin", h:-40, size:50, rot:R180, div:8},
                        {shape:"ssin", h:-60, size:150, div:12},
                        {shape:"rsin", h:-40, size:50, rot:R180, div:8},
                        {shape:"ssin", h:-80, size:200, div:16},
                        {shape:"lsin", h:-40, size:50, rot:R180, div:8},
                        {shape:"ssin", h:-20, size:50, div:4},
                        {shape:"rsin", h:-20, size:50, rot:R90, div:4},
                        {shape:"ssin", h:-80, size:200, div:16},
                        {shape:"rsin", h:-20, size:100, rot:R90, div:4},
                        {shape:"lsin", h:-20, size:100, rot:R90, div:4},
                        {shape:"ssin", h:0, size:250, div:20},
                        {shape:"lsin", h:-240, size:50, rot:R90*(4*5+2), div:4*(4*5+2)},
                        {shape:"s", h:0, size:25, div:2},
                        ],
        },

        // ツインタワー
        7118:{label:"custom",
              grndW:600, grndH:600, adjx:-100, adjz:100,
              dtype:"xzy", tubeType:"custom", adjy:4.75, pQdiv:11, cnsCS:0.2, // CS=0.1だと近接したチューブで誤動作おこすっぽい
              // extRot:-0.00015, // 右ねじ
              stageType:'tube', // チューブだと重なっている、大きすぎ
              tubeRadius:5,
              metaInfo:[{shape:"s"},
                        {shape:"rsin", h:200, size:50, rot:R360*5, div:16*3},
                        {shape:"rsindr", h:0, size:50,size2:60, rot:R90, div:6},
                        {shape:"rsin", h:-190, size:60, rot:R360*4.25, div:16*4+4},
                        {shape:"s", h:0, size:200, div:4},
                        {shape:"lsin", h:290, size:40, rot:R360*6, div:16*6},
                        {shape:"s", h:0, size:70, div:4},
                        {shape:"rsin", h:-300, size:40, rot:R360*6.25, div:16*6+4},
                        {shape:"r", h:0, size:70, rot:R90, div:4},
                        {shape:"s", h:0, size:150, rot:R90, div:2},

                        ],
        },

        // スラローム
        7119:{label:"custom",
              grndW:1000, grndH:1000, adjx:0, adjz:0, dir:0,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              stageType:'extrude_square_bottom_narrow', // 'extrude_1_',
              metaInfo:[{shape:"s"},
                        {shape:"r", size:100,div:8},
                        {shape:"l"},
                        {shape:"r"},
                        {shape:"s", size:90, div:4},
                        {shape:"l", size:50, rot:R270, div:12},
                        {shape:"r", size:40, rot:R90, div:4},
                        {shape:"l", size:110,div:8},
                        {shape:"r", size:90,div:8},
                        {shape:"l", size:110,div:8},
                        {shape:"s", size:100, div:8},
                        {shape:"r", size:50, div:4},
                        {shape:"l"},
                        {shape:"r"},
                        {shape:"l"},
                        {shape:"r"},
                        {shape:"s", size:90, div:4},
                        {shape:"l", size:50, rot:R270, div:12},
                        {shape:"r", size:40, rot:R90, div:4},
                        {shape:"l", size:60},
                        {shape:"r", size:40},
                        {shape:"l", size:60},
                        {shape:"r", size:40},
                        {shape:"l", size:60},
                        {shape:"s", size:25, div:2},
                        ],
        },

        // 縦ループ
        7120:{label:"custom",
              grndW:600, grndH:800, adjx:100, adjz:-50, tubeRadius:10, cnsRadius:4,
              dtype:"xzy", tubeType:"custom", adjy:4.75+5,
              extRot:-0.00085, // 右ねじ
              cnsWalkableHeight:20, cnsWalkableClimb:20, // debugMesh:1, 
              metaInfo:[{shape:"s", size:50, div:4},
                        {shape:"s", size:50, div:4},
                        {shape:"vloop", size:50, hshift:20, vrot:R360*1, div:16*1},
                        {shape:"s",size:100, div:8},
                        {shape:"l", size:100, rot:R180, div:8},
                        {shape:"s", size:50, div:4},
                        {shape:"vloop", size:30, hshift:40, vrot:R360*2, div:16*2},
                        {shape:"s",size:100, div:8},
                        {shape:"s",size:100, div:8},
                        {shape:"l", size:110, rot:R180, div:8},
                        {shape:"s", size:25, div:2},
                        ],
        },

        // フープス／凹凸
        7121:{label:"custom",
              grndW:600, grndH:700, adjx:100, adjz:-50, tubeRadius:10, cnsRadius:10,
              dtype:"xzy", tubeType:"custom", adjy:4.75+5,
              metaInfo:[{shape:"s",size:100, div:4},
                        {shape:"s"},
                        {shape:"l", rot:R180, div:8},
                        {shape:"s", size:50, div:4},
                        {shape:"ssin", h:5, size:25},
                        {shape:"ssin", h:-5, size:25},
                        {shape:"ssin", h:5, size:25},
                        {shape:"ssin", h:-5, size:25},
                        {shape:"ssin", h:5, size:25},
                        {shape:"ssin", h:-5, size:25},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"l", size:100, rot:R180, div:8},
                        {shape:"s", size:75, div:3},
                        ],
        },

        4101:{label:"custom",
              grndW:400, grndH:400, adjx:-50, adjz:-25,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              extRot:-0.000325, // 右ねじ
              //   +--------+--------+-
              //   |        : ／￣＼ |
              //   |        :│    │|
              //   |        :│     ＼ 
              //   +--------+│------+＼------+
              //   | ／￣￣ :│￣ ＼ :   ￣＼ |
              //   |│      : S    │:      │|
              //   | ＼＿_______＿_│:___＿／ |
              //   +--------+│----│+--------+
              //   |        :│    │|
              //   |        :│    │|
              //   |        : ＼＿／ |
              //   +--------+--------+
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
              metaInfo:[{shape:"ssin", h:12, size:75, div:8},
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

        4102:{label:"custom",
              grndW:500, grndH:500, adjx:0, adjz:150,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              extRot:-0.000100, // 右ねじ
              // https://katlas.org/wiki/4_1
              // https://katlas.org/wiki/File:FigureEightKnot4a-C.jpg
              //   +--------+--------+--------+
              //   | ／￣＼ : ／￣＼＿_／￣＼ |
              //   |│     ／S      ＿_     │|
              //   | ＼  ／ : ＼  ／ : ＼  ／ |
              //   +---＼---+---＼---+--｜｜--+
              //   | ／  ＼＿_／  ＼ : ／  ＼ |
              //   |│     ＿_      ／      │|
              //   | ＼＿／ : ＼＿／ : ＼＿／ |
              //   +--------+--------+--------+
              metaInfo:[{shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"lsin", h:-14, size:50, rot:R90, div:4},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"rsin", h:14, size:50, rot:R180, div:8},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"r", size:50, rot:R90, div:4},
                        {shape:"l"},
                        {shape:"rsin", h:-14, rot:R180, div:8},
                        {shape:"ssin", h:+14, size:200, div:16},
                        {shape:"r", h:0, size:50, rot:R90, div:8},
                        {shape:"l"},
                        {shape:"r", rot:R180, div:16},
                        {shape:"l", rot:R90, div:8},
                        {shape:"rsin", h:-14, rot:R180, div:8},
                        {shape:"s", h:0},
                        {shape:"ssin", h:14, size:100, div:16},
                        {shape:"ssin", h:-14, div:16},
                       ],
             },

        4103:{label:"custom",
              grndW:500, grndH:500, adjx:0, adjz:100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              extRot:-0.000550, // 右ねじ
              // https://katlas.org/wiki/5_1
              // https://katlas.org/wiki/File:SolomonsSealKnot5a-C.jpg
              //   +--------+--------+--------+
              //   | ／￣＼S  ／￣＼ : ／￣＼ |
              //   |│     ／       ／      │|
              //   | ＼  ／ : ＼＿／ : ＼  ／ |
              //   +---＼---+--------+---＼---+
              //   | ／  ＼ : ／￣＼＿_／  ＼ |
              //   |│     ／       ＿_     │|
              //   | ＼＿／ : ＼＿／ : ＼＿／ |
              //   +--------+--------+--------+
              metaInfo:[{shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"l", h:0, rot:R90},
                        {shape:"r"},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R90},
                        {shape:"s", h:0},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"r", size:50, rot:R90},
                        {shape:"lsin", h:-14},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"lsin", h:14, size:50, rot:R180, div:8},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"rsin", h:-14, size:50, rot:R90, div:4},
                        {shape:"s", h:0, size:25, div:2},
                        ],
             },

        4104:{label:"custom",
              grndW:600, grndH:600, adjx:100, adjz:150,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              extRot:-0.000550, // 右ねじ
              // https://katlas.org/wiki/7_4
              // https://katlas.org/wiki/File:Takara-4harts-C7.jpg
              //   +--------+--------+--------+--------+
              //   |        : ／￣＼ : ／￣＼ :        |
              //   |        :│     ／ S    │:        |
              //   |        : ＼  ／ : ＼  ／ :        |
              //   +--------+---＼---+-- ＼---+--------+
              //   | ／￣＼ : ／  ＼ : ／  ＼ : ／￣＼ |
              //   |│    │:│     ／      │:│    │|
              //   | ＼＿／ : ＼  ／ : ＼  ／ : ＼＿／ |
              //   +--------+---＼---+---＼---+--------+
              //   |        : ／  ＼ : ／  ＼ :        |
              //   |        :│     ／      │:        |
              //   |        : ＼＿／ : ＼＿／ :        |
              //   +--------+--------+--------+--------+
              metaInfo:[{shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"ssin", h:14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-14, rot:R90},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R90, div:4},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"s", h:0, size:25, div:2},

                        ],
             },

        4105:{label:"custom",
              grndW:600, grndH:500, adjx:-50, adjz:-100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              extRot:-0.000370, // 右ねじ
              // https://katlas.org/wiki/6_1
              // https://katlas.org/wiki/File:StevedoresKnot-1-6a-C.jpg
              //   +--------+--------+--------+
              //   | ／￣＼ : ／￣＼ :        |
              //   |│     ／      │:        |
              //   | ＼  ／ : ＼  ／ :        |
              //   +--││--+--││--+--------+
              //   | ／  ＼ : ／  ＼＿_／￣＼ |
              //   |│     ／               │|
              //   | ＼  ／ : ＼＿／￣~＼  ／ |
              //   +---＼---+--------+---＼---+
              //   | ／S ＼ : ／￣＼ : ／  ＼ |
              //   |│     ／       ／      │|
              //   | ＼＿／ : ＼＿／ : ＼＿／ |
              //   +--------+--------+--------+
              metaInfo:[{shape:"ssin", h:14, size:50, div:4},
                        {shape:"s", h:0, size:50},
                        {shape:"ssin", h:-14, size:50},
                        {shape:"l", h:0, size:50, div:4},
                        {shape:"s", h:0, size:100},
                        {shape:"lsin", h:14, size:50, rot:R180, div:8},
                        {shape:"r", h:0, rot:R90, div:4},
                        {shape:"l", h:0},
                        {shape:"s", h:0},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14},
                        {shape:"s", h:0},
                        {shape:"ssin", h:-14, size:100},
                        {shape:"s", h:0, size:50},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"r", h:0},
                        {shape:"l"},
                        {shape:"s", size:100},
                        {shape:"lsin", h:-14, size:50, rot:R90, div:4},
                        {shape:"s", h:0},
                        {shape:"s"},
                        {shape:"lsin", h:7},
                        {shape:"rsin", h:7},
                        {shape:"s", h:0},
                        {shape:"s"},
                        {shape:"rsin", h:-14, size:50, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"s"},
                        {shape:"lsin", h:14, size:50, rot:R90, div:4},
                        {shape:"s", h:0, div:4},
                        {shape:"s", h:0, div:4},
                        {shape:"rsin", h:-14, size:50, rot:R180, div:8},
                        {shape:"s", h:0, size:25, div:4},
                        ],
             },

        4106:{label:"custom",
              grndW:600, grndH:600, adjx:-50, adjz:50,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              extRot:-0.000520, // 右ねじ
              // https://katlas.org/wiki/0_1
              // https://katlas.org/wiki/File:Swastika-Manji_Kolam-C.jpg
              // +--------+--------+--------+
              // | ／￣＼ : ／￣＼ : ／￣＼ |
              // |│     ／      │:│    │|
              // | ＼＿／ : ＼ S／ : ＼  ／ |
              // +--------+---＼---+-- ＼---+
              // | ／￣＼ : ／  ＼ : ／  ＼ |
              // |│     ／       ／      │|
              // | ＼  ／ : ＼  ／ : ＼＿／ |
              // +---＼---+---＼---+--------+
              // | ／  ＼ : ／  ＼ : ／￣＼ |
              // |│    │:│     ／      │|
              // | ＼＿／ : ＼＿／ : ＼＿／ |
              // +--------+--------+--------+
              metaInfo:[{shape:"s"},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"s"},
                        {shape:"rsin", h:-14, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"s"},
                        {shape:"rsin", h:-14, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"s"},
                        {shape:"rsin", h:-14, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"s"},
                        {shape:"rsin", h:-14, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        ],
             },

        4107:{label:"custom",
              grndW:600, grndH:600, adjx:100, adjz:125,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              extRot:-0.000400, // 右ねじ
              // https://katlas.org/wiki/File:TakaraMusubi-C9.jpg
              //   +--------+--------+--------+--------+
              //   |        : ／￣＼ : ／￣＼ :        |
              //   |        :│     ／ S    │:        |
              //   |        : ＼  ／ : ＼  ／ :        |
              //   +--------+---＼---+-- ＼---+--------+
              //   | ／￣＼ : ／  ＼ : ／  ＼ : ／￣＼ |
              //   |│     ／       ／       ／      │|
              //   | ＼＿／ : ＼  ／ : ＼  ／ : ＼＿／ |
              //   +--------+---＼---+---＼---+--------+
              //   |        : ／  ＼ : ／  ＼ :        |
              //   |        :│     ／      │:        |
              //   |        : ＼＿／ : ＼＿／ :        |
              //   +--------+--------+--------+--------+

              metaInfo:[{shape:"s", size:25, div:2},
                        {shape:"lsin", h:14, size:50, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"ssin", h:14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R270, div:12},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"ssin", h:14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-14, rot:R180, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"ssin", h:14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-14, rot:R270, div:12},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:25, div:2},
                        
                        ],
             },

    };

    var getMetaStageInfo = function (istage) {
        let rval;
        let [id, ttype, tlabel, tpath] = courseInfoList[istage];
        rval = metaStageInfo[id];
        if (ttype == 0) {
            console.log("\ni=",istage, rval.label, tlabel);
        } else if (ttype == 1) {
            console.log("\ni=",istage, rval.label, tlabel);
            rval = createCourseData(rval);
        } else {
            console.assert(0);
        }
        setText2(tlabel);

        return rval;
    }

    let meshAggInfo = []; // mesh, agg;
    let meshes = [];
    let pStart = new BABYLON.Vector3(0, 0, 0);
    let pStart2 = new BABYLON.Vector3(0, 0, 0);
    let pGoal = new BABYLON.Vector3(0, 0, 0);

    var createStage2 = function(istage) {
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        let metaStageInfo = getMetaStageInfo(istage)

        let stageType = typeof(metaStageInfo.stageType) !== 'undefined' ? metaStageInfo.stageType : "extrude_round_bottom";

        let useSpline = typeof(metaStageInfo.useSpline) !== 'undefined' ? metaStageInfo.useSpline : true;
        let nbPoints = typeof(metaStageInfo.nbPoints) !== 'undefined' ? metaStageInfo.nbPoints : 20;
        let pStartIdx = typeof(metaStageInfo.pStartIdx) !== 'undefined' ? metaStageInfo.pStartIdx:1;
        let isLoopCourse = typeof(metaStageInfo.isLoopCourse) !== 'undefined' ? metaStageInfo.isLoopCourse : true;
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
        let tubeRadius = typeof(metaStageInfo.tubeRadius) !== 'undefined' ? metaStageInfo.tubeRadius : 8;
        let tubeCAP = typeof(metaStageInfo.tubeCAP) !== 'undefined' ? metaStageInfo.tubeCAP : BABYLON.Mesh.NO_CAP ;
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
        let reverse = typeof(metaStageInfo.reverse) !== 'undefined' ? metaStageInfo.reverse : false; // 逆走
        let soloEnable = typeof(metaStageInfo.soloEnable) !== 'undefined' ? metaStageInfo.soloEnable : false;

        let plist = [];
        if(metaStageInfo.dtype=='xz') {
            // 画像から抜き出した座標をそのまま使う版
            //let iystep = metaStageInfo.iystep;
            for (let [ix,iz] of metaStageInfo.data) {
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
                if (tmp.length == 2) {
                    [ix,iz] = tmp;
                    dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                    iystep = iyrate*dis;
                    iy += iystep;
                    plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                } else if (tmp.length == 3) {
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

        } else if(metaStageInfo.dtype=='xzy') {
            // 高さを手動で指定した版
            for (let [ix,iz,iy] of metaStageInfo.data) {
                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
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
            let pQ = [];  // 単一ライン
            // let pQQ = pRouteList; // 複数ライン
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
                console.log("plist2.length=",plist2.length, " 1/20=",Math.floor(plist2.length/20));
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
                }
            }

            if (stageType=='tube') {
                // チューブで表示
                let mesh = BABYLON.MeshBuilder.CreateTube("tube", {path:plist2, radius:tubeRadius, cap:tubeCAP}, scene);
                mesh.position.y += tubeRadius+0.1; // tube
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.emissiveColor = BABYLON.Color3.Blue();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes.push(mesh);
            }

            if ((stageType=='extrude_square_bottom') || (stageType=='extrude')) {
                // 矩形（凹）で表示、角張ったフライパン(square pan)
                let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 6.0;
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
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes.push(mesh);
            }

            if ((stageType=='extrude_square_bottom_narrow') || (stageType=='extrude_1_')) {
                // 矩形（凹）で表示  幅をやや狭く、複数車線用
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
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes.push(mesh);
            }

            if ((stageType=='extrude_round_bottom') || (stageType=='extrude_2')) {
                // 矩形（凹）：エッジをまるく、浅いフライパン (round-bottomed pan
                let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 15.0;
                let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 10.0;
                const myShape = [
                    new BABYLON.Vector3(-0.60*gardW, 0.5*gardH, 0),
                    new BABYLON.Vector3(-0.57*gardW, 0.2*gardH, 0),
                    new BABYLON.Vector3(-0.5*gardW, 0.1*gardH, 0),
                    new BABYLON.Vector3(-0.4*gardW, 0.02*gardH, 0),
                    new BABYLON.Vector3(-0.3*gardW, 0.0*gardH, 0),

                    new BABYLON.Vector3( 0.3*gardW, 0.0*gardH, 0),
                    new BABYLON.Vector3( 0.4*gardW, 0.02*gardH, 0),
                    new BABYLON.Vector3( 0.5*gardW, 0.1*gardH, 0),
                    new BABYLON.Vector3( 0.57*gardW, 0.2*gardH, 0),
                    new BABYLON.Vector3( 0.60*gardW, 0.5*gardH, 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,
                               cap:tubeCAP};
                if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes.push(mesh);
            }

            if (stageType=='extrude_3') {
                // 矩形（凹）：エッジをもっとまるめこむ  １車線
                let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 10.0;
                let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 10.0;
                const myShape = [
                    new BABYLON.Vector3(-0.30*gardW, 0.9*gardH, 0),
                    new BABYLON.Vector3(-0.47*gardW, 0.8*gardH, 0),
                    new BABYLON.Vector3(-0.50*gardW, 0.5*gardH, 0),
                    new BABYLON.Vector3(-0.48*gardW, 0.2*gardH, 0),
                    new BABYLON.Vector3(-0.4*gardW, 0.1*gardH, 0),
                    new BABYLON.Vector3(-0.3*gardW, 0.02*gardH, 0),
                    new BABYLON.Vector3(-0.2*gardW, 0.0*gardH, 0),

                    new BABYLON.Vector3( 0.2*gardW, 0.0*gardH, 0),
                    new BABYLON.Vector3( 0.3*gardW, 0.02*gardH, 0),
                    new BABYLON.Vector3( 0.4*gardW, 0.1*gardH, 0),
                    new BABYLON.Vector3( 0.48*gardW, 0.2*gardH, 0),
                    new BABYLON.Vector3( 0.50*gardW, 0.5*gardH, 0),
                    new BABYLON.Vector3( 0.47*gardW, 0.8*gardH, 0),
                    new BABYLON.Vector3( 0.30*gardW, 0.9*gardH, 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,
                               cap:tubeCAP};
                if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes.push(mesh);
            }

            if (stageType=='extrude_4') {
                // 矩形（凹）：エッジをもっとまるめこむ  ２車線
                let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 20.0;
                let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 10.0;
                const myShape = [
                    new BABYLON.Vector3(-0.30*gardW, 0.9*gardH, 0),
                    new BABYLON.Vector3(-0.47*gardW, 0.8*gardH, 0),
                    new BABYLON.Vector3(-0.50*gardW, 0.5*gardH, 0),
                    new BABYLON.Vector3(-0.48*gardW, 0.2*gardH, 0),
                    new BABYLON.Vector3(-0.4*gardW, 0.1*gardH, 0),
                    new BABYLON.Vector3(-0.3*gardW, 0.02*gardH, 0),
                    new BABYLON.Vector3(-0.2*gardW, 0.0*gardH, 0),

                    new BABYLON.Vector3( 0.2*gardW, 0.0*gardH, 0),
                    new BABYLON.Vector3( 0.3*gardW, 0.02*gardH, 0),
                    new BABYLON.Vector3( 0.4*gardW, 0.1*gardH, 0),
                    new BABYLON.Vector3( 0.48*gardW, 0.2*gardH, 0),
                    new BABYLON.Vector3( 0.50*gardW, 0.5*gardH, 0),
                    new BABYLON.Vector3( 0.47*gardW, 0.8*gardH, 0),
                    new BABYLON.Vector3( 0.30*gardW, 0.9*gardH, 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,
                               cap:tubeCAP};
                if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes.push(mesh);
            }

            if (stageType=='extrude_plane') {
                // 線分／平面で表示
                let sW = typeof(metaStageInfo.sW) !== 'undefined' ? metaStageInfo.sW : 3;
                const sW_=sW/2;
                const myShape = [
                    new BABYLON.Vector3(-sW_, 0, 0),
                    new BABYLON.Vector3( sW_, 0, 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true};
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes.push(mesh);
            }

            if (stageType=='extrudeL') {
                // 矩形（凹）で表示 .. 片道の末端でのループ形状用
                let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 6.0;
                let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 3.0;
                const myShape = [
                    new BABYLON.Vector3(-gardW,  gardH, 0),
                    new BABYLON.Vector3(-gardW,  0    , 0),
                    new BABYLON.Vector3( gardW,  0    , 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,
                               cap:tubeCAP};
                if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes.push(mesh);
            }


            {
                // ゴール地点のメッシュ
                let meshSize = 20;
                if ((stageType=='extrude_square_bottom_narrow') || (stageType=='extrude_1_')) {
                    meshSize = 10;
                }
                let goalMesh = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: meshSize}, scene);
                goalMesh.position.copyFrom(pGoal);
                goalMesh.position.y += 0.2;
                goalMesh.material = new BABYLON.StandardMaterial("mat");
                goalMesh.material.diffuseTexture = new BABYLON.Texture(goalPath, scene);
                goalMesh.material.alpha = 0.5;
                meshAggInfo.push([goalMesh,null]);
            }
        }

        // ------------------------------------------------------------
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

    // ----------------------------------------

    // let imymesh = 9;
    let imymesh = 3; // 車
    let mymeshList = [3, 9];

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
                sideForce:6, // ski な感じ
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

        if (imymesh == 9) {
            // フロート(3) 浮遊体)  斜めな地面に対応
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

	    // let length = 1.5;
	    // var ray = new BABYLON.Ray(myMesh.position.add(new BABYLON.Vector3(0,-myMesh._height,0)), BABYLON.Vector3.Down(), length);
            // {
            //     // レイのデバッグ表示
            //     let rayHelper = new BABYLON.RayHelper(ray);
	    //     rayHelper.show(scene);
            // }
            // myMesh._ray = ray;
            myMesh.position.y += 1;
        }

        if (typeof(myMesh._vehicle) === 'undefined') {
            myMesh._vehicle = null;
        }

        return myMesh
    }

    let updateMyMesh = function() {

        let forwardForce, steerDirection, roll;

        if (imymesh == 3) {
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

        } else if (imymesh == 9) {
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
                        myMesh._agg.body.applyForce(vg, pstart);
                        continue;
                    }
                    // 接地している
                    //    縮んだ距離 = サスペンションの長さ - 始点から交点位置 ＋ちょっと足して浮かせた感じに
                    let compLen  = susLen - raycastResult.hitDistance -7.8;
                    const grav = -9.8;
                    myMesh._agg.body.applyForce(raycastResult.hitNormalWorld.scale(grav + susPower*compLen), pstart);

                    // 地面に垂直な方向(raycastResult.hitNormalWorld)に傾ける
                    let v1 = raycastResult.hitNormalWorld.normalize();
                    let v2 = BABYLON.Vector3.Up().applyRotationQuaternion(quat).normalize();
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
        if (imymesh == 3) {
            // RaycastVehicle(2)
            let vehicle = myMesh._vehicle;
            vehicle.doResetPosture();

        } else if (imymesh == 9) {
            // フロート (3)
            let eular = myMesh.rotationQuaternion.toEulerAngles()
            let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
            myMesh.rotationQuaternion = quat;
            myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));

        } else {
            // 姿勢を正す
            /// クォータニオンからオイラー角を取得、方向（ヨー:z軸回転）だけを使い他は0として姿勢をリセットする
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
        if (imymesh == 3) {
            speed = myMesh._vehicle.speed;
        } else if (imymesh == 8) {
            speed = myMesh._vehicle.speed;
        } else {
            let vec = myMesh._agg.body.getLinearVelocity();
            speed = vec.length();
        }
        return speed;
    }


    // // デバッグ表示(物理メッシュ／白線表示)
    // if (0) {
    // var viewer = new BABYLON.PhysicsViewer();
    // scene.meshes.forEach((mesh) => {
    //     if (mesh.physicsBody) {
    //         viewer.showBody(mesh.physicsBody);
    //     }
    // });
    // }
    // if (0) {
    //     physicsViewer = new BABYLON.Debug.PhysicsViewer();
    //     for (const mesh of scene.rootNodes) {
    //         if (mesh.physicsBody) {
    //             const debugMesh = physicsViewer.showBody(mesh.physicsBody);
    //         }
    //     }
    // }

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

    let keyAction = {forward:0, back:0, right:0, left:0, LR:0, brake:0, quick:0, reset:0, resetCooltime:0};
    scene.registerAfterRender(function() {
        keyAction.quick=false;
        if (map["ctrl"]) {
            keyAction.quick=true;
        }
        if (map["w"] || map["ArrowUp"]) {
            keyAction.forward = true;
        } else {
            keyAction.forward = false;
        }
        if (map["s"] || map["ArrowDown"]) {
            keyAction.backward = true
        } else {
            keyAction.backward = false
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

    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // 左上に使い方（操作方法）を表示
    let guiUsageRect = new BABYLON.GUI.Rectangle();
    {
        guiUsageRect.adaptWidthToChildren = true;
        guiUsageRect.width = "320px";
        guiUsageRect.height = "210px";
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
                +"(Arrow UP/DOWN), (W,S): Forward/Back\n"
                +"(Arrow Left/Right), (A,D): Turn Left/Right\n"
                +"(space) : Brake\n"
                +"(R) : Goto Start Position\n"
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
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("but1", "Close");
            button.width = "120px";
            button.height = "30px";
            button.color = "white";
            button.fontSize = 16;
            button.background = "DarkGray";
            button.onPointerUpObservable.add(function() {
                guiUsageRect.isVisible = false;
            });
            grid.addControl(button, 1, 0);
        }
        guiUsageRect.isVisible = false;
        guiUsageRect.zIndex = 2;
    }
    var changeUsageView = function() {
        if (guiUsageRect.isVisible) {
            guiUsageRect.isVisible = false;
        } else {
            guiUsageRect.isVisible = true;
        }
    }

    // 画面左上。Ｑボタン
    var guiIconUsage = new BABYLON.GUI.Image("ctrl", iconPath1);
    {
        guiIconUsage.width = "60px";
        guiIconUsage.height = "60px";
        guiIconUsage.autoScale = false
        guiIconUsage.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIconUsage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        guiIconUsage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        guiIconUsage.onPointerUpObservable.add(function() {
            changeUsageView();
        });
        guiIconUsage.zIndex = 1; // "-1";
        advancedTexture.addControl(guiIconUsage);   
    }

    // ----------------------------------------
    // setting

    let guiSettingRect = new BABYLON.GUI.Rectangle(); 
    guiSettingRect._obj1=[];
    guiSettingRect._obj2=[];
    {
        // キャラクター選択GUI作成
        guiSettingRect.width = "600px";
        guiSettingRect.height = "250px";
        guiSettingRect.cornerRadius = 20;
        guiSettingRect.color = "Orange";
        guiSettingRect.thickness = 4;
        guiSettingRect.background = "green";
        guiSettingRect.isVisible = false;
        guiSettingRect._obj=[];
        advancedTexture.addControl(guiSettingRect);
        //
        let rootPanel = new BABYLON.GUI.StackPanel();    
        rootPanel.width = "600px";
        rootPanel.height="200px";
        guiSettingRect.addControl(rootPanel);
        //
        let r1panel = new BABYLON.GUI.StackPanel();
        r1panel.width = "600px";
        r1panel.height="100px";
        r1panel.isVertical=false;
        rootPanel.addControl(r1panel);
        {
            var rectSpace = new BABYLON.GUI.Rectangle(); //spacer
            rectSpace.width = "20px";
            rectSpace.height = "0px";
            r1panel.addControl(rectSpace);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("b11", "Skybox\n(random)");
            button.width = "90px";
            button.height = "60px";
            button.color = "white";
            button.background = "black";
            r1panel.addControl(button);  
            button.onPointerUpObservable.add(function() {
                skyboxType=-1;
                createStage2(istage);
                resetMyPosi();
                changeSettingView();
            });
            guiSettingRect._obj1.push(button);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("b12", "Sunny and some coulds");
            button.width = "90px";
            button.height = "60px";
            button.color = "white";
            button.background = "black";
            r1panel.addControl(button);
            button.onPointerUpObservable.add(function() {
                skyboxType=0;
                createStage2(istage);
                resetMyPosi();
                changeSettingView();
            });
            guiSettingRect._obj1.push(button);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("b13", "City in Evening");
            button.width = "90px";
            button.height = "60px";
            button.color = "white";
            button.background = "black";
            r1panel.addControl(button);  
            button.onPointerUpObservable.add(function() {
                skyboxType=1;
                createStage2(istage);
                resetMyPosi();
                changeSettingView();
            });
            guiSettingRect._obj1.push(button);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("b14", "Clear Mountain");
            button.width = "90px";
            button.height = "60px";
            button.color = "white";
            button.background = "black";
            r1panel.addControl(button);  
            button.onPointerUpObservable.add(function() {
                skyboxType=2;
                createStage2(istage);
                resetMyPosi();
                changeSettingView();
            });
            guiSettingRect._obj1.push(button);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("b15", "Snow Field");
            button.width = "90px";
            button.height = "60px";
            button.color = "white";
            button.background = "black";
            r1panel.addControl(button);  
            button.onPointerUpObservable.add(function() {
                skyboxType=3;
                createStage2(istage);
                resetMyPosi();
                changeSettingView();
            });
            guiSettingRect._obj1.push(button);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("b16", "Tropical Sunny Day");
            button.width = "90px";
            button.height = "60px";
            button.color = "white";
            button.background = "black";
            r1panel.addControl(button);  
            button.onPointerUpObservable.add(function() {
                skyboxType=4;
                createStage2(istage);
                resetMyPosi();
                changeSettingView();
            });
            guiSettingRect._obj1.push(button);
        }
        //
        let r2panel = new BABYLON.GUI.StackPanel();
        r2panel.width = "600px";
        r2panel.height="100px";
        r2panel.isVertical=false;
        rootPanel.addControl(r2panel);
        {
            var rectSpace = new BABYLON.GUI.Rectangle(); //spacer
            rectSpace.width = "20px";
            rectSpace.height = "0px";
            r2panel.addControl(rectSpace);
        }
    }
    var changeSettingView = function() {
        if (guiSettingRect.isVisible) {
            guiSettingRect.isVisible = false;
        } else {
            guiSettingRect.isVisible = true;
            for (let obj of guiSettingRect._obj1) {
                obj.background = "black";
            }
            guiSettingRect._obj1[skyboxType+1].background = "darkgray";
        }
    }

    // 画面右上。歯車ボタン
    var guiIconSetting = new BABYLON.GUI.Image("ctrl", iconPath2);
    {
        guiIconSetting.width = "60px";
        guiIconSetting.height = "60px";
        guiIconSetting.autoScale = false
        guiIconSetting.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIconSetting.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        guiIconSetting.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        guiIconSetting.onPointerUpObservable.add(function() {
            changeSettingView();
        });
        guiIconSetting.zIndex = 1;
        advancedTexture.addControl(guiIconSetting);   
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
        guiIconCourse.top = "80px";
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
        setTimeout(clearText2, 5000);
    }

    // ----------------------------------------

    createStage2(istage);
    createMyMesh();

    changeCamera(icamera);
    resetMyPosi();



    return scene;
}

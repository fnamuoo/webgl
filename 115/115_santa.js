// Babylon.js で物理演算(havok)：扇風機／UFOでレース車の代わりに扇風機w

//  - カーソル上        .. 前進
//  - カーソル下        .. 後進
//  - カーソル右左      .. 旋回
//  - Ctrl+カーソル右左 .. 急旋回
//  - space             .. ブレーキ
//  - enter             .. ジャンプ（姿勢を正す）
//  - r                 .. スタート位置に移動
//  - (c/C[=shift+c])   .. カメラ変更
//  - (n/N[=shift+n]/p) .. ステージ変更
//  - (m/M[=shift+m])   .. プレイヤー変更（扇風機、ＵＦＯ、車）
//  - (d/D[=shift+d])   .. 駆動系変更（４ＷＤ、ＦＦ、ＦＲ）
//  - h                 .. 使い方表示 ON/OFF


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


// --------------------------------------------------

// const SCRIPT_URL2 = "./Vehicle_draft2.js";
// const SCRIPT_URL11 = "./CourseData.js";
// const SCRIPT_URL21 = "./CourseData2.js";

// const glb_url = "./assets/";
// const glb_url1 = glb_url;
// const glb_fname1 = "vintageFan_animated.gltf";
// const glb_url2 = glb_url;
// const glb_fname2 = "ufo.glb";
// const myTextPath3 = "textures/pipo-charachip017a.png"; // メイド
// const goalPath ="textures/amiga.jpg";
// let skyboxTextPath2 = "textures/skybox2";
// let skyboxTextPath5 = "textures/TropicalSunnyDay";
// const iconPath1 = "textures/icon_question.png";
// const iconPath3 = "textures/icon_golf6.png";

// const dbase = "textures/course3/"

// --------------------------------------------------

const SCRIPT_URL2 = "../105/Vehicle2.js";
const SCRIPT_URL11 = "../090/CourseData.js";
const SCRIPT_URL21 = "../112/CourseData2.js";

const glb_url1 = Assets.meshes.vintageFan_animated.rootUrl;
const glb_fname1 = Assets.meshes.vintageFan_animated.filename;
const glb_url2 = Assets.meshes.ufo.rootUrl;
const glb_fname2 = Assets.meshes.ufo.filename;
const myTextPath3 = "../096/textures/pipo-charachip017a.png"; // メイド
const goalPath ="../078/textures/amiga.jpg";
let skyboxTextPath2 = "../111/textures/skybox2";
let skyboxTextPath5 = "../111/textures/TropicalSunnyDay";
const iconPath1 = "../099/textures/icon_question.png";
const iconPath3 = "../099/textures/icon_golf6.png";
const charPath11 = "textures/santa_claus_back.png";
const charPath21 = "textures/christmas_santa_sori.png";
const charPath23 = "textures/xmas-santa-005.png";
const charPath24 = "textures/santa.png";

const dbase1 = "../111/course3/"
const dbase2 = "./course4/"

// // --------------------------------------------------

// const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/105/Vehicle2.js";
// const SCRIPT_URL11 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/090/CourseData.js";
// const SCRIPT_URL21 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/112/CourseData2.js";

// const glb_url1 = Assets.meshes.vintageFan_animated.rootUrl;
// const glb_fname1 = Assets.meshes.vintageFan_animated.filename;
// const glb_url2 = Assets.meshes.ufo.rootUrl;
// const glb_fname2 = Assets.meshes.ufo.filename;
// const myTextPath3 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/096/textures/pipo-charachip017a.png"; // メイド
// const goalPath ="https://raw.githubusercontent.com/fnamuoo/webgl/main/078/textures/amiga.jpg";
// let skyboxTextPath2 = "textures/skybox2";
// let skyboxTextPath5 = "textures/TropicalSunnyDay";
// const iconPath1 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/icon_question.png";
// const iconPath3 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/icon_golf6.png";
// const charPath11 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/115/textures/santa_claus_back.png";
// const charPath21 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/115/textures/christmas_santa_sori.png";
// const charPath23 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/115/textures/xmas-santa-005.png";
// const charPath24 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/115/textures/santa.png";

// const dbase1 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/111/course3/"
// const dbase2 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/115/course4/"

// --------------------------------------------------

let CourseData = null;
await import(SCRIPT_URL11).then((obj) => { CourseData = obj; });
let CourseData2 = null;
await import(SCRIPT_URL21).then((obj) => { CourseData2 = obj; });
let Vehicle2 = null;
await import(SCRIPT_URL2).then((obj) => { Vehicle2 = obj; });

const skyboxTextPathList = [skyboxTextPath2,skyboxTextPath5];
// let skyboxType=-1; // -1:rand, 0-4: 固定
let skyboxType=1; // -1:rand, 0-2: 固定

// プレイヤーメッシュ
// let imymesh = 5; // 扇風機
// let imymesh = 9; // UFO
let imymesh = 6; // サンタ
let mymeshList = [3, 4, 5, 6, 9]; // 車、車（ゆるサスペンション）、扇風機、サンタ、ＵＦＯ

// debug
// let imymesh = 3;
// let mymeshList = [0, 3, 4, 5, 9];

// -debug
//   - コースの形状
//   - カメラワーク（斜め対応）
// let istage=0;
// const courseInfoList = [
//     [100101, 0, "test", dbase+""], // 0
//     [100107, 0, "test_高低差（ゆる）＋バンク補正", dbase+""], //6
//     [200803, 0, "MotegiSuperSpeedway＋バンク", dbase+""], // 2
//     [200902, 0, "DaytonaSpeedway＋バンク"    , dbase+"200901.jpg"],
//     [200102, 0, "HighSpeedRing"      , dbase+"200101.jpg"], // 4
//     [100202, 0, "test2_2024student_高低差（ゆる）", dbase+""], // 37
//     [100203, 0, "test2_2024student_高低差（激）", dbase+""], // 38
// ];

let istage=0;
const courseInfoList = [
    // istage, type, label, fpath
    [100101, 0, "カートコース", dbase2+"100101.jpg"], // 0
    [100107, 0, "カートコース_高低差（ゆる）", dbase2+"100101.jpg"], //
    [200803, 0, "MotegiSuperSpeedway", dbase1+"200802.jpg"], // 
    [200902, 0, "DaytonaSpeedway"    , dbase1+"200901.jpg"],
    [200102, 0, "HighSpeedRing"      , dbase1+"200101.jpg"], // 
    [100202, 0, "マイクロマウス2024学生", dbase2+"100202.jpg"], // 

    [4101, 1, "コーラム模様:4101", dbase1+"4101.jpg"], // 17
    [4102, 1, "コーラム模様:4102", dbase1+"4102.jpg"],
    [4104, 1, "コーラム模様:4104", dbase1+"4104.jpg"], // 20
    [4106, 1, "コーラム模様:4106", dbase1+"4106.jpg"], // 22
    [4107, 1, "コーラム模様:4107", dbase1+"4107.jpg"], // 23
    [7102, 1, "✕"          , dbase1+"7102.jpg"],
    [7111, 1, "┓"          , dbase2+"7111.jpg"],
    [7113, 1, "８の字"      , dbase2+"7113.jpg"],

];


let nstage = courseInfoList.length;

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let meshFan = new BABYLON.TransformNode();
    meshFan._elem = [];
    let meshUFO = null;

    let loadMeshGLB_cntTask = function(scene) {
        let assetsManager = new BABYLON.AssetsManager(scene);

        let meshAssetTask1 = assetsManager.addMeshTask("task1","", glb_url1, glb_fname1)
        let meshAssetTask2 = assetsManager.addMeshTask("task2","", glb_url2, glb_fname2)

        meshAssetTask1.onSuccess = function(task) { // MeshAssetTask
            let meshlist1 = task.loadedMeshes;
            let animlist1 = task.loadedAnimationGroups;
            let scale=0.03;
            for (let m of meshlist1) {
                m.scaling.set(scale, scale, scale);
                m.parent = meshFan;
                meshFan._elem.push(m);
            }
// console.log("meshFan._elem=", meshFan._elem);
            meshFan.position.set(0, -0.5, 0);
            // アニメーションの切り替え 0:start を止めて、 1:runを速めて実行
            animlist1[0].stop();
            animlist1[1].speedRatio = 4;
            animlist1[1].play(true);

        }

        meshAssetTask2.onSuccess = function (task) {
//console.log("task2.type=", typeof task, task);
            let meshlist = task.loadedMeshes;
            meshUFO = meshlist[0];
            meshUFO.position.set(5, 10, 0);
        }

        // === エラー処理 ===
        assetsManager.onTaskError = function (task) {
            console.error("タスクの読み込みに失敗しました:", task.name);
        };
        // === 全てのロードが完了した時 ===
        assetsManager.onFinish = function (tasks) {
            // console.log("すべてのアセットが読み込まれました！");
        };

        // === 読み込みスタート ===
        assetsManager.load();
    }

    let meshFan_clone = function(name) {
        if (meshFan==null){
            console.log("meshFan is NULL");
            return;
        }
        let meshRoot = new BABYLON.TransformNode();
        for (let m of meshFan._elem) {
            let m2 = m.clone(name);
            m2.parent = meshRoot;
        }
        return meshRoot;
    }


    // 外部メッシュを読み込む処理に await で待ちを発生させる
    await loadMeshGLB_cntTask(scene);

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
            camera.cameraAcceleration = 0.4;
            camera.maxCameraSpeed = 100;
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
            //scene.activeCameras.pop();
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
        }

        if (icamera == 6) {
            // 車体とカメラを固定（進行軸が同じ）して地形が変化（斜面でも地面にカメラが埋まらない）
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
        if (icamera == 4) {
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
    let createCourseData = function (geo) {
        geo.data = []; // xzy座標
        geo.mZRot = {}; // z回転、ロール
        geo.xzLbl = []; // ラベル表示

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

        } else if (geo.tubeType == 'spiral') {
            // らせん／円で半径を徐々に大きく、半径に応じて上昇幅up
            let nloop = typeof(geo.nloop) !== 'undefined' ? geo.nloop : 15;
            let loopy = typeof(geo.loopy) !== 'undefined' ? geo.loopy : 50;//
            let r = typeof(geo.r) !== 'undefined' ? geo.r : 30;
            let rstep = typeof(geo.rstep) !== 'undefined' ? geo.rstep : 0.1;
            let n = nloop*72, stepy = loopy/72;
            for (let i = 0; i < n; ++i) {
                irad = -i * R5;
                x = r*Math.cos(irad); y = i*stepy; z = r*Math.sin(irad);
                geo.data.push([x, z, y]);
                r += rstep;
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
                        let irad = j * Rx + jarc*R90;
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
                        let irad = -j*Rx + jarc*R90 + R180;
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

            // 初期値をデフォルトとして用いる
            let meta0 = geo.metaInfo[0];
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
                cmnt = typeof(meta.cmnt) !== 'undefined' ? meta.cmnt : ""; // コメント
                zrot = typeof(meta.zrot) !== 'undefined' ? meta.zrot : zrot; // Y軸回転、ロールの回転角
                dirstep = rot/div;
                yradstep = R180/div;
                sizestep = (size2-size)/div;

                if (cmnt != "") {
                    geo.xzLbl[ii] = cmnt;
                }

                if (shape == "S" || shape == "s" || shape == "straight") {
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
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
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
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0-dirstep*i+R90;
                            x=xg+size*Math.cos(dir);
                            y=y0+ystep*i;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
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
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0+dirstep*i-R90;
                            x=xg+size*Math.cos(dir);
                            y=y0+ystep*i;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
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
                        for (let i=0; i < div; ++i, ++ii){
                            x = x0 + xstep*i;
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z = z0 + zstep*i;
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
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
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0-dirstep*i+R90;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
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
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0+dirstep*i-R90;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
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
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0-dirstep*i+R90;
                            size=size0+sizestep*i;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
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
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0+dirstep*i-R90;
                            size=size0+sizestep*i;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
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
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
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
            if (geo.isLoopCourse == false) {
                geo.data.push([x, z, y]);
            }

        }

        return geo;
    }

    const metaStageInfo = {
        // ------------------------------
        100101:{label:"test",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1,
                dtype:"xz", stageType:'extrude',
                // extRot: 0.01, // 左ねじ .. 左旋回時に内向きに
                // extRot:-0.01, // 右ねじ
                data :CourseData2.DATA.test.xz,
               },

        100107:{label:"test_高低差（ゆる）＋バンク補正",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, reverse:1, cnsAccelX:0.9, cnsSpeedX:0.9, pQdbg:1,
                dtype:"xzRR", stageType:'extrude',
                data :CourseData2.DATA.test.xzR_mild_cr,
               },

        100202:{label:"test2_2024studentxo_高低差（ゆる）",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, cnsAccelX:1.1, cnsSpeedX:1.2, pQdbg:1, nbPoints:10,
                dtype:"xzRR", // stageType:'extrude',
                extRot: 0.000025, // 左ねじ .. 左旋回時に内向きに
                data :CourseData2.DATA.test2.xzRR_mild,
               },

        100203:{label:"test2_2024student_高低差（激）",
                iy:0.05, scale:0.5, grndW:400, grndH:300, adjx:-120, adjz:80, pQdbg:1, nbPoints:10,
                dtype:"xzRR", // stageType:'extrude',
                data :CourseData2.DATA.test2.xzRR_hard,
               },

        // ------------------------------
        200803:{label:"MotegiSuperSpeedway＋バンク",
                iy:0.05, scale:0.2, grndW:280, grndH:200, adjx:-120, adjz:80, cnsAccelX:1.2, cnsSpeedX:1.3, bubbleEnable:true, pQdbg:1,
                dtype:"xzRR", stageType:'extrude',
                data :CourseData2.DATA.MotegiSuperSpeedway_new.xzRR.slice(0, -3),
               },

        // ------------------------------

        200902:{label:"DaytonaSpeedway",
                scale:0.5, grndW:500, grndH:500, adjx:-200, adjz:200, cnsAccelX:1.2, cnsSpeedX:1.4, pQdbg:1,
                dtype:"xzRR",
                data :CourseData2.DATA.DaytonaSpeedway_new.xzRR.slice(0, -3),
               },

        // ------------------------------
        200102:{label:"HighSpeedRing",
                scale:0.5, grndW:1100, grndH:680, adjx:-550, adjz:340, cnsAccelX:1.1, cnsSpeedX:1.3, bubbleEnable:true, pQdbg:1, 
                dtype:"xzRR",
                data:CourseData2.DATA.HighSpeedRing_new.xzRR.slice(0, -2), // 84
               },

        // ------------------------------
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

        //凹
        7111:{label:"custom",
              grndW:600, grndH:300, adjx:-100, adjz:100, scale:0.4, pQdiv:6,
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


        //８の字
        7113:{label:"custom",
              grndW:1200, grndH:1200, adjx:100, adjz:100, scale:0.3,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              size:0.2,
              // extRot:0.020, // 左ねじ
              // extRot:0.0004, // 左ねじ
              extRot:0.00047, // 左ねじ
              // extRot:0.00048, // 左ねじ
              // extRot:0.0005, // 左ねじ

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
    let meshes4CNS = []; // CNS用
    let pStart = new BABYLON.Vector3(0, 0, 0);
    let pStart2 = new BABYLON.Vector3(0, 0, 0);
    let pGoal = new BABYLON.Vector3(0, 0, 0);

    let navigationPlugin = null, navmeshdebug = null, crowd = null, meshAgentList = [];

    var createStage = function(istage) {
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }
        meshes4CNS = [];

        let metaStageInfo = getMetaStageInfo(istage)

        let stageType = typeof(metaStageInfo.stageType) !== 'undefined' ? metaStageInfo.stageType : "extrude_round_bottom";
        let useSpline = typeof(metaStageInfo.useSpline) !== 'undefined' ? metaStageInfo.useSpline : true;
        let nbPoints = typeof(metaStageInfo.nbPoints) !== 'undefined' ? metaStageInfo.nbPoints : 20;
        let pStartIdx = typeof(metaStageInfo.pStartIdx) !== 'undefined' ? metaStageInfo.pStartIdx:1;
        let isLoopCourse = typeof(metaStageInfo.isLoopCourse) !== 'undefined' ? metaStageInfo.isLoopCourse : true;
        let iy = typeof(metaStageInfo.iy) !== 'undefined' ? metaStageInfo.iy : 5;
        let iystep = typeof(metaStageInfo.iystep) !== 'undefined' ? metaStageInfo.iystep : 0;
        let grndW = typeof(metaStageInfo.grndW) !== 'undefined' ? metaStageInfo.grndW : 200;
        let grndH = typeof(metaStageInfo.grndH) !== 'undefined' ? metaStageInfo.grndH : 200;
        let scale = typeof(metaStageInfo.scale) !== 'undefined' ? metaStageInfo.scale : 1;
        let scaleY = typeof(metaStageInfo.scaleY) !== 'undefined' ? metaStageInfo.scaleY : 1;
        let adjx = typeof(metaStageInfo.adjx) !== 'undefined' ? metaStageInfo.adjx : 0;
        let adjy = typeof(metaStageInfo.adjy) !== 'undefined' ? metaStageInfo.adjy : 0;
        let adjz = typeof(metaStageInfo.adjz) !== 'undefined' ? metaStageInfo.adjz : 0;
        let tubeCAP = typeof(metaStageInfo.tubeCAP) !== 'undefined' ? metaStageInfo.tubeCAP : BABYLON.Mesh.NO_CAP ;
        let nz = typeof(metaStageInfo.nz) !== 'undefined' ? metaStageInfo.nz : 0;
        let pQdiv = typeof(metaStageInfo.pQdiv) !== 'undefined' ? metaStageInfo.pQdiv : 0;
        let pQlist = typeof(metaStageInfo.pQlist) !== 'undefined' ? metaStageInfo.pQlist : [];
        let pQdbg = typeof(metaStageInfo.pQdbg) !== 'undefined' ? metaStageInfo.pQdbg : 0;

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

                {
                    ix = tmp[0];
                    iz = tmp[1];
                    iy_ = (tmp.length >= 3) ? tmp[2] : null;  // 高さ 絶対値
                    _iyrate = (tmp.length >= 4) ? tmp[3] : null; // 高さ 傾き
                    zRot_ = (tmp.length >= 5) ? tmp[4] : null;  // ロール
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

        } else if(metaStageInfo.dtype=='xzy') {
            // 高さを手動で指定した版
            // .. カスタムでコースを作成する場合も
            let ii =-1, ix, iz, iy;
            for (let tmp of metaStageInfo.data) {
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
            let pQQ = []; // pRouteList; // 複数ライン
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
                    {
                        j = Math.floor(i / nbPoints);
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
                            let lbltext = xzLbl[j];
                            setTextMesh(meshLbl, lbltext)
                        }
                    }
                    meshAggInfo.push([mesh,null]);
                }
            }


            if ((stageType=='extrude_square_bottom') || (stageType=='extrude')) {
                // 矩形（凹）で表示、角張ったフライパン(square pan)
                let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 6.0;
                let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 3.0;
                let myShape = [
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
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes4CNS.push(mesh);
            }

            if ((stageType=='extrude_square_bottom_narrow')) {
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

                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes4CNS.push(mesh);
            }

            if ((stageType=='extrude_round_bottom') || (stageType=='extrude_2')) { // default
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
                let mesh ;
                if (typeof(metaStageInfo.extRot) !== 'undefined') {
                    options.rotation = metaStageInfo.extRot;
                    mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                } else {
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
                }

                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes4CNS.push(mesh);
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

                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes4CNS.push(mesh);
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

                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.diffuseColor = BABYLON.Color3.Green();
                mesh.material.wireframe = true;
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
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes4CNS.push(mesh);
            }

            if (stageType=='extrude_plane2') {
                // 線分／平面で表示
                let sW = typeof(metaStageInfo.sW) !== 'undefined' ? metaStageInfo.sW : 10;
                let sH = typeof(metaStageInfo.sH) !== 'undefined' ? metaStageInfo.sH : 0.3;
                const sW_=sW/2;
                const myShape = [
                    new BABYLON.Vector3(-sW_, sH, 0),
                    new BABYLON.Vector3(-sW_, 0 , 0),
                    new BABYLON.Vector3( sW_, 0 , 0),
                    new BABYLON.Vector3( sW_, sH, 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true};
                if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes4CNS.push(mesh);
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
                meshes4CNS.push(mesh);
            }


            {
                // ゴール地点のメッシュ
                let meshSize = 20;
                if ((stageType=='extrude_square_bottom_narrow')) {
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
            var agentParams = {
                radius: cnsRadius, // 0.8, // 0.1,  // エージェントの半径。[制限: >= 0]
                reachRadius: cnsReachRadius, // 2, // 0.3, // エージェントが目的地の周囲にこの半径の仮想円内に入ると、オブザーバーに通知されます。デフォルトはエージェントの半径です。
                height: 0.2, // エージェントの高さ。[制限: > 0]
                maxAcceleration: 4.0,  // 最大許容加速度。[制限: >= 0]
                maxSpeed: 10,  // 許容される最大速度。[制限: >= 0]
                collisionQueryRange: cnsCollisionQueryRange, // 0.5,  // ステアリング動作の対象となる衝突要素がどれだけ近い必要があるかを定義します。[制限: > 0]
                pathOptimizationRange: 10.0,  // パスの可視性の最適化範囲。[制限: > 0]
                separationWeight: cnsSeparationWeight // 3.0 // エージェント マネージャーがこのエージェントとの衝突を回避する際の積極性。[制限: >= 0]
            };
            let addAgent = function() {
                let transform = new BABYLON.TransformNode();
                let meshAgent = null;
                let randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(20*Math.random()-10, 0.1, 5*Math.random()), 0.5);
                if (imymesh == 5) {
                    // 扇風機
                    let width = 2.0, widthH = 0.1;
                    meshAgent = BABYLON.MeshBuilder.CreateBox("cube", { size: width, height: widthH }, scene);
                    meshAgent.material = new BABYLON.StandardMaterial('mat2', scene);
                    meshAgent.position.y += widthH/2;
                    meshAgent.parent = transform;
                    let meshFan2 = meshFan_clone("");
                    meshFan2.position.set(0,0,0);
                    meshFan2.rotation = new BABYLON.Vector3(0, R180, 0);
                    meshFan2.parent = meshAgent; // meshAgentを削除するときに Fanを消すよう parent に設定

                } else if (imymesh == 6) {
                    // サンタ
                    let width = 2.0, widthH = 0.1;
                    meshAgent = BABYLON.MeshBuilder.CreateBox("cube", { size: width, height: widthH }, scene);
                    meshAgent.material = new BABYLON.StandardMaterial('mat2', scene);
                    meshAgent.position.y += widthH/2;
                    meshAgent.parent = transform;
                    let charPath2;
                    if (meshAgentList.length <= 2) {
                        charPath2 = charPath23;
                    } else {
                        charPath2 = charPath24;
                    }
                    addSantaPanel(null, charPath2, meshAgent);

                } else if (imymesh == 9) {
                    // UFO
                    let width = 1.2, widthH = 0.1;
                    meshAgent = BABYLON.MeshBuilder.CreateBox("cube", { size: width, height: widthH }, scene);
                    meshAgent.material = new BABYLON.StandardMaterial('mat2', scene);
                    meshAgent.position.y += widthH/2;
                    meshAgent.parent = transform;
                    let meshUFO2 = meshUFO.clone("");
                    meshUFO2.position.set(0,0,0);
                    meshUFO2.parent = meshAgent; // meshAgentを削除するときに UFOを消すよう parent に設定
                    // transform._ufo = meshUFO2;
                } else {
                    let width = 2.0; // 0.80;
                    meshAgent = BABYLON.MeshBuilder.CreateBox("cube", { size: width, height: width }, scene);
                    meshAgent.material = new BABYLON.StandardMaterial('mat2', scene);
                    meshAgent.position.y += 0.5;
                    meshAgent.parent = transform;
                }

                if (meshAgentList.length == 0) {
                    meshAgent.material.diffuseColor = BABYLON.Color3.Red();
                    agentParams.maxAcceleration = 5.50; agentParams.maxSpeed = 15.0;
                } else if (meshAgentList.length == 1) {
                    meshAgent.material.diffuseColor = BABYLON.Color3.Green();
                    agentParams.maxAcceleration = 5.60; agentParams.maxSpeed = 12.0;
                } else if (meshAgentList.length == 2) {
                    meshAgent.material.diffuseColor = BABYLON.Color3.Blue();
                    agentParams.maxAcceleration = 5.70; agentParams.maxSpeed =  9.0;
                } else {
                    meshAgent.material.diffuseColor = BABYLON.Color3.Random();
                    meshAgent.material.alpha = 0.5;
                    agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(4.0, 5.3);
                    agentParams.maxSpeed = BABYLON.Scalar.RandomRange(7.0, 12.0);
                }


                agentParams.maxAcceleration *= cnsSpeedX;
                agentParams.maxSpeed *= cnsSpeedX;
                // ルート指定 -1:pQのみ  0>=:xzRoutesから一本選択
                meshAgent.route = -1;
                let agentIndex = crowd.addAgent(randomPos, agentParams, transform);
                meshAgent._idx = agentIndex;
                meshAgentList.push(meshAgent);
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
                meshAgentList = [];
                for (let i = 0; i < iniAgents; ++i) {
                    let adID = addAgent();
                    resetAgent(adID);
                    crowd._ag2dest.push(1); // 目的地Q1を設定
                }

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
                //        if (agID < ag2dest.length) {
                if (meshAgent.route < 0) {
                    // 初期位置：スタート地点付近にテレポート
                    crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(pQ[0]));
                    // 目標位置：次の目標地点に
                    crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ[1]));
                } else {
                    let pQ_ = pQQ[meshAgent.route];
                    crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(pQ_[0]));
                    crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ_[1]));
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

            resetAllAgent(meshes4CNS, scene);

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
    }

    // ----------------------------------------
        var addSantaPanel = function(charPath1, charPath2, myMesh, adjy=0.4, adjy2=0.7, adjz2=0.3) {
            let mx = 3, my = 4;
            if (charPath1 != null) {
	        let matFB = new BABYLON.StandardMaterial("");
	        matFB.diffuseTexture = new BABYLON.Texture(charPath1);
	        matFB.diffuseTexture.hasAlpha = true;
	        matFB.emissiveColor = new BABYLON.Color3.White();
	        // let uvF = new BABYLON.Vector4(0, 0/my+clipy, 1/mx, 1/my); // B
                // let uvB = new BABYLON.Vector4(0, 3/my+clipy, 1/mx, 4/my); // F
                // let planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {size:2});
                planeFB.position.y = adjy;
                planeFB.material = matFB;
                planeFB.parent = myMesh;
                myMesh._planeFB = planeFB;
            }
	    let matLR = new BABYLON.StandardMaterial("");
	    matLR.diffuseTexture = new BABYLON.Texture(charPath2);
	    matLR.diffuseTexture.hasAlpha = true;
	    matLR.emissiveColor = new BABYLON.Color3.White();
	    // let uvL = new BABYLON.Vector4(0, 2/my, 1/mx, 3/my); // L
            // let uvR = new BABYLON.Vector4(1/mx, 1/my, 0, 2/my); // R
            // let planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvR, backUVs: uvL, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            let planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {width:4, height:2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            planeLR.position.y = adjy2;
            planeLR.position.z = adjz2;
            planeLR.material = matLR;
            planeLR.rotation = new BABYLON.Vector3(0, R90, 0);
            planeLR.parent = myMesh;
            myMesh._planeLR = planeLR;
        }

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
            vehicle._maxSteerValue = 0.2;
            vehicle._steeringIncrement = 0.005
            vehicle._steerRecover = 0.05
            vehicle._steerValue = 0
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
        }

        if (imymesh == 4) {
            // RaycastVehicle 荷重移動がわかりやすいように、やわらかめダンバー
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            const chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.emissiveColor = BABYLON.Color3.Yellow();
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
                suspensionRestLength:0.83, // !!! 0.8,                //Rest length when suspension is fully decompressed
                suspensionForce:9000, // 10000,                   //Max force to apply to the suspension/spring 
                suspensionDamping:0.14, // 0.15,                  //[0-1] Damper force in percentage of suspensionForce
                suspensionAxisLocal:new BABYLON.Vector3(0,-1,0), //Direction of the spring
                axleAxisLocal:new BABYLON.Vector3(1,0,0),        //Axis the wheel spins around
                forwardAxisLocal:new BABYLON.Vector3(0,0,1),     //Forward direction of the wheel
                sideForcePositionRatio:0.1,              //[0-1]0 = wheel position, 1 = connection point 
                // sideForce:40,                            //Force applied to counter wheel drifting
                sideForce:6, // ski な感じ
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
            // RaycastVehicle + 扇風機
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            const chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.alpha=0;
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
            const meshPlate = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.1, depth:2})
            meshPlate.material = new BABYLON.StandardMaterial("mat", scene);
            meshPlate.material.emissiveColor = BABYLON.Color3.Blue();
            meshPlate.material.alpha=0.5;
            meshPlate.position.set(0, -0.4, 0);
            meshPlate.parent = chassisMesh;
            if (meshFan != null) {
                let meshFan2 = meshFan_clone("");
                meshFan2.position.set(0,-0.5,0);
                meshFan2.rotation = new BABYLON.Vector3(0, R180, 0);
                meshFan2.parent = chassisMesh;
            } else {
                console.log("mesh is NULL!!");
            }
            // --------------------
            // 車のモデル（RaycastVehicle
            const vehicle = new Vehicle2.RaycastVehicle(chassisPhysicsBody, scene)
            vehicle.numberOfFramesToPredict = 60 //Number of frames to predict future upwards orientation if airborne
            vehicle.predictionRatio = 0; //[0-1]How quickly to correct angular velocity towards future orientation. 0 = disabled
            // --------------------
            // ホイールのメッシュ
            const wheelMesh = BABYLON.MeshBuilder.CreateCylinder("WheelMesh", {height:0.3, diameter:0.4})
            wheelMesh.material = new BABYLON.StandardMaterial("");
            wheelMesh.material.alpha = 0;
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
            vehicle._maxVehicleForce = 2200
            vehicle._maxSteerValue = 0.2; // 0.6 
            vehicle._steeringIncrement = 0.005
            vehicle._steerRecover = 0.05
            // vehicle._forwardForce = 0
            vehicle._steerValue = 0
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
            // vehicle._steerDirection = 0
        }

        if (imymesh == 6) {
            // RaycastVehicle + サンタ
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            const chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.alpha=0;
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
            const meshPlate = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.1, depth:2})
            meshPlate.material = new BABYLON.StandardMaterial("mat", scene);
            meshPlate.material.emissiveColor = BABYLON.Color3.Blue();
            meshPlate.material.alpha=0.5;
            meshPlate.position.set(0, -0.4, 0);
            meshPlate.parent = chassisMesh;
            // // if (meshFan != null) {
            // //     let meshFan2 = meshFan_clone("");
            // //     meshFan2.position.set(0,-0.5,0);
            // //     meshFan2.rotation = new BABYLON.Vector3(0, R180, 0);
            // //     meshFan2.parent = chassisMesh;
            // // } else {
            // //     console.log("mesh is NULL!!");
            // // }
            let charPath1 = charPath11;
            let charPath2 = charPath21;
            addSantaPanel(charPath1, charPath2, chassisMesh);
            chassisMesh._planeFB.material.alpha = 0.2;

            // --------------------
            // 車のモデル（RaycastVehicle
            const vehicle = new Vehicle2.RaycastVehicle(chassisPhysicsBody, scene)
            vehicle.numberOfFramesToPredict = 60 //Number of frames to predict future upwards orientation if airborne
            vehicle.predictionRatio = 0; //[0-1]How quickly to correct angular velocity towards future orientation. 0 = disabled
            // --------------------
            // ホイールのメッシュ
            const wheelMesh = BABYLON.MeshBuilder.CreateCylinder("WheelMesh", {height:0.3, diameter:0.4})
            wheelMesh.material = new BABYLON.StandardMaterial("");
            wheelMesh.material.alpha = 0;
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
            let mw=1.2, mh=0.2, md=1.2;
            myMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: mw, diameterY: mh, diameterZ: md, segments: 8 }, scene);
            myMesh.material = new BABYLON.StandardMaterial("mat", scene);
            myMesh.material.alpha=.0;
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh._agg=myAgg;
            myMesh._acc =0;
            myMesh._dampLmax = 100000;
            myMesh.physicsBody.disablePreStep = false;
            myMesh.physicsBody.setGravityFactor(0.0);   // 重力の効果
            myAgg.body.setLinearDamping(0.6); // def:0
            myAgg.body.setAngularDamping(100.0); // def: 0.1  ..逆回転の力を抑え込むための摩擦
            // // レイキャスト用の座標（前後左右を起点とする
            if (meshUFO != null) {
                let meshUFO2 = meshUFO.clone("");
                meshUFO2.position.set(0,-0.5,0);
                meshUFO2.parent = myMesh;
            } else {
                console.log("meshUFO is NULL!!");
            }
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
            //
            if (steerDirection != 0) {
                let qRot = BABYLON.Quaternion.FromEulerAngles(0, 0.02*steerDirection, 0);
                myMesh.rotationQuaternion = qRot.multiply(quat);
            }

            if (keyAction.reset) {
                resetPostureMyMesh();
                keyAction.reset = 0;
            }

        } else if ((imymesh >= 3) && (imymesh <= 6)) {
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
                const vrate = 0.5;
                let quat = myMesh.rotationQuaternion;
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                vdir = vdir.scale(vrate*myMesh._acc);
                myMesh._agg.body.applyImpulse(vdir, myMesh.absolutePosition);
            }
            //
            if (steerDirection!=0) {
                let vrate = 1;
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
                let susLen = 10, susPower=10.0;

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
        if ((imymesh >= 3) && (imymesh <= 8)) {
            // RaycastVehicle
            let vehicle = myMesh._vehicle;
            vehicle.doResetPosture();

        } else if (imymesh == 9) {
            // フロート
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
        if (imymesh == 0) {
        //} else if ((imymesh == 3) ||(imymesh == 4)) {
        } else if ((imymesh >= 3) && (imymesh <= 8)) {
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
    let cooltime_act = 0, cooltime_actIni = 20, vforceBase = 0.04, vforce = 0.04, bDash=3, jumpforce = 120;

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
        if ((map["ArrowLeft"]) && (map["ArrowRight"])) {
            keyAction.LR = true; //roll処理用
        } else if (map["ArrowLeft"]) {
            keyAction.left = true;
        } else if (map["ArrowRight"]) {
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
                if (map["C"]) {
                    icamera=(icamera+ncamera-1)%ncamera;
                } else {
                    icamera=(icamera+1)%ncamera;
                }
                changeCamera(icamera);
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
            }
            if (map["m"] || map["M"]) {
                cooltime_act = cooltime_actIni;
                if (map["M"]) {
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
            if (map["r"]) {
                cooltime_act = cooltime_actIni;
                resetMyPosi();
            }
            if ((myMesh._vehicle != null) && (map["d"] || map["D"])) {
                cooltime_act = cooltime_actIni;
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
        guiUsageRect.height = "200px";
        guiUsageRect.cornerRadius = 5;
        guiUsageRect.color = "Orange";
        guiUsageRect.thickness = 4;
        guiUsageRect.background = "green";
        guiUsageRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        guiUsageRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        guiUsageRect.zIndex=2;
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
                +"(Arrow Left/Right): Turn Left/Right\n"
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
        // guiIconUsage.zIndex="-1";
        guiIconUsage.zIndex=1;
        advancedTexture.addControl(guiIconUsage);   
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
        r2panel.height= ""+courseInfoList.length*200+"px";
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
        guiIconCourse.autoScale = false
        guiIconCourse.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIconCourse.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        guiIconCourse.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        guiIconCourse.onPointerUpObservable.add(function() {
            changeCourseView();
        });
        guiIconCourse.zIndex=1;
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
    // メッセージ表示（数秒後にフェードアウト）
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

    async function wait(second) {
	return new Promise(resolve => setTimeout(resolve, 1000 * second));
    }

    // ----------------------------------------
    // 扇風機の処理に時間がかかるため更に待ちを発生させる
    await wait(1);

    createStage(istage);
    createMyMesh();
    changeCamera(icamera);
    resetMyPosi();

    return scene;
}



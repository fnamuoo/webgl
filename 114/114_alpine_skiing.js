// Babylon.js で物理演算(havok)：アルペンスキー

//  - カーソル上/(w)              .. 前進
//  - カーソル下/(s)              .. 後進
//  - カーソル右左/(a,d)          .. 旋回
//  - r                           .. スタート（ジャンプ台の頂上に移動）
//  - space                       .. ブレーキ
//  - enter                       .. ジャンプ（姿勢を正す）
//  - (c/C[=shift+c])             .. カメラ変更
//  - (n/N[=shift+n])             .. コース（ジャンプ台）変更
//  - (m/M[=shift+m])             .. スタイル（スキー／スノボ）変更


const R5 = Math.PI/36;
const R90 = Math.PI/2;
const R180 = Math.PI;
const R270 = Math.PI*3/2;
const R360 = Math.PI*2;


// const SCRIPT_URL2 = "./Vehicle_draft2.js";
// const myTextPath = "textures/pipo-charachip007_.png"; // 男の子
// let skyboxTextPath4 = "textures/skybox4";
// let fpathFrame = "textures/flare.png";

const SCRIPT_URL2 = "../105/Vehicle2.js";
const myTextPath = "../096/textures/pipo-charachip007_.png"; // 男の子
let skyboxTextPath4 = "../111/textures/skybox4";
let fpathFrame = "../068/textures/flare.png";

// const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/105/Vehicle2.js";
// const myTextPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/096/textures/pipo-charachip007_.png"; // 男の子
// let skyboxTextPath4 = "textures/skybox4";
// let fpathFrame = "textures/flare.png";

// ----------------------------------------
// 雪煙・スプレーの効果
//   微妙にうざいかもしれないので on/off できるようにする
let bSnowSpray = true;
// let bSnowSpray = false;

// ステージクリア（３位入賞）時の自動でステージ変更
let bAutoNextStage = true;
// ステージクリア失敗時の自動で再スタート
let bAutoStart = true;

// ゲームレベル
const gameLevelEasy = 0, gameLevelNormal = 1, gameLevelHard = 2;
// let gameLevel = gameLevelEasy; // 凹凸(パーリンノイズ）なし
let gameLevel = gameLevelNormal; // 凹凸(パーリンノイズ）１倍
// let gameLevel = gameLevelHard;  // 凹凸(パーリンノイズ）２倍

// 開始ステージ
let istage=0;

// ステージごとのレコード
let stageTimeList = [
    // スノーボード
    [[26, 29, 32], // 24.299
     [35, 38, 41], // 32.065
     [46, 51, 56], // 43.301,  43.466
     [57, 60, 63], // 54.167
     [70, 75, 80], // 66,834
     [85, 90, 95], // 82.533
     [75, 80, 85], // 71.596
     [86, 90, 94], // 83.7
    ],

    // スキー
    [[23, 26, 29], // 20.132, 20.466, 21.834. 23.399
     [29, 32, 30], // 26.532
     [47, 52, 57], // 44.464, 45.999
     [53, 58, 61], // 51.401
     [77, 82, 87], // 73.932
     [85, 90, 95], // 77.933, 80.498
     [86, 89, 92], // 83.499
     [83, 86, 89], // 80.499, 86.834
    ],
];


let Vehicle2 = null;
await import(SCRIPT_URL2).then((obj) => { Vehicle2 = obj; });

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let camera = null, myMesh=null;
    let icamera = 6, icameralist = [0, 1, 6];
    let cameralist = [];
    var changeCamera = function(icamera) {
console.log("icamera=",icamera)
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            // デバッグ・記事のスナップショット用
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(5, 20,-10), scene);
            // camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 0,-50), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる

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

        if (icamera == 6) {
            // 車体とカメラを固定（進行軸が同じ）。地形の傾き（ピッチ）に影響させない
            // ＋メッシュのロールに追従すさせる
            camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }

        if (icamera >= 1 && myMesh!=null) {
            camera.lockedTarget = myMesh;
        }
    }
    scene.onBeforeRenderObservable.add((scene) => {
        if (icamera == 6) {
            let quat = myMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(0, 1, -5);
            vdir = vdir.applyRotationQuaternion(quat);
            camera.position = myMesh.position.add(vdir);
            // 上方向のベクトルを指定することで、メッシュのロールに追従すさせる
            camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        }
    });

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // --------------------

    let meshAggInfo = []; // mesh, agg;
    let pStart = new BABYLON.Vector3(0, 0, 0), pStart2 = new BABYLON.Vector3(0, 0, 0), pStart3 = new BABYLON.Vector3(0, 0, 0);

    // let istage=2;
    let istagelist=[0, 1, 2,
                    3, 4, 5,
                    6, 7,];
    let meshgatelist = [];
    let meshGate1st = null, meshGateLast = null;
    let igate, ngate;
    let gzlist = []; // 旗門のz位置
    let passGateList = []; // 0:未, -1:失敗: 1:成功

    let createGate = function(setposilist, adjz=0) {
        let matS = new BABYLON.StandardMaterial("");
        matS.diffuseColor = BABYLON.Color3.Green();
        matS.alpha = 0.8;
        // let mat = new BABYLON.StandardMaterial("");
        // mat.diffuseColor = BABYLON.Color3.Blue();
        // mat.alpha = 0.8;
        // let matLast = new BABYLON.StandardMaterial("");
        // matLast.diffuseColor = BABYLON.Color3.Red();
        // matLast.alpha = 0.8;
        meshgatelist = [];
        gzlist = [];
        passGateList = [];
        igate = -1;
        for (let p of setposilist) {
            ++igate;
            let mesh;
            if (p == setposilist[0]) {
                // 最初
                const mW=3, mH=2, mD=0.1;
                mesh = BABYLON.MeshBuilder.CreateBox("gate1st", { width:mW, height:mH, depth:mD }, scene);
                mesh.material = matS;
            } else if (p == setposilist[setposilist.length-1]) {
                // 最後
                let mW=12, mH=4, mD=0.1;
                if (gameLevel == gameLevelHard) {
                    mW+=2;
                }
                mesh = BABYLON.MeshBuilder.CreateBox("gateLast", { width:mW, height:mH, depth:mD }, scene);
            } else {
                let mW=3, mH=2, mD=0.1;
                if (gameLevel == gameLevelHard) {
                    mW+=1;
                }
                mesh = BABYLON.MeshBuilder.CreateBox("gate", { width:mW, height:mH, depth:mD }, scene);
            }
            if (igate > 0) {
                let mat = new BABYLON.StandardMaterial("");
                if ((igate%2 == 0)) {
                    mat.diffuseColor = BABYLON.Color3.Blue();
                } else {
                    mat.diffuseColor = BABYLON.Color3.Red();
                }
                mat.alpha = 0.8;
                mesh.material = mat;
            }
            mesh.position.fromArray(p);
            mesh.position.z += adjz;
            meshAggInfo.push([mesh,null]);
            meshgatelist.push(mesh);
            gzlist.push(p[2]+adjz);
            passGateList.push(0);
        }
        meshGate1st = meshgatelist[0];
        meshGateLast = meshgatelist[meshgatelist.length-1];
        igate = 0;
        ngate = meshgatelist.length;
console.log("ngate",ngate);
        return meshgatelist, meshGate1st, meshGateLast;
    }

    let initGate = function() {
        igate = 0;
        for (let i =0; i < ngate; ++i) {
            let mesh = meshgatelist[i];
            mesh.material.alpha = 0.8
        }
        passGateList.fill(0);
    }

    let createStage = function(istage) {
console.log("createStage istage=", istage);
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        let nb = new BABYLON.NoiseBlock();
        const nbvzero = new BABYLON.Vector3(0,0,0);
        let gridratio = 1, nbscale = 0.05/gridratio;

        if (istage == 0) {
            {
                // 地面
                // const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const grndW=200, grndH=500;
                const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                groundMesh.material.majorUnitFrequency = 100; 
                groundMesh.material.minorUnitVisibility  = 0.2;
                let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
                meshAggInfo.push([groundMesh,groundAggregate]);
            }
            let adjz = -100;
            // リボンによる曲面
            {
                // ベース
                let rootPath = [];
                let nxmin = -25, nxmax = 25, nzmin = -100, nzmax = 301, gridsize = 1, a=0.1;
                let p = new BABYLON.Vector3(0,0,0);
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        // let y = ((iz-nzmin)**2)*0.00150;
                        p.set(x,z,0);
                        // let y = a*iz + nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        let y = a*iz;
                        if (gameLevel == gameLevelEasy) {
                            y += 1;
                        } else if (gameLevel == gameLevelNormal) {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)+0.5;
                        } else {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        }
                        if (iz < 0) {
                            let y2 = ((z+5)**2)*0.003;
                            y = Math.max(y, y2);
                        }
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = new BABYLON.Color3(0.85, 0.90, 0.85);
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.position.z += adjz;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            // フラッグ・ゲート代わりの直方体
            {
                // 設置位置
                let setposilist = [[0,31,290],
                                   [-1,30,280],
                                   [4,27,250],
                                   [-4,22,200],
                                   [4,17,150],
                                   [-3,12,100],
                                   [3,7,50],
                                   [0,2.5,0],
                                   ];
                createGate(setposilist, adjz);
            }
            let y = 30.0, z = 295 +adjz;
            pStart = new BABYLON.Vector3(0, y, z);
            pStart2 = new BABYLON.Vector3(0, y-0.3, z-1);
            pStart3 = new BABYLON.Vector3(0, 2, adjz-2);
        }

        if (istage == 1) {
            {
                // 地面
                // const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const grndW=200, grndH=500, grndW_=grndW/2, grndH_=grndH/2;
                const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                groundMesh.material.majorUnitFrequency = 100; 
                groundMesh.material.minorUnitVisibility  = 0.2;
                let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
                meshAggInfo.push([groundMesh,groundAggregate]);
            }
            let adjz = -100;
            // リボンによる曲面
            {
                // ベース
                let rootPath = [];
                let nxmin = -25, nxmax = 25, nzmin = -100, nzmax = 301, gridsize = 1, a=0.1;
                let p = new BABYLON.Vector3(0,0,0);
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        if (iz > 0) {
                            x += 50*(Math.sin(iz*0.01)**2);
                        }
                        p.set(x,z,0);
                        // let y = a*iz + nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        let y = a*iz;
                        if (gameLevel == gameLevelEasy) {
                            y += 1;
                        } else if (gameLevel == gameLevelNormal) {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)+0.5;
                        } else {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        }
                        if (iz < 0) {
                            let y2 = ((z+5)**2)*0.003;
                            y = Math.max(y, y2);
                        }
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = new BABYLON.Color3(0.85, 0.90, 0.85);
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.position.z += adjz;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            // フラッグ・ゲート代わりの直方体
            {
                // 設置位置
                let setposilist = [[0,31,290],
                                   [2,30,280],
                                   [23,27,250],
                                   [31,22,200],
                                   [52,17,150],
                                   [26,12,100],
                                   [21,7,50],
                                   [2,2.5,0],
                                   ];
                createGate(setposilist, adjz);
            }
            let y = 30.0, z = 295 +adjz;
            pStart = new BABYLON.Vector3(0, y, z);
            pStart2 = new BABYLON.Vector3(0, y-0.3, z-1);
            pStart3 = new BABYLON.Vector3(0, 2, adjz-2);
        }


        if (istage == 2) {
            {
                // 地面
                // const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const grndW=200, grndH=800, grndW_=grndW/2, grndH_=grndH/2;
                const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                groundMesh.material.majorUnitFrequency = 100; 
                groundMesh.material.minorUnitVisibility  = 0.2;
                let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
                meshAggInfo.push([groundMesh,groundAggregate]);
            }
            let adjz = -300;
            // リボンによる曲面
            {
                // ベース
                let rootPath = [];
                let nxmin = -25, nxmax = 25, nzmin = -80, nzmax = 601, gridsize = 1, a=0.2;
                let p = new BABYLON.Vector3(0,0,0);
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        p.set(x,z,0);
                        // let y = a*iz + nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        let y = a*iz;
                        if (gameLevel == gameLevelEasy) {
                            y += 1;
                        } else if (gameLevel == gameLevelNormal) {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)+0.5;
                        } else {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        }
                        if (iz < 0) {
                            let y2 = ((z+5)**2)*0.003;
                            y = Math.max(y, y2);
                        }
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = new BABYLON.Color3(0.85, 0.90, 0.85);
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.position.z += adjz;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            // フラッグ・ゲート代わりの直方体
            {
                // 設置位置
                let setposilist = [[0,120,590],
                                   [2,112,550],
                                   [-4,102,500],
                                   [4,92,450],
                                   [-3,82,400],
                                   [5,72,350],
                                   [-4,62,300],
                                   [4,52,250],
                                   [-5,42,200],
                                   [3,32,150],
                                   [-3,22,100],
                                   [3,12,50],
                                   [0,2.5,0],
                                   ];
                createGate(setposilist, adjz);
            }
            let y = 120.0, z = 595+adjz;
            pStart = new BABYLON.Vector3(0, y, z);
            pStart2 = new BABYLON.Vector3(0, y-0.3, z-1);
            pStart3 = new BABYLON.Vector3(0, 2, adjz-2);
        }

        if (istage == 3) {
            {
                // 地面
                // const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const grndW=200, grndH=800, grndW_=grndW/2, grndH_=grndH/2;
                const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                groundMesh.material.majorUnitFrequency = 100; 
                groundMesh.material.minorUnitVisibility  = 0.2;
                let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
                meshAggInfo.push([groundMesh,groundAggregate]);
            }
            let adjz = -300;
            // リボンによる曲面
            {
                // ベース
                let rootPath = [];
                let nxmin = -25, nxmax = 25, nzmin = -80, nzmax = 601, gridsize = 1, a=0.2;
                let p = new BABYLON.Vector3(0,0,0);
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        if (iz > 0) {
                            x += -40*(Math.sin(iz*0.010)**2);
                        }
                        p.set(x,z,0);
                        // let y = a*iz + nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        let y = a*iz;
                        if (gameLevel == gameLevelEasy) {
                            y += 1;
                        } else if (gameLevel == gameLevelNormal) {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)+0.5;
                        } else {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        }
                        if (iz < 0) {
                            let y2 = ((z+5)**2)*0.003;
                            y = Math.max(y, y2);
                        }
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = new BABYLON.Color3(0.85, 0.90, 0.85);
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.position.z += adjz;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            // フラッグ・ゲート代わりの直方体
            {
                // 設置位置
                let setposilist = [[0,120,590],
                                   [-28,112,550],
                                   [-26,102,500],
                                   [-38,92,450],
                                   [-17,82,400],
                                   [-17,72,350],
                                   [  3,62,300],
                                   [-21,52,250],
                                   [-25,42,200],
                                   [-40,32,150],
                                   [-21,22,100],
                                   [-20,12,50],
                                   [-2,2.5,0],
                                   ];
                createGate(setposilist, adjz);
            }
            let y = 120.0, z = 595+adjz;
            pStart = new BABYLON.Vector3(0, y, z);
            pStart2 = new BABYLON.Vector3(0, y-0.3, z-1);
            pStart3 = new BABYLON.Vector3(0, 2, adjz-2);
        }


        if (istage == 4) {
            {
                // 地面
                // const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const grndW=200, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                groundMesh.material.majorUnitFrequency = 100; 
                groundMesh.material.minorUnitVisibility  = 0.2;
                let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
                meshAggInfo.push([groundMesh,groundAggregate]);
            }
            let adjz = -400;
            // リボンによる曲面
            {
                // ベース
                let rootPath = [];
                let nxmin = -25, nxmax = 25, nzmin = -80, nzmax = 1001, gridsize = 1, a=0.3;
                let p = new BABYLON.Vector3(0 ,0,0);
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        p.set(x,z,0);
                        // let y = a*iz + nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        // let y = a*iz + nb.noise(8, 0.5, p, nbvzero, nbscale);
                        // let y = a*iz+1
                        let y = a*iz;
                        if (gameLevel == gameLevelEasy) {
                            y += 1;
                        } else if (gameLevel == gameLevelNormal) {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)+0.5;
                        } else {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        }
                        if (iz < 0) {
                            let y2 = ((z+5)**2)*0.003;
                            y = Math.max(y, y2);
                        }
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = new BABYLON.Color3(0.85, 0.90, 0.85);
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.position.z += adjz;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            // フラッグ・ゲート代わりの直方体
            {
                // 設置位置
                let setposilist = [[0,299,990],
                                   [-3,287,950],
                                   [3,272,900],
                                   [-3,257,850],
                                   [3,242,800],
                                   [-3,227,750],
                                   [3,212,700],
                                   [-3,197,650],
                                   [3,182,600],
                                   [-3,167,550],
                                   [3,152,500],
                                   [-3,137,450],
                                   [1,122,400],
                                   [-5,107,350],
                                   [3,92,300],
                                   [-3,77,250],
                                   [4,62,200],
                                   [-2,47,150],
                                   [3,32,100],
                                   [-3,17,50],
                                   [0,2.5,0],
                                   ];
                createGate(setposilist, adjz);
            }
            let y = 300.0, z = 995+adjz;
            pStart = new BABYLON.Vector3(0, y, z);
            pStart2 = new BABYLON.Vector3(0, y-0.3, z-1);
            pStart3 = new BABYLON.Vector3(0, 2, adjz-2);
        }

        if (istage == 5) {
            {
                // 地面
                // const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const grndW=200, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                groundMesh.material.majorUnitFrequency = 100; 
                groundMesh.material.minorUnitVisibility  = 0.2;
                let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
                meshAggInfo.push([groundMesh,groundAggregate]);
            }
            let adjz = -400;
            // リボンによる曲面
            {
                // ベース
                let rootPath = [];
                let nxmin = -25, nxmax = 25, nzmin = -80, nzmax = 1001, gridsize = 1, a=0.3;
                let p = new BABYLON.Vector3(0 ,0,0);
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        if (iz > 0) {
                            x += 30*(Math.sin(iz*0.01)**2);
                        }
                        p.set(x,z,0);
                        // let y = a*iz + nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        // let y = a*iz + nb.noise(8, 0.5, p, nbvzero, nbscale);
                        let y = a*iz;
                        if (gameLevel == gameLevelEasy) {
                            y += 1;
                        } else if (gameLevel == gameLevelNormal) {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)+0.5;
                        } else {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        }
                        if (iz < 0) {
                            let y2 = ((z+5)**2)*0.003;
                            y = Math.max(y, y2);
                        }
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = new BABYLON.Color3(0.85, 0.90, 0.85);
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.position.z += adjz;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            // フラッグ・ゲート代わりの直方体
            {
                // 設置位置
                let setposilist = [[0,299,990],
                                   [-4,287,950],
                                   [13,272,900],
                                   [12,257,850],
                                   [28,242,800],
                                   [15,227,750],
                                   [15,212,700],
                                   [ 1,197,650],
                                   [12,182,600],
                                   [13,167,550],
                                   [26,152,500],
                                   [19,137,450],
                                   [21,122,400],
                                   [6,107,350],
                                   [10,92,300],
                                   [7,77,250],
                                   [27,62,200],
                                   [20,47,150],
                                   [25,32,100],
                                   [2,17,50],
                                   [0,2.5,0],
                                   ];
                createGate(setposilist, adjz);
            }
            let y = 300.0, z = 995+adjz;
            pStart = new BABYLON.Vector3(0, y, z);
            pStart2 = new BABYLON.Vector3(0, y-0.3, z-1);
            pStart3 = new BABYLON.Vector3(0, 2, adjz-2);
        }

        if (istage == 6) {
            {
                // 地面
                const grndW=200, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                groundMesh.material.majorUnitFrequency = 100; 
                groundMesh.material.minorUnitVisibility  = 0.2;
                let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
                meshAggInfo.push([groundMesh,groundAggregate]);
            }
            let adjz = -400;
            // リボンによる曲面
            {
                // ベース
                let rootPath = [];
                let nxmin = -25, nxmax = 25, nzmin = -80, nzmax = 1001, gridsize = 1, a=0.5;
                let p = new BABYLON.Vector3(0 ,0,0);
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        p.set(x,z,0);
                        let y = a*iz;
                        if (gameLevel == gameLevelEasy) {
                            y += 1;
                        } else if (gameLevel == gameLevelNormal) {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)+0.5;
                        } else {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        }
                        if (iz < 0) {
                            let y2 = ((z-2)**2)*0.01;
                            y = Math.max(y, y2);
                        }
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = new BABYLON.Color3(0.85, 0.90, 0.85);
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.position.z += adjz;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            // フラッグ・ゲート代わりの直方体
            {
                // 設置位置
                let setposilist = [[0,497,990],
                                   [-3,477,950],
                                   [3,452,900],
                                   [-3,427,850],
                                   [3,402,800],
                                   [-4,377,750],
                                   [3,352,700],
                                   [-3,327,650],
                                   [2,302,600],
                                   [-4,277,550],
                                   [3,252,500],
                                   [-3,227,450],
                                   [1,202,400],
                                   [-5,177,350],
                                   [3,152,300],
                                   [-3,127,250],
                                   [4,102,200],
                                   [-2,77,150],
                                   [3,52,100],
                                   [-3,27,50],
                                   [0,2.5,0],
                                   ];
                createGate(setposilist, adjz);
            }
            let y = 505.0, z = 995+adjz;
            pStart = new BABYLON.Vector3(0, y, z);
            pStart2 = new BABYLON.Vector3(0, y-0.3, z-1);
            pStart3 = new BABYLON.Vector3(0, 2, adjz-2);
        }

        if (istage == 7) {
            {
                // 地面
                // const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const grndW=200, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
                const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                groundMesh.material.majorUnitFrequency = 100; 
                groundMesh.material.minorUnitVisibility  = 0.2;
                let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
                meshAggInfo.push([groundMesh,groundAggregate]);
            }
            let adjz = -400;
            // リボンによる曲面
            {
                // ベース
                let rootPath = [];
                let nxmin = -25, nxmax = 25, nzmin = -80, nzmax = 1001, gridsize = 1, a=0.5;
                let p = new BABYLON.Vector3(0,0,0);
                for (let iz = nzmin; iz < nzmax; ++iz) {
                    let z = iz*gridsize;
                    let path = []
                    for (let ix = nxmin; ix < nxmax; ++ix) {
                        let x = ix*gridsize;
                        if (iz > 0) {
                            x += -30*(Math.sin(iz*0.013)**2);
                        }
                        x += 15;
                        p.set(x,z,0);
                        let y = a*iz;
                        if (gameLevel == gameLevelEasy) {
                            y += 1;
                        } else if (gameLevel == gameLevelNormal) {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)+0.5;
                        } else {
                            y += nb.noise(8, 0.5, p, nbvzero, nbscale)*2;
                        }
                        if (iz < 0) {
                            let y2 = ((z+5)**2)*0.003;
                            y = Math.max(y, y2);
                        }
                        path.push(new BABYLON.Vector3(x, y, z));
                    }
                    rootPath.push(path);
                }
                let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let mat = new BABYLON.StandardMaterial("");
                mat.diffuseColor = new BABYLON.Color3(0.85, 0.90, 0.85);
                mat.wireframe = true;
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction:0.01, restitution:0.01}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.y += 0.01;
                trgMesh.position.z += adjz;
                trgMesh.physicsBody.disablePreStep = false;
                meshAggInfo.push([trgMesh,trgAgg]);
            }
            // フラッグ・ゲート代わりの直方体
            {
                // 設置位置
                let setposilist = [[10,497,990],
                                   [1,477,950],
                                   [2,452,900],
                                   [-13,427,850],
                                   [2,402,800],
                                   [-1,377,750],
                                   [6,352,700],
                                   [-13,327,650],
                                   [-3,302,600],
                                   [-8,277,550],
                                   [13,252,500],
                                   [-3,227,450],
                                   [-2,202,400],
                                   [-18,177,350],
                                   [6,152,300],
                                   [5,127,250],
                                   [10,102,200],
                                   [-15,77,150],
                                   [0,52,100],
                                   [-3,27,50],
                                   [15,2.5,0],

                                   ];
                createGate(setposilist, adjz);
            }
            let x = 10, y = 500.0, z = 995+adjz;
            pStart = new BABYLON.Vector3(x, y, z);
            pStart2 = new BABYLON.Vector3(x, y-0.3, z-1);
            pStart3 = new BABYLON.Vector3(0, 2, adjz-2);
        }

        initGate();

        if (1) {
            // Skybox
            let skyboxTextPath = skyboxTextPath4;
            let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:4000.0}, scene);
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skybox.material = skyboxMaterial;
            meshAggInfo.push([skybox,null]);
        }

    }

    let imymesh = 1;
    let mymeshList = [0, 1];
    let createMyMesh = function() {
        if ((myMesh!=null) && (myMesh._vehicle._wheelMeshes.length>0)) {
            for (let m of myMesh._vehicle._wheelMeshes) { m.dispose(); }
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
	    let uvF = new BABYLON.Vector4(0, 0/my+clipy, 1/mx, 1/my); // B
            let uvB = new BABYLON.Vector4(0, 3/my+clipy, 1/mx, 4/my); // F
            let planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            planeFB.position.y = adjy;
            planeFB.material = matFB;
            planeFB.parent = myMesh;
            myMesh._planeFB = planeFB;
	    let matLR = new BABYLON.StandardMaterial("");
	    matLR.diffuseTexture = new BABYLON.Texture(charPath);
	    matLR.diffuseTexture.hasAlpha = true;
	    matLR.emissiveColor = new BABYLON.Color3.White();
	    let uvL = new BABYLON.Vector4(0, 2/my, 1/mx, 3/my); // L
            let uvR = new BABYLON.Vector4(1/mx, 1/my, 0, 2/my); // R
            let planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvR, backUVs: uvL, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            planeLR.position.y = adjy;
            planeLR.material = matLR;
            planeLR.rotation = new BABYLON.Vector3(0, R90, 0);
            planeLR.parent = myMesh;
            myMesh._planeLR = planeLR;
        }

        if (imymesh == 0) {
            // RaycastVehicle + ボード
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            let chassisMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: 1.0, diameterY: 0.5, diameterZ: 4.0, segments: 8 }, scene); // 093_board
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.emissiveColor = BABYLON.Color3.Blue();
            chassisMesh.material.alpha=0.7;
            chassisMesh.position.y = 5
            chassisMesh.position.x = 0
            chassisMesh.rotationQuaternion = new BABYLON.Quaternion()
            addCharPanel(myTextPath, chassisMesh, 1.1, 0.01);
            chassisMesh._planeFB.material.alpha=0.1; // ボード上のキャラの横方向のパネルは透明に
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
            // wheelMesh.material.diffuseColor = BABYLON.Color3.Gray();
            // wheelMesh.material.wireframe=1;
            wheelMesh.material.alpha = 0;
            let wheelMeshes = [wheelMesh, wheelMesh.createInstance(1), wheelMesh.createInstance(2), wheelMesh.createInstance(3)]
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
            vehicle._maxSteerValue = 0.2; // 0.6 
            vehicle._steeringIncrement = 0.005
            vehicle._steerRecover = 0.05
            vehicle._steerValue = 0
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
        }

        if (imymesh == 1) {
            // RaycastVehicle + スキー板
            // ----------------------------------------
            // シャーシ：本体のメッシュ
            const chassisMesh = BABYLON.MeshBuilder.CreateBox("Chassis", {width:1, height:0.4, depth:2})
            chassisMesh.material = new BABYLON.StandardMaterial("mat", scene);
            chassisMesh.material.alpha=0;
            chassisMesh.position.y = 5;
            chassisMesh.position.x = 0;
            chassisMesh.rotationQuaternion = new BABYLON.Quaternion()
            addCharPanel(myTextPath, chassisMesh, 0.5, 0.01);
            chassisMesh._planeFB.material.alpha=0.1; // ボード上のキャラの横方向のパネルは透明に
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
            wheelMesh.material.alpha = 0;
            let wheelMeshes = [wheelMesh, wheelMesh.createInstance(1), wheelMesh.createInstance(2), wheelMesh.createInstance(3)]
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
            vehicle._maxSteerValue = 0.2; // 0.6 
            vehicle._steeringIncrement = 0.005
            vehicle._steerRecover = 0.05
            vehicle._steerValue = 0
            vehicle._driveSystem = 0; // 0:4WD, 1:FF, 2:FR
            // 表示用メッシュ／スキー板
            let myViewMesh = BABYLON.MeshBuilder.CreateSphere("skiboard", { diameterX: 0.3, diameterY: 0.1, diameterZ: 4.0, segments: 8 }, scene);
            myViewMesh.material = new BABYLON.StandardMaterial("mat", scene);
            let myViewMesh2 = myViewMesh.clone();
            myViewMesh.position.x = -0.3;
            myViewMesh.position.y = -0.5;
            myViewMesh.parent = chassisMesh;
            myViewMesh2.position.x = 0.3;
            myViewMesh2.position.y = -0.5;
            myViewMesh2.parent = chassisMesh;
        }

        if (bSnowSpray && particleSystem != null) {
            particleSystem.emitter = myMesh;
        }

        return myMesh
    }

    let updateMyMesh = function() {
        let forwardForce, steerDirection, roll;

        //if ((imymesh == 0) ||(imymesh == 1)) {
        {
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
            if (imymesh == 1) {
                vehicle.wheels[0].steering = -vehicle._steerValue // 後輪にも舵角を
                vehicle.wheels[1].steering = -vehicle._steerValue
            }
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
                resetMyMeshPosture();
                keyAction.reset = 0;
                // jumpPList = [];
            }
        // } else {
        //     console.log("under cunstrunction");
        }

    }

    let resetMyMeshPosture = function() {
            let vehicle = myMesh._vehicle;
            vehicle.doResetPosture();
    }

    let resetMyPosi = function () {
        if (myMesh==null) {
            return;
        }
        myMesh.position = pStart.clone();
        myMesh.position.y += 2;
        let p1 = pStart.clone();
        let p3 = pStart2.clone();
        p3.subtractInPlace(p1);
        myMesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
        let vrot = Math.atan2(p3.x, p3.z);
        myMesh.rotate(BABYLON.Vector3.Up(), vrot);
        let vpitch = Math.atan2(p3.z, p3.y) +R90;
        myMesh.rotate(BABYLON.Vector3.Left(), vpitch);
        //  myMesh.rotate(BABYLON.Vector3.Forward(), vpitch);
        myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める

        initGate();
    }

    let resetMyPosi2 = function () {
        if (myMesh==null) {
            return;
        }
        resetMyPosi();
        myMesh.position = pStart3.clone();
    }

    // Getting Started - Chapter 6 - Particle Spray
    // https://doc.babylonjs.com/features/introductionToFeatures/chap6/particlespray/
    // https://playground.babylonjs.com/?inspectorv2=true#TC31NV#4
    // ターン時の巻きあがる雪、雪煙・スプレーの効果

    // Create a particle system
    let particleSystem = null;
    let createParticleSystem = function() {
        if (bSnowSpray==false) {
            return;
        }
        if (particleSystem!=null) {
            particleSystem.dispose();
        }
        particleSystem = new BABYLON.ParticleSystem("particles", 5000, scene);
        //Texture of each particle
        particleSystem.particleTexture = new BABYLON.Texture(fpathFrame, scene);
        // Where the particles come from
        particleSystem.emitter = myMesh; // new BABYLON.Vector3(0, 10, 0); // the starting object, the emitter
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.2, -0.1, 1.5); // Starting all from
        particleSystem.maxEmitBox = new BABYLON.Vector3(-0.2, -0.1, -2); // To...
        // Colors of all particles
        particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
        // Size of each particle (random between...
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.5;
        // Life time of each particle (random between...
        particleSystem.minLifeTime = 0.8;
        particleSystem.maxLifeTime = 1.2;
        // Emission rate
        // particleSystem.emitRate = 1500;
        particleSystem.emitRate = 500;
        // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        // Set the gravity of all particles
        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
        // Direction of each particle after it has been emitted
        particleSystem.direction1 = new BABYLON.Vector3(-3, 4, 0.5);
        particleSystem.direction2 = new BABYLON.Vector3(-3, 4, -1);
        // Angular speed, in radians
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        // Speed
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.025;
    }
    var startParticleSystem = function() {
        // Start the particle system
        particleSystem.start();
    };
    var stopParticleSystem = function() {
        particleSystem.stop();
    };
    var setEmitSide = function(iside) {
        if (iside == 0) {
            // 左側
            particleSystem.minEmitBox = new BABYLON.Vector3(-0.3, -0.5, 1.5); // Starting all from
            particleSystem.maxEmitBox = new BABYLON.Vector3(-0.3, -0.5, -2); // To...
            particleSystem.direction1 = new BABYLON.Vector3(-1, 1, 0.1);
            particleSystem.direction2 = new BABYLON.Vector3(-1, 1, -0.5);
        } else {
            // 右側
            particleSystem.minEmitBox = new BABYLON.Vector3(0.3, -0.5, 1.5); // Starting all from
            particleSystem.maxEmitBox = new BABYLON.Vector3(0.3, -0.5, -2); // To...
            particleSystem.direction1 = new BABYLON.Vector3(1, 1, 0.1);
            particleSystem.direction2 = new BABYLON.Vector3(1, 1, -0.5);
        }
    }

    if (bSnowSpray) {
        scene.registerAfterRender(function() {
            if (getSpeed() < 15) { // 15*3.6=54[km/h]未満ならskip
                stopParticleSystem();
                return;
            }
            // 姿勢の前方ベクトル
            let quat = myMesh.rotationQuaternion;
            let vforward = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
            // 移動ベクトル・速度ベクトル
            let vMove = myMesh._vehicle.body.getLinearVelocity();
            // 前方と移動のズレを外積でもとめる
            let vCross = vforward.cross(vMove);
            if (Math.abs(vCross.length()) < 5) {
                // スピードがあっても、向きと移動がズレていなければ無視
                stopParticleSystem();
                return;
            }
            startParticleSystem();
            if (vCross.y > 0) {
                // 右側にエフェクト
                setEmitSide(1);
            } else {
                // 左側にエフェクト
                setEmitSide(0);
            }
        })
    }

    // ゲートの通過、時間計測
    let pftime, timeCur; // 時間計測用
    scene.registerAfterRender(function() {
        if (igate == ngate) {
            return;
        }
        if (myMesh.intersectsMesh(meshgatelist[igate], true)) {
            // ゲートとの接触を確認
            passGateList[igate] = 1; // 通過フラグを立てる
            console.log("gate["+igate+"]=o");
            if (meshgatelist[igate] == meshGateLast) {
                // タイマー停止
                let pftimeEnd = performance.now();
                timeCur = Math.floor(pftimeEnd-pftime)/1000;
                let goalenable = true;
                for (let v of passGateList) {
                    if (v < 0) {
                        goalenable = false;
                        break;
                    }
                }
                if (goalenable) {
                    console.log("GOAL!! time=", timeCur);
                    if (stageTimeList[imymesh][istage][0] > timeCur) {
                        setText2("Cong!!! 1st prize! time="+timeCur);
                        setNextStage();
                    } else if (stageTimeList[imymesh][istage][1] > timeCur) {
                        setText2("Great!! 2nd prize! time="+timeCur);
                        setNextStage();
                    } else if (stageTimeList[imymesh][istage][2] > timeCur) {
                        setText2("Good!   3rd prize! time="+timeCur);
                        setNextStage();
                    } else {
                        setText2("GOAL!! time="+timeCur);
                        setRestart();
                    }
                    console.log("stage=",istage, "org", stageTimeList[imymesh][istage]);
                    let tlist = stageTimeList[imymesh][istage];
                    tlist.push(timeCur);
                    tlist.sort();
                    tlist.pop();
                    // updateRecoard();
                    stageTimeList[imymesh][istage] = tlist;
                    console.log("stage=",istage, "new", stageTimeList[imymesh][istage]);
                } else {
                    setText2("Disqualified (;_;)");
                    timeCur = 0; // 失格。未公認記録
                    setRestart();
                }
            } else if (meshgatelist[igate] == meshGate1st) {
                // タイマー開始
                pftime = performance.now();
                timeCur = -1;
            }
            meshgatelist[igate].material.alpha = 0.1; // 通過したゲートをより透明に
            ++igate;
            return;
        }

        if (myMesh.position.z < gzlist[igate]) {
            // ゲートを外れて通過した場合
            if (passGateList[igate] == 0) {
                passGateList[igate] = -1; // 未通過フラグを立てる
                console.log("gate["+igate+"]=xxx");
            }
            ++igate;
            if (igate == ngate) {
                setText2("miss GOAL (x_x)");
                setRestart();
            }
        }
    })


    let getSpeed = function() {
        let speed = myMesh._vehicle.speed;
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
        if (map["z"]) {
            {
                console.log("p=",[myMesh.position.x, myMesh.position.y, myMesh.position.z]);
            }
        }
        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["Enter"]) {
                cooltime_act = cooltime_actIni*10; // 空中で再度ジャンプしないようにクールタイム多め
                keyAction.reset = true;
            }
            if (map["c"] || map["C"]) {
                cooltime_act = cooltime_actIni;
                let i = icameralist.indexOf(icamera);
                console.assert(i >= 0);
                if (map["C"] || map["shift"]) {
                    i = (i+icameralist.length-1) % icameralist.length;
                } else {
                    i = (i+1) % icameralist.length;
                }
                icamera=icameralist[i];
                changeCamera(icamera);
            }
            if (map["n"] || map["N"] || map["p"] || map["P"] || map["b"] || map["B"]) {
                cooltime_act = cooltime_actIni;
                if ((map["N"] || map["p"] || map["b"])) {
                    let i = istagelist.indexOf(istage);
                    console.assert(i >= 0);
                    i = (i+istagelist.length-1)%istagelist.length;
                    istage = istagelist[i];

                } else {
                    let i = istagelist.indexOf(istage);
                    console.assert(i >= 0);
                    i = (i+1)%istagelist.length;
                    istage = istagelist[i];
                }
                createStage(istage);
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
                createParticleSystem();
            }
            if (map["r"]) { // 'r'
                cooltime_act = cooltime_actIni;
                resetMyPosi();
            }
            if (map["z"]) { // 'z'
                cooltime_act = cooltime_actIni;
                resetMyPosi2();
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

        let speed = getSpeed();
        setText1(speed);
    })

    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // ------------------------------
    // スピードメーター（上部中央）
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Ready!";
    // text1.text = "";
    text1.color = "white";
    text1.fontSize = 24; // 24;
    text1.height = "36px";
    text1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text1);

    let setText1 = function(val) {
        val = Math.floor(val*3.6) // [m/s]を [km/h]に直す
        text1.text = "" + val + " [km/h]"
    }

    // ----------------------------------------
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
                +"(Arrow UP/w): Forward\n"
                +"(Arrow DOWN/s): Back\n"
                +"(Arrow Left/a): Left\n"
                +"(Arrow Right/d): Right\n"
                +"(r) : Start(Go to TOP position of JUMP stage)\n"
                +"(space) : Brake\n"
                +"(enter) : Jump/Reset posture\n"
                +"(c/C) : Change Camera\n"
                +"(n/N) : Change Stage\n"
                +"(m/M) : Change Style\n"
                +"h: show/hide this message";
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
    // ゴール時の処理

    // ３位入賞時に次のステージに自動で変更
    let nextStage = function() {
        let i = istagelist.indexOf(istage);
        console.assert(i >= 0);
        i = (i+1)%istagelist.length;
        istage = istagelist[i];
        createStage(istage);
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

    // ----------------------------------------
    createStage(istage);
    // clearJumpLine();
    createMyMesh();
    changeCamera(icamera);
    resetMyPosi();
    createParticleSystem();
    // updateRecoard();
    clearText2();

    return scene;
}


// ----------------------------------------------------------------------

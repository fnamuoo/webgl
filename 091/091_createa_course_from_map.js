// Babylon.js：画像からコース作り（２／２）

// for local
//const SCRIPT_URL1 = "./CourseData.js";
//let goalPath ="textures/amiga.jpg";

// // for local
const SCRIPT_URL1 = "../090/CourseData.js";
let goalPath ="../078/textures/amiga.jpg";


// for PlayGround
// const SCRIPT_URL1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/090/CourseData.js";
//let goalPath ="textures/amiga.jpg";


let CourseData = null;
import(SCRIPT_URL1).then((obj) => { CourseData = obj; });

const R90 = Math.PI/2;


var createScene = async function () {
    await BABYLON.InitializeCSG2Async();

    const metaStageInfo = {
        100103:{label:"GT5_Circuit_High_Speed_Ring_Fwd",
                iy: 0.2, iystep: 0, scale: 0.2, grndW:240, grndH:140, adjx: -110, adjz: -90, nz: 800, stageType:'extrude', gardW:5, gardH:1, debugMesh:1, cnsNAgent:10, cnsSpeedX:2.0,
                dtype:"xz",
                data: CourseData.DATA.HighSpeedRing_new.xz,
               },
        100111:{label:"GT5_Circuit_High_Speed_Ring_Fwd(2)",
                iy: 0.2, scale: 0.2, scaleY: 1.5, grndW:240, grndH:140, adjx: -110, adjz: -90, nz: 800, stageType:'ribbon', sW:10, cnsReachRadius:6, guideH:1.8, debugMesh:1, cnsSpeedX:2.2, // pQdbg:1,
                dtype:"xz_",
                data: CourseData.DATA.HighSpeedRing_new.xz_1,
               },
        100112:{label:"GT5_Circuit_High_Speed_Ring_Fwd(3)",
                iy: 0.2, scale: 0.2, scaleY: 1.5, grndW:240, grndH:140, adjx: -110, adjz: -90, nz: 800, stageType:'ribbon', sW:10, cnsReachRadius:6, guideH:1.8, debugMesh:1, cnsSpeedX:2.2, // pQdbg:1,
                dtype:"xz_",
                data: CourseData.DATA.HighSpeedRing_new.xz_2,
               },

        // ------------------------------
        100202:{label:"GT5_Circuit_Autumn_Ring",
                iy: 0.1, iystep: 0, scale: 0.2, grndW:240, grndH:160, adjx: -110, adjz: -80, nz: 800, stageType:'extrude_plane', sW:10, cnsReachRadius:6, debugMesh: 1, pQdbg:1, cnsSpeedX:2.5,
                dtype:"xz",
                data : CourseData.DATA.AutumnRing_new.xz,
                pQlist: CourseData.DATA.AutumnRing_new.pq,
               },
        100211:{label:"GT5_Circuit_Autumn_Ring",
                scale: 0.2, scaleY:1, grndW:240, grndH:160, adjx: -110, adjz: -80, nz: 800, stageType:'ribbon', sW:8, guideH:1.8, debugMesh: 1, cnsNAgent:10, cnsSpeedX:2.5, // pQdbg:1,
                dtype:"xzR",
                data : CourseData.DATA.AutumnRing_new.xzR,
                //pQlist: CourseData.DATA.AutumnRing.pq,
               },

        // ------------------------------
        100301:{label:"CotedAzur",
                iy: 0.2, iystep: 0, scale: 0.3, grndW:340, grndH:280, adjx: -160, adjz: -110, nz: 800, stageType:'ribbon', sW:5, guideH:1.8, debugMesh:1, cnsNAgent:10, cnsSpeedX:2.5,
                dtype:"xz",
                data : CourseData.DATA.CotedAzur_new.xz,
               },
        100302:{label:"CotedAzur",
                iy: 0.2, iystep: 0, scale: 0.3, grndW:340, grndH:280, adjx: -160, adjz: -110, nz: 800, stageType:'ribbon', sW:5, guideH:1.8, debugMesh:1, cnsNAgent:10, cnsSpeedX:2.5, // pQdbg:1,
                dtype:"xzR",
                data : CourseData.DATA.CotedAzur_new.xzR,
               },

        // ------------------------------
        100411:{label:"GT5_circuit_Suzuka",
                iy: 0.2, iystep: 0, scale:0.3, scaleY:1, grndW:330, grndH:230, adjx: -160, adjz: -130, nz: 800, stageType:'ribbon', sW:6, guideH:1.8, debugMesh:1, cnsNAgent:8, cnsSpeedX:2.8, // pQdbg:1,
                dtype:"xzR",
                data : CourseData.DATA.Suzuka_new.xzR,
               },

        // ------------------------------
        100501:{label:"mm2024_00_zenkoku__MM2024RT",
                iy: 0.1, iystep: 0, scale: 0.1, grndW:320, grndH:160, adjx: -150, adjz: -50, nz: 1200, stageType:'extrude_plane', sW:4, debugMesh:1, pQdbg:1, cnsSpeedX:3,//  pQdiv:6,
                dtype:"xz",
                data : CourseData.DATA.mm2024_00_zenkoku_new.xz,
                pQlist: CourseData.DATA.mm2024_00_zenkoku_new.pq,
               },
        100511:{label:"mm2024_00_zenkoku__MM2024RT",
                iy:1, iystep: 0, scale:0.2, scaleY:3, grndW:600, grndH:260, adjx:-300, adjz:-100, nz: 1200, stageType:'ribbon', sW:7, guideH:1.8, debugMesh:1, cnsNAgent:8, cnsSpeedX:2.8, // pQdbg:1,
                dtype:"xzR",
                data : CourseData.DATA.mm2024_00_zenkoku_new.xzR,
                pQlist: CourseData.DATA.mm2024_00_zenkoku_new.pq,
               },

        // ------------------------------
        100601:{label:"mm2024_04_tyubu__MM2024_chubu_RT",
                iy: 0.1, iystep: 0, scale:0.2, grndW:600, grndH:300, adjx:-350, adjz:10, nz: 1200, stageType:'extrude_plane', sW:10, cnsReachRadius:6, debugMesh:1, pQdbg:0, cnsNAgent:10, cnsSpeedX:2.4, // pQdbg:1,
                dtype:"xz",
                data : CourseData.DATA.mm2024_04_tyubu_new.xz,
                pQlist: CourseData.DATA.mm2024_04_tyubu_new.pq,
               },
        100612:{label:"mm2024_04_tyubu__MM2024_chubu_RT",
                iy: 2, iystep: 0, scale: 0.2, grndW:600, grndH:300, adjx:-350, adjz:10, nz: 1200, stageType:'ribbon', sW: 7, guideH:1.8, debugMesh: 1, cnsCS:0.2, cnsNAgent:10, cnsSpeedX:2.8, // pQdbg:1,
                dtype:"xzR",
                data : CourseData.DATA.mm2024_04_tyubu_new.xzR,
                pQlist: CourseData.DATA.mm2024_04_tyubu_new.pq,
               },

        // ------------------------------
        100701:{label:"mm2024_08_knasai__MM2024_kansai_RT",
                iy: 0.2, iystep: 0, scale: 0.2, grndW:200, grndH:160, adjx:-100, adjz:-80, nz: 800, stageType:'extrude_plane', sW:7, cnsReachRadius:4, debugMesh:1, cnsNAgent:10, cnsSpeedX:4, // pQdbg:1,
                dtype:"xz",
                data : CourseData.DATA.mm2024_08_knasai_new.xz,
                pQlist: CourseData.DATA.mm2024_08_knasai_new.pq,
               },
        100711:{label:"mm2024_08_knasai__MM2024_kansai_RT",
                iy: 2, iystep: 0, scale:0.2, grndW:200, grndH:160, adjx:-100, adjz:-80, nz: 800, stageType:'ribbon', sW:7, guideH:1.8, cnsReachRadius:4, debugMesh:1, cnsNAgent:10, cnsSpeedX:3, // pQdbg:1,
                dtype:"xzR",
                data : CourseData.DATA.mm2024_08_knasai_new.xzR,
                pQlist: CourseData.DATA.mm2024_08_knasai_new.pq,
               },

        // ------------------------------
        100801:{label:"GT4_circuit_Motegi_Super_Speedway",
                iy: 0.01, iystep: 0, scale: 0.1, grndW:140, grndH:100, adjx:-60, adjz:-40, nz: 800, stageType:'extrude_plane', sW:10, cnsReachRadius:6, debugMesh:1, cnsNAgent:10, cnsSpeedX:2.2,
                dtype:"xz",
                data : CourseData.DATA.MotegiSuperSpeedway_new.xz,
               },

        // ------------------------------
        100901:{label:"GT5_circuit_Daytona_Speedway",
                iy: 0.02, iystep: 0, scale: 0.1, grndW:120, grndH:100, adjx:-40, adjz:-40, nz: 800, stageType:'extrude_plane', sW:11, cnsReachRadius:6, cnsRadius:4, debugMesh:1, cnsNAgent:10, cnsSpeedX:2, 
                dtype:"xz",
                // data : CourseData.DATA.DaytonaSpeedway.xz,
                data : CourseData.DATA.DaytonaSpeedway_new.xz,
                xzRoutes :[
                    CourseData.DATA.DaytonaSpeedway.lines1,
                    CourseData.DATA.DaytonaSpeedway.lines2,
                    CourseData.DATA.DaytonaSpeedway.lines3
                ],
               },

    };

    var getMetaStageInfo = function (istage) {
        const i2id = {
            0:100103,
            1:100111,
            2:100112,

            3:100202,
            4:100211,

            5:100301,
            6:100302,

            7:100411,

            8:100501,
            9:100511,

            10:100601,
            11:100612,

            12:100701,//debug用？
            13:100711,

            14:100801,

            15:100901,
        }

        let id = i2id[istage];
        return metaStageInfo[id];
    }

    let istage = 15, nstage = 16;


    // --------------------------------------------------

    var scene = new BABYLON.Scene(engine);

    // var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(2, 5,-10), scene);
    // camera.setTarget(BABYLON.Vector3.Zero());
    // camera.attachControl(canvas, true);


    let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.rotationOffset = 180;
    camera.radius = 10; // 3;
    camera.heightOffset = 2; // 1.1;
    camera.cameraAcceleration = 0.05; // 0.1;
    camera.maxCameraSpeed = 30;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 0;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    let meshAggInfo = []; // mesh, agg;
    let meshes = [];
    let navigationPlugin = null, navmeshdebug = null, crowd = null, agentCubeList = [];
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterPosition = new BABYLON.Vector3(0, 0, 0);
    let inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    let pStart = new BABYLON.Vector3(0, 0, 0);
    let pStart2 = new BABYLON.Vector3(0, 0, 0);

    // // let stageInfo = [];
    var createStage = function(istage) {
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        let metaStageInfo = getMetaStageInfo(istage)
        let iystep = typeof(metaStageInfo.iystep) !== 'undefined' ? metaStageInfo.iystep : 0;
        let grndW = typeof(metaStageInfo.grndW) !== 'undefined' ? metaStageInfo.grndW : 200;
        let grndH = typeof(metaStageInfo.grndH) !== 'undefined' ? metaStageInfo.grndH : 200;
        let iy = typeof(metaStageInfo.iy) !== 'undefined' ? metaStageInfo.iy : 0;
        let scale = typeof(metaStageInfo.scale) !== 'undefined' ? metaStageInfo.scale : 1;
        let scaleY = typeof(metaStageInfo.scaleY) !== 'undefined' ? metaStageInfo.scaleY : 1;
        let adjx = typeof(metaStageInfo.adjx) !== 'undefined' ? metaStageInfo.adjx : 0;
        let adjy = typeof(metaStageInfo.adjy) !== 'undefined' ? metaStageInfo.adjy : 0;
        let adjz = typeof(metaStageInfo.adjz) !== 'undefined' ? metaStageInfo.adjz : 0;
        let nz = typeof(metaStageInfo.nz) !== 'undefined' ? metaStageInfo.nz : 0;
        let pQdiv = typeof(metaStageInfo.pQdiv) !== 'undefined' ? metaStageInfo.pQdiv : 0;
        let pQlist = typeof(metaStageInfo.pQlist) !== 'undefined' ? metaStageInfo.pQlist : [];
        let xzRoutes = typeof(metaStageInfo.xzRoutes) !== 'undefined' ? metaStageInfo.xzRoutes : [];
        let pQdbg = typeof(metaStageInfo.pQdbg) !== 'undefined' ? metaStageInfo.pQdbg : 0;
        let nbPoints = typeof(metaStageInfo.nbPoints) !== 'undefined' ? metaStageInfo.nbPoints : 20;
        let cnsCS = typeof(metaStageInfo.cnsCS) !== 'undefined' ? metaStageInfo.cnsCS : 0.1;
        let cnsRadius = typeof(metaStageInfo.cnsRadius) !== 'undefined' ? metaStageInfo.cnsRadius : 0.8;
        let cnsReachRadius = typeof(metaStageInfo.cnsReachRadius) !== 'undefined' ? metaStageInfo.cnsReachRadius : 2;
        let cnsNAgent = typeof(metaStageInfo.cnsNAgent) !== 'undefined' ? metaStageInfo.cnsNAgent : 3;
        let cnsSpeedX = typeof(metaStageInfo.cnsSpeedX) !== 'undefined' ? metaStageInfo.cnsSpeedX : 1;
        let cnsCollisionQueryRange = typeof(metaStageInfo.cnsCollisionQueryRange) !== 'undefined' ? metaStageInfo.cnsCollisionQueryRange : 0.5;
        let cnsSeparationWeight = typeof(metaStageInfo.cnsSeparationWeight) !== 'undefined' ? metaStageInfo.cnsSeparationWeight : 3;

        let grndMesh = BABYLON.MeshBuilder.CreateGround("ground", {width:grndW, height:grndH}, scene);
        grndMesh.material = new BABYLON.GridMaterial("", scene);
        grndMesh.material.majorUnitFrequency = 10;
        grndMesh.material.minorUnitVisibility  = 0.7;
        // 地面に摩擦係数、反射係数を設定する
        let grndAgg = new BABYLON.PhysicsAggregate(grndMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);
        meshAggInfo.push([grndMesh,grndAgg]);

        let plist = [];
        let pRouteList = [];
        if(metaStageInfo.dtype=='xz') {
            // 画像から抜き出した座標をそのまま使う版
            let iystep = metaStageInfo.iystep;
            for (let [ix,iz] of metaStageInfo.data) {
                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                iy += iystep;
            }
            if (xzRoutes.length > 0) {
                for (let xzline of xzRoutes) {
                    plist_ = [];
                    for (let [ix,iz] of xzline) {
                        plist_.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                        iy += iystep;
                    }
                    pRouteList.push(plist_);
                }
            }
        } else if(metaStageInfo.dtype=='xz_') {
            // ４番目の引数で等差を指定
            let iystep = metaStageInfo.iystep, ii=-1;
            for (let tmp of metaStageInfo.data) {
                ++ii;
                if (tmp.length == 2) {
                    let [ix,iz] = tmp;
                    plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                    iy += iystep;
                } else if (tmp.length == 3) {
                    let [ix,iz,iy_] = tmp;
                    if (iy_ == null) {
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                        iy += iystep;
                    } else {
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy_*scaleY+adjy, (nz-iz)*scale+adjz));
                        iy = iy_ + iystep;
                    }
                } else if (tmp.length == 4) {
                    let [ix,iz,iy_, is] = tmp;
                    iystep = is;
                    if (iy_ == null) {
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                        iy += iystep;
                    } else {
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy_*scaleY+adjy, (nz-iz)*scale+adjz));
                        iy = iy_ + iystep;
                    }
                }
            }

        } else if(metaStageInfo.dtype=='xzR') {
            // ４番目の引数で等差、１つ前の点との距離で差分を調整
            // let iyrate = metaStageInfo.iystep, ii=-1, ix, iz, dis, iy_, iystep;
            let iyrate = iystep*scale/5, ii=-1, ix, iz, dis, iy_;
            let [ix_, iz_, xxx] = metaStageInfo.data[0];
            // dis = 1;
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
            // 上記で取得した点列を、スプラインで補間
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
            const plist2 = catmullRom.getPoints();

            // 始点、２番目を末尾に追加／ループとする
            // 3D的なループにするには始点だけでは途切れるっぽいので２番目も
            let p0 = plist2[0];
            plist2.push(new BABYLON.Vector3(p0.x, p0.y, p0.z));
            p0 = plist2[1];
            plist2.push(new BABYLON.Vector3(p0.x, p0.y, p0.z));

            pStart = plist2[1].clone();
            pStart2 = plist2[1+nbPoints].clone();
            pGoal = plist2[plist2.length-1].clone();

            // エージェントの目的地
            let pQ = [];  // 単一ライン
            let pQQ = pRouteList; // 複数ライン
            if (pQlist.length > 0) {
                for (let i of pQlist) {
                    let id = i*nbPoints;
                    if (id >= plist2.length) continue;
                    pQ.push(plist2[id])
                }
            } else if (pQdiv==0) {
                pQ.push(pStart);
                pQ.push(plist2[Math.floor(plist2.length/4)]);
                pQ.push(plist2[Math.floor(plist2.length/2)]);
                pQ.push(plist2[Math.floor(plist2.length/4*3)]);
            } else {
                let n = Math.min(plist2.length, pQdiv);
                let id, id_ = -1;
                for (let i = 0; i < n; ++i) {
                    id = Math.floor(plist2.length/n*i);
                    if (id_ != id) {
                        pQ.push(plist2[id]);
                    }
                    id_ = id;
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
                        meshAggInfo.push([mesh,null]);
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
                    meshAggInfo.push([mesh,null]);
                }
            }

            if (metaStageInfo.stageType=='tube') {
                // チューブで表示
                let mesh = BABYLON.MeshBuilder.CreateTube("tube", {path: plist2, radius: 2}, scene);
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.emissiveColor = BABYLON.Color3.Blue();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                // stageInfo.push(mesh);
                meshes.push(mesh);
            }

            if (metaStageInfo.stageType=='extrude') {
                // 矩形（凹）で表示
                let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 1.5;
                let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 0.5;
                const myShape = [
                    new BABYLON.Vector3(-gardW,  gardH, 0),
                    new BABYLON.Vector3(-gardW,  0    , 0),
                    new BABYLON.Vector3( gardW,  0    , 0),
                    new BABYLON.Vector3( gardW,  gardH, 0)
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

            if (metaStageInfo.stageType=='extrude_plane') {
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

            if (metaStageInfo.stageType=='ribbon') {
                // 個々の点で進行方向ベクトルをもとめ、水平方向をもとめ、水平位置の右側／左側の座標を求める
                let sW = typeof(metaStageInfo.sW) !== 'undefined' ? metaStageInfo.sW : 3;
                let guideH = typeof(metaStageInfo.guideH) !== 'undefined' ? metaStageInfo.guideH : 0.25;
                let p1 = plist2[0], p2=p1, v, v1, vR, vL, vC, pR, pL;
                // const sW = 3, sW_=sW/2;
                const sW_=sW/2;
                const qR = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), Math.PI/2);
                const qL = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -Math.PI/2);
                v1 = BABYLON.Vector3.Zero;
                let plist3R = [], plist3L = [];
                for (let p of plist2) {
                    v = p.subtract(p1).normalize();
                    vR = v.applyRotationQuaternion(qR);
                    pR = p.add(vR.scale(sW_));
                    vL = v.applyRotationQuaternion(qL);
                    pL = p.add(vL.scale(sW_));
                    // ベクトル片の外積(vC.y)から（右／左）どちら向きかを判断し、曲がる方向に傾ける（高さを調整する）
                    vC = BABYLON.Vector3.Cross(v,v1);
                    if (Math.abs(vC.y) > 0.001) {
                        if (vC.y > 0) {
                            pR.y += vC.y*2.5;
                            pL.y -= -vC.y*1.5;
                        } else {
                            pR.y += -vC.y*1.5;
                            pL.y -= vC.y*2.5;
                        }
                    }
                    plist3R.push(pR);
                    plist3L.push(pL);
                    p2 = p1;
                    p1 = p;
                    v1 = v;
                }
                // 始点は2点の差分だと中間値なので、捨てる
                plist3R.shift();
                plist3L.shift();
                // 周回するよう、始点を末尾に追加する
                let p3 = plist3R[0];
                plist3R.push(new BABYLON.Vector3(p3.x, p3.y, p3.z));
                p3 = plist3L[0];
                plist3L.push(new BABYLON.Vector3(p3.x, p3.y, p3.z));

                // 道の端のガード
                const guideR = 0.05, adjy=guideH;
                let meshR = BABYLON.MeshBuilder.CreateTube("tube", {path: plist3R, radius: guideR, tessellation: 4}, scene);
                meshR.position.y += guideR+adjy;
                let aggR = new BABYLON.PhysicsAggregate(meshR, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
                meshR.material = new BABYLON.StandardMaterial("mat", scene);
                meshR.material.emissiveColor = BABYLON.Color3.Blue();
                meshAggInfo.push([meshR,aggR]);
                let meshL = BABYLON.MeshBuilder.CreateTube("tube", {path: plist3L, radius: guideR, tessellation: 4}, scene);
                meshL.position.y += guideR+adjy;
                let aggL = new BABYLON.PhysicsAggregate(meshL, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
                meshL.material = new BABYLON.StandardMaterial("mat", scene);
                meshL.material.emissiveColor = BABYLON.Color3.Red();
                meshAggInfo.push([meshL,aggL]);

                // 道の本体をribbonで作成する
                let mypath3 = [plist3R, plist3L];
                let mesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: mypath3, sideOrientation: BABYLON.Mesh.DOUBLESIDE});

                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes.push(mesh);

                vStart = new BABYLON.Vector3(plist[1].x-plist[0].x, plist[1].y-plist[0].y, plist[1].z-plist[0].z);

                {
                    let pQ1 = plist2[Math.floor(plist2.length/4)].clone();
                    let meshQ1 = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: sW}, scene);
                    meshQ1.position = pQ1.clone();
                    meshQ1.position.y += sW_/2;
                    meshQ1.material = new BABYLON.StandardMaterial("mat");
                    meshQ1.material.emissiveColor = BABYLON.Color3.Green();
                    meshQ1.material.alpha = 0.5;
                    meshAggInfo.push([meshQ1,null]);
                }
                {
                    let pQ2 = plist2[Math.floor(plist2.length/2)].clone();
                    let meshQ2 = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: sW}, scene);
                    meshQ2.position = pQ2.clone();
                    meshQ2.position.y += sW_/2;
                    meshQ2.material = new BABYLON.StandardMaterial("mat");
                    meshQ2.material.emissiveColor = BABYLON.Color3.Blue();
                    meshQ2.material.alpha = 0.5;
                    meshAggInfo.push([meshQ2,null]);
                }
                {
                    let pQ3 = plist2[Math.floor(plist2.length/4*3)].clone();
                    let meshQ3 = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: sW}, scene);
                    meshQ3.position = pQ3.clone();
                    meshQ3.position.y += sW_/2;
                    meshQ3.material = new BABYLON.StandardMaterial("mat");
                    meshQ3.material.emissiveColor = BABYLON.Color3.Yellow();
                    meshQ3.material.alpha = 0.5;
                    meshAggInfo.push([meshQ3,null]);
                }
                {
                    // ゴール地点のメッシュ
                    let meshGoal = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: sW}, scene);
                    meshGoal.position = pGoal.clone();
                    meshGoal.position.y += sW_/2;
                    meshGoal.material = new BABYLON.StandardMaterial("mat");
                    meshGoal.material.diffuseTexture = new BABYLON.Texture(goalPath, scene);
                    meshGoal.material.alpha = 0.8;
                    meshAggInfo.push([meshGoal,null]);
                }
            }

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
                maxSpeed: 1,  // 許容される最大速度。[制限: >= 0]
                collisionQueryRange: cnsCollisionQueryRange, // 0.5,  // ステアリング動作の対象となる衝突要素がどれだけ近い必要があるかを定義します。[制限: > 0]
                pathOptimizationRange: 10.0,  // パスの可視性の最適化範囲。[制限: > 0]
                separationWeight: cnsSeparationWeight // 3.0 // エージェント マネージャーがこのエージェントとの衝突を回避する際の積極性。[制限: >= 0]
            };
            let addAgent = function() {
                var width = 1.6; // 0.50;
                var agentCube = BABYLON.MeshBuilder.CreateBox("cube", { size: width, height: width }, scene);
                agentCube.material = new BABYLON.StandardMaterial('mat2', scene);
                var randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(20*Math.random()-10, 0.1, 5*Math.random()), 0.5);
                var transform = new BABYLON.TransformNode();
                agentCube.parent = transform;
                if (agentCubeList.length == 0) {
                    agentCube.material.diffuseColor = BABYLON.Color3.Red();
                    agentParams.maxAcceleration = 2.2; agentParams.maxSpeed = 4.6;
                } else if (agentCubeList.length == 1) {
                    agentCube.material.diffuseColor = BABYLON.Color3.Green();
                    agentParams.maxAcceleration = 2.8; agentParams.maxSpeed = 4.3;
                } else if (agentCubeList.length == 2) {
                    agentCube.material.diffuseColor = BABYLON.Color3.Blue();
                    agentParams.maxAcceleration = 5.8; agentParams.maxSpeed = 4.0;
                } else {
                    agentCube.material.diffuseColor = BABYLON.Color3.Random();
                    agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(3.2,5.5);
                    agentParams.maxSpeed = BABYLON.Scalar.RandomRange(4.0,4.8);
                }
                agentParams.maxAcceleration *= cnsSpeedX;
                agentParams.maxSpeed *= cnsSpeedX;

                // ルート指定 -1:pQのみ  0>=:xzRoutesから一本選択
                agentCube.route = -1;
                if (pQQ.length > 0) {
                    // 選んだ走行ラインをメッシュに登録してておく
                    agentCube.route = Math.floor(Math.random()*pQQ.length);
                }

                var agentIndex = crowd.addAgent(randomPos, agentParams, transform);
                agentCubeList.push(agentCube);
                return agentIndex;
            }

            let resetAllAgent = function(meshes, scene) {
                if (crowd != null) { crowd.dispose(); }
                if (navmeshdebug != null) { navmeshdebug.dispose(); }
                if (navigationPlugin != null) { navigationPlugin.dispose(); }
                while (agentCubeList.length > 0) { agentCubeList.pop().dispose(); };

                navigationPlugin = new BABYLON.RecastJSPlugin();
                navigationPlugin.createNavMesh(meshes, navmeshParameters);
                if (metaStageInfo.debugMesh) {
                    // デバッグ用のメッシュ
                    navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
                    navmeshdebug.position = new BABYLON.Vector3(0, 0.01, 0);

                    navmeshdebug.material = new BABYLON.StandardMaterial('matdebug', scene);;
                    // アスファルトっぽく黒く
                    navmeshdebug.material.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);

                    meshAggInfo.push([navmeshdebug,null]);
                }
                // crowd
                crowd = navigationPlugin.createCrowd(maxAgents, 0.1, scene);
                crowd._ag2dest = []; // エージェントごとの目的地／座標リストのindex値
                agentCubeList = [];
                for (let i = 0; i < iniAgents; ++i) {
                    let adID = addAgent();
                    resetAgent(adID);
                    crowd._ag2dest.push(1); // 目的地Q1を設定
                }

                // 目的地に到達ごとの処理
                crowd.onReachTargetObservable.add((agentInfos) => {
                    let agID = agentInfos.agentIndex;
                    let agentCube = agentCubeList[agID];
                    if (agentCube.route < 0) {
                        // 「ルート／目的地のリスト」が１つしかない場合
                        let dest = crowd._ag2dest[agID];
                        if (dest == pQ.length-1) {
                            dest = 0;
                        } else {
                            ++dest;
                        }
                        // 次の目的地を設定
                        crowd._ag2dest[agID] = dest;
                        crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ[dest]));
                    } else {
                        // 「ルート／目的地のリスト」が複数ある場合
                        let pQ_ = pQQ[agentCube.route];
                        let dest = crowd._ag2dest[agID];
                        if (dest == pQ_.length-1) {
                            dest = 0;
                        } else {
                            ++dest;
                        }
                        // 次の目的地を設定
                        crowd._ag2dest[agID] = dest;
                        crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ_[dest]));
                    }
                });

            }
            let resetAgent = function(agID) {
                // スタート地点にテレポート
                let agentCube = agentCubeList[agID];
                //        if (agID < ag2dest.length) {
                if (agentCube.route < 0) {
                    // 初期位置：スタート地点付近にテレポート
                    crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(pQ[0]));
                    // 目標位置：次の目標地点に
                    crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ[1]));
                } else {
                    let pQ_ = pQQ[agentCube.route];
                    crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(pQ_[0]));
                    crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ_[1]));
                }
            }

            // エージェントの移動速度から向きを変更する
            // // 参考
            // // https://scrapbox.io/babylonjs/Navigation_Mesh
            // // Shark + 海バージョン
            // https://playground.babylonjs.com/#DP2SDJ#21
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

        }
    }

    createStage(istage);

    // --------------------------------------------------
    // --------------------------------------------------
    if (1) {
        // Player/Character state
        var state = "IN_AIR_DOWN";
        let dashRate = 3;
        var inAirSpeed = 20.0;
        var onGroundSpeed = 10.0;
        var inAirSpeedBase = 20.0;
        var onGroundSpeedBase = 10.0;
        var jumpHeight = 3;
        let inputDirRad = 0; // inputDirectionを -1, 0, 1ではなく、sin(inputDirRad)で
        let inputDirRadAcc = 0.005; // 加速時
        let inputDirRadDmpRate = 0.99; // 自然に減速時、等比級数
        var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
        let characterGravity = new BABYLON.Vector3(0, -18, 0);
        let characterRisingON = new BABYLON.Vector3(0, 25.00, 0); // 上昇
        let characterRisingOFF = new BABYLON.Vector3(0, 0, 0);
        let characterRising   = characterRisingOFF;
        let keyAction = {forward:0, back:0, right:0, left:0, dash:0, jump:0, rise:0, down:0, resetCooltime:0 };

        // Physics shape for the character
        let myh = 3; // 1.8;
        let myr = 0.6;
        let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: myh, radius: myr}, scene);
        displayCapsule.material = new BABYLON.StandardMaterial('mat', scene);
        displayCapsule.material.diffuseColor = BABYLON.Color3.Blue();
        displayCapsule.material.alpha = 0.4;

        let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: myh, capsuleRadius: myr}, scene);

        let resetMyPosi = function () {
            inputDirRad = 0;
            inputDirection = new BABYLON.Vector3(0,0,0);

            let pV = pStart.clone();
            pV.y += 2;
            characterPosition = pV.clone();
            characterController._position = pV;

            displayCapsule.rotation = new BABYLON.Vector3(0, 0, 0);
            characterOrientation = BABYLON.Quaternion.Identity();

            let p1 = pStart.clone();
            let p3 = pStart2.clone();
            p3.subtractInPlace(p1);
            let vrot = Math.atan2(p3.x, p3.z);
            displayCapsule.rotate(BABYLON.Vector3.Up(), vrot);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, vrot, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        }
        resetMyPosi();

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 2);
    localAxes.xAxis.parent = displayCapsule; localAxes.yAxis.parent = displayCapsule; localAxes.zAxis.parent = displayCapsule;
    camera.lockedTarget = displayCapsule;

    var getNextState = function(supportInfo) {
        if (state == "IN_AIR_UP") {
            if (characterController.getVelocity().y > 0) {
                if (keyAction.rise) {
                    characterRising = characterRisingON;
                } else {
                    characterRising = characterRisingOFF;
                }
                return "IN_AIR_UP";
            }
            return "IN_AIR_DOWN";
        } else if (state == "IN_AIR_DOWN") {
            if (characterController.getVelocity().y > 0) {
                if (keyAction.rise) {
                    characterRising = characterRisingON;
                } else {
                    characterRising = characterRisingOFF;
                }
                return "IN_AIR_UP";
            }
            if (supportInfo.supportedState == BABYLON.CharacterSupportedState.SUPPORTED) {
                return "ON_GROUND";
            }
            return "IN_AIR_DOWN";
        } else if (state == "ON_GROUND") {
            if (supportInfo.supportedState != BABYLON.CharacterSupportedState.SUPPORTED) {
                return "IN_AIR_DOWN";
            }
            if (keyAction.jump) {
                return "START_JUMP";
            }
            return "ON_GROUND";
        } else if (state == "START_JUMP") {
            return "IN_AIR_UP";
        }
    }

    var getDesiredVelocity = function(deltaTime, supportInfo, characterOrientation_, currentVelocity) {
        let nextState = getNextState(supportInfo);
        if (nextState != state) {
            state = nextState;
        }
        let upWorld = characterGravity.normalizeToNew();
        upWorld.scaleInPlace(-1.0);
        let forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation_);
        if (state == "IN_AIR_UP") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            outputVelocity.addInPlace(characterRising.scale(deltaTime)); // ゆっくり上昇？
            return outputVelocity;
        } else if (state == "IN_AIR_DOWN") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
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
        onGroundSpeed = onGroundSpeedBase;
        inAirSpeed =inAirSpeedBase;
        if (keyAction.dash) {
            onGroundSpeed = onGroundSpeedBase * dashRate;
            inAirSpeed =inAirSpeedBase * dashRate;
        }
        if (keyAction.forward) {
            inputDirRad += inputDirRadAcc;
            if (inputDirRad > R90) {
                inputDirRad = R90;
            }
            inputDirection.z = Math.sin(inputDirRad);
        } else if (keyAction.back) {
            inputDirRad -= inputDirRadAcc;
            if (inputDirRad < -R90) {
                inputDirRad = -R90;
            }
            inputDirection.z = Math.sin(inputDirRad);
        } else {
            inputDirRad *= inputDirRadDmpRate;
        }
        if (keyAction.right) {
            let vrot = 0.02;
            if (keyAction.back && inputDirection.z>0.5) {
                vrot = 0.05;
            }
            displayCapsule.rotate(BABYLON.Vector3.Up(), vrot);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, vrot, 0);
            
            characterOrientation = quat2.multiply(characterOrientation);
        } else if (keyAction.left) {
            let vrot = -0.02;
            if (keyAction.back && inputDirection.z>0.5) {
                vrot = -0.05;
            }
            displayCapsule.rotate(BABYLON.Vector3.Up(), vrot);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, vrot, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        }
        let desiredLinearVelocity = getDesiredVelocity(dt, support, characterOrientation, characterController.getVelocity());
        characterController.setVelocity(desiredLinearVelocity);
        characterController.integrate(dt, support, characterGravity);
    });


    var map ={};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"; 
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    scene.registerAfterRender(function() {
        keyAction.dash = 0;
        if (map["ctrl"]) {
            keyAction.dash = 1;
        }
        keyAction.forward = 0;
        keyAction.back = 0;
        if ((map["ArrowUp"] || map["w"])) {
            keyAction.forward = 1;

        }
        if ((map["ArrowDown"] || map["s"])) {
            if (state === "IN_AIR_DOWN") {  // 空中なら降下
                keyAction.down = 1;
            } else {  // 地上ならバック
                keyAction.back = 1;
            }
        }
        keyAction.left = 0;
        keyAction.right = 0;
        if ((map["ArrowLeft"] || map["a"])) {
            keyAction.left = 1;
        } else if ((map["ArrowRight"] || map["d"])) {
            keyAction.right = 1;
        }
        keyAction.jump = 0;
        if (map[" "]) {
            keyAction.jump = 1;
        }
        if (keyAction.resetCooltime) {
            --keyAction.resetCooltime;
        } else {
            if (map["c"]) {
                keyAction.resetCooltime = 30;
                icamera = (icamera+1) % 4;
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 10; // 3;
                    camera.heightOffset = 2; // 1.1;
                    camera.cameraAcceleration = 0.05;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 50;
                    camera.heightOffset = 4;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 10;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 2;
                    camera.heightOffset = 100;
                    camera.cameraAcceleration = 0.5;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.3;
                    camera.heightOffset = -0.01;
                    camera.cameraAcceleration = 0.3;
                    camera.maxCameraSpeed = 30;

                } else if (icamera < 0) {
                    camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(2, 5,-10), scene);
                    camera.setTarget(BABYLON.Vector3.Zero());
                    camera.attachControl(canvas, true);
                }

            } else if (map["Enter"]) {
                keyAction.resetCooltime = 30;

            } else if (map["r"]) {
                keyAction.resetCooltime = 60;
                // キャラクターコントローラーの位置だけリセット
                let pV = pStart.clone();
                pV.y += 10;
                characterController._position = pV;

            } else if (map["n"]) {
                keyAction.resetCooltime = 60;
                istage =(istage+1) % nstage;
                createStage(istage);
                resetMyPosi();
            } else if (map["b"] || map["p"]) {
                keyAction.resetCooltime = 60;
                istage =(istage+nstage-1) % nstage;
                createStage(istage);
                resetMyPosi();

            } else if (map["h"]) {
                keyAction.resetCooltime = 60;
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
        }
    });

    // --------------------------------------------------
    // --------------------------------------------------

    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "170px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n"
        +"(W,S) or (Arrow UP/DOWN): Forward/Back\n"
        +"(A,D) or (Arrow Left/Right): turn Left/Right\n"
        +"(Space): jump\n"
        +"(Ctrl): dash\n"
        +"C: change Camera\n"
        +"R: Reset position\n"
        +"N: Next Stage\n"
        +"P: Previous Stage\n"
        +"H: show/hide this message";
    text1.color = "white";
    text1.width = "260px";
    text1.fontSize = 12;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    guiLabelRect.isVisible = false;
    }

    return scene;
}



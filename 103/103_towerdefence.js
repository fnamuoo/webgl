// タワーディフェンス
//
//  - 1 / [拳銃のアイコン]          .. 砲台（ノーマル）を追加
//  - 2 / [2丁のアイコン]           .. 砲台（速射）　　を追加
//  - 3 / [ライフルのアイコン]      .. 砲台（長距離）　を追加
//  - (spc)                         .. 塔のフロアを整列
//  - (該当なし) / [灯台のアイコン] .. 自動で一定時間ごとに整列
//
// （隠しコマンド）
//  - 0    .. フロアを追加
//  - (c)  .. カメラを切り替え
//  - (r)  .. ゲームをリセット

// ======================================================================


// // local
// const glb_url = "./assets/";
// // const glb_url = "https://assets.babylonjs.com/meshes/";
// const glb_fname1 = "yellowEnergyBall.glb";
// const glb_fname2 = "spellDisk.glb";

// const iconPath1 = "textures/icon2/icon_gun_6_y.png"
// const iconPath2 = "textures/icon2/icon_gun_8_y.png"
// const iconPath3 = "textures/icon2/icon_gun_9_y.png"
// const iconPath4 = "textures/icon2/icon_lighthouse_y.png"

// ----------------------------------------

// local
const glb_url = "./assets/";
const glb_fname1 = "yellowEnergyBall.glb";
const glb_fname2 = "spellDisk.glb";
const iconPath1 = "textures/icon_gun_6_y.png"
const iconPath2 = "textures/icon_gun_8_y.png"
const iconPath3 = "textures/icon_gun_9_y.png"
const iconPath4 = "textures/icon_lighthouse_y.png"

// ----------------------------------------

// // PlayGround
// const glb_url = "https://raw.githubusercontent.com/fnamuoo/webgl/main/103/assets/";
// const glb_fname1 = "yellowEnergyBall.glb";
// const glb_fname2 = "spellDisk.glb";
// const iconPath1 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/103/textures/icon_gun_6_y.png"
// const iconPath2 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/103/textures/icon_gun_8_y.png"
// const iconPath3 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/103/textures/icon_gun_9_y.png"
// const iconPath4 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/103/textures/icon_lighthouse_y.png"


const R1 = Math.PI/180;
const R180 = Math.PI;
const R360 = Math.PI*2;

const createScene = async function () {
    // let meshlist = null;
    // let animeGrp = null;
    let instEntPool = [];
    let instEntUsed = [];
    // let meshlist1 = [];
    let spellDiskMesh = null;

    // let loadMeshGLB_cntTask = function(scene, url, fname) {
    let loadMeshGLB_cntTask = function(scene) {
        let assetsManager = new BABYLON.AssetsManager(scene);

        // babylonjs tips集 では addMeshTask が紹介されていたけど...
        // yellowEnergyBall.glb は addContainerTask で読み込まないとダメっぽい
        let containerAssetTask1 = assetsManager.addContainerTask("task1","", glb_url, glb_fname1)
        // playground (v8.37)では挙動が変わって、addMeshTaskでOKみたい!?
        // let containerAssetTask1 = assetsManager.addMeshTask("task1","", glb_url, glb_fname1)

        // spellDisk.glb は addMeshTask で読み込まないとダメっぽい
        let meshAssetTask2 = assetsManager.addMeshTask("task2","", glb_url, glb_fname2)

        containerAssetTask1.onSuccess = function(task) {
            // task: MeshAssetTask
            {
                // let meshlist = task.loadedMeshes;
                let meshlist1 = task.loadedMeshes;
console.log("mesh1 n=", meshlist1.length);
                for (let m of meshlist1) {
                    let scale=0.2;
                    m.scaling = new BABYLON.Vector3(scale, scale, scale);
                    m.position.set(0, -4, 0);
                }
                let animeGrp = task.loadedAnimationGroups;
                animeGrp[0].start(false);
            }
            // let animeGrp = task.loadedAnimationGroups;
            let nn = 10;
            {
                for (let i = 0; i < nn; ++i) {
//console.log(" i=", i);
                let instEnt = task.loadedContainer.instantiateModelsToScene(name=>name+"_clone", false);
//console.log(" instEnt=", instEnt);
                // let scale=0.04; // size=1に収まるように
                let scale=0.2;
                let mesh = instEnt.rootNodes[0];
                mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
                mesh.position = new BABYLON.Vector3(0, 0, 0);
                mesh.rotation = new BABYLON.Vector3(0, 0, 0);
                instEnt.animationGroups[0].start(loop=true, speedRatio=1);
                mesh.visibility = 0;
                //
                instEntPool.push(instEnt);
                // // // let opt = {actMode:'boid', diaX:0.3, diaY:0.3, diaZ:1.5, mass:5, linDam:10, angDam:100, linImp:10, angImp:1, };
                // // meshAggManager2.addMeshAgg(mesh,opt);
                }
            }
        }

        // containerAssetTask2.onSuccess = function (task) {
        meshAssetTask2.onSuccess = function (task) {
            let meshlist = task.loadedMeshes;
console.log("mesh2 n=", meshlist.length);
            // for (let m of meshlist) {
            //     let scale=1.1;
            //     m.scaling = new BABYLON.Vector3(scale, scale, scale);
            // }
            // 位置とサイズを変更して隠しておく
            spellDiskMesh = meshlist[0];
            spellDiskMesh.position.set(0, -1, 0);
            let scale=0.1;
            spellDiskMesh.scaling = new BABYLON.Vector3(scale, scale, scale);
            // // rootMesh.visibility = 0;

        }

        // === エラー処理 ===
        assetsManager.onTaskError = function (task) {
            console.error("タスクの読み込みに失敗しました:", task.name);
        };
        // === 全てのロードが完了した時 ===
        assetsManager.onFinish = function (tasks) {
            console.log("すべてのアセットが読み込まれました！");
        };

        // assetsManager.onFinish = function (task) {
        //     // instEnt.animationGroups[0].start(loop=true);
        // }

        // === 読み込みスタート ===
        assetsManager.load();
        // return;
    }

    let playAnimMagic = function() {
        // spellDisk をタワーの下から上まで移動させる
        if (spellDiskMesh==null) { return; }
        let mesh = spellDiskMesh;
        let s = Math.floor(towerElem._iy), s2=s+2;
        let nframe=20*(s+2), framePerSec=40, nframe_=nframe/2, nframe1=20;
        let zSlide = new BABYLON.Animation("", "position.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let xSlide = new BABYLON.Animation("", "position.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let ySlide = new BABYLON.Animation("", "position.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let xScale = new BABYLON.Animation("", "scaling.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let yScale = new BABYLON.Animation("", "scaling.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let zScale = new BABYLON.Animation("", "scaling.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let keyPz=[],keyPx=[],keyPy=[];
        let keySx=[],keySy=[],keySz=[];
        keyPx.push({frame:0, value:0});
        keyPx.push({frame:nframe, value:0});
        keyPy.push({frame:0, value:-1});
        keyPy.push({frame:nframe, value:s+1});
        keyPz.push({frame:0, value:0});
        keyPz.push({frame:nframe, value:0});
        keySx.push({frame:0, value:0});
        keySx.push({frame:nframe1, value:1});
        keySx.push({frame:nframe-nframe1, value:1});
        keySx.push({frame:nframe, value:0});
        keySy.push({frame:0, value:0});
        keySy.push({frame:nframe1, value:1});
        keySy.push({frame:nframe-nframe1, value:1});
        keySy.push({frame:nframe, value:0});
        keySz.push({frame:0, value:0});
        keySz.push({frame:nframe1, value:1});
        keySz.push({frame:nframe-nframe1, value:1});
        keySz.push({frame:nframe, value:0});
        xSlide.setKeys(keyPx);
        ySlide.setKeys(keyPy);
        zSlide.setKeys(keyPz);
        xScale.setKeys(keySx);
        yScale.setKeys(keySy);
        zScale.setKeys(keySz);
        let anim = [zSlide,xSlide,ySlide,xScale,yScale,zScale];
        scene.beginDirectAnimation(mesh, anim, 0, nframe, false);
    }

    let towerElem = [];
    towerElem._blist = [];
    // let myPosi = new BABYLON.Vector3(0, 0.3, 0);

    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    // let ssmeshlist = loadMeshGLB_cntTask(scene, glb_url, glb_fname1);
    loadMeshGLB_cntTask(scene);
    await BABYLON.InitializeCSG2Async();

    let myMesh = null;
    let camera = null;
    let icamera=0, ncamera=2;
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}

        if (icamera == 0) {
            //camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 4,-10), scene);
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 4,-3), scene);
            // if (myMesh != null) {
            //     camera.setTarget(myMesh.position);
            // } else {
            //     camera.setTarget(BABYLON.Vector3.Zero());
            // }
            camera.setTarget(new BABYLON.Vector3(0, 4, 0));
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
        }
        if (icamera == 1) {
            camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
            camera._i=0;
            camera._j=0;
        }

    }
    scene.onBeforeRenderObservable.add((scene) => {
        if (icamera == 1) {
            camera._i +=0.002;
            if (camera._i > R360) { camera._i -= R360; }
            camera._j +=0.002;
            if (camera._j > R360) { camera._j -= R360; }
            h = towerElem._y; // towerElem.length*1.1;
            let r=10, x=r*Math.cos(camera._i), y=h*Math.sin(camera._i)**2+1, z=r*Math.sin(camera._i) ;
            camera.position.set(x,y,z);
            // camera.position = myMesh.position.add(vdir);
            let h2=h*Math.sin(camera._j)**2+1;
            camera.setTarget(new BABYLON.Vector3(0, h2, 0));
        }
    });

    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // 地面
    const grndW=200, grndH=200, grndW_=grndW/2, grndH_=grndH/2;
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
    groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMesh.material.majorUnitFrequency = 100;
    groundMesh.material.minorUnitVisibility  = 0.2;
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);


    // --------------------------------------------------
    // 自機

    // 砲台
    const ctype2binfo = {0:{bullet:'std',
                            rng:30,
                            cooltimeIni:20,
                            life:70,
                            spd:20,
                            cost:5,},
                         1:{bullet:'short',
                            cooltimeIni:2,
                            rng:20,
                            life:30,
                            spd:30,
                            cost:30,},
                         2:{bullet:'long',
                            cooltimeIni:100,
                            rng:80,
                            life:300,
                            spd:1000,
                            cost:100,},
                        }
    let creaetCannon = function(opt={}) {
        let ctype = ('ctype' in opt) ? opt.ctype: 0;

        let trgMesh = BABYLON.MeshBuilder.CreateCylinder("me", {height:1, diameter:1, tessellation:6 });
        trgMesh.material = new BABYLON.StandardMaterial("");
	trgMesh.material.diffuseColor = new BABYLON.Color3(0.8, 0.9, 0.8);
	// trgMesh.material.alpha = 0.8;
	trgMesh.material.wireframe =1;
        let adjy=-0.5;
        // 土台／回転台
        let trgMesh0 = BABYLON.MeshBuilder.CreateCylinder("me", {height:0.4, diameter:1});
        trgMesh0.material = new BABYLON.GradientMaterial("grad", scene);
        trgMesh0.material.topColor = new BABYLON.Color3(1, 1, 1);
        trgMesh0.material.bottomColor = new BABYLON.Color3(1, 0.6, 0.6);
        trgMesh0.material.smoothness = -0.1;
        trgMesh0.position.set(0, 0.2+adjy, 0);
        trgMesh0.parent = trgMesh;
        if (ctype==1) {
            // short
            // 半球／砲台
            let trgMesh1 = BABYLON.MeshBuilder.CreateSphere("me", { slice: 0.5, diameter:0.8, segments: 8 }, scene);
            trgMesh1.position.set(0, 0.4+adjy, 0);
            trgMesh1.parent = trgMesh;
            // 砲身
            let trgMesh2 = BABYLON.MeshBuilder.CreateBox("me", { width: 0.2, height: 0.2, depth: 0.5 }, scene);
            trgMesh2.position.set(0.2, 0.6+adjy, 0.2);
            trgMesh2.parent = trgMesh;
            let trgMesh3 = BABYLON.MeshBuilder.CreateBox("me", { width: 0.2, height: 0.2, depth: 0.5 }, scene);
            trgMesh3.position.set(-0.2, 0.6+adjy, 0.2);
            trgMesh3.parent = trgMesh;
        } else if (ctype==2) {
            // long
            // 半球／砲台
            let trgMesh1 = BABYLON.MeshBuilder.CreateSphere("me", { slice: 0.5, diameter:0.6, segments: 8 }, scene);
            trgMesh1.position.set(0, 0.4+adjy, -0.2);
            trgMesh1.parent = trgMesh;
            // 砲身
            let trgMesh2 = BABYLON.MeshBuilder.CreateBox("me", { width: 0.2, height: 0.2, depth: 0.9 }, scene);
            trgMesh2.position.set(0, 0.6+adjy, 0.0);
            trgMesh2.parent = trgMesh;
        } else {
            // std
            // 半球／砲台
            let trgMesh1 = BABYLON.MeshBuilder.CreateSphere("me", { slice: 0.5, diameter:0.8, segments: 8 }, scene);
            trgMesh1.position.set(0, 0.4+adjy, 0);
            trgMesh1.parent = trgMesh;
            // 砲身
            let trgMesh2 = BABYLON.MeshBuilder.CreateBox("me", { width: 0.2, height: 0.2, depth: 0.5 }, scene);
            trgMesh2.position.set(0, 0.6+adjy, 0.2);
            trgMesh2.parent = trgMesh;
        }
        //
        let agg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, friction: 0.08, restitution:0.05}, scene);
        agg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
        agg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
        trgMesh.physicsBody.disablePreStep = false;
        trgMesh._agg = agg;
        trgMesh.position.set(0, 0.5, 0);
        trgMesh._agg = agg;
        {
            trgMesh._binfo = ctype2binfo[ctype];
            trgMesh._coolTime = 0;
        }
        return trgMesh;
    }
    let createtFloor = function(opt={}) {
        let mass = ('mass' in opt) ? opt.mass: 1;
        let trgMesh = BABYLON.MeshBuilder.CreateCylinder("", {height:1, diameter:1, tessellation:6 });
        trgMesh.material = new BABYLON.StandardMaterial("");
        if (mass>0) {
	    trgMesh.material.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.1);
            trgMesh.material.alpha = 0.5;
        }
        let agg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: mass, friction: 0.08, restitution:0.05}, scene);
        agg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
        agg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
        trgMesh._agg = agg;
        trgMesh.position.set(0, 0.5, 0);
        trgMesh._instEnt=null;
        if (mass>0 && instEntPool.length>0) {
            let instEnt = instEntPool.pop();
            trgMesh._instEnt=instEnt;
            let orbMesh = instEnt.rootNodes[0];
            orbMesh.position.set(0, 0.8, 0);
            orbMesh.parent = trgMesh;
            instEntUsed.push(instEnt)
        }
        return trgMesh;
    }

    // タワー作成
    let cannonList = [];

    let mesh0 = null, ybase = 0;
    let createStage = function() {
        console.log("createStage");
        {
            // 以前のメッシュを削除
            for (let m of towerElem._blist) { m.dispose(); }
            for (let m of towerElem) {
                if (('_instEnt' in m) && (m._instEnt !=null)) {
                    let instEnt = m._instEnt;
                    let idx = instEntUsed.indexOf(instEnt);
                    if (idx >= 0) {
                        instEntUsed.splice(idx, 1);
                    }
                    instEnt.rootNodes[0].parent=null;
                    instEnt.rootNodes[0].position.set(0, -1, 0);
                    instEntPool.push(instEnt)
                }
                m.dispose();
            }
            console.log("instEntPool=",instEntPool.length)
            towerElem = []
            towerElem._blist = []
            for (let m of cannonList) {
                m.dispose();
            }
            cannonList = [];
        }
        let mesh, iy = 0.5;
        mesh = createtFloor({mass:0}); mesh.position.y = iy++; towerElem._blist.push(mesh);
        mesh0 = createtFloor({mass:0}); mesh0.position.y = iy++; towerElem._blist.push(mesh0);
        mesh = createtFloor({mass:0}); mesh.position.y = iy++; towerElem._blist.push(mesh);
        ybase = iy;
        mesh = createtFloor(); mesh.position.y=iy++; towerElem.push(mesh);
        mesh = creaetCannon({ctype:0}); mesh.position.y=iy++; towerElem.push(mesh); cannonList.push(mesh)
        //mesh = creaetCannon({ctype:1}); mesh.position.y=iy++; towerElem.push(mesh); cannonList.push(mesh)
        //mesh = creaetCannon({ctype:2}); mesh.position.y=iy++; towerElem.push(mesh); cannonList.push(mesh)
        towerElem._y = ybase;
        towerElem._iy = iy;
    }

    let resetStage = function() {
        for (let m of enList) {
            m.dispose();
        }
        enList = [];
        //
        score = 100;
        iwave=0;
        enRestN = 10;
        enActN = 5;
        enCoolTimeIni=100;
        mesh0 = null;
        ybase = 0;
        autoArrange = 1;
        //
        createStage();
        setWave();
        setScoreLabel(score);
        setIcon4();
    }

    let arrangeTower = function () {
        if (score < 1) {
            return;
        }
        --score;
        setScoreLabel(score);

        let iy = towerElem._y;
        for (let mesh of towerElem) {
            mesh.position.set(0, iy, 0);
            mesh.physicsBody.setLinearVelocity(BABYLON.Vector3.Zero());
            mesh.physicsBody.setAngularVelocity(BABYLON.Vector3.Zero());
            ++iy;
        }
        playAnimMagic()
    }

    let enList = []
    let popEnemy = function() {
        let enMesh = BABYLON.MeshBuilder.CreateSphere("ene", { diameter:1, segments: 8 }, scene);
        enMesh.position.set(0, 0, 0);
        let agg = new BABYLON.PhysicsAggregate(enMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, friction: 0.08, restitution:0.05}, scene);
        agg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
        agg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
        enMesh.physicsBody.disablePreStep = false;
        enMesh._agg = agg;
        enMesh.physicsBody.setGravityFactor(0);   // 重力の効果
        let rad = Math.random()*R360;
        let r =  150, x=r*Math.cos(rad), z=r*Math.sin(rad);
        // let y = Math.random()*towerElem.length, i=Math.floor(Math.random()*towerElem.length);
        let y = Math.random()*towerElem.length;
        enMesh.position.set(x, y, z);
        if (towerElem.length>0) {
            let i=Math.floor(Math.random()*towerElem.length);
            // let i=towerElem.length-1;
            enMesh._trg = towerElem[i];
        } else {
            enMesh._trg = mesh0;
        }
        enMesh._life = 600;
        enMesh._score = 1;

        let vdir = enMesh._trg.position.subtract(enMesh.position).normalize();
        // let scale = 0.02 + 0.01*Math.random();
        let scale = 15 + 5*Math.random();
        enMesh.physicsBody.applyImpulse(vdir.scale(scale), enMesh.absolutePosition);
        return enMesh;
    }

    let iwave=0, nwave=10, enRestN = 10, enActN = 5, enCoolTime=0, enCoolTimeIni=100;
    let setWave = function() {
        ++iwave;
        enRestN = 10*iwave;
        enActN = 1+2*iwave;
        enCoolTime = Math.max(enCoolTime-2, 1);
        enCoolTimeIni = Math.max(enCoolTimeIni-30, 1);
        console.log("setWave  =", iwave, " rest=",enRestN);
        setWaveLabel(iwave)
        // 塔に１段追加
        addFloor();
    }


    let expList = []
    let addExplosion = function(opt={}) {
        let p = ('p' in opt) ? opt.p: BABYLON.Vector3.Zero();
        let n = ('n' in opt) ? opt.n: 20;
        let mesh = ('mesh' in opt) ? opt.mesh: null;
        let r = ('r' in opt) ? opt.r: 5;
        if (mesh !=null) {
            p = mesh.position.clone();
            mesh.visibility = 0;
            // if (mesh.material != null) {
            //     mesh.material.alpha = 0.5;
            // }
        }

        // 爆発用のメッシュ・マテリアルの作成
        let mat = new BABYLON.StandardMaterial("");
        mat.emissiveColor = BABYLON.Color3.White();
        let mlist = [];
        for (let i=0; i <n; ++i) {
            let emesh = BABYLON.MeshBuilder.CreateSphere("", { diameter:0.5, segments: 8 }, scene);
            emesh.position.copyFrom(p);
            // 球面上のランダムな位置に配置
            let r1 = Math.random()*R180, r2 = Math.random()*R360;
            let cosR1 = Math.cos(r1), sinR1 = Math.sin(r1), cosR2 = Math.cos(r2), sinR2 = Math.sin(r2);
            let x = cosR1*cosR2, z = cosR1*sinR2, y = sinR1;
            emesh.position.addInPlaceFromFloats(x, y, z);
            emesh.material = mat;
            mlist.push(emesh);
        }
        // なぜか二回実施しないと centerMesh? が効かない
        let exp = new BABYLON.MeshExploder(mlist);
        exp = new BABYLON.MeshExploder(mlist);
        exp._i = 0;
        exp._r = r;
        exp._list = mlist;
        exp._mesh = mesh;
        expList.push(exp);
    }

    let bltList = [];
    // 攻撃範囲の確認のためのメッシュ
    let brtMesh0 = BABYLON.MeshBuilder.CreateSphere("", { diameter:ctype2binfo[0].rng*2, segments: 8 }, scene);
    brtMesh0.visibility = 0;
    let brtMesh1 = BABYLON.MeshBuilder.CreateSphere("", { diameter:ctype2binfo[1].rng*2, segments: 8 }, scene);
    brtMesh1.visibility = 0;
    let brtMesh2 = BABYLON.MeshBuilder.CreateSphere("", { diameter:ctype2binfo[2].rng*2, segments: 8 }, scene);
    brtMesh2.visibility = 0;
    // 砲弾の作成
    let createBullet = function(m) {
        let p = m.position, bullet=m._binfo.bullet, rng=m._binfo.rng, life=m._binfo.life, spd=m._binfo.spd;
        if (bullet == 'std') {
            brtMesh0.position.copyFrom(p);
            let trgMesh = null;
            let mlist = []
            for (let m of enList) {
                if (brtMesh0.intersectsMesh(m, true)) {
                    mlist.push(m)
                }
            }
            trgMesh = mlist[Math.floor(mlist.length*Math.random())];
            if (trgMesh != null) {
                let vtrg = trgMesh.position.subtract(p).normalize();
                let xz = vtrg.x**2 + vtrg.z**2
                if (vtrg.y**2/xz > 2) {
                    // 射角が大きいときはなにもしない..フレンドリーファイアを避ける
                    // rayでメッシュとの交差を確認すべきかも
                    return
                }
                if (vtrg.y > 0) {
                    vtrg.y += Math.sqrt(xz)/5 // 上方に修正する
                }
                let bmesh = BABYLON.MeshBuilder.CreateSphere("", { diameter:0.2, segments: 8 }, scene);
                bmesh.position.copyFrom(p);
                bmesh.position.addInPlace(vtrg.scale(2));
                let agg = new BABYLON.PhysicsAggregate(bmesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, friction: 0.08, restitution:0.05}, scene);
                bmesh._agg = agg
                vtrg.scaleInPlace(spd);
                bmesh.physicsBody.applyImpulse(vtrg, bmesh.absolutePosition);
                bmesh._life=life;
                // 発射方向に砲台を回転
                let vrot = Math.atan2(vtrg.x, vtrg.z);
                m.rotation = new BABYLON.Vector3(0, 0, 0);
                m.rotate(BABYLON.Vector3.Up(), vrot);
                bltList.push(bmesh)
            }

        } else if (m._binfo.bullet == 'short') {
            brtMesh1.position.copyFrom(p);
            let trgMesh = null;
            let mlist = []
            for (let m of enList) {
                if (brtMesh1.intersectsMesh(m, true)) {
                    mlist.push(m)
                }
            }
            trgMesh = mlist[Math.floor(mlist.length*Math.random())];
            if (trgMesh != null) {
                let vtrg = trgMesh.position.subtract(p).normalize();
                let xz = vtrg.x**2 + vtrg.z**2
                if (vtrg.y**2/xz > 2) {
                    return
                }
                if (vtrg.y > 0) {
                    vtrg.y += Math.sqrt(xz)/50 // 上方に修正する
                }
                let bmesh = BABYLON.MeshBuilder.CreateSphere("", { diameter:0.1, segments: 8 }, scene);
                bmesh.position.copyFrom(p);
                bmesh.position.addInPlace(vtrg.scale(2));
                let agg = new BABYLON.PhysicsAggregate(bmesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, friction: 0.08, restitution:0.05}, scene);
                bmesh._agg = agg
                vtrg.scaleInPlace(spd);
                bmesh.physicsBody.applyImpulse(vtrg, bmesh.absolutePosition);
                bmesh._life=life;
                // 発射方向に砲台を回転
                let vrot = Math.atan2(vtrg.x, vtrg.z);
                m.rotation = new BABYLON.Vector3(0, 0, 0);
                m.rotate(BABYLON.Vector3.Up(), vrot);
                bltList.push(bmesh)
            }

        } else if (m._binfo.bullet == 'long') {
            brtMesh2.position.copyFrom(p);
            let trgMesh = null;
            let mlist = []
            for (let m of enList) {
                if (brtMesh2.intersectsMesh(m, true)) {
                    mlist.push(m)
                }
            }
            trgMesh = mlist[Math.floor(mlist.length*Math.random())];
            if (trgMesh != null) {
                let vtrg = trgMesh.position.subtract(p).normalize();
                let xz = vtrg.x**2 + vtrg.z**2
                if (vtrg.y**2/xz > 2) {
                    return
                }
                vtrg.y += Math.sqrt(xz)/100 // 上方に修正する
                let bmesh = BABYLON.MeshBuilder.CreateSphere("", { diameterX:0.2, diameterY:0.2, diameterZ:2.0, segments: 8 }, scene);
                bmesh.position.copyFrom(p);
                bmesh.position.addInPlace(vtrg.scale(2));
                let agg = new BABYLON.PhysicsAggregate(bmesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, friction: 0.08, restitution:0.05}, scene);
                agg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
                agg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
                bmesh.physicsBody.disablePreStep = false;
                bmesh._agg = agg
                // 発射方向に砲弾を回転
                let vrot = Math.atan2(vtrg.x, vtrg.z);
                bmesh.rotation = new BABYLON.Vector3(0, 0, 0);
                bmesh.rotate(BABYLON.Vector3.Up(), vrot);
                vtrg.scaleInPlace(spd);
                bmesh.physicsBody.applyImpulse(vtrg, bmesh.absolutePosition);
                bmesh._life=life;
                // 発射方向に砲台を回転
                // let vrot = Math.atan2(vtrg.x, vtrg.z);
                m.rotation = new BABYLON.Vector3(0, 0, 0);
                m.rotate(BABYLON.Vector3.Up(), vrot);

                bltList.push(bmesh)
            }

        // } else if (m._binfo.bullet == 'long') {
        } else {
            console.log("type=",bullet);
            console.assert(0);
        }
    }

    scene.onBeforeRenderObservable.add((scene) => {
        // 爆発の経過
        {
            for (let i=expList.length-1; i>=0; --i) {
                let m = expList[i];
                if (m._i++ >= 90) {
                    expList.splice(i, 1);
                    // m.dispose();
                    for (let e of m._list) {
                        e.dispose();
                    }
                    if (m._mesh != null) {
                        let m2 = m._mesh;
                        if (('_instEnt' in m2) && (m2._instEnt!=null)) {
                            let instEnt = m2._instEnt;
                            let idx = instEntUsed.indexOf(instEnt);
                            if (idx >= 0) {
                                instEntUsed.splice(idx, 1);
                            }
                            instEnt.rootNodes[0].parent=null;
                            instEnt.rootNodes[0].position.set(0, -1, 0);
                            instEntPool.push(instEnt)
                        }
                        m._mesh.dispose();
                    }
                    // delete e;
                    continue;
                }
                let v = Math.sin(m._i*R1);
                // m.material.alpha= 1-v;
                m._list[0].material.alpha= 1-v;
                    // for (let e of m._list) {
                    //     e.material.alpha= 1-v;
                    // }
                let explode = m._r*v;
                m.explode(explode);
            }
        }

        // タワーのフロア落下確認
        {
            for (let i=towerElem.length-1; i>=0; --i) {
                let m = towerElem[i];
                // // if (m == null || !('position' in m)) {
                // //     towerElem.splice(i, 1);
                // //     continue;
                // // }
                if (Math.abs(m.position.y) < 0.6) {
                    towerElem.splice(i, 1);
                    addExplosion({mesh:m, n:500});
                    // m.dispose()
                    let idx = cannonList.indexOf(m);
                    if (idx>=0) {
                        cannonList.splice(idx, 1);
                    }
                    if (towerElem.length == 0) {
                        console.log("defeat (>_<)");
                        setDefeatLabel();
                        setTimeout(resetStage, 10000); // 10秒後にリセット
                    }
                }
            }
        }
        
        // 自機（cannon)のターン
        {
            // 砲台の発射
            for (let m of cannonList) {
                if (m._coolTime-- > 0) {
                    continue
                }
                m._coolTime = m._binfo.cooltimeIni
                // let bullet = m._binfo.bullet;
                createBullet(m);
            }
            // 射出後の弾
            for (let i=bltList.length-1; i>=0; --i) {
                let m = bltList[i];
                if (m._life-- == 0) {
                    // life=0
                    bltList.splice(i, 1);
                    m.dispose()
                    continue;
                    // addExplosion({mesh:m, n:20});
                }
                if (Math.abs(m.position.x) > 200 || Math.abs(m.position.z) > 200) {
                    // 場外
                    bltList.splice(i, 1);
                    m.dispose()
                }
                // 衝突の判定（この方法では、100%ではない：たまにぶつかって跳ね返る
                let enMesh = null;
                for (let ii=enList.length-1; ii>=0; --ii) {
                    enMesh = enList[ii];
                    if (enMesh.intersectsMesh(m, true)) {
                        // console.log("hit");
                        enList.splice(ii, 1);
                        addExplosion({mesh:enMesh, n:20});
                        score += enMesh._score *2;
                        setScoreLabel(score);
                        break;
                    }
                    enMesh = null;
                }
                if (enMesh != null) {
                    // 弾が敵と衝突
                    bltList.splice(i, 1);
                    m.dispose()
                }
            }
            if (autoArrange) {
                if (autoArrangeCoolTime-- <= 0) {
                    autoArrangeCoolTime = autoArrangeCoolTimeIni;
                    arrangeTower();
                }
            }
        }

        // 敵のターン
        {
            // pop判定
            if (enCoolTime>0) {
                --enCoolTime;
            } else {
                enCoolTime=enCoolTimeIni;
                if (enList.length < enActN && enRestN > 0) {
                    let enMesh = popEnemy();
                    enList.push(enMesh);
                    --enRestN;
                }
            }
            // life, 場外判定
            for (let i=enList.length-1; i>=0; --i) {
                let m = enList[i];
                if (m._life-- == 0) {
                    // life=0
                    enList.splice(i, 1);
                    addExplosion({mesh:m, n:20});
                    continue;
                }
                if (Math.abs(m.position.x) > 200 || Math.abs(m.position.z) > 200) {
                    // 場外
                    score += m._score;
                    setScoreLabel(score);
                    enList.splice(i, 1);
                    m.dispose()
                }
            }
            if (enRestN == 0 && enList.length==0) {
                setWave();
            }
        }
    });


    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key === '0') {
                addFloor();
            }
            if (kbInfo.event.key === '1') {
                addCannon(0);
            }
            if (kbInfo.event.key === '2') {
                addCannon(1);
            }
            if (kbInfo.event.key === '3') {
                addCannon(2);
            }
            if (kbInfo.event.key === 'a' || kbInfo.event.key === ' ') {
                arrangeTower();
            }
            if (kbInfo.event.key === 'c') {
                icamera = (icamera+1) % ncamera;
                changeCamera(icamera);
            }
            if (kbInfo.event.key === 'r') {
                resetStage();
            }
            // if (kbInfo.event.key === 'h') {
            //     if (guiLabelRect.isVisible) {
            //         guiLabelRect.isVisible = false;
            //     } else {
            //         guiLabelRect.isVisible = true;
            //     }
            // }
            break;
        // case BABYLON.KeyboardEventTypes.KEYUP:
        //     break;
        }
    });

    // ------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Wave.999";
    // text1.text = "";
    text1.color = "white";
    text1.fontSize = 36;
    text1.height = "60px";
    text1.width = "250px";
    // text1.zIndex = -9; // 背面に隠しておく
    text1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    text1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
//    text1.top = "-1000px";
    advancedTexture.addControl(text1);
    let setWaveLabel = function(v) {
        text1.text = "Wave." + v;
    }
    let setDefeatLabel = function(v) {
        text1.text = "Defeat! (>_<)";
    }

    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Score.9999";
    // text2.text = "";
    text2.color = "white";
    text2.fontSize = 36;
    text2.height = "60px";
    text2.width = "250px";
    // text2.zIndex = -9; // 背面に隠しておく
    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
//    text2.top = "-1000px";
    advancedTexture.addControl(text2);   
    let setScoreLabel = function(v) {
        text2.text = "Score." + v;
        // アイコンの色を変更
        let alphaL = 0.2;
        if (v >= ctype2binfo[0].cost) {
            guiIcon1.alpha=1;
        } else {
            guiIcon1.alpha=alphaL;
        }
        if (v >= ctype2binfo[1].cost) {
            guiIcon2.alpha=1;
        } else {
            guiIcon2.alpha=alphaL;
        }
        if (v >= ctype2binfo[2].cost) {
            guiIcon3.alpha=1;
        } else {
            guiIcon3.alpha=alphaL;
        }
    }

    let addCannon = function(v) {
        let mesh, iy = towerElem._y + towerElem.length, cost = ctype2binfo[v].cost;
        // if (v == 0) {
        //     cost = 10;
        // } else if (v == 1) {
        //     cost = 50;
        //     mesh = creaetCannon({ctype:1}); mesh.position.y=iy++; towerElem.push(mesh); cannonList.push(mesh)
        // } else if (v == 2) {
        //     cost = 100;
        //     mesh = creaetCannon({ctype:2}); mesh.position.y=iy++; towerElem.push(mesh); cannonList.push(mesh)
        // }
        // if (score >= cost) {
        //     score -= cost;
        // } else {
        //     return;
        // }
        if (score >= cost) {
            score -= cost;
            setScoreLabel(score);
        } else {
            return;
        }
        mesh = creaetCannon({ctype:v}); mesh.position.y=iy++; towerElem.push(mesh); cannonList.push(mesh)
        towerElem._iy = iy;
    }

    let addFloor = function() {
        let mesh, iy = towerElem._y + towerElem.length;
        mesh = createtFloor(); mesh.position.y=iy++; towerElem.push(mesh);
        towerElem._iy = iy;
    }

    // 画面左下。アイコン
    var guiIcon1 = new BABYLON.GUI.Image("ctrl", iconPath1);
    {
        guiIcon1.width = "60px";
        guiIcon1.height = "60px";
        guiIcon1.bottom = "5px";
        guiIcon1.autoScale = false
        guiIcon1.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIcon1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        guiIcon1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        guiIcon1.onPointerUpObservable.add(function() {
            addCannon(0);
        });
        advancedTexture.addControl(guiIcon1);   
    }

    var guiIcon2 = new BABYLON.GUI.Image("ctrl", iconPath2);
    {
        guiIcon2.width = "60px";
        guiIcon2.height = "60px";
        guiIcon2.bottom = "5px";
        guiIcon2.left = "70px";
        guiIcon2.autoScale = false
        guiIcon2.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIcon2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        guiIcon2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        guiIcon2.onPointerUpObservable.add(function() {
            addCannon(1);
        });
        advancedTexture.addControl(guiIcon2);   
    }

    var guiIcon3 = new BABYLON.GUI.Image("", iconPath3);
    {
        guiIcon3.width = "60px";
        guiIcon3.height = "60px";
        guiIcon3.bottom = "5px";
        guiIcon3.left = "135px";
        guiIcon3.autoScale = false
        guiIcon3.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIcon3.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        guiIcon3.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        guiIcon3.onPointerUpObservable.add(function() {
            addCannon(2);
        });
        advancedTexture.addControl(guiIcon3);   
    }

    // 画面右下。アイコン
    var guiIcon4 = new BABYLON.GUI.Image("", iconPath4);
    {
        guiIcon4.width = "60px";
        guiIcon4.height = "60px";
        guiIcon4.bottom = "5px";
        guiIcon4.autoScale = false
        guiIcon4.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIcon4.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        guiIcon4.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        guiIcon4.onPointerUpObservable.add(function() {
            setIcon4()
        });
        advancedTexture.addControl(guiIcon4);
        // guiIcon4._enable = 0;
    }
    let setIcon4 = function() {
        autoArrange = !autoArrange
        // guiIcon4._enable = !guiIcon4._enable;
        if (autoArrange) {
// console.log("setIcon4  1")
            // guiIcon4.color = BABYLON.Color3.White();
            guiIcon4.alpha = 1;
            arrangeTower();
        } else {
// console.log("setIcon4  0")
            // guiIcon4.color = BABYLON.Color3.Black();
            guiIcon4.alpha = 0.2;
        }
    }


    // ----------------------------------------
    let score = 100;
    // createStage();
    // setWave();
    // setScoreLabel(score);
    let autoArrange = 1, autoArrangeCoolTime=0, autoArrangeCoolTimeIni=500; // about 30sec?
    // setIcon4();

    resetStage();

    return scene;
}


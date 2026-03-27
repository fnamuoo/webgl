// 迷路内に湧き出るボールをゴールに導くゲーム(タワーディフェンス系の逆構造)

//　- ゴール（赤パネル）に一定数のボールを導けばステージクリア
//  - ゴールへのルートは複数あり

// w/s/a/d    .. カーソル（緑のbox）の移動
// z/x or ,/. .. 配置ユニット(*)の変更
// (space)    .. ユニットの設置／削除
// (enter)    .. ボールのボップを一時停止
// 1          .. ボップするボール数を+100
// 0          .. ボールをリセット
//
// n/N        .. ステージ変更

// *) 配置ユニットの種類
//    - 削除（カーソル位置の設置ユニットを削除する）
//    - ボックス
//    - 斜めの仕切り（２方向）
//    - 加速器（すい形で加速方向を示す：４方向）


// // for local
const SCRIPT_URL1 = "./Maze.js";
const SCRIPT_URL2 = "./MazeData2.js";

// // for PlayGround
// const SCRIPT_URL1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";
// const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/131/MazeData2.js";

let Maze = null;
let MazeData = null;
await import(SCRIPT_URL1).then((obj) => { Maze = obj; });
await import(SCRIPT_URL2).then((obj) => { MazeData = obj; });

const R45 = Math.PI/4;
const R90 = Math.PI/2;

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);

    let camera = null, myMesh=null;
    let icamera = 0, ncamera = 1;
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
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, 100), scene);
    light.intensity = 0.2;
    var light2 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, -100), scene);
    light2.intensity = 0.2;
    var light3 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, 100), scene);
    light3.intensity = 0.2;
    var light4 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, -100), scene);
    light4.intensity = 0.2;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);


    let maze = null;
    const wL=2.5, wL_=wL/2, wS=0.1, wS_=wS/2, wH=2.2, wH_=wH/2;
    let adjx=0, adjz=0, nx, nz, adjx2, adjz2, nz2;
    let pSrc = new BABYLON.Vector3();


    let nstage = MazeData.map2keys.length;
    let istage = 0;
    istage = 0;
    let stageInfo = [];
    let meshGoalList = [];
    let clearCount = 0, needClearCount=10;
    function createStage(istage) {
        while (stageInfo.length > 0) {
            let [mesh, agg] = stageInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }
        stageInfo = [];
        meshGoalList = [];
        for (let mesh of meshUnitList) {
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            // if (mesh._agg != null) { mesh._agg.dispose(); }
            mesh.dispose();
        }
        meshUnitList = [];
        meshUnitAccList = [];
        clearCount = 0;

        console.log("stage.name=", MazeData.map2keys[istage]);
        let sdata = MazeData.getMap2Data(MazeData.map2keys[istage]);
        maze = new Maze.Maze2(11, 11);
        maze.create_from(sdata)

        let meshes = [];

        adjx=-(maze.ncol_-1)*wL_, adjz=-(maze.nrow_+1)*wL_, nx=maze.ncol_, nz=maze.nrow_;
        let x,y=wH_,z, ix,iz;

        let ground = BABYLON.MeshBuilder.CreateGround("ground", {width:(nx+4)*wL, height:(nz+4)*wL}, scene);
        let groundAgg = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);
        ground.material = new BABYLON.StandardMaterial('mat', scene);
        ground.material.diffuseColor = BABYLON.Color3.Black();
        ground.material.alpha = 0.7;
        meshes.push(ground);
        stageInfo.push([ground, groundAgg]);

        // スタート地点のパネル
        {
            [iz, ix] = maze.pStart_;
            let mesh = BABYLON.MeshBuilder.CreatePlane("plnST", {width:wL, height:wL}, scene);
            pSrc.set(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz);
            mesh.position.copyFrom(pSrc);
            mesh.rotation = new BABYLON.Vector3(Math.PI/2, 0, 0);
            mesh.material = new BABYLON.StandardMaterial('mat', scene);
            mesh.material.diffuseColor = BABYLON.Color3.Blue();
            stageInfo.push([mesh, null]);
        }
        // ゴール地点のパネル
        for (let [iz,ix] of maze.pGoalList_) {
            let mesh = BABYLON.MeshBuilder.CreatePlane("plnST", {width:wL, height:wL}, scene);
            mesh.position = new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz);
            mesh.rotation = new BABYLON.Vector3(Math.PI/2, 0, 0);
            mesh.material = new BABYLON.StandardMaterial('mat', scene);
            mesh.material.diffuseColor = BABYLON.Color3.Red();
            stageInfo.push([mesh,null]);
            meshGoalList.push(mesh);
        }
        console.log("meshGoalList.size=", meshGoalList.length);

        function createWallNS(x, y, z) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", { width:wL, height:wH, depth:wS }, scene);
            mesh.position = new BABYLON.Vector3(x, y, z);
            let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
            return [mesh, agg];
        }

        function createWallEW(x, y, z) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", { width:wS, height:wH, depth:wL }, scene);
            mesh.position = new BABYLON.Vector3(x, y, z);
            let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
            return [mesh, agg];
        }


        {
            // 上側の境界
            iz = 0;
            z = nz*wL+adjz;
            for (let ix = 0; ix < nx; ++ix) {
                if (maze.isWallPosiDir([iz,ix],3)) { // 北向き
                    x = ix*wL+adjx;
                    let [mesh, agg] = createWallNS(x, y, z+wL_);
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                }                
            }
        }
        {
            // 左側の境界
            ix = 0;
            x = adjx;
            for (let iz = 0; iz < nz; ++iz) {
                if (maze.isWallPosiDir([iz,ix],2)) { // 西向き
                    z = (iz+1)*wL+adjz;
                    let [mesh, agg] = createWallEW(x-wL_, y, z)
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                }
            }
        }
        for (let iz = 0; iz < nz; ++iz) {
            z = (nz-iz)*wL+adjz;
            for (let ix = 0; ix < nx; ++ix) {
                x = ix*wL+adjx;
                if (maze.isWallPosiDir([iz,ix],0)) { // 東向き
                    let [mesh, agg] = createWallEW(x+wL_, y, z)
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                }
                if (maze.isWallPosiDir([iz,ix],1)) { // 南向き
                    let [mesh, agg] =createWallNS(x, y, z-wL_);
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                }
            }
        }

        meshMy._ix = maze.pStart_[1];
        meshMy._iz = maze.pStart_[0];
        meshMy.position.set(pSrc.x, wL_, pSrc.z);
        ballEnable = true;

        return meshes;
    }
    function nextStage(istage_) {
        istage = istage_+1;
        if (istage == nstage) {
            // 最終面クリア後は、チュートリアルはskipしてループ
            istage = 5;
        }
        ballEnable = false;
        clearBall();
        meshes = createStage(istage);
    }


    // カーソル
    let meshMy = BABYLON.MeshBuilder.CreateBox("cursor", { size:wL}, scene);
    let meshMySub = null;
    meshMy.position.set(adjx, wL_, adjz);
    meshMy.material = new BABYLON.StandardMaterial("", scene);
    meshMy.material.diffuseColor = BABYLON.Color3.Green();
    meshMy.material.alpha = 0.5;
    let moveCursor = function(ix, iz) {
        // ix,izを周回させる
        if (ix < 0) { ix += nx; } else { ix = ix % nx; }
        if (iz < 0) { iz += nz; } else { iz = iz % nz; }
        meshMy.position.set(ix*wL+adjx, wL_, (nz-iz)*wL+adjz);
        meshMy._ix = ix;
        meshMy._iz = iz;
    }
    let chCursor = function(iunit) {
        if (meshMySub != null) {
            meshMySub.parent = null;
            meshMySub.dispose();
            meshMySub = null;
        }
        meshMySub = crUnitMesh(iunit);
        if (meshMySub != null) {
            // 配置するユニットのメッシュをカーソルに紐づける
            meshMySub.parent = meshMy;
        }
    }

    // ユニット
    let iunit = 0, nunit = 8, nunit_=nunit-1, meshUnitList=[], meshUnitAccList=[];
    let crUnitMesh = function(iunit) {
        let mesh = null;
        if (iunit == 1) {
            // ブロック（四角）
            mesh = BABYLON.MeshBuilder.CreateBox("", {size:wL-0.1}, scene);

        } else if ((iunit == 2)||(iunit == 3)) {
            // 斜め面（平面）
            mesh = BABYLON.MeshBuilder.CreatePlane("", {size:wL-0.1, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            mesh.rotate(new BABYLON.Vector3(0, 1, 0), R45+R90*(iunit-2));
        } else if ((iunit >= 4)&&(iunit <= 7)) {
            // 加速器
            mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:0, diameterBottom:wL, height:wL, tessellation:6});
            mesh.rotation.x = R90;
            mesh.rotation.y = R90*(iunit-4);
        }
        if (mesh != null) {
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.material.diffuseColor = BABYLON.Color3.Yellow();
        }
        return mesh;
    }
    let addUnit = function(iunit) {
        console.log("addUnit: iunit=", iunit);
        let [ix,iz] = [meshMy._ix, meshMy._iz]; // カーソル位置
        let p = new BABYLON.Vector3(ix*wL+adjx, wL_, (nz-iz)*wL+adjz);

        if (iunit == 0) {
            // 消しゴム
            let dellist = [];
            meshUnitList.forEach((mesh) => {
                if (mesh.intersectsMesh(meshMy, false)) {
                    dellist.push(mesh);
                }
            });
            for (let mesh of dellist) {
                let i = meshUnitList.indexOf(mesh);
                meshUnitList.splice(i, 1);
                mesh._agg.dispose();
                mesh.dispose();
            }

        } else if (iunit == 1) {
            // ブロック（四角）
            let mesh = crUnitMesh(iunit);
            mesh.position.copyFrom(p);
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);
            meshUnitList.push(mesh);

        } else if ((iunit == 2)||(iunit == 3)) {
            // 斜め面（平面）
            let mesh = crUnitMesh(iunit);
            mesh.position.copyFrom(p);

            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
            meshUnitList.push(mesh);

        } else if ((iunit >= 4)&&(iunit <= 7)) {
            // 加速器
            let mesh = crUnitMesh(iunit);
            mesh.position.copyFrom(p);
            mesh._adir = null;
            // 加速方向を設定
            let srate = 0.1;
            if (iunit == 4) {
                mesh._adir = BABYLON.Vector3.Forward().scale(srate);
            } else if (iunit == 5) {
                mesh._adir = BABYLON.Vector3.Right().scale(srate);
            } else if (iunit == 6) {
                mesh._adir = BABYLON.Vector3.Backward().scale(srate);
            } else if (iunit == 7) {
                mesh._adir = BABYLON.Vector3.Left().scale(srate);
            }
            meshUnitList.push(mesh);
            meshUnitAccList.push(mesh);

        } else {
            console.log("underconstruct iunit=", iunit);
        }
    }

    // ボール
    let balls=[], pool=[], ymin=-10, ballEnable=true;
    let nBall=500, ballR=1.5, popCool=0, popCoolDef=30;
    let popBall = function() {
        let mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter:ballR }, scene);
        mesh.position.copyFrom(pSrc);
        mesh.position.addInPlace(BABYLON.Vector3.Random(-0.01, 0.01));
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass:0.1, friction: 0.0001, restitution:0.01}, scene);
        mesh.physicsBody.disablePreStep = false;
        mesh._valid=1;
        balls.push(mesh);
    }
    let resetPosiBall = function(mesh) {
        // ステージクリア時のclearBall()のタイミングが悪いのか、下記で null 判定が起こりエラーになる対策（エラーを無視する）
        try {
            mesh.position.copyFrom(pSrc);
            mesh.position.addInPlace(BABYLON.Vector3.Random(-0.01, 0.01));
            mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
            mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
        } catch (e) {
            // console.log("  failed ... ",[i,n]);
        }
    }
    scene.onBeforeRenderObservable.add(() => {
        if (ballEnable) {
            if (popCool > 0) {
                popCool = popCool-1;
            } else {
                popCool = popCoolDef;
                if (pool.length > 0) {
                    let mesh = pool.shift();
                    mesh._valid=1;
                    resetPosiBall(mesh);
                } else if (balls.length < nBall) {
                    popBall();
                }
            }
        }
        balls.forEach((mesh) => {
            if (mesh._valid==1) {
                // 場外判定
                if (mesh.position.y < ymin) {
                    mesh._valid=0;
                    pool.push(mesh);
                }
                // 加速判定
                for (let meshAcc of meshUnitAccList) {
                    if (mesh.intersectsMesh(meshAcc, false)) {
                        mesh._agg.body.applyImpulse(meshAcc._adir, mesh.absolutePosition);
                    }
                }
                // ゴール判定
                for (let meshGoal of meshGoalList) {
                    if (mesh.intersectsMesh(meshGoal, true)) {
                        mesh._valid=0;
                        pool.push(mesh);
                        ++clearCount;
                        // console.log("\nclearCount=",clearCount);
                        if (clearCount >= needClearCount) {
                            nextStage(istage);
                        }
                    }
                }
            }
        });
    })
    let clearBall = function() {
        let balls_ = balls;
        balls = [];
        let pool_ = pool;
        pool = [];
        // タイミングを調整／sleep 代わりに呼び出す。render でのエラー対策。
        for (let i = 0; i < 10; ++i) {
            scene.render();
        }
        for (let mesh of balls_) {
            mesh._agg.dispose();
            mesh.dispose();
        }
        for (let mesh of pool_) {
            mesh._agg.dispose();
            mesh.dispose();
        }
    }
   

    // Input to direction
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 'ArrowUp') {
                moveCursor(meshMy._ix, meshMy._iz-1);
            } else if (kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowDown') {
                moveCursor(meshMy._ix, meshMy._iz+1);
            } else if (kbInfo.event.key == 'a' || kbInfo.event.key == 'ArrowLeft') {
                moveCursor(meshMy._ix-1, meshMy._iz);
            } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
                moveCursor(meshMy._ix+1, meshMy._iz);

            } else if (kbInfo.event.key == 'z' || kbInfo.event.key == ',') {
                iunit = (iunit + nunit_) % nunit;
                chCursor(iunit);
            } else if (kbInfo.event.key == 'x' || kbInfo.event.key == '.') {
                iunit = (iunit + 1) % nunit;
                chCursor(iunit);

            } else if (kbInfo.event.key == ' ') {
                addUnit(iunit);

            } else if (kbInfo.event.key === 'Enter') {
                ballEnable = !ballEnable;
                console.log("ballEnable=", ballEnable);
            } else if (kbInfo.event.key == '1') {
                nBall += 100;
                console.log("nBall=", nBall);
            } else if (kbInfo.event.key == '0') {
                clearBall();

            } else if ((kbInfo.event.key === 'n') || (kbInfo.event.key === 'N')) {
                // scene.render();
                if (kbInfo.event.key === 'n') {
                    istage = (istage+1) % nstage;
                } else if (kbInfo.event.key === 'N') {
                    istage = (istage+nstage-1) % nstage;
                }
                ballEnable = false;
                clearBall();
                meshes = createStage(istage);

                // setDest();
            } else if (kbInfo.event.key === 'h') {
                //   キー操作(h)で表示のon/offを切り替え
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
            break;
        }
    });

    // ----------------------------------------
    let meshes = createStage(istage);

    return scene;
}

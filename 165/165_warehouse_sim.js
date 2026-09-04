// Babylon.js で物理演算(Havok) ：倉庫の搬入・搬出シミュレーション(いまいち)

// ######################################################################

//                   (-) ------ (-)
// (s) ---> (-)  (-) ------ (-)  |   (-) ------ (-)
//           |    |              |    |
//           |    |  (-) ------ (-)   |
// (s) ---> (-)  (-) ------ (-)  |   (-) ------ (-)
//           |    |              |    |
//           |    |              |    |
//           +----+              +----+

export var createScene_test_2004 = async function () {
    var scene = new BABYLON.Scene(engine);

    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(0, 0, 0));
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        return _camera;
    }
    let crCamera1 = function() {
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 60, new BABYLON.Vector3(0, 0, 0));
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        return _camera;
    }
    // camera = crCameraDef();
    camera = crCamera1();

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    let crGrnd = function(size=100) {
        // 平面地面
        let grndW = size, grndH = size;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
        return mesh;
    }
    crGrnd();

    const R15 = Math.PI/12;
    const R30 = Math.PI/6;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R360 = Math.PI*2;
    const R390 = Math.PI*13/6;

    // --------------------------------------------------
    let crMesh11 = function() {
        // トラック
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 0.1;
        let R90 = Math.PI/2;
        // フロント
        let mesh01 = BABYLON.MeshBuilder.CreateBox("", {size:1, width:2}, scene);
        mesh01.position.set(0.0, 0.5+adjy, 1.5);
        mesh01.parent = mesh;
        // 荷台(下敷き)
        let mesh02 = BABYLON.MeshBuilder.CreateBox("", {width:2, height:0.1, depth:4}, scene);
        mesh02.position.set(0.0, 0.05+adjy, 0);
        mesh02.parent = mesh;
        // 荷台(カーゴ)
        let mesh03 = BABYLON.MeshBuilder.CreateBox("", {width:2, height:2.5, depth:3}, scene);
        mesh03.position.set(0.0, 1.25+adjy, -0.5);
        mesh03.material = new BABYLON.StandardMaterial('', scene);
        mesh03.material.alpha = 0.5;
        mesh03.parent = mesh;
        // ホイール
        for (let [x,z] of [[-0.9, 1.2], [0.9, 1.2], [-0.9, -1.5], [0.9, -1.5]]) {
            let mesh11 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:0.5, height:0.2}, scene);
            mesh11.rotation.z = R90;
            mesh11.position.set(x, -0.2+adjy, z);
            mesh11.parent = mesh;
        }
        return mesh;
    }

    // --------------------------------------------------
    // レーン（IN/OUT）の占有の有無
    let laneIN = [0, 0, 0];

    let t10step = 0.005 * scene.getAnimationRatio();
    let t10 = 1, t10e = 1, t10loop = 0, t10nloop = 10;
    let trackIN = [];

    let box1List = []; // 倉庫棚に格納までの 貨物box 候補

    let crBox = function(x, y, z) {
        // 貨物box
        let mesh = BABYLON.MeshBuilder.CreateBox("", {size:1}, scene);
        mesh.position.set(x, y, z);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1, friction:0.9, restitution:0.1}, scene);
        return mesh;
    }

    let fn10b = function() {
        // 入庫用トラックの pop
        t10 += t10step * Math.random();
        if (t10 >= t10e) {
            t10 = 0;
            if ((laneIN[0] + laneIN[1] + laneIN[2]) < 3) {
                let ilane = 0;
                for (let i = 0; i < laneIN.length; ++i) {
                    if (laneIN[i] == 0) {
                        ilane = i;
                        break;
                    }
                }
                // トラックのpop
                laneIN[ilane] = 1;
                let mesh = crMesh11();
                mesh._ilane = ilane;
                mesh._state = "start";
                mesh._s = 0;
                mesh._step = 0.01;
                mesh.position.set(-30, 0, ilane*10);
                mesh.rotation.y = -R90;
                mesh._npackage = Math.floor(Math.random()*3) + 1;
                trackIN.push(mesh);
            }
        }
        // トラックの駐車（バック）、荷下ろし、発進
        let delList = [];
        for (let mesh of trackIN) {
            mesh._s += mesh._step;
            if (mesh._s >= 1) {
                mesh._s = 0;
                if (mesh._state == "start") {
                    mesh._state = "unload"; // 荷下ろし
                    mesh._s = 0.95;
                    mesh._step = 0.005;
                } else if (mesh._state == "unload") {
                    mesh._state = "leave"; // レーンを離れる
                    mesh._step = 0.01;
                } else if (mesh._state == "leave") {
                    // laneIN[mesh._ilane] = 0;
                    // mesh.dispose();
                    delList.push(mesh);
                }
            }
            if (mesh._state == "start") {
                mesh.position.x = -30 + mesh._s*5;
            } else if (mesh._state == "unload") {
                if ((mesh._npackage > 0) && (mesh._s > 0.9)) {
                    mesh._npackage -= 1;
                    mesh._s = 0;
                    let meshBox = crBox(-25, 2.2, mesh._ilane*10);
                    box1List.push(meshBox);
                    // 貨物box運搬用のプレート
                    crPlate21(mesh._ilane);
                }
            } else if (mesh._state == "leave") {
                mesh.position.x = -25 - mesh._s*10;
            }
        }
        for (let mesh of delList) {
            let i = trackIN.indexOf(mesh);
            if (i < 0) {continue;}
            trackIN.splice(i, 1);
             laneIN[mesh._ilane] = 0;
             mesh.dispose();
        }
    }
    let fnobj10b = scene.onBeforeRenderObservable.add(fn10b);

    let mesh21blist = [];
    let crPlate21 = function(ilane) {
        // 貨物box運搬用のプレート
        let mesh = BABYLON.MeshBuilder.CreateBox("", {size:2, height:0.1}, scene);
        mesh._rad = R180-R30;
        let x = Math.cos(-mesh._rad) * 6 - 19;
        let y = Math.sin(-mesh._rad-R30);
        let z = ilane*10;
        mesh._z = z;
        mesh.position.set(x,y,z);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0, friction:0.9, restitution:0.1}, scene);
        mesh._agg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
        mesh.physicsBody.disablePreStep = false;
        mesh21blist.push(mesh);
    }
    let fn21b = function() {
        const targetRot = BABYLON.Quaternion.Identity();
        let delList = [];
        for (let mesh of mesh21blist) {
            mesh._rad += 0.01;
            if (mesh._rad >= R390) { delList.push(mesh);}
            let x = Math.cos(-mesh._rad) * 6 - 19;
            let y = Math.sin(-mesh._rad-R30);
            let z = mesh._z;
            const targetPos = new BABYLON.Vector3(x, y, z);
            mesh._agg.body.setTargetTransform(targetPos, targetRot);
        }
        for (let mesh of delList) {
            let i = mesh21blist.indexOf(mesh);
            mesh21blist.splice(i, 1);
            mesh.dispose();
        }
    }
    let fnobj21b = scene.onBeforeRenderObservable.add(fn21b);

    // ベルトコンベア(1)
    let mesh30blist = [], nmesh30 = 30, path3d30;
    {
        let datalist = [
            [-15, 25],
            [-15, 20],
            [-15, 15],
            [-15, 10],
            [-15, 5],
            [-15, 0],
            [-15, -5],
            [-15, -10],
            [-10, -10],
            [-10, -5],
            [-10, 0],
            [-10, 5],
            [-10, 10],
            [-10, 15],
            [-10, 20],
            [-10, 25],
        ];
        let plist = [];
        for (let d of datalist) {
            plist.push(new BABYLON.Vector3(d[0], 0.1, d[1]))
        }
        // 点列plist を補間、スムージング
        const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 5, false);//open
        const plist2 = catmullRom.getPoints();
        // 曲線情報path3dを作成
        let path3d = new BABYLON.Path3D(plist2);
        path3d30 = path3d;
        {
            // plist のデバッグ表示
            let mesh = BABYLON.CreateGreasedLine(
                "", {points:plist2,
                     widths:[4],
                     widthDistribution:BABYLON.GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_REPEAT,
                    }, {color:BABYLON.Color3.Red(),}, scene);
        }
        let n = 10;
        for (let i = 0; i < nmesh30; ++i) {
            let s = i / nmesh30;
            // 貨物box運搬用のプレート (2) .. ベルトコンベア(1)上
            let mesh = BABYLON.MeshBuilder.CreateBox("", {size:2, height:0.1}, scene);
            mesh._s = s;
            mesh.position.copyFrom(path3d.getPointAt(s));
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0, friction:0.9, restitution:0.1}, scene);
            mesh._agg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
            mesh.physicsBody.disablePreStep = false;
            mesh30blist.push(mesh);
        }
    }
    let fn30b = function() {
        const targetRot = BABYLON.Quaternion.Identity();
        for (let mesh of mesh30blist) {
            mesh._s += 0.001;
            if (mesh._s >= 1) {mesh._s -= 1;}
            mesh._agg.body.setTargetTransform(path3d30.getPointAt(mesh._s), targetRot);
        }
    }
    let fnobj30b = scene.onBeforeRenderObservable.add(fn30b);

    // ガードレール
    {
        let datalist = [[
            [-14, 25],
            [-14, 20],
            [-14, 15],
            [-14, 10],
            [-14, 5],
            [-14, 0],
            [-14, -5],
            [-14, -8],
            [-12.5, -9],
            [-11, -8],
            [-11, -5],
            [-11, 0],
            [-11, 5],
            [-11, 10],
            [-11, 15],
            [-11, 20],
            [-11, 25]
        ],[
            [-16, 25],
            [-16, 20],
            [-16, 15],
            [-16, 10],
            [-16, 5],
            [-16, 0],
            [-16, -5],
            [-16, -10],
            [-12.5, -12],
            [-9, -10],
            [-9, -5],
            [-9, 0],
            [-9, 5],
            [-9, 10],
            [-9, 15],
            [-9, 20],
            [-9, 25]
        ]];
        for (let data of datalist) {
            let plist = [];
            for (let d of data) {
                plist.push(new BABYLON.Vector3(d[0], 0.5, d[1]))
            }
            // 点列plist を補間、スムージング
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 5, false);//open
            const plist2 = catmullRom.getPoints();
            // // 曲線情報path3dを作成
            // let path3d = new BABYLON.Path3D(plist2);
            let mesh = BABYLON.MeshBuilder.CreateTube("tube", {path: plist2, radius: 0.1, tessellation: 4}, scene);
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
        }
    }

    // 倉庫棚(40)
    let whCapaList = []; // 空き[z][y][z] : (0:空き, 1:使用中)
    let whPosiList = []; // 座標[z][y][z] : Vector3
    let whMeshList = []; // 座標[z][y][z] : 貨物box
    let whDim = [6, 5, 8]; // 配列の次元
    let whNUsed = [0,0,0,0,0,0]; // レーン毎の使用数
    let whNUsedMax = whDim[1]*whDim[2]; // レーン毎の使用数最大
    {
        for (let z of [-2.5, 2.5, 7.5, 12.5, 17.5, 22.5]) {
            let z1 = z;
            let whCapaZ = [];
            let whPoziZ = [];
            let whMeshZ = [];
            for (let y of [0, 1.5, 3, 4.5, 6]) {
                let y1 = y+0.6;
                let whCapaY = [];
                let whPoziY = [];
                let whMeshY = [];
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:10, height:0.1, depth:2}, scene);
                mesh.position.set(0,y,z);
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0, friction:0.9, restitution:0.1}, scene);
                for (let x1 of [-4.2, -3.0, -1.8, -0.6, 0.6, 1.8, 3.0, 4.2]) {
                    let mesh2 = BABYLON.MeshBuilder.CreateBox("", {size:0.9}, scene);
                    mesh2.position.set(x1,y1,z1);
                    mesh2.material = new BABYLON.StandardMaterial('', scene);
                    mesh2.material.diffuseColor = BABYLON.Color3.Black();
                    mesh2.material.alpha = 0.1;
                    whCapaY.push(0);
                    whPoziY.push(mesh2.position);
                    whMeshY.push(null);
                }
                whCapaZ.push(whCapaY);
                whPoziZ.push(whPoziY);
                whMeshZ.push(whMeshY);
            }
            whCapaList.push(whCapaZ);
            whPosiList.push(whPoziZ);
            whMeshList.push(whMeshZ);
        }
    }
    if (1) {
        // デフォルトで倉庫棚に貨物boxを配置
        let pR = 0.2;
        for (let iz = 0; iz < whDim[0]; ++iz) {
            for (let iy = 0; iy < whDim[1]; ++iy) {
                for (let ix = 0; ix < whDim[2]; ++ix) {
                    if (Math.random() >= pR) {
                        continue;
                    }
                    whCapaList[iz][iy][ix] = 1;
                    let p = whPosiList[iz][iy][ix];
                    let mesh = crBox(p.x, p.y, p.z);
                    mesh._ix = ix;
                    mesh._iy = iy;
                    mesh._iz = iz;
                    whMeshList[iz][iy][ix] = mesh;
                    ++whNUsed[iz];
                }
            }
        }
    }

    // ------------------------------
    // ベルトコンベア(1)から倉庫棚へ

    // レーン上から倉庫棚へ移動させる
    let mesh51blist = [];
    let coolLane51 = [0, 0, 0], coolLane51Max = 100;
    let banLane = [0, 0, 0];
    let fn51b = function() {
        // レーン上の定位置に来たらの貨物boxの pickup する
        let meshPickupCandi = [];
        for (let ilane of [0, 1, 2]) {
            --coolLane51[ilane];
            // レーンごとに重点ずみかを確認
            banLane[ilane] = 0;
            if ((whNUsed[2*ilane] >= whNUsedMax) && (whNUsed[2*ilane+1] >= whNUsedMax)) {
                banLane[ilane] = 1;
            }
        }
        for (let m of box1List) {
            for (let ilane of [0, 1, 2]) {
                if (banLane[ilane]) {continue;}
                if (coolLane51[ilane] > 0) {continue;}
                let iz = ilane*10;
                if ((Math.abs(m.position.x-(-10)) <= 0.5) && (Math.abs(m.position.z-iz) <= 0.5)) {
                    // pickup対象
                    m._ilane = ilane;
                    meshPickupCandi.push(m);
                    coolLane51[ilane] = coolLane51Max;
                    break;
                }
            }
        }
        for (let m of meshPickupCandi) {
            // box1List から候補meshを排除
            let i = box1List.indexOf(m);
            box1List.splice(i, 1);
            // 改めて、空きの場所を確認
            let p = null;
            {
                let zlist = [m._ilane*2, m._ilane*2+1];
                // ランダムで探して、..
                for (let ilopp = 0; ilopp < 3; ++ilopp) {
                    let iz = zlist[Math.floor(Math.random()*2)];
                    let iy = Math.floor(Math.random() * whDim[1]);
                    let ix = Math.floor(Math.random() * whDim[2]);
                    if (whCapaList[iz][iy][ix] == 0) {
                        whCapaList[iz][iy][ix] = 1;
                        ++whNUsed[iz];
                        p = whPosiList[iz][iy][ix].clone();
                        m._ix = ix;
                        m._iy = iy;
                        m._iz = iz;
                        break;
                    }
                }
                // ダメなら全探査
                if (p == null) {
                    for (let iz of zlist) {
                        for (let iy = 0; iy < whDim[1]; ++iy) {
                            for (let ix = 0; ix < whDim[2]; ++ix) {
                                if (whCapaList[iz][iy][ix] == 0) {
                                    whCapaList[iz][iy][ix] = 1;
                                    ++whNUsed[iz];
                                    p = whPosiList[iz][iy][ix].clone();
                                    m._ix = ix;
                                    m._iy = iy;
                                    m._iz = iz;
                                    break;
                                }
                            }
                            if (p != null) {break;}
                        }
                        if (p != null) {break;}
                    }
                }
            }
            // ベルトコンベアから倉庫棚へのパスを作成
            p.y += 0.1;
            let plist = [];
            let p0 = m.position.clone();
            plist.push(p0.clone());
            p0.y += 1.2;
            plist.push(p0.clone());
            let p1 = p.clone();
            p1.x = p.x;
            p1.y = p.y;
            plist.push(p0.add(p1).scale(0.5));
            plist.push(p1);
            plist.push(p);
            // 点列plist を補間、スムージング
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 5, false);//open
            const plist2 = catmullRom.getPoints();
            // 曲線情報path3dを作成
            let path3d = new BABYLON.Path3D(plist2);
            m._path3d = path3d;
            m._s = 0;
            mesh51blist.push(m);
        }
        let delList = [];
        const targetRot = BABYLON.Quaternion.Identity();
        for (let m of mesh51blist) {
            m._s += 0.01;
            if (m._s >= 1) {delList.push(m); continue;}
            let targetPos = m._path3d.getPointAt(m._s);
            m._agg.body.setTargetTransform(targetPos, targetRot);
        }
        for (let mesh of delList) {
            let i = mesh51blist.indexOf(mesh);
            mesh51blist.splice(i, 1);
            mesh._path3d = null;
            mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
            mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 慣性を止める
            whMeshList[mesh._iz][mesh._iy][mesh._ix] = mesh;
        }
    }
    let fnobj51b = scene.onBeforeRenderObservable.add(fn51b);

    // ------------------------------
    // 倉庫棚からベルトコンベア(2)へ

    let box2List = []; // ベルトコンベア上からトラックへの 貨物box 候補

    // 倉庫棚からレーン上へ移動させる
    let mesh61blist = [];
    let coolLane61 = [0, 100, 400, 600], coolLane61Max = 1000;
    let pzlist = [-5, 5, 15, 25];
    let fn61b = function() {
        let pickBox = true;
        // レーン毎の貨物box数に応じて、抜き出すレーンを決める
        let ilane2 = 0;
        let nBoxLane = [whNUsed[0], (whNUsed[1]+whNUsed[2]), (whNUsed[3]+whNUsed[4]), whNUsed[5]];
        if ((nBoxLane[0] == 0) && (nBoxLane[1] == 0) && (nBoxLane[2] == 0) && (nBoxLane[3] == 0)) {
            pickBox = false;
        }
        if (pickBox == true) {
            let tmp = [];
            for (let i = 0; i < nBoxLane.length; ++i) {
                if (--coolLane61[i] > 0) {continue;}
                let nbox = Math.ceil(nBoxLane[i]/10);
                while (--nbox >= 0) {
                    tmp.push(i);
                }
            }
            if (tmp.length == 0) {
                pickBox = false;
            } else {
                ilane2 = tmp[Math.floor(Math.random()*tmp.length)];
            }
        }
        let ilane2list = [[0],[1,2],[3,4],[5]];
        let mesh = null;
        if (pickBox == true) {
            let ibox = Math.floor(nBoxLane[ilane2]*Math.random());
            for (let iz of ilane2list[ilane2]) {
                if (ibox >= whNUsed[iz]) {
                    ibox -= whNUsed[iz];
                    continue;
                }
                // 全探査で ibox番目のmesh を取り出す
                for (let iy = 0; iy < whDim[1]; ++iy) {
                    for (let ix = 0; ix < whDim[2]; ++ix) {
                        if (whCapaList[iz][iy][ix] == 1) {
                            mesh = whMeshList[iz][iy][ix];
                            if (--ibox <= 0) {
                                break;
                            }
                        }
                    }
                    if (ibox <= 0) {break;}
                }
                break;
            }
            if (mesh == null) {
                pickBox = false;
            } else {
                coolLane61[ilane2] = coolLane61Max;
            }
        }
        if (pickBox == true) {
            // mesh確定
            whCapaList[mesh._iz][mesh._iy][mesh._ix] = 0;
            whMeshList[mesh._iz][mesh._iy][mesh._ix] = null;
            --whNUsed[mesh._iz];
            // 倉庫棚からベルトコンベアへのパスを作成
            let p = mesh.position.clone();
            let pz = pzlist[ilane2];
            let plist = [];
            p.y += 0.1;
            plist.push(p.clone());
            p.z = pz;
            plist.push(p.clone());
            let p2 = p.clone();
            p2.x = 10;
            p2.y = 1.5;
            plist.push(p.add(p2).scale(0.5));
            plist.push(p2.clone());
            // 点列plist を補間、スムージング
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 5, false);//open
            const plist2 = catmullRom.getPoints();
            // 曲線情報path3dを作成
            let path3d = new BABYLON.Path3D(plist2);
            mesh._path3d = path3d;
            mesh._s = 0;
            mesh61blist.push(mesh);
        }
        let delList = [];
        const targetRot = BABYLON.Quaternion.Identity();
        for (let m of mesh61blist) {
            m._s += 0.01;
            if (m._s >= 1) {delList.push(m); continue;}
            let targetPos = m._path3d.getPointAt(m._s);
            m._agg.body.setTargetTransform(targetPos, targetRot);
        }
        for (let mesh of delList) {
            let i = mesh61blist.indexOf(mesh);
            mesh61blist.splice(i, 1);
            mesh._path3d = null;
            mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
            mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 慣性を止める
            box2List.push(mesh);
        }

    }
    let fnobj61b = scene.onBeforeRenderObservable.add(fn61b);



    let mesh70blist = [], nmesh70 = 38, path3d70;
    {
        let datalist = [
            [10, 30],
            [10, 25],
            [10, 20],
            [10, 15],
            [10, 10],
            [10, 5],
            [10, 0],
            [10, -5],
            [10, -10],
            [15, -10],
            [15, -5],
            [15, 0],
            [15, 5],
            [15, 10],
            [15, 15],
            [15, 20],
            [15, 25],
            [15, 30],
        ];
        let plist = [];
        for (let d of datalist) {
            plist.push(new BABYLON.Vector3(d[0], 0.1, d[1]))
        }
        // 点列plist を補間、スムージング
        const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 5, true);//clse
        const plist2 = catmullRom.getPoints();
        // 曲線情報path3dを作成
        let path3d = new BABYLON.Path3D(plist2);
        path3d70 = path3d;
        {
            // plist のデバッグ表示
            let mesh = BABYLON.CreateGreasedLine(
                "", {points:plist2,
                     widths:[4],
                     widthDistribution:BABYLON.GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_REPEAT,
                    }, {color:BABYLON.Color3.Red(),}, scene);
        }
        let n = 10;
        for (let i = 0; i < nmesh70; ++i) {
            let s = i / nmesh70;
            let mesh = BABYLON.MeshBuilder.CreateBox("", {size:2, height:0.1}, scene);
            mesh._s = s;
            mesh.position.copyFrom(path3d.getPointAt(s));
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0, friction:0.9, restitution:0.1}, scene);
            mesh._agg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
            mesh.physicsBody.disablePreStep = false;
            mesh70blist.push(mesh);
        }
    }
    let fn70b = function() {
        const targetRot = BABYLON.Quaternion.Identity();
        for (let mesh of mesh70blist) {
            mesh._s += 0.001;
            if (mesh._s >= 1) {mesh._s -= 1;}
            mesh._agg.body.setTargetTransform(path3d70.getPointAt(mesh._s), targetRot);
        }
    }
    let fnobj70b = scene.onBeforeRenderObservable.add(fn70b);

    // ガードレール(2)
    {
        let datalist = [[
            [11, 28],
            [11, 25],
            [11, 20],
            [11, 15],
            [11, 10],
            [11, 5],
            [11, 0],
            [11, -5],
            [11, -8],
            [12.5, -9],
            [14, -8],
            [14, -5],
            [14, 0],
            [14, 5],
            [14, 10],
            [14, 15],
            [14, 20],
            [14, 25],
            [14, 28],
            [12.5, 29],
        ],[
            [9, 30],
            [9, 25],
            [9, 20],
            [9, 15],
            [9, 10],
            [9, 5],
            [9, 0],
            [9, -5],
            [9, -10],
            [12.5, -12],
            [16, -10],
            [16, -5],
            [16, 0],
            [16, 5],
            [16, 10],
            [16, 15],
            [16, 20],
            [16, 25],
            [16, 30],
            [12.5, 32],
        ], 
        ];
        for (let data of datalist) {
            let plist = [];
            for (let d of data) {
                plist.push(new BABYLON.Vector3(d[0], 0.5, d[1]))
            }
            // 点列plist を補間、スムージング
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 5, true);//close
            const plist2 = catmullRom.getPoints();
            // // 曲線情報path3dを作成
            // let path3d = new BABYLON.Path3D(plist2);
            let mesh = BABYLON.MeshBuilder.CreateTube("tube", {path: plist2, radius: 0.1, tessellation: 4}, scene);
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
        }
    }

    let laneOUT = [0, 0, 0];

    let t81step = 0.005 * scene.getAnimationRatio();
    let t81 = 1, t81e = 1, t81loop = 0, t81nloop = 10;
    let coolLane81 = [0, 0, 0], coolLane81Max = 80;
    let trackOUT = [];
    let fn81b = function() {
        // 出庫用トラックの pop
        t81 += t81step * Math.random();
        if (t81 >= t81e) {
            t81 = 0;
            if ((laneOUT[0] + laneOUT[1] + laneOUT[2]) < 3) {
                let ilane = 0;
                for (let i = 0; i < laneOUT.length; ++i) {
                    if (laneOUT[i] == 0) {
                        ilane = i;
                        break;
                    }
                }
                // トラックのpop
                laneOUT[ilane] = 1;
                let mesh = crMesh11();
                mesh._ilane = ilane;
                mesh._state = "start";
                mesh._s = 0;
                mesh._step = 0.01;
                mesh.position.set(25, 0, ilane*10);
                mesh.rotation.y = R90;
                mesh._loadPackage = 0;
                mesh._needPackageMax = Math.floor(Math.random()*3) + 1;
                trackOUT.push(mesh);
            }
        }
        // トラックの駐車（バック）、荷積み、発進
        let delList = [];
        for (let mesh of trackOUT) {
            mesh._s += mesh._step;
            if (mesh._s >= 1) {
                if (mesh._state == "start") {
                    mesh._state = "load"; // 荷積み
                    mesh._s = 0;
                    mesh._meshBox = null;
                } else if (mesh._state == "load") {
                    // mesh._s = 0; .. ここでは 0 にしない（下記で0にする
                    if (mesh._loadPackage >= mesh._needPackageMax) {
                        mesh._state = "leave"; // レーンを離れる
                        mesh._s = 0;
                    }
                } else if (mesh._state == "leave") {
                    mesh._s = 0;
                    delList.push(mesh);
                }
            }
            if (mesh._state == "start") {
                mesh.position.x = 25 - mesh._s*5;
            } else if (mesh._state == "load") {
                if (--coolLane81[mesh._ilane] <= 0) {
                    coolLane81[mesh._ilane] = coolLane81Max;
                    let iz = mesh._ilane*10;
                    let meshBox = null;
                    for (let m of box2List) {
                        if ((Math.abs(m.position.x-15) <= 1.2) && (Math.abs(m.position.z-iz) <= 1.2)) {
                            meshBox = m;
                            break;
                        }
                    }
                    if (meshBox != null) {
                        // pickup 荷積み用のboxを確定
                        // .. path3d の軌道でトラックに積む
                        let plist = [];
                        let p1 = meshBox.position.clone();
                        let p2 = mesh.position.clone();
                        p1.y += 0.1;
                        plist.push(p1.clone());
                        p1.y += 1.2;
                        plist.push(p1.clone());
                        let p3 = p2.clone();
                        p3.y += 1.2;
                        let p4 = p1.add(p3).scale(0.5);
                        p4.y += 1;
                        plist.push(p4.clone());
                        plist.push(p3.clone());
                        plist.push(p2.clone());
                        // 点列plist を補間、スムージング
                        const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 5, false);
                        const plist2 = catmullRom.getPoints();
                        // 曲線情報path3dを作成
                        let path3d = new BABYLON.Path3D(plist2);
                        mesh._path3d = path3d;
                        mesh._s = 0;
                        mesh._meshBox = meshBox;
                        //
                        let i = box2List.indexOf(mesh);
                        box2List.splice(i, 1);
                    }
                }
                const targetRot = BABYLON.Quaternion.Identity();
                if (mesh._meshBox != null) {
                    if (mesh._s >= 1) {
                        mesh._s = 0;
                        mesh._meshBox._agg.dispose();
                        mesh._meshBox.dispose();
                        mesh._meshBox = null;
                        ++mesh._loadPackage;
                    } else {
                        let targetPos = mesh._path3d.getPointAt(mesh._s);
                        mesh._meshBox._agg.body.setTargetTransform(targetPos, targetRot);
                    }
                }

            } else if (mesh._state == "leave") {
                mesh.position.x = 20 + mesh._s*10;
            }
        }
        for (let mesh of delList) {
            let i = trackOUT.indexOf(mesh);
            if (i < 0) {continue;}
            trackOUT.splice(i, 1);
            laneOUT[mesh._ilane] = 0;
            mesh.dispose();
        }
    }
    let fnobj81b = scene.onBeforeRenderObservable.add(fn81b);

    // ------------------------------


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

 export var createScene = createScene_test_2004; // 倉庫モデル1_2  .. 倉庫・搬入・搬出の物理モデルだけど...



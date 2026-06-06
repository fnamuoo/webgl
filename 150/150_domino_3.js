// ドミノ / dominoes(3)
//
// 操作
// Space : 開始
// Enter : リセット
// n/b   : ステージ切り替え
//
// ステージ
//   - 〆
//   - 〆(２)
//   - ジグザク
//   - ジグザク(２)
//   - ヘアピン
//   - ループ橋
//   - コ
//   - シークレット１
//   - シークレット２

// 空間ハッシュ(cellSize=1)
class GeoHash {
    constructor(cellSize = 1) {
        this.cellSize = cellSize;
        this.hash = new Map();
    }
    clear() {
        this.hash = new Map();
    }
    hashKey(ix, iy, iz) {
        return `${ix},${iy},${iz}`;
    }
    hashKey2(p) {
        const ix = Math.floor(p.x / this.cellSize);
        const iy = Math.floor(p.y / this.cellSize);
        const iz = Math.floor(p.z / this.cellSize);
        return this.hashKey(ix, iy, iz);
    }
    add(id, p) {
        const key = this.hashKey2(p);
        if (!(key in this.hash)) { this.hash[key] = []; }
        this.hash[key].push(id);
    }
    remove(id, p) {
        const key = this.hashKey2(p);
        if (!(key in this.hash)) {
 console.log("key:",key," not in hash");
        }
        let i = this.hash[key].indexOf(id);
        if (i < 0) {return;}
        this.hash[key].splice(i, 1);
    }
    query(position, radius=2) {
        const r = Math.ceil(radius / this.cellSize);
        const ix = Math.floor(position.x / this.cellSize);
        const iy = Math.floor(position.y / this.cellSize);
        const iz = Math.floor(position.z / this.cellSize);
        let result = [];
        for (let x = ix - r; x <= ix + r; x++) {
            for (let y = iy - r; y <= iy + r; y++) {
                for (let z = iz - r; z <= iz + r; z++) {
                    const key = this.hashKey(x, y, z);
                    if (key in this.hash) {
                        result.push(...this.hash[key]);
                    }
                }
            }
        }
        return result;
    }
    neighbors() {
        const ix = Math.floor(position.x / this.cellSize);
        const iy = Math.floor(position.y / this.cellSize);
        const iz = Math.floor(position.z / this.cellSize);
        let result = [];
        for (let x = ix - 1; x <= ix + 1; x++) {
            for (let y = iy - 1; y <= iy + 1; y++) {
                for (let z = iz - 1; z <= iz + 1; z++) {
                    const key = this.hashKey(x, y, z);
                    if (key in this.hash) {
                        result.push(...this.hash[key]);
                    }
                }
            }
        }
        return result;
    }
};

export var createScene_test_74 = async function () {
    const R15 = Math.PI/12;
    const R20 = Math.PI/9;
    const R30 = Math.PI/6;
    const R45 = Math.PI/4;
    const R60 = Math.PI/3;
    const R90 = Math.PI/2;
    const R120 = Math.PI*2/3;
    const R180 = Math.PI;
    const R270 = Math.PI*3/2;

    const scene = new BABYLON.Scene(engine);
    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        // 101用
//        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(-50, 0, 30.5)); //パナマ運河
//        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(-40, 0, -0.5)); //アメリカ
//        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(-10, 0, -55.5));//カナダ・ロシア
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(0, 0, -0.5));
//        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(25, 0, -5.5)); //japan
//        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(+20, 0, -13)); // フィリピン・オーストラリア
//        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(55, 0, -30.5)); // イラン
//        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(75, 0, -65.5)); // ヨーロッパ
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        return _camera;
    }
    let crCamera2 = function() {
        // バードビュー：対象(cameraTrgMesh)を後方から追跡 .. 速度依存（対象が速いと置いて行かれる）
        let _camera = new BABYLON.FollowCamera("", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 2; // 4;
        _camera.heightOffset = 1; // 2;
        _camera.cameraAcceleration = 0.005;
        _camera.maxCameraSpeed = 5; // 10;
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        // _camera.lockedTarget = null;
        // _camera.setTarget(BABYLON.Vector3.Zero());
        let mesh = BABYLON.MeshBuilder.CreateBox("", {}, scene);
        mesh.visibility = 0; // 不可視に
        _camera._vtrg = mesh.position.clone();
        _camera.lockedTarget = mesh;
        return _camera;
    }
//    camera = crCameraDef(); // debug(全体俯瞰、マウス操作可能
    camera = crCamera2(); // 自動追尾

    const light = new BABYLON.HemisphericLight("", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);

    let g = 98, pushF=0.05;
    scene.enablePhysics(new BABYLON.Vector3(0, -g, 0), hk);


    let sw=0.5, sh=1.0, sd=0.15, mass = 0.02;
    let sw_=sw/2, sh_=sh/2, sd_=sd/2;


    let block1mass = mass, block2mass = mass, block3mass = mass;

    // camera追跡用の情報
    let geoHash = new GeoHash();
    let mid2mesh = {}, mid = 0;

    let stage = 1;// 〆
//    stage = 6; // ループ橋
//    stage = 7; // コ
//    stage = 101; //シークレット１
//    stage = 102; //シークレット２
    let stageList = [1,2,3,4,5,6,7,101,102];

    let crBlock = function(p, rad=0, isSafe=false) {
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sh, depth:sd}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y+sh_, p.z); // 位置の変更する場所が重要!!!!!!!位置を変更して物理にしないと稀におかしなことに
        if (rad != 0) {
            mesh.rotation.y = rad;
        }
        let opt = {mass:block1mass, startAsleep:true};
        if (isSafe) {
            opt = {mass:block1mass, startAsleep:true, friction:1, restitution:0, };
        }
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
        mesh.physicsBody.disablePreStep = false;
        if (isSafe) {
            mesh.physicsBody.setLinearDamping(0.2);
            mesh.physicsBody.setAngularDamping(0.9);
        }
        // camera追跡用の情報
        mesh._mid = mid++;
        mesh._check = false; // 動いた時の確認用
        geoHash.add(mesh._mid, mesh.position);
        mid2mesh[mesh._mid] = mesh;
        return mesh;
    }
    let crBlock2 = function(p, rad=0, isSafe=false) {
        // 寝かせて配置 (奥行を最長)
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sd, depth:sh}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y+sd_, p.z); // 位置の変更する場所が重要!!!!!!!位置を変更して物理にしないと稀におかしなことに
        if (rad != 0) {
            mesh.rotation.y = rad;
        }
        let opt = {mass:block2mass, startAsleep:true};
        if (isSafe) {
            opt = {mass:block2mass, startAsleep:true, friction:1, restitution:0, };
        }
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
        mesh.physicsBody.disablePreStep = false;
        if (isSafe) {
            mesh.physicsBody.setLinearDamping(0.2);
            mesh.physicsBody.setAngularDamping(0.9);
        }
        // camera追跡用の情報
        mesh._mid = mid++;
        mesh._check = false; // 動いた時の確認用
        geoHash.add(mesh._mid, mesh.position);
        mid2mesh[mesh._mid] = mesh;
        return mesh;
    }
    let crBlock3 = function(p, rad=0, isSafe=false) {
        // 横に寝たように配置 (奥行を最長)
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sd, height:sw, depth:sh}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y+sw_, p.z); // 位置の変更する場所が重要!!!!!!!位置を変更して物理にしないと稀におかしなことに
        if (rad != 0) {
            mesh.rotation.y = rad;
        }
        let opt = {mass:block3mass, startAsleep:true};
        if (isSafe) {
            opt = {mass:block3mass, startAsleep:true, friction:0.7, restitution:0, };
        }
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
        mesh.physicsBody.disablePreStep = false;
        if (isSafe) {
            mesh.physicsBody.setLinearDamping(0.2);
            mesh.physicsBody.setAngularDamping(0.9);
        }
        // camera追跡用の情報
        mesh._mid = mid++;
        mesh._check = false; // 動いた時の確認用
        geoHash.add(mesh._mid, mesh.position);
        mid2mesh[mesh._mid] = mesh;
        return mesh;
    }

    let basesw=sw+0.1, basesh=0.1, basesd=sd+0.2;
    let basesw_=basesw/2, basesh_=basesh/2, basesd_=basesd/2;
    let crBase = function(p, rad=0) {
        // 基礎 / 空中に配置するための足場
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:basesw, height:basesh, depth:basesd}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y-basesh_, p.z);
        if (rad != 0) {
            mesh.rotation.y = rad;
        }
        mesh.material = new BABYLON.StandardMaterial("mat");
        mesh.material.emissiveColor = BABYLON.Color3.Black();
        mesh.material.alpha = 0.4;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass:0}, scene);
        mesh.physicsBody.disablePreStep = false;
        return mesh;
    }

    let mesh0 = null;

    if (1) {
        let grndW=300, grndH=300;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
    }

    let mat0 = new BABYLON.StandardMaterial("");
    mat0.emissiveColor = BABYLON.Color3.White();
    mat0.alpha = 0.3;

    let mat1 = new BABYLON.StandardMaterial("");
    mat1.emissiveColor = BABYLON.Color3.Red();
    mat1.alpha = 0.6;

    // ----------------------------------------------------------------------
    let lastRot=null, lastHeight=null;
    let stageMesh = [];
    let createStage = function(stage) {
console.log("createStage: stage=", stage);
        while (stageMesh.length > 0) {
            let mesh = stageMesh.pop();
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            mesh.dispose();
        }
        mesh0 = null;
        lastRot = null;
        lastHeight = null;

        geoHash.clear();
        mid2mesh = {}, mid = 0;

        let plistlist = []; // 座標の点列で指定
        let unitlist = []; // 個別にユニット指定
        let plist = [];
        if (stage == -1) {
            plist = [new BABYLON.Vector3( 0, 0, 0),
                     new BABYLON.Vector3( 0, 0, 2),
                     new BABYLON.Vector3( 0, 0, 20),
                     new BABYLON.Vector3( 0, 0, 22),
                     new BABYLON.Vector3( 0, 0, 35),
                    ];
            // 右向き
            plist = [new BABYLON.Vector3( 0, 0, 0),
                     new BABYLON.Vector3( 10, 0, 0),
                     ];
            // 左向き
            plist = [new BABYLON.Vector3( 0, 0, 0),
                     new BABYLON.Vector3( -10, 0, 0),
                     ];
            // 後方向き
            plist = [new BABYLON.Vector3( 0, 0, 0),
                     new BABYLON.Vector3( 0, 0, -10),
                     ];
            plistlist.push(plist);

        } if (stage == 0) {
            // 長距離
            plist = [new BABYLON.Vector3( 0, 0, 0),
                     new BABYLON.Vector3( 0, 0, 90),
                     new BABYLON.Vector3(90, 0, 90),
                     new BABYLON.Vector3(10, 0,  0),
                     new BABYLON.Vector3(90, 0,-70),
                     new BABYLON.Vector3(80, 0,-80),
                     new BABYLON.Vector3(50, 0,-60),
                     new BABYLON.Vector3( 0, 0,-30),
                     new BABYLON.Vector3(-20, 0,-20),
                     new BABYLON.Vector3(-70, 0,70),
                     new BABYLON.Vector3(-80, 0,50),
                     new BABYLON.Vector3(-50, 0,-90),
                     new BABYLON.Vector3(  0, 0,-50),
                     ];
            plistlist.push(plist);



        } if (stage == 1) {
            //     _-_
            //    /   )
            //   / _-~
            //   |/
            //   |
            //  /|
            //   |
            // 凸凹
            plist = [new BABYLON.Vector3( 0, 0, 0),
                     new BABYLON.Vector3( 0, 0, 10),
                     new BABYLON.Vector3( 0, 2, 20),
                     new BABYLON.Vector3( 0, 2, 30),
                     new BABYLON.Vector3( 0, 0, 40),
                     new BABYLON.Vector3( 3, 0, 47),
                     new BABYLON.Vector3(10, 0, 50),
                     new BABYLON.Vector3(17, 0, 47),
                     new BABYLON.Vector3(20, 0, 40),
                     new BABYLON.Vector3(17, 0, 33),
                     new BABYLON.Vector3(10, 0, 30),
                     new BABYLON.Vector3( 0, 0, 25),
                     new BABYLON.Vector3(-5, 0, 10),
                     new BABYLON.Vector3(-5, 0, 0),
                    ];
            plistlist.push(plist);

        } else if (stage == 2) {
            plist = [new BABYLON.Vector3( 0, 1, 0),
                     new BABYLON.Vector3( 0, 1, 10),
                     new BABYLON.Vector3( 0, 3, 20),
                     new BABYLON.Vector3( 0, 3, 30),
                     new BABYLON.Vector3( 0, 1, 40),
                     new BABYLON.Vector3( 3, 1, 47),
                     new BABYLON.Vector3(10, 2, 50),
                     new BABYLON.Vector3(17, 1, 47),
                     new BABYLON.Vector3(20, 0, 40),
                     new BABYLON.Vector3(17, 1, 33),
                     new BABYLON.Vector3(10, 1, 30),
                     new BABYLON.Vector3( 0, 1, 20),
                     new BABYLON.Vector3(-10, 1, 10),
                    ];
            plistlist.push(plist);

        } else if (stage == 3) {
            // 曲線
            // ---+
            //    |
            // +--+
            // |
            plist = [new BABYLON.Vector3( 0, 0, 0),
                     new BABYLON.Vector3( 0, 0, 10),
                     new BABYLON.Vector3( 3, 0, 17),
                     new BABYLON.Vector3(10, 0, 20),
                     new BABYLON.Vector3(20, 0, 20),
                     new BABYLON.Vector3(27, 0, 23),
                     new BABYLON.Vector3(30, 0, 30),
                     new BABYLON.Vector3(27, 0, 37),
                     new BABYLON.Vector3(20, 0, 40),
                     new BABYLON.Vector3(10, 0, 40),
                     new BABYLON.Vector3( 0, 0, 40),
                    ];
            plistlist.push(plist);

        } else if (stage == 4) {
            //      +------+
            //     |      |
            // +--+   +---+
            // |      |
            //     +--+
            //     |
            plist = [new BABYLON.Vector3( 0, 0, 0),
                     new BABYLON.Vector3( 0, 0, 10),
                     new BABYLON.Vector3(10, 0, 10),
                     new BABYLON.Vector3(10, 0, 20),
                     new BABYLON.Vector3(20, 0, 20),
                     new BABYLON.Vector3(20, 0, 30),
                     new BABYLON.Vector3( 0, 0, 30),
                     new BABYLON.Vector3( 0, 0, 20),
                     new BABYLON.Vector3(-10, 0, 20),
                     new BABYLON.Vector3(-10, 0, 10),
                    ];
            plistlist.push(plist);

        } else if (stage == 5) {
            //ヘアピン
            // ++ 
            // || |
            // | ||
            // | ++
            plist = [new BABYLON.Vector3( 0, 0, 0),
                     new BABYLON.Vector3( 0, 0, 10),
                     new BABYLON.Vector3( 0, 0, 20),
                     new BABYLON.Vector3( 2, 0, 20),
                     new BABYLON.Vector3( 2, 0, 10),
                     new BABYLON.Vector3(10, 0,  0),
                     new BABYLON.Vector3(12, 0,  0),
                     new BABYLON.Vector3(10, 0, 10),
                     ];
            plistlist.push(plist);

        } if (stage == 6) {
            // ループ橋、スパイラルで上昇
            // +--+  +--+ 
            // |  |  |  |
            // +--------+
            //    |  |
            plist = [new BABYLON.Vector3( 0, 0, 0),
                     new BABYLON.Vector3( 0, 1, 10),
                     new BABYLON.Vector3( 5, 2, 10),
                     new BABYLON.Vector3( 5, 3,  5),
                     new BABYLON.Vector3( 0, 4,  5),
                     new BABYLON.Vector3( 0, 5, 10),
                     new BABYLON.Vector3( 5, 6, 10),
                     new BABYLON.Vector3( 5, 7,  5),
                     new BABYLON.Vector3( 0, 8,  5),
                     new BABYLON.Vector3(-10, 8,  5),
                     new BABYLON.Vector3(-15, 7,  5),
                     new BABYLON.Vector3(-15, 6, 10),
                     new BABYLON.Vector3(-10, 5, 10),
                     new BABYLON.Vector3(-10, 4,  5),
                     new BABYLON.Vector3(-15, 3,  5),
                     new BABYLON.Vector3(-15, 2, 10),
                     new BABYLON.Vector3(-10, 1, 10),
                     new BABYLON.Vector3(-10, 0,  5),
                     new BABYLON.Vector3(-10, 0,  0),
                     ];
            plistlist.push(plist);

        } if (stage == 7) {
            // コ
            // +---+
            // |   |
            // |   |
            plist = [new BABYLON.Vector3( 0, 0, 0),
                     new BABYLON.Vector3( 0, 0, 10),
                     new BABYLON.Vector3( 0, 0, 20-sh_),
                     ];
            plistlist.push(plist);

            plist = [new BABYLON.Vector3( 5, 0, 0),
                     new BABYLON.Vector3( 5, 0, 10),
                     new BABYLON.Vector3( 5, 0, 20),
                     ];
            plistlist.push(plist);

            plist = [new BABYLON.Vector3( sh_, 0, 20),
                     new BABYLON.Vector3( 5, 0, 20),
                     ];
            plistlist.push(plist);
            unitlist = [
                {uid:1, p:[sh_/2, 0, 20], r:R45, mat:mat1},
                {uid:1, p:[5, 0, 20-sh_/2], r:-R45, mat:mat1},
            ];


        } if (stage == 101) {
            // _011_world_map.png
            let adjx=-500, adjz=-500, scale=0.2;
            let datalist = [
[[438,309],[406,319],[395,333],[403,345],[420,325],[421,317]],
[[422,307],[423,284],[398,296],[376,295],[379,327],[358,350],[351,392],[343,416],[349,432],[378,446],[384,463],[382,473],[365,487],[352,508],[360,542],[380,551],[404,546],[423,552],[443,568],[468,562],[485,538],[481,510],[448,472],[416,490],[391,476]],
[[374,472],[345,464],[325,448],[328,418],[320,391],[317,372],[304,347],[289,376],[272,402],[259,378],[246,347],[218,329],[221,351],[206,366],[186,350],[180,333],[159,329],[156,351],[175,369],[197,386],[195,406],[180,423],[176,450],[164,495],[132,534],[105,531],[97,501],[103,439],[90,394],[50,377],[32,355],[45,324],[77,302],[108,304],[130,317],[152,316],[158,305],[151,294],[164,285],[177,282],[175,271],[167,264],[149,273],[135,285],[126,275],[118,264],[98,265],[79,274],[61,275],[58,264],[71,255],[72,232],[86,231],[117,212],[135,199],[135,178]],
[[131,178],[123,189],[107,195],[94,193],[100,180],[117,163],[149,146],[167,147],[175,164],[184,178],[208,183],[238,171],[266,151],[319,135],[395,140],[476,155],[526,180],[565,205],[601,215],[638,229],[659,261],[669,296],[668,338],[676,369],[704,395],[727,406],[742,411],[764,410],[797,411],[826,444],[857,464],[873,489],[859,518],[833,538],[806,555],[785,575],[775,597],[770,627],[755,648],[738,623],[736,578],[745,546],[757,515],[754,490],[743,467],[742,432],[743,415]],
[[744,407],[744,400],[728,380],[717,359],[731,347],[752,355],[769,360],[773,333],[782,310],[801,296],[811,277],[837,271],[845,255],[836,234],[806,228],[781,245],[762,252],[750,235],[748,211],[763,193],[789,197],[817,209],[818,188],[809,170],[810,151],[829,144],[842,162],[847,192],[863,214],[898,213],[923,191],[938,163],[956,138],[933,123],[846,103],[784,99],[762,107],[753,130],[729,125],[709,123],[702,136],[721,148],[724,173],[687,181],[642,162],[615,153],[580,167],[560,191],[555,195]],
[[547,200],[542,203],[528,209],[499,217],[474,235],[473,221],[480,208],[449,212],[428,222],[423,236],[436,249],[450,265],[453,280],[440,293],[432,283],[438,276],[452,298],[454,317]]
            ];
            for (let data of datalist) {
                plist = [];
                for (let d of data) {
                    d[0] =  -(d[0]+adjx)*scale;
                    d[1] =  (d[1]+adjz)*scale;
                    plist.push(new BABYLON.Vector3(d[0], 0, d[1]))
                }
                plistlist.push(plist);
            }
            unitlist = [
                // 日本の交差
                {uid:1, p:[-(421+adjx)*scale, 0, (316+adjz)*scale], r:0, mat:mat1},
                {uid:1, p:[-(421+adjx)*scale, 0, (311+adjz)*scale], r:0, mat:mat1},
                {uid:1, p:[-(421+adjx)*scale, sh, (316+adjz)*scale], r:0, mat:mat1},
                {uid:1, p:[-(421+adjx)*scale, sh, (311+adjz)*scale], r:0, mat:mat1},
                {uid:2, p:[-(421+adjx)*scale, sh*2, (313.5+adjz)*scale], r:R30, mat:mat1},
                // オーストラリア・インドシナ半島の交差
                {uid:1, p:[-(388.5+adjx)*scale, 0, (476+adjz)*scale], r:-R60, mat:mat1},
                {uid:1, p:[-(386.5+adjx)*scale, 0, (476+adjz)*scale], r:-R60, mat:mat1},
                {uid:3, p:[-(385+adjx)*scale, 0, (476+adjz)*scale], r:R30, mat:mat1},
                {uid:1, p:[-(385+adjx)*scale, sw, (476+adjz)*scale], r:-R60, mat:mat1},

                {uid:1, p:[-(383+adjx)*scale, 0, (476+adjz)*scale], r:-R60, mat:mat1},
                {uid:1, p:[-(383+adjx)*scale, sh, (476+adjz)*scale], r:-R60, mat:mat1},
                {uid:1, p:[-(379+adjx)*scale, 0, (473+adjz)*scale], r:-R60, mat:mat1},
                {uid:1, p:[-(379+adjx)*scale, sh, (473+adjz)*scale], r:-R60, mat:mat1},
                {uid:2, p:[-(381+adjx)*scale, sh*2, (474.5+adjz)*scale], r:-R60, mat:mat1},
                {uid:1, p:[-(377+adjx)*scale, 0, (472+adjz)*scale], r:-R60, mat:mat1},
                // イラン付近のヘアピン
                {uid:2, p:[-(218+adjx)*scale, sh, (329+adjz)*scale], r:R30, mat:mat1},
                {uid:2, p:[-(218+adjx)*scale, sh+sd, (331+adjz)*scale], r:R30, mat:mat1},
                // 135,178
                // ノルウェー付近のヘアピン
                // pattern-2
                {uid:3, p:[-(133.5+adjx)*scale, 0, (176.5+adjz)*scale], r:R15, mat:mat1},
                {uid:3, p:[-(133.5+adjx)*scale, sw, (176.5+adjz)*scale], r:-R60-R15, mat:mat1},
                {uid:1, p:[-(133.8+adjx)*scale, 0, (174.7+adjz)*scale], r:-R60-R15, mat:mat1},
                {uid:1, p:[-(132.8+adjx)*scale, 0, (174.4+adjz)*scale], r:-R60-R15, mat:mat1},
                {uid:1, p:[-(131.8+adjx)*scale, 0, (174.1+adjz)*scale], r:-R60-R15, mat:mat1},
                {uid:1, p:[-(131+adjx)*scale, 0, (176.5+adjz)*scale], r:R30, mat:mat1},
                // パナマ運河
                // 743,415
                // 744,407
                {uid:1, p:[-(743.5+adjx)*scale, 0, (414+adjz)*scale], r:0, mat:mat1},
                {uid:1, p:[-(743.5+adjx)*scale, 0, (409+adjz)*scale], r:0, mat:mat1},
                {uid:1, p:[-(743.5+adjx)*scale, sh, (414+adjz)*scale], r:0, mat:mat1},
                {uid:1, p:[-(743.5+adjx)*scale, sh, (409+adjz)*scale], r:0, mat:mat1},
                {uid:2, p:[-(743.5+adjx)*scale, sh*2, (411.5+adjz)*scale], r:0, mat:mat1},
                //カナダ・ロシア
                // [555,195]
                // [547,200]
                {uid:1, p:[-(554+adjx)*scale, 0, (196+adjz)*scale], r:R45, mat:mat1},
                {uid:1, p:[-(554+adjx)*scale, sh, (196+adjz)*scale], r:R45, mat:mat1},
                {uid:1, p:[-(551+adjx)*scale, 0, (199.5+adjz)*scale], r:R45, mat:mat1},
                {uid:1, p:[-(551+adjx)*scale, sh, (199.5+adjz)*scale], r:R45, mat:mat1},
                {uid:1, p:[-(549+adjx)*scale, 0, (200+adjz)*scale], r:R45, mat:mat1},

                {uid:2, p:[-(552.5+adjx)*scale, sh*2, (197.8+adjz)*scale], r:R60, mat:mat1},
            ];
            lastRot = 0;
            lastHeight = 300;

        } if (stage == 102) {
            // _014_hand.png
            let adjx=-500, adjz=-500, scale=0.1;
            let datalist = [
                [[766,1076],[715,1045],[671,1012],[630,976],[584,932],[565,941],[542,950],[515,930],[495,908],[508,874],[449,861],[390,839],[379,845],[342,840],[285,812],[245,787],[197,748],[199,724],[211,695],[225,672],[291,708],[352,735],[407,757],[401,788],[383,819],[402,826],[421,790],[436,748],[456,725],[466,698],[468,661],[414,636],[345,607],[259,549],[238,578],[225,608],[215,654],[200,644],[206,610],[222,571],[244,535]],
                [[233,525],[249,486],[271,450],[302,415],[360,447],[405,476],[456,510],[500,549],[477,589],[455,628],[467,637],[489,605],[508,572],[523,544],[471,499],[412,459],[357,426],[293,399],[243,365],[177,302],[124,244],[67,175],[104,125],[143,87],[191,55],[257,106],[315,161],[393,242],[470,327],[512,378],[540,422],[538,455],[545,505],[557,553],[578,604],[599,642],[618,667],[633,679],[641,667],[610,619],[590,575],[570,521],[555,440],[559,380],[576,316],[604,249],[645,175],[686,120],[719,111],[767,126],[818,165],[852,204],[862,226],[847,261],[820,303],[774,366],[701,454],[714,507],[718,575],[713,633],[703,682],[688,690],[691,705],[742,686],[761,709],[773,730],[742,776],[704,825],[666,866],[612,915],[630,938],[684,889],[727,837],[758,791],[799,825],[833,853],[879,893],[915,924]],
            ];
            for (let data of datalist) {
                plist = [];
                for (let d of data) {
                    d[0] =  -(d[0]+adjx)*scale;
                    d[1] =  (d[1]+adjz)*scale;
                    plist.push(new BABYLON.Vector3(d[0], 0, d[1]))
                }
                plistlist.push(plist);
            }
            unitlist = [
                {uid:1, p:[-(242+adjx)*scale, 0, (533+adjz)*scale], r:0, mat:mat1},
                {uid:1, p:[-(240+adjx)*scale, 0, (530+adjz)*scale], r:-R45, mat:mat1},
                {uid:1, p:[-(236+adjx)*scale, 0, (528+adjz)*scale], r:-R30, mat:mat1},
            ];
            lastRot = 0;
            lastHeight = 200;

        } else {
            console.log("stage=", stage);
        }

        for (let plist of plistlist) {
            // 点列plist を補間、スムージング
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 10, false);//open
            const plist2 = catmullRom.getPoints();
            // 曲線情報path3dを作成
            let path3d = new BABYLON.Path3D(plist2);
console.log("plist2.len=", plist2.length);
console.log("len=", path3d.length());
            {
                // plist のデバッグ表示
                let mesh = BABYLON.CreateGreasedLine(
                    "", {points:plist2,
                         widths:[4],
                         widthDistribution:BABYLON.GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_REPEAT,
                        }, {color:BABYLON.Color3.Red(),}, scene);
                stageMesh.push(mesh);
            }
            
            // getClosestPositionTo() で等幅で移動した先の近傍点を取得しながら設置していく方法
            let r = 0, d=sh_, p1, p2, r2;
            let rstep = 1/plist2.length/4;
            const vN = BABYLON.Vector3.Up();
            let rrad;
            // r=0の方向
            let vdir, _idebug=0, _ndebug = Math.floor(path3d.length/d);
            while (r < 1) {
                if (++_idebug > _ndebug) {break;}
                p1 = path3d.getPointAt(r);
                vdir = path3d.getTangentAt(r);
                p1.y = Math.max(p1.y, 0);
                // 方向ベクトルの方位角
                rrad = Math.atan2(vdir.x, vdir.z);
                if (p1.y > 0) {
                    // ブロック下の基礎
                    let meshb = crBase(p1, rrad);
                    stageMesh.push(meshb);
                }
                // ブロック
                let mesh = crBlock(p1, rrad);
                stageMesh.push(mesh);
                if (mesh0 == null) { mesh0 = mesh; mesh0._vdir=vdir; }
                // rを移動
                p2 = p1.add(vdir.scale(d));
                r2 = path3d.getClosestPositionTo(p2);
                if (r < r2 ) {
                    r = r2
                } else {
                    // 万が一、逆に進む場合はそこでstop
                    // lineが交差/接近していたときに、設置済みの経路に飛び移ってしまう対策
console.log("(break) r=", r );
                    break;
                }
            }
console.log("last p=", p1.x.toFixed(3), p1.y.toFixed(3), p1.z.toFixed(3), ", rrad=", rrad.toFixed(3) );
        }

        for (let uinfo of unitlist) {
            if (uinfo.uid == 1) {
                let p = BABYLON.Vector3.FromArray(uinfo.p);
                let rrad = uinfo.r;
                let mesh = crBlock(p, rrad);
                stageMesh.push(mesh);
                if (typeof(uinfo.mat) !== 'undefined') {
                    mesh.material = uinfo.mat;
                }
            } else if (uinfo.uid == 2) {
                let p = BABYLON.Vector3.FromArray(uinfo.p);
                let rrad = uinfo.r;
                let mesh = crBlock2(p, rrad);
                stageMesh.push(mesh);
                if (typeof(uinfo.mat) !== 'undefined') {
                    mesh.material = uinfo.mat;
                }
            } else if (uinfo.uid == 3) {
                let p = BABYLON.Vector3.FromArray(uinfo.p);
                let rrad = uinfo.r;
                let mesh = crBlock3(p, rrad);
                stageMesh.push(mesh);
                if (typeof(uinfo.mat) !== 'undefined') {
                    mesh.material = uinfo.mat;
                }
            }
        }

        if (camera != null && camera.lockedTarget != null) {
            if (camera.position.y > 20) {
                camera.position.copyFrom(mesh0.position);
            }
            camera.heightOffset = 1;
            camera._vtrg.copyFrom(mesh0.position);
        }
    } // createStage

    createStage(stage);

    // デバッグ表示(debug)
    if (0) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }

    // camera2用の処理
    scene.onBeforeRenderObservable.add(() => {
        if (camera.lockedTarget == null) { return;}
        // メッシュが倒れだした位置(camera._ctrg) の位置を geoHash を使ってで更新する
        let midlist = geoHash.query(camera._vtrg);
        let anyCheck = false;
        for (let mid of midlist) {
            let mesh = mid2mesh[mid];
            if (mesh._check) {continue;}
            anyCheck = true;
            if (mesh.physicsBody.getAngularVelocity().lengthSquared() > 1) {
                mesh._check = true;
                // camera.lockedTarget = mesh;
                camera._vtrg.copyFrom(mesh.position);
                // camera._vtrg.y = Math.round(camera._vtrg.y); // 小さいと効果なし
                camera._vtrg.y = Math.round(camera._vtrg.y/sd)*sd;
                // camera._vtrg.y = Math.round(camera._vtrg.y/sh_)*sh_; // 幅が大きいと逆にガタガタに
            } else if (mesh.position.y < sh_) {
                // 倒壊済み
                mesh._check = true;
            }
        }
        if (anyCheck == false) {
            // 倒れたメッシュがない＝終わった／途中で崩れた箇所に遭遇
            // .. 上空に上昇する
            camera.heightOffset += 1;
            camera._vtrg.copyFrom(BABYLON.Vector3.Zero());
        }

        // カメラのターゲットメッシュの位置を _vtrg に近づける
        let vec = camera._vtrg.subtract(camera.lockedTarget.position);
        if (vec.lengthSquared() > 1) {
            vec = vec.normalize();
            // camera.lockedTarget.position.addInPlace(vec.scale(0.3)); // 速いとメッシュの倒壊に反応してガクガクしてしまう
            camera.lockedTarget.position.addInPlace(vec.scale(0.18)); // やや遅れて座標を反映することで滑らかに。
            // camera.lockedTarget.position.addInPlace(vec.scale(0.1)); // 遅すぎるとメッシュの追跡が途切れる
        }

        // rotationOffset を変化させることで ArcRotateCamera のように
        if (camera.heightOffset < 100) {
            camera.rotationOffset += 1;
        } else {
            if (lastRot != null) {
                camera.rotationOffset = lastRot;
            }
            if (lastHeight != null) {
                camera.heightOffset = lastHeight;
            } else {
                camera.heightOffset = 180;
            }
        }
        if (camera.rotationOffset >= 360) {
            camera.rotationOffset = 0;
        }
    });

    // キー入力処理
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ') {
                let p = mesh0.absolutePosition.add(new BABYLON.Vector3(0, sh/2, 0));
                // let vvec = BABYLON.Vector3.Forward().scale(pushF);
                let vvec = mesh0._vdir.scale(pushF);
                mesh0._agg.body.applyImpulse(vvec, p);
            }
            if (kbInfo.event.key == 'Enter') {
                createStage(stage);
            }
            if (kbInfo.event.key == 'n' || kbInfo.event.key == 'b') {
                let i = stageList.indexOf(stage);
                console.assert(i >= -1);
                if (kbInfo.event.key == 'n') {
                    i = (i+1) % stageList.length;
                } else {
                    i = (i-1+stageList.length) % stageList.length;
                }
                stage=stageList[i];
                createStage(stage);
            }
        }
    });

    return scene;
} 

// フリーライン
export var createScene = createScene_test_74; // カメラdraft : follow / ならし / geohash


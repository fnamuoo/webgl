//  Babylon.js で物理演算(Havok)：崩壊ステージを走り抜ける
//
// キー操作
//   カーソル上／下 .. 前進／後進
//   カーソル左／右 .. 方向転換（左回転／右回転）
//   [space)        .. ジャンプ
//   r              .. プレイヤーの位置をスタート位置に戻す
//   enter          .. ステージを最初からやり直す
//   n/b            .. ステージの切り替え
//   1/2/3          .. プレイヤー周辺に力場を発生（ブロックを吹っ飛ばす）

// const goalPath ="textures/checker.jpg";
// const skyboxTextPath = "textures/TropicalSunnyDay";

const pathRoot = "../";
// // const pathRoot = "https://raw.githubusercontent.com/fnamuoo/webgl/main/";
const goalPath = pathRoot + "123/textures/checker.jpg";
const skyboxTextPath = pathRoot + "111/textures/TropicalSunnyDay";

export var createScene_test_104 = async function () {

    let R15 = Math.PI/12;
    let R20 = Math.PI/9;
    let R30 = Math.PI/6;
    let R45 = Math.PI/4;
    let R60 = Math.PI/3;
    let R90 = Math.PI/2;
    let R120 = Math.PI*2/3;
    const R180 = Math.PI;
    let R270 = Math.PI*3/2;

    const scene = new BABYLON.Scene(engine);
    let camera=null, cameraTrgMesh=null;
    let crCamera3 = function() {
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 3; // 1.3;
        _camera.heightOffset = 0.5; // 0.0;
        _camera.cameraAcceleration = 0.05; // 0.3;
        _camera.maxCameraSpeed = 30;
        return _camera;
    }
    camera = crCamera3();

    let icamera=0, ncamera=4;
    let setCAM3 = function(icamera) {
        if (icamera == 0) {
            // 後ろから追っかける（バードビュー
            camera.radius = 3;
            camera.heightOffset = 0.5; // 1.1;
            camera.cameraAcceleration = 0.05; // 0.1;
            camera.maxCameraSpeed = 5; // 30;
        } else if (icamera == 1) {
            // ちょい遅れて／離れて追っかける（バードビュー遠方
            camera.radius = 20;
            camera.heightOffset = 3; // 8;
            camera.cameraAcceleration = 0.02; // 0.005;
            camera.maxCameraSpeed = 5; // 30;
        } else if (icamera == 2) {
            // 上空（トップビュー
            camera.radius = 1;
            camera.heightOffset = 30;
            camera.cameraAcceleration = 0.5;
            camera.maxCameraSpeed = 100;
        } else if (icamera == 3) {
            // 正面（フロントビュー／ドライバーズビュー
            camera.radius = 0.5; // 1.3;
            camera.heightOffset = -0.05; // 0;
            camera.cameraAcceleration = 0.5; // 0.3;
            camera.maxCameraSpeed = 100;
        }
    }
    let changeCAM3 = function(_icamera) {
        icamera = (_icamera+1) % ncamera;
        setCAM3(icamera);
    }
    setCAM3(icamera);

    const light = new BABYLON.HemisphericLight("", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);

    let g = 0.98;
    scene.enablePhysics(new BABYLON.Vector3(0, -g, 0), hk);

    let sw=2, sh=6.0, sd=0.10, mass = 0.02;
    let sw_=sw/2, sh_=sh/2, sd_=sd/2;


    let block1mass = mass, block2mass = mass*10000, block3mass = mass;

    // camera追跡用の情報
    let mid2mesh = {}, mid = 0;


    let crGround2 = function(p) {
        // 平面 / セーフティ・エリア／浮島
        let grndW=6, grndH=6;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.position.copyFrom(p);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
        return mesh;
    }
    let crGround3 = function(p, sw, sh) {
        // 壁（側面）の床
        // let grndW=6, grndH=6;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:sw, height:sh }, scene);
        mesh.material = new BABYLON.StandardMaterial("mat");
        // mesh.material.emissiveColor = BABYLON.Color3.Blue();
        mesh.material.diffuseColor = BABYLON.Color3.Green();
        mesh.material.alpha = 0.2;
        mesh.position.copyFrom(p);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
        return mesh;
    }

    let crGoal = function(p, sw=4, sh=3, sd=4) {
        // ゴールのメッシュ
        let mesh = BABYLON.MeshBuilder.CreateBox("", { width:sw, height:sh, depth:sd }, scene);
        mesh.material = new BABYLON.StandardMaterial("mat");
        mesh.material.diffuseTexture = new BABYLON.Texture(goalPath, scene);
        // mesh.material.diffuseTexture.alpha = 0.5;
        mesh.material.diffuseTexture.uScale = 2;
        mesh.material.diffuseTexture.vScale = 2;
        // mesh.material.diffuseColor = BABYLON.Color3.Green();
        mesh.material.alpha = 0.2;
        mesh.position.copyFrom(p);
        mesh.position.y += sh/2;
        // mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
        return mesh;
    }

    let crBlock00 = function(p, rad=0, isSafe=false) {
        // ++
        // ++
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sd, height:sd, depth:sd}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y+sd_, p.z); // 位置の変更する場所が重要!!!!!!!位置を変更して物理にしないと稀におかしなことに
        if (rad != 0) {
            mesh.rotation.y = rad;
        }
        let opt = {mass:0, startAsleep:true};
        if (isSafe) {
            opt = {mass:0, startAsleep:true, friction:1, restitution:0, };
        }
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
        mesh.physicsBody.disablePreStep = false;
        if (isSafe) {
            mesh.physicsBody.setLinearDamping(0.2);
            mesh.physicsBody.setAngularDamping(0.9);
        }
        return mesh;
    }
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
        return mesh;
    }
    let crBlock1 = function(p, rad=0, isSafe=false) {
        return crBlock(p, rad, isSafe);
    }
    let crBlock01 = function(p, rad=0, isSafe=false) {
        //  +----+
        // +----+|
        // |    ||
        // |    ||
        // |    |/
        // +----+
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sh, depth:sd}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y+sh_, p.z); // 位置の変更する場所が重要!!!!!!!位置を変更して物理にしないと稀におかしなことに
        if (rad != 0) {
            mesh.rotation.y = rad;
        }
        let opt = {mass:0, startAsleep:true};
        if (isSafe) {
            opt = {mass:0, startAsleep:true, friction:1, restitution:0, };
        }
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
        mesh.physicsBody.disablePreStep = false;
        if (isSafe) {
            mesh.physicsBody.setLinearDamping(0.2);
            mesh.physicsBody.setAngularDamping(0.9);
        }
        return mesh;
    }

    let crBlock2 = function(p, rad=0, isSafe=false) {
        // 寝かせて配置 (奥行を最長)
        //    +----+
        //   /    /|
        //  /    //
        // +----+/
        // +----+
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
        // // camera追跡用の情報
        // mesh._mid = mid++;
        // mesh._check = false; // 動いた時の確認用
        return mesh;
    }
    let crBlock02 = function(p, rad=0, isSafe=false) {
        // 固定ブロック：寝かせて配置 (奥行を最長)
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sd, depth:sh}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y+sd_, p.z); // 位置の変更する場所が重要!!!!!!!位置を変更して物理にしないと稀におかしなことに
        if (rad != 0) {
            mesh.rotation.y = rad;
        }
        let opt = {mass:0, startAsleep:true};
        if (isSafe) {
            opt = {mass:0, startAsleep:true, friction:1, restitution:0, };
        }
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
        mesh.physicsBody.disablePreStep = false;
        if (isSafe) {
            mesh.physicsBody.setLinearDamping(0.2);
            mesh.physicsBody.setAngularDamping(0.9);
        }
        return mesh;
    }

    let crBlock3 = function(p, rad=0, isSafe=false) {
        // 横に寝たように配置 (奥行を最長)
        //     +-+
        //    / /|
        //   / / |
        //  / /  |
        // +-+  /
        // | | /
        // | |/
        // +-+
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
        return mesh;
    }
    let crBlock03 = function(p, rad=0, isSafe=false) {
        // 横に寝たように配置 (奥行を最長)
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sd, height:sw, depth:sh}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y+sw_, p.z); // 位置の変更する場所が重要!!!!!!!位置を変更して物理にしないと稀におかしなことに
        if (rad != 0) {
            mesh.rotation.y = rad;
        }
        let opt = {mass:0, startAsleep:true};
        if (isSafe) {
            opt = {mass:0, startAsleep:true, friction:0.7, restitution:0, };
        }
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
        mesh.physicsBody.disablePreStep = false;
        if (isSafe) {
            mesh.physicsBody.setLinearDamping(0.2);
            mesh.physicsBody.setAngularDamping(0.9);
        }
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
    let pStart = new BABYLON.Vector3(0, 10, 0);
    let meshGoal = null;
    let checkMesh = [];
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
        meshGoal = null;
        checkMesh = [];

        sw=2, sh=6.0, sd=0.10, sw_=sw/2, sh_=sh/2, sd_=sd/2;

        if (stage == 1002) {
            // 空中に浮かせた板
            let adjy = 1;
            let p = new BABYLON.Vector3(0, adjy, 0), mesh, sw11=sw*1.1, sw11_=sw11/2, padY=1, padGrnd=3;
            let timerIni = 150, iz0=0, tstep=15, tstep2=50;
            let dirLoopList = [
                ["z+", 10],
                ["x+", 20],
                ["z-", 30],
                ["x-", 40],
                ["z+", 20],
                ["z+", 30],
                ["x+", 30],
                ["x+", 30],
                ["z-", 30],
                ["z-", 40],
                ["x-", 40],
                ["x-", 40],
            ];
            mesh = crGround2(p);
            stageMesh.push(mesh);
            pStart = new BABYLON.Vector3(p.x, p.y+ 10, p.z);
            for (let [dir,nloop] of dirLoopList) {
                if (dir == "x+") {
                    p.x += padGrnd-sw11_;
                    for (let ix = 0; ix < nloop; ++ix) {
                        p.x += sw11;
                        mesh = crBlock2(p);
                        mesh.material = mat1;
                        stageMesh.push(mesh);
                        mesh._timer = timerIni + (iz0+ix)*tstep;
                        mesh._act = "force";
                        checkMesh.push(mesh);
                    }
                    p.x += padGrnd+sw11_;
                    iz0 += nloop + tstep2;
                }
                if (dir == "x-") {
                    p.x += -padGrnd+sw11_;
                    for (let ix = 0; ix < nloop; ++ix) {
                        p.x -= sw11;
                        mesh = crBlock2(p);
                        mesh.material = mat1;
                        stageMesh.push(mesh);
                        mesh._timer = timerIni + (iz0+ix)*tstep;
                        mesh._act = "force";
                        checkMesh.push(mesh);
                    }
                    p.x += -padGrnd-sw11_;
                    iz0 += nloop + tstep2;
                }
                if (dir == "z+") {
                    p.z += padGrnd-sw11_;
                    for (let iz = 0; iz< nloop; ++iz) {
                        p.z += sw11;
                        mesh = crBlock2(p, R90);
                        mesh.material = mat1;
                        stageMesh.push(mesh);
                        mesh._timer = timerIni + (iz0+iz)*tstep;
                        mesh._act = "force";
                        checkMesh.push(mesh);
                    }
                    p.z += padGrnd+sw11_;
                    iz0 += nloop + tstep2;
                }
                if (dir == "z-") {
                    p.z += -padGrnd+sw11_;
                    for (let iz = 0; iz< nloop; ++iz) {
                        p.z -= sw11;
                        mesh = crBlock2(p, R90);
                        mesh.material = mat1;
                        stageMesh.push(mesh);
                        mesh._timer = timerIni + (iz0+iz)*tstep;
                        mesh._act = "force";
                        checkMesh.push(mesh);
                    }
                    p.z += -padGrnd-sw11_;
                    iz0 += nloop + tstep2;
                }
                mesh = crGround2(p);
                stageMesh.push(mesh);
                p.y += padY;
            }
            p.y -= padY;
            meshGoal = crGoal(p);
            stageMesh.push(meshGoal);

        } if (stage == 1012) {
            // 登り・直線の板
            sw=2, sh=6.0, sd=0.10, mass = 0.02;
            sw_=sw/2, sh_=sh/2, sd_=sd/2;
            let sw2=sw*2;
            block2mass = mass*10000;
            let p = new BABYLON.Vector3(0, 0, 0);
            // 斜めに接続する
            for (let iz = 0; iz < 100; ++iz) {
                p.z = iz*(sw*1.1)+sw2;
                // p.y = iz*0.11;
                p.y = iz*sd*1.1;
                let mesh = crBlock2(p, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                if (iz>0) {
                    // mesh.physicsBody.disablePreStep = true;
                    mesh.rotation = new BABYLON.Vector3(0, R90, -0.050);
                    // mesh.physicsBody.disablePreStep = false;
                }
            }

        } if (stage == 1022) {
            // 登り のらせん （固定）xxx なぜか落ちてくる
            sw=1.2, sh=6.0, sd=0.10, mass = 0.02;
            sw_=sw/2, sh_=sh/2, sd_=sd/2;
            block2mass = mass*10000;
            block2mass = 0; // 固定
            let r = 20, pc = new BABYLON.Vector3(-r, 0, r), nz = 100, radstep=0.06, rad,x, z;
            let v2std = new BABYLON.Vector2(r, 0);
            let p = new BABYLON.Vector3(0, 0, 0);
            for (let iz = 0; iz < 300; ++iz) {
                rad = iz*radstep;
                pc.y = iz*sd*1.1;
                // pc.y = iz*sd*2;
                r *= 0.997;
                v2std = new BABYLON.Vector2(r, 0);
                let v2 = v2std.rotate(rad);
                p = pc.add(new BABYLON.Vector3(v2.x, 0, v2.y));
                // crBlock2(p, -rad+R90);
                let mesh = crBlock2(p, -rad+R90);
                stageMesh.push(mesh);
                if (iz>0) {
                    mesh.rotation = new BABYLON.Vector3(0, -rad+R90, -0.080);
                }
            }

        } if (stage == 1023) {
            // 登り のらせん(ブロック固定)
            sw=1.2, sh=6.0, sd=0.10, mass = 0.02;
            sw_=sw/2, sh_=sh/2, sd_=sd/2;
            block2mass = mass*10000;
            let r = 20, pc = new BABYLON.Vector3(-r, 0, r), radstep=0.06, rad,x, z, adjy=2;
            // let nz = 300;
            let nz = 500, padGrnd=3;
            let v2std = new BABYLON.Vector2(r, 0), mesh;
            let p = new BABYLON.Vector3(0, adjy, 0), p0;
            {
                rad = 0;
                pc.y = -1*sd*1.1;
                v2std = new BABYLON.Vector2(r, 0);
                let v2 = v2std.rotate(rad);
                p = pc.add(new BABYLON.Vector3(v2.x, 0, v2.y-padGrnd));
                crGround2(p);
                p.y = adjy;
            }
            for (let iz = 0; iz < nz; ++iz) {
                rad = iz*radstep;
                pc.y = iz*sd*1.1;
                // pc.y = iz*sd*2;
                r *= 0.997;
                v2std = new BABYLON.Vector2(r, 0);
                let v2 = v2std.rotate(rad);
                p = pc.add(new BABYLON.Vector3(v2.x, 0, v2.y));
                p0 = p.add(new BABYLON.Vector3(0,-0.2,0));
                // crBlock2(p, -rad+R90);
                mesh = crBlock00(p0);
                stageMesh.push(mesh);
                // mesh = crBlock2(p, -rad+R90);
                if ((Math.floor(iz/7)%2) == 0) {
                    mesh = crBlock2(p, -rad+R90);
                    stageMesh.push(mesh);
                    mesh.material = mat1;
                } else {
                    mesh = crBlock02(p, -rad+R90);
                    stageMesh.push(mesh);
                }
                if (iz>0) {
                    mesh.rotation = new BABYLON.Vector3(0, -rad+R90, -0.080);
                }
            }

        } if (stage == 1024) {
            // 登り のらせん(ブロック固定)
            sw=1.2, sh=6.0, sd=0.10, mass = 0.02;
            sw_=sw/2, sh_=sh/2, sd_=sd/2;
            block2mass = mass*10000;
            // let r = 20, pc = new BABYLON.Vector3(-r, 0, r), radstep=0.06, rad,x, z, adjy=2;
            let r = 20, pc = new BABYLON.Vector3(-r, 0, 4), radstep=0.06, rad,x, z, adjy=2;
            // let nz = 300;
            let nz = 500, padGrnd=3;
            let timerIni = 150, iz0=0, tstep=15;
            let v2std = new BABYLON.Vector2(r, 0), mesh;
            let p = new BABYLON.Vector3(0, adjy, 0), p0;
            pStart = new BABYLON.Vector3(p.x, p.y+ 10, p.z);
            {
                rad = 0;
                pc.y = -2*sd*1.1+adjy;
                v2std = new BABYLON.Vector2(r, 0);
                let v2 = v2std.rotate(rad);
                p = pc.add(new BABYLON.Vector3(v2.x, 0, v2.y-padGrnd));
                mesh = crGround2(p);
                stageMesh.push(mesh);
                p.y = adjy;
            }
            for (let iz = 0; iz < nz; ++iz) {
                rad = iz*radstep;
                pc.y = iz*sd*1.1+adjy;
                r *= 0.997;
                v2std = new BABYLON.Vector2(r, 0);
                let v2 = v2std.rotate(rad);
                p = pc.add(new BABYLON.Vector3(v2.x, 0, v2.y));
                p0 = p.add(new BABYLON.Vector3(0,-0.3,0));
                // crBlock2(p, -rad+R90);
                // 板下のblock
                mesh = crBlock00(p0);
                stageMesh.push(mesh);
                // mesh = crBlock2(p, -rad+R90);
                if ((Math.floor(iz/7)%2) == 0) {
                        mesh._timer = timerIni + (iz0+iz)*tstep;
                        mesh._act = "delete";
                        checkMesh.push(mesh);
                    mesh = crBlock2(p, -rad+R90);
                    stageMesh.push(mesh);
                    mesh.material = mat1;
                        mesh._timer = timerIni + (iz0+iz)*tstep;
                        mesh._act = "force";
                        checkMesh.push(mesh);
                } else {
                    // 固定ブロック
                    mesh = crBlock02(p, -rad+R90);
                    stageMesh.push(mesh);
                }
                if (iz>0) {
                    mesh.rotation = new BABYLON.Vector3(0, -rad+R90, -0.080);
                }
            }
            {
                let iz = nz;
                rad = iz*radstep;
                pc.y = iz*sd*1.1+adjy;
                v2std = new BABYLON.Vector2(r, 0);
                let v2 = v2std.rotate(rad);
                pc = pc.add(new BABYLON.Vector3(v2.x, 0, v2.y));
                rad = iz*radstep+R90;
                v2std = new BABYLON.Vector2(padGrnd, 0);
                v2 = v2std.rotate(rad);
                p = pc.add(new BABYLON.Vector3(v2.x, 0, v2.y));
                mesh = crGround2(p);
                stageMesh.push(mesh);
                // goal
                meshGoal = crGoal(p);
                stageMesh.push(meshGoal);
            }

        } if (stage == 1101) {
            // 壁
            sw=1.0, sh=1.0, sd=1.0, mass = 0.02;
            sw_=sw/2, sh_=sh/2, sd_=sd/2;
            let sw11=sw*1.01, sh11=sh*1.01;
            // block1mass = mass*10000;
            let nx=10, ny=20, x, y, z=5, nx_=Math.floor(nx/2);
            let zlist = [5, 25, 45];
            let p = new BABYLON.Vector3(0, 0, z);
            for (let z of zlist) {
                p.z = z;
            for (let iy = 0; iy < ny; ++iy) {
                p.y = iy*sh11;
            for (let ix = -nx_; ix <= nx_; ++ix) {
                p.x = ix*sw11;
                crBlock(p);
                stageMesh.push(mesh);
            }
            }
            }

        } if (stage == 1102) {
            // 壁(裏にブロックあり)
            sw=1.0, sh=1.0, sd=1.0, mass = 0.02;
            sw_=sw/2, sh_=sh/2, sd_=sd/2;
            let sw11=sw*1.01, sh11=sh*1.01, adjy = 4;
            let nx=10, ny=20, x, y, z=5, nx_=Math.floor(nx/2);
            let zlist = [5, 20, 35, 50];
            let p = new BABYLON.Vector3(0, 0, z), mesh;
            {
                // 地面
                let grndW=11, grndH=100;
                let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
                mesh.position.y = adjy;
                mesh.position.z = 40;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
                stageMesh.push(mesh);
            }
            pStart = new BABYLON.Vector3(p.x, p.y+ adjy+ 10, p.z-10);
            // 壁のブロック
            for (let z of zlist) {
                p.z = z;
                for (let iy = 0; iy < ny; ++iy) {
                    p.y = iy*sh11 + adjy;
                    for (let ix = -nx_; ix <= nx_; ++ix) {
                        p.x = ix*sw11;
                        mesh = crBlock(p);
                        stageMesh.push(mesh);
                        mesh.material = mat1;
                    }
                }
            }
            // 壁の裏のブロック（固定）
            for (let z of zlist) {
                p.z = z+1;
                let iy = 0, ny = zlist.indexOf(z);
                for (let iy = 0; iy < ny; ++iy) {
                    p.y = iy*sh11 + adjy;
                    for (let ix = -nx_; ix <= nx_; ++ix) {
                        p.x = ix*sw11;
                        mesh = crBlock01(p);
                        stageMesh.push(mesh);
                    }
                }
            }
            // goal
            p.set(0, adjy, zlist[zlist.length-1]+10);
            meshGoal = crGoal(p);
            stageMesh.push(meshGoal);

        } if (stage == 1114) {
            // 壁（側面）を橋に見立てた、島渡
            sw=0.2, sh=2.0, sd=3.0, mass = 0.02, block2mass = mass*10000;
            sw_=sw/2, sh_=sh/2, sd_=sd/2;
            let nx, ny=13, nz=30, x, y, z=0, sdw=sd-sw, sdw_=sdw/2, sdw2=sdw*2, sh11=sh*1.03, sh11_=sh11/2;
            let adjy=2.5, padGrnd=3, nymin=4, timerIni = 150, iz0=0;
            let p = new BABYLON.Vector3(0, adjy, 0), p0, p1, p2, len, mesh;
            let dirLoopList = [
                ["z+", 10],
                ["x-", 10],
                ["z-", 20],
                ["x-", 10],
                ["z-", 10],
                ["x+", 40],
            ];
            pStart = new BABYLON.Vector3(p.x, p.y+10, p.z);
            mesh = crGround2(p);
            stageMesh.push(mesh);
            for (let [dir,nloop] of dirLoopList) {
                if (dir == "x+") {
                    nx = nloop, ny = Math.min(nloop-1, nymin);
                    p.x += padGrnd;
                    len = sdw2*(nloop);
                    p1 = p.add(new BABYLON.Vector3(0, 0, 0));
                    p2 = p1.add(new BABYLON.Vector3(len, 0, 0));
                    {
                        // p0 = p1.add(new BABYLON.Vector3(0, 0.1, len/2));
                        p0 = p1.add(p2).scale(0.5);
                        p0.y += 0.1;
                        mesh = crGround3(p0, len, sd);
                        stageMesh.push(mesh);
                    }
                    for (let z of [-sdw_,sdw_]) {
                        p.z = p1.z + z;
                        for (let iy = 0; iy < ny; ++iy) {
                            let nxx = nx-iy;
                            p.y = p1.y + sh11*iy;
                            let gapp = Math.pow(1.2, -iy-1);
                            for (let ix = 0; ix < nxx; ++ix) {
                                p.x = p1.x + sdw2*ix+sdw*iy+sd_;
                                mesh = crBlock1(p, R90);
                                stageMesh.push(mesh);
                                mesh.material = mat1;
                                mesh.physicsBody.setGravityFactor(gapp);   // 重力の効果(高層ほど小さく・軽く)
                                mesh._timer = timerIni + (iz0+ix)*15;
                                mesh._act = "force2";
                                checkMesh.push(mesh);
                            }
                        }
                        
                    }
                    p = p2.add(new BABYLON.Vector3(sd, 0, 0));
                    iz0 += nx + 50;
                }
                if (dir == "x-") {
                    nx = nloop, ny = Math.min(nloop-1, nymin);
                    p.x += -padGrnd;
                    len = sdw2*(nloop);
                    p1 = p.add(new BABYLON.Vector3(0, 0, 0));
                    p2 = p1.add(new BABYLON.Vector3(-len, 0, 0));
                    {
                        // p0 = p1.add(new BABYLON.Vector3(0, 0.1, len/2));
                        p0 = p1.add(p2).scale(0.5);
                        p0.y += 0.1;
                        mesh = crGround3(p0, len, sd);
                        stageMesh.push(mesh);
                    }
                    for (let z of [-sdw_,sdw_]) {
                        p.z = p1.z + z;
                        for (let iy = 0; iy < ny; ++iy) {
                            let nxx = nx-iy;
                            p.y = p1.y + sh11*iy;
                            let gapp = Math.pow(1.2, -iy-1);
                            for (let ix = 0; ix < nxx; ++ix) {
                                p.x = p1.x - sdw2*ix-sdw*iy-sd_;
                                mesh = crBlock1(p, R90);
                                stageMesh.push(mesh);
                                mesh.material = mat1;
                                mesh.physicsBody.setGravityFactor(gapp);   // 重力の効果(高層ほど小さく・軽く)
                                mesh._timer = timerIni + (iz0+ix)*15;
                                mesh._act = "force2";
                                checkMesh.push(mesh);
                            }
                        }
                    }
                    p = p2.add(new BABYLON.Vector3(-sd, 0, 0));
                    iz0 += nx + 50;
                }
                if (dir == "z+") {
                    nz = nloop, ny = Math.min(nloop-1, nymin);
                    p.z += padGrnd;
                    len = sdw2*(nloop);
                    p1 = p.add(new BABYLON.Vector3(0, 0, 0));
                    p2 = p1.add(new BABYLON.Vector3(0, 0, len));
                    {
                        // p0 = p1.add(new BABYLON.Vector3(0, 0.1, len/2));
                        p0 = p1.add(p2).scale(0.5);
                        p0.y += 0.1;
                        mesh = crGround3(p0, sd, len);
                        stageMesh.push(mesh);
                    }
                    for (let x of [-sdw_,sdw_]) {
                        p.x = p1.x + x;
                        for (let iy = 0; iy < ny; ++iy) {
                            let nzz = nz-iy;
                            p.y = p1.y + sh11*iy;
                            let gapp = Math.pow(1.2, -iy-1);
                            for (let iz = 0; iz < nzz; ++iz) {
                                p.z = p1.z + sdw2*iz+sdw*iy+sd_;
                                mesh = crBlock1(p);
                                stageMesh.push(mesh);
                                mesh.material = mat1;
                                mesh.physicsBody.setGravityFactor(gapp);   // 重力の効果(高層ほど小さく・軽く)
                                mesh._timer = timerIni + (iz0+iz)*15;
                                mesh._act = "force2";
                                checkMesh.push(mesh);
                            }
                        }
                    }
                    p = p2.add(new BABYLON.Vector3(0, 0, sd));
                    iz0 += nz + 50;
                }
                if (dir == "z-") {
                    nz = nloop, ny = Math.min(nloop-1, nymin);
                    p.z += -padGrnd;
                    len = sdw2*(nloop);
                    p1 = p.add(new BABYLON.Vector3(0, 0, 0));
                    p2 = p1.add(new BABYLON.Vector3(0, 0, -len));
                    {
                        // p0 = p1.add(new BABYLON.Vector3(0, 0.1, len/2));
                        p0 = p1.add(p2).scale(0.5);
                        p0.y += 0.1;
                        mesh = crGround3(p0, sd, len);
                        stageMesh.push(mesh);
                    }
                    for (let x of [-sdw_,sdw_]) {
                        p.x = p1.x + x;
                        for (let iy = 0; iy < ny; ++iy) {
                            let nzz = nz-iy;
                            p.y = p1.y + sh11*iy;
                            let gapp = Math.pow(1.2, -iy-1);
                            for (let iz = 0; iz < nzz; ++iz) {
                                // p.z = p1.z - sdw2*iz+sdw*iy-sd_;
                                p.z = p1.z - sdw2*iz-sdw*iy-sd_;
                                mesh = crBlock1(p);
                                stageMesh.push(mesh);
                                mesh.material = mat1;
                                mesh.physicsBody.setGravityFactor(gapp);   // 重力の効果(高層ほど小さく・軽く)
                                mesh._timer = timerIni + (iz0+iz)*15;
                                mesh._act = "force2";
                                checkMesh.push(mesh);
                            }
                        }
                    }
                    p = p2.add(new BABYLON.Vector3(0, 0, -sd));
                    iz0 += nz + 50;
                }
                mesh = crGround2(p);
                stageMesh.push(mesh);
            }
            // goal
            meshGoal = crGoal(p);
            stageMesh.push(meshGoal);

        } if (stage == 1203) {
            // Ｔ字橋（支柱R90：進行方向：固定
            sw=3.0, sh=2.0, sd=0.2, mass = 0.02, block2mass = mass*10000;
            sw_=sw/2, sh_=sh/2, sd_=sd/2;
            let nz=30, x, y, z=5, sh11=sh*1.1, nz_=nz-1, timerIni = 150;
            let p = new BABYLON.Vector3(0, 0, z), mesh;
            pStart = new BABYLON.Vector3(p.x, p.y+10, 0);
            for (let iz = 0; iz < nz; ++iz) {
                if (iz==0 || iz==nz_) {
                    // 支柱
                    p.y = 0;
                    p.z = sh11*iz;
                    mesh = crBlock01(p, R90);
                    stageMesh.push(mesh);
                    // 上
                    p.y = sh + sd_;
                    mesh = crBlock02(p);
                    stageMesh.push(mesh);
                } else {
                    // 支柱
                    p.y = 0; // sh_;
                    p.z = sh11*iz;
                    mesh = crBlock01(p, R90);
                    stageMesh.push(mesh);
                    mesh._timer = timerIni + iz*10;
                    mesh._act = "delete";
                    checkMesh.push(mesh);
                    // 上だけを可動に
                    p.y = sh + sd_;
                    mesh = crBlock2(p);
                    stageMesh.push(mesh);
                    mesh.material = mat1;
                    mesh._timer = timerIni + iz*10;
                    mesh._act = "force";
                    checkMesh.push(mesh);
                }
            }
            // goal
            meshGoal = crGoal(p);
            stageMesh.push(meshGoal);


        } if (stage == 1403) {
            // トンネル(鳥居風
            sw=0.2, sh=2.0, sd=0.2, mass = 0.02, block2mass = mass*10000;
            sw_=sw/2, sh_=sh/2, sd_=sd/2;
            let nz=30, x, y, z=5, sh11=sh*1.01, sw11=sw*1.01, adjy=2, timerIni = 150;
            let p = new BABYLON.Vector3(0, adjy, z), mesh;
            pStart = new BABYLON.Vector3(p.x, p.y+10, p.z-5);
            {
                // 参道（床
                let len = sw11*nz*5 + 10;
                let p1 = new BABYLON.Vector3(0, adjy, len/2-2);
                mesh = crGround3(p1, sh, len);
                stageMesh.push(mesh);
            }
            let crTorii = function(p0, iz) {
                // 鳥居
                let p = p0.clone();
                let mesh1;
                // 支柱
                p.x = -sh_+sd_;
                mesh = crBlock1(p, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                mesh._timer = timerIni + iz*10;
                mesh._act = "force";
                checkMesh.push(mesh);
                // 支柱
                p.x = sh_-sd_;
                // p.z = sh11*iz;
                mesh = crBlock1(p, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                mesh._timer = timerIni + iz*10;
                mesh._act = "force";
                checkMesh.push(mesh);
                // 上
                p.x = 0;
                p.y += sh+sd_;
                mesh = crBlock2(p, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                mesh._timer = timerIni + iz*10;
                mesh._act = "force";
                checkMesh.push(mesh);
            }
            for (let iz = 0; iz < nz; ++iz) {
                z = sw11*iz*5+4;
                p.set(0, adjy, z);
                crTorii(p, iz);
            }
            // goal
            p.y = sh + adjy;
            meshGoal = crGoal(p);
            stageMesh.push(meshGoal);


        } if (stage == 1502) {
            // 懸垂線（カテナリー曲線
            sw=1.0, sh=2.0, sd=0.2, mass = 0.02, block2mass = mass*10000;
            sw_=sw/2, sh_=sh/2, sd_=sd/2;
            let nz=30, x, y, z=5, sh11=sh*1.01, sw11=sw*1.01, nz_=nz/2, xx, a=50;
            let zstep = 1.3, timerIni = 150;
            let p = new BABYLON.Vector3(0, 0, z), mesh;
            pStart = new BABYLON.Vector3(p.x, p.y+10, p.z-5);
            {
                // 島（スタート地点
                let iz = 0;
                xx = (iz-nz_)/a;
                y = a*Math.cosh(xx)-a+1.1;
                z = sw11*iz*zstep+3;
                let grndW=6, grndH=6;
                let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
                mesh.position.set(0, y, z-3-sw_);
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
                stageMesh.push(mesh);
            }
            for (let iz = 0; iz < nz; ++iz) {
                xx = (iz-nz_)/a;
                y = a*Math.cosh(xx)-a+1;
                z = sw11*iz*zstep+3;
                // 枕木(固定)
                p.set( 0, y-sd, z);
                mesh = crBlock00(p);
                mesh.material = mat0;
                stageMesh.push(mesh);
                mesh._timer = timerIni + iz*10;
                mesh._act = "delete";
                checkMesh.push(mesh);
                // 枕木
                p.set( 0, y-sd, z);
                mesh = crBlock2(p, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                mesh._timer = timerIni + iz*10;
                mesh._act = "force";
                checkMesh.push(mesh);
                // 支柱
                p.set(-sh_+sd_, y, z);
                mesh = crBlock1(p, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                mesh._timer = timerIni + iz*10;
                mesh._act = "force";
                checkMesh.push(mesh);
                // 支柱
                p.set( sh_-sd_, y, z);
                // p.z = sh11*iz;
                mesh = crBlock1(p, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                mesh._timer = timerIni + iz*10;
                mesh._act = "force";
                checkMesh.push(mesh);
            }
            {
                // 島（ゴール地点
                let iz = nz;
                xx = (iz-nz_)/a;
                y = a*Math.cosh(xx)-a+1.1;
                z = sw11*iz*zstep+3;
                let grndW=6, grndH=6;
                let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
                mesh.position.set(0, y, z+3+sw_);
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
                stageMesh.push(mesh);
                // goal
                p.copyFrom(mesh.position);
                meshGoal = crGoal(p);
                stageMesh.push(meshGoal);
            }

        } if (stage == 1601) {
            // バベルの塔

        } else {

            console.log("stage=", stage);
        }

        camera.position.copyFrom(meshGoal.position);

    } // createStage


    // デバッグ表示(debug)
    if (0) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }


    let physicsHelper = new BABYLON.PhysicsHelper(scene);
    let actPhysForce = function(actType) {
        let origin = myMesh.position, radius=10, strength=0.1, vortexHeight=20;
        if (actType == 1) {
            // 放射／爆発
            origin = origin.clone();
            origin.y -= 1;
            let event = physicsHelper.applyRadialExplosionImpulse(
                origin,
                { radius: radius,
                  strength: strength,
                  falloff: BABYLON.PhysicsRadialImpulseFalloff.Linear,
                });
        }
        if (actType == 2) {
            // 放射／爆発  下から吹き飛ばすように
            origin = origin.clone();
            origin.y -= 3; radius += 4;
            let event = physicsHelper.applyRadialExplosionImpulse(
                origin,
                { radius: radius,
                  strength: strength,
                  falloff: BABYLON.PhysicsRadialImpulseFalloff.Linear,
                });
        }
        if (actType == 3) {
            // 竜巻／巻き上げる感じ
            origin = origin.clone();
            let event = physicsHelper.vortex(
                origin,
                { radius: radius,
                  strength: strength,
                  height:vortexHeight,
                });
        }
    }

    // --------------------------------------------------
    let myMesh = null;

    // Player/Character state
    var state = "IN_AIR";
    var inAirSpeed = 10.0;
    var onGroundSpeed = 5.0;
    var jumpHeight = 3;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -9, 0);

    let keyAction = {forward:0, back:0, right:0, left:0, jump:0};

    // Physics shape for the character
    let h = 1.5, r = 0.3;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: h, radius: r}, scene);
    let characterPosition = new BABYLON.Vector3(0, 10, 0);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
    camera.lockedTarget = displayCapsule;
    myMesh = displayCapsule;

    displayCapsule.material = new BABYLON.StandardMaterial('mat', scene);
    displayCapsule.material.diffuseColor = BABYLON.Color3.Blue();
    displayCapsule.material.alpha = 0.7;

    // State handling
    var getNextState = function(supportInfo) {
        if (state == "IN_AIR") {
            if (supportInfo.supportedState == BABYLON.CharacterSupportedState.SUPPORTED) {
                return "ON_GROUND";
            }
            return "IN_AIR";
        } else if (state == "ON_GROUND") {
            if (supportInfo.supportedState != BABYLON.CharacterSupportedState.SUPPORTED) {
                return "IN_AIR";
            }
            if (keyAction.jump) {
                return "START_JUMP";
            }
            return "ON_GROUND";
        } else if (state == "START_JUMP") {
            return "IN_AIR";
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
        if (state == "IN_AIR") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
            {
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
            }
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
        const rotRad = 0.08; // 0.02;
        if (keyAction.right) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), rotRad);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, rotRad, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        } else if (keyAction.left) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), -rotRad);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, -rotRad, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        }
        let desiredLinearVelocity = getDesiredVelocity(dt, support, characterOrientation, characterController.getVelocity());
        characterController.setVelocity(desiredLinearVelocity);
        characterController.integrate(dt, support, characterGravity);
    });
    let resetPosi = function(p) {
        characterController.setVelocity(new BABYLON.Vector3(0, 0, 0));
        characterController.setPosition(p);
        // 向きをリセット Z軸＋方向を向かせる
        characterOrientation = BABYLON.Quaternion.FromEulerVector(new BABYLON.Vector3(0, 0, 0));
        displayCapsule.rotationQuaternion = characterOrientation.clone();
    }

    // Input to direction
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 'ArrowUp') {
                inputDirection.z = 1;
                keyAction.forward = 1;
            } else if (kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowDown') {
                inputDirection.z = -1;
                keyAction.back = 1;
            } else if (kbInfo.event.key == 'a' || kbInfo.event.key == 'ArrowLeft') {
                keyAction.left = 1;
            } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
                keyAction.right = 1;
            } else if (kbInfo.event.key == ' ') {
                keyAction.jump = 1;
            } else if (kbInfo.event.key == 'c') {
                changeCAM3(icamera);
            } else if (kbInfo.event.key == '1') {
                actPhysForce(1);
            } else if (kbInfo.event.key == '2') {
                actPhysForce(2);
            } else if (kbInfo.event.key == '3') {
                actPhysForce(3);

            } else if (kbInfo.event.key === 'r') {
                // キャラクターコントローラーの位置リセット
                resetPosi(pStart);

            } else if (kbInfo.event.key === 'Enter') {
                createStage(stage);
                resetPosi(pStart);
            } else if (kbInfo.event.key == 'n' || kbInfo.event.key == 'b') {
                let i = stageList.indexOf(stage);
                console.assert(i >= -1);
                if (kbInfo.event.key == 'n') {
                    i = (i+1) % stageList.length;
                } else {
                    i = (i-1+stageList.length) % stageList.length;
                }
                stage = stageList[i];
                createStage(stage);
                resetPosi(pStart);
            } else if (kbInfo.event.key === 'h') {
                //   キー操作(h)で表示のon/offを切り替え
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowUp' || kbInfo.event.key == 'ArrowDown') {
                inputDirection.z = 0;    
                keyAction.forward = 0;
                keyAction.back = 0;
            }
            if (kbInfo.event.key == 'a' || kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowLeft' || kbInfo.event.key == 'ArrowRight') {
                inputDirection.x = 0;
                keyAction.left = 0;
                keyAction.right = 0;
            } else if (kbInfo.event.key == ' ') {
                // wantJump = false;
                keyAction.jump = 0;
            }
            break;
        }
    });

    // ------------------------------
    // メッシュ、タイマー付きの削除、active
    scene.registerAfterRender(function() {
        let dlist = [], rlist = [];
        for (let m of checkMesh) {
            if (m._timer > 0) {
                --m._timer;
                rlist.push(m);
            } else {
                dlist.push(m);
                if (m._act == "delete") {
                    m.position.y = -9999;
                } else if (m._act == "force") {
                    m._agg.body.applyImpulse(BABYLON.Vector3.Down().scale(0.001), m.absolutePosition);
                } else if (m._act == "force2") {
                    m._agg.body.applyImpulse(BABYLON.Vector3.Random().scale(0.01), m.absolutePosition);
                } else {
                    console.log("unknown act=", m._act);
                }
            }
        }
        checkMesh = rlist;
    })

    // ------------------------------
    // ゴール判定
    let bCallNextStage = false;
    scene.registerAfterRender(function() {
        if (meshGoal != null) {
            if (myMesh.intersectsMesh(meshGoal, true)) {
                if (bCallNextStage == false) {
                    bCallNextStage = true; // 一回だけ呼び出すように
                    setNextStage();
                }
            }
        }
    });

    // ゴール時の処理
    let nextStage = function() {
        bCallNextStage = false;
        // clearMeshes();
        // setCourseRunnerAndStart();
        let i = stageList.indexOf(stage);
        i = (i+1) % stageList.length;
        stage = stageList[i];
        createStage(stage);
        resetPosi(pStart);
    }
    // 3秒後に resetCourse() を呼び出す
    let setNextStage = function() {
        setTimeout(nextStage, 3000);
    }

    // ------------------------------------------------------------
    let skybox = null;
    if (1) {
        // Skybox
        // const skyboxTextPath = "textures/TropicalSunnyDay";
        skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:6000.0}, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }

    // ------------------------------


    let stage = 0;
//    stage = 1203; // Ｔ字橋げた（支柱R90：進行方向：固定 ..安定
//    stage = 1403; // トンネル(鳥居風
//    stage = 1502; // 懸垂線（カテナリー曲線
//    stage = 1114; // 壁（側面）を橋に見立てた、島渡
//    stage = 1002; // 水平・直線の板 だけで、島めぐり ----------
//    stage = 1024; // 登り のらせん(ブロック固定) バベルの塔 ----------
//    stage = 1102; // 壁(裏にブロックあり) --------------------

    let stageList = [1203, 1403, 1502, 1114, 1002, 1024, 1102, ];
    stage = stageList[stage];

    createStage(stage);
    resetPosi(pStart);

    return scene;
} 

// ######################################################################

export var createScene = createScene_test_104; // スタート、ゴールを設定

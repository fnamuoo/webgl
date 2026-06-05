// ドミノ / dominoes(2)
//
// 操作
// Space : 開始
// Enter : リセット
// n/b   : ステージ切り替え


// Viele Dominoes
// 50 Domino Tricks
// https://www.youtube.com/watch?v=o6tTgjoRxWw
// 100 Domino Tricks
// https://www.youtube.com/watch?v=kHQRLo5OMgs


export var createScene_test_961 = async function () {

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
    const camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(0, 0, -0.5));
    camera.attachControl(canvas, true);
    camera.wheelDeltaPercentage = 0.01;
//    camera.wheelDeltaPercentage = 0.0001;

    const light = new BABYLON.HemisphericLight("", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);

    // const hk = new BABYLON.HavokPlugin(true);
    // //scene.enablePhysics(gravity, hk);
    // hk.setTimeStep(1 / 60);       // 基本 timestep
    // // hk.setSubTimeStep(4);         // サブステップ数（重要）

    let g = 9.8, pushF=0.02;
//    let g = 98, pushF=0.05;
//    let g = 30, pushF=0.03;
//    let g = 0.98, pushF=0.008;
    scene.enablePhysics(new BABYLON.Vector3(0, -g, 0), hk);


    // let sw=0.5, sh=1.0, sd=0.15, mass = 0.05;
    let sw=0.5, sh=1.0, sd=0.15, mass = 0.02;
    // let sw=0.6, sh=1.0, sd=0.15, mass = 0.05; //try for 205
    let sw_=sw/2, sh_=sh/2, sd_=sd/2;


    let block1mass = mass, block2mass = mass, block3mass = mass;
//    let block1mass = 0, block2mass = 0, block3mass = 0;
//    let stage = 209;
    let stage = 218;

    stage = 1;
//    stage = 1002;

    let stageList =[
        // 直線
        1, 5, 6, 10, 12, 13, 14, 302,
        // 直線ずれ
        2, 7, 203, 
        // 方向転換 (R90)
        3, 24, 31, 216,
        // 方向転換 (R180)
        16, 18, 22, 23, 27, 30, 209, 
        // 交差
        35, 36, 37, 39, 207, 211, 210, 
        // 分岐
        4, 202, 218, 
        // 塔・かべ・やま
        8, 15, 33, 205, 214, 301, 
        ];

    let crBlock = function(p, rad=0, isSafe=false) {
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sh, depth:sd}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y+sh_, p.z); // 位置の変更する場所が重要!!!!!!!位置を変更して物理にしないと稀におかしなことに
        if (rad != 0) {
            mesh.rotation.y = rad;
        }
        if (isSafe) {
            // 摩擦高く、反発を低く、dampingを設定して、すべりにくくする
            let opt = {mass:block1mass, startAsleep:true, friction:1, restitution:0, };
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
            mesh.physicsBody.disablePreStep = false;
            mesh.physicsBody.setLinearDamping(0.2);
            mesh.physicsBody.setAngularDamping(0.9);
        } else {
            // デフォルトのまま
            let opt = {mass:block1mass, startAsleep:true};
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
            mesh.physicsBody.disablePreStep = false;
        }
        return mesh;
    }
    let crBlock2 = function(p, rad=0, isSafe=false) {
        // 寝かせて配置 (奥行を最長)
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sd, depth:sh}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y+sd_, p.z); // 位置の変更する場所が重要!!!!!!!位置を変更して物理にしないと稀におかしなことに
        if (rad != 0) {
            mesh.rotation.y = rad;
        }
        if (isSafe) {
            // 摩擦高く、反発を低く、dampingを設定して、すべりにくくする
            let opt = {mass:block2mass, startAsleep:true, friction:1, restitution:0, };
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
            mesh.physicsBody.disablePreStep = false;
            mesh.physicsBody.setLinearDamping(0.2);
            mesh.physicsBody.setAngularDamping(0.9);
        } else {
            let opt = {mass:block2mass, startAsleep:true};
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
            mesh.physicsBody.disablePreStep = false;
        }
        return mesh;
    }
    let crBlock3 = function(p, rad=0, isSafe=false) {
        // 横に寝たように配置 (奥行を最長)
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sd, height:sw, depth:sh}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y+sw_, p.z); // 位置の変更する場所が重要!!!!!!!位置を変更して物理にしないと稀におかしなことに
        if (rad != 0) {
            mesh.rotation.y = rad;
        }
        if (isSafe) {
            // 摩擦高く、反発を低く、dampingを設定して、すべりにくくする
            let opt = {mass:block3mass, startAsleep:true, friction:0.7, restitution:0, };
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
            mesh.physicsBody.disablePreStep = false;
            mesh.physicsBody.setLinearDamping(0.2);
            mesh.physicsBody.setAngularDamping(0.9);
        } else {
            let opt = {mass:block3mass, startAsleep:true};
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, opt, scene);
            mesh.physicsBody.disablePreStep = false;
        }
        return mesh;
    }

    let basesw=sw+0.1, basesh=0.1, basesd=sd+0.2;
    let basesw_=basesw/2, basesh_=basesh/2, basesd_=basesd/2;
    let crBase = function(p) {
        // 基礎 / 空中に配置するための足場
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:basesw, height:basesh, depth:basesd}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y-basesh_, p.z);
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

    // ----------------------------------------------------------------------
    // Viele Dominoes
    // 50 Domino Tricks

    let stageMesh = [];

    let createStage = function(stage) {
console.log("createStage: stage=", stage);
        while (stageMesh.length > 0) {
            let mesh = stageMesh.pop();
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            mesh.dispose();
        }
        mesh0 = null;

        let mat0 = new BABYLON.StandardMaterial("");
        mat0.emissiveColor = BABYLON.Color3.White();
        mat0.alpha = 0.3;

        let mat1 = new BABYLON.StandardMaterial("");
        mat1.emissiveColor = BABYLON.Color3.Red();
        mat1.alpha = 0.6;

        let p = new BABYLON.Vector3(0, 0, 0);
        for (let iz = -10; iz < 0; ++iz) {
            p.z = iz*sh_;
            let mesh = crBlock(p);
            if (mesh0 == null) {
                mesh0 = mesh;
            }
            stageMesh.push(mesh);
        }

        if (stage == 1) {
            // 上のブロックがすべる？

            let n = 5, n_=n-1, z;
//            let quat = BABYLON.Quaternion.FromLookDirectionLH(vec, vN);
            for (let iz = 0; iz < n; ++iz) {
                z = iz*sh*1.4;
                // 一番下の枕木
                p.x = 0;
                p.y = 0;
                p.z = z; // iz*sh;
                let mesh1 = crBlock2(p, R90);
                stageMesh.push(mesh1);
                // 枕木の上
                p.y = sd;
                p.z = z; // iz*sh;
                let mesh2 = crBlock(p);
                mesh2.material = mat1;
                stageMesh.push(mesh2);

                if (iz == n-1) {
                    break;
                }

                // 枕木横のガード
                p.x = sh_ - sd_;
                // p.y = sw_+0.02;
                p.y = +0.087;
                p.z = z + sh_ + sd_*1.40;
                let mesh31 = crBlock3(p);
                mesh31.rotation = new BABYLON.Vector3(0.20, 0, 0);
                stageMesh.push(mesh31);
                // mesh31.rotation.x = 1;
                // mesh31.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(vec, vN);

                p.x = -p.x;
                let mesh32 = crBlock3(p);
                mesh32.rotation = new BABYLON.Vector3(0.22, 0, 0);
                stageMesh.push(mesh32);

                // ガードの上
                p.x = 0;
                // p.y += sw*1.15;
                p.y += sw*1.140;
                p.z = z + sd_*3.6;
                let mesh4 = crBlock3(p);
                mesh4.rotation = new BABYLON.Vector3(0, R90, 0.22);
                mesh4.material = mat1;
                stageMesh.push(mesh4);

            }

            p.x = 0;
            p.y = 0;
            z = z+sh_;
            for (let iz = 0; iz < 10; ++iz) {
                p.z = iz*sh_ + z;
                let mesh = crBlock(p);
                stageMesh.push(mesh);
            }
        }

        if (stage == 2) {
            // 強Gで×
            let n = 5, n_=n-1, z;
            z = p.z + sh_;
            p.z = z;
            for (let i = 0; i < n; ++i) {
                // 土台
                p.x = i*sh;
                p.y = 0;
                p.z = z;
                let mesh1 = crBlock2(p, R90);
                stageMesh.push(mesh1);
                // てこ
                p.y += sd;
                p.z = z + sh_ - sd;
                let mesh2 = crBlock2(p);
                stageMesh.push(mesh2);
                // .
                if (i == n_) {
                    break;
                }
                // すべるもの
                p.x = i*sh + sh_;
                p.y += sd;
                p.z = z;
                let mesh3 = crBlock3(p, R90);
                mesh3.material = mat1;
                stageMesh.push(mesh3);
            }
        }

        if (stage == 3) {
            p.set(0, 0, 0);
            let mesh = crBlock(p);
            stageMesh.push(mesh);
            // 同じ向きで少しだけ重なり
            p.x += sw*0.8;
            p.z += sd;
            mesh = crBlock(p);
            mesh.material = mat1;
            stageMesh.push(mesh);
            // ９０度回転
            p.x += sw_ + sd_;
            mesh = crBlock(p, R90);
            mesh.material = mat1;
            stageMesh.push(mesh);
            // 同じ方向に並べる
            let n = 4;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                // mesh.material = mat1;
                stageMesh.push(mesh);
            }
            // 同じ向きで少しだけ重なり
            p.x += sd;
            p.z += sw*0.8;
            mesh = crBlock(p, R90);
            mesh.material = mat1;
            stageMesh.push(mesh);
            // ９０度回転
            p.z += sw_ + sd_;
            mesh = crBlock(p);
            mesh.material = mat1;
            stageMesh.push(mesh);
            // 同じ方向に並べる
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
        }

        if (stage == 4) {
            // 正三角に配置する
            const r = sw/Math.sqrt(3);
            let cr3block = function(g, rad=0) {
                for (let i = 0; i < 3; ++i) {
                    let rad_ = rad + R120*i;
                    let rad2 = rad - R120*i + R90;
                    let p = g.add(new BABYLON.Vector3(r*Math.cos(rad_), 0, r*Math.sin(rad_)));
                    let mesh = crBlock(p, rad2);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                }
            }
            let dpan = r + sh;
            let rrad = -R90, rad;
            // 0: 原点位置
            let gg = new BABYLON.Vector3(0, 0, 0.5), gg2;
            cr3block(gg, rrad);
            // 1: 右上
            rad = R30;
            gg.addInPlace(new BABYLON.Vector3(dpan*Math.cos(rad), 0, dpan*Math.sin(rad)));
            rrad += R180;
            cr3block(gg, rrad);
            // 2: 上
            rad = R90;
            gg.addInPlace(new BABYLON.Vector3(dpan*Math.cos(rad), 0, dpan*Math.sin(rad)));
            rrad += R180;
            cr3block(gg, rrad);
            // 3: 右上
            rad = R30;
            gg.addInPlace(new BABYLON.Vector3(dpan*Math.cos(rad), 0, dpan*Math.sin(rad)));
            rrad += R180;
            cr3block(gg, rrad);
            // 4a: 上
            rad = R90;
            gg2 = gg.add(new BABYLON.Vector3(dpan*Math.cos(rad), 0, dpan*Math.sin(rad)));
            rrad += R180;
            cr3block(gg2, rrad);
            // 4b: 右下
            rad = -R30;
            gg.addInPlace(new BABYLON.Vector3(dpan*Math.cos(rad), 0, dpan*Math.sin(rad)));
            rrad += 0;
            cr3block(gg, rrad);
            // 5: 右上
            rad = R30;
            gg.addInPlace(new BABYLON.Vector3(dpan*Math.cos(rad), 0, dpan*Math.sin(rad)));
            rrad += R180;
            cr3block(gg, rrad);
            // 座標値修正
            p = gg.add(new BABYLON.Vector3(0, 0, sh_));
            // 同じ方向に並べる
            let n = 10;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                let mesh = crBlock(p);
                stageMesh.push(mesh);
            }
        }

        if (stage == 5) {
            // 土台
            let p2 = p.add(new BABYLON.Vector3(0, 0, sh));
            let mesh = crBlock2(p2);
            stageMesh.push(mesh);
            // 土台の上(1/3
            p2 = p.add(new BABYLON.Vector3(0, sd, sh_+sd_));
            mesh = crBlock(p2);
            stageMesh.push(mesh);
            // 土台の上(2/3
            p2.addInPlace(new BABYLON.Vector3(0, 0, sh_-sd_));
            mesh = crBlock(p2);
            stageMesh.push(mesh);
            // 土台の上(3/3
            p2.addInPlace(new BABYLON.Vector3(0, 0, sh_-sd_));
            mesh = crBlock(p2);
            stageMesh.push(mesh);

            p = p2.add(new BABYLON.Vector3(0, 0, sh_+sd));
            p.y = 0;
            for (let i = 0; i < 4; ++i) {
                mesh = crBlock(p);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(0, sh, 0));
                mesh = crBlock2(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p.addInPlace(new BABYLON.Vector3(0, 0, sh));
            }
            // 同じ方向に並べる
            let n = 10;
            for (let i = 0; i < n; ++i) {
                let mesh = crBlock(p);
                stageMesh.push(mesh);
                p.z += sh_;
            }
        }

        if (stage == 6) {
            let p2, mesh;
            // 土台の両端
            p = p.add(new BABYLON.Vector3(0, 0, sh_));
            mesh = crBlock(p);
            stageMesh.push(mesh);
            let n = 4;
            for (let i = 0; i < n; ++i) {
                // 土台
                p2 = p.add(new BABYLON.Vector3(0, 0, sh_+sd_));
                mesh = crBlock2(p2);
                // mesh.material = mat1;
                stageMesh.push(mesh);
                // 土台の上
                p2 = p.add(new BABYLON.Vector3(0, sd, sd));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 土台の両端
                p = p.add(new BABYLON.Vector3(0, 0, sh+sd));
                mesh = crBlock(p);
                // mesh.material = mat1;
                stageMesh.push(mesh);
            }
            // 座標値の修正
            p = p.add(new BABYLON.Vector3(0, 0, sh_));
            // 同じ方向に並べる
            n = 10;
            for (let i = 0; i < n; ++i) {
                let mesh = crBlock(p);
                // mesh.material = mat1;
                stageMesh.push(mesh);
                p.z += sh_;
            }
        }

        if (stage == 7) {
            p.z += sh_;
            let mesh = crBlock3(p, R90);
            mesh.material = mat1;
            stageMesh.push(mesh);
            // 傾けて横に並べる
            p = p.add(new BABYLON.Vector3(sh, 0.215, 0));
            mesh = crBlock3(p);
            mesh.rotation = new BABYLON.Vector3(0.550, R90, 0);
            mesh.material = mat1;
            stageMesh.push(mesh);
            let n = 3;
            for (let i = 0; i < n; ++i) {
                p = p.add(new BABYLON.Vector3(sh, 0, 0));
                mesh = crBlock3(p);
                mesh.rotation = new BABYLON.Vector3(0.520, R90, 0);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            // 滑り止め
            let p2 = p.add(new BABYLON.Vector3(sh*0.82, 0, 0));
            p2.y = 0;
            mesh = crBlock(p2);
            mesh.material = mat1;
            stageMesh.push(mesh);

            // 立てかけるように配置
            // p.z -= sd*1.5;
            // p.y = 0;
            // mesh = crBlock(p);
            // mesh.rotation = new BABYLON.Vector3(0.2, 0, 0);
            p.z -= sd*1.2;
            p.y = 0;
            mesh = crBlock(p);
            mesh.rotation = new BABYLON.Vector3(0.2, 0, 0);
            mesh.material = mat1;
            stageMesh.push(mesh);
            // 同じ方向に並べる
            n = 10;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                let mesh = crBlock(p);
                // mesh.material = mat1;
                stageMesh.push(mesh);
            }
        }

        if (stage == 8) {
            // 強Gで×
            let crTower = function(g) {
                let p2, mesh;
                // 一段目
                p2 = g.add(new BABYLON.Vector3(0, 0, -sw_+sd_));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = g.add(new BABYLON.Vector3(0, 0, sw_-sd_));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 二段目
                p2 = g.add(new BABYLON.Vector3(-sw_+sd_, sh, 0));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = g.add(new BABYLON.Vector3(sw_-sd_, sh, 0));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 三段目
                p2 = g.add(new BABYLON.Vector3(0, sh*2, sd_));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = g.add(new BABYLON.Vector3(0, sh*2, -sd_));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 四段目
                p2 = g.add(new BABYLON.Vector3(0, sh*3, 0));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            let gg = p.add(new BABYLON.Vector3(0, 0, sh*0.8));
            crTower(gg);
            gg = gg.add(new BABYLON.Vector3(0, 0, sh));
            crTower(gg);
            gg = gg.add(new BABYLON.Vector3(0, 0, sh));
            crTower(gg);
        }

        if (stage == 9) {
        }

        if (stage == 10) {
            let p2, mesh;
            let n = 4;
            for (let i = 0; i < n; ++i) {
                // 土台
                p = p.add(new BABYLON.Vector3(0, 0, sw_+sd_));
                mesh = crBlock3(p, R90);
                stageMesh.push(mesh);
            }
            n = 8;
            for (let i = 0; i < n; ++i) {
                // 土台
                p = p.add(new BABYLON.Vector3(0, 0, sw_+sd_));
                mesh = crBlock3(p, R90);
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(0, sw, 0));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
        }

        if (stage == 12) {
            let gg;
            let crUnit = function(g) {
                let p = g.add(new BABYLON.Vector3(0, 0, -sd*2.5));
                let mesh, p2, n=5;
                for (let i=0; i<n; ++i) {
                    mesh = crBlock(p);
                    stageMesh.push(mesh);
                    p2 = p.add(new BABYLON.Vector3(0, sh, 0));
                    mesh = crBlock(p2);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                    p = p.add(new BABYLON.Vector3(0, 0, sd));
                }
            }
            // 座標値の修正
            gg = p.add(new BABYLON.Vector3(0, 0, sd*2+sh_));
            // ユニットの配置
            let n = 4;
            for (let i =0; i < n; ++i) {
                crUnit(gg);
                gg = gg.add(new BABYLON.Vector3(0, 0, sd*5+sh_));
            }
        }

        if (stage == 13) {
            // 強Gで×
            // ライン分岐
            {
                let n = 5, slope = 0.2;
                let p1 = new BABYLON.Vector3(0, 0, 0);
                let p2 = new BABYLON.Vector3(0, 0, 0);
                let x1 = sw/4;
                let x2 = sw/2;
                for (let iz = 0; iz < n; ++iz) {
                    let x = slope*iz;
                    if (x < x1) {
                        p1.x = 0;
                        p1.z = iz*sh_;
                        let mesh1 = crBlock(p1);
                        stageMesh.push(mesh1);
                        continue;
                    } else if (x < x2) {
                        p1.x = -sw_;
                        p2.x = sw_;
                    } else {
                        p1.x = -x;
                        p2.x = x;
                    }
                    p1.z = iz*sh_;
                    p2.z = iz*sh_;
                    let mesh1 = crBlock(p1);
                    let mesh2 = crBlock(p2);
                    stageMesh.push(mesh1);
                    stageMesh.push(mesh2);
                    p.z = p1.z;
                }
            }
            p.z += sw_;
            let crUnit = function(g) {
                // 横に立てたブロックを３段に
                let mesh, p2;
                // 一段目
                mesh = crBlock3(p, R90);
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sh*1.8, 0, 0));
                mesh = crBlock3(p2, R90);
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(-sh*1.8, 0, 0));
                mesh = crBlock3(p2, R90);
                stageMesh.push(mesh);
                // 二段目
                p2 = p.add(new BABYLON.Vector3(sh*0.9, sw, 0));
                mesh = crBlock3(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(-sh*0.9, sw, 0));
                mesh = crBlock3(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 三段目
                p2 = p.add(new BABYLON.Vector3(0, sw*2, 0));
                mesh = crBlock3(p2, R90);
                stageMesh.push(mesh);
            }
            // ユニットを並べる
            let n = 10;
            for (let i = 0; i < n; ++i) {
                p.z += sw*0.7;
                crUnit(p);
            }
        }

        if (stage == 14) {
            let crUnit = function(g) {
                // 縦に立てたブロックを２段に
                let mesh, p2;
                // 一段目
                mesh = crBlock(p);
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(-sw*1.8, 0, 0));
                mesh = crBlock(p2);
                stageMesh.push(mesh);
                // 二段目
                p2 = p.add(new BABYLON.Vector3(-sw*0.9, sh, 0));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
//            p.z += sh_;
            // ユニットを並べる
            let n = 4;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                crUnit(p);
            }
            n = 4;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                let mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            n = 4;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                crUnit(p);
            }
        }

        if (stage == 15) {
            let mesh;
            let crUnit = function(g) {
                let mesh, p, d = sh-sd_;
                p = g.add(new BABYLON.Vector3(-sw+sd, 0, 0));
                mesh = crBlock3(p, R90);
                stageMesh.push(mesh);
                // 1周目
                p = g.add(new BABYLON.Vector3(d, 0, 0));
                mesh = crBlock3(p);
                stageMesh.push(mesh);
                p = g.add(new BABYLON.Vector3(sh_, sw, 0));
                mesh = crBlock3(p, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 2周目
                p = g.add(new BABYLON.Vector3(d*2, 0, 0));
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
                p = g.add(new BABYLON.Vector3(d*1.5, sw*2, 0));
                mesh = crBlock3(p, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 3周目
                p = g.add(new BABYLON.Vector3(d*3, 0, 0));
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
                p = g.add(new BABYLON.Vector3(d*3, sh, 0));
                mesh = crBlock3(p);
                stageMesh.push(mesh);
                p = g.add(new BABYLON.Vector3(d*2.5, sw*3, 0));
                mesh = crBlock3(p, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 4周目
                p = g.add(new BABYLON.Vector3(d*4, 0, 0));
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
                p = g.add(new BABYLON.Vector3(d*4, sh, 0));
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
                p = g.add(new BABYLON.Vector3(d*3.5, sw*4, 0));
                mesh = crBlock3(p, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            let n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
                p.z += sh_;
                crUnit(p);
            }
        }

        if (stage == 16) {
            let mesh, n = 3, p2;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            p.x += sw+sd_;
            p.z += sh_;
            // 折り返しユニット
            {
                // 基礎
                mesh = crBlock3(p);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 折り返し用のてこ＆（最初のブロックの戻りの）おさえ
                p2 = p.add(new BABYLON.Vector3(0, sw, 0));
                mesh = crBlock3(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(0, sw, -sd));
                mesh = crBlock3(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p = p.add(new BABYLON.Vector3(sw_+sd_, 0, -sd*2));
            n = 10;
            for (let i = 0; i < n; ++i) {
                if (i == 0) {
                    // 1枚目は やや（倒れやすいよう）傾けておく
                    p2 = p.add(new BABYLON.Vector3(0, 0, 0.02));
                    mesh = crBlock(p2);
                    mesh.rotation = new BABYLON.Vector3(-0.02, 0, 0);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                } else {
                    mesh = crBlock(p);
                    stageMesh.push(mesh);
                }
                p.z -= sh_;
            }
        }

        if (stage == 18) {
            let mesh, p2, n;
            p.z += sh_;
            // 折り返しユニット
            {
                p2 = p.add(new BABYLON.Vector3(-sw_, 0, 0));
                // 基礎
                mesh = crBlock3(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(-sw_, 0, sd));
                mesh = crBlock3(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // ..
                p2 = p.add(new BABYLON.Vector3(-sh_-sw_+sd, sw, sd_*0.12));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }

            p.x += -sw*1.5;
            n = 5;
            for (let i = 0; i < n; ++i) {
                p.z -= sh_;
                p.x -= sw_*0.2*i;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            p.z -= sh_;

            // 折り返しユニット(2) 
            {
                p2 = p.add(new BABYLON.Vector3(-sw_, 0, 0));
                // 基礎
                mesh = crBlock3(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(-sw_, 0, -sd));
                mesh = crBlock3(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // .. 強G時に 微妙に傾く
                p2 = p.add(new BABYLON.Vector3(-sh_-sw_+sd, sw, -sd_*0.12));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }

            p.x += -sw*1.2;
            n = 5;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                p.x -= sw_*0.2*i;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }

        }

        if (stage == 22) {
            let mesh, n = 3, p2;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            p.x += sw+sd_;
            p.z += sh_;
            // 折り返しユニット
            {
                // 基礎
                mesh = crBlock3(p);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // てこのおさえ
                p2 = p.add(new BABYLON.Vector3(sd, 0, sw_+sd_));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sd*2, 0, sw_+sd_));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sd*3, 0, sw_+sd_));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 折り返し用のてこ
                p2 = p.add(new BABYLON.Vector3(0, sw, 0));
                mesh = crBlock3(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p = p.add(new BABYLON.Vector3(sd*3, 0, -sd*1.5));
            n = 6;
            for (let i = 0; i < n; ++i) {
                mesh = crBlock(p);
                stageMesh.push(mesh);
                p.z -= sh_;
            }
        }

        if (stage == 23) {
            let mesh, n, p2, p0;
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            p.z += sh_;
            // 折り返しユニット
            {
                // 基礎
                p2 = p.add(new BABYLON.Vector3(0, 0, sh-0.02));
                mesh = crBlock2(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(0, sd, sh-0.01));
                mesh = crBlock2(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(-sw_, sd*2, sh-sw_));
                mesh = crBlock2(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sw_, sd*2, sh-sw_));
                mesh = crBlock2(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // ..
                p2 = p.add(new BABYLON.Vector3(-sw+sd_, sd*3, sh-sw_+sw_));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sw-sd_, sd*3, sh-sw_+sw_));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 強G用のガード（通常Gなら不要）
                p2 = p.add(new BABYLON.Vector3(-sw-sd_, 0, sh-sw_+sw_));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sw+sd_, 0, sh-sw_+sw_));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(-sw-sd_-sd, 0, sh-sw_+sw_));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sw+sd_+sd, 0, sh-sw_+sw_));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p0 = p.add(new BABYLON.Vector3(0, 0, -sh_));
            // 右レーン
            p = p0.add(new BABYLON.Vector3(sw*1.1, 0, 0));
            n = 5;
            for (let i = 0; i < n; ++i) {
                mesh = crBlock(p);
                stageMesh.push(mesh);
                p.x += 0.08*i;
                p.z -= sh_;
            }
            // 左レーン
            p = p0.add(new BABYLON.Vector3(-sw*1.1, 0, 0));
            n = 5;
            for (let i = 0; i < n; ++i) {
                mesh = crBlock(p);
                stageMesh.push(mesh);
                p.x -= 0.08*i;
                p.z -= sh_;
            }
        }

        if (stage == 24) {
            let mesh, n, p2, p0;
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            p.z += sh_;
            // 方向転換ユニット
            {
                p2 = p.clone();
                // 基礎
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sw+sd_, 0, 0));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sw_+sd, sh, 0));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p = p.add(new BABYLON.Vector3(sw+sd_+sh_, 0, 0));
            n = 5;
            for (let i = 0; i < n; ++i) {
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
                p.x += sh_;
            }
        }

        if (stage == 27) {
            let mesh, n, p2, p0;
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            p.x += sw_;
            p.z += sh_;
            // 折り返しユニット
            {
                // 基礎
                p2 = p.add(new BABYLON.Vector3(0, 0, sh-0.02));
                mesh = crBlock2(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // てこ
                p2 = p.add(new BABYLON.Vector3(0.1, sd, sh-sw_));
                mesh = crBlock2(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // ..
                p2 = p.add(new BABYLON.Vector3(sw_, sd*2, sh+sw_-sd_));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
//            p0 = p.add(new BABYLON.Vector3(0, 0, -sh_));
            p0 = p;
            // 右レーン
            p = p0.add(new BABYLON.Vector3(sw*1.1, 0, 0));
            n = 5;
            for (let i = 0; i < n; ++i) {
                mesh = crBlock(p);
                stageMesh.push(mesh);
                p.x += 0.08*i;
                p.z -= sh_;
            }
        }

        if (stage == 30) {
            let mesh, n, p2, p0;
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            p.z += sh_;
            // 折り返しユニット
            {
                // 基礎
                p2 = p.add(new BABYLON.Vector3(0, 0, sh_));
                mesh = crBlock3(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(0, 0, sh*1.5));
                mesh = crBlock2(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sw_, 0, sh*2+sd_));
                mesh = crBlock3(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sw_, 0, sh*2+sd_+sw_));
                mesh = crBlock2(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // triger .. 若干手前に
                if (g == 98) {
                    p2 = p.add(new BABYLON.Vector3(sw, sw, sh*2+sd_-0.016));
                } else {
                    p2 = p.add(new BABYLON.Vector3(sw, sw, sh*2+sd_-0.04));
                }
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p = p.add(new BABYLON.Vector3(sw, 0, sh*2+sd_-sh_));
            // 右レーン
            n = 5;
            for (let i = 0; i < n; ++i) {
                mesh = crBlock(p);
                stageMesh.push(mesh);
                p.x += 0.05*i + 0.1;
                p.z -= sh_;
            }
        }

        if (stage == 31) {
            let mesh, n, p2, p0;
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
//            p.z += sh_;
            // 方向転換ユニット
            {
                // 基礎
                p2 = p.add(new BABYLON.Vector3(sw, 0, sw_));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // .
                p2 = p.add(new BABYLON.Vector3(sw_, sh, sw_));
                mesh = crBlock2(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sw_, sh+sd, sw_));
                mesh = crBlock2(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p = p.add(new BABYLON.Vector3(sw+sh_, 0, sw_));
            // ライン延長
            n = 5;
            for (let i = 0; i < n; ++i) {
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
                p.x += sh_;
            }
            p.x += -sh_;
            // 方向転換ユニット (2)
            {
                // 基礎
                p2 = p.add(new BABYLON.Vector3(sw_, 0, sw));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // .
                p2 = p.add(new BABYLON.Vector3(sw_, sh, sw_));
                mesh = crBlock2(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sw_, sh+sd, sw_));
                mesh = crBlock2(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p = p.add(new BABYLON.Vector3(sw_, 0, sw+sh_));
            // ライン延長
            n = 5;
            for (let i = 0; i < n; ++i) {
                mesh = crBlock(p);
                stageMesh.push(mesh);
                p.z += sh_;
            }
        }

        if (stage == 33) {
            // タワー
            let mesh, n, p2, p0;
//            let isSafe = true; // こちらなら9Fまでいけるが、倒れない
            let isSafe = false;
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }

            p.z += sh_;

            if (1) {
                // トリガー
                p2 = p;
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(0, 0, sd));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                let g = p.add(new BABYLON.Vector3(0, 0, sh));
                let d = sh_-sd_, h;
                // タワー
                // 1F
                h = 0
                // p2 = g.add(new BABYLON.Vector3(0, h, -d-0.09));
                p2 = g.add(new BABYLON.Vector3(0, h, -d));
                mesh = crBlock3(p2, R90, isSafe);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = g.add(new BABYLON.Vector3(0, h, d));
                mesh = crBlock3(p2, R90, isSafe);
                mesh.material = mat1;
                stageMesh.push(mesh);
                for (let i = 0; i < 2; ++i) {
//                for (let i = 0; i < 4; ++i) {
                    // 偶数階
                    h += sw;
                    p2 = g.add(new BABYLON.Vector3(-d, h, 0));
                    mesh = crBlock3(p2, 0, isSafe);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                    p2 = g.add(new BABYLON.Vector3(d, h, 0));
                    mesh = crBlock3(p2, 0, isSafe);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                    // 奇数階
                    h += sw;
                    p2 = g.add(new BABYLON.Vector3(0, h, -d));
                    mesh = crBlock3(p2, R90, isSafe);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                    p2 = g.add(new BABYLON.Vector3(0, h, d));
                    mesh = crBlock3(p2, R90, isSafe);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                }
            }
        }

        if (stage == 35) {
            let mesh, n, p2, p0;
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }

            p.z += sh;
            // 交差部分
            {
                // トリガー
                p2 = p.add(new BABYLON.Vector3(-sd_, 0, 0));
                mesh = crBlock3(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(sd_, 0, 0));
                mesh = crBlock3(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(0, sw, -sd));
                mesh = crBlock3(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p.z += sd*1.5;
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 旋回
            p.z += sh_;
            let r = sw*4;
            let g = p.add(new BABYLON.Vector3(-r, 0, 0));
            for (let rad = 0; rad <= R270; rad += R20) {
                p2 = g.add(new BABYLON.Vector3(r*Math.cos(rad), 0, r*Math.sin(rad)));
                mesh = crBlock(p2, -rad);
                stageMesh.push(mesh);
            }
            p = p2.add(new BABYLON.Vector3(sh_*0.5, 0, 0));
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
            }
            // 交差後のライン
            p.x += sh_*1.2;
            n = 7;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                mesh.material = mat0;
                stageMesh.push(mesh);
            }
        }

        if (stage == 36) {
            let mesh, n, p2, p0;
            n = 5;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 交差部分
            // let g = p.add(new BABYLON.Vector3(0, 0, 0));
            let g = p.add(new BABYLON.Vector3(0, 0, sh_));
            if (1) {
                // ゲート
                // 1F
                let d = sh_ -sd_;
                p2 = p.add(new BABYLON.Vector3(-d, 0, 0));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(d, 0, 0));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 2F
                p2 = p.add(new BABYLON.Vector3(-d, sh, 0));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(d, sh, 0));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 3F
                p2 = p.add(new BABYLON.Vector3(0, sh*2, 0));
                mesh = crBlock2(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 旋回
            p.z += sh_;
            let r = sw*4;
            g = p.add(new BABYLON.Vector3(-r, 0, 0));
            for (let rad = 0; rad <= R270; rad += R15) {
                p2 = g.add(new BABYLON.Vector3(r*Math.cos(rad), 0, r*Math.sin(rad)));
                mesh = crBlock(p2, -rad);
                stageMesh.push(mesh);
            }
//            p = p2.add(new BABYLON.Vector3(sh_*0.5, 0, 0));
            p = p2.add(new BABYLON.Vector3(sh_*0, 0, 0));
            n = 2;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
            }
            // 交差後のライン
            p.x += sh*1.5;
            n = 7;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                mesh.material = mat0;
                stageMesh.push(mesh);
            }
        }

        if (stage == 37) {
            let mesh, n, p2, p0;
            n = 5;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 交差部分
            p = p.add(new BABYLON.Vector3(0, 0, sh_));
            if (1) {
                // 手前
                let d = sw_ -sd_;
                p2 = p.add(new BABYLON.Vector3(-d, 0, 0));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(d, 0, 0));
                mesh = crBlock(p2, R90);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 奥
                p2 = p.add(new BABYLON.Vector3(0, 0, sh_));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p.add(new BABYLON.Vector3(0, 0, sh));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p = p.add(new BABYLON.Vector3(0, 0, sh));
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 旋回
            p.z += sh_;
            let r = sw*4;
            g = p.add(new BABYLON.Vector3(-r, 0, 0));
            for (let rad = 0; rad <= R270; rad += R15) {
                p2 = g.add(new BABYLON.Vector3(r*Math.cos(rad), 0, r*Math.sin(rad)));
                mesh = crBlock(p2, -rad);
                stageMesh.push(mesh);
            }
            p = p2.add(new BABYLON.Vector3(sh_*0, 0, 0));
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
            }
            // 交差後のライン
            p.x += sh*0.5;
            n = 7;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                mesh.material = mat0;
                stageMesh.push(mesh);
            }
        }

        if (stage == 39) {
            let mesh, n, p2, p0, m, adj;
            n = 5;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 交差部分
            p.z += -sh_+sd;
            n = 4;
            for (let i = 0; i < n; ++i) {
                p.z += sh;
                mesh = crBlock3(p);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p = p.add(new BABYLON.Vector3(0, 0, sh_));
            // 旋回
            p.z += sd;
            let r = sw*4;
            g = p.add(new BABYLON.Vector3(-r, 0, 0));
            for (let rad = 0; rad <= R270; rad += R15) {
                p2 = g.add(new BABYLON.Vector3(r*Math.cos(rad), 0, r*Math.sin(rad)));
                if (rad == 0) {
                    // 1枚目は やや（倒れやすいよう）傾けておく
                    p2.z -= 0.07;
                    mesh = crBlock(p2);
                    // mesh.rotation = new BABYLON.Vector3(-0.02, 0, 0);
                    mesh.rotation = new BABYLON.Vector3(-0.1, 0, 0);
                    stageMesh.push(mesh);
                    continue;
                }
                mesh = crBlock(p2, -rad);
                stageMesh.push(mesh);
            }
            p = p2.add(new BABYLON.Vector3(sh_*0, 0, 0));
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                m = i+2, adj=sw_*(i+1);
                for (let j = 0; j < m; ++j) {
                    p2 = p.add(new BABYLON.Vector3(0, 0, j*sw-adj));
                    mesh = crBlock(p2, R90);
                    stageMesh.push(mesh);
                }
                // mesh = crBlock(p, R90);
            }
            // 交差後のライン
            // p.x += sh*0.5;
            p.x += sh*0.3;
            n = 7, m = 4, adj=sw_*3;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                for (let j = 0; j < m; ++j) {
                    p2 = p.add(new BABYLON.Vector3(0, 0, j*sw-adj));
                    mesh = crBlock(p2, R90);
                    mesh.material = mat0;
                    stageMesh.push(mesh);
                }
                // mesh = crBlock(p, R90);
                // mesh.material = mat0;
            }
        }

        if (stage == 201) {
        }

        if (stage == 202) {
            // 強Gは不可
            let mesh, n, p2, p0, m, adj;
            n = 5;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 交差部分
            p.z += sh_;
            {
                // 左足
                p2 = p.add(new BABYLON.Vector3(0, 0, 0));
                mesh = crBlock(p2, 0, true);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 右足
                p2 = p.add(new BABYLON.Vector3(sh, 0, 0));
                mesh = crBlock(p2, R90, true);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 上部
                n = 4;
                for (let i=0; i < n; ++i) {
                    p2 = p.add(new BABYLON.Vector3(sh_+sd_, sh+sw*i, 0));
                    mesh = crBlock3(p2, R90, true);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                }
            }
            p0 = p.add(new BABYLON.Vector3(0, 0, 0));
            // 右側
            p = p0.add(new BABYLON.Vector3(sh, 0, 0));
            n = 10;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
            }
            // 左側
            // p = p0.add(new BABYLON.Vector3(-sh, 0, 0));
            p = p0.add(new BABYLON.Vector3(0, 0, 0));
            n = 10;
            for (let i = 0; i < n; ++i) {
                p.x += -sh_;
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
            }
        }

        if (stage == 203) {
            // 倒れない？！
            let mesh, n, p2, p0, m, adj;
            n = 5;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 交差部分
            p0 = p.add(new BABYLON.Vector3(0, 0, sh_));
            let nlayer = 4;
            // let mmax = 5, d = sh-sd_; // 安定している？
            // let mmax = 5, d = sh-sd_/2;
            let mmax = 5, d = sh-sd_*0.45;
            for (let ilayer = 0; ilayer < nlayer; ++ilayer) {
                m = mmax - ilayer;
                for (let iblock = 0; iblock < m; ++iblock) {
                    p2 = p0.add(new BABYLON.Vector3(2*d*iblock+d*ilayer, sw*ilayer, 0));
                    mesh = crBlock3(p2, R90, true);
                    // mesh = crBlock3(p2, R90);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                }
            }
        }

        if (stage == 205) {
            // 壁
            let mesh, n, p2, p0, m, adj;
            n = 5;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 交差部分
            p0 = p.add(new BABYLON.Vector3(0, 0, sh_));
            // let nlayer = 5;
            // let mmax = Math.max(5, nlayer);
            let nlayer = 10;
            let mmax = Math.max(20, nlayer);
            let d = sh-sd, d_=d/2, nskip, rad;
            for (let ilayer = 0; ilayer < nlayer; ++ilayer) {
                nskip = ilayer;
                m = mmax - ilayer;
                p2 = p0.add(new BABYLON.Vector3(d_+nskip*d_, sw*ilayer, -nskip*d_));
                if ((ilayer%2) == 1) {
                    rad  = 0;
                } else {
                    rad  = R90;
                }
                for (let iblock = 0; iblock < m; ++iblock) {
                    mesh = crBlock3(p2, rad, true);
                    // mesh = crBlock3(p2, rad); // 自壊する
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                    p2 = p2.add(new BABYLON.Vector3(d, 0, -d));
                }
            }
        }

        if (stage == 207) {
            // 通常Gのみ/他Gは未対応、交差部分の積み上げが不安定に
            let mesh, n, p2, p0;
            n = 5;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 交差部分
            p = p.add(new BABYLON.Vector3(0, 0, sh_+sd));
            if (1) {
                // 手前
                let adj = -sw_ +sd_;
                for (let i = 0; i < 7; ++i) {
                    p2 = p.add(new BABYLON.Vector3(0, i*sd, 0));
                    mesh = crBlock2(p2);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                }
                // 奥
                p2 = p.add(new BABYLON.Vector3(0, 0, sh_ + sd));
                mesh = crBlock(p2);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p = p.add(new BABYLON.Vector3(0, 0, sh_+0.2));
            n = 2;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 旋回
            p.z += sh_;
            let r = sw*4;
            g = p.add(new BABYLON.Vector3(-r, 0, 0));
            for (let rad = 0; rad <= R270; rad += R15) {
                p2 = g.add(new BABYLON.Vector3(r*Math.cos(rad), 0, r*Math.sin(rad)));
                mesh = crBlock(p2, -rad);
                stageMesh.push(mesh);
            }
            p = p2.add(new BABYLON.Vector3(sh_*0, 0, 0));
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
            }
            // 交差後のライン
            p.x += sh*0.4;
            n = 7;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                mesh.material = mat0;
                stageMesh.push(mesh);
            }
        }


        if (stage == 209) {
            let mesh, n, p1, p2, p0;
            let isSafe = true;
//            let isSafe = false; // 5Fまでならこちらでok
            n = 10;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // やま
            p0 = p.add(new BABYLON.Vector3(0, 0, 0));
            if (1) {
                let xlist = [-sh_+sd_, sh_-sd_];
                // let nlayer=3, mmax=4, m, d = sh-sd_*0.45;
                let nlayer=3, mmax=4, m, d = sh-sd;
                for (let x of xlist) {
                    p1 = p0.add(new BABYLON.Vector3(x, 0, 0));
                    for (let ilayer = 0; ilayer < nlayer; ++ilayer) {
                        m = mmax - ilayer;
                        for (let iblock = 0; iblock < m; ++iblock) {
                            p2 = p1.add(new BABYLON.Vector3(0, sw*ilayer, -(2*d*iblock+d*ilayer)));
                            mesh = crBlock3(p2, 0, isSafe);
                            mesh.material = mat1;
                            stageMesh.push(mesh);
                        }
                    }
                }
                // 最奥
                p1 = p0.add(new BABYLON.Vector3(0, sw, sh_-sd_));
                mesh = crBlock3(p1, R90, isSafe);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 最奥の側面(3F
                for (let x of xlist) {
                    p1 = p0.add(new BABYLON.Vector3(x, sw*2, 0));
                    mesh = crBlock3(p1, 0, isSafe);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                }
                // 4F(わたり／左右への張り
                m = mmax + 1;
                p1 = p0.add(new BABYLON.Vector3(0, sw*3, -sh_+sd_));
                for (let i=0; i < m; ++i) {
                    p2 = p1.add(new BABYLON.Vector3(0, 0, -d*i));
                    mesh = crBlock3(p2, R90, isSafe);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                }
                // 5F(側面ごと
                p1 = p0.add(new BABYLON.Vector3(0, sw*4, sh_-sd_-d*1.5));
                m = mmax;
                for (let i=0; i < m; ++i) {
                    let x = xlist[i%2];
                    p2 = p1.add(new BABYLON.Vector3(x, 0, -d*i));
                    mesh = crBlock3(p2, 0, isSafe);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                }
                // 6F(わたり／左右への張り
                m = mmax - 1;
                p1 = p0.add(new BABYLON.Vector3(0, sw*5, -sh_+sd_-d));
                for (let i=0; i < m; ++i) {
                    p2 = p1.add(new BABYLON.Vector3(0, 0, -d*i));
                    mesh = crBlock3(p2, R90, isSafe);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                }
                // 7F(側面ごと
                p1 = p0.add(new BABYLON.Vector3(0, sw*6, sh_-sd_-d*2.5));
                m = mmax-2;
                for (let i=0; i < m; ++i) {
                    let x = xlist[i%2];
                    p2 = p1.add(new BABYLON.Vector3(x, 0, -d*i));
                    mesh = crBlock3(p2, 0, isSafe);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                }
                // 8F(わたり／左右への張り
                m = mmax - 3;
                p1 = p0.add(new BABYLON.Vector3(0, sw*7, -sh_+sd_-d*2));
                for (let i=0; i < m; ++i) {
                    p2 = p1.add(new BABYLON.Vector3(0, 0, -d*i));
                    mesh = crBlock3(p2, R90, isSafe);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                }
            }
        }

        if (stage == 210) {
            // 通常Gのみ/他Gは未対応、交差部分の積み上げが不安定に
            let mesh, n, p1, p2, p0;
//            let isSafe = true;
            let isSafe = false;
            n = 7;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 旋回
            p.z += sh_;
            let r = sw*4;
            g = p.add(new BABYLON.Vector3(-r, 0, 0));
            for (let rad = 0; rad <= R90; rad += R15) {
                p2 = g.add(new BABYLON.Vector3(r*Math.cos(rad), 0, r*Math.sin(rad)));
                mesh = crBlock(p2, -rad);
                stageMesh.push(mesh);
            }
            p = g.add(new BABYLON.Vector3(0, 0, r));
            n = 5;
            for (let i = 0; i < n; ++i) {
                p.x += -sh_;
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
            }
            g = p.add(new BABYLON.Vector3(-sh_, 0, -r));
            for (let rad = R90; rad <= R270; rad += R15) {
                p2 = g.add(new BABYLON.Vector3(r*Math.cos(rad), 0, r*Math.sin(rad)));
                mesh = crBlock(p2, -rad);
                stageMesh.push(mesh);
            }
            p = g.add(new BABYLON.Vector3(0, 0, -r));
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
            }
            // 交差部分・山
            if (1) {
                p0 = p.add(new BABYLON.Vector3(sh_, 0, 0));
                let nfloor=4, d=(sh-sd), m; // max = nfloor*2;
                for (let ifloor = 0; ifloor < nfloor; ++ifloor) {
                    m = (nfloor-ifloor)*2;
                    p1 = p0.add(new BABYLON.Vector3(d*ifloor, (sh+sd)*ifloor, 0));
                    // はしら
                    for (let i = 0; i < m; ++i) {
                        p2 = p1.add(new BABYLON.Vector3(d*i, 0, 0));
                        mesh = crBlock(p2, R90, isSafe);
                        mesh.material = mat1;
                        stageMesh.push(mesh);
                    }
                    // はしらの上の天井
                    m = m/2;
                    p1 = p1.add(new BABYLON.Vector3(d/2, sh, 0));
                    for (let i = 0; i < m; ++i) {
                        p2 = p1.add(new BABYLON.Vector3(d*2*i, 0, 0));
                        mesh = crBlock2(p2, R90, isSafe);
                        mesh.material = mat1;
                        stageMesh.push(mesh);
                    }
                }
            }
        }

        if (stage == 211) {
            // 交差
            let mesh, n, p2, p0;
            let isSafe = true;
//            let isSafe = false;
            n = 5;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            n = 2;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            // 旋回
            p.z += sh_;
            let r = sw*4;
            g = p.add(new BABYLON.Vector3(-r, 0, 0));
            for (let rad = 0; rad <= R270; rad += R15) {
                p2 = g.add(new BABYLON.Vector3(r*Math.cos(rad), 0, r*Math.sin(rad)));
                mesh = crBlock(p2, -rad);
                stageMesh.push(mesh);
            }
            p = p2.add(new BABYLON.Vector3(sh_*0, 0, 0));
            n = 2;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                stageMesh.push(mesh);
            }
            // 交差部分
            p0 = p.add(new BABYLON.Vector3(sh_, 0, 0));
            if (1) {
                p2 = p0;
                mesh = crBlock3(p2, 0, isSafe);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p0.add(new BABYLON.Vector3(0, sw, 0));
                mesh = crBlock(p2, R90, isSafe);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p = p.add(new BABYLON.Vector3(sh_*1.5, 0, 0));
            // 交差後のライン
            p.x += sh*0.4;
            n = 7;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                mesh = crBlock(p, R90);
                mesh.material = mat0;
                stageMesh.push(mesh);
            }
        }

        if (stage == 214) {
            // やま、通常Gでも不安定。5Fなら
            let mesh, n, p1, p2, p0;
            let isSafe = true;
//            let isSafe = false;
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            p0 = p.add(new BABYLON.Vector3(sh, 0, 0));
            // 山
            if (1) {
                let nfloor=7, d=(sh-sd), d_=d/2, ns, nt; // max = nfloor*2;
                // let nfloor=5, d=(sh-sd), d_=d/2, ns, nt; // max = nfloor*2;
                let vs = new BABYLON.Vector3(d, 0, d);
                let vt = new BABYLON.Vector3(d, 0, -d);
                let vs_ = new BABYLON.Vector3(d_, 0, d_);
                let vt_ = new BABYLON.Vector3(d_, 0, -d_);
                let rad, mat00;
                for (let ifloor = 0; ifloor < nfloor; ++ifloor) {
                    ns = nt = Math.ceil((nfloor-ifloor)/2);
                    if ((ifloor%2)==1) {
                        ++nt;
                    }
                    p1 = p0.add(new BABYLON.Vector3(0, sw*ifloor, 0));
                    if ((ifloor % 2) == 0) {
                        // // 0: -1,-1
                        // if (ifloor == 0) {
                        //     p1 = p1.add(vs_.scale(-1)).add(vt_.scale(-1));
                        // } else if (ifloor == 2) {
                        //     p1 = p1.add(vs_.scale(0)).add(vt_.scale(0));
                        // } else if (ifloor == 4) {
                        //     p1 = p1.add(vs_.scale(1)).add(vt_.scale(1));
                        // } else if (ifloor == 6) {
                        //     p1 = p1.add(vs_.scale(2)).add(vt_.scale(2));
                        // } else 
                        {
                            p1 = p1.add(vs_.scale(-1+ifloor/2)).add(vt_.scale(-1+ifloor/2));
                        }
                    } else {
                        // // 1: 0, -1
                        // if (ifloor == 1) {
                        //     p1 = p1.add(vs_.scale(0)).add(vt_.scale(-1));
                        // } else if (ifloor == 3) {
                        //     p1 = p1.add(vs_.scale(1)).add(vt_.scale(0));
                        // } else if (ifloor == 5) {
                        //     p1 = p1.add(vs_.scale(2)).add(vt_.scale(1));
                        // } else 
                        {
                            p1 = p1.add(vs_.scale((ifloor-1)/2)).add(vt_.scale(-1+(ifloor-1)/2));
                        }
                    }
                    if ((ifloor%2)==0) {
                        rad = 0;
                        mat00 = mat1;
                    } else {
                        rad = R90;
                        mat00 = mat0;
                    }
                    for (let is = 0; is < ns; ++is) {
                    for (let it = 0; it < nt; ++it) {
                        p2 = p1.add(vs.scale(is)).add(vt.scale(it));
                        if ((ifloor == 0) && (is == 0) && (it == 0)) {
                            p2 = p1.add(vs.scale(0)).add(vt.scale(-0.5));
                            mesh = crBlock3(p2, R90, isSafe);
                            mesh.material = mat00;
                            stageMesh.push(mesh);
                        } else {
                            mesh = crBlock3(p2, rad, isSafe);
                            mesh.material = mat00;
                            stageMesh.push(mesh);
                        }
                    }
                    }
                }
            }
        }

        if (stage == 216) {
            // 方向転換＋面
            let mesh, n, m, p0, p1, p2;
            let isSafe = true;
//            let isSafe = false;
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            p0 = p.add(new BABYLON.Vector3(0, 0, sh_));
            // 方向転換
            n = 4, m = 5;
            for (let ii = 0; ii < n; ++ii) {
                p1 = p0.add(new BABYLON.Vector3(0, 0, ii*sh*0.6));
                // p2 = p0.clone;
                p2 = p1.add(new BABYLON.Vector3(0, 0, 0));
                mesh = crBlock(p2, 0, isSafe);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p2 = p1.add(new BABYLON.Vector3(sh_*0.7, 0, sd_*1.4));
                mesh = crBlock(p2, R45, isSafe);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 右側
                p2 = p1.add(new BABYLON.Vector3(sh_*0.5, 0, sd_*1.5));
                for (let i = 0; i < m; ++i) {
                    p2.x += sh_;
                    mesh = crBlock(p2, R90, isSafe);
                    mesh.material = mat0;
                    stageMesh.push(mesh);
                }
            }
        }

        if (stage == 218) {
            // 方向転換＋2方向
            let mesh, n, m, p0, p1, p2;
//            let isSafe = true;
            let isSafe = false;
            n = 3;
            for (let i = 0; i < n; ++i) {
                p.z += sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            p0 = p.add(new BABYLON.Vector3(0, 0, sh_));
            {
                // 方向転換
                p1 = p0.add(new BABYLON.Vector3(0, 0, sw_));
                mesh = crBlock(p1, R90, isSafe);
                mesh.material = mat1;
                stageMesh.push(mesh);
                // 奥
                p1 = p0.add(new BABYLON.Vector3(-sw_, 0, sw+sd_));
                mesh = crBlock(p1, 0, isSafe);
                mesh.material = mat1;
                stageMesh.push(mesh);
                p1 = p0.add(new BABYLON.Vector3(sw_, 0, sw+sd_));
                mesh = crBlock(p1, 0, isSafe);
                mesh.material = mat1;
                stageMesh.push(mesh);
            }
            p0 = p.add(new BABYLON.Vector3(0, 0, sw*2.5+sd));
            // 右側
            p = p0.add(new BABYLON.Vector3(sd_, 0, 0));
            n = 8;
            for (let i = 0; i < n; ++i) {
                p.x += sh_;
                if (i == 0) {
                    // 1枚目は やや（倒れやすいよう）斜めに
                    mesh = crBlock(p, R90*0.9);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                } else {
                    mesh = crBlock(p, R90);
                    mesh.material = mat0;
                    stageMesh.push(mesh);
                }
            }
            // 左側
            p = p0.add(new BABYLON.Vector3(-sd_, 0, 0));
            n = 8;
            for (let i = 0; i < n; ++i) {
                p.x -= sh_;
                if (i == 0) {
                    // 1枚目は やや（倒れやすいよう）斜めに
                    mesh = crBlock(p, R90*1.1);
                    mesh.material = mat1;
                    stageMesh.push(mesh);
                } else {
                    mesh = crBlock(p, R90);
                    mesh.material = mat0;
                    stageMesh.push(mesh);
                }
            }
        }

        if (stage == 301) {
            // 壁
            // let p = new BABYLON.Vector3(0, 0, 0);
            let n = 30, n_=n-1, nfloor=6;
            // let n = 30, n_=n-1, nfloor=7; // 6階以上は自壊する
            for (let iz = 0; iz < n; ++iz) {
                p.z = iz*sh;
                let mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            p.y = sh;
            for (let iz = 0; iz < n_; ++iz) {
                p.z = iz*sh+sh_;
                let mesh = crBlock2(p);
                stageMesh.push(mesh);
            }
            // 2段目以降
            for (let ifloor = 2; ifloor < nfloor; ++ifloor) {
                p.y += sd;
                for (let iz = 0; iz < n; ++iz) {
                    p.z = iz*sh;
                    if (iz == 0) {
                        p.z += sd_;
                    } else if (iz == n_) {
                        p.z -= sd_;
                    }
                    let mesh = crBlock(p);
                    stageMesh.push(mesh);
                }
                p.y += sh;
                for (let iz = 0; iz < n_; ++iz) {
                    p.z = iz*sh+sh_;
                    let mesh = crBlock2(p);
                    stageMesh.push(mesh);
                }
            }
        }

        if (stage == 302) {
            // 面
            let mesh
            let p = new BABYLON.Vector3(0, 0, 0);
            for (let iz = -10; iz < 0; ++iz) {
                p.z = iz*sh_;
                mesh = crBlock(p);
                stageMesh.push(mesh);
            }
            for (let iz = 0; iz < 100; ++iz) {
                let n = iz+1;
                n = Math.floor(1.5*iz+1);
                n = Math.floor(2*(iz+1)+0.5);
                // n = Math.floor(2.2*(iz+0.2)+0.5); // xx 残る
                if (n >= 50) {
                    n = 50;
                }
                let adjx = -(n-1)*sw_;
                for (let ix=0; ix<n; ++ix) {
                    // p.x = (sw*1.2)*ix+adjx;
                    p.x = sw*ix+adjx;
                    p.z = iz*sh_;
                    mesh = crBlock(p);
                    stageMesh.push(mesh);
                }
            }
        }

    }

    createStage(stage);

    // ----------------------------------------------------------------------


    // デバッグ表示(debug)
    if (0) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }

    // キー入力処理
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ') {
                let p = mesh0.absolutePosition.add(new BABYLON.Vector3(0, sh/2, 0));
                let vvec = BABYLON.Vector3.Forward().scale(pushF);
                mesh0._agg.body.applyImpulse(vvec, p);
            }
            if (kbInfo.event.key == 'Enter') {
                createStage(stage);
            }
            if (kbInfo.event.key == 'n' || kbInfo.event.key == 'b') {
                let i = stageList.indexOf(stage);
                console.assert(i >= 0);
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






export var createScene = createScene_test_961;


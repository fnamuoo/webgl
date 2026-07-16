// ナノマシン・トランスフォーム

export var createScene_test_0011 = async function () {
    var scene = new BABYLON.Scene(engine);

    // Create camera and light
    var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(5, 10, 5), scene);
    var camera = new BABYLON.ArcRotateCamera("Camera", 1, 0.8, 8, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    camera.wheelDeltaPercentage = 0.01;
 
    let crPlane26 = function() {
        // 人型：天使
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 0.1;
        // 天使の輪
        let mesh1 = BABYLON.MeshBuilder.CreateTorus("", {diameter:0.7, thickness:0.1}, scene);
        mesh1.position.set(0.0, 1.2+adjy, 0.0);
        mesh1.parent = mesh;
        // 頭
        let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1}, scene);
        mesh2.position.set(0.0, 0.5+adjy, 0.0);
        mesh2.parent = mesh;
        // ボディ
        let mesh3 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.0, height:2, tessellation:4, diameterBottom:0}, scene);
        mesh3.position.set(0, -1+adjy, 0);
        mesh3.parent = mesh;
        for (let d of [-1, 1]) {
            // 羽
            let mesh4 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh4.rotation.y = 0.2*d;
            mesh4.position.set(0.9*d, -0.1+adjy, -0.2);
            mesh4.parent = mesh;
            let mesh41 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh41.rotation.y = 0.6*d;
            mesh41.position.set(1.5*d, -0.1+adjy, -0.5);
            mesh41.parent = mesh;
            let mesh42 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh42.rotation.y = 0.7*d;
            mesh42.position.set(1.3*d, -0.1+adjy, -0.6);
            mesh42.parent = mesh;
            let mesh43 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh43.rotation.y = 0.9*d;
            mesh43.position.set(1.1*d, -0.1+adjy, -0.65);
            mesh43.parent = mesh;
            let mesh44 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh44.rotation.y = 1.1*d;
            mesh44.position.set(0.9*d, -0.1+adjy, -0.65);
            mesh44.parent = mesh;
        }
        return mesh;
    }

    let crPlane1 = function() {
        // ドローン：グライダー風
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.3, height:0.3, depth:4}, scene);
        // キャノピー
        let mesh0 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:0.3, diameterY:0.6, diameterZ:1}, scene);
        mesh0.position.y = 0.15;
        mesh0.position.z = 1.5;
        mesh0.parent = mesh;
        // 主翼
        let mesh1 = BABYLON.MeshBuilder.CreateBox("", {width:4, height:0.1, depth:0.5}, scene);
        mesh1.position.z = 0.0;
        mesh1.parent = mesh;
        // 尾翼
        let mesh2 = BABYLON.MeshBuilder.CreateBox("", {width:1.2, height:0.1, depth:0.3}, scene);
        mesh2.position.z = -1.75;
        mesh2.parent = mesh;
        let mesh3 = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:1.2, depth:0.3}, scene);
        mesh3.position.z = -1.75;
        mesh3.parent = mesh;
        return mesh;
    }

    let funcAddPoint = function(mesh, pcs, N) {
        if (mesh.name == "trans") {
            // trans ＆ child(mesh) の場合
            let nmesh = mesh.getChildMeshes().length, nmesh_=nmesh-1;
            let nPart = Math.floor(N / nmesh), iloop=0;
            for (let _m of mesh.getChildMeshes()) {
                if (iloop++ == nmesh_) {
                    nPart = N - iloop* nmesh_;
                }
                pcs.addSurfacePoints(_m, nPart, 0);
            }
        } else {
            // mesh ＆ child(mesh) の場合
            let nmesh = mesh.getChildMeshes().length+1, nmesh_=nmesh-1, iloop=0;
            let nPart = Math.floor(N / nmesh);
            pcs.addSurfacePoints(mesh, nPart, BABYLON.PointColor.Stated, new BABYLON.Color3(1,1,1), 0);
            for (let _m of mesh.getChildMeshes()) {
                if (iloop++ == nmesh_) {
                    nPart = N - iloop* nmesh_;
                }
                pcs.addSurfacePoints(_m, nPart, BABYLON.PointColor.Stated, new BABYLON.Color3(1,1,1), 0);
            }
        }
    }

    let setVisibility = function(mesh, val) {
        mesh.visibility = val;
        for (let _m of mesh.getChildMeshes()) {
            _m.visibility = val;
        }
    };

    if (1) {
        // +球形表示
        // スピーディにタイミング調整
        // mesh.alpha ＋ 粒子（移動） ＋ mesh.alpha
        let mesh1 = crPlane1(); // ドローン：グライダー風
        let mesh3 = crPlane26(); // 人型：天使
        setVisibility(mesh1, 1);
        setVisibility(mesh3, 0);
        let N = 10000;
        let pcs1 = new BABYLON.PointsCloudSystem("", 2, scene);
        let pcs3 = new BABYLON.PointsCloudSystem("", 1, scene);
        funcAddPoint(mesh1, pcs1, N);
        funcAddPoint(mesh3, pcs3, N);
        let meshPCS1 = await pcs1.buildMeshAsync();
        meshPCS1.visibility=0;
        let meshPCS3 = await pcs3.buildMeshAsync();
        meshPCS3.visibility=0;

        let mesh9 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.5}, scene, true);
        mesh9.visibility=0;
        let pcs9 = new BABYLON.PointsCloudSystem("", 1, scene);
        pcs9.addSurfacePoints(mesh9, N, BABYLON.PointColor.Stated, new BABYLON.Color3(1,1,0.2), 0);
        await pcs9.buildMeshAsync();
        {
            let i = 0, n = 30, v;
            let fn1 = null, obs1 = null;
            let fn2 = null, obs2 = null;
            let fn3 = null, obs3 = null;
            // 粒子2 のstep1 処理（拡大・回転）の実体
            pcs9.updateParticle = function(particle) {
                particle.position.scaleInPlace(1.075);
                particle.rotation.y += 0.11;
            }
            fn1 = function() {
                // step1の演出
                if (i++ < n) {
                    let v1 = (n-i)/n, v0 = Math.min(1-v1+0.1, 1);
                    // 粒子1 をフェードイン
                    meshPCS1.visibility = v0;
                    // mesh1をフェードアウト
                    setVisibility(mesh1, v1);
                    // 粒子2 を拡大・回転
                    pcs9.setParticles();
                } else {
                    meshPCS1.visibility = 1;
                    // step1の演出の削除
                    scene.onBeforeRenderObservable.remove(obs1);
                    // step2の演出の登録
                    obs2 = scene.onBeforeRenderObservable.add(fn2);
                    i = 0; n = 120;
                    // step2での粒子1, 粒子2の動作登録
                    // 粒子1 のstep2 処理（移動）の実体
                    pcs1.updateParticle = function(particle) {
                        let idx = particle.idx;
                        let p3 = pcs3.particles[idx].position;
                        p3 = BABYLON.Vector3.Lerp(particle.position, p3, 0.05);
                        particle.position = p3;
                    }
                    // 粒子2 のstep1 処理（回転）の実体
                    pcs9.updateParticle = function(particle) {
                        particle.rotation.y += 0.1;
                    }
                }
            }
            fn2 = function() {
                // step2の演出
                if (i++ < n) {
                    // 粒子1 を移動
                    pcs1.setParticles();
                    // 粒子2 を回転
                    pcs9.setParticles();
                } else {
                    // step2の演出の削除
                    scene.onBeforeRenderObservable.remove(obs2);
                    // step3の演出の登録
                    obs3 = scene.onBeforeRenderObservable.add(fn3);
                    i = 0; n = 30;
                    // 粒子2 のstep2 処理（縮小・回転）の実体
                    pcs9.updateParticle = function(particle) {
                        particle.position.scaleInPlace(0.9);
                        particle.rotation.y += 0.1;
                    }
                }
            }
            fn3 = function() {
                if (i++ < n) {
                    let v3 = i/n, v0 = 1-v3;
                    // 粒子1 をフェードアウト
                    meshPCS1.visibility = v0;
                    // mesh2 をフェードイン
                    setVisibility(mesh3, v3);
                    // 粒子2 を縮小・回転
                    pcs9.setParticles();
                } else {
                    meshPCS1.visibility = 0;
                    // step3の演出の削除
                    scene.onBeforeRenderObservable.remove(obs3);
                    // 粒子1 の削除
                    pcs1.dispose();
                    pcs1 = null;
                    // 粒子2 の削除
                    pcs9.dispose();
                    pcs9 = null;
                }
            }
            // 最初の演出の登録
            obs1 = scene.onBeforeRenderObservable.add(fn1);
        }
    }

    return scene;
}

// ======================================================================
// ナノマシン・トランスフォーム
export var createScene = createScene_test_0011;


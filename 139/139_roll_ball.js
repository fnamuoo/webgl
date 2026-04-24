// Babylon.js で物理演算(havok)：中に重りのある球形を転がしてみる

// 操作
//   enter   : 再スタート
//   space/n : 次のステージ
//   b       : 前のステージ

export var createScene_test13 = async function () {
    const scene = new BABYLON.Scene(engine);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    let icamera = 1;
    let camera = null; // , camTrgMesh=null;
    let camTrgMeshList = []; // camTrgMesh候補
    let cameralist = [];
    let crCameraDef = function() {
        let _camera = new BABYLON.ArcRotateCamera("", 3 * Math.PI / 2, 7/16 * Math.PI, 20, BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        return _camera;
    }
    let crCamera01 = function() {
        let _camera = new BABYLON.ArcRotateCamera("", 2/2 * Math.PI, 7/16 * Math.PI, 40, BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        return _camera;
    }
    let crCamera02 = function() {
        let _camera = new BABYLON.ArcRotateCamera("", 3 * Math.PI / 2, 7/16 * Math.PI, 20, BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera2 = function() {
        // バードビュー：対象(myMesh)との距離を一定に保つ（旋回する／短距離をすすむ） .. 速度非依存
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let resetCameraView = function(camera_) {
        while (scene.activeCameras.length > 0) {
            scene.activeCameras.pop();
        }
        scene.activeCameras.push(camera_);
        for (let camera__ of cameralist) {
            camera__.dispose();
        }
        camera_.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
    }
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == -1) {
            camera = crCameraDef();
            resetCameraView(camera);
        }
        if (icamera == 0) {
            camera = crCameraDef();
            // 5分割cameraからの復帰用にリセット
            resetCameraView(camera)
        }
        if (icamera == 1) {
            // 5分割
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralist.push(crCamera2())
            cameralist.push(crCamera2())
            cameralist.push(crCamera2())
            cameralist.push(crCamera01())
            cameralist.push(crCamera02())
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
            }
            cameralist[0].viewport = new BABYLON.Viewport(0.0  , 0.7, 0.33, 0.3); // 上段：左
            cameralist[1].viewport = new BABYLON.Viewport(0.333, 0.7, 0.33, 0.3); // 上段：中
            cameralist[2].viewport = new BABYLON.Viewport(0.666, 0.7, 0.33, 0.3); // 上段：右
            cameralist[3].viewport = new BABYLON.Viewport(0.0, 0.0, 0.495, 0.695); // 下段：左
            cameralist[4].viewport = new BABYLON.Viewport(0.5, 0.0, 0.500, 0.695); // 下段：右
        }
        if ((icamera == 1) && (camTrgMeshList.length == 3)) {
            cameralist[0].lockedTarget = camTrgMeshList[0];
            cameralist[1].lockedTarget = camTrgMeshList[1];
            cameralist[2].lockedTarget = camTrgMeshList[2];
        }
    }
    let renderCamera2 = function(camera_, mesh_) {
        let vdir = camera_.position.subtract(mesh_.position).normalize().scale(5);
        vdir.y = 1;
        camera_.position = mesh_.position.add(vdir);
    }
    scene.onBeforeRenderObservable.add((scene) => {
        if (icamera == 1) {
            renderCamera2(cameralist[0], camTrgMeshList[0]);
            renderCamera2(cameralist[1], camTrgMeshList[1]);
            renderCamera2(cameralist[2], camTrgMeshList[2]);
        }
    })

    let meshAggInfo = [];

    let istage = 0, nstage = 6;
    let createStage = function(istage) {
        // 共通部分
        while (meshAggInfo.length > 0) {
            let mesh = meshAggInfo.pop();
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            mesh.dispose();
        }
        meshAggInfo = [];
        camTrgMeshList = [];

        {
            let grndW=100, grndH=100;
            let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
            mesh.position.y = -0.1;
            mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
            mesh.material.majorUnitFrequency = 1; 
            mesh.material.minorUnitVisibility  = 0.2;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
            meshAggInfo.push(mesh);
        }
        {
            const R15=Math.PI/12;
            // 下り坂
            let grndW=100, grndH=30;
            let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.physicsBody.disablePreStep = false;
            mesh.rotation = new BABYLON.Vector3(0, 0, R15);
            mesh.position.y = 2;
            meshAggInfo.push(mesh);

            // 障害物（凸）
            let mesh2 = BABYLON.MeshBuilder.CreateBox("", { width:0.2, height:0.2, depth:grndH }, scene);
            mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);
            mesh2.material = new BABYLON.StandardMaterial("", scene);
            mesh2.physicsBody.disablePreStep = false;
            mesh2.position.y = 2.2;
            meshAggInfo.push(mesh2);

            // 障害物（凸）
            let mesh3 = BABYLON.MeshBuilder.CreateBox("", { width:0.2, height:2, depth:grndH }, scene);
            mesh3._agg = new BABYLON.PhysicsAggregate(mesh3, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);
            mesh3.material = new BABYLON.StandardMaterial("", scene);
            mesh3.physicsBody.disablePreStep = false;
            mesh3.position.set(-50, 1, 0);
            meshAggInfo.push(mesh3);
        }

        let crSphere_1 = function(pSrc) {
            let mesh1 = BABYLON.MeshBuilder.CreateSphere("", { diameter: 2 }, scene);
            mesh1.material = new BABYLON.StandardMaterial("");
            mesh1.material.diffuseColor = BABYLON.Color3.Blue();
            mesh1.material.alpha=0.4;
            mesh1._agg = new BABYLON.PhysicsAggregate(mesh1, BABYLON.PhysicsShapeType.MESH, { mass: 2.5, restitution:0.1, friction:0.4}, scene);
            mesh1.physicsBody.disablePreStep = false;
            mesh1.position.copyFrom(pSrc); // 初期位置に移動
            meshAggInfo.push(mesh1);
            camTrgMeshList.push(mesh1);
        };
        let crSphere_2st = function(pSrc) {
            // 球の中に球をいれる（固定する）
            let mesh2 = BABYLON.MeshBuilder.CreateSphere("", { diameter: 2 }, scene);
            mesh2.material = new BABYLON.StandardMaterial("");
            mesh2.material.diffuseColor = BABYLON.Color3.Blue();
            mesh2.material.alpha=0.4;
            mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.MESH, { mass: 0.5, restitution:0.1, friction:0.4}, scene);
            mesh2.physicsBody.disablePreStep = false;
            mesh2.position.copyFrom(pSrc); // 初期位置に移動
            let mesh22 = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1 }, scene);
            mesh22.material = new BABYLON.StandardMaterial("");
            mesh22.material.diffuseColor = BABYLON.Color3.Blue();
            mesh22.material.alpha=0.8;
            mesh22._agg = new BABYLON.PhysicsAggregate(mesh22, BABYLON.PhysicsShapeType.SPHERE, { mass: 2.0, restitution:0.1, friction:0.3}, scene);
            mesh22.physicsBody.disablePreStep = false;
            mesh22.position.copyFrom(pSrc); // 初期位置に移動
            mesh22.position.y += 0.5;
            let joint = new BABYLON.LockConstraint(
                new BABYLON.Vector3(0, 0.5, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 1, 0),
                new BABYLON.Vector3(0, 1, 0),
                scene
            );
            mesh2._agg.body.addConstraint(mesh22._agg.body, joint);
            meshAggInfo.push(mesh2);
            meshAggInfo.push(mesh22);
            camTrgMeshList.push(mesh22);
        };
        let crSphere_2fr = function(pSrc) {
            // 球の中に球をいれる（固定しない）
            // (球の表面だけを物理形状とするためにMESH, SPHERE にすると中まで詰まった球体の物理形状に)
            let mesh3 = BABYLON.MeshBuilder.CreateSphere("", { diameter: 2 }, scene);
            mesh3.material = new BABYLON.StandardMaterial("");
            mesh3.material.diffuseColor = BABYLON.Color3.Blue();
            mesh3.material.alpha=0.4;
            mesh3._agg = new BABYLON.PhysicsAggregate(mesh3, BABYLON.PhysicsShapeType.MESH, { mass: 0.5, restitution:0.1, friction:0.4}, scene);
            mesh3.physicsBody.disablePreStep = false;
            mesh3.position.copyFrom(pSrc); // 初期位置に移動
            let mesh32 = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1 }, scene);
            mesh32.material = new BABYLON.StandardMaterial("");
            mesh32.material.diffuseColor = BABYLON.Color3.Blue();
            mesh32.material.alpha=0.8;
            mesh32._agg = new BABYLON.PhysicsAggregate(mesh32, BABYLON.PhysicsShapeType.SPHERE, { mass: 2.0, restitution:0.1, friction:0.3}, scene);
            mesh32.physicsBody.disablePreStep = false;
            mesh32.position.copyFrom(pSrc); // 初期位置に移動
            meshAggInfo.push(mesh3);
            meshAggInfo.push(mesh32);
            camTrgMeshList.push(mesh32);
        };

        let crEllipse_1 = function(pSrc) {
            let mesh1 = BABYLON.MeshBuilder.CreateSphere("", { diameterX:3, diameterY:2, diameterZ:2 }, scene);
            mesh1.material = new BABYLON.StandardMaterial("");
            mesh1.material.diffuseColor = BABYLON.Color3.Green();
            mesh1.material.alpha=0.4;
            mesh1._agg = new BABYLON.PhysicsAggregate(mesh1, BABYLON.PhysicsShapeType.MESH, { mass: 2.5, restitution:0.1, friction:0.4}, scene);
            mesh1.physicsBody.disablePreStep = false;
            mesh1.position.copyFrom(pSrc); // 初期位置に移動
            meshAggInfo.push(mesh1);
            camTrgMeshList.push(mesh1);
        };
        let crEllipse_2st = function(pSrc) {
            let mesh2 = BABYLON.MeshBuilder.CreateSphere("", { diameterX:3, diameterY:2, diameterZ:2 }, scene);
            mesh2.material = new BABYLON.StandardMaterial("");
            mesh2.material.diffuseColor = BABYLON.Color3.Green();
            mesh2.material.alpha=0.4;
            mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.MESH, { mass: 0.5, restitution:0.1, friction:0.4}, scene);
            mesh2.physicsBody.disablePreStep = false;
            mesh2.position.copyFrom(pSrc); // 初期位置に移動
            let mesh22 = BABYLON.MeshBuilder.CreateSphere("", { diameter:1 }, scene);
            mesh22.material = new BABYLON.StandardMaterial("");
            mesh22.material.diffuseColor = BABYLON.Color3.Green();
            mesh22.material.alpha=0.8;
            mesh22._agg = new BABYLON.PhysicsAggregate(mesh22, BABYLON.PhysicsShapeType.SPHERE, { mass: 2.0, restitution:0.1, friction:0.3}, scene);
            mesh22.physicsBody.disablePreStep = false;
            mesh22.position.copyFrom(pSrc); // 初期位置に移動
            mesh22.position.x -= 1.0;
            let joint = new BABYLON.LockConstraint(
                new BABYLON.Vector3(-1.0, 0, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 1, 0),
                new BABYLON.Vector3(0, 1, 0),
                scene
            );
            mesh2._agg.body.addConstraint(mesh22._agg.body, joint);
            meshAggInfo.push(mesh2);
            meshAggInfo.push(mesh22);
            camTrgMeshList.push(mesh22);
        };
        let crEllipse_2fr = function(pSrc) {
            // 楕円の中に球をいれる
            // (球の表面だけを物理形状とするためにMESH, SPHERE にすると中まで詰まった球体の物理形状に)
            let mesh3 = BABYLON.MeshBuilder.CreateSphere("", { diameterX:3, diameterY:2, diameterZ:2 }, scene);
            mesh3.material = new BABYLON.StandardMaterial("");
            mesh3.material.diffuseColor = BABYLON.Color3.Green();
            mesh3.material.alpha=0.4;
            mesh3._agg = new BABYLON.PhysicsAggregate(mesh3, BABYLON.PhysicsShapeType.MESH, { mass: 0.5, restitution:0.1, friction:0.4}, scene);
            mesh3.physicsBody.disablePreStep = false;
            mesh3.position.copyFrom(pSrc); // 初期位置に移動
            let mesh32 = BABYLON.MeshBuilder.CreateSphere("", { diameter:1 }, scene);
            mesh32.material = new BABYLON.StandardMaterial("");
            mesh32.material.diffuseColor = BABYLON.Color3.Green();
            mesh32.material.alpha=0.8;
            mesh32._agg = new BABYLON.PhysicsAggregate(mesh32, BABYLON.PhysicsShapeType.SPHERE, { mass: 2.0, restitution:0.1, friction:0.3}, scene);
            mesh32.physicsBody.disablePreStep = false;
            mesh32.position.copyFrom(pSrc); // 初期位置に移動
            meshAggInfo.push(mesh3);
            meshAggInfo.push(mesh32);
            camTrgMeshList.push(mesh32);
        };

        let crCapsule_1 = function(pSrc) {
            let mesh1 = BABYLON.MeshBuilder.CreateCapsule("", { height:4, radius:1.1 }, scene);
            mesh1.material = new BABYLON.StandardMaterial("");
            mesh1.material.diffuseColor = BABYLON.Color3.Red();
            mesh1.material.alpha=0.4;
            mesh1._agg = new BABYLON.PhysicsAggregate(mesh1, BABYLON.PhysicsShapeType.MESH, { mass: 2.5, restitution:0.1, friction:0.4}, scene);
            mesh1.physicsBody.disablePreStep = false;
            mesh1.position.copyFrom(pSrc); // 初期位置に移動
            meshAggInfo.push(mesh1);
            camTrgMeshList.push(mesh1);
        };
        let crCapsule_2st = function(pSrc) {
            // カプセルの中に球をいれる
            // (球の表面だけを物理形状とするためにMESH, SPHERE にすると中まで詰まった球体の物理形状に)
            let mesh2 = BABYLON.MeshBuilder.CreateCapsule("", { height:4, radius:1.1 }, scene);
            mesh2.material = new BABYLON.StandardMaterial("");
            mesh2.material.diffuseColor = BABYLON.Color3.Red();
            mesh2.material.alpha=0.4;
            mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.MESH, { mass: 0.5, restitution:0.1, friction:0.4}, scene);
            mesh2.physicsBody.disablePreStep = false;
            mesh2.position.copyFrom(pSrc); // 初期位置に移動
            let mesh21 = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1 }, scene);
            mesh21.material = new BABYLON.StandardMaterial("");
            mesh21.material.diffuseColor = BABYLON.Color3.Red();
            mesh21.material.alpha=0.8;
            mesh21._agg = new BABYLON.PhysicsAggregate(mesh21, BABYLON.PhysicsShapeType.SPHERE, { mass: 2.0, restitution:0.1, friction:0.3}, scene);
            mesh21.physicsBody.disablePreStep = false;
            mesh21.position.copyFrom(pSrc); // 初期位置に移動
            mesh21.position.y += 1.4;
            let joint = new BABYLON.LockConstraint(
                new BABYLON.Vector3(0, 1.4, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 1, 0),
                new BABYLON.Vector3(0, 1, 0),
                scene
            );
            mesh2._agg.body.addConstraint(mesh21._agg.body, joint);
            meshAggInfo.push(mesh2);
            meshAggInfo.push(mesh21);
            camTrgMeshList.push(mesh2);
        };
        let crCapsule_2fr = function(pSrc) {
            // カプセルの中に球をいれる
            // (球の表面だけを物理形状とするためにMESH, SPHERE にすると中まで詰まった球体の物理形状に)
            let mesh3 = BABYLON.MeshBuilder.CreateCapsule("", { height:4, radius:1.1 }, scene);
            mesh3.material = new BABYLON.StandardMaterial("");
            mesh3.material.diffuseColor = BABYLON.Color3.Red();
            mesh3.material.alpha=0.4;
            mesh3._agg = new BABYLON.PhysicsAggregate(mesh3, BABYLON.PhysicsShapeType.MESH, { mass: 0.5, restitution:0.1, friction:0.4}, scene);
            mesh3.physicsBody.disablePreStep = false;
            mesh3.position.copyFrom(pSrc); // 初期位置に移動
            let mesh31 = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1 }, scene);
            mesh31.material = new BABYLON.StandardMaterial("");
            mesh31.material.diffuseColor = BABYLON.Color3.Red();
            mesh31.material.alpha=0.8;
            mesh31._agg = new BABYLON.PhysicsAggregate(mesh31, BABYLON.PhysicsShapeType.SPHERE, { mass: 2.0, restitution:0.1, friction:0.3}, scene);
            mesh31.physicsBody.disablePreStep = false;
            mesh31.position.copyFrom(pSrc); // 初期位置に移動
            meshAggInfo.push(mesh3);
            meshAggInfo.push(mesh31);
            camTrgMeshList.push(mesh3);
        };

        let pSrc = new BABYLON.Vector3(40, 20+3, -7);

        // 移動体
        if (istage == 0) {
            pSrc.z = 7;
            crSphere_1(pSrc);
            pSrc.z = 0;
            crSphere_2st(pSrc);
            pSrc.z = -7;
            crSphere_2fr(pSrc);

        } else if (istage == 1) {
            pSrc.z = 7;
            crEllipse_1(pSrc);
            pSrc.z = 0;
            crEllipse_2st(pSrc)
            pSrc.z = -7;
            crEllipse_2fr(pSrc)

        } else if (istage == 2) {
            pSrc.z = 7;
            crCapsule_1(pSrc);
            pSrc.z = 0;
            crCapsule_2st(pSrc);
            pSrc.z = -7;
            crCapsule_2fr(pSrc);

        } else if (istage == 3) {
            pSrc.z = 7;
            crSphere_1(pSrc);
            pSrc.z = 0;
            crEllipse_1(pSrc)
            pSrc.z = -7;
            crCapsule_1(pSrc);

        } else if (istage == 4) {
            pSrc.z = 7;
            crSphere_2st(pSrc);
            pSrc.z = 0;
            crEllipse_2st(pSrc)
            pSrc.z = -7;
            crCapsule_2st(pSrc);

        } else if (istage == 5) {
            pSrc.z = 7;
            crSphere_2fr(pSrc);
            pSrc.z = 0;
            crEllipse_2fr(pSrc)
            pSrc.z = -7;
            crCapsule_2fr(pSrc);

        }
    }

    // --------------------------------------------------
    // ゴール判定
    let bCallNextStage = false;
    scene.registerAfterRender(function() {
        if (bCallNextStage == false) {
            let mesh = camTrgMeshList[camTrgMeshList.length-1];
            // 転がり落ちた頃合いを判定
            if (mesh.position.x < -10 || (mesh.position.x < 0 && mesh.position.y < 1)) {
                setNextStage();
                bCallNextStage = true;
            }
        }
    })

    // 次のステージに自動で変更
    let nextStage = function() {
        istage = (istage+1)%nstage;
        createStage(istage);
        changeCamera(icamera);
        bCallNextStage = false;
    }
    // 5 秒後にステージ変更を呼び出す
    let setNextStage = function() {
        setTimeout(nextStage, 5000);
    }

    // --------------------------------------------------
    
    // Input to direction
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ') {
                // let mesh = camTrgMeshList[camTrgMeshList.length-1];
                // console.log("mesh.x=", mesh.position.x);
                // 次のステージに
                nextStage();
            }
            if (kbInfo.event.key == 'Enter') {
                // 再描画（同じステージを最初から
                createStage(istage);
                changeCamera(icamera);
            } else if (kbInfo.event.key == 'n' || kbInfo.event.key == 'b') {
                if (kbInfo.event.key == 'n') {
                    istage = (istage+1) % nstage;
                } else {
                    istage = (istage+nstage-1) % nstage;
                }
                createStage(istage);
                changeCamera(icamera);
                bCallNextStage = false;
            }
        }
    });

    // --------------------------------------------------

    istage=3;

    createStage(istage);
    changeCamera(icamera);


    return scene;
}
export var createScene = createScene_test13;

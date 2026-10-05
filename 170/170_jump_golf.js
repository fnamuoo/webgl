// Babylon.js で物理演算(Havok) ：ジャンプ・ゴルフ

export var createScene_test_2299 = async function () {
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, Math.PI/3, 15, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // --- Havok初期化 ---
    const havokInstance = await HavokPhysics();
    const hk = new BABYLON.HavokPlugin(true, havokInstance);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), hk);

    // --- 地面 ---
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 40, height: 40 }, scene);
    ground.material = new BABYLON.StandardMaterial("");
    ground.material.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.1);
    ground.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
    new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX,
        { mass: 0, friction: 0.5, restitution: 0.3 }, scene);

    // --- ボール ---
    var ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
    ball.position.set(0, 0.5, 0);
    var ballAggregate = new BABYLON.PhysicsAggregate(ball, BABYLON.PhysicsShapeType.SPHERE,
        { mass: 1, friction: 0.4, restitution: 0.4 }, scene);

    // --- 接地判定 ---
    var isGrounded = true;
    scene.onBeforeRenderObservable.add(() => {
        var ray = new BABYLON.Ray(ball.position, BABYLON.Vector3.Down(), 0.6);
        var hit = scene.pickWithRay(ray, (m) => m === ground);
        var v = ballAggregate.body.getLinearVelocity();
        isGrounded = !!(hit && hit.hit) && v.length() < 0.5;
    });

    // --- ドラッグ操作 ---
    var isDragging = false;
    var maxDragDistance = 6;   // これ以上引っ張っても威力は頭打ち
    var powerScale = 2.0;      // ドラッグ距離→初速の変換係数
    var elevationFactor = 0.6; // 上方向へどれだけ配分するか
    var trajectoryLine = null;

    function getGroundPointFromPointer() {
        var plane = BABYLON.Plane.FromPositionAndNormal(ball.position, BABYLON.Vector3.Up());
        var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera);
        var dist = ray.intersectsPlane(plane);
        return dist === null ? null : ray.origin.add(ray.direction.scale(dist));
    }

    function computeImpulse(dragVector) {
        var horizontal = new BABYLON.Vector3(dragVector.x, 0, dragVector.z);
        var clampedLen = Math.min(horizontal.length(), maxDragDistance);
        var dir = horizontal.normalize();
        var power = clampedLen * powerScale;
        return dir.scale(power).add(new BABYLON.Vector3(0, power * elevationFactor, 0));
    }

    function showTrajectory(impulse) {
        var points = [];
        var pos = ball.position.clone();
        var vel = impulse.clone(); // mass=1のためimpulse=速度変化量として扱える
        var g = new BABYLON.Vector3(0, -9.81, 0);
        for (var t = 0; t < 2; t += 0.05) {
            points.push(pos.clone());
            vel.addInPlace(g.scale(0.05));
            pos.addInPlace(vel.scale(0.05));
            if (pos.y < 0) break;
        }
        if (trajectoryLine) trajectoryLine.dispose();
        trajectoryLine = BABYLON.MeshBuilder.CreateLines("traj", { points }, scene);
        trajectoryLine.color = new BABYLON.Color3(1, 1, 0);
    }

    scene.onPointerObservable.add((pi) => {
        switch (pi.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                if (isGrounded && pi.pickInfo.hit && pi.pickInfo.pickedMesh === ball) {
                    isDragging = true;
                    camera.detachControl(); // ドラッグ中はカメラ回転を止める
                }
                break;

            case BABYLON.PointerEventTypes.POINTERMOVE:
                if (!isDragging) return;
                var p = getGroundPointFromPointer();
                if (!p) return;
                var dragVector = ball.position.subtract(p); // 引っ張った逆方向に飛ばす
                showTrajectory(computeImpulse(dragVector));
                break;

            case BABYLON.PointerEventTypes.POINTERUP:
                if (!isDragging) return;
                isDragging = false;
                camera.attachControl(canvas, true);
                var release = getGroundPointFromPointer();
                if (release) {
                    var dragVector = ball.position.subtract(release);
                    if (dragVector.length() > 0.3) { // 誤操作防止のしきい値
                        ballAggregate.body.applyImpulse(computeImpulse(dragVector), ball.position);
                    }
                }
                if (trajectoryLine) { trajectoryLine.dispose(); trajectoryLine = null; }
                break;
        }
    });

    return scene;
};


// ######################################################################
// ######################################################################

    const ddbase1="./";
//    const ddbase1="https://raw.githubusercontent.com/fnamuoo/webgl/main/170";

        const iconPath1 = ddbase1+"textures/icon2w/ウッドのフリーアイコン3.png"
        const iconPath2 = ddbase1+"textures/icon2w/アイアンの無料アイコン.png"
        const iconPath3 = ddbase1+"textures/icon2w/パターアイコン1.png"

        const iconPath30 = ddbase1+"textures/icon2w/再生停止ボタン.png"
        const iconPath31 = ddbase1+"textures/icon2w/矢印ボタン　左1.png"
        const iconPath32 = ddbase1+"textures/icon2w/矢印ボタン　上1.png"
        const iconPath33 = ddbase1+"textures/icon2w/矢印ボタン　下1.png"
        const iconPath34 = ddbase1+"textures/icon2w/矢印ボタン　右1.png"

        const iconPath21 = ddbase1+"textures/icon2w/ゴルフアイコン2.png"
        const iconPath22 = ddbase1+"textures/icon2w/バドミントンアイコン2.png"
        const iconPath23 = ddbase1+"textures/icon2w/ボーリングの球のアイコン素材.png"

        const iconPath41 = ddbase1+"textures/icon2w/ハンドグリップ1.png"
        const iconPath42 = ddbase1+"textures/icon2w/ダンベルのアイコン素材.png"
        const iconPath43 = ddbase1+"textures/icon2w/ダンベルのアイコン素材 2.png"
        const iconPath44 = ddbase1+"textures/icon2w/マッチョのフリーアイコン3.png"

        const iconPath51 = ddbase1+"textures/icon2w/インフォメーションアイコン3 (2).png"
        const iconPath52 = ddbase1+"textures/icon2w/コントロールボタン (7).png"
        const iconPath53 = ddbase1+"textures/icon2w/リロードアイコン.png"
        const iconPath54 = ddbase1+"textures/icon2w/コントロールボタン (5).png"



// ######################################################################

export var createScene_test_2214 = async function () {
    var scene = new BABYLON.Scene(engine);
    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(0, 0, 0));
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // カーソルキーによる回転を削除
        return _camera;
    }
    let crCamera0 = function(meshTrg) {
        let _camera = new BABYLON.FollowCamera("", new BABYLON.Vector3(0, 2, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 2;
        _camera.heightOffset = 0.5;
        _camera.cameraAcceleration = 0.1; // 0.005;
        _camera.maxCameraSpeed = 5;
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // カーソルキーによる回転を削除
        return _camera;
    }
    let crCamera52 = function(meshTrg) {
        // ボール(meshTrg)を画面中心にしたカメラワーク
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 1, -4), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // カーソルキーによる回転を削除
        _camera._type = 52;
        return _camera;
    }
    let bcrCamera53Ini = true;
    let crCamera53 = function(meshTrg) {
        // ボール(meshTrg)を画面中心にしたカメラワーク＋移動方向に合わせてカメラ向きを変更
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 1, -4), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // カーソルキーによる回転を削除
        _camera._type = 53;
        if (bcrCamera53Ini == true) {
            bcrCamera53Ini = false;
            scene.onBeforeRenderObservable.add((scene) => {
                if (camera._type == 53 && camera.lockedTarget != null) {
                    // meshTrg とカメラ位置に応じて ヨー回転
                    let myMesh = camera.lockedTarget;
                    let vt = myMesh.position.subtract(camera.position).normalize();
                    let rad = Math.atan2(vt.x, vt.z);
                    camera.alpha = -rad - Math.PI/2;
                }
            })
        }
        return _camera;
    }

    let bcrCamera54Ini = true;
    let crCamera54 = function(meshTrg) {
        // ボール(meshTrg)を遅延させて追跡させるカメラワーク
        let mesh = BABYLON.MeshBuilder.CreateBox("", {size:0.01}); // ボールクリック時に選択しないよう小さくしておく
        mesh.visibility = 0; // 不可視（描画しない）
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 1, -4), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = mesh;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // カーソルキーによる回転を削除
        _camera._type = 54;
        _camera._meshTrg = mesh;
        _camera._meshOrg = meshTrg;
        if (bcrCamera54Ini == true) {
            bcrCamera54Ini = false;
            scene.onBeforeRenderObservable.add((scene) => {
                if (camera._type == 54 && camera.lockedTarget != null) {
                    // meshTrg を meshOrg に近づける
                    let vlerp = 0.1;
                    let vlv = BABYLON.Vector3.Lerp(camera._meshTrg.position, camera._meshOrg.position, vlerp);
                    camera._meshTrg.position.copyFrom(vlv);
                    // meshTrg とカメラ位置に応じて ヨー回転
                    let myMesh = camera.lockedTarget;
                    let vt = myMesh.position.subtract(camera.position).normalize();
                    let rad = Math.atan2(vt.x, vt.z);
                    camera.alpha = -rad - Math.PI/2;
                }
            })
        }
        return _camera;
    }
    let setLockedTarget2Camera = function(mesh) {
        if (camera == null) {
            return;
        }
        if ((camera._type == 5) || (camera._type == 52) || (camera._type == 53) || (camera._type == 54)) {
            camera.lockedTarget = mesh;
        }
    }
    // camera = crCameraDef(); // debug

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    var light2 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, -1, 0), scene);
    light2.intensity = 0.3;


    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    await BABYLON.InitializeCSG2Async();

    let meshStage = [];
    let stage2info = {
        1: {label:"Hole 1(壁)", par:3},
        2: {label:"Hole 2(島)", par:4},
        3: {label:"Hole 3(クランク)", par:5},
        4: {label:"Hole 4(バンカー)", par:3},
        5: {label:"Hole 5(山)", par:5},
        6: {label:"Hole 6(石柱)", par:4},
        7: {label:"Hole 7(反射)", par:4},
        8: {label:"Hole 8(超長距離)", par:5},
        9: {label:"Hole 9(ピラミッド)", par:4},
    };
    let createStage = function(istage) {
        let pst = null, ped = null, pbottom = null;
        while (meshStage.length > 0) {
            let mesh = meshStage.pop();
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            mesh.dispose();
        }
        meshStage = [];
        let crFlag = function(ped) {
            // -- FLAG
            // ポール
            let meshPole = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:2, depth:0.1}, scene);
            meshPole.position.copyFrom(ped);
            meshPole.position.y += 1.5;
            meshPole.material = new BABYLON.StandardMaterial("");
            meshPole.material.diffuseColor = BABYLON.Color3.White();
            meshPole.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
            meshPole._agg = new BABYLON.PhysicsAggregate(meshPole, BABYLON.PhysicsShapeType.BOX, { mass:0, friction:1, restitution:0.01}, scene);
            meshPole.position.y += -0.5;
            meshStage.push(meshPole);
            // フラッグ
            let meshFlag = BABYLON.MeshBuilder.CreateBox("", {width:1, height:1, depth:0.1}, scene);
            meshFlag.position.copyFrom(ped);
            meshFlag.position.x += 0.55;
            meshFlag.position.y += 1.5;
            meshFlag.material = new BABYLON.StandardMaterial("");
            meshFlag.material.diffuseColor = BABYLON.Color3.Red();
            meshFlag.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
            meshFlag._agg = new BABYLON.PhysicsAggregate(meshFlag, BABYLON.PhysicsShapeType.BOX, { mass:0, friction:1, restitution:0.01}, scene);
            meshStage.push(meshFlag);
        }
        let crStageFromGEO = function(geolist, ped) {
            for (let [sx, sy, sz ,px, py, pz, sField, fric, rest] of geolist) {
                if (sField == "green") {
                    let meshBase = BABYLON.MeshBuilder.CreateBox("", {width:sx, height:sy, depth:sz}, scene);
                    let csgBase = BABYLON.CSG2.FromMesh(meshBase);
                    let meshCup = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1, height:2,},scene,);
                    meshCup.position.set(Math.random()*10-5, 0, Math.random()*10-5);
                    ped.addInPlace(meshCup.position);
                    const csgCup = BABYLON.CSG2.FromMesh(meshCup);
                    csgBase = csgBase.subtract(csgCup);
                    let mesh = csgBase.toMesh("", scene);
                    meshBase.dispose();
                    meshCup.dispose();
                    mesh.position.set(px, py, pz);
                    mesh.material = new BABYLON.GridMaterial("", scene);
                    mesh.material.majorUnitFrequency = 10; 
                    mesh.material.minorUnitVisibility  = 0.2;
                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:fric, restitution:rest}, scene);
                    meshStage.push(mesh);
                    // -- FLAG
                    crFlag(ped);

                } else if (sField == "field") {
                    let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sx, height:sy, depth:sz}, scene);
                    mesh.position.set(px, py, pz);
                    mesh.material = new BABYLON.GridMaterial("", scene);
                    mesh.material.majorUnitFrequency = 10; 
                    mesh.material.minorUnitVisibility  = 0.2;
                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass:0, friction:fric, restitution:rest}, scene);
                    meshStage.push(mesh);

                } else if (sField == "bunker") {
                    // バンカー周辺の緑地も同じ摩擦
                    let meshBase = BABYLON.MeshBuilder.CreateBox("", {width:sx, height:sy, depth:sz}, scene);
                    // meshBase.material = new BABYLON.StandardMaterial("");
                    // meshBase.material.diffuseTexture = new BABYLON.Texture("./textures/grass.jpg");   
                    // meshBase.material.diffuseTexture.uScale = sz;
                    // meshBase.material.diffuseTexture.vScale = sx;
                    let csgBase = BABYLON.CSG2.FromMesh(meshBase);
                    let sy2 = sy*0.9, sy2_=sy2/2;
                    let meshSand = BABYLON.MeshBuilder.CreateSphere("", {diameterX:sx, diameterY:sy2, diameterZ:sz,},scene,);
                    meshSand.position.set(0, sy2_, 0);
                    // meshSand.material = new BABYLON.StandardMaterial("");
                    // meshSand.material.diffuseTexture = new BABYLON.Texture("./textures/sand.jpg");   
                    // meshSand.material.diffuseTexture.uScale = sz;
                    // meshSand.material.diffuseTexture.vScale = sx*2;
                    const csgSand = BABYLON.CSG2.FromMesh(meshSand);
                    let mesh = csgBase.subtract(csgSand).toMesh("");
                    meshBase.dispose();
                    meshSand.dispose();
                    mesh.position.set(px, py, pz);
                     mesh.material = new BABYLON.GridMaterial("", scene);
                     mesh.material.majorUnitFrequency = 10; 
                     mesh.material.minorUnitVisibility  = 0.2;
                    mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:fric, restitution:rest}, scene);
                    meshStage.push(mesh);

                } else if (sField == "bunker2") {
                    // バンカー周辺（緑地）と砂地で違う摩擦
                    let meshBase = BABYLON.MeshBuilder.CreateBox("", {width:sx, height:sy, depth:sz}, scene);
                    // meshBase.material = new BABYLON.StandardMaterial("");
                    // meshBase.material.diffuseTexture = new BABYLON.Texture("./textures/grass.jpg");   
                    // meshBase.material.diffuseTexture.uScale = sz;
                    // meshBase.material.diffuseTexture.vScale = sx;
                    let csgBase = BABYLON.CSG2.FromMesh(meshBase);
                    let sy2 = sy*0.9, sy2_=sy2/2, sy_=sy/2;
                    let meshSand = BABYLON.MeshBuilder.CreateSphere("", {diameterX:sx, diameterY:sy2, diameterZ:sz,},scene,);
                    meshSand.position.set(0, sy2_, 0);
                    // meshSand.material = new BABYLON.StandardMaterial("");
                    // meshSand.material.diffuseTexture = new BABYLON.Texture("./textures/sand.jpg");   
                    // meshSand.material.diffuseTexture.uScale = sz;
                    // meshSand.material.diffuseTexture.vScale = sx*2;
                    const csgSand = BABYLON.CSG2.FromMesh(meshSand);
                    let meshSand2 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:sx, diameterY:sy*10, diameterZ:sz,},scene,);
                    meshSand2.position.set(0, sy2_, 0);
                    const csgSand2 = BABYLON.CSG2.FromMesh(meshSand2);
                    let csgField = csgBase.subtract(csgSand);
                    let meshField = csgField.toMesh("", scene);
                    let csgBuker = csgBase.intersect(csgSand2).subtract(csgSand);
                    let meshBunker = csgBuker.toMesh("", scene);
                    meshBase.dispose();
                    meshSand.dispose();
                    meshSand2.dispose();
                    meshField.position.set(px, py, pz);
                     meshField.material = new BABYLON.GridMaterial("", scene);
                     meshField.material.majorUnitFrequency = 10; 
                     meshField.material.minorUnitVisibility  = 0.2;
                    meshField._agg = new BABYLON.PhysicsAggregate(meshField, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:fric[0], restitution:rest[0]}, scene);
                    meshStage.push(meshField);
                    meshBunker.position.set(px, py-0.01, pz);
                     meshBunker.material = new BABYLON.GridMaterial("", scene);
                     meshBunker.material.majorUnitFrequency = 10; 
                     meshBunker.material.minorUnitVisibility  = 0.2;
                    meshBunker._agg = new BABYLON.PhysicsAggregate(meshBunker, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:fric[1], restitution:rest[1]}, scene);
                    meshStage.push(meshBunker);

                } else if (sField == "pillar") {
                    // 石柱
                    let sx_=sx/2, sz_=sz/2;
                    let n = Math.floor(sx*sz*0.01);
                    for (let iloop = 0; iloop < n; ++iloop) {
                        let h = (Math.random()*0.4+0.6)*sy, h_=h/2;
                        let px2 = (Math.random()-1)*sx_;
                        let pz2 = (Math.random()-1)*sz_;
                        let mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1, height:h, tessellation:3},scene,);
                        mesh.position.set(px+px2, py+h_, pz+pz2);
                        mesh.material = new BABYLON.GridMaterial("", scene);
                        mesh.material.majorUnitFrequency = 10; 
                        mesh.material.minorUnitVisibility  = 0.2;
                        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:fric, restitution:rest}, scene);
                        meshStage.push(mesh);
                    }

                } else {
                    console.log("sField=", sField);
                }
            }
        }

        let crBlock = function(p, type=1) {
            let mesh = null, s = 10, mass = 1;
            if (type == 1) {
                mass = 1;
                mesh = BABYLON.MeshBuilder.CreateBox("", {size:s}, scene);
                mesh.position.copyFrom(p);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.emissiveColor = BABYLON.Color3.Black();
                mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                mesh.material.specularColor = BABYLON.Color3.Black();
                mesh.material.alpha = 0.4;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mass, friction:0.6, startAsleep:true}, scene);
            }
            return mesh;
        }

        if (istage == 0) {
            // 平面地面
            let size=200;
            let mesh = BABYLON.MeshBuilder.CreateGround("ground", {width: size, height: size}, scene);
            mesh.material = new BABYLON.GridMaterial("", scene);
            mesh.material.majorUnitFrequency = 10; 
            mesh.material.minorUnitVisibility  = 0.2;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:0.8, restitution:0.01}, scene);
            meshStage.push(mesh);
            pst = new BABYLON.Vector3(0, 1, 0);

        } else if (istage == 1) {
            // PAR 3
            pst = new BABYLON.Vector3(0, 1, 0);
            ped = new BABYLON.Vector3(0, 0, 70);
            let geolist = [
                // sx,sy,sz ,px,py,pz, isGreen, fric, rest
                [20, 1, 60, 0, -0.5, 20, "field", 0.8, 0.01],
                [40, 1, 40, ped.x, -0.5, ped.z, "green", 1, 0.3, 0.01],
                [40, 2, 1, 0, 1, 90, "field", 0.8, 0.3],
            ];
            crStageFromGEO(geolist, ped);

        } else if (istage == 2) {
            // PAR 4
            pst = new BABYLON.Vector3(0, 1, 0);
            ped = new BABYLON.Vector3(60, 0, 100);
            let geolist = [
                // sx,sy,sz ,px,py,pz, isGreen, fric, rest
                [20, 1, 220, 0, -0.5, 100, "field", 0.8, 0.01],
                [20, 1, 20, 20, -0.5, 100, "field", 0.8, 0.01],
                [60, 1, 60, ped.x, -0.5, ped.z, "green", 0.3, 0.01],
            ];
            crStageFromGEO(geolist, ped);

        } else if (istage == 3) {
            // PAR 5
            pst = new BABYLON.Vector3(0, 1, 0);
            ped = new BABYLON.Vector3(30, 0, 400);
            let geolist = [
                // sx,sy,sz ,px,py,pz, isGreen, fric, rest
                [20, 1, 220, 0, -0.5, 100, "field", 0.8, 0.01],
                [40, 1, 220, 30, -0.5, 240, "field", 0.8, 0.01],
                [100, 1, 100, ped.x, -0.5, ped.z, "green", 0.3, 0.01],
                [100, 2, 20, ped.x, -1, ped.z+60, "bunker", 1e4, 1e-4],
            ];
            crStageFromGEO(geolist, ped);

        } else if (istage == 4) {
            // PAR 3  １の壁の代わりにバンカー
            pst = new BABYLON.Vector3(0, 1, 0);
            ped = new BABYLON.Vector3(0, 0, 70);
            let geolist = [
                // sx,sy,sz ,px,py,pz, isGreen, fric, rest
                [20, 1, 60, 0, -0.5, 20, "field", 0.8, 0.01],
                [40, 1, 40, ped.x, -0.5, ped.z, "green", 1, 0.3, 0.01],
                [40, 2, 20, 0, -1, 100, "bunker", 1e4, 1e-4],
                [40, 2, 20, 0, -1, -20, "bunker2", [0.8,1e4], [0.01,1e-4]],
            ];
            crStageFromGEO(geolist, ped);

        } else if (istage == 5) {
            // PAR 5  山
            pst = new BABYLON.Vector3(0, 1, 0);
            ped = new BABYLON.Vector3(0, 0, 300);
            let geolist = [
                // sx,sy,sz ,px,py,pz, isGreen, fric, rest
                [40, 1, 20, -10, -0.5, 0, "field", 0.8, 0.01],
                [50, 1, 20, -15, -0.5, 20, "field", 0.8, 0.01],
                [40, 1, 20, -30, -0.5, 40, "field", 0.8, 0.01],
                [40, 1, 20, -40, -0.5, 60, "field", 0.8, 0.01],
                [40, 1, 40, -50, -0.5, 90, "field", 0.8, 0.01],
                [40, 1, 60, -60, -0.5, 140, "field", 0.8, 0.01],
                [40, 1, 40, -50, -0.5, 190, "field", 0.8, 0.01],
                [40, 1, 20, -40, -0.5, 220, "field", 0.8, 0.01],
                [40, 1, 20, -30, -0.5, 240, "field", 0.8, 0.01],
                [50, 1, 20, -15, -0.5, 260, "field", 0.8, 0.01],
                // 山
                [20, 10, 20, 0, 5, 40, "field", 0.8, 0.01],
                [40, 20, 20, 0, 10, 60, "field", 0.8, 0.01],
                [60, 30, 40, 0, 15, 90, "field", 0.8, 0.01],
                [80, 60, 60, 0, 30, 140, "field", 0.8, 0.01],
                [60, 30, 40, 0, 15, 190, "field", 0.8, 0.01],
                [40, 20, 20, 0, 10, 220, "field", 0.8, 0.01],
                [20, 10, 20, 0, 5, 240, "field", 0.8, 0.01],
                [60, 1, 60, ped.x, -0.5, ped.z, "green", 0.3, 0.01],
            ];
            crStageFromGEO(geolist, ped);

        } else if (istage == 6) {
            // PAR 4  石柱
            pst = new BABYLON.Vector3(0, 1, 0);
            ped = new BABYLON.Vector3(-50, 0, 180);
            let geolist = [
                // sx,sy,sz ,px,py,pz, isGreen, fric, rest
                [20, 1, 40, 0, -0.5, 10, "field", 0.8, 0.01],
                [40, 1, 40, -10, -0.5, 50, "field", 0.8, 0.01],
                [60, 1, 40, -20, -0.5, 90, "field", 0.8, 0.01],
                [80, 1, 40, -30, -0.5, 130, "field", 0.8, 0.01],
                [30, 1, 60, -5, -0.5, ped.z, "field", 0.8, 0.01],
                [60, 1, 60, ped.x, -0.5, ped.z, "green", 0.3, 0.01],
                [80, 20, 40, -30, 0, 150, "pillar", 0.8, 0.01],
                [60, 2, 20, ped.x, -1, 220, "bunker", 1e4, 1e-4],
                [20, 2, 60, -90, -1, ped.z, "bunker", 1e4, 1e-4],
            ];
            crStageFromGEO(geolist, ped);

        } else if (istage == 7) {
            // PAR 4  反射
            pst = new BABYLON.Vector3(0, 1, 0);
            ped = new BABYLON.Vector3(10, -6, 140);
            let geolist = [
                // sx,sy,sz ,px,py,pz, isGreen, fric, rest
                [10, 2, 40, 0, -1, 10, "field", 0.8, 0.01],
                [20, 2, 60, 10, -3, 60, "field", 0.8, 0.01],
                [20, 2, 40, 30, -5, 90, "field", 0.8, 0.01],
                [60, 2, 60, ped.x, -7, ped.z, "green", 0.3, 0.01],
                // ガード
                [10, 4, 40, -10, 0, 10, "field", 0.1, 0.9],
                [20, 4, 40,  15, 0, 10, "field", 0.1, 0.9],
                [20, 6, 60, -10, -1, 60, "field", 0.1, 0.9],
                [20, 6, 40, 30, -1, 50, "field", 0.1, 0.9],
                [60, 8, 20, -10, -2, 100, "field", 0.1, 0.9],
                [20, 8, 100, 50, -2, 120, "field", 0.1, 0.9],
                [60, 8, 20, 10, -2, 180, "field", 0.1, 0.9],
                [20, 8, 60, -30, -2, 140, "field", 0.1, 0.9],
            ];
            crStageFromGEO(geolist, ped);

        } else if (istage == 8) {
            // PAR 4  長距離
            pst = new BABYLON.Vector3(0, 1, 0);
            ped = new BABYLON.Vector3(0, 0, 3590+30);
            let fric = 1, rest=1e-4
            let geolist = [
                // sx,sy,sz ,px,py,pz, isGreen, fric, rest
                [10, 1, 100, 0, -0.5, 40, "field", fric, rest],
                [20, 1, 100, 0, -0.5, 140, "field", fric, rest],
                [30, 1, 200, 0, -0.5, 290, "field", fric, rest],
                [40, 1, 200, 0, -0.5, 490, "field", fric, rest],
                [50, 1, 400, 0, -0.5, 790, "field", fric, rest],
                [60, 1, 400, 0, -0.5, 1190, "field", fric, rest],
                [70, 1, 800, 0, -0.5, 1790, "field", fric, rest],
                [80, 1, 800, 0, -0.5, 2590, "field", fric, rest],
                [90, 1, 600, 0, -0.5, 3290, "field", fric, rest],
                [100, 1, 60, 0, -0.5, ped.z, "green", 0.3, 0.01],
                [100, 2, 20, 0, -1, ped.z+40, "bunker", 1e6, 1e-6],
                [100, 100, 1, 0, 50, ped.z+50, "field", fric, rest],
            ];
            crStageFromGEO(geolist, ped);

        } else if (istage == 9) {
            // PAR 4  ピラミッド
            pst = new BABYLON.Vector3(0, 1, 0);
            ped = new BABYLON.Vector3(30, 0, 150);
            let fric = 0.8, rest=1e-2;
            let geolist = [
                // sx,sy,sz ,px,py,pz, isGreen, fric, rest
                [20, 1, 40, 0, -0.5, 10, "field", fric, rest],
                [100, 1, 100, 30, -0.5, 70, "field", fric, rest],
                [100, 1, 60, 30, -0.5, ped.z, "green", 0.3, 0.01],
                [120, 2, 20, 30, -1, ped.z+40, "bunker", 1e6, 1e-6],
            ];
            crStageFromGEO(geolist, ped);
            {
                // 前方にピラミッド
                let adjx = 30, adjy = 5, adjz = 70;
                let nlayer = 6;
                let s = 10.5, mass = 1, ry=1.1, rxz = 0.8;
                let p = new BABYLON.Vector3(0, 0, 0);
                for (let ilayer = 0; ilayer < nlayer; ++ilayer) {
                    let nxz = nlayer - ilayer;
                    let sxz = ((nxz-1)*2)*s*rxz, sxz_ = sxz/2;
                    p.y = ilayer*s*ry+ adjy;
                    for (let iz = 0; iz < nxz; ++iz) {
                        p.z = (iz*2)*s*rxz-sxz_+adjz;
                        for (let ix = 0; ix < nxz; ++ix) {
                            p.x = (ix*2)*s*rxz-sxz_+adjx;
                            let mesh = crBlock(p, 1);
                            meshStage.push(mesh);
                        }
                    }
                }
            }
        }
        ped.y -= 1;
        pbottom = ped.clone(); pbottom.y -= 10;
        let courseInfo = stage2info[istage];
        setText2(courseInfo.label + " PAR " + courseInfo.par);
        return [pst, ped, pbottom];
    }
    let nextStage = function() {
        let i = stageList.indexOf(istage);
        i = (i+1) % nstage;
        istage = stageList[i];
        [pst, ped, pbottom] = createStage(istage);
        pcur = pst.clone();
        resetPosiBall(pcur);
        vhit = 0;
        bfall = false;
        setTimeout(resetPosiBall, 100, pcur);
    }
    let backStage = function() {
        let i = stageList.indexOf(istage);
        i = (i+nstage-1) % nstage;
        istage = stageList[i];
        [pst, ped, pbottom] = createStage(istage);
        pcur = pst.clone();
        resetPosiBall(pcur);
        vhit = 0;
        bfall = false;
    }

    // 3秒後にステージ変更を呼び出す
    let setNextStage = function(aftersec=3) {
        setTimeout(nextStage, aftersec*1000);
    }

    let crBall = function(posi) {
        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 0.2 }, scene);
        mesh.position.copyFrom(posi);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.White();
        mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        mesh.material.wireframe = 1;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, friction:0.6, restitution:0.1}, scene);
        mesh.physicsBody.setLinearDamping(0.01);
        mesh.physicsBody.setAngularDamping(10);
        mesh._impRate = 1;
        mesh._ldamp = 0.01;
        mesh.physicsBody.disablePreStep = false;
        return mesh;
    }
    let crBall3 = function(posi) {
        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 0.3 }, scene);
        mesh.position.copyFrom(posi);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Yellow();
        mesh.material.specularColor = BABYLON.Color3.Black();
        mesh.material.wireframe = 1;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, friction:0.6, restitution:0.1}, scene);
        mesh.physicsBody.setLinearDamping(0.5);
        mesh.physicsBody.setAngularDamping(10);
        mesh._impRate = 1;
        mesh._ldamp = 0.5;
        mesh.physicsBody.disablePreStep = false;
        return mesh;
    }
    let crBall4 = function(posi) {
        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 0.5 }, scene);
        mesh.position.copyFrom(posi);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Gray();
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass:10, friction:0.3, restitution:0.1}, scene);
        mesh.physicsBody.setLinearDamping(0.01);
        mesh.physicsBody.setAngularDamping(2);
        mesh._impRate = 10;
        mesh._ldamp = 0.01;
        mesh.physicsBody.disablePreStep = false;
        return mesh;
    }

    let changeBall = function(itype, pst) {
        let p0 = null;
        if (ball == null) {
            p0 = pst.clone();
        } else {
            p0 = ball.position.clone().add(pst);
            ball._agg.dispose();
            ball.dispose();
        }
        if (itype == 0) {
            ball = crBall(p0);
        } else if (itype == 1) {
            ball = crBall3(p0);
        } else if (itype == 2) {
            ball = crBall4(p0);
        }
        ball._vF = BABYLON.Vector3.Zero();
        ball._vB = BABYLON.Vector3.Zero();
        ball._spinloop = 0;
        setLockedTarget2Camera(ball);
        return ball;
    }
    let resetPosiBall = function(pcur) {
        ball.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        ball.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
        ball.position.copyFrom(pcur);
        bfall = false;
        // ボール位置からカップ位置を向かせる
        let vt = ped.subtract(ball.position).normalize();
        let rad = Math.atan2(vt.x, vt.z);
        camera.alpha = -rad - Math.PI/2;
    }


     let ball = null;

    // ------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // クラブの選択アイコン
    let golfClub = 0;
    {
        // const iconPath1 = "textures/icon2w/04.sport_game/ウッドのフリーアイコン3.png"
        // const iconPath2 = "textures/icon2w/04.sport_game/アイアンの無料アイコン.png"
        // const iconPath3 = "textures/icon2w/04.sport_game/パターアイコン1.png"
        let fpathList = [iconPath1, iconPath2, iconPath3 ];
        let guiIconList = [];
        for (let i = 0; i < fpathList.length; ++i) {
            let fpath = fpathList[i];
            let guiIcon = new BABYLON.GUI.Image("", fpath);
            guiIcon.width = "60px";
            guiIcon.height = "60px";
            guiIcon.top = "-10px";
            guiIcon.left = "" + (i*70+10)+ "px";
            guiIcon.autoScale = false
            guiIcon.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            guiIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            guiIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            advancedTexture.addControl(guiIcon);   
            guiIcon._v = i
            if (i == 0) {
                guiIcon.alpha = 1;
            } else {
                guiIcon.alpha = 0.3;
            }
            guiIconList.push(guiIcon);
        }
        for (let guiIcon of guiIconList) {
            guiIcon.onPointerUpObservable.add(function() {
                for (let _guiIcon of guiIconList) {
                    _guiIcon.alpha = 0.3;
                }
                guiIcon.alpha = 1;
                golfClub = guiIcon._v;
            });
        }
    }

    // ボールのスピン
    let ballSpin = 0;
    {
        // const iconPath30 = "textures/icon2w/31.symbol/再生停止ボタン.png"
        // const iconPath31 = "textures/icon2w/31.symbol/矢印ボタン　左1.png"
        // const iconPath32 = "textures/icon2w/31.symbol/矢印ボタン　上1.png"
        // const iconPath33 = "textures/icon2w/31.symbol/矢印ボタン　下1.png"
        // const iconPath34 = "textures/icon2w/31.symbol/矢印ボタン　右1.png"
        let fpathList = [iconPath30, iconPath31, iconPath32, iconPath33, iconPath34 ];
        let guiIconList = [];
        for (let i = 0; i < fpathList.length; ++i) {
            let fpath = fpathList[i];
            let guiIcon = new BABYLON.GUI.Image("", fpath);
            guiIcon.width = "60px";
            guiIcon.height = "60px"; // "60px";
            guiIcon.top = "-80px";
            guiIcon.left = "" + (i*70+10)+ "px";
            guiIcon.autoScale = false
            guiIcon.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            guiIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            guiIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            advancedTexture.addControl(guiIcon);   
            guiIcon._v = i
            if (i == 0) {
                guiIcon.alpha = 1;
            } else {
                guiIcon.alpha = 0.3;
            }
            guiIconList.push(guiIcon);
        }
        for (let guiIcon of guiIconList) {
            guiIcon.onPointerUpObservable.add(function() {
                for (let _guiIcon of guiIconList) {
                    _guiIcon.alpha = 0.3;
                }
                guiIcon.alpha = 1;
                ballSpin = guiIcon._v;
            });
        }
    }

    let ballType = 0;
    {
        // const iconPath21 = "textures/icon2w/04.sport_game/ゴルフアイコン2.png"
        // const iconPath22 = "textures/icon2w/04.sport_game/バドミントンアイコン2.png"
        // const iconPath23 = "textures/icon2w/04.sport_game/ボーリングの球のアイコン素材.png"
        let fpathList = [iconPath21, iconPath22, iconPath23 ];
        let guiIconList = [];
        for (let i = 0; i < fpathList.length; ++i) {
            let fpath = fpathList[i];
            let guiIcon = new BABYLON.GUI.Image("", fpath);
            guiIcon.width = "60px";
            guiIcon.height = "60px"; // "60px";
            guiIcon.top = "-10px";
            guiIcon.left = "-" + ((fpathList.length-i-1)*70+10)+ "px";
            guiIcon.autoScale = false
            guiIcon.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            guiIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            guiIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            advancedTexture.addControl(guiIcon);   
            guiIcon._v = i
            if (i == 0) {
                guiIcon.alpha = 1;
            } else {
                guiIcon.alpha = 0.3;
            }
            guiIconList.push(guiIcon);
        }
        for (let guiIcon of guiIconList) {
            guiIcon.onPointerUpObservable.add(function() {
                for (let _guiIcon of guiIconList) {
                    _guiIcon.alpha = 0.3;
                }
                guiIcon.alpha = 1;
                ballType = guiIcon._v;
                changeBall(ballType, pst);
            });
        }
    }

    // ボールのスピン
    let vPower = 1;
    {
        // const iconPath41 = "textures/icon2w/21.tool/ハンドグリップ1.png"
        // const iconPath42 = "textures/icon2w/21.tool/ダンベルのアイコン素材.png"
        // const iconPath43 = "textures/icon2w/21.tool/ダンベルのアイコン素材 2.png"
        // const iconPath44 = "textures/icon2w/02.human/マッチョのフリーアイコン3.png"
        let fpathList = [iconPath41, iconPath42, iconPath43, iconPath44 ];
        let vlist = [1, 2, 5, 10];
        let guiIconList = [];
        for (let i = 0; i < fpathList.length; ++i) {
            let fpath = fpathList[i];
            let guiIcon = new BABYLON.GUI.Image("", fpath);
            guiIcon.width = "60px";
            guiIcon.height = "60px"; // "60px";
            guiIcon.top = "-150px";
            guiIcon.left = "" + (i*70+10)+ "px";
            guiIcon.autoScale = false
            guiIcon.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            guiIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            guiIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            advancedTexture.addControl(guiIcon);   
            guiIcon._v = vlist[i];
            if (i == 0) {
                guiIcon.alpha = 1;
            } else {
                guiIcon.alpha = 0.3;
            }
            guiIconList.push(guiIcon);
        }
        for (let guiIcon of guiIconList) {
            guiIcon.onPointerUpObservable.add(function() {
                for (let _guiIcon of guiIconList) {
                    _guiIcon.alpha = 0.3;
                }
                guiIcon.alpha = 1;
                vPower = guiIcon._v;
            });
        }
    }


    {
        // const iconPath51 = "textures/icon2w/31.symbol/インフォメーションアイコン3 (2).png"
        // const iconPath52 = "textures/icon2w/31.symbol/コントロールボタン (7).png"
        // const iconPath53 = "textures/icon2w/31.symbol/リロードアイコン.png"
        // const iconPath54 = "textures/icon2w/31.symbol/コントロールボタン (5).png"
        let fpathList = [iconPath51, iconPath52, iconPath53, iconPath54 ];
        let guiIconList = [];
        for (let i = 0; i < fpathList.length; ++i) {
            let fpath = fpathList[i];
            let guiIcon = new BABYLON.GUI.Image("", fpath);
            guiIcon.width = "60px";
            guiIcon.height = "60px"; // "60px";
            guiIcon.top = "10px";
            guiIcon.left = "-" + ((fpathList.length-i-1)*70+10)+ "px";
            guiIcon.autoScale = false
            guiIcon.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            guiIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            guiIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            advancedTexture.addControl(guiIcon);   
            guiIconList.push(guiIcon);
        }
        {
            guiIconList[0].onPointerUpObservable.add(function() {
                console.log("info:");
                console.log("  stage=", istage, ", hit=", vhit);
                console.log("  scoreBoard=", scoreBoard);
                let courseInfo = stage2info[istage];
                let stext = courseInfo.label + " PAR " + courseInfo.par + " / " + vhit + " 打";
                setText2(stext, 5);
            });
        }
        {
            guiIconList[1].onPointerUpObservable.add(function() {
                console.log("back stage:");
                backStage();
            });
        }
        {
            guiIconList[2].onPointerUpObservable.add(function() {
                console.log("reload:");
                [pst, ped, pbottom] = createStage(istage);
                pcur = pst.clone();
                vhit = 0;
                resetPosiBall(pcur);
            });
        }
        {
            guiIconList[3].onPointerUpObservable.add(function() {
                console.log("next stage:");
                nextStage();
            });
        }
    }

    // ------------------------------
    // メッセージ（数秒後にフェードアウト）
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Ready!";
    text2.color = "white";
    text2.fontSize = 24;
    text2.height = "36px";
    text2.top = "100px";
    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text2);

    let clearText2 = function() {
        text2.text = "";
    }
    let setText2 = function(val, sdelay=2) {
        text2.text = "" + val;
        setTimeout(clearText2, sdelay*1000); // 2[sec]
    }


    // 静止判定
    // let isStopV = true;
    let isStop = function() {
        let vsq = ball._agg.body.getLinearVelocity().lengthSquared();
        return (vsq < 0.2);
    }

    // --- ドラッグ操作 ---
    var isDragging = false;
    var maxDragDistance = 6;   // これ以上引っ張っても威力は頭打ち
    var powerScale = 2.0;      // ドラッグ距離→初速の変換係数
    var elevationFactor = 0.6; // 上方向へどれだけ配分するか
    var trajectoryLine = null; // ドラッグ時にボールの軌道(想定)を表示用Line
    // golfClub ->  powerScale, elevationFactor
    let club2factor = [
        [14.0, 0.3],
        [6.0, 0.7],
        [4.0, 0.01],
    ];

    // マウス位置から地面位置を取得
    function getGroundPointFromPointer() {
        var plane = BABYLON.Plane.FromPositionAndNormal(ball.position, BABYLON.Vector3.Up());
        var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera);
        var dist = ray.intersectsPlane(plane);
        return dist === null ? null : ray.origin.add(ray.direction.scale(dist));
    }

    // 引数dragVector(カーソル位置からボール位置のベクトル)から、implus ベクトルを算出
    function computeImpulse(dragVector) {
        [powerScale, elevationFactor] = club2factor[golfClub]
        var horizontal = new BABYLON.Vector3(dragVector.x, 0, dragVector.z);
        var clampedLen = Math.min(horizontal.length(), maxDragDistance);
        var dir = horizontal.normalize();
        // var power = clampedLen * powerScale;
        var power = clampedLen * powerScale * ball._impRate * vPower;
        return dir.scale(power).add(new BABYLON.Vector3(0, power * elevationFactor, 0));
    }

    // ボールの想定移動の軌道を表示
    function showTrajectory(impulse) {
        var points = [];
        if (golfClub <= 1) {
            // ウッド、アイアン
            var pos = ball.position.clone();
            var vel = impulse.scale(1/ball._impRate*0.9);
            var g = new BABYLON.Vector3(0, -9.8, 0);
            let tstep = 0.02;
            for (var t = 0; t < 2; t += tstep) {
                points.push(pos.clone());
                vel.addInPlace(g.scale(tstep));
                pos.addInPlace(vel.scale(tstep));
                if (pos.y < ball.position.y) break;
            }
        } else {
            // パター
            var pos = ball.position.clone();
            var vel = impulse.scale(1/ball._impRate*6);
            let tstep = 0.02, tmax = 0.25;
            for (var t = 0; t < tmax; t += tstep) {
                points.push(pos.clone());
                pos.addInPlace(vel.scale(tstep));
            }
        }
        if (trajectoryLine) trajectoryLine.dispose();
        trajectoryLine = BABYLON.MeshBuilder.CreateLines("", { points }, scene);
        trajectoryLine.color = new BABYLON.Color3(1, 1, 0);
    }

    scene.onPointerObservable.add((pi) => {
        switch (pi.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                // ボールをクリックしてドラックを開始する
                if (isStop() && pi.pickInfo.hit && pi.pickInfo.pickedMesh === ball) {
                    isDragging = true;
                    camera.detachControl(); // ドラッグ中はカメラ回転を止める
                }
                break;

            case BABYLON.PointerEventTypes.POINTERMOVE:
                if (!isDragging) return;
                var p = getGroundPointFromPointer();
                if (!p) return;
                var dragVector = ball.position.subtract(p); // 引っ張った逆方向に飛ばす
                showTrajectory(computeImpulse(dragVector)); // ボールの想定移動の軌道を表示
                break;

            case BABYLON.PointerEventTypes.POINTERUP:
                if (!isDragging) return;
                isDragging = false;
                camera.attachControl(canvas, true);
                if (pi.pickInfo.hit && pi.pickInfo.pickedMesh === ball) {
                    if (trajectoryLine) { trajectoryLine.dispose(); trajectoryLine = null; }
                    return;
                }
                var p = getGroundPointFromPointer();
                if (p) {
                    var dragVector = ball.position.subtract(p);
                    if (dragVector.length() > 0.3) { // 誤操作防止のしきい値
                        ball._agg.body.applyImpulse(computeImpulse(dragVector), ball.position);
                        dragVector.y = 0;
                        dragVector.normalize();
                        ball._vF = dragVector.clone();
                        ball._vB = dragVector.cross(BABYLON.Vector3.Up()).normalize();
                        ball._spinloop = 100;
                        if (ballSpin == 3) {
                            // 下回転
                            ball._spinloop += 100;
                        }
                        ++vhit;
                        pcur = ball.position.clone();
                        pcur.y += 1;
                    }
                }
                if (trajectoryLine) { trajectoryLine.dispose(); trajectoryLine = null; }
                break;
        }
    });

    let bfall = false;
    scene.onBeforeRenderObservable.add((scene) => {
        if (ball == null) {
            return;
        }
        if (bfall == false) {
            // カップインor場外判定
            let distSq = ball.position.subtract(ped).lengthSquared();
            if (distSq <= 0.25) {
                // カップイン
                scoreBoard[istage] = vhit;
                holeClearFlag[istage] = 1;
                bfall = true;
                if (Object.keys(holeClearFlag).length == stageList.length) {
                    let vhittotal = 0;
                    for (const [key, value] of Object.entries(scoreBoard)) {
                        console.log(`${key}: ${value}`);
                        vhittotal += value;
                    }

                    let stext = "ホールアウト／スコア: " + vhittotal;
                    setText2(stext, 10);
                    holeClearFlag = {};
                    resetPosiBall(pcur);
                } else {
                    let stext = "カップイン: " + vhit + " 打";
                    setText2(stext);
                    setNextStage();
                }
            } else if (ball.position.y < pbottom.y) {
                // 場外/オービー
                let stext = "OB (;_;)";
                setText2(stext);
                resetPosiBall(pcur);
            }
        }
        let vsq = ball._agg.body.getLinearVelocity().lengthSquared();
        if (vsq < 0.01) {
            // 移動が小さいときは静止させる .. バンカー内で移動させないように
            ball.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
            ball.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
        }
        // 打撃時のスピン操作
        if (ball._spinloop <= 0) {
            return;
        }
        --(ball._spinloop);
        if (vsq > 10) {
            if (ballSpin == 1) {
                // 左回転
                console.log("left-spin");
                ball._agg.body.applyImpulse(ball._vB.scale(0.1), ball.position);

            } else if (ballSpin == 2) {
                // 上回転
                console.log("top-spin");
                vsq = Math.sqrt(vsq)*0.1;
                let vroty = ball._vB.scale(-vsq);
                ball._agg.body.applyAngularImpulse(vroty);

            } else if (ballSpin == 3) {
                // 下回転
                console.log("back-spin");
                vsq *= 10000;
                let vroty = ball._vB.scale(vsq);
                ball._agg.body.applyAngularImpulse(vroty);
                ball._agg.body.applyImpulse(ball._vF.scale(-0.05), ball.position);

            } else if (ballSpin == 4) {
                // 右回転
                console.log("right-spin");
                ball._agg.body.applyImpulse(ball._vB.scale(-0.1), ball.position);
            }
        }
    })

    // ----------------------------------------

    let scoreBoard = {};
    let holeClearFlag = {};
    let vhit = 0;

    let istage = 0; // 平面
    let stageList = [1 ,2, 3, 4, 5 ,6, 7, 8];
    let nstage = stageList.length;
    istage = 1; // PAR_3
    // istage = 2; // PAR_4
    // istage = 3; // PAR_5
    // istage = 4; // PAR_3(バンカー
    // istage = 5; // PAR_5(山
    // istage = 6; // PAR_4(石柱
    // istage = 7; // PAR_4(反射
    // istage = 8; // PAR_x 長距離
    // istage = 9; // ピラミッド

    let pst, ped, pbottom, pcur;
    [pst, ped, pbottom] = createStage(istage);
    pcur = pst.clone();
    vhit = 0;
    bfall = false;

    ball = changeBall(ballType, pst);
//    camera = crCameraDef(); // debug
//    camera = crCamera0(ball);  // Follow test
//    camera = crCamera53(ball); 
    camera = crCamera54(ball);


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
}


// ######################################################################
// ######################################################################
// ######################################################################
// ######################################################################

// ######################################################################

// export var createScene = createScene_test_2299; // サンプル
 export var createScene = createScene_test_2214;

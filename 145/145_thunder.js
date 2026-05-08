// かみなり・いなずま

//    let skyboxTextPath = "textures/skybox";
let skyboxTextPath = "../111/textures/skybox";

var createScene_test_4 = function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1)
    const camera = new BABYLON.ArcRotateCamera('', 0, 0, 0, new BABYLON.Vector3(0, 0, -600), scene, true);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);

    const glow = new BABYLON.GlowLayer('glow', scene, {blurKernelSize: 32,});
    glow.intensity = 3;

    let pointslist = [];
    let colorslist = [];
    let widthslist = [];
    let meshlist = [];

    const drawLighting = () => {
        const startX = 0
        const startY = 200;
        const sz = 0;
        let ci = 0;
        let si = 0;
        const sc = Math.random() * 100; // Chance for Splits to split again (%)
        const ssc = Math.random() * 100; // Chance for Splits in the Main Lightning (%)
        const splits = Math.random() * 30; // Main Lightning Length
        const subSplits = Math.random() * 30; // Splits Length
        const startWidth = Math.random() * 3 + 4;
        const startLength = Math.random() * 40 + 70;
        const color1 = BABYLON.Color3.FromHSV(40, 0.5, 0.5)

        function split(sx, sy, width, len) {
            // 確率で分岐する場合の処理
            let points = [];
            let colors = [];
            let widths = [];
            // 終点
            var cx = sx + (Math.random() * len) - len / 2;
            var cy = sy - (Math.random() * len / 2);
            // 色／太さ／点（始点・終点）を格納
            colors.push(color1)
            colors.push(color1)
            widths.push(width, width, width, width)
            points.push([sx, sy, sz, cx, cy, sz])
            if (si < subSplits) {
                si += 1;
                // 終点を始点にして再帰（少し細く、短くする
                split(cx, cy, width * 0.9, len * 0.95);
                // 分岐：確率で再帰
                Math.random() * 100 < ssc ? split(cx, cy, width * 0.9, len * 0.95) : 0;
            }
            // 線分の描画情報をスタック
            pointslist.push(points);
            colorslist.push(colors);
            widthslist.push(widths);
        }

        function getLightingLines(sx, sy, width, len) {
            let points = [];
            let colors = [];
            let widths = [];
            // 終点
            var cx = sx + (Math.random() * len) - len / 2;
            var cy = sy - (Math.random() * len / 2);
            // 色／太さ／点（始点・終点）を格納
            colors.push(color1)
            colors.push(color1)
            widths.push(width, width, width, width)
            points.push([sx, sy, sz, cx, cy, sz])
            si = 0;
            // 確率で分岐させる
            Math.random() * 100 < sc ? split(cx, cy, width * 0.9, len * 0.95) : 0;
            if (ci < splits) {
                ci += 1;
                // 次の線分を作る
                getLightingLines(cx, cy, width * 0.9, len * 0.95);
            }
            // 線分の描画情報をスタック
            pointslist.push(points);
            colorslist.push(colors);
            widthslist.push(widths);
        }

        getLightingLines(startX, startY, startWidth, startLength)

    }

    let skybox = null;
    if (1) {
        // Skybox
        skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:4000.0}, scene);
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }

    drawLighting()

    let iloop = 0;
    scene.onBeforeRenderObservable.add((scene) => {
        if (pointslist.length > 0) {
            let icount = 0, ncount = Math.max(Math.floor(pointslist.length/4), 10);
            while (pointslist.length > 0) {
                // スタック情報から取り出して描画
                let points = pointslist.pop();
                let colors = colorslist.pop();
                let widths = widthslist.pop();
                let mesh = BABYLON.CreateGreasedLine('', {points, widths}, {width: 0.6, colors, useColors: true});
                glow.referenceMeshToUseItsOwnMaterial(mesh)
                mesh._lifetime = 5; // ライフタイムを付与(=0時に削除させる）
                meshlist.push(mesh);
                if (++icount >= ncount) { break;}
            }
        }
        let meshlist_ = [];
        for (let mesh of meshlist) {
            if (mesh._lifetime > 0) {
                // ライフタイムを減らす
                mesh._lifetime -= 1;
                meshlist_.push(mesh);
            } else {
                // 削除
                mesh.material.dispose();
                mesh.dispose();
            }
        }
        meshlist = meshlist_;
    });

    setInterval(() => {
        drawLighting();
    }, 3000)

    return scene

};


export var createScene_test_12 = async function () {
    // 物理：
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);

    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // ------------------------------------------------------------

    let camera = null, icamera=0;
    let cameralist=[];
    let crCameraDef = function() {
        let _camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 7/16 * Math.PI, 20, new BABYLON.Vector3(4,0,0));
        _camera.attachControl(canvas, true);
        return _camera;
    }
    let crCamera0 = function() {
        // フローカメラを使ったバードビュー／追跡
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 15, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 10;
        _camera.heightOffset = 3;
        _camera.cameraAcceleration = 0.02;
        _camera.maxCameraSpeed = 30;
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera1 = function() {
        // ドライバーズビュー：対象(myMesh)との距離を一定に保つ（旋回する／短距離をすすむ） .. 速度非依存
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -20), scene);
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera6 = function() {
        // ターゲットと並走
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 15, 20), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.useAutoRotationBehavior = true; // 自動でゆっくり回転
        return _camera;
    }
    let crCamera3 = function() {
        // 先行して前方、ちょい下から前面を煽り見る
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        _camera.attachControl(canvas, true);
        // _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
        return _camera;
    }
    let resetCameraView = function(camera) {
        while (scene.activeCameras.length > 0) {
            scene.activeCameras.pop();
        }
        scene.activeCameras.push(camera);
        for (let camera_ of cameralist) {
            camera_.dispose();
        }
        camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
    }
    let changeCamera = function(icamera, meshCamTrg) {
        console.log("icamera=",icamera)
        if (camera!=null) {camera.dispose();}
        if (icamera == -1) {
            camera = crCameraDef();
            resetCameraView(camera);
            return;
        }
        if (icamera == 0) {
            // 4分割(icamera=0-3) / 上記４カメラを１画面で
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralist.push(crCamera0())
            cameralist.push(crCamera1())
            cameralist.push(crCamera6())
            cameralist.push(crCamera3())
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
            }
            cameralist[0].viewport = new BABYLON.Viewport(0.0, 0.5, 0.495, 0.5); // 左上
            cameralist[1].viewport = new BABYLON.Viewport(0.5, 0.5, 0.500, 0.5); // 右上
            cameralist[2].viewport = new BABYLON.Viewport(0.0, 0.0, 0.495, 0.495); // 左下
            cameralist[3].viewport = new BABYLON.Viewport(0.5, 0.0, 0.500, 0.495); // 右下
        }
        if (meshCamTrg != null) {
            for (let camera_ of cameralist) {
                camera_.lockedTarget = meshCamTrg;
            }
        }
    }
    let renderCamera1 = function(camera_) {
        // 対象(myMesh)の姿勢／進行方向から固定位置 .. ドライバーズビュー
        let camTrgMesh = camera_.lockedTarget;
        let quat = camTrgMesh.rotationQuaternion;
        let vdir = new BABYLON.Vector3(-0.01, 0, 0);
        vdir = vdir.applyRotationQuaternion(quat);
        camera_.position = camTrgMesh.position.add(vdir);
    }
    let renderCamera3 = function(camera_) {
        // 対象(myMesh)の姿勢／進行方向から固定位置 .. 先行して前方、ちょい下から前面を煽り見る
        let camTrgMesh = camera_.lockedTarget;
        let quat = camTrgMesh.rotationQuaternion;
        let vdir = new BABYLON.Vector3(5, 5, -20);
        vdir = vdir.applyRotationQuaternion(quat);
        camera_.position = camTrgMesh.position.add(vdir);
    }
    scene.onBeforeRenderObservable.add((scene) => {
        if (icamera == 0) {
            renderCamera1(cameralist[1]);
            renderCamera3(cameralist[3]);
        }
    })

    // ------------------------------------------------------------

    const FILTER_GROUP_GRND = 1;
    const FILTER_GROUP_ARCH_1 = 2;

    if (1) {
        let grndW=2000, grndH=2000;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.position.y = -2.1;
        mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.9}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
    }

    // 各点の距離
    let pplen = {
        1:1,
        12:4,
        23:3,
    };
    let np = 4;
    let eps=0.01+R0;
    let zlist = [-3, 3], radinilist = [0+eps, R90+eps]; // z位置のずれと初期位相
    const meshR = 0.2;
    let v2listlist = [];
    let meshlist = [];

    let calcPosi = function(rad_, v2list_, pplen) {
        // 点P1の座標値
        v2list_[1].x = pplen[1]*Math.cos(rad_);
        v2list_[1].y = pplen[1]*Math.sin(rad_);
        // 点P2の座標値
        let ry12 = Math.atan2(pplen[12],v2list_[1].y)
        v2list_[2].x = v2list_[1].x + pplen[12]*Math.sin(ry12);
        v2list_[2].y = 0;
        // 点P3の座標値
        v2list_[3].x = v2list_[2].x + pplen[23];
        v2list_[3].y = 0;
        return v2list_;
    }

    // ----------------------------------------

    let meshbody = null, adjx=-4;
    {
        // 車体
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:16, height:1, depth:6}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.alpha = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        meshbody = mesh;
    }

    let mesh0 = null;
    {
        // 動輪／クランク
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[1]*2, height:pplen[1]*2, depth:6}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.wireframe = 1;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:10}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        mesh.position.set(adjx,0,0);
        let joint_body_wheel = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(adjx, 0, 0),
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        meshbody._agg.body.addConstraint(mesh._agg.body, joint_body_wheel);
        mesh0 = mesh;
    }
    {
        // 前輪
        let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:4}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.alpha = 0.1;
        mesh.material.wireframe = 1;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, {mass:10, friction:0.9}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        mesh.position.x = 10+adjx;
        let hinge = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(10+adjx, 0, 0),
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        meshbody._agg.body.addConstraint(mesh._agg.body, hinge);

    }

    // 初期状態
    let meshThundList = [];
    for (let iph = 0; iph < zlist.length; ++iph) {
        let meshThund = [];
        let z = zlist[iph];
        let rad = radinilist[iph];

        let v2list = [];
        for (let ip = 0; ip < np; ++ip) {
            v2list.push(new BABYLON.Vector2(0,0));
        }

        // 固定点の設定
        v2list[0].set(0,0);
        v2listlist.push(v2list);

        // 初期位相によるメッシュ位置
        v2list = calcPosi(rad, v2list, pplen);

        {
             // 車輪
            let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:4}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.alpha = 0.4;
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, {mass:1, friction:0.9}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            mesh.position.z = z;
            mesh.parent = mesh0;
            let lock = new BABYLON.LockConstraint(
                new BABYLON.Vector3(0, 0, z),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh0._agg.body.addConstraint(mesh._agg.body, lock);
            meshThund.push(mesh0);
        }

        let mesh12 = null;
        {
            // コンロッド
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[12], height:0.2, depth:0.2}, scene);
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let v_ = v2list[1].add(v2list[2]).scale(0.5);
            mesh.position.set(v_.x+adjx, v_.y, z);
            let rad = Math.atan2(v2list[2].y-v2list[1].y, v2list[2].x-v2list[1].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v2list[1].x, v2list[1].y, z),
                new BABYLON.Vector3(-pplen[12]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh0._agg.body.addConstraint(mesh._agg.body, hinge);
            mesh12 = mesh;
        }


        let mesh23 = null;
        {
            // ピストン棒
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[23], height:0.2, depth:0.2}, scene);
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let v_ = v2list[2].add(v2list[3]).scale(0.5);
            mesh.position.set(v_.x+adjx, v_.y, z);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(pplen[12]/2, 0, 0),
                new BABYLON.Vector3(-pplen[23]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh12._agg.body.addConstraint(mesh._agg.body, hinge);

            let slider = new BABYLON.SliderConstraint(
                new BABYLON.Vector3(v2list[2].x+adjx, 0, z),
                new BABYLON.Vector3(-pplen[23]/2, 0, 0),
                new BABYLON.Vector3(1, 0, 0),
                new BABYLON.Vector3(1, 0, 0),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, slider);

            // ピストン
            let mesh2 = BABYLON.MeshBuilder.CreateBox("", {width:0.2, height:1, depth:0.5}, scene);
            mesh2.material = new BABYLON.StandardMaterial("");
            mesh2.material.diffuseColor = BABYLON.Color3.Red();
            mesh2.position.x += pplen[23]/2;
            mesh2.parent = mesh;

            mesh23 = mesh;
            meshlist.push(mesh);
            meshThund.unshift(mesh23);
        }
        if (1) {
            // シリンダ
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[1]*2, height:1, depth:0.5}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Red();
            mesh.material.alpha = 0.4;
            mesh.position.x += pplen[12]+pplen[23]+adjx;
            mesh.position.z += z;
            mesh.parent = meshbody;
        }
        meshThundList.push(meshThund);
    }

    // デバッグ表示
    if (0) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }

    const glow = new BABYLON.GlowLayer('glow', scene, {blurKernelSize: 32,});
    glow.intensity = 1;
    let ilight = 0;
    let pointslist = [];
    let colorslist = [];
    let widthslist = [];
    let meshlightlist = [];
    const drawLighting = () => {
        const sz = 0;
        let ci = 0;
        let si = 0;
        const sc = Math.random() * 100; // Chance for Splits to split again (%)
        const ssc = Math.random() * 100; // Chance for Splits in the Main Lightning (%)
        const splits = Math.random() * 2; // Main Lightning Length
        const subSplits = Math.random() * 2; // Splits Length
        const color1 = BABYLON.Color3.FromHSV(40, 0.5, 0.5)

        ++ilight;
        ilight = ilight % 2;
        let p1 = meshThundList[ilight][0].position.clone();
        let p2 = meshThundList[ilight][1].position.clone();
        let pdir = p2.subtract(p1);

        // 移動速度を加味して前にずらす
        let vv = meshbody._agg.body.getLinearVelocity().scale(0.02);
        p1.addInPlace(vv);

        const startWidth = Math.random() * 0.3 + 0.1;
        const startLength = ((Math.random() + 0.1) * pdir.length())*0.02;

        function split(ps, pdir, width, len) {
            // 確率で分岐する場合の処理
            let points = [];
            let colors = [];
            let widths = [];
            // 終点
            let pc = ps.add(pdir.scale(Math.random()*len));
            pc.y += (Math.random()-0.5);
            // 色／太さ／点（始点・終点）を格納
            colors.push(color1)
            colors.push(color1)
            widths.push(width, width, width, width)
            points.push([ps.x, ps.y, ps.z, pc.x, pc.y, pc.z])
            if (si < subSplits) {
                si += 1;
                // 終点を始点にして再帰（少し細く、短くする
                split(pc, pdir, width * 0.9, len * 0.95);
                // 分岐：確率で再帰
                Math.random() * 100 < ssc ? split(pc, pdir, width * 0.9, len * 0.95) : 0;
            }
            pointslist.push(points);
            colorslist.push(colors);
            widthslist.push(widths);
        }

        function getLightingLines(ps, pdir, width, len) {
            let points = [];
            let colors = [];
            let widths = [];
            // 終点
            let pc = ps.add(pdir.scale(Math.random()*len));
            pc.y += (Math.random()-0.5);
            // 色／太さ／点（始点・終点）を格納
            colors.push(color1)
            colors.push(color1)
            widths.push(width, width, width, width)
            points.push([ps.x, ps.y, ps.z, pc.x, pc.y, pc.z])
            si = 0;
            // 確率で分岐させる
            Math.random() * 100 < sc ? split(pc, pdir, width * 0.9, len * 0.95) : 0;
            if (ci < splits) {
                ci += 1;
                // 次の線分を作る
                getLightingLines(pc, pdir, width * 0.9, len * 0.95);
            }
            pointslist.push(points);
            colorslist.push(colors);
            widthslist.push(widths);
        }

        getLightingLines(p1, pdir, startWidth, startLength)

    }

    // ------------------------------
    // ------------------------------

    changeCamera(icamera, meshbody);

    if (1) {
        // ピストン側を動かす（前進）
        // let impF = 1; // 前進:=正 / 後進:=負
        let impF = 5; // 前進:=正 / 後進:=負
        mesh0.physicsBody.setAngularDamping(1);
        scene.onBeforeRenderObservable.add(() => {
            let quat = mesh0.rotationQuaternion;
            let radorg = quat.toEulerAngles();
            let ii = -1;
            for (let r of radinilist) {
                ++ii;
                let mesh = meshlist[ii]; // ピストンのメッシュ
                let rad = radorg.z + r;
                while (rad <= -R180) { rad += R360; }
                while (rad > R180) { rad -= R360; }
                if (rad > 0) {
                    mesh._agg.body.applyImpulse(BABYLON.Vector3.Right().scale(impF), mesh.absolutePosition);
                } else {
                    mesh._agg.body.applyImpulse(BABYLON.Vector3.Right().scale(-impF), mesh.absolutePosition);
                }
            }
        })
    }

    drawLighting()

    scene.onBeforeRenderObservable.add((scene) => {
        if (pointslist.length > 0) {
            let icount = 0, ncount = 2;
            // スピードに応じて ncount を増やす
            let vLenSQ = meshbody._agg.body.getLinearVelocity().lengthSquared();
            ncount = Math.max(ncount, Math.floor(Math.log(vLenSQ)));
            while (pointslist.length > 0) {
                let points = pointslist.pop();
                let colors = colorslist.pop();
                let widths = widthslist.pop();
                let mesh = BABYLON.CreateGreasedLine('', {points, widths}, {width: 0.6, colors, useColors: true});
                glow.referenceMeshToUseItsOwnMaterial(mesh)
                mesh._lifetime = 5;
                meshlightlist.push(mesh);
                if (++icount >= ncount) { break;}
            }
        }
        let meshlightlist_ = [];
        for (let mesh of meshlightlist) {
            if (mesh._lifetime > 0) {
                mesh._lifetime -= 1;
                meshlightlist_.push(mesh);
            } else {
                mesh.material.dispose()
                mesh.dispose();
            }
        }
        meshlightlist = meshlightlist_;
    });

    setInterval(() => {
        drawLighting();
    }, 5)

    return scene;
}


// export default createScene_test_4; // かみなり
export default createScene_test_12;  /// SL のクランクに雷のエフェクト // correct


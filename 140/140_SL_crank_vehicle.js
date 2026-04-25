// Babylon.js で物理演算(havok)：SLのクランク動作で三輪車を動かす

// 動輪                シリンダ
//
//     *-_
//    /   -_
//   /      -_
//  *         -*=========[]
//    |     |  |    |    |
//  クランク|  |    |    |
//   コンロッド|    |    |
//     クロスヘッド |    |
//           ピストン棒  |
//                ピストン

//    P1
//     *-_
//   1/   -_2
//   /      -_     2
//  *         -*=========[]
// P0         P2         P3


export var createScene_test2 = async function () {
    // メッシュ：動輪：クランク側を動かす場合
    const R0 = 0;
    const R90 = Math.PI/2;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 1/16 * Math.PI, 20, new BABYLON.Vector3(4,0,0));
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), hk);

    if (1) {
        let grndW=100, grndH=100;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.position.y = -0.1;
        mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
    }

    // 各点の距離
    let pplen = {
        1:1,
        12:4,
        23:3,
    };
    let np = 4;
    const meshR = 0.2;
    let v2list = [];
    let meshlist = [];
    let linesystem = null;
    {
        for (let ip = 0; ip < np; ++ip) {
            v2list.push(new BABYLON.Vector2(0,0));
            let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: meshR}, scene);
            meshlist.push(mesh);
        }

        // 装飾（動輪・ピストンなど
        {
            // 動輪
            let mesh = BABYLON.MeshBuilder.CreateCylinder("", {height:0.2, diameter:4,});
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Blue();
            mesh.material.wireframe = 1;
            mesh.parent = meshlist[0];
        }
        {
            // ピストン
            let mesh = BABYLON.MeshBuilder.CreateCylinder("", {height:0.2, diameter:1,});
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Red();
            mesh.rotation.z = R90;
            mesh.parent = meshlist[3];
        }
        {
            // シリンダ
            let mesh = BABYLON.MeshBuilder.CreateCylinder("", {height:2, diameter:1,});
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Red();
            mesh.material.alpha = 0.4;
            mesh.rotation.z = R90;
            mesh.position.x = 7;
        }

        // 固定点の設定
        v2list[0].set(0,0);
    }

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
    let updatePosi = function(v2list_, meshlist_) {
        // 座標値の反映
        for (let i = 0; i < np; ++i) {
            meshlist_[i].position.x = v2list_[i].x;
            meshlist_[i].position.z = v2list_[i].y;
        }
        return meshlist_;
    }
    let drawMesh = function(meshlist_, linesystem_) {
        // 線の描画
	let myLines = [
            [ meshlist_[0].position, meshlist_[1].position ],
            [ meshlist_[1].position, meshlist_[2].position ],
            [ meshlist_[2].position, meshlist_[3].position ],
	];
        if (linesystem_ == null) {
            // 最初
	    linesystem_ = BABYLON.MeshBuilder.CreateLineSystem("", {lines: myLines, updatable:true}); 
            return linesystem_;
        }
        // ２回目以降（座標更新時
	BABYLON.MeshBuilder.CreateLineSystem("", {lines: myLines, instance: linesystem_}); 
        return linesystem_;
    }

    let drawAll = function(rad, v2list_, meshlist_, linesystem_) {
        v2list_ = calcPosi(rad, v2list_, pplen);
        meshlist_ = updatePosi(v2list_, meshlist_);
        linesystem_ = drawMesh(meshlist_, linesystem_);
        return linesystem_;
    }

    let rad = 0;
    linesystem = drawAll(rad, v2list, meshlist, linesystem);

    let radstep = 0.01;
    let nloop = 3, bon = true;
    if (1) {
        scene.onBeforeRenderObservable.add(() => {
            if (bon) {
                rad += radstep;
                if (rad >= R360) { rad -= R360; --nloop;  }
                if (rad >= R0 && nloop == 0) { rad = R0; bon = false; }
                linesystem = drawAll(rad, v2list, meshlist, linesystem);

                meshlist[0].rotation.y = -rad;

            }
        })
    }

    return scene;
}

export var createScene_test11 = async function () {
    // 物理：動輪：クランク側を動かす場合
    const R0 = 0;
    const R90 = Math.PI/2;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 7/16 * Math.PI, 20, new BABYLON.Vector3(4,0,0));
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
//    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), hk);

    const FILTER_GROUP_GRND = 1;
    const FILTER_GROUP_ARCH_1 = 2;

    if (1) {
        let grndW=100, grndH=100;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.position.y = -2.1;
        mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
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
    let zlist = [0], radinilist = [R90]; // z位置のずれと初期位相
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

    let meshbody = null;
    {
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:16, height:1, depth:2}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.alpha = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        meshbody = mesh;
    }

    // 初期状態
    for (let iph = 0; iph < zlist.length; ++iph) {
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

        let mesh0 = null;
        {
            // 動輪／クランク
            let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:pplen[1]*2}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, {mass:10}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            mesh.position.z = z;
            let joint_body_wheel = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(0, 0, z),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, joint_body_wheel);
            mesh0 = mesh;

            // 車輪
            let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:4}, scene);
            mesh2.material = new BABYLON.StandardMaterial("");
            mesh2.material.alpha = 0.4;
            mesh2.material.wireframe = 1;
            mesh2.parent = mesh;
        }
        meshlist.push(mesh0);

        let mesh12 = null;
        {
            // コンロッド
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[12], height:0.2, depth:0.2}, scene);
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let v_ = v2list[1].add(v2list[2]).scale(0.5);
            mesh.position.set(v_.x, v_.y, z);
            let rad = Math.atan2(v2list[2].y-v2list[1].y, v2list[2].x-v2list[1].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v2list[1].x, v2list[1].y, 0),
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
            mesh.position.set(v_.x, v_.y, z);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(pplen[12]/2, 0, 0),
                new BABYLON.Vector3(-pplen[23]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh12._agg.body.addConstraint(mesh._agg.body, hinge);

            let slider = new BABYLON.SliderConstraint(
                new BABYLON.Vector3(v2list[2].x, 0, z),
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
        }
        {
            // シリンダ
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[1]*2, height:1, depth:0.5}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Red();
            mesh.material.alpha = 0.4;
            mesh.position.x += pplen[12]+pplen[23];
            mesh.parent = meshbody;
        }

    }

    let impF = 0.1;
    if (1) {
        scene.onBeforeRenderObservable.add(() => {
            for (let mesh of meshlist) {
                let vdir = BABYLON.Vector3.Forward();
                vdir.scaleInPlace(impF);
                mesh._agg.body.applyAngularImpulse(vdir);
            }
        })
    }

    return scene;
}


export var createScene_test13 = async function () {
    // 物理：
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 7/16 * Math.PI, 20, new BABYLON.Vector3(0,0,0));
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);
//    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), hk);

    const FILTER_GROUP_GRND = 1;
    const FILTER_GROUP_ARCH_1 = 2;

    if (1) {
        let grndW=100, grndH=100;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.position.y = -2.1;
        mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
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
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0}, scene);
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
        // mesh.material.alpha = 0.2;
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

    // 初期状態
    for (let iph = 0; iph < zlist.length; ++iph) {
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
            mesh.position.z = z;
            mesh.parent = mesh0;
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

    }

    // デバッグ表示
    if (1) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }

    if (0) {
        // 動輪側を動かす
        let impF = -0.02;
        scene.onBeforeRenderObservable.add(() => {
            {
                let vdir = BABYLON.Vector3.Forward();
                vdir.scaleInPlace(impF);
                mesh0._agg.body.applyAngularImpulse(vdir);
            }
        })
    }

    if (1) {
        // ピストン側を動かす
        let impF = 1; // 前進:=正 / 後進:=負
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

    return scene;
}

export var createScene_test15 = async function () {
    // 物理：
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);

    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);
//    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), hk);


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
        let grndW=1000, grndH=1000;
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
    for (let iph = 0; iph < zlist.length; ++iph) {
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
            // mesh.material = new BABYLON.StandardMaterial("");
            // mesh.material.alpha = 0.2;
            // mesh.material.wireframe = 1;
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

    // ------------------------------
    // ------------------------------

    changeCamera(icamera, meshbody);

    if (0) {
        // 動輪側を動かす
        let impF = -0.02;
        scene.onBeforeRenderObservable.add(() => {
            let vdir = BABYLON.Vector3.Forward();
            vdir.scaleInPlace(impF);
            mesh0._agg.body.applyAngularImpulse(vdir);
        })
    }

    if (1) {
        // ピストン側を動かす（前進）
        // let impF = 1; // 前進:=正 / 後進:=負
        let impF = 5; // 前進:=正 / 後進:=負
        mesh0.physicsBody.setAngularDamping(1);
        // // mesh0.physicsBody.setLinearDamping(1000);
        scene.onBeforeRenderObservable.add(() => {
            let quat = mesh0.rotationQuaternion;
            let radorg = quat.toEulerAngles();
            let ii = -1;
            for (let r of radinilist) {
                ++ii;
                // if (ii == 0) {continue;}
                // if (ii == 1) {continue;}
                let mesh = meshlist[ii]; // ピストンのメッシュ
                let rad = radorg.z + r;
                while (rad <= -R180) { rad += R360; }
                while (rad > R180) { rad -= R360; }
                if (rad > 0) {
                    //                console.log("+");
                    mesh._agg.body.applyImpulse(BABYLON.Vector3.Right().scale(impF), mesh.absolutePosition);
                } else {
                    //                console.log("-");
                    mesh._agg.body.applyImpulse(BABYLON.Vector3.Right().scale(-impF), mesh.absolutePosition);
                }
            }
        })
    }

    return scene;
}


// export var createScene = createScene_test2; // mesh:動輪、ピストンの描画
// export var createScene = createScene_test11; // phys:動輪／クランク側を動かす場合
// export var createScene = createScene_test13; // phys:２輪に（ピストンを動かす）
export var createScene = createScene_test15; // phys:カメラを追加

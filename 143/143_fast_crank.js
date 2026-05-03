// Babylon.js で物理演算(havok)：クランクの高速動作
// ------------------------------------------------------------

// てこクランク
//         _(o) P3
//       _-  |
// P2  _-    |
// (a)       |
//  |        |
// (s)P0    (s)P1

// スライダークランク
// 
// P1
// (a)--__
//  |      --__    P2     P3
// (s)P0       - (o)-----(o)

// てこクランク亜種（仮名）
// 
// P2
// (a)--__
//  |      --__     P1
// (s)P0       - (s)_
//                   --(o)P3

export var createScene_test112 = async function () {
    // 物理
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 7/16 * Math.PI, 20, new BABYLON.Vector3(0,0,0));
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
        mesh.position.y = -5.5;
        mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
    }

// てこクランク
//         _(o) P3
//       _-  |
// P2  _-    |
// (a)       |
//  |        |
// (s)P0    (s)P1

    // 固定点の座標
    let pp = {
        0:[ 0, 0],
        1:[ 4, 0],
    }
    // 各点の距離
    let pplen = {
        2:1,
        23:5,
        13:4,
    };

    let pplensq = {};
    let lscale = 1.0;
    Object.keys(pplen).forEach(key => {
        let len = pplen[key] * lscale;
        pplen[key] = len;
        pplensq[key] = len*len;
    });
    Object.keys(pp).forEach(key => {
        let v = pp[key];
        pp[key] = [v[0]*lscale, v[1]*lscale];
    });

    let np = 4; // 点の数
    const meshR = 0.2;
    let zlist = [0], radinilist = [R0]; // z位置のずれと初期位相
    let v2listlist = [];
    let meshlistlist = [];

    let calcPosi = function(rad_, v2list_, pplen) {
        // P2の座標値
        v2list_[2].x = v2list_[0].x + pplen[2]*Math.cos(rad_);
        v2list_[2].y = v2list_[0].y + pplen[2]*Math.sin(rad_);
        // P4の座標値
        //   3
        //  /
        // 2 -- 1
        // 三角形P1-P2-P3において、P1-P2を底面とした場合の頂点P3の位置を求める
        // まず辺P1-P2の長さを確定させる
        let L12sq = v2list_[2].subtract(v2list_[1]).lengthSquared();
        let L12 = Math.sqrt(L12sq);
        // ローカル座標系（三角形P1-P2-P3 において、P1-P2を底面とした場合）の頂点P3の座標(cx,cy)を求める
        let xc = (L12sq + pplensq[23] - pplensq[13]) / (2.0*L12);
        let yc = Math.sqrt(pplensq[23] - xc*xc );
        // 底辺(P2-P1)とx軸の角度（三角形の傾き）をもとめ、..
        let rx21 = Math.atan2(v2list_[1].y-v2list_[2].y, v2list_[1].x-v2list_[2].x);
        // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
        v2list_[3] = v2list_[2].add(new BABYLON.Vector2(xc,yc).rotate(rx21));
        return v2list_;
    }

    // ----------------------------------------

    // ボディ
    let meshbody = null, adjx=-2, adjy=0;
    let sd = 1;
    {
        let sw = Math.abs(pp[0][0]-pp[1][0]);
        let sh = 1;
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sh, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.alpha = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        mesh.position.set(0, 0, 0);
        meshbody = mesh;
    }
    {
        // アンカーP0
        let pv = pp[0];
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.1, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Green();
        mesh.position.set(pv[0]+adjx, pv[1]+adjy, 0); // adj=0の場合
        mesh.parent = meshbody;
    }
    {
        // アンカーP1
        let pv = pp[1];
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.1, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Green();
        mesh.position.set(pv[0]+adjx, pv[1]+adjy, 0); // adj=0の場合
        mesh.parent = meshbody;
    }

    // 動輪（円柱で    // 動輪（一旦四角で
    let meshw = null;
    {
        let s = pplen[2]*2;
        let mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameter:s, height:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Red();
        mesh.material.wireframe = 1;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:20}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        let p = pp[0];
        mesh.position.set(p[0]+adjx, p[1]+adjy, 0);
        mesh.rotate(BABYLON.Vector3.Right(), R90);
        let hinge = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(mesh.position.x, mesh.position.y, 0),
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 1, 0),
            scene
        );
        meshbody._agg.body.addConstraint(mesh._agg.body, hinge);
        mesh.parent = meshbody;
        meshw = mesh;
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
        Object.keys(pp).forEach(key => {
            let val = pp[key];
            v2list[key].set(val[0], val[1]);
        });

        // 初期位相によるメッシュ位置
        v2list = calcPosi(rad, v2list, pplen);

        let meshlist = [];
        {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[2], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            let v_ = v2list[2].add(v2list[0]).scale(0.5);
            mesh.position.set(v_.x, v_.y, z);
            let rad = Math.atan2(v2list[2].y-v2list[0].y, v2list[2].x-v2list[0].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            mesh.parent = meshw;
        }


        let mesh23 = null;
        if (1) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[23], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[3].add(v2list[2]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[3].y-v2list[2].y, v2list[3].x-v2list[2].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            let v_ = v2list[2].subtract(v2list[0]);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v_.x, z, v_.y),
                new BABYLON.Vector3(-pplen[23]/2, 0, 0),
                new BABYLON.Vector3(0, 1, 0),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshw._agg.body.addConstraint(mesh._agg.body, hinge);
            mesh23 = mesh;
        }

        let mesh13 = null;
        if (1) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[13], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[1].add(v2list[3]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[3].y-v2list[1].y, v2list[3].x-v2list[1].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);

            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(pplen[23]/2, 0, 0),
                new BABYLON.Vector3(pplen[13]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh23._agg.body.addConstraint(mesh._agg.body, hinge);

            let v_ = v2list[1];
            let hinge2 = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v_.x+adjx, v_.y+adjy, z),
                new BABYLON.Vector3(-pplen[13]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, hinge2);

            if (1) {
            // 高速回転で安定させるための物理拘束
            // P3の位置が大きくずれないようにするため（P0P1の反対側に裏返らないように）の拘束
            // P3がZ平面内を動く／平面から距離を取らないハズなのでその平面内の動作に制限する
            let sixdof = new BABYLON.Physics6DoFConstraint(
                { pivotA: new BABYLON.Vector3(v2list[3].x+adjx, v2list[3].y+adjy, 0),
                  pivotB: new BABYLON.Vector3(pplen[13]/2, 0, 0),},
                [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_Z, minLimit:z, maxLimit:z, },
                ],
                scene);
            meshbody._agg.body.addConstraint(mesh._agg.body, sixdof);
            }

            mesh13 = mesh;
        }

    }

    let impF = 500;
    meshw.physicsBody.setAngularDamping(1000);

    scene.onBeforeRenderObservable.add(() => {
        let vdir = BABYLON.Vector3.Forward();
        vdir.scaleInPlace(impF);
        meshw._agg.body.applyAngularImpulse(vdir);
    })

    return scene;
}


export var createScene_test212 = async function () {
    // 物理
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 7/16 * Math.PI, 20, new BABYLON.Vector3(0,0,0));
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
        mesh.position.y = -5.5;
        mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
    }

// スライダークランク
// 
// P1
// (a)--__
//  |      --__    P2     P3
// (s)P0       - (o)-----(o)

    // 固定点の座標
    let pp = {
        0:[ 0, 0],
    }
    // 各点の距離
    let pplen = {
        1:1,
        12:3,
        23:3,
    };

    let pplensq = {};
    let lscale = 1.0;
    Object.keys(pplen).forEach(key => {
        let len = pplen[key] * lscale;
        pplen[key] = len;
        pplensq[key] = len*len;
    });
    Object.keys(pp).forEach(key => {
        let v = pp[key];
        pp[key] = [v[0]*lscale, v[1]*lscale];
    });

    let np = 4; // 点の数
    const meshR = 0.2;
    let zlist = [0], radinilist = [R0]; // z位置のずれと初期位相
    let v2listlist = [];
    let meshlistlist = [];

    let calcPosi = function(rad_, v2list_, pplen) {
        // P1の座標値
        v2list_[1].x = v2list_[0].x + pplen[1]*Math.cos(rad_);
        v2list_[1].y = v2list_[0].y + pplen[1]*Math.sin(rad_);
        // P2の座標値
        v2list_[2].x = Math.sqrt(pplensq[12]-(v2list_[1].y)**2) + v2list_[1].x;
        v2list_[2].y = v2list_[0].y;
        // P3の座標値
        v2list_[3].x = v2list_[2].x + pplen[23];
        v2list_[3].y = v2list_[0].y;
        return v2list_;
    }

    // ----------------------------------------

    // ボディ
    let meshbody = null, adjx=-3.5, adjy=0;
    let sd = 1; // Math.abs(zlist[0]-zlist[1]);
    {
        let sw = Math.abs(pplen[1] + pplen[12] + pplen[23]);
        let sh = 1;
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sh, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.alpha = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        mesh.position.set(0, 0, 0);
        meshbody = mesh;
    }
    {
        // アンカーP0
        let pv = pp[0];
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.1, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Green();
        mesh.position.set(pv[0]+adjx, pv[1]+adjy, 0);
        mesh.parent = meshbody;
    }

    // 動輪（円柱で    // 動輪（一旦四角で
    let meshw = null;
    {
        let s = pplen[1]*2;
        let mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameter:s, height:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Red();
        mesh.material.alpha = 0.6;
        mesh.material.wireframe = 1;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:20}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        let p = pp[0];
        mesh.position.set(p[0]+adjx, p[1]+adjy, 0);
        mesh.rotate(BABYLON.Vector3.Right(), R90);
        let hinge = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(mesh.position.x, mesh.position.y, 0),
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 1, 0),
            scene
        );
        meshbody._agg.body.addConstraint(mesh._agg.body, hinge);
        mesh.parent = meshbody;
        meshw = mesh;
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
        Object.keys(pp).forEach(key => {
            let val = pp[key];
            v2list[key].set(val[0], val[1]);
        });

        // 初期位相によるメッシュ位置
        v2list = calcPosi(rad, v2list, pplen);

        let meshlist = [];

        {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[1], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            let v_ = v2list[1].add(v2list[0]).scale(0.5);
            mesh.position.set(v_.x, v_.y, z);
            let rad = Math.atan2(v2list[1].y-v2list[0].y, v2list[1].x-v2list[0].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            mesh.parent = meshw;
        }


        let mesh12 = null;
        if (1) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[12], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[2].add(v2list[1]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[2].y-v2list[1].y, v2list[2].x-v2list[1].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            let v_ = v2list[1].subtract(v2list[0]);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v_.x, z, v_.y),
                new BABYLON.Vector3(-pplen[12]/2, 0, 0),
                new BABYLON.Vector3(0, 1, 0),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshw._agg.body.addConstraint(mesh._agg.body, hinge);
            mesh12 = mesh;
        }

        let mesh23 = null;
        if (1) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[23], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[2].add(v2list[3]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[3].y-v2list[2].y, v2list[3].x-v2list[2].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);

            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(pplen[12]/2, 0, 0),
                new BABYLON.Vector3(-pplen[23]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh12._agg.body.addConstraint(mesh._agg.body, hinge);

            let v_ = v2list[2];
            let slider = new BABYLON.SliderConstraint(
                new BABYLON.Vector3(v_.x+adjx, v_.y+adjy, z),
                new BABYLON.Vector3(-pplen[23]/2, 0, 0),
                new BABYLON.Vector3(1, 0, 0),
                new BABYLON.Vector3(1, 0, 0),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, slider);

            // 高速回転で安定させるための物理拘束
            let slider2 = new BABYLON.PrismaticConstraint(
                new BABYLON.Vector3(v_.x+pplen[23]+adjx, v_.y+adjy, z),
                new BABYLON.Vector3(pplen[23]/2, 0, 0), // 反対側の端点
                new BABYLON.Vector3(1, 0, 0),
                new BABYLON.Vector3(1, 0, 0),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, slider2);

            mesh23 = mesh;
        }

    }

    let impF = 500;
    meshw.physicsBody.setAngularDamping(200);
    scene.onBeforeRenderObservable.add(() => {
        let vdir = BABYLON.Vector3.Forward();
        vdir.scaleInPlace(impF);
        meshw._agg.body.applyAngularImpulse(vdir);
    })

    return scene;
}


export var createScene_test312 = async function () {
    // 物理
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 7/16 * Math.PI, 20, new BABYLON.Vector3(0,0,0));
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
        mesh.position.y = -5.5;
        mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
    }

// リング？クランク
// 
// P2
// (a)--__
//  |      --__     P1
// (s)P0       - (s)_
//                   --(o)P3

    // 固定点の座標
    let pp = {
        0:[ 0, 0],
        1:[ 4, 0],
    }
    // 各点の距離
    let pplen = {
        2:1,
        23:6,
    };

    let pplensq = {};
    let lscale = 1.0;
    Object.keys(pplen).forEach(key => {
        let len = pplen[key] * lscale;
        pplen[key] = len;
        pplensq[key] = len*len;
    });
    Object.keys(pp).forEach(key => {
        let v = pp[key];
        pp[key] = [v[0]*lscale, v[1]*lscale];
    });

    let np = 4; // 点の数
    const meshR = 0.2;
    let zlist = [0], radinilist = [R0]; // z位置のずれと初期位相
    let v2listlist = [];
    let meshlistlist = [];

    let calcPosi = function(rad_, v2list_, pplen) {
        // P2の座標値
        v2list_[2].x = v2list_[0].x + pplen[2]*Math.cos(rad_);
        v2list_[2].y = v2list_[0].y + pplen[2]*Math.sin(rad_);
        // P3の座標値
        //   P12の長さ
        let L12sq = v2list_[2].subtract(v2list_[1]).lengthSquared();
        let L12 = Math.sqrt(L12sq);
        // ベクトルの長さの比からもとめる
        v2list_[3] = v2list_[2].add(v2list_[1].subtract(v2list_[2]).scale(pplen[23]/L12));
        return v2list_;
    }

    // ----------------------------------------

    // ボディ
    let meshbody = null, adjx=-3.5, adjy=0;
    let sd = 1;
    {
        let sw = Math.abs(pplen[2] + pplen[23]);
        let sh = 1;
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sh, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.alpha = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        mesh.position.set(0, 0, 0);
        meshbody = mesh;
    }
    {
        // アンカーP0
        let pv = pp[0];
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.1, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Green();
        mesh.position.set(pv[0]+adjx, pv[1]+adjy, 0);
        mesh.parent = meshbody;
    }
    let mesh1 = null;
    {
        // アンカーP1
        let pv = pp[1];
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.1, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Green();
        // mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:40}, scene);//軽め：ぶれる
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:500}, scene);//重め：安定させる
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        mesh.position.set(pv[0]+adjx, pv[1]+adjy, 0);
        mesh.parent = meshbody;

        let p = pp[1];
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(p[0]+adjx, p[1]+adjy, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, hinge);

        mesh1 = mesh;
    }

    // 動輪（一旦四角で
    let meshw = null;
    {
        let s = pplen[2]*2;
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:s, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Red();
        mesh.material.alpha = 0.6;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:20}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        let p = pp[0];
        mesh.position.set(p[0]+adjx, p[1]+adjy, 0);
        let hinge = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(mesh.position.x, mesh.position.y, 0),
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        meshbody._agg.body.addConstraint(mesh._agg.body, hinge);
        mesh.parent = meshbody;
        meshw = mesh;
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
        Object.keys(pp).forEach(key => {
            let val = pp[key];
            v2list[key].set(val[0], val[1]);
        });

        // 初期位相によるメッシュ位置
        v2list = calcPosi(rad, v2list, pplen);

        let meshlist = [];

        {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[2], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            let v_ = v2list[2].add(v2list[0]).scale(0.5);
            mesh.position.set(v_.x, v_.y, z);
            let rad = Math.atan2(v2list[2].y-v2list[0].y, v2list[2].x-v2list[0].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            mesh.parent = meshw;
        }


        let mesh23 = null;
        if (1) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[23], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[3].add(v2list[2]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[3].y-v2list[2].y, v2list[3].x-v2list[2].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            let v_ = v2list[2].subtract(v2list[0]);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v_.x, v_.y, z),
                new BABYLON.Vector3(-pplen[23]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshw._agg.body.addConstraint(mesh._agg.body, hinge);

            // mesh23 を pplen[12]:pplen[13] で内分する点(x)
            let L12 = v2list[2].subtract(v2list[1]).length();
            let x = (-pplen[23]/2*(pplen[23]-L12) + pplen[23]/2*(L12))/(pplen[23]);
            let slider = new BABYLON.PrismaticConstraint(
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(x, 0, 0),
                new BABYLON.Vector3(1, 0, 0),
                new BABYLON.Vector3(1, 0, 0),
                scene
            );
            mesh1._agg.body.addConstraint(mesh._agg.body, slider);

            mesh23 = mesh;
        }
    }


    let impF = 500;
    meshw.physicsBody.setAngularDamping(2000);
    scene.onBeforeRenderObservable.add(() => {
        let vdir = BABYLON.Vector3.Forward();
        vdir.scaleInPlace(impF);
        meshw._agg.body.applyAngularImpulse(vdir);
    })

    return scene;
}

// てこクランク
export var createScene = createScene_test112;

// スライダークランク
// export var createScene = createScene_test212;

// てこクランク亜種（仮名）
// export var createScene = createScene_test312;



// Babylon.js で物理演算(Havok)：4足・6足タイプの物理モデル作成(2)

// メカ・カンガルー （両足ジャンプタイプ）
// https://www.tamiya.com/japan/products/71102/index.html
// https://d7z22c0gz59ng.cloudfront.net/cms/japan/download/pdf/robot/71102.pdf
//
//          _-(o)P5
//        _-   |
//  P1  _-   P4|  P0
//  (s)-      (a)-(s)_
//   |         |      ~-(s)P3
//  (s)P2     (o)P6   


export var createScene_test12 = async function () {
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
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    const FILTER_GROUP_GRND = 1;
    const FILTER_GROUP_ARCH_1 = 2;

    if (1) {
        let grndW=100, grndH=100;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.position.y = -1.0;
        mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
    }

    // 固定点の座標
    let pp = {
        0:[0, 0],
        1:[-2, 0],
        2:[-2, -1],
        3:[2, -0.5],
    }
    // 各点の距離
    let pplen = {
        4:0.25,
        15:1.75,
        45:1.5,
        46:0.75,
    };

    let pplensq = {};
    let lrate = 1.0;
    Object.keys(pplen).forEach(key => {
        let len = pplen[key] * lrate;
        pplen[key] = len;
        pplensq[key] = len*len;
    });
    Object.keys(pp).forEach(key => {
        let v = pp[key];
        pp[key] = [v[0]*lrate, v[1]*lrate];
    });

    let np = 7; // 点の数
    const meshR = 0.2;
    let zlist = [1,-1], radinilist = [0, 0]; // z位置のずれと初期位相
    let v2listlist = [];
    let meshlistlist = [];

    let calcPosi = function(rad_, v2list_, pplen) {
        // P4の座標値
        v2list_[4].x = v2list_[0].x + pplen[4]*Math.cos(rad_);
        v2list_[4].y = v2list_[0].y + pplen[4]*Math.sin(rad_);
        // P5の座標値
        //   5
        //  /
        // 1 -- 4
        // 三角形P1-P4-P5において、P1-P4を底面とした場合の頂点P5の位置を求める
        // まず辺PP1-P4の長さを確定させる
        let L14sq = v2list_[4].subtract(v2list_[1]).lengthSquared();
        let L14 = Math.sqrt(L14sq);
        // ローカル座標系（三角形P1-P4-P5 において、P1-P4を底面とした場合）の頂点P5の座標(cx,cy)を求める
        let xc = (L14sq + pplensq[15] - pplensq[45]) / (2.0*L14);
        let yc = Math.sqrt(pplensq[15] - xc*xc );
        // 底辺(P1-P4)とx軸の角度（三角形の傾き）をもとめ、..
        let rx41 = Math.atan2(v2list_[4].y-v2list_[1].y, v2list_[4].x-v2list_[1].x);
        // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
        v2list_[5] = v2list_[1].add(new BABYLON.Vector2(xc,yc).rotate(rx41));
        // P8  P5P4の延長上に P6を配置
        v2list_[6] = v2list_[5].add(v2list_[4].subtract(v2list_[5]).scale((pplen[45]+pplen[46])/pplen[45]));
        return v2list_;
    }

    // ----------------------------------------

    // ボディ
    let meshbody = null, adjx=1, adjy=0;
    let sd = Math.abs(zlist[0]-zlist[1]);
    {
        let sw = Math.abs(pp[1][0]-pp[0][0]);
        let sh = Math.abs(pp[1][1]-pp[3][1]);
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sh, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.alpha = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        mesh.position.set(0, 0, 0);
        meshbody = mesh;
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
    if(1){
        // P1P2
        let p1 = pp[1], p2 = pp[2];
        let sw = Math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2);
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:0.1, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1, friction:0.001}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        let vc = [(p1[0]+p2[0])/2, (p1[1]+p2[1])/2];
        mesh.position.set(vc[0]+adjx, vc[1]+adjy, 0);
        let rad = Math.atan2(p2[1]-p1[1], p2[0]-p1[0]);
        mesh.rotate(BABYLON.Vector3.Forward(), rad);

        let lock = new BABYLON.Physics6DoFConstraint(
            { pivotA: new BABYLON.Vector3(vc[0]+adjx, vc[1]+adjy, 0),
              pivotB: new BABYLON.Vector3(0, 0, 0),},
            [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit:0, maxLimit:0, },
             { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit:0, maxLimit:0, },
             { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit:0, maxLimit:0, },
             { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit:-rad, maxLimit:-rad, },
            ],
            scene);
        meshbody._agg.body.addConstraint(mesh._agg.body, lock);

    }

    // 動輪（一旦四角で
    let meshw = null;
    {
        let s = pplen[4]*2;
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
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[4], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            let v_ = v2list[0].add(v2list[4]).scale(0.5);
            mesh.position.set(v_.x, v_.y, z);
            mesh.parent = meshw;
        }

        let mesh15 = null;
        if (1) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[15], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[1].add(v2list[5]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[5].y-v2list[1].y, v2list[5].x-v2list[1].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v2list[1].x+adjx, v2list[1].y+adjy, z),
                new BABYLON.Vector3(-pplen[15]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, hinge);
            mesh15 = mesh;
        }

        let mesh56 = null;
        if (1) {
            let sw = pplen[45] + pplen[46];
            let sh = 0.1, sh_=sh/2;
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sh, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1, friction:0.8}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[5].add(v2list[6]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[6].y-v2list[5].y, v2list[6].x-v2list[5].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);

            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(pplen[15]/2, 0, 0),
                new BABYLON.Vector3(-sw/2, sh_, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh15._agg.body.addConstraint(mesh._agg.body, hinge);

            // mesh56 を pplen[45]:pplen[46] で内分する点(x)
            let x = (-sw/2*(pplen[46]) + sw/2*(pplen[45]))/(pplen[45]+pplen[46]);
            let hinge2 = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v2list[4].x-v2list[0].x, v2list[4].y-v2list[0].y, z),
                new BABYLON.Vector3(x, sh_, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshw._agg.body.addConstraint(mesh._agg.body, hinge2);

            mesh56 = mesh;
        }

    }

    let impF = 10;
    meshw.physicsBody.setAngularDamping(2000);
    scene.onBeforeRenderObservable.add(() => {
        let vdir = BABYLON.Vector3.Forward();
        vdir.scaleInPlace(impF);
        meshw._agg.body.applyAngularImpulse(vdir);
    })

    return scene;
}

export var createScene = createScene_test12;

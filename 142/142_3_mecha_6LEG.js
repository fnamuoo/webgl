// Babylon.js で物理演算(Havok)：4足・6足タイプの物理モデル作成(3)

// 2チャンネル リモコン・インセクト （6足歩行タイプ）
// https://www.tamiya.com/japan/products/71107/index.html
// https://d7z22c0gz59ng.cloudfront.net/cms/japan/download/pdf/robot/71107.pdf
//
// (o)P4       (o)P6      _-(o)P8
//  |   -       |   -_   -   |
//  |    -_     |P1   -_-    |
//  |      -_   |(s) _- -_   |
//  |       -_  |/ _-    -_  |
// (s)        -(a)-        -(s)
//  |P0         |P3          |P2
//  |           |            |
//  |           |            |
// (o)P5       (o)P7        (o)P9

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
        mesh.position.y = -1.5;
        mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
    }

    // 固定点の座標
    let pp = {
        0:[-2, 0],
        1:[ 0, 0],
        2:[ 2, 0],
    }
    // 各点の距離
    let pplen = {
        4:1,
        5:1,
        13:0.25,
        26:2.25,
        28:1,
        29:1,
        36:1,
        37:1,
        34:2.25,
        38:2.25,
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

    let np = 10; // 点の数
    const meshR = 0.2;
    let zlist = [1.25,-1.25], radinilist = [0, R180]; // z位置のずれと初期位相
    let v2listlist = [];
    let meshlistlist = [];

    let calcPosi = function(rad_, v2list_, pplen) {
        // P3の座標値
        v2list_[3].x = v2list_[1].x + pplen[13]*Math.cos(rad_);
        v2list_[3].y = v2list_[1].y + pplen[13]*Math.sin(rad_);
        // P4の座標値
        //   4
        //  /
        // 0 -- 3
        // 三角形P0-P3-P4において、P0-P3を底面とした場合の頂点P4の位置を求める
        // まず辺P0-P3の長さを確定させる
        let L03sq = v2list_[3].subtract(v2list_[0]).lengthSquared();
        let L03 = Math.sqrt(L03sq);
        // ローカル座標系（三角形P3-P0-P4 において、P0-P4を底面とした場合）の頂点P4の座標(cx,cy)を求める
        let xc = (L03sq + pplensq[4] - pplensq[34]) / (2.0*L03);
        let yc = Math.sqrt(pplensq[4] - xc*xc );
        // 底辺(P0-P3)とx軸の角度（三角形の傾き）をもとめ、..
        let rx03 = Math.atan2(v2list_[3].y-v2list_[0].y, v2list_[3].x-v2list_[0].x);
        // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
        v2list_[4] = v2list_[0].add(new BABYLON.Vector2(xc,yc).rotate(rx03));
        // P5  P4P0の延長上に P5を配置
        v2list_[5] = v2list_[4].add(v2list_[0].subtract(v2list_[4]).scale((pplen[4]+pplen[5])/pplen[4]));
        // P6の座標値
        //   6
        //  /
        // 3 -- 2
        // 三角形P2-P3-P6において、P2-P3を底面とした場合の頂点P6の位置を求める
        // まず辺P2-P3の長さを確定させる
        let L23sq = v2list_[2].subtract(v2list_[3]).lengthSquared();
        let L23 = Math.sqrt(L23sq);
        // ローカル座標系（三角形P2-P3-P6 において、P2-P3を底面とした場合）の頂点P6の座標(cx,cy)を求める
        xc = (L23sq + pplensq[36] - pplensq[26]) / (2.0*L23);
        yc = Math.sqrt(pplensq[36] - xc*xc );
        // 底辺(P2-P3)とx軸の角度（三角形の傾き）をもとめ、..
        let rx32 = Math.atan2(v2list_[2].y-v2list_[3].y, v2list_[2].x-v2list_[3].x);
        // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
        v2list_[6] = v2list_[3].add(new BABYLON.Vector2(xc,yc).rotate(rx32));
        // P7  P6P3の延長上に P7を配置
        v2list_[7] = v2list_[6].add(v2list_[3].subtract(v2list_[6]).scale((pplen[36]+pplen[37])/pplen[36]));
        // P8の座標値
        //   8
        //  /
        // 3 -- 2
        // ローカル座標系（三角形P2-P3-P8 において、P2-P3を底面とした場合）の頂点P8の座標(cx,cy)を求める
        xc = (L23sq + pplensq[38] - pplensq[28]) / (2.0*L23);
        yc = Math.sqrt(pplensq[38] - xc*xc );
        // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
        v2list_[8] = v2list_[3].add(new BABYLON.Vector2(xc,yc).rotate(rx32));
        // P9  P8P2の延長上に P9を配置
        v2list_[9] = v2list_[8].add(v2list_[2].subtract(v2list_[8]).scale((pplen[28]+pplen[29])/pplen[28]));
        return v2list_;
    }

    // ----------------------------------------

    // ボディ
    let meshbody = null, adjx=0, adjy=0;
    let sd = Math.abs(zlist[0]-zlist[1]);
    {
        let sw = Math.abs(pp[0][0]-pp[2][0]);
        let sh = 1;
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
    {
        // アンカーP2
        let pv = pp[2];
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.1, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Green();
        mesh.position.set(pv[0]+adjx, pv[1]+adjy, 0); // adj=0の場合
        mesh.parent = meshbody;
    }

    // 動輪（一旦四角で
    let meshw = null;
    {
        let s = pplen[13]*2;
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:s, depth:sd}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Red();
        mesh.material.alpha = 0.6;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:20}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        let p = pp[1];
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
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[13], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            let v_ = v2list[1].add(v2list[3]).scale(0.5);
            mesh.position.set(v_.x, v_.y, z);
            mesh.parent = meshw;
        }


        let mesh34 = null;
        if (1) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[34], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            // mesh.material.alpha = 0.2;
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[3].add(v2list[4]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[4].y-v2list[3].y, v2list[4].x-v2list[3].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            let v_ = v2list[3].subtract(v2list[1]);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v_.x, v_.y, z),
                new BABYLON.Vector3(-pplen[34]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshw._agg.body.addConstraint(mesh._agg.body, hinge);
            mesh34 = mesh;
        }

        let mesh45 = null;
        if (1) {
            let sw = pplen[4] + pplen[5];
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1, friction:0.8}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[4].add(v2list[5]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[5].y-v2list[4].y, v2list[5].x-v2list[4].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);

            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(pplen[34]/2, 0, 0),
                new BABYLON.Vector3(-sw/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh34._agg.body.addConstraint(mesh._agg.body, hinge);

            let v_ = v2list[0].subtract(v2list[1]);
            // mesh67 を pplen[36]:pplen[37] で内分する点(x)
            let x = (-sw/2*(pplen[5]) + sw/2*(pplen[4]))/(pplen[4]+pplen[5]);
            let hinge2 = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v_.x+adjx, v_.y+adjy, z),
                new BABYLON.Vector3(x, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, hinge2);

            mesh45 = mesh;
        }


        let mesh38 = null;
        if (1) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[38], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[3].add(v2list[8]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[8].y-v2list[3].y, v2list[8].x-v2list[3].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            let v_ = v2list[3].subtract(v2list[1]);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v_.x, v_.y, z),
                new BABYLON.Vector3(-pplen[38]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshw._agg.body.addConstraint(mesh._agg.body, hinge);
            mesh38 = mesh;
        }

        let mesh67 = null;
        if (1) {
            let sw = pplen[36] + pplen[37];
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1, friction:0.8}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[6].add(v2list[7]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[7].y-v2list[6].y, v2list[7].x-v2list[6].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);

            let v_ = v2list[3].subtract(v2list[1]);
            // mesh67 を pplen[36]:pplen[37] で内分する点(x)
            let x = (-sw/2*(pplen[37]) + sw/2*(pplen[36]))/(pplen[36]+pplen[37]);
            let hinge2 = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v_.x, v_.y, z),
                new BABYLON.Vector3(x, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshw._agg.body.addConstraint(mesh._agg.body, hinge2);

            mesh67 = mesh;
        }

        let mesh26 = null;
        if (1) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[26], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[2].add(v2list[6]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[6].y-v2list[2].y, v2list[6].x-v2list[2].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);

            let s67 = (pplen[36] + pplen[37]);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(-s67/2, 0, 0),
                new BABYLON.Vector3(pplen[26]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh67._agg.body.addConstraint(mesh._agg.body, hinge);

            let hinge2 = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v2list[2].x+adjx, v2list[2].y+adjy, z),
                new BABYLON.Vector3(-pplen[26]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, hinge2);

            mesh26 = mesh;
        }

        let mesh89 = null;
        if (1) {
            let sw = pplen[28] + pplen[29];
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1, friction:0.8}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[8].add(v2list[9]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[9].y-v2list[8].y, v2list[9].x-v2list[8].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);

            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(pplen[38]/2, 0, 0),
                new BABYLON.Vector3(-sw/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh38._agg.body.addConstraint(mesh._agg.body, hinge);

            // mesh89 を pplen[28]:pplen[29] で内分する点(x)
            let x = (-sw/2*(pplen[29]) + sw/2*(pplen[28]))/(pplen[28]+pplen[29]);
            let hinge2 = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v2list[2].x+adjx, v2list[2].y+adjy, z),
                new BABYLON.Vector3(x, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, hinge2);

            mesh89 = mesh;
        }

    }

    let impF = 10.0;
    meshw.physicsBody.setAngularDamping(1000);
    scene.onBeforeRenderObservable.add(() => {
        let vdir = BABYLON.Vector3.Forward();
        vdir.scaleInPlace(impF);
        meshw._agg.body.applyAngularImpulse(vdir);
    })

    return scene;
}


export var createScene = createScene_test12;


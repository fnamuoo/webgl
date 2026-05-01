// Babylon.js で物理演算(Havok)：4足・6足タイプの物理モデル作成(1)

// ------------------------------------------------------------
// メカ・キリン （4足歩行タイプ）
// https://www.tamiya.com/japan/products/71105/index.html
// https://d7z22c0gz59ng.cloudfront.net/cms/japan/download/pdf/robot/71105.pdf
//
//    P5(o)-_   _-(o)P3
//       |   -_-   |
// P0  P2|  _- -_  | P1
// (s)--(a)-     -(s)
//       |         |
//    P6(o)       (o)P4


export var createScene_test13 = async function () {
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
        mesh.position.y = -3.0;
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
        1:[4, 0],
    }
    // 各点の距離
    let pplen = {
        2:0.25,
        13:2,
        14:3-1,
        15:4,
        23:4,
        25:2,
        26:2.75-1,
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
    let zlist = [1,-1], radinilist = [0, R180]; // z位置のずれと初期位相
    let v2listlist = [];
    let meshlistlist = [];

    let calcPosi = function(rad_, v2list_, pplen) {
        // P2の座標値
        v2list_[2].x = v2list_[0].x + pplen[2]*Math.cos(rad_);
        v2list_[2].y = v2list_[0].y + pplen[2]*Math.sin(rad_);
        // P3の座標値
        // 三角形P1-P2-P3//ABCにおいて、P1-P2/ABを底面とした場合の頂点P3/Cの位置を求める
        // まず辺P1-P2/ABの長さを確定させる
        let L12sq = v2list_[2].subtract(v2list_[1]).lengthSquared();
        let L12 = Math.sqrt(L12sq);
        // ローカル座標系（三角形P1-P2-P3//ABCにおいて、P1-P2/ABを底面とした場合）の頂点P3の座標(cx,cy)を求める
        let xc = (L12sq + pplensq[23] - pplensq[13]) / (2.0*L12);
        let yc = Math.sqrt(pplensq[23] - xc*xc );
        // 底辺(P1-P2)とx軸の角度（三角形の傾き）をもとめ、..
        let rx21 = Math.atan2(v2list_[1].y-v2list_[2].y, v2list_[1].x-v2list_[2].x);
        // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
        v2list_[3] = v2list_[2].add(new BABYLON.Vector2(xc,yc).rotate(rx21));
        // P4  P3P1の延長上に P4を配置
        v2list_[4] = v2list_[3].add(v2list_[1].subtract(v2list_[3]).scale((pplen[13]+pplen[14])/pplen[13]));
        // P5の座標値
        // ローカル座標系（三角形P1-P2-P3//ABCにおいて、P1-P2/ABを底面とした場合）の頂点P3の座標(cx,cy)を求める
        xc = (L12sq + pplensq[25] - pplensq[15]) / (2.0*L12);
        yc = Math.sqrt(pplensq[25] - xc*xc );
        // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
        v2list_[5] = v2list_[2].add(new BABYLON.Vector2(xc,yc).rotate(rx21));
        // P6  P5P2の延長上に P6を配置
        v2list_[6] = v2list_[5].add(v2list_[2].subtract(v2list_[5]).scale((pplen[25]+pplen[26])/pplen[25]));
        return v2list_;
    }

    // ----------------------------------------

    // ボディ
    let meshbody = null, adjx=-Math.abs(pp[1][0]-pp[0][0])/2, adjy=0;
    {
        let s = Math.abs(pp[1][0]-pp[0][0]);
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:1, depth:2}, scene);
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
        // アンカー
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.1, depth:2}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Green();
        mesh.position.set(pp[1][0]+adjx, pp[1][1]+adjy, 0); // adj=0の場合
        mesh.parent = meshbody;
    }

    // 動輪（一旦四角で
    let meshw = null;
    {
        let s = pplen[2]*2;
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:s, depth:2}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Red();
        mesh.material.alpha = 0.6;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:30}, scene);
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

        let mesh02 = null;
        {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[2], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            let v_ = v2list[0].add(v2list[2]).scale(0.5);
            mesh.position.set(v_.x, v_.y, z);
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
            let vc = v2list[2].add(v2list[3]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[3].y-v2list[2].y, v2list[3].x-v2list[2].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v2list[2].x, v2list[2].y, z),
                new BABYLON.Vector3(-pplen[23]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshw._agg.body.addConstraint(mesh._agg.body, hinge);
            mesh23 = mesh;
        }

        let mesh34 = null;
        if (1) {
            let s = pplen[13] + pplen[14];
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1, friction:0.8}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[3].add(v2list[4]).scale(0.5);
            mesh.position.set(vc.x+adjx, vc.y+adjy, z);
            let rad = Math.atan2(v2list[4].y-v2list[3].y, v2list[4].x-v2list[3].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(pplen[23]/2, 0, 0),
                new BABYLON.Vector3(-s/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh23._agg.body.addConstraint(mesh._agg.body, hinge);
            // mesh34 を pplen[13]:pplen[14] で内分する点(x)
            let x = (-s/2*(pplen[14]) + s/2*(pplen[13]))/(pplen[13]+pplen[14]);
            let hinge2 = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v2list[1].x+adjx, v2list[1].y+adjy, z),
                new BABYLON.Vector3(x, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, hinge2);

            mesh34 = mesh;
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
            let s = pplen[25] + pplen[26];
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
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
                new BABYLON.Vector3(-s/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh15._agg.body.addConstraint(mesh._agg.body, hinge);
            // mesh56 を pplen[25]:pplen[26] で内分する点(x)
            let x = (-s/2*(pplen[26]) + s/2*(pplen[25]))/(pplen[25]+pplen[26]);
            let hinge2 = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v2list[2].x, v2list[2].y, z),
                new BABYLON.Vector3(x, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshw._agg.body.addConstraint(mesh._agg.body, hinge2);

            mesh56 = mesh;
        }
       

    }

    let impF = 3+1;
    meshw.physicsBody.setAngularDamping(20+10);
    if (1) {
        scene.onBeforeRenderObservable.add(() => {
            let vdir = BABYLON.Vector3.Forward();
            vdir.scaleInPlace(impF);
            meshw._agg.body.applyAngularImpulse(vdir);
        })
    }

    return scene;
}

export var createScene = createScene_test13;

// Babylon.js で物理演算(havok)：2足歩行タイプのおもちゃにチャレンジ

// メカ・ダチョウ （2足歩行タイプ）
// https://www.tamiya.com/japan/products/71104/index.html
// https://d7z22c0gz59ng.cloudfront.net/cms/japan/download/pdf/robot/71104.pdf
// 
//    5 _-~(o)
// (s)-~    |5
//        1 |
//     (s)-(a)
//          |5
//       5  |
//    (o)--(o)

//         P2
//P0  5 _-~(o)
// (s)-~    |5
//        1 |
//   P1(s)-(a)P3
//          |5
//       5  |
//  P5(o)--(o)P4

export var createScene_test12 = async function () {
    // 物理
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 7/16 * Math.PI, 20, new BABYLON.Vector3(4,0,0));
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    const FILTER_GROUP_GRND = 1;
    const FILTER_GROUP_ARCH_1 = 2;

    if (1) {
        let grndW=100, grndH=100;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.position.y = -4.5;
        mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
    }

    let meshbodymass = 10; // ボディの質量（０：固定
    let bActMeshWheel = true; // 動輪を回る

    let impF = 2, meshwAngDamp = 100;

    // 各点の距離
    let pplen = {
        2:3.5,
        13:0.2,
        23:2,
        34:3,
        45:3.5,
    };
    pplen[24] = pplen[23] + pplen[34];
    // 点の角度
    let ppr = {
        345:R90,
    }
    let pplensq = {};
    Object.keys(pplen).forEach(key => {
        let len = pplen[key] / 1.0;
        pplen[key] = len;
        pplensq[key] = len*len;
    });

    let np = 6;
    const meshR = 0.2;
    let eps = 0.6;
    let zlist = [1,-1], radinilist = [eps, eps+R180]; // z位置のずれと初期位相
    let v2listlist = [];
    let meshlistlist = [];

    let calcPosi = function(rad_, v2list_, pplen, ppr) {
        // 角度(rad_)から点の座標値(v2list_)を求める。この時の制約（距離・角度）はpplen,pprから参照
        // P3の座標値
        v2list_[3].x = v2list_[1].x + pplen[13]*Math.cos(rad_);
        v2list_[3].y = v2list_[1].y + pplen[13]*Math.sin(rad_);
        // P2の座標値
        // 三角形P0-P3-P2//ABCにおいて、P0-P3/ABを底面とした場合の頂点P2/Cの位置を求める
        // まず辺P0-P3/ABの長さを確定させる
        let L03sq = v2list_[3].subtract(v2list_[0]).lengthSquared();
        let L03 = Math.sqrt(L03sq);
        // ローカル座標系（三角形P3-P0-P2//ABCにおいて、P3-P0/ABを底面とした場合）の頂点P2の座標(cx,cy)を求める
        let xc = (L03sq + pplensq[2] - pplensq[23]) / (2.0*L03);
        let yc = Math.sqrt(pplensq[2] - xc*xc );
        // 底辺(P0-P3)とx軸の角度（三角形の傾き）をもとめ、..
        let rx03 = Math.atan2(v2list_[3].y-v2list_[0].y, v2list_[3].x-v2list_[0].x);
        // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
        v2list_[2] = v2list_[0].add(new BABYLON.Vector2(xc,yc).rotate(rx03));
        // P4  P2P3の延長上に P4を配置
        v2list_[4] = v2list_[2].add(v2list_[3].subtract(v2list_[2]).scale(pplen[24]/pplen[23]));
        // P5
        //   まず x軸とP4-P3の角度を求める
        let rx43 = Math.atan2(v2list_[3].y-v2list_[4].y, v2list_[3].x-v2list_[4].x);
        //   角P3P4P5を足し合わせて P4を原点とした角度で P5をもとめる
        let r5 = rx43 + ppr[345];
        v2list_[5].x = v2list_[4].x + pplen[45]*Math.cos(r5);
        v2list_[5].y = v2list_[4].y + pplen[45]*Math.sin(r5);
        return v2list_;
    }

    // ----------------------------------------

    // ボディ
    let meshbody = null;
    {
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:8, height:1, depth:2}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.alpha = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:meshbodymass}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        meshbody = mesh;
    }
    // 動輪（一旦四角で
    let meshw = null;
    {
        let s = pplen[13]*2;
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:s, depth:2}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Red();
        mesh.material.alpha = 0.8;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:20}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        mesh.position.set(pplen[2]+pplen[13]/2, -pplen[13]/2*3, 0);
        let hinge = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(mesh.position.x, mesh.position.y, 0),
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        meshbody._agg.body.addConstraint(mesh._agg.body, hinge);
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
        v2list[0].set(0,0);
        v2list[1].set(pplen[2]+pplen[13]*0.9,-pplen[13]*2.5);

        // 初期位相によるメッシュ位置
        v2list = calcPosi(rad, v2list, pplen, ppr);

        let meshlist = [];
        let mesh02 = null;
        {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[2], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let v_ = v2list[0].add(v2list[2]).scale(0.5);
            mesh.position.set(v_.x, v_.y, z);
            let rad = Math.atan2(v2list[2].y-v2list[0].y, v2list[2].x-v2list[0].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(0, 0, z),
                new BABYLON.Vector3(-pplen[2]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, hinge);
            mesh02 = mesh;
        }

        let mesh24 = null;
        if (1) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[24], height:0.1, depth:0.1}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[2].add(v2list[4]).scale(0.5);
            mesh.position.set(vc.x, vc.y, z);
            let rad = Math.atan2(v2list[4].y-v2list[2].y, v2list[4].x-v2list[2].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);

            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(pplen[2]/2, 0, 0),
                new BABYLON.Vector3(-pplen[24]/2, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            mesh02._agg.body.addConstraint(mesh._agg.body, hinge);

            //ベクトルP2P4を pplen[23]:pplen[34] で内分する点
            let v_ = v2list[2].scale(pplen[34]).add(v2list[4].scale(pplen[23])).scale(1/(pplen[23]+pplen[34]));
            // 動輪からの相対位置
            v_.x -= meshw.position.x;
            v_.y -= meshw.position.y;
            // mesh24 を pplen[23]:pplen[34] で内分する点(x)
            let x = (-pplen[24]/2*(pplen[34]) + pplen[24]/2*(pplen[23]))/(pplen[23]+pplen[34]);
            let hinge2 = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(v_.x, v_.y, z),
                new BABYLON.Vector3(x, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshw._agg.body.addConstraint(mesh._agg.body, hinge2);

            mesh24 = mesh;
        }

        let mesh45 = null;
        if (1) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[45], height:0.1, depth:4}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.wireframe = 1;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let vc = v2list[4].add(v2list[5]).scale(0.5);
            mesh.position.set(vc.x, vc.y, z);
            let rad = Math.atan2(v2list[5].y-v2list[4].y, v2list[5].x-v2list[4].x);
            mesh.rotate(BABYLON.Vector3.Forward(), rad);

            let lock = new BABYLON.Physics6DoFConstraint(
                { pivotA: new BABYLON.Vector3(pplen[24]/2, 0, 0),
                  pivotB: new BABYLON.Vector3(-pplen[45]/2+0.5, 0, 0),},
                [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit:0, maxLimit:0, },
                 { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit:0, maxLimit:0, },
                 { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit:0, maxLimit:0, },
                 { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit:ppr[345], maxLimit:ppr[345], },
                ],
                scene);
            mesh24._agg.body.addConstraint(mesh._agg.body, lock);
            mesh45 = mesh;
        }
       

    }

    meshw.physicsBody.setAngularDamping(meshwAngDamp);
    if (bActMeshWheel) {
        scene.onBeforeRenderObservable.add(() => {
            let vdir = BABYLON.Vector3.Forward();
            vdir.scaleInPlace(impF);
            meshw._agg.body.applyAngularImpulse(vdir);
        })
    }

    return scene;
}

export var createScene = createScene_test12;


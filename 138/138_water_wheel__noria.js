// Babylon.js で物理演算(havok)：水汲み水車

export var createScene_test22 = async function () {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    {
        // とい（水流／ボールを流す経路）
        let sw=1, sw_=sw/2, sh=2, sh_=sh/2, dslp=0.01;
        const myShape = [
	    new BABYLON.Vector3(-sw_, 0, 0),
	    new BABYLON.Vector3(-sw_, -sh_, 0),
	    new BABYLON.Vector3(sw_, -sh_, 0),
	    new BABYLON.Vector3(sw_, 0, 0),
        ];
        const myPath = [
	    new BABYLON.Vector3(0, -dslp*1.3, -6),
	    new BABYLON.Vector3(0, -dslp*1.0, -4),
	    new BABYLON.Vector3(0, -dslp*0.5, -2),
	    new BABYLON.Vector3(0, 0, 0),
	    new BABYLON.Vector3(0, dslp, 2),
	    new BABYLON.Vector3(0, dslp*2, 4),
	    new BABYLON.Vector3(0, dslp*4+sh_*0.5, 6),
	    new BABYLON.Vector3(0, dslp*6+sh_*0.6, 8),
	    new BABYLON.Vector3(0, dslp*8+sh_*0.8, 10),
	    new BABYLON.Vector3(0, dslp*10+sh_*1.1, 10.1),
        ];
        const scaling = (index, distance) => {
            if (index == myPath.length-1) {
                return 0.001;
            } else if (index > 8) {
                return 1.5;
            }
	    return 1;
        };
        let mesh = BABYLON.MeshBuilder.ExtrudeShapeCustom("star", {shape: myShape, closeShape: false, path: myPath, scaleFunction: scaling, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:1.0, friction:0.001}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Green();
        // mesh.material.wireframe=1;
        mesh.material.alpha=0.6;
    }

    {
        // とい２（くみ上げた水／ボールをうけとる経路）
        let sw=0.48, sw_=sw/2, sh=2, sh_=sh/2, dslp=0.1;
        const myShape = [
	    new BABYLON.Vector3(-sw_, 0, 0),
	    new BABYLON.Vector3(-sw_, -sh_, 0),
	    new BABYLON.Vector3(sw_, -sh_, 0),
	    new BABYLON.Vector3(sw_, 0, 0),
        ];
        const myPath = [
	    new BABYLON.Vector3(0, dslp, -1.81),
	    new BABYLON.Vector3(0, dslp, -1.8),
	    new BABYLON.Vector3(0, 0, 0),  // 6
	    new BABYLON.Vector3(-0.1, -dslp*0.8, 1.2),
	    new BABYLON.Vector3(-0.2, -dslp, 1.5),
	    new BABYLON.Vector3(-0.3, -dslp, 1.7),
	    new BABYLON.Vector3(-0.5, -dslp, 1.8),
	    new BABYLON.Vector3(-1, -dslp*2, 2),
	    new BABYLON.Vector3(-2, -dslp*3, 2),
	    new BABYLON.Vector3(-3, -dslp*4, 2),
        ];
        const scaling = (index, distance) => {
            if (index == 0) {
                return 0.001;
            }
	    return 1;
        };
        let mesh = BABYLON.MeshBuilder.ExtrudeShapeCustom("star", {shape: myShape, closeShape: false, path: myPath, scaleFunction: scaling, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.001, friction:0.001}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Blue();
        mesh.material.alpha=0.6;
        mesh.physicsBody.disablePreStep = false;
        mesh.position.x = -sw_*1.2;
        mesh.position.y = 3.2;
    }

    const R30=Math.PI/6;
    const R45=Math.PI/4;
    const R60=Math.PI/3;
    const R90=Math.PI/2;
    const R180=Math.PI;

    const FILTER_GROUP_GRND = 1;
    const FILTER_GROUP_ARCH_1 = 2;
    let mesh = null;
    {
        // 水車

        // 軸（アンカー
        let mesha = null;
        if (1) {
            mesha = BABYLON.MeshBuilder.CreateCylinder("", {height:3, diameter:0.2});
            mesha._agg = new BABYLON.PhysicsAggregate(mesha, BABYLON.PhysicsShapeType.MESH, {mass:0, restitution:1.0, friction:0.001}, scene);
            mesha._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesha._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesha.physicsBody.disablePreStep = false;
            mesha.rotation = new BABYLON.Vector3(0, 0,R90);
            mesha.position.y = 2;
        }

        let r=2, bladed=1, wwr=r+bladed, www=0.9, www_=www/2;
        // 本体
        mesh = BABYLON.MeshBuilder.CreateCylinder("", {height:www_, diameter:r*2});
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, {mass:100, restitution:1.0, friction:0.001}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        mesh.rotation = new BABYLON.Vector3(0, 0,R90);
        mesh.position.x = www_/2;
        mesh.position.y = 2;
        {
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(0, -www_/2, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 1, 0),
                new BABYLON.Vector3(0, 1, 0),
                scene
            );
            mesha._agg.body.addConstraint(mesh._agg.body, hinge);
        }

        // 羽
        let nrad=4;
        for (let irad=0; irad<nrad; ++irad) {
            let rad=irad*R45;
            // ブレードを傾けて固定するために 6dof を使う
            let meshb = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:www_, depth:wwr*1.98});
            meshb._agg = new BABYLON.PhysicsAggregate(meshb, BABYLON.PhysicsShapeType.BOX, {mass:1, restitution:1.0, friction:0.001}, scene);
            meshb._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            meshb._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            meshb.physicsBody.disablePreStep = false;
            meshb.rotation = new BABYLON.Vector3(rad, 0, R90);
            meshb.position.x = www_/2;
            meshb.position.y = 2;
            let joint = new BABYLON.Physics6DoFConstraint(
                { pivotA: new BABYLON.Vector3(0, 0, 0),
                  pivotB: new BABYLON.Vector3(0, 0, 0),},
                [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit:0, maxLimit:0, },
                 { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit:0, maxLimit:0, },
                 { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit:rad, maxLimit:rad, },
                 { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit:0, maxLimit:0, },
                ],
                scene);
            mesh._agg.body.addConstraint(meshb._agg.body, joint);
        }
        // 水をくみ上げる升がわりのボウル／カップ
        let ncup=8;
        for (let icup=0; icup<ncup; ++icup) {
            let rad=icup*R45;
            let meshc = BABYLON.MeshBuilder.CreateSphere("", {diameter:www_, arc:0.5, sideOrientation:BABYLON.Mesh.DOUBLESIDE});
            meshc._agg = new BABYLON.PhysicsAggregate(meshc, BABYLON.PhysicsShapeType.MESH, {mass:1, restitution:0.001, friction:0.001}, scene);
            meshc._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            meshc._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            meshc.physicsBody.disablePreStep = false;
            meshc.rotation = new BABYLON.Vector3(rad, 0, 0);
            meshc.position.x = www_/2;
            meshc.position.y = 2+(wwr-www_)*Math.sin(rad);
            meshc.position.z = (wwr-www_)*Math.cos(rad);
            let joint = new BABYLON.Physics6DoFConstraint(
                { pivotA: new BABYLON.Vector3((wwr-www_)*Math.sin(rad), www_, (wwr-www_)*Math.cos(rad)),
                  pivotB: new BABYLON.Vector3(0, 0, 0),},
                [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit:0, maxLimit:0, },
                 { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit:0, maxLimit:0, },
                 { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit:-rad+R90+R45, maxLimit:-rad+R90+R45, },
                 { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit:0, maxLimit:0, },
                ],
                scene);
            mesh._agg.body.addConstraint(meshc._agg.body, joint);
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

    if (0) {
    // 水車の軸を回転させる
    scene.onBeforeRenderObservable.add(() => {
        let vdir = new BABYLON.Vector3(1,0,0);
        vdir.scaleInPlace(0.5);
        mesh._agg.body.applyAngularImpulse(vdir);
    })
    }


if(1) {
    // 水流代わりのボール
    let pSrc = new BABYLON.Vector3(0,1,9), ymin=-2.5;
    let balls=[], pool=[];
    let nBall = 6000, npopatonece=13;
    let popBall = function() {
        let mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.15 }, scene);
        mesh.position.copyFrom(pSrc); // 初期位置に移動
        mesh.position.addInPlace(BABYLON.Vector3.Random().scale(0.1))
        // mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.1, restitution:1.0, friction:0.001}, scene);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.1, restitution:0.1, friction:0.001}, scene);
        mesh.physicsBody.disablePreStep = false;
        mesh._valid=1;
        balls.push(mesh);
    }
    let resetPosiBall = function(mesh) {
        mesh.position.copyFrom(pSrc); // 初期位置に移動
        mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
    }
    scene.onBeforeRenderObservable.add(() => {
        for (let i=0; i<npopatonece; ++i) {
            if (pool.length > 0) {
                // pool から取り出して再利用
                let mesh = pool.shift();
                mesh._valid=1;
                resetPosiBall(mesh);
            } else if (balls.length < nBall) {
                // 新規作成
                popBall();
            }
        }
        balls.forEach((mesh) => {
            if (mesh.position.y < ymin && mesh._valid==1) {
                // ボールが下限を超えたら回収（pool に格納）
                mesh._valid=0;
                pool.push(mesh);
            }
        })
    })
}

    return scene;
}

export var createScene = createScene_test22;

// Babylon.js で物理演算(havok)：レンガでドミノ倒し
//
// 操作
// Space : 開始
// Enter : リセット
//
// ref 50 ブリック ダブルドミノエフェクト
// https://www.youtube.com/watch?v=EI_V16TZmII

export var createScene_test_952 = async function () {
    let fpath ="textures/sand.jpg";
    // let fpath ="../086/textures/sand.jpg";

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("", 14/8* Math.PI, 7/16 * Math.PI, 5, new BABYLON.Vector3(4, 1, -0.5));
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);

    let g = 98, pushF=0.03;
//    let g = 9.8, pushF=0.01;
    scene.enablePhysics(new BABYLON.Vector3(0, -g, 0), hk);

    if (1) {
        let grndW=300, grndH=300;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, friction:0.8}, scene);
    }

    let sw=0.5, sh=1.0, sd=0.3, mass = 0.02;
    let sw_=sw/2, sh_=sh/2, sd_=sd/2;
    // レンガっぽいテクスチャ
    let mat0 = new BABYLON.StandardMaterial("");
    mat0.diffuseTexture = new BABYLON.Texture(fpath, scene);
    mat0.emissiveColor = BABYLON.Color3.Red();

    let crBlock = function(p) {
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sh, depth:sd}, scene);
        mesh.position = new BABYLON.Vector3(p.x, p.y+sh_, p.z);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass:mass, startAsleep:true, friction:0.8}, scene);
        mesh.physicsBody.disablePreStep = false;
        mesh.material = mat0;
        return mesh;
    }

    let basesw=sw+0.1, basesh=0.1, basesd=sd+0.2;
    let basesw_=basesw/2, basesh_=basesh/2, basesd_=basesd/2;

    let mesh0 = null;

    let stageMesh = [];
    let crStage = function() {
        while (stageMesh.length > 0) {
            let mesh = stageMesh.pop();
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            mesh.dispose();
        }
        mesh0 = null;

        // 直線
        let p = new BABYLON.Vector3(0, 0, 0);
        for (let iz = 0; iz < 10; ++iz) {
            p.z = iz*sh*1.01;
            let mesh = crBlock(p);
            if (mesh0 == null) {
                mesh0 = mesh;
            }
            stageMesh.push(mesh);
        }
    }
    crStage();

    // デバッグ表示(debug)
    if (0) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }

    // キー入力処理
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ') {
                let p = mesh0.absolutePosition.add(new BABYLON.Vector3(0, sh/2, 0));
                let vvec = BABYLON.Vector3.Forward().scale(pushF);
                mesh0._agg.body.applyImpulse(vvec, p);
            } else if (kbInfo.event.key == 'Enter') {
                crStage();
            }
        }
    });

    return scene;
} 


export var createScene = createScene_test_952; // 直線で2段階 ドミノ倒し、ブロックの厚さ、摩擦、距離がポイント

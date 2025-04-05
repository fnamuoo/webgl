// 空中に配置した物体(mass=0)を回転させるテスト
// - 対象の物体（ターゲット）をキー操作で回転
// - 上部から玉を落とす（無限ループ
//
// キー操作
//    w,s := x軸で回転
//    a,d := z軸で回転
//    i,k := 物体のローカル座標系の x軸で回転
//    j,l := 物体のローカル座標系の z軸で回転
const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // 物理エンジンを有効にする
    const gravityVector = new BABYLON.Vector3(0, -1.5, 0);
    const physicsPlugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(2, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // 地面を設定する
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
    groundMesh.position.y = -2;
    groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMesh.material.majorUnitFrequency = 1;
    groundMesh.material.minorUnitVisibility  = 0;
    // 地面に摩擦係数、反射係数を設定する
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);


    const trgMesh = BABYLON.MeshBuilder.CreateBox("target", { width: 1, height: 2, depth: 3 }, scene);
    // ターゲットの表示位置・色
    trgMesh.position.y = 0;
    let mat = new BABYLON.StandardMaterial("mat", scene);
    mat.emissiveColor = BABYLON.Color3.Blue();
    // mat.wireframe = true;
    trgMesh.material = mat;
    // ターゲットに摩擦係数、反射係数を設定する
    var trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);

    // https://doc.babylonjs.com/typedoc/classes/BABYLON.PhysicsBody
    // -機械翻訳
    // PhysicsMotionType.STATIC   - 静的ボディは移動せず、力や衝突の影響を受けません。レベルの境界や地形に適しています。
    // PhysicsMotionType.ANIMATED - 動的ボディのように動作しますが、他のボディの影響を受けませんが、他のボディを押しのけます。
    // PhysicsMotionType.DYNAMIC  - 動的ボディは完全にシミュレートされます。移動したり、他のオブジェクトと衝突したりできます。
    //
    // trgAgg.body.setMotionType(BABYLON.PhysicsMotionType.STATIC); // default
    trgAgg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
    // trgAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);

    // https://doc.babylonjs.com/features/featuresDeepDive/physics/prestep
    // -機械翻訳
    // テレポート モードでは、ボディは接触している形状と制限された相互作用を持ちます。
    // テレポート モードは、たとえばギズモを使用してオブジェクトを配置する場合に適しています。
    // アクション モードでは、ボディはワールド内で効果的に移動して、接触している形状と相互作用します。
    // ゲーム中はアクション モードです。
    //
    // trgAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.DISABLED); // default
    trgAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
    // trgAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);

    // PhysicsMotionType | PhysicsPrestepType | 動作
    // ------------------|--------------------|---------------------------------
    //  STATIC(undef)    | DISABLED(undef)    | ×物理は静止、描画が回転
    //  ..               | TELEPORT           | 〇同期して回転
    //  ..               | ACTION             | ×物理は静止、描画が回転
    // ------------------|--------------------|---------------------------------
    //  ANIMATED         | DISABLED(undef)    | ×完全に静止
    //  ..               | TELEPORT           | 〇同期して回転
    //  ..               | ACTION             | ◎同期して回転(玉をはじく)
    // ------------------|--------------------|---------------------------------
    //  DYNAMIC          | DISABLED(undef)    | ▽回転しないが、微動
    //  ..               | TELEPORT           | △回転する。静止時に微動
    //  ..               | ACTION             | ◎同期して回転(玉をはじく)

    //                   | PhysicsPrestepType
    // PhysicsMotionType | DISABLED(undef)         | TELEPORT                | ACTION
    //  -----------------|-------------------------|-------------------------|------------
    //  STATIC (undef)   |×物理は静止、描画が回転 |〇同期して回転           |×物理は静止、描画が回転
    //  ANIMATED         |×完全に静止             |〇同期して回転           |◎同期して回転(玉をはじく)
    //  DYNAMIC          |▽回転しないが、微動     |△回転する。静止時に微動 |◎同期して回転(玉をはじく)

    // デバッグ表示
    if (1) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }

    // デバッグ表示(2) .. どちらも同じ
    if (0) {
    physicsViewer = new BABYLON.Debug.PhysicsViewer();
    for (const mesh of scene.rootNodes) {
        if (mesh.physicsBody) {
            const debugMesh = physicsViewer.showBody(mesh.physicsBody);
        }
    }
    }

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 2);
    localAxes.xAxis.parent = trgMesh;
    localAxes.yAxis.parent = trgMesh;
    localAxes.zAxis.parent = trgMesh;

    // https://www.crossroad-tech.com/entry/babylonjs-translate-keyinput
    var map ={}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"; 
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    var distance = 0.01;
    scene.registerAfterRender(function() {	
        // こちらはワールド／世界系で回転
        if ((map["a"] || map["A"])) {
            let quat = trgMesh.rotationQuaternion;
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0, 0.1);
            trgMesh.rotationQuaternion = quat2.multiply(quat);
        }
        if ((map["d"] || map["D"])) {
            let quat = trgMesh.rotationQuaternion;
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0, -0.1);
            trgMesh.rotationQuaternion = quat2.multiply(quat);
        }

        if ((map["w"] || map["W"])) {
            // physicsBody 経由でも同じ挙動に
            let quat = trgMesh.physicsBody.transformNode.rotationQuaternion;
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0.1, 0, 0);
            trgMesh.physicsBody.transformNode.rotationQuaternion = quat2.multiply(quat);
        }
        if ((map["s"] || map["S"])) {
            let quat = trgMesh.physicsBody.transformNode.rotationQuaternion;
            let quat2 = BABYLON.Quaternion.FromEulerAngles(-0.1, 0, 0);
            trgMesh.physicsBody.transformNode.rotationQuaternion = quat2.multiply(quat);
        }

        // こちらはローカルな座標系で回転(クォータニオンの掛け算の順番を入れ替えただけ)
        if (map["i"]) {
            let quat = trgMesh.rotationQuaternion;
            let quat2 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(1, 0, 0), 0.1);
            trgMesh.rotationQuaternion = quat.multiply(quat2);
        } else if (map["k"]) {
            let quat = trgMesh.rotationQuaternion;
            let quat2 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(1, 0, 0), -0.1);
            trgMesh.rotationQuaternion = quat.multiply(quat2);
        }
        if (map["j"]) {
            let quat = trgMesh.rotationQuaternion;
            let quat2 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), 0.1);
            trgMesh.rotationQuaternion = quat.multiply(quat2);
        } else if (map["l"]) {
            let quat = trgMesh.rotationQuaternion;
            let quat2 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), -0.1);
            trgMesh.rotationQuaternion = quat.multiply(quat2);
        }
    });


    // 永遠にボールを落とす
    let balls = [];
    let nBall = 300;
    for (let i = 0; i < nBall; ++i) {
        const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.1 }, scene);
        ball.position.y = 2+i*0.5;
        ball.position.x = BABYLON.Scalar.RandomRange(-0.2, 0.2)+100;
        ball.position.z = BABYLON.Scalar.RandomRange(-0.2, 0.2);
        ball.physicsAggregate = new BABYLON.PhysicsAggregate(ball, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.01, restitution:0.1}, scene);
        balls.push(ball);
    }
    scene.onBeforeRenderObservable.add(() => {
        balls.forEach((ball) => {
            if (ball.position.y < -5) {
                const phbody = ball.physicsBody;
                phbody.disablePreStep = true;
                phbody.transformNode.position.set(BABYLON.Scalar.RandomRange(-0.2, 0.2),
                                                  10,
                                                  BABYLON.Scalar.RandomRange(-0.2, 0.2));
                phbody.setLinearVelocity(new BABYLON.Vector3(0,0,0));
                phbody.setAngularVelocity(new BABYLON.Vector3(0,0,0));
                phbody.disablePreStep = false;
            }
        })
    })

    return scene;
};

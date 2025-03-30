const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // 物理エンジンを有効にする
    const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    // const physicsPlugin = new BABYLON.OimoJSPlugin();
    // const physicsPlugin = new BABYLON.CannonJSPlugin();
    const physicsPlugin = new BABYLON.AmmoJSPlugin();
    // const physicsPlugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);
    // scene.enablePhysics();

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(0, 5, -10), scene);

    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light",
        new BABYLON.Vector3(0, 1, 0), scene);

    light.intensity = 0.7;

    // 地面を設定する
    const ground = BABYLON.MeshBuilder.CreateGround("ground",
        { width: 10, height: 10 }, scene);
    ground.material = new BABYLON.GridMaterial("groundMaterial", scene);
    ground.material.majorUnitFrequency = 1;
    ground.material.minorUnitVisibility  = 0;
    // ground.material.gridOffset = new BABYLON.Vector3(0, 0, 0);

    // 地面に摩擦係数、反射係数を設定する
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
        ground, BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, friction: 0.4, restitution: 0.6 }, scene);
    // var groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.75}, scene);

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere",
        { diameter: 2, segments: 32 }, scene);
    // ボールの表示位置を設定する
    sphere.position.y = 10;
    // ボールに摩擦係数、反射係数を設定する
    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(
        sphere, BABYLON.PhysicsImpostor.SphereImpostor,
        { mass: 1, friction: 0.4, restitution: 0.6 }, scene);
    // var sphereAggregate = new BABYLON.PhysicsAggregate(sphere, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, restitution:0.75}, scene);

    var box = BABYLON.MeshBuilder.CreateBox("box", {width:2, height:0.1, depth:2});
    // box.position.set(2, 1.5, 0);
    box.position.set(0, 1.5, 0);
    box.physicsImpostor = new BABYLON.PhysicsImpostor(
        box, BABYLON.PhysicsImpostor.SphereImpostor,
        { mass: 1, friction: 0.4, restitution: 0.6 }, scene);
    // var boxAggregate = new BABYLON.PhysicsAggregate(box, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution:0.75}, scene);

    var blueMat = new BABYLON.StandardMaterial("blue", scene);
    blueMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.9);
    blueMat.alpha = 0.8;
    // blueMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.8);
    // blueMat.specularColor = new BABYLON.Color3(0.3, 0.3, 1);
    box.material = blueMat;


    var box2 = BABYLON.MeshBuilder.CreateBox("box", {width:2, height:0.1, depth:2});
    box2.position.set(2, 1.5, 0);
    box2.physicsImpostor = new BABYLON.PhysicsImpostor(
        box2, BABYLON.PhysicsImpostor.SphereImpostor,
        { mass: 1, friction: 0.4, restitution: 0.6 }, scene);
    // var boxAggregate = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution:0.75}, scene);

    var box2Mat = new BABYLON.StandardMaterial("green", scene);
    box2Mat.diffuseColor = new BABYLON.Color3(0.2, 0.9, 0.2);
    box2Mat.alpha = 0.8;
    box2.material = box2Mat;


    return scene;
};

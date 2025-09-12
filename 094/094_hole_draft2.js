// ホールゲームのテスト(2)

var createScene = async function () {
    await BABYLON.InitializeCSG2Async();

    var scene = new BABYLON.Scene(engine);

    let camera = null;
    let icamera = 0;
    if (icamera == 0) {
        camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100,-10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);
    }

    const physicsPlugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), physicsPlugin);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    let grndMeshBase;
    let grndMesh=null, grndAgg=null;
    let grndW =1000, grndH = 1000;
    {
        // 床を立体で表現
        grndMeshBase = BABYLON.MeshBuilder.CreateBox("wall", { width:grndW, height:1, depth:grndH }, scene);
        let grndMat;
        grndMat = new BABYLON.GridMaterial("", scene);
        grndMat.majorUnitFrequency = 100;
        grndMat.minorUnitVisibility  = 0.7;
        grndMeshBase.material = grndMat;
    }

    let myMesh=null, myAgg, myRini=5, myR=myRini, score=0;
    let myPosi = new BABYLON.Vector3(0, 0, -20);
    var createMy = function() {
        if (myMesh!=null) {
            myMesh.dispose();
            myMesh=null;
        }
        // 自機：穴掘り用の円形メッシュ
        myMesh = BABYLON.MeshBuilder.CreateCylinder("my", { diameter:myR*2, height:1.01}, scene,);
        myMesh.position = myPosi;
        let mat = new BABYLON.StandardMaterial("mat", scene);
        mat.specularColor = BABYLON.Color3.Black();
        mat.diffuseColor = BABYLON.Color3.Black();
        myMesh.material = mat;
    }
    var updateMySize = function() {
        let size = score;
        if (size > 500) {size=500}
        myR=myRini+size;
        createMy(myR);
        if (icamera == 1) {
            cameraDist=cameraDistIni+size;
            camera.radius = cameraDist;
            camera.heightOffset = cameraDist;
            camera.lockedTarget = myMesh;
        }
    }
    var resetMy = function() {
        myR=myRini;
        score=0;
        if (icamera == 1) {
            cameraDist=cameraDistIni;
            camera.radius = cameraDist;
            camera.heightOffset = cameraDist;
        }
    }

    const grndBaseCSG = BABYLON.CSG2.FromMesh(grndMeshBase);
    let myCSG = null;
    let grndCSG;
    var updateGround = function() {
        // ホール移動時のメッシュ更新
        if (myCSG != null) {
            grndMesh.dispose();
            grndAgg.dispose();
        }
        myCSG = BABYLON.CSG2.FromMesh(myMesh);
        grndCSG = grndBaseCSG.subtract(myCSG);
        grndMesh = grndCSG.toMesh("ground", scene);
        grndAgg = new BABYLON.PhysicsAggregate(grndMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, friction:0.99, restitution:0.01}, scene);
    }

    let istage=0, nstage=3;
    let trgMeshInfo = {};
    var createStage = function(istage) {
        if (Object.keys(trgMeshInfo).length > 0) {
            for (let key in trgMeshInfo) {
                let mesh = trgMeshInfo[key];
                mesh._agg.dispose();
                mesh.dispose();
            }
            trgMeshInfo = {};
        }
        let myPosiV = [0, 0, -20];
        if (istage == 0) {
            let n = 100;
            let adjx=0, adjy=0, adjz=0;
            for (let i =0; i < n; ++i) {
                let trgMesh = BABYLON.MeshBuilder.CreateBox("trg", { width: 2, height: 2, depth: 2 }, scene);
                let mat = new BABYLON.StandardMaterial("mat", scene);
                mat.emissiveColor = BABYLON.Color3.Blue();
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1, friction:0.99, restitution:0.05}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.x += adjx + BABYLON.Scalar.RandomRange(-10, 10);
                trgMesh.position.z += adjz + BABYLON.Scalar.RandomRange(-10, 10);
                trgMesh.position.y += adjy + i;
                trgMesh.physicsBody.disablePreStep = false;
                trgMesh._point = 1;
                trgMesh._id = i;
                trgMesh._agg = trgMesh;
                trgMeshInfo[trgMesh._id] = trgMesh;
            }
        }
        myPosi.fromArray(myPosiV);
        myMesh.position = myPosi;
    }

    createMy(myR);
    createStage(istage);
    updateGround();

    // 衝突判定：ホールに落ちたメッシュはdisposeする
    var triggerShapeExtents = new BABYLON.Vector3(grndW, 10, grndH);
    let posiTriger = new BABYLON.Vector3(0, -6, 0);
    var triggerPhys = new BABYLON.PhysicsShapeBox(posiTriger, new BABYLON.Quaternion(), triggerShapeExtents, scene);
    const triggerMesh = BABYLON.MeshBuilder.CreateBox("triggerMesh",
                                                      {width:triggerShapeExtents.x, height:triggerShapeExtents.y, depth:triggerShapeExtents.z},
                                                      scene);
    triggerPhys.isTrigger = true;
    var triggerTransform = new BABYLON.TransformNode("triggerTransform");
    var triggerBody = new BABYLON.PhysicsBody(triggerTransform, BABYLON.PhysicsMotionType.STATIC, false, scene);
    triggerBody.shape = triggerPhys;
    triggerMesh.position = posiTriger;
    physicsPlugin.onTriggerCollisionObservable.add((ev) => {
        if (ev.type === 'TRIGGER_ENTERED' && ev.collider.transformNode.name === 'trg') {
            let key = ev.collider.transformNode._id;
            let mesh = trgMeshInfo[key];
            score +=mesh._point;
            mesh._agg.dispose();
            mesh.dispose();
            delete trgMeshInfo[key];
            updateMySize();
            updateGround();
        }
    })

    var map ={};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    let quick=false, rightRoll = false, lefttRoll = false;
    let mx=1,mz=1;
    let cooltime_act = 0, cooltime_actIni = 30;
    scene.registerAfterRender(function() {
        if (map["w"] || map["ArrowUp"]) {
            myPosi.z += mz;
            updateGround();
        }
        if (map["s"] || map["ArrowDown"]) {
            myPosi.z += -mz;
            updateGround();
        }
        if (map["a"] || map["ArrowLeft"]) {
            myPosi.x += -mx;
            updateGround();
        }
        if (map["d"] || map["ArrowRight"]) {
            myPosi.x += mx;
            updateGround();
        }
    });

    return scene;
}


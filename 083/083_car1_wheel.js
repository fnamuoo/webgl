// ホイールテスト

var physicsViewer;
var useViewer;
let dynamicObjectPhysicsBody;
let trgPhysList = [];
let meshPhys = [];

const R0 = 0;
const R15 = Math.PI/12;
const R30 = Math.PI/6;
const R45 = Math.PI/4;
const R60 = Math.PI/3;
const R90 = Math.PI/2;
const R135 = Math.PI*3/4;
const R180 = Math.PI;
const R225 = Math.PI*5/4;
const R270 = Math.PI*3/2;
const R360 = Math.PI*2;

function setAutoMat(mesh, col = null) {
    if (col == "grid") {
        mesh.material = new BABYLON.GridMaterial("mat" + mesh.name);
        mesh.material.majorUnitFrequency = 1;
        mesh.material.minorUnitVisibility  = 0.15;
        return;
    }
    mesh.material = new BABYLON.StandardMaterial("mat" + mesh.name);
    if (!col) {
        col = BABYLON.Color3.Random();
    }
    mesh.material.diffuseColor = col;
    return col;
}

// --------------------------------------------------
// ------------------------------

var wheel_c1 = function (scene, opt={}) {
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;
    let coll = typeof(opt.coll) !== 'undefined' ? opt.coll : 0;

    let box1 = BABYLON.MeshBuilder.CreateBox("anc", { size: 0.5 }, scene);
    box1.position.set(adjx, adjy, adjz);
    setAutoMat(box1, "grid");
    let wh2 = BABYLON.MeshBuilder.CreateCylinder("m", { height: 0.1, diameter: 1.8, tessellation: 8 });
    wh2.position.set(adjx, -1+adjy, adjz);
    setAutoMat(wh2);
    let wh3 = BABYLON.MeshBuilder.CreateCylinder("m", { height: 0.5, diameter: 2, tessellation: 8 });
    wh3.position.set(adjx, -1+adjy, adjz);
    setAutoMat(wh3);
    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(wh2 , BABYLON.PhysicsShapeType.MESH, { mass: 0.01, restitution:1 }, scene);
    let agg3 = new BABYLON.PhysicsAggregate(wh3 , BABYLON.PhysicsShapeType.MESH, { mass: 1, restitution: 1 }, scene);

    let joint1 = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, -1, 0),
          pivotB: new BABYLON.Vector3(0, 0, 0),},
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },
        ],
        scene);
    agg1.body.addConstraint(agg2.body, joint1);

    let joint2 = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, 0, 0),
          pivotB: new BABYLON.Vector3(0, 0, 0),},
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R0, },
        ],
        scene);
    agg2.body.addConstraint(agg3.body, joint2);

    joint1.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Z,
                            BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint1.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Z, 0.1);
    joint1.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Z, 1000);

    joint2.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Y,
                            BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint2.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 2);
    joint2.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 10);

    // https://doc.babylonjs.com/features/featuresDeepDive/physics/collisionEvents/
    // Collision filtering
    // https://playground.babylonjs.com/#H4UR4Z#1
    // filterCollideMask に _*WHEEL 以外を設定することで wheel同士はすり抜け、他は衝突させる
    const FILTER_GROUP_WHEEL = 1;
    const FILTER_GROUP_NON = 0;
    agg1.shape.filterMembershipMask = FILTER_GROUP_WHEEL;
    agg2.shape.filterMembershipMask = FILTER_GROUP_WHEEL;
    agg3.shape.filterMembershipMask = FILTER_GROUP_WHEEL;
    agg1.shape.filterCollideMask = FILTER_GROUP_NON;
    agg2.shape.filterCollideMask = FILTER_GROUP_NON;
    agg3.shape.filterCollideMask = FILTER_GROUP_NON;

    if (useViewer) { physicsViewer.showConstraint(joint1); physicsViewer.showConstraint(joint2); }
//    trgPhysList.push(agg3);
    meshPhys.push([box1, agg1]);
    meshPhys.push([wh2, agg2]);
    meshPhys.push([wh3, agg3]);
};


var wheel_d1 = function (scene, opt={}) {
    // 縦向きに
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;
    let coll = typeof(opt.coll) !== 'undefined' ? opt.coll : 0;

    let box1 = BABYLON.MeshBuilder.CreateBox("anc", { size: 0.5 }, scene);
    box1.position.set(adjx, adjy, adjz);
    setAutoMat(box1, "grid");
    let wh2 = BABYLON.MeshBuilder.CreateCylinder("m", { height: 0.1, diameter: 2.4, tessellation: 8 });
    ///  xxx let wh2 = new BABYLON.TransformNode("m", scene);
    wh2.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
    // wh2.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(R90, 0, 0);
    wh2.position.set(adjx, -1+adjy, adjz);
    setAutoMat(wh2);

    // let wh3 = BABYLON.MeshBuilder.CreateCylinder("m", { height: 0.5, diameter: 2, tessellation: 8 });
    // wh3.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
    // wh3.position.set(adjx, -1+adjy, adjz);
    // setAutoMat(wh3);

    // let wh3 = new BABYLON.Mesh("m", scene);
    let wh3 = new BABYLON.TransformNode("m", scene);
    wh3.position.set(adjx, -1+adjy, adjz);
    let wh3_ = BABYLON.MeshBuilder.CreateCylinder("m", { height: 0.5, diameter: 2, tessellation: 8 });
    // wh3_.position.set(adjx, -1+adjy, adjz);
    wh3_.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
    wh3_.parent = wh3;

    // let qRot = BABYLON.Quaternion.FromEulerAngles(R90, 0, 0);
    let qRot = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(wh2 , BABYLON.PhysicsShapeType.MESH, { mass: 0.01, restitution:1 }, scene);
    // let agg2 = new BABYLON.PhysicsAggregate(wh2 , BABYLON.PhysicsShapeType.MESH, { mass: 0.01, restitution:1, rotation:qRot }, scene);

    // let agg3 = new BABYLON.PhysicsAggregate(wh3 , BABYLON.PhysicsShapeType.MESH, { mass: 1, restitution:1 }, scene);
    // // let agg3 = new BABYLON.PhysicsAggregate(wh3 , BABYLON.PhysicsShapeType.MESH, { mass: 1, restitution:1, rotation:qRot }, scene);
    let agg3_shape = new BABYLON.PhysicsShapeContainer(scene);
    {
        // const shape = new BABYLON.PhysicsShapeBox.FromMesh(wh3_); // こっちだとboxに
        const shape = new BABYLON.PhysicsShapeMesh(wh3_, scene);
        agg3_shape.addChildFromParent(wh3_.parent, shape, wh3_);

    }
    let agg3_body = new BABYLON.PhysicsBody(wh3, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
    {
        agg3_shape.material = { friction: 0.2, restitution: 0 };
        agg3_body.shape = agg3_shape;
        agg3_body.setMassProperties({ mass: 0 });
        agg3_body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
    };

    let joint1 = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, -1, 0),
          pivotB: new BABYLON.Vector3(0, 0, 0),},
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, },
         //{ axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R0, },
        ],
        scene);
    agg1.body.addConstraint(agg2.body, joint1);

    let joint2 = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, 0, 0),
          pivotB: new BABYLON.Vector3(0, 0, 0),},
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         //{ axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R0, },
        ],
        scene);
//    agg2.body.addConstraint(agg3.body, joint2);
    agg2.body.addConstraint(agg3_body, joint2);

    if (0) {
    joint1.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_X,
                            BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint1.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, 0.1);
    joint1.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_X, 1000);
    }
    if (1) {
    joint1.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Y,
                            BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint1.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 0.1);
    joint1.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 1000);
    }
    if (0) {
    joint1.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Z,
                            BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint1.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Z, 0.1);
    joint1.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Z, 1000);
    }


    if (1) {
    joint2.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_X,
                            BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint2.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, 2);
    joint2.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_X, 10);
    }
    if (0) {
    joint2.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Y,
                            BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint2.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 2);
    joint2.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 10);
    }

    // https://doc.babylonjs.com/features/featuresDeepDive/physics/collisionEvents/
    // Collision filtering
    // https://playground.babylonjs.com/#H4UR4Z#1
    // filterCollideMask に _*WHEEL 以外を設定することで wheel同士はすり抜け、他は衝突させる
    const FILTER_GROUP_WHEEL = 1;
    const FILTER_GROUP_NON = 0;
    agg1.shape.filterMembershipMask = FILTER_GROUP_WHEEL;
    agg2.shape.filterMembershipMask = FILTER_GROUP_WHEEL;
    // agg3.shape.filterMembershipMask = FILTER_GROUP_WHEEL;
    agg3_shape.filterMembershipMask = FILTER_GROUP_WHEEL;
    agg1.shape.filterCollideMask = FILTER_GROUP_NON;
    agg2.shape.filterCollideMask = FILTER_GROUP_NON;
    // agg3.shape.filterCollideMask = FILTER_GROUP_NON;
    agg3_shape.filterCollideMask = FILTER_GROUP_NON;

    if (useViewer) { physicsViewer.showConstraint(joint1); physicsViewer.showConstraint(joint2); }
//    trgPhysList.push(agg3);
    meshPhys.push([box1, agg1]);
    meshPhys.push([wh2, agg2]);
//    meshPhys.push([wh3, agg3]);
    meshPhys.push([wh3, agg3_body]);
};


let whRot = R30, whAcc = 2, whAccMax = 10; // ホイールの舵角とアクセル
const whAccMaxF = 100;
let wEJ1 = null, wEJ2 = null;
var wheel_e1 = function (scene, opt={}) {
    // 縦向きに + キー入力で操作
    // - ハンドルを切るとグラグラする..なんでだろう。回転していると特にひどい
    //   setAxisMotorMaxForce の値（第二引数）を大きくすればカチッと動くかとおもえばそうでもない
    //   2軸にしているから？
    //   mass を 0.01 から 0.1 にしたらカチッとなった。さらに 1 にするとより安定したけど動きが遅くなった。（ぬるっと動く）
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;
    let coll = typeof(opt.coll) !== 'undefined' ? opt.coll : 0;

    let box1 = BABYLON.MeshBuilder.CreateBox("anc", { size: 0.5 }, scene);
    box1.position.set(adjx, adjy, adjz);
    setAutoMat(box1, "grid");
    let wh2 = BABYLON.MeshBuilder.CreateCylinder("m", { height: 0.1, diameter: 2.4, tessellation: 8 });
    ///  xxx let wh2 = new BABYLON.TransformNode("m", scene);
    wh2.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
    // wh2.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(R90, 0, 0);
    wh2.position.set(adjx, -1+adjy, adjz);
    setAutoMat(wh2);

    // let wh3 = BABYLON.MeshBuilder.CreateCylinder("m", { height: 0.5, diameter: 2, tessellation: 8 });
    // wh3.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
    // wh3.position.set(adjx, -1+adjy, adjz);
    // setAutoMat(wh3);

    // let wh3 = new BABYLON.Mesh("m", scene);
    let wh3 = new BABYLON.TransformNode("m", scene);
    wh3.position.set(adjx, -1+adjy, adjz);
    let wh3_ = BABYLON.MeshBuilder.CreateCylinder("m", { height: 0.5, diameter: 2, tessellation: 8 });
    wh3_.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
    wh3_.parent = wh3;

    // let qRot = BABYLON.Quaternion.FromEulerAngles(R90, 0, 0);
    let qRot = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(wh2 , BABYLON.PhysicsShapeType.MESH, { mass: 1, restitution:1 }, scene);
    // let agg2 = new BABYLON.PhysicsAggregate(wh2 , BABYLON.PhysicsShapeType.MESH, { mass: 0.01, restitution:1, rotation:qRot }, scene);

    // let agg3 = new BABYLON.PhysicsAggregate(wh3 , BABYLON.PhysicsShapeType.MESH, { mass: 1, restitution:1 }, scene);
    // // let agg3 = new BABYLON.PhysicsAggregate(wh3 , BABYLON.PhysicsShapeType.MESH, { mass: 1, restitution:1, rotation:qRot }, scene);
    let agg3_shape = new BABYLON.PhysicsShapeContainer(scene);
    {
        // const shape = new BABYLON.PhysicsShapeBox.FromMesh(wh3_); // こっちだとboxに
        const shape = new BABYLON.PhysicsShapeMesh(wh3_, scene);
        agg3_shape.addChildFromParent(wh3_.parent, shape, wh3_);

    }
    let agg3_body = new BABYLON.PhysicsBody(wh3, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
    {
        agg3_shape.material = { friction: 0.2, restitution: 0 };
        agg3_body.shape = agg3_shape;
        agg3_body.setMassProperties({ mass: 0 });
        agg3_body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
    };

    let joint1 = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, -1, 0),
          pivotB: new BABYLON.Vector3(0, 0, 0),},
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0-R30, maxLimit: R0+R30, }, // 舵角を±R30に
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R0, },
        ],
        scene);
    agg1.body.addConstraint(agg2.body, joint1);

    let joint2 = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, 0, 0),
          pivotB: new BABYLON.Vector3(0, 0, 0),},
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         //{ axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R0, },
        ],
        scene);
//    agg2.body.addConstraint(agg3.body, joint2);
    agg2.body.addConstraint(agg3_body, joint2);

    if (1) {
    joint1.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Y,
                            BABYLON.PhysicsConstraintMotorType.POSITION); // VELOCITY
    // joint1.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Y,
    //                         BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint1.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 0.1);
    joint1.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 1000);
    }


    if (1) {
    joint2.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_X,
                            BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint2.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, whAcc);
    joint2.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_X, whAccMaxF);
    }

    wEJ1 = joint1;
    wEJ2 = joint2;

    // https://doc.babylonjs.com/features/featuresDeepDive/physics/collisionEvents/
    // Collision filtering
    // https://playground.babylonjs.com/#H4UR4Z#1
    // filterCollideMask に _*WHEEL 以外を設定することで wheel同士はすり抜け、他は衝突させる
    const FILTER_GROUP_WHEEL = 1;
    const FILTER_GROUP_NON = 0;
    agg1.shape.filterMembershipMask = FILTER_GROUP_WHEEL;
    agg2.shape.filterMembershipMask = FILTER_GROUP_WHEEL;
    // agg3.shape.filterMembershipMask = FILTER_GROUP_WHEEL;
    agg3_shape.filterMembershipMask = FILTER_GROUP_WHEEL;
    agg1.shape.filterCollideMask = FILTER_GROUP_NON;
    agg2.shape.filterCollideMask = FILTER_GROUP_NON;
    // agg3.shape.filterCollideMask = FILTER_GROUP_NON;
    agg3_shape.filterCollideMask = FILTER_GROUP_NON;

    if (useViewer) { physicsViewer.showConstraint(joint1); physicsViewer.showConstraint(joint2); }
//    trgPhysList.push(agg3);
    meshPhys.push([box1, agg1]);
    meshPhys.push([wh2, agg2]);
//    meshPhys.push([wh3, agg3]);
    meshPhys.push([wh3, agg3_body]);
};


// --------------------------------------------------
// ------------------------------

var createScene = function () {
    // Scene
    var scene = new BABYLON.Scene(engine);

    useViewer = true;
//    useViewer = false;

    var plugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), plugin);
    if (useViewer) {
        physicsViewer = new BABYLON.PhysicsViewer();
    }

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(1, 4, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
//    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    // Lightning
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    var light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -1, 0), scene);
    light2.intensity = 0.2;


    // 地面を設定する
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 4, height: 4 }, scene);
    groundMesh.position.y = -4;
    groundMesh.material = new BABYLON.GridMaterial("mground", scene);
    groundMesh.material.majorUnitFrequency = 1;
    groundMesh.material.minorUnitVisibility  = 0.15;

    let [meshW2,aggW2,jointW2] = [null, null, null];

    let istage = 1, nstage = 2;
    {
        for (let [mesh,agg] of meshPhys) {
            agg.dispose();
            mesh.dispose();
        }
        meshPhys = [];
        trgPhysList = [];
        if (istage == 0) {
            // 車輪の回転軸に対し、傾斜角（舵角）がずれている版
            wheel_c1(scene, {adjx:0});

        } else if (istage == 1) {
            // 車輪の回転軸に対し、傾斜角が正しい版（自動で回転）
            wheel_d1(scene, {adjx:-2});

            // 車輪の回転軸に対し、傾斜角・回転を操作（wsadで操作）
            wheel_e1(scene, {adjx:2});
        }

    }

    let keyAction = {forward:0, back:0, right:0, left:0, brake:0};
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key === 'ArrowUp' || kbInfo.event.key === 'w') {
                keyAction.forward = 1;
            } else if (kbInfo.event.key === 'ArrowDown' || kbInfo.event.key === 's') {
                keyAction.back = 1;
            }
            if (kbInfo.event.key === 'ArrowLeft' || kbInfo.event.key === 'a') {
                keyAction.left = 1;
            } else if (kbInfo.event.key === 'ArrowRight' || kbInfo.event.key === 'd') {
                keyAction.right = 1;
            }
            if (kbInfo.event.key === ' ') {
                keyAction.brake = 1;
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            if (kbInfo.event.key === 'ArrowUp' || kbInfo.event.key === 'ArrowDown' || kbInfo.event.key === 'w' || kbInfo.event.key === 's') {
                keyAction.forward = 0;
                keyAction.back = 0;
            }
            if (kbInfo.event.key === 'ArrowLeft' || kbInfo.event.key === 'ArrowRight' || kbInfo.event.key === 'a' || kbInfo.event.key === 'd') {
                keyAction.right = 0;
                keyAction.left = 0;
            }
            if (kbInfo.event.key === ' ') {
                keyAction.brake = 0;
            }
            break;
        }
    });

    scene.onBeforeRenderObservable.add(() => {
        if (keyAction.forward) {
            if (whAcc < whAccMax) {
                ++whAcc;
                console.log("whAcc=",whAcc);
                accWheel(whAcc)
            }
        } else if (keyAction.back) {
            if (whAcc > -whAccMax) {
                --whAcc;
                console.log("whAcc=",whAcc);
                accWheel(whAcc)
            }
        } else if (keyAction.brake) {
            whAcc = 0;
            console.log("whAcc=",whAcc);
            accWheel(whAcc)
            whRot = 0.0;
        }

        if (keyAction.right) {
            whRot = R30;
            rotateWheel(whRot);
            // rotateWheel(R30);
                console.log("right");
        } else if (keyAction.left) {
            whRot = -R30;
            rotateWheel(whRot);
            // rotateWheel(-R30);
                console.log("left");
        } else {
            rotateWheel(0);
        }
    });

    function accWheel(val) {
        if (wEJ2 != null) {
            whAcc = val;
            wEJ2.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, whAcc);
        }
        // let [meshW2,aggW2,jointW2] = [null, null, null];
        // meshAxle.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, rotv+val, -R90);
    }
    function rotateWheel(val) {
        if (wEJ1 != null) {
            whRot = val;
            wEJ1.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, whRot);
        }
        // let [meshW2,aggW2,jointW2] = [null, null, null];
        // meshAxle.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, rotv+val, -R90);
    }

    function InitClickForces() {
        scene.onPointerPick = (event, pickInfo) => {
            for (let aggPhys of trgPhysList) {
                aggPhys.body.applyImpulse(
                    scene.activeCamera.getDirection(BABYLON.Vector3.Forward()).scale(2000000),
                    pickInfo.pickedPoint
                );
            }
            // dynamicObjectPhysicsBody.body.applyImpulse(
            //     scene.activeCamera.getDirection(BABYLON.Vector3.Forward()).scale(2000000),
            //     pickInfo.pickedPoint
            // );
        }
    }
    InitClickForces();

    // debug
    {
        viewer = new BABYLON.Debug.PhysicsViewer(scene);
        for (let mesh of scene.rootNodes) {
            if (mesh.physicsBody) {
                viewer.showBody(mesh.physicsBody);
            } else if (mesh.physicsImpostor) {
                viewer.showImpostor(mesh.physicsImpostor, mesh);
            }
        }
    } 


    return scene;
};


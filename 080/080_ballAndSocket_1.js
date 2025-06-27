// Babylon.js で物理演算(havok)：BallAndSocketで風鈴

var physicsViewer = null;
let dynamicObjectPhysicsBody;
let trgPhysList = [];
let meshPhys = [];

const R0 = 0;
const R90 = Math.PI/2;
const R180 = Math.PI;

// const R0 = 0;
// const R30 = Math.PI/6;
// const R45 = Math.PI/4;
// const R60 = Math.PI/3;
// const R90 = Math.PI/2;
// const R135 = Math.PI*3/4;
// const R180 = Math.PI;
// const R225 = Math.PI*5/4;
// const R270 = Math.PI*3/2;
// const R360 = Math.PI*2;

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

/*

ballAndSocket_A1 | BallAndSocketConstraint のサンプル
ballAndSocket_A2 | A1 を Physics6DoFConstraint で remake

ballAndSocket_B1 | 平板（アンカー）と棒に変更した BallAndSocketConstraintサンプル
ballAndSocket_B2 | B1 を Physics6DoFConstraint で remake
ballAndSocket_B3 | メッシュを縦長に、結合位置(pivot)も変更

ballAndSocket_C2 | B2 に角度制限（南半球のみ）
ballAndSocket_C3 | B3 に角度制限（南半球のみ）

ballAndSocket_D2 | C2 に回転／モーターを追加
ballAndSocket_D3 | C3 に回転／モーターを追加

 */

// ------------------------------

var ballAndSocket_A1 = function (scene, opt={}) {
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let box1 = BABYLON.Mesh.CreateBox("ballAndSocketBox1", 1, scene);
    box1.position.set(adjx, 1+adjy, adjz);
    box1.scaling.y = 0.2;
    setAutoMat(box1, "grid");
    let box2 = BABYLON.Mesh.CreateBox("ballAndSocketBox2", 1, scene);
    box2.position.set(adjx, 1+adjy, -1+adjz);
    box2.scaling.y = 0.2;
    setAutoMat(box2);

    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    let joint = new BABYLON.BallAndSocketConstraint(
        new BABYLON.Vector3(-0.5, 0, -0.5),
        new BABYLON.Vector3(-0.5, 0, 0.5),
        new BABYLON.Vector3(0, 1, 0),
        new BABYLON.Vector3(0, 1, 0),
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([box1, agg1]);
    meshPhys.push([box2, agg2]);
};


var ballAndSocket_A2 = function (scene, opt={}) {
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let box1 = BABYLON.Mesh.CreateBox("ballAndSocketBox1", 1, scene);
    box1.position.set(adjx, 1+adjy, adjz);
    box1.scaling.y = 0.2;
    setAutoMat(box1, "grid");
    let box2 = BABYLON.Mesh.CreateBox("ballAndSocketBox2", 1, scene);
    box2.position.set(adjx, 1+adjy, -1+adjz);
    box2.scaling.y = 0.2;
    setAutoMat(box2);

    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    const joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(-0.5, 0, -0.5),
          pivotB: new BABYLON.Vector3(-0.5, 0, 0.5),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: 0, maxLimit: 0, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: 0, maxLimit: 0, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: 0, maxLimit: 0, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([box1, agg1]);
    meshPhys.push([box2, agg2]);
};


var ballAndSocket_B1 = function (scene, opt={}) {
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let box1 = BABYLON.MeshBuilder.CreateBox("m", { width: 3, height: 0.2, depth: 3 }, scene);
    box1.position.set(adjx, 1+adjy, adjz);
    box1.scaling.y = 0.2;
    setAutoMat(box1, "grid");
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 2, height: 0.2, depth: 0.2 }, scene);
    box2.position.set(adjx, -1+adjy, -1+adjz);
    setAutoMat(box2);

    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    let joint = new BABYLON.BallAndSocketConstraint(
        new BABYLON.Vector3( 0  ,-0.3, 0  ),  // pivotA
        new BABYLON.Vector3(-1.8, 0, 0),      // pivotB
        new BABYLON.Vector3(0, 1, 0),         // axisA
        new BABYLON.Vector3(0, 1, 0),         // axisB
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([box1, agg1]);
    meshPhys.push([box2, agg2]);
};

var ballAndSocket_B2 = function (scene, opt={}) {
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let box1 = BABYLON.MeshBuilder.CreateBox("m", { width: 3, height: 0.2, depth: 3 }, scene);
    box1.position.set(adjx, 1+adjy, adjz);
    box1.scaling.y = 0.2;
    setAutoMat(box1, "grid");
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 2, height: 0.2, depth: 0.2 }, scene);
    box2.position.set(adjx, -2+adjy, -1+adjz);
    setAutoMat(box2);

    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    let joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, -0.3, 0),
          pivotB: new BABYLON.Vector3(-1.8, 0, 0),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, }, // 長軸の回転制限
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },// 回転角の制限
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R180, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([box1, agg1]);
    meshPhys.push([box2, agg2]);
};

var ballAndSocket_B3 = function (scene, opt={}) {
    // 直観的には、こちら（長軸をY軸）が率直なきがするが、長軸の回転が抑えられている感じがある
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let box1 = BABYLON.MeshBuilder.CreateBox("m", { width: 3, height: 0.2, depth: 3 }, scene);
    box1.position.set(adjx, 1+adjy, adjz);
    box1.scaling.y = 0.2;
    setAutoMat(box1, "grid");
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 0.2, height: 2, depth: 0.2 }, scene);
    box2.position.set(adjx, -2+adjy, -1+adjz);
    setAutoMat(box2);

    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    let joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, -0.3, 0),
          pivotB: new BABYLON.Vector3(0, 1.8, 0),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: -R90, maxLimit: R90, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: -R90, maxLimit: R90, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([box1, agg1]);
    meshPhys.push([box2, agg2]);
};



var ballAndSocket_C2 = function (scene, opt={}) {
    // 南半球に動きを制限
    // - １つの軸の制限だけで
    // 自然な振り子な感じ？
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let box1 = BABYLON.MeshBuilder.CreateBox("m", { width: 3, height: 0.2, depth: 3 }, scene);
    box1.position.set(adjx, 1+adjy, adjz);
    box1.scaling.y = 0.2;
    setAutoMat(box1, "grid");
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 2, height: 0.2, depth: 0.2 }, scene);
    box2.position.set(adjx, -2+adjy, -1+adjz);
    setAutoMat(box2);

    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    const joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, -0.3, 0),
          pivotB: new BABYLON.Vector3(-1.8, 0, 0),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, }, // 長軸の回転制限
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },// 回転角の制限
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R180, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([box1, agg1]);
    meshPhys.push([box2, agg2]);
};


var ballAndSocket_C3 = function (scene, opt={}) {
    // 南半球に動きを制限
    // - ２つの軸の制限が必要
    // 直観的には、こちら（長軸をY軸）が率直なきがするが、長軸の回転が抑えられている感じがある
    // 回転が抑えられる分、強制的な動き、跳ねる感じがある
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let box1 = BABYLON.MeshBuilder.CreateBox("m", { width: 3, height: 0.2, depth: 3 }, scene);
    box1.position.set(adjx, 1+adjy, adjz);
    box1.scaling.y = 0.2;
    setAutoMat(box1, "grid");
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 0.2, height: 2, depth: 0.2 }, scene);
    box2.position.set(adjx, -2+adjy, -1+adjz);
    setAutoMat(box2);

    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    const joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, -0.3, 0),
          pivotB: new BABYLON.Vector3(0, 1.8, 0),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: -R90, maxLimit: R90, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: -R90, maxLimit: R90, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([box1, agg1]);
    meshPhys.push([box2, agg2]);
};

// ----------------------------------------

var ballAndSocket_D2 = function (scene, opt={}) {
    // .. モーター回転で、振れ幅が小さくなったときに、長軸で回転が始まる？
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let box1 = BABYLON.MeshBuilder.CreateBox("m", { width: 3, height: 0.2, depth: 3 }, scene);
    box1.position.set(adjx, 1+adjy, adjz);
    box1.scaling.y = 0.2;
    setAutoMat(box1, "grid");
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 2, height: 0.2, depth: 0.2 }, scene);
    box2.position.set(adjx, -2+adjy, -1+adjz);
    setAutoMat(box2);

    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    const joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, -0.3, 0),
          pivotB: new BABYLON.Vector3(-1.8, 0, 0),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, }, // 長軸の回転制限
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },// 回転角の制限
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R180, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    joint.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_X,
                           BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, 1);
    joint.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_X, 5);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([box1, agg1]);
    meshPhys.push([box2, agg2]);
};

var ballAndSocket_D3 = function (scene, opt={}) {
    // 直観的には、こちら（長軸をY軸）が率直なきがするが、長軸の回転が抑えられている感じがある
    // 回転が抑えられる分、強制的な動き、跳ねる感じがある
    // .. モーター回転で、振り子のようにまわってる
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let box1 = BABYLON.MeshBuilder.CreateBox("m", { width: 3, height: 0.2, depth: 3 }, scene);
    box1.position.set(adjx, 1+adjy, adjz);
    box1.scaling.y = 0.2;
    setAutoMat(box1, "grid");
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 0.2, height: 2, depth: 0.2 }, scene);
    box2.position.set(adjx, -2+adjy, -1+adjz);
    setAutoMat(box2);

    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    const joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, -0.3, 0),
          pivotB: new BABYLON.Vector3(0, 1.8, 0),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: -R90, maxLimit: R90, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: -R90, maxLimit: R90, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    joint.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Y,
                           BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 1);
    joint.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 5);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([box1, agg1]);
    meshPhys.push([box2, agg2]);
};




// --------------------------------------------------
// ------------------------------

var createScene = function () {
    // Scene
    var scene = new BABYLON.Scene(engine);

    let useViewer = true;
//    let useViewer = false;

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
    if (0) {
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 4, height: 4 }, scene);
    groundMesh.position.y = -4;
    groundMesh.material = new BABYLON.GridMaterial("mground", scene);
    groundMesh.material.majorUnitFrequency = 1;
    groundMesh.material.minorUnitVisibility  = 0.15;
    }

    let istage = 1;
    {
        for (let [mesh,agg] of meshPhys) {
            agg.dispose();
            mesh.dispose();
        }
        meshPhys = [];
        trgPhysList = [];
        if (istage == 0) {
            // demo1
            ballAndSocket_B1(scene, {adjx:0, adjz:0});

        } else if (istage == 1) {
            // demo
            // 左から(B1:BallAndSocket, B2:6DoF（水平で結合）, B3:6DoF（垂直で結合）
            ballAndSocket_B1(scene, {adjx:-5, adjz:0});
            ballAndSocket_B2(scene, {adjx:0, adjz:0});
            ballAndSocket_B3(scene, {adjx:5, adjz:0});

        } else if (istage == 2) {
            // demo
            // 左から(C2:6DoF（水平で結合＆半球）, C3:6DoF（垂直で結合＆半球）
            ballAndSocket_C2(scene, {adjx:-3, adjz:0});
            ballAndSocket_C3(scene, {adjx:3, adjz:0});

        } else if (istage == 3) {
            // demo
            // 左から(C2:6DoF（水平で結合＆半球＆モーター）, C3:6DoF（垂直で結合＆半球＆モーター）
            ballAndSocket_D2(scene, {adjx:-3, adjz:0});
            ballAndSocket_D3(scene, {adjx:3, adjz:0});


        } else if (istage == 9) {

            // 画面：左列・手前
            ballAndSocket_B1(scene, {adjx:-5, adjz:0});
            //       左列・中央
            ballAndSocket_B2(scene, {adjx:-5, adjz:5});
            //       左列・奥
            ballAndSocket_B3(scene, {adjx:-5, adjz:10});

            //       中央列・中央
            ballAndSocket_C2(scene, {adjx:0, adjz:5});
            //       中央列・奥
            ballAndSocket_C3(scene, {adjx:0, adjz:10});

            //       右列・中央
            ballAndSocket_D2(scene, {adjx:5, adjz:5});
            //       右列・奥
            ballAndSocket_D3(scene, {adjx:5, adjz:10});
        }
    }


    function InitClickForces() {
        scene.onPointerPick = (event, pickInfo) => {
            for (let aggPhys of trgPhysList) {
                aggPhys.body.applyImpulse(
                    scene.activeCamera.getDirection(BABYLON.Vector3.Forward()).scale(10),
                    pickInfo.pickedPoint
                );
            }
        }
    }
    InitClickForces();

    return scene;
};


// 車テスト

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

let whRot = R30, whAcc = 2, whAccMax = 10; // ホイールの舵角とアクセル
const whAccMaxF = 100;
let wEJ1 = null, wEJ2 = null;
let wheelRotJoint=[], wheelAccJoint=[];

var car_a1 = function (scene, opt={}) {
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;
    let coll = typeof(opt.coll) !== 'undefined' ? opt.coll : 0;

    // シャーシ：本体
    let bodyw = 2, bodyh = 0.5, bodyd = 4, bodyw_=bodyw/2, bodyh_=bodyh/2, bodyd_=bodyd/2;
    let box1 = BABYLON.MeshBuilder.CreateBox('carbody', { width: bodyw, height: bodyh, depth: bodyd }, scene);
    box1.position.set(adjx, adjy, adjz);
    setAutoMat(box1, "grid");
    let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:1 }, scene);
    const FILTER_GROUP_CAR = 1;
    const FILTER_GROUP_NON = 0;
    agg1.shape.filterMembershipMask = FILTER_GROUP_CAR;
    agg1.shape.filterCollideMask = FILTER_GROUP_NON;
    meshPhys.push([box1, agg1]);

    function createWheel(scene, opt={}) {
        let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
        let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
        let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;
        //
        let px = typeof(opt.px) !== 'undefined' ? opt.px : 0;
        let py = typeof(opt.py) !== 'undefined' ? opt.py : 0;
        let pz = typeof(opt.pz) !== 'undefined' ? opt.pz : 0;
        let wheel2r = typeof(opt.wheel2r) !== 'undefined' ? opt.wheel2r : 2;

        // let wh2 = BABYLON.MeshBuilder.CreateCylinder("m", { height: 0.1, diameter: wheel2r, tessellation: 8 });
        let wh2 = BABYLON.MeshBuilder.CreateBox('axel', { size:0.5 }, scene);
        wh2.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
        wh2.position.set(px+adjx, py+adjy, pz+adjz);
        setAutoMat(wh2);

        let wh3 = new BABYLON.TransformNode("m", scene);
        wh3.position.set(px+adjx, py+adjy, pz+adjz);
        let wh3_ = BABYLON.MeshBuilder.CreateCylinder("m", { height: 0.5, diameter: wheel2r, tessellation: 8 });
        wh3_.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
        wh3_.parent = wh3;

        let qRot = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
        let agg2 = new BABYLON.PhysicsAggregate(wh2 , BABYLON.PhysicsShapeType.MESH, { mass: 1, restitution:1 }, scene);
        let agg3_shape = new BABYLON.PhysicsShapeContainer(scene);
        const shape = new BABYLON.PhysicsShapeMesh(wh3_, scene);
        agg3_shape.addChildFromParent(wh3_.parent, shape, wh3_);

        let agg3_body = new BABYLON.PhysicsBody(wh3, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
        agg3_shape.material = { friction: 0.2, restitution: 0 };
        agg3_body.shape = agg3_shape;
        agg3_body.setMassProperties({ mass: 0 });
        agg3_body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);

        let joint1 = new BABYLON.Physics6DoFConstraint(
            { pivotA: new BABYLON.Vector3(0, -1, 0),
              pivotB: new BABYLON.Vector3(0, 0, 0),},
            [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
             { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, },
             { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R0, },
            ],
            scene);
        agg1.body.addConstraint(agg2.body, joint1);

        let joint2 = new BABYLON.Physics6DoFConstraint(
            { pivotA: new BABYLON.Vector3(0, 0, 0),
              pivotB: new BABYLON.Vector3(0, 0, 0),},
            [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
             { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },
             { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R0, },
            ],
            scene);
        agg2.body.addConstraint(agg3_body, joint2);

        joint1.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Y,
                                BABYLON.PhysicsConstraintMotorType.POSITION);
        joint1.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 0.0);
        joint1.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 1000);

        joint2.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_X,
                                BABYLON.PhysicsConstraintMotorType.VELOCITY);
        joint2.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, whAcc);
        joint2.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_X, whAccMaxF);

        agg2.shape.filterMembershipMask = FILTER_GROUP_CAR;
        agg3_shape.filterMembershipMask = FILTER_GROUP_CAR;
        agg2.shape.filterCollideMask = FILTER_GROUP_NON;
        agg3_shape.filterCollideMask = FILTER_GROUP_NON;
        meshPhys.push([wh2, agg2]);
        meshPhys.push([wh3, agg3_body]);

        return [joint1, joint2, wh2, agg2, wh3, agg3_shape]
    }

    let axelx=bodyw_+0.5;
    opt.px=axelx; opt.py=-bodyh; opt.pz=bodyd_;
    let [FRjoint1, FRjoint2, FRwh2, FRagg2, FRwh3, FRagg3_shape] = createWheel(scene, opt);
    opt.px=-axelx; opt.py=-bodyh; opt.pz=bodyd_;
    let [FLjoint1, FLjoint2, FLwh2, FLagg2, FLwh3, FLagg3_shape] = createWheel(scene, opt);
    opt.px=axelx; opt.py=-bodyh; opt.pz=-bodyd_;
    let [RRjoint1, RRjoint2, RRwh2, RRagg2, RRwh3, RRagg3_shape] = createWheel(scene, opt);
    opt.px=-axelx; opt.py=-bodyh; opt.pz=-bodyd_;
    let [RLjoint1, RLjoint2, RLwh2, RLagg2, RLwh3, RLagg3_shape] = createWheel(scene, opt);

    wheelRotJoint.push(FRjoint1);
    wheelRotJoint.push(FLjoint1);
    wheelAccJoint.push(RRjoint2);
    wheelAccJoint.push(RLjoint2);

}


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

    let istage = 9, nstage = 10;
    {
        for (let [mesh,agg] of meshPhys) {
            agg.dispose();
            mesh.dispose();
        }
        meshPhys = [];
        trgPhysList = [];
        // if (istage == 0) {
        // } else if (istage == 9) 
        {
            car_a1(scene, {});
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
        for (let wEJ2 of wheelAccJoint) {
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
        for (let wEJ1 of wheelRotJoint) {
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

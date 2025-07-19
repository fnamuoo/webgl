// RigidVehicle

// local
// const grndTxt = "textures/BoxySVG_test1_3_400x300.png";
// local(2)
const grndTxt = "../066/textures/BoxySVG_test1_3_400x300.png";
// PlayGround
// const grndTxt = "https://raw.githubusercontent.com/fnamuoo/webgl/main/042/pic/BoxySVG_test1_3_400x300.png";

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

let whRot = R30, whAcc = 2, whAccMax = 100; // ホイールの舵角とアクセル

class RigidCarB1 {
    //
    // - 4WDで。FRにすると前輪がロック状態（舵角は動くけど
    // - たまにホイールが地面に固定される？なぜ？
    // - スピードがでると、車体がぶれる。タイヤの跳ね上がりをダイレクトにボディに反映して、ボディが傾く。
    scene_ = null;
    meshBody_ = null;
    aggBody_ = null;
    wheelRotJoint_ = [];
    wheelAccJoint_ = [];
    pitchMtrMinForce_ = 0.1;
    pitchMtrMaxForce_ = 1;
    mainBodyMass_ = 10;
    mainBodyJumpForce_ = 800;

    constructor(scene, opt={}) {
        this.scene_ = scene;
        this.createBody(opt);
    }

    createBody(opt={}) {
        let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
        let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
        let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;
        let coll = typeof(opt.coll) !== 'undefined' ? opt.coll : 0;
        let scene = this.scene_;

        // シャーシ：本体
        let bodyw = 2, bodyh = 0.5, bodyd = 4, bodyw_=bodyw/2, bodyh_=bodyh/2, bodyd_=bodyd/2;
        let box1 = BABYLON.MeshBuilder.CreateBox('carbody', { width: bodyw, height: bodyh, depth: bodyd }, scene);
        box1.position.set(adjx, adjy, adjz);
        setAutoMat(box1, "grid");
        let agg1 = new BABYLON.PhysicsAggregate(box1, BABYLON.PhysicsShapeType.BOX, { mass: this.mainBodyMass_, restitution:1, friction:0.8 }, scene);
        const FILTER_GROUP_CAR = 1;
        const FILTER_GROUP_NON = 0;
        agg1.shape.filterMembershipMask = FILTER_GROUP_CAR;
        agg1.shape.filterCollideMask = FILTER_GROUP_NON;
        meshPhys.push([box1, agg1]);

        this.meshBody_ = box1;
        this.aggBody_ = agg1;

        function createWheel(scene, opt={}) {
            let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
            let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
            let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;
            //
            let px = typeof(opt.px) !== 'undefined' ? opt.px : 0;
            let py = typeof(opt.py) !== 'undefined' ? opt.py : 0;
            let pz = typeof(opt.pz) !== 'undefined' ? opt.pz : 0;
            let wheel2r = typeof(opt.wheel2r) !== 'undefined' ? opt.wheel2r : 2;
            let pitchMtrMaxForce = typeof(opt.pitchMtrMaxForce) !== 'undefined' ? opt.pitchMtrMaxForce : 0.1;

            let wh2 = BABYLON.MeshBuilder.CreateBox('axle', { size:0.5 }, scene);
            wh2.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
            wh2.position.set(px+adjx, py+adjy, pz+adjz);
            setAutoMat(wh2);

            let wh3 = new BABYLON.TransformNode("m", scene);
            wh3.position.set(px+adjx, py+adjy, pz+adjz);
            let wh3_ = BABYLON.MeshBuilder.CreateCylinder("m", { height: 0.5, diameter: wheel2r, tessellation: 128 });
            wh3_.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
            wh3_.parent = wh3;

            let qRot = BABYLON.Quaternion.FromEulerAngles(0, 0, R90);
            let agg2 = new BABYLON.PhysicsAggregate(wh2 , BABYLON.PhysicsShapeType.MESH, { mass: 1, restitution:1 }, scene);
            // agg2.shape.material = { friction: 0.8, restitution: 1 };
            let agg3_shape = new BABYLON.PhysicsShapeContainer(scene);
            const shape = new BABYLON.PhysicsShapeMesh(wh3_, scene);
            agg3_shape.addChildFromParent(wh3_.parent, shape, wh3_);

            let agg3_body = new BABYLON.PhysicsBody(wh3, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
            agg3_shape.material = { friction: 10.8, restitution: 1 };
            agg3_body.shape = agg3_shape;
            agg3_body.setMassProperties({ mass: 0.1 });
            agg3_body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);

            let joint1 = new BABYLON.Physics6DoFConstraint(
                { pivotA: new BABYLON.Vector3(px, py, pz),
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

            // ヨー/yaw/舵角方向
            joint1.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Y,
                                    BABYLON.PhysicsConstraintMotorType.POSITION);
            joint1.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 0.0);
            joint1.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 1000);

            // ピッチ/pitch/ホイールの順回転
            joint2.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_X,
                                    BABYLON.PhysicsConstraintMotorType.VELOCITY);
            joint2.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, 0); // whAcc
            joint2.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_X, pitchMtrMaxForce); // whAccMaxF
            

            agg2.shape.filterMembershipMask = FILTER_GROUP_CAR;
            agg3_shape.filterMembershipMask = FILTER_GROUP_CAR;
            agg2.shape.filterCollideMask = FILTER_GROUP_NON;
            agg3_shape.filterCollideMask = FILTER_GROUP_NON;
            meshPhys.push([wh2, agg2]);
            meshPhys.push([wh3, agg3_body]);

            return [joint1, joint2, wh2, agg2, wh3, agg3_shape]
        }

        let axelx=bodyw_+0.5;
        opt.px=axelx; opt.py=0; opt.pz=bodyd_; opt.pitchMtrMaxForce=100;
        let [FRjoint1, FRjoint2, FRwh2, FRagg2, FRwh3, FRagg3_shape] = createWheel(scene, opt);
        opt.px=-axelx; opt.py=0; opt.pz=bodyd_; opt.pitchMtrMaxForce=100;
        let [FLjoint1, FLjoint2, FLwh2, FLagg2, FLwh3, FLagg3_shape] = createWheel(scene, opt);
        opt.px=axelx; opt.py=0; opt.pz=-bodyd_; opt.pitchMtrMaxForce=100;
        let [RRjoint1, RRjoint2, RRwh2, RRagg2, RRwh3, RRagg3_shape] = createWheel(scene, opt);
        opt.px=-axelx; opt.py=0; opt.pz=-bodyd_; opt.pitchMtrMaxForce=100;
        let [RLjoint1, RLjoint2, RLwh2, RLagg2, RLwh3, RLagg3_shape] = createWheel(scene, opt);

        this.pitchMtrMaxForce_ = opt.pitchMtrMaxForce;

        this.wheelRotJoint_.push(FRjoint1);
        this.wheelRotJoint_.push(FLjoint1);

        this.wheelAccJoint_.push(FRjoint2);
        this.wheelAccJoint_.push(FLjoint2);
        this.wheelAccJoint_.push(RRjoint2);
        this.wheelAccJoint_.push(RLjoint2);
    }


    accWheel(val) {
        if (val == 0) {
            for (let wEJ2 of this.wheelAccJoint_) {
                wEJ2.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_X, this.pitchMtrMinForce_);
                whAcc = val;
                wEJ2.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, whAcc);
            }
        } else {
            for (let wEJ2 of this.wheelAccJoint_) {
                wEJ2.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_X, this.pitchMtrMaxForce_);
                whAcc = val;
                wEJ2.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, whAcc);
            }
        }
    }

    rotateWheel(val) {
        for (let wEJ1 of this.wheelRotJoint_) {
            whRot = val;
            wEJ1.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, whRot);
        }
    }

    jump_() {
        this.aggBody_.body.applyForce(new BABYLON.Vector3(0, this.mainBodyJumpForce_, 0), this.meshBody_.absolutePosition);
    }

    jump() {
        this.aggBody_.body.disablePreStep = true;
        this.jump_();
        this.aggBody_.body.disablePreStep = false;
    }

    resetPosture() {
        this.aggBody_.body.disablePreStep = true;
        if (this.meshBody_.position.y < 2) {
            // まっすぐ 上昇させる
            this.jump_();
        }
        let eular = this.meshBody_.rotationQuaternion.toEulerAngles()
        let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
        this.aggBody_.body.setAngularVelocity(BABYLON.Vector3.Zero());
        this.aggBody_.body.rotationQuaternion = quat;
        this.meshBody_.rotationQuaternion = quat;
        this.aggBody_.body.disablePreStep = false;
    }


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

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.rotationOffset = 180;
    camera.radius = 3;
    camera.heightOffset = 1.1;
    camera.cameraAcceleration = 0.1;
    camera.maxCameraSpeed = 30;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 0;

    // Lightning
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    var light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -1, 0), scene);
    light2.intensity = 0.2;


    // 地面を設定する
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 4, height: 4 }, scene);
    groundMesh.position.y = -4;
    groundMesh.material = new BABYLON.GridMaterial("mground", scene);
    groundMesh.material.majorUnitFrequency = 10;
    groundMesh.material.minorUnitVisibility  = 0.15;

    let [meshW2,aggW2,jointW2] = [null, null, null];

    let vehicle = null;

    {
        for (let [mesh,agg] of meshPhys) {
            agg.dispose();
            mesh.dispose();
        }
        meshPhys = [];
        trgPhysList = [];
        {
            {
                const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);
                groundMesh.position.y = -3;
                groundMesh.material = new BABYLON.GridMaterial("mground", scene);
                groundMesh.material.majorUnitFrequency = 10;
                groundMesh.material.minorUnitVisibility  = 0.15;
                var grndAgg = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01, friction:10.9}, scene);
            }
            {
                const groundMesh2 = BABYLON.MeshBuilder.CreateGround("ground", { width: 400, height: 300 }, scene);
                groundMesh2.position.y = -2.9;
                var matgnd = new BABYLON.StandardMaterial("mat1", scene);
                matgnd.diffuseTexture = new BABYLON.Texture(grndTxt, scene);
                groundMesh2.material = matgnd;
                var grndAgg = new BABYLON.PhysicsAggregate(groundMesh2, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01, friction:1.9}, scene);
            }

            vehicle = new RigidCarB1(scene);
            vehicle.resetPosture();
            camera.lockedTarget = vehicle.meshBody_;
        }

    }

    let keyAction = {forward:0, back:0, right:0, left:0, brake:0, reset:0};
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
            if (kbInfo.event.key === 'r') {
                keyAction.reset = 1;
            }

            if (kbInfo.event.key == 'c') {
                icamera = (icamera+1) % 4;
                console.log("camera=",icamera);
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 3;
                    camera.heightOffset = 1.1;
                    camera.cameraAcceleration = 0.1;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 20;
                    camera.heightOffset = 8;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 1;
                    camera.heightOffset = 20;
                    camera.cameraAcceleration = 0.5;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.5;
                    camera.heightOffset = 0.1;
                    camera.cameraAcceleration = 0.3;
                    camera.maxCameraSpeed = 30;
                }
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
            if (kbInfo.event.key === 'r') {
                keyAction.reset = 0;
            }
            break;
        }
    });

    scene.onBeforeRenderObservable.add(() => {
        if (keyAction.forward) {
            if (whAcc < whAccMax) {
                whAcc += 0.5;
            }
            vehicle.accWheel(whAcc);

        } else if (keyAction.back) {
            if (whAcc > -whAccMax) {
                whAcc -= 0.5;;
            }
            vehicle.accWheel(whAcc);
        } else {
            if (whAcc > 0.1) {
                whAcc *= 0.9;
            } else {
                whAcc = 0;
            }
            vehicle.accWheel(0);
        }
        if (keyAction.brake) {
            // whAcc = 0;
        }

        if (keyAction.right) {
            vehicle.rotateWheel(R30);
        } else if (keyAction.left) {
            vehicle.rotateWheel(-R30);
        } else {
            vehicle.rotateWheel(0);
        }

        if (keyAction.reset) {
            vehicle.resetPosture();
        }

    });


    function InitClickForces() {
        scene.onPointerPick = (event, pickInfo) => {
            for (let aggPhys of trgPhysList) {
                aggPhys.body.applyImpulse(
                    scene.activeCamera.getDirection(BABYLON.Vector3.Forward()).scale(2000000),
                    pickInfo.pickedPoint
                );
            }
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


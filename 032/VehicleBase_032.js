// mode:javascript

import * as THREE from "three";
import * as CANNON from "cannon";

class VehicleBase {
    scene_;
    world_;
    moGroundMtr_;
    moVehicle_;
    moChassisBody_;
    viChassisMesh_;
    viWheelMeshes_ = [];
    // viWheelGeos_ = [];
    sidebrake_ = 0;
    shiftlever_ = 1;
    // トルク曲線／エンジン性能曲線を模した二次関数の係数
    shiftleverMin_ = 1;
    shiftleverMax_ = 3;
    // トルク曲線／エンジン性能曲線を模した二次関数の係数 y = a*(x-s)^2 + b
    //                        a    b     s    y=0となるx(大きい方)
    shiftleverFuncFactor = [[-4  , 1   , 0.2, 0.7],
                            [-2  , 0.85, 0.7, 1.352],
                            [-0.6, 0.8 , 1.2, 2.355]
                           ];
    gearfa_ = -4;
    gearfb_ = 1;
    gearfx_ = 0.2;
    // そのギアでの最大回転数
    deltaRotMax_ = 0.7;

    // 重量
    mass_ = 100; // 150;
    // ステアリング角度、舵角
    maxSteerVal_ = 0.5;
    // スライドフラグ？
    sliding_ = false;

    // エンジン出力
    maxForce_ = 200; // 300;
    // ブレーキの強さ
    // brakeForce_ = 1000000;
    brakeForceF_ =  8;
    brakeForceR_ = 10;

    // サスペンションの硬さ
    suspensionStiffnessF_ = 30; // 30;
    suspensionStiffnessR_ = 30; // 30;
    // サスペンションの長さ(~=車高)
    suspensionRestLength_ = 0.5; // 0.3;
    // 摩擦...グリップ力？
    //  弱：曲がらない、すべる。アンダーステア
    //  強：曲がる。オーバーステア
    frictionSlipF_ = 3; // 3; // 1.4
    frictionSlipR_ = 3;

    // サスペンション
    //  弱：ホイールが車体にめり込む、オーバーステアになりがち
    //  強：車体が上がる、ウィリーしやすい？アンダーが出やすい
    maxSuspensionForceF_ = 4000;
    maxSuspensionForceR_ = 4000; // 100000;

    // 地面とタイヤの摩擦係数
    wheelFriction_ = 0.9;

    constructor(scene, world, moGroundMtr) {
        this.scene_ = scene;
        this.world_ = world;
        this.moGroundMtr_ = moGroundMtr;
    }

    initBody() {
        const moChassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 0.8))
        this.moChassisBody_ = new CANNON.Body({
            mass: this.mass_,
            shape: moChassisShape,
            position: new CANNON.Vec3(0, 1, 0),
        })
        const viChassisGeo = new THREE.BoxGeometry(4, 1, 1.6);
        // const viChassisMtr = new THREE.MeshNormalMaterial();
        const viChassisMtr = new THREE.MeshNormalMaterial({wireframe:true});
        this.viChassisMesh_ = new THREE.Mesh(viChassisGeo, viChassisMtr);
        this.viChassisMesh_.position.copy(this.moChassisBody_.position);
        this.viChassisMesh_.quaternion.copy(this.moChassisBody_.quaternion);
        this.scene_.add(this.viChassisMesh_);
    }

    init() {
        this.initBody()

        // Create the vehicle
        // const moVehicle = new CANNON.RaycastVehicle({chassisBody:moChassisBody})
        // const moVehicle = new CANNON.RaycastVehicle({
        this.moVehicle_ = new CANNON.RaycastVehicle({
            chassisBody: this.moChassisBody_,
            sliding: this.sliding_,
        })

        const wheelOptions = {
            radius: 0.5,// 0.8,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: this.suspensionStiffnessF_,  // 30,
            suspensionRestLength: this.suspensionRestLength_, // 0.3,
            frictionSlip: this.frictionSlipF_, // 1.4,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: this.maxSuspensionForceF_, // 100000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(0, 0, 1),
            chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,  // def -0.1
            useCustomSlidingRotationalSpeed: true,  // def:false
        }

        // 埋め込む場合
        wheelOptions.chassisConnectionPointLocal.set(-1.3, 0, 1)
        this.moVehicle_.addWheel(wheelOptions)
        wheelOptions.chassisConnectionPointLocal.set(-1.3, 0, -1)
        this.moVehicle_.addWheel(wheelOptions)

        wheelOptions.chassisConnectionPointLocal.set(1.3, 0, 1)
        wheelOptions.suspensionStiffness = this.suspensionStiffnessR_;
        wheelOptions.frictionSlip = this.frictionSlipR_;
        wheelOptions.maxSuspensionForce = this.maxSuspensionForceR_;
        this.moVehicle_.addWheel(wheelOptions)
        wheelOptions.chassisConnectionPointLocal.set(1.3, 0, -1)
        wheelOptions.frictionSlip = this.frictionSlipR_;
        wheelOptions.maxSuspensionForce = this.maxSuspensionForceR_;
        this.moVehicle_.addWheel(wheelOptions)

        this.moVehicle_.addToWorld(this.world_)

        // Add the wheel bodies
        const moWheelMtr = new CANNON.Material('wheel');
        const moWheelBodies = [];
        // const viWheelMeshes = [];
        // const viWheelGeos = [];
        this.moVehicle_.wheelInfos.forEach((wheel) => {
            const moWheelShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius*0.8, 20)
            const moWheelBody = new CANNON.Body({
                mass: 0,
                material: moWheelMtr,
            })
            moWheelBody.type = CANNON.Body.KINEMATIC
            moWheelBody.collisionFilterGroup = 0 // turn off collisions  .. ホイールがめり込んでいるから必須
            const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0)
            moWheelBody.addShape(moWheelShape, new CANNON.Vec3(), quaternion)
            moWheelBodies.push(moWheelBody)
            const viWheelGeo = new THREE.CylinderGeometry(wheel.radius, wheel.radius, wheel.radius*0.8, 20);
            viWheelGeo.rotateX(Math.PI/2);
            //    const viWheelMtr = new THREE.MeshNormalMaterial();
            const viWheelMtr = new THREE.MeshNormalMaterial({wireframe:true});
            const viWheelMesh = new THREE.Mesh(viWheelGeo, viWheelMtr);
            this.scene_.add(viWheelMesh);
            this.world_.addBody(moWheelBody)
            this.viWheelMeshes_.push(viWheelMesh);
            // this.viWheelGeos_.push(viWheelGeo);
        })

        // Update the wheel bodies
        this.world_.addEventListener('postStep', () => {
            for (let i = 0; i < this.moVehicle_.wheelInfos.length; i++) {
                this.moVehicle_.updateWheelTransform(i)
                const transform = this.moVehicle_.wheelInfos[i].worldTransform
                const moWheelBody = moWheelBodies[i]
                moWheelBody.position.copy(transform.position)
                moWheelBody.quaternion.copy(transform.quaternion)
            }
        })


        const wheel_ground = new CANNON.ContactMaterial(moWheelMtr, this.moGroundMtr_, {
            friction: this.wheelFriction_,  // 0.9,  // 摩擦係数(def=0.3)
            restitution: 0, // 0,  // 反発係数 (def=0.3)
            contactEquationStiffness: 1e7,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
        })
        this.world_.addContactMaterial(wheel_ground);

        this.set_gear();

    }

    getModel() {
        return this.moVehicle_;
    }

    getPosition() {
        return [this.moVehicle_.chassisBody.position.x,
                this.moVehicle_.chassisBody.position.y,
                this.moVehicle_.chassisBody.position.z];
    }

    setPosition(x, y, z, roty) {
        roty = roty -0.5
        this.moVehicle_.chassisBody.position.set(x, y, z)
        const carInitQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), roty*Math.PI);
        this.moVehicle_.chassisBody.quaternion.copy(carInitQuat);
    }

    setPosition2(x, y, z) {
        this.moVehicle_.chassisBody.position.set(x, y, z)
    }

    // アクセル時の applyEngineForce を func(ホイール回転数 deltaRotation) に比例させる
    deltaRot2force() {
        var x = Math.max(this.moVehicle_.wheelInfos[2].deltaRotation,
                         this.moVehicle_.wheelInfos[3].deltaRotation);
        x = Math.abs(x);
        // トルク曲線（エンジン性能曲線）を模倣した２次関数に当てはめる
        var x2 = x - this.gearfx_;
        var y = this.gearfa_*x2*x2 + this.gearfb_;
        // エンジンブレーキを有効にするため -0.5倍まで許容する
        y = Math.max(-0.5, y);
        return y * this.maxForce_;
    }

    // 後輪駆動(FR)
    keydown_ArrowUp() {
        var vforce = this.deltaRot2force();
        this.moVehicle_.applyEngineForce(-vforce, 2)
        this.moVehicle_.applyEngineForce(-vforce, 3)
    }
    keyup_ArrowUp() {
        this.moVehicle_.applyEngineForce(0, 2)
        this.moVehicle_.applyEngineForce(0, 3)
    }

    keydown_ArrowDown() {
        this.moVehicle_.applyEngineForce(this.maxForce_, 2)
        this.moVehicle_.applyEngineForce(this.maxForce_, 3)
    }
    keyup_ArrowDown() {
        this.moVehicle_.applyEngineForce(0, 2)
        this.moVehicle_.applyEngineForce(0, 3)
    }

    keydown_ArrowLeft() {
        this.moVehicle_.setSteeringValue(this.maxSteerVal_, 0)
        this.moVehicle_.setSteeringValue(this.maxSteerVal_, 1)
    }
    keyup_ArrowLeft() {
        this.moVehicle_.setSteeringValue(0, 0)
        this.moVehicle_.setSteeringValue(0, 1)
    }

    keydown_ArrowRight() {
        this.moVehicle_.setSteeringValue(-this.maxSteerVal_, 0)
        this.moVehicle_.setSteeringValue(-this.maxSteerVal_, 1)
    }
    keyup_ArrowRight() {
        this.moVehicle_.setSteeringValue(0, 0)
        this.moVehicle_.setSteeringValue(0, 1)
    }

    keydown_brake() {
        this.moVehicle_.setBrake(this.brakeForceF_, 0)
        this.moVehicle_.setBrake(this.brakeForceF_, 1)
        this.moVehicle_.setBrake(this.brakeForceR_, 2)
        this.moVehicle_.setBrake(this.brakeForceR_, 3)
    }
    keyup_brake() {
        this.moVehicle_.setBrake(0, 0)
        this.moVehicle_.setBrake(0, 1)
        this.moVehicle_.setBrake(0, 2)
        this.moVehicle_.setBrake(0, 3)
    }

    // switch_sidebrake() {
    //     this.sidebrake_ = (this.sidebrake_+1) % 2
    //     if (this.sidebrake_) {
    //         this.keydown_sidebrake();
    //     } else {
    //         this.keyup_sidebrake();
    //     }
    // }
    keydown_sidebrake() {
        this.moVehicle_.setBrake(this.brakeForceR_, 2)
        this.moVehicle_.setBrake(this.brakeForceR_, 3)
    }
    keyup_sidebrake() {
        this.moVehicle_.setBrake(0, 2)
        this.moVehicle_.setBrake(0, 3)
    }

    keydown_shift_up() {
        this.shiftlever_ = Math.min(this.shiftlever_+1, this.shiftleverMax_);
        this.set_gear();
    }
    keydown_shift_down() {
        this.shiftlever_ = Math.max(this.shiftlever_-1, this.shiftleverMin_);
        this.set_gear();
    }
    set_gear() {
        // ギアに応じてトルク曲線／エンジン性能曲線を模した二次関数の係数をセット
        var i = this.shiftlever_ - 1;
        this.gearfa_ = this.shiftleverFuncFactor[i][0];
        this.gearfb_ = this.shiftleverFuncFactor[i][1];
        this.gearfx_ = this.shiftleverFuncFactor[i][2];
        this.deltaRotMax_ = this.shiftleverFuncFactor[i][3];
    }


    keydown_resetPosture() {
        // 車をひっくり返す ..
        // 車を持ち上げ
        this.moVehicle_.chassisBody.position.y += 5;
        // 進行方向（回転角Y）を使い、方向を初期化
        var vquat = this.moVehicle_.chassisBody.quaternion;
        var veuler = new CANNON.Vec3(0, 0, 0);
        vquat.toEuler(veuler);
        var ry = veuler.y;
        const carInitQuat = new CANNON.Quaternion();
        carInitQuat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), ry);
        this.moVehicle_.chassisBody.quaternion.copy(carInitQuat);
        // 速度、角速度を初期化しておく
        this.moVehicle_.chassisBody.velocity = new CANNON.Vec3(0, 0, 0);
        this.moVehicle_.chassisBody.angularVelocity = new CANNON.Vec3(0, 0, 0);
    }


    viewUpdate() {
        this.viChassisMesh_.position.copy(this.moChassisBody_.position);
        this.viChassisMesh_.quaternion.copy(this.moChassisBody_.quaternion);
        for (let i = 0; i < this.moVehicle_.wheelInfos.length; i++) {
            const transform = this.moVehicle_.wheelInfos[i].worldTransform;
            const viWheelMesh = this.viWheelMeshes_[i];
            viWheelMesh.position.copy(transform.position);
            viWheelMesh.quaternion.copy(transform.quaternion);
        }
    }

    getSpeed() {
        return Math.abs(this.moVehicle_.currentVehicleSpeedKmHour);
    }
}

class VehicleFR00 extends VehicleBase {
    // テスト用

    // エンジン出力
    maxForce_ = 200; // 200;

    // サスペンションの硬さ
    suspensionStiffnessF_ = 30; // 30;
    suspensionStiffnessR_ = 30; // 30;
    // 摩擦...グリップ力？
    //  弱：曲がらない、すべる。アンダーステア
    //  強：曲がる。オーバーステア
    frictionSlipF_ = 3;
    frictionSlipR_ = 3;

}

export class VehicleFRBase extends VehicleBase {
    // エンジン出力
    // maxForce_ = 200;
}

export class VehicleFR01 extends VehicleFRBase {
}

export class VehicleFR01b extends VehicleFRBase {
    // ギアをクロス(接近)させてみる

    // トルク曲線／エンジン性能曲線を模した二次関数の係数
    shiftleverMin_ = 1;
    shiftleverMax_ = 5;
    // トルク曲線／エンジン性能曲線を模した二次関数の係数 y = a*(x-s)^2 + b
    //                        a    b     s    y=0となるx(大きい方)
    shiftleverFuncFactor = [[-15 , 1.5 , 0.1, 0.417],
                            [-4  , 1   , 0.3, 0.8  ],
                            [-2  , 0.85, 0.5, 1.152],
                            [-1.2, 0.82, 0.8, 1.627],
                            [-0.6, 0.8 , 1.2, 2.355]
                           ];
}


/*

- cannon-es docs
https://pmndrs.github.io/cannon-es/docs/
https://pmndrs.github.io/cannon-es/

*/

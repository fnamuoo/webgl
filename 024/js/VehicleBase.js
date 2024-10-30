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
    // maxSuspensionForce_ = 4000; // 100000;
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
        const viChassisMtr = new THREE.MeshNormalMaterial({wireframe:true});
        this.viChassisMesh_ = new THREE.Mesh(viChassisGeo, viChassisMtr);
        this.viChassisMesh_.position.copy(this.moChassisBody_.position);
        this.viChassisMesh_.quaternion.copy(this.moChassisBody_.quaternion);
        this.scene_.add(this.viChassisMesh_);
    }

    init() {
        this.initBody()

        // Create the vehicle
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
            const viWheelMtr = new THREE.MeshNormalMaterial({wireframe:true});
            const viWheelMesh = new THREE.Mesh(viWheelGeo, viWheelMtr);
            this.scene_.add(viWheelMesh);
            this.world_.addBody(moWheelBody)
            this.viWheelMeshes_.push(viWheelMesh);
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
        this.world_.addContactMaterial(wheel_ground)

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
        // 速度、角速度を初期化しておく
        this.moVehicle_.chassisBody.velocity = new CANNON.Vec3(0, 0, 0);
        this.moVehicle_.chassisBody.angularVelocity = new CANNON.Vec3(0, 0, 0);
    }

    setPosition2(x, y, z) {
        this.moVehicle_.chassisBody.position.set(x, y, z)
    }

    // 後輪駆動(FR)
    keydown_ArrowUp() {
        this.moVehicle_.applyEngineForce(-this.maxForce_, 2)
        this.moVehicle_.applyEngineForce(-this.maxForce_, 3)
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

    keydown_break() {
        this.moVehicle_.setBrake(this.brakeForceF_, 0)
        this.moVehicle_.setBrake(this.brakeForceF_, 1)
        this.moVehicle_.setBrake(this.brakeForceR_, 2)
        this.moVehicle_.setBrake(this.brakeForceR_, 3)
    }
    keyup_break() {
        this.moVehicle_.setBrake(0, 0)
        this.moVehicle_.setBrake(0, 1)
        this.moVehicle_.setBrake(0, 2)
        this.moVehicle_.setBrake(0, 3)
    }

    keydown_sidebreak() {
        this.sidebrake_ = (this.sidebrake_+1) % 2
        if (this.sidebrake_) {
            this.moVehicle_.setBrake(this.brakeForceR_, 2)
            this.moVehicle_.setBrake(this.brakeForceR_, 3)
        } else {
            this.moVehicle_.setBrake(0, 2)
            this.moVehicle_.setBrake(0, 3)
        }
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
}

export class VehicleFR01 extends VehicleFRBase {
}

export class VehicleFR02 extends VehicleFRBase {
    mass_ = 200; // 150;

    // エンジン出力
    maxForce_ = 900; // 200;

    // サスペンションの硬さ
    suspensionStiffnessF_ = 60; // 30;
    suspensionStiffnessR_ = 60; // 30;
    // サスペンションの長さ(~=車高)
    suspensionRestLength_ = 0.5;

    // 摩擦...グリップ力？
    //  弱：曲がらない、すべる。アンダーステア
    //  強：曲がる。オーバーステア
    frictionSlipF_ = 5; // 3;
    frictionSlipR_ = 5; // 3;
}

export class VehicleFR03 extends VehicleBase {
    // やわらかいサス
    // 11前後が 荷重移動している感じで面白い
    suspensionStiffnessF_ = 10; // 30;
    suspensionStiffnessR_ = 12; // 30;
    // // サスペンションの長さ(~=車高)
    suspensionRestLength_ = 0.9; // 0.5;

    frictionSlipF_ = 2.3;
    frictionSlipR_ = 2.4;

    // 地面とタイヤの摩擦係数
    wheelFriction_ = 0.01;
}


export class VehicleFR11 extends VehicleFRBase {
    // 低出力 ドリフト仕様
    // スライドフラグ？
    sliding_ = true;

    // サスペンションの硬さ
    suspensionStiffnessF_ = 10; // 30;
    suspensionStiffnessR_ = 12; // 30;
    // サスペンションの長さ(~=車高)
    suspensionRestLength_ = 0.8; // 0.5;

    // // 摩擦...グリップ力？
    // //  弱：曲がらない、すべる。アンダーステア
    // //  強：曲がる。オーバーステア
    // frictionSlipF_ <= frictionSlipR_ にすること
    // frictionSlipF_ > frictionSlipR_ にすると(加速／ブレーキ)でスピンする
    frictionSlipF_ = 2.3;
    frictionSlipR_ = 2.4;

    // 地面とタイヤの摩擦係数
    wheelFriction_ = 0.01;
}

export class VehicleFR12 extends VehicleFRBase {
    // スライドフラグ？
    sliding_ = true;

    mass_ = 200; // 150;

    // エンジン出力
    maxForce_ = 700; // 200;

    // サスペンションの硬さ
    suspensionStiffnessF_ = 50; // 30;
    suspensionStiffnessR_ = 50; // 30;
    // サスペンションの長さ(~=車高)
    suspensionRestLength_ = 0.8; // 0.5;

    frictionSlipF_ = 5;
    frictionSlipR_ = 5;

    // 地面とタイヤの摩擦係数
    wheelFriction_ = 0.01;
}

export class VehicleFFBase extends VehicleBase {
    initBody() {
        const moChassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 0.8))
        this.moChassisBody_ = new CANNON.Body({
            mass: this.mass_,
            shape: moChassisShape,
            position: new CANNON.Vec3(0, 1, 0),
        })
        const viChassisGeo = new THREE.BoxGeometry(4, 1, 1.6);
        const viChassisMtr = new THREE.MeshStandardMaterial({color:0xff8080, transparent: true, opacity: 0.9 });

        this.viChassisMesh_ = new THREE.Mesh(viChassisGeo, viChassisMtr);
        this.viChassisMesh_.position.copy(this.moChassisBody_.position);
        this.viChassisMesh_.quaternion.copy(this.moChassisBody_.quaternion);
        this.scene_.add(this.viChassisMesh_);
    }

    // 前輪駆動(FF)
    keydown_ArrowUp() {
        this.moVehicle_.applyEngineForce(-this.maxForce_, 0)
        this.moVehicle_.applyEngineForce(-this.maxForce_, 1)
    }
    keyup_ArrowUp() {
        this.moVehicle_.applyEngineForce(0, 0)
        this.moVehicle_.applyEngineForce(0, 1)
    }

    keydown_ArrowDown() {
        this.moVehicle_.applyEngineForce(this.maxForce_, 0)
        this.moVehicle_.applyEngineForce(this.maxForce_, 1)
    }
    keyup_ArrowDown() {
        this.moVehicle_.applyEngineForce(0, 0)
        this.moVehicle_.applyEngineForce(0, 1)
    }
}

export class VehicleFF01 extends VehicleFFBase {
    // エンジン出力
    maxForce_ = 200;

    // サスペンションの硬さ
    suspensionStiffnessF_ = 30;
    suspensionStiffnessR_ = 30;
    // 摩擦...グリップ力？
    //  弱：曲がらない、すべる。アンダーステア
    //  強：曲がる。オーバーステア
    frictionSlipF_ = 3;
    frictionSlipR_ = 3;
}

export class VehicleFF02 extends VehicleFFBase {
    // エンジン出力
    maxForce_ = 900; // 200;

    // サスペンションの硬さ
    suspensionStiffnessF_ = 60; // 30;
    suspensionStiffnessR_ = 60; // 30;
    // 摩擦...グリップ力？
    //  弱：曲がらない、すべる。アンダーステア
    //  強：曲がる。オーバーステア
    frictionSlipF_ = 5; // 3;
    frictionSlipR_ = 5; // 3;
}

export class VehicleFF11 extends VehicleFFBase {
    // ドリフトしやすい？FFを目指して..
    sliding_ = true;

//    mass_ = 200; // 100;
    maxForce_ = 400; // 200;

    sliding_ = true;

    // サスペンションの硬さ
    suspensionStiffnessF_ = 20; // 30;
    suspensionStiffnessR_ = 22; // 30;
    // サスペンションの長さ(~=車高)
    suspensionRestLength_ = 0.6; // 0.5;

    // 摩擦...グリップ力？
    //  弱：曲がらない、すべる。アンダーステア
    //  強：曲がる。オーバーステア
    frictionSlipF_ = 1.2; // 3;
    frictionSlipR_ = 1.3; // 3;

    // 地面とタイヤの摩擦係数
    wheelFriction_ = 0.01;
}

export class VehicleFF12 extends VehicleFFBase {
    // ドリフトしやすい？FFを目指して..
    sliding_ = true;

    // エンジン出力
    maxForce_ = 2000; // 200;

    // // サスペンションの硬さ
    // suspensionStiffnessF_ = 30; // 30;
    // suspensionStiffnessR_ = 30; // 30;

    // 摩擦...グリップ力？
    //  弱：曲がらない、すべる。アンダーステア
    //  強：曲がる。オーバーステア
    frictionSlipF_ = 2.3; // 3;
    frictionSlipR_ = 2.4; // 3;

    // 地面とタイヤの摩擦係数
    wheelFriction_ = 0.01;
}


export class Vehicle4WDBase extends VehicleBase {
    initBody() {
        const moChassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 0.8))
        this.moChassisBody_ = new CANNON.Body({
            mass: this.mass_,
            shape: moChassisShape,
            position: new CANNON.Vec3(0, 1, 0),
        })
        const viChassisGeo = new THREE.BoxGeometry(4, 1, 1.6);
        const viChassisMtr = new THREE.MeshNormalMaterial();
        this.viChassisMesh_ = new THREE.Mesh(viChassisGeo, viChassisMtr);
        this.viChassisMesh_.position.copy(this.moChassisBody_.position);
        this.viChassisMesh_.quaternion.copy(this.moChassisBody_.quaternion);
        this.scene_.add(this.viChassisMesh_);
    }

    // 全輪駆動(4WD)
    keydown_ArrowUp() {
        this.moVehicle_.applyEngineForce(-this.maxForce_, 0)
        this.moVehicle_.applyEngineForce(-this.maxForce_, 1)
        this.moVehicle_.applyEngineForce(-this.maxForce_, 2)
        this.moVehicle_.applyEngineForce(-this.maxForce_, 3)
    }
    keyup_ArrowUp() {
        this.moVehicle_.applyEngineForce(0, 0)
        this.moVehicle_.applyEngineForce(0, 1)
        this.moVehicle_.applyEngineForce(0, 2)
        this.moVehicle_.applyEngineForce(0, 3)
    }

    keydown_ArrowDown() {
        this.moVehicle_.applyEngineForce(this.maxForce_, 0)
        this.moVehicle_.applyEngineForce(this.maxForce_, 1)
        this.moVehicle_.applyEngineForce(this.maxForce_, 2)
        this.moVehicle_.applyEngineForce(this.maxForce_, 3)
    }
    keyup_ArrowDown() {
        this.moVehicle_.applyEngineForce(0, 0)
        this.moVehicle_.applyEngineForce(0, 1)
        this.moVehicle_.applyEngineForce(0, 2)
        this.moVehicle_.applyEngineForce(0, 3)
    }

}

export class Vehicle4WD01 extends Vehicle4WDBase {
}

export class Vehicle4WD02 extends Vehicle4WDBase {
    mass_ = 200; // 100;

    // エンジン出力
    maxForce_ = 600; // 200;

    // サスペンションの硬さ
    suspensionStiffnessF_ = 60; // 30;
    suspensionStiffnessR_ = 60; // 30;
    // 摩擦...グリップ力？
    //  弱：曲がらない、すべる。アンダーステア
    //  強：曲がる。オーバーステア
    frictionSlipF_ = 5; // 3;
    frictionSlipR_ = 5; // 3;

}

export class Vehicle4WD11 extends Vehicle4WDBase {
    sliding_ = true;

    // // エンジン出力
    // maxForce_ = 200;

    // // サスペンションの硬さ
    suspensionStiffnessF_ = 10; // 30;
    suspensionStiffnessR_ = 12; // 30;
    // サスペンションの長さ(~=車高)
    suspensionRestLength_ = 0.6; // 0.5;

    // 摩擦...グリップ力？
    //  弱：曲がらない、すべる。アンダーステア
    //  強：曲がる。オーバーステア
    frictionSlipF_ = 1.3; // 3;
    frictionSlipR_ = 1.4; // 3;

    // 地面とタイヤの摩擦係数
    wheelFriction_ = 0.01;
}

export class Vehicle4WD12 extends Vehicle4WDBase {
    sliding_ = true;

    mass_ = 200; // 150;

    // エンジン出力
    maxForce_ = 700;

    // サスペンションの硬さ
    suspensionStiffnessF_ = 50; // 30;
    suspensionStiffnessR_ = 50; // 30;
    // サスペンションの長さ(~=車高)
    suspensionRestLength_ = 0.6; // 0.5;

    // 摩擦...グリップ力？
    //  弱：曲がらない、すべる。アンダーステア
    //  強：曲がる。オーバーステア
    frictionSlipF_ = 5; // 3;
    frictionSlipR_ = 5; // 3;

    // 地面とタイヤの摩擦係数
    wheelFriction_ = 0.01;
}


export class RigidVehicle01 {
    scene_;
    world_;
    moGroundMtr_;
    moVehicle_;
    moChassisBody_;
    viChassisMesh_;
    viWheelMeshes_ = [];
    // viWheelGeos_ = [];
    sidebrake_ = 0;

    // 重量
    mass_ = 60; // 60が片輪走行（グリップ）になるか、ドリフト（滑りだす）かの境
    // ステアリング角度、舵角
    maxSteerVal_ = 0.5;
    // スライドフラグ？
    sliding_ = false;

    // エンジン出力
    maxForce_ = 100; // 100;
    // ブレーキの強さ
    // brakeForce_ = 1000000;
    brakeForceF_ =  8;
    brakeForceR_ = 10;

    // // サスペンションの硬さ
    // suspensionStiffness_ = 30; // 30;
    // // サスペンションの長さ(~=車高)
    // suspensionRestLength_ = 0.6; // 0.3;
    // 摩擦...グリップ力？
    //  弱：曲がらない、すべる。アンダーステア
    //  強：曲がる。オーバーステア
    frictionSlip_ = 10; // 3; // 1.4
    // サスペンション
    //  弱：ホイールが車体にめり込む、オーバーステアになりがち
    //  強：車体が上がる、ウィリーしやすい？アンダーが出やすい
    maxSuspensionForce_ = 4000; // 100000;

    // 地面とタイヤの摩擦係数
    wheelFriction_ = 0.99;  // 0.9;

    constructor(scene, world, moGroundMtr) {
        this.scene_ = scene;
        this.world_ = world;
        this.moGroundMtr_ = moGroundMtr;

        this.init()
    }

    init() {
        // const moChassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 0.8))
        const moChassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.2, 0.8))
        this.moChassisBody_ = new CANNON.Body({
            mass: this.mass_,
            shape: moChassisShape,
            position: new CANNON.Vec3(0, 1, 0),
        })
        // const viChassisGeo = new THREE.BoxGeometry(4, 1, 1.6);
        const viChassisGeo = new THREE.BoxGeometry(4, 0.4, 1.6);
        // const viChassisMtr = new THREE.MeshNormalMaterial();
        const viChassisMtr = new THREE.MeshNormalMaterial({wireframe:true});
        this.viChassisMesh_ = new THREE.Mesh(viChassisGeo, viChassisMtr);
        this.viChassisMesh_.position.copy(this.moChassisBody_.position);
        this.viChassisMesh_.quaternion.copy(this.moChassisBody_.quaternion);
        this.scene_.add(this.viChassisMesh_);

        // Create the vehicle
        // this.moVehicle_ = new CANNON.RaycastVehicle({
        //     chassisBody: this.moChassisBody_,
        //     sliding: this.sliding_,
        // })
        this.moVehicle_ = new CANNON.RigidVehicle({
            chassisBody: this.moChassisBody_,
        })

        const mass = 1
        const axisWidth = 4 // 7
        const moWheelShape = new CANNON.Sphere(0.8)
        const moWheelMtr = new CANNON.Material('wheel')
        const down = new CANNON.Vec3(0, -1, 0)
        const centerOfMassAdjust = new CANNON.Vec3(0, -0.1, 0)

        const wheelBody1 = new CANNON.Body({ mass, material: moWheelMtr })
        wheelBody1.addShape(moWheelShape)
        this.moVehicle_.addWheel({
            body: wheelBody1,
            position: new CANNON.Vec3(-2, 0, axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down,
        })

        const wheelBody2 = new CANNON.Body({ mass, material: moWheelMtr })
        wheelBody2.addShape(moWheelShape)
        this.moVehicle_.addWheel({
            body: wheelBody2,
            position: new CANNON.Vec3(-2, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, -1),
            direction: down,
        })

        const wheelBody3 = new CANNON.Body({ mass, material: moWheelMtr })
        wheelBody3.addShape(moWheelShape)
        this.moVehicle_.addWheel({
            body: wheelBody3,
            position: new CANNON.Vec3(2, 0, axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down,
        })

        const wheelBody4 = new CANNON.Body({ mass, material: moWheelMtr })
        wheelBody4.addShape(moWheelShape)
        this.moVehicle_.addWheel({
            body: wheelBody4,
            position: new CANNON.Vec3(2, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(0, 0, -1),
            direction: down,
        })


        this.moVehicle_.wheelBodies.forEach((wheelBody) => {
            // Some damping to not spin wheels too fast
            wheelBody.angularDamping = 0.4

            // Add visuals
            var radius = wheelBody.shapes[0].radius;
            const viWheelGeo = new THREE.SphereGeometry(radius);
            //    const thWheelMtr = new THREE.MeshNormalMaterial();
            const viWheelMtr = new THREE.MeshNormalMaterial({wireframe:true});
            const viWheel = new THREE.Mesh(viWheelGeo, viWheelMtr);
            this.scene_.add(viWheel);
            this.viWheelMeshes_.push(viWheel);
        })

        this.moVehicle_.addToWorld(this.world_)


        const wheel_ground = new CANNON.ContactMaterial(moWheelMtr, this.moGroundMtr_, {
            friction: this.wheelFriction_,  // 0.9,  // 摩擦係数(def=0.3)
            restitution: 0, // 0,  // 反発係数 (def=0.3)
            // contactEquationStiffness: 1000,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
            // contactEquationStiffness: 1e-2,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
            contactEquationStiffness: 1e7,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
        })
        this.world_.addContactMaterial(wheel_ground)

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
        this.moVehicle_.chassisBody.position.set(0, 10, 10)
        const carInitQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), roty*Math.PI);
        this.moVehicle_.chassisBody.quaternion.copy(carInitQuat);
    }

    // 後輪駆動(FR)
    keydown_ArrowUp() {
        // this.moVehicle_.applyEngineForce(-this.maxForce_, 2)
        // this.moVehicle_.applyEngineForce(-this.maxForce_, 3)
        this.moVehicle_.setWheelForce(this.maxForce_, 2)
        this.moVehicle_.setWheelForce(-this.maxForce_, 3)
    }
    keyup_ArrowUp() {
        this.moVehicle_.setWheelForce(0, 2)
        this.moVehicle_.setWheelForce(0, 3)
    }

    keydown_ArrowDown() {
        this.moVehicle_.setWheelForce(-this.maxForce_, 2)
        this.moVehicle_.setWheelForce(this.maxForce_, 3)
    }
    keyup_ArrowDown() {
        this.moVehicle_.setWheelForce(0, 2)
        this.moVehicle_.setWheelForce(0, 3)
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

    keydown_break() {
    }
    keyup_break() {
    }

    keydown_sidebreak() {
    }
    keydown_resetPosture() {
        // 車をひっくり返したいけど、シャーシ・ホイルを同時に指定する必要あり。面倒なので保留に

        // 車を持ち上げ
        var upY = 5;
        this.moVehicle_.chassisBody.position.z += upY;
        for (var i = 0; i < 4; ++i) {
            this.moVehicle_.wheelBodies[i].position.z += upY;
        }

        // 速度、角速度を初期化しておく
        this.moVehicle_.chassisBody.velocity = new CANNON.Vec3(0, 0, 0);
        this.moVehicle_.chassisBody.angularVelocity = new CANNON.Vec3(0, 0, 0);

        // 片方だけに力を加えてみる
        var vquat = this.moVehicle_.chassisBody.quaternion;
        var veuler = new CANNON.Vec3(0, 0, 0);
        vquat.toEuler(veuler);
        var ry = -veuler.y;
        var fy = new CANNON.Vec3(0, 10, 0);
        var pz, px;
        var cos_ry, sin_ry;
        cos_ry = Math.cos(ry);
        sin_ry = Math.sin(ry);
        pz =  5*cos_ry + 2*sin_ry;
        px = -5*sin_ry + 2*cos_ry;
        this.moVehicle_.chassisBody.applyImpulse(fy, new CANNON.Vec3(px, 0, pz));
        pz =  5*cos_ry  -2*sin_ry;
        px = -5*sin_ry  -2*cos_ry;
        this.moVehicle_.chassisBody.applyImpulse(fy, new CANNON.Vec3(px, 0, pz));
    }

    viewUpdate() {
        this.viChassisMesh_.position.copy(this.moChassisBody_.position);
        this.viChassisMesh_.quaternion.copy(this.moChassisBody_.quaternion);
        this.moVehicle_.wheelBodies.forEach((wheelBody, i) => {
            this.viWheelMeshes_[i].position.copy(wheelBody.position);
            this.viWheelMeshes_[i].quaternion.copy(wheelBody.quaternion);
        });
    }
}

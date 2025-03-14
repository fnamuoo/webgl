// mode:javascript

import * as THREE from "three";
import * as CANNON from "cannon";

var this_moVehicle_ = null;


var this_viBlade4Mesh_ = [];
var this_moBlade4_ = [];
function addBlade4update() {
    if (this_viBlade4Mesh_.length > 0) {
        this_viBlade4Mesh_[0].position.copy(this_moBlade4_[0].position)
        this_viBlade4Mesh_[0].quaternion.copy(this_moBlade4_[0].quaternion)
    }
}

var this_viBlade5Mesh_ = [];
var this_moBlade5_ = [];
function addBlade5update() {
    if (this_viBlade5Mesh_.length > 0) {
        this_viBlade5Mesh_[0].position.copy(this_moBlade5_[0].position)
        this_viBlade5Mesh_[1].position.copy(this_moBlade5_[1].position)
        this_viBlade5Mesh_[2].position.copy(this_moBlade5_[2].position)
        this_viBlade5Mesh_[3].position.copy(this_moBlade5_[3].position)
    }
}

var this_viBlade6Mesh_ = [];
var this_moBlade6_ = [];
function addBlade6update() {
    if (this_viBlade6Mesh_.length > 0) {
        this_viBlade6Mesh_[0].position.copy(this_moBlade6_[0].position)
        this_viBlade6Mesh_[0].quaternion.copy(this_moBlade6_[0].quaternion)
        this_viBlade6Mesh_[1].position.copy(this_moBlade6_[1].position)
        this_viBlade6Mesh_[1].quaternion.copy(this_moBlade6_[1].quaternion)
        this_viBlade6Mesh_[2].position.copy(this_moBlade6_[2].position)
        this_viBlade6Mesh_[2].quaternion.copy(this_moBlade6_[2].quaternion)
    }
}

var this_viBlade7Mesh_ = [];
var this_moBlade7_ = [];
function addBlade7update() {
    if (this_viBlade7Mesh_.length > 0) {
        this_viBlade7Mesh_[0].position.copy(this_moBlade7_[0].position)
        this_viBlade7Mesh_[0].quaternion.copy(this_moBlade7_[0].quaternion)
    }
}


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
        this.moBlade1_ = null;
        this.viBlade1Mesh_ = null;
        this.moBlade2_ = null;
        this.viBlade2Mesh_ = null;
        this.moBlade3_ = null;
        this.viBlade3Mesh_ = null;
        this.moBlade4_ = [];
        this.viBlade4Mesh_ = [];
        this.moBlade4hingeConst_ = [];
        this.moBlade5_ = [];
        this.viBlade5Mesh_ = [];
        this.moBlade5hingeConst_ = [];
        this.moBlade6_ = [];
        this.viBlade6Mesh_ = [];
        this.moBlade6hingeConst_ = [];
        this.moBlade7_ = [];
        this.viBlade7Mesh_ = [];
        this.moBlade7hingeConst_ = [];
    }

    initBody() {
        this.moChassisBody_ = new CANNON.Body({
            mass: this.mass_,
            position: new CANNON.Vec3(0, 0, 0),
            // material: moChassisMtr,
        });
        this.viChassisBody_ = new THREE.Group();
        //
        let sxx = 4, syy = 1, szz = 1.6;
        let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
        let pxx = 0, pyy = 0, pzz = 0;
        this.moChassisBody_.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                                     new CANNON.Vec3(pxx, pyy, pzz));
        const viChassis2Geo = new THREE.BoxGeometry(sxx, syy, szz);
        const viChassis2Mtr = new THREE.MeshNormalMaterial({wireframe:true});
        const viChassis2Mesh = new THREE.Mesh(viChassis2Geo, viChassis2Mtr);
        viChassis2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
        this.viChassisBody_.add(viChassis2Mesh);
        //
        this.scene_.add(this.viChassisBody_);
    }

    changeBlade(val) {
        this.clearBlade();
        if (val == 1) {
            // 平板
            this.addBlade1();
        } else if (val == 2) {
            // 斜め板
            this.addBlade2();
        } else if (val == 3) {
            // // 三角すい
            // this.addBlade3();
            // ローラー
            this.addBlade7();
        } else if (val == 4) {
            // ハンマー×４
            this.addBlade5();
        } else if (val == 5) {
            // ドリル
            this.addBlade4();
        } else if (val == 6) {
            // ドリル×３（トライデント
            this.addBlade6();
        }
    }

    clearBlade() {
        if (this.moBlade1_ != null) {
            this.moChassisBody_.removeShape(this.moBlade1_);
            this.viChassisBody_.remove(this.viBlade1Mesh_);
            this.moBlade1_ = null;
            this.viBlade1Mesh_ = null;
        }
        if (this.moBlade2_ != null) {
            this.moChassisBody_.removeShape(this.moBlade2_);
            this.viChassisBody_.remove(this.viBlade2Mesh_);
            this.moBlade2_ = null;
            this.viBlade2Mesh_ = null;
        }
        if (this.moBlade3_ != null) {
            this.moChassisBody_.removeShape(this.moBlade3_);
            this.viChassisBody_.remove(this.viBlade3Mesh_);
            this.moBlade3_ = null;
            this.viBlade3Mesh_ = null;
        }
        if (this.moBlade4_.length > 0) {
            this.world_.removeEventListener('postStep', addBlade4update);
            this_viBlade4Mesh_ = [];
            this_moBlade4_ = [];
            this.world_.removeConstraint(this.moBlade4hingeConst_[0]);
            this.moBlade4hingeConst_ = [];
            this.world_.removeBody(this.moBlade4_[0]);
            this.scene_.remove(this.viBlade4Mesh_[0]);
            this.moBlade4_ = [];
            this.viBlade4Mesh_ = [];
        }
        if (this.moBlade5_.length > 0) {
            this.world_.removeEventListener('postStep', addBlade5update);
            this_viBlade5Mesh_ = [];
            this_moBlade5_ = [];
            this.world_.removeConstraint(this.moBlade5hingeConst_[0]);
            this.world_.removeConstraint(this.moBlade5hingeConst_[1]);
            this.world_.removeConstraint(this.moBlade5hingeConst_[2]);
            this.world_.removeConstraint(this.moBlade5hingeConst_[3]);
            this.moBlade5hingeConst_ = [];
            this.world_.removeBody(this.moBlade5_[0]);
            this.world_.removeBody(this.moBlade5_[1]);
            this.world_.removeBody(this.moBlade5_[2]);
            this.world_.removeBody(this.moBlade5_[3]);
            this.scene_.remove(this.viBlade5Mesh_[0]);
            this.scene_.remove(this.viBlade5Mesh_[1]);
            this.scene_.remove(this.viBlade5Mesh_[2]);
            this.scene_.remove(this.viBlade5Mesh_[3]);
            this.moBlade5_ = [];
            this.viBlade5Mesh_ = [];
        }
        if (this.moBlade6_.length > 0) {
            this.world_.removeEventListener('postStep', addBlade6update);
            this_viBlade6Mesh_ = [];
            this_moBlade6_ = [];
            this.world_.removeConstraint(this.moBlade6hingeConst_[0]);
            this.world_.removeConstraint(this.moBlade6hingeConst_[1]);
            this.world_.removeConstraint(this.moBlade6hingeConst_[2]);
            this.moBlade6hingeConst_ = [];
            this.world_.removeBody(this.moBlade6_[0]);
            this.world_.removeBody(this.moBlade6_[1]);
            this.world_.removeBody(this.moBlade6_[2]);
            this.scene_.remove(this.viBlade6Mesh_[0]);
            this.scene_.remove(this.viBlade6Mesh_[1]);
            this.scene_.remove(this.viBlade6Mesh_[2]);
            this.moBlade6_ = [];
            this.viBlade6Mesh_ = [];
        }
        if (this.moBlade7_.length > 0) {
            this.world_.removeEventListener('postStep', addBlade7update);
            this_viBlade7Mesh_ = [];
            this_moBlade7_ = [];
            this.world_.removeConstraint(this.moBlade7hingeConst_[0]);
            this.moBlade7hingeConst_ = [];
            this.world_.removeBody(this.moBlade7_[0]);
            this.scene_.remove(this.viBlade7Mesh_[0]);
            this.moBlade7_ = [];
            this.viBlade7Mesh_ = [];
        }
    }

    addBlade1() {
        // 平板
        let sxx = 0.1, syy = 2, szz = 10;
        let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
        let pxx = -2.5, pyy = syy_-1.0, pzz = 0;
        let quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI/6);
        this.moBlade1_ = new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_));
        this.moChassisBody_.addShape(this.moBlade1_,
                                     new CANNON.Vec3(pxx, pyy, pzz),
                                     quat);
        const viBlade1Geo = new THREE.BoxGeometry(sxx, syy, szz);
        const viBlade1Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        this.viBlade1Mesh_ = new THREE.Mesh(viBlade1Geo, viBlade1Mtr);
        this.viBlade1Mesh_.position.copy(new THREE.Vector3(pxx, pyy, pzz));
        this.viBlade1Mesh_.quaternion.copy(quat);
        this.viChassisBody_.add(this.viBlade1Mesh_);
    }

    addBlade2() {
        // ななめな平板（左側に押し出す感じの
        let sxx = 0.1, syy = 2, szz = 10;
        let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
        let pxx = -2.5, pyy = syy_-0.9, pzz = 0;
        let quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI/6);
        this.moBlade2_ = new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_));
        this.moChassisBody_.addShape(this.moBlade2_,
                                     new CANNON.Vec3(pxx, pyy, pzz),
                                     quat);
        const viBlade2Geo = new THREE.BoxGeometry(sxx, syy, szz);
        const viBlade2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        this.viBlade2Mesh_ = new THREE.Mesh(viBlade2Geo, viBlade2Mtr);
        this.viBlade2Mesh_.position.copy(new THREE.Vector3(pxx, pyy, pzz));
        this.viBlade2Mesh_.quaternion.copy(quat);
        this.viChassisBody_.add(this.viBlade2Mesh_);
    }

    addBlade3() {
        // △頭
        let radiusTop = 0, radiusBottom = 1.5, height = 3, numSegment = 3;
        let pxx = -4, pyy = -.4, pzz = 0;
        let quat1 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI/2); // 1.57
        let quat2 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), 1.8);
        let quat = quat2.mult(quat1);
        this.moBlade3_ = new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegment);
        this.moChassisBody_.addShape(this.moBlade3_,
                                     new CANNON.Vec3(pxx, pyy, pzz),
                                     quat);
        const viBlade3Geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment);
        const viBlade3Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        this.viBlade3Mesh_ = new THREE.Mesh(viBlade3Geo, viBlade3Mtr);
        this.viBlade3Mesh_.position.copy(new THREE.Vector3(pxx, pyy, pzz));
        this.viBlade3Mesh_.quaternion.copy(quat);
        this.viChassisBody_.add(this.viBlade3Mesh_);
    }


    blade4hitevent(e) {
        // 進行方向にふっとばす
        let moBlck = e.contact.bi;
        let moOptn = e.contact.bj;
        if (moOptn.isOpt_ === undefined) {
            [moBlck, moOptn] = [moOptn, moBlck];
        }
        if (moBlck.isOpt_ === undefined) {
            if (moOptn.isOpt_ == 0) {
                let vquat = this_moVehicle_.chassisBody.quaternion;
                let spd = Math.abs(this_moVehicle_.currentVehicleSpeedKmHour);
                var vv = vquat.vmult(new CANNON.Vec3(-spd, 0, 0));
                moBlck.applyImpulse(vv);
            }
        }
    }


    addBlade4() {
        //　一本やり：進行方向にぶっ飛ばす
        let radiusTop = 0, radiusBottom = 1, height = 3, numSegment = 4;
        let mass = 5, optD = 4;
        let pxx = 3, pyy = 0, pzz = 0;
        let quat1 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI/2);
        let posi = this.moChassisBody_.position;
        let adjx = posi.x, adjy=posi.y, adjz = posi.z;
        adjy += 2;
        this.moBlade4_ = [new CANNON.Body({mass: mass,
                                           shape: new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegment),
                                           position: new CANNON.Vec3(pxx+adjx-optD, pyy+adjy, pzz+adjz),
                                           material: this.moWheelMtr_,
                                          }),
                         ];
        this.viBlade4Mesh_ = [new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment),
                                             new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.4})),
                             ];
        this.viBlade4Mesh_[0].position.copy(this.moBlade4_[0].position);
        this.moBlade4_[0].isOpt_ = 0;
        this.moBlade4_[0].addEventListener("collide", this.blade4hitevent);
        this.moBlade4hingeConst_ = [
            new CANNON.HingeConstraint(this.moChassisBody_, this.moBlade4_[0], {
                axisA: new CANNON.Vec3(1, 0, 0),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(-4, 0.5, 0),
                pivotB: new CANNON.Vec3(0, 0, 0),
                collideConnected: false,
            }),
        ];
        // 動力を付与
        var vspeed = -10;
        this.moBlade4hingeConst_[0].enableMotor();
        this.moBlade4hingeConst_[0].setMotorSpeed(vspeed);
        this.world_.addBody(this.moBlade4_[0]);
        this.scene_.add(this.viBlade4Mesh_[0]);
        this.world_.addConstraint(this.moBlade4hingeConst_[0]);
        this_viBlade4Mesh_ = this.viBlade4Mesh_;
        this_moBlade4_ = this.moBlade4_;
        this.world_.addEventListener('postStep', addBlade4update);
    }


    blade5hitevent(e) {
        // 真上にふっとばす
        let moBlck = e.contact.bi;
        let moOptn = e.contact.bj;
        if (moOptn.isOpt_ === undefined) {
            [moBlck, moOptn] = [moOptn, moBlck];
        }
        if (moBlck.isOpt_ === undefined) {
            // let vec = new CANNON.Vec3(0, 10, 0);
            let spd = Math.abs(this_moVehicle_.currentVehicleSpeedKmHour);
            let vec = new CANNON.Vec3(0, spd, 0);
            moBlck.applyImpulse(vec);
        }
    }

    addBlade5() {
        //　ハンマー投げ×４
        let radius = 0.3, mass = 2, optD = 4;
        let pxx = 3, pyy = 0, pzz = 0;
        let posi = this.moChassisBody_.position;
        let adjx = posi.x, adjy=posi.y, adjz = posi.z;
        adjy += 2;
        this.moBlade5_ = [new CANNON.Body({mass: mass,
                                           shape: new CANNON.Sphere(radius),
                                           position: new CANNON.Vec3(pxx+adjx-optD, pyy+adjy, pzz+adjz),
                                           material: this.moWheelMtr_,
                                          }),
                          new CANNON.Body({mass: mass,
                                           shape: new CANNON.Sphere(radius),
                                           position: new CANNON.Vec3(pxx+adjx, pyy+adjy, pzz+adjz+optD),
                                           material: this.moWheelMtr_,
                                          }),
                          new CANNON.Body({mass: mass,
                                           shape: new CANNON.Sphere(radius),
                                           position: new CANNON.Vec3(pxx+adjx+optD, pyy+adjy, pzz+adjz),
                                           material: this.moWheelMtr_,
                                          }),
                          new CANNON.Body({mass: mass,
                                           shape: new CANNON.Sphere(radius),
                                           position: new CANNON.Vec3(pxx+adjx, pyy+adjy, pzz+adjz-optD),
                                           material: this.moWheelMtr_,
                                          }),];
        this.viBlade5Mesh_ = [new THREE.Mesh(new THREE.SphereGeometry(radius),
                                             new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4})),
                              new THREE.Mesh(new THREE.SphereGeometry(radius),
                                             new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4})),
                              new THREE.Mesh(new THREE.SphereGeometry(radius),
                                             new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4})),
                              new THREE.Mesh(new THREE.SphereGeometry(radius),
                                             new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4})),];
        this.viBlade5Mesh_[0].position.copy(this.moBlade5_[0].position);
        this.viBlade5Mesh_[1].position.copy(this.moBlade5_[1].position);
        this.viBlade5Mesh_[2].position.copy(this.moBlade5_[2].position);
        this.viBlade5Mesh_[3].position.copy(this.moBlade5_[3].position);
        this.moBlade5_[0].isOpt_ = true;
        this.moBlade5_[1].isOpt_ = true;
        this.moBlade5_[2].isOpt_ = true;
        this.moBlade5_[3].isOpt_ = true;
        this.moBlade5_[0].addEventListener("collide", this.blade5hitevent);
        this.moBlade5_[1].addEventListener("collide", this.blade5hitevent);
        this.moBlade5_[2].addEventListener("collide", this.blade5hitevent);
        this.moBlade5_[3].addEventListener("collide", this.blade5hitevent);
        // 動きの制約（ヒンジで繋ぐ
        this.moBlade5hingeConst_ = [
            new CANNON.HingeConstraint(this.moChassisBody_, this.moBlade5_[0], {
                axisA: new CANNON.Vec3(0, 1, 0),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(0, 0.2, 0),
                pivotB: new CANNON.Vec3(-optD, 0, 0),
                collideConnected: false,
            }),
            new CANNON.HingeConstraint(this.moChassisBody_, this.moBlade5_[1], {
                axisA: new CANNON.Vec3(0, 1, 0),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(0, 0.3, 0),
                pivotB: new CANNON.Vec3(0, 0, optD),
                collideConnected: false,
            }),
            new CANNON.HingeConstraint(this.moChassisBody_, this.moBlade5_[2], {
                axisA: new CANNON.Vec3(0, 1, 0),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(0, 0.4, 0),
                pivotB: new CANNON.Vec3(optD, 0, 0),
                collideConnected: false,
            }),
            new CANNON.HingeConstraint(this.moChassisBody_, this.moBlade5_[3], {
                axisA: new CANNON.Vec3(0, 1, 0),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(0, 0.5, 0),
                pivotB: new CANNON.Vec3(0, 0, -optD),
                collideConnected: false,
            }),
        ];
        // 動力を付与
        var vspeed = -2;
        this.moBlade5hingeConst_[0].enableMotor();
        this.moBlade5hingeConst_[0].setMotorSpeed(vspeed);
        this.moBlade5hingeConst_[1].enableMotor();
        this.moBlade5hingeConst_[1].setMotorSpeed(vspeed);
        this.moBlade5hingeConst_[2].enableMotor();
        this.moBlade5hingeConst_[2].setMotorSpeed(vspeed);
        this.moBlade5hingeConst_[3].enableMotor();
        this.moBlade5hingeConst_[3].setMotorSpeed(vspeed);
        this.world_.addBody(this.moBlade5_[0]);
        this.world_.addBody(this.moBlade5_[1]);
        this.world_.addBody(this.moBlade5_[2]);
        this.world_.addBody(this.moBlade5_[3]);
        this.scene_.add(this.viBlade5Mesh_[0]);
        this.scene_.add(this.viBlade5Mesh_[1]);
        this.scene_.add(this.viBlade5Mesh_[2]);
        this.scene_.add(this.viBlade5Mesh_[3]);
        this.world_.addConstraint(this.moBlade5hingeConst_[0]);
        this.world_.addConstraint(this.moBlade5hingeConst_[1]);
        this.world_.addConstraint(this.moBlade5hingeConst_[2]);
        this.world_.addConstraint(this.moBlade5hingeConst_[3]);
        this_viBlade5Mesh_ = this.viBlade5Mesh_;
        this_moBlade5_ = this.moBlade5_;
        this.world_.addEventListener('postStep', addBlade5update);
    }


    blade6hitevent(e) {
        let moBlck = e.contact.bi;
        let moOptn = e.contact.bj;
        if (moOptn.isOpt_ === undefined) {
            [moBlck, moOptn] = [moOptn, moBlck];
        }
        if (moBlck.isOpt_ === undefined) {
            if (moOptn.isOpt_ == 0) {
                // 進行方向にふっとばす
                let vquat = this_moVehicle_.chassisBody.quaternion;
                let spd = Math.abs(this_moVehicle_.currentVehicleSpeedKmHour);
                spd = spd**2;
                var vv = vquat.vmult(new CANNON.Vec3(-spd, 0, 0));
                moBlck.applyImpulse(vv);
            } else if (moOptn.isOpt_ == 1) {
                let vquat = this_moVehicle_.chassisBody.quaternion;
                let spd = Math.abs(this_moVehicle_.currentVehicleSpeedKmHour);
                var vv = vquat.vmult(new CANNON.Vec3(-spd, 0, -spd*0.3));
                moBlck.applyImpulse(vv);
            } else if (moOptn.isOpt_ == 2) {
                let vquat = this_moVehicle_.chassisBody.quaternion;
                let spd = Math.abs(this_moVehicle_.currentVehicleSpeedKmHour);
                var vv = vquat.vmult(new CANNON.Vec3(-spd, 0, spd*0.3));
                moBlck.applyImpulse(vv);
            }
        }
    }

    addBlade6() {
        //　トライデント（三叉槍）：三方向にぶっ飛ばす
        let radiusTop = 0, radiusBottom = 1, height = 3, numSegment = 4;
        let mass = 5, optD = 4;
        let pxx = 3, pyy = 0, pzz = 0;
        let posi = this.moChassisBody_.position;
        let adjx = posi.x, adjy=posi.y, adjz = posi.z;
        adjy += 2;
        this.moBlade6_ = [new CANNON.Body({mass: mass,
                                           shape: new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegment),
                                           position: new CANNON.Vec3(pxx+adjx-optD, pyy+adjy, pzz+adjz),
                                           material: this.moWheelMtr_,
                                          }),
                          new CANNON.Body({mass: mass,
                                           shape: new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegment),
                                           position: new CANNON.Vec3(pxx+adjx-optD, pyy+adjy, pzz+adjz+optD),
                                           material: this.moWheelMtr_,
                                          }),
                          new CANNON.Body({mass: mass,
                                           shape: new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegment),
                                           position: new CANNON.Vec3(pxx+adjx-optD, pyy+adjy, pzz+adjz-optD),
                                           material: this.moWheelMtr_,
                                          }),
                         ];
        this.viBlade6Mesh_ = [new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment),
                                             new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.4})),
                              new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment),
                                             new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.4})),
                              new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment),
                                             new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.4})),
                             ];
        this.viBlade6Mesh_[0].position.copy(this.moBlade6_[0].position);
        this.viBlade6Mesh_[1].position.copy(this.moBlade6_[1].position);
        this.viBlade6Mesh_[2].position.copy(this.moBlade6_[2].position);
        this.moBlade6_[0].isOpt_ = 0;
        this.moBlade6_[1].isOpt_ = 1;
        this.moBlade6_[2].isOpt_ = 2;
        this.moBlade6_[0].addEventListener("collide", this.blade6hitevent);
        this.moBlade6_[1].addEventListener("collide", this.blade6hitevent);
        this.moBlade6_[2].addEventListener("collide", this.blade6hitevent);
        this.moBlade6hingeConst_ = [
            new CANNON.HingeConstraint(this.moChassisBody_, this.moBlade6_[0], {
                axisA: new CANNON.Vec3(1, 0, 0),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(-4, 0.5, 0),
                pivotB: new CANNON.Vec3(0, 0, 0),
                collideConnected: false,
            }),
            new CANNON.HingeConstraint(this.moChassisBody_, this.moBlade6_[1], {
                axisA: new CANNON.Vec3(1, 0, 0.5),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(-4, 0.5, -4),
                pivotB: new CANNON.Vec3(0, 0, 0),
                collideConnected: false,
            }),
            new CANNON.HingeConstraint(this.moChassisBody_, this.moBlade6_[2], {
                axisA: new CANNON.Vec3(1, 0, -0.5),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(-4, 0.5, +4),
                pivotB: new CANNON.Vec3(0, 0, 0),
                collideConnected: false,
            }),
        ];
        // 動力を付与
        var vspeed = -10;
        this.moBlade6hingeConst_[0].enableMotor();
        this.moBlade6hingeConst_[0].setMotorSpeed(vspeed);
        this.moBlade6hingeConst_[1].enableMotor();
        this.moBlade6hingeConst_[1].setMotorSpeed(vspeed);
        this.moBlade6hingeConst_[2].enableMotor();
        this.moBlade6hingeConst_[2].setMotorSpeed(vspeed);
        this.world_.addBody(this.moBlade6_[0]);
        this.world_.addBody(this.moBlade6_[1]);
        this.world_.addBody(this.moBlade6_[2]);
        this.scene_.add(this.viBlade6Mesh_[0]);
        this.scene_.add(this.viBlade6Mesh_[1]);
        this.scene_.add(this.viBlade6Mesh_[2]);
        this.world_.addConstraint(this.moBlade6hingeConst_[0]);
        this.world_.addConstraint(this.moBlade6hingeConst_[1]);
        this.world_.addConstraint(this.moBlade6hingeConst_[2]);
        this_viBlade6Mesh_ = this.viBlade6Mesh_;
        this_moBlade6_ = this.moBlade6_;
        this.world_.addEventListener('postStep', addBlade6update);
    }


    blade7hitevent(e) {
        let moBlck = e.contact.bi;
        let moOptn = e.contact.bj;
        if (moOptn.isOpt_ === undefined) {
            [moBlck, moOptn] = [moOptn, moBlck];
        }
        if (moBlck.isOpt_ === undefined) {
            // 進行方向にふっとばす
            let vquat = this_moVehicle_.chassisBody.quaternion;
            var vv = vquat.vmult(new CANNON.Vec3(-1, 0.1, 0));
            moBlck.applyImpulse(vv);
        }
    }

    addBlade7() {
        //　ロードローラーっぽいもの
        this.moBlade7Mtr_ = new CANNON.Material('blade7');
        let radiusTop = 0.5, radiusBottom = 0.5, height = 6, numSegment = 16;
        let mass = 0.1, optD = 4;
        let pxx = 3, pyy = 0, pzz = 0;
        // let posi = this.moChassisBody_.chassisBody.position;
        let posi = this.moChassisBody_.position;
        let adjx = posi.x, adjy=posi.y, adjz = posi.z;
        adjy += 2;
        this.moBlade7_ = [new CANNON.Body({mass: mass,
                                           shape: new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegment),
                                           position: new CANNON.Vec3(pxx+adjx-optD, pyy+adjy, pzz+adjz),
                                           material: this.moBlade7Mtr_, // this.moWheelMtr_,
                                           // isTrigger: true,
                                          }),
                         ];
        this.viBlade7Mesh_ = [new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment),
                                             new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.2})),
                             ];
        this.viBlade7Mesh_[0].position.copy(this.moBlade7_[0].position);
        this.moBlade7_[0].isOpt_ = 0;
        this.moBlade7_[0].addEventListener("collide", this.blade7hitevent);
        this.moBlade7hingeConst_ = [
            new CANNON.HingeConstraint(this.moChassisBody_, this.moBlade7_[0], {
                axisA: new CANNON.Vec3(0, 0, 1),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(-3.5, -0.4, 0),
                pivotB: new CANNON.Vec3(0, 0, 0),
                collideConnected: false,
            }),
        ];
        // 動力を付与
        var vspeed = -10;
        this.moBlade7hingeConst_[0].enableMotor();
        this.moBlade7hingeConst_[0].setMotorSpeed(vspeed);
        this.world_.addBody(this.moBlade7_[0]);
        this.scene_.add(this.viBlade7Mesh_[0]);
        this.world_.addConstraint(this.moBlade7hingeConst_[0]);
        this_viBlade7Mesh_ = this.viBlade7Mesh_;
        this_moBlade7_ = this.moBlade7_;
        this.world_.addEventListener('postStep', addBlade7update);
        // ローラーの軸がぶれる（地面に接しているから？）ので地面との接触を柔らかくする
        const ground_blade7 = new CANNON.ContactMaterial(this.moGroundMtr_, this.moBlade7Mtr_, {
            friction: 0.3,    // 摩擦係数(def=0.3)
            restitution: 0.1, // 反発係数 (def=0.3)
            contactEquationStiffness: 1e-10,  // 剛性(def=1e7)
        })
        this.world_.addContactMaterial(ground_blade7);

    }


    init() {
        this.moWheelMtr_ = new CANNON.Material('wheel');
        this.initBody()
        // Create the vehicle
        this.moVehicle_ = new CANNON.RaycastVehicle({
            chassisBody: this.moChassisBody_,
            sliding: this.sliding_,
        })
        this_moVehicle_ = this.moVehicle_;

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
        const moWheelBodies = [];
        this.moVehicle_.wheelInfos.forEach((wheel) => {
            const moWheelShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius*0.8, 20)
            const moWheelBody = new CANNON.Body({
                mass: 0,
                material: this.moWheelMtr_,
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


        const wheel_ground = new CANNON.ContactMaterial(this.moWheelMtr_, this.moGroundMtr_, {
            friction: this.wheelFriction_,  // 0.9,  // 摩擦係数(def=0.3)
            restitution: 0, // 0,  // 反発係数 (def=0.3)
            contactEquationStiffness: 1e7,  // 剛性(def=1e7)
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
    }

    setPosition2(x, y, z) {
        this.moVehicle_.chassisBody.position.set(x, y, z)
    }

    // 後輪駆動(FR)
    keydown_ArrowUp() {
        this.moVehicle_.applyEngineForce(-this.maxForce_, 2)
        this.moVehicle_.applyEngineForce(-this.maxForce_, 3)
    }
    keydown_ArrowUp2(v) {
        this.moVehicle_.applyEngineForce(-this.maxForce_*v, 2)
        this.moVehicle_.applyEngineForce(-this.maxForce_*v, 3)
    }
    keyup_ArrowUp() {
        this.moVehicle_.applyEngineForce(0, 2)
        this.moVehicle_.applyEngineForce(0, 3)
    }

    keydown_ArrowDown() {
        this.moVehicle_.applyEngineForce(this.maxForce_, 2)
        this.moVehicle_.applyEngineForce(this.maxForce_, 3)
    }
    keydown_ArrowDown2(v) {
        this.moVehicle_.applyEngineForce(this.maxForce_*v, 2)
        this.moVehicle_.applyEngineForce(this.maxForce_*v, 3)
    }
    keyup_ArrowDown() {
        this.moVehicle_.applyEngineForce(0, 2)
        this.moVehicle_.applyEngineForce(0, 3)
    }

    keydown_ArrowLeft() {
        this.moVehicle_.setSteeringValue(this.maxSteerVal_, 0)
        this.moVehicle_.setSteeringValue(this.maxSteerVal_, 1)
    }
    keydown_ArrowLeft2(v) {
        this.moVehicle_.setSteeringValue(this.maxSteerVal_*v, 0)
        this.moVehicle_.setSteeringValue(this.maxSteerVal_*v, 1)
    }
    keyup_ArrowLeft() {
        this.moVehicle_.setSteeringValue(0, 0)
        this.moVehicle_.setSteeringValue(0, 1)
    }

    keydown_ArrowRight() {
        this.moVehicle_.setSteeringValue(-this.maxSteerVal_, 0)
        this.moVehicle_.setSteeringValue(-this.maxSteerVal_, 1)
    }
    keydown_ArrowRight2(v) {
        this.moVehicle_.setSteeringValue(-this.maxSteerVal_*v, 0)
        this.moVehicle_.setSteeringValue(-this.maxSteerVal_*v, 1)
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
    keydown_brake2(v) {
        this.moVehicle_.setBrake(this.brakeForceF_*v, 0)
        this.moVehicle_.setBrake(this.brakeForceF_*v, 1)
        this.moVehicle_.setBrake(this.brakeForceR_*v, 2)
        this.moVehicle_.setBrake(this.brakeForceR_*v, 3)
    }
    keyup_brake() {
        this.moVehicle_.setBrake(0, 0)
        this.moVehicle_.setBrake(0, 1)
        this.moVehicle_.setBrake(0, 2)
        this.moVehicle_.setBrake(0, 3)
    }

    keydown_sidebrake() {
        this.sidebrake_ = (this.sidebrake_+1) % 2
        if (this.sidebrake_) {
            this.moVehicle_.setBrake(this.brakeForceR_, 2)
            this.moVehicle_.setBrake(this.brakeForceR_, 3)
        } else {
            this.moVehicle_.setBrake(0, 2)
            this.moVehicle_.setBrake(0, 3)
        }
    }
    keydown_sidebrakeON() {
        this.moVehicle_.setBrake(this.brakeForceR_, 2)
        this.moVehicle_.setBrake(this.brakeForceR_, 3)
    }
    keydown_sidebrakeOFF() {
        this.moVehicle_.setBrake(0, 2)
        this.moVehicle_.setBrake(0, 3)
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
        // ボディ
        this.viChassisBody_.position.copy(this.moChassisBody_.position);
        this.viChassisBody_.quaternion.copy(this.moChassisBody_.quaternion);
        // ホイール
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
        // const viChassisMtr = new THREE.MeshNormalMaterial();
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
    keydown_ArrowUp2(v) {
        this.moVehicle_.applyEngineForce(-this.maxForce_*v, 0)
        this.moVehicle_.applyEngineForce(-this.maxForce_*v, 1)
    }
    keyup_ArrowUp() {
        this.moVehicle_.applyEngineForce(0, 0)
        this.moVehicle_.applyEngineForce(0, 1)
    }

    keydown_ArrowDown() {
        this.moVehicle_.applyEngineForce(this.maxForce_, 0)
        this.moVehicle_.applyEngineForce(this.maxForce_, 1)
    }
    keydown_ArrowDown2(v) {
        this.moVehicle_.applyEngineForce(this.maxForce_*v, 0)
        this.moVehicle_.applyEngineForce(this.maxForce_*v, 1)
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
    keydown_ArrowUp2(v) {
        this.moVehicle_.applyEngineForce(-this.maxForce_*v, 0)
        this.moVehicle_.applyEngineForce(-this.maxForce_*v, 1)
        this.moVehicle_.applyEngineForce(-this.maxForce_*v, 2)
        this.moVehicle_.applyEngineForce(-this.maxForce_*v, 3)
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
    keydown_ArrowDown2(v) {
        this.moVehicle_.applyEngineForce(this.maxForce_*v, 0)
        this.moVehicle_.applyEngineForce(this.maxForce_*v, 1)
        this.moVehicle_.applyEngineForce(this.maxForce_*v, 2)
        this.moVehicle_.applyEngineForce(this.maxForce_*v, 3)
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


// // export class RigidVehicle01 {
// //     scene_;
// //     world_;
// //     moGroundMtr_;
// //     moVehicle_;
// //     moChassisBody_;
// //     viChassisMesh_;
// //     viWheelMeshes_ = [];
// //     sidebrake_ = 0;

// //     // 重量
// //     mass_ = 60; // 60が片輪走行（グリップ）になるか、ドリフト（滑りだす）かの境
// //     // ステアリング角度、舵角
// //     maxSteerVal_ = 0.5;
// //     // スライドフラグ？
// //     sliding_ = false;

// //     // エンジン出力
// //     maxForce_ = 100; // 100;
// //     // ブレーキの強さ
// //     // brakeForce_ = 1000000;
// //     brakeForceF_ =  8;
// //     brakeForceR_ = 10;

// //     // // サスペンションの硬さ
// //     // suspensionStiffness_ = 30; // 30;
// //     // // サスペンションの長さ(~=車高)
// //     // suspensionRestLength_ = 0.6; // 0.3;
// //     // 摩擦...グリップ力？
// //     //  弱：曲がらない、すべる。アンダーステア
// //     //  強：曲がる。オーバーステア
// //     frictionSlip_ = 10; // 3; // 1.4
// //     // サスペンション
// //     //  弱：ホイールが車体にめり込む、オーバーステアになりがち
// //     //  強：車体が上がる、ウィリーしやすい？アンダーが出やすい
// //     maxSuspensionForce_ = 4000; // 100000;

// //     // 地面とタイヤの摩擦係数
// //     wheelFriction_ = 0.99;  // 0.9;

// //     constructor(scene, world, moGroundMtr) {
// //         this.scene_ = scene;
// //         this.world_ = world;
// //         this.moGroundMtr_ = moGroundMtr;

// //         this.init()
// //     }

// //     init() {
// //         // const moChassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 0.8))
// //         const moChassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.2, 0.8))
// //         this.moChassisBody_ = new CANNON.Body({
// //             mass: this.mass_,
// //             shape: moChassisShape,
// //             position: new CANNON.Vec3(0, 1, 0),
// //         })
// //         // const viChassisGeo = new THREE.BoxGeometry(4, 1, 1.6);
// //         const viChassisGeo = new THREE.BoxGeometry(4, 0.4, 1.6);
// //         // const viChassisMtr = new THREE.MeshNormalMaterial();
// //         const viChassisMtr = new THREE.MeshNormalMaterial({wireframe:true});
// //         this.viChassisMesh_ = new THREE.Mesh(viChassisGeo, viChassisMtr);
// //         this.viChassisMesh_.position.copy(this.moChassisBody_.position);
// //         this.viChassisMesh_.quaternion.copy(this.moChassisBody_.quaternion);
// //         this.scene_.add(this.viChassisMesh_);

// //         // Create the vehicle
// //         this.moVehicle_ = new CANNON.RigidVehicle({
// //             chassisBody: this.moChassisBody_,
// //         })

// //         const mass = 1
// //         const axisWidth = 4 // 7
// //         const moWheelShape = new CANNON.Sphere(0.8)
// //         const moWheelMtr = new CANNON.Material('wheel')
// //         const down = new CANNON.Vec3(0, -1, 0)
// //         const centerOfMassAdjust = new CANNON.Vec3(0, -0.1, 0)

// //         const wheelBody1 = new CANNON.Body({ mass, material: moWheelMtr })
// //         wheelBody1.addShape(moWheelShape)
// //         this.moVehicle_.addWheel({
// //             body: wheelBody1,
// //             position: new CANNON.Vec3(-2, 0, axisWidth / 2).vadd(centerOfMassAdjust),
// //             axis: new CANNON.Vec3(0, 0, 1),
// //             direction: down,
// //         })

// //         const wheelBody2 = new CANNON.Body({ mass, material: moWheelMtr })
// //         wheelBody2.addShape(moWheelShape)
// //         this.moVehicle_.addWheel({
// //             body: wheelBody2,
// //             position: new CANNON.Vec3(-2, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
// //             axis: new CANNON.Vec3(0, 0, -1),
// //             direction: down,
// //         })

// //         const wheelBody3 = new CANNON.Body({ mass, material: moWheelMtr })
// //         wheelBody3.addShape(moWheelShape)
// //         this.moVehicle_.addWheel({
// //             body: wheelBody3,
// //             position: new CANNON.Vec3(2, 0, axisWidth / 2).vadd(centerOfMassAdjust),
// //             axis: new CANNON.Vec3(0, 0, 1),
// //             direction: down,
// //         })

// //         const wheelBody4 = new CANNON.Body({ mass, material: moWheelMtr })
// //         wheelBody4.addShape(moWheelShape)
// //         this.moVehicle_.addWheel({
// //             body: wheelBody4,
// //             position: new CANNON.Vec3(2, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
// //             axis: new CANNON.Vec3(0, 0, -1),
// //             direction: down,
// //         })


// //         this.moVehicle_.wheelBodies.forEach((wheelBody) => {
// //             // Some damping to not spin wheels too fast
// //             wheelBody.angularDamping = 0.4

// //             // Add visuals
// //             var radius = wheelBody.shapes[0].radius;
// //             const viWheelGeo = new THREE.SphereGeometry(radius);
// //             //    const thWheelMtr = new THREE.MeshNormalMaterial();
// //             const viWheelMtr = new THREE.MeshNormalMaterial({wireframe:true});
// //             const viWheel = new THREE.Mesh(viWheelGeo, viWheelMtr);
// //             this.scene_.add(viWheel);
// //             this.viWheelMeshes_.push(viWheel);
// //         })

// //         this.moVehicle_.addToWorld(this.world_)


// //         const wheel_ground = new CANNON.ContactMaterial(moWheelMtr, this.moGroundMtr_, {
// //             friction: this.wheelFriction_,  // 0.9,  // 摩擦係数(def=0.3)
// //             restitution: 0, // 0,  // 反発係数 (def=0.3)
// //             contactEquationStiffness: 1e7,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
// //         })
// //         this.world_.addContactMaterial(wheel_ground)

// //   }

// //     getModel() {
// //         return this.moVehicle_;
// //     }

// //     getPosition() {
// //         return [this.moVehicle_.chassisBody.position.x,
// //                 this.moVehicle_.chassisBody.position.y,
// //                 this.moVehicle_.chassisBody.position.z];
// //     }

// //     setPosition(x, y, z, roty) {
// //         roty = roty -0.5
// //         this.moVehicle_.chassisBody.position.set(0, 10, 10)
// //         const carInitQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), roty*Math.PI);
// //         this.moVehicle_.chassisBody.quaternion.copy(carInitQuat);
// //     }

// //     // 後輪駆動(FR)
// //     keydown_ArrowUp() {
// //         this.moVehicle_.setWheelForce(this.maxForce_, 2)
// //         this.moVehicle_.setWheelForce(-this.maxForce_, 3)
// //     }
// //     keydown_ArrowUp2(v) {
// //         this.moVehicle_.setWheelForce(this.maxForce_*v, 2)
// //         this.moVehicle_.setWheelForce(-this.maxForce_*v, 3)
// //     }
// //     keyup_ArrowUp() {
// //         this.moVehicle_.setWheelForce(0, 2)
// //         this.moVehicle_.setWheelForce(0, 3)
// //     }

// //     keydown_ArrowDown() {
// //         this.moVehicle_.setWheelForce(-this.maxForce_, 2)
// //         this.moVehicle_.setWheelForce(this.maxForce_, 3)
// //     }
// //     keydown_ArrowDown2(v) {
// //         this.moVehicle_.setWheelForce(-this.maxForce_*v, 2)
// //         this.moVehicle_.setWheelForce(this.maxForce_*v, 3)
// //     }
// //     keyup_ArrowDown() {
// //         this.moVehicle_.setWheelForce(0, 2)
// //         this.moVehicle_.setWheelForce(0, 3)
// //     }

// //     keydown_ArrowLeft() {
// //         this.moVehicle_.setSteeringValue(this.maxSteerVal_, 0)
// //         this.moVehicle_.setSteeringValue(this.maxSteerVal_, 1)
// //     }
// //     keydown_ArrowLeft2(v) {
// //         this.moVehicle_.setSteeringValue(this.maxSteerVal_*v, 0)
// //         this.moVehicle_.setSteeringValue(this.maxSteerVal_*v, 1)
// //     }
// //     keyup_ArrowLeft() {
// //         this.moVehicle_.setSteeringValue(0, 0)
// //         this.moVehicle_.setSteeringValue(0, 1)
// //     }

// //     keydown_ArrowRight() {
// //         this.moVehicle_.setSteeringValue(-this.maxSteerVal_, 0)
// //         this.moVehicle_.setSteeringValue(-this.maxSteerVal_, 1)
// //     }
// //     keydown_ArrowRight2(v) {
// //         this.moVehicle_.setSteeringValue(-this.maxSteerVal_*v, 0)
// //         this.moVehicle_.setSteeringValue(-this.maxSteerVal_*v, 1)
// //     }
// //     keyup_ArrowRight() {
// //         this.moVehicle_.setSteeringValue(0, 0)
// //         this.moVehicle_.setSteeringValue(0, 1)
// //     }

// //     keydown_break() {
// //     }
// //     keyup_break() {
// //     }

// //     keydown_sidebrake() {
// //     }
// //     keydown_resetPosture() {
// //         // 車をひっくり返したいけど、シャーシ・ホイルを同時に指定する必要あり。面倒なので保留に

// //         // 車を持ち上げ
// //         var upY = 5;
// //         this.moVehicle_.chassisBody.position.z += upY;
// //         for (var i = 0; i < 4; ++i) {
// //             this.moVehicle_.wheelBodies[i].position.z += upY;
// //         }

// //         // 速度、角速度を初期化しておく
// //         this.moVehicle_.chassisBody.velocity = new CANNON.Vec3(0, 0, 0);
// //         this.moVehicle_.chassisBody.angularVelocity = new CANNON.Vec3(0, 0, 0);

// //         // 片方だけに力を加えてみる
// //         var vquat = this.moVehicle_.chassisBody.quaternion;
// //         var veuler = new CANNON.Vec3(0, 0, 0);
// //         vquat.toEuler(veuler);
// //         var ry = -veuler.y;
// //         var fy = new CANNON.Vec3(0, 10, 0);
// //         var pz, px;
// //         var cos_ry, sin_ry;
// //         cos_ry = Math.cos(ry);
// //         sin_ry = Math.sin(ry);
// //         pz =  5*cos_ry + 2*sin_ry;
// //         px = -5*sin_ry + 2*cos_ry;
// //         this.moVehicle_.chassisBody.applyImpulse(fy, new CANNON.Vec3(px, 0, pz));
// //         pz =  5*cos_ry  -2*sin_ry;
// //         px = -5*sin_ry  -2*cos_ry;
// //         this.moVehicle_.chassisBody.applyImpulse(fy, new CANNON.Vec3(px, 0, pz));
// //     }

// //     viewUpdate() {
// //         this.viChassisMesh_.position.copy(this.moChassisBody_.position);
// //         this.viChassisMesh_.quaternion.copy(this.moChassisBody_.quaternion);
// //         this.moVehicle_.wheelBodies.forEach((wheelBody, i) => {
// //             this.viWheelMeshes_[i].position.copy(wheelBody.position);
// //             this.viWheelMeshes_[i].quaternion.copy(wheelBody.quaternion);
// //         });
// //     }

// // }

/*

- cannon-es docs
https://pmndrs.github.io/cannon-es/docs/
https://pmndrs.github.io/cannon-es/

- めちゃくちゃわかりやすい図
  https://github.com/pmndrs/use-cannon/discussions/90
    point-to-point
    spring
    hinge
    cone twist
    slider
    6 DoF

*/

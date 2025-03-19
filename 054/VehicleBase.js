// mode:javascript

import * as THREE from "three";
import * as CANNON from "cannon";

var this_moVehicle_ = null;


var this_viEq4Mesh_ = [];
var this_moEq4_ = [];
function addEq4update() {
    if (this_viEq4Mesh_.length > 0) {
        this_viEq4Mesh_[0].position.copy(this_moEq4_[0].position)
        this_viEq4Mesh_[0].quaternion.copy(this_moEq4_[0].quaternion)
    }
}

var this_viEq5Mesh_ = [];
var this_moEq5_ = [];
function addEq5update() {
    if (this_viEq5Mesh_.length > 0) {
        this_viEq5Mesh_[0].position.copy(this_moEq5_[0].position)
        this_viEq5Mesh_[1].position.copy(this_moEq5_[1].position)
        this_viEq5Mesh_[2].position.copy(this_moEq5_[2].position)
        this_viEq5Mesh_[3].position.copy(this_moEq5_[3].position)
    }
}

var this_viEq6Mesh_ = [];
var this_moEq6_ = [];
function addEq6update() {
    if (this_viEq6Mesh_.length > 0) {
        this_viEq6Mesh_[0].position.copy(this_moEq6_[0].position)
        this_viEq6Mesh_[0].quaternion.copy(this_moEq6_[0].quaternion)
        this_viEq6Mesh_[1].position.copy(this_moEq6_[1].position)
        this_viEq6Mesh_[1].quaternion.copy(this_moEq6_[1].quaternion)
        this_viEq6Mesh_[2].position.copy(this_moEq6_[2].position)
        this_viEq6Mesh_[2].quaternion.copy(this_moEq6_[2].quaternion)
    }
}

var this_viEq7Mesh_ = [];
var this_moEq7_ = [];
function addEq7update() {
    if (this_viEq7Mesh_.length > 0) {
        this_viEq7Mesh_[0].position.copy(this_moEq7_[0].position)
        this_viEq7Mesh_[0].quaternion.copy(this_moEq7_[0].quaternion)
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

    constructor(scene, world, moGroundMtr, moBlockMass0Mtr) {
        this.scene_ = scene;
        this.world_ = world;
        this.moGroundMtr_ = moGroundMtr;
        this.moBlockMass0Mtr_ = moBlockMass0Mtr;
        this.ieq_ = 0;
        this.moEq1_ = null;
        this.viEq1Mesh_ = null;
        this.moEq2_ = null;
        this.viEq2Mesh_ = null;
        this.moEq3_ = null;
        this.viEq3Mesh_ = null;
        this.moEq4_ = [];
        this.viEq4Mesh_ = [];
        this.moEq4hingeConst_ = [];
        this.moEq5_ = [];
        this.viEq5Mesh_ = [];
        this.moEq5hingeConst_ = [];
        this.moEq6_ = [];
        this.viEq6Mesh_ = [];
        this.moEq6hingeConst_ = [];
        this.moEq7_ = [];
        this.viEq7Mesh_ = [];
        this.moEq7hingeConst_ = [];
        this.moEq8_ = null;
        this.viEq8Mesh_ = null;
        this.eq8bullet_ = [];
        this.eq8recycle_ = [];
        this.moEq9_ = null;
        this.viEq9Mesh_ = null;
        this.eq9bullet_ = [];
        this.eq9recycle_ = [];
        this.id2movi_ = {};
        this.borderRng_ = [];
        this.eq10bullet_ = [];
        this.eq10recycle_ = [];
        this.moEq11_ = null;
        this.viEq11Mesh_ = null;
        this.eq11bullet_ = [];
        this.eq11recycle_ = [];
        this.moEq12_ = null;
        this.viEq12Mesh_ = null;
        this.eq12bullet_ = [];
        this.eq12recycle_ = [];
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

    changeEq(val) {
        this.clearEq();
        if (val == 1) {
            // 平板
            this.addEq1();
            this.ieq_ = 1;
        } else if (val == 2) {
            // 斜め板
            this.addEq2();
            this.ieq_ = 2;
        } else if (val == 3) {
            // ローラー
            this.addEq7();
            this.ieq_ = 7;
        } else if (val == 4) {
            // ハンマー×４
            this.addEq5();
            this.ieq_ = 5;
        } else if (val == 5) {
            // ドリル
            this.addEq4();
            this.ieq_ = 4;
        } else if (val == 6) {
            // ドリル×３（トライデント
            this.addEq6();
            this.ieq_ = 6;
        } else if (val == 7) {
            // 放水車／／粒子を前方に射出
            this.addEq8();
            this.ieq_ = 8;
        } else if (val == 8) {
            // 半分潜航の螺旋キューブ（追尾）を全方位に射出
            this.addEq11();
            this.ieq_ = 11;
        } else if (val == 9) {
            // 竜巻
            this.addEq12();
            this.ieq_ = 12;
        } else if (val == 10) {
            // メテオストライク
            this.addEq10();
            this.ieq_ = 10;
        }

            // // 放水車／粒子（追尾）を前方に射出
            // this.addEq9();
            // this.ieq_ = 9;

            // // 三角すい
            // this.addEq3();
            // this.ieq_ = 3;
    }

    clearEq() {
        this.ieq_ = 0;
        if (this.moEq1_ != null) {
            this.moChassisBody_.removeShape(this.moEq1_);
            this.viChassisBody_.remove(this.viEq1Mesh_);
            this.moEq1_ = null;
            this.viEq1Mesh_ = null;
        }
        if (this.moEq2_ != null) {
            this.moChassisBody_.removeShape(this.moEq2_);
            this.viChassisBody_.remove(this.viEq2Mesh_);
            this.moEq2_ = null;
            this.viEq2Mesh_ = null;
        }
        if (this.moEq3_ != null) {
            this.moChassisBody_.removeShape(this.moEq3_);
            this.viChassisBody_.remove(this.viEq3Mesh_);
            this.moEq3_ = null;
            this.viEq3Mesh_ = null;
        }
        if (this.moEq4_.length > 0) {
            this.world_.removeEventListener('postStep', addEq4update);
            this_viEq4Mesh_ = [];
            this_moEq4_ = [];
            this.world_.removeConstraint(this.moEq4hingeConst_[0]);
            this.moEq4hingeConst_ = [];
            this.world_.removeBody(this.moEq4_[0]);
            this.scene_.remove(this.viEq4Mesh_[0]);
            this.moEq4_ = [];
            this.viEq4Mesh_ = [];
        }
        if (this.moEq5_.length > 0) {
            this.world_.removeEventListener('postStep', addEq5update);
            this_viEq5Mesh_ = [];
            this_moEq5_ = [];
            this.world_.removeConstraint(this.moEq5hingeConst_[0]);
            this.world_.removeConstraint(this.moEq5hingeConst_[1]);
            this.world_.removeConstraint(this.moEq5hingeConst_[2]);
            this.world_.removeConstraint(this.moEq5hingeConst_[3]);
            this.moEq5hingeConst_ = [];
            this.world_.removeBody(this.moEq5_[0]);
            this.world_.removeBody(this.moEq5_[1]);
            this.world_.removeBody(this.moEq5_[2]);
            this.world_.removeBody(this.moEq5_[3]);
            this.scene_.remove(this.viEq5Mesh_[0]);
            this.scene_.remove(this.viEq5Mesh_[1]);
            this.scene_.remove(this.viEq5Mesh_[2]);
            this.scene_.remove(this.viEq5Mesh_[3]);
            this.moEq5_ = [];
            this.viEq5Mesh_ = [];
        }
        if (this.moEq6_.length > 0) {
            this.world_.removeEventListener('postStep', addEq6update);
            this_viEq6Mesh_ = [];
            this_moEq6_ = [];
            this.world_.removeConstraint(this.moEq6hingeConst_[0]);
            this.world_.removeConstraint(this.moEq6hingeConst_[1]);
            this.world_.removeConstraint(this.moEq6hingeConst_[2]);
            this.moEq6hingeConst_ = [];
            this.world_.removeBody(this.moEq6_[0]);
            this.world_.removeBody(this.moEq6_[1]);
            this.world_.removeBody(this.moEq6_[2]);
            this.scene_.remove(this.viEq6Mesh_[0]);
            this.scene_.remove(this.viEq6Mesh_[1]);
            this.scene_.remove(this.viEq6Mesh_[2]);
            this.moEq6_ = [];
            this.viEq6Mesh_ = [];
        }
        if (this.moEq7_.length > 0) {
            this.world_.removeEventListener('postStep', addEq7update);
            this_viEq7Mesh_ = [];
            this_moEq7_ = [];
            this.world_.removeConstraint(this.moEq7hingeConst_[0]);
            this.moEq7hingeConst_ = [];
            this.world_.removeBody(this.moEq7_[0]);
            this.scene_.remove(this.viEq7Mesh_[0]);
            this.moEq7_ = [];
            this.viEq7Mesh_ = [];
        }
        if (this.moEq8_ != null) {
            this.moChassisBody_.removeShape(this.moEq8_);
            this.viChassisBody_.remove(this.viEq8Mesh_);
            this.moEq8_ = null;
            this.viEq8Mesh_ = null;
        }
        if (this.eq8bullet_.length > 0) {
            for (let [mo,vi] of this.eq8bullet_) {
                this.eq8recycle_.push([mo,vi]);
            }
        }
        if (this.moEq9_ != null) {
            this.moChassisBody_.removeShape(this.moEq9_);
            this.viChassisBody_.remove(this.viEq9Mesh_);
            this.moEq9_ = null;
            this.viEq9Mesh_ = null;
        }
        if (this.eq9bullet_.length > 0) {
            for (let [mo,vi] of this.eq9bullet_) {
                this.eq9recycle_.push([mo,vi]);
            }
        }
        if (this.moEq10_ != null) {
            this.moChassisBody_.removeShape(this.moEq10_);
            this.viChassisBody_.remove(this.viEq10Mesh_);
            this.moEq10_ = null;
            this.viEq10Mesh_ = null;
        }
        if (this.eq10bullet_.length > 0) {
            for (let [mo,vi] of this.eq10bullet_) {
                this.eq10recycle_.push([mo,vi]);
            }
        }
        if (this.moEq11_ != null) {
            this.moChassisBody_.removeShape(this.moEq11_);
            this.viChassisBody_.remove(this.viEq11Mesh_);
            this.moEq11_ = null;
            this.viEq11Mesh_ = null;
        }
        if (this.eq11bullet_.length > 0) {
            for (let [mo,vi] of this.eq11bullet_) {
                this.eq11recycle_.push([mo,vi]);
            }
        }
        if (this.moEq12_ != null) {
            this.moChassisBody_.removeShape(this.moEq12_);
            this.viChassisBody_.remove(this.viEq12Mesh_);
            this.moEq12_ = null;
            this.viEq12Mesh_ = null;
        }
        if (this.eq12bullet_.length > 0) {
            for (let [mo,vi] of this.eq12bullet_) {
                this.eq12recycle_.push([mo,vi]);
            }
        }
    }

    addEq1() {
        // 平板
        let sxx = 0.1, syy = 2, szz = 10;
        let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
        let pxx = -2.5, pyy = syy_-1.0, pzz = 0;
        let quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI/6);
        this.moEq1_ = new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_));
        this.moChassisBody_.addShape(this.moEq1_,
                                     new CANNON.Vec3(pxx, pyy, pzz),
                                     quat);
        const viEq1Geo = new THREE.BoxGeometry(sxx, syy, szz);
        const viEq1Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        this.viEq1Mesh_ = new THREE.Mesh(viEq1Geo, viEq1Mtr);
        this.viEq1Mesh_.position.copy(new THREE.Vector3(pxx, pyy, pzz));
        this.viEq1Mesh_.quaternion.copy(quat);
        this.viChassisBody_.add(this.viEq1Mesh_);
    }

    addEq2() {
        // ななめな平板（左側に押し出す感じの
        let sxx = 0.1, syy = 2, szz = 10;
        let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
        let pxx = -2.5, pyy = syy_-0.9, pzz = 0;
        let quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI/6);
        this.moEq2_ = new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_));
        this.moChassisBody_.addShape(this.moEq2_,
                                     new CANNON.Vec3(pxx, pyy, pzz),
                                     quat);
        const viEq2Geo = new THREE.BoxGeometry(sxx, syy, szz);
        const viEq2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        this.viEq2Mesh_ = new THREE.Mesh(viEq2Geo, viEq2Mtr);
        this.viEq2Mesh_.position.copy(new THREE.Vector3(pxx, pyy, pzz));
        this.viEq2Mesh_.quaternion.copy(quat);
        this.viChassisBody_.add(this.viEq2Mesh_);
    }

    // addEq3() {
    //     // △頭
    //     let radiusTop = 0, radiusBottom = 1.5, height = 3, numSegment = 3;
    //     let pxx = -4, pyy = -.4, pzz = 0;
    //     let quat1 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI/2); // 1.57
    //     let quat2 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), 1.8);
    //     let quat = quat2.mult(quat1);
    //     this.moEq3_ = new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegment);
    //     this.moChassisBody_.addShape(this.moEq3_,
    //                                  new CANNON.Vec3(pxx, pyy, pzz),
    //                                  quat);
    //     const viEq3Geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment);
    //     const viEq3Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    //     this.viEq3Mesh_ = new THREE.Mesh(viEq3Geo, viEq3Mtr);
    //     this.viEq3Mesh_.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    //     this.viEq3Mesh_.quaternion.copy(quat);
    //     this.viChassisBody_.add(this.viEq3Mesh_);
    // }


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


    addEq4() {
        //　一本やり：進行方向にぶっ飛ばす
        let radiusTop = 0, radiusBottom = 1, height = 3, numSegment = 4;
        let mass = 5, optD = 4;
        let pxx = 3, pyy = 0, pzz = 0;
        let quat1 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI/2);
        let posi = this.moChassisBody_.position;
        let adjx = posi.x, adjy=posi.y, adjz = posi.z;
        adjy += 2;
        this.moEq4_ = [new CANNON.Body({mass: mass,
                                           shape: new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegment),
                                           position: new CANNON.Vec3(pxx+adjx-optD, pyy+adjy, pzz+adjz),
                                           material: this.moWheelMtr_,
                                          }),
                         ];
        this.viEq4Mesh_ = [new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment),
                                             new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.4})),
                             ];
        this.viEq4Mesh_[0].position.copy(this.moEq4_[0].position);
        this.moEq4_[0].isOpt_ = 0;
        this.moEq4_[0].addEventListener("collide", this.blade4hitevent);
        this.moEq4hingeConst_ = [
            new CANNON.HingeConstraint(this.moChassisBody_, this.moEq4_[0], {
                axisA: new CANNON.Vec3(1, 0, 0),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(-4, 0.5, 0),
                pivotB: new CANNON.Vec3(0, 0, 0),
                collideConnected: false,
            }),
        ];
        // 動力を付与
        var vspeed = -10;
        this.moEq4hingeConst_[0].enableMotor();
        this.moEq4hingeConst_[0].setMotorSpeed(vspeed);
        this.world_.addBody(this.moEq4_[0]);
        this.scene_.add(this.viEq4Mesh_[0]);
        this.world_.addConstraint(this.moEq4hingeConst_[0]);
        this_viEq4Mesh_ = this.viEq4Mesh_;
        this_moEq4_ = this.moEq4_;
        this.world_.addEventListener('postStep', addEq4update);
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

    addEq5() {
        //　ハンマー投げ×４
        let radius = 0.3, mass = 2, optD = 4;
        let pxx = 3, pyy = 0, pzz = 0;
        let posi = this.moChassisBody_.position;
        let adjx = posi.x, adjy=posi.y, adjz = posi.z;
        adjy += 2;
        this.moEq5_ = [new CANNON.Body({mass: mass,
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
        this.viEq5Mesh_ = [new THREE.Mesh(new THREE.SphereGeometry(radius),
                                             new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4})),
                              new THREE.Mesh(new THREE.SphereGeometry(radius),
                                             new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4})),
                              new THREE.Mesh(new THREE.SphereGeometry(radius),
                                             new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4})),
                              new THREE.Mesh(new THREE.SphereGeometry(radius),
                                             new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4})),];
        this.viEq5Mesh_[0].position.copy(this.moEq5_[0].position);
        this.viEq5Mesh_[1].position.copy(this.moEq5_[1].position);
        this.viEq5Mesh_[2].position.copy(this.moEq5_[2].position);
        this.viEq5Mesh_[3].position.copy(this.moEq5_[3].position);
        this.moEq5_[0].isOpt_ = true;
        this.moEq5_[1].isOpt_ = true;
        this.moEq5_[2].isOpt_ = true;
        this.moEq5_[3].isOpt_ = true;
        this.moEq5_[0].addEventListener("collide", this.blade5hitevent);
        this.moEq5_[1].addEventListener("collide", this.blade5hitevent);
        this.moEq5_[2].addEventListener("collide", this.blade5hitevent);
        this.moEq5_[3].addEventListener("collide", this.blade5hitevent);
        // 動きの制約（ヒンジで繋ぐ
        this.moEq5hingeConst_ = [
            new CANNON.HingeConstraint(this.moChassisBody_, this.moEq5_[0], {
                axisA: new CANNON.Vec3(0, 1, 0),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(0, 0.2, 0),
                pivotB: new CANNON.Vec3(-optD, 0, 0),
                collideConnected: false,
            }),
            new CANNON.HingeConstraint(this.moChassisBody_, this.moEq5_[1], {
                axisA: new CANNON.Vec3(0, 1, 0),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(0, 0.3, 0),
                pivotB: new CANNON.Vec3(0, 0, optD),
                collideConnected: false,
            }),
            new CANNON.HingeConstraint(this.moChassisBody_, this.moEq5_[2], {
                axisA: new CANNON.Vec3(0, 1, 0),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(0, 0.4, 0),
                pivotB: new CANNON.Vec3(optD, 0, 0),
                collideConnected: false,
            }),
            new CANNON.HingeConstraint(this.moChassisBody_, this.moEq5_[3], {
                axisA: new CANNON.Vec3(0, 1, 0),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(0, 0.5, 0),
                pivotB: new CANNON.Vec3(0, 0, -optD),
                collideConnected: false,
            }),
        ];
        // 動力を付与
        var vspeed = -2;
        this.moEq5hingeConst_[0].enableMotor();
        this.moEq5hingeConst_[0].setMotorSpeed(vspeed);
        this.moEq5hingeConst_[1].enableMotor();
        this.moEq5hingeConst_[1].setMotorSpeed(vspeed);
        this.moEq5hingeConst_[2].enableMotor();
        this.moEq5hingeConst_[2].setMotorSpeed(vspeed);
        this.moEq5hingeConst_[3].enableMotor();
        this.moEq5hingeConst_[3].setMotorSpeed(vspeed);
        this.world_.addBody(this.moEq5_[0]);
        this.world_.addBody(this.moEq5_[1]);
        this.world_.addBody(this.moEq5_[2]);
        this.world_.addBody(this.moEq5_[3]);
        this.scene_.add(this.viEq5Mesh_[0]);
        this.scene_.add(this.viEq5Mesh_[1]);
        this.scene_.add(this.viEq5Mesh_[2]);
        this.scene_.add(this.viEq5Mesh_[3]);
        this.world_.addConstraint(this.moEq5hingeConst_[0]);
        this.world_.addConstraint(this.moEq5hingeConst_[1]);
        this.world_.addConstraint(this.moEq5hingeConst_[2]);
        this.world_.addConstraint(this.moEq5hingeConst_[3]);
        this_viEq5Mesh_ = this.viEq5Mesh_;
        this_moEq5_ = this.moEq5_;
        this.world_.addEventListener('postStep', addEq5update);
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

    addEq6() {
        //　トライデント（三叉槍）：三方向にぶっ飛ばす
        let radiusTop = 0, radiusBottom = 1, height = 3, numSegment = 4;
        let mass = 5, optD = 4;
        let pxx = 3, pyy = 0, pzz = 0;
        let posi = this.moChassisBody_.position;
        let adjx = posi.x, adjy=posi.y, adjz = posi.z;
        adjy += 2;
        this.moEq6_ = [new CANNON.Body({mass: mass,
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
        this.viEq6Mesh_ = [new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment),
                                          new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.4})),
                           new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment),
                                          new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.4})),
                           new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment),
                                          new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.4})),
                          ];
        this.viEq6Mesh_[0].position.copy(this.moEq6_[0].position);
        this.viEq6Mesh_[1].position.copy(this.moEq6_[1].position);
        this.viEq6Mesh_[2].position.copy(this.moEq6_[2].position);
        this.moEq6_[0].isOpt_ = 0;
        this.moEq6_[1].isOpt_ = 1;
        this.moEq6_[2].isOpt_ = 2;
        this.moEq6_[0].addEventListener("collide", this.blade6hitevent);
        this.moEq6_[1].addEventListener("collide", this.blade6hitevent);
        this.moEq6_[2].addEventListener("collide", this.blade6hitevent);
        this.moEq6hingeConst_ = [
            new CANNON.HingeConstraint(this.moChassisBody_, this.moEq6_[0], {
                axisA: new CANNON.Vec3(1, 0, 0),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(-4, 0.5, 0),
                pivotB: new CANNON.Vec3(0, 0, 0),
                collideConnected: false,
            }),
            new CANNON.HingeConstraint(this.moChassisBody_, this.moEq6_[1], {
                axisA: new CANNON.Vec3(1, 0, 0.5),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(-4, 0.5, -4),
                pivotB: new CANNON.Vec3(0, 0, 0),
                collideConnected: false,
            }),
            new CANNON.HingeConstraint(this.moChassisBody_, this.moEq6_[2], {
                axisA: new CANNON.Vec3(1, 0, -0.5),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(-4, 0.5, +4),
                pivotB: new CANNON.Vec3(0, 0, 0),
                collideConnected: false,
            }),
        ];
        // 動力を付与
        var vspeed = -10;
        this.moEq6hingeConst_[0].enableMotor();
        this.moEq6hingeConst_[0].setMotorSpeed(vspeed);
        this.moEq6hingeConst_[1].enableMotor();
        this.moEq6hingeConst_[1].setMotorSpeed(vspeed);
        this.moEq6hingeConst_[2].enableMotor();
        this.moEq6hingeConst_[2].setMotorSpeed(vspeed);
        this.world_.addBody(this.moEq6_[0]);
        this.world_.addBody(this.moEq6_[1]);
        this.world_.addBody(this.moEq6_[2]);
        this.scene_.add(this.viEq6Mesh_[0]);
        this.scene_.add(this.viEq6Mesh_[1]);
        this.scene_.add(this.viEq6Mesh_[2]);
        this.world_.addConstraint(this.moEq6hingeConst_[0]);
        this.world_.addConstraint(this.moEq6hingeConst_[1]);
        this.world_.addConstraint(this.moEq6hingeConst_[2]);
        this_viEq6Mesh_ = this.viEq6Mesh_;
        this_moEq6_ = this.moEq6_;
        this.world_.addEventListener('postStep', addEq6update);
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

    addEq7() {
        //　ロードローラーっぽいもの
        this.moEq7Mtr_ = new CANNON.Material('blade7');
        let radiusTop = 0.5, radiusBottom = 0.5, height = 6, numSegment = 16;
        let mass = 0.1, optD = 4;
        let pxx = 3, pyy = 0, pzz = 0;
        // let posi = this.moChassisBody_.chassisBody.position;
        let posi = this.moChassisBody_.position;
        let adjx = posi.x, adjy=posi.y, adjz = posi.z;
        adjy += 2;
        this.moEq7_ = [new CANNON.Body({mass: mass,
                                        shape: new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegment),
                                        position: new CANNON.Vec3(pxx+adjx-optD, pyy+adjy, pzz+adjz),
                                        material: this.moEq7Mtr_, // this.moWheelMtr_,
                                        // isTrigger: true,
                                       }),
                         ];
        this.viEq7Mesh_ = [new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment),
                                          new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.2})),
                             ];
        this.viEq7Mesh_[0].position.copy(this.moEq7_[0].position);
        this.moEq7_[0].isOpt_ = 0;
        this.moEq7_[0].addEventListener("collide", this.blade7hitevent);
        this.moEq7hingeConst_ = [
            new CANNON.HingeConstraint(this.moChassisBody_, this.moEq7_[0], {
                axisA: new CANNON.Vec3(0, 0, 1),
                axisB: new CANNON.Vec3(0, 1, 0),
                pivotA: new CANNON.Vec3(-3.5, -0.4, 0),
                pivotB: new CANNON.Vec3(0, 0, 0),
                collideConnected: false,
            }),
        ];
        // 動力を付与
        var vspeed = -10;
        this.moEq7hingeConst_[0].enableMotor();
        this.moEq7hingeConst_[0].setMotorSpeed(vspeed);
        this.world_.addBody(this.moEq7_[0]);
        this.scene_.add(this.viEq7Mesh_[0]);
        this.world_.addConstraint(this.moEq7hingeConst_[0]);
        this_viEq7Mesh_ = this.viEq7Mesh_;
        this_moEq7_ = this.moEq7_;
        this.world_.addEventListener('postStep', addEq7update);
        // ローラーの軸がぶれる（地面に接しているから？）ので地面との接触を柔らかくする
        const ground_blade7 = new CANNON.ContactMaterial(this.moGroundMtr_, this.moEq7Mtr_, {
            friction: 0.3,    // 摩擦係数(def=0.3)
            restitution: 0.1, // 反発係数 (def=0.3)
            contactEquationStiffness: 1e-10,  // 剛性(def=1e7)
        })
        this.world_.addContactMaterial(ground_blade7);
    }

    addEq8() {
        // 放水車／粒子を前方に射出
        //  筒のみを設置
        let sxx = 3, syy = 0.5, szz = 0.5;
        let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
        let pxx = -sxx_, pyy = 0.5, pzz = 0;
        this.moEq8_ = new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_));
        this.moChassisBody_.addShape(this.moEq8_,
                                     new CANNON.Vec3(pxx, pyy, pzz));
        const viEq8Geo = new THREE.BoxGeometry(sxx, syy, szz);
        const viEq8Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        this.viEq8Mesh_ = new THREE.Mesh(viEq8Geo, viEq8Mtr);
        this.viEq8Mesh_.position.copy(new THREE.Vector3(pxx, pyy, pzz));
        this.viChassisBody_.add(this.viEq8Mesh_);
        this.eq8nbullet_ = 700;  // 弾数
        this.cooltime8_ = 0;
        this.cooltime8max_ = 1; // 発射の間隔（連射しないための間隔
    }

    fireEq8() {
        if (this.eq8bullet_.length > 0) {
            // 射出した弾について..
            let bullet = [];
            for (let [mo,vi] of this.eq8bullet_) {
                mo.life_ = mo.life_-1; // ライフを１つ減らす
                if (mo.life_ > 0) {
                    bullet.push([mo,vi]);
                } else {
                    // ライフがなくなったらリサイクルに
                    this.eq8recycle_.push([mo,vi]);
                }
            }
            this.eq8bullet_ = bullet;
        }
        if ((this.cooltime8_ > 0) || (this.eq8bullet_.length > this.eq8nbullet_)) {
            this.cooltime8_ = this.cooltime8_-1; // 発射後のクールタイムを１つ減らす
            return;
        }
        // 発射
        this.cooltime8_ = this.cooltime8max_;
        let vposi = this.moVehicle_.chassisBody.position;
        let vquat = this.moVehicle_.chassisBody.quaternion;
        let life = 150;
        let appImp = 500;
        let radius = 0.1,  mass = 10;
        for (let ii = 0; ii < 10; ++ii) {
            // 基本、前方方向に向けつつもランダムで左右に
            let vv = vquat.vmult(new CANNON.Vec3(-3.2, 0, (Math.random()-0.5)/4));  // 前方、高さ、左右
            // 射出位置もランダムで
            let adjx = Math.random()/4-0.25;
            let adjy = Math.random()/4-0.25;
            let adjz = Math.random()/4-0.25;
            if (this.eq8recycle_.length > 0) {
                let [mo8, vi8] = this.eq8recycle_.pop();
                mo8.life_ = life;
                mo8.position = new CANNON.Vec3(vposi.x+vv.x+adjx, vposi.y+vv.y+adjy, vposi.z+vv.z+adjz);
                vi8.position.copy(mo8.position);
                // 再利用前の影響を無くすために速度、回転速度をリセットする
                mo8.velocity = new CANNON.Vec3(0, 0, 0);
                mo8.angularVelocity = new CANNON.Vec3(0, 0, 0);
                mo8.applyImpulse(vv.scale(appImp));
                this.eq8bullet_.push([mo8, vi8]);
            } else {
                let mo8 = new CANNON.Body({mass: mass,
                                           shape: new CANNON.Sphere(radius),
                                           position: new CANNON.Vec3(vposi.x+vv.x+adjx, vposi.y+vv.y+adjy, vposi.z+vv.z+adjz),
                                           material: this.moWheelMtr_,
                                          });
                mo8.life_ = life;
                let vi8 = new THREE.Mesh(new THREE.SphereGeometry(radius),
                                         new THREE.MeshBasicMaterial({color:0xc0d0ff}));
                this.world_.addBody(mo8)
                this.scene_.add(vi8);
                this.world_.addEventListener('postStep', () => {
                    vi8.position.copy(mo8.position);
                })
                mo8.applyImpulse(vv.scale(appImp));
                this.eq8bullet_.push([mo8, vi8]);
            }
        }
    }


    choiceBlock() {
        let defmo = this.id2movi_[0][0]; // デフォルト(見つからなかったときのため
        let re = Math.floor(Math.random()*4);  // リトライ回数
        for (const id in this.id2movi_) {
            const [moBlock2Body, viBlock2Mesh] = this.id2movi_[id];
            if (moBlock2Body.isIN_ == false) {
                continue;
            }
            let posi = moBlock2Body.position;
            if (posi.x < this.borderRng_[0] || this.borderRng_[2] < posi.x ||
                posi.z < this.borderRng_[1] || this.borderRng_[3] < posi.z) {
                moBlock2Body.isIN_ = false;
                continue;
            }
            // 場内に残っているものを選ぶ
            defmo = moBlock2Body;
            if (re > 0) {
                --re;
                continue;
            }
            return moBlock2Body;
        }
        return defmo;
    }

    addEq9() {
        // 放水車／粒子（追尾）を前方に射出
        //  筒のみを設置
        let sxx = 3, syy = 0.1, szz = 0.1;
        let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
        let pxx = -sxx_, pyy = 0.5, pzz = 0;
        this.moEq9_ = new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_));
        this.moChassisBody_.addShape(this.moEq9_,
                                     new CANNON.Vec3(pxx, pyy, pzz));
        const viEq9Geo = new THREE.BoxGeometry(sxx, syy, szz);
        const viEq9Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        this.viEq9Mesh_ = new THREE.Mesh(viEq9Geo, viEq9Mtr);
        this.viEq9Mesh_.position.copy(new THREE.Vector3(pxx, pyy, pzz));
        // this.viEq9Mesh_.quaternion.copy(quat);
        this.viChassisBody_.add(this.viEq9Mesh_);
        this.cooltime9_ = 0;
        this.eq9nbullet_ = 500;  // 弾数
        this.cooltime9max_ = 1; // 発射の間隔
    }

    fireEq9() {
        if (this.eq9bullet_.length > 0) {
            let bullet = [];
            for (let [mo,vi] of this.eq9bullet_) {
                mo.life_ = mo.life_-1;
                if (mo.life_ > 0) {
                    bullet.push([mo,vi]);
                    // 進行方向を修正
                    let trgp = mo.trg_.position;
                    let vsub = trgp.vsub(mo.position);
                    vsub.normalize();
                    mo.applyImpulse(vsub.scale(20));
                } else {
                    // if (mo.trg_ != null) {
                    {
                        let trg = mo.trg_;
                        // delete this.eq9selected_[trg.idx];
                        mo.trg_ = null;
                        this.eq9recycle_.push([mo,vi]);
                    }
                }
            }
            this.eq9bullet_ = bullet;
        }
        if ((this.cooltime9_ > 0) || (this.eq9bullet_.length > this.eq9nbullet_)) {
            this.cooltime9_ = this.cooltime9_-1;
            return;
        }
// console.log("fireEq9");
        // 発射
        this.cooltime9_ = this.cooltime9max_;
        let vposi = this.moVehicle_.chassisBody.position;
        let vquat = this.moVehicle_.chassisBody.quaternion;
        let vv = vquat.vmult(new CANNON.Vec3(-3.2, 0, 0));  // 前方、高さ、左右
        let adjx = Math.random()/4-0.25;
        let adjy = Math.random()/2; // 0.5;
        let adjz = Math.random()/4-0.25;
        let life = 400;
        let appImp = 400;
        if (this.eq9recycle_.length > 0) {
        // if (0) {
            let [mo9, vi9] = this.eq9recycle_.pop();
            mo9.life_ = life;
            mo9.position = new CANNON.Vec3(vposi.x+vv.x+adjx, vposi.y+vv.y+adjy, vposi.z+vv.z+adjz);
            vi9.position.copy(mo9.position);
            mo9.velocity = new CANNON.Vec3(0, 0, 0);
            mo9.angularVelocity = new CANNON.Vec3(0, 0, 0);
            mo9.applyImpulse(vv.scale(appImp));
            let trg = this.choiceBlock();
            mo9.trg_ = trg;
            this.eq9bullet_.push([mo9, vi9]);
        } else {
            let radius = 0.1;
            let mo9 = new CANNON.Body({mass: 15,
                                       shape: new CANNON.Sphere(radius),
                                       position: new CANNON.Vec3(vposi.x+vv.x+adjx, vposi.y+vv.y+adjy, vposi.z+vv.z+adjz),
                                       material: this.moWheelMtr_,
                                      });
            mo9.life_ = life;
            let vi9 = new THREE.Mesh(new THREE.SphereGeometry(radius),
                                     new THREE.MeshBasicMaterial({color:0xffffff}));
            this.world_.addBody(mo9)
            this.scene_.add(vi9);
            this.world_.addEventListener('postStep', () => {
                vi9.position.copy(mo9.position);
                // vi9.quaternion.copy(mo9.quaternion);
            })
            mo9.applyImpulse(vv.scale(appImp));
            let trg = this.choiceBlock();
            mo9.trg_ = trg;
            this.eq9bullet_.push([mo9, vi9]);
        }
    }


    addEq10() {
        // メテオストライク
        //  上部に球を設置
        let radius = 1;
        let sxx = 3, syy = 0.1, szz = 0.1;
        let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
        let pxx = -sxx_, pyy = 0.5, pzz = 0;
        this.moEq10_ = new CANNON.Sphere(radius);
        this.moChassisBody_.addShape(this.moEq10_,
                                     new CANNON.Vec3(pxx, pyy, pzz));
        const viEq10Geo = new THREE.SphereGeometry(radius);
        const viEq10Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        this.viEq10Mesh_ = new THREE.Mesh(viEq10Geo, viEq10Mtr);
        this.viEq10Mesh_.position.copy(new THREE.Vector3(pxx, pyy, pzz));
        // this.viEq10Mesh_.quaternion.copy(quat);
        this.viChassisBody_.add(this.viEq10Mesh_);

        this.cooltime10_ = 0;
        this.eq10nbullet_ = 1;  // 弾数
        this.cooltime10max_ = 2000; // 発射の間隔
    }

    fireEq10() {
        if (this.eq10bullet_.length > 0) {
            let bullet = [];
            for (let [mo,vi] of this.eq10bullet_) {
                mo.life_ = mo.life_-1;
                if (mo.life_ > 0) {
                    bullet.push([mo,vi]);
                    // 進行方向を修正
                    let trgp = mo.trg_.position;
                    let vsub = trgp.vsub(mo.position);
                    vsub.normalize();
                    mo.applyImpulse(vsub);
                } else {
                    // if (mo.trg_ != null) {
                    {
                        let trg = mo.trg_;
                        // delete this.eq10selected_[trg.idx];
                        mo.trg_ = null;
                        this.eq10recycle_.push([mo,vi]);
                    }
                }
            }
            this.eq10bullet_ = bullet;
        }
        if ((this.cooltime10_ > 0) || (this.eq10bullet_.length > this.eq10nbullet_)) {
            this.cooltime10_ = this.cooltime10_-1;
            return;
        }
// console.log("fireEq10");
        // 発射
        this.cooltime10_ = this.cooltime10max_;
        let vposi = this.moVehicle_.chassisBody.position;
        let vquat = this.moVehicle_.chassisBody.quaternion;
        let vv = vquat.vmult(new CANNON.Vec3(-150, 0, 0));  // 前方、高さ、左右
        let adjx = 0, adjy = 300, adjz = 0;
        let life = 4000;
        // let appImp = 4000;
        let radius = 200, mass = 1000000; // 隕石の半径、質量
        this.moEq10Mtr_ = new CANNON.Material('eq10');
        if (this.eq10recycle_.length > 0) {
        // if (0) {
            let [mo10, vi10] = this.eq10recycle_.pop();
            mo10.life_ = life;
            mo10.position = new CANNON.Vec3(vposi.x+vv.x+adjx, vposi.y+vv.y+adjy, vposi.z+vv.z+adjz),
            vi10.position.copy(mo10.position);
            mo10.velocity = new CANNON.Vec3(0, 0, 0);
            mo10.angularVelocity = new CANNON.Vec3(0, 0, 0);
            // mo10.applyImpulse(vv.scale(appImp));
            let trg = this.choiceBlock();
            mo10.trg_ = trg;
            let pp = trg.position;
            mo10.position = new CANNON.Vec3(pp.x+adjx, pp.y+adjy, pp.z+adjz);
            this.eq10bullet_.push([mo10, vi10]);
        } else {
            let mo10 = new CANNON.Body({mass: mass,
                                        shape: new CANNON.Sphere(radius),
                                        position: new CANNON.Vec3(vposi.x+vv.x+adjx, vposi.y+vv.y+adjy, vposi.z+vv.z+adjz),
                                        material: this.moEq10Mtr_, // this.moWheelMtr_,
                                        linearDamping: 0.5, // (def) 0.01, 迫力を演出するためにゆっくり落とす
                                      });
            mo10.life_ = life;
            let vi10 = new THREE.Mesh(new THREE.SphereGeometry(radius),
                                     new THREE.MeshBasicMaterial({color:0xffffff}));
            this.world_.addBody(mo10)
            this.scene_.add(vi10);
            this.world_.addEventListener('postStep', () => {
                vi10.position.copy(mo10.position);
                vi10.quaternion.copy(mo10.quaternion);
            })
            // mo10.applyImpulse(vv.scale(appImp));
            let trg = this.choiceBlock();
            mo10.trg_ = trg;
            let pp = trg.position;
            mo10.position = new CANNON.Vec3(pp.x+adjx, pp.y+adjy, pp.z+adjz);
            this.eq10bullet_.push([mo10, vi10]);
            const ground_eq10 = new CANNON.ContactMaterial(this.moGroundMtr_, this.moEq10Mtr_, {
                friction: 0.3,    // 摩擦係数(def=0.3)
                restitution: 0.3, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e-1,  // 剛性(def=1e7)
            })
            this.world_.addContactMaterial(ground_eq10);
            const mass0_eq10 = new CANNON.ContactMaterial(this.moBlockMass0Mtr_, this.moEq10Mtr_, {
                friction: 0.3,    // 摩擦係数(def=0.3)
                restitution: 0.3, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e-3,  // 剛性(def=1e7)
            })
            this.world_.addContactMaterial(mass0_eq10);
        }
    }



    addEq11() {
        // 半分潜航の螺旋キューブ（追尾）を全方位に射出
        //  筒のみを設置
        let sxx = 3, syy = 0.1, szz = 3;
        let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
        let pxx = 0, pyy = 0.5, pzz = 0;
        this.moEq11_ = new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_));
        this.moChassisBody_.addShape(this.moEq11_,
                                     new CANNON.Vec3(pxx, pyy, pzz));
        const viEq11Geo = new THREE.BoxGeometry(sxx, syy, szz);
        const viEq11Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        this.viEq11Mesh_ = new THREE.Mesh(viEq11Geo, viEq11Mtr);
        this.viEq11Mesh_.position.copy(new THREE.Vector3(pxx, pyy, pzz));
        this.viChassisBody_.add(this.viEq11Mesh_);
        this.cooltime11_ = 0;
        this.eq11nbullet_ = 100;  // 弾数
        this.cooltime11max_ = 10;  // 発射の間隔
        this.moEq11Mtr_ = new CANNON.Material('eq11');
        const ground_eq11 = new CANNON.ContactMaterial(this.moGroundMtr_, this.moEq11Mtr_, {
            friction: 0.001,    // 摩擦係数(def=0.3)
            restitution: 0.3, // 反発係数 (def=0.3)
            contactEquationStiffness: 1e2,  // 剛性(def=1e7)
        })
        this.world_.addContactMaterial(ground_eq11);
    }


    fireEq11() {
        const vUpF = new CANNON.Vec3(0, 2.5, 0); // 重力を打ち消す感じの力
        if (this.eq11bullet_.length > 0) {
            let bullet = [];
            for (let [mo,vi] of this.eq11bullet_) {
                mo.life_ = mo.life_-1;
                if (mo.life_ > 0) {
                    bullet.push([mo,vi]);
                    // 進行方向を修正
                    let trgp = mo.trg_.position;
                    let vsub = trgp.vsub(mo.position);
                    let trgv = mo.trg_.velocity;
                    vsub = vsub.vadd(trgv.scale(5));  // 速度を加えて、移動先を先読みする
                    vsub.normalize();
                    mo.applyImpulse(vsub.scale(20));
                    mo.applyImpulse(vUpF);
                } else {
                    {
                        // let trg = mo.trg_;
                        mo.trg_ = null;
                        this.eq11recycle_.push([mo,vi]);
                    }
                }
            }
            this.eq11bullet_ = bullet;
        }
        if ((this.cooltime11_ > 0) || (this.eq11bullet_.length > this.eq11nbullet_)) {
            this.cooltime11_ = this.cooltime11_-1;
            return;
        }
        // 発射
        this.cooltime11_ = this.cooltime11max_;
        let vposi = this.moVehicle_.chassisBody.position;
        let vquat = this.moVehicle_.chassisBody.quaternion;
        let vv = vquat.vmult(new CANNON.Vec3(-3.2, 0, 0));  // 前方、高さ、左右
        let sx = 1, sy = 1, sz = 1,  mass = 15;
        let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
        let adjx = Math.random()/4-0.25;
        let adjy = Math.random()/2; // 0.5;
        let adjz = Math.random()/4-0.25;
        let life = 400;
        let appImp = 400;
        if (this.eq11recycle_.length > 0) {
            let [mo11, vi11] = this.eq11recycle_.pop();
            mo11.life_ = life;
            mo11.position = new CANNON.Vec3(vposi.x+vv.x+adjx, vposi.y+vv.y+adjy, vposi.z+vv.z+adjz);
            vi11.position.copy(mo11.position);
            mo11.velocity = new CANNON.Vec3(0, 0, 0);
            let trg = this.choiceBlock();
            mo11.trg_ = trg;
            let vsub = mo11.trg_.position.vsub(mo11.position);
            vsub.normalize();
            mo11.applyImpulse(vsub.scale(appImp));
            this.eq11bullet_.push([mo11, vi11]);
        } else {
            let mo11 = new CANNON.Body({mass: mass,
                                        shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                        position: new CANNON.Vec3(vposi.x+vv.x+adjx, vposi.y+vv.y+adjy, vposi.z+vv.z+adjz),
                                        material: this.moEq11Mtr_,
                                        angularVelocity: new CANNON.Vec3(Math.random()*100, Math.random()*100, Math.random()*100),
                                       });
            mo11.life_ = life;
            let vi11 = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz),
                                      new THREE.MeshBasicMaterial({color:0xffffff, wireframe:true}));
            this.world_.addBody(mo11)
            this.scene_.add(vi11);
            this.world_.addEventListener('postStep', () => {
                vi11.position.copy(mo11.position);
                vi11.quaternion.copy(mo11.quaternion);
            })
            let trg = this.choiceBlock();
            mo11.trg_ = trg;
            let vsub = mo11.trg_.position.vsub(mo11.position);
            vsub.normalize();
            mo11.applyImpulse(vsub.scale(appImp));
            this.eq11bullet_.push([mo11, vi11]);
        }
    }


    addEq12() {
        // 竜巻／粒子を上方に射出
        //  筒のみを設置
        let radiusTop = 2, radiusBottom = 2, height = 0.5, numSegment = 16;
        let pxx = 0, pyy = 0.5, pzz = 0;
        this.moEq12_ = new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegment);
        this.moChassisBody_.addShape(this.moEq12_,
                                     new CANNON.Vec3(pxx, pyy, pzz));
        const viEq12Geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment);
        const viEq12Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        this.viEq12Mesh_ = new THREE.Mesh(viEq12Geo, viEq12Mtr);
        this.viEq12Mesh_.position.copy(new THREE.Vector3(pxx, pyy, pzz));
        this.viChassisBody_.add(this.viEq12Mesh_);
        this.cooltime12_ = 0;
        this.eq12nbullet_ = 1000;  // 弾数
        this.cooltime12max_ = 1; // 発射の間隔
    }

    fireEq12() {
        if (this.eq12bullet_.length > 0) {
            let bullet = [];
            for (let [mo,vi] of this.eq12bullet_) {
                mo.life_ = mo.life_-1;
                if (mo.life_ > 0) {
                    bullet.push([mo,vi]);
                    // 進行方向を修正
                    let trgp = mo.trg_.position;
                    let vsub = trgp.vsub(mo.position);
                    vsub.normalize();
                    mo.applyImpulse(vsub.scale(20));
                } else {
                    {
                        let trg = mo.trg_;
                        mo.trg_ = null;
                        this.eq12recycle_.push([mo,vi]);
                    }
                }
            }
            this.eq12bullet_ = bullet;
        }
        if ((this.cooltime12_ > 0) || (this.eq12bullet_.length > this.eq12nbullet_)) {
            this.cooltime12_ = this.cooltime12_-1;
            return;
        }
        // 発射
        this.cooltime12_ = this.cooltime12max_;
        let vposi = this.moVehicle_.chassisBody.position;
        let vquat = this.moVehicle_.chassisBody.quaternion;
        let vv = vquat.vmult(new CANNON.Vec3(-30, 0, 0));  // 前方、高さ、左右
        vv.set(vposi.x+vv.x, vposi.y+vv.y, vposi.z+vv.z);
        let vv2 = new CANNON.Vec3(vv.x, vv.y+10, vv.z);
        let range = 30, range_ = range/2;
        let life = 20;
        let appImp = 1000;

        for (let ii = 0; ii < 100; ++ii) {
            let r1 = Math.random()*range - range_, r3 = Math.random()*range - range_;
            let pp = new CANNON.Vec3(vv.x+r1, vv.y-1, vv.z+r3);
            let vdir = vv2.vsub(pp);
            vdir.normalize();
            let radius = 0.1,  mass = 15;
            if (this.eq12recycle_.length > 0) {
                let [mo12, vi12] = this.eq12recycle_.pop();
                mo12.life_ = life;
                mo12.position = pp;
                vi12.position.copy(mo12.position);
                mo12.velocity = new CANNON.Vec3(0, 0, 0);
                mo12.angularVelocity = new CANNON.Vec3(0, 0, 0);
                mo12.applyImpulse(vdir.scale(appImp));
                let trg = this.choiceBlock();
                mo12.trg_ = trg;
                this.eq12bullet_.push([mo12, vi12]);
            } else {
                let mo12 = new CANNON.Body({mass: mass,
                                            shape: new CANNON.Sphere(radius),
                                            position: pp,
                                            material: this.moWheelMtr_,
                                           });
                mo12.life_ = life;
                let vi12 = new THREE.Mesh(new THREE.SphereGeometry(radius),
                                          new THREE.MeshBasicMaterial({color:0xffffff}));
                this.world_.addBody(mo12)
                this.scene_.add(vi12);
                this.world_.addEventListener('postStep', () => {
                    vi12.position.copy(mo12.position);
                    // vi12.quaternion.copy(mo12.quaternion);
                })
                mo12.applyImpulse(vdir.scale(appImp));
                let trg = this.choiceBlock();
                mo12.trg_ = trg;
                this.eq12bullet_.push([mo12, vi12]);
            }
        }
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

    keydown_jump() {
        // フロントを持ち上げて、
        let quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -0.05);
        let vquat = this.moVehicle_.chassisBody.quaternion;
        vquat = vquat.mult(quat);
        this.moVehicle_.chassisBody.quaternion.copy(vquat);

        // 上方へ力を加える（スピードに比例させると飛びすぎなのでsqrt & 車重で倍増しておく）
        let spd = Math.abs(this.moVehicle_.currentVehicleSpeedKmHour);
        spd = Math.min(10, Math.sqrt(spd));
        let vv = new CANNON.Vec3(0, spd, 0);
        this.moVehicle_.chassisBody.applyImpulse(vv.scale(this.mass_));
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
        if (this.ieq_ == 8){
            this.fireEq8();
        } else if (this.ieq_ == 9){
            this.fireEq9();
        } else if (this.ieq_ == 10){
            this.fireEq10();
        } else if (this.ieq_ == 11){
            this.fireEq11();
        } else if (this.ieq_ == 12){
            this.fireEq12();
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

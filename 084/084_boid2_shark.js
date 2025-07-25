// Babylon.js で物理演算(havok)：魚群(boid)と海上移動のキャラクターコントローラー(2)
//
// キャラクターコントローラー
//  - カーソル上下/(w,s) .. 前進/後進
//  - カーソル右左/(a,d) .. 方向転換
//  - enter   .. 海上／浮力モード
//  - space   .. ジャンプ(ジャンプ時の移動は、地上の3倍)
//  - ctrl    .. 上昇
//  - r       .. スタート位置に戻る
//  - f       .. 霧モード（海っぽく視界不良に）
//  - c       .. カメラの視点切り替え
//  - h       .. 使い方表示

// local
// const skybox_path= "textures/TropicalSunnyDay";
// const water_bump_path = "textures/waterbump.png"
// const glb_url = "./assets/";
// const glb_fname = "shark.glb";

// local
const skybox_path= "../069/textures/TropicalSunnyDay";
const water_bump_path = "../068/textures/waterbump.png";
const glb_url = "https://assets.babylonjs.com/meshes/";
const glb_fname = "shark.glb";

// playGround
// const skybox_path= "textures/TropicalSunnyDay";
// const water_bump_path = "textures/waterbump.png"
// const glb_url = "https://assets.babylonjs.com/meshes/";
// const glb_fname = "shark.glb";

// const R5 = Math.PI/36;
const R5 = Math.PI/36;
const R10 = Math.PI/18;
const R15 = Math.PI/12;
const R30 = Math.PI/6;
const R45 = Math.PI/4;
const R90 = Math.PI/2;
const R180 = Math.PI;

const C5 = Math.cos(R5);
const C10 = Math.cos(R10);
const C15 = Math.cos(R15);
const C30 = Math.cos(R30);
const C45 = Math.cos(R45);
const C90 = Math.cos(R90);

let nb = new BABYLON.NoiseBlock();

class Boid {
    constructor(meshList, opt={}) {
        this.meshList = meshList;
        let n = meshList.length;
        // 対象範囲の距離
        this.rule1Distance = typeof(opt.rule1Distance) !== 'undefined' ? opt.rule1Distance : 200;
        this.rule2Distance = typeof(opt.rule2Distance) !== 'undefined' ? opt.rule2Distance : 1;
        this.rule3Distance = typeof(opt.rule3Distance) !== 'undefined' ? opt.rule3Distance : 2;

        this.rule1Distance2 = this.rule1Distance**2;
        this.rule2Distance2 = this.rule2Distance**2;
        this.rule3Distance2 = this.rule3Distance**2;
        this.rule31Distance2 = (this.rule3Distance2+this.rule1Distance2)/2;

        // 自身への反映割合
        this.rule1Scale = typeof(opt.rule1Scale) !== 'undefined' ? opt.rule1Scale : 2;
        this.rule2Scale = typeof(opt.rule2Scale) !== 'undefined' ? opt.rule2Scale : 1;
        this.rule3Scale = typeof(opt.rule3Scale) !== 'undefined' ? opt.rule3Scale : 1;
    }

    setMesh(meshList){
        this.meshList = meshList;
        let n = meshList.length;
    }

    updateOne(id) {
        {
            let alignment = new BABYLON.Vector3.Zero();
            let cohesion = new BABYLON.Vector3.Zero();
            let separation = new BABYLON.Vector3.Zero();
            let massCnt = 0, velCnt = 0;
            let mesh = this.meshList[id];
            for (let i = 0; i < this.meshList.length; ++i) {
                if (i == id) {
                    continue;
                }
                let other = this.meshList[i];
                let other_velocity = other.physicsBody.getLinearVelocity();
                let d2 = BABYLON.Vector3.DistanceSquared(mesh.position, other.position);
                if (d2 < this.rule1Distance2) {  // 集合・あつまる
                    cohesion.addInPlace(other.position);
                    ++massCnt;
                    if (other._actMode == 'boid_boss') {
                        // let rate = Math.ceil(this.meshList.length/2);
                        let rate = this.meshList.length;
                        cohesion.addInPlace(other.position.scale(rate));
                        massCnt += rate;
                    }
                }
                // ここは cohesion で代用
                // if (d2 < this.rule2Distance2) {  // 離れる・近つきすぎない
                //     let diff = other.position.subtract(me.position);
                //     separation.subtractInPlace(diff);
                // }
                if (d2 < this.rule3Distance2) {  // 整列・同一方向
                    alignment.addInPlace(other_velocity);
                    ++velCnt;
                    if (other._actMode == 'boid_boss') {
                        // let rate = Math.ceil(this.meshList.length/2);
                        let rate = this.meshList.length;
                        alignment.addInPlace(other_velocity.scale(rate));
                        velCnt += rate;
                    }
                }
            }
            // 上記の累積を正規化
            if (massCnt > 0) {
                // cohesion.divideInPlace(massCnt);  // 群れの重心
                cohesion.scaleInPlace(1/massCnt);  // 群れの重心
            }
            if (velCnt > 0) {
                // alignment.divideInPlace(velCnt);  // 群れの向き
                alignment.scaleInPlace(1/velCnt);  // 群れの向き
            }

            // 集合の重心cohesion との距離2
            let d2 = BABYLON.Vector3.DistanceSquared(mesh.position, cohesion);
            if (d2 > this.rule1Distance2) {
                // 遠過ぎる場合は無視
                let v = (nb.noise(8, 0.5, mesh.position, BABYLON.Vector3.Zero(), 1) -0.5)*10;
                // v /= 10;
                let quatRot = new BABYLON.Vector3(0, v, 0);
                mesh._agg.body.applyAngularImpulse(quatRot);

            } else if (d2 > this.rule3Distance2) {
                // 遠いなら近づくように .. 旋回と加速
                // 重心へのベクトル
                let vtrg = cohesion.subtract(mesh.position).normalize();
                // 進行方向のベクトル
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(mesh.rotationQuaternion);
                // ２つのベクトルの外積、Y軸の正負で目的地の左右を判断
                let vcross = vdir.cross(vtrg);
                // ２つのベクトルの角度の余弦値
                let vcos = vdir.dot(vtrg);
                if (vcos < C5) {
                    let v = mesh.angImp * this.rule1Scale * BABYLON.Scalar.RandomRange(0.6, 1);
                    if (vcross.y > 0) {
                        let quatRot = new BABYLON.Vector3(0, v, 0);
                        mesh._agg.body.applyAngularImpulse(quatRot);
                    } else {
                        let quatRot = new BABYLON.Vector3(0, -v, 0);
                        mesh._agg.body.applyAngularImpulse(quatRot);
                    }
                } else {
                    // 進行方向のみに加速する
                    let vs = mesh.linImp * this.rule1Scale * (d2/this.rule31Distance2) * BABYLON.Scalar.RandomRange(0.9, 1.2);
                    mesh._agg.body.applyImpulse(vdir.scale(vs), mesh.absolutePosition);
                }

            } else if (d2 < this.rule2Distance2) {
                // 近すぎるなら、離れるように .. 逆向きの旋回
                // 重心へのベクトル
                let vtrg = cohesion.subtract(mesh.position).normalize();
                // 進行方向のベクトル
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(mesh.rotationQuaternion);
                // ２つのベクトルの外積、Y軸の正負で目的地の左右を判断
                let vcross = vdir.cross(vtrg);
                // ２つのベクトルの角度の余弦値
                let vcos = vdir.dot(vtrg);
                if (vcos < C5) {
                    let v = -mesh.angImp * this.rule2Scale * BABYLON.Scalar.RandomRange(0.6, 1); // ここで逆向きに
                    if (vcross.y > 0) {
                        let quatRot = new BABYLON.Vector3(0, v, 0);
                        mesh._agg.body.applyAngularImpulse(quatRot);
                    } else {
                        let quatRot = new BABYLON.Vector3(0, -v, 0);
                        mesh._agg.body.applyAngularImpulse(quatRot);
                    }
                }
            } else {
                // ほどほどなら向きを保つように  .. 旋回
                let vtrg = alignment; // 群れの向き
                // 進行方向のベクトル
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(mesh.rotationQuaternion);
                // ２つのベクトルの外積、Y軸の正負で目的地の左右を判断
                let vcross = vdir.cross(vtrg);
                // ２つのベクトルの角度の余弦値
                let vcos = vdir.dot(vtrg);
                if (vcos < C5) {
                    let v = mesh.angImp * this.rule3Scale * BABYLON.Scalar.RandomRange(0.7, 1);;
                    if (vcross.y > 0) {
                        let quatRot = new BABYLON.Vector3(0, v, 0);
                        mesh._agg.body.applyAngularImpulse(quatRot);
                    } else {
                        let quatRot = new BABYLON.Vector3(0, -v, 0);
                        mesh._agg.body.applyAngularImpulse(quatRot);
                    }
                }
            }
        }
    }

    update() {
        if (this.meshList.length == 0) {
            return;
        }
        for (let i = 0; i < this.meshList.length; ++i) {
            this.updateOne(i);
        }
    }
};

// 敵（mesh, agg）の移動に関するマネージャ
class MeshAggManager {
    constructor(scene) {
        this.scene = scene;
        this.meshAggList = [];
        this.iupdate = 1;
        this.actModeDef = 'boid';
        this.boid = new Boid([]);
    }

    init(opt) {
        this.range = typeof(opt.range) !== 'undefined' ? opt.range : 1;  // 生成位置の範囲
        this.range2 = this.range*2;
        this.rangeX = typeof(opt.rangeX) !== 'undefined' ? opt.rangeX : [-this.range,this.range];
        this.rangeX2 = this.rangeX[1] - this.rangeX[0];
        this.rangeY = typeof(opt.rangeY) !== 'undefined' ? opt.rangeY : [-this.range,this.range];
        this.rangeY2 = this.rangeY[1] - this.rangeY[0];
        this.rangeZ = typeof(opt.rangeZ) !== 'undefined' ? opt.rangeZ : [-this.range,this.range];
        this.rangeZ2 = this.rangeZ[1] - this.rangeZ[0];
        this.meshAggList = [];
    }

    setBoid() {
        // boid 設定された mesh を対象に
        let meshlist = [];
        for (let [mesh,agg] of this.meshAggList) {
            if (mesh._actMode == 'boid' || 
                mesh._actMode == 'boid_boss') {
                meshlist.push(mesh);
            }
        }
        this.boid.setMesh(meshlist);
    }

    createMeshAgg(n, opt) {
        this.init(opt);

        for (let i = 0; i < n; ++i) {
            let mesh = BABYLON.MeshBuilder.CreateBox("cube", { size: 1 }, this.scene);
            let px = BABYLON.Scalar.RandomRange(this.rangeX[0], this.rangeX[1]);
            let py = BABYLON.Scalar.RandomRange(this.rangeY[0], this.rangeY[1]);
            let pz = BABYLON.Scalar.RandomRange(this.rangeZ[0], this.rangeZ[1]);
            mesh.position.set(px, py, pz);
            var agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 10, restitution:0.01}, this.scene);
            mesh._agg = agg;

            // // agg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
            agg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);

            agg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
            // // agg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION); 

            mesh.physicsBody.setGravityFactor(0);   // 重力の効果
            // mesh.physicsBody.setLinearDamping(0.5); // 摩擦
            // mesh.physicsBody.setAngularDamping(0.5); // 摩擦

            // let vx = BABYLON.Scalar.RandomRange(-1, 1);
            let vz = BABYLON.Scalar.RandomRange(0, 1);
            mesh.physicsBody.setLinearVelocity(BABYLON.Vector3.Forward().scale(vz));
            mesh._targetPosi = null;
            mesh._actMode = this.actModeDef;
            // mesh._actMode = 'rand';
            // // mesh._actMode = 'none';
            {
                let localAxes = new BABYLON.AxesViewer(this.scene, 1);
                localAxes.xAxis.parent = mesh; localAxes.yAxis.parent = mesh; localAxes.zAxis.parent = mesh;
            }
            this.meshAggList.push([mesh, agg]);

            if (i < 3) {
                if (i == 0) {
                    mesh.material = new BABYLON.StandardMaterial('mat', this.scene);
                    mesh.material.diffuseColor = BABYLON.Color3.Red();
                } else if (i == 1) {
                    mesh.material = new BABYLON.StandardMaterial('mat', this.scene);
                    mesh.material.diffuseColor = BABYLON.Color3.Green();
                } else if (i == 2) {
                    mesh.material = new BABYLON.StandardMaterial('mat', this.scene);
                    mesh.material.diffuseColor = BABYLON.Color3.Blue();
                }
            }
        }
    }

    addMeshAgg(mesh_, opt={}) {
        let actMode = typeof(opt.actMode) !== 'undefined' ? opt.actMode : this.actModeDef;
        let diaX = typeof(opt.diaX) !== 'undefined' ? opt.diaX : 0.5;
        let diaY = typeof(opt.diaY) !== 'undefined' ? opt.diaY : 1;
        let diaZ = typeof(opt.diaZ) !== 'undefined' ? opt.diaZ : 1;
        let mass = typeof(opt.mass) !== 'undefined' ? opt.mass : 10;
        let linDam = typeof(opt.linDam) !== 'undefined' ? opt.linDam : 0.5;
        let angDam = typeof(opt.angDam) !== 'undefined' ? opt.angDam : 0.5;
        let linImp = typeof(opt.linImp) !== 'undefined' ? opt.linImp : 1;
        let angImp = typeof(opt.angImp) !== 'undefined' ? opt.angImp : 0.8;
        let px = BABYLON.Scalar.RandomRange(this.rangeX[0], this.rangeX[1]);
        let py = BABYLON.Scalar.RandomRange(this.rangeY[0], this.rangeY[1]);
        let pz = BABYLON.Scalar.RandomRange(this.rangeZ[0], this.rangeZ[1]);
        pz = BABYLON.Scalar.RandomRange(this.rangeZ[1]/2, this.rangeZ[1]);
        // TransformNode を root にして、メッシュを登録しなおす
        let mesh = BABYLON.MeshBuilder.CreateSphere("root", { diameterX: diaX, diameterY: diaY, diameterZ: diaZ, segments: 8 }, this.scene);
        mesh.position.set(px, py, pz);
        if(mesh_ != null) {
            mesh_.parent = mesh;
        }
        mesh.visibility = 0;
        var agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: mass, restitution:0.01}, this.scene);
        mesh._agg = agg;

        // // agg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
        agg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);

        agg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
        // // agg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION); 

        mesh.physicsBody.setGravityFactor(0);   // 重力の効果
        mesh.physicsBody.setLinearDamping(linDam); // 摩擦
        mesh.physicsBody.setAngularDamping(angDam); // 摩擦
        // mesh.physicsBody.setLinearDamping(0.5); // 摩擦
        // mesh.physicsBody.setAngularDamping(0.5); // 摩擦

        let vz = BABYLON.Scalar.RandomRange(0, 1);
        mesh.physicsBody.setLinearVelocity(BABYLON.Vector3.Forward().scale(vz));
        // // mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, vz));
        mesh._targetPosi = null;
        mesh._actMode = actMode;
        mesh.linDam = linDam;
        mesh.angDam = angDam;
        mesh.linImp = linImp;
        mesh.angImp = angImp;
        if (0) {
            // for debug
            mesh.position.set(0, 0, 0);
            mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
        }
        if (0) {
            let localAxes = new BABYLON.AxesViewer(this.scene, 1);
            localAxes.xAxis.parent = mesh; localAxes.yAxis.parent = mesh; localAxes.zAxis.parent = mesh;
        }
        this.meshAggList.push([mesh, agg]);
    }


    _posiPeriodicBoundary(mesh) {
        // メッシュに周期的境界を施す
        if (mesh.position.x < this.rangeX[0]) {
            mesh.position.x += this.rangeX2;
            return true;
        } else if (mesh.position.x > this.rangeX[1]) {
            mesh.position.x -= this.rangeX2;
            return true;
        }
        if (mesh.position.y < this.rangeY[0]) {
            mesh.position.y += this.rangeY2;
            return true;
        } else if (mesh.position.y > this.rangeY[1]) {
            mesh.position.y -= this.rangeY2;
            return true;
        }
        if (mesh.position.z < this.rangeZ[0]) {
            mesh.position.z += this.rangeZ2;
            return true;
        } else if (mesh.position.z > this.rangeZ[1]) {
            mesh.position.z -= this.rangeZ2;
            return true;
        }
        return false;
    }

    _resetPosture(mesh) {
        // メッシュの姿勢を正す（Y方向が上になるように）
        //   .. 060a_movePosi(姿勢が傾いたら正す補正の箇所)を参考にするもイマイチなので、カチッと戻す。
        //      理想的にはぬるっと、スムーズに戻すことではあるがむずい／面倒
        let quat = mesh.rotationQuaternion;
        let vup = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        let vcosup = vup.dot(BABYLON.Vector3.Up());
        let v = (1-vcosup);
        if (vcosup <0) {
            let quat1 = mesh.rotationQuaternion;
            let eular = mesh.rotationQuaternion.toEulerAngles();
            let quat2 = BABYLON.Quaternion.RotationYawPitchRoll(0, eular.y, R180);
            mesh.rotationQuaternion = quat2;
            mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
            return true;
        } else if (Math.abs(v) > 0.01) {
            let quat1 = mesh.rotationQuaternion;
            let eular = mesh.rotationQuaternion.toEulerAngles();
            let quat2 = BABYLON.Quaternion.RotationYawPitchRoll(0, eular.y, 0);
            mesh.rotationQuaternion = quat2;
            mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
            return true;
        }
        return false;
    }

    update() {
        this.iupdate = this.iupdate ^ 1; // 0と1を交互に

        let i = -1;
        for (let [mesh,agg] of this.meshAggList) {
            ++i;

            if (mesh._actMode == 'trac') {
                // 追跡
            } else if (mesh._actMode == 'boid') {
                // boidアルゴリズムに従う
                // 位置補正／回転も　と　加速を同時に指定できない？ので交互に
                if (this.iupdate) {
                    // 周期的境界
                    if (this._posiPeriodicBoundary(mesh)) {
                        //return;
                        continue;
                    }

                    // 姿勢の補正(Y方向が上になっているか)
                    if (this._resetPosture(mesh)) {
                        continue;
                    }

                    this.boid.updateOne(i);

                } else {
                    // 進行方向のみに加速する / setLinearDamping(0.5) 時
                    let quat = mesh.rotationQuaternion;
                    let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                    agg.body.applyImpulse(vdir.scale(mesh.linImp), mesh.absolutePosition);
                }

            } else if (mesh._actMode == 'rand' ||
                       mesh._actMode == 'boid_boss') {
                // 目的地をランダム
                // 位置補正／回転も　と　加速を同時に指定できない？ので交互に
                if (this.iupdate) {
                    // 周期的境界
                    if (this._posiPeriodicBoundary(mesh)) {
                        continue;
                    }

                    //目的地設定
                    if (mesh._targetPosi != null) {
                        // 目的地への到達を確認する
                        let dist = BABYLON.Vector3.Distance(mesh.position, mesh._targetPosi);
                        const reachGoalR = 3;
                        if (dist < reachGoalR) {
                            mesh._targetPosi = null;
                        }
                        // 一定回数のうちに到達できなければ変更する
                        if (--(mesh._targetPosiCheck) <= 0) {
                            mesh._targetPosi = null;
                        }
                    }
                    if (mesh._targetPosi == null) {
                        // 目的地を再設定
                        let px = BABYLON.Scalar.RandomRange(this.rangeX[0], this.rangeX[1]);
                        let py = BABYLON.Scalar.RandomRange(this.rangeY[0], this.rangeY[1]);
                        let pz = BABYLON.Scalar.RandomRange(this.rangeZ[0], this.rangeZ[1]);
                        // for debug
                        // let px = BABYLON.Scalar.RandomRange(-10, 10);
                        // let py = BABYLON.Scalar.RandomRange(this.rangeY[0], this.rangeY[1]);
                        // let pz = BABYLON.Scalar.RandomRange(-10, 10);
                        mesh._targetPosi = new BABYLON.Vector3(px ,py, pz);
                        mesh._targetPosiCheck = 10000;
                    }

                    // 姿勢の補正(Y方向が上になっているか)
                    if (this._resetPosture(mesh)) {
                        continue;
                    }

                    // 左右の方向の角度調整
                    if (1) {
                        // 目的地へのベクトル
                        let vtrg = mesh._targetPosi.subtract(mesh.position);
                        let vtrgnrm = vtrg.normalize();
                        // 進行方向のベクトル
                        let quat = mesh.rotationQuaternion;
                        let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                        // ２つのベクトルの外積、Y軸の正負で目的地の左右を判断
                        let vcross = vdir.cross(vtrg);
                        // ２つのベクトルの角度の余弦値
                        let vcos = vdir.dot(vtrgnrm);
                        // 舵角方向 に対する角度調整
                        if (vcos < C5) {
                            let v = mesh.angImp;
                            if (vcross.y > 0) {
                                let quatRot = new BABYLON.Vector3(0, v, 0);
                                agg.body.applyAngularImpulse(quatRot);
                            } else {
                                let quatRot = new BABYLON.Vector3(0, -v, 0);
                                agg.body.applyAngularImpulse(quatRot);
                            }
                            continue;
                        }
                    }

                } else {
                    // 進行方向のみに加速する / setLinearDamping(0.5) 時
                    let quat = mesh.rotationQuaternion;
                    let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                    agg.body.applyImpulse(vdir.scale(mesh.linImp), mesh.absolutePosition);
                }

            } else if (mesh._actMode == 'none') {
                // なし（周期的境界のみ）
                this._posiPeriodicBoundary(mesh);
            }
        }
    }
};


var createScene = async function () {
    // await BABYLON.InitializeCSG2Async();

    var scene = new BABYLON.Scene(engine);

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.rotationOffset = 180;
    camera.radius = 10; // 3;
    camera.heightOffset = 2; // 1.1;
    camera.cameraAcceleration = 0.05; // 0.1;
    camera.maxCameraSpeed = 30;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 0;

    var light1 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light1.position = new BABYLON.Vector3(320, 250, 370);
    light1.intensity = 0.47;
    var light2 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light2.position = new BABYLON.Vector3(320, 250, -370);
    light2.intensity = 0.47;
    var light3 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light3.position = new BABYLON.Vector3(-320, 250, 370);
    light3.intensity = 0.47;
    var light4 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light4.position = new BABYLON.Vector3(-320, 250, -370);
    light4.intensity = 0.47;

    let groundLevel = -14; // メガロドン用

    let seaLevel = 3;
    let seaLevel_ = seaLevel-1.5;
    let seaLevel1 = seaLevel-1;
    let seaLevel2 = seaLevel+1;

    let sharkLevel = seaLevel-4;

    let floorSize = 500, floorSize_ = floorSize/2;


    let meshAggManager2 = new MeshAggManager(scene);
    let opt = {range:floorSize/2*0.8,
               rangeY:[groundLevel, seaLevel],
              };
    meshAggManager2.init(opt);

    let meshAggManager3 = new MeshAggManager(scene);
    meshAggManager3.init(opt);

    let meshlist = null;
    let animeGrp = null;
    let instEntList = [];
    if (1) { // サメのglb
    let setColorModel = function(instEnt, c3) {
        {
            let r=0.3,g=0.3,b=1.0;
            instEnt.rootNodes.forEach(root => {
                root.getChildMeshes().forEach(mesh => {
                    if (mesh.material) {
                        // マテリアルをクローン
                        const mtrClone = mesh.material.clone("m_" + mesh.name);
                        // 色を設定（PBRかStandardかによって異なる）
                        if (mtrClone.getClassName() === "PBRMaterial") {
                            mtrClone.albedoColor = c3;
                        } else {
                            mtrClone.diffuseColor = c3;
                        }
                        // マテリアルを適用
                        mesh.material = mtrClone;
                    }
                });
            });
        }
    }
    let loadMeshGLB_cntTask = function(scene, url, fname) {
        var assetsManager = new BABYLON.AssetsManager(scene);
        let instEnt,instEnt2;
        var contTask = assetsManager.addContainerTask("", null, url, fname);
        contTask.onSuccess = function(task) {
            meshlist = task.loadedMeshes;
            animeGrp = task.loadedAnimationGroups;

            let ns = 50, nn = 3, nl = 1;

            if (1) {  // 小さい子ざめ
                for (let i = 0; i < ns; ++i) {
                instEnt = task.loadedContainer.instantiateModelsToScene(name=>name+"_clone", false);
                let scale=0.1;
                let mesh = instEnt.rootNodes[0];
                mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
                mesh.position = new BABYLON.Vector3(0, -0.1, 0);
                mesh.rotation = new BABYLON.Vector3(0, 0, 0);
                instEnt.animationGroups[0].start(loop=true, speedRatio=4); // 泳ぐ
                instEntList.push(instEnt);
                // 青魚っぽく
                {
                    let c3 = new BABYLON.Color3(0.2, 0.3, 1.0);
                    setColorModel(instEnt, c3);
                }
                let opt = {actMode:'boid', diaX:0.3, diaY:0.3, diaZ:1.5, mass:5, linDam:10, angDam:100, linImp:10, angImp:1, };
                meshAggManager2.addMeshAgg(mesh,opt);
                }
                meshAggManager2.meshAggList[0][0]._actMode = 'boid_boss';
            }

            if (1) {  // 通常サイズ
                instEnt = task.loadedContainer.instantiateModelsToScene(name=>name+"_clone", false);
                let scale=1;
                let mesh = instEnt.rootNodes[0];
                mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
                mesh.position = new BABYLON.Vector3(0, -1.7, 0);
                mesh.rotation = new BABYLON.Vector3(0, 0, 0);
                instEnt.animationGroups[0].start(loop=true); // 泳ぐ
                // 赤サメっぽく
                {
                    let c3 = new BABYLON.Color3(1.0, 0.1, 0.1);
                    setColorModel(instEnt, c3);
                }
                instEntList.push(instEnt);
                let opt = {actMode:'boid_boss', diaX:3.2, diaY:2.8, diaZ:15, linDam:10, angDam:100, linImp:26, angImp:20, };
                meshAggManager3.addMeshAgg(mesh, opt);
            }
            if (1) {  // 通常サイズ
                for (let i = 0; i < nn; ++i) {
                instEnt = task.loadedContainer.instantiateModelsToScene(name=>name+"_clone", false);
                let scale=1;
                let mesh = instEnt.rootNodes[0];
                mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
                mesh.position = new BABYLON.Vector3(0, -1.7, 0);
                mesh.rotation = new BABYLON.Vector3(0, 0, 0);
                instEnt.animationGroups[0].start(loop=true); // 泳ぐ
                instEntList.push(instEnt);
                let opt = {actMode:'boid', diaX:3.2, diaY:2.8, diaZ:15, linDam:10, angDam:100, linImp:24, angImp:20, };
                meshAggManager3.addMeshAgg(mesh, opt);
                }
            }


            if (1) {  // メガロドン サイズ
                instEnt = task.loadedContainer.instantiateModelsToScene(name=>name+"_clone", false);
                let scale=5;
                let mesh = instEnt.rootNodes[0];
                mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
                mesh.position = new BABYLON.Vector3(0, -9, 0);
                mesh.rotation = new BABYLON.Vector3(0, 0, 0);
                instEnt.animationGroups[0].start(loop=true, speedRatio=0.2); // 泳ぐ
                instEntList.push(instEnt);
                let opt = {actMode:'rand', diaX:17, diaY:14, diaZ:75, mass:100, linDam:0.5, angDam:0.5, linImp:5, angImp:5, };
                meshAggManager3.addMeshAgg(mesh, opt);
            }
            meshAggManager2.setBoid();
            meshAggManager3.setBoid();
        }
        assetsManager.onFinish = function (task) {
            if (1) {
            // instEnt.animationGroups[0].start(loop=true); // 泳ぐ
            // instEnt.animationGroups[1].start(loop=true); // 円をえがく
            // instEnt.animationGroups[2].start(loop=true); // 嚙みつく
            }
        }
        assetsManager.load();
        return  meshlist;
    }
    let ssmeshlist = loadMeshGLB_cntTask(scene, glb_url, glb_fname);
    }


    if (1) {
    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skybox_path, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    // Water
    var f = new BABYLON.Vector4(0.5,0, 1, 1); // front image = half the whole image along the width 
    var b = new BABYLON.Vector4(0,0, 0.5, 1); // back image = second half along the width 
    var waterMesh = BABYLON.MeshBuilder.CreatePlane("ground", { width: floorSize, height: floorSize, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
    waterMesh.rotation.x = Math.PI/2;
waterMesh.position.y=seaLevel+0.1; // 15.1;
    if (1) {
    let water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(512, 512));
    water.backFaceCulling = true;
    water.bumpTexture = new BABYLON.Texture(water_bump_path, scene);
    water.windForce = -1; // -15;
    water.waveHeight = 0.1; // 0.1;
    water.bumpHeight = 2.0;
    water.windDirection = new BABYLON.Vector2(1, 1);
    water.waterColor = new BABYLON.Color3(0, 0.1, 0.4);
    water.colorBlendFactor = 0.1;
    water.addToRenderList(skybox);
    water.backFaceCulling = true;
    water.alpha = 0.9;
    waterMesh.material = water;
    }
    }


    await BABYLON.InitializeCSG2Async();

    if(1) {
        // 水面
        let grndMesh = BABYLON.MeshBuilder.CreatePlane("ground", { width: floorSize, height: floorSize, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
        grndMesh.rotation.x = Math.PI/2;
        grndMesh.position.y = seaLevel;
        grndMesh.material = new BABYLON.StandardMaterial('seaLevel', scene);
        grndMesh.material.diffuseColor = BABYLON.Color3.Blue();
        grndMesh.material.alpha = 0.1;
    }

    // --------------------------------------------------

    // boidのテスト
    let meshAggManager = new MeshAggManager(scene);
    if (0) {
        let optIni = {range:floorSize/2*0.8,
                      rangeY:[-2-2, -2+3.1],
                     };
        meshAggManager.init(optIni);
        let opt = {actMode:'boid', diaX:0.3, diaY:0.3, diaZ:1.5, mass:5, linDam:10, angDam:100, linImp:10, angImp:1, };
        let n = 50;
        for (let i = 0; i < n; ++i) {
            meshAggManager.addMeshAgg(null, opt);
        }
        meshAggManager.setBoid();

        // 0番目のメッシュを boss に
        meshAggManager.meshAggList[0][0]._actMode = 'boid_boss';
        meshAggManager.meshAggList[0][0].material = new BABYLON.StandardMaterial('mat', scene);
        meshAggManager.meshAggList[0][0].material.diffuseColor = BABYLON.Color3.Red();

        // if(n > 5) {
        // // 5番目のメッシュを boss に
        // meshAggManager.meshAggList[5][0]._actMode = 'boid_boss';
        // meshAggManager.meshAggList[5][0].material = new BABYLON.StandardMaterial('mat', scene);
        // meshAggManager.meshAggList[5][0].material.diffuseColor = BABYLON.Color3.Blue();
        // }
    }

    // デバッグ表示(物理メッシュ／白線表示)
    if (0) {
        physicsViewer = new BABYLON.Debug.PhysicsViewer();
        for (const mesh of scene.rootNodes) {
            if (mesh.physicsBody) {
                const debugMesh = physicsViewer.showBody(mesh.physicsBody);
            }
        }
    }


    // --------------------------------------------------


    // 地面を設定する
    const grndMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: floorSize, height: floorSize }, scene);
    grndMesh.position.y = groundLevel; // 15; // 0;
    grndMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    grndMesh.material.majorUnitFrequency = 10;
    grndMesh.material.minorUnitVisibility  = 0.5;


    // 地面に摩擦係数、反射係数を設定する
    var grndAgg = new BABYLON.PhysicsAggregate(grndMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);


    if (1) { // 簡単に海っぽい影響
    scene._fog = true;
    scene.onBeforeRenderObservable.add(() => {
        if (scene._fog) {
            let py = characterController.getPosition().y;
            if (py >= seaLevel_) {
                scene.fogMode = BABYLON.Scene.FOGMODE_NON;
            } else {
                scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
                scene.fogStart = 2;
                scene.fogEnd  = 300;
                scene.fogDensity = 0.01;
                fogColor = new BABYLON.Color3(0.0, 0.0, 0.0);
            }
        }
    });
    }

    let matMy = new BABYLON.StandardMaterial('mat', scene);
    matMy.diffuseColor = BABYLON.Color3.Blue();


    // --------------------------------------------------
    // Player/Character state
    var state = "IN_AIR_DOWN";
    let bDash = 3;
    var inAirSpeed = 30.0;
    var onGroundSpeed = 10.0;
    var inAirSpeedBase = 30.0;
    var onGroundSpeedBase = 10.0;
    var jumpHeight = 20;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -18, 0);
    let characterRisingON = new BABYLON.Vector3(0, 25.00, 0); // 上昇
    let characterRisingOFF = new BABYLON.Vector3(0, 0, 0);
    let characterRising   = characterRisingOFF;
    let characterHoverON  = new BABYLON.Vector3(0, 17.90, 0); // ホバー（滞空
    let characterHoverOFF = new BABYLON.Vector3(0, 0, 0);
    let characterHover = characterHoverON;
    let characterFloatON2 = new BABYLON.Vector3(0, 25.0, 0); // 浮き
    let characterFloatON  = new BABYLON.Vector3(0, 20.0, 0); // 浮き
    let characterFloatIDLE = new BABYLON.Vector3(0, 10, 0);
    let characterFloatOFF = new BABYLON.Vector3(0, 0, 0);
    let characterFloat = characterHoverOFF;
    let keyAction = {forward:0, back:0, right:0, left:0, float:0, jump:0, rise:0, down:0, resetCooltime:0 };


    // Physics shape for the character
    let myh = 3; // 1.8;
    let myr = 0.6;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: myh, radius: myr}, scene);
    displayCapsule.material = matMy;
    let characterPosition = new BABYLON.Vector3(0, seaLevel+10, -4);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: myh, capsuleRadius: myr}, scene);

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 2);
    localAxes.xAxis.parent = displayCapsule; localAxes.yAxis.parent = displayCapsule; localAxes.zAxis.parent = displayCapsule;

    camera.lockedTarget = displayCapsule;

    var getNextState = function(supportInfo) {
        if (keyAction.float) {
            // 海上モード
            if (characterController.getPosition().y < seaLevel1) {
                characterFloat = characterFloatON2;
            } else if (characterController.getPosition().y < seaLevel) {
                if (characterController.getVelocity().y < 0) {
                    characterFloat = characterFloatON;
                } else {
                    characterFloat = characterFloatIDLE;
                }
            } else if (characterController.getPosition().y < seaLevel2) {
                characterFloat = characterFloatIDLE;
            } else {
                characterFloat = characterFloatOFF;
            }
        } else {
            characterFloat = characterFloatOFF;
        }
        if (state == "IN_AIR_UP") {
            if (characterController.getVelocity().y > 0) {
                if (keyAction.rise) {
                    characterRising = characterRisingON;
                    characterHover = characterHoverON;
                } else {
                    characterRising = characterRisingOFF;
                }
                return "IN_AIR_UP";
            }
            characterHover = characterHoverON;
            return "IN_AIR_DOWN";
        } else if (state == "IN_AIR_DOWN") {
            if (characterController.getVelocity().y > 0) {
                if (keyAction.rise) {
                    characterRising = characterRisingON;
                    characterHover = characterRisingON;
                } else {
                    characterRising = characterRisingOFF;
                    characterHover = characterRisingOFF;
                }
                return "IN_AIR_UP";
            }
            if (keyAction.rise) {
                characterHover = characterRisingON;
            } else if (keyAction.down) {
                characterHover = characterHoverOFF;
            } else {
                characterHover = characterHoverON;
            }
            if (supportInfo.supportedState == BABYLON.CharacterSupportedState.SUPPORTED) {
                return "ON_GROUND";
            }
            return "IN_AIR_DOWN";
        } else if (state == "ON_GROUND") {
            if (supportInfo.supportedState != BABYLON.CharacterSupportedState.SUPPORTED) {
                return "IN_AIR_DOWN";
            }
            if (keyAction.jump) {
                return "START_JUMP";
            }
            return "ON_GROUND";
        } else if (state == "START_JUMP") {
            return "IN_AIR_UP";
        }
    }

    var getDesiredVelocity = function(deltaTime, supportInfo, characterOrientation_, currentVelocity) {
        let nextState = getNextState(supportInfo);
        if (nextState != state) {
            state = nextState;
        }
        let upWorld = characterGravity.normalizeToNew();
        upWorld.scaleInPlace(-1.0);
        let forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation_);
        if (state == "IN_AIR_UP") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            outputVelocity.addInPlace(characterRising.scale(deltaTime)); // ゆっくり上昇？
            outputVelocity.addInPlace(characterFloat.scale(deltaTime));
            return outputVelocity;
        } else if (state == "IN_AIR_DOWN") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            outputVelocity.addInPlace(characterHover.scale(deltaTime)); // 降下をゆっくりにする上向きのベクトル
            outputVelocity.addInPlace(characterFloat.scale(deltaTime));
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
            outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
            let inv1k = 1e-3;
            if (outputVelocity.dot(upWorld) > inv1k) {
                let velLen = outputVelocity.length();
                outputVelocity.normalizeFromLength(velLen);
                let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);
                let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
                outputVelocity = c.cross(upWorld);
                outputVelocity.scaleInPlace(horizLen);
            }
            outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
            // outputVelocity.addInPlace(characterFloat.scale(deltaTime));
            return outputVelocity;
        } else if (state == "START_JUMP") {
            let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
            // // let u = Math.sqrt(2 * characterJumpF.length() * jumpHeight);
            let curRelVel = currentVelocity.dot(upWorld);
            return currentVelocity.add(upWorld.scale(u - curRelVel));
        }
        return Vector3.Zero();
    }

    // Display tick update: compute new camera position/target, update the capsule for the character display
    scene.onBeforeRenderObservable.add((scene) => {
        displayCapsule.position.copyFrom(characterController.getPosition());
    });

    // After physics update, compute and set new velocity, update the character controller state
    scene.onAfterPhysicsObservable.add((_) => {
        if (scene.deltaTime == undefined) return;
        let dt = scene.deltaTime / 1000.0;
        if (dt == 0) return;
        let down = new BABYLON.Vector3(0, -1, 0);
        let support = characterController.checkSupport(dt, down);
        if (keyAction.right) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), 0.02);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0.02, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        } else if (keyAction.left) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), -0.02);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, -0.02, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        }
        let desiredLinearVelocity = getDesiredVelocity(dt, support, characterOrientation, characterController.getVelocity());
        characterController.setVelocity(desiredLinearVelocity);
        characterController.integrate(dt, support, characterGravity);
    });


    var map ={};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"; 
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    scene.registerAfterRender(function() {
        keyAction.rise = 0;
        if (map["ctrl"]) {
            keyAction.rise = 1;
        }
        inputDirection.z = 0;
        keyAction.forward = 0;
        keyAction.back = 0;
        if ((map["ArrowUp"] || map["w"])) {
            inputDirection.z = 1;
            keyAction.forward = 1;
        } else if ((map["ArrowDown"] || map["s"])) {
            if (state === "IN_AIR_DOWN") {  // 空中なら降下
                keyAction.down = 1;
            } else {  // 地上ならバック
                inputDirection.z = -1;
                keyAction.back = 1;
            }
        }
        keyAction.left = 0;
        keyAction.right = 0;
        if ((map["ArrowLeft"] || map["a"])) {
            keyAction.left = 1;
        } else if ((map["ArrowRight"] || map["d"])) {
            keyAction.right = 1;
        }
        keyAction.jump = 0;
        if (map[" "]) {
            keyAction.jump = 1;
        }
        if (keyAction.resetCooltime) {
            --keyAction.resetCooltime;
        } else {
            if (map["c"]) {
                keyAction.resetCooltime = 60;
                icamera = (icamera+1) % 4;
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 10; // 3;
                    camera.heightOffset = 2; // 1.1;
                    camera.cameraAcceleration = 0.05;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 50;
                    camera.heightOffset = 4;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 10;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 2;
                    camera.heightOffset = 100;
                    camera.cameraAcceleration = 0.5;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.3;
                    camera.heightOffset = -0.01;
                    camera.cameraAcceleration = 0.3;
                    camera.maxCameraSpeed = 30;
                }

            } else if (map["Enter"]) {
                keyAction.resetCooltime = 30;
                keyAction.float = !(keyAction.float);

            } else if (map["r"]) {
                keyAction.resetCooltime = 60;
                // キャラクターコントローラーの位置だけリセット
                characterController._position = characterPosition;

            } else if (map["f"]) {
                keyAction.resetCooltime = 30;
                if (scene._fog) {
                    scene.fogMode = BABYLON.Scene.FOGMODE_NON;
                }
                scene._fog = !(scene._fog);

            } else if (map["h"]) {
                keyAction.resetCooltime = 60;
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
        }

        meshAggManager2.update();
        meshAggManager3.update();
    });

    // --------------------------------------------------

    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "170px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n(W,S) or (Arrow UP/DOWN): Forward/Back\n(A,D) or (Arrow Left/Right): turn Left/Right\n(Enter): float\n(Space): jump\n(Ctrl): rise\nC: change Camera\nR: Reset position\nF: Fog effect\nH: show/hide this message";
    text1.color = "white";
    text1.width = "260px";
    text1.fontSize = 12;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    guiLabelRect.isVisible = false;

    return scene;
}

/*
*/


/*

- 魚／群れのうごき

回遊 アルゴリズム 魚 ゲーム

- スイミーを再現したい！ ～群れアルゴリズム Boids～
  https://qiita.com/odanny/items/e0c0a00e13c2b4839cec

- インタラクティブプログラミング - 群れ（boid）を作る  
  https://qiita.com/takashi/items/9d684a6e3742a15e8726


foram: boid

- Boid flocking demo freezes after ~ 30 seconds regardless of the number of boids used
  https://forum.babylonjs.com/t/boid-flocking-demo-freezes-after-30-seconds-regardless-of-the-number-of-boids-used/40110
  - https://playground.babylonjs.com/?webgpu#3URR7V#186


boid?

- https://forum.babylonjs.com/t/swarm-using-reynolds-steering-behaviors/38331/23
  https://playground.babylonjs.com/#VHW8N9#92
  https://playground.babylonjs.com/#VHW8N9#98


海関連のすごいもの
- Ocean node material
   https://forum.babylonjs.com/t/ocean-node-material/13554/32
   https://playground.babylonjs.com/#9B0DNU#36

*/

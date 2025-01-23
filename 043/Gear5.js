// mode:javascript

import * as THREE from "three";
import * as CANNON from "cannon";

let world;
let scene;


// 定数
const PI  = Math.PI;
const PI_ = Math.PI/2;
const PI2 = Math.PI*2;

// ブロックサイズ
const blockSize = 10;
const blockSize_ = blockSize/2;

// ボール半径
const ballR = 1;

// レール型オブジェクトのパラメータ
//   基本、直方系の棒でレールを表現
// レールの幅
const railw = 0.2;
// レールの幅・間隔
const railIntr = 1.5;
const railIntr_ = railIntr/2;
// レールの余白 (=2)
const railPad = (blockSize-railIntr)/2;
const railPad_ = railPad/2;
// レールを45度傾けた場合の..
const blockSizeR45 = blockSize*1.414;
const blockSizeR45_ = blockSizeR45/2;
// レールの幅・間隔
const railIntrR45 = railIntr*1.414;
const railIntrR45_ = railIntrR45/2;
// レールの余白 (=..)
const railPadR45 = (blockSize-railIntrR45)/2;
const railPadR45_ = railPadR45/2;
// ガードレールの高さ
const gardH = railIntr_;

// 凹(concave)オブジェクトのパラメータ
//  -基本、薄い板で三方を囲んで表現
// 凹(concave) 薄い板の厚み
const cont = 0.1;
const cont_ = cont/2;
// 凹(concave) 溝の幅の半分
const conw_ = 1.05 + cont_;
const conw__ = conw_ / 2;  // concave の高さで利用
// 凹(concave) 溝の幅
const conw = conw_ * 2;

// moBallMtr.restitution = 1;  // 反発係数 1:跳ねやすい  /  0:跳ねない
const moBallMtr = new CANNON.Material({name: 'ball', restitution: 0});
const moRailMtr = new CANNON.Material({name: 'rail'});
const moGearMtr = new CANNON.Material({name: 'gear', restitution: 0});

function rnorm() {
  return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
}
export function init0(world_, scene_) {
  world = world_;
  scene = scene_;
}

var act_gear = [];

export function init(world_, scene_, dataInfoList) {
  init0(world_, scene_);

  dataInfoList.forEach(dinfo => {
    let dtype = dinfo[0];
    let x = dinfo[1];
    let y = dinfo[2];
    let z = dinfo[3];
    let rot = (dinfo.length >= 5) ? dinfo[4] : undefined;
    let color = (dinfo.length >= 6) ? dinfo[5] : undefined;
    let rval = {};
    if (dtype == "ball") {
      Ball_00_glb(x, y, z);
    } else if (dtype == "rail_st") {
      Rail_04(x, y, z, rot);

    } else if (dtype == "windmill_h") {
      Windmill_00(x, y, z, rot);
    } else if (dtype == "windmill_v") {
      Windmill_01(x, y, z, rot);
    } else if (dtype == "windmill_h2") {
      Windmill_02(x, y, z, rot, color);
    } else if (dtype == "windmill_v2") {
      Windmill_03(x, y, z, rot);
    } else if (dtype == "windmill_h3") {
      Windmill_04(x, y, z, rot);
    } else if (dtype == "windmill_v3") {
      Windmill_05(x, y, z, rot);

    // } else if (dtype == "gear_h_0") {
    //   gear_h_0(x, y, z, rot);
    // } else if (dtype == "gear_h_1") {
    //   gear_h_1(x, y, z, rot, color);
    // } else if (dtype == "gear_v_0") {
    //   gear_v_0(x, y, z, rot, color);
    // } else if (dtype == "gear_v_1") {
    //   gear_v_1(x, y, z, rot, color);

      // ギア（試作・四角ギア
    } else if (dtype == "gear_type1_h_free") {
      rval = gear_type1_h_free(x, y, z, rot, color);
    } else if (dtype == "gear_type1_h_act") {
      rval = gear_type1_h_act(x, y, z, rot, color);
      act_gear.push(rval);
    } else if (dtype == "gear_type1_v_free") {
      rval = gear_type1_v_free(x, y, z, rot, color);
    } else if (dtype == "gear_type1_v_act") {
      rval = gear_type1_v_act(x, y, z, rot, color);
      act_gear.push(rval);


      // ギア（試作・円形
    } else if (dtype == "gear_type2_h_free") {
      rval = gear_type2_h_free(x, y, z, rot, color);
    } else if (dtype == "gear_type2_h_act") {
      rval = gear_type2_h_act(x, y, z, rot, color);
      act_gear.push(rval);

    } else if (dtype == "gear_type2_v_free") {
      rval = gear_type2_v_free(x, y, z, rot, color);
    } else if (dtype == "gear_type2_v_act") {
      rval = gear_type2_v_act(x, y, z, rot, color);
      act_gear.push(rval);


      // ギア（標準
    } else if (dtype == "gear_type3_h_free") {
      rval = gear_type3_h_free(x, y, z, rot, color);
    } else if (dtype == "gear_type3_h_act") {
      rval = gear_type3_h_act(x, y, z, rot, color);
      act_gear.push(rval);

    } else if (dtype == "gear_type3_h_20_free") {
      rval = gear_type3_h_20_free(x, y, z, rot, color);
    } else if (dtype == "gear_type3_h_20_act") {
      rval = gear_type3_h_20_act(x, y, z, rot, color);
      act_gear.push(rval);

    } else if (dtype == "gear_type3_h_40_free") {
      rval = gear_type3_h_40_free(x, y, z, rot, color);
    } else if (dtype == "gear_type3_h_40_act") {
      rval = gear_type3_h_40_act(x, y, z, rot, color);
      act_gear.push(rval);

    } else if (dtype == "gear_type3_v_free") {
      rval = gear_type3_v_free(x, y, z, rot, color);
    } else if (dtype == "gear_type3_v_act") {
      rval = gear_type3_v_act(x, y, z, rot, color);
      act_gear.push(rval);

      // ギア２枚
    } else if (dtype == "gear_type5_h_free") {
      rval = gear_type5_h_free(x, y, z, rot, color);
    } else if (dtype == "gear_type5_h_act") {
      rval = gear_type5_h_act(x, y, z, rot, color);
      act_gear.push(rval);

    } else if (dtype == "gear_type5_h_r_free") {
      rval = gear_type5_h_r_free(x, y, z, rot, color);
    } else if (dtype == "gear_type5_h_r_act") {
      rval = gear_type5_h_r_act(x, y, z, rot, color);
      act_gear.push(rval);

      // 針つき
    } else if (dtype == "gear_type6_h_free") {
      rval = gear_type6_h_free(x, y, z, rot, color);
    } else if (dtype == "gear_type6_h_act") {
      rval = gear_type6_h_act(x, y, z, rot, color);
      act_gear.push(rval);

    } else if (dtype == "gear_type6_h_20_free") {
      rval = gear_type6_h_20_free(x, y, z, rot, color);
    } else if (dtype == "gear_type6_h_20_act") {
      rval = gear_type6_h_20_act(x, y, z, rot, color);
      act_gear.push(rval);

    } else if (dtype == "gear_type6_h_40_free") {
      rval = gear_type6_h_40_free(x, y, z, rot, color);
    } else if (dtype == "gear_type6_h_40_act") {
      rval = gear_type6_h_40_act(x, y, z, rot, color);
      act_gear.push(rval);

    } else if (dtype == "gear_type6_h_60_free") {
      rval = gear_type6_h_60_free(x, y, z, rot, color);
    } else if (dtype == "gear_type6_h_60_act") {
      rval = gear_type6_h_60_act(x, y, z, rot, color);
      act_gear.push(rval);


      // 重さ変更用
    } else if (dtype == "gear_type7_h_free") {
      rval = gear_type7_h_free(x, y, z, rot, color);
    } else if (dtype == "gear_type7_h_act") {
      rval = gear_type7_h_act(x, y, z, rot, color);
      act_gear.push(rval);

    } else if (dtype == "gear_type7_h_20_free") {
      rval = gear_type7_h_20_free(x, y, z, rot, color);
    } else if (dtype == "gear_type7_h_20_act") {
      rval = gear_type7_h_20_act(x, y, z, rot, color);
      act_gear.push(rval);

      // 六方格子用
    } else if (dtype == "gear_type8_h_free") {
      rval = gear_type8_h_free(x, y, z, rot, color);
    } else if (dtype == "gear_type8_h_act") {
      rval = gear_type8_h_act(x, y, z, rot, color);
      act_gear.push(rval);

    // //////////////////////////////////////////////////

    // //////////////////////////////////////////////////
    // !!

    }
    // console.log("act_gear", act_gear);
  });


  const ball_rail = new CANNON.ContactMaterial(moBallMtr, moRailMtr, {
    friction: 0.0001,  // 摩擦係数(def=0.3)
    // restitution: 0.3,  // 反発係数 (def=0.3)
    restitution: 0.01,  // 反発係数 (def=0.3) 反発が小さい方がレールがガタガタでもそれなりに滑ってくれる
    // restitution: 0.001,  // 反発係数 (def=0.3) 反発が小さい方がレールがガタガタでもそれなりに滑ってくれる
    contactEquationStiffness: 1e7,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(ball_rail)

  const cnt_gear_gear = new CANNON.ContactMaterial(moGearMtr, moGearMtr, {
    friction: 0.0001,  // 摩擦係数(def=0.3)
    // restitution: 0.3,  // 反発係数 (def=0.3)
    restitution: 0.01,  // 反発係数 (def=0.3) 反発が小さい方がレールがガタガタでもそれなりに滑ってくれる
    // restitution: 0.001,  // 反発係数 (def=0.3) 反発が小さい方がレールがガタガタでもそれなりに滑ってくれる
    contactEquationStiffness: 1e1,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(cnt_gear_gear)
}

var _vspeed = 0.2;

export function hinge_speedup() {
  if (Math.abs(_vspeed) <= 1) {
    if (_vspeed == 1) {
      _vspeed = _vspeed * 2;
    } else {
      _vspeed += 0.2;
      if (Math.abs(_vspeed) <= 0.1) {
        _vspeed = 0;
      }
    }
  } else if (_vspeed > 0) {
    _vspeed = _vspeed * 2;
  } else if (_vspeed < 0) {
    _vspeed = _vspeed / 2;
  }
  console.log("hinge_speedup", _vspeed);
  for (let i = 0; i < act_gear.length; ++i) {
    let obj = act_gear[i];
    // console.log("hinge_speedup", obj);
    if (obj == undefined) {
        continue;
    }
    let hingelist = obj['hinge'];
    for (let j = 0; j < hingelist.length; ++j) {
      let hinge = hingelist[j];
      hinge.setMotorSpeed(_vspeed);
    }
  }
  return _vspeed;
}

export function hinge_speeddown() {
  if (Math.abs(_vspeed) <= 1) {
    if (_vspeed == -1) {
      _vspeed = _vspeed * 2;
    } else {
      _vspeed -= 0.2;
      if (Math.abs(_vspeed) <= 0.1) {
        _vspeed = 0;
      }
    }
  } else if (_vspeed > 0) {
    _vspeed = _vspeed / 2;
  } else if (_vspeed < 0) {
    _vspeed = _vspeed * 2;
  }
  console.log("hinge_speeddown", _vspeed);
  for (let i = 0; i < act_gear.length; ++i) {
    let obj = act_gear[i];
    let hingelist = obj.hinge;
    for (let j = 0; j < hingelist.length; ++j) {
      let hinge = hingelist[j];
      hinge.setMotorSpeed(_vspeed);
    }
  }
  return _vspeed;
}

export function hinge_speedzero() {
  _vspeed = 0;
  console.log("hinge_speeddown", _vspeed);
  for (let i = 0; i < act_gear.length; ++i) {
    let obj = act_gear[i];
    let hingelist = obj.hinge;
    for (let j = 0; j < hingelist.length; ++j) {
      let hinge = hingelist[j];
      hinge.setMotorSpeed(_vspeed);
    }
  }
  return _vspeed;
}

let moBallBodyVecGlb = [];
let viBallMeshVecGlb = [];

export function glb_data() {
  return {moBallBodyVecGlb, viBallMeshVecGlb};
}

export class Source_00 {
  // 球を生成する源泉
  //   見た目は箱にしておく
  // scene_;
  // world_;
  x_;
  y_;
  z_;
  nmaxball_;  // 最大数
  p_;   // 発生確率
  ballType_;
  pg_; // 中心位置 (x,y,z)をvec3 化したもの
  rndposi_;  // ランダム位置での生成
  moBallBodyVec_ = [];
  viBallMeshVec_ = [];

  // constructor(scene, world, x, y, z, nmaxball, p, ballType) {
  constructor(x, y, z, nmaxball, p, ballType, rndposi) {
    let adjx = 5; let adjy = 5; let adjz = 5;
    x += adjx; y += adjy; z += adjz;
    // this.scene_ = scene;
    // this.world_ = world;
    this.x_ = x;
    this.y_ = y;
    this.z_ = z;
    this.nmaxball_ = nmaxball;
    this.p_ = p;
    this.ballType_ = ballType;
    this.rndposi_ = rndposi;
    this.pg_ = new CANNON.Vec3(x, y, z);
    this.init()
  }

  init() {
    let sx = 10; let sy = 10; let sz = 10;
    const viSrc2Geo = new THREE.BoxGeometry(sx, sy, sz);
    const viSrc2Mtr = new THREE.MeshNormalMaterial({transparent: true, opacity: 0.8});
    const viSrc2Mesh = new THREE.Mesh(viSrc2Geo, viSrc2Mtr);
    viSrc2Mesh.position.copy(new THREE.Vector3(this.x_, this.y_, this.z_));
    scene.add(viSrc2Mesh);
  }

  pop() {
    // ボールの発生
    if (this.moBallBodyVec_.length < this.nmaxball_) {
      if (Math.random() < this.p_) {
        this.popforce();
      }
    }
  }

  popforce() {
    // ボールの発生（強制）
    let bfind = false; // 近傍にボールがあるかの判定
    for (let i = 0; i < this.moBallBodyVec_.length; ++i) {
      if (this.moBallBodyVec_[i].position.distanceTo(this.pg_) < 10) {
        bfind = true;
        break;
      }
    }
    if (bfind) {
      // 近傍にボールがあるのでskip
      return;
    }
    // 座標にちょっと揺らぎを
    // let x = this.x_ + rnorm()/2; let y = this.y_ + rnorm()/2; let z = this.z_ + rnorm()/2;
//    let x = this.x_ + rnorm()/4; let y = this.y_ + rnorm()/4; let z = this.z_ + rnorm()/4;
    let x = this.x_; let y = this.y_; let z = this.z_;
    if ((this.rndposi_ == undefined) || (this.rndposi_ == true)) {
      x = this.x_ + rnorm()/4; y = this.y_ + rnorm()/4; z = this.z_ + rnorm()/4;
    }
    if (this.ballType_ == 0) {
      const {moBallBody, viBallMesh} = Ball_00(x, y, z);
      this.moBallBodyVec_.push(moBallBody);
      this.viBallMeshVec_.push(viBallMesh);
      // イベントリスナ―内から参照できるよう this を持たせておく
      moBallBody.src_ = this;
    } else if (this.ballType_ == 1) {
      const {moBallBody, viBallMesh} = Ball_01(x, y, z);
      this.moBallBodyVec_.push(moBallBody);
      this.viBallMeshVec_.push(viBallMesh);
      // イベントリスナ―内から参照できるよう this を持たせておく
      moBallBody.src_ = this;
    } else if (this.ballType_ == 2) {
      let icolor = this.moBallBodyVec_.length;
      const {moBallBody, viBallMesh} = Ball_02(x, y, z, icolor);
      this.moBallBodyVec_.push(moBallBody);
      this.viBallMeshVec_.push(viBallMesh);
      // イベントリスナ―内から参照できるよう this を持たせておく
      moBallBody.src_ = this;
    } else {
      const {moBallBody, viBallMesh} = Ball_00(x, y, z);
      this.moBallBodyVec_.push(moBallBody);
      this.viBallMeshVec_.push(viBallMesh);
      // イベントリスナ―内から参照できるよう this を持たせておく
      moBallBody.src_ = this;
    }
  }

  repop(moBall) {
    // ボールの再発生
    //   リサイクルボックス／場外に消えたボールを再利用して popさせる
    // let p = new CANNON.Vec3(this.pg_.x + rnorm()/2,
    //                         this.pg_.y + rnorm()/2,
    //                         this.pg_.z + rnorm()/2);
    let p;
    if ((this.rndposi_ == undefined) || (this.rndposi_ == true)) {
      p = new CANNON.Vec3(this.pg_.x + rnorm()/2,
                          this.pg_.y + rnorm()/2,
                          this.pg_.z + rnorm()/2);
    } else {
      p = new CANNON.Vec3(this.pg_.x, this.pg_.y, this.pg_.z);
    }

    let bok = false;
    let iloopDbg = 0;
    while (bok == false) {
      iloopDbg += 1;
      if (iloopDbg > 100) {
        break;
      }
      let bfind = false; // 近傍にボールがあるかの判定
      for (let i = 0; i < this.moBallBodyVec_.length; ++i) {
        if (this.moBallBodyVec_[i].position.distanceTo(p) < 10) {
          bfind = true;
          break;
        }
      }
      if (bfind == true) {
          p.y += 15;
      } else {
          bok = true;
      }
    }
    // 湧き出し地点／の上空 に配置する
    moBall.position.copy(p);
    moBall.velocity.copy(new CANNON.Vec3(0, 0, 0));
  }

}

// export class RecycleBox_00 {
//   // リサイクルボックス
//   // 生成したボールの回収。これに衝突したらボールを削除する
//   x_;
//   y_;
//   z_;
//   src_;

//   constructor(x, y, z, src) {
//     let adjx = 5; let adjy = 5; let adjz = 5;
//     x += adjx; y += adjy; z += adjz;
//     this.x_ = x;
//     this.y_ = y;
//     this.z_ = z;
//     this.src_ = src;
//     this.init()
//   }

//   init() {
//     const moRecycleBox2Body = new CANNON.Body
//       ({mass: 0,
//         shape: new CANNON.Particle(),
//         position: new CANNON.Vec3(this.x_, this.y_, this.z_),
//         isTrigger: true,
//        });
//     world.addBody(moRecycleBox2Body);
//     let sx = 15; let sy = 15; let sz = 15;
//     const viRecycleBox2Geo = new THREE.BoxGeometry(sx, sy, sz);
//     const viRecycleBox2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8, color: 0x000000});
//     const viRecycleBox2Mesh = new THREE.Mesh(viRecycleBox2Geo, viRecycleBox2Mtr);
//     viRecycleBox2Mesh.position.copy(new THREE.Vector3(this.x_, this.y_, this.z_));
//     scene.add(viRecycleBox2Mesh);
//     moRecycleBox2Body.addEventListener("collide", this.hitevent);
//   }

//   // 衝突時のイベント用の関数
//   //   メンバであっても this が使えないので注意
//   hitevent (e) {
//     let moRBox = e.contact.bi;
//     let moBall = e.contact.bj;
//     if (moBall.mass == 0) {
//       [moRBox, moBall] = [moBall, moRBox];
//     }
//     // Source の repop() に丸投げ
//     moBall.src_.repop(moBall);
//   }
// }

// export class Accelerator_00 {
//   // 加速器
//   x_;
//   y_;
//   z_;
//   dir_;  // 加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
//   implus_;  // 衝撃

//   constructor(x, y, z, rot, implus) {
//     this.x_ = x;
//     this.y_ = y;
//     this.z_ = z;
//     this.implus_ = implus;
//     if (rot == 0) {
//       this.dir_ = new CANNON.Vec3(this.implus_, 0, 0);
//     } else if (rot == 1) {
//       this.dir_ = new CANNON.Vec3(0, 0, this.implus_);
//     } else if (rot == 2) {
//       this.dir_ = new CANNON.Vec3(-this.implus_, 0, 0);
//     } else if (rot == 3) {
//       this.dir_ = new CANNON.Vec3(0, 0, -this.implus_);
//     } else if (rot == 4) {
//       this.dir_ = new CANNON.Vec3(0, this.implus_, 0);
//     } else if (rot == 5) {
//       this.dir_ = new CANNON.Vec3(0, -this.implus_, 0);
//     } else {
//       this.dir_ = new CANNON.Vec3(1, 0, 0);
//     }
//     this.init()
//   }

//   init() {
//     const moAcc2Body = new CANNON.Body
//       ({mass: 0,
//         shape: new CANNON.Particle(),
//         position: new CANNON.Vec3(this.x_, this.y_, this.z_),
//         isTrigger: true,
//       });
//     world.addBody(moAcc2Body);
//     let udir = this.dir_.unit();
//     let vidir = new CANNON.Vec3(0, 1, 0);
//     let vquat = new CANNON.Quaternion().setFromVectors(vidir, udir);
//     let srad = 1; let shigh = 3; let srseg= 4;
//     const viAcc2Geo = new THREE.ConeGeometry(srad, shigh, srseg);
//     const viAcc2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8, color: 0xff0000});
//     const viAcc2Mesh = new THREE.Mesh(viAcc2Geo, viAcc2Mtr);
//     viAcc2Mesh.position.copy(new THREE.Vector3(this.x_, this.y_, this.z_));
//     viAcc2Mesh.quaternion.copy(vquat);
//     scene.add(viAcc2Mesh);
//     // 衝突イベントを紐づけ
//     moAcc2Body.addEventListener("collide", this.hitevent);
//     // イベントリスナ―内から参照できるよう this を持たせておく
//     moAcc2Body.acc_=this;
//   }

//   // 衝突時のイベント用の関数
//   //   メンバであっても this が使えないので注意
//   hitevent (e) {
//     let moAcc  = e.contact.bi;
//     let moBall = e.contact.bj;
//     if (moBall.mass == 0) {
//       [moAcc, moBall] = [moBall, moAcc];
//     }
//     moBall.applyImpulse(moAcc.acc_.dir_);
//   }
// }

// export class Accelerator_01 {
//   // 加速器（任意の方向）
//   // scene_;
//   // world_;
//   x_;
//   y_;
//   z_;
//   dir_;  // 加速方向ベクトル
//   implus_;  // 衝撃

//   constructor(x, y, z, vx, vy, vz, implus, color) {
//     this.x_ = x;
//     this.y_ = y;
//     this.z_ = z;
//     this.dir_ = new CANNON.Vec3(vx, vy, vz);
//     this.implus_ = implus;
//     this.color_ = color;
//     this.init()
//   }

//   init() {
//     const moAcc2Body = new CANNON.Body
//       ({mass: 0,
//         shape: new CANNON.Particle(),
//         position: new CANNON.Vec3(this.x_, this.y_, this.z_),
//         isTrigger: true,
//       });
//     world.addBody(moAcc2Body);
//     let udir = this.dir_.unit();
//     let vidir = new CANNON.Vec3(0, 1, 0);
//     let vquat = new CANNON.Quaternion().setFromVectors(vidir, udir);
//     let srad = 1; let shigh = 3; let srseg= 4;
//     const viAcc2Geo = new THREE.ConeGeometry(srad, shigh, srseg);
//     let viAcc2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8, color: 0xff0000});
//     if (this.color_ != null) {
//       let viAcc2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8, color: this.color_});
//     }
//     const viAcc2Mesh = new THREE.Mesh(viAcc2Geo, viAcc2Mtr);
//     viAcc2Mesh.position.copy(new THREE.Vector3(this.x_, this.y_, this.z_));
//     viAcc2Mesh.quaternion.copy(vquat);
//     scene.add(viAcc2Mesh);
//     moAcc2Body.addEventListener("collide", this.hitevent);
//     // イベントリスナ―内から参照できるよう this を持たせておく
//     moAcc2Body.acc_=this;
//     // dir_ を方向（単位ベクトル）＊implus の値にしておく
//     this.dir_ = udir.scale(this.implus_);
//   }

//   // 衝突時のイベント用の関数
//   //   メンバであっても this が使えないので注意
//   hitevent (e) {
//     let moAcc  = e.contact.bi;
//     let moBall = e.contact.bj;
//     if (moBall.mass == 0) {
//       [moAcc, moBall] = [moBall, moAcc];
//     }
//     moBall.applyImpulse(moAcc.acc_.dir_);
//   }
// }


// export class Deccelerator_00 {
//   // 減速器
//   x_;
//   y_;
//   z_;
//   rate_;  // 吸収率
//   color_;

//   constructor(x, y, z, rate, color) {
//     this.x_ = x;
//     this.y_ = y;
//     this.z_ = z;
//     this.rate_ = rate;
//     this.color_ = color;
//     this.init();
//   }

//   init() {
//     const moAcc2Body = new CANNON.Body
//       ({mass: 0,
//         shape: new CANNON.Particle(),
//         position: new CANNON.Vec3(this.x_, this.y_, this.z_),
//         isTrigger: true,
//       });
//     world.addBody(moAcc2Body);
//     // const radius = 1;
//     // const viAcc2Geo = new THREE.SphereGeometry(radius);
//     const sx = 1;
//     const viAcc2Geo = new THREE.BoxGeometry(sx, sx, sx);
//     let viAcc2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8, color: 0x000000});
//     if (this.color_ != null) {
//       viAcc2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8, color: this.color_});
//     }
//     const viAcc2Mesh = new THREE.Mesh(viAcc2Geo, viAcc2Mtr);
//     viAcc2Mesh.position.copy(new THREE.Vector3(this.x_, this.y_, this.z_));
//     scene.add(viAcc2Mesh);
//     moAcc2Body.addEventListener("collide", this.hitevent);
//     // イベントリスナ―内から参照できるよう this を持たせておく
//     moAcc2Body.dcc_=this;
//   }

//   // 衝突時のイベント用の関数
//   //   メンバであっても this が使えないので注意
//   hitevent (e) {
//     let moDcc  = e.contact.bi;
//     let moBall = e.contact.bj;
//     if (moBall.mass == 0) {
//       [moDcc, moBall] = [moBall, moDcc];
//     }
//     let v = moBall.velocity;
//     v = v.scale(moDcc.dcc_.rate_);
//     moBall.velocity.copy(v);
//   }
// }

export function Ball_00_glb(x,y,z) {
  // 球
  //   グローバルで生成、テスト用
  let {moBallBody, viBallMesh} = Ball_00(x,y,z);
  moBallBodyVecGlb.push(moBallBody);
  viBallMeshVecGlb.push(viBallMesh);
}

export function Ball_00(x,y,z) {
  // 球
  const radius = ballR;
  const moBallBody = new CANNON.Body
      ({mass: 5,
        shape: new CANNON.Sphere(radius),
        position: new CANNON.Vec3(x, y, z),
        material: moBallMtr,
        angularDamping: 0.00001, // def=0.01
        linearDamping: 0.00001, // def=0.01
       });
  world.addBody(moBallBody);
  const viBallGeo = new THREE.SphereGeometry(radius);
  const viBallMtr = new THREE.MeshNormalMaterial();
  const viBallMesh = new THREE.Mesh(viBallGeo, viBallMtr);
  viBallMesh.position.copy(moBallBody.position);
  scene.add(viBallMesh);
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viBallMesh.position.copy(moBallBody.position);
    viBallMesh.quaternion.copy(moBallBody.quaternion);
  })
  return {moBallBody, viBallMesh};
}

export function Ball_01(x,y,z) {
  // 球
  const radius = ballR;
  const moBallBody = new CANNON.Body
      ({mass: 5,
        shape: new CANNON.Sphere(radius),
        position: new CANNON.Vec3(x, y, z),
        material: moBallMtr,
        angularDamping: 0.00001, // def=0.01
        linearDamping: 0.00001, // def=0.01
       });
  world.addBody(moBallBody);
  const viBallGeo = new THREE.SphereGeometry(radius);
  const viBallMtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, wireframe:true});
  const viBallMesh = new THREE.Mesh(viBallGeo, viBallMtr);
  viBallMesh.position.copy(moBallBody.position);
  scene.add(viBallMesh);
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viBallMesh.position.copy(moBallBody.position);
    viBallMesh.quaternion.copy(moBallBody.quaternion);
  })
  return {moBallBody, viBallMesh};
}

export function Ball_02(x,y,z,icolor) {
  // 球
  // ref: https://phpjavascriptroom.com/?t=css&p=colors
  const colorlist = [0xF08080, // LightCoral
                     0x87CEFA, // LightSkyBlue
                     0x7CFC00, // LawnGreen
                     0xFAFAD2, // LightGoldenRodYellow
                     0x6B8E23, // OliveDrab
                     0x708090, // SlateGray
                    ];
  let vcolor = new THREE.Color(colorlist[icolor % colorlist.length]);
 //console.log("ball02, icolor=",icolor, vcolor);
  const radius = ballR;
  const moBallBody = new CANNON.Body
      ({mass: 5,
        shape: new CANNON.Sphere(radius),
        position: new CANNON.Vec3(x, y, z),
        material: moBallMtr,
        angularDamping: 0.00001, // def=0.01
        linearDamping: 0.00001, // def=0.01
       });
  world.addBody(moBallBody);
  const viBallGeo = new THREE.SphereGeometry(radius);
  const viBallMtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: vcolor});
  const viBallMesh = new THREE.Mesh(viBallGeo, viBallMtr);
  viBallMesh.position.copy(moBallBody.position);
  scene.add(viBallMesh);
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viBallMesh.position.copy(moBallBody.position);
    viBallMesh.quaternion.copy(moBallBody.quaternion);
  })
  return {moBallBody, viBallMesh};
}

// export function Rail_00(x,y,z) {
//     // レール　直進　水平　10x10x10
//     //   細い直方体２本で表現
//     let sx = 10; let sy = 1; let sz = 1;
//     let sx_ = sx/2; let sy_ = sy/2; let sz_ = sz/2;
//     // let px = 0; let py = 0; let pz = railIntr/2;  // 原点を部品の中心位置としたときのレール位置の中心
//     let px = 0; let py = 0; let pz = railIntr_;
//     let adjx = 5; let adjy = 5; let adjz = 5;
//     {
//       const moRailA2Body = new CANNON.Body
//         ({mass: 0,
//           shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
//           position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z+pz+adjz),
//           material: moRailMtr,
//          });
//       world.addBody(moRailA2Body);
//       const viRailA2Geo = new THREE.BoxGeometry(sx, sy, sz);
//       const viRailA2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
//       const viRailA2Mesh = new THREE.Mesh(viRailA2Geo, viRailA2Mtr);
//       scene.add(viRailA2Mesh);
//       viRailA2Mesh.position.copy(moRailA2Body.position);
//       viRailA2Mesh.quaternion.copy(moRailA2Body.quaternion);
//     }
//     {
//       const moRailB2Body = new CANNON.Body
//         ({mass: 0,
//           shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
//           position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z-pz+adjz),
//           material: moRailMtr,
//          });
//       world.addBody(moRailB2Body);
//       const viRailB2Geo = new THREE.BoxGeometry(sx, sy, sz);
//       const viRailB2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1});
//       const viRailB2Mesh = new THREE.Mesh(viRailB2Geo, viRailB2Mtr);
//       scene.add(viRailB2Mesh);
//       viRailB2Mesh.position.copy(moRailB2Body.position);
//       viRailB2Mesh.quaternion.copy(moRailB2Body.quaternion);
//     }
//   }

// export function Rail_01(x,y,z) {
//     // レール　直進　傾斜　20x10x10　角度 atan(1/2)
//     //   細い直方体２本で表現
//     // 本来なら10だが、重なった部分がちらつくので、ちょい縮める
//     let sx = 9.8*Math.sqrt(5); let sy = 1; let sz = 1; let ang=Math.atan(1/2);
//     let sx_ = sx/2; let sy_ = sy/2; let sz_ = sz/2;
//     let px = 0; let py = 0; let pz = railIntr_; // railIntr/2;
//     let adjx = 10; let adjy = 10; let adjz = 5;  // 低い側を原点側としたときの座標補正
//     let railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
//     {
//       const moRailA2Body = new CANNON.Body
//         ({mass: 0,
//           shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
//           position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z+pz+adjz),
//           quaternion: railQuat,
//           material: moRailMtr,
//          });
//       world.addBody(moRailA2Body);
//       const viRailA2Geo = new THREE.BoxGeometry(sx, sy, sz);
//       const viRailA2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
//       const viRailA2Mesh = new THREE.Mesh(viRailA2Geo, viRailA2Mtr);
//       scene.add(viRailA2Mesh);
//       viRailA2Mesh.position.copy(moRailA2Body.position);
//       viRailA2Mesh.quaternion.copy(moRailA2Body.quaternion);
//     }
//     {
//       const moRailB2Body = new CANNON.Body
//         ({mass: 0,
//           shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
//           position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z-pz+adjz),
//           quaternion: railQuat,
//           material: moRailMtr,
//          });
//       world.addBody(moRailB2Body);
//       const viRailB2Geo = new THREE.BoxGeometry(sx, sy, sz);
//       const viRailB2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1});
//       const viRailB2Mesh = new THREE.Mesh(viRailB2Geo, viRailB2Mtr);
//       scene.add(viRailB2Mesh);
//       viRailB2Mesh.position.copy(moRailB2Body.position);
//       viRailB2Mesh.quaternion.copy(moRailB2Body.quaternion);
//     }
//   }


// export function Rail_02(x,y,z) {
//     // レール　直進　傾斜　20x10x10
//     //   細い直方体２本で表現、傾斜をsin波で作る[-PI/2, PI/2]の範囲で
//     let dx = 20; let dy = 10; let dx_ = dx/2; let dy_ = dy/2;
//     let ndiv = 20;
//     let xxlist = [];
//     let yylist = [];
//     for (let i = 0; i < ndiv+1; ++i) {
//         let xx = i/ndiv*dx - dx_;
//         let vrad = i/ndiv*Math.PI - PI_;
//         let yy = Math.sin(vrad)*dy_;
//         xxlist.push(xx);
//         yylist.push(yy);
//     }
//     let sy = 1; let sz = 1;
//     let sy_ = sy/2; let sz_ = sz/2;
//     let pz = railIntr_; // railIntr/2;
//     let adjx = 10; let adjy = 10; let adjz = 5;
//     for (let i = 0; i < ndiv; ++i) {
//       let xx1 = xxlist[i]; let yy1 = yylist[i];
//       let xx2 = xxlist[i+1]; let yy2 = yylist[i+1];
//       let sx = Math.sqrt((xx1-xx2)**2 + (yy1-yy2)**2)
//       let sx_ = sx/2;
//       let px = (xx1+xx2)/2;
//       let py = (yy1+yy2)/2;
//       let ang=Math.atan((yy1-yy2)/(xx1-xx2));
//       let railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
//       {
//         const moRailA2Body = new CANNON.Body
//           ({mass: 0,
//             shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
//             position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z+pz+adjz),
//             quaternion: railQuat,
//             material: moRailMtr,
//            });
//         world.addBody(moRailA2Body);
//         const viRailA2Geo = new THREE.BoxGeometry(sx, sy, sz);
//         const viRailA2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
//         const viRailA2Mesh = new THREE.Mesh(viRailA2Geo, viRailA2Mtr);
//         scene.add(viRailA2Mesh);
//         viRailA2Mesh.position.copy(moRailA2Body.position);
//         viRailA2Mesh.quaternion.copy(moRailA2Body.quaternion);
//       }
//       {
//         const moRailB2Body = new CANNON.Body
//           ({mass: 0,
//             shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
//             position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z-pz+adjz),
//             quaternion: railQuat,
//             material: moRailMtr,
//            });
//         world.addBody(moRailB2Body);
//         const viRailB2Geo = new THREE.BoxGeometry(sx, sy, sz);
//         const viRailB2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1});
//         const viRailB2Mesh = new THREE.Mesh(viRailB2Geo, viRailB2Mtr);
//         scene.add(viRailB2Mesh);
//         viRailB2Mesh.position.copy(moRailB2Body.position);
//         viRailB2Mesh.quaternion.copy(moRailB2Body.quaternion);
//       }
//     }
// }

// export function Rail_03(x,y,z) {
//     // レール　左右曲（小径）　10x10x10
//     //   細い直方体２本で表現
//     let rinn = (10 - railIntr)/2; // 内側の半径
//     let rout = (10 + railIntr)/2; // 外側の半径
//     let ndiv = 10;  // 円弧（９０度）の分割数
//     let xxadj = -5;
//     let zzadj = -5;
//     let xxinnlist = [];
//     let zzinnlist = [];
//     let xxoutlist = [];
//     let zzoutlist = [];
//     for (let i = 0; i < ndiv+1; ++i) {
//         let vrad = i/ndiv*PI_;
//         let xx = Math.cos(vrad);
//         let zz = Math.sin(vrad);
//         xxinnlist.push(xx*rinn+xxadj);
//         zzinnlist.push(zz*rinn+zzadj);
//         xxoutlist.push(xx*rout+xxadj);
//         zzoutlist.push(zz*rout+zzadj);
//     }
//     let sy = 1; let sz = 1;
//     let sy_ = sy/2; let sz_ = sz/2;
//     let py = 0;
//     let adjx = 5; let adjy = 5; let adjz = 5;
//     for (let i = 0; i < ndiv; ++i) {
//       let xx1 = xxinnlist[i];   let zz1 = zzinnlist[i];
//       let xx2 = xxinnlist[i+1]; let zz2 = zzinnlist[i+1];
//       let sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2)
//       let sx_ = sx/2;
//       let px = (xx1+xx2)/2;
//       let pz = (zz1+zz2)/2;
//       let ang=Math.atan((zz1-zz2)/(xx1-xx2));
//       let railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
//       {
//         const moRailA2Body = new CANNON.Body
//           ({mass: 0,
//             shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
//             position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z+pz+adjz),
//             quaternion: railQuat,
//             material: moRailMtr,
//            });
//         world.addBody(moRailA2Body);
//         const viRailA2Geo = new THREE.BoxGeometry(sx, sy, sz);
//         const viRailA2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
//         const viRailA2Mesh = new THREE.Mesh(viRailA2Geo, viRailA2Mtr);
//         scene.add(viRailA2Mesh);
//         viRailA2Mesh.position.copy(moRailA2Body.position);
//         viRailA2Mesh.quaternion.copy(moRailA2Body.quaternion);
//       }
//     }
//     for (let i = 0; i < ndiv; ++i) {
//       let xx1 = xxoutlist[i];   let zz1 = zzoutlist[i];
//       let xx2 = xxoutlist[i+1]; let zz2 = zzoutlist[i+1];
//       let sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2)
//       let sx_ = sx/2;
//       let px = (xx1+xx2)/2;
//       let pz = (zz1+zz2)/2;
//       let ang=Math.atan((zz1-zz2)/(xx1-xx2));
//       let railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
//       {
//         const moRailA2Body = new CANNON.Body
//           ({mass: 0,
//             shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
//             position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z+pz+adjz),
//             quaternion: railQuat,
//             material: moRailMtr,
//            });
//         world.addBody(moRailA2Body);
//         const viRailA2Geo = new THREE.BoxGeometry(sx, sy, sz);
//         const viRailA2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1});
//         const viRailA2Mesh = new THREE.Mesh(viRailA2Geo, viRailA2Mtr);
//         scene.add(viRailA2Mesh);
//         viRailA2Mesh.position.copy(moRailA2Body.position);
//         viRailA2Mesh.quaternion.copy(moRailA2Body.quaternion);
//       }
//     }
// }



export function Rail_04(x,y,z,rot) {
  // rail_st
  // レール　直進　水平　10x10x10
  //   細い直方体２本で表現
  // x,y,z : レールの部品のmin側：表示位置
  // rot : 90度単位
  // [top]
  //  +------+
  //  |＿＿__|
  //  |￣￣￣|
  //  +------+
  let sx = blockSize; let sy = railw; let sz = railw;
  let sx_ = sx/2; let sy_ = sy/2; let sz_ = sz/2;
  // 原点を部品の中心位置としたときのレール位置の中心
  let px = 0; let py = 0; let pz = railIntr_; // railIntr/2;
  let pxyzlist = [[px, py, pz],
                  [px, py, -pz]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (let ii = 0; ii < pxyzlist.length; ++ii) {
    let pxx = pxyzlist[ii][0];
    let pyy = pxyzlist[ii][1];
    let pzz = pxyzlist[ii][2];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  // moCntnrBody.position = new CANNON.Vec3(x, y, z);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}



export function Windmill_00(x,y,z,rot) {
  // windmill_h
  // 風車　水平　20x10x20  動力なし
  //   羽4枚（板２枚)で表現
  //  [top]
  //  +-----+-----+
  //  |           |
  //  |     ||    |
  //  |     ||    |
  //  + ──＋──|
  //  |     ||    |
  //  |     ||    |
  //  |           |
  //  +-----+-----+
  //  [side]
  //  +-----+-----+
  //  | +-------+ |
  //  | +-------+ |
  //  +-----+-----+
  // 羽
  let sW = blockSize*1.8; let sH = blockSize*0.5; let sD = 0.1;
  let sH_ = sH/2;
  let sxyzlist = [[sW, sH, sD],  // x軸方向
                  [sD, sH, sW]]; // z軸方向
  let pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  // 土台（ポール：Y軸）
  let sxyz2list = [[sD, sH, sD]];
  let pxyz2list = [[0, 0, 0]];
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (let ii = 0; ii < pxyzlist.length; ++ii) {
    let pxx = pxyzlist[ii][0]; let pyy = pxyzlist[ii][1]; let pzz = pxyzlist[ii][2];
    let sxx = sxyzlist[ii][0]; let syy = sxyzlist[ii][1]; let szz = sxyzlist[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0]; let pyy = pxyz2list[ii][1]; let pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0]; let syy = sxyz2list[ii][1]; let szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  let adjx = blockSize; let adjy = blockSize_+ballR; let adjz = blockSize;
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion.copy(new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_));
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH_, 0),
    pivotB: new CANNON.Vec3(0, sH_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH_, 0),
    pivotB: new CANNON.Vec3(0, -sH_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
}


export function Windmill_01(x,y,z,rot) {
  // windmill_v
  // 風車　垂直　20x20x10  動力なし
  //   羽4枚（板２枚)で表現
  //  [top]
  //  +-----+-----+
  //  | +-------+ |
  //  | +-------+ |
  //  +-----+-----+
  //  [side]
  //  +-----+-----+
  //  |           |
  //  |     ||    |
  //  |     ||    |
  //  + ──＋──|
  //  |     ||    |
  //  |     ||    |
  //  |           |
  //  +-----+-----+
  // 羽
  let sW = blockSize*1.8; let sH = blockSize*0.5; let sD = 0.1;
  let sH_ = sH/2;
  let sxyzlist = [[sW, sD, sH],  // x軸方向
                  [sD, sW, sH]]; // y軸方向
  let pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  // 土台（ポール：Z軸）
  let sxyz2list = [[sD, sD, sH]];
  let pxyz2list = [[0, 0, 0]];
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (let ii = 0; ii < pxyzlist.length; ++ii) {
    let pxx = pxyzlist[ii][0]; let pyy = pxyzlist[ii][1]; let pzz = pxyzlist[ii][2];
    let sxx = sxyzlist[ii][0]; let syy = sxyzlist[ii][1]; let szz = sxyzlist[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0]; let pyy = pxyz2list[ii][1]; let pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0]; let syy = sxyz2list[ii][1]; let szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
//  let adjx = 0; let adjy = 0; let adjz = 0;
  let adjxlist = [blockSize_*2, blockSize_*1, blockSize_*2, blockSize_*1];
  let adjzlist = [blockSize_*1, blockSize_*2, blockSize_*1, blockSize_*2];
  let adjx = adjxlist[rot%4];
  let adjy = blockSize_*3;
  let adjz = adjzlist[rot%4];
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, sH_),
    pivotB: new CANNON.Vec3(0, 0, sH_),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, -sH_),
    pivotB: new CANNON.Vec3(0, 0, -sH_),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
}

export function Windmill_02(x,y,z,rot, color) {
  // windmill_h2
  // 風車　水平　20x10x20  動力あり
  //   羽4枚（板２枚)で表現
  //  [top]
  //  +-----+-----+
  //  |           |
  //  |     ||    |
  //  |     ||    |
  //  + ──＋──|
  //  |     ||    |
  //  |     ||    |
  //  |           |
  //  +-----+-----+
  //  [side]
  //  +-----+-----+
  //  | +-------+ |
  //  | +-------+ |
  //  +-----+-----+
  // 羽
  let sW = blockSize*1.8; let sH = blockSize*0.5; let sD = 0.1;
  let sH_ = sH/2;
  let sxyzlist = [[sW, sH, sD],  // x軸方向
                  [sD, sH, sW]]; // z軸方向
  let pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  // 土台（ポール：Y軸）
  let sxyz2list = [[sD, sH, sD]];
  let pxyz2list = [[0, 0, 0]];
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (let ii = 0; ii < pxyzlist.length; ++ii) {
    let pxx = pxyzlist[ii][0]; let pyy = pxyzlist[ii][1]; let pzz = pxyzlist[ii][2];
    let sxx = sxyzlist[ii][0]; let syy = sxyzlist[ii][1]; let szz = sxyzlist[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    if (color != undefined) {
      viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
    }
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0]; let pyy = pxyz2list[ii][1]; let pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0]; let syy = sxyz2list[ii][1]; let szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  let adjx = blockSize; let adjy = blockSize_+ballR; let adjz = blockSize;
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH_, 0),
    pivotB: new CANNON.Vec3(0, sH_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH_, 0),
    pivotB: new CANNON.Vec3(0, -sH_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  // 動力を付与
  let vspeed = 0.2
  if (rot >= 2) {
    vspeed = -vspeed;
  }
  hingeConst.enableMotor();
  hingeConst.setMotorSpeed(vspeed);
  hingeConst2.enableMotor();
  hingeConst2.setMotorSpeed(vspeed);
  hingeConst3.enableMotor();
  hingeConst3.setMotorSpeed(vspeed);
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
}

export function Windmill_03(x,y,z,rot) {
  // windmill_v2
  // 風車　垂直　20x20x10  動力なし
  //   羽4枚（板２枚)で表現
  //  [top]
  //  +-----+-----+
  //  | +-------+ |
  //  | +-------+ |
  //  +-----+-----+
  //  [side]
  //  +-----+-----+
  //  |           |
  //  |     ||    |
  //  |     ||    |
  //  + ──＋──|
  //  |     ||    |
  //  |     ||    |
  //  |           |
  //  +-----+-----+
  // 羽
  let sW = blockSize*1.8; let sH = blockSize*0.5; let sD = 0.1;
  let sH_ = sH/2;
  let sxyzlist = [[sW, sD, sH],  // x軸方向
                  [sD, sW, sH]]; // y軸方向
  let pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  // 土台（ポール：Z軸）
  let sxyz2list = [[sD, sD, sH]];
  let pxyz2list = [[0, 0, 0]];
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (let ii = 0; ii < pxyzlist.length; ++ii) {
    let pxx = pxyzlist[ii][0]; let pyy = pxyzlist[ii][1]; let pzz = pxyzlist[ii][2];
    let sxx = sxyzlist[ii][0]; let syy = sxyzlist[ii][1]; let szz = sxyzlist[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0]; let pyy = pxyz2list[ii][1]; let pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0]; let syy = sxyz2list[ii][1]; let szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    let moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    let viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
//  let adjx = 0; let adjy = 0; let adjz = 0;
  let adjxlist = [blockSize_*2, blockSize_*1, blockSize_*2, blockSize_*1];
  let adjzlist = [blockSize_*1, blockSize_*2, blockSize_*1, blockSize_*2];
  let adjx = adjxlist[rot%4];
  let adjy = blockSize_*3;
  let adjz = adjzlist[rot%4];
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, sH_),
    pivotB: new CANNON.Vec3(0, 0, sH_),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, -sH_),
    pivotB: new CANNON.Vec3(0, 0, -sH_),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  // 動力を付与
  let vspeed = 0.2
  hingeConst.enableMotor();
  hingeConst.setMotorSpeed(vspeed);
  hingeConst2.enableMotor();
  hingeConst2.setMotorSpeed(vspeed);
  hingeConst3.enableMotor();
  hingeConst3.setMotorSpeed(vspeed);
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
}

export function Windmill_04(x,y,z,rot) {
  // windmill_h3
  // 風車　水平　20x10x20  動力あり(重量級)
  // .. 重いからとトルクがかかっているわけではないので、物理的に挟まると動かない..
  //   羽4枚（板２枚)で表現
  //  [top]
  //  +-----+-----+
  //  |           |
  //  |     ||    |
  //  |     ||    |
  //  + ──＋──|
  //  |     ||    |
  //  |     ||    |
  //  |           |
  //  +-----+-----+
  //  [side]
  //  +-----+-----+
  //  | +-------+ |
  //  | +-------+ |
  //  +-----+-----+
  // 羽
  let sW = blockSize*1.8; let sH = blockSize*0.5; let sD = 0.1;
  let sH_ = sH/2;
  let sxyzlist = [[sW, sH, sD],  // x軸方向
                  [sD, sH, sW]]; // z軸方向
  let pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  // 土台（ポール：Y軸）
  let sxyz2list = [[sD, sH, sD]];
  let pxyz2list = [[0, 0, 0]];
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 100,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (let ii = 0; ii < pxyzlist.length; ++ii) {
    let pxx = pxyzlist[ii][0]; let pyy = pxyzlist[ii][1]; let pzz = pxyzlist[ii][2];
    let sxx = sxyzlist[ii][0]; let syy = sxyzlist[ii][1]; let szz = sxyzlist[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0]; let pyy = pxyz2list[ii][1]; let pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0]; let syy = sxyz2list[ii][1]; let szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    let moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    let viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  let adjx = blockSize; let adjy = blockSize_+ballR; let adjz = blockSize;
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH_, 0),
    pivotB: new CANNON.Vec3(0, sH_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH_, 0),
    pivotB: new CANNON.Vec3(0, -sH_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  // 動力を付与
  let vspeed = 0.2
  if (rot >= 2) {
    vspeed = -vspeed;
  }
  hingeConst.enableMotor();
  hingeConst.setMotorSpeed(vspeed);
  hingeConst2.enableMotor();
  hingeConst2.setMotorSpeed(vspeed);
  hingeConst3.enableMotor();
  hingeConst3.setMotorSpeed(vspeed);
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
}

export function Windmill_05(x,y,z,rot) {
  // windmill_v3
  // 風車　垂直　20x20x10  動力なし(重量級)
  // .. 重いからとトルクがかかっているわけではないので、物理的に挟まると動かない..
  //   羽4枚（板２枚)で表現
  //  [top]
  //  +-----+-----+
  //  | +-------+ |
  //  | +-------+ |
  //  +-----+-----+
  //  [side]
  //  +-----+-----+
  //  |           |
  //  |     ||    |
  //  |     ||    |
  //  + ──＋──|
  //  |     ||    |
  //  |     ||    |
  //  |           |
  //  +-----+-----+
  // 羽
  let sW = blockSize*1.8; let sH = blockSize*0.5; let sD = 0.1;
  let sH_ = sH/2;
  let sxyzlist = [[sW, sD, sH],  // x軸方向
                  [sD, sW, sH]]; // y軸方向
  let pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  // 土台（ポール：Z軸）
  let sxyz2list = [[sD, sD, sH]];
  let pxyz2list = [[0, 0, 0]];
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 100,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (let ii = 0; ii < pxyzlist.length; ++ii) {
    let pxx = pxyzlist[ii][0]; let pyy = pxyzlist[ii][1]; let pzz = pxyzlist[ii][2];
    let sxx = sxyzlist[ii][0]; let syy = sxyzlist[ii][1]; let szz = sxyzlist[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0]; let pyy = pxyz2list[ii][1]; let pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0]; let syy = sxyz2list[ii][1]; let szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    let moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    let viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
//  let adjx = 0; let adjy = 0; let adjz = 0;
  let adjxlist = [blockSize_*2, blockSize_*1, blockSize_*2, blockSize_*1];
  let adjzlist = [blockSize_*1, blockSize_*2, blockSize_*1, blockSize_*2];
  let adjx = adjxlist[rot%4];
  let adjy = blockSize_*3;
  let adjz = adjzlist[rot%4];
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, sH_),
    pivotB: new CANNON.Vec3(0, 0, sH_),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, -sH_),
    pivotB: new CANNON.Vec3(0, 0, -sH_),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  // 動力を付与
  let vspeed = 0.2
  hingeConst.enableMotor();
  hingeConst.setMotorSpeed(vspeed);
  hingeConst2.enableMotor();
  hingeConst2.setMotorSpeed(vspeed);
  hingeConst3.enableMotor();
  hingeConst3.setMotorSpeed(vspeed);
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
}


// export function gear_h_0(x,y,z,rot) {
//   // ギア（歯車
//   //   正方形２つで表現
//   let sW = 5; let sH = 5; let sD = 1;
//   let sW_ = sW/2, sH_ = sH/2, sD_ = sD/2;
//   let sxyzlist = [[sW, sD, sW],
//                   [sW, sD*0.99, sW],]; // 少しずらしてちらつき防止
//   let pxyzlist = [[0, 0, 0],
//                   [0, 0, 0]];
//   let quat1 = new CANNON.Quaternion();
//   let quat2 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), PI_/2);
//   let quatlist = [quat1, quat2];
//   // 土台（ポール：Y軸）
//   let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
//   let sxyz2list = [[sW2, sD2, sW2]];
//   let pxyz2list = [[0, 0, 0]];
//   let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
//   // 羽を組み立て
//   const moCntnrBody = new CANNON.Body({
//     mass: 0.01,
//     position: new CANNON.Vec3(0, 0, 0),
//     material: moRailMtr,
//   });
//   const viCntnrMesh = new THREE.Group();
//   for (let ii = 0; ii < pxyzlist.length; ++ii) {
//     let pxx = pxyzlist[ii][0], pyy = pxyzlist[ii][1], pzz = pxyzlist[ii][2];
//     let sxx = sxyzlist[ii][0], syy = sxyzlist[ii][1], szz = sxyzlist[ii][2];
//     let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
//     let quat = quatlist[ii];
//     moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
//                          new CANNON.Vec3(pxx, pyy, pzz),
//                          quat);
//     const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
//     const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
//     const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
//     viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
//     viRail2Mesh.quaternion.copy(quat);
//     viCntnrMesh.add(viRail2Mesh);
//   }
//   // 土台..簡単にbox１つですませる
//   let moBase2Body;
//   let viBase2Mesh;
//   {
//     let ii = 0;
//     let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
//     let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
//     let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
//     moBase2Body = new CANNON.Body
//       ({mass: 0,
//         shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
//         position: new CANNON.Vec3(pxx, pyy, pzz),
//        });
//     const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
//     const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
//     viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
//   }
//   moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
//   moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
//   if (rot != 0) {
//     moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
//     moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
//   }
//   viCntnrMesh.position.copy(moCntnrBody.position);
//   viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
//   world.addBody(moCntnrBody);
//   scene.add(viCntnrMesh);
//   viBase2Mesh.position.copy(moBase2Body.position);
//   viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
//   world.addBody(moBase2Body);
//   scene.add(viBase2Mesh);
//   // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
//   const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
//     axisA: new CANNON.Vec3(0, 1, 0),
//     axisB: new CANNON.Vec3(0, 1, 0),
//     pivotA: new CANNON.Vec3(0, 0, 0),
//     pivotB: new CANNON.Vec3(0, 0, 0),
//     collideConnected: false,  // 軸と風車がすり抜けるように
//   });
//   world.addConstraint(hingeConst);
//   const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
//     axisA: new CANNON.Vec3(0, 1, 0),
//     axisB: new CANNON.Vec3(0, 1, 0),
//     pivotA: new CANNON.Vec3(0, sH_, 0),
//     pivotB: new CANNON.Vec3(0, sH_, 0),
//     collideConnected: false,
//   });
//   world.addConstraint(hingeConst2);
//   const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
//     axisA: new CANNON.Vec3(0, 1, 0),
//     axisB: new CANNON.Vec3(0, 1, 0),
//     pivotA: new CANNON.Vec3(0, -sH_, 0),
//     pivotB: new CANNON.Vec3(0, -sH_, 0),
//     collideConnected: false,
//   });
//   world.addConstraint(hingeConst3);
//   // 描画を自動で更新させるために postStepにイベント追加
//   world.addEventListener('postStep', () => {
//     viCntnrMesh.position.copy(moCntnrBody.position);
//     viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
//   })
// }

// // export function gear_h_0(x,y,z,rot, color) {
// //     gear_type1_h(x,y,z,rot, false, color);
// // }
// // export function gear_h_1(x,y,z,rot, color) {
// //     gear_type1_h(x,y,z,rot, true, color);
// // }

export function gear_type1_h_free(x,y,z,rot, color) {
    return gear_type1_h(x,y,z,rot, false, color);
}
export function gear_type1_h_act(x,y,z,rot, color) {
    return gear_type1_h(x,y,z,rot, true, color);
}

export function gear_type1_h(x,y,z,rot, act, color) {
  // ギア（歯車
  //   正方形２つで表現
  // 羽
  let sW = 5; let sH = 5; let sD = 1;
  let sW_ = sW/2, sH_ = sH/2, sD_ = sD/2;
  let sxyzlist = [[sW, sD, sW],
                  [sW, sD*0.99, sW],]; // 同じ高さだとチカチカするので少しずらす
  let pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  let quat1 = new CANNON.Quaternion();
  let quat2 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), PI_/2);
  let quatlist = [quat1, quat2];
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (let ii = 0; ii < pxyzlist.length; ++ii) {
    let pxx = pxyzlist[ii][0], pyy = pxyzlist[ii][1], pzz = pxyzlist[ii][2];
    let sxx = sxyzlist[ii][0], syy = sxyzlist[ii][1], szz = sxyzlist[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    let quat = quatlist[ii];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz),
                         quat);
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    if (color != undefined) {
      viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
    }
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viRail2Mesh.quaternion.copy(quat);
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH_, 0),
    pivotB: new CANNON.Vec3(0, sH_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH_, 0),
    pivotB: new CANNON.Vec3(0, -sH_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}



// // export function gear_v_0(x,y,z,rot, color) {
// //     gear_type1_v(x,y,z,rot, false, color);
// // }
// // export function gear_v_1(x,y,z,rot, color) {
// //     gear_type1_v(x,y,z,rot, true, color);
// // }

export function gear_type1_v_free(x,y,z,rot, color) {
  return gear_type1_v(x,y,z,rot, false, color);
}
export function gear_type1_v_act(x,y,z,rot, color) {
  return gear_type1_v(x,y,z,rot, true, color);
}

export function gear_type1_v(x,y,z,rot, act, color) {
  // ギア（歯車
  //   正方形２つで表現
  // 羽
  let sW = 5; let sH = 5; let sD = 1;
  let sW_ = sW/2, sH_ = sH/2, sD_ = sD/2;
  let sxyzlist = [[sW, sW, sD],
                  [sW, sW, sD*0.99],]; // 同じ幅だとチカチカするので少しずらす
  let pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  let quat1 = new CANNON.Quaternion();
  let quat2 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), PI_/2);
  let quatlist = [quat1, quat2];
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sW2, sD2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (let ii = 0; ii < pxyzlist.length; ++ii) {
    let pxx = pxyzlist[ii][0], pyy = pxyzlist[ii][1], pzz = pxyzlist[ii][2];
    let sxx = sxyzlist[ii][0], syy = sxyzlist[ii][1], szz = sxyzlist[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    let quat = quatlist[ii];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz),
                         quat);
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    if (color != undefined) {
      viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
    }
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viRail2Mesh.quaternion.copy(quat);
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, sH_),
    pivotB: new CANNON.Vec3(0, 0, sH_),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, -sH_),
    pivotB: new CANNON.Vec3(0, 0, -sH_),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type2_h_free(x,y,z,rot, color) {
  return gear_type2_h(x,y,z,rot, false, color);
}

export function gear_type2_h_act(x,y,z,rot, color) {
  return gear_type2_h(x,y,z,rot, true, color);
}

export function gear_type2_h(x,y,z,rot, act, color) {
  // ギア（歯車
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  let sR1 = 3.5, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 1.05;
  let n2 = 8;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2*1.0;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let z = r2*Math.sin(vrad);
    pxyzlist2.push([x, 0, z]);
  }
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    // let sxx = sxyzlist[ii][0], syy = sxyzlist[ii][1], szz = sxyzlist[ii][2];
    // let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    // let quat = quatlist[ii];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    // const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    // let sxx = sxyzlist2[ii][0], syy = sxyzlist[ii][1], szz = sxyzlist[ii][2];
    // let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    // let quat = quatlist[ii];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    // const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    // viRail2Mesh.quaternion.copy(quat);
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH1_, 0),
    pivotB: new CANNON.Vec3(0, sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH1_, 0),
    pivotB: new CANNON.Vec3(0, -sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type2_v_free(x,y,z,rot, color) {
  return gear_type2_v(x,y,z,rot, false, color);
}

export function gear_type2_v_act(x,y,z,rot, color) {
  return gear_type2_v(x,y,z,rot, true, color);
}

export function gear_type2_v(x,y,z,rot, act, color) {
  // ギア（歯車
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  // let sR1 = 3, sH1 = 2, sH1_ = sH1/2;
  let sR1 = 3.5, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 1.05;
  let n2 = 8;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2*1.0;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let y = r2*Math.sin(vrad);
    pxyzlist2.push([x, y, 0]);
  }
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sW2, sD2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  let quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), PI_);
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    // let quat = quatlist[ii];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz),
                         quat);
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viRail2Mesh.quaternion.copy(quat);
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, sH1_),
    pivotB: new CANNON.Vec3(0, 0, sH1_),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, -sH1_),
    pivotB: new CANNON.Vec3(0, 0, -sH1_),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type3_h_free(x,y,z,rot, color) {
  return gear_type3_h(x,y,z,rot, false, color);
}

export function gear_type3_h_act(x,y,z,rot, color) {
  return gear_type3_h(x,y,z,rot, true, color);
}

export function gear_type3_h(x,y,z,rot, act, color) {
  // ギア（歯車
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  let sR1 = 4, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 0.9;
  let n2 = 8;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let z = r2*Math.sin(vrad);
    pxyzlist2.push([x, 0, z]);
  }
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH1_, 0),
    pivotB: new CANNON.Vec3(0, sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH1_, 0),
    pivotB: new CANNON.Vec3(0, -sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type3_h_20_free(x,y,z,rot, color) {
  return gear_type3_h_20(x,y,z,rot, false, color);
}

export function gear_type3_h_20_act(x,y,z,rot, color) {
  return gear_type3_h_20(x,y,z,rot, true, color);
}

export function gear_type3_h_20(x,y,z,rot, act, color) {
  // ギア（歯車
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  let sR1 = 9, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 0.9;
  let n2 = 16;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2*1.0;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let z = r2*Math.sin(vrad);
    pxyzlist2.push([x, 0, z]);
  }
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH1_, 0),
    pivotB: new CANNON.Vec3(0, sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH1_, 0),
    pivotB: new CANNON.Vec3(0, -sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type3_h_40_free(x,y,z,rot, color) {
  return gear_type3_h_40(x,y,z,rot, false, color);
}

export function gear_type3_h_40_act(x,y,z,rot, color) {
  return gear_type3_h_40(x,y,z,rot, true, color);
}

export function gear_type3_h_40(x,y,z,rot, act, color) {
  // ギア（歯車
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  let sR1 = 4+15, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 0.9;
  let n2 = 32;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2*1.0;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let z = r2*Math.sin(vrad);
    pxyzlist2.push([x, 0, z]);
  }
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH1_, 0),
    pivotB: new CANNON.Vec3(0, sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH1_, 0),
    pivotB: new CANNON.Vec3(0, -sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type3_v_free(x,y,z,rot, color) {
  return gear_type3_v(x,y,z,rot, false, color);
}

export function gear_type3_v_act(x,y,z,rot, color) {
  return gear_type3_v(x,y,z,rot, true, color);
}

export function gear_type3_v(x,y,z,rot, act, color) {
  // ギア（歯車
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  let sR1 = 4, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 0.9;
  let n2 = 8;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2*1.0;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let y = r2*Math.sin(vrad);
    pxyzlist2.push([x, y, 0]);
  }
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sW2, sD2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  let quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), PI_);
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    // let quat = quatlist[ii];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz),
                         quat);
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viRail2Mesh.quaternion.copy(quat);
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, sH1_),
    pivotB: new CANNON.Vec3(0, 0, sH1_),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, -sH1_),
    pivotB: new CANNON.Vec3(0, 0, -sH1_),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}



export function gear_type5_h_free(x,y,z,rot, color) {
  return gear_type5_h(x,y,z,rot, false, color);
}

export function gear_type5_h_act(x,y,z,rot, color) {
  return gear_type5_h(x,y,z,rot, true, color);
}

export function gear_type5_h(x,y,z,rot, act, color) {
  // ギア（２枚歯 10/20
  // // let sR1 = 9, sH1 = 2, sH1_ = sH1/2;
  // let sH1 = 2, sH1_ = sH1/2;
  let rlist = [4, 9, 1];
  let hlist = [2, 2, 3];
  let pxyzlist1 = [[0, 5, 0],
                   [0, 0, 0],
                   [0, 2.5, 0]];
  //   球（小：複数）
  let sR2 = 0.9;
  let nlist = [8, 16];
  let pxyzlist2list = [];
  for (let ii = 0; ii < nlist.length; ++ii) {
    let sR1 = rlist[ii];
    let n2 = nlist[ii];
    let y = pxyzlist1[ii][1];
    let vradstep = PI2 / n2;
    let pxyzlist2 = [];
    let r2 = sR1 + sR2;
    for (let i = 0; i < n2; ++i) {
      let vrad = vradstep*i;
      let x = r2*Math.cos(vrad);
      let z = r2*Math.sin(vrad);
      pxyzlist2.push([x, y, z]);
    }
    pxyzlist2list.push(pxyzlist2);
  }
  // 土台（ポール：Y軸）
  let sW2 = 0.1, sH2 = 0.1, sD2 = 5, sD2_ = sD2/2;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, sD2_, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  let adjx2 = blockSize_; let adjy2 = blockSize_+2.5; let adjz2 = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
  }
  // 回転体：中心（円柱）
  for (let ii = 0; ii < rlist.length; ++ii) {
    let sR1 = rlist[ii];
    let sH1 = hlist[ii];
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let iii = 0; iii < pxyzlist2list.length; ++iii) {
    let pxyzlist2 = pxyzlist2list[iii];
    for (let ii = 0; ii < pxyzlist2.length; ++ii) {
      let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
      moCntnrBody.addShape(new CANNON.Sphere(sR2),
                           new CANNON.Vec3(pxx, pyy, pzz));
      const viRail2Geo = new THREE.SphereGeometry(sR2);
      const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
      viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
      viCntnrMesh.add(viRail2Mesh);
    }
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    // const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 1, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
    viBase2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx2, y+adjy2, z+adjz2);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  let adjyY = adjy - adjy2;
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0+adjyY, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sD2_, 0),
    pivotB: new CANNON.Vec3(0, sD2_+adjyY, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sD2_, 0),
    pivotB: new CANNON.Vec3(0, -sD2_+adjyY, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type5_h_r_free(x,y,z,rot, color) {
  return gear_type5_h_r(x,y,z,rot, false, color);
}

export function gear_type5_h_r_act(x,y,z,rot, color) {
  return gear_type5_h_r(x,y,z,rot, true, color);
}

export function gear_type5_h_r(x,y,z,rot, act, color) {
  // ギア（２枚歯 10/20
  // // let sR1 = 9, sH1 = 2, sH1_ = sH1/2;
  // let sH1 = 2, sH1_ = sH1/2;
  let rlist = [9, 4, 1];
  let hlist = [2, 2, 3];
  let pxyzlist1 = [[0, 5, 0],
                   [0, 0, 0],
                   [0, 2.5, 0]];
  //   球（小：複数）
  let sR2 = 0.9;
  let nlist = [16, 8];
  let pxyzlist2list = [];
  for (let ii = 0; ii < nlist.length; ++ii) {
    let sR1 = rlist[ii];
    let n2 = nlist[ii];
    let y = pxyzlist1[ii][1];
    let vradstep = PI2 / n2;
    let pxyzlist2 = [];
    let r2 = sR1 + sR2;
    for (let i = 0; i < n2; ++i) {
      let vrad = vradstep*i;
      let x = r2*Math.cos(vrad);
      let z = r2*Math.sin(vrad);
      pxyzlist2.push([x, y, z]);
    }
    pxyzlist2list.push(pxyzlist2);
  }
  // 土台（ポール：Y軸）
  let sW2 = 0.1, sH2 = 0.1, sD2 = 5, sD2_ = sD2/2;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, sD2_, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  let adjx2 = blockSize_; let adjy2 = blockSize_+2.5; let adjz2 = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
  }
  // 回転体：中心（円柱）
  for (let ii = 0; ii < rlist.length; ++ii) {
    let sR1 = rlist[ii];
    let sH1 = hlist[ii];
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let iii = 0; iii < pxyzlist2list.length; ++iii) {
    let pxyzlist2 = pxyzlist2list[iii];
    for (let ii = 0; ii < pxyzlist2.length; ++ii) {
      let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
      moCntnrBody.addShape(new CANNON.Sphere(sR2),
                           new CANNON.Vec3(pxx, pyy, pzz));
      const viRail2Geo = new THREE.SphereGeometry(sR2);
      const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
      viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
      viCntnrMesh.add(viRail2Mesh);
    }
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    // const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 1, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
    viBase2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx2, y+adjy2, z+adjz2);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  let adjyY = adjy - adjy2;
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0+adjyY, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sD2_, 0),
    pivotB: new CANNON.Vec3(0, sD2_+adjyY, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sD2_, 0),
    pivotB: new CANNON.Vec3(0, -sD2_+adjyY, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}



export function gear_type6_h_free(x,y,z,rot, color) {
  return gear_type6_h(x,y,z,rot, false, color);
}

export function gear_type6_h_act(x,y,z,rot, color) {
  return gear_type6_h(x,y,z,rot, true, color);
}

export function gear_type6_h(x,y,z,rot, act, color) {
  // ギア（歯車＋針
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  let sR1 = 4, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 0.9;
  let n2 = 8;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let z = r2*Math.sin(vrad);
    pxyzlist2.push([x, 0, z]);
  }
  let pxyzlist3 = [[0, 1, -2]];
  let sxyzlist3 = [[0.2, 0.2, 4]];
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.05});
  let viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: "white"});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.05, color: color});
    viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: color});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：針
  {
    let ii = 0;
    let pxx = pxyzlist3[ii][0], pyy = pxyzlist3[ii][1], pzz = pxyzlist3[ii][2];
    let sxx = sxyzlist3[ii][0], syy = sxyzlist3[ii][1], szz = sxyzlist3[ii][2];
    let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr2);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH1_, 0),
    pivotB: new CANNON.Vec3(0, sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH1_, 0),
    pivotB: new CANNON.Vec3(0, -sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type6_h_20_free(x,y,z,rot, color) {
  return gear_type6_h_20(x,y,z,rot, false, color);
}

export function gear_type6_h_20_act(x,y,z,rot, color) {
  return gear_type6_h_20(x,y,z,rot, true, color);
}

export function gear_type6_h_20(x,y,z,rot, act, color) {
  // ギア（歯車＋針
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  let sR1 = 9, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 0.9;
  let n2 = 16;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let z = r2*Math.sin(vrad);
    pxyzlist2.push([x, 0, z]);
  }
  let pxyzlist3 = [[0, 1, -4.5]];
  let sxyzlist3 = [[0.4, 0.2, 9]];
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.05});
  let viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: "white"});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.05, color: color});
    viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: color});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：針
  {
    let ii = 0;
    let pxx = pxyzlist3[ii][0], pyy = pxyzlist3[ii][1], pzz = pxyzlist3[ii][2];
    let sxx = sxyzlist3[ii][0], syy = sxyzlist3[ii][1], szz = sxyzlist3[ii][2];
    let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr2);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH1_, 0),
    pivotB: new CANNON.Vec3(0, sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH1_, 0),
    pivotB: new CANNON.Vec3(0, -sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type6_h_40_free(x,y,z,rot, color) {
  return gear_type6_h_40(x,y,z,rot, false, color);
}

export function gear_type6_h_40_act(x,y,z,rot, color) {
  return gear_type6_h_40(x,y,z,rot, true, color);
}

export function gear_type6_h_40(x,y,z,rot, act, color) {
  // ギア（歯車＋針
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  let sR1 = 4+15, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 0.9;
  let n2 = 32;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let z = r2*Math.sin(vrad);
    pxyzlist2.push([x, 0, z]);
  }
  let pxyzlist3 = [[0, 1, -9.5]];
  let sxyzlist3 = [[0.6, 0.2, 19]];
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.05});
  let viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: "white"});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.05, color: color});
    viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: color});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：針
  {
    let ii = 0;
    let pxx = pxyzlist3[ii][0], pyy = pxyzlist3[ii][1], pzz = pxyzlist3[ii][2];
    let sxx = sxyzlist3[ii][0], syy = sxyzlist3[ii][1], szz = sxyzlist3[ii][2];
    let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr2);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH1_, 0),
    pivotB: new CANNON.Vec3(0, sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH1_, 0),
    pivotB: new CANNON.Vec3(0, -sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type6_h_60_free(x,y,z,rot, color) {
  return gear_type6_h_60(x,y,z,rot, false, color);
}

export function gear_type6_h_60_act(x,y,z,rot, color) {
  return gear_type6_h_60(x,y,z,rot, true, color);
}

export function gear_type6_h_60(x,y,z,rot, act, color) {
  // ギア（歯車＋針
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  let sR1 = 4+25, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 0.9;
  let n2 = 48;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let z = r2*Math.sin(vrad);
    pxyzlist2.push([x, 0, z]);
  }
  let pxyzlist3 = [[0, 1, -14.5]];
  let sxyzlist3 = [[0.6, 0.2, 29]];
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.05});
  let viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: "white"});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.05, color: color});
    viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: color});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：針
  {
    let ii = 0;
    let pxx = pxyzlist3[ii][0], pyy = pxyzlist3[ii][1], pzz = pxyzlist3[ii][2];
    let sxx = sxyzlist3[ii][0], syy = sxyzlist3[ii][1], szz = sxyzlist3[ii][2];
    let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr2);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH1_, 0),
    pivotB: new CANNON.Vec3(0, sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH1_, 0),
    pivotB: new CANNON.Vec3(0, -sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type7_h_free(x,y,z,w, color) {
  return gear_type7_h(x,y,z,w, false, color);
}

export function gear_type7_h_act(x,y,z,w, color) {
  return gear_type7_h(x,y,z,w, true, color);
}

export function gear_type7_h(x,y,z,w, act, color) {
  // ギア（歯車＋針
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  let sR1 = 4, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 0.9;
  let n2 = 8;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let z = r2*Math.sin(vrad);
    pxyzlist2.push([x, 0, z]);
  }
  let pxyzlist3 = [[0, 1, -2]];
  let sxyzlist3 = [[0.2, 0.2, 4]];
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: w,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
    angularDamping: 0.00001, // def=0.01
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: "#808080"});
  let viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: "white"});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
    viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: "white"});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：針
  {
    let ii = 0;
    let pxx = pxyzlist3[ii][0], pyy = pxyzlist3[ii][1], pzz = pxyzlist3[ii][2];
    let sxx = sxyzlist3[ii][0], syy = sxyzlist3[ii][1], szz = sxyzlist3[ii][2];
    let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr2);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  // if (rot != 0) {
  //   moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  //   moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  // }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH1_, 0),
    pivotB: new CANNON.Vec3(0, sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH1_, 0),
    pivotB: new CANNON.Vec3(0, -sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    // if (rot >= 2) {
    //   vspeed = -vspeed;
    // }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type7_h_20_free(x,y,z,w, color) {
  return gear_type7_h_20(x,y,z,w, false, color);
}

export function gear_type7_h_20_act(x,y,z,w, color) {
  return gear_type7_h_20(x,y,z,w, true, color);
}

export function gear_type7_h_20(x,y,z,w, act, color) {
  // ギア（歯車＋針
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  let sR1 = 9, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 0.9;
  let n2 = 16;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let z = r2*Math.sin(vrad);
    pxyzlist2.push([x, 0, z]);
  }
  let pxyzlist3 = [[0, 1, -4.5]];
  let sxyzlist3 = [[0.4, 0.2, 9]];
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: w,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
    angularDamping: 0.00001, // def=0.01
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: "#808080"});
  let viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: "white"});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color: color});
    viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: "white"});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：針
  {
    let ii = 0;
    let pxx = pxyzlist3[ii][0], pyy = pxyzlist3[ii][1], pzz = pxyzlist3[ii][2];
    let sxx = sxyzlist3[ii][0], syy = sxyzlist3[ii][1], szz = sxyzlist3[ii][2];
    let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr2);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  // if (rot != 0) {
  //   moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  //   moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  // }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH1_, 0),
    pivotB: new CANNON.Vec3(0, sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH1_, 0),
    pivotB: new CANNON.Vec3(0, -sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    // if (rot >= 2) {
    //   vspeed = -vspeed;
    // }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}


export function gear_type8_h_free(x,y,z,rot, color) {
  return gear_type8_h(x,y,z,rot, false, color);
}

export function gear_type8_h_act(x,y,z,rot, color) {
  return gear_type8_h(x,y,z,rot, true, color);
}

export function gear_type8_h(x,y,z,rot, act, color) {
  // ギア（歯車＋針
  //   円柱（大）と球（小：複数）で表現
  //   円柱（大）
  let sR1 = 3.5, sH1 = 2, sH1_ = sH1/2;
  let pxyzlist1 = [0, 0, 0];
  //   球（小：複数）
  let sR2 = 1;
  let n2 = 8;
  let vradstep = PI2 / n2;
  let pxyzlist2 = [];
  let r2 = sR1 + sR2;
  for (let i = 0; i < n2; ++i) {
    let vrad = vradstep*i;
    let x = r2*Math.cos(vrad);
    let z = r2*Math.sin(vrad);
    pxyzlist2.push([x, 0, z]);
  }
  let pxyzlist3 = [[0, 1, -2]];
  let sxyzlist3 = [[0.2, 0.2, 4]];
  // 土台（ポール：Y軸）
  let sW2 = 0.1; let sH2 = 0.1; let sD2 = 1;
  let sxyz2list = [[sW2, sD2, sW2]];
  let pxyz2list = [[0, 0, 0]];
  let adjx = blockSize_; let adjy = blockSize_; let adjz = blockSize_;
  // 組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moGearMtr,
  });
  const viCntnrMesh = new THREE.Group();
  let viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5});
  let viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: "white"});
  if (color != undefined) {
    viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: color});
    viRail2Mtr2 = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9, color: color});
  }
  // 回転体：中心（円柱）
  {
    let ii = 0;
    let pxx = pxyzlist1[ii][0], pyy = pxyzlist1[ii][1], pzz = pxyzlist1[ii][2];
    moCntnrBody.addShape(new CANNON.Cylinder(sR1, sR1, sH1, 20),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.CylinderGeometry(sR1, sR1, sH1, 20);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：羽（球）
  for (let ii = 0; ii < pxyzlist2.length; ++ii) {
    let pxx = pxyzlist2[ii][0], pyy = pxyzlist2[ii][1], pzz = pxyzlist2[ii][2];
    moCntnrBody.addShape(new CANNON.Sphere(sR2),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.SphereGeometry(sR2);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 回転体：針
  {
    let ii = 0;
    let pxx = pxyzlist3[ii][0], pyy = pxyzlist3[ii][1], pzz = pxyzlist3[ii][2];
    let sxx = sxyzlist3[ii][0], syy = sxyzlist3[ii][1], szz = sxyzlist3[ii][2];
    let sxx_ = sxx/2, syy_ = syy/2, szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr2);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  let moBase2Body;
  let viBase2Mesh;
  {
    let ii = 0;
    let pxx = pxyz2list[ii][0], pyy = pxyz2list[ii][1], pzz = pxyz2list[ii][2];
    let sxx = sxyz2list[ii][0], syy = sxyz2list[ii][1], szz = sxyz2list[ii][2];
    let sxx_ = sxx/2; let syy_ = syy/2; let szz_ = szz/2;
    moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moBase2Body.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    moBase2Body.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viBase2Mesh.position.copy(moBase2Body.position);
  viBase2Mesh.quaternion.copy(moBase2Body.quaternion);
  world.addBody(moBase2Body);
  scene.add(viBase2Mesh);
  // 風車の動きの制約（ヒンジで繋ぐ：３か所で固定。１か所だけでは壊れる
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: false,  // 軸と風車がすり抜けるように
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, sH1_, 0),
    pivotB: new CANNON.Vec3(0, sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moBase2Body, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -sH1_, 0),
    pivotB: new CANNON.Vec3(0, -sH1_, 0),
    collideConnected: false,
  });
  world.addConstraint(hingeConst3);
  if (act) {
    // 動力を付与
    let vspeed = 0.2
    if (rot >= 2) {
      vspeed = -vspeed;
    }
    hingeConst.enableMotor();
    hingeConst.setMotorSpeed(vspeed);
    hingeConst2.enableMotor();
    hingeConst2.setMotorSpeed(vspeed);
    hingeConst3.enableMotor();
    hingeConst3.setMotorSpeed(vspeed);
  }
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  })
  let rval = {'hinge':[hingeConst, hingeConst2, hingeConst3]};
  return rval;
}

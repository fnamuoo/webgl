// mode:javascript

import * as THREE from "three";
import * as CANNON from "cannon";

var world;
var scene;

// ブロックサイズ
var blockSize = 10;
var blockSize_ = blockSize/2;

// レールの幅・間隔
var railIntr = 6;
var railIntr_ = railIntr/2;

// レールの余白 (=2)
var railPad = (blockSize-railIntr)/2;
var railPad_ = railPad/2;

// レールを45度傾けた場合の..
var blockSizeR45 = blockSize*1.414;
var blockSizeR45_ = blockSizeR45/2;
// レールの幅・間隔
var railIntrR45 = railIntr*1.414;
var railIntrR45_ = railIntrR45/2;
// レールの余白 (=..)
var railPadR45 = (blockSize-railIntrR45)/2;
var railPadR45_ = railPadR45/2;

// ガードレールの高さ
var gardH = railIntr_;

// ボール半径
// var ballR = 4;
var ballR = 3;


// 定数
var PI_ = Math.PI/2;
var PI2 = Math.PI*2;


// moBallMtr.restitution = 1;  // 反発係数 1:跳ねやすい  /  0:跳ねない
const moBallMtr = new CANNON.Material({name: 'ball', restitution: 0});
const moRailMtr = new CANNON.Material({name: 'rail'});

function rnorm() {
    return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
}
export function init0(world_, scene_) {
    world = world_;
    scene = scene_;
}

export function init(world_, scene_, dataInfoList) {
    init0(world_, scene_);

    dataInfoList.forEach(dinfo => {
        var dtype = dinfo[0];
        var x = dinfo[1];
        var y = dinfo[2];
        var z = dinfo[3];
        var rot = (dinfo.length >= 5) ? dinfo[4] : undefined;
        if (dtype == "ball") {
            Ball_00_glb(x, y, z);
        } else if (dtype == "rail_st") {
            Rail_04(x, y, z, rot);
        } else if (dtype == "rail_st_R45") { // 直線（ななめR45)
            Rail_10(x, y, z, rot);
        } else if (dtype == "rail_st_R45_2") { // 直線（ななめR45)
            Rail_11_2(x, y, z, rot);
        } else if (dtype == "rail_st_R45_r") { // 直線（ななめR45)・反転
            Rail_11(x, y, z, rot);
        } else if (dtype == "rail_st_slope") { // 坂・直線
            Rail_05(x, y, z, rot);
        } else if (dtype == "rail_st_slope_arc") { // 坂・曲線
            Rail_06(x, y, z, rot);
        } else if (dtype == "rail_st_slope_arc_s") {  // 坂・曲線・高さ半分
            Rail_06_2(x, y, z, rot);
        } else if (dtype == "rail_st_shift_line") {   // 直進（ラインをずらす）
            Rail_04_2(x, y, z, rot);
        } else if (dtype == "rail_st_shift_line2") {  // 直進（ラインをずらす・反転）
            Rail_04_3(x, y, z, rot);
        } else if (dtype == "rail_arc_s") {  // ９０度カーブ(s)
            Rail_07(x, y, z, rot);
        } else if (dtype == "rail_arc_m") {  // ９０度カーブ(m)
            Rail_08(x, y, z, rot);
        } else if (dtype == "rail_arc_m2") {  // ９０度カーブ(m):緻密さを10倍に
            Rail_08_2(x, y, z, rot);
        } else if (dtype == "rail_arc_l") {  // ９０度カーブ(l)
            Rail_09(x, y, z, rot);
        } else if (dtype == "rail_arc_R45") {  // 直線（ななめR45）
            Rail_12(x, y, z, rot);
        } else if (dtype == "rail_arc_R45_r") {  // 直線（ななめR45反転）
            Rail_13(x, y, z, rot);
        } else if (dtype == "join_R45") {  // 合流：卜型
            Join_00(x, y, z, rot);
        } else if (dtype == "join_R45_r") {  // 合流：卜型・反転
            Join_01(x, y, z, rot);
        } else if (dtype == "funnel_sq") { // 漏斗、渦巻
            Funnel_00(x, y, z, rot);
        } else if (dtype == "funnel_sq_r") { // 漏斗、渦巻(逆巻き)
            Funnel_01(x, y, z, rot);
        } else if (dtype == "funnel_plt_s") {  // 漏斗、平板
            Funnel_02(x, y, z, rot);
        } else if (dtype == "funnel_plt_m") {
            Funnel_03(x, y, z, rot);
        } else if (dtype == "funnel_plt_m_c") {  // 漏斗、平板（隅に穴
            Funnel_04(x, y, z, rot);
        } else if (dtype == "up_s") {      // ９０度アップ
            Up_00(x, y, z, rot);
        } else if (dtype == "updown_s") {  // １８０度アップ (半径:blockSize-2=8)
            UpDown_00(x, y, z, rot);
        } else if (dtype == "updown_s2") {  // １８０度アップ (半径:blockSize)
            UpDown_01(x, y, z, rot);
        } else if (dtype == "down_s") {    // ９０度ダウン
            Down_00(x, y, z, rot);
        } else if (dtype == "vloop_s") {   // 縦ループ
            VLoop_00(x, y, z, rot);
        } else if (dtype == "vloop_m") {
            VLoop_01(x, y, z, rot);
        } else if (dtype == "hloop_s") {   // 横ループ
            HLoop_00(x, y, z, rot);
        } else if (dtype == "hloop_m") {
            HLoop_01(x, y, z, rot);
        } else if (dtype == "fork_v") {
            ForkV_00(x, y, z, rot);
        } else if (dtype == "fork_v2") {
            ForkV_01(x, y, z, rot);
        } else if (dtype == "fork_h") {
            ForkH_00(x, y, z, rot);
        } else if (dtype == "cross") {
            Cross_00(x, y, z, rot);
        } else if (dtype == "cross_R45") {
            Cross_01(x, y, z, rot);
        } else if (dtype == "cross2") {  // レール　十字
            Cross_02(x, y, z, rot);
        } else if (dtype == "cross2_R45") {
            Cross_03(x, y, z, rot);
        } else if (dtype == "windmill_h") {
            Windmill_00(x, y, z, rot);
        } else if (dtype == "windmill_v") {
            Windmill_01(x, y, z, rot);
        } else if (dtype == "windmill_h2") {
            Windmill_02(x, y, z, rot);
        } else if (dtype == "windmill_v2") {
            Windmill_03(x, y, z, rot);
        } else if (dtype == "windmill_h3") {
            Windmill_04(x, y, z, rot);
        } else if (dtype == "windmill_v3") {
            Windmill_05(x, y, z, rot);
        }
    });


  const ball_rail = new CANNON.ContactMaterial(moBallMtr, moRailMtr, {
    friction: 0.0001,  // 摩擦係数(def=0.3)
    // restitution: 0.3,  // 反発係数 (def=0.3)
    restitution: 0.01,  // 反発係数 (def=0.3) 反発が小さい方がレールがガタガタでもそれなりに滑ってくれる
    // restitution: 0.001,  // 反発係数 (def=0.3) 反発が小さい方がレールがガタガタでもそれなりに滑ってくれる
    contactEquationStiffness: 1e7,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(ball_rail)
}

var moBallBodyVecGlb = [];
var viBallMeshVecGlb = [];

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
  moBallBodyVec_ = [];
  viBallMeshVec_ = [];

  // constructor(scene, world, x, y, z, nmaxball, p, ballType) {
  constructor(x, y, z, nmaxball, p, ballType) {
    var adjx = 5; var adjy = 5; var adjz = 5;
    x += adjx; y += adjy; z += adjz;
    // this.scene_ = scene;
    // this.world_ = world;
    this.x_ = x;
    this.y_ = y;
    this.z_ = z;
    this.nmaxball_ = nmaxball;
    this.p_ = p;
    this.ballType_ = ballType;
    this.pg_ = new CANNON.Vec3(x, y, z);
    this.init()
  }

  init() {
    var sx = 10; var sy = 10; var sz = 10;
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
    var bfind = false; // 近傍にボールがあるかの判定
    for (var i = 0; i < this.moBallBodyVec_.length; ++i) {
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
    // var x = this.x_ + Math.random()*2-1;
    // var y = this.y_ + Math.random()*2-1;
    // var z = this.z_ + Math.random()*2-1;
    var x = this.x_ + rnorm()/2;
    var y = this.y_ + rnorm()/2;
    var z = this.z_ + rnorm()/2;
    // var x = this.x_;
    // var y = this.y_;
    // var z = this.z_;
    if (this.ballType_ == 0) {
      var {moBallBody, viBallMesh} = Ball_00(x, y, z);
    } else if (this.ballType_ == 1) {
      var {moBallBody, viBallMesh} = Ball_01(x, y, z);
    } else if (this.ballType_ == 2) {
      var icolor = this.moBallBodyVec_.length;
      var {moBallBody, viBallMesh} = Ball_02(x, y, z, icolor);
    } else {
      var {moBallBody, viBallMesh} = Ball_00(x, y, z);
    }
    this.moBallBodyVec_.push(moBallBody);
    this.viBallMeshVec_.push(viBallMesh);
    // イベントリスナ―内から参照できるよう this を持たせておく
    moBallBody.src_ = this;
  }

  repop(moBall) {
    // ボールの再発生
    //   リサイクルボックス／場外に消えたボールを再利用して popさせる
    // var p = new CANNON.Vec3(this.pg_.x, this.pg_.y, this.pg_.z);
    // var p = new CANNON.Vec3(this.pg_.x + Math.random()*2-1,
    //                         this.pg_.y + Math.random()*2-1,
    //                         this.pg_.z + Math.random()*2-1);
    var p = new CANNON.Vec3(this.pg_.x + rnorm()/2,
                            this.pg_.y + rnorm()/2,
                            this.pg_.z + rnorm()/2);

    var bok = false;
    var iloopDbg = 0;
    while (bok == false) {
      iloopDbg += 1;
      if (iloopDbg > 100) {
        break;
      }
      var bfind = false; // 近傍にボールがあるかの判定
      for (var i = 0; i < this.moBallBodyVec_.length; ++i) {
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

export class RecycleBox_00 {
  // リサイクルボックス
  // 生成したボールの回収。これに衝突したらボールを削除する
  // scene_;
  // world_;
  x_;
  y_;
  z_;
  src_;

  // constructor(scene, world, x, y, z, src) {
  constructor(x, y, z, src) {
    var adjx = 5; var adjy = 5; var adjz = 5;
    x += adjx; y += adjy; z += adjz;
    // this.scene_ = scene;
    // this.world_ = world;
    this.x_ = x;
    this.y_ = y;
    this.z_ = z;
    this.src_ = src;
    this.init()
  }

  init() {
    const moRecycleBox2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Particle(),
        position: new CANNON.Vec3(this.x_, this.y_, this.z_),
//        material: moRailMtr,
        isTrigger: true,
       });
    world.addBody(moRecycleBox2Body);
    var sx = 15; var sy = 15; var sz = 15;
    const viRecycleBox2Geo = new THREE.BoxGeometry(sx, sy, sz);
    const viRecycleBox2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8, color: 0x000000});
    const viRecycleBox2Mesh = new THREE.Mesh(viRecycleBox2Geo, viRecycleBox2Mtr);
    viRecycleBox2Mesh.position.copy(new THREE.Vector3(this.x_, this.y_, this.z_));
    scene.add(viRecycleBox2Mesh);
    moRecycleBox2Body.addEventListener("collide", this.hitevent);
  }

  // 衝突時のイベント用の関数
  //   メンバであっても this が使えないので注意
  hitevent (e) {
    var moRBox = e.contact.bi;
    var moBall = e.contact.bj;
    if (moBall.mass == 0) {
      [moRBox, moBall] = [moBall, moRBox];
    }
    // Source の repop() に丸投げ
    moBall.src_.repop(moBall);
  }
}

export class Accelerator_00 {
  // 加速器
  x_;
  y_;
  z_;
  dir_;  // 加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
  implus_;  // 衝撃

  constructor(x, y, z, rot, implus) {
    this.x_ = x;
    this.y_ = y;
    this.z_ = z;
    this.implus_ = implus;
    if (rot == 0) {
      this.dir_ = new CANNON.Vec3(this.implus_, 0, 0);
    } else if (rot == 1) {
      this.dir_ = new CANNON.Vec3(0, 0, this.implus_);
    } else if (rot == 2) {
      this.dir_ = new CANNON.Vec3(-this.implus_, 0, 0);
    } else if (rot == 3) {
      this.dir_ = new CANNON.Vec3(0, 0, -this.implus_);
    } else if (rot == 4) {
      this.dir_ = new CANNON.Vec3(0, this.implus_, 0);
    } else if (rot == 5) {
      this.dir_ = new CANNON.Vec3(0, -this.implus_, 0);
    } else {
      this.dir_ = new CANNON.Vec3(1, 0, 0);
    }
    this.init()
  }

  init() {
    const moAcc2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Particle(),
        position: new CANNON.Vec3(this.x_, this.y_, this.z_),
        isTrigger: true,
       });
    world.addBody(moAcc2Body);
    // 力の方向を単位ベクトル化
    var udir = this.dir_.unit();
    // 四角すいが上向きなので、その向きのベクトルを用意
    var vidir = new CANNON.Vec3(0, 1, 0);
    // ２ベクトル間のクォータニオンを取って姿勢の向きとする
    var vquat = new CANNON.Quaternion().setFromVectors(vidir, udir);
    var srad = 1; var shigh = 3; var srseg= 4;
    const viAcc2Geo = new THREE.ConeGeometry(srad, shigh, srseg);
    const viAcc2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8, color: 0xff0000});
    const viAcc2Mesh = new THREE.Mesh(viAcc2Geo, viAcc2Mtr);
    viAcc2Mesh.position.copy(new THREE.Vector3(this.x_, this.y_, this.z_));
    viAcc2Mesh.quaternion.copy(vquat);
    scene.add(viAcc2Mesh);
    // 衝突イベントを紐づけ
    moAcc2Body.addEventListener("collide", this.hitevent);
    // イベントリスナ―内から参照できるよう this を持たせておく
    moAcc2Body.acc_=this;
  }

  // 衝突時のイベント用の関数
  //   メンバであっても this が使えないので注意
  hitevent (e) {
    var moAcc  = e.contact.bi;
    var moBall = e.contact.bj;
    if (moBall.mass == 0) {
      [moAcc, moBall] = [moBall, moAcc];
    }
    moBall.applyImpulse(moAcc.acc_.dir_);
  }
}

export class Accelerator_01 {
  // 加速器（任意の方向）
  // scene_;
  // world_;
  x_;
  y_;
  z_;
  dir_;  // 加速方向ベクトル
  implus_;  // 衝撃

  constructor(x, y, z, vx, vy, vz, implus, color) {
    this.x_ = x;
    this.y_ = y;
    this.z_ = z;
    this.dir_ = new CANNON.Vec3(vx, vy, vz);
    this.implus_ = implus;
    this.color_ = color;
    this.init()
  }

  init() {
    const moAcc2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Particle(),
        position: new CANNON.Vec3(this.x_, this.y_, this.z_),
        isTrigger: true,
       });
    world.addBody(moAcc2Body);
    var udir = this.dir_.unit();
    var vidir = new CANNON.Vec3(0, 1, 0);
    var vquat = new CANNON.Quaternion().setFromVectors(vidir, udir);
    var srad = 1; var shigh = 3; var srseg= 4;
    const viAcc2Geo = new THREE.ConeGeometry(srad, shigh, srseg);
    var viAcc2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8, color: 0xff0000});
    if (this.color_ != null) {
      var viAcc2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8, color: this.color_});
    }
    const viAcc2Mesh = new THREE.Mesh(viAcc2Geo, viAcc2Mtr);
    viAcc2Mesh.position.copy(new THREE.Vector3(this.x_, this.y_, this.z_));
    viAcc2Mesh.quaternion.copy(vquat);
    scene.add(viAcc2Mesh);
    moAcc2Body.addEventListener("collide", this.hitevent);
    // イベントリスナ―内から参照できるよう this を持たせておく
    moAcc2Body.acc_=this;
    // dir_ を方向（単位ベクトル）＊implus の値にしておく
    this.dir_ = udir.scale(this.implus_);
  }

  // 衝突時のイベント用の関数
  //   メンバであっても this が使えないので注意
  hitevent (e) {
    var moAcc  = e.contact.bi;
    var moBall = e.contact.bj;
    if (moBall.mass == 0) {
      [moAcc, moBall] = [moBall, moAcc];
    }
    moBall.applyImpulse(moAcc.acc_.dir_);
  }
}


export class Deccelerator_00 {
  // 減速器
  x_;
  y_;
  z_;
  rate_;  // 吸収率

  constructor(x, y, z, rate) {
    this.x_ = x;
    this.y_ = y;
    this.z_ = z;
    this.rate_ = rate;
    this.init();
  }

  init() {
    const moAcc2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Particle(),
        position: new CANNON.Vec3(this.x_, this.y_, this.z_),
        isTrigger: true,
       });
    world.addBody(moAcc2Body);
    const radius = 1;
    const viAcc2Geo = new THREE.SphereGeometry(radius);
    const viAcc2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8, color: 0x000000});
    const viAcc2Mesh = new THREE.Mesh(viAcc2Geo, viAcc2Mtr);
    viAcc2Mesh.position.copy(new THREE.Vector3(this.x_, this.y_, this.z_));
    scene.add(viAcc2Mesh);
    moAcc2Body.addEventListener("collide", this.hitevent);
    // イベントリスナ―内から参照できるよう this を持たせておく
    moAcc2Body.dcc_=this;
  }

  // 衝突時のイベント用の関数
  //   メンバであっても this が使えないので注意
  hitevent (e) {
    var moDcc  = e.contact.bi;
    var moBall = e.contact.bj;
    if (moBall.mass == 0) {
      [moDcc, moBall] = [moBall, moDcc];
    }
    var v = moBall.velocity;
    v = v.scale(moDcc.dcc_.rate_);
    moBall.velocity.copy(v);
  }
}

export class Elevator_00 {
  // エレベータ
  // - 上向きに加速するオブジェを内部に配置して、押し上げるエレベータ
  // - 勢いよく飛び出ることが多い
  // - 実装が簡単だけど動きがSFちっく。
  // - 見た目、勝手に上昇しているような感じ
  // - 機械的な動きにはちょっとほど遠い
  x_;
  y_;
  z_;
  h_;

  constructor(x, y, z, h) {
    this.x_ = x;
    this.y_ = y;
    this.z_ = z;
    this.h_ = h;
    this.init()
  }

  init() {
    // var sx = blockSize; var sy = this.h_; var sz = blockSize;
    var sx = 1; var sy = 1; var sz = 1;
    var sx_ = sx/2; var sy_ = sy/2; var sz_ = sz/2;
    var px = this.x_; var py = this.y_ + this.h_/2; var pz = this.z_;
    var pxx = this.x_; var pzz = this.z_;
    var impmin = 20; var impstep = -15; var impini = 60;
    // var pymin = this.y_ - this.h_/2 + blockSize_; 
    // var pymax = this.y_ + this.h_/2;
    var pyymin = this.y_ + blockSize_/2; 
    var pyymax = this.y_ + this.h_ - blockSize_;
    var pyystep = blockSize_;
    var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_; var rot = 0;

    var imp = impini;
    for (var pyy = pyymin; pyy <= pyymax; pyy += pyystep) {
      const moObj2Body = new CANNON.Body
        ({mass: 0,
          shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
          position: new CANNON.Vec3(pxx+adjx, pyy+adjy, pzz+adjz),
          isTrigger: true,
         });
      world.addBody(moObj2Body);
      const viObj2Geo = new THREE.BoxGeometry(sx, sy, sz);
      const viObj2Mtr = new THREE.MeshBasicMaterial({color: 0xa0a0a0, transparent: true, opacity: 0.2});
      const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
      viObj2Mesh.position.copy(moObj2Body.position);
      scene.add(viObj2Mesh);
      moObj2Body.imp_ = imp;
      moObj2Body.addEventListener("collide", (event) => {
        var moBall = event.contact.bi;
        var moElv  = event.contact.bj;
        if (moBall.mass == 0) {
          [moBall, moElv] = [moElv, moBall];
        }
        var p = moBall.position;
        moBall.applyImpulse(new CANNON.Vec3(0, moElv.imp_, 0));
        // moBall.applyImpulse(new CANNON.Vec3(0, 50, 0));
      });
      var imp = Math.max(imp + impstep, impmin);
    }

    // エレベータの外枠
    var sx = blockSize; var sy = this.h_; var sz = blockSize;
    var pxyzlist = [[-blockSize_, -blockSize_, 0          ], // west
                    [0          , 0          , +blockSize_], // south
                    [+blockSize_, +blockSize_, 0          ], // east
                    [0          , 0          , -blockSize_], // north
                    ];
    var sxyzlist = [[0.1      , sy-blockSize, blockSize], // west
                    [blockSize, sy          , 0.1      ], // south
                    [0.1      , sy-blockSize, blockSize], // east
                    [blockSize, sy          , 0.1      ], // north
                    ]
    const moCntnrBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 0, 0),
      material: moRailMtr,
    });
    const viCntnrMesh = new THREE.Group();
    for (var ii = 0; ii < pxyzlist.length; ++ii) {
      var pxx = pxyzlist[ii][0]; var pyy = pxyzlist[ii][1]; var pzz = pxyzlist[ii][2];
      var sxx = sxyzlist[ii][0]; var syy = sxyzlist[ii][1]; var szz = sxyzlist[ii][2];
      var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
      moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                           new CANNON.Vec3(pxx, pyy, pzz));
      const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
      // const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.01, wireframe:true});
      const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
      const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
      viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
      viCntnrMesh.add(viObj2Mesh);
    }
    var pxyzlist = [[0, sy/2, 0], // top
                    [0, -sy/2, 0], // bottom
                    ];
    var sxyzlist = [[blockSize, 0.1, blockSize], // top
                    [blockSize, 0.1, blockSize], // bottom
                    ]
    var quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, -1), 0.6);
    for (var ii = 0; ii < pxyzlist.length; ++ii) {
      var pxx = pxyzlist[ii][0]; var pyy = pxyzlist[ii][1]; var pzz = pxyzlist[ii][2];
      var sxx = sxyzlist[ii][0]; var syy = sxyzlist[ii][1]; var szz = sxyzlist[ii][2];
      var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
      moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                           new CANNON.Vec3(pxx, pyy, pzz),
                           quat);
      const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
      // const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.01, wireframe:true});
      const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
      const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
      viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
      viObj2Mesh.quaternion.copy(quat);
      viCntnrMesh.add(viObj2Mesh);
    }
    moCntnrBody.position = new CANNON.Vec3(px+adjx, py+adjy, pz+adjz);
    if (rot != 0) {
      moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    }
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
    world.addBody(moCntnrBody);
    scene.add(viCntnrMesh);
  }
}


export class Elevator_01 {
  // エレベータ
  // - 上昇用のプレートを配置して、動かす版
  // - メカニカル
  // - 実装が面倒..
  x_;
  y_;
  z_;
  h_;

  constructor(x, y, z, h, rot) {
    this.x_ = x;
    this.y_ = y;
    this.z_ = z;
    this.h_ = h;
    this.rot_ = rot;
    this.vspeed_ = 0.05;
    this.init()
  }

  init() {
    var sx = blockSize; var sy = 0.01; var sz = blockSize;
    var sx_ = sx/2; var sy_ = sy/2; var sz_ = sz/2;
    var px = this.x_; var py = this.y_ + this.h_/2; var pz = this.z_;
    var pxx = this.x_; var pzz = this.z_;
    var rot = this.rot_;
    // var impmin = 20; var impstep = -15; var impini = 60;
    // var pymin = this.y_ - this.h_/2 + blockSize_; 
    // var pymax = this.y_ + this.h_/2;
    var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
    var pyymin = this.y_ - blockSize_;
    var pyymax = pyymin + Math.floor(this.h_/blockSize+1)*blockSize;
    var pyystep = blockSize;
    this.pymin_ = pyymin;
    this.pymax_ = pyymax;
    var qplate = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), 0.2);
    if (rot == 1) {
      var qplate = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), 0.2);
    } else if (rot == 2) {
      var qplate = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, -1), 0.2);
    } else if (rot == 3) {
      var qplate = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), 0.2);
    }

    // 内部の移動するプレート
    this.moPlateList_ = [];
    this.viPlateList_ = [];
    for (var pyy = pyymin; pyy <= pyymax; pyy += pyystep) {
      const moObj2Body = new CANNON.Body
        ({mass: 0,
          shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
          position: new CANNON.Vec3(pxx+adjx, pyy, pzz+adjz),
          quaternion: qplate
         });
      world.addBody(moObj2Body);
      const viObj2Geo = new THREE.BoxGeometry(sx, sy, sz);
      const viObj2Mtr = new THREE.MeshBasicMaterial({color: 0xa0a0a0, transparent: true, opacity: 0.2});
      const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
      viObj2Mesh.position.copy(moObj2Body.position);
      viObj2Mesh.quaternion.copy(moObj2Body.quaternion);
      scene.add(viObj2Mesh);
      this.moPlateList_.push(moObj2Body);
      this.viPlateList_.push(viObj2Mesh);
    }

    const moCntnrBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 0, 0),
      material: moRailMtr,
    });
    const viCntnrMesh = new THREE.Group();

    // エレベータの外枠
    var sx = blockSize; var sy = this.h_; var sz = blockSize;
    var pxyzlist = [[-blockSize_, -blockSize_, 0          ], // west
                    [0          , 0          , +blockSize_], // south
                    [+blockSize_, +blockSize_, 0          ], // east
                    [0          , 0          , -blockSize_], // north
                    ];
    var sxyzlist = [[0.1      , sy-blockSize, blockSize], // west
                    [blockSize, sy          , 0.1      ], // south
                    [0.1      , sy-blockSize, blockSize], // east
                    [blockSize, sy          , 0.1      ], // north
                    ]
    for (var ii = 0; ii < pxyzlist.length; ++ii) {
      var pxx = pxyzlist[ii][0]; var pyy = pxyzlist[ii][1]; var pzz = pxyzlist[ii][2];
      var sxx = sxyzlist[ii][0]; var syy = sxyzlist[ii][1]; var szz = sxyzlist[ii][2];
      var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
      moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                           new CANNON.Vec3(pxx, pyy, pzz));
      const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
//      const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.01, wireframe:true});
      const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
      const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
      viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
      viCntnrMesh.add(viObj2Mesh);
    }
    var pxyzlist = [[0, sy/2, 0], // top
                    [0, -sy/2-2, 0], // bottom
                    ];
    var sxyzlist = [[blockSize, 0.1, blockSize], // top
                    [blockSize, 0.1, blockSize], // bottom
                    ]
    var quatlist = [new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -0.6),
                    new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), 0.2),
                    ]
    for (var ii = 0; ii < pxyzlist.length; ++ii) {
      var pxx = pxyzlist[ii][0]; var pyy = pxyzlist[ii][1]; var pzz = pxyzlist[ii][2];
      var sxx = sxyzlist[ii][0]; var syy = sxyzlist[ii][1]; var szz = sxyzlist[ii][2];
      var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
      var quat = quatlist[ii];
      moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                           new CANNON.Vec3(pxx, pyy, pzz),
                           quat);
      const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
      const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.01, wireframe:true});
//      const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
      const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
      viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
      viObj2Mesh.quaternion.copy(quat);
      viCntnrMesh.add(viObj2Mesh);
    }
    moCntnrBody.position = new CANNON.Vec3(px+adjx, py+adjy, pz+adjz);
    if (rot != 0) {
      moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
    }
    viCntnrMesh.position.copy(moCntnrBody.position);
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
    world.addBody(moCntnrBody);
    scene.add(viCntnrMesh);
  }

  act() {
    for (var ii = 0; ii < this.moPlateList_.length; ++ii) {
      var p = this.moPlateList_[ii].position;
      p.y = (p.y + this.vspeed_);
      if (p.y >= this.pymax_) {
        p.y = this.pymin_;
      }
      this.moPlateList_[ii].position.copy(new CANNON.Vec3(p.x, p.y, p.z));
      this.viPlateList_[ii].position.copy(this.moPlateList_[ii].position);
      this.viPlateList_[ii].quaternion.copy(this.moPlateList_[ii].quaternion);
    }
  }
}

export function Ball_00_glb(x,y,z) {
  // 球
  //   グローバルで生成、テスト用
  var {moBallBody, viBallMesh} = Ball_00(x,y,z);
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
  var vcolor = new THREE.Color(colorlist[icolor % colorlist.length]);
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

export function Rail_00(x,y,z) {
    // レール　直進　水平　10x10x10
    //   細い直方体２本で表現
    var sx = 10; var sy = 1; var sz = 1;
    var sx_ = sx/2; var sy_ = sy/2; var sz_ = sz/2;
    // var px = 0; var py = 0; var pz = railIntr/2;  // 原点を部品の中心位置としたときのレール位置の中心
    var px = 0; var py = 0; var pz = railIntr_;
    var adjx = 5; var adjy = 5; var adjz = 5;
    {
      const moRailA2Body = new CANNON.Body
        ({mass: 0,
          shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
          position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z+pz+adjz),
          material: moRailMtr,
         });
      world.addBody(moRailA2Body);
      const viRailA2Geo = new THREE.BoxGeometry(sx, sy, sz);
      const viRailA2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
      const viRailA2Mesh = new THREE.Mesh(viRailA2Geo, viRailA2Mtr);
      scene.add(viRailA2Mesh);
      viRailA2Mesh.position.copy(moRailA2Body.position);
      viRailA2Mesh.quaternion.copy(moRailA2Body.quaternion);
    }
    {
      const moRailB2Body = new CANNON.Body
        ({mass: 0,
          shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
          position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z-pz+adjz),
          material: moRailMtr,
         });
      world.addBody(moRailB2Body);
      const viRailB2Geo = new THREE.BoxGeometry(sx, sy, sz);
      const viRailB2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1});
      const viRailB2Mesh = new THREE.Mesh(viRailB2Geo, viRailB2Mtr);
      scene.add(viRailB2Mesh);
      viRailB2Mesh.position.copy(moRailB2Body.position);
      viRailB2Mesh.quaternion.copy(moRailB2Body.quaternion);
    }
  }

export function Rail_01(x,y,z) {
    // レール　直進　傾斜　20x10x10　角度 atan(1/2)
    //   細い直方体２本で表現
    // var sx = 10*Math.sqrt(5); var sy = 1; var sz = 1; var ang=Math.atan(1/2);
    // 本来なら10だが、重なった部分がちらつくので、ちょい縮める
    var sx = 9.8*Math.sqrt(5); var sy = 1; var sz = 1; var ang=Math.atan(1/2);
    var sx_ = sx/2; var sy_ = sy/2; var sz_ = sz/2;
    var px = 0; var py = 0; var pz = railIntr_; // railIntr/2;
    var adjx = 10; var adjy = 10; var adjz = 5;  // 低い側を原点側としたときの座標補正
    var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
    {
      const moRailA2Body = new CANNON.Body
        ({mass: 0,
          shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
          position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z+pz+adjz),
          quaternion: railQuat,
          material: moRailMtr,
         });
      world.addBody(moRailA2Body);
      const viRailA2Geo = new THREE.BoxGeometry(sx, sy, sz);
      const viRailA2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
      const viRailA2Mesh = new THREE.Mesh(viRailA2Geo, viRailA2Mtr);
      scene.add(viRailA2Mesh);
      viRailA2Mesh.position.copy(moRailA2Body.position);
      viRailA2Mesh.quaternion.copy(moRailA2Body.quaternion);
    }
    {
      const moRailB2Body = new CANNON.Body
        ({mass: 0,
          shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
          position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z-pz+adjz),
          quaternion: railQuat,
          material: moRailMtr,
         });
      world.addBody(moRailB2Body);
      const viRailB2Geo = new THREE.BoxGeometry(sx, sy, sz);
      const viRailB2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1});
      const viRailB2Mesh = new THREE.Mesh(viRailB2Geo, viRailB2Mtr);
      scene.add(viRailB2Mesh);
      viRailB2Mesh.position.copy(moRailB2Body.position);
      viRailB2Mesh.quaternion.copy(moRailB2Body.quaternion);
    }
  }


export function Rail_02(x,y,z) {
    // レール　直進　傾斜　20x10x10
    //   細い直方体２本で表現、傾斜をsin波で作る[-PI/2, PI/2]の範囲で
    var dx = 20; var dy = 10; var dx_ = dx/2; var dy_ = dy/2;
    var ndiv = 20;
    var xxlist = [];
    var yylist = [];
    for (var i = 0; i < ndiv+1; ++i) {
        var xx = i/ndiv*dx - dx_;
        var vrad = i/ndiv*Math.PI - PI_;
        var yy = Math.sin(vrad)*dy_;
        xxlist.push(xx);
        yylist.push(yy);
    }
    var sy = 1; var sz = 1;
    var sy_ = sy/2; var sz_ = sz/2;
    var pz = railIntr_; // railIntr/2;
    var adjx = 10; var adjy = 10; var adjz = 5;
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xxlist[i]; var yy1 = yylist[i];
      var xx2 = xxlist[i+1]; var yy2 = yylist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (yy1-yy2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var ang=Math.atan((yy1-yy2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
      {
        const moRailA2Body = new CANNON.Body
          ({mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
            position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z+pz+adjz),
            quaternion: railQuat,
            material: moRailMtr,
           });
        world.addBody(moRailA2Body);
        const viRailA2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRailA2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        const viRailA2Mesh = new THREE.Mesh(viRailA2Geo, viRailA2Mtr);
        scene.add(viRailA2Mesh);
        viRailA2Mesh.position.copy(moRailA2Body.position);
        viRailA2Mesh.quaternion.copy(moRailA2Body.quaternion);
      }
      {
        const moRailB2Body = new CANNON.Body
          ({mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
            position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z-pz+adjz),
            quaternion: railQuat,
            material: moRailMtr,
           });
        world.addBody(moRailB2Body);
        const viRailB2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRailB2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1});
        const viRailB2Mesh = new THREE.Mesh(viRailB2Geo, viRailB2Mtr);
        scene.add(viRailB2Mesh);
        viRailB2Mesh.position.copy(moRailB2Body.position);
        viRailB2Mesh.quaternion.copy(moRailB2Body.quaternion);
      }
    }
}

export function Rail_03(x,y,z) {
    // レール　左右曲（小径）　10x10x10
    //   細い直方体２本で表現
    var rinn = (10 - railIntr)/2; // 内側の半径
    var rout = (10 + railIntr)/2; // 外側の半径
    var ndiv = 10;  // 円弧（９０度）の分割数
    var xxadj = -5;
    var zzadj = -5;
    var xxinnlist = [];
    var zzinnlist = [];
    var xxoutlist = [];
    var zzoutlist = [];
    for (var i = 0; i < ndiv+1; ++i) {
        var vrad = i/ndiv*PI_;
        var xx = Math.cos(vrad);
        var zz = Math.sin(vrad);
        xxinnlist.push(xx*rinn+xxadj);
        zzinnlist.push(zz*rinn+zzadj);
        xxoutlist.push(xx*rout+xxadj);
        zzoutlist.push(zz*rout+zzadj);
    }
    var sy = 1; var sz = 1;
    var sy_ = sy/2; var sz_ = sz/2;
    var py = 0;
    var adjx = 5; var adjy = 5; var adjz = 5;
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xxinnlist[i];   var zz1 = zzinnlist[i];
      var xx2 = xxinnlist[i+1]; var zz2 = zzinnlist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        const moRailA2Body = new CANNON.Body
          ({mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
            position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z+pz+adjz),
            quaternion: railQuat,
            material: moRailMtr,
           });
        world.addBody(moRailA2Body);
        const viRailA2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRailA2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        const viRailA2Mesh = new THREE.Mesh(viRailA2Geo, viRailA2Mtr);
        scene.add(viRailA2Mesh);
        viRailA2Mesh.position.copy(moRailA2Body.position);
        viRailA2Mesh.quaternion.copy(moRailA2Body.quaternion);
      }
    }
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xxoutlist[i];   var zz1 = zzoutlist[i];
      var xx2 = xxoutlist[i+1]; var zz2 = zzoutlist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        const moRailA2Body = new CANNON.Body
          ({mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
            position: new CANNON.Vec3(x+px+adjx, y+py+adjy, z+pz+adjz),
            quaternion: railQuat,
            material: moRailMtr,
           });
        world.addBody(moRailA2Body);
        const viRailA2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRailA2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1});
        const viRailA2Mesh = new THREE.Mesh(viRailA2Geo, viRailA2Mtr);
        scene.add(viRailA2Mesh);
        viRailA2Mesh.position.copy(moRailA2Body.position);
        viRailA2Mesh.quaternion.copy(moRailA2Body.quaternion);
      }
    }
}



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
  var sx = blockSize; var sy = 1; var sz = 1;
  var sx_ = sx/2; var sy_ = sy/2; var sz_ = sz/2;
  // 原点を部品の中心位置としたときのレール位置の中心
  var px = 0; var py = 0; var pz = railIntr_; // railIntr/2;
  var pxyzlist = [[px, py, pz],
                  [px, py, -pz]];
  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pxyzlist.length; ++ii) {
    var pxx = pxyzlist[ii][0];
    var pyy = pxyzlist[ii][1];
    var pzz = pxyzlist[ii][2];
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

export function Rail_04_2(x,y,z,rot) {
  // rail_st_shift_line
  // レール　直進（ラインをずらす）　10x10x10
  // [top]
  //  +------+
  //  |―＼＿|
  //  |―＼＿|
  //  +------+
  var dx = blockSize; var dz = blockSize_; var dx_ = dx/2; var dz_ = dz/2;
  var ndiv = 10; // x軸方向の分割数
  var drad = Math.PI/ndiv;  // 分割１つぶんのradian
  var r2 = 2; // ブレ幅
  var r = r2/2;
  var xyzcntlist = [];
  var xyzuplist = [];  // 上側
  var xyzdnlist = [];  // 下側
  for (var i = 0; i < ndiv+1; ++i) {
      var vrad = - i*drad - PI_;
      var xx = i*dx/ndiv;
      var yy = 0;
      var zz = Math.sin(vrad)*r;
      var zzup = zz-railIntr_;
      var zzdn = zz+railIntr_;
      xyzcntlist.push([xx, yy ,zz]);
      xyzuplist.push([xx, yy ,zzup]);
      xyzdnlist.push([xx, yy ,zzdn]);
  }
  var xxxlist = [xyzuplist, xyzdnlist, // xyzcntlist
                ];
  var opalist = [0.4, 0.4, // 0.1
                ];
  var sy = 1; var sz = 1;
//  var sy = 0.1; var sz = 0.1;
  var sy_ = sy/2; var sz_ = sz/2;
//  var adjx = -blockSize_; var adjy = 0; var adjz = r;
//  var adjx = 0; var adjy = 0; var adjz = r;
//  var adjx = 0; var adjy = blockSize_; var adjz = blockSize_+r;
  var adjxlist = [blockSize_*0  , blockSize_*1+r, blockSize_*2  , blockSize_*1-r];
  var adjzlist = [blockSize_*1+r, blockSize_*2  , blockSize_*1-r, blockSize_*0];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_;
  var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var ndiv = xyzlist.length-1;
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Rail_04_3(x,y,z,rot) {
  // rail_st_shift_line2
  // レール　直進（ラインをずらす・反転）　10x10x10
  // [top]
  //  +------+
  //  |＿／―|
  //  |＿／―|
  //  +------+
  var dx = blockSize; var dz = blockSize_; var dx_ = dx/2; var dz_ = dz/2;
  var ndiv = 10; // x軸方向の分割数
  var drad = Math.PI/ndiv;  // 分割１つぶんのradian
  var r2 = 2; // ブレ幅
  var r = r2/2;
  var xyzcntlist = [];
  var xyzuplist = [];  // 上側
  var xyzdnlist = [];  // 下側
  for (var i = 0; i < ndiv+1; ++i) {
      var vrad = - i*drad + PI_;
      var xx = i*dx/ndiv;
      var yy = 0;
      var zz = Math.sin(vrad)*r;
      var zzup = zz-railIntr_;
      var zzdn = zz+railIntr_;
      xyzcntlist.push([xx, yy ,zz]);
      xyzuplist.push([xx, yy ,zzup]);
      xyzdnlist.push([xx, yy ,zzdn]);
  }
  var xxxlist = [xyzuplist, xyzdnlist, // xyzcntlist
                ];
  var opalist = [0.4, 0.4, // 0.1
                ];
  var sy = 1; var sz = 1;
//  var sy = 0.1; var sz = 0.1;
  var sy_ = sy/2; var sz_ = sz/2;
//  var adjx = -blockSize_; var adjy = 0; var adjz = r;
  var adjxlist = [blockSize_*0  , blockSize_*1-r, blockSize_*2  , blockSize_*1+r];
  var adjzlist = [blockSize_*1-r, blockSize_*2  , blockSize_*1+r, blockSize_*0];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_;
  var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var ndiv = xyzlist.length-1;
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Rail_05(x,y,z,rot) {
  // rail_st_slope
  // レール　直進　坂／直線　20x10x10　角度 atan(1/2)
  //   細い直方体２本で表現
  // var sx = 10*Math.sqrt(5); var sy = 1; var sz = 1; var ang=Math.atan(1/2);
  // 本来なら10だが、重なった部分がちらつくので、ちょい縮める
  // [top]
  //  +------+------+
  //  |＿＿__|＿＿__|
  //  |￣￣￣|￣￣￣|
  //  +------+------+
  //
  // [side]
  //  +------+------+
  //  |     _|_--~~~|
  //  |___-- |      |
  //  +------+------+
  var sx = 9.8*Math.sqrt(5); var sy = 1; var sz = 1; var ang=Math.atan(1/2);
  var sx_ = sx/2; var sy_ = sy/2; var sz_ = sz/2;
  var px = 0; var py = 0; var pz = railIntr_; // railIntr/2;
  var pxyzlist = [[px, py, pz],
                  [px, py, -pz]];
  // // var adjx = 10; var adjy = 10; var adjz = 5;  // 低い側を原点側としたときの座標補正
  // var adjx = blockSize_ + blockSize_*Math.cos(PI_*rot); var adjy = blockSize; var adjz = blockSize_ + blockSize_*Math.sin(PI_*rot);
  var adjx = blockSize_ + blockSize_*((rot+1) % 2); var adjy = blockSize; var adjz = blockSize_ + blockSize_*(rot % 2);
  var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pxyzlist.length; ++ii) {
    var pxx = pxyzlist[ii][0];
    var pyy = pxyzlist[ii][1];
    var pzz = pxyzlist[ii][2];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                         new CANNON.Vec3(pxx, pyy, pzz),
                         railQuat);
    const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viRail2Mesh.quaternion.copy(railQuat);
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

export function Rail_06(x,y,z,rot) {
  // rail_st_slope_arc
  // レール　直進　坂／曲線　20x10x10
  //   細い直方体２本で表現、傾斜をsin波で作る[-PI/2, PI/2]の範囲で
  //  [top]
  //  +------+------+
  //  |＿＿__|＿＿__|
  //  |￣￣￣|￣￣￣|
  //  +------+------+
  //  [side]
  //  +------+------+
  //  |     _|-~~~~~|
  //  |____- |      |
  //  +------+------+
  var dx = 20; var dy = 10; var dx_ = dx/2; var dy_ = dy/2;
  var ndiv = 20;
  var xxlist = [];
  var yylist = [];
  for (var i = 0; i < ndiv+1; ++i) {
      var xx = i/ndiv*dx - dx_;
      var vrad = i/ndiv*Math.PI - PI_;
      var yy = Math.sin(vrad)*dy_;
      xxlist.push(xx);
      yylist.push(yy);
  }
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var pz = railIntr_; // railIntr/2;
  var pxyzlist = [[-1, -1, pz],
                  [-1, -1, -pz]];
  // var adjx = 5; var adjy = 5; var adjz = 5;
  //  var adjx = 5*Math.cos(PI_*rot); var adjy = 5; var adjz = 5*Math.sin(PI_*rot);
  var adjx = blockSize_ + blockSize_*((rot+1) % 2); var adjy = blockSize; var adjz = blockSize_ + blockSize_*(rot % 2);
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var i = 0; i < ndiv; ++i) {
    var xx1 = xxlist[i]; var yy1 = yylist[i];
    var xx2 = xxlist[i+1]; var yy2 = yylist[i+1];
    var sx = Math.sqrt((xx1-xx2)**2 + (yy1-yy2)**2)
    var sx_ = sx/2;
    var px = (xx1+xx2)/2;
    var py = (yy1+yy2)/2;
    var ang=Math.atan((yy1-yy2)/(xx1-xx2));
    var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
    for (var ii = 0; ii < pxyzlist.length; ++ii) {
      var pzz = pxyzlist[ii][2];
      moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                           new CANNON.Vec3(px, py, pzz),
                           railQuat);
      const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
      const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
      const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
      viRail2Mesh.position.copy(new THREE.Vector3(px, py, pzz));
      viRail2Mesh.quaternion.copy(railQuat);
      viCntnrMesh.add(viRail2Mesh);
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Rail_06_2(x,y,z,rot) {
  // rail_st_slope_arc_s
  // レール　直進　坂／曲線（高さ半分　20x5x10
  //   傾斜をsin波で作る[-PI/2, PI/2]の範囲で、高さ半分
  //  [top]
  //  +------+------+
  //  |＿＿__|＿＿__|
  //  |￣￣￣|￣￣￣|
  //  +------+------+
  //  [side]
  //  +------+------+
  //  |      |______|
  //  |____／|      |
  //  +------+------+
  var dx = blockSize*2; var dy = blockSize_; var dx_ = dx/2; var dy_ = dy/2;
  var ndiv = 20;
  var xxlist = [];
  var yylist = [];
  var xxadj = 0;
  var yyadj = 0;
  for (var i = 0; i < ndiv+1; ++i) {
      var xx = i/ndiv*dx - dx_;
      var vrad = i/ndiv*Math.PI - PI_;
      var yy = Math.sin(vrad)*dy_ + dy_;
      xxlist.push(xx+xxadj);
      yylist.push(yy+yyadj);
  }
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var pz = railIntr_; // railIntr/2;
  var pxyzlist = [[-1, -1, pz],
                  [-1, -1, -pz]];
//  var adjx = 0; var adjy = 0; var adjz = 0;
//  var adjx = blockSize*Math.cos(PI_*rot); var adjy = blockSize_/2; var adjz = blockSize_*Math.sin(PI_*rot);
//  var adjx = blockSize_*Math.cos(PI_*rot); var adjy = 0; var adjz = blockSize_*Math.sin(PI_*rot);
  var adjxlist = [blockSize_*2, blockSize_*1, blockSize_*2, blockSize_*1];
  var adjzlist = [blockSize_*1, blockSize_*2, blockSize_*1, blockSize_*2];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_;
  var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var i = 0; i < ndiv; ++i) {
    var xx1 = xxlist[i]; var yy1 = yylist[i];
    var xx2 = xxlist[i+1]; var yy2 = yylist[i+1];
    var sx = Math.sqrt((xx1-xx2)**2 + (yy1-yy2)**2)
    var sx_ = sx/2;
    var px = (xx1+xx2)/2;
    var py = (yy1+yy2)/2;
    var ang=Math.atan((yy1-yy2)/(xx1-xx2));
    var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
    for (var ii = 0; ii < pxyzlist.length; ++ii) {
      var pzz = pxyzlist[ii][2];
      moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                           new CANNON.Vec3(px, py, pzz),
                           railQuat);
      const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
      const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
      const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
      viRail2Mesh.position.copy(new THREE.Vector3(px, py, pzz));
      viRail2Mesh.quaternion.copy(railQuat);
      viCntnrMesh.add(viRail2Mesh);
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Rail_07(x,y,z, rot) {
  // rail_arc_s
  // レール　左右曲 R90（小径）　10x10x10
  //   細い直方体２本で表現
  // [top]
  //  +------+
  //  |  *---|
  //  |  ||~~|
  //  +------+
  var rinn = (10 - railIntr)/2; // 内側の半径
  var rout = (10 + railIntr)/2; // 外側の半径
  var rout2 = 10; // ガイドレール（大外枠）の半径
  var ndiv = 10;  // 円弧（９０度）の分割数
  var xxadj = -5;
  var zzadj = -5;
  var xxinnlist = [];
  var zzinnlist = [];
  var xxoutlist = [];
  var zzoutlist = [];
  var xxout2list = [];
  var zzout2list = [];
  for (var i = 0; i < ndiv+1; ++i) {
      var vrad = i/ndiv*PI_;
      var xx = Math.cos(vrad);
      var zz = Math.sin(vrad);
      xxinnlist.push(xx*rinn+xxadj);
      zzinnlist.push(zz*rinn+zzadj);
      xxoutlist.push(xx*rout+xxadj);
      zzoutlist.push(zz*rout+zzadj);
      xxout2list.push(xx*rout2+xxadj);
      zzout2list.push(zz*rout2+zzadj);
  }
  var xxlist2 = [xxinnlist, xxoutlist, xxout2list];
  var zzlist2 = [zzinnlist, zzoutlist, zzout2list];
  var opalist = [0.4, 0.4, 0.1];
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var pylist = [0, 0, gardH];
  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxlist2.length; ++ii) {
    var xxlist = xxlist2[ii];
    var zzlist = zzlist2[ii];
    var py = pylist[ii];
    var opacity = opalist[ii];
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xxlist[i];   var zz1 = zzlist[i];
      var xx2 = xxlist[i+1]; var zz2 = zzlist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var pz = (zz1+zz2)/2;
      var ang = Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Rail_08(x,y,z, rot) {
  // rail_arc_m
  // レール　左右曲 R90（中径）　20x20x20
  //   細い直方体２本で表現
  // [top]
  //  +------+------+
  //  |      :   +++|
  //  |      +++++++|
  //  +- - +++ - - -+
  //  |   ++ :      |
  //  |  ++  :      |
  //  +------+------+
  var rinn = (10 - railIntr)/2 + 10; // 内側の半径
  var rout = (10 + railIntr)/2 + 10; // 外側の半径
  var rout2 = 20; // ガイドレール（大外枠）の半径
  var ndiv = 10;  // 円弧（９０度）の分割数
  var xxadj = -15;
  var zzadj = -15;
  var xxinnlist = [];
  var zzinnlist = [];
  var xxoutlist = [];
  var zzoutlist = [];
  var xxout2list = [];
  var zzout2list = [];
  for (var i = 0; i < ndiv+1; ++i) {
      var vrad = i/ndiv*PI_;
      var xx = Math.cos(vrad);
      var zz = Math.sin(vrad);
      xxinnlist.push(xx*rinn+xxadj);
      zzinnlist.push(zz*rinn+zzadj);
      xxoutlist.push(xx*rout+xxadj);
      zzoutlist.push(zz*rout+zzadj);
      xxout2list.push(xx*rout2+xxadj);
      zzout2list.push(zz*rout2+zzadj);
  }
  var xxlist2 = [xxinnlist, xxoutlist, xxout2list];
  var zzlist2 = [zzinnlist, zzoutlist, zzout2list];
  var opalist = [0.4, 0.4, 0.1];
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var pylist = [0, 0, gardH];
//  var adjx = blockSize_ + blockSize; var adjy = blockSize_; var adjz = -blockSize*((rot) % 2) + blockSize_*3;
  var adjxlist = [blockSize_*3, blockSize_*3, blockSize_*1, blockSize_*1];
  var adjzlist = [blockSize_*3, blockSize_*1, blockSize_*1, blockSize_*3];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_;
  var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxlist2.length; ++ii) {
    var xxlist = xxlist2[ii];
    var zzlist = zzlist2[ii];
    var py = pylist[ii];
    var opacity = opalist[ii];
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xxlist[i];   var zz1 = zzlist[i];
      var xx2 = xxlist[i+1]; var zz2 = zzlist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}


export function Rail_08_2(x,y,z, rot) {
  // rail_arc_m2
  // レール　左右曲 R90（中径）　20x20x20
  //   細い直方体２本で表現
  // [top]
  //  +------+------+
  //  |      :   +++|
  //  |      +++++++|
  //  +- - +++ - - -+
  //  |   ++ :      |
  //  |  ++  :      |
  //  +------+------+
  var rinn = (10 - railIntr)/2 + 10; // 内側の半径
  var rout = (10 + railIntr)/2 + 10; // 外側の半径
  var rout2 = 20; // ガイドレール（大外枠）の半径
  // var ndiv = 10;  // 円弧（９０度）の分割数
  var ndiv = 100;  // 円弧（９０度）の分割数
  var xxadj = -15;
  var zzadj = -15;
  var xxinnlist = [];
  var zzinnlist = [];
  var xxoutlist = [];
  var zzoutlist = [];
  var xxout2list = [];
  var zzout2list = [];
  for (var i = 0; i < ndiv+1; ++i) {
      var vrad = i/ndiv*PI_;
      var xx = Math.cos(vrad);
      var zz = Math.sin(vrad);
      xxinnlist.push(xx*rinn+xxadj);
      zzinnlist.push(zz*rinn+zzadj);
      xxoutlist.push(xx*rout+xxadj);
      zzoutlist.push(zz*rout+zzadj);
      xxout2list.push(xx*rout2+xxadj);
      zzout2list.push(zz*rout2+zzadj);
  }
  var xxlist2 = [xxinnlist, xxoutlist, xxout2list];
  var zzlist2 = [zzinnlist, zzoutlist, zzout2list];
  var opalist = [0.4, 0.4, 0.1];
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var pylist = [0, 0, gardH];
//  var adjx = blockSize_ + blockSize; var adjy = blockSize_; var adjz = -blockSize*((rot) % 2) + blockSize_*3;
  var adjxlist = [blockSize_*3, blockSize_*3, blockSize_*1, blockSize_*1];
  var adjzlist = [blockSize_*3, blockSize_*1, blockSize_*1, blockSize_*3];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_;
  var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxlist2.length; ++ii) {
    var xxlist = xxlist2[ii];
    var zzlist = zzlist2[ii];
    var py = pylist[ii];
    var opacity = opalist[ii];
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xxlist[i];   var zz1 = zzlist[i];
      var xx2 = xxlist[i+1]; var zz2 = zzlist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}


export function Rail_09(x,y,z, rot) {
  // rail_arc_l
  // レール　左右曲 R90（大径）　30x10x30
  //   細い直方体２本で表現
  // [top]
  //  +------+------+------+
  //  |      :      |++++++|
  //  |      :  ++++|++++++|
  //  +- - - ++++- -+- - - +
  //  |     ++      |      |
  //  |    ++:      |      |
  //  +- -++ + - - -+ - - -+
  //  |  ++  :      :      |
  //  |  ++  :      :      |
  //  +------+------+------+
  var rinn = (10 - railIntr)/2 + 20; // 内側の半径
  var rout = (10 + railIntr)/2 + 20; // 外側の半径
  var rout2 = 30; // ガイドレール（大外枠）の半径
  var ndiv = 10;  // 円弧（９０度）の分割数
  var xxadj = -25;
  var zzadj = -25;
  var xxinnlist = [];
  var zzinnlist = [];
  var xxoutlist = [];
  var zzoutlist = [];
  var xxout2list = [];
  var zzout2list = [];
  for (var i = 0; i < ndiv+1; ++i) {
      var vrad = i/ndiv*PI_;
      var xx = Math.cos(vrad);
      var zz = Math.sin(vrad);
      xxinnlist.push(xx*rinn+xxadj);
      zzinnlist.push(zz*rinn+zzadj);
      xxoutlist.push(xx*rout+xxadj);
      zzoutlist.push(zz*rout+zzadj);
      xxout2list.push(xx*rout2+xxadj);
      zzout2list.push(zz*rout2+zzadj);
  }
  var xxlist2 = [xxinnlist, xxoutlist, xxout2list];
  var zzlist2 = [zzinnlist, zzoutlist, zzout2list];
  var opalist = [0.4, 0.4, 0.1];
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var pylist = [0, 0, gardH];
//  var adjx = 0; var adjy = 0; var adjz = 0;
  var adjxlist = [blockSize_*5, blockSize_*5, blockSize_*1, blockSize_*1];
  var adjzlist = [blockSize_*5, blockSize_*1, blockSize_*1, blockSize_*5];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_;
  var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxlist2.length; ++ii) {
    var xxlist = xxlist2[ii];
    var zzlist = zzlist2[ii];
    var py = pylist[ii];
    var opacity = opalist[ii];
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xxlist[i];   var zz1 = zzlist[i];
      var xx2 = xxlist[i+1]; var zz2 = zzlist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}


export function Rail_10(x,y,z, rot) {
  // rail_st_R45
  // レール　直線（ななめR45)　10x10x20
  // [top]
  //  +------+
  //  |      |
  //  |    ／|
  //  +------+
  //  |／    |
  //  |      |
  //  +------+
  var xyzlist1 = [[-blockSize_, 0, railIntrR45+railPadR45],
                  [ blockSize_, 0, -railPadR45],];
  var xyzlist2 = [[-blockSize_, 0, railPadR45],
                  [ blockSize_, 0, -railIntrR45-railPadR45],];
  var xyzlist3 = [[-blockSize_, 0, blockSize_],
                  [ blockSize_, 0, -blockSize_],];
  // var xxxlist = [xyzlist1, xyzlist2, xyzlist3]; // 確認用
  // var opalist = [0.4, 0.4, 0.1]; // 確認用
  // var sy = 0.1; var sz = 0.1;
  var xxxlist = [xyzlist1, xyzlist2];
  var opalist = [0.4, 0.4];
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
//  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize;
  var adjxlist = [blockSize_*1, blockSize_*2, blockSize_*1, blockSize_*2];
  var adjzlist = [blockSize_*2, blockSize_*1, blockSize_*2, blockSize_*1];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_;
  var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var ndiv = xyzlist.length-1;
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Rail_11(x,y,z, rot) {
  // rail_st_R45_r
  // レール　直線（ななめR45)　20x10x10
  //  [top]
  //  +-----+-----+
  //  |     |／   |
  //  |   ／|     |
  //  +-----+-----+
  var xyzlist1 = [[-blockSize_-railIntrR45_, 0, blockSize_],  // 上側
                  [ blockSize_-railIntrR45_, 0, -blockSize_],];
  var xyzlist2 = [[-blockSize_+railIntrR45_, 0, blockSize_],  // 下側
                  [ blockSize_+railIntrR45_, 0, -blockSize_],];
  var xyzlist3 = [[-blockSize_, 0, blockSize_],    // 中央
                  [ blockSize_, 0, -blockSize_],];
  var xxxlist = [xyzlist1, xyzlist2 // , xyzlist3
                 ];
  var opalist = [0.4, 0.4  // , 0.1
                 ];
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
//  var adjx = blockSize_; var adjy = 0; var adjz = 0;
  var adjxlist = [blockSize_*2, blockSize_*1, blockSize_*2, blockSize_*1];
  var adjzlist = [blockSize_*1, blockSize_*2, blockSize_*1, blockSize_*2];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_;
  var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var ndiv = xyzlist.length-1;
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Rail_11_2(x,y,z, rot) {
  // rail_st_R45_2
  // レール　直線（ななめR45)　10x10x10
  //  [top]
  //  +-----+
  //  |   ／|
  //  | ／／|
  //  +-----+
  var xyzlist1 = [[ -railIntrR45_, 0, blockSize_],  // 上側
                  [  blockSize_, 0, -railIntrR45_],];
  var xyzlist2 = [[  railIntrR45_, 0, blockSize_],  // 下側
                  [    blockSize_, 0, railIntrR45_],];
  var xyzlist3 = [[          0, 0, blockSize_],    // 中央
                  [ blockSize_, 0, 0],];
  var xxxlist = [xyzlist1, xyzlist2, // xyzlist3
                 ];
  var opalist = [0.4, 0.4, // 0.1
                 ];
  var sy = 1; var sz = 1;
//  var sy = 0.1; var sz = 0.1;
  var sy_ = sy/2; var sz_ = sz/2;
  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var ndiv = xyzlist.length-1;
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Rail_12(x,y,z, rot) {
  // rail_arc_R45
  // レール　水平（直線＋ななめR45)　20x10x20
  //  [top]
  //  +-----+-----+
  //  |     |＿＿ |
  //  |   ／|     |
  //  +-----+-----+
  //  |／   |     |
  //  |     |     |
  //  +-----+-----+
  var adj = 2.05;  // 補正値：円弧のX軸方向のずれ
  // 左下ななめの下段
  var v = 0.65; // 補正値：上手く計算できないので決め打ちで（汗
  var xyzlist1 = [[-blockSize, 0, blockSize_+railIntrR45_],
                  [         v, 0, -blockSize_+railIntrR45_-v],];
  // 右上水平の下段
  var xyzlist2 = [[ adj, 0, -railPad],
                  [ blockSize, 0, -railPad],];
  // 左下ななめの上段
  var v = 3.6; // 補正値：上手く計算できないので決め打ちで（汗
  var xyzlist3 = [[-blockSize, 0, blockSize_-railIntrR45_],
                  [        -v, 0, -blockSize_-railIntrR45_+v],
                 ];
  // 右上水平の上段
  var xyzlist4 = [[ adj, 0, -railIntr-railPad],
                  [ blockSize, 0, -railIntr-railPad],];
  // ガードレール：左下ななめ上段
  var v = 5; // 補正値：上手く計算できないので決め打ちで（汗
  var xyzlist5 = [[-blockSize, gardH, blockSize_-blockSizeR45_],
                  [        -v, gardH, -blockSize_-blockSizeR45_+v],
                 ];
  // ガードレール：右上水平
  var xyzlist6 = [[ adj, gardH, -blockSize],
                  [ blockSize, gardH, -blockSize],];
  // 確認用中心線 （左下ななめ）and （右上水平）
  var xyzlist99 = [[-blockSize, 0,  blockSize_],
                  [         0, 0, -blockSize_],
                  [ blockSize, 0, -blockSize_],];
  // ななめと水平の接合部／曲線部分
  var rinn = (blockSize - railIntr)/2; // 内側の半径
  var rout = (blockSize + railIntr)/2; // 外側の半径
  var rout2 = blockSize; // ガイドレール（大外枠）の半径
  var ndivR = 10;  // 円弧（９０度）の分割数
  var drad = PI_/ndivR;  // 分割１つぶんのradian
  var narc = 5;  // 円弧の要素の数
  var xxadj = 0; var zzadj = 0;
  var xxadj = adj; var zzadj = 0;
  var xyzinnlist = [];
  var xyzoutlist = [];
  var xyzout2list = [];
  for (var i = 0; i < narc+1; ++i) {
      var vrad = - i*drad - PI_;
      var xx = Math.cos(vrad);
      var yy = 0;
      var zz = Math.sin(vrad);
      xyzinnlist.push([xx*rinn+xxadj, yy, zz*rinn+zzadj]);
      xyzoutlist.push([xx*rout+xxadj, yy, zz*rout+zzadj]);
      xyzout2list.push([xx*rout2+xxadj, gardH, zz*rout2+zzadj]);
  }
  var xxxlist = [xyzlist1, xyzlist2, xyzlist3, xyzlist4, xyzlist5, xyzlist6, //  xyzlist99,
                 xyzinnlist, xyzoutlist, xyzout2list];
  var opalist = [0.4, 0.4, 0.4, 0.4, 0.1, 0.1, // 0.1,
                 0.4, 0.4, 0.1];
  var sy = 1; var sz = 1;
//  var sy = 0.1; var sz = 0.1;
  var sy_ = sy/2; var sz_ = sz/2;
  var adjx = blockSize; var adjy = blockSize_; var adjz = blockSize;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var ndiv = xyzlist.length-1;
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Rail_13(x,y,z, rot) {
  // rail_arc_R45_r
  // レール　水平（直線＋ななめR45)　10x10x20
  //  [top]
  //  +-----+-----+
  //  | ＿＿|     |
  //  |     |＼   |
  //  +-----+-----+
  //  |     |   ＼|
  //  |     |     |
  //  +-----+-----+
  var adj = -2.05;  // 補正値：円弧のX軸方向のずれ
  // 右下ななめの下段
  var v = 0.65; // 補正値：上手く計算できないので決め打ちで（汗
  var xyzlist1 = [[ blockSize, 0, blockSize_+railIntrR45_],
                  [        -v, 0, -blockSize_+railIntrR45_-v],];
  // 左上水平の下段
  var xyzlist2 = [[ adj, 0, -railPad],
                  [ -blockSize, 0, -railPad],];
  // 右下ななめの上段
  var v = 3.6; // 補正値：上手く計算できないので決め打ちで（汗
  var xyzlist3 = [[ blockSize, 0, blockSize_-railIntrR45_],
                  [         v, 0, -blockSize_-railIntrR45_+v],
                 ];
  // 左上水平の上段
  var xyzlist4 = [[ adj, 0, -railIntr-railPad],
                  [-blockSize, 0, -railIntr-railPad],
                  ];
  // ガードレール：右下ななめ上段
  var v = 5; // 補正値：上手く計算できないので決め打ちで（汗
  var xyzlist5 = [[ blockSize, gardH, blockSize_-blockSizeR45_],
                  [         v, gardH, -blockSize_-blockSizeR45_+v],
                 ];
  // ガードレール：左上水平
  var xyzlist6 = [[        adj, gardH, -blockSize],
                  [ -blockSize, gardH, -blockSize],
                  ];
  // 確認用中心線 （右下ななめ）and （左上水平）
  var xyzlist99 = [[blockSize, 0,  blockSize_],
                  [         0, 0, -blockSize_],
                  [-blockSize, 0, -blockSize_],];
  // ななめと水平の接合部／曲線部分
  var rinn = (blockSize - railIntr)/2; // 内側の半径
  var rout = (blockSize + railIntr)/2; // 外側の半径
  var rout2 = blockSize; // ガイドレール（大外枠）の半径
  var ndivR = 10;  // 円弧（９０度）の分割数
  var drad = PI_/ndivR;  // 分割１つぶんのradian
  var narc = 5;  // 円弧の要素の数
  var xxadj = 0; var zzadj = 0;
  var xxadj = adj; var zzadj = 0;
  var xyzinnlist = [];
  var xyzoutlist = [];
  var xyzout2list = [];
  for (var i = 0; i < narc+1; ++i) {
      var vrad = - i*drad - PI_/2;
      var xx = Math.cos(vrad);
      var yy = 0;
      var zz = Math.sin(vrad);
      xyzinnlist.push([xx*rinn+xxadj, yy, zz*rinn+zzadj]);
      xyzoutlist.push([xx*rout+xxadj, yy, zz*rout+zzadj]);
//      xyzout2list.push([xx*rout2+xxadj, yy, zz*rout2+zzadj]);
      xyzout2list.push([xx*rout2+xxadj, gardH, zz*rout2+zzadj]);
  }
  var xxxlist = [xyzlist1, xyzlist2, xyzlist3, xyzlist4, xyzlist5, xyzlist6, // xyzlist99,
                 xyzinnlist, xyzoutlist, xyzout2list];
  var opalist = [0.4, 0.4, 0.4, 0.4, 0.1, 0.1, // 0.1,
                 0.4, 0.4, 0.1];
  var sy = 1; var sz = 1;
//  var sy = 0.1; var sz = 0.1;
  var sy_ = sy/2; var sz_ = sz/2;
  var adjx = blockSize; var adjy = blockSize_; var adjz = blockSize;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var n_ = xyzlist.length-1;
    for (var i = 0; i < n_; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Join_00(x,y,z, rot) {
  // join_R45
  // 合流：（直線＋ななめR45)　20x10x20
  //  [top]
  //  +-----+-----+
  //  |＿＿ |＿＿ |
  //  |   ／|     |
  //  +-----+-----+
  //  |／   |     |
  //  |     |     |
  //  +-----+-----+
  // var adj = 2.05;  // 補正値：円弧のX軸方向のずれ
  var adj = 1.2;  // 補正値：円弧のX軸方向のずれ
  // 左下ななめの下段
  // var v = 0.65; // 補正値：上手く計算できないので決め打ちで（汗
  var v = 1.2; // 補正値：上手く計算できないので決め打ちで（汗
  var xyzlist1 = [[-blockSize, 0, blockSize_+railIntrR45_],
                  [         v, 0, -blockSize_+railIntrR45_-v],];
  // 水平(右)の下段
  var xyzlist2 = [[ adj, 0, -railPad],
                  [ blockSize, 0, -railPad],];
  // 左下ななめの上段＋水平（左）の下段
  // var v = 3.6; // 補正値：上手く計算できないので決め打ちで（汗
  var v = blockSize_+2.2; // 補正値：上手く計算できないので決め打ちで（汗
  var xyzlist3 = [[-blockSize, 0, blockSize_-railIntrR45_],
                  [        -v, 0, -blockSize_-railIntrR45_+v],
                  [-blockSize, 0, -railPad],
                 ];
  // 右上水平の上段
  var xyzlist4 = [[-blockSize, 0, -railIntr-railPad],
                  //[ adj, 0, -railIntr-railPad],
                  [ blockSize, 0, -railIntr-railPad],];
  // // ガードレール：左下ななめ上段
  // var v = 5; // 補正値：上手く計算できないので決め打ちで（汗
  // var xyzlist5 = [[-blockSize, blockSize_, blockSize_-blockSizeR45_],
  //                 [        -v, blockSize_, -blockSize_-blockSizeR45_+v],
  //                ];
  // ガードレール：水平
  var xyzlist6 = [// [ -blockSize, gardH, -blockSize],
                  [ adj, gardH, -blockSize],
                  [ blockSize, gardH, -blockSize],];
  // 確認用中心線 （左下ななめ）and （水平）
  var pyy = -1.4;
  var xyzlist99 = [[-blockSize, pyy,  blockSize_],
                   [         0, pyy, -blockSize_],
                   [-blockSize, pyy, -blockSize_],
                   [ blockSize, pyy, -blockSize_],];
  // // ななめと水平の接合部／曲線部分
  // var rinn = (blockSize - railIntr)/2; // 内側の半径
  // var rout = (blockSize + railIntr)/2; // 外側の半径
  // var rout2 = blockSize; // ガイドレール（大外枠）の半径
  // var ndivR = 10;  // 円弧（９０度）の分割数
  // var drad = PI_/ndivR;  // 分割１つぶんのradian
  // var narc = 5;  // 円弧の要素の数
  // var xxadj = 0; var zzadj = 0;
  // var xxadj = adj; var zzadj = 0;
  // var xyzinnlist = [];
  // var xyzoutlist = [];
  // var xyzout2list = [];
  // for (var i = 0; i < narc+1; ++i) {
  //     var vrad = - i*drad - PI_;
  //     var xx = Math.cos(vrad);
  //     var yy = 0;
  //     var zz = Math.sin(vrad);
  //     xyzinnlist.push([xx*rinn+xxadj, yy, zz*rinn+zzadj]);
  //     xyzoutlist.push([xx*rout+xxadj, yy, zz*rout+zzadj]);
  //     xyzout2list.push([xx*rout2+xxadj, blockSize_, zz*rout2+zzadj]);
  // }
  var xxxlist = [xyzlist1, xyzlist2, xyzlist3, xyzlist4, xyzlist6, xyzlist99
                ];
  var opalist = [0.4, 0.4, 0.4, 0.4, 0.1, 0.1
                ];
  var sy = 1; var sz = 1;
//  var sy = 0.1; var sz = 0.1;
  var sy_ = sy/2; var sz_ = sz/2;
  var adjx = blockSize; var adjy = blockSize_; var adjz = blockSize;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var ndiv = xyzlist.length-1;
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Join_01(x,y,z, rot) {
  // join_R45_r
  // 合流：（直線＋ななめR45 反転)　10x10x20
  //  [top]
  //  +-----+-----+
  //  |＿＿ |＿＿ |
  //  |     |＼   |
  //  +-----+-----+
  //  |     |   ＼|
  //  |     |     |
  //  +-----+-----+
  // var adj = 2.05;  // 補正値：円弧のX軸方向のずれ
  var adj = 1.2;  // 補正値：円弧のX軸方向のずれ
  // 右下ななめの下段
  var v = 1.2; // 補正値：上手く計算できないので決め打ちで（汗
  var xyzlist1 = [[ blockSize, 0, blockSize_+railIntrR45_],
                  [        -v, 0, -blockSize_+railIntrR45_-v],];
  // 水平(左)の下段
  var xyzlist2 = [[ -adj, 0, -railPad],
                  [ -blockSize, 0, -railPad],];
  // 右下ななめの上段＋水平（左）の下段
  // var v = -blockSize_+2.2; // 補正値：上手く計算できないので決め打ちで（汗
  var v = blockSize_+2.2; // 補正値：上手く計算できないので決め打ちで（汗
  var xyzlist3 = [[ blockSize, 0, blockSize_-railIntrR45_],
                  [         v, 0, -blockSize_-railIntrR45_+v],
                  [ blockSize, 0, -railPad],
                 ];
  // 水平の上段
  var xyzlist4 = [[-blockSize, 0, -railIntr-railPad],
                  [ blockSize, 0, -railIntr-railPad],];
  // // ガードレール：左下ななめ上段
  // var v = 5; // 補正値：上手く計算できないので決め打ちで（汗
  // var xyzlist5 = [[-blockSize, blockSize_, blockSize_-blockSizeR45_],
  //                 [        -v, blockSize_, -blockSize_-blockSizeR45_+v],
  //                ];
  // ガードレール：水平
  var xyzlist6 = [// [ -blockSize, gardH, -blockSize],
                  [ -adj, gardH, -blockSize],
                  [ -blockSize, gardH, -blockSize],];
  // 確認用中心線 兼 落とさないためのガード （左下ななめ）and （水平）
  var pyy = -1.4;
  var xyzlist99 = [[ blockSize, pyy,  blockSize_],
                   [         0, pyy, -blockSize_],
                   [ blockSize, pyy, -blockSize_],
                   [-blockSize, pyy, -blockSize_],];
  // // ななめと水平の接合部／曲線部分
  // var rinn = (blockSize - railIntr)/2; // 内側の半径
  // var rout = (blockSize + railIntr)/2; // 外側の半径
  // var rout2 = blockSize; // ガイドレール（大外枠）の半径
  // var ndivR = 10;  // 円弧（９０度）の分割数
  // var drad = PI_/ndivR;  // 分割１つぶんのradian
  // var narc = 5;  // 円弧の要素の数
  // var xxadj = 0; var zzadj = 0;
  // var xxadj = adj; var zzadj = 0;
  // var xyzinnlist = [];
  // var xyzoutlist = [];
  // var xyzout2list = [];
  // for (var i = 0; i < narc+1; ++i) {
  //     var vrad = - i*drad - PI_;
  //     var xx = Math.cos(vrad);
  //     var yy = 0;
  //     var zz = Math.sin(vrad);
  //     xyzinnlist.push([xx*rinn+xxadj, yy, zz*rinn+zzadj]);
  //     xyzoutlist.push([xx*rout+xxadj, yy, zz*rout+zzadj]);
  //     xyzout2list.push([xx*rout2+xxadj, blockSize_, zz*rout2+zzadj]);
  // }
  var xxxlist = [xyzlist1, xyzlist2, xyzlist3, xyzlist4, xyzlist6, xyzlist99
                ];
  var opalist = [0.4, 0.4, 0.4, 0.4, 0.1, 0.1
                ];
  var sy = 1; var sz = 1;
//  var sy = 0.1; var sz = 0.1;
  var sy_ = sy/2; var sz_ = sz/2;
//  var adjx = 5; var adjy = 0; var adjz = 5;
  var adjx = blockSize; var adjy = blockSize_; var adjz = blockSize;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var ndiv = xyzlist.length-1;
    for (var i = 0; i < ndiv; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Cross_00(x,y,z, rot) {
  // cross
  // レール　十字　10x10x10
  //  [top]
  //  +-----+
  //  | | | |
  //  |-+ +-|
  //  |~| |~|
  //  +-----+
  // 課題!!
  // ・なぜか、十字の上から侵入するときに、床にぶつかる感じ
  //               左から侵入時にはそんな感じはしない
  // ・交差箇所は床に板ではなく、レールの内部に誘導路を置くのがよいかも
  var xxxlist = [[[ blockSize_, 0, railIntr_],  // 右下
                  [ railIntr_ , 0, railIntr_],
                  [ railIntr_ , 0, blockSize_]],
                 [[ blockSize_, 0, -railIntr_],  // 右上
                  [ railIntr_ , 0, -railIntr_],
                  [ railIntr_ , 0, -blockSize_]],
                 [[-blockSize_, 0, -railIntr_],  // 左上
                  [-railIntr_ , 0, -railIntr_],
                  [-railIntr_ , 0, -blockSize_]],
                 [[-blockSize_, 0, railIntr_],  // 左下
                  [-railIntr_ , 0, railIntr_],
                  [-railIntr_ , 0, blockSize_]],
                 ];
  var opalist = [0.4, 0.4, 0.4, 0.4];
  // 交差下に平面
//  var pltposilist = [[0,-1.22,0]];
  var pltposilist = [[0,-1,0]];
  var pltsizelist = [[blockSize, 0.1, blockSize]];
  var pltopalist = [0.1];
  var sy = 1; var sz = 1;
//  var sy = 0.1; var sz = 0.1;
  var sy_ = sy/2; var sz_ = sz/2;
  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
//  var adjx = 0; var adjy = 0; var adjz = 0;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var n_ = xyzlist.length-1;
    for (var i = 0; i < n_; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=(xx1-xx2)==0 ? PI_ : Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz))
                             // railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  for (var ii = 0; ii < pltposilist.length; ++ii) {
    var pltposi = pltposilist[ii];
    var pltsize = pltsizelist[ii];
    var pltopa = pltopalist[ii];
    var pxx = pltposi[0]; var pyy = pltposi[1]; var pzz = pltposi[2];
    var sxx = pltsize[0]; var syy = pltsize[1]; var szz = pltsize[2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: pltopa});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viObj2Mesh);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}


export function Cross_01(x,y,z, rot) {
  // cross_R45
  // レール　クロス／十字（ななめR45)　20x10x10
  //  [top]
  //  +-----+-----+
  //  |   ＼:／   |
  //  |   ／:＼   |
  //  +-----+-----+
  var v = blockSize_-railIntrR45_;
  var xxxlist = [[[        -v, 0, -blockSize_],  // 上
                  [         0, 0, -blockSize_+v],
                  [         v, 0, -blockSize_]],
                 [[ -blockSize+v , 0, -blockSize_],  // 左
                  [ -railIntrR45_, 0, 0],
                  [ -blockSize+v , 0,  blockSize_]],
                 [[        -v, 0,  blockSize_],  // 下
                  [         0, 0,  blockSize_-v],
                  [         v, 0,  blockSize_]],
                 [[  blockSize-v , 0, -blockSize_],  // 右
                  [  railIntrR45_, 0, 0],
                  [  blockSize-v , 0,  blockSize_]],
                 // [[-blockSize_, 0, -blockSize_],  // デバッグ用：中心：＼
                 //  [ blockSize_, 0,  blockSize_]],
                 // [[-blockSize_-railIntrR45_, 0, -blockSize_],
                 //  [ blockSize_-railIntrR45_, 0,  blockSize_]],
                 // [[-blockSize_+railIntrR45_, 0, -blockSize_],
                 //  [ blockSize_+railIntrR45_, 0,  blockSize_]],
                 // [[-blockSize_, 0,  blockSize_],  // デバッグ用：中心：／
                 //  [ blockSize_, 0, -blockSize_]],
                 // [[-blockSize_-railIntrR45_, 0,  blockSize_],
                 //  [ blockSize_-railIntrR45_, 0, -blockSize_]],
                 // [[-blockSize_+railIntrR45_, 0,  blockSize_],
                 //  [ blockSize_+railIntrR45_, 0, -blockSize_]],
                 ];
  var opalist = [0.4, 0.4, 0.4, 0.4, // 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
                ];
  var pltposilist = [[0,-1.22,0], // [0,-2.22,0],
                    ];
  var pltsizelist = [[blockSize, 0.1, blockSize],
                     // [blockSize*2, 0.1, blockSize]
                    ];
  var pltopalist = [0.1, // 0.1
                   ];
  var sy = 1; var sz = 1;
//  var sy = 0.1; var sz = 0.1;
  var sy_ = sy/2; var sz_ = sz/2;
//  var adjx = 5; var adjy = 0; var adjz = 5;
//  var adjx = 0; var adjy = 0; var adjz = 0;
  var adjxlist = [blockSize_*2, blockSize_*1, blockSize_*2, blockSize_*1];
  var adjzlist = [blockSize_*1, blockSize_*2, blockSize_*1, blockSize_*2];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_;
  var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var n_ = xyzlist.length-1;
    for (var i = 0; i < n_; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=(xx1-xx2)==0 ? PI_ : Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz))
                             // railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  for (var ii = 0; ii < pltposilist.length; ++ii) {
    var pltposi = pltposilist[ii];
    var pltsize = pltsizelist[ii];
    var pltopa = pltopalist[ii];
    var pxx = pltposi[0]; var pyy = pltposi[1]; var pzz = pltposi[2];
    var sxx = pltsize[0]; var syy = pltsize[1]; var szz = pltsize[2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: pltopa});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viObj2Mesh);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}


export function Cross_02(x,y,z, rot) {
  // cross2
  // レール　十字　10x10x10
  //  [top]
  //  +-----+
  //  | | | |
  //  |-+ +-|
  //  |~| |~|
  //  +-----+
  // 課題!!
  var xxxlist = [[[ blockSize_, 0, railIntr_],  // 右下
                  [ railIntr_ , 0, railIntr_],
                  [ railIntr_ , 0, blockSize_]],
                 [[ blockSize_, 0, -railIntr_],  // 右上
                  [ railIntr_ , 0, -railIntr_],
                  [ railIntr_ , 0, -blockSize_]],
                 [[-blockSize_, 0, -railIntr_],  // 左上
                  [-railIntr_ , 0, -railIntr_],
                  [-railIntr_ , 0, -blockSize_]],
                 [[-blockSize_, 0, railIntr_],  // 左下
                  [-railIntr_ , 0, railIntr_],
                  [-railIntr_ , 0, blockSize_]],
                 ];
  var opalist = [0.4, 0.4, 0.4, 0.4];
  // 交差下に平面
//  var pltposilist = [[0,-1.22,0]];
  var v = 5;
  var pltposilist = [[0, 0.5, 0, new CANNON.Quaternion()],
                     [v, 0, 0, new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, -1), 0.3)],
                     [-v, 0, 0, new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), 0.3)],
                     [0, 0, v, new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), 0.3)],
                     [0, 0, -v, new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), 0.3)],
                     ];
  var pltsizelist = [[railIntr, 0.1, railIntr],
                     [railPad*2, 0.1, railIntr],
                     [railPad*2, 0.1, railIntr],
                     [railIntr, 0.1, railPad*2],
                     [railIntr, 0.1, railPad*2],
                     ];
  var pltopalist = [0.1, 0.1, 0.1, 0.1, 0.1, ];
  var sy = 1; var sz = 1;
//  var sy = 0.1; var sz = 0.1;
  var sy_ = sy/2; var sz_ = sz/2;
//  var adjx = 5; var adjy = 0; var adjz = 5;
//  var adjx = 0; var adjy = 0; var adjz = 0;
  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var n_ = xyzlist.length-1;
    for (var i = 0; i < n_; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=(xx1-xx2)==0 ? PI_ : Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz))
                             // railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  for (var ii = 0; ii < pltposilist.length; ++ii) {
    var pltposi = pltposilist[ii];
    var pltsize = pltsizelist[ii];
    var pltopa = pltopalist[ii];
    var pxx = pltposi[0]; var pyy = pltposi[1]; var pzz = pltposi[2]; var quat = pltposi[3];
    var sxx = pltsize[0]; var syy = pltsize[1]; var szz = pltsize[2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz),
                         quat);
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: pltopa});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viObj2Mesh.quaternion.copy(quat);
    viCntnrMesh.add(viObj2Mesh);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}


export function Cross_03(x,y,z, rot) {
  // cross2_R45
  // レール　クロス／十字（ななめR45)　20x10x10
  //  [top]
  //  +-----+-----+
  //  |   ＼:／   |
  //  |   ／:＼   |
  //  +-----+-----+
  var v = blockSize_-railIntrR45_;
  var xxxlist = [[[        -v, 0, -blockSize_],  // 上
                  [         0, 0, -blockSize_+v],
                  [         v, 0, -blockSize_]],
                 [[ -blockSize+v , 0, -blockSize_],  // 左
                  [ -railIntrR45_, 0, 0],
                  [ -blockSize+v , 0,  blockSize_]],
                 [[        -v, 0,  blockSize_],  // 下
                  [         0, 0,  blockSize_-v],
                  [         v, 0,  blockSize_]],
                 [[  blockSize-v , 0, -blockSize_],  // 右
                  [  railIntrR45_, 0, 0],
                  [  blockSize-v , 0,  blockSize_]],
                 // [[-blockSize_, 0, -blockSize_],  // デバッグ用：中心：＼
                 //  [ blockSize_, 0,  blockSize_]],
                 // [[-blockSize_-railIntrR45_, 0, -blockSize_],
                 //  [ blockSize_-railIntrR45_, 0,  blockSize_]],
                 // [[-blockSize_+railIntrR45_, 0, -blockSize_],
                 //  [ blockSize_+railIntrR45_, 0,  blockSize_]],
                 // [[-blockSize_, 0,  blockSize_],  // デバッグ用：中心：／
                 //  [ blockSize_, 0, -blockSize_]],
                 // [[-blockSize_-railIntrR45_, 0,  blockSize_],
                 //  [ blockSize_-railIntrR45_, 0, -blockSize_]],
                 // [[-blockSize_+railIntrR45_, 0,  blockSize_],
                 //  [ blockSize_+railIntrR45_, 0, -blockSize_]],
                 ];
  var opalist = [0.4, 0.4, 0.4, 0.4, // 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
                ];
  var qr45 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), PI_/2);
  var v = 3.6;
  var pltposilist = [[0, 0.5, 0, qr45],
                     [v, 0, v, new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(-0.5, 0, 0.5), -0.3).mult(qr45)],
                     [-v, 0, -v, new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(-0.5, 0, 0.5),  0.3).mult(qr45)],
                     [v, 0, -v, new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0.5, 0, 0.5), -0.3).mult(qr45)],
                     [-v, 0, v, new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0.5, 0, 0.5),  0.3).mult(qr45)],
                     ];
  var pltsizelist = [[railIntr, 0.1, railIntr],
                     [railIntr, 0.1, railPad*2],
                     [railIntr, 0.1, railPad*2],
                     [railPad*2, 0.1, railIntr],
                     [railPad*2, 0.1, railIntr],
                    ];
  var pltopalist = [0.1, 0.1, 0.1, 0.1, 0.1, ];
  var sy = 1; var sz = 1;
//  var sy = 0.1; var sz = 0.1;
  var sy_ = sy/2; var sz_ = sz/2;
//  var adjx = 5; var adjy = 0; var adjz = 5;
//  var adjx = 0; var adjy = 0; var adjz = 0;
  var adjxlist = [blockSize_*2, blockSize_*1, blockSize_*2, blockSize_*1];
  var adjzlist = [blockSize_*1, blockSize_*2, blockSize_*1, blockSize_*2];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_;
  var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xyzlist = xxxlist[ii];
    var opacity = opalist[ii];
    var n_ = xyzlist.length-1;
    for (var i = 0; i < n_; ++i) {
      var xx1 = xyzlist[i][0]; var yy1 = xyzlist[i][1]; var zz1 = xyzlist[i][2];
      var xx2 = xyzlist[i+1][0]; var yy2 = xyzlist[i+1][1]; var zz2 = xyzlist[i+1][2];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2);
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=(xx1-xx2)==0 ? PI_ : Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz))
                             // railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  for (var ii = 0; ii < pltposilist.length; ++ii) {
    var pltposi = pltposilist[ii];
    var pltsize = pltsizelist[ii];
    var pltopa = pltopalist[ii];
    var pxx = pltposi[0]; var pyy = pltposi[1]; var pzz = pltposi[2]; var quat = pltposi[3];
    var sxx = pltsize[0]; var syy = pltsize[1]; var szz = pltsize[2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz),
                         quat);
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: pltopa});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viObj2Mesh.quaternion.copy(quat);
    viCntnrMesh.add(viObj2Mesh);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}


export function Funnel_00(x,y,z, rot) {
  // funnel_sq
  // 漏斗（渦巻型）　（大径）　30x30x30
  //   細い直方体２本で表現
  //  [top]
  //  +-----+-----+-----+
  //  |     |＿＿ |＿＿ |
  //  |   ／| ─  |── |
  //  +-----+-----+-----+
  //  |  ｜ :／ ＼＼    |
  //  |  ｜ ｜   ｜｜   |
  //  +-----+-----+-----+
  //  |   ＼|＿＿／     |
  //  |     |     |     |
  //  +-----+-----+-----+
  //  [side]
  //  +-----+-----+-----+
  //  |  ＿＿＿＿＿＿＿ |
  //  |    ─＝＝─     |
  //  +-----+-----+-----+
  var rinn = (10 - railIntr)/2 + 20; // 内側の半径
  var rout = (10 + railIntr)/2 + 20; // 外側の半径
  var rout2 = 30; // ガイドレール（大外枠）の半径
  var ndivR = 10;  // 円弧（９０度）の分割数
  var drad = PI_/ndivR;  // 分割１つぶんのradian
  var n = 80;  // 要素片の数（ndivR*4=40で一回転分）
  var n2max = 41;  // 要素片の数（ndivR*4=40で一回転分）
  var xxadj = 0;
  var zzadj = 0;
  var xxinnlist = [];
  var yyinnlist = [];
  var zzinnlist = [];
  var xxoutlist = [];
  var yyoutlist = [];
  var zzoutlist = [];
  var xxout2list = [];
  var yyout2list = [];
  var zzout2list = [];
  var yy = 0;
  var yy2 = 5;
  for (var i = 0; i < n+1; ++i) {
      var vrad = i*drad;
      var xx = Math.cos(vrad);
      var zz = Math.sin(vrad);
      xxinnlist.push(xx*rinn+xxadj);
      yyinnlist.push(yy);
      zzinnlist.push(zz*rinn+zzadj);
      xxoutlist.push(xx*rout+xxadj);
      yyoutlist.push(yy);
      zzoutlist.push(zz*rout+zzadj);
      // yy += -0.13;
      // rinn += -0.2;
      // rout += -0.2;
      yy += -0.125;
      rinn += -0.255;
      rout += -0.251;
      if (i < n2max) {
          xxout2list.push(xx*rout2+xxadj);
          yyout2list.push(yy2);
          zzout2list.push(zz*rout2+zzadj);
          yy2 += -0.13;
          rout2 += -0.2;
      }
  }
  var xxlist2 = [xxinnlist, xxoutlist, xxout2list];
  var yylist2 = [yyinnlist, yyoutlist, yyout2list];
  var zzlist2 = [zzinnlist, zzoutlist, zzout2list];
  var opalist = [0.4, 0.4, 0.1];
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var adjx = blockSize*3; var adjy = blockSize_*3; var adjz = blockSize*3;
  // var adjxlist = [blockSize_*6, blockSize_*6, blockSize_*6, blockSize_*6];
  // var adjzlist = [blockSize_*6, blockSize_*6, blockSize_*6, blockSize_*6];
  // var adjx = adjxlist[rot%4];
  // var adjy = blockSize_*3;
  // var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxlist2.length; ++ii) {
    var xxlist = xxlist2[ii];
    var yylist = yylist2[ii];
    var zzlist = zzlist2[ii];
    var opacity = opalist[ii];
    for (var i = 0; i < n; ++i) {
      var xx1 = xxlist[i];   var yy1 = yylist[i];   var zz1 = zzlist[i];
      var xx2 = xxlist[i+1]; var yy2 = yylist[i+1]; var zz2 = zzlist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Funnel_01(x,y,z, rot) {
  // funnel_sq_r
  // 漏斗（渦巻型：逆巻き）　（大径）　30x30x30
  //   細い直方体２本で表現  逆巻き
  //  [top]
   //  [top]
  //  +-----+-----+-----+
  //  |＿＿ |＿＿ |     |
  //  |── | ─  |＼   |
  //  +-----+-----+-----+
  //  |    ／／ ＼: ｜  |
  //  |   ｜｜   ｜ ｜  |
  //  +-----+-----+-----+
  //  |     ＼＿＿|／   |
  //  |     |     |     |
  //  +-----+-----+-----+
  //  [side]
  //  +-----+-----+-----+
  //  |  ＿＿＿＿＿＿＿ |
  //  |    ─＝＝─     |
  //  +-----+-----+-----+
  var rinn = (10 - railIntr)/2 + 20; // 内側の半径
  var rout = (10 + railIntr)/2 + 20; // 外側の半径
  var rout2 = 30; // ガイドレール（大外枠）の半径
  var ndivR = 10;  // 円弧（９０度）の分割数
  var drad = PI_/ndivR;  // 分割１つぶんのradian
  var n = 80;  // 要素片の数（ndivR*4=40で一回転分）
  var n2max = 41;  // 要素片の数（ndivR*4=40で一回転分）
  var xxadj = 0;
  var zzadj = 0;
  var xxinnlist = [];
  var yyinnlist = [];
  var zzinnlist = [];
  var xxoutlist = [];
  var yyoutlist = [];
  var zzoutlist = [];
  var xxout2list = [];
  var yyout2list = [];
  var zzout2list = [];
  var yy = 0;
  var yy2 = 5;
  for (var i = 0; i < n+1; ++i) {
      var vrad = -i*drad;
      var xx = Math.cos(vrad);
      var zz = Math.sin(vrad);
      xxinnlist.push(xx*rinn+xxadj);
      yyinnlist.push(yy);
      zzinnlist.push(zz*rinn+zzadj);
      xxoutlist.push(xx*rout+xxadj);
      yyoutlist.push(yy);
      zzoutlist.push(zz*rout+zzadj);
      // yy += -0.13;
      // rinn += -0.2;
      // rout += -0.2;
      yy += -0.125;
      rinn += -0.255;
      rout += -0.251;
      if (i < n2max) {
          xxout2list.push(xx*rout2+xxadj);
          yyout2list.push(yy2);
          zzout2list.push(zz*rout2+zzadj);
          yy2 += -0.13;
          rout2 += -0.2;
      }
  }
  var xxlist2 = [xxinnlist, xxoutlist, xxout2list];
  var yylist2 = [yyinnlist, yyoutlist, yyout2list];
  var zzlist2 = [zzinnlist, zzoutlist, zzout2list];
  var opalist = [0.4, 0.4, 0.1];
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  // var adjx = 0; var adjy = 0; var adjz = 0;
  var adjx = blockSize*3; var adjy = blockSize_*3; var adjz = blockSize*3;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxlist2.length; ++ii) {
    var xxlist = xxlist2[ii];
    var yylist = yylist2[ii];
    var zzlist = zzlist2[ii];
    var opacity = opalist[ii];
    for (var i = 0; i < n; ++i) {
      var xx1 = xxlist[i];   var yy1 = yylist[i];   var zz1 = zzlist[i];
      var xx2 = xxlist[i+1]; var yy2 = yylist[i+1]; var zz2 = zzlist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = (zz1+zz2)/2;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: opacity});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Funnel_02(x,y,z, rot) {
  // funnel_plt_s
  // 漏斗（平板型）　（小）　30x20x30
  //   ４まいの板を重ねて
  //  [top]
  //  +-----+-----+-----+
  //  |    ＿＿＿＿     |
  //  |   |＼    ／|    |
  //  |   | ｜￣｜ |    |
  //  |   | ｜＿｜ |    |
  //  |   |／    ＼|    |
  //  |    ￣￣￣￣     |
  //  +-----+-----+-----+
  //  [side]
  //  +-----+-----+-----+
  //  |   ＿＿＿＿＿    |
  //  |     ───      |
  //  +-----+-----+-----+
  var sx = 10; var sy = 1; var sz = 30; var ang=Math.atan(1/5);
  var px = 10; var py = 5; var pz = 0;
  var sxyzlist = [[sx, sy, sz],
                  [sz, sy, sx],
                  [sx, sy, sz],
                  [sz, sy, sx],
                 ];
  var pxyzlist = [[px, py, pz],
                  [pz, py, px],
                  [-px, py, pz],
                  [pz, py, -px],
                 ];
  var quatlist = [new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang),
                  new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -ang),
                  new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -ang),
                  new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), ang),
                 ];
  // 降下用のガイド板
  var sx2 = 1; var sy2 = 4; var sz2 = 10;
  var px2 = 5; var py2 = 2; var pz2 = 0;
  var sxyz2list = [[sx2, sy2, sz2],
                   [sz2, sy2, sx2],
                   [sx2, sy2, sz2],
                   [sz2, sy2, sx2],
                  ];
  var pxyz2list = [[px2, py2, pz2],
                   [pz2, py2, px2],
                   [-px2, py2, pz2],
                   [pz2, py2, -px2],
                  ];
  var adjx = blockSize_*3; var adjy = 0; var adjz = blockSize_*3;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < sxyzlist.length; ++ii) {
    var sxx = sxyzlist[ii][0];
    var syy = sxyzlist[ii][1];
    var szz = sxyzlist[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    var pxx = pxyzlist[ii][0];
    var pyy = pxyzlist[ii][1];
    var pzz = pxyzlist[ii][2];
    var quat = quatlist[ii];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz),
                         quat);
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viObj2Mesh.quaternion.copy(quat);
    viCntnrMesh.add(viObj2Mesh);
  }
  for (var ii = 0; ii < sxyz2list.length; ++ii) {
    var sxx = sxyz2list[ii][0];
    var syy = sxyz2list[ii][1];
    var szz = sxyz2list[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    var pxx = pxyz2list[ii][0];
    var pyy = pxyz2list[ii][1];
    var pzz = pxyz2list[ii][2];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viObj2Mesh);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Funnel_03(x,y,z, rot) {
  // funnel_plt_m
  // 漏斗（平板型）　（中）　50x20x50
  //   ４まいの板を重ねて
  //  [top]
  //  +-----+-----+-----+
  //  |    ＿＿＿＿     |
  //  |   |＼    ／|    |
  //  |   | ｜￣｜ |    |
  //  |   | ｜＿｜ |    |
  //  |   |／    ＼|    |
  //  |    ￣￣￣￣     |
  //  +-----+-----+-----+
  //  [side]
  //  +-----+-----+-----+
  //  |   ＿＿＿＿＿    |
  //  |     ───      |
  //  +-----+-----+-----+
  var sx = 20; var sy = 1; var sz = 50; var ang=Math.atan(1/8);
  var px = 15; var py = 5; var pz = 0;
  var sxyzlist = [[sx, sy, sz],
                  [sz, sy, sx],
                  [sx, sy, sz],
                  [sz, sy, sx],
                 ];
  var pxyzlist = [[px, py, pz],
                  [pz, py, px],
                  [-px, py, pz],
                  [pz, py, -px],
                 ];
  var quatlist = [new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang),
                  new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -ang),
                  new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -ang),
                  new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), ang),
                 ];
  // 降下用のガイド板
  var sx2 = 1; var sy2 = 4; var sz2 = 10;
  var px2 = 5; var py2 = 2; var pz2 = 0;
  var sxyz2list = [[sx2, sy2, sz2],
                   [sz2, sy2, sx2],
                   [sx2, sy2, sz2],
                   [sz2, sy2, sx2],
                  ];
  var pxyz2list = [[px2, py2, pz2],
                   [pz2, py2, px2],
                   [-px2, py2, pz2],
                   [pz2, py2, -px2],
                  ];
  var adjx = blockSize_*5; var adjy = 0; var adjz = blockSize_*5;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < sxyzlist.length; ++ii) {
    var sxx = sxyzlist[ii][0];
    var syy = sxyzlist[ii][1];
    var szz = sxyzlist[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    var pxx = pxyzlist[ii][0];
    var pyy = pxyzlist[ii][1];
    var pzz = pxyzlist[ii][2];
    var quat = quatlist[ii];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz),
                         quat);
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viObj2Mesh.quaternion.copy(quat);
    viCntnrMesh.add(viObj2Mesh);
  }
  for (var ii = 0; ii < sxyz2list.length; ++ii) {
    var sxx = sxyz2list[ii][0];
    var syy = sxyz2list[ii][1];
    var szz = sxyz2list[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    var pxx = pxyz2list[ii][0];
    var pyy = pxyz2list[ii][1];
    var pzz = pxyz2list[ii][2];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viObj2Mesh);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}


export function Funnel_04(x,y,z, rot) {
  // funnel_plt_m_c
  // 漏斗（平板型）　（中）　50x20x50
  //   ２まいの板を重ねて。隅に排出穴
  //  [top]
  //  +-----+-----+-----+
  //  |    ＿＿＿＿     |
  //  |   |  |     |    |
  //  |   |￣＼    |    |
  //  |   |    ＼  |    |
  //  |   |      ＼|    |
  //  |    ￣￣￣￣     |
  //  +-----+-----+-----+
  //  [side]
  //  +-----+-----+-----+
  //  |   ＿＿＿＿＿    |
  //  |   ──          |
  //  +-----+-----+-----+
  var sx = 40; var sy = 1; var sz = 50; var ang=Math.atan(1/20);
  var px =  5; var py = 5; var pz = 0;
  var sxyzlist = [[sx, sy, sz],
                  [sz, sy, sx],
                 ];
  var pxyzlist = [[px, py, pz],
                  [pz, py, px],
                 ];
  var quatlist = [new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang),
                  new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -ang),
                 ];
  // ガイド板
  var sx2 = 1; var sy2 = 4; var sz2 = 10;
  var px2 = 5; var py2 = 2; var pz2 = 0;
  var sx3 = 1; var sy3 = 10; var sz3 = 50;
  var px3 = 25; var py3 = 5; var pz3 = 0;
  var sxyz2list = [[sx2, sy2, sz2],
                   [sz2, sy2, sx2],
                   [sx3, sy3, sz3],
                   [sz3, sy3, sx3],
                  ];
  var pxyz2list = [[px2-20, py2, pz2-20],
                   [pz2-20, py2, px2-20],
                   [-px3, py3, pz3],
                   [pz3, py3, -px3],
                  ];
//  var adjx = 0; var adjy = 0; var adjz = 0;
  var adjx = blockSize_*5; var adjy = 0; var adjz = blockSize_*5;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < sxyzlist.length; ++ii) {
    var sxx = sxyzlist[ii][0];
    var syy = sxyzlist[ii][1];
    var szz = sxyzlist[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    var pxx = pxyzlist[ii][0];
    var pyy = pxyzlist[ii][1];
    var pzz = pxyzlist[ii][2];
    var quat = quatlist[ii];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz),
                         quat);
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viObj2Mesh.quaternion.copy(quat);
    viCntnrMesh.add(viObj2Mesh);
  }
  for (var ii = 0; ii < sxyz2list.length; ++ii) {
    var sxx = sxyz2list[ii][0];
    var syy = sxyz2list[ii][1];
    var szz = sxyz2list[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    var pxx = pxyz2list[ii][0];
    var pyy = pxyz2list[ii][1];
    var pzz = pxyz2list[ii][2];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viObj2Mesh);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}


export function Up_00(x,y,z, rot) {
  // up_s
  // レール上下（小径）　10x10x10
  //   細い直方体２本で表現
  //  [top]
  //  +-----+
  //  |＿＿ |
  //  |── |
  //  +-----+
  //  [side]
  //  +---*-+
  //  |   * |
  //  |***  |
  //  +-----+
  var r = blockSize - railPad; // 半径
  var ndivR = 10;  // 円弧（９０度）の分割数
  var drad = PI_/ndivR;  // 分割１つぶんのradian
  var n = 9;  // 要素の個数  円弧（81度）分
  // var xxadj = -blockSize/2;
  // var yyadj = -blockSize/2;
  var xxadj = -blockSize/2+railPad;
  var yyadj = 0;
  var xxlist = [];
  var yylist = [];
  for (var i = 0; i < n+1; ++i) {
      var vrad = i*drad;
      // var xx = Math.cos(vrad);
      // var yy = 1 - Math.sin(vrad);
      var xx = 1 - Math.sin(vrad);
      var yy = 1 - Math.cos(vrad);
      xxlist.push(xx*r+xxadj);
      yylist.push(yy*r+yyadj);
  }
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var pzlist = [railIntr_, -railIntr_];
//  var adjx = 0; var adjy = 0; var adjz = 0;
  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pzlist.length; ++ii) {
    var pz = pzlist[ii];
    for (var i = 0; i < n; ++i) {
      var xx1 = xxlist[i];   var yy1 = yylist[i];
      var xx2 = xxlist[i+1]; var yy2 = yylist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (yy1-yy2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var ang=Math.atan((yy1-yy2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function UpDown_00(x,y,z, rot) {
  // updown_s
  // レール上下（小径）　10x10x10
  //   細い直方体２本で表現
  //  [top]
  //  +-----+
  //  |＿＿ |
  //  |── |
  //  +-----+
  //  [side]
  //  +-----+
  //  |***  |
  //  |   * |
  //  +---*-+
  //  |   * |
  //  |***  |
  //  +-----+
  var r = blockSize - railPad; // 半径
  var ndivR = 10;  // 円弧（９０度）の分割数
  var drad = PI_/ndivR;  // 分割１つぶんのradian
  var n = 20;  // 要素の個数  円弧（180度）分
  // var xxadj = -blockSize/2;
  // var yyadj = -blockSize/2;
  var xxadj = -blockSize/2+railPad;
  var yyadj = 0;
  var xxlist = [];
  var yylist = [];
  for (var i = 0; i < n+1; ++i) {
      var vrad = i*drad;
      var xx = 1 - Math.sin(vrad);
      var yy = 1 - Math.cos(vrad);
      xxlist.push(xx*r+xxadj);
      yylist.push(yy*r+yyadj);
  }
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var pzlist = [railIntr_, -railIntr_];
  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pzlist.length; ++ii) {
    var pz = pzlist[ii];
    for (var i = 0; i < n; ++i) {
      var xx1 = xxlist[i];   var yy1 = yylist[i];
      var xx2 = xxlist[i+1]; var yy2 = yylist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (yy1-yy2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var ang=Math.atan((yy1-yy2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function UpDown_01(x,y,z, rot) {
  // updown_s2
  // レール上下（小径）　10x10x10
  //   細い直方体２本で表現
  //  [top]
  //  +-----+
  //  |＿＿ |
  //  |── |
  //  +-----+
  //  [side]
  //  +-----+
  //  |***  |
  //  |   * |
  //  +---*-+
  //  |   * |
  //  |***  |
  //  +-----+
  var r = blockSize; // 半径
  var ndivR = 10;  // 円弧（９０度）の分割数
  var drad = PI_/ndivR;  // 分割１つぶんのradian
  var n = 20;  // 要素の個数  円弧（180度）分
  // var xxadj = -blockSize/2;
  // var yyadj = -blockSize/2;
  var xxadj = -blockSize/2+railPad;
  var yyadj = 0;
  var xxlist = [];
  var yylist = [];
  for (var i = 0; i < n+1; ++i) {
      var vrad = i*drad;
      var xx = 1 - Math.sin(vrad);
      var yy = 1 - Math.cos(vrad);
      xxlist.push(xx*r+xxadj);
      yylist.push(yy*r+yyadj);
  }
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var pzlist = [railIntr_, -railIntr_];
  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pzlist.length; ++ii) {
    var pz = pzlist[ii];
    for (var i = 0; i < n; ++i) {
      var xx1 = xxlist[i];   var yy1 = yylist[i];
      var xx2 = xxlist[i+1]; var yy2 = yylist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (yy1-yy2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var ang=Math.atan((yy1-yy2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function Down_00(x,y,z, rot) {
  // down_s
  // レール下（小径）　10x10x10
  //   細い直方体２本で表現
  //  [top]
  //  +-----+
  //  |＿＿ |
  //  |── |
  //  +-----+
  //  [side]
  //  +-----+
  //  |***  |
  //  |   * |
  //  +---*-+
  var r = blockSize - railPad; // 半径
  var ndivR = 10;  // 円弧（９０度）の分割数
  var drad = PI_/ndivR;  // 分割１つぶんのradian
  var n = 10;  // 要素の個数  円弧（90度）分
  // var xxadj = -blockSize/2;
  // var yyadj = -blockSize/2;
  var xxadj = -blockSize/2+railPad;
  var yyadj = 0;
  var xxlist = [];
  var yylist = [];
  for (var i = 0; i < n+1; ++i) {
      var vrad = i*drad;
      var xx = 1 - Math.sin(vrad);
      var yy = Math.cos(vrad);
      xxlist.push(xx*r+xxadj);
      yylist.push(yy*r+yyadj);
  }
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var pzlist = [railIntr_, -railIntr_];
//  var adjx = 0; var adjy = 0; var adjz = 0;
  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pzlist.length; ++ii) {
    var pz = pzlist[ii];
    for (var i = 0; i < n; ++i) {
      var xx1 = xxlist[i];   var yy1 = yylist[i];
      var xx2 = xxlist[i+1]; var yy2 = yylist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (yy1-yy2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var ang=Math.atan((yy1-yy2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}


export function VLoop_00(x,y,z, rot) {
  // vloop_s
  // 縦ループ・ピッチ方向（小径）　20x20x10
  //   細い直方体２本で表現
  //  [top]
  //  +-----+-----+
  //  |      __   |
  //  |    ／ ／  |
  //  +  ／ ／ ／ |
  //  |   ／ ／   |
  //  |    ~~     |
  //  +-----+-----+
  //  [side]
  //  +-----+-----+
  //  |    ＿＿   |
  //  |  ／ ＿ ＼ |
  //  + ｜ |＿| ｜|
  //  |  ＼    ／ |
  //  |     ─    |
  //  +-----+-----+
  var r = blockSize - railPad; // 半径
  var ndivR = 10;  // 円弧（９０度）の分割数
  var drad = PI_/ndivR;  // 分割１つぶんのradian
  var n = 40;  // 要素の個数  円弧（180度）分
  // var xxadj = -blockSize/2;
  // var yyadj = -blockSize/2;
  var xxadj = -blockSize/2+railPad;
  var yyadj = 0;
  var xxlist = [];
  var yylist = [];
  var zzlist = []; // 中心
  var zstep = blockSize/40;
  for (var i = 0; i < n+1; ++i) {
      var vrad = i*drad;
      var xx = 1 - Math.sin(vrad);
      var yy = 1 - Math.cos(vrad);
      var zz = i*zstep;
      xxlist.push(xx*r+xxadj);
      yylist.push(yy*r+yyadj);
      zzlist.push(zz);
  }
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var pzaddlist = [railIntr_, -railIntr_];
//  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
  var adjxlist = [blockSize_*1, blockSize_*1, blockSize_*3, blockSize_*3];
  var adjzlist = [blockSize_*1, blockSize_*3, blockSize_*3, blockSize_*1];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_;
  var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pzaddlist.length; ++ii) {
    var pzadd = pzaddlist[ii];
    for (var i = 0; i < n; ++i) {
      var xx1 = xxlist[i];   var yy1 = yylist[i];
      var xx2 = xxlist[i+1]; var yy2 = yylist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (yy1-yy2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = zzlist[i] + pzadd;
      var ang=Math.atan((yy1-yy2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function VLoop_01(x,y,z, rot) {
  // vloop_m
  // 縦ループ・ピッチ方向（中径）　40x40x10
  //   細い直方体２本で表現
  //  [top]
  //  +-----+-----+
  //  |       ──|
  //  |    ／  ─-|
  //  +  ／ ／ ／ +
  //  |   ／ ／   |
  //  |    ／ ／  |
  //  +  ／ ／ ／ +
  //  |   ／ ／   |
  //  |───     |
  //  +-----+-----+
  //  [side]
  //  +-----+-----+
  //  |           |
  //  |   *****   |
  //  +  **   **  +
  //  |   ** **   |
  //  |***********|
  //  +-----+-----+
  var r = blockSize*2 - railPad; // 半径
  var ndivR = 10;  // 円弧（９０度）の分割数
  var drad = PI_/ndivR;  // 分割１つぶんのradian
  var n = 40;  // 要素の個数  円弧（180度）分
  // var xxadj = -blockSize/2;
  // var yyadj = -blockSize/2;
  var xxadj = -blockSize/2+railPad;
  var yyadj = 0;
  var xxlist = [];
  var yylist = [];
  var zzlist = []; // 中心
  var zstep = blockSize/40;
  for (var i = 0; i < n+1; ++i) {
      var vrad = i*drad;
      var xx = 1 - Math.sin(vrad);
      var yy = 1 - Math.cos(vrad);
      var zz = i*zstep;
      xxlist.push(xx*r+xxadj);
      yylist.push(yy*r+yyadj);
      zzlist.push(zz);
  }
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
  var pzaddlist = [railIntr_, -railIntr_];
//  var adjx = 0; var adjy = 0; var adjz = 0;
  var adjxlist = [blockSize_*1, blockSize_*1, blockSize_*7, blockSize_*3];
  var adjzlist = [blockSize_*1, blockSize_*7, blockSize_*3, blockSize_*1];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_;
  var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pzaddlist.length; ++ii) {
    var pzadd = pzaddlist[ii];
    for (var i = 0; i < n; ++i) {
      var xx1 = xxlist[i];   var yy1 = yylist[i];
      var xx2 = xxlist[i+1]; var yy2 = yylist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (yy1-yy2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var py = (yy1+yy2)/2;
      var pz = zzlist[i] + pzadd;
      var ang=Math.atan((yy1-yy2)/(xx1-xx2));
      var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), ang);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}


export function HLoop_00(x,y,z, rot) {
  // hloop_s
  // 横ループ／ループ橋・ピッチ方向（小径）　20x20x20
  //  [top]
  //  +-----+-----+
  //  |    ＿＿   |
  //  |  ／ ＿ ＼ |
  //  + ｜ |＿| ｜|
  //  |  ＼  | ／ |
  //  |     ─    |
  //  +-----+-----+
  //  [side]
  //  +-----+-----+
  //  |      __   |
  //  |    ／ ／  |
  //  +  ／ ／ ／ |
  //  |   ／ ／   |
  //  |    ~~     |
  //  +-----+-----+
  var rinn = (blockSize - railIntr)/2; // 内側の半径
  var rout = (blockSize + railIntr)/2; // 外側の半径
  var rout2 = blockSize; // ガイドレール（大外枠）の半径
  var ndivR = 10;  // 円弧（９０度）の分割数
  var drad = PI_/ndivR;  // 分割１つぶんのradian
  var n = 40;  // 要素の個数  円弧（180度）分
  // var xxadj = -blockSize/2;
  // var zzadj = -blockSize/2;
  var xxadj = 0;
  var zzadj = 0;
  var xxinnlist = [];
  var zzinnlist = [];
  var xxoutlist = [];
  var zzoutlist = [];
  var yylist = [];
  var xxguidelist = [];
  var zzguidelist = [];
  var yyguidelist = [];
  var ystep = blockSize/n;
  for (var i = 0; i < n+1; ++i) {
      var vrad = i*drad;
      var xx = Math.cos(vrad);
      var zz = Math.sin(vrad);
      var yy = i*ystep;
      xxinnlist.push(xx*rinn+xxadj);
      zzinnlist.push(zz*rinn+zzadj);
      xxoutlist.push(xx*rout+xxadj);
      zzoutlist.push(zz*rout+zzadj);
      yylist.push(yy);
      xxguidelist.push(xx*rout2+xxadj);
      zzguidelist.push(zz*rout2+xxadj);
      yyguidelist.push(yy + gardH);
  }
  var xxxlist = [xxinnlist, xxoutlist, xxguidelist];
  var yyylist = [yylist, yylist, yyguidelist];
  var zzzlist = [zzinnlist, zzoutlist, zzguidelist];
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
//  var adjx = 0; var adjy = 0; var adjz = 0;
//  var adjx = -blockSize/2; var adjy = 0; var adjz = +blockSize/2;
  var adjx = blockSize; var adjy = blockSize_; var adjz = blockSize;
  // var adjxlist = [blockSize_*2, blockSize_*2, blockSize_*2, blockSize_*2];
  // var adjzlist = [blockSize_*2, blockSize_*2, blockSize_*2, blockSize_*2];
  // var adjx = adjxlist[rot%4];
  // var adjy = blockSize_;
  // var adjz = adjzlist[rot%4];
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xxlist = xxxlist[ii];
    var yylist = yyylist[ii];
    var zzlist = zzzlist[ii];
    for (var i = 0; i < n; ++i) {
      var xx1 = xxlist[i];   var zz1 = zzlist[i];   var yy = yylist[i];
      var xx2 = xxlist[i+1]; var zz2 = zzlist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var pz = (zz1+zz2)/2;
      var py = yy;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      // var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -ang);
      if (i > n/2) {
        var railQuat1 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), 0.10);
      } else {
        var railQuat1 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -0.10);
      }
      var railQuat2 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -ang);
      var railQuat = railQuat1.mult(railQuat2);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function HLoop_01(x,y,z, rot) {
  // hloop_m
  // 横ループ／ループ橋・ピッチ方向（中径）　40x20x40
  //  [top]
  //  +-----+-----+-----+-----+
  //  |          ＿＿         |
  //  |      ----    ----     |
  //  +    ／            ＼   |
  //  |  ／     ＿＿＿     ＼ |
  //  | ｜    ／      ＼    ｜|
  //  + ｜   ｜        ｜   ｜|
  //  | ｜    ＼＿＿＿／    ｜|
  //  |  ＼        |       ／ |
  //  +    ＼      |     ／   |
  //  |       ---  | ----     |
  //  |          ──         |
  //  +-----+-----+-----+-----+
  //  [side]
  //  +-----+-----+-----+-----+
  //  |      __   |
  //  |    ／ ／  |
  //  +  ／ ／ ／ |
  //  |   ／ ／   |
  //  |    ~~     |
  //  +-----+-----+-----+-----+
  var rinn = (blockSize - railIntr)/2 + blockSize; // 内側の半径
  var rout = (blockSize + railIntr)/2 + blockSize; // 外側の半径
  var rout2 = blockSize*2; // ガイドレール（大外枠）の半径
  var ndivR = 10;  // 円弧（９０度）の分割数
  var drad = PI_/ndivR;  // 分割１つぶんのradian
  var n = 40;  // 要素の個数  円弧（180度）分
  // var xxadj = -blockSize/2;
  // var zzadj = -blockSize/2;
  var xxadj = 0;
  var zzadj = 0;
  var xxinnlist = [];
  var zzinnlist = [];
  var xxoutlist = [];
  var zzoutlist = [];
  var yylist = [];
  var xxguidelist = [];
  var zzguidelist = [];
  var yyguidelist = [];
  var ystep = blockSize/n;
  for (var i = 0; i < n+1; ++i) {
      var vrad = i*drad;
      var xx = Math.cos(vrad);
      var zz = Math.sin(vrad);
      var yy = i*ystep;
      xxinnlist.push(xx*rinn+xxadj);
      zzinnlist.push(zz*rinn+zzadj);
      xxoutlist.push(xx*rout+xxadj);
      zzoutlist.push(zz*rout+zzadj);
      yylist.push(yy);
      xxguidelist.push(xx*rout2+xxadj);
      zzguidelist.push(zz*rout2+xxadj);
      yyguidelist.push(yy + gardH);
  }
  var xxxlist = [xxinnlist, xxoutlist, xxguidelist];
  var yyylist = [yylist, yylist, yyguidelist];
  var zzzlist = [zzinnlist, zzoutlist, zzguidelist];
  var sy = 1; var sz = 1;
  var sy_ = sy/2; var sz_ = sz/2;
//  var adjx = 0; var adjy = 0; var adjz = 0;
//  var adjx = -blockSize/2; var adjy = 0; var adjz = +blockSize/2*3;
  var adjx = blockSize_*4; var adjy = blockSize_; var adjz = blockSize_*4;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < xxxlist.length; ++ii) {
    var xxlist = xxxlist[ii];
    var yylist = yyylist[ii];
    var zzlist = zzzlist[ii];
    for (var i = 0; i < n; ++i) {
      var xx1 = xxlist[i];   var zz1 = zzlist[i];   var yy = yylist[i];
      var xx2 = xxlist[i+1]; var zz2 = zzlist[i+1];
      var sx = Math.sqrt((xx1-xx2)**2 + (zz1-zz2)**2)
      var sx_ = sx/2;
      var px = (xx1+xx2)/2;
      var pz = (zz1+zz2)/2;
      var py = yy;
      var ang=Math.atan((zz1-zz2)/(xx1-xx2));
      // var railQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -ang);
      if (i > n/2) {
        var railQuat1 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), 0.10);
      } else {
        var railQuat1 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -0.10);
      }
      var railQuat2 = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -ang);
      var railQuat = railQuat1.mult(railQuat2);
      {
        moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                             new CANNON.Vec3(px, py, pz),
                             railQuat);
        const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
        const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
        const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
        viRail2Mesh.position.copy(new THREE.Vector3(px, py, pz));
        viRail2Mesh.quaternion.copy(railQuat);
        viCntnrMesh.add(viRail2Mesh);
      }
    }
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}


export function ForkV_00(x,y,z,rot) {
  // fork_v
  // 分岐　垂直　10x10x10
  //   細い直方体２本＋板２枚で表現
  // x,y,z : レールの部品のmin側：表示位置
  // rot : 90度単位
  //  [top]
  //  +-----+
  //  |＿＿ |
  //  |── |
  //  +-----+
  //  [side]
  //  +-----+
  //  |     |
  //  |**|**|
  //  +-----+
  var sx = blockSize; var sy = 1; var sz = 1;
  var sx_ = sx/2; var sy_ = sy/2; var sz_ = sz/2;
  // 原点を部品の中心位置としたときのレール位置の中心
  var px = 0; var py = 0; var pz = railIntr_;
  var pxyzlist = [[px, py, pz],
                  [px, py, -pz]];
  // ガイド板
  var sx2 = blockSize; var sy2 = blockSize_; var sz2 = 0.1; var ang=Math.atan(1/6);
  var px2 = 0; var py2 = sy2; var pz2 = railIntr_ + railPad_;
  var sxyz2list = [[sx2, sy2, sz2],
                   [sx2, sy2, sz2],
                   [0.1,   1, railIntr],];
  var pxyz2list = [[px2, py2, pz2],
                   [px2, py2, -pz2],
                   [  0,   0,    0],];
  var quat2list = [new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), ang),
                   new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -ang),
                   new CANNON.Quaternion(),];
  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pxyzlist.length; ++ii) {
    var pxx = pxyzlist[ii][0];
    var pyy = pxyzlist[ii][1];
    var pzz = pxyzlist[ii][2];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  for (var ii = 0; ii < pxyz2list.length; ++ii) {
    var pxx = pxyz2list[ii][0];
    var pyy = pxyz2list[ii][1];
    var pzz = pxyz2list[ii][2];
    var sxx = sxyz2list[ii][0];
    var syy = sxyz2list[ii][1];
    var szz = sxyz2list[ii][2];
    var quat = quat2list[ii];
    var sxx_ = sxx/2;
    var syy_ = syy/2;
    var szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz),
                         quat);
    // ガイドの表示はwireframeで 
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({color: 0xa0a0a0, transparent: true, opacity: 0.2, wireframe:true});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viObj2Mesh.quaternion.copy(quat);
    viCntnrMesh.add(viObj2Mesh);
  }
  {
    const viObj2Geo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    // const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, wireframe:true});
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(0, blockSize_, 0));
    viCntnrMesh.add(viObj2Mesh);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
}

export function ForkV_01(x,y,z,rot) {
  // fork_v2
  // 分岐　垂直（シーソー）　10x10x10
  //   細い直方体２本＋シーソー板２枚で表現
  //   グループ化したためか、ヒンジの位置でパランスがとれている（重心が上にあるはずなのに）
  //   なので angularDamping を回転しにくく、高めにして動きにくくしておく
  // x,y,z : レールの部品のmin側：表示位置
  // rot : 90度単位
  //  [top]
  //  +-----+
  //  |＿＿ |
  //  |── |
  //  +-----+
  //  [side]
  //  +-----+
  //  |     |
  //  | _|_ |
  //  +-----+
  var sx = blockSize; var sy = 1; var sz = 1;
  var sx_ = sx/2; var sy_ = sy/2; var sz_ = sz/2;
  // 原点を部品の中心位置としたときのレール位置の中心
  var px = 0; var py = 0; var pz = railIntr_;
  var pxyzlist = [[px, py, pz],
                  [px, py, -pz]];
  // シーソー
  var sxyz2list = [[blockSize, 0.01, blockSize],  // シーソー（水平の板）
                   [0.01, blockSize*0.6, blockSize],];  // シーソー（垂直の板）
  var pxyz2list = [[0, 0, 0],
                   [0, blockSize*0.3, 0],];
  // シーソー土台
  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  const moCntnrBody2 = new CANNON.Body({
    mass: 5,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
    angularDamping: 0.99, //def 0.01 回転しにくくしておく
  });
  const viCntnrMesh2 = new THREE.Group();
  for (var ii = 0; ii < pxyzlist.length; ++ii) {
    var pxx = pxyzlist[ii][0]; var pyy = pxyzlist[ii][1]; var pzz = pxyzlist[ii][2];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  for (var ii = 0; ii < pxyz2list.length; ++ii) {
    var pxx = pxyz2list[ii][0]; var pyy = pxyz2list[ii][1]; var pzz = pxyz2list[ii][2];
    var sxx = sxyz2list[ii][0]; var syy = sxyz2list[ii][1]; var szz = sxyz2list[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    moCntnrBody2.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                          new CANNON.Vec3(pxx, pyy, pzz));
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({color: 0xa0a0a0, transparent: true, opacity: 0.2});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh2.add(viObj2Mesh);
  }
  {
    const viObj2Geo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, wireframe:true});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(0, blockSize_, 0));
    viCntnrMesh.add(viObj2Mesh);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
  moCntnrBody2.position = new CANNON.Vec3(x+adjx, y+adjy+blockSize*0.2, z+adjz);
  if (rot != 0) {
    moCntnrBody.quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rot*PI_);
  }
  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody);
  scene.add(viCntnrMesh);
  viCntnrMesh2.position.copy(moCntnrBody2.position);
  viCntnrMesh2.quaternion.copy(moCntnrBody2.quaternion);
  world.addBody(moCntnrBody2);
  scene.add(viCntnrMesh2);
  // シーソーの動きの制約（ヒンジで繋ぐ
  const hingeConst = new CANNON.HingeConstraint(moCntnrBody, moCntnrBody2, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, blockSize*0.2, 0),
    pivotB: new CANNON.Vec3(0, 0, 0),
    collideConnected: true,
  });
  world.addConstraint(hingeConst);
  const hingeConst2 = new CANNON.HingeConstraint(moCntnrBody, moCntnrBody2, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, blockSize*0.2, blockSize*0.4),
    pivotB: new CANNON.Vec3(0, 0, blockSize*0.4),
    collideConnected: true,
  });
  world.addConstraint(hingeConst2);
  const hingeConst3 = new CANNON.HingeConstraint(moCntnrBody, moCntnrBody2, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, blockSize*0.2, -blockSize*0.4),
    pivotB: new CANNON.Vec3(0, 0, -blockSize*0.4),
    collideConnected: true,
  });
  world.addConstraint(hingeConst3);
  // 描画を自動で更新させるために postStepにイベント追加
  world.addEventListener('postStep', () => {
    viCntnrMesh2.position.copy(moCntnrBody2.position);
    viCntnrMesh2.quaternion.copy(moCntnrBody2.quaternion);
  })
}


export function ForkH_00(x,y,z,rot) {
  // fork_h
  // 分岐　水平　10x10x10
  //   細い直方体２本＋板２枚で表現
  // x,y,z : レールの部品のmin側：表示位置
  // rot : 90度単位
  //  [top]
  //  +-----+
  //  | | | |
  //  |＋─ |
  //  | | | |
  //  +-----+
  //  [side]
  //  +-----+
  //  |     |
  //  | *-* |
  //  +-----+
  var sx = blockSize; var sy = 1; var sz = 1;
  var sx_ = sx/2; var sy_ = sy/2; var sz_ = sz/2;
  // 原点を部品の中心位置としたときのレール位置の中心
  var px = 0; var py = 0; var pz = railIntr_;
  var pxyzlist = [[px, py, pz],
                  [px, py, -pz]];
  // ガイド板
//  var px2 = 0; var py2 = sy2; var pz2 = railIntr_ + railPad_;
  var sxyz2list = [[blockSize, blockSize, 0.1],
                   [blockSize, 0.1, blockSize],
                   [0.1,  0.1,  blockSize],];
  var pxyz2list = [[ 0, blockSize_, -blockSize_],
                   [ 0, blockSize, 0],
                   [ 0, 0, 0],];
  var adjx = blockSize_; var adjy = blockSize_; var adjz = blockSize_;
  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pxyzlist.length; ++ii) {
    var pxx = pxyzlist[ii][0];
    var pyy = pxyzlist[ii][1];
    var pzz = pxyzlist[ii][2];
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sx, sy, sz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  for (var ii = 0; ii < pxyz2list.length; ++ii) {
    var pxx = pxyz2list[ii][0];
    var pyy = pxyz2list[ii][1];
    var pzz = pxyz2list[ii][2];
    var sxx = sxyz2list[ii][0];
    var syy = sxyz2list[ii][1];
    var szz = sxyz2list[ii][2];
    var sxx_ = sxx/2;
    var syy_ = syy/2;
    var szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    // ガイドの表示はwireframeで 
    const viObj2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viObj2Mtr = new THREE.MeshBasicMaterial({color: 0xa0a0a0, transparent: true, opacity: 0.2, wireframe:true});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    // viObj2Mesh.quaternion.copy(quat);
    viCntnrMesh.add(viObj2Mesh);
  }
  {
    const viObj2Geo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    // const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, wireframe:true});
    const viObj2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viObj2Mesh = new THREE.Mesh(viObj2Geo, viObj2Mtr);
    viObj2Mesh.position.copy(new THREE.Vector3(0, blockSize_, 0));
    viCntnrMesh.add(viObj2Mesh);
  }
  moCntnrBody.position = new CANNON.Vec3(x+adjx, y+adjy, z+adjz);
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
  var sW = blockSize*1.8; var sH = blockSize*0.5; var sD = 0.1;
  var sH_ = sH/2;
  var sxyzlist = [[sW, sH, sD],  // x軸方向
                  [sD, sH, sW]]; // z軸方向
  var pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  // 土台（ポール：Y軸）
  var sxyz2list = [[sD, sH, sD]];
  var pxyz2list = [[0, 0, 0]];
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pxyzlist.length; ++ii) {
    var pxx = pxyzlist[ii][0]; var pyy = pxyzlist[ii][1]; var pzz = pxyzlist[ii][2];
    var sxx = sxyzlist[ii][0]; var syy = sxyzlist[ii][1]; var szz = sxyzlist[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  var moBase2Body;
  var viBase2Mesh;
  {
    var ii = 0;
    var pxx = pxyz2list[ii][0]; var pyy = pxyz2list[ii][1]; var pzz = pxyz2list[ii][2];
    var sxx = sxyz2list[ii][0]; var syy = sxyz2list[ii][1]; var szz = sxyz2list[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    var moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    var viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  var adjx = blockSize; var adjy = blockSize_+ballR; var adjz = blockSize;
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
  var sW = blockSize*1.8; var sH = blockSize*0.5; var sD = 0.1;
  var sH_ = sH/2;
  var sxyzlist = [[sW, sD, sH],  // x軸方向
                  [sD, sW, sH]]; // y軸方向
  var pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  // 土台（ポール：Z軸）
  var sxyz2list = [[sD, sD, sH]];
  var pxyz2list = [[0, 0, 0]];
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pxyzlist.length; ++ii) {
    var pxx = pxyzlist[ii][0]; var pyy = pxyzlist[ii][1]; var pzz = pxyzlist[ii][2];
    var sxx = sxyzlist[ii][0]; var syy = sxyzlist[ii][1]; var szz = sxyzlist[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  var moBase2Body;
  var viBase2Mesh;
  {
    var ii = 0;
    var pxx = pxyz2list[ii][0]; var pyy = pxyz2list[ii][1]; var pzz = pxyz2list[ii][2];
    var sxx = sxyz2list[ii][0]; var syy = sxyz2list[ii][1]; var szz = sxyz2list[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    var moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    var viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
//  var adjx = 0; var adjy = 0; var adjz = 0;
  var adjxlist = [blockSize_*2, blockSize_*1, blockSize_*2, blockSize_*1];
  var adjzlist = [blockSize_*1, blockSize_*2, blockSize_*1, blockSize_*2];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_*3;
  var adjz = adjzlist[rot%4];
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

export function Windmill_02(x,y,z,rot) {
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
  var sW = blockSize*1.8; var sH = blockSize*0.5; var sD = 0.1;
  var sH_ = sH/2;
  var sxyzlist = [[sW, sH, sD],  // x軸方向
                  [sD, sH, sW]]; // z軸方向
  var pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  // 土台（ポール：Y軸）
  var sxyz2list = [[sD, sH, sD]];
  var pxyz2list = [[0, 0, 0]];
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pxyzlist.length; ++ii) {
    var pxx = pxyzlist[ii][0]; var pyy = pxyzlist[ii][1]; var pzz = pxyzlist[ii][2];
    var sxx = sxyzlist[ii][0]; var syy = sxyzlist[ii][1]; var szz = sxyzlist[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  var moBase2Body;
  var viBase2Mesh;
  {
    var ii = 0;
    var pxx = pxyz2list[ii][0]; var pyy = pxyz2list[ii][1]; var pzz = pxyz2list[ii][2];
    var sxx = sxyz2list[ii][0]; var syy = sxyz2list[ii][1]; var szz = sxyz2list[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    var moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    var viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  var adjx = blockSize; var adjy = blockSize_+ballR; var adjz = blockSize;
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
  var vspeed = 0.2
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
  var sW = blockSize*1.8; var sH = blockSize*0.5; var sD = 0.1;
  var sH_ = sH/2;
  var sxyzlist = [[sW, sD, sH],  // x軸方向
                  [sD, sW, sH]]; // y軸方向
  var pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  // 土台（ポール：Z軸）
  var sxyz2list = [[sD, sD, sH]];
  var pxyz2list = [[0, 0, 0]];
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 0.01,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pxyzlist.length; ++ii) {
    var pxx = pxyzlist[ii][0]; var pyy = pxyzlist[ii][1]; var pzz = pxyzlist[ii][2];
    var sxx = sxyzlist[ii][0]; var syy = sxyzlist[ii][1]; var szz = sxyzlist[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  var moBase2Body;
  var viBase2Mesh;
  {
    var ii = 0;
    var pxx = pxyz2list[ii][0]; var pyy = pxyz2list[ii][1]; var pzz = pxyz2list[ii][2];
    var sxx = sxyz2list[ii][0]; var syy = sxyz2list[ii][1]; var szz = sxyz2list[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    var moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    var viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
//  var adjx = 0; var adjy = 0; var adjz = 0;
  var adjxlist = [blockSize_*2, blockSize_*1, blockSize_*2, blockSize_*1];
  var adjzlist = [blockSize_*1, blockSize_*2, blockSize_*1, blockSize_*2];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_*3;
  var adjz = adjzlist[rot%4];
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
  var vspeed = 0.2
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
  var sW = blockSize*1.8; var sH = blockSize*0.5; var sD = 0.1;
  var sH_ = sH/2;
  var sxyzlist = [[sW, sH, sD],  // x軸方向
                  [sD, sH, sW]]; // z軸方向
  var pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  // 土台（ポール：Y軸）
  var sxyz2list = [[sD, sH, sD]];
  var pxyz2list = [[0, 0, 0]];
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 100,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pxyzlist.length; ++ii) {
    var pxx = pxyzlist[ii][0]; var pyy = pxyzlist[ii][1]; var pzz = pxyzlist[ii][2];
    var sxx = sxyzlist[ii][0]; var syy = sxyzlist[ii][1]; var szz = sxyzlist[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  var moBase2Body;
  var viBase2Mesh;
  {
    var ii = 0;
    var pxx = pxyz2list[ii][0]; var pyy = pxyz2list[ii][1]; var pzz = pxyz2list[ii][2];
    var sxx = sxyz2list[ii][0]; var syy = sxyz2list[ii][1]; var szz = sxyz2list[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    var moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    var viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
  var adjx = blockSize; var adjy = blockSize_+ballR; var adjz = blockSize;
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
  var vspeed = 0.2
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
  var sW = blockSize*1.8; var sH = blockSize*0.5; var sD = 0.1;
  var sH_ = sH/2;
  var sxyzlist = [[sW, sD, sH],  // x軸方向
                  [sD, sW, sH]]; // y軸方向
  var pxyzlist = [[0, 0, 0],
                  [0, 0, 0]];
  // 土台（ポール：Z軸）
  var sxyz2list = [[sD, sD, sH]];
  var pxyz2list = [[0, 0, 0]];
  // 羽を組み立て
  const moCntnrBody = new CANNON.Body({
    mass: 100,
    position: new CANNON.Vec3(0, 0, 0),
    material: moRailMtr,
  });
  const viCntnrMesh = new THREE.Group();
  for (var ii = 0; ii < pxyzlist.length; ++ii) {
    var pxx = pxyzlist[ii][0]; var pyy = pxyzlist[ii][1]; var pzz = pxyzlist[ii][2];
    var sxx = sxyzlist[ii][0]; var syy = sxyzlist[ii][1]; var szz = sxyzlist[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
                         new CANNON.Vec3(pxx, pyy, pzz));
    const viRail2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viRail2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
    const viRail2Mesh = new THREE.Mesh(viRail2Geo, viRail2Mtr);
    viRail2Mesh.position.copy(new THREE.Vector3(pxx, pyy, pzz));
    viCntnrMesh.add(viRail2Mesh);
  }
  // 土台..簡単にbox１つですませる
  var moBase2Body;
  var viBase2Mesh;
  {
    var ii = 0;
    var pxx = pxyz2list[ii][0]; var pyy = pxyz2list[ii][1]; var pzz = pxyz2list[ii][2];
    var sxx = sxyz2list[ii][0]; var syy = sxyz2list[ii][1]; var szz = sxyz2list[ii][2];
    var sxx_ = sxx/2; var syy_ = syy/2; var szz_ = szz/2;
    var moBase2Body = new CANNON.Body
      ({mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(sxx_, syy_, szz_)),
        position: new CANNON.Vec3(pxx, pyy, pzz),
       });
    const viBase2Geo = new THREE.BoxGeometry(sxx, syy, szz);
    const viBase2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x000000});
    var viBase2Mesh = new THREE.Mesh(viBase2Geo, viBase2Mtr);
  }
//  var adjx = 0; var adjy = 0; var adjz = 0;
  var adjxlist = [blockSize_*2, blockSize_*1, blockSize_*2, blockSize_*1];
  var adjzlist = [blockSize_*1, blockSize_*2, blockSize_*1, blockSize_*2];
  var adjx = adjxlist[rot%4];
  var adjy = blockSize_*3;
  var adjz = adjzlist[rot%4];
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
  var vspeed = 0.2
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

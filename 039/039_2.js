// mode:javascript

// drone
//
// - アップダウンコース

import * as THREE from "three";
import * as CANNON from "cannon";
import * as ST from "Slopetoy";

import { OrbitControls } from "orbitcontrols";

const timeStep = 1 / 30;

export class Gamepad {
  // ゲームパッド
  enable_;
  gpi_;
  stickGap_;
  para_;

  constructor() {
    this.init()

    addEventListener("gamepadconnected", (e) => {
      //処理
      this.enable_ = true;
      this.gpi_ = e.gamepad.index;
    });
  }

  init() {
    this.enable_ = false;
    this.gpi_ = -1;
    this.stickGap_ = 0.01;
    this.para_ = {
      stcLH:0,  // スティック左　左右
      stcLV:0,  // スティック左　上下
      stcRH:0,  // スティック右　左右
      stcRV:0,  // スティック右　上下
      btnA:false,
      btnB:false,
      btnX:false,
      btnY:false,
      crsU:false, // 十字　上
      crsD:false, // 十字　下
      crsL:false, // 十字　左
      crsR:false, // 十字　右
    };
  }

  update() {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[this.gpi_];
    if (gp == undefined) {
      console.log("gp=", gp);
      return;
    }
    if (gp.buttons == undefined) {
      console.log("gp=", gp);
      return;
    }
    const gpbuttons = gp.buttons;
    const gpsticks = gp.axes;

    if (Math.abs(gpsticks[0]) > this.stickGap_) {
    // ステック左：左右
        this.para_.stcLH = gpsticks[0];
    } else {
      this.para_.stcLH = 0;
    }
    if (Math.abs(gpsticks[1]) > this.stickGap_) {
      // ステック左：上下
      this.para_.stcLV = -gpsticks[1];
    } else {
      this.para_.stcLV = 0;
    }

    if (Math.abs(gpsticks[2]) > this.stickGap_) {
      // ステック右：左右　左右移動
      this.para_.stcRH = -gpsticks[2];
    } else {
      this.para_.stcRH = 0;
    }
    if (Math.abs(gpsticks[3]) > this.stickGap_) {
      // ステック右：上下　上昇/下降
      this.para_.stcRV = -gpsticks[3];
    } else {
      this.para_.stcRV = 0;
    }

    this.para_.btnA = gpbuttons[0].pressed;
    this.para_.btnB = gpbuttons[1].pressed;
    this.para_.btnX = gpbuttons[2].pressed;
    this.para_.btnY = gpbuttons[3].pressed;

    this.para_.crsU = gpbuttons[12].pressed;
    this.para_.crsD = gpbuttons[13].pressed;
    this.para_.crsL = gpbuttons[14].pressed;
    this.para_.crsR = gpbuttons[15].pressed;
  }
};

export class GamepadDrone extends Gamepad {
  // ゲームパッド　ドローン操作拡張
  constructor(mode) {
    super();
    this.setMode(mode);
  }
  init() {
    console.log("GamepadDrone::init()");
    super.init();
    this.droneMode_ = 0;
    this.para2_ = {
      frbk: 0,  // 前進/後進
      yaw:0,  // 左右旋回
      updn:0,    // 上昇/下降
      slide:0, // 左右移動(スライド)
    };
    this.droneParaFunc_ = null;
    this.setMode(this.droneMode_);
  };

  droneParaFuncNone() {
    //console.log("GamepadDrone::droneParaFuncNone()");
  };
  droneParaFuncMode1() {
    //console.log("GamepadDrone::droneParaFuncMode1()");
    // ドローン（モード１）左：前後移動・左右旋回　右スティック：上昇下降・左右移動
    this.para2_.frbk  = this.para_.stcLV;
    this.para2_.yaw   = -this.para_.stcLH;
    this.para2_.updn  = this.para_.stcRV;
    this.para2_.slide = -this.para_.stcRH;
  };
  droneParaFuncMode2() {
    //console.log("GamepadDrone::droneParaFuncMode2()");
    // ドローン（モード２）左：上昇下降・左右旋回　右スティック：前後移動・左右移動
    this.para2_.updn  = this.para_.stcLV;
    this.para2_.yaw   = -this.para_.stcLH;
    this.para2_.frbk  = this.para_.stcRV;
    this.para2_.slide = -this.para_.stcRH;
  };

  setMode(imode) {
    this.droneMode_ = imode;
    if (imode == 1) {
      this.droneParaFunc_ = this.droneParaFuncMode1;
    } else if (imode == 2) {
      this.droneParaFunc_ = this.droneParaFuncMode2;
    } else {
      this.droneParaFunc_ = this.droneParaFuncNone;
    }
  }

  update() {
    super.update();
    this.droneParaFunc_();
  }

};

/*

// standardタイプのコントローラのマッピングです。
const BUTTON_A_INDEX     = 0;
const BUTTON_B_INDEX     = 1;
const BUTTON_X_INDEX     = 2;
const BUTTON_Y_INDEX     = 3;
const BUTTON_LB_INDEX    = 4;
const BUTTON_RB_INDEX    = 5;
const BUTTON_LT_INDEX    = 6;
const BUTTON_RT_INDEX    = 7;
const BUTTON_BACK_INDEX  = 8;
const BUTTON_START_INDEX = 9;
const BUTTON_L3_INDEX    = 10;
const BUTTON_R3_INDEX    = 11;
const BUTTON_UP_INDEX    = 12;
const BUTTON_DOWN_INDEX  = 13;
const BUTTON_LEFT_INDEX  = 14;
const BUTTON_RIGHT_INDEX = 15;
const BUTTON_HOME_INDEX  = 16;

// standardタイプのコントローラのマッピングです。
const AXIS_L_HORIZONTAL_INDEX = 0;
const AXIS_L_VERTICAL_INDEX   = 1;
const AXIS_R_HORIZONTAL_INDEX = 2;
const AXIS_R_VERTICAL_INDEX   = 3;

*/

function setupWorld() {
  const world = new CANNON.World()
  world.gravity.set(0, -10, 0)
  // Sweep and prune broadphase
  world.broadphase = new CANNON.SAPBroadphase(world)
  // Disable friction by default
  world.defaultContactMaterial.friction = 0

  let camera;
  let scene;
  let renderer;
  let orbitControls;
  {
    const width = window.innerWidth - 24;
    const height = window.innerHeight - 24;

    // Camera
    camera = new THREE.PerspectiveCamera(24, width / height, 5, 2000)

    camera.position.set(0, 20, 30)
    camera.lookAt(0, 0, 0)

    // Scene
    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x222222, 1000, 2000)
//    scene.fog = new THREE.Fog(0x222222, 50, 500)

    // Renderer
    const canvasElement = document.querySelector("#myCanvas");
    renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true })
    renderer.setSize(width, height);

    renderer.setClearColor(scene.fog.color, 1)

    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.15)
    directionalLight.position.set(-30, 10000, 30)
    directionalLight.target.position.set(0, 0, 0)
    scene.add(directionalLight)

    // Orbit controls
    orbitControls = new OrbitControls(camera, canvasElement);
    orbitControls.rotateSpeed = 1.0
    orbitControls.zoomSpeed = 1.2
    orbitControls.enableDamping = true
    orbitControls.enablePan = true
    orbitControls.dampingFactor = 0.2  // 小：滑る　／　大：クイックに止まる
    orbitControls.minDistance = 10
    orbitControls.maxDistance = 10000
  }

  return {world, camera, scene, renderer, orbitControls};
}



window.onload = () => {
  const {world, camera, scene, renderer, orbitControls} = setupWorld();

  orbitControls.autoRotate = false;
  ST.init0(world, scene);

  const moGroundMtr = new CANNON.Material({name: 'ground'});

  // 地面代わりのbox
  const grndw = 100; const grndh = 100;
  const moGround2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(grndw, 0.5, grndh)),
    position: new CANNON.Vec3(0, -0.5, 0),
    material: moGroundMtr,
  });
  world.addBody(moGround2Body);
  const viGround2Geo = new THREE.BoxGeometry(grndw*2, 1, grndh*2);
  const viGround2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, color:"#008000"});
  const viGround2Mesh = new THREE.Mesh(viGround2Geo, viGround2Mtr);
  scene.add(viGround2Mesh);
  viGround2Mesh.position.copy(moGround2Body.position);
  viGround2Mesh.quaternion.copy(moGround2Body.quaternion);

  // // 基準面を作成 (100pixel四方を 5x5分割   1x1 size
  // // const viBaseGrid2 = new THREE.GridHelper(100, 100, 0xff8888, 0x004000);
  // const viBaseGrid2 = new THREE.GridHelper(1000, 1000, 0xff8888, 0x004000);
  // viBaseGrid2.position.set(0, 0, -0.04);
  // scene.add(viBaseGrid2);

  // 基準面を作成 (100pixel四方を 10x10分割  10x10size
  // const viBaseGrid = new THREE.GridHelper(100, 10, 0xff8888, 0xc0c0c0);
  const viBaseGrid = new THREE.GridHelper(200, 20, 0xff8888, 0xc0c0c0);
//  const viBaseGrid = new THREE.GridHelper(1000, 100, 0xff8888, 0xc0c0c0);
  viBaseGrid.position.set(0, 0, -0.01);
  scene.add(viBaseGrid);

  let srclist = [];
  let actuatorlist = [];

  // ----------------------------------------
  const moDroneMtr = new CANNON.Material({name: 'drone'});
  let moDrone;
  let viDrone;
  {
    moDrone = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 0, 0),
      material: moDroneMtr,
      linearDamping : 0.5, //def 0.01 直進しにくくしておく／慣性で滑りにくくする
      angularDamping: 0.5, //def 0.01 回転しにくくしておく／慣性で回転しにくくする
    });
    moDrone.bDrone = 1;
    viDrone = new THREE.Group();
    //
    {
      let sx = 4; let sy = 0.5; let sz = 2;
      let sx_ = sx/2; let sy_ = sy/2; let sz_ = sz/2;
      let px = 0; let py = 0.25; let pz = 0;
      moDrone.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                        new CANNON.Vec3(px, py, pz));
      const viPartGeo = new THREE.BoxGeometry(sx, sy, sz);
      const viPartMtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.7});
      const viPartMesh = new THREE.Mesh(viPartGeo, viPartMtr);
      viPartMesh.position.copy(new THREE.Vector3(px, py, pz));
      viDrone.add(viPartMesh);
    }
    {
      let sx = 1; let sy = 0.5; let sz = 1;
      let sx_ = sx/2; let sy_ = sy/2; let sz_ = sz/2;
      let px = 1.5; let py = 0.75; let pz = 0;
      moDrone.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                        new CANNON.Vec3(px, py, pz));
      const viPartGeo = new THREE.BoxGeometry(sx, sy, sz);
      const viPartMtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.3, color:"#ff0000"});
      const viPartMesh = new THREE.Mesh(viPartGeo, viPartMtr);
      viPartMesh.position.copy(new THREE.Vector3(px, py, pz));
      viDrone.add(viPartMesh);
    }

    const drone_ground = new CANNON.ContactMaterial(moDroneMtr, moGroundMtr, {
      friction: 0.01,  // 0.9,  // 摩擦係数(def=0.3)
      restitution: 0.3, // 0,  // 反発係数 (def=0.3)
      contactEquationStiffness: 1e7,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
    })
    world.addContactMaterial(drone_ground)

    world.addEventListener('postStep', () => {
      viDrone.position.copy(moDrone.position);
      viDrone.quaternion.copy(moDrone.quaternion);
    })
  }
  world.addBody(moDrone);
  scene.add(viDrone);
  const ddir0 = new CANNON.Vec3(-1, 0, 0);
  let ddir = moDrone.quaternion.vmult(ddir0);
  const qRotYR = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI/2);
  const ddirF = ddir.scale(10);
  const ddirB = ddirF.negate();
  const ddirFL = qRotYR.vmult(ddirF); // 力をかける左方向
  const qRotYR_ = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI/2);
  const ddirFR = qRotYR_.vmult(ddirF);  // 力をかける右方向
  const ddirFU = new CANNON.Vec3(0, 20, 0);   // 力をかける上方向
  const ddirFUp = new CANNON.Vec3(0, 10, 0);   // 力をかける上方向 (FU_との差分)
  const ddirFU_ = new CANNON.Vec3(0, 9.99, 0); // up/downないときの、その場にキープさせるための 力をかける上方向（重力=10よりやや弱くすることで、次第に落ちるように
  const ddirFD = new CANNON.Vec3(0, 5, 0);    // 力をかける下方向

  function moDroneYaw(v) {
      const qRotY = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), v);
      moDrone.quaternion.copy(moDrone.quaternion.mult(qRotY));
      ddir = moDrone.quaternion.vmult(ddir0);
      ddirF.copy(ddir.scale(10));
      ddirB.copy(ddirF.negate());
      ddirFL.copy(qRotYR.vmult(ddirF)); // 左方向
      ddirFR.copy(qRotYR_.vmult(ddirF));  // 右方向
  };

  // ----------------------------------------
  // !!

  // - アップダウンコース
  if (1) {
    // let x1 = 500, y1 = 100, z1 = -500;
    let x1 = 0, y1 = 0, z1 = 0;
//    let x2 = 500, y2 = 60, z2 = 600;
//    let x2 = 200, y2 = 60, z2 = 500;
    let x2 = 0, y2 = 0, z2 = 0;
    const dataInfo = [["rail_st_slope"          ,   30,  30, -100, 2],
                      ["rail_st100"             ,   30,   0, -100, 0],
                      ["rail_st_slopeH10L40"    ,  130,   0, -100, 0],
                      ["rail_st_slopeH10L20"    ,  180,  10, -100, 0],
                      ["rail_st_slopeH20L20"    ,  210,  20, -100, 0],
                      ["rail_st_slopeH40L20"    ,  230,  40, -100, 0],
                      ["rail_st_slopeH40L20"    ,  220,  40, -100, 0],
                      ["rail_st_slopeH20L20"    ,  250,  80, -100, 0],
                      ["rail_st_slopeH20L20"    ,  240,  80, -100, 0],
                      ["rail_st_slopeH10L20"    ,  270, 100, -100, 0],
                      ["rail_st_slopeH10L20"    ,  260, 100, -100, 0],
                      ["rail_st50"              ,  290, 110, -100, 0],
                      ["rail_st50"              ,  280, 120, -100, 0],
                      ["rail_arc50"             ,  330, 110, -100, 1], // +＼
                      ["rail_arc50v10r"         ,  330, 100, -50, 0],  // D *／ U
                      ["rail_arc60v10r"         ,  270,  90, -60, 3],  // D ＼* U
                      ["rail_st50"              ,  270,  90, -110, 1],
                      ["rail_st_slopeH60L20"    ,  270,  30, -130, 1],
                      ["rail_st_slopeH40L20"    ,  270, -10, -110, 1],
                      ["rail_st_slopeH20L20"    ,  270, -30, -90, 1],
                      ["rail_st_slopeH10L20"    ,  270, -40, -70, 1],
                      ["rail_st_slopeH10L40"    ,  270, -50, -50, 1],
                      // ["rail_st50"              ,  270, -40, -60, 1],
                      ["rail_st50"              ,  270, -50, -10, 1],
                      ["rail_st_slopeH10L20"    ,  270, -50,  40, 3],
                      ["rail_st_slopeH20L20"    ,  270, -40,  60, 3],
                      ["rail_st_slopeH20L20"    ,  270, -20,  80, 3],
                      // ["rail_st_slopeH10L20"    ,  270,   0, 100, 3],
                      ["rail_st_slopeH10L50"    ,  270,  10, 120, 3],
                      ["rail_arc40v10r"         ,  270,  20, 170, 3],  // D ＼* U
                      // ["rail_arc40v10r"         ,  270,  26, 170, 3],  // D ＼* U
                      ["rail_arc50"             ,  310,  30, 200, 1], // +＼
                      ["rail_st_slopeH10L50"    ,  350,  30, 250, 3],
                      // ["rail_arc50"             ,  310,  40, 300, 0],  // +／
                      ["rail_arc60v10r"         ,  300,  30, 300, 0],  // D *／ U
                      ["rail_st_slopeH10L50"    ,  250,  20, 350, 0],
                      ["rail_st_slopeH10L50"    ,  200,  10, 350, 0],
                      ["rail_st_slopeH10L50"    ,  150,   0, 350, 0],
                      ["rail_st100"             ,   50,   0, 350, 0],
                      ["rail_st100"             ,  -50,   0, 350, 0],
                      ["rail_st_slopeH10L100"   , -150, -10, 350, 0],
                      ["rail_st100"             , -250, -10, 350, 0],
                      ["rail_st_slopeH10L100"   , -350, -10, 350, 2],
                      // // ["rail_arc60v10r"         , -410,   0, 350, 2],  // U ／* D
                      // // ["rail_arc60v10r"         , -410,   6, 350, 2],  // U ／* D
                      // // ["rail_arc60v10"          , -460,  10, 410, 0],  // U *／ D
                      // // ["rail_arc60v10"          , -460,  16, 410, 0],  // U *／ D
                      ["rail_arc60v10r"         ,x1 -410,y1+   0,z1+ 350, 2],  // U ／* D
                      ["rail_arc60v10r"         ,x1 -410,y1+  10,z1+ 350, 2],  // U ／* D
                      ["rail_arc60v10"          ,x1 -460,y1+  10,z1+ 410, 0],  // U *／ D
                      ["rail_arc60v10"          ,x1 -460,y1+  20,z1+ 410, 0],  // U *／ D
                      ["rail_arc60v10r"         ,x1 -520,y1+  20,z1+ 460, 2],  // U ／* D
                      ["rail_arc60v10r"         ,x1 -520,y1+  30,z1+ 460, 2],  // U ／* D
                      ["rail_arc50v10"          ,x1 -560,y1+  30,z1+ 520, 0],  // U *／ D
                      ["rail_arc50v10"          ,x1 -560,y1+  40,z1+ 520, 0],  // U *／ D
                      ["rail_arc60v10r"         ,x1 -620,y1+  40,z1+ 560, 2],  // U ／* D
                      ["rail_arc60v10r"         ,x1 -620,y1+  50,z1+ 560, 2],  // U ／* D
                      ["rail_arc50"             ,x1 -620,y1+  50,z1+ 620, 3],  // ＼+
                      ["rail_st_slopeH10L50"    ,x1 -570,y1+  50,z1+ 660, 0],
                      ["rail_arc50"             ,x1 -520,y1+  60,z1+ 660, 1],  // +＼
                      ["rail_arc50"             ,x1 -520,y1+  60,z1+ 710, 0],  // +／
                      ["rail_st50"              ,x1 -570,y1+  60,z1+ 750, 0],
                      ["rail_arc50"             ,x1 -620,y1+  60,z1+ 710, 3],  // ＼+
                      ["rail_st50"              ,x1 -620,y1+  60,z1+ 660, 1],
                      ["rail_st"                ,x1 -620,y1+  60,z1+ 650, 1],
                      ["rail_st"                ,x1 -620,y1+  60,z1+ 640, 1],
                      ["rail_st"                ,x1 -620,y1+  60,z1+ 630, 1],
                      ["rail_st"                ,x1 -620,y1+  60,z1+ 620, 1],
                      // // // ["rail_arc50"             ,x1 -350,y1+  10,z1+ 310, 0],  // +／
                      // // // ["rail_arc50v10r"         ,x1 -310,y1+   0,z1+ 260, 2],  // U ／* D
                      // // // ["rail_arc50"             ,x1 -260,y1+   0,z1+ 220, 0],  //  *／ 
                      // // ["rail_st100"             ,x1 -350,y1+  10,z1+ 350, 0],
                      // // ["rail_arc40"             ,x1 -250,y1+  10,z1+ 320, 0],  //  *／
                      // // ["rail_st50"              ,x1 -220,y1+  10,z1+ 270, 1],
                      ["rail_st_slopeH10L100"   ,x1 -350,y1+   0,z1+ 350, 2],
                      ["rail_arc40"             ,x1 -250,y1+   0,z1+ 320, 0],  //  *／
                      // ["rail_st50"              ,x1 -220,y1+   0,z1+ 270, 1],
                      ["rail_st100"             ,x1 -220,y1+   0,z1+ 220, 1],
                      ["rail_st100"             ,x1 -220,y1+   0,z1+ 120, 1],
                      ["rail_st100"             ,x2 -220,y2+   0,z2+  20, 1],
                      ["rail_st_slopeH10L100"   ,x2 -220,y2+   0,z2+  -80, 1],
                      ["rail_arc100"            ,x2 -310,y2+  10,z2+ -180, 1],  // +＼
                      ["rail_st_slopeH10L100"   ,x2 -410,y2+  10,z2+ -180, 2],
                      ["rail_arc50"             ,x2 -460,y2+  20,z2+ -220, 3],  // ＼+
                      ["rail_arc50"             ,x2 -460,y2+  20,z2+ -270, 2],  // ／*
                      ["rail_st_slopeH10L100"   ,x2 -410,y2+  20,z2+ -270, 0],
                      ["rail_arc40"             ,x2 -310,y2+  30,z2+ -300, 0],  //  *／
                      ["rail_arc40"             ,x2 -310,y2+  30,z2+ -340, 1],  // +＼
                      ["rail_st_slopeH10L100"   ,x2 -410,y2+  30,z2+ -340, 2],
                      ["rail_arc100"            ,x2 -510,y2+  40,z2+ -340, 2],  // ／*
                      ["rail_arc100"            ,x2 -600,y2+  40,z2+ -240, 0],  //  *／
                      ["rail_st_slopeH10L100"   ,x2 -700,y2+  40,z2+ -150, 2],
                      ["rail_arc100"            ,x2 -800,y2+  50,z2+ -240, 3],  // ＼+
                      ["rail_arc50"             ,x2 -840,y2+  50,z2+ -290, 1],  // +＼
                      ["rail_st_slopeH10L100"   ,x2 -940,y2+  50,z2+ -290, 2],
                      ["rail_arc100"            ,x2-1040,y2+  60,z2+ -380, 3],  // ＼+
                      ["rail_arc100"            ,x2-1040,y2+  60,z2+ -480, 2],  // ／*
                      ["rail_st_slopeH10L100"   ,x2 -940,y2+  60,z2+ -480, 0],
                      ["rail_arc90"             ,x2 -840,y2+  70,z2+ -480, 1],  // +＼
                      ["rail_arc90"             ,x2 -840,y2+  70,z2+ -390, 0],  //  *／
                      ["rail_st_slopeH10L100"   ,x2 -940,y2+  70,z2+ -310, 2],
                      ["rail_arc110"            ,x2-1050,y2+  80,z2+ -410, 3],  // ＼+
                      ["rail_st_slopeH10L100"   ,x2-1050,y2+  80,z2+ -510, 1],
                      ["rail_arc100"            ,x2-1140,y2+  90,z2+ -610, 1],  // +＼
                      ["rail_arc50"             ,x2-1190,y2+  90,z2+ -650, 3],  // ＼+
                      ["rail_arc50"             ,x2-1190,y2+  90,z2+ -700, 2],  // ／*
                      ["rail_arc100"            ,x2-1140,y2+  90,z2+ -790, 0],  //  *／
                      ["rail_arc100"            ,x2-1050,y2+  90,z2+ -890, 2],  // ／*
                      ["rail_st100"             ,x2 -950,y2+  90,z2+ -890, 0],
                      ["rail_st_slopeH10L100"   ,x2 -850,y2+  80,z2+ -890, 2],
                      ["rail_st50"              ,x2 -750,y2+  80,z2+ -890, 0],
                      ["rail_st_slopeH10L100"   ,x2 -700,y2+  80,z2+ -890, 0],
                      ["rail_st50"              ,x2 -600,y2+  90,z2+ -890, 0],
                      ["rail_arc50"             ,x2 -550,y2+  90,z2+ -890, 1],  // +＼
                      ["rail_st_slopeH10L100"   ,x2 -510,y2+  80,z2+ -840, 1],
                      ["rail_arc50"             ,x2 -510,y2+  80,z2+ -740, 3],  // ＼+
                      ["rail_st_slopeH10L100"   ,x2 -460,y2+  70,z2+ -700, 2],
                      ["rail_arc50"             ,x2 -360,y2+  70,z2+ -700, 1],  // +＼
                      ["rail_st_slopeH10L100"   ,x2 -320,y2+  60,z2+ -650, 1],
                      ["rail_arc50"             ,x2 -320,y2+  60,z2+ -550, 3],  // ＼+
                      ["rail_st_slopeH10L50"    ,x2 -270,y2+  50,z2+ -510, 2],
                      ["rail_arc50v10r"         ,x2 -220,y2+  40,z2+ -510, 1],  // +＼
                      ["rail_st_slopeH10L50"    ,x2 -180,y2+  30,z2+ -460, 1],
                      ["rail_st_slopeH10L50"    ,x2 -180,y2+  20,z2+ -410, 1],
                      ["rail_st_slopeH10L50"    ,x2 -180,y2+  10,z2+ -360, 1],
                      ["rail_st_slopeH10L100"   ,x2 -180,y2+   0,z2+ -310, 1],
                      ["rail_st50"              ,x2 -180,y2+   0,z2+ -210, 1],
                      ["rail_st"                ,x2 -180,y2+   0,z2+ -160, 1],
                      ["rail_st"                ,x2 -180,y2+   0,z2+ -150, 1],
                      ["rail_arc50"             ,x2 -180,y2+   0,z2+ -140, 3],  // ＼+
                      ["rail_st100"             ,x2 -130,y2+   0,z2+ -100, 0],
                      ["rail_st50"              ,x2 -30 ,y2+   0,z2+ -100, 0],
                      ["rail_st"                ,x2 +20 ,y2+   0,z2+ -100, 0],
                      // ["rail_st_slopeH10L100"   ,x2 -180,y2+  20,z2+ -360, 1],
                      // ["rail_st_slopeH10L100"   ,x2 -180,y2+  10,z2+ -260, 1],
                      // ["rail_st_slopeH10L100"   ,x2 -180,y2+   0,z2+ -160, 1],
                     ];
    ST.init(world, scene, dataInfo);
      const src31  = new ST.Source_00(   30, 60, -100, 3, 0.002, 2);
      new ST.Accelerator_01(    90,  8, -95,    1, 0, 0,  30);
      new ST.Accelerator_01(   110,  8, -95,    1, 0, 0,  30);
      new ST.Accelerator_01(   130,  8, -95,    1, 0, 0,  30);
      new ST.Accelerator_01(   160, 14, -95,    1, 0.3, 0,  30);
      new ST.Accelerator_01(   190, 23, -95,    1, 0.5, 0,  30);
      new ST.Accelerator_01(   210, 33, -95,    1, 1, 0,  30);
      new ST.Accelerator_01(   220, 43, -95,    1, 1, 0,  30);
      new ST.Accelerator_01(   230, 53, -95,    1, 2, 0,  30);
      new ST.Accelerator_01(   240, 73, -95,    1, 2, 0,  30);
      new ST.Accelerator_01(   260, 98, -95,    1, 1, 0,  30);
      new ST.Accelerator_01(   275, 20, 130,    0, 1, 4,  30);
      new ST.Accelerator_01(   275, 25, 160,    0, 1, 4,  30);
      new ST.Accelerator_01(   287, 33, 196,    0.5, 0.2, 0.5,  20);
      new ST.Accelerator_01(   315, 35, 205,    1, 0.2, 0,  30);
      new ST.Accelerator_01(   335, 38, 215,    0.5, 0.2, 0.5,  20);
      new ST.Accelerator_01(   355, 40, 260,    0, 0.2, 1,  30, "yellow");
      const src32  = new ST.Source_00(  290, 60, 350, 3, 0.002, 2);
      new ST.Accelerator_01(   280, 33, 355,   -2, -1, 0,  30);
      new ST.Accelerator_01(   250, 28, 355,   -2, -1, 0,  30);
      // new ST.Accelerator_01(  -405, 18, 410,    0, 0.2, 1,  30, "yellow");
      new ST.Accelerator_01(x1 -350,y1+   8,z1+  355,   -1, 0.2, 0,  30);
      new ST.Accelerator_01(x1 -391,y1+  13,z1+  374,   -1, 0.2, 1,  30, "yellow");
      new ST.Accelerator_01(x1 -405,y1+  18,z1+  410,    0, 0.2, 1,  30);
      new ST.Accelerator_01(x1 -420,y1+  23,z1+  448,   -1, 0.2, 1,  30, "yellow");
      new ST.Accelerator_01(x1 -455,y1+  26,z1+  465,   -1, 0.2, 0,  30);
      new ST.Accelerator_01(x1 -501,y1+  33,z1+  484,   -1, 0.2, 1,  30, "yellow");
      new ST.Accelerator_01(x1 -515,y1+  38,z1+  520,    0, 0.2, 1,  30);
      new ST.Accelerator_01(x1 -530,y1+  43,z1+  553,   -1, 0.2, 1,  30, "yellow");
      new ST.Accelerator_01(x1 -555,y1+  46,z1+  565,   -1, 0.2, 0,  30);
      new ST.Accelerator_01(x1 -601,y1+  53,z1+  584,   -1, 0.2, 1,  30, "yellow");
      new ST.Accelerator_01(x1 -615,y1+  58,z1+  610,    0, 0  , 1,  30);
      new ST.Accelerator_01(x1 -615,y1+  58,z1+  620,    0, 0  , 1,  30);
      new ST.Accelerator_01(x1 -510,y1+  68,z1+  665,    1, 0  , 0,  30);
      new ST.Accelerator_01(x1 -570,y1+  56,z1+  665,    1, 0.2, 0,  30);
      new ST.Accelerator_01(x1 -520,y1+  68,z1+  755,   -1, 0  , 0,  30);
      new ST.Accelerator_01(x1 -615,y1+  68,z1+  710,    0, 0  ,-1,  30);
      const src33  = new ST.Source_00( -350, 60, 350, 3, 0.002, 2);
      new ST.Accelerator_01(x1 -215,y1+   8,z1+  320,    0, 0  ,-1,  30);
      new ST.Accelerator_01(x1 -215,y1+   8,z1+  300,    0, 0  ,-1,  30);
      new ST.Accelerator_01(x1 -215,y1+   8,z1+  280,    0, 0  ,-1,  30);
      new ST.Accelerator_01(x1 -215,y1+   8,z1+  260,    0, 0  ,-1,  30);
      new ST.Accelerator_01(x1 -215,y1+   8,z1+  240,    0, 0  ,-1,  30);
      new ST.Deccelerator_00(x1-215,y1+   8,z1+   30,   0.8);
      new ST.Accelerator_01(x2 -310,y2+  18,z2 -175,   -1, 0  , 0,  30);
      new ST.Accelerator_01(x2 -410,y2+  28,z2 -265,    1, 0  , 0,  30);
      new ST.Accelerator_01(x2 -310,y2+  38,z2 -335,   -1, 0  , 0,  30);
      new ST.Accelerator_01(x2 -410,y2+  48,z2 -335,   -1, 0  , 0,  30);
      new ST.Accelerator_01(x2 -600,y2+  48,z2 -145,   -1, 0  , 0,  30);
      new ST.Accelerator_01(x2 -705,y2+  58,z2 -145,   -1, 0  , 0,  30);
      new ST.Accelerator_01(x2 -840,y2+  58,z2 -285,   -1, 0  , 0,  30);
      new ST.Accelerator_01(x2 -945,y2+  68,z2 -285,   -1, 0  , 0,  30);
      new ST.Accelerator_01(x2 -955,y2+  68,z2 -475,    1, 0  , 0,  30, "yellow");
      new ST.Accelerator_01(x2 -945,y2+  68,z2 -475,    1, 0  , 0,  30);
      new ST.Accelerator_01(x2 -835,y2+  78,z2 -475,    1, 0  , 0,  30);
      new ST.Accelerator_01(x2 -840,y2+  78,z2 -305,   -1, 0  , 0,  30);
      new ST.Accelerator_01(x2 -850,y2+  79,z2 -305,   -1, 0.2, 0,  30, "yellow");
      new ST.Accelerator_01(x2 -945,y2+  88,z2 -305,   -1, 0  , 0,  30);
      new ST.Accelerator_01(x2-1045,y2+  88,z2 -405,    0, 0  ,-1,  30);
      new ST.Accelerator_01(x2-1045,y2+  98,z2 -505,    0, 0  ,-1,  30);
      new ST.Accelerator_01(x2-1045,y2+  98,z2 -790,    0, 0  ,-1,  30);
      new ST.Accelerator_01(x2 -700,y2+  88,z2 -885,    1, 0  , 0,  30);
      new ST.Deccelerator_00(x2-315,y2+  78,z2 -650,   0.8);
      new ST.Deccelerator_00(x2-275,y2+  68,z2 -505,   0.8);
      new ST.Deccelerator_00(x2-175,y2+  48,z2 -460,   0.8);
      new ST.Deccelerator_00(x2-175,y2+   8,z2 -160,   0.8);
    srclist = [src31,src32,src33];
//    srclist = [src1,src2,src3,src4];
  }

  // !!!


  let cameraPosi = 0;
  const nCameraPosi = 4;
  let isrc = 0;
  let jball = 0;

  for (let ii = 0; ii < srclist.length; ++ii) {
    srclist[ii].popforce();
  }
  let trgBall = srclist[isrc].moBallBodyVec_[jball];

  addEventListener('resize', () => {
    const width = window.innerWidth - 24;
    const height = window.innerHeight - 24;
    camera.aspect = width / height;
    renderer.setSize(width, height);
  });

  const gamepad = new GamepadDrone(1);

  // キーボード
  let keyCfg = {
      frbk: 0,  // 前進/後進
      yaw:0,  // 左右旋回
      updn:0,    // 上昇/下降
      slide:0, // 左右移動(スライド)
  };

  function keydownMode1(key) {
    switch (key) {
      case 'ArrowUp':
        keyCfg.updn = 1;
        break
      case 'ArrowDown':
        keyCfg.updn = -1;
        break

      case 'ArrowLeft':
        keyCfg.slide = -1;
        break
      case 'ArrowRight':
        keyCfg.slide = 1;
        break

      case 'w':
        keyCfg.frbk = 1;
        break
      case 's':
        keyCfg.frbk = -1;
        break

      case 'a':
        keyCfg.yaw = 1;
        break
      case 'd':
        keyCfg.yaw = -1;
        break
    }
  }

  function keyupMode1(key) {
    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
        keyCfg.updn = 0;
        break

      case 'ArrowLeft':
      case 'ArrowRight':
        keyCfg.slide = 0;
        break

      case 'w':
      case 's':
        keyCfg.frbk = 0;
        break

      case 'a':
      case 'd':
        keyCfg.yaw = 0;
        break
    }
  }

  function keydownMode2(key) {
    switch (key) {
      case 'ArrowUp':
        keyCfg.frbk = 1;
        break
      case 'ArrowDown':
        keyCfg.frbk = -1;
        break

      case 'ArrowLeft':
        keyCfg.slide = -1;
        break
      case 'ArrowRight':
        keyCfg.slide = 1;
        break

      case 'w':
        keyCfg.updn = 1;
        break
      case 's':
        keyCfg.updn = -1;
        break

      case 'a':
        keyCfg.yaw = 1;
        break
      case 'd':
        keyCfg.yaw = -1;
        break
    }
  }

  function keyupMode2(key) {
    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
        keyCfg.frbk = 0;
        break

      case 'ArrowLeft':
      case 'ArrowRight':
        keyCfg.slide = 0;
        break

      case 'w':
      case 's':
        keyCfg.updn = 0;
        break

      case 'a':
      case 'd':
        keyCfg.yaw = 0;
        break
    }
  }

  let keydownMode = keydownMode1;
  let keyupMode = keyupMode1;

  function setDroneMode1() {
    gamepad.setMode(1);
    keydownMode = keydownMode1;
    keyupMode = keyupMode1;
    console.log("drone_mode1");
  }

  function setDroneMode2() {
    gamepad.setMode(2);
    keydownMode = keydownMode2;
    keyupMode = keyupMode2;
    console.log("drone_mode2");
  }

  function changeCameraPosi() {
    cameraPosi = (cameraPosi + 1) % nCameraPosi;
    console.log("camera=",cameraPosi);

    if (cameraPosi == 1) {
      console.log("camera=1, 後背ビュー");
    } else if (cameraPosi == 2) {
      console.log("camera=2, フロントビュー（ドライバー視点)");
    } else if (cameraPosi == 3) {
      console.log("camera=3, 移動体周りを公転");
      orbitControls.autoRotate = true;
    } else {
      console.log("camera=0, default");
      orbitControls.autoRotate = false;
      orbitControls.dampingFactor = 0.05;  // def 0.05
      orbitControls.panSpeed = 1;  // def 1
    }
  }

  // ドローンの姿勢を戻す
  function resetDronePosture() {
    //   クォータニオンから方向だけを取り出し..
    let vquat = moDrone.quaternion;
    let veuler = new CANNON.Vec3(0, 0, 0);
    vquat.toEuler(veuler);
    let ry = veuler.y;
    //   改めて、Ｙ軸のみで回転させたクォータニオンを作成し自身のクォータニオンとする
    let carInitQuat = new CANNON.Quaternion();
    carInitQuat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), ry);
    moDrone.quaternion.copy(carInitQuat);
    ddir = moDrone.quaternion.vmult(ddir0);
    moDroneYaw(0);
    console.log("reset drone posture");
  }

  // key/gamepad の感度パラメータ
  // 0: 感度低 , 1:中, 2:高
  let iKeySens = 1;
  let keySens = [{FRWD:1, BACK:1, YAW:0.005, UP:0.5, DOWN:0.5, SLD:0.5, },
                 {FRWD:2, BACK:1, YAW:0.01 , UP:1  , DOWN:1  , SLD:1, },
                 {FRWD:4, BACK:1, YAW:0.02 , UP:2  , DOWN:2  , SLD:2,},
                ];

  let iGPSens = 1;
  let gpSens = [{FRWD:1, BACK:1, YAW:0.005, UP:0.5, DOWN:0.5, SLD:0.5, },
                {FRWD:2, BACK:1, YAW:0.01 , UP:1  , DOWN:1  , SLD:1,},
                {FRWD:4, BACK:1, YAW:0.02 , UP:2  , DOWN:2  , SLD:2,},
               ];

  function changeSensitive() {
    iKeySens = (iKeySens+1) % keySens.length;
    iGPSens = (iGPSens+1) % gpSens.length;
    console.log("changeSensitive", iKeySens, iGPSens);
  }

  // Keybindings
  document.addEventListener('keydown', (event) => {
    // ゲームパッドの無効化
    gamepad.enable_ = false;
    // console.log("gamepad", gamepad.enable_);

    // 主要な操作は関数ポインタ(keydownMode[12])で処理
    keydownMode(event.key);

    switch (event.key) {
      case 'c':
        changeCameraPosi();
        break;

      case 'v':
        // カメラリセット
        orbitControls.reset();
        break;

      case 'r':
        // 姿勢戻す
        resetDronePosture();
        break;

      case 'd':
        // ボールリセット（ソースに戻す）
        if (trgBall.src_ != null) {
          let src = trgBall.src_;
          src.repop(trgBall);
        }
        break;

      case 'n':
        // ボールのフォーカスを次に移す
        jball += 1;
        if (jball == srclist[isrc].moBallBodyVec_.length) {
          isrc += 1;
          if (isrc == srclist.length) {
            isrc = 0;
          }
          if (srclist[isrc].moBallBodyVec_.length == 0) {
            srclist[isrc].popforce();
          }
          jball = 0;
        }
        trgBall = srclist[isrc].moBallBodyVec_[jball];
        break;

      case 'k':
        changeSensitive();
        break;

      // case 'Enter':
      case 'q':
        // ゲームパッドの有効化／キーボードからゲームパッドへフォーカスを移す
        console.log("enable gamepad");
        gamepad.enable_ = true;
        console.log("gamepad", gamepad.enable_);
        break;
      case '1':
        // ドローン（モード１）
        setDroneMode1();
        break;
      case '2':
        // ドローン（モード２）
        setDroneMode2();
        break;

    }
  })

  document.addEventListener('keyup', (event) => {
    keyupMode(event.key);
  })

  {
    let px = 0, py = 0, pz = 0;
    camera.position.set(px, py+5, pz+80);
    camera.lookAt(new THREE.Vector3(px, py, pz));
  }

  let keyChangeCool = 0;

  function animate() {
    if (gamepad.enable_) {
      // ゲームパッド
      gamepad.update();
      if (gamepad.para2_.frbk > 0) {  // 前進/後進（前進）
          moDrone.applyForce(ddirF.scale(gamepad.para2_.frbk * gpSens[iGPSens].FRWD));
      } else if (gamepad.para2_.frbk < 0) {  // 前進/後進（後進）
          moDrone.applyForce(ddirF.scale(gamepad.para2_.frbk * gpSens[iGPSens].BACK));
      }
      if (gamepad.para2_.yaw > 0) {  // 左右旋回
          moDroneYaw(gamepad.para2_.yaw * gpSens[iGPSens].YAW);
      } else if (gamepad.para2_.yaw < 0) {  // 左右旋回
          moDroneYaw(gamepad.para2_.yaw * gpSens[iGPSens].YAW);
      }
      if (gamepad.para2_.updn > 0) {  // 上昇/下降
        moDrone.applyForce(ddirFU_.vadd(ddirFUp.scale(gamepad.para2_.updn*gpSens[iGPSens].UP)));
      } else if (gamepad.para2_.updn < 0) {  // 上昇/下降
        moDrone.applyForce(ddirFU_.vadd(ddirFUp.scale(0.5*gamepad.para2_.updn*gpSens[iGPSens].DOWN)));
      } else {
        moDrone.applyForce(ddirFU_);
      }
      if (gamepad.para2_.slide < 0) {  // 左右移動(スライド)
        moDrone.applyForce(ddirFR.scale(gamepad.para2_.slide*gpSens[iGPSens].SLD));
      } else if (gamepad.para2_.slide > 0) {  // 左右移動(スライド)
        moDrone.applyForce(ddirFR.scale(gamepad.para2_.slide*gpSens[iGPSens].SLD));
      }

      if (keyChangeCool > 0) {
          keyChangeCool += -1;
      } else {
          if (gamepad.para_.btnA) {
              if (keyChangeCool == 0) {
                  keyChangeCool = 30;
                  changeCameraPosi();
              }
          }
          if (gamepad.para_.btnB) {
              if (keyChangeCool == 0) {
                  keyChangeCool = 30;
                  resetDronePosture();
              }
          }
          if (gamepad.para_.btnX) {
              if (keyChangeCool == 0) {
                  keyChangeCool = 30;
                  if (gamepad.droneMode_ == 1) {
                      setDroneMode2();
                  } else {
                      setDroneMode1();
                  }
              }
          }
          if (gamepad.para_.btnY) {
              if (keyChangeCool == 0) {
                  keyChangeCool = 30;
                  changeSensitive();
              }
          }
      }

    } else {
      // key
      if (keyCfg.frbk > 0) {  // 前進/後進
          moDrone.applyForce(ddirF.scale(keySens[iKeySens].FRWD));
      } else if (keyCfg.frbk < 0) {  // 前進/後進
          moDrone.applyForce(ddirB.scale(keySens[iKeySens].BACK));
      }
      if (keyCfg.yaw > 0) {  // 左右旋回(左)
          moDroneYaw(keyCfg.yaw * keySens[iKeySens].YAW);
      } else if (keyCfg.yaw < 0) {  // 左右旋回(右)
          moDroneYaw(keyCfg.yaw * keySens[iKeySens].YAW);
      }
      if (keyCfg.updn > 0) {  // 上昇/下降
        moDrone.applyForce(ddirFU_.vadd(ddirFUp.scale(keySens[iKeySens].UP)));
      } else if (keyCfg.updn < 0) {  // 上昇/下降
        moDrone.applyForce(ddirFU_.vadd(ddirFUp.scale(-0.5*keySens[iKeySens].DOWN)));
      } else {
        moDrone.applyForce(ddirFU_);
      }
      if (keyCfg.slide < 0) {  // 左右移動(スライド：左)
        moDrone.applyForce(ddirFL.scale(keySens[iKeySens].SLD));
      } else if (keyCfg.slide > 0) {  // 左右移動(スライド：右)
        moDrone.applyForce(ddirFR.scale(keySens[iKeySens].SLD));
      }
    }

    if (actuatorlist.length > 0) {
      for (let ii = 0; ii < actuatorlist.length; ++ii) {
          actuatorlist[ii].act();
      }
    }

    world.step(timeStep)

    for (let ii = 0; ii < srclist.length; ++ii) {
      let src = srclist[ii];
      for (let i = 0; i < src.moBallBodyVec_.length; ++i) {
        // 場外判定
        if (src.moBallBodyVec_[i].position.y < -100) {
          src.repop(src.moBallBodyVec_[i]);
        }
        // 停止判定
        if (src.moBallBodyVec_[i].velocity.lengthSquared() < 0.001) {
          src.repop(src.moBallBodyVec_[i]);
        }
      }
      src.pop();
    }

    // ----------------------------------------
    // カメラ操作
    let vposi = moDrone.position;;
    let vquat = moDrone.quaternion;
    if (cameraPosi == 1) {
      // console.log("camera=1, 後背ビュー");
      let vv = vquat.vmult(new CANNON.Vec3(23, 5, 0));  // 後方、高さ、左右
      camera.position.set(vposi.x + vv.x, vposi.y + vv.y, vposi.z + vv.z);
      camera.rotation.z = 0;
      camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));

    } else if (cameraPosi == 2) {
      // console.log("camera=2, フロントビュー（ドライバー視点)");
      camera.position.copy(new THREE.Vector3(vposi.x, vposi.y+2, vposi.z));
      camera.rotation.z = 0;
      let vv = vquat.vmult(new CANNON.Vec3(-20, 0, 0));  // 前方、高さ、左右
      camera.lookAt(new THREE.Vector3(vposi.x + vv.x, vposi.y + vv.y, vposi.z + vv.z));

    } else if (cameraPosi == 3) {
      // console.log("camera=3, 移動体周りを公転");
      // orbitControls.autoRotate = true;
      orbitControls.target = new THREE.Vector3(vposi.x, vposi.y, vposi.z);
      orbitControls.update();

    } else {
      orbitControls.update();
    }

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  animate();
};

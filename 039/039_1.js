// mode:javascript

// drone
//
// - 運動場のトラック＋外周

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

  // コース例
  // - 運動場のトラック＋外周
  if (1) {
    const dataInfo = [["tree_02"                , -100,   0,  80, 0],
                      ["rail_arc_l"             ,  -60,  10, -40, 2],  // ／+
                      ["rail_st"                ,  -60,  10, -10, 1],
                      ["rail_st"                ,  -60,  10,   0, 1],
                      ["rail_st"                ,  -60,  10,  10, 1],
                      ["rail_arc_l"             ,  -60,  10,  20, 3],  // ＼+
                      ["rail_st"                ,  -30,  10,  40, 0],
                      ["join_R45"               ,  -20,  10,  30, 2],
                      ["rail_st"                ,    0,  10,  40, 0],
                      ["rail_st"                ,   10,  10,  40, 0],
                      ["rail_st"                ,   20,  10,  40, 0],
                      ["rail_arc_R45"           ,    0,  10,  20, 0],  // ／~~
                      ["rail_st_slope"          ,   20,  10,  20, 0],
                      ["rail_st"                ,  -30,  10, -40, 0],
                      ["rail_st"                ,  -20,  10, -40, 0],
                      ["rail_st"                ,  -10,  10, -40, 0],
                      ["rail_st"                ,    0,  10, -40, 0],
                      ["rail_st"                ,   10,  10, -40, 0],
                      ["rail_st"                ,   20,  10, -40, 0],
                      ["rail_arc_l"             ,   30,  10, -40, 1],  // +＼
                      ["rail_st"                ,   50,  10, -10, 1],
                      ["rail_st"                ,   50,  10,   0, 1],
                      ["rail_st"                ,   50,  10,  10, 1],
                      ["rail_arc_l"             ,   30,  10,  20, 0],  // +／
                      //
                      ["rail_st_slope"          ,   20,  30, -60, 0],
                      ["rail_st100"             ,    0,   0, -60, 0],
                      ["rail_st100"             , -100,   0, -60, 0],
                      ["rail_arc100"            , -200,   0, -60, 2],  // ／+
                      ["rail_st100"             , -200,   0,  40, 1],
                      ["rail_st100"             , -200,   0, 140, 1],
                      ["rail_arc100"            , -200,   0, 240, 3],  // ＼+
                      ["rail_st100"             , -100,   0, 330, 0],
                      ["rail_st_slopeH10L100"   ,    0,   0, 330, 0],
                      ["rail_st100"             ,  100,  10, 330, 0],
                      ["rail_arc100"            ,  200,  10, 240, 0],  // +／
                      ["rail_st_slopeH10L100"   ,  290,   0, 140, 3],
                      //["rail_st100"             ,  290,  10, 140, 1],
                      ["rail_st100"             ,  290,   0,  40, 1],
                      ["rail_st"                ,  290,   0,  30, 1],
                      ["rail_arc100"            ,  200,   0, -70, 1],  // +＼
                      ["rail_st100"             ,  100,   0, -70, 0],
                      ["rail_st100"             ,    0,   0, -70, 0],
                      ["rail_st100"             , -100,   0, -70, 0],
                      ["rail_st"                , -110,   0, -70, 0],
                      ["rail_arc100"            , -210,   0, -70, 2],  // ／+
                      ["rail_st"                , -210,   0,  30, 1],
                      ["rail_st100"             , -210,   0,  40, 1],
                      ["rail_st100"             , -210,   0, 140, 1],
                      ["rail_st"                , -210,   0, 240, 1],
                      ["rail_arc100"            , -210,   0, 250, 3],  // ＼+
//                      ["rail_st"                , -110,   0, 340, 0],
                      ["rail_st100"             , -110,   0, 340, 0],
                      ["rail_st100"             ,  -10,   0, 340, 0],
                      ["rail_st100"             ,   90,   0, 340, 0],
                      ["rail_arc100"            ,  190,   0, 250, 0],  // +／
                      ["rail_st100"             ,  280,   0, 150, 1],
                      ["rail_st100"             ,  280,   0,  50, 1],
                      ["rail_st"                ,  280,   0,  40, 1],
                      ["rail_st"                ,  280,   0,  30, 1],
                      ["rail_arc90"            ,  200,   0, -60, 1],  // +＼
                      ["rail_st100"             ,  100,   0, -60, 0],
                     ];
    ST.init(world, scene, dataInfo);
    const src1  = new ST.Source_00(   30, 60, 20, 3, 0.002, 2);
    new ST.Accelerator_01(   -25, 18, -35,    1, 0, 0,  30);
    new ST.Accelerator_01(    25, 18,  45,   -1, 0, 0,  30);
    const src2  = new ST.Source_00(   30, 60, -60, 10, 0.002, 2);
    new ST.Accelerator_01(   -195, 8,  40,    0, 0, 1,  30);
      // new ST.Accelerator_01(   -195, 8,  60,    0, 0, 1,  30);
      // new ST.Accelerator_01(   -195, 8,  80,    0, 0, 1,  30);
      new ST.Accelerator_01(   -90, 8, 335,    1, 0, 0,  30);
      new ST.Accelerator_01(   -70, 8, 335,    1, 0, 0,  30);
      new ST.Accelerator_01(   180, 8, -65,   -1, 0, 0,  30);
      new ST.Accelerator_01(   160, 8, -65,   -1, 0, 0,  30);
      new ST.Accelerator_01(   140, 8, -65,   -1, 0, 0,  30);
      new ST.Accelerator_01(   120, 8, -65,   -1, 0, 0,  30);
      new ST.Deccelerator_00(  -80, 8, -65,   0.8);
      new ST.Deccelerator_00( -100, 8, -65,   0.8);
      new ST.Accelerator_01(  -205, 8,  40,    0, 0, 1,  30);
      new ST.Accelerator_01(  -205, 8,  60,    0, 0, 1,  30);
      new ST.Accelerator_01(  -205, 8,  80,    0, 0, 1,  30);
      new ST.Accelerator_01(  -205, 8, 100,    0, 0, 1,  30);
      new ST.Deccelerator_00( -205, 8, 220,   0.8);
      new ST.Deccelerator_00( -205, 8, 240,   0.8);
      new ST.Accelerator_01(   -90, 8, 345,    1, 0, 0,  30);
      new ST.Accelerator_01(   -70, 8, 345,    1, 0, 0,  30);
      new ST.Accelerator_01(   -50, 8, 345,    1, 0, 0,  30);
      new ST.Accelerator_01(   -30, 8, 345,    1, 0, 0,  30);
      new ST.Deccelerator_00(  160, 8, 345,   0.8);
      new ST.Deccelerator_00(  180, 8, 345,   0.8);
      new ST.Accelerator_01(   285, 8, 240,    0, 0,-1,  30);
      new ST.Accelerator_01(   285, 8, 220,    0, 0,-1,  30);
      new ST.Accelerator_01(   285, 8, 200,    0, 0,-1,  30);
      new ST.Accelerator_01(   285, 8, 180,    0, 0,-1,  30);
      new ST.Deccelerator_00(  285, 8,  60,   0.8);
      new ST.Deccelerator_00(  285, 8,  40,   0.8);
      new ST.Accelerator_01(   180, 8, -55,   -1, 0, 0,  30);
    srclist = [src1,src2];
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

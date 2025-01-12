// mode:javascript
//
// 車と slopetoy のコラボ
//
//   - コース案：カートコース

import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "orbitcontrols";
import * as vb from "VehicleBase";
import * as ST from "Slopetoy";
import { Gamepad } from "Gamepad";

const timeStep = 1 / 45;

// カートコース
let iniX = -318, iniY = 5, iniZ = -198, iniRotY = 1.5

// fuji-speedway
// let iniX = -120, iniY = 5, iniZ = -30, iniRotY = -0.5;


function setupWorld() {
  const world = new CANNON.World()
  world.gravity.set(0, -10, 0)
  // Sweep and prune broadphase
  world.broadphase = new CANNON.SAPBroadphase(world)
  // Disable friction by default
  world.defaultContactMaterial.friction = 0

  var camera;
  var scene;
  var renderer;
  var orbitControls;
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
    orbitControls.dampingFactor = 0.2
    orbitControls.minDistance = 10
    orbitControls.maxDistance = 5000
  }

  return {world, camera, scene, renderer, orbitControls};
}

var ivehicle = 0;

window.onload = () => {
  const {world, camera, scene, renderer, orbitControls} = setupWorld();

  ST.init0(world, scene);

  const moGroundMtr = new CANNON.Material({name: 'ground'})

  var vehicleList = [];
  var vehicle1;
  if (1) {
    vehicle1 = new vb.VehicleFR01(scene, world, moGroundMtr);
    vehicle1.init();
    vehicleList.push(vehicle1);
  }

  // Build the car chassis
  var vehicle = vehicle1;
  ivehicle = 0;

  for (let i = 0; i < 3; ++i) {
    world.step(1/60)

    for (let ii = 0; ii < vehicleList.length; ++ii) {
      vehicleList[ii].setPosition(iniX-5*ii, iniY, iniZ-2*ii, iniRotY);
      vehicleList[ii].viewUpdate();
    }
  }

  // ----------------------------------------
  // コース
  const grndw = 280*1.5; const grndh = 170*1.5;
  const moGround2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(grndw, 0.5, grndh)),
    position: new CANNON.Vec3(0, -0.5, 0),
    material: moGroundMtr,
  });
  world.addBody(moGround2Body);
  const viGround2Geo = new THREE.BoxGeometry(grndw*2, 1, grndh*2);
  const texture = new THREE.TextureLoader().load('./pic/test_course2.png'); 
  const viGround2Mtr = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 0.4});
  const viGround2Mesh = new THREE.Mesh(viGround2Geo, viGround2Mtr);
  scene.add(viGround2Mesh);
  viGround2Mesh.position.copy(moGround2Body.position);
  viGround2Mesh.quaternion.copy(moGround2Body.quaternion);

  // ----------------------------------------
  let srclist = [];


  // カートコース
  if (1) {
    let x1 = -80, y1 = -4.7, z1 = 42;
    let x2 = -80, y2 = -3.7, z2 = 42;
    const dataInfo = [["con_st_slopeH10L20"    ,x2 -290, y2  +5, z2-260, 2],
                      ["con_st"                ,x2 -260, y2  +0, z2-260, 0],
                      ["tube_st50"             ,x2 -250, y2  +0, z2-260, 0],
                      ["con_st50"              ,x2 -200, y2  +0, z2-260, 0],
                      ["tube_st20"             ,x2 -150, y2  +0, z2-260, 0],
                      ["tube_st_slopeArcH05L20",x2 -130, y2  +0, z2-260, 0],
                      ["tube_st"               ,x2 -110, y2  +5, z2-260, 0],
                      ["tube_arc30"            ,x2 -100, y2  +5, z2-260, 1],  // +＼
                      ["tube_arc20_r45_r"      ,x2  -80, y2  +5, z2-230, 3],
                      ["tube_st_slopeArcH05L20",x2  -90, y2  +0, z2-215, .5],
                      ["rail_st_R45"           ,x1 -102, y1  +0, z1-208, 0],
                      ["rail_st_R45"           ,x1 -112, y1  +0, z1-198, 0],
                      ["rail_st_R45"           ,x1 -122, y1  +0, z1-188, 0],
                      ["tube_st_slopeArcH05L20",x2 -134, y2  +0, z2-171, 2.5],
                      ["tube_arc20"            ,x2 -161, y2  +5, z2-164, 2.5],
                      ["tube_arc20"            ,x2 -140, y2  +5, z2-143, 3.5],
                      ["tube_arc20"            ,x2 -119, y2  +5, z2-164, 1.5],
                      ["tube_arc20"            ,x2  -98, y2  +5, z2-143, 0.5],
                      ["tube_arc20_r45"        ,x2 -108.5, y2  +5, z2-117.5, 2],
                      ["tube_st_slopeArcH05L20",x2 -129, y2  +0, z2-117.5, 0],
                      ["tube_st"               ,x2 -139, y2  +0, z2-117.5, 0],
                      ["rail_st50"             ,x1 -189.5, y1  +0, z1-117.5, 0],
                      ["tube_arc20"            ,x2 -210, y2  +0, z2-127.5, 3],  // ＼+
                      ["tube_st30"             ,x2 -210, y2  +0, z2-157.5, 1],
                      ["tube_arc10"            ,x2 -210, y2  +0, z2-167.5, 2], // ／+
                      ["tube_arc20"            ,x2 -200, y2  +0, z2-177.5, 0], // +／
                      ["tube_arc30"            ,x2 -210, y2  +0, z2-207.5, 1], // +＼
                      ["tube_arc20"            ,x2 -230, y2  +0, z2-207.5, 2], // ／+
                      ["tube_st"               ,x2 -230, y2  +0, z2-187.5, 1],
                      ["tube_st"               ,x2 -230, y2  +0, z2-180, 1],
                      ["rail_st50"             ,x1 -230, y1  +0, z1-170, 1],
                      ["rail_st"               ,x1 -230, y1  +0, z1-120, 1],
                      ["tube_arc20"            ,x2 -240, y2  +0, z2-110, 0], // +／
                      ["tube_st"               ,x2 -250, y2  +0, z2-100, 0],
                      ["tube_st"               ,x2 -260, y2  +0, z2-100, 0],
                      ["tube_arc20"            ,x2 -280, y2  +0, z2-110, 3],  // ＼+
                      ["tube_st"               ,x2 -280, y2  +0, z2-120, 1],
                      ["rail_st50"             ,x1 -280, y1  +0, z1-170, 1],
                      ["rail_st50"             ,x1 -280, y1  +0, z1-220, 1],
                      ["tube_st"               ,x2 -280, y2  +0, z2-230, 1],
                      ["tube_st"               ,x2 -280, y2  +0, z2-240, 1],
                      ["tube_arc20"            ,x2 -280, y2  +0, z2-260, 2], // ／+
                      ];
    ST.init(world, scene, dataInfo);
    let appF  = 60;
    let appFw = 20;
    let rdec = 0.5;
    let rdecw = 0.8;
    const src1 = new ST.Source_00( x1 -290, y1+ 20, z1-260, 6, 0.02, 2, false);
    new ST.Accelerator_01(  x1 -250, y1+ 6, z1-255,   1, 0, 0,  appF);
    new ST.Accelerator_01(  x1 -200, y1+ 6, z1-255,   1, 0, 0,  appFw, "yellow");
    new ST.Accelerator_01(  x1  -80, y1+11, z1-215,  -1, 0, 1,  appFw, "yellow");
    new ST.Accelerator_01(  x1 -139.5, y1+11, z1-148,   0, 0, 1,  appFw, "yellow");
    new ST.Accelerator_01(  x1  -93, y1+11, z1-138,   1, 0, 1,  appFw, "yellow");
    new ST.Accelerator_01(  x1 -108, y1+11, z1-112.5,  -1, 0, 0,  appFw, "yellow");
    new ST.Accelerator_01(  x1 -205, y1+ 6, z1-130,    0, 0,-1,  appFw, "yellow");
    new ST.Accelerator_01(  x1 -185, y1+ 6, z1-175,   0, 0,-1,  appFw, "yellow");
    new ST.Accelerator_01(  x1 -204, y1+ 6, z1-202,  -1, 0, 0,  appFw, "yellow");
    new ST.Accelerator_01(  x1 -225, y1+ 6, z1-180,   0, 0, 1,  appF);
    new ST.Accelerator_01(  x1 -240, y1+ 6, z1-95,  -1, 0, 0,  appFw, "yellow");
    new ST.Accelerator_01(  x1 -275, y1+ 6, z1-130,   0, 0,-1,  appF);
    srclist = [src1];
  }


  // fuji-speedway
  if (0) {
    let x2 = 0, y2 = -2.7, z2 = -5;
    let x3 = 0, y3 = -4.7, z3 = -5;
    let x4 = 0, y4 = -3.7, z4 = -5;
    const dataInfo = [["con_st50"              ,x4 -350, y4  +0, z4 -50, 0],
                      ["tube_st50"             ,x4 -300, y4  +0, z4 -50, 0],
                      ["rail_st100"            ,x3 -250, y3  +0, z3 -50, 0],
                      ["rail_st100"            ,x3 -150, y3  +0, z3 -50, 0],
                      ["rail_st100"            ,x3  -50, y3  +0, z3 -50, 0],
                      ["rail_st100"            ,x3  +50, y3  +0, z3 -50, 0],
                      ["rail_st100"            ,x3 +150, y3  +0, z3 -50, 0],
                      ["rail_st100"            ,x3 +250, y3  +0, z3 -50, 0],
                      ["tube_st"               ,x4 +350, y4  +0, z4 -50, 0],
                      ["tube_arc30"            ,x4 +360, y4  +0, z4 -50, 1],    // +＼
                      ["tube_arc20_r45_r"      ,x4 +380, y4  +0, z4 -20, 3],
                      ["tube_st50_r45"         ,x4 +330, y4  +0, z4 -10, 0],
                      ["tube_arc20_r45"        ,x4 +315, y4  +0, z4 +45, 2],
                      ["tube_st50"             ,x4 +265, y4  +0, z4 +45, 0],
                      ["rail_st100"            ,x3 +165, y3  +0, z3 +45, 0],
                      ["tube_arc50"            ,x4 +115, y4  +0, z4 +45, 2], // ／+
                      ["tube_st30"             ,x4 +115, y4  +0, z4 +95, 1],
                      ["tube_arc50"            ,x4  +75, y4  +0, z4 +125, 0],    // +／
                      ["tube_arc50"            ,x4  +25, y4  +0, z4 +125, 3],    // ＼+
                      ["tube_st30"             ,x4  +25, y4  +0, z4 +95, 1],
                      ["tube_st30"             ,x4  +25, y4  +0, z4 +65, 1],
                      ["tube_arc30"            ,x4   +5, y4  +0, z4 +35, 1],    // +＼
                      ["tube_st20"             ,x4  -15, y4  +0, z4 +35, 0],
                      ["tube_st"               ,x4  -25, y4  +0, z4 +35, 0],
                      ["tube_arc20_r45"        ,x4  -45, y4  +0, z4 +35, 0],
                      ["tube_st10_r45"         ,x4  -50, y4  +0, z4 +40, 0],
                      ["tube_st50_r45"         ,x4 -100, y4  +0, z4 +50, 0],
                      ["tube_st50_r45"         ,x4 -150, y4  +0, z4+100, 0],
                      ["rail_st_R45_50"        ,x3 -200, y3  +0, z3+150, 0],
                      ["tube_st10_r45"         ,x4 -210, y4  +0, z4+200, 0],
                      ["tube_st10_r45"         ,x4 -220, y4  +0, z4+210, 0],
                      ["tube_arc20_r45"        ,x4 -235, y4  +0, z4+225, 2],
                      ["tube_st"               ,x4 -245, y4  +0, z4+225, 0],
                      ["tube_st20"             ,x4 -265, y4  +0, z4+225, 0],
                      ["tube_arc20"            ,x4 -285, y4  +0, z4+215, 3],    // ＼+
                      ["tube_st"               ,x4 -285, y4  +0, z4+205, 1],
                      ["rail_st50"             ,x3 -285, y3  +0, z3+155, 1],
                      ["tube_arc20_r45"        ,x4 -285, y4  +0, z4+135, 3],
                      ["tube_st10_r45"         ,x4 -300, y4  +0, z4+130, 1],
                      ["tube_arc20_r45"        ,x4 -305, y4  +0, z4+115, 1],
                      ["tube_arc30"            ,x4 -305, y4  +0, z4 +85, 2], // ／+
                      ["tube_st50"             ,x4 -275, y4  +0, z4 +85, 0],
                      ["tube_st"               ,x4 -225, y4  +0, z4 +85, 0],
                      ["tube_arc30"            ,x4 -215, y4  +0, z4 +65, 0],    // +／
                      ["tube_arc30"            ,x4 -215, y4  +0, z4 +35, 1],    // +＼
                      ["tube_st"               ,x4 -225, y4  +0, z4 +35, 0],
                      ["rail_st50"             ,x3 -275, y3  +0, z3 +35, 0],
                      ["tube_st50"             ,x4 -325, y4  +0, z4 +35, 0],
                      ["tube_st30"             ,x4 -350, y4  +0, z4 +35, 0],
                      ["tube_arc40"            ,x4 -390, y4  +0, z4  +5, 3],    // ＼+
                      ["tube_st"               ,x4 -390, y4  +0, z4  -5, 1],
                      ["tube_st"               ,x4 -390, y4  +0, z4 -10, 1],
                      ["tube_arc40"            ,x4 -390, y4  +0, z4 -50, 2], // ／+
                      ];
    ST.init(world, scene, dataInfo);
    let appF  = 60;
    let appFw = 20;
    let rdec = 0.5;
    let rdecw = 0.8;
    const src1 = new ST.Source_00( x2 -350, y2+ 20, z2-50, 6, 0.02, 2, false);
    new ST.Accelerator_01(  x4 -345, y4+ 5, z4-45,   1, 0, 0,  appFw, "yellow");
    new ST.Accelerator_01(  x4 -335, y4+ 5, z4-45,   1, 0, 0,  appF);
    new ST.Accelerator_01(  x4 -235, y4+ 5, z4-45,   1, 0, 0,  appF);
    new ST.Accelerator_01(  x4  -35, y4+ 5, z4-45,   1, 0, 0,  appF);
    new ST.Accelerator_01(  x4 +374, y4+ 5, z4+1,  -1, 0, 1,  appFw, "yellow");
    new ST.Accelerator_01(  x4 +75, y4+ 5, z4+170,  -1, 0,0,  appFw, "yellow");
    new ST.Accelerator_01(  x4 -45, y4+ 5, z4+ 50,  -1, 0, 1,  appF);
    new ST.Accelerator_01(  x4 -95, y4+ 5, z4+100,  -1, 0, 1,  appFw, "yellow");
    new ST.Accelerator_01(  x4-230, y4+ 5, z4+230,  -1, 0, 0,  appF);
    new ST.Accelerator_01(  x4-270, y4+ 5, z4+90,   1, 0, 0,  appF);
    new ST.Accelerator_01(  x4-280, y4+ 5, z4+40,  -1, 0, 0,  appFw, "yellow");
    srclist = [src1];
  }

  for (let ii = 0; ii < srclist.length; ++ii) {
    srclist[ii].popforce();
  }


  addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  });

  // ----------------------------------------

  let cameraPosi = 0;

 // キー同時押しのときに、挙動が思ったようにならない
 // - ArrowUp を押したまま、 ArrowLeft を押して放しても、「ArrowUp の keydown」イベントが発生しない
 // 再度キーを押下するとイベント発生することから、
 // 下記のよう キーイベント発生時の状態を記録する（保持する）挙動に切り替える
 // 但し、対象は (アクセル操作、ハンドル、ブレーキ（サイドブレーキ）、バック)に限る
  var keyEvnt = {
    forwards:false,
    backwards:false,
    left:false,
    right:false,
    brake:false,
    sidebrake:false
  };

  const gamepad = new Gamepad();

  // Keybindings
  // Add force on keydown
  document.addEventListener('keydown', (event) => {
    // ゲームパッドの無効化
    gamepad.enable_ = false;

    switch (event.key) {
      case 'ArrowUp':
        keyEvnt.forwards = true;
        break
      case 'ArrowDown':
        keyEvnt.backwards = true;
        break
      case 'ArrowLeft':
        keyEvnt.left = true;
        break
      case 'ArrowRight':
        keyEvnt.right = true;
        break
      case 'b':
        keyEvnt.brake = true;
        break
      case 'n':
        keyEvnt.sidebrake = (keyEvnt.sidebrake) ? false : true;
        break

      case 'c':
        cameraPosi = (cameraPosi + 1) % 5;
        break;

      case 'r':
        // 車の姿勢を戻す／車をひっくり返す ..
        vehicle.keydown_resetPosture();
        break;

      case 'q':
        // ゲームパッドの有効化／キーボードからゲームパッドへフォーカスを移す
        gamepad.enable_ = true;
        console.log("gamepad", gamepad.enable_);
        break;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
        // 車の切り替え
        var iv = parseInt(event.key)-1
        if (ivehicle != iv) {
          // 交換先の車の座標と入れ替える
          let px, py, pz;
          [px, py, pz] = vehicle.getPosition();
          let px2, py2, pz2;
          [px2, py2, pz2] = vehicleList[iv].getPosition();
          vehicle.setPosition(px2, py2+2, pz2, 0.0);
          for (let i = 0; i < 3; ++i) {
            world.step(1/60)
            vehicle.viewUpdate();
          }
          ivehicle = iv;
          vehicle = vehicleList[iv];
          vehicle.setPosition(px, py, pz, 0.0);
        }
        break;

      case ' ':
        let px, py, pz;
        [px, py, pz] = vehicle.getPosition();
        px = parseInt(px);
        pz = parseInt(pz);
        py = parseInt(py);
        let vquat = vehicle.getModel().chassisBody.quaternion;
        let veuler = new CANNON.Vec3(0, 0, 0);
        vquat.toEuler(veuler);
        let roty = veuler.y / Math.PI + 0.5;
        roty = Math.round(roty*100)/100;
        console.log(" p[z,x,y]=",pz,px,py, " rotY=", roty)
        break;
    }
  })

  // Reset force on keyup
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'ArrowUp':
        keyEvnt.forwards = false;
        break
      case 'ArrowDown':
        keyEvnt.backwards = false;
        break
      case 'ArrowLeft':
        keyEvnt.left = false;
        break
      case 'ArrowRight':
        keyEvnt.right = false;
        break
      case 'b':
        keyEvnt.brake = false;
        break
    }
  })


  // 初期位置
  {
    vehicle.setPosition(iniX, iniY, iniZ, iniRotY);

    camera.position.set(iniX, iniY, iniZ+100);
    camera.lookAt(new THREE.Vector3(iniX, iniY, iniZ));
    orbitControls.target = new THREE.Vector3(iniX, iniY, iniZ);
  }


  var iroty = 0;
  let keyChangeCool = 0;

  function animate() {
    if (gamepad.enable_) {
      // ゲームパッド
      gamepad.update();

      // ステアリング関連
      if (gamepad.para_.stcLH != 0) {
        // ステック左：左：cross-Left
        // ステック左：右：cross-Right
        vehicle.keydown_ArrowRight2(gamepad.para_.stcLH);
      } else if (gamepad.para_.crsL) {
        // 十字左：cross-Left
        vehicle.keydown_ArrowLeft();
      } else if (gamepad.para_.crsR) {
        // 十字右：cross-Right
        vehicle.keydown_ArrowRight();
      } else {
        vehicle.keyup_ArrowLeft();
        // vehicle.keyup_ArrowRight();
      }
      // アクセル／バック関連
      if (gamepad.para_.stcRV > 0) {
        // ステック右：上
        vehicle.keydown_ArrowUp2(gamepad.para_.stcRV);
      } else if (gamepad.para_.btnA) {
        // 前進：button-A
        vehicle.keydown_ArrowUp();
      } else if (gamepad.para_.btnY) {
        // バック：button-Y
        vehicle.keydown_ArrowDown();
      } else {
        vehicle.keyup_ArrowUp();
      }
      // ブレーキ関連
      if (gamepad.para_.stcRV < 0) {
        // ステック右：下
        vehicle.keydown_brake2(-gamepad.para_.stcRV);
      } else if (gamepad.para_.btnB) {
        vehicle.keydown_brake();
      } else if (gamepad.para_.btnX) {
        vehicle.keydown_sidebrakeON();
      } else {
        vehicle.keyup_brake();
      }
      if (keyChangeCool > 0) {
        keyChangeCool += -1;
      } else {
        if (gamepad.para_.btnRB) {
          keyChangeCool = 30;
          cameraPosi = (cameraPosi + 1) % 5;
        }
        if (gamepad.para_.btnLB) {
          keyChangeCool = 30;
          cameraPosi = (cameraPosi + 4) % 5;
        }
        if (gamepad.para_.btnLT || gamepad.para_.btnRT) {
          keyChangeCool = 10;
          vehicle.keydown_resetPosture();
        }
      }

    } else {
      // key
      // 車関連(押しっぱなし／同時押しの key-event処理) ?
      if (keyEvnt.forwards) {
        vehicle.keydown_ArrowUp();
      } else if (keyEvnt.backwards) {
        vehicle.keydown_ArrowDown();
      } else {
        vehicle.keyup_ArrowUp();
      }
      if (keyEvnt.left) {
        vehicle.keydown_ArrowLeft();
      } else if (keyEvnt.right) {
        vehicle.keydown_ArrowRight();
      } else {
        vehicle.keyup_ArrowLeft();
      }
      if (keyEvnt.brake) {
        vehicle.keydown_brake();
      // } else if (vehicle.sidebrake_) {
      } else if (keyEvnt.sidebrake) {
        vehicle.keydown_sidebrake();
      } else {
        vehicle.keyup_brake();
      }
    }

    world.step(timeStep)

    // slopetoy
    for (let ii = 0; ii < srclist.length; ++ii) {
      let src = srclist[ii];
      for (let i = 0; i < src.moBallBodyVec_.length; ++i) {
        // 場外判定
        if (src.moBallBodyVec_[i].position.y < -100) {
          src.repop(src.moBallBodyVec_[i]);
        }
        // 停止判定
        // if (src.moBallBodyVec_[i].velocity.lengthSquared() < 0.001) {
        if (src.moBallBodyVec_[i].velocity.lengthSquared() < 0.01) {
          src.repop(src.moBallBodyVec_[i]);
        }
      }
      src.pop();
    }

    // 車関連
    vehicle.viewUpdate();

    // カメラ・視点 関連
    var chassisBody = vehicle.getModel().chassisBody;
    var vposi = chassisBody.position;
    var vquat = chassisBody.quaternion;

    if (cameraPosi == 0) {
      // 後背からビュー / 車の後方位置から正面に向けて
      var vv = vquat.vmult(new CANNON.Vec3(23, 5, 0));  // 後方、高さ、左右
      camera.position.set(vposi.x + vv.x, vposi.y + vv.y, vposi.z + vv.z);
      camera.rotation.z = 0;
      camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));
    } else if (cameraPosi == 1) {
      // フロントビュー（ドライバー視点) / 車の中心位置から正面に向けて
      camera.position.copy(new THREE.Vector3(vposi.x, vposi.y+2, vposi.z));
      camera.rotation.z = 0;
      var vv = vquat.vmult(new CANNON.Vec3(-20, 0, 0));  // 前方、高さ、左右
      camera.lookAt(new THREE.Vector3(vposi.x + vv.x, vposi.y + vv.y, vposi.z + vv.z));
    } else if (cameraPosi == 2) {
      // トップビュー 上空から / 車の前面が上に
      camera.position.set(vposi.x, vposi.y + 200, vposi.z);
      camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));
      var veuler = new CANNON.Vec3(0, 0, 0);
      vquat.toEuler(veuler);
      var viecleRotY = veuler.y + Math.PI / 2;  // X軸負の方向を向いて作成したので、上を向くよう90度ずらす
      camera.rotation.z = viecleRotY;

    } else if (cameraPosi == 3) {
      // // カスタムなの自動回転
      orbitControls.autoRotate = true;
      orbitControls.target = new THREE.Vector3(vposi.x, vposi.y, vposi.z);
      orbitControls.update();

    } else {
      // _cameraPosi == 4
      // OrbitControls のマウス操作に任せる
      orbitControls.autoRotate = false;
      orbitControls.update();
    }

    {
      let speed = vehicle.getSpeed();
      speed = parseInt(speed*10)/10.0;
      setSpeed(speed);
    }

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  animate();
};

function setSpeed(speed) {
    const canvas = document.getElementById('canvas2d');
    const ctxspd = canvas.getContext('2d');
    canvas.width = 200; // window.innerWidth;
    canvas.height = 40; // window.innerHeight;
    ctxspd.font = '20px bold sans-serif';
    ctxspd.textBaseline = 'alphabetic';
    ctxspd.textAlign = 'start';
    ctxspd.fillStyle = 'white';
    ctxspd.fillText("speed: "+speed, 20, 22);
};


/*

*/

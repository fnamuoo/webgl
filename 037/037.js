// mode:javascript
//
// slope toy

import * as THREE from "three";
import * as CANNON from "cannon";
import * as ST from "Slopetoy";

import { OrbitControls } from "orbitcontrols";

const timeStep = 1 / 30;

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
    orbitControls.dampingFactor = 0.2  // 小：滑る　／　大：クイックに止まる
    orbitControls.minDistance = 10
    orbitControls.maxDistance = 1000
  }

  return {world, camera, scene, renderer, orbitControls};
}



window.onload = () => {
  const {world, camera, scene, renderer, orbitControls} = setupWorld();

  orbitControls.autoRotate = false;
  ST.init0(world, scene);

  const moGroundMtr = new CANNON.Material({name: 'ground'});

  // 地面代わりのbox
  const grndw = 50; const grndh = 50;
  const moGround2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(grndw, 0.5, grndh)),
    position: new CANNON.Vec3(0, -0.5, 0),
    material: moGroundMtr,
  });
  world.addBody(moGround2Body);
  const viGround2Geo = new THREE.BoxGeometry(grndw*2, 1, grndh*2);
  const viGround2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
  const viGround2Mesh = new THREE.Mesh(viGround2Geo, viGround2Mtr);
  scene.add(viGround2Mesh);
  viGround2Mesh.position.copy(moGround2Body.position);
  viGround2Mesh.quaternion.copy(moGround2Body.quaternion);

  // 基準面を作成 (100pixel四方を 5x5分割   1x1 size
  const viBaseGrid2 = new THREE.GridHelper(100, 100, 0xff8888, 0x004000);
  viBaseGrid2.position.set(0, 0, -0.04);
  scene.add(viBaseGrid2);
  // 基準面を作成 (100pixel四方を 10x10分割  10x10size
  const viBaseGrid = new THREE.GridHelper(100, 10, 0xff8888, 0xc0c0c0);
  viBaseGrid.position.set(0, 0, -0.01);
  scene.add(viBaseGrid);

  var srclist = [];
  var actuatorlist = [];

  // シーン
  if (0) {
    // レール(直進のみ)
    var dataInfo = [["rail_st",   0,  0,  0, 0],
                    ["ball"   ,   5, 10,  5],
                    ["rail_st",   0, 10, 20, 0],
                    ["rail_st",  10, 10, 20, 0],
                    ["rail_st",  20, 10, 20, 0],
                    ["rail_st", -10, 10, 20, 1],
                    ["rail_st", -10, 10, 30, 1],
                    ["ball"   ,   5, 25, 25],
                    ["ball"   ,   3, 35, 25],
                    ["ball"   ,  -5, 25, 35],
                   ];
    ST.init(world, scene, dataInfo);
    // // var src1 = new ST.Source_00(   0, 55,  0, 20, 0.04, 0);
    var src1 = new ST.Source_00(   5, 55, 20, 20, 0.04, 0);
    // // var src2 = new ST.Source_00(   3, 65, 20, 20, 0.04, 0);
    var src2 = new ST.Source_00( -10, 55, 30, 20, 0.04, 0);
    var srclist = [src1,src2];
  }
    // レール(直進＋傾斜)
  if (0) {
      var dataInfo = [["rail_st",   0,  0,  0, 0],
                      ["rail_st_slope",   0, 0,  0, 1],
                      ["rail_st"      , -10, 10,  0, 0],
                      ["rail_st_slope",   0, 10,  0, 0],
                      ["rail_st"      ,  20, 20,  0, 0],
                      ["rail_st"      , -30, 20,  0, 1],
                      ["rail_st_slope", -30, 10, 10, 1],
                      ["rail_st"      , -30, 10, 30, 1],
                      // ["ball"      ,  13, 25,  0],
                      // ["ball"      , -30, 25, 10],
                     ];
      ST.init(world, scene, dataInfo);
    var src1 = new ST.Source_00(  13, 25,  0, 20, 0.04, 0);
    var src2 = new ST.Source_00( -30, 25, 10, 20, 0.04, 0);
    var srclist = [src1,src2];
  }

  // レール(直進＋曲斜)
  if (0) {
    var dataInfo = [["rail_st"          ,  0,  0,  0, 0],
                    ["rail_st_slope_arc",  0,  0,  0, 0],
                    ["rail_st"          , -10, 10,-20, 0],
                    ["rail_st_slope_arc",   0, 10,-20, 0],
                    ["rail_st"          ,  20, 20,-20, 0],
                    ];
      ST.init(world, scene, dataInfo);
    var src = new ST.Source_00( 13, 35, -20, 20, 0.04, 0);
    var srclist = [src];
  }

  // レール(曲S)
  if (0) {
    var dataInfo = [["rail_st"       ,  0,  0,  0, 0],
                    ["rail_arc_s"    ,  0,  0,  0, 0],
                    ["rail_st"       ,  20, 20,-20, 0],
                    ["rail_st_slope" ,   0, 10,-20, 0],
                    ["rail_st"       , -10, 10,-20, 0],
                    ["rail_arc_s"    , -20, 10,-20, 2],  // ／+
                    ["rail_arc_s"    , -20, 10,-10, 0],  // +／
                    ["rail_arc_s"    , -30, 10,-10, 3],  // ＼+
                    ["rail_arc_s"    , -30, 10,-20, 1],  // +＼
                    ["rail_st"       , -40, 10,-20, 0],
                    // ["ball"       ,  13, 25,-20],
                    ];
      ST.init(world, scene, dataInfo);
    var src = new ST.Source_00( 13, 35, -20, 20, 0.04, 0);
    var srclist = [src];
  }

  // シーン(2)
  if (0) {
    // レール(曲M)
    var dataInfo = [["rail_st"      ,   0,  0,  0, 0],
                    ["rail_arc_m"   ,   0,  0,  0, 0],
                    ["rail_st"      ,   0, 10, 20, 0],
                    ["rail_st_slope",  10, 10, 20, 0],
                    ["rail_st"      ,  30, 20, 20, 0],
                    ["rail_arc_m"   , -20, 10, 10, 3],  // ＼+
                    ["rail_arc_m"   , -20, 10,-10, 2],  // ／+
                    ["rail_arc_m"   ,   0, 10,-20, 0],  // +／
                    ["rail_arc_m"   ,   0, 10,-40, 1],  // +＼
//                    ["ball"      ,  23, 35, 20],
                   ];
    ST.init(world, scene, dataInfo);
    var src = new ST.Source_00( 23, 35, 20, 20, 0.04, 0);
    var srclist = [src];
  }

  // シーン(3)
  if (0) {
    // レール(曲L)
    // ソースと回収ボックス
    var dataInfo = [["rail_st"      ,   0,  0,  0, 0],
                    ["rail_arc_l"   ,   0,  0,  0, 3],
                    ["rail_st"      ,   0, 20, 30, 0],
                    ["rail_st_slope",  10, 20, 30, 0],
                    ["rail_st"      ,  30, 30, 30, 0],
                    ["rail_arc_l"   , -30, 20, 10, 3],  // ＼+
                    ["rail_st"      , -30, 20,  0, 1],
                    ["rail_st"      , -30, 20,-10, 1],
                    ["rail_arc_l"   , -30, 20,-40, 2],  // ／+
                    ["rail_arc_l"   ,   0, 20,-40, 1],  // +＼
                    ["rail_arc_l"   ,   0, 10,  0, 0],  // +／
                    // ["ball"      ,  23, 45, 30],
                   ];
    ST.init(world, scene, dataInfo);
    var src = new ST.Source_00( 23, 45, 30, 20, 0.04, 0);
    var srclist = [src];
  }

  // シーン(3)
  if (0) {
    // ソースと回収ボックス
    var dataInfo = [["rail_st"   ,   0, 20, 0, 0],
                    ["rail_st_slope",  10, 20, 0, 0],
                    ["rail_st"   ,  30, 30, 0, 0],
                   ];
    ST.init(world, scene, dataInfo);
    var src  = new ST.Source_00(  23, 45, 0, 20, 0.04, 0);
    var rbox = new ST.RecycleBox_00( -40,  0, 0, src);
    var srclist = [src];
  }


  // シーン(4)
  if (0) {
    // レール(斜)
    // ソースと回収ボックスｘ２
    var dataInfo = [["rail_st"      ,  30, 30, 0, 0],
                    ["rail_st_slope",  10, 20, 0, 0],
                    ["rail_st_slope", -10, 10, 0, 0],
                    ["rail_st"      , -30, 25, -30, 0],
                    ["rail_st_slope", -20, 15, -30, 2],
                    ["rail_st"      ,   0, 15, -30, 0],
                   ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  23, 45, 0, 20, 0.04, 0);
    var rbox1 = new ST.RecycleBox_00( -40,  0, 0, src1);
    var src2  = new ST.Source_00( -23, 45, -30, 20, 0.004, 1);
    var rbox2 = new ST.RecycleBox_00(  40,  0, -30, src2);
    var srclist = [src1, src2];
  }

  // シーン(5)
  if (0) {
    // レール(斜)
    // 漏斗（渦巻型）
    var dataInfo = [["rail_st"   ,    0,  0,  0, 0],
                    ["rail_st"   ,   50, 10, 20, 1],
                    ["rail_st"   ,   20, 10,  0, 0],
                    ["rail_st"   ,    0, 10, 30, 1],
                    ["rail_st"   ,   30, 10, 50, 0],
                    ["rail_st"   ,   20,  0, 30, 0],
                    ["funnel_sq" ,   0,  0,  0, 3],
                    ["rail_st"      ,  10, 30, -30, 0],
                    ["rail_st_slope",  20, 30, -30, 0],
                    ["rail_st"      ,  40, 40, -30, 0],
                    ["funnel_sq"    , -20, 20, -80, 3],
                    ["rail_st_slope", -10, 10, -50, 0],
                   ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  33, 45, -30, 20, 0.004, 0);
//    var rbox1 = new ST.RecycleBox_00( -40,  5, -30, src1);
    var srclist = [src1];
  }

  // シーン(6)
  if (0) {
    // レール(斜)
    // 漏斗（渦巻型）、逆巻き
    var dataInfo = [["rail_st"       ,  50, 10, 30, 1],
                    ["rail_st"       ,  30, 10,  0, 0],
                    ["rail_st"       ,   0, 10, 20, 1],
                    ["rail_st"       ,  20, 10, 50, 0],
                    ["rail_st"       ,  30,  0, 30, 0],
                    ["funnel_sq_r"   ,   0,  0,  0, 3],

                    ["rail_st_slope" ,  30, 50,-50, 0],
                    ["rail_st"       ,  20, 50,-50, 0],
                    ["rail_st"       ,  10, 50,-50, 0],
                    ["funnel_sq_r"   , -20, 40,-50, 1],
                    ["rail_st_slope" , -10, 30,-30, 0],
                    ["rail_st"       , -20, 30,-30, 0],
                    ["rail_st"       , -30, 30,-30, 0],
                    ["funnel_sq_r"   , -60, 20,-30, 1],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  33, 75, -50, 20, 0.004, 0);
    // var rbox1 = new ST.RecycleBox_00( -40,  5, 0, src1);
    var srclist = [src1];
  }

  // シーン(7)
  if (0) {
    // 漏斗（平板型）中央に穴あき
    var dataInfo = [["rail_st"       ,  0,  0,  0, 0],
                    ["funnel_plt_s"  ,  0,  0,  0, 1],
                    // ["funnel_plt_m"  ,  0,  0,  0, 1],
                    ["funnel_plt_s"  ,  0, 70,-60, 0],
                    ["funnel_plt_m"  ,-20, 50,-80, 0],
                    ["funnel_plt_m"  ,-30, 30,-70, 0],
                   ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  10+3, 90, -50+3, 20, 0.004, 0);
    var rbox1 = new ST.RecycleBox_00( -10,  10, -50, src1);
    var srclist = [src1];
  }

  // シーン(8)
  var src1;
  if (0) {
    // 漏斗（平板型）隅に穴あき
    var dataInfo = [["funnel_plt_m_c"  ,  0,  0,  0, 1],
                    ["rail_st"       ,  0,  0,  0, 0],
                    ["funnel_plt_m_c"  , 20,100,-70, 0],  // ┌
                    ["funnel_plt_m_c"  ,-20, 80,-50, 3],  // ┐
                    ["funnel_plt_m_c"  ,-10, 60,-80, 2],  // ┘
                    ["funnel_plt_m_c"  , 10, 40,-70, 1],  // └
                    ["funnel_plt_m_c"  ,-20, 20,-50, 0],
                   ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  15, 120, -55, 20, 0.004, 0);
    var rbox1 = new ST.RecycleBox_00( -20,  5, -50, src1);
    var srclist = [src1];
  }

  // 007: シーン(9) / シーン(1) 改
  //   コースの作成例
  //     カーブ
  if (0) {
    var dataInfo = [["rail_st_slope",  10, 50,  0, 0],
                    ["rail_st"   ,   0, 50,  0, 0],
                    ["rail_st"   , -10, 50,  0, 0],
                    ["rail_arc_l", -40, 50,-20, 3],
                    ["rail_arc_l", -40, 50,-50, 2],
                    ["rail_st_slope", -10, 40,-50, 2],
                    ["rail_arc_m",  10, 40,-50, 1],
                    ["rail_st"   ,  20, 40,-30, 1],
                    ["rail_st"   ,  20, 40,-20, 1],
                    ["rail_st"   ,  20, 40,-10, 1],
                    ["rail_arc_m",  10, 40,  0, 0],
                    ["rail_st_slope", -10, 30, 10, 0],
                    ["rail_arc_m", -30, 30,  0, 3],
                    ["rail_st"   , -30, 30,-10, 1],
                    ["rail_st"   , -30, 30,-20, 1],
                    ["rail_arc_m", -30, 30,-40, 2],
                    ["rail_st"   , -10, 30,-40, 0],
                    ["rail_st"   ,  10, 20,-40, 0],
                    ["rail_st"   ,  20, 20,-40, 0],
                    ["rail_st"   ,  30, 20,-40, 0],
                    ["rail_arc_s",  40, 20,-40, 1],
                    ["rail_arc_s",  40, 20,-30, 0],
                    ["rail_arc_s",  30, 20,-30, 2],
                    ["rail_st"   ,  30, 20,-20, 1],
                    ["rail_st_slope",  30, 10,-10, 1],
                    ["rail_st"   ,  30, 10, 10, 1],
                    ["rail_arc_s",  30, 10, 20, 0],
                    ["rail_arc_s",  20, 10, 20, 3],
                    ["rail_arc_s",  20, 10, 10, 1],
                    ["rail_arc_s",  10, 10, 10, 2],
                    ["rail_arc_s",  10, 10, 20, 0],
                    ["rail_arc_s",   0, 10, 20, 3],
                    ["rail_st"   ,   0, 10, 10, 1],
                    ["rail_st"   ,   0, 10,  0, 1],
                    ["rail_arc_s",   0, 10,-10, 1],
                    ["rail_arc_s", -10, 10,-10, 2],
                    ["rail_arc_s", -10, 10,  0, 0],
                    ["rail_st"   , -20, 10,  0, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  20, 90, 0, 20, 0.004, 0);
    var rbox1 = new ST.RecycleBox_00( -40,  5, 0, src1);
    var srclist = [src1];
  }


  // 008: シーン(10)
  //   90度アップ、90度ダウン
  if (0) {
    var dataInfo = [["rail_st_slope",  20, 30,-20, 0],
                    ["rail_st"   ,  10, 30,-20, 0],
                    ["rail_st"   ,   0, 30,-20, 0],
                    ["updown_s"  , -10, 20,-20, 0],
                    ["rail_st"   ,  10, 20,-20, 0],
                    ["rail_st"   ,   0, 20,-20, 0],
                    ["updown_s"  ,  20, 10,-20, 2],
                    ["rail_st"   ,  10, 10,-20, 0],
                    ["rail_st"   ,   0, 10,-20, 0],

                    ["rail_st_slope",  20, 30,  0, 0],
                    ["rail_st"   ,  10, 30,  0, 0],
                    ["rail_st"   ,   0, 30,  0, 0],
                    ["up_s"      , -10, 30,  0, 0],
                    ["rail_st"   , -20, 40,  0, 0],

                    ["rail_st_slope",  20, 30, 20, 0],
                    ["rail_st"   ,  10, 30, 20, 0],
                    ["rail_st"   ,   0, 30, 20, 0],
                    ["down_s"    , -10, 30, 20, 0],
                    ["rail_st"   , -20, 40, 20, 0],
                    ["up_s"    , -10, 20, 20, 2],
                    ["down_s"  , -20, 20, 20, 0],
                    ["up_s"    , -20, 10, 20, 0],

                    ];
    var dataInfo_ = [["rail_st"   ,  10,  0,  0, 0],
                    ["rail_st"   ,  10, 10,  0, 0],
                    // ["updown_s"  ,   0,  0,  0, 2],
                    // ["up_s"    ,  0,  0, 0, 3],
                    ["down_s"  , 0, 0, 0, 0],
                    ];

    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  30, 70,-20, 20, 0.004, 0);
    var src2  = new ST.Source_00(  30,110,  0, 20, 0.004, 0);
    var src3  = new ST.Source_00(  30, 70, 20, 20, 0.004, 0);
    var rbox1 = new ST.RecycleBox_00( -40,  5, 0, src1);
    var srclist = [src1,src2,src3];
  }


  // 009: シーン(11)
  // 加速器
  if (0) {
    var dataInfo = [["rail_st_slope",  20, 10,  -20, 0],
                    ["rail_st"   ,  10, 10,  -20, 0],
                    ["rail_st"   ,   0, 10,  -20, 0],
                    ["rail_st"   , -10, 10,  -20, 0],
                    ["rail_st_slope",  20, 10,  0, 0],
                    ["rail_st"   ,  10, 10,  0, 0],
                    ["rail_st"   ,   0, 10,  0, 0],
                    ["rail_st"   , -10, 10,  0, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  30, 50,  -20, 20, 0.004, 0);
    // 4番目：加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
    var acc  = new ST.Accelerator_00( 10+5, 10+5,  -20+5, 2, 60);
    var acc  = new ST.Accelerator_00(  0+5, 10+5,  -20+5, 2, 60);
    var acc  = new ST.Accelerator_00(-20+5, 10+5,  -20+5, 4, 60);
    var acc  = new ST.Accelerator_00(-25+5, 15+5,  -20+5, 4, 60);
    var src2 = new ST.Source_00(  30, 50,  0, 20, 0.004, 0);
    var acc  = new ST.Accelerator_00(  10+5, 10+5,  0+5, 0, 30);
    var acc  = new ST.Accelerator_00( -20+5, 10+5,  0+5, 5, 60);
    var srclist = [src1,src2];
  }

  // 010: シーン(12)
  // 縦ループ
  if (0) {
    var dataInfo = [["rail_st"   ,  10, 30,  0, 0],
                    ["rail_st"   ,   0, 30,  0, 0],
                    ["rail_st"   , -10, 30,  0, 0],
                    ["vloop_s"    , -20, 30,  0, 0],
                    ["rail_st"   , -20, 30, 10, 0],
                    ["rail_st_slope",  20, 10,  0, 0],
                    ["rail_st"   ,  10, 10,  0, 0],
                    ["rail_st"   ,   0, 10,  0, 0],
                    ["rail_st"   , -10, 10,  0, 0],
                    ["vloop_s"    , -20, 10,  0, 0],
                    ["vloop_s"    , -20, 10, 10, 0],
                    ["rail_st"   , -20, 10, 20, 0],
                    ["rail_st_slope",  20, 10, -30, 0],
                    ["rail_st"   ,  30, 10, -30, 0],
                    ["rail_st"   ,  20, 10, -30, 0],
                    ["rail_st"   ,  10, 10, -30, 0],
                    ["rail_st"   ,   0, 10, -30, 0],
                    ["rail_st"   , -10, 10, -30, 0],
                    ["vloop_m"   , -30, 10, -30, 0],
                    ["rail_st"   , -20, 10, -20, 0],
                    ["rail_st"   , -30, 10, -20, 0],
                    ];
    var dataInfo_ = [["rail_st"   ,  10, 0,  0, 0],
                    ["rail_st"   ,   0, 0,-10, 1],
//                    ["vloop_s"    ,  0, 0,  0, 2],
                    ["vloop_m"    ,  0, 0,  0, 3],
                   ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  10, 40,  0, 20, 0.004, 0);
//    var rbox1 = new ST.RecycleBox_00( -40,  5, 0, src1);
    // 4番目：加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
    var acc  = new ST.Accelerator_00( 15, 35,  5, 2, 60);
    var acc  = new ST.Accelerator_00(  5, 35,  5, 2, 120);
    var src2  = new ST.Source_00(  30, 30,  0, 20, 0.004, 0);
    var acc  = new ST.Accelerator_00( 15, 15,  5, 2, 60);
    var acc  = new ST.Accelerator_00(  5, 15,  5, 2, 250);
    var acc  = new ST.Accelerator_00(-10, 15, 15, 2, 150);
    var src3  = new ST.Source_00(  30, 30, -30, 20, 0.004, 0);
    var acc  = new ST.Accelerator_00( 35, 15, -25, 2, 120);
    var acc  = new ST.Accelerator_00(  5, 15, -25, 2, 250);
    var srclist = [src1,src2,src3];
  }

  //   コースの作成例
  //     加速と縦ループ
  if (0) {
    var dataInfo = [["rail_st_slope",  20, 10,  0, 0],
                    ["rail_st"   ,  10, 10,  0, 0],
                    ["rail_st"   ,   0, 10,  0, 0],
                    ["rail_st"   , -10, 10,  0, 0],
                    ["vloop_s"   , -20, 10,  0, 0],
                    ["vloop_s"   , -20, 10, 10, 0],
                    ["rail_st"   , -20, 10, 20, 0],
                    ["updown_s"  , -30,  0, 20, 0],
                    ["rail_st"   , -20,  0, 20, 0],
                    ["rail_st"   , -10,  0, 20, 0],
                    ["rail_st"   ,   0,  0, 20, 0],
                    ["vloop_s"   ,   0,  0, 10, 0],
                    ["rail_st"   ,  10,  0, 10, 0],
                    ["rail_st"   ,  20,  0, 10, 0],
                    ["rail_st"   ,  30,  0, 10, 0],
                    ["updown_s"  ,  40,  0, 10, 2],
                    ["rail_st"   ,  30, 10, 10, 0],
                    ["updown_s"  ,  20, 10, 10, 0],
                    ["rail_st"   ,  30, 20, 10, 0],
                    ["updown_s"  ,  40, 20, 10, 2],
                    ["rail_st"   ,  30, 30, 10, 0],
                    ["rail_st"   ,  20, 30, 10, 0],
                    ["rail_st"   ,  10, 30, 10, 0],
                    ["rail_st"   ,   0, 30, 10, 0],
//                    ["rail_st"   , -10, 30, 10, 0],
                    ["rail_arc_m", -20, 30,  0, 3],  // ＼+
//                    ["rail_st"   , -20, 30,  0, 1],
                    ["rail_st"   , -20, 30,-10, 1],
                    ["rail_st"   , -20, 30,-20, 1],
                    ["rail_st"   , -20, 30,-30, 1],
                    ["rail_arc_s", -20, 30,-40, 2],  // ／+
                    ["rail_st"   , -10, 30,-40, 0],
                    ["down_s"    ,   0, 30,-40, 2],
                    ["up_s"      ,   0, 20,-40, 0],
                    ["rail_st"   ,  10, 20,-40, 0],
                    ["rail_st"   ,  20, 20,-40, 0],
                    ["rail_st"   ,  30, 20,-40, 0],
                    ["rail_arc_s",  40, 20,-40, 1],  // +＼
                    ["rail_arc_s",  40, 20,-30, 0],  // +／
                    ["rail_st_slope",  20, 10, -30, 0],
                    ["rail_st"   ,  10, 10, -30, 0],
                    ["rail_st"   ,   0, 10, -30, 0],
                    ["rail_st"   , -10, 10, -30, 0],
                    ["vloop_m"   , -30, 10, -30, 0],
                    ["rail_st"   , -20, 10, -20, 0],
                    ["rail_st"   , -30, 10, -20, 0],
                    ["rail_arc_m", -50, 10, -20, 2],  // ／+
                    ["rail_arc_s", -50, 10,   0, 3],  // ＼+
                    ["rail_st"   , -40, 10,   0, 0],
                    ["down_s"    , -30, 10,   0, 2],
                    ["up_s"      , -30,  0,   0, 0],
                    ["rail_st"   , -20,  0,   0, 0],
                    ["rail_st"   , -10,  0,   0, 0],
                    ["rail_st"   ,   0,  0,   0, 0],
                    ["rail_st"   ,  10,  0,   0, 0],
                    ["rail_st"   ,  20,  0,   0, 0],
                    ["rail_st"   ,  30,  0,   0, 0],
                    ["rail_st"   ,  40,  0,   0, 0],
                    ["rail_st"   ,  50,  0,   0, 0],
                    ["updown_s"  ,  60,  0,  0, 2],
                    ["rail_st"   ,  50, 10,  0, 0],
                    ["updown_s"  ,  40, 10,  0, 0],
                    ["rail_st"   ,  50, 20,  0, 0],
                    ["updown_s"  ,  60, 20,  0, 2],
                    ["rail_st"   ,  50, 30,  0, 0],

                    ];
    ST.init(world, scene, dataInfo);
    // 4番目：加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
    var src1  = new ST.Source_00(  30, 30,  0, 20, 0.004, 0);
    var acc  = new ST.Accelerator_00( 15, 15,  5, 2, 60);
    var acc  = new ST.Accelerator_00(  5, 15,  5, 2, 250);
    var acc  = new ST.Accelerator_00(-10, 15, 15, 2, 150);
    var acc  = new ST.Accelerator_00(  5,  5, 25, 0, 150);
    var acc  = new ST.Accelerator_00( 35,  7, 15, 0, 150);
    var acc  = new ST.Accelerator_00( 35, 17, 15, 2, 150);
    var acc  = new ST.Accelerator_00( 35, 27, 15, 0, 150);
    var acc  = new ST.Accelerator_00( 35, 37, 15, 2,  20);
    // var src3  = new ST.Source_00(  30, 30, -30, 20, 0.004, 0);
//    var acc  = new ST.Accelerator_00( 35, 15, -25, 2, 120);
    var acc  = new ST.Accelerator_00(  5, 15, -25, 2, 250);

    var acc  = new ST.Accelerator_00( 55,  7,  5, 0, 150);
    var acc  = new ST.Accelerator_00( 55, 17,  5, 2, 150);
    var acc  = new ST.Accelerator_00( 55, 27,  5, 0, 150);
    var srclist = [src1];
  }


  // 011: シーン(13)
  // 分岐(box垂直・静的)
  if (0) {
    var dataInfo = [["rail_st"       ,  10,  0,  0, 0],
                    ["fork_v"        ,   0,  0,  0, 3],
                    ["funnel_plt_s"  , -10, 50,-10, 0],
                    ["rail_st"       ,  10, 30,  0, 0],
                    ["fork_v"        ,   0, 30,  0, 0],
                    ["rail_st"       , -10, 30,  0, 0],

                    ["funnel_plt_s"  , -40, 20, -10, 0],
                    ["rail_st"       , -30,  0, -10, 1],
                    ["fork_v"        , -30,  0,   0, 1],
                    ["rail_st"       , -30,  0,  10, 1],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  10, 70, 0, 20, 0.004, 0);
    // var rbox1 = new ST.RecycleBox_00( -40,  5, 0, src1);
    var srclist = [src1];
  }

  // 012: シーン(14)
  // 分岐(box水平・静的)
  if (0) {
    var dataInfo = [["fork_h"        ,  0, 0,  0, 1],
                    ["rail_st"       , 10, 0,  0, 0],
                    ["rail_st_slope" ,  10, 40,  0, 0],
                    ["rail_st"       ,   0, 40,  0, 0],
                    ["fork_h"        , -10, 40,  0, 1],
                    ["rail_st"       , -10, 40, 10, 1],

                    ["rail_st_slope" , -10, 30,-20, 3],
                    ["rail_st"       , -10, 30,-30, 1],
                    ["fork_h"        , -10, 30,-40, 0],

                    ["rail_st"       , -20, 30,-40, 0],
                    ["rail_st"       ,   0, 30,-40, 0],
                    ["rail_st_slope" ,  10, 20,-40, 2],
                    ["rail_st"       ,  30, 20,-40, 0],
                    ["fork_h"        ,  40, 20,-40, 3],
                    ["rail_st"       ,  40, 20,-50, 1],
                    ["rail_st_slope" ,  40, 10,-30, 1],
                    ["rail_st"       ,  40, 10,-10, 1],
                    ["fork_h"        ,  40, 10, 0, 2],
                    ["rail_st"       ,  30, 10, 0, 0],
                    ["rail_st"       ,  50, 10, 0, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  20, 60, 0, 20, 0.004, 0);
    // var acc  = new ST.Accelerator_00(  -5, 35, -5, 3, 60);
    // var acc  = new ST.Accelerator_00(  45, 25, -5, 1, 60);
    var srclist = [src1];
  }


  // 013: シーン(15)
  // 分岐(box水平・動的)
  if (0) {
    var dataInfo = [["fork_v2"       ,   0,  0,  0, 1],
                    ["rail_st"       ,  10,  0,  0, 0],
                    ["funnel_plt_s"  , -10, 30, -60, 0],
                    ["rail_st"       ,  10, 10, -50, 0],
                    ["fork_v2"       ,   0, 10, -50, 0],
                    ["rail_st"       , -10, 10, -50, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  0, 50, -50, 20, 0.004, 1);
    var srclist = [src1];
  }

  // 014: シーン(16)
  // 横ループ／ループ橋
  if (0) {
    var dataInfo = [["hloop_s"   ,   0,  0,  0, 4],
                    ["rail_st"   ,  10,  0,  0, 0],
                    ["rail_st"   ,  10, 10,  0, 0],
                    ["rail_st"   ,  10, 30,  -50, 0],
                    ["rail_st"   ,   0, 30,  -50, 0],
                    ["rail_st"   , -10, 30,  -50, 0],
                    ["hloop_s"   , -20, 20,  -50, 1],
                    ["rail_st"   , -20, 20,  -50, 0],
                    ["rail_st"   ,  10, 30,  -30, 0],
                    ["rail_st"   ,   0, 30,  -30, 0],
                    ["rail_st"   , -10, 30,  -30, 0],
                    ["hloop_s"   , -20, 20,  -30, 1],
                    ["hloop_s"   , -20, 10,  -30, 1],
                    ["rail_st"   , -20, 10,  -30, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  10, 50,  -50, 20, 0.004, 0);
    // 4番目：加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
    var acc  = new ST.Accelerator_00( 15, 35,  -45, 2, 60);
    var src2  = new ST.Source_00(  10, 50,  -30, 20, 0.004, 0);
    var acc  = new ST.Accelerator_00( 15, 35,  -25, 2, 60);
    var srclist = [src1,src2];
  }


  // 015: シーン(17)
  // 横ループ／ループ橋(M)
  if (0) {
    var dataInfo = [["hloop_m"   ,   0,  0,    0, 3],
                    ["rail_st"   ,   0,  0,    0, 0],

                    ["rail_st"   ,  10, 30,  -40, 0],
                    ["rail_st"   ,   0, 30,  -40, 0],
                    ["rail_st"   , -10, 30,  -40, 0],
                    ["hloop_m"   , -30, 20,  -40, 1],
                    ["rail_st"   , -20, 20,  -40, 0],
                    ["rail_st"   , -20, 30,  0, 0],
                    ["rail_st"   , -30, 30,  0, 0],
                    ["rail_st"   , -40, 30,  0, 0],
                    ["hloop_m"   , -60, 20,  0, 1],
                    ["hloop_m"   , -60, 10,  0, 1],
                    ["rail_st"   , -50, 10,  0, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  10, 50,  -40, 20, 0.004, 0);
    // 4番目：加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
    var acc  = new ST.Accelerator_00( 15, 35,  -35, 2, 60);
    var src2  = new ST.Source_00(  -20, 50,  0, 20, 0.004, 1);
    var acc  = new ST.Accelerator_00( -15, 35,  5, 2, 60);
    var srclist = [src1,src2];
  }


  // 016: シーン(18)
  // 直線レール（直線半分　UP・DOWN
  if (0) {
    var dataInfo = [["rail_st_slope_arc_s" ,   0,  0,  0, 3],
                    ["rail_st"             ,   0,  0,  0, 0],

                    ["rail_st"             ,  20, 20,  0, 0],
                    ["rail_st"             ,  10, 20,  0, 0],
                    // ["rail_st_slope_arc_s" , -10, 15,  0, 0],
                    // ["rail_st_slope_arc_s" , -30, 15,  0, 2],
                    ["rail_st_slope_arc_s" , -10, 15,  0, 0],
                    ["rail_st_slope_arc_s" , -30, 15,  0, 2],

                    ["rail_st"             , -10, 30,-25, 1],
                    ["rail_st_slope_arc_s" , -10, 30,-15, 3],
                    ["rail_st_slope_arc_s" , -10, 30,  5, 1],

                    ["rail_st"             , -25, 25,-25, 1],
                    ["rail_st_slope_arc_s" , -25, 25,-15, 3],
                    ["rail_st_slope_arc_s" , -25, 25,  5, 1],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  25, 50,  0, 20, 0.004, 0);
    // 4番目：加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
    var acc  = new ST.Accelerator_00( 30, 45,  5, 2, 20);
    var acc  = new ST.Accelerator_00( 25, 35,  5, 2, 20);
    var srclist = [src1];
  }



  // 017: シーン(18)
  // 直線・ななめレール
  if (0) {
    var dataInfo = [//["rail_arc_R45"     ,   0,  0,  0, 3],
                    ["rail_st_R45"      ,   0,  0,  0, 3],
                    ["rail_st"          ,  10,  0,  0, 0],
                    // ["rail_st"          ,  10, 30,  0, 0],
                    // ["rail_st_R45"      ,   0, 30,  5, 0],
                    // ["rail_st_R45"      , -10, 30, 15, 0],
                    ["rail_st"          ,  20,  30,  0, 0],
                    ["rail_st"          ,  10,  30,  0, 0],
                    ["rail_arc_R45"     , -10,  30,  0, 0],
                    ["rail_st_R45"      , -20,  30, 10, 0],
                    ["rail_arc_R45"     , -40,  30, 20, 2],
                    ["rail_arc_s"       , -50,  30, 30, 3],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  25, 50,  0, 20, 0.004, 0);
    // 4番目：加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
    var acc  = new ST.Accelerator_00( 30, 45,  5, 2, 20);
    var acc  = new ST.Accelerator_00( 25, 38,  5, 2, 20);
    var srclist = [src1];
  }

  // 018: シーン(19)
  // 直線・ななめレール・反転
  if (0) {
    var dataInfo = [["rail_arc_R45_r"   ,   0,   0,  0, 3],
                    //["rail_st_R45_r"    ,   0,   0,  0, 3],
                    ["rail_st"          ,  10,   0,  0, 0],

                    ["rail_st"          ,  20,  30,  0, 0],
                    ["rail_st"          ,  10,  30,  0, 0],
                    ["rail_arc_R45_r"   , -10,  30,-10, 2],
                    ["rail_st_R45_r"    , -20,  30,-20, 1],

                    // ["rail_arc_R45_r"   ,  0,  0, 0, 0],
                    // ["rail_st_R45_r"    , 10,  0,10, 1],
                    // ["rail_st_R45_r"    ,  0,   0, 0, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  25, 50,  0, 20, 0.004, 0);
    // 4番目：加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
    var acc  = new ST.Accelerator_00( 30, 45,  5, 2, 20);
    var acc  = new ST.Accelerator_00( 25, 38,  5, 2, 20);
    var srclist = [src1];
  }


  // 019:
  // 十字 .. ちょっとダメぽ：要再検討..再検討
  if (0) {
    // var dataInfo = [["rail_st"          ,  20,  30,  0, 0],
    //                 ["rail_st"          ,  10,  30,  0, 0],
    //                 ["cross"            ,   0,  30,  0, 0],
    //                 ["rail_st"          , -10,  30,  0, 0],
    //                 ["rail_arc_s"       , -20,  30,  0, 3],  // ＼+
    //                 ["rail_st"          , -20,  30,-10, 1],
    //                 ["rail_arc_s"       , -20,  30,-20, 2],  // ／+
    //                 ["rail_st"          , -10,  30,-20, 0],
    //                 ["rail_arc_s"       ,   0,  30,-20, 1],  // +＼
    //                 ["rail_st"          ,   0,  30,-10, 1],
    //                 ["rail_st"          ,   0,  30, 10, 1],
    //                 ];
    var dataInfo = [["cross2"           ,   0,   0,  0, 0],
                    ["rail_st"          ,  10,   0,  0, 0],

                    ["rail_st"          ,  20,  30,  0, 0],
                    ["rail_st"          ,  10,  30,  0, 0],
                    ["cross2"           ,   0,  30,  0, 0],
                    ["rail_st"          , -10,  30,  0, 0],
                    ["rail_arc_s"       , -20,  30,  0, 3],  // ＼+
                    ["rail_st"          , -20,  30,-10, 1],
                    ["rail_arc_s"       , -20,  30,-20, 2],  // ／+
                    ["rail_st"          , -10,  30,-20, 0],
                    ["rail_arc_s"       ,   0,  30,-20, 1],  // +＼
                    ["rail_st"          ,   0,  30,-10, 1],
                    ["rail_st"          ,   0,  30, 10, 1],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  25, 50,  0, 20, 0.004, 0);
    // 4番目：加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
    var acc  = new ST.Accelerator_00( 30, 45,  5, 2, 20);
    var acc  = new ST.Accelerator_00( 25, 38,  5, 2, 20);
    var acc  = new ST.Accelerator_00( 20, 38,  5, 2, 30);
    var acc  = new ST.Accelerator_00(-15, 38, -5, 3, 20);
    var acc  = new ST.Accelerator_00(  5, 38, -5, 1, 30);
    var srclist = [src1];
  }

  // 020:
  // 十字（ななめ） .. 一旦形だけ作る：要再検討 .. 再検討
  if (0) {
    var dataInfo = [// ["cross_R45"        ,   0,   10,  0, 0],
                    // ["cross2_R45"        ,   0,    0,  0, 0],

                    ["cross2_R45"       ,   0,   10,   0, 0],
                    ["rail_st_R45"      ,  10,   10,  10, 1],  // ＼＼
                    ["rail_st_R45"      , -10,   10, -10, 1],
                    ["rail_st_R45_r"    , -10,   10,  10, 0],   // ／／
                    ["rail_st_R45_r"    ,  10,   10, -10, 0],  // ／／
                    ["rail_arc_R45"     , -20,   10, -30, 1],  // ||＼ 
                    ["rail_arc_s"       , -20,   10, -40, 2],  // ／+
                    ["rail_st"          , -10,   10, -40, 0],
                    ["rail_st"          ,   0,   10, -40, 0],
                    ["rail_st"          ,  10,   10, -40, 0],
                    ["rail_st"          ,  20,   10, -40, 0],
                    ["rail_arc_s"       ,  30,   10, -40, 1],  // +＼
                    ["rail_arc_R45_r"   ,  20,   10, -30, 3],  // ／||
                    ["rail_arc_R45_r"   , -20,   10,  20, 1],  // ||／
                    ["rail_st"          , -20,   10,  40, 1],
                    ["rail_arc_R45_r"   ,  30,   10,  20, 2],  // ＼__
//                    ["rail_st_R45"      ,  20,   10,  20, 1],
                    ["rail_st_R45_2"    ,  20,  10,  20, 1],   //    ・／
                    ["rail_st"          ,  50,   10,  30, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  45, 50,  30, 20, 0.004, 0);
    // 4番目：加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
    var acc  = new ST.Accelerator_00( 50,  18, 35, 2, 30);
    var acc  = new ST.Accelerator_00( 45,  18, 35, 2, 30);
    var acc  = new ST.Accelerator_00( 40,  18, 35, 2, 30);
    var acc  = new ST.Accelerator_00(  5,  18,-35, 0, 30);
    var acc  = new ST.Accelerator_01( 20,  18, 15, -1, 0,-1, 20);
    var acc  = new ST.Accelerator_01( 30,  18,-15, -1, 0, 1, 30);
    var srclist = [src1];
  }

  // 021:
  // 直線（ななめ）
  if (0) {
    var dataInfo = [["rail_st_R45_r"    ,   0,  0,-10, 0],   //      ／／
                    ["rail_st_R45_2"    ,   0,  0,  0, 2],   //    ・／
                    ["rail_st_R45"      , -10,  0,  0, 0],   //  ／
                    //                                           ／
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  45, 50,  30, 20, 0.004, 0);
    var rbox1 = new ST.RecycleBox_00( -40,  5, 0, src1);
    // 4番目：加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
    var acc  = new ST.Accelerator_00( 45,  13, 30, 2, 30);
    var acc  = new ST.Accelerator_00( 40,  13, 30, 2, 30);
    var acc  = new ST.Accelerator_00( 35,  13, 30, 2, 30);
    var srclist = [src1];
  }


  // 022:
  // 直線（ラインを若干ずらす）
  if (0) {
    var dataInfo = [["rail_st_shift_line"     ,  0,   0,  0, 3],
                    ["rail_st_shift_line2"    ,  0,   0,  0, 3],
                    ["rail_st"                ,-10,   0,  0, 0],
                    ["rail_st"                , 10,   0,  0, 0],
                    ["rail_st"                ,  0,   0, 10, 1],
                    ["rail_st"                ,  0,   0,-10, 1],
                    ["rail_st"                ,-10,  10,  0, 0],
                    ["rail_st_shift_line"     ,  0,  10,  0, 0],
                    ["rail_st"                , 10,  10,  2, 0],
                    ["rail_st_shift_line2"    , 20,  10,  0, 2],
                    ["rail_st"                , 30,  10,  0, 0],
                    ["rail_st"                , 40,  10,  0, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  45, 30,  0, 20, 0.004, 0);
    // 4番目：加速方向 0:x+, 1:z+, 2:x-, 3:z-, 4:y+, 5:y-
    var acc  = new ST.Accelerator_00( 50,  18, 5, 2, 20);
    var acc  = new ST.Accelerator_00( 45,  18, 5, 2, 20);
//    var acc  = new ST.Accelerator_00( 35,  13, 0, 2, 20);
    var srclist = [src1];
  }

  // 023
  // 任意の方向の加速
  if (0) {
    var dataInfo = [["rail_st"                ,  0,   0,  0, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  0, 30,  0, 20, 0.004, 0);
    var rbox1 = new ST.RecycleBox_00( -40,  5, 0, src1);
    var acc  = new ST.Accelerator_01( - 5, 3,  5,  -1, 1, 0,  60);
    var acc  = new ST.Accelerator_01(  15, 3,  5,   1, 1, 0,  90);
    var acc  = new ST.Accelerator_01(   5, 3, 15,   0, 1, 1,  120);
    var acc  = new ST.Accelerator_01(   5, 3, -5,   0, 1,-1,  120);
    var srclist = [src1];
  }

  // 024
  // エレベータ
  if (0) {
    var dataInfo = [["rail_st"                ,  10,  20,  0, 0],
                    ["rail_st_slope"          ,  20,  20,  0, 0],
                    ["rail_st_slope"          ,   0,   0,  0, 0],
                    ["rail_st"                , -10,  40,  0, 0],
                    ["rail_st"                , -20,  40,  0, 0],
                    ["rail_st"                ,  10,  20,  -30, 0],
                    ["rail_st_slope"          ,  20,  20,  -30, 0],
                    ["rail_st"                , -10,  70,  -30, 0],
                    ["rail_st"                , -20,  70,  -30, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  30, 40,  0, 20, 0.004, 0);
    var rbox1 = new ST.RecycleBox_00( -40,  5, 0, src1);
    var ele  = new ST.Elevator_00(   0, 20, 0,  30);
    var src2  = new ST.Source_00(  30, 40,  -30, 20, 0.004, 0);
    var ele  = new ST.Elevator_00(   0, 20, -30,  60);
    var srclist = [src1, src2];
  }

  // 025
  // エレベータ
  // var actuatorlist = [];
  if (0) {
    var dataInfo = [["rail_st"                ,  10,   0,  0, 0],
                    ["rail_st_slope"          ,  10,  20,  -30, 0],
                    ["rail_st_slope"          ,   0,   0,  -30, 0],
                    ["rail_st"                , -10,  40,  -30, 0],
                    ["rail_st"                , -20,  40,  -30, 0],
                    // ["rail_st"                ,  10,  20,  -30, 0],
                    // ["rail_st_slope"          ,  20,  20,  -30, 0],
                    // ["rail_st"                , -10,  70,  -30, 0],
                    // ["rail_st"                , -20,  70,  -30, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  20, 40,  -30, 20, 0.004, 0);
    var ele1  = new ST.Elevator_01(   0, 20, -30,  30, 0);
    var ele2  = new ST.Elevator_01(   0, 0, 0,  30, 0);
    // var src2  = new ST.Source_00(  30, 40,  -30, 20, 0.004, 0);
    actuatorlist.push(ele1, ele2);
    var srclist = [src1];
  }

  // 026
  // 風車・水平（動力なし、あり）
  // 風車・垂直（動力なし、あり）
  if (0) {
    var dataInfo = [//["windmill_h"             ,   0,   0,  0, 0],
                    //["windmill_h2"            ,   0,   0,  0, 0],
                    //["windmill_h3"            ,   0,   0,  0, 2],
                    //["windmill_v"             ,   0,  0,  0, 1],
                    //["windmill_v2"            ,   0,   0,  0, 0],
                    ["windmill_v3"            ,   0,   0,  0, 0],
                    ["rail_st"                , -10,   0,  0, 0],
                    ["rail_st"                , -10,  10,  0, 0],

                    ["rail_st_slope"          ,  20,  20, 10, 0],
                    ["rail_st"                ,  10,  20, 10, 0],
                    ["rail_st"                ,   0,  20, 10, 0],
                    ["rail_st"                , -10,  20, 10, 0],
                    ["windmill_h"             ,   0,  20,  0, 0],
                    ["windmill_v"             , -30,   0, 10, 0],
                    ["windmill_h2"            ,   0,  20, 25, 0],
                    ["windmill_v2"            , -25,  10, 30, 0],
                    ["rail_st_slope"          ,  40,  20, -20, 0],
                    ["rail_st"                ,  30,  20, -20, 0],
                    ["rail_st"                ,  20,  20, -20, 0],
                    ["rail_st"                ,  10,  20, -20, 0],
                    ["rail_st"                ,   0,  20, -20, 0],
                    //["rail_st"                ,  -5,  20, -20, 0],
                    ["updown_s2"              , -10,  20, -20, 0],
                    //["rail_st"                , -20,  28, -20, 0],
                    ["rail_st"                ,   0,  30, -20, 0],
                    ["rail_st"                ,  10,  30, -20, 0],
                    // ["rail_st"                ,  20,  30, -20, 0],
                    ["rail_arc_s"             ,  20,  30, -20, 0],  // +／
                    ["rail_arc_s"             ,  20,  30, -30, 1],  // +＼
                    ["rail_st"                ,  10,  30, -30, 0],
                    ["rail_st"                ,   0,  30, -30, 0],
                    ["windmill_h3"            ,  10,  20, -20, 0],
                    ["windmill_v3"            ,  -8,  20, -20, 2],
                    ["windmill_h3"            ,  10,  30, -30, 0],
                    // .. 重いからとトルクがかかっているわけではないので、
                    // 物理的に挟まると動かない..
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  30, 40,  10, 20, 0.004, 0);
    var rbox1 = new ST.RecycleBox_00( -40,  5,  10, src1);
    var src2  = new ST.Source_00(  45, 40,  -20, 20, 0.004, 0);
//    var acc  = new ST.Accelerator_01(   10, 28, -15,   -1, 0,0,  120);
    var srclist = [src1,src2];
  }

  // 027
  //     - 合流：卜型　サンプル
  if (0) {
    var dataInfo = [//["join_R45"               ,   0,   0,  0, 0],
                    ["join_R45_r"             ,  0,   0,  0, 0],
                    ["rail_st"                ,  10,   0,  0, 0],
                    ["rail_st_slope"          ,  30,  20, 10, 0],
                    ["rail_st"                ,  20,  20, 10, 0],
                    ["join_R45"               ,   0,  20,  0, 2],
//                    ["rail_st"                , -10,  20, 10, 0],
                    ["rail_arc_R45"           ,  20,  20,-10, 0],
                    ["rail_st_slope"          ,  40,  20,-10, 0],
                    ["join_R45_r"             , -20,  20, 10, 0],
                    ["rail_arc_R45_r"         ,   0,  20, 20, 2],
                    ["rail_st_slope"          ,  20,  20, 30, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(  40, 40,  10, 20, 0.004, 0);
    var rbox1 = new ST.RecycleBox_00( -40,  5,  10, src1);
    var src2  = new ST.Source_00(  50, 40, -10, 20, 0.004, 0);
    var src3  = new ST.Source_00(  30, 40,  30, 20, 0.004, 0);
    var srclist = [src1,src2,src3];
  }


  //   コースの作成例
  //     エレベータ、半分下げる、水平ループ
  if (0) {
    var dataInfo = [["rail_st_slope"          ,   0, 100,  0, 0],
                    ["rail_st"                , -10, 80,  0, 0],
                    ["rail_st"                , -20, 80,  0, 0],
                    ["rail_st"                , -30, 80,  0, 0],
                    ["rail_arc_s"             , -40,  80,   0, 2],  // ／+
                    ["rail_arc_s"             , -40,  80,  10, 3],  // ＼+
                    ["rail_st"                , -30,  80,  10, 0],
                    ["rail_st_slope_arc"      , -20,  70,  10, 2],
                    ["rail_st"                ,   0,  70,  10, 0],
                    ["rail_arc_m"             ,  10,  70,   0, 0],  // +／
                    ["rail_arc_s"             ,  20,  70, -10, 1],  // +＼
                    ["rail_st"                ,  10,  70, -10, 0],
                    ["rail_st"                ,   0,  70, -10, 0],
                    ["rail_st"                , -10,  70, -10, 0],
                    ["rail_st"                , -20,  70, -10, 0],
                    ["rail_st"                , -30,  70, -10, 0],
                    ["rail_arc_m"             , -50,  70, -10, 2],  // ／+
                    ["rail_arc_s"             , -50,  70,  10, 3],  // ＼+
                    ["rail_st"                , -40,  70,  10, 0],
                    ["rail_st"                , -30,  70,  10, 0],
                    ["rail_st_slope_arc"      , -20,  60,  10, 2],
                    ["rail_st"                ,   0,  60,  10, 0],
                    ["rail_st"                ,  10,  60,  10, 0],
                    ["rail_arc_m"             ,  20,  60,   0, 0],  // +／
                    ["rail_arc_m"             ,  20,  60, -20, 1],  // +＼
                    // ["rail_st_shift_line2"    ,  10,  60, -20, 2],
                    // ["rail_st_shift_line"     ,   0,  60, -20, 0],
                    ["rail_st"                ,  10,  60, -20, 0],
                    // ["rail_st"                ,   0,  60, -20, 0],
                    // ["rail_st"                , -10,  60, -20, 0],
                    ["rail_st_slope_arc_s"    , -10,  55, -20, 0],
                    ["rail_arc_m"             , -30,  55, -20, 2],  // ／+
                    ["rail_st"                , -30,  55,   0, 1],
                    ["rail_arc_m"             , -30,  55,  10, 3],  // ＼+
                    ["rail_st_slope_arc_s"    , -10,  50,  20, 2],
                    ["rail_arc_l"             ,  10,  50,   0, 0],  // +／
                    ["rail_arc_l"             ,  10,  50, -30, 1],  // +＼
                    ["rail_st"                ,   0,  50, -30, 0],
                    ["rail_st"                , -10,  50, -30, 0],
                    ["rail_st"                , -20,  50, -30, 0],
                    ["rail_arc_l"             , -50,  50, -30, 2],  // ／+
                    ["rail_st"                , -50,  50,   0, 1],
                    ["rail_arc_l"             , -50,  50,  10, 3],  // ＼+
                    ["rail_st_slope_arc"      , -20,  40,  30, 2],
                    ["rail_st"                ,   0,  40,  30, 0],
                    ["rail_st"                ,  10,  40,  30, 0],
                    ["rail_st"                ,  20,  40,  30, 0],
                    ["hloop_m"                ,  10,  30,   0, 3],
                    ["rail_st_slope_arc_s"    ,  30,  25,  30, 2],
                    ["rail_arc_l"             ,  50,  25,  10, 0],  // +／
                    ["rail_arc_l"             ,  50,  25, -20, 1],  // +＼
                    ["rail_st_slope_arc_s"    ,  30,  20, -20, 0],
                    ["rail_st"                ,  20,  20, -20, 0],
                    ["rail_st"                ,  10,  20, -20, 0],
                    ["rail_arc_m"             , -10,  20, -20, 2],  // ／+
                    ["rail_st"                , -10,  20,   0, 1],
                    ["rail_arc_m"             , -10,  20,  10, 3],  // ＼+
                    ["rail_st_slope_arc_s"    ,  10,  15,  20, 2],
                    ["rail_st"                ,  30,  15,  20, 0],
                    ["rail_st"                ,  40,  15,  20, 0],
                    ["rail_arc_m"             ,  50,  15,  10, 0],  // +／
                    ["rail_arc_s"             ,  60,  15,   0, 1],  // +＼
                    ["rail_st_slope_arc_s"    ,  40,  10,   0, 0],
                    ["rail_st"                ,  30,  10,   0, 0],
                    ["rail_st_slope" ,  10,  0,  0, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(   10, 120,  0, 20, 0.004, 0);
    var srclist = [src1];
    var ele  = new ST.Elevator_01(   0,  0,  0,  90, 0);
    actuatorlist.push(ele);
  }

  //   コースの作成例
  //    .. 放棄
  if (0) {
    var dataInfo = [["rail_st_slope"          ,   0,   0, -20, 1],
                    ["rail_st"                ,   0,  80,  10, 1],
                    ["down_s"                 ,   0,  80,  20, 1],
                    ["fork_v2"                ,   0,  70,  20, 0],
                    // ["rail_st"                , -10,  70,  20, 0],
                    ["rail_st"                ,  10,  70,  20, 0],
                    ["rail_st"                ,  20,  70,  20, 0],
                    ["rail_arc_s"             ,  30,  70,  20, 1],  // +＼
                    ["rail_arc_s"             ,  30,  70,  30, 0],  // +／
                    ["rail_st_slope_arc_s"    , -10,  60,  30, 0],
                    ["rail_st_slope_arc_s"    ,  10,  65,  30, 0],
                    ["rail_arc_m"             , -20,  70, -10, 2],  // ／+
                    ["rail_arc_m"             , -20,  70,  10, 3],  // ＼+
                    ["rail_st_slope_arc"      ,   0,  60, -10, 2],

                    ["rail_arc_m"             ,  20,  60, -10, 1],  // +＼
                    ["rail_arc_m"             ,  20,  60,  10, 0],  // +／
                    ["rail_st"                ,  10,  60,  20, 0],
                    ["rail_st"                ,   0,  60,  20, 0],
                    ["rail_st"                , -10,  60,  20, 0],
                    ["rail_arc_l"             , -40,  60, -30, 2],  // ／+
                    ["rail_st"                , -40,  60,   0, 1],
                    ["rail_arc_l"             , -40,  60,  10, 3],  // ＼+

                    ["rail_arc_m"             , -30,  60, -10, 2],  // ／+
                    ["rail_arc_m"             , -30,  60,  10, 3],  // ＼+
                    ["rail_st"                , -10,  60, -10, 0],
                    ["rail_st_slope_arc"      ,   0,  50, -10, 2],

                    
                    ];
    ST.init(world, scene, dataInfo);
    // var src1  = new ST.Source_00(    0, 120,  -20, 20, 0.004, 0);
    var src1  = new ST.Source_00(    0, 120,  10, 20, 0.004, 0);
    var srclist = [src1];
    var ele  = new ST.Elevator_01(   0,  0,  0,  90, 1);
    actuatorlist.push(ele);
  }


  //   コースの作成例
  //    .. 交差を使った例
  if (0) {
    var dataInfo = [["rail_st_slope"          ,  50,  40,  20, 0],

                    ["rail_arc_R45_r"         , -50,  10,-20, 0],  //   ~~＼
                    ["rail_st_R45_2"          , -30,  10,-10, 3],   //   ・＼
                    ["cross2_R45"             , -30,  10,  0, 0],
                    ["rail_st_R45_2"          , -20,  10, 10, 1],   //   ＼・
                    ["rail_arc_R45_r"         , -10,  10, 10, 2],  //   ＼__
                    ["rail_arc_m"             , -70,  10, -20, 2],  // ／+
                    ["rail_st"                , -70,  10,   0, 1],
                    ["rail_arc_m"             , -70,  10,  10, 3],  // ＼+
                    ["rail_arc_R45"           , -50,  10,  10, 2],  //   __／
                    ["rail_st_R45_2"          , -30,  10,  10, 2],   //   ＼・
                    ["rail_arc_R45_r"         , -20,  10, -20, 3],  //   __／
                    ["rail_arc_m"             , -10,  10, -40, 2],  // ／+
                    ["rail_st"                ,  10,  10, -40, 0],
                    ["rail_arc_l"             ,  20,  10, -40, 1],  // +＼
                    ["rail_st"                ,  10,  10,  20, 0],
                    ["rail_arc_m"             ,  20,  10,  10, 0],  // +／

                    ["rail_st_slope_arc"      ,  30,  10, -10, 1],
                    ["rail_st_slope_arc"      ,  40,  10, -10, 3],


                    ["rail_arc_R45_r"         , -40,  20,-20, 0],  //   ~~＼
                    ["rail_st_R45_2"          , -20,  20,-10, 3],   //   ・＼
                    ["cross2_R45"             , -20,  20,  0, 0],
                    ["rail_st_R45_2"          , -10,  20, 10, 1],   //   ＼・
                    ["rail_arc_R45_r"         ,   0,  20, 10, 2],  //   ＼__
                    ["rail_arc_m"             , -60,  20, -20, 2],  // ／+
                    ["rail_st"                , -60,  20,   0, 1],
                    ["rail_arc_m"             , -60,  20,  10, 3],  // ＼+
                    ["rail_arc_R45"           , -40,  20,  10, 2],  //   __／
                    ["rail_st_R45_2"          , -20,  20,  10, 2],   //   ＼・
                    ["rail_arc_R45_r"         , -10,  20, -20, 3],  //   __／
                    ["rail_arc_m"             ,   0,  20, -40, 2],  // ／+
                    ["rail_arc_m"             ,  20,  20, -40, 1],  // +＼
                    ["rail_st"                ,  30,  20, -20, 1],
                    ["rail_st"                ,  20,  20,  20, 0],
                    ["rail_arc_m"             ,  30,  20,  10, 0],  // +／
                    
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(   50, 60, 20, 20, 0.002, 2);
    var srclist = [src1];
    var acc  = new ST.Accelerator_01( 30, 27,  25,  -1, 0, 0, 80);
    var acc  = new ST.Accelerator_01( 20, 17,  25,  -1, 0, 0, 80);
    var acc  = new ST.Accelerator_01(-30, 27,  25,   1, 0,-1, 60);
    var acc  = new ST.Accelerator_01(-40, 17,  25,   1, 0,-1, 60);
    var acc  = new ST.Accelerator_01( 20, 17, -35,   1, 0, 0, 60);
  }



  //   コースの作成例
  //    .. 合流（卜）（２）カメラ目線確認用
  //       カーブで刻み幅の小さい・細かいカーブを用意
  if (1) {
    var dataInfo = [// ["rail_arc_m"             ,  -50,  10, -10, 2],  // ／+
                    // ["rail_arc_m"             ,  -50,  10,  10, 3],  // ＼+
                    ["rail_arc_m2"             ,  -50,  10, -10, 2],  // ／+
                    ["rail_arc_m2"             ,  -50,  10,  10, 3],  // ＼+
                    ["rail_st"                ,  -30,  10,  20, 0],
                    ["join_R45"               ,  -20,  10,  10, 2],
                    ["rail_st"                ,    0,  10,  20, 0],
                    ["rail_st"                ,   10,  10,  20, 0],
                    ["rail_st"                ,   20,  10,  20, 0],
                    ["rail_arc_R45"           ,    0,  10,   0, 0],  // ／~~
                    ["rail_st_slope"          ,   20,  10,   0, 0],
                    ["rail_st"                ,  -30,  10, -10, 0],
                    ["rail_st"                ,  -20,  10, -10, 0],
                    ["rail_st"                ,  -10,  10, -10, 0],
                    ["rail_st"                ,    0,  10, -10, 0],
                    ["rail_st"                ,   10,  10, -10, 0],
                    ["rail_st"                ,   20,  10, -10, 0],
                    // ["rail_arc_m"             ,   30,  10, -10, 1],  // +＼
                    // ["rail_arc_m"             ,   30,  10,  10, 0],  // +／
                    ["rail_arc_m2"             ,   30,  10, -10, 1],  // +＼
                    ["rail_arc_m2"             ,   30,  10,  10, 0],  // +／
                    ["rail_st"                ,  -20,  10, -30, 0],
                    ["rail_st"                ,  -40,  10, -30, 0],
                    ["rail_st"                ,  -60,  10, -30, 0],
                    ["rail_st"                ,  -80,  10, -30, 0],
                    ["rail_st"                ,  -80,  10, -10, 0],
                    ["rail_st"                ,  -80,  10,  10, 0],
                    ["rail_st"                ,  -80,  10,  30, 0],
                    ["rail_st"                ,  -80,  10,  50, 0],
                    ["rail_st"                ,   70,  10, -30, 0],
                    ["rail_st"                ,   70,  10, -10, 0],
                    ["rail_st"                ,   70,  10,  10, 0],
                    ["rail_st"                ,   70,  10,  30, 0],
                    ["rail_st"                ,   70,  10,  50, 0],
                    ["rail_st"                ,   50,  10,  50, 0],
                    ["rail_st"                ,   30,  10,  50, 0],
                    ["rail_st"                ,   10,  10,  50, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(   30, 60, 0, 20, 0.002, 2);
    var srclist = [src1];
    var acc  = new ST.Accelerator_01(   -25, 18,  -5,    1, 0, 0,  30);
    var acc  = new ST.Accelerator_01(    25, 18,   25,   -1, 0, 0,  30);
  }


  // ----------------------------------------

  // 撮影用
  if (0) {
    // レール(曲L)
    var dataInfo = [// ["rail_arc_l"   ,   0,  0,  0, 0],
                    // ["join_R45"        ,   0,  30,  0, 0],
                    // ["fork_v"        ,   0,  10,  0, 0],
                    // ["fork_v2"        ,   0,  10,  0, 0],
                    // ["windmill_h3"       ,  0,  30, 0, 0],
                   ];
    ST.init(world, scene, dataInfo);
    var src = new ST.Source_00( 100, 40, 100, 1, 0.04, 0);
    var srclist = [src];

    // var acc  = new ST.Accelerator_01(  0, 20,  0,    1, 0, 0,  30);
    var ele  = new ST.Elevator_01(   0,  0,  0,  30, 0);
  }


  // !!!


  var cameraPosi = 0;
  var nCameraPosi = 5;
  var isrc = 0;
  var jball = 0;
  var iloop = 0;
//  var cameraPosi3H = null;

  for (var ii = 0; ii < srclist.length; ++ii) {
    srclist[ii].popforce();
  }
  var trgBall = srclist[isrc].moBallBodyVec_[jball];

  // Keybindings
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'c':
        cameraPosi = (cameraPosi + 1) % nCameraPosi;
        console.log("camera=",cameraPosi);

        if (cameraPosi == 2) {
            // 自動（ボールの周りを公転軌道する）
            orbitControls.autoRotate = true;
        } else if (cameraPosi == 3) {
          // 自動（ボールの周りを公転軌道する＋上下にアップダウン）
          orbitControls.autoRotate = true;
          iloop = 0;
        } else if (cameraPosi == 4) {
          // _cameraPosi == 4
          // マニュアル操作（マウスによる手動操作＋dumping）
          orbitControls.autoRotate = false;
          orbitControls.enableDamping = true;
          orbitControls.dampingFactor = 0.005;  // def 0.05
          orbitControls.panSpeed = 3;  // def 1
        } else {
          // _cameraPosi == 0
          // マニュアル操作（マウスによる手動操作）
          orbitControls.autoRotate = false;
          orbitControls.dampingFactor = 0.05;  // def 0.05
          orbitControls.panSpeed = 1;  // def 1
        }
        break;

      case 'r':
        // カメラリセット
        orbitControls.reset();
        break;

      case 'd':
        // ボールリセット
        if (trgBall.src_ != null) {
          var src = trgBall.src_;
          src.repop(trgBall);
        }
        break;

      case 'n':
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
    }
  })

  {
    var px = 0, py = 0, pz = 0;
    camera.position.set(px, py+5, pz+80);
    camera.lookAt(new THREE.Vector3(px, py, pz));
  }

  var plist = [];
  var slist = [];
  function animate() {
    iloop = (iloop+1) % 6282;

    if (actuatorlist.length > 0) {
      for (var ii = 0; ii < actuatorlist.length; ++ii) {
          actuatorlist[ii].act();
      }
    }

    world.step(timeStep)

    for (var ii = 0; ii < srclist.length; ++ii) {
      var src = srclist[ii];
      for (var i = 0; i < src.moBallBodyVec_.length; ++i) {
        // 場外判定
        if (src.moBallBodyVec_[i].position.y < -100) {
          src.repop(src.moBallBodyVec_[i]);
        }
      }
      src.pop();
    }

    // ----------------------------------------
    // カメラ操作
    // if (cameraPosi == 1) {
    //   // フロントビュー
    //   //   - 中心(posi)から速度方向(velo)に向かせる
    //   //   - 方向性は悪くないが、カーブでガタつく
    //   //   - 位置もだが特に視線(lookAt)がブレるのが問題
    //   var p = trgBall.position;
    //   var v = trgBall.velocity;
    //   camera.position.set(p.x, p.y, p.z);
    //   camera.rotation.z = 0;
    //   camera.lookAt(new THREE.Vector3(p.x + v.x, p.y + v.y, p.z + v.z));

    // } else if (cameraPosi == 2) {
    if (cameraPosi == 1) {
      // フロントビュー
      //   - 中心(posi)から速度方向(velo)に向かせる
      //   - 移動平均をとって滑らかになるよう試みたもの
      //   - 視線(lootAt)の座標をスムーズにできれば安定するけど..
      var p = trgBall.position;
      var v = trgBall.velocity;
      {
        // 移動平均を取る
        var ap = p.toArray();
        plist.push(ap);
        var s = p.vadd(v.scale(100));  // 視線とするため速度ベクトルの100倍先を
        var as = s.toArray();
        slist.push(as);
        if (plist.length > 10) {
          plist.shift();
          slist.shift();
        }
        var pp =new CANNON.Vec3(0, 0, 0);
        var ss =new CANNON.Vec3(0, 0, 0);
        for (var ii = 0; ii < plist.length; ++ii) {
          pp.x += plist[ii][0];
          pp.y += plist[ii][1];
          pp.z += plist[ii][2];
          ss.x += slist[ii][0];
          ss.y += slist[ii][1];
          ss.z += slist[ii][2];
        }
        pp = pp.scale(1.0 / plist.length);
        camera.position.set(pp.x, pp.y, pp.z);
        camera.rotation.z *= 0.999;
        ss = ss.scale(1.0 / slist.length);
        // // 視線の高さ（Y軸方向）を位置と合わせるとより安定するけど
        // // 上下に視線が動かなくなるので上下にアップダウンするコースを走るとわけわからんちんに
        // camera.lookAt(new THREE.Vector3(ss.x, pp.y, ss.z));
        // 上下方向の視線の動きもサポートするためこちらに（カーブでガタつくけど我慢..）
        camera.lookAt(new THREE.Vector3(ss.x, ss.y, ss.z));
      }

    } else if (cameraPosi == 2) {
      // 自動（ボールの周りを公転軌道する）
      // orbitControls.autoRotate = true;
      var p = trgBall.position;
      orbitControls.target = new THREE.Vector3(p.x, p.y, p.z);
      orbitControls.update();

    } else if (cameraPosi == 3) {
      // 自動（ボールの周りを公転軌道する＋上下にアップダウン）
      // orbitControls.autoRotate = true;
      var p = trgBall.position;
      orbitControls.target = new THREE.Vector3(p.x, p.y, p.z);
      var pp = camera.position;
      pp.y = p.y + 15*Math.sin(iloop/1000*Math.PI);
      camera.position.set(pp.x, pp.y, pp.z);
      orbitControls.update();

    } else if (cameraPosi == 4) {
      // _cameraPosi == 4
      // マニュアル操作（マウスによる手動操作＋dumping）
      // orbitControls.autoRotate = false;
      // orbitControls.enableDamping = true;
      // orbitControls.dampingFactor = 0.05;  // def 0.05
      orbitControls.update();

    } else {
      // _cameraPosi == 0
      // マニュアル操作（マウスによる手動操作）
      // orbitControls.autoRotate = false;
      orbitControls.update();
    }

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  animate();
};



/*
- cannon-es docs
https://pmndrs.github.io/cannon-es/docs/
https://pmndrs.github.io/cannon-es/

*/

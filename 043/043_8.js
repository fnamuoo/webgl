// mode:javascript

// GEAR 確認用
//

import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "orbitcontrols";
import * as GEAR from "Gear";

const timeStep = 1 / 30;


/*

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
  GEAR.init0(world, scene);

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

  // ----------------------------------------
  // !!

  let sq3 = Math.sqrt(3), sq3_ = sq3/2;

  if (0) {
    let x00 = -10, y00 = 0, z00 = 0;
    let x0 = -10, y0 = 0, z0 = 0;
    let x1 = 0, y1 = 0, z1 = 0;
    let x2 = 0, y2 = 0, z2 = -5;
    let x3 = -10, y3 = 0, z3 = 0;
    let x4 = 0, y4 = 0, z4 = 0;
    let x5 = 0, y5 = 2, z5 = 0;
    let x6 = 0, y6 = 0, z6 = 0;
    let x7 = 0, y7 = 10, z7 = 0;
    let x8 = 0, y8 = 0, z8 = 0;

    // 部品動作確認
    const dataInfo = [

        ["gear_type1_h_free"     , x00+-6.5, y00+  0, z00+-40, 0],
        ["gear_type1_h_act"      , x00+   0, y00+  0, z00+-40, 0, "red"],

        ["gear_type3_h_free"     , x00+-10, y00+  0, z00+-25, 0],
        ["gear_type3_h_act"      , x00+  0, y00+  0, z00+-25, 0, "red"],
        ["gear_type3_v_free"     , x00+-15, y00+  5, z00+-25, 1, "blue"],
        ["gear_type3_h_20_free"  , x00+-25, y00+ 10, z00+-25, 0],
        ["gear_type3_v_free"     , x00+-35, y00+ 15, z00+-25, 1, "blue"],
        ["gear_type3_h_40_free"  , x00+-15, y00+ 20, z00+-25, 0],

        ["gear_type5_h_r_free"   , x00+-40, y00+ -5, z00+ -5, 0],
        ["gear_type5_h_free"     , x00+-20, y00+  0, z00+ -5, 0],
        ["gear_type5_h_act"      , x00+  0, y00+  0, z00+ -5, 0, "red"],

        ["gear_type6_h_act"      , x00+  0, y00+  0, z00+ 25, 0, "#ffa0a0"],
        ["gear_type6_h_free"     , x00+-10, y00+  0, z00+ 25, 0],
        ["gear_type6_h_20_free"  , x00+-25, y00+  0, z00+ 25, 0],
        ["gear_type6_h_40_free"  , x00+-55, y00+  0, z00+ 25, 0],
        ["gear_type6_h_60_free"  , x00+  5, y00+  0, z00+ 60, 0],

        // ["windmill_h"            , x0+  0, y0+ 0, z0+-35, 1],
        // ["windmill_h2"           , x0+  0, y0+ 0, z0+-20, 1, "red"],
        // ["windmill_v"            , x0+  0, y0+ 0, z0+ -5, 0],

        // // 歯車（四角の重ね合わせ）の動作確認
        // ["gear_type1_h_free"     , x1+  0, y1+  0, z1+  0, 0],
        // ["gear_type1_h_act"      , x1+6.5, y1+  0, z1+  0, 0, "red"],
        // ["gear_type1_v_free"     , x1+6.5, y1+3.5, z1+ -3.5, 0, "blue"],
        // ["gear_type1_h_free"     , x1+ -8, y1+3.5, z1+ -3.5, 0],
        // ["gear_type1_v_act"      , x1+ -8, y1+  0, z1+  0, 0, "red"],

        // // // 歯車（試作：未調整）の動作確認
        // // ["gear_type2_h_act"      , x2+  0,y2+  0, z2+  0, 0, "red"],
        // // ["gear_type2_h_free"     , x2+-15,y2+  0, z2+ 10*sq3_, 0],
        // // ["gear_type2_h_free"     , x2+-15,y2+  0, z2- 10*sq3_, 0],
        // // ["gear_type2_h_free"     , x2+-25,y2+  0, z2+ 10*sq3_, 0],
        // // ["gear_type2_h_free"     , x2+-25,y2+  0, z2- 10*sq3_, 0],
        // // ["gear_type2_h_free"     , x2+-30,y2+  0, z2-  0, 0],
        // // ["gear_type2_h_free"     , x2+-10,y2+  0, z2+  0, 0],
        // // ["gear_type2_h_free"     , x2+  0,y2+  0, z2+ 10, 0],
        // // ["gear_type2_h_free"     , x2+  0,y2+  0, z2+-10, 0],

        // // 反応しない歯車の確認（無反応を黄色に
        // ["gear_type3_h_act"      , x3+  0, y3+ 0, z3+-0, 0, "red"],
        // ["gear_type3_h_free"     , x3+ 10, y3+ 0, z3+-0, 0],
        // ["gear_type3_h_free"     , x3+ 20, y3+ 0, z3+-0, 0, "yellow"],
        // ["gear_type3_h_free"     , x3- 10, y3+ 0, z3+-0, 0],
        // ["gear_type3_h_free"     , x3- 20, y3+ 0, z3+-0, 0],
        // ["gear_type3_h_free"     , x3+  0, y3+ 0, z3-10, 0],
        // ["gear_type3_h_free"     , x3+  0, y3+ 0, z3+10, 0],
        // ["gear_type3_h_free"     , x3- 10, y3+ 0, z3+10, 0],
        // ["gear_type3_h_free"     , x3- 10, y3+ 0, z3+20, 0],

        // // 歯車（垂直）との組み合わせ確認
        // ["gear_type3_h_free"     , x3+ 10, y3+ 0, z3+-0, 0],
        // ["gear_type3_h_act"      , x3+  0, y3+ 0, z3+-0, 0, "red"],
        // ["gear_type3_h_free"     , x3- 10, y3+ 0, z3+-0, 0],
        // ["gear_type3_v_free"     , x3- 10, y3+ 5, z3+-5, 0, "blue"],
        // ["gear_type3_h_free"     , x3- 10, y3+10, z3-10, 0],
        // ["gear_type3_h_free"     , x3- 20, y3+10, z3-10, 0],
        // ["gear_type3_v_free"     , x3- 10, y3+ 5, z3-15, 0, "blue"],
        // ["gear_type3_h_free"     , x3- 10, y3+ 0, z3-20, 0],

        // // 大きさの違う歯車
        // ["gear_type3_h_act"      , x6+  0, y6+ 0, z6+-0, 0, "red"],
        // ["gear_type3_h_20_free"  , x6+  0, y6+ 0, z6+15, 0],
        // ["gear_type3_h_40_free"  , x6+  0, y6+ 0, z6+45, 0],
        // ["gear_type3_h_20_free"  , x6+-20, y6+ 0, z6+15, 0],
        // ["gear_type3_h_40_free"  , x6+-50, y6+ 0, z6+15, 0],
        // ["gear_type3_h_40_free"  , x6+  0, y6+ 0, z6+85, 0],

        // // ギア比の違う歯車
        // ["gear_type5_h_r_act"      , x7+  0, y7+ 0, z7+-0, 0, "red"],
        // ["gear_type5_h_r_free"     , x7+-20, y7+ 0, z7+-0, 0],
        // ["gear_type5_h_r_free"     , x7+-40, y7+ 0, z7+-0, 0],
        // ["gear_type5_h_r_free"     , x7+  0, y7+-5, z7+15, 0],
        // ["gear_type5_h_r_free"     , x7+  0, y7+ 5, z7-15, 0],
        // ["gear_type5_h_r_free"     , x7+  0, y7-10, z7+30, 0],
        // ["gear_type5_h_r_free"     , x7+  0, y7+10, z7-30, 0],
        // ["gear_type5_h_act"        , x7+ 30, y7+ 0, z7+-0, 0, "red"],
        // ["gear_type5_h_free"       , x7+ 30, y7+-5, z7+15, 0],
        // ["gear_type5_h_free"       , x7+ 30, y7+ 5, z7-15, 0],
        // ["gear_type5_h_free"       , x7+ 30, y7-10, z7+30, 0],
        // ["gear_type5_h_free"       , x7+ 30, y7+10, z7-30, 0],

        // // 針つきの円盤
        // ["gear_type3_h_act"        , x8+-10, y8+ 0, z8+-0, 0, "red"],
        // ["gear_type6_h_free"       , x8+-20, y8+ 0, z8+-0, 0],
        // ["gear_type6_h_free"       , x8+-30, y8+ 0, z8+-0, 0],
        // ["gear_type6_h_20_free"    , x8+-10, y8+ 0, z8+15, 0],
        // ["gear_type6_h_20_free"    , x8+-10, y8+10, z8+15, 0],
        // ["gear_type3_v_free"       , x8- 10, y8+ 5, z8+25, 0, "blue"],

    ]
    GEAR.init(world, scene, dataInfo);
  }

  if (0) {
    // 同じ直径の盤を、ギア比×４段で変化させて動かす例
    let x9 = 0, y9 = 0, z9 = 0;
    const dataInfo = [
        ["gear_type3_h_act"        , x9+  0, y9+ 0, z9+-0, 0, "red"],
        ["gear_type3_h_free"       , x9+ -5, y9+ 0, z9+-5*sq3, 0],
        ["gear_type3_h_free"       , x9+-15, y9+ 0, z9+-5*sq3, 0],
        ["gear_type3_h_free"       , x9+-20, y9+ 0, z9+ 0, 0, "#808080"],
        ["gear_type5_h_r_free"     , x9+  0, y9+ 0, z9+10, 0],
        ["gear_type6_h_free"       , x9+-20, y9+ 0, z9+10, 0],
        ["gear_type6_h_20_free"    , x9+-20, y9+ 5, z9+10, 0],
        ["gear_type5_h_r_free"     , x9+  0, y9+ 5, z9+25, 0],
        ["gear_type3_h_free"       , x9+-15, y9+10, z9+25, 0],
        ["gear_type6_h_20_free"    , x9+-20, y9+10, z9+10, 0],
        ["gear_type5_h_r_free"     , x9+  0, y9+10, z9+10, 0],
        ["gear_type6_h_20_free"    , x9+-20, y9+15, z9+10, 0],
        ["gear_type5_h_r_free"     , x9+  0, y9+15, z9+25, 0],
        ["gear_type3_h_free"       , x9+-15, y9+20, z9+25, 0],
        ["gear_type6_h_20_free"    , x9+-20, y9+20, z9+10, 0],
    ]
    GEAR.init(world, scene, dataInfo);
  }


  if (0) {
    // 異なる直径の盤を動かす例
    let x10 = 0, y10 = 0, z10 = 0;
    const dataInfo = [
        ["gear_type3_h_act"        , x10+  0, y10+ 0, z10+ 0, 0, "red"],
        ["gear_type3_h_free"       , x10+-10, y10+ 0, z10+ 0, 0],
        ["gear_type3_h_free"       , x10+-20, y10+ 0, z10+ 0, 0],
        ["gear_type6_h_40_free"    , x10+-45, y10+ 0, z10+ 0, 0],
        ["gear_type3_v_free"       , x10- 10, y10+ 5, z10+ 5, 0, "blue"],
        ["gear_type6_h_20_free"    , x10+-10, y10+10, z10+15, 0],
        ["gear_type6_h_20_free"    , x10+-30, y10+10, z10+15, 0],
        ["gear_type6_h_20_free"    , x10+-45, y10+10, z10+ 0, 0],
        ["gear_type3_v_free"       , x10- 10, y10+ 5, z10+-5, 0, "blue"],
        ["gear_type6_h_20_free"    , x10+-10, y10+10, z10-15, 0],
        ["gear_type3_v_free"       , x10- 10, y10+15, z10-25, 0, "blue"],
        ["gear_type6_h_20_free"    , x10+- 7, y10+20, z10-15, 0],
        // ["gear_type3_v_free"       , x10- 20, y10+25, z10-15, 1, "blue"],
        // ["gear_type3_h_20_free"    , x10+-30, y10+30, z10-15, 0],
        // ["gear_type6_h_40_free"    , x10+-50, y10+35, z10-15, 0],
        ["gear_type6_h_60_free"    , x10+-45, y10+20, z10- 0, 0],
    ]
    GEAR.init(world, scene, dataInfo);
  }

  if (0) {
    // 同じ直径の盤を動かす例：間に大小歯車をいれても変わらない
    let x11 = -20, y11 = 0, z11 = 0;
    const dataInfo = [
        ["gear_type3_h_20_act"     , x11+  0, y11+ 0, z11+ 0, 0, "red"],
        ["gear_type6_h_20_free"    , x11+-20, y11+ 0, z11+ 0, 0],
        ["gear_type3_v_free"       , x11+  0, y11+ 5, z11-10, 0, "blue"],
        ["gear_type3_h_free"       , x11+- 0, y11+10, z11+-5, 0],
        ["gear_type3_h_free"       , x11+- 5, y11+10, z11+ 4, 0],
        ["gear_type6_h_20_free"    , x11+-20, y11+10, z11+ 0, 0],
        ["gear_type3_v_free"       , x11+ 10, y11+ 5, z11+ 0, 1, "blue"],
        ["gear_type3_h_free"       , x11+ 15, y11+10, z11+ 0, 0],
        ["gear_type3_v_free"       , x11+ 20, y11+15, z11+ 0, 1, "blue"],
        ["gear_type3_h_20_free"    , x11+ 10, y11+20, z11+ 0, 0],
        ["gear_type3_h_40_free"    , x11+ -5, y11+20, z11+27, 0],
        ["gear_type6_h_20_free"    , x11+-20, y11+20, z11+ 0, 0],
    ]
    GEAR.init(world, scene, dataInfo);
  }


  if (0) {
    // 回転の伝わり方を見る例(1)
    let x12 = -40, y12 = 0, z12 = 0;
    const dataInfo = [
        ["gear_type3_h_act"     , x12+  0, y12+ 0, z12+ 0, 0, "red"],
        ["gear_type6_h_free"    , x12+-10, y12+ 0, z12+ 0, 0],
        ["gear_type6_h_free"    , x12+-20, y12+ 0, z12+ 0, 0],
        ["gear_type6_h_free"    , x12+-20, y12+ 0, z12-10, 0],
        ["gear_type6_h_free"    , x12+-20, y12+ 0, z12-20, 0],
        ["gear_type6_h_free"    , x12+-20, y12+ 0, z12-30, 0],
        ["gear_type6_h_free"    , x12+-10, y12+ 0, z12-30, 0],
        ["gear_type6_h_free"    , x12+- 0, y12+ 0, z12-30, 0],
        ["gear_type6_h_free"    , x12+ 10, y12+ 0, z12-30, 0],
        ["gear_type6_h_free"    , x12+ 20, y12+ 0, z12-30, 0],
        ["gear_type6_h_free"    , x12+ 20, y12+ 0, z12-20, 0],
        ["gear_type6_h_free"    , x12+ 20, y12+ 0, z12-10, 0],
        ["gear_type6_h_free"    , x12+ 20, y12+ 0, z12- 0, 0],
        ["gear_type6_h_free"    , x12+ 20, y12+ 0, z12+10, 0],
        ["gear_type6_h_free"    , x12+ 20, y12+ 0, z12+20, 0],
        ["gear_type6_h_free"    , x12+ 10, y12+ 0, z12+20, 0],
        ["gear_type6_h_free"    , x12+  0, y12+ 0, z12+20, 0],
        ["gear_type6_h_free"    , x12+-10, y12+ 0, z12+20, 0],
        ["gear_type6_h_free"    , x12+-20, y12+ 0, z12+20, 0],
        ["gear_type6_h_free"    , x12+-30, y12+ 0, z12+20, 0],
        ["gear_type6_h_free"    , x12+-40, y12+ 0, z12+20, 0],
        ["gear_type6_h_free"    , x12+-40, y12+ 0, z12+10, 0],
        ["gear_type6_h_free"    , x12+-40, y12+ 0, z12+ 0, 0],
        ["gear_type6_h_free"    , x12+-40, y12+ 0, z12-10, 0],
        ["gear_type6_h_free"    , x12+-40, y12+ 0, z12-20, 0],
        ["gear_type6_h_free"    , x12+-40, y12+ 0, z12-30, 0],
        ["gear_type6_h_free"    , x12+-40, y12+ 0, z12-40, 0],
        ["gear_type6_h_free"    , x12+-40, y12+ 0, z12-50, 0],
        ["gear_type6_h_free"    , x12+-30, y12+ 0, z12-50, 0],
        ["gear_type6_h_free"    , x12+-20, y12+ 0, z12-50, 0],
        ["gear_type6_h_free"    , x12+-10, y12+ 0, z12-50, 0],
        ["gear_type6_h_free"    , x12+- 0, y12+ 0, z12-50, 0],
        ["gear_type6_h_free"    , x12+ 10, y12+ 0, z12-50, 0],
        ["gear_type6_h_free"    , x12+ 20, y12+ 0, z12-50, 0],
        ["gear_type6_h_free"    , x12+ 30, y12+ 0, z12-50, 0],
        ["gear_type6_h_free"    , x12+ 40, y12+ 0, z12-50, 0],
        ["gear_type6_h_free"    , x12+ 40, y12+ 0, z12-40, 0],
        ["gear_type6_h_free"    , x12+ 40, y12+ 0, z12-30, 0],
        ["gear_type6_h_free"    , x12+ 40, y12+ 0, z12-20, 0],
        ["gear_type6_h_free"    , x12+ 40, y12+ 0, z12-10, 0],
        ["gear_type6_h_free"    , x12+ 40, y12+ 0, z12- 0, 0],
        ["gear_type6_h_free"    , x12+ 40, y12+ 0, z12+10, 0],
        ["gear_type6_h_free"    , x12+ 40, y12+ 0, z12+20, 0],
        ["gear_type6_h_free"    , x12+ 40, y12+ 0, z12+30, 0],
        ["gear_type6_h_free"    , x12+ 40, y12+ 0, z12+40, 0],
        ["gear_type6_h_free"    , x12+ 30, y12+ 0, z12+40, 0],
        ["gear_type6_h_free"    , x12+ 20, y12+ 0, z12+40, 0],
        ["gear_type6_h_free"    , x12+ 10, y12+ 0, z12+40, 0],
        ["gear_type6_h_free"    , x12+  0, y12+ 0, z12+40, 0],
        ["gear_type6_h_free"    , x12+-10, y12+ 0, z12+40, 0],
        ["gear_type6_h_free"    , x12+-20, y12+ 0, z12+40, 0],
        ["gear_type6_h_free"    , x12+-30, y12+ 0, z12+40, 0],
        ["gear_type6_h_free"    , x12+-40, y12+ 0, z12+40, 0],
    ]
    GEAR.init(world, scene, dataInfo);
  }


  if (0) {
    // 重さの違う円盤（重いほど、回転しにくく、止まりにくい。動力が１つより２つが力が伝わる）
    let x15 = 0, y15 = 0, z15 = 0;
    const dataInfo = [
        ["gear_type3_h_act"        , x15+-10, y15+ 0, z15+-0, 0, "red"],
        ["gear_type7_h_free"       , x15+-10, y15+ 0, z15-10, 0.01],
        ["gear_type3_h_act"        , x15+-25, y15+ 0, z15+-0, 0, "red"],
        ["gear_type7_h_free"       , x15+-25, y15+ 0, z15-10, 0.1],
        ["gear_type3_h_act"        , x15+-40, y15+ 0, z15+-0, 0, "red"],
        ["gear_type7_h_free"       , x15+-40, y15+ 0, z15-10, 1],
        ["gear_type3_h_act"        , x15+-55, y15+ 0, z15+-0, 0, "red"],
        ["gear_type7_h_free"       , x15+-55, y15+ 0, z15-10, 10, "#404040"],
        ["gear_type3_h_act"        , x15+-70, y15+ 0, z15+-0, 0, "red"],
        ["gear_type7_h_free"       , x15+-70, y15+ 0, z15-10, 100, "#202020"],
        ["gear_type3_h_act"        , x15+-85, y15+ 0, z15+-0, 0, "red"],
        ["gear_type7_h_free"       , x15+-85, y15+ 0, z15-10, 1000, "#000000"],
        // ２連
        ["gear_type3_h_act"        , x15+-10, y15+ 0, z15+20, 0, "red"],
        ["gear_type7_h_free"       , x15+-10, y15+ 0, z15+30, 0.01],
        ["gear_type3_h_act"        , x15+-10, y15+ 0, z15+40, 0, "red"],
        ["gear_type3_h_act"        , x15+-25, y15+ 0, z15+20, 0, "red"],
        ["gear_type7_h_free"       , x15+-25, y15+ 0, z15+30, 0.1],
        ["gear_type3_h_act"        , x15+-25, y15+ 0, z15+40, 0, "red"],
        ["gear_type3_h_act"        , x15+-40, y15+ 0, z15+20, 0, "red"],
        ["gear_type7_h_free"       , x15+-40, y15+ 0, z15+30, 1],
        ["gear_type3_h_act"        , x15+-40, y15+ 0, z15+40, 0, "red"],
        ["gear_type3_h_act"        , x15+-55, y15+ 0, z15+20, 0, "red"],
        ["gear_type7_h_free"       , x15+-55, y15+ 0, z15+30, 10, "#404040"],
        ["gear_type3_h_act"        , x15+-55, y15+ 0, z15+40, 0, "red"],
        ["gear_type3_h_act"        , x15+-70, y15+ 0, z15+20, 0, "red"],
        ["gear_type7_h_free"       , x15+-70, y15+ 0, z15+30, 100, "#202020"],
        ["gear_type3_h_act"        , x15+-70, y15+ 0, z15+40, 0, "red"],
        ["gear_type3_h_act"        , x15+-85, y15+ 0, z15+20, 0, "red"],
        ["gear_type7_h_free"       , x15+-85, y15+ 0, z15+30, 1000, "#000000"],
        ["gear_type3_h_act"        , x15+-85, y15+ 0, z15+40, 0, "red"],
        // ４連
        ["gear_type3_h_act"        , x15+-50, y15+ 0, z15+60, 0, "red"],
        ["gear_type7_h_free"       , x15+-50, y15+ 0, z15+70, 100, "#202020"],
        ["gear_type3_h_act"        , x15+-50, y15+ 0, z15+80, 0, "red"],
        ["gear_type3_h_act"        , x15+-40, y15+ 0, z15+70, 0, "red"],
        ["gear_type3_h_act"        , x15+-60, y15+ 0, z15+70, 0, "red"],
        ["gear_type3_h_act"        , x15+-90, y15+ 0, z15+60, 0, "red"],
        ["gear_type7_h_free"       , x15+-90, y15+ 0, z15+70, 1000, "#000000"],
        ["gear_type3_h_act"        , x15+-90, y15+ 0, z15+80, 0, "red"],
        ["gear_type3_h_act"        , x15+-80, y15+ 0, z15+70, 0, "red"],
        ["gear_type3_h_act"        , x15-100, y15+ 0, z15+70, 0, "red"],

    ]
    GEAR.init(world, scene, dataInfo);
  }


  if (0) {
    // 回転の伝わり方を見る例(2)
    // 正方格子
    let x13 = -40, y13 =10, z13 = 0;
    const dataInfo = [
        ["gear_type3_h_act"     , x13+  0, y13+ 0, z13+ 0, 0, "red"],
        ["gear_type6_h_free"    , x13+-10, y13+ 0, z13+ 0, 0],
        ["gear_type6_h_free"    , x13+-20, y13+ 0, z13+ 0, 0],
        ["gear_type6_h_free"    , x13+-30, y13+ 0, z13+ 0, 0],
        ["gear_type6_h_free"    , x13+-40, y13+ 0, z13+ 0, 0],
        ["gear_type6_h_free"    , x13+ 10, y13+ 0, z13+ 0, 0],
        ["gear_type6_h_free"    , x13+ 20, y13+ 0, z13+ 0, 0],
        ["gear_type6_h_free"    , x13+ 30, y13+ 0, z13+ 0, 0],
        ["gear_type6_h_free"    , x13+ 40, y13+ 0, z13+ 0, 0],
        ["gear_type6_h_free"    , x13+  0, y13+ 0, z13+10, 0],
        ["gear_type6_h_free"    , x13+-10, y13+ 0, z13+10, 0],
        ["gear_type6_h_free"    , x13+-20, y13+ 0, z13+10, 0],
        ["gear_type6_h_free"    , x13+-30, y13+ 0, z13+10, 0],
        ["gear_type6_h_free"    , x13+-40, y13+ 0, z13+10, 0],
        ["gear_type6_h_free"    , x13+ 10, y13+ 0, z13+10, 0],
        ["gear_type6_h_free"    , x13+ 20, y13+ 0, z13+10, 0],
        ["gear_type6_h_free"    , x13+ 30, y13+ 0, z13+10, 0],
        ["gear_type6_h_free"    , x13+ 40, y13+ 0, z13+10, 0],
        ["gear_type6_h_free"    , x13+  0, y13+ 0, z13+20, 0],
        ["gear_type6_h_free"    , x13+-10, y13+ 0, z13+20, 0],
        ["gear_type6_h_free"    , x13+-20, y13+ 0, z13+20, 0],
        ["gear_type6_h_free"    , x13+-30, y13+ 0, z13+20, 0],
        ["gear_type6_h_free"    , x13+-40, y13+ 0, z13+20, 0],
        ["gear_type6_h_free"    , x13+ 10, y13+ 0, z13+20, 0],
        ["gear_type6_h_free"    , x13+ 20, y13+ 0, z13+20, 0],
        ["gear_type6_h_free"    , x13+ 30, y13+ 0, z13+20, 0],
        ["gear_type6_h_free"    , x13+ 40, y13+ 0, z13+20, 0],
        ["gear_type6_h_free"    , x13+  0, y13+ 0, z13+30, 0],
        ["gear_type6_h_free"    , x13+-10, y13+ 0, z13+30, 0],
        ["gear_type6_h_free"    , x13+-20, y13+ 0, z13+30, 0],
        ["gear_type6_h_free"    , x13+-30, y13+ 0, z13+30, 0],
        ["gear_type6_h_free"    , x13+-40, y13+ 0, z13+30, 0],
        ["gear_type6_h_free"    , x13+ 10, y13+ 0, z13+30, 0],
        ["gear_type6_h_free"    , x13+ 20, y13+ 0, z13+30, 0],
        ["gear_type6_h_free"    , x13+ 30, y13+ 0, z13+30, 0],
        ["gear_type6_h_free"    , x13+ 40, y13+ 0, z13+30, 0],
        ["gear_type6_h_free"    , x13+  0, y13+ 0, z13+40, 0],
        ["gear_type6_h_free"    , x13+-10, y13+ 0, z13+40, 0],
        ["gear_type6_h_free"    , x13+-20, y13+ 0, z13+40, 0],
        ["gear_type6_h_free"    , x13+-30, y13+ 0, z13+40, 0],
        ["gear_type6_h_free"    , x13+-40, y13+ 0, z13+40, 0],
        ["gear_type6_h_free"    , x13+ 10, y13+ 0, z13+40, 0],
        ["gear_type6_h_free"    , x13+ 20, y13+ 0, z13+40, 0],
        ["gear_type6_h_free"    , x13+ 30, y13+ 0, z13+40, 0],
        ["gear_type6_h_free"    , x13+ 40, y13+ 0, z13+40, 0],
        ["gear_type6_h_free"    , x13+  0, y13+ 0, z13-10, 0],
        ["gear_type6_h_free"    , x13+-10, y13+ 0, z13-10, 0],
        ["gear_type6_h_free"    , x13+-20, y13+ 0, z13-10, 0],
        ["gear_type6_h_free"    , x13+-30, y13+ 0, z13-10, 0],
        ["gear_type6_h_free"    , x13+-40, y13+ 0, z13-10, 0],
        ["gear_type6_h_free"    , x13+ 10, y13+ 0, z13-10, 0],
        ["gear_type6_h_free"    , x13+ 20, y13+ 0, z13-10, 0],
        ["gear_type6_h_free"    , x13+ 30, y13+ 0, z13-10, 0],
        ["gear_type6_h_free"    , x13+ 40, y13+ 0, z13-10, 0],
        ["gear_type6_h_free"    , x13+  0, y13+ 0, z13-20, 0],
        ["gear_type6_h_free"    , x13+-10, y13+ 0, z13-20, 0],
        ["gear_type6_h_free"    , x13+-20, y13+ 0, z13-20, 0],
        ["gear_type6_h_free"    , x13+-30, y13+ 0, z13-20, 0],
        ["gear_type6_h_free"    , x13+-40, y13+ 0, z13-20, 0],
        ["gear_type6_h_free"    , x13+ 10, y13+ 0, z13-20, 0],
        ["gear_type6_h_free"    , x13+ 20, y13+ 0, z13-20, 0],
        ["gear_type6_h_free"    , x13+ 30, y13+ 0, z13-20, 0],
        ["gear_type6_h_free"    , x13+ 40, y13+ 0, z13-20, 0],
        ["gear_type6_h_free"    , x13+  0, y13+ 0, z13-30, 0],
        ["gear_type6_h_free"    , x13+-10, y13+ 0, z13-30, 0],
        ["gear_type6_h_free"    , x13+-20, y13+ 0, z13-30, 0],
        ["gear_type6_h_free"    , x13+-30, y13+ 0, z13-30, 0],
        ["gear_type6_h_free"    , x13+-40, y13+ 0, z13-30, 0],
        ["gear_type6_h_free"    , x13+ 10, y13+ 0, z13-30, 0],
        ["gear_type6_h_free"    , x13+ 20, y13+ 0, z13-30, 0],
        ["gear_type6_h_free"    , x13+ 30, y13+ 0, z13-30, 0],
        ["gear_type6_h_free"    , x13+ 40, y13+ 0, z13-30, 0],
        ["gear_type6_h_free"    , x13+  0, y13+ 0, z13-40, 0],
        ["gear_type6_h_free"    , x13+-10, y13+ 0, z13-40, 0],
        ["gear_type6_h_free"    , x13+-20, y13+ 0, z13-40, 0],
        ["gear_type6_h_free"    , x13+-30, y13+ 0, z13-40, 0],
        ["gear_type6_h_free"    , x13+-40, y13+ 0, z13-40, 0],
        ["gear_type6_h_free"    , x13+ 10, y13+ 0, z13-40, 0],
        ["gear_type6_h_free"    , x13+ 20, y13+ 0, z13-40, 0],
        ["gear_type6_h_free"    , x13+ 30, y13+ 0, z13-40, 0],
        ["gear_type6_h_free"    , x13+ 40, y13+ 0, z13-40, 0],
    ]
    GEAR.init(world, scene, dataInfo);
  }

  if (0) {
    // 六方格子の配置テスト
    // 正方格子で良かった歯車を六方格子に配置したらぎこちない
    let x16 = -40, y16 = 0, z16 = 0;
    let v = 5*sq3;
    const dataInfo = [
        ["gear_type3_h_act"     , x16+    0, y16+ 0, z16+ 0, 0, "red"],

        ["gear_type3_h_free"    , x16+-  5, y16+ 0, z16+-v, 0],
        ["gear_type3_h_free"    , x16+- 15, y16+ 0, z16+-v, 0],
        ["gear_type3_h_free"    , x16+- 20, y16+ 0, z16+ 0, 0],
        ["gear_type3_h_free"    , x16+-  5, y16+ 0, z16+ v, 0],
        ["gear_type3_h_free"    , x16+- 15, y16+ 0, z16+ v, 0],

        ["gear_type3_h_free"    , x16+  10, y16+ 0, z16+ 0, 0],
        ["gear_type3_h_free"    , x16+  15, y16+ 0, z16+-v, 0],
        ["gear_type3_h_free"    , x16+  25, y16+ 0, z16+-v, 0],
        ["gear_type3_h_free"    , x16+  30, y16+ 0, z16+ 0, 0],
        ["gear_type3_h_free"    , x16+  15, y16+ 0, z16+ v, 0],
        ["gear_type3_h_free"    , x16+  25, y16+ 0, z16+ v, 0],


    ]
    GEAR.init(world, scene, dataInfo);
  }


  if (1) {
    // 六方格子の配置テスト
    // 六方格子用に調整しなおしたギア
    let x16 = -40, y16 = 0, z16 = 0;
    let v = 5*sq3;
    const dataInfo = [
        ["gear_type8_h_free"    , x16+- 30, y16+ 0, z16+ 0, 0],
        ["gear_type8_h_free"    , x16+- 20, y16+ 0, z16+ 0, 0],
        ["gear_type8_h_act"     , x16+   0, y16+ 0, z16+ 0, 0, "red"],
        ["gear_type8_h_free"    , x16+  10, y16+ 0, z16+ 0, 0],
        ["gear_type8_h_free"    , x16+  30, y16+ 0, z16+ 0, 0],
        ["gear_type8_h_free"    , x16+  40, y16+ 0, z16+ 0, 0],
        ["gear_type8_h_free"    , x16+-  5, y16+ 0, z16+-v, 0],
        ["gear_type8_h_free"    , x16+- 15, y16+ 0, z16+-v, 0],
        ["gear_type8_h_free"    , x16+  15, y16+ 0, z16+-v, 0],
        ["gear_type8_h_free"    , x16+  25, y16+ 0, z16+-v, 0],
        ["gear_type8_h_free"    , x16+-  5, y16+ 0, z16+ v, 0],
        ["gear_type8_h_free"    , x16+- 15, y16+ 0, z16+ v, 0],
        ["gear_type8_h_free"    , x16+  15, y16+ 0, z16+ v, 0],
        ["gear_type8_h_free"    , x16+  25, y16+ 0, z16+ v, 0],
        ["gear_type8_h_free"    , x16+ -30, y16+ 0, z16+v*2, 0],
        ["gear_type8_h_free"    , x16+ -20, y16+ 0, z16+v*2, 0],
        ["gear_type8_h_free"    , x16+   0, y16+ 0, z16+v*2, 0],
        ["gear_type8_h_free"    , x16+  10, y16+ 0, z16+v*2, 0],
        ["gear_type8_h_free"    , x16+  30, y16+ 0, z16+v*2, 0],
        ["gear_type8_h_free"    , x16+  40, y16+ 0, z16+v*2, 0],
        ["gear_type8_h_free"    , x16+ -30, y16+ 0, z16-v*2, 0],
        ["gear_type8_h_free"    , x16+ -20, y16+ 0, z16-v*2, 0],
        ["gear_type8_h_free"    , x16+   0, y16+ 0, z16-v*2, 0],
        ["gear_type8_h_free"    , x16+  10, y16+ 0, z16-v*2, 0],
        ["gear_type8_h_free"    , x16+  30, y16+ 0, z16-v*2, 0],
        ["gear_type8_h_free"    , x16+  40, y16+ 0, z16-v*2, 0],
        ["gear_type8_h_free"    , x16+-  5, y16+ 0, z16+-v*3, 0],
        ["gear_type8_h_free"    , x16+- 15, y16+ 0, z16+-v*3, 0],
        ["gear_type8_h_free"    , x16+  15, y16+ 0, z16+-v*3, 0],
        ["gear_type8_h_free"    , x16+  25, y16+ 0, z16+-v*3, 0],
        ["gear_type8_h_free"    , x16+-  5, y16+ 0, z16+ v*3, 0],
        ["gear_type8_h_free"    , x16+- 15, y16+ 0, z16+ v*3, 0],
        ["gear_type8_h_free"    , x16+  15, y16+ 0, z16+ v*3, 0],
        ["gear_type8_h_free"    , x16+  25, y16+ 0, z16+ v*3, 0],
        ["gear_type8_h_free"    , x16+ -30, y16+ 0, z16+v*4, 0],
        ["gear_type8_h_free"    , x16+ -20, y16+ 0, z16+v*4, 0],
        ["gear_type8_h_free"    , x16+   0, y16+ 0, z16+v*4, 0],
        ["gear_type8_h_free"    , x16+  10, y16+ 0, z16+v*4, 0],
        ["gear_type8_h_free"    , x16+  30, y16+ 0, z16+v*4, 0],
        ["gear_type8_h_free"    , x16+  40, y16+ 0, z16+v*4, 0],
        ["gear_type8_h_free"    , x16+ -30, y16+ 0, z16-v*4, 0],
        ["gear_type8_h_free"    , x16+ -20, y16+ 0, z16-v*4, 0],
        ["gear_type8_h_free"    , x16+   0, y16+ 0, z16-v*4, 0],
        ["gear_type8_h_free"    , x16+  10, y16+ 0, z16-v*4, 0],
        ["gear_type8_h_free"    , x16+  30, y16+ 0, z16-v*4, 0],
        ["gear_type8_h_free"    , x16+  40, y16+ 0, z16-v*4, 0],
    ]
    GEAR.init(world, scene, dataInfo);
  }

  if (0) {
    // 正方格子 の確認。。六方格子に最適な？歯車を正方にもってきたら逆にぎこちない動き
    let x13 = -40, y13 =10, z13 = 0;
    const dataInfo = [
        ["gear_type8_h_act"     , x13+  0, y13+ 0, z13+ 0, 0, "red"],
        ["gear_type8_h_free"    , x13+-10, y13+ 0, z13+ 0, 0],
        ["gear_type8_h_free"    , x13+-20, y13+ 0, z13+ 0, 0],
        ["gear_type8_h_free"    , x13+-30, y13+ 0, z13+ 0, 0],
        ["gear_type8_h_free"    , x13+-40, y13+ 0, z13+ 0, 0],
        ["gear_type8_h_free"    , x13+ 10, y13+ 0, z13+ 0, 0],
        ["gear_type8_h_free"    , x13+ 20, y13+ 0, z13+ 0, 0],
        ["gear_type8_h_free"    , x13+ 30, y13+ 0, z13+ 0, 0],
        ["gear_type8_h_free"    , x13+ 40, y13+ 0, z13+ 0, 0],
        ["gear_type8_h_free"    , x13+  0, y13+ 0, z13+10, 0],
        ["gear_type8_h_free"    , x13+-10, y13+ 0, z13+10, 0],
        ["gear_type8_h_free"    , x13+-20, y13+ 0, z13+10, 0],
        ["gear_type8_h_free"    , x13+-30, y13+ 0, z13+10, 0],
        ["gear_type8_h_free"    , x13+-40, y13+ 0, z13+10, 0],
        ["gear_type8_h_free"    , x13+ 10, y13+ 0, z13+10, 0],
        ["gear_type8_h_free"    , x13+ 20, y13+ 0, z13+10, 0],
        ["gear_type8_h_free"    , x13+ 30, y13+ 0, z13+10, 0],
        ["gear_type8_h_free"    , x13+ 40, y13+ 0, z13+10, 0],
        ["gear_type8_h_free"    , x13+  0, y13+ 0, z13+20, 0],
        ["gear_type8_h_free"    , x13+-10, y13+ 0, z13+20, 0],
        ["gear_type8_h_free"    , x13+-20, y13+ 0, z13+20, 0],
        ["gear_type8_h_free"    , x13+-30, y13+ 0, z13+20, 0],
        ["gear_type8_h_free"    , x13+-40, y13+ 0, z13+20, 0],
        ["gear_type8_h_free"    , x13+ 10, y13+ 0, z13+20, 0],
        ["gear_type8_h_free"    , x13+ 20, y13+ 0, z13+20, 0],
        ["gear_type8_h_free"    , x13+ 30, y13+ 0, z13+20, 0],
        ["gear_type8_h_free"    , x13+ 40, y13+ 0, z13+20, 0],
        ["gear_type8_h_free"    , x13+  0, y13+ 0, z13+30, 0],
        ["gear_type8_h_free"    , x13+-10, y13+ 0, z13+30, 0],
        ["gear_type8_h_free"    , x13+-20, y13+ 0, z13+30, 0],
        ["gear_type8_h_free"    , x13+-30, y13+ 0, z13+30, 0],
        ["gear_type8_h_free"    , x13+-40, y13+ 0, z13+30, 0],
        ["gear_type8_h_free"    , x13+ 10, y13+ 0, z13+30, 0],
        ["gear_type8_h_free"    , x13+ 20, y13+ 0, z13+30, 0],
        ["gear_type8_h_free"    , x13+ 30, y13+ 0, z13+30, 0],
        ["gear_type8_h_free"    , x13+ 40, y13+ 0, z13+30, 0],
        ["gear_type8_h_free"    , x13+  0, y13+ 0, z13+40, 0],
        ["gear_type8_h_free"    , x13+-10, y13+ 0, z13+40, 0],
        ["gear_type8_h_free"    , x13+-20, y13+ 0, z13+40, 0],
        ["gear_type8_h_free"    , x13+-30, y13+ 0, z13+40, 0],
        ["gear_type8_h_free"    , x13+-40, y13+ 0, z13+40, 0],
        ["gear_type8_h_free"    , x13+ 10, y13+ 0, z13+40, 0],
        ["gear_type8_h_free"    , x13+ 20, y13+ 0, z13+40, 0],
        ["gear_type8_h_free"    , x13+ 30, y13+ 0, z13+40, 0],
        ["gear_type8_h_free"    , x13+ 40, y13+ 0, z13+40, 0],
        ["gear_type8_h_free"    , x13+  0, y13+ 0, z13-10, 0],
        ["gear_type8_h_free"    , x13+-10, y13+ 0, z13-10, 0],
        ["gear_type8_h_free"    , x13+-20, y13+ 0, z13-10, 0],
        ["gear_type8_h_free"    , x13+-30, y13+ 0, z13-10, 0],
        ["gear_type8_h_free"    , x13+-40, y13+ 0, z13-10, 0],
        ["gear_type8_h_free"    , x13+ 10, y13+ 0, z13-10, 0],
        ["gear_type8_h_free"    , x13+ 20, y13+ 0, z13-10, 0],
        ["gear_type8_h_free"    , x13+ 30, y13+ 0, z13-10, 0],
        ["gear_type8_h_free"    , x13+ 40, y13+ 0, z13-10, 0],
        ["gear_type8_h_free"    , x13+  0, y13+ 0, z13-20, 0],
        ["gear_type8_h_free"    , x13+-10, y13+ 0, z13-20, 0],
        ["gear_type8_h_free"    , x13+-20, y13+ 0, z13-20, 0],
        ["gear_type8_h_free"    , x13+-30, y13+ 0, z13-20, 0],
        ["gear_type8_h_free"    , x13+-40, y13+ 0, z13-20, 0],
        ["gear_type8_h_free"    , x13+ 10, y13+ 0, z13-20, 0],
        ["gear_type8_h_free"    , x13+ 20, y13+ 0, z13-20, 0],
        ["gear_type8_h_free"    , x13+ 30, y13+ 0, z13-20, 0],
        ["gear_type8_h_free"    , x13+ 40, y13+ 0, z13-20, 0],
        ["gear_type8_h_free"    , x13+  0, y13+ 0, z13-30, 0],
        ["gear_type8_h_free"    , x13+-10, y13+ 0, z13-30, 0],
        ["gear_type8_h_free"    , x13+-20, y13+ 0, z13-30, 0],
        ["gear_type8_h_free"    , x13+-30, y13+ 0, z13-30, 0],
        ["gear_type8_h_free"    , x13+-40, y13+ 0, z13-30, 0],
        ["gear_type8_h_free"    , x13+ 10, y13+ 0, z13-30, 0],
        ["gear_type8_h_free"    , x13+ 20, y13+ 0, z13-30, 0],
        ["gear_type8_h_free"    , x13+ 30, y13+ 0, z13-30, 0],
        ["gear_type8_h_free"    , x13+ 40, y13+ 0, z13-30, 0],
        ["gear_type8_h_free"    , x13+  0, y13+ 0, z13-40, 0],
        ["gear_type8_h_free"    , x13+-10, y13+ 0, z13-40, 0],
        ["gear_type8_h_free"    , x13+-20, y13+ 0, z13-40, 0],
        ["gear_type8_h_free"    , x13+-30, y13+ 0, z13-40, 0],
        ["gear_type8_h_free"    , x13+-40, y13+ 0, z13-40, 0],
        ["gear_type8_h_free"    , x13+ 10, y13+ 0, z13-40, 0],
        ["gear_type8_h_free"    , x13+ 20, y13+ 0, z13-40, 0],
        ["gear_type8_h_free"    , x13+ 30, y13+ 0, z13-40, 0],
        ["gear_type8_h_free"    , x13+ 40, y13+ 0, z13-40, 0],
    ]
    GEAR.init(world, scene, dataInfo);
  }


  // !!!


  let cameraPosi = 0;
  const nCameraPosi = 4;
  let isrc = 0;
  let jball = 0;

  // for (let ii = 0; ii < srclist.length; ++ii) {
  //   srclist[ii].popforce();
  // }
  // // let trgBall = srclist[isrc].moBallBodyVec_[jball];

  addEventListener('resize', () => {
    // const width = window.innerWidth - 24;
    // const height = window.innerHeight - 24;
    // camera.aspect = width / height;
    // renderer.setSize(width, height);
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  });

  // const gamepad = new GamepadDrone(1);

  // // キーボード
  // let keyCfg = {
  //     frbk: 0,  // 前進/後進
  //     yaw:0,  // 左右旋回
  //     updn:0,    // 上昇/下降
  //     slide:0, // 左右移動(スライド)
  // };

  // function keydownMode1(key) {
  //   switch (key) {
  //     case 'ArrowUp':
  //       keyCfg.updn = 1;
  //       break
  //     case 'ArrowDown':
  //       keyCfg.updn = -1;
  //       break
  //     case 'ArrowLeft':
  //       keyCfg.slide = -1;
  //       break
  //     case 'ArrowRight':
  //       keyCfg.slide = 1;
  //       break
  //     case 'w':
  //       keyCfg.frbk = 1;
  //       break
  //     case 's':
  //       keyCfg.frbk = -1;
  //       break
  //     case 'a':
  //       keyCfg.yaw = 1;
  //       break
  //     case 'd':
  //       keyCfg.yaw = -1;
  //       break
  //   }
  // }

  // function keyupMode1(key) {
  //   switch (key) {
  //     case 'ArrowUp':
  //     case 'ArrowDown':
  //       keyCfg.updn = 0;
  //       break
  //     case 'ArrowLeft':
  //     case 'ArrowRight':
  //       keyCfg.slide = 0;
  //       break
  //     case 'w':
  //     case 's':
  //       keyCfg.frbk = 0;
  //       break
  //     case 'a':
  //     case 'd':
  //       keyCfg.yaw = 0;
  //       break
  //   }
  // }

  // function keydownMode2(key) {
  //   switch (key) {
  //     case 'ArrowUp':
  //       keyCfg.frbk = 1;
  //       break
  //     case 'ArrowDown':
  //       keyCfg.frbk = -1;
  //       break
  //     case 'ArrowLeft':
  //       keyCfg.slide = -1;
  //       break
  //     case 'ArrowRight':
  //       keyCfg.slide = 1;
  //       break
  //     case 'w':
  //       keyCfg.updn = 1;
  //       break
  //     case 's':
  //       keyCfg.updn = -1;
  //       break
  //     case 'a':
  //       keyCfg.yaw = 1;
  //       break
  //     case 'd':
  //       keyCfg.yaw = -1;
  //       break
  //   }
  // }

  // function keyupMode2(key) {
  //   switch (key) {
  //     case 'ArrowUp':
  //     case 'ArrowDown':
  //       keyCfg.frbk = 0;
  //       break
  //     case 'ArrowLeft':
  //     case 'ArrowRight':
  //       keyCfg.slide = 0;
  //       break
  //     case 'w':
  //     case 's':
  //       keyCfg.updn = 0;
  //       break
  //     case 'a':
  //     case 'd':
  //       keyCfg.yaw = 0;
  //       break
  //   }
  // }

  // let keydownMode = keydownMode1;
  // let keyupMode = keyupMode1;

  // function setDroneMode1() {
  //   gamepad.setMode(1);
  //   keydownMode = keydownMode1;
  //   keyupMode = keyupMode1;
  //   console.log("drone_mode1");
  // }

  // function setDroneMode2() {
  //   gamepad.setMode(2);
  //   keydownMode = keydownMode2;
  //   keyupMode = keyupMode2;
  //   console.log("drone_mode2");
  // }

  // // function changeCameraPosi() {
  // //   cameraPosi = (cameraPosi + 1) % nCameraPosi;
  // //   console.log("camera=",cameraPosi);
  // //   if (cameraPosi == 1) {
  // //     console.log("camera=1, 後背ビュー");
  // //   } else if (cameraPosi == 2) {
  // //     console.log("camera=2, フロントビュー（ドライバー視点)");
  // //   } else if (cameraPosi == 3) {
  // //     console.log("camera=3, 移動体周りを公転");
  // //     orbitControls.autoRotate = true;
  // //   } else {
  // //     console.log("camera=0, default");
  // //     orbitControls.autoRotate = false;
  // //     orbitControls.dampingFactor = 0.05;  // def 0.05
  // //     orbitControls.panSpeed = 1;  // def 1
  // //   }
  // // }

  // // // ドローンの姿勢を戻す
  // // function resetDronePosture() {
  // //   //   クォータニオンから方向だけを取り出し..
  // //   let vquat = moDrone.quaternion;
  // //   let veuler = new CANNON.Vec3(0, 0, 0);
  // //   vquat.toEuler(veuler);
  // //   let ry = veuler.y;
  // //   //   改めて、Ｙ軸のみで回転させたクォータニオンを作成し自身のクォータニオンとする
  // //   let carInitQuat = new CANNON.Quaternion();
  // //   carInitQuat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), ry);
  // //   moDrone.quaternion.copy(carInitQuat);
  // //   ddir = moDrone.quaternion.vmult(ddir0);
  // //   moDroneYaw(0);
  // //   console.log("reset drone posture");
  // // }

  // // key/gamepad の感度パラメータ
  // // 0: 感度低 , 1:中, 2:高
  // let iKeySens = 1;
  // let keySens = [{FRWD:1, BACK:1, YAW:0.005, UP:0.5, DOWN:0.5, SLD:0.5, },
  //                {FRWD:2, BACK:1, YAW:0.01 , UP:1  , DOWN:1  , SLD:1, },
  //                {FRWD:4, BACK:1, YAW:0.02 , UP:2  , DOWN:2  , SLD:2,},
  //               ];

  // let iGPSens = 1;
  // let gpSens = [{FRWD:1, BACK:1, YAW:0.005, UP:0.5, DOWN:0.5, SLD:0.5, },
  //               {FRWD:2, BACK:1, YAW:0.01 , UP:1  , DOWN:1  , SLD:1,},
  //               {FRWD:4, BACK:1, YAW:0.02 , UP:2  , DOWN:2  , SLD:2,},
  //              ];

  // function changeSensitive() {
  //   iKeySens = (iKeySens+1) % keySens.length;
  //   iGPSens = (iGPSens+1) % gpSens.length;
  //   console.log("changeSensitive", iKeySens, iGPSens);
  // }

  // Keybindings
  document.addEventListener('keydown', (event) => {
    // // // ゲームパッドの無効化
    // // gamepad.enable_ = false;
    // console.log("gamepad", gamepad.enable_);

    // // 主要な操作は関数ポインタ(keydownMode[12])で処理
    // keydownMode(event.key);
    let speed = null;

    switch (event.key) {
      // // case 'c':
      // //   changeCameraPosi();
      // //   break;

      case 'v':
        // カメラリセット
        orbitControls.reset();
        break;

      // case 'r':
      //   // 姿勢戻す
      //   resetDronePosture();
      //   break;

      // case 'd':
      //   // ボールリセット（ソースに戻す）
      //   if (trgBall.src_ != null) {
      //     let src = trgBall.src_;
      //     src.repop(trgBall);
      //   }
      //   break;

      // // case 'n':
      // //   // ボールのフォーカスを次に移す
      // //   jball += 1;
      // //   if (jball == srclist[isrc].moBallBodyVec_.length) {
      // //     isrc += 1;
      // //     if (isrc == srclist.length) {
      // //       isrc = 0;
      // //     }
      // //     if (srclist[isrc].moBallBodyVec_.length == 0) {
      // //       srclist[isrc].popforce();
      // //     }
      // //     jball = 0;
      // //   }
      // //   trgBall = srclist[isrc].moBallBodyVec_[jball];
      // //   break;

      // // case 'k':
      // //   changeSensitive();
      // //   break;

      // // // case 'Enter':
      // // case 'q':
      // //   // ゲームパッドの有効化／キーボードからゲームパッドへフォーカスを移す
      // //   console.log("enable gamepad");
      // //   gamepad.enable_ = true;
      // //   console.log("gamepad", gamepad.enable_);
      // //   break;
      // // case '1':
      // //   // ドローン（モード１）
      // //   setDroneMode1();
      // //   break;
      // // case '2':
      // //   // ドローン（モード２）
      // //   setDroneMode2();
      // //   break;

      // case 'w':
      //   GEAR.hinge_speedup();
      //   break;
      // case 's':
      //   GEAR.hinge_speeddown();
      //   break;
      case 'ArrowUp':
        speed = GEAR.hinge_speedup();
        setSpeed(speed);
        break;
      case 'ArrowDown':
        speed = GEAR.hinge_speeddown();
        setSpeed(speed);
        break;
      case 'ArrowRight':
      case 'ArrowLeft':
        speed = GEAR.hinge_speedzero();
        setSpeed(speed);
        break;

    }
  })

  // document.addEventListener('keyup', (event) => {
  //   keyupMode(event.key);
  // })

  {
    let px = 0, py = 0, pz = 0;
    camera.position.set(px, py+5, pz+80);
    camera.lookAt(new THREE.Vector3(px, py, pz));
  }

  setSpeed(0.2);

  // let keyChangeCool = 0;

  function animate() {
    // // if (gamepad.enable_) {
    // //   // ゲームパッド
    // //   gamepad.update();
    // //   if (gamepad.para2_.frbk > 0) {  // 前進/後進
    // //       moDrone.applyForce(ddirF.scale(gamepad.para2_.frbk * gpSens[iGPSens].FRWD));
    // //   } else if (gamepad.para2_.frbk < 0) {  // 前進/後進
    // //       moDrone.applyForce(ddirF.scale(gamepad.para2_.frbk * gpSens[iGPSens].BACK));
    // //   }
    // //   if (gamepad.para2_.yaw > 0) {  // 左右旋回
    // //       moDroneYaw(gamepad.para2_.yaw * gpSens[iGPSens].YAW);
    // //   } else if (gamepad.para2_.yaw < 0) {  // 左右旋回
    // //       moDroneYaw(gamepad.para2_.yaw * gpSens[iGPSens].YAW);
    // //   }
    // //   if (gamepad.para2_.updn > 0) {  // 上昇/下降
    // //     moDrone.applyForce(ddirFU_.vadd(ddirFUp.scale(gamepad.para2_.updn*gpSens[iGPSens].UP)));
    // //   } else if (gamepad.para2_.updn < 0) {  // 上昇/下降
    // //     moDrone.applyForce(ddirFU_.vadd(ddirFUp.scale(0.5*gamepad.para2_.updn*gpSens[iGPSens].DOWN)));
    // //   } else {
    // //     moDrone.applyForce(ddirFU_);
    // //   }
    // //   if (gamepad.para2_.slide < 0) {  // 左右移動(スライド)
    // //     moDrone.applyForce(ddirFR.scale(gamepad.para2_.slide*gpSens[iGPSens].SLD));
    // //   } else if (gamepad.para2_.slide > 0) {  // 左右移動(スライド)
    // //     moDrone.applyForce(ddirFR.scale(gamepad.para2_.slide*gpSens[iGPSens].SLD));
    // //   }

    // //   if (keyChangeCool > 0) {
    // //       keyChangeCool += -1;
    // //   } else {
    // //       if (gamepad.para_.btnA) {
    // //           if (keyChangeCool == 0) {
    // //               keyChangeCool = 30;
    // //               changeCameraPosi();
    // //           }
    // //       }
    // //       if (gamepad.para_.btnB) {
    // //           if (keyChangeCool == 0) {
    // //               keyChangeCool = 30;
    // //               resetDronePosture();
    // //           }
    // //       }
    // //       if (gamepad.para_.btnX) {
    // //           if (keyChangeCool == 0) {
    // //               keyChangeCool = 30;
    // //               if (gamepad.droneMode_ == 1) {
    // //                   setDroneMode2();
    // //               } else {
    // //                   setDroneMode1();
    // //               }
    // //           }
    // //       }
    // //       if (gamepad.para_.btnY) {
    // //           if (keyChangeCool == 0) {
    // //               keyChangeCool = 30;
    // //               changeSensitive();
    // //           }
    // //       }
    // //   }

    // // // // } else {
    // // {
    // //   // key
    // //   if (keyCfg.frbk > 0) {  // 前進/後進
    // //       moDrone.applyForce(ddirF.scale(keySens[iKeySens].FRWD));
    // //   } else if (keyCfg.frbk < 0) {  // 前進/後進
    // //       moDrone.applyForce(ddirB.scale(keySens[iKeySens].BACK));
    // //   }
    // //   if (keyCfg.yaw > 0) {  // 左右旋回(左)
    // //       moDroneYaw(keyCfg.yaw * keySens[iKeySens].YAW);
    // //   } else if (keyCfg.yaw < 0) {  // 左右旋回(右)
    // //       moDroneYaw(keyCfg.yaw * keySens[iKeySens].YAW);
    // //   }
    // //   if (keyCfg.updn > 0) {  // 上昇/下降
    // //     moDrone.applyForce(ddirFU_.vadd(ddirFUp.scale(keySens[iKeySens].UP)));
    // //   } else if (keyCfg.updn < 0) {  // 上昇/下降
    // //     moDrone.applyForce(ddirFU_.vadd(ddirFUp.scale(-0.5*keySens[iKeySens].DOWN)));
    // //   } else {
    // //     moDrone.applyForce(ddirFU_);
    // //   }
    // //   if (keyCfg.slide < 0) {  // 左右移動(スライド：左)
    // //     moDrone.applyForce(ddirFL.scale(keySens[iKeySens].SLD));
    // //   } else if (keyCfg.slide > 0) {  // 左右移動(スライド：右)
    // //     moDrone.applyForce(ddirFR.scale(keySens[iKeySens].SLD));
    // //   }
    // // }

    // if (actuatorlist.length > 0) {
    //   for (let ii = 0; ii < actuatorlist.length; ++ii) {
    //       actuatorlist[ii].act();
    //   }
    // }

    world.step(timeStep)

    // for (let ii = 0; ii < srclist.length; ++ii) {
    //   let src = srclist[ii];
    //   for (let i = 0; i < src.moBallBodyVec_.length; ++i) {
    //     // 場外判定
    //     if (src.moBallBodyVec_[i].position.y < -100) {
    //       src.repop(src.moBallBodyVec_[i]);
    //     }
    //     // 停止判定
    //     if (src.moBallBodyVec_[i].velocity.lengthSquared() < 0.001) {
    //       src.repop(src.moBallBodyVec_[i]);
    //     }
    //   }
    //   src.pop();
    // }

    // ----------------------------------------
    // カメラ操作
    // // let vposi = moDrone.position;;
    // // let vquat = moDrone.quaternion;
    // // if (cameraPosi == 1) {
    // //   // console.log("camera=1, 後背ビュー");
    // //   let vv = vquat.vmult(new CANNON.Vec3(23, 5, 0));  // 後方、高さ、左右
    // //   camera.position.set(vposi.x + vv.x, vposi.y + vv.y, vposi.z + vv.z);
    // //   camera.rotation.z = 0;
    // //   camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));

    // // } else if (cameraPosi == 2) {
    // //   // console.log("camera=2, フロントビュー（ドライバー視点)");
    // //   camera.position.copy(new THREE.Vector3(vposi.x, vposi.y+2, vposi.z));
    // //   camera.rotation.z = 0;
    // //   let vv = vquat.vmult(new CANNON.Vec3(-20, 0, 0));  // 前方、高さ、左右
    // //   camera.lookAt(new THREE.Vector3(vposi.x + vv.x, vposi.y + vv.y, vposi.z + vv.z));

    // // } else if (cameraPosi == 3) {
    // //   // console.log("camera=3, 移動体周りを公転");
    // //   // orbitControls.autoRotate = true;
    // //   orbitControls.target = new THREE.Vector3(vposi.x, vposi.y, vposi.z);
    // //   orbitControls.update();

    // // } else {
    // //   orbitControls.update();
    // // }
    orbitControls.update();

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  animate();
};


function setSpeed(speed) {
    speed = Math.round(speed*10)/10;
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

- cannon-es docs
https://pmndrs.github.io/cannon-es/docs/
https://pmndrs.github.io/cannon-es/

*/

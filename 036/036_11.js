// mode:javascript
//
// slope toy
//
// レースコース（３車線）

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


  // ----------------------------------------

  //   コースの作成例
  //    .. レースコース（３車線）
  if (1) {
    var dataInfo = [["rail_st_slope"          ,   20,  20,   0, 0],
                    ["rail_st_slope"          ,   20,  20,  10, 0],
                    ["rail_st_slope"          ,   20,  20,  20, 0],
                    ["rail_st"                ,   10,  10,   0, 0],
                    ["rail_st"                ,   10,  10,  10, 0],
                    ["rail_st"                ,   10,  10,  20, 0],
                    ["rail_st"                ,    0,  10,   0, 0],
                    ["rail_st"                ,    0,  10,  10, 0],
                    ["rail_st"                ,    0,  10,  20, 0],
                    ["rail_st_shift_line2"    ,  -10,  10,   0, 2],
                    ["rail_st_shift_line2"    ,  -10,  10,  10, 2],
                    ["rail_st_shift_line2"    ,  -10,  10,  20, 2],
                    ["rail_st_shift_line"     ,  -20,  10,   0, 0],
                    ["rail_st_shift_line"     ,  -20,  10,  10, 0],
                    ["rail_st_shift_line"     ,  -20,  10,  20, 0],
                    ["rail_arc_l"             ,  -50,  10,   0, 2],  // ／+
                    ["rail_arc_m"             ,  -40,  10,  10, 2],  // ／+
                    ["rail_arc_s"             ,  -30,  10,  20, 2],  // ／+
                    ["rail_arc_s"             ,  -50,  10,  30, 0],  // +／
                    ["rail_arc_m"             ,  -50,  10,  30, 0],  // +／
                    ["rail_arc_l"             ,  -50,  10,  30, 0],  // +／
                    ["rail_arc_s"             ,  -60,  10,  30, 3],  // ＼+
                    ["rail_arc_m"             ,  -70,  10,  30, 3],  // ＼+
                    ["rail_arc_l"             ,  -80,  10,  30, 3],  // ＼+
                    ["rail_st"                ,  -60,  10,  20, 1],
                    ["rail_st"                ,  -70,  10,  20, 1],
                    ["rail_st"                ,  -70,  10,  10, 1],
                    ["rail_st"                ,  -80,  10,  20, 1],
                    ["rail_st"                ,  -80,  10,  10, 1],
                    ["rail_st"                ,  -80,  10,   0, 1],
                    ["rail_arc_l"             ,  -80,  10, -30, 2],  // ／+
                    ["rail_arc_l"             ,  -70,  10, -20, 2],  // ／+
                    ["rail_arc_l"             ,  -60,  10, -10, 2],  // ／+
                    ["rail_st_slope_arc"      ,  -30,  10, -10, 0],
                    ["rail_arc_m"             ,  -10,  20, -20, 0],  // +／
                    ["rail_st"                ,    0,  20, -30, 1],
                    ["rail_st_slope_arc"      ,    0,  10, -50, 3],
                    ["rail_st"                ,    0,  10, -60, 1],
                    ["rail_st"                ,  -50,  10, -30, 0],
                    ["rail_st"                ,  -40,  10, -30, 0],
                    ["rail_st"                ,  -30,  10, -30, 0],
                    ["rail_st"                ,  -20,  10, -30, 0],
                    ["rail_st"                ,  -10,  10, -30, 0],
                    ["rail_arc_m"             ,    0,  10, -40, 0],  // +／
                    ["rail_st"                ,   10,  10, -50, 1],
                    ["rail_st"                ,  -40,  10, -20, 0],
                    ["rail_st"                ,  -30,  10, -20, 0],
                    ["rail_st"                ,  -20,  10, -20, 0],
                    ["rail_st"                ,  -10,  10, -20, 0],
                    ["rail_arc_l"             ,    0,  10, -40, 0],  // +／
                    ["rail_arc_R45_r"         ,    0,  10, -80, 1],  //   ||／
                    ["rail_arc_R45_r"         ,   10,  10, -70, 1],  //   ||／
                    ["rail_arc_R45_r"         ,   20,  10, -60, 1],  //   ||／
                    ["rail_st_R45_2"          ,   10,  10, -90, 0],   //   ／.
                    ["rail_st_R45_2"          ,   20,  10, -80, 0],   //   ／.
                    ["rail_st_R45_2"          ,   30,  10, -70, 0],   //   ／.
                    ["rail_arc_R45"           ,   20,  10, -100, 0],  //  ／~~
                    ["rail_arc_R45"           ,   30,  10, -90, 0],  //   ／~~
                    ["rail_arc_R45"           ,   40,  10, -80, 0],  //   ／~~
                    ["rail_st"                ,   40,  10, -100, 0],
                    ["rail_st"                ,   50,  10, -100, 0],
                    ["rail_st"                ,   60,  10, -100, 0],
                    ["vloop_s"                ,   60,  10, -110, 0],
                    ["rail_st"                ,   70,  10, -110, 0],
                    ["rail_st"                ,   50,  10, -90, 0],
                    ["rail_st"                ,   60,  10, -90, 0],
                    ["rail_st"                ,   70,  10, -90, 0],
                    ["rail_st"                ,   80,  10, -90, 0],
                    ["vloop_s"                ,   80,  10, -100, 0],
                    ["rail_st"                ,   90,  10, -100, 0],
                    ["rail_st"                ,   60,  10, -80, 0],
                    ["rail_st"                ,   70,  10, -80, 0],
                    ["rail_st"                ,   80,  10, -80, 0],
                    ["rail_st"                ,   90,  10, -80, 0],
                    ["rail_st"                ,  100,  10, -80, 0],
                    ["vloop_s"                ,  100,  10, -90, 0],
                    ["rail_st"                ,  110,  10, -90, 0],
                    ["rail_st_slope_arc_s"    ,  80,   5, -110, 2],
                    ["rail_st_slope_arc_s"    ,  100,   0, -110, 2],
                    ["rail_st"                ,  120,   0, -110, 0],
                    ["rail_arc_l"             ,  130,   0, -110, 1],  // +＼
                    ["rail_st"                ,  150,   0, -80, 1],
                    ["rail_st"                ,  100,  10, -100, 0],
                    ["rail_st"                ,  110,  10, -100, 0],
                    ["rail_st"                ,  120,  10, -100, 0],
                    ["rail_arc_l"             ,  130,  10, -100, 1],  // +＼
                    ["rail_st_slope_arc_s"    ,  120,   10, -90, 0],
                    ["rail_st_slope_arc_s"    ,  140,   15, -90, 0],
                    ["rail_arc_m"             ,  160,   20, -90, 1],  // +＼
                    ["rail_arc_m"             ,  160,   20, -70, 0],  // +／
                    ["rail_st"                ,  150,   20, -60, 0],
                    ["rail_st"                ,  140,   20, -60, 0],
                    ["rail_arc_m"             ,  140,    0, -70, 0],  // +／
                    ["rail_arc_m"             ,  140,   10, -70, 0],  // +／
                    ["rail_arc_l"             ,  110,    0, -60, 2],  // ／+
                    ["rail_arc_l"             ,  110,   10, -60, 2],  // ／+
                    ["rail_arc_l"             ,  110,   20, -60, 2],  // ／+
                    ["rail_arc_l"             ,  110,    0, -30, 3],  // ＼+
                    ["rail_arc_l"             ,  110,   10, -30, 3],  // ＼+
                    ["rail_arc_l"             ,  110,   20, -30, 3],  // ＼+
                    ["rail_arc_l"             ,  140,    0, -10, 1],  // +＼
                    ["rail_arc_l"             ,  140,   10, -10, 1],  // +＼
                    ["rail_arc_l"             ,  140,   20, -10, 1],  // +＼
                    ["rail_st"                ,  160,    0,  20, 1],
                    ["rail_st"                ,  160,    0,  30, 1],
                    ["rail_st"                ,  160,    0,  40, 1],
                    ["rail_st"                ,  160,   10,  20, 1],
                    ["rail_st"                ,  160,   10,  30, 1],
                    ["rail_st"                ,  160,   20,  20, 1],
                    ["rail_arc_l"             ,  140,    0,  50, 0],  // +／
                    ["rail_arc_l"             ,  140,   10,  40, 0],  // +／
                    ["rail_arc_l"             ,  140,   20,  30, 0],  // +／
                    ["rail_arc_l"             ,  110,    0,  50, 3],  // ＼+
                    ["rail_arc_l"             ,  110,   10,  40, 3],  // ＼+
                    ["rail_arc_l"             ,  110,   20,  30, 3],  // ＼+
                    ["rail_arc_l"             ,   90,    0,  20, 1],  // +＼
                    ["rail_arc_l"             ,   90,   10,  10, 1],  // +＼
                    ["rail_arc_l"             ,   90,   20,   0, 1],  // +＼
                    ["rail_st_slope_arc_s"    ,   70,   15,   0, 0],
                    ["rail_st_slope_arc_s"    ,   50,   10,   0, 0],
                    ["rail_st"                ,   40,   10,   0, 0],
                    ["rail_st"                ,   30,   10,   0, 0],
                    ["rail_st"                ,   20,   10,   0, 0],
                    ["rail_st"                ,   80,   10,  10, 0],
                    ["rail_st"                ,   70,   10,  10, 0],
                    ["rail_st"                ,   60,   10,  10, 0],
                    ["rail_st"                ,   50,   10,  10, 0],
                    ["rail_st"                ,   40,   10,  10, 0],
                    ["rail_st"                ,   30,   10,  10, 0],
                    ["rail_st"                ,   20,   10,  10, 0],
                    ["rail_st_slope_arc_s"    ,   70,    0,  20, 2],
                    ["rail_st_slope_arc_s"    ,   50,    5,  20, 2],
                    ["rail_st"                ,   40,   10,  20, 0],
                    ["rail_st"                ,   30,   10,  20, 0],
                    ["rail_st"                ,   20,   10,  20, 0],
                    ];
    ST.init(world, scene, dataInfo);
    var src1  = new ST.Source_00(   30, 60,  0, 4, 0.002, 2);
    var src2  = new ST.Source_00(   30, 60, 10, 4, 0.002, 2);
    var src3  = new ST.Source_00(   30, 60, 20, 4, 0.002, 2);
    var srclist = [src1,src2,src3];
    var acc  = new ST.Accelerator_01( -45, 17, 55,   -1, 0,0, 40);
    var acc  = new ST.Accelerator_01( -75, 17, 10,   0, 0,-1, 40);
    var acc  = new ST.Accelerator_01( -65, 17, 30,   0, 0,-1, 60);
    var acc  = new ST.Accelerator_01( -55, 17, 20,   0, 0,-1, 30);
    var acc  = new ST.Accelerator_01( -35, 17, -5,   1, 0, 0, 60);
    var acc  = new ST.Accelerator_01(  60, 17, -95,   1, 0, 0, 120);
    var acc  = new ST.Accelerator_01(  80, 17, -85,   1, 0, 0, 120);
    var acc  = new ST.Accelerator_01( 100, 17, -75,   1, 0, 0, 120);
    var acc  = new ST.Accelerator_01( 120, 17, -85,   1, 0, 0, 30);
    var acc  = new ST.Accelerator_01( 140, 22, -85,   1, 0, 0, 40);
    var acc  = new ST.Accelerator_01( 130, 17, -95,   1, 0, 0, 20);
    var acc  = new ST.Accelerator_01( 125,  7,-105,   1, 0, 0, 20);
    var acc  = new ST.Accelerator_01( 140,  7, -55,  -1, 0, 0, 20);
    var acc  = new ST.Accelerator_01( 140, 17, -55,  -1, 0, 0, 20);
    var acc  = new ST.Accelerator_01( 140, 27, -55,  -1, 0, 0, 20);
    var acc  = new ST.Accelerator_01( 165, 27,  25,   0, 0, 1, 20, "yellow");
    var acc  = new ST.Accelerator_01( 165, 17,  35,   0, 0, 1, 20, "yellow");
    var acc  = new ST.Accelerator_01( 165,  7,  45,   0, 0, 1, 20, "yellow");
    var acc  = new ST.Accelerator_01(  90, 17,  15,  -1, 0, 0, 60);
    var acc  = new ST.Accelerator_01(  90,  7,  25,  -1, 0, 0, 60);
    var acc  = new ST.Accelerator_01(  40, 17,  25,  -1, 0, 0, 20);
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

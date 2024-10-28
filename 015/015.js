// mode:javascript

// ヒンジに代表される、制約(constraint)のデモ・確認

//
//       ↑(画面上):y  : 逆向きに重力
//       │
//       │
//       │＿＿＿＿→ (画面右):x
//      ／          
//    ／
//  (画面手前):z

// - 11_2
//   - DistanceConstraint : 固定長 , 
//                          中心位置での距離なので、接続したBodyが回転しない／動きが不自然
//                          微小角なら誤魔化せそう
// - 11_2_2
//   - DistanceConstraint : 自然になるかなと、
//                          点(particle)を球表面において、粒子とアンカーはDistanceで 粒子と球は PointToPointでつないでみたら..
//                          くねくねしてちょっと変な感じ。
//
//                          粒子(particle)を球表面において、粒子とアンカーはDistanceで 粒子と球は Lock でつないでみたら..
//                          クォータニオンが固定された感じで、変
//                          ブランコでもこんな感じ(床と平行を保ったまま動く)ではない..

import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "orbitcontrols";

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
    camera.position.set(0, 20, 100)
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambientLight)

    const spotLight = new THREE.SpotLight(0xffffff, 0.9, 0, Math.PI / 8, 1)
    spotLight.position.set(-30, 1000, 30)
    spotLight.target.position.set(0, 0, 0)
    spotLight.castShadow = true
    spotLight.shadow.camera.near = 10
    spotLight.shadow.camera.far = 100
    spotLight.shadow.camera.fov = 30
    spotLight.shadow.mapSize.width = 2048
    spotLight.shadow.mapSize.height = 2048
    scene.add(spotLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.15)
    directionalLight.position.set(-30, 40, 30)
    directionalLight.target.position.set(0, 0, 0)
    scene.add(directionalLight)

    // Orbit controls
    orbitControls = new OrbitControls(camera, canvasElement);
    orbitControls.rotateSpeed = 1.0
    orbitControls.zoomSpeed = 1.2
    orbitControls.enableDamping = true
    orbitControls.enablePan = false
    orbitControls.dampingFactor = 0.2
    orbitControls.minDistance = 10
    orbitControls.maxDistance = 500
  }

  return {world, camera, scene, renderer, orbitControls};
}


window.onload = () => {
  const {world, camera, scene, renderer, orbitControls} = setupWorld();

  // 長方形の台を地面代わりにする
  const moGroundMtr = new CANNON.Material('ground')
  const grndw = 20; const grndh = 20;
  const moGround2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(grndw, 1, grndh)),
    position: new CANNON.Vec3(0, -1, 0),
    material: moGroundMtr,
  });
  world.addBody(moGround2Body);
  const viGround2Geo = new THREE.BoxGeometry(grndw*2, 2, grndh*2);
  const viGround2Mtr = new THREE.MeshNormalMaterial({transparent: true, opacity: 0.4});
  const viGround2Mesh = new THREE.Mesh(viGround2Geo, viGround2Mtr);
  scene.add(viGround2Mesh);
  viGround2Mesh.position.copy(moGround2Body.position);
  viGround2Mesh.quaternion.copy(moGround2Body.quaternion);

  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // 基準面を作成 (500pixel四方を 50x50分割
  const viBaseGrid = new THREE.GridHelper(500, 50, 0xff8888, 0x404040);
  viBaseGrid.position.set(0, 0, 0);
  scene.add(viBaseGrid);

  const radius = 1;
  const moObj1AShape = new CANNON.Sphere(radius);
  const moObj1ABody = new CANNON.Body({mass: 0, shape: moObj1AShape, position: new CANNON.Vec3(-10, 5, 0)});
  world.addBody(moObj1ABody)
  const viObj1AGeo = new THREE.SphereGeometry(radius, 6, 6);
  const viObj1AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viObj1AMesh = new THREE.Mesh(viObj1AGeo, viObj1AMtr);
  viObj1AMesh.position.copy(moObj1ABody.position);
  viObj1AMesh.quaternion.copy(moObj1ABody.quaternion);
  scene.add(viObj1AMesh);
  //
  const moObj1BShape = new CANNON.Sphere(radius);
  const moObj1BBody = new CANNON.Body({mass: 1, shape: moObj1BShape, position: new CANNON.Vec3(-10, 5, 3)});
  world.addBody(moObj1BBody)
  const viObj1BGeo = new THREE.SphereGeometry(radius, 6, 6);
  const viObj1BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viObj1BMesh = new THREE.Mesh(viObj1BGeo, viObj1BMtr);
  viObj1BMesh.position.copy(moObj1BBody.position);
  viObj1BMesh.quaternion.copy(moObj1BBody.quaternion);
  scene.add(viObj1BMesh);
  // 一定距離(=4)でつなぐ
  const moObj1Const = new CANNON.DistanceConstraint(moObj1ABody, moObj1BBody, 4);
  world.addConstraint(moObj1Const);
  // DistanceConstraintの可視化　二つのオブジェクトの中心をつないで線を引く
  const viObj1Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viObj1Points = [];
  viObj1Points.push( moObj1ABody.position );
  viObj1Points.push( moObj1BBody.position );
  const viObj1Geo = new THREE.BufferGeometry().setFromPoints(viObj1Points);
  const viObj1Line = new THREE.Line(viObj1Geo, viObj1Mtr);
  scene.add(viObj1Line);


  const moBox2AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox2ABody = new CANNON.Body({ mass: 0, shape: moBox2AShape, position: new CANNON.Vec3(0, 5, 0) })
  world.addBody(moBox2ABody)
  const viBox2AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox2AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox2AMesh = new THREE.Mesh(viBox2AGeo, viBox2AMtr);
  viBox2AMesh.position.copy(moBox2ABody.position);
  viBox2AMesh.quaternion.copy(moBox2ABody.quaternion);
  scene.add(viBox2AMesh);
  //
  const moBox2BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
    // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox2BBody = new CANNON.Body({ mass: 1, shape: moBox2BShape, position: new CANNON.Vec3(0, 10, 1) })
  world.addBody(moBox2BBody)
  const viBox2BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox2BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox2BMesh = new THREE.Mesh(viBox2BGeo, viBox2BMtr);
  viBox2BMesh.position.copy(moBox2BBody.position);
  viBox2BMesh.quaternion.copy(moBox2BBody.quaternion);
  scene.add(viBox2BMesh);
  const moBox2Const = new CANNON.DistanceConstraint(moBox2ABody, moBox2BBody, 4);
  world.addConstraint(moBox2Const);
  //
  const viBox2Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox2Points = [];
  viBox2Points.push( moBox2ABody.position );
  viBox2Points.push( moBox2BBody.position );
  const viBox2Geo = new THREE.BufferGeometry().setFromPoints(viBox2Points);
  const viBox2Line = new THREE.Line(viBox2Geo, viBox2Mtr);
  scene.add(viBox2Line);


  const moBox3AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox3ABody = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(10, 5, 0) })
  moBox3ABody.addShape(moBox3AShape)
  world.addBody(moBox3ABody)
  const viBox3AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox3AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox3AMesh = new THREE.Mesh(viBox3AGeo, viBox3AMtr);
  viBox3AMesh.position.copy(moBox3ABody.position);
  viBox3AMesh.quaternion.copy(moBox3ABody.quaternion);
  scene.add(viBox3AMesh);
  //
  const moBox3BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox3BBody = new CANNON.Body({ mass: 1, position: new CANNON.Vec3(12, 2, 0) })
  moBox3BBody.addShape(moBox3BShape)
  world.addBody(moBox3BBody)
  const viBox3BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox3BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox3BMesh = new THREE.Mesh(viBox3BGeo, viBox3BMtr);
  viBox3BMesh.position.copy(moBox3BBody.position);
  viBox3BMesh.quaternion.copy(moBox3BBody.quaternion);
  scene.add(viBox3BMesh);
  const moBox3Const = new CANNON.DistanceConstraint(moBox3ABody, moBox3BBody, 4);
  world.addConstraint(moBox3Const);
  moBox3BBody.applyImpulse(new CANNON.Vec3(0, 0, -5));
  //
  const viBox3Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox3Points = [];
  viBox3Points.push( moBox3ABody.position );
  viBox3Points.push( moBox3BBody.position );
  const viBox3Geo = new THREE.BufferGeometry().setFromPoints(viBox3Points);
  const viBox3Line = new THREE.Line(viBox3Geo, viBox3Mtr);
  scene.add(viBox3Line);


  const moObj4AShape = new CANNON.Sphere(radius);
  const moObj4ABody = new CANNON.Body({mass: 0, shape: moObj4AShape, position: new CANNON.Vec3(-10, 5, -10)});
  world.addBody(moObj4ABody)
  const viObj4AGeo = new THREE.SphereGeometry(radius, 6, 6);
  const viObj4AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viObj4AMesh = new THREE.Mesh(viObj4AGeo, viObj4AMtr);
  viObj4AMesh.position.copy(moObj4ABody.position);
  viObj4AMesh.quaternion.copy(moObj4ABody.quaternion);
  scene.add(viObj4AMesh);
  //
  const moObj4BShape = new CANNON.Sphere(radius);
  const moObj4BBody = new CANNON.Body({mass: 1, shape: moObj4BShape, position: new CANNON.Vec3(-10, 5, -6)});
  world.addBody(moObj4BBody)
  const viObj4BGeo = new THREE.SphereGeometry(radius, 6, 6);
  const viObj4BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viObj4BMesh = new THREE.Mesh(viObj4BGeo, viObj4BMtr);
  viObj4BMesh.position.copy(moObj4BBody.position);
  viObj4BMesh.quaternion.copy(moObj4BBody.quaternion);
  scene.add(viObj4BMesh);
  //
  const moObj4ABConst = new CANNON.PointToPointConstraint(
    moObj4ABody, new CANNON.Vec3(0, 0, 0),
    moObj4BBody, new CANNON.Vec3(0, 0, -3.9));  // 床にこすらないようちょっとだけ短く
  world.addConstraint(moObj4ABConst);
  //
  const viObj4Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viObj4Points = [];
  viObj4Points.push( moObj4ABody.position );
  viObj4Points.push( moObj4BBody.position );
  const viObj4Geo = new THREE.BufferGeometry().setFromPoints(viObj4Points);
  const viObj4Line = new THREE.Line(viObj4Geo, viObj4Mtr);
  scene.add(viObj4Line);


  const moBox5AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox5ABody = new CANNON.Body({ mass: 0, shape: moBox5AShape, position: new CANNON.Vec3(0, 5, -10) })
  world.addBody(moBox5ABody)
  const viBox5AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox5AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox5AMesh = new THREE.Mesh(viBox5AGeo, viBox5AMtr);
  viBox5AMesh.position.copy(moBox5ABody.position);
  viBox5AMesh.quaternion.copy(moBox5ABody.quaternion);
  scene.add(viBox5AMesh);
  //
  const moBox5BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 真上に配置すると動かないので、ちょっとZ方向にずらしておく
  const moBox5BBody = new CANNON.Body({ mass: 1, shape: moBox5BShape, position: new CANNON.Vec3(0, 8.5, -9.7) })
  world.addBody(moBox5BBody)
  const viBox5BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox5BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox5BMesh = new THREE.Mesh(viBox5BGeo, viBox5BMtr);
  viBox5BMesh.position.copy(moBox5BBody.position);
  viBox5BMesh.quaternion.copy(moBox5BBody.quaternion);
  scene.add(viBox5BMesh);
  //
  const moBox5Const = new CANNON.PointToPointConstraint(
    moBox5ABody, new CANNON.Vec3(0, 0, 0),
    moBox5BBody, new CANNON.Vec3(0, -3.5, 0));  // 床にこすらないようちょっとだけ短く
  world.addConstraint(moBox5Const);
  const viBox5Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox5Points = [];
  viBox5Points.push( moBox5ABody.position );
  viBox5Points.push( moBox5BBody.position );
  const viBox5Geo = new THREE.BufferGeometry().setFromPoints(viBox5Points);
  const viBox5Line = new THREE.Line(viBox5Geo, viBox5Mtr);
  scene.add(viBox5Line);

  var cameraPosi = -1;

  // Keybindings
  // Add force on keydown
  document.addEventListener('keydown', (event) => {
    const maxSteerVal = 0.5
    const maxForce = 1000
    const brakeForce = 1000000

    switch (event.key) {
      case 'c':
        cameraPosi = (cameraPosi + 1) % 2;
        break;
    }
  })

  var iroty = 0;
  function animate() {
    requestAnimationFrame(animate)

    const timeStep = 1 / 60;
    world.step(timeStep)

    // ..
    viObj1AMesh.position.copy(moObj1ABody.position);
    viObj1AMesh.quaternion.copy(moObj1ABody.quaternion);
    viObj1BMesh.position.copy(moObj1BBody.position);
    viObj1BMesh.quaternion.copy(moObj1BBody.quaternion);
    viObj1Points[1].copy(moObj1BBody.position);
    viObj1Geo.setFromPoints(viObj1Points);

    viBox2AMesh.position.copy(moBox2ABody.position);
    viBox2AMesh.quaternion.copy(moBox2ABody.quaternion);
    viBox2BMesh.position.copy(moBox2BBody.position);
    viBox2BMesh.quaternion.copy(moBox2BBody.quaternion);
    viBox2Points[1].copy(moBox2BBody.position);
    viBox2Geo.setFromPoints(viBox2Points);

    viBox3AMesh.position.copy(moBox3ABody.position);
    viBox3AMesh.quaternion.copy(moBox3ABody.quaternion);
    viBox3BMesh.position.copy(moBox3BBody.position);
    viBox3BMesh.quaternion.copy(moBox3BBody.quaternion);
    viBox3Points[1].copy(moBox3BBody.position);
    viBox3Geo.setFromPoints(viBox3Points);


    viObj4AMesh.position.copy(moObj4ABody.position);
    viObj4AMesh.quaternion.copy(moObj4ABody.quaternion);
    viObj4BMesh.position.copy(moObj4BBody.position);
    viObj4BMesh.quaternion.copy(moObj4BBody.quaternion);
    viObj4Points[1].copy(moObj4BBody.position);
    viObj4Geo.setFromPoints(viObj4Points);

    viBox5AMesh.position.copy(moBox5ABody.position);
    viBox5AMesh.quaternion.copy(moBox5ABody.quaternion);
    viBox5BMesh.position.copy(moBox5BBody.position);
    viBox5BMesh.quaternion.copy(moBox5BBody.quaternion);
    viBox5Points[1].copy(moBox5BBody.position);
    viBox5Geo.setFromPoints(viBox5Points);

    // カメラ・視点 関連
    var vposi = moObj1ABody.position;
    var vquat = moObj1ABody.quaternion;
    if (cameraPosi == 0) {
      // カスタムの自動回転
      var r = 200;
      var dx = r*Math.cos(iroty);
      var dz = r*Math.sin(iroty);
      iroty = (iroty + 0.001);
      if (iroty > 2*Math.PI) {
        iroty = iroty -2*Math.PI;
      }
      camera.position.set(vposi.x + dx, vposi.y + 200, vposi.z + dz);
      camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));
    } else {
      // _cameraPosi == 1
      // OrbitControls のマウス操作に任せる
      orbitControls.autoRotate = false;
      orbitControls.update();
    }

    renderer.render(scene, camera)
  }

  animate();
};



/*

ヒンジメモ

クラス                 | explain                        | example
ConeTwistConstraint    | 円錐形の動き、仰角制限の回転   | 回転振り子
Constraint             | ..                             | (基底クラス)
DistanceConstraint     | 一定の距離を保つ               | 固定棒で繋がったオブジェクト、カーテン、チェーン
HingeConstraint        | 蝶番の動き                     | ドア(軸１つ)、車の前輪のステアリング(軸２つ)
LockConstraint         | グループ化、一体化             | 剛体
PointToPointConstraint | 点と点を固定の一定距離でつなぐ | 振り子


[Constraint]
  △
　└──[DistanceConstraint]       .. bodyA(中心) と bodyB(中心) の距離を一定に保つ
  │
　└──[PointToPointConstraint]   .. bodyA(任意の位置) と bodyB(任意の位置) の距離を一定に保つ
　　　　  △
　　　　　└──[ConeTwistConstraint]
　　　　  │
　　　　　└──[LockConstraint]      .. bodyA(任意の位置) と bodyB(任意の位置) を位置関係を固定する
　　　　  │
　　　　　└──[HingeConstraint]

- Three.js備忘録（６）
  https://koro-koro.com/threejs-no6/

- Cannon.js の世界へようこそ！ ３歩でわかる お手軽 物理シミュレーション
  https://qiita.com/dsudo/items/66f41ef514344afeec4e

  振り子

- Javascript で動く軽量物理エンジン Cannon.js と3Dレンダラ Three.js で書いた短いサンプルコード
  https://qiita.com/yamazaki3104/items/fafb7879591caf137b52

  ヒンジ

- (public)
  https://pmndrs.github.io/cannon-es/

  - ヒンジ・パネル
    https://pmndrs.github.io/cannon-es/examples/threejs_fps

  - hinge
    https://pmndrs.github.io/cannon-es/examples/hinge

  - ragdoll
    https://pmndrs.github.io/cannon-es/examples/ragdoll

  - end0tknr's kipple - web写経開発  .. 物体の落下; ビリヤードゲーム; ヒンジによるタイヤ接合; 2コのピンによる板の接合
    https://end0tknr.hateblo.jp/entry/20210813/1628809011
    (デモのヒンジのコピー)


- (pub)
  https://el-ement.com/etc/oimo/demos/

  - バネ（横） 曲がり方向への荷重
  - バネ（縦） 移動方向への荷重

  - 回転

  - joints
    - 平行移動(軸方向に移動)
    - 平行移動＋回転(軸方向に移動、軸が回転軸)

    - 鎖（一定距離で連結
    - チェーン（ヒンジ：軸／線で結合、軸が回転軸

- cannon-es docs
https://pmndrs.github.io/cannon-es/docs/index.html
https://pmndrs.github.io/cannon-es/docs/

*/

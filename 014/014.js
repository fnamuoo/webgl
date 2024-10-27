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

// - 11_1
//   - バネ、バネの可視化(ライン表示)

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


  // 長方形の台を地面代わりに
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

  // 基準面を作成 (500pixel四方を 50x50分割
  const viBaseGrid = new THREE.GridHelper(500, 50, 0xff8888, 0x404040);
  viBaseGrid.position.set(0, 0, 0);
  scene.add(viBaseGrid);

  // 球 作成
  const radius = 5;
  // moSphereMtr.restitution = 1;  // 反発係数 1:跳ねやすい  /  0:跳ねない
  const moSphereMtr = new CANNON.Material({name: 'name2', restitution: 0});
  // const moSphereMtr = new CANNON.Material({name: 'name2', restitution: 1});
  const moSphereBody = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Sphere(radius),
    position: new CANNON.Vec3(-10, 6, -10),
    material: moSphereMtr
  });
  world.addBody(moSphereBody);
  const viSphereGeo = new THREE.SphereGeometry(radius);
  const viSphereMtr = new THREE.MeshNormalMaterial();
  const viSphereMesh = new THREE.Mesh(viSphereGeo, viSphereMtr);
  scene.add(viSphereMesh);

  const sphere_ground = new CANNON.ContactMaterial(moSphereMtr, moGroundMtr, {
    friction: 0.9,  // 摩擦係数(def=0.3)
    restitution: 0.0,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1000,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(sphere_ground)

  const moBoxShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
  const moBoxBody = new CANNON.Body({ mass: 1, position: new CANNON.Vec3(-5, 3, 0) })
  moBoxBody.addShape(moBoxShape)
  world.addBody(moBoxBody)
  const viBoxGeo = new THREE.BoxGeometry(4, 1, 2,  4, 1, 2);
  const viBoxMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBoxMesh = new THREE.Mesh(viBoxGeo, viBoxMtr);
  viBoxMesh.position.copy(moBoxBody.position);
  viBoxMesh.quaternion.copy(moBoxBody.quaternion);
  scene.add(viBoxMesh);

  const moBox2AShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
  const moBox2ABody = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(0, 6, 0) })
  moBox2ABody.addShape(moBox2AShape)
  world.addBody(moBox2ABody)
  const viBox2AGeo = new THREE.BoxGeometry(4, 1, 2,  4, 1, 2);
  const viBox2AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox2AMesh = new THREE.Mesh(viBox2AGeo, viBox2AMtr);
  viBox2AMesh.position.copy(moBox2ABody.position);
  viBox2AMesh.quaternion.copy(moBox2ABody.quaternion);
  scene.add(viBox2AMesh);
  //
  const moBox2BShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
  const moBox2BBody = new CANNON.Body({ mass: 1, position: new CANNON.Vec3(0, 1, 0) })
  moBox2BBody.addShape(moBox2BShape)
  world.addBody(moBox2BBody)
  const viBox2BGeo = new THREE.BoxGeometry(4, 1, 2,  4, 1, 2);
  const viBox2BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox2BMesh = new THREE.Mesh(viBox2BGeo, viBox2BMtr);
  viBox2BMesh.position.copy(moBox2BBody.position);
  viBox2BMesh.quaternion.copy(moBox2BBody.quaternion);
  scene.add(viBox2BMesh);
  // バネを付ける
  const moSpringBox2 = new CANNON.Spring(moBox2ABody, moBox2BBody, {
    restLength: 2,
    stiffness: 18,
    damping: 1,
  })
  // バネの可視化
  const viSpringBox2Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viSpringBox2Points = [];
  viSpringBox2Points.push( moBox2ABody.position );
  viSpringBox2Points.push( moBox2BBody.position );
  const viSpringBox2Geo = new THREE.BufferGeometry().setFromPoints(viSpringBox2Points);
  const viSpringBox2Line = new THREE.Line(viSpringBox2Geo, viSpringBox2Mtr);
  scene.add(viSpringBox2Line);

  const moBox3AShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
  const moBox3ABody = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(5, 6, 0) })
  moBox3ABody.addShape(moBox3AShape)
  world.addBody(moBox3ABody)
  const viBox3AGeo = new THREE.BoxGeometry(4, 1, 2,  4, 1, 2);
  const viBox3AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox3AMesh = new THREE.Mesh(viBox3AGeo, viBox3AMtr);
  viBox3AMesh.position.copy(moBox3ABody.position);
  viBox3AMesh.quaternion.copy(moBox3ABody.quaternion);
  scene.add(viBox3AMesh);
  //
  const moBox3BShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
  const moBox3BBody = new CANNON.Body({ mass: 1, position: new CANNON.Vec3(5, 1, 0) })
  moBox3BBody.addShape(moBox3BShape)
  world.addBody(moBox3BBody)
  const viBox3BGeo = new THREE.BoxGeometry(4, 1, 2,  4, 1, 2);
  const viBox3BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox3BMesh = new THREE.Mesh(viBox3BGeo, viBox3BMtr);
  viBox3BMesh.position.copy(moBox3BBody.position);
  viBox3BMesh.quaternion.copy(moBox3BBody.quaternion);
  scene.add(viBox3BMesh);
  // バネの接続位置をBox3B については右手前 上部の角にする
  const moSpringBox3 = new CANNON.Spring(moBox3ABody, moBox3BBody, {
    localAnchorB: new CANNON.Vec3(2, 0.5, 1),
    restLength: 2,
    stiffness: 18,
    damping: 1,
  })
  // バネの可視化
  const viSpringBox3Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viSpringBox3Points = [];
  viSpringBox3Points.push( moBox3ABody.position );
  var spring3Bposi = new CANNON.Vec3(-2, -0.5, 1).vadd(moBox3BBody.position);
  viSpringBox3Points.push( spring3Bposi);
  const viSpringBox3Geo = new THREE.BufferGeometry().setFromPoints(viSpringBox3Points);
  const viSpringBox3Line = new THREE.Line(viSpringBox3Geo, viSpringBox3Mtr);
  scene.add(viSpringBox3Line);

  const moBox4AShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
  const moBox4ABody = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(0, 6, -20) })
  moBox4ABody.addShape(moBox4AShape)
  world.addBody(moBox4ABody)
  const viBox4AGeo = new THREE.BoxGeometry(4, 1, 2,  4, 1, 2);
  const viBox4AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox4AMesh = new THREE.Mesh(viBox4AGeo, viBox4AMtr);
  viBox4AMesh.position.copy(moBox4ABody.position);
  viBox4AMesh.quaternion.copy(moBox4ABody.quaternion);
  scene.add(viBox4AMesh);
  //
  const moBox4BShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
  const moBox4BBody = new CANNON.Body({ mass: 2000, position: new CANNON.Vec3(0, 1, -20), linearDamping: 0, angularDamping: 0 })
  moBox4BBody.addShape(moBox4BShape)
  world.addBody(moBox4BBody)
  const viBox4BGeo = new THREE.BoxGeometry(4, 1, 2,  4, 1, 2);
  const viBox4BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox4BMesh = new THREE.Mesh(viBox4BGeo, viBox4BMtr);
  viBox4BMesh.position.copy(moBox4BBody.position);
  viBox4BMesh.quaternion.copy(moBox4BBody.quaternion);
  scene.add(viBox4BMesh);
  // バネを付ける
  const moSpringBox4 = new CANNON.Spring(moBox4ABody, moBox4BBody, {
    restLength: 2,
    stiffness: 18000,
    damping: 0,
  })
  // バネの可視化
  const viSpringBox4Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viSpringBox4Points = [];
  viSpringBox4Points.push( moBox4ABody.position );
  viSpringBox4Points.push( moBox4BBody.position );
  const viSpringBox4Geo = new THREE.BufferGeometry().setFromPoints(viSpringBox4Points);
  const viSpringBox4Line = new THREE.Line(viSpringBox4Geo, viSpringBox4Mtr);
  scene.add(viSpringBox4Line);

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

    // 球（移動）
    viSphereMesh.position.copy(moSphereBody.position);
    viSphereMesh.quaternion.copy(moSphereBody.quaternion);

    // Box
    viBoxMesh.position.copy(moBoxBody.position);
    viBoxMesh.quaternion.copy(moBoxBody.quaternion);

    viBox2AMesh.position.copy(moBox2ABody.position);
    viBox2AMesh.quaternion.copy(moBox2ABody.quaternion);
    viBox2BMesh.position.copy(moBox2BBody.position);
    viBox2BMesh.quaternion.copy(moBox2BBody.quaternion);
    moSpringBox2.applyForce();
    viSpringBox2Points[1].copy(moBox2BBody.position);
    viSpringBox2Geo.setFromPoints(viSpringBox2Points);

    viBox3AMesh.position.copy(moBox3ABody.position);
    viBox3AMesh.quaternion.copy(moBox3ABody.quaternion);
    viBox3BMesh.position.copy(moBox3BBody.position);
    viBox3BMesh.quaternion.copy(moBox3BBody.quaternion);
    moSpringBox3.applyForce();
    // moBox3BBodyの姿勢(クォータニオン）から接続位置(localAnchorB)の 局所位置vvを取得
    var vv = moBox3BBody.quaternion.vmult(moSpringBox3.localAnchorB);
    // moBox3BBodyの中心位置を 局所位置vv に加えて世界座標を求める
    vv = vv.vadd(moBox3BBody.position);
    // スプリングのＢ端を更新して描画
    viSpringBox3Points[1] = vv;
    viSpringBox3Geo.setFromPoints(viSpringBox3Points);

    viBox4AMesh.position.copy(moBox4ABody.position);
    viBox4AMesh.quaternion.copy(moBox4ABody.quaternion);
    viBox4BMesh.position.copy(moBox4BBody.position);
    viBox4BMesh.quaternion.copy(moBox4BBody.quaternion);
    moSpringBox4.applyForce();
    viSpringBox4Points[1].copy(moBox4BBody.position);
    viSpringBox4Geo.setFromPoints(viSpringBox4Points);

    // カメラ・視点 関連
    var vposi = moSphereBody.position;
    var vquat = moSphereBody.quaternion;
    if (cameraPosi == 0) {
      // カスタムなの自動回転
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
https://pmndrs.github.io/cannon-es/docs/

*/

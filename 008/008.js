// mode:javascript

// 下記を参考に..
// - cannon.es 本家、RaycastVehicleのデモ
//   ...

// - 9_0
//   - ローカル化
// - 9_1
//   - この js に集約、cannon, threee, OrbitControls 以外の排除／本質的な成分のみ残す
// - 9_2
//   - カメラ視点追加(c)
//   - ボール（目印）追加
//   - 自車の姿勢修正(r)
// - 9_3
//   - 最新ライブラリ対応(cannon-es@0.20.0, three@0.165.0)

// - 9_5
//   - 手順 変数名の統一

// - 9_5_1
//   - 変数名の統一
// - 9_5_2
//   - カメラ視点の変更

// - 9_5_99
//   - 床に四角を置いて、テクスチャを張る

//   - 凹凸に、テクスチャを張る

//   - xx 床ブロック(3x3)にイベントリスナ  .. 失敗。使いまわしたときに車とのイベントが無くなるっぽい（曲がらない、すべるだけ)

//   - 床ブロック(3x3) + 移動検出のための透明ブロック配置 は無駄なので
//                       移動検出のために座標値で判断
//
//     ??? 移動させたパネル・ブロックで 車が動かない(アクセルもハンドルも効かない)・慣性で滑っていくだけ
//         - world.defaultContactMaterial.friction = 0.3 にすると止まる、この摩擦係数は効いている
//         - よくわからん。。
//         - 新規に作り直してもダメっぽい
//         - 考え方は面白かったけど残念
//
//      思ったほど省メモリにならないっぽい？
//      分割時に 40MB, ビックサイズで 40MB で　ほぼ変わらず
//
//      無限に続くマップの実現する方法として期待してたけど..

// - 9_5_4
//   - 「沈む」を確認する
//     - 球は沈む
//
//     - 立方体は沈む  .. 姿勢が安定していない
//                        沼地に沈んだ感じ
//
//     - 直方体は沈む  .. 船っぽい感じ
//
//     - 車（ホイール）は沈まない、傾くと沈む  別扱い？
//
//     重さ(mass)を調整すれば 潜水艦も可能か？
//
//      軌跡、泡沫、が難しい...テクスチャを重ねる？


//
//       ↑(画面上):y  : 逆向きに重力
//       │
//       │
//       │＿＿＿＿→ (画面右):x
//      ／          
//    ／
//  (画面手前):z

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
    spotLight.position.set(-30, 40, 30)
    spotLight.target.position.set(0, 0, 0)

    spotLight.castShadow = true

    spotLight.shadow.camera.near = 10
    spotLight.shadow.camera.far = 100
    spotLight.shadow.camera.fov = 30

    // spotLight.shadow.bias = -0.0001
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

  // Build the car chassis
  const moChassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
  const moChassisBody = new CANNON.Body({ mass: 150 })
  moChassisBody.addShape(moChassisShape)
  const viChassisGeo = new THREE.BoxGeometry(4, 1, 2);
  const viChassisMtr = new THREE.MeshNormalMaterial();
  const viChassisMesh = new THREE.Mesh(viChassisGeo, viChassisMtr);
  viChassisMesh.position.copy(moChassisBody.position);
  viChassisMesh.quaternion.copy(moChassisBody.quaternion);
  scene.add(viChassisMesh);

  // Create the vehicle
  const moVehicle = new CANNON.RaycastVehicle({
      chassisBody: moChassisBody,
      sliding: false,
  })

  const wheelOptions = {
    radius: 0.8,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 1.4,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000, //        ／強い：車体が上がる、ウィリーしやすい？アンダーが出やすい
    // maxSuspensionForce: 100, // サスペンション：弱：ホイールが車体にめり込む、オーバーステアになりがち
    rollInfluence: 0.01,
    axleLocal: new CANNON.Vec3(0, 0, 1),
    chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true,
  }

  wheelOptions.chassisConnectionPointLocal.set(-2, 0, 1.5)
  moVehicle.addWheel(wheelOptions)
  wheelOptions.chassisConnectionPointLocal.set(-2, 0, -1.5)
  moVehicle.addWheel(wheelOptions)
  wheelOptions.chassisConnectionPointLocal.set(2, 0, 1.8)
  moVehicle.addWheel(wheelOptions)
  wheelOptions.chassisConnectionPointLocal.set(2, 0, -1.8)
  moVehicle.addWheel(wheelOptions)

  moVehicle.addToWorld(world)

  // Add the wheel bodies
  const moWheelMtr = new CANNON.Material('wheel');
  const moWheelBodies = [];
  const viWheelMeshes = [];
  moVehicle.wheelInfos.forEach((wheel) => {
    const moWheelShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
    const moWheelBody = new CANNON.Body({
      mass: 100,
      material: moWheelMtr,
    })
    const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0)
    moWheelBody.addShape(moWheelShape, new CANNON.Vec3(), quaternion)
    moWheelBodies.push(moWheelBody)
    const viWheelGeo = new THREE.CylinderGeometry(wheel.radius, wheel.radius, wheel.radius / 2, 20);
    viWheelGeo.rotateX(Math.PI/2);
    const viWheelMtr = new THREE.MeshNormalMaterial({wireframe:true});
    const viWheelMesh = new THREE.Mesh(viWheelGeo, viWheelMtr);
    scene.add(viWheelMesh);
    viWheelMeshes.push(viWheelMesh);

    world.addBody(moWheelBody)
  })

  // Update the wheel bodies
  world.addEventListener('postStep', () => {
    for (let i = 0; i < moVehicle.wheelInfos.length; i++) {
      moVehicle.updateWheelTransform(i)
      const transform = moVehicle.wheelInfos[i].worldTransform
      const moWheelBody = moWheelBodies[i]
      moWheelBody.position.copy(transform.position)
      moWheelBody.quaternion.copy(transform.quaternion)
    }
  })

  // 長方形の台を地面代わりにするテスト(1) 沈み込み確認のため、厚みを持たせる  /  薄いと抜けて落ちてしまう
  const moGroundMtr = new CANNON.Material('ground')
  const grndw = 100; const grndh = 75;
  const moGround2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(grndw, 20, grndh)),
    position: new CANNON.Vec3(0, -20, 0),
    material: moGroundMtr,
  });
  world.addBody(moGround2Body);
  const viGround2Geo = new THREE.PlaneGeometry(grndw*2, grndh*2);
  viGround2Geo.rotateX(-Math.PI/2);
  const viGround2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4});
  const viGround2Mesh = new THREE.Mesh(viGround2Geo, viGround2Mtr);
  scene.add(viGround2Mesh);


  const wheel_ground = new CANNON.ContactMaterial(moWheelMtr, moGroundMtr, {
    friction: 0.9,  // 摩擦係数(def=0.3)
    restitution: 0,  // 反発係数 (def=0.3)
    // contactEquationStiffness: 1000,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
    contactEquationStiffness: 1e-2,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(wheel_ground)

  // 基準面を作成 (500pixel四方を 50x50分割
  const viBaseGrid = new THREE.GridHelper(500, 50, 0xff8888, 0x404040);
  viBaseGrid.position.set(0, 0, 0);
  scene.add(viBaseGrid);

  // 球 (６割り程沈む)
  const radius = 5;
  // moSphereMtr.restitution = 1;  // 反発係数 1:跳ねやすい  /  0:跳ねない
  const moSphereMtr = new CANNON.Material({name: 'name2', restitution: 0});
  const moSphereBody = new CANNON.Body({
    mass: 7000,
    shape: new CANNON.Sphere(radius),
    position: new CANNON.Vec3(-6, 3, -6),
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
    // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう  対象の重さと関係あり
    contactEquationStiffness: 1e4,
  })
  world.addContactMaterial(sphere_ground)

  // 球 (沈まない／床で跳ねる)
  const radius1 = 2;
  const moSphere1Mtr = new CANNON.Material({restitution: 1});
  const moSphere1Body = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Sphere(radius1),
    position: new CANNON.Vec3(4, 3, -6),
    material: moSphere1Mtr
  });
  world.addBody(moSphere1Body);
  const viSphere1Geo = new THREE.SphereGeometry(radius1);
  const viSphere1Mtr = new THREE.MeshNormalMaterial();
  const viSphere1Mesh = new THREE.Mesh(viSphere1Geo, viSphere1Mtr);
  scene.add(viSphere1Mesh);
  const sphere1_ground = new CANNON.ContactMaterial(moSphere1Mtr, moGroundMtr, {
    friction: 0.9,  // 摩擦係数(def=0.3)
    restitution: 0.9,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e7,  // 剛性(def=1e7)
  })
  world.addContactMaterial(sphere1_ground)

  // 球 (床をすり抜ける)
  const radius2 = 2;
  const moSphere2Mtr = new CANNON.Material({restitution: 1});
  const moSphere2Body = new CANNON.Body({
    mass: 20000,
    shape: new CANNON.Sphere(radius2),
    position: new CANNON.Vec3(10, 3, -6),
    material: moSphere2Mtr
  });
  world.addBody(moSphere2Body);
  const viSphere2Geo = new THREE.SphereGeometry(radius2);
  const viSphere2Mtr = new THREE.MeshNormalMaterial();
  const viSphere2Mesh = new THREE.Mesh(viSphere2Geo, viSphere2Mtr);
  scene.add(viSphere2Mesh);
  const sphere2_ground = new CANNON.ContactMaterial(moSphere2Mtr, moGroundMtr, {
    friction: 0.9,  // 摩擦係数(def=0.3)
    restitution: 0.0,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e4,  // 剛性(def=1e7)
  })
  world.addContactMaterial(sphere2_ground)

  // Box 作成
  const moBoxMtr = new CANNON.Material('box')
  const moBoxBody = new CANNON.Body({
    mass: 1000,
    shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
    position: new CANNON.Vec3(2, 3, 2),
    material: moBoxMtr,
  });
  world.addBody(moBoxBody);
  const viBoxGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBoxMtr = new THREE.MeshNormalMaterial();
  const viBoxMesh = new THREE.Mesh(viBoxGeo, viBoxMtr);
  scene.add(viBoxMesh);
  viBoxMesh.position.copy(moBoxBody.position);
  viBoxMesh.quaternion.copy(moBoxBody.quaternion);
  const box_ground = new CANNON.ContactMaterial(moBoxMtr, moGroundMtr, {
    friction: 0.9,  // 摩擦係数(def=0.3)
    restitution: 0.0,  // 反発係数 (def=0.3)
    contactEquationStiffness: 2000,
  })
  world.addContactMaterial(box_ground)

  // Box2 作成
  const moBox2Mtr = new CANNON.Material('box2')
  const moBox2Body = new CANNON.Body({
    mass: 1000,
    shape: new CANNON.Box(new CANNON.Vec3(5, 0.5, 2)),
    position: new CANNON.Vec3(2, 1, 12),
    material: moBox2Mtr,
  });
  world.addBody(moBox2Body);
  const viBox2Geo = new THREE.BoxGeometry(10, 1, 4);
  const viBox2Mtr = new THREE.MeshNormalMaterial();
  const viBox2Mesh = new THREE.Mesh(viBox2Geo, viBoxMtr);
  scene.add(viBox2Mesh);
  viBox2Mesh.position.copy(moBox2Body.position);
  viBox2Mesh.quaternion.copy(moBox2Body.quaternion);
  const box2_ground = new CANNON.ContactMaterial(moBox2Mtr, moGroundMtr, {
    friction: 0.9,  // 摩擦係数(def=0.3)
    restitution: 0.0,  // 反発係数 (def=0.3)
    contactEquationStiffness: 2000,
  })
  world.addContactMaterial(box2_ground)

  var cameraPosi = -1;

  // Keybindings
  // Add force on keydown
  document.addEventListener('keydown', (event) => {
    const maxSteerVal = 0.5
    const maxForce = 1000
    const brakeForce = 1000000

    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        moVehicle.applyEngineForce(-maxForce, 2)
        moVehicle.applyEngineForce(-maxForce, 3)
        break
      case 's':
      case 'ArrowDown':
        moVehicle.applyEngineForce(maxForce, 2)
        moVehicle.applyEngineForce(maxForce, 3)
        break

      case 'a':
      case 'ArrowLeft':
        moVehicle.setSteeringValue(maxSteerVal, 0)
        moVehicle.setSteeringValue(maxSteerVal, 1)
        break
      case 'd':
      case 'ArrowRight':
        moVehicle.setSteeringValue(-maxSteerVal, 0)
        moVehicle.setSteeringValue(-maxSteerVal, 1)
        break

      case 'b':
        moVehicle.setBrake(brakeForce, 0)
        moVehicle.setBrake(brakeForce, 1)
        moVehicle.setBrake(brakeForce, 2)
        moVehicle.setBrake(brakeForce, 3)
        break

      case 'c':
        cameraPosi = (cameraPosi + 1) % 5;
        break;

      case 'r':
        // 車をひっくり返す ..
        // 車を持ち上げ
        moVehicle.chassisBody.position.y += 5;
        // 進行方向（回転角Y）を使い、方向を初期化
        var vquat = moVehicle.chassisBody.quaternion;
        var veuler = new CANNON.Vec3(0, 0, 0);
        vquat.toEuler(veuler);
        var ry = veuler.y;
        const carInitQuat = new CANNON.Quaternion();
        carInitQuat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), ry);
        moVehicle.chassisBody.quaternion.copy(carInitQuat);
        break;
    }
  })

  // Reset force on keyup
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        moVehicle.applyEngineForce(0, 2)
        moVehicle.applyEngineForce(0, 3)
        break
      case 's':
      case 'ArrowDown':
        moVehicle.applyEngineForce(0, 2)
        moVehicle.applyEngineForce(0, 3)
        break

      case 'a':
      case 'ArrowLeft':
        moVehicle.setSteeringValue(0, 0)
        moVehicle.setSteeringValue(0, 1)
        break
      case 'd':
      case 'ArrowRight':
        moVehicle.setSteeringValue(0, 0)
        moVehicle.setSteeringValue(0, 1)
        break

      case 'b':
        moVehicle.setBrake(0, 0)
        moVehicle.setBrake(0, 1)
        moVehicle.setBrake(0, 2)
        moVehicle.setBrake(0, 3)
        break
    }
  })

  // 初期位置
  {
    // init position  / サーキットに合わせた位置
    moVehicle.chassisBody.position.set(-10, 10, -50)
    const carInitQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
    moVehicle.chassisBody.quaternion.copy(carInitQuat);

    //
    var px = moVehicle.chassisBody.position.x;
    var py = moVehicle.chassisBody.position.y;
    var pz = moVehicle.chassisBody.position.z;

    camera.position.set(px, py, pz+100);
    camera.lookAt(new THREE.Vector3(px, py, pz));
    // 
    moSphereBody.position.x = -6;
    moSphereBody.position.z = -6;
  }

  var iroty = 0;
  function animate() {
    requestAnimationFrame(animate)

    const timeStep = 1 / 60;
    world.step(timeStep)

    // 球（移動）
    viSphereMesh.position.copy(moSphereBody.position);
    viSphereMesh.quaternion.copy(moSphereBody.quaternion);

    viSphere1Mesh.position.copy(moSphere1Body.position);
    viSphere1Mesh.quaternion.copy(moSphere1Body.quaternion);

    viSphere2Mesh.position.copy(moSphere2Body.position);
    viSphere2Mesh.quaternion.copy(moSphere2Body.quaternion);

    viBoxMesh.position.copy(moBoxBody.position);
    viBoxMesh.quaternion.copy(moBoxBody.quaternion);

    viBox2Mesh.position.copy(moBox2Body.position);
    viBox2Mesh.quaternion.copy(moBox2Body.quaternion);

    // 車関連
    viChassisMesh.position.copy(moChassisBody.position);
    viChassisMesh.quaternion.copy(moChassisBody.quaternion);
    for (let i = 0; i < moVehicle.wheelInfos.length; i++) {
      const transform = moVehicle.wheelInfos[i].worldTransform;
      const viWheelMesh = viWheelMeshes[i];
      viWheelMesh.position.copy(transform.position);
      viWheelMesh.quaternion.copy(transform.quaternion);
    }

    // カメラ・視点 関連
    var vposi = moVehicle.chassisBody.position;
    var vquat = moVehicle.chassisBody.quaternion;

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
      // // OrbitControls の自動回転
      orbitControls.autoRotate = true;
      orbitControls.target = new THREE.Vector3(vposi.x, vposi.y, vposi.z);
      orbitControls.update();

    } else {
      // _cameraPosi == 4
      // OrbitControls のマウス操作に任せる
      orbitControls.autoRotate = false;
      orbitControls.update();
    }

    renderer.render(scene, camera)
  }

  animate();
};


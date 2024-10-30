// mode:javascript

// 下記を参考に..
// - cannon.es 本家、RaycastVehicleのデモ
//   ...

// - 12_5
//    - ショベルカー、アームを２節とバケットを作成
//    - 資材を置いて、すくって、移動させるテスト
//      - 処理が遅い
//      - アームが振り子のように揺れる .. 確認できたので良し!!
//
//    ? 資材をブロック状にくみ上げているつもりだが、崩れる
//       < 配置位置が浮いている？、落下して

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

  // Build the car chassis
  const moChassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 0.8))
  const moChassisBody = new CANNON.Body({
    mass: 150,
    shape: moChassisShape,
    position: new CANNON.Vec3(0, 1, 0),
  })
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
    radius: 0.5,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 1.4,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000, //        ／強い：車体が上がる、ウィリーしやすい？アンダーが出やすい
    rollInfluence: 0.01,
    axleLocal: new CANNON.Vec3(0, 0, 1),
    chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true,
  }

  // 埋め込む場合
  wheelOptions.chassisConnectionPointLocal.set(-1, 0, 1)
  moVehicle.addWheel(wheelOptions)
  wheelOptions.chassisConnectionPointLocal.set(-1, 0, -1)
  moVehicle.addWheel(wheelOptions)
  wheelOptions.chassisConnectionPointLocal.set(1, 0, 1)
  moVehicle.addWheel(wheelOptions)
  wheelOptions.chassisConnectionPointLocal.set(1, 0, -1)
  moVehicle.addWheel(wheelOptions)
  moVehicle.addToWorld(world)

  // Add the wheel bodies
  const moWheelMtr = new CANNON.Material('wheel');
  const moWheelBodies = [];
  const viWheelMeshes = [];
  const viWheelGeos = [];
  moVehicle.wheelInfos.forEach((wheel) => {
    const moWheelShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius *0.5, 20)
    const moWheelBody = new CANNON.Body({
      mass: 0,
      material: moWheelMtr,
    })
    moWheelBody.type = CANNON.Body.KINEMATIC
    moWheelBody.collisionFilterGroup = 0 // turn off collisions  .. ホイールがめり込んでいるから必須
    const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0)
    moWheelBody.addShape(moWheelShape, new CANNON.Vec3(), quaternion)
    moWheelBodies.push(moWheelBody)
    const viWheelGeo = new THREE.CylinderGeometry(wheel.radius, wheel.radius, wheel.radius *0.5, 20);
    viWheelGeo.rotateX(Math.PI/2);
    const viWheelMtr = new THREE.MeshNormalMaterial({wireframe:true});
    const viWheelMesh = new THREE.Mesh(viWheelGeo, viWheelMtr);
    scene.add(viWheelMesh);
    viWheelMeshes.push(viWheelMesh);
    viWheelGeos.push(viWheelGeo);
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


  // ショベルカーは
  // 回転台、腕２つ、バケット から構成する
  // hingeには
  //  車と回転台のY軸回転（方位角）
  //  回転台と腕（１）のZ軸回転（仰角）
  //  腕（１）と腕（２）のZ軸回転（仰角）
  //  腕（２）とバケットのZ軸回転（仰角）

  const moShovelMtr = new CANNON.Material('cannon')

  // 回転台
  const moShovelfoundShape = new CANNON.Box(new CANNON.Vec3(0.4, 0.2, 0.4))
  const moShovelfoundBody = new CANNON.Body({
    mass: 0.2,
    shape: moShovelfoundShape,
    position: new CANNON.Vec3(0, 5, 0),
    // type: CANNON.Body.KINEMATIC,
    collisionFilterGroup: 0,  // 回転台と腕が埋まる／重なるように
    material: moShovelMtr,
  })
  world.addBody(moShovelfoundBody)
  const viShovelfoundGeo = new THREE.BoxGeometry(0.8, 0.4, 0.8);
  const viShovelfoundMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viShovelfoundMesh = new THREE.Mesh(viShovelfoundGeo, viShovelfoundMtr);
  viShovelfoundMesh.position.copy(moShovelfoundBody.position);
  viShovelfoundMesh.quaternion.copy(moShovelfoundBody.quaternion);
  scene.add(viShovelfoundMesh);

  // 車体と回転台をヒンジ（旋回方向）でつなぐ
  const moVehicleShovelfoundConst = new CANNON.HingeConstraint(moChassisBody, moShovelfoundBody, {
    axisA: CANNON.Vec3.UNIT_Y,
    axisB: CANNON.Vec3.UNIT_Y,
    pivotA: new CANNON.Vec3(0, 0.5, 0),
    pivotB: new CANNON.Vec3(0, -0.2, 0),
  });
  world.addConstraint(moVehicleShovelfoundConst);
  moVehicleShovelfoundConst.enableMotor();

  // 腕（１）
  const moArm1Shape = new CANNON.Box(new CANNON.Vec3(2.2, 0.1, 0.1))
  const moArm1Body = new CANNON.Body({
    mass: 0.001,
    shape: moArm1Shape,
    position: new CANNON.Vec3(-2.2, 7, 0),
    // collisionFilterGroup: 0,  // 腕が車体に埋まらないよう comment out
    material: moShovelMtr,
    // angularDamping: 0.99, // def=0.01,  // これでは 腕が徐々に下がるのを制御できない
    // linearDamping: 0.99, // def=0.01,
  })
  world.addBody(moArm1Body)
  const viArm1Geo = new THREE.BoxGeometry(4.4, 0.2, 0.2);
  const viArm1Mtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viArm1Mesh = new THREE.Mesh(viArm1Geo, viArm1Mtr);
  viArm1Mesh.position.copy(moArm1Body.position);
  viArm1Mesh.quaternion.copy(moArm1Body.quaternion);
  scene.add(viArm1Mesh);

  const moVehicleArm1Const = new CANNON.HingeConstraint(moShovelfoundBody, moArm1Body, {
    axisA: CANNON.Vec3.UNIT_Z,
    axisB: CANNON.Vec3.UNIT_Z,
    pivotA: new CANNON.Vec3(0, 0, 0),
    pivotB: new CANNON.Vec3(2, 0, 0), // 重心からずらして結合すると、砲身が徐々に下がる（重さmassにも関係
  });
  world.addConstraint(moVehicleArm1Const);
  moVehicleArm1Const.enableMotor();

  // 腕（２）
  const moArm2Shape = new CANNON.Box(new CANNON.Vec3(2.2, 0.1, 0.1))
  const moArm2Body = new CANNON.Body({
    mass: 0.001,
    shape: moArm2Shape,
    position: new CANNON.Vec3(-6.6, 7, 0),
    // collisionFilterGroup: 0,  // 腕が車体に埋まらないよう comment out
    material: moShovelMtr,
    // angularDamping: 0.99, // def=0.01,  // これでは 腕が徐々に下がるのを制御できない
    // linearDamping: 0.99, // def=0.01,
  })
  world.addBody(moArm2Body)
  const viArm2Geo = new THREE.BoxGeometry(4.4, 0.2, 0.2);
  const viArm2Mtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viArm2Mesh = new THREE.Mesh(viArm2Geo, viArm2Mtr);
  viArm2Mesh.position.copy(moArm2Body.position);
  viArm2Mesh.quaternion.copy(moArm2Body.quaternion);
  scene.add(viArm2Mesh);

  const moVehicleArm2Const = new CANNON.HingeConstraint(moArm1Body, moArm2Body, {
    axisA: CANNON.Vec3.UNIT_Z,
    axisB: CANNON.Vec3.UNIT_Z,
    pivotA: new CANNON.Vec3(-2, 0, 0),
    pivotB: new CANNON.Vec3(2, 0, 0), // 重心からずらして結合すると、腕が徐々に下がる（重さmassにも関係
  });
  world.addConstraint(moVehicleArm2Const);
  moVehicleArm2Const.enableMotor();

  // バケット
  // 
  // 簡単のため Boxを板代わりにして、４枚くっつける
  const moBucketBody = new CANNON.Body({
    mass: 0.001,
    position: new CANNON.Vec3(-7, 7, 0),
    collisionFilterGroup: 1,
    material: moShovelMtr,
  })
  moBucketBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 0.01, 1)),  // 上面
                        new CANNON.Vec3(0, 1, 0))
  moBucketBody.addShape(new CANNON.Box(new CANNON.Vec3(0.01, 1, 1)),  // 奥面
                        new CANNON.Vec3(-1, 0, 0))
  moBucketBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 0.01)),  // 右面
                        new CANNON.Vec3( 0, 0, -1))
  moBucketBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 0.01)),
                        new CANNON.Vec3( 0, 0, 1))
  world.addBody(moBucketBody)
  const viBucketMesh = new THREE.Group()
  const viBucketMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBucket1Geo = new THREE.BoxGeometry(2, 0.02, 2);
  const viBucket1Mesh = new THREE.Mesh(viBucket1Geo, viBucketMtr);
  viBucketMesh.add(viBucket1Mesh);
  viBucket1Mesh.position.copy(new THREE.Vector3(0, 1, 0));

  const viBucket2Geo = new THREE.BoxGeometry(0.02, 2, 2);
  const viBucket2Mesh = new THREE.Mesh(viBucket2Geo, viBucketMtr);
  viBucketMesh.add(viBucket2Mesh);
  viBucket2Mesh.position.copy(new THREE.Vector3(-1, 0, 0));

  const viBucket3Geo = new THREE.BoxGeometry(2, 2, 0.02);
  const viBucket3Mesh = new THREE.Mesh(viBucket3Geo, viBucketMtr);
  viBucketMesh.add(viBucket3Mesh);
  viBucket3Mesh.position.copy(new THREE.Vector3(0, 0, -1));

  const viBucket4Geo = new THREE.BoxGeometry(2, 2, 0.02);
  const viBucket4Mesh = new THREE.Mesh(viBucket4Geo, viBucketMtr);
  viBucketMesh.add(viBucket4Mesh);
  viBucket4Mesh.position.copy(new THREE.Vector3(0, 0, 1));

  viBucketMesh.position.copy(moBucketBody.position);
  viBucketMesh.quaternion.copy(moBucketBody.quaternion);
  scene.add(viBucketMesh);

  const moVehicleBucketConst = new CANNON.HingeConstraint(moArm2Body, moBucketBody, {
    axisA: CANNON.Vec3.UNIT_Z,
    axisB: CANNON.Vec3.UNIT_Z,
    pivotA: new CANNON.Vec3(-2.2, 0, 0),
    pivotB: new CANNON.Vec3(1, 1, 0),
  });
  world.addConstraint(moVehicleBucketConst);
  moVehicleBucketConst.enableMotor();


  // 長方形の台を地面代わりに
  const grndw = 100; const grndh = 75;
  const moGroundMtr = new CANNON.Material({name: 'ground'})
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


  const wheel_ground = new CANNON.ContactMaterial(moWheelMtr, moGroundMtr, {
    friction: 0.9,  // 摩擦係数(def=0.3)
    restitution: 0, // 0,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e7,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(wheel_ground)

  // 基準面を作成 (500pixel四方を 50x50分割
  const viBaseGrid = new THREE.GridHelper(200, 20, 0xff8888, 0x404040);
  viBaseGrid.position.set(0, 0, 0);
  scene.add(viBaseGrid);

  // ショベルカー、運搬対象用の資材を用意
  //   デフォルトのままだと滑り落ちるので、反発と抵抗をいじっておく
  const moBoxMtr = new CANNON.Material({name: 'box3', restitution: 0, friction: 1e7});
  var viBoxMeshs = [];
  var moBoxBodys = [];
  for (let z = 0; z < 10; ++z) {
    for (let y = 0; y < 10; ++y) {
      for (let x = 0; x < 10; ++x) {
        const moBoxBody = new CANNON.Body({
          mass: 0.00001,   // 軽くしないと拾えない
          shape: new CANNON.Box(new CANNON.Vec3(0.05, 0.05, 0.05)),
          position: new CANNON.Vec3(x*0.1, y*0.1+0.05, z*0.1 + 3),
          material: moBoxMtr
        });
        world.addBody(moBoxBody);
        const viBoxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const viBoxMtr = new THREE.MeshNormalMaterial();
        const viBoxMesh = new THREE.Mesh(viBoxGeo, viBoxMtr);
        viBoxMesh.position.copy(moBoxBody.position);
        viBoxMesh.quaternion.copy(moBoxBody.quaternion);
        scene.add(viBoxMesh);
        viBoxMeshs.push(viBoxMesh);
        moBoxBodys.push(moBoxBody);
      }
    }
  }

  const box_ground = new CANNON.ContactMaterial(moBoxMtr, moGroundMtr, {
    friction: 1,  // 摩擦係数(def=0.3)
    restitution: 0,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e14,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(box_ground)

  var sidebrake = 0;
  var cameraPosi = -1;

  var moBullets = [];
  var viBullets = [];

  // Keybindings
  // Add force on keydown
  document.addEventListener('keydown', (event) => {
    const maxSteerVal = 0.5
    const maxForce = 1000
    const brakeForce = 1000000

    switch (event.key) {
      case 'ArrowUp':
        moVehicle.applyEngineForce(-maxForce, 2)
        moVehicle.applyEngineForce(-maxForce, 3)
        break
      case 'ArrowDown':
        moVehicle.applyEngineForce(maxForce, 2)
        moVehicle.applyEngineForce(maxForce, 3)
        break
      case 'ArrowLeft':
        moVehicle.setSteeringValue(maxSteerVal, 0)
        moVehicle.setSteeringValue(maxSteerVal, 1)
        break
      case 'ArrowRight':
        moVehicle.setSteeringValue(-maxSteerVal, 0)
        moVehicle.setSteeringValue(-maxSteerVal, 1)
        break

      case 'w':
        // 腕（１）の回転（仰角方向）／腕を持ち上げる
        moVehicleArm1Const.setMotorSpeed(1);
        break
      case 's':
        // 腕（１）の回転（仰角方向）／腕をおろす
        moVehicleArm1Const.setMotorSpeed(-1);
        break
      case 'e':
        // 腕（２）の回転（仰角方向）／腕を持ち上げる
        moVehicleArm2Const.setMotorSpeed(1);
        break
      case 'd':
        // 腕（２）の回転（仰角方向）／腕をおろす
        moVehicleArm2Const.setMotorSpeed(-1);
        break
      case 'r':
        // バケットの回転（仰角方向）／バケットを持ち上げる
        moVehicleBucketConst.setMotorSpeed(1);
        break
      case 'f':
        // バケットの回転（仰角方向）／バケットをおろす
        moVehicleBucketConst.setMotorSpeed(-1);
        break
      case 'a':
        // 回転台の回転（方位方向）を進める／左方向
        moVehicleShovelfoundConst.setMotorSpeed(-1);
        break
      case 'g':
        // 回転台の回転（方位方向）を進める／右方向
        moVehicleShovelfoundConst.setMotorSpeed(1);
        break

      case 'b':
        moVehicle.setBrake(brakeForce, 0)
        moVehicle.setBrake(brakeForce, 1)
        moVehicle.setBrake(brakeForce, 2)
        moVehicle.setBrake(brakeForce, 3)
        break

      case 'n':
        sidebrake = (sidebrake+1) % 2
        if (sidebrake) {
          moVehicle.setBrake(brakeForce/2, 2)
          moVehicle.setBrake(brakeForce/2, 3)
        } else {
          moVehicle.setBrake(0, 2)
          moVehicle.setBrake(0, 3)
        }
        break

      case 'c':
        cameraPosi = (cameraPosi + 1) % 6;
        break;

      case 'p':
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
      case 'ArrowUp':
        moVehicle.applyEngineForce(0, 2)
        moVehicle.applyEngineForce(0, 3)
        break
      case 'ArrowDown':
        moVehicle.applyEngineForce(0, 2)
        moVehicle.applyEngineForce(0, 3)
        break

      case 'ArrowLeft':
        moVehicle.setSteeringValue(0, 0)
        moVehicle.setSteeringValue(0, 1)
        break
      case 'ArrowRight':
        moVehicle.setSteeringValue(0, 0)
        moVehicle.setSteeringValue(0, 1)
        break

      case 'w':
      case 's':
        // 腕（１）の回転（仰角方向）を止める
        moVehicleArm1Const.setMotorSpeed(0);
        break
      case 'e':
      case 'd':
        // 腕（２）の回転（仰角方向）を止める
        moVehicleArm2Const.setMotorSpeed(0);
        break
      case 'r':
      case 'f':
        // バケットの回転（仰角方向）を止める
        moVehicleBucketConst.setMotorSpeed(0);
        break
      case 'a':
      case 'g':
        // 台座の回転（方位方向）を止める
        moVehicleShovelfoundConst.setMotorSpeed(0);
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
    var px = moVehicle.chassisBody.position.x;
    var py = moVehicle.chassisBody.position.y;
    var pz = moVehicle.chassisBody.position.z;

    camera.position.set(px, py, pz+100);
    camera.lookAt(new THREE.Vector3(px, py, pz));
  }

  var iroty = 0;
  function animate() {
    requestAnimationFrame(animate)

    const timeStep = 1 / 60;
    world.step(timeStep)

    // 車関連
    viChassisMesh.position.copy(moChassisBody.position);
    viChassisMesh.quaternion.copy(moChassisBody.quaternion);
    for (let i = 0; i < moVehicle.wheelInfos.length; i++) {
      const transform = moVehicle.wheelInfos[i].worldTransform;
      const viWheelMesh = viWheelMeshes[i];
      viWheelMesh.position.copy(transform.position);
      viWheelMesh.quaternion.copy(transform.quaternion);
    }
    // 車関連(ショベルカーのアーム部分)
    viShovelfoundMesh.position.copy(moShovelfoundBody.position);
    viShovelfoundMesh.quaternion.copy(moShovelfoundBody.quaternion);
    viArm1Mesh.position.copy(moArm1Body.position);
    viArm1Mesh.quaternion.copy(moArm1Body.quaternion);
    viArm2Mesh.position.copy(moArm2Body.position);
    viArm2Mesh.quaternion.copy(moArm2Body.quaternion);
    viBucketMesh.position.copy(moBucketBody.position);
    viBucketMesh.quaternion.copy(moBucketBody.quaternion);

    // 運搬対象用の資材
    for (let i = 0; i < moBoxBodys.length; ++i) {
      viBoxMeshs[i].position.copy(moBoxBodys[i].position);
      viBoxMeshs[i].quaternion.copy(moBoxBodys[i].quaternion);
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
        // 砲身／標準の視点
        //   カメラ位置は砲台のちょっと上
        var vposi2 = moShovelfoundBody.position;
        camera.position.set(vposi2.x, vposi2.y+1, vposi2.z);
        //   カメラ視点(lookAt)は砲身の延長上 100先に
        camera.rotation.z = 0;
        var vposi3 = moArm1Body.quaternion.vmult(new CANNON.Vec3(-1000, 0, 0));
        camera.lookAt(new THREE.Vector3(vposi3.x, vposi3.y, vposi3.z));
    } else if (cameraPosi == 4) {
      // // カスタムなの自動回転
      orbitControls.autoRotate = true;
      orbitControls.target = new THREE.Vector3(vposi.x, vposi.y, vposi.z);
      orbitControls.update();
    } else {
      // _cameraPosi == 5
      // OrbitControls のマウス操作に任せる
      orbitControls.autoRotate = false;
      orbitControls.update();
    }

    renderer.render(scene, camera)
  }

  animate();
};

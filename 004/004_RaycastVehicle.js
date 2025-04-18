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
// - 9_4_1
//   - 座標系変更 z軸に重力
//     - 車をそのまま .. 初期位置が90度傾いた状態
// - 9_4_3
//   - カメラ修正 .. 後背、ドライバーズビューはOK, 上方カメラは修正できず・ガタつく

//       ↑(画面上):y
//       │
//       │
//       │＿＿＿＿→ (画面右):x
//      ／          
//    ／
//  (画面手前):z  : 逆向きに重力

// //
// //       ↑(画面上):y  : 逆向きに重力
// //       │
// //       │
// //       │＿＿＿＿→ (画面右):x
// //      ／          
// //    ／
// //  (画面手前):z

import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "orbitcontrols";

function setupWorld() {
  const world = new CANNON.World()
//  world.gravity.set(0, -10, 0)
  world.gravity.set(0, 0, -10)
  // Sweep and prune broadphase
  world.broadphase = new CANNON.SAPBroadphase(world)
  // Disable friction by default
  world.defaultContactMaterial.friction = 0

  // Demo.initThree
  var camera;
  var scene;
  var renderer;
  var orbitControls;
  {
    const width = window.innerWidth - 24;
    const height = window.innerHeight - 24;

    // Camera
    camera = new THREE.PerspectiveCamera(24, width / height, 5, 2000)

    // camera.up.set(0, 1, 0);  // カメラの中心座標 Y軸を上にする
    camera.up.set(0, 0, 1);  // カメラの中心座標 Z軸を上にする

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
  const chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
  const chassisBody = new CANNON.Body({ mass: 150 })
  chassisBody.addShape(chassisShape)
  // chassisBody.position.set(0, 4, 0)
  chassisBody.position.set(0, 0, 4)
  chassisBody.angularVelocity.set(0, 0.5, 0)
  const thChassisGeo = new THREE.BoxGeometry(4, 1, 2);
  const thChassisMtr = new THREE.MeshNormalMaterial();
  const thChassis = new THREE.Mesh(thChassisGeo, thChassisMtr);
  thChassis.position.copy(chassisBody.position);
  thChassis.quaternion.copy(chassisBody.quaternion);
  scene.add(thChassis);

  // Create the vehicle
  const vehicle = new CANNON.RaycastVehicle({
    chassisBody,
  })

  const wheelOptions = {
    radius: 0.5,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 1.4,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    axleLocal: new CANNON.Vec3(0, 0, 1),
    chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true,
  }

  wheelOptions.chassisConnectionPointLocal.set(-1, 0, 1)
  vehicle.addWheel(wheelOptions)

  wheelOptions.chassisConnectionPointLocal.set(-1, 0, -1)
  vehicle.addWheel(wheelOptions)

  wheelOptions.chassisConnectionPointLocal.set(1, 0, 1)
  vehicle.addWheel(wheelOptions)

  wheelOptions.chassisConnectionPointLocal.set(1, 0, -1)
  vehicle.addWheel(wheelOptions)

  vehicle.addToWorld(world)

  // Add the wheel bodies
  const wheelBodies = []
  const wheelMaterial = new CANNON.Material('wheel')
  const wheelMeshes = [];
  vehicle.wheelInfos.forEach((wheel) => {
    const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
    const wheelBody = new CANNON.Body({
      mass: 0,
      material: wheelMaterial,
    })
    wheelBody.type = CANNON.Body.KINEMATIC
    wheelBody.collisionFilterGroup = 0 // turn off collisions
    const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0)
    wheelBody.addShape(cylinderShape, new CANNON.Vec3(), quaternion)
    wheelBodies.push(wheelBody)
    const thWheelGeo = new THREE.CylinderGeometry(wheel.radius, wheel.radius, wheel.radius / 2, 20);
    thWheelGeo.rotateX(Math.PI/2);
    const thWheelMtr = new THREE.MeshNormalMaterial();
    const thWheel = new THREE.Mesh(thWheelGeo, thWheelMtr);
    scene.add(thWheel);
    wheelMeshes.push(thWheel);

    world.addBody(wheelBody)
  })

  // Update the wheel bodies
  world.addEventListener('postStep', () => {
    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
      vehicle.updateWheelTransform(i)
      const transform = vehicle.wheelInfos[i].worldTransform
      const wheelBody = wheelBodies[i]
      wheelBody.position.copy(transform.position)
      wheelBody.quaternion.copy(transform.quaternion)
    }
  })

  // Add the ground
  const sizeX = 64
  const sizeZ = 64
  const matrix = []
  for (let i = 0; i < sizeX; i++) {
    matrix.push([])
    for (let j = 0; j < sizeZ; j++) {
      if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
        const height = 3
        matrix[i].push(height)
        continue
      }
      const height = Math.cos((i / sizeX) * Math.PI * 5) * Math.cos((j / sizeZ) * Math.PI * 5) * 2 + 2
      matrix[i].push(height)
    }
  }

  const groundMaterial = new CANNON.Material('ground')
  const heightfieldShape = new CANNON.Heightfield(matrix, {
    elementSize: 100 / sizeX,
  })
  const heightfieldBody = new CANNON.Body({ mass: 0, material: groundMaterial })
  heightfieldBody.addShape(heightfieldShape)
  // Y軸重力系
  // heightfieldBody.position.set(
  //   -(sizeX * heightfieldShape.elementSize) / 2,
  //   -1,
  //   (sizeZ * heightfieldShape.elementSize) / 2
  // )
  // heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  // Z軸重力系
  heightfieldBody.position.set(
    -(sizeX * heightfieldShape.elementSize) / 2,
    -(sizeZ * heightfieldShape.elementSize) / 2,
    0
  )
  heightfieldBody.position.z += -20;
  // heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

  world.addBody(heightfieldBody)
  const geometry = new THREE.BufferGeometry();
  {
    let points = [];
    const shape = heightfieldShape;
    const v0 = new CANNON.Vec3()
    const v1 = new CANNON.Vec3()
    const v2 = new CANNON.Vec3()
    for (let xi = 0; xi < shape.data.length - 1; xi++) {
      for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
        for (let k = 0; k < 2; k++) {
          shape.getConvexTrianglePillar(xi, yi, k === 0)
          v0.copy(shape.pillarConvex.vertices[0])
          v1.copy(shape.pillarConvex.vertices[1])
          v2.copy(shape.pillarConvex.vertices[2])
          v0.vadd(shape.pillarOffset, v0)
          v1.vadd(shape.pillarOffset, v1)
          v2.vadd(shape.pillarOffset, v2)
          points.push(new THREE.Vector3(v0.x, v0.y, v0.z),
                      new THREE.Vector3(v1.x, v1.y, v1.z),
                      new THREE.Vector3(v2.x, v2.y, v2.z))
        }
      }
    }
    geometry.setFromPoints(points)
    shape.id = geometry.id;
  }
  const thGroundGeo = geometry;
  const thGroundMtr = new THREE.MeshBasicMaterial({wireframe: true});
  const thGround = new THREE.Mesh(thGroundGeo, thGroundMtr);
  thGround.position.copy(heightfieldBody.position);
  thGround.quaternion.copy(heightfieldBody.quaternion);
  scene.add(thGround);

  // 基準面を作成 (200pixel四方を 20x20分割
  const thBaseGrid = new THREE.GridHelper(200, 20, 0xff8888, 0x404040);
  // Y軸重力系
  // thBaseGrid.position.set(0, 1, 0);
  // Z軸重力系
  // デフォが x-z平面。x-y 平面になるよう x軸で90度回転
  thBaseGrid.rotation.x = Math.PI / 2;
  thBaseGrid.position.set(0, 0, 1);
  scene.add(thBaseGrid);

  // 球 作成
  const radius = 5;
  const sphereBodyMate = new CANNON.Material('name2'); 
  sphereBodyMate.restitution = 1;
  const phSphereBody = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Sphere(radius),
    // position: new CANNON.Vec3(-12, 10, -12),
    position: new CANNON.Vec3(-12, -12, 10),
    material: sphereBodyMate
  });
  world.addBody(phSphereBody);
  const sphereGeometry = new THREE.SphereGeometry(radius);
  const normalMaterial = new THREE.MeshNormalMaterial();
  const thSphereMesh = new THREE.Mesh(sphereGeometry, normalMaterial);
  scene.add(thSphereMesh);


  // Define interactions between wheels and ground
  const wheel_ground = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000,
  })
  world.addContactMaterial(wheel_ground)

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
        vehicle.applyEngineForce(-maxForce, 2)
        vehicle.applyEngineForce(-maxForce, 3)
        break
      case 's':
      case 'ArrowDown':
        vehicle.applyEngineForce(maxForce, 2)
        vehicle.applyEngineForce(maxForce, 3)
        break

      case 'a':
      case 'ArrowLeft':
        vehicle.setSteeringValue(maxSteerVal, 0)
        vehicle.setSteeringValue(maxSteerVal, 1)
        break
      case 'd':
      case 'ArrowRight':
        vehicle.setSteeringValue(-maxSteerVal, 0)
        vehicle.setSteeringValue(-maxSteerVal, 1)
        break

      case 'b':
        vehicle.setBrake(brakeForce, 0)
        vehicle.setBrake(brakeForce, 1)
        vehicle.setBrake(brakeForce, 2)
        vehicle.setBrake(brakeForce, 3)
        break

      case 'c':
        cameraPosi = (cameraPosi + 1) % 5;
        break;

      case 'r':
        // 車をひっくり返す ..
        // 車を持ち上げ
        vehicle.chassisBody.position.z += 5;
        // 進行方向（回転角z）を使い、方向を初期化
        var vquat = vehicle.chassisBody.quaternion;
        var veuler = new CANNON.Vec3(0, 0, 0);
        vquat.toEuler(veuler);
        var rz = veuler.z;
        if (veuler.x < 0) {
          rz = Math.PI - rz;
        }

        const q1 = new CANNON.Quaternion();
        q1.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI/2);
        const q2 = new CANNON.Quaternion();
        q2.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), rz);
        q1 = q1.multiply(q2);
        vehicle.chassisBody.quaternion.copy(q1);
        break;
    }
  })

  // Reset force on keyup
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        vehicle.applyEngineForce(0, 2)
        vehicle.applyEngineForce(0, 3)
        break
      case 's':
      case 'ArrowDown':
        vehicle.applyEngineForce(0, 2)
        vehicle.applyEngineForce(0, 3)
        break

      case 'a':
      case 'ArrowLeft':
        vehicle.setSteeringValue(0, 0)
        vehicle.setSteeringValue(0, 1)
        break
      case 'd':
      case 'ArrowRight':
        vehicle.setSteeringValue(0, 0)
        vehicle.setSteeringValue(0, 1)
        break

      case 'b':
        vehicle.setBrake(0, 0)
        vehicle.setBrake(0, 1)
        vehicle.setBrake(0, 2)
        vehicle.setBrake(0, 3)
        break
    }
  })

  function animate() {
    requestAnimationFrame(animate)

    const timeStep = 1 / 60;
    world.step(timeStep)

    // 球（移動）
    thSphereMesh.position.copy(phSphereBody.position);
    thSphereMesh.quaternion.copy(phSphereBody.quaternion);

    // 車関連
    thChassis.position.copy(chassisBody.position);
    thChassis.quaternion.copy(chassisBody.quaternion);
    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
      const transform = vehicle.wheelInfos[i].worldTransform;
      const thWheel = wheelMeshes[i];
      thWheel.position.copy(transform.position);
      thWheel.quaternion.copy(transform.quaternion);
    }

    // カメラ・視点 関連
    var vposi = vehicle.chassisBody.position;
    var vquat = vehicle.chassisBody.quaternion;

    if (cameraPosi == 0) {
      // // 後背からビュー / 車の後方位置から正面に向けて
      // 車がX軸負の方向を向いている前提で、
      // 後方の視点（23,5,0）にQuatをかけ合わせ、相対位置の「後方の視点」vvを求める
      var vv = vquat.vmult(new CANNON.Vec3(23, 5, 0));  // 後方、高さ、左右
      camera.position.set(vposi.x + vv.x, vposi.y + vv.y, vposi.z + vv.z);
      camera.rotation.z = 0;
      camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));

    } else if (cameraPosi == 1) {
      // フロントビュー（ドライバー視点) / 車の中心位置から正面に向けて
      camera.position.copy(new THREE.Vector3(vposi.x, vposi.y, vposi.z+2));
      camera.rotation.z = 0;
      var vv = vquat.vmult(new CANNON.Vec3(-20, 0, 0));  // 前方、高さ、左右
      camera.lookAt(new THREE.Vector3(vposi.x + vv.x, vposi.y + vv.y, vposi.z));

    } else if (cameraPosi == 2) {
      // トップビュー 上空から / 車の前面が上に
      camera.position.set(vposi.x, vposi.y, vposi.z + 200);
      camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));
      var veuler = new CANNON.Vec3(0, 0, 0);
      vquat.toEuler(veuler);
      var viecleRotZ = veuler.z;
      // x = [-90,90], y=[-180, 180], z=[-90, 90]  /
      // z軸重力系での応急処理(ガタつくが仕方なし)
      // .. toEuler を z値 [-180, 180] になるよう独自計算が必要 or euler 角を求めずに角度調整
      if (veuler.x < 0) {
        viecleRotZ = Math.PI - viecleRotZ;
      }
      viecleRotZ += Math.PI / 2;  // 初期視点のずれ補正
      camera.rotation.z = viecleRotZ;

    } else if (cameraPosi == 3) {
      // OrbitControls の自動回転
      orbitControls.autoRotate = true;
      orbitControls.update();
      camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));
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


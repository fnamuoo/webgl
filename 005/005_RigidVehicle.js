// mode:javascript

// 下記を参考に..
// - cannon.es 本家、RigidVehicleのデモ
//   ...

// - 7_0
//   - ローカル化
// - 7_1
//   - この js に集約、cannon, threee, OrbitControls 以外の排除／本質的な成分のみ残す
// - 7_2
//   - カメラ視点追加
//   - ボール（目印）追加
//   - 自車の姿勢修正(r)
// - 7_3
//   - 最新ライブラリ対応(cannon-es@0.20.0, three@0.165.0)
// - 7_4
//   - Z軸重力系テスト...廃棄
// - 7_5
//   - 手順 変数名の統一

// - 7_5_1
//   - 変数名の統一
// - 7_5_2
//   - カメラ視点の変更
//   - ホイールを球体から円柱に

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
  world.gravity.set(0, -30, 0)
  // Sweep and prune broadphase
  world.broadphase = new CANNON.SAPBroadphase(world)
  // Adjust the global friction
  world.defaultContactMaterial.friction = 0.2

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
  const moChassisShape = new CANNON.Box(new CANNON.Vec3(5, 0.5, 2))
  const moChassisBody = new CANNON.Body({ mass: 1 })
  const centerOfMassAdjust = new CANNON.Vec3(0, -1, 0)
  moChassisBody.addShape(moChassisShape, centerOfMassAdjust)
  const viChassisGeo = new THREE.BoxGeometry(10, 1, 4);
  const viChassisMtr = new THREE.MeshNormalMaterial();
  const viChassisMesh = new THREE.Mesh(viChassisGeo, viChassisMtr);
  viChassisMesh.position.copy(moChassisBody.position);
  viChassisMesh.quaternion.copy(moChassisBody.quaternion);
  scene.add(viChassisMesh);

  // Create the vehicle
  const moVehicle = new CANNON.RigidVehicle({chassisBody:moChassisBody})

  const mass = 1
  const axisWidth = 7
  var wheelRadius = 1.5;
  const moWheelShape = new CANNON.Cylinder(wheelRadius, wheelRadius, wheelRadius/2, 20);
  const wheeloffset = new CANNON.Vec3(0, 0, 0);
  const wheelquat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI/2);
  const moWheelMtr = new CANNON.Material('wheel')
  const down = new CANNON.Vec3(0, -1, 0)

  const moWheelBody1 = new CANNON.Body({ mass, material: moWheelMtr })
  moWheelBody1.addShape(moWheelShape, wheeloffset, wheelquat)
  moVehicle.addWheel({
    body: moWheelBody1,
    position: new CANNON.Vec3(-5, 0, axisWidth / 2).vadd(centerOfMassAdjust),
    axis: new CANNON.Vec3(0, 0, -1),
    direction: down,
  })

  const moWheelBody2 = new CANNON.Body({ mass, material: moWheelMtr })
  moWheelBody2.addShape(moWheelShape, wheeloffset, wheelquat)
  moVehicle.addWheel({
    body: moWheelBody2,
    position: new CANNON.Vec3(-5, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
    axis: new CANNON.Vec3(0, 0, -1),
    direction: down,
  })

  const moWheelBody3 = new CANNON.Body({ mass, material: moWheelMtr })
  moWheelBody3.addShape(moWheelShape, wheeloffset, wheelquat)
  moVehicle.addWheel({
    body: moWheelBody3,
    position: new CANNON.Vec3(5, 0, axisWidth / 2).vadd(centerOfMassAdjust),
    axis: new CANNON.Vec3(0, 0, -1),
    direction: down,
  })

  const moWheelBody4 = new CANNON.Body({ mass, material: moWheelMtr })
  moWheelBody4.addShape(moWheelShape, wheeloffset, wheelquat)
  moVehicle.addWheel({
    body: moWheelBody4,
    position: new CANNON.Vec3(5, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
    axis: new CANNON.Vec3(0, 0, -1),
    direction: down,
  })

  const viWheelMeshes = [];
  moVehicle.wheelBodies.forEach((moWheelBody) => {
    // Some damping to not spin wheels too fast
    moWheelBody.angularDamping = 0.4

    // Add visuals
    const viWheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelRadius/2, 20);
    viWheelGeo.rotateX(Math.PI/2);
    const viWheelMtr = new THREE.MeshNormalMaterial({wireframe:true});
    const viWheelMesh = new THREE.Mesh(viWheelGeo, viWheelMtr);
    scene.add(viWheelMesh);
    viWheelMeshes.push(viWheelMesh);
  })

  moVehicle.addToWorld(world)

  // Add the ground
  const sizeX = 64
  const sizeZ = sizeX
  const matrix = []
  for (let i = 0; i < sizeX; i++) {
    matrix.push([])
    for (let j = 0; j < sizeZ; j++) {
      if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
        const height = 6
        matrix[i].push(height)
        continue
      }
      const height = Math.sin((i / sizeX) * Math.PI * 7) * Math.sin((j / sizeZ) * Math.PI * 7) * 6 + 6
      matrix[i].push(height)
    }
  }

  const moGroundMtr = new CANNON.Material('ground')
  const heightfieldShape = new CANNON.Heightfield(matrix, {
    elementSize: 300 / sizeX,
  })
  const moGroundBody = new CANNON.Body({ mass: 0, material: moGroundMtr })
  moGroundBody.addShape(heightfieldShape)
  moGroundBody.position.set(
    (-(sizeX - 1) * heightfieldShape.elementSize) / 2,
    -15,
    ((sizeZ - 1) * heightfieldShape.elementSize) / 2
  )
  moGroundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  world.addBody(moGroundBody)
  const viGroundGeo = new THREE.BufferGeometry();
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
    viGroundGeo.setFromPoints(points)
    shape.id = viGroundGeo.id;
  }
  const viGroundMtr = new THREE.MeshBasicMaterial({wireframe: true});
  const viGroundMesh = new THREE.Mesh(viGroundGeo, viGroundMtr);
  viGroundMesh.position.copy(moGroundBody.position);
  viGroundMesh.quaternion.copy(moGroundBody.quaternion);
  scene.add(viGroundMesh);

  // Define interactions between wheels and ground
  const wheel_ground = new CANNON.ContactMaterial(moWheelMtr, moGroundMtr, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000,
  })
  world.addContactMaterial(wheel_ground)

  // 基準面を作成 (200pixel四方を 20x20分割
  const viBaseGrid = new THREE.GridHelper(200, 20, 0xff8888, 0x404040);
  viBaseGrid.position.set(0, -10, 0);
  scene.add(viBaseGrid);

  // 球 作成
  const radius = 5;
  const moSphereMtr = new CANNON.Material('name2'); 
  moSphereMtr.restitution = 1;
  const moSphereBody = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Sphere(radius),
    position: new CANNON.Vec3(-12, 20, -12),
    material: moSphereMtr
  });
  world.addBody(moSphereBody);
  const viSphereGeo = new THREE.SphereGeometry(radius);
  const viSphereMtr = new THREE.MeshNormalMaterial();
  const viSphereMesh = new THREE.Mesh(viSphereGeo, viSphereMtr);
  scene.add(viSphereMesh);

  var cameraPosi = -1;

  // Keybindings
  // Add force on keydown
  document.addEventListener('keydown', (event) => {
    const maxSteerVal = Math.PI / 8
    const maxSpeed = 10
    const maxForce = 100

    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        moVehicle.setWheelForce(-maxForce, 2)
        moVehicle.setWheelForce(-maxForce, 3)
        break
      case 's':
      case 'ArrowDown':
        moVehicle.setWheelForce(maxForce / 2, 2)
        moVehicle.setWheelForce(maxForce / 2, 3)
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

      case 'c':
        cameraPosi = (cameraPosi + 1) % 5;
        break;

      case 'r':
        // 車をひっくり返したいけど、シャーシ・ホイルを同時に指定する必要あり。なので..

        // 車を持ち上げ
        var upY = 5;
        moVehicle.chassisBody.position.y += upY;
        for (var i = 0; i < 4; ++i) {
          moVehicle.wheelBodies[i].position.y += upY;
        }

        // 片方だけに力を加えてみる
        var vquat = moVehicle.chassisBody.quaternion;
        var veuler = new CANNON.Vec3(0, 0, 0);
        vquat.toEuler(veuler);
        var ry = -veuler.y;
        var fy = new CANNON.Vec3(0, 20, 0);
        var pz, px;
        var cos_ry, sin_ry;
        cos_ry = Math.cos(ry);
        sin_ry = Math.sin(ry);
        pz =  5*cos_ry + 2*sin_ry;
        px = -5*sin_ry + 2*cos_ry;
        moVehicle.chassisBody.applyImpulse(fy, new CANNON.Vec3(px, 0, pz));
        pz =  5*cos_ry  -2*sin_ry;
        px = -5*sin_ry  -2*cos_ry;
        moVehicle.chassisBody.applyImpulse(fy, new CANNON.Vec3(px, 0, pz));
    }
  })

  // Reset force on keyup
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        moVehicle.setWheelForce(0, 2)
        moVehicle.setWheelForce(0, 3)
        break

      case 's':
      case 'ArrowDown':
        moVehicle.setWheelForce(0, 2)
        moVehicle.setWheelForce(0, 3)
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
    }
  })

  function animate() {
    requestAnimationFrame(animate)

    const timeStep = 1 / 60;
    world.step(timeStep)

    // 球（移動）
    viSphereMesh.position.copy(moSphereBody.position);
    viSphereMesh.quaternion.copy(moSphereBody.quaternion);

    // 車関連
    viChassisMesh.position.copy(moChassisBody.position);
    viChassisMesh.quaternion.copy(moChassisBody.quaternion);
    moVehicle.wheelBodies.forEach((moWheelBody, i) => {
      viWheelMeshes[i].position.copy(moWheelBody.position);
      viWheelMeshes[i].quaternion.copy(moWheelBody.quaternion);
    });

    // カメラ・視点関連
    {
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
        var rotY = viChassisMesh.rotation.y;
        var viecleRotY = veuler.y + Math.PI / 2;  // X軸負の方向を向いて作成したので、上を向くよう90度ずらす
        camera.rotation.z = viecleRotY;
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
    }

    renderer.render(scene, camera)
  }

  animate();
};

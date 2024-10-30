// mode:javascript

// 下記を参考に..
// - cannon.es 本家、RaycastVehicleのデモ
//   ...

// - 12_1
//   - 車をトラック、コンテナつき（箱だけ、車輪なし）にしてみる
//     操作が難しい、..
//      > 車を４ＷＤにする
//      > ジョイントにバネを入れる

// - 12_2
//   - コンテナに車輪を付ける
//   - コンテナの車輪が沈む...
//       車のホイール材質だと、進行時に跳ねる、反発係数？
//       独自のホイール材質だと、進行時に沈んだまま
//
//   いずれもパラメータ値の問題か？
//    > 材質同士の係数設定が worldに登録されてなかった ...orz

// 複合体、物体の組み合わせは ...
//   https://github.com/pmndrs/cannon-es/blob/master/examples/compound.html
// CANNON.Body() を作って、addShape していくだけ

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
    maxSuspensionForce: 100000,
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
    // viWheelGeo.rotateX(Math.PI*0.6);
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


  // コンテナ（荷台）
  const moContenaMtr = new CANNON.Material({name: 'container', restitution: 0}); // 反発 0:= 跳ねない
  var contenaLen = 4;  // 全長 (x軸方向
  var contenaHigh = 1;  // 高さ (y軸方向
  var contenaWidth = 1;  // 横幅 (z軸方向
  const moContenaShape = new CANNON.Box(new CANNON.Vec3(contenaLen, contenaHigh, contenaWidth))
  const moContenaBody = new CANNON.Body({
    mass: 10,
    shape: moContenaShape,
    position: new CANNON.Vec3(contenaLen+4, 3, 0),
    material: moContenaMtr,
  })
  world.addBody(moContenaBody)
  const viContenaGeo = new THREE.BoxGeometry(contenaLen*2, contenaHigh*2, contenaWidth*2,  contenaLen, contenaHigh, contenaWidth);
  const viContenaMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viContenaMesh = new THREE.Mesh(viContenaGeo, viContenaMtr);
  viContenaMesh.position.copy(moContenaBody.position);
  viContenaMesh.quaternion.copy(moContenaBody.quaternion);
  scene.add(viContenaMesh);

  // コンテナと車をつなぐ
  // 点でつないでみる(後ろに距離あけてつなぐ感じで)
  var contGap = 1;
  const moVJointConst = new CANNON.PointToPointConstraint(
    moChassisBody, new CANNON.Vec3(2+contGap, -0.5, 0),
    moContenaBody, new CANNON.Vec3(-contenaLen-contGap, -contenaHigh, 0),
  );
  world.addConstraint(moVJointConst);
  // 結合を線で表示
  const viContenaJoinMtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viContenaJoinPoints = [];
  viContenaJoinPoints.push( moChassisBody.position );
  viContenaJoinPoints.push( moChassisBody.position.vadd(moChassisBody.quaternion.vmult(new CANNON.Vec3(2+contGap, 0.01, 0))) );
  viContenaJoinPoints.push( moContenaBody.position );
  const viContenaJoinGeo = new THREE.BufferGeometry().setFromPoints(viContenaJoinPoints);
  const viContenaJoinLine = new THREE.Line(viContenaJoinGeo, viContenaJoinMtr);
  scene.add(viContenaJoinLine);

  // 荷台のホイール
  var moContWheelBodys = []
  var viContWheelMeshes = []
  const contWheelRadius = 0.5
  const moContWheelMtr = new CANNON.Material({name: 'contWheel'});
  {
    const moContWheelShape = new CANNON.Cylinder(contWheelRadius, contWheelRadius, contWheelRadius*0.5, 20)
    const moContWheelBody = new CANNON.Body({
      mass: 1,
      material: moContWheelMtr,
      shape: moContWheelShape,
      position: moContenaBody.position.vadd(new CANNON.Vec3(contenaLen-0.2, -contenaHigh+0.2, contenaWidth+contWheelRadius*0.5+0.1)),
      quaternion: new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0),
    })
    world.addBody(moContWheelBody)
    moContWheelBodys.push(moContWheelBody)
    const viContWheelGeo = new THREE.CylinderGeometry(contWheelRadius, contWheelRadius, contWheelRadius*0.5, 20);
    const viContWheelMtr = new THREE.MeshNormalMaterial({wireframe:true});
    const viContWheelMesh = new THREE.Mesh(viContWheelGeo, viContWheelMtr);
    viContWheelMesh.position.copy(moContWheelBody.position);
    viContWheelMesh.quaternion.copy(moContWheelBody.quaternion);
    scene.add(viContWheelMesh);
    viContWheelMeshes.push(viContWheelMesh)
    const moContWheelConst = new CANNON.HingeConstraint(moContenaBody, moContWheelBody, {
      axisA: CANNON.Vec3.UNIT_Z,
      axisB: CANNON.Vec3.UNIT_Y,
      pivotA: new CANNON.Vec3(contenaLen-0.1, -contenaHigh-0.1, contenaWidth+0.1), // 左後方
      pivotB: new CANNON.Vec3(0, contWheelRadius*0.5, 0),
    });
    world.addConstraint(moContWheelConst);
  }
  {
    const moContWheelShape = new CANNON.Cylinder(contWheelRadius, contWheelRadius, contWheelRadius*0.5, 20)
    const moContWheelBody = new CANNON.Body({
      mass: 1,
      material: moContWheelMtr,
      shape: moContWheelShape,
      position: moContenaBody.position.vadd(new CANNON.Vec3(contenaLen-0.2, -contenaHigh+0.2, -contenaWidth+contWheelRadius*0.5-0.1)),
      quaternion: new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0),
    })
    world.addBody(moContWheelBody)
    moContWheelBodys.push(moContWheelBody)
    const viContWheelGeo = new THREE.CylinderGeometry(contWheelRadius, contWheelRadius, contWheelRadius*0.5, 20);
    const viContWheelMtr = new THREE.MeshNormalMaterial({wireframe:true});
    const viContWheelMesh = new THREE.Mesh(viContWheelGeo, viContWheelMtr);
    viContWheelMesh.position.copy(moContWheelBody.position);
    viContWheelMesh.quaternion.copy(moContWheelBody.quaternion);
    scene.add(viContWheelMesh);
    viContWheelMeshes.push(viContWheelMesh)
    const moContWheelConst = new CANNON.HingeConstraint(moContenaBody, moContWheelBody, {
      axisA: CANNON.Vec3.UNIT_Z,
      axisB: CANNON.Vec3.UNIT_Y,
      pivotA: new CANNON.Vec3(contenaLen-0.1, -contenaHigh-0.1, -contenaWidth-0.1), // 右後方
      pivotB: new CANNON.Vec3(0,  -contWheelRadius*0.5, 0),
    });
    world.addConstraint(moContWheelConst);
  }

  // 長方形の台を地面代わりにするテスト(1) 画像はサーキット
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
  const texture = new THREE.TextureLoader().load('./pic/BoxySVG_test1_3_400x300.png'); 
  const viGround2Mtr = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 0.4});
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

  // 球 作成
  const radius = 5;
  const moSphereMtr = new CANNON.Material({name: 'name2', restitution: 0});
  const moSphereBody = new CANNON.Body({
    mass: 5,
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
    contactEquationStiffness: 1000,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(sphere_ground)

  const contena_ground = new CANNON.ContactMaterial(moContenaMtr, moGroundMtr, {
    friction: 0.003,  // 摩擦係数(def=0.3)
    restitution: 0.3,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e7,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(contena_ground)

  const contenaWheel_ground = new CANNON.ContactMaterial(moContWheelMtr, moGroundMtr, {
    friction: 0.9,  // 摩擦係数(def=0.3)
    restitution: 0.0,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e7,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(contenaWheel_ground)

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

      case 'ArrowLeft':
        moVehicle.setSteeringValue(maxSteerVal, 0)
        moVehicle.setSteeringValue(maxSteerVal, 1)
        break
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

      case 'ArrowLeft':
        moVehicle.setSteeringValue(0, 0)
        moVehicle.setSteeringValue(0, 1)
        break
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
    // init position
    var px = moVehicle.chassisBody.position.x;
    var py = moVehicle.chassisBody.position.y;
    var pz = moVehicle.chassisBody.position.z;

    camera.position.set(px, py, pz+100);
    camera.lookAt(new THREE.Vector3(px, py, pz));
    // 
    moSphereBody.position.set(-6, 6, -6);
  }

  var iroty = 0;
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
    for (let i = 0; i < moVehicle.wheelInfos.length; i++) {
      const transform = moVehicle.wheelInfos[i].worldTransform;
      const viWheelMesh = viWheelMeshes[i];
      viWheelMesh.position.copy(transform.position);
      viWheelMesh.quaternion.copy(transform.quaternion);
    }
    viContenaMesh.position.copy(moContenaBody.position);
    viContenaMesh.quaternion.copy(moContenaBody.quaternion);
    viContenaJoinPoints[0].copy(moChassisBody.position);
    viContenaJoinPoints[1].copy( moChassisBody.position.vadd(moChassisBody.quaternion.vmult(new CANNON.Vec3(2+contGap, 0.01, 0))) );
    viContenaJoinPoints[2].copy(moContenaBody.position);
    viContenaJoinGeo.setFromPoints(viContenaJoinPoints);
    viContWheelMeshes[0].position.copy(moContWheelBodys[0].position);
    viContWheelMeshes[0].quaternion.copy(moContWheelBodys[0].quaternion);
    viContWheelMeshes[1].position.copy(moContWheelBodys[1].position);
    viContWheelMeshes[1].quaternion.copy(moContWheelBodys[1].quaternion);

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
      // _cameraPosi == 4
      // OrbitControls のマウス操作に任せる
      orbitControls.autoRotate = false;
      orbitControls.update();
    }

    renderer.render(scene, camera)
  }

  animate();
};

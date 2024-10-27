// mode:javascript

// 下記を参考に..
// - cannon.es 本家、RaycastVehicleのデモ
//   ...

// - 9_5_8
//   - perlin ノイズで地面を凸凹
//     (箱根、富士　単品確認)

// - 9_5_9
//    - 地面を凸凹変化（動的に、波のように


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

function createGroundGeo(Dem, texturefpath, length, ampHigh, moGroundMtr) {
  const sizeX = 257;
  const sizeZ = 257;
  var matrix = [];
  var vzmax = 0;
  {
    var vSceneMesh = null;
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function(evt) {
      vSceneMesh = (evt.target.response || evt.target.responseText).replace(/\n/g, ",").split(",");
      var vMeshSizeW = sizeX-1;
      var vMeshSizeH = sizeZ-1;
      for(let iz = 0; iz <= vMeshSizeH; iz++){
        matrix.push([])
        for(let ix = 0; ix <= vMeshSizeW; ix++){
          var idx = iz * (vMeshSizeW+1) + ix;
          const vz = vSceneMesh[idx] * ampHigh;
          matrix[iz].push(vz);
          if (vzmax < vz) {
            vzmax = vz;
          }
        }
      }
    }, false);
    xhr.open('GET', Dem, false);  // 三番目にfalseで, 同期処理に変更
    xhr.send(null);
  }
  // 物理系 heighfield 用に 軸を入れ替えたデータを用意する
  var momatrix = []
  for (let ix = 0; ix < sizeX; ++ix) {
    momatrix.push([])
    for (let iz = 0; iz < sizeZ; ++iz) {
      momatrix[ix].push(matrix[iz][ix])
    }
  }
  const heightfieldShape = new CANNON.Heightfield(momatrix, {elementSize: length / sizeX,})
  var moGroundBody = new CANNON.Body({ mass: 0, material: moGroundMtr })
  moGroundBody.addShape(heightfieldShape)
  // body の中心位置が、原点に来るように位置を調整
  moGroundBody.position.set(
    -(sizeX * heightfieldShape.elementSize) / 2,
    0, // -1,
    (sizeZ * heightfieldShape.elementSize) / 2
  )
  moGroundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

  const viGroundGeo = new THREE.BufferGeometry();
  const sizeX_ = sizeX-1;
  const sizeZ_ = sizeZ-1;
  {
    // ポリゴンの頂点座標の配列（Polygon's positon array)
    var pos = new Float32Array(sizeX*sizeZ*3);
    var n=0;
    for(var iz = 0; iz < sizeZ; iz++){ 
      for(var ix = 0; ix < sizeX; ix++){
        pos[n] = ix * length/sizeX; n++;
        pos[n] = iz * length/sizeZ; n++;
        pos[n] = matrix[iz][ix]; n++;
      }
    }
    // ポリゴンの三角形をインデックスで指定(Polugon's index array)
    n=0;
    var index = new Uint32Array(3*(sizeX_*sizeZ_*2));
    for(var iz=sizeZ_-1; iz >= 0; --iz){ // 入力データの並びと表示を合わせるよう逆順で
      for(var ix=0; ix < sizeX_; ix++){
        index[n] = iz*sizeZ + ix; n++;
        index[n] = iz*sizeZ + ix + 1; n++;
        index[n] = (iz+1)*sizeZ + ix + 1; n++;
        index[n] = iz*sizeZ + ix; n++;
        index[n] = (iz+1)*sizeZ + ix + 1; n++;
        index[n] = (iz+1)*sizeZ + ix; n++;
      }
    }
    // ポリゴンのTexgure位置座標の配列 (Texture uv positions array)
    n=0;
    var uvs = new Float32Array(sizeX*sizeZ*2);
    for(var iz=0; iz<sizeZ; iz++){ 
      for(var ix=0; ix<sizeX; ix++){
        uvs[n] = ix/sizeX_; n++;
        uvs[n] = iz/sizeZ_; n++;
      }
    }
    // 2つの三角形をインデックスで指定(Polygon's index array)
    const geom = new THREE.BufferGeometry();
    viGroundGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    viGroundGeo.setIndex(new THREE.BufferAttribute(index,1)); 
    viGroundGeo.computeVertexNormals();
    viGroundGeo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  }
  const texture = new THREE.TextureLoader().load(texturefpath); 
  const viGroundMtr = new THREE.MeshStandardMaterial({color:0xffffff, map: texture, transparent: true, opacity: 0.4, side:THREE.DoubleSide, });
  var viGroundMesh = new THREE.Mesh(viGroundGeo, viGroundMtr);
  viGroundMesh.position.copy(moGroundBody.position);
  viGroundMesh.quaternion.copy(moGroundBody.quaternion);

  return {moGroundBody, viGroundMesh, vzmax};
}

window.onload = () => {
  const {world, camera, scene, renderer, orbitControls} = setupWorld();

  // Build the car chassis
  const moChassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 0.8))
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
    radius: 0.5,
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
      mass: 10,
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

  // ダートコース
  //  cos波だけでも悪くない
  const texturefpath2 = './pic/GT5_Circuit_Toscana_Fwd_test2w22_2560x1920_2.png'; 
  const length = 400;
  const sizeX = 256
  const sizeZ = 256
  var phShiftX = 1;
  var phShiftZ = 2;
  function createGroundData(sizeX, sizeZ, phShiftX, phShiftZ) {
    var matrix = [];
    for (let i = 0; i < sizeX; i++) {
      matrix.push([])
      for (let j = 0; j < sizeZ; j++) {
        if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
          const height = 10
          matrix[i].push(height)
          continue
        }
        const height = Math.cos((i / sizeX/2+phShiftX) * Math.PI * 5) * Math.cos((j / sizeZ+phShiftZ) * Math.PI * 5) * 3 + 2;
        matrix[i].push(height)
      }
    }
    return matrix;
  }

  // 初期の地面データ
  var matrix = [];
  matrix = createGroundData(sizeX, sizeZ, phShiftX, phShiftZ);

  // 地面を更新
  //   丘陵の位相をずらして平面を書き直す
  //   perlin ノイズまで作り直すと、凸凹が消えたり現れたりする..xx 使うなら 別レイヤー（別データ：変更しない）にして重ねる
  //   急に凹凸すると車が跳ねたり、空中に放り出されたりするので、緩やかに変化させる
  function updateGroundData() {
    // 物理データ側更新
    phShiftX += 0.001;
    phShiftZ += 0.002;
    matrix = createGroundData(sizeX, sizeZ, phShiftX, phShiftZ);
    heightfieldShape.data = matrix;
    heightfieldShape.update();
    // ビュー側更新
    var n=2;
    for(var y=0; y<sizeZ; y++){ 
      for(var x=0; x<sizeX; x++){
        pos[n] = matrix[x][y]; n+=3;
      }
    }
    viGroundGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  }
  
  const moGroundMtr = new CANNON.Material('ground')
  const heightfieldShape = new CANNON.Heightfield(matrix, {elementSize: length / sizeX,})
  const moGroundBody = new CANNON.Body({ mass: 0, material: moGroundMtr })
  moGroundBody.addShape(heightfieldShape)
  moGroundBody.position.set(
    -(sizeX * heightfieldShape.elementSize) / 2,
    -1,
    (sizeZ * heightfieldShape.elementSize) / 2
  )
  moGroundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  world.addBody(moGroundBody)
  const viGroundGeo = new THREE.BufferGeometry();
  const sizeX_ = sizeX-1;
  const sizeZ_ = sizeZ-1;
  // const length = 100; // heightfieldShape で定義しているサイズ
  var pos = new Float32Array(sizeX*sizeZ*3);
  {
    // ポリゴンの頂点座標の配列（Polygon's positon array)
    var n=0;
    for(var y=0; y<sizeX; y++){ 
      for(var x=0; x<sizeZ; x++){
        pos[n] = x * length/sizeZ; n++;
        pos[n] = y * length/sizeX; n++;
        // pos[n] = matrix[y][x]; n++;
        pos[n] = matrix[x][y]; n++;
      }
    }
    // ポリゴンの三角形をインデックスで指定(Polugon's index array)
    n=0;
    var index = new Uint32Array(3*(sizeX_*sizeZ_*2));
    for(var y=0; y < sizeX_; y++){ 
      for(var x=0; x < sizeZ_; x++){
        index[n] = y*sizeZ + x; n++;
        index[n] = y*sizeZ + x + 1; n++;
        index[n] = (y+1)*sizeZ + x + 1; n++;
        index[n] = y*sizeZ + x; n++;
        index[n] = (y+1)*sizeZ + x + 1; n++;
        index[n] = (y+1)*sizeZ + x; n++;
      }
    }
    // ポリゴンのTexgure位置座標の配列 (Texture uv positions array)
    n=0;
    var uvs = new Float32Array(sizeX*sizeZ*2);
    for(var y=0; y<sizeX; y++){ 
      for(var x=0; x<sizeZ; x++){
        uvs[n] = x/sizeZ_; n++;
        uvs[n] = y/sizeX_; n++;
      }
    }
    // 2つの三角形をインデックスで指定(Polygon's index array)
    const geom = new THREE.BufferGeometry();
    viGroundGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    viGroundGeo.setIndex(new THREE.BufferAttribute(index,1)); 
    viGroundGeo.computeVertexNormals();
    viGroundGeo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  }
  const texture = new THREE.TextureLoader().load(texturefpath2); 
  const viGroundMtr = new THREE.MeshStandardMaterial({color:0xffffff, map: texture, wireframe: true, side:THREE.DoubleSide, });
  const viGroundMesh = new THREE.Mesh(viGroundGeo, viGroundMtr);
  viGroundMesh.position.copy(moGroundBody.position);
  viGroundMesh.quaternion.copy(moGroundBody.quaternion);
  scene.add(viGroundMesh);

  const wheel_ground = new CANNON.ContactMaterial(moWheelMtr, moGroundMtr, {
    friction: 0.9,  // 摩擦係数(def=0.3)
    restitution: 0,  // 反発係数 (def=0.3)
    // contactEquationStiffness: 1000,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
    contactEquationStiffness: 1e-2,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(wheel_ground)

  // 球 作成
  const radius = 5;
  // moSphereMtr.restitution = 1;  // 反発係数 1:跳ねやすい  /  0:跳ねない
  const moSphereMtr = new CANNON.Material({name: 'name2', restitution: 0});
  // const moSphereMtr = new CANNON.Material({name: 'name2', restitution: 1});
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

      case 'u':
        updateGroundData();
        break
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
    // init position  / ダートコースに合わせた位置 400px
    moVehicle.chassisBody.position.set(-80, 10, -110)
    const carInitQuat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -0.7*Math.PI);
    moVehicle.chassisBody.quaternion.copy(carInitQuat);

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

  // 動的に、一定時間(0.1秒)ごとに 「地面を更新する」関数を呼び出し
  setInterval(updateGroundData, 100);

  animate();
};


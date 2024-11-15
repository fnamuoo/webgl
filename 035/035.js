// mode:javascript

// - 004
//   - パラメータ調整
//     粒度を小さくしてみる

//   - 解決
//     - 砂が横方向に動きすぎ（まっすぐにおちない）空気抵抗／粘性が足りない？
//       >> lineardump で解決

//   - 懸念
//     - 砂が固まっておちる（砂時計のようにならない。サラサラと落ちない）
//       ?? (摩擦係数が関係？)
//     - 砂の落下、着地時に跳ねすぎ？
//     - 気泡が防波堤になってない

//     - いじくりまわし過ぎて、重くなった..
//        sandA: 5928
//        sandB: 100
//        air  : 120
//
//     - これはこれで上手くっているようにも思えるので一旦保留

// - 005
//   - まず軽量する(new回数を少なく)
//   - 微調整
//     - 気泡（棒）をやや小さく・ひっかかりにくくする
//   - ケース（物理）の非表示
//   - ケース（表示用）の枠を設置
//   - 現状：  .. これ以上のオブジェクトを増やすと重すぎて
//       sand(A):3186
//       sand(B):308
//      air(cir):211
//      air(bar):62
//
//   - 物体（砂、気泡）のサイズ（個数）、質量、気泡の浮力のバランスが難しい

// - 006_a
//   - コンテナ・ケースの回転
//     .. コンテナの重心が原点とずれているので、
//        回転のさせかたに注意が必要（原点に戻して、回転して、もとに位置に
//        ..がめんどい

// - 006_b
//   - コンテナ・ケースの回転
//     - 原点に重心をもってくるよう再配置



//   - 気泡の削除・追加

import * as THREE from "three";
import * as CANNON from "cannon";

import { OrbitControls } from "orbitcontrols";

function setupWorld() {
  const world = new CANNON.World()
  // world.gravity.set(0, -10, 0)
  world.gravity.set(0, -2, 0)

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
    orbitControls.enablePan = false
    orbitControls.dampingFactor = 0.2
    orbitControls.minDistance = 10
    orbitControls.maxDistance = 500
  }

  return {world, camera, scene, renderer, orbitControls};
}



window.onload = () => {
  const {world, camera, scene, renderer, orbitControls} = setupWorld();

  orbitControls.autoRotate = false;

  // // 基準面を作成 (20pixel四方を 2x2分割
  // const viBaseGrid = new THREE.GridHelper(20, 2, 0x88ff88, 0x404040);
  // viBaseGrid.position.set(0, 0, -0.01);
  // scene.add(viBaseGrid);

  // コンテナ（ケース
  // コンテナ内の (x,y,z)=(横幅、高さ、奥行)
  const cntnrSizeX = 4; const cntnrSizeY = 12; const cntnrSizeZ = 0.11;
  // 平板の厚み (薄いと、砂と気泡が激しくぶつかったときに飛び出るので防止のために厚く)
  const cntnrThick = 5;

  const cntnrSizeX_ = cntnrSizeX/2;
  const cntnrSizeY_ = cntnrSizeY/2;
  const cntnrSizeZ_ = cntnrSizeZ/2;
  const cntnrThick_ = cntnrThick/2;

  const cntnrWireframe = false;
  const moCntnrMtr = new CANNON.Material({name: 'container'});

  const moCntnrBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    // collisionFilterGroup: 1,
    material: moCntnrMtr,
  });
  const viCntnrMesh = new THREE.Group();

  // x軸 正側 (右手)
  moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(cntnrThick_, cntnrSizeY, cntnrSizeZ_)),
                       new CANNON.Vec3(cntnrSizeX_+cntnrThick_, 0, 0));
  const viCntnrPltXp2Geo = new THREE.BoxGeometry(0.01, cntnrSizeY, cntnrSizeZ);
  const viCntnrPltXp2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1});
  const viCntnrPltXp2Mesh = new THREE.Mesh(viCntnrPltXp2Geo, viCntnrPltXp2Mtr);
  viCntnrPltXp2Mesh.position.copy(new THREE.Vector3(cntnrSizeX_, 0, 0));
  viCntnrMesh.add(viCntnrPltXp2Mesh);

  // x軸 負側 (左手)
  moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(cntnrThick_, cntnrSizeY, cntnrSizeZ_)),
                       new CANNON.Vec3(-cntnrSizeX_-cntnrThick_, 0, 0));
  const viCntnrPltXn2Geo = new THREE.BoxGeometry(0.01, cntnrSizeY, cntnrSizeZ);
  const viCntnrPltXn2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, wireframe: cntnrWireframe});
  const viCntnrPltXn2Mesh = new THREE.Mesh(viCntnrPltXn2Geo, viCntnrPltXn2Mtr);
  viCntnrPltXn2Mesh.position.copy(new THREE.Vector3(-cntnrSizeX_, 0, 0));
  viCntnrMesh.add(viCntnrPltXn2Mesh);


  // y軸 正側 (上側)
  moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(cntnrSizeX_, cntnrThick_, cntnrSizeZ_)),
                       new CANNON.Vec3(0, cntnrSizeY_+cntnrThick_, 0));
  const viCntnrPltYp2Geo = new THREE.BoxGeometry(cntnrSizeX, 0.01, cntnrSizeZ);
  const viCntnrPltYp2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, wireframe: cntnrWireframe});
  const viCntnrPltYp2Mesh = new THREE.Mesh(viCntnrPltYp2Geo, viCntnrPltYp2Mtr);
  viCntnrPltYp2Mesh.position.copy(new THREE.Vector3(0, cntnrSizeY_, 0));
  viCntnrMesh.add(viCntnrPltYp2Mesh);

  // y軸 負側 (下側)
  moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(cntnrSizeX_, cntnrThick_, cntnrSizeZ_)),
                       new CANNON.Vec3(0, -cntnrSizeY_-cntnrThick_, 0));
  const viCntnrPltYn2Geo = new THREE.BoxGeometry(cntnrSizeX, 0.01, cntnrSizeZ);
  const viCntnrPltYn2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, wireframe: cntnrWireframe});
  const viCntnrPltYn2Mesh = new THREE.Mesh(viCntnrPltYn2Geo, viCntnrPltYn2Mtr);
  viCntnrPltYn2Mesh.position.copy(new THREE.Vector3(0, -cntnrSizeY_, 0));
  viCntnrMesh.add(viCntnrPltYn2Mesh);

  // z軸 正側 (画面奥側)
  moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(cntnrSizeX, cntnrSizeY, cntnrThick_)),
                       new CANNON.Vec3(0, 0, cntnrSizeZ_+cntnrThick_));

  // z軸 負側 (画面手前側)
  moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(cntnrSizeX, cntnrSizeY, cntnrThick_)),
                       new CANNON.Vec3(0, 0, -cntnrSizeZ_-cntnrThick_));

  viCntnrMesh.position.copy(moCntnrBody.position);
  viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
  world.addBody(moCntnrBody)
  scene.add(viCntnrMesh);

  // コンテナ（中身：砂、空気

  // 砂(A)
  const moSandMtr = new CANNON.Material({name: 'sand', restitution: 0.01});
  const sandAMass = 0.00005;
  const sandASizeR = 0.03;
  const sandALocGrid = 0.0338;
  const sandALocGrid2 = sandALocGrid*2;
  const sandAFillRngYmin = - cntnrSizeY_ + cntnrSizeY*0.60;
  const sandAFillRngYmax = - cntnrSizeY_ + cntnrSizeY*0.90;
  var moSandABodyList = [];
  var viSandAMeshList = [];
  // 砂 - 充填
  const moSandAShape = new CANNON.Sphere(sandASizeR);
  const viSandAGeo = new THREE.SphereGeometry(sandASizeR);
  const viSandAMtr = new THREE.MeshBasicMaterial({color: 0xd0d0d0});
  const rndRange1 = 0.01;
  for (var y = sandAFillRngYmin; y < sandAFillRngYmax; y+= sandALocGrid2) {
    for (var x = -cntnrSizeX_+sandALocGrid; x <= cntnrSizeX_-sandALocGrid; x+= sandALocGrid2) {
      for (var z = -cntnrSizeZ_+sandALocGrid; z <= cntnrSizeZ_-sandALocGrid; z+= sandALocGrid2) {
        var x2 = x + (Math.random() - 0.5) * rndRange1;
        var z2 = z + (Math.random() - 0.5) * rndRange1;
        const moSandBody = new CANNON.Body({
          mass: sandAMass,
          shape: moSandAShape,
          position: new CANNON.Vec3(x2, y, z2),
          material: moSandMtr
        });
        moSandBody.allowSleep = true;    // def true
        moSandBody.sleepSpeedLimit = 1;  // def 0.1
        moSandBody.sleepTimeLimit = 5;   // def 1
        moSandBody.linearDamping = 0.8;  // def 0.01
        world.addBody(moSandBody);
        const viSandMesh = new THREE.Mesh(viSandAGeo, viSandAMtr);
        scene.add(viSandMesh);
        moSandABodyList.push(moSandBody);
        viSandAMeshList.push(viSandMesh);
      }
    }
  }
  console.log("sandA(wht):", moSandABodyList.length);

  // 砂(B)
  const moSandBMtr = new CANNON.Material({name: 'sandB', restitution: 0.01});
  const sandBMass = 0.00010;
  const sandBSizeR = 0.045;
  const sandBSizeR2 = sandBSizeR*2;
  const sandBSizeRmin = 0.07;
  const sandBSizeRrng = 0.03;
  const sandBFillRngYmin = - cntnrSizeY_ + cntnrSizeY*0.95;
  const sandBFillRngYmax = - cntnrSizeY_ + cntnrSizeY*0.999;
  var moSandBBodyList = [];
  var viSandBMeshList = [];
  // 砂 - 充填
  const moSandBShape = new CANNON.Sphere(sandBSizeR);
  const viSandBGeo = new THREE.SphereGeometry(sandBSizeR);
  const viSandBMtr = new THREE.MeshBasicMaterial({color: 0xf06060});
  const rndRange = 0.1;
  const rndRange2 = 0.02;
  for (var y = sandBFillRngYmin; y < sandBFillRngYmax; y+= sandBSizeR2) {
    for (var x = -cntnrSizeX_+sandBSizeR; x <= cntnrSizeX_-sandBSizeR; x+= sandBSizeR2) {
      for (var z = -cntnrSizeZ_+sandBSizeR; z <= cntnrSizeZ_-sandBSizeR; z+= sandBSizeR2) {
        var x2 = x + (Math.random() - 0.5) * rndRange2;
        var z2 = z + (Math.random() - 0.5) * rndRange2;
        const moSandBBody = new CANNON.Body({
          mass: sandBMass,
          shape: moSandBShape,
          position: new CANNON.Vec3(x2, y, z2),
          material: moSandBMtr
        });
        moSandBBody.allowSleep = true;
        moSandBBody.sleepSpeedLimit = 1;
        moSandBBody.sleepTimeLimit = 5;
        moSandBBody.linearDamping = 0.2;  // def 0.01
        world.addBody(moSandBBody);
        const viSandBMesh = new THREE.Mesh(viSandBGeo, viSandBMtr);
        scene.add(viSandBMesh);
        moSandBBodyList.push(moSandBBody);
        viSandBMeshList.push(viSandBMesh);
      }
    }
  }
  console.log("sandB(red):", moSandBBodyList.length);


  // 気泡(a, b)
  const moAirMtr = new CANNON.Material({name: 'air', restitution: 0.01});
  const airMass = 0.002;
  const airSizeR = 0.04;
  const airSizeR2 = airSizeR*2;
  const airLocGrid = 0.05;
  const airLocGrid2 = airLocGrid*2;
  const airFillRngYmin = - cntnrSizeY_ + cntnrSizeY*0.5;
  const airFillRngYmax = - cntnrSizeY_ + cntnrSizeY*0.55;
  const airAAppF = new CANNON.Vec3(0, 0.005, 0);
  const airBAppF = new CANNON.Vec3(0, 0.010, 0);
  var moAirABodyList = [];
  var viAirAMeshList = [];
  var moAirBBodyList = [];
  var viAirBMeshList = [];
  const rndRange3 = 0.01;
  const airRectP = 0.20; // airBを作成する確率
  // 気泡 - 充填
  // 気泡（a:球）
  const moAirAShape = new CANNON.Sphere(airSizeR);
  const viAirAGeo = new THREE.SphereGeometry(airSizeR);
  const viAirAMtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, color: 0xa0a0a0});
  // 気泡（b:棒／角材）
  const moAirBShape = new CANNON.Box(new CANNON.Vec3(airSizeR*3, airSizeR/2, airSizeR/2));
  const viAirBGeo = new THREE.BoxGeometry(airSizeR2*6, airSizeR, airSizeR);
  const viAirBMtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, color: 0xa0a0f0});
  for (var y = airFillRngYmin; y < airFillRngYmax; y += airLocGrid2) {
    for (var x = -cntnrSizeX_+airLocGrid; x <= cntnrSizeX_-airLocGrid; x += airLocGrid2) {
      for (var z = -cntnrSizeZ_+airLocGrid; z <= cntnrSizeZ_-airLocGrid; z += airLocGrid2) {
        var x2 = x + (Math.random() - 0.5) * rndRange3;
        var y2 = y + (Math.random() - 0.5) * rndRange3;
        var z2 = z + (Math.random() - 0.5) * rndRange3;
        if (Math.random() > airRectP) {
          const moAirBody = new CANNON.Body({
            mass: airMass,
            shape: moAirAShape,
            position: new CANNON.Vec3(x2, y2, z2),
            material: moAirMtr
          });
          moAirBody.linearDamping = 0.1;  // def 0.01
          moAirBody.applyForce(airAAppF);
          world.addBody(moAirBody);
          const viAirMesh = new THREE.Mesh(viAirAGeo, viAirAMtr);
          scene.add(viAirMesh);
          moAirABodyList.push(moAirBody);
          viAirAMeshList.push(viAirMesh);
        } else {
          const moAirBody = new CANNON.Body({
            mass: airMass,
            shape: moAirBShape,
            position: new CANNON.Vec3(x, y2, z),
            material: moAirMtr
          });
          moAirBody.linearDamping = 0.1;  // def 0.01
          moAirBody.applyForce(airBAppF);
          world.addBody(moAirBody);
          const viAirMesh = new THREE.Mesh(viAirBGeo, viAirBMtr);
          scene.add(viAirMesh);
          moAirBBodyList.push(moAirBody);
          viAirBMeshList.push(viAirMesh);
        }
      }
    }
  }
  console.log(" airA(cir):", moAirABodyList.length);
  console.log(" airB(bar):", moAirBBodyList.length);

  // 砂同士は動きやすく／すべりやすく
  const sand_sand = new CANNON.ContactMaterial(moSandMtr, moSandMtr, {
    friction: 0.0001,  // 摩擦係数(def=0.3)
    restitution: 0.01,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e7,    // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(sand_sand)

  const sandB_sandB = new CANNON.ContactMaterial(moSandBMtr, moSandBMtr, {
    friction: 0.0001,  // 摩擦係数(def=0.3)
    restitution: 0.01,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e7,    // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(sandB_sandB)

  const sand_sandB = new CANNON.ContactMaterial(moSandMtr, moSandBMtr, {
    friction: 0.0001,  // 摩擦係数(def=0.3)
    restitution: 0.01,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e7,    // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(sand_sandB)


  // 気泡同士は（きもち）動きやすく／すべりやすく
  const air_air = new CANNON.ContactMaterial(moAirMtr, moAirMtr, {
    friction: 0.01,  // 摩擦係数(def=0.3)
    restitution: 0.01,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e7,    // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(air_air)


  const cntnr_sand = new CANNON.ContactMaterial(moCntnrMtr, moSandMtr, {
    friction: 0.5,  // 摩擦係数(def=0.3)
    restitution: 0.01,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e7,    // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(cntnr_sand)

  const cntnr_sandB = new CANNON.ContactMaterial(moCntnrMtr, moSandBMtr, {
    friction: 0.5,  // 摩擦係数(def=0.3)
    restitution: 0.01,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e7,    // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(cntnr_sandB)

  // 気泡は、ぶつかってから動きにくくさせ..ていたが、砂よりも動きが遅いので軽めの影響に変更
  const cntnr_air = new CANNON.ContactMaterial(moCntnrMtr, moAirMtr, {
    // friction: 0.999,  // 摩擦係数(def=0.3)
    friction: 0.1,  // 摩擦係数(def=0.3)
    restitution: 0.01,  // 反発係数 (def=0.3)
    contactEquationStiffness: 1e7,    // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(cntnr_air)


  function rotAllObject(rotDegree) {
    // 砂、気泡（A)は球形なの位置だけを回転
    // 気泡（B)は直方体なので、位置だけでなく、姿勢（向き）も回転させる
    
    // Z軸で回転
    const vrot = rotDegree / 180 * Math.PI;
    // 原点を通る回転軸（Z軸）で回転させるクォータニオン
    const axisZ = new CANNON.Vec3(0, 0, 1);
    const qrot = new CANNON.Quaternion();
    qrot.setFromAxisAngle(axisZ, vrot);

    // コンテナ
    moCntnrBody.quaternion.copy(moCntnrBody.quaternion.mult(qrot));
    viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
    // sand(a)
    for (var i = 0; i < moSandABodyList.length; ++i) {
      moSandABodyList[i].position.copy(qrot.vmult(moSandABodyList[i].position));
      viSandAMeshList[i].position.copy(moSandABodyList[i].position);
    }
    // sand(b)
    for (var i = 0; i < moSandBBodyList.length; ++i) {
      moSandBBodyList[i].position.copy(qrot.vmult(moSandBBodyList[i].position));
      viSandBMeshList[i].position.copy(moSandBBodyList[i].position);
    }
    // air(a)
    for (var i = 0; i < moAirABodyList.length; ++i) {
      moAirABodyList[i].position.copy(qrot.vmult(moAirABodyList[i].position));
      viAirAMeshList[i].position.copy(moAirABodyList[i].position);
    }
    // air(b)
    for (var i = 0; i < moAirBBodyList.length; ++i) {
      moAirBBodyList[i].position.copy(qrot.vmult(moAirBBodyList[i].position));
      moAirBBodyList[i].quaternion.copy(qrot.mult(moAirBBodyList[i].quaternion));
      viAirBMeshList[i].position.copy(moAirBBodyList[i].position);
      viAirBMeshList[i].quaternion.copy(moAirBBodyList[i].quaternion);
    }
  }



  // Keybindings
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDoen':
      case ' ':
        var rotDegree = 180;
        rotAllObject(rotDegree);
        break;
      case 'ArrowLeft':
        var rotDegree = 10;
        rotAllObject(rotDegree);
        break;
      case 'ArrowRight':
        var rotDegree = -10;
        rotAllObject(rotDegree);
        break;
    }
  })

  // 初期位置
  {
    var px = 0, py = 0, pz = 0;
    // camera.position.set(px+5, py+2, pz+40);  // ちょっとななめから観察
    camera.position.set(px, py, pz+30);  // ちょっとななめから観察
    camera.lookAt(new THREE.Vector3(px, py, pz));
    orbitControls.target = new THREE.Vector3(px, py, pz);
  }

  const timeStep = 1 / 30;
  function animate() {
    world.step(timeStep)

    // 砂(a)（移動）
    for (var i = 0; i < moSandABodyList.length; ++i) {
      viSandAMeshList[i].position.copy(moSandABodyList[i].position);
      viSandAMeshList[i].quaternion.copy(moSandABodyList[i].quaternion);
    }

    // 砂(b)
    for (var i = 0; i < moSandBBodyList.length; ++i) {
      viSandBMeshList[i].position.copy(moSandBBodyList[i].position);
      viSandBMeshList[i].quaternion.copy(moSandBBodyList[i].quaternion);
    }

    // 気泡(a)（移動）+上方への力場
    for (var i = 0; i < moAirABodyList.length; ++i) {
      viAirAMeshList[i].position.copy(moAirABodyList[i].position);
      viAirAMeshList[i].quaternion.copy(moAirABodyList[i].quaternion);
      moAirABodyList[i].applyForce(airAAppF);
    }
    // 気泡(b)
    for (var i = 0; i < moAirBBodyList.length; ++i) {
      viAirBMeshList[i].position.copy(moAirBBodyList[i].position);
      viAirBMeshList[i].quaternion.copy(moAirBBodyList[i].quaternion);
      moAirBBodyList[i].applyForce(airBAppF);
    }

    // OrbitControls のマウス操作に任せる
    orbitControls.update();

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

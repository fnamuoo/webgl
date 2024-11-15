// mode:javascript

// サンドピクチャーもどき（試作品）

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

  // 基準面を作成 (100pixel四方を 5x5分割
  const viBaseGrid = new THREE.GridHelper(100, 10, 0xff8888, 0x404040);
  viBaseGrid.position.set(0, 0, -0.01);
  scene.add(viBaseGrid);


  // コンテナ（容器
  // コンテナ内の (x,y,z)=(横幅、高さ、奥行)
  const cntnrSizeX = 20; const cntnrSizeY = 15; const cntnrSizeZ = 2.5;
  // 平板の厚み
  const cntnrThick = 1;

  const cntnrSizeX_ = cntnrSizeX/2;
  const cntnrSizeY_ = cntnrSizeY/2;
  const cntnrSizeZ_ = cntnrSizeZ/2;
  const cntnrThick_ = cntnrThick/2;

  const cntnrWireframe = true;

  const moCntnrMtr = new CANNON.Material({name: 'container'});

  // X軸 正方向の板
  const moCntnrPltXp2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(cntnrThick_, cntnrSizeY_, cntnrSizeZ_)),
    position: new CANNON.Vec3(cntnrSizeX_+cntnrThick_, cntnrSizeY_, 0),
    material: moCntnrMtr,
  });
  world.addBody(moCntnrPltXp2Body);
  const viCntnrPltXp2Geo = new THREE.BoxGeometry(cntnrThick, cntnrSizeY, cntnrSizeZ);
  const viCntnrPltXp2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, wireframe: cntnrWireframe});
  const viCntnrPltXp2Mesh = new THREE.Mesh(viCntnrPltXp2Geo, viCntnrPltXp2Mtr);
  scene.add(viCntnrPltXp2Mesh);
  viCntnrPltXp2Mesh.position.copy(moCntnrPltXp2Body.position);
  viCntnrPltXp2Mesh.quaternion.copy(moCntnrPltXp2Body.quaternion);

  // X軸 負方向の板
  const moCntnrPltXn2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(cntnrThick_, cntnrSizeY_, cntnrSizeZ_)),
    position: new CANNON.Vec3(-cntnrSizeX_-cntnrThick_, cntnrSizeY_, 0),
    material: moCntnrMtr,
  });
  world.addBody(moCntnrPltXn2Body);
  const viCntnrPltXn2Geo = new THREE.BoxGeometry(cntnrThick, cntnrSizeY, cntnrSizeZ);
  const viCntnrPltXn2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, wireframe: cntnrWireframe});
  const viCntnrPltXn2Mesh = new THREE.Mesh(viCntnrPltXn2Geo, viCntnrPltXn2Mtr);
  scene.add(viCntnrPltXn2Mesh);
  viCntnrPltXn2Mesh.position.copy(moCntnrPltXn2Body.position);
  viCntnrPltXn2Mesh.quaternion.copy(moCntnrPltXn2Body.quaternion);


  // Y軸 正方向の板
  const moCntnrPltYp2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(cntnrSizeX_, cntnrThick_, cntnrSizeZ_)),
    position: new CANNON.Vec3(0, cntnrSizeY+cntnrThick_, 0),
    material: moCntnrMtr,
  });
  world.addBody(moCntnrPltYp2Body);
  const viCntnrPltYp2Geo = new THREE.BoxGeometry(cntnrSizeX, cntnrThick, cntnrSizeZ);
  const viCntnrPltYp2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, wireframe: cntnrWireframe});
  const viCntnrPltYp2Mesh = new THREE.Mesh(viCntnrPltYp2Geo, viCntnrPltYp2Mtr);
  scene.add(viCntnrPltYp2Mesh);
  viCntnrPltYp2Mesh.position.copy(moCntnrPltYp2Body.position);
  viCntnrPltYp2Mesh.quaternion.copy(moCntnrPltYp2Body.quaternion);

  const moCntnrPltYn2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(cntnrSizeX_, cntnrThick_, cntnrSizeZ_)),
    position: new CANNON.Vec3(0, -cntnrThick_, 0),
    material: moCntnrMtr,
  });
  world.addBody(moCntnrPltYn2Body);
  const viCntnrPltYn2Geo = new THREE.BoxGeometry(cntnrSizeX, cntnrThick, cntnrSizeZ);
  const viCntnrPltYn2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, wireframe: cntnrWireframe});
  const viCntnrPltYn2Mesh = new THREE.Mesh(viCntnrPltYn2Geo, viCntnrPltYn2Mtr);
  scene.add(viCntnrPltYn2Mesh);
  viCntnrPltYn2Mesh.position.copy(moCntnrPltYn2Body.position);
  viCntnrPltYn2Mesh.quaternion.copy(moCntnrPltYn2Body.quaternion);

  // Z軸 正方向の板
  const moCntnrPltZp2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(cntnrSizeX_, cntnrSizeY_, cntnrThick_)),
    position: new CANNON.Vec3(0, cntnrSizeY_, cntnrSizeZ_+cntnrThick_),
    material: moCntnrMtr,
  });
  world.addBody(moCntnrPltZp2Body);
  const viCntnrPltZp2Geo = new THREE.BoxGeometry(cntnrSizeX, cntnrSizeY, cntnrThick);
  const viCntnrPltZp2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, wireframe: cntnrWireframe});
  const viCntnrPltZp2Mesh = new THREE.Mesh(viCntnrPltZp2Geo, viCntnrPltZp2Mtr);
  scene.add(viCntnrPltZp2Mesh);
  viCntnrPltZp2Mesh.position.copy(moCntnrPltZp2Body.position);
  viCntnrPltZp2Mesh.quaternion.copy(moCntnrPltZp2Body.quaternion);

  const moCntnrPltZn2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(cntnrSizeX_, cntnrSizeY_, cntnrThick_)),
    position: new CANNON.Vec3(0, cntnrSizeY_, -cntnrSizeZ_-cntnrThick_),
    material: moCntnrMtr,
  });
  world.addBody(moCntnrPltZn2Body);
  const viCntnrPltZn2Geo = new THREE.BoxGeometry(cntnrSizeX, cntnrSizeY, cntnrThick);
  const viCntnrPltZn2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1, wireframe: cntnrWireframe});
  const viCntnrPltZn2Mesh = new THREE.Mesh(viCntnrPltZn2Geo, viCntnrPltZn2Mtr);
  scene.add(viCntnrPltZn2Mesh);
  viCntnrPltZn2Mesh.position.copy(moCntnrPltZn2Body.position);
  viCntnrPltZn2Mesh.quaternion.copy(moCntnrPltZn2Body.quaternion);

  // コンテナ（中身：砂、空気
  // 砂
  const moSandMtr = new CANNON.Material({name: 'sand', restitution: 0});
  const sndMass = 0.1;
  const sndSizeR = 0.5;
  const sndSizeR2 = sndSizeR*2;
  const sndFillRngYmin = cntnrSizeY*0.6;
  const sndFillRngYmax = cntnrSizeY*0.8;
  var moSandBodyList = [];
  var viSandMeshList = [];
  // 砂 - 充填
  const rndRange = 0.1;
  for (var y = sndFillRngYmin; y < sndFillRngYmax; y+= sndSizeR2) {
    for (var x = -cntnrSizeX_+sndSizeR; x <= cntnrSizeX_-sndSizeR; x+= sndSizeR2) {
      for (var z = -cntnrSizeZ_+sndSizeR; z <= cntnrSizeZ_-sndSizeR; z+= sndSizeR2) {
        var x2 = x + (Math.random() - 0.5) * rndRange;
        var z2 = z + (Math.random() - 0.5) * rndRange;
        const moSandBody = new CANNON.Body({
          mass: sndMass,
          shape: new CANNON.Sphere(sndSizeR),
          position: new CANNON.Vec3(x2, y, z2),
          material: moSandMtr
        });
        world.addBody(moSandBody);
        const viSandGeo = new THREE.SphereGeometry(sndSizeR);
        const viSandMtr = new THREE.MeshNormalMaterial();
        const viSandMesh = new THREE.Mesh(viSandGeo, viSandMtr);
        scene.add(viSandMesh);
        moSandBodyList.push(moSandBody);
        viSandMeshList.push(viSandMesh);
      }
    }
  }


  // 気泡
  const moAirMtr = new CANNON.Material({name: 'air', restitution: 0});
  const airMass = 0.01;
  const airSizeR = 0.4;
  const airSizeR2 = airSizeR*2;
  const airFillRngYmin = cntnrSizeY*0.1;
  const airFillRngYmax = airFillRngYmin + airSizeR2*3;
  const airAppF = new CANNON.Vec3(0, 0.5, 0);
  var moAirBodyList = [];
  var viAirMeshList = [];
  // 気泡 - 充填
  const rndRange2 = 0.1;
  for (var y = airFillRngYmin; y < airFillRngYmax; y+= airSizeR2) {
    for (var x = -cntnrSizeX_+airSizeR; x <= cntnrSizeX_-airSizeR; x+= airSizeR2) {
      for (var z = -cntnrSizeZ_+airSizeR; z <= cntnrSizeZ_-airSizeR; z+= airSizeR2) {
        var x2 = x + (Math.random() - 0.5) * rndRange2;
        var z2 = z + (Math.random() - 0.5) * rndRange2;
        const moAirBody = new CANNON.Body({
          mass: airMass,
          shape: new CANNON.Sphere(airSizeR),
          position: new CANNON.Vec3(x2, y, z2),
          material: moAirMtr
        });
        moAirBody.applyForce(airAppF);
        world.addBody(moAirBody);
        const viAirGeo = new THREE.SphereGeometry(airSizeR);
        const viAirMtr = new THREE.MeshNormalMaterial({transparent: true, opacity: 0.2});
        const viAirMesh = new THREE.Mesh(viAirGeo, viAirMtr);
        scene.add(viAirMesh);
        moAirBodyList.push(moAirBody);
        viAirMeshList.push(viAirMesh);
      }
    }
  }


  // 球 作成
  const radius = 5;
  // moSphereMtr.restitution = 1;  // 反発係数 1:跳ねやすい  /  0:跳ねない
  const moSphereMtr = new CANNON.Material({name: 'name2', restitution: 0});
  // const moSphereMtr = new CANNON.Material({name: 'name2', restitution: 1});
  const moSphereBody = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Sphere(radius),
    position: new CANNON.Vec3(-20, 12, -10),
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
    contactEquationStiffness: 1000,  // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう
  })
  world.addContactMaterial(sphere_ground)


  var cameraPosi = 0;

  // Keybindings
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'c':
        cameraPosi = (cameraPosi + 1) % 5;
        break;
    }
  })

  // 初期位置
  {
    var px = 0, py = cntnrSizeY_, pz = 0;
    camera.position.set(px, py+5, pz+80);
    camera.lookAt(new THREE.Vector3(px, py, pz));
  }

  const timeStep = 1 / 60;
  function animate() {
    world.step(timeStep)

    // 砂（移動）
    for (var i = 0; i < moSandBodyList.length; ++i) {
      viSandMeshList[i].position.copy(moSandBodyList[i].position);
      viSandMeshList[i].quaternion.copy(moSandBodyList[i].quaternion);
    }

    // 気泡（移動＋力）
    for (var i = 0; i < moAirBodyList.length; ++i) {
      viAirMeshList[i].position.copy(moAirBodyList[i].position);
      viAirMeshList[i].quaternion.copy(moAirBodyList[i].quaternion);
      moAirBodyList[i].applyForce(airAppF);
    }

    // 球（移動）
    viSphereMesh.position.copy(moSphereBody.position);
    viSphereMesh.quaternion.copy(moSphereBody.quaternion);


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

// mode:javascript

import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "orbitcontrols";
import * as vb from "VehicleBase";

var iniX = -10;
var iniY = 5;
var iniZ = -10;
var iniRotY = 0

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

var ivehicle = 0;

window.onload = () => {
  const {world, camera, scene, renderer, orbitControls} = setupWorld();

  const moGroundMtr = new CANNON.Material({name: 'ground'})

    var vehicleList = [];
    var vehicle1;
    if (1) {
      vehicle1 = new vb.VehicleFR01(scene, world, moGroundMtr);
      vehicle1.init();
      vehicleList.push(vehicle1);
      const vehicle2 = new vb.VehicleFR02(scene, world, moGroundMtr);
      vehicle2.init();
      vehicleList.push(vehicle2);
      const vehicle3 = new vb.VehicleFF01(scene, world, moGroundMtr);
      vehicle3.init();
      vehicleList.push(vehicle3);
      const vehicle4 = new vb.VehicleFF02(scene, world, moGroundMtr);
      vehicle4.init();
      vehicleList.push(vehicle4);
      const vehicle5 = new vb.Vehicle4WD01(scene, world, moGroundMtr);
      vehicle5.init();
      vehicleList.push(vehicle5);
      const vehicle6 = new vb.Vehicle4WD02(scene, world, moGroundMtr);
      vehicle6.init();
      vehicleList.push(vehicle6);
    }

    if (0) {
      vehicle1 = new vb.VehicleFR11(scene, world, moGroundMtr);
      vehicle1.init();
      vehicleList.push(vehicle1);
      const vehicle2 = new vb.VehicleFR12(scene, world, moGroundMtr);
      vehicle2.init();
      vehicleList.push(vehicle2);
      const vehicle3 = new vb.VehicleFF11(scene, world, moGroundMtr);
      vehicle3.init();
      vehicleList.push(vehicle3);
      const vehicle4 = new vb.VehicleFF12(scene, world, moGroundMtr);
      vehicle4.init();
      vehicleList.push(vehicle4);
      const vehicle5 = new vb.Vehicle4WD11(scene, world, moGroundMtr);
      vehicle5.init();
      vehicleList.push(vehicle5);
      const vehicle6 = new vb.Vehicle4WD12(scene, world, moGroundMtr);
      vehicle6.init();
      vehicleList.push(vehicle6);
    }

    // Build the car chassis
    var vehicle = vehicle1;
    ivehicle = 0;

    for (let i = 0; i < 3; ++i) {
      world.step(1/60)

      for (let ii = 0; ii < vehicleList.length; ++ii) {
        vehicleList[ii].setPosition(iniX-5*ii, iniY, iniZ-2*ii, iniRotY);
        vehicleList[ii].viewUpdate();
      }
    }

  // ----------------------------------------
  // コース
  const grndw = 400; const grndh = 300;
  const moGround2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(grndw, 0.5, grndh)),
    position: new CANNON.Vec3(0, -0.5, 0),
    material: moGroundMtr,
  });
  world.addBody(moGround2Body);
  const viGround2Geo = new THREE.BoxGeometry(grndw*2, 1, grndh*2);
  const texture = new THREE.TextureLoader().load('./pic/test_course.png'); 
  const viGround2Mtr = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 0.4});
  const viGround2Mesh = new THREE.Mesh(viGround2Geo, viGround2Mtr);
  scene.add(viGround2Mesh);
  viGround2Mesh.position.copy(moGround2Body.position);
  viGround2Mesh.quaternion.copy(moGround2Body.quaternion);

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



  var cameraPosi = 0;


  // Keybindings
  // Add force on keydown
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowUp':
        vehicle.keydown_ArrowUp();
        break
      case 'ArrowDown':
        vehicle.keydown_ArrowDown();
        break

      case 'ArrowLeft':
        vehicle.keydown_ArrowLeft();
        break
      case 'ArrowRight':
        vehicle.keydown_ArrowRight();
        break

      case 'b':
        vehicle.keydown_break();
        break

      case 'n':
        vehicle.keydown_sidebreak();
        break

      case 'c':
        cameraPosi = (cameraPosi + 1) % 5;
        break;

      // case 'p':
      case 'r':
        // 車の姿勢を戻す／車をひっくり返す ..
        vehicle.keydown_resetPosture();
        break;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
        // 車の切り替え
        var iv = parseInt(event.key)-1
        if (ivehicle != iv) {
          // 交換先の車の座標と入れ替える
          var px, py, pz;
          [px, py, pz] = vehicle.getPosition();
          var px2, py2, pz2;
          [px2, py2, pz2] = vehicleList[iv].getPosition();
          vehicle.setPosition(px2, py2+2, pz2, 0.0);
          for (let i = 0; i < 3; ++i) {
            world.step(1/60)
            vehicle.viewUpdate();
          }
          ivehicle = iv;
          vehicle = vehicleList[iv];
          vehicle.setPosition(px, py, pz, 0.0);
        }
        break;

    }
  })

  // Reset force on keyup
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'ArrowUp':
        vehicle.keyup_ArrowUp();
        break
      case 'ArrowDown':
        vehicle.keyup_ArrowDown();
        break

      case 'ArrowLeft':
        vehicle.keyup_ArrowLeft();
        break
      case 'ArrowRight':
        vehicle.keyup_ArrowRight();
        break

      case 'b':
        vehicle.keyup_break();
        break

    }
  })

  // 初期位置
  {
    vehicle.setPosition(iniX, iniY, iniZ, iniRotY);

    var px, py, pz;
    [px, py, pz] = vehicle.getPosition();
    camera.position.set(px, py, pz+100);
    camera.lookAt(new THREE.Vector3(px, py, pz));
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
    vehicle.viewUpdate();

      // カメラ・視点 関連
      var chassisBody = vehicle.getModel().chassisBody;
      var vposi = chassisBody.position;
      var vquat = chassisBody.quaternion;

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
        // // カスタムなの自動回転
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

// mode:javascript

// 車の挙動を変更するために、github の025 をベースに

// - 025_2
//   - スピードメータを左下に表示

// - 025_3
//   - マップ（トップビュー）を左下に表示
//   - スピードメータを右下に再配置

// - 025_4
//   - ギア(MT)の導入／トルク曲線（エンジン性能曲線）にそった挙動
//   - シフトを中央上部に表示
//
//   - トルクと馬力の話
//      https://www.goo-net.com/magazine/carmaintenance/repair/216151/


import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "orbitcontrols";
import * as vb from "VehicleBase";

const timeStep = 1 / 60;
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
    const canvasElement = document.querySelector("#mainCanvas");
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

function setupWorld2() {
  var camera2;
  var scene2;
  var renderer2;
  {
    const width = window.innerWidth/4 - 24;
    const height = window.innerHeight/4 - 24;

    // Camera
    camera2 = new THREE.PerspectiveCamera(24, width / height, 5, 2000)

    camera2.position.set(0, 20, 30)
    camera2.lookAt(0, 0, 0)

    // Scene
    scene2 = new THREE.Scene()

    // Renderer
    const canvasElement = document.querySelector("#mapCanvas");
    renderer2 = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true })
    renderer2.setSize(width, height);
    renderer2.shadowMap.enabled = true
    renderer2.shadowMap.type = THREE.PCFSoftShadowMap

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene2.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.15)
    directionalLight.position.set(-30, 10000, 30)
    directionalLight.target.position.set(0, 0, 0)
    scene2.add(directionalLight)
  }

  return {camera2, scene2, renderer2};
}

var ivehicle = 0;

window.onload = () => {
  const {world, camera, scene, renderer, orbitControls} = setupWorld();
  const {camera2, scene2, renderer2} = setupWorld2();

  const moGroundMtr = new CANNON.Material({name: 'ground'})

  var vehicleList = [];
  var vehicle1;
  if (1) {
    vehicle1 = new vb.VehicleFR01(scene, world, moGroundMtr);
    vehicle1.init();
    vehicleList.push(vehicle1);
    const vehicle2 = new vb.VehicleFR01b(scene, world, moGroundMtr);
    vehicle2.init();
    vehicleList.push(vehicle2);
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

  // scene2 用の車（代わりのマーカー）
  const viVehicleMarkerGeo = new THREE.SphereGeometry(3);
  const viVehicleMarkerMtr = new THREE.MeshBasicMaterial({color:0xffffff});
  const viVehicleMarkerMesh = new THREE.Mesh(viVehicleMarkerGeo, viVehicleMarkerMtr);
  scene2.add(viVehicleMarkerMesh);

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

  const viGround2Geo2 = new THREE.BoxGeometry(grndw*2, 1, grndh*2);
  const texture2 = new THREE.TextureLoader().load('./pic/test_course.png'); 
  const viGround2Mtr2 = new THREE.MeshBasicMaterial({map: texture2, transparent: true, opacity: 0.4});
  const viGround2Mesh2 = new THREE.Mesh(viGround2Geo2, viGround2Mtr2);
  scene2.add(viGround2Mesh2);


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

 // キー同時押しのときに、挙動が思ったようにならない
 // - ArrowUp を押したまま、 ArrowLeft を押して放しても、「ArrowUp の keydown」イベントが発生しない
 // 再度キーを押下するとイベント発生することから、
 // 下記のよう キーイベント発生時の状態を記録する（保持する）挙動に切り替える
 // 但し、対象は (アクセル操作、ハンドル、ブレーキ（サイドブレーキ）、バック)に限る
  var keyEvnt = {
    forwards:false,
    backwards:false,
    left:false,
    right:false,
    brake:false,
    sidebrake:false
  };

  // Keybindings
  // Add force on keydown
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowUp':
        keyEvnt.forwards = true;
        break
      case 'ArrowDown':
        keyEvnt.backwards = true;
        break
      case 'ArrowLeft':
        keyEvnt.left = true;
        break
      case 'ArrowRight':
        keyEvnt.right = true;
        break
      case 'b':
        keyEvnt.brake = true;
        break
      case 'n':
        keyEvnt.sidebrake = (keyEvnt.sidebrake) ? false : true;
        break
      case 'x':
        vehicle.keydown_shift_up();
        break;
      case 'z':
        vehicle.keydown_shift_down();
        break;
      case 'c':
        cameraPosi = (cameraPosi + 1) % 5;
        break;
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
      case ' ':
        var speed = vehicle.getSpeed();
        speed = parseInt(speed*10)/10.0;
        console.log("speed:", speed);
    }
  })

  // Reset force on keyup
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'ArrowUp':
        keyEvnt.forwards = false;
        break
      case 'ArrowDown':
        keyEvnt.backwards = false;
        break
      case 'ArrowLeft':
        keyEvnt.left = false;
        break
      case 'ArrowRight':
        keyEvnt.right = false;
        break
      case 'b':
        keyEvnt.brake = false;
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
    // 車関連(押しっぱなし／同時押しの key-event処理)
    {
      if (keyEvnt.forwards) {
        vehicle.keydown_ArrowUp();
      } else if (keyEvnt.backwards) {
        vehicle.keydown_ArrowDown();
      } else {
        vehicle.keyup_ArrowUp();
      }

      if (keyEvnt.left) {
        vehicle.keydown_ArrowLeft();
      } else if (keyEvnt.right) {
        vehicle.keydown_ArrowRight();
      } else {
        vehicle.keyup_ArrowLeft();
      }

      if (keyEvnt.brake) {
        vehicle.keydown_brake();
      // } else if (vehicle.sidebrake_) {
      } else if (keyEvnt.sidebrake) {
        vehicle.keydown_sidebrake();
      } else {
        vehicle.keyup_brake();
      }
    }

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

    renderer.render(scene, camera);

    {
      viVehicleMarkerMesh.position.copy(vposi);

      // 左下　マップ欄　更新
      // camera2.position.set(vposi.x, vposi.y + 200, vposi.z);
      camera2.position.set(vposi.x, vposi.y + 400, vposi.z);
      camera2.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));
      var veuler = new CANNON.Vec3(0, 0, 0);
      vquat.toEuler(veuler);
      var viecleRotY = veuler.y + Math.PI / 2;  // X軸負の方向を向いて作成したので、上を向くよう90度ずらす
      camera2.rotation.z = viecleRotY;
      renderer2.render(scene2, camera2);
    }
    {
      // 中央下のシフトレバー欄　更新
      var vshiftlever = vehicle.shiftlever_;
      var vrot    = vehicle.moVehicle_.wheelInfos[2].deltaRotation;
      var vrotmax = vehicle.deltaRotMax_;
      var vrate = parseInt(100*vrot/vrotmax);
      setShift(vshiftlever, vrate);
    }
    {
      // 右下のスピードメーター欄　更新
      var speed = vehicle.getSpeed();
      speed = parseInt(speed*10)/10.0;
      setSpeed(speed);
    }

    requestAnimationFrame(animate)
  }

  animate();
};

function setShift(vshiftlever, vrate) {
    const canvas = document.getElementById('shiftCanvas');
    const ctxspd = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 100;
    ctxspd.font = '60px bold sans-serif';
    ctxspd.textBaseline = 'alphabetic';
    ctxspd.textAlign = 'start';
    ctxspd.fillStyle = 'white';
    if (vrate < 40) {
        ctxspd.fillStyle = 'cyan';
    } else if (vrate > 90) {
        ctxspd.fillStyle = 'red';
    } else if (vrate > 75) {
        ctxspd.fillStyle = 'yellow';
    }
    ctxspd.fillText(""+vshiftlever, 60, 70);

    ctxspd.font = '16px bold sans-serif';
    ctxspd.fillText(""+vrate+" %", 120, 80);
};

function setSpeed(speed) {
    const canvas = document.getElementById('speedCanvas');
    const ctxspd = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 40;
    ctxspd.font = '20px bold sans-serif';
    ctxspd.textBaseline = 'alphabetic';
    ctxspd.textAlign = 'start';
    ctxspd.fillStyle = 'white';
    ctxspd.fillText("speed: "+speed, 20, 22);
};

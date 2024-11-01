// mode:javascript


// 22_1 : dem.csv の減量の挑戦(org/テキスト)  小数点以下16桁  (16~17[byte/value])
// 22_2 : バイナリ化(float32)                 float32         (    4[byte/value])
// 22_3 : バイナリ化(int16)                   0.001/0.01精度  (    2[byte/value])

import * as THREE from "three";
import * as CANNON from "cannon";

import { OrbitControls } from "orbitcontrols";
import * as vb from "VehicleBase";

var Dem          = "./data/py/dem_out_mrg.csv";
var texturefpath = './data/py/texture_mrg.png';
var ampHigh = 1;
var iniX = 0; var iniY = 0; var iniZ = 0; var iniRotY = 0

var bWireframe = true;
// bWireframe = false;

var Demtxt         = "./data/test_demTotal.csv";
var Dembin         = "./data/test_demTotal.bin.f32";
var DembinI16v1    = "./data/test_demTotal.bin.i16v1";
var DembinI16v2    = "./data/test_demTotal.bin.i16v2";
var texturefpath = './pic/BoxySVG_test1_3_400x300.png';
var sizeX = 101; var sizeZ = 101;
var lengthX = 300;
var lengthZ = sizeZ*lengthX/sizeX;
iniX = lengthX*20/sizeX; iniZ = lengthZ*20/sizeZ; iniRotY = -0.5; iniY = -100; ampHigh = 1;


const ampHighAdj = 200;


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

async function loadDemCSVcore2(Dem, demw, demh, ampHigh) {
  var matrix = [];
  var vzmax = 0;
  await fetch(Dem)
  .then(response => response.text())
  .then(data => {
        let view = data.replace(/\n/g, ",").split(",");
        console.log("## view.length     = ",view.length);
        console.log("## view.byteLength = ",view.byteLength);
        console.log("##  view[0] = ",view[0]);
        console.log("##  view[1] = ",view[1]);
        var vMeshSizeW = demw-1;  // sizeX-1;
        var vMeshSizeH = demh-1;  // sizeZ-1;
        for(let iz = 0; iz <= vMeshSizeH; iz++){
          matrix.push([])
          for(let ix = 0; ix <= vMeshSizeW; ix++){
            var idx = iz * (vMeshSizeW+1) + ix;
            const vz = view[idx] * ampHigh;
            matrix[iz].push(vz);
            if (vzmax < vz) {
              vzmax = vz;
            }
          }
        }
        console.log("##  stored matrix end");
  })
  .catch(error => {
    console.error('エラー:', error);
  });
  return {matrix, vzmax};
}

function loadDemCSVcore(Dem, demw, demh, ampHigh) {
  var matrix = [];
  var vzmax = 0;
  {
    var vSceneMesh = null;
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', function(evt) {
            vSceneMesh = (evt.target.response || evt.target.responseText).replace(/\n/g, ",").split(",");
            var vMeshSizeW = sizeX-1;
            var vMeshSizeH = sizeZ-1;
        console.log("##  vSceneMesh[0] = ",vSceneMesh[0]);
        console.log("##  vSceneMesh[1] = ",vSceneMesh[1]);
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
        xhr.open('GET', Dem, false);  // 三番目にfalseで, 同期処理に
        xhr.send(null);
  }
    return {matrix, vzmax};
}

async function loadDemCSV(Dem, demw, demh, ampHigh) {
  var matrix = [];
  var vzmax = 0;
  var {matrix, vzmax} = await loadDemCSVcore2(Dem, demw, demh, ampHigh); // ok

  // matrix のZ軸を入れ替え
  console.log("#   matrix=", matrix);
  console.log("#   vzmax=", vzmax);
  {
    var matrix_ = [];
    const sizeZ_ = sizeZ - 1;
    for (let iz = 0; iz < sizeZ; ++iz) {
      matrix_.push(matrix[sizeZ_-iz])
    }
    matrix = matrix_
  }
  // 物理系 heighfield 用に 軸を入れ替えたデータを用意する
  var momatrix = []
  for (let ix = 0; ix < sizeX; ++ix) {
    momatrix.push([])
    for (let iz = 0; iz < sizeZ; ++iz) {
      momatrix[ix].push(matrix[iz][ix])
    }
  }
  return {matrix, momatrix, vzmax};
}

async function loadDemBINcore(Dem, demw, demh, ampHigh) {
  var matrix = [];
  var vzmax = 0;
  console.log("# loadDemBINcore()  start")
  {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.addEventListener('load', function(evt) {
        let ressponse = evt.target.response;
        let view = new Float32Array(ressponse);
        console.log("## view.length     = ",view.length);
        console.log("## view.byteLength = ",view.byteLength);
        console.log("##  view[0] = ",view[0]);
        console.log("##  view[1] = ",view[1]);
        var vMeshSizeW = demw-1;  // sizeX-1;
        var vMeshSizeH = demh-1;  // sizeZ-1;
        for(let iz = 0; iz <= vMeshSizeH; iz++){
          matrix.push([])
          for(let ix = 0; ix <= vMeshSizeW; ix++){
            var idx = iz * (vMeshSizeW+1) + ix;
            const vz = view[idx] * ampHigh;
            matrix[iz].push(vz);
            if (vzmax < vz) {
              vzmax = vz;
            }
          }
        }
        console.log("##  stored matrix end");
    }, false);
    // xhr.open('GET', Dem, false);  // 三番目にfalseで, 同期処理に変更
    xhr.open('GET', Dem);
    xhr.send(null);
  }
  console.log("# loadDemBINcore()  end")
  return {matrix, vzmax};
}

async function loadDemBINcore2(Dem, demw, demh, ampHigh) {
  // fetchを使ったファイル読み込みの書き方（１）
  var matrix = [];
  var vzmax = 0;
  await fetch(Dem)
  .then(response => response.arrayBuffer())
  .then(data => {
        let view = new Float32Array(data);
        console.log("## view.length     = ",view.length);
        console.log("## view.byteLength = ",view.byteLength);
        console.log("##  view[0] = ",view[0]);
        console.log("##  view[1] = ",view[1]);
        var vMeshSizeW = demw-1;  // sizeX-1;
        var vMeshSizeH = demh-1;  // sizeZ-1;
        for(let iz = 0; iz <= vMeshSizeH; iz++){
          matrix.push([])
          for(let ix = 0; ix <= vMeshSizeW; ix++){
            var idx = iz * (vMeshSizeW+1) + ix;
            const vz = view[idx] * ampHigh;
            matrix[iz].push(vz);
            if (vzmax < vz) {
              vzmax = vz;
            }
          }
        }
        console.log("##  stored matrix end");
  })
  .catch(error => {
    console.error('エラー:', error);
  });
  return {matrix, vzmax};
}

async function loadDemBINcore3(Dem, demw, demh, ampHigh) {
  // fetchを使ったファイル読み込みの書き方（２）
  var matrix = [];
  var vzmax = 0;
  const res = await fetch(Dem);
  const arrayBuffer = await res.arrayBuffer();
  let view = new Float32Array(arrayBuffer);
  console.log("## view.length     = ",view.length);
  console.log("## view.byteLength = ",view.byteLength);
  console.log("##  view[0] = ",view[0]);
  console.log("##  view[1] = ",view[1]);
  var vMeshSizeW = demw-1;  // sizeX-1;
  var vMeshSizeH = demh-1;  // sizeZ-1;
  for(let iz = 0; iz <= vMeshSizeH; iz++){
    matrix.push([])
    for(let ix = 0; ix <= vMeshSizeW; ix++){
      var idx = iz * (vMeshSizeW+1) + ix;
      const vz = view[idx] * ampHigh;
      matrix[iz].push(vz);
      if (vzmax < vz) {
        vzmax = vz;
      }
    }
  }
  console.log("##  stored matrix end");
  return {matrix, vzmax};
}


async function loadDemBINcoreI16Vx(Dem, demw, demh, ampHigh) {
  // ファイルの先頭２バイトにファイル種別を入れて、自動判別させる版
  var matrix = [];
  var vzmax = 0;
  const res = await fetch(Dem);
  const arrayBuffer = await res.arrayBuffer();
  let view = new Uint16Array(arrayBuffer);
  console.log("## view.length     = ",view.length);
  console.log("## view.byteLength = ",view.byteLength);
  console.log("##  view[0] = ",view[0]);
  console.log("##  view[1] = ",view[1]);
  let ver = view[0];
  if (ver==1) {
    let vi = view[1];
    let vf = view[2]/1000.0;
    if (vi > 32767) {
      vi = 32767 - vi;
    }
    let vmin = vi + vf;
    var vMeshSizeW = demw-1;  // sizeX-1;
    var vMeshSizeH = demh-1;  // sizeZ-1;
    for(let iz = 0; iz <= vMeshSizeH; iz++){
      matrix.push([])
      for(let ix = 0; ix <= vMeshSizeW; ix++){
        var idx = iz * (vMeshSizeW+1) + ix;
        let v = view[idx+3];
        v = v/1000.0 + vmin;
        const vz = v * ampHigh;
        matrix[iz].push(vz);
        if (vzmax < vz) {
          vzmax = vz;
        }
      }
    }

  } else if (ver==2) {
    let vi = view[1];
    let vf = view[2]/1000.0;
    if (vi > 32767) {
      vi = 32767 - vi;
    }
    let vmin = vi + vf;
    var vMeshSizeW = demw-1;  // sizeX-1;
    var vMeshSizeH = demh-1;  // sizeZ-1;
    for(let iz = 0; iz <= vMeshSizeH; iz++){
      matrix.push([])
      for(let ix = 0; ix <= vMeshSizeW; ix++){
        var idx = iz * (vMeshSizeW+1) + ix;
        let v = view[idx+3];
        v = v/100.0 + vmin;
        const vz = v * ampHigh;
        matrix[iz].push(vz);
        if (vzmax < vz) {
          vzmax = vz;
        }
      }
    }

  } else {
    console.log("##  unsupport ver=", ver);
  }

  return {matrix, vzmax};
}

async function loadDemBIN(Dem, demw, demh, ampHigh) {
  console.log("# loadDemBIN()  start")
  var matrix = [];
  var vzmax = 0;
  var loadend = 0;
//  var {matrix, vzmax} = await loadDemBINcore2(Dem, demw, demh, ampHigh);
  var {matrix, vzmax} = await loadDemBINcore3(Dem, demw, demh, ampHigh);

  // return {matrix, vzmax};
  // matrix のZ軸を入れ替え
  console.log("# loadDemBIN()  swap z axis");
  console.log("#   matrix=", matrix);
  var matrix_ = [];
  const demh_ = demh - 1;
  for (let iz = 0; iz < demh; ++iz) {
    matrix_.push(matrix[demh_-iz]);
  }
  matrix = matrix_;
  // 物理系 heighfield 用に 軸を入れ替えたデータを用意する
  console.log("# loadDemBIN()  swap axis for Ph")
  var momatrix = [];
  for (let ix = 0; ix < demw; ++ix) {
    momatrix.push([]);
    for (let iz = 0; iz < demh; ++iz) {
      momatrix[ix].push(matrix[iz][ix]);
    }
  }
  console.log("# loadDemBIN()  end")
  return {matrix, momatrix, vzmax};
}

async function loadDemBIN2(Dem, demw, demh, ampHigh) {
  console.log("# loadDemBIN()  start")
  var matrix = [];
  var vzmax = 0;
  var loadend = 0;

  var {matrix, vzmax} = await loadDemBINcoreI16Vx(Dem, demw, demh, ampHigh);

  // return {matrix, vzmax};
  // matrix のZ軸を入れ替え
  console.log("# loadDemBIN()  swap z axis");
  console.log("#   matrix=", matrix);
  var matrix_ = [];
  const demh_ = demh - 1;
  for (let iz = 0; iz < demh; ++iz) {
    matrix_.push(matrix[demh_-iz]);
  }
  matrix = matrix_;
  // 物理系 heighfield 用に 軸を入れ替えたデータを用意する
  console.log("# loadDemBIN()  swap axis for Ph")
  var momatrix = [];
  for (let ix = 0; ix < demw; ++ix) {
    momatrix.push([]);
    for (let iz = 0; iz < demh; ++iz) {
      momatrix[ix].push(matrix[iz][ix]);
    }
  }
  console.log("# loadDemBIN()  end")
  return {matrix, momatrix, vzmax};
}

function createGroundGeo(matrix, momatrix, texturefpath, sizeX, sizeZ, lengthX, lengthZ, posiX, posiZ, moGroundMtr, bWireframe) {
  const sizeX_ = sizeX-1;
  const sizeZ_ = sizeZ-1;
  const elemSizeX = lengthX / sizeX_;
  const elemSizeZ = lengthZ / sizeZ_;
  const moHeightfieldShape = new CANNON.Heightfield(momatrix, {elementSize: elemSizeX,})
  var moGroundBody = new CANNON.Body({ mass: 0, material: moGroundMtr })
  moGroundBody.addShape(moHeightfieldShape)
  // body の中心位置が、原点に来るように位置を調整
  moGroundBody.position.set(
    -lengthX/2 + posiX,
    0, // -1,
    lengthZ/2 + posiZ
  )
  moGroundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  const viGroundGeo = new THREE.BufferGeometry();
  var viPos = new Float32Array(sizeX*sizeZ*3);
  {
    // ポリゴンの頂点座標の配列（Polygon's positon array)
    var n=0;
    for(var iz = 0; iz < sizeZ; iz++){ 
      for(var ix = 0; ix < sizeX; ix++){
        viPos[n] = ix * elemSizeX; n++;
        viPos[n] = iz * elemSizeZ; n++;
        viPos[n] = matrix[iz][ix]; n++;
      }
    }
    // ポリゴンの三角形をインデックスで指定(Polugon's index array)
    n=0;
    var index = new Uint32Array(3*(sizeX_*sizeZ_*2));
    for(var iz=sizeZ_-1; iz >= 0; --iz){ // 入力データの並びと表示を合わせるよう逆順で
      for(var ix=0; ix < sizeX_; ix++){
        index[n] = iz*sizeX + ix; n++;
        index[n] = iz*sizeX + ix + 1; n++;
        index[n] = (iz+1)*sizeX + ix + 1; n++;
        index[n] = iz*sizeX + ix; n++;
        index[n] = (iz+1)*sizeX + ix + 1; n++;
        index[n] = (iz+1)*sizeX + ix; n++;
      }
    }
    // ポリゴンのTexture位置座標の配列 (Texture uv positions array)
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
    viGroundGeo.setAttribute("position", new THREE.BufferAttribute(viPos, 3));
    viGroundGeo.setIndex(new THREE.BufferAttribute(index,1)); 
    viGroundGeo.computeVertexNormals();
    viGroundGeo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  }
  const texture = new THREE.TextureLoader().load(texturefpath); 
  var viGroundMtr;
  if (bWireframe == true) {
    viGroundMtr = new THREE.MeshStandardMaterial({color:0xffffff, map: texture, side:THREE.DoubleSide, wireframe: true});
  } else {
    viGroundMtr = new THREE.MeshStandardMaterial({color:0xffffff, map: texture, side:THREE.DoubleSide, });
  }
  var viGroundMesh = new THREE.Mesh(viGroundGeo, viGroundMtr);
  viGroundMesh.position.copy(moGroundBody.position);
  viGroundMesh.quaternion.copy(moGroundBody.quaternion);
  return {moGroundBody, viGroundMesh, moHeightfieldShape, viGroundMtr, viPos, viGroundGeo};
}

var ivehicle = 0;

window.onload = async() => {
  const {world, camera, scene, renderer, orbitControls} = setupWorld();

  const moGroundMtr = new CANNON.Material({name: 'ground'})

  var vehicleList = []
  const vehicle1 = new vb.VehicleFR01(scene, world, moGroundMtr);
  vehicle1.init();
  vehicleList.push(vehicle1);
  // const vehicle2 = new vb.VehicleFR02(scene, world, moGroundMtr);
  // vehicle2.init();
  // vehicleList.push(vehicle2);
  // const vehicle3 = new vb.VehicleFF01(scene, world, moGroundMtr);
  // vehicle3.init();
  // vehicleList.push(vehicle3);
  // const vehicle4 = new vb.VehicleFF02(scene, world, moGroundMtr);
  // vehicle4.init();
  // vehicleList.push(vehicle4);
  // const vehicle5 = new vb.Vehicle4WD01(scene, world, moGroundMtr);
  // vehicle5.init();
  // vehicleList.push(vehicle5);
  // const vehicle6 = new vb.Vehicle4WD02(scene, world, moGroundMtr);
  // vehicle6.init();
  // vehicleList.push(vehicle6);

  // Build the car chassis
  var vehicle = vehicle1;
  ivehicle = 0;

  // for (let i = 0; i < 3; ++i) {
  //   world.step(1/60)
  //   for (let ii = 0; ii < vehicleList.length; ++ii) {
  //     vehicleList[ii].setPosition(-lengthX/2+iniX-5*ii, ampHigh*110+iniY, -lengthZ/2+iniZ-5*ii, iniRotY);
  //     vehicleList[ii].viewUpdate();
  //   }
  // }




  // ----------------------------------------
  var demw = sizeX;
  var demh = sizeZ;
  var blockSizeW = lengthX; const blockSizeH = lengthZ; // 1ブロック当たりのpixelサイズ

  var demfpath = Demtxt;
  var {matrix, momatrix, vzmax} = await loadDemCSV(demfpath, demw, demh, ampHigh); // ok

  var posiX = 0;
  var posiZ = 0;
  var {moGroundBody, viGroundMesh, moHeightfieldShape, viGroundMtr, viPos, viGroundGeo} =
        createGroundGeo(matrix, momatrix, texturefpath, demw, demh, blockSizeW, blockSizeH, posiX, posiZ, moGroundMtr, bWireframe);
  world.addBody(moGroundBody);
  scene.add(viGroundMesh);
  viGroundMesh.position.copy(moGroundBody.position);

  // 球 作成
  const radius = 5;
  // const moSphereMtr = new CANNON.Material('name2'); 
  // moSphereMtr.restitution = 1;  // 反発係数 1:跳ねやすい  /  0:跳ねない
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

      // case '1':
      // case '2':
      // case '3':
      // case '4':
      // case '5':
      // case '6':
      //   // 車の切り替え
      //   var iv = parseInt(event.key)-1
      //   if (ivehicle != iv) {
      //     // 交換先の車の座標と入れ替える
      //     var px, py, pz;
      //     [px, py, pz] = vehicle.getPosition();
      //     // vehicle.keydown_resetPosture();
      //     var px2, py2, pz2;
      //     [px2, py2, pz2] = vehicleList[iv].getPosition();
      //     vehicle.setPosition(px2, py2+2, pz2, 0.0);
      //     for (let i = 0; i < 3; ++i) {
      //       world.step(1/60)
      //       vehicle.viewUpdate();
      //     }
      //     ivehicle = iv;
      //     vehicle = vehicleList[iv];
      //     vehicle.setPosition(px, py, pz, 0.0);
      //   }
      //   break;

      case ' ':
        var px, py, pz;
        [px, py, pz] = vehicle.getPosition();
        px = parseInt(sizeX*px/lengthX + sizeX*0.5);
        pz = parseInt(sizeZ*pz/lengthZ + sizeZ*0.5);
        py = parseInt(py) - ampHigh*110;
        var chassisBody = vehicle.getModel().chassisBody;
        var vquat = chassisBody.quaternion;
        var veuler = new CANNON.Vec3(0, 0, 0);
        vquat.toEuler(veuler);
        var roty = veuler.y / Math.PI + 0.5;
        console.log("p[z,x,y]=",pz,px,py, " rotY=", roty)
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
    // init position
    vehicle.setPosition(-lengthX/2+iniX, ampHigh*110+iniY, -lengthZ/2+iniZ, iniRotY);

    //
    var px, py, pz;
    [px, py, pz] = vehicle.getPosition();

    camera.position.set(px, py, pz+100);
    camera.lookAt(new THREE.Vector3(px, py, pz));
  }

  var iroty = 0;
  function animate() {
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
    requestAnimationFrame(animate)
  }

  animate();
};


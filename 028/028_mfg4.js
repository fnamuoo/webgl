// mode:javascript

// - 21_5 : 分割マップ（凹凸地面）切り替えのテスト
//          csvファイルのまま、ビーナスライン S1 を分割してみる
//          ..以外と悪くない。切り替え時にちょっと（コンマ数秒）止まる感じ。。

import * as THREE from "three";
import * as CANNON from "cannon";

import { OrbitControls } from "orbitcontrols";
import * as vb from "VehicleBase";

var timeStep = 1 / 60;
var demExt = ".csv";
var imgExt = ".png";

if (0) {
  // MFG #2 asino-ko
  var bWireframe = false;
  //  var demfpathbase     = "mfg_2asinoko_z19/_out2_div_dem/out_";
  //  var demExt = ".csv";
  var demfpathbase     = "mfg_2asinoko_z19/_out2_div_demB/out_";
  var demExt = ".bin";
  // var texturefpathbase = "mfg_2asinoko/z19/_out2_div_img/out_";
  var texturefpathbase = "mfg_2asinoko_z19/_out2_div_imgq60/out_";
  var imgExt = ".jpeg";
  var blockSizeW = 700*4; var blockSizeH = blockSizeW; // 1ブロック当たりのpixelサイズ
  var demw = 700+1; var demh = demw; // 1ブロック当たりの直交メッシュの点の数
  var demw_ = demw-1; var demh_ = demh-1;
  var nBlockH = 5; var nBlockW = 4;  // 全ブロック数
  var nh = 3; var nw = 3; // 描画 ブロック
  var adjw = -blockSizeW*1; var adjh = -blockSizeW*1; // ブロック(3,3)の中心が原点にする補正値[pixel]
  var ampHigh = 1.0; var ampHighAdj = 0;
  // 開始ブロック
  // 開始位置
//  ampHigh = 1; curh=4; curw=1; iniX = blockSizeW*(-0.5+646/demw_); iniZ = blockSizeH*(-0.5+457/demh_); iniY = 190; iniRotY = 0.168;
  ampHigh = 5; curh=4; curw=1; iniX = blockSizeW*(-0.5+646/demw_); iniZ = blockSizeH*(-0.5+457/demh_); iniY = 930; iniRotY = 0.168;
//  ampHigh = 5; curh=4; curw=1; iniX = blockSizeW*(-0.5+652/demw_); iniZ = blockSizeH*(-0.5+468/demh_); iniY = 10; iniRotY = 0.2;

}

// MFG #4 seaside
if (1) {
  var bWireframe = false;
  // var demfpathbase     = "mfg_4seaside_z19/_out3_div_dem/out_";
  // var demExt = ".csv";
  var demfpathbase     = "mfg_4seaside_z19/_out3_div_demB/out_";
  var demExt = ".bin";
  var texturefpathbase = "mfg_4seaside_z19/_out3_div_img/out_";
  var imgExt = ".jpg";
  var blockSizeW = 600*4; var blockSizeH = blockSizeW; // 1ブロック当たりのpixelサイズ
  var demw = 600+1; var demh = demw; // 1ブロック当たりの直交メッシュの点の数
  var demw_ = demw-1; var demh_ = demh-1;
  var nBlockH = 5; var nBlockW = 3;  // 全ブロック数
  var nh = 3; var nw = 3; // 描画 ブロック
  var adjw = -blockSizeW*1; var adjh = -blockSizeW*1; // ブロック(3,3)の中心が原点にする補正値[pixel]
  var ampHigh = 1.0; var ampHighAdj = 0;
  var curh = 1; var curw = 1; var iniX = 0; var iniY = 0; var iniZ = 0; var iniRotY = 0;
  // 開始ブロック
  // 開始位置
//  ampHigh = 1; curh=4; curw=0; iniX = blockSizeW*(-0.5+55/demw_); iniZ = blockSizeH*(-0.5+125/demh_); iniY = 15; iniRotY = -0.2;
//  ampHigh = 1; curh=3; curw=0; iniX = blockSizeW*(-0.5+269/demw_); iniZ = blockSizeH*(-0.5+579/demh_); iniY = 5; iniRotY = -0.14;
  ampHigh = 3; curh=3; curw=0; iniX = blockSizeW*(-0.5+269/demw_); iniZ = blockSizeH*(-0.5+579/demh_); iniY = 10; iniRotY = -0.17;
//  ampHigh = 5; curh=3; curw=0; iniX = blockSizeW*(-0.5+269/demw_); iniZ = blockSizeH*(-0.5+579/demh_); iniY = 10; iniRotY = -0.17;
}


// venus S1
if (0) {
  var bWireframe = false;
  var demfpathbase     = "venusS1z17/dem_sqdivB/dem_";
  var demExt = ".bin";
  var texturefpathbase = "venusS1z17/img_sqdiv/texture_";
  var imgExt = ".jpeg";
  var blockSizeW = 250*8; var blockSizeH = blockSizeW; // 1ブロック当たりのpixelサイズ
  var demw = 250+1; var demh = demw; // 1ブロック当たりの直交メッシュの点の数
  var demw_ = demw-1; var demh_ = demh-1;
  var nBlockH = 2; var nBlockW = 4;  // 全ブロック数
  var nh = 3; var nw = 3; // 描画 ブロック
  var adjw = -blockSizeW*1; var adjh = -blockSizeW*1; // ブロック(3,3)の中心が原点にする補正値[pixel]
  var ampHigh = 1.0; var ampHighAdj = 0;
  var curh = 1; var curw = 1; var iniX = 0; var iniY = 0; var iniZ = 0; var iniRotY = 0;
  // 開始ブロック
  // 開始位置
 ampHigh = 5; curw = 3; curh = 0; iniX = blockSizeW*(-0.5+128/demw_); iniZ = blockSizeH*(-0.5+155/demh_); iniY = 420; iniRotY = 0.6;
}

// const ampHighAdj = 200;
var bChangeCar = false;

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

function loadDemCSV(Dem, demw, demh, ampHigh) {
  var matrix = [];
  var vzmax = 0;
  {
    var vSceneMesh = null;
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function(evt) {
      vSceneMesh = (evt.target.response || evt.target.responseText).replace(/\n/g, ",").split(",");
      var vMeshSizeW = demw-1;  // sizeX-1;
      var vMeshSizeH = demh-1;  // sizeZ-1;
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
  // matrix のZ軸を入れ替え
  {
    var matrix_ = [];
    const demh_ = demh - 1;
    for (let iz = 0; iz < demh; ++iz) {
      matrix_.push(matrix[demh_-iz])
    }
    matrix = matrix_
  }
  // 物理系 heighfield 用に 軸を入れ替えたデータを用意する
  var momatrix = []
  for (let ix = 0; ix < demw; ++ix) {
    momatrix.push([])
    for (let iz = 0; iz < demh; ++iz) {
      momatrix[ix].push(matrix[iz][ix])
    }
  }
  return {matrix, momatrix, vzmax};
}

async function loadDemBINcoreVxxx(Dem, demw, demh, ampHigh) {
  var matrix = [];
  var vzmax = 0;
  const res = await fetch(Dem);
  const arrayBuffer = await res.arrayBuffer();
  let dv = new DataView(arrayBuffer);
  let fmt=dv.getInt8(0);

  if (fmt==0) {
    let view = new Float32Array(arrayBuffer.slice(1));
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

  } else if (fmt==1) {
    let view = new Uint16Array(arrayBuffer.slice(1));
    let vi = view[0];
    let vf = view[1]/1000.0;
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
        let v = view[idx+2];
        v = v/1000.0 + vmin;
        const vz = v * ampHigh;
        matrix[iz].push(vz);
        if (vzmax < vz) {
          vzmax = vz;
        }
      }
    }

  } else if (fmt==2) {
    let view = new Uint16Array(arrayBuffer.slice(1));
    let vi = view[0];
    let vf = view[1]/1000.0;
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
        let v = view[idx+2];
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
  var matrix = [];
  var vzmax = 0;
  var loadend = 0;
  var {matrix, vzmax} = await loadDemBINcoreVxxx(Dem, demw, demh, ampHigh);
  // matrix のZ軸を入れ替え
  var matrix_ = [];
  const demh_ = demh - 1;
  for (let iz = 0; iz < demh; ++iz) {
    matrix_.push(matrix[demh_-iz]);
  }
  matrix = matrix_;
  // 物理系 heighfield 用に 軸を入れ替えたデータを用意する
  var momatrix = [];
  for (let ix = 0; ix < demw; ++ix) {
    momatrix.push([]);
    for (let iz = 0; iz < demh; ++iz) {
      momatrix[ix].push(matrix[iz][ix]);
    }
  }
  return {matrix, momatrix, vzmax};
}

function createDem(demw, demh, iniW, iniH, sinPeriodW, sinPeriodH, ampHigh, ampHighAdj) {
  var matrix = [];
  var vzmax = ampHigh + ampHighAdj;
  {
    var ih = iniH;
    for(let iz = 0; iz <= demh; ++iz){
      var tmprow = [];
      var iw = iniW;
      for(let ix = 0; ix <= demw; ++ix){
        var height = Math.cos((iw / sinPeriodW) * Math.PI * 2) * Math.cos((ih / sinPeriodH) * Math.PI * 2) * ampHigh + ampHighAdj;
        tmprow.push(height);
        ++iw;
      }
      matrix.push(tmprow);
      ++ih;
    }
  }
  // matrix のZ軸を入れ替え
  {
    var matrix_ = [];
    const demh_ = demh - 1;
    for (let iz = 0; iz < demh; ++iz) {
      matrix_.push(matrix[demh_-iz])
    }
    matrix = matrix_
  }
  // 物理系 heighfield 用に 軸を入れ替えたデータを用意する
  var momatrix = []
  for (let ix = 0; ix < demw; ++ix) {
    momatrix.push([])
    for (let iz = 0; iz < demh; ++iz) {
      momatrix[ix].push(matrix[iz][ix])
    }
  }
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

function updateGroundData(moHeightfieldShape, matrix, demw, demh, viPos, momatrix, viGroundGeo) {
  moHeightfieldShape.data = momatrix;
  moHeightfieldShape.update();
  // ビュー側更新
  // - 高さだけを付け替える
  var n = 2;
  for (var iz = 0; iz < demh; ++iz) { 
    for (var ix = 0; ix < demw; ++ix) {
      viPos[n] = matrix[iz][ix];
      n += 3;
    }
  }
  viGroundGeo.setAttribute("position", new THREE.BufferAttribute(viPos, 3));
  return {moHeightfieldShape, viPos, viGroundGeo};
}


var ivehicle = 0;

window.onload = async() => {
  const {world, camera, scene, renderer, orbitControls} = setupWorld();

  const moGroundMtr = new CANNON.Material({name: 'ground'})

  // Build the car chassis
  var vehicle = null;
  var vehicleList = []
  if (bChangeCar) {
    var vehicleList = []
    const vehicle1 = new vb.VehicleFR01(scene, world, moGroundMtr);
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
    // Build the car chassis
    vehicle = vehicle1;
    for (let i = 0; i < 3; ++i) {
        world.step(1/60)
        for (let ii = 0; ii < vehicleList.length; ++ii) {
            vehicleList[ii].setPosition(-lengthX/2+iniX-5*ii, ampHigh*110+iniY, -lengthZ/2+iniZ-5*ii, iniRotY);
            vehicleList[ii].viewUpdate();
        }
    }
  } else {
    vehicle = new vb.VehicleFR01(scene, world, moGroundMtr);
    vehicle.init();
  }


  // ----------------------------------------
  // コース
  var moHeightfieldShapes = [];
  var viGroundMtrs = [];
  var viPoss = [];
  var viGroundGeos = [];
  for (let _ih = 0; _ih < nh; ++_ih) {
    var ih = (_ih -1 + curh + nBlockH) % nBlockH;
    var iniH = ih*demh_;
    moHeightfieldShapes.push([]);
    viGroundMtrs.push([]);
    viPoss.push([]);
    viGroundGeos.push([]);
    for (let _iw = 0; _iw < nw; ++_iw) {
      var iw = (_iw - 1 + curw + nBlockW) % nBlockW;
      var iniW = iw*demw_;
      // var demfpath = demfpathbase + ih + "_" + iw + ".csv";
      // var {matrix, momatrix, vzmax} = loadDemCSV(demfpath, demw, demh, ampHigh);
      var demfpath = demfpathbase + ih + "_" + iw + demExt;
      var {matrix, momatrix, vzmax} = await loadDemBIN(demfpath, demw, demh, ampHigh);
      const texturefpath = texturefpathbase + ih + "_" + iw + imgExt;
      var posiX = _iw*blockSizeW + adjw;
      var posiZ = _ih*blockSizeH + adjh;
      var {moGroundBody, viGroundMesh, moHeightfieldShape, viGroundMtr, viPos, viGroundGeo} =
            createGroundGeo(matrix, momatrix, texturefpath, demw, demh, blockSizeW, blockSizeH, posiX, posiZ, moGroundMtr, bWireframe);
      world.addBody(moGroundBody);
      scene.add(viGroundMesh);
      moHeightfieldShapes[_ih].push(moHeightfieldShape);
      viGroundMtrs[_ih].push(viGroundMtr);
      viPoss[_ih].push(viPos);
      viGroundGeos[_ih].push(viGroundGeo);
    }
  }
  // カレントブロック(curw,curh) の境界値(Xmin, Zmin, Xmax, Zmax)
  var curblkBoundary = [-blockSizeW/2, -blockSizeH/2, blockSizeW/2, blockSizeH/2]

  // 球 作成
  const radius = 5;
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
    // 剛性(def=1e7) 値大:=物体が変形しにくく / 値小:=沈んでしまう  対象の重さと関係あり
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
        if (bChangeCar) {
          // 車の切り替え
          var iv = parseInt(event.key)-1
          if (ivehicle != iv) {
              // 交換先の車の座標と入れ替える
              var px, py, pz;
              [px, py, pz] = vehicle.getPosition();
              // vehicle.keydown_resetPosture();
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
        }
        break;

      case ' ':
        // 現在位置の表示（デバッグ用）
        var px, py, pz;
        [px, py, pz] = vehicle.getPosition();
        px = parseInt(demw_*(px/blockSizeW + 0.5));
        pz = parseInt(demh_*(pz/blockSizeH + 0.5));
        py = parseInt(py) - ampHigh*100;
        var chassisBody = vehicle.getModel().chassisBody;
        var vquat = chassisBody.quaternion;
        var veuler = new CANNON.Vec3(0, 0, 0);
        vquat.toEuler(veuler);
        var roty = veuler.y / Math.PI + 0.5;
        console.log("iBlock[h,w]=",[curh,curw]," p[z,x,y]=",pz,px,py, " rotY=", roty)
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

  async function updateMap() {
    // 凹凸地面、テクスチャを変更する
    for (let _ih = 0; _ih < nh; ++_ih) {
      var ih = (_ih -1 + curh + nBlockH) % nBlockH;
      var iniH = ih*demh_;
      for (let _iw = 0; _iw < nw; ++_iw) {
        var iw = (_iw - 1 + curw + nBlockW) % nBlockW;
        var iniW = iw*demw_;
        var demfpath = demfpathbase + ih + "_" + iw + demExt;
        var {matrix, momatrix, vzmax} = await loadDemBIN(demfpath, demw, demh, ampHigh);
        var moHeightfieldShape = moHeightfieldShapes[_ih][_iw];
        var viGroundMtr = viGroundMtrs[_ih][_iw];
        var viPos = viPoss[_ih][_iw];
        var viGroundGeo = viGroundGeos[_ih][_iw];
        var {moHeightfieldShape, viPos, viGroundGeo} = updateGroundData(moHeightfieldShape, matrix, demw, demh, viPos, momatrix, viGroundGeo);
        moHeightfieldShapes[_ih][_iw] = moHeightfieldShape;
        viPoss[_ih][_iw] = viPos;
        viGroundGeos[_ih][_iw] = viGroundGeo;
        const texturefpath = texturefpathbase + ih + "_" + iw + imgExt;
        const texture = new THREE.TextureLoader().load(texturefpath); 
        viGroundMtr.map = texture;
      }
    }
  }

  async function animate() {
    world.step(timeStep);

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
      // カスタムの自動回転
      orbitControls.autoRotate = true;
      orbitControls.target = new THREE.Vector3(vposi.x, vposi.y, vposi.z);
      orbitControls.update();
    } else {
      // _cameraPosi == 4
      // OrbitControls のマウス操作に任せる
      orbitControls.autoRotate = false;
      orbitControls.update();
    }

    // 自車の座標値がカレントブロックの境界(curblkBoundary) を超えたら、地面パネルの移動とテクスチャ張替
    var changeCurHW = 0;
    var px, py, pz;
    if (vposi.x < curblkBoundary[0]) {
      changeCurHW = 1;
      curw = (curw-1+nBlockW) % nBlockW;
      [px, py, pz] = vehicle.getPosition();
      px = px + blockSizeW;
      vehicle.setPosition2(px, py, pz);
    } else if (vposi.x > curblkBoundary[2]) {
      changeCurHW = 1;
      curw = (curw+1) % nBlockW;
      [px, py, pz] = vehicle.getPosition();
      px = px - blockSizeW;
      vehicle.setPosition2(px, py, pz);
    } else if (vposi.z < curblkBoundary[1]) {
      changeCurHW = 1;
      curh = (curh-1+nBlockH) % nBlockH;
      [px, py, pz] = vehicle.getPosition();
      pz = pz + blockSizeH;
      vehicle.setPosition2(px, py, pz);
    } else if (vposi.z > curblkBoundary[3]) {
      changeCurHW = 1;
      curh = (curh+1) % nBlockH;
      [px, py, pz] = vehicle.getPosition();
      pz = pz - blockSizeH;
      vehicle.setPosition2(px, py, pz);
    }
    if (changeCurHW == 1) {
        await updateMap();
    }

    renderer.render(scene, camera)

    // マップ更新時のawait を有効にするためにも最後に requestAnimationFrame() を呼び出す
    requestAnimationFrame(animate)
  }

  animate();

};

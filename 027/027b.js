// mode:javascript

// - 21_1 : マップ（平面）切り替えのテスト
//          5x5 のマップ内、中心の1x1 内で車を移動させながら、地面のテクスチャを張り替え
//          実質 10x10 のマップ内を動いているように見せかける

// - 21_2 : マップ（凹凸地面）切り替えのテスト
//          5x5 のマップ内、中心の1x1 内で車を移動させながら、凹凸と地面のテクスチャを交換
//          実質 10x10 のマップ内を動いているように見せかける
//          凸凹の高さは関数（正弦波）で作成

// - 21_3 : マップ（凹凸地面）切り替えのテスト
//          凸凹の高さを csvファイルに置き換えて、読み込みを確認

import * as THREE from "three";
import * as CANNON from "cannon";

import { OrbitControls } from "orbitcontrols";
import * as vb from "VehicleBase";

var ampHigh = 0;
var ampHighAdj = 0;
var iniX = 0; var iniY = 0; var iniZ = 0; var iniRotY = 0
var bWireframe = false;

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

function loadDemCVS(Dem, demw, demh, ampHigh) {
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
  // return {matrix, vzmax};
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

window.onload = () => {
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
  // 凹凸地面の場合
  const blockSizeW = 100; const blockSizeT = 1; const blockSizeH = 100; // 1ブロック当たりのpixelサイズ
  const grndw = blockSizeW/2; const grndt = blockSizeT/2; const grndh = blockSizeH/2; // 1ブロック当たりのpixelサイズ
  const demw = 11; const demh = 11; // 1ブロック当たりの直交メッシュの点の数
  const demw_ = demw-1; const demh_ = demh-1;
  const ncurh = 10; const ncurw = 10;  // 全ブロック数
  const nw = 5; const nh = 5; // 描画床ブロック
  const adjw = -blockSizeW*2.5; const adjh = -blockSizeW*2.5; // ブロック(3,3)の中心が原点にする補正値[pixel]
  var curh = 3; var curw = 1; // 開始ブロック位置
  var sinPeriodW = demw_*3; var sinPeriodH = demh_*4;
  var ampHigh = 1.0; var ampHighAdj = 0;
  var moHeightfieldShapes = [];
  var viGroundMtrs = [];
  var viPoss = [];
  var viGroundGeos = [];
  for (let _ih = 0; _ih < nh; ++_ih) {
    var ih = (_ih -1 + curh + ncurh) % ncurh;
    var iniH = ih*demh_;
    moHeightfieldShapes.push([]);
    viGroundMtrs.push([]);
    viPoss.push([]);
    viGroundGeos.push([]);
    for (let _iw = 0; _iw < nw; ++_iw) {
      var iw = (_iw - 1 + curw + ncurw) % ncurw;
      var iniW = iw*demw_;
      var demfpath = "dem_csv/dem_" + ih + "_" + iw + ".csv";
      var {matrix, momatrix, vzmax} = loadDemCVS(demfpath, demw, demh, ampHigh);
      const texturefpath = "pic/FujiSpeedway_out/out_" + ih + "_" + iw + ".png";
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
  var curblkBoundary = [-grndw, -grndh, grndw, grndh]

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
        var px, py, pz;
        [px, py, pz] = vehicle.getPosition();
        console.log("loadmad RC=",pz,px, py)
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
    iniX = (curblkBoundary[0] + curblkBoundary[2])/2;
    iniZ = (curblkBoundary[1] + curblkBoundary[3])/2 - 0.8*blockSizeH;
    iniY = 10;
    iniRotY = -0.4;
    vehicle.setPosition(iniX, iniY, iniZ, iniRotY);

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
      curw = (curw-1+ncurw) % ncurw;
      [px, py, pz] = vehicle.getPosition();
      px = px + blockSizeW;
      vehicle.setPosition2(px, py, pz);
    } else if (vposi.x > curblkBoundary[2]) {
      changeCurHW = 1;
      curw = (curw+1) % ncurw;
      [px, py, pz] = vehicle.getPosition();
      px = px - blockSizeW;
      vehicle.setPosition2(px, py, pz);
    } else if (vposi.z < curblkBoundary[1]) {
      changeCurHW = 1;
      curh = (curh-1+ncurh) % ncurh;
      [px, py, pz] = vehicle.getPosition();
      pz = pz + blockSizeH;
      vehicle.setPosition2(px, py, pz);
    } else if (vposi.z > curblkBoundary[3]) {
      changeCurHW = 1;
      curh = (curh+1) % ncurh;
      [px, py, pz] = vehicle.getPosition();
      pz = pz - blockSizeH;
      vehicle.setPosition2(px, py, pz);
    }
    if (changeCurHW == 1) {
      // 凹凸地面、テクスチャを変更する
      for (let _ih = 0; _ih < nh; ++_ih) {
        var ih = (_ih -1 + curh + ncurh) % ncurh;
        var iniH = ih*demh_;
        for (let _iw = 0; _iw < nw; ++_iw) {
          var iw = (_iw - 1 + curw + ncurw) % ncurw;
          var iniW = iw*demw_;
          var demfpath = "dem_csv/dem_" + ih + "_" + iw + ".csv";
          var {matrix, momatrix, vzmax} = loadDemCVS(demfpath, demw, demh, ampHigh);
          var moHeightfieldShape = moHeightfieldShapes[_ih][_iw];
          var viGroundMtr = viGroundMtrs[_ih][_iw];
          var viPos = viPoss[_ih][_iw];
          var viGroundGeo = viGroundGeos[_ih][_iw];
          var {moHeightfieldShape, viPos, viGroundGeo} = updateGroundData(moHeightfieldShape, matrix, demw, demh, viPos, momatrix, viGroundGeo);
          moHeightfieldShapes[_ih][_iw] = moHeightfieldShape;
          viPoss[_ih][_iw] = viPos;
          viGroundGeos[_ih][_iw] = viGroundGeo;
          var texturefpath = "pic/FujiSpeedway_out/out_" + ih + "_" + iw + ".png";
          const texture = new THREE.TextureLoader().load(texturefpath); 
          viGroundMtr.map = texture;
        }
      }
    }

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  animate();
};

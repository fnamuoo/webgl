// mode:javascript

// ヒンジに代表される、制約(constraint)のデモ・確認

//
//       ↑(画面上):y  : 逆向きに重力
//       │
//       │
//       │＿＿＿＿→ (画面右):x
//      ／          
//    ／
//  (画面手前):z

// - 11_5
//   - HingeConstraint : 軸結合
//                               - 扉の蝶番                .. axisA, axisB を同じに
//                               - 車の前輪（回転軸の傾き）.. axisA が軸の傾き、axisB が回転軸
//                               - enableMotor ON で自由に動かない, setMotorSpeed() が 0以外で動き続ける

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
    camera.position.set(0, 20, 100)
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

  // 長方形の台を地面代わりにする
  const moGroundMtr = new CANNON.Material('ground')
  const grndw = 30; const grndh = 20;
  const moGround2Body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(grndw, 1, grndh)),
    position: new CANNON.Vec3(0, -1-2, 0),
    material: moGroundMtr,
  });
  world.addBody(moGround2Body);
  const viGround2Geo = new THREE.BoxGeometry(grndw*2, 2, grndh*2);
  const viGround2Mtr = new THREE.MeshNormalMaterial({transparent: true, opacity: 0.4});
  const viGround2Mesh = new THREE.Mesh(viGround2Geo, viGround2Mtr);
  scene.add(viGround2Mesh);
  viGround2Mesh.position.copy(moGround2Body.position);
  viGround2Mesh.quaternion.copy(moGround2Body.quaternion);

  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // 基準面を作成 (500pixel四方を 50x50分割
  const viBaseGrid = new THREE.GridHelper(500, 50, 0xff8888, 0x404040);
  viBaseGrid.position.set(0, 0, 0);
  scene.add(viBaseGrid);


  const moBox1AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox1ABody = new CANNON.Body({ mass: 0, shape: moBox1AShape, position: new CANNON.Vec3(-10, 5, 10) })
  world.addBody(moBox1ABody)
  const viBox1AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox1AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox1AMesh = new THREE.Mesh(viBox1AGeo, viBox1AMtr);
  viBox1AMesh.position.copy(moBox1ABody.position);
  viBox1AMesh.quaternion.copy(moBox1ABody.quaternion);
  scene.add(viBox1AMesh);
  //
  const moBox1BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox1BBody = new CANNON.Body({ mass: 1, shape: moBox1BShape, position: new CANNON.Vec3(-14, 5, 10) })
  world.addBody(moBox1BBody)
  const viBox1BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox1BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox1BMesh = new THREE.Mesh(viBox1BGeo, viBox1BMtr);
  viBox1BMesh.position.copy(moBox1BBody.position);
  viBox1BMesh.quaternion.copy(moBox1BBody.quaternion);
  scene.add(viBox1BMesh);
  // 
  const moBox1Const = new CANNON.HingeConstraint(moBox1ABody, moBox1BBody, {
    axisA: new CANNON.Vec3(1, 0, 0),  // bodyAから見た 回転軸
    axisB: new CANNON.Vec3(1, 0, 0),  // bodyB の回転軸（ローカル)
    pivotA: new CANNON.Vec3(-2, 0, 0),
    pivotB: new CANNON.Vec3( 2, 0, 0),
    collideConnected: false,
  });
  world.addConstraint(moBox1Const);
  moBox1Const.enableMotor();
  //
  const viBox1Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox1Points = [];
  viBox1Points.push( moBox1ABody.position );
  viBox1Points.push( moBox1ABody.position.vadd(new CANNON.Vec3(-2, 0, 0)) );
  viBox1Points.push( moBox1BBody.position );
  const viBox1Geo = new THREE.BufferGeometry().setFromPoints(viBox1Points);
  const viBox1Line = new THREE.Line(viBox1Geo, viBox1Mtr);
  scene.add(viBox1Line);


  const moBox2AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox2ABody = new CANNON.Body({ mass: 0, shape: moBox2AShape, position: new CANNON.Vec3(0, 5, 10) })
  world.addBody(moBox2ABody)
  const viBox2AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox2AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox2AMesh = new THREE.Mesh(viBox2AGeo, viBox2AMtr);
  viBox2AMesh.position.copy(moBox2ABody.position);
  viBox2AMesh.quaternion.copy(moBox2ABody.quaternion);
  scene.add(viBox2AMesh);
  //
  const moBox2BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox2BBody = new CANNON.Body({ mass: 1, shape: moBox2BShape, position: new CANNON.Vec3(-2, 3, 12) })
  world.addBody(moBox2BBody)
  const viBox2BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox2BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox2BMesh = new THREE.Mesh(viBox2BGeo, viBox2BMtr);
  viBox2BMesh.position.copy(moBox2BBody.position);
  viBox2BMesh.quaternion.copy(moBox2BBody.quaternion);
  scene.add(viBox2BMesh);
  // 
  const moBox2Const = new CANNON.HingeConstraint(moBox2ABody, moBox2BBody, {
    axisA: new CANNON.Vec3(0.7, 0, -0.3),
    axisB: new CANNON.Vec3(1, 0, 0),
    pivotA: new CANNON.Vec3(-2, 0, 0),
    pivotB: new CANNON.Vec3(2, 0, 0),
    collideConnected: false,
  });
  world.addConstraint(moBox2Const);
  moBox2Const.enableMotor();
  moBox2Const.setMotorSpeed(1);
  //
  const viBox2Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox2Points = [];
  viBox2Points.push( moBox2ABody.position );
  viBox2Points.push( moBox2ABody.position.vadd(new CANNON.Vec3(-2, 0, 0)) );
  viBox2Points.push( moBox2BBody.position );
  const viBox2Geo = new THREE.BufferGeometry().setFromPoints(viBox2Points);
  const viBox2Line = new THREE.Line(viBox2Geo, viBox2Mtr);
  scene.add(viBox2Line);


  const moBox3AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox3ABody = new CANNON.Body({ mass: 0, shape: moBox3AShape, position: new CANNON.Vec3(10, 5, 10) })
  world.addBody(moBox3ABody)
  const viBox3AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox3AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox3AMesh = new THREE.Mesh(viBox3AGeo, viBox3AMtr);
  viBox3AMesh.position.copy(moBox3ABody.position);
  viBox3AMesh.quaternion.copy(moBox3ABody.quaternion);
  scene.add(viBox3AMesh);
  //
  const moBox3BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox3BBody = new CANNON.Body({ mass: 1, shape: moBox3BShape, position: new CANNON.Vec3(6, 5, 12) })
  world.addBody(moBox3BBody)
  const viBox3BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox3BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox3BMesh = new THREE.Mesh(viBox3BGeo, viBox3BMtr);
  viBox3BMesh.position.copy(moBox3BBody.position);
  viBox3BMesh.quaternion.copy(moBox3BBody.quaternion);
  scene.add(viBox3BMesh);
  // 
  const moBox3Const = new CANNON.HingeConstraint(moBox3ABody, moBox3BBody, {
    axisA: new CANNON.Vec3(0.3, 0, -0.7),
    axisB: new CANNON.Vec3(1, 0, 0),
    pivotA: new CANNON.Vec3(-2, 0, 0),
    pivotB: new CANNON.Vec3( 2, 0, 0),
    collideConnected: false,
  });
  world.addConstraint(moBox3Const);
  moBox3Const.enableMotor();
  moBox3Const.setMotorSpeed(1);
  //
  const viBox3Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox3Points = [];
  viBox3Points.push( moBox3ABody.position );
  viBox3Points.push( moBox3ABody.position.vadd(new CANNON.Vec3(-2, 0, 0)) );
  viBox3Points.push( moBox3BBody.position );
  const viBox3Geo = new THREE.BufferGeometry().setFromPoints(viBox3Points);
  const viBox3Line = new THREE.Line(viBox3Geo, viBox3Mtr);
  scene.add(viBox3Line);


  const moBox4AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox4ABody = new CANNON.Body({ mass: 0, shape: moBox4AShape, position: new CANNON.Vec3(20, 5, 10) })
  world.addBody(moBox4ABody)
  const viBox4AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox4AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox4AMesh = new THREE.Mesh(viBox4AGeo, viBox4AMtr);
  viBox4AMesh.position.copy(moBox4ABody.position);
  viBox4AMesh.quaternion.copy(moBox4ABody.quaternion);
  scene.add(viBox4AMesh);
  //
  const moBox4BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox4BBody = new CANNON.Body({ mass: 1, shape: moBox4BShape, position: new CANNON.Vec3(20, 5, 13) })
  world.addBody(moBox4BBody)
  const viBox4BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox4BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox4BMesh = new THREE.Mesh(viBox4BGeo, viBox4BMtr);
  viBox4BMesh.position.copy(moBox4BBody.position);
  viBox4BMesh.quaternion.copy(moBox4BBody.quaternion);
  scene.add(viBox4BMesh);
  // 
  const moBox4Const = new CANNON.HingeConstraint(moBox4ABody, moBox4BBody, {
    axisA: new CANNON.Vec3(0, 0, -1),
    axisB: new CANNON.Vec3(1, 0, 0),
    pivotA: new CANNON.Vec3(-2, 0, 0),
    pivotB: new CANNON.Vec3( 2, 0, 0),
    collideConnected: false,
  });
  world.addConstraint(moBox4Const);
  moBox4Const.enableMotor();
  moBox4Const.setMotorSpeed(1);
  //
  const viBox4Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox4Points = [];
  viBox4Points.push( moBox4ABody.position );
  viBox4Points.push( moBox4ABody.position.vadd(new CANNON.Vec3(-2, 0, 0)) );
  viBox4Points.push( moBox4BBody.position );
  const viBox4Geo = new THREE.BufferGeometry().setFromPoints(viBox4Points);
  const viBox4Line = new THREE.Line(viBox4Geo, viBox4Mtr);
  scene.add(viBox4Line);


  const moBox5AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox5ABody = new CANNON.Body({ mass: 0, shape: moBox5AShape, position: new CANNON.Vec3(-10, 5, 0) })
  world.addBody(moBox5ABody)
  const viBox5AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox5AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox5AMesh = new THREE.Mesh(viBox5AGeo, viBox5AMtr);
  viBox5AMesh.position.copy(moBox5ABody.position);
  viBox5AMesh.quaternion.copy(moBox5ABody.quaternion);
  scene.add(viBox5AMesh);
  //
  const moBox5BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox5BBody = new CANNON.Body({ mass: 1, shape: moBox5BShape, position: new CANNON.Vec3(-10, 3, 0) })
  world.addBody(moBox5BBody)
  const viBox5BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox5BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox5BMesh = new THREE.Mesh(viBox5BGeo, viBox5BMtr);
  viBox5BMesh.position.copy(moBox5BBody.position);
  viBox5BMesh.quaternion.copy(moBox5BBody.quaternion);
  scene.add(viBox5BMesh);
  // 
  const moBox5Const = new CANNON.HingeConstraint(moBox5ABody, moBox5BBody, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -2, 0),
    pivotB: new CANNON.Vec3(0,  2, 0),
    collideConnected: false,
  });
  world.addConstraint(moBox5Const);
  moBox5Const.enableMotor();
  //
  const viBox5Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox5Points = [];
  viBox5Points.push( moBox5ABody.position );
  viBox5Points.push( moBox5ABody.position.vadd(new CANNON.Vec3(0, -2, 0)) );
  viBox5Points.push( moBox5BBody.position );
  const viBox5Geo = new THREE.BufferGeometry().setFromPoints(viBox5Points);
  const viBox5Line = new THREE.Line(viBox5Geo, viBox5Mtr);
  scene.add(viBox5Line);


  const moBox6AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox6ABody = new CANNON.Body({ mass: 0, shape: moBox6AShape, position: new CANNON.Vec3(0, 5, 0) })
  world.addBody(moBox6ABody)
  const viBox6AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox6AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox6AMesh = new THREE.Mesh(viBox6AGeo, viBox6AMtr);
  viBox6AMesh.position.copy(moBox6ABody.position);
  viBox6AMesh.quaternion.copy(moBox6ABody.quaternion);
  scene.add(viBox6AMesh);
  //
  const moBox6BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox6BBody = new CANNON.Body({ mass: 1, shape: moBox6BShape, position: new CANNON.Vec3(2, 4, 0) })
  world.addBody(moBox6BBody)
  const viBox6BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox6BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox6BMesh = new THREE.Mesh(viBox6BGeo, viBox6BMtr);
  viBox6BMesh.position.copy(moBox6BBody.position);
  viBox6BMesh.quaternion.copy(moBox6BBody.quaternion);
  scene.add(viBox6BMesh);
  // 
  const moBox6Const = new CANNON.HingeConstraint(moBox6ABody, moBox6BBody, {
    axisA: new CANNON.Vec3(-0.3, 0.7, 0),
    axisB: new CANNON.Vec3( 0, 1, 0),
    pivotA: new CANNON.Vec3(0, -2, 0),
    pivotB: new CANNON.Vec3(0,  2, 0),
    collideConnected: false,
  });
  world.addConstraint(moBox6Const);
  moBox6Const.enableMotor();
  moBox6Const.setMotorSpeed(1);
  //
  const viBox6Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox6Points = [];
  viBox6Points.push( moBox6ABody.position );
  viBox6Points.push( moBox6ABody.position.vadd(new CANNON.Vec3(0, -2, 0)) );
  viBox6Points.push( moBox6BBody.position );
  const viBox6Geo = new THREE.BufferGeometry().setFromPoints(viBox6Points);
  const viBox6Line = new THREE.Line(viBox6Geo, viBox6Mtr);
  scene.add(viBox6Line);


  const moBox7AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox7ABody = new CANNON.Body({ mass: 0, shape: moBox7AShape, position: new CANNON.Vec3(10, 5, 0) })
  world.addBody(moBox7ABody)
  const viBox7AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox7AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox7AMesh = new THREE.Mesh(viBox7AGeo, viBox7AMtr);
  viBox7AMesh.position.copy(moBox7ABody.position);
  viBox7AMesh.quaternion.copy(moBox7ABody.quaternion);
  scene.add(viBox7AMesh);
  //
  const moBox7BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox7BBody = new CANNON.Body({ mass: 1, shape: moBox7BShape, position: new CANNON.Vec3(12, 4, 0) })
  world.addBody(moBox7BBody)
  const viBox7BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox7BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox7BMesh = new THREE.Mesh(viBox7BGeo, viBox7BMtr);
  viBox7BMesh.position.copy(moBox7BBody.position);
  viBox7BMesh.quaternion.copy(moBox7BBody.quaternion);
  scene.add(viBox7BMesh);
  // 
  const moBox7Const = new CANNON.HingeConstraint(moBox7ABody, moBox7BBody, {
    axisA: new CANNON.Vec3(-0.7, 0.3, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -2, 0),
    pivotB: new CANNON.Vec3(0,  2, 0),
    collideConnected: false,
  });
  world.addConstraint(moBox7Const);
  moBox7Const.enableMotor();
  moBox7Const.setMotorSpeed(1);
  //
  const viBox7Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox7Points = [];
  viBox7Points.push( moBox7ABody.position );
  viBox7Points.push( moBox7ABody.position.vadd(new CANNON.Vec3(0, -2, 0)) );
  viBox7Points.push( moBox7BBody.position );
  const viBox7Geo = new THREE.BufferGeometry().setFromPoints(viBox7Points);
  const viBox7Line = new THREE.Line(viBox7Geo, viBox7Mtr);
  scene.add(viBox7Line);


  const moBox8AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox8ABody = new CANNON.Body({ mass: 0, shape: moBox8AShape, position: new CANNON.Vec3(20, 5, 0) })
  world.addBody(moBox8ABody)
  const viBox8AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox8AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox8AMesh = new THREE.Mesh(viBox8AGeo, viBox8AMtr);
  viBox8AMesh.position.copy(moBox8ABody.position);
  viBox8AMesh.quaternion.copy(moBox8ABody.quaternion);
  scene.add(viBox8AMesh);
  //
  const moBox8BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox8BBody = new CANNON.Body({ mass: 1, shape: moBox8BShape, position: new CANNON.Vec3(22, 4, 0) })
  world.addBody(moBox8BBody)
  const viBox8BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox8BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox8BMesh = new THREE.Mesh(viBox8BGeo, viBox8BMtr);
  viBox8BMesh.position.copy(moBox8BBody.position);
  viBox8BMesh.quaternion.copy(moBox8BBody.quaternion);
  scene.add(viBox8BMesh);
  // 
  const moBox8Const = new CANNON.HingeConstraint(moBox8ABody, moBox8BBody, {
    axisA: new CANNON.Vec3(-1, 0, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, -2, 0),
    pivotB: new CANNON.Vec3(0,  2, 0),
    collideConnected: false,
  });
  world.addConstraint(moBox8Const);
  moBox8Const.enableMotor();
  moBox8Const.setMotorSpeed(1);
  //
  const viBox8Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox8Points = [];
  viBox8Points.push( moBox8ABody.position );
  viBox8Points.push( moBox8ABody.position.vadd(new CANNON.Vec3(0, -2, 0)) );
  viBox8Points.push( moBox8BBody.position );
  const viBox8Geo = new THREE.BufferGeometry().setFromPoints(viBox8Points);
  const viBox8Line = new THREE.Line(viBox8Geo, viBox8Mtr);
  scene.add(viBox8Line);


  const moBox9AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox9ABody = new CANNON.Body({ mass: 0, shape: moBox9AShape, position: new CANNON.Vec3(-10, 5, -10) })
  world.addBody(moBox9ABody)
  const viBox9AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox9AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox9AMesh = new THREE.Mesh(viBox9AGeo, viBox9AMtr);
  viBox9AMesh.position.copy(moBox9ABody.position);
  viBox9AMesh.quaternion.copy(moBox9ABody.quaternion);
  scene.add(viBox9AMesh);
  //
  const moBox9BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox9BBody = new CANNON.Body({ mass: 1, shape: moBox9BShape, position: new CANNON.Vec3(-10, 5, -14) })
  world.addBody(moBox9BBody)
  const viBox9BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox9BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox9BMesh = new THREE.Mesh(viBox9BGeo, viBox9BMtr);
  viBox9BMesh.position.copy(moBox9BBody.position);
  viBox9BMesh.quaternion.copy(moBox9BBody.quaternion);
  scene.add(viBox9BMesh);
  // 
  const moBox9Const = new CANNON.HingeConstraint(moBox9ABody, moBox9BBody, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, -2),
    pivotB: new CANNON.Vec3(0, 0, 2),
    collideConnected: false,
  });
  world.addConstraint(moBox9Const);
  moBox9Const.enableMotor();
  //
  const viBox9Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox9Points = [];
  viBox9Points.push( moBox9ABody.position );
  viBox9Points.push( moBox9ABody.position.vadd(new CANNON.Vec3(0, 0, -2)) );
  viBox9Points.push( moBox9BBody.position );
  const viBox9Geo = new THREE.BufferGeometry().setFromPoints(viBox9Points);
  const viBox9Line = new THREE.Line(viBox9Geo, viBox9Mtr);
  scene.add(viBox9Line);


  const moBox10AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox10ABody = new CANNON.Body({ mass: 0, shape: moBox10AShape, position: new CANNON.Vec3(0, 5, -10) })
  world.addBody(moBox10ABody)
  const viBox10AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox10AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox10AMesh = new THREE.Mesh(viBox10AGeo, viBox10AMtr);
  viBox10AMesh.position.copy(moBox10ABody.position);
  viBox10AMesh.quaternion.copy(moBox10ABody.quaternion);
  scene.add(viBox10AMesh);
  //
  const moBox10BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox10BBody = new CANNON.Body({ mass: 1, shape: moBox10BShape, position: new CANNON.Vec3(0, 7, -12) })
  world.addBody(moBox10BBody)
  const viBox10BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox10BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox10BMesh = new THREE.Mesh(viBox10BGeo, viBox10BMtr);
  viBox10BMesh.position.copy(moBox10BBody.position);
  viBox10BMesh.quaternion.copy(moBox10BBody.quaternion);
  scene.add(viBox10BMesh);
  // 
  const moBox10Const = new CANNON.HingeConstraint(moBox10ABody, moBox10BBody, {
    axisA: new CANNON.Vec3(0, -0.3, 0.7),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, -2),
    pivotB: new CANNON.Vec3(0, 0, 2),
    collideConnected: false,
  });
  world.addConstraint(moBox10Const);
  moBox10Const.enableMotor();
  moBox10Const.setMotorSpeed(1);
  //
  const viBox10Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox10Points = [];
  viBox10Points.push( moBox10ABody.position );
  viBox10Points.push( moBox10ABody.position.vadd(new CANNON.Vec3(0, 0, -2)) );
  viBox10Points.push( moBox10BBody.position );
  const viBox10Geo = new THREE.BufferGeometry().setFromPoints(viBox10Points);
  const viBox10Line = new THREE.Line(viBox10Geo, viBox10Mtr);
  scene.add(viBox10Line);


  const moBox11AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox11ABody = new CANNON.Body({ mass: 0, shape: moBox11AShape, position: new CANNON.Vec3(10, 5, -10) })
  world.addBody(moBox11ABody)
  const viBox11AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox11AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox11AMesh = new THREE.Mesh(viBox11AGeo, viBox11AMtr);
  viBox11AMesh.position.copy(moBox11ABody.position);
  viBox11AMesh.quaternion.copy(moBox11ABody.quaternion);
  scene.add(viBox11AMesh);
  //
  const moBox11BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox11BBody = new CANNON.Body({ mass: 1, shape: moBox11BShape, position: new CANNON.Vec3(10, 7, -12) })
  world.addBody(moBox11BBody)
  const viBox11BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox11BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox11BMesh = new THREE.Mesh(viBox11BGeo, viBox11BMtr);
  viBox11BMesh.position.copy(moBox11BBody.position);
  viBox11BMesh.quaternion.copy(moBox11BBody.quaternion);
  scene.add(viBox11BMesh);
  // 
  const moBox11Const = new CANNON.HingeConstraint(moBox11ABody, moBox11BBody, {
    axisA: new CANNON.Vec3(0, -0.7, 0.3),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, -2),
    pivotB: new CANNON.Vec3(0, 0, 2),
    collideConnected: false,
  });
  world.addConstraint(moBox11Const);
  moBox11Const.enableMotor();
  moBox11Const.setMotorSpeed(1);
  //
  const viBox11Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox11Points = [];
  viBox11Points.push( moBox11ABody.position );
  viBox11Points.push( moBox11ABody.position.vadd(new CANNON.Vec3(0, 0, -2)) );
  viBox11Points.push( moBox11BBody.position );
  const viBox11Geo = new THREE.BufferGeometry().setFromPoints(viBox11Points);
  const viBox11Line = new THREE.Line(viBox11Geo, viBox11Mtr);
  scene.add(viBox11Line);


  const moBox12AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox12ABody = new CANNON.Body({ mass: 0, shape: moBox12AShape, position: new CANNON.Vec3(20, 5, -10) })
  world.addBody(moBox12ABody)
  const viBox12AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox12AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox12AMesh = new THREE.Mesh(viBox12AGeo, viBox12AMtr);
  viBox12AMesh.position.copy(moBox12ABody.position);
  viBox12AMesh.quaternion.copy(moBox12ABody.quaternion);
  scene.add(viBox12AMesh);
  //
  const moBox12BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox12BBody = new CANNON.Body({ mass: 1, shape: moBox12BShape, position: new CANNON.Vec3(20, 8, -12) })
  world.addBody(moBox12BBody)
  const viBox12BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox12BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox12BMesh = new THREE.Mesh(viBox12BGeo, viBox12BMtr);
  viBox12BMesh.position.copy(moBox12BBody.position);
  viBox12BMesh.quaternion.copy(moBox12BBody.quaternion);
  scene.add(viBox12BMesh);
  // 
  const moBox12Const = new CANNON.HingeConstraint(moBox12ABody, moBox12BBody, {
    axisA: new CANNON.Vec3(0, -1, 0),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(0, 0, -2),
    pivotB: new CANNON.Vec3(0, 0, 2),
    collideConnected: false,
  });
  world.addConstraint(moBox12Const);
  moBox12Const.enableMotor();
  moBox12Const.setMotorSpeed(1);
  //
  const viBox12Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox12Points = [];
  viBox12Points.push( moBox12ABody.position );
  viBox12Points.push( moBox12ABody.position.vadd(new CANNON.Vec3(0, 0, -2)) );
  viBox12Points.push( moBox12BBody.position );
  const viBox12Geo = new THREE.BufferGeometry().setFromPoints(viBox12Points);
  const viBox12Line = new THREE.Line(viBox12Geo, viBox12Mtr);
  scene.add(viBox12Line);


  const moBox111AShape = new CANNON.Box(new CANNON.Vec3(2, 1, 0.1))
  const moBox111ABody = new CANNON.Body({ mass: 0, shape: moBox111AShape, position: new CANNON.Vec3(-20, 5, 10) })
  world.addBody(moBox111ABody)
  const viBox111AGeo = new THREE.BoxGeometry(4, 2, 0.2);
  const viBox111AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox111AMesh = new THREE.Mesh(viBox111AGeo, viBox111AMtr);
  viBox111AMesh.position.copy(moBox111ABody.position);
  viBox111AMesh.quaternion.copy(moBox111ABody.quaternion);
  scene.add(viBox111AMesh);
  //
  const moBox111BShape = new CANNON.Box(new CANNON.Vec3(2, 1, 0.1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox111BBody = new CANNON.Body({ mass: 1, shape: moBox111BShape, position: new CANNON.Vec3(-20, 3, 10) })
  world.addBody(moBox111BBody)
  const viBox111BGeo = new THREE.BoxGeometry(4, 2, 0.2);
  const viBox111BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox111BMesh = new THREE.Mesh(viBox111BGeo, viBox111BMtr);
  viBox111BMesh.position.copy(moBox111BBody.position);
  viBox111BMesh.quaternion.copy(moBox111BBody.quaternion);
  scene.add(viBox111BMesh);
  // 
  const moBox111Const = new CANNON.HingeConstraint(moBox111ABody, moBox111BBody, {
    axisA: new CANNON.Vec3(1, 0, 0),
    axisB: new CANNON.Vec3(1, 0, 0),
    pivotA: new CANNON.Vec3(0, -1, 0),
    pivotB: new CANNON.Vec3(0, 1, 0),
    collideConnected: false,
  });
  world.addConstraint(moBox111Const);
  moBox111BBody.applyImpulse(new CANNON.Vec3(0, 1, 0), new CANNON.Vec3( 0, 0, 6));


  const moBox222AShape = new CANNON.Box(new CANNON.Vec3(0.1, 2, 1))
  const moBox222ABody = new CANNON.Body({ mass: 0, shape: moBox222AShape, position: new CANNON.Vec3(-20, 5, 0) })
  world.addBody(moBox222ABody)
  const viBox222AGeo = new THREE.BoxGeometry(0.2, 4, 2);
  const viBox222AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox222AMesh = new THREE.Mesh(viBox222AGeo, viBox222AMtr);
  viBox222AMesh.position.copy(moBox222ABody.position);
  viBox222AMesh.quaternion.copy(moBox222ABody.quaternion);
  scene.add(viBox222AMesh);
  //
  const moBox222BShape = new CANNON.Box(new CANNON.Vec3(0.1, 2, 1))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox222BBody = new CANNON.Body({ mass: 1, shape: moBox222BShape, position: new CANNON.Vec3(-20, 5, -2) })
  world.addBody(moBox222BBody)
  const viBox222BGeo = new THREE.BoxGeometry(0.2, 4, 2);
  const viBox222BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox222BMesh = new THREE.Mesh(viBox222BGeo, viBox222BMtr);
  viBox222BMesh.position.copy(moBox222BBody.position);
  viBox222BMesh.quaternion.copy(moBox222BBody.quaternion);
  scene.add(viBox222BMesh);
  // 
  const moBox222Const = new CANNON.HingeConstraint(moBox222ABody, moBox222BBody, {
    axisA: new CANNON.Vec3(0, 1, 0),
    axisB: new CANNON.Vec3(0, 1, 0),
    pivotA: new CANNON.Vec3(0, 0, -1),
    pivotB: new CANNON.Vec3(0, 0, 1),
    collideConnected: false,
  });
  world.addConstraint(moBox222Const);
  moBox222BBody.applyImpulse(new CANNON.Vec3(0, 0, 1), new CANNON.Vec3( 6, 0, 0));


  const moBox333AShape = new CANNON.Box(new CANNON.Vec3(1, 0.1, 2))
  const moBox333ABody = new CANNON.Body({ mass: 0, shape: moBox333AShape, position: new CANNON.Vec3(-20, 5, -10) })
  world.addBody(moBox333ABody)
  const viBox333AGeo = new THREE.BoxGeometry(2, 0.2, 4);
  const viBox333AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox333AMesh = new THREE.Mesh(viBox333AGeo, viBox333AMtr);
  viBox333AMesh.position.copy(moBox333ABody.position);
  viBox333AMesh.quaternion.copy(moBox333ABody.quaternion);
  scene.add(viBox333AMesh);
  //
  const moBox333BShape = new CANNON.Box(new CANNON.Vec3(1, 0.1, 2))
  // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox333BBody = new CANNON.Body({ mass: 1, shape: moBox333BShape, position: new CANNON.Vec3(-20, 5, -12) })
  world.addBody(moBox333BBody)
  const viBox333BGeo = new THREE.BoxGeometry(2, 0.2, 4);
  const viBox333BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox333BMesh = new THREE.Mesh(viBox333BGeo, viBox333BMtr);
  viBox333BMesh.position.copy(moBox333BBody.position);
  viBox333BMesh.quaternion.copy(moBox333BBody.quaternion);
  scene.add(viBox333BMesh);
  // 
  const moBox333Const = new CANNON.HingeConstraint(moBox333ABody, moBox333BBody, {
    axisA: new CANNON.Vec3(0, 0, 1),
    axisB: new CANNON.Vec3(0, 0, 1),
    pivotA: new CANNON.Vec3(-1, 0, 0),
    pivotB: new CANNON.Vec3(1, 0, 0),
    collideConnected: false,
  });
  world.addConstraint(moBox333Const);
  moBox333BBody.applyImpulse(new CANNON.Vec3(1, 0, 0), new CANNON.Vec3( 0, 6, 0));

  var cameraPosi = -1;

  var rotX = 0;
  var rotY = 0;
  var rotZ = 0;

  // Keybindings
  // Add force on keydown
  document.addEventListener('keydown', (event) => {
    const maxSteerVal = 0.5
    const maxForce = 1000
    const brakeForce = 1000000

    switch (event.key) {
      case 'q':
        rotX += 0.02;
        moBox1ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox2ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox3ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox4ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox5ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox6ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox7ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox8ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox9ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox10ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox11ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox12ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox111ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox222ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox333ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        break;
      case 'a':
        rotX = rotX - 0.02;
        moBox1ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox2ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox3ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox4ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox5ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox6ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox7ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox8ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox9ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox10ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox11ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox12ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox111ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox222ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox333ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        break;

      case 'w':
        rotY += 0.02;
        moBox1ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox2ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox3ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox4ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox5ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox6ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox7ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox8ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox9ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox10ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox11ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox12ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox111ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox222ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox333ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        break;
      case 's':
        rotY = rotY - 0.02;
        moBox1ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox2ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox3ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox4ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox5ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox6ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox7ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox8ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox9ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox10ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox11ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox12ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox111ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox222ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox333ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        break;

      case 'e':
        rotZ += 0.02;
        moBox1ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox2ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox3ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox4ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox5ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox6ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox7ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox8ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox9ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox10ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox11ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox12ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox111ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox222ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox333ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        break;
      case 'd':
        rotZ = rotZ - 0.02;
        moBox1ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox2ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox3ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox4ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox5ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox6ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox7ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox8ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox9ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox10ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox11ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox12ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox111ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox222ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        moBox333ABody.quaternion = new CANNON.Quaternion().setFromEuler(rotX, rotY, rotZ);
        break;

      case 'r':
        // keydown時に動かす
        moBox1Const.setMotorSpeed(1);
        moBox5Const.setMotorSpeed(1);
        moBox9Const.setMotorSpeed(1);
        break;
      case 'f':
        moBox1Const.setMotorSpeed(-1);
        moBox5Const.setMotorSpeed(-1);
        moBox9Const.setMotorSpeed(-1);
        break;

      case 'c':
        cameraPosi = (cameraPosi + 1) % 2;
        break;

    }
  })
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'r':
        // keyup時に動きを止める
        moBox1Const.setMotorSpeed(0);
        moBox5Const.setMotorSpeed(0);
        moBox9Const.setMotorSpeed(0);
        break;
      case 'f':
        moBox1Const.setMotorSpeed(0);
        moBox5Const.setMotorSpeed(0);
        moBox9Const.setMotorSpeed(0);
        break;
    }
  })

  var iroty = 0;
  function animate() {
    requestAnimationFrame(animate)

    const timeStep = 1 / 60;
    world.step(timeStep)

    // ..
    viBox1AMesh.position.copy(moBox1ABody.position);
    viBox1AMesh.quaternion.copy(moBox1ABody.quaternion);
    viBox1BMesh.position.copy(moBox1BBody.position);
    viBox1BMesh.quaternion.copy(moBox1BBody.quaternion);
    viBox1Points[1].copy(moBox1ABody.quaternion.vmult(new CANNON.Vec3(-2, 0, 0)).vadd(moBox1ABody.position));
    viBox1Points[2].copy(moBox1BBody.position);
    viBox1Geo.setFromPoints(viBox1Points);

    viBox2AMesh.position.copy(moBox2ABody.position);
    viBox2AMesh.quaternion.copy(moBox2ABody.quaternion);
    viBox2BMesh.position.copy(moBox2BBody.position);
    viBox2BMesh.quaternion.copy(moBox2BBody.quaternion);
    viBox2Points[1].copy(moBox2ABody.quaternion.vmult(new CANNON.Vec3(-2, 0, 0)).vadd(moBox2ABody.position));
    viBox2Points[2].copy(moBox2BBody.position);
    viBox2Geo.setFromPoints(viBox2Points);

    viBox3AMesh.position.copy(moBox3ABody.position);
    viBox3AMesh.quaternion.copy(moBox3ABody.quaternion);
    viBox3BMesh.position.copy(moBox3BBody.position);
    viBox3BMesh.quaternion.copy(moBox3BBody.quaternion);
    viBox3Points[1].copy(moBox3ABody.quaternion.vmult(new CANNON.Vec3(-2, 0, 0)).vadd(moBox3ABody.position));
    viBox3Points[2].copy(moBox3BBody.position);
    viBox3Geo.setFromPoints(viBox3Points);

    viBox4AMesh.position.copy(moBox4ABody.position);
    viBox4AMesh.quaternion.copy(moBox4ABody.quaternion);
    viBox4BMesh.position.copy(moBox4BBody.position);
    viBox4BMesh.quaternion.copy(moBox4BBody.quaternion);
    viBox4Points[1].copy(moBox4ABody.quaternion.vmult(new CANNON.Vec3(-2, 0, 0)).vadd(moBox4ABody.position));
    viBox4Points[2].copy(moBox4BBody.position);
    viBox4Geo.setFromPoints(viBox4Points);

    viBox5AMesh.position.copy(moBox5ABody.position);
    viBox5AMesh.quaternion.copy(moBox5ABody.quaternion);
    viBox5BMesh.position.copy(moBox5BBody.position);
    viBox5BMesh.quaternion.copy(moBox5BBody.quaternion);
    viBox5Points[1].copy(moBox5ABody.quaternion.vmult(new CANNON.Vec3(0, -2, 0)).vadd(moBox5ABody.position));
    viBox5Points[2].copy(moBox5BBody.position);
    viBox5Geo.setFromPoints(viBox5Points);

    viBox6AMesh.position.copy(moBox6ABody.position);
    viBox6AMesh.quaternion.copy(moBox6ABody.quaternion);
    viBox6BMesh.position.copy(moBox6BBody.position);
    viBox6BMesh.quaternion.copy(moBox6BBody.quaternion);
    viBox6Points[1].copy(moBox6ABody.quaternion.vmult(new CANNON.Vec3(0, -2, 0)).vadd(moBox6ABody.position));
    viBox6Points[2].copy(moBox6BBody.position);
    viBox6Geo.setFromPoints(viBox6Points);


    viBox7AMesh.position.copy(moBox7ABody.position);
    viBox7AMesh.quaternion.copy(moBox7ABody.quaternion);
    viBox7BMesh.position.copy(moBox7BBody.position);
    viBox7BMesh.quaternion.copy(moBox7BBody.quaternion);
    viBox7Points[1].copy(moBox7ABody.quaternion.vmult(new CANNON.Vec3(0, -2, 0)).vadd(moBox7ABody.position));
    viBox7Points[2].copy(moBox7BBody.position);
    viBox7Geo.setFromPoints(viBox7Points);

    viBox8AMesh.position.copy(moBox8ABody.position);
    viBox8AMesh.quaternion.copy(moBox8ABody.quaternion);
    viBox8BMesh.position.copy(moBox8BBody.position);
    viBox8BMesh.quaternion.copy(moBox8BBody.quaternion);
    viBox8Points[1].copy(moBox8ABody.quaternion.vmult(new CANNON.Vec3(0, -2, 0)).vadd(moBox8ABody.position));
    viBox8Points[2].copy(moBox8BBody.position);
    viBox8Geo.setFromPoints(viBox8Points);

    viBox9AMesh.position.copy(moBox9ABody.position);
    viBox9AMesh.quaternion.copy(moBox9ABody.quaternion);
    viBox9BMesh.position.copy(moBox9BBody.position);
    viBox9BMesh.quaternion.copy(moBox9BBody.quaternion);
    viBox9Points[1].copy(moBox9ABody.quaternion.vmult(new CANNON.Vec3(0, 0, -2)).vadd(moBox9ABody.position));
    viBox9Points[2].copy(moBox9BBody.position);
    viBox9Geo.setFromPoints(viBox9Points);

    viBox10AMesh.position.copy(moBox10ABody.position);
    viBox10AMesh.quaternion.copy(moBox10ABody.quaternion);
    viBox10BMesh.position.copy(moBox10BBody.position);
    viBox10BMesh.quaternion.copy(moBox10BBody.quaternion);
    viBox10Points[1].copy(moBox10ABody.quaternion.vmult(new CANNON.Vec3(0, 0, -2)).vadd(moBox10ABody.position));
    viBox10Points[2].copy(moBox10BBody.position);
    viBox10Geo.setFromPoints(viBox10Points);

    viBox11AMesh.position.copy(moBox11ABody.position);
    viBox11AMesh.quaternion.copy(moBox11ABody.quaternion);
    viBox11BMesh.position.copy(moBox11BBody.position);
    viBox11BMesh.quaternion.copy(moBox11BBody.quaternion);
    viBox11Points[1].copy(moBox11ABody.quaternion.vmult(new CANNON.Vec3(0, 0, -2)).vadd(moBox11ABody.position));
    viBox11Points[2].copy(moBox11BBody.position);
    viBox11Geo.setFromPoints(viBox11Points);

    viBox12AMesh.position.copy(moBox12ABody.position);
    viBox12AMesh.quaternion.copy(moBox12ABody.quaternion);
    viBox12BMesh.position.copy(moBox12BBody.position);
    viBox12BMesh.quaternion.copy(moBox12BBody.quaternion);
    viBox12Points[1].copy(moBox12ABody.quaternion.vmult(new CANNON.Vec3(0, 0, -2)).vadd(moBox12ABody.position));
    viBox12Points[2].copy(moBox12BBody.position);
    viBox12Geo.setFromPoints(viBox12Points);


    viBox111AMesh.position.copy(moBox111ABody.position);
    viBox111AMesh.quaternion.copy(moBox111ABody.quaternion);
    viBox111BMesh.position.copy(moBox111BBody.position);
    viBox111BMesh.quaternion.copy(moBox111BBody.quaternion);

    viBox222AMesh.position.copy(moBox222ABody.position);
    viBox222AMesh.quaternion.copy(moBox222ABody.quaternion);
    viBox222BMesh.position.copy(moBox222BBody.position);
    viBox222BMesh.quaternion.copy(moBox222BBody.quaternion);

    viBox333AMesh.position.copy(moBox333ABody.position);
    viBox333AMesh.quaternion.copy(moBox333ABody.quaternion);
    viBox333BMesh.position.copy(moBox333BBody.position);
    viBox333BMesh.quaternion.copy(moBox333BBody.quaternion);


    // カメラ・視点 関連
    var vposi = moBox1ABody.position;
    var vquat = moBox1ABody.quaternion;
    if (cameraPosi == 0) {
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
      // _cameraPosi == 1
      // OrbitControls のマウス操作に任せる
      orbitControls.autoRotate = false;
      orbitControls.update();
    }

    renderer.render(scene, camera)
  }

  animate();
};



/*

ヒンジメモ

クラス                 | explain                        | example
ConeTwistConstraint    | 円錐形の動き、仰角制限の回転   | 回転振り子
Constraint             | ..                             | (基底クラス)
DistanceConstraint     | 一定の距離を保つ               | 固定棒で繋がったオブジェクト、カーテン、チェーン
HingeConstraint        | 蝶番の動き                     | ドア(軸１つ)、車の前輪のステアリング(軸２つ)
LockConstraint         | グループ化、一体化             | 剛体
PointToPointConstraint | 点と点を固定の一定距離でつなぐ | 振り子


[Constraint]
  △
　└──[DistanceConstraint]       .. bodyA(中心) と bodyB(中心) の距離を一定に保つ
  │
　└──[PointToPointConstraint]   .. bodyA(任意の位置) と bodyB(任意の位置) の距離を一定に保つ
　　　　  △
　　　　　└──[ConeTwistConstraint]
　　　　  │
　　　　　└──[LockConstraint]      .. bodyA(任意の位置) と bodyB(任意の位置) の位置関係を固定する
　　　　  │
　　　　　└──[HingeConstraint]

- Three.js備忘録（６）
  https://koro-koro.com/threejs-no6/

- Cannon.js の世界へようこそ！ ３歩でわかる お手軽 物理シミュレーション
  https://qiita.com/dsudo/items/66f41ef514344afeec4e

  振り子

- Javascript で動く軽量物理エンジン Cannon.js と3Dレンダラ Three.js で書いた短いサンプルコード
  https://qiita.com/yamazaki3104/items/fafb7879591caf137b52

  ヒンジ

- (public)
  https://pmndrs.github.io/cannon-es/

  - ヒンジ・パネル
    https://pmndrs.github.io/cannon-es/examples/threejs_fps

  - hinge
    https://pmndrs.github.io/cannon-es/examples/hinge

  - ragdoll
    https://pmndrs.github.io/cannon-es/examples/ragdoll

  - end0tknr's kipple - web写経開発  .. 物体の落下; ビリヤードゲーム; ヒンジによるタイヤ接合; 2コのピンによる板の接合
    https://end0tknr.hateblo.jp/entry/20210813/1628809011
    (デモのヒンジのコピー)


- (pub)
  https://el-ement.com/etc/oimo/demos/

  - バネ（横） 曲がり方向への荷重
  - バネ（縦） 移動方向への荷重

  - 回転

  - joints
    - 平行移動(軸方向に移動)
    - 平行移動＋回転(軸方向に移動、軸が回転軸)

    - 鎖（一定距離で連結
    - チェーン（ヒンジ：軸／線で結合、軸が回転軸

- cannon-es docs
https://pmndrs.github.io/cannon-es/docs/index.html
https://pmndrs.github.io/cannon-es/docs/

*/

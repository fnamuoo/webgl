// mode:javascript

// ラッセル車のごとく

// 053 
//   - 境界判定の borderRng　を使って場外判定

import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "orbitcontrols";
import * as vb from "VehicleBase";
import { Gamepad } from "Gamepad";
import * as Maze2 from "Maze2";

const freq = 45;
const timeStep = 1 / freq;
const bdebug = false; // t:場外判定の境界の表示
// const bdebug = true; // t:場外判定の境界の表示

let iniX = 0, iniY = 5, iniZ = 0, iniRotY = 0;

//    0  | 立方体（小粒）、やたら滑る床
//    1  | ひし餅（極薄）、やたら滑る床
//    2  | ひし餅、滑らない床
//    3  | ひし餅、やたら滑る床
//    4  | 立方体、デフォの床
//    5  | 球（激重）、デフォの床
//    6  | ひし餅（重）、やたら滑る床
//    7  | 立方体（重）、デフォの床
//    8  | 球（激重）、沼の床
//    9  | ビリヤード
//    10 | ボーリング
//    11 | ドミノ倒し
//    12 | 高所
//    13 | 立方体、タワー（自壊）
//    14 | レンガ、タワー（ジェンガ積み）
//    15 | レンガ、タワー（レンガ積み）
//    16 | 立方体、ピラミッド
//    17 | テーブル（簡易）
//    18 | ９パネル
//    19 | コース
//    20 | 迷路

let nstage = 21; // ステージ数
let istage = 12;  // 開始時のステージ
// let istage = 41; // テスト用(2*nstage-1

// 車の装備
let icarEQ = 0;
let ncarEQ = 11;

// let istage = -1; // 撮影用
// let istage = 0; // 撮影用
// let istage = 2; // 撮影用

// 地面に張り付ける画像とそのサイズ
const fpathlist = [['./pic2/bg_digital_pattern_blue.jpg', 800, 450],
                   ['./pic2/bg_digital_pattern_green.jpg', 800, 450],
                  ];
// const fpathlist = [['dummy', 1, 1],]; // 撮影用

function setupWorld() {
  const world = new CANNON.World()
  world.gravity.set(0, -10, 0)
  world.broadphase = new CANNON.SAPBroadphase(world)
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
    orbitControls.enablePan = true
    orbitControls.dampingFactor = 0.2
    orbitControls.minDistance = 10
    orbitControls.maxDistance = 5000
  }

  return {world, camera, scene, renderer, orbitControls};
}

const moBorderMtr = new CANNON.Material({name: 'border'})
const moBlockMtr = new CANNON.Material({name: 'block',
                                        friction: 1,
                                        restitution: 0.001})
const moBlockMass0Mtr = new CANNON.Material({name: 'blockMass0',
                                         friction: 1,
                                         restitution: 0.001})

let nBlock = 9999;
let id2movi = {};
let borderRng = [0,0,0,0];

//領域内で、車の装備の切り替えをすると、下記イベントが誤動作するのでイベント登録の削除／再登録できるよう関数化
function eventEndContactBoundary(e) {
    let moBlck = e.bodyA;
    let moBrdr = e.bodyB;
    if ((moBlck !== undefined) && (moBrdr !== undefined)) {
        if (moBlck.isBlock_ === undefined) {
            [moBlck, moBrdr] = [moBrdr, moBlck];
        }

        let posi = moBlck.position;
        if (posi.x < borderRng[0] || borderRng[2] < posi.x ||
            posi.z < borderRng[1] || borderRng[3] < posi.z) {
            if (moBlck.isIN_) {
                moBlck.isIN_ = false;
                nBlock -= 1;
            }
            setLabelB("Rest: "+nBlock)
            // if (nBlock == 0) {
            //     console.log("\n .. stageClear()");
            //     // stageClear();
            // }
        }
    }
}

window.onload = () => {
    let world, camera, scene, renderer, orbitControls, vehicle;
    let moBorder2Body;

    function createWorld() {
        iniX = 0, iniY = 5, iniZ = 0;
        const {world, camera, scene, renderer, orbitControls} = setupWorld();
        id2movi = {};

        const moGroundMtr = new CANNON.Material({name: 'ground'})

        let vehicle = new vb.VehicleFR01(scene, world, moGroundMtr, moBlockMass0Mtr);
        vehicle.init();
        let moBorder2Body = null;

        // ----------------------------------------

        function createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene) {
            let ssx_ = ssx/2, ssy_ = ssy/2, ssz_ = ssz/2;
            const moBorder2Body = new CANNON.Body
            ({mass: 0,
              shape: new CANNON.Box(new CANNON.Vec3(ssx_, ssy_, ssz_)),
              position: new CANNON.Vec3(ppx+adjx, ppy+adjy, ppz+adjz),
              material: moBorderMtr,
              isTrigger: true,
             });
            moBorder2Body.isBorder_ = true;
            world.addBody(moBorder2Body);
            if (bdebug) {
                const viBorder2Geo = new THREE.BoxGeometry(ssx, ssy, ssz);
                const viBorder2Mtr = new THREE.MeshBasicMaterial({wireframe:true, transparent: true, opacity: 0.4});
                const viBorder2Mesh = new THREE.Mesh(viBorder2Geo, viBorder2Mtr);
                scene.add(viBorder2Mesh);
                viBorder2Mesh.position.copy(moBorder2Body.position);
                viBorder2Mesh.quaternion.copy(moBorder2Body.quaternion);
            }
            // ブロックが再侵入した際の検知
            moBorder2Body.addEventListener('collide', (e) => {
                let moBlck = e.contact.bi;
                let moBrdr = e.contact.bj;
                if ((moBlck !== undefined) && (moBrdr !== undefined)) {
                    if (moBlck.isBlock_ === undefined) {
                        [moBlck, moBrdr] = [moBrdr, moBlck];
                    }
                    if ((moBrdr.isBorder_ != undefined) && (moBlck.isBlock_ != undefined)) {
                        let posi = moBlck.position;
                        if (posi.x >= borderRng[0] && borderRng[2] >= posi.x &&
                            posi.z >= borderRng[1] && borderRng[3] >= posi.z) {
                            if (moBlck.isIN_ == false) {
                                moBlck.isIN_ == true;
                                ++nBlock;
                            }
                        }
                    }
                }
            })

            world.addEventListener('endContact', eventEndContactBoundary);
        };

        // ----------------------------------------
        // コース
        {
            // 台座
            const grndw = 1000, grndh = 1000, grndt = 100, grndw_ = grndw/2, grndh_ = grndh/2, grndt_ = grndt/2;
            const moGround2Body = new CANNON.Body({
                mass: 0,
                shape: new CANNON.Box(new CANNON.Vec3(grndw_, grndt_, grndh_)),
                position: new CANNON.Vec3(0, -grndt_, 0),
                material: moGroundMtr,
            });
            world.addBody(moGround2Body);
            const viGround2Geo = new THREE.BoxGeometry(grndw, grndt, grndh);
            const viGround2Mtr = new THREE.MeshBasicMaterial({color: 0x404040, transparent: true, opacity: 0.8});
            const viGround2Mesh = new THREE.Mesh(viGround2Geo, viGround2Mtr);
            scene.add(viGround2Mesh);
            viGround2Mesh.position.copy(moGround2Body.position);
            viGround2Mesh.quaternion.copy(moGround2Body.quaternion);
            // 基準面を作成 (1000pixel四方を 100x100分割  10x10[pixel/block]
            const viBaseGrid = new THREE.GridHelper(1000, 100, 0xff8888, 0xc0c0c0);
            viBaseGrid.position.set(0, 0, -0.01);
            scene.add(viBaseGrid);
        }

        if (1) {
            // キャンバス
            const finfo = fpathlist[Math.floor(Math.random()*fpathlist.length)];
            const fpath = finfo[0];
            // 画像サイズそのままだと間延びした感じなのでリサイズする
            const cnvw = finfo[1]/10, cnvh = finfo[2]/10;
            const viGround2Geo = new THREE.PlaneGeometry(cnvw, cnvh);
            const texture = new THREE.TextureLoader().load(fpath); 
            const viGround2Mtr = new THREE.MeshBasicMaterial({map: texture});
            const viGround2Mesh = new THREE.Mesh(viGround2Geo, viGround2Mtr);
            scene.add(viGround2Mesh);
            viGround2Mesh.position.copy(new THREE.Vector3(0, 0.01, 0,));
            viGround2Mesh.quaternion.copy(new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI/2));
        }

        nBlock = 9999;
        id2movi = {};
        borderRng = [0,0,0,0];

        // --------------------
        // キャンバスを覆うブロックを作成

        function createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, momtr, vimtr) {
            const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            const moBlock2Body = new CANNON.Body
            ({mass: mass,
              shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
              position: new CANNON.Vec3(px+adjx, py+adjy, pz+adjz),
              material: momtr,
             });
            moBlock2Body.isBlock_ = true;
            moBlock2Body.isIN_ = true;
            world.addBody(moBlock2Body);
            const viBlock2Geo = new THREE.BoxGeometry(sx, sy, sz);
            const viBlock2Mtr = vimtr;
            const viBlock2Mesh = new THREE.Mesh(viBlock2Geo, viBlock2Mtr);
            scene.add(viBlock2Mesh);
            viBlock2Mesh.position.copy(moBlock2Body.position);
            viBlock2Mesh.quaternion.copy(moBlock2Body.quaternion);
            world.addEventListener('postStep', () => {
                viBlock2Mesh.position.copy(moBlock2Body.position);
                viBlock2Mesh.quaternion.copy(moBlock2Body.quaternion);
            })
            return [moBlock2Body, viBlock2Mesh];
        }

        function createSphere(radius, px, py, pz, adjx, adjy, adjz, mass, momtr, vimtr) {
            const moBlock2Body = new CANNON.Body
            ({mass: mass,
              shape: new CANNON.Sphere(radius),
              position: new CANNON.Vec3(px+adjx, py+adjy, pz+adjz),
              material: momtr,
             });
            moBlock2Body.isBlock_ = true;
            moBlock2Body.isIN_ = true;
            world.addBody(moBlock2Body);
            const viBlock2Geo = new THREE.SphereGeometry(radius);
            const viBlock2Mtr = vimtr;
            const viBlock2Mesh = new THREE.Mesh(viBlock2Geo, viBlock2Mtr);
            scene.add(viBlock2Mesh);
            viBlock2Mesh.position.copy(moBlock2Body.position);
            viBlock2Mesh.quaternion.copy(moBlock2Body.quaternion);
            world.addEventListener('postStep', () => {
                viBlock2Mesh.position.copy(moBlock2Body.position);
                viBlock2Mesh.quaternion.copy(moBlock2Body.quaternion);
            })
            return [moBlock2Body, viBlock2Mesh];
        }

        function createCylinder(radiusTop, radiusBottom, height, numSegment, px, py, pz, adjx, adjy, adjz, mass, momtr, vimtr) {
            const moBlock2Body = new CANNON.Body
            ({mass: mass,
              shape: new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegment),
              position: new CANNON.Vec3(px+adjx, py+adjy, pz+adjz),
              material: momtr,
             });
            moBlock2Body.isBlock_ = true;
            moBlock2Body.isIN_ = true;
            world.addBody(moBlock2Body);
            const viBlock2Geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment);
            const viBlock2Mtr = vimtr;
            const viBlock2Mesh = new THREE.Mesh(viBlock2Geo, viBlock2Mtr);
            scene.add(viBlock2Mesh);
            viBlock2Mesh.position.copy(moBlock2Body.position);
            viBlock2Mesh.quaternion.copy(moBlock2Body.quaternion);
            world.addEventListener('postStep', () => {
                viBlock2Mesh.position.copy(moBlock2Body.position);
                viBlock2Mesh.quaternion.copy(moBlock2Body.quaternion);
            })
            return [moBlock2Body, viBlock2Mesh];
        }

        function createCylinder2(radiusTop, radiusBottom, height, numSegment, px, py, pz, adjx, adjy, adjz, mass, momtr, vimtr) {
            // 横にする(縦を９０度回転
            const quatR = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI/2);
            const moBlock2Body = new CANNON.Body
            ({mass: mass,
              shape: new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegment),
              position: new CANNON.Vec3(px+adjx, py+adjy, pz+adjz),
              quaternion: quatR,
              material: momtr,
             });
            moBlock2Body.isBlock_ = true;
            moBlock2Body.isIN_ = true;
            world.addBody(moBlock2Body);
            const viBlock2Geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, numSegment);
            const viBlock2Mtr = vimtr;
            const viBlock2Mesh = new THREE.Mesh(viBlock2Geo, viBlock2Mtr);
            scene.add(viBlock2Mesh);
            viBlock2Mesh.position.copy(moBlock2Body.position);
            viBlock2Mesh.quaternion.copy(moBlock2Body.quaternion);
            world.addEventListener('postStep', () => {
                viBlock2Mesh.position.copy(moBlock2Body.position);
                viBlock2Mesh.quaternion.copy(moBlock2Body.quaternion);
            })
            return [moBlock2Body, viBlock2Mesh];
        }

        // !!!
        console.log("\n istage=",istage);

        function createStage_debug() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 0.2;
            let sx = 5, sy = 10, sz = 5;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let iixs = 0, iixe = 1, iizs = -1, iize = 1;
            let py = sy_;
            let idx = 0;
            id2movi = {};
            for (let iiz = iizs; iiz < iize; ++iiz) {
                let pz = iiz * sz;
                for (let iix = iixs; iix < iixe; ++iix) {
                    let px = iix * sx;
                    const viBlock2Mtr = new THREE.MeshNormalMaterial();
                    let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viBlock2Mtr);
                    moBlock2Body.idx = idx;
                    id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                    ++idx;
                }
            }
            iniZ += sz * (iize+10);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.01,  // 0.9,  // 摩擦係数(def=0.3)
                restitution: 0.3, // 0,  // 反発係数 (def=0.3)
                contactequationstiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block)
            // 境界
            if (1) {
                let ssx = sx*(iixe-iixs+4), ssy = sy+10, ssz = sz*(iize-iizs+4);
                let ppx = 0, ppy = 0, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = (iixe-iixs) * (iize-iizs);
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_flat_normal() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 0.2;
            let sx = 5, sy = 1, sz = 5;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let iixs = -10, iixe = 10, iizs = -10, iize = 10;
            let py = sy_;
            let idx = 0;
            id2movi = {};
            for (let iiz = iizs; iiz < iize; ++iiz) {
                let pz = iiz * sz;
                for (let iix = iixs; iix < iixe; ++iix) {
                    let px = iix * sx;
                    const viBlock2Mtr = new THREE.MeshNormalMaterial();
                    let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viBlock2Mtr);
                    moBlock2Body.idx = idx;
                    id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                    ++idx;
                }
            }
            iniZ += sz * (iize+10);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.9,  // 0.9,  // 摩擦係数(def=0.3)
                restitution: 0.3, // 0,  // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block)
            // 境界
            if (1) {
                let ssx = sx*(iixe-iixs+4), ssy = sy+20, ssz = sz*(iize-iizs+4);
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = (iixe-iixs) * (iize-iizs);
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_flat_slippery() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 0.2;
            let sx = 5, sy = 1, sz = 5;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let iixs = -10, iixe = 10, iizs = -10, iize = 10;
            let py = sy_;
            let idx = 0;
            id2movi = {};
            for (let iiz = iizs; iiz < iize; ++iiz) {
                let pz = iiz * sz;
                for (let iix = iixs; iix < iixe; ++iix) {
                    let px = iix * sx;
                    const viBlock2Mtr = new THREE.MeshNormalMaterial();
                    let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viBlock2Mtr);
                    moBlock2Body.idx = idx;
                    id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                    ++idx;
                }
            }
            iniZ += sz * (iize+10);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.0001,   // 摩擦係数(def=0.3)
                restitution: 0.3,   // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block)
            // 境界
            if (1) {
                let ssx = sx*(iixe-iixs+4), ssy = sy+20, ssz = sz*(iize-iizs+4);
                let ppx = 0, ppy = ssy/2 -1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = (iixe-iixs) * (iize-iizs);
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_cube_normal() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 0.2;
            let sx = 5, sy = 5, sz = 5;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let iixs = -10, iixe = 10, iizs = -10, iize = 10;
            let py = sy_;
            let idx = 0;
            id2movi = {};
            for (let iiz = iizs; iiz < iize; ++iiz) {
                let pz = iiz * sz;
                for (let iix = iixs; iix < iixe; ++iix) {
                    let px = iix * sx;
                    const viWall2Mtr = new THREE.MeshNormalMaterial();
                    let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                    moBlock2Body.idx = idx;
                    id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                    ++idx;
                }
            }
            iniZ += sz * (iize+10);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.3,    // 摩擦係数(def=0.3)
                restitution: 0.3, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block)
            // 境界
            if (1) {
                let ssx = sx*(iixe-iixs+4), ssy = sy+20, ssz = sz*(iize-iizs+4);
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = (iixe-iixs) * (iize-iizs);
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_sphereHeavy_normal() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 10;
            let radius = 2.5;
            let sx = 2*radius, sy = 2*radius, sz = 2*radius;
            let iixs = -10, iixe = 10, iizs = -10, iize = 10;
            let py = sx/2;
            let idx = 0;
            id2movi = {};
            for (let iiz = iizs; iiz < iize; ++iiz) {
                let pz = iiz * sz;
                for (let iix = iixs; iix < iixe; ++iix) {
                    let px = iix * sx;
                    const viWall2Mtr = new THREE.MeshBasicMaterial({color:0x000000, transparent: true, opacity: 0.9});
                    let [moBlock2Body, viBlock2Mesh] = createSphere(radius, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                    moBlock2Body.idx = idx;
                    id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                    ++idx;
                }
            }
            iniZ += sz * (iize+10);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.3,    // 摩擦係数(def=0.3)
                restitution: 0.3, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = sx*(iixe-iixs+4), ssy = sy+20, ssz = sz*(iize-iizs+4);
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = (iixe-iixs) * (iize-iizs);
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_flatHeavy_slippery() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 3;
            let sx = 5, sy = 2, sz = 5;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let iixs = -10, iixe = 10, iizs = -10, iize = 10;
            let py = sy_;
            let idx = 0;
            id2movi = {};
            for (let iiz = iizs; iiz < iize; ++iiz) {
                let pz = iiz * sz;
                for (let iix = iixs; iix < iixe; ++iix) {
                    let px = iix * sx;
                    const viWall2Mtr = new THREE.MeshBasicMaterial({color:0x000000, transparent: true, opacity: 0.5});
                    let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                    moBlock2Body.idx = idx;
                    id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                    ++idx;
                }
            }
            iniZ += sz * (iize+10);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.0001,    // 摩擦係数(def=0.3)
                restitution: 0.3,    // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = sx*(iixe-iixs+4), ssy = sy+20, ssz = sz*(iize-iizs+4);
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = (iixe-iixs) * (iize-iizs);
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_cubeHeavy_normal() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 3;
            let sx = 5, sy = 5, sz = 5;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let iixs = -10, iixe = 10, iizs = -10, iize = 10;
            let py = sy_;
            let idx = 0;
            id2movi = {};
            for (let iiz = iizs; iiz < iize; ++iiz) {
                let pz = iiz * sz;
                for (let iix = iixs; iix < iixe; ++iix) {
                    let px = iix * sx;
                    const viWall2Mtr = new THREE.MeshBasicMaterial({color:0x000000, transparent: true, opacity: 0.5});
                    let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                    moBlock2Body.idx = idx;
                    id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                    ++idx;
                }
            }
            iniZ += sz * (iize+10);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.3,    // 摩擦係数(def=0.3)
                restitution: 0.3, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = sx*(iixe-iixs+4), ssy = sy+20, ssz = sz*(iize-iizs+4);
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = (iixe-iixs) * (iize-iizs);
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_cubeSmall_slippery() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 0.01;
            let sx = 1, sy = 0.5, sz = 1;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let iixs = -10, iixe = 10, iizs = -10, iize = 10;
            let py = sy_;
            let gridx = 2, gridz = 2;
            let idx = 0;
            id2movi = {};
            for (let iiz = iizs; iiz < iize; ++iiz) {
                let pz = iiz * gridz;
                for (let iix = iixs; iix < iixe; ++iix) {
                    let px = iix * gridx;
                    const viWall2Mtr = new THREE.MeshBasicMaterial({color:0xffffff});
                    let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                    moBlock2Body.idx = idx;
                    id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                    ++idx;
                }
            }
            iniZ += gridz * (iize+10);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.0001,   // 摩擦係数(def=0.3)
                restitution: 0.3,   // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = gridx*(iixe-iixs+6), ssy = sy+20, ssz = gridz*(iize-iizs+6);
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = (iixe-iixs) * (iize-iizs);
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_flatThin_slippery() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 0.01;
            let sx = 5, sy = 0.3, sz = 5;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let iixs = -10, iixe = 10, iizs = -10, iize = 10;
            let py = sy_;
            let idx = 0;
            id2movi = {};
            for (let iiz = iizs; iiz < iize; ++iiz) {
                let pz = iiz * sz;
                for (let iix = iixs; iix < iixe; ++iix) {
                    let px = iix * sx;
                    const viWall2Mtr = new THREE.MeshBasicMaterial({color:0xffffff});
                    let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                    moBlock2Body.idx = idx;
                    id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                    ++idx;
                }
            }
            iniZ += sz * (iize+10);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.0001,   // 摩擦係数(def=0.3)
                restitution: 0.3,   // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = sx*(iixe-iixs+4), ssy = sy+20, ssz = sz*(iize-iizs+4);
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = (iixe-iixs) * (iize-iizs);
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_billiards() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 0.4;
            let radius = 1, radius_ = radius/2;
            let rSQ3 = radius*Math.sqrt(3);
            let sx = 2*radius, sy = 2*radius, sz = 2*radius;
            let iixs = -10, iixe = 10, iizs = -10, iize = 10;
            let py = sx/2;
            // 白球
            const viWall2Mtr0 = new THREE.MeshBasicMaterial({color:0xffffff});
            {
                let px = 0, pz = 30;
                createSphere(radius, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr0);
            }
            // 色付きの球
            let pxzlist = [[0,0],
                           [-radius,-rSQ3],[+radius,-rSQ3],
                           [-radius*2,-rSQ3*2],[0,-rSQ3*2],[+radius*2,-rSQ3*2],
                           [-radius,-rSQ3*3],[+radius,-rSQ3*3],
                           [0,-rSQ3*4],
                          ];
            let idx = 0;
            id2movi = {};
            for (let [px, pz] of pxzlist) {
                const viWall2Mtr = new THREE.MeshNormalMaterial();
                let [moBlock2Body, viBlock2Mesh] = createSphere(radius, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                moBlock2Body.idx = idx;
                id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                ++idx;
            }
            iniZ += 50;
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.3,  // 0.9,  // 摩擦係数(def=0.3)
                restitution: 0.3, // 0,  // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = radius*8, ssy = radius+20, ssz = rSQ3*6;
                let ppx = 0, ppy = 0, ppz = -ssz/2 + rSQ3;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = 9;
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_+ppz, ssx_, ssz_+ppz];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }


        function createStage_bowling() {
            let adjx = 0, adjy = 0, adjz = 0;
            // ボール
            let ballR = 4, ballR_ = ballR/2, ballMass = 1.0;
            // ピン
            let radiusTop = 0.5, radiusBottom = 1.0, height = 6, numSegment = 16, mass = 0.4;
            let radius = 2, radius_ = radius/2;
            let rSQ3 = radius*Math.sqrt(3);
            let sx = 2*radius, sy = 2*radius, sz = 2*radius;
            let iixs = -10, iixe = 10, iizs = -10, iize = 10;
            let py = height/2; // sx/2;
            // ボール
            const viWall2Mtr0 = new THREE.MeshBasicMaterial({color:0xffffff});
            {
                let px = 0, py = ballR, pz = 60;
                createSphere(ballR, px, py, pz, adjx, adjy, adjz, ballMass, moBlockMtr, viWall2Mtr0);
            }
            // ピン
            let pxzlist = [[0,0],
                           [-radius,-rSQ3],[+radius,-rSQ3],
                           [-radius*2,-rSQ3*2],[0,-rSQ3*2],[+radius*2,-rSQ3*2],
                           [-radius*3,-rSQ3*3],[-radius,-rSQ3*3],[+radius,-rSQ3*3],[+radius*3,-rSQ3*3],
                          ];
            let idx = 0;
            id2movi = {};
            for (let [px, pz] of pxzlist) {
                const viWall2Mtr = new THREE.MeshNormalMaterial();
                let [moBlock2Body, viBlock2Mesh] = createCylinder(radiusTop, radiusBottom, height, numSegment, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr)
                moBlock2Body.idx = idx;
                id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                ++idx;
            }
            iniZ += 80;
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.1,    // 摩擦係数(def=0.3)
                restitution: 0.3, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = radius*8, ssy = radius+20, ssz = rSQ3*6;
                let ppx = 0, ppy = 0, ppz = -ssz/2 + rSQ3;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = 10;
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_+ppz, ssx_, ssz_+ppz];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_domino() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 0.02;
            let sx = 2.0, sy = 4.0, sz = 0.2;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let py = sy_, nlayer = 20, padx = 2.5, padz = 3.0;
            let idx = 0;
            id2movi = {};
            for (let ilayer = 0; ilayer < nlayer; ++ilayer) {
                let pz = -ilayer * padz;
                let pxadjx = -ilayer*padx/2;
                for (let jlayer = 0; jlayer < ilayer+1; ++jlayer) {
                    let px = jlayer * padx +pxadjx;
                    const viWall2Mtr = new THREE.MeshNormalMaterial();
                    let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                    moBlock2Body.idx = idx;
                    id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                    ++idx;
                }
            }
            iniZ += nlayer * padz +30;
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.1,    // 摩擦係数(def=0.3)
                restitution: 0.3, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = (nlayer+2)*padx, ssy = sy+20, ssz = (nlayer+4)*padz;
                let ppx = 0, ppy = ssy/2-1, ppz = -ssz/2 + padz*2;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = nlayer*(nlayer-1)/2;
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz, ssx_, 0];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_sphereHeavy_swamp() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 10;
            let radius = 2.5;
            let sx = 2*radius, sy = 2*radius, sz = 2*radius;
            let iixs = -2, iixe = 3, iizs = -2, iize = 3;
            let py = sx/2;
            let idx = 0;
            id2movi = {};
            for (let iiz = iizs; iiz < iize; ++iiz) {
                let pz = iiz * sz;
                for (let iix = iixs; iix < iixe; ++iix) {
                    let px = iix * sx;
                    const viWall2Mtr = new THREE.MeshBasicMaterial({color:0x000000, transparent: true, opacity: 0.9});
                    let [moBlock2Body, viBlock2Mesh] = createSphere(radius, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                    moBlock2Body.idx = idx;
                    id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                    ++idx;
                }
            }
            iniZ += sz * (iize+10);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.5,    // 摩擦係数(def=0.3)
                restitution: 0.1, // 反発係数 (def=0.3)
                contactEquationStiffness: 3e1,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = sx*(iixe-iixs+4), ssy = sy+20, ssz = sz*(iize-iizs+4);
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = (iixe-iixs) * (iize-iizs);
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_sphere_high() {
            let adjx = 0, adjy = 0, adjz = 0, mass = 10;
            let radius = 2.5;
            let sx = 5.0, sy = 18.0, sz = 5.0;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let gridx = 10.0, gridz = 10.0;
            let iixs = -2, iixe = 3, iizs = -2, iize = 3;
            let iixzmax = Math.max(-iixs, iixe-1, -iizs, iize-1), steph = 6;
            let px = 0, py = 0, pz = 0;
            let mass1 = 1000, mass2 = 0.1;
            let idx = 0;
            let pxx = 0, pyy = 0, pzz = 0;
            let tmplist = [];
            for (let iiz = iizs; iiz < iize; ++iiz) {
                let pz = iiz * gridz;
                for (let iix = iixs; iix < iixe; ++iix) {
                    let px = iix * gridx;
                    pxx = px;
                    let ssy = sy + (iixzmax - Math.abs(iix) - Math.abs(iiz))*steph, ssy_ = ssy/2;
                    pyy = ssy_;
                    pzz = pz;
                    tmplist.push({key:ssy,
                                  val:[px, pz, pxx, pyy, pzz, ssy]})
                }
            }
            // key の降順にソート
            tmplist.sort((a,b) => a.key < b.key ? 1 : -1 );
            id2movi = {};
            const viWall2Mtr1 = new THREE.MeshBasicMaterial({color:0x000000, transparent: true, opacity: 0.9});
            for (let tmp of tmplist) {
                let [px, pz, pxx, pyy, pzz, ssy] = tmp.val;
                createBox(sx, ssy, sz, pxx, pyy, pzz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr1);
                const viWall2Mtr2 = new THREE.MeshNormalMaterial();
                pxx = px;
                pyy = ssy + radius;
                pzz = pz;
                let [moBlock2Body, viBlock2Mesh] = createSphere(radius, pxx, pyy, pzz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr2);
                moBlock2Body.idx = idx;
                id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                ++idx;
            }
            iniZ += gridz * (iize+10);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.3,    // 摩擦係数(def=0.3)
                restitution: 0.3, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = gridx*(iixe-iixs+4), ssy = sy+steph*iixzmax+20, ssz = gridz*(iize-iizs+4);
                let ppx = 0, ppy = ssy/2-2, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = (iixe-iixs) * (iize-iizs);
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_cube_tower() {
            let adjx = 0, adjy = 2.5, adjz = 0, mass = 5;
            let sx = 5.0, sy = 5.0, sz = 5.0;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let gridx = 10.0, gridz = 10.0;
            let iixs = -1, iixe = 2, iiys = 0, iiye = 13, iizs = -1, iize = 2;
            let px = 0, py = 0, pz = 0;
            let idx = 0;
            id2movi = {};
            for (let [px,pz] of [[0,0], [-20,0], [20,0], [0,20], [-20,20], [20,20], [0,-20], [-20,-20], [20,-20] ]) {
                let radius = 2; py = radius;
                const viWall2Mtr2 = new THREE.MeshNormalMaterial();
                let [moBlock2Body, viBlock2Mesh] = createSphere(radius, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr2);
                moBlock2Body.idx = idx;
                id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                ++idx;
            }
            const adjxylist = [[-10, -50],
                               [ 40, -10],
                               [-40,  10],
                               [ 10,  40],];
            // ゆきはい
            const cfflist = [ 0xcfd7df, 0xced9dd, 0xced2dd,];
            const viWall2MtrList = [new THREE.MeshBasicMaterial({color:cfflist[0], transparent: true, opacity: 0.9}),
                                    new THREE.MeshBasicMaterial({color:cfflist[1], transparent: true, opacity: 0.9}),
                                    new THREE.MeshBasicMaterial({color:cfflist[2], transparent: true, opacity: 0.9}),
                                    ];

            for (let [adjxx,adjzz] of adjxylist) {
                for (let iiy = iiye-1; iiy >= iiys; --iiy) {
                    let py = iiy * sy;
                    for (let iiz = iize-1; iiz >= iizs; --iiz) {
                        let pz = iiz * sz;
                        for (let iix = iixs; iix < iixe; ++iix) {
                            let px = iix * sx;
                            const viWall2Mtr = viWall2MtrList[Math.floor(Math.random()*3)]
                            createBox(sx, sy, sz, px, py, pz, adjxx, adjy, adjzz, mass, moBlockMtr, viWall2Mtr);
                        }
                    }
                }
            }
            iniZ += sz * (iize+50);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 1,    // 摩擦係数(def=0.3)
                restitution: 0.001, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e17,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = sx*30, ssy = sy*80, ssz = sz*30;
                let ppx = 0, ppy = ssy/2-1-adjy, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = idx;
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_rect_tower_jenga() {
            let adjx = 0, adjy = 2.5, adjz = 0, mass = 1;
            let sx = 5.0, sy = 5.0, sz = 5.0, s5 = sx*5;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let gridx = 10.0, gridz = 10.0;
            let iixs = -2, iixe = 3, iiys = 0, iiye = 13, iizs = -2, iize = 3;
            let px = 0, py = 0, pz = 0;
            let idx = 0;
            let iixzmod, ssx, ssy, ssz;
            id2movi = {};
            {
                let radius = 2; py = radius + sy*iiye;
                const viWall2Mtr2 = new THREE.MeshNormalMaterial();
                let [moBlock2Body, viBlock2Mesh] = createSphere(radius, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr2);
                moBlock2Body.idx = idx;
                id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                ++idx;
            }
            let ptrg = 0.05;
            // まつばいろ
            const cfflist1 = [ 0x687e52, 0x707c52, 0x5f7c52,];
            const cfflist2 = [ 0x6a8655, 0x738454, 0x608454,];
            const viWall2MtrList1 = [new THREE.MeshBasicMaterial({color:cfflist1[0], transparent: true, opacity: 0.9}),
                                     new THREE.MeshBasicMaterial({color:cfflist1[1], transparent: true, opacity: 0.9}),
                                     new THREE.MeshBasicMaterial({color:cfflist1[2], transparent: true, opacity: 0.9}),
                                    ];
            const viWall2MtrList2 = [new THREE.MeshBasicMaterial({color:cfflist2[0], transparent: true, opacity: 0.9}),
                                     new THREE.MeshBasicMaterial({color:cfflist2[1], transparent: true, opacity: 0.9}),
                                     new THREE.MeshBasicMaterial({color:cfflist2[2], transparent: true, opacity: 0.9}),
                                    ];
            for (let iiy = iiye-1; iiy >= iiys; --iiy) {
                let py = iiy * sy;
                if ((py%2) == 0) {
                    let niiz = (iize - iizs);
                    let miiz = (iize + iizs -1) / 2;
                    let pz = miiz*sz, ssz = niiz*sz;
                    for (let iix = iixs; iix < iixe; ++iix) {
                        let px = iix * sx;
                        if (Math.random() < ptrg) {
                            const viWall2Mtr = new THREE.MeshNormalMaterial();
                            let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, ssz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                            moBlock2Body.idx = idx;
                            id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                            ++idx;
                        } else {
                            const viWall2Mtr1 = viWall2MtrList1[Math.floor(Math.random()*3)];
                            createBox(sx, sy, ssz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr1);
                        }
                    }
                } else {
                    let niix = (iixe - iixs);
                    let miix = (iixe + iixs -1) / 2;
                    let px = miix*sx, ssx = niix*sx;
                    for (let iiz = iizs; iiz < iize; ++iiz) {
                        let pz = iiz * sz;
                        if (Math.random() < ptrg) {
                            const viWall2Mtr = new THREE.MeshNormalMaterial();
                            let [moBlock2Body, viBlock2Mesh] = createBox(ssx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                            moBlock2Body.idx = idx;
                            id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                            ++idx;
                        } else {
                            const viWall2Mtr2 = viWall2MtrList2[Math.floor(Math.random()*3)];
                            createBox(ssx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr2);
                        }
                    }
                }
            }
            iniZ += gridz * (iize+10);
            const ground_block2 = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 1,    // 摩擦係数(def=0.3)
                restitution: 0.001, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e17,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block2);
            // 境界
            if (1) {
                let ssx = sx*(iixe-iixs+4), ssy = sy*(iiye-iiys+2), ssz = sz*(iize-iizs+4);
                let ppx = 0, ppy = ssy/2-sy, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = idx;
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_rect_tower_renga() {
            let adjx = 0, adjy = 2.5, adjz = 0, mass = 1;
            let sx = 5.0, sy = 5.0, sz = 5.0, s2 = sx*2;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let gridx = 10.0, gridz = 10.0;
            let iixs = -2, iixe = 3, iiys = 0, iiye = 13, iizs = -2, iize = 3;
            let px = 0, py = 0, pz = 0;
            let idx = 0;
            let iixzmod, ssx, ssy, ssz, ppx, ppz, ii0 = -(iixs + iizs);
            id2movi = {};
            {
                let radius = 2; py = radius + sy*iiye;
                const viWall2Mtr2 = new THREE.MeshNormalMaterial();
                let [moBlock2Body, viBlock2Mesh] = createSphere(radius, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr2);
                moBlock2Body.idx = idx;
                id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                ++idx;
            }
            // れんが、あじろ
            // https://www.gb-higoya.co.jp/%E6%8A%80%E8%A1%93%E8%B3%87%E6%96%99/%E8%88%97%E8%A3%85%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3/
            for (let iiy = iiye-1; iiy >= iiys; --iiy) {
                let py = iiy * sy;
                if ((py%2) == 0) {
                    for (let iiz = iizs; iiz < iize; ++iiz) {
                        let pz = iiz * sz;
                        for (let iix = iixs; iix < iixe; ++iix) {
                            let px = iix * sx;
                            let imd = (ii0 + iix + iiz + iiy) % 4; // 縦横の座標(ix,iz)の和の端数でレンガの向きを決める
                            ssx = sx; ssz = sz;
                            ppx = px; ppz = pz;
                            let cff = 0x9C4836;
                            if (imd == 0) {
                                if (iix < iixe-1) {
                                    // 横長のレンガ
                                    ssx = s2; ssz = sz; ppx = px + sx_; cff = 0x9b5b36;
                                }
                            } else if (imd == 2) {
                                if (iiz < iize-1) {
                                    // 縦長のレンガ
                                    ssx = sx; ssz = s2; ppz = pz + sz_; cff = 0x9b6f36;
                                }
                            } else if ((imd == 1) && (iix == iixs)) {
                                // 境界では立方体のレンガを
                            } else if ((imd == 3) && (iiz == iizs)) {
                                // 境界では立方体のレンガを
                            } else {
                                continue;
                            }
                            const viWall2Mtr = new THREE.MeshBasicMaterial({color:cff, transparent: true, opacity: 0.9});
                            createBox(ssx, sy, ssz, ppx, py, ppz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                        }
                    }
                } else {
                    for (let iiz = iizs; iiz < iize; ++iiz) {
                        let pz = iiz * sz;
                        for (let iix = iixs; iix < iixe; ++iix) {
                            let px = iix * sx;
                            let imd = (ii0 + iix + iiz + iiy) % 4;
                            ssx = sx; ssz = sz;
                            ppx = px; ppz = pz;
                            let cff = 0x7F3620;
                            if (imd == 0) {
                                if (iix < iixe-1) {
                                    ssx = s2; ssz = sz; ppx = px + sx_; cff = 0x7c2220;
                                }
                            } else if (imd == 2) {
                                if (iiz < iize-1) {
                                    ssx = sx; ssz = s2; ppz = pz + sz_; cff = 0x7c4720;
                                }
                            } else if ((imd == 1) && (iix == iixs)) {
                            } else if ((imd == 3) && (iiz == iizs)) {
                            } else {
                                continue;
                            }
                            const viWall2Mtr = new THREE.MeshBasicMaterial({color:cff, transparent: true, opacity: 0.9});
                            createBox(ssx, sy, ssz, ppx, py, ppz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                        }
                    }
                }
            }
            iniZ += sz * (iize+5);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 1,    // 摩擦係数(def=0.3)
                restitution: 0.001, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e17,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = sx*(iixe-iixs+4), ssy = sy*(iiye-iiys+2), ssz = sz*(iize-iizs+4);
                let ppx = 0, ppy = ssy/2-sy, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = idx;
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_cube_pyramid() {
            let adjx = 0, adjy = 2.5, adjz = 0, mass = 1;
            let sx = 5.0, sy = 5.0, sz = 5.0;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let gridx = 10.0, gridz = 10.0;
            let iixs, iixe, iiys = 0, iiye = 10, iiyX = 5, iizs, iize;
            let px = 0, py = 0, pz = 0;
            let idx = 0;
            id2movi = {};
            {
                // 頂上に球を配置
                let radius = 2.5; px = -radius; py = radius + sy*(iiye-1); pz = -radius;
                const viWall2Mtr2 = new THREE.MeshNormalMaterial();
                let [moBlock2Body, viBlock2Mesh] = createSphere(radius, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr2);
                moBlock2Body.idx = idx;
                id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                ++idx;
            }
            // すな
            const cfflist = [ 0xc5b69e, 0xc4ad9f, 0xc4a69f, 0xccc3a1, 0xccb1a1, 0xcccba1,];
            const viWall2MtrList = [new THREE.MeshBasicMaterial({color:cfflist[0], transparent: true, opacity: 0.9}),
                                    new THREE.MeshBasicMaterial({color:cfflist[1], transparent: true, opacity: 0.9}),
                                    new THREE.MeshBasicMaterial({color:cfflist[2], transparent: true, opacity: 0.9}),
                                    new THREE.MeshBasicMaterial({color:cfflist[3], transparent: true, opacity: 0.9}),
                                    new THREE.MeshBasicMaterial({color:cfflist[4], transparent: true, opacity: 0.9}),
                                    new THREE.MeshBasicMaterial({color:cfflist[5], transparent: true, opacity: 0.9}),
                                    ];
            for (let iiy = iiye-2; iiy >= iiys; --iiy) {
                let py = iiy * sy;
                let n = iiye-iiy;
                iizs = - Math.floor(n/2); iize = iizs + n;
                iixs = - Math.floor(n/2); iixe = iixs + n;
                let odd = n % 2;
                for (let iiz = iize-1; iiz >= iizs; --iiz) {
                    let pz = iiz * sz - odd*sz_;
                    for (let iix = iixs; iix < iixe; ++iix) {
                        let px = iix * sx - odd*sx_;
                        if (((iiy == iiyX) || (iiy == 0)) && (iix == 0) && (iiz == 0)) {
                            // 玄室?!（中心と最下層）に球を配置
                            let radius = 2.5;
                            const viWall2Mtr2 = new THREE.MeshNormalMaterial();
                            let [moBlock2Body, viBlock2Mesh] = createSphere(radius, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr2);
                            moBlock2Body.idx = idx;
                            id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                            ++idx;
                        } else {
                            const viWall2Mtr = viWall2MtrList[Math.floor(Math.random()*6)];
                            let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                        }
                    }
                }
            }
            iniZ += gridz * (iize+10);
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 1,    // 摩擦係数(def=0.3)
                restitution: 0.001, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e17,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = sx*(iixe-iixs+4), ssy = sy*(iiye-iiys+2), ssz = sz*(iize-iizs+4);
                let ppx = 0, ppy = ssy/2-sy, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = idx;
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_, ssx_, ssz_];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_hexprism_acc() {
            let r = 0.5, r_ = r/2, r2 = r*2;
            let radiusTop = r, radiusBottom = r, height = 6, numSegment = 6, mass = 1.0;
            let rSQ3 = r*Math.sqrt(3), rSQ3_ = rSQ3/2;
            let iixs = -6, iixe = 8;
            let iixslist = [-5,-6,-4,-6,-3,-6,-2,-6,-1,-6,0,-6];
            let iixelist = [ 7, 7, 6, 5, 5, 4, 4, 2, 3,-1,2,-3];
            let iiys = 0, iiye = 12;
            let iiy = 0, iiz = 0;
            let py = 0, pz = 0;
            let adjx = 0, adjy = 0, adjz = 0;
            let idx = 0;
            id2movi = {};
            let mass0 = 0;
            {
                iixs = iixslist.shift();
                iixe = iixelist.shift();
                let iiy = 0;
                let py = iiy * rSQ3;
                for (let iix = iixs; iix < iixe; ++iix) {
                    let px = iix * rSQ3;
                    const viWall2Mtr = new THREE.MeshNormalMaterial();
                    let [moBlock2Body, viBlock2Mesh] = createCylinder2(radiusTop, radiusBottom, height, numSegment, px, py, pz, adjx, adjy, adjz, mass0, moBlockMass0Mtr, viWall2Mtr)
                    moBlock2Body.idx = idx;
                    id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                    ++idx;
                }
            }
            for (let iiy = iiys+1; iiy < iiye; ++iiy) {
                iixs = iixslist.shift();
                iixe = iixelist.shift();
                let iiymod = iiy % 2;
                if (iiymod == 1) {
                    let py = iiy * r_*3;
                    let ppx = iiy * rSQ3_;
                    for (let iix = iixs; iix < iixe-1; ++iix) {
                        if (((iix-iixs)%2) == 0) {
                            continue;
                        }
                        let px = ppx + iix * rSQ3;
                        const viWall2Mtr = new THREE.MeshNormalMaterial({wireframe:true});
                        let [moBlock2Body, viBlock2Mesh] = createCylinder2(radiusTop, radiusBottom, height, numSegment, px, py, pz, adjx, adjy, adjz, mass0, moBlockMass0Mtr, viWall2Mtr)
                        moBlock2Body.idx = idx;
                        id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                        ++idx;
                    }
                    iixe = iixe-1;
                } else {
                    // iixe = iixe-1;
                    let py = iiy * r_*3;
                    let ppx = 0;
                    for (let iix = iixs; iix < iixe; ++iix) {
                        let px = ppx + iix * rSQ3;
                        const viWall2Mtr = new THREE.MeshNormalMaterial();
                        let [moBlock2Body, viBlock2Mesh] = createCylinder2(radiusTop, radiusBottom, height, numSegment, px, py, pz, adjx, adjy, adjz, mass0, moBlockMass0Mtr, viWall2Mtr)
                        moBlock2Body.idx = idx;
                        id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                        ++idx;
                    }
                }
            }
            // iniZ += 80;
            iniZ += 10;
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.3,    // 摩擦係数(def=0.3)
                restitution: 0.3, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = r*26, ssy = r+20, ssz = height+4;
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = 10;
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_+ppz, ssx_, ssz_+ppz];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }


        function createStage_table_easy() {
            let r = 0.5, r_ = r/2, mass = 10;
            let sx = 5.0, sy = 5.0, sz = 5.0;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let px = 0, py = 0, pz = 0;
            let adjx = 0, adjy = 0, adjz = 0;
            let idx = 0;
            id2movi = {};
            let viWall2Mtr = new THREE.MeshBasicMaterial({color:0x000000, transparent: true, opacity: 0.9});
            {
                // テーブル：あし
                sx = 10.0, sy = 5.0, sz = 1.0, py = sy/2;
                const pxz = [[0, -5], [-10, 5], [10, 5]];
                for (let [px,pz] of pxz) {
                    createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                }
                // テーブル：天板
                sx = 30.0, sy = 1.0, sz = 20.0;
                py = 0, py = 5.5, pz = 0;
                createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
            }
            {
                let radius = 2; py = 6+radius;
                const viWall2Mtr2 = new THREE.MeshNormalMaterial();
                let [moBlock2Body, viBlock2Mesh] = createSphere(radius, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr2);
                moBlock2Body.idx = idx;
                id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                ++idx;
            }
            r = 2, py = r/2, pz = 140, mass = 3;
            for (let px of [-10, -5, 0, 5, 10]) {
                const viWall2Mtr3 = new THREE.MeshBasicMaterial({color:0xc0c0c0});
                createBox(r, r, r, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr3);
            }
            iniZ += 210;
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.3,    // 摩擦係数(def=0.3)
                restitution: 0.3, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = 60, ssy = r+20, ssz = 30;
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = idx;
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_+ppz, ssx_, ssz_+ppz];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_9panel() {
            let sx = 10.0, sy = 10.0, sz = 5.0, mass = 0.1, mass0 = 0;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            let px = 0, py = 0, pz = 0;
            let ppx, ppy, ppz;
            let adjx = 0, adjy = 0, adjz = 0;
            let idx = 0;
            id2movi = {};
            let viWall2Mtr = new THREE.MeshBasicMaterial({color:0x000000, transparent: true, opacity: 0.9});
            // フレーム
            let tx = 0.2, ty = 0.2, tz = 6.0, txL = sx*3+tx*4, tyL = sy*3+ty*4;
            {
                // フレーム：縦
                py = (sy+ty)*1.5;
                for (let ix = 0; ix < 4; ++ix) {
                    px = ix *(sx+tx) - (sx+tx)*1.5;
                    createBox(tx, tyL, tz, px, py, pz, adjx, adjy, adjz, mass0, moBlockMass0Mtr, viWall2Mtr);
                }
                // フレーム：横
                px = 0;
                for (let iy = 0; iy < 4; ++iy) {
                    py = iy *(sy+ty) + ty/2;
                    createBox(txL, ty, tz, px, py, pz, adjx, adjy, adjz, mass0, moBlockMass0Mtr, viWall2Mtr);
                }
            }
            {
                // パネル
                for (let iy = 0; iy < 3; ++iy) {
                    py = iy *(sy+ty) + sy/2 + ty;
                    for (let ix = -1; ix < 2; ++ix) {
                        px = ix *(sx+tx);

                        const viWall2Mtr2 = new THREE.MeshNormalMaterial();
                        let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr2);
                        moBlock2Body.idx = idx;
                        id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                        ++idx;
                    }
                }
            }
            let r = 4; py = r/2, pz = 140, mass = 0.2;
            for (let px of [-10, -5, 0, 5, 10]) {
                const viWall2Mtr3 = new THREE.MeshBasicMaterial({color:0xc0c0c0});
                createBox(r, r, r, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr3);
            }
            iniZ += 210;
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.3,    // 摩擦係数(def=0.3)
                restitution: 0.3, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = 60, ssy = r+50, ssz = 30;
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = idx;
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_+ppz, ssx_, ssz_+ppz];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_course() {
            let sx = 20.0, sy = 2.0, sz = 20.0, mass = 0.1, mass0 = 0;
            let sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
            id2movi = {};
            let viWall2Mtr = new THREE.MeshBasicMaterial({color:0x000000, transparent: true, opacity: 0.9});
            let px = 0, py = sy_, pz = 0;
            let ppx, ppy, ppz;
            let adjx = 0, adjy = 0, adjz = 0;
            let idx = 0;
            id2movi = {};
            let pxzlist = [[0,0], [0,-100], [0,-200], [0,-300], [0,-350],
                           [50,-400], [150,-400], [250,-400],
                           [350,-400], [400,-350], [400,-250],
                           [400,-150], [400,-50], [400, 0], [400,100],
                           [400,200], [380,300], [350,400], [250,400],
                           [150,400], [  0,350], [-150,400], [-250,400],
                           [-350,350], [-400,250], [-400,150], [-400,50], [-350,-50],
                           [-300,-150], [-350,-350], [-250,-400],];
            for (let [px,pz] of pxzlist) {
                const viWall2Mtr2 = new THREE.MeshNormalMaterial();
                let [moBlock2Body, viBlock2Mesh] = createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr2);
                moBlock2Body.idx = idx;
                id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                ++idx;
            }
            iniZ += 100;
            const ground_block = new CANNON.ContactMaterial(moGroundMtr, moBlockMtr, {
                friction: 0.0001,    // 摩擦係数(def=0.3)
                restitution: 0.3, // 反発係数 (def=0.3)
                contactEquationStiffness: 1e7,  // 剛性(def=1e7)
            })
            world.addContactMaterial(ground_block);
            // 境界
            if (1) {
                let ssx = 900, ssy = 50, ssz = 900;
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                nBlock = idx;
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_+ppz, ssx_, ssz_+ppz];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        function createStage_maze() {
            // Maze2(通路と薄い壁の迷路) を使った迷路
            let mapnrow = 16, mapncol = 16;
            let mzdata = new Maze2.MazeData02(mapnrow, mapncol);
            let imapnrow_ = Math.floor(mapnrow/2);
            let imapncol_ = Math.floor(mapncol/2);
            mzdata.create(22); // 穴掘り法（改） 複数経路
            mzdata.setStartGoal([mapnrow-1, imapncol_], [imapnrow_,imapncol_]);
            mzdata.seekPath2();
            const blockSize = 20, blockSize_ = blockSize/2;
            const wallH = 2, wallT = 0.2, wallH_ = wallH/2, wallT_ = wallT/2;
            // 壁の向きに対する、壁のサイズ
            const swall = [[wallT, wallH, blockSize],
                           [blockSize, wallH, wallT],
                           [wallT, wallH, blockSize],
                           [blockSize, wallH, wallT],];
            // 壁の向きに対する位置補正
            const adjwall = [[blockSize_, 0, 0],
                             [0, 0, blockSize_],
                             [-blockSize_, 0, 0],
                             [0, 0, -blockSize_],];
            let ix, iy, iz;
            iy = 0;
            // let adjx = 0, adjy = 0, adjz = 0;
            let adjx = -mapncol/2*blockSize, adjy = 0, adjz = -mapnrow/2*blockSize;
            let mass0 = 0;
            let viWall2Mtr = new THREE.MeshBasicMaterial({color:0x000000, transparent: true, opacity: 0.9});
            for (let irow = 0; irow < mapnrow; ++irow) {
                iz = irow * blockSize;
                if (irow == 0) {
                    // 北側の壁
                    let idir = 3;
                    for (let icol = 0; icol < mapncol; ++icol) {
                        if (icol == imapnrow_) {
                            continue; // 上部に穴をあける
                        }
                        ix = icol * blockSize;
                        // 壁
                        const sx = swall[idir][0], sy = swall[idir][1], sz = swall[idir][2];
                        const px = ix + adjwall[idir][0], py = wallH_ + adjwall[idir][1], pz = iz + adjwall[idir][2];
                        createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass0, moBlockMass0Mtr, viWall2Mtr);
                    }
                }
                {
                    // 西側の壁
                    let idir = 2;
                    {
                        ix = 0;
                        // 壁
                        const sx = swall[idir][0], sy = swall[idir][1], sz = swall[idir][2];
                        const px = ix + adjwall[idir][0], py = wallH_ + adjwall[idir][1], pz = iz + adjwall[idir][2];
                        createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass0, moBlockMass0Mtr, viWall2Mtr);
                    }
                }
                for (let icol = 0; icol < mapncol; ++icol) {
                    ix = icol * blockSize;
                    for (let idir = 0; idir < 2; ++idir) { // 向き：(東、南)
                        if ((irow == mapnrow-1) && (icol == imapnrow_)) {
                            continue;  // 下部（入口）に穴をあける
                        }
                        if (mzdata.isWallPosiDir([irow, icol], idir)) {
                            // 壁
                            const sx = swall[idir][0], sy = swall[idir][1], sz = swall[idir][2];
                            const px = ix + adjwall[idir][0], py = wallH_ + adjwall[idir][1], pz = iz + adjwall[idir][2];
                            createBox(sx, sy, sz, px, py, pz, adjx, adjy, adjz, mass0, moBlockMass0Mtr, viWall2Mtr);
                        }
                    }
                    // 最短経路
                    const floorH = 0.01, floorH_ = floorH/2;
                    const sx = blockSize/2, sy = floorH, sz = blockSize/2;
                    const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                    const px = ix, py = floorH_, pz = iz;
                    let floorColor = "#404040";
                    let idx = mzdata.rc2idx(irow, icol);
                    if (mzdata.path2_.includes(idx)) {
                        floorColor = "#40c040";  // 最短経路上の床の色
                        const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                        const viWall2Mtr = new THREE.MeshBasicMaterial({color: floorColor});
                        const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                        scene.add(viWall2Mesh);
                        viWall2Mesh.position.copy(new CANNON.Vec3(px+adjx, py+adjy, pz+adjz)); // moWall2Body.position);
                    }
                }
            }
            let r = 2, mass = 5;
            let px = 0, py = r, pz = 0;
            adjx = 0, adjy = 0, adjz = 0;
            let idx = 0;
            id2movi = {};
            {
                // 中央に球を配置
                const viWall2Mtr = new THREE.MeshNormalMaterial();
                let [moBlock2Body, viBlock2Mesh] = createSphere(r, px, py, pz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
                moBlock2Body.idx = idx;
                id2movi[idx] = [moBlock2Body, viBlock2Mesh];
                ++idx;
            }
            nBlock = idx;
            iniZ += mapnrow/2*blockSize+40;
            // 境界
            if (1) {
                let ssx = mapncol*blockSize, ssy = 40, ssz = mapnrow*blockSize;
                let ppx = 0, ppy = ssy/2-1, ppz = 0;
                createBoundary(ssx,ssy,ssz, ppx,ppy,ppz, adjx,adjy,adjz, world,scene);
                let ssx_ = ssx/2, ssz_ = ssz/2;
                borderRng = [-ssx_, -ssz_+ppz, ssx_, ssz_+ppz];
                console.log("\n  nBlock=",nBlock, ", rng=",borderRng);
            }
        }

        const istage2func = {0 :createStage_cubeSmall_slippery, // 立方体（小粒）、やたら滑る床
                             1 :createStage_flatThin_slippery,  // ひし餅（極薄）、やたら滑る床
                             2 :createStage_flat_normal,   // ひし餅、滑らない床
                             3 :createStage_flat_slippery, // ひし餅、やたら滑る床
                             4 :createStage_cube_normal, // 立方体、デフォの床
                             5 :createStage_sphereHeavy_normal, // 球（激重）、デフォの床
                             6 :createStage_flatHeavy_slippery, // ひし餅（重）、やたら滑る床
                             7 :createStage_cubeHeavy_normal, // 立方体（重）、デフォの床
                             8 :createStage_sphereHeavy_swamp, // 球（激重）、沼の床
                             9 :createStage_billiards, // ビリヤード
                             10:createStage_bowling, // ボーリング
                             11:createStage_domino, // ドミノ倒し
                             12:createStage_sphere_high, // 高所
                             13:createStage_cube_tower, // 立方体、タワー（自壊）
                             14:createStage_rect_tower_jenga, // レンガ、タワー（ジェンガ積み）
                             15:createStage_rect_tower_renga, // レンガ、タワー（レンガ積み）
                             16:createStage_cube_pyramid, // 立方体、ピラミッド
                             // 17:createStage_hexprism_acc, // 六角柱、積み上げ
                             17:createStage_table_easy, // テーブル（簡易）
                             18:createStage_9panel, // ９パネル
                             19:createStage_course, // 高速コース
                             20:createStage_maze,   // 迷路
                             39:createStage_debug,  // テスト用
                             };
        if (istage in istage2func) {
            let func = istage2func[istage];
            func();
        }

        setLabelB("Rest: "+nBlock)

        return [world, camera, scene, renderer, orbitControls, vehicle, moBorder2Body];
    };

    [world, camera, scene, renderer, orbitControls, vehicle, moBorder2Body] = createWorld();
    resetVehiclePosi();

    // ----------------------------------------

    addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    });

    // ----------------------------------------

    //  let cameraPosi = 0;
    let cameraPosi = 0;

    var keyEvnt = {
        forwards:false,
        backwards:false,
        left:false,
        right:false,
        brake:false,
        sidebrake:false
    };

    const gamepad = new Gamepad();
    let ianime = 0;

    // eq9 の為に
    vehicle.id2movi_ = id2movi;
    vehicle.borderRng_ = borderRng;

    // Keybindings
    // Add force on keydown
    document.addEventListener('keydown', (event) => {
        // ゲームパッドの無効化
        gamepad.enable_ = false;

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

        case 'c':
            cameraPosi = (cameraPosi + 1) % 5;
            if (cameraPosi == 0) {
                camera.rotation.z = 0;
            } else if (cameraPosi == 1) {
                camera.rotation.z = 0;
            } else if (cameraPosi == 3) {
                // カスタムなの自動回転
                camera.rotation.z = 0;
                ianime = 0;
                // orbitControls.autoRotate = true;
            } else if (cameraPosi == 4) {
                let chassisBody = vehicle.getModel().chassisBody;
                let vposi = chassisBody.position;
                camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));
                orbitControls.target = new THREE.Vector3(vposi.x, vposi.y, vposi.z);
            }
            break;

        case 'r':
            // 車の姿勢を戻す／車をひっくり返す ..
            vehicle.keydown_resetPosture();
            break;

        case 'q':
            // ゲームパッドの有効化／キーボードからゲームパッドへフォーカスを移す
            gamepad.enable_ = true;
            console.log("gamepad", gamepad.enable_);
            break;

        case 'Enter':
            // 手動の境界判定
            judgeBorder();
            break;

        case '1':
        case '2':
            if (event.key == '1') {
                // --mapType;
                icarEQ = (icarEQ + ncarEQ-1) % ncarEQ;
            } else {
                icarEQ = (icarEQ + 1) % ncarEQ;
                // ++mapType;
            }
            {
                // eq9 の為に
                vehicle.id2movi_ = id2movi;
                vehicle.borderRng_ = borderRng;
                // //
                world.removeEventListener('endContact', eventEndContactBoundary);
                world.step(timeStep)
                // icarEQ = parseInt(event.key);
                vehicle.changeEq(icarEQ);
                world.addEventListener('endContact', eventEndContactBoundary);
            }
            break;

        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '0':
            {
                // eq9 の為に
                vehicle.id2movi_ = id2movi;
                vehicle.borderRng_ = borderRng;
                //
                world.removeEventListener('endContact', eventEndContactBoundary);
                world.step(timeStep)
                icarEQ = parseInt(event.key);
                if (event.key == '3') {
                    // icarEQ = 5; // ドリル
                } else if (event.key == '6') {
                    icarEQ = 7; // 放水車／／粒子を前方に射出
                } else if (event.key == '7') {
                    icarEQ = 8; // 追尾型螺旋ガン
                } else if (event.key == '8') {
                    icarEQ = 9; // 竜巻
                } else if (event.key == '9') {
                    icarEQ = 10; // メテオストライク
                }
                vehicle.changeEq(icarEQ);
                world.addEventListener('endContact', eventEndContactBoundary);
            }
            break;

        case 'z':
        case 'x':
            if (event.key == 'z') {
                // --mapType;
                istage = (istage+nstage-1) % nstage;
            } else {
                istage = (istage+1) % nstage;
                // ++mapType;
            }
            [world, camera, scene, renderer, orbitControls, vehicle, moBorder2Body] = createWorld();
            resetVehiclePosi();
            break;

        case ' ':
            vehicle.keydown_jump();
            break;
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
    function resetVehiclePosi() {
        vehicle.setPosition(iniX, iniY, iniZ, iniRotY);

        camera.position.set(iniX, iniY, iniZ+100);
        camera.lookAt(new THREE.Vector3(iniX, iniY, iniZ));
        orbitControls.target = new THREE.Vector3(iniX, iniY, iniZ);
    }

    function judgeBorder() {
        console.log("judgeBorder");
        let nBlock_ = 0;
        for (const id in id2movi) {
            const [moBlock2Body, viBlock2Mesh] = id2movi[id];
            let posi = moBlock2Body.position;
            if (posi.x < borderRng[0] || borderRng[2] < posi.x ||
                posi.z < borderRng[1] || borderRng[3] < posi.z) {
                moBlock2Body.isIN_ = false;
                viBlock2Mesh.material.wireframe = true;
            } else {
                ++nBlock_;
                moBlock2Body.isIN_ = true;
                viBlock2Mesh.material.wireframe = false;
            }
        }
        console.log("judgeBorder nBlock=",nBlock_);
        nBlock = nBlock_;
        setLabelB("Rest: "+nBlock)
        if (nBlock == 0) {
            console.log("\n .. stageClear()");
            stageClear();
        }
    }

    // ステージクリア
    function stageClear() {
        console.log("\nstageClear()");
        istage = (istage+1) % nstage;
        [world, camera, scene, renderer, orbitControls, vehicle, moBorder2Body] = createWorld();
        resetVehiclePosi();
    }


    var iroty = 0;
    let keyChangeCool = 0;

    function animate() {
        if (gamepad.enable_) {
            // ゲームパッド
            gamepad.update();

            // ステアリング関連
            if (gamepad.para_.stcLH != 0) {
                // ステック左：左：cross-Left
                // ステック左：右：cross-Right
                vehicle.keydown_ArrowRight2(gamepad.para_.stcLH);
            } else if (gamepad.para_.crsL) {
                // 十字左：cross-Left
                vehicle.keydown_ArrowLeft();
            } else if (gamepad.para_.crsR) {
                // 十字右：cross-Right
                vehicle.keydown_ArrowRight();
            } else {
                vehicle.keyup_ArrowLeft();
                // vehicle.keyup_ArrowRight();
            }
            // アクセル／バック関連
            if (gamepad.para_.stcRV > 0) {
                // ステック右：上
                vehicle.keydown_ArrowUp2(gamepad.para_.stcRV);
            } else if (gamepad.para_.btnA) {
                // 前進：button-A
                vehicle.keydown_ArrowUp();
            } else if (gamepad.para_.btnY) {
                // バック：button-Y
                vehicle.keydown_ArrowDown();
            } else {
                vehicle.keyup_ArrowUp();
            }
            // ブレーキ関連
            if (gamepad.para_.stcRV < 0) {
                // ステック右：下
                vehicle.keydown_brake2(-gamepad.para_.stcRV);
            } else if (gamepad.para_.btnB) {
                vehicle.keydown_brake();
            } else if (gamepad.para_.btnX) {
                vehicle.keydown_sidebrakeON();
            } else {
                vehicle.keyup_brake();
            }
            if (keyChangeCool > 0) {
                keyChangeCool += -1;
            } else {
                if (gamepad.para_.btnRB) {
                    keyChangeCool = 30;
                    cameraPosi = (cameraPosi + 1) % 5;
                }
                if (gamepad.para_.btnLB) {
                    keyChangeCool = 30;
                    cameraPosi = (cameraPosi + 4) % 5;
                }
                if (gamepad.para_.btnLT) {
                    keyChangeCool = 10;
                    judgeBorder();
                }
                if (gamepad.para_.btnRT) {
                    keyChangeCool = 10;
                    vehicle.keydown_resetPosture();
                }
                if (gamepad.para_.btnST) {
                    keyChangeCool = 10;
                    icarEQ = (icarEQ + 1) % ncarEQ;
                    world.removeEventListener('endContact', eventEndContactBoundary);
                    world.step(timeStep)
                    vehicle.changeBlade(icarEQ);
                    world.addEventListener('endContact', eventEndContactBoundary);
                }
                if (gamepad.para_.btnBK) {
                    keyChangeCool = 10;
                    icarEQ = (icarEQ + icarEQ-1) % ncarEQ;
                    world.removeEventListener('endContact', eventEndContactBoundary);
                    world.step(timeStep)
                    vehicle.changeBlade(icarEQ);
                    world.addEventListener('endContact', eventEndContactBoundary);
                }
            }

        } else {
            // key
            // 車関連(押しっぱなし／同時押しの key-event処理) ?
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
            } else if (keyEvnt.sidebrake) {
                vehicle.keydown_sidebrake();
            } else {
                vehicle.keyup_brake();
            }
        }

        world.step(timeStep)


        // 車関連
        vehicle.viewUpdate();

        // カメラ・視点 関連
        let chassisBody = vehicle.getModel().chassisBody;
        let vposi = chassisBody.position;
        let vquat = chassisBody.quaternion;

        if (cameraPosi == 0) {
            // 後背からビュー / 車の後方位置から正面に向けて
            let vv = vquat.vmult(new CANNON.Vec3(23, 5, 0));  // 後方、高さ、左右
            camera.position.set(vposi.x + vv.x, vposi.y + vv.y, vposi.z + vv.z);
            camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));
        } else if (cameraPosi == 1) {
            // フロントビュー（ドライバー視点) / 車の中心位置から正面に向けて
            camera.position.copy(new THREE.Vector3(vposi.x, vposi.y+2, vposi.z));
            let vv = vquat.vmult(new CANNON.Vec3(-20, 0, 0));  // 前方、高さ、左右
            camera.lookAt(new THREE.Vector3(vposi.x + vv.x, vposi.y + vv.y, vposi.z + vv.z));
        } else if (cameraPosi == 2) {
            // トップビュー 上空から / 車の前面が上に
            camera.position.set(vposi.x, vposi.y + 200, vposi.z);
            camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));
            let veuler = new CANNON.Vec3(0, 0, 0);
            vquat.toEuler(veuler);
            let viecleRotY = veuler.y + Math.PI / 2;  // X軸負の方向を向いて作成したので、上を向くよう90度ずらす
            camera.rotation.z = viecleRotY;

        } else if (cameraPosi == 3) {
            // カスタムなの自動回転
            let rad = ianime/1000*Math.PI;
            let vcos = Math.cos(rad), vsin = Math.sin(rad);
            const r = 90 + 10*vcos;
            camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));
            let cposi= new THREE.Vector3(vposi.x + r*vsin,
                                         vposi.y + 20*(vsin**2)+1,
                                         vposi.z + r*vcos)
            camera.position.copy(cposi);
            ++ianime;

        } else {
            // _cameraPosi == 4
            // マウス操作（マニュアル操作）
            orbitControls.update();
        }

        {
            let speed = vehicle.getSpeed();
            speed = parseInt(speed*10)/10.0;
            setLabelA("speed: "+speed);
        }

        renderer.render(scene, camera)
        requestAnimationFrame(animate)
    }

    animate();
};

function setLabelA(text) {
    const canvas = document.getElementById('canvas2d');
    const ctxspd = canvas.getContext('2d');
    canvas.width = 150; // window.innerWidth;
    canvas.height = 40; // window.innerHeight;
    ctxspd.font = '20px bold sans-serif';
    ctxspd.textBaseline = 'alphabetic';
    ctxspd.textAlign = 'start';
    ctxspd.fillStyle = 'white';
    ctxspd.fillText(text, 20, 22);
};

function setLabelB(text) {
    const canvas = document.getElementById('canvas2d2');
    const ctxspd = canvas.getContext('2d');
    canvas.width = 150; // window.innerWidth;
    canvas.height = 40; // window.innerHeight;
    ctxspd.font = '20px bold sans-serif';
    ctxspd.textBaseline = 'alphabetic';
    ctxspd.textAlign = 'start';
    ctxspd.fillStyle = 'white';
    ctxspd.fillText(text, 20, 22);
};

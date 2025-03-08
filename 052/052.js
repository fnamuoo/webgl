// mode:javascript

// 迷路データを使った例

import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "orbitcontrols";
import { Gamepad } from "Gamepad";
import * as Maze1 from "Maze1";
import * as Maze1data from "Maze1data";
import * as Maze2 from "Maze2";
import * as Maze2data from "Maze2data";
import * as Maze3 from "Maze3";

const timeStep = 1 / 45;
let iniX = 0, iniY = 20, iniZ = 0, iniRotY = 0; //1.25

// 1: Maze1(通路・壁が同じ大きさの迷路) を使った迷路
// 2: Maze1(通路・壁が同じ大きさの迷路) を使った迷路
// 3: Maze2(通路と薄い壁の迷路) を使った迷路
// 4: Maze2(通路と薄い壁の迷路) を使った迷路
// 5: Maze2(通路と薄い壁の迷路) を使った迷路 ＋ Maze3の経路
let mapType = 3;
let nmapType = 5;

let holeRate = 0;
let map1mapdivIni = 9;
let map1mapdiv = 9;
let map2mapdivIni = 9;
let map2mapdiv = 9;
let map3mapdivIni = 8;
let map3mapdiv = 8;
let map4mapdivIni = 8;
let map4mapdiv = 8;
let map5mapdivIni = 8;
let map5mapdiv = 8;

function initMapPara() {
    holeRate = 0;
    map1mapdiv = map1mapdivIni;
    map2mapdiv = map2mapdivIni;
    map3mapdiv = map3mapdivIni;
    map4mapdiv = map4mapdivIni;
    map5mapdiv = map5mapdivIni;
}

function incrMapPara() {
    holeRate += 0.2;
    if (holeRate > 0.5) {
        holeRate = 0.5;
    }
    map1mapdiv += 2;
    map2mapdiv += 2;
    map3mapdiv += 2;
    map4mapdiv += 2;
    map5mapdiv += 2;
}


function setupWorld() {
    const world = new CANNON.World()
    world.gravity.set(0, -20, 0)
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

window.onload = () => {
    let world, camera, scene, renderer, orbitControls, moCntnrBody;

    function createWorld() {
        iniX = 0, iniY = 0, iniZ = 0;
        const {world, camera, scene, renderer, orbitControls} = setupWorld();
        const moGroundMtr = new CANNON.Material({name: 'ground'})

        const moMazeMtr = new CANNON.Material({name: 'maze'});
        const moCntnrBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, 0, 0),
            material: moMazeMtr,
        });
        const viCntnrMesh = new THREE.Group();

        const moMaze_moMaze = new CANNON.ContactMaterial(moMazeMtr, moMazeMtr, {
            friction: 0.01,  // 摩擦係数(def=0.3)
            restitution: 0.3,  // 反発係数 (def=0.3)
            contactEquationStiffness: 1e7,  // 剛性(def=1e7)
        })
        world.addContactMaterial(moMaze_moMaze)

        // ----------------------------------------
        // コース
console.log("mapType=",mapType);
        if ((mapType == 1) || (mapType == 2)) {
            // Maze1(通路・壁が同じ大きさの迷路) を使った迷路
            let mapnrow, mapncol, mzdata;
            if (mapType == 1) {
                mapnrow = map1mapdiv; mapncol = map1mapdiv;
                mzdata = new Maze1.MazeData01(mapnrow, mapncol);
                mzdata.create(11); // 棒倒し法 複数経路
            } else if (mapType == 2) {
                mapnrow = map1mapdiv; mapncol = map1mapdiv;
                mzdata = new Maze1.MazeData01(mapnrow, mapncol);
                mzdata.create(22); // 穴掘り法（改） 複数経路
            }
            // mzdata.create(20); // 穴掘り法
            // mzdata.create(21); // 穴掘り法
            // mzdata.create(30); // 壁のばし
            // mzdata.create(31); // 壁のばし
            mzdata.dbgPrintMap();
            mzdata.seekPath2(); // 最短経路をもとめる
            mapnrow = mzdata.nrow_, mapncol = mzdata.ncol_;
            console.log("size=",[mapnrow,mapncol]);
            const blockSize = 10, blockSize_ = blockSize/2;
            const floorH = 1, wallH = blockSize;
            const floorH_=floorH/2, wallH_ = wallH/2;
            let adjx = -mapncol/2*blockSize, adjy = 0, adjz = -mapnrow/2*blockSize;
            let ix, iy, iz;
            iy = 0;
            for (let irow = 0; irow < mapnrow; ++irow) {
                iz = irow * blockSize;
                for (let icol = 0; icol < mapncol; ++icol) {
                    ix = icol * blockSize;
                    if (mzdata.isWall(irow, icol)) {
                        // 壁
                        const sx = blockSize, sy = wallH, sz = blockSize;
                        const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                        const px = ix, py = wallH_, pz = iz;
                        {
                            moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                                 new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                            const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                            const viWall2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9});
                            const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                            viWall2Mesh.position.copy(new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                            viCntnrMesh.add(viWall2Mesh);
                        }
                    } else {
                        // 床
                        const sx = blockSize, sy = floorH, sz = blockSize;
                        const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                        const px = ix, py = floorH_, pz = iz;
                        let floorColor = "#404040";
                        let idx = mzdata.rc2idx(irow, icol);
                        if (mzdata.path2_.includes(idx)) {
                            floorColor = "#40c040";  // 最短経路上の床の色
                        } else if (Math.random() < holeRate) {
                            continue; // 穴にする
                        }
                        {
                            moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                                 new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                            const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                            const viWall2Mtr = new THREE.MeshBasicMaterial({color: floorColor});
                            const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                            viWall2Mesh.position.copy(new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                            viCntnrMesh.add(viWall2Mesh);
                        }
                    }
                }
            }
            // 透明な板を上からかぶせる
            {
                const sx = blockSize*mapncol, sy = wallH, sz = blockSize*mapnrow;
                const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                const px = sx_, py = wallH+wallH_, pz = sz_;
                moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                     new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
            }
            // スタート地点にボールを追加
            {
                let sp = mzdata.pStart_;
                const px = sp[1]*blockSize+adjx, py = blockSize_+adjy, pz = sp[0]*blockSize+adjz;
                let radius = 3;
                const moBallBody = new CANNON.Body
                ({mass: 1,
                  shape: new CANNON.Sphere(radius),
                  position: new CANNON.Vec3(px, py, pz),
                  material: moMazeMtr,
                  angularDamping: 0.001,  // def: 0.01
                  linearDamping: 0.001,  // def: 0.01
                });
                world.addBody(moBallBody);
                moBallBody.isActor = true;
                const viBallGeo = new THREE.SphereGeometry(radius);
                const viBallMtr = new THREE.MeshBasicMaterial({color:"#0000ff"});
                const viBallMesh = new THREE.Mesh(viBallGeo, viBallMtr);
                viBallMesh.position.copy(moBallBody.position);
                scene.add(viBallMesh);
                // 描画を自動で更新させるために postStepにイベント追加
                world.addEventListener('postStep', () => {
                    viBallMesh.position.copy(moBallBody.position);
                    viBallMesh.quaternion.copy(moBallBody.quaternion);
                })
            }
            // ゴール地点にボールを追加
            {
                // let sp = mzdata.pGoal_;
                let sp = mzdata.pGoalList_[0];
                const px = sp[1]*blockSize+adjx, py = blockSize_+adjy, pz = sp[0]*blockSize+adjz;
                let radius = 3;
                const moBallBody = new CANNON.Body
                ({mass: 1,
                    shape: new CANNON.Sphere(radius),
                    position: new CANNON.Vec3(px, py, pz),
                    material: moMazeMtr,
                });
                world.addBody(moBallBody);
                const viBallGeo = new THREE.SphereGeometry(radius);
                const viBallMtr = new THREE.MeshNormalMaterial();
                const viBallMesh = new THREE.Mesh(viBallGeo, viBallMtr);
                viBallMesh.position.copy(moBallBody.position);
                scene.add(viBallMesh);
                // 制約でゴールをボードに固定させる
                const moObj1Const = new CANNON.LockConstraint(moCntnrBody, moBallBody);
                moCntnrBody.pivotA = new CANNON.Vec3(px, py, pz);
                moBallBody.pivotB = new CANNON.Vec3(0, 0, 0);
                world.addConstraint(moObj1Const);
                // 描画を自動で更新させるために postStepにイベント追加
                world.addEventListener('postStep', () => {
                    viBallMesh.position.copy(moBallBody.position);
                    viBallMesh.quaternion.copy(moBallBody.quaternion);
                })
                moBallBody.addEventListener("collide", function(e) {
                    let moI = e.contact.bi;
                    let moJ = e.contact.bj;
                    // if ((moI.isVehicle != undefined) || (moJ.isVehicle != undefined)) {
                    if ((moI.isActor != undefined) || (moJ.isActor != undefined)) {
                        reachToGoal();
                    }
                });
            }
        }

        // !!!!
        if ((mapType == 3) || (mapType == 4)) {
            // Maze2(通路と薄い壁の迷路) を使った迷路
            function createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz, moCntnrBody, viCntnrMesh) {
                const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                     new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                const viWall2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9});
                const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                viWall2Mesh.position.copy(new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                viCntnrMesh.add(viWall2Mesh);
            }
            // let mapnrow = 8, mapncol = 8;
            let mapnrow, mapncol, mzdata;
            if (mapType == 3) {
                mapnrow = map3mapdiv; mapncol = map3mapdiv;
                mzdata = new Maze2.MazeData02(mapnrow, mapncol);
                mzdata.create(11); // 棒倒し法 複数経路
            } else if (mapType == 4) {
                mapnrow = map4mapdiv; mapncol = map4mapdiv;
                mzdata = new Maze2.MazeData02(mapnrow, mapncol);
                mzdata.create(22); // 穴掘り法（改） 複数経路
            }
            // mzdata.create(11); // 棒倒し法 複数経路
            // mzdata.create(20); // 穴掘り法
            // mzdata.create(21); // 穴掘り法
            // mzdata.create(30); // 壁のばし
            // mzdata.create(31); // 壁のばし
            mzdata.dbgPrintMap();
            mzdata.seekPath2(); // 最短経路をもとめる
            mapnrow = mzdata.nrow_, mapncol = mzdata.ncol_;
            const blockSize = 10, blockSize_ = blockSize/2;
            const floorH = 1, wallH = blockSize, wallT = 0.2;
            const floorH_=floorH/2, wallH_ = wallH/2, wallT_ = wallT/2;
            let adjx = -mapncol/2*blockSize, adjy = 0, adjz = -mapnrow/2*blockSize;
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
            for (let irow = 0; irow < mapnrow; ++irow) {
                iz = irow * blockSize;
                if (irow == 0) {
                    // 北側の壁
                    let idir = 3;
                    for (let icol = 0; icol < mapncol; ++icol) {
                        ix = icol * blockSize;
                        // 壁
                        const sx = swall[idir][0], sy = swall[idir][1], sz = swall[idir][2];
                        const px = ix + adjwall[idir][0], py = wallH_ + adjwall[idir][1], pz = iz + adjwall[idir][2];
                        createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz, moCntnrBody, viCntnrMesh);
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
                        createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz, moCntnrBody, viCntnrMesh);
                    }
                }
                for (let icol = 0; icol < mapncol; ++icol) {
                    ix = icol * blockSize;
                    for (let idir = 0; idir < 2; ++idir) { // 向き：(東、南)
                        if (mzdata.isWallPosiDir([irow, icol], idir)) {
                            // 壁
                            const sx = swall[idir][0], sy = swall[idir][1], sz = swall[idir][2];
                            const px = ix + adjwall[idir][0], py = wallH_ + adjwall[idir][1], pz = iz + adjwall[idir][2];
                            createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz, moCntnrBody, viCntnrMesh);
                        }
                    }
                    {
                        // 床
                        const sx = blockSize, sy = floorH, sz = blockSize;
                        const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                        const px = ix, py = floorH_, pz = iz;
                        let floorColor = "#404040";
                        let idx = mzdata.rc2idx(irow, icol);
                        if (mzdata.path2_.includes(idx)) {
                            floorColor = "#40c040";  // 最短経路上の床の色
                        } else if (Math.random() < holeRate) {
                            continue; // 穴にする
                        }
                        {
                            moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                                 new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                            const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                            const viWall2Mtr = new THREE.MeshBasicMaterial({color: floorColor});
                            const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                            viWall2Mesh.position.copy(new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                            viCntnrMesh.add(viWall2Mesh);
                        }
                    }
                }
            }
            // 透明な板を上からかぶせる
            {
                const sx = blockSize*mapncol, sy = wallH*2, sz = blockSize*mapnrow;
                const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                const px = sx_, py = wallH+sy_, pz = sz_;
                moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                     new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
            }
            // スタート地点にボールを追加
            {
                let sp = mzdata.pStart_;
                const px = sp[1]*blockSize+adjx, py = blockSize_+adjy, pz = sp[0]*blockSize+adjz;
                let radius = 3;
                const moBallBody = new CANNON.Body
                ({mass: 1,
                    shape: new CANNON.Sphere(radius),
                    position: new CANNON.Vec3(px, py, pz),
                    material: moMazeMtr,
                });
                world.addBody(moBallBody);
                moBallBody.isActor = true;
                const viBallGeo = new THREE.SphereGeometry(radius);
                const viBallMtr = new THREE.MeshBasicMaterial({color:"#0000ff"});
                const viBallMesh = new THREE.Mesh(viBallGeo, viBallMtr);
                viBallMesh.position.copy(moBallBody.position);
                scene.add(viBallMesh);
                // 描画を自動で更新させるために postStepにイベント追加
                world.addEventListener('postStep', () => {
                    viBallMesh.position.copy(moBallBody.position);
                    viBallMesh.quaternion.copy(moBallBody.quaternion);
                })
            }
            // ゴール地点にボールを追加
            {
                let sp = mzdata.pGoalList_[0];
                const px = sp[1]*blockSize+adjx, py = blockSize_+adjy, pz = sp[0]*blockSize+adjz;
                let radius = 3;
                const moBallBody = new CANNON.Body
                ({mass: 1,
                    shape: new CANNON.Sphere(radius),
                    position: new CANNON.Vec3(px, py, pz),
                    material: moMazeMtr,
                });
                world.addBody(moBallBody);
                const viBallGeo = new THREE.SphereGeometry(radius);
                const viBallMtr = new THREE.MeshNormalMaterial();
                const viBallMesh = new THREE.Mesh(viBallGeo, viBallMtr);
                viBallMesh.position.copy(moBallBody.position);
                scene.add(viBallMesh);
                // 制約でゴールをボードに固定させる
                const moObj1Const = new CANNON.LockConstraint(moCntnrBody, moBallBody);
                moCntnrBody.pivotA = new CANNON.Vec3(px, py, pz);
                moBallBody.pivotB = new CANNON.Vec3(0, 0, 0);
                world.addConstraint(moObj1Const);
                // 描画を自動で更新させるために postStepにイベント追加
                world.addEventListener('postStep', () => {
                    viBallMesh.position.copy(moBallBody.position);
                    viBallMesh.quaternion.copy(moBallBody.quaternion);
                })
                moBallBody.addEventListener("collide", function(e) {
                    let moI = e.contact.bi;
                    let moJ = e.contact.bj;
                    // if ((moI.isVehicle != undefined) || (moJ.isVehicle != undefined)) {
                    if ((moI.isActor != undefined) || (moJ.isActor != undefined)) {
                        reachToGoal();
                    }
                });
            }
        }

        // !!!!
        if (mapType == 5) {
            // Maze2(通路と薄い壁の迷路) を使った迷路 ＋ Maze3の経路
            function createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz, moCntnrBody, viCntnrMesh) {
                const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                     new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                const viWall2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9});
                const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                viWall2Mesh.position.copy(new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                viCntnrMesh.add(viWall2Mesh);
            }
            let mapnrow = map5mapdiv, mapncol = map5mapdiv;
            let mzdata = new Maze2.MazeData02(mapnrow, mapncol);
            // mzdata.create(11); // 棒倒し法 複数経路
            // mzdata.create(20); // 穴掘り法
            // mzdata.create(21); // 穴掘り法 複数経路
            mzdata.create(22); // 穴掘り法（改） 複数経路  中庸
            // mzdata.create(23); // 穴掘り法（改） 複数経路 ななめ多め
            // mzdata.create(24); // 穴掘り法（改） 複数経路 直線多め
            // mzdata.create(30); // 壁のばし
            // mzdata.create(31); // 壁のばし 複数経路
            mzdata.resetStartGoal(); // スタート・ゴールを最遠方に再配置
            mzdata.dbgPrintMap();
            mzdata.seekPath2(); // 最短経路をもとめる
            let mzdata3 = new Maze3.MazeData03();
            mzdata3.create_from_maze2(mzdata);
            mzdata3.seekPath7();  // 斜めあり
            mapnrow = mzdata.nrow_, mapncol = mzdata.ncol_;
            // const moMazeMtr = new CANNON.Material({name: 'maze'});
            const blockSize = 10, blockSize_ = blockSize/2;
            const floorH = 1, wallH = blockSize, wallT = 0.2;
            const floorH_=floorH/2, wallH_ = wallH/2, wallT_ = wallT/2;
            let adjx = -mapncol/2*blockSize, adjy = 0, adjz = -mapnrow/2*blockSize;
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
            for (let irow = 0; irow < mapnrow; ++irow) {
                iz = irow * blockSize;
                if (irow == 0) {
                    // 北側の壁
                    let idir = 3;
                    for (let icol = 0; icol < mapncol; ++icol) {
                        ix = icol * blockSize;
                        // 壁
                        const sx = swall[idir][0], sy = swall[idir][1], sz = swall[idir][2];
                        const px = ix + adjwall[idir][0], py = wallH_ + adjwall[idir][1], pz = iz + adjwall[idir][2];
                        createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz, moCntnrBody, viCntnrMesh);
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
                        createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz, moCntnrBody, viCntnrMesh);
                    }
                }
                for (let icol = 0; icol < mapncol; ++icol) {
                    ix = icol * blockSize;
                    for (let idir = 0; idir < 2; ++idir) { // 向き：(東、南)
                        if (mzdata.isWallPosiDir([irow, icol], idir)) {
                            // 壁
                            const sx = swall[idir][0], sy = swall[idir][1], sz = swall[idir][2];
                            const px = ix + adjwall[idir][0], py = wallH_ + adjwall[idir][1], pz = iz + adjwall[idir][2];
                            createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz, moCntnrBody, viCntnrMesh);
                        }
                    }
                    let isShortPath = false;
                    {
                        // 斜め経路の表示
                        let irow2 = irow*2;
                        let icol2 = icol*2;
                        for (let iirow = 0; iirow < 2; ++iirow) {
                            let jrow = irow2 + iirow;
                            for (let iicol = 0; iicol < 2; ++iicol) {
                                let jcol = icol2 + iicol;
                                let idx = mzdata3.rc2idx(jrow, jcol);
                                if (!mzdata3.path7_.includes(idx)) {
                                    continue;
                                }
                                isShortPath = true;
                                // 床
                                const sx = blockSize_/2, sy = 0.01, sz = blockSize_/2;
                                const px = (jcol-1) * blockSize_, py = floorH, pz = (jrow-1) * blockSize_;
                                let floorColor = "#c0c040";
                                const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                                const viWall2Mtr = new THREE.MeshBasicMaterial({color: floorColor});
                                const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                                viWall2Mesh.position.copy(new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                                viCntnrMesh.add(viWall2Mesh);
                            }
                        }
                    }
                    {
                        // 床
                        const sx = blockSize, sy = floorH, sz = blockSize;
                        const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                        const px = ix, py = floorH_, pz = iz;
                        let floorColor = "#404040";
                        let idx = mzdata.rc2idx(irow, icol);
                        if (mzdata.path2_.includes(idx)) {
                            floorColor = "#40c040";  // 最短経路上の床の色
                        } else if ((isShortPath == false) && (Math.random() < holeRate)) {
                            continue; // 穴にする
                        }
                        {
                            moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                                 new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                            const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                            const viWall2Mtr = new THREE.MeshBasicMaterial({color: floorColor});
                            const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                            viWall2Mesh.position.copy(new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                            viCntnrMesh.add(viWall2Mesh);
                        }
                    }
                }
            }
            // 透明な板を上からかぶせる
            {
                const sx = blockSize*mapncol, sy = wallH*2, sz = blockSize*mapnrow;
                const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                const px = sx_, py = wallH+sy_, pz = sz_;
                moCntnrBody.addShape(new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                     new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
            }
            // スタート地点にボールを追加
            {
                let sp = mzdata.pStart_;
                const px = sp[1]*blockSize+adjx, py = blockSize_+adjy, pz = sp[0]*blockSize+adjz;
                let radius = 3;
                const moBallBody = new CANNON.Body
                ({mass: 1,
                    shape: new CANNON.Sphere(radius),
                    position: new CANNON.Vec3(px, py, pz),
                    material: moMazeMtr,
                });
                world.addBody(moBallBody);
                moBallBody.isActor = true;
                const viBallGeo = new THREE.SphereGeometry(radius);
                const viBallMtr = new THREE.MeshBasicMaterial({color:"#0000ff"});
                const viBallMesh = new THREE.Mesh(viBallGeo, viBallMtr);
                viBallMesh.position.copy(moBallBody.position);
                scene.add(viBallMesh);
                // 描画を自動で更新させるために postStepにイベント追加
                world.addEventListener('postStep', () => {
                    viBallMesh.position.copy(moBallBody.position);
                    viBallMesh.quaternion.copy(moBallBody.quaternion);
                })
            }
            // ゴール地点にボールを追加
            for (let i = 0; i < mzdata.pGoalList_.length; ++i) {
                let sp = mzdata.pGoalList_[i];
                const px = sp[1]*blockSize+adjx, py = blockSize_+adjy, pz = sp[0]*blockSize+adjz;
                let radius = 3;
                const moBallBody = new CANNON.Body
                ({mass: 1,
                    shape: new CANNON.Sphere(radius),
                    position: new CANNON.Vec3(px, py, pz),
                    material: moMazeMtr,
                });
                world.addBody(moBallBody);
                const viBallGeo = new THREE.SphereGeometry(radius);
                const viBallMtr = new THREE.MeshNormalMaterial();
                const viBallMesh = new THREE.Mesh(viBallGeo, viBallMtr);
                viBallMesh.position.copy(moBallBody.position);
                scene.add(viBallMesh);
                // 制約でゴールをボードに固定させる
                const moObj1Const = new CANNON.LockConstraint(moCntnrBody, moBallBody);
                moCntnrBody.pivotA = new CANNON.Vec3(px, py, pz);
                moBallBody.pivotB = new CANNON.Vec3(0, 0, 0);
                world.addConstraint(moObj1Const);
                // 描画を自動で更新させるために postStepにイベント追加
                world.addEventListener('postStep', () => {
                    viBallMesh.position.copy(moBallBody.position);
                    viBallMesh.quaternion.copy(moBallBody.quaternion);
                })
                moBallBody.addEventListener("collide", function(e) {
                    let moI = e.contact.bi;
                    let moJ = e.contact.bj;
                    // if ((moI.isVehicle != undefined) || (moJ.isVehicle != undefined)) {
                    if ((moI.isActor != undefined) || (moJ.isActor != undefined)) {
                        reachToGoal();
                    }
                });
            }
        }


        world.addEventListener('postStep', () => {
            viCntnrMesh.position.copy(moCntnrBody.position);
            viCntnrMesh.quaternion.copy(moCntnrBody.quaternion);
        })

        world.addBody(moCntnrBody);
        scene.add(viCntnrMesh);

        return [world, camera, scene, renderer, orbitControls, moCntnrBody];
    };

    [world, camera, scene, renderer, orbitControls, moCntnrBody] = createWorld();
    resetCameraPosi();

    // ----------------------------------------
    addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    });

    // ----------------------------------------

    let cameraPosi = 0;

    let keyEvnt = {
        forwards:false,
        backwards:false,
        left:false,
        right:false,
        brake:false,
        sidebrake:false
    };

    const gamepad = new Gamepad();
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
            break;
        case 'q':
            // ゲームパッドの有効化／キーボードからゲームパッドへフォーカスを移す
            gamepad.enable_ = true;
            console.log("gamepad", gamepad.enable_);
            break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
            // マップの切り替え
            mapType = parseInt(event.key);
            initMapPara();
            [world, camera, scene, renderer, orbitControls, moCntnrBody] = createWorld();
            resetCameraPosi();
            break;
        case '0':
            initMapPara();
            [world, camera, scene, renderer, orbitControls, moCntnrBody] = createWorld();
            resetCameraPosi();
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


    // // 初期位置
    function resetCameraPosi() {
        camera.position.set(iniX, iniY+400, iniZ);
        camera.lookAt(new THREE.Vector3(iniX, iniY, iniZ));
        orbitControls.target = new THREE.Vector3(iniX, iniY, iniZ);
    }

    // ゴールにたどり着く
    function reachToGoal() {
        incrMapPara();
        [world, camera, scene, renderer, orbitControls, moCntnrBody] = createWorld();
        resetCameraPosi();
    }


    let iroty = 0;
    let keyChangeCool = 0;

    function animate() {
        if (gamepad.enable_) {
            // ゲームパッド .. の操作は今はスキップ
            gamepad.update();

        } else {
            // key
            let vquat = moCntnrBody.quaternion;
            const radStep = 0.002;
            if (keyEvnt.forwards) {
                var quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -radStep);
                vquat = vquat.mult(quat);
                moCntnrBody.quaternion.copy(vquat);
            } else if (keyEvnt.backwards) {
                var quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), radStep);
                vquat = vquat.mult(quat);
                moCntnrBody.quaternion.copy(vquat);
            }

            if (keyEvnt.left) {
                var quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), radStep);
                vquat = vquat.mult(quat);
                moCntnrBody.quaternion.copy(vquat);
            } else if (keyEvnt.right) {
                var quat = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -radStep);
                vquat = vquat.mult(quat);
                moCntnrBody.quaternion.copy(vquat);
            }
        }

        world.step(timeStep)

        {
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

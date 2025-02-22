// mode:javascript

// 迷路データを使った例

import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "orbitcontrols";
import * as vb from "VehicleBase";
import { Gamepad } from "Gamepad";
import * as Maze1 from "Maze1";
import * as Maze2 from "Maze2";
import * as Maze2data from "Maze2data";
import * as Maze3 from "Maze3";

const timeStep = 1 / 45;
let iniX = 0, iniY = 20, iniZ = 0, iniRotY = 1.25

// 1: Maze1(通路・壁が同じ大きさの迷路) を使った迷路
// 2: Maze2(通路と薄い壁の迷路) を使った迷路
// 3: Maze2(通路と薄い壁の迷路) を使った迷路 ＋ Maze3の経路
// 4: Maze1(通路・壁が同じ大きさの迷路) を使って highfield で表現
// 5: Maze1(通路・壁が同じ大きさの迷路) を使って highfield で表現（山と谷を逆転）：キャットウォーク
// 6: Maze2(通路と薄い壁の迷路) を使った迷路 ＋ Maze3の経路＋マイクロマウスのマップ
let mapType = 5;

let map1mapdivIni = 9;
let map1mapdiv = 9;
let map2mapdivIni = 8;
let map2mapdiv = 8;
let map3mapdivIni = 8;
let map3mapdiv = 8;
let map4mapdivIni = 9;
let map4mapdiv = 9;
let map5mapdivIni = 9;
let map5mapdiv = 9;
let map5highBiasIni = 2;
let map5highAmpIni = 1;
let map5highBias = 2;
let map5highAmp = 1;
let map5highAmpMax = 12;
let map6imap = 0;
let map6imap2name = ['sdatamm2018classic',
                     'sdatamm2015final',
                     'sdatamm2016final',
                     'sdatamm2017final',
                     'sdatamm2018final',
                     'sdatamm2019final',
                     'sdatamm2023semifinal',
                     'sdatamm2023final',
                    ];

function initMapPara() {
    map1mapdiv = map1mapdivIni;
    map2mapdiv = map2mapdivIni;
    map3mapdiv = map3mapdivIni;
    map4mapdiv = map4mapdivIni;
    map5mapdiv = map5mapdivIni;
    map5highBias = map5highBiasIni;
    map5highAmp = map5highAmpIni;
    map6imap = 0;
}

function incrMapPara() {
    map1mapdiv += 4;
    map2mapdiv += 4;
    map3mapdiv += 4;
    map4mapdiv += 4;
    map5mapdiv += 4;
    map5highBias += 5;
    if (map5highAmp < map5highAmpMax) {
        map5highAmp += 1;
    }
    map6imap = (map6imap+1) % map6imap2name.length;
}


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
        orbitControls.enablePan = true
        orbitControls.dampingFactor = 0.2
        orbitControls.minDistance = 10
        orbitControls.maxDistance = 5000
    }
    return {world, camera, scene, renderer, orbitControls};
}

var ivehicle = 0;

window.onload = () => {
    var world, camera, scene, renderer, orbitControls, vehicle;

    function createWorld() {
        iniX = 0, iniY = 20, iniZ = 0;
        const {world, camera, scene, renderer, orbitControls} = setupWorld();
        const moGroundMtr = new CANNON.Material({name: 'ground'})

        let vehicle = new vb.VehicleFR01(scene, world, moGroundMtr);
        vehicle.init();
        vehicle.moChassisBody_.isVehicle = true;
        for (let i = 0; i < 3; ++i) {
            world.step(1/60)
            vehicle.setPosition(iniX, iniY, iniZ, iniRotY);
            vehicle.viewUpdate();
        }

        // ----------------------------------------
        // コース

        if (mapType == 1) {
            // Maze1(通路・壁が同じ大きさの迷路) を使った迷路
            let mapnrow = map1mapdiv, mapncol = map1mapdiv;
            let mzdata = new Maze1.MazeData01(mapnrow, mapncol);
            // mzdata.create(11); // 棒倒し法 複数経路
            // mzdata.create(20); // 穴掘り法
            mzdata.create(21); // 穴掘り法
            // mzdata.create(22); // 穴掘り法（改） 複数経路
            // mzdata.create(30); // 壁のばし
            // mzdata.create(31); // 壁のばし
            mzdata.dbgPrintMap();
            mzdata.seekPath2(); // 最短経路をもとめる
            mapnrow = mzdata.nrow_, mapncol = mzdata.ncol_;
            console.log("size=",[mapnrow,mapncol]);
            const moMazeMtr = new CANNON.Material({name: 'maze'});
            const blockSize = 10, blockSize_ = blockSize/2;
            const floorH = 1, wallH = blockSize_;
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
                            const moWall2Body = new CANNON.Body
                            ({mass: 0,
                                shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                position: new CANNON.Vec3(px+adjx, py+adjy, pz+adjz),
                                material: moMazeMtr,
                            });
                            world.addBody(moWall2Body);
                            const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                            const viWall2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9});
                            const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                            scene.add(viWall2Mesh);
                            viWall2Mesh.position.copy(moWall2Body.position);
                            viWall2Mesh.quaternion.copy(moWall2Body.quaternion);
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
                        }
                        {
                            const moWall2Body = new CANNON.Body
                            ({mass: 0,
                                shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                position: new CANNON.Vec3(px+adjx, py+adjy, pz+adjz),
                                material: moMazeMtr,
                            });
                            world.addBody(moWall2Body);
                            const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                            const viWall2Mtr = new THREE.MeshBasicMaterial({color: floorColor});
                            const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                            scene.add(viWall2Mesh);
                            viWall2Mesh.position.copy(moWall2Body.position);
                            viWall2Mesh.quaternion.copy(moWall2Body.quaternion);
                        }
                    }
                }
            }
            // 車の位置をスタート地点に
            let sp = mzdata.pStart_;
            iniX = sp[1]*blockSize+adjx;
            iniY += adjy-10;
            iniZ = sp[0]*blockSize+adjz;
            // 車の向きの最短経路のある方向に向ける
            const idir2rotY = [-0.5, 1, 0.5, 0];
            for (let idir = 0; idir < 4; ++idir) {
                if (mzdata.isWallPosiDir(sp, idir)) {
                    continue;
                }
                let p = [sp[0] + Maze1.IDIR[idir][0], sp[1] + Maze1.IDIR[idir][1]];
                let idx = mzdata.rc2idx(p[0], p[1]);
                if (mzdata.path2_.includes(idx)) {
                    iniRotY = idir2rotY[idir];
                    break;
                }
            }
            // スタート地点にボールを追加
            {
                let sp = mzdata.pStart_;
                const px = sp[1]*blockSize+adjx, py = blockSize*2+adjy, pz = sp[0]*blockSize+adjz;
                let radius = 3;
                const moBallBody = new CANNON.Body
                ({mass: 1,
                    shape: new CANNON.Sphere(radius),
                    position: new CANNON.Vec3(px, py, pz),
                    material: moMazeMtr,
                });
                world.addBody(moBallBody);
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
                let sp = mzdata.pGoal_;
                const px = sp[1]*blockSize+adjx, py = blockSize*2+adjy, pz = sp[0]*blockSize+adjz;
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
                // 描画を自動で更新させるために postStepにイベント追加
                world.addEventListener('postStep', () => {
                    viBallMesh.position.copy(moBallBody.position);
                    viBallMesh.quaternion.copy(moBallBody.quaternion);
                })
                moBallBody.addEventListener("collide", function(e) {
                    let moI = e.contact.bi;
                    let moJ = e.contact.bj;
                    if ((moI.isVehicle != undefined) || (moJ.isVehicle != undefined)) {
                        reachToGoal();
                    }
                });
            }
        }

        // !!!!
        if (mapType == 2) {
            // Maze2(通路と薄い壁の迷路) を使った迷路
            function createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz)
                        {
                            const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                            const moWall2Body = new CANNON.Body
                            ({mass: 0,
                                shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                position: new CANNON.Vec3(px+adjx, py+adjy, pz+adjz),
                                material: moMazeMtr,
                            });
                            world.addBody(moWall2Body);
                            const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                            const viWall2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9});
                            const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                            scene.add(viWall2Mesh);
                            viWall2Mesh.position.copy(moWall2Body.position);
                            viWall2Mesh.quaternion.copy(moWall2Body.quaternion);
                        }
            // let mapnrow = 8, mapncol = 8;
            let mapnrow = map2mapdiv, mapncol = map2mapdiv;
            let mzdata = new Maze2.MazeData02(mapnrow, mapncol);
            // mzdata.create(11); // 棒倒し法 複数経路
            // mzdata.create(20); // 穴掘り法
            mzdata.create(21); // 穴掘り法
            // mzdata.create(22); // 穴掘り法（改） 複数経路
            // mzdata.create(30); // 壁のばし
            // mzdata.create(31); // 壁のばし
            mzdata.dbgPrintMap();
            mzdata.seekPath2(); // 最短経路をもとめる
            mapnrow = mzdata.nrow_, mapncol = mzdata.ncol_;
            const moMazeMtr = new CANNON.Material({name: 'maze'});
            const blockSize = 10, blockSize_ = blockSize/2;
            const floorH = 1, wallH = blockSize_, wallT = 0.2;
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
                        createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz);
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
                        createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz);
                    }
                }
                for (let icol = 0; icol < mapncol; ++icol) {
                    ix = icol * blockSize;
                    for (let idir = 0; idir < 2; ++idir) { // 向き：(東、南)
                        if (mzdata.isWallPosiDir([irow, icol], idir)) {
                            // 壁
                            const sx = swall[idir][0], sy = swall[idir][1], sz = swall[idir][2];
                            const px = ix + adjwall[idir][0], py = wallH_ + adjwall[idir][1], pz = iz + adjwall[idir][2];
                            createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz);
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
                        }
                        {
                            const moWall2Body = new CANNON.Body
                            ({mass: 0,
                                shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                position: new CANNON.Vec3(px+adjx, py+adjy, pz+adjz),
                                material: moMazeMtr,
                            });
                            world.addBody(moWall2Body);
                            const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                            const viWall2Mtr = new THREE.MeshBasicMaterial({color: floorColor});
                            const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                            scene.add(viWall2Mesh);
                            viWall2Mesh.position.copy(moWall2Body.position);
                            viWall2Mesh.quaternion.copy(moWall2Body.quaternion);
                        }
                    }
                }
            }
            // 車の位置をスタート地点に
            let sp = mzdata.pStart_;
            iniX = sp[1]*blockSize+adjx;
            iniY += adjy-10;
            iniZ = sp[0]*blockSize+adjz;
            // 車の向きの最短経路のある方向に向ける
            const idir2rotY = [-0.5, 1, 0.5, 0];
            for (let idir = 0; idir < 4; ++idir) {
                if (mzdata.isWallPosiDir(sp, idir)) {
                    continue;
                }
                let p = [sp[0] + Maze2.IDIR[idir][0], sp[1] + Maze2.IDIR[idir][1]];
                let idx = mzdata.rc2idx(p[0], p[1]);
                if (mzdata.path2_.includes(idx)) {
                    iniRotY = idir2rotY[idir];
                    break;
                }
            }
            // スタート地点にボールを追加
            {
                let sp = mzdata.pStart_;
                const px = sp[1]*blockSize+adjx, py = blockSize*2+adjy, pz = sp[0]*blockSize+adjz;
                let radius = 3;
                const moBallBody = new CANNON.Body
                ({mass: 1,
                    shape: new CANNON.Sphere(radius),
                    position: new CANNON.Vec3(px, py, pz),
                    material: moMazeMtr,
                });
                world.addBody(moBallBody);
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
                const px = sp[1]*blockSize+adjx, py = blockSize*2+adjy, pz = sp[0]*blockSize+adjz;
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
                // 描画を自動で更新させるために postStepにイベント追加
                world.addEventListener('postStep', () => {
                    viBallMesh.position.copy(moBallBody.position);
                    viBallMesh.quaternion.copy(moBallBody.quaternion);
                })
                moBallBody.addEventListener("collide", function(e) {
                    let moI = e.contact.bi;
                    let moJ = e.contact.bj;
                    if ((moI.isVehicle != undefined) || (moJ.isVehicle != undefined)) {
                        reachToGoal();
                    }
                });
            }
        }

        // !!!!
        if (mapType == 3) {
            // Maze2(通路と薄い壁の迷路) を使った迷路 ＋ Maze3の経路
            function createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz)
                        {
                            const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                            const moWall2Body = new CANNON.Body
                            ({mass: 0,
                                shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                position: new CANNON.Vec3(px+adjx, py+adjy, pz+adjz),
                                material: moMazeMtr,
                            });
                            world.addBody(moWall2Body);
                            const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                            const viWall2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9});
                            const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                            scene.add(viWall2Mesh);
                            viWall2Mesh.position.copy(moWall2Body.position);
                            viWall2Mesh.quaternion.copy(moWall2Body.quaternion);
                        }
            let mapnrow = map3mapdiv, mapncol = map3mapdiv;
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
            const moMazeMtr = new CANNON.Material({name: 'maze'});
            const blockSize = 10, blockSize_ = blockSize/2;
            const floorH = 1, wallH = blockSize_, wallT = 0.2;
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
                        createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz);
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
                        createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz);
                    }
                }
                for (let icol = 0; icol < mapncol; ++icol) {
                    ix = icol * blockSize;
                    for (let idir = 0; idir < 2; ++idir) { // 向き：(東、南)
                        if (mzdata.isWallPosiDir([irow, icol], idir)) {
                            // 壁
                            const sx = swall[idir][0], sy = swall[idir][1], sz = swall[idir][2];
                            const px = ix + adjwall[idir][0], py = wallH_ + adjwall[idir][1], pz = iz + adjwall[idir][2];
                            createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz);
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
                        }
                        {
                            const moWall2Body = new CANNON.Body
                            ({mass: 0,
                                shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                position: new CANNON.Vec3(px+adjx, py+adjy, pz+adjz),
                                material: moMazeMtr,
                            });
                            world.addBody(moWall2Body);
                            const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                            const viWall2Mtr = new THREE.MeshBasicMaterial({color: floorColor});
                            const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                            scene.add(viWall2Mesh);
                            viWall2Mesh.position.copy(moWall2Body.position);
                            viWall2Mesh.quaternion.copy(moWall2Body.quaternion);
                        }
                    }
                    {
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
                                // 床
                                const sx = blockSize_/2, sy = 0.01, sz = blockSize_/2;
                                const px = (jcol-1) * blockSize_, py = floorH, pz = (jrow-1) * blockSize_;
                                let floorColor = "#c0c040";
                                const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                                const viWall2Mtr = new THREE.MeshBasicMaterial({color: floorColor});
                                const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                                scene.add(viWall2Mesh);
                                viWall2Mesh.position.copy(new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                            }
                        }
                    }
                }
            }
            // 車の位置をスタート地点に
            let sp = mzdata.pStart_;
            iniX = sp[1]*blockSize+adjx;
            iniY += adjy-10;
            iniZ = sp[0]*blockSize+adjz;
            // 車の向きの最短経路のある方向に向ける
            const idir2rotY = [-0.5, 1, 0.5, 0];
            for (let idir = 0; idir < 4; ++idir) {
                if (mzdata.isWallPosiDir(sp, idir)) {
                    continue;
                }
                let p = [sp[0] + Maze2.IDIR[idir][0], sp[1] + Maze2.IDIR[idir][1]];
                let idx = mzdata.rc2idx(p[0], p[1]);
                if (mzdata.path2_.includes(idx)) {
                    iniRotY = idir2rotY[idir];
                    break;
                }
            }
            // スタート地点にボールを追加
            {
                let sp = mzdata.pStart_;
                const px = sp[1]*blockSize+adjx, py = blockSize*2+adjy, pz = sp[0]*blockSize+adjz;
                let radius = 3;
                const moBallBody = new CANNON.Body
                ({mass: 1,
                    shape: new CANNON.Sphere(radius),
                    position: new CANNON.Vec3(px, py, pz),
                    material: moMazeMtr,
                });
                world.addBody(moBallBody);
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
                const px = sp[1]*blockSize+adjx, py = blockSize*2+adjy, pz = sp[0]*blockSize+adjz;
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
                // 描画を自動で更新させるために postStepにイベント追加
                world.addEventListener('postStep', () => {
                    viBallMesh.position.copy(moBallBody.position);
                    viBallMesh.quaternion.copy(moBallBody.quaternion);
                })
                moBallBody.addEventListener("collide", function(e) {
                    let moI = e.contact.bi;
                    let moJ = e.contact.bj;
                    if ((moI.isVehicle != undefined) || (moJ.isVehicle != undefined)) {
                        reachToGoal();
                    }
                });
            }
        }

        // !!!!
        if (mapType == 4) {
            // Maze1(通路・壁が同じ大きさの迷路) を使って highfield で表現
            function createDemFromMaze(mzdata, nPerBlock, ampHigh) {
                // 壁を山に、通路を谷に
                let matrix = [];
                let vzmax = 0;
                {
                    for (let irow = 0; irow < mzdata.nrow_; ++irow) {
                        let tline = [];
                        for (let icol = 0; icol < mzdata.ncol_; ++icol) {
                            let vh = mzdata.isWall(irow, icol) * ampHigh;
                            for (let ipb = 0; ipb < nPerBlock; ++ipb) {
                                tline.push(vh);
                            }
                        }
                        for (let ipb = 0; ipb < nPerBlock; ++ipb) {
                            matrix.push(tline);
                        }
                    }
                }
                // matrix のZ軸を入れ替え
                let matrix_ = [];
                const demh_ = demh - 1;
                for (let iz = 0; iz < demh; ++iz) {
                    matrix_.push(matrix[demh_-iz]);
                }
                matrix = matrix_;
                // 物理系 heighfield 用に 軸を入れ替えたデータを用意する
                let momatrix = [];
                for (let ix = 0; ix < demw; ++ix) {
                    momatrix.push([]);
                    for (let iz = 0; iz < demh; ++iz) {
                        momatrix[ix].push(matrix[iz][ix]);
                    }
                }
                return {matrix, momatrix, vzmax};
            }
            function createImgFromMaze(mzdata, nPerBlock) {
                let width = mzdata.ncol_, height = mzdata.nrow_;
                let img = new ImageData(width, height);
                for (let iy = 0; iy < mzdata.nrow_; ++iy) {
                    for (let ix = 0; ix < mzdata.ncol_; ++ix) {
                        let ii = (ix+iy*width)*4;
                        let idx = mzdata.rc2idx(iy, ix);
                        if (mzdata.path2_.includes(idx)) {
                            // 最短経路
                            //   R, G, B, A
                            img.data[ii+0] = 0; img.data[ii+1] = 192; img.data[ii+2] = 0; img.data[ii+3] = 255;
                        } else if (mzdata.isWall(iy, ix)) {
                            // 壁
                            img.data[ii+0] = 192; img.data[ii+1] = 192; img.data[ii+2] = 192; img.data[ii+3] = 255;
                        } else {
                            // 床
                            img.data[ii+0] = 32; img.data[ii+1] = 32; img.data[ii+2] = 32; img.data[ii+3] = 255;
                        }
                    }
                }
                return img;
            }
            function createGroundGeo2(matrix, momatrix, textureimg, sizeX, sizeZ, lengthX, lengthZ, posiX, posiZ, moGroundMtr, bWireframe) {
                const sizeX_ = sizeX-1;
                const sizeZ_ = sizeZ-1;
                const elemSizeX = lengthX / sizeX_;
                const elemSizeZ = lengthZ / sizeZ_;
                const moHeightfieldShape = new CANNON.Heightfield(momatrix, {elementSize: elemSizeX,})
                let moGroundBody = new CANNON.Body({ mass: 0, material: moGroundMtr })
                moGroundBody.addShape(moHeightfieldShape)
                // body の中心位置が、原点に来るように位置を調整
                moGroundBody.position.set(-lengthX/2 + posiX, 0, lengthZ/2 + posiZ)
                moGroundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
                const viGroundGeo = new THREE.BufferGeometry();
                let viPos = new Float32Array(sizeX*sizeZ*3);
                {
                    // ポリゴンの頂点座標の配列（Polygon's positon array)
                    let n=0;
                    for(let iz = 0; iz < sizeZ; iz++){ 
                        for(let ix = 0; ix < sizeX; ix++){
                            viPos[n] = ix * elemSizeX; n++;
                            viPos[n] = iz * elemSizeZ; n++;
                            viPos[n] = matrix[iz][ix]; n++;
                        }
                    }
                    // ポリゴンの三角形をインデックスで指定(Polugon's index array)
                    n=0;
                    let index = new Uint32Array(3*(sizeX_*sizeZ_*2));
                    for(let iz=sizeZ_-1; iz >= 0; --iz){ // 入力データの並びと表示を合わせるよう逆順で
                        for(let ix=0; ix < sizeX_; ix++){
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
                    let uvs = new Float32Array(sizeX*sizeZ*2);
                    for(let iz=0; iz<sizeZ; iz++){ 
                        for(let ix=0; ix<sizeX; ix++){
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
                let viGroundMtr;
                {
                    let texture = new THREE.Texture(textureimg);
                    texture.needsUpdate = true;
                    if (bWireframe == true) {
                        viGroundMtr = new THREE.MeshStandardMaterial({map: texture, side:THREE.DoubleSide, wireframe: true});
                    } else {
                        viGroundMtr = new THREE.MeshStandardMaterial({color:0xffffff, map: texture, side:THREE.DoubleSide, });
                    }
                }
                let viGroundMesh = new THREE.Mesh(viGroundGeo, viGroundMtr);
                viGroundMesh.position.copy(moGroundBody.position);
                viGroundMesh.quaternion.copy(moGroundBody.quaternion);
                return {moGroundBody, viGroundMesh, moHeightfieldShape, viGroundMtr, viPos, viGroundGeo};
            }
            let mapdiv = map4mapdiv;
            let mapnrow = mapdiv, mapncol = mapdiv;
            let mzdata = new Maze1.MazeData01(mapnrow, mapncol);
            // mzdata.create(11); // 棒倒し法 複数経路
            // mzdata.create(20); // 穴掘り法
            mzdata.create(21); // 穴掘り法
            // mzdata.create(22); // 穴掘り法（改） 複数経路
            // mzdata.create(30); // 壁のばし
            // mzdata.create(31); // 壁のばし
            mzdata.dbgPrintMap();
            mzdata.seekPath2(); // 最短経路をもとめる
            mapnrow = mzdata.nrow_, mapncol = mzdata.ncol_;
            console.log("size=",[mapnrow,mapncol]);
            let blockSize = 15; // 迷路１マスあたりのサイズ
            let blockSize_ = blockSize/2;
            let nPerBlock = 7;  // 1ブロックあたりの表示セグメント
            let ampHigh = 5; // 壁の高さ
            let demw = mapdiv*nPerBlock; // 点の数;
            let demh = mapdiv*nPerBlock; // 点の数;
            let blockSizeW = mapncol*blockSize; // demw * blockSize; // lengthX;
            let blockSizeH = mapnrow*blockSize; // demh * blockSize; // lengthZ; // マップのpixelサイズ
            let posiX = 0;
            let posiZ = 0;
            let bWireframe = true;
            let {matrix, momatrix, vzmax} = createDemFromMaze(mzdata, nPerBlock, ampHigh);
            let textureimg = createImgFromMaze(mzdata, nPerBlock);
            let {moGroundBody, viGroundMesh, moHeightfieldShape, viGroundMtr, viPos, viGroundGeo} =
                createGroundGeo2(matrix, momatrix, textureimg, demw, demh, blockSizeW, blockSizeH, posiX, posiZ, moGroundMtr, bWireframe);
            world.addBody(moGroundBody);
            scene.add(viGroundMesh);
            world.addBody(moGroundBody);
            scene.add(viGroundMesh);
            viGroundMesh.position.copy(moGroundBody.position);
            // 車の位置をスタート地点に
            let adjx = -mapncol/2*blockSize, adjy = 0, adjz = -mapnrow/2*blockSize;
            let sp = mzdata.pStart_;
            iniX = sp[1]*blockSize+adjx + blockSize_;
            iniY += adjy-10;
            iniZ = sp[0]*blockSize+adjz + blockSize_;
            // 車の向きの最短経路のある方向に向ける
            const idir2rotY = [-0.5, 1, 0.5, 0];
            for (let idir = 0; idir < 4; ++idir) {
                if (mzdata.isWallPosiDir(sp, idir)) {
                    continue;
                }
                let p = [sp[0] + Maze1.IDIR[idir][0], sp[1] + Maze1.IDIR[idir][1]];
                let idx = mzdata.rc2idx(p[0], p[1]);
                if (mzdata.path2_.includes(idx)) {
                    iniRotY = idir2rotY[idir];
                    break;
                }
            }
            const moMazeMtr = new CANNON.Material({name: 'maze'});
            // スタート地点にボールを追加
            {
                let sp = mzdata.pStart_;
                let vhigh = moHeightfieldShape.getHeightAt(sp[1]/mapncol,sp[0]/mapnrow,false);
                const px = sp[1]*blockSize+adjx+blockSize_, py = vhigh + ampHigh +10, pz = sp[0]*blockSize+adjz+blockSize_;
                let radius = 3;
                const moBallBody = new CANNON.Body
                ({mass: 0,
                    shape: new CANNON.Sphere(radius),
                    position: new CANNON.Vec3(px, py, pz),
                    material: moMazeMtr,
                });
                world.addBody(moBallBody);
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
                let sp = mzdata.pGoal_;
                let vhigh = moHeightfieldShape.getHeightAt(sp[1]/mapncol,sp[0]/mapnrow,false);
                const px = sp[1]*blockSize+adjx+blockSize_, py = vhigh+ampHigh, pz = sp[0]*blockSize+adjz+blockSize_;
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
                // 描画を自動で更新させるために postStepにイベント追加
                world.addEventListener('postStep', () => {
                    viBallMesh.position.copy(moBallBody.position);
                    viBallMesh.quaternion.copy(moBallBody.quaternion);
                })
                moBallBody.addEventListener("collide", function(e) {
                    let moI = e.contact.bi;
                    let moJ = e.contact.bj;
                    if ((moI.isVehicle != undefined) || (moJ.isVehicle != undefined)) {
                        reachToGoal();
                    }
                });
            }
        }

        // !!!!
        if (mapType == 5) {
            // Maze1(通路・壁が同じ大きさの迷路) を使って highfield で表現（山と谷を逆転）：キャットウォーク
            function createDemFromMaze(mzdata, nPerBlock, highBias, highAmp) {
                // 通路を山に、壁を谷に  （山と谷を逆転）
                let demw = mzdata.ncol_*nPerBlock, demh = mzdata.nrow_*nPerBlock;
                let matrix = [];
                let vzmax = 0;
                if (1) {
                    // パーリンノイズで起伏
                    matrix = Array.from(new Array(demh), _ => new Array(demw).fill(0));
                    // let perlingXYHStepList = [[0.01, 1], [0.05, 0.5], [0.1, 0.2]]; // 緩やかに
                    let perlingXYHStepList = [[0.01, 1], [0.05, 0.8], [0.1, 0.5]]; // ちょい激しく
                    let nx = demw; // mzdata.ncol_;
                    let ny = demh; // mzdata.nrow_;
                    for (let ipstep = 0; ipstep < perlingXYHStepList.length; ++ipstep) {
                        let pxystep = perlingXYHStepList[ipstep][0];
                        let phigh = perlingXYHStepList[ipstep][1];
                        for (let iy = 0; iy < ny; ++iy) {
                            for (let ix = 0; ix < nx; ++ix) {
                                let v = (1+noise.perlin2(ix*pxystep ,iy*pxystep)) * phigh;
                                matrix[iy][ix] += v;
                            }
                        }
                    }
                    // min,max を [0,1] にする
                    {
                        let vmin = matrix[0][0], vmax = vmin;
                        for (let iy = 0; iy < ny; ++iy) {
                            for (let ix = 0; ix < nx; ++ix) {
                                vmin = (vmin > matrix[iy][ix]) ? matrix[iy][ix] : vmin;
                                vmax = (vmax < matrix[iy][ix]) ? matrix[iy][ix] : vmax;
                            }
                        }
                        let amp = vmax-vmin;
                        let amp2 = 1/amp;
                        for (let iy = 0; iy < ny; ++iy) {
                            for (let ix = 0; ix < nx; ++ix) {
                                let v = matrix[iy][ix];
                                matrix[iy][ix] = (v-vmin)*amp2;
                            }
                        }
                    }
                    //  ＊ 迷路データ  .. 壁部分を凹にする（凹凸を逆に）
                    {
                        for (let iy = 0; iy < ny; ++iy) {
                            let irow = Math.floor(iy/nPerBlock);
                            for (let ix = 0; ix < nx; ++ix) {
                                let icol = Math.floor(ix/nPerBlock);
                                if (mzdata.isWall(irow, icol)) {
                                    matrix[iy][ix] -= 0.5;
                                }
                                // matrix[iy][ix] *= ampHigh;
                                matrix[iy][ix] = matrix[iy][ix]*highAmp + highBias;
                            }
                        }
                    }
                }
                // matrix のZ軸を入れ替え
                let matrix_ = [];
                const demh_ = demh - 1;
                for (let iz = 0; iz < demh; ++iz) {
                    matrix_.push(matrix[demh_-iz]);
                }
                matrix = matrix_;
                // 物理系 heighfield 用に 軸を入れ替えたデータを用意する
                let momatrix = [];
                for (let ix = 0; ix < demw; ++ix) {
                    momatrix.push([]);
                    for (let iz = 0; iz < demh; ++iz) {
                        momatrix[ix].push(matrix[iz][ix]);
                    }
                }
                return {matrix, momatrix, vzmax};
            }
            function createImgFromMaze(mzdata, nPerBlock) {
                let width = mzdata.ncol_, height = mzdata.nrow_;
                let img = new ImageData(width, height);
                for (let iy = 0; iy < mzdata.nrow_; ++iy) {
                    for (let ix = 0; ix < mzdata.ncol_; ++ix) {
                        let ii = (ix+iy*width)*4;
                        let idx = mzdata.rc2idx(iy, ix);
                        if (mzdata.path2_.includes(idx)) {
                            // 最短経路
                            //   R, G, B, A
                            img.data[ii+0] = 255; img.data[ii+1] = 255; img.data[ii+2] = 0; img.data[ii+3] = 255;
                        } else if (mzdata.isWall(iy, ix)) {
                            // 壁
                            img.data[ii+0] = 64; img.data[ii+1] = 64; img.data[ii+2] = 64; img.data[ii+3] = 255;
                        } else {
                            // 床
                            img.data[ii+0] = 192; img.data[ii+1] = 192; img.data[ii+2] = 192; img.data[ii+3] = 255;
                        }
                    }
                }
                return img;
            }
            function createGroundGeo2(matrix, momatrix, textureimg, sizeX, sizeZ, lengthX, lengthZ, posiX, posiZ, moGroundMtr, bWireframe) {
                const sizeX_ = sizeX-1;
                const sizeZ_ = sizeZ-1;
                const elemSizeX = lengthX / sizeX_;
                const elemSizeZ = lengthZ / sizeZ_;
                const moHeightfieldShape = new CANNON.Heightfield(momatrix, {elementSize: elemSizeX,})
                let moGroundBody = new CANNON.Body({ mass: 0, material: moGroundMtr })
                moGroundBody.addShape(moHeightfieldShape)
                // body の中心位置が、原点に来るように位置を調整
                moGroundBody.position.set(-lengthX/2 + posiX, 0, lengthZ/2 + posiZ)
                moGroundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
                const viGroundGeo = new THREE.BufferGeometry();
                let viPos = new Float32Array(sizeX*sizeZ*3);
                {
                    // ポリゴンの頂点座標の配列（Polygon's positon array)
                    let n=0;
                    for(let iz = 0; iz < sizeZ; iz++){ 
                        for(let ix = 0; ix < sizeX; ix++){
                            viPos[n] = ix * elemSizeX; n++;
                            viPos[n] = iz * elemSizeZ; n++;
                            viPos[n] = matrix[iz][ix]; n++;
                        }
                    }
                    // ポリゴンの三角形をインデックスで指定(Polugon's index array)
                    n=0;
                    let index = new Uint32Array(3*(sizeX_*sizeZ_*2));
                    for(let iz=sizeZ_-1; iz >= 0; --iz){ // 入力データの並びと表示を合わせるよう逆順で
                        for(let ix=0; ix < sizeX_; ix++){
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
                    let uvs = new Float32Array(sizeX*sizeZ*2);
                    for(let iz=0; iz<sizeZ; iz++){ 
                        for(let ix=0; ix<sizeX; ix++){
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
                let viGroundMtr;
                {
                    let texture = new THREE.Texture(textureimg);
                    texture.needsUpdate = true;
                    if (bWireframe == true) {
                        viGroundMtr = new THREE.MeshStandardMaterial({map: texture, side:THREE.DoubleSide, wireframe: true});
                    } else {
                        viGroundMtr = new THREE.MeshStandardMaterial({color:0xffffff, map: texture, side:THREE.DoubleSide, });
                    }
                }
                let viGroundMesh = new THREE.Mesh(viGroundGeo, viGroundMtr);
                viGroundMesh.position.copy(moGroundBody.position);
                viGroundMesh.quaternion.copy(moGroundBody.quaternion);
                return {moGroundBody, viGroundMesh, moHeightfieldShape, viGroundMtr, viPos, viGroundGeo};
            }
            let mapdiv = map5mapdiv;
            let mapnrow = mapdiv, mapncol = mapdiv;
            let mzdata = new Maze1.MazeData01(mapnrow, mapncol);
            // mzdata.create(11); // 棒倒し法 複数経路
            // mzdata.create(20); // 穴掘り法
            mzdata.create(21); // 穴掘り法
            // mzdata.create(22); // 穴掘り法（改） 複数経路
            // mzdata.create(30); // 壁のばし
            // mzdata.create(31); // 壁のばし
            mzdata.dbgPrintMap();
            mzdata.seekPath2(); // 最短経路をもとめる
            mapnrow = mzdata.nrow_, mapncol = mzdata.ncol_;
            let blockSize = 15; // 迷路１マスあたりのサイズ
            let blockSize_ = blockSize/2;
            let nPerBlock = 7;  // 1ブロックあたりの表示セグメント
            let highBias = map5highBias; // 壁の高さ（バイアス・切片
            let highAmp = map5highAmp; // 壁の高さ（振幅
            let demw = mapdiv*nPerBlock; // 点の数;
            let demh = mapdiv*nPerBlock; // 点の数;
            let blockSizeW = mapncol*blockSize; // demw * blockSize; // lengthX;
            let blockSizeH = mapnrow*blockSize; // demh * blockSize; // lengthZ; // マップのpixelサイズ
            let posiX = 0;
            let posiZ = 0;
            let bWireframe = true;
            let {matrix, momatrix, vzmax} = createDemFromMaze(mzdata, nPerBlock, highBias, highAmp);
            let textureimg = createImgFromMaze(mzdata, nPerBlock);
            let {moGroundBody, viGroundMesh, moHeightfieldShape, viGroundMtr, viPos, viGroundGeo} =
                createGroundGeo2(matrix, momatrix, textureimg, demw, demh, blockSizeW, blockSizeH, posiX, posiZ, moGroundMtr, bWireframe);
            world.addBody(moGroundBody);
            scene.add(viGroundMesh);
            world.addBody(moGroundBody);
            scene.add(viGroundMesh);
            viGroundMesh.position.copy(moGroundBody.position);
            // 車の位置をスタート地点に
            let adjx = -mapncol/2*blockSize, adjy = 0, adjz = -mapnrow/2*blockSize;
            let sp = mzdata.pStart_;
            let vhigh = moHeightfieldShape.getHeightAt(sp[1]/mapncol,sp[0]/mapnrow,false);
            iniX = sp[1]*blockSize+adjx + blockSize_;
            iniY = vhigh+5;
            iniZ = sp[0]*blockSize+adjz + blockSize_;
            // 車の向きの最短経路のある方向に向ける
            const idir2rotY = [-0.5, 1, 0.5, 0];
            for (let idir = 0; idir < 4; ++idir) {
                if (mzdata.isWallPosiDir(sp, idir)) {
                    continue;
                }
                let p = [sp[0] + Maze1.IDIR[idir][0], sp[1] + Maze1.IDIR[idir][1]];
                let idx = mzdata.rc2idx(p[0], p[1]);
                if (mzdata.path2_.includes(idx)) {
                    iniRotY = idir2rotY[idir];
                    break;
                }
            }
            const moMazeMtr = new CANNON.Material({name: 'maze'});
            // スタート地点にボールを追加
            {
                let sp = mzdata.pStart_;
                let vhigh = moHeightfieldShape.getHeightAt(sp[1]/mapncol,sp[0]/mapnrow,false);
                const px = sp[1]*blockSize+adjx+blockSize_, py = vhigh + map5highBias +20, pz = sp[0]*blockSize+adjz+blockSize_;
                let radius = 3;
                const moBallBody = new CANNON.Body
                ({mass: 0,
                    shape: new CANNON.Sphere(radius),
                    position: new CANNON.Vec3(px, py, pz),
                    material: moMazeMtr,
                });
                world.addBody(moBallBody);
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
            for (let ir = 0; ir < 3; ++ir) {
                let sp = mzdata.pGoal_;
                let vhigh = moHeightfieldShape.getHeightAt(sp[1]/mapncol,sp[0]/mapnrow,false);
                let radius = 3;
                const px = sp[1]*blockSize+adjx+blockSize_, py = vhigh+2*ir*radius, pz = sp[0]*blockSize+adjz+blockSize_;
                const moBallBody = new CANNON.Body
                ({mass: 0,
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
                // 描画を自動で更新させるために postStepにイベント追加
                world.addEventListener('postStep', () => {
                    viBallMesh.position.copy(moBallBody.position);
                    viBallMesh.quaternion.copy(moBallBody.quaternion);
                })
                moBallBody.addEventListener("collide", function(e) {
                    let moI = e.contact.bi;
                    let moJ = e.contact.bj;
                    if ((moI.isVehicle != undefined) || (moJ.isVehicle != undefined)) {
                        reachToGoal();
                    }
                });
            }
        }

        // !!!!
        if (mapType == 6) {
            // Maze2(通路と薄い壁の迷路) を使った迷路 ＋ Maze3の経路＋マイクロマウスのマップ
            function createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz)
                        {
                            const sx_ = sx/2, sy_ = sy/2, sz_ = sz/2;
                            const moWall2Body = new CANNON.Body
                            ({mass: 0,
                                shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                position: new CANNON.Vec3(px+adjx, py+adjy, pz+adjz),
                                material: moMazeMtr,
                            });
                            world.addBody(moWall2Body);
                            const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                            const viWall2Mtr = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9});
                            const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                            scene.add(viWall2Mesh);
                            viWall2Mesh.position.copy(moWall2Body.position);
                            viWall2Mesh.quaternion.copy(moWall2Body.quaternion);
                        }
            let mapnrow = 1, mapncol = 1;
            let mzdata = new Maze2.MazeData02();
            let nameName = map6imap2name[map6imap];
            mzdata.create_from(Maze2data.get_map_data(nameName)); // 固定マップ
            mzdata.dbgPrintMap();
            mzdata.seekPath2(); // 最短経路をもとめる
            let mzdata3 = new Maze3.MazeData03();
            mzdata3.create_from_maze2(mzdata);
            mzdata3.seekPath7();  // 斜めあり
            mapnrow = mzdata.nrow_, mapncol = mzdata.ncol_;
            const moMazeMtr = new CANNON.Material({name: 'maze'});
            const blockSize = 10, blockSize_ = blockSize/2;
            const floorH = 1, wallH = blockSize_, wallT = 0.2;
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
                        createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz);
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
                        createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz);
                    }
                }
                for (let icol = 0; icol < mapncol; ++icol) {
                    ix = icol * blockSize;
                    for (let idir = 0; idir < 2; ++idir) { // 向き：(東、南)
                        if (mzdata.isWallPosiDir([irow, icol], idir)) {
                            // 壁
                            const sx = swall[idir][0], sy = swall[idir][1], sz = swall[idir][2];
                            const px = ix + adjwall[idir][0], py = wallH_ + adjwall[idir][1], pz = iz + adjwall[idir][2];
                            createWall(sx, sy, sz, px, py, pz, adjx, adjy, adjz);
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
                        }
                        {
                            const moWall2Body = new CANNON.Body
                            ({mass: 0,
                                shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                                position: new CANNON.Vec3(px+adjx, py+adjy, pz+adjz),
                                material: moMazeMtr,
                            });
                            world.addBody(moWall2Body);
                            const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                            const viWall2Mtr = new THREE.MeshBasicMaterial({color: floorColor});
                            const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                            scene.add(viWall2Mesh);
                            viWall2Mesh.position.copy(moWall2Body.position);
                            viWall2Mesh.quaternion.copy(moWall2Body.quaternion);
                        }
                    }
                    {
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
                                // 床
                                const sx = blockSize_/2, sy = 0.01, sz = blockSize_/2;
                                const px = (jcol-1) * blockSize_, py = floorH, pz = (jrow-1) * blockSize_;
                                let floorColor = "#c0c040";
                                const viWall2Geo = new THREE.BoxGeometry(sx, sy, sz);
                                const viWall2Mtr = new THREE.MeshBasicMaterial({color: floorColor});
                                const viWall2Mesh = new THREE.Mesh(viWall2Geo, viWall2Mtr);
                                scene.add(viWall2Mesh);
                                viWall2Mesh.position.copy(new CANNON.Vec3(px+adjx, py+adjy, pz+adjz));
                            }
                        }
                    }
                }
            }
            // 車の位置をスタート地点に
            let sp = mzdata.pStart_;
            iniX = sp[1]*blockSize+adjx;
            iniY += adjy-10;
            iniZ = sp[0]*blockSize+adjz;
            // 車の向きの最短経路のある方向に向ける
            const idir2rotY = [-0.5, 1, 0.5, 0];
            for (let idir = 0; idir < 4; ++idir) {
                if (mzdata.isWallPosiDir(sp, idir)) {
                    continue;
                }
                let p = [sp[0] + Maze2.IDIR[idir][0], sp[1] + Maze2.IDIR[idir][1]];
                let idx = mzdata.rc2idx(p[0], p[1]);
                if (mzdata.path2_.includes(idx)) {
                    iniRotY = idir2rotY[idir];
                    break;
                }
            }
            // スタート地点にボールを追加
            {
                let sp = mzdata.pStart_;
                const px = sp[1]*blockSize+adjx, py = blockSize*2+adjy, pz = sp[0]*blockSize+adjz;
                let radius = 3;
                const moBallBody = new CANNON.Body
                ({mass: 1,
                    shape: new CANNON.Sphere(radius),
                    position: new CANNON.Vec3(px, py, pz),
                    material: moMazeMtr,
                });
                world.addBody(moBallBody);
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
                const px = sp[1]*blockSize+adjx, py = blockSize*2+adjy, pz = sp[0]*blockSize+adjz;
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
                // 描画を自動で更新させるために postStepにイベント追加
                world.addEventListener('postStep', () => {
                    viBallMesh.position.copy(moBallBody.position);
                    viBallMesh.quaternion.copy(moBallBody.quaternion);
                })
                moBallBody.addEventListener("collide", function(e) {
                    let moI = e.contact.bi;
                    let moJ = e.contact.bj;
                    if ((moI.isVehicle != undefined) || (moJ.isVehicle != undefined)) {
                        reachToGoal();
                    }
                });
            }
        }

        return [world, camera, scene, renderer, orbitControls, vehicle];
    };

    [world, camera, scene, renderer, orbitControls, vehicle] = createWorld();
    resetVehiclePosi();

    // ----------------------------------------
    let srclist = [];

    addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    });

    // ----------------------------------------

    let cameraPosi = 0;

    // キー同時押しのときに、挙動が思ったようにならない
    // - ArrowUp を押したまま、 ArrowLeft を押して放しても、「ArrowUp の keydown」イベントが発生しない
    // 再度キーを押下するとイベント発生することから、
    // 下記のよう キーイベント発生時の状態を記録する（保持する）挙動に切り替える
    // 但し、対象は (アクセル操作、ハンドル、ブレーキ（サイドブレーキ）、バック)に限る
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
        case 'r':
            // 車の姿勢を戻す／車をひっくり返す ..
            vehicle.keydown_resetPosture();
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
        case '6':
            // マップの切り替え
            mapType = parseInt(event.key);
            initMapPara();
            [world, camera, scene, renderer, orbitControls, vehicle] = createWorld();
            resetVehiclePosi();
            break;
        case ' ':
            let px, py, pz;
            [px, py, pz] = vehicle.getPosition();
            px = parseInt(px);
            pz = parseInt(pz);
            py = parseInt(py);
            let vquat = vehicle.getModel().chassisBody.quaternion;
            let veuler = new CANNON.Vec3(0, 0, 0);
            vquat.toEuler(veuler);
            let roty = veuler.y / Math.PI + 0.5;
            roty = Math.round(roty*100)/100;
            console.log(" p[z,x,y]=",pz,px,py, " rotY=", roty)
            break;
        case '0':
            initMapPara();
            [world, camera, scene, renderer, orbitControls, vehicle] = createWorld();
            resetVehiclePosi();
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

    // ゴールにたどり着く
    function reachToGoal() {
        incrMapPara();
        [world, camera, scene, renderer, orbitControls, vehicle] = createWorld();
        resetVehiclePosi();
    }


    let iroty = 0;
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
                if (gamepad.para_.btnLT || gamepad.para_.btnRT) {
                    keyChangeCool = 10;
                    vehicle.keydown_resetPosture();
                }
                if (gamepad.para_.btnLT && gamepad.para_.btnRT) {
                    keyChangeCool = 30;
                    initMapPara();
                    [world, camera, scene, renderer, orbitControls, vehicle] = createWorld();
                    resetVehiclePosi();
                }
                if (gamepad.para_.btnST) {
                    keyChangeCool = 30;
                    mapType = (mapType % 6) + 1;
console.log("mapType=",mapType);
                    initMapPara();
                    [world, camera, scene, renderer, orbitControls, vehicle] = createWorld();
                    resetVehiclePosi();
                }
                if (gamepad.para_.btnBK) {
                    keyChangeCool = 30;
                    mapType = ((mapType+4) % 6) + 1;
                    initMapPara();
                    [world, camera, scene, renderer, orbitControls, vehicle] = createWorld();
                    resetVehiclePosi();
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

        // slopetoy
        for (let ii = 0; ii < srclist.length; ++ii) {
        let src = srclist[ii];
        for (let i = 0; i < src.moBallBodyVec_.length; ++i) {
            // 場外判定
            if (src.moBallBodyVec_[i].position.y < -100) {
            src.repop(src.moBallBodyVec_[i]);
            }
            // 停止判定
            if (src.moBallBodyVec_[i].velocity.lengthSquared() < 0.01) {
            src.repop(src.moBallBodyVec_[i]);
            }
        }
        src.pop();
        }

        // 車関連
        vehicle.viewUpdate();

        // カメラ・視点 関連
        let chassisBody = vehicle.getModel().chassisBody;
        let vposi = chassisBody.position;
        let vquat = chassisBody.quaternion;

        if (cameraPosi == 0) {
        // 後背からビュー / 車の後方位置から正面に向けて
        // let vv = vquat.vmult(new CANNON.Vec3(23, 5, 0));  // 後方、高さ、左右
        let vv = vquat.vmult(new CANNON.Vec3(9, 1.5, 0));  // 後方、高さ、左右
        camera.position.set(vposi.x + vv.x, vposi.y + vv.y, vposi.z + vv.z);
        camera.rotation.z = 0;
        camera.lookAt(new THREE.Vector3(vposi.x, vposi.y, vposi.z));
        } else if (cameraPosi == 1) {
        // フロントビュー（ドライバー視点) / 車の中心位置から正面に向けて
        camera.position.copy(new THREE.Vector3(vposi.x, vposi.y+2, vposi.z));
        camera.rotation.z = 0;
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

        {
        let speed = vehicle.getSpeed();
        speed = parseInt(speed*10)/10.0;
        setSpeed(speed);
        }

        renderer.render(scene, camera)
        requestAnimationFrame(animate)
    }

    animate();
};

function setSpeed(speed) {
    const canvas = document.getElementById('canvas2d');
    const ctxspd = canvas.getContext('2d');
    canvas.width = 200; // window.innerWidth;
    canvas.height = 40; // window.innerHeight;
    ctxspd.font = '20px bold sans-serif';
    ctxspd.textBaseline = 'alphabetic';
    ctxspd.textAlign = 'start';
    ctxspd.fillStyle = 'white';
    ctxspd.fillText("speed: "+speed, 20, 22);
};

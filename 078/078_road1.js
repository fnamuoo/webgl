// 凹凸のある道路をキャラクターコントローラーでCNSと競争する(1)

// for local
const SCRIPT_URL1 = "../075/Maze.js";
// for PlayGround
// const SCRIPT_URL1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";

let Maze = null;
import(SCRIPT_URL1).then((obj) => { Maze = obj; console.log("maze=",obj); });

// 多次元配列用のシャッフル
const shuffle2 = (arr) =>
  arr.map((value) => ({ value, random: Math.random() }))
    .sort((a, b) => a.random - b.random)
    .map(({ value }) => value);

var createScene = function () {

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(2, 5,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, 100), scene);
    light.intensity = 0.2;
    var light2 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, -100), scene);
    light2.intensity = 0.2;
    var light3 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, 100), scene);
    light3.intensity = 0.2;
    var light4 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, -100), scene);
    light4.intensity = 0.2;

    let maze = null;
    const wL=1.5, wL_=wL/2, wS=0.1, wS_=wS/2, wH=0.8, wH_=wH/2;
    let mapR = 7, mapC = 9;
    let adjx, adjz, nx, nz, adjx2, adjz2, nz2;

    // index座標値から座標値への変換
    let ixz2xz = function (ix, iz) {
        return [ix*wL+adjx, (nz-iz)*wL+adjz];
    }
    // 座標値からindex座標値への変換
    let xz2ixz = function (x, z) {
        return [(x -adjx)/wL, (z -adjz)/wL-1];
    }

    let stageLv=1, myHP=10, needClearPoint=8;
    let cannonInfoList = [], cannonInfoList_ = [];
    let pStart, pGoal;

    let stageInfo = []
    function createStaticMesh(scene) {
        while (stageInfo.length > 0) {
            let mesh = stageInfo.pop();
            mesh.dispose();
        }

        let meshes = [];
        mapR = 6 + stageLv;
        mapC = 8 + stageLv;
        maze = new Maze.Maze1(mapR, mapC);
        maze.create(21);
        maze.resetStartGoal();
        maze.dbgPrintMap();

        adjx=-(maze.ncol_-1)*wL_, adjz=-(maze.nrow_+1)*wL_, nx=maze.ncol_, nz=maze.nrow_;
        let x,y=wH_,z, ix,iz;

        let nbPoints = 10;

        // 最短経路
        if (1) {
            maze.seekPath2(); // 最短経路をもとめる
            let plist = [];
            for (let idx of maze.path2_) {
                [iz,ix] = maze.idx2rc(idx);
                plist.push(new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz));
            }
            let line = BABYLON.MeshBuilder.CreateDashedLines("arc", {points: plist, dashSize:1, gapSize:1});
            line.color = BABYLON.Color3.Gray();
            stageInfo.push(line);
            // 上記で取得した点列を、スプラインで補間
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
            const plist2 = catmullRom.getPoints();
            // 補間した点群を線分で表示
            const arcLine = BABYLON.MeshBuilder.CreateLines("arc", {points: plist2})
            arcLine.color = BABYLON.Color3.Blue();
            stageInfo.push(arcLine);
        }

        // 点列を圧縮して、補間を線分表示
        if (0) {
            // maze.seekPath2(); // 最短経路をもとめる
            let plist = []; // 直線の並びは削除して短縮する
            let x0= null, z0, x1, z1, vec0=[],vec1=[];
            for (let idx of maze.path2_) {
                if (x0 === null) {
                    [iz,ix] = maze.idx2rc(idx);
                    plist.push(new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz));
                    [z0,x0] = [iz,ix]
                    continue;
                }
                if (vec0.length == 0) {
                    [z1,x1] = maze.idx2rc(idx);
                    vec0 = [z1-z0, x1-x0];
                    continue;
                }
                [iz,ix] = maze.idx2rc(idx);
                vec1 = [iz-z1, ix-x1];
                prod = Math.abs(vec0[0]*vec1[1] - vec0[1]*vec1[0]);
                if (prod < 0.1) {
                    // 外積が０、直線に並んでいるのでスキップ
                    [z1,x1] = [iz,ix];
                    vec0 = [z1-z0, x1-x0];
                    continue;
                }
                // x1,z1を座標値として追加
                plist.push(new BABYLON.Vector3(x1*wL+adjx, 0.01, (nz-z1)*wL+adjz));
                // 座標をスライド
                [z0,x0] = [z1,x1];
                [z1,x1] = [iz,ix];
                vec0 = [z1-z0, x1-x0];
            }
            plist.push(new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz));
            // console.log("plist.len=", plist.length);
            // console.log("plist=", plist);
            let line = BABYLON.MeshBuilder.CreateDashedLines("arc", {points: plist, dashSize:1, gapSize:1});
            line.color = BABYLON.Color3.Gray();
            stageInfo.push(line);
            // 上記で取得した点列を、スプラインで補間
            // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, true);
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
            const plist2 = catmullRom.getPoints();
            // 補間した点群を線分で表示
            const arcLine = BABYLON.MeshBuilder.CreateLines("arc", {points: plist2})
            stageInfo.push(arcLine);
        }


        // 点列を圧縮して、補間を ... 押し出しで表示
        if (0) {
            // maze.seekPath2(); // 最短経路をもとめる
            let plist = []; // 直線の並びは削除して短縮する
            let x0= null, z0, x1, z1, vec0=[],vec1=[];
            for (let idx of maze.path2_) {
                if (x0 === null) {
                    [iz,ix] = maze.idx2rc(idx);
                    plist.push(new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz));
                    [z0,x0] = [iz,ix]
                    continue;
                }
                if (vec0.length == 0) {
                    [z1,x1] = maze.idx2rc(idx);
                    vec0 = [z1-z0, x1-x0];
                    continue;
                }
                [iz,ix] = maze.idx2rc(idx);
                vec1 = [iz-z1, ix-x1];
                prod = Math.abs(vec0[0]*vec1[1] - vec0[1]*vec1[0]);
                if (prod < 0.1) {
                    // 外積が０、直線に並んでいるのでスキップ
                    [z1,x1] = [iz,ix];
                    vec0 = [z1-z0, x1-x0];
                    continue;
                }
                // x1,z1を座標値として追加
                plist.push(new BABYLON.Vector3(x1*wL+adjx, 0.01, (nz-z1)*wL+adjz));
                // 座標をスライド
                [z0,x0] = [z1,x1];
                [z1,x1] = [iz,ix];
                vec0 = [z1-z0, x1-x0];
            }
            plist.push(new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz));
            // console.log("plist.len=", plist.length);
            // console.log("plist=", plist);
            let line = BABYLON.MeshBuilder.CreateDashedLines("arc", {points: plist, dashSize:1, gapSize:1});
            line.color = BABYLON.Color3.Gray();
            stageInfo.push(line);
            // 上記で取得した点列を、スプラインで補間
            // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, true); // 周回に
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false); // 解放端に
            const plist2 = catmullRom.getPoints();
            // // 補間した点群を線分で表示
            // const arcLine = BABYLON.MeshBuilder.CreateLines("arc", {points: plist2})

            // // チューブで表示
            // let mesh = BABYLON.MeshBuilder.CreateTube("tube", {path: plist2, radius: 0.5, sideOrientation: BABYLON.Mesh.DOUBLESIDE, tessellation: 16}, scene);
            // mesh.material = new BABYLON.StandardMaterial("mat", scene);
            // mesh.material.emissiveColor = BABYLON.Color3.Blue();
            // mesh.material.wireframe = true;
            // stageInfo.push(mesh);

            // 矩形（凹）で表示
            let tubeH = 0.1, tubeW12 = 0.5;  // これでも大きすぎる(急な角度だとメッシュが重なる)
            // let tubeH = 0.02, tubeW12 = 0.1;
            const myShape = [
                new BABYLON.Vector3(-tubeW12,  tubeH, 0),
                new BABYLON.Vector3(-tubeW12,  0    , 0),
                new BABYLON.Vector3( tubeW12,  0    , 0),
                new BABYLON.Vector3( tubeW12,  tubeH, 0)
            ];
            let options = {shape: myShape,
                           path: plist2, // points,
                           sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                           adjustFrame:true};
            let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
            stageInfo.push(mesh);
        }


        // 経路に高さをperlinノイズで
        if (0) {
            maze.seekPath2(); // 最短経路をもとめる
            let nb = new BABYLON.NoiseBlock();
            const nbvzero = new BABYLON.Vector3(0,0,0), nbscale = 0.5;
            let plist = [];
            for (let idx of maze.path2_) {
                [iz,ix] = maze.idx2rc(idx);
                let y = nb.noise(8, 0.5, new BABYLON.Vector3(ix,iz,0), nbvzero, nbscale);
                y *= 5;
                plist.push(new BABYLON.Vector3(ix*wL+adjx, y, (nz-iz)*wL+adjz));
            }
            // // let line = BABYLON.MeshBuilder.CreateDashedLines("arc", {points: plist, dashSize:1, gapSize:1});
            // // line.color = BABYLON.Color3.Gray();
            // // stageInfo.push(line);

            // 上記で取得した点列を、スプラインで補間
            // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, true);
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
            const plist2 = catmullRom.getPoints();
            // 補間した点群を線分で表示
            const arcLine = BABYLON.MeshBuilder.CreateLines("arc", {points: plist2})
            arcLine.color = BABYLON.Color3.Yellow();
            stageInfo.push(arcLine);
        }



        // 経路に高さをperlinノイズで  extrudeで作ると傾くxxx
        if (0) {
            maze.seekPath2(); // 最短経路をもとめる
            let nb = new BABYLON.NoiseBlock();
            const nbvzero = new BABYLON.Vector3(0,0,0), nbscale = 0.5;
            let plist = [];
            for (let idx of maze.path2_) {
                [iz,ix] = maze.idx2rc(idx);
                let y = nb.noise(8, 0.5, new BABYLON.Vector3(ix,iz,0), nbvzero, nbscale);
                y *= 5;
                plist.push(new BABYLON.Vector3(ix*wL+adjx, y, (nz-iz)*wL+adjz));
            }
            // // let line = BABYLON.MeshBuilder.CreateDashedLines("arc", {points: plist, dashSize:1, gapSize:1});
            // // line.color = BABYLON.Color3.Gray();
            // // stageInfo.push(line);

            // 上記で取得した点列を、スプラインで補間
            // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, true);
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
            const plist2 = catmullRom.getPoints();

            // 補間した点群を線分で表示
            const arcLine = BABYLON.MeshBuilder.CreateLines("arc", {points: plist2})
            arcLine.color = BABYLON.Color3.Yellow();
            stageInfo.push(arcLine);

            // 矩形（凹）で表示
            let tubeH = 0.1, tubeW12 = 0.5;  // これでも大きすぎる(急な角度だとメッシュが重なる)
            // let tubeH = 0.02, tubeW12 = 0.1;
            const myShape = [
                new BABYLON.Vector3(-tubeW12,  tubeH, 0),
                new BABYLON.Vector3(-tubeW12,  0    , 0),
                new BABYLON.Vector3( tubeW12,  0    , 0),
                new BABYLON.Vector3( tubeW12,  tubeH, 0)
            ];
            let options = {shape: myShape,
                           path: plist2, // points,
                           sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                           adjustFrame:true};
            let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
            stageInfo.push(mesh);
        }


        // 経路に高さをperlinノイズで  Path3Dで経路を管理する
        // 　　なるほど、y=perlin()で高低差があると垂直方向（Y軸方向）が傾くのね
        //      一方で y=(const)なら垂直方向は同じと..
        //   .. Binormals（従法線）の方向が固定なら、Normals（法線）からパスの水平方向が取得可能と思ったが、そうでもないと。
        if (0) {
            maze.seekPath2(); // 最短経路をもとめる
            let nb = new BABYLON.NoiseBlock();
            const nbvzero = new BABYLON.Vector3(0,0,0), nbscale = 0.5;
            let plist = [];
            for (let idx of maze.path2_) {
                [iz,ix] = maze.idx2rc(idx);
                let y = nb.noise(8, 0.5, new BABYLON.Vector3(ix,iz,0), nbvzero, nbscale);
                y *= 5;
                // y = 1;
                plist.push(new BABYLON.Vector3(ix*wL+adjx, y, (nz-iz)*wL+adjz));
            }
            // 上記で取得した点列を、スプラインで補間
            // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, true);
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
            const plist2 = catmullRom.getPoints();
            // Path3Dで管理、
            const path3d = new BABYLON.Path3D(plist2);
	    var tangents = path3d.getTangents();
	    var normals = path3d.getNormals();
	    var binormals = path3d.getBinormals();
	    var curve = path3d.getCurve();
	    // Tangents（接線／進行方向：赤）, Normals（法線／進行方向右手：青）, and Binormals（従法線／進行方向上部：緑）を表示させる
	    var li = BABYLON.Mesh.CreateLines('li', curve, scene);
            stageInfo.push(li);
	    for(var p = 0; p < curve.length; p++) {
		var tg = BABYLON.Mesh.CreateLines('tg', [ curve[p], curve[p].add(tangents[p]) ], scene);
		tg.color = BABYLON.Color3.Red();
		var no = BABYLON.Mesh.CreateLines('no', [ curve[p], curve[p].add(normals[p]) ], scene);
		no.color = BABYLON.Color3.Blue();
		var bi = BABYLON.Mesh.CreateLines('bi', [ curve[p], curve[p].add(binormals[p]) ], scene);
		bi.color = BABYLON.Color3.Green();
                stageInfo.push(tg);
                stageInfo.push(no);
                stageInfo.push(bi);
	    }
        }


        // 経路に高さをperlinノイズで.. 
        //   水平な道を作ろうとしたら、個々の点で進行方向ベクトルをもとめ、水平方向を見極めるしかないではないか!!
        if (1) {
            maze.seekPath2(); // 最短経路をもとめる
            let nb = new BABYLON.NoiseBlock();
            const nbvzero = new BABYLON.Vector3(0,0,0), nbscale = 0.5;
            let plist = [];
            for (let idx of maze.path2_) {
                [iz,ix] = maze.idx2rc(idx);
                let y = nb.noise(8, 0.5, new BABYLON.Vector3(ix,iz,0), nbvzero, nbscale);
                y *= 5;
                plist.push(new BABYLON.Vector3(ix*wL+adjx, y, (nz-iz)*wL+adjz));
            }
            // 上記で取得した点列を、スプラインで補間
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
            const plist2 = catmullRom.getPoints();
            // 個々の点で進行方向ベクトルをもとめ、水平方向をもとめ、水平位置の右側／左側の座標を求める
            let p1 = plist2[0], p2=p1, v, v1, vR, vL, vC, pR, pL;
            const sW = 3, sW_=sW/2;
            const qR = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), Math.PI/2);
            const qL = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -Math.PI/2);
            v1 = BABYLON.Vector3.Zero;
            let plist3R = [], plist3L = [];
            for (let p of plist2) {
                v = p.subtract(p1);
                vR = v.applyRotationQuaternion(qR);
                pR = p.add(vR.scale(sW_));
                vL = v.applyRotationQuaternion(qL);
                pL = p.add(vL.scale(sW_));
                // ベクトル片の外積(vC.y)から（右／左）どちら向きかを判断し、曲がる方向に傾ける（高さを調整する）
                vC = BABYLON.Vector3.Cross(v,v1);
                if (Math.abs(vC.y) > 0.0001) {
                    pR.y += vC.y*10;
                    pL.y -= vC.y*10;
                }
                plist3R.push(pR);
                plist3L.push(pL);
                p2 = p1;
                p1 = p;
                v1 = v;
            }

            // 道の端のガード
            const guideR = 0.03;
            let meshR = BABYLON.MeshBuilder.CreateTube("tube", {path: plist3R, radius: guideR, tessellation: 4}, scene);
            meshR.material = new BABYLON.StandardMaterial("mat", scene);
            meshR.material.emissiveColor = BABYLON.Color3.Blue();
            stageInfo.push(meshR);
            let meshL = BABYLON.MeshBuilder.CreateTube("tube", {path: plist3L, radius: guideR, tessellation: 4}, scene);
            meshL.material = new BABYLON.StandardMaterial("mat", scene);
            meshL.material.emissiveColor = BABYLON.Color3.Red();
            stageInfo.push(meshL);

            // 道の本体をribbonで作成する
            let mypath3 = [plist3R, plist3L];
            mesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: mypath3, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            stageInfo.push(mesh);

            pStart = plist2[1].clone();
            pGoal = plist2[plist2.length-2].clone();
        }

        return meshes;
    }

    let meshes = createStaticMesh(scene);

    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key === ' ') {
                ++stageLv;
                createStaticMesh(scene);
            }
        }
    })

    return scene;
};

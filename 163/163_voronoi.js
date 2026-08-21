//  Babylon.js ：ボロノイ図を使った地域制圧ゲームの素案

// ######################################################################

export var createScene_test_2001 = async function () {
    const SCRIPT_URL1 = "https://cdn.skypack.dev/d3-delaunay@6";
    let d3 = null;
    await import(SCRIPT_URL1).then((obj) => { d3 = obj; console.log("maze=",obj); });

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 4, 20, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // 1. ランダムな点群を生成 (-5 ～ 5 の範囲)
    const pointsCount = 50;
    const points = [];

    if (1) {
        // ランダム
        for (let i = 0; i < pointsCount; i++) {
            points.push([Math.random() * 10 - 5, Math.random() * 10 - 5]);
        }
    }
    if (0) {
        // グリッド
        for (let iy = -5; iy < 6; ++iy) {
            for (let ix = -5; ix < 6; ++ix) {
                points.push([ix, iy]);
            }
        }
    }
    if (0) {
        // グリッド+ランダムで抜け
        for (let iy = -5; iy < 6; ++iy) {
            for (let ix = -5; ix < 6; ++ix) {
                if (Math.random() < 0.5) { continue; }
                points.push([ix, iy]);
            }
        }
    }

    // 2. Delaunay 計算と Voronoi 図の作成
    const delaunay = d3.Delaunay.from(points);
    const voronoi = delaunay.voronoi([-6, -6, 6, 6]); // 表示範囲を設定

    // 3. ボロノイの各セルをループして線を描画
    for (const polygon of voronoi.cellPolygons()) {
        const pointsArray = [];
        for (const p of polygon) {
            pointsArray.push(new BABYLON.Vector3(p[0], 0, p[1]));
        }
        // 閉じるために最初の点を追加
        pointsArray.push(pointsArray[0]);

        // 線を作成
        const lines = BABYLON.MeshBuilder.CreateLines("voronoiLine", {
            points: pointsArray,
            updatable: false
        }, scene);
        lines.color = new BABYLON.Color3(0, 1, 1);
    }

    // 4. 元の点群を球体として表示
    for (const p of points) {
        const sphere = BABYLON.MeshBuilder.CreateSphere("point", { diameter: 0.2 }, scene);
        sphere.position = new BABYLON.Vector3(p[0], 0, p[1]);
    }

    return scene;
};

// ######################################################################

export var createScene_test_2003 = async function () {
    const SCRIPT_URL1 = "https://cdn.skypack.dev/d3-delaunay@6";
    let d3 = null;
    await import(SCRIPT_URL1).then((obj) => { d3 = obj;});
    const scene = new BABYLON.Scene(engine);

    let camera=null, cameraTrgMesh=null;
    let crCameraDef00 = function() {
        let _camera = new BABYLON.ArcRotateCamera("", -Math.PI / 2, Math.PI / 4, 20, BABYLON.Vector3.Zero(), scene);
        _camera.attachControl(canvas, true);
        return _camera;
    }
    let crCameraDef = function() {
        // 101用
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 15, new BABYLON.Vector3(0, 0, 0));
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        // _camera.attachControl(canvas, true);
        // _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera2 = function() {
        // バードビュー：対象(cameraTrgMesh)を後方から追跡 .. 速度依存（対象が速いと置いて行かれる）
        let _camera = new BABYLON.FollowCamera("", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 2;
        _camera.heightOffset = 1;
        _camera.cameraAcceleration = 0.005;
        _camera.maxCameraSpeed = 5;
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        let mesh = BABYLON.MeshBuilder.CreateBox("", {}, scene);
        mesh.visibility = 0; // 不可視に
        _camera._vtrg = mesh.position.clone();
        _camera.lockedTarget = mesh;
        return _camera;
    }
    let crCamera3 = function() {
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 3; // 1.3;
        _camera.heightOffset = 0.5; // 0.0;
        _camera.cameraAcceleration = 0.05; // 0.3;
        _camera.maxCameraSpeed = 30;
        return _camera;
    }
//    camera = crCameraDef00();
    camera = crCameraDef(); // debug
//     camera = crCamera2();
//     camera = crCamera3();

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    let meshStage = [], meshCheck = [];
    let playerPosi = [], loopCount = 0, loopCountMax = 2999;
    let createStage = function() {
        loopCount = loopCountMax;
        while (meshStage.length > 0) {
            let mesh = meshStage.pop();
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            mesh.dispose();
        }
        meshCheck = [];
        playerPosi = [];

        let points = [], stageRange = [];
        if (istage == 0) {
            stageRange = [-6, -6, 6, 6];
            {
                for (let iy = -5; iy < 6; ++iy) {
                    for (let ix = -5; ix < 6; ++ix) {
                        // if (Math.random() < 0.1) { continue; }
                        points.push([ix, iy]);
                    }
                }
            }
            playerPosi.push(new BABYLON.Vector3(-9, 0, -9));
            playerPosi.push(new BABYLON.Vector3( 9, 0, -9));
            playerPosi.push(new BABYLON.Vector3(-9, 0,  9));
            playerPosi.push(new BABYLON.Vector3( 9, 0,  9));

        } else if (istage == 1) {
            stageRange = [-6, -6, 6, 6];
            {
                for (let iy = -5; iy < 6; ++iy) {
                    for (let ix = -5; ix < 6; ++ix) {
                        if (Math.random() < 0.5) { continue; }
                        points.push([ix, iy]);
                    }
                }
            }
            playerPosi.push(new BABYLON.Vector3(-9, 0, -9));
            playerPosi.push(new BABYLON.Vector3( 9, 0, -9));
            playerPosi.push(new BABYLON.Vector3(-9, 0,  9));
            playerPosi.push(new BABYLON.Vector3( 9, 0,  9));

        } else if (istage == 2) {
            const pointsCount = 50;
            stageRange = [-6, -6, 6, 6];
            for (let i = 0; i < pointsCount; i++) {
                points.push([Math.random() * 10 - 5, Math.random() * 10 - 5]);
            }
            playerPosi.push(new BABYLON.Vector3(-9, 0, -9));
            playerPosi.push(new BABYLON.Vector3( 9, 0, -9));
            playerPosi.push(new BABYLON.Vector3(-9, 0,  9));
            playerPosi.push(new BABYLON.Vector3( 9, 0,  9));

        }

        // ------------------------------
        // d3 で ボロノイ図を作成
        const delaunay = d3.Delaunay.from(points);
        const voronoi = delaunay.voronoi(stageRange); // 表示範囲を設定
        //
        let iloop = 0;
        for (const polygon of voronoi.cellPolygons()) {
            const pointsArray = [];
            for (const p of polygon) {
                pointsArray.push(new BABYLON.Vector3(p[0], 0, p[1]));
            }
            // 閉じるために最初の点を追加
            pointsArray.push(pointsArray[0]);
            // 領土(ボロノイ図のメッシュ
            let meshTerritory = BABYLON.MeshBuilder.ExtrudePolygon("" , {shape:pointsArray, depth:0.1}, scene);
            meshTerritory.material = new BABYLON.StandardMaterial("", scene);
            meshTerritory.material.diffuseColor = BABYLON.Color3.Gray();
            meshTerritory.material.specularColor = BABYLON.Color3.Black();
            meshTerritory.material.alpha = 0.4;
            const _meshCheck = BABYLON.MeshBuilder.CreateSphere("point", { diameter: 0.2 }, scene);
            let p = points[iloop];
            _meshCheck.position = new BABYLON.Vector3(p[0], 0, p[1]);
            _meshCheck._flag = -1;
            _meshCheck._value = 1;
            _meshCheck._territory = meshTerritory;
            meshTerritory.position.subtractInPlace(_meshCheck.position);
            meshTerritory.parent = _meshCheck;
            meshStage.push(_meshCheck);
            meshCheck.push(_meshCheck);
            ++iloop;
        }
console.log("      iloop=",iloop);
    }
    let changeFlagColor = function(mesh, iflag) {
        if (iflag == 0) {
            mesh.material.diffuseColor = BABYLON.Color3.Red();
        } else if (iflag == 1) {
            mesh.material.diffuseColor = BABYLON.Color3.Green();
        } else if (iflag == 2) {
            mesh.material.diffuseColor = BABYLON.Color3.Blue();
        } else if (iflag == 3) {
            mesh.material.diffuseColor = BABYLON.Color3.Yellow();
        } else {
            mesh.material.diffuseColor = BABYLON.Color3.White();
        }
    }
    let changeFlag = function(_meshCheck, iflag) {
        meshCheck._flag = -1;
        let meshTerritory = meshCheck._territory;
        changeFlagColor(meshTerritory, iflag);
    }

    // Player 1-4
    let playerList = [];
    let crPlayer = function() {
        playerList = [];
        for (let ilayer = 0; ilayer < 4; ++ilayer) {
            let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 0.5}, scene);
            mesh._i = ilayer;
            mesh._flag = ilayer;
            mesh._enable = 1;
            mesh.material = new BABYLON.StandardMaterial("", scene);
            changeFlagColor(mesh, ilayer);
            mesh.material.specularColor = BABYLON.Color3.Black();
            playerList.push(mesh);
        }
    }
    let resetPlayer = function() {
        for (let ilayer = 0; ilayer < 4; ++ilayer) {
            let mesh = playerList[ilayer];
            mesh.position.copyFrom(playerPosi[ilayer]);
            mesh._flag = ilayer;
            mesh._enable = true;
            mesh._actMode = "life";
//            mesh._actMode = "sleep";
            mesh._trgPlayer = null;
            mesh._trgCheck = null;
            mesh._attHP = 10;
            mesh._attHPMax = 10;
            mesh._attATK = 1;
            mesh._attAtkRng = 1;
            mesh._attAtkRngSq = 1;
            mesh.__dmg = 0;
            mesh.__knockBack = BABYLON.Vector3.Zero();
        }
        // sleep   / 停止
        // agg     / 攻撃的 / がんがんいこうぜ
        // life    / 命大事に
        // rand    / ランダム
        // playerList[0]._actMode = "sleep";
        // playerList[1]._actMode = "agg";
        // playerList[2]._actMode = "life";
        // playerList[3]._actMode = "rand";
    }

    let searchNearestCheck = function(player) {
        // 差近傍の checkを探す
        {
            // 全探査版
            let trgCheck = null, trgLenSq = Number.MAX_VALUE;
            let trgCheck0 = null, trgLenSq0 = Number.MAX_VALUE;
            for (let _meshCheck of meshCheck) {
                if (_meshCheck._flag == player._flag) {continue;}
                let lenSq = BABYLON.Vector3.DistanceSquared(player.position, _meshCheck.position);
                if (lenSq < trgLenSq) {
                    trgLenSq = lenSq;
                    trgCheck = _meshCheck;
                }
                if (_meshCheck._flag >= 0) {continue;}
                if (lenSq < trgLenSq0) {
                    trgLenSq0 = lenSq;
                    trgCheck0 = _meshCheck;
                }
            }
            if (trgCheck0 != null) {
                trgCheck = trgCheck0;
            }
            return trgCheck;
        }
    }

    let searchWeakPlayer = function(player) {
        let _trgPlayer = null, lowHP = Number.MAX_VALUE;
        for (let _player of playerList) {
            if (_player == player) {continue;}
            if (_player._enable == false) {continue;}
            if (_player._attHP < lowHP) {
                lowHP = _player._attHP;
                _trgPlayer = _player
            }
        }
        return _trgPlayer;
    }

    let fnobjlist = [];
    let fn0 = function() {
        if (--loopCount <= 0) {
            if (bCallNextStage == false) {
                bCallNextStage = true;
                console.log(" time out");
                // 勝者判定
                let iwin = -1, vHP = 0, nwin = 0;
                for (let player of playerList) {
                    if (player._enable == false) {continue;}
                    if (player._attHP == 0) {continue;}
                    if (vHP < player._attHP) {
                        vHP = player._attHP;
                        iwin = player._i;
                        nwin = 1;
                    } else if (vHP == player._attHP) {
                        ++nwin;
                    }
                }
                if (nwin == 1) {
                    console.log(" win=", iwin);
                } else if (nwin >= 2) {
                    console.log(" draw");
                }
                setNextStage()
            }
        }
        for (let player of playerList) {
            if (player._enable == false) {continue;}
            for (let _player of playerList) {
                if (player == _player) {continue;}
                if (_player._enable == false) {continue;}
                let vdir = _player.position.subtract(player.position);
                let lenSq = vdir.lengthSquared();
                if (lenSq <= player._attAtkRngSq) {
                    _player.__dmg += player._attATK;
                    vdir.normalize();
                    _player.__knockBack.addInPlace(vdir);
                }
            }
            
            // ----------
            if (player._trgPlayer != null) {
            } else if (player._trgCheck != null) {
                let vdir = player._trgCheck.position.subtract(player.position).normalize();
                vdir.y = 0;
                player.position.addInPlace(vdir.scale(0.1));
                if (player.intersectsMesh(player._trgCheck, true)) {
                    // 到達
                    if (player._trgCheck._flag >= 0) {
                        let flagOld = player._trgCheck._flag
                        playerList[flagOld]._attATK -= player._trgCheck._value;
                        playerList[flagOld]._attHPMax -= player._trgCheck._value;
                    }
                    player._trgCheck._flag = player._flag;
                    changeFlagColor(player._trgCheck._territory, player._flag);
                    player._attATK += player._trgCheck._value;
                    player._attHP += player._trgCheck._value;
                    player._attHPMax += player._trgCheck._value;
                    player._trgCheck = null;
                } else {
                    continue;
                }
            }
            if (player._actMode == "sleep") {
                // 何もしない
            } else if (player._actMode == "agg") {
                player._trgPlayer = searchWeakPlayer(player);
                if (player._trgPlayer == null || player.attHP < player._trgPlayer.attHP) {
                    // 相手が自身よりHPが多い..敵・中立領土を探す
                    player._trgPlayer = null;
                    player._trgCheck = searchNearestCheck(player);
                }
            } else if (player._actMode == "life") {
                // 敵・中立領土を探す
                player._trgCheck = searchNearestCheck(player);
                if (player._trgCheck == null) {
                    // 領土がないので、他プレイヤを探す
                    player._trgPlayer = searchWeakPlayer(player);
                }
            } else if (player._actMode == "rand") {
            } else {
                console.log(" actMode=", player._actMode, ", i=", player._i)
            }
        }
        // ダメージを反映
        for (let player of playerList) {
            if (player._enable == false) {continue;}
            if (player.__dmg > 0) {
                player._attHP = Math.max(player._attHP - player.__dmg, 0);
                player.position.addInPlace(player.__knockBack);
                player.__dmg = 0;
                player.__knockBack.set(0,0,0);
                player._trgCheck = searchNearestCheck(player);
            }
        }
        let nEnable = 0, iwin = -1;
        for (let player of playerList) {
            if (player._enable == false) {continue;}
            if (player._attHP == 0) {
                player._actMode = "sleep";
                player._enable = false;
            }
            iwin = player._i;
            ++nEnable;
        }
        if (nEnable <= 1) {
            // 勝者判定
            if (nEnable == 1) {
                console.log(" win=", iwin);
            } else if (nEnable == 0) {
                console.log(" draw");
            }
            if (bCallNextStage == false) {
                bCallNextStage = true;
                setNextStage()
            }
        }
    }

    // 終了時判定
    let bCallNextStage = false;

    // 終了時の処理
    let nextStage = function() {
        bCallNextStage = false;
        if (++istage == nstage) { istage = 0; }
        createStage();
        resetPlayer();
    }
    // 3秒後に resetCourse() を呼び出す
    let setNextStage = function() {
        setTimeout(nextStage, 3000);
    }

    // ------------------------------
    crPlayer();
    
    let istage = 2, nstage = 3;
    createStage();
    resetPlayer();

    let fnobj = scene.onBeforeRenderObservable.add(fn0);
    fnobjlist.push(fnobj);

    return scene;
};

// ######################################################################


// export var createScene = createScene_test_2001; // ボロノイ図：grid＋ランダム(SS用）
export var createScene = createScene_test_2003;

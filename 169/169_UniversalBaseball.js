// ユニバーサル野球
//
// space .. バットをふる
// enter .. バットをかまえる

// ######################################################################

// let fpathGrass = "textures/grass.jpg";
// let fpathGround = "textures/ground.jpg";

let fpathGrass = "../065/textures/grass.jpg";
let fpathGround = "textures/ground.jpg";


export var createScene_test_2012 = async function () {
    var scene = new BABYLON.Scene(engine);

    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 15, new BABYLON.Vector3(0, 0, 0));
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        return _camera;
    }
    camera = crCameraDef();

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    let crGrnd = function(size=120) {
        // 平面地面
        let mesh = BABYLON.MeshBuilder.CreateGround("ground", {width: size, height: size}, scene);
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        // mesh.position.y = -1;
        mesh.position.set(60-10, -1, 60-10);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
        return mesh;
    }
    // crGrnd(200);
    let meshGrnd = crGrnd();

    let R45 = Math.PI/4;
    let R90 = Math.PI/2;
    let R180 = Math.PI;
    let R225 = Math.PI*5/4;
    const sqrt2 = Math.sqrt(2), sqrt2_ = sqrt2/2;

    await BABYLON.InitializeCSG2Async();


    let playGround = function() {
        // 球場の作成
        {
            let mesh = BABYLON.MeshBuilder.CreateDisc("", {radius:70, tessellation:128, arc:0.25});
            mesh.rotation.x = R90;
            mesh.position.y = 0.02;
            mesh.material = new BABYLON.StandardMaterial("", scene);
	    mesh.material.diffuseTexture = new BABYLON.Texture(fpathGround);
            mesh.material.diffuseTexture.uScale = 20;
            mesh.material.diffuseTexture.vScale = 20;
            mesh.material.specularColor = BABYLON.Color3.Black();
        }
        {
            // １塁、２塁、３塁
            let s = 2;
            let xzlist = [[36,0],
                          [36,36],
                          [0,36],
                          ];
            for (let [x,z] of xzlist) {
                let mesh = BABYLON.MeshBuilder.CreateGround("", {width:s, height:s}, scene);
                mesh.position.set(x, 0.04, z);
                mesh.material = new BABYLON.StandardMaterial("", scene);
                mesh.material.specularColor = BABYLON.Color3.Black();
            }
        }
        {
            // バッターボックス
            let s1w = 0.8, s1h = 2, s=0.7;
            let xzlist = [[s,-s],
                          [-s,s],
                          ];
            for (let [x,z] of xzlist) {
                let mesh = BABYLON.MeshBuilder.CreateGround("", {width:s1w, height:s1h}, scene);
                mesh.position.set(x, 0.04, z);
                mesh.rotation.y = R45;
                mesh.material = new BABYLON.StandardMaterial("", scene);
                mesh.material.specularColor = BABYLON.Color3.Black();
            }
        }
        {
            // ホームベース
            let adjx = 0.7, adjz = 0.7, y = 0, s1=0.6, s2=0.3;
            let shape = [
                new BABYLON.Vector3(-s1, y, -s1),
                new BABYLON.Vector3(  0, y, -s1),
                new BABYLON.Vector3( s2, y, s2-s1),
                new BABYLON.Vector3( s2-s1, y, s2),
                new BABYLON.Vector3(-s1, y,   0),
            ];
            let mesh = BABYLON.MeshBuilder.CreatePolygon("polygon", {shape:shape });
            mesh.position.set(adjx, 0.04, adjz);
            // mesh.rotation.y = R45;
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.material.specularColor = BABYLON.Color3.Black();
        }
        {
            // ピッチャーマウンド
            let mesh = BABYLON.MeshBuilder.CreateDisc("", {radius:3});
            mesh.position.set(18, 0.04, 18);
            mesh.rotation.x = R90;
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.material.alpha = 0.8;
            mesh.material.specularColor = BABYLON.Color3.Black();
        }

        {
            let meshBase = BABYLON.MeshBuilder.CreateBox("", {width:102, heigth:1, depth:102});
            meshBase.position.set(51-2, -0.5, 51-2);
            meshBase.material = new BABYLON.StandardMaterial("", scene);
	    meshBase.material.diffuseTexture = new BABYLON.Texture(fpathGrass);
            meshBase.material.diffuseTexture.uScale = 10;
            meshBase.material.diffuseTexture.vScale = 10;
            meshBase.material.specularColor = BABYLON.Color3.Black();
            let csgBase = BABYLON.CSG2.FromMesh(meshBase);
            //             1BH             2BH              3BH
            let xzlist = [[40,8], [8,40], [53,33], [33,53], [90,25], [65,65], [25,90]];
            for (let [x,z] of xzlist) {
                const meshCatcher = BABYLON.MeshBuilder.CreateCylinder("", {diameter:6, height:2,},scene,);
                meshCatcher.position.set(x, -0.5, z);
                const csgCatcher = BABYLON.CSG2.FromMesh(meshCatcher);
                csgBase = csgBase.subtract(csgCatcher);
                meshCatcher.dispose();
            }
            // 最奥のカット用
            {
                let meshCatcher = BABYLON.MeshBuilder.CreateBox("", {width:100, heigth:2, depth:40*sqrt2},);
                meshCatcher.position.set(100, -0.5, 100);
                meshCatcher.rotation.y = R45;
                const csgCatcher = BABYLON.CSG2.FromMesh(meshCatcher);
                csgBase = csgBase.subtract(csgCatcher);
                meshCatcher.dispose();
            }
            let mesh = csgBase.toMesh("", scene);
            mesh.position.set(51-2, -0.5, 51-2);
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
            meshBase.dispose();
            // ホール（内野・外野）のカバー
            let xzrstatelist = [[40,8, -R90,"OUT"], [8,40, R180,"OUT"], [53,33, R225,"OUT"], [33,53,R225,"OUT"], [90,25,-R90,"1BH"], [65,65,R225,"1BH"], [25,90,R180,"1BH"]];
            for (let [x,z,r,state] of xzrstatelist) {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter:6, arc:0.25, sideOrientation:BABYLON.Mesh.DOUBLESIDE }, scene);
                mesh.position.set(x, -0.5, z);
                mesh.rotation.y = r;
                mesh.rotation.z = R90;
                if (state == "OUT") {
                    mesh.material = new BABYLON.StandardMaterial("", scene);
                    mesh.material.emissiveColor = BABYLON.Color3.Red();
                } else {
                    mesh.material = new BABYLON.StandardMaterial("", scene);
                    mesh.material.emissiveColor = BABYLON.Color3.Blue();
                }
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
            }
            // 場外・フェンスのカバー
            let sxzrlist = [[10,100,5, -R90, "OUT"],
                            [10,100,15, -R90, "1BH"],
                            [10,100,25, -R90, "OUT"],
                            [10,100,35, -R90, "2BH"],
                            [10,100,45, -R90, "OUT"],
                            [10,100,55, -R90, "3BH"],
                            [10,5,100, R180, "OUT"],
                            [10,15,100, R180, "1BH"],
                            [10,25,100, R180, "OUT"],
                            [10,35,100, R180, "2BH"],
                            [10,45,100, R180, "OUT"],
                            [10,55,100, R180, "3BH"],
                            [40*sqrt2,80,80, R225, "HR"],];
            for (let [s,x,z,r,state] of sxzrlist) {
                let mesh = BABYLON.MeshBuilder.CreateCylinder("", {height:s, diameter:6, arc:0.25, tessellation:4, sideOrientation:BABYLON.Mesh.DOUBLESIDE});
                mesh.position.set(x, -0.5, z);
                mesh.rotation.y = r;
                mesh.rotation.z = R90;
                if (state == "OUT") {
                    mesh.material = new BABYLON.StandardMaterial("", scene);
                    mesh.material.emissiveColor = BABYLON.Color3.Red();
                } else {
                    mesh.material = new BABYLON.StandardMaterial("", scene);
                    mesh.material.emissiveColor = BABYLON.Color3.Blue();
                }
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
            }
        }
        
    }
    playGround();

    let crBall = function(posi) {
        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1 }, scene);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass:0.5}, scene);
        mesh.physicsBody.disablePreStep = false;
        mesh._r = 0.4;
        mesh._rad = 0.0;
        mesh._radstep = 0.1;
        mesh._state = "standby";
        mesh._flyloop = 0;
        return mesh;
    }
    let ballRestPC = function(mesh) {
        mesh._pc = BABYLON.Vector3.Random(-0.1, 0.1);
        mesh._pc.y = 0;
    }
    let ballRestPini = function(mesh) {
        meshBall.position.copyFrom(mesh._pc.add(new BABYLON.Vector3(0, 0.4, 0)));
    }
    let meshBall = crBall(new BABYLON.Vector3(0, 0.9, 0));
    ballRestPC(meshBall);
    ballRestPini(meshBall);

    let crBatR = function(posi) {
        // 右バッター
        let meshAnch = null;
        {
            // アンカー用メッシュ
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.2, height:0.2, depth:0.2}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Green();
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:0}, scene);
            mesh.physicsBody.disablePreStep = false;
            mesh.position.copyFrom(posi);
            meshAnch = mesh
        }
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.2, height:0.2, depth:2.3});
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 1}, scene);
        mesh.physicsBody.disablePreStep = false;
        let p1 = posi.add(new BABYLON.Vector3(0, 0, -1.5));
        mesh.position.copyFrom(p1);
        mesh.rotation.x = -R90;
        mesh._type = "R";
        mesh._p0 = posi;
        mesh._pini = p1;
        {
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 0, 1.5),
                new BABYLON.Vector3(0, 1, 0),
                new BABYLON.Vector3(0, 1, 0),
                scene
            );
            meshAnch._agg.body.addConstraint(mesh._agg.body, hinge);
        }

        return mesh;
    }
    let myMesh = crBatR(new BABYLON.Vector3(1.0, 0.5, -1.0));

    var map ={}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
        map['shift'] = evt.sourceEvent.shiftKey;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
        map['shift'] = evt.sourceEvent.shiftKey;
    }));
    let cooltime_act = 0, cooltime_actIni = 20;
    let keyAction = {spc:0, enter:0};
    scene.registerAfterRender(function() {
        // keyAction.spc = false;
        if (map[" "]) {
            keyAction.spc = true;
        }
        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["Enter"]) {
                cooltime_act = cooltime_actIni;
                keyAction.enter = true;
                myMesh._update = 0;
            }
        }
    });

    let fnUpdateMyMesh = function() {
        if (keyAction.enter) {
            // reset
            if (myMesh._type == "R") {
                // 所定の位置まで力を加えて回転させる
                myMesh._update++;
                if (myMesh._update <= 1000) {
                    let vb = myMesh.position.subtract(myMesh._p0).normalize();
                    const angle = Math.atan2(vb.x, vb.z) *180/R180;
                    if (angle < 135) {
                        // 角度（向きが正しくなければ、回転させる
                        let vn = BABYLON.Vector3.Up().cross(vb).normalize();
                        myMesh.physicsBody.applyForce(vn.scale(300), myMesh.absolutePosition);
                    } else {
                        // 所定の角度(4時～６時の範囲）
                        myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
                        myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                        keyAction.enter = false;
                    }
                } else {
                    // 無限ループ対策
                    myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
                    myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                    keyAction.enter = false;
                }
            } else {
            }
        }
        if (keyAction.spc) {
            // swing
            keyAction.spc = false;
            if (myMesh._type == "R") {
                let vb = myMesh.position.subtract(myMesh._p0).normalize();
                let vn = BABYLON.Vector3.Up().cross(vb).normalize();
                myMesh.physicsBody.applyForce(vn.scale(5000), myMesh.absolutePosition);
            } else {
            }
        }

    };

    let fnobj01 = scene.onBeforeRenderObservable.add(fnUpdateMyMesh);

    let fnUpdateBall = function() {
        if (meshBall._state == "standby") {
            let distSQ = BABYLON.Vector3.DistanceSquared(meshBall.position, meshBall._pc);
            if (distSQ < 0.5) {
                meshBall._rad += meshBall._radstep;
                let x = meshBall._r * Math.cos(meshBall._rad);
                let y = 0.5;
                let z = meshBall._r * Math.sin(meshBall._rad);
                meshBall.position.set(x,y,z);
                meshBall.position.addInPlace(meshBall._pc);
            } else {
                meshBall._state = "fly";
                meshBall._flyloop = 0;
                keyAction.enter = true;
                myMesh._update = 0;
            }
        } else if (meshBall._state == "fly") {
            let state = "";
            if (meshBall.position.y < -0.5) {
                if (meshBall.position.x < 0 || meshBall.position.z < 0) {
                    // ファール
                    state = "FOUL";
                } else if (meshBall.position.x >= 100 || meshBall.position.z >= 100 || (meshBall.position.x + meshBall.position.z) >= 160) {
                    // 場外フェンス
                    state = "_out";
                    let iv2state = {
                        0:"OUT",
                        1:"1BH",
                        2:"OUT",
                        3:"2BH",
                        4:"OUT",
                        5:"3BH",
                    }
                    if ((meshBall.position.x + meshBall.position.z) >= 160) {
                        state = "HR";
                    } else if (meshBall.position.x >= 100) {
                        let iv = Math.floor(meshBall.position.z / 10);
                        state = iv2state[iv];
                    } else if (meshBall.position.z >= 100) {
                        let iv = Math.floor(meshBall.position.x / 10);
                        state = iv2state[iv];
                    }
                } else {
                    // 内野、外野判定
                    state = "non";
                    let xzstatelist = [[40,8, "OUT"], [8,40, "OUT"], [53,33, "OUT"], [33,53, "OUT"], [90,25, "1BH"], [65,65, "1BH"], [25,90, "1BH"]];
                    for (let [x,z,state_] of xzstatelist) {
                        let dx = x - meshBall.position.x;
                        let dz = z - meshBall.position.z;
                        let rsq = dx**2 + dz**2;
                        if (rsq < 50) {
                            state = state_;
                            break;
                        }
                    }

                }
            }
            if (++meshBall._flyloop >= 400) {
                if (meshBall.position.x < 0 || meshBall.position.z < 0) {
                    // ファール
                    state = "FOUL";
                } else {
                    // hit 相当にする
                    state = "1BH";
                }
            }

            if (state != "") {
// console.log("judge=",state);
                addJudge(state);
                // 場外..位置をリセット
                meshBall.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
                meshBall.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                meshBall._rad = 0;
                meshBall._state = "standby";
                ballRestPC(meshBall);
                ballRestPini(meshBall);
            }
        }
    }
    let fnobj02 = scene.onBeforeRenderObservable.add(fnUpdateBall);

    let scoreTurn = 0; // 0: 先行, 1:後攻
    let scoreCount = {out:0, base:[0,0,0]}; // アウトカウント, ベース毎の選手有無(0:無, 1:在)
    let scoreInning = 1; // イニング
    let scoreInningMax = 3; // イニング
    let scoreCur = [0,0]; // カレント
    let scoreList = [[0,0,0],
                     [0,0,0]];
    let addJudge = function(judge) {
        console.log("addJudge(judge=",judge);
        if (judge == "FOUL") {
            console.log(".. ファール (skip)");
            setText2("ファール!");
            return;
        } else if (judge == "OUT") {
            scoreCount.out += 1;
            if (scoreCount.out >= 3) {
                // ３アウト、チェンジ
                console.log(".. ３アウト、チェンジ");
                setText2("３アウト、チェンジ!!");
                if (scoreTurn) {
                    // 後攻が終了時
                    console.log(".. 後攻が終了時");
                    scoreList[scoreTurn][scoreInning-1] = scoreCur[scoreTurn];
                    // scoreList.push(scoreCur);
                    scoreTurn = 0;
                    scoreCur = [0,0];
                    if (scoreInning == scoreInningMax) {
                        // ゲームセット
                        console.log(".. ゲームセット");
                        // setText2("ゲームセット");
                        for (let iturn = 0; iturn < 2; ++iturn) {
                            for (let ininng = 0; ininng < scoreInningMax; ++ininng) {
                                scoreCur[iturn] += scoreList[iturn][ininng]
                            }
                        }
                        setText2("ゲームセット  " + scoreCur[0] + " vs " + scoreCur[1], 10);
                        return;
                    }
                    ++scoreInning;
                } else {
                    scoreList[scoreTurn][scoreInning-1] = scoreCur[scoreTurn];
                    scoreTurn = 1;
                }
                scoreCount = {out:0, base:[0,0,0]};
            } else {
                setText2("アウト");
            }
        } else if (judge == "1BH") {
            scoreCount.base.push(1);
            setText2("１ＢＨ");
        } else if (judge == "2BH") {
            scoreCount.base.push(1);
            scoreCount.base.push(0);
            setText2("２ＢＨ");
        } else if (judge == "3BH") {
            scoreCount.base.push(1);
            scoreCount.base.push(0);
            scoreCount.base.push(0);
            setText2("３ＢＨ");
        } else if (judge == "HR") {
            scoreCount.base.push(1);
            scoreCount.base.push(0);
            scoreCount.base.push(0);
            scoreCount.base.push(0);
            setText2("ホームラン!!");
        }
        {
            while (scoreCount.base.length >= 4) {
                let v = scoreCount.base.shift();
                if (v) {
                    // 点を追加
                    ++scoreCur[scoreTurn];
                }
            }
        }
            console.log(".. OUT:", scoreCount.out, " p:",scoreCur[scoreTurn], " base:",scoreCount.base);
            console.log(".. score:", scoreList);
    }

    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // ------------------------------
    // メッセージ（数秒後にフェードアウト）
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Ready!";
    text2.color = "white";
    text2.fontSize = 24;
    text2.height = "36px";
    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
//    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text2);
    let clearText2 = function() {
        text2.text = "";
    }
    let setText2 = function(val, delay=2) {
        text2.text = "" + val;
        setTimeout(clearText2, delay*1000); // 2[sec]
    }

    // setText1(0);
    setText2("ゲーム開始");


    // // デバッグ表示(debug)
    // if (0) {
    // var viewer = new BABYLON.PhysicsViewer();
    // scene.meshes.forEach((mesh) => {
    //     if (mesh.physicsBody) {
    //         viewer.showBody(mesh.physicsBody);
    //     }
    // });
    // }

    return scene;
};

// ######################################################################

 export var createScene = createScene_test_2012;

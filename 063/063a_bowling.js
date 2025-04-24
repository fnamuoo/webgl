// ボーリング
//
// キー操作
//    w,s,a,d := 玉を回転
//    spc     := ジャンプ
//    n       := 次のステージ
//    h       := usage表示切替
const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // 物理エンジンを有効にする
    // const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    const gravityVector = new BABYLON.Vector3(0, -1.5, 0);
    const physicsPlugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    let camera;
    if (1) {
    camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(0, 4, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    }

    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // 地面を設定する
    let istate = 0, nstate = 5;
    let groundMeshList = [], groundAggregateList = [];
    function createGround() {
        for (let groundAggregate of groundAggregateList) {
            if (groundAggregate) groundAggregate.dispose();
        }
        for (let groundMesh of groundMeshList) {
            if (groundMesh) groundMesh.dispose();
        }
        groundMeshList = [], groundAggregateList = [];
        if (istate == 0) {
            // ノーマルなステージ
            let groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 100 }, scene);
            groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
            groundMesh.material.majorUnitFrequency = 1;
            groundMesh.material.minorUnitVisibility  = 0;
            // 地面に摩擦係数、反射係数を設定する
            let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution:0.001}, scene);
            groundMeshList.push(groundMesh);
            groundAggregateList.push(groundAggregate);

        } else if (istate == 1) {
            // 中央に障害のあるステージ
            let groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 100 }, scene);
            let groundMesh1 = BABYLON.MeshBuilder.CreateBox("ground", { width: 5, height: 5, length: 2 }, scene);
            groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
            groundMesh.material.majorUnitFrequency = 1;
            groundMesh.material.minorUnitVisibility  = 0;
            // 地面に摩擦係数、反射係数を設定する
            let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution:0.001}, scene);
            let groundAggregate1 = new BABYLON.PhysicsAggregate(groundMesh1, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution:0.001}, scene);
            groundMeshList.push(groundMesh);
            groundMeshList.push(groundMesh1);
            groundAggregateList.push(groundAggregate);
            groundAggregateList.push(groundAggregate1);

        } else if (istate == 2) {
            // ジャンプのあるステージ
            let groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 100 }, scene);
            groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
            groundMesh.material.majorUnitFrequency = 1;
            groundMesh.material.minorUnitVisibility  = 0;
            let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution:0.001}, scene);
            let rootPath = [];
            let nminX = -20, nmaxX = 21, gridsize = 0.5, rad = 0.2;
            let nminZ = -40, nmaxZ = 41;
            for (let iz = nminZ; iz < nmaxZ; ++iz) {
                let z = iz*gridsize;
                let path = []
                for (let ix = nminX; ix < nmaxX; ++ix) {
                    let x = ix*gridsize;
                    path.push(new BABYLON.Vector3(x, 2/(1+Math.abs(iz)), z));
                }
                rootPath.push(path);
            }
            let groundMesh1 = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            let groundAggregate1 = new BABYLON.PhysicsAggregate(groundMesh1, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.05}, scene);
            groundMeshList.push(groundMesh);
            groundMeshList.push(groundMesh1);
            groundAggregateList.push(groundAggregate);
            groundAggregateList.push(groundAggregate1);

        } else if (istate == 3) {
            // 中央に山のあるステージ
            let groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 100 }, scene);
            groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
            groundMesh.material.majorUnitFrequency = 1;
            groundMesh.material.minorUnitVisibility  = 0;
            let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution:0.001}, scene);
            let rootPath = [];
            let nminX = -20, nmaxX = 21, gridsize = 0.5, rad = 0.2;
            let nminZ = -40, nmaxZ = 41;
            for (let iz = nminZ; iz < nmaxZ; ++iz) {
                let z = iz*gridsize;
                let path = []
                for (let ix = nminX; ix < nmaxX; ++ix) {
                    let x = ix*gridsize;
                    path.push(new BABYLON.Vector3(x, (Math.cos(ix*rad)+Math.cos(iz*rad))/(1+Math.abs(iz)), z));
                }
                rootPath.push(path);
            }
            let groundMesh1 = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            let groundAggregate1 = new BABYLON.PhysicsAggregate(groundMesh1, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.05}, scene);
            groundMeshList.push(groundMesh);
            groundMeshList.push(groundMesh1);
            groundAggregateList.push(groundAggregate);
            groundAggregateList.push(groundAggregate1);

        } else if (istate == 4) {
            // チューブのステージ
            let groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 100 }, scene);
            groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
            groundMesh.material.majorUnitFrequency = 1;
            groundMesh.material.minorUnitVisibility  = 0;
            let groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution:0.001}, scene);

            let adjy = 1.2, x = 0, y = 0, z = 0;
            let myPath = [];
            let rstep = Math.PI/36; // 5degree / 18:90[deg]
            let r45 = Math.PI/4, r90 = Math.PI/2, irad;
            for (let i = 0; i < 54; ++i) {
                irad = i * rstep;
                x = 10*(1-Math.cos(irad)); y = i*0.1 + adjy; z = -30 + 10*Math.sin(irad);
                myPath.push(new BABYLON.Vector3(x, y, z));
            }
            for (let i = 54; i < 72; ++i) {
                irad = i * rstep;
                x = 10*(1-Math.cos(irad)); y = 5.4 + adjy; z = -30 + 10*Math.sin(irad);
                myPath.push(new BABYLON.Vector3(x, y, z));
            }
            for (let i = 0; i < 18; ++i) {
                irad = i * rstep;
                x = 10*(Math.cos(irad)-1); y = 5.4 + adjy; z = -12 + 10*Math.sin(irad);
                myPath.push(new BABYLON.Vector3(x, y, z));
            }
            for (let i = 18; i < 72; ++i) {
                irad = i * rstep;
                x = 10*(Math.cos(irad)-1); y = 7.2 -i*0.1 + adjy; z = -12 + 10*Math.sin(irad);
                myPath.push(new BABYLON.Vector3(x, y, z));
            }
            let groundMesh1 = BABYLON.MeshBuilder.CreateTube("tube", {path: myPath, radius: 2, sideOrientation: BABYLON.Mesh.DOUBLESIDE, tessellation: 6}, scene);
            let groundAggregate1 = new BABYLON.PhysicsAggregate(groundMesh1, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
            groundMesh1.material = new BABYLON.StandardMaterial('mat', scene);
	    groundMesh1.material.diffuseColor = BABYLON.Color3.Blue();
	    groundMesh1.material.alpha = 0.4;

            groundMeshList.push(groundMesh);
            groundMeshList.push(groundMesh1);
            groundAggregateList.push(groundAggregate);
            groundAggregateList.push(groundAggregate1);
        }
    }
    createGround();


    function createBall() {
        let trgMesh, trgAgg;
        trgMesh = BABYLON.MeshBuilder.CreateSphere("target", { diameter: 2, segments: 8 }, scene);
        // trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, restitution:0.05}, scene);
        trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 10, friction: 0.9, restitution:0.05}, scene);
        return [trgMesh, trgAgg];
    }

    function createPin() {
        let trgMesh, trgAgg;
        // 旋盤 で形作る
        if (1) {
            const myShape = [
                new BABYLON.Vector3(0   , 0   , 0),
                new BABYLON.Vector3(0.4 , 0   , 0),
                new BABYLON.Vector3(0.45, 0.45, 0),
                new BABYLON.Vector3(0.45, 1.7 , 0),
                new BABYLON.Vector3(0.25, 2.0 , 0),
                new BABYLON.Vector3(0.20, 2.6 , 0),
                new BABYLON.Vector3(0.15, 2.8 , 0),
                new BABYLON.Vector3(0.10, 2.9 , 0),
                new BABYLON.Vector3(0.05, 2.98, 0),
                new BABYLON.Vector3(0   , 3.  , 0)
            ];
            trgMesh = BABYLON.MeshBuilder.CreateLathe("target", {shape: myShape});
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, friction: 0.1, restitution:0.05}, scene);
        }

        return [trgMesh, trgAgg];
    }

    let [myMesh, myAgg]  = createBall();
    let mat = new BABYLON.StandardMaterial("mat", scene);
    mat.emissiveColor = BABYLON.Color3.Red();
    myMesh.material = mat;
    camera.lockedTarget = myMesh;

    function initMyBall() {
        myMesh.physicsBody.disablePreStep = true;
        myMesh.position = new BABYLON.Vector3(0, 3, -48);
        myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
        myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
        myMesh.physicsBody.disablePreStep = false;
    }
    initMyBall();

    let pinlist = [];
    {
        for (let i = 0; i < 10; ++i) {
            let [pinMesh, pinAgg] = createPin();
            pinlist.push(pinMesh);
        }
    }

    function initPin() {
        let px = 0, py = 0, pz = 0, adjx = 0, adjy = 1.5, adjz = 40, padx = 2.0, padz = 2.0, iobj = 0;
        py = adjy;
        for (let i = 0; i < 4; ++i) {
            pz = adjz + i*padx
            for (let j = 0; j < i+1; ++j) {
                let pinMesh  = pinlist[iobj];
                ++iobj;
                px = -i*padx/2 + j*padx
                pinMesh.physicsBody.disablePreStep = true;
                pinMesh.position = new BABYLON.Vector3(px, py, pz);
                pinMesh.rotation = new BABYLON.Vector3(0, 0, 0);
                pinMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
                pinMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
                pinMesh.physicsBody.disablePreStep = false;
            }
        }
    }

    function resetStage() {
        initMyBall();
        initPin();
    }
    resetStage();


    // デバッグ表示(物理メッシュ／白線表示)
    if (0) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }
    if (0) {
        physicsViewer = new BABYLON.Debug.PhysicsViewer();
        for (const mesh of scene.rootNodes) {
            if (mesh.physicsBody) {
                const debugMesh = physicsViewer.showBody(mesh.physicsBody);
            }
        }
    }


    // https://www.crossroad-tech.com/entry/babylonjs-translate-keyinput
    var map ={}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"; 
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    let cooltime_act = 0, cooltime_actIni = 30, vforce = 300;
    scene.registerAfterRender(function() {	
        if (map["w"] || map["ArrowUp"]) {
            let vdir = new BABYLON.Vector3(vforce ,0, 0);
            myMesh.physicsBody.applyAngularImpulse(vdir);
        } else if (map["s"] || map["ArrowDown"]) {
            let vdir = new BABYLON.Vector3(-vforce ,0, 0);
            myMesh.physicsBody.applyAngularImpulse(vdir);
        }

        if (map["a"] || map["ArrowLeft"]) {
            let vdir = new BABYLON.Vector3(0 ,0, vforce);
            myMesh.physicsBody.applyAngularImpulse(vdir);
        } else if (map["d"] || map["ArrowRight"]) {
            let vdir = new BABYLON.Vector3(0 ,0, -vforce);
            myMesh.physicsBody.applyAngularImpulse(vdir);
        }

        if (map[" "]) {
            let vdir = new BABYLON.Vector3(0 ,vforce, 0);
            myAgg.body.applyForce(vdir, myMesh.absolutePosition);
        }

        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["r"]) {
                cooltime_act = cooltime_actIni;
                resetStage();
            } else if (map["n"]) {
                cooltime_act = cooltime_actIni;
                istate = (istate+1) % nstate;
                createGround();
                resetStage();
            } else if (map["h"]) {
                cooltime_act = cooltime_actIni;
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
        }

        if (myMesh.position.y < -20) {
            let bStageClear = true;
            for (let pinmesh of pinlist) {
                if (pinmesh.position.y >= 0) {
                    bStageClear = false;
                    break;
                }
            }
            if (bStageClear) {
                cooltime_act = cooltime_actIni;
                istate = (istate+1) % nstate;
                createGround();
                resetStage();
            } else {
                initMyBall();
            }
        }
    });


    // 左上に使い方（操作方法）を表示
    //   キー操作(h)で表示のon/offを切り替え(上記で)
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "180px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n(W,S,A,F): acc rot\nSPC: jump\nR: reset stage\nN: next stage\nH: show/hide this message";
    text1.color = "white";
    text1.width = "320px";
    text1.fontSize = 24;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return scene;
};


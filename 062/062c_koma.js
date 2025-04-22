// コマ
//
// キー操作
//    spc := リセット

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // 物理エンジンを有効にする
    // const gravityVector = new BABYLON.Vector3(0, -9.81, 0); // 重力
    const gravityVector = new BABYLON.Vector3(0, -30, 0);
    const physicsPlugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(2, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    if (0) {
        // 平板の地面を設定する
        // const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 30, height: 30 }, scene);
        groundMesh.position.y = -2;
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 1;
        groundMesh.material.minorUnitVisibility  = 0;
        // 地面に摩擦係数、反射係数を設定する
        var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution:0.001}, scene);
    }

    if (1) {
        // Box(板)で簡易の傾斜をつくってみる
        let groundMesh,groundAggregate;
        let mat = new BABYLON.GridMaterial("groundMaterial", scene);
        mat.majorUnitFrequency = 1;
        mat.minorUnitVisibility  = 0;
        {
            // 底
            groundMesh = BABYLON.MeshBuilder.CreateBox("ground", { width: 6, height: 0.2, depth: 6 }, scene);
            groundMesh.position.y = -2;
            groundMesh.material = mat;
            groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution:0.001}, scene);
        }
        {
            // 正面奥
            groundMesh = BABYLON.MeshBuilder.CreateBox("ground", { width: 12, height: 0.2, depth: 4 }, scene);
            groundMesh.position.z = 4.1;
            groundMesh.position.y = -1.6;
            groundMesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(-0.3, 0, 0);
            groundMesh.material = mat;
            groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution:0.001}, scene);
        }
        {
            // 右手
            groundMesh = BABYLON.MeshBuilder.CreateBox("ground", { width: 4, height: 0.2, depth: 12 }, scene);
            groundMesh.position.x = 4.1;
            groundMesh.position.y = -1.6;
            groundMesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, 0.3);
            groundMesh.material = mat;
            groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution:0.001}, scene);
        }
        {
            // 正面手前
            groundMesh = BABYLON.MeshBuilder.CreateBox("ground", { width: 12, height: 0.2, depth: 4 }, scene);
            groundMesh.position.z = -4.1;
            groundMesh.position.y = -1.6;
            groundMesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0.3, 0, 0);
            groundMesh.material = mat;
            groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution:0.001}, scene);
        }
        {
            // 左手
            groundMesh = BABYLON.MeshBuilder.CreateBox("ground", { width: 4, height: 0.2, depth: 12 }, scene);
            groundMesh.position.x = -4.1;
            groundMesh.position.y = -1.6;
            groundMesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, 0, -0.3);
            groundMesh.material = mat;
            groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution:0.001}, scene);
        }
    }

    if (0) {
        // 床にゆるやかな傾斜を作ってみたけど、コマが跳ねるのはなぜ？PhysicsShapeType.MESH のせいっぽい
        let rootPath = [];
        let nmin = -20, nmax = 21, gridsize = 0.3, rrad = 0.5, amp=0.5;
        for (let iz = nmin; iz < nmax; ++iz) {
            let z = iz*gridsize;
            let path = []
            for (let ix = nmin; ix < nmax; ++ix) {
                let x = ix*gridsize;
                path.push(new BABYLON.Vector3(x, 2*amp-(Math.cos(x*rrad)+Math.cos(z*rrad))*amp, z));
            }
            rootPath.push(path);
        }
        groundMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        groundAgg = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, friction: 0.6, restitution:0.001}, scene);
    }

    // ////////////////////////////////////////////////////////////

    function createKoma() {
        let trgMesh, trgAgg;
        if (0) {
            // 動作確認の球
            trgMesh = BABYLON.MeshBuilder.CreateSphere("target", { diameter: 2, segments: 8 }, scene);
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 100, restitution:0.05}, scene);
        }

        // cylinder でコマを形作る
        if (0) {
            trgMesh = BABYLON.MeshBuilder.CreateCylinder("target",
                                                         { height: 1, // def 2
                                                           diameter: 2,
                                                           tessellation: 8, // def 24
                                                           diameterBottom: 0.0, // def 1
                                                         }, scene);
            // ぶつかり方がまだ少し不自然、ほんの少し離れたところでぶつかっている。
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 100, friction: 0.6, restitution:0.05}, scene);
            // // ぶつかり方が不自然、離れたところでぶつかっている。
            // trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 100, restitution:0.05}, scene);
            // // ぶつかり方がお上品。傾かない。
            // trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.CYLINDER, { mass: 100, restitution:0.05}, scene);
            // // ぶつかり方がお上品、ぶつかってもそっと押し出す感じ
            // trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 100, restitution:0.05}, scene);
            // // ぶつかり方がmeshに近い、ちょっと離れたところでぶつかっている。
            // trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 100, restitution:0.05}, scene);
        }

        // 旋盤 でコマを形作る
        if (1) {
            const myShape = [
                new BABYLON.Vector3(0   , 0  , 0),
                new BABYLON.Vector3(0.02, 0.8, 0),
                new BABYLON.Vector3(0.9 , 0.9, 0),
                new BABYLON.Vector3(1   , 1.3, 0),
                new BABYLON.Vector3(0   , 1.5, 0)
            ];
            trgMesh = BABYLON.MeshBuilder.CreateLathe("target", {shape: myShape});
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 100, friction: 0.6, restitution:0.05}, scene);
        }

        return [trgMesh, trgAgg];
    }

    let komaMesh = [], komaAgg = [];
    // 左
    let trgMesh, trgAgg;
    [trgMesh, trgAgg]  = createKoma();
    komaMesh.push(trgMesh);
    komaAgg.push(trgAgg);
    {
        trgMesh.material = new BABYLON.StandardMaterial("mat", scene);
        trgMesh.material.emissiveColor = BABYLON.Color3.Red();
    }

    // 真ん中
    [trgMesh, trgAgg]  = createKoma();
    komaMesh.push(trgMesh);
    komaAgg.push(trgAgg);
    {
        trgMesh.material = new BABYLON.StandardMaterial("mat", scene);
        trgMesh.material.emissiveColor = BABYLON.Color3.Green();
    }

    // 右
    [trgMesh, trgAgg]  = createKoma();
    komaMesh.push(trgMesh);
    komaAgg.push(trgAgg);
    {
        trgMesh.material = new BABYLON.StandardMaterial("mat", scene);
        trgMesh.material.emissiveColor = BABYLON.Color3.Blue();
    }

    function resetPosiKoma() {
        let trgMesh;
        trgMesh = komaMesh[0];
        {
            trgMesh.physicsBody.disablePreStep = true;
            trgMesh.position = new BABYLON.Vector3(-4, 3, 4);
            trgMesh.rotationQuaternion = new BABYLON.Quaternion.FromEulerAngles(-0.3, 0, -0.1);
            trgMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            trgMesh.physicsBody.disablePreStep = false;
        }
        trgMesh = komaMesh[1];
        {
            trgMesh.physicsBody.disablePreStep = true;
            trgMesh.position = new BABYLON.Vector3(0, 3, 0);
            trgMesh.rotationQuaternion = new BABYLON.Quaternion.FromEulerAngles(0, 0, 0);
            trgMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            trgMesh.physicsBody.disablePreStep = false;
        }
        trgMesh = komaMesh[2];
        {
            trgMesh.physicsBody.disablePreStep = true;
            trgMesh.position = new BABYLON.Vector3(3, 2, 3);
            trgMesh.rotationQuaternion = new BABYLON.Quaternion.FromEulerAngles(0, 0, 0.2);
            trgMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
            trgMesh.physicsBody.disablePreStep = false;
        }
    }
    resetPosiKoma();

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
    let cooltime_act = 0, cooltime_actIni = 30;
    scene.registerAfterRender(function() {
        // コマに、常に回転力を加える
        for (let trgMesh of komaMesh) {
            let quat = trgMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(0 ,90, 0);
            vdir = vdir.applyRotationQuaternion(quat);
            trgMesh.physicsBody.applyAngularImpulse(vdir);
        }

        if (map[" "]) {
            resetPosiKoma();
        }
        // if (map[" "]) {
        //     for (let trgMesh of komaMesh) {
        //         let quat = trgMesh.rotationQuaternion;
        //         let vdir = new BABYLON.Vector3(0 ,90, 0);
        //         vdir = vdir.applyRotationQuaternion(quat);
        //         trgMesh.physicsBody.applyAngularImpulse(vdir);
        //     }
        // }

        // コマがすべて落ちていたらリセット
        {
            let bDropAll = true;
            for (let trgMesh of komaMesh) {
                if (trgMesh.position.y >= -10) {
                    bDropAll = false;
                    break;
                }
            }
            if (bDropAll) {
                resetPosiKoma();
            }
        }


        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["h"]) {
                cooltime_act = cooltime_actIni;
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
        }
    });

    // 左上に使い方（操作方法）を表示
    //   キー操作(h)で表示のon/offを切り替え(上記で)
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "110px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\nspace: reset\nh: show/hide this message";
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

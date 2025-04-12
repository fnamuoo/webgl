// 様々な物体(mass=0)の衝突判定のテスト
// - 対象の物体（ターゲット）をキー操作で回転
// - 上部から玉を落とす（無限ループ
//
// キー操作
//    w,s := x軸で回転
//    a,d := z軸で回転
//    i,k := 物体のローカル座標系の x軸で回転
//    j,l := 物体のローカル座標系の z軸で回転
//    c   := オブジェクトを変更
const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // 物理エンジンを有効にする
    // const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    const gravityVector = new BABYLON.Vector3(0, -1.5, 0);
    const physicsPlugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(2, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // 地面を設定する
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
    groundMesh.position.y = -2;
    groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMesh.material.majorUnitFrequency = 1;
    groundMesh.material.minorUnitVisibility  = 0;
    // 地面に摩擦係数、反射係数を設定する
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);

    let itype = 0, ntype = 13;
    function createShape(itype) {
        let trgMesh = null, trgAgg = null;
        if (itype == 0) {
            // 球
            trgMesh = BABYLON.MeshBuilder.CreateSphere("target", { diameter: 2, segments: 8 }, scene);
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0, restitution:0.05}, scene);

        } else if (itype == 1) {
            // 立方体
            trgMesh = BABYLON.MeshBuilder.CreateBox("target", { size: 2 }, scene);
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.05}, scene);

        } else if (itype == 2) {
            // 直方体
            trgMesh = BABYLON.MeshBuilder.CreateBox("target", { width: 1, height: 2, depth: 3 }, scene);
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);

        } else if (itype == 3) {
            // カプセル
            trgMesh = BABYLON.MeshBuilder.CreateCapsule("target", { height: 3, radius: 1 }, scene);
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.CAPSULE, { mass: 0.0, restitution:0.05}, scene);

        } else if (itype == 4) {
            // トーラス（ドーナツ
            trgMesh = BABYLON.MeshBuilder.CreateTorus("target", { diameter: 2, thickness: 0.3 }, scene);
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);

        } else if (itype == 5) {
            // トーラスノット（トーラス結び目
            trgMesh = BABYLON.MeshBuilder.CreateTorusKnot("target", { radius: 1, tube: 0.2, r: 2, q: 3 }, scene);
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);

        } else if (itype == 6) {
            // 高さマップ
            trgMesh = BABYLON.MeshBuilder.CreateGroundFromHeightMap
            ("target", "./textures/heightMap.png",
             {width:5, height :5, subdivisions: 100, maxHeight: 1,
              onReady: (mesh) => {
                  trgAgg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, {mass: 0}, scene);
                  trgAgg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
                  trgAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
              }});
            
        } else if (itype == 7) {
            // リボン:任意形状／曲面：パラボラ
            // https://playground.babylonjs.com/#F6JW5W#5
            let r = 1; // 4;
            const path0 = [];
            for (let a = 0; a <= Math.PI; a += Math.PI / 4) {
                path0.push(new BABYLON.Vector3(r, r * Math.cos(a), r * Math.sin(a)));
            }
            const path1 = [];
            for (let a = 0; a <= Math.PI; a += Math.PI / 4) {
                path1.push(new BABYLON.Vector3(0, r * Math.cos(a), r/2 + r * Math.sin(a)));
            }
            const path2 = [];
            for (let a = 0; a <= Math.PI; a += Math.PI / 4) {
                path2.push(new BABYLON.Vector3(-r, r * Math.cos(a), r * Math.sin(a)));
            }
            const myPaths2 = [path0, path1, path2];
            // let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: myPaths2, instance: ribbon, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: myPaths2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);

        } else if (itype == 8) {
            // リボン:任意形状／曲面(2) 正弦波 曲面
            let rootPath = [];
            let nmin = -10, nmax = 11, gridsize = 0.2;
            for (let iz = nmin; iz < nmax; ++iz) {
                let z = iz*gridsize;
                let path = []
                for (let ix = nmin; ix < nmax; ++ix) {
                    let x = ix*gridsize;
                    path.push(new BABYLON.Vector3(x, (Math.sin(x*2)+Math.sin(z*2))/2, z));
                }
                rootPath.push(path);
            }
            trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);

        } else if (itype == 9) {
            // チューブ
            // https://playground.babylonjs.com/#WW0ALQ
            const myPath = [
                new BABYLON.Vector3(1.0, 0, 0.0),
                new BABYLON.Vector3(0, 1, 0.1),
                new BABYLON.Vector3(-1.0, 1, 0.2)
            ];
            trgMesh = BABYLON.MeshBuilder.CreateTube("tube", {path: myPath, radius: 1, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);

        } else if (itype == 10) {
            // 押し出し成型：星
            // https://playground.babylonjs.com/#MR8LEL#740
            let r1 = 1, r2 = 0.3; // let r1 = 5, r2 = 1;
            const myShape = [
                new BABYLON.Vector3(0, r1, 0),
                new BABYLON.Vector3(r2, r2, 0),
                new BABYLON.Vector3(r1, 0, 0),
                new BABYLON.Vector3(r2, -r2, 0),
                new BABYLON.Vector3(0, -r1, 0),
                new BABYLON.Vector3(-r2, -r2, 0),
                new BABYLON.Vector3(-r1, 0, 0),
                new BABYLON.Vector3(-r2, r2, 0)
            ];
            const myPath = [
                new BABYLON.Vector3(0, 0, -1),
                new BABYLON.Vector3(0, 0, 1),
            ];
            trgMesh = BABYLON.MeshBuilder.ExtrudeShape("star", {shape: myShape, path: myPath, closeShape: true, cap: BABYLON.Mesh.CAP_ALL, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);

        } else if (itype == 11) {
            // 旋盤：壺
            // https://playground.babylonjs.com/#PQ0GIE
            const myShape = [
                new BABYLON.Vector3(0, -1, 0),
                new BABYLON.Vector3(1, -0.5, 0),
                new BABYLON.Vector3(0.5, 0, 0),
                new BABYLON.Vector3(1.2, 0.5, 0),
                new BABYLON.Vector3(0.8, 1, 0)
            ];
            trgMesh = BABYLON.MeshBuilder.CreateLathe("lathe", {shape: myShape});
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
            // trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 0.0, restitution:0.05}, scene);
            // trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);

        } else if (itype == 12) {
            // 複合体「ゴゴゴ」
            // https://scrapbox.io/babylonjs/%E3%82%B4%E3%82%B4%E3%82%B4
            // https://playground.babylonjs.com/#P7K5NG#12
            const geoinfoList = [
                { name: "part1", gsize: [1.8, 0.3, 0.3], gposi: [0.0, 0.75, 0.0] },
                { name: "part2", gsize: [0.3, 1.5, 0.3], gposi: [0.75, 0.0, 0.0] },
                { name: "part3", gsize: [1.8, 0.3, 0.3], gposi: [0.0, -0.75, 0.0] },
                { name: "part4", gsize: [0.2, 0.6, 0.3], gposi: [1.0, 0.75, 0.0] },
                { name: "part5", gsize: [0.2, 0.6, 0.3], gposi: [1.25, 0.75, 0.0] },
            ];
            let counter = 0;
            const spawnRandomLetter = function (scene) {
                const rootNode = new BABYLON.TransformNode(`letterParent${counter++}`, scene);
                const meshPartList = geoinfoList.map(geoinfo => createMeshPart(geoinfo.name + counter, 
                                                                               geoinfo.gsize, 
                                                                               geoinfo.gposi, 
                                                                               rootNode, 
                                                                               scene));
                const physContainer = createPhysContainer(meshPartList, scene);
                const physBody = bindBodyShape(rootNode, physContainer, scene);
                return [rootNode, physBody];
            };
            const createMeshPart = function (name, gsize, gposi, parent, scene) {
                const meshPart = BABYLON.MeshBuilder.CreateBox(name, { width:  gsize[0], height: gsize[1], depth:  gsize[2] }, scene);
                meshPart.position = new BABYLON.Vector3(gposi[0], gposi[1], gposi[2]);
                meshPart.parent = parent;
                return meshPart;
            };
            const createPhysContainer = function (meshPartList, scene) {
                const physContainer = new BABYLON.PhysicsShapeContainer(scene);
                meshPartList.forEach(part => {
                    const shape = new BABYLON.PhysicsShapeBox.FromMesh(part);
                    physContainer.addChildFromParent(part.parent, shape, part);
                });
                return physContainer;
            };
            const bindBodyShape = function (mesh, physContainer, scene) {
                const physBody = new BABYLON.PhysicsBody(mesh, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
                physContainer.material = { friction: 0.2, restitution: 0 };
                physBody.shape = physContainer;
                physBody.setMassProperties({ mass: 0 });
                physBody.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
                return physBody;
            };
            [trgMesh, trgAgg_phys] = spawnRandomLetter(scene);
        }

        // ターゲットの表示位置・色
        // trgMesh.position.y = 0;
        let mat = new BABYLON.StandardMaterial("mat", scene);
        mat.emissiveColor = BABYLON.Color3.Blue();
        //    mat.wireframe = true;
        trgMesh.material = mat;

        if (trgAgg) {
        //                   | PhysicsPrestepType
        // PhysicsMotionType | DISABLED(undef)         | TELEPORT                | ACTION
        //  -----------------|-------------------------|-------------------------|------------
        //  STATIC (undef)   |×物理は静止、描画が回転 |〇同期して回転           |×物理は静止、描画が回転
        //  ANIMATED         |×完全に静止             |〇同期して回転           |◎同期して回転(玉をはじく)
        //  DYNAMIC          |▽回転しないが、微動     |△回転する。静止時に微動 |◎同期して回転(玉をはじく)

        // https://doc.babylonjs.com/typedoc/classes/BABYLON.PhysicsBody
        // -機械翻訳
        // PhysicsMotionType.STATIC   - 静的ボディは移動せず、力や衝突の影響を受けません。レベルの境界や地形に適しています。
        // PhysicsMotionType.ANIMATED - 動的ボディのように動作しますが、他のボディの影響を受けませんが、他のボディを押しのけます。
        // PhysicsMotionType.DYNAMIC  - 動的ボディは完全にシミュレートされます。移動したり、他のオブジェクトと衝突したりできます。
        //
        // trgAgg.body.setMotionType(BABYLON.PhysicsMotionType.STATIC); // default
        trgAgg.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
        // trgAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);

        // https://doc.babylonjs.com/features/featuresDeepDive/physics/prestep
        // -機械翻訳
        // テレポート モードでは、ボディは接触している形状と制限された相互作用を持ちます。
        // テレポート モードは、たとえばギズモを使用してオブジェクトを配置する場合に適しています。
        // アクション モードでは、ボディはワールド内で効果的に移動して、接触している形状と相互作用します。
        // ゲーム中はアクション モードです。
        //
        // trgAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.DISABLED); // default
        trgAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
        // trgAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
        }

        // デバッグ表示(物理メッシュ／白線表示)
        if (0) {
            physicsViewer = new BABYLON.Debug.PhysicsViewer();
            for (const mesh of scene.rootNodes) {
                if (mesh.physicsBody) {
                    const debugMesh = physicsViewer.showBody(mesh.physicsBody);
                }
            }
        }

        // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
        const localAxes = new BABYLON.AxesViewer(scene, 2);
        localAxes.xAxis.parent = trgMesh;
        localAxes.yAxis.parent = trgMesh;
        localAxes.zAxis.parent = trgMesh;

        return [trgMesh, trgAgg];
    }

    let [trgMesh, trgAgg] = createShape(itype);


    // https://www.crossroad-tech.com/entry/babylonjs-translate-keyinput
    var map ={}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"; 
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    var distance = 0.01;
    var cooltime_chaneShape = 0;
    scene.registerAfterRender(function() {	
        // こちらはワールド／世界系で回転
        if ((map["a"] || map["A"])) {
            let quat = trgMesh.rotationQuaternion;
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0, 0.1);
            trgMesh.rotationQuaternion = quat2.multiply(quat);
        }
        if((map["d"] || map["D"])){
            let quat = trgMesh.rotationQuaternion;
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0, -0.1);
            trgMesh.rotationQuaternion = quat2.multiply(quat);
        }

        if((map["w"] || map["W"])){
            // physicsBody 経由でも同じ挙動に
            let quat = trgMesh.physicsBody.transformNode.rotationQuaternion;
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0.1, 0, 0);
            trgMesh.physicsBody.transformNode.rotationQuaternion = quat2.multiply(quat);
        }
        if((map["s"] || map["S"])){
            let quat = trgMesh.physicsBody.transformNode.rotationQuaternion;
            let quat2 = BABYLON.Quaternion.FromEulerAngles(-0.1, 0, 0);
            trgMesh.physicsBody.transformNode.rotationQuaternion = quat2.multiply(quat);
        }

        // こちらはローカルな座標系で回転(クォータニオンの掛け算の順番を入れ替えただけ)
        if (map["i"]) {
            let quat = trgMesh.rotationQuaternion;
            let quat2 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(1, 0, 0), 0.1);
            trgMesh.rotationQuaternion = quat.multiply(quat2);
        } else if (map["k"]) {
            let quat = trgMesh.rotationQuaternion;
            let quat2 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(1, 0, 0), -0.1);
            trgMesh.rotationQuaternion = quat.multiply(quat2);
        }
        if (map["j"]) {
            let quat = trgMesh.rotationQuaternion;
            let quat2 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), 0.1);
            trgMesh.rotationQuaternion = quat.multiply(quat2);
        } else if (map["l"]) {
            let quat = trgMesh.rotationQuaternion;
            let quat2 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), -0.1);
            trgMesh.rotationQuaternion = quat.multiply(quat2);
        }


        if (cooltime_chaneShape) {
            --cooltime_chaneShape;
        } 
        if (map["c"]) {
            if (cooltime_chaneShape) {
                --cooltime_chaneShape;
                console.log("cooltime_chaneShape=",cooltime_chaneShape);
            } else {
                if (trgMesh) trgMesh.dispose();
                if (trgAgg) trgAgg.dispose();

                itype = (itype+1) % ntype;
                [trgMesh, trgAgg] = createShape(itype);
                cooltime_chaneShape = 120;
            }
        }

        //   キー操作(h)で「使い方（操作方法）」のon/offを切り替え
        if (map["h"]) {
            if (guiLabelRect.isVisible) {
                guiLabelRect.isVisible = false;
            } else {
                guiLabelRect.isVisible = true;
            }
        }
    });


    // 永遠にボールを落とす
    let balls = [];
    let nBall = 300;
    for (let i = 0; i < nBall; ++i) {
        const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.1 }, scene);
        ball.position.y = 2+i*0.5;
        ball.position.x = BABYLON.Scalar.RandomRange(-0.2, 0.2) + 100;
        ball.position.z = BABYLON.Scalar.RandomRange(-0.2, 0.2);
        ball.physicsAggregate = new BABYLON.PhysicsAggregate(ball, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.01, restitution:0.1}, scene);
        balls.push(ball);
    }
    scene.onBeforeRenderObservable.add(() => {
        balls.forEach((ball) => {
            if (ball.position.y < -5) {
                const phbody = ball.physicsBody;
                phbody.disablePreStep = true;
                phbody.transformNode.position.set(BABYLON.Scalar.RandomRange(-0.2, 0.2),
                                                  10,
                                                  BABYLON.Scalar.RandomRange(-0.2, 0.2));
                phbody.setLinearVelocity(new BABYLON.Vector3(0,0,0));
                phbody.setAngularVelocity(new BABYLON.Vector3(0,0,0));
                phbody.disablePreStep = false;
            }
        })
    })

    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    // フレーム
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "160px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    // 表示内容
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\nw,s,a,d: rot obj(world)\ni,k,j,l: rot obj(local)\nc: change obj\nh: show/hide this message";
    text1.color = "white";
    text1.width = "320px";
    text1.fontSize = 24;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);
    // 画面左上に配置
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return scene;
};

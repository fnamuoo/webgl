// Crowd Navigation System(CNS)を使って人流シミュレーション・学校の避難訓練

var createScene = function () {

    var scene = new BABYLON.Scene(engine);
    let navigationPlugin = new BABYLON.RecastJSPlugin();

    var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(2, 5,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // let istage = 1, nstage = 2;
    // function createStaticMesh(istage, scene) {
    function createStaticMesh(scene) {
        // if (istage == 0) {
        //     var ground = BABYLON.Mesh.CreateGround("ground1", 20, 20, 2, scene);
        //     var mat1 = new BABYLON.StandardMaterial('mat1', scene);
        //     mat1.diffuseColor = new BABYLON.Color3(1, 1, 1);
        //     var sphere = BABYLON.MeshBuilder.CreateSphere("sphere1", {diameter: 2, segments: 16}, scene);
        //     sphere.material = mat1;
        //     sphere.position.y = 1;
        //     var cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 1, height: 3 }, scene);
        //     cube.position = new BABYLON.Vector3(1, 1.5, 0);
        //     var mesh = BABYLON.Mesh.MergeMeshes([sphere, cube, ground]);
        //     return [mesh];
        // }

        let meshes = []
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 24, height: 24 }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 10;
        groundMesh.material.minorUnitVisibility  = 0.4;
        meshes.push(groundMesh);
        // if (istage == 1) {
        {
            let py=0.2,block=4,block_=block/2, sS=0.1,sH=py*2,sL=block,sL80=sL*0.55,sL20=sL*0.25;
            let geoinfos = [[[-block*2,py,block_] ,[sS,sH,sL]],
                            [[-block,py,block_]   ,[sS,sH,sL]],
                            [[0,py,block_]        ,[sS,sH,sL]],
                            [[block,py,block_]    ,[sS,sH,sL]],
                            [[block*2,py,block_]  ,[sS,sH,sL]],
                            [[-block*1.5,py,0]    ,[sL80,sH,sS]],
                            [[-block_,py,0]       ,[sL80,sH,sS]],
                            [[block_,py,0]        ,[sL80,sH,sS]],
                            [[block*1.5,py,0]     ,[sL80,sH,sS]],
                            [[-block*1.5,py,block],[sL,sH,sS]],
                            [[-block_,py,block]   ,[sL,sH,sS]],
                            [[block_,py,block]    ,[sL,sH,sS]],
                            [[block*1.5,py,block] ,[sL,sH,sS]],
                            [[-block*1.5,py,-sL20],[sL,sH,sS]],
                            [[-block_,py,-sL20]   ,[sL,sH,sS]],
                            [[block_,py,-sL20]    ,[sL,sH,sS]],
                            [[block*1.5,py,-sL20] ,[sL,sH,sS]],
                            ];
            for (let [pp,ss] of geoinfos) {
                let box = BABYLON.MeshBuilder.CreateBox("cube", { width:ss[0], height:ss[1],depth:ss[2]}, scene);
                box.position = new BABYLON.Vector3(pp[0], pp[1], pp[2]);
                meshes.push(box);
            }
        }
        return meshes;
    }

    // let meshes = createStaticMesh(istage, scene);
    let meshes = createStaticMesh(scene);

    var navmeshParameters = {
        cs: 0.2,  // 歩行可能なナビメッシュのボクセルサイズ（幅、深さ
        ch: 0.2,  // ボクセルの高さ
        walkableSlopeAngle: 90,  // 歩行可能な最大傾斜の角度[度]
        walkableHeight: 1.0,  //  歩行が許可されるボクセル単位の高さ
        walkableClimb: 0.5, // 1,  // 登ることができるボクセル単位のデルタ
        walkableRadius: 0.5, // 1,  // エージェントのボクセル単位での半径
        maxEdgeLen: 12.,  // メッシュの境界に沿った輪郭エッジの最大許容長さ[ボクセル単位]
        maxSimplificationError: 1.3, // 境界エッジが元の生の輪郭から逸脱する最大距離[ボクセル単位]
        minRegionArea: 4, // 8,  // 孤立した島領域を形成できるセルの最小数[ボクセル単位]
        mergeRegionArea: 20,  // 領域結合の閾値。[ボクセル単位]
        maxVertsPerPoly: 6, // 輪郭線からポリゴンへの頂点の最大数(３以上)
        detailSampleDist: 6,  // 詳細メッシュ生成のサンプリング距離
        detailSampleMaxError: 1,  // 詳細メッシュ表面が高さフィールドの最大距離[ワールド単位]
        };
    navigationPlugin.createNavMesh(meshes, navmeshParameters);
    // デバッグ用のメッシュ
    var navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
    navmeshdebug.position = new BABYLON.Vector3(0, 0.01, 0);
    navmeshdebug.material = new BABYLON.StandardMaterial('matdebug', scene);;
    navmeshdebug.material.diffuseColor = new BABYLON.Color3(0.1, 0.2, 1);
    navmeshdebug.material.alpha = 0.2;
    
    // crowd
    let maxAgents = 100;
    var crowd = navigationPlugin.createCrowd(maxAgents, 0.1, scene);
    var i;
    var agentParams = {
        radius: 0.1,
        height: 0.2,
        maxAcceleration: 4.0,
        maxSpeed: 1.0,
        collisionQueryRange: 0.5,
        pathOptimizationRange: 0.0,
        separationWeight: 1.0
    };
    for (i = 0; i < maxAgents; i++) {
        var width = 0.20;
        var agentCube = BABYLON.MeshBuilder.CreateBox("cube", { size: width, height: width }, scene);
        var matAgent = new BABYLON.StandardMaterial('mat2', scene);
        var variation = Math.random();
        matAgent.diffuseColor = new BABYLON.Color3(0.4 + variation * 0.6, 0.3, 1.0 - variation * 0.3);
        agentCube.material = matAgent;
        var randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(20*Math.random()-10, 0.1, 5*Math.random()), 0.5);
        var transform = new BABYLON.TransformNode();
        agentCube.parent = transform;
        var agentIndex = crowd.addAgent(randomPos, agentParams, transform);
    }
    
    let iDist = 0, nDist = 4;
    let setDist = function(iDist) {
        let agents = crowd.getAgents();
        if (iDist == 0) {
            // ランダムに分布
            for (i = 0; i < maxAgents; i++) {
                let randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(20*Math.random()-10, 0.1, 5*Math.random()), 0.5);
                crowd.agentGoto(agents[i], navigationPlugin.getClosestPoint(randomPos));
            }
        } else if (iDist == 1) {
            // 教室の机をイメージ
            let ix, iz;
            let adjx_ = -4*1.5, adjz_ = -2, adjx, adjz, ibias;
            for (i = 0; i < maxAgents; i++) {
                ibias = Math.floor(i/25);
                iz = i%5;
                ix = Math.floor((i-ibias*25)/5);
                adjx = 4*(ibias-1.7), adjz = 1.0;
                let randomPos = new BABYLON.Vector3(ix*0.3+adjx, 0.1, iz*0.3+adjz);
                crowd.agentGoto(agents[i], navigationPlugin.getClosestPoint(randomPos));
            }
        } else if (iDist == 2) {
            // 移動教室
            let ix, iz;
            let adjx_ = -4*1.5, adjz_ = -2, adjx, adjz, ibias, j;
            for (i = 0; i < maxAgents; i++) {
                ibias = Math.floor(i/25);
                if (ibias == 0) {
                    continue;
                } else if (ibias == 1) {
                    // 校庭に
                    iz = i%5;
                    ix = Math.floor(i/5);
                    let randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(0.5*ix-5, 0.1, -0.5*iz-3), 0.1);
                    crowd.agentGoto(agents[i], navigationPlugin.getClosestPoint(randomPos));
                    continue;
                }
                j = (i + 20) % 50 + 50;
                ibias = Math.floor(j/25);
                iz = j%5;
                ix = Math.floor((j-ibias*25)/5);
                adjx = 4*(ibias-1.7), adjz = 1.0;
                let randomPos = new BABYLON.Vector3(ix*0.3+adjx, 0.1, iz*0.3+adjz);
                crowd.agentGoto(agents[i], navigationPlugin.getClosestPoint(randomPos));
            }
        } else if (iDist == 3) {
            // 校庭に整列するイメージ
            let ix, iz;
            for (i = 0; i < maxAgents; i++) {
                iz = i%5;
                ix = Math.floor(i/5);
                let randomPos = new BABYLON.Vector3(0.5*ix-5, 0.1, -0.5*iz-3);
                crowd.agentGoto(agents[i], navigationPlugin.getClosestPoint(randomPos));
            }
        }
    }


    var startingPoint;
    var currentMesh;
    var pathLine;
    var getGroundPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY);
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }
        return null;
    }
    var pointerDown = function (mesh) {
        currentMesh = mesh;
        startingPoint = getGroundPosition();
        if (startingPoint) { // we need to disconnect camera from canvas
            var agents = crowd.getAgents();
            var i;
            for (i=0;i<agents.length;i++) {
                var randomPos = navigationPlugin.getRandomPointAround(startingPoint, 1.0);
                crowd.agentGoto(agents[i], navigationPlugin.getClosestPoint(startingPoint));
            }
        }
    }
    
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ') {
                iDist = (iDist+1) % nDist;
                setDist(iDist);
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            break;
        }
    });


    var ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var panel = createGUIPanel(ui);
    addText(scene, panel, (bodiesCounter) => {
        let stext = 'random (push SPC-key to change)';
        if (iDist == 1) {
            stext = 'classroom(type-1)';
        } else if (iDist == 2) {
            stext = 'classroom(type-2)';
        } else if (iDist == 3) {
            stext = 'schoolyard';
        }
        bodiesCounter.text = stext;
    });

    return scene;
};

function createGUIPanel(gui) {
    var panel = new BABYLON.GUI.StackPanel();
    panel.spacing = 5;
    gui.addControl(panel);
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.paddingLeftInPixels = 10;
    panel.paddingTopInPixels = 10;
    return panel;
}

function addText(scene, parent, updateFn, initialText) {
    var bodiesCounter = new BABYLON.GUI.TextBlock("bodiesCounter", initialText);
    bodiesCounter.color = "white";
    bodiesCounter.resizeToFit = true;
    bodiesCounter.fontSize = "20px";
    parent.addControl(bodiesCounter);
    if (updateFn) {
        scene.onAfterRenderObservable.add(() => updateFn(bodiesCounter));
    }
    return bodiesCounter;
}

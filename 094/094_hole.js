// ホールゲーム

//  - カーソル上下/(w,s)          .. 上下
//  - カーソル右左/(a,d)          .. 左右
//  - space                       .. 引き寄せる（力場の発生）
//  - (n)/(p)                     .. ステージの切り替え

var createScene = async function () {
    await BABYLON.InitializeCSG2Async();

    var scene = new BABYLON.Scene(engine);

    let camera = null, cameraDistIni=30, cameraDist=cameraDistIni;
    let icamera = 1;
    if (icamera == 0) {
        camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100,-10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);
    }
    if (icamera == 1) {
        camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        camera.rotationOffset = 180;
        camera.radius = cameraDist/2;
        camera.heightOffset = cameraDist;
        camera.cameraAcceleration = 0.05;
        camera.maxCameraSpeed = 30;
        camera.attachControl(canvas, true);
        camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    }
    var iniCamera = function() {
        if (icamera == 1) {
            cameraDist=cameraDistIni;
            camera.radius = cameraDist;
            camera.heightOffset = cameraDist;
        }
    }
    var resetCamera = function(size=0) {
        if (icamera == 1) {
            cameraDist=cameraDistIni+size;
            camera.radius = cameraDist;
            camera.heightOffset = cameraDist;
            camera.lockedTarget = myMesh;
        }
    }

    const physicsPlugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), physicsPlugin);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    let grndMeshBase;
    let grndMesh=null, grndAgg=null;
    let grndW =1000, grndH = 1000;
    {
        // 床を立体で表現
        grndMeshBase = BABYLON.MeshBuilder.CreateBox("wall", { width:grndW, height:1, depth:grndH }, scene);
        let grndMat;
        grndMat = new BABYLON.GridMaterial("", scene);
        grndMat.majorUnitFrequency = 100;
        grndMat.minorUnitVisibility  = 0.7;
        grndMeshBase.material = grndMat;
    }

    let myMesh=null, myAgg, myRini=5, myR=myRini, score=0, stageClear=0;
    let myPosi = new BABYLON.Vector3(0, 0, -20);
    var createMy = function() {
        if (myMesh!=null) {
            myMesh.dispose();
            myMesh=null;
        }
        // 自機
        myMesh = BABYLON.MeshBuilder.CreateCylinder("my", { diameter:myR*2, height:1.01}, scene,);
        myMesh.position = myPosi;
        let mat = new BABYLON.StandardMaterial("mat", scene);
        mat.specularColor = BABYLON.Color3.Black();
        mat.diffuseColor = BABYLON.Color3.Black();
        myMesh.material = mat;
    }
    var updateMySize = function() {
        let size = Math.log(score);
        // if (size > 1000) {size=1000}
        myR=myRini+size;
        createMy(myR);
        resetCamera(size);
    }
    var resetMy = function() {
        myR=myRini;
        score=0;
        stageClear=0;
        iniCamera();
    }

    const grndBaseCSG = BABYLON.CSG2.FromMesh(grndMeshBase);
    let myCSG = null;
    let grndCSG;
    var updateGround = function() {
        // ホール移動時のメッシュ更新
        if (myCSG != null) {
            grndMesh.dispose();
            grndAgg.dispose();
        }
        myCSG = BABYLON.CSG2.FromMesh(myMesh);
        grndCSG = grndBaseCSG.subtract(myCSG);
        grndMesh = grndCSG.toMesh("ground", scene);
        grndAgg = new BABYLON.PhysicsAggregate(grndMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, friction:0.99, restitution:0.01}, scene);
    }

    let istage=0, nstage=3;
    let trgMeshInfo = {};
    var createStage = function(istage) {
        if (Object.keys(trgMeshInfo).length > 0) {
            for (let key in trgMeshInfo) {
                let mesh = trgMeshInfo[key];
                mesh._agg.dispose();
                mesh.dispose();
            }
            trgMeshInfo = {};
        }
        let myPosiV = [0, 0, -20];
        // クリア用の材質
        let matClear = new BABYLON.StandardMaterial("mat", scene);
        matClear.emissiveColor = BABYLON.Color3.Red();
        if (istage == 0) {
            let n = 100;
            let adjx=0, adjy=0, adjz=0;
            for (let i =0; i < n; ++i) {
                let trgMesh = BABYLON.MeshBuilder.CreateBox("trg", { width: 2, height: 2, depth: 2 }, scene);
                let mat = new BABYLON.StandardMaterial("mat", scene);
                mat.emissiveColor = BABYLON.Color3.Blue();
                trgMesh.material = mat;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1, friction:0.99, restitution:0.05}, scene);
                trgMesh.physicsBody.disablePreStep = true;
                trgMesh.position.x += adjx + BABYLON.Scalar.RandomRange(-10, 10);
                trgMesh.position.z += adjz + BABYLON.Scalar.RandomRange(-10, 10);
                trgMesh.position.y += adjy + i;
                trgMesh.physicsBody.disablePreStep = false;
                trgMesh._point = 1;
                trgMesh._clear = 0;
                trgMesh._id = i;
                trgMesh._agg = trgMesh;
                trgMeshInfo[trgMesh._id] = trgMesh;
            }
            // ステージクリア用の設定
            let id = Math.floor(Math.random()*n);
            let mesh = trgMeshInfo[id];
            mesh.material = matClear;
            mesh._clear = 1;

        } else if (istage == 1) {
            let mat = new BABYLON.StandardMaterial("mat", scene);
            mat.emissiveColor = BABYLON.Color3.Blue();
            let nx = 10, ny = 10, nz = 10, n0=0;
            let adjx=-20, adjy=1, adjz=-20;
            for (let iy =0; iy < ny; ++iy) {
            for (let iz =0; iz < nz; ++iz) {
            for (let ix =0; ix < nx; ++ix) {
                let trgMesh = BABYLON.MeshBuilder.CreateBox("trg", { width: 2, height: 2, depth: 2 }, scene);
                trgMesh.material = mat;
                trgMesh.position.x = adjx+ix*6;
                trgMesh.position.y = adjy+iy*2;
                trgMesh.position.z = adjz+iz*6;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1, friction:0.99, restitution:0.05}, scene);
                trgMesh._point = 1;
                trgMesh._clear = 0;
                trgMesh._id = ix+iz*nx+iy*nx*nz;
                trgMesh._agg = trgMesh;
                trgMeshInfo[trgMesh._id] = trgMesh;
            }
            }
            }
            n0+=nx*ny*nz;
            myPosiV = [0, 0, -30];
            // ステージクリア用の設定
            for (let i=0; i<3; ++i) {
                let id = Math.floor(Math.random()*n0);
                let mesh = trgMeshInfo[id];
                mesh.material = matClear;
                mesh._clear += 0.4;
            }

        } else if (istage == 2) {
            let mat = new BABYLON.StandardMaterial("mat", scene);
            mat.emissiveColor = BABYLON.Color3.Blue();
            let nx = 10, ny = 10, nz = 10, n0=0;
            let adjx=-10, adjy=1, adjz=-10;
            for (let iy =0; iy < ny; ++iy) {
            for (let iz =0; iz < nz; ++iz) {
            for (let ix =0; ix < nx; ++ix) {
                let trgMesh = BABYLON.MeshBuilder.CreateBox("trg", { width: 2, height: 2, depth: 2 }, scene);
                trgMesh.material = mat;
                trgMesh.position.x = adjx+ix*2;
                trgMesh.position.y = adjy+iy*2;
                trgMesh.position.z = adjz+iz*2;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1, friction:0.99, restitution:0.05}, scene);
                trgMesh._point = 1;
                trgMesh._clear = 0;
                trgMesh._id = ix+iz*nx+iy*nx*nz;
                trgMesh._agg = trgMesh;
                trgMeshInfo[trgMesh._id] = trgMesh;
            }
            }
            }
            n0+=nx*ny*nz;
            let mat2 = new BABYLON.StandardMaterial("mat", scene);
            mat2.emissiveColor = BABYLON.Color3.Green();
            nx = 10, ny = 10, nz = 10;
            adjx=-10, adjy=5, adjz=100;
            for (let iy =0; iy < ny; ++iy) {
            for (let iz =0; iz < nz; ++iz) {
            for (let ix =0; ix < nx; ++ix) {
                let trgMesh = BABYLON.MeshBuilder.CreateBox("trg", { width: 10, height: 10, depth: 10 }, scene);
                trgMesh.material = mat2;
                trgMesh.position.x = adjx+ix*10;
                trgMesh.position.y = adjy+iy*10;
                trgMesh.position.z = adjz+iz*10;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1, friction:0.99, restitution:0.05}, scene);
                trgMesh._point = 1000;
                trgMesh._clear = 0;
                trgMesh._id = ix+iz*nx+iy*nx*nz+n0;
                trgMesh._agg = trgMesh;
                trgMeshInfo[trgMesh._id] = trgMesh;
            }
            }
            }
            n0+=nx*ny*nz;
            let mat3 = new BABYLON.StandardMaterial("mat", scene);
            mat3.emissiveColor = BABYLON.Color3.Yellow();
            nx = 5, ny = 5, nz = 5;
            adjx=-10, adjy=10, adjz=250;
            for (let iy =0; iy < ny; ++iy) {
            for (let iz =0; iz < nz; ++iz) {
            for (let ix =0; ix < nx; ++ix) {
                let trgMesh = BABYLON.MeshBuilder.CreateBox("trg", { width: 20, height: 20, depth: 20 }, scene);
                trgMesh.material = mat3;
                trgMesh.position.x = adjx+ix*20;
                trgMesh.position.y = adjy+iy*20;
                trgMesh.position.z = adjz+iz*20;
                let trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1, friction:0.99, restitution:0.05}, scene);
                trgMesh._point = 1000000;
                trgMesh._clear = 0;
                trgMesh._id = ix+iz*nx+iy*nx*nz+n0;
                trgMesh._agg = trgMesh;
                trgMeshInfo[trgMesh._id] = trgMesh;
            }
            }
            }
            n0+=nx*ny*nz;
            myPosiV = [0, 0, -40];
            // ステージクリア用の設定
            for (let i=0; i<3; ++i) {
                let id = Math.floor(Math.random()*n0);
                let mesh = trgMeshInfo[id];
                mesh.material = matClear;
                mesh._clear += 0.4;
            }
        }
        myPosi.fromArray(myPosiV);
        myMesh.position = myPosi;
    }

    createMy(myR);
    createStage(istage);
    updateGround();
    resetCamera();

    // 衝突判定：ホールに落ちたメッシュはdisposeする
    var triggerShapeExtents = new BABYLON.Vector3(grndW, 10, grndH);
    let posiTriger = new BABYLON.Vector3(0, -6, 0);
    var triggerPhys = new BABYLON.PhysicsShapeBox(posiTriger, new BABYLON.Quaternion(), triggerShapeExtents, scene);
    const triggerMesh = BABYLON.MeshBuilder.CreateBox("triggerMesh",
                                                      {width:triggerShapeExtents.x, height:triggerShapeExtents.y, depth:triggerShapeExtents.z},
                                                      scene);
    triggerPhys.isTrigger = true;
    var triggerTransform = new BABYLON.TransformNode("triggerTransform");
    var triggerBody = new BABYLON.PhysicsBody(triggerTransform, BABYLON.PhysicsMotionType.STATIC, false, scene);
    triggerBody.shape = triggerPhys;
    triggerMesh.position = posiTriger;

    physicsPlugin.onTriggerCollisionObservable.add((ev) => {
        // console.log(ev.type, ':', ev.collider.transformNode.name, '-', ev.collidedAgainst.transformNode.name);
        if (ev.type === 'TRIGGER_EXITED' && ev.collider.transformNode.name === 'trg') {
            let key = ev.collider.transformNode._id;
            let mesh = trgMeshInfo[key];
            if (mesh.position.y < -1) {
                score += mesh._point;
                stageClear += mesh._clear;
                mesh._agg.dispose();
                mesh.dispose();
                delete trgMeshInfo[key];
                updateMySize();
                updateGround();
            }
            if (stageClear>=1) {
                istage = (istage+1)%nstage;
                createStage(istage);
                resetMy();
                createMy(myR);
                updateGround();
                resetCamera();
            }
        }
    })

    // https://doc.babylonjs.com/features/featuresDeepDive/physics/forces/
    // https://playground.babylonjs.com/#E5URLZ#20
    var physicsHelper = new BABYLON.PhysicsHelper(scene);
    var setGravitationalField = function() {
        let radius =  (myRini+Math.log(score))*3;
        let strength = 10;
        let gravitationalFieldOrigin = myMesh.position.clone();
        gravitationalFieldOrigin.y = 1;
        setTimeout(function () {
            var event = physicsHelper.gravitationalField(
                gravitationalFieldOrigin,
                {
                    radius: radius,
                    strength: strength,
                    falloff: BABYLON.PhysicsRadialImpulseFalloff.Linear,
                }
            );
            event.enable();
            var sphere = BABYLON.MeshBuilder.CreateSphere("debug", { diameter: radius * 2 });
            sphere.position = gravitationalFieldOrigin.clone();
            {
                var sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", scene);
                sphereMaterial.alpha = 0.5;
                sphere.material = sphereMaterial;
            }
            setTimeout(function (sphere) {
                event.disable();
                event.dispose();
                sphere.dispose();
            }, 3000, sphere);
        }, 1000);
    }

    var map ={}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    let quick=false, rightRoll = false, lefttRoll = false;
    let mx=1,mz=1;
    let cooltime_act = 0, cooltime_actIni = 30;
    scene.registerAfterRender(function() {
        if (map["w"] || map["ArrowUp"]) {
            myPosi.z += mz;
            updateGround();
        }
        if (map["s"] || map["ArrowDown"]) {
            myPosi.z += -mz;
            updateGround();
        }
        if (map["a"] || map["ArrowLeft"]) {
            myPosi.x += -mx;
            updateGround();
        }
        if (map["d"] || map["ArrowRight"]) {
            myPosi.x += mx;
            updateGround();
        }

        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["n"]) {
                cooltime_act = cooltime_actIni;
                istage = (istage+1)%nstage;
                createStage(istage);
                resetMy();
                createMy(myR);
                updateGround();
                resetCamera();
            }
            if (map["p"]) {
                cooltime_act = cooltime_actIni;
                istage = (istage+nstage-1)%nstage;
                createStage(istage);
                resetMy();
                createMy(myR);
                updateGround();
                resetCamera();
            }
            if (map[" "]) {
                cooltime_act = 10;
                setGravitationalField();
            }
            if (map["h"]) {
                cooltime_act = cooltime_actIni;
                // help表示のON/OFF
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
        }
    });


    // --------------------------------------------------
    // 左上に使い方（操作方法）を表示
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
    text1.text = "Usage:\n"
        +"(W,S) or (Arrow UP/DOWN): Forward/Back\n"
        +"(A,D) or (Arrow Left/Right): Left/Right\n"
        +"(Space): GravitationalField\n"
        +"(N,P) : Change Stage\n"
        +"H: show/hide this message";
    text1.color = "white";
    text1.width = "260px";
    text1.fontSize = 12;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    guiLabelRect.isVisible = false;

    return scene;
}

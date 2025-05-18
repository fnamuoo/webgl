// 「Simple Pine Tree Generator」で森をつくる
//
// キャラクターコントローラー
//  - カーソル上/(w) .. 前進
//  - カーソル下/(s) .. 後進／降下（空中）
//  - カーソル右左/(a,d) .. 方向転換
//  - space .. ジャンプ(ジャンプ時の移動は、地上の4倍に)
//  - c     .. カメラの視点切り替え

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.rotationOffset = 180;
    camera.radius = 10; // 3;
    camera.heightOffset = 2; // 1.1;
    camera.cameraAcceleration = 0.05; // 0.1;
    camera.maxCameraSpeed = 30;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 0;

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(20, 150, 70), scene);
    light.intensity = 0.7;

    let nb = new BABYLON.NoiseBlock();
    const nbvzero = new BABYLON.Vector3(0,0,0);
    // perlinの文様を変えずに meshサイズを変更するには nbscale*gridratio=一定とする
    let gridratio = 1, nbscale = 0.02/gridratio;
    let yratio = 20;
    function yposi(x,z) {
        return nb.noise(8, 0.5, new BABYLON.Vector3(x,z,0), nbvzero, nbscale)*yratio;
    }

    let rootPath = [];
    let size = 100, size_ = size/2;
    let nmin = -size_, nmax = size_+1;
    for (let iz = nmin; iz < nmax; ++iz) {
        let z = iz*gridratio;
        let path = []
        for (let ix = nmin; ix < nmax; ++ix) {
            let x = ix*gridratio;
            let y = yposi(x,z);
            path.push(new BABYLON.Vector3(x, y, z));
        }
        rootPath.push(path);
    }
    trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
    trgMesh.material = new BABYLON.NormalMaterial("mat", scene);
    trgMesh.material.wireframe = true;
    trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);


    // ----------------------------------------
    // 植樹

    let leafMaterial = new BABYLON.StandardMaterial("leafMaterial", scene);
    leafMaterial.diffuseColor = new BABYLON.Color3(0.5, 1, 0.5);
    
    let woodMaterial = new BABYLON.StandardMaterial("_wood", scene);
    woodMaterial.diffuseTexture = new BABYLON.WoodProceduralTexture("_wood_text", 512, scene);
    woodMaterial.diffuseTexture.ampScale = 50;
    
    var simplePineGenerator = function(canopies, height, trunkMaterial, leafMaterial) {
	var curvePoints = function(l, t) {
    	    var path = [];
    	    var step = l / t;
    	    for (var i = 0; i < l; i += step ) {
		path.push(new BABYLON.Vector3(0, i, 0));
	    	path.push(new BABYLON.Vector3(0, i, 0));
    	    }
    	    return path;
  	};
	var nbL = canopies + 1;
  	var nbS = height;
  	var curve = curvePoints(nbS, nbL);
  	var radiusFunction = function (i, distance) {
	    var fact = height/30;
	    if (i % 2 == 0) { fact *= .5; }
    	    var radius =  (nbL * 2 - i - 1) * fact;	
    	    return radius;
  	};
        var leaves = BABYLON.MeshBuilder.CreateTube("tube", {path: curve, radius: 0, tessellation:10, radiusFunction:radiusFunction, cap: 1}, scene);
        let diameter = height*0.2;
  	var trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {height: nbS/nbL, diameter: diameter, tessellation:12}, scene);
  	leaves.material = leafMaterial;
  	trunk.material = woodMaterial; 
  	var tree = new BABYLON.Mesh.CreateBox('',1,scene);
  	tree.isVisible = false;
  	leaves.parent = tree;
  	trunk.parent = tree; 
	return tree; 
    }

    let x, y, z;
    function yposi2(x,z) {
        return yposi(x,z) + 0.5;
    }

    var treeMain = simplePineGenerator(7, 30, woodMaterial, leafMaterial);
    treeMain.position = new BABYLON.Vector3(0,yposi(0,0)+1,0);

    let treeSubOrg = simplePineGenerator(7, 6, woodMaterial, leafMaterial);
    x = size_, z = size_;
    treeSubOrg.position = new BABYLON.Vector3(x,yposi2(x,z),z);

    let nMesh = 300, rng = size_, rngLimit = size_*0.4;
    while (nMesh > 0) {
        x = BABYLON.Scalar.RandomRange(-rng, rng);
        z = BABYLON.Scalar.RandomRange(-rng, rng);
        if (Math.abs(x) < rngLimit && Math.abs(z) < rngLimit) {
            continue;
        }
        let treeSub = treeSubOrg.clone();
        treeSub.position = new BABYLON.Vector3(x,yposi2(x,z),z);
        --nMesh;
    }



    // ----------------------------------------

    function createMat(type) {
        let mat = null;
        if (type=='std_wire') {
            mat = new BABYLON.StandardMaterial("mat", scene);
            mat.emissiveColor = BABYLON.Color3.Blue();
            mat.wireframe = true;
        } else if (type=='std_trans') {
	    mat = new BABYLON.StandardMaterial('mat', scene);
	    mat.diffuseColor = BABYLON.Color3.Blue();
	    mat.alpha = 0.7;
        } else if (type=='std_trans2') {
	    mat = new BABYLON.StandardMaterial('mat', scene);
	    mat.diffuseColor = BABYLON.Color3.White();
	    mat.alpha = 0.7;
        } else if (type=='nmr') {
            mat = new BABYLON.NormalMaterial("mat", scene);
            mat.wireframe = true;
        } else if (type=='grid') {
	    mat = new BABYLON.GridMaterial("mat", scene);
	    mat.majorUnitFrequency = 5;
	    mat.gridRatio = 0.5;
        } else if (type=='grad') {
	    mat = new BABYLON.GradientMaterial("grad", scene);
            mat.topColor = new BABYLON.Color3(0.6, 0.7, 0.9);
            mat.bottomColor = new BABYLON.Color3(0.4, 0.6, 0.4);
            mat.offset = 1;
            mat.scale = 0.3;
            // mat.smoothness = 1;
            // mat.wireframe = true;
        }
        return mat;
    }

    let matMy = createMat('std_trans'); // 自機

    // --------------------------------------------------
    // Player/Character state
    var state = "IN_AIR";
    let bDash = 3;
    var inAirSpeed = 30.0;
    var onGroundSpeed = 3.0;
    var inAirSpeedBase = 30.0;
    var onGroundSpeedBase = 3.0;
    var jumpHeight = 20;
    // var inAirSpeed = 20.0;
    // var onGroundSpeed = 5.0;
    // var jumpHeight = 5; // 1.5;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -18, 0);
    let characterHoverON  = new BABYLON.Vector3(0, 17.99, 0);
    let characterHoverOFF = new BABYLON.Vector3(0, 0, 0);
    let characterHover = characterHoverON;
    let keyAction = {forward:0, back:0, right:0, left:0, jump:0, down:0};

    // Physics shape for the character
    let myh = 1.8;
    let myr = 0.6;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: myh, radius: myr}, scene);
    displayCapsule.material = matMy;
    // let characterPosition = new BABYLON.Vector3(0, 10, -4);
    let characterPosition = new BABYLON.Vector3(0, 25, -4);
    // let characterPosition = new BABYLON.Vector3(points[0].x, points[0].y+10, points[0].z);
    // let characterPosition = new BABYLON.Vector3(0, yratio+ 10, -r*gridratio);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: myh, capsuleRadius: myr}, scene);

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 2);
    localAxes.xAxis.parent = displayCapsule; localAxes.yAxis.parent = displayCapsule; localAxes.zAxis.parent = displayCapsule;

    camera.lockedTarget = displayCapsule;

    var getNextState = function(supportInfo) {
        if (state == "IN_AIR_UP") {
            if (characterController.getVelocity().y > 0) {
                return "IN_AIR_UP";
            }
            return "IN_AIR";
        } else if (state == "IN_AIR") {
            if (keyAction.down) {
                characterHover = characterHoverOFF;
            } else {
                characterHover = characterHoverON;
            }
            if (supportInfo.supportedState == BABYLON.CharacterSupportedState.SUPPORTED) {
                return "ON_GROUND";
            }
            return "IN_AIR";
        } else if (state == "ON_GROUND") {
            if (supportInfo.supportedState != BABYLON.CharacterSupportedState.SUPPORTED) {
                return "IN_AIR_UP";
            }
            if (keyAction.jump) {
                return "START_JUMP";
            }
            return "ON_GROUND";
        } else if (state == "START_JUMP") {
            return "IN_AIR_UP";
        }
    }

    var getDesiredVelocity = function(deltaTime, supportInfo, characterOrientation_, currentVelocity) {
        let nextState = getNextState(supportInfo);
        if (nextState != state) {
            state = nextState;
        }
        let upWorld = characterGravity.normalizeToNew();
        upWorld.scaleInPlace(-1.0);
        let forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation_);
        if (state == "IN_AIR_UP") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (state == "IN_AIR") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            outputVelocity.addInPlace(characterHover.scale(deltaTime)); // 降下をゆっくりにする上向きのベクトル
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
            outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
            let inv1k = 1e-3;
            if (outputVelocity.dot(upWorld) > inv1k) {
                let velLen = outputVelocity.length();
                outputVelocity.normalizeFromLength(velLen);
                let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);
                let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
                outputVelocity = c.cross(upWorld);
                outputVelocity.scaleInPlace(horizLen);
            }
            outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
            return outputVelocity;
        } else if (state == "START_JUMP") {
            let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
            let curRelVel = currentVelocity.dot(upWorld);
            return currentVelocity.add(upWorld.scale(u - curRelVel));
        }
        return Vector3.Zero();
    }

    scene.onBeforeRenderObservable.add((scene) => {
        displayCapsule.position.copyFrom(characterController.getPosition());
    });

    scene.onAfterPhysicsObservable.add((_) => {
        if (scene.deltaTime == undefined) return;
        let dt = scene.deltaTime / 1000.0;
        if (dt == 0) return;
        let down = new BABYLON.Vector3(0, -1, 0);
        let support = characterController.checkSupport(dt, down);
        if (keyAction.right) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), 0.02);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0.02, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        } else if (keyAction.left) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), -0.02);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, -0.02, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        }
        let desiredLinearVelocity = getDesiredVelocity(dt, support, characterOrientation, characterController.getVelocity());
        characterController.setVelocity(desiredLinearVelocity);
        characterController.integrate(dt, support, characterGravity);
    });

    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.shiftKey) {
                inAirSpeed = inAirSpeedBase * bDash;
                onGroundSpeed = onGroundSpeedBase * bDash;
            }
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 'ArrowUp') {
                inputDirection.z = 1;
                keyAction.forward = 1;
            } else if (kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowDown') {
                if (state === "IN_AIR") {  // 空中なら降下
                    keyAction.down = 1;
                } else {  // 地上ならバック
                    inputDirection.z = -1;
                    keyAction.back = 1;
                }
            } else if (kbInfo.event.key == 'a' || kbInfo.event.key == 'ArrowLeft') {
                keyAction.left = 1;
            } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
                keyAction.right = 1;
            }
            if (kbInfo.event.key === 'Enter') {
                keyAction.jump = 1;
            } else if (kbInfo.event.key === ' ') {
                keyAction.jump = 1;
            } else if (kbInfo.event.key == 'c') {
                icamera = (icamera+1) % 4;
                // console.log("camera=",icamera);
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 10; // 3;
                    camera.heightOffset = 2; // 1.1;
                    camera.cameraAcceleration = 0.05;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 50;
                    camera.heightOffset = 4;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 10;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 2;
                    camera.heightOffset = 100;
                    camera.cameraAcceleration = 0.5;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.3;
                    camera.heightOffset = -0.01;
                    camera.cameraAcceleration = 0.3;
                    camera.maxCameraSpeed = 30;
                }

            } else if (kbInfo.event.key == 'r') {
                // キャラクターコントローラーの位置だけリセット
                characterController._position = characterPosition;

            } else if (kbInfo.event.key === 'h') {
                //   キー操作(h)で表示のon/offを切り替え
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }

            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowUp' || kbInfo.event.key == 'ArrowDown') {
                inputDirection.z = 0;    
                keyAction.forward = 0;
                keyAction.back = 0;
                keyAction.down = 0;
                // set off DASH
                inAirSpeed = inAirSpeedBase;
                onGroundSpeed = onGroundSpeedBase;
            }
            if (kbInfo.event.key == 'a' || kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowLeft' || kbInfo.event.key == 'ArrowRight') {
                inputDirection.x = 0;
                keyAction.left = 0;
                keyAction.right = 0;
            } else if (kbInfo.event.key === 'Enter' || kbInfo.event.key === ' ') {
                keyAction.jump = 0;
            }
            break;
        }
    });


    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "150px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n(W) or (Arrow UP): Forward\n(S) or (Arrow DOWN): Back/Down\n(A,D) or (Arrow Left/Right): turn Left/Right\n(Space): jump\nC: change Camera\nR: Reset position\nH: show/hide this message";
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

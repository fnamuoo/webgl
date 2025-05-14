// NoiseBlock.noise で凹凸地形を作り、道路を通す
//
// キャラクターコントローラー
//  - カーソル上下/(w,s) .. 前後移動
//  - カーソル右左/(a,d) .. 方向転換
//  - space .. ジャンプ(ジャンプ時の移動は、地上の4倍に)
//  - c     .. カメラの視点切り替え

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.rotationOffset = 180;
    camera.radius = 3;
    camera.heightOffset = 1.1;
    camera.cameraAcceleration = 0.1;
    camera.maxCameraSpeed = 30;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 0;

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.position = new BABYLON.Vector3(20, 150, 70);
    light.intensity = 0.7;

    let nb = new BABYLON.NoiseBlock();
    const nbvzero = new BABYLON.Vector3(0,0,0);
    // perlinの文様を変えずに meshサイズを変更するには nbscale*gridratio=一定とする
    let gridratio = 1, nbscale = 0.02/gridratio;
    // let gridratio = 1, nbscale = 0.02;

    let size = 100, size_ = size/2;
    let nmin = -size_, nmax = size_+1, yratio = 20;

    // 地形の凹凸にそって、円周上の点を取得
    const R30 = Math.PI/6;
    let r = size_*0.7;
    plist = [];
    for (irad = 0; irad < 12; ++irad) {
        let ix = r*Math.cos(irad*R30), iz = r*Math.sin(irad*R30);
        let x = ix*gridratio, z = iz*gridratio;
        let y = nb.noise(8, 0.5, new BABYLON.Vector3(x,z,0), nbvzero, nbscale);
        y *= yratio;
        plist.push(new BABYLON.Vector3(x,y,z));
    }
    // 上記で取得した円周上の点を、スプラインで補間
    const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, plist.length, true);
    const points = catmullRom.getPoints();
    // 補間した点群を線分で表示  ..下記 道路っぽい道のセンターラインに
    const arcLine = BABYLON.MeshBuilder.CreateLines("arc", {points: points})

    // perlinノイズで地形を作る
    let rootPath = [];
    for (let iz = nmin; iz < nmax; ++iz) {
        let z = iz*gridratio;
        let path = []
        for (let ix = nmin; ix < nmax; ++ix) {
            let x = ix*gridratio;
            let y = nb.noise(8, 0.5, new BABYLON.Vector3(x,z,0), nbvzero, nbscale);
            y *= yratio;
            path.push(new BABYLON.Vector3(x, y, z));
        }
        rootPath.push(path);
    }
    // 道路上にはみ出るような地形部分の高さを下げる（斜めに傾けている都合上、余分に削る
    //   CSG2のメッシュの引き算が使えない為（対象がribbon／面で、体積が無いから？）
    {
        let x0 = nmin*gridratio, z0 = x0, nx = nmax-nmin, nn = Math.floor(4/gridratio), yh = 1.2;
        for (let p of points) {
            let x = p.x, z = p.z, ix,iz;
            ix = Math.floor((x-x0)/gridratio);
            iz = Math.floor((z-z0)/gridratio);
            for (let jz = iz-nn; jz < iz+nn; ++jz) {
            for (let jx = ix-nn; jx < ix+nn; ++jx) {
                if (rootPath[jz][jx].y > p.y-yh) {
                    rootPath[jz][jx].y = p.y-yh;
                }
            }
            }
        }
    }
    let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
    trgMesh.material = new BABYLON.GradientMaterial("grad", scene);
    trgMesh.material.topColor = new BABYLON.Color3(0.9, 0.2, 0.2);
    trgMesh.material.bottomColor = new BABYLON.Color3(0.2, 0.2, 0.9);
    // trgMesh.material.smoothness = 0.6*yratio; // 高低差yratioを変えてmaterialを変えないために、yratio に比例させる
    trgMesh.material.smoothness = 0.2*yratio; // 高低差yratioを変えてmaterialを変えないために、yratio に比例させる
    trgMesh.material.scale = 0.005*yratio;     // yratio に比例させる
    trgMesh.material.wireframe = true;
//    trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
    let geoMesh = trgMesh;


    let roadMesh;
    if (1) { // 道路っぽい道
    let tubeH = 0.3;
    let tubeW12 = 3;
    // 水平にすると外側が落ち込むように傾くので、あらかじめ内側が下になるよう傾けておく
    const myShape = [
        new BABYLON.Vector3(-tubeW12-tubeH,  tubeH, 0),
        new BABYLON.Vector3(-tubeW12      , -tubeH, 0),
        new BABYLON.Vector3( tubeW12      ,  tubeH, 0),
        new BABYLON.Vector3( tubeW12-tubeH,  tubeH*3, 0)
    ];
    let rotation = -Math.PI*2/points.length;
    let options = {shape: myShape,
                   path: points,
                   sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                   adjustFrame:true};
    trgMesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
    trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05, closePath:true }, scene);
    roadMesh = trgMesh;
    }

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
        }
        return mat;
    }

    let matMy = createMat('std_trans'); // 自機

    // Player/Character state
    var state = "IN_AIR";
    var inAirSpeed = 20.0;
    var onGroundSpeed = 5.0;
    var jumpHeight = 5; // 1.5;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -18, 0);

    let keyAction = {forward:0, back:0, right:0, left:0, jump:0};

    // Physics shape for the character
    let myh = 1.8;
    let myr = 0.6;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: myh, radius: myr}, scene);
    displayCapsule.material = matMy;
    let characterPosition = new BABYLON.Vector3(0, yratio+ 10, -r*gridratio);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: myh, capsuleRadius: myr}, scene);

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 2);
    localAxes.xAxis.parent = displayCapsule; localAxes.yAxis.parent = displayCapsule; localAxes.zAxis.parent = displayCapsule;

    camera.lockedTarget = displayCapsule;
    var getNextState = function(supportInfo) {
        if (state == "IN_AIR") {
            if (supportInfo.supportedState == BABYLON.CharacterSupportedState.SUPPORTED) {
                return "ON_GROUND";
            }
            return "IN_AIR";
        } else if (state == "ON_GROUND") {
            if (supportInfo.supportedState != BABYLON.CharacterSupportedState.SUPPORTED) {
                return "IN_AIR";
            }
            if (keyAction.jump) {
                return "START_JUMP";
            }
            return "ON_GROUND";
        } else if (state == "START_JUMP") {
            return "IN_AIR";
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
        if (state == "IN_AIR") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
            {
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
            }
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


    // Input to direction
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 'ArrowUp') {
                inputDirection.z = 1;
                keyAction.forward = 1;
            } else if (kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowDown') {
                inputDirection.z = -1;
                keyAction.back = 1;
            } else if (kbInfo.event.key == 'a' || kbInfo.event.key == 'ArrowLeft') {
                keyAction.left = 1;
            } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
                keyAction.right = 1;
            } else if (kbInfo.event.key == ' ') {
                keyAction.jump = 1;
            } else if (kbInfo.event.key == 'c') {
                icamera = (icamera+1) % 4;
                console.log("camera=",icamera);
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 3;
                    camera.heightOffset = 1.1;
                    camera.cameraAcceleration = 0.1;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 8;
                    camera.heightOffset = 3;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 1;
                    camera.heightOffset = 20;
                    camera.cameraAcceleration = 0.5;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.5;
                    camera.heightOffset = 0.1;
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
            }
            if (kbInfo.event.key == 'a' || kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowLeft' || kbInfo.event.key == 'ArrowRight') {
                inputDirection.x = 0;
                keyAction.left = 0;
                keyAction.right = 0;
            } else if (kbInfo.event.key == ' ') {
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
    text1.text = "Usage:\n(W,S) or (Arrow UP/DOWN): Forward/Back\n(A,D) or (Arrow Left/Right): turn Left/Right\n(Space): jump\nC: change Camera\nR: Reset position\nH: show/hide this message";
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

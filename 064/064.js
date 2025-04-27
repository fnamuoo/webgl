// トーラス結び目の中を走る
//
// キー操作
//    カーソルキー／w,s,a,d := 移動・方向転換
//    spc     := ジャンプ
//    c       := カメラ切り替え
//    h       := usage表示切替

function createTube(geo, mat, scene) {
    let trgMesh, trgAgg;
    let adjy = 1.733, x=0, y=0, z=0;
    let myPath = [];
    if (geo.type == 'st') {
        myPath = [
            new BABYLON.Vector3(x, y+adjy, z+0),
            new BABYLON.Vector3(x, y+adjy, z+50)
            ];
    } else if (geo.type == 'custom1') {
        // 八の字を描くような曲線
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

    } else if (geo.type == 'torusKnot') {
        // https://ja.wikipedia.org/wiki/%E3%83%88%E3%83%BC%E3%83%A9%E3%82%B9%E7%B5%90%E3%81%B3%E7%9B%AE
        // https://ja.wikipedia.org/w/index.php?title=%E3%83%88%E3%83%BC%E3%83%A9%E3%82%B9%E7%B5%90%E3%81%B3%E7%9B%AE&section=6#%E5%BA%A7%E6%A8%99%E3%81%AB%E3%82%88%E3%82%8B%E7%9B%B4%E6%8E%A5%E7%9A%84%E3%81%AA%E5%AE%9A%E7%BE%A9
        // 円柱座標系
        //  p, q は互いに素、[0<=t<=1]
        //      r = 1 + 1/2*cos(2*PI*p*t)
        //  theta = 2*PI*q*t
        //      z = 1/2*sin(2*PI*p*t)
        //  ------
        //  x = r*cos(theta)
        //  z = r*sin(theta)
        //  y = z
        let p = 2, q = 3, rArc = 20;
        let tdiv = 200; // t の分割個数（曲率の滑らかさ
        let zrate = 5; // Z軸で重ならないようにするための倍率
        let pcutpct = 0.01; // 切れ目を入れるときの抜き取るデータの個数（％）
        let adjy = 2;
        if ('p' in geo) { p = geo.p; }
        if ('q' in geo) { q = geo.q; }
        if ('r' in geo) { rArc = geo.r; }
        if ('tdiv' in geo) { tdiv = geo.tdiv; }
        if ('zrate' in geo) { zrate = geo.zrate; }
        if ('adjy' in geo) { adjy = geo.adjy; }
        let nt = p*q*tdiv, t, radp, radq, r, theta, x, y, z, x2, y2, z2;
        let c2PIp = 2*Math.PI*p, c2PIq = 2*Math.PI*q;
        // y座標最小値のところを出入口にする。そのため最小の位置を取得
        let ymin = 9999, itmin = 0;
        for (let it = 0; it < nt; ++it) {
            t = it/nt;
            radp = c2PIp*t;
            radq = c2PIq*t;
            r = (1 + 0.5*Math.cos(radp))*rArc;
            theta = radq;
            z = 0.5*Math.sin(radp);
            x2 = r*Math.cos(theta);
            y2 = z*zrate + adjy;
            z2 = r*Math.sin(theta);
            myPath.push(new BABYLON.Vector3(x2, y2, z2));
            if (ymin > y2) {
                ymin = y2;
                itmin = it;
            }
        }
        if (itmin > 0) {
            // 一度 itmin 位置で分割して 分割した位置が先頭になるよう入れ替えて結合
            let myPathA = myPath.slice(0, itmin);
            let myPathB = myPath.slice(itmin);
            myPath = myPathB.concat(myPathA);
        }
        let ncut = Math.ceil(nt*pcutpct); // 抜き取るデータ数
        myPath = myPath.slice(0, nt-ncut);

    } else if (geo.type == 'trefoilKnot') {
        // https://threejs.org/examples/#webgl_geometry_extrude_splines
        // trefoil Knot

        // https://www.mathcurve.com/courbes3d.gb/noeuds/noeuddetrefle.shtml
        // //   x = cos(t) + 2*cos(2t)
        // //   y = sin(t) - 2*sin(2t)
        // //   z = 2*sin(3t)
        function f1(rad) {
            let cos_t = Math.cos(rad);
            let cos_2t = Math.cos(2*rad);
            let sin_t = Math.sin(rad);
            let sin_2t = Math.sin(2*rad);
            let sin_3t = Math.sin(3*rad);
            return [cos_t+2*cos_2t, sin_t-2*sin_2t, 2*sin_3t];
        }

        //   x = sin(2t)
        //   y = sin(t)*cos(2t)
        //   z = cos(3t)
        function f2(rad) {
            let sin_t = Math.sin(rad);
            let sin_2t = Math.sin(2*rad);
            let cos_2t = Math.cos(2*rad);
            let cos_3t = Math.cos(3*rad);
            return [sin_2t, sin_t*cos_2t, cos_3t];
        }

        // https://en.wikipedia.org/wiki/Trefoil_knot
        // x = sin(t) + 2*sin(2*t)
        // y = cos(t) - 2*cos(2*t)
        // z = -sin(3*t)
        function f3(rad) {
            let sin_t = Math.sin(rad);
            let sin_2t = Math.sin(2*rad);
            let sin_3t = Math.sin(3*rad);
            let cos_t = Math.cos(rad);
            let cos_2t = Math.cos(2*rad);
            return [sin_t+2*sin_2t, cos_t-2*cos_2t, -sin_3t];
        }

        let func = 'f1';
        let fccb = f1;  // 関数ポインタ
        let ndiv = 100; // radian の分割個数（曲率の滑らかさ
        let zoom = 10;
        let yrate = 2; // Y軸で重ならないようにするための倍率
        let pcutpct = 0.01; // 切れ目を入れるときの抜き取るデータの個数（％）
        let adjy = 5;
        if ('ndiv' in geo) { ndiv = geo.ndiv; }
        if ('zoom' in geo) { zoom = geo.zoom; }
        if ('yrate' in geo) { yrate = geo.yrate; }
        if ('adjy' in geo) { adjy = geo.adjy; }
        if ('func' in geo) { func = geo.func; }
        if (func == 'f2') {  // 関数の切り替え
            fccb = f2;
        } else if (func == 'f3') {
            fccb = f3;
        } else if (func == 'f4') {
            fccb = f4;
        }
        let radstep = 2*Math.PI / ndiv;
        let rad, x, y, z, x2, y2, z2;
        // y座標最小値のところに切れ目を入れるために、最小の位置を取得
        let ymin = 9999, iradmin = 0;
        for (let irad = 0; irad < ndiv; ++irad) {
            rad = irad * radstep;
            [x,y,z] = fccb(rad);
            x2 = x*zoom;
            y2 = y*yrate + adjy;
            z2 = z*zoom;
            myPath.push(new BABYLON.Vector3(x2, y2, z2));
            if (ymin > y2) {
                ymin = y2;
                iradmin = irad;
            }
        }
        if (iradmin > 0) {
            // 一度 itmin 位置で分割して 分割した位置が先頭になるよう入れ替えて結合
            let myPathA = myPath.slice(0, iradmin);
            let myPathB = myPath.slice(iradmin);
            myPath = myPathB.concat(myPathA);
        }
        let ncut = Math.ceil(ndiv*pcutpct); // 抜き取るデータ数
        myPath = myPath.slice(0, ndiv-ncut);

    } else {
        return [trgMesh, trgAgg];
    }
    trgMesh = BABYLON.MeshBuilder.CreateTube("tube", {path: myPath, radius: 2, sideOrientation: BABYLON.Mesh.DOUBLESIDE, tessellation: 6}, scene);
    trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
    if (mat != null) {
        trgMesh.material = mat;
    }
    trgMesh.physicsBody.disablePreStep = true;
    trgMesh.position = new BABYLON.Vector3(geo.x, geo.y, geo.z);
    if (('rot' in geo) && (geo.rot != 0)) {
        trgMesh.rotate(new BABYLON.Vector3(0, 1, 0), geo.rot, BABYLON.Space.WORLD);
    }
    if (('rotx' in geo) && (geo.rotx != 0)) {
        trgMesh.rotate(new BABYLON.Vector3(1, 0, 0), geo.rotx, BABYLON.Space.WORLD);
    }
    trgMesh.physicsBody.disablePreStep = false;
    return [trgMesh, trgAgg];
}


// 右左(ad)で方向転換
// カーソルで移動(カーソルでカメラワークを無効に)
var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.rotationOffset = 180;
    camera.radius = 3;
    camera.heightOffset = 1.1;
    camera.cameraAcceleration = 0.1;
    camera.maxCameraSpeed = 30;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 0;

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Initialize Havok plugin
    const hk = new BABYLON.HavokPlugin(false);
    // Enable physics in the scene with a gravity
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);


    // 地面を設定する
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 200, height: 200 }, scene);
    // groundMesh.position.y = 0;
    groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMesh.material.majorUnitFrequency = 1;
    groundMesh.material.minorUnitVisibility  = 0;
    // 地面に摩擦係数、反射係数を設定する
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);


    function createMat(type) {
        let mat = null;
        if (type=='std_wire') {
            mat = new BABYLON.StandardMaterial("mat", scene);
            mat.emissiveColor = BABYLON.Color3.Blue();
            mat.wireframe = true;
        } else if (type=='std_trans') {
	    mat = new BABYLON.StandardMaterial('mat', scene);
	    mat.diffuseColor = BABYLON.Color3.Blue();
	    mat.alpha = 0.2;
        } else if (type=='nmr') {
            mat = new BABYLON.NormalMaterial("mat", scene);
            mat.wireframe = true;
            trgMesh.material = mat;
        } else if (type=='grid') {
	    mat = new BABYLON.GridMaterial("mat", scene);
	    mat.majorUnitFrequency = 5;
	    mat.gridRatio = 0.5;
        } else if (type=='grad') {
	    mat = new BABYLON.GradientMaterial("grad", scene);
            mat.topColor = new BABYLON.Color3(1, 1, 1);
            mat.bottomColor = new BABYLON.Color3(0, 0, 1);
            mat.offset = 0.5;
            mat.smoothness = 1;
            mat.wireframe = true;
        }
        return mat;
    }

    let mat = createMat('grid');
    let mat2 = createMat('std_wire');
    let mat3 = createMat('grad');

    if (1) {
        // 左手
        createTube({type:'torusKnot', p:2, q:3, x:-40, y:2.1, z:60}, mat, scene);
        createTube({type:'torusKnot', p:4, q:1, x:-50, y:2.1, z:-10}, mat2, scene);
        createTube({type:'torusKnot', p:5, q:2, x:-40, y:2.1, z:-80}, mat3, scene);
        // 右手
        createTube({type:'trefoilKnot', x:30, y:2.1, z:50}, mat, scene);
        createTube({type:'trefoilKnot', x:40, y:4.5, z:-10, yrate:8, func:'f2'}, mat2, scene);
        createTube({type:'trefoilKnot', x:30, y:2.5, z:-70, yrate:2, rotx:0, func:'f3'}, mat3, scene);
    }


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
    let h = 1.8;
    let r = 0.6;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: h, radius: r}, scene);
    let characterPosition = new BABYLON.Vector3(0, 10, -8);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: h, capsuleRadius: r}, scene);
    camera.lockedTarget = displayCapsule;

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 2);
    localAxes.xAxis.parent = displayCapsule; localAxes.yAxis.parent = displayCapsule; localAxes.zAxis.parent = displayCapsule;

    // State handling
    // depending on character state and support, set the new state
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

            // if (wantJump) {
            if (keyAction.jump) {
                return "START_JUMP";
            }
            return "ON_GROUND";
        } else if (state == "START_JUMP") {
            return "IN_AIR";
        }
    }

    // From aiming direction and state, compute a desired velocity
    // That velocity depends on current state (in air, on ground, jumping, ...) and surface properties
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
            // Restore to original vertical component
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            // Add gravity
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            // Move character relative to the surface we're standing on
            // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
            // avoid artifacts caused by filtering of the output velocity when standing on moving objects.
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);

            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
            // Horizontal projection
            {
                outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
                let inv1k = 1e-3;
                if (outputVelocity.dot(upWorld) > inv1k) {
                    let velLen = outputVelocity.length();
                    outputVelocity.normalizeFromLength(velLen);

                    // Get the desired length in the horizontal direction
                    let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);

                    // Re project the velocity onto the horizontal plane
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

    // Display tick update: compute new camera position/target, update the capsule for the character display
    scene.onBeforeRenderObservable.add((scene) => {
        displayCapsule.position.copyFrom(characterController.getPosition());
    });

    // After physics update, compute and set new velocity, update the character controller state
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
        // let desiredLinearVelocity = getDesiredVelocity(dt, support, quat, characterController.getVelocity());
        characterController.setVelocity(desiredLinearVelocity);

        characterController.integrate(dt, support, characterGravity);
    });


    // Input to direction
    // from keys down/up, update the Vector3 inputDirection to match the intended direction. Jump with space
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
                // inputDirection.x = -1;
                keyAction.left = 1;
            } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
                // inputDirection.x = 1;
                keyAction.right = 1;
            } else if (kbInfo.event.key == ' ') {
                // wantJump = true;
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
                    camera.radius = 20;
                    camera.heightOffset = 8;
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
            } else if (kbInfo.event.key == 'h') {
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
                // wantJump = false;
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
    text1.text = "Usage:\n(W,S) or (Arrow UP/DOWN): forward/back\n(A,D) or (Arrow Left/Right): turn Left/Right\n(Space): Jump\nC: change Camera\nH: show/hide this message";
    text1.color = "white";
    text1.width = "260px";
    text1.fontSize = 12;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    
    
    return scene;
};


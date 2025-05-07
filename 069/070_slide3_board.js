// チューブで滑り台、ボードですべる
//
// キャラクターコントローラー
//  - カーソル右左/(a,d)        .. ヨー（垂直／上方向の軸で回転
//  - カーソル右左/(a,d)＋上(w) .. ロール（進行方向の軸で回転
//  - カーソル下/(s)            .. 減速
//  - r     .. 前後を180度回転（前後を入れ替え
//  - space .. ジャンプ
//  - enter .. スタート地点／頂上に移動
//  - b     .. 頂上にボールを出現
//  - c     .. カメラ１の視点切り替え
//  - v     .. カメラ２（ワイプ）の切り替え
//  - n     .. ステージの切り替え
//  - t     .. 乱数なステージの再構成

const R5 = Math.PI/36; // 5度  360=72回 , 180=36回, 90=18回, 45=9回
const R90 = Math.PI/2;
const R180 = Math.PI;
const R360 = Math.PI*2;

function createTube(geo, mat, scene) {
    let trgMesh, trgAgg;
    let adjy = 1.733, x=0, y=0, z=0;
    let myPath = [];
    if (geo.type == 'st') {
        myPath = [
            new BABYLON.Vector3(x, y+adjy, z+0),
            new BABYLON.Vector3(x, y+adjy, z+50)
            ];

    } else if (geo.type == 'type1') {
        // 円（コイル）、等幅で上昇
        let nloop = 2, loopy = 8, r = 10;
        if ('nloop' in geo) { nloop = geo.nloop; }
        if ('loopy' in geo) { loopy = geo.loopy; }
        if ('r' in geo) { r = geo.r; }
        let n = nloop*72, stepy = loopy/72;
        for (let i = 0; i < n; ++i) {
            irad = i * R5;
            x = r*Math.cos(irad); y = i*stepy + adjy; z = r*Math.sin(irad);
            myPath.push(new BABYLON.Vector3(x, y, z));
        }

    } else if (geo.type == 'type2') {
        // らせん／円で半径を徐々に大きく、半径に応じて上昇幅up
        let nloop = 2, loopy = 8, r = 5, rstep = 0.1;
        if ('nloop' in geo) { nloop = geo.nloop; }
        if ('loopy' in geo) { loopy = geo.loopy; }
        if ('r' in geo) { r = geo.r; }
        let n = nloop*72, stepy = loopy/72;
        for (let i = 0; i < n; ++i) {
            irad = i * R5;
            x = r*Math.cos(irad); y = i*stepy + (r**2)*0.05 + adjy; z = r*Math.sin(irad);
            myPath.push(new BABYLON.Vector3(x, y, z));
            r += rstep;
        }

    } else if (geo.type == 'type3') {
        // 乱数（等確率）で右／左の円弧(90度ごと)、等幅で上昇
        let narc = 8, arcy = 2, r = 10;
        if ('narc' in geo) { narc = geo.narc; }
        if ('loopy' in geo) { loopy = geo.loopy; }
        if ('r' in geo) { r = geo.r; }
        let stepy = arcy/18, jarc = 0, x0=0, z0=0, arcType, arcTypeOld = true, i = 0;
        for (let iarc = 0; iarc < narc; ++iarc) {
            arcType = (Math.random() < 0.5);
            if (arcType) {
                // 左円弧
                if (arcTypeOld != arcType) {
                    x0 += -2*r*Math.cos(jarc*R90); z0 += -2*r*Math.sin(jarc*R90);
                }
                for (let j = 0; j < 18; ++j) {
                    irad = j * R5 + jarc*R90;
                    x = x0 + r*Math.cos(irad); y = i*stepy + adjy; z = z0 + r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                    ++i;
                }
                jarc = (jarc+1)%4;
            } else {
                // 右円弧
                if (arcTypeOld != arcType) {
                    x0 += 2*r*Math.cos(jarc*R90); z0 += 2*r*Math.sin(jarc*R90);
                }
                for (let j = 0; j < 18; ++j) {
                    irad = -j*R5 + jarc*R90 + R180;
                    x = x0 + r*Math.cos(irad); y = i*stepy + adjy; z = z0 + r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                    ++i;
                }
                jarc = (jarc+3)%4;
            }
            arcTypeOld = arcType;
        }

    } else if (geo.type == 'type4') {
        // 乱数（等確率）で３種（直進、左右の旋回）、等幅で上昇
        // 進行方向ベクトルと旋回のクォータニオンで経路を作成
        let narc = 24, roty = R5, stepy = 0.2, nloop = 15, vst = 1;
        if ('narc' in geo) { narc = geo.narc; }   // 方向転換の数
        if ('stepy' in geo) { stepy = geo.stepy; } // ｙ方向／垂直方向の増分
        if ('vst' in geo) { vst = geo.vst; } // 進行方向の増分
        const quatL = BABYLON.Quaternion.FromEulerAngles(0, roty, 0);
        const quatR = BABYLON.Quaternion.FromEulerAngles(0, -roty, 0);
        const quat0 = new BABYLON.Quaternion();
        let vposi = new BABYLON.Vector3(0, 0, 0); // 座標位置(x,zのみ利用)
        let vdir = new BABYLON.Vector3(0, 0, vst); // 進行方向ベクトル
        let jarc = 0, i = 0, x=0, y=adjy, z=0, idir, quat;
        for (let iarc = 0; iarc < narc; ++iarc) {
            idir = Math.floor(Math.random()*3);
            quat = quat0; // 直進
            if (idir == 0) {
                // 左折
                quat = quatL;
            } else if (idir == 1) {
                // 右折
                quat = quatR;
            }
            for (let iloop = 0; iloop < nloop; ++iloop) {
                vdir = vdir.applyRotationQuaternion(quat); // 進行方向ベクトルの方位を変える
                vposi.addInPlace(vdir);
                myPath.push(new BABYLON.Vector3(vposi.x, y, vposi.z));
                y += stepy;
            }
        }

    } else {
        return [trgMesh, trgAgg, null];
    }
    trgMesh = BABYLON.MeshBuilder.CreateTube("tube", {path: myPath, radius: 2, sideOrientation: BABYLON.Mesh.DOUBLESIDE, tessellation: 64}, scene);
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
    return [trgMesh, trgAgg, myPath[myPath.length-5]];
}

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    // ボール(赤)用カメラ２
    let camera2type = 0; // ワイプ表示 (0: 無し、1: caemra2, 2:camera2B
    let camera2 = new BABYLON.ArcRotateCamera("Camera2", 0, 0, 0, new BABYLON.Vector3(2, 5, -10), scene);
    camera2.rotationOffset = 180;
    camera2.radius = 3;
    camera2.heightOffset = 1.1;
    camera2.setTarget(BABYLON.Vector3.Zero());
    camera2.attachControl(canvas, true);
    camera2.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let camera2B = new BABYLON.FreeCamera("Camera2B", new BABYLON.Vector3(2, 5, -10), scene);
    camera2B.setTarget(BABYLON.Vector3.Zero());
    camera2B.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    scene.activeCameras.push(camera);
    camera.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
    camera2.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);
    camera2B.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);

    let iPosiList = [];
    let iPosi = 0;

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const physicsPlugin = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), physicsPlugin);

    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 200, height: 200 }, scene);
    groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMesh.material.majorUnitFrequency = 1;
    groundMesh.material.minorUnitVisibility  = 0;
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.6}, scene);

    if (1) {
    // Skybox
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
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
        } else if (type=='std_red') {
	    mat = new BABYLON.StandardMaterial('mat', scene);
	    mat.diffuseColor = BABYLON.Color3.Red();
	    mat.alpha = 0.7;
        } else if (type=='std_white') {
	    mat = new BABYLON.StandardMaterial('mat', scene);
	    mat.diffuseColor = BABYLON.Color3.White();
	    mat.alpha = 0.7;
        } else if (type=='nmr') {
            mat = new BABYLON.NormalMaterial("mat", scene);
            mat.wireframe = true;
            mat.material = mat;
        } else if (type=='grid') {
	    mat = new BABYLON.GridMaterial("mat", scene);
	    mat.majorUnitFrequency = 5;
	    mat.gridRatio = 0.5;
        } else if (type=='grad') {
	    mat = new BABYLON.GradientMaterial("grad", scene);
            mat.topColor = new BABYLON.Color3(1, 1, 1);
            mat.bottomColor = new BABYLON.Color3(1, 0.6, 0.6);
            mat.smoothness = -0.1;
            // mat.wireframe = true;
        }
        return mat;
    }

    let mat = createMat('grid');
    let mat2 = createMat('std_wire');
    let matMy = createMat('grad'); // 自機
    let matRed = createMat('std_red'); // ボール（赤

    // ボードとボールの衝突しないように、ボードとボールにおなじIDを割り振って、地面とTUBEに衝突判定させるために違うIDを
    // 衝突フィルター（filterMembershipMask, filterCollideMask）の為のID
    const FILTER_GROUP_BOARD = 1;
    const FILTER_GROUP_BALL = 2;
    const FILTER_GROUP_GROUND = 4;
    const FILTER_GROUP_TUBE = 8;

    let nstage = 4;
    let istage = 0;
    let stageMesh = null, stageAgg = null, lastPosi;
    function createStage(istage) {
        if (stageAgg != null) {
            stageAgg.dispose();
        }
        if (stageMesh != null) {
            stageMesh.dispose();
        }
        if (0) {
            // !!!
        } else if (istage == 0) {
            [stageMesh, stageAgg, lastPosi] = createTube({type:'type1', nloop:10, x:0, y:0, z:0}, mat2, scene);
        } else if (istage == 1) {
            [stageMesh, stageAgg, lastPosi] = createTube({type:'type2', nloop:8, x:0, y:0, z:0}, mat2, scene);
        } else if (istage == 2) {
            [stageMesh, stageAgg, lastPosi] = createTube({type:'type3', narc:40, x:0, y:0, z:0}, mat2, scene);
        } else if (istage == 3) {
            [stageMesh, stageAgg, lastPosi] = createTube({type:'type4', narc:50, x:0, y:0, z:0}, mat2, scene);
        }
        stageAgg.shape.filterMembershipMask = FILTER_GROUP_TUBE;
        if (iPosiList.length >= 2) {
            iPosiList.pop();
        }
        iPosiList.push(lastPosi);
    }
    createStage(istage);

    // ボールの配置
    let balls = [];
    let iniSetBall = true;
    function setBalls() {
        for (let [trgMesh, trgAgg] of balls) {
            trgAgg.dispose();
            trgMesh.dispose();
        }
        balls = [];
        let posi = iPosiList[1];
        for (let i = 0; i < 3; ++i) {
            let trgMesh, trgAgg;
            trgMesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1, segments: 8 }, scene);
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.1, restitution:0.05}, scene);
            trgAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            trgAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);

            trgAgg.shape.filterMembershipMask = FILTER_GROUP_BALL;
            // trgAgg.shape.filterCollideMask = FILTER_GROUP_GROUND | FILTER_GROUP_TUBE | FILTER_GROUP_BOARD; // ボードとの衝突あり
            trgAgg.shape.filterCollideMask = FILTER_GROUP_GROUND | FILTER_GROUP_TUBE; // ボードとの衝突なし

            trgMesh.position.copyFrom(posi);
            trgMesh.position.x += BABYLON.Scalar.RandomRange(-0.1, 0.1);
            trgMesh.position.y += BABYLON.Scalar.RandomRange(1, 1.5);
            trgMesh.position.z += BABYLON.Scalar.RandomRange(-0.1, 0.1);
            balls.push([trgMesh, trgAgg]);
            if (i == 0) {
                trgMesh.material = matRed;
            }
        }
        if (iniSetBall) {
            iniSetBall = false;
            scene.activeCameras.push(camera2);
            camera2type = 1;
        }
        camera2.lockedTarget = balls[0][0];
        camera2B.lockedTarget = balls[0][0];
    }

    // Player/楕円形
    let myMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: 1.0, diameterY: 0.5, diameterZ: 4.0, segments: 8 }, scene);
    let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, friction: 0.08, restitution:0.05}, scene);
    let linearDampingBase = 0.0; // 0.03;  // スピードが乗りすぎるときはこちらで調整
    let linearDampingBrake = 2; // ブレーキ時
    myMesh.physicsBody.setLinearDamping(linearDampingBase);

    myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
    myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
    myAgg.shape.filterMembershipMask = FILTER_GROUP_BOARD;
    // myAgg.shape.filterCollideMask = FILTER_GROUP_BALL | FILTER_GROUP_GROUND | FILTER_GROUP_TUBE; //ballと衝突あり
    myAgg.shape.filterCollideMask = FILTER_GROUP_GROUND | FILTER_GROUP_TUBE; //ballと衝突なし

    myMesh.material = matMy;
    camera.lockedTarget = myMesh;
    let posiIni = new BABYLON.Vector3(0, 3, 0);
    myMesh.position = posiIni.clone();

    iPosiList.unshift(posiIni);

    scene.onBeforeRenderObservable.add((scene) => {
        let vdir = camera.position.subtract(myMesh.position).normalize().scale(5);
        vdir.y = 1;
        camera.position = myMesh.position.add(vdir);
        // カメラ２用の更新
        if (camera2type >= 2) {
            let ballMesh = balls[0][0];
            let vdir2 = camera2B.position.subtract(ballMesh.position).normalize().scale(5);
            vdir2.y = 1;
            camera2B.position = ballMesh.position.add(vdir2);
        }
    });


    if (1) {
    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 0.5);
    localAxes.xAxis.parent = myMesh; localAxes.yAxis.parent = myMesh; localAxes.zAxis.parent = myMesh;
    }

    var map ={}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    let cooltime_act = 0, cooltime_actIni = 30, vforceBase = 0.04, vforce = 0.04, bDash=3, jumpforce = 68;
    const qYR90 = BABYLON.Quaternion.FromEulerAngles(0, R90, 0);
    const qYR180 = BABYLON.Quaternion.FromEulerAngles(0, R180, 0);
    scene.registerAfterRender(function() {
        if ((map["w"] || map["ArrowUp"]) && (map["a"] || map["ArrowLeft"])) {
            // ロール（左／逆回転  .. 上下ひっくり返りはこちらで対応
            let vdir = new BABYLON.Vector3(0 ,0, vforce*2);
            vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
            myMesh.physicsBody.applyAngularImpulse(vdir);
        } else if ((map["w"] || map["ArrowUp"]) && (map["d"] || map["ArrowRight"])) {
            // ロール（右／順回転
            let vdir = new BABYLON.Vector3(0 ,0, -vforce*2);
            vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
            myMesh.physicsBody.applyAngularImpulse(vdir);
        } else if (map["a"] || map["ArrowLeft"]) {
            // ヨー（右／順回転
            let vdir = new BABYLON.Vector3(0, -vforce, 0);
            vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
            myMesh.physicsBody.applyAngularImpulse(vdir);
        } else if (map["d"] || map["ArrowRight"]) {
            // ヨー（左／逆回転
            let vdir = new BABYLON.Vector3(0, vforce, 0);
            vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
            myMesh.physicsBody.applyAngularImpulse(vdir);
        }
        if (map["s"] || map["ArrowDown"]) {
            // ブレーキ on
            myMesh.physicsBody.setLinearDamping(linearDampingBrake);
            map["brake_off_1st"] = true;
        } else if (map["brake_off_1st"]) {
            // ブレーキ off
            map["brake_off_1st"] = false;
            myMesh.physicsBody.setLinearDamping(linearDampingBase);
        }
        if (map[" "]) {
            let vdir = new BABYLON.Vector3(0 ,jumpforce, 0);
            myAgg.body.applyForce(vdir, myMesh.absolutePosition);
        }

        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["v"]) {
                if (iniSetBall == false) {
                    cooltime_act = cooltime_actIni;
                    // メイン(camera)とサブ(camera2,camera2B)の複数カメラワーク
                    camera2type = (camera2type+1) % 4;
                    if (camera2type == 0) {
                        // メインのみ
                        while (scene.activeCameras.length > 0) {
                            scene.activeCameras.pop();
                        }
                        scene.activeCameras.push(camera);
                        camera.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
                        camera2B.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);
                    } else if (camera2type == 1) {
                        // メイン（全画面）＋サブ（ワイプ）
                        if (scene.activeCameras.length >= 2) {
                            scene.activeCameras.pop();
                        }
                        scene.activeCameras.push(camera2);
                    } else if (camera2type == 2) {
                        // メイン（全画面）＋サブ（ワイプ）：サブのカメラを入れ替え
                        if (scene.activeCameras.length >= 2) {
                            scene.activeCameras.pop();
                        }
                        scene.activeCameras.push(camera2B);
                    } else if (camera2type == 3) {
                        // サブ（全画面）＋メイン（ワイプ）：メインとサブを入れ替え
                        while (scene.activeCameras.length > 0) {
                            scene.activeCameras.pop();
                        }
                        scene.activeCameras.push(camera2B);
                        scene.activeCameras.push(camera);
                        camera2B.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
                        camera.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);
                    }
                }
            }
            if (map["r"]) {
                cooltime_act = cooltime_actIni;
                // 自機の前後の向きを１８０度回転させる
                myMesh.rotationQuaternion.multiplyInPlace(qYR180);
            } else if (map["t"]) {
                cooltime_act = cooltime_actIni;
                // ランダムなステージを再構築
                createStage(istage);
                myMesh.position = iPosiList[iPosi].clone();
            } else if (map["n"]) {
                cooltime_act = cooltime_actIni;
                // 次のステージへ
                istage = (istage+1) % nstage;
                createStage(istage);
                myMesh.position = iPosiList[iPosi].clone();
            } else if (map["h"]) {
                cooltime_act = cooltime_actIni;
                // help表示のON/OFF
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            } else if (map["Enter"]) {
                cooltime_act = cooltime_actIni;
                // スタート地点／トップに移動
                iPosi = (iPosi+1) % iPosiList.length;
                myMesh.position = iPosiList[iPosi].clone();
            } else if (map["b"]) {
                cooltime_act = cooltime_actIni;
                // 頂上にボールを出現
                setBalls();
            }
        }
    });

    // ////////////////////////////////////////

    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "190px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n(A/D) or (Arrow Left/Right): yaw\n(W and A/D) or (Arrow UP and Left/Right): roll\n(R): turn 180\n(Enter): goto start/top\n(Space): Jump\nN: next stage\nB: pop 3 Balls on top\nV: change Camera2\nT: rebuild random stage\nH: show/hide this message";
    text1.color = "white";
    text1.width = "260px";
    text1.fontSize = 12;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    guiLabelRect.isVisible = false; // デフォルトでoffにしておく
    
    return scene;
};

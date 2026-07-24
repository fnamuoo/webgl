// 二輪・バイク
//
// 操作
// ArrowUp/ArrowDown    .. 加速/減速
// ArrowLeft/ArrowRight .. 旋回（左右）
// ctrl                 .. 加速
// c                    .. カメラ切り替え

// ######################################################################

export var createScene_test_1002 = async function () {
// let coursePath="textures/course/BoxySVG_test1_3_400x300.png"
// let coursePath="../066/textures/BoxySVG_test1_3_400x300.png"
let coursePath="https://raw.githubusercontent.com/fnamuoo/webgl/main/066/textures/BoxySVG_test1_3_400x300.png";

    var scene = new BABYLON.Scene(engine);

    // Create camera and light
    var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(5, 100, 5), scene);
    var light2 = new BABYLON.PointLight("Point", new BABYLON.Vector3(100, 100, 100), scene);
    light2.intensity = 0.2;
    var light2 = new BABYLON.PointLight("Point", new BABYLON.Vector3(-100, 100, -100), scene);
    light2.intensity = 0.2;

    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        let _camera = new BABYLON.ArcRotateCamera("", 3.2/2* Math.PI, 3/8 * Math.PI, 10, new BABYLON.Vector3(0, 0, 0));
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        return _camera;
    }
    let crCamera3 = function() {
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 4;
        _camera.heightOffset = 2.5;
        _camera.cameraAcceleration = 0.05;
        _camera.maxCameraSpeed = 30;
        return _camera;
    }
    let setCAM3 = function(icamera) {
        if (icamera == 0) {
            // 後ろから追っかける（バードビュー
            setVisibility(myMesh, 1);
            camera.radius = 4;
            camera.heightOffset = 2.5;
            camera.cameraAcceleration = 0.05;
            camera.maxCameraSpeed = 30;
        } else if (icamera == 1) {
            // ちょい遅れて／離れて追っかける（バードビュー遠方
            camera.radius = 20;
            camera.heightOffset = 3;
            camera.cameraAcceleration = 0.02;
            camera.maxCameraSpeed = 5;
        } else if (icamera == 2) {
            // 上空（トップビュー
            camera.radius = 1;
            camera.heightOffset = 30;
            camera.cameraAcceleration = 0.5;
            camera.maxCameraSpeed = 100;
        } else if (icamera == 3) {
            // 正面（フロントビュー／ドライバーズビュー
            setVisibility(myMesh, 0);
            camera.radius = 3;
            camera.heightOffset = 1.0;
            camera.cameraAcceleration = 0.5;
            camera.maxCameraSpeed = 100;
        }
    }
    let changeCAM3 = function(_icamera) {
        icamera = (_icamera+1) % ncamera;
        setCAM3(icamera);
    }
    let crCamera6 = function() {
        const _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let renderCamera6 = function() {
        let quat = myMesh.rotationQuaternion;
        let vdir = new BABYLON.Vector3(0, 2.2, -6);
        vdir = vdir.applyRotationQuaternion(quat);
        camera.position = myMesh.position.add(vdir);
        camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
    }

    let crPlane26 = function() {
        // 人型：天使
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 2.0;
        // 天使の輪
        let mesh1 = BABYLON.MeshBuilder.CreateTorus("", {diameter:0.7, thickness:0.1}, scene);
        mesh1.position.set(0.0, 1.2+adjy, 0.0);
        mesh1.parent = mesh;
        // 頭
        let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1}, scene);
        mesh2.position.set(0.0, 0.5+adjy, 0.0);
        mesh2.parent = mesh;
        // ボディ
        let mesh3 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.0, height:2, tessellation:4, diameterBottom:0}, scene);
        mesh3.position.set(0, -1+adjy, 0);
        mesh3.parent = mesh;
        for (let d of [-1, 1]) {
            // 羽
            let mesh4 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh4.rotation.y = 0.2*d;
            mesh4.position.set(0.9*d, -0.1+adjy, -0.2);
            mesh4.parent = mesh;
            let mesh41 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh41.rotation.y = 0.6*d;
            mesh41.position.set(1.5*d, -0.1+adjy, -0.5);
            mesh41.parent = mesh;
            let mesh42 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh42.rotation.y = 0.7*d;
            mesh42.position.set(1.3*d, -0.1+adjy, -0.6);
            mesh42.parent = mesh;
            let mesh43 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh43.rotation.y = 0.9*d;
            mesh43.position.set(1.1*d, -0.1+adjy, -0.65);
            mesh43.parent = mesh;
            let mesh44 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1, diameterY:0.1, diameterZ:0.3}, scene);
            mesh44.rotation.y = 1.1*d;
            mesh44.position.set(0.9*d, -0.1+adjy, -0.65);
            mesh44.parent = mesh;
        }
        return mesh;
    }

    let crMesh01 = function() {
        // バイク
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 1.3;
        let R90 = Math.PI/2;
        let mesh1 = BABYLON.MeshBuilder.CreateBox("", {width:0.8, height:1.0, depth:2.4}, scene);
        mesh1.position.set(0.0, 0.3+adjy, 0.0);
        mesh1.parent = mesh;
        let mesh2 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.6, height:0.4}, scene);
        mesh2.position.set(0.0, -0.5+adjy, 1.1);
        mesh2.rotation.z = R90;
        mesh2.material = new BABYLON.StandardMaterial('mat', scene);
        mesh2.material.diffuseColor = BABYLON.Color3.Black();
        mesh2.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        // mesh2.material.alpha = 0.7;
        mesh2.parent = mesh;
        let mesh3 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.6, height:0.4}, scene);
        mesh3.position.set(0.0, -0.5+adjy, -1.1);
        mesh3.rotation.z = R90;
        mesh3.material = mesh2.material;
        mesh3.parent = mesh;
        return mesh;
    }

    let crMesh02 = function() {
        // バイク
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 1.3;
        let R90 = Math.PI/2;
        // 前輪
        let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1.6, diameterX:0.8}, scene);
        mesh2.position.set(0.0, -0.5+adjy, 1.1);
        mesh2.material = new BABYLON.StandardMaterial('mat', scene);
        mesh2.material.diffuseColor = BABYLON.Color3.Black();
        mesh2.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        mesh2.parent = mesh;
        // 後輪
        let mesh3 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1.6, diameterX:0.8}, scene);
        mesh3.position.set(0.0, -0.5+adjy, -1.1);
        mesh3.material = mesh2.material;
        mesh3.parent = mesh;
        // 前輪シャフト
        let mesh14 = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:1.4, diameterBottom:2.2, height:0.7, tessellation:6}, scene);
        mesh14.rotation.x = 0.1;
        mesh14.position.set(0, -0.0+adjy, 1.2);
        mesh14.scaling.set(0.5, 1, 1);
        mesh14.parent = mesh;
        // フード
        let mesh15 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1.4, diameterY:0.6, diameterZ:0.8, arc:0.3, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh15.position.set(0.0, 0.3+adjy, 1.16);
        mesh15.rotationQuaternion = new BABYLON.Quaternion();
        let quat2 = BABYLON.Quaternion.FromEulerAngles(R90, 0, R90);
        mesh15.rotationQuaternion = quat2.multiply(mesh15.rotationQuaternion);
        quat2 = BABYLON.Quaternion.FromEulerAngles(0.2, 0, 0);
        mesh15.rotationQuaternion = quat2.multiply(mesh15.rotationQuaternion);
        mesh15.parent = mesh;
        // ウイング
        let mesh16 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1.4, diameterY:1.2, diameterZ:0.1, slice:.55, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh16.position.set(0, -0.35+adjy, 1.4);
        mesh16.rotation.x = R90+0.1;
        mesh16.parent = mesh;
        // 後輪シャフト
        let mesh4 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.7, height:0.4, tessellation:6}, scene);
        mesh4.position.set(0, -0.5+adjy, -0.5);
        mesh4.scaling.set(0.9, 1, 1);
        mesh4.parent = mesh;
        // 後輪カバー（シート
        let mesh5 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.8, height:0.8, tessellation:6, arc:0.4, enclose:true });
        mesh5.rotation.x = R90;
        mesh5.rotation.y = -R90;
        mesh5.position.set(0.0, -0.4+adjy, -1.2);
        mesh5.parent = mesh;
        return mesh;
    }

    let crMesh03 = function() {
        // バイク カブ風
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 1.3;
        let R90 = Math.PI/2;
        // 前輪
        let mesh2 = BABYLON.MeshBuilder.CreateTorus("", {diameter:1.2, thickness:0.3, tessellation:48, }, scene);
        mesh2.position.set(0.0, -0.5+adjy, 1.2);
        mesh2.rotation.z = R90;
        mesh2.material = new BABYLON.StandardMaterial('mat', scene);
        mesh2.material.diffuseColor = BABYLON.Color3.Black();
        mesh2.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        // mesh2.material.alpha = 0.7;
        mesh2.parent = mesh;
        // 後輪
        let mesh3 = BABYLON.MeshBuilder.CreateTorus("", {diameter:1.2, thickness:0.3, tessellation:48, }, scene);
        mesh3.position.set(0.0, -0.5+adjy, -1.2);
        mesh3.rotation.z = R90;
        mesh3.material = mesh2.material;
        mesh3.parent = mesh;
        // 風よけ
        let mesh5 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1.5, diameterY:3.0, diameterZ:3.0, slice:0.2, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh5.rotation.x = R90;
        mesh5.position.set(0.0, 0.2+adjy, -1.0);
        mesh5.parent = mesh;
        // 前輪カバー
        let mesh12 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:0.5, diameterY:1.5, diameterZ:1.5, slice:0.4, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh12.rotation.x = -0.8;
        mesh12.position.set(0.0, -0.3+adjy, 1.0);
        mesh12.parent = mesh;
        // ハンドル
        let mesh13 = BABYLON.MeshBuilder.CreateBox("", {width:1.6, height:0.2, depth:0.2}, scene);
        mesh13.position.set(0.0, 1.0+adjy, 0.2);
        mesh13.parent = mesh;
        // エンジンー後輪
        let mesh21 = BABYLON.MeshBuilder.CreateBox("", {width:0.6, height:0.4, depth:1.4}, scene);
        mesh21.position.set(0.0, -0.5+adjy, -0.5);
        mesh21.parent = mesh;
        // シート
        let mesh23 = BABYLON.MeshBuilder.CreateBox("", {width:0.6, height:0.8, depth:0.6}, scene);
        mesh23.position.set(0.0, 0.1+adjy, -0.7);
        mesh23.parent = mesh;
        // 後輪カバー
        // 前輪カバー
        let mesh22 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:0.5, diameterY:1.6, diameterZ:1.6, slice:0.4, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh22.position.set(0.0, -0.3+adjy, -1.2);
        mesh22.parent = mesh;
        return mesh;
    }

    let crMesh04 = function() {
        // バイク  スポーツ風
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 1.3;
        let R90 = Math.PI/2;
        // 前輪
        let mesh2 = BABYLON.MeshBuilder.CreateTorus("", {diameter:1.2, thickness:0.3, tessellation:48, }, scene);
        mesh2.position.set(0.0, -0.5+adjy, 1.2);
        mesh2.rotation.z = R90;
        mesh2.material = new BABYLON.StandardMaterial('mat', scene);
        mesh2.material.diffuseColor = BABYLON.Color3.Black();
        mesh2.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        // mesh2.material.alpha = 0.7;
        mesh2.parent = mesh;
        // 後輪
        let mesh3 = BABYLON.MeshBuilder.CreateTorus("", {diameter:1.2, thickness:0.3, tessellation:48, }, scene);
        mesh3.position.set(0.0, -0.5+adjy, -1.2);
        mesh3.rotation.z = R90;
        mesh3.material = mesh2.material;
        mesh3.parent = mesh;
        // フロント
        let mesh11 = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:0.2, diameterBottom:1.0, height:0.6, tessellation:6}, scene);
        mesh11.rotation.x = R90+0.3;
        mesh11.scaling.set(1, 1, 0.8);
        mesh11.position.set(0.0, 0.5+adjy, 1.2);
        mesh11.parent = mesh;
        // 前輪カバー
        let mesh12 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1.6, diameterY:0.6, arc:0.6, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh12.rotation.z = R90;
        mesh12.rotation.x = 1;
        mesh12.position.set(0.0, -0.1+adjy, 0.6);
        mesh12.parent = mesh;
        // 後輪カバー
        let mesh21 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1.6, diameterY:0.6, arc:0.6, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh21.rotation.z = -R90;
        mesh21.rotation.x = 2.4;
        mesh21.position.set(0.0, -0.2+adjy, -0.6);
        mesh21.parent = mesh;
        // マフラー
        let mesh22 = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:0.2, diameterBottom:0.3, height:1.0, tessellation:6}, scene);
        mesh22.rotation.x = R90+0.3;
        mesh22.rotation.y = -0.1;
        mesh22.position.set(0.3, -0.5+adjy, -1.0);
        mesh22.parent = mesh;
        return mesh;
    }

    let setVisibility = function(mesh, val) {
        mesh.visibility = val;
        for (let _m of mesh.getChildMeshes()) {
            _m.visibility = val;
        }
    };

    if (1) {
        let grndW=3000, grndH=3000;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
    }
    
    if (1) {
        // コース画像
        let crsW=200, crsH=150;
        const courseMesh = BABYLON.MeshBuilder.CreateGround("course", { width:crsW, height:crsH }, scene);
        courseMesh.position.y=0.01;
        courseMesh.material = new BABYLON.StandardMaterial("");
        courseMesh.material.diffuseTexture = new BABYLON.Texture(coursePath);
        courseMesh.material.diffuseTexture.hasAlpha = true;
        courseMesh.material.emissiveColor = BABYLON.Color3.White();
        courseMesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        courseMesh.material.alpha = 0.5;
    }

    let idevice=1; // 疑似飛行機モード：カーソルで簡単操作／宙返りや背面飛行ができないけど
    let act = {mfb:0, mrl:0, mud:0, rrl:0, ctrl:0, ent:0, spc:0};
    let map ={};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    let quick=false, rightRoll = false, lefttRoll = false;
    let mx=1,mz=1;
    let mvScale=0.2;
    let cooltime_act = 0, cooltime_actIni = 10;
    scene.registerAfterRender(function() {
        if (idevice==1) {
            // 疑似飛行機モード
            act.mud=0;
            if (map["ArrowUp"]) {
                act.mud=1;
            } else if (map["ArrowDown"]) {
                act.mud=-1;
            }
            act.mrl=0;
            if (map["ArrowRight"]) {
                act.mrl=1;
            } else if (map["ArrowLeft"]) {
                act.mrl=-1;
            }
        }

        // 共通
        act.ctrl=0;
        if (map["ctrl"]) { act.ctrl = 1; }
        act.ent=0;
        if (map["Enter"]) { act.ent=1; }
        act.spc=0;
        if (map[" "]) { act.spc=1; }

        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["v"]) {
                // 操作方法の切り替え
                cooltime_act = cooltime_actIni;
                idevice = (idevice+1) % 3;
                console.log("idevice=", idevice);
            }

            if (map["c"]) {
                // camera
                cooltime_act = cooltime_actIni;
                icamera3 = (icamera3+1)%ncamera3;
                console.log("camera=", icamera3);
                setCAM3(icamera3);
            }

        }
    });

    scene.onBeforeRenderObservable.add(() => {
        let quat = myMesh.rotationQuaternion;
        if (idevice==1) {
            // 機体操作２：ロール角度に応じたヨー回転と自動補正
            const R90 = Math.PI/2;
            {
                let v3F = BABYLON.Vector3.Forward().applyRotationQuaternion(myMesh._quat); // 進行方向
                let v3HB = updir.cross(v3F).normalize(); // 水平-binormal方向
                let v3HF = updir.cross(v3HB).normalize(); // 水平-全面方向
                // 見た目の上方向
                let viewU = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                let viewF = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                if (act.spc) {
                    // brake
                    myMesh._acc = Math.max(myMesh._acc + myMesh._accM, myMesh._accMin);
                } else if (act.mud != 0) {
                    if (act.mud > 0) {
                        myMesh._acc = Math.min(myMesh._acc + myMesh._accP, myMesh._accMax);
                    } else {
                        myMesh._acc = Math.max(myMesh._acc + myMesh._accM, myMesh._accMin);
                    }
                }
                // ヨー回転
                if (act.mrl != 0) {
                    let v = 0.05*act.mrl;
                    myMesh._roll += v;
                    let raduu = Math.acos(viewU.dot(updir));
                    let vdotHB = viewU.dot(v3HB);
                    if ((v*vdotHB < 0)  || (v*vdotHB >= 0 && raduu < R90)) {
                        let quatR = BABYLON.Quaternion.RotationAxis(viewF, -v);
                        quat = quatR.multiply(quat);
                        myMesh.rotationQuaternion = quat;
                    }
                }
                if (myMesh._roll != 0) {
                    // roll に応じたヨー
                    let v = myMesh._roll;
                    let quatR = BABYLON.Quaternion.RotationAxis(updir, v*0.02); //理論値_roll に対する旋回
                    myMesh._quat = quatR.multiply(myMesh._quat);
                    quat = quatR.multiply(quat);
                    myMesh.rotationQuaternion = quat;
                    myMesh._roll = BABYLON.Lerp(v, 0, 0.02); // 等比で減衰
                    if (Math.abs(myMesh._roll) < 1e-3) {
                        myMesh._roll = 0;
                    }
                }
                // 姿勢修正 .. キー入力無しOR加速時
                if ((act.mud >= 0) && (act.mrl == 0)) {
                    let quat0 = BABYLON.Quaternion.FromLookDirectionLH(v3HF, updir);
                    let rlerp = 0.02 + myMesh._acc / 10;
                    myMesh._quat = BABYLON.Quaternion.Slerp(myMesh._quat, quat0, rlerp);
                    quat = BABYLON.Quaternion.Slerp(quat, quat0, rlerp);
                    myMesh.rotationQuaternion = quat;
                }
                // 前進
                let acc = myMesh._acc;
                if (act.ctrl) {
                    acc *= 3;
                }
                v3F.scaleInPlace(acc);
                myMesh.position.addInPlace(v3F);
                // //境界条件
                myMesh.rotationQuaternion = quat;

                setText1(acc*30);
            }
        }
    });

    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // ------------------------------
    // スピードメーター（上部中央）
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Ready!";
    text1.color = "white";
    text1.fontSize = 24;
    text1.height = "36px";
    text1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text1);

    let setText1 = function(val) {
        val = Math.floor(val*3.6) // [m/s]を [km/h]に直す
        text1.text = "" + val + " [km/h]"
    }

    // ------------------------------
    // メッセージ（数秒後にフェードアウト）
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Ready!";
    text2.color = "white";
    text2.fontSize = 24;
    text2.height = "36px";
    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    advancedTexture.addControl(text2);

    let clearText2 = function() {
        text2.text = "";
    }

    let setText2 = function(val) {
        text2.text = "" + val;
        setTimeout(clearText2, 5000);
    }


    // ----------------------------------------

//    let mesh = crMesh01(); // シンプル
//    let mesh = crMesh02();  // ゴテゴテ
//    let mesh = crMesh03(); // カブ風
    let mesh = crMesh04(); // スポーツ風

    let myMesh = mesh;

    myMesh._pold = myMesh.position.clone();
    myMesh.rotationQuaternion = BABYLON.Quaternion.Identity();
    myMesh._vEuler = new BABYLON.Vector3(0,0,0); // idevice=1時の移動用・オイラー角/上記(rotationQuaternion)は姿勢に利用
    myMesh._quat = new BABYLON.Quaternion(); // idevice=1時の移動用
    myMesh._roll = 0; // idevice=1時の移動用
    myMesh._resetPosture = 0; // idevice=2時の姿勢リセットフラグ
    myMesh._acc = 0.3; // 加速度：v3F への係数
    myMesh._accP = 0.002, myMesh._accM = -0.004; // 加速、減速
    myMesh._accMax = 10.0, myMesh._accMin = 0.1;

    camera = crCamera3();
    let icamera3=0, ncamera3=4;
    setCAM3(icamera3);

    camera.setTarget(BABYLON.Vector3.Zero());
    camera.lockedTarget = myMesh;
    let updir = BABYLON.Vector3.Up();
    camera.upVector = updir;

    clearText2();

    // コースの初期位置に移動
    let R90 = Math.PI/2;
    myMesh.position.set(-55, 0, 50);
    myMesh._pold = myMesh.position.clone();
    myMesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, R90, 0);
    myMesh._quat = myMesh.rotationQuaternion.clone();
    myMesh._acc = 0.1;

    return scene;
}

// ######################################################################

export var createScene_test_9999 = async function () {
    var scene = new BABYLON.Scene(engine);

    let camera = null, icamera = 0;
    let crCameraDef = function() {
        let _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(0, 6, -10)); // ヨーロッパ
        _camera.wheelDeltaPercentage = 0.01;
        _camera.attachControl(canvas, true);
        return _camera;
    }

    let crCamera01 = function() {
        let _camera = new BABYLON.ArcRotateCamera("", 1/2* Math.PI, 1/16 * Math.PI, 5, new BABYLON.Vector3(0, 6, -10)); // ヨーロッパ
        _camera.wheelDeltaPercentage = 0.01;
        _camera.attachControl(canvas, true);
        return _camera;
    }
    let crCamera02 = function() {
        let _camera = new BABYLON.ArcRotateCamera("", 3/4* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(0, 6, -10)); // ヨーロッパ
        _camera.wheelDeltaPercentage = 0.01;
        _camera.attachControl(canvas, true);
        return _camera;
    }
    let crCamera03 = function() {
        let _camera = new BABYLON.ArcRotateCamera("", 1/2* Math.PI, 7/16 * Math.PI, 5, new BABYLON.Vector3(0, 6, -10)); // ヨーロッパ
        _camera.wheelDeltaPercentage = 0.01;
        _camera.attachControl(canvas, true);
        return _camera;
    }
    let crCamera04 = function() {
        let _camera = new BABYLON.ArcRotateCamera("", 2/2* Math.PI, 7/16 * Math.PI, 5, new BABYLON.Vector3(0, 6, -10)); // ヨーロッパ
        _camera.wheelDeltaPercentage = 0.01;
        _camera.attachControl(canvas, true);
        return _camera;
    }

    let cameralist = [], camTrgMesh;
    let resetCameraView = function(camera_) {
        while (scene.activeCameras.length > 0) {
            scene.activeCameras.pop();
        }
        scene.activeCameras.push(camera_);
        for (let camera__ of cameralist) {
            camera__.dispose();
        }
        camera_.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
    }
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == -1) {
            camera = crCameraDef();
            resetCameraView(camera);
        }
        if (icamera == 0) {
            camera = crCameraDef();
            // 4分割cameraからの復帰用にリセット
            resetCameraView(camera)
        }
        if (icamera == 1) {
            // 4分割
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralist.push(crCamera01())
            cameralist.push(crCamera02())
            cameralist.push(crCamera03())
            cameralist.push(crCamera04())
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
            }
            cameralist[0].viewport = new BABYLON.Viewport(0.0, 0.5, 0.495, 0.495); // 上段：左
            cameralist[1].viewport = new BABYLON.Viewport(0.5, 0.5, 0.495, 0.495); // 上段：右
            cameralist[2].viewport = new BABYLON.Viewport(0.0, 0.0, 0.495, 0.495); // 下段：左
            cameralist[3].viewport = new BABYLON.Viewport(0.5, 0.0, 0.495, 0.495); // 下段：右
        }
        if (camTrgMesh != null) {
            if (icamera == 1) {
                cameralist[0].lockedTarget = camTrgMesh;
                cameralist[1].lockedTarget = camTrgMesh;
                cameralist[2].lockedTarget = camTrgMesh;
                cameralist[3].lockedTarget = camTrgMesh;
            } else {
                camera.lockedTarget = camTrgMesh;
            }
        }
    }

    const light21 = new BABYLON.HemisphericLight("", new BABYLON.Vector3(-60, 50, 50));
    light21.intensity = 0.3;
    const light22 = new BABYLON.HemisphericLight("", new BABYLON.Vector3(40, 50, 50));
    light22.intensity = 0.3;
    const light23 = new BABYLON.HemisphericLight("", new BABYLON.Vector3(20, 50, -50));
    light23.intensity = 0.3;
    const light3 = new BABYLON.HemisphericLight("", new BABYLON.Vector3(30, -50, -50));
    light3.intensity = 0.2;
    const light32 = new BABYLON.HemisphericLight("", new BABYLON.Vector3(130, -50, 50));
    light32.intensity = 0.2;
    const light33 = new BABYLON.HemisphericLight("", new BABYLON.Vector3(150, -50, 50));
    light33.intensity = 0.2;

    let meshPlane = null;

    // --------------------------------------------------
    let crMesh01 = function() {
        // バイク
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 0.1;
        let R90 = Math.PI/2;
        let mesh1 = BABYLON.MeshBuilder.CreateBox("", {width:0.8, height:1.0, depth:2.4}, scene);
        mesh1.position.set(0.0, 0.3+adjy, 0.0);
        mesh1.parent = mesh;
        let mesh2 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.6, height:0.4}, scene);
        mesh2.position.set(0.0, -0.5+adjy, 1.1);
        mesh2.rotation.z = R90;
        mesh2.material = new BABYLON.StandardMaterial('mat', scene);
        mesh2.material.diffuseColor = BABYLON.Color3.Black();
        mesh2.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        mesh2.parent = mesh;
        let mesh3 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.6, height:0.4}, scene);
        mesh3.position.set(0.0, -0.5+adjy, -1.1);
        mesh3.rotation.z = R90;
        mesh3.material = mesh2.material;
        mesh3.parent = mesh;
        return mesh;
    }

    let crMesh02 = function() {
        // バイク
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 0.1;
        let R90 = Math.PI/2;
        // 前輪
        let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1.6, diameterX:0.8}, scene);
        mesh2.position.set(0.0, -0.5+adjy, 1.1);
        mesh2.material = new BABYLON.StandardMaterial('mat', scene);
        mesh2.material.diffuseColor = BABYLON.Color3.Black();
        mesh2.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        mesh2.parent = mesh;
        // 後輪
        let mesh3 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1.6, diameterX:0.8}, scene);
        mesh3.position.set(0.0, -0.5+adjy, -1.1);
        mesh3.material = mesh2.material;
        mesh3.parent = mesh;
        // 前輪シャフト
        let mesh14 = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:1.4, diameterBottom:2.2, height:0.7, tessellation:6}, scene);
        mesh14.rotation.x = 0.1;
        mesh14.position.set(0, -0.0+adjy, 1.2);
        mesh14.scaling.set(0.5, 1, 1);
        mesh14.parent = mesh;
        // フード
        let mesh15 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1.4, diameterY:0.6, diameterZ:0.8, arc:0.3, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh15.position.set(0.0, 0.3+adjy, 1.16);
        mesh15.rotationQuaternion = new BABYLON.Quaternion();
        let quat2 = BABYLON.Quaternion.FromEulerAngles(R90, 0, R90);
        mesh15.rotationQuaternion = quat2.multiply(mesh15.rotationQuaternion);
        quat2 = BABYLON.Quaternion.FromEulerAngles(0.2, 0, 0);
        mesh15.rotationQuaternion = quat2.multiply(mesh15.rotationQuaternion);
        mesh15.parent = mesh;
        // ウイング
        let mesh16 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1.4, diameterY:1.2, diameterZ:0.1, slice:.55, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh16.position.set(0, -0.35+adjy, 1.4);
        mesh16.rotation.x = R90+0.1;
        mesh16.parent = mesh;
        // 後輪シャフト
        let mesh4 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.7, height:0.4, tessellation:6}, scene);
        mesh4.position.set(0, -0.5+adjy, -0.5);
        mesh4.scaling.set(0.9, 1, 1);
        mesh4.parent = mesh;
        // 後輪カバー（シート
        let mesh5 = BABYLON.MeshBuilder.CreateCylinder("", {diameter:1.8, height:0.8, tessellation:6, arc:0.4, enclose:true });
        mesh5.rotation.x = R90;
        mesh5.rotation.y = -R90;
        mesh5.position.set(0.0, -0.4+adjy, -1.2);
        mesh5.parent = mesh;
        return mesh;
    }

    let crMesh03 = function() {
        // バイク カブ風
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 0.1;
        let R90 = Math.PI/2;
        // 前輪
        let mesh2 = BABYLON.MeshBuilder.CreateTorus("", {diameter:1.2, thickness:0.3, tessellation:48, }, scene);
        mesh2.position.set(0.0, -0.5+adjy, 1.2);
        mesh2.rotation.z = R90;
        mesh2.material = new BABYLON.StandardMaterial('mat', scene);
        mesh2.material.diffuseColor = BABYLON.Color3.Black();
        mesh2.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        mesh2.parent = mesh;
        // 後輪
        let mesh3 = BABYLON.MeshBuilder.CreateTorus("", {diameter:1.2, thickness:0.3, tessellation:48, }, scene);
        mesh3.position.set(0.0, -0.5+adjy, -1.2);
        mesh3.rotation.z = R90;
        mesh3.material = mesh2.material;
        mesh3.parent = mesh;
        // 風よけ
        let mesh5 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:1.5, diameterY:3.0, diameterZ:3.0, slice:0.2, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh5.rotation.x = R90;
        mesh5.position.set(0.0, 0.2+adjy, -1.0);
        mesh5.parent = mesh;
        // 前輪カバー
        let mesh12 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:0.5, diameterY:1.5, diameterZ:1.5, slice:0.4, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh12.rotation.x = -0.8;
        mesh12.position.set(0.0, -0.3+adjy, 1.0);
        mesh12.parent = mesh;
        // ハンドル
        let mesh13 = BABYLON.MeshBuilder.CreateBox("", {width:1.6, height:0.2, depth:0.2}, scene);
        mesh13.position.set(0.0, 1.0+adjy, 0.2);
        mesh13.parent = mesh;
        // エンジンー後輪
        let mesh21 = BABYLON.MeshBuilder.CreateBox("", {width:0.6, height:0.4, depth:1.4}, scene);
        mesh21.position.set(0.0, -0.5+adjy, -0.5);
        mesh21.parent = mesh;
        // シート
        let mesh23 = BABYLON.MeshBuilder.CreateBox("", {width:0.6, height:0.8, depth:0.6}, scene);
        mesh23.position.set(0.0, 0.1+adjy, -0.7);
        mesh23.parent = mesh;
        // 後輪カバー
        // 前輪カバー
        let mesh22 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:0.5, diameterY:1.6, diameterZ:1.6, slice:0.4, sideOrientation:BABYLON.Mesh.DOUBLESIDE,}, scene);
        mesh22.position.set(0.0, -0.3+adjy, -1.2);
        mesh22.parent = mesh;
        return mesh;
    }

    let crMesh04 = function() {
        // バイク  スポーツ風
        let mesh = new BABYLON.TransformNode("trans");
        let adjy = 0.1;
        let R90 = Math.PI/2;
        // 前輪
        let mesh2 = BABYLON.MeshBuilder.CreateTorus("", {diameter:1.2, thickness:0.3, tessellation:48, }, scene);
        mesh2.position.set(0.0, -0.5+adjy, 1.2);
        mesh2.rotation.z = R90;
        mesh2.material = new BABYLON.StandardMaterial('mat', scene);
        mesh2.material.diffuseColor = BABYLON.Color3.Black();
        mesh2.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        mesh2.parent = mesh;
        // 後輪
        let mesh3 = BABYLON.MeshBuilder.CreateTorus("", {diameter:1.2, thickness:0.3, tessellation:48, }, scene);
        mesh3.position.set(0.0, -0.5+adjy, -1.2);
        mesh3.rotation.z = R90;
        mesh3.material = mesh2.material;
        mesh3.parent = mesh;
        // フロント
        let mesh11 = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:0.2, diameterBottom:1.0, height:0.6, tessellation:6}, scene);
        mesh11.rotation.x = R90+0.3;
        mesh11.scaling.set(1, 1, 0.8);
        mesh11.position.set(0.0, 0.5+adjy, 1.2);
        mesh11.parent = mesh;
        // 前輪カバー
        let mesh12 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1.6, diameterY:0.6, arc:0.6, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh12.rotation.z = R90;
        mesh12.rotation.x = 1;
        mesh12.position.set(0.0, -0.1+adjy, 0.6);
        mesh12.parent = mesh;
        // 後輪カバー
        let mesh21 = BABYLON.MeshBuilder.CreateSphere("", {diameter:1.6, diameterY:0.6, arc:0.6, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh21.rotation.z = -R90;
        mesh21.rotation.x = 2.4;
        mesh21.position.set(0.0, -0.2+adjy, -0.6);
        mesh21.parent = mesh;
        // マフラー
        let mesh22 = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:0.2, diameterBottom:0.3, height:1.0, tessellation:6}, scene);
        mesh22.rotation.x = R90+0.3;
        mesh22.rotation.y = -0.1;
        mesh22.position.set(0.3, -0.5+adjy, -1.0);
        mesh22.parent = mesh;
        return mesh;
    }
    // --------------------------------------------------

    let myMesh = null;
    if (1) {
        // １つについて展開図風（4分割して異なる角度から）表示
        let mesh, x=0, y=4, z=-8;
        
//        mesh = crMesh01(); // シンプル
//        mesh = crMesh02();  // ゴテゴテ
//        mesh = crMesh03(); // カブ風
        mesh = crMesh04(); // スポーツ風

        myMesh = mesh;
        camTrgMesh = mesh;

        //    icamera = 0;
        icamera = 1;
        changeCamera(icamera);
    }

    return scene;
}

// ======================================================================
// 二輪・バイク

export var createScene = createScene_test_1002;
// export var createScene = createScene_test_9999; // snapshot, メッシュの４分割表示


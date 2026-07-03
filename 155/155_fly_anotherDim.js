// Babylon.js ：重力が異なる異空間を飛ぶ試作
//   矩形領域である方向が上
//   球形で外側が上
//   球形で内側が上

// 上記は L331-333 で切り替え
// L331   // crGfield1();
// L332   // crGfield2();
// L333   crGfield3();

// ######################################################################

// const lineArrowPath = 'textures/arrow_.png';
const lineArrowPath = 'https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/arrow_.png';


export var createScene_test_151 = async function () {
    const scene = new BABYLON.Scene(engine);

    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(75, 0, -65.5)); // ヨーロッパ
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        return _camera;
    }
    let crCamera3 = function() {
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 4; // 1.3;
        _camera.heightOffset = 1.5; // 0.0;
        _camera.cameraAcceleration = 0.05; // 0.3;
        _camera.maxCameraSpeed = 30;
        return _camera;
    }
    let icamera3 = 0, ncamera3 = 3;
    let setCamera3 = function(icamera3) {
        if (icamera3 == 0) {
            // ちょっと離れて追跡
            setMyMeshVisibility(1); // 自機を表示しておく
            camera.radius = 4; // 1.3;
            camera.heightOffset = 1.5; // 0.0;
            camera.cameraAcceleration = 0.03; // 0.3;
            camera._cameraAccelerationMin = 0.03;
            camera._cameraAccelerationMax = 0.09; // FOV時
        } else if (icamera3 == 1) {
            // 直ぐ後ろを追跡
            camera.radius = 4; // 1.3;
            camera.heightOffset = 1.5; // 0.0;
            camera.cameraAcceleration = 0.6; // 0.3;
            camera._cameraAccelerationMin = 0.6;
            camera._cameraAccelerationMax = 1.8; // FOV時
        } else if (icamera3 == 2) {
            // パイロット目線
            setMyMeshVisibility(0); // 自機を消しておく
            camera.radius = 0.3;
            camera.heightOffset = 0.0;
            camera.cameraAcceleration = 0.6;
            camera._cameraAccelerationMin = 0.6;
            camera._cameraAccelerationMax = 1.8; // FOV時
        }
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
        let vdir = new BABYLON.Vector3(0, 1, -5);
        vdir = vdir.applyRotationQuaternion(quat);
        camera.position = myMesh.position.add(vdir);
        camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
    }

    const light = new BABYLON.HemisphericLight("", new BABYLON.Vector3(0, 50, 0));
    light.intensity = 0.7;


    let worldRng = 2000, worldRng_=worldRng/2, worldMin=-worldRng_, worldMax=worldRng_;
    if (1) {
        let grndW=2000, grndH=2000;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.position.y = -20;
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        for (let y = -120; y > -1000; y-=100) {
            let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
            mesh.position.y = y;
            mesh.material = new BABYLON.GridMaterial("", scene);
            mesh.material.majorUnitFrequency = 10; 
            mesh.material.minorUnitVisibility  = 0.2;
        }
    }

    // // 平行重力
    let meshRgn1List = [], g1dir = null;
    let crGfield1 = function() {
        // 重力場／平面
        let dstep = worldRng_/4, sq2_ = Math.sqrt(2)/2, dstep10=worldRng/20;
        let geolist = [
            // RngMin, RngMax, G1dir
            [[-worldRng_, -worldRng_, 3*dstep], [worldRng_, worldRng_, 4*dstep], [0, 1, 0]],
            [[-worldRng_, -worldRng_, 2*dstep], [worldRng_, worldRng_, 3*dstep], [-1, 0, 0]],
            [[-worldRng_, -worldRng_, 1*dstep], [worldRng_, worldRng_, 2*dstep], [1, 0, 0]],
            [[-worldRng_, -worldRng_, 0*dstep-2], [worldRng_, worldRng_, 1*dstep], [0, -1, 0]],
            [[-worldRng_, -worldRng_, -1*dstep], [worldRng_, worldRng_,  0*dstep-2], [sq2_, -sq2_, 0]],
            [[-worldRng_, -worldRng_, -2*dstep], [worldRng_, worldRng_, -1*dstep], [-sq2_, -sq2_, 0]],
            [[-worldRng_, -worldRng_, -4*dstep], [   -dstep, worldRng_, -2*dstep], [0, 0, 1]],
            [[     dstep, -worldRng_, -4*dstep], [worldRng_, worldRng_, -2*dstep], [0, 0, -1]],
            [[    -dstep, -worldRng_, -4*dstep], [    dstep, worldRng_, -2*dstep], [0,-1, 0]],
        ];
//         const lineArrowPath = 'textures/arrow_.png';
// // const lineArrowPath = 'https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/arrow_.png';
        const lineTexture = new BABYLON.Texture(lineArrowPath, scene)
        lineTexture.hasAlpha = true
        const animRatio = scene.getAnimationRatio()
        scene.onBeforeRenderObservable.add(() => {
            lineTexture.uOffset -= 0.04 * animRatio
        });
        for (let [_rgnmin, _rgnmax, _g1dir] of geolist) {
            let pmin = BABYLON.Vector3.FromArray(_rgnmin);
            let pmax = BABYLON.Vector3.FromArray(_rgnmax);
            let g1dir = BABYLON.Vector3.FromArray(_g1dir).normalize();
            let pc = pmin.add(pmax).scale(0.5);
            let ps = pmax.subtract(pmin);
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:ps.x, height:ps.y, depth:ps.z}, scene);
            mesh.position.copyFrom(pc);
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.material.diffuseColor = BABYLON.Color3.Random();
            mesh.material.alpha = 0.5;
            mesh._g1dir = g1dir;
            meshRgn1List.push(mesh);
            function drawLine(name, width, points) {
                const line = BABYLON.CreateGreasedLine(name, {
                    points,
                    updatable: true
                }, { width })
                return line
            }
            if (Math.abs(g1dir.x) > 0.9) {
                // y-z
                for (let y = pmin.y; y <= pmax.y; y+=dstep10) {
                for (let z = pmin.z; z <= pmax.z; z+=dstep10) {
                    let p1 = new BABYLON.Vector3(pmin.x+dstep10, y, z);
                    let p2 = new BABYLON.Vector3(pmax.x-dstep10, y, z);
                    if (g1dir.x < 0) {
                        [p1, p2] = [p2, p1];
                    }
                    let basePoints = [p1, p2];
                    const points = BABYLON.Curve3.CreateCatmullRomSpline(basePoints, 1000 / basePoints.length).getPoints()
                    const length = BABYLON.GreasedLineTools.GetLineLength(points)
                    let meshLine = drawLine("", 1, points)
                    meshLine.material.emissiveTexture = lineTexture
                    meshLine.material.diffuseTexture = lineTexture
                    lineTexture.uScale = length / 2
                }
                }
            } else if (Math.abs(g1dir.y) > 0.9) {
                // z-x
                for (let z = pmin.z; z <= pmax.z; z+=dstep10) {
                for (let x = pmin.x; x <= pmax.x; x+=dstep10) {
                    let p1 = new BABYLON.Vector3(x, pmin.y+dstep10, z);
                    let p2 = new BABYLON.Vector3(x, pmax.y-dstep10, z);
                    if (g1dir.y < 0) {
                        [p1, p2] = [p2, p1];
                    }
                    let basePoints = [p1, p2];
                    const points = BABYLON.Curve3.CreateCatmullRomSpline(basePoints, 1000 / basePoints.length).getPoints()
                    const length = BABYLON.GreasedLineTools.GetLineLength(points)
                    let meshLine = drawLine("", 1, points)
                    meshLine.material.emissiveTexture = lineTexture
                    meshLine.material.diffuseTexture = lineTexture
                    lineTexture.uScale = length / 2
                }
                }
            } else if (Math.abs(g1dir.z) > 0.9) {
                // x-y
                for (let x = pmin.x; x < pmax.x; x+=dstep10) {
                for (let y = pmin.y; y <= pmax.y; y+=dstep10) {
                    let p1 = new BABYLON.Vector3(x, y, pmin.z);
                    let p2 = new BABYLON.Vector3(x, y, pmax.z);
                    if (g1dir.z < 0) {
                        [p1, p2] = [p2, p1];
                    }
                    let basePoints = [p1, p2];
                    const points = BABYLON.Curve3.CreateCatmullRomSpline(basePoints, 1000 / basePoints.length).getPoints()
                    const length = BABYLON.GreasedLineTools.GetLineLength(points)
                    let meshLine = drawLine("", 1, points)
                    meshLine.material.emissiveTexture = lineTexture
                    meshLine.material.diffuseTexture = lineTexture
                    lineTexture.uScale = length / 2
                }
                }
            } else {
                if (g1dir.x > 0.5) {
                } else {
                }
            }
        }
    }

    // 点重力
    let meshRgn2List = [], g2pnt = null;
    let crGfield2 = function() {
        let dstep = worldRng_/4, sq2_ = Math.sqrt(2)/2, dstep10=worldRng/20;
        let geoPntList = [
            // RngPoint, R
            [[-1*dstep, dstep, 3*dstep], 2*dstep],
            [[ 1*dstep, dstep/2, 2*dstep], 2*dstep],
            [[-2*dstep, dstep/2, 1*dstep], 2*dstep],
            [[ 2*dstep, dstep/3, 0*dstep], 3*dstep],
            [[-3*dstep, dstep/4,-1*dstep], 3*dstep],
            [[-3*dstep, dstep/5,-2*dstep], 3*dstep],
            [[ 2*dstep, dstep/6,-3*dstep], 4*dstep],
        ];
        for (let [_p, _r] of geoPntList) {
            let pc = BABYLON.Vector3.FromArray(_p);
            let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:_r}, scene);
            mesh.position.copyFrom(pc);
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.material.diffuseColor = BABYLON.Color3.Random();
            mesh.material.alpha = 0.2;
            mesh._g2pnt = pc;
            let mesh0 = BABYLON.MeshBuilder.CreateSphere("", {diameter:10}, scene);
            mesh0.material = mesh.material.clone();
            mesh0.material.alpha = 1;
            mesh0.parent = mesh;
            let mesh1 = BABYLON.MeshBuilder.CreateSphere("", {diameter:_r/2}, scene);
            mesh1.material = mesh.material.clone();
            mesh1.material.alpha = 0.5;
            mesh1.parent = mesh;
            meshRgn2List.push(mesh);
        }
    }

    // 点-反重力
    let meshRgn3List = [], g3pnt = null;
    let crGfield3 = function() {
        let dstep = worldRng_/4, sq2_ = Math.sqrt(2)/2, dstep10=worldRng/20;
        let geoPntList = [
            // RngPoint, R
            [[-1*dstep, dstep*3.5, 3*dstep], 2*dstep],
            [[ 1*dstep, dstep*3.0, 2*dstep], 2*dstep],
            [[-2*dstep, dstep*2.5, 1*dstep], 2*dstep],
            [[ 2*dstep, dstep*2.0, 0*dstep], 3*dstep],
            [[-3*dstep, dstep*1.5,-1*dstep], 3*dstep],
            [[-3*dstep, dstep*1.0,-2*dstep], 3*dstep],
            [[ 2*dstep, dstep*0.5,-3*dstep], 4*dstep],
        ];
        for (let [_p, _r] of geoPntList) {
            let pc = BABYLON.Vector3.FromArray(_p);
            let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:_r, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh.position.copyFrom(pc);
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.material.diffuseColor = BABYLON.Color3.Random();
            mesh.material.alpha = 0.2;
            mesh._p = pc;
            let mesh0 = BABYLON.MeshBuilder.CreateSphere("", {diameter:10}, scene);
            mesh0.material = mesh.material.clone();
            mesh0.material.alpha = 1;
            mesh0.parent = mesh;
            let mesh1 = BABYLON.MeshBuilder.CreateSphere("", {diameter:_r/2, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh1.material = mesh.material.clone();
            mesh1.material.alpha = 0.5;
            mesh1.parent = mesh;
            meshRgn3List.push(mesh);
        }
    }

    let crPlane0 = function() {
        // 飛行機：ごつい四角
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:1, height:1, depth:4}, scene);
        let mesh1 = BABYLON.MeshBuilder.CreateBox("", {width:4, height:0.2, depth:1}, scene);
        mesh1.position.z = 0.0;
        mesh1.parent = mesh;
        let mesh2 = BABYLON.MeshBuilder.CreateBox("", {width:2, height:0.2, depth:0.5}, scene);
        mesh2.position.z = -1.75;
        mesh2.parent = mesh;
        let mesh3 = BABYLON.MeshBuilder.CreateBox("", {width:0.2, height:0.5, depth:0.5}, scene);
        mesh3.position.y = 0.75;
        mesh3.position.z = -1.75;
        mesh3.parent = mesh;
        return mesh;
    }


    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ') {
                myMesh._vdir.z = 3;
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            if (kbInfo.event.key == ' ') {
                myMesh._vdir.z = 1;
            }
            break;
        }
    });

    // ----------------------------------------

    if (1) {
        // 障害物 / 浮遊体
        // let n = 100, rand=1000, rand_=rand/2;
        let n = 100, rand=worldRng, rand_=rand/2;
        for (let i = 0; i < n; ++i) {
            let p = BABYLON.Vector3.Random(-rand_, rand_);
            p.y = p.y*0.01;
            // let mesh = BABYLON.MeshBuilder.CreateBox("", { width: 2.0, height: 2.0, depth: 2.0 }, scene);
            let sizeH = Math.abs(p.y+20)*2;
            let mesh = BABYLON.MeshBuilder.CreateBox("", { width: 2.0, height: sizeH, depth: 2.0 }, scene);
            mesh.position = p;
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.diffuseColor = BABYLON.Color3.Random();
        }
    }

    // ------------------------------

//    let idevice=0; // ドローン風操作
    let idevice=1; // 疑似飛行機モード：カーソルで簡単操作／宙返りや背面飛行ができないけど
//    let idevice=2; // 飛行機モード：ロール・ピッチ―・ヨー操作

//    crGfield1();
//    crGfield2();
    crGfield3();

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
        if (idevice==0) {
            // シンプルモード
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

        if (idevice==2) {
            // 飛行機モード：ロール・ピッチ・ヨー操作
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
            act.rrl=0;
            if (map["a"]) {
                act.rrl=1;
            } else if (map["d"]) {
                act.rrl=-1;
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

            if (map["0"]) {
                // camera
                cooltime_act = cooltime_actIni;
                icamera3 = (icamera3+1)%ncamera3;
                console.log("camera=", icamera3);
                setCamera3(icamera3);
            }

        }
    });

    scene.onBeforeRenderObservable.add(() => {
        // 領域から重力方向gdir
        if ((meshRgn != null) && (meshRgn.intersectsMesh(myMesh, false))) {
        } else {
            let bhit = false;
            if (bhit == false) {
                for (let mesh of meshRgn1List) {
                    if (mesh.intersectsMesh(myMesh, true)) {
                        meshRgn = mesh;
                        g1dir = meshRgn._g1dir;
                        updir = g1dir.negate();
                        camera.upVector = updir;
 console.log("change REGION: ", [updir.x, updir.y, updir.z, ]);
                        if (idevice==1) {
                            let quat = myMesh.rotationQuaternion;
                            let v3F = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                            myMesh._quat = BABYLON.Quaternion.FromLookDirectionRH(v3F, updir);
                        }
                        bhit = true;
                        break;
                    }
                }
            }
            if (bhit == false) {
                for (let mesh of meshRgn2List) {
                    if (mesh.intersectsMesh(myMesh, false)) {
                        meshRgn = mesh;
                        g2pnt = meshRgn._g2pnt;
 console.log("change REGION: ", [g2pnt.x.toFixed(3), g2pnt.y.toFixed(3), g2pnt.z.toFixed(3), ]);
                        bhit = true;
                        break;
                    }
                }
            }
            if (bhit == false) {
                for (let mesh of meshRgn3List) {
                    if (mesh.intersectsMesh(myMesh, false)) {
                        meshRgn = mesh;
                        g3pnt = meshRgn._p;
 console.log("change REGION: ", [g3pnt.x.toFixed(3), g3pnt.y.toFixed(3), g3pnt.z.toFixed(3), ]);
                        bhit = true;
                        break;
                    }
                }
            }
            if ((meshRgn != null) && (bhit == false)) {
                meshRgn = null;
                g1dir = null;
                g2pnt = null;
                g3pnt = null;
                updir = BABYLON.Vector3.Up(); // gdir.negate();
                camera.upVector = updir;
 console.log("change REGION: [out]");
            }
        }

        let quat = myMesh.rotationQuaternion;

        if (idevice==0) {
            // 機体操作１：上昇下降とヨー回転
            if ((g2pnt != null) || (g3pnt != null)) {
                // 重力空間2, 重力空間3の場合
                let updir_ = null;
                if (g2pnt != null) {
                    updir_ = myMesh.position.subtract(g2pnt).normalize();
                } else if (g3pnt != null) {
                    updir_ = g3pnt.subtract(myMesh.position).normalize();
                }
                if (act.mud != 0) {
                    let rateUD = 0.3;
                    let vdir = updir_.scale(rateUD*act.mud);
                    myMesh.position.addInPlace(vdir);
                }
                if (act.mrl != 0) {
                    let rateRL = 0.05;
                    let quatR = BABYLON.Quaternion.RotationAxis(updir_, rateRL*act.mrl);
                    quat = quatR.multiply(quat);
                    myMesh.rotationQuaternion = quat;
                }
                // 姿勢修正
                {
                    let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                    let quat0 = BABYLON.Quaternion.FromLookDirectionRH(vdir, updir_);
                    let rlerp = 0.1;
                    quat = BABYLON.Quaternion.Slerp(quat, quat0, rlerp);
                    myMesh.rotationQuaternion = quat;
                }
                // 前進
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                if (act.ctrl) {
                    vdir.scaleInPlace(3);
                }
                myMesh.position.addInPlace(vdir);
                //境界条件
                if (myMesh.position.x < worldMin) { myMesh.position.x += worldRng; }
                if (myMesh.position.x > worldMax) { myMesh.position.x -= worldRng; }
                if (myMesh.position.z < worldMin) { myMesh.position.z += worldRng; }
                if (myMesh.position.z > worldMax) { myMesh.position.z -= worldRng; }
                myMesh.rotationQuaternion = quat;

            } else {
                // 重力空間1の場合
                if (act.mud != 0) {
                    let rateUD = 0.3;
                    let vdir = updir.scale(rateUD*act.mud);
                    myMesh.position.addInPlace(vdir);
                }
                if (act.mrl != 0) {
                    let rateRL = 0.05;
                    let quatR = BABYLON.Quaternion.RotationAxis(updir, rateRL*act.mrl);
                    quat = quatR.multiply(quat);
                    myMesh.rotationQuaternion = quat;
                }
                // 姿勢修正
                {
                    let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                    let quat0 = BABYLON.Quaternion.FromLookDirectionRH(vdir, updir);
                    let rlerp = 0.1;
                    quat = BABYLON.Quaternion.Slerp(quat, quat0, rlerp);
                    myMesh.rotationQuaternion = quat;
                }
                // 前進
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                if (act.ctrl) {
                    vdir.scaleInPlace(3);
                }
                myMesh.position.addInPlace(vdir);
                //境界条件
                if (myMesh.position.x < worldMin) { myMesh.position.x += worldRng; }
                if (myMesh.position.x > worldMax) { myMesh.position.x -= worldRng; }
                if (myMesh.position.z < worldMin) { myMesh.position.z += worldRng; }
                if (myMesh.position.z > worldMax) { myMesh.position.z -= worldRng; }
                myMesh.rotationQuaternion = quat;
            }
        }


        if (idevice==1) {
            // 機体操作２：ロール角度に応じたヨー回転と自動補正
            const R90 = Math.PI/2;

            if ((g2pnt != null) || (g3pnt != null)) {
                // 重力空間2, 重力空間3の場合
                let updir_ = null;
                if (g2pnt != null) {
                    updir_ = myMesh.position.subtract(g2pnt).normalize();
                } else if (g3pnt != null) {
                    updir_ = g3pnt.subtract(myMesh.position).normalize();
                }
                let v3F = BABYLON.Vector3.Forward().applyRotationQuaternion(myMesh._quat); // 進行方向
                let v3HB = updir_.cross(v3F).normalize(); // 水平-binormal方向
                let v3HF = updir_.cross(v3HB).normalize(); // 水平-全面方向
                // 見た目の上方向
                let viewU = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                let viewF = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                if (act.mud != 0) {
                    // 上下時：ピッチ
                    let vdot = viewU.dot(updir_);
                    let raduu = Math.acos(vdot);
                    {
                        let v = 0.02*act.mud;
                        let quatP = BABYLON.Quaternion.RotationAxis(v3HB, v);
                        myMesh._quat = quatP.multiply(myMesh._quat);
                        quat = quatP.multiply(quat);
                        myMesh.rotationQuaternion = quat;
                    }
                }
                // ヨー回転
                if (act.mrl != 0) {
                    let v = 0.05*act.mrl;
                    myMesh._roll += v;
                    let raduu = Math.acos(viewU.dot(updir_));
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
                    let quatR = BABYLON.Quaternion.RotationAxis(updir_, v*0.02); //理論値_roll に対する旋回
                    myMesh._quat = quatR.multiply(myMesh._quat);
                    quat = quatR.multiply(quat);
                    myMesh.rotationQuaternion = quat;
                    myMesh._roll = BABYLON.Lerp(v, 0, 0.02); // 等比で減衰
                    if (Math.abs(myMesh._roll) < 1e-3) {
                        myMesh._roll = 0;
                    }
                }
                // 姿勢修正
                if ((act.mud == 0) && (act.mrl == 0)) {
                    let quat0 = BABYLON.Quaternion.FromLookDirectionLH(v3HF, updir_);
                    let rlerp = 0.02;
                    myMesh._quat = BABYLON.Quaternion.Slerp(myMesh._quat, quat0, rlerp);
                    quat = BABYLON.Quaternion.Slerp(quat, quat0, rlerp);
                    myMesh.rotationQuaternion = quat;
                }
                // 前進
                if (act.ctrl) {
                    v3F.scaleInPlace(3);
                }
                myMesh.position.addInPlace(v3F);
                //境界条件
                if (myMesh.position.x < worldMin) { myMesh.position.x += worldRng; }
                if (myMesh.position.x > worldMax) { myMesh.position.x -= worldRng; }
                if (myMesh.position.z < worldMin) { myMesh.position.z += worldRng; }
                if (myMesh.position.z > worldMax) { myMesh.position.z -= worldRng; }
                myMesh.rotationQuaternion = quat;

            } else {
                // 重力空間1の場合
                let v3F = BABYLON.Vector3.Forward().applyRotationQuaternion(myMesh._quat); // 進行方向
                let v3HB = updir.cross(v3F).normalize(); // 水平-binormal方向
                let v3HF = updir.cross(v3HB).normalize(); // 水平-全面方向
                // 見た目の上方向
                let viewU = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                let viewF = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                if (act.mud != 0) {
                    // 上下時：ピッチ
                    let vdot = viewU.dot(updir);
                    let raduu = Math.acos(vdot);
                    {
                        let v = 0.02*act.mud;
                        let quatP = BABYLON.Quaternion.RotationAxis(v3HB, v);
                        myMesh._quat = quatP.multiply(myMesh._quat);
                        quat = quatP.multiply(quat);
                        myMesh.rotationQuaternion = quat;
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
                // 姿勢修正
                if ((act.mud == 0) && (act.mrl == 0)) {
                    let quat0 = BABYLON.Quaternion.FromLookDirectionLH(v3HF, updir);
                    let rlerp = 0.02;
                    myMesh._quat = BABYLON.Quaternion.Slerp(myMesh._quat, quat0, rlerp);
                    quat = BABYLON.Quaternion.Slerp(quat, quat0, rlerp);
                    myMesh.rotationQuaternion = quat;
                }
                // 前進
                if (act.ctrl) {
                    v3F.scaleInPlace(3);
                }
                myMesh.position.addInPlace(v3F);
                //境界条件
                if (myMesh.position.x < worldMin) { myMesh.position.x += worldRng; }
                if (myMesh.position.x > worldMax) { myMesh.position.x -= worldRng; }
                if (myMesh.position.z < worldMin) { myMesh.position.z += worldRng; }
                if (myMesh.position.z > worldMax) { myMesh.position.z -= worldRng; }
                myMesh.rotationQuaternion = quat;
            }
        }

        if (idevice==2) {
            // 機体操作３：クォータニオンによる回転
            // 飛行機モード：ロール・ピッチ・ヨー操作
            if (act.mud != 0) {
                // ピッチ
                let v3axisP = BABYLON.Vector3.Right().applyRotationQuaternion(quat);
                let v = 0.02*act.mud;
                if (act.mud < 0) {
                    v = 0.04*act.mud;
                }
                let quatP = BABYLON.Quaternion.RotationAxis(v3axisP, v);
                quat = quatP.multiply(quat);
                myMesh.rotationQuaternion = quat;
                myMesh._resetPosture = 0;
            }
            if (act.mrl != 0) {
                // ロール
                let v3axisR = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                let v = -0.03*act.mrl;
                let quatR = BABYLON.Quaternion.RotationAxis(v3axisR, v);
                quat = quatR.multiply(quat);
                myMesh.rotationQuaternion = quat;
                myMesh._resetPosture = 0;
            }
            if (act.rrl != 0) {
                // ヨー
                let v3axisY = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                let v = -0.02*act.rrl;
                let quatR = BABYLON.Quaternion.RotationAxis(v3axisY, v);
                quat = quatR.multiply(quat);
                myMesh.rotationQuaternion = quat;
                myMesh._resetPosture = 0;
            }

            // リセットなしでも徐々に姿勢を調整
            // 姿勢をリセットする：ヨーだけを残して、ロール・ピッチを徐々に０にする
            if (act.ent) { myMesh._resetPosture = 1; }
            let rlerp = 0.002;
            if (myMesh._resetPosture) {
                rlerp = 0.1;
            }
            if (g2pnt != null) {
                // 重力空間2の場合
                let updir_ = myMesh.position.subtract(g2pnt).normalize();
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                let quat0 = BABYLON.Quaternion.FromLookDirectionRH(vdir, updir_);
                quat = BABYLON.Quaternion.Slerp(quat, quat0, rlerp);
                myMesh.rotationQuaternion = quat;

            } else if (g3pnt != null) {
                // 重力空間3の場合
                let updir_ = g3pnt.subtract(myMesh.position).normalize();
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                let quat0 = BABYLON.Quaternion.FromLookDirectionRH(vdir, updir_);
                quat = BABYLON.Quaternion.Slerp(quat, quat0, rlerp);
                myMesh.rotationQuaternion = quat;

            } else {
                // 重力空間1の場合
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                let quat0 = BABYLON.Quaternion.FromLookDirectionRH(vdir, updir);
                quat = BABYLON.Quaternion.Slerp(quat, quat0, rlerp);
                myMesh.rotationQuaternion = quat;
            }

            // 前進
            {
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                if (act.ctrl) {
                    vdir.scaleInPlace(3);
                    myMesh._resetPosture = 0;
                }
                myMesh.position.addInPlace(vdir);
                //境界条件
                if (myMesh.position.x < worldMin) { myMesh.position.x += worldRng; }
                if (myMesh.position.x > worldMax) { myMesh.position.x -= worldRng; }
                if (myMesh.position.z < worldMin) { myMesh.position.z += worldRng; }
                if (myMesh.position.z > worldMax) { myMesh.position.z -= worldRng; }
            }
        }

    });

    // ----------------------------------------

    let myMesh = crPlane0(); // 飛行機：ごつい四角
    // myMesh._vdir = new BABYLON.Vector3(0,0,1);
    myMesh._pold = myMesh.position.clone();
    myMesh.rotationQuaternion = new BABYLON.Quaternion();
    myMesh._vEuler = new BABYLON.Vector3(0,0,0); // idevice=1時の移動用・オイラー角/上記(rotationQuaternion)は姿勢に利用
    myMesh._quat = new BABYLON.Quaternion(); // idevice=1時の移動用
    myMesh._roll = 0; // idevice=1時の移動用
    myMesh._resetPosture = 0; // idevice=2時の姿勢リセットフラグ

//    camera = crCameraDef(); // debug
    camera = crCamera3();
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.lockedTarget = myMesh;


    let meshRgn = null;
    // g2pnt = null;
    let updir = BABYLON.Vector3.Up(); // gdir.negate();
    camera.upVector = updir;

    return scene;
};


// ######################################################################


export var createScene = createScene_test_151;  // 斥力：３領域の混合 idevice=0,1,2 対応 (2で緩やかに修正追加)

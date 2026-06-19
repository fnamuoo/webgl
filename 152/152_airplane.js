// Babylon.js ：飛行感と操作方法

// v    : 飛行モードの切り替え (default モード２)
//        飛行モード１：カーソル上下：上昇下降、カーソル左右：方向転換
//        飛行モード２：カーソル上下：下降上昇、カーソル左右：ロール（ロール角度に応じた方向転換）
//        飛行モード３：カーソル上下：ピッチ　、カーソル左右：ロール、A/D：ピッチ
//
// ctrl : 加速
// enter: 姿勢を戻す（飛行モード３のときのみ）
//
// 0    : カメラ切り替え
//        - 離れて追跡 (default)
//        - すぐ後ろを追跡
//        - パイロット目線（ロール未対応
//
// 1    : Buffeting (加速時の自機のブレ）:default ON
// 2    : FOV(加速時に視野が広がる）     :default OFF
// 3    : VaporTrail(加速時に翼の端から軌跡ができる）:default ON
// 4    : 降雨・降雪の表示切り替え       :default ON
// 5    : 雲（低層）の表示切り替え       :default ON
// 6    : 雲（高層）の表示切り替え       :default OFF
// 7    : 霧の表示切り替え               :default OFF


export var createScene_test_draft_fly_05 = async function () {
    // const fpathFlare = "textures/flare.png";
    // const fpathCloud = "textures/cloud.png";
    // const skyboxTextPath = "textures/zgrid3";
    const fpathFlare = "../068/textures/flare.png";
    const fpathCloud = "../088/textures/cloud.png";
    const skyboxTextPath = "../125/textures/zgrid3";
//    const fpathCloud = "https://raw.githubusercontent.com/fnamuoo/webgl/main//088/textures/cloud.png";
//    const skyboxTextPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/125/textures/zgrid3";

    const scene = new BABYLON.Scene(engine);
    // // // scene.clearColor = new BABYLON.Color4(0, 0, 0, 1)
    scene.clearColor = new BABYLON.Color4(0.1, 0.5, 0.8, 1);
    // scene.clearColor = new BABYLON.Color4(0.8, 0.2, 0.1, 1);

    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(75, 0, -65.5)); // ヨーロッパ
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        // _camera.attachControl(canvas, true);
        // _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera3 = function() {
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 4; // 1.3;
        _camera.heightOffset = 1.5; // 0.0;
        _camera.cameraAcceleration = 0.03; // 0.3;
        _camera._cameraAccelerationMin = 0.03;
        _camera._cameraAccelerationMax = 0.09; // FOV時
        _camera.maxCameraSpeed = 100;
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
            // setMyMeshVisibility(1);
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
//     camera = crCameraDef(); // debug
// //    camera = crCamera3();
//     camera.setTarget(BABYLON.Vector3.Zero());

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
        // mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.9}, scene);
        // mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
        // mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
    }

    // 飛行機メッシュの作成
    let crPlane0 = function() {
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

    let setMyMeshVisibility = function(val) {
        myMesh.visibility = val;
        for (let m of myMesh.getChildMeshes()) {
            m.visibility = val;
        }
        myMesh._meshFountain.visibility = 0;
        myMesh._myWingR.visibility = 0;
        myMesh._myWingL.visibility = 0;
    };

    let myMesh = crPlane0(); // 飛行機
    myMesh.rotationQuaternion = new BABYLON.Quaternion();
    myMesh._vEuler = new BABYLON.Vector3(0,0,0); // idevice=1時の移動用・オイラー角/上記(rotationQuaternion)は姿勢に利用
    myMesh._resetPosture = 0; // idevice=2時の姿勢リセットフラグ
    cameraTrgMesh = myMesh;

//    camera = crCameraDef(); // debug / ArcRotateCamera
    camera = crCamera3(); // カメラ遅延 / FollowCamera
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.lockedTarget = cameraTrgMesh; // myMesh;

    // 微振動（Buffeting）
    let enableBuffeting = true;
    let actBuffeting = function() {
        // 飛行体を振動させる
        let amp = 0.2;
        let v = (Math.random()-0.5)*amp;
        let quat = myMesh.rotationQuaternion;
        let vUD = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        let vLR = BABYLON.Vector3.Right().applyRotationQuaternion(quat);
        myMesh.position.addInPlace(vUD.scale(v));
        v = (Math.random()-0.5)*amp;
        myMesh.position.addInPlace(vLR.scale(v));
    }

    // 速度でFOV変化 .. 画角が広がるともに被写体と離れる（遅延した感じに
    let enableFOV = false;
    let cameraFOVlock = false; // key-push時に true / release時に false
    let setCameraFOVup = function() {}
    let setCameraFOVdown = function() {}
    {
        setCameraFOVup = function() {
            // 加速時／FOVオン
            const camera_fovMax = 2.2; // 1.2;
            if (camera.fov < camera_fovMax) {
                const speedRatio = 0.02;
                camera.fov = BABYLON.Lerp(camera.fov, camera_fovMax, speedRatio);
            }
            // FollowCameraでFOV有効にすると離れすぎ。加速時と同じでも違和感なし
            camera.cameraAcceleration = camera._cameraAccelerationMax;
        }
        setCameraFOVdown = function() {
            // 減速時／FOVオフ
            const camera_fovMin = 0.8;
            if (camera_fovMin < camera.fov) {
                const speedRatio = 0.02;
                camera.fov = BABYLON.Lerp(camera.fov, camera_fovMin, speedRatio);
            }
            camera.cameraAcceleration = camera._cameraAccelerationMin;
        }
        scene.onBeforeRenderObservable.add(() => {
            if (cameraFOVlock == false) {
                setCameraFOVdown();
            }
        });
    }

    // ----------------------------------------
    // 翼端渦
    let enableVaporTrail = true;

    let trailMeshWingR = null, trailMeshWingL = null;
    let setWingTipVortex = function(myMesh) {
        // trail 用のメッシュ
        let wingL = 2.0;
        let myWingR = BABYLON.MeshBuilder.CreateBox("wingR", { width: 0.1, height:0.1, depth:0.1 }, scene);
        myWingR.position.copyFrom(myMesh.position);
        myWingR.position.addInPlaceFromFloats(wingL, 0, 2);
        myWingR.visibility = 0;
        myWingR.parent = myMesh;
        myMesh._myWingR = myWingR; // for setMyMeshVisibility
        let myWingL = BABYLON.MeshBuilder.CreateBox("wingL", { width: 0.1, height:0.1, depth:0.1 }, scene);
        myWingL.position.copyFrom(myMesh.position);
        myWingL.position.addInPlaceFromFloats(-wingL, 0, 2);
        myWingL.visibility = 0;
        myWingL.parent = myMesh;
        myMesh._myWingL = myWingL; // for setMyMeshVisibility
        // 飛行隊の主翼の端に追跡をつける
        trailMeshWingR = new BABYLON.TrailMesh("", myWingR, scene, {diameter:0.1, length:20, sections:2});
        trailMeshWingR.material = new BABYLON.StandardMaterial("", scene);
        trailMeshWingR.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        trailMeshWingR.material.alpha = 0.2;
        trailMeshWingL = new BABYLON.TrailMesh("", myWingL, scene, {diameter:0.1, length:20, sections:2});
        trailMeshWingL.material = new BABYLON.StandardMaterial("", scene);
        trailMeshWingL.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        trailMeshWingL.material.alpha = 0.2;
        trailMeshWingR.stop();
        trailMeshWingL.stop();
    }
    let onVaporTrail = function() {
        if (trailMeshWingR != null) {
            trailMeshWingR.start();
            trailMeshWingL.start();
            trailMeshWingR.material.alpha = 0.2;
            trailMeshWingL.material.alpha = 0.2;
        }
    }
    let offVaporTrail = function() {
        if (trailMeshWingR != null) {
            trailMeshWingR.stop();
            trailMeshWingL.stop();
            trailMeshWingR.material.alpha = 0;
            trailMeshWingL.material.alpha = 0;
        }
    }
    setWingTipVortex(myMesh);

    // ----------------------------------------
    // 衝撃波（アニメーション版
    let actSonicWave = function() {}, bActSonicWave = false;
    if (1) {
        let R90 = Math.PI/2;

        let wpMesh=null, wpMeshList=[];

            let nwp=1, wpr=1.1, wps=0.4, wpsrate=20; // 6;
            for (let iwp=0; iwp<nwp; ++iwp) {
                let wpm = BABYLON.MeshBuilder.CreateSphere("weapon", {diameter: wpr, slice:wps, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let px=0.5, py=0.7, pz=-1; // pz=10;
                wpm.position.set(px, py, 0);
                wpm.rotation.x = R90;
                wpm.scaling.set(0,0,0);
                wpm.material = new BABYLON.StandardMaterial("mat", scene);
                wpm.material.diffuseColor = BABYLON.Color3.Red();
                wpm.material.alpha = 0.2;
                wpm.parent=myMesh;
                {
                    let nframe=20, framePerSec=40, nframe_=nframe/2;
                    let nframe1=6,nframe2=13,nframe3=19;
                    let zSlide = new BABYLON.Animation("zSlide", "position.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let xSlide = new BABYLON.Animation("xSlide", "position.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let ySlide = new BABYLON.Animation("ySlide", "position.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let xScale = new BABYLON.Animation("xSlide", "scaling.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let yScale = new BABYLON.Animation("ySlide", "scaling.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let zScale = new BABYLON.Animation("zSlide", "scaling.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let keyPz=[],keyPx=[],keyPy=[];
                    let keySx=[],keySy=[],keySz=[];
                    keyPz.push({frame:0, value:0});
                    keyPz.push({frame:nframe-1, value:pz});
                    keyPz.push({frame:nframe, value:0});
                    keyPx.push({frame:0, value:px});
                    keyPx.push({frame:nframe, value:px});
                    keyPy.push({frame:0, value:py});
                    keyPy.push({frame:nframe, value:py});
                    keySx.push({frame:0, value:0});
                    keySx.push({frame:nframe-1, value:wpsrate});
                    keySx.push({frame:nframe, value:0});
                    keySy.push({frame:0, value:0});
                    keySy.push({frame:nframe-1, value:wpsrate });
                    keySy.push({frame:nframe, value:0});
                    keySz.push({frame:0, value:0});
                    keySz.push({frame:nframe-1, value:wpsrate });
                    keySz.push({frame:nframe, value:0});
                    zSlide.setKeys(keyPz);
                    xSlide.setKeys(keyPx);
                    ySlide.setKeys(keyPy);
                    xScale.setKeys(keySx);
                    yScale.setKeys(keySy);
                    zScale.setKeys(keySz);
                    wpm._anima = [zSlide,xSlide,ySlide,xScale,yScale,zScale];
                    wpm._nframe = nframe;
                }
                wpMeshList.push(wpm);
            }

            actSonicWave = function() {
                let wpm = wpMeshList.shift();
                wpMeshList.push(wpm);
                scene.beginDirectAnimation(wpm, wpm._anima, 0, wpm._nframe, false);
            }

    }

    // ----------------------------------------
    // 降雪
    let enableSnow = true;
    let psSnow = null;
    if (enableSnow) {
        // let fpathFlare = "textures/flare.png";
        let meshFountain;
        {
            meshFountain = BABYLON.MeshBuilder.CreateBox("", {}, scene);
            // meshFountain.position.set(4, 0, 4); // 30;
            meshFountain.position.z = 20; // 30;
            meshFountain.visibility = 0;
            meshFountain.parent = myMesh;
            myMesh._meshFountain = meshFountain; // for setMyMeshVisibility
        }
        let particleSystem = new BABYLON.ParticleSystem("", 200, scene);
        particleSystem.particleTexture = new BABYLON.Texture(fpathFlare, scene);
        // Where the particles come from
        particleSystem.emitter = meshFountain;
        particleSystem.minEmitBox = new BABYLON.Vector3(-10, -10, 0);
        particleSystem.maxEmitBox = new BABYLON.Vector3(10, 10, 0);
        // Colors of all particles
        particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
        // Size of each particle
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.2;
        // Life time of each particle
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 1.5;
        // Emission rate
        particleSystem.emitRate = 100;
        // Blend mode
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        // Gravity
        particleSystem.gravity = new BABYLON.Vector3(0, -10, 0);
        // Direction of each particle after it has been emitted
        particleSystem.direction1 = new BABYLON.Vector3(-1, 0, 1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 0, -1);
        // Angular speed
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        // Speed
        particleSystem.minEmitPower = 0;
        particleSystem.maxEmitPower = 0;
        particleSystem.updateSpeed = 0.005;
        // Noise
        const noiseTexture = new BABYLON.NoiseProceduralTexture("perlin", 256, scene);
        noiseTexture.animationSpeedFactor = 5;
        noiseTexture.persistence = 2;
        noiseTexture.brightness = 0.5;
        noiseTexture.octaves = 2;
        particleSystem.noiseTexture = noiseTexture;
        particleSystem.noiseStrength = new BABYLON.Vector3(100, 100, 100);
        psSnow = particleSystem;
        if (enableSnow) {
            particleSystem.start();
        } else {
            particleSystem.stop();
        }
    }


    // ------------------------------

//    let idevice=0; // ドローン風操作
    let idevice=1; // 疑似飛行機モード：カーソルで簡単操作／宙返りや背面飛行ができないけど
//    let idevice=2; // 飛行機モード：ロール・ピッチ―・ヨー操作

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

        // if (idevice==90) {
        //     // ドローン（モード１）左：前後移動・左右旋回　右スティック：上昇下降・左右移動
        //     // let quat = myMesh.rotationQuaternion;
        //     act.mud=0;
        //     if (map["ArrowUp"]) {
        //         act.mud=1;
        //     } else if (map["ArrowDown"]) {
        //         act.mud=-1;
        //     }
        //     act.mrl=0;
        //     if (map["ArrowRight"]) {
        //         act.mrl=1;
        //     } else if (map["ArrowLeft"]) {
        //         act.mrl=-1;
        //     }
        //     act.mfb=0;
        //     if (map["w"]) {
        //         act.mfb=1;
        //     } else if (map["s"]) {
        //         act.mfb=-1;
        //     }
        //     act.rrl=0;
        //     if (map["a"]) {
        //         act.rrl=1;
        //     } else if (map["d"]) {
        //         act.rrl=-1;
        //     }
        // }

        // if (idevice==91) {
        //     // ドローン（モード２）左：上昇下降・左右旋回　右スティック：前後移動・左右移動
        //     // let quat = myMesh.rotationQuaternion;
        //     act.mfb=0;
        //     if (map["ArrowUp"]) {
        //         act.mfb=1;
        //     } else if (map["ArrowDown"]) {
        //         act.mfb=-1;
        //     }
        //     act.mrl=0;
        //     if (map["ArrowRight"]) {
        //         act.mrl=1;
        //     } else if (map["ArrowLeft"]) {
        //         act.mrl=-1;
        //     }
        //     act.mud=0;
        //     if (map["w"]) {
        //         act.mud=1;
        //     } else if (map["s"]) {
        //         act.mud=-1;
        //     }
        //     act.rrl=0;
        //     if (map["a"]) {
        //         act.rrl=1;
        //     } else if (map["d"]) {
        //         act.rrl=-1;
        //     }
        // }

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
                // if (camera._cameraAccelerationMin < 0.05) {
                //     camera._cameraAccelerationMin = 0.8;
                //     camera._cameraAccelerationMax = 2.4; // FOV時
                // } else {
                //     camera._cameraAccelerationMin = 0.03;
                //     camera._cameraAccelerationMax = 0.09; // FOV時
                // }
                // camera.cameraAcceleration = camera._cameraAccelerationMin;
                // // enableBuffeting = !enableBuffeting;
                // console.log("cameraAcceleration=", camera.cameraAcceleration);
            }
            if (map["1"]) {
                // Buffeting
                cooltime_act = cooltime_actIni;
                enableBuffeting = !enableBuffeting;
                console.log("Buffeting=", enableBuffeting);
            }
            if (map["2"]) {
                // FOV
                cooltime_act = cooltime_actIni;
                enableFOV = !enableFOV;
                console.log("FOV=", enableFOV);
            }
            if (map["3"]) {
                // VaporTrail
                cooltime_act = cooltime_actIni;
                enableVaporTrail = !enableVaporTrail;
                console.log("VaporTrail=", enableVaporTrail);
            }
            if (map["4"]) {
                // Snow
                cooltime_act = cooltime_actIni;
                enableSnow = !enableSnow;
                console.log("Snow=", enableSnow);
                if (enableSnow) {
                    psSnow.start();
                } else {
                    psSnow.stop();
                }
            }
            if (map["5"]) {
                // Cloud1
                cooltime_act = cooltime_actIni;
                enableCloud1 = !enableCloud1;
                console.log("Cloud-1=", enableCloud1);
                if (enableCloud1) {
                    setCloud1();
                } else {
                    clearCloud1();
                }
            }
            if (map["6"]) {
                // Cloud2
                cooltime_act = cooltime_actIni;
                enableCloud2 = !enableCloud2;
                console.log("Cloud-2=", enableCloud2);
                if (enableCloud2) {
                    setCloud2();
                } else {
                    clearCloud2();
                }
            }
            if (map["7"]) {
                // fog
                cooltime_act = cooltime_actIni;
                enableFog = !enableFog;
                console.log("fog=", enableFog);
                setFog(enableFog);
            }

            // if (map["m"]) {
            //     // モードの切り替え
            //     cooltime_act = cooltime_actIni;
            // }
            // if (map["n"] || map["b"]) {
            //     // ステージ切り替え
            // }
            // if (map["c"] || map["v"]) {
            //     // カメラ切り替え
            // }
            // if (map["h"]) {
            //     // help/usage
            // }
        }
    });

    scene.registerBeforeRender(function() {
        let quat = myMesh.rotationQuaternion;

        if (idevice==0) {
            // 機体操作１：上昇下降とヨー回転
            if (act.mud != 0) {
                let rateUD = 0.3;
                let vdir = BABYLON.Vector3.Up().scale(rateUD*act.mud);
                myMesh.position.addInPlace(vdir);
            }
            if (act.mrl != 0) {
                let rateRL = 0.05;
                let v3axisY = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                let quatR = BABYLON.Quaternion.RotationAxis(v3axisY, rateRL*act.mrl);
                quat = quatR.multiply(quat);
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
        }

        if (idevice==1) {
            // 機体操作２：ロール角度に応じたヨー回転と自動補正
            const R60 = Math.PI/3;
            const R360 = Math.PI*2;
            let vEuler = quat.toEulerAngles();
            if (act.mud != 0) {
                // 上下時：ピッチ
                if (Math.abs(myMesh._vEuler.x) < R60) {
                    let v3axisP = BABYLON.Vector3.Right().applyRotationQuaternion(quat);
                    let v = 0.02*act.mud;
                    myMesh._vEuler.x += v;
                    let quatP = BABYLON.Quaternion.RotationAxis(v3axisP, v);
                    quat = quatP.multiply(quat);
                    myMesh.rotationQuaternion = quat;
                }
            } else {
                // 水平 に復帰
                if (myMesh._vEuler.x == 0) {
                } else if (Math.abs(myMesh._vEuler.x) > 0.001) {
                    myMesh._vEuler.x = BABYLON.Lerp(myMesh._vEuler.x, 0, 0.02);
                } else {
                    myMesh._vEuler.x = 0;
                }
                quat = BABYLON.Quaternion.RotationYawPitchRoll(myMesh._vEuler.y, myMesh._vEuler.x, myMesh._vEuler.z);
                myMesh.rotationQuaternion = quat;
            }
            if (act.mrl != 0) {
                // 左右時：ロール
                if (Math.abs(myMesh._vEuler.z) < R60) {
                    let v3axisR = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                    let v = -0.02*act.mrl;
                    myMesh._vEuler.z += v;
                    let quatR = BABYLON.Quaternion.RotationAxis(v3axisR, v);
                    quat = quatR.multiply(quat);
                    myMesh.rotationQuaternion = quat;
                }
            } else {
                // 垂直に復帰
                if (myMesh._vEuler.z == 0) {
                } else if (Math.abs(myMesh._vEuler.z) > 0.001) {
                    myMesh._vEuler.z = BABYLON.Lerp(myMesh._vEuler.z, 0, 0.02);
                } else {
                    myMesh._vEuler.z = 0;
                }
                quat = BABYLON.Quaternion.RotationYawPitchRoll(myMesh._vEuler.y, myMesh._vEuler.x, myMesh._vEuler.z);
                myMesh.rotationQuaternion = quat;
            }
            if ((act.mud == 0) && (act.mrl == 0)) {
                myMesh.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(myMesh._vEuler.y, myMesh._vEuler.x, myMesh._vEuler.z);
            }
            // ロールの傾きに応じてヨー回転させる
            if (myMesh._vEuler.z != 0) {
                let v = -0.02*myMesh._vEuler.z
                myMesh._vEuler.y += v;
                if (myMesh._vEuler.y < 0) {myMesh._vEuler.y += R360;} else if (myMesh._vEuler.y > R360) {myMesh._vEuler.y -= R360;}
                let quatY = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), v);
                quat = quatY.multiply(quat);
                myMesh.rotationQuaternion = quat;
            }
            // 前進
            {
                let q = BABYLON.Quaternion.RotationYawPitchRoll(myMesh._vEuler.y, myMesh._vEuler.x, myMesh._vEuler.z);
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(q);
                if (act.ctrl) {
                    vdir.scaleInPlace(3);
                }
                myMesh.position.addInPlace(vdir);
                //境界条件
                if (myMesh.position.x < worldMin) { myMesh.position.x += worldRng; }
                if (myMesh.position.x > worldMax) { myMesh.position.x -= worldRng; }
                if (myMesh.position.z < worldMin) { myMesh.position.z += worldRng; }
                if (myMesh.position.z > worldMax) { myMesh.position.z -= worldRng; }
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
            // 姿勢をリセットする：ヨーだけを残して、ロール・ピッチを徐々に０にする
            if (act.ent) { myMesh._resetPosture = 1; }
            if (myMesh._resetPosture) {
                let vEuler = quat.toEulerAngles();
                vEuler.x = BABYLON.Lerp(vEuler.x, 0, 0.05);
                vEuler.z = BABYLON.Lerp(vEuler.z, 0, 0.05);
                if (Math.abs(vEuler.x) < 0.01 && Math.abs(vEuler.z) < 0.01) {
                    vEuler.x = 0;
                    vEuler.z = 0;
                    myMesh._resetPosture = 0;
                }
                quat = BABYLON.Quaternion.RotationYawPitchRoll(vEuler.y, vEuler.x, vEuler.z);
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

        if (act.ctrl) {
            if (enableBuffeting) {
                actBuffeting(); // 微振動（Buffeting）
            }
            if (enableFOV) {
                cameraFOVlock = true; setCameraFOVup(); // FOV
            }
            if (enableVaporTrail) {
                onVaporTrail();
            }

        } else {
            if (enableFOV) {
                cameraFOVlock = false; // FOV
            }
            if (enableVaporTrail) {
                offVaporTrail();
            }
        }

    });


    // ----------------------------------------

    if (1) {
        // 障害物 / 角柱
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
            mesh.material.diffuseColor = BABYLON.Color3.Random();
        }
        {
            let p = new BABYLON.Vector3(0, 1000-20, 0);
            let sizeH = Math.abs(p.y+20)*2;
            let mesh = BABYLON.MeshBuilder.CreateBox("", { size:10, height:sizeH }, scene);
            mesh.position = p;
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.material.diffuseColor = BABYLON.Color3.White();
        }
    }
    if (1) {
        // 障害物 / 浮遊体
        // let n = 100, rand=1000, rand_=rand/2;
        let n = 100, rand=worldRng, rand_=rand/2;
        for (let i = 0; i < n; ++i) {
            let p = BABYLON.Vector3.Random(-rand_, rand_);
            p.y = p.y*0.4 + 1000;
            let mesh = BABYLON.MeshBuilder.CreateBox("", { size:10 }, scene);
            mesh.position = p;
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.material.diffuseColor = BABYLON.Color3.Random();
        }
    }

    // 雲テスト／スプライト（低層
    // 雲海をつくる
    let enableCloud1 = true, renderCloud1 = false;
    let spriteManagerTrees1 = null;
    let meshlist1 = [];
    let cloudRng1 = 1000;
    let clearCloud1 = function() {
        renderCloud1 = false;
        if (spriteManagerTrees1 != null) {
            spriteManagerTrees1.dispose();
            spriteManagerTrees1 = null;
        }
        while (meshlist1.length > 0) {
            let mesh = meshlist1.pop();
            mesh.dispose();
        }
    }
    let setCloud1 = function() {
        clearCloud1();
        let nCapa = 1000;
        let adjy=0;
        spriteManagerTrees1 = new BABYLON.SpriteManager("", fpathCloud, nCapa, {width: 256, height: 256});
        let x, y, z;
        for (let i = 0; i < nCapa; ++i) {
            let meshSub = new BABYLON.Sprite("", spriteManagerTrees1);
            meshSub.width = BABYLON.Scalar.RandomRange(23, 44);
            meshSub.height = BABYLON.Scalar.RandomRange(23, 44);
            x = BABYLON.Scalar.RandomRange(-cloudRng1, cloudRng1);
            y = BABYLON.Scalar.RandomRange(-0.5, 0.5)*10;
            z = BABYLON.Scalar.RandomRange(-cloudRng1, cloudRng1);
            meshSub.position = new BABYLON.Vector3(x,y+meshSub.height/2+adjy,z);
            meshlist1.push(meshSub);
        }
        renderCloud1 = true;
    }
    scene.onBeforeRenderObservable.add(() => {
        if (renderCloud1) {
            for (let mesh of meshlist1) {
                mesh.position.x += 0.01;
                if (mesh.position.x >= cloudRng1) {
                    mesh.position.x -= cloudRng1*2;
                }
            }
        }
    });
    if (enableCloud1) {
        setCloud1();
    } else {
        clearCloud1();
    }

    // 層雲（上層／スプライト（固定 .. 風が強いとき
// const fpathCloud = "textures/cloud.png";
// // const fpathCloud = "../088/textures/cloud.png";
// // const fpathCloud = "https://raw.githubusercontent.com/fnamuoo/webgl/main//088/textures/cloud.png";
    let enableCloud2 = false, renderCloud2 = false;
    let spriteManagerTrees2 = null;
    let meshlist2 = [];
    let cloudRng2 = 1000;
    let clearCloud2 = function() {
        renderCloud2 = false;
        if (spriteManagerTrees2 != null) {
            spriteManagerTrees2.dispose();
            spriteManagerTrees2 = null;
        }
        while (meshlist2.length > 0) {
            let mesh = meshlist2.pop();
            mesh.dispose();
        }
    }
    let setCloud2 = function() {
        clearCloud2();
        // 雲海をつくる
        let nCapa = 20;
        let adjy=0;
        spriteManagerTrees2 = new BABYLON.SpriteManager("", fpathCloud, nCapa, {width: 256, height: 256});
        let meshlist = [], x, y, z;
        for (let i = 0; i < nCapa; ++i) {
            let meshSub = new BABYLON.Sprite("", spriteManagerTrees2);
            meshSub.width = BABYLON.Scalar.RandomRange(100, 200);
            meshSub.height = BABYLON.Scalar.RandomRange(3, 6);
            x = BABYLON.Scalar.RandomRange(-cloudRng2, cloudRng2);
            y = BABYLON.Scalar.RandomRange(-0.5, 0.5)*10 + 2000;
            z = BABYLON.Scalar.RandomRange(-cloudRng2, cloudRng2);
            meshSub.position = new BABYLON.Vector3(x,y+meshSub.height/2+adjy,z);
            meshlist2.push(meshSub);
        }
    }
    scene.onBeforeRenderObservable.add(() => {
        if (renderCloud2) {
            for (let mesh of meshlist) {
                mesh.position.x += 0.2;
                if (mesh.position.x >= cloudRng2) {
                    mesh.position.x -= cloudRng2*2;
                }
                // mesh.position.y += (Math.random()-0.5)/100;
            }
        }
    });
    if (enableCloud2) {
        setCloud2();
    } else {
        clearCloud2();
    }

    // ----------------------------------------
    // 高度に応じた霧
    let enableFog = false;
    scene.onBeforeRenderObservable.add(() => {
        if (enableFog) {
            let y = myMesh.position.y % 1000;
            if (100 < y && y < 500) {
                scene.fogDensity = 0.01/Math.abs(300-y);
                scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            } else {
                scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
            }
        }
    });
    let setFog = function(bflag) {
        enableFog = bflag;
        if (enableFog) {
            scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);
            scene.fogDensity = 0.001;
            let y = myMesh.position.y % 1000;
            if (100 < y && y < 500) {
                scene.fogDensity = 0.05/Math.abs(300-y);
            }
        } else {
            scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
        }
    }
    setFog(enableFog);

    // ----------------------------------------

    let skybox = null;
    if (1) {
        // Skybox
        // let skyboxTextPath;
        // if (skyboxType < 0) {
        //     let i = Math.floor(skyboxTextPathList.length*Math.random());
        //     skyboxTextPath = skyboxTextPathList[i];
        // } else {
        //     skyboxTextPath = skyboxTextPathList[skyboxType];
        // }
        // const skyboxTextPath = "textures/zgrid3";
        // skyboxTextPath = skyboxTextPathList[skyboxType];
        skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:6000.0}, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        // meshAggInfo.push([skybox,null]);
    }

    return scene;
};


// ======================================================================

export var createScene = createScene_test_draft_fly_05; // ＋移動(idevice=2

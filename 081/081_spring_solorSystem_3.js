// Babylon.js で物理演算(havok)：SpringConstraintで太陽系(3)

// // for local(dev)
// const txt_tail_bubble = "textures/flare3.png";

// for local
const txt_tail_bubble = "../068/textures/flare3.png";

// for PlayGround
// const txt_tail_bubble = "textures/flare3.png";
    
var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    const hk = new BABYLON.HavokPlugin(false);
    // scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), hk);

    // カメラ(メイン
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(1, 10, -100), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    let camera2type = 0, ncamera2type = 2; // ワイプ表示 (0: 無し、1: caemra2a/2b
    let iplanet = 3; // 最初の 追跡対象の惑星
    let iplanetlist = [1,2,3,4,5,6,7,-1,9,-1,11,-1];
    // カメラ(サブ１  .. 追跡用
    let camera2a = new BABYLON.FreeCamera("Camera2a", new BABYLON.Vector3(2, 5, -10), scene);
    camera2a.setTarget(BABYLON.Vector3.Zero());
    camera2a.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    // 若干中心に傾けるquat
    let cam2quat1 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.02);
    let cam2quat2 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.02);
    let cam2quat3 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.008);
    let cam2quat5 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.016);
    let cam2quat6 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.008);
    let cam2quat7 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.007);
    let cam2quat9 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.01);
    let cam2quat11= new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.015);
    const ip2LQ = {1:[5, cam2quat1],  // 水星
                   2:[10, cam2quat2], // 金星
                   3:[15, cam2quat3], // 地球
                   4:[15, cam2quat3], // 月
                   5:[15, cam2quat5], // 火星
                   6:[50, cam2quat6], // 木星
                   7:[50, cam2quat7], // 土星
                   9:[10, cam2quat9], // 天王星
                   11:[10, cam2quat11], // 海王星
                   }
    let [cam2aL, cam2quat] = ip2LQ[iplanet];

    // // カメラ(サブ２  .. 惑星視点 .. 内側にもテクスチャがあるのでメッシュが消えない。使わない。
    // const camera2b = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    // camera2b.rotationOffset = 180;
    // camera2b.radius = 0.5;
    // camera2b.heightOffset = 0.5;
    // camera2b.cameraAcceleration = 0.1;
    // camera2b.maxCameraSpeed = 4;
    // camera2b.attachControl(canvas, true);
    // camera2b.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    // 惑星の赤道上からの視点
    let camera2c = new BABYLON.FreeCamera("Camera2c", new BABYLON.Vector3(2, 5, -10), scene);
    camera2c.setTarget(BABYLON.Vector3.Zero());
    camera2c.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    scene.activeCameras.push(camera);
    camera.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
    camera2a.viewport = new BABYLON.Viewport(0.0, 0.5, 0.5, 0.5); // 左上
    // camera2b.viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5); // 右上
    camera2c.viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5); // 右上

    // Lightning
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1000, 0), scene);
    light.intensity = 0.7;
    var light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -1000, 0), scene);
    light2.intensity = 0.2;

    let createPlanet = function(scene, opt={}) {
        let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
        let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
        let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;
        let px = typeof(opt.px) !== 'undefined' ? opt.px : 0;
        let py = typeof(opt.py) !== 'undefined' ? opt.py : 0;
        let pz = typeof(opt.pz) !== 'undefined' ? opt.pz : 0;
        let diam = typeof(opt.diam) !== 'undefined' ? opt.diam : 2;
        let ringR1 = typeof(opt.ringR1) !== 'undefined' ? opt.ringR1 : 0;
        let ringR2 = typeof(opt.ringR2) !== 'undefined' ? opt.ringR2 : 0;
        let mass = typeof(opt.mass) !== 'undefined' ? opt.mass : 0;

        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: diam }, scene);
        mesh._r = diam/2;
        mesh.position.set(px+adjx, py+adjy, pz+adjz);
        if (1) {
            mesh.material = new BABYLON.GridMaterial("mat" + mesh.name);
            mesh.material.majorUnitFrequency = 1;
            mesh.material.minorUnitVisibility  = 0.15;
        }
        agg = null;
        if (ringR1 == 0) {
            agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: mass, restitution:1}, scene);
        } else if (ringR1 > 0) {
            const myShape = [new BABYLON.Vector3(ringR1, 0, 0), new BABYLON.Vector3(ringR2, 0, 0),];
            let mesh2 = BABYLON.MeshBuilder.CreateLathe("", {shape: myShape});
            mesh2.parent = mesh;
            agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: mass, restitution:1}, scene);
            // agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: mass, restitution:1}, scene);
            return [mesh, agg, mesh2];
        }
        return [mesh, agg];
    }

    var springEx2 = function (scene, opt={}) {
        let sp1 = typeof(opt.sp1) !== 'undefined' ? opt.sp1 : null;
        let agg1 = typeof(opt.agg1) !== 'undefined' ? opt.agg1 : null;
        let sp2 = typeof(opt.sp2) !== 'undefined' ? opt.sp2 : null;
        let agg2 = typeof(opt.agg2) !== 'undefined' ? opt.agg2 : null;
        let minDist = typeof(opt.minDist) !== 'undefined' ? opt.minDist : 10;
        let maxDist = typeof(opt.maxDist) !== 'undefined' ? opt.maxDist : 12;
        let stiff = typeof(opt.stiff) !== 'undefined' ? opt.stiff : 100;
        let damping = typeof(opt.damping) !== 'undefined' ? opt.damping : 0.5;
        let motorTrg = typeof(opt.motorTrg) !== 'undefined' ? opt.motorTrg : 2;
        let motorMFo = typeof(opt.motorMFo) !== 'undefined' ? opt.motorMFo : 10;
        let appImp = typeof(opt.appImp) !== 'undefined' ? opt.appImp : 1000;
        let joint = new BABYLON.SpringConstraint(
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(1, 0, 0),
            new BABYLON.Vector3(1, 0, 0),
            minDist, // minDistance,
            maxDist, // maxDistance,
            stiff,   // stiffness,
            damping, // damping,
            scene
        );
        agg1.body.addConstraint(agg2.body, joint);
        joint.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Y,
                               BABYLON.PhysicsConstraintMotorType.VELOCITY);
        joint.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, motorTrg);
        joint.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, motorMFo);
        agg2.body.applyImpulse(new BABYLON.Vector3(0, 0, appImp), sp2.position);
    }

    function addBubble(mesh, opt={}) {
        // 軌跡
        let py = typeof(opt.py) !== 'undefined' ? opt.py : 1;
        let life = typeof(opt.life) !== 'undefined' ? opt.life : 1;
        let particleSystem = new BABYLON.ParticleSystem("particles", 4000);
        particleSystem.particleTexture = new BABYLON.Texture(txt_tail_bubble);
        particleSystem.emitter = mesh;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.02, -py, -0.02);
        particleSystem.maxEmitBox = new BABYLON.Vector3( 0.02, -py, 0.02);
        particleSystem.minScaleX = 0.10;
        particleSystem.maxScaleX = 0.12;
        particleSystem.minScaleY = 0.10;
        particleSystem.maxScaleY = 0.12;
        particleSystem.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0.0, 0.0, 0.0, 0.0);
        particleSystem.emitRate = 1000;
        particleSystem.direction1 = new BABYLON.Vector3(-0.1, 0, -0.1);
        particleSystem.direction2 = new BABYLON.Vector3(0.1, 0, 0.1);
        particleSystem.updateSpeed = 0.002;
        particleSystem.minLifeTime = life*0.8;
        particleSystem.maxLifeTime = life;
        particleSystem.start();
        return particleSystem;
    }

    let meshagglist = [], mesh, agg, mesh2;
    let opt, opt2, ip, ip_;

    // 0:アンカー
    opt = {diam:0.001, mass:0};
    let [meshAnc, aggAnc] = createPlanet(scene, opt);

    if (1) {
    // 0:太陽
    opt = {diam:20, mass:100};
    [mesh, agg] = createPlanet(scene, opt);
    meshagglist.push([mesh, agg]);
    // 1:水星
    opt = {diam:1, mass:10, px:20};
    [mesh, agg] = createPlanet(scene, opt);
    meshagglist.push([mesh, agg]);
    // 2:金星
    opt = {diam:2, mass:50, px:25, pz:-2};
    [mesh, agg] = createPlanet(scene, opt);
    meshagglist.push([mesh, agg]);
    // 3:地球
    opt = {diam:3, mass:100, px:35, pz:5};
    [mesh, agg] = createPlanet(scene, opt);
    meshagglist.push([mesh, agg]);
    // 4:月
    opt = {diam:0.8, mass:100, px:37, pz:5};
    [mesh, agg] = createPlanet(scene, opt);
    meshagglist.push([mesh, agg]);
    // 5:火星
    opt = {diam:3.5, mass:100, px:45, pz:-8};
    [mesh, agg] = createPlanet(scene, opt);
    meshagglist.push([mesh, agg]);
    // 6:木星
    opt = {diam:10, mass:100, px:65, pz:-5};
    [mesh, agg] = createPlanet(scene, opt);
    meshagglist.push([mesh, agg]);
    // 7:土星
    opt = {diam:8, mass:100, ringR1:5.5, ringR2:9.5, px:85, pz:-10};
    [mesh, agg, mesh2] = createPlanet(scene, opt);
    meshagglist.push([mesh, agg]);
    meshagglist.push([mesh2, null]);
    // 9:天王星
    opt = {diam:1, mass:10, ringR1:2.5, ringR2:3, px:100, pz:0};
    [mesh, agg, mesh2] = createPlanet(scene, opt);
    meshagglist.push([mesh, agg]);
    meshagglist.push([mesh2, null]);
    // 11:海王星
    opt = {diam:1, mass:10, px:120, pz:-4};
    [mesh, agg] = createPlanet(scene, opt);
    meshagglist.push([mesh, agg]);
    }

    // ---- バネの設置 ------------------------------

    ip = 0;
    opt = {sp1:meshAnc, agg1:aggAnc, sp2:meshagglist[ip][0], agg2:meshagglist[ip][1], // 太陽
           minDist:0, maxDist:0, motorTrg:0.1, motorMFo:1000, appImp:100, };
    springEx2(scene, opt);

    ip = 1;
    opt = {sp1:meshAnc, agg1:aggAnc, sp2:meshagglist[ip][0], agg2:meshagglist[ip][1], // 水星
           minDist:20, maxDist:22, motorTrg:5, motorMFo:50, appImp:100, };
    springEx2(scene, opt);
    opt2 = {py:0.5, life:0.2};
    addBubble(meshagglist[ip][0], opt2);

    ip = 2;
    opt = {sp1:meshAnc, agg1:aggAnc, sp2:meshagglist[ip][0], agg2:meshagglist[ip][1], // 金星
           minDist:25, maxDist:27, motorTrg:3, motorMFo:20, appImp:1000, };
    springEx2(scene, opt);
    opt2 = {py:1, life:0.5};
    addBubble(meshagglist[ip][0], opt2);

    ip = 3;
    opt = {sp1:meshAnc, agg1:aggAnc, sp2:meshagglist[ip][0], agg2:meshagglist[ip][1], // 地球
           minDist:35, maxDist:37, motorTrg:2, motorMFo:10, appImp:2000, };
    springEx2(scene, opt);
    opt2 = {py:1.5, life:0.5};
    addBubble(meshagglist[ip][0], opt2);

    ip = 4; ip_=ip-1;
    opt = {sp1:meshagglist[ip_][0], agg1:meshagglist[ip_][1], sp2:meshagglist[ip][0], agg2:meshagglist[ip][1], // 月
           minDist:1, maxDist:2.5, motorTrg:0.0001, motorMFo:0.2, appImp:100, };
    springEx2(scene, opt);
    opt2 = {py:0.4, life:0.2};
    addBubble(meshagglist[ip][0], opt2);

    ip = 5;
    opt = {sp1:meshAnc, agg1:aggAnc, sp2:meshagglist[ip][0], agg2:meshagglist[ip][1], // 火星
           minDist:45, maxDist:50, motorTrg:2, motorMFo:10, appImp:2000, };
    springEx2(scene, opt);
    opt2 = {py:1.7, life:2};
    addBubble(meshagglist[ip][0], opt2);

    ip = 6;
    opt = {sp1:meshAnc, agg1:aggAnc, sp2:meshagglist[ip][0], agg2:meshagglist[ip][1], // 木星
           minDist:65, maxDist:70, motorTrg:10, motorMFo:50, appImp:2000, };
    springEx2(scene, opt);
    opt2 = {py:5, life:5};
    addBubble(meshagglist[ip][0], opt2);

    ip = 7;
    opt = {sp1:meshAnc, agg1:aggAnc, sp2:meshagglist[ip][0], agg2:meshagglist[ip][1], // 土星
           minDist:85, maxDist:90, motorTrg:10, motorMFo:50, appImp:2000, };
    springEx2(scene, opt);
    opt2 = {py:4, life:5};
    addBubble(meshagglist[ip][0], opt2);

    ip = 9;
    opt = {sp1:meshAnc, agg1:aggAnc, sp2:meshagglist[ip][0], agg2:meshagglist[ip][1], // 天王星
           minDist:100, maxDist:105, motorTrg:0.2, motorMFo:2, appImp:80, };
    springEx2(scene, opt);
    opt2 = {py:0.5, life:3};
    addBubble(meshagglist[ip][0], opt2);

    ip = 11;
    opt = {sp1:meshAnc, agg1:aggAnc, sp2:meshagglist[ip][0], agg2:meshagglist[ip][1], // 海王星
           minDist:120, maxDist:125, motorTrg:0.1, motorMFo:1, appImp:110, };
    springEx2(scene, opt);
    opt2 = {py:0.5, life:4};
    addBubble(meshagglist[ip][0], opt2);

    // ここから引用
    // https://scrapbox.io/babylonjs/%E5%9C%B0%E7%90%83%E3%82%92%E5%9B%9E%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B
    if (1) {
    const cubeTexture = new BABYLON.CubeTexture(
        "https://rawcdn.githack.com/mrdoob/three.js/d8b547a7c1535e9ff044d196b72043f5998091ee/examples/textures/cube/MilkyWay/",
        scene,
        ["dark-s_px.jpg", "dark-s_py.jpg", "dark-s_pz.jpg", "dark-s_nx.jpg", "dark-s_ny.jpg", "dark-s_nz.jpg"]
    );
    const skybox = BABYLON.Mesh.CreateBox("skyBox", 10000, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = cubeTexture;
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    }

    let loadMeshGLB = function(scene, url, fname) {
        var assetsManager = new BABYLON.AssetsManager(scene);
        var meshTask = assetsManager.addMeshTask("spellDiskTask", null, url, fname);

        meshlist = [];
        meshTask.onSuccess = function(task) {
            task.loadedMeshes.forEach(function(mesh){
                meshlist.push(mesh);
            });
        }

        assetsManager.onFinish = function (tasks) {
            meshagglist[0][0].material = meshlist[1].material.clone(); // 太陽
            meshagglist[1][0].material = meshlist[2].material.clone(); // 水星
            meshagglist[2][0].material = meshlist[3].material.clone(); // 金星
            meshagglist[3][0].material = meshlist[4].material.clone(); // 地球
            meshagglist[4][0].material = meshlist[6].material.clone(); // 月
            meshagglist[5][0].material = meshlist[5].material.clone(); // 火星
            meshagglist[6][0].material = meshlist[7].material.clone(); // 木星
            meshagglist[7][0].material = meshlist[9].material.clone();  // 土星
            meshagglist[8][0].material = meshlist[10].material.clone(); // 土星 輪
            meshagglist[9][0].material = meshlist[11].material.clone();  // 天王星
            meshagglist[10][0].material = meshlist[12].material.clone(); // 天王星 輪
            meshagglist[11][0].material = meshlist[8].material.clone();  // 海王星

            meshlist[0].dispose();
            meshlist[0] = null;
        };

        assetsManager.load();
        return  meshlist;
    }

    let url = "https://assets.babylonjs.com/meshes/";
    let fname = "solar_system.glb";
    let ssmeshlist = loadMeshGLB(scene, url, fname);


    scene.onBeforeRenderObservable.add((scene) => {
        // カメラ2a用の更新
        if (camera2type > 0) {
            let trgMesh = meshagglist[iplanet][0];
            let vdir2 = camera2a.position.subtract(trgMesh.position).normalize().scale(cam2aL);
            vdir2 = vdir2.applyRotationQuaternion(cam2quat);
            vdir2.y = 1;
            camera2a.position = trgMesh.position.add(vdir2);

            let v = new BABYLON.Vector3(0, 0, 1);
            v = v.applyRotationQuaternion(trgMesh.rotationQuaternion);
            camera2c.lockedTarget = trgMesh.position.add(v.scale(cam2aL));

            // 赤道上にカメラをもってくる
            camera2c.position = trgMesh.position.clone();
            camera2c.position.addInPlace(v.scale(trgMesh._r));
        }
    });

    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ' || kbInfo.event.key == 'v') {
                {
                    // メイン(camera)とサブ(camera2,camera2B)の複数カメラワーク
                    camera2type = (camera2type+1) % ncamera2type;
                    if (camera2type == 0) {
                        // メインのみ
                        while (scene.activeCameras.length > 0) {
                            scene.activeCameras.pop();
                        }
                        scene.activeCameras.push(camera);
                        camera.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
                    } else if (camera2type == 1) {
                        // メイン（下）＋サブ（左上、右上）
                        if (scene.activeCameras.length >= 2) {
                            scene.activeCameras.pop();
                        }
                        scene.activeCameras.push(camera2a);
                        scene.activeCameras.push(camera2c);
                        camera.viewport = new BABYLON.Viewport(0, 0, 1.0, 0.5);
                        camera2a.viewport = new BABYLON.Viewport(0.0, 0.5, 0.5, 0.5); // 左上
                        camera2c.viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5); // 右上
                        camera2a.lockedTarget = meshagglist[iplanet][0];
                    }
                }
            }
            if (kbInfo.event.key == 'Enter' || kbInfo.event.key == 'n') {
                // 次の惑星
                while (1) {
                    iplanet = (iplanet+1) % iplanetlist.length;
                    if (iplanetlist.includes(iplanet)) break;
                }
                [cam2aL, cam2quat] = ip2LQ[iplanet];
                camera2a.lockedTarget = meshagglist[iplanet][0];

            } else if (kbInfo.event.key == 'b' || kbInfo.event.key == 'p') {
                // １つ前の惑星
                while (1) {
                    iplanet = (iplanet+iplanetlist.length-1) % iplanetlist.length;
                    if (iplanetlist.includes(iplanet)) break;
                }
                [cam2aL, cam2quat] = ip2LQ[iplanet];
                camera2a.lockedTarget = meshagglist[iplanet][0];

            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            break;
        }
    });

    return scene;
};

// Babylon.js で物理演算(havok)：SpringConstraintで太陽系

// for local
const txt_mercury = "../068/textures/waterbump.png";
const txt_earth = "textures/earth.jpg";
const txt_moon = "textures/Moon_texture.jpg";
const txt_jupiter = "textures/jupitermap.jpg"; // https://planetpixelemporium.com/jupiter.html
const txt_comet1 = "textures/floor.png";
const txt_comet2 = "textures/grass.png";
const txt_tail_bubble = "../068/textures/flare3.png";

// for PlayGround
// const txt_mercury = "textures/waterbump.png";
// const txt_earth = "textures/earth.jpg";
// const txt_moon    = "https://raw.githubusercontent.com/fnamuoo/webgl/main/081/textures/Moon_texture.jpg";
// const txt_jupiter = "https://raw.githubusercontent.com/fnamuoo/webgl/main/081/textures/jupitermap.jpg";
// const txt_comet1 = "textures/floor.png";
// const txt_comet2 = "textures/grass.png";
// const txt_tail_bubble = "textures/flare3.png";

var physicsViewer;
var useViewer;
let dynamicObjectPhysicsBody;
let trgPhysList = [];
let meshPhys = [];

const R0 = 0;
const R15 = Math.PI/12;
const R30 = Math.PI/6;
const R45 = Math.PI/4;
const R60 = Math.PI/3;
const R90 = Math.PI/2;
const R135 = Math.PI*3/4;
const R180 = Math.PI;
const R225 = Math.PI*5/4;
const R270 = Math.PI*3/2;
const R360 = Math.PI*2;

function setAutoMat(mesh, col = null) {
    if (col == "grid") {
        mesh.material = new BABYLON.GridMaterial("mat" + mesh.name);
        mesh.material.majorUnitFrequency = 1;
        mesh.material.minorUnitVisibility  = 0.15;
        return;
    }
    mesh.material = new BABYLON.StandardMaterial("mat" + mesh.name);
    if (!col) {
        col = BABYLON.Color3.Random();
    }
    mesh.material.diffuseColor = col;
    return col;
}

// --------------------------------------------------
// ------------------------------

var springEx1_a3 = function (scene, opt={}) {
    // 横
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;
    let coll = typeof(opt.coll) !== 'undefined' ? opt.coll : 0;
    let txt = typeof(opt.txt) !== 'undefined' ? opt.txt : "";
    let col = typeof(opt.col) !== 'undefined' ? opt.col : null;
    let diam = typeof(opt.diam) !== 'undefined' ? opt.diam : 3;
    let px = typeof(opt.px) !== 'undefined' ? opt.px : 8;
    let mass = typeof(opt.mass) !== 'undefined' ? opt.mass : 100;
    let minDist = typeof(opt.minDist) !== 'undefined' ? opt.minDist : 10;
    let maxDist = typeof(opt.maxDist) !== 'undefined' ? opt.maxDist : 12;
    let stiff = typeof(opt.stiff) !== 'undefined' ? opt.stiff : 100;
    let damping = typeof(opt.damping) !== 'undefined' ? opt.damping : 0.5;
    let motorTrg = typeof(opt.motorTrg) !== 'undefined' ? opt.motorTrg : 2;
    let motorMFo = typeof(opt.motorMFo) !== 'undefined' ? opt.motorMFo : 10;
    let appImp = typeof(opt.appImp) !== 'undefined' ? opt.appImp : 1000;
    let sp1 = typeof(opt.sp1) !== 'undefined' ? opt.sp1 : null;
    let agg1 = typeof(opt.agg1) !== 'undefined' ? opt.agg1 : null;
    
    if (sp1 == null) {
    sp1 = BABYLON.MeshBuilder.CreateSphere("target", { diameter: 2, segments: 8 }, scene);
    sp1.position.set(adjx, adjy, adjz);
    setAutoMat(sp1, "grid");
    agg1 = new BABYLON.PhysicsAggregate(sp1, BABYLON.PhysicsShapeType.SPHERE, { mass: 0, restitution:1}, scene);
    }

    let sp2 = BABYLON.MeshBuilder.CreateSphere("target", { diameter: diam, segments: 8 }, scene);
    sp2.position.set(adjx+px, adjy, adjz);
    if (txt == "") {
        setAutoMat(sp2);
    } else {
        let mat = new BABYLON.StandardMaterial("", scene);
        mat.diffuseTexture = new BABYLON.Texture(txt, scene);
        mat.diffuseTexture.vScale = -1;
        mat.diffuseTexture.uScale = -1;
        if (col != null) {
            if (col == []) {
                mat.diffuseColor = BABYLON.Color3.Random();
            } else {
                mat.diffuseColor = new BABYLON.Color3(col[0], col[1], col[2]);
            }
        }
        sp2.material = mat;
    }

    let agg2 = new BABYLON.PhysicsAggregate(sp2, BABYLON.PhysicsShapeType.SPHERE, { mass: mass, restitution:1, friction:0.001}, scene);

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
    if (coll) {joint.isCollisionsEnabled = true;}
    joint.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Y,
                           BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y  , motorTrg);
    joint.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, motorMFo);

    agg2.body.applyImpulse(new BABYLON.Vector3(0, 0, appImp), sp2.position);

    if (useViewer) { physicsViewer.showConstraint(joint); }
    trgPhysList.push(agg2);
    return [sp1, agg1, sp2, agg2]
};


// --------------------------------------------------
// ------------------------------

var createScene = function () {
    // Scene
    var scene = new BABYLON.Scene(engine);

//    useViewer = true;
    useViewer = false;

    var plugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), plugin);
    if (useViewer) {
        physicsViewer = new BABYLON.PhysicsViewer();
    }

    // カメラ(メイン
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(1, 1, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    let camera2type = 0, ncamera2type = 2; // ワイプ表示 (0: 無し、1: caemra2a/2b
    let iplanet = 2; // 追跡対象の惑星
    // カメラ(サブ１  .. 追跡用
    let camera2a = new BABYLON.FreeCamera("Camera2a", new BABYLON.Vector3(2, 5, -10), scene);
    camera2a.setTarget(BABYLON.Vector3.Zero());
    camera2a.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    // 若干中心に傾けるquat
    let cam2quat0 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.02);
    let cam2quat1 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.01);
    let cam2quat2 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.008);
    let cam2quat4 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.006);
    let cam2quat5 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.0025);
    let cam2quat6 = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -0.0001);
    const ip2LQ = {0:[5, cam2quat0],  // 水星
                   1:[10, cam2quat1], // 金星
                   2:[15, cam2quat2], // 地球
                   3:[15, cam2quat2], // 月
                   4:[15, cam2quat4], // 火星
                   5:[40, cam2quat5], // 木星
                   6:[10, cam2quat6], // 彗星
                   7:[10, cam2quat6], // 彗星(2)
                   }
    let [cam2aL, cam2quat] = ip2LQ[iplanet];

    // カメラ(サブ２  .. 惑星視点
    const camera2b = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera2b.rotationOffset = 180;
    camera2b.radius = 1;
    camera2b.heightOffset = 0.1;
    camera2b.cameraAcceleration = 0.2;
    camera2b.maxCameraSpeed = 10;
    camera2b.attachControl(canvas, true);
    camera2b.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    scene.activeCameras.push(camera);
    camera.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
    camera2a.viewport = new BABYLON.Viewport(0.0, 0.5, 0.5, 0.5); // 左上
    camera2b.viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5); // 右上

    // Lightning
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    var light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -1, 0), scene);
    light2.intensity = 0.2;


    // 地面／水平面を設定する
    const grndMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 400, height: 400 }, scene);
    grndMesh.position.y = -0.5;
    grndMesh.material = new BABYLON.StandardMaterial("grnd");
    grndMesh.material.alpha = 0.3;
    // 地面に摩擦係数、反射係数を設定する
    var grndAgg = new BABYLON.PhysicsAggregate(grndMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01, friction:0.0001}, scene);

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

    // let istage = 7, nstage = 8;
    planetMesh = [];
    {
        for (let [mesh,agg] of meshPhys) {
            agg.dispose();
            mesh.dispose();
        }
        meshPhys = [];
        trgPhysList = [];
        {
            let meshSun, aggSun, meshPlanet, aggPlanet, meshEarth, aggEarth;

            // 0:水星
            opt = {adjx:0, adjz:0,
                   txt:txt_mercury, col:[0,1,1],
                   diam:1, px:2, mass:10,
                   minDist:2, maxDist:3, motorTrg:10, motorMFo:100, appImp:1000};
            [meshSun, aggSun, meshPlanet, aggPlanet] = springEx1_a3(scene, opt);
            planetMesh.push(meshPlanet);
            opt2 = {py:0.5, life:0.2};
            addBubble(meshPlanet, opt2);

            // 1:金星
            opt = {adjx:0, adjz:0,
                   txt:txt_moon, col:[1, 0.9, 0.0],
                   diam:2, px:-5, mass:50,
                   minDist:4, maxDist:5, motorTrg:5, motorMFo:50, appImp:-1000};
            [meshSun, aggSun, meshPlanet, aggPlanet] = springEx1_a3(scene, opt);
            planetMesh.push(meshPlanet);
            opt2 = {py:1, life:0.5};
            addBubble(meshPlanet, opt2);

            // 2:地球
            opt = {adjx:0, adjz:0,
                   txt:txt_earth,
                   diam:3, px:15, mass:100,
                   minDist:15, maxDist:18, motorTrg:2, motorMFo:10, appImp:1000};
            [meshSun, aggSun, meshEarth, aggEarth] = springEx1_a3(scene, opt);
            planetMesh.push(meshEarth);
            opt2 = {py:1.5, life:1.5};
            addBubble(meshEarth, opt2);

            // 3:月
            opt = {adjx:0, adjz:0,
                   txt:txt_moon,
                   diam:0.8, px:15+1, mass:1,
                   minDist:1, maxDist:2.5, motorTrg:0.1, motorMFo:5, appImp:+100,
                   sp1:meshEarth, agg1:aggEarth};
            [meshSun, aggSun, meshPlanet, aggPlanet] = springEx1_a3(scene, opt);
            planetMesh.push(meshPlanet);
            opt2 = {py:0.4, life:0.2};
            addBubble(meshPlanet, opt2);

            // 4:火星
            opt = {adjx:0, adjz:0,
                   txt:txt_mercury, col:[1,0,0],
                   diam:3.5, px:20, mass:120,
                   minDist:23, maxDist:25, motorTrg:1, motorMFo:10, appImp:1000};
            [meshSun, aggSun, meshPlanet, aggPlanet] = springEx1_a3(scene, opt);
            planetMesh.push(meshPlanet);
            opt2 = {py:1.8, life:2};
            addBubble(meshPlanet, opt2);


            // 5:木星
            opt = {adjx:0, adjz:0,
                   txt:txt_jupiter,
                   diam:10, px:40, mass:200,
                   minDist:40, maxDist:42, motorTrg:10, motorMFo:50, appImp:1000};
            [meshSun, aggSun, meshPlanet, aggPlanet] = springEx1_a3(scene, opt);
            planetMesh.push(meshPlanet);
            opt2 = {py:5, life:5};
            addBubble(meshPlanet, opt2);


            // 6:彗星
            opt = {adjx:0, adjz:0,
                   txt:txt_comet1, col:[1,1,1],
                   diam:0.4, px:60, mass:5,
                   minDist:1, maxDist:3, stiff:3, damping:0,
                   motorTrg:1, motorMFo:10, appImp:10};
            [meshSun, aggSun, meshPlanet, aggPlanet] = springEx1_a3(scene, opt);
            planetMesh.push(meshPlanet);
            opt2 = {py:0.2, life:2};
            addBubble(meshPlanet, opt2);

            // 7:彗星(2)
            opt = {adjx:0, adjz:0,
                   txt:txt_comet2, col:[1,1,1],
                   diam:0.6, px:65, mass:3,
                   minDist:1, maxDist:2, stiff:1, damping:0,
                   motorTrg:1, motorMFo:5, appImp:10};
            [meshSun, aggSun, meshPlanet, aggPlanet] = springEx1_a3(scene, opt);
            planetMesh.push(meshPlanet);
            opt2 = {py:0.3, life:2};
            addBubble(meshPlanet, opt2);

        }

    }

    BABYLON.ParticleHelper.CreateAsync("sun", scene).then((set) => {
        set.systems[0].blendMode = BABYLON.ParticleSystem.BLENDMODE_MULTIPLYADD;
         set.start();
    });

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


    scene.onBeforeRenderObservable.add((scene) => {
        // カメラ2a用の更新
        if (camera2type > 0) {
            let trgMesh = planetMesh[iplanet];
            let vdir2 = camera2a.position.subtract(trgMesh.position).normalize().scale(cam2aL);
            vdir2 = vdir2.applyRotationQuaternion(cam2quat);
            vdir2.y = 1;
            camera2a.position = trgMesh.position.add(vdir2);
        }
    });


    // 画面クリック時：惑星に力を加える
    function InitClickForces() {
        scene.onPointerPick = (event, pickInfo) => {
            for (let aggPhys of trgPhysList) {
                aggPhys.body.applyImpulse(
                    scene.activeCamera.getDirection(BABYLON.Vector3.Forward()).scale(1),
                    pickInfo.pickedPoint
                );
            }
        }
    }
    InitClickForces();

    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ' || kbInfo.event.key == 'v') {
                {
                    // cooltime_act = cooltime_actIni;
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
                        scene.activeCameras.push(camera2b);
                        camera.viewport = new BABYLON.Viewport(0, 0, 1.0, 0.5);
                        camera2a.viewport = new BABYLON.Viewport(0.0, 0.5, 0.5, 0.5); // 左上
                        camera2b.viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5); // 右上
                        camera2a.lockedTarget = planetMesh[iplanet];
                        camera2b.lockedTarget = planetMesh[iplanet];
                    }
                }
            }
            if (kbInfo.event.key == 'Enter' || kbInfo.event.key == 'n') {
                // 次の惑星
                iplanet = (iplanet+1) % planetMesh.length;
                [cam2aL, cam2quat] = ip2LQ[iplanet];
                camera2a.lockedTarget = planetMesh[iplanet];
                camera2b.lockedTarget = planetMesh[iplanet];

            } else if (kbInfo.event.key == 'b' || kbInfo.event.key == 'p') {
                // １つ前の惑星
                iplanet = (iplanet+planetMesh.length-1) % planetMesh.length;
                [cam2aL, cam2quat] = ip2LQ[iplanet];
                camera2a.lockedTarget = planetMesh[iplanet];
                camera2b.lockedTarget = planetMesh[iplanet];

            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            break;
        }
    });

    return scene;
};

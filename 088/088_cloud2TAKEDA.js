// 国土地理院、全国Q地図
// 竹田城
// https://maps.qchizu.xyz/#15/35.300/134.829/&base=ort&ls=ort&disp=1&vs=c1g1j0h0k0l0u0t0z0r0s0m0f1&d=m
// の3Dオブジェクトに雲（雲海）を追加してみる

const R90 = Math.PI/2;
const R180 = Math.PI;

const txt_tail_bubble = "textures/cloud.png";

var createScene = async function () {
    await BABYLON.InitializeCSG2Async();

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(65, 15,30), scene);
    camera.setTarget(new BABYLON.Vector3(60, 10, 50));
    camera.attachControl(canvas, true);

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);


    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // --------------------------------------------------
    if (1) {
        let files = [
            //"./3d/jpCastle1TAKEDA/dem.obj",
            "https://raw.githubusercontent.com/fnamuoo/webgl/main/088/3d/jpCastle1TAKEDA/dem.obj",
        ];
        for (let file of files) {
            BABYLON.ImportMeshAsync(file, scene).then((result) => {
                let meshGeo = result.meshes[0];
                let s = 2;
                meshGeo.scaling = new BABYLON.Vector3(s, s, s);
                meshGeo.position = new BABYLON.Vector3(100*s, -6.6*s, 100*s);
                meshGeo.rotation = new BABYLON.Vector3(0, R180, 0);
                let aggGeo = new BABYLON.PhysicsAggregate(meshGeo, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
            })
        }
    }

    // --------------------------------------------------

    let meshAggInfo = []; // mesh, agg;

    // --------------------------------------------------

    let grndMesh = BABYLON.MeshBuilder.CreateGround("ground", {width:200, height:200}, scene);
    grndMesh.material = new BABYLON.GridMaterial("", scene);
    grndMesh.material.majorUnitFrequency = 10;
    grndMesh.material.minorUnitVisibility  = 0.7;
    // 地面に摩擦係数、反射係数を設定する
    let grndAgg = new BABYLON.PhysicsAggregate(grndMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);
    meshAggInfo.push([grndMesh,grndAgg]);

    // --------------------------------------------------
    function addBubble(mesh, opt={}) {
        // 軌跡
        let rngxmin = typeof(opt.rngxmin) !== 'undefined' ? opt.rngxmin : -0.1;
        let rngxmax = typeof(opt.rngxmax) !== 'undefined' ? opt.rngxmax : 0.1;
        let rngzmin = typeof(opt.rngzmin) !== 'undefined' ? opt.rngzmin : -100;
        let rngzmax = typeof(opt.rngzmax) !== 'undefined' ? opt.rngzmax : 200;
        let py = typeof(opt.py) !== 'undefined' ? opt.py : 10;
        let emitRate = typeof(opt.emitRate) !== 'undefined' ? opt.emitRate : 1000;
        let direction1 = typeof(opt.direction1) !== 'undefined' ? opt.direction1 : new BABYLON.Vector3(3, 0, -0.1);
        let direction2 = typeof(opt.direction2) !== 'undefined' ? opt.direction2 : new BABYLON.Vector3(5, 0, -0.1);
        let life = typeof(opt.life) !== 'undefined' ? opt.life : 10;
        let npart = typeof(opt.npart) !== 'undefined' ? opt.npart : 200000;
        let particleSystem = new BABYLON.ParticleSystem("particles", npart);
        particleSystem.particleTexture = new BABYLON.Texture(txt_tail_bubble);
        particleSystem.emitter = mesh;
        particleSystem.minEmitBox = new BABYLON.Vector3(rngxmin, py, rngzmin);
        particleSystem.maxEmitBox = new BABYLON.Vector3(rngxmax, py, rngzmax);
        particleSystem.minScaleX = 0.7;
        particleSystem.maxScaleX = 0.7;
        particleSystem.minScaleY = 1.0;
        particleSystem.maxScaleY = 1.0;
        particleSystem.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0.0, 0.0, 0.0, 0.0);
        particleSystem.emitRate = emitRate;
        particleSystem.direction1 = direction1;
        particleSystem.direction2 = direction2;
        particleSystem.updateSpeed = 0.002;
        particleSystem.minLifeTime = life*0.8;
        particleSystem.maxLifeTime = life;
        particleSystem.start();
        return particleSystem;
    }

    // for TAKEDA
    let rad1 = Math.PI*70/180, rad2 = Math.PI*50/180;
    let opt2 = {rngxmin:-50, rngxmax:+20, py:7, rngzmin:-100, rngzmax:-60, emitRate:2000,
                direction1: new BABYLON.Vector3(6*Math.cos(rad1), 0, 6*Math.sin(rad1)),
                direction2: new BABYLON.Vector3(6*Math.cos(rad2), 0, 6*Math.sin(rad2)),
                life: 110, npart:2000000};
    addBubble(grndMesh, opt2);

    return scene;
}



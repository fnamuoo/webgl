// Babylon.js で物理演算(havok)：BallAndSocketで風鈴(2)

// for local
const skyboxTexturePath = "../069/textures/TropicalSunnyDay";
// for PlayGround
// const skyboxTexturePath = "textures/TropicalSunnyDay";

var physicsViewer = null;
let dynamicObjectPhysicsBody;
let trgPhysList = [];
let meshPhys = [];

const R0 = 0;
const R90 = Math.PI/2;
const R180 = Math.PI;

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

var ballAndSocket_B1 = function (scene, opt={}) {
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let anc = BABYLON.MeshBuilder.CreateSphere("anchor", { diameter: 1, segments: 8 }, scene);
    anc.position.set(adjx, 1+adjy, adjz);
    let c = setAutoMat(anc);
    anc.material.alpha = 0.7;
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 2, height: 0.2, depth: 0.02 }, scene);
    box2.position.set(adjx, -1+adjy, -1+adjz);
    setAutoMat(box2, c);

    let agg1 = new BABYLON.PhysicsAggregate(anc, BABYLON.PhysicsShapeType.SPHERE, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    let joint = new BABYLON.BallAndSocketConstraint(
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(1, 0, 0),
        new BABYLON.Vector3(0, 1, 0),
        new BABYLON.Vector3(0, 1, 0),
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([anc, agg1]);
    meshPhys.push([box2, agg2]);
};

var ballAndSocket_B2 = function (scene, opt={}) {
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let anc = BABYLON.MeshBuilder.CreateSphere("anchor", { diameter: 1, segments: 8 }, scene);
    anc.position.set(adjx, 1+adjy, adjz);
    let c = setAutoMat(anc);
    anc.material.alpha = 0.7;
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 2, height: 0.2, depth: 0.02 }, scene);
    box2.position.set(adjx, -1+adjy, -1+adjz);
    setAutoMat(box2, c);

    let agg1 = new BABYLON.PhysicsAggregate(anc, BABYLON.PhysicsShapeType.SPHERE, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    const joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, 0, 0),
          pivotB: new BABYLON.Vector3(1, 0, 0),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, }, // 長軸の回転制限
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },// 回転角の制限
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R180, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([anc, agg1]);
    meshPhys.push([box2, agg2]);
};

var ballAndSocket_B3 = function (scene, opt={}) {
    // 直観的には、こちら（長軸をY軸）が率直なきがするが、長軸の回転が抑えられている感じがある
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let anc = BABYLON.MeshBuilder.CreateSphere("anchor", { diameter: 1, segments: 8 }, scene);
    anc.position.set(adjx, 1+adjy, adjz);
    let c = setAutoMat(anc);
    anc.material.alpha = 0.7;
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 2, height: 0.2, depth: 0.02 }, scene);
    box2.position.set(adjx, -1+adjy, -1+adjz);
    setAutoMat(box2, c);

    let agg1 = new BABYLON.PhysicsAggregate(anc, BABYLON.PhysicsShapeType.SPHERE, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    const joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, 0, 0),
          pivotB: new BABYLON.Vector3(1, 0, 0),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: -R90, maxLimit: R90, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: -R90, maxLimit: R90, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([anc, agg1]);
    meshPhys.push([box2, agg2]);
};



var ballAndSocket_C2 = function (scene, opt={}) {
    // 南半球に動きを制限
    // - １つの軸の制限だけで
    // 自然な振り子な感じ？
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let anc = BABYLON.MeshBuilder.CreateSphere("anchor", { diameter: 1, segments: 8 }, scene);
    anc.position.set(adjx, 1+adjy, adjz);
    let c = setAutoMat(anc);
    anc.material.alpha = 0.7;
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 2, height: 0.2, depth: 0.02 }, scene);
    box2.position.set(adjx, -1+adjy, -1+adjz);
    setAutoMat(box2, c);

    let agg1 = new BABYLON.PhysicsAggregate(anc, BABYLON.PhysicsShapeType.SPHERE, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    const joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, 0, 0),
          pivotB: new BABYLON.Vector3(1, 0, 0),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, }, // 長軸の回転制限
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },// 回転角の制限
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R180, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([anc, agg1]);
    meshPhys.push([box2, agg2]);
};


var ballAndSocket_C3 = function (scene, opt={}) {
    // 南半球に動きを制限
    // - ２つの軸の制限が必要
    // 直観的には、こちら（長軸をY軸）が率直なきがするが、長軸の回転が抑えられている感じがある
    // 回転が抑えられる分、強制的な動き、跳ねる感じがある
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let anc = BABYLON.MeshBuilder.CreateSphere("anchor", { diameter: 1, segments: 8 }, scene);
    anc.position.set(adjx, 1+adjy, adjz);
    let c = setAutoMat(anc);
    anc.material.alpha = 0.7;
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 2, height: 0.2, depth: 0.02 }, scene);
    box2.position.set(adjx, -1+adjy, -1+adjz);
    setAutoMat(box2, c);

    let agg1 = new BABYLON.PhysicsAggregate(anc, BABYLON.PhysicsShapeType.SPHERE, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    const joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, 0, 0),
          pivotB: new BABYLON.Vector3(1, 0, 0),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: -R90, maxLimit: R90, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: -R90, maxLimit: R90, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([anc, agg1]);
    meshPhys.push([box2, agg2]);
};

// ----------------------------------------

var ballAndSocket_D2 = function (scene, opt={}) {
    // .. モーター回転で、振れ幅が小さくなったときに、長軸で回転が始まる？
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let anc = BABYLON.MeshBuilder.CreateSphere("anchor", { diameter: 1, segments: 8 }, scene);
    anc.position.set(adjx, 1+adjy, adjz);
    let c = setAutoMat(anc);
    anc.material.alpha = 0.7;
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 2, height: 0.2, depth: 0.02 }, scene);
    box2.position.set(adjx, -1+adjy, -1+adjz);
    setAutoMat(box2, c);

    let agg1 = new BABYLON.PhysicsAggregate(anc, BABYLON.PhysicsShapeType.SPHERE, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    const joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, 0, 0),
          pivotB: new BABYLON.Vector3(-1, 0, 0),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: R0, maxLimit: R0, }, // 長軸の回転制限
//         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },// 回転角の制限
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: R0, maxLimit: R180, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    joint.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_X,
                           BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, 1);
    joint.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_X, 5);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([anc, agg1]);
    meshPhys.push([box2, agg2]);
};

var ballAndSocket_D3 = function (scene, opt={}) {
    // 直観的には、こちら（長軸をY軸）が率直なきがするが、長軸の回転が抑えられている感じがある
    // 回転が抑えられる分、強制的な動き、跳ねる感じがある
    // .. モーター回転で、振り子のようにまわってる
    let adjx = typeof(opt.adjx) !== 'undefined' ? opt.adjx : 0;
    let adjy = typeof(opt.adjy) !== 'undefined' ? opt.adjy : 0;
    let adjz = typeof(opt.adjz) !== 'undefined' ? opt.adjz : 0;

    let anc = BABYLON.MeshBuilder.CreateSphere("anchor", { diameter: 1, segments: 8 }, scene);
    anc.position.set(adjx, 1+adjy, adjz);
    let c = setAutoMat(anc);
    anc.material.alpha = 0.7;
    let box2 = BABYLON.MeshBuilder.CreateBox("m", { width: 2, height: 0.2, depth: 0.02 }, scene);
    box2.position.set(adjx, -1+adjy, -1+adjz);
    setAutoMat(box2, c);

    let agg1 = new BABYLON.PhysicsAggregate(anc, BABYLON.PhysicsShapeType.SPHERE, { mass: 0, restitution: 1 }, scene);
    let agg2 = new BABYLON.PhysicsAggregate(box2, BABYLON.PhysicsShapeType.BOX, { mass: 1, restitution: 1 }, scene);

    const joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, 0, 0),
          pivotB: new BABYLON.Vector3(-1, 0, 0),
        },
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit: 0, maxLimit: 0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit: -R90, maxLimit: R90, },
         // { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit: R0, maxLimit: R0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit: -R90, maxLimit: R90, },
        ],
        scene
    );

    agg1.body.addConstraint(agg2.body, joint);

    joint.setAxisMotorType(BABYLON.PhysicsConstraintAxis.ANGULAR_Y,
                           BABYLON.PhysicsConstraintMotorType.VELOCITY);
    joint.setAxisMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 1);
    joint.setAxisMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 5);

    if (physicsViewer != null) {physicsViewer.showConstraint(joint);}
    trgPhysList.push(agg2);
    meshPhys.push([anc, agg1]);
    meshPhys.push([box2, agg2]);
};




// --------------------------------------------------
// ------------------------------

var createScene = function () {
    // Scene
    var scene = new BABYLON.Scene(engine);

//    let useViewer = true;
    let useViewer = false;

    var plugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), plugin);

    if (useViewer) {
        physicsViewer = new BABYLON.PhysicsViewer();
    }

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(1, -0.5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
//    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする

    // Lightning
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    var light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -1, 0), scene);
    light2.intensity = 0.2;


    {
        let pad = 3, nx = 10, nz = 20, nx_=nx/2, nz_=nz/2;
        let px, pz, opt={}, ii, itype;
        const typelist = [0, 0, 0, 1, 1, 2, 2, 3, 4];
        const ntype = typelist.length;
        for (let iz = 0; iz < nz; ++iz) {
            opt.adjz = iz*pad;
            for (let ix = -nx_; ix < nx; ++ix) {
                opt.adjx = ix*pad;
                ii = Math.floor(Math.random() * ntype);
                itype = typelist[ii];
                if (itype == 0) {
                    ballAndSocket_B1(scene, opt);
                } else if (itype == 1) {
                    ballAndSocket_C2(scene, opt);
                } else if (itype == 2) {
                    ballAndSocket_C3(scene, opt);
                } else if (itype == 3) {
                    ballAndSocket_D2(scene, opt);
                } else if (itype == 4) {
                    ballAndSocket_D3(scene, opt);
                }
            }
        }
    }

    if (1) {
    // Skybox
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTexturePath, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    }


    function InitClickForces() {
        scene.onPointerPick = (event, pickInfo) => {
            for (let aggPhys of trgPhysList) {
                aggPhys.body.applyImpulse(
                    scene.activeCamera.getDirection(BABYLON.Vector3.Forward()).scale(10),
                    pickInfo.pickedPoint
                );
            }
        }
    }
    InitClickForces();

    return scene;
};


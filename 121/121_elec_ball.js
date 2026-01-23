//  Babylon.js で物理演算(havok)：電化をもったボールを転がす

// stage 0：対称に +/- を配置
// stage 1：対称に -/- を配置
// stage 2：非対称に +/- を配置
// stage 3：非対称に -/- を配置

// 操作
//  [space/enter] .. stageの変更


const R30 = Math.PI/6;
const R45 = Math.PI/4;
// const R90 = Math.PI/2;
// const R180 = Math.PI;

// ストロボ（残像）表示
const STROBO = true;
// const STROBO = false;


// const fpathMoon = "textures/Moon_texture.jpg";

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 100, 0), scene);
    light.intensity = 0.6;


    // let pCam = new BABYLON.Vector3(0, 20, -1);
    let pCam = new BABYLON.Vector3(0, 40, -1);
    var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, pCam, scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);

    const hk = new BABYLON.HavokPlugin(false);
    // scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);
    let ag = -9.8;
    scene.enablePhysics(new BABYLON.Vector3(0, ag*Math.cos(R30), ag*Math.sin(R30)), hk);

    // ----------------------------------------
    let mesh1=null, mesh2=null, meshcp1=null, meshcp2=null;
    let meshInfo = []; // mesh
    let istage = 0, nstage = 4;
    let iloop = -1, iiloop = -1, iloopstep = 20;
    var createStage = function(istage) {
        console.log("istage=",istage);
        mesh1=null, mesh2=null, meshcp1=null, meshcp2=null;
        for (let mesh of meshInfo) {
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            mesh.dispose();
        }
        meshInfo = [];

        // ブロックの配置
        let createBlock = function(x, y, z, roty) {
            let mesh = BABYLON.MeshBuilder.CreateBox("", { width:3, height:1, depth:1 }, scene);
            mesh.position.set(x, y, z);
            mesh.rotation.y = roty;
            let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.001, restitution:0.01}, scene);
            mesh._agg = agg;
            meshInfo.push(mesh)
        }
        
        // 地面
        {
            let grndW=100, grndH=100;
            let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
            meshGrnd.material = new BABYLON.GridMaterial("groundMaterial", scene);
            meshGrnd.material.majorUnitFrequency = 100; 
            meshGrnd.material.minorUnitVisibility  = 0.2;
            let aggGrnd = new BABYLON.PhysicsAggregate(meshGrnd, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.001, restitution:0.01}, scene);
            meshGrnd._agg = aggGrnd;
            meshInfo.push(meshGrnd)
        }

        if (istage == 0) {
            createBlock(-5, 0.5, 0, R45);
            createBlock(5, 0.5, 0, -R45);
            {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                mesh.material = new BABYLON.StandardMaterial("mat");
                mesh.position.set(-5,4,5);
                mesh.material.emissiveColor = BABYLON.Color3.Blue();
                mesh._q = -1;
                if (STROBO) {
                    meshcp1 = mesh.clone();
                    meshcp1.position.copyFrom(mesh.position);
                    meshInfo.push(meshcp1)
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, friction: 0.001, restitution:0.01}, scene);
                mesh._agg = agg;
                meshInfo.push(mesh)
                mesh1 = mesh;
            }
            {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                mesh.material = new BABYLON.StandardMaterial("mat");
                mesh.position.set(5,4,5);
                mesh.material.emissiveColor = BABYLON.Color3.Red();
                mesh._q = 1;
                if (STROBO) {
                    meshcp2 = mesh.clone();
                    meshcp2.position.copyFrom(mesh.position);
                    meshInfo.push(meshcp2)
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, friction: 0.001, restitution:0.01}, scene);
                mesh._agg = agg;
                meshInfo.push(mesh);
                mesh2 = mesh;
            }

        } else if (istage == 1) {
            createBlock(-5, 0.5, 0, R45);
            createBlock(5, 0.5, 0, -R45);
            {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                mesh.material = new BABYLON.StandardMaterial("mat");
                mesh.position.set(-5,4,5);
                mesh.material.emissiveColor = BABYLON.Color3.Blue();
                mesh._q = -1;
                if (STROBO) {
                    meshcp1 = mesh.clone();
                    meshcp1.position.copyFrom(mesh.position);
                    meshInfo.push(meshcp1)
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, friction: 0.001, restitution:0.01}, scene);
                mesh._agg = agg;
                meshInfo.push(mesh)
                mesh1 = mesh;
            }
            {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                mesh.material = new BABYLON.StandardMaterial("mat");
                mesh.position.set(5,4,5);
                mesh.material.emissiveColor = BABYLON.Color3.Blue();
                mesh._q = -1;
                if (STROBO) {
                    meshcp2 = mesh.clone();
                    meshcp2.position.copyFrom(mesh.position);
                    meshInfo.push(meshcp2)
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, friction: 0.001, restitution:0.01}, scene);
                mesh._agg = agg;
                meshInfo.push(mesh);
                mesh2 = mesh;
            }

        } else if (istage == 2) {
            createBlock(-5, 0.5, 0, R45);
            createBlock(5, 0.5, 0, -R30);
            {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                mesh.material = new BABYLON.StandardMaterial("mat");
                mesh.position.set(-5,4,5);
                mesh.material.emissiveColor = BABYLON.Color3.Blue();
                mesh._q = -1.55;
                if (STROBO) {
                    meshcp1 = mesh.clone();
                    meshcp1.position.copyFrom(mesh.position);
                    meshInfo.push(meshcp1)
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, friction: 0.001, restitution:0.01}, scene);
                mesh._agg = agg;
                meshInfo.push(mesh)
                mesh1 = mesh;
            }
            {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                mesh.material = new BABYLON.StandardMaterial("mat");
                mesh.position.set(5,4,5);
                mesh.material.emissiveColor = BABYLON.Color3.Red();
                mesh._q = 1.55;
                if (STROBO) {
                    meshcp2 = mesh.clone();
                    meshcp2.position.copyFrom(mesh.position);
                    meshInfo.push(meshcp2)
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, friction: 0.001, restitution:0.01}, scene);
                mesh._agg = agg;
                meshInfo.push(mesh);
                mesh2 = mesh;
            }

        } else if (istage == 3) {
            createBlock(-5, 0.5, 0, R45);
            createBlock(5, 0.5, 0, -R30);
            let q=1.15;
            {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                mesh.material = new BABYLON.StandardMaterial("mat");
                mesh.position.set(-4,3,8);
                mesh.material.emissiveColor = BABYLON.Color3.Blue();
                mesh._q = -q;
                if (STROBO) {
                    meshcp1 = mesh.clone();
                    meshcp1.position.copyFrom(mesh.position);
                    meshInfo.push(meshcp1)
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, friction: 0.001, restitution:0.01}, scene);
                mesh._agg = agg;
                meshInfo.push(mesh)
                mesh1 = mesh;
            }
            {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                mesh.material = new BABYLON.StandardMaterial("mat");
                mesh.position.set(4,3,8);
                mesh.material.emissiveColor = BABYLON.Color3.Blue();
                mesh._q = -q;
                if (STROBO) {
                    meshcp2 = mesh.clone();
                    meshcp2.position.copyFrom(mesh.position);
                    meshInfo.push(meshcp2)
                }
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, friction: 0.001, restitution:0.01}, scene);
                mesh._agg = agg;
                meshInfo.push(mesh);
                mesh2 = mesh;
            }

        }
        iloop = 0;
        iiloop = 0;
    }

    const k = 0.5;
    scene.onBeforeRenderObservable.add((scene) => {
        if (iloop >= 0) {
            if (++iloop > iloopstep) {
                iloop = 0;
                ++iiloop;
                if (STROBO) {
                    // mesh1の残像
                    let mesh = meshcp1.clone();
                    mesh.position.copyFrom(mesh1.position)
                    meshInfo.push(mesh);
                    // mesh2の残像
                    mesh = meshcp2.clone();
                    mesh.position.copyFrom(mesh2.position)
                    meshInfo.push(mesh);
                }
                if (iiloop > 100) {
                    // 更新をスキップ／停止させる
                    iloop = -1;
                }
            }
            let v12 = mesh2.position.subtract(mesh1.position);
            let distsq = v12.lengthSquared();
            let v12n = v12.normalize();
            // クーロン力
            let f = k * mesh1._q * mesh2._q / distsq;
            mesh1._agg.body.applyImpulse(v12n.scale(-f), mesh1.absolutePosition);
            mesh2._agg.body.applyImpulse(v12n.scale(f), mesh2.absolutePosition);
        }
    });

    // Input to direction
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ') {
                istage = (istage+1) % nstage;
                createStage(istage);

            } else if (kbInfo.event.key == 'Enter') {
                istage = (istage+nstage-1) % nstage;
                createStage(istage);
            }
        }
    });

    // ----------------------------------------

    istage = 0;
    createStage(istage);

    return scene;
};

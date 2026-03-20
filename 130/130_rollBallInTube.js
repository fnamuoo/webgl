// チューブ内でボールを転がすテスト

const R180 = Math.PI;

export var createScene_tube1 = async function () {
    // 漏斗
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 100, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));


    let plist = [];
    for (let i = 0; i < 20; ++i) {
        plist.push(new BABYLON.Vector3(i, 0, 0 ))
    }
    const radiusChange = (index, distance) => {
        const radius =  (index <5 ) ? 2 : distance / 2;
        return radius;
    };
    const mesh = BABYLON.MeshBuilder.CreateTube("tube", {path: plist, radiusFunction: radiusChange, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
    mesh.rotation = new BABYLON.Vector3(0, 0,Math.PI/2);
    mesh.material = new BABYLON.StandardMaterial("");
    mesh.material.diffuseColor = BABYLON.Color3.Gray();
    mesh.material.wireframe=1;

    return scene;
}


export var createScene_tube3 = async function () {
    // 漏斗＋らせん
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 100, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));


    let plist = [], r=0, rad=0, rstep=Math.PI/10, y=0, z=0, PI2 = Math.PI*2;
    for (let i = 0; i < 50; ++i) {
        if (i < 40) {
            y = r*Math.sin(rad);
            z = r*Math.cos(rad);
            rad += rstep;
            if (rad > PI2) rad -= PI2;
            r += 0.2;
            plist.push(new BABYLON.Vector3(i*0.2, y, z ))
        } else {
            plist.push(new BABYLON.Vector3(i*0.3, y, z ))
        }
    }
    const radiusChange = (index, distance) => {
        const radius =  (index <38 ) ? 2 : (index <45 ) ? 2+(index-38)*0.5 : 5.5+(index-45)*0.3;
        return radius;
    };
    const mesh = BABYLON.MeshBuilder.CreateTube("tube", {path: plist, radiusFunction: radiusChange, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
    mesh.rotation = new BABYLON.Vector3(0, 0,Math.PI/2);
    mesh.material = new BABYLON.StandardMaterial("");
    mesh.material.diffuseColor = BABYLON.Color3.Gray();
    mesh.material.wireframe=1;

    return scene;
}


export var createScene_FalBall = async function () {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 100, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    let pSrc, ymin;
    
    {
        let grndW=20, grndH=20;
        let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        meshGrnd.material = new BABYLON.GridMaterial("groundMaterial", scene);
        meshGrnd.material.majorUnitFrequency = 1; 
        meshGrnd.material.minorUnitVisibility  = 0.2;
    }

    let createMesh = function() {
        let mesh = null;
        if (1) {
            // 漏斗＋らせん
            pSrc = new BABYLON.Vector3(3,20,10), ymin=-20;
            let plist = [], r=0, rad=0, rstep=Math.PI/10, y=0, z=0, PI2 = Math.PI*2;
            for (let i = 0; i < 50; ++i) {
                if (i < 40) {
                    y = r*Math.sin(rad);
                    z = r*Math.cos(rad);
                    rad += rstep;
                    if (rad > PI2) rad -= PI2;
                    r += 0.2;
                    plist.push(new BABYLON.Vector3(i*0.2, y, z ))
                } else {
                    plist.push(new BABYLON.Vector3(i*0.3, y, z ))
                }
            }
            const radiusChange = (index, distance) => {
                const radius =  (index <38 ) ? 2 : (index <45 ) ? 2+(index-38)*0.5 : 5.5+(index-45)*0.3;
                return radius;
            };
            mesh = BABYLON.MeshBuilder.CreateTube("tube", {path: plist, radiusFunction: radiusChange, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh.rotation = new BABYLON.Vector3(0, 0,Math.PI/2);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Gray();
            mesh.material.wireframe=1;
        }
        return mesh;
    }

    let mesh = createMesh();
    let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, friction: 0.01, restitution:0.01}, scene);
    mesh._agg = agg;

    // 永遠にボールを落とす
    let balls = [];
    let nBall = 300, popCool=0, popCoolDef=10;
    let popBall = function() {
        let mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
        mesh.position.copyFrom(pSrc);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.1, restitution:0.1}, scene);
        mesh.physicsBody.disablePreStep = false;
        balls.push(mesh);
    }
    let resetPosiBall = function(mesh) {
        mesh.position.copyFrom(pSrc);
        mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
    }

    scene.onBeforeRenderObservable.add(() => {
        if (balls.length < nBall) {
            if (popCool > 0) {
                popCool = popCool-1;
            } else {
                popCool = popCoolDef;
                popBall();
            }
        }
        balls.forEach((mesh) => {
            if (mesh.position.y < ymin) {
                resetPosiBall(mesh);
            }
        })
    })

    return scene;
}


export var createScene_RunBall1 = async function () {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 100, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    let pSrc, ymin;
    
    {
        let grndW=20, grndH=20;
        let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        // meshGrnd.position.y += -0.01;
        meshGrnd.material = new BABYLON.GridMaterial("groundMaterial", scene);
        meshGrnd.material.majorUnitFrequency = 1; 
        meshGrnd.material.minorUnitVisibility  = 0.2;
    }

    let createMesh = function() {
        let mesh = null;
        if (1) {
            // トラック
            pSrc = new BABYLON.Vector3(2,1,0), ymin=-20;
            let plist = [];
            for (let ix=0; ix < 10; ix+=2) {
                plist.push(new BABYLON.Vector3(ix, 1, 0 ));
            }
            let r=10, nr = 20;
            let rstep = R180/nr;
            for (let irad=0; irad < nr; ++irad) {
                let rad = irad*rstep;
                let x = 10+r*Math.sin(rad);
                let z = r*(1-Math.cos(rad));
                plist.push(new BABYLON.Vector3(x, 1, z));
            }
            for (let ix=0; ix < 10; ix+=2) {
                plist.push(new BABYLON.Vector3(10-ix, 1, 20 ));
            }
            for (let irad=0; irad < nr; ++irad) {
                let rad = irad*rstep;
                let x = -r*Math.sin(rad);
                let z = r*(1+Math.cos(rad));
                plist.push(new BABYLON.Vector3(x, 1, z));
            }
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 10, true);//closed
            const plist3 = catmullRom.getPoints();
            mesh = BABYLON.MeshBuilder.CreateTube("tube", {path: plist3, radius:1.2, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Gray();
            mesh.material.wireframe=1;
            mesh.material.alpha=0.02;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, friction: 0.01, restitution:0.01}, scene);
            // 加速器
            let meshAcc = BABYLON.MeshBuilder.CreateBox("anc", {width:3, height:3, depth:3});
            meshAcc.position.copyFrom(pSrc);
            meshAcc.material = new BABYLON.StandardMaterial("");
            meshAcc.material.diffuseColor = BABYLON.Color3.Red();
            meshAcc.material.wireframe=1;

            scene.registerAfterRender(function() {
                // 自機とチェックポイントの交差チェック
                const vdir = new BABYLON.Vector3(1, 0, 0);
                balls.forEach((mesh) => {
                    if (mesh.intersectsMesh(meshAcc, true)) {
                        mesh._agg.body.applyImpulse(vdir, mesh.absolutePosition);
                    }
                });
            });

        }
        return mesh;
    }

    let mesh = createMesh();

    // 永遠にボールを落とす
    let balls=[], pool=[];
    let nBall = 4, popCool=0, popCoolDef=20;
    let popBall = function() {
        let mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1.995 }, scene);
        mesh.position.copyFrom(pSrc);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.1, restitution:0.1}, scene);
        mesh.physicsBody.disablePreStep = false;
        mesh._valid=1;
        balls.push(mesh);
    }
    let resetPosiBall = function(mesh) {
        mesh.position.copyFrom(pSrc);
        mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
    }

    scene.onBeforeRenderObservable.add(() => {
        {
            if (popCool > 0) {
                popCool = popCool-1;
            } else {
                popCool = popCoolDef;
                if (pool.length > 0) {
                    let mesh = pool.shift();
                    mesh._valid=1;
                    resetPosiBall(mesh);
                } else if (balls.length < nBall) {
                    popBall();
                }
            }
        }
        balls.forEach((mesh) => {
            if (mesh.position.y < ymin && mesh._valid==1) {
                mesh._valid=0;
                pool.push(mesh);
            }
        })
    })

    return scene;
}


export var createScene_RunBall4 = async function () {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 1.7 * Math.PI / 2, 2.5 * Math.PI / 8, 100, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    let pSrc, ymin;
    
    let createMesh = function() {
        let mesh = null;
        if (1) {
            // トラック
            pSrc = new BABYLON.Vector3(2,1,0), ymin=-20;
            let plist = [];
            plist.push(new BABYLON.Vector3(-6, 1, 0 ));
            plist.push(new BABYLON.Vector3(-3, 1, 0 ));
            plist.push(new BABYLON.Vector3(0, 1, 0 ));
            plist.push(new BABYLON.Vector3(3, 1, 0 ));
            plist.push(new BABYLON.Vector3(6, 2, 0 )); // Us
            plist.push(new BABYLON.Vector3(9, 4, 0 ));
            plist.push(new BABYLON.Vector3(12, 7, 0 ));
            plist.push(new BABYLON.Vector3(15, 9, 0 ));
            plist.push(new BABYLON.Vector3(18, 10, 0 )); // Ue
            plist.push(new BABYLON.Vector3(21, 10, 0 ));
            plist.push(new BABYLON.Vector3(24, 10, 0 )); // Ls(bottom
            plist.push(new BABYLON.Vector3(27.5,  9.5, 1.5 ));
            plist.push(new BABYLON.Vector3(29  ,  9  , 5 ));  // (right
            plist.push(new BABYLON.Vector3(27.5,  8.5, 8.5 ));
            plist.push(new BABYLON.Vector3(24  ,  8  , 10 )); // (top
            plist.push(new BABYLON.Vector3(20.5,  7.5, 8.5 ));
            plist.push(new BABYLON.Vector3(19  ,  7  , 5 )); // left
            plist.push(new BABYLON.Vector3(20.5,  6.5, 1.5 ));
            plist.push(new BABYLON.Vector3(24  ,  6  , 0 )); // bottom
            plist.push(new BABYLON.Vector3(27.5,  5.5, 1.5 ));
            plist.push(new BABYLON.Vector3(29  ,  5  , 5 ));  // (right
            plist.push(new BABYLON.Vector3(29,  5, 8 ));
            plist.push(new BABYLON.Vector3(29,  5, 11 ));
            plist.push(new BABYLON.Vector3(27.5,  5, 14.5 ));
            plist.push(new BABYLON.Vector3(24,  5, 16 )); // (top
            plist.push(new BABYLON.Vector3(21,  5, 16 )); // Ds
            plist.push(new BABYLON.Vector3(18,  4, 16 ));
            plist.push(new BABYLON.Vector3(15,  2, 16 ));
            plist.push(new BABYLON.Vector3(12,  1, 16 )); // De
            plist.push(new BABYLON.Vector3( 9,  1, 16 )); // Us
            plist.push(new BABYLON.Vector3( 6,  2, 16 ));
            plist.push(new BABYLON.Vector3( 3,  3, 16 ));
            plist.push(new BABYLON.Vector3( 0,  3, 16 ));  // Ue
            plist.push(new BABYLON.Vector3(-3,  3, 16 ));  // Ls(top
            plist.push(new BABYLON.Vector3(-6.5,  3, 14.5 ));
            plist.push(new BABYLON.Vector3(-8,  3, 11 ));  // Ls(left
            plist.push(new BABYLON.Vector3(-6.5,  3, 7.5 ));
            plist.push(new BABYLON.Vector3(-3,  3,  6 ));  // Ls(top
            plist.push(new BABYLON.Vector3( 0,  3,  6 ));
            plist.push(new BABYLON.Vector3( 3,  3,  6 ));
            plist.push(new BABYLON.Vector3( 6,  3,  6 ));
            plist.push(new BABYLON.Vector3( 9,  3,  6 )); // Rs(top
            plist.push(new BABYLON.Vector3(12.5,3,  4.5));
            plist.push(new BABYLON.Vector3(14,  3,  1 )); // Re(right
            plist.push(new BABYLON.Vector3(14,  3, -2 ));
            plist.push(new BABYLON.Vector3(14,  3, -5 ));
            plist.push(new BABYLON.Vector3(14,  3, -8 ));
            plist.push(new BABYLON.Vector3(14,  3,-11 )); // Ls(left
            plist.push(new BABYLON.Vector3(15.5,4,-14.5));
            plist.push(new BABYLON.Vector3(19,  5,-16 )); // (bottom
            plist.push(new BABYLON.Vector3(22.5,6,-14.5));
            plist.push(new BABYLON.Vector3(24,  7,-11 )); // (right
            plist.push(new BABYLON.Vector3(22.5,8,-7.5));
            plist.push(new BABYLON.Vector3(19,  9, -6 )); // (top
            plist.push(new BABYLON.Vector3(16,  9, -6 ));
            plist.push(new BABYLON.Vector3(13,  9, -6 ));
            plist.push(new BABYLON.Vector3(10,  9, -6 )); // Ds
            plist.push(new BABYLON.Vector3( 7,  8, -6 ));
            plist.push(new BABYLON.Vector3( 4,  6, -6 ));
            plist.push(new BABYLON.Vector3( 1,  4, -6 ));
            plist.push(new BABYLON.Vector3(-2,  3, -6 )); // De
            plist.push(new BABYLON.Vector3(-5,  3, -6 ));
            plist.push(new BABYLON.Vector3(-8,  4, -6 )); // Us
            plist.push(new BABYLON.Vector3(-11,  5, -6 ));
            plist.push(new BABYLON.Vector3(-14,  5, -6 )); //Ue
            plist.push(new BABYLON.Vector3(-17,  5, -6 ));
            plist.push(new BABYLON.Vector3(-20,  5, -6 )); // Ls(top
            plist.push(new BABYLON.Vector3(-23.5,4.5, -7.5));
            plist.push(new BABYLON.Vector3(-25,  4  , -11 )); // (left
            plist.push(new BABYLON.Vector3(-23.5,3.5, -14.5));
            plist.push(new BABYLON.Vector3(-20,  3  , -16 )); // (bottom
            plist.push(new BABYLON.Vector3(-16.5,2.5, -14.5));
            plist.push(new BABYLON.Vector3(-15,  2, -11 )); // Le(right
            plist.push(new BABYLON.Vector3(-15,  1, -8 ));
            plist.push(new BABYLON.Vector3(-15,  1, -5 )); //Rs(left
            plist.push(new BABYLON.Vector3(-13.5,1, -1.5 ));
            plist.push(new BABYLON.Vector3(-10,  1,  0 )); //Re (top
            plist.push(new BABYLON.Vector3( -7,  1,  0 ));

            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 10, true);//closed
            const plist3 = catmullRom.getPoints();
            mesh = BABYLON.MeshBuilder.CreateTube("tube", {path: plist3, radius:1.2, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Gray();
            mesh.material.wireframe=1;
            mesh.material.alpha=0.04;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, friction: 0.01, restitution:0.01}, scene);
            // 加速器
            let pidxlist = [[0.02, new BABYLON.Vector3(1, 0, 0)],
                            [0.5 ,new BABYLON.Vector3(1, 0, 0)]
                           ];
            let meshAccList = [];
            for (let [pidx,acc] of pidxlist) {
                let pPosi = plist3[Math.floor(plist3.length*pidx)];
                let meshAcc = BABYLON.MeshBuilder.CreateBox("anc", {width:3, height:3, depth:3});
                meshAcc.position.copyFrom(pPosi);
                meshAcc.material = new BABYLON.StandardMaterial("");
                meshAcc.material.diffuseColor = BABYLON.Color3.Red();
                meshAcc.material.wireframe=1;
                meshAcc._acc = acc;
                meshAccList.push(meshAcc);
            }

            scene.registerAfterRender(function() {
                // 自機とチェックポイントの交差チェック
                balls.forEach((mesh) => {
                    for (let meshAcc of meshAccList) {
                        if (mesh.intersectsMesh(meshAcc, true)) {
                            mesh._agg.body.applyImpulse(meshAcc._acc, mesh.absolutePosition);
                        }
                    }
                });
            });
        }
        return mesh;
    }

    let mesh = createMesh();

    // ボール
    let balls=[], pool=[];
    let nBall = 10, popCool=0, popCoolDef=5;
    let popBall = function() {
        let mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
        mesh.position.copyFrom(pSrc);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.1, restitution:0.1}, scene);
        mesh.physicsBody.disablePreStep = false;
        mesh._valid=1;
        balls.push(mesh);
    }
    let resetPosiBall = function(mesh) {
        mesh.position.copyFrom(pSrc);
        mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
    }

    scene.onBeforeRenderObservable.add(() => {
        {
            if (popCool > 0) {
                popCool = popCool-1;
            } else {
                popCool = popCoolDef;
                if (pool.length > 0) {
                    let mesh = pool.shift();
                    mesh._valid=1;
                    resetPosiBall(mesh);
                } else if (balls.length < nBall) {
                    popBall();
                }
            }
        }
        balls.forEach((mesh) => {
            if (mesh.position.y < ymin && mesh._valid==1) {
                mesh._valid=0;
                pool.push(mesh);
            }
        })
    })

    return scene;
}


export var createScene_RunBall6 = async function () {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 1.7 * Math.PI / 2, 2.5 * Math.PI / 8, 100, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    let pSrc, ymin;
    
    if (0) {
        let grndW=40, grndH=40;
        let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        meshGrnd.material = new BABYLON.GridMaterial("groundMaterial", scene);
        meshGrnd.material.majorUnitFrequency = 1; 
        meshGrnd.material.minorUnitVisibility  = 0.2;
    }

    let createMesh = function() {
        let mesh = null;
        if (1) {
            // トラック
            pSrc = new BABYLON.Vector3(2,1,0), ymin=-20;
            let plist = [];
            plist.push(new BABYLON.Vector3(-6, 1, 0 ));
            plist.push(new BABYLON.Vector3(-3, 1, 0 ));
            plist.push(new BABYLON.Vector3(0, 1, 0 ));
            plist.push(new BABYLON.Vector3(3, 1, 0 ));
            plist.push(new BABYLON.Vector3(6, 2, 0 )); // Us
            plist.push(new BABYLON.Vector3(9, 4, 0 ));
            plist.push(new BABYLON.Vector3(12, 7, 0 ));
            plist.push(new BABYLON.Vector3(15, 9, 0 ));
            plist.push(new BABYLON.Vector3(18, 10, 0 )); // Ue
            plist.push(new BABYLON.Vector3(21, 10, 0 ));
            plist.push(new BABYLON.Vector3(24, 10, 0 )); // Ls(bottom
            plist.push(new BABYLON.Vector3(27.5,  9.5, 1.5 ));
            plist.push(new BABYLON.Vector3(29  ,  9  , 5 ));  // (right
            plist.push(new BABYLON.Vector3(27.5,  8.5, 8.5 ));
            plist.push(new BABYLON.Vector3(24  ,  8  , 10 )); // (top
            plist.push(new BABYLON.Vector3(20.5,  7.5, 8.5 ));
            plist.push(new BABYLON.Vector3(19  ,  7  , 5 )); // left
            plist.push(new BABYLON.Vector3(20.5,  6.5, 1.5 ));
            plist.push(new BABYLON.Vector3(24  ,  6  , 0 )); // bottom
            plist.push(new BABYLON.Vector3(27.5,  5.5, 1.5 ));
            plist.push(new BABYLON.Vector3(29  ,  5  , 5 ));  // (right
            plist.push(new BABYLON.Vector3(29,  5, 8 ));
            plist.push(new BABYLON.Vector3(29,  5, 11 ));
            plist.push(new BABYLON.Vector3(27.5,  5, 14.5 ));
            plist.push(new BABYLON.Vector3(24,  5, 16 )); // (top
            plist.push(new BABYLON.Vector3(21,  5, 16 )); // Ds
            plist.push(new BABYLON.Vector3(18,  4, 16 ));
            plist.push(new BABYLON.Vector3(15,  2, 16 ));
            plist.push(new BABYLON.Vector3(12,  1, 16 )); // De
            plist.push(new BABYLON.Vector3( 9,  1, 16 )); // Us
            plist.push(new BABYLON.Vector3( 6,  2, 16 ));
            plist.push(new BABYLON.Vector3( 3,  3, 16 ));
            plist.push(new BABYLON.Vector3( 0,  3, 16 ));  // Ue
            plist.push(new BABYLON.Vector3(-3,  3, 16 ));  // Ls(top
            plist.push(new BABYLON.Vector3(-6.5,  3, 14.5 ));
            plist.push(new BABYLON.Vector3(-8,  3, 11 ));  // Ls(left
            plist.push(new BABYLON.Vector3(-6.5,  3, 7.5 ));
            plist.push(new BABYLON.Vector3(-3,  3,  6 ));  // Ls(top
            plist.push(new BABYLON.Vector3( 0,  3,  6 ));
            plist.push(new BABYLON.Vector3( 3,  3,  6 ));
            plist.push(new BABYLON.Vector3( 6,  3,  6 ));
            plist.push(new BABYLON.Vector3( 9,  3,  6 )); // Rs(top
            plist.push(new BABYLON.Vector3(12.5,3,  4.5));
            plist.push(new BABYLON.Vector3(14,  3,  1 )); // Re(right
            plist.push(new BABYLON.Vector3(14,  3, -2 ));
            plist.push(new BABYLON.Vector3(14,  3, -5 ));
            plist.push(new BABYLON.Vector3(14,  3, -8 ));
            plist.push(new BABYLON.Vector3(14,  3,-11 )); // Ls(left
            plist.push(new BABYLON.Vector3(15.5,4,-14.5));
            plist.push(new BABYLON.Vector3(19,  5,-16 )); // (bottom
            plist.push(new BABYLON.Vector3(22.5,6,-14.5));
            plist.push(new BABYLON.Vector3(24,  7,-11 )); // (right
            plist.push(new BABYLON.Vector3(22.5,8,-7.5));
            plist.push(new BABYLON.Vector3(19,  9, -6 )); // (top
            plist.push(new BABYLON.Vector3(16,  9, -6 ));
            plist.push(new BABYLON.Vector3(13,  9, -6 ));
            plist.push(new BABYLON.Vector3(10,  9, -6 )); // Ds
            plist.push(new BABYLON.Vector3( 7,  8, -6 ));
            plist.push(new BABYLON.Vector3( 4,  6, -6 ));
            plist.push(new BABYLON.Vector3( 1,  4, -6 ));
            plist.push(new BABYLON.Vector3(-2,  3, -6 )); // De
            plist.push(new BABYLON.Vector3(-5,  3, -6 ));
            plist.push(new BABYLON.Vector3(-8,  4, -6 )); // Us
            plist.push(new BABYLON.Vector3(-11,  5, -6 ));
            plist.push(new BABYLON.Vector3(-14,  5, -6 )); //Ue
            plist.push(new BABYLON.Vector3(-17,  5, -6 ));
            plist.push(new BABYLON.Vector3(-20,  5, -6 )); // Ls(top
            plist.push(new BABYLON.Vector3(-23.5,4.5, -7.5));
            plist.push(new BABYLON.Vector3(-25,  4  , -11 )); // (left
            plist.push(new BABYLON.Vector3(-23.5,3.5, -14.5));
            plist.push(new BABYLON.Vector3(-20,  3  , -16 )); // (bottom
            plist.push(new BABYLON.Vector3(-16.5,2.5, -14.5));
            plist.push(new BABYLON.Vector3(-15,  2, -11 )); // Le(right
            plist.push(new BABYLON.Vector3(-15,  1, -8 ));
            plist.push(new BABYLON.Vector3(-15,  1, -5 )); //Rs(left
            plist.push(new BABYLON.Vector3(-13.5,1, -1.5 ));
            plist.push(new BABYLON.Vector3(-10,  1,  0 )); //Re (top
            plist.push(new BABYLON.Vector3( -7,  1,  0 ));

            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 10, true);//closed
            const plist3 = catmullRom.getPoints();
            let path3d = new BABYLON.Path3D(plist3);
            mesh = BABYLON.MeshBuilder.CreateTube("tube", {path: plist3, radius:1.2, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Gray();
            mesh.material.wireframe=1;
            mesh.material.alpha=0.04;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, friction: 0.0001, restitution:0.01}, scene);

            // アクチュエーター(Actuator
            let actInfoList = [];
            // 範囲のmin, max, 初期位置
            let rangelist = [[0, 0.1, 0.05],
                             [0.55, 0.69, 0.62],
                            ];
            for (let range of rangelist) {
                {
                    // 可動範囲をメッシュで表示
                    let iloop = 0;
                    for (let vrate of range) {
                        if (++iloop==3) break;
                        let mesh= BABYLON.MeshBuilder.CreateBox("anc", {width:2, height:2, depth:0.2});
                        mesh.material = new BABYLON.StandardMaterial("");
                        mesh.material.diffuseColor = BABYLON.Color3.Yellow();
                        mesh.material.alpha=0.3;
                        const pos = path3d.getPointAt(vrate);
                        mesh.position.copyFrom(pos);
                        const tangent = path3d.getTangentAt(vrate);
                        mesh.lookAt(pos.add(tangent));
                    }
                }
                let mesh= BABYLON.MeshBuilder.CreateBox("anc", {width:3, height:3, depth:3});
                mesh.position.copyFrom(path3d.getPointAt(range[2]));
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseColor = BABYLON.Color3.Yellow();
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass:0, friction: 0.0001, restitution:200}, scene);
                mesh.physicsBody.disablePreStep = false;
                actInfoList.push({
                    mesh:mesh,
                    posiMin: range[0],
                    posiMax: range[1],
                    posiRate: range[2], // paht3D上の位置(初期)
                    posiRateAdd: 0.0005, // 0.0005,
                })
            }
            scene.onBeforeRenderObservable.add((scene) => {
                actInfoList.forEach((actInfo) => {
                    actInfo.posiRate += actInfo.posiRateAdd;
                    if (actInfo.posiRate > actInfo.posiMax) actInfo.posiRate = actInfo.posiMin;
                    if (actInfo.posiRate < actInfo.posiMin) actInfo.posiRate = actInfo.posiMax;
                    // パス上の座標を取得
                    const pos = path3d.getPointAt(actInfo.posiRate);
                    actInfo.mesh.position.copyFrom(pos);
                    // 進行方向（接線）を向かせる
                    const tangent = path3d.getTangentAt(actInfo.posiRate);
                    actInfo.mesh.lookAt(pos.add(tangent));
                });
            });
        }
        return mesh;
    }

    let mesh = createMesh();

    // ボール
    let balls=[], pool=[];
    let nBall = 50, popCool=0, popCoolDef=20;
    let popBall = function() {
//        let mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1.0 }, scene);
        let mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1.8 }, scene);
        mesh.position.copyFrom(pSrc);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass:0.1, friction: 0.0001, restitution:0.01}, scene);
        mesh.physicsBody.disablePreStep = false;
        mesh._valid=1;
        balls.push(mesh);
    }
    let resetPosiBall = function(mesh) {
        mesh.position.copyFrom(pSrc);
        mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
    }

    scene.onBeforeRenderObservable.add(() => {
        {
            if (popCool > 0) {
                popCool = popCool-1;
            } else {
                popCool = popCoolDef;
                if (pool.length > 0) {
                    let mesh = pool.shift();
                    mesh._valid=1;
                    resetPosiBall(mesh);
                } else if (balls.length < nBall) {
                    popBall();
                }
            }
        }
        balls.forEach((mesh) => {
            if (mesh.position.y < ymin && mesh._valid==1) {
                mesh._valid=0;
                pool.push(mesh);
            }
        })
    })

    return scene;
}


// export var createScene = createScene_tube1;  // シンプルな漏斗
// export var createScene = createScene_tube3; // 漏斗＋らせん
// export var createScene = createScene_FalBall; // 漏斗＋らせんに玉を落とした感じ
// export var createScene = createScene_RunBall1; // トラック・加速機
export var createScene = createScene_RunBall4; // ジェットコースター・加速機
// export var createScene = createScene_RunBall6; // ジェットコースター・アクチュエーター

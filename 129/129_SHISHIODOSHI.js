// Babylon.js で物理演算(havok)：門松／ししおどし

const R90 = Math.PI/2;

export var createScene_ribbon1 = async function () {
    // ししおどし／竹を斜めにカット（そぎ）
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 100, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));


    let r=2, length=10, rdiv=10;
    let rdiv2=2*rdiv, length_=length/2;
    let rad=0, rstep=Math.PI/rdiv, PI2 = Math.PI*2;
    let x=0, y=0, z=0;
    let pplist = [];
    {
        let plist = [];
        for (let irdiv = 0; irdiv <= rdiv2; ++irdiv) {
            x = -length_;
            y = 0;
            z = 0;
            plist.push(new BABYLON.Vector3(x, y, z ));
        }
        pplist.push(plist);
    }
    {
        let plist = [];
        for (let irdiv = 0; irdiv <= rdiv2; ++irdiv) {
            rad =irdiv*rstep;
            x = -length_;
            y = r*Math.sin(rad);
            z = r*Math.cos(rad);
            plist.push(new BABYLON.Vector3(x, y, z ));
        }
        pplist.push(plist);
    }
    {
        let plist = [];
        for (let irdiv = 0; irdiv <= rdiv2; ++irdiv) {
            rad =irdiv*rstep;
            x = 0;
            y = r*Math.sin(rad);
            z = r*Math.cos(rad);
            plist.push(new BABYLON.Vector3(x, y, z ));
        }
        pplist.push(plist);
    }
    {
        let plist = [];
        for (let irdiv = 0; irdiv <= rdiv2; ++irdiv) {
            rad =irdiv*rstep;
            x = length_+Math.cos(rad+R90)*2;
            y = r*Math.sin(rad);
            z = r*Math.cos(rad);
            plist.push(new BABYLON.Vector3(x, y, z ));
        }
        pplist.push(plist);
    }
    let mesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray: pplist, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
    // mesh.rotation = new BABYLON.Vector3(0, 0,Math.PI/2);
    mesh.material = new BABYLON.StandardMaterial("");
    mesh.material.diffuseColor = BABYLON.Color3.Green();
    mesh.material.wireframe=1;

    return scene;
}


export var createScene_ribbon2 = async function () {
    // かどまつ
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 100, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    let crBumbV = function(r=2, length=10, rdiv=10) {
        // let r=2, length=10, rdiv=10;
        let rdiv2=2*rdiv, length_=length/2;
        let rad=0, rstep=Math.PI/rdiv, PI2 = Math.PI*2;
        let x=0, y=0, z=0;
        let pplist = [];
        {
            // 底の中心
            let plist = [];
            for (let irdiv = 0; irdiv <= rdiv2; ++irdiv) {
                x = 0;
                y = -length_;
                z = 0;
                plist.push(new BABYLON.Vector3(x, y, z ));
            }
            pplist.push(plist);
        }
        {
            // 底の外周
            let plist = [];
            for (let irdiv = 0; irdiv <= rdiv2; ++irdiv) {
                rad =irdiv*rstep;
                x = r*Math.sin(rad);
                y = -length_;
                z = r*Math.cos(rad);
                plist.push(new BABYLON.Vector3(x, y, z ));
            }
            pplist.push(plist);
        }
        {
            // 中央：外周
            let plist = [];
            for (let irdiv = 0; irdiv <= rdiv2; ++irdiv) {
                rad =irdiv*rstep;
                x = r*Math.sin(rad);
                y = 0;
                z = r*Math.cos(rad);
                plist.push(new BABYLON.Vector3(x, y, z ));
            }
            pplist.push(plist);
        }
        {
            // 上端：外周（そぎの部分）
            let plist = [];
            for (let irdiv = 0; irdiv <= rdiv2; ++irdiv) {
                rad =irdiv*rstep;
                x = r*Math.sin(rad);
                y = length_+Math.cos(rad)*2;
                z = r*Math.cos(rad);
                plist.push(new BABYLON.Vector3(x, y, z ));
            }
            pplist.push(plist);
        }
        return pplist;
    }

    // let pplist = crBumbV(r=2, length=10, rdiv=10);
    let pplist = crBumbV(2, 14, 10);
    let mesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray: pplist, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
    mesh.position.set(0, 2, 0);
    // mesh.rotation = new BABYLON.Vector3(0, 0,Math.PI/2);
    mesh.material = new BABYLON.StandardMaterial("");
    mesh.material.diffuseColor = BABYLON.Color3.Green();
    mesh.material.wireframe=1;

    let pplist2 = crBumbV(2, 10, 10);
    let mesh2 = BABYLON.MeshBuilder.CreateRibbon("", {pathArray: pplist2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
    mesh2.position.set(2, 0, -2*1.732);
    // mesh.rotation = new BABYLON.Vector3(0, 0,Math.PI/2);
    mesh2.material = new BABYLON.StandardMaterial("");
    mesh2.material.diffuseColor = BABYLON.Color3.Green();
    mesh2.material.wireframe=1;

    let mesh3 = BABYLON.MeshBuilder.CreateRibbon("", {pathArray: pplist2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
    mesh3.position.set(-2, 0, -2*1.732);
    // mesh.rotation = new BABYLON.Vector3(0, 0,Math.PI/2);
    mesh3.material = new BABYLON.StandardMaterial("");
    mesh3.material.diffuseColor = BABYLON.Color3.Green();
    mesh3.material.wireframe=1;

    return scene;
}

export var createScene_FalBall2 = async function () {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 100, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    let pSrc, ymin;
    
    // {
    //     let grndW=20, grndH=20;
    //     let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
    //     // meshGrnd.position.y += -0.01;
    //     meshGrnd.material = new BABYLON.GridMaterial("groundMaterial", scene);
    //     meshGrnd.material.majorUnitFrequency = 1; 
    //     meshGrnd.material.minorUnitVisibility  = 0.2;
    // }

    let createMesh = function() {
        let mesh = null;
        if (1) {
            // ししおどし／竹を斜めにカット（そぎ）
            pSrc = new BABYLON.Vector3(10,16,0), ymin=-20;
            let r=2, length=20, rdiv=10;
            let rdiv2=2*rdiv, length_=length/2;
            let rad=0, rstep=Math.PI/rdiv, PI2 = Math.PI*2;
            let x=0, y=0, z=0;
            let pplist = [];
            {
                let plist = [];
                for (let irdiv = 0; irdiv <= rdiv2; ++irdiv) {
                    x = -length_;
                    y = 0;
                    z = 0;
                    plist.push(new BABYLON.Vector3(x, y, z ));
                }
                pplist.push(plist);
            }
            {
                let plist = [];
                for (let irdiv = 0; irdiv <= rdiv2; ++irdiv) {
                    rad =irdiv*rstep;
                    x = -length_;
                    y = r*Math.sin(rad);
                    z = r*Math.cos(rad);
                    plist.push(new BABYLON.Vector3(x, y, z ));
                }
                pplist.push(plist);
            }
            {
                let plist = [];
                for (let irdiv = 0; irdiv <= rdiv2; ++irdiv) {
                    rad =irdiv*rstep;
                    x = 0;
                    y = r*Math.sin(rad);
                    z = r*Math.cos(rad);
                    plist.push(new BABYLON.Vector3(x, y, z ));
                }
                pplist.push(plist);
            }
            {
                let plist = [];
                for (let irdiv = 0; irdiv <= rdiv2; ++irdiv) {
                    rad =irdiv*rstep;
                    x = length_+Math.cos(rad+R90)*2;
                    y = r*Math.sin(rad);
                    z = r*Math.cos(rad);
                    plist.push(new BABYLON.Vector3(x, y, z ));
                }
                pplist.push(plist);
            }
            mesh = BABYLON.MeshBuilder.CreateRibbon("", {pathArray: pplist, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            // mesh.rotation = new BABYLON.Vector3(0, 0,Math.PI/2);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Green();
            mesh.material.wireframe=1;
        }
        return mesh;
    }

    let mesh = createMesh(); // 筒のメッシュ
    let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 10, friction: 0.01, restitution:0.01}, scene);
    mesh._agg = agg;
    // バランサとしても重り（が機能しないのでコメント）..代わりに
    // let mesh2 = BABYLON.MeshBuilder.CreateBox("anc", {width:0.1, height:0.1, depth:0.1});
    // mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.MESH, { mass: 2, friction: 0.01, restitution:0.01}, scene);
    // mesh2.position.x=-11;
    // mesh2.parent = mesh;
    if (1) {
        // 固定端
        let mesh0 = BABYLON.MeshBuilder.CreateBox("anc", {width:0.1, height:1, depth:1});
        mesh0.position.set(-3,3,0);
        mesh0.visibility = 0; // 透明にする／隠しておく
        let agg = new BABYLON.PhysicsAggregate(mesh0, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.01, restitution:0.01}, scene);
        mesh0._agg = agg;
        // ヒンジ
        let joint = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(-3, 0, 0), // 筒の底側に -3ずらした地点
            new BABYLON.Vector3(0, -2, 0),
            new BABYLON.Vector3(0, 0, 1), // BABYLON.Vector3.Forward(), // undefined,
            new BABYLON.Vector3(0, 0, 1), // BABYLON.Vector3.Forward(), // undefined,
            scene
        );
        mesh._agg.body.addConstraint(mesh0._agg.body, joint);
        // // let physicsViewer = new BABYLON.PhysicsViewer(); // 可動域のデバッグ表示
        // // physicsViewer.showConstraint(joint);
        // 床
        let mesh9 = BABYLON.MeshBuilder.CreateBox("anc", {width:20, height:1, depth:4});
        mesh9.position.set(0,-5,0);
        mesh9._agg = new BABYLON.PhysicsAggregate(mesh9, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.01, restitution:0.01}, scene);

        // 支柱（見せかけ）
        let mesh11 = BABYLON.MeshBuilder.CreateBox("anc", {width:1, height:6, depth:1});
        mesh11.position.set(-3,-2.5,-2.5);
        let mesh12 = BABYLON.MeshBuilder.CreateBox("anc", {width:1, height:6, depth:1});
        mesh12.position.set(-3,-2.5, 2.5);
        
    }

    // 永遠にボールを落とす
    let balls=[], pool=[];
    let nBall = 300, popCool=0, popCoolDef=40; // ボールを落とす間隔
    let popBall = function() {
        let mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
        mesh.position.copyFrom(pSrc); // 初期位置に移動
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.1, restitution:0.1}, scene);
        mesh.physicsBody.disablePreStep = false;
        mesh._valid=1;
        balls.push(mesh);
    }
    let resetPosiBall = function(mesh) {
        mesh.position.copyFrom(pSrc); // 初期位置に移動
        mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
    }

    scene.onBeforeRenderObservable.add(() => {
        // mesh._agg.body.applyAngularImpulse(new BABYLON.Vector3(0, 0, 7.4)); // ok 下限
        mesh._agg.body.applyAngularImpulse(new BABYLON.Vector3(0, 0, 9.0)); // ok バランスよさげ
        // mesh._agg.body.applyAngularImpulse(new BABYLON.Vector3(0, 0, 10.0)); // x NG強すぎ／倒れない
        // if (balls.length < nBall) {
        {
            if (popCool > 0) {
                popCool = popCool-1;
            } else {
                popCool = popCoolDef;
                if (pool.length > 0) {
                    // pool から取り出して再利用
                    let mesh = pool.shift();
                    mesh._valid=1;
                    resetPosiBall(mesh);
                } else if (balls.length < nBall) {
                    // 新規作成
                    popBall();
                }
            }
        }
        balls.forEach((mesh) => {
            if (mesh.position.y < ymin && mesh._valid==1) {
                // ボールが下限を超えたら回収（pool に格納）
                mesh._valid=0;
                pool.push(mesh);
                // resetPosiBall(mesh);
                // // const phbody = ball.physicsBody;
            }
        })
    })


    return scene;
}


// export var createScene = createScene_ribbon1; // ししおどし／竹を斜めにカット（そぎ）
// export var createScene = createScene_ribbon2; // かどまつ

export var createScene = createScene_FalBall2;


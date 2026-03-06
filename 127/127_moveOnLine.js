// ３Ｄパスにあわせてメッシュを動かす

export var createScene_chatGPT_sample = async function () {
    // prompt
    // babylon.js で 3Dの経路（(x,y,z)の点列)の上を複数のメッシュが同時に動くようにするには？

    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 0, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            // camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(5, 20,-10), scene);
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(10, 20, -20), scene);
            // if (myMesh != null) {
            //     camera.setTarget(myMesh.position);
            // } else {
            //     camera.setTarget(BABYLON.Vector3.Zero());
            // }
            // camera.setTarget(BABYLON.Vector3.Zero());
            camera.setTarget(new BABYLON.Vector3(10, 0, 8));
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる

            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    if (1) {
        // 地面
        const grndW=100, grndH=100, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
    }


    // 実装の骨子
    const points = [
        new BABYLON.Vector3(0,0,0),
        new BABYLON.Vector3(5,2,3),
        new BABYLON.Vector3(10,0,8),
        new BABYLON.Vector3(20,3,12)
    ];

    const path3d = new BABYLON.Path3D(points);
    const curve = path3d.getCurve();

    const pathLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);

    // // 曲線にする
    // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 20); // 20は分割数
    // const path3d = new BABYLON.Path3D(catmullRom.getPoints());
    // const curve = path3d.getCurve(); // 視覚確認用の曲線


    // 位置補間関数（等速）
    function getPointAt(t) {
        const n = curve.length - 1;
        const f = t * n;
        const i = Math.floor(f);
        const r = f - i;
        return BABYLON.Vector3.Lerp(curve[i], curve[i+1], r);
    }

    // 複数メッシュを同時に動かす
    const meshes = [];
    for (let i = 0; i < 5; i++) {
        const m = BABYLON.MeshBuilder.CreateBox("b"+i);
        meshes.push({
            mesh: m,
            offset: i * 0.15,   // 経路上の位相差
            speed: 0.1
        });
    }

    scene.onBeforeRenderObservable.add(() => {
        const dt = scene.getEngine().getDeltaTime() / 1000;
        meshes.forEach(o => {
            o.offset = (o.offset + o.speed * dt) % 1;
            o.mesh.position.copyFrom(getPointAt(o.offset));
        });
    });

    return scene;
}


export var createScene_gemini_sample = async function () {
    // prompt
    // babylon.js で 3Dの経路（(x,y,z)の点列)の上を複数のメッシュが同時に動くようにするには？

    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 0, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            // camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(5, 20,-10), scene);
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20, -20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる

            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    if (1) {
        // 地面
        const grndW=100, grndH=100, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
    }


    // 1. 経路となる点列を作成
    const points = [
        new BABYLON.Vector3(-10, 0, -10),
        new BABYLON.Vector3(0, 5, 0),
        new BABYLON.Vector3(10, 0, 10),
        new BABYLON.Vector3(15, 2, 0)
    ];

    // 2. Path3D オブジェクトを生成
    // 第2引数は法線計算用（デフォルトでOK）、第3引数をtrueにすると閉じられたループになります
    const path3d = new BABYLON.Path3D(points);
    const curve = path3d.getCurve(); // 視覚確認用の曲線
    // // 曲線にする
    // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 20); // 20は分割数
    // const path3d = new BABYLON.Path3D(catmullRom.getPoints());
    // const curve = path3d.getCurve(); // 視覚確認用の曲線


    // パスを可視化（デバッグ用）
    const pathLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);

    // 3. 動かしたいメッシュを複数作成
    let meshes = [];
    const numMeshes = 3;

    for (let i = 0; i < numMeshes; i++) {
        let box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {size: 1}, scene);
        
        // 各メッシュに個別の進捗と速度を持たせる
        meshes.push({
            mesh: box,
            speed: 0.002 + (i * 0.001), // 個別に速度を変える場合
            percentage: i * 0.2         // 開始地点をずらす（オフセット）
        });
    }

    // 4. アニメーションループ
    scene.onBeforeRenderObservable.add((scene) => {
        meshes.forEach((item) => {
            // 進捗を更新（1.0を超えたら0に戻る）
            item.percentage += item.speed;
            if (item.percentage > 1) item.percentage = 0;

            // パス上の座標を取得
            const pos = path3d.getPointAt(item.percentage);
            item.mesh.position.copyFrom(pos);

            // 進行方向（接線）を向かせる
            const tangent = path3d.getTangentAt(item.percentage);
            item.mesh.lookAt(pos.add(tangent));
        });
    });

    return scene;
}


export var createScene_draft2 = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 0, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
// console.log("icamera=",icamera)
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20,-20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる

            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    if (1) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
        // var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
    }


    // 1. 経路となる点列を作成
    const points = [
        new BABYLON.Vector3(-10, 1, 0),
        new BABYLON.Vector3(0, 1, 10),
        new BABYLON.Vector3(10, 1, 0),
        new BABYLON.Vector3(0, 1, -10)
    ];

    // 2. Path3D オブジェクトを生成
    // 第2引数は法線計算用（デフォルトでOK）、第3引数をtrueにすると閉じられたループになります
    let path3d = new BABYLON.Path3D(points);
    // let path3d = new BABYLON.Path3D(points, new BABYLON.Vector3(1, 1, 0));
// const R45 = Math.PI/4;
//     // let path3d = new BABYLON.Path3D(points, new BABYLON.Vector3(Math.cos(R45), 0, Math.sin(R45)));
//     // let path3d = new BABYLON.Path3D(points, new BABYLON.Vector3(Math.cos(R45), Math.sin(R45), 0));
//     let path3d = new BABYLON.Path3D(points, new BABYLON.Vector3(0, Math.sin(R45), Math.cos(R45)));
    console.log("path3d.dist=", path3d.getDistances());
    let curve = path3d.getCurve(); // 視覚確認用の曲線
    if (1) {
        // 曲線にする
        // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 20); // 20は分割数
        const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 20, true); // 20は分割数,閉曲線にする
        path3d = new BABYLON.Path3D(catmullRom.getPoints());
        curve = path3d.getCurve(); // 視覚確認用の曲線
    }

    // パスを可視化（デバッグ用）
    const pathLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);

    // 3. 動かしたいメッシュを複数作成
    let meshes = [];
    const numMeshes = 3;
    for (let i = 0; i < numMeshes; i++) {
        let box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {size: 1}, scene);
        // 各メッシュに個別の進捗と速度を持たせる
        meshes.push({
            mesh: box,
            speed: 0.002 + (i * 0.001), // 個別に速度を変える場合
            percentage: i * 0.2         // 開始地点をずらす（オフセット）
        });
    }

    // 4. アニメーションループ
    scene.onBeforeRenderObservable.add((scene) => {
        meshes.forEach((item) => {
            // 進捗を更新（1.0を超えたら0に戻る）
            item.percentage += item.speed;
            if (item.percentage > 1) item.percentage = 0;

            // パス上の座標を取得
            const pos = path3d.getPointAt(item.percentage);
            item.mesh.position.copyFrom(pos);

            // 進行方向（接線）を向かせる
            const tangent = path3d.getTangentAt(item.percentage);
            item.mesh.lookAt(pos.add(tangent));
        });
    });



    return scene;
}

export var createScene_draft3 = async function () {
    // 太陽系っぽいもの
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 0, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20,-20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    if (1) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
    }

    let points = [];
    const nrad = 36, deg2rad = Math.PI*2/nrad;
    for (let r of [10, 8, 4]) {
        let _points = [], x, y = 1, z;
        for (let irad = 0; irad < nrad; ++irad) {
            x = r*Math.cos(deg2rad*irad);
            z = r*Math.sin(deg2rad*irad);
            let p = new BABYLON.Vector3(x, y, z)
            _points.push(p);
        }
        points.push(_points);
    }
    const nloop = points.length;

    let path3d = [];
    for (let iloop = 0; iloop < nloop; ++iloop) {
        const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points[iloop], 20, true); // 20は分割数,閉曲線にする
        let _path3d = new BABYLON.Path3D(catmullRom.getPoints());
        path3d.push(_path3d);
        let curve = _path3d.getCurve();
        const meshLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);
    }

    // 3. 動かしたいメッシュを複数作成
    let meshBoxList = [];

    for (let iloop = 0; iloop < nloop; ++iloop) {
        let box = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, scene);
        meshBoxList.push({
            i: iloop,
            mesh: box,
            speed: 0.002 + (iloop * 0.001), // 個別に速度を変える場合
            percentage: iloop * 0.2         // 開始地点をずらす（オフセット）
        });
    }

    scene.onBeforeRenderObservable.add((scene) => {
        meshBoxList.forEach((minfo) => {
            minfo.percentage += minfo.speed;
            if (minfo.percentage > 1) minfo.percentage = 0;

            // パス上の座標を取得
            const pos = path3d[minfo.i].getPointAt(minfo.percentage);
            minfo.mesh.position.copyFrom(pos);

            // 進行方向（接線）を向かせる
            const tangent = path3d[minfo.i].getTangentAt(minfo.percentage);
            minfo.mesh.lookAt(pos.add(tangent));
        });
    });



    return scene;
}

export var createScene_draft4 = async function () {
    // 「原子と電子のうごき」っぽいもの
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 0, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20,-20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    if (1) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
        // var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution:0.01}, scene);
    }

    const R120 = Math.PI*2/3;
    const q120 = BABYLON.Quaternion.FromEulerAngles(0, R120, 0);
    const R240 = Math.PI*4/3;
    const q240 = BABYLON.Quaternion.FromEulerAngles(0, R240, 0);

    const points0 = [
        new BABYLON.Vector3(-10, 1, -1),
        new BABYLON.Vector3(-12, 1, 0),
        new BABYLON.Vector3(-10, 1, 1),
        new BABYLON.Vector3(0, 1, 2),
        new BABYLON.Vector3(10, 1, 1),
        new BABYLON.Vector3(12, 1, 0),
        new BABYLON.Vector3(10, 1, -1),
        new BABYLON.Vector3(0, 1, -2)
    ];

    const points = [
        [points0[0],
         points0[1],
         points0[2],
         points0[3],
         points0[4],
         points0[5],
         points0[6],
         points0[7],
        ],
        [points0[0].applyRotationQuaternion(q120),
         points0[1].applyRotationQuaternion(q120),
         points0[2].applyRotationQuaternion(q120),
         points0[3].applyRotationQuaternion(q120),
         points0[4].applyRotationQuaternion(q120),
         points0[5].applyRotationQuaternion(q120),
         points0[6].applyRotationQuaternion(q120),
         points0[7].applyRotationQuaternion(q120),
        ],
        [points0[0].applyRotationQuaternion(q240),
         points0[1].applyRotationQuaternion(q240),
         points0[2].applyRotationQuaternion(q240),
         points0[3].applyRotationQuaternion(q240),
         points0[4].applyRotationQuaternion(q240),
         points0[5].applyRotationQuaternion(q240),
         points0[6].applyRotationQuaternion(q240),
         points0[7].applyRotationQuaternion(q240),
        ],
    ];
    const nloop = points.length;

    let path3d = [];
    for (let iloop = 0; iloop < nloop; ++iloop) {
        const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points[iloop], 20, true); // 20は分割数,閉曲線にする
        let _path3d = new BABYLON.Path3D(catmullRom.getPoints());
        path3d.push(_path3d);
        let curve = _path3d.getCurve();
        const meshLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);
    }

    let meshBoxList = [];

    for (let iloop = 0; iloop < nloop; ++iloop) {
        let box = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, scene);
        meshBoxList.push({
            i: iloop,
            mesh: box,
            speed: 0.01, //  + (iloop * 0.001), // 個別に速度を変える場合
            percentage: iloop * 0.2         // 開始地点をずらす（オフセット）
        });
    }

    scene.onBeforeRenderObservable.add((scene) => {
        meshBoxList.forEach((minfo) => {
            minfo.percentage += minfo.speed;
            if (minfo.percentage > 1) minfo.percentage = 0;

            // パス上の座標を取得
            const pos = path3d[minfo.i].getPointAt(minfo.percentage);
            minfo.mesh.position.copyFrom(pos);

            // 進行方向（接線）を向かせる
            const tangent = path3d[minfo.i].getTangentAt(minfo.percentage);
            minfo.mesh.lookAt(pos.add(tangent));
        });
    });



    return scene;
}

export var createScene_draft5 = async function () {
    // 電車・単線
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 0, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20,-20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    if (1) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
    }


    const points = [
        new BABYLON.Vector3(-10, 1, 0),
        new BABYLON.Vector3(0, 1, 10),
        new BABYLON.Vector3(10, 1, 0),
        new BABYLON.Vector3(0, 1, -10)
    ];

    const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 20, true); // 20は分割数,閉曲線にする
    let path3d = new BABYLON.Path3D(catmullRom.getPoints());
    let curve = path3d.getCurve(); // 視覚確認用の曲線

    const pathLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);

    let meshes = [];
    const numMeshes = 4;

    for (let i = 0; i < numMeshes; i++) {
        let box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {width:0.5, height:0.5, depth:1}, scene);
        meshes.push({
            mesh: box,
            speed: 0.002,
            percentage: i * 0.02
        });
    }

    scene.onBeforeRenderObservable.add((scene) => {
        meshes.forEach((item) => {
            // 進捗を更新（1.0を超えたら0に戻る）
            item.percentage += item.speed;
            if (item.percentage > 1) item.percentage = 0;

            // パス上の座標を取得
            const pos = path3d.getPointAt(item.percentage);
            item.mesh.position.copyFrom(pos);

            // 進行方向（接線）を向かせる
            const tangent = path3d.getTangentAt(item.percentage);
            item.mesh.lookAt(pos.add(tangent));
        });
    });



    return scene;
}


export var createScene_draft6 = async function () {
    // 電車（複線）
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 0, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20,-20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    if (1) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
    }

    const points = [
        [new BABYLON.Vector3(-10, 1, 0),
         new BABYLON.Vector3(0, 1, 10),
         new BABYLON.Vector3(10, 1, 0),
         new BABYLON.Vector3(0, 1, -10)
        ],
        [new BABYLON.Vector3(-9, 1, 0),
         new BABYLON.Vector3(0, 1, -9),
         new BABYLON.Vector3(9, 1, 0),
         new BABYLON.Vector3(0, 1, 9),
        ],
    ];
    const nloop = points.length;

    let path3d = [];
    for (let iloop = 0; iloop < nloop; ++iloop) {
        const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points[iloop], 20, true); // 20は分割数,閉曲線にする
        let _path3d = new BABYLON.Path3D(catmullRom.getPoints());
        path3d.push(_path3d);
        let curve = _path3d.getCurve();
        const meshLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);
    }

    let meshBoxList = [];
    const numMeshes = [8,6];
    const trainSpan = [0.02, 0.022]; // ライン(iloop)ごとの車両間隔
    
    for (let iloop = 0; iloop < nloop; ++iloop) {
        let nmesh = numMeshes[iloop];
        for (let i = 0; i < nmesh; i++) {
            let box = BABYLON.MeshBuilder.CreateBox(`train${iloop}.${i}`, {width:0.5, height:0.5, depth:1}, scene);
            meshBoxList.push({
                i: iloop,
                mesh: box,
                speed: 0.002,
                percentage: i*trainSpan[iloop]
            });
        }
    }

    scene.onBeforeRenderObservable.add((scene) => {
        meshBoxList.forEach((minfo) => {
            minfo.percentage += minfo.speed;
            if (minfo.percentage > 1) minfo.percentage = 0;
            // パス上の座標を取得
            const pos = path3d[minfo.i].getPointAt(minfo.percentage);
            minfo.mesh.position.copyFrom(pos);
            // 進行方向（接線）を向かせる
            const tangent = path3d[minfo.i].getTangentAt(minfo.percentage);
            minfo.mesh.lookAt(pos.add(tangent));
        });
    });

    return scene;
}


export var createScene_draft7 = async function () {
    // 電車（複線）の複数
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 0, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20,-20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    if (1) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
    }

    const points = [
        [new BABYLON.Vector3(-10, 1, 0),
         new BABYLON.Vector3(0, 1, 10),
         new BABYLON.Vector3(10, 1, 0),
         new BABYLON.Vector3(0, 1, -10)
        ],
        [new BABYLON.Vector3(-9, 1, 0),
         new BABYLON.Vector3(0, 1, -9),
         new BABYLON.Vector3(9, 1, 0),
         new BABYLON.Vector3(0, 1, 9),
        ],
    ];
    const nloop = points.length;

    let path3d = [];
    for (let iloop = 0; iloop < nloop; ++iloop) {
        const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points[iloop], 20, true); // 20は分割数,閉曲線にする
        let _path3d = new BABYLON.Path3D(catmullRom.getPoints());
        path3d.push(_path3d);
        let curve = _path3d.getCurve();
        const meshLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);
    }

    let meshBoxList = [];
    const numMeshes = [8,6, 4,3,3]; // 車両数
    const line = [0, 1, 0, 1, 1]; // ライン
    const trainSpan = [0.02, 0.022]; // ラインごとの車両間隔
    const pdelay = [0, 0, 0.5, 0.3, 0.6]; // ラインごとの位相ずれ（パーセント遅延）
    
    for (let iii = 0; iii < numMeshes.length; ++iii) {
        let iline = line[iii];
        let nmesh = numMeshes[iii];
        let _pdelay = pdelay[iii];
        for (let i = 0; i < nmesh; ++i) {
            let box = BABYLON.MeshBuilder.CreateBox(`train${iii}.${i}`, {width:0.5, height:0.5, depth:1}, scene);
            meshBoxList.push({
                i: iline,
                mesh: box,
                speed: 0.002,
                percentage: i*trainSpan[iline]+_pdelay
            });
        }
    }

    scene.onBeforeRenderObservable.add((scene) => {
        meshBoxList.forEach((minfo) => {
            minfo.percentage += minfo.speed;
            if (minfo.percentage > 1) minfo.percentage = 0;
            // パス上の座標を取得
            const pos = path3d[minfo.i].getPointAt(minfo.percentage);
            minfo.mesh.position.copyFrom(pos);
            // 進行方向（接線）を向かせる
            const tangent = path3d[minfo.i].getTangentAt(minfo.percentage);
            minfo.mesh.lookAt(pos.add(tangent));
        });
    });

    return scene;
}


export var createScene_draft8 = async function () {
    // 電車[台車付]・単線
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 0, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20,-20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    if (1) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
    }


    const points = [
        new BABYLON.Vector3(-10, 1, 0),
        new BABYLON.Vector3(0, 1, 10),
        new BABYLON.Vector3(10, 1, 0),
        new BABYLON.Vector3(0, 1, -10)
    ];

    const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 20, true); // 20は分割数,閉曲線にする
    let path3d = new BABYLON.Path3D(catmullRom.getPoints());
    let curve = path3d.getCurve(); // 視覚確認用の曲線

    const pathLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);

    let meshes = [];
    const numMeshes = 4;
    let datalist = [];

    for (let i = 0; i <= numMeshes; ++i) {
        if (i < numMeshes) {
            let box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {width:0.5, height:0.5, depth:1}, scene);
            meshes.push({
                i: i,
                mesh: box,
            });
        }
        datalist.push({
            i: i,
            speed: 0.002,
            percentage: i * 0.02,
            p: new BABYLON.Vector3(),
        });
    }

    scene.onBeforeRenderObservable.add((scene) => {
        datalist.forEach((data) => {
            let i = data.i;
            data.percentage += data.speed;
            if (data.percentage > 1) data.percentage -= 1;
            data.p.copyFrom(path3d.getPointAt(data.percentage));
            if (i > 0) {
                let p_ = datalist[i-1].p;
                let mesh = meshes[i-1].mesh;
                let pc = data.p.add(p_).scale(0.5);
                let vec = data.p.subtract(p_);
                mesh.position.copyFrom(pc);
                let vrot = Math.atan2(vec.x, vec.z);
                mesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
                mesh.rotate(BABYLON.Vector3.Up(), vrot);
            }
        });
    });

    return scene;
}

export var createScene_draft9 = async function () {
    // 電車[台車付]・単線
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 0, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20,-20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    if (1) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
    }


    const points = [
        new BABYLON.Vector3(-10, 1, 0),
        new BABYLON.Vector3(0, 1, 10),
        new BABYLON.Vector3(10, 1, 0),
        new BABYLON.Vector3(0, 1, -10)
    ];

    const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 20, true); // 20は分割数,閉曲線にする
    let path3d = new BABYLON.Path3D(catmullRom.getPoints());
    let curve = path3d.getCurve(); // 視覚確認用の曲線

    const pathLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);

    const numMeshes = 4;
    let meshes = []; // 車両のメッシュ
    let datalist = []; // 台車・車輪位置

    for (let i = 0; i <= numMeshes; ++i) {
        if (i < numMeshes) {
            // let box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {width:0.5, height:0.5, depth:3}, scene);
            let box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {width:0.5, height:0.5, depth:4}, scene);
            meshes.push({
                i: i,
                mesh: box,
            });
        }
        datalist.push({
            i: i,
            speed: 0.002,
            // percentage: i * 0.055, // for depth=3
            percentage: i * 0.070,
            p: new BABYLON.Vector3(),
        });
    }

    scene.onBeforeRenderObservable.add((scene) => {
        datalist.forEach((data) => {
            let i = data.i;
            data.percentage += data.speed;
            if (data.percentage > 1) data.percentage -= 1;
            data.p.copyFrom(path3d.getPointAt(data.percentage));
            if (i > 0) {
                let p_ = datalist[i-1].p;
                let mesh = meshes[i-1].mesh;
                let pc = data.p.add(p_).scale(0.5); // １つ前との重心位置
                let vec = data.p.subtract(p_); // １つ前との方向ベクトル
                mesh.position.copyFrom(pc); // 重心位置にメッシュを配置
                let vrot = Math.atan2(vec.x, vec.z); // 方向ベクトルから回転角（ヨー）を求める
                mesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
                mesh.rotate(BABYLON.Vector3.Up(), vrot);
            }
        });
    });

    return scene;
}


// export var createScene = createScene_chatGPT_sample;
// export var createScene = createScene_gemini_sample;
// export var createScene = createScene_draft2; // 同一ラインを追いかけっこ
// export var createScene = createScene_draft3; // 太陽系
// export var createScene = createScene_draft4; // 原子と電子
// export var createScene = createScene_draft5; // 電車
// export var createScene = createScene_draft6; // 電車（複線）
// export var createScene = createScene_draft7; // 電車（複線）の複数車両
// export var createScene = createScene_draft8; // 電車[台車付]・単線
export var createScene = createScene_draft9; // 電車[台車付]・単線

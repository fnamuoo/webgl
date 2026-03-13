// Babylon.js ：ゆりかもめ

const SCRIPT_URL2 = "./CourseData5.js";
// const SCRIPT_URL2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/128/CourseData5.js";

let CourseData5 = null;
await import(SCRIPT_URL2).then((obj) => { CourseData5 = obj; });

export var createScene_draft10 = async function () {
    // ゆりかもめ
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
    let xzLbl = [];
    {
        let plist = [];
        // let data = CourseData5.DATA.Yurikamome.xz;
        let data = CourseData5.DATA.Yurikamome.xzL;
console.log("data.size=", data.length);
        // let scale = 0.5, scaleY = 1, adjx = -250, adjy = 0.1, adjz = 600, nz = 0;
        // let scale = 0.1, scaleY = 1, adjx = -60, adjy = 0.1, adjz = 100, nz = 0;
        // let scale = 0.05, scaleY = 1, adjx = -35, adjy = 0.1, adjz = 50, nz = 0;
        let scale = 0.02, scaleY = 1, adjx = -14, adjy = 0.1, adjz = 20, nz = 0;
        // let scale = 0.01, scaleY = 1, adjx = -7, adjy = 0.1, adjz = 9, nz = 0;
        let ix, iy=0, iz, iystep = 0, ii=-1;
        for (let tmp of data) {
            ++ii;
            // xzLbl
            let vE = tmp[tmp.length-1];
            if (typeof(vE) == "string") {
                xzLbl[ii] = vE;
                // tmp末尾をpopすると元データを壊してしまうので、tmp配列をコピー
                let tmp2 = []
                for (let kk=0; kk < tmp.length-1; ++kk) {
                    tmp2.push(tmp[kk]);
                }
                tmp = tmp2;
            }
            ix = tmp[0];
            iz = tmp[1];
            plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
            iy += iystep;
        }
        points.push(plist);
    }
// console.log("xzLbl.len=", xzLbl.length);

    const nloop = points.length;

    let path3d = [];
    let nbPoints = 10;
    for (let iloop = 0; iloop < nloop; ++iloop) {
        // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points[iloop], nbPoints, true); // 20は分割数,閉曲線にする
        const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points[iloop], nbPoints);
        let _path3d = new BABYLON.Path3D(catmullRom.getPoints());
        path3d.push(_path3d);
        let curve = _path3d.getCurve();
        const meshLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);
console.log(" points.len=", points[iloop].length);
//console.log("_path3d.len=", _path3d.length);
console.log("  curve.len=", curve.length);

//         //if (xzLbl.length > 0) {
//         {
//             for (let i = 0; i < curve.length; ++i) {
//                 if ((i%nbPoints) != 0) {
//                     continue;
//                 }
//                 let j = Math.floor(i / nbPoints);
//                 if (j in xzLbl) {
// //console.log("create Sphere  j=", j);
//                     let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
//                     mesh.position = curve[i].clone();
//                     // mesh.position.y += 0.5;
//                     mesh.material = new BABYLON.StandardMaterial("mat");
//                     mesh.material.emissiveColor = BABYLON.Color3.Yellow();
//                     mesh.material.alpha = 0.3;
//                 }
//             }
//         }
    }

    let meshBoxList = [];
    const numMeshes = [2, 2, 2, 2]; // 車両数
    const line = [0, 0, 0, 0]; // ライン~=のぼり／くだり
    const trainSpan = [0.011]; // ラインごとの車両間隔
    // const spdUnit = 0.001;
    // const speedlist = [spdUnit, spdUnit, spdUnit, spdUnit]; // 位相ずれ（パーセント遅延）
    const pdelay = [0, 0.2, 0.5, 0.7]; // 位相ずれ（パーセント遅延）
    
    for (let iii = 0; iii < numMeshes.length; ++iii) {
        let iline = line[iii];
        let nmesh = numMeshes[iii];
        let _pdelay = pdelay[iii];
        for (let i = 0; i < nmesh; ++i) {
            let box = BABYLON.MeshBuilder.CreateBox(`train${iii}.${i}`, {width:0.5, height:0.5, depth:1}, scene);
            meshBoxList.push({
                i: iline,
                mesh: box,
                speed: 0.001,
                percentage: i*trainSpan[iline]+_pdelay
            });
        }
    }

    scene.onBeforeRenderObservable.add((scene) => {
        meshBoxList.forEach((minfo) => {
            minfo.percentage += minfo.speed;
            if (minfo.percentage > 1) minfo.percentage -= 1;
            if (minfo.percentage < 0) minfo.percentage += 1;
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

export var createScene_draft11 = async function () {
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

    let points = [];
    let xzLbl = [];
    {
        let plist = [];
        // let data = CourseData5.DATA.Yurikamome.xz;
        let data = CourseData5.DATA.Yurikamome.xzL;
console.log("data.size=", data.length);
        // let scale = 0.5, scaleY = 1, adjx = -250, adjy = 0.1, adjz = 600, nz = 0;
        // let scale = 0.1, scaleY = 1, adjx = -60, adjy = 0.1, adjz = 100, nz = 0;
        // let scale = 0.05, scaleY = 1, adjx = -35, adjy = 0.1, adjz = 50, nz = 0;
        let scale = 0.02, scaleY = 1, adjx = -14, adjy = 0.1, adjz = 20, nz = 0;
        // let scale = 0.01, scaleY = 1, adjx = -7, adjy = 0.1, adjz = 9, nz = 0;
        let ix, iy=0, iz, iystep = 0, ii=-1;
        for (let tmp of data) {
            ++ii;
            // xzLbl
            let vE = tmp[tmp.length-1];
            if (typeof(vE) == "string") {
                xzLbl[ii] = vE;
                // tmp末尾をpopすると元データを壊してしまうので、tmp配列をコピー
                let tmp2 = []
                for (let kk=0; kk < tmp.length-1; ++kk) {
                    tmp2.push(tmp[kk]);
                }
                tmp = tmp2;
            }
            ix = tmp[0];
            iz = tmp[1];
            plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
            iy += iystep;
        }
        points.push(plist);
    }
// console.log("xzLbl.len=", xzLbl.length);

    const nloop = points.length;

    let path3d = [];
    let nbPoints = 10;
    for (let iloop = 0; iloop < nloop; ++iloop) {
        // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points[iloop], nbPoints, true); // 20は分割数,閉曲線にする
        const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points[iloop], nbPoints);
        let _path3d = new BABYLON.Path3D(catmullRom.getPoints());
        path3d.push(_path3d);
        let curve = _path3d.getCurve();
        const meshLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);
console.log(" points.len=", points[iloop].length);
//console.log("_path3d.len=", _path3d.length);
console.log("  curve.len=", curve.length);

        // 駅を球で表現
        {
            for (let i = 0; i < curve.length; ++i) {
                if ((i%nbPoints) != 0) {
                    continue;
                }
                let j = Math.floor(i / nbPoints);
                if (j in xzLbl) {
//console.log("create Sphere  j=", j);
                    let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                    mesh.position = curve[i].clone();
                    // mesh.position.y += 0.5;
                    mesh.material = new BABYLON.StandardMaterial("mat");
                    mesh.material.emissiveColor = BABYLON.Color3.Yellow();
                    mesh.material.alpha = 0.3;
                }
            }
        }
    }

    let meshBoxList = [];
    const numMeshes = [2, 2, 2, 2]; // 車両数
    const line = [0, 0, 0, 0]; // ライン~=のぼり／くだり
    const trainSpan = [0.011]; // ラインごとの車両間隔
    // const spdUnit = 0.001;
    // const speedlist = [spdUnit, spdUnit, spdUnit, spdUnit, -spdUnit, -spdUnit]; // 位相ずれ（パーセント遅延）
    const pdelay = [0, 0.2, 0.5, 0.7]; // 位相ずれ（パーセント遅延）
    
    for (let iii = 0; iii < numMeshes.length; ++iii) {
        let iline = line[iii];
        let nmesh = numMeshes[iii];
        let _pdelay = pdelay[iii];
        for (let i = 0; i < nmesh; ++i) {
            let box = BABYLON.MeshBuilder.CreateBox(`train${iii}.${i}`, {width:0.5, height:0.5, depth:1}, scene);
            meshBoxList.push({
                i: iline,
                mesh: box,
                speed: 0.001,
                percentage: i*trainSpan[iline]+_pdelay
            });
        }
    }

    scene.onBeforeRenderObservable.add((scene) => {
        meshBoxList.forEach((minfo) => {
            minfo.percentage += minfo.speed;
            if (minfo.percentage > 1) minfo.percentage -= 1;
            if (minfo.percentage < 0) minfo.percentage += 1;
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


export var createScene_draft12 = async function () {
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
    let xzLbl = [];
    {
        let plist = [];
        // let data = CourseData5.DATA.Yurikamome.xz;
        let data = CourseData5.DATA.Yurikamome.xzL;
console.log("data.size=", data.length);
        // let scale = 0.5, scaleY = 1, adjx = -250, adjy = 0.1, adjz = 600, nz = 0;
        // let scale = 0.1, scaleY = 1, adjx = -60, adjy = 0.1, adjz = 100, nz = 0;
        // let scale = 0.05, scaleY = 1, adjx = -35, adjy = 0.1, adjz = 50, nz = 0;
        let scale = 0.02, scaleY = 1, adjx = -14, adjy = 0.1, adjz = 20, nz = 0;
        // let scale = 0.01, scaleY = 1, adjx = -7, adjy = 0.1, adjz = 9, nz = 0;
        let ix, iy=0, iz, iystep = 0, ii=-1;
        for (let tmp of data) {
            ++ii;
            // xzLbl
            let vE = tmp[tmp.length-1];
            if (typeof(vE) == "string") {
                xzLbl[ii] = vE;
                // tmp末尾をpopすると元データを壊してしまうので、tmp配列をコピー
                let tmp2 = []
                for (let kk=0; kk < tmp.length-1; ++kk) {
                    tmp2.push(tmp[kk]);
                }
                tmp = tmp2;
            }
            ix = tmp[0];
            iz = tmp[1];
            plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
            iy += iystep;
        }
        points.push(plist);
    }
// console.log("xzLbl.len=", xzLbl.length);

    const nloop = points.length;

    let path3d = [];
    let nbPoints = 10;
    for (let iloop = 0; iloop < nloop; ++iloop) {
        // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points[iloop], nbPoints, true); // 20は分割数,閉曲線にする
        const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points[iloop], nbPoints);
        let _path3d = new BABYLON.Path3D(catmullRom.getPoints());
        path3d.push(_path3d);
        let curve = _path3d.getCurve();
        const meshLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);
console.log(" points.len=", points[iloop].length);
//console.log("_path3d.len=", _path3d.length);
console.log("  curve.len=", curve.length);

        // 駅を球で表現
        {
            for (let i = 0; i < curve.length; ++i) {
                if ((i%nbPoints) != 0) {
                    continue;
                }
                let j = Math.floor(i / nbPoints);
                if (j in xzLbl) {
//console.log("create Sphere  j=", j);
                    let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                    mesh.position = curve[i].clone();
                    // mesh.position.y += 0.5;
                    mesh.material = new BABYLON.StandardMaterial("mat");
                    mesh.material.emissiveColor = BABYLON.Color3.Yellow();
                    mesh.material.alpha = 0.3;
                }
            }
        }
    }

    let meshBoxList = [];
    const numMeshes = [2, 2, 2, 2,   2, 2, 2, 2]; // 車両数
    const line = [0, 0, 0, 0,   0, 0, 0, 0]; // ライン~=のぼり／くだり
    const trainSpan = [0.011]; // ラインごとの車両間隔
    const spdUnit = 0.001;
    const speedlist = [spdUnit, spdUnit, spdUnit, spdUnit, -spdUnit, -spdUnit, -spdUnit, -spdUnit]; // 位相ずれ（パーセント遅延）
    const pdelay = [0, 0.2, 0.5, 0.7,  0.1, 0.3, 0.6, 0.8]; // 位相ずれ（パーセント遅延）
    
    for (let iii = 0; iii < numMeshes.length; ++iii) {
        let iline = line[iii];
        let nmesh = numMeshes[iii];
        let _pdelay = pdelay[iii];
        for (let i = 0; i < nmesh; ++i) {
            // let box = BABYLON.MeshBuilder.CreateBox(`train${iii}.${i}`, {width:0.5, height:0.5, depth:1}, scene);
            let box = BABYLON.MeshBuilder.CreateBox(`train${iii}.${i}`, {width:0.1, height:0.1, depth:0.1}, scene);
            let box2 = BABYLON.MeshBuilder.CreateBox(`train${iii}.${i}`, {width:0.5, height:0.5, depth:1}, scene);
            if (iii < 4) {
                box2.position.x = -0.25;
                box2.material = new BABYLON.StandardMaterial("mat");
                box2.material.emissiveColor = BABYLON.Color3.Blue();
                // box2.material.alpha = 0.8;
            } else {
                box2.position.x = 0.25;
                box2.material = new BABYLON.StandardMaterial("mat");
                box2.material.emissiveColor = BABYLON.Color3.Red();
                // box2.material.alpha = 0.8;
            }
            box2.parent = box;
            meshBoxList.push({
                i: iline,
                mesh: box,
                speed: speedlist[iii], // 0.001,
                percentage: i*trainSpan[iline]+_pdelay
            });
        }
    }

    scene.onBeforeRenderObservable.add((scene) => {
        meshBoxList.forEach((minfo) => {
            minfo.percentage += minfo.speed;
            if (minfo.percentage > 1) minfo.percentage -= 1;
            if (minfo.percentage < 0) minfo.percentage += 1;
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


// export var createScene = createScene_draft10; // ゆりかもめ
// export var createScene = createScene_draft11; // ゆりかもめ＋駅
export var createScene = createScene_draft12; // ゆりかもめ＋駅＋上下

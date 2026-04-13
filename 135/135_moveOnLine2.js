// Babylon.js：Path3D 上のメッシュの動きに変化をつける試作

let getCourseData = function(icourse) {
    let plist = [];
    if (icourse==0) {
        // pSrc = new BABYLON.Vector3(2,1,0), ymin=-20;
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
    }
    return plist;
}

export var createScene_test5 = async function () {
    const scene = new BABYLON.Scene(engine);

    let icamera = 4;
    let icameralist = [0, 1, 2, 3, 4];
    let camera = null, cameraTrgMesh=null;
    let cameralist = [];
    var resetCameraView = function(camera) {
        while (scene.activeCameras.length > 0) {
            scene.activeCameras.pop();
        }
        scene.activeCameras.push(camera);
        for (let camera_ of cameralist) {
            camera_.dispose();
        }
        camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
    }
    let crCamera1 = function() {
        // ドライバーズビュー：対象(cameraTrgMesh)との距離を一定に保つ（旋回する／短距離をすすむ） .. 速度非依存
        //   lockedTarget に cameraTrgMesh (position) をセット、カメラ位置をcameraTrgMesh.positionよりやや後方に配置、cameraTrgMeshが透けることでドライバーズビューっぽく
        //   厳密に前方にカメラを置くなら、視点(lockedTarget)用のメッシュを前方に配置する必要あり。ひと手間かかるので、現状で
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera2 = function() {
        // バードビュー：対象(cameraTrgMesh)との距離を一定に保つ（旋回する／短距離をすすむ） .. 速度非依存
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera6 = function() {
        // ターゲットと並走
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 10, 10), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.useAutoRotationBehavior = true; // 自動でゆっくり回転
        return _camera;
    }
    let crCamera8 = function() {
        // 定点カメラ / render でカメラ位置を再計算
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 5, -1), scene);
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }

    var changeCamera = function(icamera) {
        console.log("icamera=",icamera)
        if (camera!=null) {camera.dispose();}
        if (icamera == -1) {
            // マウス操作で回転したり、ズーム操作
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100,-0.01), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
            resetCameraView(camera);
        }

        if (icamera == 0) {
            camera = crCamera1();
            // 4分割cameraからの復帰用にリセット
            resetCameraView(camera)
        }
        if (icamera == 1) {
            camera = crCamera2();
        }
        if (icamera == 2) {
            camera = crCamera6();
        }
        if (icamera == 3) {
            camera = crCamera8();
            // 4分割cameraからの復帰用にリセット
            resetCameraView(camera)
        }

        if (icamera == 4) {
            // 4分割(icamera=0-3) / 上記４カメラを１画面で
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralist.push(crCamera1())
            cameralist.push(crCamera2())
            cameralist.push(crCamera6())
            cameralist.push(crCamera8())
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
            }
            cameralist[0].viewport = new BABYLON.Viewport(0.0, 0.5, 0.495, 0.5); // 左上
            cameralist[1].viewport = new BABYLON.Viewport(0.5, 0.5, 0.500, 0.5); // 右上
            cameralist[2].viewport = new BABYLON.Viewport(0.0, 0.0, 0.495, 0.495); // 左下
            cameralist[3].viewport = new BABYLON.Viewport(0.5, 0.0, 0.500, 0.495); // 右下
        }
        if (((icamera == 4)) && cameraTrgMesh!=null) {
            for (let camera_ of cameralist) {
                camera_.lockedTarget = cameraTrgMesh;
            }
        } else if (icamera >= 0 && cameraTrgMesh!=null) {
            camera.lockedTarget = cameraTrgMesh;
        }
    }

    let renderCamera1 = function(camera_) {
        // 対象(cameraTrgMesh)の姿勢／進行方向から固定位置 .. ドライバーズビュー
        if (cameraTrgMesh == null) {return;}
        let quat = cameraTrgMesh.rotationQuaternion;
        if (quat == null) {return;}
        let vdir = new BABYLON.Vector3(0, 0, 0.01);
        // let vdir = new BABYLON.Vector3(0, 0, -0.1); // 速すぎると速度依存になる／移動速度を考慮して逆位置に置かないと
        vdir = vdir.applyRotationQuaternion(quat);
        camera_.position = cameraTrgMesh.position.add(vdir);
    }
    let renderCamera2 = function(camera_) {
        // 対象(cameraTrgMesh)の姿勢／進行方向から固定位置 .. 後方から見下ろす
        let quat = cameraTrgMesh.rotationQuaternion;
        if (quat == null) {return;}
        let vdir = new BABYLON.Vector3(0, 0.8, -8);
        vdir = vdir.applyRotationQuaternion(quat);
        camera_.position = cameraTrgMesh.position.add(vdir);
    }
    let renderCamera8 = function(camera_) {
        const distSqMax = 110;
        let distSq = BABYLON.Vector3.DistanceSquared(cameraTrgMesh.position, camera_.position);
        if (distSq > distSqMax) {
            // 進行方向にカメラ位置を移動させる（カーブの外側に再配置される可能性が高い）
            let quat = cameraTrgMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(Math.random()*2-1, Math.random()*2+1, 10);
            vdir = vdir.applyRotationQuaternion(quat);
            // // camera_.position.copyFrom(cameraTrgMesh.position.add(vdir));
            // 単純に（前方に一定距離）では、ラインから離れた位置になりがちなので、寄せるために近傍の点の周辺に再配置
            let p = cameraTrgMesh.position.add(vdir);
            // 最近傍位置 ncp
            let rate = path3dlist[dataMesh[0].iline].getClosestPositionTo(p);
            let ncp = path3dlist[dataMesh[0].iline].getPointAt(rate);
            // ライン上から水平にずらすためのベクトル v2
            let v2 = vdir.normalize().cross(BABYLON.Vector3.Up());
            camera_.position.copyFrom(ncp.add(v2.scale(3)));
        }
    }
    scene.onBeforeRenderObservable.add((scene) => {
        if (icamera == 0) { // freeCamera の場合の位置調整
            renderCamera1(camera);
        }
        if (icamera == 1) { // freeCamera の場合の位置調整
            renderCamera2(camera);
        }
        if (icamera == 3) {
            renderCamera8(camera);
        }
        if (icamera == 4) {
            renderCamera1(cameralist[0]);
            renderCamera2(cameralist[1]);
            renderCamera8(cameralist[3]);
        }
    });

    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    if (1) {
        let grndW=100, grndH=100;
        let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        meshGrnd.material = new BABYLON.GridMaterial("groundMaterial", scene);
        meshGrnd.material.majorUnitFrequency = 1; 
        meshGrnd.material.minorUnitVisibility  = 0.2;
    }

    // 複数ラインを作る
    let path3dlist = [];
    let dlist = [0.7, -0.7];
    let nline = dlist.length;
    {
        let plist = getCourseData(0);
        const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, 10, true);//closed
        const plist2 = catmullRom.getPoints();
        let n_ = plist2.length-1;
        for (let d of dlist) {
            let plist3 = [], p1, p2;
            for (let i = 0; i < n_; ++i) {
                p1 = plist2[i];
                p2 = plist2[i+1];
                let vec = p2.subtract(p1).normalize(); // 法線方向
                let vB = vec.cross(BABYLON.Vector3.Up()); // 従法線
                let p = p1.add(vB.scale(d));
                plist3.push(p);
            }
            // plist2 の 始点と終点が同じ座標。plist3では終点を再度追加する
            plist3.push(plist3[plist3.length-1]);
            let meshC = BABYLON.MeshBuilder.CreateLines("lines", {points: plist3}, scene);
            let path3d = new BABYLON.Path3D(plist3);
            path3dlist.push(path3d);
        }
    }

    let dataMesh = [];
    const v1 = 0.0005, v1min = 0.0003, v1max = 0.0020;
    const v2 = 0.0008, v2min = 0.0005, v2max = 0.0025;
    let metaListList = [
        [{r:0.0, v:v1, vmin:v1min, vmax:v1max},
         {r:0.3, v:v1, vmin:v1min, vmax:v1max},
         {r:0.6, v:v1, vmin:v1min, vmax:v1max},
         {r:0.9, v:v1, vmin:v1min, vmax:v1max},
        ],
        [{r:0.1, v:v2, vmin:v2min, vmax:v2max},
         {r:0.4, v:v2*1.7, vmin:v2min, vmax:v2max},
         {r:0.8, v:v2, vmin:v2min, vmax:v2max},
        ],
    ];
    console.assert(path3dlist.length == metaListList.length);

    let iline = -1;
    for (let metaList of metaListList) {
        ++iline;
        let i = -1;
        for (let meta of metaList) {
            ++i;
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.5, height:0.5, depth:1.5});
            mesh.material = new BABYLON.StandardMaterial("");
            if (iline == 0 && i == 0) {
                mesh.material.emissiveColor = BABYLON.Color3.Red();
                cameraTrgMesh = mesh;
            } else {
                mesh.material.emissiveColor = BABYLON.Color3.Random();
            }
            mesh.position.copyFrom(path3dlist[iline].getPointAt(meta.r));
            dataMesh.push({
                idx:i,
                iline:iline,
                r:meta.r,
                v:meta.v,
                vmin:meta.vmin,
                vmax:meta.vmax,
                p:mesh.position.clone(),
                pold: new BABYLON.Vector3(0,0,0),
                mesh:mesh,
                // path3d:path3dlist[iline],
            })
        }
    }

    scene.onBeforeRenderObservable.add(() => {
        dataMesh.forEach((data) => {
            let idx = data.idx;
            // let path3d = data.path3d;
            let path3d = path3dlist[data.iline];
            data.r += data.v;
            if (data.r >= 1) data.r -= 1;
            data.pold.copyFrom(data.p);
            data.mesh.position.copyFrom(path3d.getPointAt(data.r));
            data.p.copyFrom(data.mesh.position);
            let vec = data.p.subtract(data.pold).normalize();
            // 進行方向(接線方向)に対する上方向(主法線)を求める
            let vB = vec.cross(BABYLON.Vector3.Up()); // 従法線
            let vN = vB.cross(vec).normalize(); // 主法線
            // 方向ベクトルからクォータニオンを作成
            data.mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(vec, vN);
            data.mesh.lookAt(data.p.add(vec));
            // vecの仰角に応じて v を変化させる
            let vecXZ = Math.sqrt((vec.x)**2 + (vec.z)**2);
            let rad = Math.atan(vec.y/vecXZ);
            const a = 0.00003;
            if (vec.y >= 0) {
                data.v += a*Math.sin(-rad);
                data.v = Math.max(data.v, data.vmin);
            } else {
                data.v += a*Math.sin(-rad);
                data.v = Math.min(data.v, data.vmax);
            }
        });
    })

    // Input to direction
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            // 加速・減速
            if (kbInfo.event.key === 'w') {
                dataMesh[0].v += 0.00002;
                dataMesh[0].v = Math.min(dataMesh[0].v, dataMesh[0].vmax);
            }
            if (kbInfo.event.key === 's') {
                dataMesh[0].v -= 0.0001;
                dataMesh[0].v = Math.max(dataMesh[0].v, dataMesh[0].vmin);
            }
            // ライン変更
            if (kbInfo.event.key === 'd') {
                let iline_ = dataMesh[0].iline;
                dataMesh[0].iline = Math.min(dataMesh[0].iline+1, nline-1);
                if (iline_ != dataMesh[0].iline) {
                    // ライン変更時に位置がズレるので最近傍の点で位置を再取得する
                    let p = path3dlist[iline_].getPointAt(dataMesh[0].r);
                    let rate = path3dlist[dataMesh[0].iline].getClosestPositionTo(p);
                    dataMesh[0].r = rate;
                }
            }
            if (kbInfo.event.key === 'a') {
                let iline_ = dataMesh[0].iline;
                dataMesh[0].iline = Math.max(dataMesh[0].iline-1, 0);
                if (iline_ != dataMesh[0].iline) {
                    // ライン変更時に位置がズレるので最近傍の点で位置を再取得する
                    let p = path3dlist[iline_].getPointAt(dataMesh[0].r);
                    let rate = path3dlist[dataMesh[0].iline].getClosestPositionTo(p);
                    dataMesh[0].r = rate;
                }
            }
            // カメラ変更
            if ((kbInfo.event.key == 'c')||(kbInfo.event.key == 'C')) {
                let i = icameralist.indexOf(icamera);
                if (kbInfo.event.key == 'C') {
                    i = (i+icameralist.length-1) % icameralist.length;
                } else {
                    i = (i+1) % icameralist.length;
                }
                icamera=icameralist[i];
                changeCamera(icamera);
            }
        }
    });

    changeCamera(icamera);

    return scene;
}
export var createScene = createScene_test5;

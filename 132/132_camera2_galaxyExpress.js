// コース チェック 用

// 
//  - space/enter      .. カメラ切り替え
//  - 1/2/3/4/5/6/7/8  .. ８カメ表示時のメインカメラの切り替え
//  - x/z              .. 被写体（列車）切り替え
//  - n/b              .. ステージ切り替え

export var createScene_008 = async function () {

    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R270 = Math.PI*3/2;
    const R360 = Math.PI*2;

    // const fpathParticle = "textures/particle.png";
    // const SCRIPT_URL22 = "./CourseData6.js";
    // const goalPath ="textures/checker.jpg";
    // const skyboxTextPath9 = "textures/zgrid3";

    const fpathParticle = "../124/textures/particle.png";
    const SCRIPT_URL22 = "./CourseData6.js";
    const goalPath ="../123/textures/checker.jpg";
    // const skyboxTextPath9 = "../125/textures/zgrid3";

    // const skyboxTextPathList = [skyboxTextPath9];
    // let skyboxType=0; // tropical/ grid

    let CourseData4 = null;
    await import(SCRIPT_URL22).then((obj) => { CourseData4 = obj; });

    const dbase = "textures/course3/"

    let icamera = 0, ncamera = 11;
    icamera = 10;

    let istage=0;

    const stageList = [
        // // id, ttype, tlabel, tpath
        // [[900004], "全国-train(複)", dbase+""], // 0
        // [[900104], "中部-train(複)", dbase+""], // 0
        // [[900204], "北陸", dbase+""], // 0
        // [[900304], "金沢", dbase+""], // 0
        // [[900404], "関西", dbase+""], // 0
        // [[900504], "九州", dbase+""], // 0
        // [[900604], "学生", dbase+""], // 0
        // [[900704], "東北", dbase+""], // 0

        [[900004, 900104, 900205, 900304, 900404, 900504, 900604, 900704], "全国-中部-北陸-金沢-関西-九州-学生-東北", dbase+""], // 0
        [[900004,900105,900205],  "全国(N)-中部(Slow)-北陸(Fast)", dbase+""], // 0
        [[900004,900105],  "全国(N)-中部-(Slow)", dbase+""], // 0
    ];

    // stageList の ttype=0 の情報
    // const metaStageInfo = {
    const stageGeoMap = {
        900004:{iy:0.05, scale:0.5, grnd:0, adjx:-250, adjz:250,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00015, trainPad:-0.0008, trainNs:[8,6,4,2], trainPini:[0,0.3,0.6,0.8],
                data :CourseData4.DATA.rt2025AllJapan.xzR,
               },
        900005:{iy:0.05, scale:0.5, grnd:0, adjx:-250, adjz:250,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00004, trainPad:-0.0008, trainNs:[8,6,4,2], trainPini:[0,0.3,0.6,0.8],
                data :CourseData4.DATA.rt2025AllJapan.xzR,
               },

        900104:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:100, adjy:10, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00025, trainPad:-0.00088, trainNs:[8,8,6], trainPini:[0,0.3,0.6],
                data :CourseData4.DATA.rt2025Chubu.xzR,
               },
        900105:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:100, adjy:10, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00004, trainPad:-0.00088, trainNs:[12,12,12,12], trainPini:[0,0.2,0.5,0.7],
                data :CourseData4.DATA.rt2025Chubu.xzR,
               },

        900204:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:20, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00020, trainPad:-0.00077, trainNs:[8,8,6], trainPini:[0,0.3,0.6],
                data :CourseData4.DATA.rt2025HokurikuShinetsu.xzR,
               },
        900205:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:20, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.0007, trainPad:-0.00077, trainNs:[20], trainPini:[0],
                data :CourseData4.DATA.rt2025HokurikuShinetsu.xzR,
               },

        900304:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:30, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00020, trainPad:-0.00090, trainNs:[8,8,6], trainPini:[0,0.3,0.6],
                data :CourseData4.DATA.rt2025Kanazawa.xzR,
               },
        900305:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:30, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00005, trainPad:-0.0009, trainNs:[8,8,6], trainPini:[0,0.3,0.6],
                data :CourseData4.DATA.rt2025Kanazawa.xzR,
               },

        900404:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:40, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00017, trainPad:-0.00093, trainNs:[8,8,6], trainPini:[0,0.3,0.6],
                data :CourseData4.DATA.rt2025Kansai.xzR,
               },
        900405:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:40, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00005, trainPad:-0.00093, trainNs:[8,8,6], trainPini:[0,0.3,0.6],
                data :CourseData4.DATA.rt2025Kansai.xzR,
               },

        900504:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:50, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00020, trainPad:-0.0008, trainNs:[8,8,6], trainPini:[0,0.3,0.6],
                data :CourseData4.DATA.rt2025Kyusyu.xzR,
               },
        900505:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:50, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00005, trainPad:-0.0008, trainNs:[8,8,6], trainPini:[0,0.3,0.6],
                data :CourseData4.DATA.rt2025Kyusyu.xzR,
               },

        900604:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:60, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00018, trainPad:-0.00085, trainNs:[40,30], trainPini:[0,0.5],
                data :CourseData4.DATA.rt2025Student.xzR,
               },
        900605:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:60, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00005, trainPad:-0.00085, trainNs:[40,30], trainPini:[0,0.5],
                data :CourseData4.DATA.rt2025Student.xzR,
               },

        900704:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:70, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00020, trainPad:-0.0010, trainNs:[8,8,6], trainPini:[0,0.3,0.6],
                data :CourseData4.DATA.rt2025Tohoku.xzR,
               },
        900705:{iy:0.05, scale:0.5, grndW:4, grndH:3, adjx:-250, adjz:150, adjy:70, grnd:0,
                dtype:"xzR", stageType:'lineTrain', trainSpd:0.00005, trainPad:-0.0010, trainNs:[8,8,6], trainPini:[0,0.3,0.6],
                data :CourseData4.DATA.rt2025Tohoku.xzR,
               },

    };

    let nstage = stageList.length;

    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#404040'))

    let camera = null, myMesh=null;
    let myMeshCandiList = []; // myMesh候補
    let imyMeshCandi = 0;
    let cameralist = [];
    let cameralistView = []; //  icamera=10時の配置用
    let icamera10 = 0;
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
    let crCamera0 = function() {
        // フローカメラを使ったバードビュー／追跡（遅いドローン）
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 5;
        _camera.heightOffset = 2;
        _camera.cameraAcceleration = 0.002;
        _camera.maxCameraSpeed = 30;
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera1 = function() {
        // ドライバーズビュー：対象(myMesh)との距離を一定に保つ（旋回する／短距離をすすむ） .. 速度非依存
        //   lockedTarget に myMesh (position) をセット、カメラ位置をmyMesh.positionよりやや後方に配置、myMeshが透けることでドライバーズビューっぽく
        //   厳密に前方にカメラを置くなら、視点(lockedTarget)用のメッシュを前方に配置する必要あり。ひと手間かかるので、現状で
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        // _camera.setTarget(new BABYLON.Vector3(0, 1, 10));
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera2 = function() {
        // バードビュー：対象(myMesh)との距離を一定に保つ（旋回する／短距離をすすむ） .. 速度非依存
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        // _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera3 = function() {
        // 先行して前方、ちょい下から前面を煽り見る
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        // ArcRotateでも同じ
        // _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100,-0.01), scene);
        //  _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        // _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
        return _camera;
    }
    let crCamera5 = function() {
        // 上空から見下ろすトップビュー
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100,-0.01), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
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
    let crCamera7 = function() {
        // ターゲットを周回
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 20, -10), scene);
        if (myMesh != null) {
            _camera.lockedTarget = myMesh;
        }
        _camera.attachControl(canvas, true);
        _camera._irad = 0;
        _camera._iradStep = 0.01;
        _camera._r = 15;
        _camera._h = 2;
        // _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera8 = function() {
        // 定点カメラ / render でカメラ位置を再計算
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 20, -10), scene);
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

            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }

        if (icamera == 0) {
            camera = crCamera0();
            // 4分割cameraからの復帰用にリセット
            resetCameraView(camera)
        }
        if (icamera == 1) {
            camera = crCamera1();
        }
        if (icamera == 2) {
            camera = crCamera2();
        }
        if (icamera == 3) {
            camera = crCamera3();
            // 4分割cameraからの復帰用にリセット
            resetCameraView(camera)
        }

        if (icamera == 4) {
            // 4分割(icamera=0-3) / 上記４カメラを１画面で
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralist.push(crCamera0())
            cameralist.push(crCamera1())
            cameralist.push(crCamera2())
            cameralist.push(crCamera3())
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

        if (icamera == 5) {
            camera = crCamera5();
            resetCameraView(camera);
        }
        if (icamera == 6) {
            camera = crCamera6();
        }
        if (icamera == 7) {
            camera = crCamera7();
        }
        if (icamera == 8) {
            camera = crCamera8();
            resetCameraView(camera);
        }

        if (icamera == 9) {
            // 4分割(icamera=5-8) / 上記４カメラを１画面で
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralist.push(crCamera5())
            cameralist.push(crCamera6())
            cameralist.push(crCamera7())
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

        if (icamera == 10) {
            // 全カメラ
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralistView = [];
            cameralist.push(crCamera0())
            cameralist.push(crCamera1())
            cameralist.push(crCamera2())
            cameralist.push(crCamera3())
            cameralist.push(crCamera5())
            cameralist.push(crCamera6())
            cameralist.push(crCamera7())
            cameralist.push(crCamera8())
            // activeCameraをクリア
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            // activeCameraを再設定
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            changeViewportFor10(icamera10)
        }

        if (((icamera == 4) || (icamera == 9) || (icamera == 10)) && myMesh!=null) {
            for (let camera_ of cameralist) {
                camera_.lockedTarget = myMesh;
            }
        } else if (icamera >= 0 && myMesh!=null) {
            camera.lockedTarget = myMesh;
        }
    }
    // icamera=10時のviewport変更
    //   icamをメインに他をサブにする
    let changeViewportFor10 = function(icam) {
        cameralistView = [];
        cameralistView.push(cameralist[icam]);
        for (let i = 0; i < cameralist.length; ++i) {
            if (i == icam) {continue;}
            cameralistView.push(cameralist[i]);
        }
        // カメラ(大)
        cameralistView[0].viewport = new BABYLON.Viewport(0.0, 0.0, 0.745, 0.74); // 左下
        // カメラ(小)：左上から右上
        cameralistView[1].viewport = new BABYLON.Viewport(0.0, 0.75, 0.245, 0.25); // 左上
        cameralistView[2].viewport = new BABYLON.Viewport(0.25, 0.75, 0.245, 0.25);
        cameralistView[3].viewport = new BABYLON.Viewport(0.5 , 0.75, 0.245, 0.25);
        cameralistView[4].viewport = new BABYLON.Viewport(0.75, 0.75, 0.25, 0.25); // 右上
        // 右上から右下
        cameralistView[5].viewport = new BABYLON.Viewport(0.75, 0.50, 0.25, 0.24); // 右上
        cameralistView[6].viewport = new BABYLON.Viewport(0.75, 0.25, 0.25, 0.24);
        cameralistView[7].viewport = new BABYLON.Viewport(0.75, 0.0 , 0.25, 0.24); // 右下
    }

    let renderCamera1 = function(camera_) {
        // 対象(myMesh)の姿勢／進行方向から固定位置 .. ドライバーズビュー
        let quat = myMesh.rotationQuaternion;
        let vdir = new BABYLON.Vector3(0, 0, 0.01);
        // let vdir = new BABYLON.Vector3(0, 0, -0.1); // 速すぎると速度依存になる／移動速度を考慮して逆位置に置かないと
        vdir = vdir.applyRotationQuaternion(quat);
        camera_.position = myMesh.position.add(vdir);
    }
    let renderCamera2 = function(camera_) {
        // 対象(myMesh)の姿勢／進行方向から固定位置 .. 後方から見下ろす
        let quat = myMesh.rotationQuaternion;
        let vdir = new BABYLON.Vector3(0, 0.8, 8);
        vdir = vdir.applyRotationQuaternion(quat);
        camera_.position = myMesh.position.add(vdir);
    }
    let renderCamera3 = function(camera_) {
        // 対象(myMesh)の姿勢／進行方向から固定位置 .. 先行して前方、ちょい下から前面を煽り見る
        let quat = myMesh.rotationQuaternion;
        let vdir = new BABYLON.Vector3(0.5, -0.1, -5);
        vdir = vdir.applyRotationQuaternion(quat);
        camera_.position = myMesh.position.add(vdir);
    }
    let renderCamera7 = function(camera_) {
        // 対象(myMesh)の周辺を周回する
        let x = camera_._r * Math.cos(camera_._irad);
        let z = camera_._r * Math.sin(camera_._irad);
        let vdir = new BABYLON.Vector3(x, camera_._h, z);
        camera_.position.copyFrom(myMesh.position.add(vdir));
        camera_._irad += camera_._iradStep;
        if (camera_._irad > R360) { camera_._irad -= R360;}
    }
    let renderCamera8 = function(camera_) {
        const distSqMax = 11000;
        let distSq = BABYLON.Vector3.DistanceSquared(myMesh.position, camera_.position);
        if (distSq > distSqMax) {
            // 進行方向にカメラ位置を移動させる（カーブの外側に再配置される可能性が高い）
            let quat = myMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(Math.random()*2-1, Math.random()*2+2, -100);
            vdir = vdir.applyRotationQuaternion(quat);
            // // camera_.position.copyFrom(myMesh.position.add(vdir));
            // 単純に（前方に一定距離）では、ラインから離れた位置になりがちなので、寄せるために近傍の点の周辺に再配置
            let p = myMesh.position.add(vdir);
            // 最近傍位置 ncp
            let rate = myMesh._path3d.getClosestPositionTo(p);
            let ncp = myMesh._path3d.getPointAt(rate);
            // ライン上から水平にずらすためのベクトル v2
            let v2 = vdir.normalize().cross(BABYLON.Vector3.Up());
            camera_.position.copyFrom(ncp.add(v2.scale(3)));
        }
    }
    scene.onBeforeRenderObservable.add((scene) => {
        if (icamera == 1) { // freeCamera の場合の位置調整
            renderCamera1(camera);
        }
        if (icamera == 2) { // freeCamera の場合の位置調整
            renderCamera2(camera);
        }
        if (icamera == 3) {
            renderCamera3(camera);
        }

        if (icamera == 4) {
            renderCamera1(cameralist[1]);
            renderCamera2(cameralist[2]);
            renderCamera3(cameralist[3]);
        }

        if (icamera == 7) {
            renderCamera7(camera);
        }
        if (icamera == 8) {
            renderCamera8(camera);
        }

        if (icamera == 9) {
            renderCamera7(cameralist[2]);
            renderCamera8(cameralist[3]);
        }

        if (icamera == 10) {
            renderCamera1(cameralist[1]);
            renderCamera2(cameralist[2]);
            renderCamera3(cameralist[3]);
            renderCamera7(cameralist[6]);
            renderCamera8(cameralist[7]);
        }

    });

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);


    // ----------------------------------------

    let meshAggInfo = []; // mesh, agg;
    let meshes = []; // for CNS
    let pStart = new BABYLON.Vector3(0, 0, 0);
    let pStart2 = new BABYLON.Vector3(0, 0, 0); // pStart位置の方向のために
    let pGoal = new BABYLON.Vector3(0, 0, 0);
    let meshgatelist = [];
    let dataTrainList = [];
    let bTrain = false;

    var createStage = function(istage) {
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }
        myMeshCandiList = [];
        dataTrainList = [];
        bTrain = false;

        // --------------------
        // step.1  コースの点列となるサンプリング点　取得

        // let metaStageInfo = getMetaStageInfo(istage)
        let metaStageInfoList = [];
        let [ids, tlabel, tpath] = stageList[istage];
        console.log("\ni=",istage, tlabel);
        setText2(tlabel);
        if ((typeof ids) == "number") {
            let id = ids;
            if (id in stageGeoMap) {
                let metaStageInfo = stageGeoMap[id];
                metaStageInfoList.push(metaStageInfo);
            } else {
                console.log("\nid="+id+" not in stageGeoMap");
            }
        } else {
            for (let id of ids) {
                if (id in stageGeoMap) {
                    let metaStageInfo = stageGeoMap[id];
                    metaStageInfoList.push(metaStageInfo);
                } else {
                    console.log("\nid="+id+" not in stageGeoMap");
                }
            }
        }

        for (let metaStageInfo of metaStageInfoList) {
            let stageType = typeof(metaStageInfo.stageType) !== 'undefined' ? metaStageInfo.stageType : "extrude";
            let useSpline = typeof(metaStageInfo.useSpline) !== 'undefined' ? metaStageInfo.useSpline : true;
            let nbPoints = typeof(metaStageInfo.nbPoints) !== 'undefined' ? metaStageInfo.nbPoints : 20;
            let pStartIdx = typeof(metaStageInfo.pStartIdx) !== 'undefined' ? metaStageInfo.pStartIdx:10;
            let pCPq0Idx = typeof(metaStageInfo.pCPq0Idx) !== 'undefined' ? metaStageInfo.pCP0Idx:20;
            let pCPq1Idx = typeof(metaStageInfo.pCPq1Idx) !== 'undefined' ? metaStageInfo.pCP0Idx:0.25;
            let pCPq2Idx = typeof(metaStageInfo.pCPq2Idx) !== 'undefined' ? metaStageInfo.pCP0Idx:0.5;
            let pCPq3Idx = typeof(metaStageInfo.pCPq3Idx) !== 'undefined' ? metaStageInfo.pCP0Idx:0.75;
            let pCPq4Idx = typeof(metaStageInfo.pCPq4Idx) !== 'undefined' ? metaStageInfo.pCP0Idx:-20;
            let isLoopCourse = typeof(metaStageInfo.isLoopCourse) !== 'undefined' ? metaStageInfo.isLoopCourse : true;
            let endRound = typeof(metaStageInfo.endRound) !== 'undefined' ? metaStageInfo.endRound : 0;
            let iy = typeof(metaStageInfo.iy) !== 'undefined' ? metaStageInfo.iy : 5;
            let iystep = typeof(metaStageInfo.iystep) !== 'undefined' ? metaStageInfo.iystep : 0;
            let grnd = typeof(metaStageInfo.grnd) !== 'undefined' ? metaStageInfo.grnd : 1;
            let grndW = typeof(metaStageInfo.grndW) !== 'undefined' ? metaStageInfo.grndW : 200;
            let grndH = typeof(metaStageInfo.grndH) !== 'undefined' ? metaStageInfo.grndH : 200;
            let scale = typeof(metaStageInfo.scale) !== 'undefined' ? metaStageInfo.scale : 1;
            let scaleY = typeof(metaStageInfo.scaleY) !== 'undefined' ? metaStageInfo.scaleY : 1;
            let adjx = typeof(metaStageInfo.adjx) !== 'undefined' ? metaStageInfo.adjx : 0;
            let adjy = typeof(metaStageInfo.adjy) !== 'undefined' ? metaStageInfo.adjy : 0;
            let adjz = typeof(metaStageInfo.adjz) !== 'undefined' ? metaStageInfo.adjz : 0;
            let tubeRadius = typeof(metaStageInfo.tubeRadius) !== 'undefined' ? metaStageInfo.tubeRadius : 3;
            let tubeCAP = typeof(metaStageInfo.tubeCAP) !== 'undefined' ? metaStageInfo.tubeCAP : BABYLON.Mesh.NO_CAP ;
            let nz = typeof(metaStageInfo.nz) !== 'undefined' ? metaStageInfo.nz : 0;
            let pQdiv = typeof(metaStageInfo.pQdiv) !== 'undefined' ? metaStageInfo.pQdiv : 0;
            let pQlist = typeof(metaStageInfo.pQlist) !== 'undefined' ? metaStageInfo.pQlist : [];
            let pQdbg = typeof(metaStageInfo.pQdbg) !== 'undefined' ? metaStageInfo.pQdbg : 0;
            let cnsCS = typeof(metaStageInfo.cnsCS) !== 'undefined' ? metaStageInfo.cnsCS : 0.1;
            let cnsWalkableHeight = typeof(metaStageInfo.cnsWalkableHeight) !== 'undefined' ? metaStageInfo.cnsWalkableHeight : 2;
            let cnsWalkableClimb = typeof(metaStageInfo.cnsWalkableClimb) !== 'undefined' ? metaStageInfo.cnsWalkableClimb : 2;
            let cnsRadius = typeof(metaStageInfo.cnsRadius) !== 'undefined' ? metaStageInfo.cnsRadius : 0.8;
            let cnsReachRadius = typeof(metaStageInfo.cnsReachRadius) !== 'undefined' ? metaStageInfo.cnsReachRadius : 5;
            let cnsNAgent = typeof(metaStageInfo.cnsNAgent) !== 'undefined' ? metaStageInfo.cnsNAgent : 10;
            let cnsAccelX = typeof(metaStageInfo.cnsAccelX) !== 'undefined' ? metaStageInfo.cnsAccelX : 1;
            let cnsSpeedX = typeof(metaStageInfo.cnsSpeedX) !== 'undefined' ? metaStageInfo.cnsSpeedX : 1;
            let cnsCollisionQueryRange = typeof(metaStageInfo.cnsCollisionQueryRange) !== 'undefined' ? metaStageInfo.cnsCollisionQueryRange : 0.5;
            let cnsSeparationWeight = typeof(metaStageInfo.cnsSeparationWeight) !== 'undefined' ? metaStageInfo.cnsSeparationWeight : 3;
            let bubbleEnable = typeof(metaStageInfo.bubbleEnable) !== 'undefined' ? metaStageInfo.bubbleEnable : false;
            let reverse = typeof(metaStageInfo.reverse) !== 'undefined' ? metaStageInfo.reverse : false; // 逆走
            let soloEnable = typeof(metaStageInfo.soloEnable) !== 'undefined' ? metaStageInfo.soloEnable : false;
            let mZRot = typeof(metaStageInfo.mZRot) !== 'undefined' ? metaStageInfo.mZRot : {};
            let xzLbl = typeof(metaStageInfo.xzLbl) !== 'undefined' ? metaStageInfo.xzLbl : {};
            let trainNs = typeof(metaStageInfo.trainNs) !== 'undefined' ? metaStageInfo.trainNs : [8]; // 車両数
            let trainPini = typeof(metaStageInfo.trainPini) !== 'undefined' ? metaStageInfo.trainPini : [0]; // 初期位置
            let trainSpd = typeof(metaStageInfo.trainSpd) !== 'undefined' ? metaStageInfo.trainSpd : 0.0002;
            let trainPad = typeof(metaStageInfo.trainPad) !== 'undefined' ? metaStageInfo.trainPad : -0.0008;
            let plist = [];

            console.assert(trainNs.length == trainPini.length);

            // --------------------
            // step.2  点列情報の加工（メッシュ用の点列 plist3 を作成）
            let plist3 = [];
            {
                if(metaStageInfo.dtype=='xz') {
                    // 画像から抜き出した座標をそのまま使う版
                    let ix, iz, ii=-1;
                    for (let tmp of metaStageInfo.data) {
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

                } else if(metaStageInfo.dtype=='xzR') {
                    // ４番目の引数で等差、１つ前の点との距離で差分を調整
                    // let iyrate = metaStageInfo.iystep, ii=-1, ix, iz, dis, iy_, iystep;
                    let iyrate = iystep*scale/5, ii=-1, ix, iz, dis, iy_;
                    let [ix_, iz_, xxx] = metaStageInfo.data[0];
                    for (let tmp of metaStageInfo.data) {
                        ++ii;
                        // 末尾にラベルがあれば切り取る
                        let vE = tmp[tmp.length-1];
                        if (typeof(vE) == "string") {
                            xzLbl[ii] = vE;
                            let tmp2 = tmp.slice(0, tmp.length-1);
                            tmp = tmp2;
                        }
                        // １レコードのカラム数に応じた処理
                        if (tmp.length == 2) {
                            // [x,z]座標のみ
                            [ix,iz] = tmp;
                            dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                            iystep = iyrate*dis;
                            iy += iystep;
                            plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                        } else if (tmp.length == 3) {
                            // [x,z]座標＋高さ（絶対座標）
                            [ix,iz,iy_] = tmp;
                            if (iy_ == null) {
                                dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                                iystep = iyrate*dis;
                                iy += iystep;
                                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                            } else {
                                iy = iy_ + iystep;
                                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy_*scaleY+adjy, (nz-iz)*scale+adjz));
                            }
                        } else if (tmp.length == 4) {
                            // [x,z]座標＋高さ（絶対座標）＋高さ傾き
                            [ix,iz,iy_, iyrate] = tmp;
                            iyrate *= scale/5;
                            if (iy_ == null) {
                                dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                                iystep = iyrate*dis;
                                iy += iystep;
                                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                            } else {
                                iy = iy_ + iystep;
                                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy_*scaleY+adjy, (nz-iz)*scale+adjz));
                            }
                        }
                        [ix_,iz_] = [ix,iz];
                    }

                } else if(metaStageInfo.dtype=='xzRR') {
                    // ４番目の引数で等差、１つ前の点との距離で差分を調整
                    // ５番目の引数で回転角
                    let iyrate = iystep*scale/5, ii=-1, ix=0, iz=0, dis, ix_, iz_, iy_, jj=-1, zRot=0, zRot_, _iyrate;
                    let iystep2=iystep, iyrate2=iystep2*scale/5, ix2=0, iz2=0, iy2=iy, _iyrate2;
                    let iy_2, zRot_2, zRot2=0;
                    if (metaStageInfo.data[0].length != 5) {
                        console.log("length=", metaStageInfo.data[0].length, metaStageInfo.data[0]);
                        console.assert(metaStageInfo.data[0].length == 5);
                    }
                    let tmp = metaStageInfo.data[0];
                    ix_ = (tmp.length >= 1) ? tmp[0] : 0;
                    iz_ = (tmp.length >= 2) ? tmp[1] : 0;
                    iyrate = (tmp.length >= 4) ? tmp[3] : 0;
                    zRot = (tmp.length >= 5) ? tmp[4] : 0;

                    for (let tmp of metaStageInfo.data) {
                        ++ii; ++jj;
                        // xzLbl
                        let vE = tmp[tmp.length-1];
                        if (typeof(vE) == "string") {
                            xzLbl[ii] = vE;
                            let tmp2 = tmp.slice(0, tmp.length-1);
                            tmp = tmp2;
                        }

                        {
                            ix = tmp[0];
                            iz = tmp[1];
                            iy_ = (tmp.length >= 3) ? tmp[2] : null;  // 高さ 絶対値
                            _iyrate = (tmp.length >= 4) ? tmp[3] : null; // 高さ 傾き
                            zRot_ = (tmp.length >= 5) ? tmp[4] : null;  // ロール
                            if (_iyrate !== null) {
                                iyrate = _iyrate * scale/5;
                            }
                            if (zRot_ !== null) {
                                zRot = zRot_;
                            }
                            if (iy_ === null) {
                                dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                                iystep = iyrate*dis;
                                iy += iystep;
                                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                            } else {
                                iy = iy_ + iystep;
                                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy_*scaleY+adjy, (nz-iz)*scale+adjz));
                            }
                            if (useSpline) {
                                for (let j = 0; j < nbPoints; ++j, ++jj) {
                                    mZRot[jj] = zRot;
                                }
                            } else {
                                mZRot[jj] = zRot;
                            }
                        }
                        [ix_,iz_] = [ix,iz];
                    }

                } else if(metaStageInfo.dtype=='xzy') {
                    // 高さを手動で指定した版
                    // .. カスタムでコースを作成する場合も
                    let ii =-1, ix, iz, iy;
                    for (let tmp of metaStageInfo.data) {
                        ++ii;
                        // xzLbl
                        let vE = tmp[tmp.length-1];
                        if (typeof(vE) == "string") {
                            xzLbl[ii] = vE;
                            let tmp2 = tmp.slice(0, tmp.length-1);
                            tmp = tmp2;
                        }

                        ix = tmp[0];
                        iz = tmp[1];
                        iy = tmp[2];
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                    }
                }

                // ------------------------------

                let plist2 = []
                if(useSpline) {
                    // 上記で取得した点列を、スプラインで補間
                    const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
                    plist2 = catmullRom.getPoints();
                } else {
                    plist2 = plist;
                }

                if (isLoopCourse) {
                    // 始点、２番目を末尾に追加／ループとする
                    // 3D的なループにするには始点だけでは途切れるっぽいので２番目も
                    let p0 = plist2[0];
                    plist2.push(new BABYLON.Vector3(p0.x, p0.y, p0.z));
                    p0 = plist2[1];
                    plist2.push(new BABYLON.Vector3(p0.x, p0.y, p0.z));
                }

                // 目的地／中継地取得用の座標値列
                plist3 = plist2;
                if (reverse) {
                    plist3 = plist2.slice().reverse();
                }
            }

            if (1) {
                pStart = plist3[pStartIdx].clone();
                pStart2 = plist3[pStartIdx+2].clone();
                pGoal = plist3[plist3.length-10].clone();

                if (pQdbg) {
                    // デバッグ表示、plist の位置を球で表示
                    let r = 1, c;
                    if (pQlist.length > 0) {
                        for (let p of pQ) {
                            let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                            mesh.position = p.clone();
                            mesh.position.y += 1.5;
                        }
                    }
                    let nR = nbPoints*10;
                    let nY = nbPoints;
                    let j;
                    for (let i = 0; i < plist3.length; ++i) {
                        if ((i%nR) == 0) {
                            r = 1.5;
                            c = BABYLON.Color3.Red();
                        } else if ((i%nY) == 0) {
                            r = 0.5;
                            c = BABYLON.Color3.Yellow();
                        } else {
                            continue;
                        }
                        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: r}, scene);
                        mesh.position = plist3[i].clone();
                        mesh.position.y += 0.5; // r;
                        mesh.material = new BABYLON.StandardMaterial("mat");
                        mesh.material.emissiveColor = c;
                        mesh.material.alpha = 0.3;
                        {
                            j = Math.floor(i / nbPoints);
                            if (j in xzLbl) {
                                let setTextMesh = function(mesh,text) {
                                    let dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", {width:80, height:60}, scene);
                                    let font = "16px Arial";
                                    dynamicTexture.hasAlpha = true;
                                    dynamicTexture.drawText(text, null, null, font, "white", "transparent");
                                    let mat = new BABYLON.StandardMaterial("mat", scene);
                                    mat.diffuseTexture = dynamicTexture;
                                    mesh.material = mat;
                                }
                                let meshLbl = BABYLON.MeshBuilder.CreatePlane("mLbl"+j, {size:12, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                                meshLbl.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;   
                                meshLbl.position.y += 0.5;
                                meshLbl.parent = mesh;
                                let lbltext = xzLbl[j];
                                setTextMesh(meshLbl, lbltext)
                            }
                        }
                        meshAggInfo.push([mesh,null]);
                    }
                }

                // --------------------
                // step3. コースメッシュ作成
console.log("stageType=",stageType);
                if (stageType=='line') {
                    // line で表示
                    let mesh = BABYLON.MeshBuilder.CreateLines("lines", {points: plist3}, scene);
                    meshAggInfo.push([mesh,null]);
                }

                if (stageType=='lineTrain') {
                    let path3d = new BABYLON.Path3D(plist3);
                    let trainColor = BABYLON.Color3.Random();

                    for (let iline = 0; iline < trainNs.length; ++iline) {
                        let nMeshTrain = trainNs[iline];
                        let iniPosi = trainPini[iline];
                        let meshLast = null;
                        for (let i = 0; i <= nMeshTrain; ++i) {
                            let mesh = null;
                            if (i < nMeshTrain) {
                                mesh = BABYLON.MeshBuilder.CreateBox(`box${i}`, {width:0.5, height:0.5, depth:2}, scene);
                                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                                mesh.material.emissiveColor = trainColor;
                                mesh._path3d = path3d;
                                if (i == 0) {
                                    myMeshCandiList.push(mesh);
                                }
                                meshAggInfo.push([mesh,null]);
                                meshLast = mesh;
                            }
                            let idx = dataTrainList.length;
                            let pct = i * trainPad + iniPosi;
                            if (pct >= 1) pct = pct-1;
                            if (pct < 0) pct = pct+1;
                            dataTrainList.push({
                                idx: idx, // dataTrainList内のidx
                                no: i, // 号車 (0始まり
                                speed: trainSpd,
                                percentage: pct, // 位相位置[0,1]
                                p: new BABYLON.Vector3(),  // pctgからの世界位置
                                path3d: path3d,
                                mesh: mesh,
                            });
                        } // for (let i = 0; i <= nMeshTrain; ++i) {

                        {
                            // ParticleSystem を 列車（最後）に紐づけ
                            let mesh = meshLast;
                            let particleSystem = new BABYLON.ParticleSystem("particles", 3000, scene);
                            particleSystem.particleTexture = new BABYLON.Texture(fpathParticle, scene);
                            particleSystem.emitter = mesh; // new BABYLON.Vector3(0, 0, 0);
                            particleSystem.minEmitBox = new BABYLON.Vector3(-0.1, -0.1, -1.0);
                            particleSystem.maxEmitBox = new BABYLON.Vector3(0.1, -0.1, 1.0);
                            particleSystem.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
                            particleSystem.color2 = new BABYLON.Color4(1.0, 1.0, 0.0, 1.0);
                            particleSystem.colorDead = new BABYLON.Color4(0.5, 0.5, 0.5, 0.0);
                            particleSystem.minSize = 0.2;
                            particleSystem.maxSize = 0.3;
                            particleSystem.minLifeTime = 5;
                            particleSystem.maxLifeTime = 8;
                            particleSystem.emitRate = 400;
                            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
                            particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);
                            particleSystem.direction1 = new BABYLON.Vector3(-0.02, -0.02, -0.02);
                            particleSystem.direction2 = new BABYLON.Vector3(0.02, 0.02, 0.02);
                            particleSystem.minAngularSpeed = -Math.PI*2;
                            particleSystem.maxAngularSpeed = Math.PI*2;
                            particleSystem.minEmitPower = 0.1;
                            particleSystem.maxEmitPower = 0.2;
                            particleSystem.updateSpeed = 0.02;
                            particleSystem.start();
                            meshAggInfo.push([particleSystem,null]);
                        }
                    } // for (let iline = 0; iline < trainNs.length; ++iline) {
                    bTrain = true;
                }

                if (stageType=='tube') {
                    // チューブで表示
                    let mesh = BABYLON.MeshBuilder.CreateTube("tube", {path:plist3, radius:tubeRadius, cap:tubeCAP}, scene);
                    mesh.position.y += tubeRadius+0.1; // tube
                    mesh.material = new BABYLON.StandardMaterial("mat", scene);
                    mesh.material.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
                    mesh.material.wireframe = true;
                    meshAggInfo.push([mesh,null]);
                }

                if (stageType=='extrude') {
                    // 矩形（凹）で表示、角張ったフライパン(square pan)
                    let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 6.0;
                    let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 3.0;
                    let myShape = [];
                    {
                        myShape = [
                            new BABYLON.Vector3(-gardW,  gardH, 0),
                            new BABYLON.Vector3(-gardW,  0    , 0),
                            new BABYLON.Vector3( gardW,  0    , 0),
                            new BABYLON.Vector3( gardW,  gardH, 0)
                        ];
                    }
                    let options = {shape: myShape,
                                   path: plist3, // plist2, // points,
                                   sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                                   adjustFrame:true,
                                   cap:tubeCAP};
                    if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                    let mesh ;
                    if (Object.keys(mZRot).length > 0) {
                        const myRotation = (index, distance) => {
                            if (index in mZRot) {
		                return mZRot[index];
                            }
		            return 0;
	                };
                        {
                            options.updatable = true;
                            options.rotationFunction = myRotation;
                        }
                        mesh = BABYLON.MeshBuilder.ExtrudeShapeCustom("extrude", options, scene);
                    } else {
                        mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                    }
                    mesh.material = new BABYLON.StandardMaterial("mat", scene);
                    mesh.material.diffuseColor = BABYLON.Color3.Green();
                    mesh.material.wireframe = true;
                    meshAggInfo.push([mesh,null]);
                }

                if (stageType=='extrude_plane') {
                    // 線分／平面で表示
                    let sW = typeof(metaStageInfo.sW) !== 'undefined' ? metaStageInfo.sW : 20;
                    const sW_=sW/2;
                    const myShape = [
                        new BABYLON.Vector3(-sW_, 0, 0),
                        new BABYLON.Vector3( sW_, 0, 0)
                    ];
                    let options = {shape: myShape,
                                   path: plist3, // plist2, // points,
                                   sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                                   adjustFrame:true};
                    if (typeof(metaStageInfo.extRot) !== 'undefined') { options.rotation = metaStageInfo.extRot; }
                    let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                    meshAggInfo.push([mesh,null]);
                }

                {
                    // ゴール地点のメッシュ
                    // let pGoal = linePoint[linePoint.length-1].clone();
                    let meshSize = 10;
                    let goalMesh = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: meshSize}, scene);
                    goalMesh.position.copyFrom(pGoal);
                    goalMesh.position.y += 0.2;
                    goalMesh.material = new BABYLON.StandardMaterial("mat");
                    goalMesh.material.diffuseTexture = new BABYLON.Texture(goalPath, scene);
                    goalMesh.material.alpha = 0.5;
                    meshAggInfo.push([goalMesh,null]);
                }
            }

            if (grnd) {
                // 地面
                let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                meshGrnd.position.y += -0.01;
                if (1){
                    meshGrnd.material = new BABYLON.GridMaterial("groundMaterial", scene);
                    meshGrnd.material.majorUnitFrequency = 100; 
                    meshGrnd.material.minorUnitVisibility  = 0.2;
                }
            }
        } // for (let metaStageInfometaStageInfo of List) {

        // ------------------------------------------------------------
        // ------------------------------------------------------------
        let skybox = null;
        // if (0) {
        //     // Skybox
        //     let skyboxTextPath;
        //     if (skyboxType < 0) {
        //         let i = Math.floor(skyboxTextPathList.length*Math.random());
        //         skyboxTextPath = skyboxTextPathList[i];
        //     } else {
        //         skyboxTextPath = skyboxTextPathList[skyboxType];
        //     }
        //     skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:6000.0}, scene);
        //     var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        //     skyboxMaterial.backFaceCulling = false;
        //     skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
        //     skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        //     skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        //     skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        //     skybox.material = skyboxMaterial;
        //     meshAggInfo.push([skybox,null]);
        // }
        if (1) {
            const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 6000}, scene);
            const cubeTexture = new BABYLON.CubeTexture(
                "https://rawcdn.githack.com/mrdoob/three.js/d8b547a7c1535e9ff044d196b72043f5998091ee/examples/textures/cube/MilkyWay/",
                scene,
                ["dark-s_px.jpg", "dark-s_py.jpg", "dark-s_pz.jpg", "dark-s_nx.jpg", "dark-s_ny.jpg", "dark-s_nz.jpg"]
            );
            const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = cubeTexture;
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.disableLighting = true;
            skybox.material = skyboxMaterial;
        }
        
        if (myMeshCandiList.length > 0) {
            myMesh = myMeshCandiList[imyMeshCandi];
            // カメラ処理でエラーになることがあるので初期化
            myMesh.rotationQuaternion = new BABYLON.Quaternion();
        }
    }

    scene.onBeforeRenderObservable.add((scene) => {
        dataTrainList.forEach((data) => {
            let idx = data.idx;
            data.percentage += data.speed;
            if (data.percentage >= 1) data.percentage -= 1;
            data.p.copyFrom(data.path3d.getPointAt(data.percentage));

            if (data.no > 0) {
                // 連続する2点の中間点を位置に、ベクトルから姿勢（方向）にする
                let p_ = dataTrainList[idx-1].p;
                let mesh = dataTrainList[idx-1].mesh;
                let pc = data.p.add(p_).scale(0.5);
                mesh.position.copyFrom(pc);
                let tangent = data.p.subtract(p_);
                // 進行方向に対する上方向を求める。外積を２回実施してtrangentに垂直上向きのベクトルを求める
                let v1 = tangent.cross(BABYLON.Vector3.Up());
                let vU = v1.cross(tangent).normalize();
                // 方向ベクトルからクォータニオンを作成
                mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(tangent, vU);
                mesh.lookAt(pc.add(tangent)); // 不要と思ったけど念のため（周回またぎで安定した!?）
            }
        });
    });


    // --------------------------------------------------
 
   // Input to direction
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ' || kbInfo.event.key == 'Enter' || kbInfo.event.key == 'c' || kbInfo.event.key == 'C') {

                if (kbInfo.event.key == 'Enter' || kbInfo.event.key == 'C') {
                    icamera=(icamera+ncamera-1)%ncamera;
                } else {
                    icamera=(icamera+1)%ncamera;
                }
                changeCamera(icamera);
            }
            if (kbInfo.event.key >= '1' && kbInfo.event.key <= '8') {
                let icam = Number(kbInfo.event.key) -1;
                if (icamera == 10) {
                    icamera10 = icam;
                    changeViewportFor10(icamera10);
                }
            }
            if (kbInfo.event.key == 'x' || kbInfo.event.key == 'z') {
                if (kbInfo.event.key == 'x') {
                    imyMeshCandi = (imyMeshCandi+1) % myMeshCandiList.length;
                } else {
                    imyMeshCandi = (imyMeshCandi+myMeshCandiList.length-1) % myMeshCandiList.length;
                }
                myMesh = myMeshCandiList[imyMeshCandi];
                changeCamera(icamera);
            }
            if (kbInfo.event.key == 'n' || kbInfo.event.key == 'b') {
                if (kbInfo.event.key == 'n') {
                    istage = (istage+1) % nstage;
                } else {
                    istage = (istage+nstage-1) % nstage;
                }
                createStage(istage);
                changeCamera(icamera);
            }
        }
    });

    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");


    // ------------------------------
    // メッセージ（数秒後にフェードアウト）
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Ready!";
    text2.color = "white";
    text2.fontSize = 24;
    text2.height = "36px";
    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    advancedTexture.addControl(text2);

    let clearText2 = function() {
        text2.text = "";
    }

    let setText2 = function(val) {
        text2.text = "" + val;
        setTimeout(clearText2, 10*1000); // 10[sec]
    }

    // ----------------------------------------

    createStage(istage);

    changeCamera(icamera);

    return scene;
}

export var createScene = createScene_008; // 銀河鉄道っぽく、背景：銀河、軌跡

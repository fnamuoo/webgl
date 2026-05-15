// Babylon.js で物理演算(havok)：歩行おもちゃでレース
//
// 操作：
//  (space/enter) .. コース・メカを変更して再スタート

// const goalPath ="../123/textures/checker.jpg";
// const goalPath ="textures/checker.jpg";

const pathRoot = "../";
// const pathRoot = "https://raw.githubusercontent.com/fnamuoo/webgl/main/";
const goalPath = pathRoot + "123/textures/checker.jpg";

export var createScene_test_104 = async function () {

    // 物理
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    // const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 7/16 * Math.PI, 20, new BABYLON.Vector3(0,0,0));
    // camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    let icamera = 1;
    let camera = null; // , camTrgMesh=null;
    let camTrgMeshList = []; // camTrgMesh候補
    let cameralist = [];
    let crCameraDef = function() {
        let _camera = new BABYLON.ArcRotateCamera("", 3/2 * Math.PI, 7/16 * Math.PI, 20, BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        return _camera;
    }
    let crCamera1 = function() {
        // フローカメラを使ったバードビュー／追跡
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 15, -10), scene);
        _camera.rotationOffset = 90; // 180;
        _camera.radius = 10;
        _camera.heightOffset = 3;
        _camera.cameraAcceleration = 0.1;
        _camera.maxCameraSpeed = 30;
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera2 = function() {
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 8, 20), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.useAutoRotationBehavior = true; // 自動でゆっくり回転
        return _camera;
    }
    let crCamera2_B = function() {
        // フローカメラを使ったバードビュー／追跡
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 8, -10), scene);
        _camera.rotationOffset = 90; // 180;
        _camera.radius = 10;
        _camera.heightOffset = 3;
        _camera.cameraAcceleration = 0.005;
        _camera.maxCameraSpeed = 15;
        _camera.attachControl(canvas, true);
        _camera._i = 0;
        _camera._ctMax = 500;
        _camera._ct = _camera._ctMax;
        // _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let resetCameraView = function(camera_) {
        // n分割cameraからの復帰用にリセット
        while (scene.activeCameras.length > 0) {
            scene.activeCameras.pop();
        }
        scene.activeCameras.push(camera_);
        for (let camera__ of cameralist) {
            camera__.dispose();
        }
        camera_.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
    }
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == -1) {
            camera = crCameraDef();
            resetCameraView(camera);
        }
        if (icamera == 0) {
            camera = crCameraDef();
            // n分割cameraからの復帰用にリセット
            resetCameraView(camera)
        }
        if (icamera == 1) {
            // 4分割
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralist.push(crCamera1())
            cameralist.push(crCamera1())
            cameralist.push(crCamera1())
            // cameralist.push(crCamera2())
            cameralist.push(crCamera2_B())
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
            }
            cameralist[0].viewport = new BABYLON.Viewport(0.0  , 0.7, 0.33, 0.3); // 上段：左
            cameralist[1].viewport = new BABYLON.Viewport(0.333, 0.7, 0.33, 0.3); // 上段：中
            cameralist[2].viewport = new BABYLON.Viewport(0.666, 0.7, 0.33, 0.3); // 上段：右
            cameralist[3].viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 0.695); // 下段
        }
        if ((icamera == 1) && (camTrgMeshList.length == 3)) {
            cameralist[0].lockedTarget = camTrgMeshList[0];
            cameralist[1].lockedTarget = camTrgMeshList[1];
            cameralist[2].lockedTarget = camTrgMeshList[2];

            cameralist[3].lockedTarget = camTrgMeshList[0];
        }
    }
    let renderCamera2_B = function(_camera, mesh_) {
        if (_camera._ct > 0) {
            _camera._ct -= 1;
        } else {
            _camera._ct = _camera._ctMax;
            _camera._i = (_camera._i+1) % camTrgMeshList.length;
            _camera.lockedTarget = camTrgMeshList[_camera._i];
        }
    }
    scene.onBeforeRenderObservable.add((scene) => {
        if (icamera == 1) {
            renderCamera2_B(cameralist[3], cameralist[3].lockedTarget);
        }
    })


    const FILTER_GROUP_GRND = 1;
    const FILTER_GROUP_ARCH_1 = 2;

    let createMecha_1 = function(itype) {
        //    P5(o)-_   _-(o)P3
        //       |   -_-   |
        // P0  P2|  _- -_  | P1
        // (s)--(a)-     -(s)
        //       |         |
        //    P6(o)       (o)P4

        // 固定点の座標
        let pp = {
            0:[0, 0],
            1:[4, 0],
        }
        // 各点の距離
        let pplen = {
            2:0.25,
            13:2,
            14:3-1,
            15:4,
            23:4,
            25:2,
            26:2.75-1,
        };
        let zlist = [1.0, -1.0];
        let mwshbodyMass = 1, mwshwMass = 50, impF = 100, dampAng = 1000;
        let fricF =0.8, fricR = 0.8;
        let meshbodyD = 2.9;

        if (itype == 0) {
        } else if (itype == 1) {
            // 足が垂直寄りになるように  .. 速いけど偶にこける
            zlist = [1.1, -1.1];
            mwshbodyMass = 15;
            pplen = {
                2:0.25,
                13:2,
                14:3-1,
                15:4.3,
                23:4.5,
                25:2,
                26:2.75-1,
            };
            
        } else if (itype == 2) {
            // 足を長く
            mwshbodyMass = 10;
            impF = 50, dampAng = 1000;
            pplen = {
                2:0.25,
                13:2,
                14:4-1,
                15:4.3,
                23:4.5,
                25:2,
                26:3.75-1,
            };

        } else if (itype == 3) {
            // 回転半径を大きく、..後半伸びてくる?
            zlist = [1.24, -1.24];
            mwshbodyMass = 110, mwshwMass = 200, impF = 600, dampAng = 1000;
            pplen = {
                2:0.5,
                13:2,
                14:2.75-1,
                15:4.3,
                23:4.5,
                25:2,
                26:2.00-1,
            };

        } else if (itype == 4) {
            // 回転半径を小さく
            mwshbodyMass = 15;
            pplen = {
                2:0.10,
                13:2,
                14:3-1,
                15:4.3,
                23:4.5,
                25:2,
                26:2.75-1,
            };

        } else if (itype == 5) {
            // bodyを長く
            pp = {0:[0, 0],
                  1:[5, 0],}
            mwshbodyMass = 10;
            pplen = {
                2:0.25,
                13:2,
                14:3-1,
                15:5.25,
                23:5.00,
                25:2,
                26:2.75-1,
            };

        } else if (itype == 6) {
            // bodyを長く、足を短く
            pp = {0:[0, 0],
                  1:[5, 0],}
            mwshbodyMass = 20;
            pplen = {
                2:0.25,
                13:2,
                14:2.25-1,
                15:5.25,
                23:5.00,
                25:2,
                26:2.0-1,
            };

        } else if (itype == 7) {
            // bodyを長く、回転R大きく、パワー強
            pp = {0:[0, 0],
                  1:[5, 0],}
            zlist = [1.23, -1.23];
            mwshbodyMass = 40, mwshwMass = 120, impF = 300, dampAng = 2000;
            pplen = {
                2:0.4,
                13:2,
                14:2.5-1,
                15:5.5,
                23:5.00,
                25:2,
                26:2.0-1,
            };

        } else if (itype == 8) {
            // bodyを長く, 足を短く、パワー強
            pp = {0:[0, 0],
                  1:[5, 0],}
            zlist = [1.23, -1.23];
            mwshbodyMass = 40, mwshwMass = 180, impF = 600, dampAng = 6000, fricF = 0.99, fricR = 0.1, meshbodyD = 2.95;
            pplen = {
                2:0.5,
                13:2,
                14:2.25-1,
                15:5.5,
                23:4.75,
                25:2,
                26:1.75-1,
            };

        } else if (itype == 9) {
            // (itype=1)にmass+5 .. 安定した!?（こけなくなった!?）
            zlist = [1.1, -1.1];
            mwshbodyMass = 25;
            pplen = {
                2:0.25,
                13:2,
                14:3-1,
                15:4.3,
                23:4.5,
                25:2,
                26:2.75-1,
            };
            
        } else {
            console.log("undef itype=", itype);
            console.assert(0);
        }

        let pplensq = {};
        let lrate = 1.0;
        Object.keys(pplen).forEach(key => {
            let len = pplen[key] * lrate;
            pplen[key] = len;
            pplensq[key] = len*len;
        });
        Object.keys(pp).forEach(key => {
            let v = pp[key];
            pp[key] = [v[0]*lrate, v[1]*lrate];
        });

        let np = 7; // 点の数
        let radinilist = [0, R180]; // z位置のずれと初期位相
        let v2listlist = [];
        let meshlistlist = [];

        let calcPosi = function(rad_, v2list_, pplen) {
            // P2の座標値
            v2list_[2].x = v2list_[0].x + pplen[2]*Math.cos(rad_);
            v2list_[2].y = v2list_[0].y + pplen[2]*Math.sin(rad_);
            // P3の座標値
            // 三角形P1-P2-P3//ABCにおいて、P1-P2/ABを底面とした場合の頂点P3/Cの位置を求める
            // まず辺P1-P2/ABの長さを確定させる
            let L12sq = v2list_[2].subtract(v2list_[1]).lengthSquared();
            let L12 = Math.sqrt(L12sq);
            // ローカル座標系（三角形P1-P2-P3//ABCにおいて、P1-P2/ABを底面とした場合）の頂点P3の座標(cx,cy)を求める
            let xc = (L12sq + pplensq[23] - pplensq[13]) / (2.0*L12);
            let yc = Math.sqrt(pplensq[23] - xc*xc );
            // 底辺(P1-P2)とx軸の角度（三角形の傾き）をもとめ、..
            let rx21 = Math.atan2(v2list_[1].y-v2list_[2].y, v2list_[1].x-v2list_[2].x);
            // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
            v2list_[3] = v2list_[2].add(new BABYLON.Vector2(xc,yc).rotate(rx21));
            // P4  P3P1の延長上に P4を配置
            v2list_[4] = v2list_[3].add(v2list_[1].subtract(v2list_[3]).scale((pplen[13]+pplen[14])/pplen[13]));
            // P5の座標値
            // ローカル座標系（三角形P1-P2-P3//ABCにおいて、P1-P2/ABを底面とした場合）の頂点P3の座標(cx,cy)を求める
            xc = (L12sq + pplensq[25] - pplensq[15]) / (2.0*L12);
            yc = Math.sqrt(pplensq[25] - xc*xc );
            // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
            v2list_[5] = v2list_[2].add(new BABYLON.Vector2(xc,yc).rotate(rx21));
            // P6  P5P2の延長上に P6を配置
            v2list_[6] = v2list_[5].add(v2list_[2].subtract(v2list_[5]).scale((pplen[25]+pplen[26])/pplen[25]));
            return v2list_;
        }

        // ----------------------------------------

        // ボディ
        let meshbody = null, adjx=-Math.abs(pp[1][0]-pp[0][0])/2, adjy=0;
        {
            let s = Math.abs(pp[1][0]-pp[0][0]);
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:1, depth:meshbodyD}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.alpha = 0.2;
            mesh.rotationQuaternion = new BABYLON.Quaternion();
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mwshbodyMass, friction:0.001}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            mesh.position.set(0, 0, 0);
            meshbody = mesh;
        }
        {
            // アンカー
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.1, depth:2}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Green();
            mesh.position.set(pp[1][0]+adjx, pp[1][1]+adjy, 0); // adj=0の場合
            mesh.parent = meshbody;
        }

        // 動輪（一旦四角で
        let meshw = null;
        {
            let s = pplen[2]*2;
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:s, depth:2}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Red();
            mesh.material.alpha = 0.6;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mwshwMass}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let p = pp[0];
            mesh.position.set(p[0]+adjx, p[1]+adjy, 0);
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(mesh.position.x, mesh.position.y, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, 1),
                scene
            );
            meshbody._agg.body.addConstraint(mesh._agg.body, hinge);
            mesh.parent = meshbody;
            meshw = mesh;
        }

        // 初期状態
        for (let iph = 0; iph < zlist.length; ++iph) {
            let z = zlist[iph];
            let rad = radinilist[iph];

            let v2list = [];
            for (let ip = 0; ip < np; ++ip) {
                v2list.push(new BABYLON.Vector2(0,0));
            }
            // 固定点の設定
            Object.keys(pp).forEach(key => {
                let val = pp[key];
                v2list[key].set(val[0], val[1]);
            });

            // 初期位相によるメッシュ位置
            v2list = calcPosi(rad, v2list, pplen);

            let meshlist = [];

            let mesh02 = null;
            {
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[2], height:0.1, depth:0.1}, scene);
                mesh.material = new BABYLON.StandardMaterial("");
                let v_ = v2list[0].add(v2list[2]).scale(0.5);
                mesh.position.set(v_.x, v_.y, z);
                mesh.parent = meshw;
            }

            let mesh23 = null;
            if (1) {
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[23], height:0.1, depth:0.1}, scene);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.wireframe = 1;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
                mesh.physicsBody.disablePreStep = false;
                let vc = v2list[2].add(v2list[3]).scale(0.5);
                mesh.position.set(vc.x+adjx, vc.y+adjy, z);
                let rad = Math.atan2(v2list[3].y-v2list[2].y, v2list[3].x-v2list[2].x);
                mesh.rotate(BABYLON.Vector3.Forward(), rad);
                let hinge = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(v2list[2].x, v2list[2].y, z),
                    new BABYLON.Vector3(-pplen[23]/2, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                meshw._agg.body.addConstraint(mesh._agg.body, hinge);

                mesh.parent = meshbody;
                mesh23 = mesh;
            }

            let mesh34 = null;
            if (1) {
                let s = pplen[13] + pplen[14];
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:0.1, depth:0.1}, scene);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1, friction:fricR}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
                mesh.physicsBody.disablePreStep = false;
                let vc = v2list[3].add(v2list[4]).scale(0.5);
                mesh.position.set(vc.x+adjx, vc.y+adjy, z);
                let rad = Math.atan2(v2list[4].y-v2list[3].y, v2list[4].x-v2list[3].x);
                mesh.rotate(BABYLON.Vector3.Forward(), rad);
                let hinge = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(pplen[23]/2, 0, 0),
                    new BABYLON.Vector3(-s/2, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                mesh23._agg.body.addConstraint(mesh._agg.body, hinge);
                // mesh34 を pplen[13]:pplen[14] で内分する点(x)
                let x = (-s/2*(pplen[14]) + s/2*(pplen[13]))/(pplen[13]+pplen[14]);
                let hinge2 = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(v2list[1].x+adjx, v2list[1].y+adjy, z),
                    new BABYLON.Vector3(x, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                meshbody._agg.body.addConstraint(mesh._agg.body, hinge2);

                if (1) {
                    // 高速回転で安定させるための物理拘束
                    let sixdof = new BABYLON.Physics6DoFConstraint(
                        { pivotA: new BABYLON.Vector3(0, 0, z*2),
                          pivotB: new BABYLON.Vector3(-s/2, 0, 0),},
                        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_Z, minLimit:z, maxLimit:z, },
                        ],
                        scene);
                    meshbody._agg.body.addConstraint(mesh._agg.body, sixdof);
                }

                mesh.parent = meshbody;
                mesh34 = mesh;
            }

            let mesh15 = null;
            if (1) {
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[15], height:0.1, depth:0.1}, scene);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.wireframe = 1;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
                mesh.physicsBody.disablePreStep = false;
                let vc = v2list[1].add(v2list[5]).scale(0.5);
                mesh.position.set(vc.x+adjx, vc.y+adjy, z);
                let rad = Math.atan2(v2list[5].y-v2list[1].y, v2list[5].x-v2list[1].x);
                mesh.rotate(BABYLON.Vector3.Forward(), rad);
                let hinge = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(v2list[1].x+adjx, v2list[1].y+adjy, z),
                    new BABYLON.Vector3(-pplen[15]/2, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                meshbody._agg.body.addConstraint(mesh._agg.body, hinge);

                if (1) {
                    // 高速回転で安定させるための物理拘束
                    let sixdof = new BABYLON.Physics6DoFConstraint(
                        { pivotA: new BABYLON.Vector3(0, 0, z*2),
                          pivotB: new BABYLON.Vector3(pplen[15]/2, 0, 0),},
                        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_Z, minLimit:z, maxLimit:z, },
                        ],
                        scene);
                    meshbody._agg.body.addConstraint(mesh._agg.body, sixdof);
                }

                mesh.parent = meshbody;
                mesh15 = mesh;
            }

            let mesh56 = null;
            if (1) {
                let s = pplen[25] + pplen[26];
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:0.1, depth:0.1}, scene);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1, friction:fricF}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
                mesh.physicsBody.disablePreStep = false;
                let vc = v2list[5].add(v2list[6]).scale(0.5);
                mesh.position.set(vc.x+adjx, vc.y+adjy, z);
                let rad = Math.atan2(v2list[6].y-v2list[5].y, v2list[6].x-v2list[5].x);
                mesh.rotate(BABYLON.Vector3.Forward(), rad);
                let hinge = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(pplen[15]/2, 0, 0),
                    new BABYLON.Vector3(-s/2, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                mesh15._agg.body.addConstraint(mesh._agg.body, hinge);
                // mesh56 を pplen[25]:pplen[26] で内分する点(x)
                let x = (-s/2*(pplen[26]) + s/2*(pplen[25]))/(pplen[25]+pplen[26]);
                let hinge2 = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(v2list[2].x, v2list[2].y, z),
                    new BABYLON.Vector3(x, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                meshw._agg.body.addConstraint(mesh._agg.body, hinge2);

                mesh.parent = meshbody;
                mesh56 = mesh;
            }
        }
        meshbody._meshw = meshw;

        meshbody._run = false;
        meshbody._impF = impF;
        meshw.physicsBody.setAngularDamping(dampAng);
        meshbody.physicsBody.disablePreStep = false;

        return meshbody;
    }


    let createMecha_3 = function(itype) {
        // (o)P4       (o)P6      _-(o)P8
        //  |   -       |   -_   -   |
        //  |    -_     |P1   -_-    |
        //  |      -_   |(s) _- -_   |
        //  |       -_  |/ _-    -_  |
        // (s)        -(a)-        -(s)
        //  |P0         |P3          |P2
        //  |           |            |
        //  |           |            |
        // (o)P5       (o)P7        (o)P9

        let a = 1;
        // 固定点の座標
        let pp = {
            0:[-2*a, 0],
            1:[ 0*a, 0],
            2:[ 2*a, 0],
        }
        // 各点の距離
        let pplen = {
            4:1*a,
            5:1*a,
            13:0.25*a,
            26:2.25*a,
            28:1*a,
            29:1*a,
            36:1*a,
            37:1*a,
            34:2.25*a,
            38:2.25*a,
        };
        let zlist = [1, -1], radinilist = [0, R180]; // z位置のずれと初期位相
        let mwshbodyMass = 10, mwshwMass = 50;
        let impF = 100, dampAng = 1000;
        let fricF =0.8, fricM = 0.8, fricR = 0.8;

        if (itype == 0) {

        } else if (itype == 1) {
            a = 1.5;
            // 固定点の座標
            pp = {
                0:[-2*a, 0],
                1:[ 0*a, 0],
                2:[ 2*a, 0],
            }
            // 各点の距離
            pplen = {
                4:1*a,
                5:1*a,
                13:0.25*a,
                26:2.25*a,
                28:1*a,
                29:1*a,
                36:1*a,
                37:1*a,
                34:2.25*a,
                38:2.25*a,
            };
            zlist = [1.35, -1.35];
            mwshbodyMass = 10, mwshwMass = 150, impF = 300, dampAng = 2000;

        } else if (itype == 2) {
            a = 1.25;
            // 固定点の座標
            pp = {0:[-2*a, 0],
                  1:[ 0*a, 0],
                  2:[ 2*a, 0],};
            // 各点の距離
            pplen = {
                4:1*a,
                5:1*a,
                13:0.25*a,
                26:2.25*a,
                28:1*a,
                29:1*a,
                36:1*a,
                37:1*a,
                34:2.25*a,
                38:2.25*a,
            };
            zlist = [1.45, -1.45];
            mwshbodyMass = 20, mwshwMass = 150, impF = 250, dampAng = 1000;

        } else if (itype == 3) {
            mwshbodyMass = 30, mwshwMass = 60, impF = 150, dampAng = 1000;

        } else if (itype == 4) {
            mwshbodyMass = 35, mwshwMass = 60, impF = 200, dampAng = 1000;

        } else if (itype == 5) {
            mwshbodyMass = 65, mwshwMass = 60, impF = 300, dampAng = 1000;

        } else if (itype == 6) {
            mwshbodyMass = 60, mwshwMass = 200, impF = 600, dampAng = 5000;

        } else {
            console.log("undef itype=", itype);
            console.assert(0);
        }

        let pplensq = {};
        let lrate = 1.0;
        Object.keys(pplen).forEach(key => {
            let len = pplen[key] * lrate;
            pplen[key] = len;
            pplensq[key] = len*len;
        });
        Object.keys(pp).forEach(key => {
            let v = pp[key];
            pp[key] = [v[0]*lrate, v[1]*lrate];
        });

        let np = 10; // 点の数
        let v2listlist = [];
        let meshlistlist = [];

        let calcPosi = function(rad_, v2list_, pplen) {
            // P3の座標値
            v2list_[3].x = v2list_[1].x + pplen[13]*Math.cos(rad_);
            v2list_[3].y = v2list_[1].y + pplen[13]*Math.sin(rad_);
            // P4の座標値
            //   4
            //  /
            // 0 -- 3
            // 三角形P0-P3-P4において、P0-P3を底面とした場合の頂点P4の位置を求める
            // まず辺P0-P3の長さを確定させる
            let L03sq = v2list_[3].subtract(v2list_[0]).lengthSquared();
            let L03 = Math.sqrt(L03sq);
            // ローカル座標系（三角形P3-P0-P4 において、P0-P4を底面とした場合）の頂点P4の座標(cx,cy)を求める
            let xc = (L03sq + pplensq[4] - pplensq[34]) / (2.0*L03);
            let yc = Math.sqrt(pplensq[4] - xc*xc );
            // 底辺(P0-P3)とx軸の角度（三角形の傾き）をもとめ、..
            let rx03 = Math.atan2(v2list_[3].y-v2list_[0].y, v2list_[3].x-v2list_[0].x);
            // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
            v2list_[4] = v2list_[0].add(new BABYLON.Vector2(xc,yc).rotate(rx03));
            // P5  P4P0の延長上に P5を配置
            v2list_[5] = v2list_[4].add(v2list_[0].subtract(v2list_[4]).scale((pplen[4]+pplen[5])/pplen[4]));
            // P6の座標値
            //   6
            //  /
            // 3 -- 2
            // 三角形P2-P3-P6において、P2-P3を底面とした場合の頂点P6の位置を求める
            // まず辺P2-P3の長さを確定させる
            let L23sq = v2list_[2].subtract(v2list_[3]).lengthSquared();
            let L23 = Math.sqrt(L23sq);
            // ローカル座標系（三角形P2-P3-P6 において、P2-P3を底面とした場合）の頂点P6の座標(cx,cy)を求める
            xc = (L23sq + pplensq[36] - pplensq[26]) / (2.0*L23);
            yc = Math.sqrt(pplensq[36] - xc*xc );
            // 底辺(P2-P3)とx軸の角度（三角形の傾き）をもとめ、..
            let rx32 = Math.atan2(v2list_[2].y-v2list_[3].y, v2list_[2].x-v2list_[3].x);
            // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
            v2list_[6] = v2list_[3].add(new BABYLON.Vector2(xc,yc).rotate(rx32));
            // P7  P6P3の延長上に P7を配置
            v2list_[7] = v2list_[6].add(v2list_[3].subtract(v2list_[6]).scale((pplen[36]+pplen[37])/pplen[36]));
            // P8の座標値
            //   8
            //  /
            // 3 -- 2
            // ローカル座標系（三角形P2-P3-P8 において、P2-P3を底面とした場合）の頂点P8の座標(cx,cy)を求める
            xc = (L23sq + pplensq[38] - pplensq[28]) / (2.0*L23);
            yc = Math.sqrt(pplensq[38] - xc*xc );
            // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
            v2list_[8] = v2list_[3].add(new BABYLON.Vector2(xc,yc).rotate(rx32));
            // P9  P8P2の延長上に P9を配置
            v2list_[9] = v2list_[8].add(v2list_[2].subtract(v2list_[8]).scale((pplen[28]+pplen[29])/pplen[28]));
            return v2list_;
        }

        // ----------------------------------------

        // ボディ
        let meshbody = null, adjx=0, adjy=0;
        let sd = Math.abs(zlist[0]-zlist[1]);
        {
            let sw = Math.abs(pp[0][0]-pp[2][0]);
            let sh = 1/2;
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:sh, depth:sd}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.alpha = 0.2;
            mesh.rotationQuaternion = new BABYLON.Quaternion();
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mwshbodyMass, friction:0.001}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            mesh.position.set(0, 0, 0);
            meshbody = mesh;
        }
        {
            // アンカーP0
            let pv = pp[0];
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.1, depth:sd}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Green();
            mesh.position.set(pv[0]+adjx, pv[1]+adjy, 0); // adj=0の場合
            mesh.parent = meshbody;
        }
        {
            // アンカーP1
            let pv = pp[1];
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.1, depth:sd}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Green();
            mesh.position.set(pv[0]+adjx, pv[1]+adjy, 0); // adj=0の場合
            mesh.parent = meshbody;
        }
        {
            // アンカーP2
            let pv = pp[2];
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.1, depth:sd}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Green();
            mesh.position.set(pv[0]+adjx, pv[1]+adjy, 0); // adj=0の場合
            mesh.parent = meshbody;
        }

        // 動輪（一旦四角で
        let meshw = null;
        {
            let s = pplen[13]*2;
            let mesh = BABYLON.MeshBuilder.CreateBox("", {width:s, height:s, depth:sd}, scene);
            mesh.material = new BABYLON.StandardMaterial("");
            mesh.material.diffuseColor = BABYLON.Color3.Red();
            mesh.material.alpha = 0.6;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mwshwMass}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesh.physicsBody.disablePreStep = false;
            let p = pp[1];
            mesh.position.set(p[0]+adjx, p[1]+adjy, 0);
            for (let z of zlist) {
                let hinge = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(mesh.position.x, mesh.position.y, z),
                    new BABYLON.Vector3(0, 0, z),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                meshbody._agg.body.addConstraint(mesh._agg.body, hinge);
            }
            mesh.parent = meshbody;
            meshw = mesh;
        }

        // 初期状態
        for (let iph = 0; iph < zlist.length; ++iph) {
            let z = zlist[iph];
            let rad = radinilist[iph];

            let v2list = [];
            for (let ip = 0; ip < np; ++ip) {
                v2list.push(new BABYLON.Vector2(0,0));
            }
            // 固定点の設定
            Object.keys(pp).forEach(key => {
                let val = pp[key];
                v2list[key].set(val[0], val[1]);
            });

            // 初期位相によるメッシュ位置
            v2list = calcPosi(rad, v2list, pplen);

            let meshlist = [];

            {
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[13], height:0.1, depth:0.1}, scene);
                mesh.material = new BABYLON.StandardMaterial("");
                let v_ = v2list[1].add(v2list[3]).scale(0.5);
                mesh.position.set(v_.x, v_.y, z);
                mesh.parent = meshw;
            }


            let mesh34 = null;
            if (1) {
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[34], height:0.1, depth:0.1}, scene);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.wireframe = 1;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
                mesh.physicsBody.disablePreStep = false;
                let vc = v2list[3].add(v2list[4]).scale(0.5);
                mesh.position.set(vc.x+adjx, vc.y+adjy, z);
                let rad = Math.atan2(v2list[4].y-v2list[3].y, v2list[4].x-v2list[3].x);
                mesh.rotate(BABYLON.Vector3.Forward(), rad);
                let v_ = v2list[3].subtract(v2list[1]);
                let hinge = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(v_.x, v_.y, z),
                    new BABYLON.Vector3(-pplen[34]/2, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                meshw._agg.body.addConstraint(mesh._agg.body, hinge);
                mesh.parent = meshbody;
                mesh34 = mesh;
            }

            let mesh45 = null;
            if (1) {
                let sw = pplen[4] + pplen[5];
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:0.1, depth:0.1}, scene);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1, friction:fricF}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
                mesh.physicsBody.disablePreStep = false;
                let vc = v2list[4].add(v2list[5]).scale(0.5);
                mesh.position.set(vc.x+adjx, vc.y+adjy, z);
                let rad = Math.atan2(v2list[5].y-v2list[4].y, v2list[5].x-v2list[4].x);
                mesh.rotate(BABYLON.Vector3.Forward(), rad);

                let hinge = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(pplen[34]/2, 0, 0),
                    new BABYLON.Vector3(-sw/2, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                mesh34._agg.body.addConstraint(mesh._agg.body, hinge);

                let v_ = v2list[0].subtract(v2list[1]);
                // mesh67 を pplen[36]:pplen[37] で内分する点(x)
                let x = (-sw/2*(pplen[5]) + sw/2*(pplen[4]))/(pplen[4]+pplen[5]);
                let hinge2 = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(v_.x+adjx, v_.y+adjy, z),
                    new BABYLON.Vector3(x, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                meshbody._agg.body.addConstraint(mesh._agg.body, hinge2);

                if (1) {
                    // 高速回転で安定させるための物理拘束
                    let sixdof = new BABYLON.Physics6DoFConstraint(
                        { pivotA: new BABYLON.Vector3(0, 0, z*2),
                          pivotB: new BABYLON.Vector3(-pplen[45]/2, 0, 0),},
                        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_Z, minLimit:z, maxLimit:z, },
                        ],
                        scene);
                    meshbody._agg.body.addConstraint(mesh._agg.body, sixdof);
                }

                mesh.parent = meshbody;
                mesh45 = mesh;
            }


            let mesh38 = null;
            if (1) {
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[38], height:0.1, depth:0.1}, scene);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.wireframe = 1;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
                mesh.physicsBody.disablePreStep = false;
                let vc = v2list[3].add(v2list[8]).scale(0.5);
                mesh.position.set(vc.x+adjx, vc.y+adjy, z);
                let rad = Math.atan2(v2list[8].y-v2list[3].y, v2list[8].x-v2list[3].x);
                mesh.rotate(BABYLON.Vector3.Forward(), rad);
                let v_ = v2list[3].subtract(v2list[1]);
                let hinge = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(v_.x, v_.y, z),
                    new BABYLON.Vector3(-pplen[38]/2, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                meshw._agg.body.addConstraint(mesh._agg.body, hinge);

                if (1) {
                    // 高速回転で安定させるための物理拘束
                    let sixdof = new BABYLON.Physics6DoFConstraint(
                        { pivotA: new BABYLON.Vector3(0, 0, z*2),
                          pivotB: new BABYLON.Vector3(pplen[38]/2, 0, 0),},
                        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_Z, minLimit:z, maxLimit:z, },
                        ],
                        scene);
                    meshbody._agg.body.addConstraint(mesh._agg.body, sixdof);
                }

                mesh.parent = meshbody;
                mesh38 = mesh;
            }

            let mesh67 = null;
            if (1) {
                let sw = pplen[36] + pplen[37];
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:0.1, depth:0.1}, scene);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1, friction:fricM}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
                mesh.physicsBody.disablePreStep = false;
                let vc = v2list[6].add(v2list[7]).scale(0.5);
                mesh.position.set(vc.x+adjx, vc.y+adjy, z);
                let rad = Math.atan2(v2list[7].y-v2list[6].y, v2list[7].x-v2list[6].x);
                mesh.rotate(BABYLON.Vector3.Forward(), rad);

                let v_ = v2list[3].subtract(v2list[1]);
                let x = (-sw/2*(pplen[37]) + sw/2*(pplen[36]))/(pplen[36]+pplen[37]);
                let hinge2 = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(v_.x, v_.y, z),
                    new BABYLON.Vector3(x, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                meshw._agg.body.addConstraint(mesh._agg.body, hinge2);

                if (1) {
                    // 高速回転で安定させるための物理拘束
                    let sixdof = new BABYLON.Physics6DoFConstraint(
                        { pivotA: new BABYLON.Vector3(0, 0, z*2),
                          pivotB: new BABYLON.Vector3(-pplen[67]/2, 0, 0),},
                        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_Z, minLimit:z, maxLimit:z, },
                        ],
                        scene);
                    meshbody._agg.body.addConstraint(mesh._agg.body, sixdof);
                }

                mesh.parent = meshbody;
                mesh67 = mesh;
            }

            let mesh26 = null;
            if (1) {
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:pplen[26], height:0.1, depth:0.1}, scene);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.wireframe = 1;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
                mesh.physicsBody.disablePreStep = false;
                let vc = v2list[2].add(v2list[6]).scale(0.5);
                mesh.position.set(vc.x+adjx, vc.y+adjy, z);
                let rad = Math.atan2(v2list[6].y-v2list[2].y, v2list[6].x-v2list[2].x);
                mesh.rotate(BABYLON.Vector3.Forward(), rad);

                let s67 = (pplen[36] + pplen[37]);
                let hinge = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(-s67/2, 0, 0),
                    new BABYLON.Vector3(pplen[26]/2, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                mesh67._agg.body.addConstraint(mesh._agg.body, hinge);

                let hinge2 = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(v2list[2].x+adjx, v2list[2].y+adjy, z),
                    new BABYLON.Vector3(-pplen[26]/2, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                meshbody._agg.body.addConstraint(mesh._agg.body, hinge2);

                mesh.parent = meshbody;
                mesh26 = mesh;
            }

            let mesh89 = null;
            if (1) {
                let sw = pplen[28] + pplen[29];
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sw, height:0.1, depth:0.1}, scene);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:1, friction:fricR}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
                mesh.physicsBody.disablePreStep = false;
                let vc = v2list[8].add(v2list[9]).scale(0.5);
                mesh.position.set(vc.x+adjx, vc.y+adjy, z);
                let rad = Math.atan2(v2list[9].y-v2list[8].y, v2list[9].x-v2list[8].x);
                mesh.rotate(BABYLON.Vector3.Forward(), rad);

                let hinge = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(pplen[38]/2, 0, 0),
                    new BABYLON.Vector3(-sw/2, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                mesh38._agg.body.addConstraint(mesh._agg.body, hinge);

                // mesh89 を pplen[28]:pplen[29] で内分する点(x)
                let x = (-sw/2*(pplen[29]) + sw/2*(pplen[28]))/(pplen[28]+pplen[29]);
                let hinge2 = new BABYLON.HingeConstraint(
                    new BABYLON.Vector3(v2list[2].x+adjx, v2list[2].y+adjy, z),
                    new BABYLON.Vector3(x, 0, 0),
                    new BABYLON.Vector3(0, 0, 1),
                    new BABYLON.Vector3(0, 0, 1),
                    scene
                );
                meshbody._agg.body.addConstraint(mesh._agg.body, hinge2);

                mesh.parent = meshbody;
                mesh89 = mesh;
            }

        }
        meshbody._meshw = meshw;

        meshbody._run = false;
        meshbody._impF = impF; // 100;
        meshw.physicsBody.setAngularDamping(dampAng);
        meshbody.physicsBody.disablePreStep = false;

        return meshbody;
    }

    let meshRunners = [];
    scene.onBeforeRenderObservable.add(() => {
        for (let mesh of meshRunners) {
            if (mesh._run) {
                let vdir = BABYLON.Vector3.Forward();
                vdir.scaleInPlace(mesh._impF);
                mesh._meshw._agg.body.applyAngularImpulse(vdir);
                // 一定ごとに位置・姿勢を確認
                if (mesh._checkCT > 0) {
                    mesh._checkCT -= 1;
                } else {
                    mesh._checkCT = mesh._checkCTmax;
                    // 上方ベクトルの内積から向きを確認（負ならひっくり返っていると判断）
                    let vdot = 0;
                    let vup = BABYLON.Vector3.Up().applyRotationQuaternion(mesh.rotationQuaternion);
                    vdot = vup.dot(BABYLON.Vector3.Up());
                    if (mesh.position.y < -300 || vdot < 0) {
                        // 絶対位置（高さ）が低い(-300未満)か、上向きとの内積がマイナス（姿勢が下向き）
                        // 姿勢をリセットする
                        console.log("reset course posi y=", mesh.position.y, " , dot=",vdot);
                        // 動きを止める
                        mesh._run = false;
                        let r = path3d.getClosestPositionTo(new BABYLON.Vector3(mesh.position.x, 0, mesh._courseZ));
                        let p = path3d.getPointAt(r);
                        p.y += 3;
                        p.z = mesh._courseZ; // 予め設定していたコース位置
                        // 位置を復帰
                        mesh.position.copyFrom(p);
                        // スピードを０に
                        mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
                        mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                        // 姿勢を戻す
                        mesh.rotationQuaternion = new BABYLON.Quaternion();
                        // 動きを再開
                        mesh._run = true;
                    }
                }
            }
        }
    })

    // --------------------------------------------------

    let meshes = [];
    let clearMeshes = function() {
        camTrgMeshList = [];
        meshGoal = null;
        for (let meshR of meshRunners) {
            meshR._run = false;
        }
        while (meshes.length > 0) {
            let mesh = meshes.pop();
            if ((typeof(mesh._agg) !== 'undefined')) {
                mesh._agg.dispose();
            }
            mesh.dispose();
        }
    }

    let courseList = [1,2,3,11,12,21,31];
    let meshGoal = null, goalW=1, goalH=4, goalD=30, goalH_=goalH/2;
    // // const goalPath ="../078/textures/checker.jpg";
    // const goalPath ="textures/checker.jpg";
    let matGoal = new BABYLON.StandardMaterial("mat");
    matGoal.diffuseTexture = new BABYLON.Texture(goalPath, scene);
    matGoal.diffuseTexture.alpha = 0.5;
    matGoal.diffuseTexture.uScale = 1;
    matGoal.diffuseTexture.vScale = 7;
    let path3d = null;

    // let matGoal = null;
    let createCourse = function(icourse) {
        let adjy = -3;
        if (1) {
            let grndW=100, grndH=100;
            let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
            mesh.position.y = adjy-0.1; // -3.0;
            mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
            mesh.material.majorUnitFrequency = 10; 
            mesh.material.minorUnitVisibility  = 0.2;
            mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
            mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
            mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
            meshes.push(mesh);
        }

        if (icourse == 1 || icourse == 2 || icourse == 3 ) {
            let gardW = 3.0, gardW_ = gardW/2, gardH = 3;
            const myShape1 = [ // 床
                new BABYLON.Vector3(-gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  0    , 0),
            ];
            const myShape2 = [ // コースガイド
                new BABYLON.Vector3(-gardW_,  gardH, 0),
                new BABYLON.Vector3(-gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  gardH, 0),
            ];
            let zlist = [-4, 0, 4], yh = 0, yh_=yh/2, nx=100;
            if (icourse == 2) {
                nx = 400;
            } else if (icourse == 3 ) {
                nx = 800;
            }
            for (let z of zlist) {
                let myPath = [];
                for (let i = -30; i < nx+30; i += 10) {
                    let x = -i;
                    let y = 0+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                if (z == zlist[1]) {
                    path3d = new BABYLON.Path3D(myPath);
                }
                let options = {shape: myShape1,
                               path: myPath,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,};
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                mesh.material.majorUnitFrequency = 10; 
                mesh.material.minorUnitVisibility  = 0.2;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;

                options.shape = myShape2;
                let mesh2 = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh2.material = new BABYLON.StandardMaterial("");
                mesh2.material.diffuseColor = BABYLON.Color3.Green();
                mesh2.material.wireframe = 1;
                mesh2.position.y = -0.2
                mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.6, friction:0.001}, scene);
                mesh2._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh2._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
                meshes.push(mesh);
                meshes.push(mesh2);
            }

            if (1) {
                let grndW=100, grndH=100;
                let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
                mesh.position.x = -nx;
                mesh.position.y = adjy+yh-0.1; // -3.0;
                mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                mesh.material.majorUnitFrequency = 10; 
                mesh.material.minorUnitVisibility  = 0.2;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
                meshes.push(mesh);
            }
            {
                let mesh = BABYLON.MeshBuilder.CreateBox("", { width:goalW, height:goalH, depth:goalD }, scene);
                mesh.position.set(-nx, adjy+yh+goalH_, 0);
                mesh.material = matGoal;
                meshGoal = mesh;
                meshes.push(mesh);
            }
        }

        if (icourse == 11) {
            let gardW = 3.0, gardW_ = gardW/2, gardH = 3;
            const myShape1 = [ // 床
                new BABYLON.Vector3(-gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  0    , 0),
            ];
            const myShape2 = [ // コースガイド
                new BABYLON.Vector3(-gardW_,  gardH, 0),
                new BABYLON.Vector3(-gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  gardH, 0),
            ];
            let zlist = [-4, 0, 4], yh = 3, yh_=yh/2;
            for (let z of zlist) {
                let myPath = [];
                for (let i = -30; i < 500; i += 10) {
                    let x = -i;
                    let y = 0+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                for (let i = 500; i < 900; i += 10) {
                    let x = -i;
                    let y = (1-Math.cos((i-500)/400*R180))*yh_+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                for (let i = 900; i <= 1030; i += 10) {
                    let x = -i;
                    let y = yh+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                if (z == zlist[1]) {
                    path3d = new BABYLON.Path3D(myPath);
                }
                let options = {shape: myShape1,
                               path: myPath,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,};
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh.material = new BABYLON.GridMaterial("", scene);
                mesh.material.majorUnitFrequency = 10; 
                mesh.material.minorUnitVisibility  = 0.2;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;

                options.shape = myShape2;
                let mesh2 = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh2.material = new BABYLON.StandardMaterial("");
                mesh2.material.diffuseColor = BABYLON.Color3.Green();
                mesh2.material.wireframe = 1;
                mesh2.position.y = -0.2
                mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.6, friction:0.001}, scene);
                mesh2._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh2._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
                meshes.push(mesh);
                meshes.push(mesh2);
            }

            if (1) {
                let grndW=100, grndH=100;
                let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
                mesh.position.x = -1000;
                mesh.position.y = adjy+yh-0.1; // -3.0;
                mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                mesh.material.majorUnitFrequency = 10; 
                mesh.material.minorUnitVisibility  = 0.2;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
                meshes.push(mesh);
            }
            {
                let mesh = BABYLON.MeshBuilder.CreateBox("", { width:goalW, height:goalH, depth:goalD }, scene);
                mesh.position.set(-1000, adjy+yh+goalH_, 0);
                mesh.material = matGoal;
                meshGoal = mesh;
                meshes.push(mesh);
            }
        }

        if (icourse == 12) { // 登り
            let gardW = 3.0, gardW_ = gardW/2, gardH = 3;
            const myShape1 = [ // 床
                new BABYLON.Vector3(-gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  0    , 0),
            ];
            const myShape2 = [ // コースガイド
                new BABYLON.Vector3(-gardW_,  gardH, 0),
                new BABYLON.Vector3(-gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  gardH, 0),
            ];
            let zlist = [-4, 0, 4], yh = 100, yh_=yh/2;
            for (let z of zlist) {
                let myPath = [];
                for (let i = -30; i < 100; i += 10) {
                    let x = -i;
                    let y = 0+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                for (let i = 100; i < 900; i += 10) {
                    let x = -i;
                    let y = (1-Math.cos((i-100)/800*R180))*yh_+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                for (let i = 900; i <= 1030; i += 10) {
                    let x = -i;
                    let y = yh+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                if (z == zlist[1]) {
                    path3d = new BABYLON.Path3D(myPath);
                }
                let options = {shape: myShape1,
                               path: myPath,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,};
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh.material = new BABYLON.GridMaterial("", scene);
                mesh.material.majorUnitFrequency = 10; 
                mesh.material.minorUnitVisibility  = 0.2;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;

                options.shape = myShape2;
                let mesh2 = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh2.material = new BABYLON.StandardMaterial("");
                mesh2.material.diffuseColor = BABYLON.Color3.Green();
                mesh2.material.wireframe = 1;
                mesh2.position.y = -0.2
                mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.6, friction:0.001}, scene);
                mesh2._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh2._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
                meshes.push(mesh);
                meshes.push(mesh2);
            }

            if (1) {
                let grndW=100, grndH=100;
                let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
                mesh.position.x = -1000;
                mesh.position.y = adjy+yh-0.1; // -3.0;
                mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                mesh.material.majorUnitFrequency = 10; 
                mesh.material.minorUnitVisibility  = 0.2;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
                meshes.push(mesh);
            }
            {
                let mesh = BABYLON.MeshBuilder.CreateBox("", { width:goalW, height:goalH, depth:goalD }, scene);
                mesh.position.set(-1000, adjy+yh+goalH_, 0);
                mesh.material = matGoal;
                meshGoal = mesh;
                meshes.push(mesh);
            }
        }

        if (icourse == 21) { // 山（登りと下り）
            let gardW = 3.0, gardW_ = gardW/2, gardH = 3;
            const myShape1 = [ // 床
                new BABYLON.Vector3(-gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  0    , 0),
            ];
            const myShape2 = [ // コースガイド
                new BABYLON.Vector3(-gardW_,  gardH, 0),
                new BABYLON.Vector3(-gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  gardH, 0),
            ];
            let zlist = [-4, 0, 4], yh = 50, yh_=yh/2;
            for (let z of zlist) {
                let myPath = [];
                for (let i = -30; i < 100; i += 10) {
                    let x = -i;
                    let y = 0+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                for (let i = 100; i < 900; i += 10) {
                    let x = -i;
                    let y = (1-Math.cos((i-100)/800*R360))*yh_+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                for (let i = 900; i <= 1030; i += 10) {
                    let x = -i;
                    let y = 0+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                if (z == zlist[1]) {
                    path3d = new BABYLON.Path3D(myPath);
                }
                let options = {shape: myShape1,
                               path: myPath,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,};
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh.material = new BABYLON.GridMaterial("", scene);
                mesh.material.majorUnitFrequency = 10; 
                mesh.material.minorUnitVisibility  = 0.2;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;

                options.shape = myShape2;
                let mesh2 = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh2.material = new BABYLON.StandardMaterial("");
                mesh2.material.diffuseColor = BABYLON.Color3.Green();
                mesh2.material.wireframe = 1;
                mesh2.position.y = -0.2
                mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.6, friction:0.001}, scene);
                mesh2._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh2._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
                meshes.push(mesh);
                meshes.push(mesh2);
            }

            if (1) {
                let grndW=100, grndH=100;
                let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
                mesh.position.x = -1000;
                mesh.position.y = adjy-0.1; // -3.0;
                mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                mesh.material.majorUnitFrequency = 10; 
                mesh.material.minorUnitVisibility  = 0.2;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
                meshes.push(mesh);
            }
            {
                let mesh = BABYLON.MeshBuilder.CreateBox("", { width:goalW, height:goalH, depth:goalD }, scene);
                mesh.position.set(-1000, adjy+goalH_, 0);
                mesh.material = matGoal;
                meshGoal = mesh;
                meshes.push(mesh);
            }
        }

        if (icourse == 31) { // 下り
            let gardW = 3.0, gardW_ = gardW/2, gardH = 3;
            const myShape1 = [ // 床
                new BABYLON.Vector3(-gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  0    , 0),
            ];
            const myShape2 = [ // コースガイド
                new BABYLON.Vector3(-gardW_,  gardH, 0),
                new BABYLON.Vector3(-gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  0    , 0),
                new BABYLON.Vector3( gardW_,  gardH, 0),
            ];
            let zlist = [-4, 0, 4], yh = -100, yh_=yh/2;
            for (let z of zlist) {
                let myPath = [];
                for (let i = -30; i < 100; i += 10) {
                    let x = -i;
                    let y = 0+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                for (let i = 100; i < 900; i += 10) {
                    let x = -i;
                    let y = (1-Math.cos((i-100)/800*R180))*yh_+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                for (let i = 900; i <= 1030; i += 10) {
                    let x = -i;
                    let y = yh+adjy;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                if (z == zlist[1]) {
                    path3d = new BABYLON.Path3D(myPath);
                }
                let options = {shape: myShape1,
                               path: myPath,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true,};
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh.material = new BABYLON.GridMaterial("", scene);
                mesh.material.majorUnitFrequency = 10; 
                mesh.material.minorUnitVisibility  = 0.2;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;

                options.shape = myShape2;
                let mesh2 = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                mesh2.material = new BABYLON.StandardMaterial("");
                mesh2.material.diffuseColor = BABYLON.Color3.Green();
                mesh2.material.wireframe = 1;
                mesh2.position.y = -0.2
                mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.6, friction:0.001}, scene);
                mesh2._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh2._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
                meshes.push(mesh);
                meshes.push(mesh2);
            }

            if (1) {
                let grndW=100, grndH=100;
                let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
                mesh.position.x = -1000;
                mesh.position.y = yh+adjy-0.1; // -3.0;
                mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
                mesh.material.majorUnitFrequency = 10; 
                mesh.material.minorUnitVisibility  = 0.2;
                mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:0.8}, scene);
                mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
                mesh._agg.shape.filterCollideMask = FILTER_GROUP_ARCH_1;
                meshes.push(mesh);
            }
            {
                let mesh = BABYLON.MeshBuilder.CreateBox("", { width:goalW, height:goalH, depth:goalD }, scene);
                mesh.position.set(-1000, yh+adjy+goalH_, 0);
                mesh.material = matGoal;
                meshGoal = mesh;
                meshes.push(mesh);
            }
        }
    }

    let createCourseRnd = function() {
        let icourse = courseList[Math.floor(Math.random()*courseList.length)];
        createCourse(icourse);
    }

    let runnerList = [
        [1, 0],
        [1, 1], // 足が垂直寄りになるように  .. 速いけど偶にこける
        [1, 2], // 足長.. こけやすい
        [1, 3], // 回転R大きく
        [1, 4], // 回転R小さく
        [1, 5], // bodyを長く
        [1, 6], // bodyを長く、足を短く
        [1, 7], // bodyを長く、回転R大きく、パワー強
        [1, 8], // bodyを長く, 足を短く、パワー強
        [1, 9], // (itype=1)にmass+5 .. 安定した!?（こけなくなった!?）

        [3, 0],
        [3, 1], // a=1.5
        [3, 2], // a=1.25
        [3, 3], // impF=150 .. こけた
        [3, 4], // impF=200
        [3, 5], // impF=300 .. こけた
        [3, 6], // impF=600
    ];

    let createRunner = function(runnerIdxList) {
        let meshRunner = [], z, icourse = 0, crsZadj = -4, crsZstep = 4;
        let nrunner = 3;
        // if (runnerIdxList.length >  0) {
        //     // 指定値で作成
        //     for (let [itype, idx] of runnerIdxList) {
        //         if (itype == 1) {
        //             z = icourse*crsZstep + crsZadj; ++icourse;
        //             let mesh = createMecha_1(idx);
        //             mesh.position.set(5, -1.0, z);
        //             mesh._courseZ = z; // コース復帰用
        //             mesh._checkCTmax = 300;
        //             mesh._checkCT = mesh._checkCTmax;
        //             // mesh._irunner = irunner;
        //             meshRunner.push(mesh);
        //             meshes.push(mesh);
        //         } else if (itype == 3) {
        //             z = icourse*crsZstep + crsZadj; ++icourse;
        //             let mesh = createMecha_3(idx);
        //             mesh.position.set(5, -1.5, z);
        //             mesh._courseZ = z; // コース復帰用
        //             mesh._checkCTmax = 300;
        //             mesh._checkCT = mesh._checkCTmax;
        //             // mesh._irunner = irunner;
        //             meshRunner.push(mesh);
        //             meshes.push(mesh);
        //         }
        //     }

        // } else {
        //     // 乱数で作成
            for (let irunner = 0; irunner < nrunner; ++irunner) {
                // 指定がないときはランダム((default値)
                let [itype, idx] = runnerList[Math.floor(Math.random()*runnerList.length)];
                if (irunner < runnerIdxList.length) {
                    // 指定値があればそれを使う
                    [itype, idx] = runnerIdxList[irunner];
                }
console.log("[itype, idx]=", [itype, idx]);
                if (itype == 1) {
                    // 4足の場合
                    z = icourse*crsZstep + crsZadj; ++icourse;
                    let mesh = createMecha_1(idx);
                    mesh.position.set(5, -1.0, z);
                    mesh._courseZ = z; // コース復帰用
                    mesh._checkCTmax = 300;
                    mesh._checkCT = mesh._checkCTmax;
                    // mesh._irunner = irunner;
                    meshRunner.push(mesh);
                    meshes.push(mesh);
                } else if (itype == 3) {
                    // 6足の場合
                    z = icourse*crsZstep + crsZadj; ++icourse;
                    let mesh = createMecha_3(idx);
                    mesh.position.set(5, -1.5, z);
                    mesh._courseZ = z; // コース復帰用
                    mesh._checkCTmax = 300;
                    mesh._checkCT = mesh._checkCTmax;
                    // mesh._irunner = irunner;
                    meshRunner.push(mesh);
                    meshes.push(mesh);
                }
            }
        // }

        if (0) {
            // 組み合わせを指定する場合
            {
                z = icourse*crsZstep + crsZadj; ++icourse;
                let mesh = createMecha_1(8); // bodyを長く, 足を短く、パワー強
                mesh.position.set(5, -1.0, z);
                mesh._courseZ = z; // コース復帰用
                meshRunner.push(mesh);
                meshes.push(mesh);
            }
            {
                z = icourse*crsZstep + crsZadj; ++icourse;
                let mesh = createMecha_1(9); // (itype=1)にmass+5 .. 安定した!?（こけなくなった!?）
                mesh.position.set(5, -1.0, z);
                mesh._courseZ = z; // コース復帰用
                meshRunner.push(mesh);
                meshes.push(mesh);
            }
            {
                z = icourse*crsZstep + crsZadj; ++icourse;
                let mesh = createMecha_3(4); // impF=200
                mesh.position.set(5, -1.5, z);
                mesh._courseZ = z; // コース復帰用
                meshRunner.push(mesh);
                meshes.push(mesh);
            }
        }

        return meshRunner;
    }

    // ゴール判定
    let bCheckGoal = false, bGoalFirst = true;
    scene.registerAfterRender(function() {
        if (bCheckGoal && meshGoal != null && camTrgMeshList.length > 0) {
            // ランナーとGoalの交差チェック
            // let bgoal = false;
            for (let mesh of camTrgMeshList) {
                if (mesh.intersectsMesh(meshGoal, true)) {
                    mesh._run = false; // ランナーを停止
                    // bgoal = true;
                    // bCheckGoal = false;
                    if (bGoalFirst) {
                        bGoalFirst = false; // 一回だけ呼び出すように
                        setNextCourse();
                    }
                }
            }
        }
    });

    // ゴール時の処理
    let resetCourse = function() {
        bCheckGoal = false;
        clearMeshes();
        setCourseRunnerAndStart();
    }
    // 10秒後に resetCourse() を呼び出す
    let setNextCourse = function() {
        setTimeout(resetCourse, 10000);
    }


    // コース・ランナーの作成 と レース開始
    let setCourseRunnerAndStart = function() {
        // let icourse = 1; // flat-100
        // icourse = 2; // flat-400
        // icourse = 3; // flat-800
        // icourse = 11; // 後半登り
        // icourse = 12; // 登り
        // icourse = 21; // 山（登りと下り）
        // icourse = 31; // 下り
        // createCourse(icourse); // コースを固定で作成
        // コース(ランダム)
        createCourseRnd();
        
        // ランナーの作成
        meshRunners = createRunner([]); // 全てランダム
        // meshRunners = createRunner([[1,4], [1,5], [1,8]]); // 全て固定
        // meshRunners = createRunner([[1,4], [1,5]]); // 左・中固定、右ランダム
        camTrgMeshList = meshRunners;

        //    let icamera = 1;
        changeCamera(icamera);

        // ランナーの実行（ラン）
        for (let meshR of meshRunners) {
            meshR._run = true;
        }
        bCheckGoal = true;
        bGoalFirst = true;
    }


    // キー入力処理
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ' || kbInfo.event.key == 'Enter') {
                resetCourse();
            }
        }
    });

    // --------------------------------------------------

    setCourseRunnerAndStart();

    return scene;
}

export var createScene = createScene_test_104;


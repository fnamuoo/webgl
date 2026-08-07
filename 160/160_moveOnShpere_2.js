// 球面移動 / Box版(自作移動体)
//
// 操作
// ArrowUp/ArrowDown    .. 前進/後退
// ArrowLeft/ArrowRight .. 左右旋回（ヨー回転）
// w/s                  .. 前後の回転（ピッチ回転）
// a/d                  .. 左右の回転（ロール回転）

export var createScene_test_2104 = async function () {
//    let fpath = "textures/mercator.jpg"
    let fpath = "../156/textures/mercator.jpg"

    const scene = new BABYLON.Scene(engine);
    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        // 101用
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(75, 0, -65.5)); // ヨーロッパ
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        return _camera;
    }
    let crCamera2 = function() {
        // バードビュー：対象(cameraTrgMesh)を後方から追跡 .. 速度依存（対象が速いと置いて行かれる）
        let _camera = new BABYLON.FollowCamera("", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 2; // 4;
        _camera.heightOffset = 1; // 2;
        _camera.cameraAcceleration = 0.005;
        _camera.maxCameraSpeed = 5; // 10;
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        let mesh = BABYLON.MeshBuilder.CreateBox("", {}, scene);
        mesh.visibility = 0; // 不可視に
        _camera._vtrg = mesh.position.clone();
        _camera.lockedTarget = mesh;
        return _camera;
    }
    let crCamera3 = function() {
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 3; // 1.3;
        _camera.heightOffset = 0.5; // 0.0;
        _camera.cameraAcceleration = 0.05; // 0.3;
        _camera.maxCameraSpeed = 30;
        return _camera;
    }
    let crCamera11 = function() {
        // ドライバーズビュー：対象(myMesh)との距離を一定に保つ（旋回する／短距離をすすむ） .. 速度非依存
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -20), scene);
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let renderCamera11 = function(camera_) {
        // 対象(myMesh)の姿勢／進行方向から固定位置 .. ドライバーズビュー
        let camTrgMesh = camera_.lockedTarget;
        if (camTrgMesh == null) { return; }
        let quat = camTrgMesh.rotationQuaternion;
        // let vdir = new BABYLON.Vector3(-0.01, 0, 0);
        let vdir = new BABYLON.Vector3(0, 1, -3);
        vdir = vdir.applyRotationQuaternion(quat);
        camera_.position = camTrgMesh.position.add(vdir);
        let vU = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
        camera_.upVector = vU;
    }


    let icamera=0, ncamera=4;
    let setCAM3 = function(icamera) {
        if (icamera == 0) {
            // 後ろから追っかける（バードビュー
            camera.radius = 3;
            camera.heightOffset = 0.5; // 1.1;
            camera.cameraAcceleration = 0.05; // 0.1;
            camera.maxCameraSpeed = 5; // 30;
        } else if (icamera == 1) {
            // ちょい遅れて／離れて追っかける（バードビュー遠方
            camera.radius = 20;
            camera.heightOffset = 3; // 8;
            camera.cameraAcceleration = 0.02; // 0.005;
            camera.maxCameraSpeed = 5; // 30;
        } else if (icamera == 2) {
            // 上空（トップビュー
            camera.radius = 1;
            camera.heightOffset = 30;
            camera.cameraAcceleration = 0.5;
            camera.maxCameraSpeed = 100;
        } else if (icamera == 3) {
            // 正面（フロントビュー／ドライバーズビュー
            camera.radius = 0.5; // 1.3;
            camera.heightOffset = -0.05; // 0;
            camera.cameraAcceleration = 0.5; // 0.3;
            camera.maxCameraSpeed = 100;
        }
    }
    let changeCAM3 = function(_icamera) {
        icamera = (_icamera+1) % ncamera;
        // console.log("camera=",icamera);
        setCAM3(icamera);
    }

    camera = crCamera11(); scene.onBeforeRenderObservable.add((scene) => { renderCamera11(camera); })

    const light = new BABYLON.HemisphericLight("", new BABYLON.Vector3(1000, 1000, 0));

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), hk);


    if (1) {
        // 平面地面
        let grndW=500, grndH=500;
        let mesh = BABYLON.MeshBuilder.CreateGround("", { width:grndW, height:grndH }, scene);
        mesh.position.y = -20;
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        // mesh.material.wireframe = 1;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
    }

    let grndY = 20;

    let padj = new BABYLON.Vector3(0, grndY+10, 0);
    let meshGrnd = null;
    if (1) {
        // 球面地面
        let sX=grndY*2;
        let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:sX, segments:32*8}, scene);
        mesh.position.copyFrom(padj);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.emissiveColor = BABYLON.Color3.White();
        mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        mesh.material.diffuseTexture = new BABYLON.Texture(fpath);
	mesh.material.diffuseTexture.uScale = -1;
	mesh.material.diffuseTexture.vScale = -1;
        meshGrnd = mesh;
    }

    let crd20 = function(nloop) {
        // ----------------------------------------
        // 外接球半径
        //   一辺の長さa=2として R = sqrt(10+2*sqrt(5))/4*a
        let R = Math.sqrt(10+2*Math.sqrt(5))/2;
        // 黄金比 phi
        const t = (1 + Math.sqrt(5)) / 2;
        let p2xyz = [
            0, -1,  t,
            0,  1,  t,
            0, -1, -t,
            0,  1, -t,
            t,  0, -1,
            t,  0,  1,
           -t,  0, -1,
           -t,  0,  1,
           -1,  t,  0,
            1,  t,  0,
           -1, -t,  0,
            1, -t,  0,
        ];
        let f2pid = [
            0,5,11,
            0,1,5,
            0,7,1,
            0,10,7,
            0,11,10,
            5,1,9,
            11,5,4,
            10,11,2,
            7,10,6,
            1,7,8,
            3,4,9,
            3,2,4,
            3,6,2,
            3,8,6,
            3,9,8,
            9,4,5,
            4,2,11,
            2,6,10,
            6,8,7,
            8,9,1,
        ];
        {
            // 半径 grndY に合わせてサイズ調整
            let a =  grndY/R;
            let p2xyz_ = [];
            for (let v of p2xyz) {
                v *= a;
                p2xyz_.push(v);
            }
            p2xyz = p2xyz_;
            R *= a;
        }
        // 再帰分割のための事前準備：float[] から Vector3[] に
        let plist = [];
        let preProcess = function(p2xyz) {
            let n = p2xyz.length;
            for (let i = 0; i < n; i+= 3) {
                let x = p2xyz[i], y = p2xyz[i+1], z = p2xyz[i+2];
                let val = new BABYLON.Vector3(x,y,z);
                plist.push(val);
            }
            return plist;
        }
        // 再帰分割
        let recdiv = function(plistold, f2pidold) {
            // 座標値の継承と分割点の追加
            let plistnew = []
            let npold = plistold.length;
            let pkeylistnew = [];
            // 座標値の継承
            for (let i = 0; i < npold; ++i) {
                // old の key を追加
                let key = `${i}_${i}`; // null でよいかも
                pkeylistnew.push(key);
                // old の xyz を追加
                plistnew.push(plistold[i]);
            }
            let f2pidnew = [], nfold = f2pidold.length;
            for (let i = 0; i < nfold; i+=3) {
                let pi1 = f2pidold[i], pi2 = f2pidold[i+1], pi3 = f2pidold[i+2];
                // 分割点の追加
                let pitmp=[];
                let pplist = [
                    [pi1, pi2],
                    [pi2, pi3],
                    [pi1, pi3],];
                for (let pp of pplist) {
                    let skey = (pp[0] < pp[1]) ? "" + pp[0] + "_" + pp[1] : "" + pp[1] + "_" + pp[0];
                    let pi = pkeylistnew.indexOf(skey);
                    if (pi == -1) {
                        // 二分点を追加
                        pi = pkeylistnew.length;
                        pkeylistnew.push(skey)
                        let pvA = plistnew[pp[0]];
                        let pvB = plistnew[pp[1]];
                        let p = pvA.add(pvB).normalize();
                        p.scaleInPlace(R);
                        plistnew.push(p);
                    }
                    pitmp.push(pi);
                }
                let [pi12, pi23, pi13] = pitmp;
                // 分割面のP-IDの追加
                let subf2pidlist = [
                    pi1, pi12, pi13,
                    pi2, pi23, pi12,
                    pi3, pi13, pi23,
                    pi12, pi23, pi13
                ];
                f2pidnew.push(...subf2pidlist);
            }
            return [plistnew, f2pidnew];
        };
        let buildShpereData = function(nloop, plist, f2pid) {
            for (let iloop = 0; iloop < nloop; ++iloop) {
                [plist, f2pid] = recdiv(plist, f2pid);
                console.log("nP.len=", plist.length, ", nF=", f2pid.length/3);
            }
            return [plist, f2pid];
        };
        // plist -> p2xyz  : Vector3 から float[]に変換
        let postProcess = function(plist) {
            p2xyz = [];
            for (let p of plist) {
                p2xyz.push(p.x);
                p2xyz.push(p.y);
                p2xyz.push(p.z);
            }
            return p2xyz;
        };
        // 面の隣接情報 // f2f[fid] = list(fid)
        let f2f = {};
        let crF2F = function(f2pid) {
            // 面から辺に分解する過程で(face2edge[fid]=[spid], edge2face[spid]=[fid])を作成して、面の隣接を作成する
            f2f = {};
            let f2e = {};
            let e2f = {};
            let fid = 0, nfp = f2pid.length;
            for (let i = 0; i < nfp; i+=3) {
                let pi1 = f2pid[i], pi2 = f2pid[i+1], pi3 = f2pid[i+2];
                let pplist = [
                    [pi1, pi2],
                    [pi2, pi3],
                    [pi1, pi3],];
                let edgelist = [];
                for (let pp of pplist) {
                    let edge = (pp[0] < pp[1]) ? "" + pp[0] + "_" + pp[1] : "" + pp[1] + "_" + pp[0];
                    edgelist.push(edge);
                }
                f2e[fid] = edgelist;
                for (let edge of edgelist) {
                    // if (e2f.has(edge)) {
                    if (edge in e2f) {
                        if (e2f[edge].indexOf(fid) == -1) {
                            e2f[edge].push(fid);
                        }
                    } else {
                        e2f[edge] = [fid];
                    }
                }
                ++fid;
            }
            // 面の隣接面をedgeから作成する
            for (let fid_ in f2e) {
                let fid = parseInt(fid_);
                let edgelist = f2e[fid];
                let nfid = [];
                for (let edge of edgelist) {
                    let fidlist = e2f[edge];
                    for (let fidnxt of fidlist) {
                        if (fid == fidnxt) {
                            continue;
                        }
                        // fidnxt が fidの隣接
                        if (fid in f2f) {
                            if (f2f[fid].indexOf(fidnxt) == -1) {
                                f2f[fid].push(fidnxt);
                            } else {
                                // 既に登録済み
                                console.log("fidnxt is overlap in f2f[fid="+fid+"]");
                                // console.assert(0);
                            }
                        } else {
                            f2f[fid] = [fidnxt];
                        }
                    }
                }
            }
            return f2f;
        };
        // 面の法線ベクトルfN, 面の重心fG
        let fG = [];
        let fN = [];
        let crFN2GN = function(f2pid, plist) {
            // 面と点、点の座標を入力に、面の重心と法線ベクトルを求める
            fG = [];
            fN = [];
            // let fid = 0;
            let nfp = f2pid.length;
            for (let i = 0; i < nfp; i+=3) {
                let pi1 = f2pid[i], pi2 = f2pid[i+1], pi3 = f2pid[i+2];
                let p1 =plist[pi1], p2 =plist[pi2], p3 =plist[pi3];
                let vg = p1.add(p2).add(p3).scale(1/3);
                fG.push(vg);
                let vn = vg.clone().normalize();
                fN.push(vn);
            }
            return [fG, fN];
        };
        // ------------------------------
        // 再帰分割のための事前準備：float[] から Vector3[] に
        plist = preProcess(p2xyz);
        // 再帰で面分割
        [plist, f2pid] = buildShpereData(nloop, plist, f2pid);
        // plist -> p2xyz  : Vector3 から float[]に変換
        p2xyz = postProcess(plist);
        // 面の隣接情報
        f2f = crF2F(f2pid);
        // 面の法線ベクトルfN, 面の重心fG
        [fG, fN] = crFN2GN(f2pid, plist);
        let d20 = {plist:plist,
                   f2pid:f2pid,
                   p2xyz:p2xyz,
                   f2f:f2f,
                   fG:fG,
                   fN:fN,
                   R:R,
                  };
        return d20;
    }

    // 自前の三角柱
    let crCustomPrism = function(fid, f2pid, plist, s=1.03) {
        let pi1 = f2pid[fid*3], pi2 = f2pid[fid*3+1], pi3 = f2pid[fid*3+2];
        let p1 =plist[pi1], p2 =plist[pi2], p3 =plist[pi3];
        let p4 = p1.scale(s), p5 = p2.scale(s), p6 = p3.scale(s);
        let vertices = [
            p1.x, p1.y, p1.z,
            p2.x, p2.y, p2.z,
            p3.x, p3.y, p3.z,
            p4.x, p4.y, p4.z,
            p5.x, p5.y, p5.z,
            p6.x, p6.y, p6.z,
        ];
        let faces = [
            0, 2, 1,
            0, 1, 3,
            1, 4, 3,
            1, 2, 4,
            2, 5, 4,
            0, 5, 2,
            0, 3, 5,
            3, 4, 5,
        ];
        let vertexData = new BABYLON.VertexData();
        vertexData.positions = vertices;
        vertexData.indices = faces;
        let mesh_ = new BABYLON.Mesh("", scene);
        vertexData.applyToMesh(mesh_);
        return mesh_;
    }

    let dbgCustomPrismAll = function(f2pid, plist, padj) {
        // 自前の三角柱 / 全面に表示
        let nf = f2pid.length/3, mesh;
        for (let fid = 0; fid < nf; ++fid) {
            mesh = crCustomPrism(fid, f2pid, plist);
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.material.alpha = 0.4;
            mesh.position.addInPlace(padj);
        }
    };
    // let meshS = null;
    // let meshG = null;
    let dbgCustomPrismRandom = function(f2pid, plist, padj) {
        // 自前の三角柱 / ランダムに配置
        let nf = f2pid.length/3, mesh;
        for (let fid = 0; fid < nf; ++fid) {
            if (fid == 0) {
                // mesh = crCustomPrism(fid, f2pid, plist, 1.015);
                mesh = crCustomPrism(fid, f2pid, plist, 1.3);
                mesh.material = new BABYLON.StandardMaterial("", scene);
    	        mesh.material.diffuseColor = BABYLON.Color3.Blue();
                mesh.position.addInPlace(padj);
                // meshS = mesh;
            } else if (fid == nf-1) {
                // mesh = crCustomPrism(fid, f2pid, plist, 1.015);
                mesh = crCustomPrism(fid, f2pid, plist, 1.3);
                mesh.material = new BABYLON.StandardMaterial("", scene);
    	        mesh.material.diffuseColor = BABYLON.Color3.Red();
                mesh.position.addInPlace(padj);
                // meshG = mesh;
            } else if (Math.random() < 0.2) {
                mesh = crCustomPrism(fid, f2pid, plist);
                mesh.material = new BABYLON.StandardMaterial("", scene);
    	        mesh.material.diffuseColor = BABYLON.Color3.Black();
                mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
                mesh.position.addInPlace(padj);
            }
        }
    };

    let d20 = crd20(3);
    dbgCustomPrismRandom(d20.f2pid, d20.plist, padj); // 自前の三角柱 / ランダムに配置

    // デバッグ表示(debug)
    if (0) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }


    // --------------------------------------------------



    let crPlane49 = function() {
        // 宇宙：人工衛星
        let R45 = Math.PI/4;
        let R180 = Math.PI;
        // 本体
        let mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameter:0.6, height:1.2}, scene);
        mesh.position.set(0.0, 0.0, 0.0);
        // パネル
        let mesh1 = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.7, depth:1.4}, scene);
        mesh1.rotation.set(0, 0, R45);
        mesh1.position.set(0, 0.0, 1.0);
        mesh1.parent = mesh;
        let mesh2 = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:0.7, depth:1.4}, scene);
        mesh2.rotation.set(0, 0, R45);
        mesh2.position.set(0, 0.0, -1.0);
        mesh2.parent = mesh;
        // パラボラ
        let mesh3 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.6, slice:0.5, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh3.position.set(0.0, -0.9, 0);
        mesh3.parent = mesh;
        let mesh4 = BABYLON.MeshBuilder.CreateBox("", {width:0.02, height:0.4, depth:0.02}, scene);
        mesh4.rotation.set(0, 0, 0);
        mesh4.position.set(0, -0.9, 0.0);
        mesh4.parent = mesh;
        // スラスター
        let y = 0.7, d = 0.1;
        let plist = [
            [d, y, d],
            [d, y, -d],
            [-d, y, d],
            [-d, y, -d],
        ];
        for (let p of plist) {
            let mesh5 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.15, diameterY:0.3, slice:0.5, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh5.rotation.set(R180, 0, 0.0);
            mesh5.position = BABYLON.Vector3.FromArray(p);
            mesh5.parent = mesh;
        }
        return mesh;
    }

    let crPlane1 = function() {
        // ドローン：グライダー風
        let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.3, height:0.3, depth:4}, scene);
        // キャノピー
        let mesh0 = BABYLON.MeshBuilder.CreateSphere("", {diameterX:0.3, diameterY:0.6, diameterZ:1}, scene);
        mesh0.position.y = 0.15;
        mesh0.position.z = 1.5;
        mesh0.parent = mesh;
        // 主翼
        let mesh1 = BABYLON.MeshBuilder.CreateBox("", {width:4, height:0.1, depth:0.5}, scene);
        mesh1.position.z = 0.0;
        mesh1.parent = mesh;
        // 尾翼
        let mesh2 = BABYLON.MeshBuilder.CreateBox("", {width:1.2, height:0.1, depth:0.3}, scene);
        mesh2.position.z = -1.75;
        mesh2.parent = mesh;
        let mesh3 = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:1.2, depth:0.3}, scene);
        mesh3.position.z = -1.75;
        mesh3.parent = mesh;
        return mesh;
    }

    {
        let mesh1 = crPlane49(); // 宇宙：人工衛星
        mesh1._pc = meshGrnd.position;
        mesh1._r1 = grndY+4.5; // 衛星と地面の距離
        mesh1._rad = 0;
        mesh1._radstep = 0.002;
        mesh1._a = 1;
        mesh1._b = 0.1; // 1;
        mesh1._aph = 0; // R90;
        mesh1._bph = 0; // R90;
        mesh1._pold = mesh1.position.clone();
        mesh1.rotationQuaternion = BABYLON.Quaternion.Identity();
        // mesh1.position.set(-5, grndY+5, 5);
        const R360 = Math.PI*2;
        scene.onBeforeRenderObservable.add(()=>{
            mesh1._rad += mesh1._radstep;
            // if (mesh1._rad > R360) { mesh1._rad -= R360; }
            if (mesh1._rad > 1e5) { mesh1._rad -= 1e5; }
            let rad1 = mesh1._a*mesh1._rad + mesh1._aph;
            let rad2 = mesh1._b*mesh1._rad + mesh1._bph;
            let x = mesh1._r1*Math.sin(rad1)*Math.cos(rad2);
            let y = mesh1._r1*Math.sin(rad1)*Math.sin(rad2);
            let z = mesh1._r1*Math.cos(rad1);
            let p = new BABYLON.Vector3(x,y,z);
            mesh1._pold.copyFrom(mesh1.position);
            // mesh1.position = mesh1._pc.add(p);
            mesh1.position.copyFrom(mesh1._pc.add(p));
            if (1) {
                // 衛星向け：meshのz方向を進行方向に向かせたまま、_pc が下向きになるよう姿勢制御
                // 衛星から_pc方向
                let vUn = mesh1._pc.subtract(mesh1.position).normalize().negate();
                // 移動方向ベクトル
                let tangent = mesh1._pold.subtract(mesh1.position).normalize();
                mesh1.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(tangent, vUn);
            }
        });
    }

    {
        let mesh2 = crPlane1();
        let vs = 0.2;
        mesh2.scaling.set(vs, vs, vs);
        mesh2._pc = meshGrnd.position;
        mesh2._r1 = grndY+2.5; // 衛星と地面の距離
        mesh2._rad = 0;
        mesh2._radstep = 0.001;
        mesh2._a = 1;
        mesh2._b = 0.1; // 1;
        mesh2._aph = 0; // R90;
        mesh2._bph = 0; // R90;
        mesh2._pold = mesh2.position.clone();
        mesh2.rotationQuaternion = BABYLON.Quaternion.Identity();
        const R360 = Math.PI*2;
        scene.onBeforeRenderObservable.add(()=>{
            mesh2._rad += mesh2._radstep;
            if (mesh2._rad > 1e5) { mesh2._rad -= 1e5; }
            let rad1 = mesh2._a*mesh2._rad + mesh2._aph;
            let rad2 = mesh2._b*mesh2._rad + mesh2._bph;
            let x = mesh2._r1*Math.sin(rad1)*Math.cos(rad2);
            let y = mesh2._r1*Math.sin(rad1)*Math.sin(rad2);
            let z = mesh2._r1*Math.cos(rad1);
            let p = new BABYLON.Vector3(x,y,z);
            mesh2._pold.copyFrom(mesh2.position);
            mesh2.position.copyFrom(mesh2._pc.add(p));
            if (1) {
                // 飛行機向け：meshのz方向を進行方向に向かせたまま、_pc が直上になるよう姿勢制御
                // 飛行機から_pc方向
                let vU = mesh2.position.subtract(mesh2._pc).normalize();
                // 移動方向ベクトル
                let tangent = mesh2._pold.subtract(mesh2.position).normalize();
                mesh2.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(tangent, vU);
            }
        });
    }

    let myMesh = BABYLON.MeshBuilder.CreateBox("", {size:1}, scene);
    {
        myMesh._agg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass:1, friction:0.3}, scene);
        myMesh.physicsBody.disablePreStep = false;
        myMesh.material = new BABYLON.StandardMaterial("");
        myMesh.material.alpha = 0.4;
    }

    let resetPosMyMesh = function(posi) {
        myMesh.position.copyFrom(posi);
        // 球面（meshGrnd）の中心から見た法線方向 → myMesh の Up に合わせる
        let vN = posi.subtract(meshGrnd.position).normalize();
        // Forward → Up → Right の順に、vN と平行になりにくい軸を選ぶ
        // （FromLookDirectionLH に渡す forward 軸が up 軸と平行だと姿勢が不定になるため）
        let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(myMesh.rotationQuaternion);
        if (Math.abs(vN.dot(vdir)) > 0.7) {
            vdir = BABYLON.Vector3.Up().applyRotationQuaternion(myMesh.rotationQuaternion);
            if (Math.abs(vN.dot(vdir)) > 0.7) {
                vdir = BABYLON.Vector3.Right().applyRotationQuaternion(myMesh.rotationQuaternion);
                console.log("right");
            } else {
                console.log("up");
            }
        } else {
            console.log("forward");
        }
        // vN を Up として姿勢を作る → myMesh の上方向が球面法線に一致する
        let quat = BABYLON.Quaternion.FromLookDirectionLH(vdir, vN);
        myMesh.physicsBody.setTargetTransform(posi, quat);
    }

    let resetPosMyMesh_org = function(posi) {
        let vN = posi.subtract(meshGrnd.position).normalize();
        let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(myMesh.rotationQuaternion);
        if ( Math.abs(vN.dot(vdir)) > 0.7) {
            vdir = BABYLON.Vector3.Up().applyRotationQuaternion(myMesh.rotationQuaternion);
            if ( Math.abs(vN.dot(vdir)) > 0.7) {
                vdir = BABYLON.Vector3.Right().applyRotationQuaternion(myMesh.rotationQuaternion);
                console.log("right(1)");
            } else {
                console.log("up");
            }
        } else {
            if ( Math.abs(vN.dot(vdir)) > 0.7) {
                vdir = BABYLON.Vector3.Right().applyRotationQuaternion(myMesh.rotationQuaternion);
                console.log("right(2)");
            } else {
                console.log("forward");
            }
        }
        let quat = BABYLON.Quaternion.FromLookDirectionLH(vdir, vN);
        myMesh.physicsBody.setTargetTransform(posi, quat);
    }

    camera.lockedTarget = myMesh;

    myMesh.rotationQuaternion = BABYLON.Quaternion.Identity();
    myMesh.physicsBody.setLinearDamping(10);
    myMesh.physicsBody.setAngularDamping(10);
    {
        let quat = BABYLON.Quaternion.FromLookDirectionLH(BABYLON.Vector3.Forward(), BABYLON.Vector3.Up());
        myMesh.physicsBody.setTargetTransform(myMesh.position, quat);
    }

    let _impF = 3;
    let impFU = _impF*3; // 0.1;
    let impFD = _impF; // 0.1;
    let impFR = _impF; // 0.1;
    let impFL = _impF; // 0.1;
    let impFF = _impF; // 0.1;
    let impFB = _impF; // 0.1;
    const rotRad = 0.08; // 0.02;
    
    // 重力
    scene.onBeforeRenderObservable.add(()=>{
        let vD = meshGrnd.position.subtract(myMesh.position).normalize();
        let impF = 1.2;
        myMesh._agg.body.applyImpulse(vD.scale(impF), myMesh.absolutePosition);
    })

    // Input to direction
    let map ={};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    let quick=false, rightRoll = false, lefttRoll = false;
    let mx=1,mz=1;
    let mvScale=0.2;
    let cooltime_act = 0, cooltime_actIni = 10;

    if (1) {
        let coolTime = 0, coolTimeMax=10;
        scene.registerAfterRender(function() {
            let quat = myMesh.rotationQuaternion;
            if (quat == null) { return;}
            if (map["x"]) {
                let vdir = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                myMesh._agg.body.applyImpulse(vdir.scale(impFU), myMesh.absolutePosition);
            } else if (map["z"]) {
                let vdir = BABYLON.Vector3.Down().applyRotationQuaternion(quat);
                myMesh._agg.body.applyImpulse(vdir.scale(impFD), myMesh.absolutePosition);
            }
            if (map["e"]) {
                let vdir = BABYLON.Vector3.Right().applyRotationQuaternion(quat);
                myMesh._agg.body.applyImpulse(vdir.scale(impFR), myMesh.absolutePosition);
            } else if (map["q"]) {
                let vdir = BABYLON.Vector3.Left().applyRotationQuaternion(quat);
                myMesh._agg.body.applyImpulse(vdir.scale(impFL), myMesh.absolutePosition);
            }
            if (map["d"]) {
                let vR = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                let quat2 = BABYLON.Quaternion.RotationAxis(vR, -rotRad);
                myMesh.physicsBody.setTargetTransform(myMesh.position, quat2.multiply(quat));
            } else if (map["a"]) {
                let vR = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                let quat2 = BABYLON.Quaternion.RotationAxis(vR, rotRad);
                myMesh.physicsBody.setTargetTransform(myMesh.position, quat2.multiply(quat));
            }
            if (map["w"]) {
                let vR = BABYLON.Vector3.Right().applyRotationQuaternion(quat);
                let quat2 = BABYLON.Quaternion.RotationAxis(vR, rotRad);
                myMesh.physicsBody.setTargetTransform(myMesh.position, quat2.multiply(quat));
            } else if (map["s"]) {
                let vR = BABYLON.Vector3.Right().applyRotationQuaternion(quat);
                let quat2 = BABYLON.Quaternion.RotationAxis(vR, -rotRad);
                myMesh.physicsBody.setTargetTransform(myMesh.position, quat2.multiply(quat));
            }
            if (map["ArrowUp"]) {
                let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
                myMesh._agg.body.applyImpulse(vdir.scale(impFF), myMesh.absolutePosition);
            } else if (map["ArrowDown"]) {
                let vdir = BABYLON.Vector3.Backward().applyRotationQuaternion(quat);
                myMesh._agg.body.applyImpulse(vdir.scale(impFB), myMesh.absolutePosition);
            }
            if (map["ArrowRight"]) {
                let vU = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                let quat2 = BABYLON.Quaternion.RotationAxis(vU, rotRad);
                // myMesh.rotationQuaternion = quat2.multiply(quat);
                myMesh.physicsBody.setTargetTransform(myMesh.position, quat2.multiply(quat));

            } else if (map["ArrowLeft"]) {
                let vU = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
                let quat2 = BABYLON.Quaternion.RotationAxis(vU, -rotRad);
                // myMesh.rotationQuaternion = quat2.multiply(quat);
                myMesh.physicsBody.setTargetTransform(myMesh.position, quat2.multiply(quat));
            }
            if (coolTime > 0) {
                --coolTime;
            } else {
                if (map["Enter"]) {
                    coolTime = coolTimeMax;
                    resetPosMyMesh(myMesh.position.clone());
                }
                if (map[" "]) {
                    coolTime = coolTimeMax;
                    let p = myMesh.position.clone();
                }
            }
        });
    }

    if (0) {
        let pg = meshGrnd.position;
console.log("  pg=",[pg.x.toFixed(3) ,pg.y.toFixed(3), pg.z.toFixed(3)]);
console.log("padj=",[padj.x.toFixed(3) ,padj.y.toFixed(3), padj.z.toFixed(3)]);
console.log("padj.y=",padj.y.toFixed(3) );
    }

    {
        let fid = 0;
        let p =d20.fG[fid].clone();
        p.addInPlace(padj);
        let vn = p.subtract(meshGrnd.position).normalize();
        p = vn.scale(d20.R*1.03).add(meshGrnd.position);
console.log("p=",[p.x.toFixed(3) ,p.y.toFixed(3), p.z.toFixed(3)]);
        resetPosMyMesh(p);
    }

    return scene;
} 

// ######################################################################

// box
export var createScene = createScene_test_2104;

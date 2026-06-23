// 正二十面体 / Icosahedron

export var createScene_test_draft_d20_03 = async function () {
    const scene = new BABYLON.Scene(engine);

    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(0, 0, -2));
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        return _camera;
    }
    camera = crCameraDef(); // debug
    camera.setTarget(BABYLON.Vector3.Zero());
    // camera.lockedTarget = myMesh;

    const light = new BABYLON.HemisphericLight("", new BABYLON.Vector3(0, 50, 0));
    light.intensity = 0.7;
    const light2 = new BABYLON.HemisphericLight("", new BABYLON.Vector3(0, -50, 0));
    light2.intensity = 0.2;

    // ----------------------------------------
    // 外接球半径
    //   一辺の長さa=2として R = sqrt(10+2*sqrt(5))/4*a
    let R = Math.sqrt(10+2*Math.sqrt(5))/2;

    // 黄金比 phi
    const t = (1 + Math.sqrt(5)) / 2;

    // let vertices = [
    let p2xyz = [
        0, -1,  t, // 0: * * * * *
        0,  1,  t, // 1:   * *       *       *                       *
        0, -1, -t, // 2:                 *         * *         * *
        0,  1, -t, // 3:                         * * * * *
        t,  0, -1, // 4:               *         * *         * *
        t,  0,  1, // 5: * *         * *                     *
       -t,  0, -1, // 6:                   *         * *         * *
       -t,  0,  1, // 7:     * *           * *                     *
       -1,  t,  0, // 8:                     *         * *         * *
        1,  t,  0, // 9:             *           *       *   *       *
       -1, -t,  0, //10:       * *       * *                     *
        1, -t,  0, //11: *       *     * *                     *
    ];

    // let faces = [
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

    // subdivision の基本
    //
    // 1. triangle を：
    //
    //       A
    //      / ＼
    //     /   ＼
    //    M-----N
    //   / ＼  / ＼
    //  /   ＼/   ＼
    // B-----P-----C
    //
    // のように4 triangleへ分割。

    // 2. face の変換
    //
    // 元：
    // [a,b,c]
    // ↓
    // [a,ab,ca]
    // [b,bc,ab]
    // [c,ca,bc]
    // [ab,bc,ca]

    // step1. 座標値リストを作成
    //    基準点(そのまま踏襲)
    //      p1のindex i1をキーに
    //      key = `i1_i1`
    //      val = v[i1]

    //    中間座標を作成
    //      p1,p2のindex i1,i2をキーに
    //      if (i1 > i2) { [i1,i2] =[i2,i1];}
    //      key = `i1_i2`
    //      val = (v[i1]+v[i2])/2 .normalize().scale(R)

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
        // debug
        if (0) {
            let nf = 0;
            for (let k in e2f) {
                nf += e2f[k].length;
            }
            console.log("e2f.neky=",Object.keys(e2f).length);
            console.log("e2f.nf  =",nf);
            console.log("-- f2e ----------");
            for (let fid in f2e) {
                let edgelist = f2e[fid];
                console.log("fid=",fid,"  e=", edgelist);
            }
            console.log("-- e2f ----------");
            for (let eid in e2f) {
                let flist = e2f[eid];
                console.log("eid=",eid,"  f=", flist);
            }
        }
        // 面の隣接面をedgeから作成する
        for (let fid in f2e) {
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
                            console.assert(0);
                        }
                    } else {
                        f2f[fid] = [fidnxt];
                    }
                }
            }
        }
        // debug
        if (0) {
            let nf = 0;
            for (let fid in f2f) {
                nf += f2f[fid].length
            }
            console.log("f2f.nkey=",Object.keys(f2f).length);
            console.log("f2f.nf  =",nf);
            console.log("-- f2f ----------");
            for (let fid in f2f) {
                let flist = f2f[fid];
                console.log("fid=",fid,"  f=", flist);
            }
        }
        return f2f;
    };

    // 面の法線ベクトルfN, 面の重心fG
    let fG = [];
    let fN = [];
    let crFN2GN = function(f2pid, plist) {
        // 面と点、点の座標を入力に、面の重心と法線ベクトルを求める
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

    // ------------------------------------------------------------

    // debug
    let dbgSphereG = function(fG) {
        // 重心に球
        for (let p of fG) {
            let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.1}, scene);
            mesh.position = p;
        }
    }

    let dbgBoxG = function(fG, fN) {
        // 重心から棒（Z方向に伸ばした棒を重心位置から法線方向に向ける）
        let i = 0;
        for (let p of fG) {
            let vN = fN[i];
            let mesh = BABYLON.MeshBuilder.CreateBox("", {size:0.1, depth:1}, scene);
            mesh.position = p.add(vN.scale(0.5));
            mesh.lookAt(mesh.position.add(vN));
            ++i;
        }
    };

    let dbgCylinderAll = function(f2pid, plist, fG, fN) {
        // 三角柱を表面に配置
        let fid = 0, nfp = f2pid.length, mesh, sh=0.5;
        for (let i = 0; i < nfp; i+=3) {
            let pi1 = f2pid[i], pi2 = f2pid[i+1];
            let p1 =plist[pi1], p2 =plist[pi2];
            let v12 = p2.subtract(p1);
            let vG = fG[fid];
            let vN = fN[fid];
            if (nloop == 0) {
                mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:1.3, diameterBottom:1.1, height:0.5, tessellation:3}, scene); // for noop=1
            } else if (nloop == 1) {
                mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:1.3, diameterBottom:1.1, height:0.5, tessellation:3}, scene); // for noop=1
            } else if (nloop == 2) {
                mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:0.9, diameterBottom:0.7, height:0.5, tessellation:3}, scene); // for noop=2
            } else if (nloop == 3) {
                mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:0.3, diameterBottom:0.2, height:0.5, tessellation:3}, scene); // for noop=2
            }
            mesh.position = vG.add(vN.scale(sh));
            mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(v12, vN);
            // mesh.lookAt(mesh.position.add(v12));
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.material.alpha = 0.4;
            ++fid;
        }
    }
    let dbgCylinderRandum = function(f2pid, plist, vG, vN) {
        // ランダムな位置に三角柱
        let fid = 0, nfp = f2pid.length, mesh, sh=0.5, nf = nfp/3;
        for (let i = 0; i < nfp; i+=3) {
            let pi1 = f2pid[i], pi2 = f2pid[i+1];
            let p1 =plist[pi1], p2 =plist[pi2];
            let v12 = p2.subtract(p1);
            let vG = fG[fid];
            let vN = fN[fid];
            if (nloop == 1) {
                if (Math.random() < 0.3) {
                    sh= 1.0;
                    mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:2.1, diameterBottom:1.2, height:sh, tessellation:3}, scene); // for noop=1
                    mesh.position = vG.add(vN.scale(sh/2));
                    mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(v12, vN);
                    mesh.material = new BABYLON.StandardMaterial("", scene);
                    mesh.material.alpha = 0.4;
                }
            } else if (nloop == 2) {
                if (Math.random() < 0.3) {
                    sh= 1.0;
                    mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:0.9, diameterBottom:0.7, height:sh, tessellation:3}, scene); // for noop=1
                    mesh.position = vG.add(vN.scale(sh/2));
                    mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(v12, vN);
                    mesh.material = new BABYLON.StandardMaterial("", scene);
                    mesh.material.alpha = 0.4;
                }
            }
            ++fid;
        }
    };

    // 自前の三角柱
    let crCustomPrism = function(fid, f2pid, plist, s=1.2) {
        let pi1 = f2pid[fid*3], pi2 = f2pid[fid*3+1], pi3 = f2pid[fid*3+2];
        let p1 =plist[pi1], p2 =plist[pi2], p3 =plist[pi3];
        let p4 = p1.scale(s), p5 = p2.scale(s), p6 = p3.scale(s);
        //     _______
        // p4 *_    _-*p6
        //    |  -*-  |
        //    |   |5  |
        // p1 *-_ | _-* p3
        //       -*-
        //        p2
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
        let mesh = new BABYLON.Mesh("", scene);
        vertexData.applyToMesh(mesh);
        return mesh
    }

    let dbgCustomPrismAll = function(f2pid, plist) {
        // 自前の三角柱 / 全面に表示
        let nf = f2pid.length/3, mesh;
        for (let fid = 0; fid < nf; ++fid) {
            mesh = crCustomPrism(fid, f2pid, plist);
            mesh.material = new BABYLON.StandardMaterial("", scene);
            mesh.material.alpha = 0.4;
        }
    };

    let dbgCustomPrismRandom = function(f2pid, plist) {
        // 自前の三角柱 / ランダムに配置
        let nf = f2pid.length/3, mesh;
        for (let fid = 0; fid < nf; ++fid) {
            if (fid == 0) {
                mesh = crCustomPrism(fid, f2pid, plist, 1.01);
                mesh.material = new BABYLON.StandardMaterial("", scene);
    	        mesh.material.diffuseColor = BABYLON.Color3.Blue();
            } else if (fid == nf-1) {
                mesh = crCustomPrism(fid, f2pid, plist, 1.01);
                mesh.material = new BABYLON.StandardMaterial("", scene);
    	        mesh.material.diffuseColor = BABYLON.Color3.Red();
            } else if (Math.random() < 0.3) {
                mesh = crCustomPrism(fid, f2pid, plist);
                mesh.material = new BABYLON.StandardMaterial("", scene);
    	        mesh.material.diffuseColor = BABYLON.Color3.Black();
            }
        }
    };

    let crMeshSphere = function(p2xyz, f2pid) {
        // 多面体：球の表示
        let vertexData = new BABYLON.VertexData();
        vertexData.positions = p2xyz; // vertices;
        vertexData.indices = f2pid; // faces;
        let customMesh = new BABYLON.Mesh("", scene);
        vertexData.applyToMesh(customMesh);
        customMesh.material = new BABYLON.StandardMaterial("", scene);
        return customMesh;
    };

    // デバッグ用ラベル表示
    let makeTextPlane = function(text, color, size) {
    	var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
    	dynamicTexture.hasAlpha = true;
    	dynamicTexture.drawText(text, 5, 40, "bold 16px Arial", color , "transparent", true);
    	var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
    	plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
    	plane.material.backFaceCulling = false;
    	plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    	plane.material.diffuseTexture = dynamicTexture;
        plane.billboardMode = 7;
    	return plane;
    };

    let dbgLabelOnN = function(p2xyz) {
        // 頂点の位置にNodeIDを表示
        let n = p2xyz.length, iloop = 0;
        for (let i = 0; i < n; i+= 3) {
            let x = p2xyz[i], y = p2xyz[i+1], z = p2xyz[i+2];
	    let mesh = makeTextPlane(""+iloop,"black", 1.5);
	    mesh.position = new BABYLON.Vector3(x,y,z);
            mesh.position.x += 0.3;
            mesh.position.y += 0.3;
            mesh.position.z -= 0.1;
            ++iloop;
        }
    };

    let dbgLabelOnFG = function(fG) {
        // 面の重心位置にFaceIDを表示
        let mesh;
        for (let fid = 0; fid < fG.length; ++fid) {
            if (nloop <= 1) {
	        mesh = makeTextPlane(""+fid,"black", 0.3);
	        mesh.position = fG[fid].clone();
                mesh.position.x += 0.1;
                mesh.position.y += 0.1;
                mesh.position.z -= 0.1;
            } else if (nloop == 2) {
	        mesh = makeTextPlane(""+fid,"black", 0.2);
	        mesh.position = fG[fid].clone();
                mesh.position.x += 0.1;
                mesh.position.y += 0.1;
                mesh.position.z -= 0.2;
            } else if (nloop == 3) {
	        mesh = makeTextPlane(""+fid,"black", 0.1);
	        mesh.position = fG[fid].clone();
                mesh.position.x += 0.0;
                mesh.position.y += 0.02;
                mesh.position.z -= 0.1;
            } else {
            }
        }
    };

    // ----------------------------------------
    // 壁＝ブロックの迷路作成
    // block[] = idx:FaceID, val:壁の有無
    let crMaze1 = function(f2f, opt={}) {
        let startF = typeof(opt.startF) !== 'undefined' ? opt.startF : 0; // 開始面
        let blockP = typeof(opt.blockP) !== 'undefined' ? opt.blockP : 0.3; // ブロック発生確率
        let nf = Object.keys(f2f).length;
        let blockF = new Array(nf).fill(0); // ブロック面のフラグ
        for (let fid = 0; fid < nf; ++fid) {
            if (fid == startF) {
                continue;
            }
            if (Math.random() < blockP) {
                blockF[fid] = 1;
            }
        }
        // ゴール地点：スタート位置から到達できるもっとも遠い位置を選ぶ
        // - step1. それぞれの面に対し、壁を-1、通路を0とする
        // - step2. スタート位置からの経路長を step1のデータよりもとめ、最大値を持つ面がゴール位置
        let pathF = new Array(nf).fill(0); // ブロック面のフラグ
        // step1
        for (let fid = 0; fid < nf; ++fid) {
            if (blockF[fid] == 1) {
                pathF[fid] = -1;
            }
        }
        // step2
        pathF[startF] = 1;
        if (0) {
            console.log("-- ini pathF= --------------------");
            for (let fid = 0; fid < pathF.length; ++fid) {
                console.log(" pathF["+fid+"]="+pathF[fid]);
            }
        }
        let stack = [startF];
        let _loop=0, _loopMax=nf*2+10;
        while (stack.length > 0) {
            if (_loop++ > _loopMax) { break; }
            let fid = stack.shift();
            let vnxt = pathF[fid] + 1;
            for (let ii in f2f[fid]) {
                let fidn = f2f[fid][ii];
                if (pathF[fidn] < 0) {
                    continue;
                }
                if (pathF[fidn] == 0) {
                    pathF[fidn] = vnxt;
                    stack.push(fidn);
                } else {
                }
            }
        }
        console.assert(stack.length == 0);
        if (0) {
            // スタートからの経路長を表示
            for (let fid = 0; fid < nf; ++fid) {
	        mesh = makeTextPlane(""+pathF[fid],"red", 0.2);
	        mesh.position = fG[fid].clone();
                mesh.position.x += 0.1;
                mesh.position.y += 0.18; // 0.1;
                mesh.position.z -= 0.2;
            }
        }
        let fidmax = startF, vmax = 1;
        for (let fid = 0; fid < nf; ++fid) {
            if (vmax < pathF[fid]) {
                vmax = pathF[fid];
                fidmax = fid;
            }
        }
        console.log("fidmax=",fidmax,"  vmax=",vmax);
        return [blockF, startF, fidmax];
    };

    let dbgCustomPrismMaze1 = function(blockF, startF, goalF, f2pid, plist) {
        // crMaze1 でつくった迷路に沿って三角柱を配置
        let nf = f2pid.length/3, mesh;
        for (let fid = 0; fid < nf; ++fid) {
            if (fid == startF) {
                mesh = crCustomPrism(fid, f2pid, plist, 1.01);
                mesh.material = new BABYLON.StandardMaterial("", scene);
    	        mesh.material.diffuseColor = BABYLON.Color3.Blue();
            } else if (fid == goalF) {
                mesh = crCustomPrism(fid, f2pid, plist, 1.01);
                mesh.material = new BABYLON.StandardMaterial("", scene);
    	        mesh.material.diffuseColor = BABYLON.Color3.Red();
            } else if (blockF[fid] == 1) {
                mesh = crCustomPrism(fid, f2pid, plist);
                mesh.material = new BABYLON.StandardMaterial("", scene);
    	        mesh.material.diffuseColor = BABYLON.Color3.Gray();
            }
        }
    };

    // ----------------------------------------
//    let nloop = 0; // 分割回数 : 20面体
//    let nloop = 1; // 分割回数 80面体
    let nloop = 2; // 分割回数 320面体
//    let nloop = 3; // 分割回数 1280面体

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

    // 多面体：球の表示
    let mesh = crMeshSphere(p2xyz, f2pid);
//    mesh.material.alpha = 0.2;
//    mesh.material.wireframe = 1;

//    dbgSphereG(fG); // 重心に球
//    dbgBoxG(fG, fN); // 重心から棒（Z方向に伸ばした棒を重心位置から法線方向に向ける）
//    dbgCylinderAll(f2pid, plist, fG, fN); // 三角柱を表面に配置
//    dbgCustomPrismAll(f2pid, plist);    // 自前の三角柱 / 全面に表示
//    dbgCustomPrismRandom(f2pid, plist); // 自前の三角柱 / ランダムに配置

    if(1) {
        // 壁＝ブロックの迷路作成
        // let [blockF, startF, goalF] = crMaze1(f2f);
        let opt = {startF:11, blockP:0.3,};
        if (nloop == 1) {
            opt = {startF:44, blockP:0.3,};
        } else if (nloop == 2) {
            opt = {startF:177, blockP:0.3,};
        } else if (nloop == 3) {
            opt = {startF:705, blockP:0.3,};
        }
        let [blockF, startF, goalF] = crMaze1(f2f, opt);
        // crMaze1 でつくった迷路に沿って三角柱を配置
        dbgCustomPrismMaze1(blockF, startF, goalF, f2pid, plist);
    }

//    dbgLabelOnN(p2xyz); // 頂点の位置にNodeIDを表示
//    dbgLabelOnFG(fG); // 面の重心位置にFaceIDを表示

    return scene;
};


// ======================================================================


export var createScene = createScene_test_draft_d20_03; // FaceIDのLabel表示 + bugFix => maze

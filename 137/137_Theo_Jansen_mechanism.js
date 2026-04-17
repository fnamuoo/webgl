// Babylon.js で物理演算(havok)：テオ・ヤンセン機構で歩かせてみる

// テオヤンセン機構
// Theo Jansen mechanism
// https://opeo.jp/library/onepoint/others/applied_calculation/theo_jansen/

/*
                P4    50.0       P3
                 *----------------*
              _- |               /| 15.0
           __-   |             _- |
   55.8  _-      | 41.5      _-  (*)P0
     __--        |         _-     |
P6 _-  40.1    P2|       _-     P1| 7.8
  *-------------(*)--------------(*)
  |              |     _-   38.0
  |39.4      39.3|   _-
P7|    36.7    P5| _- 61.9
  *--------------*-
  |          __-~
  |65.7 __---
  |__---    49.0
  *
P8

*/

export var createScene_test11 = async function () {
    const R0 = 0;
    const R90 = Math.PI/2;
    const R120 = Math.PI*2/3;
    const R180 = Math.PI;
    const R240 = Math.PI*4/3;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3* Math.PI / 2, 1 * Math.PI / 8, 50, new BABYLON.Vector3(0, 0, -5));
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    if (1) {
        let grndW=300, grndH=300;
        let mesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
    }

    const pplen = {
        1:7.8,
        3:15.0,
        12:38.0,
        24:41.5,
        25:39.3,
        26:40.1,
        34:50.0,
        35:61.9,
        46:55.8,
        57:36.7,
        58:49.0,
        67:39.4,
        78:65.7,
    };
    let pplensq = {};

    Object.keys(pplen).forEach(key => {
        let len = pplen[key] / 5.0;
        pplen[key] = len;
        pplensq[key] = len*len;
    });

    const meshR = 1;
    const mass = 1;

    // 120度ずつ＋y軸対象（x反転
    //   idx | v2list              | meshlist
    //   0-2 | 計算用              | 描画用
    //   3-5 | 計算用(-rad & x反転 | 描画用
    //   6-8 | 計算用(-rad)
    //   逆位相(idx=3-5)の位置計算と描画位置を兼用するとrender時にちらつく。安定するよう、一時計算用と描画用を分けておく
    let nphase = 6;
    let nphase2 = 9; // 計算用も含めたphaseの数
    let n = 9; // ノード数
    let v2listlist = [];
    let meshlistlist = [];
    let linesystemlist = [];
    for (let iphase = 0; iphase < nphase2; ++iphase) {
        let v2list = [];
        for (let i = 0; i < n; ++i) {
            v2list.push(new BABYLON.Vector2(0,0));
        }
        // 固定点の設定
        v2list[0].set(0,0);
        v2list[1].set(0,-pplen[1]);
        v2list[2].set(-pplen[12],-pplen[1]);
        v2listlist.push(v2list);

        if (iphase >= nphase) {
            continue;
        }
        let meshlist = [];
        for (let i = 0; i < n; ++i) {
            let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: meshR}, scene);
            if (i == 1) {
                // 不要な点:gray
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseColor = BABYLON.Color3.Black();
            } else if ((iphase % 3)== 0) {
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseColor = BABYLON.Color3.Red();
            } else if ((iphase % 3)== 1) {
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseColor = BABYLON.Color3.Green();
            } else if ((iphase % 3)== 2) {
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseColor = BABYLON.Color3.Blue();
            }
            meshlist.push(mesh);
        }
        meshlistlist.push(meshlist);
        //
        linesystemlist.push(null);
    }

    let calcPosi = function(rad_, v2list_, pplen) {
        // 点P3/点Aの座標値
        v2list_[3] = new BABYLON.Vector2(pplen[3],0).rotate(rad_);
        // 点P4/点Cの座標値
        // 三角形P3-P2-P4//ABCにおいて、P3-P2/ABを底面とした場合の頂点P4/Cの位置を求める
        // まず辺P3-P2/ABの長さを確定させる
        let L23sq = v2list_[3].subtract(v2list_[2]).lengthSquared();
        let L23 = Math.sqrt(L23sq);
        // ローカル座標系（三角形P3-P2-P4//ABCにおいて、P3-P2/ABを底面とした場合）の頂点の座標(cx,cy)を求める
        let xc = (L23sq + pplensq[24] - pplensq[34]) / (2.0*L23);
        let yc = Math.sqrt(pplensq[24] - xc*xc );
        // 底辺(P2-P3)とx軸の角度（三角形の傾き）をもとめ、..
        let rx23 = Math.atan2(v2list_[3].y-v2list_[2].y, v2list_[3].x-v2list_[2].x);
        // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
        v2list_[4] = v2list_[2].add(new BABYLON.Vector2(xc,yc).rotate(rx23));
        // 点P6/点Eの座標値
        // 三角形P4-P2-P6//CBEにおいて、P4-P2/CBを底面とした場合の頂点P6/Eの位置を求める
        xc = (pplensq[24] + pplensq[26] - pplensq[46]) / (2.0*pplen[24]);
        yc = Math.sqrt(pplensq[26] - xc*xc );
        let rx24 = Math.atan2(v2list_[4].y-v2list_[2].y, v2list_[4].x-v2list_[2].x);
        v2list_[6] = v2list_[2].add(new BABYLON.Vector2(xc,yc).rotate(rx24));
        // 点P5/点Dの座標値
        // 三角形P3-P2-P5//ABDにおいて、P3-P2/ABを底面とした場合の頂点P5/Dの位置を求める
        xc = (L23sq + pplensq[25] - pplensq[35]) / (2.0*L23);
        yc = Math.sqrt(pplensq[25] - xc*xc );
        // 角度は rx23が利用可能。ただし、三角形が上下逆なのでyをマイナスに
        v2list_[5] = v2list_[2].add(new BABYLON.Vector2(xc,-yc).rotate(rx23));
        // 点P7/点Fの座標値
        // 三角形P5-P6-P7//DEFにおいて、P5-P6/DEを底面とした場合の頂点P7/Fの位置を求める
        let L56sq = v2list_[5].subtract(v2list_[6]).lengthSquared();
        let L56 = Math.sqrt(L56sq);
        xc = (L56sq + pplensq[57] - pplensq[67]) / (2.0*L56);
        yc = Math.sqrt(pplensq[57] - xc*xc );
        let rx56 = Math.atan2(v2list_[6].y-v2list_[5].y, v2list_[6].x-v2list_[5].x);
        v2list_[7] = v2list_[5].add(new BABYLON.Vector2(xc,yc).rotate(rx56));
        // 点P8/点Gの座標値
        // 三角形P5-P7-P8//DFGにおいて、P5-P7/DFを底面とした場合の頂点P8/Gの位置を求める
        xc = (pplensq[57] + pplensq[58] - pplensq[78]) / (2.0*pplen[57]);
        yc = Math.sqrt(pplensq[58] - xc*xc );
        let rx57 = Math.atan2(v2list_[7].y-v2list_[5].y, v2list_[7].x-v2list_[5].x);
        v2list_[8] = v2list_[5].add(new BABYLON.Vector2(xc,yc).rotate(rx57));
        return v2list_;
    }

    let calcPosiAll = function(rad, v2listlist) {
        v2listlist[0] = calcPosi(rad, v2listlist[0], pplen);
        v2listlist[1] = calcPosi(rad+R120, v2listlist[1], pplen);
        v2listlist[2] = calcPosi(rad+R240, v2listlist[2], pplen);
        // y軸対象（x反転
        // 一旦　-rad で計算したうえで、xを反転
        v2listlist[6] = calcPosi(-rad, v2listlist[6], pplen);
        v2listlist[7] = calcPosi(-rad-R120, v2listlist[7], pplen);
        v2listlist[8] = calcPosi(-rad-R240, v2listlist[8], pplen);
        for (let ii = 3; ii < 6; ++ii) {
            let v2list1 = v2listlist[ii+3];
            let v2list2 = v2listlist[ii];
            for (let i = 0; i < v2list1.length; ++i) {
                v2list2[i].x = -(v2list1[i].x);
                v2list2[i].y = v2list1[i].y;
            }
            v2listlist[ii] = v2list2;
        }
        return v2listlist;
    }

    let updatePosi = function(v2list, meshlist) {
        // 座標値の反映
        for (let i = 0; i < n; ++i) {
            meshlist[i].position.x = v2list[i].x;
            meshlist[i].position.z = v2list[i].y;
        }
        return meshlist;
    }

    let drawLine = function(meshlist, linesystem) {
        // 線の描画
	let myLines = [
            [ meshlist[0].position, meshlist[3].position ],
            [ meshlist[2].position, meshlist[4].position ],
            [ meshlist[2].position, meshlist[5].position ],
            [ meshlist[2].position, meshlist[6].position ],
            [ meshlist[3].position, meshlist[4].position ],
            [ meshlist[3].position, meshlist[5].position ],
            [ meshlist[4].position, meshlist[6].position ],
            [ meshlist[5].position, meshlist[7].position ],
            [ meshlist[5].position, meshlist[8].position ],
            [ meshlist[6].position, meshlist[7].position ],
            [ meshlist[7].position, meshlist[8].position ],
	];
        if (linesystem == null) {
            // 最初
	    linesystem = BABYLON.MeshBuilder.CreateLineSystem("linesystem", {lines: myLines, updatable:true}); 
            return linesystem;
        }
        // ２回目以降（座標更新時
	BABYLON.MeshBuilder.CreateLineSystem("linesystem", {lines: myLines, instance: linesystem}); 
        return linesystem;
    }

    let drawLineAll = function(v2listlist, meshlistlist, linesystemlist) {
        for (let iphase = 0; iphase < nphase; ++iphase) {
            let v2list = v2listlist[iphase];
            let meshlist = meshlistlist[iphase];
            let linesystem = linesystemlist[iphase];
            meshlist = updatePosi(v2list, meshlist);
            linesystem = drawLine(meshlist, linesystem);
            linesystemlist[iphase] = linesystem;
        }
        return linesystemlist;
    }

    let rad = 0;
    v2listlist = calcPosiAll(rad, v2listlist);
    linesystemlist = drawLineAll(v2listlist, meshlistlist, linesystemlist);

    let radstep = 0.01, r=pplen[3];
    let nloop = 3, bon = true;
    if (1) {
        scene.onBeforeRenderObservable.add(() => {
            if (bon) {
                rad += radstep;
                if (rad >= R360) { rad -= R360; --nloop;  }
                if (rad >= R0 && nloop == 0) { rad = R0; bon = false; }
                v2listlist = calcPosiAll(rad, v2listlist);
                linesystemlist = drawLineAll(v2listlist, meshlistlist, linesystemlist);
            }
        })
    }

    return scene;
}

export var createScene_test13_6 = async function () {
    const R0 = 0;
    const R60 = Math.PI/3;
    const R90 = Math.PI/2;
    const R120 = Math.PI*2/3;
    const R180 = Math.PI;
    const R240 = Math.PI*4/3;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3* Math.PI / 2, 3 * Math.PI / 8, 50, new BABYLON.Vector3(0, -5, 0));
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8/5, 0), hk);

    const FILTER_GROUP_GRND = 1;
    const FILTER_GROUP_ARCH_1 = 2;

    if (1) {
        let grndW=300, grndH=300;
        let mesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        mesh.position.y = -20;
        mesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01, friction:2.0 }, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_GRND;
    }

    {
        // 座標軸代わりの面
        let sizeW=30, sizeH=30;
        let mesh = BABYLON.MeshBuilder.CreatePlane("", { width:sizeW, height:sizeH }, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Red();
        mesh.material.alpha = 0.1;
        let mesh2 = BABYLON.MeshBuilder.CreatePlane("", { width:sizeW, height:sizeH }, scene);
        mesh2.rotation.x = R90;
        mesh2.material = new BABYLON.StandardMaterial("");
        mesh2.material.diffuseColor = BABYLON.Color3.Green();
        mesh2.material.alpha = 0.1;
        let mesh3 = BABYLON.MeshBuilder.CreatePlane("", { width:sizeW, height:sizeH }, scene);
        mesh3.rotation.y = R90;
        mesh3.material = new BABYLON.StandardMaterial("");
        mesh3.material.diffuseColor = BABYLON.Color3.Blue();
        mesh3.material.alpha = 0.1;
    }

    const pplen = {
        1:7.8,
        3:15.0,
        12:38.0,
        24:41.5,
        25:39.3,
        26:40.1,
        34:50.0,
        35:61.9,
        46:55.8,
        57:36.7,
        58:49.0,
        67:39.4,
        78:65.7,
    };
    let pplensq = {};

    Object.keys(pplen).forEach(key => {
        let len = pplen[key] / 5.0;
        pplen[key] = len;
        pplensq[key] = len*len;
    });

    // const meshR = 1, boxw = 1, boxw_ = boxw/2, boxh = 0.2, boxh_ = boxh/2, nlayer = 3, layerD = 10, layerRad = R120, impF=20.0;//ok
    // const meshR = 1, boxw = 1, boxw_ = boxw/2, boxh = 0.2, boxh_ = boxh/2, nlayer = 6, layerD = 10, layerRad = R120, impF=20.0;

    // const meshR = 1, boxw = 1, boxw_ = boxw/2, boxh = 0.2, boxh_ = boxh/2, nlayer = 8, layerD = 5, layerRad = R90, impF=25.0; //ok:slow
    // const meshR = 1, boxw = 1, boxw_ = boxw/2, boxh = 0.2, boxh_ = boxh/2, nlayer = 8, layerD = 5, layerRad = R90, impF=28.0;
    const meshR = 1, boxw = 1, boxw_ = boxw/2, boxh = 0.2, boxh_ = boxh/2, nlayer = 8, layerD = 5, layerRad = R90, impF=30.0; //がたがた
    // const meshR = 1, boxw = 1, boxw_ = boxw/2, boxh = 0.2, boxh_ = boxh/2, nlayer = 8, layerD = 5, layerRad = R90, impF=40.0; //ウィリー

    const nlayer2 = nlayer*2, nlayer3 = nlayer*3;
    const mesh012D = (nlayer-1)*layerD, mesh012D_=mesh012D/2;
    const mass = 1;

    // ３層、120度ずつ＋y軸対象（x反転の場合
    //   idx | v2list              | meshlist
    //   0-2 | 計算用              | 描画用
    //   3-5 | 計算用(-rad & x反転 | 描画用
    //   6-8 | 計算用(-rad)
    //   逆位相(idx=3-5)の位置計算と描画位置を兼用するとrender時にちらつく。安定するよう、一時計算用と描画用を分けておく
    let nphase = nlayer*2;
    let nphase2 = nlayer*3; // 計算用も含めたphaseの数
    let n = 9;
    let v2listlist = [];
    let meshlistlist = [];
    for (let iphase = 0; iphase < nphase2; ++iphase) {
        let v2list = [];
        for (let i = 0; i < n; ++i) {
            v2list.push(new BABYLON.Vector2(0,0));
        }
        // 固定点の設定
        v2list[0].set(0,0);
        v2list[1].set(0,-pplen[1]);
        v2list[2].set(-pplen[12],-pplen[1]);
        v2listlist.push(v2list);

        if (iphase >= nphase) {
            continue;
        }
        // 以下、「計算用(-rad)」
        let meshlist = [];
        for (let i = 0; i < n; ++i) {
            let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: meshR}, scene);
            if (i == 1) {
                // 不要な点
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseColor = BABYLON.Color3.Black();
            } else if ((iphase % 3)== 0) {
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseColor = BABYLON.Color3.Red();
            } else if ((iphase % 3)== 1) {
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseColor = BABYLON.Color3.Green();
            } else if ((iphase % 3)== 2) {
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseColor = BABYLON.Color3.Blue();
            }
            if (i < 3) {
                mesh.visibility = 0; // 不可視に
            }
            meshlist.push(mesh);
        }
        meshlistlist.push(meshlist);
    }

    let calcPosi = function(rad_, v2list_, pplen) {
        // 点P3/点Aの座標値
        v2list_[3] = new BABYLON.Vector2(pplen[3],0).rotate(rad_);
        // 点P4/点Cの座標値
        // 三角形P3-P2-P4//ABCにおいて、P3-P2/ABを底面とした場合の頂点P4/Cの位置を求める
        // まず辺P3-P2/ABの長さを確定させる
        let L23sq = v2list_[3].subtract(v2list_[2]).lengthSquared();
        let L23 = Math.sqrt(L23sq);
        // ローカル座標系（三角形P3-P2-P4//ABCにおいて、P3-P2/ABを底面とした場合）の頂点の座標(cx,cy)を求める
        let xc = (L23sq + pplensq[24] - pplensq[34]) / (2.0*L23);
        let yc = Math.sqrt(pplensq[24] - xc*xc );
        // 底辺(P2-P3)とx軸の角度（三角形の傾き）をもとめ、..
        let rx23 = Math.atan2(v2list_[3].y-v2list_[2].y, v2list_[3].x-v2list_[2].x);
        // 頂点(cx,cy)を回転→平行移動させ、ローカル座標系からworld座標系へ射影する
        v2list_[4] = v2list_[2].add(new BABYLON.Vector2(xc,yc).rotate(rx23));
        // 点P6/点Eの座標値
        // 三角形P4-P2-P6//CBEにおいて、P4-P2/CBを底面とした場合の頂点P6/Eの位置を求める
        xc = (pplensq[24] + pplensq[26] - pplensq[46]) / (2.0*pplen[24]);
        yc = Math.sqrt(pplensq[26] - xc*xc );
        let rx24 = Math.atan2(v2list_[4].y-v2list_[2].y, v2list_[4].x-v2list_[2].x);
        v2list_[6] = v2list_[2].add(new BABYLON.Vector2(xc,yc).rotate(rx24));
        // 点P5/点Dの座標値
        // 三角形P3-P2-P5//ABDにおいて、P3-P2/ABを底面とした場合の頂点P5/Dの位置を求める
        xc = (L23sq + pplensq[25] - pplensq[35]) / (2.0*L23);
        yc = Math.sqrt(pplensq[25] - xc*xc );
        // 角度は rx23が利用可能。ただし、三角形が上下逆なのでyをマイナスに
        v2list_[5] = v2list_[2].add(new BABYLON.Vector2(xc,-yc).rotate(rx23));
        // 点P7/点Fの座標値
        // 三角形P5-P6-P7//DEFにおいて、P5-P6/DEを底面とした場合の頂点P7/Fの位置を求める
        let L56sq = v2list_[5].subtract(v2list_[6]).lengthSquared();
        let L56 = Math.sqrt(L56sq);
        xc = (L56sq + pplensq[57] - pplensq[67]) / (2.0*L56);
        yc = Math.sqrt(pplensq[57] - xc*xc );
        let rx56 = Math.atan2(v2list_[6].y-v2list_[5].y, v2list_[6].x-v2list_[5].x);
        v2list_[7] = v2list_[5].add(new BABYLON.Vector2(xc,yc).rotate(rx56));
        // 点P8/点Gの座標値
        // 三角形P5-P7-P8//DFGにおいて、P5-P7/DFを底面とした場合の頂点P8/Gの位置を求める
        xc = (pplensq[57] + pplensq[58] - pplensq[78]) / (2.0*pplen[57]);
        yc = Math.sqrt(pplensq[58] - xc*xc );
        let rx57 = Math.atan2(v2list_[7].y-v2list_[5].y, v2list_[7].x-v2list_[5].x);
        v2list_[8] = v2list_[5].add(new BABYLON.Vector2(xc,yc).rotate(rx57));
        return v2list_;
    }

    let calcPosiAll = function(rad, v2listlist) {
        for (let ilayer = 0; ilayer < nlayer; ++ilayer) {
            let rad_ = rad + layerRad*ilayer;
            v2listlist[ilayer] = calcPosi(rad_, v2listlist[ilayer], pplen);
        }
        // y軸対象（x反転
        // 一旦　-rad で計算したうえで、xを反転
        for (let ilayer = nlayer2; ilayer < nlayer3; ++ilayer) {
            let rad_ = -rad - layerRad*(ilayer-nlayer2);
            v2listlist[ilayer] = calcPosi(rad_, v2listlist[ilayer], pplen);
        }
        for (let ii = nlayer; ii < nlayer2; ++ii) {
            let v2list1 = v2listlist[ii+nlayer];
            let v2list2 = v2listlist[ii];
            for (let i = 0; i < v2list1.length; ++i) {
                v2list2[i].x = -(v2list1[i].x);
                v2list2[i].y = v2list1[i].y;
            }
            v2listlist[ii] = v2list2;
        }
        return v2listlist;
    }

    let updatePosi = function(v2list, meshlist, z) {
        // 座標値の反映
        for (let i = 0; i < v2list.length; ++i) {
            meshlist[i].position.x = v2list[i].x;
            meshlist[i].position.y = v2list[i].y;
            meshlist[i].position.z = z;
        }
        return meshlist;
    }

    let updateMeshAll = function(v2listlist, meshlistlist) {
        for (let iphase = 0; iphase < nphase; ++iphase) {
            let v2list = v2listlist[iphase];
            let meshlist = meshlistlist[iphase];
            let z = layerD*(iphase%nlayer);
            meshlist = updatePosi(v2list, meshlist, z);
            meshlistlist[iphase] = meshlist;
        }
        return meshlistlist;
    }


    let rad = 0;
    v2listlist = calcPosiAll(rad, v2listlist);
    meshlistlist = updateMeshAll(v2listlist, meshlistlist);

    let mesh012 = BABYLON.MeshBuilder.CreateBox("", {width:pplen[12]*2, height:pplen[1], depth:mesh012D}, scene);
    mesh012.material = new BABYLON.StandardMaterial("", scene);
    mesh012.material.diffuseColor = BABYLON.Color3.White();
    mesh012.material.alpha=0.2;
    mesh012._agg = new BABYLON.PhysicsAggregate(mesh012, BABYLON.PhysicsShapeType.BOX, { mass:mass*10, restitution:0.01}, scene);
    mesh012._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
    mesh012._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
    mesh012.physicsBody.disablePreStep = false;
    mesh012.position.set(0,-pplen[1]/2,mesh012D_);

    let mesh03 = BABYLON.MeshBuilder.CreateBox("", {width:pplen[3]*2, height:pplen[3]*2, depth:mesh012D}, scene);
    mesh03.material = new BABYLON.StandardMaterial("", scene);
    mesh03.material.diffuseColor = BABYLON.Color3.Red();
    mesh03.material.alpha=0.4;
    mesh03._agg = new BABYLON.PhysicsAggregate(mesh03, BABYLON.PhysicsShapeType.BOX, { mass:mass*10, restitution:0.01}, scene);
    mesh03._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
    mesh03._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
    mesh03.physicsBody.disablePreStep = false;
    mesh03.position.set(0,0,mesh012D_);

    mesh03.physicsBody.setAngularDamping(10000000);
    mesh03.physicsBody.setLinearDamping(1000);

    // ヒンジを増やす
    for (let ilayer=0; ilayer<=nlayer; ++ilayer) {
        let z = layerD*ilayer - mesh012D_;
        z *= 2;
        let joint012_03_x = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(0, pplen[1]/2, z),
            new BABYLON.Vector3(0, 0, z),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        mesh012._agg.body.addConstraint(mesh03._agg.body, joint012_03_x);
    }

    for (let iphase = 0; iphase < nphase; ++iphase) {
        let meshlist = meshlistlist[iphase];
        let v2list = v2listlist[iphase];
        let zbase = meshlist[0].position.z, zbaseL = zbase-mesh012D_;

        // --------------------------------------------------
        let mesh34 = BABYLON.MeshBuilder.CreateBox("", {width:boxw, height:pplen[34], depth:boxh}, scene);
        mesh34._agg = new BABYLON.PhysicsAggregate(mesh34, BABYLON.PhysicsShapeType.BOX, { mass:mass, restitution:0.01}, scene);
        mesh34.physicsBody.disablePreStep = false;
        mesh34._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh34._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        meshlist[3].position.set(0,-pplen[34]/2,0);
        meshlist[3].parent = mesh34;
        meshlist[4].position.set(0,pplen[34]/2,0);
        meshlist[4].parent = mesh34;
        let v2 = v2list[3].add(v2list[4]).scale(0.5);
        mesh34.position.set(v2.x, v2.y, zbase);
        rad = Math.atan2(v2list[4].y-v2list[3].y, v2list[4].x-v2list[3].x)-R90; // x軸を基準にするため-R90
        mesh34.rotate(BABYLON.Vector3.Forward(), rad);
        let joint03_34 = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(v2list[3].x, v2list[3].y, zbaseL),
            new BABYLON.Vector3(0, -pplen[34]/2, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        mesh03._agg.body.addConstraint(mesh34._agg.body, joint03_34);

        // --------------------------------------------------
        let mesh246 = null;
        let v24 = v2list[4].subtract(v2list[2]);
        let v26 = v2list[6].subtract(v2list[2]);

        {
            let myShape = [BABYLON.Vector3.Zero(),
                           new BABYLON.Vector3(-v24.x, v24.y, 0),
                           new BABYLON.Vector3(-v26.x, v26.y, 0),
                           BABYLON.Vector3.Zero(),];
            let myPath = [new BABYLON.Vector3(0,0,boxh),
                          new BABYLON.Vector3(0,0,0)];
            mesh246 = BABYLON.MeshBuilder.ExtrudeShape("", {shape: myShape, path: myPath, cap:BABYLON.Mesh.CAP_ALL, sideOrientation:BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh246.material = new BABYLON.StandardMaterial("mat", scene);
            mesh246.material.diffuseColor = BABYLON.Color3.Green();
            mesh246.material.alpha=0.4;
            mesh246._agg = new BABYLON.PhysicsAggregate(mesh246, BABYLON.PhysicsShapeType.MESH, { mass:mass, restitution:0.01}, scene);
            mesh246.physicsBody.disablePreStep = false;
            mesh246._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh246._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            v2 = v2list[2];
            mesh246.position.set(v2.x, v2.y, zbase);
        }

        let p012 = null;
        if (iphase < nlayer) {
            p012 = new BABYLON.Vector3(-pplen[12], -pplen[1]/2, zbaseL);
        } else {
            p012 = new BABYLON.Vector3(pplen[12], -pplen[1]/2, zbaseL);
        }
        let joint012_246 = new BABYLON.HingeConstraint(
            p012,
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        mesh012._agg.body.addConstraint(mesh246._agg.body, joint012_246);

        let joint34_246 = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(0, pplen[34]/2, 0),
            new BABYLON.Vector3(v24.x, v24.y, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        mesh34._agg.body.addConstraint(mesh246._agg.body, joint34_246);
                      

        // // --------------------------------------------------
        let mesh25 = BABYLON.MeshBuilder.CreateBox("", {width:boxw, height:pplen[25], depth:boxh}, scene);
        mesh25._agg = new BABYLON.PhysicsAggregate(mesh25, BABYLON.PhysicsShapeType.BOX, { mass:mass, restitution:0.01}, scene);
        mesh25.physicsBody.disablePreStep = false;
        mesh25._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh25._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        meshlist[5].position.set(0, pplen[25]/2, 0);
        meshlist[5].parent = mesh25;
        v2 = v2list[2].add(v2list[5]).scale(0.5);
        mesh25.position.set(v2.x, v2.y, zbase);
        rad = Math.atan2(v2list[5].y-v2list[2].y, v2list[5].x-v2list[2].x)-R90; // x軸を基準にするため-R90
        mesh25.rotate(BABYLON.Vector3.Forward(), rad);

        let joint012_25 = new BABYLON.HingeConstraint(
            p012,
            new BABYLON.Vector3(0, -pplen[25]/2, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        mesh012._agg.body.addConstraint(mesh25._agg.body, joint012_25);

        // --------------------------------------------------
        let mesh35 = BABYLON.MeshBuilder.CreateBox("", {width:boxw, height:pplen[35], depth:boxh}, scene);
        mesh35._agg = new BABYLON.PhysicsAggregate(mesh35, BABYLON.PhysicsShapeType.BOX, { mass:mass, restitution:0.01}, scene);
        mesh35.physicsBody.disablePreStep = false;
        mesh35._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh35._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        v2 = v2list[3].add(v2list[5]).scale(0.5);
        mesh35.position.set(v2.x, v2.y, zbase);
        rad = Math.atan2(v2list[5].y-v2list[3].y, v2list[5].x-v2list[3].x)-R90; // x軸を基準にするため-R90
        mesh35.rotate(BABYLON.Vector3.Forward(), rad);
        let joint03_35 = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(v2list[3].x, v2list[3].y, zbaseL),
            new BABYLON.Vector3(0, -pplen[35]/2, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        mesh03._agg.body.addConstraint(mesh35._agg.body, joint03_35);
        let joint2535 = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(0, pplen[25]/2, 0),
            new BABYLON.Vector3(0, pplen[35]/2, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        mesh25._agg.body.addConstraint(mesh35._agg.body, joint2535);

        // --------------------------------------------------
        let mesh67 = BABYLON.MeshBuilder.CreateBox("", {width:boxw, height:pplen[67], depth:boxh}, scene);
        mesh67._agg = new BABYLON.PhysicsAggregate(mesh67, BABYLON.PhysicsShapeType.BOX, { mass:mass, restitution:0.01}, scene);
        mesh67.physicsBody.disablePreStep = false;
        mesh67._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh67._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        meshlist[6].position.set(0,-pplen[67]/2,0);
        meshlist[6].parent = mesh67;
        meshlist[7].position.set(0,pplen[67]/2,0);
        meshlist[7].parent = mesh67;
        v2 = v2list[6].add(v2list[7]).scale(0.5);
        mesh67.position.set(v2.x, v2.y, zbase);
        rad = Math.atan2(v2list[7].y-v2list[6].y, v2list[7].x-v2list[6].x)-R90; // x軸を基準にするため-R90
        mesh67.rotate(BABYLON.Vector3.Forward(), rad);
        let joint67_246 = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(0, -pplen[67]/2, 0),
            new BABYLON.Vector3(v26.x, v26.y, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        mesh67._agg.body.addConstraint(mesh246._agg.body, joint67_246);


        // --------------------------------------------------
        let mesh578 = null;
        let v57 = v2list[7].subtract(v2list[5]);
        let v58 = v2list[8].subtract(v2list[5]);
        if (1) {
            let myShape = [BABYLON.Vector3.Zero(),
                       new BABYLON.Vector3(-v57.x, v57.y, 0),
                       new BABYLON.Vector3(-v58.x, v58.y, 0),
                       BABYLON.Vector3.Zero(),
                      ];
            let myPath = [new BABYLON.Vector3(0,0,boxh),
                          new BABYLON.Vector3(0,0,0)];
            mesh578 = BABYLON.MeshBuilder.ExtrudeShape("", {shape: myShape, path: myPath, cap:BABYLON.Mesh.CAP_ALL, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh578.material = new BABYLON.StandardMaterial("mat", scene);
            mesh578.material.diffuseColor = BABYLON.Color3.Blue();
            mesh578.material.alpha=0.3;
            mesh578._agg = new BABYLON.PhysicsAggregate(mesh578, BABYLON.PhysicsShapeType.MESH, { mass:mass, restitution:0.01, friction:2.0}, scene);
            mesh578.physicsBody.disablePreStep = false;
            mesh578._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesh578._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            v2 = v2list[5];
            mesh578.position.set(v2.x, v2.y, zbase);
            meshlist[8].position.set(0,0,0);
            meshlist[8].parent = mesh578;
        }

        let joint25_578 = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(0, pplen[25]/2, 0),
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        mesh25._agg.body.addConstraint(mesh578._agg.body, joint25_578);

        let joint35_578 = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(0, pplen[35]/2, 0),
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        mesh35._agg.body.addConstraint(mesh578._agg.body, joint35_578);

        let joint67_578 = new BABYLON.HingeConstraint(
            new BABYLON.Vector3(0, pplen[67]/2, 0),
            new BABYLON.Vector3(v57.x, v57.y, 0),
            new BABYLON.Vector3(0, 0, 1),
            new BABYLON.Vector3(0, 0, 1),
            scene
        );
        mesh67._agg.body.addConstraint(mesh578._agg.body, joint67_578);

    }

    // デバッグ表示
    if (1) {
    var viewer = new BABYLON.PhysicsViewer();
    scene.meshes.forEach((mesh) => {
        if (mesh.physicsBody) {
            viewer.showBody(mesh.physicsBody);
        }
    });
    }

    let radstep = 0.01, r=pplen[3], r_=r/2;

    if (1) {
    scene.onBeforeRenderObservable.add(() => {
        // 辺 P0-P3 を動かす場合/力で動かす場合
        let vdir = BABYLON.Vector3.Forward();
        vdir.scaleInPlace(impF);
        mesh03._agg.body.applyAngularImpulse(vdir);
    })
    }

    return scene;
}

// export var createScene = createScene_test11;  // mesh
export var createScene = createScene_test13_6; // 物理

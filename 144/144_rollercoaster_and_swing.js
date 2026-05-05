// Babylon.js で物理演算(havok)：ローラーコースターと振り子の試作

// const skyboxTextPath = "textures/TropicalSunnyDay";
// const fpathWaterBump = "textures/waterbump.png";
let pathRoot = "../"
const skyboxTextPath = pathRoot + "111/textures/TropicalSunnyDay";
const fpathWaterBump = pathRoot + "068/textures/waterbump.png";

export var createScene_test_24 = async function () {

    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R270 = Math.PI*3/2;
    const R360 = Math.PI*2;

    const _metaStageInfo = {
        // ------------------------------
        997114:{
            // ローラーコースター
            tubeType:"custom",
            metaInfo:[
                {shape:"s", size:50, div:4},
                {shape:"ssin", h:50, size:100, div:8},
                {shape:"s", h:0, size:50, div:4},
                {shape:"l", h:-30, rot:R360+R90, div:20},
                {shape:"s", h:0, div:4},
                {shape:"l", rot:R90, size:100, div:8},
                {shape:"s", h:0, size:50, div:4},
                {shape:"ssin", h:-20},
                {shape:"ssin", h:+10},
                {shape:"s", h:0},
                {shape:"l", rot:R180, size:50, div:8},
                {shape:"s", size:50, div:4},
                {shape:"r", rot:R90, size:100, div:8},
                {shape:"s", size:100, div:8},
                {shape:"l", h:20, rot:R270, size:50, div:12},
                {shape:"s", h:0, size:50, div:4},
                {shape:"ssin", h:-10, size:150, div:12},
                {shape:"s", h:0, size:50, div:4},
                {shape:"l", h:-20, rot:R270, size:50, div:12},
                {shape:"s", h:0, size:50, div:4},
                {shape:"r", rot:R90, size:50, div:4},
            ],
        },

    };

    // ----------------------------------------
    let createCourseData = function(geo) {
        geo.data = []; // xzy座標
        geo.mZRot = {}; // z回転、ロール
        geo.xzLbl = []; // ラベル表示

        if (geo.tubeType == 'custom') {
            // rand　でつくったような形状をカスタマイズ作成できるように
            // ブロック単位の形状

            // 初期値をデフォルトとして用いる
            let meta0 = geo.metaInfo[0];
            let [x,y,z] = typeof(meta0.xyz) !== 'undefined' ? meta0.xyz : [0,0,0]; //位置
            let dir = typeof(meta0.dir) !== 'undefined' ? meta0.dir : R270; //方向(xz平面／y回転)
            let rot = typeof(meta0.rot) !== 'undefined' ? meta0.rot : R90; //L/R時の回転角
            let div = typeof(meta0.div) !== 'undefined' ? meta0.div : 4; //分割数
            let size = typeof(meta0.size) !== 'undefined' ? meta0.size : 50; // ブロック長
            let size2, size0, sizee, sizestep;
            let h = typeof(meta0.h) !== 'undefined' ? meta0.h : 0; // 高さ
            let vrot = typeof(meta0.vrot) !== 'undefined' ? meta0.vrot : R360; // 縦ロールの回転角
            let hshift = typeof(meta0.hshift) !== 'undefined' ? meta0.hshift : 10;//縦ロールの水平移動
            let shape = typeof(meta0.shape) !== 'undefined' ? meta0.shape : "st"; //形状
            let nloop = typeof(meta0.nloop) !== 'undefined' ? meta0.nloop : 1; //ループ回数
            let zrot = typeof(meta0.zrot) !== 'undefined' ? meta0.zrot : 0; // Y軸回転、ロールの回転角
            let x0,y0,z0 , xe,ye,ze, xstep,ystep,zstep, dir0,dirg,dire,dirstep, xg,yg,zg, yrad, yradstep, cmnt;
            let ii = 0;

            for (let meta of geo.metaInfo) {
                h = typeof(meta.h) !== 'undefined' ? meta.h : h; // 高さ
                rot = typeof(meta.rot) !== 'undefined' ? meta.rot : rot; //L/R時の回転角
                div = typeof(meta.div) !== 'undefined' ? meta.div : div; //分割数
                shape = typeof(meta.shape) !== 'undefined' ? meta.shape : shape; //形状
                nloop = typeof(meta.nloop) !== 'undefined' ? meta.nloop : nloop; //ループ回数
                size = typeof(meta.size) !== 'undefined' ? meta.size : size; // ブロック長
                size2 = typeof(meta.size2) !== 'undefined' ? meta.size2 : size; // ブロック長
                vrot = typeof(meta.vrot) !== 'undefined' ? meta.vrot : vrot;
                hshift = typeof(meta.hshift) !== 'undefined' ? meta.hshift : hshift;
                cmnt = typeof(meta.cmnt) !== 'undefined' ? meta.cmnt : ""; // コメント
                zrot = typeof(meta.zrot) !== 'undefined' ? meta.zrot : zrot; // Y軸回転、ロールの回転角
                dirstep = rot/div;
                yradstep = R180/div;
                sizestep = (size2-size)/div;

                if (cmnt != "") {
                    geo.xzLbl[ii] = cmnt;
                }

                if (shape == "S" || shape == "s" || shape == "straight") {
                    //直進
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0 = x; y0 = y; z0 = z; dir0 = dir;
                        xe = x+size*Math.cos(dir);
                        ye = y+h;
                        ze = z+size*Math.sin(dir);
                        dire = dir;
                        xstep=(xe-x0)/div; zstep=(ze-z0)/div; ystep=(ye-y0)/div;
                        for (let i=0; i < div; ++i, ++ii){
                            x = x0 + xstep*i;
                            y = y0 + ystep*i;
                            z = z0 + zstep*i;
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                } else if (shape == "L" || shape == "l" || shape == "left") {
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir;
                        dirg=dir-R90; dire=dir0-rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+size*Math.cos(dir0-rot+R90); ze=zg+size*Math.sin(dir0-rot+R90); ye=y+h;
                        ystep = (ye-y0)/div;
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0-dirstep*i+R90;
                            x=xg+size*Math.cos(dir);
                            y=y0+ystep*i;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                } else if (shape == "R" || shape == "r" || shape == "right") {
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir;
                        dirg=dir+R90; dire=dir0+rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+size*Math.cos(dir0+rot-R90); ze=zg+size*Math.sin(dir0+rot-R90); ye=y+h;
                        ystep = (ye-y0)/div;
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0+dirstep*i-R90;
                            x=xg+size*Math.cos(dir);
                            y=y0+ystep*i;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                    // ----------------------------------------------------------------------
                    // 高さを sin で変化
                } else if (shape == "Ssin" || shape == "ssin" || shape == "slope") {
                    //直進 (なめらかな傾斜
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0 = x; y0 = y; z0 = z; dir0 = dir;
                        xe = x+size*Math.cos(dir);
                        ye = y+h;
                        ze = z+size*Math.sin(dir);
                        dire = dir;
                        xstep=(xe-x0)/div; zstep=(ze-z0)/div; ystep=(ye-y0)/div;
                        yrad = -R90;
                        for (let i=0; i < div; ++i, ++ii){
                            x = x0 + xstep*i;
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z = z0 + zstep*i;
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; }
                        if (dir>=R360) { dir-=R360; }
                    }

                } else if (shape == "Lsin" || shape == "lsin" || shape == "leftsin") {
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir;
                        dirg=dir-R90; dire=dir0-rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+size*Math.cos(dir0-rot+R90); ze=zg+size*Math.sin(dir0-rot+R90); ye=y+h;
                        yrad = -R90;
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0-dirstep*i+R90;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                } else if (shape == "Rsin" || shape == "rsin" || shape == "rightsin") {
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir;
                        dirg=dir+R90; dire=dir0+rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+size*Math.cos(dir0+rot-R90); ze=zg+size*Math.sin(dir0+rot-R90); ye=y+h;
                        yrad = -R90;
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0+dirstep*i-R90;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                    // ----------------------------------------------------------------------
                    // 半径を均一で変化

                } else if (shape == "LsinDR" || shape == "lsindr") {
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir; size0=size;
                        sizee=size2;
                        dirg=dir-R90; dire=dir0-rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+sizee*Math.cos(dir0-rot+R90); ze=zg+sizee*Math.sin(dir0-rot+R90); ye=y+h;
                        yrad = -R90;
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0-dirstep*i+R90;
                            size=size0+sizestep*i;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire; size=sizee;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                } else if (shape == "RsinDR" || shape == "rsindr") {
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir; size0=size;
                        sizee=size2;
                        dirg=dir+R90; dire=dir0+rot;
                        xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                        xe=xg+sizee*Math.cos(dir0+rot-R90); ze=zg+sizee*Math.sin(dir0+rot-R90); ye=y+h;
                        yrad = -R90;
                        for (let i=0; i < div; ++i, ++ii){
                            dir=dir0+dirstep*i-R90;
                            size=size0+sizestep*i;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire; size=sizee;
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }

                    // ----------------------------------------------------------------------
                    // 縦ループ
                } else if (shape == "VLoop" || shape == "vloop") {
                    let vrotstep=vrot/div;
                    let dirV0=-R90, dirVe=dirV0+vrot, dirV;
                    let dirR=dir-R90;
                    hshift=-hshift;
                    let hshifte=hshift, hshiftstep=hshift/div;
                    let xroll, yroll, zroll;
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0=x; y0=y; z0=z; dir0=dir; size0=size;
                        sizee=size2;
                        xg=x0; yg=y0+size; zg=z0;
                        xroll = 0;
                        yroll = sizee*Math.sin(dirVe);
                        zroll = sizee*Math.cos(dirVe);
                        xe = xg+zroll*Math.sin(dir)+hshifte*Math.cos(dirR);
                        ye = yg+yroll;
                        ze = zg+zroll*Math.cos(dir)+hshifte*Math.sin(dirR);
                        yrad = -R90;
                        for (let i=0; i < div; ++i, ++ii){
                            dirV=dirV0+vrotstep*i;
                            size=size0+sizestep*i;
                            xroll = 0;
                            yroll = size*Math.sin(dirV);
                            zroll = size*Math.cos(dirV);
                            hshift = hshifte*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            x=xg+zroll*Math.cos(dir)+hshift*Math.cos(dirR);
                            y=yg+yroll;
                            z=zg+zroll*Math.sin(dir)+hshift*Math.sin(dirR);
                            geo.data.push([x, z, y]);
                            if (zrot != null) {
                                geo.mZRot[ii] = zrot;
                            }
                        }
                        x = xe; y = ye; z = ze; dir=dire; size=sizee;
                        if (Math.round(vrot-Math.round(vrot/R180)*R180)==0) {
                            dir = dir+vrot;
                        }
                        if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                    }
                }

            }
            if (geo.isLoopCourse == false) {
                geo.data.push([x, z, y]);
            }

        }

        return geo;
    }

    let getPoint3List = function(metaStageInfo) {
            let stageType = typeof(metaStageInfo.stageType) !== 'undefined' ? metaStageInfo.stageType : "line";
            let useSpline = typeof(metaStageInfo.useSpline) !== 'undefined' ? metaStageInfo.useSpline : true;
            let nbPoints = typeof(metaStageInfo.nbPoints) !== 'undefined' ? metaStageInfo.nbPoints : 20;
            let isLoopCourse = typeof(metaStageInfo.isLoopCourse) !== 'undefined' ? metaStageInfo.isLoopCourse : true;
            let iy = typeof(metaStageInfo.iy) !== 'undefined' ? metaStageInfo.iy : 5;
            let iystep = typeof(metaStageInfo.iystep) !== 'undefined' ? metaStageInfo.iystep : 0;
            let grndW = typeof(metaStageInfo.grndW) !== 'undefined' ? metaStageInfo.grndW : 200;
            let grndH = typeof(metaStageInfo.grndH) !== 'undefined' ? metaStageInfo.grndH : 200;
            let scale = typeof(metaStageInfo.scale) !== 'undefined' ? metaStageInfo.scale : 1;
            let scaleY = typeof(metaStageInfo.scaleY) !== 'undefined' ? metaStageInfo.scaleY : 1;
            let adjx = typeof(metaStageInfo.adjx) !== 'undefined' ? metaStageInfo.adjx : 0;
            let adjy = typeof(metaStageInfo.adjy) !== 'undefined' ? metaStageInfo.adjy : 0;
            let adjz = typeof(metaStageInfo.adjz) !== 'undefined' ? metaStageInfo.adjz : 0;
            let tubeCAP = typeof(metaStageInfo.tubeCAP) !== 'undefined' ? metaStageInfo.tubeCAP : BABYLON.Mesh.NO_CAP ;
            let nz = typeof(metaStageInfo.nz) !== 'undefined' ? metaStageInfo.nz : 0;
            let pQdiv = typeof(metaStageInfo.pQdiv) !== 'undefined' ? metaStageInfo.pQdiv : 0;
            let pQlist = typeof(metaStageInfo.pQlist) !== 'undefined' ? metaStageInfo.pQlist : [];
            let pQdbg = typeof(metaStageInfo.pQdbg) !== 'undefined' ? metaStageInfo.pQdbg : 0;
            let bubbleEnable = typeof(metaStageInfo.bubbleEnable) !== 'undefined' ? metaStageInfo.bubbleEnable : false;
            let reverse = typeof(metaStageInfo.reverse) !== 'undefined' ? metaStageInfo.reverse : false; // 逆走
            let soloEnable = typeof(metaStageInfo.soloEnable) !== 'undefined' ? metaStageInfo.soloEnable : false;
            let plist = [];
            let mZRot = typeof(metaStageInfo.mZRot) !== 'undefined' ? metaStageInfo.mZRot : {};
            let xzLbl = typeof(metaStageInfo.xzLbl) !== 'undefined' ? metaStageInfo.xzLbl : {};

            if(metaStageInfo.dtype=='xzy') {
                // .. カスタムでコースを作成する場合
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

            let plist3 = [];
            {
                let plist2 = []
                if(useSpline) {
                    // 上記で取得した点列を、スプラインで補間
                    let catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
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
        return plist3;
    }

    const stageGeoMap = {
        7114:{label:"custom_debug",
              dtype:"xzy",
              grndW:10, grndH:10, cnsNAgent:0, scale:0.2,  scaleY:0.5, 
              cid:997114,
              adjx:5, adjz:-10, adjy:5,
              nbPoints:10,
             },
    };

    let istage=0;
    const courseInfoList = [
        // istage, type, label, fpath
        [[7114], "ローラーコースター", ""],
    ];
    let nstage = courseInfoList.length;

    const scene = new BABYLON.Scene(engine);

    let icamera = 4;
    // icamera = -1;

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
        // バードビュー：対象(cameraTrgMesh)を後方から追跡 .. 速度依存（対象が速いと置いて行かれる）
        let _camera = new BABYLON.FollowCamera("", new BABYLON.Vector3(0, 10, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 4;
        _camera.heightOffset = 2;
        _camera.cameraAcceleration = 0.03;
        _camera.maxCameraSpeed = 100;
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
        let vdir = new BABYLON.Vector3(0, 0, -0.01);
        vdir = vdir.applyRotationQuaternion(quat);
        camera_.position = cameraTrgMesh.position.add(vdir);
        camera_.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat); // 法線に合わせて傾ける
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
            let rate = path3d.getClosestPositionTo(p);
            let ncp = path3d.getPointAt(rate);
            // ライン上から水平にずらすためのベクトル v2
            let v2 = vdir.normalize().cross(BABYLON.Vector3.Up());
            camera_.position.copyFrom(ncp.add(v2.scale(3)));
        }
    }
    scene.onBeforeRenderObservable.add((scene) => {
        if (icamera == 0) { // freeCamera の場合の位置調整
            renderCamera1(camera);
        }
        if (icamera == 3) {
            renderCamera8(camera);
        }
        if (icamera == 4) {
            renderCamera1(cameralist[0]);
            renderCamera8(cameralist[3]);
        }
    });

    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    let meshAggInfo = []; // mesh, agg;
    let pStart = new BABYLON.Vector3(0, 0, 0);
    let pStart2 = new BABYLON.Vector3(0, 0, 0);
    let pGoal = new BABYLON.Vector3(0, 0, 0);

    let path3dlist = [];
    let nline = 1;

    var createStage = function(istage) {
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }
        let metaStageInfoList = [];
        {
            let [ids, tlabel, tpath] = courseInfoList[istage];
            for (let id of ids) {
                if (!(id in stageGeoMap)) {
                    console.log("L1591にマッピング情報がない");
                    continue;
                }
                let rval = stageGeoMap[id];
                if ((typeof(rval.data) !== 'undefined')) {
                    // .data がある .. stageGeoMap[id].data に CourseData*.DATA.test.xz* がある
                    ;
                } else if ((typeof(rval.data) === 'undefined') && (typeof(rval.cid) !== 'undefined')) {
                    // .data は無いけど .cidがある ..  createCourseDataでコースデータを作るVer
                    let geo = _metaStageInfo[rval.cid];
                    let rgeo = createCourseData(geo);
                    rval.data = rgeo.data;
                } else {
                      console.assert(0);
                }
                metaStageInfoList.push(rval);
            }
        }
        for (let metaStageInfo of metaStageInfoList) {
            let plist3 = getPoint3List(metaStageInfo);
            let stageType = typeof(metaStageInfo.stageType) !== 'undefined' ? metaStageInfo.stageType : "line";
            let pStartIdx = typeof(metaStageInfo.pStartIdx) !== 'undefined' ? metaStageInfo.pStartIdx:1;
            {
                pStart = plist3[pStartIdx].clone();
                pStart2 = plist3[pStartIdx+2].clone();
                pGoal = plist3[plist3.length-10].clone();
                if (stageType == 'line') {
                    let mesh = BABYLON.MeshBuilder.CreateLines("lines", {points: plist3}, scene);
                    meshAggInfo.push([mesh,null]);
                    let path3d = new BABYLON.Path3D(plist3);
                    path3dlist.push(path3d);
                }
            }
        } // for (let metaStageInfo of metaStageInfoList) {
    }
    createStage(istage);

    let skybox = null;
    if (1) {
        // Skybox
        skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:6000.0}, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }

    let path3d = path3dlist[0];

    let meshCPr = 2;
    let meshCP = BABYLON.MeshBuilder.CreateSphere("", { diameter:meshCPr }, scene);
    {
        meshCP.material = new BABYLON.StandardMaterial("");
        meshCP.material.alpha = 0.4;
    }

    let mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.5, height:0.5, depth:1.5});
    {
        const R30 = Math.PI/6;
        const R45 = Math.PI/4;
        const R60 = Math.PI/3;
        const R90 = Math.PI/2;
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.emissiveColor = BABYLON.Color3.Red();
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass:1 }, scene);
        mesh.physicsBody.disablePreStep = false;
        mesh.physicsBody.setGravityFactor(0.1);
        mesh.physicsBody.setLinearDamping(0.001);
        mesh.physicsBody.setAngularDamping(5);
        // 位置と方向
        mesh.position.copyFrom(path3d.getPointAt(0));
        let p2 = path3d.getPointAt(0.001);
        let vdir = p2.subtract(mesh.position).normalize();
        // 進行方向に対する上方向を求める。外積を２回実施してvdirに垂直上向き（法線方向）のベクトルを求める
        let v1 = vdir.cross(BABYLON.Vector3.Up());
        let vU = v1.cross(vdir).normalize();
        // 方向ベクトルからクォータニオンを作成
        mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(vdir, vU);
        mesh.lookAt(mesh.position.add(vdir));
        // 次のCheckPoint
        mesh._r = 0.01;
        mesh._rstep = 0.01;
        mesh._rstepRng = 0.02;
        mesh._nextCP = path3d.getPointAt(mesh._r);
        meshCP.position.copyFrom(mesh._nextCP);
        // おもしを付ける
        let mesh2 = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:1.0, depth:0.1});
        mesh2.material = new BABYLON.StandardMaterial("");
        // mesh2.material.alpha = 0.8;
        mesh2._agg = new BABYLON.PhysicsAggregate(mesh2, BABYLON.PhysicsShapeType.BOX, { mass:0.1 }, scene);
        mesh2.physicsBody.disablePreStep = false;
        mesh2.position.copyFrom(mesh.position);
        mesh2.position.y -= 0.5;
        mesh2.rotation = new BABYLON.Vector3(0, R90, 0);
        mesh2.physicsBody.setAngularDamping(1);
        mesh2.physicsBody.setLinearDamping(1);
        let radPadX = R30, radPadZ = R45; // 可動角度
        let joint = new BABYLON.Physics6DoFConstraint(
            { pivotA: new BABYLON.Vector3(0, -0.25, 0),
              pivotB: new BABYLON.Vector3(0, 0.5, 0),},
            [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit:0.0, maxLimit:0.0, },
             { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit:-radPadX, maxLimit:radPadX, },
             { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit:0, maxLimit:0, }, // 向きは固定する
             { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit:-radPadZ, maxLimit:radPadZ, },
            ],
            scene);
        mesh._agg.body.addConstraint(mesh2._agg.body, joint);
        mesh2.rotationQuaternion = new BABYLON.Quaternion(); // for camera
        cameraTrgMesh = mesh2;
    }


    // メッシュの向きを無視してCP方向に推進させる
    const len2SQ = meshCPr**2;
    scene.onBeforeRenderObservable.add(() => {
        // CPを逐次再配置
        // 最近傍位置 ncp
        let r = path3d.getClosestPositionTo(mesh.position);
        if ((Math.abs(r - mesh._r) < mesh._rstepRng) || (Math.abs(r - mesh._r + 1) < mesh._rstepRng)) {
            mesh._r = r;
            mesh._nextCP = path3d.getPointAt(r + mesh._rstep);
            meshCP.position.copyFrom(mesh._nextCP);
        }
        // 次のCP方向に力を加える（速度を加味する）
        let vv = mesh._agg.body.getLinearVelocity().scale(-0.5); // 大きすぎると逆にブレーキに
        let vacc = mesh._nextCP.add(vv).subtract(mesh.position).normalize().scale(0.1);
        mesh._agg.body.applyImpulse(vacc, mesh.absolutePosition);
        // CP方向に向けて姿勢を回転させる
        // 姿勢の進行方向
        let vdir1 = BABYLON.Vector3.Forward().applyRotationQuaternion(mesh.rotationQuaternion);
        // CPへの方向
        let vdir2 = mesh._nextCP.subtract(mesh.position).normalize();
        let v12B = vdir1.cross(vdir2).scale(0.2);
        mesh._agg.body.applyAngularImpulse(v12B);
    });

    {
        const sizeW = 1000, sizeH = 1000;
        var meshGround = BABYLON.MeshBuilder.CreateGround("ground", {width: sizeW, height: sizeH});
        meshGround.position.set(40, -0.02, 40);
        // 水面用メッシュの処理
        const waterMaterial = new BABYLON.WaterMaterial("water");
        waterMaterial.bumpTexture = new BABYLON.Texture(fpathWaterBump);
        waterMaterial.waterColor = new BABYLON.Color3(0.3, 0.5, 0.9);
        waterMaterial.waterColorLevel = 0.2;
        waterMaterial.fresnelLevel = 1.0;
        waterMaterial.reflectionLevel = 0.6;
        waterMaterial.refractionLevel = 0.8;
        waterMaterial.waveLength = 0.01;
        waterMaterial.waveHeight = 0.015;
        waterMaterial.waterDirection = new BABYLON.Vector2(0, 1);
        // 環境反射の設定
        waterMaterial.addToRenderList(skybox);
        waterMaterial.addToRenderList(mesh);
        // 新しい水面に適用
        meshGround.material = waterMaterial;
        meshAggInfo.push([meshGround, null]);
    }

    changeCamera(icamera);

    return scene;
}

export var createScene = createScene_test_24;


// Babylon.js で物理演算(havok)：パイプ内をボードで滑る（２）

//  - カーソル上/(w)              .. 加速
//  - カーソル下/(s)              .. 減速
//  - カーソル右左/(a,d)          .. ヨー（垂直／上方向の軸で回転
//  - カーソル右＋左/(a＋d)       .. ロール（進行方向の軸で回転
//  - Ctrl+カーソル右＋左/(a＋d)  .. 大きくロール（進行方向の軸で回転
//  - r                           .. 前後を180度回転（前後を入れ替え
//  - space                       .. ジャンプ
//  - (n)/(p)                     .. ステージの切り替え

// // for local
// const SCRIPT_URL1 = "./CourseData.js";
// const charPathList = ["textures/pipo-charachip007.png", // 男の子
//                       "textures/pipo-charachip008b.png", // 女の子
//                       "textures/pipo-charachip010.png", // ねこ
//                       "textures/pipo-charachip011b.png", // キング
//                       "textures/pipo-charachip012.png", // クイーン
//                       "textures/pipo-charachip017a.png", // メイド
//                      ];
// let skyboxTextPath = "textures/TropicalSunnyDay";
// const water_bump_path = "textures/waterbump.png"
// const txt_tail_bubble = "textures/flare3.png";

// for local
// for local
 const SCRIPT_URL1 = "../090/CourseData.js";
const charPathList = ["textures/pipo-charachip007.png", // 男の子
                      "textures/pipo-charachip008b.png", // 女の子
                      "textures/pipo-charachip010.png", // ねこ
                      "textures/pipo-charachip011b.png", // キング
                      "textures/pipo-charachip012.png", // クイーン
                      "textures/pipo-charachip017a.png", // メイド
                     ];
let skyboxTextPath = "../069/textures/TropicalSunnyDay";
const water_bump_path = "../068/textures/waterbump.png";
const txt_tail_bubble = "../068/textures/flare3.png";

// for PlayGround
// const SCRIPT_URL1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/090/CourseData.js";
// const charPathList = ["https://raw.githubusercontent.com/fnamuoo/webgl/main/093/textures/pipo-charachip007.png",
//                       "https://raw.githubusercontent.com/fnamuoo/webgl/main/093/textures/pipo-charachip008b.png",
//                       "https://raw.githubusercontent.com/fnamuoo/webgl/main/093/textures/pipo-charachip010.png",
//                       "https://raw.githubusercontent.com/fnamuoo/webgl/main/093/textures/pipo-charachip011b.png",
//                       "https://raw.githubusercontent.com/fnamuoo/webgl/main/093/textures/pipo-charachip012.png",
//                       "https://raw.githubusercontent.com/fnamuoo/webgl/main/093/textures/pipo-charachip017a.png",
//                      ];
//let skyboxTextPath = "textures/TropicalSunnyDay";
// const water_bump_path = "textures/waterbump.png"
// const txt_tail_bubble = "textures/flare3.png";

let CourseData = null;
import(SCRIPT_URL1).then((obj) => { CourseData = obj; });

const R5 = Math.PI/36;
const R90 = Math.PI/2;
const R180 = Math.PI;
const R270 = Math.PI*3/2;
const R360 = Math.PI*2;


var createScene = async function () {
    await BABYLON.InitializeCSG2Async();

    let createTubeData = function (geo) {
        geo.data = [];
        if (geo.tubeType == 'coil') {
            // 円（コイル）、等幅で上昇
            let nloop = typeof(geo.nloop) !== 'undefined' ? geo.nloop : 5;
            let loopy = typeof(geo.loopy) !== 'undefined' ? geo.loopy : 30;//１週分での高さ
            let r = typeof(geo.r) !== 'undefined' ? geo.r : 100;
            let n = nloop*72, stepy = loopy/72;
            for (let i = 0; i < n; ++i) {
                irad = -i * R5;
                x = r*Math.cos(irad); y = i*stepy; z = r*Math.sin(irad);
                geo.data.push([x, z, y]);
            }

        } else if (geo.tubeType == 'spiral') {
            // らせん／円で半径を徐々に大きく、半径に応じて上昇幅up
            let nloop = typeof(geo.nloop) !== 'undefined' ? geo.nloop : 15;
            let loopy = typeof(geo.loopy) !== 'undefined' ? geo.loopy : 50;//
            let r = typeof(geo.r) !== 'undefined' ? geo.r : 30;
            let rstep = typeof(geo.rstep) !== 'undefined' ? geo.rstep : 0.1;
            let n = nloop*72, stepy = loopy/72;
            for (let i = 0; i < n; ++i) {
                irad = -i * R5;
                x = r*Math.cos(irad); y = i*stepy; z = r*Math.sin(irad);
                geo.data.push([x, z, y]);
                r += rstep;
            }

        } else if (geo.tubeType == 'rand') {
            // 乱数（等確率）で右／左の円弧(90度ごと)、等幅で上昇
            let narc = typeof(geo.narc) !== 'undefined' ? geo.narc : 40;
            let arcy = typeof(geo.arcy) !== 'undefined' ? geo.arcy : 4;//１回転ごとの高さ
            let arcDiv = typeof(geo.arcDiv) !== 'undefined' ? geo.arcDiv : 30; // 18;
            let Rx = R90 / arcDiv;
            let r = typeof(geo.r) !== 'undefined' ? geo.r : 50;
            let stepy = arcy/18, jarc = 0, x0=0, z0=0, arcType, arcTypeOld = true, i = 0;
            let disTHMAX = 400**2, disTHMIN = 125**2, dirAuto=false;
            for (let iarc = 0; iarc < narc; ++iarc) {
                arcType = (Math.random() < 0.5);
                if (geo.data.length > 0) {
                    // 移動先の座標を推定してきめる
                    // 一定距離（最大）を超えたら原点に向かうよう、一定距離（最小）まで近づいたら解除する
                    let p = geo.data.slice(-1)[0];//パイプ末尾の位置
                    let dis = p[0]**2 + p[1]**2;
                    if (dirAuto == false) {
                        if(dis>disTHMAX) { // +-400**2の範囲に収まるように
                            dirAuto = true;
                        }
                    }
                    if (dirAuto == true) {
                        if(dis<disTHMIN) {
                            dirAuto = false;
                        }
                        let x00R = x0, z00R = z0, x00L = x0, z00L = z0;
                        {
                            // 右円弧
                            if (arcTypeOld != true) {
                                x00R += -2*r*Math.cos(jarc*R90); z00R += -2*r*Math.sin(jarc*R90);
                            }
                            irad = R90 + jarc*R90;
                            x00R += r*Math.cos(irad); z00R += r*Math.sin(irad);
                        }
                        {
                            // 左円弧
                            if (arcTypeOld != false) {
                                x00L += 2*r*Math.cos(jarc*R90); z00L += 2*r*Math.sin(jarc*R90);
                            }
                            irad = -R90 + jarc*R90 + R180;
                            x00L += r*Math.cos(irad); z00L += r*Math.sin(irad);
                        }
                        let disR = x00R**2 + z00R**2;
                        let disL = x00L**2 + z00L**2;
                        arcType = (disR < disL);  // 原点に向かうように
                    }
                }
                if (arcType) {
                    // 右円弧
                    if (arcTypeOld != arcType) {
                        x0 += -2*r*Math.cos(jarc*R90); z0 += -2*r*Math.sin(jarc*R90);
                    }
                    for (let j = 0; j < arcDiv; ++j) {
                        irad = j * Rx + jarc*R90;
                        x = x0 + r*Math.cos(irad); y = i*stepy; z = z0 + r*Math.sin(irad);
                        geo.data.push([x, z, y]);
                        ++i;
                    }
                    jarc = (jarc+1)%4;
                } else {
                    // 左円弧
                    if (arcTypeOld != arcType) {
                        x0 += 2*r*Math.cos(jarc*R90); z0 += 2*r*Math.sin(jarc*R90);
                    }
                    for (let j = 0; j < arcDiv; ++j) {
                        irad = -j*Rx + jarc*R90 + R180;
                        x = x0 + r*Math.cos(irad); y = i*stepy; z = z0 + r*Math.sin(irad);
                        geo.data.push([x, z, y]);
                        ++i;
                    }
                    jarc = (jarc+3)%4;
                }
                arcTypeOld = arcType;
            }

        } else if (geo.tubeType == 'rand2') {
            // 乱数（等確率）で３種（直進、左右の旋回）、等幅で上昇
            // 進行方向ベクトルと旋回のクォータニオンで経路を作成
            let roty = R5, nloop = 15;
            let narc = typeof(geo.narc) !== 'undefined' ? geo.narc : 60;
            let stepy = typeof(geo.stepy) !== 'undefined' ? geo.stepy : 0.2;
            let vst = typeof(geo.vst) !== 'undefined' ? geo.vst : 4;
            const quatL = BABYLON.Quaternion.FromEulerAngles(0, roty, 0);
            const quatR = BABYLON.Quaternion.FromEulerAngles(0, -roty, 0);
            const quat0 = new BABYLON.Quaternion();
            let vposi = new BABYLON.Vector3(0, 0, 0); // 座標位置(x,zのみ利用)
            let vdir = new BABYLON.Vector3(0, 0, vst); // 進行方向ベクトル
            let jarc = 0, i = 0, x=0, y=0, z=0, idir, quat;
            let disTHMAX = 400**2, disTHMIN = 60**2, dirAuto=false;
            for (let iarc = 0; iarc < narc; ++iarc) {
                idir = Math.floor(Math.random()*3);
                if (geo.data.length > 0) {
                    // 移動先の座標を推定してきめる
                    let p = geo.data.slice(-1)[0];//パイプ末尾の位置
                    let dis = p[0]**2 + p[1]**2;
                    if (dirAuto == false) {
                        if(dis>disTHMAX) { // +-400**2の範囲に収まるように
                            dirAuto = true;
                        }
                    }
                    if (dirAuto == true) {
                        if(dis<disTHMIN) {
                            dirAuto = false;
                        }
                        let vposiN=vposi.clone(), vdirN=vdir.clone();
                        let vposiL=vposi.clone(), vdirL=vdir.clone();
                        let vposiR=vposi.clone(), vdirR=vdir.clone();
                        for (let iloop = 0; iloop < nloop; ++iloop) {
                            vdirN = vdirN.applyRotationQuaternion(quat0); // 進行方向ベクトルの方位を変える
                            vposiN.addInPlace(vdirN);
                            vdirR = vdirN.applyRotationQuaternion(quatR); // 進行方向ベクトルの方位を変える
                            vposiR.addInPlace(vdirR);
                            vdirL = vdirL.applyRotationQuaternion(quatL); // 進行方向ベクトルの方位を変える
                            vposiL.addInPlace(vdirL);
                        }
                        let disN = (vposiN.x)**2 + (vposiN.z)**2;
                        let disR = (vposiR.x)**2 + (vposiR.z)**2;
                        let disL = (vposiL.x)**2 + (vposiL.z)**2;
                        if (disN<disR) {
                            if (disN<disL) {
                                // N < L/R
                                idir = 2; // N
                            } else {
                                // L < N < R
                                idir = 0 ;// L
                            }
                        } else if (disL<disR) {
                            // L < R < N
                            idir = 0; // L
                        } else {
                            // R < L/N
                            idir = 1; // R
                        }
                    }
                }
                quat = quat0; // 直進
                if (idir == 0) {
                    // 左折
                    quat = quatL;
                } else if (idir == 1) {
                    // 右折
                    quat = quatR;
                }
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    vdir = vdir.applyRotationQuaternion(quat); // 進行方向ベクトルの方位を変える
                    vposi.addInPlace(vdir);
                    geo.data.push([vposi.x, vposi.z, y]);
                    y += stepy;
                }
            }

        } else if (geo.tubeType == 'custom') {
            // rand　でつくったような形状をカスタマイズ作成できるように
            // ブロック単位の形状
            //
            // 種別
            // - 直線(高さを等間隔)
            // - 左折
            // - 右折
            // - 直線(高さをsin変化)
            // - 左折
            // - 右折
            // - 左折(半径を変化)：うずまき用
            // - 右折
            // - 縦ループ

            // 初期値をデフォルトとして用いる
            meta0 = geo.metaInfo[0];
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
            let x0,y0,z0 , xe,ye,ze, xstep,ystep,zstep, dir0,dirg,dire,dirstep, xg,yg,zg, yrad, yradstep;

            for (meta of geo.metaInfo) {
                h = typeof(meta.h) !== 'undefined' ? meta.h : h; // 高さ
                rot = typeof(meta.rot) !== 'undefined' ? meta.rot : rot; //L/R時の回転角
                div = typeof(meta.div) !== 'undefined' ? meta.div : div; //分割数
                shape = typeof(meta.shape) !== 'undefined' ? meta.shape : shape; //形状
                nloop = typeof(meta.nloop) !== 'undefined' ? meta.nloop : nloop; //ループ回数
                size = typeof(meta.size) !== 'undefined' ? meta.size : size; // ブロック長
                size2 = typeof(meta.size2) !== 'undefined' ? meta.size2 : size; // ブロック長
                vrot = typeof(meta.vrot) !== 'undefined' ? meta.vrot : vrot;
                hshift = typeof(meta.hshift) !== 'undefined' ? meta.hshift : hshift;
                dirstep = rot/div;
                yradstep = R180/div;
                sizestep = (size2-size)/div;

                if (shape == "S" || shape == "s" || shape == "straight") {
                    //直進
                    for (let iloop = 0; iloop < nloop; ++iloop) {
                        x0 = x; y0 = y; z0 = z; dir0 = dir;
                        xe = x+size*Math.cos(dir);
                        ye = y+h;
                        ze = z+size*Math.sin(dir);
                        dire = dir;
                        xstep=(xe-x0)/div; zstep=(ze-z0)/div; ystep=(ye-y0)/div;
                        for (let i=0; i < div; ++i){
                            x = x0 + xstep*i;
                            y = y0 + ystep*i;
                            z = z0 + zstep*i;
                            geo.data.push([x, z, y]);
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
                        for (let i=0; i < div; ++i){
                            dir=dir0-dirstep*i+R90;
                            x=xg+size*Math.cos(dir);
                            y=y0+ystep*i;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
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
                        for (let i=0; i < div; ++i){
                            dir=dir0+dirstep*i-R90;
                            x=xg+size*Math.cos(dir);
                            y=y0+ystep*i;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
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
                        for (let i=0; i < div; ++i){
                            x = x0 + xstep*i;
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z = z0 + zstep*i;
                            geo.data.push([x, z, y]);
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
                        for (let i=0; i < div; ++i){
                            dir=dir0-dirstep*i+R90;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
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
                        for (let i=0; i < div; ++i){
                            dir=dir0+dirstep*i-R90;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
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
                        for (let i=0; i < div; ++i){
                            dir=dir0-dirstep*i+R90;
                            size=size0+sizestep*i;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
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
                        for (let i=0; i < div; ++i){
                            dir=dir0+dirstep*i-R90;
                            size=size0+sizestep*i;
                            x=xg+size*Math.cos(dir);
                            y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                            z=zg+size*Math.sin(dir);
                            geo.data.push([x, z, y]);
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
                        for (let i=0; i < div; ++i){
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

    const metaStageInfo = {
        // ------------------------------
        200801:{label:"MotegiSuperSpeedway",
                iy:5, scale:0.2, grndW:280, grndH:200, adjx:-120, adjz:80, cnsSpeedX:1, bubbleEnable:true,
                dtype:"xz",
                data :CourseData.DATA.MotegiSuperSpeedway_new.xz.slice(0, -3),
               },
        200802:{label:"MotegiSuperSpeedway_reverse",
                iy:5, scale:0.2, grndW:280, grndH:200, adjx:-120, adjz:80, cnsSpeedX:1, bubbleEnable:true, reverse:true,
                dtype:"xz",
                data :CourseData.DATA.MotegiSuperSpeedway_new.xz.slice(0, -3),
               },

        // ------------------------------
        200901:{label:"DaytonaSpeedway",
                scale:0.5, grndW:500, grndH:500, adjx:-200, adjz:200, cnsAccelX:1.5, cnsSpeedX:1, bubbleEnable:true,
                dtype:"xz",
                data :CourseData.DATA.DaytonaSpeedway_new.xz.slice(0, -3),
               },

        // ------------------------------
        200101:{label:"HighSpeedRing",
                grndW:1100, grndH:680, adjx:-550, adjz:340, cnsSpeedX:1, bubbleEnable:true,
                dtype:"xz",
                data:CourseData.DATA.HighSpeedRing_new.xz.slice(0, 82), // 84
               },

        // ------------------------------

        200202:{label:"AutumnRing",
                scale:1, grndW:1200, grndH:800, adjx:-600, adjz:400, adjy:205-20, nbPoints:20, cnsSpeedX:1,
                dtype:"xzR",
                data :CourseData.DATA.AutumnRing_new.xzR.slice(0, -2),
                pQlist:CourseData.DATA.AutumnRing_new.pq,
               },
        200203:{label:"AutumnRing_reverse",
                scale:1, grndW:1200, grndH:800, adjx:-600, adjz:400, adjy:205-20, nbPoints:20, cnsSpeedX:1, reverse:true,
                dtype:"xzR",
                data :CourseData.DATA.AutumnRing_new.xzR.slice(0, -2),
                pQlist:CourseData.DATA.AutumnRing_new.pq,
               },

        200204:{label:"AutumnRing_HillClimb",
                isLoopCourse:false, iystep:2, scale:1, grndW:1200, grndH:800, adjx:-600, adjz:400, adjy:-0.3, tubeCAP:BABYLON.Mesh.CAP_ALL, cnsSpeedX:1,
                dtype:"xz",
                data :CourseData.DATA.AutumnRing_new.xz,
               },
        200205:{label:"AutumnRing_DownHill",
                isLoopCourse:false, iystep:2, scale:1, grndW:1200, grndH:800, adjx:-600, adjz:400, adjy:-0.3, tubeCAP:BABYLON.Mesh.CAP_ALL, cnsSpeedX:1, reverse:true,
                dtype:"xz",
                data :CourseData.DATA.AutumnRing_new.xz,
               },

        // ------------------------------
        200301:{label:"CotedAzur",
                scale:1, grndW:1300, grndH:1000, adjx:-600, adjz:400, cnsSpeedX:1, bubbleEnable:true,
                dtype:"xz",
                data :CourseData.DATA.CotedAzur_new.xz,
               },

        // // ------------------------------
        200411:{label:"Suzuka",
                scale:1, grndW:1200, grndH:1000, adjx:-550, adjz:450, adjy:4-0.3, cnsSpeedX:0.8, // pQdbg:1,
                dtype:"xzR",
                data :CourseData.DATA.Suzuka_new.xzR.slice(0, -1),
               },

        // ------------------------------
        200711:{label:"mm2024_08_kanasai",
                scale:1, grndW:1200, grndH:800, adjx:-450, adjz:350, adjy:4.1-0.3, // pQdbg:1,
                dtype:"xzR",
                data : CourseData.DATA.mm2024_08_knasai_new.xzR,
                pQlist: CourseData.DATA.mm2024_08_knasai_new.pq,
               },

        // ------------------------------
        200613:{label:"mm2024_04_tyubu_solo",
                scale:0.5, grndW:1800, grndH:1500, adjx:-850, adjz:600, adjy:4.8, soloEnable:true,
                dtype:"xzR",
                data : CourseData.DATA.mm2024_04_tyubu_new.xzR,
                pQlist: CourseData.DATA.mm2024_04_tyubu_new.pq,
               },
        200614:{label:"mm2024_04_tyubu",
                scale:0.2, grndW:800, grndH:500, adjx:-400, adjz:250, adjy:4.6-0.3, cnsSpeedX:0.5, // pQdbg:1,
                dtype:"xzR",
                data : CourseData.DATA.mm2024_04_tyubu_new.xzR,
                pQlist: CourseData.DATA.mm2024_04_tyubu_new.pq,
               },

        // ------------------------------
        200511:{label:"mm2024_00_zenkoku_solo",
                scale:1, grndW:2400, grndH:2000, adjx:-1200, adjz:700, adjy:4.1, soloEnable:true,
                dtype:"xzR",
                data : CourseData.DATA.mm2024_00_zenkoku_new.xzR,
                pQlist: CourseData.DATA.mm2024_00_zenkoku_new.pq,
               },
        200512:{label:"mm2024_00_zenkoku",
                scale:0.5, grndW:2000, grndH:1000, adjx:-650, adjz:300, adjy:4.3-0.3, cnsAccelX:0.8, cnsSpeedX:0.6,
                dtype:"xzR",
                data : CourseData.DATA.mm2024_00_zenkoku_new.xzR,
                pQlist: CourseData.DATA.mm2024_00_zenkoku_new.pq,
               },

        // ------------------------------
        // ------------------------------
        3101:{label:"coil",
              dtype:"xzy", tubeType:"coil", adjy:4.75,
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, nbPoints:5, pStartIdx:10,
        },
        3102:{label:"spiral",
              dtype:"xzy", tubeType:"spiral", adjy:4.75,
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, nbPoints:5, pStartIdx:20,
        },
        3103:{label:"rand",
              grndW:800, grndH:800,
              dtype:"xzy", tubeType:"rand", adjy:4.75,
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, useSpline:false,
        },
        3104:{label:"rand2",
              grndW:800, grndH:800,
              dtype:"xzy", tubeType:"rand2", adjy:4.75,
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, useSpline:false,
        },

        3201:{label:"custom_boko",
              grndW:700, grndH:700, adjx:-250, adjz:0,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, pStartIdx:20,
              metaInfo:[{shape:"s"},
                        {shape:"rsindr", h:100, size:250,size2:50, rot:R360*4, div:32*4},
                        ],
        },


        7100:{label:"custom_debug",
              dtype:"xzy", tubeType:"custom",
              grndW:10, grndH:10, adjx:250, adjy:5, cnsNAgent:0,
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, nbPoints:5, pStartIdx:20,
              //useSpline:false,
              metaInfo:[
                  {shape:"s"},
                  // {shape:"r", h:5},
                  // {shape:"r", h:10, rot:R180, div:8},
                  // {shape:"r", h:15, rot:R270, div:12},
                  // {shape:"l", h:5},
                  // {shape:"l", h:10, rot:R180, div:8},
                  // {shape:"l", h:15, rot:R270, div:12},
                  // {shape:"ssin", h:5, size:100, div:20},
                  // {shape:"ssin", h:10, div:20},
                  // {shape:"ssin", h:20, size:100, div:10},
                  // {shape:"rsin", h:5},
                  // {shape:"rsin", h:10, rot:R180, div:8},
                  // {shape:"rsin", h:15, rot:R270, div:12},
                  // {shape:"lsin", h:5},
                  // {shape:"lsin", h:10, rot:R180, div:8},
                  // {shape:"lsin", h:15, rot:R270, div:12},

                  // {shape:"lsin", h:10, size:50, rot:R360, div:16},
                  // {shape:"lsindr", h:10, size:50,size2:100, rot:R360, div:24},
                  // {shape:"s", h:0, size:10shift,div:2},
                  // {shape:"lsin", h:10, size:100, rot:R360, div:16},

                  // {shape:"rsin", h:10, size:50, rot:R360, div:16},
                  // {shape:"rsindr", h:10, size:50,size2:100, rot:R360, div:24},
                  // // {shape:"s", h:0, size:10,div:2},
                  // {shape:"rsin", h:-20, size:100, rot:R360, div:16},

                  // {shape:"vloop", size:50, div:16},
                  // {shape:"r"},
                  // {shape:"vloop", size:50, div:16},
                  // {shape:"l"},
                  // {shape:"vloop", size:50, div:16},
                  // {shape:"l", rot:R180, div:8},
                  // {shape:"vloop", size:50, div:16},

                  //{shape:"vloop", size:50, size2:40, div:16},

                  // {shape:"vloop", size:50, vrot:R180, div:16},
                  // {shape:"s"},

                  // {shape:"vloop", size:50, hshift:20, div:16},

                  // {shape:"vloop", size:50, hshift:-20, div:16},

                  // {shape:"vloop", size:50, hshift:30, vrot:R360*2, div:16*2},
                  // {shape:"s",div:4},

                  // photo
                  {shape:"s"},
                  {shape:"s"},
                  {shape:"s"},
                  {shape:"s"},
                  {shape:"r"},
                  {shape:"l"},
                  {shape:"s"},
                  {shape:"s"},
                  {shape:"s"},
                  {shape:"r"},
                  {shape:"r"},
                  {shape:"l"},
                  {shape:"l"},
                  {shape:"s"},
                  {shape:"s"},
                  {shape:"s"},

              ],
        },

        7101:{label:"custom",
              grndW:200, grndH:200, adjx:-50, adjz:0,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              //   +--------+
              //   | ／￣＼ |
              //   |│    │|
              //   | ＼＿／ |
              //   +--------+
              metaInfo:[{shape:"r", nloop:4}],
              //metaInfo:[{shape:"r"}, {shape:"r"}, {shape:"r"}, {shape:"r"}],
        },

        //✕
        7102:{label:"custom",
              grndW:400, grndH:400, adjx:-50, adjz:-100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              //   +--------+--------+-
              //   | ／￣＼___／￣＼ |
              //   |│             │|
              //   | ＼     :   S ／ |
              //   +--│----+----│--+
              //   | ／     :     ＼ |
              //   |│     __      │|
              //   | ＼＿／ : ＼＿／ |
              //   +--------+--------+
              metaInfo:[{shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        ],
        },

        //✕*2
        7103:{label:"custom",
              grndW:800, grndH:800, adjx:150, adjz:-100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              isLoopCourse:false, tubeCAP:BABYLON.Mesh.CAP_ALL, pStartIdx:30,
              //   +--------+--------+-
              //   | ／￣＼___／￣＼ |
              //   |│             │|
              //   | ＼     :   S ／ |
              //   +--│----+----│--+
              //   | ／     :     ＼ |
              //   |│     __      │|
              //   | ＼＿／ : ＼＿／ |
              //   +--------+--------+
              metaInfo:[{shape:"s", },
                        {shape:"r", h:5}, 
                        {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", h:0, size:100, r:100, div:8, nloop:1}, {shape:"r"},
                        {shape:"l", h:-10}, {shape:"l", nloop:2},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"r", nloop:2}, {shape:"l", nloop:3},
                        {shape:"s", },
                        ],
        },

        //凹
        7111:{label:"custom",
              grndW:600, grndH:300, adjx:-100, adjz:100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              //   +--------+--------+-
              //   | ／￣S ￣￣￣ ＼ |
              //   |│      :      │|
              //   | ＼____ :      │|
              //   +-------＼------│|
              //   |        :│    │|
              //   |        : ＼＿／ |
              //   +--------+--------+
              metaInfo:[{shape:"s", dir:0 },
                        {shape:"s", size:100, r:100, nloop:2},
                        {shape:"r", nloop:2},
                        {shape:"s", nloop:1},
                        {shape:"r", size:50, r:50},
                        {shape:"l",},
                        {shape:"s", nloop:2},
                        {shape:"r", nloop:2},
                        {shape:"s", nloop:1},
                        ],
        },

        7112:{label:"custom",
              grndW:600, grndH:300, adjx:-100, adjz:100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              useSpline:false,  // 補間せずに細かく細分化するほうがよさげ
              //   +--------+--------+-
              //   | ／￣S ￣￣￣ ＼ |
              //   |│      :      │|
              //   | ＼____ :      │|
              //   +-------＼------│|
              //   |        :│    │|
              //   |        : ＼＿／ |
              //   +--------+--------+
              metaInfo:[{shape:"s", dir:0 },
                        {shape:"ssin", h:10, div:16},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:-10, div:16},
                        {shape:"s", h:0, div:4},
                        {shape:"rsin", h:20, size:100, rot:R180, div:100},
                        {shape:"s", h:0, div:4},
                        {shape:"r", size:50, rot:R90, div:30},
                        {shape:"l",},
                        {shape:"s", div:4},
                        {shape:"rsin", h:-20, rot:R180, div:60},
                        //{shape:"s", h:0, div:4},
                        ],
        },


        //８の字
        7113:{label:"custom",
              grndW:1200, grndH:1200, adjx:100, adjz:100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              //   +--------+--------+-
              //   |        : ／￣＼ |
              //   |        :│    │|
              //   |        :│    │|
              //   +--------+│-- ／-+
              //   | ／￣￣ :￣￣    |
              //   |│      :│ S    |
              //   | ＼＿___／       |
              //   +--------+--------+
              metaInfo:[{shape:"s",size:200},
                        {shape:"rsin", h:14, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"s", h:0, size:300, div:4},
                        {shape:"lsin", h:-14, rot:R270, div:12},
                        {shape:"s", h:0, size:275, div:4},
                        ],
        },

        // 横ループ
        7114:{label:"custom_loop",
              grndW:600, grndH:700, adjx:0, adjz:50,
              dtype:"xzy", tubeType:"custom", adjy:4.75, pQdiv:6,
              metaInfo:[{shape:"s"},
                        {shape:"rsin", h:30, rot:R360*2, div:32*2},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"lsin", h:15, rot:R180*3, div:8*3},
                        {shape:"s", h:0, size:175, div:4},
                        {shape:"l", size:300, rot:R90, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:-30, size:100, rot:R90*6, div:4*6},
                        {shape:"s", h:0, size:50*4, div:4},
                        {shape:"lsin", h:-15, size:50, rot:R90*3, div:4*3},
                        {shape:"s", h:0, size:125, div:4},
                        ],
        },

        // Y字：クランク＋２車線
        7115:{label:"custom",
              grndW:600, grndH:600, adjx:0, adjz:-50,
              dtype:"xzy", tubeType:"custom", adjy:4.75+10, pQdiv:8,
              metaInfo:[{shape:"s"},
                        {shape:"r"},
                        {shape:"l"},
                        {shape:"s"},
                        {shape:"s"},
                        {shape:"rsin", h:12, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"l", rot:R90},
                        {shape:"r", rot:R180, div:8},
                        {shape:"l", rot:R90, div:4},
                        {shape:"s", h:0, size:60, div:4},
                        {shape:"rsin", h:-12, size:50, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"l", rot:R90},
                        {shape:"r"},
                        {shape:"s", size:150, div:4},
                        {shape:"r", size:50, },
                        {shape:"l", size:50, rot:R180, div:8},
                        {shape:"s", size:20, div:2},
                        {shape:"l", size:50, rot:R90, div:4},
                        {shape:"s", size:200, div:4},
                        {shape:"r", size:40},
                        {shape:"l", size:60},
                        {shape:"s", size:50},
                        {shape:"ssin", h:13, size:50},
                        {shape:"rsin", h:11, size:60, rot:R270, div:12},
                        {shape:"s", h:0, size:70, div:4},
                        {shape:"lsin", h:-4, size:40, rot:R90, div:4},
                        {shape:"rsin", h:-8, size:60, rot:R180, div:8},
                        {shape:"l", h:0, size:40, rot:R90, div:4},
                        {shape:"s", size:60, div:4},
                        {shape:"rsin", h:-12, size:60, rot:R270, div:12},
                        {shape:"ssin", h:-4, size:50, div:4},
                        {shape:"lsin", h:-4, size:40, rot:R90, div:4},
                        {shape:"rsin", h:-4, size:40, rot:R90, div:4},
                        {shape:"ssin", h:+12, size:130, div:12},
                        {shape:"s", h:0, size:40, div:4},
                        {shape:"rsin", h:6, size:40},
                        {shape:"lsin", h:6, size:60, rot:R270, div:15},
                        {shape:"ssin", h:-12, size:140, div:12},
                        ],
        },


        // 急坂：幅広の滝
        7116:{label:"custom",
              grndW:400, grndH:800, adjx:0, adjz:-150,
              dtype:"xzy", tubeType:"custom", adjy:4.75, pQdiv:40,
              metaInfo:[{shape:"s"},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:100, div:8},
                        {shape:"l", h:0, size:20, rot:R90, div:4},
                        {shape:"r", h:0, size:30, rot:R270, div:12},
                        {shape:"s", h:0, size:150, div:10},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:170, div:12},
                        {shape:"lsin", h:0, size:30, rot:R270, div:12},
                        {shape:"rsin", h:0, size:20, rot:R90, div:4},
                        {shape:"s", h:0, size:120, div:8},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:150, div:8},
                        {shape:"l", h:0, size:40, rot:R180, div:8},
                        {shape:"s", h:0, size:10, div:2},
                        {shape:"l", h:0, size:30, rot:R90, div:4},
                        {shape:"r", h:0, size:20, rot:R90, div:12},
                        {shape:"s", h:0, size:90, div:8},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:170, div:12},
                        {shape:"lsin", h:0, size:50, rot:R180, div:8},
                        {shape:"lsin", h:0, size:40, rot:R90, div:4},
                        {shape:"rsin", h:0, size:20, rot:R90, div:4},
                        {shape:"s", h:0, size:110, div:10},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:70, div:6},
                        {shape:"ssin", h:14, size:50, div:4},
                        {shape:"l", h:0, size:25, rot:R180, div:8},
                        {shape:"ssin", h:-14, size:50, div:4},
                        {shape:"s", h:0, size:70, div:6},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:90, div:6},
                        {shape:"ssin", h:14, size:50, div:4},
                        {shape:"l", h:0, size:30, rot:R180, div:8},
                        {shape:"ssin", h:-14, size:50, div:4},
                        {shape:"s", h:0, size:90, div:6},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:70, div:6},
                        {shape:"ssin", h:14, size:50, div:4},
                        {shape:"l", h:0, size:35, rot:R180, div:8},
                        {shape:"ssin", h:-14, size:50, div:4},
                        {shape:"s", h:0, size:70, div:6},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:90, div:6},
                        {shape:"ssin", h:14, size:50, div:4},
                        {shape:"l", h:0, size:40, rot:R180, div:8},
                        {shape:"ssin", h:-14, size:50, div:4},
                        {shape:"s", h:0, size:90, div:6},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:70, div:6},
                        {shape:"ssin", h:14, size:50, div:4},
                        {shape:"l", h:0, size:45, rot:R180, div:8},
                        {shape:"ssin", h:-14, size:50, div:4},
                        {shape:"s", h:0, size:70, div:6},

                        {shape:"ssin", h:100, size:80, div:8},
                        {shape:"ssin", h:-100, size:80, div:8},
                        {shape:"s", h:0, size:90, div:6},
                        {shape:"ssin", h:28, size:50, div:4},
                        {shape:"l", h:0, size:20, rot:R180, div:8},
                        {shape:"ssin", h:-28, size:50, div:4},
                        {shape:"s", h:0, size:20, div:6},

                        ],
        },

        // 急坂：一本滝
        7117:{label:"custom",
              grndW:400, grndH:800, adjx:0, adjz:-150,
              dtype:"xzy", tubeType:"custom", adjy:4.75, pQdiv:8,
              metaInfo:[{shape:"s", size:50, div:4},
                        {shape:"ssin", h:1000, size:800, div:40},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-20, size:50, div:4},
                        {shape:"ssin", h:-40, size:100, div:8},
                        {shape:"lsin", h:-20, size:50, div:4},
                        {shape:"rsin", h:-20, size:50, div:4},
                        {shape:"ssin", h:-20, size:50, div:4},
                        {shape:"lsin", h:-40, size:50, rot:R180, div:8},

                        {shape:"ssin", h:-60, size:150, div:12},
                        {shape:"lsin", h:-40, size:50, rot:R180, div:8},
                        {shape:"rsin", h:-40, size:50, rot:R180, div:8},
                        {shape:"ssin", h:-40, size:100, div:8},
                        {shape:"lsin", h:-40, size:50, rot:R180, div:8},
                        {shape:"ssin", h:-60, size:150, div:12},
                        {shape:"rsin", h:-40, size:50, rot:R180, div:8},
                        {shape:"ssin", h:-80, size:200, div:16},
                        {shape:"lsin", h:-40, size:50, rot:R180, div:8},
                        {shape:"ssin", h:-20, size:50, div:4},
                        {shape:"rsin", h:-20, size:50, rot:R90, div:4},
                        {shape:"ssin", h:-80, size:200, div:16},
                        {shape:"rsin", h:-20, size:100, rot:R90, div:4},
                        {shape:"lsin", h:-20, size:100, rot:R90, div:4},
                        {shape:"ssin", h:0, size:250, div:20},
                        {shape:"lsin", h:-240, size:50, rot:R90*(4*5+2), div:4*(4*5+2)},
                        {shape:"s", h:0, size:25, div:2},
                        ],
        },

        // ツインタワー
        7118:{label:"custom",
              grndW:600, grndH:600, adjx:-100, adjz:100,
              dtype:"xzy", tubeType:"custom", adjy:4.75, pQdiv:11, cnsCS:0.2, // CS=0.1だと近接したチューブで誤動作おこすっぽい
              metaInfo:[{shape:"s"},
                        {shape:"rsin", h:200, size:50, rot:R360*5, div:16*3},
                        {shape:"rsindr", h:0, size:50,size2:60, rot:R90, div:6},
                        {shape:"rsin", h:-190, size:60, rot:R360*4.25, div:16*4+4},
                        {shape:"s", h:0, size:200, div:4},
                        {shape:"lsin", h:290, size:40, rot:R360*6, div:16*6},
                        {shape:"s", h:0, size:70, div:4},
                        {shape:"rsin", h:-300, size:40, rot:R360*6.25, div:16*6+4},
                        {shape:"r", h:0, size:70, rot:R90, div:4},
                        {shape:"s", h:0, size:150, rot:R90, div:2},

                        ],
        },

        // スラローム
        7119:{label:"custom",
              grndW:1000, grndH:1000, adjx:0, adjz:0, dir:0,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              metaInfo:[{shape:"s"},
                        {shape:"r", size:100,div:8},
                        {shape:"l"},
                        {shape:"r"},
                        {shape:"s", size:90, div:4},
                        {shape:"l", size:50, rot:R270, div:12},
                        {shape:"r", size:40, rot:R90, div:4},
                        {shape:"l", size:110,div:8},
                        {shape:"r", size:90,div:8},
                        {shape:"l", size:110,div:8},
                        {shape:"s", size:100, div:8},
                        {shape:"r", size:50, div:4},
                        {shape:"l"},
                        {shape:"r"},
                        {shape:"l"},
                        {shape:"r"},
                        {shape:"s", size:90, div:4},
                        {shape:"l", size:50, rot:R270, div:12},
                        {shape:"r", size:40, rot:R90, div:4},
                        {shape:"l", size:60},
                        {shape:"r", size:40},
                        {shape:"l", size:60},
                        {shape:"r", size:40},
                        {shape:"l", size:60},
                        {shape:"s", size:25, div:2},
                        ],
        },

        // 縦ループ
        7120:{label:"custom",
              grndW:600, grndH:800, adjx:100, adjz:-50, tubeRadius:10, cnsRadius:4,
              dtype:"xzy", tubeType:"custom", adjy:4.75+5,
              cnsWalkableHeight:20, cnsWalkableClimb:20, // debugMesh:1, 
              metaInfo:[{shape:"s", size:50, div:4},
                        {shape:"s", size:50, div:4},
                        {shape:"vloop", size:50, hshift:20, vrot:R360*1, div:16*1},
                        {shape:"s",size:100, div:8},
                        {shape:"l", size:100, rot:R180, div:8},
                        {shape:"s", size:50, div:4},
                        {shape:"vloop", size:30, hshift:40, vrot:R360*2, div:16*2},
                        {shape:"s",size:100, div:8},
                        {shape:"s",size:100, div:8},
                        {shape:"l", size:110, rot:R180, div:8},
                        {shape:"s", size:25, div:2},
                        ],
        },

        // フープス／凹凸
        7121:{label:"custom",
              grndW:600, grndH:700, adjx:100, adjz:-50, tubeRadius:10, cnsRadius:10,
              dtype:"xzy", tubeType:"custom", adjy:4.75+5,
              metaInfo:[{shape:"s",size:100, div:4},
                        {shape:"s"},
                        {shape:"l", rot:R180, div:8},
                        {shape:"s", size:50, div:4},
                        {shape:"ssin", h:5, size:25},
                        {shape:"ssin", h:-5, size:25},
                        {shape:"ssin", h:5, size:25},
                        {shape:"ssin", h:-5, size:25},
                        {shape:"ssin", h:5, size:25},
                        {shape:"ssin", h:-5, size:25},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"l", size:100, rot:R180, div:8},
                        {shape:"s", size:75, div:3},
                        ],
        },

        4101:{label:"custom",
              grndW:400, grndH:400, adjx:-50, adjz:-25,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              //   +--------+--------+-
              //   |        : ／￣＼ |
              //   |        :│    │|
              //   |        :│     ＼ 
              //   +--------+│------+＼------+
              //   | ／￣￣ :│￣ ＼ :   ￣＼ |
              //   |│      : S    │:      │|
              //   | ＼＿_______＿_│:___＿／ |
              //   +--------+│----│+--------+
              //   |        :│    │|
              //   |        :│    │|
              //   |        : ＼＿／ |
              //   +--------+--------+
              // https://katlas.org/wiki/3_1
              // https://katlas.org/wiki/File:Hart-knot-C.jpg
              //   +--------+--------+
              //   | ／￣＼＿_／￣＼ |
              //   |│     ＿_     │|
              //   | ＼  ／ : ＼  ／ |
              //   +---＼---+-- ＼---+
              //   | ／  ＼ : ／  ＼ |
              //   |│     ／      │|
              //   | ＼＿／ : ＼＿／ |
              //   +--------+--------+
              metaInfo:[{shape:"ssin", h:12, size:75, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"r", h:0, size:50, rot:R180, div:8},
                        {shape:"l", rot:R90, div:4},
                        {shape:"rsin", h:-12, rot:R180, div:8},
                        {shape:"s", h:0, rot:R90, div:4},
                        {shape:"ssin", h:12, size:100},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-12, size:50, rot:R180, div:8},
                        {shape:"s", h:0, size:100, rot:R90, div:4},
                        {shape:"rsin", h:12, size:50},
                        {shape:"s", h:0},
                        {shape:"s", h:0},
                        {shape:"r", h:-12,rot:R180, div:8},
                        {shape:"s", h:0, size:50, rot:R90, div:4},
                        ],
        },

        4102:{label:"custom",
              grndW:500, grndH:500, adjx:0, adjz:150,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              // https://katlas.org/wiki/4_1
              // https://katlas.org/wiki/File:FigureEightKnot4a-C.jpg
              //   +--------+--------+--------+
              //   | ／￣＼ : ／￣＼＿_／￣＼ |
              //   |│     ／S      ＿_     │|
              //   | ＼  ／ : ＼  ／ : ＼  ／ |
              //   +---＼---+---＼---+--｜｜--+
              //   | ／  ＼＿_／  ＼ : ／  ＼ |
              //   |│     ＿_      ／      │|
              //   | ＼＿／ : ＼＿／ : ＼＿／ |
              //   +--------+--------+--------+
              metaInfo:[{shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"lsin", h:-14, size:50, rot:R90, div:4},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"rsin", h:14, size:50, rot:R180, div:8},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"r", size:50, rot:R90, div:4},
                        {shape:"l"},
                        {shape:"rsin", h:-14, rot:R180, div:8},
                        {shape:"ssin", h:+14, size:200, div:16},
                        {shape:"r", h:0, size:50, rot:R90, div:8},
                        {shape:"l"},
                        {shape:"r", rot:R180, div:16},
                        {shape:"l", rot:R90, div:8},
                        {shape:"rsin", h:-14, rot:R180, div:8},
                        {shape:"s", h:0},
                        {shape:"ssin", h:14, size:100, div:16},
                        {shape:"ssin", h:-14, div:16},
                       ],
             },

        4103:{label:"custom",
              grndW:500, grndH:500, adjx:0, adjz:100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              // https://katlas.org/wiki/5_1
              // https://katlas.org/wiki/File:SolomonsSealKnot5a-C.jpg
              //   +--------+--------+--------+
              //   | ／￣＼S  ／￣＼ : ／￣＼ |
              //   |│     ／       ／      │|
              //   | ＼  ／ : ＼＿／ : ＼  ／ |
              //   +---＼---+--------+---＼---+
              //   | ／  ＼ : ／￣＼＿_／  ＼ |
              //   |│     ／       ＿_     │|
              //   | ＼＿／ : ＼＿／ : ＼＿／ |
              //   +--------+--------+--------+
              metaInfo:[{shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"l", h:0, rot:R90},
                        {shape:"r"},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R90},
                        {shape:"s", h:0},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"r", size:50, rot:R90},
                        {shape:"lsin", h:-14},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"lsin", h:14, size:50, rot:R180, div:8},
                        {shape:"s", h:0, size:100, div:4},
                        {shape:"rsin", h:-14, size:50, rot:R90, div:4},
                        {shape:"s", h:0, size:25, div:2},
                        ],
             },

        4104:{label:"custom",
              grndW:600, grndH:600, adjx:100, adjz:150,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              // https://katlas.org/wiki/7_4
              // https://katlas.org/wiki/File:Takara-4harts-C7.jpg
              //   +--------+--------+--------+--------+
              //   |        : ／￣＼ : ／￣＼ :        |
              //   |        :│     ／ S    │:        |
              //   |        : ＼  ／ : ＼  ／ :        |
              //   +--------+---＼---+-- ＼---+--------+
              //   | ／￣＼ : ／  ＼ : ／  ＼ : ／￣＼ |
              //   |│    │:│     ／      │:│    │|
              //   | ＼＿／ : ＼  ／ : ＼  ／ : ＼＿／ |
              //   +--------+---＼---+---＼---+--------+
              //   |        : ／  ＼ : ／  ＼ :        |
              //   |        :│     ／      │:        |
              //   |        : ＼＿／ : ＼＿／ :        |
              //   +--------+--------+--------+--------+
              metaInfo:[{shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"ssin", h:14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-14, rot:R90},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R90, div:4},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"s", h:0, size:25, div:2},

                        ],
             },


        4105:{label:"custom",
              grndW:600, grndH:500, adjx:-50, adjz:-100,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              // https://katlas.org/wiki/6_1
              // https://katlas.org/wiki/File:StevedoresKnot-1-6a-C.jpg
              //   +--------+--------+--------+
              //   | ／￣＼ : ／￣＼ :        |
              //   |│     ／      │:        |
              //   | ＼  ／ : ＼  ／ :        |
              //   +--││--+--││--+--------+
              //   | ／  ＼ : ／  ＼＿_／￣＼ |
              //   |│     ／               │|
              //   | ＼  ／ : ＼＿／￣~＼  ／ |
              //   +---＼---+--------+---＼---+
              //   | ／S ＼ : ／￣＼ : ／  ＼ |
              //   |│     ／       ／      │|
              //   | ＼＿／ : ＼＿／ : ＼＿／ |
              //   +--------+--------+--------+
              metaInfo:[{shape:"ssin", h:14, size:50, div:4},
                        {shape:"s", h:0, size:50},
                        {shape:"ssin", h:-14, size:50},
                        {shape:"l", h:0, size:50, div:4},
                        {shape:"s", h:0, size:100},
                        {shape:"lsin", h:14, size:50, rot:R180, div:8},
                        {shape:"r", h:0, rot:R90, div:4},
                        {shape:"l", h:0},
                        {shape:"s", h:0},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14},
                        {shape:"s", h:0},
                        {shape:"ssin", h:-14, size:100},
                        {shape:"s", h:0, size:50},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"r", h:0},
                        {shape:"l"},
                        {shape:"s", size:100},
                        {shape:"lsin", h:-14, size:50, rot:R90, div:4},
                        {shape:"s", h:0},
                        {shape:"s"},
                        {shape:"lsin", h:7},
                        {shape:"rsin", h:7},
                        {shape:"s", h:0},
                        {shape:"s"},
                        {shape:"rsin", h:-14, size:50, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"s"},
                        {shape:"lsin", h:14, size:50, rot:R90, div:4},
                        {shape:"s", h:0, div:4},
                        {shape:"s", h:0, div:4},
                        {shape:"rsin", h:-14, size:50, rot:R180, div:8},
                        {shape:"s", h:0, size:25, div:4},
                        ],
             },

        4106:{label:"custom",
              grndW:600, grndH:600, adjx:-50, adjz:50,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              // https://katlas.org/wiki/0_1
              // https://katlas.org/wiki/File:Swastika-Manji_Kolam-C.jpg
              // +--------+--------+--------+
              // | ／￣＼ : ／￣＼ : ／￣＼ |
              // |│     ／      │:│    │|
              // | ＼＿／ : ＼ S／ : ＼  ／ |
              // +--------+---＼---+-- ＼---+
              // | ／￣＼ : ／  ＼ : ／  ＼ |
              // |│     ／       ／      │|
              // | ＼  ／ : ＼  ／ : ＼＿／ |
              // +---＼---+---＼---+--------+
              // | ／  ＼ : ／  ＼ : ／￣＼ |
              // |│    │:│     ／      │|
              // | ＼＿／ : ＼＿／ : ＼＿／ |
              // +--------+--------+--------+
              metaInfo:[{shape:"s"},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"s"},
                        {shape:"rsin", h:-14, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"s"},
                        {shape:"rsin", h:-14, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"s"},
                        {shape:"rsin", h:-14, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"s"},
                        {shape:"rsin", h:-14, rot:R270, div:12},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        ],
             },

        4107:{label:"custom",
              grndW:600, grndH:600, adjx:100, adjz:125,
              dtype:"xzy", tubeType:"custom", adjy:4.75,
              // https://katlas.org/wiki/File:TakaraMusubi-C9.jpg
              //   +--------+--------+--------+--------+
              //   |        : ／￣＼ : ／￣＼ :        |
              //   |        :│     ／ S    │:        |
              //   |        : ＼  ／ : ＼  ／ :        |
              //   +--------+---＼---+-- ＼---+--------+
              //   | ／￣＼ : ／  ＼ : ／  ＼ : ／￣＼ |
              //   |│     ／       ／       ／      │|
              //   | ＼＿／ : ＼  ／ : ＼  ／ : ＼＿／ |
              //   +--------+---＼---+---＼---+--------+
              //   |        : ／  ＼ : ／  ＼ :        |
              //   |        :│     ／      │:        |
              //   |        : ＼＿／ : ＼＿／ :        |
              //   +--------+--------+--------+--------+

              metaInfo:[{shape:"s", size:25, div:2},
                        {shape:"lsin", h:14, size:50, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"ssin", h:14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-14, rot:R180, div:8},
                        {shape:"s", h:0, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R270, div:12},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"ssin", h:14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-14, rot:R180, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"lsin", h:14, rot:R180, div:8},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"ssin", h:-14, size:100, div:8},
                        {shape:"ssin", h:14},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"rsin", h:-14, rot:R270, div:12},
                        {shape:"s", h:0, size:50, div:4},
                        {shape:"ssin", h:14, size:100, div:8},
                        {shape:"ssin", h:-14},
                        {shape:"s", h:0, size:25, div:2},
                        
                        ],
             },



    };



    var getMetaStageInfo = function (istage) {
        const i2id = {

            // ------------------------------
            0:200801,//地図からコース
            1:200901,
            2:200101,
            3:200202,
            4:200301,
            5:200411,
            6:200711,
            7:200614,
            8:200512,

            // ------------------------------
            // 逆走
            9:200802,
            10:200203,

            // ------------------------------
            // ソロプレイ：CNSなし
            11:200613,
            12:200511,

            // ------------------------------
            // 片道の往復
            13:200204,
            14:200205,

            // ==============================

            15:3101,//スライダーコース：円柱
            16:3102,//すり鉢：凹
            17:3201,//やま：凸
            18:3103,//ランダム
            19:3104,//ランダム２

            // ==============================
            // customによる自作コース
            20:4101,//コーラム模様
            21:4102,
            22:4103,
            23:4104,
            24:4105,
            25:4106,
            26:4107,

            27:7102, //✕
            28:7103, //✕*2
            29:7111, //凹
            30:7113, //８の字
            31:7114, // 横ループ
            32:7115, // Y字：クランク＋２車線
            33:7116, // 急坂：幅広の滝
            34:7117, // 急坂：一本滝
            35:7118, // ツインタワー
            36:7119, // スラローム
            37:7120, // 縦ループ
            38:7121, // フープス／凹凸

            9999:7100,//photo
            // 9999:7120,

        }

        let id = i2id[istage];
        let rval = metaStageInfo[id];
        console.log("\ni=",istage, rval.label);

        if (istage >= 15) {
            rval = createTubeData(rval);
        }

        return rval;
    }

    let istage=0, nstage=39;
    // let istage=9999, nstage=39;


    // --------------------------------------------------

    var scene = new BABYLON.Scene(engine);

    let cameraType = 1; // 1:default / 0:debug
    let camera = null;
    if (!cameraType) {
        camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100,-10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);
    } else {
        camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);
        camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    }

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    let pStart = new BABYLON.Vector3(0, 0, 0);
    let pStart2 = new BABYLON.Vector3(0, 0, 0);

    // --------------------------------------------------

    // Player/楕円形
    let myMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: 1.0, diameterY: 0.5, diameterZ: 4.0, segments: 8 }, scene);
    let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, friction: 0.08, restitution:0.05}, scene);
    let linearDampingBase = 0.0; // 0.03;  // スピードが乗りすぎるときはこちらで調整
    let linearDampingBrake = 2; // ブレーキ時
    myMesh.physicsBody.setLinearDamping(linearDampingBase);
    myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
    myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
    myMesh.material = new BABYLON.GradientMaterial("grad", scene);
    myMesh.material.topColor = new BABYLON.Color3(1, 1, 1);
    myMesh.material.bottomColor = new BABYLON.Color3(1, 0.6, 0.6);
    myMesh.material.smoothness = -0.1;
    {
        // ボードの上にキャラクターをのせる
        let itype = 0;
        let charPath = charPathList[itype];
        var mx = 3, my = 4;
	const matLR = new BABYLON.StandardMaterial("");
	matLR.diffuseTexture = new BABYLON.Texture(charPath);
	matLR.diffuseTexture.hasAlpha = true;
	matLR.emissiveColor = new BABYLON.Color3.White();
	const uvL = new BABYLON.Vector4(0, 2/my, 1/mx, 3/my); // L
        const uvR = new BABYLON.Vector4(1/mx, 1/my, 0, 2/my); // R
        const planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvR, backUVs: uvL, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        planeLR.position.y = 1.2;
        planeLR.material = matLR;
        planeLR.rotation = new BABYLON.Vector3(0, R90, 0);
        planeLR.parent = myMesh;
    }
    let resetMyPosi = function () {
        myMesh.position = pStart.clone();
        myMesh.position.y -= 4;
        let p1 = pStart.clone();
        let p3 = pStart2.clone();
        p3.subtractInPlace(p1);
        let vrot = Math.atan2(p3.x, p3.z);
        myMesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
        myMesh.rotate(BABYLON.Vector3.Up(), vrot);
        myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
    }
    resetMyPosi();
    if (cameraType) {
        camera.lockedTarget = myMesh;
        scene.onBeforeRenderObservable.add((scene) => {
            let vdir = camera.position.subtract(myMesh.position).normalize().scale(5);
            vdir.y = 1;
            camera.position = myMesh.position.add(vdir);
        });
    }

    function createdBubble(mesh, opt={}) {
        // 軌跡
        let rngxmin = typeof(opt.rngxmin) !== 'undefined' ? opt.rngxmin : -0.5;
        let rngxmax = typeof(opt.rngxmax) !== 'undefined' ? opt.rngxmax : 0.5;
        let rngzmin = typeof(opt.rngzmin) !== 'undefined' ? opt.rngzmin : -1;
         let rngzmax = typeof(opt.rngzmax) !== 'undefined' ? opt.rngzmax : 1;
        let py = typeof(opt.py) !== 'undefined' ? opt.py : -0.2;
        let emitRate = typeof(opt.emitRate) !== 'undefined' ? opt.emitRate : 10000;
        let direction1 = typeof(opt.direction1) !== 'undefined' ? opt.direction1 : new BABYLON.Vector3(-0.1, 0.1, -0.1);
        let direction2 = typeof(opt.direction2) !== 'undefined' ? opt.direction2 : new BABYLON.Vector3( 0.1, 0.1,  0.1);
        let life = typeof(opt.life) !== 'undefined' ? opt.life : 0.3;
        let npart = typeof(opt.npart) !== 'undefined' ? opt.npart : 20000;
        let particleSystem = new BABYLON.ParticleSystem("particles", npart);
        particleSystem.particleTexture = new BABYLON.Texture(txt_tail_bubble);
        particleSystem.emitter = mesh;
        particleSystem.minEmitBox = new BABYLON.Vector3(rngxmin, py, rngzmin);
        particleSystem.maxEmitBox = new BABYLON.Vector3(rngxmax, py, rngzmax);
        particleSystem.minScaleX = 0.05;
        particleSystem.maxScaleX = 0.05;
        particleSystem.minScaleY = 0.15;
        particleSystem.maxScaleY = 0.15;
        particleSystem.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(0.0, 1.0, 1.0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0.0, 0.0, 0.0, 0.0);
        particleSystem.emitRate = emitRate;
        particleSystem.direction1 = direction1;
        particleSystem.direction2 = direction2;
        particleSystem.updateSpeed = 0.002;
        particleSystem.minLifeTime = life*0.8;
        particleSystem.maxLifeTime = life;
        // particleSystem.start();
        return particleSystem;
    }
    let myMeshPS = createdBubble(myMesh);

    // --------------------------------------------------


    let meshAggInfo = []; // mesh, agg;
    let meshes = [];
    let navigationPlugin = null, navmeshdebug = null, crowd = null, agentMeshList = [];
    let skybox = null, skybox2 = null;;

    var createStage = function(istage) {
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        let metaStageInfo = getMetaStageInfo(istage)
        let stageType = typeof(metaStageInfo.stageType) !== 'undefined' ? metaStageInfo.stageType : "tube";
        let useSpline = typeof(metaStageInfo.useSpline) !== 'undefined' ? metaStageInfo.useSpline : true;
        let nbPoints = typeof(metaStageInfo.nbPoints) !== 'undefined' ? metaStageInfo.nbPoints : 20;
        let pStartIdx = typeof(metaStageInfo.pStartIdx) !== 'undefined' ? metaStageInfo.pStartIdx:1;
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
        let tubeRadius = typeof(metaStageInfo.tubeRadius) !== 'undefined' ? metaStageInfo.tubeRadius : 5;
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

        let plist = [];
        if(metaStageInfo.dtype=='xz') {
            // 画像から抜き出した座標をそのまま使う版
            //let iystep = metaStageInfo.iystep;
            for (let [ix,iz] of metaStageInfo.data) {
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
                if (tmp.length == 2) {
                    [ix,iz] = tmp;
                    dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                    iystep = iyrate*dis;
                    iy += iystep;
                    plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                } else if (tmp.length == 3) {
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

        } else if(metaStageInfo.dtype=='xzy') {
            // 高さを手動で指定した版
            for (let [ix,iz,iy] of metaStageInfo.data) {
                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
            }
        }

        if (1) {
            let plist2 = []
            if(useSpline) {
                // 上記で取得した点列を、スプラインで補間
                const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
                plist2 = catmullRom.getPoints();
            } else {
                plist2 = plist;
            }

            if (!cameraType) {
                let ymin = plist2[0].y
                for (let p of plist2) {
                    if (ymin > p.y) {
                        ymin = p.y
                    }
                }
                console.log("\nymin=", ymin);
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
            let plist3 = plist2;
            if (reverse) {
                plist3 = plist2.slice().reverse();
            }

            pStart = plist3[pStartIdx].clone();
            pStart2 = plist3[pStartIdx+2].clone();
            pGoal = plist3[plist3.length-1].clone();

            // エージェントの目的地
            let pQ = [];  // 単一ライン
            // let pQQ = pRouteList; // 複数ライン
            if (isLoopCourse) {
                // 周回コース
                if (pQlist.length > 0) {
                    for (let i of pQlist) {
                        let id = i*nbPoints;
                        if (id >= plist3.length) continue;
                        pQ.push(plist3[id].clone())
                    }
                } else if (pQdiv==0) {
                    pQ.push(pStart.clone());
                    pQ.push(plist3[Math.floor(plist3.length/4)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/2)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/4*3)].clone());
                } else {
                    let n = Math.min(plist3.length, pQdiv);
                    let istep=Math.max(1,Math.floor(plist3.length/n));
                    for (let i = 0; i < plist3.length; i+=istep) {
                        pQ.push(plist3[i].clone());
                    }
                }
            } else {
                // 一本道の往復コース
                // 片方、往復させるために逆順も追加
                if (pQlist.length > 0) {
                    for (let i of pQlist) {
                        let id = i*nbPoints;
                        if (id >= plist3.length) continue;
                        pQ.push(plist3[id].clone())
                    }
                    let pQlistRV = pQlist.reverse();
                    for (let i of pQlistRV) {
                        let id = i*nbPoints;
                        if (id >= plist3.length) continue;
                        pQ.push(plist3[id].clone())
                    }

                } else if (pQdiv==0) {
                    pQ.push(pStart.clone());
                    pQ.push(plist3[Math.floor(plist3.length/4)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/2)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/4*3)].clone());
                    //
                    pQ.push(plist3[Math.floor(plist3.length-1)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/4*3)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/2)].clone());
                    pQ.push(plist3[Math.floor(plist3.length/4)].clone());

                } else {
                    let n = Math.min(plist3.length, pQdiv);
                    let istep=Math.max(1,Math.floor(plist3.length/n));
                    for (let i = 0; i < n; i+=istepi) {
                        pQ.push(plist3[i].clone());
                    }
                    for (let i = n-1; i > 0; i-=istepi) {
                        pQ.push(plist3[i].clone());
                    }
                }
            }
            // tubeの場合、座標値が高すぎ（エージェントの位置がきまらない）ので下げる
            if (stageType=="tube") {
                let tmp = [];
                for (let p of pQ) {
                    p.y -= tubeRadius*0.8; // tube
                    tmp.push(p);
                }
                pQ = tmp;
            }

            if (pQdbg) {
                // デバッグ表示、pQの位置を球で表示
                console.log("plist2.length=",plist2.length, " 1/20=",Math.floor(plist2.length/20));
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
                for (let i = 0; i < plist2.length; ++i) {
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
                    mesh.position = plist2[i].clone();
                    mesh.position.y += 0.5; // r;
                    mesh.material = new BABYLON.StandardMaterial("mat");
                    mesh.material.emissiveColor = c;
                    mesh.material.alpha = 0.3;

                }
            }

            if (stageType=='tube') {
                // チューブで表示
                let mesh = BABYLON.MeshBuilder.CreateTube("tube", {path:plist2, radius:tubeRadius, cap:tubeCAP}, scene);
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.emissiveColor = BABYLON.Color3.Blue();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                meshes.push(mesh);
            }

            // CNS
            var navmeshParameters = {
                cs: cnsCS, // 0.1,  // 歩行可能なナビメッシュのボクセルサイズ（幅、深さ
                ch: 0.2,  // ボクセルの高さ
                walkableSlopeAngle: 90,  // 歩行可能な最大傾斜の角度[度]
                walkableHeight: cnsWalkableHeight, // 2, //  歩行が許可されるボクセル単位の高さ
                walkableClimb: cnsWalkableClimb, // 2,// 登ることができるボクセル単位のデルタ

                walkableRadius: 3, // エージェントのボクセル単位での半径
                maxEdgeLen: 12.,  // メッシュの境界に沿った輪郭エッジの最大許容長さ[ボクセル単位]
                maxSimplificationError: 1.3, // 境界エッジが元の生の輪郭から逸脱する最大距離[ボクセル単位]
                minRegionArea: 4, // 8,  // 孤立した島領域を形成できるセルの最小数[ボクセル単位]
                mergeRegionArea: 3, // 20,  // 領域結合の閾値。[ボクセル単位]
                maxVertsPerPoly: 6, // 輪郭線からポリゴンへの頂点の最大数(３以上)
                detailSampleDist: 6,  // 詳細メッシュ生成のサンプリング距離
                detailSampleMaxError: 1,  // 詳細メッシュ表面が高さフィールドの最大距離[ワールド単位]
                borderSize:1,
                tileSize:0, // 20 // タイルのサイズ def:0 :=障害物が機能しない
            };
            let maxAgents = cnsNAgent, iniAgents = cnsNAgent;
            var agentParams = {
                radius: cnsRadius, // 0.8, // 0.1,  // エージェントの半径。[制限: >= 0]
                reachRadius: cnsReachRadius, // 2, // 0.3, // エージェントが目的地の周囲にこの半径の仮想円内に入ると、オブザーバーに通知されます。デフォルトはエージェントの半径です。
                height: 0.2, // エージェントの高さ。[制限: > 0]
                maxAcceleration: 4.0,  // 最大許容加速度。[制限: >= 0]
                maxSpeed: 1,  // 許容される最大速度。[制限: >= 0]
                collisionQueryRange: cnsCollisionQueryRange, // 0.5,  // ステアリング動作の対象となる衝突要素がどれだけ近い必要があるかを定義します。[制限: > 0]
                pathOptimizationRange: 10.0,  // パスの可視性の最適化範囲。[制限: > 0]
                separationWeight: cnsSeparationWeight // 3.0 // エージェント マネージャーがこのエージェントとの衝突を回避する際の積極性。[制限: >= 0]
            };
            let addAgent = function() {
                var width = 3; // 0.50;
                var agentMesh = BABYLON.MeshBuilder.CreateSphere("enemy", { diameterX: width/4, diameterY: width/10, diameterZ: width, segments: 8 }, scene);
                agentMesh.material = new BABYLON.StandardMaterial('mat2', scene);
                {
                    let itype = Math.floor(Math.random()*2)+1;
                    if (agentMeshList.length < 3) {
                        itype = 3 + agentMeshList.length;
                    }
                    let charPath = charPathList[itype];
                    var mx = 3, my = 4;
	            const matLR = new BABYLON.StandardMaterial("");
	            matLR.diffuseTexture = new BABYLON.Texture(charPath);
	            matLR.diffuseTexture.hasAlpha = true;
	            matLR.emissiveColor = new BABYLON.Color3.White();
	            const uvL = new BABYLON.Vector4(0, 2/my, 1/mx, 3/my); // L
                    const uvR = new BABYLON.Vector4(1/mx, 1/my, 0, 2/my); // R
                    const planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvR, backUVs: uvL, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                    planeLR.position.y = 1.2;
                    planeLR.material = matLR;
                    planeLR.rotation = new BABYLON.Vector3(0, R90, 0);
                    planeLR.parent = agentMesh;
                }
                var transform = new BABYLON.TransformNode();
                agentMesh.parent = transform;
                if (agentMeshList.length == 0) {
                    agentMesh.material.diffuseColor = BABYLON.Color3.Red();
                    agentParams.maxAcceleration = 6.0; agentParams.maxSpeed = 17.5;
                } else if (agentMeshList.length == 1) {
                    agentMesh.material.diffuseColor = BABYLON.Color3.Green();
                    agentParams.maxAcceleration = 6.5; agentParams.maxSpeed = 16.5;
                } else if (agentMeshList.length == 2) {
                    agentMesh.material.diffuseColor = BABYLON.Color3.Blue();
                    agentParams.maxAcceleration = 7.0; agentParams.maxSpeed = 16.0;
                } else {
                    agentMesh.material.diffuseColor = BABYLON.Color3.Random();
                    agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(6.0,7.0);
                    agentParams.maxSpeed = BABYLON.Scalar.RandomRange(10.0, 15.5);
                }
                agentParams.maxAcceleration *= cnsAccelX;
                agentParams.maxSpeed *= cnsSpeedX;

                // ルート指定 -1:pQのみ  0>=:xzRoutesから一本選択
                agentMesh.route = -1;

                let randomPos = pQ[0].clone()
                var agentIndex = crowd.addAgent(randomPos, agentParams, transform);
                agentMeshList.push(agentMesh);
                return agentIndex;
            }

            let resetAgent = function(agID) {
                // スタート地点にテレポート
                let agentMesh = agentMeshList[agID];
                if (agentMesh.route < 0) {
                    // 初期位置：スタート地点付近にテレポート
                    let p = pQ[0].clone();
                    crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(p));
                    // 目標位置：次の目標地点に
                    p = pQ[1].clone();
                    crowd.agentGoto(agID, navigationPlugin.getClosestPoint(p));
                }
            }

            let clearCNS = function() {
                if (crowd != null) { crowd.dispose(); }
                if (navmeshdebug != null) { navmeshdebug.dispose(); }
                if (navigationPlugin != null) { navigationPlugin.dispose(); }
                while (agentMeshList.length > 0) { agentMeshList.pop().dispose(); };
            }

            let resetAllAgent = function(meshes, scene) {
                clearCNS();

                navigationPlugin = new BABYLON.RecastJSPlugin();
                navigationPlugin.createNavMesh(meshes, navmeshParameters);
                if (metaStageInfo.debugMesh) {
                    // デバッグ用のメッシュ
                    navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
                    navmeshdebug.position = new BABYLON.Vector3(0, 0.01, 0);

                    navmeshdebug.material = new BABYLON.StandardMaterial('matdebug', scene);;
                    // アスファルトっぽく黒く
                    navmeshdebug.material.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);

                    meshAggInfo.push([navmeshdebug,null]);
                }
                // crowd
                crowd = navigationPlugin.createCrowd(maxAgents, 0.1, scene);
                crowd._ag2dest = [];
                agentMeshList = [];
                for (let i = 0; i < iniAgents; ++i) {
                    let adID = addAgent();
                    resetAgent(adID);
                    crowd._ag2dest.push(1); // 目的地Q1を設定
                }

                crowd.onReachTargetObservable.add((agentInfos) => {
                    let agID = agentInfos.agentIndex;
                    let agentMesh = agentMeshList[agID];
                    if (agentMesh.route < 0) {
                        let dest = crowd._ag2dest[agID];
                        if (dest == pQ.length-1) {
                            dest = 0;
                        } else {
                            ++dest;
                        }
                        // 次の目的地を設定
                        crowd._ag2dest[agID] = dest;
                        let p = pQ[dest].clone();
                        crowd.agentGoto(agID, navigationPlugin.getClosestPoint(p));
                    }
                });

            }

            // エージェントの移動速度から向きを変更する
            // // 参考
            // // https://scrapbox.io/babylonjs/Navigation_Mesh
            // // Shark + 海バージョン
            // https://playground.babylonjs.com/#DP2SDJ#21
            scene.onBeforeRenderObservable.add(() => {
                for (let i = 0; i < agentMeshList.length; i++) {
                    const meshAgent = agentMeshList[i];
                    {
                        // 移動方向と速度を取得
                        const vel = crowd.getAgentVelocity(i);
                        // 速度成分から角度をもとめ、方向とする
                        meshAgent.rotation.y = Math.atan2(vel.x, vel.z);
                    }
                }
            });

            if (!soloEnable) {
                resetAllAgent(meshes, scene);
            }
        }

        // ------------------------------------------------------------
        skybox = null;
        if (1) {
            // Skybox
            skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:4000.0}, scene);
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skybox.material = skyboxMaterial;
            meshAggInfo.push([skybox,null]);
        }


        // ここから引用
        // https://scrapbox.io/babylonjs/%E5%9C%B0%E7%90%83%E3%82%92%E5%9B%9E%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B
        skybox2 = null;
        if (0) {
            skybox2 = BABYLON.Mesh.CreateBox("skyBox", 2000, scene);
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
            skybox2.material = skyboxMaterial;
            meshAggInfo.push([skybox2,null]);
        }

        // ------------------------------------------------------------
        if (0) {
            let grndMesh = BABYLON.MeshBuilder.CreateGround("ground", {width:grndW, height:grndH}, scene);
            grndMesh.material = new BABYLON.GridMaterial("", scene);
            grndMesh.material.majorUnitFrequency = 100;
            grndMesh.material.minorUnitVisibility  = 0.7;
            // // 地面に摩擦係数、反射係数を設定する
            // let grndAgg = new BABYLON.PhysicsAggregate(grndMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);
            // meshAggInfo.push([grndMesh,grndAgg]);
        }

        if (1) {
            // Water
            var f = new BABYLON.Vector4(0.5,0, 1, 1); // front image = half the whole image along the width 
            var b = new BABYLON.Vector4(0,0, 0.5, 1); // back image = second half along the width 
            var waterMesh = BABYLON.MeshBuilder.CreatePlane("ground", { width:grndW, height:grndH }, scene);
            waterMesh.rotation.x = Math.PI/2;
            waterMesh.position.y=0.2;
            if (1) {
                let water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(512, 512));
                water.backFaceCulling = true;
                water.bumpTexture = new BABYLON.Texture(water_bump_path, scene);
                water.windForce = -1; // -15;
                water.waveHeight = 0.1; // 0.1;
                water.bumpHeight = 2.0;
                water.windDirection = new BABYLON.Vector2(1, 1);
                water.waterColor = new BABYLON.Color3(0, 0.1, 0.4);
                water.colorBlendFactor = 0.1;
                water.addToRenderList(skybox);
                water.backFaceCulling = true;
                water.alpha = 0.9;
                waterMesh.material = water;
            }
            meshAggInfo.push([waterMesh,null]);
        }
        // ------------------------------------------------------------
        if (bubbleEnable) {
            myMeshPS.start();
        } else {
            myMeshPS.stop();
        }

        // ------------------------------------------------------------
        resetMyPosi();
    }

    createStage(istage);

    // --------------------------------------------------

    var map ={}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    let cooltime_act = 0, cooltime_actIni = 30, vforceBase = 0.04, vforce = 0.04, bDash=3, jumpforce = 120;
    const qYR90 = BABYLON.Quaternion.FromEulerAngles(0, R90, 0);
    const qYR180 = BABYLON.Quaternion.FromEulerAngles(0, R180, 0);
    let quick=false, rightRoll = false, lefttRoll = false;
    scene.registerAfterRender(function() {
        quick=false;
        if (map["ctrl"]) {
            quick=true;
        }
        if (map["w"] || map["ArrowUp"]) {
            let quat = myMesh.rotationQuaternion;
            let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
            myMesh.physicsBody.applyImpulse(vdir.scale(1),
                                            myMesh.absolutePosition);
        }
        if ((map["a"] || map["ArrowLeft"]) && (map["d"] || map["ArrowRight"])) {
            // ロール（左／逆回転  .. 上下ひっくり返す
            // ロール（右／順回転
            let vdir = new BABYLON.Vector3(0 ,0, -vforce*2);
            if (rightRoll) {
                vdir = new BABYLON.Vector3(0 ,0, vforce*2);
            }
            vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
            myMesh.physicsBody.applyAngularImpulse(vdir);
        } else if (map["a"] || map["ArrowLeft"]) {
            // ヨー（右／順回転
            let vdir;
            if (quick) {
                vdir = new BABYLON.Vector3(0, -vforce*10, 0);
            } else {
                vdir = new BABYLON.Vector3(0, -vforce, 0);
            }
            vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
            myMesh.physicsBody.applyAngularImpulse(vdir);
            rightRoll = true; lefttRoll = false;
        } else if (map["d"] || map["ArrowRight"]) {
            // ヨー（左／逆回転
            if (quick) {
                vdir = new BABYLON.Vector3(0, vforce*10, 0);
            } else {
                vdir = new BABYLON.Vector3(0, vforce, 0);
            }
            vdir = vdir.applyRotationQuaternion(myMesh.rotationQuaternion);
            myMesh.physicsBody.applyAngularImpulse(vdir);
            rightRoll = false; lefttRoll = true;
        }
        if (map["s"] || map["ArrowDown"]) {
            // ブレーキ on
            myMesh.physicsBody.setLinearDamping(linearDampingBrake);
            map["brake_off_1st"] = true;
        } else if (map["brake_off_1st"]) {
            // ブレーキ off
            map["brake_off_1st"] = false;
            myMesh.physicsBody.setLinearDamping(linearDampingBase);
        }
        if (map[" "]) {
            let quat = myMesh.rotationQuaternion;
            let vdir = BABYLON.Vector3.Up().applyRotationQuaternion(quat).scale(jumpforce);
            myAgg.body.applyForce(vdir, myMesh.absolutePosition);
        }
        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["i"]) {
                cooltime_act = cooltime_actIni;
                console.log("\n-- agentMeshList info----------");
                let i = -1;
                for (let agentMesh of agentMeshList) {
                    ++i;
                    console.log("["+i+"]=", agentMesh.position.x, agentMesh.position.z);
                }
            }
            if (map["r"]) {
                cooltime_act = cooltime_actIni;
                // 自機の前後の向きを１８０度回転させる
                myMesh.rotationQuaternion.multiplyInPlace(qYR180);
            } else if (map["n"]) {
                cooltime_act = cooltime_actIni;
                // 次のステージへ
                istage = (istage+1) % nstage;
                createStage(istage);
                resetMyPosi();
            } else if (map["p"]) {
                cooltime_act = cooltime_actIni;
                // 前のステージへ
                istage = (istage+nstage-1) % nstage;
                createStage(istage);
                resetMyPosi();
            } else if (map["h"]) {
                cooltime_act = cooltime_actIni;
                // help表示のON/OFF
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
        }
    });


    // --------------------------------------------------

    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "170px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n"
        +"(W) or (Arrow UP): Forward\n"
        +"(S) or (Arrow DOWN): Brake\n"
        +"(A/D) or (Arrow Left/Right): turn Left/Right(yaw)\n"
        +"(A+D) or (Arrow Left+Right): roll\n"
        +"(Ctrl) + (A/D) or (Arrow Left/Right): quick turn\n"
        +"(Space): jump\n"
        +"(N/P): change stage\n"
        +"R: turn 180\n"
        +"H: show/hide this message";
    text1.color = "white";
    text1.width = "260px";
    text1.fontSize = 12;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    guiLabelRect.isVisible = false;

    return scene;
}

// 立体パズル（タップアウェ○もどき）

const R90 = Math.PI/2;
const R180 = Math.PI;

// idx->posi  .. indexに対する方向ベクトル
const idir2v = [
    [ 1, 0, 0],
    [ 0, 1, 0],
    [ 0, 0, 1],
    [-1, 0, 0],
    [ 0,-1, 0],
    [ 0, 0,-1],
];

// 値のリストのシャッフル
function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
}

// 多次元配列用のシャッフル
const shuffle2 = (arr) =>
  arr.map((value) => ({ value, random: Math.random() }))
    .sort((a, b) => a.random - b.random)
    .map(({ value }) => value);

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    let camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(2, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var light1 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(100, 100, 100), scene);
    light1.intensity = 0.7;
    var light1 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-100, -100, -100), scene);
    light1.intensity = 0.7;

    let ibox = 0;
    function createArwbox(geo) {
        let x=0, y=0, z=0, adjx=0, adjy=0, adjz=0;
        let dir=1; // 0:x+, 1:y+, 2:z+, 3:x-, 4:y-, 5:z-
        if ('x' in geo) { x = geo.x; }
        if ('y' in geo) { y = geo.y; }
        if ('z' in geo) { z = geo.z; }
        if ('dir' in geo) { dir = geo.dir; }
        if ('adjx' in geo) { adjx = geo.adjx; }
        if ('adjy' in geo) { adjy = geo.adjy; }
        if ('adjz' in geo) { adjz = geo.adjz; }
        const mat = new BABYLON.StandardMaterial("mat");
        // for PG
        // mat.diffuseTexture = new BABYLON.Texture("https://raw.githubusercontent.com/fnamuoo/webgl/main/071/textures/arrow.jpg", scene);
        // for local
        mat.diffuseTexture = new BABYLON.Texture("textures/arrow.jpg");
        var columns = 6;
        var rows = 1;
        const faceUV = new Array(6);
        for (let i = 0; i < 6; i++) {
            faceUV[i] = new BABYLON.Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
        }
        const mesh = BABYLON.MeshBuilder.CreateBox("box"+ibox, {faceUV: faceUV, wrap: true});
        mesh.material = mat;
        mesh.position = new BABYLON.Vector3(x+adjx, y+adjy, z+adjz);
        if (dir == 0) { // x+
            mesh.rotation = new BABYLON.Vector3(0, 0, -R90);
        } else if (dir == 1) { //y+
            ;
        } else if (dir == 2) { //z+
            mesh.rotation = new BABYLON.Vector3(R90, 0, 0);
        }else if (dir == 3) { // x-
            mesh.rotation = new BABYLON.Vector3(0, 0, R90);
        } else if (dir == 4) { //y-
            mesh.rotation = new BABYLON.Vector3(R180, 0, 0);
        } else if (dir == 5) { //z-
            mesh.rotation = new BABYLON.Vector3(-R90, 0, 0);
        }
        mesh.metadata = [x, y, z, dir];
        ++ibox;
        return mesh;
    }

    // data 内のdefval を box(方向0-5)でランダムに埋める
    //   外側から領域を眺め、６面のうちの１面について下記を実施
    //   - 任意の点／座標から領域内に進み、「空き」の最奥の位置に「手前向き」（外側に移動できる）のboxを配置する
    //   - ある面で規定回数box配置を試みて１つでもboxを埋めることができたら、次の面方向からの配置を試みる
    //   - ある面で規定回数box配置を試みて１つもboxを埋めることができなかったときは終了
    //   ある程度スカスカでも可とする（ランダムで座標を決めているので）
    function fillBoxRnd(data,defval) {
        // ランダムに data 内の -1 を埋める
        let bfound, ntry = 20, ix, iy, iz, idir = 0, ii;
        let nx = data.length, ny = data[0].length, nz = data[0][0].length;
        let nx_ = nx-1, ny_ = ny-1, nz_ = nz-1;
        while (1) {
            idir = (idir+1)%6;
            bfound = 0;
            // x軸方向 y-z平面でランダムに位置を決め x方向で走査して空きを探す
            if ((idir%3) == 0) {
                for (let itry = 0; itry < ntry; ++itry) {
                    iy = Math.floor(Math.random()*ny);
                    iz = Math.floor(Math.random()*nz);
                    ii = -1;
                    if (idir < 3) {
                        ix = nx_;
                        while (ix >= 0 && data[ix][iy][iz] == defval) {
                            ii = ix;
                            --ix;
                        }
                        if (ii >= 0) {
                            data[ii][iy][iz] = idir;
                            bfound = 1;
                            break;
                        }
                    } else {
                        ix = 0;
                        while (ix < nx && data[ix][iy][iz] == defval) {
                            ii = ix;
                            ++ix;
                        }
                        if (ii >= 0) {
                            data[ii][iy][iz] = idir;
                            bfound = 1;
                            break;
                        }
                    }
                }
            }
            // y軸方向 z-x平面でランダムに位置を決め y方向で走査して空きを探す
            if ((idir%3) == 1) {
                for (let itry = 0; itry < ntry; ++itry) {
                    iz = Math.floor(Math.random()*nz);
                    ix = Math.floor(Math.random()*nx);
                    ii = -1;
                    if (idir < 3) {
                        iy = ny_;
                        while (iy >= 0 && data[ix][iy][iz] == defval) {ii = iy; --iy; }
                        if (ii >= 0) { data[ix][ii][iz] = idir; bfound = 1; break; }
                    } else {
                        iy = 0;
                        while (iy < ny && data[ix][iy][iz] == defval) { ii = iy; ++iy; }
                        if (ii >= 0) { data[ix][ii][iz] = idir; bfound = 1; break; }
                    }
                }
            }
            // z軸方向 x-y平面でランダムに位置を決め z方向で走査して空きを探す
            if ((idir%3) == 2) {
                for (let itry = 0; itry < ntry; ++itry) {
                    ix = Math.floor(Math.random()*nx);
                    iy = Math.floor(Math.random()*ny);
                    ii = -1;
                    if (idir < 3) {
                        iz = nz_;
                        while (iy >= 0 && data[ix][iy][iz] == defval) { ii = iz; --iz; }
                        if (ii >= 0) { data[ix][iy][ii] = idir; bfound = 1; break; }
                    } else {
                        iz = 0;
                        while (iy < ny && data[ix][iy][iz] == defval) { ii = iz; ++iz; }
                        if (ii >= 0) { data[ix][iy][ii] = idir; bfound = 1; break; }
                    }
                }
            }
            if (bfound) {
                continue;
            }
            break;
        }
        return [data, {}];
    }

    // data 内のdefval を box(方向0-5)で総当たりに埋める（深部の空きはあきらめる）
    // - 領域の表面を必ず埋めることを目的にする
    // - 領域を外からみた６面すべての面で下記を繰り返す
    //   - 面の座標を総当たりで box配置可能な座標（外側から見た最奥の位置）を探す
    //   - 各面で規定回数(ntry)繰り返し、６面すべてでbox配置を試みる
    //   - ６面すべてで１つもbox配置できなかったときは終了
    function fillBoxForce(data,defval) {
        // ランダムに data 内の -1 を埋める
        let bfound, bfound_, ntry = 1, ix, iy, iz, idir = -1, ii;
        let nx = data.length, ny = data[0].length, nz = data[0][0].length;
        let nx_ = nx-1, ny_ = ny-1, nz_ = nz-1;
        while (1) {
            bfound = 0;
            for (let idir = 0; idir < 6; ++idir) {
            // x軸方向 y-z平面でランダムに位置を決め x方向で走査して空きを探す
            if ((idir%3) == 0) {
                for (let itry = 0; itry < ntry; ++itry) {
                    bfound_ = 0;
                    for (let iy = 0; iy < ny; ++iy) {
                    for (let iz = 0; iz < nz; ++iz) {
                        ii = -1;
                        if (idir < 3) {
                            ix = nx_;
                            while (ix >= 0 && data[ix][iy][iz] == defval) {
                                ii = ix;
                                --ix;
                            }
                            if (ii >= 0) {
                                data[ii][iy][iz] = idir;
                                bfound = 1;
                                bfound_ = 1;
                                break;
                            }
                        } else {
                            ix = 0;
                            while (ix < nx && data[ix][iy][iz] == defval) {
                                ii = ix;
                                ++ix;
                            }
                            if (ii >= 0) {
                                data[ii][iy][iz] = idir;
                                bfound = 1;
                                bfound_ = 1;
                                break;
                            }
                        }
                    }
                    if (bfound_) { break; }
                    }
                }
            }
            // y軸方向 z-x平面でランダムに位置を決め y方向で走査して空きを探す
            if ((idir%3) == 1) {
                for (let itry = 0; itry < ntry; ++itry) {
                    bfound_ = 0;
                    for (let iz = 0; iz < nz; ++iz) {
                    for (let ix = 0; ix < nx; ++ix) {
                        ii = -1;
                        if (idir < 3) {
                            iy = ny_;
                            while (iy >= 0 && data[ix][iy][iz] == defval) {ii = iy; --iy; }
                            if (ii >= 0) { data[ix][ii][iz] = idir; bfound = 1; bfound_ = 1; break; }
                        } else {
                            iy = 0;
                            while (iy < ny && data[ix][iy][iz] == defval) { ii = iy; ++iy; }
                            if (ii >= 0) { data[ix][ii][iz] = idir; bfound = 1; bfound_ = 1; break; }
                        }
                    }
                    if (bfound_) { break; }
                    }
                }
            }
            // z軸方向 x-y平面でランダムに位置を決め z方向で走査して空きを探す
            if ((idir%3) == 2) {
                for (let itry = 0; itry < ntry; ++itry) {
                    for (let ix = 0; ix < nx; ++ix) {
                    for (let iy = 0; iy < ny; ++iy) {
                        ii = -1;
                        if (idir < 3) {
                            iz = nz_;
                            while (iy >= 0 && data[ix][iy][iz] == defval) { ii = iz; --iz; }
                            if (ii >= 0) { data[ix][iy][ii] = idir; bfound = 1; bfound_ = 1; break; }
                        } else {
                            iz = 0;
                            while (iy < ny && data[ix][iy][iz] == defval) { ii = iz; ++iz; }
                            if (ii >= 0) { data[ix][iy][ii] = idir; bfound = 1; bfound_ = 1; break; }
                        }
                    }
                    if (bfound_) { break; }
                    }
                }
            }
            }
            if (bfound) {
                continue;
            }
            break;
        }
        return [data, {}];
    }

    // data 内のdefval を box(方向0-5)で穴掘り法（深さ優先／一本道）で埋める
    // - 迷路作成アルゴリズムの穴掘り法のように、表面から深部に進む
    // - 最初の点は表面上の座標とする。
    //   その座標でのboxの向き（外側）とは逆向きに進んだ線分上の空き（boxの無い）の任意の座標を次のbox配置の座標とします。
    //   次に配置可能な方向（「進行方向にboxが配置」されてない方向とは逆向きの方向が「配置可能な方向」）を探します。
    //   例えば今box配置された座標が原点として、次の配置可能な方向を探す際、x軸＋方向にboxが配置されてないのであれば、
    //   x軸のマイナスの線分上に「＋向きのbox」を配置することができます。
    function fillBoxDig(data,defval) {
        let stratIdx = [], endIdx = [], idxPathAll = [];
        let bfound, ix, iy, iz, idir, ix2,iy2,iz2,idirRV, len, ix3,iy3,iz3;
        let nx = data.length, ny = data[0].length, nz = data[0][0].length, nxz = nx*nz;
        let nx_ = nx-1, ny_ = ny-1, nz_ = nz-1;
        let dbgPathList = []; // 追加した座標、方向
        // 表面の候補の座標
        let candiList = []; // [x,y,z,dir]
        {
            for (let iy = 0; iy < ny; ++iy) {
            for (let iz = 0; iz < nz; ++iz) {
                candiList.push([0,iy,iz,3]); candiList.push([nx_,iy,iz,0]);
            }
            }
            for (let iz = 0; iz < nz; ++iz) {
            for (let ix = 0; ix < nx; ++ix) {
                candiList.push([ix,0,iz,4]); candiList.push([ix,ny_,iz,1]);
            }
            }
            for (let ix = 0; ix < nx; ++ix) {
            for (let iy = 0; iy < ny; ++iy) {
                candiList.push([ix,iy,0,5]); candiList.push([ix,iy,nz_,2]);
            }
            }
        }
        candiList = shuffle2(candiList);

        // let _jloop = 0, _njloop = 3; // 二本 (for DEBUG
        while (candiList.length > 0) {
            [ix,iy,iz,idir] = candiList.pop();
            // 既に設定済みの座標ならスキップ
            if (data[ix][iy][iz] != defval) {
                continue;
            }
            // if (++_jloop >= _njloop) { break; } // (for DEBUG
            // このループでのパス、idxのリスト（banIdxList と違い移動中の座標は含まない）
            let idxPathList = [];
            data[ix][iy][iz] = idir;
            ii = ix+iz*nx+iy*nxz;
            stratIdx.push(ii);
            idxPathList.push(ii);
            let dbgPath = []; // 追加した座標、方向
            dbgPath.push([ix,iy,iz,idir]);
            // 配置禁止の場所(index)、移動経路およびパージ時の進行経路
            let banIdxList = [];
            banIdxList.push(ii);
            // let _iloop = 0, _nloop = 15;
            while (1) {
                // if (++_iloop >= _nloop) { break; }
                // 移動の向き(idir)と逆向き(idirRV)が走査する方向
                idirRV = (idir+3)%6;
                // 候補の空きを探す、移動可能な距離
                let candiLen = [];
                len=0, ix2=ix,iy2=iy,iz2=iz;
                while (1) {
                    ix2 = ix2 + idir2v[idirRV][0]; iy2 = iy2 + idir2v[idirRV][1]; iz2 = iz2 + idir2v[idirRV][2];
                    if (ix2 < 0 || ix2 >= nx || iy2 < 0 || iy2 >= ny || iz2 < 0 || iz2 >= nz || data[ix2][iy2][iz2] >= 0) {
                        break;
                    }
                    ++len;
                    ii = ix2+iz2*nx+iy2*nxz;
                    if (!banIdxList.includes(ii)) {
                        candiLen.push(len);
                    }
                }
                if (candiLen.length == 0) {
                    break;
                }
                shuffle(candiLen);
                len = candiLen[0];
                // 移動経路の追加
                for (let jj = 0; jj < len; ++jj) {
                    ix2 = ix+idir2v[idirRV][0]*jj; iy2 = iy+idir2v[idirRV][1]*jj; iz2 = iz+idir2v[idirRV][2]*jj;
                    ii = ix2+iz2*nx+iy2*nxz;
                    banIdxList.push(ii); //移動経路の追加
                }
                // boxの配置位置を移動
                ix = ix+idir2v[idirRV][0]*len; iy = iy+idir2v[idirRV][1]*len; iz = iz+idir2v[idirRV][2]*len;

                data[ix][iy][iz] = idir;
                ii = ix+iz*nx+iy*nxz
                idxPathList.push(ii);
                banIdxList.push(ii);
                dbgPath.push([ix,iy,iz,idir]);
                // 空いている隣接を探して（反対側は突き抜けて／空が連続して）いること、方向をランダムで決める
                let candiDir = [];
                for (let dir = 0; dir < 6; ++dir) {
                    ix2 = ix + idir2v[dir][0]; iy2 = iy + idir2v[dir][1]; iz2 = iz + idir2v[dir][2];
                    if (ix2 < 0 || ix2 >= nx || iy2 < 0 || iy2 >= ny || iz2 < 0 || iz2 >= nz || data[ix2][iy2][iz2] != defval) {
                        continue;
                    }
                    // 禁止区域か？
                    ii = ix2 + iz2*nx + iy2*nxz;
                    if (banIdxList.includes(ii)) {
                        continue;
                    }
                    // dirの進行上に、以前のboxがあればNG
                    let existOldPath = false;
                    len = 2;  // １つ隣は空きと確認できているので２つ目から
                    while (1) {
                        ix2 = ix+idir2v[idir][0]*len; iy2 = iy+idir2v[idir][1]*len; iz2 = iz+idir2v[idir][2]*len;
                        if (ix2 < 0 || ix2 >= nx || iy2 < 0 || iy2 >= ny || iz2 < 0 || iz2 >= nz) {
                            // 障害物(ブロック)なく、境界まで達した
                            break;
                        }
                        ii = ix2 + iz2*nx + iy2*nxz;
                        if (banIdxList.includes(ii)) {
                            ; // 今回のパスのブロック
                        } else if (data[ix2][iy2][iz2] >= 0) {
                            existOldPath = true; // 以前のboxがある
                            break;
                        }
                        ++len;
                    }
                    if (existOldPath) { // 以前のパスのboxがあった
                        continue;
                    }
                    // 反対側は（空｜今回のパスのブロック）か？／昔のブロックならNG
                    idirRV = (dir+3)%6;
                    let aperture = true;
                    len = 1;
                    while (1) {
                        [ix2,iy2,iz2] = [ix+idir2v[idirRV][0]*len, iy+idir2v[idirRV][1]*len, iz+idir2v[idirRV][2]*len];
                        if (ix2 < 0 || ix2 >= nx || iy2 < 0 || iy2 >= ny || iz2 < 0 || iz2 >= nz) {
                            // 障害物(ブロック)なく、境界まで達した
                            break;
                        }
                        ii = ix2+iz2*nx+iy2*nxz;
                        if (data[ix2][iy2][iz2] >= 0) {
                            // 障害物(ブロック)にあたった
                            aperture = false;
                            break;
                        }
                        ++len;
                    }
                    if (aperture == false) { // 突き抜けていなかった／障害物があった
                        continue;
                    }
                    candiDir.push(dir);
                }

                if (candiDir.length == 0) {
                    break;
                }
                shuffle(candiDir);
                idirRV = candiDir[0];
                idir = (idirRV+3)%6;

                // パージ時の進行経路を追加  .. data[] != defval で止めずに延長してみる
                len = 1;
                while (1) {
                    ix2 = ix+idir2v[idir][0]*len; iy2 = iy+idir2v[idir][1]*len; iz2 = iz+idir2v[idir][2]*len;
                    if (ix2 < 0 || ix2 >= nx || iy2 < 0 || iy2 >= ny || iz2 < 0 || iz2 >= nz) {
                        // 境界もしくは、障害物(ブロック)
                        break;
                    }
                    ii = ix2 + iz2*nx + iy2*nxz;
                    banIdxList.push(ii); //移動経路の追加
                    ++len;
                }
            }
            endIdx.push(ix+iz*nx+iy*nxz)
            dbgPathList.push(dbgPath);
            idxPathAll.push(idxPathList);
        }
        return [data, {'startIdx':stratIdx, 'endIdx':endIdx, 'idxPathAll':idxPathAll}];
    }

    let istage = 0, nstage = 3, stageLevel = 1;
    function createState(istage) {
        let data, ropt = {};
        let nx = 1, ny = 1, nz = 1, defval= -1, nxz = 0;
        if (istage == -1) {
            // debug
            nx = 2, ny = 2, nz = 1;
            data = Array.from(new Array(nx), () => {
                return Array.from(new Array(ny), () => new Array(nz).fill(defval));
            });
            data[0][0][0] = 1; // 1:=Ｙ軸＋方向
            data[1][0][0] = 1;
            data[0][1][0] = 1;
            data[1][1][0] = 1;

        } else if (istage == -1) {
            // ランダム(解けないときがある)
            nx = 3, ny = 3, nz = 3, defval= -1;
            data = Array.from(new Array(nx), () => {
                return Array.from(new Array(ny), () => new Array(nz).fill(defval));
            });
            for (let iy = 0; iy < ny; ++iy) {
            for (let iz = 0; iz < nz; ++iz) {
            for (let ix = 0; ix < nx; ++ix) {
                let dir = Math.floor(Math.random()*6);
                data[ix][iy][iz] = dir;
            }
            }
            }

        } else if (istage == -1) {
            // debug
            nx = 2, ny = 3, nz = 4, defval= -1;
            data = Array.from(new Array(nx), () => {
                return Array.from(new Array(ny), () => new Array(nz).fill(defval));
            });
            data[0][0][0] = 0;
            data[1][0][0] = 1;
            data[0][2][0] = 2;
            data[0][0][3] = 3;

        } else if (istage == 0) {
            // 初級
            nx = stageLevel+2, ny = stageLevel+1, nz = stageLevel;
            data = Array.from(new Array(nx), () => {
                return Array.from(new Array(ny), () => new Array(nz).fill(defval));
            });
            // 一旦ランダムで粗く埋めて
            [data,ropt] = fillBoxRnd(data,defval);
            // 改めて表層を埋める
            [data,ropt] = fillBoxForce(data,defval);

        } else if (istage == 1) {
            // 初級＋
            // nx = stageLevel+7, ny = stageLevel+6, nz = stageLevel+5;
            nx = stageLevel+4, ny = stageLevel+2, nz = stageLevel+1;
            data = Array.from(new Array(nx), () => {
                return Array.from(new Array(ny), () => new Array(nz).fill(defval));
            });
            // 一旦ランダムで粗く埋めて
            [data,ropt] = fillBoxRnd(data,defval);
            // 改めて表層を埋める
            [data,ropt] = fillBoxForce(data,defval);

        } else if (istage == 2) {
            // 中級
            nx = stageLevel+2, ny = stageLevel+2, nz = stageLevel+2;
            data = Array.from(new Array(nx), () => {
                return Array.from(new Array(ny), () => new Array(nz).fill(defval));
            });
            // 穴掘り法
            [data, ropt] = fillBoxDig(data,defval);
        }

        nxz = nx*nz;
        let startIdx = ('startIdx' in ropt) ? ropt['startIdx'] : [];
        let endIdx = ('endIdx' in ropt) ? ropt['endIdx'] : [];
        let idxPathAll = ('idxPathAll' in ropt) ? ropt['idxPathAll'] : [];

        // data に応じてメッシュを作成する
        adjx=-Math.floor(nx/2), adjy=-Math.floor(ny/2), adjz=-Math.floor(nz/2);
        for (let iy = 0; iy < ny; ++iy) {
            for (let iz = 0; iz < nz; ++iz) {
                for (let ix = 0; ix < nx; ++ix) {
                    if (data[ix][iy][iz] >= 0) {
                        dir = data[ix][iy][iz];
                        mesh = createArwbox({x:ix, y:iy, z:iz, dir:dir, adjx:adjx, adjy:adjy, adjz:adjz});

                        // デバッグ表示
                        if (0) {
                        // １本の経路でスタートゴールを色分け
                        ii = ix+iz*nx+iy*nxz;
                        if (startIdx.includes(ii)) {
                            mesh.material.emissiveColor = BABYLON.Color3.Red();
                            mesh.material.alpha = 0.4;
                        }
                        if (endIdx.includes(ii)) {
                            mesh.material.emissiveColor = BABYLON.Color3.Blue();
                            mesh.material.alpha = 0.4;
                        }
                        }

                        // デバッグ表示
                        if (0) {
                        if (idxPathAll.length >= 2) {
                        // ２本の経路でそれぞれ色分け
                        ii = ix+iz*nx+iy*nxz;
                        if (idxPathAll[0].includes(ii)) {
                            mesh.material.emissiveColor = BABYLON.Color3.Red();
                            mesh.material.alpha = 0.4;
                        } else if (idxPathAll[1].includes(ii)) {
                            mesh.material.emissiveColor = BABYLON.Color3.Blue();
                            mesh.material.alpha = 0.4;
                        }
                        }
                        }
                    }
                }
            }
        }
        ++stageLevel;
        return data;
    }

    // パズルを解く
    function solve(dataOrg) {
        let data = JSON.parse(JSON.stringify(dataOrg));
        let nx = data.length, ny = data[0].length, nz = data[0][0].length;
        let nx_ = nx-1, ny_ = ny-1, nz_ = nz-1;
        let iloop = 0, nloop = 3, dir, dirRV;
        let rest = 0, count = 0;
        {
            for (let iy = 0; iy < ny; ++iy) {
            for (let iz = 0; iz < nz; ++iz) {
            for (let ix = 0; ix < nx; ++ix) {
                rest += (data[ix][iy][iz] >= 0) ? 1 : 0;
            }
            }
            }
        }
        while (iloop < nloop) {
            ++iloop;


            let bChanged = false;

            {
                dir=0, dirRV=3;
                for (let iy = 0; iy < ny; ++iy) {
                for (let iz = 0; iz < nz; ++iz) {
                    // x= -方向から +方向を見て、dirRVと等しい値を-1にする
                    for (let ix = 0; ix < nx; ++ix) {
                        if (data[ix][iy][iz] < 0) {
                            continue;
                        }
                        if (data[ix][iy][iz] == dirRV) {
                            data[ix][iy][iz] = -1;
                            ++count;
                            bChanged = true;
                        } else {
                            break;
                        }
                    }
                    // x= +方向から -方向を見て、dirRVと等しい値を-1にする
                    for (let ix = nx_; ix >= 0; --ix) {
                        if (data[ix][iy][iz] < 0) {
                            continue;
                        }
                        if (data[ix][iy][iz] == dir) {
                            data[ix][iy][iz] = -1;
                            ++count;
                            bChanged = true;
                        } else {
                            break;
                        }
                    }
                }
                }
            }

            {
                dir=1, dirRV=4;
                for (let iz = 0; iz < nz; ++iz) {
                for (let ix = 0; ix < nx; ++ix) {
                    // y= -方向から +方向を見て、dirRVと等しい値を-1にする
                    for (let iy = 0; iy < ny; ++iy) {
                        if (data[ix][iy][iz] < 0) {
                            continue;
                        }
                        if (data[ix][iy][iz] == dirRV) {
                            data[ix][iy][iz] = -1;
                            ++count;
                            bChanged = true;
                        } else {
                            break;
                        }
                    }
                    // y= +方向から -方向を見て、dirRVと等しい値を-1にする
                    for (let iy = ny_; iy >= 0; --iy) {
                        if (data[ix][iy][iz] < 0) {
                            continue;
                        }
                        if (data[ix][iy][iz] == dir) {
                            data[ix][iy][iz] = -1;
                            ++count;
                            bChanged = true;
                        } else {
                            break;
                        }
                    }
                }
                }
            }

            {
                dir=2, dirRV=5;
                for (let ix = 0; ix < nx; ++ix) {
                for (let iy = 0; iy < ny; ++iy) {
                    // z= -方向から +方向を見て、dirRVと等しい値を-1にする
                    for (let iz = 0; iz < nz; ++iz) {
                        if (data[ix][iy][iz] < 0) {
                            continue;
                        }
                        if (data[ix][iy][iz] == dirRV) {
                            data[ix][iy][iz] = -1;
                            ++count;
                            bChanged = true;
                        } else {
                            break;
                        }
                    }
                    // z= +方向から -方向を見て、dirRVと等しい値を-1にする
                    for (let iz = nz_; iz >= 0; --iz) {
                        if (data[ix][iy][iz] < 0) {
                            continue;
                        }
                        if (data[ix][iy][iz] == dir) {
                            data[ix][iy][iz] = -1;
                            ++count;
                            bChanged = true;
                        } else {
                            break;
                        }
                    }
                }
                }
            }

            if (bChanged) {
                iloop = 0;
            }
        }
        console.log("solved/rest=",[count,rest],Math.floor(1000*count/rest)/10,"%");
        return (count == rest);
    }

    let data, nx, ny, nz, nx_, ny_, nz_, rest;
    let adjx=0, adjy=0, adjz=0;
    function resetStage() {
        data = createState(istage);
        nx = data.length, ny = data[0].length, nz = data[0][0].length;
        nx_ = nx-1, ny_ = ny-1, nz_ = nz-1;
        countReset();

        solve(data);
    }

    function countReset() {
        nx = data.length, ny = data[0].length, nz = data[0][0].length;
        nx_ = nx-1, ny_ = ny-1, nz_ = nz-1;
        rest = 0;
        for (let iy = 0; iy < ny; ++iy) {
        for (let iz = 0; iz < nz; ++iz) {
        for (let ix = 0; ix < nx; ++ix) {
            rest += (data[ix][iy][iz] >= 0) ? 1 : 0;
        }
        }
        }
    }

    resetStage();

    let delMeshList = []; // 削除対象のメッシュ

    scene.onPointerDown = function castRay(){
        var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera, false);
        var hit = scene.pickWithRay(ray);
        if (hit.pickedMesh != null) {

            const [ix,iy,iz,idir] = hit.pickedMesh.metadata;
            {
                let ix2=ix,iy2=iy,iz2=iz;
                while (1) {
                    ix2 = ix2 + idir2v[idir][0];
                    iy2 = iy2 + idir2v[idir][1];
                    iz2 = iz2 + idir2v[idir][2];
                    if (ix2 < 0 || ix2 >= nx || iy2 < 0 || iy2 >= ny || iz2 < 0 || iz2 >= nz) {
                        break;
                    }
                }
            }
            let purge = true; // 該当blockをパージできるか？（進行方向にブロックが無い？）
            if (idir == 0) {
                if (ix < nx_) {
                    for (let ii = nx_; ii > ix; --ii) {
                        if (data[ii][iy][iz] >= 0) {
                            purge = false;
                        }
                    }
                }
            } else if (idir == 1) {
                if (iy < ny_) {
                    for (let ii = ny_; ii > iy; --ii) {
                        if (data[ix][ii][iz] >= 0) {
                            purge = false;
                        }
                    }
                }
            } else if (idir == 2) {
                if (iz < nz_) {
                    for (let ii = nz_; ii > iz; --ii) {
                        if (data[ix][iy][ii] >= 0) {
                            purge = false;
                        }
                    }
                }
            } else if (idir == 3) {
                if (ix > 0) {
                    for (let ii = 0; ii < ix; ++ii) {
                        if (data[ii][iy][iz] >= 0) { purge = false; } }
                }
            } else if (idir == 4) {
                if (iy > 0) {
                    for (let ii = 0; ii < iy; ++ii) {
                        if (data[ix][ii][iz] >= 0) { purge = false; } }
                }
            } else if (idir == 5) {
                if (iz > 0) {
                    for (let ii = 0; ii < iz; ++ii) {
                        if (data[ix][iy][ii] >= 0) { purge = false; } }
                }
            }
            // パージ済み（アニメーション中）で表示が残っているものをクリックした場合
            if (data[ix][iy][iz] < 0) {
                if (!delMeshList.includes(hit.pickedMesh)) {
                    delMeshList.push(hit.pickedMesh);
                }
                return;
            }

            let mesh = hit.pickedMesh;
            let nframe = 0, nlen = 0, nn;
            let vSlide, keyFrames = [];
            if (purge) {
                // パージ可能 : 該当ブロックを進行方向に進め／アニメーションして消す
                nframe = 10, nlen = 10, nn = (idir<3) ? nlen : -nlen;

                // パージしたメッシュをdisposeする関数とそのための変数
                const funcDispose = function () {
                    while (delMeshList.length > 0) {
                        let mesh = delMeshList.pop();
                        mesh.dispose();
                    }
                }

                if ((idir%3) == 0) {
                    const pv = mesh.position.x;
                    vSlide = new BABYLON.Animation("xSlide", "position.x", nframe, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    keyFrames.push({ frame: 0, value: pv });
                    keyFrames.push({ frame: nframe, value: pv+nn });
                } else if ((idir%3) == 1) {
                    const pv = mesh.position.y;
                    vSlide = new BABYLON.Animation("ySlide", "position.y", nframe, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    keyFrames.push({ frame: 0, value: pv });
                    keyFrames.push({ frame: nframe, value: pv+nn });
                } else if ((idir%3) == 2) {
                    const pv = mesh.position.z;
                    vSlide = new BABYLON.Animation("zSlide", "position.z", nframe, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    keyFrames.push({ frame: 0, value: pv });
                    keyFrames.push({ frame: nframe, value: pv+nn });
                }
                vSlide.setKeys(keyFrames);
                scene.beginDirectAnimation(mesh, [vSlide], 0, nframe, false, 1, funcDispose);
                delMeshList.push(mesh);

                data[ix][iy][iz] = -1;
                --rest;
                // console.log("パージ可能: rest=", rest);
                if (rest == 0) {
                    console.log("stage clear!!");
                    istage = (istage+1)%nstage;
                    resetStage();
                }

            } else {
                // パージ不可 : 該当ブロックを進行方向に進め、元の位置に戻す
                let ix2=ix,iy2=iy,iz2=iz;
                while (1) {
                    ix2 = ix2 + idir2v[idir][0];
                    iy2 = iy2 + idir2v[idir][1];
                    iz2 = iz2 + idir2v[idir][2];
                    if (ix2 < 0 || ix2 >= nx || iy2 < 0 || iy2 >= ny || iz2 < 0 || iz2 >= nz || data[ix2][iy2][iz2] >= 0) {
                        break;
                    }
                    ++nlen;
                }
                if (nlen == 0) {
                    return;
                }
                let nframe1 = nlen, nframe2 = nlen*2;
                nn = (idir<3) ? nlen : -nlen;

                if ((idir%3) == 0) {
                    const pv = ix+adjx;
                    vSlide = new BABYLON.Animation("xSlide", "position.x", nframe2, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    keyFrames.push({ frame: 0, value: pv });
                    keyFrames.push({ frame: nframe1, value: pv+nn });
                    keyFrames.push({ frame: nframe2, value: pv });
                } else if ((idir%3) == 1) {
                    const pv = iy+adjy;
                    vSlide = new BABYLON.Animation("ySlide", "position.y", nframe2, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    keyFrames.push({ frame: 0, value: pv });
                    keyFrames.push({ frame: nframe1, value: pv+nn });
                    keyFrames.push({ frame: nframe2, value: pv });
                } else if ((idir%3) == 2) {
                    const pv = iz+adjz; // mesh.position.z;
                    vSlide = new BABYLON.Animation("zSlide", "position.z", nframe2, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    keyFrames.push({ frame: 0, value: pv });
                    keyFrames.push({ frame: nframe1, value: pv+nn });
                    keyFrames.push({ frame: nframe2, value: pv });
                }
                vSlide.setKeys(keyFrames);
                scene.beginDirectAnimation(mesh, [vSlide], 0, nframe2, false, 1);
            }
        }
    }
    
    return scene;
};

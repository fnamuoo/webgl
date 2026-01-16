// Babylon.js：サイズの限界をセルオートマトン（ライフゲーム）／CPU版で検証する
//

// 描画方法
// let istage = 1100; //Mesh版(box)
// let istage = 1101; //Mesh版(plane)
// let istage = 1200; //clone
// let istage = 1300; //instance
// let istage = 1301; //instance
let istage = 1400; //thinInstance

// let istage = 2100  //SolidParticleSystem
// let istage = 2200; //PointsCloudSystem

// let istage = 3100; //dynamicTexture(Panel)  (軽量だけど、サイズと解像度があっていないと境界がぼける)
// let istage = 3200; //dynamicTexture(Layer) （〃）

// ----------------------------------------
// スケールサイズ
// let nx=20, ny=20, scale=1;
let nx=50, ny=50, scale=0.4;
// let nx=100, ny=100, scale=0.2;
// let nx=200, ny=200, scale=0.1;
// let nx=400, ny=400, scale=0.05;
// let nx=1000, ny=1000, scale=0.02;
// let nx=2000, ny=2000, scale=0.01;
// let nx=10000, ny=10000, scale=0.002;

/*
 * | N           | Nx,Ny       | Mesh  | clone | inst  | Thin  | SPS   | PCS   | DT(Panel) | DT(Layer)
 * |------------:|:-----------:|-------|-------|-------|-------|-------|-------|-----------|-------
 * |         400 |       20x20 |  ◎   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎
 * |       2,500 |       50x50 |  ◎   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎
 * |      10,000 |     100x100 |  ○   |  ○   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎
 * |      40,000 |     200x200 |  △   |  △   |  ○   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎
 * |     160,000 |     400x400 |  ×   |  △   |  △   |  ◎   |  △   |  ◎   |  ◎   |  ◎
 * |   1,000,000 |   1000x1000 |  ×   |  ×   |  ×   |  ◎   |  ×   |  △   |  ◎   |  ◎
 * |   4,000,000 |   2000x2000 |  ×   |  ×   |  ×   |  △   |  ×   |  △   |  △   |  △
 * | 100,000,000 | 10000x10000 |  ×   |  ×   |  ×   |  ×   |  ×   |  ×   |  ×   |  ×
 *
 * （凡例：◎：快適、○：やや遅延、△：動作が重い、×：動作しない）
 */


// https://ja.wikipedia.org/wiki/%E3%83%A9%E3%82%A4%E3%83%95%E3%82%B2%E3%83%BC%E3%83%A0
//
// 誕生: 死んでいるセルに隣接する生きたセルがちょうど3つあれば、次の世代が誕生する。
// 生存: 生きているセルに隣接する生きたセルが2つか3つならば、次の世代でも生存する。
// 過疎: 生きているセルに隣接する生きたセルが1つ以下ならば、過疎により死滅する。
// 過密: 生きているセルに隣接する生きたセルが4つ以上ならば、過密により死滅する。

// https://qiita.com/keisukee/items/19e693f351b668756260#%E3%83%A9%E3%82%A4%E3%83%95%E3%82%B2%E3%83%BC%E3%83%A0%E3%81%A8%E3%81%AF

// ======================================================================

let fpath = "textures/blackWhite.png";
// let fpath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/120/textures/blackWhite.png";

const R90 = Math.PI/2;
const R180 = Math.PI;


export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);

    let camera = null, myMesh=null;
    let icamera = 0;
    let icameralist = [0];
    var changeCamera = function(icamera) {
console.log("icamera=",icamera)
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            // camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 0,-15), scene);
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 0,-25), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる

            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;

        }
    }

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, -1), scene);
    light.intensity = 0.7;


    // ----------------------------------------
    let n=nx*ny, nx_ = nx-1, ny_=ny-1;

    let meshInfo = [];
    let dataMtrx = Array.from({ length: ny }, () => Array(nx).fill(0));
    let dataMtrxNxt = Array.from({ length: ny }, () => Array(nx).fill(0));

    // ------------------------------
    // stage1 用データ
    let meshMtrx = [];
    // 死を示す
    let mat0 = new BABYLON.StandardMaterial("m0", scene);
    mat0.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat0.emissiveColor = new BABYLON.Color3(1, 1, 1);
    // 生を示す
    let mat1 = new BABYLON.StandardMaterial("m1", scene);
    mat1.diffuseColor = new BABYLON.Color3(0, 0, 0);
    mat1.emissiveColor = new BABYLON.Color3(0, 0, 0);
    let matList = [mat0, mat1];

    // ------------------------------

    // stage1300 用データ
    let meshMtrx0 = []; //v=0:white
    let meshMtrx1 = []; //v=1:black

    // stage1400 用データ
    let colorData = null;

    // stage2100 用データ
    let sps = null;
    let clist = [new BABYLON.Color3(1, 1, 1), new BABYLON.Color3(0, 0, 0)];

    // // stage2200 用データ
    let pcs = null;

    // stage3100 用データ
    let img = null;

    let mesh = null;

    let createStage = function(istage) {
console.log("createStage istage=", istage, nx, n);
        for (let mesh of meshInfo) {
            mesh.dispose();
        }
        meshInfo = [];
        colorData = null;
        img = null;
        
        if (istage == 0) {
	    let uvF = new BABYLON.Vector4(0, 0, 0.5, 1); // B
            let uvB = new BABYLON.Vector4(0.5, 0, 1, 1); // F
            let mesh = BABYLON.MeshBuilder.CreatePlane("", {size:1, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh.material = new BABYLON.StandardMaterial("mat", scene);
            mesh.material.diffuseTexture = new BABYLON.Texture(fpath, scene);
            mesh.material.emissiveColor = BABYLON.Color3.White();
            meshInfo.push(mesh);

        } else if (istage == 1100) {
            let adjx=-(nx-1)/2, adjy=(ny-1)/2;
            // meshMtrxを [ix][iy] で参照したいために x のループを外側、y のループを内側に
            meshMtrx = [];
            for (let ix = 0; ix < nx; ++ix) {
                let tmeshlist = [];
                for (let iy = 0; iy < ny; ++iy) {
                    let mesh = BABYLON.MeshBuilder.CreateBox("target", { size:scale }, scene);
                    mesh.position.set((ix+adjx)*scale,(-iy+adjy)*scale,0);
                    mesh.material = mat0;
                    meshInfo.push(mesh);
                    tmeshlist.push(mesh);
                }
                meshMtrx.push(tmeshlist);
            }

        } else if (istage == 1101) {
            let adjx=-(nx-1)/2, adjy=(ny-1)/2;
            // meshMtrxを [ix][iy] で参照したいために x のループを外側、y のループを内側に
            meshMtrx = [];
            for (let ix = 0; ix < nx; ++ix) {
                let tmeshlist = [];
                for (let iy = 0; iy < ny; ++iy) {
                    let mesh = BABYLON.MeshBuilder.CreatePlane("target", { size:scale }, scene);
                    mesh.position.set((ix+adjx)*scale,(-iy+adjy)*scale,0);
                    mesh.material = mat0;
                    meshInfo.push(mesh);
                    tmeshlist.push(mesh);
                }
                meshMtrx.push(tmeshlist);
            }

        } else if (istage == 1200) {
            let adjx=-(nx-1)/2, adjy=(ny-1)/2;
            meshMtrx = [];
            const mesh0 = BABYLON.MeshBuilder.CreateBox("target", { size:scale }, scene);
            for (let ix = 0; ix < nx; ++ix) {
                let tmeshlist = [];
                for (let iy = 0; iy < ny; ++iy) {
                    let mesh = mesh0.clone();
                    mesh.position.set((ix+adjx)*scale,(-iy+adjy)*scale,0);
                    mesh.material = mat0;
                    meshInfo.push(mesh);
                    tmeshlist.push(mesh);
                }
                meshMtrx.push(tmeshlist);
            }

        } else if (istage == 1300) {
            let adjx=-(nx-1)/2, adjy=(ny-1)/2;
            meshMtrx0 = []; //v=0:white
            meshMtrx1 = []; //v=1:black
            const mesh0 = BABYLON.MeshBuilder.CreateBox("target", { size:scale }, scene);
            mesh0.material = new BABYLON.StandardMaterial("", scene);
            mesh0.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
            mesh0.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
            mesh0.position.z = 0.5;
            const mesh1 = BABYLON.MeshBuilder.CreateBox("target", { size:scale }, scene);
            mesh1.material = new BABYLON.StandardMaterial("", scene);
            mesh1.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mesh1.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
            mesh1.position.z = 0.5;
            let mesh;
            for (let ix = 0; ix < nx; ++ix) {
                let tmeshlist0 = [], tmeshlist1 = [];
                for (let iy = 0; iy < ny; ++iy) {
                    mesh = mesh0.createInstance("c0_"+ix+","+iy);
                    mesh.skeleton = null;
                    mesh.position.set((ix+adjx)*scale,(-iy+adjy)*scale,0);
                    meshInfo.push(mesh);
                    tmeshlist0.push(mesh);
                    mesh = mesh1.createInstance("c1_"+ix+","+iy);
                    mesh.skeleton = null;
                    mesh.position.set((ix+adjx)*scale,(-iy+adjy)*scale,1);
                    meshInfo.push(mesh);
                    tmeshlist1.push(mesh);
                }
                meshMtrx0.push(tmeshlist0);
                meshMtrx1.push(tmeshlist1);
            }

        } else if (istage == 1301) {
            let adjx=-(nx-1)/2, adjy=(ny-1)/2;
            meshMtrx = [];
	    let uvB = new BABYLON.Vector4(0.2, 0, 0.3, 1); // モアレ縞がでるのでマージン多めに切り取る
            let uvF = new BABYLON.Vector4(0.7, 0, 0.8, 1);
            const mesh_ = BABYLON.MeshBuilder.CreatePlane("", {size:scale, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
            mesh_.material = new BABYLON.StandardMaterial("mat", scene);
            mesh_.material.diffuseTexture = new BABYLON.Texture(fpath, scene);
            mesh_.material.emissiveColor = BABYLON.Color3.White();
            // mesh_.position.z = 0.5;
            mesh_.position.z = -1;
            let mesh;
            for (let ix = 0; ix < nx; ++ix) {
                let tmeshlist = [];
                for (let iy = 0; iy < ny; ++iy) {
                    mesh = mesh_.createInstance("c0_"+ix+","+iy);
                    mesh.skeleton = null;
                    mesh.position.set((ix+adjx)*scale,(-iy+adjy)*scale,0);
                    meshInfo.push(mesh);
                    tmeshlist.push(mesh);
                }
                meshMtrx.push(tmeshlist);
            }

        } else if (istage == 1400) {
            let adjx=-(nx-1)/2, adjy=(ny-1)/2;
            // 事前に、複製先の 座標バッファ posiData、色バッファ colorData を作成する
            let posiData = new Float32Array(16 * n);
            colorData = new Float32Array(4 * n);
            let m = BABYLON.Matrix.Identity();
            m.m[14] = 0; //z=0
            let index = 0;
            for (let ix = 0; ix < nx; ++ix) {
                m.m[12] = (ix+adjx)*scale;
                for (let iy = 0; iy < ny; ++iy) {
                    m.m[13] = (-iy+adjy)*scale;
                    m.copyToArray(posiData, index * 16);
                    colorData[index * 4] = 1.0;
                    colorData[index * 4 + 1] = 1.0;
                    colorData[index * 4 + 2] = 1.0;
                    colorData[index * 4 + 3] = 1.0;
                    ++index;
                }
            }
            // thinInstance で複製を作成する
            mesh = BABYLON.MeshBuilder.CreateBox("target", { size:scale }, scene);
            mesh.thinInstanceSetBuffer("matrix", posiData, 16);
            mesh.thinInstanceSetBuffer("color", colorData, 4, false); // colorDataでupdateするため４番目staticをfalseに
            mesh.material = new BABYLON.StandardMaterial("material");
            mesh.material.disableLighting = true;
            mesh.material.emissiveColor = BABYLON.Color3.White();
            meshInfo.push(mesh);

        } else if (istage == 2100) {
            sps = new BABYLON.SolidParticleSystem('SPS', scene);
            {
                let mesh = BABYLON.MeshBuilder.CreateBox("b", { size:scale }, scene);
                sps.addShape(mesh, n);
                mesh.dispose();
            }
            let mesh = sps.buildMesh();
            mesh.material = new BABYLON.StandardMaterial();
            mesh.material.emissiveColor = BABYLON.Color3.White();
            sps.isAlwaysVisible = true;
            sps.initParticles = function() {
                let adjx=-(nx-1)/2, adjy=(ny-1)/2;
                let index = 0, x, y, pA;
                for (let ix = 0; ix < nx; ++ix) {
                    x = (ix+adjx)*scale;
                    for (let iy = 0; iy < ny; ++iy) {
                        y = (-iy+adjy)*scale;
                        pA = sps.particles[index];
                        pA.position.set(x, y, 0);
                        pA.color = clist[0];
                        ++index;
                    }
                }
            }
            sps.initParticles();
            sps.mesh.freezeWorldMatrix();
            sps.mesh.freezeNormals();
            meshInfo.push(sps);

        } else if (istage == 2200) {
            pcs = new BABYLON.PointsCloudSystem('pcs', scale*30, scene);
            let adjx=-(nx-1)/2, adjy=(ny-1)/2, ix, iy, x, y;
            let inifunc = function (particle, i, s) {
                ix = i % nx;
                iy = Math.floor(i/nx);
                x = (ix+adjx)*scale;
                y = (-iy+adjy)*scale;
                particle.position = new BABYLON.Vector3(x, y, 0);
                particle.color = clist[0];
            };
            pcs.addPoints(n, inifunc);

            let mesh = pcs.buildMeshAsync();
            mesh.material = new BABYLON.StandardMaterial();
            mesh.material.emissiveColor = BABYLON.Color3.White();
            meshInfo.push(pcs);

        } else if (istage == 3100) {
            img = new ImageData(nx, ny);
            let index = 0;
            for (let i = 0; i < n; ++i) {
                img.data[index] = 255;
                img.data[index+1] = 255;
                img.data[index+2] = 255;
                img.data[index+3] = 255; // alpha
                index += 4;
            }
            let sw=nx*scale, sh=ny*scale;
            mesh = BABYLON.MeshBuilder.CreatePlane("target", {width:sw, height:sh}, scene);
            let dytxt = new BABYLON.DynamicTexture('dt', {width:nx, height:ny}, scene)
            let ctx = dytxt.getContext();
            ctx.putImageData(img, 0, 0);
            dytxt.update( false );
            let mat = new BABYLON.StandardMaterial();
            mat.diffuseTexture = dytxt;
            mat.emissiveColor = BABYLON.Color3.White();
            mesh.material = mat;
            mesh._dytxt = dytxt;
            mesh._ctx = ctx;
            meshInfo.push(mesh);

        } else if (istage == 3200) {
            img = new ImageData(nx, ny);
            let index = 0;
            for (let i = 0; i < n; ++i) {
                img.data[index] = 255;
                img.data[index+1] = 255;
                img.data[index+2] = 255;
                img.data[index+3] = 255; // alpha
                index += 4;
            }
            let sw=nx*scale, sh=ny*scale;
            mesh = new BABYLON.Layer("target", "", scene, true);
            // // こちらだとウィンドウに合わせて間延びする
            // // let dytxt = new BABYLON.DynamicTexture('dt', {width:nx, height:ny}, scene)
            // ウィンドウサイズに合わせて、テクスチャのサイズを変更する
            let rw = engine.getRenderWidth(), rh = engine.getRenderHeight();
            let nx2, ny2;
            if (rw >= rh) {
                nx2 = rw/rh*nx;
                ny2 = nx;
            } else {
                nx2 = nx;
                ny2 = rh/rw*nx;
            }
            let dytxt = new BABYLON.DynamicTexture('dt', {width:nx2, height:ny2}, scene)
            let ctx = dytxt.getContext();
            ctx.putImageData(img, 0, 0);
            dytxt.update(false);
            mesh.texture = dytxt;
            mesh._dytxt = dytxt;
            mesh._ctx = ctx;
            meshInfo.push(mesh);
        }

    }

    let setDefault = function() {
        let setIni = function(dmtrx) {
            let mrow = dmtrx.length, mcol = dmtrx[0].length;
            mrow = Math.min(mrow, ny);
            mcol = Math.min(mcol, nx);

            if (istage == 1100) {
                let v, ix, iy;
                for (let irow = 0; irow < mrow; ++irow) {
                    for (let icol = 0; icol < mcol; ++icol) {
                        v = dmtrx[irow][icol];
                        ix = icol, iy = irow;
                        dataMtrx[ix][iy] = v;
                        meshMtrx[ix][iy].material = matList[v];
                    }
                }

            } else if (istage == 1101) {
                let v, ix, iy;
                for (let irow = 0; irow < mrow; ++irow) {
                    for (let icol = 0; icol < mcol; ++icol) {
                        v = dmtrx[irow][icol];
                        ix = icol, iy = irow;
                        dataMtrx[ix][iy] = v;
                        meshMtrx[ix][iy].material = matList[v];
                    }
                }

            } else if (istage == 1200) {
                let v, ix, iy;
                for (let irow = 0; irow < mrow; ++irow) {
                    for (let icol = 0; icol < mcol; ++icol) {
                        v = dmtrx[irow][icol];
                        ix = icol, iy = irow;
                        dataMtrx[ix][iy] = v;
                        meshMtrx[ix][iy].material = matList[v];
                    }
                }

            } else if (istage == 1300) {
                let v, ix, iy;
                for (let irow = 0; irow < mrow; ++irow) {
                    for (let icol = 0; icol < mcol; ++icol) {
                        v = dmtrx[irow][icol];
                        ix = icol, iy = irow;
                        dataMtrx[ix][iy] = v;
                        if (v) {
                            // meshMtrx1を前に
                            meshMtrx0[ix][iy].position.z = 1;
                            meshMtrx1[ix][iy].position.z = 0;
                        } else {
                            // meshMtrx0を前に
                            meshMtrx0[ix][iy].position.z = 0;
                            meshMtrx1[ix][iy].position.z = 1;
                        }
                    }
                }

            } else if (istage == 1301) {
                let v, ix, iy;
                for (let irow = 0; irow < mrow; ++irow) {
                    for (let icol = 0; icol < mcol; ++icol) {
                        v = dmtrx[irow][icol];
                        ix = icol, iy = irow;
                        dataMtrx[ix][iy] = v;
                        meshMtrx[ix][iy].rotation.x = R180*v;
                    }
                }

            } else if (istage == 1400) {
                let index = 0, v, ix, iy;
                for (let icol = 0; icol < mcol; ++icol) {
                    for (let irow = 0; irow < mrow; ++irow) {
                        v = dmtrx[irow][icol];
                        ix = icol, iy = irow;
                        dataMtrx[ix][iy] = v;
                        if (v == 0) {
                            colorData[index] = 1;
                            colorData[index + 1] = 1;
                            colorData[index + 2] = 1;
                        } else {
                            colorData[index] = 0;
                            colorData[index + 1] = 0;
                            colorData[index + 2] = 0;
                        }
                        index += 4;
                    }
                }
                mesh.thinInstanceBufferUpdated("color");

            } else if (istage == 2100) {
                let index = 0, v, ix, iy, pA;
                for (let icol = 0; icol < mcol; ++icol) {
                    for (let irow = 0; irow < mrow; ++irow) {
                        v = dmtrx[irow][icol];
                        ix = icol, iy = irow;
                        dataMtrx[ix][iy] = v;
                        pA = sps.particles[index];
                        pA.color = clist[v];
                        ++index;
                    }
                }

            } else if (istage == 2200) {
                let index = 0, v, ix, iy, pA;
                for (let icol = 0; icol < mcol; ++icol) {
                    for (let irow = 0; irow < mrow; ++irow) {
                        v = dmtrx[irow][icol];
                        ix = icol, iy = irow;
                        dataMtrx[ix][iy] = v;
                        pA = pcs.particles[index];
                        pA.color = clist[v];
                        ++index;
                    }
                }

            } else if (istage == 3100) {
                let index = 0, v, ix, iy;
                for (let irow = 0; irow < mrow; ++irow) {
                    for (let icol = 0; icol < mcol; ++icol) {
                        v = dmtrx[irow][icol];
                        ix = icol, iy = irow;
                        dataMtrx[ix][iy] = v;
                        if (v == 0) {
                            img.data[index] = 255;
                            img.data[index+1] = 255;
                            img.data[index+2] = 255;
                        } else {
                            img.data[index] = 0;
                            img.data[index+1] = 0;
                            img.data[index+2] = 0;
                        }
                        index += 4;
                    }
                }
                mesh._ctx.putImageData(img, 0, 0);
                mesh._dytxt.update(false);

            } else if (istage == 3200) {
                let index = 0;
                for (let irow = 0; irow < mrow; ++irow) {
                    for (let icol = 0; icol < mcol; ++icol) {
                        let v = dmtrx[irow][icol];
                        let ix = icol, iy = irow;
                        dataMtrx[ix][iy] = v;
                        if (v == 0) {
                            img.data[index] = 255;
                            img.data[index+1] = 255;
                            img.data[index+2] = 255;
                        } else {
                            img.data[index] = 0;
                            img.data[index+1] = 0;
                            img.data[index+2] = 0;
                        }
                        index += 4;
                    }
                }
                mesh._ctx.putImageData(img, 0, 0);
                mesh._dytxt.update(false);

            }
        } // setIni(dmtrx)

        if (idefault == 0) {
            for (let iy = 0; iy < ny; ++iy) {
                for (let ix = 0; ix < nx; ++ix) {
                    let v =Math.floor(Math.random()*2);
                    dataMtrx[ix][iy] = v;
                }
            }
            
        } else if (idefault == 1) {
            // 固定物体：ブロック
            let dmtrx = [[0, 0, 0, 0],
                         [0, 1, 1, 0],
                         [0, 1, 1, 0],
                         [0, 0, 0, 0]];
            setIni(dmtrx);

        } else if (idefault == 2) {
            // 固定物体：蜂の巣
            let dmtrx = [[0, 0, 0, 0, 0, 0],
                         [0, 0, 1, 1, 0, 0],
                         [0, 1, 0, 0, 1, 0],
                         [0, 0, 1, 1, 0, 0],
                         [0, 0, 0, 0, 0, 0]];
            setIni(dmtrx);

        } else if (idefault == 3) {
            // 固定物体：ボート
            let dmtrx = [[0, 0, 0, 0, 0],
                         [0, 1, 1, 0, 0],
                         [0, 1, 0, 1, 0],
                         [0, 0, 1, 0, 0],
                         [0, 0, 0, 0, 0]];
            setIni(dmtrx);

        } else if (idefault == 4) {
            // 固定物体：船
            let dmtrx = [[0, 0, 0, 0, 0],
                         [0, 0, 1, 1, 0],
                         [0, 1, 0, 1, 0],
                         [0, 1, 1, 0, 0],
                         [0, 0, 0, 0, 0]];
            setIni(dmtrx);

        } else if (idefault == 5) {
            // 固定物体：池
            let dmtrx = [[0, 0, 0, 0, 0, 0],
                         [0, 0, 1, 1, 0, 0],
                         [0, 1, 0, 0, 1, 0],
                         [0, 1, 0, 0, 1, 0],
                         [0, 0, 1, 1, 0, 0],
                         [0, 0, 0, 0, 0, 0]];
            setIni(dmtrx);

        } else if (idefault == 11) {
            // 振動子：周期２：ブリンカー
            let dmtrx = [[0, 0, 0, 0, 0],
                         [0, 1, 1, 1, 0],
                         [0, 0, 0, 0, 0]];
            setIni(dmtrx);

        } else if (idefault == 12) {
            // 振動子：周期２：ヒキガエル
            let dmtrx = [[0, 0, 0, 0, 0, 0],
                         [0, 0, 1, 1, 0, 0],
                         [0, 1, 0, 0, 0, 0],
                         [0, 0, 0, 0, 1, 0],
                         [0, 0, 1, 1, 0, 0],
                         [0, 0, 0, 0, 0, 0]];
            setIni(dmtrx);

        } else if (idefault == 13) {
            // 振動子：周期２：ビーコン
            let dmtrx = [[0, 0, 0, 0, 0, 0],
                         [0, 1, 1, 0, 0, 0],
                         [0, 1, 1, 0, 0, 0],
                         [0, 0, 0, 1, 1, 0],
                         [0, 0, 0, 1, 1, 0],
                         [0, 0, 0, 0, 0, 0]];
            setIni(dmtrx);

        } else if (idefault == 14) {
            // 振動子：周期２：時計
            let dmtrx = [[0, 0, 0, 0, 0, 0],
                         [0, 0, 1, 0, 0, 0],
                         [0, 0, 1, 0, 1, 0],
                         [0, 1, 0, 1, 0, 0],
                         [0, 0, 0, 1, 0, 0],
                         [0, 0, 0, 0, 0, 0]];
            setIni(dmtrx);

        } else if (idefault == 21) {
            // 振動子：周期３以上：パルサー
            let dmtrx = [[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                         [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                         [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                         [1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1],
                         [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
                         [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                         [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0],
                         [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
                         [1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                         [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0],
                         [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                         [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]];
            setIni(dmtrx);

        } else if (idefault == 22) {
            // 振動子：周期３以上：八角形
            let dmtrx = [
                [0, 0, 0, 1, 1, 0, 0, 0],
                [0, 0, 1, 0, 0, 1, 0, 0],
                [0, 1, 0, 0, 0, 0, 1, 0],
                [1, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 1],
                [0, 1, 0, 0, 0, 0, 1, 0],
                [0, 0, 1, 0, 0, 1, 0, 0],
                [0, 0, 0, 1, 1, 0, 0, 0],
            ];
            setIni(dmtrx);

        } else if (idefault == 23) {
            // 振動子：周期３以上：銀河
            let dmtrx = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
                [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
                [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
                [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
                [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ];
            setIni(dmtrx);

        } else if (idefault == 24) {
            // 振動子：周期３以上：ペンタデカスロン
            let dmtrx = [
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            ];
            setIni(dmtrx);

        } else if (idefault == 31) {
            // 移動体：グライダー
            let dmtrx = [
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 1, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0],
            ];
            setIni(dmtrx);

        } else if (idefault == 32) {
            // 移動体：宇宙船（軽量
            let dmtrx = [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 0],
                [0, 0, 1, 0, 0, 0, 1, 0],
                [0, 0, 0, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
            ];
            setIni(dmtrx);

        } else if (idefault == 33) {
            // 移動体：宇宙船（中級
            let dmtrx = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 0],
                [0, 0, 1, 0, 0, 0, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 0],
                [0, 0, 1, 0, 0, 0, 1, 0, 0],
                [0, 0, 0, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
            ];
            setIni(dmtrx);

        } else if (idefault == 41) {
            // 繁殖型：グライダー銃
            let dmtrx = [
                //  2        5  6          10 11          15 16          20 21          25 26          30 31          35 36
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
                [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ];
            setIni(dmtrx);

        }
    }
    let idefault = 41; // 繁殖型：グライダー銃

    let getAliveCell = function(ix, iy) {
        let ncell = 0;
        if (ix == 0) {
            if (iy == 0) {
                // X*
                // **
                return dataMtrx[ix+1][iy] + dataMtrx[ix][iy+1] + dataMtrx[ix+1][iy+1];
            } else if (iy == ny_) {
                // **
                // X*
                return dataMtrx[ix][iy-1] + dataMtrx[ix+1][iy-1] + dataMtrx[ix+1][iy];
            } else {
                // **
                // X*
                // **
                return dataMtrx[ix][iy-1] + dataMtrx[ix+1][iy-1] + dataMtrx[ix+1][iy] + dataMtrx[ix][iy+1] + dataMtrx[ix+1][iy+1];
            }
        } else if (ix == nx_) {
            if (iy == 0) {
                // *X
                // **
                return dataMtrx[ix-1][iy] + dataMtrx[ix-1][iy+1] + dataMtrx[ix][iy+1];
            } else if (iy == ny_) {
                // **
                // *X
                return dataMtrx[ix-1][iy-1] + dataMtrx[ix-1][iy-1] + dataMtrx[ix-1][iy];
            } else {
                // **
                // *X
                // **
                return dataMtrx[ix-1][iy-1] + dataMtrx[ix-1][iy-1] + dataMtrx[ix-1][iy] + dataMtrx[ix-1][iy+1] + dataMtrx[ix][iy+1];
            }
        } else {
            if (iy == 0) {
                // *X*
                // ***
                return dataMtrx[ix-1][iy] + dataMtrx[ix+1][iy] + dataMtrx[ix-1][iy+1] + dataMtrx[ix][iy+1] + dataMtrx[ix+1][iy+1];
            } else if (iy == ny_) {
                // ***
                // *X*
                return dataMtrx[ix-1][iy-1] + dataMtrx[ix][iy-1] + dataMtrx[ix+1][iy-1] + dataMtrx[ix-1][iy] + dataMtrx[ix+1][iy];
            } else {
                // ***
                // *X*
                // ***
                return dataMtrx[ix-1][iy-1] + dataMtrx[ix][iy-1] + dataMtrx[ix+1][iy-1] + dataMtrx[ix-1][iy] + dataMtrx[ix+1][iy] + dataMtrx[ix-1][iy+1] + dataMtrx[ix][iy+1] + dataMtrx[ix+1][iy+1];
            }
        }
        return -1;
    }

    let applyRule = function() {
        for (let iy = 0; iy < ny; ++iy) {
        for (let ix = 0; ix < nx; ++ix) {
            dataMtrxNxt[ix][iy] = dataMtrx[ix][iy];
            let nac = getAliveCell(ix,iy);
            if (dataMtrx[ix][iy] == 0 && nac == 3) {
                // 誕生: 死んでいるセルに隣接する生きたセルがちょうど3つあれば、次の世代が誕生
                dataMtrxNxt[ix][iy] = 1;
            }
            if (dataMtrx[ix][iy] == 1) {
                if (nac <= 1) {
                    // 過疎: 生きているセルに隣接する生きたセルが1つ以下ならば、過疎により死滅
                    dataMtrxNxt[ix][iy] = 0;
                } else if (nac >= 4) {
                    // 過密: 生きているセルに隣接する生きたセルが4つ以上ならば、過密により死滅
                    dataMtrxNxt[ix][iy] = 0;
                } else {
                    // 生存: 生きているセルに隣接する生きたセルが2つか3つならば、次の世代でも生存
                }
            }
        }
        }
    }

    let setView = function() {
        if (istage == 1100) {
            for (let iy = 0; iy < ny; ++iy) {
                for (let ix = 0; ix < nx; ++ix) {
                    // 次世代の値をカレントに書き換え
                    dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
                    // 値に応じてメッシュのmaterialを変更する
                    meshMtrx[ix][iy].material = matList[dataMtrx[ix][iy]];
                }
            }

        } else if (istage == 1101) {
            for (let iy = 0; iy < ny; ++iy) {
                for (let ix = 0; ix < nx; ++ix) {
                    dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
                    meshMtrx[ix][iy].material = matList[dataMtrx[ix][iy]];
                }
            }

        } else if (istage == 1200) {
            for (let iy = 0; iy < ny; ++iy) {
                for (let ix = 0; ix < nx; ++ix) {
                    dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
                    meshMtrx[ix][iy].material = matList[dataMtrx[ix][iy]];
                }
            }

        } else if (istage == 1300) {
            for (let iy = 0; iy < ny; ++iy) {
                for (let ix = 0; ix < nx; ++ix) {
                    dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
                    if (dataMtrx[ix][iy]) {
                        // meshMtrx1を前に
                        meshMtrx0[ix][iy].position.z = 1;
                        meshMtrx1[ix][iy].position.z = 0;
                    } else {
                        // meshMtrx0を前に
                        meshMtrx0[ix][iy].position.z = 0;
                        meshMtrx1[ix][iy].position.z = 1;
                    }
                }
            }

        } else if (istage == 1301) {
            for (let iy = 0; iy < ny; ++iy) {
                for (let ix = 0; ix < nx; ++ix) {
                    dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
                    meshMtrx[ix][iy].rotation.x = R180*dataMtrx[ix][iy];
                }
            }

        } else if (istage == 1400) {
            let index = 0;
            // thinInstance の index の並びにあわせて
            // (istage=1と比べ)ループの ix と iy が入れ替わっていることに注意
            for (let ix = 0; ix < nx; ++ix) {
                for (let iy = 0; iy < ny; ++iy) {
                    dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
                    if (dataMtrx[ix][iy] == 0) {
                        colorData[index] = 1;
                        colorData[index + 1] = 1;
                        colorData[index + 2] = 1;
                    } else {
                        colorData[index] = 0;
                        colorData[index + 1] = 0;
                        colorData[index + 2] = 0;
                    }
                    index += 4;
                }
            }
            mesh.thinInstanceBufferUpdated("color");

        } else if (istage == 2100) {
            let index = 0;
            // ImageDataの index 並びにあわせるために
            // ループの ix と iy が入れ替わっていること、iy が逆順になっていることに注意
            let v, pA;
            for (let ix = 0; ix < nx; ++ix) {
                for (let iy = 0; iy < ny; ++iy) {
                    v = dataMtrxNxt[ix][iy]
                    dataMtrx[ix][iy] = v;
                    pA = sps.particles[index];
                    pA.color = clist[v];
                    ++index;
                }
            }
            sps.setParticles();

        } else if (istage == 2200) {
            let index = 0;
            // ImageDataの index 並びにあわせるために
            // ループの ix と iy が入れ替わっていること、iy が逆順になっていることに注意
            let v, pA;
            for (let iy = 0; iy < ny; ++iy) {
                for (let ix = 0; ix < nx; ++ix) {
                    v = dataMtrxNxt[ix][iy]
                    dataMtrx[ix][iy] = v;
                    pA = pcs.particles[index];
                    pA.color = clist[v];
                    ++index;
                }
            }
            pcs.setParticles();

        } else if (istage == 3100) {
            let index = 0;
            // ImageDataの index 並びにあわせるために
            // ループの ix と iy が入れ替わっていること、iy が逆順になっていることに注意
            for (let iy = ny-1; iy >= 0; --iy) {
                for (let ix = 0; ix < nx; ++ix) {
                    dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
                    if (dataMtrx[ix][iy] == 0) {
                        img.data[index] = 255;
                        img.data[index+1] = 255;
                        img.data[index+2] = 255;
                    } else {
                        img.data[index] = 0;
                        img.data[index+1] = 0;
                        img.data[index+2] = 0;
                    }
                    index += 4;
                }
            }
            mesh._ctx.putImageData(img, 0, 0);
            mesh._dytxt.update(false);

        } else if (istage == 3200) {
            let index = 0;
            // ImageDataの index 並びにあわせるために
            // ループの ix と iy が入れ替わっていること、iy が逆順になっていることに注意
            for (let iy = ny-1; iy >= 0; --iy) {
                for (let ix = 0; ix < nx; ++ix) {
                    dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
                    if (dataMtrx[ix][iy] == 0) {
                        img.data[index] = 255;
                        img.data[index+1] = 255;
                        img.data[index+2] = 255;
                    } else {
                        img.data[index] = 0;
                        img.data[index+1] = 0;
                        img.data[index+2] = 0;
                    }
                    index += 4;
                }
            }
            mesh._ctx.putImageData(img, 0, 0);
            mesh._dytxt.update(false);

        }

    }

    let istep = 0, tstep = 0;
//    let istep = 0, tstep = 20; //遅延用
    scene.registerAfterRender(function() {
        if (++istep > tstep) {
            istep = 0;
            applyRule();
            setView();
        }
    });


    // ----------------------------------------

    changeCamera(icamera);
    createStage(istage);
    setDefault();

    return scene;
}

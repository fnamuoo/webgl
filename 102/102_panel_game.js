// ----------------------------------------
// パネルを並べる
//

// // // ファイルパス、分割数(x)、分割数(y)のリスト（ファイルサイズは未使用）
// // const fileInfoList = [
// //     ["textures/normal.png", 4,4, 2048, 2048],
// //     ["textures/earth.jpg", 6,3, 2048, 1024],
// //     ["textures/TropicalSunnyDay_nz.jpg", 4,4, 2048, 2048],
// //     ["textures/normalMap.jpg", 4,4, 512, 512],
// //     ["textures/floor_bump.PNG", 4,4, 512, 512],
// //     ["textures/albedo.png", 4,4, 512, 512],
// //     ["textures/distortion.png", 4,4, 256, 256],
// //     ["textures/skybox4_px.jpg", 4,4, 512, 512],
// //     ["textures/skybox_nx.jpg", 4,4, 512, 512],
// //     ["textures/skybox2_py.jpg", 4, 4, 1024, 1024],
// // ];
// // const iconTropyPath = "textures/trophy.png";


// ファイルパス、分割数(x)、分割数(y)のリスト（ファイルサイズは未使用）
// const fileInfoList = [
//     ["textures/normal.png", 4,4, 2048, 2048],
//     ["../081/textures/earth.jpg", 6,3, 2048, 1024],
//     ["../065/textures/TropicalSunnyDay_nz.jpg", 4,4, 2048, 2048],
//     ["textures/normalMap.jpg", 4,4, 512, 512],
//     ["textures/floor_bump.PNG", 4,4, 512, 512],

//     ["textures/albedo.png", 4,4, 512, 512],
//     ["textures/distortion.png", 4,4, 256, 256],
//     ["textures/skybox4_px.jpg", 4,4, 512, 512],
//     ["../078/textures/skybox_nx.jpg", 4,4, 512, 512],
//     ["textures/skybox2_py.jpg", 4, 4, 1024, 1024],

// ];

// const iconTropyPath = "../097/textures/trophy.png";

// --------------------------------------------
// for PlayGround

const fileInfoList = [
    ["textures/normal.png", 4,4, 2048, 2048],
    ["https://raw.githubusercontent.com/fnamuoo/webgl/main/081/textures/earth.jpg", 6,3, 2048, 1024],
    ["https://raw.githubusercontent.com/fnamuoo/webgl/main/065/textures/TropicalSunnyDay_nz.jpg", 4,4, 2048, 2048],
    ["textures/normalMap.jpg", 4,4, 512, 512],
    ["textures/floor_bump.PNG", 4,4, 512, 512],

    ["textures/albedo.png", 4,4, 512, 512],
    ["textures/distortion.png", 4,4, 256, 256],
    ["textures/skybox4_px.jpg", 4,4, 512, 512],
    ["https://raw.githubusercontent.com/fnamuoo/webgl/main/078/textures/skybox_nx.jpg", 4,4, 512, 512],
    ["textures/skybox2_py.jpg", 4, 4, 1024, 1024],

];

const iconTropyPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/097/textures/trophy.png";

// ======================================================================

const R90 = Math.PI/2;

const createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let camera = null;
    let icamera=0, ncamera=4;
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}

        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 0,-50), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);

            // console.log("camera=", camera)

            // ArcRotateCamera で回転を抑制して、パン（平行移動）のみを許可
            // 回転動作を抑制
            camera.upperBetaLimit = R90;  // X軸の稼働角
            camera.lowerBetaLimit = R90;
            camera.upperAlphaLimit = -R90; //Y軸の稼働角
            camera.lowerAlphaLimit = -R90;
        }
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 100, 0), scene);
    light.intensity = 0.7;

    let panelMesh = [];
    let nx,ny, nx_,ny_;
    let sizex, sizex_, sizey, sizey_, adjx, adjy;
    let idx2xy = function(idx) {
        let ix = idx%nx, iy = Math.floor(idx/nx);
        return [ix*sizex+adjx, iy*sizey+adjy]
    }

    // 正しく結合した隣接パネルの情報
    // - 隣接したパネルのidxのリストを配列としてもつ
    // -ex)  [[0,1,2],
    //        [5,6]]
    let panelSet = [];
    // パネルのグループ情報を構築する関数（隣接するとわかったindexの組i,jを引数にとり、panelSet にマージする
    let addPanelSet = function(i,j) {
        let iblock=-1, jblock=-1;
        for (let ii=0; ii < panelSet.length; ++ii) {
            let tlist=panelSet[ii];
            if (tlist.includes(i)) {
                iblock=ii;
            }
            if (tlist.includes(j)) {
                jblock=ii;
            }
        }
        if (iblock >= 0) {
            if (iblock==jblock) {
                // 両方同じところに登録済み
                return
            } else if (jblock >= 0) {
                // それぞれ別の要素に登録済み .. 各要素を結合
                //let itmp=panelSet[iblock];
                let jtmp=panelSet[jblock];
                for (let v of jtmp) {
                    if (!panelSet[iblock].includes(v)) {
                        panelSet[iblock].push(v)
                    }
                }
                panelSet.splice(jblock, 1)
            } else {
                // i は登録ずみだが、jは未登録 .. iblockにjを追加
                panelSet[iblock].push(j)
            }
        } else if (jblock >= 0) {
            // j は登録ずみだが、i は未登録 .. jblockにiを追加
            panelSet[jblock].push(i)
        } else {
            // 両方未登録.. i,jを新規追加
            panelSet.push([i,j])
        }
    }
    // index=iを持つグループのindexリストを返す
    let getPanelSetMember=function(i) {
        for (let ii=0; ii < panelSet.length; ++ii) {
            let tlist=panelSet[ii];
            if (tlist.includes(i)) {
                return tlist;
            }
        }
        return [i];
    }

    let connectNextPanel = function() {
        // 一度表示をリセット(枠の表示を戻す／表示)
        for (let i = 0; i < panelMesh.length; ++i) {
            let meshi = panelMesh[i];
            meshi._capR.material.alpha=1;
            meshi._capL.material.alpha=1;
            meshi._capU.material.alpha=1;
            meshi._capD.material.alpha=1;
        }
        panelSet = [];
        // 隣接していたら枠の表示を消す
        for (let i = 0; i < panelMesh.length; ++i) {
            let meshi = panelMesh[i];
            let ix=i%nx, iy=Math.floor(i/nx)
            if (ix<nx_) {
                // 右側の連結を確認
                let j = i+1
                let meshj = panelMesh[j];
                if ((meshi._ix+1==meshj._ix) && (meshi._iy==meshj._iy)) {
                    // 隣接を確認 .. パネル間のフレームを隠す
                    meshi._capR.material.alpha=0;
                    meshj._capL.material.alpha=0;
                    // i,jの組を panelSet に追加
                    addPanelSet(i,j);
                }
            }
            if (iy<ny_) {
                // 上側の連結を確認
                let j = i+nx;
                let meshj = panelMesh[j];
                if ((meshi._ix==meshj._ix) && (meshi._iy+1==meshj._iy)) {
                    // 隣接を確認 .. パネル間のフレームを隠す
                    meshi._capU.material.alpha=0;
                    meshj._capD.material.alpha=0;
                    // i,jの組を panelSet に追加
                    addPanelSet(i,j);
                }
            }
        }

        let fin = true
        for (let i = 0; i < panelMesh.length; ++i) {
            let meshi = panelMesh[i];
            if (meshi._idx1st != i) {
                fin = false
                break
            }
        }
        return fin
    }

    let istage=0, nstage=fileInfoList.length;
    let difficultRate=0.0, difficultRateMin=0.2, difficultRateStep=0.2;
    let createStage = function (istage) {
        [fpath,nx,ny]=fileInfoList[istage]
        if (Math.random() < difficultRate) {
            nx*=2, ny*=2;
            winx=nx*5; winy=ny*5;
            difficultRate=difficultRateMin;
        } else {
            winx=nx*10; winy=ny*10;
            difficultRate += difficultRateStep;
        }
        nx_=nx-1, ny_=ny-1;

        if (panelMesh.length) {
            for (let mesh of panelMesh) {
                mesh.dispose()
            }
        }
        panelMesh = [];
        panelSet = [];

        // 複数パネル＋境界：capsule
        let mat = new BABYLON.StandardMaterial("");
        mat.diffuseTexture = new BABYLON.Texture(fpath);
        mat.diffuseTexture.hasAlpha = true;
        mat.emissiveColor = new BABYLON.Color3.White();
        sizex=winx/nx, sizex_=sizex/2, sizey=winy/ny, sizey_=sizey/2;
        adjx=-(nx/2-0.5)*sizex, adjy=-(ny/2-0.5)*sizey;
        let idx=0;
        for (let iy=0; iy<ny; ++iy) {
            for (let ix=0; ix<nx; ++ix) {
	        let uv = new BABYLON.Vector4(ix/nx, iy/ny, (ix+1)/nx, (iy+1)/ny);
                let mesh = BABYLON.MeshBuilder.CreatePlane(""+ix+"."+iy, {width:sizex, height:sizey, frontUVs: uv, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                {
                    // 枠表示のためのカプセル
                    let caphx=sizex, capr=0.02, caphy=sizey;
                    {
                        let capMesh = BABYLON.MeshBuilder.CreateCapsule("", {height:caphy, radius:capr }, scene);
                        capMesh.position.x=sizex_-capr;
                        capMesh.parent=mesh;
                        capMesh.material = new BABYLON.StandardMaterial("");
                        mesh._capR=capMesh;
                    }
                    {
                        let capMesh = BABYLON.MeshBuilder.CreateCapsule("", {height:caphx, radius:capr }, scene);
                        capMesh.rotation = new BABYLON.Vector3(0, 0, R90);
                        capMesh.position.y=sizey_-capr;
                        capMesh.parent=mesh;
                        capMesh.material = new BABYLON.StandardMaterial("");
                        mesh._capU=capMesh;
                    }
                    {
                        let capMesh = BABYLON.MeshBuilder.CreateCapsule("", {height:caphy, radius:capr }, scene);
                        capMesh.position.x=-(sizex_-capr);
                        capMesh.parent=mesh;
                        capMesh.material = new BABYLON.StandardMaterial("");
                        mesh._capL=capMesh;
                    }
                    {
                        let capMesh = BABYLON.MeshBuilder.CreateCapsule("", {height:caphx, radius:capr }, scene);
                        capMesh.rotation = new BABYLON.Vector3(0, 0, R90);
                        capMesh.position.y=-(sizey_-capr);
                        capMesh.parent=mesh;
                        capMesh.material = new BABYLON.StandardMaterial("");
                        mesh._capD=capMesh;
                    }
                }
                let xy = idx2xy(idx)
                mesh.position.x = xy[0];
                mesh.position.y = xy[1];
                mesh.material = mat;
                mesh._ix =ix;
                mesh._iy =iy;
                mesh._idx1st =idx; // 最初の並び
                mesh._idx =idx++;  // panelMesh内でのindex(入れ替えに応じて変化)
                panelMesh.push(mesh)
            }
        }

        // パネルのシャッフル
        let n = panelMesh.length;
        for (let i=0; i<n; ++i) {
            let j = Math.floor(Math.random()*n);
            if (i==j) {continue}
            let meshf = panelMesh[i], mesht = panelMesh[j];
            let pf = meshf.position.clone();
            meshf.position.copyFrom(mesht.position);
            mesht.position.copyFrom(pf);
            meshf._idx = j, mesht._idx = i;
            [panelMesh[i], panelMesh[j]] = [panelMesh[j], panelMesh[i]]
        }

        connectNextPanel();
    }

    let nextStage = function () {
        text1.zIndex = -9; // 背面に隠しておく
        text1.text = "";
        istage = (istage+1)%nstage
        createStage(istage)
    }

    createStage(istage);

   
    let meshf, mesht; //マウスのdown/up時の位置のメッシュ
    let fltmesh = null; // ドラッグ中のメッシュ
    let matblk = new BABYLON.StandardMaterial("");
    matblk.emissiveColor = new BABYLON.Color3.Black();

    scene.onPointerObservable.add((pointerInfo) => {
        let bfin=false;
        if (pointerInfo.pickInfo.hit && pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
            if (pointerInfo.event.button == 0) { // 左クリック .. from側
                meshf = pointerInfo.pickInfo.pickedMesh;
                if (meshf._idx == undefined) return; // パネル以外なら抜ける

                mesht = null;
                // パネルブロックの取得
                let ids = getPanelSetMember(meshf._idx)
                // ドラッグ中に表示するパネル
                fltmesh = meshf.clone("fpanel")
                fltmesh.isPickable = false;  // 自身を選ばないように
                fltmesh.position = meshf.position.clone()
                fltmesh._iniP = fltmesh.position.clone()
                fltmesh._ids = ids
                for (let i of ids) {
                    if (i == meshf._idx) {
                        continue
                    }
                    let _fltmesh = panelMesh[i].clone("ff")
                    _fltmesh.isPickable = false;  // 自身を選ばないように
                    _fltmesh.position = panelMesh[i].position.subtract(meshf.position)
                    _fltmesh.parent = fltmesh
                }
                {
                    // https://doc.babylonjs.com/features/featuresDeepDive/mesh/interactions/picking_collisions#detect-the-first-mesh-touched-by-the-ray
                    // https://playground.babylonjs.com/#KNE0O#1327
	            let pickResult = scene.pick(scene.pointerX, scene.pointerY);
	            if (pickResult.hit) {
		        let p = pickResult.pickedPoint
                        fltmesh._iniX = p.x;
                        fltmesh._iniY = p.y;
                    }
                }
                // ドラッグ（開始時）にクリック時のパネルを消す操作
                for (let i of ids) {
                    let _mesh = panelMesh[i];
                    _mesh._material = _mesh.material;
                    _mesh.material = matblk;
                }

            }
        } else if (pointerInfo.pickInfo.hit && pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
            // ドラッグ（終了時）にクリック時のパネルを戻す操作
            if (pointerInfo.event.button == 0) { // 左クリック .. to側
                let ids=fltmesh._ids
                for (let i of ids) {
                    let _mesh = panelMesh[i];
                    _mesh.material = _mesh._material;
                }
                if (fltmesh !=null){
                    fltmesh.dispose();
                    fltmesh = null;
                }
                mesht = pointerInfo.pickInfo.pickedMesh;
                if (meshf != mesht) {
                    let idiff = mesht._idx - meshf._idx // from から to への差分
                    let panelMesh_ = new Array(panelMesh.length).fill(null); // 移動先の配列
                    // まず選択したパネル(ids)を移動
                    for (let ii of ids) {
                        let jj = ii+idiff
                        if (jj < 0) {
                            jj += panelMesh.length;
                        } else if (jj >= panelMesh.length) {
                            jj -= panelMesh.length;
                        }
                        let mesh_ = panelMesh[ii];
                        panelMesh[ii] = null;
                        mesh_._idx = jj
                        let xy = idx2xy(jj)
                        mesh_.position.x = xy[0];
                        mesh_.position.y = xy[1];
                        panelMesh_[jj] = mesh_;
                    }
                    // 移動先(panelMesh_[ii])が null で
                    // 移動元(panelMesh[ii])が null 以外なら移動
                    for (let ii=0; ii < panelMesh.length; ++ii) {
                        if (panelMesh_[ii]==null && panelMesh[ii]!=null) {
                            panelMesh_[ii] = panelMesh[ii];
                            panelMesh[ii] = null;
                        }
                    }
                    // 残りを空いた場所に移動させる
                    let jj = 0;
                    for (let ii=0; ii < panelMesh.length; ++ii) {
                        if (panelMesh[ii]==null) {
                            continue;
                        }
                        while(jj < panelMesh_.length && panelMesh_[jj]!=null) {++jj;}
                        if (jj == panelMesh_.length) {break;}
                        panelMesh_[jj] = panelMesh[ii];
                        panelMesh_[jj]._idx =jj;
                        let xy = idx2xy(jj)
                        panelMesh_[jj].position.x = xy[0];
                        panelMesh_[jj].position.y = xy[1];
                        panelMesh[ii] = null;
                    }
                    panelMesh=panelMesh_;

                    bfin = connectNextPanel();
                }
            }
        } else {
            if (fltmesh!=null){
	        let pickResult = scene.pick(scene.pointerX, scene.pointerY);
	        if (pickResult.hit) {
		    let p = pickResult.pickedPoint
                    let xx = (p.x - fltmesh._iniX);
                    let yy = (p.y - fltmesh._iniY);
                    fltmesh.position.set(fltmesh._iniP.x+xx, fltmesh._iniP.y+yy, fltmesh._iniP.z);
                }

            }
        }

        if (bfin) {
            // クリア時の処理(呼び出し側)
            text1.zIndex = 1; // 前面で表示する位置に
            text1.text = "Clear!!";
            guiStageRect._clear[istage]=true
            setTimeout(nextStage, 3000);
        }
        
    })

    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // ----------------------------------------
    // ステージ選択

    let guiStageRect = new BABYLON.GUI.Rectangle(); 
    guiStageRect._obj=[];
    guiStageRect._clear=[];

    {
        // キャラクター選択GUI作成
        guiStageRect.width = "600px";
        guiStageRect.height = "400px";
        guiStageRect.cornerRadius = 20;
        guiStageRect.color = "Orange";
        guiStageRect.thickness = 4;
        guiStageRect.background = "green";
        guiStageRect.isVisible = false;
        advancedTexture.addControl(guiStageRect);
        //
        let nr = Math.ceil(fileInfoList.length/5)

        let scrollViewer = new BABYLON.GUI.ScrollViewer("sv", false);
        scrollViewer.width = "600px";
        scrollViewer.height = "380px";
        guiStageRect.addControl(scrollViewer);

        let stackPanel = new BABYLON.GUI.StackPanel("sp");
        stackPanel.width = "580px";
        stackPanel.height=""+nr*125+"px";
        scrollViewer.addControl(stackPanel);

        let grid = new BABYLON.GUI.Grid("grid");
        grid.background = "black";
        grid.width = "580px";
        grid.height = ""+nr*125+"px";
        for (let ii=0; ii<5; ++ii) {
            grid.addColumnDefinition(0.2);
        }
        for (let ii=0; ii<nr; ++ii) {
            grid.addRowDefinition(1/nr);
        }
        stackPanel.addControl(grid); 

        for (let ii=0; ii<fileInfoList.length;++ii) {
            let ic=ii%5, ir=Math.floor(ii/5);
            let fpath = fileInfoList[ii][0];
            let button = BABYLON.GUI.Button.CreateImageOnlyButton("p"+ii, fpath);
            button.onPointerUpObservable.add(function() {
                istage = ii;
                createStage(istage);
                changeStageView();
            });

            grid.addControl(button, ir, ic);
            guiStageRect._obj.push(button);
            guiStageRect._clear.push(false);
        }
    }
    var changeStageView = function() {
        if (guiStageRect.isVisible) {
            guiStageRect.isVisible = false;
        } else {
            for (let ii=0; ii <guiStageRect._obj.length; ++ii) {
                let obj = guiStageRect._obj[ii];
                if (guiStageRect._clear[ii]) {
                    obj.image.alpha=1;
                } else {
                    obj.image.alpha=0.2;
                }
            }

            guiStageRect.isVisible = true;
        }
    }

    // 画面右上。トロフィー／ステージ選択ボタン
    var guiIconStage = new BABYLON.GUI.Image("ctrl", iconTropyPath);
    {
        guiIconStage.width = "60px";
        guiIconStage.height = "60px";
        guiIconStage.top = "5px";
        guiIconStage.autoScale = false
        guiIconStage.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIconStage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        guiIconStage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        guiIconStage.onPointerUpObservable.add(function() {
            changeStageView();
        });
        advancedTexture.addControl(guiIconStage);   
    }

    // ------------------------------
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "";
    text1.color = "white";
    text1.fontSize = 120; // 24;
    text1.height = "100px";
    text1.zIndex = -9; // 背面に隠しておく
    advancedTexture.addControl(text1);   

    return scene;
}


// 渓谷、洞窟

// ドローン（モード２）左：上昇下降・左右旋回　右スティック：前後移動・左右移動
// 
//  - カーソル上下   .. 前後移動
//  - カーソル右左   .. 左右移動
//  - (w,s)          .. 上昇下降
//  - (a,d)          .. 左右旋回
//  - space          .. 姿勢をリセット
//  - n/p            .. ステージの切り替え
//  - v              .. オリジナルデータの切り替え（≒ステージ切り替え）
//  - m              .. 材質の切り替え（ワイヤーフレーム／テクスチャ）
//  - c              .. カメラの切り替え（俯瞰／自機視点）
//  - h              .. ヘルプ表示

//const grndPath = "textures/sand.jpg";
//const myTextPath = "textures/pipo-charachip007.png"; // 男の子

// --------------------------------------------
// for local
const grndPath = "../086/textures/sand.jpg";
const myTextPath = "../093/textures/pipo-charachip007.png"; // 男の子


// --------------------------------------------
// for PlayGround
// const grndPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/086/textures/sand.jpg";
// const myTextPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/093/textures/pipo-charachip007.png"; // 男の子


// ======================================================================
// let CourseData = null;
// import(SCRIPT_URL1).then((obj) => { CourseData = obj; });

const R90 = Math.PI/2;
// const R180 = Math.PI;
// const R270 = Math.PI*3/2;
// const R360 = Math.PI*2;


var createScene = async function () {
    var scene = new BABYLON.Scene(engine);

    let camera = null;
    let icamera=0, ncamera=2;
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            // 俯瞰視点
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 80,-60), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
        }
        if (icamera == 1) {
            // キャラクター視点
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 180;
            camera.radius = 5;
            camera.heightOffset = 0.5;
            camera.cameraAcceleration = 0.05;
            camera.maxCameraSpeed = 30;
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
            camera.lockedTarget = myMesh;
        }
    }

    const physicsPlugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), physicsPlugin);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    let grndMeshBase;
    let grndMesh=null, grndAgg=null;
    let grndW =1000, grndH = 1000;
    {
        // 床を平面で表現
        grndMesh = BABYLON.MeshBuilder.CreateGround("ground", {width:grndW, height:grndH}, scene);
        let agg = new BABYLON.PhysicsAggregate(grndMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
        grndMesh.material = new BABYLON.GridMaterial("", scene);
        grndMesh.material.majorUnitFrequency = 100;
        grndMesh.material.minorUnitVisibility  = 0.7;
        grndMesh._agg = agg;
    }

    // パーリンノイズでいくつかのデータを作成
    let fieldData=[], fieldDataOrgList=[];
    let idata=0, ndata=4;
    if (1) {
        // data0
        // perlinノイズで地形を作る  .. 山がいっぱいな版
        let nb = new BABYLON.NoiseBlock();
        const nbvzero = new BABYLON.Vector3(0,0,0);
        // let gridratio = 1, nbscale = 0.02/gridratio;
        let gridratio = 1, nbscale = 0.05/gridratio;
        let size = 100, size_ = size/2;
        let nmin = -size_, nmax = size_+1; // , yratio = 20;
        let ymin=999, ymax=-999;
        let fieldDataOrg0=[];
        for (let iz = nmin; iz < nmax; ++iz) {
            let z = iz*gridratio;
            let path = []
            for (let ix = nmin; ix < nmax; ++ix) {
                let x = ix*gridratio;
                let y = nb.noise(8, 0.5, new BABYLON.Vector3(x,z,0), nbvzero, nbscale);
                if (ymin > y) {ymin=y}
                if (ymax < y) {ymax=y}
                path.push(new BABYLON.Vector3(x, y, z));
            }
            fieldDataOrg0.push(path);
        }
        // [0,1]に規格化
        let yrng=ymax-ymin;
        for (let iz = 0; iz < fieldDataOrg0.length; ++iz) {
            for (let ix = 0; ix < fieldDataOrg0[0].length; ++ix) {
                fieldDataOrg0[iz][ix].y = (fieldDataOrg0[iz][ix].y-ymin)/yrng;
                if (fieldDataOrg0[iz][ix].y < 0) { fieldDataOrg0[iz][ix].y=0; }
                if (fieldDataOrg0[iz][ix].y > 1) { fieldDataOrg0[iz][ix].y=1; }
            }
        }
        fieldDataOrgList.push(fieldDataOrg0);
    }
    if (1) {
        // data1
        // perlinノイズで地形を作る  .. 岬＋島な版
        let nb = new BABYLON.NoiseBlock();
        const nbvzero = new BABYLON.Vector3(0,0,0);
        let gridratio = 1, nbscale = 0.02/gridratio;
        let size = 100, size_ = size/2;
        let nmin = -size_, nmax = size_+1; // , yratio = 20;
        let ymin=999, ymax=-999;
        let fieldDataOrg1=[];
        for (let iz = nmin; iz < nmax; ++iz) {
            let z = iz*gridratio;
            let path = []
            for (let ix = nmin; ix < nmax; ++ix) {
                let x = ix*gridratio;
                let y = nb.noise(8, 0.5, new BABYLON.Vector3(x,z,0), nbvzero, nbscale);
                if (ymin > y) {ymin=y}
                if (ymax < y) {ymax=y}
                path.push(new BABYLON.Vector3(x, y, z));
            }
            fieldDataOrg1.push(path);
        }
        // [0,1]に規格化
        let yrng=ymax-ymin;
        for (let iz = 0; iz < fieldDataOrg1.length; ++iz) {
            for (let ix = 0; ix < fieldDataOrg1[0].length; ++ix) {
                fieldDataOrg1[iz][ix].y = (fieldDataOrg1[iz][ix].y-ymin)/yrng;
                if (fieldDataOrg1[iz][ix].y < 0) { fieldDataOrg1[iz][ix].y=0; }
                if (fieldDataOrg1[iz][ix].y > 1) { fieldDataOrg1[iz][ix].y=1; }
            }
        }
        fieldDataOrgList.push(fieldDataOrg1);
    }
    if (1) {
        // data2
        // perlinノイズで地形を作る  .. 山がいっぱい？（宮城県松島？
        let nb = new BABYLON.NoiseBlock();
        const nbvzero = new BABYLON.Vector3(0,0,0);
        // let gridratio = 1, nbscale = 0.02/gridratio;
        let gridratio = 1, nbscale = 0.05/gridratio;
        let size = 400, size_ = size/2;
        let nmin = -size_, nmax = size_+1; // , yratio = 20;
        let ymin=999, ymax=-999;
        let fieldDataOrg0=[];
        for (let iz = nmin; iz < nmax; ++iz) {
            let z = iz*gridratio;
            let path = []
            for (let ix = nmin; ix < nmax; ++ix) {
                let x = ix*gridratio;
                let y = nb.noise(8, 0.5, new BABYLON.Vector3(x,z,0), nbvzero, nbscale);
                if (ymin > y) {ymin=y}
                if (ymax < y) {ymax=y}
                path.push(new BABYLON.Vector3(x, y, z));
            }
            fieldDataOrg0.push(path);
        }
        // [0,1]に規格化
        let yrng=ymax-ymin;
        for (let iz = 0; iz < fieldDataOrg0.length; ++iz) {
            for (let ix = 0; ix < fieldDataOrg0[0].length; ++ix) {
                fieldDataOrg0[iz][ix].y = (fieldDataOrg0[iz][ix].y-ymin)/yrng;
                if (fieldDataOrg0[iz][ix].y < 0) { fieldDataOrg0[iz][ix].y=0; }
                if (fieldDataOrg0[iz][ix].y > 1) { fieldDataOrg0[iz][ix].y=1; }
            }
        }
        fieldDataOrgList.push(fieldDataOrg0);
    }
    if (1) {
        // data3
        // perlinノイズで地形を作る  .. 岬＋島
        let nb = new BABYLON.NoiseBlock();
        const nbvzero = new BABYLON.Vector3(0,0,0);
        let gridratio = 1, nbscale = 0.02/gridratio;
        let size = 400, size_ = size/2;
        let nmin = -size_, nmax = size_+1; // , yratio = 20;
        let ymin=999, ymax=-999;
        let fieldDataOrg1=[];
        for (let iz = nmin; iz < nmax; ++iz) {
            let z = iz*gridratio;
            let path = []
            for (let ix = nmin; ix < nmax; ++ix) {
                let x = ix*gridratio;
                let y = nb.noise(8, 0.5, new BABYLON.Vector3(x,z,0), nbvzero, nbscale);
                if (ymin > y) {ymin=y}
                if (ymax < y) {ymax=y}
                path.push(new BABYLON.Vector3(x, y, z));
            }
            fieldDataOrg1.push(path);
        }
        // [0,1]に規格化
        let yrng=ymax-ymin;
        for (let iz = 0; iz < fieldDataOrg1.length; ++iz) {
            for (let ix = 0; ix < fieldDataOrg1[0].length; ++ix) {
                fieldDataOrg1[iz][ix].y = (fieldDataOrg1[iz][ix].y-ymin)/yrng;
                if (fieldDataOrg1[iz][ix].y < 0) { fieldDataOrg1[iz][ix].y=0; }
                if (fieldDataOrg1[iz][ix].y > 1) { fieldDataOrg1[iz][ix].y=1; }
            }
        }
        fieldDataOrgList.push(fieldDataOrg1);
    }

    var changeData = function(idata) {
        fieldData=fieldDataOrgList[idata];
    }
    changeData(idata)

    let mat, yratio=30;
    let imat=0, nmat=4, matlist=[];
    {
        let mat_ = new BABYLON.GradientMaterial("grad", scene);
        mat_.topColor = new BABYLON.Color3(0.9, 0.2, 0.2);
        mat_.bottomColor = new BABYLON.Color3(0.2, 0.2, 0.9);
        mat_.smoothness = 5;
        mat_.scale = 0.06;
        mat_.wireframe = true;
        matlist.push(mat_);
    }
    {
        let mat_ = new BABYLON.StandardMaterial("mat");
        mat_.diffuseTexture = new BABYLON.Texture(grndPath, scene);
        mat_.specularColor = new BABYLON.Color4(0, 0, 0);
        matlist.push(mat_);
    }
    {
        let mat_ = new BABYLON.StandardMaterial("mat");
        mat_.diffuseTexture = new BABYLON.Texture(grndPath, scene);
	mat_.diffuseTexture.uScale = 10;
	mat_.diffuseTexture.vScale = 10;
        mat_.specularColor = new BABYLON.Color4(0, 0, 0);
        matlist.push(mat_);
    }

    {
        // 複数のグラデーションのmaterialのためにこちらを参照
        // https://forum.babylonjs.com/t/generate-materials-with-color-gradients/6032/4
        // https://www.babylonjs-playground.com/#MCJYB5#12
        var nodeMaterial = new BABYLON.NodeMaterial(`node material`);
        var position = new BABYLON.InputBlock("position");
        position.setAsAttribute("position");
        var worldPos = new BABYLON.TransformBlock("worldPos");
        worldPos.complementZ = 0;
        worldPos.complementW = 1;
        position.output.connectTo(worldPos.vector);
        var world = new BABYLON.InputBlock("world");
        world.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);
        var Transform = new BABYLON.TransformBlock("Transform");
        Transform.complementZ = 0;
        Transform.complementW = 1;
        var normal = new BABYLON.InputBlock("normal");
        normal.setAsAttribute("normal");
        normal.output.connectTo(Transform.vector);
        world.output.connectTo(Transform.transform);
        var Lights = new BABYLON.LightBlock("Lights");
        worldPos.output.connectTo(Lights.worldPosition);
        Transform.output.connectTo(Lights.worldNormal);
        var cameraPosition = new BABYLON.InputBlock("cameraPosition");
        cameraPosition.setAsSystemValue(BABYLON.NodeMaterialSystemValues.CameraPosition);
        cameraPosition.output.connectTo(Lights.cameraPosition);
        var Multiply = new BABYLON.MultiplyBlock("Multiply");
        var Gradient = new BABYLON.GradientBlock("Gradient");
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0, new BABYLON.Color3(0.15, 0.4, 0.8)));
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(1, new BABYLON.Color3(0.6, 0.5, 0.3)));
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(5, new BABYLON.Color3(0.4, 0.7, 0.3)));
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(10, new BABYLON.Color3(0.2, 0.5, 0.2)));
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(20, new BABYLON.Color3(0.4, 0.4, 0.3)));
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(29, new BABYLON.Color3(0.90, 0.90, 0.95)));
        // グラデーションはこちらを参考に
        // cx20様
        // https://playground.babylonjs.com/?webgpu#Y2UGQ5#53
        var VectorSplitter = new BABYLON.VectorSplitterBlock("VectorSplitter");
        position.output.connectTo(VectorSplitter.xyzIn);
        // VectorSplitter.x.connectTo(Gradient.gradient);
        VectorSplitter.y.connectTo(Gradient.gradient);
        Gradient.output.connectTo(Multiply.left);
        Lights.diffuseOutput.connectTo(Multiply.right);
        var fragmentOutput = new BABYLON.FragmentOutputBlock("fragmentOutput");
        Multiply.output.connectTo(fragmentOutput.rgb);
        world.output.connectTo(worldPos.transform);
        var worldPosviewProjectionTransform = new BABYLON.TransformBlock("worldPos * viewProjectionTransform");
        worldPosviewProjectionTransform.complementZ = 0;
        worldPosviewProjectionTransform.complementW = 1;
        worldPos.output.connectTo(worldPosviewProjectionTransform.vector);
        var viewProjection = new BABYLON.InputBlock("viewProjection");
        viewProjection.setAsSystemValue(BABYLON.NodeMaterialSystemValues.ViewProjection);
        viewProjection.output.connectTo(worldPosviewProjectionTransform.transform);
        var vertexOutput = new BABYLON.VertexOutputBlock("vertexOutput");
        worldPosviewProjectionTransform.output.connectTo(vertexOutput.vector);
        nodeMaterial.addOutputNode(vertexOutput);
        nodeMaterial.addOutputNode(fragmentOutput);
        nodeMaterial.build();
        matlist.push(nodeMaterial);
    }

    mat = matlist[imat];
    let matX = null;
    var changeMat = function() {
        imat = (imat+1)%nmat;
        mat = matlist[imat];
        if (Object.keys(trgMeshInfo).length > 0) {
            for (let key in trgMeshInfo) {
                let mesh = trgMeshInfo[key];
                mesh.material=mat;
            }
        }
        
    }

    let istage = 0, nstage = 10;
    let trgMeshInfo = {};
    var createStage = function(istage) {
console.log("createStage  istage=",istage);
        if (Object.keys(trgMeshInfo).length > 0) {
            for (let key in trgMeshInfo) {
                let mesh = trgMeshInfo[key];
                if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
                mesh.dispose();
            }
            trgMeshInfo = {};
        }

        camera.setTarget(BABYLON.Vector3.Zero());

        if(istage==0) {
            // 通常のパーリンノイズによる凹凸
console.log("  normal");
            let fieldData2 = [];
            for (let iz = 0; iz < fieldData.length; ++iz) {
                let path = []
                for (let ix = 0; ix < fieldData[0].length; ++ix) {
                    let v = fieldData[iz][ix].clone();
                    v.y *= yratio;
                    path.push(v);
                }
                fieldData2.push(path);
            }
            let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: fieldData2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgMesh.position.y = 0.5;
            trgMesh.material = mat;
            let agg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
            trgMesh._agg = agg;
            trgMeshInfo[trgMesh.id] = trgMesh;
        }

        if(istage==1) {
            // perlinノイズで地形を作る(y=x^2にして凹凸を強調？ .. 石柱っぽく
console.log("  y=x^2");
            let fieldData2 = [];
            for (let iz = 0; iz < fieldData.length; ++iz) {
                let path = []
                for (let ix = 0; ix < fieldData[0].length; ++ix) {
                    let v = fieldData[iz][ix].clone();
                    v.y = v.y**2;
                    v.y *= yratio;
                    path.push(v);
                }
                fieldData2.push(path);
            }
            let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: fieldData2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgMesh.position.y = 0.5;
            trgMesh.material = mat;
            trgMeshInfo[trgMesh.id] = trgMesh;
        }


        if(istage==2) {
            // perlinノイズで地形を作る(y=x^2にして凹凸を強調？
console.log("  y=x^2(shift)");
            let fieldData2 = [];
            for (let iz = 0; iz < fieldData.length; ++iz) {
                let path = []
                for (let ix = 0; ix < fieldData[0].length; ++ix) {
                    let v = fieldData[iz][ix].clone();
                    v.y = (v.y+0.5)**2-1;
                    if (v.y < 0) { v.y=0; }
                    if (v.y > 1) { v.y=1; }
                    v.y *= yratio;
                    path.push(v);
                }
                fieldData2.push(path);
            }
            let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: fieldData2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgMesh.position.y = 0.51;
            trgMesh.material = mat;
            trgMeshInfo[trgMesh.id] = trgMesh;
        }

        if(istage==3) {
            // perlinノイズで地形を作る(y=x^3にして凹凸を強調？
console.log("  y=x^3");
            let fieldData2 = [];
            for (let iz = 0; iz < fieldData.length; ++iz) {
                let path = []
                for (let ix = 0; ix < fieldData[0].length; ++ix) {
                    let v = fieldData[iz][ix].clone();
                    v.y = v.y**3;
                    v.y *= yratio;
                    path.push(v);
                }
                fieldData2.push(path);
            }
            let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: fieldData2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgMesh.position.y = 0.5;
            trgMesh.material = mat;
            trgMeshInfo[trgMesh.id] = trgMesh;
        }

        if(istage==4) {
            // perlinノイズで地形を作る(活性化関数で局地化してみる　y = tanh
console.log("  y=tanh(x*3)");
            let fieldData2 = [];
            for (let iz = 0; iz < fieldData.length; ++iz) {
                let path = []
                for (let ix = 0; ix < fieldData[0].length; ++ix) {
                    let v = fieldData[iz][ix].clone();
                    y2 = v.y;
                    y2 = (y2-0.5)*3;
                    expp = Math.exp(y2); expn = Math.exp(-y2);
                    y3 = (expp-expn)/(expp+expn);
                    v.y = (y3+1.0)/2;
                    v.y *= yratio;
                    path.push(v);
                }
                fieldData2.push(path);
            }
            let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: fieldData2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgMesh.position.y = 0.5;
            trgMesh.material = mat;
            trgMeshInfo[trgMesh.id] = trgMesh;
        }

        if(istage==5) {
            // perlinノイズで地形を作る(活性化関数で局地化してみる　y = tanh
console.log("  y=tanh(x*5)");
            let fieldData2 = [];
            for (let iz = 0; iz < fieldData.length; ++iz) {
                let path = []
                for (let ix = 0; ix < fieldData[0].length; ++ix) {
                    let v = fieldData[iz][ix].clone();
                    y2 = v.y;
                    y2 = (y2-0.5)*5;
                    expp = Math.exp(y2); expn = Math.exp(-y2);
                    y3 = (expp-expn)/(expp+expn);
                    v.y = (y3+1.0)/2;
                    v.y *= yratio;
                    path.push(v);
                }
                fieldData2.push(path);
            }
            let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: fieldData2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgMesh.position.y = 0.5;
            trgMesh.material = mat;
            trgMeshInfo[trgMesh.id] = trgMesh;
        }

        if(istage==6) {
            // perlinノイズで地形を作る(活性化関数で局地化してみる　y = tanh  .. 峡谷っぽく
console.log("  y=tanh(x*10)");
            let fieldData2 = [];
            for (let iz = 0; iz < fieldData.length; ++iz) {
                let path = []
                for (let ix = 0; ix < fieldData[0].length; ++ix) {
                    let v = fieldData[iz][ix].clone();
                    y2 = v.y;
                    y2 = (y2-0.5)*10;
                    expp = Math.exp(y2); expn = Math.exp(-y2);
                    y3 = (expp-expn)/(expp+expn);
                    v.y = (y3+1.0)/2;
                    v.y *= yratio;
                    path.push(v);
                }
                fieldData2.push(path);
            }
            let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: fieldData2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgMesh.position.y = 0.5;
            trgMesh.material = mat;
            trgMeshInfo[trgMesh.id] = trgMesh;
        }

        if(istage==7) {
            // perlinノイズで地形を作る(定数倍して、上限下限をカット .. 計算が楽だけどtanhに比べエッジが角ばってる
console.log("  y=floor()&ceil()");
            let fieldData2 = [];
            for (let iz = 0; iz < fieldData.length; ++iz) {
                let path = []
                for (let ix = 0; ix < fieldData[0].length; ++ix) {
                    let v = fieldData[iz][ix].clone();
                    v.y = (v.y-0.5)*2+0.5;
                    if (v.y < 0) { v.y=0; }
                    if (v.y > 1) { v.y=1; }
                    v.y *= yratio;
                    path.push(v);
                }
                fieldData2.push(path);
            }
            let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: fieldData2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgMesh.position.y = 0.51;
            trgMesh.material = mat;
            trgMeshInfo[trgMesh.id] = trgMesh;
        }

        if(istage==8) {
            // 天井と床、上下に配置する .. 洞窟というより地底空間
            // perlinノイズで地形を作る(y^2にして凹凸を強調？
console.log("  ceiling(x*2), floor(x*3) ");
            let fieldData2 = [];
            let fieldData3 = [];
            for (let iz = 0; iz < fieldData.length; ++iz) {
                let path2 = []
                let path3 = []
                for (let ix = 0; ix < fieldData[0].length; ++ix) {
                    // floor
                    let v = fieldData[iz][ix].clone();
                    v.y = v.y**3;
                    v.y *= yratio;
                    path2.push(v);
                    // ceiling
                    let vv = fieldData[iz][ix].clone();
                    vv.y = 2-vv.y**2;
                    vv.y *= yratio;
                    path3.push(vv);
                }
                fieldData2.push(path2);
                fieldData3.push(path3);
            }
            let trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon_floor", {pathArray: fieldData2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgMesh.position.y = 0.5;
            trgMesh.material = mat;
            trgMeshInfo[trgMesh.id] = trgMesh;
            let trgMesh2 = BABYLON.MeshBuilder.CreateRibbon("ribbon_ceiling", {pathArray:fieldData3, sideOrientation:BABYLON.Mesh.FRONTSIDE});
            trgMesh2.position.y = 0.5;
            trgMesh2.material = mat;
            trgMeshInfo[trgMesh2.id] = trgMesh2;
        }

        if(istage==9) {
            // 天井と床、上下に配置する .. こちらでも洞窟ぽくはない気がする
            // perlinノイズで地形を作る(y^2にして凹凸を強調？ ちょい重なるように
console.log("  ceiling(tanh*10), floor(tanh*10) ");
            let fieldData2 = [];
            let fieldData3 = [];
            for (let iz = 0; iz < fieldData.length; ++iz) {
                let path2 = []
                let path3 = []
                for (let ix = 0; ix < fieldData[0].length; ++ix) {
                    // floor
                    let v = fieldData[iz][ix].clone();
                    y2 = v.y;
                    y2 = (y2-0.5)*10;
                    expp = Math.exp(y2); expn = Math.exp(-y2);
                    y3 = (expp-expn)/(expp+expn);
                    v.y = (y3+1.2)/2;
                    if (v.y > 1) { v.y=1; }
                    v.y *= yratio;
                    path2.push(v);
                    // ceiling
                    let vv = fieldData[iz][ix].clone();
                    y2 = vv.y;
                    y2 = (y2-0.5)*10;
                    expp = Math.exp(y2); expn = Math.exp(-y2);
                    y3 = (expp-expn)/(expp+expn);
                    vv.y = (y3+1.2)/2;
                    if (vv.y > 1) { vv.y=1; }
                    vv.y = 2-vv.y;
                    vv.y *= yratio;
                    path3.push(vv);
                }
                fieldData2.push(path2);
                fieldData3.push(path3);
            }
            let trgMesh2 = BABYLON.MeshBuilder.CreateRibbon("ribbon_floor", {pathArray: fieldData2, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
            trgMesh2.position.y = 0.5;
            trgMesh2.material = mat;
            trgMeshInfo[trgMesh2.id] = trgMesh2;
            let trgMesh3 = BABYLON.MeshBuilder.CreateRibbon("ribbon_ceiling", {pathArray:fieldData3, sideOrientation:BABYLON.Mesh.FRONTSIDE});
            trgMesh3.position.y = 0.5;
            trgMesh3.material = mat;
            trgMeshInfo[trgMesh3.id] = trgMesh3;
        }

        if(istage>=8) {
            camera.setTarget(new BABYLON.Vector3(0, yratio, 0));
        }

    }

    // ----------------------------------------

    // 自機
    let myMesh;
    {
        let sx=1, sy=0.2, sz=2;
        myMesh = BABYLON.MeshBuilder.CreateBox("my", { width: sx, height: sy, depth: sz }, scene);
        let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
        myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
        myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
        myMesh.physicsBody.disablePreStep = false;
        myMesh._agg = myAgg;

        // let myTextPath = "textures/pipo-charachip007.png"; // 男の子
        let charPath = myTextPath;
        let mx = 3, my = 4;
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

        myMesh.physicsBody.setGravityFactor(0);   // 重力の効果
    }
    // myMesh.position.y += 30;
    myMesh.position.y += yratio;


    // ----------------------------------------

    changeCamera(icamera);
    createStage(istage);


    let map ={};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    const qYR = BABYLON.Quaternion.FromEulerAngles(0, 0.1, 0);
    const qYL = BABYLON.Quaternion.FromEulerAngles(0, -0.1, 0);
    let mvScale=0.2;
    let cooltime_act = 0, cooltime_actIni = 10;
    scene.registerAfterRender(function() {
        // ドローン（モード２）左：上昇下降・左右旋回　右スティック：前後移動・左右移動
        let quat = myMesh.rotationQuaternion;
        if (map["ArrowUp"]) {
            let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
            myMesh.position.addInPlace(vdir.scale(mvScale));
        }
        if (map["ArrowDown"]) {
            let vdir = BABYLON.Vector3.Backward().applyRotationQuaternion(quat);
            myMesh.position.addInPlace(vdir.scale(mvScale));
        }
        if (map["ArrowLeft"]) {
            let vdir = BABYLON.Vector3.Left().applyRotationQuaternion(quat);
            myMesh.position.addInPlace(vdir.scale(mvScale));
        }
        if (map["ArrowRight"]) {
            let vdir = BABYLON.Vector3.Right().applyRotationQuaternion(quat);
            myMesh.position.addInPlace(vdir.scale(mvScale));
        }

        if (map["w"]) {
            let vdir = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
            myMesh.position.addInPlace(vdir.scale(mvScale));
        }
        if (map["s"]) {
            let vdir = BABYLON.Vector3.Down().applyRotationQuaternion(quat);
            myMesh.position.addInPlace(vdir.scale(mvScale));
        }
        if (map["a"]) {
            quat.multiplyInPlace(qYL);
        }
        if (map["d"]) {
            quat.multiplyInPlace(qYR);
        }

        if (map[" "]) {
            // 姿勢をリセット
            let eular = myMesh.rotationQuaternion.toEulerAngles()
            let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
            myMesh.rotationQuaternion = quat;
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
            myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 慣性を止める
        }

        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["n"]) {
                cooltime_act = cooltime_actIni;
                istage = (istage+1)%nstage;
                createStage(istage);
            }
            if (map["p"] || map["b"]) {
                cooltime_act = cooltime_actIni;
                istage = (istage+nstage-1)%nstage;
                createStage(istage);
            }
            if (map["v"]) {
                cooltime_act = cooltime_actIni;
                idata = (idata+1)%ndata;
                changeData(idata)
                createStage(istage);
            }
            if (map["m"]) {
                cooltime_act = cooltime_actIni;
                changeMat();
            }
            if (map["c"]) {
                cooltime_act = cooltime_actIni;
                icamera = (icamera+1)%ncamera;
                changeCamera(icamera);
            }

            if (map["h"]) {
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
    guiLabelRect.height = "190px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n"
        +"(Arrow UP/DOWN): Forward/Back\n"
        +"(Arrow Left/Right): Left/Right\n"
        +"(W,S) : Up/Down\n"
        +"(A,D) : Rot Left/Rot Right\n"
        +"(Space): reset posture\n"
        +"(N,P) : Change Stage\n"
        +"V : Change Original Data\n"
        +"M : Change Material\n"
        +"C : Change Camera\n"
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


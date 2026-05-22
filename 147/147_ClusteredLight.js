// Clustered Lighting

// // local(1)
// let pathRoot = "../";
// const fpathFloor = pathRoot + "textures/floor.png";
// const fpathGlassBuilding = pathRoot + "textures/glassbuilding.jpg";
// const fpathGrass = pathRoot + "textures/grass.jpg";
// const fpathGrassnGray = pathRoot + "textures/grassn_gray.png";
// const fpathRockn = pathRoot + "textures/rockn_gray.png";
// const fpathRoundMask = pathRoot + "textures/roundMask.png";

// local(2)
let pathRoot = "../";
// PlayGround
// let pathRoot = "https://raw.githubusercontent.com/fnamuoo/webgl/main/";

const fpathFloor = pathRoot + "081/textures/floor.png";
const fpathGlassBuilding = pathRoot + "124/textures/glassbuilding.jpg";
const fpathGrass = pathRoot + "065/textures/grass.jpg";
const fpathGrassnGray = pathRoot + "147/textures/grassn_gray.png";
const fpathRockn = pathRoot + "147/textures/rockn_gray.png";
const fpathRoundMask = pathRoot + "147/textures/roundMask.png";



//     let pathRoot = "../";
//             const fpathFloor = pathRoot + "081/textures/floor.png";
// //            const fpathFloor = pathRoot + "textures/floor.png";

//     // let pathRoot = "./";
//     // const fpathGlassBuilding = pathRoot + "textures/glassbuilding.jpg";
//     // const fpathGrass = "textures/grass.jpg";
//     let pathRoot = "../";
//     const fpathGlassBuilding = pathRoot + "124/textures/glassbuilding.jpg";
//     const fpathGrass = pathRoot + "065/textures/grass.jpg";

// //     // const fpathFloor = "textures/floor.png";
//     // const fpathRockn = "textures/rockn_gray.png";
//     // const fpathRoundMask = "textures/roundMask.png";
// //    const fpathFloor = "../081/textures/floor.png";
//     const fpathGrassnGray = "textures/grassn_gray.png";
//     const fpathRockn = "textures/rockn_gray.png";
//     const fpathRoundMask = "textures/roundMask.png";


export var createScene_test_03 = async function () {

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.wheelDeltaPercentage = 0.01;
    camera.useAutoRotationBehavior = true; // 自動でゆっくり回転

    // const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    // light.intensity = 0.3; // 薄暗い感じに

    if (1) {
        // 地面
        let grndW=200, grndH=200;
        let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);

        if (1) {
            // const fpathFloor = "textures/floor.png";
            var mat = new BABYLON.StandardMaterial("mat", scene);
            var texture = new BABYLON.Texture(fpathFloor, scene);
            // mat.emissionTexture = texture;
            mat.diffuseTexture = texture;
            mat.diffuseTexture.uScale = 200;
            mat.diffuseTexture.vScale = 200;
            mat.specularColor = new BABYLON.Color3(0, 0, 0); // 光沢を消す
            meshGrnd.material = mat;
        }
        if (0) {
        meshGrnd.position.y += -0.01;
        meshGrnd.material = new BABYLON.GridMaterial("groundMaterial", scene);
        meshGrnd.material.majorUnitFrequency = 100; 
        meshGrnd.material.minorUnitVisibility  = 0.2;
        }
    }

    // 石柱
    let nmesh=200, meshH = 0.3, meshH_=meshH/2, r=0.75, rad=0, radstep=0.55, x,y,z;
    y = meshH_;
    // 石っぽいテクスチャ
    var mat2 = new BABYLON.StandardMaterial("mat", scene);
    {
        const fpathRockn = "textures/rockn_gray.png";
        var texture = new BABYLON.Texture(fpathRockn, scene);
        mat2.diffuseTexture = texture;
        mat2.diffuseTexture.uScale = 1;
        mat2.diffuseTexture.vScale = 1;
    }
    // らせん状に配置する
    let mesh01 = null, mesh02 = null;
    for (let iz = 0; iz < nmesh; iz += 1) {
        let mesh = null;
        if (mesh01 == null) {
            // 石柱（支柱）
            mesh = BABYLON.MeshBuilder.CreateCylinder("cylinder", {diameter:0.1, height:meshH, tessellation:6});
            mesh.material = mat2;
            x = r*Math.cos(rad);
            z = r*Math.sin(rad);
            mesh.position.set(x, y, z);

            // 石柱の上の玉
            // 内側に配置予定の光源による反射を外に見せるためにBACKSIDE
//            let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.1});
            let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.1, sideOrientation:BABYLON.Mesh.BACKSIDE});
            mesh2.position.set(0, meshH_+0.05, 0);
            mesh2.material = new BABYLON.StandardMaterial("mat", scene);
            mesh2.material.alpha = 0.6;
            mesh2.parent = mesh;

            mesh01 = mesh;
            mesh02 = mesh2;
        } else {
            mesh = mesh01.createInstance("");
            let mesh2 = mesh02.createInstance("");
            mesh2.position.set(0, meshH_+0.05, 0);
            mesh2.parent = mesh;
        }
        x = r*Math.cos(rad);
        z = r*Math.sin(rad);
        mesh.position.set(x, y, z);

        // 半径を大きくしつつ、回転角度を小さくしていく
        r *= 1.017;
        rad += radstep;
        radstep *= 0.992;

    }

    // 光源群
    //   石柱の上に点光源を配置
    {
        const LIGHTS = nmesh; // 1000;
        const WIDTH = 5;
        const HEIGHT = 10;
        const DEPTH = 10;

        let notSupported = false;

        const clustered = new BABYLON.ClusteredLightContainer("clustered", [], scene);
        // y = meshH+0.2, r=0.75, rad=0, radstep=0.55;
        y = meshH+0.05, r=0.75, rad=0, radstep=0.55;
        for (let i = 0; i < LIGHTS; i += 1) {
            // const position = new BABYLON.Vector3(BABYLON.Scalar.RandomRange(-DEPTH, DEPTH),
            //                                      BABYLON.Scalar.RandomRange(0, HEIGHT),
            //                                      BABYLON.Scalar.RandomRange(-WIDTH, WIDTH));
            // const position = new BABYLON.Vector3(0, meshH+0.2, 1*i);
        x = r*Math.cos(rad);
        z = r*Math.sin(rad);
            const position = new BABYLON.Vector3(x, y, z);
        r *= 1.017;
        rad += radstep;
        radstep *= 0.992;

            const pointLight = new BABYLON.PointLight("point" + i, position, scene, true);
            if (!BABYLON.ClusteredLightContainer.IsLightSupported(pointLight)) {
                notSupported = true;
                break;
            }
            pointLight.diffuse = BABYLON.Color3.Random();
            pointLight.range = 1;
//            pointLight.range = 2;
            clustered.addLight(pointLight);
        }

        if (notSupported) {
            const panel = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
            const textNOk = engine.isWebGPU ? "** This device does not meet the requirements for this demo. **" : " ** WebGL on this device doesn't meet the requirements for this demo. Try with WebGPU instead. **";
            const info = new BABYLON.GUI.TextBlock();
            info.text = textNOk;
            info.width = "100%";
            info.paddingLeft = "5px";
            info.paddingRight = "5px";
            info.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            info.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            info.color = "red";
            info.fontSize = "24px";
            info.fontStyle = "bold";
            info.textWrapping = true;
            panel.addControl(info); 
        }
    }


    return scene;
}


export var createScene_test_20 = async function () {

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.wheelDeltaPercentage = 0.01;
//    camera.useAutoRotationBehavior = true; // 自動でゆっくり回転

    // 環境光
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    light.intensity = 0.2; // 薄暗い感じに

    if (1) {
        // 地面（草地）
        let grndW=200, grndH=200;
        let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        meshGrnd.position.y = -0.02;
        if (1) {
            // const fpathFloor = "textures/grass.jpg";
            var mat = new BABYLON.StandardMaterial("mat", scene);
            var texture = new BABYLON.Texture(fpathGrass, scene);
            // mat.emissionTexture = texture;
            mat.diffuseTexture = texture;
            mat.diffuseTexture.uScale = 200;
            mat.diffuseTexture.vScale = 200;
            meshGrnd.material = mat;
        }
    }
    if (1) {
        // 地面（道路）
        let grndW=5, grndH=200;
        let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);

	var mat = new BABYLON.StandardMaterial("", scene);
        var texture = new BABYLON.RoadProceduralTexture("customtext", 512, scene);
        mat.diffuseTexture = texture;
        mat.diffuseTexture.uScale = 1;
        mat.diffuseTexture.vScale = 10;
        meshGrnd.material = mat;
    }

    // ビルを配置
    // let pathRoot = "./";
    // const fpathGlassBuilding = pathRoot + "textures/glassbuilding.jpg";
    if (1) {
        // 左側(x<=-2.5)
        let px,py,pz,sx,sy,sz, adjx=-3.1;
        pz = -10;
        while (pz < 100) {
            sx = Math.random() * 2 + 0.8;
            sy = Math.random() * 3 + 0.8; // 6 + 0.8;
            sz = Math.random() * 2 + 0.8;
            px = -sx/2+adjx;
            py = sy/2;
            pz += sz/2;
            let mesh = BABYLON.MeshBuilder.CreateBox("", { width:sx, height:sy, depth:sz }, scene);
            mesh.position.set(px, py, pz);
            let mat = new BABYLON.StandardMaterial("mat1", scene);
            let texture = new BABYLON.Texture(fpathGlassBuilding, scene);
            mat.diffuseTexture = texture;
            // mat.uOffset = Math.random() * 0.1;
            // mat.vOffset = Math.random() * 0.1;
            // let uvSize = Math.random() * 0.9;
            // mat.uScale = mat.uOffset + uvSize;
            // mat.vScale = mat.vOffset + uvSize;
            mesh.material = mat;
            pz += sz/2+0.1+Math.random();
        }
    }
    {
        // 右側(x>=2.5)
        let px,py,pz,sx,sy,sz, adjx=3.1;
        pz = -10;
        while (pz < 100) {
            sx = Math.random() * 2 + 0.8;
            sy = Math.random() * 3 + 0.8; // 6 + 0.8;
            sz = Math.random() * 2 + 0.8;
            px = sx/2+adjx;
            py = sy/2;
            pz += sz/2;
            let mesh = BABYLON.MeshBuilder.CreateBox("", { width:sx, height:sy, depth:sz }, scene);
            mesh.position.set(px, py, pz);
            let mat = new BABYLON.StandardMaterial("mat1", scene);
            let texture = new BABYLON.Texture(fpathGlassBuilding, scene);
            mat.diffuseTexture = texture;
            // mat.uOffset = Math.random() * 0.1;
            // mat.vOffset = Math.random() * 0.1;
            // let uvSize = Math.random() * 0.9;
            // mat.uScale = mat.uOffset + uvSize;
            // mat.vScale = mat.vOffset + uvSize;
            mesh.material = mat;
            pz += sz/2+0.1+Math.random();
        }
    }


    // 信号機
    let plistlist = [];
    let sigH=3, sigW=1.8, sigR=0.05, sigLR=0.1, sigLR_=sigLR/2, sigLR2=sigLR*2, sigBW=sigLR*8, adjx, adjy, adjz;
    if (1) {
        let createSignal = function(adjx, adjy, adjz) {
            // 支柱
            {
                let mesh = BABYLON.MeshBuilder.CreateBox("", { width:sigR, height:sigH, depth:sigR }, scene);
                mesh.position.set(0+adjx, sigH/2+adjy, 0+adjz);
            }
            // はり
            {
                let mesh = BABYLON.MeshBuilder.CreateBox("", { width:sigW, height:sigR, depth:sigR }, scene);
                mesh.position.set(sigW/2+adjx, sigH+adjy, 0+adjz);
            }
            // 信号機(body)
            {
                let mesh = BABYLON.MeshBuilder.CreateBox("", { width:sigBW, height:sigLR*2, depth:sigR }, scene);
                mesh.position.set(sigW-sigBW/2+adjx, sigH-sigLR+adjy, 0+adjz);
            }
            let plist = [];
            // 信号機(G)
            {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:sigLR2, sideOrientation:BABYLON.Mesh.BACKSIDE});
                mesh.position.set(sigW-sigBW/2-sigLR*2.5+adjx, sigH-sigLR+adjy, -sigLR_+adjz);
                plist.push(mesh.position.clone());
            }
            // 信号機(Y)
            {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:sigLR2, sideOrientation:BABYLON.Mesh.BACKSIDE});
                mesh.position.set(sigW-sigBW/2+adjx, sigH-sigLR+adjy, -sigLR_+adjz);
                plist.push(mesh.position.clone());
            }
            // 信号機(R)
            {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:sigLR2, sideOrientation:BABYLON.Mesh.BACKSIDE});
                mesh.position.set(sigW-sigBW/2+sigLR*2.5+adjx, sigH-sigLR+adjy, -sigLR_+adjz);
                plist.push(mesh.position.clone());
            }
            plistlist.push(plist);
        }
        for (let iz = 0; iz < 150; iz += 10) {
            adjx=-2.8, adjy=0, adjz=iz;
//            adjx=0, adjy=0, adjz=0;
            createSignal(adjx, adjy, adjz);
        }
    }

    // クラスターライトの機能確認
    {
        const clustered = new BABYLON.ClusteredLightContainer("clustered", [], scene);
        let position = new BABYLON.Vector3(-999, -999, 0);
        const pointLight = new BABYLON.PointLight("", position, scene, true);
        if (!BABYLON.ClusteredLightContainer.IsLightSupported(pointLight)) {
            const panel = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
            const textNOk = engine.isWebGPU ? "** This device does not meet the requirements for this demo. **" : " ** WebGL on this device doesn't meet the requirements for this demo. Try with WebGPU instead. **";
            const info = new BABYLON.GUI.TextBlock();
            info.text = textNOk;
            info.width = "100%";
            info.paddingLeft = "5px";
            info.paddingRight = "5px";
            info.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            info.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            info.color = "red";
            info.fontSize = "24px";
            info.fontStyle = "bold";
            info.textWrapping = true;
            panel.addControl(info); 
        }
    }

    // 信号機の光
    let allLight = [];
    const clustered = new BABYLON.ClusteredLightContainer("clustered", [], scene);
    if (1) {

        // let notSupported = false;

// console.log("plistlist.len=",plistlist.length);
        for (let plist of plistlist) {
            //for (let p of plist) {
            let llist = [];
            for (let i = 0; i < plist.length; ++i) {
                let p = plist[i];
                const pointLight = new BABYLON.PointLight("", p, scene, true);
                BABYLON.ClusteredLightContainer.IsLightSupported(pointLight);
                if (i == 0) {
                    pointLight.diffuse = new BABYLON.Color3(0/255, 150/255, 90/255);
                } else if (i == 1) {
                    pointLight.diffuse = new BABYLON.Color3(255/255, 200/255, 0/255);
                } else {
                    pointLight.diffuse = new BABYLON.Color3(232/255, 55/255, 67/255);
                }
                pointLight.range = 5;
                pointLight.intensity = 1;
                if (i != 0) {
                    pointLight.intensity = 0.1;
                }
                clustered.addLight(pointLight);
                llist.push(pointLight);
            }
            allLight.push(llist);
        }
    }

    let icount = 0, irngB=150, irngY=50, irngR=200;
    let cntB=irngB, cntY=cntB+irngY, cntR=cntY+irngR;
    scene.onBeforeRenderObservable.add(() => {
        ++icount;
        if (icount==cntB) {
            // 青->黄
            for (let llist of allLight) {
                llist[0].intensity = 0.1;
                llist[1].intensity = 1;
            }
        } else if (icount==cntY) {
            // 黄->赤
            for (let llist of allLight) {
                llist[1].intensity = 0.1;
                llist[2].intensity = 1;
            }
        } else if (icount==cntR) {
            // 赤->青
            for (let llist of allLight) {
                llist[2].intensity = 0.1;
                llist[0].intensity = 1;
            }
            icount = 0;
        }
    });

    return scene;
}


export var createScene_test_30 = async function () {

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.wheelDeltaPercentage = 0.01;
//    camera.useAutoRotationBehavior = true; // 自動でゆっくり回転

    // 環境光
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    light.intensity = 0.2; // 薄暗い感じに
//    light.intensity = 0.8; // 薄暗い感じに

    if (1) {
        // 地面（草地）
        let grndW=200, grndH=300;
        let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        meshGrnd.position.y = -0.02;
        if (1) {
            // const fpathFloor = "textures/grassn_gray.png";
            var mat = new BABYLON.StandardMaterial("mat", scene);
            var texture = new BABYLON.Texture(fpathGrassnGray, scene);
            // mat.emissionTexture = texture;
            mat.diffuseTexture = texture;
            mat.diffuseTexture.uScale = 200;
            mat.diffuseTexture.vScale = 200;
            mat.specularColor = new BABYLON.Color3(0, 0, 0); // 光沢を消す
            meshGrnd.material = mat;
        }
    }
    if (1) {
        // 地面（石畳）
        let grndW=3, grndH=300;
        let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        if (1) {
            // const fpathFloor = "textures/floor.png";
            var mat = new BABYLON.StandardMaterial("mat", scene);
            var texture = new BABYLON.Texture(fpathFloor, scene);
            // mat.emissionTexture = texture;
            mat.diffuseTexture = texture;
            mat.diffuseTexture.uScale = 5;
            mat.diffuseTexture.vScale = 200;
            mat.specularColor = new BABYLON.Color3(0, 0, 0); // 光沢を消す
            meshGrnd.material = mat;
        }
    }



    // 石灯篭（lantern
    let plist = [];
    if (1) {
        let baseR=1, baseH=0.2;
        let pillR=0.5, pillH=1;
        let platR=0.9, platH=0.4;
        let lghtR=0.5, lghtR_=lghtR/2;
        let kasaR=0.3, kasaH=0.4;
        let adjx, adjy, adjz;
        var mat = new BABYLON.StandardMaterial("mat", scene);
        {
            // const fpathRockn = "textures/rockn_gray.png";
            var texture = new BABYLON.Texture(fpathRockn, scene);
            mat.diffuseTexture = texture;
            mat.diffuseTexture.uScale = 1;
            mat.diffuseTexture.vScale = 1;
        }
        let createLantern = function(adjx, adjy, adjz) {
            // 基盤
            {
                let mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameter:baseR, height:baseH, tessellation:6});
                mesh.position.set(0+adjx, baseH/2+adjy, 0+adjz);
                mesh.material = mat;
            }
            // 支柱
            {
                let mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameter:pillR, height:pillH, tessellation:6});
                mesh.position.set(0+adjx, baseH+pillH/2+adjy, 0+adjz);
                mesh.material = mat;
            }
            // 皿
            {
                let mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:platR, diameterBottom:pillR, height:platH, tessellation:6});
                mesh.position.set(0+adjx, baseH+pillH+platH/2+adjy, 0+adjz);
                mesh.material = mat;
            }
            // 灯
            {
                let mesh = BABYLON.MeshBuilder.CreateSphere("", {diameter:lghtR, sideOrientation:BABYLON.Mesh.BACKSIDE});
                mesh.position.set(0+adjx, baseH+pillH+platH+lghtR/2+adjy, 0+adjz);
                plist.push(mesh.position.clone());
            }
            // 灯を囲うbox
            // cx20さま、感謝
            {
                let mesh2 = BABYLON.MeshBuilder.CreateBox("", {size:lghtR});
                mesh2.position.set(0+adjx, baseH+pillH+platH+lghtR/2+adjy, 0+adjz);
                // const fpathRockn = "textures/Dot.png";
                // var texture = new BABYLON.Texture(fpathRockn, scene);
                // mesh2.material = new BABYLON.StandardMaterial("mat", scene);
                // mesh2.material.diffuseTexture = texture;

                mesh2.material = new BABYLON.StandardMaterial("mat", scene);
                // let fpathRoundMask = "textures/roundMask.png";
                mesh2.material.opacityTexture = new BABYLON.Texture(fpathRoundMask, scene);
                mesh2.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST; // アルファブレンドではなくアルファテストを使用
                mesh2.material.alphaCutOff = 0.4; // この閾値以下のピクセルは完全に破棄される

            }
            // 笠
            {
                let mesh = BABYLON.MeshBuilder.CreateCylinder("", {diameterTop:kasaR, diameterBottom:platR, height:kasaH, tessellation:6});
                mesh.position.set(0+adjx, baseH+pillH+platH+lghtR+kasaH/2+adjy, 0+adjz);
                mesh.material = mat;
            }
        }
        for (let iz = 0; iz < 100; iz += 10) {
            adjx=-3, adjy=0, adjz=iz;
            createLantern(adjx, adjy, adjz);
            adjx=3, adjy=0, adjz=iz;
            createLantern(adjx, adjy, adjz);
        }
    }

    // クラスターライトの機能確認
    {
        const clustered = new BABYLON.ClusteredLightContainer("clustered", [], scene);
        let position = new BABYLON.Vector3(-999, -999, 0);
        const pointLight = new BABYLON.PointLight("", position, scene, true);
        if (!BABYLON.ClusteredLightContainer.IsLightSupported(pointLight)) {
            const panel = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
            const textNOk = engine.isWebGPU ? "** This device does not meet the requirements for this demo. **" : " ** WebGL on this device doesn't meet the requirements for this demo. Try with WebGPU instead. **";
            const info = new BABYLON.GUI.TextBlock();
            info.text = textNOk;
            info.width = "100%";
            info.paddingLeft = "5px";
            info.paddingRight = "5px";
            info.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            info.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            info.color = "red";
            info.fontSize = "24px";
            info.fontStyle = "bold";
            info.textWrapping = true;
            panel.addControl(info); 
        }
    }

    // 灯篭の灯
    let allLight = [];
    const clustered = new BABYLON.ClusteredLightContainer("clustered", [], scene);
    if (1) {
        for (let p of plist) {
            const pointLight = new BABYLON.PointLight("", p, scene, true);
            BABYLON.ClusteredLightContainer.IsLightSupported(pointLight);
            pointLight.diffuse = new BABYLON.Color3(255/255, 200/255, 0/255);
            pointLight.range = 5;
            pointLight.intensity = 0.01; // 1;
            clustered.addLight(pointLight);
            allLight.push(pointLight);
        }
    }

    // 灯のゆらぎ
    let iloop = 0, nloop = 2;
    scene.onBeforeRenderObservable.add(() => {
        if (++iloop == nloop) {
            iloop = 0;
            for (let light of allLight) {
                light.intensity = 0.8 + 0.2*Math.random();
            }
        }
    });


    return scene;
}

// // export default createScene

export var createScene = createScene_test_03; // ストーンサークル （玉の中に光源：電球っぽい/createInstance
// export var createScene = createScene_test_20; // 信号機、青→黄→赤→
// export var createScene = createScene_test_30; // 石畳と灯篭、灯にゆらぎ  .. 影はできない様子

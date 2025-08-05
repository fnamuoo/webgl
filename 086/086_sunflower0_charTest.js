// ひまわりの迷路

// for local
// const SCRIPT_URL1 = "./Maze.js";
// // for local
const SCRIPT_URL1 = "../075/Maze.js";
const wallPath = "textures/sand.jpg";
const grndPath = "textures/grass.png";
// for PlayGround
// const SCRIPT_URL1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";
// const wallPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/086/textures/sand.jpg";
// const grndPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/086/textures/grass.png";

let Maze = null;
import(SCRIPT_URL1).then((obj) => { Maze = obj; console.log("maze=",obj); });

const plantPath = "textures/himawari.png";
const plantPathW = 318;
const plantPathH = 400;

// const plantPath = "textures/flower_lavender.png";
// const plantPathW = 645;
// const plantPathH = 722;

// const plantPath = "textures/flower_ayame.png";
// const plantPathW = 308;
// const plantPathH = 450;

// const plantPath = "textures/plant_nekojarashi.png";
// const plantPathW = 387;
// const plantPathH = 400;

const R90 = Math.PI/2;


// // 多次元配列用のシャッフル
// const shuffle2 = (arr) =>
//   arr.map((value) => ({ value, random: Math.random() }))
//     .sort((a, b) => a.random - b.random)
//     .map(({ value }) => value);

var createScene = async function () {

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(2, 5,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, 100), scene);
    light.intensity = 0.2;
    var light2 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, -100), scene);
    light2.intensity = 0.2;
    var light3 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, 100), scene);
    light3.intensity = 0.2;
    var light4 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, -100), scene);
    light4.intensity = 0.2;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    let maze = null;
    // const wL=1.5, wL_=wL/2, wS=0.1, wS_=wS/2, wH=0.8, wH_=wH/2;
    const wL=1.5, wL_=wL/2, wS=0.1, wS_=wS/2, wH=0.3, wH_=wH/2;
    let mapR = 7, mapC = 9;
    let adjx, adjz, nx, nz, adjx2, adjz2, nz2;
    let pStartxo;

    matWall = new BABYLON.StandardMaterial("groundmat", scene);
    matWall.diffuseTexture = new BABYLON.Texture(wallPath, scene);


    // index座標値から座標値への変換
    let ixz2xz = function (ix, iz) {
        return [ix*wL+adjx, (nz-iz)*wL+adjz];
    }
    // 座標値からindex座標値への変換
    let xz2ixz = function (x, z) {
        return [(x -adjx)/wL, (z -adjz)/wL-1];
    }

    let stageLv=1, myHP=10;

    let stageInfo = []
    function createStaticMesh(scene, debugStage=0) {
        while (stageInfo.length > 0) {
            let [mesh,agg] = stageInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        let meshes = [];
        // mapR = 9 + Math.floor(Math.log(stageLv+1));
        // mapC = mapR; // 9 + Math.floor(Math.log(stageLv+1));
        mapR = mapC = 21;
        maze = new Maze.Maze1(mapR, mapC);
        maze.create(21);
        // maze.resetStartGoal();
        maze.setStartGoal([mapC-1, 11], [0, 11]);
        maze.dbgPrintMap();

        // if (debugStage == 1) {
        //     let mazedata = [
        //         '#########',
        //         '#S  #   #',
        //         '# # # # #',
        //         '#       #',
        //         '### ### #',
        //         '#      G#',
        //         '#########',
        //     ];
        //     maze = new Maze.Maze1();
        //     maze.create_from(mazedata);
        //     maze.dbgPrintMap();
        // }

        adjx=-(maze.ncol_-1)*wL_, adjz=-(maze.nrow_+1)*wL_, nx=maze.ncol_, nz=maze.nrow_;
        let x,y=wH_,z, ix,iz;

        let ground = BABYLON.MeshBuilder.CreateGround("ground", {width:(nx+4)*wL, height:(nz+4)*wL}, scene);
        let agg = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
	ground.material = new BABYLON.StandardMaterial('mat', scene);
	// ground.material.diffuseColor = BABYLON.Color3.Black();
	// ground.material.alpha = 0.7;
        matGrnd = new BABYLON.StandardMaterial("groundmat", scene);
        matGrnd.diffuseTexture = new BABYLON.Texture(grndPath, scene);
	ground.material = matGrnd;
        meshes.push(ground);
        stageInfo.push([ground, agg]);

        [iz, ix] = maze.pStart_;
        [x,z] = ixz2xz(ix,iz);
        pStart = new BABYLON.Vector3(x, y, z);

        // スタート地点のパネル
        {
            [iz, ix] = maze.pStart_;
            let mesh = BABYLON.MeshBuilder.CreatePlane("plnST", {width:wL, height:wL}, scene);
            mesh.position = new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz);
            mesh.rotation = new BABYLON.Vector3(Math.PI/2, 0, 0);
	    mesh.material = new BABYLON.StandardMaterial('mat', scene);
	    mesh.material.diffuseColor = BABYLON.Color3.Blue();
	    // mesh.material.alpha = 0.7;
            stageInfo.push([mesh,null]);
        }
        // ゴール地点のパネル
        for (let [iz,ix] of maze.pGoalList_) {
            let mesh = BABYLON.MeshBuilder.CreatePlane("plnST", {width:wL, height:wL}, scene);
            mesh.position = new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz);
            mesh.rotation = new BABYLON.Vector3(Math.PI/2, 0, 0);
	    mesh.material = new BABYLON.StandardMaterial('mat', scene);
	    mesh.material.diffuseColor = BABYLON.Color3.Red();
	    // mesh.material.alpha = 0.7;
            stageInfo.push([mesh,null]);
        }

        // 最短経路
        {
            maze.seekPath2(); // 最短経路をもとめる
            let plist = [];
            for (let idx of maze.path2_) {
                [iz,ix] = maze.idx2rc(idx);
                plist.push(new BABYLON.Vector3(ix*wL+adjx, 0.01, (nz-iz)*wL+adjz));
            }
            let line = BABYLON.MeshBuilder.CreateDashedLines("arc", {points: plist, dashSize:1, gapSize:1});
            line.color = BABYLON.Color3.Gray();
            stageInfo.push([line,null]);
        }

        // 壁
        for (let iz = 0; iz < nz; ++iz) {
            z = (nz-iz)*wL+adjz;
            for (let ix = 0; ix < nx; ++ix) {
                if ((maze.pStart_[0]==iz && (maze.pStart_[1]==ix)) || maze.isGoal(iz,ix)) {
                    continue;
                }
                x = ix*wL+adjx;
                if (maze.data_[iz][ix]) { // 壁
                    let mesh = BABYLON.MeshBuilder.CreateBox("wallD", { width:wL, height:wH, depth:wL }, scene);
                    mesh.position = new BABYLON.Vector3(x, y, z);
                    mesh.material = matWall;
                    let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                }
            }
        }

        // // 迷路の上のフタ（ボールが溢れないように
        // {
        //     let mesh = BABYLON.MeshBuilder.CreateBox("cover", { width:maze.ncol_*wL, height:wH, depth:maze.nrow_*wL }, scene);
        //     mesh.position = new BABYLON.Vector3(0, wH_*3, 0);
	//     mesh.material = new BABYLON.StandardMaterial('mat', scene);
	//     mesh.material.alpha = 0.01;
        //     let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
        //     meshes.push(mesh);
        //     stageInfo.push([mesh,agg]);
        // }

        // ----------------------------------------
        // 植樹(4
        let nMesh = 10000, nCapa = nMesh+1;
        const spriteManagerTrees = new BABYLON.SpriteManager("treesManager", plantPath, nCapa, {width: plantPathW, height: plantPathH});

        // let tree = new BABYLON.Sprite("tree", spriteManagerTrees);
        // tree.width = 15;
        // tree.height = 30;
        // tree.position.y = yposi(0,0)+tree.height/2;

        let size_ = wL * mapR / 2;
        let rng = size_, rngLimit = size_*0.2;
        y=wH;
        while (nMesh > 0) {
            x = BABYLON.Scalar.RandomRange(-rng, rng);
            z = BABYLON.Scalar.RandomRange(-rng, rng);
            ix = Math.floor((x+size_) / wL);
            iz = Math.floor((-z+size_) / wL);
            if (!maze.isWall_s(iz,ix)) {
                continue;
            }
            if ((maze.pStart_[0]==iz && (maze.pStart_[1]==ix)) || maze.isGoal(iz,ix)) {
                continue;
            }
            // if (Math.abs(x) < rngLimit && Math.abs(z) < rngLimit) {
            //     continue;
            // }
            let tree = new BABYLON.Sprite("tree", spriteManagerTrees);
            tree.width = BABYLON.Scalar.RandomRange(0.5, 0.7);
            tree.height = tree.width*2;
            tree.position = new BABYLON.Vector3(x,y+tree.height/2,z);
            --nMesh;
        }


        return meshes;
    }

    // let meshes = createStaticMesh(scene, 1); // fordebug
    let meshes = createStaticMesh(scene);



    // let popBubble = function() {
    //     let bubbleR = 0.5;
    //     let mesh = BABYLON.MeshBuilder.CreateSphere("bubble", { diameter: bubbleR}, scene);
    //     mesh.position = pStart.clone();
    //     mesh.position.x += Math.random()-0.5;
    //     mesh.position.y += (Math.random()-0.5)*0.1;
    //     mesh.position.z += Math.random()-0.5;
    //     let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.1, restitution:0.05}, scene);
    //     stageInfo.push([mesh,agg]);
    // }

    // let popBubble2 = function(iH) {
    //     let bubbleR = 0.5;
    //     let mesh = BABYLON.MeshBuilder.CreateSphere("bubble", { diameter: bubbleR}, scene);
    //     mesh.position = pStart.clone();
    //     mesh.position.x += Math.random()-0.5;
    //     mesh.position.y += (Math.random()-0.5)*0.1;
    //     mesh.position.z += Math.random()-0.5;
    //     mesh.material = new BABYLON.StandardMaterial('mat', scene);
    //     mesh.material.diffuseColor = BABYLON.Color3.FromHSV(iH,1,1);
    //     let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.1, restitution:0.05}, scene);
    //     stageInfo.push([mesh,agg]);
    // }


    if (1) {
        // "textures/gahag-0083896725-1.png";
        // const charPath = "textures/pipo-charachip001.png";
        const charPath = "textures/pipo-charachip007.png";
        // const charPath = "textures/pipo-charachip007a.png";
        // const charPath = "textures/pipo-charachip007b.png";
        // const charPath = "textures/pipo-charachip008.png";
        // const charPath = "textures/pipo-charachip008a.png";
        // const charPath = "textures/pipo-charachip008b.png";

        var mat = new BABYLON.StandardMaterial("mat", scene);
        var texture = new BABYLON.Texture(charPath, scene);
        mat.diffuseTexture = texture;
	mat.diffuseTexture.hasAlpha = true;
	mat.emissiveColor = new BABYLON.Color3.White();
        var mx = 3, my = 4;
        var faceUV1 = new Array(6);
        var faceUV2 = new Array(6);
        var faceUV3 = new Array(6);
        let faceUVanm = new Array(3);
        faceUVanm[0] = faceUV1;
        faceUVanm[1] = faceUV2;
        faceUVanm[2] = faceUV3;
        for (var i = 0; i < 6; i++) {
            faceUV1[i] = new BABYLON.Vector4(0, 0, 0, 0);
            faceUV2[i] = new BABYLON.Vector4(0, 0, 0, 0);
            faceUV3[i] = new BABYLON.Vector4(0, 0, 0, 0);
        }
        faceUV1[0] = new BABYLON.Vector4(0, 3/my, 1/mx, 4/my);
        faceUV1[1] = new BABYLON.Vector4(0, 0/my, 1/mx, 1/my);
        faceUV1[3] = new BABYLON.Vector4(0, 2/my, 1/mx, 3/my);
        faceUV1[2] = new BABYLON.Vector4(0, 1/my, 1/mx, 2/my);

        var options = {
            size: 3,
            // width: 0.5,
            // depth: 0.5,
            // height: 1,
            faceUV: faceUV1,
            wrap: true
        };

        let myBox;
        myBox = BABYLON.MeshBuilder.CreateBox('box', options, scene);
        myBox.material = mat;
        myBox.position.y = 3;
    }

    if (0) {
        const pathChar1 = "textures/pipo-charachip007.png";

        // Create a sprite manager
        const spriteMngChar1 = new BABYLON.SpriteManager("playerManager", pathChar1, 3, 32);
        const playerF = new BABYLON.Sprite("char1", spriteMngChar1);
        playerF.playAnimation(0, 2, true, 200); // front
        const playerB = new BABYLON.Sprite("char1", spriteMngChar1);
        playerB.playAnimation(3, 5, true, 200);
        playerB.position.z += -0.01;
        // playerB.rotate.y = R90;
    }

    if (1) {
        // "textures/gahag-0083896725-1.png";
        // const charPath = "textures/pipo-charachip001.png";
        const charPath = "textures/pipo-charachip007.png";
        // const charPath = "textures/pipo-charachip007a.png";
        // const charPath = "textures/pipo-charachip007b.png";
        // const charPath = "textures/pipo-charachip008.png";
        // const charPath = "textures/pipo-charachip008a.png";
        // const charPath = "textures/pipo-charachip008b.png";
        var mx = 3, my = 4;


	const matFB = new BABYLON.StandardMaterial("");
	matFB.diffuseTexture = new BABYLON.Texture(charPath);
	matFB.diffuseTexture.hasAlpha = true;
	matFB.emissiveColor = new BABYLON.Color3.White();
	const uvF = new BABYLON.Vector4(0, 0/my, 1/mx, 1/my); // B
        const uvB = new BABYLON.Vector4(0, 3/my, 1/mx, 4/my); // F
        // const uvF = new BABYLON.Vector4(0, 1/my, 1/mx, 2/my); // R
	// const uvB = new BABYLON.Vector4(1/mx, 2/my, 0, 3/my); // L
        const planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {size:3, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        planeFB.material = matFB;
        planeFB.position.y = 6;

	const matLR = new BABYLON.StandardMaterial("");
	matLR.diffuseTexture = new BABYLON.Texture(charPath);
	matLR.diffuseTexture.hasAlpha = true;
	matLR.emissiveColor = new BABYLON.Color3.White();
        // const f = new BABYLON.Vector4(0, 3/my, 1/mx, 4/my); // F
	// const b = new BABYLON.Vector4(0, 0/my, 1/mx, 1/my); // B
	const uvL = new BABYLON.Vector4(0, 2/my, 1/mx, 3/my); // L
        const uvR = new BABYLON.Vector4(1/mx, 1/my, 0, 2/my); // R
        const planeLR = BABYLON.MeshBuilder.CreatePlane("plane", {size:3, frontUVs: uvR, backUVs: uvL, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        planeLR.material = matLR;
        planeLR.position.y = 6;
        // planeLR.rotation = R90;
        // planeLR.rotate(0, R90, 0);
        // planeLR.rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
        planeLR.rotation = new BABYLON.Vector3(0, R90, 0);

    }


    // let icool = 0, ncool = 20, iClr = 0, nClr = 2;
    // let iH = 0, nH = 360;
    // scene.onBeforeRenderObservable.add(() => {
    //     // 時間差でアニメさせる仕組み
    //     if (icool > 0) {
    //         --icool;
    //     } else {
    //         icool = ncool;
    //         iClr =(iClr+1)%nClr;
    //     }
    //     // // 時間差でポップさせる仕組み
    //     // if (icool > 0) {
    //     //     --icool;
    //     // } else {
    //     //     icool = ncool;
    //     //     popBubble2(iH);
    //     //     if (++iClr > nClr) {
    //     //         iClr = 0;
    //     //         iH = (iH+1) % nH;
    //     //     }
    //     // }
    // });

    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key === ' ') {
                iH = 0;
                meshes = createStaticMesh(scene);

            } else if (kbInfo.event.key === 'n' || 
                       kbInfo.event.key === 'Enter') {
                iH = 0;
                stageLv *= 10;
                meshes = createStaticMesh(scene);

            } else if (kbInfo.event.key === 'h') {
                //   キー操作(h)で表示のon/offを切り替え
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            break;
        }
    });


    // var ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    // var panel = createGUIPanel(ui);
    // addText(scene, panel, (bodiesCounter) => {
    //     let stext = 'push SPC-key to start';
    //     if (stageLv > 0) {
    //         stext = 'StageLevel:'+stageLv;
    //     }

    //     bodiesCounter.text = stext;
    // });

    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "80px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n(Enter/N): Next Stage\n(Space): Reset Stage\nH: show/hide this message";
    text1.color = "white";
    text1.width = "200px";
    text1.fontSize = 12;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    // guiLabelRect.isVisible = false;

    return scene;
};

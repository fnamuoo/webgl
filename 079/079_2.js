// 密閉空間内のボールの拡散の様子(2)

// for local
const SCRIPT_URL1 = "../075/Maze.js";
// for PlayGround
// const SCRIPT_URL1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";
let Maze = null;
import(SCRIPT_URL1).then((obj) => { Maze = obj; console.log("maze=",obj); });

// 多次元配列用のシャッフル
const shuffle2 = (arr) =>
  arr.map((value) => ({ value, random: Math.random() }))
    .sort((a, b) => a.random - b.random)
    .map(({ value }) => value);

var createScene = function () {

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
    const wL=1.5, wL_=wL/2, wS=0.1, wS_=wS/2, wH=0.8, wH_=wH/2;
    let mapR = 7, mapC = 9;
    let adjx, adjz, nx, nz, adjx2, adjz2, nz2;
    let pStartxo;

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
        mapR = 7 + Math.floor(Math.log(stageLv+1));
        mapC = 9 + Math.floor(Math.log(stageLv+1));
        maze = new Maze.Maze1(mapR, mapC);
        maze.create(21);
        maze.resetStartGoal();
        maze.dbgPrintMap();

        if (debugStage == 1) {
            let mazedata = [
                '#########',
                '#S  #   #',
                '# # # # #',
                '#       #',
                '### ### #',
                '#      G#',
                '#########',
            ];
            maze = new Maze.Maze1();
            maze.create_from(mazedata);
            maze.dbgPrintMap();

        } else if (debugStage == 2) {
            let mazedata_ = [
            ];

            let mazedata = [
                '###########',
                '#S      # #',
                '####### # #',
                '#     #   #',
                '# ### ### #',
                '#       # #',
                '# # # ### #',
                '#G  #     #',
                '###########',
            ];
            maze = new Maze.Maze1();
            maze.create_from(mazedata);
            maze.dbgPrintMap();
        }

        adjx=-(maze.ncol_-1)*wL_, adjz=-(maze.nrow_+1)*wL_, nx=maze.ncol_, nz=maze.nrow_;
        let x,y=wH_,z, ix,iz;

        let ground = BABYLON.MeshBuilder.CreateGround("ground", {width:(nx+4)*wL, height:(nz+4)*wL}, scene);
        let agg = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
	ground.material = new BABYLON.StandardMaterial('mat', scene);
	ground.material.diffuseColor = BABYLON.Color3.Black();
	ground.material.alpha = 0.7;
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
                x = ix*wL+adjx;
                if (maze.data_[iz][ix]) { // 壁
                    let mesh = BABYLON.MeshBuilder.CreateBox("wallD", { width:wL, height:wH, depth:wL }, scene);
                    mesh.position = new BABYLON.Vector3(x, y, z);
                    let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
                    meshes.push(mesh);
                    stageInfo.push([mesh,agg]);
                }
            }
        }

        // 迷路の上のフタ（ボールが溢れないように
        {
            let mesh = BABYLON.MeshBuilder.CreateBox("cover", { width:maze.ncol_*wL, height:wH, depth:maze.nrow_*wL }, scene);
            mesh.position = new BABYLON.Vector3(0, wH_*3, 0);
	    mesh.material = new BABYLON.StandardMaterial('mat', scene);
	    mesh.material.alpha = 0.01;
            let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, { mass: 0.0, restitution:0.05}, scene);
            meshes.push(mesh);
            stageInfo.push([mesh,agg]);
        }

        return meshes;
    }

    let meshes = createStaticMesh(scene, 1); // fordebug

    let popBubble = function() {
        let bubbleR = 0.5;
        let mesh = BABYLON.MeshBuilder.CreateSphere("bubble", { diameter: bubbleR}, scene);
        mesh.position = pStart.clone();
        mesh.position.x += Math.random()-0.5;
        mesh.position.y += (Math.random()-0.5)*0.1;
        mesh.position.z += Math.random()-0.5;
        let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.1, restitution:0.05}, scene);
        stageInfo.push([mesh,agg]);
    }

    let popBubble2 = function(iH) {
        let bubbleR = 0.5;
        let mesh = BABYLON.MeshBuilder.CreateSphere("bubble", { diameter: bubbleR}, scene);
        mesh.position = pStart.clone();
        mesh.position.x += Math.random()-0.5;
        mesh.position.y += (Math.random()-0.5)*0.1;
        mesh.position.z += Math.random()-0.5;
	mesh.material = new BABYLON.StandardMaterial('mat', scene);
	mesh.material.diffuseColor = BABYLON.Color3.FromHSV(iH,1,1);

        let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 0.1, restitution:0.05}, scene);
        stageInfo.push([mesh,agg]);
    }

    let icool = 0, ncool = 20, iClr = 0, nClr = 2;
    let iH = 0, nH = 360;
    scene.onBeforeRenderObservable.add(() => {
        // 時間差でポップさせる仕組み
        if (icool > 0) {
            --icool;
        } else {
            icool = ncool;
            popBubble2(iH);
            if (++iClr > nClr) {
                iClr = 0;
                iH = (iH+1) % nH;
            }
        }
    });

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


    var ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var panel = createGUIPanel(ui);
    addText(scene, panel, (bodiesCounter) => {
        let stext = 'push SPC-key to start';
        if (stageLv > 0) {
            stext = 'StageLevel:'+stageLv;
        }

        bodiesCounter.text = stext;
    });

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

function createGUIPanel(gui) {
    var panel = new BABYLON.GUI.StackPanel();
    panel.spacing = 5;
    gui.addControl(panel);
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.paddingLeftInPixels = 10;
    panel.paddingTopInPixels = 10;
    return panel;
}

var bodiesCounter;
function addText(scene, parent, updateFn, initialText) {
    bodiesCounter = new BABYLON.GUI.TextBlock("bodiesCounter", initialText);
    bodiesCounter.color = "white";
    bodiesCounter.resizeToFit = true;
    bodiesCounter.fontSize = "20px";
    parent.addControl(bodiesCounter);
    if (updateFn) {
        scene.onAfterRenderObservable.add(() => updateFn(bodiesCounter));
    }
    return bodiesCounter;
}

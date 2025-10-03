// Babylon.js：ブロック消しゲーム

// ドローン（モード２）左：上昇下降・左右旋回　右スティック：前後移動・左右移動
// 
//  - カーソル上下   .. 前後移動
//  - カーソル右左   .. 左右移動
//  - (w,s)          .. 上昇下降
//  - (a,d)          .. 左右旋回
//  - space          .. 姿勢をリセット
//  - n/p            .. ステージの切り替え
//  - t              .. 武装／アニメーションの切り替え
//  - c              .. カメラの切り替え（俯瞰／自機視点）
//  - h              .. ヘルプ表示
//  - 1              .. クリアステージの表示／ステージ切り替え


// --------------------------------------------

const pathPanelList = [[533, 689, "textures/einstein.png"], // アインシュタイン
                       [800, 719, "textures/monogatari_inrou_mitokoumon.png"], // 水戸黄門
                       [648, 800, "textures/nigaoe_kanu.png"],  // 関羽
                       [1013, 1177, "textures/nigaoe_napoleon_horse.png"], // ナポレオン
                       [800, 800, "textures/nigaoe_nasunoyoichi.png"],  // 那須与一
                       [711, 800, "textures/nigaoe_sakamoto_ryouma.png"],  // 坂本龍馬
                       [724, 800, "textures/nigaoe_shikoutei.png"],  // 秦の始皇帝
                       [778, 772, "textures/nigaoe_syokatsu_koumei.png"],  // 諸葛孔明
                       [658, 800, "textures/nigaoe_yagyuu_juubee.png"],  // 柳生十兵衛
                       [599, 696, "textures/takeda_shingen.png"],  // 武田信玄
                      ]
let myTextPath = "../096/textures/pipo-charachip007_.png"; // 男の子
let iconTrophyPath="textures/trophy.png";

// --------------------------------------------
// for PlayGround

// const pathPanelList = [[533, 689, "https://raw.githubusercontent.com/fnamuoo/webgl/main/097/textures/einstein.png"], // アインシュタイン
//                        [800, 719, "https://raw.githubusercontent.com/fnamuoo/webgl/main/097/textures/monogatari_inrou_mitokoumon.png"], // 水戸黄門
//                        [648, 800, "https://raw.githubusercontent.com/fnamuoo/webgl/main/097/textures/nigaoe_kanu.png"],  // 関羽
//                        [1013, 1177, "https://raw.githubusercontent.com/fnamuoo/webgl/main/097/textures/nigaoe_napoleon_horse.png"], // ナポレオン
//                        [800, 800, "https://raw.githubusercontent.com/fnamuoo/webgl/main/097/textures/nigaoe_nasunoyoichi.png"],  // 那須与一
//                        [711, 800, "https://raw.githubusercontent.com/fnamuoo/webgl/main/097/textures/nigaoe_sakamoto_ryouma.png"],  // 坂本龍馬
//                        [724, 800, "https://raw.githubusercontent.com/fnamuoo/webgl/main/097/textures/nigaoe_shikoutei.png"],  // 秦の始皇帝
//                        [778, 772, "https://raw.githubusercontent.com/fnamuoo/webgl/main/097/textures/nigaoe_syokatsu_koumei.png"],  // 諸葛孔明
//                        [658, 800, "https://raw.githubusercontent.com/fnamuoo/webgl/main/097/textures/nigaoe_yagyuu_juubee.png"],  // 柳生十兵衛
//                        [599, 696, "https://raw.githubusercontent.com/fnamuoo/webgl/main/097/textures/takeda_shingen.png"],  // 武田信玄
//                       ]
// let myTextPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main//096/textures/pipo-charachip007_.png"; // 男の子
// let iconTrophyPath="https://raw.githubusercontent.com/fnamuoo/webgl/main/097/textures/trophy.png";


// ======================================================================

const R30 = Math.PI/6;
const R45 = Math.PI/4;
const R90 = Math.PI/2;
const R180 = Math.PI;
const R225 = Math.PI*5/4;
const R270 = Math.PI*3/2;
const R360 = Math.PI*2;

var createScene = async function () {
    var scene = new BABYLON.Scene(engine);

    let camera = null;
    let icamera=0, ncamera=4;
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}

        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(5, 20,-10), scene);
            camera.setTarget(myMesh.position);
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
        }
        if (icamera == 1) {
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 180;
            camera.radius = 0.5;
            camera.heightOffset = 0.1;
            camera.cameraAcceleration = 0.2;
            camera.maxCameraSpeed = 30;
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (icamera == 2) {
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 180;
            camera.radius = 10;
            camera.heightOffset = 3;
            camera.cameraAcceleration = 0.05;
            camera.maxCameraSpeed = 30;
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (icamera == 3) {
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 180;
            camera.radius = 3;
            camera.heightOffset = 50;
            camera.cameraAcceleration = 0.05;
            camera.maxCameraSpeed = 1;
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (icamera >= 1) {
            camera.lockedTarget = myMesh;
        }
    }
    // changeCamera(icamera);

    const physicsPlugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), physicsPlugin);


    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, 100), scene);
    var light2 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, 100), scene);
    var light3 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(100, 100, -100), scene);
    var light4 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(-100, 100, -100), scene);
    light1.intensity = 0.3;
    light2.intensity = 0.3;
    light3.intensity = 0.3;
    light4.intensity = 0.3;

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


    // ----------------------------------------
    let istage = 0, nstage = 10;
    let trgMeshInfo = {};
    let cvrMesh = null, cvrImgData = [], cvrDyTxt = null, cvrW,cvrH, cvrW_2,cvrH_2, cvrRate=1;

    let SPS=null, spsMesh=null, spsRest=0;

    var createStage = function(istage) {
        if (Object.keys(trgMeshInfo).length > 0) {
            for (let key in trgMeshInfo) {
                let mesh = trgMeshInfo[key];
                if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
                mesh.dispose();
            }
            trgMeshInfo = {};
        }

        let picr=10;

        if (SPS!=null) { SPS.dispose() }
        SPS = new BABYLON.SolidParticleSystem('SPS', scene, {particleIntersection:true});
        let istage_=istage%5;
        if(istage_==0) {
            // 横置＋整列配置
            picr=10;
            let box1 = BABYLON.MeshBuilder.CreateBox("b", {width: 1, height:1, depth:1}, scene);
            let [sw, sh, fpath] = pathPanelList[istage];
            sw=Math.ceil(sw/picr); sh=Math.ceil(sh/picr);
            let panel1 = BABYLON.MeshBuilder.CreatePlane("panel_1", {width:sw, height:sh}, scene);
            panel1.position = new BABYLON.Vector3(0, 1, 0);
            panel1.rotation = new BABYLON.Vector3(R90, 0, 0);
            panel1.material = new BABYLON.StandardMaterial("mat1org", scene);
            panel1.material.diffuseTexture = new BABYLON.Texture(fpath, scene);
            panel1.material.diffuseTexture.hasAlpha = true;
	    panel1.material.emissiveColor = new BABYLON.Color3.White();
            trgMeshInfo[panel1.id] = panel1;
            let particleNb=sw*sh;
            SPS.addShape(box1, particleNb);                
            spsMesh = SPS.buildMesh(); // finally builds and displays the SPS mesh
            SPS.initParticles = function() {
                let sw_ = sw/2, sh_ = sh/2;
                for (let i = 0; i < SPS.nbParticles; ++i) {
                    const p = SPS.particles[i];
                    let ix = i % sw, iy = 1, iz=Math.floor(i/sw);
      	            p.position.x = ix*1.0-sw_;
                    p.position.y = iy;
                    p.position.z = iz*1.0-sh_;
                    p.color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                }
            };
            box1.dispose();
        }

        if(istage_==1) {
            // 横置＋ランダム配置
            picr=10;
            let box1 = BABYLON.MeshBuilder.CreateBox("b", {width: 1, height:1, depth:1}, scene);
            let [sw, sh, fpath] = pathPanelList[istage];
            sw=Math.ceil(sw/picr); sh=Math.ceil(sh/picr);
            let panel1 = BABYLON.MeshBuilder.CreatePlane("panel_1", {width:sw, height:sh}, scene);
            panel1.position = new BABYLON.Vector3(0, 1, 0);
            panel1.rotation = new BABYLON.Vector3(R90, 0, 0);
            panel1.material = new BABYLON.StandardMaterial("mat1org", scene);
            panel1.material.diffuseTexture = new BABYLON.Texture(fpath, scene);
            panel1.material.diffuseTexture.hasAlpha = true;
	    panel1.material.emissiveColor = new BABYLON.Color3.White();
            trgMeshInfo[panel1.id] = panel1;
            let particleNb=sw*sh;
            SPS.addShape(box1, particleNb);                
            spsMesh = SPS.buildMesh(); // finally builds and displays the SPS mesh
            SPS.initParticles = function() {
                let sw_ = sw/2, sh_ = sh/2;
                for (let i = 0; i < SPS.nbParticles; ++i) {
                    const p = SPS.particles[i];
      	            p.position.x = BABYLON.Scalar.RandomRange(-sw_, sw_);
                    p.position.y = BABYLON.Scalar.RandomRange(1, 3);
                    p.position.z = BABYLON.Scalar.RandomRange(-sh_, sh_);
                    p.color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                }
            };
            box1.dispose();
        }

        if(istage_==2) {
            // 横置＋波上配置
            picr=10;
            let box1 = BABYLON.MeshBuilder.CreateBox("b", {width: 1, height:1, depth:1}, scene);
            let [sw, sh, fpath] = pathPanelList[istage];
            sw=Math.ceil(sw/picr); sh=Math.ceil(sh/picr);
            let panel1 = BABYLON.MeshBuilder.CreatePlane("panel_1", {width:sw, height:sh}, scene);
            panel1.position = new BABYLON.Vector3(0, 1, 0);
            panel1.rotation = new BABYLON.Vector3(R90, 0, 0);
            panel1.material = new BABYLON.StandardMaterial("mat1org", scene);
            panel1.material.diffuseTexture = new BABYLON.Texture(fpath, scene);
            panel1.material.diffuseTexture.hasAlpha = true;
	    panel1.material.emissiveColor = new BABYLON.Color3.White();
            trgMeshInfo[panel1.id] = panel1;
            let particleNb=sw*sh;
            SPS.addShape(box1, particleNb);                
            spsMesh = SPS.buildMesh(); // finally builds and displays the SPS mesh
            SPS.initParticles = function() {
                let sw_ = sw/2, sh_ = sh/2;
                for (let i = 0; i < SPS.nbParticles; ++i) {
                    const p = SPS.particles[i];
                    let ix = i % sw, iz=Math.floor(i/sw), iy = Math.sin(ix/5+iz/5)+1.7;
      	            p.position.x = ix*1.0-sw_;
                    p.position.y = iy;
                    p.position.z = iz*1.0-sh_;
                    p.color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                }
            };
            box1.dispose();
        }

        if(istage_==3) {
            // 縦
            picr=10;
            let box1 = BABYLON.MeshBuilder.CreateBox("b", {width: 1, height:1, depth:1}, scene);
            let whList = [];
                let [sw, sh, fpath] = pathPanelList[istage];
                sw=Math.ceil(sw/picr); sh=Math.ceil(sh/picr);
                let panel1 = BABYLON.MeshBuilder.CreatePlane("panel_2", {width:sw, height:sh}, scene);
                panel1.position = new BABYLON.Vector3(0, sh/2+1, 0);
                panel1.material = new BABYLON.StandardMaterial("mat1org", scene);
                panel1.material.diffuseTexture = new BABYLON.Texture(fpath, scene);
                panel1.material.diffuseTexture.hasAlpha = true;
	        panel1.material.emissiveColor = new BABYLON.Color3.White();
                trgMeshInfo[panel1.id] = panel1;
                let particleNb=sw*sh;
                SPS.addShape(box1, particleNb);                
            spsMesh = SPS.buildMesh();
            SPS.initParticles = function() {
                let i=0;
                let sw_ = sw/2, sh_ = sh/2, nj=sw*sh, jz=0;
                for (let jy=0; jy<sh; ++jy) {
                    for (let jx=0; jx<sw; ++jx) {
                        const p = SPS.particles[i];
                        ++i;
      	                p.position.x = jx-sw_;
                        p.position.y = jy+0.5;
                        p.position.z = jz;
                        p.color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                    }
                }
            };
            box1.dispose();
        }

        if(istage_==4) {
            // 縦
            picr=10;
            let box1 = BABYLON.MeshBuilder.CreateBox("b", {width: 1, height:1, depth:1}, scene);
            let whList = [];
            let [sw, sh, fpath] = pathPanelList[istage];
            sw=Math.ceil(sw/picr); sh=Math.ceil(sh/picr);
            let panel1 = BABYLON.MeshBuilder.CreatePlane("panel_2", {width:sw, height:sh}, scene);
            let s = sh*1.414/4
            panel1.position = new BABYLON.Vector3(0, s, s);
            panel1.rotation = new BABYLON.Vector3(R45, 0, 0);
            panel1.material = new BABYLON.StandardMaterial("mat1org", scene);
            panel1.material.diffuseTexture = new BABYLON.Texture(fpath, scene);
            panel1.material.diffuseTexture.hasAlpha = true;
	    panel1.material.emissiveColor = new BABYLON.Color3.White();
            trgMeshInfo[panel1.id] = panel1;
            let particleNb=sw*sh;
            SPS.addShape(box1, particleNb);                
            spsMesh = SPS.buildMesh();
            SPS.initParticles = function() {
                let i=0;
                let sw_ = sw/2, sh_ = sh/2, nj=sw*sh, jz=0;
                for (let jy=0; jy<sh; ++jy) {
                    for (let jx=0; jx<sw; ++jx) {
                        const p = SPS.particles[i];
                        ++i;
      	                p.position.x = jx-sw_;
                        p.position.y = jy+0.5;
                        p.position.z = jz+jy+Math.random()*2-1;
                        p.color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                    }
                }
            };
            box1.dispose();
        }

        // カメラが移動するとSPSの全メッシュが消えることがあるので下記を実施
        SPS.isAlwaysVisible = true;
        SPS.computeBoundingBox = true;

        SPS.initParticles();
        SPS.setParticles();
        spsRest = SPS.nbParticles;

        SPS.updateParticle = function(particle) {
            if (particle==null) {
                return;
            }
            if (particle.isVisible) {
                if (particle.intersectsMesh(myMesh) || (wpMesh && particle.intersectsMesh(wpMesh))) {
                    particle.isVisible = false;
                    --spsRest;
                    if (spsRest<=0){
                        clearStageList[istage]=true;
                        istage = (istage+1)%nstage;
                        createStage(istage);
                    }
                }
                if (wpMeshList.length>0) {
                    for (let wpm of wpMeshList) {
                        if (particle.intersectsMesh(wpm)) {
                            particle.isVisible = false;
                            --spsRest;
                            if (spsRest==0){
                                clearStageList[istage]=true;
                                istage = (istage+1)%nstage;
                                createStage(istage);
                            }
                        }
                    }
                }
            }
        }
    }

    let iloop = 0;
    scene.onAfterRenderObservable.add(() => {
        // SPS.setParticles();
        // 気持ち、頻繁にチェックしないように（負荷をかけすぎないように）
        if (++iloop&4) {
            iloop = 0;
            // 少々強引だが、なぜか setParticles でまれにエラー(nullを検出)になるので無視する
            try {
                SPS.setParticles();
            } catch(e) {
            }
        }
    })

    // ----------------------------------------

    // 自機
    let myMesh, wpMesh=null, wpMeshList=[];
    let imesh=10, nmesh=12;
    var addCharPanel = function(charPath, myMesh) {
        let mx = 3, my = 4;
	const matFB = new BABYLON.StandardMaterial("");
	matFB.diffuseTexture = new BABYLON.Texture(charPath);
	matFB.diffuseTexture.hasAlpha = true;
	matFB.emissiveColor = new BABYLON.Color3.White();
	const uvF = new BABYLON.Vector4(0, 0/my, 1/mx, 1/my); // B
        const uvB = new BABYLON.Vector4(0, 3/my, 1/mx, 4/my); // F
        const planeFB = BABYLON.MeshBuilder.CreatePlane("plane", {size:2, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
        planeFB.position.y = 1.2;
        planeFB.material = matFB;
        planeFB.parent = myMesh;
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
        return myMesh;
    }

    var createMyMesh = function(imesh) {
        let p = new BABYLON.Vector3(0, 1, 0);
        let q = new BABYLON.Quaternion();
        if (myMesh!=null) {p=myMesh.position.clone(); q=myMesh.rotationQuaternion.clone(); myMesh.dispose()}
        if (wpMesh!=null) {wpMesh.dispose();wpMesh=null;}
        if (wpMeshList.length>0) { for (let m of wpMeshList) {m.dispose();} wpMeshList=[]; }

        actMyMesh = function() {
            console.log("actMyMehs . def");
        }

        if (imesh==0) {
            // 四角ボード
            let sx=1, sy=0.2, sz=2;
            myMesh = BABYLON.MeshBuilder.CreateBox("my", { width: sx, height: sy, depth: sz }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myMesh._agg = myAgg;
            let charPath = myTextPath;
            myMesh = addCharPanel(charPath, myMesh);
            myMesh.physicsBody.setGravityFactor(0);   // 重力の効果
            myMesh.position.copyFrom(p);
            myMesh.rotationQuaternion.copyFrom(q);

        } else if (imesh==1) {
            // 巨大球体
            let sx=1, sy=0.2, sz=2;
            myMesh = BABYLON.MeshBuilder.CreateSphere("my", { diameter: 10 });
	    const myMat = new BABYLON.StandardMaterial("");
            myMat.alpha = 0.5;
            myMesh.material = myMat;
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.MESH, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myMesh._agg = myAgg;
            let charPath = myTextPath;
            myMesh = addCharPanel(charPath, myMesh);
            myMesh.physicsBody.setGravityFactor(0);   // 重力の効果
            myMesh.position.copyFrom(p);
            myMesh.rotationQuaternion.copyFrom(q);

        } else if (imesh==2) {
            // 四角ボード＋ランス（円柱）
            let sx=1, sy=0.2, sz=1;
            myMesh = BABYLON.MeshBuilder.CreateBox("my", { width: sx, height: sy, depth: sz }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myMesh._agg = myAgg;
            let charPath = myTextPath;
            myMesh = addCharPanel(charPath, myMesh);
            myMesh.physicsBody.setGravityFactor(0);   // 重力の効果
            myMesh.position.copyFrom(p);
            myMesh.rotationQuaternion.copyFrom(q);

            // 武器：ランス
            let wph=5, wpr=0.3, wph_=wph/2;
            wpMesh = BABYLON.MeshBuilder.CreateCylinder("weapon", {height: wph, diameterTop: 0, diameterBottom: wpr});
	    wpMesh.material = new BABYLON.StandardMaterial('weapon', scene);
	    wpMesh.material.diffuseColor = BABYLON.Color3.Blue();
	    wpMesh.material.alpha = 0.7;
            wpMesh.rotation = new BABYLON.Vector3(R90, 0, 0);
            wpMesh.position.x = -0.5;
            wpMesh.position.y = 0.5;
            wpMesh.position.z = wph_;
            wpMesh.parent = myMesh;

        } else if (imesh==3) {
            // 四角ボード＋公転する楕円
            let sx=1, sy=0.2, sz=1;
            myMesh = BABYLON.MeshBuilder.CreateBox("my", { width: sx, height: sy, depth: sz }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myMesh._agg = myAgg;
            let charPath = myTextPath;
            myMesh = addCharPanel(charPath, myMesh);
            myMesh.physicsBody.setGravityFactor(0);   // 重力の効果
            myMesh.position.copyFrom(p);
            myMesh.rotationQuaternion.copyFrom(q);

            // 武器：周回する楕円
            let wpDx=1,wpDy=0.5,wpDz=2;
            wpMesh = BABYLON.MeshBuilder.CreateSphere("weapon", { diameterX:wpDx, diameterY:wpDy, diameterZ:wpDz, segments: 8 }, scene);
            wpMesh.position.z = wpDz;
            let frameRate=10;
            let xSlide = new BABYLON.Animation("xSlide", "position.x", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            let zSlide = new BABYLON.Animation("zSlide", "position.z", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            let yRot = new BABYLON.Animation("yRot", "rotation.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            let keyFramesPx = [];
            let keyFramesPz = [];
            let keyFramesR = [], radRate=R180/frameRate, r = 3; 
            for (let i = 0; i <= 2*frameRate; ++i) {
                let rad = i*radRate;
                let px = r*Math.cos(rad), pz = r*Math.sin(rad)
                keyFramesPx.push({frame:i, value:px});
                keyFramesPz.push({frame:i, value:pz});
                keyFramesR.push({frame: i, value: -rad+R90});
            }
            xSlide.setKeys(keyFramesPx);
            zSlide.setKeys(keyFramesPz);
            yRot.setKeys(keyFramesR);
            scene.beginDirectAnimation(wpMesh, [yRot,xSlide,zSlide], 0, 2 * frameRate, true);
            wpMesh.parent = myMesh;

        } else if (imesh==4) {
            // 四角ボード＋よこなぎ（２７０度回転）
            let sx=1, sy=0.2, sz=1;
            myMesh = BABYLON.MeshBuilder.CreateBox("my", { width: sx, height: sy, depth: sz }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myMesh._agg = myAgg;
            let charPath = myTextPath;
            myMesh = addCharPanel(charPath, myMesh);
            myMesh.physicsBody.setGravityFactor(0);   // 重力の効果
            myMesh.position.copyFrom(p);
            myMesh.rotationQuaternion.copyFrom(q);

            // 武器：抜刀／剣戟（２７０度回転）
            let wpDx=0.5,wpDy=0.2,wpDz=2;
            wpMesh = BABYLON.MeshBuilder.CreateSphere("weapon", { diameterX:wpDx, diameterY:wpDy, diameterZ:wpDz, segments: 8 }, scene);
            wpMesh.position.z = wpDz;
            let nframe=20, framePerSec=40;
            let xSlide = new BABYLON.Animation("xSlide", "position.x", framePerSec,
                                               BABYLON.Animation.ANIMATIONTYPE_FLOAT, // animationType=0
                                               BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE); // 1:Cycle Loop Mode
            let zSlide = new BABYLON.Animation("zSlide", "position.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            let yRot = new BABYLON.Animation("yRot", "rotation.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            let keyFramesPx = [];
            let keyFramesPz = [];
            let keyFramesR = [], radRate=R270/nframe, r = 2; 
            for (let i = 0; i < nframe; ++i) {
                let j = (i==nframe-1) ? 0 : i;
                let rad = -j*radRate-R90;
                let px = r*Math.cos(rad), pz = r*Math.sin(rad)
                keyFramesPx.push({frame:i, value:px});
                keyFramesPz.push({frame:i, value:pz});
                keyFramesR.push({frame: i, value: -rad+R90});
            }
            xSlide.setKeys(keyFramesPx);
            zSlide.setKeys(keyFramesPz);
            yRot.setKeys(keyFramesR);
            wpMesh._anima = [yRot,xSlide,zSlide];
            wpMesh._nframe = nframe;
            scene.beginDirectAnimation(wpMesh, wpMesh._anima, 0, wpMesh._nframe, false);
            actMyMesh = function() {
                console.log("actMyMehs . slash");
                scene.beginDirectAnimation(wpMesh, wpMesh._anima, 0, wpMesh._nframe, false);
            }
            wpMesh.parent = myMesh;

        } else if (imesh==5) {
            // 四角ボード＋パンチ
            let sx=1, sy=0.2, sz=1;
            myMesh = BABYLON.MeshBuilder.CreateBox("my", { width: sx, height: sy, depth: sz }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myMesh._agg = myAgg;
            let charPath = myTextPath;
            myMesh = addCharPanel(charPath, myMesh);
            myMesh.physicsBody.setGravityFactor(0);   // 重力の効果
            // myMesh.position.y += 1;
            myMesh.position.copyFrom(p);
            myMesh.rotationQuaternion.copyFrom(q);

            // 武器：パンチ
            let wpD=0.8, wpD_=0.5, wpMesh1, wpMesh2;
            // パンチ(右)
            wpMesh1 = BABYLON.MeshBuilder.CreateSphere("weapon", { diameter:wpD, segments: 8 }, scene);
            wpMesh1.position.x = wpD_;
            wpMesh1.position.y = 0.8; // wpD_;//0.5
            wpMesh1.position.z = 0.5;
            wpMesh1.material = new BABYLON.StandardMaterial("mat", scene);
            wpMesh1.material.diffuseColor = BABYLON.Color3.Red();
            wpMesh1.material.alpha = 0.7;
            // パンチ(左)
            wpMesh2 = BABYLON.MeshBuilder.CreateSphere("weapon", { diameter:wpD, segments: 8 }, scene);
            wpMesh2.position.x = -wpD_;
            wpMesh2.position.y = 0.8; // wpD_;//0.5
            wpMesh2.position.z = 0.5;
            wpMesh2.material = new BABYLON.StandardMaterial("mat", scene);
            wpMesh2.material.diffuseColor = BABYLON.Color3.Red();
            wpMesh2.material.alpha = 0.7;
            let nframe=20, framePerSec=80;
            let zSlide = new BABYLON.Animation("zSlide", "position.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            let keyFramesPz = [];
            {
                keyFramesPz.push({frame:0, value:0.5});
                keyFramesPz.push({frame:nframe/2, value:2});
                keyFramesPz.push({frame:nframe, value:0.5});
            }
            zSlide.setKeys(keyFramesPz);
            wpMesh1._act = 0;
            wpMesh1._i = 0;
            wpMesh1._anima = [zSlide];
            wpMesh1._nframe = nframe;
            wpMeshList.push(wpMesh1);
            wpMeshList.push(wpMesh2);
            let _onAnimationEnd = function(){ wpMeshList[0]._act=0; }
            actMyMesh = function() {
                // ジャブ、ジャブ、ストレート　のつもりだが上手く動作しないｗ
                ++(wpMeshList[0]._i);
                if (wpMeshList[0]._i >= 3 &&wpMeshList[0]._act==0) {
                    // ストレート
                    wpMeshList[0]._i = 0;
                    wpMeshList[0]._act=2;
                    let anim = scene.beginDirectAnimation(wpMeshList[0], wpMeshList[0]._anima, 0, wpMeshList[0]._nframe, false);
                    anim.onAnimationEnd = _onAnimationEnd;
                } else if (wpMeshList[0]._act<=1) {
                    // ジャブ
                    wpMeshList[0]._act=1;
                    let anim = scene.beginDirectAnimation(wpMeshList[1], wpMeshList[0]._anima, 0, wpMeshList[0]._nframe, false);
                    anim.onAnimationEnd = _onAnimationEnd;
                }
            }
            wpMesh1.parent = myMesh;
            wpMesh2.parent = myMesh;

        } else if (imesh==6) {
            // バット（野球

            let sx=1, sy=0.2, sz=1;
            myMesh = BABYLON.MeshBuilder.CreateBox("my", { width: sx, height: sy, depth: sz }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myMesh._agg = myAgg;
            let charPath = myTextPath;
            myMesh = addCharPanel(charPath, myMesh);
            myMesh.physicsBody.setGravityFactor(0);   // 重力の効果
            myMesh.position.copyFrom(p);
            myMesh.rotationQuaternion.copyFrom(q);

            // 武器：バット
            let wpDx=0.5,wpDy=0.5,wpDz=2;
            wpMesh = BABYLON.MeshBuilder.CreateSphere("weapon", { diameterX:wpDx, diameterY:wpDy, diameterZ:wpDz, segments: 8 }, scene);
            wpMesh.position.y = 0.8; // 0.5;
            wpMesh.position.z = wpDz;
            wpMesh.rotation.z = R45;
            wpMesh.parent = myMesh;
            let nframe=20, framePerSec=40, nframe_=nframe/2;
            let xSlide = new BABYLON.Animation("xSlide", "position.x", framePerSec,
                                               BABYLON.Animation.ANIMATIONTYPE_FLOAT, // animationType=0
                                               BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE); // 1:Cycle Loop Mode
            let zSlide = new BABYLON.Animation("zSlide", "position.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            let yRot = new BABYLON.Animation("yRot", "rotation.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            let xRot = new BABYLON.Animation("xRot", "rotation.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            let keyFramesPx = [], keyFramesPz = [];
            let keyFramesRy = [], keyFramesRx = [];
            // 振りぬき後のタメ（静止）に末尾近くフレームで動作を止める
            let radRate=R180/(nframe-3), r=1, radRate2=R30/nframe*2; 
            for (let i = 0; i <= nframe; ++i) {
                let j;
                if (i==nframe) {
                    j=0
                } else if (i>=nframe-3) {
                    j=nframe-3;
                } else {
                    j=i;
                }
                let rad = j*radRate-R45;
                let px = r*Math.cos(rad), pz = r*Math.sin(rad)
                keyFramesPx.push({frame:i, value:px});
                keyFramesPz.push({frame:i, value:pz});
                keyFramesRy.push({frame:i, value:-rad+R90});
                // バット先を　上げて、下げて、上げる　動作に
                let rad2 = -Math.abs(i-nframe_)*radRate2;
                keyFramesRx.push({frame:i, value:rad2});
            }
            xSlide.setKeys(keyFramesPx);
            zSlide.setKeys(keyFramesPz);
            yRot.setKeys(keyFramesRy);
            xRot.setKeys(keyFramesRx);
            wpMesh._anima = [yRot,xRot,xSlide,zSlide];
            wpMesh._nframe = nframe;
            scene.beginDirectAnimation(wpMesh, wpMesh._anima, 0, wpMesh._nframe, false);
            actMyMesh = function() {
                // console.log("actMyMehs . bat-swing");
                scene.beginDirectAnimation(wpMesh, wpMesh._anima, 0, wpMesh._nframe, false);
            }

        } else if (imesh==7) {
            // テニスラケット

            // 土台
            let sx=1, sy=0.2, sz=1;
            myMesh = BABYLON.MeshBuilder.CreateBox("my", { width: sx, height: sy, depth: sz }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myMesh._agg = myAgg;
            // キャラクタのパネル
            let charPath = myTextPath;
            myMesh = addCharPanel(charPath, myMesh);
            myMesh.physicsBody.setGravityFactor(0);
            myMesh.position.copyFrom(p);
            myMesh.rotationQuaternion.copyFrom(q);

            // 武器：テニスラケット
            let wpDx=0.5,wpDy=0.1,wpDz=0.7;
            wpMesh = BABYLON.MeshBuilder.CreateSphere("weapon", { diameterX:wpDx, diameterY:wpDy, diameterZ:wpDz, segments: 8 }, scene);
            wpMesh.position.y = 0.8; // 0.5;
            wpMesh.position.z = wpDz;
            wpMesh.rotation.z = R90;
            wpMesh.parent = myMesh;
            let nframe=20, framePerSec=40, nframe_=nframe/2;

            {
                // 右下後方から左上前方へ（右利きのフォアハンド
                let xSlide = new BABYLON.Animation("xSlide", "position.x", framePerSec,BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let zSlide = new BABYLON.Animation("zSlide", "position.z", framePerSec,BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let ySlide = new BABYLON.Animation("ySlide", "position.y", framePerSec,BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let yRot = new BABYLON.Animation("yRot", "rotation.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let xRot = new BABYLON.Animation("xRot", "rotation.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let zRot = new BABYLON.Animation("xRot", "rotation.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let keyFramesPx = [], keyFramesPz = [], keyFramesPy = [];
                let keyFramesRy = [], keyFramesRx = [], keyFramesRz = [];
                // 振りぬき後のタメ（静止）に末尾近くフレームで動作を止める
                let radRate=R180/(nframe-3), r=1, radRate2=R30/nframe*2; 
                for (let i = 0; i <= nframe; ++i) {
                    let j;
                    if (i==0 || i==nframe) {
                        j=0; // j=12;//正面のつもりだったけど
                    } else if (i>=nframe-3) {
                        j=nframe-3;
                    } else {
                        j=i;
                    }
                    let rad = j*radRate-R45;
                    let px = r*Math.cos(rad), pz = r*Math.sin(rad), py=j*0.05+0.4;
                    keyFramesPx.push({frame:i, value:px});
                    keyFramesPz.push({frame:i, value:pz});
                    keyFramesPy.push({frame:i, value:py});
                    keyFramesRy.push({frame:i, value:-rad+R90});
                    let rad2 = -j*radRate2+R30;
                    keyFramesRx.push({frame:i, value:rad2});
                    keyFramesRz.push({frame:i, value:R90});
                }
                xSlide.setKeys(keyFramesPx);
                zSlide.setKeys(keyFramesPz);
                ySlide.setKeys(keyFramesPy);
                yRot.setKeys(keyFramesRy);
                xRot.setKeys(keyFramesRx);
                zRot.setKeys(keyFramesRz);
                wpMesh._anima = [yRot,xRot,zRot,xSlide,zSlide,ySlide];
                wpMesh._nframe = nframe;
                wpMesh._act = 0;
            }

            {
                // 左下後方から右上前方へ（右利きのバックハンド
                let xSlide = new BABYLON.Animation("xSlide", "position.x", framePerSec,BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let zSlide = new BABYLON.Animation("zSlide", "position.z", framePerSec,BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let ySlide = new BABYLON.Animation("ySlide", "position.y", framePerSec,BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let yRot = new BABYLON.Animation("yRot", "rotation.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let xRot = new BABYLON.Animation("xRot", "rotation.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let zRot = new BABYLON.Animation("xRot", "rotation.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let keyFramesPx = [], keyFramesPz = [], keyFramesPy = [];
                let keyFramesRy = [], keyFramesRx = [], keyFramesRz = [];
                // 振りぬき後のタメ（静止）に末尾近くフレームで動作を止める
                let radRate=R180/(nframe-3), r=1, radRate2=R30/nframe*2; 
                for (let i = 0; i <= nframe; ++i) {
                    let j;
                    if (i==0 || i==nframe) {
                        j=0; // j=12;//正面のつもりだったけど
                    } else if (i>=nframe-3) {
                        j=nframe-3;
                    } else {
                        j=i;
                    }
                    let rad = R225-j*radRate;
                    let px = r*Math.cos(rad), pz = r*Math.sin(rad), py=j*0.05+0.4;
                    keyFramesPx.push({frame:i, value:px});
                    keyFramesPz.push({frame:i, value:pz});
                    keyFramesPy.push({frame:i, value:py});
                    keyFramesRy.push({frame:i, value:-rad+R90});
                    let rad2 = -j*radRate2+R30;
                    keyFramesRx.push({frame:i, value:rad2});
                    keyFramesRz.push({frame:i, value:R90});
                }
                xSlide.setKeys(keyFramesPx);
                zSlide.setKeys(keyFramesPz);
                ySlide.setKeys(keyFramesPy);
                yRot.setKeys(keyFramesRy);
                xRot.setKeys(keyFramesRx);
                zRot.setKeys(keyFramesRz);
                wpMesh._anima2 = [yRot,xRot,zRot,xSlide,zSlide,ySlide];
                wpMesh._nframe2 = nframe;
            }

            {
                // スマッシュ
                let xSlide = new BABYLON.Animation("xSlide", "position.x", framePerSec,BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let zSlide = new BABYLON.Animation("zSlide", "position.z", framePerSec,BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let ySlide = new BABYLON.Animation("ySlide", "position.y", framePerSec,BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let xRot = new BABYLON.Animation("xRot", "rotation.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let zRot = new BABYLON.Animation("xRot", "rotation.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let yRot = new BABYLON.Animation("yRot", "rotation.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                let keyFramesPx = [], keyFramesPz = [], keyFramesPy = [];
                let keyFramesRy = [], keyFramesRx = [], keyFramesRz = [];
                // 振りぬき後のタメ（静止）に末尾近くフレームで動作を止める
                let radRate=R180/(nframe-3), r=1.1, radRate2=R30/nframe*2; 
                for (let i = 0; i <= nframe; ++i) {
                    let j;
                    if (i==0 || i==nframe) {
                        j=0; // j=12;//正面のつもりだったけど
                    } else if (i>=nframe-3) {
                        j=nframe-3;
                    } else {
                        j=i;
                    }
                    let rad = R180-j*radRate, rad2 = j*radRate;
                    let pz = r*Math.cos(rad), py = r*Math.sin(rad)+1.1;
                    keyFramesPz.push({frame:i, value:pz});
                    keyFramesPy.push({frame:i, value:py});
                    keyFramesPx.push({frame:i, value:0});
                    keyFramesRx.push({frame:i, value:rad2});
                    keyFramesRz.push({frame:i, value:0});
                    keyFramesRy.push({frame:i, value:0});
                }
                zSlide.setKeys(keyFramesPz);
                ySlide.setKeys(keyFramesPy);
                xSlide.setKeys(keyFramesPx);
                xRot.setKeys(keyFramesRx);
                zRot.setKeys(keyFramesRz);
                yRot.setKeys(keyFramesRy);
                // wpMesh._anima3 = [yRot,xRot,xSlide,zSlide,ySlide];
                wpMesh._anima3 = [xRot,zRot,yRot,zSlide,ySlide,xSlide];
                wpMesh._nframe3 = nframe;
            }

            actMyMesh = function() {
                //console.log("actMyMehs . bat-swing");
                if (wpMesh._act==0) {
                     scene.beginDirectAnimation(wpMesh, wpMesh._anima, 0, wpMesh._nframe, false);
                } else if (wpMesh._act==1) {
                    scene.beginDirectAnimation(wpMesh, wpMesh._anima2, 0, wpMesh._nframe2, false);
                } else {
                    scene.beginDirectAnimation(wpMesh, wpMesh._anima3, 0, wpMesh._nframe3, false);
                }
            }

        } else if (imesh==8) {
            // 遠距離・ボール／ナックルボール（ランダムで揺れる）

            // 土台
            let sx=1, sy=0.2, sz=1;
            myMesh = BABYLON.MeshBuilder.CreateBox("my", { width: sx, height: sy, depth: sz }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myMesh._agg = myAgg;
            // キャラクタのパネル
            let charPath = myTextPath;
            myMesh = addCharPanel(charPath, myMesh);
            myMesh.physicsBody.setGravityFactor(0);
            myMesh.position.copyFrom(p);
            myMesh.rotationQuaternion.copyFrom(q);

            // 武器：ナックルボール（ランダムで揺れる）
            let nwp=20, wpr=0.1;
            for (let iwp=0; iwp<nwp; ++iwp) {
                let wpm = BABYLON.MeshBuilder.CreateSphere("weapon", { diameter: wpr });
                wpm.position.set(0.5, 0.7, 0);
                wpm.parent=myMesh;
                {
                    let nframe=20, framePerSec=40, nframe_=nframe/2;
                    let nframe1=6,nframe2=13,nframe3=19;
                    let zSlide = new BABYLON.Animation("zSlide", "position.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let xSlide = new BABYLON.Animation("xSlide", "position.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let ySlide = new BABYLON.Animation("ySlide", "position.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let keyPz=[],keyPx=[],keyPy=[];
                    keyPz.push({frame:0, value:0});
                    keyPz.push({frame:nframe-1, value:10});
                    keyPz.push({frame:nframe, value:0});
                    keyPx.push({frame:0, value:0});
                    keyPx.push({frame:nframe1, value:Math.random()-0.5});
                    keyPx.push({frame:nframe2, value:Math.random()-0.5});
                    keyPx.push({frame:nframe3, value:Math.random()-0.5});
                    keyPx.push({frame:nframe, value:0});
                    keyPy.push({frame:0, value:0});
                    keyPy.push({frame:nframe1, value:Math.random()-0.5});
                    keyPy.push({frame:nframe2, value:Math.random()-0.5});
                    keyPy.push({frame:nframe3, value:Math.random()-0.5});
                    keyPy.push({frame:nframe, value:0});
                    zSlide.setKeys(keyPz);
                    xSlide.setKeys(keyPx);
                    ySlide.setKeys(keyPy);
                    wpm._anima = [zSlide,xSlide,ySlide];
                    wpm._nframe = nframe;
                }
                wpMeshList.push(wpm);
            }
            actMyMesh = function() {
                let wpm = wpMeshList.shift();
                wpMeshList.push(wpm);
                scene.beginDirectAnimation(wpm, wpm._anima, 0, wpm._nframe, false);
            }

        } else if (imesh==9) {
            // 遠距離・フライングディスク／楕円軌道・周回

            // 土台
            let sx=1, sy=0.2, sz=1;
            myMesh = BABYLON.MeshBuilder.CreateBox("my", { width: sx, height: sy, depth: sz }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myMesh._agg = myAgg;
            // キャラクタのパネル
            let charPath = myTextPath;
            myMesh = addCharPanel(charPath, myMesh);
            myMesh.physicsBody.setGravityFactor(0);
            myMesh.position.copyFrom(p);
            myMesh.rotationQuaternion.copyFrom(q);

            let nwp=6;
            for (let iwp=0; iwp<nwp; ++iwp) {
                let wpm = BABYLON.MeshBuilder.CreateDisc("weapon", { radius:0.4 });
                wpm.position.set(0.5, 0.7+(Math.random()-0.5)/1, 0);
                wpm.rotation.x = R90;
                wpm.parent=myMesh;
                {
                    // リサージュ曲線
                    let nframe=40, framePerSec=10, nframe_=nframe/2;
                    let rads=R360/nframe, wr=2+Math.random()+iwp, rad0=R360*iwp/nwp;;
                    let xSlide = new BABYLON.Animation("xSlide", "position.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let ySlide = new BABYLON.Animation("ySlide", "position.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let zSlide = new BABYLON.Animation("zSlide", "position.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let keyPx=[],keyPy=[],keyPz=[];
                    for (let i=0; i<=nframe;++i) {
                        let rad=i*rads+rad0;
                        keyPx.push({frame:i, value:wr*Math.sin(2*rad)});
                        keyPz.push({frame:i, value:wr*Math.sin(3*rad)});
                    }
                    keyPy.push({frame:0, value:0});
                    keyPy.push({frame:nframe, value:Math.random()-0.5});
                    xSlide.setKeys(keyPx);
                    ySlide.setKeys(keyPy);
                    zSlide.setKeys(keyPz);
                    wpm._anima = [xSlide,ySlide,zSlide];
                    wpm._nframe = nframe;
                }
                wpMeshList.push(wpm);
                scene.beginDirectAnimation(wpm, wpm._anima, 0, wpm._nframe, true);
            }

        } else if (imesh==10) {
            // 衝撃波：球をsliceしたもの

            // 土台
            let sx=1, sy=0.2, sz=1;
            myMesh = BABYLON.MeshBuilder.CreateBox("my", { width: sx, height: sy, depth: sz }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myMesh._agg = myAgg;
            // キャラクタのパネル
            let charPath = myTextPath;
            myMesh = addCharPanel(charPath, myMesh);
            myMesh.physicsBody.setGravityFactor(0);
            myMesh.position.copyFrom(p);
            myMesh.rotationQuaternion.copyFrom(q);

            // 武器：衝撃波：球をslice（ランダムで揺れる）
            let nwp=20, wpr=1.1, wps=0.4, wpsrate=6;
            for (let iwp=0; iwp<nwp; ++iwp) {
                let wpm = BABYLON.MeshBuilder.CreateSphere("weapon", {diameter: wpr, slice:wps, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                let px=0.5, py=0.7;
                wpm.position.set(px, py, 0);
                wpm.rotation.x = R90;
                wpm.scaling.set(0,0,0);
                wpm.material = new BABYLON.StandardMaterial("mat", scene);
                wpm.material.diffuseColor = BABYLON.Color3.Red();
                wpm.material.alpha = 0.5;
                wpm.parent=myMesh;
                {
                    let nframe=20, framePerSec=40, nframe_=nframe/2;
                    let nframe1=6,nframe2=13,nframe3=19;
                    let zSlide = new BABYLON.Animation("zSlide", "position.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let xSlide = new BABYLON.Animation("xSlide", "position.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let ySlide = new BABYLON.Animation("ySlide", "position.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let xScale = new BABYLON.Animation("xSlide", "scaling.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let yScale = new BABYLON.Animation("ySlide", "scaling.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let zScale = new BABYLON.Animation("zSlide", "scaling.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let keyPz=[],keyPx=[],keyPy=[];
                    let keySx=[],keySy=[],keySz=[];
                    keyPz.push({frame:0, value:0});
                    keyPz.push({frame:nframe-1, value:10});
                    keyPz.push({frame:nframe, value:0});
                    keyPx.push({frame:0, value:px});
                    keyPx.push({frame:nframe1, value:px+Math.random()-0.5});
                    keyPx.push({frame:nframe2, value:px+Math.random()-0.5});
                    keyPx.push({frame:nframe3, value:px+Math.random()-0.5});
                    keyPx.push({frame:nframe, value:px});
                    keyPy.push({frame:0, value:py});
                    keyPy.push({frame:nframe1, value:py+Math.random()-0.5});
                    keyPy.push({frame:nframe2, value:py+Math.random()-0.5});
                    keyPy.push({frame:nframe3, value:py+Math.random()-0.5});
                    keyPy.push({frame:nframe, value:py});
                    keySx.push({frame:0, value:0});
                    keySx.push({frame:nframe-1, value:wpsrate});
                    keySx.push({frame:nframe, value:0});
                    keySy.push({frame:0, value:0});
                    keySy.push({frame:nframe-1, value:wpsrate });
                    keySy.push({frame:nframe, value:0});
                    keySz.push({frame:0, value:0});
                    keySz.push({frame:nframe-1, value:wpsrate });
                    keySz.push({frame:nframe, value:0});
                    zSlide.setKeys(keyPz);
                    xSlide.setKeys(keyPx);
                    ySlide.setKeys(keyPy);
                    xScale.setKeys(keySx);
                    yScale.setKeys(keySy);
                    zScale.setKeys(keySz);
                    wpm._anima = [zSlide,xSlide,ySlide,xScale,yScale,zScale];
                    wpm._nframe = nframe;
                }
                wpMeshList.push(wpm);
            }
            actMyMesh = function() {
                let wpm = wpMeshList.shift();
                wpMeshList.push(wpm);
                scene.beginDirectAnimation(wpm, wpm._anima, 0, wpm._nframe, false);
            }

        } else if (imesh==11) {
            // 衝撃波：ショートケーキ型／くさび型

            // 土台
            let sx=1, sy=0.2, sz=1;
            myMesh = BABYLON.MeshBuilder.CreateBox("my", { width: sx, height: sy, depth: sz }, scene);
            let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
            myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
            myMesh.physicsBody.disablePreStep = false;
            myMesh._agg = myAgg;
            // キャラクタのパネル
            let charPath = myTextPath;
            myMesh = addCharPanel(charPath, myMesh);
            myMesh.physicsBody.setGravityFactor(0);
            myMesh.position.copyFrom(p);
            myMesh.rotationQuaternion.copyFrom(q);

            let nwp=20, wpL=20, wpSMax=10;
            for (let iwp=0; iwp<nwp; ++iwp) {
                let wpm = BABYLON.MeshBuilder.CreateCylinder("weapon", {arc: 0.1, enclose:true, height:0.02 });
                let px=0.0, py=0.7;
                wpm.position.set(px, py, 0);
                wpm.rotation.y = R90-0.3;
                wpm.parent=myMesh;
                {
                    let nframe=20, framePerSec=80, nframe_=nframe/2;
                    let nframe1=6,nframe2=13,nframe3=19;
                    let zSlide = new BABYLON.Animation("zPos", "position.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let xSlide = new BABYLON.Animation("xPos", "position.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let ySlide = new BABYLON.Animation("yPos", "position.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let xScale = new BABYLON.Animation("xSld", "scaling.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let yScale = new BABYLON.Animation("ySld", "scaling.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let zScale = new BABYLON.Animation("zSld", "scaling.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let xRot = new BABYLON.Animation("xRot", "rotation.x", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let yRot = new BABYLON.Animation("yRot", "rotation.y", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let zRot = new BABYLON.Animation("zRot", "rotation.z", framePerSec, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                    let keyPz=[],keyPx=[],keyPy=[];
                    let keySx=[],keySy=[],keySz=[];
                    let keyRx=[],keyRy=[],keyRz=[];
                    let wpmQ=BABYLON.Quaternion.FromEulerAngles(0, R90-0.3, 0);
                    wpmQ=BABYLON.Quaternion.FromEulerAngles(0, 0, R180*Math.random()).multiply(wpmQ);
                    let wpmEA = wpmQ.toEulerAngles();
                    keyPz.push({frame:0, value:0});
                    keyPz.push({frame:nframe-1, value:wpL});
                    keyPz.push({frame:nframe, value:0});
                    keyPx.push({frame:0, value:px});
                    keyPx.push({frame:nframe3, value:px});
                    keyPx.push({frame:nframe, value:px});
                    keyPy.push({frame:0, value:py});
                    keyPy.push({frame:nframe3, value:py});
                    keyPy.push({frame:nframe, value:py});
                    keySx.push({frame:0, value:0});
                    keySx.push({frame:nframe-1, value:wpSMax});
                    keySx.push({frame:nframe, value:0});
                    keySy.push({frame:0, value:0});
                    keySy.push({frame:nframe-1, value:wpSMax });
                    keySy.push({frame:nframe, value:0});
                    keySz.push({frame:0, value:0});
                    keySz.push({frame:nframe-1, value:wpSMax });
                    keySz.push({frame:nframe, value:0});
                    keyRx.push({frame:0, value:wpmEA.x});
                    keyRx.push({frame:nframe, value:wpmEA.x});
                    keyRy.push({frame:0, value:wpmEA.y});
                    keyRy.push({frame:nframe, value:wpmEA.y});
                    keyRz.push({frame:0, value:wpmEA.z});
                    keyRz.push({frame:nframe, value:wpmEA.z});
                    zSlide.setKeys(keyPz);
                    xSlide.setKeys(keyPx);
                    ySlide.setKeys(keyPy);
                    xScale.setKeys(keySx);
                    yScale.setKeys(keySy);
                    zScale.setKeys(keySz);
                    xRot.setKeys(keyRx);
                    yRot.setKeys(keyRy);
                    zRot.setKeys(keyRz);
                    wpm._anima = [zSlide,xSlide,ySlide,xScale,yScale,zScale,xRot,yRot,zRot];
                    wpm._nframe = nframe;
                }
                wpMeshList.push(wpm);
            }
            actMyMesh = function() {
                let wpm = wpMeshList.shift();
                wpMeshList.push(wpm);
                scene.beginDirectAnimation(wpm, wpm._anima, 0, wpm._nframe, false);
            }
        }

        if (icamera >= 1) {
            camera.lockedTarget = myMesh;
        }
    }
    createMyMesh(imesh);

    // ----------------------------------------
    // GUI
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var guiIconUsage = new BABYLON.GUI.Rectangle();
    {
        guiIconUsage.adaptWidthToChildren = true;
        guiIconUsage.height = "40px";
        guiIconUsage.cornerRadius = 5;
        guiIconUsage.color = "Orange";
        guiIconUsage.thickness = 4;
        guiIconUsage.background = "green";
        guiIconUsage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        guiIconUsage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(guiIconUsage);    
        let text1 = new BABYLON.GUI.TextBlock();
        text1.text = "Usage";
        text1.color = "white";
        text1.width = "100px";
        text1.fontSize = 24;
        text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
        text1.paddingLeft = 12;
        guiIconUsage.onPointerUpObservable.add(function() {
            guiUsageRect.isVisible = true;
        });
        guiIconUsage.addControl(text1);    
    }

    // 画面右上。トロフィーボタン
    var guiIconTrophy = new BABYLON.GUI.Image("ctrl", iconTrophyPath);
    {
        guiIconTrophy.width = "60px";
        guiIconTrophy.height = "60px";
        guiIconTrophy.autoScale = false
        guiIconTrophy.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIconTrophy.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        guiIconTrophy.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        guiIconTrophy.onPointerUpObservable.add(function() {
            showTrophyRect();
        });
        advancedTexture.addControl(guiIconTrophy);   
    }

    let guiTrophyRect = new BABYLON.GUI.Rectangle(); 
    let trophyBtnList=[];
    let clearStageList=[];
    {
        // クリアステージ確認GUI
        guiTrophyRect.width = "600px";
        guiTrophyRect.height = "400px";
        guiTrophyRect.cornerRadius = 20;
        guiTrophyRect.color = "Orange";
        guiTrophyRect.thickness = 4;
        guiTrophyRect.background = "green";
        guiTrophyRect.isVisible = false;
        guiTrophyRect._obj=[];
        advancedTexture.addControl(guiTrophyRect);
        let grid = new BABYLON.GUI.Grid();
        grid.background = "black";
        grid.width = 0.98;
        grid.height = 0.98;
        for (let ii=0; ii<5; ++ii) {
            grid.addColumnDefinition(0.2);
        }
        grid.addRowDefinition(0.5);
        grid.addRowDefinition(0.5);
        guiTrophyRect.addControl(grid); 
        for (let ii=0; ii<10;++ii) {
            let ic = ii%5, ir=Math.floor(ii/5);
            let fpath = pathPanelList[ii][2];
            let button = BABYLON.GUI.Button.CreateImageOnlyButton("p"+ii, fpath);
            button.onPointerUpObservable.add(function() {
                istage = ii;
                createStage(istage);
                showTrophyRect();
            });
            grid.addControl(button, ir, ic);
            trophyBtnList.push(button);
            clearStageList.push(false);
        }
    }

    var showTrophyRect = function() {
        if (guiTrophyRect.isVisible) {
            guiTrophyRect.isVisible = false;
        } else {
            for (let ii=0; ii <trophyBtnList.length; ++ii) {
                let obj = trophyBtnList[ii];
                if (clearStageList[ii]) {
                    obj.image.alpha=1;
                } else {
                    obj.image.alpha=0.2;
                }
            }
            guiTrophyRect.isVisible = true;
        }
    }

    // ----------------------------------------

    changeCamera(icamera);
    createStage(istage);

    let map ={}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    const qYR = BABYLON.Quaternion.FromEulerAngles(0, 0.05, 0);
    const qYL = BABYLON.Quaternion.FromEulerAngles(0, -0.05, 0);
    let quick=false, rightRoll = false, lefttRoll = false;
    let mx=1,mz=1;
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
            if (imesh==7) {
                if (map["ArrowUp"] || map["ArrowDown"]) {
                    wpMesh._act = 2;
                } else if (map["ArrowLeft"]) {
                    wpMesh._act = 1;
                } else if (map["ArrowRight"]) {
                    wpMesh._act = 0;
                }
            }
            actMyMesh();
        }

        if (map["Enter"]) {
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
            if (map["t"]) {
                cooltime_act = cooltime_actIni;
                imesh = (imesh+1)%nmesh;
                createMyMesh(imesh);
            }
            if (map["c"]) {
                cooltime_act = cooltime_actIni;
                icamera = (icamera+1)%ncamera;
                changeCamera(icamera);
            }

            if (map["1"]) {
                cooltime_act = cooltime_actIni;
                showTrophyRect();
            }
            if (map["h"]) {
                cooltime_act = cooltime_actIni;
                // help表示のON/OFF
                if (guiUsageRect.isVisible) {
                    guiUsageRect.isVisible = false;
                } else {
                    guiUsageRect.isVisible = true;
                }
            }
        }
    });

    // --------------------------------------------------

    // 左上に使い方（操作方法）を表示
    let guiUsageRect = new BABYLON.GUI.Rectangle();
    {
        guiUsageRect.adaptWidthToChildren = true;
        guiUsageRect.width = "290px";
        guiUsageRect.height = "140px";
        guiUsageRect.cornerRadius = 5;
        guiUsageRect.color = "Orange";
        guiUsageRect.thickness = 4;
        guiUsageRect.background = "green";
        guiUsageRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        guiUsageRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(guiUsageRect);    
        let grid = new BABYLON.GUI.Grid();
        grid.width = 0.98;
        grid.height = 0.98;
        grid.addRowDefinition(1);
        grid.addRowDefinition(22, true);
        guiUsageRect.addControl(grid); 
        // グリッド内の要素の登録
        {
            let text1 = new BABYLON.GUI.TextBlock();
            text1.text = "Usage:\n"
                +"(W,S) or (Arrow UP/DOWN): Forward/Back\n"
                +"(A,D) or (Arrow Left/Right): Left/Right\n"
                +"(Space): GravitationalField\n"
                +"(N,P) : Change Stage\n"
                +"H: show/hide this message";
            text1.color = "white";
            text1.width = "260px";
            text1.fontSize = 12;
            text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
            text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
            text1.paddingLeft = 12;
            grid.addControl(text1, 0, 0);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("but1", "Close");
            button.width = "120px"; // 1;
            button.height = "20px"; // 0.4;
            button.color = "white";
            button.fontSize = 12;
            button.background = "green";
            button.onPointerUpObservable.add(function() {
                guiUsageRect.isVisible = false;
            });
            grid.addControl(button, 1, 0);
        }
        guiUsageRect.isVisible = false;
    }

    return scene;
}

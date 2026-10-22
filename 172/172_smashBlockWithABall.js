// ブロックをボールでぶっ飛ばす

// ######################################################################

// const ddbase1="../170/";
// const ddbase2="./";

const ddbase1="https://raw.githubusercontent.com/fnamuoo/webgl/main/170/";
const ddbase2="https://raw.githubusercontent.com/fnamuoo/webgl/main/172/";

const iconPath30 = ddbase1+"textures/icon2w/再生停止ボタン.png"
const iconPath31 = ddbase2+"textures/icon2w/クロスカーソル.png"
const iconPath32 = ddbase2+"textures/icon2w/爆発アイコン (2).png"
const iconPath21 = ddbase1+"textures/icon2w/ゴルフアイコン2.png"
const iconPath23 = ddbase1+"textures/icon2w/ボーリングの球のアイコン素材.png"
const iconPath41 = ddbase1+"textures/icon2w/ハンドグリップ1.png"
const iconPath42 = ddbase1+"textures/icon2w/ダンベルのアイコン素材.png"
const iconPath43 = ddbase1+"textures/icon2w/ダンベルのアイコン素材 2.png"
const iconPath44 = ddbase1+"textures/icon2w/マッチョのフリーアイコン3.png"
const iconPath52 = ddbase1+"textures/icon2w/コントロールボタン (7).png"
const iconPath53 = ddbase1+"textures/icon2w/リロードアイコン.png"
const iconPath54 = ddbase1+"textures/icon2w/コントロールボタン (5).png"

let fpathList = [
    ddbase2+"textures/icon2w/クリスマスベルの無料アイコン4.png",
    ddbase2+"textures/demo/c06_101.png", // babylon.js ロゴ
    ddbase2+"textures/demo/c10_102.png", // ドットキャラ 4x4
    ddbase2+"textures/demo/c20_spriteAtlas.png", // ドットキャラ 2x2
    ddbase2+"textures/demo/c10_ParallaxDiffuse.png", // ブロック
    ddbase2+"textures/demo/c08_201.png", // バビロンさん
    ddbase2+"textures/demo/c08_202.png", // バビロンさん＋車
    ddbase2+"textures/demo/c08_203.png", // バビロンさん＋テニス
    ddbase2+"textures/demo/c12_co.png", // カラー9x9
    ddbase2+"textures/demo/c20_JbvoYlB.png", // カラー4x4
    ddbase2+"textures/demo/c10_mercator.png", // 世界地図
];


export var createScene_test_3204 = async function () {
    const scene = new BABYLON.Scene(engine);


    let camera=null, cameraTrgMesh=null;
    let crCameraDef = function() {
        const _camera = new BABYLON.ArcRotateCamera("", 3/2* Math.PI, 3/8 * Math.PI, 5, new BABYLON.Vector3(0, 0, 0));
        _camera.attachControl(canvas, true);
        _camera.wheelDeltaPercentage = 0.01;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // カーソルキーによる回転を削除
        return _camera;
    }
    let crCamera0 = function(meshTrg) {
        let _camera = new BABYLON.FollowCamera("", new BABYLON.Vector3(0, 2, -10), scene);
        _camera.rotationOffset = 180;
        _camera.radius = 2;
        _camera.heightOffset = 0.5;
        _camera.cameraAcceleration = 0.1; // 0.005;
        _camera.maxCameraSpeed = 5;
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // カーソルキーによる回転を削除
        return _camera;
    }
    let crCamera52 = function(meshTrg) {
        // ボール(meshTrg)を画面中心にしたカメラワーク
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 1, -4), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // カーソルキーによる回転を削除
        _camera._type = 52;
        return _camera;
    }
    let bcrCamera53Ini = true;
    let crCamera53 = function(meshTrg) {
        // ボール(meshTrg)を画面中心にしたカメラワーク＋移動方向に合わせてカメラ向きを変更
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 1, -4), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = meshTrg;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // カーソルキーによる回転を削除
        _camera._type = 53;
        if (bcrCamera53Ini == true) {
            bcrCamera53Ini = false;
            scene.onBeforeRenderObservable.add((scene) => {
                if (camera._type == 53 && camera.lockedTarget != null) {
                    // meshTrg とカメラ位置に応じて ヨー回転
                    let myMesh = camera.lockedTarget;
                    let vt = myMesh.position.subtract(camera.position).normalize();
                    let rad = Math.atan2(vt.x, vt.z);
                    camera.alpha = -rad - Math.PI/2;
                }
            })
        }
        return _camera;
    }

    let bcrCamera54Ini = true;
    let crCamera54 = function(meshTrg) {
        // ボール(meshTrg)を遅延させて追跡させるカメラワーク
        let mesh = BABYLON.MeshBuilder.CreateBox("", {size:0.01}); // ボールクリック時に選択しないよう小さくしておく
        mesh.visibility = 0; // 不可視（描画しない）
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 1, -4), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.lockedTarget = mesh;
        _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // カーソルキーによる回転を削除
        _camera._type = 54;
        _camera._meshTrg = mesh;
        _camera._meshOrg = meshTrg;
        if (bcrCamera54Ini == true) {
            bcrCamera54Ini = false;
            scene.onBeforeRenderObservable.add((scene) => {
                if (camera._type == 54 && camera.lockedTarget != null) {
                    // meshTrg を meshOrg に近づける
                    let vlerp = 0.1;
                    let vlv = BABYLON.Vector3.Lerp(camera._meshTrg.position, camera._meshOrg.position, vlerp);
                    camera._meshTrg.position.copyFrom(vlv);
                    // meshTrg とカメラ位置に応じて ヨー回転
                    let myMesh = camera.lockedTarget;
                    let vt = myMesh.position.subtract(camera.position).normalize();
                    let rad = Math.atan2(vt.x, vt.z);
                    camera.alpha = -rad - Math.PI/2;
                }
            })
        }
        return _camera;
    }
    let setLockedTarget2Camera = function(mesh) {
        if (camera == null) {
            return;
        }
        if ((camera._type == 5) || (camera._type == 52) || (camera._type == 53) || (camera._type == 54)) {
            camera.lockedTarget = mesh;
        }
    }
    // camera = crCameraDef(); // debug

    // ライト
    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    var light2 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, -1, 0), scene);
    light2.intensity = 0.3;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    var physicsHelper = new BABYLON.PhysicsHelper(scene);

    // let meshGrn = null;
    let createGround = function(sx,sz, px,py,pz) {
        let mesh = BABYLON.MeshBuilder.CreateGround("ground", {width:sx, height:sz}, scene);
        mesh.position.set(px,py,pz);
        mesh.material = new BABYLON.GridMaterial("", scene);
        mesh.material.majorUnitFrequency = 10; 
        mesh.material.minorUnitVisibility  = 0.2;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass:0, friction:0.5}, scene);
        return mesh;
    }


    let meshStage = [];
    let meshTrg = null;
    let createStage = async function(istage) {
        while (meshStage.length > 0) {
            let mesh = meshStage.pop();
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            mesh.dispose();
        }
        meshTrg = null;
        while (ballList.length > 0) {
            let mesh = ballList.pop();
            if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
            mesh.dispose();
        }

        setText2("Sorry to keep you waiting");

        let fpath = fpathList[istage];
        let image = new Image();
        // CORS を使って画像を読み込む
        image.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
            image.onload = () => resolve(image);
            image.onerror = (e) => reject(new Error(`画像読み込み失敗: ${fpath}`));
            image.src = fpath;
        });
        let width = image.naturalWidth; // image.width よりこちらがよい？
        let height = image.naturalHeight;
        console.log("image size =", width, height, width*height);
        // --------------------------------------------------
        // Canvasへ描画
        // --------------------------------------------------
        const canvas2d = document.createElement("canvas");
        canvas2d.width = width;
        canvas2d.height = height;
        const ctx = canvas2d.getContext("2d");
        // 補間を避ける
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, 0, 0, width, height);
        // 全画素取得
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        // --------------------------------------------------
        // 100画素相当が100になるよう画素のサイズを調整
        let psize = 100/width, psize_ = psize/2;

        // --------------------------------------------------
        let meshGrn = createGround(psize*width+20,psize*height+40,0,0,psize*height/2-10);
        meshStage.push(meshGrn);

        // --------------------------------------------------
        // 色をインスタンスごとに設定
        const colors = [];
        const matrices = [];
        const offsetX = psize * (width/2 + 0.5);
        const offsetY = psize * 0.5;
        const offsetZ = psize * (height + 0.5);
        let count = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const r = pixels[i + 0];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const a = pixels[i + 3];
                // 完全透明ならブロックを作らない
                if (a === 0) {continue;}
                const px = psize*x - offsetX;
                const py = offsetY;
                const pz = psize*(-y) + offsetZ;
                // // 明るさで高低差を付ける
                // const brightness = (r + g + b) / (255 * 3);
                // const h = 1 + brightness * 10;
                // let py = h + offsetY;
                const matrix = BABYLON.Matrix.Translation(px, py, pz);
                matrices.push(matrix);
                // plist.push(new BABYLON.Vector3(px, py, pz));
                // 0～255 → 0～1
                colors.push(r/255, g/255, b/255, a/255);
                count++;
            }
        }

        {
            // Thin Instance
            let bsize = psize*0.99;
            let mesh = BABYLON.MeshBuilder.CreateBox("", { size:bsize}, scene);
            const matrixData = new Float32Array(count * 16);
            for (let i = 0; i < matrices.length; i++) {
                matrices[i].copyToArray(matrixData, i * 16);
            }
            mesh.thinInstanceSetBuffer("matrix", matrixData, 16, false); // Havokと結びつけるため、最後をfalseに
            mesh.thinInstanceSetBuffer("color", new Float32Array(colors), 4);
            // 色を使用
            let material = new BABYLON.StandardMaterial("material", scene );
            material.diffuseColor = new BABYLON.Color3(1, 1, 1);
            material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
            material.useVertexColors = true;
            mesh.material = material;
            let bodyRenderingMaterial = new BABYLON.StandardMaterial("mat", scene);
            if (mesh.getDescendants && mesh.getDescendants().length) {
                mesh.getDescendants().forEach((d) => {
                    d.material = bodyRenderingMaterial;
                });
            }
            let physShape = new BABYLON.PhysicsShapeBox(new BABYLON.Vector3(0, 0, 0), BABYLON.Quaternion.Identity(), new BABYLON.Vector3(bsize, bsize, bsize), scene);
            let physBody = new BABYLON.PhysicsBody(mesh, BABYLON.PhysicsMotionType.DYNAMIC, true, scene); //sleep
            physShape.material = ({restitution:0.01, friction:0.9, }); // (physicsMaterial);
            physBody.shape = physShape;
            physBody.setMassProperties({mass:0.1});
            meshStage.push(physBody);
            meshStage.push(mesh);

            meshTrg = mesh;
        }

        setText2("");

        return [width, height];
    }
    let pbottom = new BABYLON.Vector3(0, -10, 0);

    let nextStage = async function() {
        let i = stageList.indexOf(istage);
        i = (i+1) % nstage;
        istage = stageList[i];
        [width, height] = await createStage(istage);
        resetPosiBall(pst);
    }
    let backStage = async function() {
        let i = stageList.indexOf(istage);
        i = (i+nstage-1) % nstage;
        istage = stageList[i];
        [width, height] = await createStage(istage);
        resetPosiBall(pst);
    }

    // 3秒後にステージ変更を呼び出す
    let setNextStage = function(aftersec=3) {
        setTimeout(nextStage, aftersec*1000);
    }

    let crBall = function(posi) {
        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 0.5 }, scene);
        mesh.position.copyFrom(posi);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.White();
        mesh.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        mesh.material.wireframe = 1;
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 10, friction:0.01, restitution:0.1}, scene);
        mesh._impRate = 1;
        mesh._ldamp = 0.01;
        mesh.physicsBody.disablePreStep = false;
        return mesh;
    }
    let crBall4 = function(posi) {
        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1.5 }, scene);
        mesh.position.copyFrom(posi);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Gray();
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass:20, friction:0.01, restitution:0.1}, scene);
        mesh._impRate = 1;
        mesh._ldamp = 0.01;
        mesh.physicsBody.disablePreStep = false;
        return mesh;
    }

    let crBall0 = function(posi) {
        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 0.1 }, scene);
        mesh.position.copyFrom(posi);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, friction:0.01, restitution:0.1}, scene);
        mesh.physicsBody.disablePreStep = false;
        return mesh;
    }

    let changeBall = function(itype, pst) {
        let p0 = null;
        if (ball == null) {
            p0 = pst.clone();
        } else {
            p0 = ball.position.clone().add(pst);
            ball._agg.dispose();
            ball.dispose();
        }
        if (itype == 0) {
            ball = crBall(p0);
        } else if (itype == 1) {
            ball = crBall4(p0);
        //     ball = crBall3(p0);
        // } else if (itype == 2) {
        }
        ball._vF = BABYLON.Vector3.Zero();
        ball._vB = BABYLON.Vector3.Zero();
        ball._spinloop = 0;
        setLockedTarget2Camera(ball);
        return ball;
    }
    let resetPosiBall = function(pcur) {
        ball.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        ball.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
        ball.position.copyFrom(pcur);
//        bfall = false;
        camera.alpha = -Math.PI/2;
        camera._meshTrg.position.copyFrom(ball.position.subtract(new BABYLON.Vector3(0,0,100)));
        camera.position.copyFrom(ball.position.subtract(new BABYLON.Vector3(0,0,120)));
    }

    // ------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // クラブの選択アイコン
    let golfClub = 0;

    // ボールのスピン
    let ballSpin = 0;
    {
        let fpathList = [iconPath30, iconPath31, iconPath32 ];
        let guiIconList = [];
        for (let i = 0; i < fpathList.length; ++i) {
            let fpath = fpathList[i];
            let guiIcon = new BABYLON.GUI.Image("", fpath);
            guiIcon.width = "60px";
            guiIcon.height = "60px"; // "60px";
            guiIcon.top = "-10px";
            guiIcon.left = "" + (i*70+10)+ "px";
            guiIcon.autoScale = false
            guiIcon.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            guiIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            guiIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            advancedTexture.addControl(guiIcon);   
            guiIcon._v = i
            if (i == 0) {
                guiIcon.alpha = 1;
            } else {
                guiIcon.alpha = 0.3;
            }
            guiIconList.push(guiIcon);
        }
        for (let guiIcon of guiIconList) {
            guiIcon.onPointerUpObservable.add(function() {
                for (let _guiIcon of guiIconList) {
                    _guiIcon.alpha = 0.3;
                }
                guiIcon.alpha = 1;
                ballSpin = guiIcon._v;
            });
        }
    }

    let ballType = 0;
    {
        let fpathList = [iconPath21, iconPath23 ];
        let guiIconList = [];
        for (let i = 0; i < fpathList.length; ++i) {
            let fpath = fpathList[i];
            let guiIcon = new BABYLON.GUI.Image("", fpath);
            guiIcon.width = "60px";
            guiIcon.height = "60px"; // "60px";
            guiIcon.top = "-10px";
            guiIcon.left = "-" + ((fpathList.length-i-1)*70+10)+ "px";
            guiIcon.autoScale = false
            guiIcon.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            guiIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            guiIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            advancedTexture.addControl(guiIcon);   
            guiIcon._v = i
            if (i == 0) {
                guiIcon.alpha = 1;
            } else {
                guiIcon.alpha = 0.3;
            }
            guiIconList.push(guiIcon);
        }
        for (let guiIcon of guiIconList) {
            guiIcon.onPointerUpObservable.add(function() {
                for (let _guiIcon of guiIconList) {
                    _guiIcon.alpha = 0.3;
                }
                guiIcon.alpha = 1;
                ballType = guiIcon._v;
                changeBall(ballType, pst);
            });
        }
    }

    // ボールのスピン
    let vPower = 1;
    {
        let fpathList = [iconPath41, iconPath42, iconPath43, iconPath44 ];
        let vlist = [10, 15, 20, 40];
        let guiIconList = [];
        for (let i = 0; i < fpathList.length; ++i) {
            let fpath = fpathList[i];
            let guiIcon = new BABYLON.GUI.Image("", fpath);
            guiIcon.width = "60px";
            guiIcon.height = "60px"; // "60px";
            guiIcon.top = "-90px";
            guiIcon.left = "" + (i*70+10)+ "px";
            guiIcon.autoScale = false
            guiIcon.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            guiIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            guiIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            advancedTexture.addControl(guiIcon);   
            guiIcon._v = vlist[i];
            if (i == 0) {
                guiIcon.alpha = 1;
            } else {
                guiIcon.alpha = 0.3;
            }
            guiIconList.push(guiIcon);
        }
        for (let guiIcon of guiIconList) {
            guiIcon.onPointerUpObservable.add(function() {
                for (let _guiIcon of guiIconList) {
                    _guiIcon.alpha = 0.3;
                }
                guiIcon.alpha = 1;
                vPower = guiIcon._v;
            });
        }
    }

    {
        let fpathList = [iconPath52, iconPath53, iconPath54 ];
        let guiIconList = [];
        for (let i = 0; i < fpathList.length; ++i) {
            let fpath = fpathList[i];
            let guiIcon = new BABYLON.GUI.Image("", fpath);
            guiIcon.width = "60px";
            guiIcon.height = "60px";
            guiIcon.top = "10px";
            guiIcon.left = "-" + ((fpathList.length-i-1)*70+10)+ "px";
            guiIcon.autoScale = false
            guiIcon.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            guiIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            guiIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            advancedTexture.addControl(guiIcon);   
            guiIconList.push(guiIcon);
        }
        {
            guiIconList[0].onPointerUpObservable.add(function() {
                console.log("back stage:");
                backStage();
            });
        }
        {
            guiIconList[1].onPointerUpObservable.add(function() {
                console.log("reload:");
                createStage(istage);
                resetPosiBall(pst);
            });
        }
        {
            guiIconList[2].onPointerUpObservable.add(function() {
                console.log("next stage:");
                nextStage();
            });
        }
    }


    // ------------------------------
    // メッセージ（数秒後にフェードアウト）
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Ready!";
    text2.color = "white";
    text2.fontSize = 24;
    text2.height = "36px";
    text2.top = "100px";
    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(text2);

    let clearText2 = function() {
        text2.text = "";
    }
    let setText2 = function(val, sdelay=2) {
        text2.text = "" + val;
        setTimeout(clearText2, sdelay*1000); // 2[sec]
    }


    // 静止判定
    // let isStopV = true;
    let isStop = function() {
        let vsq = ball._agg.body.getLinearVelocity().lengthSquared();
        return (vsq < 0.2);
    }

    // --- ドラッグ操作 ---
    var isDragging = false;
    var maxDragDistance = 6;   // これ以上引っ張っても威力は頭打ち
    let powerScale = 100.0;      // ドラッグ距離→初速の変換係数
    let elevationFactor = 0.01; // 上方向へどれだけ配分するか
    var trajectoryLine = null; // ドラッグ時にボールの軌道(想定)を表示用Line

    // マウス位置から地面位置を取得
    function getGroundPointFromPointer() {
        var plane = BABYLON.Plane.FromPositionAndNormal(ball.position, BABYLON.Vector3.Up());
        var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera);
        var dist = ray.intersectsPlane(plane);
        return dist === null ? null : ray.origin.add(ray.direction.scale(dist));
    }

    // 引数dragVector(カーソル位置からボール位置のベクトル)から、implus ベクトルを算出
    function computeImpulse(dragVector) {
        // let [powerScale, elevationFactor] = club2factor[golfClub]
        var horizontal = new BABYLON.Vector3(dragVector.x, 0, dragVector.z);
        var clampedLen = Math.min(horizontal.length(), maxDragDistance);
        var dir = horizontal.normalize();
        // var power = clampedLen * powerScale;
        var power = clampedLen * powerScale * ball._impRate * vPower;
        return dir.scale(power).add(new BABYLON.Vector3(0, power * elevationFactor, 0));
    }

    // ボールの想定移動の軌道を表示
    function showTrajectory(impulse) {
        var points = [];
        var pos = ball.position.clone();
        var vel = impulse.scale(1/ball._impRate*6);
        let tstep = 0.02, tmax = 0.25;
        for (var t = 0; t < tmax; t += tstep) {
            points.push(pos.clone());
            pos.addInPlace(vel.scale(tstep));
        }
        if (trajectoryLine) trajectoryLine.dispose();
        trajectoryLine = BABYLON.MeshBuilder.CreateLines("", { points }, scene);
        trajectoryLine.color = new BABYLON.Color3(1, 1, 0);
    }

    scene.onPointerObservable.add((pi) => {
        switch (pi.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                // ボールをクリックしてドラックを開始する
                if (isStop() && pi.pickInfo.hit && pi.pickInfo.pickedMesh === ball) {
                    isDragging = true;
                    camera.detachControl(); // ドラッグ中はカメラ回転を止める
                }
                break;

            case BABYLON.PointerEventTypes.POINTERMOVE:
                if (!isDragging) return;
                var p = getGroundPointFromPointer();
                if (!p) return;
                var dragVector = ball.position.subtract(p); // 引っ張った逆方向に飛ばす
                showTrajectory(computeImpulse(dragVector)); // ボールの想定移動の軌道を表示
                break;

            case BABYLON.PointerEventTypes.POINTERUP:
                if (!isDragging) return;
                isDragging = false;
                camera.attachControl(canvas, true);
                if (pi.pickInfo.hit && pi.pickInfo.pickedMesh === ball) {
                    if (trajectoryLine) { trajectoryLine.dispose(); trajectoryLine = null; }
                    return;
                }
                var p = getGroundPointFromPointer();
                if (p) {
                    var dragVector = ball.position.subtract(p);
                    if (dragVector.length() > 0.3) { // 誤操作防止のしきい値
                        ball._agg.body.applyImpulse(computeImpulse(dragVector), ball.position);
                        dragVector.y = 0;
                        dragVector.normalize();
                        ball._vF = dragVector.clone();
                        ball._vB = dragVector.cross(BABYLON.Vector3.Up()).normalize();
                        ball._spinloop = 100;
                    }
                }
                if (trajectoryLine) { trajectoryLine.dispose(); trajectoryLine = null; }
                break;
        }
    });

    scene.onBeforeRenderObservable.add((scene) => {
        if (ball == null) {
            return;
        }
        if (ball.position.y < pbottom.y) {
                // 場外/オービー
                let stext = "";
                setText2(stext);
                resetPosiBall(pst);
        }

        let vsq = ball._agg.body.getLinearVelocity().lengthSquared();
        if (vsq < 0.01) {
            // 移動が小さいときは静止させる .. バンカー内で移動させないように
            ball.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
            ball.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
        }
        // 打撃時のスピン操作
        if (ball._spinloop <= 0) {
            return;
        }
        --(ball._spinloop);
        if (vsq > 10) {
            if (ballSpin == 1) {
                // 玉のばらまき
                ball._agg.body.applyImpulse(ball._vB.scale(0.1), ball.position);
                {
                    const R360 = Math.PI*2;
                    let mesh = null;
                    if (ballList.length < nballList) {
                        mesh = crBall0(ball.position.clone());
                    } else {
                        mesh = ballList.shift();
                        mesh.position.copyFrom(ball.position);
                    }
                    ballList.push(mesh);
                    mesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
                    mesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
                    let rad = R360*Math.random();
                    let vdir = new BABYLON.Vector3.Random(-1, 1);
                    vdir.y = 0;
                    vdir.normalize();
                    mesh.position.addInPlace(vdir);
                    mesh._agg.body.applyImpulse(vdir.scale(100), mesh.position);

                }

            } else if (ballSpin == 2) {
                // 爆発(exposion)処理
                vsq = Math.sqrt(vsq)*0.1;
                let vroty = ball._vB.scale(-vsq);
                ball._agg.body.applyAngularImpulse(vroty);
                {
                    let radius = 5;
                    let strength = 10 * vPower;
                    setTimeout(function (origin) {
                        let event = physicsHelper.applyRadialExplosionImpulse( // or .applyRadialExplosionForce
                            origin,
                            {
                                radius: radius,
                                strength: strength,
                                falloff: BABYLON.PhysicsRadialImpulseFalloff.Linear, // or BABYLON.PhysicsRadialImpulseFalloff.Constant
                            }
                        );
                    }, 10, ball.position.clone());
                }
            }
        }
    })

    // ----------------------------------------

    let scoreBoard = {};
    let holeClearFlag = {};
    let ballList = [], nballList = 100;

    clearText2("");

    let stageList = [0, 1, 2, 3, 4, 5, 6, 7 ,8 ,9, 10]
    let nstage = stageList.length;
    let istage = 0; // 64x64アイコン
    let [width, height] = await createStage(istage);

    let ball = null;

    let pst = new BABYLON.Vector3(0, 10, -10);
    ball = changeBall(ballType, pst.clone());
//    camera = crCameraDef(); // debug
    camera = crCamera54(ball);

    return scene;
};


 export var createScene = createScene_test_3204; // 爆発、ばらまき

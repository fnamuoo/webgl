// ----------------------------------------
//

// Navigation path をドローンでトレース＋ゲームパッド／VirtualStick対応
// 
// ドローン操作の習熟のためのコース周回

// キーボード       / [ゲームパッド]
//
// ドローン（モード１）左：前後移動・左右旋回　右スティック：上昇下降・左右移動
//  - (w,s)        / [左スティック・十字キー]  .. 前後移動
//  - (a,d)        / [左スティック・十字キー]  .. 左右旋回
//  - カーソル上下 / [右スティック・十字キー]  .. 上昇下降
//  - カーソル右左 / [右スティック・十字キー]  .. 左右移動
//
// ドローン（モード２）左：上昇下降・左右旋回　右スティック：前後移動・左右移動
//  - (w,s)        / [左スティック・十字キー]  .. 上昇下降
//  - (a,d)        / [左スティック・十字キー]  .. 左右旋回
//  - カーソル上下 / [右スティック・十字キー]  .. 前後移動
//  - カーソル右左 / [右スティック・十字キー]  .. 左右移動
//
//  - n/p          / {該当なし}     .. ステージの切り替え
//  - c            / [LB/RB]        .. カメラの切り替え（俯瞰／自機視点／上空／マウス操作）
//  - m            / [BACK]         .. モード切替(mode1/mode2)
//  - h            / [START]        .. ヘルプ表示
//
// キーボード、ゲームパッド、Virtual-Joystick(スクリーン上のスティック)を有効にしている都合上、
// 各入力で混線した場合（入力が効かない場合）は、次の操作を
// - キーボード入力を優先したいとき　[SPACE]/[ENTER]　を押下
// - ゲームパッドを優先したいとき　ゲームパッドのボタン　を押下
// - Virtual-Joystickを優先したいとき　画面右下の「Enable/Disable Virtual-Joystick」　を押下
//
// Virtual-Joystickは画面上をドラッグ（押したままでズラした状態）をスティック入力とするものです。
// 画面の左半分と右半分で、左スティック、右スティックとしています。
// Virtual-Joystick入力を行うには画面右下のラベル「Enable/Disable Virtual-Joystick」を１回押下してください。
// もう一度押下すると解除します。
// 
// Virtual-Joystickで操作中は、他の操作（ヘルプや設定、ステージ選択のアイコン押下）ができません。
// Virtual-Joystickを解除した後に操作してください。

// ----------------------------------------

// const SCRIPT_URL1 = "./CourseData.js";
// const myTextPath = "textures/pipo-charachip007_.png"; // 男の子
// const lineArrowPath = 'textures/arrow_.png';
// const goalPath ="textures/amiga.jpg";

// --------------------------------------------

const SCRIPT_URL1 = "../090/CourseData.js";
const myTextPath = "../096/textures/pipo-charachip007_.png"; // 男の子
const lineArrowPath = 'textures/arrow_.png';
const goalPath ="../078/textures/amiga.jpg";
const iconPath1 = "textures/icon_question.png";
const iconPath2 = "textures/icon_gear2.png";
const iconPath3 = "textures/icon_golf6.png";
const courseInfoList = [
    ["MotegiSuperSpeedway", "pic/099_ss_100.jpg"],
    ["DaytonaSpeedway", "pic/099_ss_101.jpg"],
    ["HighSpeedRing", "pic/099_ss_102.jpg"],
    ["Random(2D)", "pic/099_ss_103.jpg"],
    ["AutumnRing", "pic/099_ss_104.jpg"],
    ["Suzuka", "pic/099_ss_105.jpg"],
    ["Robotrace_2024_KANSAI", "pic/099_ss_106.jpg"],
    ["Robotrace_2024_CHUBU", "pic/099_ss_107.jpg"],
    ["Robotrace_2024_Champ", "pic/099_ss_108.jpg"],
    ["Random(3D)", "pic/099_ss_109.jpg"],
];


// --------------------------------------------
// for PlayGround
// const SCRIPT_URL1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/090/CourseData.js";
// const myTextPath = "https://raw.githubusercontent.com/fnamuoo/webgl/main/096/textures/pipo-charachip007_.png"; // 男の子
// const lineArrowPath = 'https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/arrow_.png';
// const goalPath ="textures/amiga.jpg";
// const iconPath1 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/icon_question.png";
// const iconPath2 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/icon_gear2.png";
// const iconPath3 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/icon_golf6.png";
// const courseInfoList = [
//     ["MotegiSuperSpeedway", "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/pic/099_ss_100.jpg"],
//     ["DaytonaSpeedway", "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/pic/099_ss_101.jpg"],
//     ["HighSpeedRing", "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/pic/099_ss_102.jpg"],
//     ["Random(2D)", "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/pic/099_ss_103.jpg"],
//     ["AutumnRing", "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/pic/099_ss_104.jpg"],
//     ["Suzuka", "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/pic/099_ss_105.jpg"],
//     ["Robotrace_2024_KANSAI", "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/pic/099_ss_106.jpg"],
//     ["Robotrace_2024_CHUBU", "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/pic/099_ss_107.jpg"],
//     ["Robotrace_2024_Champ", "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/pic/099_ss_108.jpg"],
//     ["Random(3D)", "https://raw.githubusercontent.com/fnamuoo/webgl/main/099/pic/099_ss_109.jpg"],
// ];


// ======================================================================

let CourseData = null;
import(SCRIPT_URL1).then((obj) => { CourseData = obj; });

const R90 = Math.PI/2;

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let camera = null;
    let icamera=2, ncamera=4;
    var changeCamera = function(istage) {
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
        if (icamera >= 1 && myMesh!=null) {
            camera.lockedTarget = myMesh;
        }
    }

    const physicsPlugin = new BABYLON.HavokPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), physicsPlugin);

    const light = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(1, 1, 1), scene);
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    light.specular = new BABYLON.Color3(1, 1, 1);
    light.groundColor = new BABYLON.Color3(.5, .5, .5);
    light.intensity = 6

    let grndMeshBase;
    let grndMesh=null, grndAgg=null;
    let grndW =1000, grndH = 1000;
    {
        // 床を平面で表現
        grndMesh = BABYLON.MeshBuilder.CreateGround("ground", {width:grndW, height:grndH}, scene);
        grndMesh.material = new BABYLON.GridMaterial("", scene);
        grndMesh.material.majorUnitFrequency = 100;
        grndMesh.material.minorUnitVisibility  = 0.7;
        grndMesh.wireframe=true;
    }

    // --------------------------------------------------
    let linePoint = null;
    const lineTexture = new BABYLON.Texture(lineArrowPath, scene)
    lineTexture.hasAlpha = true
    let goalMesh = null;

    let istage = 0, nstage = 10;
    let trgMeshInfo = {};
    var createStage = function(istage) {
        if (Object.keys(trgMeshInfo).length > 0) {
            for (let key in trgMeshInfo) {
                let mesh = trgMeshInfo[key];
                if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
                mesh.dispose();
            }
            trgMeshInfo = {};
            goalMesh = null;
        }


        function drawLine(name, width, points) {
            const colors = []
            const color1 = BABYLON.Color3.Green()
            const color2 = BABYLON.Color3.Yellow()
            const color3 = BABYLON.Color3.Red()
            let n = points.length;
            let n50=Math.floor(n*0.5), n80=Math.floor(n*0.8);
            for (let i=0;i<n50;i++) {
                colors.push(color1)
            }
            for (let i=n50;i<n80;i++) {
                colors.push(color2)
            }
            for (let i=n80;i<n;i++) {
                colors.push(color3)
            }
            const line = BABYLON.CreateGreasedLine(name, {
                points,
                updatable: true
            }, {
                colorMode: BABYLON.GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY,
                width,
                useColors: true,
                colors
            })
            return line
        }
        if ((0<=istage && istage<=2) || (4<=istage && istage<=8)) {
            //地図からコース
            let data = [];
            if (istage==0) {
                data = CourseData.DATA.MotegiSuperSpeedway_new.xz.slice(0, -3);
            } else if (istage==1) {
                data = CourseData.DATA.DaytonaSpeedway_new.xz.slice(0, -3);
            } else if (istage==2) {
                data = CourseData.DATA.HighSpeedRing_new.xz.slice(0, -2);

            } else if (istage==4) {
                data = CourseData.DATA.AutumnRing_new.xzR.slice(0, -2);
            } else if (istage==5) {
                data = CourseData.DATA.Suzuka_new.xzR.slice(0, -1);
            } else if (istage==6) {
                data = CourseData.DATA.mm2024_08_knasai_new.xzR;
            } else if (istage==7) {
                data = CourseData.DATA.mm2024_04_tyubu_new.xzR;
            } else if (istage==8) {
                data = CourseData.DATA.mm2024_00_zenkoku_new.xzR;
            }
            let basePoints = [];
            if (istage<=2) {
                let iy=0, nz=0, scale=0.1, scaleY=1, adjx=0, adjy=2, adjz=0;
                for (let [ix,iz] of data) {
                    basePoints.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                }
            } else if (4<=istage && istage<=8) {
                // ４番目の引数で等差、１つ前の点との距離で差分を調整
                let iy=0, nz=0, scale=0.1, scaleY=1, adjx=0, adjy=2, adjz=0;
                let iystep=0;
                let iyrate = iystep*scale/5, ii=-1, ix, iz, dis, iy_;
                let [ix_, iz_, xxx] = data[0];
                for (let tmp of data) {
                    ++ii;
                    if (tmp.length == 2) {
                        [ix,iz] = tmp;
                        dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                        iystep = iyrate*dis;
                        iy += iystep;
                        basePoints.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                    } else if (tmp.length == 3) {
                        [ix,iz,iy_] = tmp;
                        if (iy_ == null) {
                            dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                            iystep = iyrate*dis;
                            iy += iystep;
                            basePoints.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                        } else {
                            iy = iy_ + iystep;
                            basePoints.push(new BABYLON.Vector3(ix*scale+adjx, iy_*scaleY+adjy, (nz-iz)*scale+adjz));
                        }
                    } else if (tmp.length == 4) {
                        [ix,iz,iy_, iyrate] = tmp;
                        iyrate *= scale/5;
                        if (iy_ == null) {
                            dis = Math.sqrt((ix-ix_)**2 + (iz-iz_)**2);
                            iystep = iyrate*dis;
                            iy += iystep;
                            basePoints.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                        } else {
                            iy = iy_ + iystep;
                            basePoints.push(new BABYLON.Vector3(ix*scale+adjx, iy_*scaleY+adjy, (nz-iz)*scale+adjz));
                        }
                    }
                    [ix_,iz_] = [ix,iz];
                }
            }
            const points = BABYLON.Curve3.CreateCatmullRomSpline(basePoints, 1000 / basePoints.length).getPoints()
            const length = BABYLON.GreasedLineTools.GetLineLength(points)
            let mesh = drawLine("st1mesh", 1, points)
            mesh.material.emissiveTexture = lineTexture
            mesh.material.diffuseTexture = lineTexture
            lineTexture.uScale = length / 2
            trgMeshInfo[mesh.id] = mesh;
            linePoint = points;

        } else if(istage==3) {
            // 平坦
            function createPath2(radius,radiusy=1) {
                const r = () => Math.max(0.2, Math.random())
                const pos = new BABYLON.Vector3(Math.sin(0) * radius * r(),
                                                Math.cos(0) * radiusy * r()+1,
                                                Math.cos(1) * radius * r())
                const basePoints = new Array(30).fill().map((_, index) => {
                    const angle = (index / 20) * Math.PI * 2
                    return pos.add(new BABYLON.Vector3(Math.sin(angle) * radius * r(),
                                                       Math.cos(angle) * radiusy * r() - radiusy / 2+1,
                                                       Math.cos(angle) * radius * r() - radius / 4)).clone()
                })
                const points = BABYLON.Curve3.CreateCatmullRomSpline(basePoints, 1000 / basePoints.length).getPoints()
                const length = BABYLON.GreasedLineTools.GetLineLength(points)
                return {
                    points,
                    length
                }
            }
            let radius = 100;
            let {points, length} = createPath2(radius)
            let mesh = drawLine("st1mesh", 1, points)
            mesh.material.emissiveTexture = lineTexture
            mesh.material.diffuseTexture = lineTexture
            lineTexture.uScale = length / 2
            trgMeshInfo[mesh.id] = mesh;
            linePoint = points;

        } else if(istage==9) {
            // 超難関
            function createPath(radius) {
                const r = () => Math.max(0.2, Math.random())
                const pos = new BABYLON.Vector3(Math.sin(0) * radius * r(),
                                                Math.cos(0) * radius * r(),
                                                Math.cos(1) * radius * r())
                const basePoints = new Array(30).fill().map((_, index) => {
                    const angle = (index / 20) * Math.PI * 2
                    return pos.add(new BABYLON.Vector3(Math.sin(angle) * radius * r(),
                                                       Math.cos(angle) * radius * r() - radius / 2,
                                                       Math.cos(angle) * radius * r() - radius / 4)).clone()
                })
                const points = BABYLON.Curve3.CreateCatmullRomSpline(basePoints, 1000 / basePoints.length).getPoints()
                const length = BABYLON.GreasedLineTools.GetLineLength(points)
                return {
                    points,
                    length
                }
            }
            let radius = 100;
            let {points, length} = createPath(radius)
            let mesh = drawLine("st1mesh", 1, points)
            mesh.material.emissiveTexture = lineTexture
            mesh.material.diffuseTexture = lineTexture
            lineTexture.uScale = length / 2
            trgMeshInfo[mesh.id] = mesh;
            linePoint = points;

        }
        // myMesh
        myMesh.position.copyFrom(linePoint[0]);
        let p2 = linePoint[2].clone();
        p2.subtractInPlace(linePoint[0]);
        let vrot = Math.atan2(p2.x, p2.z);
        myMesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
        myMesh.rotate(BABYLON.Vector3.Up(), vrot);
        myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
        myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める

        // ゴール地点のメッシュ
        let pGoal = linePoint[linePoint.length-1].clone();
        goalMesh = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: 6}, scene);
        goalMesh.position.copyFrom(pGoal);
        goalMesh.position.y += 0.2;
        goalMesh.material = new BABYLON.StandardMaterial("mat");
        goalMesh.material.diffuseTexture = new BABYLON.Texture(goalPath, scene);
        goalMesh.material.alpha = 0.5;
        trgMeshInfo[goalMesh.id] = goalMesh;
    }

    scene.onBeforeRenderObservable.add(() => {
        const animRatio = scene.getAnimationRatio()
        lineTexture.uOffset -= 0.04 * animRatio

        if (goalMesh != null) {
            goalMesh.rotate(BABYLON.Axis.Y, 0.002 * animRatio)
        }
    })


    // --------------------------------------------------
    // 自機
    let myMesh = null;
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
    let imesh=0, nmesh=1;
    var createMyMesh = function(imesh) {
        let p = new BABYLON.Vector3(0, 1, 0);
        let q = new BABYLON.Quaternion();
        if (myMesh!=null) {p=myMesh.position.clone(); q=myMesh.rotationQuaternion.clone(); myMesh.dispose()}
        {
            // 四角ボード
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
        }
        if (icamera >= 1 && camera!=null) {
            camera.lockedTarget = myMesh;
        }
    }

    createMyMesh(imesh);
    changeCamera(icamera);
    createStage(istage);

    // 0:key-mode1, 1:key-mode2,
    // 2:gamepad-mode1, 3:gamepad-mode2
    // 4:v-stick-mode1, 5:v-stick-mode2
    let idevice=1;
    let act = {mfb:0, mrl:0, mud:0, rrl:0};
    let map ={};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    let quick=false, rightRoll = false, lefttRoll = false;
    let mx=1,mz=1;
    let mvScale=0.2;
    let cooltime_act = 0, cooltime_actIni = 10;
    scene.registerAfterRender(function() {
        if(idevice==0){
            // ドローン（モード１）左：前後移動・左右旋回　右スティック：上昇下降・左右移動
            let quat = myMesh.rotationQuaternion;
            act.mud=0;
            if (map["ArrowUp"]) {
                act.mud=1;
            } else if (map["ArrowDown"]) {
                act.mud=-1;
            }
            act.mrl=0;
            if (map["ArrowRight"]) {
                act.mrl=1;
            } else if (map["ArrowLeft"]) {
                act.mrl=-1;
            }

            act.mfb=0;
            if (map["w"]) {
                act.mfb=1;
            } else if (map["s"]) {
                act.mfb=-1;
            }
            act.rrl=0;
            if (map["a"]) {
                act.rrl=1;
            } else if (map["d"]) {
                act.rrl=-1;
            }
        }

        if(idevice==1){
            // ドローン（モード２）左：上昇下降・左右旋回　右スティック：前後移動・左右移動
            let quat = myMesh.rotationQuaternion;
            act.mfb=0;
            if (map["ArrowUp"]) {
                act.mfb=1;
            } else if (map["ArrowDown"]) {
                act.mfb=-1;
            }
            act.mrl=0;
            if (map["ArrowRight"]) {
                act.mrl=1;
            } else if (map["ArrowLeft"]) {
                act.mrl=-1;
            }

            act.mud=0;
            if (map["w"]) {
                act.mud=1;
            } else if (map["s"]) {
                act.mud=-1;
            }
            act.rrl=0;
            if (map["a"]) {
                act.rrl=1;
            } else if (map["d"]) {
                act.rrl=-1;
            }
        }

        // act の各パラメータについてのアクション
        {
            let quat = myMesh.rotationQuaternion;
            let vdir = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
            myMesh.position.addInPlace(vdir.scale(mvScale*act.mfb));
        }
        {
            let quat = myMesh.rotationQuaternion;
            let vdir = BABYLON.Vector3.Right().applyRotationQuaternion(quat);
            myMesh.position.addInPlace(vdir.scale(mvScale*act.mrl));
        }
        {
            let quat = myMesh.rotationQuaternion;
            let vdir = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
            myMesh.position.addInPlace(vdir.scale(mvScale*act.mud));
        }
        {
            let quat = myMesh.rotationQuaternion;
            let qYL = BABYLON.Quaternion.FromEulerAngles(0, -0.05*act.rrl, 0);
            quat.multiplyInPlace(qYL);
        }

        if (map["Enter"]) {
            let eular = myMesh.rotationQuaternion.toEulerAngles()
            let quat = BABYLON.Quaternion.RotationYawPitchRoll(eular.y, 0, 0);
            myMesh.rotationQuaternion = quat;
            myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
            myMesh.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 慣性を止める
            if (idevice>=4) {
                idevice-=4;
            } else if (idevice>=2) {
                idevice-=2;
            }
        }
        if (map[" "]) {
            if (idevice>=4) {
                idevice-=4;
            } else if (idevice>=2) {
                idevice-=2;
            }
        }

        if (cooltime_act > 0) {
            --cooltime_act;
        } else {
            if (map["m"]) {
                cooltime_act = cooltime_actIni;
                if (idevice>=4) {
                    idevice-=4;
                } else if (idevice>=2) {
                    idevice-=2;
                } else {
                    idevice = (idevice+1)%2;
                }
                    if (idevice==0) {
                        console.log("key-mode1");
                    } else if (idevice==1) {
                        console.log("key-mode2");
                    }
            }

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
            if (map["c"]) {
                cooltime_act = cooltime_actIni;
                icamera = (icamera+1)%ncamera;
                changeCamera(icamera);
            }

            if (map["h"]) {
                cooltime_act = cooltime_actIni;
                // help表示のON/OFF
                changeUsageView();
            }
        }
    });


    // ----------------------------------------------------------------------
    // ゲームパッドのオペレーションを追加
    //Create gamepad to handle controller connect/disconnect
    var gamepadManager = new BABYLON.GamepadManager();
    
    gamepadManager.onGamepadConnectedObservable.add((gamepad, state)=>{
        //Handle gamepad types
        if (gamepad instanceof BABYLON.Xbox360Pad) {
            console.log(" Xbox360Button...");
        } else if (gamepad instanceof BABYLON.DualShockPad) {
            console.log(" DualShock...");
        } else if (gamepad instanceof BABYLON.GenericPad) {
            // console.log(" GenericPad...");
        } else if (gamepad instanceof BABYLON.PoseEnabledController) {
            console.log(" PoseEnabledController...");
        }
        // 以下、BABYLON.GenericPad の前提で実装

        gamepad.onButtonDownObservable.add((button, state)=>{
            if (idevice<=1){
                idevice+=2;
            } else if (idevice>=4){
                idevice-=2;
            }
            if (0) {
            } else if (button == 4) { // LB/5
                cooltime_act = cooltime_actIni;
                icamera = (icamera+ncamera-1)%ncamera;
                changeCamera(icamera);
            } else if (button == 5) { // RB/6
                cooltime_act = cooltime_actIni;
                icamera = (icamera+1)%ncamera;
                changeCamera(icamera);

            } else if (button == 6) { // LT/6
                cooltime_act = cooltime_actIni;
                istage = (istage+nstage-1)%nstage;
                createStage(istage);
            } else if (button == 7) { // RT/7
                cooltime_act = cooltime_actIni;
                istage = (istage+1)%nstage;
                createStage(istage);

            } else if (button == 8) { // back
                idevice = ((idevice+1)%2)+2;
                if (idevice==2) {
                    console.log("gamepad-mode1");
                } else if (idevice==3) {
                    console.log("gamepad-mode2");
                }
            } else if (button == 9) { // start
                cooltime_act = cooltime_actIni;
                // help表示のON/OFF
                changeUsageView();
            }

            if (idevice==2){
                // ドローン（モード１）左：前後移動・左右旋回　右スティック：上昇下降・左右移動
                if ((button==3) || (button==0)) {
                    act.mud=(button==3)-(button==0); // Y-A
                }
                if ((button==1) || (button==2)) {
                    act.mrl=(button==1)-(button==2); // B-X
                }
                if ((button==12) || (button==13)) {
                    act.mfb=(button==12)-(button==13); // Up-Down
                }
                if ((button==14) || (button==15)) {
                    act.rrl=(button==14)-(button==15); // Right-Left
                }
            } else if (idevice==3){
                // ドローン（モード２）左：上昇下降・左右旋回  右スティック：前後移動・左右移動
                if ((button==3) || (button==0)) {
                    act.mfb=(button==3)-(button==0); // Y-A
                }
                if ((button==1) || (button==2)) {
                    act.mrl=(button==1)-(button==2); // B-X
                }
                if ((button==12) || (button==13)) {
                    act.mud=(button==12)-(button==13); // Up-Down
                }
                if ((button==14) || (button==15)) {
                    act.rrl=(button==14)-(button==15); // Right-Left
                }
            }
        })

        gamepad.onButtonUpObservable.add((button, state)=>{
            if (idevice==2){
                // // ドローン（モード１）左：前後移動・左右旋回　右スティック：上昇下降・左右移動
                if ((button==3) || (button==0)) {
                    act.mud=0; // Y-A
                }
                if ((button==1) || (button==2)) {
                    act.mrl=0; // B-X
                }
                if ((button==12) || (button==13)) {
                    act.mfb=0; // Up-Down
                }
                if ((button==14) || (button==15)) {
                    act.rrl=0; // Right-Left
                }
            } else if (idevice==3){
                // ドローン（モード２）左：上昇下降・左右旋回  右スティック：前後移動・左右移動
                if ((button==3) || (button==0)) { // Y-A
                    act.mfb=0;
                }
                if ((button==1) || (button==2)) { // B-X
                    act.mrl=0;
                }
                if ((button==12) || (button==13)) { // Up-Down
                    act.mud=0;
                }
                if ((button==14) || (button==15)) { // Right-Left
                    act.rrl=0;
                }
            }
        })

        //Stick events
        gamepad.onleftstickchanged((values)=>{
            if (idevice==2){
                // ドローン（モード１）左：前後移動・左右旋回　右スティック：上昇下降・左右移動
                act.rrl = -values.x;
                act.mfb = -values.y;
            } else if (idevice==3){
                // ドローン（モード２）左スティック：上昇下降・左右旋回
                act.rrl = -values.x;
                act.mud = -values.y;
            }
        });

        gamepad.onrightstickchanged((values)=>{
            if (idevice==2){
                // ドローン（モード１）左：前後移動・左右旋回　右スティック：上昇下降・左右移動
                act.mrl = values.x;
                act.mud = -values.y;
            } else if (idevice==3){
                // ドローン（モード２）右スティック：前後移動・左右移動
                act.mrl = values.x;
                act.mfb = -values.y;
            }
        });

    })

    gamepadManager.onGamepadDisconnectedObservable.add((gamepad, state)=>{
        console.log(" Disconnected", gamepad.id );
    })


    // ----------------------------------------------------------------------
    // virtual stick のオペレーションを追加
    {

        // Create joystick and set z index to be below playgrounds top bar
        var leftJoystick = new BABYLON.VirtualJoystick(true);
        var rightJoystick = new BABYLON.VirtualJoystick(false);
        BABYLON.VirtualJoystick.Canvas.style.zIndex = "-1";

        var movespeed = 20;
        scene.onBeforeRenderObservable.add(()=>{
            if(leftJoystick.pressed){
                if (idevice<=1){
                    idevice+=4;
                } else if (idevice<=3){
                    idevice+=2;
                }
                let vx = leftJoystick.deltaPosition.x * (engine.getDeltaTime()/1000)*movespeed;
                let vy = leftJoystick.deltaPosition.y * (engine.getDeltaTime()/1000)*movespeed;
                if (idevice==4){
                    // ドローン（モード１）左：前後移動・左右旋回　右スティック：上昇下降・左右移動
                    act.rrl = -vx;
                    act.mfb = -vy;
                } else if (idevice==5){
                    // ドローン（モード２）左スティック：上昇下降・左右旋回
                    act.rrl = -vx;
                    act.mud = vy;
                }
            } else {
                if (idevice==4){
                    act.rrl = 0;
                    act.mfb = 0;
                } else if (idevice==5){
                    act.rrl = 0;
                    act.mud = 0;
                }
            }
            if(rightJoystick.pressed){
                let vx = rightJoystick.deltaPosition.x * (engine.getDeltaTime()/1000)*movespeed;
                let vy = rightJoystick.deltaPosition.y * (engine.getDeltaTime()/1000)*movespeed;
                if (idevice==4){
                    // ドローン（モード１）左：前後移動・左右旋回　右スティック：上昇下降・左右移動
                    act.mrl = vx;
                    act.mud = -vy;
                } else if (idevice==5){
                    // ドローン（モード２）右スティック：前後移動・左右移動
                    act.mrl = vx;
                    act.mfb = vy;
                }
            } else {
                if (idevice==4){
                    act.mrl = 0;
                    act.mud = 0;
                } else if (idevice==5){
                    act.mrl = 0;
                    act.mfb = 0;
                }
            }
        })

        // 安全のために右下に Virtual-Joystick の切り替えボタンを配置
        var btn = document.createElement("button")
        btn.innerText = "Enable/Disable Virtual-Joystick"
        btn.style.zIndex = 10;
        btn.style.position = "absolute"
        btn.style.bottom = "10px"
        btn.style.right = "0px"
        document.body.appendChild(btn)
        // Button toggle logic
        btn.onclick = ()=>{
            if(BABYLON.VirtualJoystick.Canvas.style.zIndex == "-1"){
                // -> ON
                BABYLON.VirtualJoystick.Canvas.style.zIndex = "4";
                if (idevice<=1){
                    idevice+=4;
                } else if (idevice<=3){
                    idevice+=2;
                }
                // 有効を示すようにスタイルを変更しておく
                btn.style.color="red";
                btn.style.background="yellow";
            }else{
                // -> OFF
                BABYLON.VirtualJoystick.Canvas.style.zIndex = "-1";
                // 無効を示すようにスタイルを戻しておく
                btn.style.color="black";
                btn.style.background="white";
            }
        }

        scene.onDisposeObservable.add(()=>{
            BABYLON.VirtualJoystick.Canvas.style.zIndex = "-1";
            document.body.removeChild(btn)
        })
    }

    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // 左上に使い方（操作方法）を表示
    let guiUsageRect = new BABYLON.GUI.Rectangle();
    {
        guiUsageRect.adaptWidthToChildren = true;
        guiUsageRect.width = "320px";
        guiUsageRect.height = "200px";
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
                +"(W,S): Up/Down\n"
                +"(A,D): Turn Left/Right\n"
                +"(Arrow UP/DOWN): Forward/Back\n"
                +"(Arrow Left/Right): Left/Right\n"
                +"(C) : Change Camera\n"
                +"(M) : Change Drone-Mode\n"
                +"(N,P) : Change Stage\n"
                +"H: show/hide this message";
            text1.color = "white";
            text1.width = "310px";
            text1.fontSize = 14;
            text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
            text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
            text1.paddingLeft = 12;
            grid.addControl(text1, 0, 0);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("but1", "Close");
            button.width = "120px";
            button.height = "30px";
            button.color = "white";
            button.fontSize = 16;
            button.background = "DarkGray";
            button.onPointerUpObservable.add(function() {
                guiUsageRect.isVisible = false;
            });
            grid.addControl(button, 1, 0);
        }
        guiUsageRect.isVisible = false;
    }
    var changeUsageView = function() {
        if (guiUsageRect.isVisible) {
            guiUsageRect.isVisible = false;
        } else {
            guiUsageRect.isVisible = true;
        }
    }

    // 画面左上。Ｑボタン
    var guiIconUsage = new BABYLON.GUI.Image("ctrl", iconPath1);
    {
        guiIconUsage.width = "60px";
        guiIconUsage.height = "60px";
        guiIconUsage.autoScale = false
        guiIconUsage.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIconUsage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        guiIconUsage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        guiIconUsage.onPointerUpObservable.add(function() {
            changeUsageView();
        });
        guiIconUsage.zIndex="-1";
        advancedTexture.addControl(guiIconUsage);   
    }

    // ----------------------------------------
    // setting

    let guiSettingRect = new BABYLON.GUI.Rectangle(); 
    guiSettingRect._obj1=[];
    guiSettingRect._obj2=[];
    {
        // キャラクター選択GUI作成
        guiSettingRect.width = "600px";
        guiSettingRect.height = "250px";
        guiSettingRect.cornerRadius = 20;
        guiSettingRect.color = "Orange";
        guiSettingRect.thickness = 4;
        guiSettingRect.background = "green";
        guiSettingRect.isVisible = false;
        guiSettingRect._obj=[];
        advancedTexture.addControl(guiSettingRect);
        //
        let rootPanel = new BABYLON.GUI.StackPanel();    
        rootPanel.width = "600px";
        rootPanel.height="200px";
        guiSettingRect.addControl(rootPanel);
        //
        let r1panel = new BABYLON.GUI.StackPanel();
        r1panel.width = "600px";
        r1panel.height="100px";
        r1panel.isVertical=false;
        rootPanel.addControl(r1panel);
        {
            var rectSpace = new BABYLON.GUI.Rectangle(); //spacer
            rectSpace.width = "20px";
            rectSpace.height = "0px";
            r1panel.addControl(rectSpace);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("b11", "Camera1\nMouse-Ctrl");
            button.width = "140px";
            button.height = "60px";
            button.color = "white";
            button.background = "black";
            r1panel.addControl(button);  
            button.onPointerUpObservable.add(function() {
                icamera=0;
                changeCamera(icamera);
                changeSettingView();
            });
            guiSettingRect._obj1.push(button);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("b12", "Camera2\nDriver's-View");
            button.width = "140px";
            button.height = "60px";
            button.color = "white";
            button.background = "black";
            r1panel.addControl(button);
            button.onPointerUpObservable.add(function() {
                icamera=1;
                changeCamera(icamera);
                changeSettingView();
            });
            guiSettingRect._obj1.push(button);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("b13", "Camera3\nBird-View");
            button.width = "140px";
            button.height = "60px";
            button.color = "white";
            button.background = "black";
            r1panel.addControl(button);  
            button.onPointerUpObservable.add(function() {
                icamera=2;
                changeCamera(icamera);
                changeSettingView();
            });
            guiSettingRect._obj1.push(button);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("b14", "Camera4\nTop-View");
            button.width = "140px";
            button.height = "60px";
            button.color = "white";
            button.background = "black";
            r1panel.addControl(button);  
            button.onPointerUpObservable.add(function() {
                icamera=3;
                changeCamera(icamera);
                changeSettingView();
            });
            guiSettingRect._obj1.push(button);
        }
        //
        let r2panel = new BABYLON.GUI.StackPanel();
        r2panel.width = "600px";
        r2panel.height="100px";
        r2panel.isVertical=false;
        rootPanel.addControl(r2panel);
        {
            var rectSpace = new BABYLON.GUI.Rectangle(); //spacer
            rectSpace.width = "20px";
            rectSpace.height = "0px";
            r2panel.addControl(rectSpace);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("b21", "Drone-Mode1");
            button.width = "240px";
            button.height = "40px";
            button.color = "white";
            button.background = "black";
            r2panel.addControl(button);
            button.onPointerUpObservable.add(function() {
                if (idevice<2) {
                    idevice=0;
                } else if (idevice<4) {
                    idevice=2;
                } else {
                    idevice=4;
                }
                changeSettingView();
            });
            guiSettingRect._obj2.push(button);
        }
        {
            var rectSpace = new BABYLON.GUI.Rectangle(); //spacer
            rectSpace.width = "70px";
            rectSpace.height = "0px";
            r2panel.addControl(rectSpace);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("b22", "Drone-Mode2");
            button.width = "240px";
            button.height = "40px";
            button.color = "white";
            button.background = "black";
            r2panel.addControl(button);
            button.onPointerUpObservable.add(function() {
                if (idevice<2) {
                    idevice=1;
                } else if (idevice<4) {
                    idevice=3;
                } else {
                    idevice=5;
                }
                changeSettingView();
            });
            guiSettingRect._obj2.push(button);
        }
    }
    var changeSettingView = function() {
        if (guiSettingRect.isVisible) {
            guiSettingRect.isVisible = false;
        } else {
            guiSettingRect.isVisible = true;
            for (let obj of guiSettingRect._obj1) {
                obj.background = "black";
            }
            guiSettingRect._obj1[icamera].background = "darkgray";
            for (let obj of guiSettingRect._obj2) {
                obj.background = "black";
            }
            let idevice_ = idevice%2;
            guiSettingRect._obj2[idevice_].background = "darkgray";
        }
    }

    // 画面右上。歯車ボタン
    var guiIconSetting = new BABYLON.GUI.Image("ctrl", iconPath2);
    {
        guiIconSetting.width = "60px";
        guiIconSetting.height = "60px";
        guiIconSetting.autoScale = false
        guiIconSetting.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIconSetting.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        guiIconSetting.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        guiIconSetting.onPointerUpObservable.add(function() {
            changeSettingView();
        });
        advancedTexture.addControl(guiIconSetting);   
    }

    // ----------------------------------------
    // ステージ選択

    let guiCourseRect = new BABYLON.GUI.Rectangle(); 
    guiCourseRect._obj=[];

    {
        // キャラクター選択GUI作成
        guiCourseRect.width = "600px";
        guiCourseRect.height = "400px";
        guiCourseRect.cornerRadius = 20;
        guiCourseRect.color = "Orange";
        guiCourseRect.thickness = 4;
        guiCourseRect.background = "green";
        guiCourseRect.isVisible = false;
        advancedTexture.addControl(guiCourseRect);
        //

        let r2panelSV = new BABYLON.GUI.ScrollViewer("", false);
        r2panelSV.width = "600px";
        r2panelSV.height = "380px";
        guiCourseRect.addControl(r2panelSV);
        //
        let r2panel = new BABYLON.GUI.StackPanel();
        r2panel.width = "600px";
        r2panel.height="2000px";
        r2panelSV.addControl(r2panel);
        //
        BABYLON.GUI.Button.CreateMyCustomButton = function (name, text, imageUrl) {
            const result = new BABYLON.GUI.Button(name);
            // Adding text
            const textBlock = new BABYLON.GUI.TextBlock(name + "_button", text);
            textBlock.textWrapping = true;
            textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            textBlock.paddingLeft = "50%";
            result.addControl(textBlock);
            // Adding image
            const iconImage = new BABYLON.GUI.Image(name + "_icon", imageUrl);
            iconImage.width = "50%";
            iconImage.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            iconImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            result.addControl(iconImage);
            return result;
        };
        //
        for (let ii=0; ii<courseInfoList.length; ++ii) {
            let [label, fpath] = courseInfoList[ii]
            let button = BABYLON.GUI.Button.CreateMyCustomButton("n_"+label, label, fpath);
            button.width = "560px";
            button.height = "200px";
            button.color = "white";
            button.background = "black";
            button.onPointerUpObservable.add(function() {
                istage = ii;
                createStage(istage);
                changeCourseView();
            });
            r2panel.addControl(button);
            guiCourseRect._obj.push(button);
        }
    }
    var changeCourseView = function() {
        if (guiCourseRect.isVisible) {
            guiCourseRect.isVisible = false;
        } else {
            guiCourseRect.isVisible = true;
            for (let obj of guiCourseRect._obj) {
                obj.background = "black";
            }
            guiCourseRect._obj[istage].background = "darkgray";
        }
    }

    // 画面右上。コース選択ボタン
    var guiIconCourse = new BABYLON.GUI.Image("ctrl", iconPath3);
    {
        guiIconCourse.width = "60px";
        guiIconCourse.height = "60px";
        guiIconCourse.top = "80px";
        guiIconCourse.autoScale = false
        guiIconCourse.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        guiIconCourse.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        guiIconCourse.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        guiIconCourse.onPointerUpObservable.add(function() {
            changeCourseView();
        });
        advancedTexture.addControl(guiIconCourse);   
    }

    return scene;

};

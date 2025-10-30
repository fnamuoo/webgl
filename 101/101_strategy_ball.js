// ----------------------------------------
// ストラテジーゲーム、領地獲得・拡大

// const lineArrowPath = 'textures/arrow_.png';
const lineArrowPath = '../099/textures/arrow_.png';
// const lineArrowPath = 'https://raw.githubusercontent.com/fnamuoo/webgl/main/099/textures/arrow_.png';


const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let myMesh=null;
    let camera = null;
    let icamera=0, ncamera=4;
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}

        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(5, 20,-10), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
        }
    }
    changeCamera(icamera);

    const light = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(1, 1, 1), scene);
    light.intensity = 0.7;
    light.specular = new BABYLON.Color3(0, 0, 0);

    const light2 = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(-1, 1, -1), scene);
    light2.intensity = 0.5;
    light2.specular = new BABYLON.Color3(0, 0, 0);

    // ----------------------------------------
    // GUI
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    let targetText = new BABYLON.GUI.TextBlock();
    {
        targetText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        targetText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        targetText.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
        targetText.text = "Target: none";
        targetText.color = "red";
        targetText.fontSize = 24;
        targetText.width = "300px";
        targetText.height = "30px";
        if (canvas.width < 500) {
            targetText.isVisible = false;
        }
        advancedTexture.addControl(targetText);
    }

    // --------------------------------------------------
    let istage = 0, nstage = 1;
    let trgMeshInfo = {};
    let rgnInfo = {0:{lbl:"(null)",
                      color:BABYLON.Color3.White(),
                     },
                   1:{lbl:"Blue",
                      color:BABYLON.Color3.Blue(),
                     },
                   2:{lbl:"Red",
                      color:BABYLON.Color3.Red(),
                     },
                   3:{lbl:"Green",
                      color:BABYLON.Color3.Green(),
                     },
                   4:{lbl:"Black",
                      color:BABYLON.Color3.Black(),
                     },
                   5:{lbl:"Yellow",
                      color:BABYLON.Color3.Yellow(),
                     },
                  };
    const nullRgn = 0;
    const myRgn = 1;
    let enemyAttRate = 0;

    let rgnMap = {}, rgnMeshList=[];
    let updateLabel = false;
    var createStage = function(istage) {
        updateLabel = false;
        rgnMap = {};
        rgnMeshList = []
        enemyAttRate = 0;
        if (Object.keys(trgMeshInfo).length > 0) {
            for (let key in trgMeshInfo) {
                let mesh = trgMeshInfo[key];
                if (typeof(mesh._agg) !== 'undefined') { mesh._agg.dispose(); }
                mesh.dispose();
            }
            trgMeshInfo = {};
        }
        let rgnMap2 = {}
        for (let k in rgnInfo) {
            rgnMap2[k] = [];
        }
        if (istage == 0) {
            rgnMap = {1:[0],
                      2:[8],
                     }
            enemyAttRate = 0.1;
            let nx=3, nz=3, ii=0, pad=10, px=0,py=0,pz=0;
            for (let iz=0; iz<nz; ++iz) {
                pz=(iz-1)*pad;
                for (let ix=0; ix<nx; ++ix,++ii) {
                    px=(ix-1)*pad;
                    let mesh = BABYLON.MeshBuilder.CreateSphere("m"+ii, { diameter: 6}, scene);
                    mesh.position.set(px,py,pz);
                    mesh.outlineWidth = 0.5;
                    mesh.material = new BABYLON.StandardMaterial("targetMat", scene);
                    mesh._idx = ii;
                    mesh._rgn = 0;
                    for (let keyR in rgnMap) {
                        let valRs = rgnMap[keyR];
                        if (valRs.includes(ii)) {
                            mesh._rgn = keyR;
                            break;
                        }
                    }
                    if (mesh._rgn == 1) {
                        mesh.material.diffuseColor = rgnInfo[mesh._rgn].color;
                        mesh._v = 0;
                    } else if (mesh._rgn == 2) {
                        mesh.material.diffuseColor = rgnInfo[mesh._rgn].color;
                        mesh._v = 0;
                    } else {
                        mesh.material.diffuseColor = rgnInfo[mesh._rgn].color;
                        mesh._v = BABYLON.Scalar.RandomRange(1, 10);
                    }
                    mesh._vlbl = -1;

                    rgnMap2[mesh._rgn].push(mesh._idx)
                    mesh.material.alpha = 0.5;
                    mesh.alpha = 0.1;
                    mesh._vmax = 100;
                    let meshLbl = BABYLON.MeshBuilder.CreatePlane("mL"+ii, {size:4, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                    meshLbl.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;   
                    meshLbl.parent = mesh;
                    mesh._lbl = meshLbl;
                    trgMeshInfo[mesh._idx] = mesh;
                    rgnMeshList.push(mesh);
                }
            }
        }
        rgnMap = rgnMap2;

        targetText.text = "From:(L-click) - To:(R-click)";
        updateLabel = true;
    }

    let nextStage = function() {
        if (++istage==nstage) {istage=0}
        createStage(istage);
        initLabel();
    }
    let resetStage = function() {
        createStage(istage);
        initLabel();
    }

    

    let selectFrom=[], selectTo=[];

    // 左クリックで from、右クリックで to、+Ctrlで追加、ダブルクリックでクリア
    targetText.text = "From:(L-click) - To:(R-click)";
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.pickInfo.hit && pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
            const pickedMesh = pointerInfo.pickInfo.pickedMesh;
            if (pointerInfo.event.button == 0) { // 左クリック .. from側
                if (!(rgnMap[1].includes(pickedMesh._idx))) {
                    // 自陣をクリックしていないのでスキップ
                    return;
                }
                if (pointerInfo.event.ctrlKey) {
                    // 追加
                } else {
                    // 新規に
                    for (let m of selectFrom) {
                        m.renderOutline = false;
                    }
                    selectFrom=[];
                    for (let m of selectTo) {
                        m.renderOutline = false;
                    }
                    selectTo=[];
                }
                selectFrom.push(pickedMesh);
                {
                    let m = pickedMesh;
                    m.renderOutline = true;
                    m.outlineColor = BABYLON.Color3.Blue();
                }
                targetText.text = "From:"+selectFrom[0].id+" - To:(R-click)";
            } else if (pointerInfo.event.button == 2) { // 右クリック
                if (pointerInfo.event.ctrlKey) {
                    // 追加
                } else {
                    // 新規に
                    for (let m of selectTo) {
                        m.renderOutline = false;
                    }
                    selectTo=[];
                }
                selectTo.push(pickedMesh);
                {
                    let m = pickedMesh;
                    m.renderOutline = true;
                    m.outlineColor = BABYLON.Color3.Red();
                }
                targetText.text = "From:"+selectFrom[0].id+" - To:"+selectTo[0].id;

                {
                    let meshT = selectTo[0];
                    for (let meshF of selectFrom) {
                        attackFromTo(meshF, meshT);
                    }
                }
            }
        }
    });

    if (0) {
    // ワンクリックで、from,to を交互に切り替える
    targetText.text = "From:(1st-click) - To:(2nd-click)";
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.pickInfo.hit && pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
            const pickedMesh = pointerInfo.pickInfo.pickedMesh;
            if (selectFrom.length==0 || selectTo.length>0) {
                // from
                for (let m of selectFrom) {
                    m.renderOutline = false;
                }
                for (let m of selectTo) {
                    m.renderOutline = false;
                }
                selectFrom=[];
                selectTo=[];
                selectFrom.push(pickedMesh);
                {
                    let m = pickedMesh;
                    m.renderOutline = true;
                    m.outlineColor = BABYLON.Color3.Blue();
                }
                targetText.text = "From:"+selectFrom[0].id+" - To:(2nd-click)";
            } else {
                // to
                for (let m of selectTo) {
                    m.renderOutline = false;
                }
                selectTo=[];
                selectTo.push(pickedMesh);
                {
                    let m = pickedMesh;
                    m.renderOutline = true;
                    m.outlineColor = BABYLON.Color3.Red();
                }
                targetText.text = "From:"+selectFrom[0].id+" - To:"+selectTo[0].id;
            }
        }
    });
    }

    let setTextMesh = function(mesh,text) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", {width:30, height:24}, scene);
        var font = "24px Arial";
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, null, null, font, "white", "transparent");
        var mat = new BABYLON.StandardMaterial("mat", scene);
        mat.diffuseTexture = dynamicTexture;
        mesh._lbl.material = mat;
    }

    let initLabel = function() {
        // ラベルの数値表示、初回
        for (let key in trgMeshInfo) {
            let mesh = trgMeshInfo[key];
            if (mesh._v > mesh._vmax) {mesh._v=0}
            setTextMesh(mesh, ""+Math.floor(mesh._v));
        }
    }

    const animRatio = scene.getAnimationRatio()*0.1;

    if (1) {
    scene.onBeforeRenderObservable.add(() => {
        if (updateLabel==false) {
            return;
        }
        for (let key in trgMeshInfo) {
            let mesh = trgMeshInfo[key];
            if (mesh._rgn==0) {
                continue;
            }
            if (mesh._v < mesh._vmax) {
                mesh._v += animRatio;
            }
            let vlbl = mesh._v > 99 ? 99 : Math.floor(mesh._v);  //99までしか表示させない
            {
                setTextMesh(mesh, ""+vlbl );
            }
            mesh._vlbl = vlbl;
        }
    })
    }

    resetStage();

    // ----------------------------------------
    let actList = [];
    let ilooopRend=0, nlooopRend=10;
    scene.onBeforeRenderObservable.add(() => {
        if (updateLabel==false) {
            return;
        }
        if (++ilooopRend < nlooopRend) {
            return;
        }
        ilooopRend=0;
        // ------------------------------
        // 攻撃動作
        {
            let actList_=[]
            for (let act of actList) {
                if (act.type=="att") {
                    if (act.meshF._rgn == act.meshT._rgn) {
                        act.meshT._v += act.vatt;
                    } else {

                        {
                            // debug
                            for (let rgn in rgnMap) {
                                let ilist = rgnMap[rgn];
                                for (let i of ilist) {
                                    let mesh = rgnMeshList[i];
                                    console.assert(rgn==mesh._rgn);
                                    console.assert(i==mesh._idx);
                                }
                            }
                        }

                        act.meshT._v -= act.vatt;
                        if (act.meshT._v < 0) {
                            act.meshT._v = Math.abs(act.meshT._v);
                            let rgnOld = act.meshT._rgn;
                            act.meshT._rgn = act.meshF._rgn;
                            act.meshT.material.diffuseColor = act.meshF.material.diffuseColor;

                            if (rgnOld in rgnMap) {
                                let i = rgnMap[rgnOld].indexOf(act.meshT._idx)
                                if (i >= 0) {
                                    // 配列から指定位置(index）の要素を取り除く
                                    rgnMap[rgnOld].splice(i, 1)
                                }
                            }
                            rgnMap[act.meshT._rgn].push(act.meshT._idx)

                            if (selectFrom.includes(act.meshT)) {
                                let i = selectFrom.indexOf(act.meshT);
                                selectFrom.splice(i, 1)
                                act.meshT.renderOutline = false;
                            }
                            if (selectTo.includes(act.meshT)) {
                                let i = selectTo.indexOf(act.meshT);
                                selectTo.splice(i, 1)
                                act.meshT.renderOutline = false;
                            }
                        }
                    }
                }
            }
            actList=actList_;
        }

        // ------------------------------
        // クリア判定
        {
            let winRgn=-1, winLen=0, totalLen=0;
            for (let key in rgnMap) {
                if (key==0) {continue;}
                let len = rgnMap[key].length;
                totalLen += len;
                if (winLen<len) {
                    winLen=len;
                    winRgn=key;
                }
            }
            if (totalLen==winLen) {
                updateLabel=false;
                if (myRgn==winRgn) {
                    console.log("win :",rgnInfo[winRgn].lbl);
                    targetText.text = "Cong!!  Win "+rgnInfo[winRgn].lbl;
                    setTimeout(nextStage, 3000);
                } else {
                    targetText.text = "Oh No. Defeat.";
                    setTimeout(resetStage, 3000);
                }
            }
        }

        // ------------------------------
        // 敵攻撃アルゴリズム
        {
            if (Math.random() > enemyAttRate) {
                return;
            }
            for (let keyR in rgnMap) {
                if (keyR == myRgn || keyR == nullRgn) {
                    continue;
                }
                let tlist = rgnMap[keyR];
                if (tlist.length == 0) { continue; }
                let i = Math.floor(Math.random()*tlist.length);
                let meshF = rgnMeshList[tlist[i]];

                let i2 = Math.floor(Math.random()*rgnMeshList.length);
                let meshT = rgnMeshList[i2];
                if (meshF._rgn==meshT._rgn) {
                    continue;
                }
                attackFromTo(meshF, meshT);
            }
        }

    })

    const lineTexture = new BABYLON.Texture(lineArrowPath, scene)
    lineTexture.hasAlpha = true
    // 攻撃
    let attackFromTo = function (meshF, meshT) {
        let basePoints = [];
        let v = meshF.position.subtract(meshT.position);
        let vy2 = v.x**2+v.z**2, vlen = Math.sqrt(vy2);
        v = meshF.position.add(meshT.position).scale(0.5);
        v.y += vlen/2;
        basePoints.push(meshF.position.clone());
        basePoints.push(v);
        basePoints.push(meshT.position.clone());
        const points = BABYLON.Curve3.CreateCatmullRomSpline(basePoints, 1000 / basePoints.length).getPoints()
        const length = BABYLON.GreasedLineTools.GetLineLength(points)

        let meshLine = null;
        {
            // 矢印の線分を表示
            function drawLine(name, width, points) {
                const colors = []
                const color = BABYLON.Color3.White()
                let n = points.length;
                for (let i=0;i<n;i++) {
                    colors.push(color)
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
            meshLine = drawLine("gline", 1, points);
            meshLine.material.emissiveTexture = lineTexture
            meshLine.material.diffuseTexture = lineTexture
            lineTexture.uScale = length / 2
            //
            scene.onBeforeRenderObservable.add(() => {
                const animRatio = scene.getAnimationRatio()
                lineTexture.uOffset -= 0.04 * animRatio
            })
        }

        {
            let frameRate = points.length;
            const moveAnim = new BABYLON.Animation("mvTrg", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3);
            let moveFrames=[], rotFrames=[], quatFrames=[], p0=points[0], p1, vec, rotX, rotZ;
            for (let iframe=0; iframe<points.length; ++iframe) {
                moveFrames.push({ frame:iframe, value:points[iframe].clone() });
                p1=points[iframe];
            }
            moveAnim.setKeys(moveFrames);

            let meshAtt = BABYLON.MeshBuilder.CreateSphere("att", { diameter: 1}, scene);
            let vatt = Math.floor(meshF._v);
            meshF._v -= vatt;

            let funcAnimEnd = function() {
                meshLine.dispose();
                meshAtt.dispose();
                actList.push({type:"att", meshF:meshF, meshT:meshT, vatt:vatt});
            }
            scene.beginDirectAnimation(meshAtt, [moveAnim], 0, frameRate, false, 1, funcAnimEnd);

        }

    }

    return scene;
}

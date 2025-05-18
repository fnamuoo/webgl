// 「SPS Tree Generator」で森をつくる
//
// キャラクターコントローラー
//  - カーソル上/(w) .. 前進
//  - カーソル下/(s) .. 後進／降下（空中）
//  - カーソル右左/(a,d) .. 方向転換
//  - space .. ジャンプ(ジャンプ時の移動は、地上の4倍に)
//  - c     .. カメラの視点切り替え

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.rotationOffset = 180;
    camera.radius = 10; // 3;
    camera.heightOffset = 2; // 1.1;
    camera.cameraAcceleration = 0.05; // 0.1;
    camera.maxCameraSpeed = 30;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 0;

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(20, 150, 70), scene);
    light.intensity = 0.7;

    let nb = new BABYLON.NoiseBlock();
    const nbvzero = new BABYLON.Vector3(0,0,0);
    // perlinの文様を変えずに meshサイズを変更するには nbscale*gridratio=一定とする
    let gridratio = 1, nbscale = 0.02/gridratio;
    let yratio = 20;
    function yposi(x,z) {
        return nb.noise(8, 0.5, new BABYLON.Vector3(x,z,0), nbvzero, nbscale)*yratio;
    }

    let rootPath = [];
    let size = 100, size_ = size/2;
    let nmin = -size_, nmax = size_+1;
    for (let iz = nmin; iz < nmax; ++iz) {
        let z = iz*gridratio;
        let path = []
        for (let ix = nmin; ix < nmax; ++ix) {
            let x = ix*gridratio;
            let y = yposi(x,z);
            path.push(new BABYLON.Vector3(x, y, z));
        }
        rootPath.push(path);
    }
    trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
    trgMesh.material = new BABYLON.NormalMaterial("mat", scene);
    trgMesh.material.wireframe = true;
    trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);


    // ----------------------------------------
    // 植樹 SPS

    var coordSystem=function(b){var g=b.normalize();b=0==Math.abs(b.x)&&0==Math.abs(b.y)?(new BABYLON.Vector3(b.z,0,0)).normalize():(new BABYLON.Vector3(b.y,-b.x,0)).normalize();var r=BABYLON.Vector3.Cross(b,g);return{x:b,y:g,z:r}},randPct=function(b,g){return 0==g?b:(1+(1-2*Math.random())*g)*b},createBranch=function(b,g,r,w,h,l,v,n,x){for(var t=[],d,c=[],f,q=[],a=0;12>a;a++)t[a]=[];for(var m=0;m<h;m++)for(a=m/h,d=g.y.scale(a*r),d.addInPlace(g.x.scale(v*Math.exp(-a)*Math.sin(l*a*Math.PI))),d.addInPlace(b),c[m]=d,d=n*(1+(.4*Math.random()-.2))*(1-(1-w)*a),q.push(d),a=0;12>a;a++)f=a*Math.PI/6,f=g.x.scale(d*Math.cos(f)).add(g.z.scale(d*Math.sin(f))),f.addInPlace(c[m]),t[a].push(f);for(a=0;12>a;a++)t[a].push(c[c.length-1]);return{branch:BABYLON.MeshBuilder.CreateRibbon("branch",{pathArray:t,closeArray:!0},x),core:c,_radii:q}},createTreeBase=function(b,g,r,w,h,l,v,n,x,t){var d=2/(1+Math.sqrt(5)),c=new BABYLON.Vector3(0,1,0),f,c=coordSystem(c),q=new BABYLON.Vector3(0,0,0),a=[],m=[],e=[],A=[],q=createBranch(q,c,b,g,r,1,x,1,t);a.push(q.branch);var y=q.core;m.push(y);e.push(q._radii);A.push(c);for(var q=y[y.length-1],y=2*Math.PI/h,z,u,p,C,B=0;B<h;B++)if(f=randPct(B*y,.25),f=c.y.scale(Math.cos(randPct(l,.15))).add(c.x.scale(Math.sin(randPct(l,.15))*Math.sin(f))).add(c.z.scale(Math.sin(randPct(l,.15))*Math.cos(f))),z=coordSystem(f),f=createBranch(q,z,b*v,g,r,n,x*d,g,t),p=f.core,p=p[p.length-1],a.push(f.branch),m.push(f.core),e.push(f._radii),A.push(z),1<w)for(var D=0;D<h;D++)u=randPct(D*y,.25),u=z.y.scale(Math.cos(randPct(l,.15))).add(z.x.scale(Math.sin(randPct(l,.15))*Math.sin(u))).add(z.z.scale(Math.sin(randPct(l,.15))*Math.cos(u))),u=coordSystem(u),C=createBranch(p,u,b*v*v,g,r,n,x*d*d,g*g,t),a.push(C.branch),m.push(C.core),e.push(f._radii),A.push(u);return{tree:BABYLON.Mesh.MergeMeshes(a),paths:m,radii:e,directions:A}},createTree=function(b,g,r,w,h,l,v,n,x,t,d,c,f,q,a,m){1!=h&&2!=h&&(h=1);var e=createTreeBase(b,g,r,h,l,v,n,d,c,m);e.tree.material=w;var A=b*Math.pow(n,h),y=A/(2*f),z=1.5*Math.pow(g,h-1);n=BABYLON.MeshBuilder.CreateDisc("leaf",{radius:z/2,tessellation:12,sideOrientation:BABYLON.Mesh.DOUBLESIDE},m);b=new BABYLON.SolidParticleSystem("leaveSPS",m,{updatable:!1});b.addShape(n,2*f*Math.pow(l,h),{positionFunction:function(b,a,g){a=Math.floor(g/(2*f));1==h?a++:a=2+a%l+Math.floor(a/l)*(l+1);var E=(g%(2*f)*y+3*y/2)/A,d=Math.ceil(r*E);d>e.paths[a].length-1&&(d=e.paths[a].length-1);var k=d-1,c=k/(r-1),m=d/(r-1);b.position=new BABYLON.Vector3(e.paths[a][k].x+(e.paths[a][d].x-e.paths[a][k].x)*(E-c)/(m-c),e.paths[a][k].y+(e.paths[a][d].y-e.paths[a][k].y)*(E-c)/(m-c)+(.6*z/q+e.radii[a][d])*(g%2*2-1),e.paths[a][k].z+(e.paths[a][d].z-e.paths[a][k].z)*(E-c)/(m-c));b.rotation.z=Math.random()*Math.PI/4;b.rotation.y=Math.random()*Math.PI/2;b.rotation.z=Math.random()*Math.PI/4;b.scale.y=1/q}});b=b.buildMesh();b.billboard=!0;n.dispose();d=new BABYLON.SolidParticleSystem("miniSPS",m,{updatable:!1});n=new BABYLON.SolidParticleSystem("minileavesSPS",m,{updatable:!1});var u=[];c=2*Math.PI/l;for(var p=0;p<Math.pow(l,h+1);p++)u.push(randPct(Math.floor(p/Math.pow(l,h))*c,.2));c=function(a,b,d){var c=d%Math.pow(l,h);1==h?c++:c=2+c%l+Math.floor(c/l)*(l+1);var f=e.directions[c],c=new BABYLON.Vector3(e.paths[c][e.paths[c].length-1].x,e.paths[c][e.paths[c].length-1].y,e.paths[c][e.paths[c].length-1].z),k=u[d],k=f.y.scale(Math.cos(randPct(v,0))).add(f.x.scale(Math.sin(randPct(v,0))*Math.sin(k))).add(f.z.scale(Math.sin(randPct(v,0))*Math.cos(k))),f=BABYLON.Vector3.Cross(BABYLON.Axis.Y,k),k=Math.acos(BABYLON.Vector3.Dot(k,BABYLON.Axis.Y)/k.length());a.scale=new BABYLON.Vector3(Math.pow(g,h+1),Math.pow(g,h+1),Math.pow(g,h+1));a.quaternion=BABYLON.Quaternion.RotationAxis(f,k);a.position=c;};for(var C=[],B=[],p=e.paths.length,D=e.paths[0].length,F=0;F<x;F++)C.push(2*Math.PI*Math.random()-Math.PI),B.push([Math.floor(Math.random()*p),Math.floor(Math.random()*(D-1)+1)]);p=function(a,c,b){var d=B[b][0],f=B[b][1],k=e.directions[d];c=new BABYLON.Vector3(e.paths[d][f].x,e.paths[d][f].y,e.paths[d][f].z);c.addInPlace(k.z.scale(e.radii[d][f]/2));b=C[b];k=k.y.scale(Math.cos(randPct(t,0))).add(k.x.scale(Math.sin(randPct(t,0))*Math.sin(b))).add(k.z.scale(Math.sin(randPct(t,0))*Math.cos(b)));b=BABYLON.Vector3.Cross(BABYLON.Axis.Y,k);k=Math.acos(BABYLON.Vector3.Dot(k,BABYLON.Axis.Y)/k.length());a.scale=new BABYLON.Vector3(Math.pow(g,h+1),Math.pow(g,h+1),Math.pow(g,h+1));a.quaternion=BABYLON.Quaternion.RotationAxis(b,k);a.position=c};d.addShape(e.tree,Math.pow(l,h+1),{positionFunction:c});d.addShape(e.tree,x,{positionFunction:p});d=d.buildMesh();d.material=w;n.addShape(b,Math.pow(l,h+1),{positionFunction:c});n.addShape(b,x,{positionFunction:p});w=n.buildMesh();b.dispose();w.material=a;a=BABYLON.MeshBuilder.CreateBox("",{},m);a.isVisible=!1;e.tree.parent=a;d.parent=a;return w.parent=a};

    //leaf material
    var green = new BABYLON.StandardMaterial("green", scene);
    green.diffuseColor = new BABYLON.Color3(0,1,0);	
    
    //trunk and branch material
    var bark = new BABYLON.StandardMaterial("bark", scene);
    bark.emissiveTexture = new BABYLON.Texture("https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bark_texture_wood.jpg/800px-Bark_texture_wood.jpg", scene);
    bark.diffuseTexture = new BABYLON.Texture("https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bark_texture_wood.jpg/800px-Bark_texture_wood.jpg", scene);
    bark.diffuseTexture.uScale = 2.0; //Repeat 5 times on the Vertical Axes
    bark.diffuseTexture.vScale = 2.0; //Repeat 5 times on the Horizontal Axes		
    
    //Tree parameters			
    var trunk_height = 20;  // 木の幹の高さ。初期の幹の半径は 1 単位です。
    var trunk_taper = 0.6;  // 枝の終了半径に対する開始半径の割合 (0 ～ 1)。
    var trunk_slices = 5;   // 枝を形成するリボン メッシュに使用されるパス上の点の数。
    var boughs = 2; // 1 or 2 : 木が枝分かれする回数。1 の場合、幹が枝に分岐し、2 の場合、これらの枝も枝に分岐します。
    var forks = 4;          // 枝が分岐できる枝の数。5 以上だと生成が遅くなります。
    var fork_angle = Math.PI/4;  // 枝分かれした枝が親枝となす角度 (枝の方向から測定)。
    var fork_ratio = 2/(1+Math.sqrt(5)); //PHI the golden ratio // 枝の長さと親の長さの比率 (0 ～ 1)。
    var branch_angle = Math.PI/3; // ミニ ツリーが親枝となす角度 (枝の方向から測定)。
    var bow_freq = 2;       // 枝の弓形 (曲がり) の数。幹には、弓形が 1 つだけになるように設定されています。
    var bow_height = 3.5;   // 枝の方向の線からの弓形の高さ。
    var branches = 10;      // 木にランダムに追加されるミニ ツリーの数。
    var leaves_on_branch = 5; // 枝の片側に追加する葉の数。
    var leaf_wh_ratio = 0.5; // 葉の幅と高さの比率 (0 と 1 の間)。0 に近いほど葉が長く、1 に近いほど円形になります。    

    var tree = createTree(trunk_height, trunk_taper, trunk_slices, bark, boughs, forks, fork_angle, fork_ratio, branches, branch_angle, bow_freq, bow_height, leaves_on_branch, leaf_wh_ratio, green, scene);
    tree.position.y += yposi(0,0);

    let x, y, z;

    // 強引に小さくすると、胴まわりがやたらふとくなる...
    trunk_height = 7;
    bow_height = 0.7;
    branches = 2;
    let treeSubOrg = createTree(trunk_height, trunk_taper, trunk_slices, bark, boughs, forks, fork_angle, fork_ratio, branches, branch_angle, bow_freq, bow_height, leaves_on_branch, leaf_wh_ratio, green, scene);
    x = size_/2, z = size_/2;
    treeSubOrg.position = new BABYLON.Vector3(x,yposi(x,z),z);

    let nloop = 19, rng = size_/2, rngLimit = size_*0.3;
    while (nloop > 0) {
        x = BABYLON.Scalar.RandomRange(-rng, rng);
        z = BABYLON.Scalar.RandomRange(-rng, rng);
        if (Math.abs(x) < rngLimit && Math.abs(z) < rngLimit) {
            continue;
        }

        // let treeSub = createTree(trunk_height, trunk_taper, trunk_slices, bark, boughs, forks, fork_angle, fork_ratio, branches, branch_angle, bow_freq, bow_height, leaves_on_branch, leaf_wh_ratio, green, scene);
        let treeSub = treeSubOrg.clone();
        treeSub.position = new BABYLON.Vector3(x,yposi(x,z),z);
        --nloop;
    } 

    // ----------------------------------------

    function createMat(type) {
        let mat = null;
        if (type=='std_wire') {
            mat = new BABYLON.StandardMaterial("mat", scene);
            mat.emissiveColor = BABYLON.Color3.Blue();
            mat.wireframe = true;
        } else if (type=='std_trans') {
	    mat = new BABYLON.StandardMaterial('mat', scene);
	    mat.diffuseColor = BABYLON.Color3.Blue();
	    mat.alpha = 0.7;
        } else if (type=='std_trans2') {
	    mat = new BABYLON.StandardMaterial('mat', scene);
	    mat.diffuseColor = BABYLON.Color3.White();
	    mat.alpha = 0.7;
        } else if (type=='nmr') {
            mat = new BABYLON.NormalMaterial("mat", scene);
            mat.wireframe = true;
        } else if (type=='grid') {
	    mat = new BABYLON.GridMaterial("mat", scene);
	    mat.majorUnitFrequency = 5;
	    mat.gridRatio = 0.5;
        } else if (type=='grad') {
	    mat = new BABYLON.GradientMaterial("grad", scene);
            mat.topColor = new BABYLON.Color3(0.6, 0.7, 0.9);
            mat.bottomColor = new BABYLON.Color3(0.4, 0.6, 0.4);
            mat.offset = 1;
            mat.scale = 0.3;
            // mat.smoothness = 1;
            // mat.wireframe = true;
        }
        return mat;
    }

    let matMy = createMat('std_trans'); // 自機

    // --------------------------------------------------
    // Player/Character state
    var state = "IN_AIR";
    let bDash = 3;
    var inAirSpeed = 30.0;
    var onGroundSpeed = 3.0;
    var inAirSpeedBase = 30.0;
    var onGroundSpeedBase = 3.0;
    var jumpHeight = 20;
    // var inAirSpeed = 20.0;
    // var onGroundSpeed = 5.0;
    // var jumpHeight = 5; // 1.5;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -18, 0);
    let characterHoverON  = new BABYLON.Vector3(0, 17.99, 0);
    let characterHoverOFF = new BABYLON.Vector3(0, 0, 0);
    let characterHover = characterHoverON;
    let keyAction = {forward:0, back:0, right:0, left:0, jump:0, down:0};

    // Physics shape for the character
    let myh = 1.8;
    let myr = 0.6;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: myh, radius: myr}, scene);
    displayCapsule.material = matMy;
    // let characterPosition = new BABYLON.Vector3(0, 10, -4);
    let characterPosition = new BABYLON.Vector3(0, 25, -4);
    // let characterPosition = new BABYLON.Vector3(points[0].x, points[0].y+10, points[0].z);
    // let characterPosition = new BABYLON.Vector3(0, yratio+ 10, -r*gridratio);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: myh, capsuleRadius: myr}, scene);

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 2);
    localAxes.xAxis.parent = displayCapsule; localAxes.yAxis.parent = displayCapsule; localAxes.zAxis.parent = displayCapsule;

    camera.lockedTarget = displayCapsule;

    var getNextState = function(supportInfo) {
        if (state == "IN_AIR_UP") {
            if (characterController.getVelocity().y > 0) {
                return "IN_AIR_UP";
            }
            return "IN_AIR";
        } else if (state == "IN_AIR") {
            if (keyAction.down) {
                characterHover = characterHoverOFF;
            } else {
                characterHover = characterHoverON;
            }
            if (supportInfo.supportedState == BABYLON.CharacterSupportedState.SUPPORTED) {
                return "ON_GROUND";
            }
            return "IN_AIR";
        } else if (state == "ON_GROUND") {
            if (supportInfo.supportedState != BABYLON.CharacterSupportedState.SUPPORTED) {
                return "IN_AIR_UP";
            }
            if (keyAction.jump) {
                return "START_JUMP";
            }
            return "ON_GROUND";
        } else if (state == "START_JUMP") {
            return "IN_AIR_UP";
        }
    }

    var getDesiredVelocity = function(deltaTime, supportInfo, characterOrientation_, currentVelocity) {
        let nextState = getNextState(supportInfo);
        if (nextState != state) {
            state = nextState;
        }
        let upWorld = characterGravity.normalizeToNew();
        upWorld.scaleInPlace(-1.0);
        let forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation_);
        if (state == "IN_AIR_UP") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (state == "IN_AIR") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            outputVelocity.addInPlace(characterHover.scale(deltaTime)); // 降下をゆっくりにする上向きのベクトル
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
            outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
            let inv1k = 1e-3;
            if (outputVelocity.dot(upWorld) > inv1k) {
                let velLen = outputVelocity.length();
                outputVelocity.normalizeFromLength(velLen);
                let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);
                let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
                outputVelocity = c.cross(upWorld);
                outputVelocity.scaleInPlace(horizLen);
            }
            outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
            return outputVelocity;
        } else if (state == "START_JUMP") {
            let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
            let curRelVel = currentVelocity.dot(upWorld);
            return currentVelocity.add(upWorld.scale(u - curRelVel));
        }
        return Vector3.Zero();
    }

    scene.onBeforeRenderObservable.add((scene) => {
        displayCapsule.position.copyFrom(characterController.getPosition());
    });

    scene.onAfterPhysicsObservable.add((_) => {
        if (scene.deltaTime == undefined) return;
        let dt = scene.deltaTime / 1000.0;
        if (dt == 0) return;
        let down = new BABYLON.Vector3(0, -1, 0);
        let support = characterController.checkSupport(dt, down);
        if (keyAction.right) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), 0.02);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0.02, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        } else if (keyAction.left) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), -0.02);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, -0.02, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        }
        let desiredLinearVelocity = getDesiredVelocity(dt, support, characterOrientation, characterController.getVelocity());
        characterController.setVelocity(desiredLinearVelocity);
        characterController.integrate(dt, support, characterGravity);
    });

    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.shiftKey) {
                inAirSpeed = inAirSpeedBase * bDash;
                onGroundSpeed = onGroundSpeedBase * bDash;
            }
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 'ArrowUp') {
                inputDirection.z = 1;
                keyAction.forward = 1;
            } else if (kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowDown') {
                if (state === "IN_AIR") {  // 空中なら降下
                    keyAction.down = 1;
                } else {  // 地上ならバック
                    inputDirection.z = -1;
                    keyAction.back = 1;
                }
            } else if (kbInfo.event.key == 'a' || kbInfo.event.key == 'ArrowLeft') {
                keyAction.left = 1;
            } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
                keyAction.right = 1;
            }
            if (kbInfo.event.key === 'Enter') {
                keyAction.jump = 1;
            } else if (kbInfo.event.key === ' ') {
                keyAction.jump = 1;
            } else if (kbInfo.event.key == 'c') {
                icamera = (icamera+1) % 4;
                // console.log("camera=",icamera);
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 10; // 3;
                    camera.heightOffset = 2; // 1.1;
                    camera.cameraAcceleration = 0.05;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 50;
                    camera.heightOffset = 4;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 10;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 2;
                    camera.heightOffset = 100;
                    camera.cameraAcceleration = 0.5;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.3;
                    camera.heightOffset = -0.01;
                    camera.cameraAcceleration = 0.3;
                    camera.maxCameraSpeed = 30;
                }

            } else if (kbInfo.event.key == 'r') {
                // キャラクターコントローラーの位置だけリセット
                characterController._position = characterPosition;

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
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowUp' || kbInfo.event.key == 'ArrowDown') {
                inputDirection.z = 0;    
                keyAction.forward = 0;
                keyAction.back = 0;
                keyAction.down = 0;
                // set off DASH
                inAirSpeed = inAirSpeedBase;
                onGroundSpeed = onGroundSpeedBase;
            }
            if (kbInfo.event.key == 'a' || kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowLeft' || kbInfo.event.key == 'ArrowRight') {
                inputDirection.x = 0;
                keyAction.left = 0;
                keyAction.right = 0;
            } else if (kbInfo.event.key === 'Enter' || kbInfo.event.key === ' ') {
                keyAction.jump = 0;
            }
            break;
        }
    });


    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "150px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n(W) or (Arrow UP): Forward\n(S) or (Arrow DOWN): Back/Down\n(A,D) or (Arrow Left/Right): turn Left/Right\n(Space): jump\nC: change Camera\nR: Reset position\nH: show/hide this message";
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

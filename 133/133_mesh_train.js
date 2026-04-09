// Babylon.js：ribbonメッシュで作る列車／車


// --------------------------------------------------
// for local
// const pathRoot = "./";
const pathRoot = "./";
// for playground
// const pathRoot = "https://raw.githubusercontent.com/fnamuoo/webgl/main/133/";

const fpathBoxTest = pathRoot + "textures/box_test.png";
const fpathBoxYAMANOTE = pathRoot + "textures/box_YAMANOTE.png";
const fpathNone = pathRoot + "textures/"; // 存在しないファイルを指定して、赤と黒の市松模様にする
const fpathRboxYAMANOTE = pathRoot + "textures/rbox_YAMANOTE.png";
const fpathBoxOp1 = pathRoot + "textures/box_op1.png";
const fpathBoxOp2 = pathRoot + "textures/box_op2.png";
const fpathBoxOp3 = pathRoot + "textures/box_op3.png";
const fpathRollA1 = pathRoot + "textures/rollA_1.png";
const fpathRollA2 = pathRoot + "textures/rollA_2.png";
const fpathRollB1 = pathRoot + "textures/rollB_1.png";
const fpathRollB2 = pathRoot + "textures/rollB_2.png";
const fpathCar = pathRoot + "textures/car.png";

// --------------------------------------------------

export var createScene_roundBox_0_ChatGPT = async function () {
    // 角の丸い柱状のメッシュを作る方法
    // 
    // 方法2：角丸矩形を Extrude（実用的）
    // 角丸四角形を作り、それを押し出します。
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 15, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    function createRoundedRect(w, h, r, segments) {
        const shape = [];
        const hw = w / 2 - r;
        const hh = h / 2 - r;
        function arc(cx, cz, start, end) {
            for (let i = 0; i <= segments; i++) {
                const t = start + (end - start) * (i / segments);
                shape.push(new BABYLON.Vector3(
                    cx + r * Math.cos(t),
                    0,
                    cz + r * Math.sin(t)
                ));
            }
        }
        arc(hw, hh, 0, Math.PI/2);
        arc(-hw, hh, Math.PI/2, Math.PI);
        arc(-hw, -hh, Math.PI, 3*Math.PI/2);
        arc(hw, -hh, 3*Math.PI/2, 2*Math.PI);
        return shape;
    }

    const shape = createRoundedRect(2,2,0.4,6);
    const mesh = BABYLON.MeshBuilder.ExtrudePolygon(
        "pillar",
        {
            shape: shape,
            depth: 5
        },
        scene
    );

    mesh.material = new BABYLON.StandardMaterial("");
    // mesh.material.wireframe=1;

    return scene;
}



export var createScene_roundBox_1 = async function () {
    // 角の丸い柱状のメッシュを作る方法
    // 断面をZ軸方向に動かす例

    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R270 = Math.PI*3/2;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    function createRoundedRect(width, height, r, arcdiv) {
        // 角丸の四角
        // (円弧部分の除く) 直線部分の長さ
        const hw = width / 2 - r;
        const hh = height / 2 - r;
        let plist = [];

        let drawArc = function(cx, cy, r, rads, rade, arcdiv) {
            // 1/4の円弧作成
            let pplist = [];
            let radstep = (rade - rads) / arcdiv
            for (let i = 0; i <= arcdiv; i++) {
                let rad = rads + radstep*i;
                let p = new BABYLON.Vector3(cx + r * Math.cos(rad), cy + r * Math.sin(rad), 0);
                pplist.push(p);
            }
            return pplist;
        }

        plist = plist.concat(drawArc(hw, hh, r, R0, R90, arcdiv));
        plist = plist.concat(drawArc(-hw, hh, r, R90, R180, arcdiv));
        plist = plist.concat(drawArc(-hw, -hh, r, R180, R270, arcdiv));
        plist = plist.concat(drawArc(hw, -hh, r, R270, R360, arcdiv));
        // 先頭を末尾に追加して閉じる
        plist.push(plist[0]);
        return plist;
    }

    let sizew=2, sizeh=2, arcR=0.4, arcDiv=6, sizel=5;

    let plist = createRoundedRect(sizew, sizeh, arcR, arcDiv);
    let zpath = [
	new BABYLON.Vector3(0, 0, sizel/2),
	new BABYLON.Vector3(0, 0, -sizel/2),
    ];

    let mesh = BABYLON.MeshBuilder.ExtrudeShape("", {
        shape:plist, path:zpath,
        cap: BABYLON.Mesh.CAP_ALL,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    }, scene);

    return scene;
}


export var createScene_roundBox_2 = async function () {
    // ribbon で角の丸い柱状のメッシュを作る方法

    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R270 = Math.PI*3/2;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(20, 50, 20));

    function createRoundedRect(width, height, r, arcdiv, z) {
        // 角丸の四角
        // (円弧部分の除く) 直線部分の長さ
        const hw = width / 2 - r;
        const hh = height / 2 - r;
        let plist = [];

        let drawArc = function(cx, cy, r, rads, rade, arcdiv, z) {
            // 1/4の円弧作成
            let pplist = [];
            let radstep = (rade - rads) / arcdiv
            for (let i = 0; i <= arcdiv; i++) {
                let rad = rads + radstep*i;
                let p = new BABYLON.Vector3(cx + r * Math.cos(rad), cy + r * Math.sin(rad), z);
                pplist.push(p);
            }
            return pplist;
        }

        plist = plist.concat(drawArc(hw, hh, r, R0, R90, arcdiv, z));
        plist = plist.concat(drawArc(-hw, hh, r, R90, R180, arcdiv, z));
        plist = plist.concat(drawArc(-hw, -hh, r, R180, R270, arcdiv, z));
        plist = plist.concat(drawArc(hw, -hh, r, R270, R360, arcdiv, z));
        // 先頭を末尾に追加して閉じる
        plist.push(plist[0]);
        return plist;
    }

    let sizew=2, sizeh=2, arcR=0.4, arcDiv=6, sizel=5;
    let pplist = [], z;
    z = -sizel/2;
    pplist.push(createRoundedRect(sizew, sizeh, arcR, arcDiv, z));
    z = sizel/2;
    pplist.push(createRoundedRect(sizew, sizeh, arcR, arcDiv, z));

    console.log("NODE=", pplist[0].length*pplist.length);

    let mesh = BABYLON.MeshBuilder.CreateRibbon("",{
        pathArray: pplist,
    },scene);

    mesh.material = new BABYLON.StandardMaterial("");
    mesh.material.wireframe=1;

    return scene;
}


export var createScene_roundBox_3 = async function () {
    // すべて丸角

    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R270 = Math.PI*3/2;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    function createRoundedRect(width, height, r, arcdiv, z) {
        // 角丸の一面の点情報
        // (円弧部分の除く) 矩形部分の長さ/2
        const hw = width / 2 - r;
        const hh = height / 2 - r;
        let plist = [];
        let drawArc = function(cx, cy, r, rads, rade, arcdiv, z) {
            // 1/4の円弧作成
            let pplist = [];
            let radstep = (rade - rads) / arcdiv
            for (let i = 0; i <= arcdiv; i++) {
                let rad = rads + radstep*i;
                let p = new BABYLON.Vector3(cx + r * Math.cos(rad), cy + r * Math.sin(rad), z);
                pplist.push(p);
            }
            return pplist;
        }
        plist = plist.concat(drawArc(hw, hh, r, R0, R90, arcdiv, z));
        plist = plist.concat(drawArc(-hw, hh, r, R90, R180, arcdiv, z));
        plist = plist.concat(drawArc(-hw, -hh, r, R180, R270, arcdiv, z));
        plist = plist.concat(drawArc(hw, -hh, r, R270, R360, arcdiv, z));
        // 先頭を末尾に追加して閉じる
        plist.push(plist[0]);
        return plist;
    }

    let sizew=2, sizeh=2, arcR=0.4, arcDiv=6, sizel=5;

    let pplist = [];

    {
        let plist = [], z, n=(arcDiv+1)*4+1;
        z = -sizel/2-arcR;
        for (let i = 0; i < n; ++i) {
            plist.push(new BABYLON.Vector3(0, 0, z));
        }
        pplist.push(plist);
    }
    {
        let sizeBw=sizew-arcR*2, sizeBh=sizeh-arcR*2;
        let radstep = R90 / arcDiv;
        for (let i = 0; i <= arcDiv; ++i) {
            let rad = radstep*i;
            let vsin = Math.sin(rad);
            let vcos = Math.cos(rad);
            let arcR_ = arcR*vsin;
            let sizew_ = sizeBw+arcR_*2;
            let sizeh_ = sizeBw+arcR_*2;
            let z = -sizel/2-arcR*vcos;
            pplist.push(createRoundedRect(sizew_, sizeh_, arcR_, arcDiv, z));
        }
        for (let i = 0; i <= arcDiv; ++i) {
            let rad = radstep*i;
            let vsin = Math.sin(rad);
            let vcos = Math.cos(rad);
            let arcR_ = arcR*vcos;
            let sizew_ = sizeBw+arcR_*2;
            let sizeh_ = sizeBw+arcR_*2;
            let z = sizel/2+arcR*vsin;
            pplist.push(createRoundedRect(sizew_, sizeh_, arcR_, arcDiv, z));
        }
    }
    {
        let plist = [], z, n=(arcDiv+1)*4+1;
        z = sizel/2+arcR;
        for (let i = 0; i < n; ++i) {
            plist.push(new BABYLON.Vector3(0, 0, z));
        }
        pplist.push(plist);
    }

    console.log("NODE=", pplist[0].length*pplist.length);

    let mesh = BABYLON.MeshBuilder.CreateRibbon("",{ pathArray: pplist, },scene);
    mesh.material = new BABYLON.StandardMaterial("");

    return scene;
}


export var createScene_box_1 = async function () {
    // boxのテクスチャ確認
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(20, 50, 20));
    const light4 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(-20, -50, -20));

    let s=2, sL=8, sL_=sL/2, eps=0.001;
    const faceUV = new Array(6);
    {
        faceUV[0] = new BABYLON.Vector4(1/6, 1, 0/6, 3/4); // 先頭(+z
        faceUV[1] = new BABYLON.Vector4(1/6, 3/4, 2/6, 1); // 末尾(-z
        faceUV[2] = new BABYLON.Vector4(5/6, 1, 4/6, 0); // 右　(+x
        faceUV[3] = new BABYLON.Vector4(5/6, 0, 1, 1); // 左  (-x
        faceUV[4] = new BABYLON.Vector4(4/6, 2/4, 0, 1/4); // 頂上(+y
        faceUV[5] = new BABYLON.Vector4(4/6, 1/4, 0, 0/4); // 底　(-y
    }
    let mesh = BABYLON.MeshBuilder.CreateBox("",{
        width:s, height:s, depth:sL, faceUV: faceUV,
    },scene);

    mesh.material = new BABYLON.StandardMaterial("");
    // const fpathBoxTest ="textures/box_test.png";
    mesh.material.diffuseTexture = new BABYLON.Texture(fpathBoxTest, scene);

    return scene;
}


export var createScene_box_2 = async function () {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(20, 50, 20));
    const light4 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(-20, -50, -20));

    let s=2, sL=8, sL_=sL/2, eps=0.001;
    const faceUV = new Array(6);
    {
        faceUV[0] = new BABYLON.Vector4(1/6, 1, 0/6, 3/4); // 先頭(+z
        faceUV[1] = new BABYLON.Vector4(1/6, 3/4, 2/6, 1); // 末尾(-z
        faceUV[2] = new BABYLON.Vector4(5/6, 1, 4/6, 0); // 右　(+x
        faceUV[3] = new BABYLON.Vector4(5/6, 0, 1, 1); // 左  (-x
        faceUV[4] = new BABYLON.Vector4(4/6, 2/4, 0, 1/4); // 頂上(+y
        faceUV[5] = new BABYLON.Vector4(4/6, 1/4, 0, 0/4); // 底　(-y
    }
    let mesh = BABYLON.MeshBuilder.CreateBox("",{width:s, height:s, depth:sL, faceUV: faceUV,},scene);
    mesh.material = new BABYLON.StandardMaterial("");
    // const fpathBoxYAMANOTE ="textures/box_YAMANOTE.png";
    mesh.material.diffuseTexture = new BABYLON.Texture(fpathBoxYAMANOTE, scene);

    return scene;
}


export var createScene_roundBox_4_0 = async function () {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 4 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(20, 50, 20));
    light2.intensity = 0.7;
    const light3 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(-20, -50, -20));
    light3.intensity = 0.7;

    let mesh = BABYLON.MeshBuilder.CreatePlane("",scene);
    mesh.material = new BABYLON.StandardMaterial("");
    // const fpathNone ="textures/"; // 存在しないファイルを指定して、赤と黒の市松模様にする
    mesh.material.diffuseTexture = new BABYLON.Texture(fpathNone, scene);

    return scene;
}

export var createScene_roundBox_4_1 = async function () {
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R270 = Math.PI*3/2;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(20, 50, 20));
    light2.intensity = 0.7;
    const light3 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(-20, -50, -20));
    light3.intensity = 0.7;

    function createRoundedRect(width, height, r, arcdiv, z) {
        // 角丸の四角
        let w_=width/2, h_=height/2;
        // (円弧部分の除く) 直線部分の長さ
        const hw = width / 2 - r;
        const hh = height / 2 - r;
        let plist = [];
        let drawArc = function(cx, cy, r, rads, rade, arcdiv, z) {
            // 1/4の円弧作成
            let pplist = [];
            let radstep = (rade - rads) / arcdiv
            for (let i = 0; i <= arcdiv; i++) {
                let rad = rads + radstep*i;
                let p = new BABYLON.Vector3(cx + r * Math.cos(rad), cy + r * Math.sin(rad), z);
                pplist.push(p);
            }
            return pplist;
        }
        plist.push(new BABYLON.Vector3(0, -h_, z)); // 真下
        plist = plist.concat(drawArc(-hw, -hh, r, R270, R180, arcdiv, z)); // 左下
        plist.push(new BABYLON.Vector3(-w_, 0, z)); // 左
        plist = plist.concat(drawArc(-hw, hh, r, R180, R90, arcdiv, z)); // 左上
        plist.push(new BABYLON.Vector3(0, h_, z)); // 真上
        plist = plist.concat(drawArc(hw, hh, r, R90, R0, arcdiv, z)); // 右上
        plist.push(new BABYLON.Vector3(w_, 0, z)); // 右
        plist = plist.concat(drawArc(hw, -hh, r, R360, R270, arcdiv, z)); // 右下
        plist.push(new BABYLON.Vector3(0, -h_, z)); // 真下
        return plist;
    }

    let sizew=2, sizeh=2, arcR=0.4, arcDiv=6, sizel=8;
    let pplist = [], z;
    let lendiv = 1, sizeldiv = sizel/lendiv, sizel_ = sizel/2;
    for (let iz = 0; iz <= lendiv; ++iz) {
        z = -iz*sizeldiv + sizel_;
        pplist.push(createRoundedRect(sizew, sizeh, arcR, arcDiv, z));
    }

    { // 1回に分割して、CAP(start側）を追加
        let pplist0 = pplist[0];
        z = sizel/2;
        for (let r of [0]) {
            let plist = []
            for (let p of pplist0) {
                plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
            }
            pplist.unshift(plist);
        }
    }
    { // 1回に分割して、CAP(end側)を追加
        let pplistE = pplist[pplist.length-1];
        z = -sizel/2;
        for (let r of [0]) {
            let plist = []
            for (let p of pplistE) {
                plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
            }
            pplist.push(plist);
        }
    }

    let mesh = BABYLON.MeshBuilder.CreateRibbon("",{ pathArray: pplist, },scene);
    mesh.material = new BABYLON.StandardMaterial("");
    // const fpathNone ="textures/"; // 存在しないファイルを指定して、赤と黒の市松模様にする
    mesh.material.diffuseTexture = new BABYLON.Texture(fpathNone, scene);

    return scene;
}

export var createScene_roundBox_4_2 = async function () {
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R270 = Math.PI*3/2;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(20, 50, 20));
    light2.intensity = 0.7;
    const light3 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(-20, -50, -20));
    light3.intensity = 0.7;

    function createRoundedRect(width, height, r, arcdiv, z) {
        // 角丸の四角
        let w_=width/2, h_=height/2;
        // (円弧部分の除く) 直線部分の長さ
        const hw = width / 2 - r;
        const hh = height / 2 - r;
        let plist = [];
        let drawArc = function(cx, cy, r, rads, rade, arcdiv, z) {
            // 1/4の円弧作成
            let pplist = [];
            let radstep = (rade - rads) / arcdiv
            for (let i = 0; i <= arcdiv; i++) {
                let rad = rads + radstep*i;
                let p = new BABYLON.Vector3(cx + r * Math.cos(rad), cy + r * Math.sin(rad), z);
                pplist.push(p);
            }
            return pplist;
        }
        plist.push(new BABYLON.Vector3(0, -h_, z)); // 真下
        plist = plist.concat(drawArc(-hw, -hh, r, R270, R180, arcdiv, z)); // 左下
        plist.push(new BABYLON.Vector3(-w_, 0, z)); // 左
        plist = plist.concat(drawArc(-hw, hh, r, R180, R90, arcdiv, z)); // 左上
        plist.push(new BABYLON.Vector3(0, h_, z)); // 真上
        plist = plist.concat(drawArc(hw, hh, r, R90, R0, arcdiv, z)); // 右上
        plist.push(new BABYLON.Vector3(w_, 0, z)); // 右
        plist = plist.concat(drawArc(hw, -hh, r, R360, R270, arcdiv, z)); // 右下
        plist.push(new BABYLON.Vector3(0, -h_, z)); // 真下
        return plist;
    }

    let sizew=2, sizeh=2, arcR=0.4, arcDiv=6, sizel=8;
    let pplist = [], z;
    let lendiv = 1, sizeldiv = sizel/lendiv, sizel_ = sizel/2;
    for (let iz = 0; iz <= lendiv; ++iz) {
        z = -iz*sizeldiv + sizel_;
        pplist.push(createRoundedRect(sizew, sizeh, arcR, arcDiv, z));
    }

    { // ４回に分割して、CAP(start側）を追加
        let pplist0 = pplist[0];
        z = sizel/2;
        for (let r of [0.75, 0.5, 0.25, 0.001]) {
            let plist = []
            for (let p of pplist0) {
                plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
            }
            pplist.unshift(plist);
        }
    }
    { // ４回に分割して、CAP(end側)を追加
        let pplistE = pplist[pplist.length-1];
        z = -sizel/2;
        for (let r of [0.75, 0.5, 0.25, 0.001]) {
            let plist = []
            for (let p of pplistE) {
                plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
            }
            pplist.push(plist);
        }
    }

    let mesh = BABYLON.MeshBuilder.CreateRibbon("",{ pathArray: pplist, },scene);
    mesh.material = new BABYLON.StandardMaterial("");
    // const fpathNone ="textures/"; // 存在しないファイルを指定して、赤と黒の市松模様にする
    mesh.material.diffuseTexture = new BABYLON.Texture(fpathNone, scene);

    return scene;
}


export var createScene_roundBox_5_1 = async function () {
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R270 = Math.PI*3/2;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 3, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(20, 50, 20));
    light2.intensity = 0.7;
    const light3 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(-20, -50, -20));
    light3.intensity = 0.7;

    function createRoundedRect(width, height, r, arcdiv, z) {
        // 角丸の四角
        let w_=width/2, h_=height/2;
        // (円弧部分の除く) 直線部分の長さ
        const hw = width / 2 - r;
        const hh = height / 2 - r;
        let plist = [];
        let drawArc = function(cx, cy, r, rads, rade, arcdiv, z) {
            // 1/4の円弧作成
            let pplist = [];
            let radstep = (rade - rads) / arcdiv
            for (let i = 0; i <= arcdiv; i++) {
                let rad = rads + radstep*i;
                let p = new BABYLON.Vector3(cx + r * Math.cos(rad), cy + r * Math.sin(rad), z);
                pplist.push(p);
            }
            return pplist;
        }
        plist.push(new BABYLON.Vector3(0, -h_, z)); // 真下
        plist = plist.concat(drawArc(-hw, -hh, r, R270, R180, arcdiv, z)); // 左下
        plist.push(new BABYLON.Vector3(-w_, 0, z)); // 左
        plist = plist.concat(drawArc(-hw, hh, r, R180, R90, arcdiv, z)); // 左上
        plist.push(new BABYLON.Vector3(0, h_, z)); // 真上
        plist = plist.concat(drawArc(hw, hh, r, R90, R0, arcdiv, z)); // 右上
        plist.push(new BABYLON.Vector3(w_, 0, z)); // 右
        plist = plist.concat(drawArc(hw, -hh, r, R360, R270, arcdiv, z)); // 右下
        plist.push(new BABYLON.Vector3(0, -h_, z)); // 真下
        return plist;
    }

    let createTrain = function() {
        let sizew=0.5, sizeh=0.5, arcR=0.1, arcDiv=6, sizel=2;
        let pplist = [], z;
        let lendiv = 1, sizeldiv = sizel/lendiv, sizel_ = sizel/2;
        for (let iz = 0; iz <= lendiv; ++iz) {
            z = -iz*sizeldiv + sizel_;
            pplist.push(createRoundedRect(sizew, sizeh, arcR, arcDiv, z));
        }

        { // 1回に分割して、CAP(start側）を追加
            let pplist0 = pplist[0];
            z = sizel/2;
            for (let r of [0.001]) {
                let plist = []
                for (let p of pplist0) {
                    plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                }
                pplist.unshift(plist);
            }
        }
        { // 1回に分割して、CAP(end側)を追加
            let pplistE = pplist[pplist.length-1];
            z = -sizel/2;
            for (let r of [0.001]) {
                let plist = []
                for (let p of pplistE) {
                    plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                }
                pplist.push(plist);
            }
        }

        let mesh = BABYLON.MeshBuilder.CreateRibbon("",{ pathArray: pplist, },scene);
        mesh.material = new BABYLON.StandardMaterial("");
        // const fpathRboxYAMANOTE ="textures/rbox_YAMANOTE.png";
        mesh.material.diffuseTexture = new BABYLON.Texture(fpathRboxYAMANOTE, scene);
        mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
        return mesh;
    }
    let mesh = createTrain();

    return scene;
}


export var createScene_roundBox_5_2 = async function () {
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R270 = Math.PI*3/2;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 3, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(20, 50, 20));
    light2.intensity = 0.7;
    const light3 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(-20, -50, -20));
    light3.intensity = 0.7;

    function createRoundedRect(width, height, r, arcdiv, z) {
        // 角丸の四角
        let w_=width/2, h_=height/2;
        // (円弧部分の除く) 直線部分の長さ
        const hw = width / 2 - r;
        const hh = height / 2 - r;
        let plist = [];
        let drawArc = function(cx, cy, r, rads, rade, arcdiv, z) {
            // 1/4の円弧作成
            let pplist = [];
            let radstep = (rade - rads) / arcdiv
            for (let i = 0; i <= arcdiv; i++) {
                let rad = rads + radstep*i;
                let p = new BABYLON.Vector3(cx + r * Math.cos(rad), cy + r * Math.sin(rad), z);
                pplist.push(p);
            }
            return pplist;
        }
        plist.push(new BABYLON.Vector3(0, -h_, z)); // 真下
        plist = plist.concat(drawArc(-hw, -hh, r, R270, R180, arcdiv, z)); // 左下
        plist.push(new BABYLON.Vector3(-w_, 0, z)); // 左
        plist = plist.concat(drawArc(-hw, hh, r, R180, R90, arcdiv, z)); // 左上
        plist.push(new BABYLON.Vector3(0, h_, z)); // 真上
        plist = plist.concat(drawArc(hw, hh, r, R90, R0, arcdiv, z)); // 右上
        plist.push(new BABYLON.Vector3(w_, 0, z)); // 右
        plist = plist.concat(drawArc(hw, -hh, r, R360, R270, arcdiv, z)); // 右下
        plist.push(new BABYLON.Vector3(0, -h_, z)); // 真下
        return plist;
    }


    let createTrain = function() {
        let sizew=0.5, sizeh=0.5, arcR=0.1, arcDiv=6, sizel=2;
        let pplist = [], z;
        let lendiv = 10, sizeldiv = sizel/lendiv, sizel_ = sizel/2;
        for (let iz = 0; iz <= lendiv; ++iz) {
            z = -iz*sizeldiv + sizel_;
            pplist.push(createRoundedRect(sizew, sizeh, arcR, arcDiv, z));
        }
        { // ４回に分割して、CAP(start側）を追加
            let pplist0 = pplist[0];
            z = sizel/2;
            for (let r of [0.75, 0.5, 0.25, 0.001]) {
                let plist = []
                for (let p of pplist0) {
                    plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                }
                pplist.unshift(plist);
            }
        }
        { // ４回に分割して、CAP(end側)を追加
            let pplistE = pplist[pplist.length-1];
            z = -sizel/2;
            for (let r of [0.75, 0.5, 0.25, 0.001]) {
                let plist = []
                for (let p of pplistE) {
                    plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                }
                pplist.push(plist);
            }
        }
        let mesh = BABYLON.MeshBuilder.CreateRibbon("",{ pathArray: pplist, },scene);
        mesh.material = new BABYLON.StandardMaterial("");
        // const fpathRboxYAMANOTE ="textures/rbox_YAMANOTE.png";
        mesh.material.diffuseTexture = new BABYLON.Texture(fpathRboxYAMANOTE, scene);
        mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
        return mesh;
    }
    let mesh = createTrain();

    return scene;
}



export var createScene_roundBox_6_TestRun = async function () {
    const R0 = 0;
    const R90 = Math.PI/2;
    const R180 = Math.PI;
    const R270 = Math.PI*3/2;
    const R360 = Math.PI*2;

    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 1, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20,-20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
        if (icamera == 1) {
            // ターゲットと並走
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 0.5, 3), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.useAutoRotationBehavior = true; // 自動でゆっくり回転
        }

    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    if (1) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
    }

    const points = [
        new BABYLON.Vector3(-10, 1, 0),
        new BABYLON.Vector3(0, 1, 10),
        new BABYLON.Vector3(10, 1, 0),
        new BABYLON.Vector3(0, 1, -10)
    ];
    const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 20, true); // 20は分割数,閉曲線にする
    let path3d = new BABYLON.Path3D(catmullRom.getPoints());
    let curve = path3d.getCurve(); // 視覚確認用の曲線
    const pathLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);
    pathLine.position.y += -0.25;

    const numMeshes = 4;
    let meshes = []; // 車両のメッシュ
    let datalist = []; // 台車・車輪位置

    // ----------------------------------------

    let createTrain = function() {
        let sizew=0.5, sizeh=0.5, arcR=0.1, arcDiv=6, sizel=2;
        function createRoundedRect(width, height, r, arcdiv, z) {
            // 角丸の四角
            let w_=width/2, h_=height/2;
            // (円弧部分の除く) 直線部分の長さ
            const hw = width / 2 - r;
            const hh = height / 2 - r;
            let plist = [];
            let drawArc = function(cx, cy, r, rads, rade, arcdiv, z) {
                // 1/4の円弧作成
                let pplist = [];
                let radstep = (rade - rads) / arcdiv
                for (let i = 0; i <= arcdiv; i++) {
                    let rad = rads + radstep*i;
                    let p = new BABYLON.Vector3(cx + r * Math.cos(rad), cy + r * Math.sin(rad), z);
                    pplist.push(p);
                }
                return pplist;
            }
            plist.push(new BABYLON.Vector3(0, -h_, z)); // 真下
            plist = plist.concat(drawArc(-hw, -hh, r, R270, R180, arcdiv, z)); // 左下
            plist.push(new BABYLON.Vector3(-w_, 0, z)); // 左
            plist = plist.concat(drawArc(-hw, hh, r, R180, R90, arcdiv, z)); // 左上
            plist.push(new BABYLON.Vector3(0, h_, z)); // 真上
            plist = plist.concat(drawArc(hw, hh, r, R90, R0, arcdiv, z)); // 右上
            plist.push(new BABYLON.Vector3(w_, 0, z)); // 右
            plist = plist.concat(drawArc(hw, -hh, r, R360, R270, arcdiv, z)); // 右下
            plist.push(new BABYLON.Vector3(0, -h_, z)); // 真下
            return plist;
        }
        let pplist = [], z;
        let lendiv = 10, sizeldiv = sizel/lendiv, sizel_ = sizel/2;
        for (let iz = 0; iz <= lendiv; ++iz) {
            z = -iz*sizeldiv + sizel_;
            pplist.push(createRoundedRect(sizew, sizeh, arcR, arcDiv, z));
        }
        { // ４回に分割して、CAP(start側）を追加
            let pplist0 = pplist[0];
            z = sizel/2;
            for (let r of [0.75, 0.5, 0.25, 0.001]) {
                let plist = []
                for (let p of pplist0) {
                    plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                }
                pplist.unshift(plist);
            }
        }
        { // ４回に分割して、CAP(end側)を追加
            let pplistE = pplist[pplist.length-1];
            z = -sizel/2;
            for (let r of [0.75, 0.5, 0.25, 0.001]) {
                let plist = []
                for (let p of pplistE) {
                    plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                }
                pplist.push(plist);
            }
        }
        console.log("NODE=", pplist[0].length*pplist.length);
        let mesh = BABYLON.MeshBuilder.CreateRibbon("",{ pathArray: pplist, },scene);
        mesh.material = new BABYLON.StandardMaterial("");
        // const fpathRboxYAMANOTE ="textures/rbox_YAMANOTE.png";
        mesh.material.diffuseTexture = new BABYLON.Texture(fpathRboxYAMANOTE, scene);
        mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
        return mesh;
    }
    // ----------------------------------------

    for (let i = 0; i <= numMeshes; ++i) {
        if (i < numMeshes) {
            let mesh = createTrain();
            meshes.push({
                i: i,
                mesh: mesh,
            });
        }
        datalist.push({
            i: i,
            speed: 0.002,
            percentage: i * 0.035, 
            p: new BABYLON.Vector3(),
        });
    }
    if (camera != null) {
        camera.lockedTarget = meshes[meshes.length-1].mesh;
    }

    scene.onBeforeRenderObservable.add((scene) => {
        datalist.forEach((data) => {
            let i = data.i;
            data.percentage += data.speed;
            if (data.percentage > 1) data.percentage -= 1;
            data.p.copyFrom(path3d.getPointAt(data.percentage));
            if (i > 0) {
                let p_ = datalist[i-1].p;
                let mesh = meshes[i-1].mesh;
                let pc = data.p.add(p_).scale(0.5); // １つ前との重心位置
                let vec = data.p.subtract(p_); // １つ前との方向ベクトル
                mesh.position.copyFrom(pc); // 重心位置にメッシュを配置
                let vrot = Math.atan2(vec.x, vec.z); // 方向ベクトルから回転角（ヨー）を求める
                mesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
                mesh.rotate(BABYLON.Vector3.Up(), vrot);
            }
        });
    });

    return scene;
}



export var createScene_box_3_TestRun = async function () {
    // 電車[台車付]・単線
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 1, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20,-20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
        if (icamera == 1) {
            // ターゲットと並走
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 0.5, 3), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.useAutoRotationBehavior = true; // 自動でゆっくり回転
        }

    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    if (1) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
    }

    const points = [
        new BABYLON.Vector3(-10, 1, 0),
        new BABYLON.Vector3(0, 1, 10),
        new BABYLON.Vector3(10, 1, 0),
        new BABYLON.Vector3(0, 1, -10)
    ];

    const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 20, true); // 20は分割数,閉曲線にする
    let path3d = new BABYLON.Path3D(catmullRom.getPoints());
    let curve = path3d.getCurve(); // 視覚確認用の曲線

    const pathLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);
    pathLine.position.y += -0.25;

    const numMeshes = 4;
    let meshes = []; // 車両のメッシュ
    let datalist = []; // 台車・車輪位置

    const fpathList =[
        fpathBoxOp1, // "textures/box_op1.png",
        fpathBoxOp2, // "textures/box_op2.png",
        fpathBoxOp3, // "textures/box_op3.png",
    ];

    for (let i = 0; i <= numMeshes; ++i) {
        if (i < numMeshes) {
            // 先頭車両
            const faceUV_H = new Array(6);
            {
                faceUV_H[0] = new BABYLON.Vector4(1/6, 1, 0/6, 3/4); // 先頭(+z
                faceUV_H[1] = new BABYLON.Vector4(2/6, 3/4, 3/6, 1); // 末尾(-z
                faceUV_H[2] = new BABYLON.Vector4(5/6, 1, 4/6, 0); // 右　(+x
                faceUV_H[3] = new BABYLON.Vector4(5/6, 0, 1, 1); // 左  (-x
                faceUV_H[4] = new BABYLON.Vector4(4/6, 2/4, 0, 1/4); // 頂上(+y
                faceUV_H[5] = new BABYLON.Vector4(4/6, 1/4, 0, 0/4); // 底　(-y
            }
            const faceUV = new Array(6);
            // 中間車両
            {
                faceUV[0] = new BABYLON.Vector4(2/6, 1, 3/6, 3/4); // 末尾(-z
                faceUV[1] = new BABYLON.Vector4(2/6, 3/4, 3/6, 1); // 末尾(-z
                faceUV[2] = new BABYLON.Vector4(5/6, 1, 4/6, 0); // 右　(+x
                faceUV[3] = new BABYLON.Vector4(5/6, 0, 1, 1); // 左  (-x
                faceUV[4] = new BABYLON.Vector4(4/6, 2/4, 0, 1/4); // 頂上(+y
                faceUV[5] = new BABYLON.Vector4(4/6, 1/4, 0, 0/4); // 底　(-y
            }
            const faceUV_T = new Array(6);
            // 末尾車両
            {
                faceUV_T[0] = new BABYLON.Vector4(2/6, 1, 3/6, 3/4); // 先頭(+z
                faceUV_T[1] = new BABYLON.Vector4(1/6, 3/4, 2/6, 1); // 末尾(-z
                faceUV_T[2] = new BABYLON.Vector4(5/6, 1, 4/6, 0); // 右　(+x
                faceUV_T[3] = new BABYLON.Vector4(5/6, 0, 1, 1); // 左  (-x
                faceUV_T[4] = new BABYLON.Vector4(4/6, 2/4, 0, 1/4); // 頂上(+y
                faceUV_T[5] = new BABYLON.Vector4(4/6, 1/4, 0, 0/4); // 底　(-y
            }
            let box = null;
            if (i == 0) {
                box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {width:0.5, height:0.5, depth:2, faceUV: faceUV_T}, scene);
            } else if (i == numMeshes-1) {
                box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {width:0.5, height:0.5, depth:2, faceUV: faceUV_H}, scene);
            } else {
                box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {width:0.5, height:0.5, depth:2, faceUV: faceUV}, scene);
            }
            let fpath = fpathList[i % fpathList.length];
            box.material = new BABYLON.StandardMaterial("");
            box.material.diffuseTexture = new BABYLON.Texture(fpath, scene);
            meshes.push({
                i: i,
                mesh: box,
            });
        }
        datalist.push({
            i: i,
            speed: 0.002,
            percentage: i * 0.035, 
            p: new BABYLON.Vector3(),
        });
    }
    if (camera != null) {
        camera.lockedTarget = meshes[meshes.length-1].mesh;
        // camera.lockedTarget = meshes[meshes.length-2].mesh;
        // camera.lockedTarget = meshes[0].mesh;
    }

    scene.onBeforeRenderObservable.add((scene) => {
        datalist.forEach((data) => {
            let i = data.i;
            data.percentage += data.speed;
            if (data.percentage > 1) data.percentage -= 1;
            data.p.copyFrom(path3d.getPointAt(data.percentage));
            if (i > 0) {
                let p_ = datalist[i-1].p;
                let mesh = meshes[i-1].mesh;
                let pc = data.p.add(p_).scale(0.5); // １つ前との重心位置
                let vec = data.p.subtract(p_); // １つ前との方向ベクトル
                mesh.position.copyFrom(pc); // 重心位置にメッシュを配置
                let vrot = Math.atan2(vec.x, vec.z); // 方向ベクトルから回転角（ヨー）を求める
                mesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
                mesh.rotate(BABYLON.Vector3.Up(), vrot);
            }
        });
    });

    return scene;
}


export var createScene_bulletTrainA_0_ChatGPT = async function () {
    // 新幹線
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 10, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    let pplist = [];
    {
        let radiusX = 2, radiusY = 1.5;
        let len = 12, len_=len/2, lendiv=40;
        let rdiv = 16, rdiv_=rdiv/2;
        for (let ii = 0; ii < lendiv; ++ii) {
            let t = ii/(lendiv-1);
            let z = len/lendiv*ii - len_;
            let plist = [], r=1;
            if (t < 0.1) {
                // ノーズ
                z = 0.1*len/lendiv*ii + 0.08*len - len_;
                r = Math.pow(0.2+t/0.5, 3);
                for (let irad = 0; irad <= rdiv; ++irad) {
                    let t = R360 * irad / rdiv;
                    let x = Math.cos(t) * radiusX * r;
                    let y = Math.sin(t) * radiusY * r * (irad<rdiv_ ? 1.2 : 0.6);
                    plist.push(new BABYLON.Vector3(x, y, z));
                }
            } else if (t < 0.6) {
                // ノーズ
                r = Math.pow(0.2+t/0.75, 3); // 0.4
                for (let irad = 0; irad <= rdiv; ++irad) {
                    let t = R360 * irad / rdiv;
                    let x = Math.cos(t) * radiusX * r;
                    let y = Math.sin(t) * radiusY * r * (irad<rdiv_ ? 1.2 : 0.6);
                    plist.push(new BABYLON.Vector3(x, y, z));
                }
            } else if (t < 0.9) {
                // 車体
                r = 1;
                for (let irad = 0; irad <= rdiv; ++irad) {
                    let t = R360 * irad / rdiv;
                    let x = Math.cos(t) * radiusX * r;
                    let y = Math.sin(t) * radiusY * r * (irad<rdiv_ ? 1.2 : 0.6);
                    plist.push(new BABYLON.Vector3(x, y, z));
                }
            } else {
                let u = (t-0.9)/0.1;
                r = 1.0*(1-u);
                for (let irad = 0; irad <= rdiv; ++irad) {
                    let t = R360 * irad / rdiv;
                    let x = Math.cos(t) * radiusX * r;
                    let y = Math.sin(t) * radiusY * r * (irad<rdiv_ ? 1.2 : 0.6);
                    plist.push(new BABYLON.Vector3(x, y, z));
                }
            }
            pplist.push(plist);
        }
    }
    let mesh = BABYLON.MeshBuilder.CreateRibbon("", {
        pathArray: pplist,
        closeArray: false,
        closePath: true });
    mesh.material = new BABYLON.StandardMaterial("");
    mesh.material.wireframe=1;

    return scene;
}


export var createScene_bulletTrainB_0_ChatGPT = async function () {
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 20, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    let pplist = [];
    {
        let len = 12, len_=len/2, lendiv=20;
        let R = 3, Rw = R*1.3, Rh = R*0.9, Rmin=-0.4*R, rdiv = 24, rdiv_=rdiv/2;
        if (0) {
            let z = -len_-len/lendiv*0.3;
            let plist = [];
            for (let irad = 0; irad <= rdiv; ++irad) {
                plist.push(new BABYLON.Vector3(0, 0, z));
            }
            pplist.push(plist);
        }
        for (let ii = 0; ii < lendiv; ++ii) {
            let z1 = len/lendiv*ii;
            let z = z1 - len_;
            let scale = Math.pow(z1/len_,0.7);
            let scale2 =  (0.1 + 0.5*scale);
            let plist = [];
            for (let irad = 0; irad <= rdiv; ++irad) {
                let t = R360 * irad / rdiv;
                let x = Math.cos(t) * Rw * scale2;
                let y = Math.sin(t) * Rh * scale2;
                if (y < Rmin) {y = Rmin;}
                plist.push(new BABYLON.Vector3(x, y, z));
            }
            pplist.push(plist);
        }
    }
    let mesh = BABYLON.MeshBuilder.CreateRibbon("", { pathArray:pplist });
    mesh.material = new BABYLON.StandardMaterial("");
    mesh.material.wireframe=1;

    return scene;
}


export var createScene_bulletTrainA_1 = async function () {
    // 新幹線
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 20, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    let pplist = [];
    {
        let radiusX = 2, radiusY = 1.5;
        let len = 12, len_=len/2, lendiv=40;
        let rdiv = 16, rdiv_=rdiv/2;
        for (let ii = 0; ii < lendiv; ++ii) {
            let t = ii/(lendiv-1);
            let z = len/lendiv*ii - len_;
            let plist = [], r=1;
            if (t < 0.1) {
                // ノーズ先端
                z = 0.1*len/lendiv*ii + 0.08*len - len_;
                r = Math.pow(0.2+t/0.5, 3);
                for (let irad = 0; irad <= rdiv; ++irad) {
                    let t = R360 * irad / rdiv;
                    let x = Math.cos(t) * radiusX * r;
                    let y = Math.sin(t) * radiusY * r * (irad<rdiv_ ? 1.2 : 0.6);
                    plist.push(new BABYLON.Vector3(x, y, z));
                }
            } else if (t < 0.6) {
                // ノーズ
                let radiusY_ = 1.0, rr, rrMax;
                r = 0.2 + 0.8 * Math.pow(t/0.5, 2);
                for (let irad = 0; irad <= rdiv; ++irad) {
                    let t = R360 * irad / rdiv;
                    rrMax = radiusX;
                    rr = radiusX * r;
                    rr = Math.min(rr, rrMax);
                    let x = Math.cos(t) * rr;
                    rrMax = radiusY * (irad<rdiv_ ? 1.2 : 0.6);
                    rr = radiusY_ * r * (irad<rdiv_ ? 1.2 : 0.6);
                    rr = Math.min(rr, rrMax);
                    let y = Math.sin(t) * rr;
                    plist.push(new BABYLON.Vector3(x, y, z));
                }
            } else if (t < 0.9) {
                // 車体
                r = 1;
                for (let irad = 0; irad <= rdiv; ++irad) {
                    let t = R360 * irad / rdiv;
                    let x = Math.cos(t) * radiusX * r;
                    let y = Math.sin(t) * radiusY * r * (irad<rdiv_ ? 1.2 : 0.6);
                    plist.push(new BABYLON.Vector3(x, y, z));
                }
            } else {
                // テール
                let u = (t-0.9)/0.1, rr, rrMax;
                r = 1.0*(1.6-u);
                for (let irad = 0; irad <= rdiv; ++irad) {
                    let t = R360 * irad / rdiv;
                    rrMax = radiusX;
                    rr = radiusX * r;
                    rr = Math.min(rr, rrMax);
                    let x = Math.cos(t) * rr;
                    rrMax = radiusY * (irad<rdiv_ ? 1.2 : 0.6);
                    rr = radiusY * r * (irad<rdiv_ ? 1.2 : 0.6);
                    rr = Math.min(rr, rrMax);
                    let y = Math.sin(t) * rr;
                    plist.push(new BABYLON.Vector3(x, y, z));
                }
            }
            pplist.push(plist);
        }
    }
    let mesh = BABYLON.MeshBuilder.CreateRibbon("", {
        pathArray: pplist,
        closeArray: false,
        closePath: true });
    mesh.material = new BABYLON.StandardMaterial("");
    mesh.material.wireframe=1;

    return scene;
}

export var createScene_bulletTrainA_2 = async function () {
    // 新幹線
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 20, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    let pplist = [];
    {
        let radiusX = 2, radiusY = 1.5;
        let len = 12, len_=len/2, lendiv=40;
        let rdiv = 16, rdiv_=rdiv/2;
        {
            let plist = [], z=-len_;
            for (let irad = 0; irad <= rdiv; ++irad) {
                plist.push(new BABYLON.Vector3(0, 0, z));
            }
            pplist.push(plist);
        }
        for (let ii = 0; ii <= lendiv; ++ii) {
            let t = ii/(lendiv-1);
            let z = len/lendiv*ii - len_;
            let plist = [], r=1;
            if (t <= 0.1) {
                // ノーズ
                let u = (t+0.06)/0.1, rr, rrMax;
                r = u;
                for (let irad = 0; irad <= rdiv; ++irad) {
                    let t = R360 * irad / rdiv;
                    rrMax = radiusX;
                    rr = radiusX * r;
                    rr = Math.min(rr, rrMax);
                    let x = Math.cos(t) * rr;
                    rrMax = radiusY * (irad<rdiv_ ? 1.2 : 0.6);
                    rr = radiusY * r * (irad<rdiv_ ? 1.2 : 0.6);
                    rr = Math.min(rr, rrMax);
                    let y = Math.sin(t) * rr;
                    plist.push(new BABYLON.Vector3(x, y, z));
                }
            } else if (t <= 0.9) {
                // 車体
                r = 1;
                for (let irad = 0; irad <= rdiv; ++irad) {
                    let t = R360 * irad / rdiv;
                    let x = Math.cos(t) * radiusX * r;
                    let y = Math.sin(t) * radiusY * r * (irad<rdiv_ ? 1.2 : 0.6);
                    plist.push(new BABYLON.Vector3(x, y, z));
                }
            } else {
                // テール
                let u = (t-0.9)/0.1, rr, rrMax;
                r = 1.0*(1.6-u);
                for (let irad = 0; irad <= rdiv; ++irad) {
                    let t = R360 * irad / rdiv;
                    rrMax = radiusX;
                    rr = radiusX * r;
                    rr = Math.min(rr, rrMax);
                    let x = Math.cos(t) * rr;
                    rrMax = radiusY * (irad<rdiv_ ? 1.2 : 0.6);
                    rr = radiusY * r * (irad<rdiv_ ? 1.2 : 0.6);
                    rr = Math.min(rr, rrMax);
                    let y = Math.sin(t) * rr;
                    plist.push(new BABYLON.Vector3(x, y, z));
                }
            }
            pplist.push(plist);
        }
        {
            let plist = [], z=len_;
            for (let irad = 0; irad <= rdiv; ++irad) {
                plist.push(new BABYLON.Vector3(0, 0, z));
            }
            pplist.push(plist);
        }
    }
    let mesh = BABYLON.MeshBuilder.CreateRibbon("", {
        pathArray: pplist,
        closeArray: false,
        closePath: true });
    mesh.material = new BABYLON.StandardMaterial("");
    mesh.material.wireframe=1;

    return scene;
}


export var createScene_bulletTrainB_1 = async function () {
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 20, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    let pplist = [];
    {
        let len = 12, len_=len/2, lendiv=20, lendNorse=10;
        let R = 2, Rw = R*1.3, Rh = R*0.8, Rmin=-0.4*R, rdiv = 24, rdiv_=rdiv/2;
        // ノーズ
        for (let ii = 0; ii < lendiv; ++ii) {
            let z1 = len/lendiv*ii;
            let z = z1 - len_;
            let scale = Math.pow(z1/len_,0.7);
            let scale2 =  (0.1 + 0.6*scale);
            scale2 = Math.min(scale2, 1);
            let plist = [];
            for (let irad = 0; irad <= rdiv; ++irad) {
                let t = R360 * irad / rdiv;
                let rrW = Rw * scale2;
                rrW = Math.min(rrW, Rw)
                let x = Math.cos(t) * rrW;
                let rrH = Rh * scale2;
                rrH = Math.min(rrH, Rh);
                if (ii <= lendNorse && irad < rdiv/2) {
                    // ノーズの上部・中間が凹むように高さを下げる
                    rrH = rrH * (1-0.6*Math.sin(ii/lendNorse*R180));
                }
                let y = Math.sin(t) * rrH;
                if (ii <= lendNorse) {
                    y += (Math.cos((lendNorse-ii)/lendNorse*R180)-1)*0.4;
                }
                if (y < Rmin) {y = Rmin;}
                plist.push(new BABYLON.Vector3(x, y, z));
            }
            pplist.push(plist);
        }
        // ボディ
        for (let ii = 0; ii < lendiv/2; ++ii) {
            let z1 = len/lendiv*ii;
            let z = z1 + len_;
            let plist = [];
            for (let irad = 0; irad <= rdiv; ++irad) {
                let t = R360 * irad / rdiv;
                let x = Math.cos(t) * Rw;
                let y = Math.sin(t) * Rh;
                if (y < Rmin) {y = Rmin;}
                plist.push(new BABYLON.Vector3(x, y, z));
            }
            pplist.push(plist);
        }
    }
    let mesh = BABYLON.MeshBuilder.CreateRibbon("", { pathArray:pplist });
    mesh.material = new BABYLON.StandardMaterial("");
    mesh.material.wireframe=1;

    return scene;
}


export var createScene_bulletTrainB_2 = async function () {
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 20, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    let pplist = [];
//    let itype = 0;  // 先頭車両
    let itype = 1; // 客車車両
    {
        let len = 18, len_=len/2, lendiv=30, lendNorse=10, lendNorseE=20, lendivE=27, lendivH=lendiv-lendivE;
        let R = 2, Rw = R*1.3, Rh = R*0.8, Rmin=-0.4*R, rdiv = 24, rdiv_=rdiv/2;


        if (itype == 0) {
            // 先頭・末尾　車両
            for (let ii = 0; ii < lendiv; ++ii) {
                let z1 = len/lendiv*ii;
                let z = z1 - len_;
                let plist = [];
                if (ii < lendNorseE) {
                    // ノーズ
                    let scale = Math.pow(z1/len_,0.7);
                    let scale2 =  (0.1 + 0.8*scale);
                    scale2 = Math.min(scale2, 1);
                    for (let irad = 0; irad <= rdiv; ++irad) {
                        let t = R360 * irad / rdiv;
                        let rrW = Rw * scale2;
                        rrW = Math.min(rrW, Rw)
                        let x = Math.cos(t) * rrW;
                        let rrH = Rh * scale2;
                        rrH = Math.min(rrH, Rh);
                        if (ii <= lendNorse && irad < rdiv/2) {
                            // ノーズの上部・中間が凹むように高さを下げる
                            rrH = rrH * (1-0.6*Math.sin(ii/lendNorse*R180));
                        }
                        let y = Math.sin(t) * rrH;
                        if (ii <= lendNorse) {
                            y += (Math.cos((lendNorse-ii)/lendNorse*R180)-1)*0.4;
                        }
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                } else if (ii < lendivE) {
                    // ボディ
                    for (let irad = 0; irad <= rdiv; ++irad) {
                        let t = R360 * irad / rdiv;
                        let x = Math.cos(t) * Rw;
                        let y = Math.sin(t) * Rh;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                } else {
                    // 連結部(テール）
                    let t = ii/lendiv;
                    let u = (t-0.91)/0.1, rr, rrMax;
                    let scale = 1.0*(1.1-u);
                    for (let irad = 0; irad <= rdiv; ++irad) {
                        let t = R360 * irad / rdiv;
                        rrMax = Rw;
                        rr = Rw*scale;
                        rr = Math.min(rr, rrMax);
                        let x = Math.cos(t) * rr;
                        rrMax = Rh;
                        rr = Rh*scale;
                        rr = Math.min(rr, rrMax);
                        let y = Math.sin(t) * rr;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                }
                pplist.push(plist);
            }
        } else if (itype == 1) {
            // 中間　車両（客車）
            for (let ii = 0; ii < lendiv; ++ii) {
                let z1 = len/lendiv*ii;
                let z = z1 - len_;
                let plist = [];
                if (ii < lendivH) {
                    // 連結部(ヘッド）
                    let t2 = (lendiv-ii-1)/lendiv;
                    let u = (t2-0.91)/0.1, rr, rrMax;
                    let scale = 1.0*(1.1-u);
                    for (let irad = 0; irad <= rdiv; ++irad) {
                        let t = R360 * irad / rdiv;
                        rrMax = Rw;
                        rr = Rw*scale;
                        rr = Math.min(rr, rrMax);
                        let x = Math.cos(t) * rr;
                        rrMax = Rh;
                        rr = Rh*scale;
                        rr = Math.min(rr, rrMax);
                        let y = Math.sin(t) * rr;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                } else if (ii < lendivE) {
                    // ボディ
                    for (let irad = 0; irad <= rdiv; ++irad) {
                        let t = R360 * irad / rdiv;
                        let x = Math.cos(t) * Rw;
                        let y = Math.sin(t) * Rh;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                } else {
                    // 連結部(テール）
                    let t = ii/lendiv;
                    let u = (t-0.91)/0.1, rr, rrMax;
                    let scale = 1.0*(1.1-u);
                    for (let irad = 0; irad <= rdiv; ++irad) {
                        let t = R360 * irad / rdiv;
                        rrMax = Rw;
                        rr = Rw*scale;
                        rr = Math.min(rr, rrMax);
                        let x = Math.cos(t) * rr;
                        rrMax = Rh;
                        rr = Rh*scale;
                        rr = Math.min(rr, rrMax);
                        let y = Math.sin(t) * rr;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                }
                pplist.push(plist);
            }
        }

    }
    let mesh = BABYLON.MeshBuilder.CreateRibbon("", { pathArray:pplist });
    mesh.material = new BABYLON.StandardMaterial("");
    mesh.material.wireframe=1;

    return scene;
}


export var createScene_bulletTrainA_3 = async function () {
    // 新幹線
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 6, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(10, 50, 10));
    const light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(-10, -50, -10));

    let createBulletTrain1 = function(itype) {
        if (itype == 0) {
            // 先頭・末尾
            let pplist = [];
            {
                let radiusX = 0.25, radiusY = 0.2, len = 2;
                let len_=len/2, lendiv=20;
                let rdiv = 16, rdiv_=rdiv/2, rdivQ = rdiv/4, radstep=R360/rdiv;
                for (let ii = 0; ii < lendiv; ++ii) {
                    let t = ii/(lendiv-1);
                    let z = len/lendiv*ii - len_;
                    let plist = [], r=1;
                    if (t < 0.1) {
                        // ノーズ
                        z = 0.1*len/lendiv*ii + 0.08*len - len_;
                        r = Math.pow(0.2+t/0.5, 3);
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            let x = Math.cos(t) * radiusX * r;
                            let y = Math.sin(t) * radiusY * r * (t<R180 ? 1.0 : 0.6);
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else if (t < 0.6) {
                        // ノーズ
                        let radiusY_ = radiusY/2, rr, rrMax;
                        r = 0.2 + 0.9 * Math.pow(t/0.5, 2);
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            rrMax = radiusX;
                            rr = radiusX * r;
                            rr = Math.min(rr, rrMax);
                            let x = Math.cos(t) * rr;
                            rrMax = radiusY * (t<R180 ? 1.0 : 0.6);
                            rr = radiusY_ * r * (t<R180 ? 1.0 : 0.6);
                            rr = Math.min(rr, rrMax);
                            let y = Math.sin(t) * rr;
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else if (t < 0.9) {
                        // 車体
                        r = 1;
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            let x = Math.cos(t) * radiusX * r;
                            let y = Math.sin(t) * radiusY * r * (t<R180 ? 1.0 : 0.6);
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else {
                        // テール
                        let u = (t-0.9)/0.1, rr, rrMax;
                        r = 1.0*(1.6-u);
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            rrMax = radiusX;
                            rr = radiusX * r;
                            rr = Math.min(rr, rrMax);
                            let x = Math.cos(t) * rr;
                            rrMax = radiusY * (t<R180 ? 1.0 : 0.6);
                            rr = radiusY * r * (t<R180 ? 1.0 : 0.6);
                            rr = Math.min(rr, rrMax);
                            let y = Math.sin(t) * rr;
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    }
                    pplist.push(plist);
                }
                { // ４回に分割して、CAP(start側）を追加
                    let pplist0 = pplist[0];
                    let z = pplist0[0].z;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplist0) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.unshift(plist);
                    }
                }
                { // ４回に分割して、CAP(end側)を追加
                    let pplistE = pplist[pplist.length-1];
                    let z = pplistE[0].z;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplistE) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.push(plist);
                    }
                }
            }
            let mesh = BABYLON.MeshBuilder.CreateRibbon("", {
                pathArray: pplist,
                closeArray: false,
                closePath: true });
            mesh.material = new BABYLON.StandardMaterial("");
            // const fpathRollA1 ="textures/rollA_1.png";
            mesh.material.diffuseTexture = new BABYLON.Texture(fpathRollA1, scene);
            mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
            return mesh;

        } else if (itype == 1) {
            // 中間
            let pplist = [];
            {
                let radiusX = 0.25, radiusY = 0.2, len = 2;
                let len_=len/2, lendiv=20;
                let rdiv = 16, rdiv_=rdiv/2, rdivQ = rdiv/4, radstep=R360/rdiv;
                for (let ii = 0; ii <= lendiv; ++ii) {
                    let t = ii/(lendiv-1);
                    let z = len/lendiv*ii - len_;
                    let plist = [], r=1;
                    if (t <= 0.15) {
                        // ノーズ
                        let u = (t+0.04)/0.1, rr, rrMax;
                        r = u;
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            rrMax = radiusX;
                            rr = radiusX * r;
                            rr = Math.min(rr, rrMax);
                            let x = Math.cos(t) * rr;
                            rrMax = radiusY * (t<R180 ? 1.0 : 0.6);
                            rr = radiusY * r * (t<R180 ? 1.0 : 0.6);
                            rr = Math.min(rr, rrMax);
                            let y = Math.sin(t) * rr;
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else if (t <= 0.9) {
                        // 車体
                        r = 1;
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            let x = Math.cos(t) * radiusX * r;
                            let y = Math.sin(t) * radiusY * r * (t<R180 ? 1.0 : 0.6);
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else {
                        // テール
                        let u = (t-0.9)/0.1, rr, rrMax;
                        r = 1.0*(1.6-u);
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            rrMax = radiusX;
                            rr = radiusX * r;
                            rr = Math.min(rr, rrMax);
                            let x = Math.cos(t) * rr;
                            rrMax = radiusY * (t<R180 ? 1.0 : 0.6);
                            rr = radiusY * r * (t<R180 ? 1.0 : 0.6);
                            rr = Math.min(rr, rrMax);
                            let y = Math.sin(t) * rr;
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    }
                    pplist.push(plist);
                }
                { // ４回に分割して、CAP(start側）を追加
                    let pplist0 = pplist[0];
                    let z = pplist0[0].z;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplist0) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.unshift(plist);
                    }
                }
                { // ４回に分割して、CAP(end側)を追加
                    let pplistE = pplist[pplist.length-1];
                    let z = pplistE[0].z;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplistE) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.push(plist);
                    }
                }
            }
            let mesh = BABYLON.MeshBuilder.CreateRibbon("", {
                pathArray: pplist,
                closeArray: false,
                closePath: true });
            mesh.material = new BABYLON.StandardMaterial("");
            // const fpathRollA2 ="textures/rollA_2.png";
            mesh.material.diffuseTexture = new BABYLON.Texture(fpathRollA2, scene);
            return mesh;
        }
        return null
    }

    if (1) {
        let mesh1 = createBulletTrain1(0);
        mesh1.position.z = -2;
        let mesh2 = createBulletTrain1(1);
        let mesh3 = createBulletTrain1(0);
        mesh3.position.z = +2;
        mesh3.rotation.y = R180;
    }

    return scene;
}


export var createScene_bulletTrainB_3 = async function () {
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 4, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(10, 50, 10));
    const light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(-10, -50, -10));

    let creaetBulletTrain2 = function(type) {
        let pplist = [];
        let len = 2, len_=len/2, lendiv=20, lendNorse=lendiv/3, lendNorseE=lendiv/3*2, lendivE=lendiv-3, lendivH=lendiv-lendivE;
        let R = 0.25, Rw = R*1.0, Rh = R*0.8, Rmin=-0.4*R, rdiv = 24, rdiv_=rdiv/2, rdivQ = rdiv/4, radstep=R360/rdiv;

        if (type==0) {
            // 先頭・末尾　車両
            for (let ii = 0; ii < lendiv; ++ii) {
                let z1 = -len/lendiv*ii;
                let z = z1 + len_;
                let plist = [];
                if (ii < lendNorseE) {
                    // ノーズ
                    let scale = Math.pow(-z1/len_,0.7);
                    let scale2 =  (0.1 + 0.8*scale);
                    scale2 = Math.min(scale2, 1);
                    for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                        let t = radstep * ((irad+rdiv)%rdiv);
                        let rrW = Rw * scale2;
                        rrW = Math.min(rrW, Rw)
                        let x = Math.cos(t) * rrW;
                        let rrH = Rh * scale2;
                        rrH = Math.min(rrH, Rh);
                        if (ii <= lendNorse && t < R180) {
                            // ノーズの上部・中間が凹むように高さを下げる
                            rrH = rrH * (1-0.5*Math.sin(ii/lendNorse*R180));
                        }
                        let y = Math.sin(t) * rrH;
                        if (ii <= lendNorse) {
                            y += (Math.cos((lendNorse-ii)/lendNorse*R180)-1)*0.01;
                        }
                        y = Math.max(y, Rmin);
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                } else if (ii < lendivE) {
                    // ボディ
                    for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                        let t = radstep * ((irad+rdiv)%rdiv);
                        let x = Math.cos(t) * Rw;
                        let y = Math.sin(t) * Rh;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                } else {
                    // 連結部(テール）
                    let t = ii/lendiv;
                    let u = (t-0.91)/0.1, rr, rrMax;
                    let scale = 1.0*(1.1-u);
                    for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                        let t = radstep * ((irad+rdiv)%rdiv);
                        rrMax = Rw;
                        rr = Rw*scale;
                        rr = Math.min(rr, rrMax);
                        let x = Math.cos(t) * rr;
                        rrMax = Rh;
                        rr = Rh*scale;
                        rr = Math.min(rr, rrMax);
                        let y = Math.sin(t) * rr;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                }
                pplist.push(plist);
            }
            { // ４回に分割して、CAP(start側）を追加
                let pplist0 = pplist[0];
                let z = pplist0[0].z;
                for (let r of [0.75, 0.5, 0.25, 0.001]) {
                    let plist = []
                    for (let p of pplist0) {
                        plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                    }
                    pplist.unshift(plist);
                }
            }
            { // ４回に分割して、CAP(end側)を追加
                let pplistE = pplist[pplist.length-1];
                let z = pplistE[0].z;
                for (let r of [0.75, 0.5, 0.25, 0.001]) {
                    let plist = []
                    for (let p of pplistE) {
                        plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                    }
                    pplist.push(plist);
                }
            }
            let mesh = BABYLON.MeshBuilder.CreateRibbon("", {
                pathArray:pplist,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            });
            mesh.material = new BABYLON.StandardMaterial("");
            // const fpathRollB1 ="textures/rollB_1.png";
            mesh.material.diffuseTexture = new BABYLON.Texture(fpathRollB1, scene);
            mesh.material.diffuseTexture.uScale = -1; // 左右反転させる
            mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
            return mesh;

        } else if (type==1) {
            // 中間　車両（客車）
            for (let ii = 0; ii < lendiv; ++ii) {
                let z1 = len/lendiv*ii;
                let z = z1 - len_;
                let plist = [];
                if (ii < lendivH) {
                    // 連結部(ヘッド）
                    let t2 = (lendiv-ii-1)/lendiv;
                    let u = (t2-0.91)/0.1, rr, rrMax;
                    let scale = 1.0*(1.1-u);
                    for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                        let t = radstep * ((irad+rdiv)%rdiv);
                        rrMax = Rw;
                        rr = Rw*scale;
                        rr = Math.min(rr, rrMax);
                        let x = Math.cos(t) * rr;
                        rrMax = Rh;
                        rr = Rh*scale;
                        rr = Math.min(rr, rrMax);
                        let y = Math.sin(t) * rr;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                } else if (ii < lendivE) {
                    // ボディ
                    for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                        let t = radstep * ((irad+rdiv)%rdiv);
                        let x = Math.cos(t) * Rw;
                        let y = Math.sin(t) * Rh;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                } else {
                    // 連結部(テール）
                    let t = ii/lendiv;
                    let u = (t-0.91)/0.1, rr, rrMax;
                    let scale = 1.0*(1.1-u);
                    for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                        let t = radstep * ((irad+rdiv)%rdiv);
                        rrMax = Rw;
                        rr = Rw*scale;
                        rr = Math.min(rr, rrMax);
                        let x = Math.cos(t) * rr;
                        rrMax = Rh;
                        rr = Rh*scale;
                        rr = Math.min(rr, rrMax);
                        let y = Math.sin(t) * rr;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                }
                pplist.push(plist);
            }
            { // ４回に分割して、CAP(start側）を追加
                let pplist0 = pplist[0];
                let z = pplist0[0].z;
                for (let r of [0.75, 0.5, 0.25, 0.001]) {
                    let plist = []
                    for (let p of pplist0) {
                        plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                    }
                    pplist.unshift(plist);
                }
            }
            { // ４回に分割して、CAP(end側)を追加
                let pplistE = pplist[pplist.length-1];
                let z = pplistE[0].z;
                for (let r of [0.75, 0.5, 0.25, 0.001]) {
                    let plist = []
                    for (let p of pplistE) {
                        plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                    }
                    pplist.push(plist);
                }
            }
            let mesh = BABYLON.MeshBuilder.CreateRibbon("", { pathArray:pplist });
            mesh.material = new BABYLON.StandardMaterial("");
            // const fpathRollB2 ="textures/rollB_2.png";
            mesh.material.diffuseTexture = new BABYLON.Texture(fpathRollB2, scene);
            mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
            return mesh;
        }
        return null;
    }

    if (0) {
        let mesh1 = creaetBulletTrain2(0);
        mesh1.position.z=+1;
        let mesh2 = creaetBulletTrain2(1);
        mesh2.position.z=-1;
    }

    {
        let mesh1 = creaetBulletTrain2(0);
        mesh1.position.z=+2;
        let mesh2 = creaetBulletTrain2(1);
        let mesh3 = creaetBulletTrain2(0);
        mesh3.position.z=-2;
        mesh3.rotation.y = R180;
    }

    return scene;
}

export var createScene_bulletTrainA_4_TestRun = async function () {
    // 電車[台車付]・単線
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 1, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20,-20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
        if (icamera == 1) {
            // ターゲットと並走
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 0.5, 3), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.useAutoRotationBehavior = true; // 自動でゆっくり回転
        }

    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    if (1) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
    }


    const points = [
        new BABYLON.Vector3(-10, 1, 0),
        new BABYLON.Vector3(0, 1, 10),
        new BABYLON.Vector3(10, 1, 0),
        new BABYLON.Vector3(0, 1, -10)
    ];

    const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 20, true); // 20は分割数,閉曲線にする
    let path3d = new BABYLON.Path3D(catmullRom.getPoints());
    let curve = path3d.getCurve(); // 視覚確認用の曲線

    const pathLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);
    pathLine.position.y += -0.25;

    const numMeshes = 4;
    let meshes = []; // 車両のメッシュ
    let datalist = []; // 台車・車輪位置

    // ----------------------------------------

    let createBulletTrain1 = function(itype) {
        if (itype == 0) {
            // 先頭・末尾
            let pplist = [];
            {
                let radiusX = 0.25, radiusY = 0.2, len = 2;
                let len_=len/2, lendiv=20;
                let rdiv = 16, rdiv_=rdiv/2, rdivQ = rdiv/4, radstep=R360/rdiv;
                for (let ii = 0; ii < lendiv; ++ii) {
                    let t = ii/(lendiv-1);
                    let z = len/lendiv*ii - len_;
                    let plist = [], r=1;
                    if (t < 0.1) {
                        // ノーズ
                        z = 0.1*len/lendiv*ii + 0.08*len - len_;
                        r = Math.pow(0.2+t/0.5, 3);
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            let x = Math.cos(t) * radiusX * r;
                            let y = Math.sin(t) * radiusY * r * (t<R180 ? 1.0 : 0.6);
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else if (t < 0.6) {
                        // ノーズ
                        let radiusY_ = radiusY/2, rr, rrMax;
                        r = 0.2 + 0.9 * Math.pow(t/0.5, 2);
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            rrMax = radiusX;
                            rr = radiusX * r;
                            rr = Math.min(rr, rrMax);
                            let x = Math.cos(t) * rr;
                            rrMax = radiusY * (t<R180 ? 1.0 : 0.6);
                            rr = radiusY_ * r * (t<R180 ? 1.0 : 0.6);
                            rr = Math.min(rr, rrMax);
                            let y = Math.sin(t) * rr;
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else if (t < 0.9) {
                        // 車体
                        r = 1;
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            let x = Math.cos(t) * radiusX * r;
                            let y = Math.sin(t) * radiusY * r * (t<R180 ? 1.0 : 0.6);
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else {
                        // テール
                        let u = (t-0.9)/0.1, rr, rrMax;
                        r = 1.0*(1.6-u);
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            rrMax = radiusX;
                            rr = radiusX * r;
                            rr = Math.min(rr, rrMax);
                            let x = Math.cos(t) * rr;
                            rrMax = radiusY * (t<R180 ? 1.0 : 0.6);
                            rr = radiusY * r * (t<R180 ? 1.0 : 0.6);
                            rr = Math.min(rr, rrMax);
                            let y = Math.sin(t) * rr;
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    }
                    pplist.push(plist);
                }
                { // ４回に分割して、CAP(start側）を追加
                    let pplist0 = pplist[0];
                    let z = pplist0[0].z;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplist0) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.unshift(plist);
                    }
                }
                { // ４回に分割して、CAP(end側)を追加
                    let pplistE = pplist[pplist.length-1];
                    let z = pplistE[0].z;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplistE) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.push(plist);
                    }
                }
            }
            console.log("NODE=", pplist[0].length*pplist.length);
            let mesh = BABYLON.MeshBuilder.CreateRibbon("", {
                pathArray: pplist,
                closeArray: false,
                closePath: true });
            mesh.material = new BABYLON.StandardMaterial("");
            // const fpathRollA1 ="textures/rollA_1.png";
            mesh.material.diffuseTexture = new BABYLON.Texture(fpathRollA1, scene);
            mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
            return mesh;

        } else if (itype == 1) {
            // 中間
            let pplist = [];
            {
                let radiusX = 0.25, radiusY = 0.2, len = 2;
                let len_=len/2, lendiv=20;
                let rdiv = 16, rdiv_=rdiv/2, rdivQ = rdiv/4, radstep=R360/rdiv;
                for (let ii = 0; ii <= lendiv; ++ii) {
                    let t = ii/(lendiv-1);
                    let z = len/lendiv*ii - len_;
                    let plist = [], r=1;
                    if (t <= 0.15) {
                        // ノーズ
                        let u = (t+0.04)/0.1, rr, rrMax;
                        r = u;
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            rrMax = radiusX;
                            rr = radiusX * r;
                            rr = Math.min(rr, rrMax);
                            let x = Math.cos(t) * rr;
                            rrMax = radiusY * (t<R180 ? 1.0 : 0.6);
                            rr = radiusY * r * (t<R180 ? 1.0 : 0.6);
                            rr = Math.min(rr, rrMax);
                            let y = Math.sin(t) * rr;
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else if (t <= 0.9) {
                        // 車体
                        r = 1;
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            let x = Math.cos(t) * radiusX * r;
                            let y = Math.sin(t) * radiusY * r * (t<R180 ? 1.0 : 0.6);
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else {
                        // テール
                        let u = (t-0.9)/0.1, rr, rrMax;
                        r = 1.0*(1.6-u);
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            rrMax = radiusX;
                            rr = radiusX * r;
                            rr = Math.min(rr, rrMax);
                            let x = Math.cos(t) * rr;
                            rrMax = radiusY * (t<R180 ? 1.0 : 0.6);
                            rr = radiusY * r * (t<R180 ? 1.0 : 0.6);
                            rr = Math.min(rr, rrMax);
                            let y = Math.sin(t) * rr;
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    }
                    pplist.push(plist);
                }
                { // ４回に分割して、CAP(start側）を追加
                    let pplist0 = pplist[0];
                    let z = pplist0[0].z;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplist0) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.unshift(plist);
                    }
                }
                { // ４回に分割して、CAP(end側)を追加
                    let pplistE = pplist[pplist.length-1];
                    let z = pplistE[0].z;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplistE) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.push(plist);
                    }
                }
            }
            console.log("NODE=", pplist[0].length*pplist.length);
            let mesh = BABYLON.MeshBuilder.CreateRibbon("", {
                pathArray: pplist,
                closeArray: false,
                closePath: true });
            mesh.material = new BABYLON.StandardMaterial("");
            // const fpathRollA2 ="textures/rollA_2.png";
            mesh.material.diffuseTexture = new BABYLON.Texture(fpathRollA2, scene);
            return mesh;
        }
        return null
    }

    // ----------------------------------------

    for (let i = 0; i <= numMeshes; ++i) {
        if (i < numMeshes) {
            let mesh = null;
            if (i == 0) {
                mesh = createBulletTrain1(0);
            } else if (i == numMeshes-1) {
                let mesh_ = createBulletTrain1(0);
                mesh_.rotation.y = R180;
                mesh = new BABYLON.TransformNode();
                mesh_.parent = mesh;
            } else {
                mesh = createBulletTrain1(1);
            }
            meshes.push({
                i: i,
                mesh: mesh,
            });
        }
        datalist.push({
            i: i,
            speed: 0.002,
            percentage: i * 0.030,
            p: new BABYLON.Vector3(),
        });
    }
    if (camera != null) {
        camera.lockedTarget = meshes[meshes.length-1].mesh;
    }

    scene.onBeforeRenderObservable.add((scene) => {
        datalist.forEach((data) => {
            let i = data.i;
            data.percentage += data.speed;
            if (data.percentage > 1) data.percentage -= 1;
            data.p.copyFrom(path3d.getPointAt(data.percentage));
            if (i > 0) {
                let p_ = datalist[i-1].p;
                let mesh = meshes[i-1].mesh;
                let pc = data.p.add(p_).scale(0.5); // １つ前との重心位置
                let vec = data.p.subtract(p_); // １つ前との方向ベクトル
                mesh.position.copyFrom(pc); // 重心位置にメッシュを配置
                let vrot = Math.atan2(vec.x, vec.z); // 方向ベクトルから回転角（ヨー）を求める
                mesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
                mesh.rotate(BABYLON.Vector3.Up(), vrot);
            }
        });
    });

    return scene;
}


export var createScene_bulletTrainB_4_TestRun = async function () {
    // 電車[台車付]・単線
    const R180 = Math.PI;
    const R360 = Math.PI*2;

    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 1, camera = null, myMesh=null;
    let cameralist = [];
    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 20,-20), scene);
            if (myMesh != null) {
                camera.setTarget(myMesh.position);
            } else {
                camera.setTarget(BABYLON.Vector3.Zero());
            }
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            scene.activeCameras.push(camera);
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
            // lockedTargetをセットすると右クリックでパン（移動）できなくなる
            // <->逆にセットしないと、
            //    のでカメラの向きが原点に焦点される／myMeshに焦点があわない
            // camera.lockedTarget = myMesh;
        }
        if (icamera == 1) {
            // ターゲットと並走
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 0.5, 3), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            camera.useAutoRotationBehavior = true; // 自動でゆっくり回転
        }
    }
    changeCamera(icamera);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    if (1) {
        // 地面
        const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
        const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
        groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
        groundMesh.material.majorUnitFrequency = 100; 
        groundMesh.material.minorUnitVisibility  = 0.2;
    }

    const points = [
        new BABYLON.Vector3(-10, 1, 0),
        new BABYLON.Vector3(0, 1, 10),
        new BABYLON.Vector3(10, 1, 0),
        new BABYLON.Vector3(0, 1, -10)
    ];
    const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 20, true); // 20は分割数,閉曲線にする
    let path3d = new BABYLON.Path3D(catmullRom.getPoints());
    let curve = path3d.getCurve(); // 視覚確認用の曲線
    const pathLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);
    pathLine.position.y += -0.25;

    const numMeshes = 4;
    let meshes = []; // 車両のメッシュ
    let datalist = []; // 台車・車輪位置

    // ----------------------------------------

    let createBulletTrain2 = function(itype) {
        let pplist = [];
        let len = 2, len_=len/2, lendiv=20, lendNorse=lendiv/3, lendNorseE=lendiv/3*2, lendivE=lendiv-3, lendivH=lendiv-lendivE;
        let R = 0.25, Rw = R*1.0, Rh = R*0.8, Rmin=-0.4*R, rdiv = 24, rdiv_=rdiv/2, rdivQ = rdiv/4, radstep=R360/rdiv;

        if (itype==0) {
            // 先頭・末尾　車両
            for (let ii = 0; ii < lendiv; ++ii) {
                let z1 = -len/lendiv*ii;
                let z = z1 + len_;
                let plist = [];
                if (ii < lendNorseE) {
                    // ノーズ
                    let scale = Math.pow(-z1/len_,0.7);
                    let scale2 =  (0.1 + 0.8*scale);
                    scale2 = Math.min(scale2, 1);
                    for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                        let t = radstep * ((irad+rdiv)%rdiv);
                        let rrW = Rw * scale2;
                        rrW = Math.min(rrW, Rw)
                        let x = Math.cos(t) * rrW;
                        let rrH = Rh * scale2;
                        rrH = Math.min(rrH, Rh);
                        if (ii <= lendNorse && t < R180) {
                            // ノーズの上部・中間が凹むように高さを下げる
                            rrH = rrH * (1-0.5*Math.sin(ii/lendNorse*R180));
                        }
                        let y = Math.sin(t) * rrH;
                        if (ii <= lendNorse) {
                            y += (Math.cos((lendNorse-ii)/lendNorse*R180)-1)*0.01;
                        }
                        y = Math.max(y, Rmin);
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                } else if (ii < lendivE) {
                    // ボディ
                    for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                        let t = radstep * ((irad+rdiv)%rdiv);
                        let x = Math.cos(t) * Rw;
                        let y = Math.sin(t) * Rh;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                } else {
                    // 連結部(テール）
                    let t = ii/lendiv;
                    let u = (t-0.91)/0.1, rr, rrMax;
                    let scale = 1.0*(1.1-u);
                    for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                        let t = radstep * ((irad+rdiv)%rdiv);
                        rrMax = Rw;
                        rr = Rw*scale;
                        rr = Math.min(rr, rrMax);
                        let x = Math.cos(t) * rr;
                        rrMax = Rh;
                        rr = Rh*scale;
                        rr = Math.min(rr, rrMax);
                        let y = Math.sin(t) * rr;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                }
                pplist.push(plist);
            }
            { // ４回に分割して、CAP(start側）を追加
                let pplist0 = pplist[0];
                let z = pplist0[0].z;
                for (let r of [0.75, 0.5, 0.25, 0.001]) {
                    let plist = []
                    for (let p of pplist0) {
                        plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                    }
                    pplist.unshift(plist);
                }
            }
            { // ４回に分割して、CAP(end側)を追加
                let pplistE = pplist[pplist.length-1];
                let z = pplistE[0].z;
                for (let r of [0.75, 0.5, 0.25, 0.001]) {
                    let plist = []
                    for (let p of pplistE) {
                        plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                    }
                    pplist.push(plist);
                }
            }
            console.log("NODE=", pplist[0].length*pplist.length);
            let mesh = BABYLON.MeshBuilder.CreateRibbon("", {
                pathArray:pplist,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            });
            mesh.material = new BABYLON.StandardMaterial("");
            // const fpathRollB1 ="textures/rollB_1.png";
            mesh.material.diffuseTexture = new BABYLON.Texture(fpathRollB1, scene);
            mesh.material.diffuseTexture.uScale = -1; // 左右反転させる
            mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
            return mesh;

        } else if (itype==1) {
            // 中間　車両（客車）
            for (let ii = 0; ii < lendiv; ++ii) {
                let z1 = len/lendiv*ii;
                let z = z1 - len_;
                let plist = [];
                if (ii < lendivH) {
                    // 連結部(ヘッド）
                    let t2 = (lendiv-ii-1)/lendiv;
                    let u = (t2-0.91)/0.1, rr, rrMax;
                    let scale = 1.0*(1.1-u);
                    for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                        let t = radstep * ((irad+rdiv)%rdiv);
                        rrMax = Rw;
                        rr = Rw*scale;
                        rr = Math.min(rr, rrMax);
                        let x = Math.cos(t) * rr;
                        rrMax = Rh;
                        rr = Rh*scale;
                        rr = Math.min(rr, rrMax);
                        let y = Math.sin(t) * rr;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                } else if (ii < lendivE) {
                    // ボディ
                    for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                        let t = radstep * ((irad+rdiv)%rdiv);
                        let x = Math.cos(t) * Rw;
                        let y = Math.sin(t) * Rh;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                } else {
                    // 連結部(テール）
                    let t = ii/lendiv;
                    let u = (t-0.91)/0.1, rr, rrMax;
                    let scale = 1.0*(1.1-u);
                    for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                        let t = radstep * ((irad+rdiv)%rdiv);
                        rrMax = Rw;
                        rr = Rw*scale;
                        rr = Math.min(rr, rrMax);
                        let x = Math.cos(t) * rr;
                        rrMax = Rh;
                        rr = Rh*scale;
                        rr = Math.min(rr, rrMax);
                        let y = Math.sin(t) * rr;
                        if (y < Rmin) {y = Rmin;}
                        plist.push(new BABYLON.Vector3(x, y, z));
                    }
                }
                pplist.push(plist);
            }
            { // ４回に分割して、CAP(start側）を追加
                let pplist0 = pplist[0];
                let z = pplist0[0].z;
                for (let r of [0.75, 0.5, 0.25, 0.001]) {
                    let plist = []
                    for (let p of pplist0) {
                        plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                    }
                    pplist.unshift(plist);
                }
            }
            { // ４回に分割して、CAP(end側)を追加
                let pplistE = pplist[pplist.length-1];
                let z = pplistE[0].z;
                for (let r of [0.75, 0.5, 0.25, 0.001]) {
                    let plist = []
                    for (let p of pplistE) {
                        plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                    }
                    pplist.push(plist);
                }
            }
            console.log("NODE=", pplist[0].length*pplist.length);
            let mesh = BABYLON.MeshBuilder.CreateRibbon("", { pathArray:pplist });
            mesh.material = new BABYLON.StandardMaterial("");
            // const fpathRollB2 ="textures/rollB_2.png";
            mesh.material.diffuseTexture = new BABYLON.Texture(fpathRollB2, scene);
            mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
            return mesh;
        }
        return null;
    }

    // ----------------------------------------

    for (let i = 0; i <= numMeshes; ++i) {
        if (i < numMeshes) {
            let mesh = null;
            if (i == 0) {
                let mesh_ = createBulletTrain2(0);
                mesh_.rotation.y = R180;
                mesh = new BABYLON.TransformNode();
                mesh_.parent = mesh;
            } else if (i == numMeshes-1) {
                mesh = createBulletTrain2(0);
            } else {
                mesh = createBulletTrain2(1);
            }
            meshes.push({
                i: i,
                mesh: mesh,
            });
        }
        datalist.push({
            i: i,
            speed: 0.002,
            percentage: i * 0.030,
            p: new BABYLON.Vector3(),
        });
    }
    if (camera != null) {
        camera.lockedTarget = meshes[meshes.length-1].mesh;
    }

    scene.onBeforeRenderObservable.add((scene) => {
        datalist.forEach((data) => {
            let i = data.i;
            data.percentage += data.speed;
            if (data.percentage > 1) data.percentage -= 1;
            data.p.copyFrom(path3d.getPointAt(data.percentage));
            if (i > 0) {
                let p_ = datalist[i-1].p;
                let mesh = meshes[i-1].mesh;
                let pc = data.p.add(p_).scale(0.5); // １つ前との重心位置
                let vec = data.p.subtract(p_); // １つ前との方向ベクトル
                mesh.position.copyFrom(pc); // 重心位置にメッシュを配置
                let vrot = Math.atan2(vec.x, vec.z); // 方向ベクトルから回転角（ヨー）を求める
                mesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
                mesh.rotate(BABYLON.Vector3.Up(), vrot);
            }
        });
    });

    return scene;
}

// ----------------------------------------
// ----------------------------------------
// ----------------------------------------

export var createScene_car_1 = async function () {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 20, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    function createSection(z, width, height) {
        return [
            new BABYLON.Vector3(-width, 0, z),
            new BABYLON.Vector3(width, 0, z),
            new BABYLON.Vector3(width, height*0.5, z),
            new BABYLON.Vector3(width*0.6, height, z),
            new BABYLON.Vector3(-width*0.6, height, z),
            new BABYLON.Vector3(-width, height*0.5, z),
            new BABYLON.Vector3(-width, 0, z),
        ];
    }
    let paths = [];
    let length = 6;
    for (let i=0;i<=20;i++) {
        let t = i/20;
        let z = length*(t-0.5);
        let width = 0.8 + 0.5*Math.sin(Math.PI*t);
        let height = 0.6 + 0.7*Math.sin(Math.PI*t);
        paths.push(createSection(z,width,height));
    }
    let mesh = BABYLON.MeshBuilder.CreateRibbon("car",{
        pathArray: paths,
        closePath:false,
        closeArray:false
    },scene);
    mesh.material = new BABYLON.StandardMaterial("");

    return scene;
}


export var createScene_car_2 = async function () {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 20, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    function createSection(z, width, height) {
        return [
            new BABYLON.Vector3(-width*0.8, -height*0.2, z),
            new BABYLON.Vector3(-width, 0, z),
            new BABYLON.Vector3(-width, height*0.5, z),
            new BABYLON.Vector3(-width*0.6, height, z),
            new BABYLON.Vector3(width*0.6, height, z),
            new BABYLON.Vector3(width, height*0.5, z),
            new BABYLON.Vector3(width, 0, z),
            new BABYLON.Vector3(width*0.8, -height*0.2, z),
            new BABYLON.Vector3(-width, 0, z),
        ];
    }
    let paths = [];
    let length = 5;
    paths.push(createSection(length/2+0.1,0,0));
    for (let i=0;i<=20;i++) {
        let t = i/24;
        let z = -length*(t-0.5); // 並びを入れ替え
        let width = 0.8 + 0.5*Math.sin(Math.PI*t);
        let height = 0.6 + 0.7*Math.sin(Math.PI*t);
        // ボンネットを作成 / キャビンを作る
        if (i < 10) {
            height *= (Math.abs(i-5)+15)/20;
        }
        paths.push(createSection(z,width,height));
    }
    paths.push(createSection(-length*(20/24-0.5),0,0));
    let mesh = BABYLON.MeshBuilder.CreateRibbon("car",{
        pathArray: paths,
        closePath:false,
        closeArray:false
    },scene);
    mesh.material = new BABYLON.StandardMaterial("");
    mesh.material.wireframe=1;

    return scene;
}

export var createScene_car_3 = async function () {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 20, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));
    var light2 = new BABYLON.HemisphericLight("", new BABYLON.Vector3(0, -50, 0), scene);
    light2.intensity = 0.7;

    let createCar1 = function() {
        function createSection(z, width, height) {// zを入れ替えた結果、こちらでok
            return [
                new BABYLON.Vector3(0, -height*0.2, z),
                new BABYLON.Vector3(-width*0.8, -height*0.2, z),
                new BABYLON.Vector3(-width, 0, z),
                new BABYLON.Vector3(-width, height*0.5, z),
                new BABYLON.Vector3(-width*0.6, height, z),
                new BABYLON.Vector3(-width*0.01, height, z),
                new BABYLON.Vector3(width*0.01, height, z),
                new BABYLON.Vector3(width*0.6, height, z),
                new BABYLON.Vector3(width, height*0.5, z),
                new BABYLON.Vector3(width, 0, z),
                new BABYLON.Vector3(width*0.8, -height*0.2, z),
                new BABYLON.Vector3(0, -height*0.2, z),
            ];
        }
        let pplist = [];
        let length = 5;
        for (let i=0;i<=20;i++) {
            let t = i/24;
            let z = -length*(t-0.5); // 並びを入れ替え
            let width = 0.8 + 0.5*Math.sin(Math.PI*t);
            let height = 0.5 + 0.7*Math.sin(Math.PI*t);
            if (i == 0) {
                height = 0.4;
            } else if (i == 1) {
                height = 0.5;
            }
            // ボンネットを作成 / キャビンを作る
            if (i < 10) {
                height *= (Math.abs(i-5)+12)/20;
            }
            pplist.push(createSection(z,width,height));
        }
        { // ４回に分割して、CAP(start側）を追加
            let pplist0 = pplist[0];
            let z = pplist0[0].z;
            for (let r of [0.75, 0.5, 0.25, 0.001]) {
                let plist = []
                for (let p of pplist0) {
                    plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                }
                pplist.unshift(plist);
            }
        }
        { // ４回に分割して、CAP(end側)を追加
            let pplistE = pplist[pplist.length-1];
            let z = pplistE[0].z;
            for (let r of [0.75, 0.5, 0.25, 0.001]) {
                let plist = []
                for (let p of pplistE) {
                    plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                }
                pplist.push(plist);
            }
        }
        console.log("NODE=", pplist[0].length*pplist.length);
        let mesh = BABYLON.MeshBuilder.CreateRibbon("car",{
            pathArray: pplist,
            closePath:false,
            closeArray:false
        },scene);
        return mesh;
    }

    let mesh = createCar1();
    mesh.material = new BABYLON.StandardMaterial("");
    // const fpathCar ="textures/car.png";
    mesh.material.diffuseTexture = new BABYLON.Texture(fpathCar, scene);
    mesh.material.diffuseTexture.vScale = -1; // 上下反転させる

    return scene;
}


// ------------------------------

// export var createScene = createScene_roundBox_0_ChatGPT; // サンプルの追試（ChatGPTの例）
// export var createScene = createScene_roundBox_1; // ExtrudeShape
// export var createScene = createScene_roundBox_2; // ribbon に            N=58
// export var createScene = createScene_roundBox_3; // すべて丸角           N=464

// export var createScene = createScene_box_1;  // boxのテクスチャ確認
// export var createScene = createScene_box_2;  // boxでのテクスチャ確認（山の手風）

// export var createScene = createScene_roundBox_4_0; // 貼り付けた画像（市松模様）
// export var createScene = createScene_roundBox_4_1; // 渦巻いてしまった模様
// export var createScene = createScene_roundBox_4_2; // 渦巻の対応：始点と終点付近の分割

// export var createScene = createScene_roundBox_5_1; // 平底の RoundBox 筒を分割しないとき
// export var createScene = createScene_roundBox_5_2; // 平底の RoundBox 筒を10分割したとき

// export var createScene = createScene_roundBox_6_TestRun;  // 列車（丸角の四角柱）を動かす
// export var createScene = createScene_box_3_TestRun; // ラッピング列車

// ------------------------------
// export var createScene = createScene_bulletTrainA_0_ChatGPT; // ChatGPTの例：その１
// export var createScene = createScene_bulletTrainB_0_ChatGPT; // ChatGPTの例：その２

// export var createScene = createScene_bulletTrainA_1; // 新幹線（その１の改造：先頭車両）
// export var createScene = createScene_bulletTrainA_2; // 新幹線（その１の改造：客室車両）

// export var createScene = createScene_bulletTrainB_1; // 新幹線（その２の改造：先頭車両）
// export var createScene = createScene_bulletTrainB_2; // 新幹線（その２の改造：客室車両）

// テクスチャ
// export var createScene = createScene_bulletTrainA_3; // 新幹線（その１）＋テクスチャ
// export var createScene = createScene_bulletTrainB_3; // 新幹線（その２）＋テクスチャ

// export var createScene = createScene_bulletTrainA_4_TestRun;  // 新幹線（その１）：試走
export var createScene = createScene_bulletTrainB_4_TestRun;  // 新幹線（その２）：試走


// ------------------------------
// export var createScene = createScene_car_1; // 生成ＡＩの車
// export var createScene = createScene_car_2; // 車っぽくしたribbonメッシュ
// export var createScene = createScene_car_3; // 車メッシュ＋テクスチャ

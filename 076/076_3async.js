// jsライブラリ／モジュールのimport テスト(3)
// - 非同期(async createScene) .. import自体は同期で
// - createSceneより前にimport

const SCRIPT_URL_ESM_1 = "../075/Maze.js";
const SCRIPT_URL_ESM_2 = "../075/MazeData.js";

const SCRIPT_URL_CJS_1 = "../075/Maze_.js";     // exportを外したもの
const SCRIPT_URL_CJS_2 = "../075/MazeData_.js"; // exportを外したもの
const SCRIPT_URL_CJS_3 = "../054/js/perlin.js";

const SCRIPT_URL_ESM_GIT_1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";
const SCRIPT_URL_ESM_GIT_2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData.js";

const SCRIPT_URL_CJS_GIT_1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze_.js";
const SCRIPT_URL_CJS_GIT_2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData_.js";
const SCRIPT_URL_CJS_GIT_3 = "https://cdn.jsdelivr.net/gh/josephg/noisejs@master/perlin.js";

const SCRIPT_URL_ESM_GITxx_1 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/075/Maze.js";
const SCRIPT_URL_ESM_GITxx_2 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/075/MazeData.js";

const SCRIPT_URL_CJS_GITxx_1 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/075/Maze_.js";
const SCRIPT_URL_CJS_GITxx_2 = "https://raw.githubusercontent.com/fnamuoo/webgl/main/075/MazeData_.js";
const SCRIPT_URL_CJS_GITxx_3 = "https://raw.githubusercontent.com/josephg/noisejs/master/perlin.js";

    let Maze = null;
    let MazeData = null;

    // importあと、InitializeCSG2Async() あとの関数コール
    let actType = "ESM"; // ESM, CJS, CJS3only

    // ##################################################
    // ローカルファイル参照

    // ES Modules
    if (0) {
        actType = "ESM";
        // 方法１
        import(SCRIPT_URL_ESM_1).then((obj) => {Maze = obj; console.log("obj=",obj)});
        import(SCRIPT_URL_ESM_2).then((obj) => {MazeData = obj; console.log("obj=",obj)});
    }

    // await をコールするとエラーになる／asyncを宣言した関数内でもトップレベルでもないから
    // Uncaught SyntaxError: await is only valid in async functions and the top level bodies of modules (at 076_3async.js:45:9)
    // // if (0) {
    // //     actType = "ESM";
    // //     // 方法２
    // //     await import(SCRIPT_URL_ESM_1).then((obj) => {Maze = obj; console.log("obj=",obj)});
    // //     await import(SCRIPT_URL_ESM_2).then((obj) => {MazeData = obj; console.log("obj=",obj)});
    // // }

    if (0) {
        actType = "ESM";
        // 方法３ .. 失敗
        // Uncaught SyntaxError: Unexpected token 'export' (at Maze.js:28:1)
        BABYLON.Tools.LoadScript(SCRIPT_URL_ESM_1, (obj) => {
            Maze = obj; console.log("obj=",obj)
        },(e) => {
            console.log("failed ?", e);
        });
    }

    if (0) {
        actType = "ESM";
        // 方法５(改) .. 失敗
        // Uncaught TypeError: Cannot read properties of null (reading 'appendChild')
        function loadModule() {
            const importMap = {
                imports: {
                    "Maze": SCRIPT_URL_ESM_1,
                    "MazeData": SCRIPT_URL_ESM_2
                }
            };
            const script = document.createElement('script');
            script.type = 'importmap';
            script.textContent = JSON.stringify(importMap);
            document.body.appendChild(script);
            import("Maze").then((obj) => {Maze = obj;});
            import("MazeData").then((obj) => {MazeData = obj;});
        }
        // await loadModule();
        loadModule();
    }

    if (0) {
        actType = "ESM";
        // 方法６(改) .. 失敗
        // Uncaught SyntaxError: Unexpected token 'export' (at Maze.js:28:1)
        new Promise((resolve, reject) => {
            BABYLON.Tools.LoadScript(SCRIPT_URL_ESM_1, resolve, reject);
        });
    }

    if (0) {
        actType = "ESM";
        // 方法７ .. 失敗
        // Uncaught SyntaxError: Unexpected token 'export' (at Maze.js:28:1)
        // Uncaught (in promise) ReferenceError: Maze2 is not defined
        BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_ESM_1).then(() => {
            Maze = new Maze2();
        },(e) => {
            console.log("failed ?", e);
        });
    }

    if (0) {
        actType = "ESM";
        // 方法８ .. 失敗
        // Uncaught (in promise) SyntaxError: Unexpected token 'export'
        fetch(SCRIPT_URL_ESM_1).then(r=>{return r.text()}).then(t=>eval(t)).then((obj)=>{
            console.log("obj=",obj);
            Maze = new Maze2();
            console.log("Maze=",Maze);
        })
    }

    // ##################################################

    // CommonJS
    if (0) {
        actType = "CJS";
        // 方法１ .. 失敗
        // obj= Module {Symbol(Symbol.toStringTag): 'Module'}
        import(SCRIPT_URL_CJS_1).then((obj) => {
            console.log("obj=",obj)
        });
        // Uncaught (in promise) ReferenceError: getMap2Data is not defined
        import(SCRIPT_URL_CJS_2).then(() => {
            let v2 = getMap2Data('sdatamm2015final');
            console.log("v2=",v2.slice(0,3));
        });
        // Uncaught (in promise) TypeError: Cannot set properties of undefined (setting 'noise')
        import(SCRIPT_URL_CJS_3).then(() => {
            noise.seed(1);
            let v3 = noise.perlin3(0.2,0.2,0);
            console.log("v3=", v3);
        });
    }

    // // await を取り除くと方法１と同じなので割愛
    // // if (0) {
    // //     actType = "CJS";
    // //     // 方法２ .. 失敗
    // //     await import(SCRIPT_URL_CJS_1).then((obj) => {
    // //         console.log("obj=",obj);
    // //         // Module {Symbol(Symbol.toStringTag): 'Module'}
    // //     });
    // //     // Uncaught (in promise) ReferenceError: getMap2Data is not defined
    // //     await import(SCRIPT_URL_CJS_2).then((obj) => {
    // //         let v2 = getMap2Data('sdatamm2015final');
    // //         console.log("v2=",v2.slice(0,3));
    // //     });
    // //     // Uncaught (in promise) TypeError: Cannot set properties of undefined (setting 'noise')
    // //     await import(SCRIPT_URL_CJS_3).then((obj) => {
    // //         noise.seed(1);
    // //         let v3 = noise.perlin3(0.2,0.2,0);
    // //         console.log("v3=", v3);
    // //     });
    // // }

    if (0) {
        actType = "CJS";
        // 方法３
        BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_1, () => {
            Maze = new Maze2();
            console.log("Maze=",Maze);
        },(e) => {
            console.log("failed ?", e);
        });
        BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_2, () => {
            let v2 = getMap2Data('sdatamm2015final');
            console.log("v2=",v2.slice(0,3));
        });
        BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_3, () => {
            noise.seed(1);
            let v3 = noise.perlin3(0.2,0.2,0);
            console.log("v3=", v3);
        });
    }

    if (0) {
        actType = "CJS";
        // 方法５(改) .. 失敗
        // Uncaught TypeError: Cannot read properties of null (reading 'appendChild')
        function loadModule() {
            const importMap = {
                imports: {
                    "Maze": SCRIPT_URL_CJS_1,
                    "MazeData": SCRIPT_URL_CJS_2,
                    "perlin": SCRIPT_URL_CJS_3
                }
            };
            const script = document.createElement('script');
            script.type = 'importmap';
            script.textContent = JSON.stringify(importMap);
            document.body.appendChild(script);
            import("Maze");
            import("MazeData");
            import("perlin");
        }
        loadModule();
    }

    if (0) {
        actType = "CJS";
        // 方法６(改)
        new Promise((resolve, reject) => {
            BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_1, resolve, reject);
        });
        new Promise((resolve, reject) => {
            BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_2, resolve, reject);
        });
        new Promise((resolve, reject) => {
            BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_3, resolve, reject);
        });
    }

    if (0) {
        actType = "CJS";
        // 方法７
        BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_CJS_1).then(() => {
            Maze = new Maze2();
        },(e) => {
            console.log("failed ?", e);
        });
        BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_CJS_2).then(() => {
            let v2 = getMap2Data('sdatamm2015final');
            console.log("v2=",v2.slice(0,3));
        });
        BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_CJS_3).then(() => {
            noise.seed(1);
            let v3 = noise.perlin3(0.2,0.2,0);
            console.log("v3=", v3);
        });
    }

    if (0) {
        actType = "CJS3only";
        // 方法８  一部のみ成功

        // 失敗
        // Uncaught (in promise) ReferenceError: Maze2 is not defined
        fetch(SCRIPT_URL_CJS_1).then(r=>{return r.text()}).then(t=>eval(t)).then(()=>{
            Maze = new Maze2();
        })
        // 失敗
        // Uncaught (in promise) ReferenceError: getMap2Data is not defined
        fetch(SCRIPT_URL_CJS_2).then(r=>{return r.text()}).then(t=>eval(t)).then(()=>{
            let v2 = getMap2Data('sdatamm2015final');
            console.log("v2=",v2.slice(0,3));
        })
        // 成功
        fetch(SCRIPT_URL_CJS_3).then(r=>{return r.text()}).then(t=>eval(t)).then(()=>{
            noise.seed(1);
            let v3 = noise.perlin3(0.2,0.2,0);
            console.log("v3=", v3);
        })
    }

    // ##################################################
    // github ファイル（cdn.jsdelivr.netドメイン経由）参照

    // ES Modules
    if (0) {
        actType = "ESM";
        // 方法１
        import(SCRIPT_URL_ESM_GIT_1).then((obj) => {Maze = obj; console.log("obj=",obj)});
        import(SCRIPT_URL_ESM_GIT_2).then((obj) => {MazeData = obj; console.log("obj=",obj)});
    }

    // // await を取り除くと方法１と同じなので割愛
    // // if (0) {
    // //     actType = "ESM";
    // //     // 方法２
    // //     await import(SCRIPT_URL_ESM_GIT_1).then((obj) => {Maze = obj; console.log("obj=",obj)});
    // //     await import(SCRIPT_URL_ESM_GIT_2).then((obj) => {MazeData = obj; console.log("obj=",obj)});
    // // }

    if (0) {
        actType = "ESM";
        // 方法３ .. 失敗
        // Uncaught SyntaxError: Unexpected token 'export' (at Maze.js:28:1)
        BABYLON.Tools.LoadScript(SCRIPT_URL_ESM_GIT_1, (obj) => {
            Maze = obj; console.log("obj=",obj)
        },(e) => {
            console.log("failed ?", e);
        });
    }

    if (0) {
        actType = "ESM";
        // 方法５(改)
        // Uncaught TypeError: Cannot read properties of null (reading 'appendChild')
        function loadModule() {
            const importMap = {
                imports: {
                    "Maze": SCRIPT_URL_ESM_GIT_1,
                    "MazeData": SCRIPT_URL_ESM_GIT_2
                }
            };
            const script = document.createElement('script');
            script.type = 'importmap';
            script.textContent = JSON.stringify(importMap);
            document.body.appendChild(script);
            import("Maze").then((obj) => {Maze = obj;});
            import("MazeData").then((obj) => {MazeData = obj;});
        }
        loadModule();
    }

    if (0) {
        actType = "ESM";
        // 方法６(改) .. 失敗
        // Uncaught SyntaxError: Unexpected token 'export' (at Maze.js:28:1)
        new Promise((resolve, reject) => {
            BABYLON.Tools.LoadScript(SCRIPT_URL_ESM_GIT_1, resolve, reject);
        });
    }

    if (0) {
        actType = "ESM";
        // 方法７ .. 失敗
        // Uncaught SyntaxError: Unexpected token 'export' (at Maze.js:28:1)
        // Uncaught (in promise) ReferenceError: Maze2 is not defined
        BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_ESM_GIT_1).then(() => {
            Maze = new Maze2();
        },(e) => {
            console.log("failed ?", e);
        });
    }

    if (0) {
        actType = "ESM";
        // 方法８ .. 失敗
        // Uncaught (in promise) SyntaxError: Unexpected token 'export'
        fetch(SCRIPT_URL_ESM_GIT_1).then(r=>{return r.text()}).then(t=>eval(t)).then((obj)=>{
            console.log("obj=",obj);
            Maze = new Maze2();
            console.log("Maze=",Maze);
        })
    }

    // ##################################################

    // CommonJS
    if (0) {
        actType = "CJS";
        // 方法１ .. 失敗
        // obj= Module {Symbol(Symbol.toStringTag): 'Module'}
        import(SCRIPT_URL_CJS_GIT_1).then((obj) => {
            console.log("obj=",obj)
        });
        // Uncaught (in promise) ReferenceError: getMap2Data is not defined
        import(SCRIPT_URL_CJS_GIT_2).then(() => {
            let v2 = getMap2Data('sdatamm2015final');
            console.log("v2=",v2.slice(0,3));
        });
        // Uncaught (in promise) TypeError: Cannot set properties of undefined (setting 'noise')
        import(SCRIPT_URL_CJS_GIT_3).then(() => {
            noise.seed(1);
            let v3 = noise.perlin3(0.2,0.2,0);
            console.log("v3=", v3);
        });
    }

    // // await を取り除くと方法１と同じなので割愛
    // // if (0) {
    // //     actType = "CJS";
    // //     // 方法２ .. 失敗
    // //     await import(SCRIPT_URL_CJS_GIT_1).then((obj) => {
    // //         console.log("obj=",obj);
    // //         // Module {Symbol(Symbol.toStringTag): 'Module'}
    // //     });
    // //     // Uncaught (in promise) ReferenceError: getMap2Data is not defined
    // //     await import(SCRIPT_URL_CJS_GIT_2).then((obj) => {
    // //         let v2 = getMap2Data('sdatamm2015final');
    // //         console.log("v2=",v2.slice(0,3));
    // //     });
    // //     // Uncaught (in promise) TypeError: Cannot set properties of undefined (setting 'noise')
    // //     await import(SCRIPT_URL_CJS_GIT_3).then((obj) => {
    // //         noise.seed(1);
    // //         let v3 = noise.perlin3(0.2,0.2,0);
    // //         console.log("v3=", v3);
    // //     });
    // // }

    if (0) {
        actType = "CJS";
        // 方法３
        BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_1, () => {
            Maze = new Maze2();
            console.log("Maze=",Maze);
        },(e) => {
            console.log("failed ?", e);
        });
        BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_2, () => {
            let v2 = getMap2Data('sdatamm2015final');
            console.log("v2=",v2.slice(0,3));
        });
        BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_3, () => {
            noise.seed(1);
            let v3 = noise.perlin3(0.2,0.2,0);
            console.log("v3=", v3);
        });
    }

    if (0) {
        actType = "CJS";
        // 方法５(改) .. 失敗
        function loadModule() {
            const importMap = {
                imports: {
                    "Maze": SCRIPT_URL_CJS_GIT_1,
                    "MazeData": SCRIPT_URL_CJS_GIT_2,
                    "perlin": SCRIPT_URL_CJS_GIT_3
                }
            };
            const script = document.createElement('script');
            script.type = 'importmap';
            script.textContent = JSON.stringify(importMap);
            document.body.appendChild(script);
            import("Maze");
            import("MazeData");
            import("perlin");
        }
        loadModule();
    }

    if (0) {
        actType = "CJS";
        // 方法６(改)
        new Promise((resolve, reject) => {
            BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_1, resolve, reject);
        });
        new Promise((resolve, reject) => {
            BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_2, resolve, reject);
        });
        new Promise((resolve, reject) => {
            BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_3, resolve, reject);
        });
    }

    if (0) {
        actType = "CJS";
        // 方法７
        BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_CJS_GIT_1).then(() => {
            Maze = new Maze2();
        },(e) => {
            console.log("failed ?", e);
        });
        BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_CJS_GIT_2).then(() => {
            let v2 = getMap2Data('sdatamm2015final');
            console.log("v2=",v2.slice(0,3));
        });
        BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_CJS_GIT_3).then(() => {
            noise.seed(1);
            let v3 = noise.perlin3(0.2,0.2,0);
            console.log("v3=", v3);
        });
    }

    if (0) {
        actType = "CJS3only";
        // 方法８  ３番目のみ成功

        // 失敗
        // Uncaught (in promise) ReferenceError: Maze2 is not defined
        fetch(SCRIPT_URL_CJS_GIT_1).then(r=>{return r.text()}).then(t=>eval(t)).then(()=>{
            Maze = new Maze2();
        })
        // 失敗
        // Uncaught (in promise) ReferenceError: getMap2Data is not defined
        fetch(SCRIPT_URL_CJS_GIT_2).then(r=>{return r.text()}).then(t=>eval(t)).then(()=>{
            let v2 = getMap2Data('sdatamm2015final');
            console.log("v2=",v2.slice(0,3));
        })
        // 成功
        fetch(SCRIPT_URL_CJS_GIT_3).then(r=>{return r.text()}).then(t=>eval(t)).then(()=>{
            noise.seed(1);
            let v3 = noise.perlin3(0.2,0.2,0);
            console.log("v3=", v3);
        })
    }



    // ##################################################
    // github ファイル（raw.githubusercontent.comドメイン経由）参照..失敗


var createScene = async function () {
    await BABYLON.InitializeCSG2Async();

    console.log("Maze=",Maze);
    console.log("MazeData=",MazeData);

    // 再度の関数呼び出しの確認
    if (actType == "ESM") {
        if (Maze != null) {
            let v1 = new Maze.Maze2();
            console.log("v1=",v1);
        }
        if (MazeData != null) {
            let v2 = MazeData.getMap2Data('sdatamm2015final');
            console.log("v2=",v2.slice(0,3));
        }

    } else if (actType == "CJS") {
        // isCJS
            let v1 = new Maze2();
            console.log("v1=",v1);
            let v2 = getMap2Data('sdatamm2015final');
            console.log("v2=",v2.slice(0,3));
            noise.seed(1);
            let v3 = noise.perlin3(0.2,0.2,0);
            console.log("v3=", v3);

    } else if (actType == "CJS3only") {
            noise.seed(1);
            let v3 = noise.perlin3(0.2,0.2,0);
            console.log("v3=", v3);
    }


    // ------------------------------------------------------------
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Our built-in 'sphere' shape.
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);

    // Move the sphere upward 1/2 its height
    sphere.position.y = 1;

    // Our built-in 'ground' shape.
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);

    return scene;
}

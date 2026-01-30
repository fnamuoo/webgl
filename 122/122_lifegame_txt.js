// Babylon.js：セルオートマトン（ライフゲーム）／WebGPU・ComputeShaderingで実装する
// texture版

// Configuration
const CONFIG = {
    // シミュレーショングリッドサイズ
//    gridSize: 500,
    gridSize: 1000,
//    gridSize: 2000,
//    gridSize: 4000,
//    gridSize: 6000, // xx
//    gridSize: 8000, // xx
};

// 反応拡散コンピュートシェーダ
const reactionDiffusionShader = /* wgsl */`
struct SimParams {
    gridSize: u32,
}

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read> gridIn: array<f32>;
@group(0) @binding(2) var<storage, read_write> gridOut: array<f32>;

fn xy2i(x: i32, y: i32) -> i32 {
    let size = i32(params.gridSize);
    let wx = (x + size) % size;
    let wy = (y + size) % size;
    return wy * size + wx;
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let ux = gid.x;
    let uy = gid.y;
    let ix = i32(ux);
    let iy = i32(uy);
    
    if (ux >= params.gridSize || uy >= params.gridSize) {
        return;
    }

    let idx = xy2i(ix, iy);
    var curVal:u32 = u32(gridIn[idx]);
    var neighbors: u32 = 0u;
    for (var dy:i32 = -1; dy <= 1; dy++) {
        for (var dx:i32 = -1; dx <= 1; dx++) {
            neighbors += u32(gridIn[xy2i(ix+dx, iy+dy)]);
        }
    }
    neighbors -= curVal;

    if (curVal == 1u && (neighbors < 2u || neighbors > 3u)) {
        curVal = 0u;
    } else if (curVal == 0u && neighbors == 3u) {
        curVal = 1u;
    }

    gridOut[idx] = f32(curVal);
    
}
`;

// 可視化用コンピュートシェーダ（グリッドからカラーテクスチャへ）
const visualizeShader = /* wgsl */`
struct SimParams {
    gridSize: u32,
}

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read> grid: array<f32>;
@group(0) @binding(2) var outputTexture: texture_storage_2d<rgba8unorm, write>;


@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let x = gid.x;
    let y = gid.y;
    
    if (x >= params.gridSize || y >= params.gridSize) {
        return;
    }
    
    let id = y * params.gridSize + x;
    let v = grid[id];
    
    // 白黒を反転
    let rv = 1-v;
    let color: vec3<f32> = vec3<f32>(rv, rv, rv);
    
    // テクスチャに反映    
    textureStore(outputTexture, vec2<i32>(i32(x), i32(y)), vec4<f32>(color, 1.0));
}
`;

// ------------------------------------------------------------
// ------------------------------------------------------------
// ------------------------------------------------------------

// シミュレーションクラス
class ReactionDiffusionSimulation {
    constructor(engine, scene) {
        this.engine = engine;
        this.scene = scene;
        this.currentBuffer = 0;
        this.isInitialized = false;

        this.workgroups = Math.ceil(CONFIG.gridSize / 16);
    }

    async initialize() {
        this.createBuffers();
        this.createComputeShaders();
        await this.initializeGrid();
        this.createVisualization();
        this.isInitialized = true;
    }

    createBuffers() {
        const gridSize = CONFIG.gridSize;
        const bufferSize = gridSize * gridSize * 4;

        // ダブルバッファリング用のストレージバッファ
        this.gridBuffers = [
            new BABYLON.StorageBuffer(this.engine, bufferSize),
            new BABYLON.StorageBuffer(this.engine, bufferSize)
        ];

        // ユニフォームバッファ
        this.paramsUBO = new BABYLON.UniformBuffer(this.engine, undefined, undefined, "SimParams");
        ["gridSize"]
            .forEach(name => this.paramsUBO.addUniform(name, 1));

        this.paramsUBO.updateUInt("gridSize", CONFIG.gridSize);
        this.paramsUBO.update();
    }

    createComputeShaders() {
        // シェーダ（バッファ0→1）
        this.rdCS0 = new BABYLON.ComputeShader("rd0", this.engine, 
            { computeSource: reactionDiffusionShader },
            { bindingsMapping: {
                "params": { group: 0, binding: 0 },
                "gridIn": { group: 0, binding: 1 },
                "gridOut": { group: 0, binding: 2 }
            }}
        );
        this.rdCS0.setUniformBuffer("params", this.paramsUBO);
        this.rdCS0.setStorageBuffer("gridIn", this.gridBuffers[0]);
        this.rdCS0.setStorageBuffer("gridOut", this.gridBuffers[1]);

        // シェーダ（バッファ1→0）
        this.rdCS1 = new BABYLON.ComputeShader("rd1", this.engine,
            { computeSource: reactionDiffusionShader },
            { bindingsMapping: {
                "params": { group: 0, binding: 0 },
                "gridIn": { group: 0, binding: 1 },
                "gridOut": { group: 0, binding: 2 }
            }}
        );
        this.rdCS1.setUniformBuffer("params", this.paramsUBO);
        this.rdCS1.setStorageBuffer("gridIn", this.gridBuffers[1]);
        this.rdCS1.setStorageBuffer("gridOut", this.gridBuffers[0]);

        this.rdShaders = [this.rdCS0, this.rdCS1];
    }

    async initializeGrid() {
        const gridSize = CONFIG.gridSize;
        const data = new Float32Array(gridSize * gridSize);

        // 初期条件: 全体をU=1, V=0に設定し、中央にVの種をまく
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const idx = (y * gridSize + x);
                data[idx] = 0.0;
                if (Math.random() > 0.7) {
                    data[idx] = 1.0;
                }
            }
        }

        this.gridBuffers[0].update(data);
        this.gridBuffers[1].update(data);
    }


    createVisualization() {
        const gridSize = CONFIG.gridSize;

        // 出力テクスチャ
        this.outputTexture = new BABYLON.RenderTargetTexture(
            "outputTexture",
            { width: gridSize, height: gridSize },
            this.scene,
            false,
            undefined,
            BABYLON.Constants.TEXTURETYPE_UNSIGNED_BYTE,
            false,
            BABYLON.Constants.TEXTURE_NEAREST_SAMPLINGMODE,
            false, false, false,
            BABYLON.Constants.TEXTUREFORMAT_RGBA,
            false, undefined,
            BABYLON.Constants.TEXTURE_CREATIONFLAG_STORAGE
        );

        // 可視化シェーダ
        this.vizCS = new BABYLON.ComputeShader("visualize", this.engine,
            { computeSource: visualizeShader },
            { bindingsMapping: {
                "params": { group: 0, binding: 0 },
                "grid": { group: 0, binding: 1 },
                "outputTexture": { group: 0, binding: 2 }
            }}
        );
        this.vizCS.setUniformBuffer("params", this.paramsUBO);
        this.vizCS.setStorageBuffer("grid", this.gridBuffers[0]);
        this.vizCS.setStorageTexture("outputTexture", this.outputTexture);

        // 表示用平面
        const plane = BABYLON.MeshBuilder.CreatePlane("displayPlane", { size: 4 }, this.scene);
        
        const material = new BABYLON.StandardMaterial("material", this.scene);
        material.diffuseTexture = this.outputTexture;
        material.emissiveTexture = this.outputTexture;
        material.disableLighting = true;
        material.backFaceCulling = false;
        plane.material = material;
    }

    async update() {
        if (!this.isInitialized) return;

        // 実行
        this.rdShaders[this.currentBuffer].dispatch(this.workgroups, this.workgroups);
        this.currentBuffer = 1 - this.currentBuffer;

        // 可視化シェーダの入力バッファを更新
        this.vizCS.setStorageBuffer("grid", this.gridBuffers[this.currentBuffer]);
        this.vizCS.dispatch(this.workgroups, this.workgroups);
    }

}

// シーン作成
var createScene = async function() {
    const scene = new BABYLON.Scene(engine);
    
    // WebGPUサポートチェック
    if (!engine.getCaps().supportComputeShaders) {
        const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const text = new BABYLON.GUI.TextBlock();
        text.text = "WebGPU + Compute Shader が必要です\nChrome/Edge でWebGPUを有効にしてください";
        text.color = "#ff6666";
        text.fontSize = "24px";
        ui.addControl(text);
        return scene;
    }

    // カメラ設定
    const camera = new BABYLON.ArcRotateCamera(
        "camera", -Math.PI / 2, Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene
    );

    camera.attachControl(canvas, true);
    camera.wheelDeltaPercentage = 0.01;
    camera.minZ = 0.01;
    
    scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.1);

    // シミュレーション初期化
    const simulation = new ReactionDiffusionSimulation(engine, scene);
    await simulation.initialize();

    // アニメーションループ
    scene.registerBeforeRender(() => {
        simulation.update();
    });

    return scene;
};

export default createScene

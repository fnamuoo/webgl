// Babylon.js：セルオートマトン（ライフゲーム）／WebGPU・ComputeShaderingで実装する
// thinInstance版

// ----------------------------------------

// const GRID_SIZE = 500, scale=0.1;
const GRID_SIZE = 1000, scale=0.06;
// const GRID_SIZE = 2000, scale=0.03;  // xx heavy
// const GRID_SIZE = 4000, scale=0.01;

// Generate instance matrices and colors
const instanceShader = /* wgsl */`
struct Params {
    gridSize: u32,
}


@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read_write> colors: array<f32>;
@group(0) @binding(2) var<storage, read> gridIn: array<u32>;
@group(0) @binding(3) var<storage, read_write> gridOut: array<u32>;

fn xy2i(x: i32, y: i32) -> i32 {
    let size = i32(params.gridSize);
    let wx = (x + size) % size;
    let wy = (y + size) % size;
    return wy * size + wx;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let ux = gid.x;
    let uy = gid.y;
    let ix = i32(ux);
    let iy = i32(uy);
    
    if (ux >= params.gridSize || uy >= params.gridSize) {
        return;
    }

    let idx = xy2i(ix, iy);
    var curVal:u32 = gridIn[idx];
    var neighbors: u32 = 0u;
    for (var dy:i32 = -1; dy <= 1; dy++) {
        for (var dx:i32 = -1; dx <= 1; dx++) {
            neighbors += gridIn[xy2i(ix+dx, iy+dy)];
        }
    }
    neighbors -= curVal;

    if (curVal == 1u && (neighbors < 2u || neighbors > 3u)) {
        curVal = 0u;
    } else if (curVal == 0u && neighbors == 3u) {
        curVal = 1u;
    }

    gridOut[idx] = curVal;

    let v = f32(1u - gridOut[idx]);
    let colIdx = idx * 4;
    colors[colIdx] = v;
    colors[colIdx + 1] = v;
    colors[colIdx + 2] = v;

}
`;

// ----------------------------------------
// ----------------------------------------

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.025, 0.04, 1.0);

    if (!engine.getCaps().supportComputeShaders) {
        const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui");
        const text = new BABYLON.GUI.TextBlock();
        text.text = "WebGPU required!";
        text.color = "red";
        text.fontSize = 24;
        ui.addControl(text);
        return scene;
    }

    const nx=GRID_SIZE, ny=GRID_SIZE;
    const n=nx*ny;

    let camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 0,-80), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.wheelDeltaPercentage = 0.01;
    camera.minZ = 0.01;

    // Lighting
    const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0.3, 1, 0.2), scene);
    hemi.intensity = 0.7;
    hemi.groundColor = new BABYLON.Color3(0.15, 0.15, 0.25);

    const matrixData = new Float32Array(n * 16);
    let colorData = new Float32Array(n * 4);
    const data = new Uint32Array(n);
    {
        let adjx=-(nx-1)/2, adjy=(ny-1)/2;
        let m = BABYLON.Matrix.Identity();
        let index = 0;
        for (let iy = 0; iy < ny; ++iy) {
            m.m[13] = (-iy+adjy)*scale;
            for (let ix = 0; ix < nx; ++ix) {
                m.m[12] = (ix+adjx)*scale;
                m.copyToArray(matrixData, index * 16);
                data[index] = 0.0;
                if (Math.random() > 0.7) {
                    data[index] = 1.0;
                }
                colorData[index * 4 + 0] = Math.random();
                colorData[index * 4 + 1] = Math.random();
                colorData[index * 4 + 2] = Math.random();
                colorData[index * 4 + 3] = 1.0;
                ++index;
            }
        }
    }

    const instanceUBO = new BABYLON.UniformBuffer(engine);
    instanceUBO.addUniform("gridSize", 1);
    //
    instanceUBO.updateUInt("gridSize", nx);
    instanceUBO.update();


    // Storage buffers for matrices/colors
    const matrixBuffer = new BABYLON.StorageBuffer(engine, matrixData.byteLength,
        BABYLON.Constants.BUFFER_CREATIONFLAG_WRITE | BABYLON.Constants.BUFFER_CREATIONFLAG_READ);
    matrixBuffer.update(matrixData);

    const colorBuffer = new BABYLON.StorageBuffer(engine, colorData.byteLength,
        BABYLON.Constants.BUFFER_CREATIONFLAG_WRITE | BABYLON.Constants.BUFFER_CREATIONFLAG_READ);
    colorBuffer.update(colorData);

    const gridBuffers = [
        new BABYLON.StorageBuffer(engine, data.byteLength, BABYLON.Constants.BUFFER_CREATIONFLAG_READWRITE),
        new BABYLON.StorageBuffer(engine, data.byteLength, BABYLON.Constants.BUFFER_CREATIONFLAG_READWRITE)
    ];
    gridBuffers[0].update(data);
    gridBuffers[1].update(data);


    const csInstance = new BABYLON.ComputeShader("instance", engine, { computeSource: instanceShader }, {
        bindingsMapping: {
            "params": { group: 0, binding: 0 },
            "colors": { group: 0, binding: 1 },
            "gridIn": { group: 0, binding: 2 },
            "gridOut": { group: 0, binding: 3 }
        }
    });
    csInstance.setUniformBuffer("params", instanceUBO);
    csInstance.setStorageBuffer("colors", colorBuffer);
    csInstance.setStorageBuffer("gridIn", gridBuffers[0]);
    csInstance.setStorageBuffer("gridOut", gridBuffers[1]);

    let mesh = BABYLON.MeshBuilder.CreateBox("", {size:scale}, scene);

    // Standard material for instances
    const coneMat = new BABYLON.StandardMaterial("coneMat", scene);
    coneMat.diffuseColor = BABYLON.Color3.White();
    coneMat.emissiveColor = BABYLON.Color3.White();
    mesh.material = coneMat;

    // Register thin instances
    mesh.thinInstanceRegisterAttribute("color", 4);
    mesh.thinInstanceSetBuffer("matrix", matrixData, 16);
    mesh.thinInstanceSetBuffer("color", colorData, 4, false);
    mesh.alwaysSelectAsActiveMesh = true;

    let pendingRead = false;
    let gridInOut = true;

    // Main loop
    scene.onBeforeRenderObservable.add(() => {
        if (pendingRead) return;

        csInstance.dispatch(Math.ceil(nx/8), Math.ceil(ny/8));

        // Read back and update thin instances
        pendingRead = true;
        Promise.all([
            matrixBuffer.read(),
            colorBuffer.read()
        ]).then(([matData, colData]) => {
            // カラーバッファを取り出し、メッシュに反映
            colorData.set(new Float32Array(colData.buffer));
            mesh.thinInstanceBufferUpdated("color");

            // バッファの交換
            if (gridInOut) {
                gridInOut = false;
                csInstance.setStorageBuffer("gridIn", gridBuffers[1]);
                csInstance.setStorageBuffer("gridOut", gridBuffers[0]);
            } else {
                gridInOut = true;
                csInstance.setStorageBuffer("gridIn", gridBuffers[0]);
                csInstance.setStorageBuffer("gridOut", gridBuffers[1]);
            }

            pendingRead = false;
        });

    });

    return scene;
};

export default createScene;



// NoiseBlock.noise で凹凸のある地形を作る

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(2, 5,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.position = new BABYLON.Vector3(20, 150, 70);
    light.intensity = 0.7;

    let nb = new BABYLON.NoiseBlock();
    const nbvzero = new BABYLON.Vector3(0,0,0);
    // perlinの文様を変えずに meshサイズを変更するには nbscale*gridratio=一定とする
    let gridratio = 0.1, nbscale = 0.02/gridratio;
    let rootPath = [];
    let size = 100, size_ = size/2;
    let nmin = -size_, nmax = size_+1;
    let yratio = 5; // 高低差の倍率
    for (let iz = nmin; iz < nmax; ++iz) {
        let z = iz*gridratio;
        let path = []
        for (let ix = nmin; ix < nmax; ++ix) {
            let x = ix*gridratio;
            let y = nb.noise(8,   // octaves: def=2 [0, 16]
                             0.5, // roughness: def=0.5 [0, 1]  小:= 低周波・滑 -- 大:= 高周波・粗
                             new BABYLON.Vector3(x,z,0), // _position: 
                             nbvzero, // offset: 
                             nbscale  // scale : def=1 [-MAX,MAX]  x,y,zの係数
                            );
            y *= yratio;
            path.push(new BABYLON.Vector3(x, y, z));
        }
        rootPath.push(path);
    }
    trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
    trgMesh.material = new BABYLON.GradientMaterial("grad", scene);
    trgMesh.material.topColor = new BABYLON.Color3(0.9, 0.2, 0.2);
    trgMesh.material.bottomColor = new BABYLON.Color3(0.2, 0.2, 0.9);
    trgMesh.material.smoothness = 0.6*yratio; // 高低差yratioを変えてmaterialを変えないために、yratio に比例させる
    trgMesh.material.scale = 0.08*yratio;     // (同上)
    trgMesh.material.wireframe = true;
    trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);

    return scene;
}

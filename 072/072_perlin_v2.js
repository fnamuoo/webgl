// NoiseBlock.noise でパーリンノイズ

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    let MAX = 150;
    let MAX2 = MAX * 2;

    var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2.24, MAX2 * 2, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    camera.maxZ = MAX2 * MAX2;

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.position = new BABYLON.Vector3(20, 150, 70);
    light.intensity = 0.7;

    let time = 0;
    const points = [];
    const colors = [];

    let nb = new BABYLON.NoiseBlock();

    let ratio = 1 / MAX * 3;
    const vzero = new BABYLON.Vector3(0,0,0);
    let funcColor = (px, py, time) => {
        let x = px * ratio;
        let y = py * ratio;
        let color = nb.noise(0,   // octaves: def=2 [0, 16]
                             0.5, // roughness: def=0.5 [0, 1]  大きいほど高周波・粗く、小さいほど低周波・滑らかに
                             new BABYLON.Vector3(x,y,time), // _position:
                             vzero, // offset: 
                             1      //scale: def=1 [-MAX,MAX]  x,y,zの係数。z=0なら scale=1 and pxの組み合わせの結果と scale 1/MAX*2 and px の結果が同じ
                            );

        return {
            r: color,
            g: color, // * 0.5,
            b: color, // Math.sin(color + time / 3.0) * 0.75,
            a: 1.0
        };
    }

    for (let x = -MAX; x <= MAX; x++) {
        for (let y = -MAX; y <= MAX; y++) {
            let c = funcColor(x, y, 0);
            points.push(new BABYLON.Vector3(x, y, 0));
            colors.push(new BABYLON.Color4(c.r, c.g, c.b, c.a));
        }
    }

    var pcs = new BABYLON.PointsCloudSystem("pcs", 5, scene);

    var initParticles = function (particle, i, s) {
        particle.position = points[i];
        particle.color = colors[i];
    };
    pcs.addPoints(points.length, initParticles);
    pcs.buildMeshAsync();


    pcs.updateParticle = function (particle) {
        let c = funcColor(particle.position.x, particle.position.y, time);
        particle.color.set(c.r, c.g, c.b, c.a);
        particle.position.z = c.r * 50;
    };


    scene.registerAfterRender(() => {
        pcs.setParticles();

        time += 0.01;
    });


    return scene;
}

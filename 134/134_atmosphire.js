// Babylon.js：ミー散乱と奇岩で山霞をつくる

// const pathRoot = "./";
// const pathRoot = "./";
const pathRoot = "";
// const pathRoot = "https://raw.githubusercontent.com/fnamuoo/webgl/main/134/";

// const fpathSUN = pathRoot + '../117/textures/sun.png';
const fpathSUN = pathRoot + 'textures/sun.png';

// ============================================================

export var createScene_test_904 = async function () {
    if (!ADDONS.Atmosphere.IsSupported(engine)) {
        throw new Error("Atmosphere.IsSupported(engine) returned false.");
    }

    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    var camera = new BABYLON.ArcRotateCamera("Camera", 1.8, 1.65, 0.001, new BABYLON.Vector3(0,8000,0), scene);
    // 下向き
    // var camera = new BABYLON.ArcRotateCamera("Camera", 1.8, 1.30, 0.001, new BABYLON.Vector3(0,8000,0), scene);
    camera.maxZ = 0.0; // 0 for an infinite far plane
    camera.attachControl(canvas, true);

    const light = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(0, -0.5, 1).normalize(), scene);
    light.intensity = Math.PI;

    if (1) {
        // レイリー散乱
        var pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene);
        pipeline.imageProcessingEnabled = true;
        pipeline.imageProcessing.toneMappingEnabled = true;
        pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
        pipeline.imageProcessing.ditheringEnabled = true;
        pipeline.fxaaEnabled = true;
        var atmosphere = new ADDONS.Atmosphere('atmo', scene, [light], { isDiffuseSkyIrradianceLutEnabled: !engine._badOS });
        // atmosphere.physicalProperties.rayleighScatteringScale = 0.6; // 効果がわかりにくい
        atmosphere.physicalProperties.rayleighScatteringScale = 2.0;
//        atmosphere.physicalProperties.rayleighScatteringScale = 5.0; // 朝焼け・夕焼けの赤みが強くなる
        atmosphere.minimumMultiScatteringIntensity = 0.1;
        atmosphere.isLinearSpaceComposition = true;
        atmosphere.isLinearSpaceLight = true;
    }

    if (1) {
        // ミー散乱
        const defaultRenderingPipeline = new BABYLON.DefaultRenderingPipeline("Default");
        defaultRenderingPipeline.imageProcessingEnabled = true;
        defaultRenderingPipeline.imageProcessing.ditheringEnabled = true;
        defaultRenderingPipeline.imageProcessing.toneMappingEnabled = true;
        defaultRenderingPipeline.imageProcessing.toneMappingType = 1; // ACES
        defaultRenderingPipeline.imageProcessing.exposure = 1.5;
        const atmosphere = new ADDONS.Atmosphere("Atmosphere", scene, [ light ]);
        atmosphere.additionalDiffuseSkyIrradianceIntensity = 0.01;
        atmosphere.minimumMultiScatteringIntensity = 0.1;
        atmosphere.isLinearSpaceComposition = true;
        atmosphere.isLinearSpaceLight = true;
        atmosphere.physicalProperties.mieScatteringScale = 10;
//        atmosphere.physicalProperties.mieScatteringScale = 200; // 霧におおわれた感じ
//        atmosphere.physicalProperties.mieScatteringScale = 1000; // 雲にすっぽり埋もれた感じ
    }

    if (0) {
        // レイリー散乱 + ミー散乱 != 上記を２つ同時に有効にした場合と見え方が違う
        var pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene);
        pipeline.imageProcessingEnabled = true;
        pipeline.imageProcessing.toneMappingEnabled = true;
        pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
        pipeline.imageProcessing.ditheringEnabled = true;
        pipeline.fxaaEnabled = true;
        var atmosphere = new ADDONS.Atmosphere('atmo', scene, [light], { isDiffuseSkyIrradianceLutEnabled: !engine._badOS });
        // atmosphere.physicalProperties.rayleighScatteringScale = 0.6; // 効果がわかりにくい
        atmosphere.physicalProperties.rayleighScatteringScale = 2.0;
        // atmosphere.physicalProperties.rayleighScatteringScale = 3.0; // 地平線が黄色く / 日没後の赤やけ
        // atmosphere.physicalProperties.rayleighScatteringScale = 5.0; // 地平線付近がレインボーっぽく・夕焼けっぽく
        atmosphere.minimumMultiScatteringIntensity = 0.1;
        atmosphere.isLinearSpaceComposition = true;
        atmosphere.isLinearSpaceLight = true;
        // ミー散乱
        atmosphere.physicalProperties.mieScatteringScale = 10;
        // atmosphere.physicalProperties.mieScatteringScale = 100;
        // atmosphere.physicalProperties.mieScatteringScale = 200; // 霧におおわれた感じ
        // atmosphere.physicalProperties.mieScatteringScale = 1000; // 完全（９９％）に雲におおわれた
        // atmosphere.physicalProperties.mieScatteringScale = 10000; // 完全にくものなか？
    }


    let godrays = null;
    {
        // const fpathSUN = 'textures/sun.png';
        godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, camera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);
        godrays.mesh.material.diffuseTexture = new BABYLON.Texture(fpathSUN, scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
        godrays.mesh.material.diffuseTexture.hasAlpha = true;
        godrays.mesh.position = light.direction.scale(-1000000);
        let vscale = 10000;
        godrays.mesh.scaling = new BABYLON.Vector3(vscale, vscale, vscale);
    }

    // 柱状節理（６角柱）
    if (1) {
        let nb = new BABYLON.NoiseBlock();
        const nbvzero = new BABYLON.Vector3(0,0,0);
        let gridratio = 0.0001, nbscale = 0.00015, adjy = -0.26, yratio = 5000;
        let xscale = 0.0004, zscale=0.0003;
        function yposi(x,z) {
            return (nb.noise(8, 0.5, new BABYLON.Vector3(x,z,0), nbvzero, nbscale)+adjy)*yratio;
            // return (Math.sin(x*xscale)*Math.sin(z*zscale)+1)*yratio*0.3-1;
            // return Math.random()*yratio*0.8 ;
            // return yratio*0.8 ;
        }
        var nbBuildings = 200000, fact = 200000; // 生成する範囲
        var scaleX = 0.0;
        var scaleY = 0.0;
        var scaleZ = 0.0;
        var grey = 0.0;
        var uvSize = 0.0;
        var myPositionFunction = function(particle, i, s) {
            scaleX = Math.random() * 100 + 100;
            scaleZ = Math.random() * 100 + 100;
	    uvSize = Math.random() * 0.9;
            particle.scale.x = scaleX;
            particle.scale.z = scaleZ;
            particle.position.x = (Math.random() - 0.1) * fact;
            particle.position.z = (Math.random() - 0.5) * fact;
            let y = yposi(particle.position.x, particle.position.z);
            particle.position.y = y/2;
            particle.scale.y = y;
            particle.rotation.y = Math.random() * 3.5;
            grey = 1.0 - Math.random() * 0.5;
            particle.color = new BABYLON.Color4(grey + 0.1, grey + 0.1, grey, 1);
	    particle.uvs.x = Math.random() * 0.1;
	    particle.uvs.y = Math.random() * 0.1;
	    particle.uvs.z = particle.uvs.x + uvSize;
	    particle.uvs.w = particle.uvs.y + uvSize;
        };
        // Particle system creation : Immutable
        var SPS = new BABYLON.SolidParticleSystem('SPS', scene, {updatable: false});
        // var model = BABYLON.MeshBuilder.CreateBox("m", {}, scene);
        var model = BABYLON.MeshBuilder.CreateCylinder("cylinder", {tessellation:6});
        SPS.addShape(model, nbBuildings, {positionFunction: myPositionFunction});
        var mesh = SPS.buildMesh();
        if (1) {
            let groundMat = new BABYLON.PBRMaterial("ground", scene);
            groundMat.albedoColor = new BABYLON.Color3(0.18, 0.18, 0.18);
            groundMat.roughness = 1;
            groundMat.metallic = 0;
            mesh.material = groundMat;
        }
        if (0) {
            // const fpathGlassBuilding = "textures/glassbuilding.jpg";
            const fpathGlassBuilding = pathRoot + "124/textures/glassbuilding.jpg";
            var mat = new BABYLON.StandardMaterial("mat1", scene);
            var texture = new BABYLON.Texture(fpathGlassBuilding, scene);
            mat.diffuseTexture = texture;
            mesh.material = mat;
        }
        // dispose the model
        model.dispose();
    }

    // --------------------------------------------------
    let bAutoSlide = false
    let sunSlider = null;

    // Setup GUI controls.
    {
        const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

        const panelRoot = new BABYLON.GUI.StackPanel();
        panelRoot.adaptWidthToChildren = true;
        panelRoot.paddingBottomInPixels = 30;
        panelRoot.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panelRoot.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        adt.addControl(panelRoot);
        // GUI to control sun direction.
        {
            let panel11 = new BABYLON.GUI.StackPanel();
            panel11.width = "300px";
            panel11.height = "30px";
            panel11.isVertical = false;
            panel11.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            panel11.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            panelRoot.addControl(panel11);
            {
                var checkbox = new BABYLON.GUI.Checkbox();
                checkbox.width = "20px";
                checkbox.height = "20px";
                checkbox.isChecked = false;
                checkbox.color = "green";
                checkbox.onIsCheckedChangedObservable.add(function(value) {
                    bAutoSlide = value;
                });
                panel11.addControl(checkbox);    

                var txtlabel11 = new BABYLON.GUI.TextBlock();
                txtlabel11.text = " Auto slide";
                txtlabel11.width = "180px";
                txtlabel11.marginLeft = "10px";
                txtlabel11.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                txtlabel11.color = "white";
                panel11.addControl(txtlabel11); 
            }

            const header = new BABYLON.GUI.TextBlock();
            header.text = "Time of day";
            header.height = "30px";
            header.color = "white";
            panelRoot.addControl(header);

            sunSlider = new BABYLON.GUI.Slider();
            sunSlider.minimum = 0;
            sunSlider.maximum = 360;
            sunSlider.value = 240;
            sunSlider.height = "20px";
            sunSlider.width = "300px";
            sunSlider.background = "#AAAAAAAA";
            sunSlider.onValueChangedObservable.add(function (value) {
                const t = value / 360;
                header.text = "Time of Day: " + Math.round(t * 100) + "%";
                const angle = 2.0 * Math.PI * (t + 0.25);
                const directionXZPlane = new BABYLON.Vector3(Math.sin(angle), 0.0, Math.cos(angle));
                const planeNormal = new BABYLON.Vector3(1, 0.35, 0).normalizeToNew();
                const projectedOnPlane = directionXZPlane.add(BABYLON.Vector3.Up().scale(BABYLON.Vector3.Dot(directionXZPlane, planeNormal))).normalizeToNew();
                light.direction = projectedOnPlane; //.scale(-1);
                godrays.mesh.position = light.direction.scale(-1000000);
            });
            sunSlider.onValueChangedObservable.notifyObservers(sunSlider.value);
            panelRoot.addControl(sunSlider);
        }
    }

    scene.registerAfterRender(function() {
        if (bAutoSlide) {
            let vrate = sunSlider.value/sunSlider.maximum;
            if (vrate < 0.2 || vrate > 0.8) {
                ++sunSlider.value;
            } else {
                sunSlider.value += 0.1;
            }
            if (sunSlider.value >= sunSlider.maximum) {
                sunSlider.value = sunSlider.minimum;
            }
        }
    });

    // // 夕焼けの太陽位置
    // sunSlider.value = 0.75*sunSlider.maximum;

    return scene;
}

export var createScene = createScene_test_904;

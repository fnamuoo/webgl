// BabylonJS + cannon-es + raycastVehicle
// https://forum.babylonjs.com/t/babylonjs-cannon-es-raycastvehicle/33194/2
//   https://www.babylonjs-playground.com/#UGMIH#15

// let coursePath="textures/course/BoxySVG_test1_3_400x300.png"
let coursePath="../066/textures/BoxySVG_test1_3_400x300.png"

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);

    scene.enablePhysics(new BABYLON.Vector3(0,-30,0), new BABYLON.CannonJSPlugin());

    var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0.2), scene);
    light.groundColor = new BABYLON.Color3(.2, .2, .2);

    let camera=null, myMesh=null;
    let icamera=0, ncamera=4;
    var changeCamera = function(istage) {
        if (camera!=null) {camera.dispose();}
        if (icamera == 0) {
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(5, 20,-10), scene);
            if (myMesh!=null) {
                camera.setTarget(myMesh.position);
            }
            camera.attachControl(canvas, true);
            // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする、マウスで回転できなくなる
        }
        if (icamera == 1) {
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 0; // 180;
            camera.radius = 0.5;
            camera.heightOffset = 0.1;
            camera.cameraAcceleration = 0.2;
            camera.maxCameraSpeed = 30;
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (icamera == 2) {
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 0; // 180;
            camera.radius = 10;
            camera.heightOffset = 3;
            camera.cameraAcceleration = 0.05;
            camera.maxCameraSpeed = 30;
            camera.attachControl(canvas, true);
            camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        }
        if (icamera == 3) {
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
            camera.rotationOffset = 0; // 180;
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
    changeCamera(icamera);

    // 地面
    const grndW=1000, grndH=1000, grndW_=grndW/2, grndH_=grndH/2;
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
    groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    groundMesh.material.majorUnitFrequency = 100;
    groundMesh.material.minorUnitVisibility  = 0.2;
    // var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);
    groundMesh.physicsImpostor = new BABYLON.PhysicsImpostor(groundMesh, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0, restitution: 0.9 }, scene);

    // コース画像
    let crsW=400, crsH=300;
    const courseMesh = BABYLON.MeshBuilder.CreateGround("course", { width:crsW, height:crsH }, scene);
    courseMesh.position.y=0.01;
    courseMesh.material = new BABYLON.StandardMaterial("");
    courseMesh.material.diffuseTexture = new BABYLON.Texture(coursePath);
    courseMesh.material.diffuseTexture.hasAlpha = true;
    courseMesh.material.emissiveColor = new BABYLON.Color3.White();


    {
        //CAR
        var width = 2;
        var depth = 4;
        var height = 0.5;
        var wheelDiameter = 2;

        var wheelDepthPosition = (depth + wheelDiameter) / 2

        var axisWidth = width + wheelDiameter;

        var centerOfMassAdjust = new CANNON.Vec3(0, -wheelDiameter, 0);

        var chassis = BABYLON.MeshBuilder.CreateBox("chassis", {
            width: width,
            height: height,
            depth: depth
        }, scene);
        chassis.position.y = wheelDiameter + height / 2;
        chassis.physicsImpostor = new BABYLON.PhysicsImpostor(chassis, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10, restitution: 0.9 }, scene);
        var wheels = [0, 1, 2, 3].map(function(num) {
            var wheel = BABYLON.MeshBuilder.CreateSphere("wheel" + num, {
                segments: 4,
                diameter: wheelDiameter
            }, scene);
            var a = (num % 2) ? -1 : 1;
            var b = num < 2 ? 1 : -1;
            wheel.position.copyFromFloats(a * axisWidth / 2, wheelDiameter / 2, b * wheelDepthPosition)
            wheel.scaling.x = 0.4;
            wheel.physicsImpostor = new BABYLON.PhysicsImpostor(wheel, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 3, restitution: 0.9 }, scene);
            return wheel;
        });
        var vehicle = new CANNON.RigidVehicle({
            chassisBody: chassis.physicsImpostor.physicsBody
        });

        var down = new CANNON.Vec3(0, -1, 0);

        vehicle.addWheel({
            body: wheels[0].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(axisWidth / 2, 0, wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(1, 0, 0),
            direction: down
        });

        vehicle.addWheel({
            body: wheels[1].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(-axisWidth / 2, 0, wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(-1, 0, -0),
            direction: down
        });

        vehicle.addWheel({
            body: wheels[2].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(axisWidth / 2, 0, -wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(1, 0, 0),
            direction: down
        });

        vehicle.addWheel({
            body: wheels[3].physicsImpostor.physicsBody,
            position: new CANNON.Vec3(-axisWidth / 2, 0, -wheelDepthPosition).vadd(centerOfMassAdjust),
            axis: new CANNON.Vec3(-1, 0, 0),
            direction: down
        });

        for (var i = 0; i < vehicle.wheelBodies.length; i++) {
            vehicle.wheelBodies[i].angularDamping = 0.4;
        }

        var world = wheels[3].physicsImpostor.physicsBody.world
        for (var i = 0; i < vehicle.constraints.length; i++) {
            world.addConstraint(vehicle.constraints[i]);
        }

        var setSteeringValue = function(value, wheelIndex) {
            var axis = this.wheelAxes[wheelIndex];

            var c = Math.cos(value),
            s = Math.sin(value),
            x = axis.x,
            z = axis.z;
            this.constraints[wheelIndex].axisA.set(c*x-s*z, 0, s*x+c*z);
        };
        vehicle.setSteeringValue = setSteeringValue.bind(vehicle);

        world.addEventListener('preStep', vehicle._update.bind(vehicle));


        var maxSteerVal = Math.PI / 6;
        var maxForce = 200;
        let vehicle_forward = function(v) {
                vehicle.setWheelForce(v*-maxForce, 0);
                vehicle.setWheelForce(v*maxForce, 1);
        }
        let vehicle_back = function(v) {
                vehicle.setWheelForce(v*maxForce / 2, 0);
                vehicle.setWheelForce(v*-maxForce / 2, 1);
        }
        let vehicle_right = function(v) {
                vehicle.setSteeringValue(v*-maxSteerVal, 2);
                vehicle.setSteeringValue(v*-maxSteerVal, 3);
        }
        let vehicle_left = function(v) {
                vehicle.setSteeringValue(v*maxSteerVal, 2);
                vehicle.setSteeringValue(v*maxSteerVal, 3);
        }

        var map ={}; //object for multiple key presses
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        let cooltime_act = 0, cooltime_actIni = 30, vforceBase = 0.04, vforce = 0.04, bDash=3, jumpforce = 120;
        scene.registerAfterRender(function() {
            if (map["w"] || map["ArrowUp"]) {
                vehicle_forward(1);
            } else if (map["s"] || map["ArrowDown"]) {
                vehicle_back(1);
            } else {
                vehicle_forward(0);
            }
            if (map["a"] || map["ArrowLeft"]) {
                vehicle_left(1);
            } else if (map["d"] || map["ArrowRight"]) {
                vehicle_right(1);
            } else {
                vehicle_right(0);
            }
            if (cooltime_act > 0) {
                --cooltime_act;
            } else {
                if (map["c"]) {
                    icamera=(icamera+1)%ncamera;
                    changeCamera(icamera);
                }
                if (map["h"]) {
                    cooltime_act = cooltime_actIni;
                    changeUsageView();
                }
            }
        });
    }

    icamera=2;
    myMesh=chassis;
    changeCamera(icamera);

    return scene;
}

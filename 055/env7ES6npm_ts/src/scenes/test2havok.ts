import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { CreateSceneClass } from "../createScene";
import("@babylonjs/core/Physics/physicsEngineComponent")

import { havokModule } from "../externals/havok";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsShapeBox, PhysicsShapeSphere } from "@babylonjs/core/Physics/v2/physicsShape";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsMotionType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";

export class Test2 implements CreateSceneClass {
preTasks = [havokModule];
createScene = async (engine: AbstractEngine, canvas: HTMLCanvasElement): Promise<Scene> => {
    const scene = new Scene(engine);

    // 物理エンジンを有効にする
    const gravityVector = new Vector3(0, -9.81, 0);
    scene.enablePhysics(null, new HavokPlugin(true, await havokModule));

    var camera = new ArcRotateCamera("Camera", 0, 0, 0, new Vector3(0, 5, -10), scene);

    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light",
        new Vector3(0, 1, 0), scene);

    light.intensity = 0.7;

    // 地面を設定する
    const ground = MeshBuilder.CreateGround("ground",
        { width: 10, height: 10 }, scene);
    ground.material = new GridMaterial("groundMaterial", scene);

    // 地面に摩擦係数、反射係数を設定する
    var groundAggregate = new PhysicsAggregate(ground, 3 /* PhysicsShapeType.BOX */ , { mass: 0, restitution:0.75}, scene);

    const sphere = MeshBuilder.CreateSphere("sphere",
        { diameter: 2, segments: 32 }, scene);
    // ボールの表示位置を設定する
    sphere.position.y = 10;
    // ボールに摩擦係数、反射係数を設定する
    var sphereAggregate = new PhysicsAggregate(sphere, 0 /* PhysicsShapeType.SPHERE */ , { mass: 1, restitution:0.75}, scene);

    var box = MeshBuilder.CreateBox("box", {width:2, height:0.1, depth:2});
    box.position.set(0, 1.5, 0);
    var boxAggregate = new PhysicsAggregate(box, 3 /* PhysicsShapeType.BOX */ , { mass: 1, restitution:0.75}, scene);

    var blueMat = new StandardMaterial("blue", scene);
    blueMat.diffuseColor = new Color3(0.2, 0.2, 0.9);
    blueMat.alpha = 0.8;
    box.material = blueMat;


    var box2 = MeshBuilder.CreateBox("box", {width:2, height:0.1, depth:2});
    box2.position.set(2, 1.5, 0);
    var boxAggregate = new PhysicsAggregate(box2, 3 /* PhysicsShapeType.BOX */ , { mass: 1, restitution:0.75}, scene);

    var box2Mat = new StandardMaterial("green", scene);
    box2Mat.diffuseColor = new Color3(0.2, 0.9, 0.2);
    box2Mat.alpha = 0.8;
    box2.material = box2Mat;

    return scene;
};
}

export default new Test2();

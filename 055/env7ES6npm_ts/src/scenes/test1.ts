import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { CreateSceneClass } from "../createScene";
import '@babylonjs/core/Materials/standardMaterial';

export class Test1 implements CreateSceneClass {
    createScene = async (
        engine: AbstractEngine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);

        const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);

        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        const box = MeshBuilder.CreateBox("box", {}, scene);
        return scene;

    };
}

export default new Test1();

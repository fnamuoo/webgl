import type { Scene } from "@babylonjs/core/scene";

// Change this import to check other scenes
// import { DefaultSceneWithTexture } from "./scenes/defaultWithTexture";
// import { PhysicsSceneWithHavok } from "./scenes/physicsWithHavok";
// import { Test1 } from "./scenes/test1";
import { Test2 } from "./scenes/test2havok";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";

export interface CreateSceneClass {
    createScene: (engine: AbstractEngine, canvas: HTMLCanvasElement) => Promise<Scene>;
    preTasks?: Promise<unknown>[];
}

export interface CreateSceneModule {
    default: CreateSceneClass;
}

export const getSceneModule = (): CreateSceneClass => {
    // return new DefaultSceneWithTexture();
    // return new PhysicsSceneWithHavok();
    // return new Test1();
    return new Test2();
}

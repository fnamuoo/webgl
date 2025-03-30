import * as BABYLON from "babylonjs";
import { createScene } from "./test1.js";

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var scene = createScene(canvas,engine);

engine.runRenderLoop(() => {
    scene.render();
});

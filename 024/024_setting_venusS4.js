// mode:javascript

export var timeStep = 1 / 60;
export var Dem          = "";
export var texturefpath = "";
export var ampHigh = 1;
export var iniX = 0;
export var iniY = 0;
export var iniZ = 0;
export var iniRotY = 0
export var bWireframe = true;
bWireframe = false;

// ビーナス(s4)No17 .. road 確認
export const sizeX = 1412;
export const sizeZ = 1412;
export const lengthX = 8000;
export const lengthZ = sizeZ*lengthX/sizeX;
Dem          = "./venusS4z18/x_dem_out.bin";
texturefpath = './venusS4z18/x_texture_photo.jpg';
// S4上り開始 (落合大橋)
iniX = lengthX*332/1413; iniZ = lengthZ*1360/1413; iniRotY = Math.PI*(-0.1); iniY = 260; ampHigh = 5;
// // S4下り開始(...)
// iniX = lengthX*288/1413; iniZ = lengthZ*148/1413; iniRotY = Math.PI*(0.2); iniY = 10; ampHigh = 5;

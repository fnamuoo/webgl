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

// ビーナス(s1)No17 .. road 確認
export const sizeX = 956;
export const sizeZ = 956;
export const lengthX = 7640;
export const lengthZ = sizeZ*lengthX/sizeX;
Dem          = "./venusS1z17/x_dem_out.bin";
texturefpath = './venusS1z17/x_texture_photo.jpg'; // 写真
// S1上り開始 (大門峠)
iniX=lengthX*879/956; iniZ=lengthZ*155/956; iniRotY = 0.70; iniY=-180; ampHigh = 5;
// iniX=lengthX*878/956; iniZ=lengthZ*156/956; iniRotY = Math.PI*(0.30); iniY=-360; ampHigh = 10;
// // // // S1下り開始 (霧ヶ峰峠)
// iniX=lengthX*115/956; iniZ=lengthZ*345/956; iniY=-120; // ampp=5
// const iniRotY = Math.PI*(0.90);


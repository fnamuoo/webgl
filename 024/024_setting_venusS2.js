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

// ビーナス(s2)No17 .. road 確認
export const sizeX = 956;
export const sizeZ = 956;
export const lengthX = 7640;
export const lengthZ = sizeZ*lengthX/sizeX;
Dem          = "./venusS2z17/x_dem_out.bin";
texturefpath = './venusS2z17/x_texture_photo.jpg';
// S2上り開始 (霧ヶ峰峠)
//const iniX = lengthX*0.11; const iniZ = lengthZ*0.36; iniY = -195;
// iniX = lengthX*230/956; iniZ = lengthZ*510/956; iniRotY = Math.PI*(-0.4); iniY = -100; ampHigh = 1;
iniX = lengthX*346/956; iniZ = lengthZ*806/956; iniRotY = Math.PI*(0); iniY = -120; ampHigh = 5;
// S2下り開始 (和田峠)
// iniX = lengthX*51/956; iniZ = lengthZ*83/956; iniRotY = Math.PI*(0.4); iniY = -150; ampHigh = 5;


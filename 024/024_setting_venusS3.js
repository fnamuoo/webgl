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

// ビーナス(s3)No17 .. road 確認
export const sizeX = 1422;
export const sizeZ = 1422;
export const lengthX = 8000; // 11368;
export const lengthZ = sizeZ*lengthX/sizeX;
Dem          = "./venusS3z17/x_dem_out.bin";
texturefpath = './venusS3z17/x_texture_photo.jpg';

// S3上り開始 (和田峠～落合大橋)
iniX = lengthX*301/1422; iniZ = lengthZ*1298/1422; iniRotY = Math.PI*(-0.6); iniY = -150; ampHigh = 5;
// // 下り ()
// iniX = lengthX*243/1422; iniZ = lengthZ*215/1422; iniRotY = Math.PI*(0.5); iniY = -128; ampHigh = 5;


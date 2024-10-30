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

// MFゴースト、熱海ゴースト z18
export const sizeX = 956;
export const sizeZ = 956;
export const lengthX = 7640;
export const lengthZ = sizeZ*lengthX/sizeX;
Dem          = "./mfg_Z18_5atami/x_dem_out.bin";
texturefpath = './mfg_Z18_5atami/x_texture_photo.jpg';
iniX = lengthX*904/956; iniZ = lengthZ*501/956; iniRotY = Math.PI*(0.3); iniY = -320; ampHigh = 3;
//iniX = lengthX*793/956; iniZ = lengthZ*584/956; iniY = -100; iniRotY = Math.PI*(-0.5);
//iniX = lengthX*528/956; iniZ = lengthZ*619/956; iniY = -100; iniRotY = Math.PI*(-0.5);



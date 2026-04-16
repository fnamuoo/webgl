// Babylon.js：鉄道模型のレイアウト作成にチャレンジ

//  - c/v or space/enter .. カメラ変更
//  - [1-8]              .. カメラ変更(8カメラ時)
//  - (n/b)              .. ステージ変更
//  - (x/z)              .. ターゲット(追跡する列車)変更
//  - h                  .. 使い方表示 ON/OFF

const cloudType = 0; // stage2(山間部）の雲：頂上付近
// const cloudType = 1; // stage2(山間部）の雲：中間層

const R0 = 0;
const R30 = Math.PI/6;
const R45 = Math.PI/4;
const R60 = Math.PI/3;
const R90 = Math.PI/2;
const R180 = Math.PI;
const R270 = Math.PI*3/2;
const R360 = Math.PI*2;

// --------------------------------------------------

// const skyboxTextPath2 = "textures/skybox2";
// const skyboxTextPath5 = "textures/TropicalSunnyDay";
// const dbase2 = "textures/course3/"
// const fpathGlassBuilding = "textures/glassbuilding.jpg";
// const fpathFloorRail ="textures/floor_rail.png";
// const fpathGrass ="textures/grass.jpg";
// const fpathSand = "textures/sand.jpg";
// const fpathWaterBump = "textures/waterbump.png";
// const fpathCloud = "textures/cloud.png";
// const fpathDistortion2 = "textures/distortion_2.png";
// const fpathTrainRBoxBlue00 = "textures/train_rbox_blue_00.png";
// const fpathTrainRBoxBlue01 = "textures/train_rbox_blue_01.png";
// const fpathTrainRBoxBlue10 = "textures/train_rbox_blue_10.png";
// const fpathTrainRBoxBlue11 = "textures/train_rbox_blue_11.png";
// const fpathTrainRBoxGreen00 = "textures/train_rbox_green_00.png";
// const fpathTrainRBoxGreen01 = "textures/train_rbox_green_01.png";
// const fpathTrainRBoxGreen10 = "textures/train_rbox_green_10.png";
// const fpathTrainRBoxGreen11 = "textures/train_rbox_green_11.png";
// const fpathTrainRBoxRed00 = "textures/train_rbox_red_00.png";
// const fpathTrainRBoxRed01 = "textures/train_rbox_red_01.png";
// const fpathTrainRBoxRed10 = "textures/train_rbox_red_10.png";
// const fpathTrainRBoxRed11 = "textures/train_rbox_red_11.png";
// const fpathTrainRBoxYellow00 = "textures/train_rbox_yellow_00.png";
// const fpathTrainRBoxYellow01 = "textures/train_rbox_yellow_01.png";
// const fpathTrainRBoxYellow10 = "textures/train_rbox_yellow_10.png";
// const fpathTrainRBoxYellow11 = "textures/train_rbox_yellow_11.png";
// const fpathTrainRoolA1 ="textures/train_rollA_1.png";
// const fpathTrainRoolA2 ="textures/train_rollA_2.png";
// const fpathTrainRoolB1 ="textures/train_rollB_1.png";
// const fpathTrainRoolB2 ="textures/train_rollB_2.png";
// const fpathBoxDD51 ="textures/box_DD51.png";
// const fpathBoxDD51Top ="textures/box_DD51_top.png";
// const fpathBoxFreight2 ="textures/box_freight_2.png";

// --------------------------------------------------
// for local
const pathRoot = "../";
// for playground
// const pathRoot = "https://raw.githubusercontent.com/fnamuoo/webgl/main/";

const skyboxTextPath2 = pathRoot + "111/textures/skybox2";
const skyboxTextPath5 = pathRoot + "111/textures/TropicalSunnyDay";
const dbase2 = pathRoot + "136/course4/"
const fpathGlassBuilding = pathRoot + "124/textures/glassbuilding.jpg";
const fpathFloorRail =pathRoot + "136/textures/floor_rail.png";
const fpathGrass =pathRoot + "065/textures/grass.jpg";
const fpathSand = pathRoot + "086/textures/sand.jpg";
const fpathWaterBump = pathRoot + "068/textures/waterbump.png";
const fpathCloud = pathRoot + "088/textures/cloud.png";
const fpathDistortion2 = pathRoot + "136/textures/distortion_2.png";
const fpathTrainRBoxBlue00 = pathRoot + "136/textures/train_rbox_blue_00.png";
const fpathTrainRBoxBlue01 = pathRoot + "136/textures/train_rbox_blue_01.png";
const fpathTrainRBoxBlue10 = pathRoot + "136/textures/train_rbox_blue_10.png";
const fpathTrainRBoxBlue11 = pathRoot + "136/textures/train_rbox_blue_11.png";
const fpathTrainRBoxGreen00 = pathRoot + "136/textures/train_rbox_green_00.png";
const fpathTrainRBoxGreen01 = pathRoot + "136/textures/train_rbox_green_01.png";
const fpathTrainRBoxGreen10 = pathRoot + "136/textures/train_rbox_green_10.png";
const fpathTrainRBoxGreen11 = pathRoot + "136/textures/train_rbox_green_11.png";
const fpathTrainRBoxRed00 = pathRoot + "136/textures/train_rbox_red_00.png";
const fpathTrainRBoxRed01 = pathRoot + "136/textures/train_rbox_red_01.png";
const fpathTrainRBoxRed10 = pathRoot + "136/textures/train_rbox_red_10.png";
const fpathTrainRBoxRed11 = pathRoot + "136/textures/train_rbox_red_11.png";
const fpathTrainRBoxYellow00 = pathRoot + "136/textures/train_rbox_yellow_00.png";
const fpathTrainRBoxYellow01 = pathRoot + "136/textures/train_rbox_yellow_01.png";
const fpathTrainRBoxYellow10 = pathRoot + "136/textures/train_rbox_yellow_10.png";
const fpathTrainRBoxYellow11 = pathRoot + "136/textures/train_rbox_yellow_11.png";
const fpathTrainRoolA1 =pathRoot + "136/textures/train_rollA_1.png";
const fpathTrainRoolA2 =pathRoot + "136/textures/train_rollA_2.png";
const fpathTrainRoolB1 =pathRoot + "136/textures/train_rollB_1.png";
const fpathTrainRoolB2 =pathRoot + "136/textures/train_rollB_2.png";
const fpathBoxDD51 =pathRoot + "136/textures/box_DD51.png";
const fpathBoxDD51Top =pathRoot + "136/textures/box_DD51_top.png";
const fpathBoxFreight2 =pathRoot + "136/textures/box_freight_2.png";


// ######################################################################

const _metaStageInfo = {
    // ------------------------------
    // ------------------------------

    997118:{
        // 太極図／１レーン
        tubeType:"custom",
        metaInfo:[
            {shape:"s", size:50, div:4},
            {shape:"s", size:50, div:4},
            {shape:"s", size:100, div:8},
            {shape:"s", size:100, div:8},
            {shape:"s", size:100, div:8},
            {shape:"r", rot:R90, size:100, div:24},
            {shape:"s", size:100, div:8},
            {shape:"s", size:100, div:8},
            {shape:"r", rot:R90, size:100, div:24},
            {shape:"s", size:100, div:8},
            {shape:"s", size:100, div:8},
            {shape:"s", size:100, div:8},
            {shape:"s", size:100, div:8},
            {shape:"r", rot:R90, size:100, div:24},
            {shape:"s", size:100, div:8},
            {shape:"s", size:98, div:12},
            {shape:"r", rot:R90, size:100, div:24},
            {shape:"s", size:100, div:8},
            {shape:"r", rot:R90, size:50, div:12},
            {shape:"l", rot:R90, size:50, div:12},
            {shape:"s", size:50, div:4},
            {shape:"r", rot:R90, size:50, div:12},
            {shape:"r", rot:R90, size:50, div:12},
            {shape:"s", size:100, div:8},
            {shape:"l", rot:R90, size:50, div:12},
            {shape:"l", rot:R90, size:50, div:12},
            {shape:"r", rot:R90, size:50, div:12},
            {shape:"l", rot:R90, size:46, div:12},
            {shape:"s", size:100, div:8},
            {shape:"s", size:52, div:4},
            {shape:"l", rot:R90, size:98, div:24},
            {shape:"s", size:100, div:8},
            {shape:"s", size:100, div:8},
            {shape:"l", rot:R90, size:98, div:24},
            {shape:"s", size:100, div:8},
            {shape:"s", size:80, div:8},
            {shape:"ssin", h:2, size:100, div:8},
            {shape:"r", h:0, rot:R45, size:10, div:4},
            {shape:"l", rot:R45, size:10, div:4},
            {shape:"ssin", h:-2, size:100, div:8},
            {shape:"r", h:0, rot:R90, size:10, div:8},
            {shape:"l", h:0, rot:R90, size:10, div:8},
            {shape:"l", h:0, rot:R90, size:10, div:8},
            {shape:"l", h:0, rot:R90, size:13.9, div:8},
            {shape:"s", size:15, div:4},
        ],
    },

    // ------------------------------

    997220:{
        // １レーン、ループ橋で山登り
        tubeType:"custom",
        metaInfo:[
            {shape:"s", size:10, div:4},
            {shape:"s", h:0, size:10, div:4},
            {shape:"s", h:1, size:10, div:4},
            {shape:"r", h:3, rot:R270, size:10, div:12},
            {shape:"s", h:1, size:8, div:4},
            {shape:"l", rot:R90, size:10, div:4},
            {shape:"s", h:1, size:10, div:4},
            {shape:"s", h:1, size:10, div:4},
            {shape:"s", h:1, size:10, div:4},
            {shape:"r", h:2, rot:R180, size:10, div:8},
            {shape:"r", h:1, rot:R90, size:8, div:4},
            {shape:"l", h:1, rot:R90, size:8, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"r", h:2, rot:R180, size:8, div:8},
            {shape:"r", h:1, rot:R90, size:8, div:4},
            {shape:"s", size:8, div:4},
            {shape:"s", size:8, div:4},
            {shape:"l", rot:R90, size:10, div:4},
            {shape:"s", size:8, div:4},
            {shape:"r", rot:R90, size:10, div:4},
            {shape:"s", size:8, div:4},
            {shape:"s", size:8, div:4},
            {shape:"s", size:8, div:4},
            {shape:"l", rot:R90, size:10, div:4},
            {shape:"l", rot:R90, size:10, div:4},
            {shape:"s", size:8, div:4},
            {shape:"l", rot:R90, size:10, div:4},
            {shape:"s", size:8, div:4},
            {shape:"s", size:8, div:4},
            {shape:"s", size:8, div:4},
            {shape:"s", h:0, size:8, div:4},
            {shape:"s", h:0, size:8, div:4},
            {shape:"s", h:-1, size:8, div:4},
            {shape:"s", size:8, div:4},
            {shape:"s", size:8, div:4},
            {shape:"s", size:8, div:4},
            {shape:"l", rot:R90, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"r", rot:R90, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", h:-2, rot:R90, size:20, div:8},
            {shape:"l", h:-2, rot:R90, size:20, div:8},
            {shape:"s", h:-1, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"r", rot:R60, size:10, div:4},
            {shape:"l", rot:R60, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", h:-4, rot:R90, size:40, div:16},
            {shape:"s", h:-1, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"r", h:-1, rot:R60, size:10, div:6},
            {shape:"s", h:0, size:10, div:8},
            {shape:"l", rot:R60, size:10, div:6},
            {shape:"s", size:13.7, div:4},
            {shape:"l", rot:R90, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:4, div:4},
        ],
    },

    // ------------------------------
    997411:{
        // ３ホームと４レーン (特急：内回り)
        tubeType:"custom",
        metaInfo:[
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R90, size:20, div:8},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R90, size:40, div:16},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R45, size:40, div:8},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:5.6, div:4},
            {shape:"l", rot:R45, size:40, div:8},
            {shape:"l", rot:R90, size:50, div:16},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
        ]
    },

    997412:{
        // ３ホームと４レーン (特急：外回り)
        tubeType:"custom",
        metaInfo:[
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R90, size:22, div:8},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R90, size:42, div:16},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R45, size:42, div:8},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:5.6, div:4},
            {shape:"l", rot:R45, size:42, div:8},
            {shape:"l", rot:R90, size:52, div:16},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
        ]
    },

    997413:{
        // ３ホームと４レーン (普通：内回り)
        tubeType:"custom",
        metaInfo:[
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R30, size:5, div:4},
            {shape:"r", rot:R30, size:5, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:8, div:4},
            {shape:"r", rot:R30, size:5, div:4},
            {shape:"l", rot:R30, size:5, div:4},
            {shape:"s", size:12, div:4},
            {shape:"l", rot:R90, size:18, div:8},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R30, size:5, div:4},
            {shape:"r", rot:R30, size:5, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:8, div:4},
            {shape:"r", rot:R30, size:5, div:4},
            {shape:"l", rot:R30, size:5, div:4},
            {shape:"ssin", h:10, size:30, div:12},
            {shape:"l", h:0, rot:R90, size:30, div:16},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R90, size:10, div:4},
            {shape:"r", rot:R90, size:10, div:4},
            {shape:"l", rot:R45, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R30, size:5, div:4},
            {shape:"r", rot:R30, size:5, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:8, div:4},
            {shape:"r", rot:R30, size:5, div:4},
            {shape:"l", rot:R30, size:5, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"r", rot:R90, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R90, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R45, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R45, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10.2, div:4},
            {shape:"l", rot:R45, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"ssin", h:-10, size:30, div:12},
            {shape:"s", h:0, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:5, div:4},

        ],
    },

    997414:{
        // ３ホームと４レーン (普通：外回り)
        tubeType:"custom",
        metaInfo:[
            {shape:"s", size:10, div:4},
            {shape:"r", rot:R30, size:5, div:4},
            {shape:"l", rot:R30, size:5, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:8, div:4},
            {shape:"l", rot:R30, size:5, div:4},
            {shape:"r", rot:R30, size:5, div:4},
            {shape:"s", size:12, div:4},
            {shape:"l", rot:R90, size:24, div:8},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"r", rot:R30, size:5, div:4},
            {shape:"l", rot:R30, size:5, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:8, div:4},
            {shape:"l", rot:R30, size:5, div:4},
            {shape:"r", rot:R30, size:5, div:4},
            {shape:"ssin", h:10, size:30, div:12},
            {shape:"l", h:0, rot:R90, size:32, div:16},
            {shape:"s", size:14, div:4},
            {shape:"l", rot:R90, size:12, div:4},
            {shape:"r", rot:R90, size:8, div:4},
            {shape:"l", rot:R45, size:12, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:8, div:4},
            {shape:"r", rot:R90, size:8, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R90, size:12, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"l", rot:R45, size:12, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:9.7, div:4},
            {shape:"l", rot:R45, size:12, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:7.1, div:4},
            {shape:"l", rot:R45, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"ssin", h:-10, size:30, div:12},
            {shape:"s", h:0, size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:10, div:4},
            {shape:"s", size:2, div:4},
        ],
    },

    // ----------------------------------------

};


// ----------------------------------------
let createCourseData = function(geo) {
    geo.data = []; // xzy座標
    geo.mZRot = {}; // z回転、ロール
    geo.xzLbl = []; // ラベル表示
    if (geo.tubeType == 'custom') {
        // rand　でつくったような形状をカスタマイズ作成できるように
        // ブロック単位の形状
        // 初期値をデフォルトとして用いる
        let meta0 = geo.metaInfo[0];
        let [x,y,z] = typeof(meta0.xyz) !== 'undefined' ? meta0.xyz : [0,0,0]; //位置
        let dir = typeof(meta0.dir) !== 'undefined' ? meta0.dir : R270; //方向(xz平面／y回転)
        let rot = typeof(meta0.rot) !== 'undefined' ? meta0.rot : R90; //L/R時の回転角
        let div = typeof(meta0.div) !== 'undefined' ? meta0.div : 4; //分割数
        let size = typeof(meta0.size) !== 'undefined' ? meta0.size : 50; // ブロック長
        let size2, size0, sizee, sizestep;
        let h = typeof(meta0.h) !== 'undefined' ? meta0.h : 0; // 高さ
        let vrot = typeof(meta0.vrot) !== 'undefined' ? meta0.vrot : R360; // 縦ロールの回転角
        let hshift = typeof(meta0.hshift) !== 'undefined' ? meta0.hshift : 10;//縦ロールの水平移動
        let shape = typeof(meta0.shape) !== 'undefined' ? meta0.shape : "st"; //形状
        let nloop = typeof(meta0.nloop) !== 'undefined' ? meta0.nloop : 1; //ループ回数
        let zrot = typeof(meta0.zrot) !== 'undefined' ? meta0.zrot : 0; // Y軸回転、ロールの回転角
        let x0,y0,z0 , xe,ye,ze, xstep,ystep,zstep, dir0,dirg,dire,dirstep, xg,yg,zg, yrad, yradstep, cmnt;
        let ii = 0;
        for (let meta of geo.metaInfo) {
            h = typeof(meta.h) !== 'undefined' ? meta.h : h; // 高さ
            rot = typeof(meta.rot) !== 'undefined' ? meta.rot : rot; //L/R時の回転角
            div = typeof(meta.div) !== 'undefined' ? meta.div : div; //分割数
            shape = typeof(meta.shape) !== 'undefined' ? meta.shape : shape; //形状
            nloop = typeof(meta.nloop) !== 'undefined' ? meta.nloop : nloop; //ループ回数
            size = typeof(meta.size) !== 'undefined' ? meta.size : size; // ブロック長
            size2 = typeof(meta.size2) !== 'undefined' ? meta.size2 : size; // ブロック長
            vrot = typeof(meta.vrot) !== 'undefined' ? meta.vrot : vrot;
            hshift = typeof(meta.hshift) !== 'undefined' ? meta.hshift : hshift;
            cmnt = typeof(meta.cmnt) !== 'undefined' ? meta.cmnt : ""; // コメント
            zrot = typeof(meta.zrot) !== 'undefined' ? meta.zrot : zrot; // Y軸回転、ロールの回転角
            dirstep = rot/div;
            yradstep = R180/div;
            sizestep = (size2-size)/div;
            if (cmnt != "") {
                geo.xzLbl[ii] = cmnt;
            }
            if (shape == "S" || shape == "s" || shape == "straight") {
                //直進
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    x0 = x; y0 = y; z0 = z; dir0 = dir;
                    xe = x+size*Math.cos(dir);
                    ye = y+h;
                    ze = z+size*Math.sin(dir);
                    dire = dir;
                    xstep=(xe-x0)/div; zstep=(ze-z0)/div; ystep=(ye-y0)/div;
                    for (let i=0; i < div; ++i, ++ii){
                        x = x0 + xstep*i;
                        y = y0 + ystep*i;
                        z = z0 + zstep*i;
                        geo.data.push([x, z, y]);
                        if (zrot != null) {
                            geo.mZRot[ii] = zrot;
                        }
                    }
                    x = xe; y = ye; z = ze; dir=dire;
                    if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                }
            } else if (shape == "L" || shape == "l" || shape == "left") {
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    x0=x; y0=y; z0=z; dir0=dir;
                    dirg=dir-R90; dire=dir0-rot;
                    xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                    xe=xg+size*Math.cos(dir0-rot+R90); ze=zg+size*Math.sin(dir0-rot+R90); ye=y+h;
                    ystep = (ye-y0)/div;
                    for (let i=0; i < div; ++i, ++ii){
                        dir=dir0-dirstep*i+R90;
                        x=xg+size*Math.cos(dir);
                        y=y0+ystep*i;
                        z=zg+size*Math.sin(dir);
                        geo.data.push([x, z, y]);
                        if (zrot != null) {
                            geo.mZRot[ii] = zrot;
                        }
                    }
                    x = xe; y = ye; z = ze; dir=dire;
                    if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                }
            } else if (shape == "R" || shape == "r" || shape == "right") {
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    x0=x; y0=y; z0=z; dir0=dir;
                    dirg=dir+R90; dire=dir0+rot;
                    xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                    xe=xg+size*Math.cos(dir0+rot-R90); ze=zg+size*Math.sin(dir0+rot-R90); ye=y+h;
                    ystep = (ye-y0)/div;
                    for (let i=0; i < div; ++i, ++ii){
                        dir=dir0+dirstep*i-R90;
                        x=xg+size*Math.cos(dir);
                        y=y0+ystep*i;
                        z=zg+size*Math.sin(dir);
                        geo.data.push([x, z, y]);
                        if (zrot != null) {
                            geo.mZRot[ii] = zrot;
                        }
                    }
                    x = xe; y = ye; z = ze; dir=dire;
                    if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                }
                // ----------------------------------------------------------------------
                // 高さを sin で変化
            } else if (shape == "Ssin" || shape == "ssin" || shape == "slope") {
                //直進 (なめらかな傾斜
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    x0 = x; y0 = y; z0 = z; dir0 = dir;
                    xe = x+size*Math.cos(dir);
                    ye = y+h;
                    ze = z+size*Math.sin(dir);
                    dire = dir;
                    xstep=(xe-x0)/div; zstep=(ze-z0)/div; ystep=(ye-y0)/div;
                    yrad = -R90;
                    for (let i=0; i < div; ++i, ++ii){
                        x = x0 + xstep*i;
                        y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                        z = z0 + zstep*i;
                        geo.data.push([x, z, y]);
                        if (zrot != null) {
                            geo.mZRot[ii] = zrot;
                        }
                    }
                    x = xe; y = ye; z = ze; dir=dire;
                    if (dir<0) { dir+=R360; }
                    if (dir>=R360) { dir-=R360; }
                }
            } else if (shape == "Lsin" || shape == "lsin" || shape == "leftsin") {
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    x0=x; y0=y; z0=z; dir0=dir;
                    dirg=dir-R90; dire=dir0-rot;
                    xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                    xe=xg+size*Math.cos(dir0-rot+R90); ze=zg+size*Math.sin(dir0-rot+R90); ye=y+h;
                    yrad = -R90;
                    for (let i=0; i < div; ++i, ++ii){
                        dir=dir0-dirstep*i+R90;
                        x=xg+size*Math.cos(dir);
                        y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                        z=zg+size*Math.sin(dir);
                        geo.data.push([x, z, y]);
                        if (zrot != null) {
                            geo.mZRot[ii] = zrot;
                        }
                    }
                    x = xe; y = ye; z = ze; dir=dire;
                    if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                }
            } else if (shape == "Rsin" || shape == "rsin" || shape == "rightsin") {
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    x0=x; y0=y; z0=z; dir0=dir;
                    dirg=dir+R90; dire=dir0+rot;
                    xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                    xe=xg+size*Math.cos(dir0+rot-R90); ze=zg+size*Math.sin(dir0+rot-R90); ye=y+h;
                    yrad = -R90;
                    for (let i=0; i < div; ++i, ++ii){
                        dir=dir0+dirstep*i-R90;
                        x=xg+size*Math.cos(dir);
                        y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                        z=zg+size*Math.sin(dir);
                        geo.data.push([x, z, y]);
                        if (zrot != null) {
                            geo.mZRot[ii] = zrot;
                        }
                    }
                    x = xe; y = ye; z = ze; dir=dire;
                    if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                }
                // ----------------------------------------------------------------------
                // 半径を均一で変化
            } else if (shape == "LsinDR" || shape == "lsindr") {
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    x0=x; y0=y; z0=z; dir0=dir; size0=size;
                    sizee=size2;
                    dirg=dir-R90; dire=dir0-rot;
                    xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                    xe=xg+sizee*Math.cos(dir0-rot+R90); ze=zg+sizee*Math.sin(dir0-rot+R90); ye=y+h;
                    yrad = -R90;
                    for (let i=0; i < div; ++i, ++ii){
                        dir=dir0-dirstep*i+R90;
                        size=size0+sizestep*i;
                        x=xg+size*Math.cos(dir);
                        y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                        z=zg+size*Math.sin(dir);
                        geo.data.push([x, z, y]);
                        if (zrot != null) {
                            geo.mZRot[ii] = zrot;
                        }
                    }
                    x = xe; y = ye; z = ze; dir=dire; size=sizee;
                    if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                }
            } else if (shape == "RsinDR" || shape == "rsindr") {
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    x0=x; y0=y; z0=z; dir0=dir; size0=size;
                    sizee=size2;
                    dirg=dir+R90; dire=dir0+rot;
                    xg=x0+size*Math.cos(dirg); zg=z0+size*Math.sin(dirg);
                    xe=xg+sizee*Math.cos(dir0+rot-R90); ze=zg+sizee*Math.sin(dir0+rot-R90); ye=y+h;
                    yrad = -R90;
                    for (let i=0; i < div; ++i, ++ii){
                        dir=dir0+dirstep*i-R90;
                        size=size0+sizestep*i;
                        x=xg+size*Math.cos(dir);
                        y = y0 + h*((Math.sin(yrad)+1)/2); yrad += yradstep;
                        z=zg+size*Math.sin(dir);
                        geo.data.push([x, z, y]);
                        if (zrot != null) {
                            geo.mZRot[ii] = zrot;
                        }
                    }
                    x = xe; y = ye; z = ze; dir=dire; size=sizee;
                    if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                }
                // ----------------------------------------------------------------------
                // 縦ループ
            } else if (shape == "VLoop" || shape == "vloop") {
                let vrotstep=vrot/div;
                let dirV0=-R90, dirVe=dirV0+vrot, dirV;
                let dirR=dir-R90;
                hshift=-hshift;
                let hshifte=hshift, hshiftstep=hshift/div;
                let xroll, yroll, zroll;
                for (let iloop = 0; iloop < nloop; ++iloop) {
                    x0=x; y0=y; z0=z; dir0=dir; size0=size;
                    sizee=size2;
                    xg=x0; yg=y0+size; zg=z0;
                    xroll = 0;
                    yroll = sizee*Math.sin(dirVe);
                    zroll = sizee*Math.cos(dirVe);
                    xe = xg+zroll*Math.sin(dir)+hshifte*Math.cos(dirR);
                    ye = yg+yroll;
                    ze = zg+zroll*Math.cos(dir)+hshifte*Math.sin(dirR);
                    yrad = -R90;
                    for (let i=0; i < div; ++i, ++ii){
                        dirV=dirV0+vrotstep*i;
                        size=size0+sizestep*i;
                        xroll = 0;
                        yroll = size*Math.sin(dirV);
                        zroll = size*Math.cos(dirV);
                        hshift = hshifte*((Math.sin(yrad)+1)/2); yrad += yradstep;
                        x=xg+zroll*Math.cos(dir)+hshift*Math.cos(dirR);
                        y=yg+yroll;
                        z=zg+zroll*Math.sin(dir)+hshift*Math.sin(dirR);
                        geo.data.push([x, z, y]);
                        if (zrot != null) {
                            geo.mZRot[ii] = zrot;
                        }
                    }
                    x = xe; y = ye; z = ze; dir=dire; size=sizee;
                    if (Math.round(vrot-Math.round(vrot/R180)*R180)==0) {
                        dir = dir+vrot;
                    }
                    if (dir<0) { dir+=R360; } else if (dir>=R360) { dir-=R360; }
                }
            }
        }
        if (geo.isLoopCourse == false) {
            geo.data.push([x, z, y]);
        }
    }
    return geo;
}


// ######################################################################

const skyboxTextPathList = [skyboxTextPath2,skyboxTextPath5];

let istage=0, skyboxType=0;
const istage2skybox = {
    0:0,
    1:1,
    2:1,
}

const courseInfoList = [
    [[7521, 7522, 7523, 7524, ], "都市部", dbase2+""],
    [[7120, 7121, ], "湖"      , dbase2+""],
    [[7221, ], "山間部" , dbase2+""],
];

let nstage = courseInfoList.length;

export var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#020207'))

    let icamera = 0, ncamera = 11;
//    icamera = -1;
    let camera = null, myMesh=null;
    let myMeshCandiList = []; // myMesh候補
    let imyMeshCandi = 0;
    let cameralist = [];
    let cameralistView = []; //  icamera=10時の配置用
    let icamera10 = 0;
    var resetCameraView = function(camera) {
        while (scene.activeCameras.length > 0) {
            scene.activeCameras.pop();
        }
        scene.activeCameras.push(camera);
        for (let camera_ of cameralist) {
            camera_.dispose();
        }
        camera.viewport = new BABYLON.Viewport(0.0, 0.0, 1.0, 1.0);
    }
    let crCamera0 = function() {
        // フローカメラを使ったバードビュー／追跡（遅いドローン）
        let _camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        // _camera.rotationOffset = 180;
        _camera.rotationOffset = 0;
        _camera.radius = 5;
        _camera.heightOffset = 2;
        _camera.cameraAcceleration = 0.002;
        _camera.maxCameraSpeed = 30;
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera1 = function() {
        // ドライバーズビュー：対象(myMesh)との距離を一定に保つ（旋回する／短距離をすすむ） .. 速度非依存
        //   lockedTarget に myMesh (position) をセット、カメラ位置をmyMesh.positionよりやや後方に配置、myMeshが透けることでドライバーズビューっぽく
        //   厳密に前方にカメラを置くなら、視点(lockedTarget)用のメッシュを前方に配置する必要あり。ひと手間かかるので、現状で
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        if (myMesh != null && typeof(myMesh._meshCamTrg) !== 'undefined') {
            _camera.lockedTarget = myMesh._meshCamTrg;
        }
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera2 = function() {
        // バードビュー：対象(myMesh)との距離を一定に保つ（旋回する／短距離をすすむ） .. 速度非依存
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        // _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }
    let crCamera3 = function() {
        // 先行して前方、ちょい下から前面を煽り見る
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 4, -10), scene);
        _camera.attachControl(canvas, true);
        return _camera;
    }
    let crCamera5 = function() {
        // 上空から見下ろすトップビュー
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100,-0.01), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        return _camera;
    }
    let crCamera6 = function() {
        // ターゲットと並走
        let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 10, 10), scene);
        _camera.setTarget(BABYLON.Vector3.Zero());
        _camera.attachControl(canvas, true);
        _camera.useAutoRotationBehavior = true; // 自動でゆっくり回転
        return _camera;
    }
    let crCamera7 = function() {
        // ターゲットを周回
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 20, -10), scene);
        if (myMesh != null) {
            _camera.lockedTarget = myMesh;
        }
        _camera.attachControl(canvas, true);
        _camera._irad = 0;
        _camera._iradStep = 0.005;
        _camera._r = 15;
        _camera._h = 2;
        return _camera;
    }
    let crCamera8 = function() {
        // 定点カメラ / render でカメラ位置を再計算
        let _camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 20, -10), scene);
        _camera.attachControl(canvas, true);
        _camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
        return _camera;
    }

    var changeCamera = function(icamera) {
        if (camera!=null) {camera.dispose();}
        if (icamera == -1) {
            // マウス操作で回転したり、ズーム操作
            camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 100,-0.01), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            resetCameraView(camera);
        }

        if (icamera == 0) {
            camera = crCamera0();
            // 4分割cameraからの復帰用にリセット
            resetCameraView(camera)
        }
        if (icamera == 1) {
            camera = crCamera1();
        }
        if (icamera == 2) {
            camera = crCamera2();
        }
        if (icamera == 3) {
            camera = crCamera3();
            // 4分割cameraからの復帰用にリセット
            resetCameraView(camera)
        }

        if (icamera == 4) {
            // 4分割(icamera=0-3) / 上記４カメラを１画面で
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralist.push(crCamera0())
            cameralist.push(crCamera1())
            cameralist.push(crCamera2())
            cameralist.push(crCamera3())
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
            }
            cameralist[0].viewport = new BABYLON.Viewport(0.0, 0.5, 0.495, 0.5); // 左上
            cameralist[1].viewport = new BABYLON.Viewport(0.5, 0.5, 0.500, 0.5); // 右上
            cameralist[2].viewport = new BABYLON.Viewport(0.0, 0.0, 0.495, 0.495); // 左下
            cameralist[3].viewport = new BABYLON.Viewport(0.5, 0.0, 0.500, 0.495); // 右下
        }

        if (icamera == 5) {
            camera = crCamera5();
            resetCameraView(camera);
        }
        if (icamera == 6) {
            camera = crCamera6();
        }
        if (icamera == 7) {
            camera = crCamera7();
        }
        if (icamera == 8) {
            camera = crCamera8();
            resetCameraView(camera);
        }

        if (icamera == 9) {
            // 4分割(icamera=5-8) / 上記４カメラを１画面で
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralist.push(crCamera5())
            cameralist.push(crCamera6())
            cameralist.push(crCamera7())
            cameralist.push(crCamera8())
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            if (camera!=null){
                camera.viewport = new BABYLON.Viewport(0, 0, 0.1, 0.1);
            }
            cameralist[0].viewport = new BABYLON.Viewport(0.0, 0.5, 0.495, 0.5); // 左上
            cameralist[1].viewport = new BABYLON.Viewport(0.5, 0.5, 0.500, 0.5); // 右上
            cameralist[2].viewport = new BABYLON.Viewport(0.0, 0.0, 0.495, 0.495); // 左下
            cameralist[3].viewport = new BABYLON.Viewport(0.5, 0.0, 0.500, 0.495); // 右下
        }

        if (icamera == 10) {
            // 全カメラ
            for (let camera_ of cameralist) {
                camera_.dispose();
            }
            cameralist=[];
            cameralistView = [];
            cameralist.push(crCamera0())
            cameralist.push(crCamera1())
            cameralist.push(crCamera2())
            cameralist.push(crCamera3())
            cameralist.push(crCamera5())
            cameralist.push(crCamera6())
            cameralist.push(crCamera7())
            cameralist.push(crCamera8())
            // activeCameraをクリア
            while (scene.activeCameras.length > 0) {
                scene.activeCameras.pop();
            }
            // activeCameraを再設定
            for (let camera_ of cameralist) {
                scene.activeCameras.push(camera_);
            }
            changeViewportFor10(icamera10)
        }

        if (((icamera == 4) || (icamera == 9) || (icamera == 10)) && myMesh!=null) {
            for (let camera_ of cameralist) {
                if (camera_.lockedTarget == null) {
                    camera_.lockedTarget = myMesh;
                } else {
                    // console.log("camera_.lockedTarget is SET");
                }
            }
        } else if (icamera >= 0 && myMesh!=null) {
            if (camera.lockedTarget == null) {
                camera.lockedTarget = myMesh;
            } else {
                console.log("camera_.lockedTarget is SET");
            }
        }
    }
    // icamera=10時のviewport変更
    //   icamをメインに他をサブにする
    let changeViewportFor10 = function(icam) {
        cameralistView = [];
        cameralistView.push(cameralist[icam]);
        for (let i = 0; i < cameralist.length; ++i) {
            if (i == icam) {continue;}
            cameralistView.push(cameralist[i]);
        }
        // カメラ(大)
        cameralistView[0].viewport = new BABYLON.Viewport(0.0, 0.0, 0.745, 0.74); // 左下
        // カメラ(小)：左上から右上
        cameralistView[1].viewport = new BABYLON.Viewport(0.0, 0.75, 0.245, 0.25); // 左上
        cameralistView[2].viewport = new BABYLON.Viewport(0.25, 0.75, 0.245, 0.25);
        cameralistView[3].viewport = new BABYLON.Viewport(0.5 , 0.75, 0.245, 0.25);
        cameralistView[4].viewport = new BABYLON.Viewport(0.75, 0.75, 0.25, 0.25); // 右上
        // 右上から右下
        cameralistView[5].viewport = new BABYLON.Viewport(0.75, 0.50, 0.25, 0.24); // 右上
        cameralistView[6].viewport = new BABYLON.Viewport(0.75, 0.25, 0.25, 0.24);
        cameralistView[7].viewport = new BABYLON.Viewport(0.75, 0.0 , 0.25, 0.24); // 右下
    }

    let renderCamera1 = function(camera_) {
        // 対象(myMesh)の姿勢／進行方向から固定位置 .. ドライバーズビュー
        let quat = myMesh.rotationQuaternion;
        let vdir;
        if (istage == 0) {
            vdir = new BABYLON.Vector3(0, 0.25, -0.1);
        } else if (istage == 1) {
            vdir = new BABYLON.Vector3(0, 0.02, -0.2);
        } else {
            vdir = new BABYLON.Vector3(0, 0, 0.01);
        }
        vdir = vdir.applyRotationQuaternion(quat);
        camera_.position = myMesh.position.add(vdir);
    }
    let renderCamera2 = function(camera_) {
        // 対象(myMesh)の姿勢／進行方向から固定位置 .. 後方から見下ろす
        let quat = myMesh.rotationQuaternion;
        let vdir = new BABYLON.Vector3(0, 0.8, 8);
        vdir = vdir.applyRotationQuaternion(quat);
        camera_.position = myMesh.position.add(vdir);
    }
    let renderCamera3 = function(camera_) {
        // 対象(myMesh)の姿勢／進行方向から固定位置 .. 先行して前方、ちょい下から前面を煽り見る
        let quat = myMesh.rotationQuaternion;
        let vdir;
        if (istage == 0) {
            vdir = new BABYLON.Vector3(0.5, 0.2, -5);
        } else if (istage == 1) {
            vdir = new BABYLON.Vector3(0.5, 0.4, -5);
        } else if (istage == 2) {
            vdir = new BABYLON.Vector3(0.5, 0.3, -5);
        } else {
            vdir = new BABYLON.Vector3(0.5, -0.1, -5);
        }
        vdir = vdir.applyRotationQuaternion(quat);
        camera_.position = myMesh.position.add(vdir);
    }
    let renderCamera7 = function(camera_) {
        // 対象(myMesh)の周辺を周回する
        let x = camera_._r * Math.cos(camera_._irad);
        let z = camera_._r * Math.sin(camera_._irad);
        let vdir = new BABYLON.Vector3(x, camera_._h, z);
        camera_.position.copyFrom(myMesh.position.add(vdir));
        camera_._irad += camera_._iradStep;
        if (camera_._irad > R360) { camera_._irad -= R360;}
    }
    let renderCamera8 = function(camera_) {
        if (myMesh == null) {
            return;
        }
        const distSqMax = 1000;
        let distSq = BABYLON.Vector3.DistanceSquared(myMesh.position, camera_.position);
        if (distSq > distSqMax) {
            // 進行方向にカメラ位置を移動させる（カーブの外側に再配置される可能性が高い）
            let quat = myMesh.rotationQuaternion;
            let vdir = new BABYLON.Vector3(Math.random()*2-1, Math.random()*2+1, -30);
            vdir = vdir.applyRotationQuaternion(quat);
            // 単純に（前方に一定距離）では、ラインから離れた位置になりがちなので、寄せるために近傍の点の周辺に再配置
            let p = myMesh.position.add(vdir);
            // 最近傍位置
            let rate = myMesh._path3d.getClosestPositionTo(p);
            let ncp = myMesh._path3d.getPointAt(rate);
            // ライン上から水平にずらすためのベクトル v2
            let v2 = vdir.normalize().cross(BABYLON.Vector3.Up());
            if (Math.random() < 0.5) {
                camera_.position.copyFrom(ncp.add(v2.scale(1.7)));
            } else {
                camera_.position.copyFrom(ncp.add(v2.scale(-1.7)));
            }
            if (istage == 0) {
                camera_.position.y += 0.2;
            } else if (istage == 1) {
                camera_.position.y += 0.5;
            } else if (istage == 2) {
                camera_.position.y += 0.4;
            }
        }
    }
    scene.onBeforeRenderObservable.add((scene) => {
        if (myMesh == null) {return;}
        if (icamera == 1) { // freeCamera の場合の位置調整
            renderCamera1(camera);
        }
        if (icamera == 2) { // freeCamera の場合の位置調整
            renderCamera2(camera);
        }
        if (icamera == 3) {
            renderCamera3(camera);
        }

        if (icamera == 4) {
            renderCamera1(cameralist[1]);
            renderCamera2(cameralist[2]);
            renderCamera3(cameralist[3]);
        }

        if (icamera == 7) {
            renderCamera7(camera);
        }
        if (icamera == 8) {
            renderCamera8(camera);
        }

        if (icamera == 9) {
            renderCamera7(cameralist[2]);
            renderCamera8(cameralist[3]);
        }

        if (icamera == 10) {
            renderCamera1(cameralist[1]);
            renderCamera2(cameralist[2]);
            renderCamera3(cameralist[3]);
            renderCamera7(cameralist[6]);
            renderCamera8(cameralist[7]);
        }

    });

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);


    const stageGeoMap = {
        // ------------------------------

        7120:{label:"湖",
              dtype:"xzy",
              grndW:10, grndH:10, adjy:0.15, cnsNAgent:0,
              cid:997118,
              scale:0.2, scaleY:0.5, stageType:"lineTrain", adjx:0, adjz:0, meshPY:-0.15,
              trainType:21, trainNs:[6], trainPini:[0], trainSpd:0.00010, trainPad:-0.0022,
             },
        7121:{label:"湖",
              dtype:"xzy",
              grndW:10, grndH:10, adjy:0.15, cnsNAgent:0,
              cid:997118,
              scale:0.2, scaleY:0.5, stageType:"lineTrain", adjx:0, adjz:0, meshPY:-0.15,
              trainType:22, trainNs:[6], trainPini:[0.6], trainSpd:0.00010, trainPad:-0.0024,
             },

        7221:{label:"山間部",
              dtype:"xzy",
              grndW:10, grndH:10, adjy:0.25, cnsNAgent:0,
              isLoopCourse:true, tubeCAP:BABYLON.Mesh.CAP_ALL, nbPoints:5, pStartIdx:20,
              stageType:"lineTrain", sW:1.0, sH:0.1, meshPY:-0.25,
              cid:997220,
              adjx:0, adjz:-0, scaleY:2.0,
              trainType:30, trainNs:[60], trainPini:[0.091], trainSpd:0.000045, trainPad:-0.0022,
        },

        7521:{label:"都市部 / 特急（内回り",
              dtype:"xzy",
              grndW:10, grndH:10, adjy:0.25, cnsNAgent:0,
              stageType:"lineTrain2", sW:1.0, sH:0.1, meshPY:-0.25,
              cid:997411,
              adjx:-2.0+50, adjz:-0, scale:0.5,
              trainType:13, trainNs:[10,10], trainPini:[0.091, 0.691], trainSpd:0.0009, trainPad:-0.0060, trainStop:[0.090], trainStopWait:120,
        },
        7522:{label:"都市部 / 特急（外回り",
              dtype:"xzy",
              grndW:10, grndH:10, adjy:0.25, cnsNAgent:0,
              stageType:"lineTrain2", sW:1.0, sH:0.1, meshPY:-0.25,
              cid:997412,
              adjx:-1.0+50, adjz:-0, scale:0.5,
              trainType:14, trainNs:[10,10], trainPini:[0.029, 0.279], trainSpd:-0.0009, trainPad:0.0060, trainSpdMin:-0.00002, trainStop:[0.030], trainStopWait:100,
        },
        7523:{label:"都市部 / 普通：内回り",
              dtype:"xzy",
              grndW:10, grndH:10, adjy:0.25, cnsNAgent:0,
              stageType:"lineTrain2", sW:1.0, sH:0.1, meshPY:-0.25,
              cid:997413,
              adjx:-3.0+50, adjz:-0, scale:0.5, scaleY:0.2,
              trainType:11, trainNs:[8, 8, 8], trainPini:[0.088, 0.303, 0.607], trainSpd:0.0003, trainPad:-0.0060, trainStop:[0.087, 0.302, 0.606],
        },
        7524:{label:"都市部 / 普通：外回り",
              dtype:"xzy",
              grndW:10, grndH:10, adjy:0.25, cnsNAgent:0,
              stageType:"lineTrain2", sW:1.0, sH:0.1, meshPY:-0.25,
              cid:997414,
              adjx:0+50, adjz:-0, scale:0.5, scaleY:0.2,
              trainType:12, trainNs:[8,8,8], trainPini:[0.039, 0.256, 0.562], trainSpd:-0.0003, trainPad:0.0060, trainSpdMin:-0.00002, trainStop:[0.040, 0.257, 0.563],
        },
    };

    let meshAggInfo = []; // mesh, agg;
    let pStart = new BABYLON.Vector3(0, 0, 0);
    let pStart2 = new BABYLON.Vector3(0, 0, 0);
    let pGoal = new BABYLON.Vector3(0, 0, 0);

    let dataTrainList = []; // メッシュ動作用のデータリスト／列車

    let createMeshTrain = function(trainType, itrain, ntrain) {
        if (trainType >= 11 && trainType <= 14) {
            // 丸四角＋green
            const fpathList = [
                [fpathTrainRBoxBlue00, // １両
                 fpathTrainRBoxBlue01, // Ｎ両（先頭
                 fpathTrainRBoxBlue10, // Ｎ両（末尾
                 fpathTrainRBoxBlue11, // Ｎ両（中間
                 ],
                [fpathTrainRBoxGreen00, // １両
                 fpathTrainRBoxGreen01, // Ｎ両（先頭
                 fpathTrainRBoxGreen10, // Ｎ両（末尾
                 fpathTrainRBoxGreen11, // Ｎ両（中間
                 ],
                [fpathTrainRBoxRed00, // １両
                 fpathTrainRBoxRed01, // Ｎ両（先頭
                 fpathTrainRBoxRed10, // Ｎ両（末尾
                 fpathTrainRBoxRed11, // Ｎ両（中間
                 ],
                [fpathTrainRBoxYellow00, // １両
                 fpathTrainRBoxYellow01, // Ｎ両（先頭
                 fpathTrainRBoxYellow10, // Ｎ両（末尾
                 fpathTrainRBoxYellow11, // Ｎ両（中間
                 ],
            ];
            let _createRBox = function() {
                let sizew=0.5, sizeh=0.5, arcR=0.1, arcDiv=6, sizel=2;
                function createRoundedRect(width, height, r, arcdiv, z) {
                    // 角丸の四角
                    let w_=width/2, h_=height/2;
                    // (円弧部分の除く) 直線部分の長さ
                    const hw = width / 2 - r;
                    const hh = height / 2 - r;
                    let plist = [];
                    let drawArc = function(cx, cy, r, rads, rade, arcdiv, z) {
                        // 1/4の円弧作成
                        let pplist = [];
                        let radstep = (rade - rads) / arcdiv
                        for (let i = 0; i <= arcdiv; i++) {
                            let rad = rads + radstep*i;
                            let p = new BABYLON.Vector3(cx + r * Math.cos(rad), cy + r * Math.sin(rad), z);
                            pplist.push(p);
                        }
                        return pplist;
                    }
                    plist.push(new BABYLON.Vector3(0, -h_, z)); // 真下
                    plist = plist.concat(drawArc(-hw, -hh, r, R270, R180, arcdiv, z)); // 左下
                    plist.push(new BABYLON.Vector3(-w_, 0, z)); // 左
                    plist = plist.concat(drawArc(-hw, hh, r, R180, R90, arcdiv, z)); // 左上
                    plist.push(new BABYLON.Vector3(0, h_, z)); // 真上
                    plist = plist.concat(drawArc(hw, hh, r, R90, R0, arcdiv, z)); // 右上
                    plist.push(new BABYLON.Vector3(w_, 0, z)); // 右
                    plist = plist.concat(drawArc(hw, -hh, r, R360, R270, arcdiv, z)); // 右下
                    plist.push(new BABYLON.Vector3(0, -h_, z)); // 真下
                    return plist;
                }
                let pplist = [], z;
                let lendiv = 4, sizeldiv = sizel/lendiv, sizel_ = sizel/2;
                for (let iz = 0; iz <= lendiv; ++iz) {
                    z = -iz*sizeldiv + sizel_;
                    pplist.push(createRoundedRect(sizew, sizeh, arcR, arcDiv, z));
                }
                { // ４回に分割して、CAP(start側）を追加
                    let pplist0 = pplist[0];
                    z = sizel/2;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplist0) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.unshift(plist);
                    }
                }
                { // ４回に分割して、CAP(end側)を追加
                    let pplistE = pplist[pplist.length-1];
                    z = -sizel/2;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplistE) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.push(plist);
                    }
                }
                let mesh = BABYLON.MeshBuilder.CreateRibbon("",{ pathArray: pplist, },scene);
                return mesh;
            }
            let mesh = _createRBox();
            mesh.material = new BABYLON.StandardMaterial("");
            let j = 0;
            if (ntrain == 1) {
                // １両のみ
                j = 0;
            } else if (itrain == 0) {
                // 先頭車両
                j = 2;
            } else if (itrain == ntrain-1) {
                // 末尾車両
                j = 1;
            } else {
                // 中間車両
                j = 3;
            }
            let fpath = fpathList[trainType-11][j];
            mesh.material.diffuseTexture = new BABYLON.Texture(fpath, scene);
            mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
            return mesh;

        } else if (trainType == 21) {
            // 新幹線 A
            let radiusX = 0.25, radiusY = 0.2, len = 2;
            let _createBulletTrainA_term = function() {
                // 先頭・末尾
                let pplist = [];
                {
                    let len_=len/2, lendiv=20;
                    let rdiv = 16, rdiv_=rdiv/2, rdivQ = rdiv/4, radstep=R360/rdiv;
                    for (let ii = 0; ii < lendiv; ++ii) {
                        let t = ii/(lendiv-1);
                        let z = len/lendiv*ii - len_;
                        let plist = [], r=1;
                        if (t < 0.1) {
                            // ノーズ
                            z = 0.1*len/lendiv*ii + 0.08*len - len_;
                            r = Math.pow(0.2+t/0.5, 3);
                            for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                                let t = radstep * ((irad+rdiv)%rdiv);
                                let x = Math.cos(t) * radiusX * r;
                                let y = Math.sin(t) * radiusY * r * (t<R180 ? 1.0 : 0.6);
                                plist.push(new BABYLON.Vector3(x, y, z));
                            }
                        } else if (t < 0.6) {
                            // ノーズ
                            let radiusY_ = radiusY/2, rr, rrMax;
                            r = 0.2 + 0.9 * Math.pow(t/0.5, 2);
                            for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                                let t = radstep * ((irad+rdiv)%rdiv);
                                rrMax = radiusX;
                                rr = radiusX * r;
                                rr = Math.min(rr, rrMax);
                                let x = Math.cos(t) * rr;
                                rrMax = radiusY * (t<R180 ? 1.0 : 0.6);
                                rr = radiusY_ * r * (t<R180 ? 1.0 : 0.6);
                                rr = Math.min(rr, rrMax);
                                let y = Math.sin(t) * rr;
                                plist.push(new BABYLON.Vector3(x, y, z));
                            }
                        } else if (t < 0.9) {
                            // 車体
                            r = 1;
                            for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                                let t = radstep * ((irad+rdiv)%rdiv);
                                let x = Math.cos(t) * radiusX * r;
                                let y = Math.sin(t) * radiusY * r * (t<R180 ? 1.0 : 0.6);
                                plist.push(new BABYLON.Vector3(x, y, z));
                            }
                        } else {
                            // テール
                            let u = (t-0.9)/0.1, rr, rrMax;
                            r = 1.0*(1.6-u);
                            for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                                let t = radstep * ((irad+rdiv)%rdiv);
                                rrMax = radiusX;
                                rr = radiusX * r;
                                rr = Math.min(rr, rrMax);
                                let x = Math.cos(t) * rr;
                                rrMax = radiusY * (t<R180 ? 1.0 : 0.6);
                                rr = radiusY * r * (t<R180 ? 1.0 : 0.6);
                                rr = Math.min(rr, rrMax);
                                let y = Math.sin(t) * rr;
                                plist.push(new BABYLON.Vector3(x, y, z));
                            }
                        }
                        pplist.push(plist);
                    }
                    { // ４回に分割して、CAP(start側）を追加
                        let pplist0 = pplist[0];
                        let z = pplist0[0].z;
                        for (let r of [0.75, 0.5, 0.25, 0.001]) {
                            let plist = []
                            for (let p of pplist0) {
                                plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                            }
                            pplist.unshift(plist);
                        }
                    }
                    { // ４回に分割して、CAP(end側)を追加
                        let pplistE = pplist[pplist.length-1];
                        let z = pplistE[0].z;
                        for (let r of [0.75, 0.5, 0.25, 0.001]) {
                            let plist = []
                            for (let p of pplistE) {
                                plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                            }
                            pplist.push(plist);
                        }
                    }
                }
                let mesh = BABYLON.MeshBuilder.CreateRibbon("", {
                    pathArray: pplist,
                    closeArray: false,
                    closePath: true });
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseTexture = new BABYLON.Texture(fpathTrainRoolA1, scene);
                mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
                return mesh;
            }

            let _createBulletTrainA_mid = function() {
                // 中間
                let pplist = [];
                {
                    let len_=len/2, lendiv=20;
                    let rdiv = 16, rdiv_=rdiv/2, rdivQ = rdiv/4, radstep=R360/rdiv;
                    for (let ii = 0; ii <= lendiv; ++ii) {
                        let t = ii/(lendiv-1);
                        let z = len/lendiv*ii - len_;
                        let plist = [], r=1;
                        if (t <= 0.15) {
                            // ノーズ
                            let u = (t+0.04)/0.1, rr, rrMax;
                            r = u;
                            for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                                let t = radstep * ((irad+rdiv)%rdiv);
                                rrMax = radiusX;
                                rr = radiusX * r;
                                rr = Math.min(rr, rrMax);
                                let x = Math.cos(t) * rr;
                                rrMax = radiusY * (t<R180 ? 1.0 : 0.6);
                                rr = radiusY * r * (t<R180 ? 1.0 : 0.6);
                                rr = Math.min(rr, rrMax);
                                let y = Math.sin(t) * rr;
                                plist.push(new BABYLON.Vector3(x, y, z));
                            }
                        } else if (t <= 0.9) {
                            // 車体
                            r = 1;
                            for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                                let t = radstep * ((irad+rdiv)%rdiv);
                                let x = Math.cos(t) * radiusX * r;
                                let y = Math.sin(t) * radiusY * r * (t<R180 ? 1.0 : 0.6);
                                plist.push(new BABYLON.Vector3(x, y, z));
                            }
                        } else {
                            // テール
                            let u = (t-0.9)/0.1, rr, rrMax;
                            r = 1.0*(1.6-u);
                            for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                                let t = radstep * ((irad+rdiv)%rdiv);
                                rrMax = radiusX;
                                rr = radiusX * r;
                                rr = Math.min(rr, rrMax);
                                let x = Math.cos(t) * rr;
                                rrMax = radiusY * (t<R180 ? 1.0 : 0.6);
                                rr = radiusY * r * (t<R180 ? 1.0 : 0.6);
                                rr = Math.min(rr, rrMax);
                                let y = Math.sin(t) * rr;
                                plist.push(new BABYLON.Vector3(x, y, z));
                            }
                        }
                        pplist.push(plist);
                    }
                    { // ４回に分割して、CAP(start側）を追加
                        let pplist0 = pplist[0];
                        let z = pplist0[0].z;
                        for (let r of [0.75, 0.5, 0.25, 0.001]) {
                            let plist = []
                            for (let p of pplist0) {
                                plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                            }
                            pplist.unshift(plist);
                        }
                    }
                    { // ４回に分割して、CAP(end側)を追加
                        let pplistE = pplist[pplist.length-1];
                        let z = pplistE[0].z;
                        for (let r of [0.75, 0.5, 0.25, 0.001]) {
                            let plist = []
                            for (let p of pplistE) {
                                plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                            }
                            pplist.push(plist);
                        }
                    }
                }
                let mesh = BABYLON.MeshBuilder.CreateRibbon("", {
                    pathArray: pplist,
                    closeArray: false,
                    closePath: true });
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseTexture = new BABYLON.Texture(fpathTrainRoolA2, scene);
                return mesh;
            }
            let mesh = null;
            if (itrain == 0) {
                // 先頭車両
                mesh = _createBulletTrainA_term();
            } else if (itrain == ntrain-1) {
                // 末尾車両
                let mesh_ = _createBulletTrainA_term();
                mesh_.rotation.y = R180;
                mesh = new BABYLON.TransformNode();
                mesh_.parent = mesh;
                mesh._child = mesh_;
            } else {
                // 中間車両
                mesh = _createBulletTrainA_mid();
            }
            return mesh;

        } else if (trainType == 22) {
            // 新幹線 B
            let pplist = [];
            let len = 2, len_=len/2, lendiv=20, lendNorse=lendiv/3, lendNorseE=lendiv/3*2, lendivE=lendiv-3, lendivH=lendiv-lendivE;
            let R = 0.25, Rw = R*1.0, Rh = R*0.8, Rmin=-0.4*R, rdiv = 24, rdiv_=rdiv/2, rdivQ = rdiv/4, radstep=R360/rdiv;
            let _createBulletTrainB_term = function() {
                // 先頭・末尾　車両
                for (let ii = 0; ii < lendiv; ++ii) {
                    let z1 = -len/lendiv*ii;
                    let z = z1 + len_;
                    let plist = [];
                    if (ii < lendNorseE) {
                        // ノーズ
                        let scale = Math.pow(-z1/len_,0.7);
                        let scale2 =  (0.1 + 0.8*scale);
                        scale2 = Math.min(scale2, 1);
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            let rrW = Rw * scale2;
                            rrW = Math.min(rrW, Rw)
                            let x = Math.cos(t) * rrW;
                            let rrH = Rh * scale2;
                            rrH = Math.min(rrH, Rh);
                            if (ii <= lendNorse && t < R180) {
                                // ノーズの上部・中間が凹むように高さを下げる
                                rrH = rrH * (1-0.5*Math.sin(ii/lendNorse*R180));
                            }
                            let y = Math.sin(t) * rrH;
                            if (ii <= lendNorse) {
                                y += (Math.cos((lendNorse-ii)/lendNorse*R180)-1)*0.01;
                            }
                            y = Math.max(y, Rmin);
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else if (ii < lendivE) {
                        // ボディ
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            let x = Math.cos(t) * Rw;
                            let y = Math.sin(t) * Rh;
                            if (y < Rmin) {y = Rmin;}
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else {
                        // 連結部(テール）
                        let t = ii/lendiv;
                        let u = (t-0.91)/0.1, rr, rrMax;
                        let scale = 1.0*(1.1-u);
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            rrMax = Rw;
                            rr = Rw*scale;
                            rr = Math.min(rr, rrMax);
                            let x = Math.cos(t) * rr;
                            rrMax = Rh;
                            rr = Rh*scale;
                            rr = Math.min(rr, rrMax);
                            let y = Math.sin(t) * rr;
                            if (y < Rmin) {y = Rmin;}
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    }
                    pplist.push(plist);
                }
                { // ４回に分割して、CAP(start側）を追加
                    let pplist0 = pplist[0];
                    let z = pplist0[0].z;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplist0) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.unshift(plist);
                    }
                }
                { // ４回に分割して、CAP(end側)を追加
                    let pplistE = pplist[pplist.length-1];
                    let z = pplistE[0].z;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplistE) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.push(plist);
                    }
                }
                let mesh = BABYLON.MeshBuilder.CreateRibbon("", {
                    pathArray:pplist,
                    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                });
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseTexture = new BABYLON.Texture(fpathTrainRoolB1, scene);
                mesh.material.diffuseTexture.uScale = -1; // 左右反転させる
                mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
                return mesh;
            }

            let _createBulletTrainB_mid = function() {
                // 中間　車両（客車）
                for (let ii = 0; ii < lendiv; ++ii) {
                    let z1 = len/lendiv*ii;
                    let z = z1 - len_;
                    let plist = [];
                    if (ii < lendivH) {
                        // 連結部(ヘッド）
                        let t2 = (lendiv-ii-1)/lendiv;
                        let u = (t2-0.91)/0.1, rr, rrMax;
                        let scale = 1.0*(1.1-u);
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            rrMax = Rw;
                            rr = Rw*scale;
                            rr = Math.min(rr, rrMax);
                            let x = Math.cos(t) * rr;
                            rrMax = Rh;
                            rr = Rh*scale;
                            rr = Math.min(rr, rrMax);
                            let y = Math.sin(t) * rr;
                            if (y < Rmin) {y = Rmin;}
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else if (ii < lendivE) {
                        // ボディ
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            let x = Math.cos(t) * Rw;
                            let y = Math.sin(t) * Rh;
                            if (y < Rmin) {y = Rmin;}
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    } else {
                        // 連結部(テール）
                        let t = ii/lendiv;
                        let u = (t-0.91)/0.1, rr, rrMax;
                        let scale = 1.0*(1.1-u);
                        for (let irad = -rdivQ; irad <= rdiv-rdivQ; ++irad) {
                            let t = radstep * ((irad+rdiv)%rdiv);
                            rrMax = Rw;
                            rr = Rw*scale;
                            rr = Math.min(rr, rrMax);
                            let x = Math.cos(t) * rr;
                            rrMax = Rh;
                            rr = Rh*scale;
                            rr = Math.min(rr, rrMax);
                            let y = Math.sin(t) * rr;
                            if (y < Rmin) {y = Rmin;}
                            plist.push(new BABYLON.Vector3(x, y, z));
                        }
                    }
                    pplist.push(plist);
                }
                { // ４回に分割して、CAP(start側）を追加
                    let pplist0 = pplist[0];
                    let z = pplist0[0].z;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplist0) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.unshift(plist);
                    }
                }
                { // ４回に分割して、CAP(end側)を追加
                    let pplistE = pplist[pplist.length-1];
                    let z = pplistE[0].z;
                    for (let r of [0.75, 0.5, 0.25, 0.001]) {
                        let plist = []
                        for (let p of pplistE) {
                            plist.push(new BABYLON.Vector3(p.x*r, p.y*r, z));
                        }
                        pplist.push(plist);
                    }
                }
                let mesh = BABYLON.MeshBuilder.CreateRibbon("", { pathArray:pplist });
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseTexture = new BABYLON.Texture(fpathTrainRoolB2, scene);
                mesh.material.diffuseTexture.vScale = -1; // 上下反転させる
                return mesh;
            }
            let mesh = null;
            if (itrain == 0) {
                // 先頭車両
                let mesh_ = _createBulletTrainB_term();
                mesh_.rotation.y = R180;
                mesh = new BABYLON.TransformNode();
                mesh_.parent = mesh;
                mesh._child = mesh_;
            } else if (itrain == ntrain-1) {
                // 末尾車両
                mesh = _createBulletTrainB_term();
            } else {
                // 中間車両
                mesh = _createBulletTrainB_mid();
            }
            return mesh;

        } else if (trainType == 30) {
            // 貨物
            let _createTrainDD51 = function() {
                let s=0.5, sL=2, sL_=sL/2;
                const faceUV = new Array(6);
                {
                    faceUV[0] = new BABYLON.Vector4(1/6, 1, 0/6, 3/4); // 先頭(+z
                    faceUV[1] = new BABYLON.Vector4(1/6, 3/4, 2/6, 1); // 末尾(-z
                    faceUV[2] = new BABYLON.Vector4(5/6, 1, 4/6, 0); // 右　(+x
                    faceUV[3] = new BABYLON.Vector4(5/6, 0, 1, 1); // 左  (-x
                    faceUV[4] = new BABYLON.Vector4(4/6, 2/4, 0, 1/4); // 頂上(+y
                    faceUV[5] = new BABYLON.Vector4(4/6, 1/4, 0, 0/4); // 底　(-y
                }
                let mesh = BABYLON.MeshBuilder.CreateBox("",{width:s, height:s, depth:sL, faceUV: faceUV,},scene);
                mesh.material = new BABYLON.StandardMaterial("");
                // const fpath ="textures/box_DD51.png";
                // const fpathBoxDD51 ="textures/box_DD51.png";
                mesh.material.diffuseTexture = new BABYLON.Texture(fpathBoxDD51, scene);
                const faceUV2 = new Array(6);
                for (let i = 0; i < 6; i++) {
                    faceUV[0] = new BABYLON.Vector4(1/6, 1, 0/6, 3/4); // 先頭(+z
                    faceUV[1] = new BABYLON.Vector4(1/6, 3/4, 2/6, 1); // 末尾(-z
                    faceUV[2] = new BABYLON.Vector4(5/6, 1, 4/6, 0); // 右　(+x
                    faceUV[3] = new BABYLON.Vector4(5/6, 0, 1, 1); // 左  (-x
                    faceUV[4] = new BABYLON.Vector4(4/6, 2/4, 0, 1/4); // 頂上(+y
                    faceUV[5] = new BABYLON.Vector4(4/6, 1/4, 0, 0/4); // 底　(-y
                }
                let mesh2 = BABYLON.MeshBuilder.CreateBox("",{width:s, height:s/4, depth:sL/4, faceUV: faceUV,},scene);
                mesh2.position.y = s/2 + s/8;
                mesh2.parent = mesh
                mesh2.material = new BABYLON.StandardMaterial("");
                mesh2.material.diffuseTexture = new BABYLON.Texture(fpathBoxDD51Top, scene);
                return mesh;
            };
            let _createFreight1 = function() {
                const R90 = Math.PI/2;
                let s=0.5, sL=2, sL_=sL/2;
                let mesh = new BABYLON.TransformNode();
                let mesh1 = BABYLON.MeshBuilder.CreateCylinder("cylinder", {height:sL*0.8, diameter:s});
                mesh1.rotation.x = R90;
                mesh1.parent = mesh;
                let mesh2 = BABYLON.MeshBuilder.CreateBox("",{width:s, height:s/20, depth:sL,},scene);
                mesh2.position.y = -s/2;
                mesh2.parent = mesh;
                mesh1.material = new BABYLON.StandardMaterial("");
                mesh1.material.diffuseColor = BABYLON.Color3.Black();
                mesh2.material = mesh1.material;
                return mesh;
            };
            let _createFreight2 = function() {
                let s=0.5, sL=2, sL_=sL/2;
                const faceUV = new Array(6);
                {
                    faceUV[0] = new BABYLON.Vector4(1/6, 1, 0/6, 3/4); // 先頭(+z
                    faceUV[1] = new BABYLON.Vector4(1/6, 3/4, 2/6, 1); // 末尾(-z
                    faceUV[2] = new BABYLON.Vector4(5/6, 1, 4/6, 0); // 右　(+x
                    faceUV[3] = new BABYLON.Vector4(5/6, 0, 1, 1); // 左  (-x
                    faceUV[4] = new BABYLON.Vector4(4/6, 2/4, 0, 1/4); // 頂上(+y
                    faceUV[5] = new BABYLON.Vector4(4/6, 1/4, 0, 0/4); // 底　(-y
                }
                let mesh = BABYLON.MeshBuilder.CreateBox("",{width:s, height:s, depth:sL, faceUV: faceUV,},scene);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseTexture = new BABYLON.Texture(fpathBoxFreight2, scene);
                const faceUV2 = new Array(6);
                return mesh;
            };
            let _createFreight3 = function() {
                let s=0.5, sL=2, sL_=sL/2;
                let mesh = new BABYLON.TransformNode();
                let mesh11 = BABYLON.MeshBuilder.CreateBox("",{size:s*0.9});
                mesh11.position.z = sL_*0.75;
                mesh11.material = new BABYLON.StandardMaterial("");
                mesh11.material.diffuseColor = new BABYLON.Color3(64/255, 22/255, 32/255);
                mesh11.parent = mesh;
                let mesh12 = mesh11.createInstance("");
                mesh12.position.z = sL_*0.25;
                mesh12.parent = mesh;
                let mesh13 = mesh11.createInstance("");
                mesh13.position.z = -sL_*0.25;
                mesh13.parent = mesh;
                let mesh14 = mesh11.createInstance("");
                mesh14.position.z = -sL_*0.75;
                mesh14.parent = mesh;
                let mesh2 = BABYLON.MeshBuilder.CreateBox("",{width:s, height:s/20, depth:sL,},scene);
                mesh2.position.y = -s/2;
                mesh2.material = new BABYLON.StandardMaterial("");
                mesh2.material.diffuseColor = BABYLON.Color3.Black();
                mesh2.parent = mesh;
                return mesh;
            };

            let mesh = null;
            if (itrain == 0) {
                // 先頭車両
                mesh = _createTrainDD51();
            } else if (itrain <= ntrain/3) {
                mesh = _createFreight2();
            } else if (itrain <= ntrain*2/3) {
                mesh = _createFreight3();
            } else {
                mesh = _createFreight1();
            }
            return mesh;


        } else {
            console.log("under construct trainType=",trainType);
        }
        return null;
    }

    var createStage = function(istage) {
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }
        // meshes4CNS = [];
        dataTrainList = [];
        myMeshCandiList = [];
        myMesh = null;
        let plist3list = [];
        let path3dlist = [];

        skyboxType = istage2skybox[istage];

        // --------------------
        // step.1  コースの点列となるサンプリング点　取得
        let metaStageInfoList = [];
        {
            let [ids, tlabel, tpath] = courseInfoList[istage];
            setText2(tlabel);
            for (let id of ids) {
                if (!(id in stageGeoMap)) {
                    console.log("L1591にマッピング情報がない");
                    continue;
                }
                let rval = stageGeoMap[id];

                if ((typeof(rval.data) !== 'undefined')) {
                    // .data がある .. stageGeoMap[id].data に CourseData*.DATA.test.xz* がある
                    ;
                } else if ((typeof(rval.data) === 'undefined') && (typeof(rval.cid) !== 'undefined')) {
                    // .data は無いけど .cidがある ..  createCourseDataでコースデータを作るVer
                    let geo = _metaStageInfo[rval.cid];
                    let rgeo = createCourseData(geo);
                    rval.data = rgeo.data;
                } else {
                      console.assert(0);
                }
                metaStageInfoList.push(rval);
            }
        }

        for (let metaStageInfo of metaStageInfoList) {
            let stageType = typeof(metaStageInfo.stageType) !== 'undefined' ? metaStageInfo.stageType : "extrude_round_bottom";
            let useSpline = typeof(metaStageInfo.useSpline) !== 'undefined' ? metaStageInfo.useSpline : true;
            let nbPoints = typeof(metaStageInfo.nbPoints) !== 'undefined' ? metaStageInfo.nbPoints : 20;
            let pStartIdx = typeof(metaStageInfo.pStartIdx) !== 'undefined' ? metaStageInfo.pStartIdx:1;
            let isLoopCourse = typeof(metaStageInfo.isLoopCourse) !== 'undefined' ? metaStageInfo.isLoopCourse : true;
            let iy = typeof(metaStageInfo.iy) !== 'undefined' ? metaStageInfo.iy : 5;
            let iystep = typeof(metaStageInfo.iystep) !== 'undefined' ? metaStageInfo.iystep : 0;
            let grndW = typeof(metaStageInfo.grndW) !== 'undefined' ? metaStageInfo.grndW : 200;
            let grndH = typeof(metaStageInfo.grndH) !== 'undefined' ? metaStageInfo.grndH : 200;
            let scale = typeof(metaStageInfo.scale) !== 'undefined' ? metaStageInfo.scale : 1;
            let scaleY = typeof(metaStageInfo.scaleY) !== 'undefined' ? metaStageInfo.scaleY : 1;
            let adjx = typeof(metaStageInfo.adjx) !== 'undefined' ? metaStageInfo.adjx : 0;
            let adjy = typeof(metaStageInfo.adjy) !== 'undefined' ? metaStageInfo.adjy : 0;
            let adjz = typeof(metaStageInfo.adjz) !== 'undefined' ? metaStageInfo.adjz : 0;
            let tubeCAP = typeof(metaStageInfo.tubeCAP) !== 'undefined' ? metaStageInfo.tubeCAP : BABYLON.Mesh.NO_CAP ;
            let nz = typeof(metaStageInfo.nz) !== 'undefined' ? metaStageInfo.nz : 0;
            let pQdiv = typeof(metaStageInfo.pQdiv) !== 'undefined' ? metaStageInfo.pQdiv : 0;
            let pQlist = typeof(metaStageInfo.pQlist) !== 'undefined' ? metaStageInfo.pQlist : [];
            let pQdbg = typeof(metaStageInfo.pQdbg) !== 'undefined' ? metaStageInfo.pQdbg : 0;
            let reverse = typeof(metaStageInfo.reverse) !== 'undefined' ? metaStageInfo.reverse : false; // 逆走
            let soloEnable = typeof(metaStageInfo.soloEnable) !== 'undefined' ? metaStageInfo.soloEnable : false;
            let mZRot = typeof(metaStageInfo.mZRot) !== 'undefined' ? metaStageInfo.mZRot : {};
            let xzLbl = typeof(metaStageInfo.xzLbl) !== 'undefined' ? metaStageInfo.xzLbl : {};
            let trainType = typeof(metaStageInfo.trainType) !== 'undefined' ? metaStageInfo.trainType : 0; // 車両タイプ
            let trainNs = typeof(metaStageInfo.trainNs) !== 'undefined' ? metaStageInfo.trainNs : [8]; // 車両数
            let trainPini = typeof(metaStageInfo.trainPini) !== 'undefined' ? metaStageInfo.trainPini : [0]; // 初期位置
            let trainSpdMin = typeof(metaStageInfo.trainSpdMin) !== 'undefined' ? metaStageInfo.trainSpdMin : 0.00002;
            let trainSpd = typeof(metaStageInfo.trainSpd) !== 'undefined' ? metaStageInfo.trainSpd : 0.0002;
            let trainPad = typeof(metaStageInfo.trainPad) !== 'undefined' ? metaStageInfo.trainPad : -0.0060;
            let trainStop = typeof(metaStageInfo.trainStop) !== 'undefined' ? metaStageInfo.trainStop : [];
            let trainStopWait = typeof(metaStageInfo.trainStopWait) !== 'undefined' ? metaStageInfo.trainStopWait : 100;
            let meshPY = typeof(metaStageInfo.meshPY) !== 'undefined' ? metaStageInfo.meshPY : 0;

            let plist = [];
            let plist3 = [];

            console.assert(trainNs.length == trainPini.length);
            console.assert(trainSpd*trainSpdMin > 0);
            // --------------------
            // step.2  点列情報の加工（メッシュ用の点列 plist3 を作成）

            {
                if (metaStageInfo.dtype=='xz') {
                    // 画像から抜き出した座標をそのまま使う版
                    let ix, iz, ii=-1;
                    for (let tmp of metaStageInfo.data) {
                        ++ii;
                        // xzLbl
                        let vE = tmp[tmp.length-1];
                        if (typeof(vE) == "string") {
                            xzLbl[ii] = vE;
                            // tmp末尾をpopすると元データを壊してしまうので、tmp配列をコピー
                            let tmp2 = []
                            for (let kk=0; kk < tmp.length-1; ++kk) {
                                tmp2.push(tmp[kk]);
                            }
                            tmp = tmp2;
                        }
                        ix = tmp[0];
                        iz = tmp[1];
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                        iy += iystep;
                    }

                } else if(metaStageInfo.dtype=='xzy') {
                    // 高さを手動で指定した版
                    // .. カスタムでコースを作成する場合も
                    let ii =-1, ix, iz, iy;
                    for (let tmp of metaStageInfo.data) {
                        ++ii;
                        // xzLbl
                        let vE = tmp[tmp.length-1];
                        if (typeof(vE) == "string") {
                            xzLbl[ii] = vE;
                            let tmp2 = tmp.slice(0, tmp.length-1);
                            tmp = tmp2;
                        }
                        ix = tmp[0];
                        iz = tmp[1];
                        iy = tmp[2];
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                    }
                }

                // ------------------------------
                let plist2 = []
                if(useSpline) {
                    // 上記で取得した点列を、スプラインで補間
                    let catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
                    plist2 = catmullRom.getPoints();
                } else {
                    plist2 = plist;
                }

                if (isLoopCourse) {
                    // 始点、２番目を末尾に追加／ループとする
                    // 3D的なループにするには始点だけでは途切れるっぽいので２番目も
                    let p0 = plist2[0];
                    plist2.push(new BABYLON.Vector3(p0.x, p0.y, p0.z));
                    p0 = plist2[1];
                    plist2.push(new BABYLON.Vector3(p0.x, p0.y, p0.z));
                }
                
                // 目的地／中継地取得用の座標値列
                plist3 = plist2;
                if (reverse) {
                    plist3 = plist2.slice().reverse();
                }
                plist3list.push(plist3);
            }

            {
                pStart = plist3[pStartIdx].clone();
                pStart2 = plist3[pStartIdx+2].clone();
                pGoal = plist3[plist3.length-10].clone();

                if (stageType=='line') {
                    let mesh = BABYLON.MeshBuilder.CreateLines("lines", {points: plist3}, scene);
                    meshAggInfo.push([mesh,null]);
                }

                if (stageType=='lineTrain') {
                    let mesh = BABYLON.MeshBuilder.CreateLines("lines", {points: plist3}, scene);
                    mesh.position.y += meshPY;
                    meshAggInfo.push([mesh,null]);
                    let path3d = new BABYLON.Path3D(plist3);
                    path3dlist.push(path3d);
                    for (let iline = 0; iline < trainNs.length; ++iline) {
                        let nMeshTrain = trainNs[iline], nMeshTrain_=nMeshTrain-1, nMeshTrain_2=Math.floor(nMeshTrain/2);
                        let iniPosi = trainPini[iline];
                        // let meshLast = null;
                        let meshList = [];
                        for (let i = 0; i < nMeshTrain; ++i) {
                            let mesh = createMeshTrain(trainType, i, nMeshTrain);
                            // if (i == 0) {
                            if ((i == 0) || (nMeshTrain > 50 && ((i==nMeshTrain_2) || (i==nMeshTrain_)))) {
                                mesh._path3d = path3d;
                                mesh.rotationQuaternion = new BABYLON.Quaternion();
                                {
                                    // カメラ用のメッシュ
                                    let meshCamTrg = BABYLON.MeshBuilder.CreateBox("", {size:0.5});
                                    meshCamTrg.position.set(0, 0.25, -1);
                                    meshCamTrg.visibility = 0; // 不可視に
                                    meshCamTrg.parent = mesh;
                                    mesh._meshCamTrg = meshCamTrg;
                                }
                                myMeshCandiList.push(mesh);
                            }
                            meshList.push(mesh);
                            meshAggInfo.push([mesh,null]);
                        }
                        dataTrainList.push({
                            actState:"accForce",
                            v: trainSpd,
                            vmin: trainSpdMin,
                            vmax: trainSpd,
                            vmax_: trainSpd/4,
                            p: iniPosi, // 位相位置[0,1]
                            pstep:trainPad,
                            stopList:trainStop, // 停止位置pctのリスト
                            pstopCur: 0, // カレントの停止位置
                            stopCnt: 0,
                            stopCntMax: trainStopWait,
                            path3d: path3d,
                            meshList: meshList,
                        });
                    }
                }

                if (stageType=='lineTrain2') {
                    let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 0.2;
                    let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 0.01;
                    let gardW2 = typeof(metaStageInfo.gardW2) !== 'undefined' ? metaStageInfo.gardW2 : 0.45;
                    let txtVScale = typeof(metaStageInfo.txtVScale) !== 'undefined' ? metaStageInfo.txtVScale : 200;
                    let gardW_ =gardW/2, gardW2_=gardW2/2;
                    let myShape = [
                        new BABYLON.Vector3(-gardW2_     ,  0    , 0),
                        new BABYLON.Vector3(-gardW_      ,  0    , 0),
                        new BABYLON.Vector3(-gardW_      ,  gardH, 0),
                        new BABYLON.Vector3(-gardW_+gardH,  gardH, 0),
                        new BABYLON.Vector3(-gardW_+gardH,  0    , 0),
                        new BABYLON.Vector3( gardW_-gardH,  0    , 0),
                        new BABYLON.Vector3( gardW_-gardH,  gardH, 0),
                        new BABYLON.Vector3( gardW_      ,  gardH, 0),
                        new BABYLON.Vector3( gardW_      ,  0    , 0),
                        new BABYLON.Vector3( gardW2_     ,  0    , 0),
                    ];
                    let options = {shape: myShape,
                                   path: plist3,
                                   sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                                   adjustFrame:true,
                                   cap:tubeCAP};
                    let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                    mesh.position.y += meshPY;
                    mesh.material = new BABYLON.StandardMaterial("");
                    mesh.material.diffuseTexture = new BABYLON.Texture(fpathFloorRail, scene);
                    mesh.material.diffuseTexture.uScale = 1;
                    mesh.material.diffuseTexture.vScale = txtVScale;
                    meshAggInfo.push([mesh,null]);
                    let path3d = new BABYLON.Path3D(plist3);
                    path3dlist.push(path3d);
                    for (let iline = 0; iline < trainNs.length; ++iline) {
                        let nMeshTrain = trainNs[iline], nMeshTrain_=nMeshTrain-1, nMeshTrain_2=Math.floor(nMeshTrain/2);
                        let iniPosi = trainPini[iline];
                        // let meshLast = null;
                        let meshList = [];
                        for (let i = 0; i < nMeshTrain; ++i) {
                            let mesh = createMeshTrain(trainType, i, nMeshTrain);
                            // if (i == 0) {
                            if ((i == 0) || (nMeshTrain > 50 && ((i==nMeshTrain_2) || (i==nMeshTrain_)))) {
                                mesh._path3d = path3d;
                                mesh.rotationQuaternion = new BABYLON.Quaternion();
                                {
                                    // カメラ用のメッシュ
                                    let meshCamTrg = BABYLON.MeshBuilder.CreateBox("", {size:0.5});
                                    meshCamTrg.position.set(0, 0.25, -1);
                                    meshCamTrg.visibility = 0; // 不可視に
                                    meshCamTrg.parent = mesh;
                                    mesh._meshCamTrg = meshCamTrg;
                                }
                                myMeshCandiList.push(mesh);
                            }
                            meshList.push(mesh);
                            meshAggInfo.push([mesh,null]);
                        }
                        dataTrainList.push({
                            actState:"accForce",
                            v: trainSpd,
                            vmin: trainSpdMin,
                            vmax: trainSpd,
                            vmax_: trainSpd/4,
                            p: iniPosi, // 位相位置[0,1]
                            pstep:trainPad,
                            stopList:trainStop, // 停止位置pctのリスト
                            pstopCur: 0, // カレントの停止位置
                            stopCnt: 0,
                            stopCntMax: trainStopWait,
                            path3d: path3d,
                            meshList: meshList,
                        });
                    }
                }
            }

        } // for (let metaStageInfo of metaStageInfoList) {

        // ------------------------------------------------------------

        let skybox = null;
        if (1) {
            // Skybox
            let skyboxTextPath;
            if (skyboxType < 0) {
                let i = Math.floor(skyboxTextPathList.length*Math.random());
                skyboxTextPath = skyboxTextPathList[i];
            } else {
                skyboxTextPath = skyboxTextPathList[skyboxType];
            }
            skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:4000.0}, scene);
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skybox.material = skyboxMaterial;
            meshAggInfo.push([skybox,null]);
        }

        // ------------------------------------------------------------

        // 特別な仕様、地面、建物を作成
        if (istage == 0) {
            // 都市をイメージ

            // 地面
            {
                let grndW=300, grndH=300;
                let meshGrnd = BABYLON.MeshBuilder.CreateGround("ground", { width:grndW, height:grndH }, scene);
                meshGrnd.position.y += -0.01;
                if (0) {
                meshGrnd.material = new BABYLON.StandardMaterial("mat", scene);
                meshGrnd.material.diffuseTexture = new BABYLON.Texture(grndPath, scene);
	        meshGrnd.material.diffuseTexture.uScale = Math.ceil(grndW/4);
	        meshGrnd.material.diffuseTexture.vScale = Math.ceil(grndH/4);
                meshGrnd.material.specularColor = new BABYLON.Color4(0, 0, 0);
                }
                if (1) {
                meshGrnd.material = new BABYLON.GridMaterial("groundMaterial", scene);
                meshGrnd.material.majorUnitFrequency = 100; 
                meshGrnd.material.minorUnitVisibility  = 0.2;
                }
                meshAggInfo.push([meshGrnd,null]);
            }

            // プラットフォーム
            //              size        posi,         rot
            let geolist = [
                [1.2, 0.1, 28,   47.20, 0.05, 22,   0, 0, 0],
                [1.2, 0.1, 28,   49.85, 0.05, 22,   0, 0, 0],
                [28, 0.1, 1.2,   2, 0.05, 54.15,   0, 0, 0],
                [28, 0.1, 1.2,   2, 0.05, 56.85,   0, 0, 0],
                [1.2, 0.1, 28,   -15.3, 2.05, 1,   0, -R45, 0],
            ];
            for (let [sx,sy,sz, px,py,pz, rx,ry,rz] of geolist) {
                let mesh = BABYLON.MeshBuilder.CreateBox("", {width:sx, height:sy, depth:sz});
                mesh.position.set(px,py,pz);
                mesh.rotation.x = rx;
                mesh.rotation.y = ry;
                mesh.rotation.z = rz;
                meshAggInfo.push([mesh,null]);
            }

            // 高架橋
            if (plist3list.length >= 4) {
                for (let plist3 of [plist3list[2], plist3list[3]]) {
                    let y = plist3[0].y+0.01;
                    let plist4 = [];
                    for (let p of plist3) {
                        if (p.y > y) {
                            plist4.push(p);
                        }
                    }
                    if (plist4.length > 0) {
                        const myShape = [
                            new BABYLON.Vector3(-0.5, 0, 0),
                            new BABYLON.Vector3( 0.5, 0, 0),
                        ];
                        let options = {shape: myShape,
                                       path: plist4,
                                       sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                                       adjustFrame:true,
                                      };
                        let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options);
                        // mesh.position.y += -0.25;
                        mesh.position.y += -0.26;
                        meshAggInfo.push([mesh,null]);
                        // 支柱
                        let i = 0;
                        for (let p of plist4) {
                            if ((++i % 150 )== 0) {
                                // let h = p.y-0.25;
                                let h = p.y-0.31;
                                mesh = BABYLON.MeshBuilder.CreateCylinder("", {height:h, diameter:0.8,});
                                mesh.position.set(p.x, h/2, p.z);
                                meshAggInfo.push([mesh,null]);
                            }
                        }
                    }
                }
            }

            // 建物
            // ref) https://doc.babylonjs.com/features/featuresDeepDive/particles/solid_particle_system/immutable_sps/
            {
                var nbBuildings = 3000;
                var fact = 300; // 生成する範囲
                var scaleX = 0.0;
                var scaleY = 0.0;
                var scaleZ = 0.0;
                var grey = 0.0;
                var uvSize = 0.0;
                var mat = new BABYLON.StandardMaterial("mat1", scene);
                var texture = new BABYLON.Texture(fpathGlassBuilding, scene);
                mat.diffuseTexture = texture;
                // custom position function
                var myPositionFunction = function(particle, i, s) {
                    scaleX = Math.random() * 2 + 0.8;
                    scaleY = Math.random() * 3 + 0.8; // 6 + 0.8;
                    scaleZ = Math.random() * 2 + 0.8;
	            uvSize = Math.random() * 0.9;
                    particle.scale.x = scaleX;
                    particle.scale.y = scaleY;
                    particle.scale.z = scaleZ;
                    particle.position.x = (Math.random() - 0.5) * fact;
                    particle.position.y = particle.scale.y / 2 + 0.01;
                    particle.position.z = (Math.random() - 0.5) * fact;
                    {
                        // plist3list / path3dlist との交差判定
                        for (let path3d of path3dlist) {
                            let rate = path3d.getClosestPositionTo(particle.position);
                            let np = path3d.getPointAt(rate);
                            let distSq = BABYLON.Vector3.DistanceSquared(particle.position, np);
                            if (distSq < 9) {
                                particle.scale.x = 0;
                                particle.scale.y = 0;
                                particle.scale.z = 0;
                                particle.position.y = 0;
                                break;
                            }
                        }
                    }
                    particle.rotation.y = Math.random() * 3.5;
                    grey = 1.0 - Math.random() * 0.5;
                    particle.color = new BABYLON.Color4(grey + 0.1, grey + 0.1, grey, 1);
	            particle.uvs.x = Math.random() * 0.1;
	            particle.uvs.y = Math.random() * 0.1;
	            particle.uvs.z = particle.uvs.x + uvSize;
	            particle.uvs.w = particle.uvs.y + uvSize;
                };
                // Particle system creation : Immutable
                var SPS = new BABYLON.SolidParticleSystem('SPS', scene, {updatable: false});
                var model = BABYLON.MeshBuilder.CreateBox("m", {}, scene);
                SPS.addShape(model, nbBuildings, {positionFunction: myPositionFunction});
                var mesh = SPS.buildMesh();
                mesh.material = mat;
                // dispose the model
                model.dispose();
                meshAggInfo.push([SPS, null]);
            }

        } else if (istage == 1) {
            // 湖をイメージ

            {
                // 地面（湖の周りの岸／中を丸角四角でくりぬく
                const corners = [ new BABYLON.Vector2( 80+200, -20-200),
                                  new BABYLON.Vector2( 80+200, 100+200),
                                  new BABYLON.Vector2( -4-200, 100+200),
                                  new BABYLON.Vector2( -4-200, -20-200),
                                ];
                const hole = new BABYLON.Path2(60, -20);
                hole.addArcTo(74, -14, 80,  0, 20);
                hole.addLineTo( 80,  78);
                hole.addArcTo(74, 92, 60,  98, 20);
                hole.addLineTo( 20,  98);
                hole.addArcTo(6, 92, 0,  80, 20);
                hole.addLineTo( 0, 0);
                hole.addArcTo(6, -14, 20, -20, 20);
                const poly_tri = new BABYLON.PolygonMeshBuilder("polytri", corners);
                poly_tri.addHole(hole.getPoints());
                let mesh = poly_tri.build();
                mesh.position.y = -0.01;
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseTexture = new BABYLON.Texture(fpathGrass, scene);
                mesh.material.diffuseTexture.uScale = 400;
                mesh.material.diffuseTexture.vScale = 400;
                meshAggInfo.push([mesh, null]);
            }

            if (1) {
                // 遠方の丘陵地を heightmap で作成する
                let mesh = BABYLON.MeshBuilder.CreateGroundFromHeightMap("", fpathDistortion2, {
                    width:400, height :400, subdivisions: 10, maxHeight: 10});
                mesh.position.set(30, -0.2, 40);
                mesh.material = new BABYLON.StandardMaterial("");
                mesh.material.diffuseTexture = new BABYLON.Texture(fpathSand, scene);
                mesh.material.diffuseTexture.uScale = 50;
                mesh.material.diffuseTexture.vScale = 50;
                mesh.material.emissiveColor = BABYLON.Color3.White();
                meshAggInfo.push([mesh, null]);
            }

            if (1) {
                // 湖
                const sizeW = 100, sizeH = 140;
                var meshGround = BABYLON.MeshBuilder.CreateGround("ground", {width: sizeW, height: sizeH});
                meshGround.position.set(40, -0.02, 40);
                // 水面用メッシュの処理
                const waterMaterial = new BABYLON.WaterMaterial("water");
                waterMaterial.bumpTexture = new BABYLON.Texture(fpathWaterBump);
                waterMaterial.waterColor = new BABYLON.Color3(0.3, 0.5, 0.9);
                waterMaterial.waterColorLevel = 0.2;
                waterMaterial.fresnelLevel = 1.0;
                waterMaterial.reflectionLevel = 0.6;
                waterMaterial.refractionLevel = 0.8;
                // 鏡面
                waterMaterial.waveLength = 0.0;
                waterMaterial.waveHeight = 0.0;
                waterMaterial.waterDirection = new BABYLON.Vector2(0, 0.01);
                // // ちいさな　さざ波
                // waterMaterial.waveLength = 0.01;
                // waterMaterial.waveHeight = 0.015;
                // waterMaterial.waterDirection = new BABYLON.Vector2(0, 1);
                // 環境反射の設定
                waterMaterial.addToRenderList(skybox);
                for (let data of dataTrainList) {
                    for (let i = 0; i < data.meshList.length; ++i) {
                        if ((i == 0) || (i == data.meshList.length-1)) {
                            if ((typeof(data.meshList[i]._child) !== 'undefined')) {
                                waterMaterial.addToRenderList(data.meshList[i]._child);
                            } else {
                                waterMaterial.addToRenderList(data.meshList[i]);
                            }
                        } else {
                            waterMaterial.addToRenderList(data.meshList[i]);
                        }
                    }
                }
                // 新しい水面に適用
                meshGround.material = waterMaterial;
                meshAggInfo.push([meshGround, null]);
            }

        } else if (istage == 2) {
            // 山をイメージ
            let plist3 = plist3list[0];

            const shuffle2 = (arr) =>
                arr.map((value) => ({ value, random: Math.random() }))
                .sort((a, b) => a.random - b.random)
                .map(({ value }) => value);

                // 座標[x,y,z]のMinMax
                let rng = [[null,null],[null,null],[null,null]];
                {
                    let ii = 0;
                    rng[0][0] = plist3[ii].x;
                    rng[0][1] = plist3[ii].x;
                    rng[1][0] = plist3[ii].y;
                    rng[1][1] = plist3[ii].y;
                    rng[2][0] = plist3[ii].z;
                    rng[2][1] = plist3[ii].z;
                }
                for (const p of plist3) {
                    if (rng[0][0] > p.x) {rng[0][0] = p.x;}
                    if (rng[0][1] < p.x) {rng[0][1] = p.x;}
                    if (rng[1][0] > p.y) {rng[1][0] = p.y;}
                    if (rng[1][1] < p.y) {rng[1][1] = p.y;}
                    if (rng[2][0] > p.z) {rng[2][0] = p.z;}
                    if (rng[2][1] < p.z) {rng[2][1] = p.z;}
                }

                let gridsize = 1, npad = 20;
                let nxmin = (Math.floor(rng[0][0]/gridsize)-npad);
                let nxmax = (Math.ceil(rng[0][1]/gridsize)+npad);
                let nx = nxmax-nxmin+1, nx_=nx-1;
                let vxmin = nxmin*gridsize;
                let nzmin = (Math.floor(rng[2][0]/gridsize)-npad);
                let nzmax = (Math.ceil(rng[2][1]/gridsize)+npad);
                let nz = nzmax-nzmin+1, nz_=nz-1;
                let vzmin = nzmin*gridsize;

                // 制約データ：
                //   [ix][iz][0] 道路の高さ
                //   [ix][iz][1] 道路からのマンハッタン距離 = abs(dx)+abs(dz)  (=ランダム振幅の許容幅）
                // .. 重なる場合は距離の小さい方を選ぶ。距離も同じなら高さの小さい方を選択
                const defaultValue = -1; // null;

                let randCons = Array.from(new Array(nx), () => { return Array.from(new Array(nz), () => new Array(2).fill(-1)); });

                if (1) {
                    // 平坦な高さ
                    const dR = 5; // 分布を割り当てる、plist3からの距離
                    const adjBankY = -0.25; // バンクをつけている分地面を下げる
                    console.assert(dR < npad);
                    for (const p of plist3) {
                        let icx = Math.round((p.x-vxmin)/gridsize);
                        let icz = Math.round((p.z-vzmin)/gridsize);
                        if (icx-dR < 0 || icx+dR >= nx) { console.log("!!! icx=",icx,", nx=",nx); }
                        if (icz-dR < 0 || icz+dR >= nz) { console.log("!!! icz=",icz,", nz=",nz); }
                        for (let iz=icz-dR ; iz <=icz+dR; ++iz) {
                            if (iz < 0 || iz >= nz) { continue; }
                            for (let ix=icx-dR ; ix <=icx+dR; ++ix) {
                                if (ix < 0 || ix >= nx) { continue; }
                                // 道路（制約のライン）からの距離
                                let dist = Math.abs(ix-icx) + Math.abs(iz-icz);
                                if (randCons[ix][iz][0] == -1) {
                                    // 未設定：「高さ」「距離」を設定
                                    randCons[ix][iz][0] = p.y+adjBankY;
                                    randCons[ix][iz][1] = dist;
                                } else if (randCons[ix][iz][1] > dist) {
                                    // 設定済／より近い位置：より近い基準点の「高さ」「距離」を設定
                                    randCons[ix][iz][0] = p.y+adjBankY;
                                    randCons[ix][iz][1] = dist;
                                } else if (randCons[ix][iz][0] > p.y+adjBankY) {
                                    // 設定済／同じ距離の点：より低い「高さ」を設定
                                    randCons[ix][iz][0] = p.y+adjBankY;
                                    randCons[ix][iz][1] = dist;
                                }
                            }
                        }
                    }
                }

                // randCons の未設定箇所を充足 .. 近傍の値を拡張する
                {
                    let rest = [];
                    for (let iz=0; iz < nz; ++iz) {
                        for (let ix=0; ix < nx; ++ix) {
                            if (randCons[ix][iz][0] == -1) {
                                rest.push([ix,iz]);
                            }
                        }
                    }
                    const nextxz = [[-1,0],[1,0],[0,-1],[0,1]];
                    let _iloopDebug = 0;
                    while(rest.length > 0) {
                        if (++_iloopDebug > 300) { break; } // 無限ループ対策
                        rest = shuffle2(rest);
                        let rest2 = [];
                        for (let [jx,jz] of rest) {
                            let bfound = false;
                            for (let nxz of nextxz) {
                                let [ix,iz] = [jx+nxz[0], jz+nxz[1]];
                                if (ix < 0 || ix >= nx || iz < 0 || iz >= nz) {continue;}
                                if (randCons[ix][iz][0] != -1) {
                                    bfound = true;
                                    if (randCons[jx][jz][0] == -1) {
                                        randCons[jx][jz][0] = randCons[ix][iz][0];
                                        randCons[jx][jz][1] = randCons[ix][iz][1]+1;
                                    } else if (randCons[jx][jz][1] > randCons[ix][iz][1]+1) {
                                        randCons[jx][jz][0] = randCons[ix][iz][0];
                                        randCons[jx][jz][1] = randCons[ix][iz][1]+1;
                                    } else if (randCons[jx][jz][1] == randCons[ix][iz][1] +1  && randCons[jx][jz][0] > randCons[ix][iz][0]) {
                                        randCons[jx][jz][0] = randCons[ix][iz][0];
                                    }
                                }
                            }
                            if (bfound == false) {
                                rest2.push([jx,jz]);
                            }
                        }
                        rest = rest2;
                    }
                }

                let mesh = null;
                if (1) {
                    // ノイズなし（バイアス／高さのみ）
                    let nb = new BABYLON.NoiseBlock();
                    const nbvzero = new BABYLON.Vector3(0,0,0);
                    let gridratio = 1, nbscale = 0.05/gridratio;
                    let rootPath = [];
                    for (let iz=0; iz < nz; ++iz) {
                        let z = (iz+nzmin)*gridsize;
                        let path = []
                        for (let ix=0; ix < nx; ++ix) {
                            let x = (ix+nxmin)*gridsize;
                            let y = randCons[ix][iz][0];
                            let amp = Math.max(randCons[ix][iz][1]-3,0);
                            path.push(new BABYLON.Vector3(x, y, z));
                        }
                        rootPath.push(path);
                    }
                    mesh = BABYLON.MeshBuilder.CreateRibbon("ground_ribbon_1", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                }

                {
                    // 複数のグラデーションのmaterialのためにこちらを参照
                    // https://forum.babylonjs.com/t/generate-materials-with-color-gradients/6032/4
                    // https://www.babylonjs-playground.com/#MCJYB5#12
                    var nodeMaterial = new BABYLON.NodeMaterial(`node material`);
                    var position = new BABYLON.InputBlock("position");
                    position.setAsAttribute("position");
                    var worldPos = new BABYLON.TransformBlock("worldPos");
                    worldPos.complementZ = 0;
                    worldPos.complementW = 1;
                    position.output.connectTo(worldPos.vector);
                    var world = new BABYLON.InputBlock("world");
                    world.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);
                    var Transform = new BABYLON.TransformBlock("Transform");
                    Transform.complementZ = 0;
                    Transform.complementW = 1;
                    var normal = new BABYLON.InputBlock("normal");
                    normal.setAsAttribute("normal");
                    normal.output.connectTo(Transform.vector);
                    world.output.connectTo(Transform.transform);
                    var Lights = new BABYLON.LightBlock("Lights");
                    worldPos.output.connectTo(Lights.worldPosition);
                    Transform.output.connectTo(Lights.worldNormal);
                    var cameraPosition = new BABYLON.InputBlock("cameraPosition");
                    cameraPosition.setAsSystemValue(BABYLON.NodeMaterialSystemValues.CameraPosition);
                    cameraPosition.output.connectTo(Lights.cameraPosition);
                    var Multiply = new BABYLON.MultiplyBlock("Multiply");
                    var Gradient = new BABYLON.GradientBlock("Gradient");
                    // 地形の高さに合わせて、グラデーションのレンジを修正
                    Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0, new BABYLON.Color3(0.15, 0.4, 0.8)));
                    Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(2, new BABYLON.Color3(0.6, 0.5, 0.3)));
                    Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(10, new BABYLON.Color3(0.4, 0.7, 0.3)));
                    Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(20, new BABYLON.Color3(0.2, 0.5, 0.2)));
                    Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(40, new BABYLON.Color3(0.4, 0.4, 0.3)));
                    Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(60, new BABYLON.Color3(0.90, 0.90, 0.95)));
                    // グラデーションはこちらを参考に
                    // https://playground.babylonjs.com/?webgpu#Y2UGQ5#53
                    var VectorSplitter = new BABYLON.VectorSplitterBlock("VectorSplitter");
                    position.output.connectTo(VectorSplitter.xyzIn);
                    VectorSplitter.y.connectTo(Gradient.gradient);
                    Gradient.output.connectTo(Multiply.left);
                    Lights.diffuseOutput.connectTo(Multiply.right);
                    var fragmentOutput = new BABYLON.FragmentOutputBlock("fragmentOutput");
                    Multiply.output.connectTo(fragmentOutput.rgb);
                    world.output.connectTo(worldPos.transform);
                    var worldPosviewProjectionTransform = new BABYLON.TransformBlock("worldPos * viewProjectionTransform");
                    worldPosviewProjectionTransform.complementZ = 0;
                    worldPosviewProjectionTransform.complementW = 1;
                    worldPos.output.connectTo(worldPosviewProjectionTransform.vector);
                    var viewProjection = new BABYLON.InputBlock("viewProjection");
                    viewProjection.setAsSystemValue(BABYLON.NodeMaterialSystemValues.ViewProjection);
                    viewProjection.output.connectTo(worldPosviewProjectionTransform.transform);
                    var vertexOutput = new BABYLON.VertexOutputBlock("vertexOutput");
                    worldPosviewProjectionTransform.output.connectTo(vertexOutput.vector);
                    nodeMaterial.addOutputNode(vertexOutput);
                    nodeMaterial.addOutputNode(fragmentOutput);
                    nodeMaterial.build();
                    mesh.material = nodeMaterial;
                }

                meshAggInfo.push([mesh,null]);

            // 雲を配置
            if (cloudType == 0) {
                // 頂上付近の雲海
                let nCapa = 10000;
                let rngx=40, rngz=70, cx = -50, cz=30;
                const spriteManagerTrees = new BABYLON.SpriteManager("sm", fpathCloud, nCapa, {width: 256, height: 256});
                let meshlist = [], x, y, z;
                for (let i = 0; i < nCapa; ++i) {
                    let meshSub = new BABYLON.Sprite("", spriteManagerTrees);
                    meshSub.width = BABYLON.Scalar.RandomRange(3, 4);
                    meshSub.height = meshSub.width;
                    x = BABYLON.Scalar.RandomRange(-rngx, rngx)+cx;
                    y = BABYLON.Scalar.RandomRange(52, 70);
                    z = BABYLON.Scalar.RandomRange(-rngz, rngz)+cz;
                    meshSub.position = new BABYLON.Vector3(x,y+meshSub.height/2,z);
                    meshlist.push(meshSub);
                }
                scene.onBeforeRenderObservable.add(() => {
                    for (let mesh of meshlist) {
                        mesh.position.x -= 0.01;
                        if (mesh.position.x <= -rngx+cx) {
                            mesh.position.x += rngx*2;
                        }
                    }
                });
                meshAggInfo.push([spriteManagerTrees,null]);
            }

            if (cloudType == 1) {
                // 中層の雲を抜けて、快晴な頂上部を走るかんじ
                let nCapa = 3000;
                let rng = 30, cx = -50, cz=10;
                const spriteManagerTrees = new BABYLON.SpriteManager("sm", fpathCloud, nCapa, {width: 256, height: 256});
                let meshlist = [], x, y, z;
                for (let i = 0; i < nCapa; ++i) {
                    let meshSub = new BABYLON.Sprite("", spriteManagerTrees);
                    meshSub.width = BABYLON.Scalar.RandomRange(3, 4);
                    meshSub.height = meshSub.width;
                    x = BABYLON.Scalar.RandomRange(-rng, rng)+cx;
                    // y = BABYLON.Scalar.RandomRange(50, 60);
                    y = BABYLON.Scalar.RandomRange(45, 58);
                    z = BABYLON.Scalar.RandomRange(-rng, rng)+cz;
                    meshSub.position = new BABYLON.Vector3(x,y+meshSub.height/2,z);
                    meshlist.push(meshSub);
                }
                scene.onBeforeRenderObservable.add(() => {
                    for (let mesh of meshlist) {
                        mesh.position.x -= 0.01;
                        if (mesh.position.x <= -rng+cx) {
                            mesh.position.x += rng*2;
                        }
                    }
                });
                meshAggInfo.push([spriteManagerTrees,null]);
            }

        }

        // ------------------------------------------------------------
        if (myMesh == null && myMeshCandiList.length > 0) {
            myMesh = myMeshCandiList[imyMeshCandi];
        }
    }


    scene.onBeforeRenderObservable.add((scene) => {
        for (let data of dataTrainList) {
            data.p += data.v;
            if (data.p >= 1) data.p -= 1;
            if (data.p < 0) data.p += 1;
            // 停止、加速処理

            // 丁寧な、停止、加速
            let brakeR = 150.0;
            if (data.actState == "stop") {
                if (data.stopCnt > 0) {
                    data.stopCnt -= 1;
                    // bskip = true;
                    continue;
                } else {
                    data.actState = "accForce";
                }
            } else {
                if (data.vmax > 0) {
                    if ((data.actState == "accForce") || (data.actState == "acc")) {
                        // 加速
                        data.v += data.vmax*0.01;
                        if (data.v > data.vmax) {
                            data.v = data.vmax;
                            data.actState = "run";
                        } else if (data.v > data.vmax_) {
                            data.actState = "acc";
                        }
                    }
                    if ((data.actState == "run") || (data.actState == "acc"))  {
                        for (let pstop of data.stopList) {
                            let drest = pstop - data.p; // 停止位置までの距離
                            let brakingdist = brakeR*data.v; // 制動距離
                            if (drest >= 0 && drest <= brakingdist) {
                                data.actState = "brake";
                                data.pstopCur = pstop;
                                break;
                            }
                        }
                    }
                    if (data.actState == "brake") {
                        let drest = data.pstopCur - data.p; // 停止位置までの距離
                        if (drest < 0 || drest <= data.vmin) {
                            data.actState = "stop";
                            data.v = 0;
                            data.stopCnt = data.stopCntMax;
                        } else {
                            let brakingdist = brakeR*data.v; // 制動距離
                            if (drest <= brakingdist) {
                                data.v *= 0.99;
                                data.v = Math.max(data.v, data.vmin);
                            }
                        }
                    }
                } else {
                    if ((data.actState == "accForce") || (data.actState == "acc")) {
                        // 加速
                        data.v += data.vmax*0.01;
                        if (data.v < data.vmax) {
                            data.v = data.vmax;
                            data.actState = "run";
                        } else if (data.v < data.vmax_) {
                            data.actState = "acc";
                        }
                    }
                    if ((data.actState == "run") || (data.actState == "acc"))  {
                        for (let pstop of data.stopList) {
                            let drest = data.p - pstop; // 停止位置までの距離
                            let brakingdist = -brakeR*data.v; // 制動距離
                            if (drest >= 0 && drest <= brakingdist) {
                                data.actState = "brake";
                                data.pstopCur = pstop;
                                break;
                            }
                        }
                    }
                    if (data.actState == "brake") {
                        let drest = data.p - data.pstopCur; // 停止位置までの距離
                        if (drest < 0 || drest <= data.vmin) {
                            data.actState = "stop";
                            data.v = 0;
                            data.stopCnt = data.stopCntMax;
                        } else {
                            let brakingdist = -brakeR*data.v; // 制動距離
                            if (drest <= brakingdist) {
                                data.v *= 0.99;
                                data.v = Math.min(data.v, data.vmin);
                            }
                        }
                    }
                }
            }

            // p 位置に対する表示処理
            let v3p, v3p_ = data.path3d.getPointAt(data.p);
            let i = -1, p = data.p;
            for (let mesh of data.meshList) {
                ++i;
                p += data.pstep;
                if (p >= 1) { p -= 1;}
                if (p < 0) { p += 1;}
                v3p = data.path3d.getPointAt(p);
                let v3pc = (v3p.add(v3p_)).scale(0.5);
                mesh.position.copyFrom(v3pc);
                let vF = v3p.subtract(v3p_);
                // 進行方向に対する上方向を求める。外積を２回実施してvFに垂直上向きのベクトルを求める
                let v1 = vF.cross(BABYLON.Vector3.Up());
                let vU = v1.cross(vF).normalize();
                // 方向ベクトルからクォータニオンを作成
                mesh.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(vF, vU);
                mesh.lookAt(v3pc.add(vF)); // 不要と思ったけど念のため（周回またぎで安定した!?）
                // v3p を移動
                v3p_.copyFrom(v3p);
            }
        }
    });



    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == ' ' || kbInfo.event.key == 'Enter' || kbInfo.event.key == 'c' || kbInfo.event.key == 'v' || kbInfo.event.key == 'C') {

                if (kbInfo.event.key == 'Enter' || kbInfo.event.key == 'v' || kbInfo.event.key == 'C') {
                    icamera=(icamera+ncamera-1)%ncamera;
                } else {
                    icamera=(icamera+1)%ncamera;
                }
                changeCamera(icamera);
            }
            if (kbInfo.event.key >= '1' && kbInfo.event.key <= '8') {
                let icam = Number(kbInfo.event.key) -1;
                if (icamera == 10) {
                    icamera10 = icam;
                    changeViewportFor10(icamera10);
                }
            }
            if (kbInfo.event.key == 'x' || kbInfo.event.key == 'z') {
                if (kbInfo.event.key == 'x') {
                    imyMeshCandi = (imyMeshCandi+1) % myMeshCandiList.length;
                } else {
                    imyMeshCandi = (imyMeshCandi+myMeshCandiList.length-1) % myMeshCandiList.length;
                }
                myMesh = myMeshCandiList[imyMeshCandi];
                changeCamera(icamera);
            }
            if (kbInfo.event.key == 'n' || kbInfo.event.key == 'b') {
                if (kbInfo.event.key == 'n') {
                    istage = (istage+1) % nstage;
                } else {
                    istage = (istage+nstage-1) % nstage;
                }
                createStage(istage);
                changeCamera(icamera);
            }
            if (kbInfo.event.key == 'h') {
                changeUsageView();
            }
        }
    });

    // --------------------------------------------------
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // 左上に使い方（操作方法）を表示
    let guiUsageRect = new BABYLON.GUI.Rectangle();
    {
        guiUsageRect.adaptWidthToChildren = true;
        guiUsageRect.width = "320px";
        guiUsageRect.height = "200px";
        guiUsageRect.cornerRadius = 5;
        guiUsageRect.color = "Orange";
        guiUsageRect.thickness = 4;
        guiUsageRect.background = "green";
        guiUsageRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        guiUsageRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        guiUsageRect.zIndex=2;
        advancedTexture.addControl(guiUsageRect);    
        let grid = new BABYLON.GUI.Grid();
        grid.width = 0.98;
        grid.height = 0.98;
        grid.addRowDefinition(1);
        grid.addRowDefinition(22, true);
        guiUsageRect.addControl(grid); 
        // グリッド内の要素の登録
        {
            let text1 = new BABYLON.GUI.TextBlock();
            text1.text = "Usage:\n"
                +"(c/v)(space/enter) : Change camera\n"
                +"(1-8) : Change camera for 8-CAM\n"
                +"(x/z) : Change target\n"
                +"(n/b) : Change Stage\n"
                +"h     : Show/Hide this message";
            text1.color = "white";
            text1.width = "310px";
            text1.fontSize = 14;
            text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
            text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
            text1.paddingLeft = 12;
            grid.addControl(text1, 0, 0);
        }
        {
            let button = BABYLON.GUI.Button.CreateSimpleButton("but1", "Close");
            button.width = "120px";
            button.height = "30px";
            button.color = "white";
            button.fontSize = 16;
            button.background = "DarkGray";
            button.onPointerUpObservable.add(function() {
                guiUsageRect.isVisible = false;
            });
            grid.addControl(button, 1, 0);
        }
        guiUsageRect.isVisible = false;
    }
    var changeUsageView = function() {
        if (guiUsageRect.isVisible) {
            guiUsageRect.isVisible = false;
        } else {
            guiUsageRect.isVisible = true;
        }
    }

    // ------------------------------
    // メッセージ表示（数秒後にフェードアウト）
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Ready!";
    text2.color = "white";
    text2.fontSize = 24;
    text2.height = "36px";
    text2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    text2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    advancedTexture.addControl(text2);

    let clearText2 = function() {
        text2.text = "";
    }

    let setText2 = function(val) {
        text2.text = "" + val;
        setTimeout(clearText2, 10*1000); // 10[sec]
    }

    async function wait(second) {
	return new Promise(resolve => setTimeout(resolve, 1000 * second));
    }

    // ----------------------------------------
    // タイミングをあわせるための遅延
    await BABYLON.InitializeCSG2Async();

    createStage(istage);
    if (myMesh == null && myMeshCandiList.length > 0) {
        myMesh = myMeshCandiList[imyMeshCandi];
    }

    changeCamera(icamera);

    return scene;
}

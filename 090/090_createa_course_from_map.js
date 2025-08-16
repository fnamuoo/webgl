// 画像からのコースおこし
// - 3
//   - python 側で点列を調整
//     直線にならんだ点を｛適当に｝まびくと補間時／道路作成時に凸な面ができる
//     急なカーブになっているせい？点の配置を等間隔／等比級数にすればよいかもだが難しす
//     手動で配置した点列をそのまま使うことにする

// -4
//   - チューブの中をCNS でうごかすと、血管内をうごく細胞みたい
//
//   はたらく細胞　素材
//   https://hataraku-saibou.com/1st/special/content_download/
//
//   楕円にテクスチャ

// -5
//  - コースを凹に
//  - エージェントに移動方向の向きを付与
//  - デバッグ表示のメッシュがコースのアスファルトっぽい
//
//  - ゴーカート／カーレースっぽい

// -6
//   - 複数のチェックポイントで、交差なコースも周回できるように

// -7
//   - 目的地の点列を複数用意して、複数の走行ラインを模してみる

// -11
//   - キャラクターコントローラーを追加（デフォ
// -12
//   - コースデータを別ファイル化
// -13
//   - キャラクターコントローラーに、アクセル、クイックターン 

// -14
//   - いったん全コースを一巡
//   - 開始時に進行方向を向くように


// - スクリーンインジケーター
//   - タコメータ
//   - スピードメーター
//
// - 順位
//   - 敵カーに順位／ゼッケン


//let goalPath ="textures/amiga.jpg";
let goalPath ="../078/textures/amiga.jpg";


// for local
const SCRIPT_URL1 = "./CourseData.js";
// // for local
// const SCRIPT_URL1 = "../075/Maze.js";
// for PlayGround
// const SCRIPT_URL1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";
let CourseData = null;
import(SCRIPT_URL1).then((obj) => { CourseData = obj; console.log("CourseData=",obj); });

const R90 = Math.PI/2;


var createScene = async function () {
    await BABYLON.InitializeCSG2Async();

    const metaStageInfo = {
        100101:{label:"GT5_Circuit_High_Speed_Ring_Fwd",
                iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -50, nz: 800, stageType:'tube', debugMesh: 0,
                dtype:"xz",
                data: CourseData.DATA.HighSpeedRing.xz,
               },
        100102:{label:"GT5_Circuit_High_Speed_Ring_Fwd",
                iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -50, nz: 800, stageType:'extrude', debugMesh: 1, cnsNAgent:10, cnsSpeedX:10,
                dtype:"xz",
                data: CourseData.DATA.HighSpeedRing.xz,
               },
        100103:{label:"GT5_Circuit_High_Speed_Ring_Fwd",
                iy: 2, iystep: 0, scale: 0.2, adjx: -50, adjz: -50, nz: 800, stageType:'extrude', gardW:5, gardH:1, debugMesh: 1, cnsNAgent:10, cnsSpeedX:2.0,
                dtype:"xz",
                data: CourseData.DATA.HighSpeedRing.xz,
               },
        100111:{label:"GT5_Circuit_High_Speed_Ring_Fwd(2)",
                iy: 2, scale: 0.1, adjx: -50, adjz: -50, nz: 800, stageType:'ribbon', debugMesh: 1,
                dtype:"xzy",
                data: CourseData.DATA.HighSpeedRing.xzy,
               },
        100112:{label:"GT5_Circuit_High_Speed_Ring_Fwd(3)",
                iy: 2, scale: 0.1, adjx: -50, adjz: -50, nz: 800, stageType:'ribbon', debugMesh: 1,
                dtype:"xzy",
                data: CourseData.DATA.HighSpeedRing.xzy2,
               },

        900101:{label:"GT5_Circuit_High_Speed_Ring_Fwd",
                iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -50, nz: 800, stageType:'tube', debugMesh: 0,
                dtype:"xz",
                data: CourseData.DATA.HighSpeedRing.xz,
               },
        900102:{label:"GT5_Circuit_High_Speed_Ring_Fwd",
                iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -50, nz: 800, stageType:'extrude', debugMesh: 1, cnsNAgent:10, cnsSpeedX:10,
                dtype:"xz",
                data: CourseData.DATA.HighSpeedRing.xz,
               },
        900103:{label:"GT5_Circuit_High_Speed_Ring_Fwd",
                iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -50, nz: 800, stageType:'ribbon', debugMesh: 1, cnsNAgent:10, cnsSpeedX:10,
                dtype:"xz",
                data: CourseData.DATA.HighSpeedRing.xz,
               },

        900121:{label:"GT5_Circuit_High_Speed_Ring_Fwd(2)",
                iy: 2, iystep: 1.0, scale: 0.1, adjx: -50, adjz: -50, nz: 800, stageType:'ribbon', debugMesh: 1,
                dtype:"xz",
                data: CourseData.DATA.HighSpeedRing.xz,
               },
        900122:{label:"GT5_Circuit_High_Speed_Ring_Fwd(2)",
                iy: 2, scale: 0.1, adjx: -50, adjz: -50, nz: 800, stageType:'ribbon', debugMesh: 1,
                dtype:"xzy",
                data: CourseData.DATA.HighSpeedRing.xzy,
               },

        // 100202:{label:"GT5_Circuit_Autumn_Ring",
        //         iy: 2, iystep: 0, scale: 0.1, adjx: -60, adjz: -40, nz: 800, stageType:'extrude_plane', debugMesh: 1, pQdbg:1,
        //         dtype:"xz",
        //         data : CourseData.DATA.AutumnRing.xz,
        //         pQlist: CourseData.DATA.AutumnRing.pq,
        //        },
        // 100211:{label:"GT5_Circuit_Autumn_Ring",
        //         scale: 0.1, adjx: -70, adjy: 0, adjz: -40, nz: 800, stageType:'ribbon', debugMesh: 1, pQdbg:1,
        //         dtype:"xzy",
        //         data : CourseData.DATA.AutumnRing.xzy,
        //         pQlist: CourseData.DATA.AutumnRing.pq,
        //        },
        // 100212:{label:"GT5_Circuit_Autumn_Ring",
        //         scale: 0.2, adjx: -70, adjy: 0, adjz: -40, nz: 800, stageType:'ribbon', sW:10, guideH:1.2, debugMesh: 1, cnsNAgent:10,cnsSpeedX:2.0,
        //         dtype:"xzy",
        //         data : CourseData.DATA.AutumnRing.xzy,
        //         pQlist: CourseData.DATA.AutumnRing.pq,
        //        },

        // 100301:{label:"GT5_circuit_Cote_d'Azur",
        //         iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -30, nz: 800, stageType:'extrude_plane', debugMesh: 1,
        //         dtype:"xz",
        //         data : CourseData.DATA.CotedAzur.xz,
        //        },
        // 100311:{label:"GT5_circuit_Cote_d'Azur",
        //         iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -30, nz: 800, stageType:'ribbon', debugMesh: 1,
        //         dtype:"xzy",
        //         data : CourseData.DATA.CotedAzur.xzy,
        //        },
        // 100312:{label:"GT5_circuit_Cote_d'Azur",
        //         iy: 2, iystep: 0, scale: 0.5, adjx: -50, adjz: -30, nz: 800, stageType:'ribbon', sW:10, guideH:1.2, debugMesh: 1, cnsNAgent:10,cnsSpeedX:2.0,
        //         dtype:"xzy",
        //         data : CourseData.DATA.CotedAzur.xzy,
        //        },

        100401:{label:"GT5_circuit_Suzuka",
                iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -30, nz: 800, stageType:'extrude_plane', debugMesh: 1,
                dtype:"xz",
                data : CourseData.DATA.Suzuka.xz,
               },
        100411:{label:"GT5_circuit_Suzuka",
                iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -30, nz: 800, stageType:'ribbon', sW: 2, debugMesh: 1,
                dtype:"xzy",
                data : CourseData.DATA.Suzuka.xzy,
               },
        100412:{label:"GT5_circuit_Suzuka",
                iy: 2, iystep: 0, scale: 0.5, adjx: -50, adjz: -30, nz: 800, stageType:'ribbon', sW: 10, guideH:1.2, debugMesh: 1, cnsCS:0.5, cnsNAgent:10,cnsSpeedX:2.4,
                dtype:"xzy",
                data : CourseData.DATA.Suzuka.xzy,
               },

        900401:{label:"GT5_circuit_Suzuka",
                iy: 2, iystep: 0, scale: 0.1, adjx: -50+18, adjz: -30-12, nz: 800, stageType:'ribbon', debugMesh: 1, pQdbg:1,
                dtype:"xz",
                data : CourseData.DATA.Suzuka.xz,
               },
        900402:{label:"GT5_circuit_Suzuka",
                iy: 2, iystep: 0, scale: 0.3, adjx: -50-45, adjz: -30-100, nz: 800, stageType:'ribbon', debugMesh: 1, pQdbg:1,
                dtype:"xz",
                data : CourseData.DATA.Suzuka.xz,
               },
        900403:{label:"GT5_circuit_Suzuka",
                iy: 2, iystep: 0, scale: 0.1, adjx: -50+18, adjz: -30-12, nz: 800, stageType:'ribbon', sW:1, debugMesh: 1, pQdbg:1,
                dtype:"xz",
                data : CourseData.DATA.Suzuka.xz,
               },
        900404:{label:"GT5_circuit_Suzuka",
                iy: 2, iystep: 0, scale: 0.1, adjx: -50+18, adjz: -30-12, nz: 800, stageType:'ribbon', debugMesh: 1, pQdbg:1,
                dtype:"xz",
                data : CourseData.DATA.Suzuka_new.xz,
               },

        // // 900431:{label:"GT5_circuit_Suzuka",
        // //         iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -30, nz: 800, stageType:'ribbon', sW: 2, debugMesh: 1, pQdbg:1,
        // //         dtype:"xzy",
        // //         data : CourseData.DATA.Suzuka.xzy,
        // //        },
        // // 900432:{label:"GT5_circuit_Suzuka",
        // //         iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -30, nz: 800, stageType:'ribbon', sW: 2, debugMesh: 1, pQdbg:1,
        // //         dtype:"xzy",
        // //         data : CourseData.DATA.Suzuka.xzy,
        // //        },


        100501:{label:"mm2024_00_zenkoku__MM2024RT",
                iy: 2, iystep: 0, scale: 0.05, adjx: -80, adjz: -30, nz: 1200, stageType:'extrude_plane', sW:1.8, debugMesh:1, pQdbg:1,//  pQdiv:6,
                dtype:"xz",
                data : CourseData.DATA.mm2024_00_zenkoku.xz,
                pQlist: CourseData.DATA.mm2024_00_zenkoku.pq,
               },
        100502:{label:"mm2024_00_zenkoku__MM2024RT",
                iy: 2, iystep: 0, scale: 0.05, adjx: -80, adjz: -30, nz: 1200, stageType:'ribbon', sW:1.5, debugMesh: 1, pQdbg:0, // pQdiv:6,
                dtype:"xz",
                data : CourseData.DATA.mm2024_00_zenkoku.xz,
                pQlist: CourseData.DATA.mm2024_00_zenkoku.pq,
               },
        100511:{label:"mm2024_00_zenkoku__MM2024RT",
                iy: 2, iystep: 0, scale: 0.05, adjx: -80, adjz: -30, nz: 1200, stageType:'ribbon', sW:1.8, debugMesh: 1, pQdbg:0, // pQdiv:6,
                dtype:"xzy",
                data : CourseData.DATA.mm2024_00_zenkoku.xzy,
                pQlist: CourseData.DATA.mm2024_00_zenkoku.pq,
               },
        100512:{label:"mm2024_00_zenkoku__MM2024RT",
                iy: 2, iystep: 0, scale: 0.2, scaleY: 2, adjx: -80, adjz: -30, nz: 1200, stageType:'ribbon', sW: 7, guideH:1.6, debugMesh: 1, cnsCS:0.2, cnsNAgent:10,cnsSpeedX:2.2, // sW:1.8, debugMesh: 1, pQdbg:0,
                dtype:"xzy",
                data : CourseData.DATA.mm2024_00_zenkoku.xzy,
                pQlist: CourseData.DATA.mm2024_00_zenkoku.pq,
               },

        100601:{label:"mm2024_04_tyubu__MM2024_chubu_RT",
                iy: 2, iystep: 0, scale: 0.05, adjx: -90, adjz: 0, nz: 1200, stageType:'extrude_plane', sW:1.8, debugMesh:1, pQdbg:1,//  pQdiv:6,
                dtype:"xz",
                data : CourseData.DATA.mm2024_04_tyubu.xz,
                pQlist: CourseData.DATA.mm2024_04_tyubu.pq,
               },
        100602:{label:"mm2024_04_tyubu__MM2024_chubu_RT",
                iy: 2, iystep: 0, scale: 0.05, adjx: -90, adjz: 0, nz: 1200, stageType:'ribbon', sW:1.8, debugMesh:1, pQdbg:0,//  pQdiv:6,
                dtype:"xz",
                data : CourseData.DATA.mm2024_04_tyubu.xz,
                pQlist: CourseData.DATA.mm2024_04_tyubu.pq,
               },
        100611:{label:"mm2024_04_tyubu__MM2024_chubu_RT",
                iy: 2, iystep: 0, scale: 0.05, adjx: -90, adjz: 0, nz: 1200, stageType:'ribbon', sW:1.8, debugMesh:1, pQdbg:1,//  pQdiv:6,
                dtype:"xzy",
                data : CourseData.DATA.mm2024_04_tyubu.xzy,
                pQlist: CourseData.DATA.mm2024_04_tyubu.pq,
               },
        100612:{label:"mm2024_04_tyubu__MM2024_chubu_RT",
                iy: 2, iystep: 0, scale: 0.2, scaleY: 2, adjx: -90, adjz: 0, nz: 1200, stageType:'ribbon', sW: 7, guideH:1.6, debugMesh: 1, cnsCS:0.2, cnsNAgent:10,cnsSpeedX:2.3, // sW:1.8, debugMesh:1, pQdbg:1,
                dtype:"xzy",
                data : CourseData.DATA.mm2024_04_tyubu.xzy,
                pQlist: CourseData.DATA.mm2024_04_tyubu.pq,
               },

        900641:{label:"mm2024_04_tyubu__MM2024_chubu_RT",
                iy: 2, iystep: 0.2, scale: 0.2, scaleY: 2, adjx: -215, adjz: 5, nz: 1200, stageType:'ribbon', sW: 7, guideH:1.6, debugMesh: 1, cnsCS:0.2, cnsNAgent:10,cnsSpeedX:2.3, debugMesh:1, pQdbg:1,
                dtype:"xz",
                data : CourseData.DATA.mm2024_04_tyubu.xz,
                pQlist: CourseData.DATA.mm2024_04_tyubu.pq,
               },
        900642:{label:"mm2024_04_tyubu__MM2024_chubu_RT",
                iy: 2, iystep: 0.2, scale: 0.2, scaleY: 2, adjx: -215, adjz: 5, nz: 1200, stageType:'ribbon', sW: 7, guideH:1.6, debugMesh: 1, cnsCS:0.2, cnsNAgent:10,cnsSpeedX:2.3, debugMesh:1, pQdbg:1,
                dtype:"xz_",
                data : 
                [

[340, 982],
[339, 712],
[397, 653],
[688, 654],
[806, 653],
[922, 652],
[985, 653],
[1048, 652],
[1137, 639],
[1227, 624],
[1346, 625],
[1429, 625],
[1565, 626],
[1636, 625],
[1702, 625],
[1779, 626],
[1844, 625],
[1959, 626],
[2023, 626],
[2085, 626],
[2142, 626],
[2200, 625],
[2277, 626],
[2371, 639],
[2464, 653],
[2610, 652],
[2705, 653],
[2820, 653],
[2934, 651],
[3030, 701],
[3042, 819],
[3074, 937],
[3109, 1000],
[3099, 1078],
[3086, 1146],
[3111, 1204],
[3133, 1278],
[3108, 1344],
[3087, 1401],
[3099, 1465],
[3111, 1544],
[3079, 1605],
[3043, 1664],
[3047, 1734],
[3027, 1847],
[2935, 1891],
[2700, 1892],
[2615, 1857],
[2581, 1775],
[2606, 1702],
[2642, 1671],
[2696, 1657],
[2774, 1615],
[2777, 1525],
[2764, 1477],
[2778, 1432],
[2787, 1393],
[2775, 1345],
[2763, 1301],
[2778, 1255],
[2787, 1213],
[2775, 1170],
[2765, 1128],
[2776, 1080],
[2788, 1039],
[2777, 995],
[2764, 951],
[2778, 903],
[2780, 825],
[2698, 771],
[2609, 772],
[2524, 810],
[2492, 891],
[2491, 1029],
[2493, 1156],
[2403, 1243],
[2168, 1243],
[2056, 1321],
[2001, 1360],
[1924, 1361],
[1857, 1360],
[1812, 1361],
[1739, 1402],
[1730, 1479],
[1773, 1561],
[1821, 1622],
[1867, 1665],
[1922, 1704],
[1985, 1737],
[2057, 1761],
[2119, 1771],
[2168, 1775],
[2228, 1718],
[2168, 1655],
[2099, 1649],
[2017, 1623],
[1957, 1586],
[1932, 1534],
[1964, 1487],
[2027, 1490],
[2164, 1537],//100
[2284, 1539],
[2404, 1538],
[2463, 1596],
[2464, 1718],
[2417, 1832],
[2288, 1892],
[2168, 1893],
[1951, 1851],
[1782, 1748],
[1715, 1681],
[1657, 1597],
[1615, 1507],
[1588, 1407],
[1577, 1303],
[1578, 1252],
[1579, 1188],
[1573, 1160],
[1548, 1133],
[1469, 1089],
[1393, 1045],
[1311, 999],
[1283, 950],
[1313, 897],
[1375, 861],
[1473, 803],
[1527, 776],
[1581, 781],
[1608, 822],
[1601, 854],
[1584, 877],
[1558, 910],
[1548, 949],
[1576, 1011],
[1636, 1037],
[1696, 1014],
[1725, 952],
[1720, 919],
[1689, 878],
[1671, 853],
[1666, 828],
[1722, 771],
[1786, 771],
[1840, 816],
[1820, 878],
[1786, 929],
[1798, 995],
[1872, 1036],
[1946, 997],
[1960, 934],
[1928, 878],
[1907, 805],
[1957, 771],
[2081, 772],
[2199, 771],
[2255, 829],
[2197, 890],
[2107, 931],
[2078, 1007],
[2059, 1052],
[2021, 1067],
[1933, 1104],
[1902, 1184],
[1886, 1225],
[1843, 1243],
[1676, 1243],
[1464, 1243],
[1284, 1243],
[1173, 1243],
[1085, 1243,36],
[1068, 1243,36.08],//
[1056, 1243,36.12],
[1040, 1243,36.15],
[1016, 1243,36.2],
[993, 1243],
[968, 1243],
[949, 1243],
[919, 1243],
[889, 1243],
[856, 1243],
[824, 1243],//
[797, 1243],
[764, 1243],
[688, 1243],
[580, 1295],
[544, 1386],
[574, 1478],
[685, 1538],
[739, 1538],
[762, 1538],
[807, 1539],//
[856, 1539],
[916, 1538],
[948, 1538],
[967, 1539],
[997, 1538],
[1035, 1538],
[1067, 1538],
[1086, 1538],
[1099, 1538],
[1115, 1538],//200
[1127, 1539],
[1169, 1538],
[1218, 1538],
[1262, 1553],
[1284, 1599],
[1267, 1636],
[1218, 1656],
[1157, 1656],
[1133, 1656],
[1107, 1655],
[1083, 1656],
[1068, 1656],
[1056, 1657],
[1036, 1657],
[1014, 1657],
[966, 1656],
[948, 1656],
[885, 1657],
[811, 1657],
[766, 1634],
[751, 1598],
[752, 1480],
[777, 1407],
[864, 1360],
[948, 1361],
[966, 1361],
[1003, 1361],
[1028, 1361],
[1045, 1361],
[1068, 1361],
[1085, 1361],
[1100, 1361],
[1113, 1361],
[1141, 1361],
[1180, 1361],
[1242, 1361],
[1282, 1361],
[1414, 1419],
[1462, 1536],
[1461, 1716],
[1427, 1798],
[1364, 1858],
[1284, 1892],
[1165, 1892],
[1099, 1864],
[1075, 1804],
[1076, 1734],
[1077, 1695],
[1077, 1591],
[1077, 1501],
[1076, 1469],
[1076, 1430],
[1076, 1394],
[1076, 1328],
[1077, 1301],
[1077, 1206],
[1077, 1168],
[1077, 1097],
[1093, 1055],
[1135, 1037],
[1177, 1021],
[1194, 979],
[1146, 856],
[1014, 801],
[893, 850],
[838, 978],
[853, 1016],
[898, 1038],
[944, 1057],
[957, 1097],
[958, 1168],
[958, 1302],
[958, 1428],
[957, 1471],
[957, 1593],
[958, 1733],
[957, 1805],
[933, 1864],
[871, 1891],
[780, 1893],
[702, 1881],
[605, 1867],
[510, 1879],
[428, 1892],
[365, 1866],
[340, 1804],
[338, 1683],
[337, 1564]
],


                pQlist: CourseData.DATA.mm2024_04_tyubu.pq,
               },

        100701:{label:"mm2024_08_knasai__MM2024_kansai_RT",
                iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -40, nz: 800, stageType:'extrude_plane', sW:1.8, cnsReachRadius:1, debugMesh:1, pQdbg:1,//  pQdiv:6,
                dtype:"xz",
                data : CourseData.DATA.mm2024_08_knasai.xz,
                pQlist: CourseData.DATA.mm2024_08_knasai.pq,
               },
        100711:{label:"mm2024_08_knasai__MM2024_kansai_RT",
                iy: 2, iystep: 0, scale: 0.1, adjx: -50, adjz: -40, nz: 800, stageType:'ribbon', sW:1.8, debugMesh:1, pQdbg:0,//  pQdiv:6,
                dtype:"xzy",
                data : CourseData.DATA.mm2024_08_knasai.xzy,
                pQlist: CourseData.DATA.mm2024_08_knasai.pq,
               },
        100712:{label:"mm2024_08_knasai__MM2024_kansai_RT",
                scale: 0.1, adjx: -50, adjy: 2, adjz: -40, nz: 800, stageType:'tube', sW:1.8, debugMesh:0, pQdbg:0,//  pQdiv:6,
                dtype:"xzy",
                data : CourseData.DATA.mm2024_08_knasai.xzy,
                pQlist: CourseData.DATA.mm2024_08_knasai.pq,
               },
        100713:{label:"mm2024_08_knasai__MM2024_kansai_RT",
                iy: 2, iystep: 0, scale: 0.5, scaleY: 2, adjx: -50, adjz: -40, nz: 800, stageType:'ribbon', sW: 10, guideH:1.8, debugMesh: 1, cnsCS:0.3, cnsNAgent:10,cnsSpeedX:2.5,
                dtype:"xzy",
                data : CourseData.DATA.mm2024_08_knasai.xzy,
                pQlist: CourseData.DATA.mm2024_08_knasai.pq,
               },

        100801:{label:"GT4_circuit_Motegi_Super_Speedway",
                iy: 2, iystep: 0, scale: 0.1, adjx: -60, adjz: -30, nz: 800, stageType:'extrude_plane', sW:3, cnsReachRadius:1, debugMesh:1, pQdbg:0, cnsNAgent:10, cnsSpeedX:10,
                dtype:"xz",
                data : CourseData.DATA.MotegiSuperSpeedway.xz,
               },

        100901:{label:"GT5_circuit_Daytona_Speedway",
                iy: 2, iystep: 0, scale: 0.1, adjx: -40, adjz: -40, nz: 800, stageType:'extrude_plane', sW:10, cnsReachRadius:10, cnsRadius:3, cnsCollisionQueryRange:2, cnsSeparationWeight:100, debugMesh:1, pQdbg:0, cnsNAgent:10, cnsSpeedX:2, 
                dtype:"xz",
                data : CourseData.DATA.DaytonaSpeedway.xz,
                xzRoutes :[
                    CourseData.DATA.DaytonaSpeedway.lines1,
                    CourseData.DATA.DaytonaSpeedway.lines2,
                    CourseData.DATA.DaytonaSpeedway.lines3
                ],
               },
        100902:{label:"GT5_circuit_Daytona_Speedway",
                iy: 0.2, iystep: 0, scale: 0.2, adjx: -40, adjz: -40, nz: 800, stageType:'ribbon', sW:10, guideH:1.8, cnsReachRadius:10, cnsRadius:3, cnsCollisionQueryRange:2, cnsSeparationWeight:100, debugMesh:1, cnsNAgent:8, cnsSpeedX:2.5, 
                dtype:"xz",
                data : CourseData.DATA.DaytonaSpeedway.xz,
                // xzRoutes :[
                //     CourseData.DATA.DaytonaSpeedway.lines1,
                //     CourseData.DATA.DaytonaSpeedway.lines2,
                //     CourseData.DATA.DaytonaSpeedway.lines3
                // ],
               },
    };

    var getMetaStageInfo = function (istage) {
        const i2id = {
            0:100101, // HighSpeed
            1:100102,
            21:100103,
            2:100111,
            3:100112,

            901:900101, // tube
            902:900102, // extrude
            903:900103, // ribbon

            921:900121, // ribbon

            // // 4:100201,
            // 4:100202,
            // 5:100211,
            // 22:100212,

            // 6:100301,
            // 7:100311,
            // 23:100312,

            8:100401,
            9:100411,
            24:100412,

            911:900401, // からまった感じ
            912:900402, // スケールを大きく(x3)
            913:900403, // 道を小さく(sW=1 <= def=3
            914:900404, // new

            // // 931:900431,
            // // 932:900432,


            10:100501,
            11:100502,
            12:100511,
            25:100512,

            13:100601,
            14:100602,
            15:100611,
            26:100612,
941:900641,
942:900642,

            16:100701,
            17:100711,
            18:100712, // xx
            27:100713,

            19:100801,

            20:100901,
            28:100902,
        }

        let id = i2id[istage];
        return metaStageInfo[id];
    }

//    let istage = 901; // tube
//    let istage = 902; // extrude
//    let istage = 903; //  ribbon

//    let istage = 911; //
//    let istage = 912; //
//    let istage = 913; //
//    let istage = 914; //

    let istage = 921;
//    let istage = 922; //

// // //    let istage = 14;
// // //    let istage = 931;
// // //    let istage = 932;

//    let istage = 941;
//    let istage = 942;


    // --------------------------------------------------

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(2, 5,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    // // for 941, 942
    // var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(2, 75,-10), scene);
    // camera.setTarget(new BABYLON.Vector3(0, 70, 0));

    // // // var camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(2, 225,-50), scene);
    // // // camera.setTarget(new BABYLON.Vector3(0, 100,0));
    camera.attachControl(canvas, true);

    // const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    // camera.rotationOffset = 180;
    // camera.radius = 10; // 3;
    // camera.heightOffset = 2; // 1.1;
    // camera.cameraAcceleration = 0.05; // 0.1;
    // camera.maxCameraSpeed = 30;
    // camera.attachControl(canvas, true);
    // camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    // let icamera = 0;

    const hk = new BABYLON.HavokPlugin(false);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);


    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    let meshAggInfo = []; // mesh, agg;
    // // let stageInfo = [];
    var createStage = function(istage) {
        while (meshAggInfo.length > 0) {
            let [mesh,agg] = meshAggInfo.pop();
            if (agg != null) { agg.dispose(); }
            mesh.dispose();
        }

        let metaStageInfo = getMetaStageInfo(istage)
        // // let iy = 1, scale = 0.1, adjx=-50, adjz=-50, nz = 800;
        // let iy = 1;
        // // let iy = 0.1, iystep = 0.02, scale = 0.02, adjx=-30, adjz=+10, nz = 1200;
        let iy = typeof(metaStageInfo.iy) !== 'undefined' ? metaStageInfo.iy : 0;
        let scale = typeof(metaStageInfo.scale) !== 'undefined' ? metaStageInfo.scale : 1;
        let scaleY = typeof(metaStageInfo.scaleY) !== 'undefined' ? metaStageInfo.scaleY : 1;
        let adjx = typeof(metaStageInfo.adjx) !== 'undefined' ? metaStageInfo.adjx : 0;
        let adjy = typeof(metaStageInfo.adjy) !== 'undefined' ? metaStageInfo.adjy : 0;
        let adjz = typeof(metaStageInfo.adjz) !== 'undefined' ? metaStageInfo.adjz : 0;
        let nz = typeof(metaStageInfo.nz) !== 'undefined' ? metaStageInfo.nz : 0;
        let pQdiv = typeof(metaStageInfo.pQdiv) !== 'undefined' ? metaStageInfo.pQdiv : 0;
        let pQlist = typeof(metaStageInfo.pQlist) !== 'undefined' ? metaStageInfo.pQlist : [];
        let xzRoutes = typeof(metaStageInfo.xzRoutes) !== 'undefined' ? metaStageInfo.xzRoutes : [];
        let pQdbg = typeof(metaStageInfo.pQdbg) !== 'undefined' ? metaStageInfo.pQdbg : 0;
        let nbPoints = typeof(metaStageInfo.nbPoints) !== 'undefined' ? metaStageInfo.nbPoints : 20;
        let cnsCS = typeof(metaStageInfo.cnsCS) !== 'undefined' ? metaStageInfo.cnsCS : 0.1;
        let cnsRadius = typeof(metaStageInfo.cnsRadius) !== 'undefined' ? metaStageInfo.cnsRadius : 0.8;
        let cnsReachRadius = typeof(metaStageInfo.cnsReachRadius) !== 'undefined' ? metaStageInfo.cnsReachRadius : 2;
        let cnsNAgent = typeof(metaStageInfo.cnsNAgent) !== 'undefined' ? metaStageInfo.cnsNAgent : 3;
        let cnsSpeedX = typeof(metaStageInfo.cnsSpeedX) !== 'undefined' ? metaStageInfo.cnsSpeedX : 1;
        let cnsCollisionQueryRange = typeof(metaStageInfo.cnsCollisionQueryRange) !== 'undefined' ? metaStageInfo.cnsCollisionQueryRange : 0.5;
        let cnsSeparationWeight = typeof(metaStageInfo.cnsSeparationWeight) !== 'undefined' ? metaStageInfo.cnsSeparationWeight : 3;

        let grndMesh = BABYLON.MeshBuilder.CreateGround("ground", {width:200, height:200}, scene);
        // let agg = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
        grndMesh.material = new BABYLON.GridMaterial("", scene);
        grndMesh.material.majorUnitFrequency = 10;
        grndMesh.material.minorUnitVisibility  = 0.7;
        // 地面に摩擦係数、反射係数を設定する
        let grndAgg = new BABYLON.PhysicsAggregate(grndMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);
        meshAggInfo.push([grndMesh,grndAgg]);

        let plist = [];
        let pRouteList = [];
        if(metaStageInfo.dtype=='xz') {
            // 画像から抜き出した座標をそのまま使う版
            let iystep = metaStageInfo.iystep;
            for (let [ix,iz] of metaStageInfo.data) {
                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                iy += iystep;
            }
            if (xzRoutes.length > 0) {
//console.log("xzRoutes=",xzRoutes);
//console.log("xzRoutes.length=",xzRoutes.length);
                for (let xzline of xzRoutes) {
//console.log("  xzline=",xzline);
//console.log("  xzline.length=",xzline.length);
                    plist_ = [];
                    for (let [ix,iz] of xzline) {
                        plist_.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                        iy += iystep;
                    }
                    pRouteList.push(plist_);
                }
            }
        } else if(metaStageInfo.dtype=='xz_') {
            // 画像から抜き出した座標をそのまま使う版
            let iystep = metaStageInfo.iystep;
            for (let tmp of metaStageInfo.data) {
                if (tmp.length == 2) {
                    let [ix,iz] = tmp;
                    plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                    iy += iystep;
                } else if (tmp.length == 3) {
                    let [ix,iz,iy_] = tmp;
                    if (iy_ == null) {
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                        iy += iystep;
                    } else {
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy_*scaleY+adjy, (nz-iz)*scale+adjz));
                        iy = iy_ + iystep;
                    }
                } else if (tmp.length == 4) {
                    let [ix,iz,iy_, is] = tmp;
                    iystep = is;
                    if (iy_ == null) {
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
                        iy += iystep;
                    } else {
                        plist.push(new BABYLON.Vector3(ix*scale+adjx, iy_*scaleY+adjy, (nz-iz)*scale+adjz));
                        iy = iy_ + iystep;
                    }
                }
            }
        } else if(metaStageInfo.dtype=='xzy') {
            // 高さを手動で指定した版
            for (let [ix,iz,iy] of metaStageInfo.data) {
                plist.push(new BABYLON.Vector3(ix*scale+adjx, iy*scaleY+adjy, (nz-iz)*scale+adjz));
            }
        }

        if (1) {
            let meshes = [];
            //let nbPoints = 20; // 10;
            // 上記で取得した点列を、スプラインで補間
            // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, plist.length, true);
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
            const plist2 = catmullRom.getPoints();
            // // 補間した点群を線分で表示
            // const arcLine = BABYLON.MeshBuilder.CreateLines("arc", {points: plist2})
            // arcLine.color = BABYLON.Color3.Yellow();
            // //  meshAggInfo.push([arcLine,null]);
            // //  // stageInfo.push([arcLine,null]);
            //
            // 始点、２番目を末尾に追加／ループとする
            // 3D的なループにするには始点だけでは途切れるっぽいので２番目も
            let p0 = plist2[0];
            plist2.push(new BABYLON.Vector3(p0.x, p0.y, p0.z));
            p0 = plist2[1];
            plist2.push(new BABYLON.Vector3(p0.x, p0.y, p0.z));

            pStart = plist2[1].clone();
            pStart2 = plist2[3].clone();
            pGoal = plist2[plist2.length-1].clone();

            // エージェントの目的地
            let pQ = [];  // 単一ライン
            let pQQ = pRouteList; // 複数ライン
            if (pQlist.length > 0) {
//console.log("use pQlist");
                for (let i of pQlist) {
                    let id = i*nbPoints;
                    if (id >= plist2.length) continue;
                    pQ.push(plist2[id])
                }
            } else if (pQdiv==0) {
//console.log("use DEFAULT pQ");
                pQ.push(pStart);
                pQ.push(plist2[Math.floor(plist2.length/4)]);
                pQ.push(plist2[Math.floor(plist2.length/2)]);
                pQ.push(plist2[Math.floor(plist2.length/4*3)]);
            } else {
//console.log("use pQdiv=",pQdiv);
                let n = Math.min(plist2.length, pQdiv);
                let id, id_ = -1;
                for (let i = 0; i < n; ++i) {
                    id = Math.floor(plist2.length/n*i);
                    if (id_ != id) {
                        pQ.push(plist2[id]);
                    }
                    id_ = id;
                }
            }
//             if (pRouteList.length > 0) {
// console.log("xzRoutes.length=",xzRoutes.length);
//                 for (let line of xzRoutes) {
// console.log("line=",line);
//                     let plist_ = [];
//                     for (let i of line) {
//                         let id = i*nbPoints;
//                         if (id >= plist2.length) continue;
//                         plist_.push(plist2[id])
//                     }
//                     pQQ.push(plist_);
//                 }
//             }

            if (pQdbg) {
                // デバッグ表示、pQの位置を球で表示
console.log("plist2.length=",plist2.length, " 1/20=",Math.floor(plist2.length/20));
                let r = 1, c;
                if (pQlist.length > 0) {
                    for (let p of pQ) {
                        let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 1}, scene);
                        mesh.position = p.clone();
                        mesh.position.y += 1.5;
                    }
                }
                let nR = nbPoints*10;
                let nY = nbPoints;
//console.log("nR=",nR,", nY=",nY);
                for (let i = 0; i < plist2.length; ++i) {
                    if ((i%nR) == 0) {
                    //if ((i%200) == 0) {
                        r = 1.5;
                        c = BABYLON.Color3.Red();
                    } else if ((i%nY) == 0) {
                    // } else if ((i%20) == 0) {
                        r = 0.5;
                        c = BABYLON.Color3.Yellow();
                    } else {
                        // r = 0.2;
                        // c = BABYLON.Color3.Green();
                        continue;
                    }
                    let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: r}, scene);
                    mesh.position = plist2[i].clone();
                    mesh.position.y += 0.5; // r;
                    mesh.material = new BABYLON.StandardMaterial("mat");
                    mesh.material.emissiveColor = c;
                    mesh.material.alpha = 0.3;

                }
            }

            if (metaStageInfo.stageType=='tube') {
                // チューブで表示
                // let mesh = BABYLON.MeshBuilder.CreateTube("tube", {path: plist2, radius: 2, sideOrientation: BABYLON.Mesh.DOUBLESIDE, tessellation: 16}, scene);
                let mesh = BABYLON.MeshBuilder.CreateTube("tube", {path: plist2, radius: 2}, scene);
                mesh.material = new BABYLON.StandardMaterial("mat", scene);
                mesh.material.emissiveColor = BABYLON.Color3.Blue();
                mesh.material.wireframe = true;
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                // stageInfo.push(mesh);
                meshes.push(mesh);
            }

            if (metaStageInfo.stageType=='extrude') {
                // 矩形（凹）で表示
                let gardW = typeof(metaStageInfo.gardW) !== 'undefined' ? metaStageInfo.gardW : 1.5;
                let gardH = typeof(metaStageInfo.gardH) !== 'undefined' ? metaStageInfo.gardH : 0.5;
                // let tubeW12 = 1.5;  // これでも大きすぎる(急な角度だとメッシュが重なる)
                // // let tubeH = 0.5, tubeW12 = 1.5;  // これでも大きすぎる(急な角度だとメッシュが重なる)
                // // let tubeH = 0.1, tubeW12 = 0.5;  // これでも大きすぎる(急な角度だとメッシュが重なる)
                // // // let tubeH = 0.02, tubeW12 = 0.1;
                const myShape = [
                    new BABYLON.Vector3(-gardW,  gardH, 0),
                    new BABYLON.Vector3(-gardW,  0    , 0),
                    new BABYLON.Vector3( gardW,  0    , 0),
                    new BABYLON.Vector3( gardW,  gardH, 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true};
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                // stageInfo.push(mesh);
                meshes.push(mesh);
            }

            if (metaStageInfo.stageType=='extrude_plane') {
                // 線分／平面で表示
                let sW = typeof(metaStageInfo.sW) !== 'undefined' ? metaStageInfo.sW : 3;
                const sW_=sW/2;
                // let tubeH = 0.5, tubeW12 = 1.5;  // これでも大きすぎる(急な角度だとメッシュが重なる)
                // // let tubeH = 0.1, tubeW12 = 0.5;  // これでも大きすぎる(急な角度だとメッシュが重なる)
                // // // let tubeH = 0.02, tubeW12 = 0.1;
                const myShape = [
                    new BABYLON.Vector3(-sW_, 0, 0),
                    new BABYLON.Vector3( sW_, 0, 0)
                ];
                let options = {shape: myShape,
                               path: plist2, // points,
                               sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                               adjustFrame:true};
                let mesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:0.01}, scene);
                meshAggInfo.push([mesh,agg]);
                // stageInfo.push(mesh);
                meshes.push(mesh);
            }

            if (metaStageInfo.stageType=='ribbon') {
                // 個々の点で進行方向ベクトルをもとめ、水平方向をもとめ、水平位置の右側／左側の座標を求める
                let sW = typeof(metaStageInfo.sW) !== 'undefined' ? metaStageInfo.sW : 3;
                let guideH = typeof(metaStageInfo.guideH) !== 'undefined' ? metaStageInfo.guideH : 0.25;
                let p1 = plist2[0], p2=p1, v, v1, vR, vL, vC, pR, pL;
                // const sW = 3, sW_=sW/2;
                const sW_=sW/2;
                const qR = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), Math.PI/2);
                const qL = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), -Math.PI/2);
                v1 = BABYLON.Vector3.Zero;
                let plist3R = [], plist3L = [];
                for (let p of plist2) {
                    v = p.subtract(p1).normalize();
                    vR = v.applyRotationQuaternion(qR);
                    pR = p.add(vR.scale(sW_));
                    vL = v.applyRotationQuaternion(qL);
                    pL = p.add(vL.scale(sW_));
                    // ベクトル片の外積(vC.y)から（右／左）どちら向きかを判断し、曲がる方向に傾ける（高さを調整する）
                    vC = BABYLON.Vector3.Cross(v,v1);
                    // // if (Math.abs(vC.y) > 0.01) {
                    // //     pR.y += 0.5; // vC.y*10;
                    // //     pL.y -= 0.5; // vC.y*10;
                    // // }
                    // if (Math.abs(vC.y) > 0.001) {
                    //     pR.y += vC.y*1.5;
                    //     pL.y -= vC.y*1.5;
                    // }
                    if (Math.abs(vC.y) > 0.001) {
                        if (vC.y > 0) {
                            pR.y += vC.y*2.5;
                            pL.y -= -vC.y*1.5;
                        } else {
                            pR.y += -vC.y*1.5;
                            pL.y -= vC.y*2.5;
                        }
                    }
                    plist3R.push(pR);
                    plist3L.push(pL);
                    p2 = p1;
                    p1 = p;
                    v1 = v;
                }
                // // 各点列の末尾の中間点を最後に追加してガードを閉じる
                // let plast = plist3R[plist3R.length-1].add(plist3L[plist3L.length-1]).scale(0.5);
                // plist3R.push(plast);
                // plist3L.push(plast);
                // 始点は2点の差分だと中間値なので、捨てる
                plist3R.shift();
                plist3L.shift();
                // 周回するよう、始点を末尾に追加する
                let p3 = plist3R[0];
                plist3R.push(new BABYLON.Vector3(p3.x, p3.y, p3.z));
                p3 = plist3L[0];
                plist3L.push(new BABYLON.Vector3(p3.x, p3.y, p3.z));

                // 道の端のガード
                const guideR = 0.05, adjy=guideH;
                //const guideR = 0.05, adjy=0.25;
                let meshR = BABYLON.MeshBuilder.CreateTube("tube", {path: plist3R, radius: guideR, tessellation: 4}, scene);
                meshR.position.y += guideR+adjy;
                let aggR = new BABYLON.PhysicsAggregate(meshR, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
                meshR.material = new BABYLON.StandardMaterial("mat", scene);
                meshR.material.emissiveColor = BABYLON.Color3.Blue();
                meshAggInfo.push([meshR,aggR]);
                //stageInfo.push([meshR,aggR]);
                let meshL = BABYLON.MeshBuilder.CreateTube("tube", {path: plist3L, radius: guideR, tessellation: 4}, scene);
                meshL.position.y += guideR+adjy;
                let aggL = new BABYLON.PhysicsAggregate(meshL, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
                meshL.material = new BABYLON.StandardMaterial("mat", scene);
                meshL.material.emissiveColor = BABYLON.Color3.Red();
                meshAggInfo.push([meshL,aggL]);
                //stageInfo.push([meshL,aggL]);

                // 道の本体をribbonで作成する
                let mypath3 = [plist3R, plist3L];
                let mesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: mypath3, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
                // // // mesh.material = new BABYLON.StandardMaterial("mat");
                // // // mesh.material.diffuseTexture = new BABYLON.Texture("textures/floor.png", scene);
	        // mesh.material = new BABYLON.GridMaterial("mat", scene);
	        // mesh.material.majorUnitFrequency = 5;
	        // mesh.material.gridRatio = 0.5;
                // // mesh.material.wireframe = true;
                // // mesh.material = new BABYLON.StandardMaterial("roadMat", scene);
                // // mesh.material.diffuseTexture = new BABYLON.RoadProceduralTexture("roadTex", 512, scene);

                let agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
                meshAggInfo.push([mesh,agg]);
                // stageInfo.push([mesh,agg]);
                meshes.push(mesh);

                // pStart = plist2[1].clone();
                // pGoal = plist2[plist2.length-1].clone();
                // // vStart = new BABYLON.Vector3(plist2[1].x-plist2[0].x, plist2[1].y-plist2[0].y, plist2[1].z-plist2[0].z);
                vStart = new BABYLON.Vector3(plist[1].x-plist[0].x, plist[1].y-plist[0].y, plist[1].z-plist[0].z);

                {
                    let pQ1 = plist2[Math.floor(plist2.length/4)].clone();
                    // pQ.push(pQ1);
                    meshQ1 = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: sW}, scene);
                    meshQ1.position = pQ1.clone();
                    meshQ1.position.y += sW_/2;
                    // meshQ1.material = new BABYLON.CellMaterial("cell", scene);
                    meshQ1.material = new BABYLON.StandardMaterial("mat");
                    meshQ1.material.emissiveColor = BABYLON.Color3.Green();
                    meshQ1.material.alpha = 0.5;
                }
                {
                    let pQ2 = plist2[Math.floor(plist2.length/2)].clone();
                    // pQ.push(pQ2);
                    meshQ2 = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: sW}, scene);
                    meshQ2.position = pQ2.clone();
                    meshQ2.position.y += sW_/2;
                    // meshQ2.material = new BABYLON.CellMaterial("cell", scene);
                    meshQ2.material = new BABYLON.StandardMaterial("mat");
                    meshQ2.material.emissiveColor = BABYLON.Color3.Blue();
                    meshQ2.material.alpha = 0.5;
                }
                {
                    let pQ3 = plist2[Math.floor(plist2.length/4*3)].clone();
                    // pQ.push(pQ3);
                    meshQ3 = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: sW}, scene);
                    meshQ3.position = pQ3.clone();
                    meshQ3.position.y += sW_/2;
                    // meshQ3.material = new BABYLON.CellMaterial("cell", scene);
                    meshQ3.material = new BABYLON.StandardMaterial("mat");
                    meshQ3.material.emissiveColor = BABYLON.Color3.Yellow();
                    meshQ3.material.alpha = 0.5;
                }
                {
                    // ゴール地点のメッシュ
                    // pQ.push(pGoal);
                    meshGoal = BABYLON.MeshBuilder.CreateSphere("goal", { diameter: sW}, scene);
                    meshGoal.position = pGoal.clone();
                    meshGoal.position.y += sW_/2;
                    // meshGoal.material = new BABYLON.CellMaterial("cell", scene);
                    meshGoal.material = new BABYLON.StandardMaterial("mat");
                    meshGoal.material.diffuseTexture = new BABYLON.Texture(goalPath, scene);
                    // meshGoal.material.ambientColor = BABYLON.Color3.Black();
                    // meshGoal.material.emissiveColor = BABYLON.Color3.Black();
                    // meshGoal.material.diffuseColor = BABYLON.Color3.Black();
                    // meshGoal.material.specularColor = BABYLON.Color3.Black();
                    meshGoal.material.alpha = 0.8;
                }
            }

            // CNS
            var navmeshParameters = {
                cs: cnsCS, // 0.1,  // 歩行可能なナビメッシュのボクセルサイズ（幅、深さ
                ch: 0.2,  // ボクセルの高さ
                walkableSlopeAngle: 90,  // 歩行可能な最大傾斜の角度[度]
                walkableHeight: 3, // 10, // 3.0,  //  歩行が許可されるボクセル単位の高さ
                walkableClimb: 3, // 10, // 3, // 1,  // 登ることができるボクセル単位のデルタ
                walkableRadius: 3, // 1,  // エージェントのボクセル単位での半径
                maxEdgeLen: 12.,  // メッシュの境界に沿った輪郭エッジの最大許容長さ[ボクセル単位]
                maxSimplificationError: 1.3, // 境界エッジが元の生の輪郭から逸脱する最大距離[ボクセル単位]
                minRegionArea: 4, // 8,  // 孤立した島領域を形成できるセルの最小数[ボクセル単位]
                mergeRegionArea: 3, // 20,  // 領域結合の閾値。[ボクセル単位]
                maxVertsPerPoly: 6, // 輪郭線からポリゴンへの頂点の最大数(３以上)
                detailSampleDist: 6,  // 詳細メッシュ生成のサンプリング距離
                detailSampleMaxError: 1,  // 詳細メッシュ表面が高さフィールドの最大距離[ワールド単位]
                borderSize:1,
                tileSize:0, // 20 // タイルのサイズ def:0 :=障害物が機能しない
            };
            // // let maxAgents = 3, iniAgents = 3, restPop = maxAgents-iniAgents;
            // let maxAgents = 3, iniAgents = 3;
            let maxAgents = cnsNAgent, iniAgents = cnsNAgent;
            var agentParams = {
                radius: cnsRadius, // 0.8, // 0.1,  // エージェントの半径。[制限: >= 0]
                reachRadius: cnsReachRadius, // 2, // 0.3, // エージェントが目的地の周囲にこの半径の仮想円内に入ると、オブザーバーに通知されます。デフォルトはエージェントの半径です。
                height: 0.2, // エージェントの高さ。[制限: > 0]
                maxAcceleration: 4.0,  // 最大許容加速度。[制限: >= 0]
                maxSpeed: 1,  // 許容される最大速度。[制限: >= 0]
                collisionQueryRange: cnsCollisionQueryRange, // 0.5,  // ステアリング動作の対象となる衝突要素がどれだけ近い必要があるかを定義します。[制限: > 0]
                pathOptimizationRange: 10.0,  // パスの可視性の最適化範囲。[制限: > 0]
                separationWeight: cnsSeparationWeight // 3.0 // エージェント マネージャーがこのエージェントとの衝突を回避する際の積極性。[制限: >= 0]
            };
            let navigationPlugin = null, navmeshdebug = null, crowd = null, agentCubeList = [];
            let addAgent = function() {
//console.log("addAgent");
                var width = 0.8; // 0.50;
                var agentCube = BABYLON.MeshBuilder.CreateBox("cube", { size: width, height: width }, scene);
                // var matAgent = new BABYLON.StandardMaterial('mat2', scene);
                // var variation = Math.random();
                // matAgent.diffuseColor = new BABYLON.Color3(0.4 + variation * 0.6, 0.3, 1.0 - variation * 0.3);
                // agentCube.material = matAgent;
                agentCube.material = new BABYLON.StandardMaterial('mat2', scene);
                var randomPos = navigationPlugin.getRandomPointAround(new BABYLON.Vector3(20*Math.random()-10, 0.1, 5*Math.random()), 0.5);
                var transform = new BABYLON.TransformNode();
                agentCube.parent = transform;
                // agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(40,50);
                // agentParams.maxSpeed = BABYLON.Scalar.RandomRange(8,15);
                // agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(15,25);
                // agentParams.maxSpeed = BABYLON.Scalar.RandomRange(4,7);
                // agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(8,10);
                // agentParams.maxSpeed = BABYLON.Scalar.RandomRange(2,3);
                // agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(15,25);
                // agentParams.maxSpeed = BABYLON.Scalar.RandomRange(3,5);
                if (agentCubeList.length == 0) {
                    agentCube.material.diffuseColor = BABYLON.Color3.Red();
                    agentParams.maxAcceleration = 2.2; agentParams.maxSpeed = 4.6;
                    //agentParams.maxAcceleration = 62.2; agentParams.maxSpeed = 44.6;
                } else if (agentCubeList.length == 1) {
                    agentCube.material.diffuseColor = BABYLON.Color3.Green();
                    agentParams.maxAcceleration = 2.8; agentParams.maxSpeed = 4.3;
                    //agentParams.maxAcceleration = 62.8; agentParams.maxSpeed = 44.3;
                } else if (agentCubeList.length == 2) {
                    agentCube.material.diffuseColor = BABYLON.Color3.Blue();
                    agentParams.maxAcceleration = 5.8; agentParams.maxSpeed = 4.0;
                    //agentParams.maxAcceleration = 65.8; agentParams.maxSpeed = 44.0; // 3.7
                } else {
                    agentCube.material.diffuseColor = BABYLON.Color3.Random();
                    agentParams.maxAcceleration = BABYLON.Scalar.RandomRange(3.2,5.5);
                    agentParams.maxSpeed = BABYLON.Scalar.RandomRange(4.0,4.8);
                }
                agentParams.maxAcceleration *= cnsSpeedX;
                agentParams.maxSpeed *= cnsSpeedX;

                // ルート指定 -1:pQのみ  0>=:xzRoutesから一本選択
                agentCube.route = -1;
                // if (xzRoutes.length > 0) {
                //     agentCube.route = Math.floor(Math.random()*xzRoutes.length);
                // }
                if (pQQ.length > 0) {
                    agentCube.route = Math.floor(Math.random()*pQQ.length);
                }

                var agentIndex = crowd.addAgent(randomPos, agentParams, transform);
                agentCubeList.push(agentCube);
                return agentIndex;
            }

            let resetAllAgent = function(meshes, scene) {
//console.log("resetAllAgent", meshes.length);
                if (crowd != null) { crowd.dispose(); }
                if (navmeshdebug != null) { navmeshdebug.dispose(); }
                if (navigationPlugin != null) { navigationPlugin.dispose(); }
                while (agentCubeList.length > 0) { agentCubeList.pop().dispose(); };

                navigationPlugin = new BABYLON.RecastJSPlugin();
                navigationPlugin.createNavMesh(meshes, navmeshParameters);
                if (metaStageInfo.debugMesh) {
                    // デバッグ用のメッシュ
                    navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
                    navmeshdebug.position = new BABYLON.Vector3(0, 0.01, 0);

                    navmeshdebug.material = new BABYLON.StandardMaterial('matdebug', scene);;
                    // アスファルトっぽく黒く
                    navmeshdebug.material.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                    // // // navmeshdebug.material.diffuseColor = new BABYLON.Color3(0.1, 0.2, 1);
                    // // // navmeshdebug.material.alpha = 0.9;

                    meshAggInfo.push([navmeshdebug,null]);
                    // stageInfo.push([navmeshdebug,null]);
                }
                // crowd
                crowd = navigationPlugin.createCrowd(maxAgents, 0.1, scene);
                crowd._ag2dest = [];
                agentCubeList = [];
                for (let i = 0; i < iniAgents; ++i) {
                    let adID = addAgent();
                    resetAgent(adID);
                    crowd._ag2dest.push(1); // 目的地Q1を設定
                }
                // // エージェントの先頭と末尾にカメラを追跡させる

// if (0) {
// // https://scrapbox.io/babylonjs/Navigation_Mesh
// // Shark + 海バージョン
// // https://playground.babylonjs.com/#DP2SDJ#21


// // https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE%EF%BC%98%EF%BC%89
// // https://playground.babylonjs.com/?webgpu#3URR7V#421
//             // 向き更新（Y軸回転）
//             const cosA = matrices[mOff +  0];
//             const sinA = matrices[mOff +  2];
//             let yaw  = Math.atan2(sinA, cosA);
//             yaw = yaw + Math.PI / 2;
//             inst.rotation.set(0, yaw, 0);
// }

                crowd.onReachTargetObservable.add((agentInfos) => {
//console.log("onReachTargetObservable");
                    let agID = agentInfos.agentIndex;
                    let agentCube = agentCubeList[agID];
                    //        if (agID < ag2dest.length) {
                    if (agentCube.route < 0) {
                        let dest = crowd._ag2dest[agID];
                        if (dest == pQ.length-1) {
                            dest = 0;
                        } else {
                            ++dest;
                        }
                        // 次の目的地を設定
                        crowd._ag2dest[agID] = dest;
                        crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ[dest]));
                        // let p = pQ[dest];
                        // crowd.agentGoto(agID, navigationPlugin.getClosestPoint(new BABYLON.Vector3(p.x,p.y,p.z)));
                    } else {
                        let pQ_ = pQQ[agentCube.route];
                        let dest = crowd._ag2dest[agID];
                        if (dest == pQ_.length-1) {
                            dest = 0;
                        } else {
                            ++dest;
                        }
                        // 次の目的地を設定
                        crowd._ag2dest[agID] = dest;
                        crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ_[dest]));
                    }
                });

            }
            let resetAgent = function(agID) {
                // スタート地点にテレポート
                let agentCube = agentCubeList[agID];
                //        if (agID < ag2dest.length) {
                if (agentCube.route < 0) {
                    // 初期位置：スタート地点付近にテレポート
                    crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(pQ[0]));
                    // 目標位置：次の目標地点に
                    crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ[1]));
                } else {
                    let pQ_ = pQQ[agentCube.route];
                    crowd.agentTeleport(agID, navigationPlugin.getClosestPoint(pQ_[0]));
                    crowd.agentGoto(agID, navigationPlugin.getClosestPoint(pQ_[1]));
                }
            }

            // エージェントの移動速度から向きを変更する
            // // 参考
            // // https://scrapbox.io/babylonjs/Navigation_Mesh
            // // Shark + 海バージョン
            // https://playground.babylonjs.com/#DP2SDJ#21
            scene.onBeforeRenderObservable.add(() => {
                for (let i = 0; i < agentCubeList.length; i++) {
                    const meshAgent = agentCubeList[i];
                    {
                        // 移動方向と速度を取得
                        const vel = crowd.getAgentVelocity(i);
                        // 速度成分から角度をもとめ、方向とする
                        meshAgent.rotation.y = Math.atan2(vel.x, vel.z);
                    }
                }
            });

//            resetAllAgent(meshes, scene);

        }
    }

    createStage(istage);

    // --------------------------------------------------


    // --------------------------------------------------
    if (0) {
    // Player/Character state
    var state = "IN_AIR_DOWN";
    // let bDash = 3;
    var inAirSpeed = 15.0;
    var onGroundSpeed = 10.0;
    var inAirSpeedBase = 15.0;
    var onGroundSpeedBase = 10.0;
    var jumpHeight = 3;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    let inputDirRad = 0; // inputDirectionを -1, 0, 1ではなく、sin(inputDirRad)で
    // let inputDirRadAcc = 0.002; // 加速時
    // let inputDirRadDmp = 0.000001; // 自然に減速時
    let inputDirRadAcc = 0.005; // 加速時
    let inputDirRadDmp = 0.000005; // 自然に減速時
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン

    let characterGravity = new BABYLON.Vector3(0, -18, 0);
    let characterRisingON = new BABYLON.Vector3(0, 25.00, 0); // 上昇
    let characterRisingOFF = new BABYLON.Vector3(0, 0, 0);
    let characterRising   = characterRisingOFF;
    let characterHoverON  = new BABYLON.Vector3(0, 17.90, 0); // ホバー（滞空
    let characterHoverOFF = new BABYLON.Vector3(0, 0, 0);
    let characterHover = characterHoverON;
    let characterFloatON2 = new BABYLON.Vector3(0, 25.0, 0); // 浮き
    let characterFloatON  = new BABYLON.Vector3(0, 20.0, 0); // 浮き
    let characterFloatIDLE = new BABYLON.Vector3(0, 10, 0);
    let characterFloatOFF = new BABYLON.Vector3(0, 0, 0);
    let characterFloat = characterHoverOFF;
    let keyAction = {forward:0, back:0, right:0, left:0, float:0, jump:0, rise:0, down:0, resetCooltime:0 };


    // Physics shape for the character
    let myh = 3; // 1.8;
    let myr = 0.6;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: myh, radius: myr}, scene);
    displayCapsule.material = new BABYLON.StandardMaterial('mat', scene);
    displayCapsule.material.diffuseColor = BABYLON.Color3.Blue();
    displayCapsule.material.alpha = 0.4;


    // // let characterPosition = new BABYLON.Vector3(0, seaLevel+10, -4);
    // let characterPosition = new BABYLON.Vector3(0, 10, -4);
    let pV = pStart.clone();
    pV.y += 2;
    let characterPosition = pV;

    let p1 = pStart.clone();
    let p3 = pStart2.clone();
    p3.subtractInPlace(p1);
    let vrot = Math.atan2(p3.x, p3.z);
    // characterOrientation = new BABYLON.Quaternion(rotY, 0, 0, 1);
            displayCapsule.rotate(BABYLON.Vector3.Up(), vrot);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, vrot, 0);
            characterOrientation = quat2.multiply(characterOrientation);

    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: myh, capsuleRadius: myr}, scene);

    // ターゲットにローカル軸の表示を追加 (赤:x軸, 緑:y軸, 青:z軸)
    const localAxes = new BABYLON.AxesViewer(scene, 2);
    localAxes.xAxis.parent = displayCapsule; localAxes.yAxis.parent = displayCapsule; localAxes.zAxis.parent = displayCapsule;

    // camera.lockedTarget = displayCapsule;

    var getNextState = function(supportInfo) {
        // if (keyAction.float) {
        //     // 海上モード
        //     if (characterController.getPosition().y < seaLevel1) {
        //         characterFloat = characterFloatON2;
        //     } else if (characterController.getPosition().y < seaLevel) {
        //         if (characterController.getVelocity().y < 0) {
        //             characterFloat = characterFloatON;
        //         } else {
        //             characterFloat = characterFloatIDLE;
        //         }
        //     } else if (characterController.getPosition().y < seaLevel2) {
        //         characterFloat = characterFloatIDLE;
        //     } else {
        //         characterFloat = characterFloatOFF;
        //     }
        // } else {
        //     characterFloat = characterFloatOFF;
        // }
        if (state == "IN_AIR_UP") {
            if (characterController.getVelocity().y > 0) {
                if (keyAction.rise) {
                    characterRising = characterRisingON;
                    characterHover = characterHoverON;
                } else {
                    characterRising = characterRisingOFF;
                }
                return "IN_AIR_UP";
            }
            characterHover = characterHoverON;
            return "IN_AIR_DOWN";
        } else if (state == "IN_AIR_DOWN") {
            if (characterController.getVelocity().y > 0) {
                if (keyAction.rise) {
                    characterRising = characterRisingON;
                    characterHover = characterRisingON;
                } else {
                    characterRising = characterRisingOFF;
                    characterHover = characterRisingOFF;
                }
                return "IN_AIR_UP";
            }
            if (keyAction.rise) {
                characterHover = characterRisingON;
            } else if (keyAction.down) {
                characterHover = characterHoverOFF;
            } else {
                characterHover = characterHoverON;
            }
            if (supportInfo.supportedState == BABYLON.CharacterSupportedState.SUPPORTED) {
                return "ON_GROUND";
            }
            return "IN_AIR_DOWN";
        } else if (state == "ON_GROUND") {
            if (supportInfo.supportedState != BABYLON.CharacterSupportedState.SUPPORTED) {
                return "IN_AIR_DOWN";
            }
            if (keyAction.jump) {
                return "START_JUMP";
            }
            return "ON_GROUND";
        } else if (state == "START_JUMP") {
            return "IN_AIR_UP";
        }
    }

    var getDesiredVelocity = function(deltaTime, supportInfo, characterOrientation_, currentVelocity) {
        let nextState = getNextState(supportInfo);
        if (nextState != state) {
            state = nextState;
        }
        let upWorld = characterGravity.normalizeToNew();
        upWorld.scaleInPlace(-1.0);
        let forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation_);
        if (state == "IN_AIR_UP") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            outputVelocity.addInPlace(characterRising.scale(deltaTime)); // ゆっくり上昇？
            outputVelocity.addInPlace(characterFloat.scale(deltaTime));
            return outputVelocity;
        } else if (state == "IN_AIR_DOWN") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            outputVelocity.addInPlace(characterHover.scale(deltaTime)); // 降下をゆっくりにする上向きのベクトル
            outputVelocity.addInPlace(characterFloat.scale(deltaTime));
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
            outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
            let inv1k = 1e-3;
            if (outputVelocity.dot(upWorld) > inv1k) {
                let velLen = outputVelocity.length();
                outputVelocity.normalizeFromLength(velLen);
                let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);
                let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
                outputVelocity = c.cross(upWorld);
                outputVelocity.scaleInPlace(horizLen);
            }
            outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
            // outputVelocity.addInPlace(characterFloat.scale(deltaTime));
            return outputVelocity;
        } else if (state == "START_JUMP") {
            let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
            // // let u = Math.sqrt(2 * characterJumpF.length() * jumpHeight);
            let curRelVel = currentVelocity.dot(upWorld);
            return currentVelocity.add(upWorld.scale(u - curRelVel));
        }
        return Vector3.Zero();
    }

    // Display tick update: compute new camera position/target, update the capsule for the character display
    scene.onBeforeRenderObservable.add((scene) => {
        displayCapsule.position.copyFrom(characterController.getPosition());
    });

    // After physics update, compute and set new velocity, update the character controller state
    scene.onAfterPhysicsObservable.add((_) => {
        if (scene.deltaTime == undefined) return;
        let dt = scene.deltaTime / 1000.0;
        if (dt == 0) return;
        let down = new BABYLON.Vector3(0, -1, 0);
        let support = characterController.checkSupport(dt, down);
        if (keyAction.forward) {
            inputDirRad += inputDirRadAcc;
            if (inputDirRad > R90) {
                inputDirRad = R90;
            }
            inputDirection.z = Math.sin(inputDirRad);
        } else if (keyAction.back) {
            inputDirRad -= inputDirRadAcc;
            if (inputDirRad < -R90) {
                inputDirRad = -R90;
            }
            inputDirection.z = Math.sin(inputDirRad);
        } else {
            if (inputDirRad > 0) {
                inputDirRad -= inputDirRadDmp;
            } else {
                inputDirRad += inputDirRadDmp;
            }
        }
        if (keyAction.right) {
            // // displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), 0.02);
            // displayCapsule.rotate(BABYLON.Vector3.Up(), 0.02);
            // let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0.02, 0);
            let vrot = 0.02;
            if (keyAction.back && inputDirection.z>0.5) {
                vrot = 0.05;
            }
            displayCapsule.rotate(BABYLON.Vector3.Up(), vrot);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, vrot, 0);
            
            characterOrientation = quat2.multiply(characterOrientation);
        } else if (keyAction.left) {
            // // displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), -0.02);
            // displayCapsule.rotate(BABYLON.Vector3.Up(), -0.02);
            // let quat2 = BABYLON.Quaternion.FromEulerAngles(0, -0.02, 0);
            let vrot = -0.02;
            if (keyAction.back && inputDirection.z>0.5) {
                vrot = -0.05;
            }
            displayCapsule.rotate(BABYLON.Vector3.Up(), vrot);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, vrot, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        }
        let desiredLinearVelocity = getDesiredVelocity(dt, support, characterOrientation, characterController.getVelocity());
        characterController.setVelocity(desiredLinearVelocity);
        characterController.integrate(dt, support, characterGravity);
    });


    var map ={};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown"; 
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        map['ctrl'] = evt.sourceEvent.ctrlKey;
    }));
    scene.registerAfterRender(function() {
        keyAction.rise = 0;
        if (map["ctrl"]) {
            keyAction.rise = 1;
        }
        // inputDirection.z = 0;
        keyAction.forward = 0;
        keyAction.back = 0;
        if ((map["ArrowUp"] || map["w"])) {
            // inputDirection.z = 1;
            // keyAction.forward = 1;
            keyAction.forward = 1;

        } else if ((map["ArrowDown"] || map["s"])) {
            if (state === "IN_AIR_DOWN") {  // 空中なら降下
                keyAction.down = 1;
            } else {  // 地上ならバック
                // inputDirection.z = -1;
                // keyAction.back = 1;
                keyAction.back = 1;
            }
        }
        keyAction.left = 0;
        keyAction.right = 0;
        if ((map["ArrowLeft"] || map["a"])) {
            keyAction.left = 1;
        } else if ((map["ArrowRight"] || map["d"])) {
            keyAction.right = 1;
        }
        keyAction.jump = 0;
        if (map[" "]) {
            keyAction.jump = 1;
        }
        if (keyAction.resetCooltime) {
            --keyAction.resetCooltime;
        } else {
            if (map["c"]) {
                keyAction.resetCooltime = 60;
                icamera = (icamera+1) % 4;
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 10; // 3;
                    camera.heightOffset = 2; // 1.1;
                    camera.cameraAcceleration = 0.05;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 50;
                    camera.heightOffset = 4;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 10;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 2;
                    camera.heightOffset = 100;
                    camera.cameraAcceleration = 0.5;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.3;
                    camera.heightOffset = -0.01;
                    camera.cameraAcceleration = 0.3;
                    camera.maxCameraSpeed = 30;
                }

            } else if (map["Enter"]) {
                keyAction.resetCooltime = 30;
                keyAction.float = !(keyAction.float);

            } else if (map["r"]) {
                keyAction.resetCooltime = 60;
                // キャラクターコントローラーの位置だけリセット
                // characterController._position = characterPosition;
                let pV = pStart.clone();
                pV.y += 10;
                characterController._position = pV;


            } else if (map["f"]) {
                keyAction.resetCooltime = 30;
                if (scene._fog) {
                    scene.fogMode = BABYLON.Scene.FOGMODE_NON;
                }
                scene._fog = !(scene._fog);

            } else if (map["h"]) {
                keyAction.resetCooltime = 60;
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }
        }

        // meshAggManager2.update();
        // meshAggManager3.update();
    });

    // --------------------------------------------------




    // if (0) {
    //     // コースを線分で表示するテスト
    //     let iy = 0.1, iystep = 0.1, scale = 0.1, adjx=-50, adjz=-50, nz = 800;
    //     // let iy = 0.1, iystep = 0.02, scale = 0.02, adjx=-30, adjz=+10, nz = 1200;
    //     let plist = [];
    //     for (let [ix,iz] of pxz1) {
    //         plist.push(new BABYLON.Vector3(ix*scale+adjx, iy, (nz-iz)*scale+adjz));
    //         iy += iystep;
    //     }
    //     if (0) {
    //         //補間なし
    //         const arcLine = BABYLON.MeshBuilder.CreateLines("arc", {points: plist})
    //     }
    //     if (1) {
    //         let nbPoints = 10;
    //         // 上記で取得した点列を、スプラインで補間
    //         // const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, plist.length, true);
    //         const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(plist, nbPoints, false);
    //         const plist2 = catmullRom.getPoints();
    //         // 補間した点群を線分で表示
    //         const arcLine = BABYLON.MeshBuilder.CreateLines("arc", {points: plist2})
    //         arcLine.color = BABYLON.Color3.Yellow();
    //         // stageInfo.push([arcLine,null]);
    //     }
    // }


    // --------------------------------------------------

    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "170px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n"
            +"(W,S) or (Arrow UP/DOWN): Forward/Back\n"
            +"(A,D) or (Arrow Left/Right): turn Left/Right\n"
            +"(Enter): float\n"
            +"(Space): jump\n"
            +"(Ctrl): rise\n"
            +"C: change Camera\n"
            +"R: Reset position\n"
            +"F: Fog effect\n"
            +"H: show/hide this message";
    text1.color = "white";
    text1.width = "260px";
    text1.fontSize = 12;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    guiLabelRect.isVisible = false;
    }

    return scene;
}



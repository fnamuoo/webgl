// コーラム模様でローラーコースター
const R0 = 0;
const R5 = Math.PI/36; // 5度  360=72回 , 180=36回, 90=18回, 45=9回
const R10 = Math.PI/18;
const R22 = Math.PI/8; // 22.5度
const R45 = Math.PI/4; // 45度
const R90 = Math.PI/2;
const R135 = Math.PI*3/4;
const R180 = Math.PI;
const R225 = Math.PI*5/4;
const R270 = Math.PI*3/2;
const SQ22 = Math.sqrt(2)/2; // = 1.414/2 = 0.707
const SQ24 = Math.sqrt(2)/4; // = 1.414/4 = 0.3535
const SQ28 = Math.sqrt(2)/8; // block サイズ四方内に内接する円の半径のための係数

function createKolam(geo, mat, scene) {
    // コーラム(インドの伝統的な文様)
    // 「とい」(gutter)／四角チューブの下半分
    let trgMeshList = [], trgAggList = [];
    let block = 20, tubeWr = 0.1, tubeHr = 0.05, tubeY1Fr = 0.005, tubeY2Fr = 0.155, adjy = 0;
    let x, y, z, irad, ni, rotation;
    if ('adjy' in geo) { adjy = geo.adjy; }
    if ('block' in geo) { block = geo.block; }
    if ('tubeWr' in geo) { tubeWr = geo.tubeWr; }
    if ('tubeHr' in geo) { tubeHr = geo.tubeHr; }
    if ('tubeY1Fr' in geo) { tubeY1Fr = geo.tubeY1Fr; }
    if ('tubeY2Fr' in geo) { tubeY2Fr = geo.tubeY2Fr; }
    let block12 = block/2;
    let block14 = block/4;
    let block34 = block*3/4;
    let r = block*SQ24;
    let rSQ2 = block/4; // block*SQ24*SQ22; // R45 での長さ sq2 /4 *sq2 /2 = 2/8 = 1/4
    let tubeW12 = block*tubeWr/2;
    let tubeH = block*tubeHr;
    let tubeY1F = block*tubeY1Fr;
    let tubeY2F = block*tubeY2Fr;
    let tubeH12 = tubeY2F - tubeY1F;

    const myShape = [
        new BABYLON.Vector3(-tubeW12, tubeH, 0),
        new BABYLON.Vector3(-tubeW12, 0, 0),
        new BABYLON.Vector3( tubeW12, 0, 0),
        new BABYLON.Vector3( tubeW12, tubeH, 0)
    ];
    let pathRotListList = []; // path(Ve3のarray)とrotaion の List List
    if (geo.type == 'N_') {
        // +--------+
        // | ／￣＼ :
        // |│    │:    N_
        // | ＼＿／ :
        // +--------+
        // 右から反時計回りで右に
        let pathRotList = [];
        {
            let myPath = [];
            for (let i = 0; i <= 72; ++i) { // 360度
                irad = i * R5;
                x = r*Math.cos(irad); y = tubeY2F; z = r*Math.sin(irad);
                myPath.push(new BABYLON.Vector3(x, y, z));
            }
            pathRotList.push([myPath, 0]);
        }
        pathRotListList.push(pathRotList);

    } else if (geo.type == 'Nc') {
        // +---＼---+
        // | ／  ＼ :
        // |│    │:    Nc
        // | ＼＿／ :
        // +--------+
        // 上(1F)から反時計回りで上(2F)に
        let pathRotList = [];
        {
            let myPath = [];
            x = 0; y = tubeY1F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
            x = -block14; y = tubeY1F; z = block14; myPath.push(new BABYLON.Vector3(x, y, z));
            pathRotList.push([myPath, 0]);
        }
        {
            let myPath = [];
            ni = 54; // 270度
            let ystep = tubeH12/ni;
            for (let i = 0; i <= ni; ++i) { // 270度
                irad = i*R5 + R135;
                x = r*Math.cos(irad); y = tubeY1F+ystep*i; z = r*Math.sin(irad);
                myPath.push(new BABYLON.Vector3(x, y, z));
            }
            rotation = -R22 / ni;  // 全体で22.5度のひねりが加わるので逆の回転を施す
            pathRotList.push([myPath, rotation]);
        }
        {
            let myPath = [];
            x = block14; y = tubeY2F; z = block14; myPath.push(new BABYLON.Vector3(x, y, z));
            x = 0; y = tubeY2F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
            pathRotList.push([myPath, 0]);
        }
        pathRotListList.push(pathRotList);

    } else if (geo.type == 'NcEc') {
        // -+---＼---+
        //  : ／  ＼ :
        //  :│     ／     NcEc
        //  : ＼＿／ :
        // -+--------+
        // 上から反時計回りで右に
        {
            let pathRotList = [];
            {
                let myPath = [];
                x = 0; y = tubeY1F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
                x = -block14; y = tubeY1F; z = block14; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 36; // 180度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i*R5 + R135;
                    x = r*Math.cos(irad); y = tubeY1F+ystep*i; z = r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                // rotation = 0; // -R45 / ni;
                rotation = -R22 / ni;
                pathRotList.push([myPath, rotation]);
            }
            {
                let myPath = [];
                x = block14; y = tubeY2F; z = -block14; myPath.push(new BABYLON.Vector3(x, y, z));
                x = block12; y = tubeY2F; z = 0; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 左(1F)から上(2F)への直線
            let pathRotList = [];
            {
                let myPath = [];
                x = block12; y = tubeY1F; z = 0; myPath.push(new BABYLON.Vector3(x, y, z));
                ni = 36;
                for (let i = 0; i < ni; ++i) { // 180度
                    irad = i * R5;
                    x = block12 - (i/ni)*block12;
                    y = tubeH12*(1-Math.cos(irad))/2 + tubeY1F;
                    z = (i/ni)*block12;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                x = 0; y = tubeY2F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }

    } else if (geo.type == 'NcEp') {
        // -+---＼---+
        //  : ／  ＼＿
        //  :│     ＿     NcEp
        //  : ＼＿／ :
        // -+--------+
        {
            // 上から反時計回りで右に
            let pathRotList = [];
            {
                let myPath = [];
                x = 0; y = tubeY1F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
                x = -block14; y = tubeY1F; z = block14; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 36; // 180度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i*R5 + R135;
                    x = r*Math.cos(irad); y = tubeY1F+ystep*i; z = r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                rotation = -R22 / ni;
                pathRotList.push([myPath, rotation]);
            }
            {
                let myPath = [];
                ni = 9; // 45度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 45度
                    irad = -i*R5 + R135;
                    x = block12+r*Math.cos(irad); y = tubeY2F; z = -block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 左から上へ
            let pathRotList = [];
            {
                let myPath = [];
                ni = 9; // 45度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 45度
                    irad = -i*R5 + R270;
                    x = block12+r*Math.cos(irad); y = tubeY2F; z = block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                x = block14; y = tubeY2F; z = block14; myPath.push(new BABYLON.Vector3(x, y, z));
                x = 0; y = tubeY2F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }

    } else if (geo.type == 'NpEc') {
        // -+--││--+
        //  : ／  ＼ :
        //  :│     ／     NpEc
        //  : ＼＿／ :
        // -+--------+
        {
            // 上から反時計回りで右に
            let pathRotList = [];
            {
                let myPath = [];
                ni = 9; // 45度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 45度
                    irad = -i*R5;
                    x = -block12+r*Math.cos(irad); y = tubeY2F; z = block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 36; // 180度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i*R5 + R135;
                    x = r*Math.cos(irad); y = tubeY2F; z = r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                x = block14; y = tubeY2F; z = -block14; myPath.push(new BABYLON.Vector3(x, y, z));
                x = block12; y = tubeY2F; z = 0; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 左(1F)から上(2F)へ
            let pathRotList = [];
            {
                let myPath = [];
                ni = 36;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i * R5;
                    x = block12 - (i/ni)*block14;
                    y = tubeH12*(1-Math.cos(irad))/2 + tubeY1F;
                    z = (i/ni)*block14;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 9; // 45度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 45度
                    irad = -i*R5 + R225;
                    x = block12+r*Math.cos(irad);
                    y = tubeY2F;
                    z = block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                rotation = 0; // R45 / ni;
                pathRotList.push([myPath, rotation]);
            }
            pathRotListList.push(pathRotList);
        }

    } else if (geo.type == 'NpEp') {
        // -+--││--+
        //  : ／  ＼＿
        //  :│     ＿     NpEp
        //  : ＼＿／ :
        // -+--------+
        {
            // 上から反時計回りで右に
            let pathRotList = [];
            {
                let myPath = [];
                ni = 9; // 45度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 45度
                    irad = -i*R5;
                    x = -block12+r*Math.cos(irad); y = tubeY2F; z = block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 36; // 180度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i*R5 + R135;
                    x = r*Math.cos(irad); y = tubeY2F; z = r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 9; // 45度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 45度
                    irad = -i*R5 + R135;
                    x = block12+r*Math.cos(irad); y = tubeY2F; z = -block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }

        {
            // 左から上へ
            let pathRotList = [];
            {
                let myPath = [];
                ni = 18; // 90度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 90度
                    irad = -i*R5 + R270;
                    x = block12+r*Math.cos(irad); y = tubeY2F; z = block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }


    } else if (geo.type == 'NcSc') {
        // -+---＼---+
        //  : ／  ＼ :
        //  :│    │:     NcSc
        //  : ＼  ／ :
        // -+---＼---+
        {
            // 上から下に
            let pathRotList = [];
            {
                let myPath = [];
                x = 0; y = tubeY1F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
                x = -block14; y = tubeY1F; z = block14; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 18; // 90度
                for (let i = 0; i <= ni; ++i) { // 90度
                    irad = i*R5 + R135;
                    x = r*Math.cos(irad); y = tubeY1F+tubeH12*(1-Math.cos(i*R10))/2; z = r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                rotation = -R22 / ni;
                pathRotList.push([myPath, rotation]);
            }
            {
                let myPath = [];
                x = -block14; y = tubeY2F; z = -block14; myPath.push(new BABYLON.Vector3(x, y, z));
                x = 0; y = tubeY2F; z = -block12; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 下から上に
            let pathRotList = [];
            {
                let myPath = [];
                x = 0; y = tubeY1F; z = -block12; myPath.push(new BABYLON.Vector3(x, y, z));
                x = block14; y = tubeY1F; z = -block14; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 18; // 90度
                for (let i = 0; i <= ni; ++i) { // 90度
                    irad = i*R5 - R45;
                    x = r*Math.cos(irad); y = tubeY1F+tubeH12*(1-Math.cos(i*R10))/2; z = r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                rotation = -R22 / ni;
                pathRotList.push([myPath, rotation]);
            }
            {
                let myPath = [];
                x = block14; y = tubeY2F; z = block14; myPath.push(new BABYLON.Vector3(x, y, z));
                x = 0; y = tubeY2F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }

    } else if (geo.type == 'NcSp') {
        // -+---＼---+
        //  : ／  ＼ :
        //  :│    │:     NcSp
        //  : ＼  ／ :
        // -+--││--+
        {
            // 上から下に
            let pathRotList = [];
            {
                let myPath = [];
                x = 0; y = tubeY1F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
                x = -block14; y = tubeY1F; z = block14; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 18; // 90度
                for (let i = 0; i <= ni; ++i) { // 90度
                    irad = i*R5 + R135;
                    x = r*Math.cos(irad); y = tubeY1F+tubeH12*(1-Math.cos(i*R10))/2; z = r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                rotation = -R22 / ni;
                pathRotList.push([myPath, rotation]);
            }
            {
                let myPath = [];
                ni = 9; // 45度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 45度
                    irad = -i*R5 + R45;
                    x = -block12+r*Math.cos(irad); y = tubeY2F; z = -block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 下から上に
            let pathRotList = [];
            {
                let myPath = [];
                ni = 9; // 45度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 45度
                    irad = -i*R5 + R180;
                    x = block12+r*Math.cos(irad); y = tubeY2F; z = -block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 18; // 90度
                for (let i = 0; i <= ni; ++i) { // 90度
                    irad = i*R5 - R45;
                    x = r*Math.cos(irad); y = tubeY2F; z = r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                x = block14; y = tubeY2F; z = block14; myPath.push(new BABYLON.Vector3(x, y, z));
                x = 0; y = tubeY2F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }

    } else if (geo.type == 'NcEcSc') {
        // +---＼---+
        // : ／  ＼ :
        // :│     ／     NcEcSc
        // : ＼  ／ :
        // +---＼---+
        {
            // 上から下に
            let pathRotList = [];
            {
                let myPath = [];
                x = 0; y = tubeY1F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
                x = -block14; y = tubeY1F; z = block14; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 18; // 90度
                for (let i = 0; i <= ni; ++i) { // 90度
                    irad = i*R5 + R135;
                    x = r*Math.cos(irad); y = tubeY1F+tubeH12*(1-Math.cos(i*R10))/2; z = r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                rotation = -R22 / ni;
                pathRotList.push([myPath, rotation]);
            }
            {
                let myPath = [];
                x = -block14; y = tubeY2F; z = -block14; myPath.push(new BABYLON.Vector3(x, y, z));
                x = 0; y = tubeY2F; z = -block12; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 下(1F)から右(2F)への直線
            let pathRotList = [];
            {
                let myPath = [];
                ni = 36;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i * R5;
                    x = (i/ni)*block12;
                    y = tubeH12*(1-Math.cos(irad))/2 + tubeY1F;
                    z = (i/ni)*block12 - block12;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 右(1F)から上(2F)への直線
            let pathRotList = [];
            {
                let myPath = [];
                ni = 36;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i * R5;
                    x = block12 - (i/ni)*block12;
                    y = tubeH12*(1-Math.cos(irad))/2 + tubeY1F;
                    z = (i/ni)*block12;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }

    } else if (geo.type == 'NpEcSc') {
        // +--││--+
        // | ／  ＼ :
        // |│     ／     NpEcSc
        // | ＼  ／ :
        // +---＼---+
        {
            // 上から下に
            let pathRotList = [];
            {
                let myPath = [];
                ni = 9; // 45度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 45度
                    irad = -i*R5;
                    x = -block12+r*Math.cos(irad); y = tubeY2F; z = block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 18; // 90度
                for (let i = 0; i <= ni; ++i) { // 90度
                    irad = i*R5 + R135;
                    x = r*Math.cos(irad); y = tubeY2F; z = r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                x = -block14; y = tubeY2F; z = -block14; myPath.push(new BABYLON.Vector3(x, y, z));
                x = 0; y = tubeY2F; z = -block12; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 下(1F)から右(2F)への直線
            let pathRotList = [];
            {
                let myPath = [];
                ni = 36;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i * R5;
                    x = (i/ni)*block12;
                    y = tubeH12*(1-Math.cos(irad))/2 + tubeY1F;
                    z = (i/ni)*block12 - block12;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 左(1F)から上(2F)へ
            let pathRotList = [];
            {
                let myPath = [];
                ni = 36;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i * R5;
                    x = -(i/ni)*block14 + block12;
                    y = tubeH12*(1-Math.cos(irad))/2 + tubeY1F;
                    z = (i/ni)*block14;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 9; // 45度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 45度
                    irad = -i*R5 + R225;
                    x = block12+r*Math.cos(irad); y = tubeY2F; z = block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                rotation = 0; // R22 / ni;
                pathRotList.push([myPath, rotation]);
            }
            pathRotListList.push(pathRotList);
        }

    } else if (geo.type == 'NcEpSp') {
        // -+---＼---+
        //  : ／  ＼＿
        //  :│     ＿    NcEpSp
        //  : ＼  ／ :
        // -+--││--+
        {
            // 上から下に
            let pathRotList = [];
            {
                let myPath = [];
                x = 0; y = tubeY1F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
                x = -block14; y = tubeY1F; z = block14; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                ni = 18; // 90度
                for (let i = 0; i <= ni; ++i) { // 90度
                    irad = i*R5 + R135;
                    x = r*Math.cos(irad); y = tubeY1F+tubeH12*(1-Math.cos(i*R10))/2; z = r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                rotation = -R22 / ni;
                pathRotList.push([myPath, rotation]);
            }
            {
                let myPath = [];
                ni = 9; // 45度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 45度
                    irad = -i*R5 + R45;
                    x = -block12+r*Math.cos(irad); y = tubeY2F; z = -block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 下から右へ
            let pathRotList = [];
            {
                let myPath = [];
                ni = 18; // 90度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 90度
                    irad = -i*R5 + R180;
                    x = block12+r*Math.cos(irad); y = tubeY2F; z = -block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 左から上へ
            let pathRotList = [];
            {
                let myPath = [];
                ni = 9; // 45度
                let ystep = tubeH12/ni;
                for (let i = 0; i <= ni; ++i) { // 45度
                    irad = -i*R5 + R270;
                    x = block12+r*Math.cos(irad); y = tubeY2F; z = block12+r*Math.sin(irad);
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            {
                let myPath = [];
                x = block14; y = tubeY2F; z = block14; myPath.push(new BABYLON.Vector3(x, y, z));
                x = 0; y = tubeY2F; z = block12; myPath.push(new BABYLON.Vector3(x, y, z));
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }

    } else if (geo.type == 'NcEcScWc') {
        // -+---＼---+
        //  : ／  ＼ :
        // ／       ／    NcEcScWc
        //  : ＼  ／ :
        // -+---＼---+

        {
            // 上(1F)から左(2F)への直線
            let pathRotList = [];
            {
                let myPath = [];
                ni = 36;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i * R5;
                    x = -(i/ni)*block12;
                    y = tubeH12*(1-Math.cos(irad))/2 + tubeY1F;
                    z = -(i/ni)*block12 + block12;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 左(1F)から下(2F)への直線
            let pathRotList = [];
            {
                let myPath = [];
                ni = 36;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i * R5;
                    x = -block12 + (i/ni)*block12;
                    y = tubeH12*(1-Math.cos(irad))/2 + tubeY1F;
                    z = -(i/ni)*block12;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 下(1F)から右(2F)への直線
            let pathRotList = [];
            {
                let myPath = [];
                ni = 36;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i * R5;
                    x = (i/ni)*block12;
                    y = tubeH12*(1-Math.cos(irad))/2 + tubeY1F;
                    z = (i/ni)*block12 - block12;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }
        {
            // 右(1F)から上(2F)への直線
            let pathRotList = [];
            {
                let myPath = [];
                ni = 36;
                for (let i = 0; i <= ni; ++i) { // 180度
                    irad = i * R5;
                    x = block12 - (i/ni)*block12;
                    y = tubeH12*(1-Math.cos(irad))/2 + tubeY1F;
                    z = (i/ni)*block12;
                    myPath.push(new BABYLON.Vector3(x, y, z));
                }
                pathRotList.push([myPath, 0]);
            }
            pathRotListList.push(pathRotList);
        }


    } else {
        return [trgMeshList, trgAggList];
    }

    for (let pathRotList of pathRotListList) {
        let trgMesh, trgAgg;
        for (let [myPath,rotation] of pathRotList) {
            let options = {shape: myShape, path: myPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE};
            if (rotation != 0) {
                options.rotation = rotation;
            }
            trgMesh = BABYLON.MeshBuilder.ExtrudeShape("extrude", options, scene);
            trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
            if (mat != null) {
                trgMesh.material = mat;
            }
            trgMesh.physicsBody.disablePreStep = true;
            trgMesh.position = new BABYLON.Vector3(geo.x, geo.y, geo.z);
            if (('rot' in geo) && (geo.rot != 0)) {
                trgMesh.rotate(new BABYLON.Vector3(0, 1, 0), geo.rot, BABYLON.Space.WORLD);
            }
            trgMesh.physicsBody.disablePreStep = false;
            trgMeshList.push(trgMesh);
            trgAggList.push(trgAgg);
        }
    }

    return [trgMeshList, trgAggList];
}


// 右左(ad)で方向転換
// 障害物　配置
// カメラワーク
// カーソルで移動(カーソルでカメラワークを無効に)
var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.rotationOffset = 180;
    camera.radius = 3;
    camera.heightOffset = 1.1;
    camera.cameraAcceleration = 0.1;
    camera.maxCameraSpeed = 30;
    camera.attachControl(canvas, true);
    camera.inputs.clear(); // カーソルキーでカメラ操作させないようにする
    let icamera = 0;

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Initialize Havok plugin
    const hk = new BABYLON.HavokPlugin(false);
    // Enable physics in the scene with a gravity
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);


    // 地面を設定する
    // const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 200, height: 200 }, scene);
    const groundMesh = BABYLON.MeshBuilder.CreateGround("ground", { width: 40, height: 40 }, scene);
    // groundMesh.material = new BABYLON.GridMaterial("groundMaterial", scene);
    // groundMesh.material.majorUnitFrequency = 10;
    // groundMesh.material.minorUnitVisibility  = 0;
    groundMesh.material = new BABYLON.StandardMaterial("groundmat", scene);
    groundMesh.material.diffuseTexture = new BABYLON.Texture("textures/grass.jpg", scene);
    // 地面に摩擦係数、反射係数を設定する
    var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution:0.01}, scene);


    function createMat(type) {
        let mat = null;
        if (type=='std_wire') {
            mat = new BABYLON.StandardMaterial("mat", scene);
            mat.emissiveColor = BABYLON.Color3.Blue();
            mat.wireframe = true;
        } else if (type=='std_trans') {
	    mat = new BABYLON.StandardMaterial('mat', scene);
	    mat.diffuseColor = BABYLON.Color3.Blue();
	    mat.alpha = 0.7;
        } else if (type=='std_trans2') {
	    mat = new BABYLON.StandardMaterial('mat', scene);
	    mat.diffuseColor = BABYLON.Color3.White();
	    mat.alpha = 0.7;
        } else if (type=='nmr') {
            mat = new BABYLON.NormalMaterial("mat", scene);
            mat.wireframe = true;
        } else if (type=='grid') {
	    mat = new BABYLON.GridMaterial("mat", scene);
	    mat.majorUnitFrequency = 5;
	    mat.gridRatio = 0.5;
        } else if (type=='grad') {
	    mat = new BABYLON.GradientMaterial("grad", scene);
            mat.topColor = new BABYLON.Color3(0.6, 0.7, 0.9);
            mat.bottomColor = new BABYLON.Color3(0.4, 0.6, 0.4);
            mat.offset = 1;
            mat.scale = 0.3;
            // mat.smoothness = 1;
            // mat.wireframe = true;
        }
        return mat;
    }
    // let mat = createMat('grid');     // コース .. 開発／デバッグ用
    let mat = createMat('nmr');      // コース ... 吊り橋
    // let mat = createMat('std_trans2');  // コース .. 雲っぽい感じ
    let mat2 = createMat('std_wire');   // コース・スタート地点のみ
    let matMy = createMat('std_trans'); // 自機

    let istage = 0;
    let nstage = 7;
    let trgMeshListList = [], trgAggListList = [];

    function createState(istage) {
        for (let trgAggList of trgAggListList) {
            for (let trgAgg of trgAggList) {
                trgAgg.dispose();
            }
        }
        for (let trgMeshList of trgMeshListList) {
            for (let trgMesh of trgMeshList) {
                trgMesh.dispose();
            }
        }
        let tmp1, tmp2;

        if (istage == 0) {
            // https://katlas.org/wiki/0_1
            // https://katlas.org/wiki/File:Swastika-Manji_Kolam-C.jpg
            // +--------+--------+--------+
            // | ／￣＼ : ／￣＼ : ／￣＼ |
            // |│     ／      │:│    │|     Nc     NcEc
            // | ＼＿／ : ＼  ／ : ＼  ／ |
            // +--------+---＼---+-- ＼---+
            // | ／￣＼ : ／  ＼ : ／  ＼ |
            // |│     ／       ／      │|            NcEcScWc
            // | ＼  ／ : ＼  ／ : ＼＿／ |
            // +---＼---+---＼---+--------+
            // | ／  ＼ : ／  ＼ : ／￣＼ |
            // |│    │:│     ／      │|
            // | ＼＿／ : ＼＿／ : ＼＿／ |
            // +--------+--------+--------+
            [tmp1, tmp2] = createKolam({type:'Nc'  , x:0 , y:0, z:40, rot:R90}, mat, scene); trgAggListList.push(tmp1); trgMeshListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc', x:20, y:0, z:40, rot:R180}, mat, scene); trgAggListList.push(tmp1); trgMeshListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'Nc'  , x:40, y:0, z:40, rot:R180}, mat, scene); trgAggListList.push(tmp1); trgMeshListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc'    , x:0 , y:0, z:20, rot:R90}, mat, scene); trgAggListList.push(tmp1); trgMeshListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEcScWc', x:20, y:0, z:20}, mat, scene); trgAggListList.push(tmp1); trgMeshListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc'    , x:40, y:0, z:20, rot:-R90}, mat, scene); trgAggListList.push(tmp1); trgMeshListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'Nc'  , x:0 , y:0, z:0}, mat2, scene); trgAggListList.push(tmp1); trgMeshListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc', x:20, y:0, z:0}, mat, scene); trgAggListList.push(tmp1); trgMeshListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'Nc'  , x:40, y:0, z:0, rot:-R90}, mat, scene); trgAggListList.push(tmp1); trgMeshListList.push(tmp2);
        }

        if (istage == 1) {
            // https://katlas.org/wiki/3_1
            // https://katlas.org/wiki/File:Hart-knot-C.jpg
            //   +--------+--------+
            //   | ／￣＼＿_／￣＼ |
            //   |│     ＿_     │|     NpEc         NcEp
            //   | ＼  ／ : ＼  ／ |
            //   +---＼---+-- ＼---+
            //   | ／  ＼ : ／  ＼ |
            //   |│     ／      │|     NcEc
            //   | ＼＿／ : ＼＿／ |
            //   +--------+--------+
            [tmp1, tmp2] = createKolam({type:'NpEc', x:0 , y:0, z:20, rot:R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEp', x:20, y:0, z:20, rot:R180}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc', x:0 , y:0, z:0, rot:R0}, mat2, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc', x:20, y:0, z:0, rot:-R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
        }

        if (istage == 2) {
            // https://katlas.org/wiki/4_1
            // https://katlas.org/wiki/File:FigureEightKnot4a-C.jpg
            //   +--------+--------+--------+
            //   | ／￣＼ : ／￣＼＿_／￣＼ |
            //   |│     ／       ＿_     │|   NcEc    NpEcSc     NpEp
            //   | ＼  ／ : ＼  ／ : ＼  ／ |
            //   +---＼---+---＼---+--｜｜--+
            //   | ／  ＼＿_／  ＼ : ／  ＼ |
            //   |│     ＿_      ／      │|   NcEp
            //   | ＼＿／ : ＼＿／ : ＼＿／ |
            //   +--------+--------+--------+
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:0 , y:0, z:20, rot:R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NpEcSc', x:20, y:0, z:20, rot:R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NpEp'  , x:40, y:0, z:20, rot:R180}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEp'  , x:0 , y:0, z:0, rot:R0}, mat2, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NpEcSc', x:20, y:0, z:0, rot:-R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEp'  , x:40, y:0, z:0, rot:-R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
        }

        if (istage == 3) {
            // https://katlas.org/wiki/5_1
            // https://katlas.org/wiki/File:SolomonsSealKnot5a-C.jpg
            //   +--------+--------+--------+
            //   | ／￣＼ : ／￣＼ : ／￣＼ |
            //   |│     ／       ／      │|    NcEc    NcSc
            //   | ＼  ／ : ＼＿／ : ＼  ／ |
            //   +---＼---+--------+---＼---+
            //   | ／  ＼ : ／￣＼＿_／  ＼ |
            //   |│     ／       ＿_     │|            NcSp   NpEc
            //   | ＼＿／ : ＼＿／ : ＼＿／ |
            //   +--------+--------+--------+
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:0 , y:0, z:20, rot:R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcSc'  , x:20, y:0, z:20, rot:R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:40, y:0, z:20, rot:R180}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:0 , y:0, z:0, rot:R0}, mat2, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcSp'  , x:20, y:0, z:0, rot:-R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NpEc'  , x:40, y:0, z:0, rot:-R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
        }

        if (istage == 4) {
            // https://katlas.org/wiki/6_1
            // https://katlas.org/wiki/File:StevedoresKnot-1-6a-C.jpg
            //   +--------+--------+--------+
            //   | ／￣＼ : ／￣＼ :        |
            //   |│     ／      │:        |   NcEp    NpEc
            //   | ＼  ／ : ＼  ／ :        |
            //   +--││--+--││--+--------+
            //   | ／  ＼ : ／  ＼＿_／￣＼ |
            //   |│     ／               │|   NpEcSc  NcEpSp
            //   | ＼  ／ : ＼＿／￣~＼  ／ |
            //   +---＼---+--------+---＼---+
            //   | ／  ＼ : ／￣＼ : ／  ＼ |
            //   |│     ／       ／      │|   NcEc    NcSc
            //   | ＼＿／ : ＼＿／ : ＼＿／ |
            //   +--------+--------+--------+
            [tmp1, tmp2] = createKolam({type:'NcEp'  , x:0 , y:0, z:40, rot:R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NpEc'  , x:20, y:0, z:40, rot:R180}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NpEcSc', x:0 , y:0, z:20, rot:R0}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEpSp', x:20, y:0, z:20, rot:-R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEp'  , x:40, y:0, z:20, rot:R180}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:0 , y:0, z:0, rot:R0}, mat2, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcSc'  , x:20, y:0, z:0, rot:R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:40, y:0, z:0, rot:-R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
        }

        if (istage == 5) {
            // https://katlas.org/wiki/7_4
            // https://katlas.org/wiki/File:Takara-4harts-C7.jpg
            //   +--------+--------+--------+--------+
            //   |        : ／￣＼ : ／￣＼ :        |
            //   |        :│     ／      │:        |      NcEc
            //   |        : ＼  ／ : ＼  ／ :        |
            //   +--------+---＼---+-- ＼---+--------+
            //   | ／￣＼ : ／  ＼ : ／  ＼ : ／￣＼ |
            //   |│    │:│     ／      │:│    │|  N_  NcEcSc
            //   | ＼＿／ : ＼  ／ : ＼  ／ : ＼＿／ |
            //   +--------+---＼---+---＼---+--------+
            //   |        : ／  ＼ : ／  ＼ :        |
            //   |        :│     ／      │:        |
            //   |        : ＼＿／ : ＼＿／ :        |
            //   +--------+--------+--------+--------+
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:0 , y:0, z:40, rot:R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:20, y:0, z:40, rot:R180}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEcSc', x:0 , y:0, z:20, rot:R0}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEcSc', x:20, y:0, z:20, rot:R180}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:0 , y:0, z:0, rot:R0}, mat2, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:20, y:0, z:0, rot:-R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'N_', x:-20 , y:0, z:20, rot:R0}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'N_', x:40 , y:0, z:20, rot:R0}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
        }


        if (istage == 6) {
            // https://katlas.org/wiki/File:TakaraMusubi-C9.jpg
            //   +--------+--------+--------+--------+
            //   |        : ／￣＼ : ／￣＼ :        |
            //   |        :│     ／      │:        |      NcEc
            //   |        : ＼  ／ : ＼  ／ :        |
            //   +--------+---＼---+-- ＼---+--------+
            //   | ／￣＼ : ／  ＼ : ／  ＼ : ／￣＼ |
            //   |│     ／       ／       ／      │|  Nc  NcEcScWc
            //   | ＼＿／ : ＼  ／ : ＼  ／ : ＼＿／ |
            //   +--------+---＼---+---＼---+--------+
            //   |        : ／  ＼ : ／  ＼ :        |
            //   |        :│     ／      │:        |
            //   |        : ＼＿／ : ＼＿／ :        |
            //   +--------+--------+--------+--------+
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:0 , y:0, z:40, rot:R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:20, y:0, z:40, rot:R180}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'Nc'      , x:-20 , y:0, z:20, rot:R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEcScWc', x: 0, y:0, z:20, rot:R0}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEcScWc', x:20, y:0, z:20, rot:R0}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'Nc'      , x:40, y:0, z:20, rot:-R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:0 , y:0, z:0, rot:R0}, mat2, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
            [tmp1, tmp2] = createKolam({type:'NcEc'  , x:20, y:0, z:0, rot:-R90}, mat, scene); trgMeshListList.push(tmp1); trgAggListList.push(tmp2);
        }
        
        if (istage == 7) {
            // 部品生成、デバッグ用
            // createKolam({type:'N_', x:-40, y:0, z:0}, mat);
            // createKolam({type:'Nc', x:0, y:0, z:10}, mat);
            // createKolam({type:'NcEc', x:0, y:0, z:10}, mat);
            // createKolam({type:'NcEp', x:0, y:0, z:10}, mat);
            // createKolam({type:'NpEc', x:0, y:0, z:10}, mat);
            // createKolam({type:'NpEp', x:0, y:0, z:10}, mat);
            // createKolam({type:'NcSc', x:0, y:0, z:0}, mat);
            // createKolam({type:'NcSp', x:0, y:0, z:10}, mat);
            // createKolam({type:'NcEcSc', x:0, y:0, z:10}, mat);
            createKolam({type:'NpEcSc', x:0, y:0, z:10}, mat);
            // createKolam({type:'NcEpSp', x:0, y:0, z:10}, mat);
            // createKolam({type:'NcEcScWc', x:0, y:0, z:10}, mat);
        }

    }
    createState(istage);


    if (1) {
    // Skybox
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    // skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    }

    // Player/Character state
    var state = "IN_AIR";
    var inAirSpeed = 20.0;
    var onGroundSpeed = 5.0;
    var jumpHeight = 5; // 1.5;
    var inputDirection = new BABYLON.Vector3(0,0,0); // 方向（前後のみ）を示すベクトル
    var forwardLocalSpace = new BABYLON.Vector3(0, 0, 1);
    let characterOrientation = BABYLON.Quaternion.Identity(); // 姿勢／向きを持たせるクォータニオン
    let characterGravity = new BABYLON.Vector3(0, -18, 0);

    let keyAction = {forward:0, back:0, right:0, left:0, jump:0};

    // Physics shape for the character
    let myh = 1.8;
    let myr = 0.6;
    let displayCapsule = BABYLON.MeshBuilder.CreateCapsule("CharacterDisplay", {height: myh, radius: myr}, scene);
    displayCapsule.material = matMy;
    let characterPosition = new BABYLON.Vector3(0, 10, -8);
    let characterController = new BABYLON.PhysicsCharacterController(characterPosition, {capsuleHeight: myh, capsuleRadius: myr}, scene);

    camera.lockedTarget = displayCapsule;


    // State handling
    // depending on character state and support, set the new state
    var getNextState = function(supportInfo) {
        if (state == "IN_AIR") {
            if (supportInfo.supportedState == BABYLON.CharacterSupportedState.SUPPORTED) {
                return "ON_GROUND";
            }
            return "IN_AIR";
        } else if (state == "ON_GROUND") {
            if (supportInfo.supportedState != BABYLON.CharacterSupportedState.SUPPORTED) {
                return "IN_AIR";
            }
            // if (wantJump) {
            if (keyAction.jump) {
                return "START_JUMP";
            }
            return "ON_GROUND";
        } else if (state == "START_JUMP") {
            return "IN_AIR";
        }
    }

    // From aiming direction and state, compute a desired velocity
    // That velocity depends on current state (in air, on ground, jumping, ...) and surface properties
    var getDesiredVelocity = function(deltaTime, supportInfo, characterOrientation_, currentVelocity) {
        let nextState = getNextState(supportInfo);
        if (nextState != state) {
            state = nextState;
        }
        let upWorld = characterGravity.normalizeToNew();
        upWorld.scaleInPlace(-1.0);
        let forwardWorld = forwardLocalSpace.applyRotationQuaternion(characterOrientation_);
        if (state == "IN_AIR") {
            let desiredVelocity = inputDirection.scale(inAirSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, upWorld, currentVelocity, BABYLON.Vector3.ZeroReadOnly, desiredVelocity, upWorld);
            // Restore to original vertical component
            outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
            outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
            // Add gravity
            outputVelocity.addInPlace(characterGravity.scale(deltaTime));
            return outputVelocity;
        } else if (state == "ON_GROUND") {
            // Move character relative to the surface we're standing on
            // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
            // avoid artifacts caused by filtering of the output velocity when standing on moving objects.
            let desiredVelocity = inputDirection.scale(onGroundSpeed).applyRotationQuaternion(characterOrientation_);
            let outputVelocity = characterController.calculateMovement(deltaTime, forwardWorld, supportInfo.averageSurfaceNormal, currentVelocity, supportInfo.averageSurfaceVelocity, desiredVelocity, upWorld);
            // Horizontal projection
            {
                outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
                let inv1k = 1e-3;
                if (outputVelocity.dot(upWorld) > inv1k) {
                    let velLen = outputVelocity.length();
                    outputVelocity.normalizeFromLength(velLen);
                    // Get the desired length in the horizontal direction
                    let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);
                    // Re project the velocity onto the horizontal plane
                    let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
                    outputVelocity = c.cross(upWorld);
                    outputVelocity.scaleInPlace(horizLen);
                }
                outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
                return outputVelocity;
            }
        } else if (state == "START_JUMP") {
            let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
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
        if (keyAction.right) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), 0.02);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, 0.02, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        } else if (keyAction.left) {
            displayCapsule.rotate(new BABYLON.Vector3(0, 1, 0), -0.02);
            let quat2 = BABYLON.Quaternion.FromEulerAngles(0, -0.02, 0);
            characterOrientation = quat2.multiply(characterOrientation);
        }
        let desiredLinearVelocity = getDesiredVelocity(dt, support, characterOrientation, characterController.getVelocity());
        // let desiredLinearVelocity = getDesiredVelocity(dt, support, quat, characterController.getVelocity());
        characterController.setVelocity(desiredLinearVelocity);
        characterController.integrate(dt, support, characterGravity);
    });


    // Input to direction
    // from keys down/up, update the Vector3 inputDirection to match the intended direction. Jump with space
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 'ArrowUp') {
                inputDirection.z = 1;
                keyAction.forward = 1;
            } else if (kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowDown') {
                inputDirection.z = -1;
                keyAction.back = 1;
            } else if (kbInfo.event.key == 'a' || kbInfo.event.key == 'ArrowLeft') {
                keyAction.left = 1;
            } else if (kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowRight') {
                keyAction.right = 1;
            } else if (kbInfo.event.key == ' ') {
                keyAction.jump = 1;
            } else if (kbInfo.event.key == 'c') {
                icamera = (icamera+1) % 4;
                console.log("camera=",icamera);
                if (icamera == 0) {
                    // 後ろから追っかける（バードビュー
                    camera.radius = 3;
                    camera.heightOffset = 1.1;
                    camera.cameraAcceleration = 0.1;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 1) {
                    // ちょい遅れて／離れて追っかける（バードビュー遠方
                    camera.radius = 8;
                    camera.heightOffset = 3;
                    camera.cameraAcceleration = 0.005;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 2) {
                    // 上空（トップビュー
                    camera.radius = 1;
                    camera.heightOffset = 20;
                    camera.cameraAcceleration = 0.5;
                    camera.maxCameraSpeed = 30;
                } else if (icamera == 3) {
                    // 正面（フロントビュー／ドライバーズビュー
                    camera.radius = 0.5;
                    camera.heightOffset = 0.1;
                    camera.cameraAcceleration = 0.3;
                    camera.maxCameraSpeed = 30;
                }
            } else if (kbInfo.event.key == 'n') {
                istage = (istage+1) % nstage;
                createState(istage);
                // reset charactor position
                characterController._position = new BABYLON.Vector3(0, 10, -8);

            } else if (kbInfo.event.key == 'r') {
                // キャラクターコントローラーの位置だけリセット
                // reset charactor position
                characterController._position = new BABYLON.Vector3(0, 10, -8);

            } else if (kbInfo.event.key === 'h') {
                //   キー操作(h)で表示のon/offを切り替え
                if (guiLabelRect.isVisible) {
                    guiLabelRect.isVisible = false;
                } else {
                    guiLabelRect.isVisible = true;
                }
            }

            break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            if (kbInfo.event.key == 'w' || kbInfo.event.key == 's' || kbInfo.event.key == 'ArrowUp' || kbInfo.event.key == 'ArrowDown') {
                inputDirection.z = 0;    
                keyAction.forward = 0;
                keyAction.back = 0;
            }
            if (kbInfo.event.key == 'a' || kbInfo.event.key == 'd' || kbInfo.event.key == 'ArrowLeft' || kbInfo.event.key == 'ArrowRight') {
                inputDirection.x = 0;
                keyAction.left = 0;
                keyAction.right = 0;
            } else if (kbInfo.event.key == ' ') {
                keyAction.jump = 0;
            }
            break;
        }
    });


    // 左上に使い方（操作方法）を表示
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let guiLabelRect = new BABYLON.GUI.Rectangle();
    guiLabelRect.adaptWidthToChildren = true;
    guiLabelRect.height = "150px";
    guiLabelRect.cornerRadius = 5;
    guiLabelRect.color = "Orange";
    guiLabelRect.thickness = 4;
    guiLabelRect.background = "green";
    advancedTexture.addControl(guiLabelRect);    
    let text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Usage:\n(W,S) or (Arrow UP/DOWN): Forward/Back\n(A,D) or (Arrow Left/Right): turn Left/Right\n(Space): jump\nC: change Camera\nN: Next stage\nR: Reset position\nH: show/hide this message";
    text1.color = "white";
    text1.width = "260px";
    text1.fontSize = 12;
    text1.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
    text1.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    text1.paddingLeft = 12;
    guiLabelRect.addControl(text1);    
    guiLabelRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    guiLabelRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    
    return scene;
};


/*

  +--------+    +---＼---+    +---＼---+    +---＼---+    +--││--+  
  | ／￣＼ |    | ／  ＼ |    | ／  ＼ |    | ／  ＼＿    | ／  ＼ |  
  |│    │|    |│    │|    |│     ／    |│     ＿    |│     ／  
  | ＼＿／ |    | ＼＿／ |    | ＼＿／ |    | ＼＿／ |    | ＼＿／ |  
  +--------+    +--------+    +--------+    +--------+    +--------+  
      N_            Nc           NcEc          NcEp          NpEc

  +--││--+    +---＼---+    +---＼---+    +---＼---+    +--││--+  
  | ／  ＼＿    | ／  ＼ |    | ／  ＼ |    | ／  ＼ |    | ／  ＼ |  
  |│     ＿    |│    │|    |│    │|    |│     ／    |│     ／  
  | ＼＿／ |    | ＼  ／ |    | ＼  ／ |    | ＼  ／ |    | ＼  ／ |  
  +--------+    +---＼---+    +--││--+    +---＼---+    +---＼---+  
     NpEp          NcSc          NcSp         NcEcSc        NpEcSc

  +---＼---+    +---＼---+  
  | ／  ＼＿    | ／  ＼ |  
  |│     ＿    ／      ／  
  | ＼  ／ |    | ＼  ／ |  
  +--││--+    +---＼---+  
    NcEpSp       NcEcScWc

*/

// 画像のブロックを崩すゲーム
//
// ## 遊び方
//
// - 左下にバケットのスタックが表示されます。スタックの一番上のバケットを選ぶことができます。
// - バケットを選ぶと右下のワークエリアに移動され、バケットと同じ色の画素（ブロック）を画像から取り崩し、バケットに貯めます。
// - バケットがいっぱいになったらワークエリアが空いて、次のバケットをスタックから選べます。
// - 画像をすべて切り崩せたらクリアです。



// ######################################################################

const ddbase1="../170/";
const ddbase2="../172/";
const ddbase3="./";

// const ddbase1="https://raw.githubusercontent.com/fnamuoo/webgl/main/170";
// const ddbase2="https://raw.githubusercontent.com/fnamuoo/webgl/main/172";
// const ddbase3="https://raw.githubusercontent.com/fnamuoo/webgl/main/173";

const iconPath52 = ddbase1+"textures/icon2w/コントロールボタン (7).png"
const iconPath53 = ddbase1+"textures/icon2w/リロードアイコン.png"
const iconPath54 = ddbase1+"textures/icon2w/コントロールボタン (5).png"

const iconPath62 = ddbase3+"textures/icon2w/矢印アイコン　右6.png"
const iconPath63 = ddbase3+"textures/icon2w/早送りボタン (2).png"

let mStageInfos = {
    0:{ fpath:ddbase2+"textures/icon2w/クリスマスベルの無料アイコン4.png",
        stack:[[[1,500],],
               [[1,500],],
               [[1,499],],
               [[1,150],[1,500],],],
      },
    10:{ fpath:ddbase2+"textures/demo/c06_101.png", // 10>5 babylon.js ロゴ
         stack2:[[[1,341],[9,4],[8,9],[5,290],],
                [[6,856],[7,275],],
                [[4,2],[2,7],[10,8],],
                [[3,362],],],
         
       },
    11:{ fpath:ddbase2+"textures/demo/c10_102.png", // 11 ドットキャラ 4x4
         stack:[[[1,133],[5,513],[7,204],[8,111],],
                [[6,26],[9,140],[1,888],],
                [[3,103],[2,105],],
                [[4,742],],],
       },
    17:{ fpath:ddbase2+"textures/demo/c12_co.png", // 17 カラー9x9
         stackAlg_type:"gemini",
         stackAlg_nBucket:3,
       },
    18:{ fpath:ddbase2+"textures/demo/c20_JbvoYlB.png", // 18 カラー4x4
         stackAlg_type:"gemini",
         stackAlg_nBucket:4,
       },
    13:{ fpath:ddbase2+"textures/demo/c10_ParallaxDiffuse.png", // 13 ブロック
        stack:[[[1,952],[3,916],[10,128],[7,435],[6,999],],
               [[8,628],[2,999],[5,999],[4,439],],
               [[9,586],[4,533],[5,383],[3,630],],
               [[2,37],[6,639],[9,70],[7,627],],],
       },
    19:{ fpath:ddbase2+"textures/demo/c20_spriteAtlas.png", //19>14  ドットキャラ 2x2
         stack:[[[7,2],[9,3],[15,4],[3,6],[2,9],[13,25],[8,32],[12,45],[17,84],[4,74],[10,89],[1,114],[19,88],[12,140],],
                [[13,2],[17,6],[1,6],[19,10],[1,35],[6,64],[2,107],[1,543],],
                [[6,1],[12,2],[10,9],[16,10],[18,25],[9,51],[5,59],[16,118],[14,87],[13,170],[1,181],],
                [[14,3],[4,9],[20,15],[7,60],[11,76],[3,416],],],
         // stackAlg_type:"gemini",
         // stackAlg_nBucket:1,
         // stackAlg_capRate:1.5,
       },
    12:{ fpath:ddbase2+"textures/demo/c10_mercator.png", // 12 世界地図
         stack:[[[2,138],[6,999],[6,999],[8,999],[9,999],[6,999],[9,999],[6,999],[6,999],[6,999],[6,999],[1,999],[6,999],[6,999],[6,999],[6,999],],
                 [[3,1],[5,839],[6,284],[8,791],[9,308],[10,999],[1,999],[6,999],[1,999],[2,459],[8,999],[4,323],[8,999],[6,999],[1,999],[1,999],[1,999],[2,999],[6,999],[6,999],[1,999],],
                 [[1,919],[7,11],[9,22],[6,999],[6,999],[6,999],[7,999],[8,999],[6,999],[6,999],[6,999],[1,999],[1,999],[9,999],[4,734],[6,999],[6,999],[1,999],[1,999],[6,999],[6,999],],
                 [[10,708],[7,400],[4,406],[3,252],[6,999],[6,999],[6,999],[3,999],[8,999],[6,999],[6,999],[6,999],[6,999],[6,999],[6,999],[6,999],[6,999],],],
    },
    16:{fpath:ddbase2+"textures/demo/c08_203.png", // 16 バビロンさん＋テニス
        stackAlg_type:"gemini",
        stackAlg_nBucket:2,
       },
    15:{fpath:ddbase2+"textures/demo/c08_202.png", // 15>10 バビロンさん＋車
        // stackAlg_type:"gemini",
        // stackAlg_nBucket:3,
       },
    14:{fpath:ddbase2+"textures/demo/c08_201.png", // 14 バビロンさん
       },
    999:{},
    6:{fpath:ddbase2+"textures/demo/c06_crate.png", // 6>1 木箱
       stack:[[[1,532],[6,351],[5,999],[4,999],[3,999],[4,999],[3,999],[3,999],[3,999],[3,999],[4,999],[2,999],[4,999],[5,999],[6,999],[5,999],[6,999],[5,999],[3,999],[2,999],[1,999],[2,999],[1,999],],
              [[5,28],[2,999],[3,999],[4,999],[4,999],[5,999],[3,999],[2,999],[5,999],[2,999],[2,999],[2,999],[1,999],[2,999],],
              [[3,730],[3,999],[2,999],[4,999],[3,999],[3,999],[3,999],[4,999],[3,999],[4,999],[3,999],[4,999],[4,999],[1,999],[1,999],[2,999],[2,999],[1,999],],
              [[2,439],[4,519],[4,999],[3,999],[3,999],[2,999],[3,999],[3,999],[4,999],[6,999],[6,999],[6,999],[1,999],[3,999],],],
      },
    8:{fpath:ddbase2+"textures/demo/c06_fur.png", // 8  黒斑点の毛皮
       stack:[[[4,28],[2,835],[3,999],[5,999],[5,999],[6,999],[3,999],[2,999],[2,999],[1,999],[3,999],[5,999],[5,999],[3,999],[2,999],[1,999],[2,999],],
              [[1,906],[6,999],[5,999],[2,999],[1,999],[1,999],[1,999],[4,999],[1,999],[6,999],[2,999],[2,999],[4,999],[3,999],[1,999],[3,999],[1,999],],
              [[3,939],[6,252],[1,999],[2,999],[2,999],[6,999],[4,999],[2,999],[4,999],[2,999],[6,999],[2,999],[3,999],[4,999],[1,999],[2,999],],
              [[5,61],[4,577],[2,999],[1,999],[1,999],[2,999],[1,999],[3,999],[6,999],[5,999],[2,999],[5,999],[1,999],[2,999],[2,999],[1,999],[2,999],[2,999],[1,999],],],
      },
    9:{fpath:ddbase2+"textures/demo/c06_floor.png", // 9>4 石畳
       stack:[[[2,924],[2,999],[3,999],[5,999],[2,999],[5,999],[1,999],[2,999],[3,999],[3,999],[1,999],[2,999],[2,999],[3,999],[1,999],[4,999],[3,999],],
              [[3,8],[5,925],[4,71],[6,169],[1,267],[3,680],[3,999],[2,999],[3,999],[1,999],[4,999],[2,999],[1,999],[2,999],[3,999],[3,999],[4,999],[3,999],[2,999],[3,999],[1,999],[2,999],[3,999],[3,999],[1,999],[1,999],[5,999],],
              [[3,999],[6,554],[3,999],[3,999],[2,999],[1,999],[2,999],[3,999],[2,999],[2,999],[3,999],],
              [[1,999],[4,999],[1,999],[2,999],[3,999],[4,999],[1,999],[6,999],[1,999],[3,999],[3,999],[4,999],[5,999],[4,999],[5,999],],],
      },
    7:{fpath:ddbase2+"textures/demo/c06_floor_bump.PNG", // 7 青紫のひび
       stack:[[[2,817],[6,598],[5,11],[5,450],[1,999],[5,999],[6,999],[2,999],[5,999],[2,999],[3,999],[1,999],[2,999],[2,999],[2,999],[2,999],[2,999],[2,999],[3,999],[2,999],[4,999],[2,999],[1,999],[2,999],[5,999],[2,999],],
              [[1,41],[3,999],[2,999],[2,999],[2,999],[3,999],[2,999],[2,999],[3,999],[6,999],[2,999],[2,999],[6,999],[5,999],[2,999],[6,999],[3,999],],
              [[4,2],[3,153],[3,999],[3,999],[3,999],[2,999],[6,999],[3,999],[5,999],[2,999],[5,999],[3,999],[3,999],[2,999],[2,999],],
              [[4,527],[2,999],[3,999],[2,999],[4,999],[5,999],[6,999],[3,999],[3,999],[1,999],[2,999],[3,999],[3,999],],],
      },
    60:{fpath:ddbase2+"textures/demo/c12_babylon_001.png", // 60>15 バビロンさん
        stackAlg_type:"gemini",
        stackAlg_nBucket:1,
        // stackAlg_type:"claude",
        // stackAlg_capRate:1.2,
       },
};

    let fpathList = [
    ];

    let stageList = [
        0,
        10, 11, 17, 18, 
        13, 19, 12,
        16, 15, 14, 
        999,
        6, 8, 9, 7, 60,
    ]

    let istage = 999;


export var createScene_test_3433 = async function () {

    // claude の手法が必ず解に近い（capRate:1.0なら完璧)、ただしCAPAが小さい
    // gemini の手法は 簡単な画像（色数が少ないもの）向け、nBuket を小さくしないと解けないこと多々あり
    let mkStackAlg = {
        // type:"claude",
        // capRate:1.0,
        capRate:1.5,
        type:"gemini",
        nBucket:3, 
    }

    // 固定のスタック（難度を安定させるため  / stacksOrg
    let mSstageStack = {};
    let mSstageStack_ = {



    }

    const scene = new BABYLON.Scene(engine);

    // 100x100のブロック群全体が見えるカメラ設定
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 160, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, -1), scene);
    light.intensity = 0.9;

    let CAPA_MAX = 999;
    let GRID_W = 100; // 横100ブロック
    let GRID_H = 100; // 縦100ブロック
    let TOTAL_BLOCKS = GRID_W * GRID_H;
    let PALETTE = [];
    let adt = null;
    let gameState = {};
    let colorIndices = null;
    let baseBox = null;
    let matrixBuffer = null, gameNeighbors = null, dummyMatrix = null, gameAlive = null, gameOuterSets = null;

    const dummyMatrix00 = new BABYLON.Matrix();
    BABYLON.Matrix.FromValues(
        0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1,
        dummyMatrix00
    );

    function getIndex(x, y) { return y * GRID_W + x; }

    let createStage = async function(istage) {
console.log("state=",istage);
        if (baseBox != null) {
            baseBox.material?.dispose()
            baseBox.dispose();
        }
        if (renderobj1 != null) {
            scene.onBeforeRenderObservable.remove(renderobj1); renderobj1 = null;
        }

        let stageInfo = mStageInfos[istage];
        let fpath = "";
        let stacksOrg = null;
        let _mkStackAlg = {
            type:mkStackAlg.type,
            nBucket:mkStackAlg.nBucket, 
            capRate:mkStackAlg.capRate,
        }
        if (stageInfo) {
            fpath = (stageInfo.fpath||"");
            stacksOrg = (stageInfo.stack ?? null);
            _mkStackAlg.type = (stageInfo.stackAlg_type ?? mkStackAlg.type)
            _mkStackAlg.nBucket = (stageInfo.stackAlg_nBucket ?? mkStackAlg.nBucket)
            _mkStackAlg.capRate = (stageInfo.stackAlg_capRate ?? mkStackAlg.capRate)
        }

        // --- 2. 画像の読み込みとピクセルデータの取得 ---
        // 画像を読み込んで画素位置に応じたカラーパレットのindexの配列(colorIndices)を返す
        PALETTE = [
            { name: "trans", color: BABYLON.Color3.Black() },
        ];
        function loadPixelData() {
            let ipallet = 0;
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = fpath;
                let mRGB2iP = {}; // カラーパレット key:RGB, val:パレット番号

                let processImg = (imageObj) => {
                    let width = imageObj.naturalWidth ?? imageObj.width;
                    let height = imageObj.naturalHeight ?? imageObj.height;
                    console.log("imgSize=",width, height);
                    GRID_W = width;
                    GRID_H = height;
                    TOTAL_BLOCKS = GRID_W * GRID_H;
                    alive = new Uint8Array(TOTAL_BLOCKS).fill(1); // ブロックの有効／無効フラグ

                    const cvs = document.createElement("canvas");
                    cvs.width = GRID_W;
                    cvs.height = GRID_H;
                    const ctx = cvs.getContext("2d");
                    ctx.drawImage(imageObj, 0, 0, GRID_W, GRID_H);
                    try {
                        const imgData = ctx.getImageData(0, 0, GRID_W, GRID_H).data;
                        // const colorIndices = new Uint8Array(TOTAL_BLOCKS);
                        const colorIndices = new Uint16Array(TOTAL_BLOCKS);
                        for (let i = 0; i < TOTAL_BLOCKS; i++) {
                            let r = imgData[i * 4];
                            let g = imgData[i * 4 + 1];
                            let b = imgData[i * 4 + 2];
                            let a = imgData[i * 4 + 3];
                            if (a == 0) {
                                // 透過
                                colorIndices[i] = 0;
                                alive[i] = 0;
                            } else {
                                let cckey = "" + r + "," + g + "," + b;
                                if (mRGB2iP[cckey]) {
                                    colorIndices[i] = mRGB2iP[cckey];
                                } else {
                                    mRGB2iP[cckey] = ++ipallet;
                                    colorIndices[i] = mRGB2iP[cckey];
                                    let c =  new BABYLON.Color3(r/255,g/255,b/255);
                                    PALETTE.push({color:c, colorHSV:c.toHSV(), colorHex:c.toHexString()});
                                }
                            }
                        }
                        resolve(colorIndices);
                    } catch(e) {
                        console.log(e);
                        return;
                    }
                };
                img.onload = () => processImg(img);
                img.onerror = () => {
                    // 画像取得エラー時のプロシージャルフォールバック（チェック柄＋ノイズ）
                    PALETTE = [
                        { name: "trans", color: BABYLON.Color3.Black() },
                    ];
                    GRID_W = 100;
                    GRID_H = 100;
                    TOTAL_BLOCKS = GRID_W * GRID_H;
                    const cvs = document.createElement("canvas");
                    cvs.width = GRID_W; cvs.height = GRID_H;
                    let nc = 10;
                    for (let ic = 0; ic < nc; ++ic) {
                        let c =  new BABYLON.Color3.Random();
                        PALETTE.push({color:c, colorHSV:c.toHSV(), colorHex:c.toHexString()});
                    }
                    const ctx = cvs.getContext("2d");
                    for (let y = 0; y < GRID_H; y++) {
                        for (let x = 0; x < GRID_W; x++) {
                            // let cIdx = Math.floor(Math.sin(x*0.1) * Math.cos(y*0.1) * 3.5 + 3.5) % PALETTE.length;
                            let cIdx = Math.floor(Math.sin(x*0.1) * Math.cos(y*0.1) * 3.5 + 3.5) % nc + 1;
                            ctx.fillStyle = `rgb(${PALETTE[cIdx].color.r*255},${PALETTE[cIdx].color.g*255},${PALETTE[cIdx].color.b*255})`;
                            ctx.fillRect(x, y, 1, 1);
                        }
                    }
                    processImg(cvs);
                };
            });
        }
        let alive = null; // new Uint8Array(TOTAL_BLOCKS).fill(1); // ブロックの有効／無効フラグ
        // 画像を読み込んで画素位置に応じたカラーパレットのindexの配列(colorIndices)を取得
        // const colorIndices = await loadPixelData();
        colorIndices = await loadPixelData();

        // --- 3. 高速アルゴリズム（10,000ブロック用 O(1) 外側判定付きシミュレーション） ---
        // 各ブロックの隣接情報
        const neighbors = new Uint8Array(TOTAL_BLOCKS); // 隣接するブロックの数


        // バケット作成アルゴリズム
        // 正順解体シミュレーションで確実にクリア可能な手順を生成
        let stacks = [[], [], [], []];
        const iround = [[0,-1],[0,1],[-1,0],[1,0]];
        let GRID_W_ = GRID_W-1;
        let GRID_H_ = GRID_H-1;
        {
            // 初期化：隣接生存数のカウント / 隣接する有効なブロックの数
            let simBlocksLeft = 0;
            for (let y = 0; y < GRID_H; y++) {
                for (let x = 0; x < GRID_W; x++) {
                    let idx = getIndex(x, y)
                    neighbors[idx] = 0;
                    if (alive[idx] == 0) {
                        continue;
                    }
                    ++simBlocksLeft;
                    for (let [dx,dy] of iround) {
                        let xx = x + dx;
                        let yy = y + dy;
                        if (xx < 0 || xx > GRID_W_) continue;
                        if (yy < 0 || yy > GRID_H_) continue;
                        let iidx = getIndex(xx, yy)
                        neighbors[idx] += alive[iidx];
                    }
                }
            }

            // 色別の「外側ブロック（取り出し可能）」管理用Set
            // 高速アクセスために、取出し候補を outerSets に登録
            //   key:カラーパレットのindex
            //   val:画素のindex
            const outerSets = Array.from({ length: PALETTE.length }, () => new Set());
            for (let i = 0; i < TOTAL_BLOCKS; i++) {
                if (alive[i] && neighbors[i] < 4) {
                    outerSets[colorIndices[i]].add(i);
                }
            }


            // ----------------------------------------
            // 正順解体シミュレーションで確実にクリア可能な手順を生成
            let bucketSequence = [];
            let simWorkArea = []; // { colorIdx, count, capacity }

            let algType = "gemini";

            if (_mkStackAlg.type == "gemini") {
                // // 正順解体シミュレーションで確実にクリア可能な手順を生成

                while (simBlocksLeft > 0) {
                    let targetColorIdx = -1;
                    let targetBlockIdx = -1;

                    // 1. ワークエリアにあるバケットの色に一致する外側ブロックを探す
                    for (let w of simWorkArea) {
                        if (outerSets[w.colorIdx].size > 0) {
                            targetColorIdx = w.colorIdx;
                            targetBlockIdx = outerSets[w.colorIdx].values().next().value;
                            break;
                        }
                    }

                    // 2. なければ、ワークエリアに空きがある場合に一番数の多い外側ブロックの色を選ぶ
                    if (targetBlockIdx === -1 && simWorkArea.length < _mkStackAlg.nBucket) {
                        let maxCount = -1;
                        for (let c = 0; c < PALETTE.length; c++) {
                            if (outerSets[c].size > maxCount && outerSets[c].size > 0) {
                                maxCount = outerSets[c].size;
                                targetColorIdx = c;
                            }
                        }
                        if (targetColorIdx !== -1) {
                            targetBlockIdx = outerSets[targetColorIdx].values().next().value;
                        }
                    }

                    // 3. デッドロック回避: ワークエリアが5個埋まり取り出せるブロックがない場合
                    if (targetBlockIdx === -1) {
                        // // カウントが最少のバケットを現在カウントで強制クローズ（枠を空ける）
                        simWorkArea.sort((a, b) => a.count - b.count);
                        let closed = simWorkArea.shift();
                        closed.capacity = closed.count;
                        bucketSequence.push(closed);
                        continue;
                    }

                    // ブロックを取り除く処理
                    alive[targetBlockIdx] = 0;
                    outerSets[targetColorIdx].delete(targetBlockIdx);
                    simBlocksLeft--;

                    // 取り除いたブロックの四方の隣接数を減らし、新たに外側になったものをOuterに追加
                    let tx = targetBlockIdx % GRID_W;
                    let ty = Math.floor(targetBlockIdx / GRID_W);
                    const adj = [
                        ty > 0 ? getIndex(tx, ty - 1) : -1,
                        ty < GRID_H - 1 ? getIndex(tx, ty + 1) : -1,
                        tx > 0 ? getIndex(tx - 1, ty) : -1,
                        tx < GRID_W - 1 ? getIndex(tx + 1, ty) : -1
                    ];

                    for (let nIdx of adj) {
                        if (nIdx !== -1 && alive[nIdx]) {
                            neighbors[nIdx]--;
                            if (neighbors[nIdx] === 3) { // 囲みが解除されて外側になった
                                outerSets[colorIndices[nIdx]].add(nIdx);
                            }
                        }
                    }

                    // バケットデータの更新
                    let bucket = simWorkArea.find(w => w.colorIdx === targetColorIdx);
                    if (!bucket) {
                        bucket = { colorIdx: targetColorIdx, count: 0, capacity: 999 };
                        bucket.capacity = CAPA_MAX;
                        simWorkArea.push(bucket);
                    }
                    bucket.count++;

                    if (bucket.count === bucket.capacity) {
                        bucketSequence.push(bucket);
                        // simWorkArea から bucket を削除
                        simWorkArea = simWorkArea.filter(w => w !== bucket);
                    }
                }

                // 残りのバケットを確定
                simWorkArea.forEach(w => {
                    w.capacity = w.count;
                    bucketSequence.push(w);
                });

            } else if (_mkStackAlg.type == "claude") {
                // 正順解体シミュレーションで確実にクリア可能な手順を生成
                // バケット容量は「今実際に取り出せる数（外側ブロック数）」に合わせて動的に決め、
                // 必ず99個以内に収める。これにより1色が長時間ワークエリアを占有せず、
                // 色が細かく入り混じった画像でも同時に必要な色数が枠数を超えて詰む事態を減らせる。
                const WORK_AREA_LIMIT = 5; // 実ゲームのワークエリア上限に合わせる（難度を上げたいなら減らしてOK）

                // 各色についてこれから確保すべき残り総数（＝生成するバケット容量の合計と最終的に一致する）
                let remainingToAssign = new Array(PALETTE.length).fill(0);
                for (let i = 0; i < TOTAL_BLOCKS; i++) {
                    if (alive[i]) remainingToAssign[colorIndices[i]]++;
                }

                function pickColorToActivate() {
                    // まだアクティブでなく、今1個以上取り出せる色の中から
                    // 「今取り出せる数が一番多い」色を選ぶ（frontierが0の色は先取りしない）
                    let activeColors = new Set(simWorkArea.map(w => w.colorIdx));
                    let best = -1, bestSize = -1;
                    for (let c = 1; c < PALETTE.length; c++) { // c=0(透過)は対象外
                        if (remainingToAssign[c] <= 0) continue;
                        if (activeColors.has(c)) continue;
                        let sz = outerSets[c].size;
                        if (sz <= 0) continue; // パレットだけがあり、画像上にないならskip
                        if (sz > bestSize) { bestSize = sz; best = c; }
                    }
                    return best;
                }

                function pickBucketToFeed() {
                    // アクティブなバケットの中で、今取り出せる数が一番多いものを優先して消費する
                    // （特定の色に露出が偏って他が枯れるのを防ぐ）
                    let best = null, bestSize = -1;
                    for (let w of simWorkArea) {
                        if (w.count >= w.capacity) continue;
                        let sz = outerSets[w.colorIdx].size;
                        if (sz > bestSize) { bestSize = sz; best = w; }
                    }
                    return best;
                }

                while (simBlocksLeft > 0) {
                    // 1. ワークエリアに空きがあれば必要な色を追加投入
                    while (simWorkArea.length < WORK_AREA_LIMIT) {
                        let c = pickColorToActivate();
                        if (c === -1) break;
                        let cap = Math.min(CAPA_MAX, remainingToAssign[c], outerSets[c].size);
                        remainingToAssign[c] -= cap;
                        cap = Math.floor(Math.min(CAPA_MAX, cap*_mkStackAlg.capRate));
                        simWorkArea.push({ colorIdx: c, count: 0, capacity: cap });
                    }

                    // 2. アクティブなバケットのうち取り出せるものを1個消費
                    let bucket = pickBucketToFeed();

                    if (!bucket) {
                        // 極めて稀なケース：現在アクティブな枠がどれも今は取り出せない状態。
                        // 最も消費が少ないバケットをその時点のカウントで確定し、枠を空ける。
                        // 使わなかった分の容量は remainingToAssign に払い戻し、
                        // 後で別バケットとして必ず再割当てされるようにする。
                        simWorkArea.sort((a, b) => a.count - b.count);
                        let closed = simWorkArea.shift();
                        let leftover = closed.capacity - closed.count;
                        if (leftover > 0) remainingToAssign[closed.colorIdx] += leftover;
                        closed.capacity = closed.count; // 実際に入った量だけを容量として確定
                        if (closed.capacity > 0) bucketSequence.push(closed);
                        continue;
                    }

                    let targetBlockIdx = outerSets[bucket.colorIdx].values().next().value;

                    // ブロックを取り除く処理
                    alive[targetBlockIdx] = 0;
                    outerSets[bucket.colorIdx].delete(targetBlockIdx);
                    simBlocksLeft--;
                    bucket.count++;

                    // 取り除いたブロックの四方の隣接数を減らし、新たに外側になったものをOuterに追加
                    let tx = targetBlockIdx % GRID_W;
                    let ty = Math.floor(targetBlockIdx / GRID_W);
                    const adj = [
                        ty > 0 ? getIndex(tx, ty - 1) : -1,
                        ty < GRID_H - 1 ? getIndex(tx, ty + 1) : -1,
                        tx > 0 ? getIndex(tx - 1, ty) : -1,
                        tx < GRID_W - 1 ? getIndex(tx + 1, ty) : -1
                    ];
                    for (let nIdx of adj) {
                        if (nIdx !== -1 && alive[nIdx]) {
                            neighbors[nIdx]--;
                            if (neighbors[nIdx] === 3) {
                                outerSets[colorIndices[nIdx]].add(nIdx);
                            }
                        }
                    }
                    if (bucket.count === bucket.capacity) {
                        bucketSequence.push(bucket);
                        simWorkArea = simWorkArea.filter(w => w !== bucket);
                    }
                }

                // 残ったバケットを確定（容量は活性化時点で既にCAPA_MAX以内に収まっている）
                simWorkArea.forEach(w => {
                    bucketSequence.push(w);
                });

                // bucketSequence をマージ
                {
                    const INDEX_RANGE = 10;
                    let result = bucketSequence;
                    // const result = list.map(item => ({ ...item }));
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].capacity == 0) {continue;}
                        for (let j = i + 1; j < result.length; j++) {
                            // index の差が範囲を超えたら、
                            // それ以降も対象外なので終了
                            if (j - i > INDEX_RANGE) {
                                break;
                            }
                            // colorIdx が異なる場合は対象外
                            if (result[i].colorIdx !== result[j].colorIdx) {
                                continue;
                            }
                            const total = result[i].capacity + result[j].capacity;
                            if (total <= CAPA_MAX) {
                                // 全部前の要素に集約
                                result[i].capacity = total;
                                result[j].capacity = 0;
                            } else {
                                // 前を最大値にし、余りを後ろに残す
                                result[i].capacity = CAPA_MAX;
                                result[j].capacity = total - CAPA_MAX;
                            }
                        }
                    }
                    bucketSequence = result.filter(item => item.capacity > 0);                    
                }
            }


            {
                // debug
                let s = "\nbucketSequence=\n";
                for (let i = 0; i < bucketSequence.length; ++i) {
                    let e = bucketSequence[i];
                    e._i = i;
                    s += "["+e.colorIdx+","+e.capacity+"],";
                }
                console.log(s);
            }

            stacks = [[], [], [], []];

            if (1) {
            if (stacksOrg == null) {
                // 固定の指定なし.. bucketSequenceを使う(毎回に変更)
                // 4列のスタックへ逆順シャッフル配置
                for (let i = bucketSequence.length - 1; i >= 0; i--) {
                    if (bucketSequence[i].capacity == 0) {continue;}
                    let col = Math.floor(Math.random() * 4);
                    stacks[col].push(bucketSequence[i]);
                }
            } else {
                // 固定の指定あり
                let col = 0;
                for (let istack of stacksOrg) {
                    for (let e of istack) {
                        let plt = PALETTE[e[0]];
                        if (!plt) {
                            // 画像を入れ替えた場合ににハードコードのパレットとズレる可能性あり
                            throw new Error(
                                `Invalid colorIdx=${e[0]} for stage=${istage}`
                            );
                        }
                        let bucket = { colorIdx:e[0], count:0, capacity:e[1],
                                       color:plt.color, colorHSV:plt.colorHSV, colorHex:plt.colorHex, };
                        if (bucket.capacity == 0) {
                            continue;
                        }
                        stacks[col].push(bucket);
                    }
                    ++col;
                }
            }
            }
        }

        {
            // debug
            console.log(" // palletID, capa=");
            let icol = 0;
            let s = "\n";
            for (let stack of stacks) {
                s += "[";
                for (let e of stack) {
                    if (e.capacity == 0) {
                        continue;
                    }
                    s += "["+e.colorIdx+","+e.capacity+"],";
                }
                s += "],\n";
                ++icol;
            }
            console.log(s);
        }

        // --- 4. ThinInstance による 10,000ブロック描画 ---
        // ThinInstance 用バッファ作成 (Matrix: 16 floats, Color: 4 floats)
        const colorBuffer = new Float32Array(TOTAL_BLOCKS * 4);
        // const dummyMatrix = new BABYLON.Matrix();
        matrixBuffer = new Float32Array(TOTAL_BLOCKS * 16);
        dummyMatrix = new BABYLON.Matrix();
        // 初期ゲーム状態の実装データ復元
        gameAlive = new Uint8Array(TOTAL_BLOCKS).fill(1);
        gameNeighbors = new Uint8Array(TOTAL_BLOCKS);
        gameOuterSets = Array.from({ length: PALETTE.length }, () => new Set());
        let vBlocksLeft = 0;
        for (let y = 0; y < GRID_H; y++) {
            for (let x = 0; x < GRID_W; x++) {
                let i = getIndex(x, y);
                // 位置設定 (中央寄せ)
                let posX = x - GRID_W / 2 + 0.5;
                let posY = -(y - GRID_H / 2 + 0.5);
                BABYLON.Matrix.TranslationToRef(posX, posY, 0, dummyMatrix);
                dummyMatrix.copyToArray(matrixBuffer, i * 16);
                // 色設定
                let pColor = PALETTE[colorIndices[i]].color;
                colorBuffer[i * 4] = pColor.r;
                colorBuffer[i * 4 + 1] = pColor.g;
                colorBuffer[i * 4 + 2] = pColor.b;
                colorBuffer[i * 4 + 3] = 1.0;
                if (colorIndices[i] == 0) {
                    // 透過
                    gameAlive[i] = 0;
                    dummyMatrix00.copyToArray(matrixBuffer, i * 16); // 表示させない：スケール 0 に
                    gameNeighbors[i] = 0;
                    continue;
                }
                ++vBlocksLeft;
                // ゲーム用隣接計算
                let count = 0;
                for (let [dx,dy] of iround) {
                    let xx = x + dx;
                    let yy = y + dy;
                    if (xx < 0 || xx > GRID_W_) continue;
                    if (yy < 0 || yy > GRID_H_) continue;
                    let iidx = getIndex(xx, yy)
                    count += (colorIndices[iidx] == 0) ? 0 : 1;
                }
                gameNeighbors[i] = count;
                if (count < 4) gameOuterSets[colorIndices[i]].add(i);
            }
        }
        baseBox = BABYLON.MeshBuilder.CreateBox("block", { size:1 }, scene);
        baseBox.material = new BABYLON.StandardMaterial('mat', scene);
        baseBox.material.diffuseColor = BABYLON.Color3.White();
        baseBox.material.specularColor = BABYLON.Color3.Black(); // 光源の反射を消す
        baseBox.material.emissiveColor = BABYLON.Color3.White();
        baseBox.thinInstanceSetBuffer("matrix", matrixBuffer, 16, false);
        baseBox.thinInstanceSetBuffer("color", colorBuffer, 4, false);

        // --- ゲーム状態管理 ---
        gameState = {
            workArea: [],
            stacks: stacks,
            blocksLeft: vBlocksLeft, // TOTAL_BLOCKS,
            gameOver: false,
            gameClear: false
        };

        updateUI();

        // // --- 6. 自動吸収ループ (フレーム処理) ---
        // // 毎秒数回のペースで自動吸収を進行
        renderobj1 = scene.onBeforeRenderObservable.add(renderfun1);
    }

    let createstageLock = false;
    async function createStageSafe(stage) {
        if (createstageLock) return;
        createstageLock = true;
        try {
            await createStage(stage);
        } finally {
            createstageLock = false;
        }
    }
    let backStage = async function() {
        if (createstageLock) return;
        let i = stageList.indexOf(istage);
        i = (i+stageList.length-1) % stageList.length;
        istage = stageList[i];
        await createStageSafe(istage);
    }
    let nextStage = async function() {
        if (createstageLock) return;
        let i = stageList.indexOf(istage);
        i = (i+1) % stageList.length;
        istage = stageList[i];
        await createStageSafe(istage);
    }

    // --- 5. UI ---
    if (adt != null) {
        adt.dispose();
    }
    adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // UIコンテナ (ワークエリア: 右下)
    const workAreaContainer = new BABYLON.GUI.StackPanel();
    workAreaContainer.isVertical = false;
    workAreaContainer.height = "90px";
    workAreaContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    workAreaContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    workAreaContainer.top = "15px";
    adt.addControl(workAreaContainer);

    // UIコンテナ (4列スタック: 左下)
    const stacksContainer = new BABYLON.GUI.StackPanel();
    stacksContainer.isVertical = false;
    // stacksContainer.height = "220px";
    stacksContainer.height = "160px";
    stacksContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    stacksContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    stacksContainer.bottom = "15px";
    adt.addControl(stacksContainer);

    const stackPanels = [];
    for (let i = 0; i < 4; i++) {
        let sp = new BABYLON.GUI.StackPanel();
        sp.isVertical = true;
        // sp.width = "90px";
        sp.width = "80px";
        sp.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        stacksContainer.addControl(sp);
        stackPanels.push(sp);
    }


    // ----------------------------------------
    {
        let fpathList = [iconPath52, iconPath53, iconPath54 ];
        let guiIconList = [];
console.log("!!!");
        for (let i = 0; i < fpathList.length; ++i) {
console.log("!!!");
            let fpath = fpathList[i];
            let guiIcon = new BABYLON.GUI.Image("", fpath);
            guiIcon.width = "60px";
            guiIcon.height = "60px";
            guiIcon.top = "10px";
            guiIcon.left = "-" + ((fpathList.length-i-1)*70+10)+ "px";
            guiIcon.autoScale = false
            guiIcon.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            guiIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            guiIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            adt.addControl(guiIcon);   
            guiIconList.push(guiIcon);
        }
        {
            guiIconList[0].onPointerUpObservable.add(function() {
                console.log("back stage:");
                backStage();
            });
        }
        {
            guiIconList[1].onPointerUpObservable.add(function() {
                console.log("reload:");
                createStageSafe(istage);
            });
        }
        {
            guiIconList[2].onPointerUpObservable.add(function() {
                console.log("next stage:");
                nextStage();
            });
        }
    }


    // ----------------------------------------
    let timerMod = 2;
    {
        let fpathList = [iconPath62, iconPath63 ];
        let guiIconList = [];
        for (let i = 0; i < fpathList.length; ++i) {
            let fpath = fpathList[i];
            let guiIcon = new BABYLON.GUI.Image("", fpath);
            guiIcon.width = "60px";
            guiIcon.height = "60px";
            guiIcon.top = "10px";
            guiIcon.left = "" + (i*70+10)+ "px";
            guiIcon.autoScale = false
            guiIcon.stretch = BABYLON.GUI.Image.STRETCH_NONE;
            guiIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            guiIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            adt.addControl(guiIcon);   
            guiIconList.push(guiIcon);
        }
        {
            guiIconList[0].onPointerUpObservable.add(function() {
                timerMod += 5;
                // console.log("normal:", timerMod);
            });
        }
        {
            guiIconList[1].onPointerUpObservable.add(function() {
                timerMod = 1;
                // console.log("rapid:", timerMod);
                timer = 0;
            });
        }
    }

    // ----------------------------------------

    function updateUI_workVal() {
        for (let i = 0; i < gameState.workArea.length; ++i) {
            let btn = workAreaContainer.children[i];
            let backet = gameState.workArea[i];
            btn.textBlock.text = `${backet.count}/${backet.capacity}`
        }
    }

    function updateUI_workArea() {
        // ワークエリア描画
        workAreaContainer.clearControls();
        gameState.workArea.forEach(b => {
            let btn = BABYLON.GUI.Button.CreateSimpleButton("wBtn", `${b.count}/${b.capacity}`);
            btn.width = "90px"; btn.height = "75px";
            let cHSV = PALETTE[b.colorIdx].colorHSV;
            if (cHSV.b < 0.7) {
                btn.color = "white"; btn.fontWeight = "bold"; btn.fontSize = 18;
            } else {
                btn.color = "black"; btn.fontWeight = "bold"; btn.fontSize = 18;
            }
            btn.background = PALETTE[b.colorIdx].colorHex;
            btn.paddingLeft = "4px"; btn.paddingRight = "4px";
            workAreaContainer.addControl(btn);
        });
        // ワークエリアの空枠 (最大5個)
        for (let i = gameState.workArea.length; i < 5; i++) {
            let empty = new BABYLON.GUI.Rectangle();
            // empty.width = "75px"; empty.height = "75px";
            empty.width = "90px"; empty.height = "75px";
            empty.color = "rgba(255,255,255,0.4)"; empty.thickness = 2;
            empty.dash = [4, 4]; empty.paddingLeft = "4px"; empty.paddingRight = "4px";
            workAreaContainer.addControl(empty);
        }
    }

    function updateUI() {
        updateUI_workArea();
        // 4列スタック描画
        for (let i = 0; i < 4; i++) {
            stackPanels[i].clearControls();
            let stack = gameState.stacks[i];
            if (stack.length == 0) {
                // let b = stack[j];
                stackPanels[i].width = "0px";
            }  else {
                stackPanels[i].width = "80px";
            }
            // スタックの上部5個を表示
            let irank = 0;
            for (let j = stack.length - 1; j >= Math.max(0, stack.length - 5); j--) {
                let b = stack[j];
                if (b.capacity == 0) {continue;}
                let btn = BABYLON.GUI.Button.CreateSimpleButton("sBtn", `${b.capacity}`);
                if (irank == 0) {
                btn.width = "80px"; btn.height = "38px";
                } else {
                btn.width = "60px"; btn.height = "38px";
                }
                // btn.width = "80px"; btn.height = "38px";
                // let cHSV = PALETTE[b.colorIdx].color.toHSV();
                let cHSV = PALETTE[b.colorIdx].colorHSV;
                if (cHSV.b < 0.7) {
                    btn.color = "white"; btn.fontWeight = "bold";
                } else {
                    btn.color = "black"; btn.fontWeight = "bold";
                }
                // btn.color = "white"; btn.fontWeight = "bold";
                // btn.background = PALETTE[b.colorIdx].color.toHexString();
                btn.background = PALETTE[b.colorIdx].colorHex;
                btn.paddingBottom = "4px";
                if (j === stack.length - 1) { // 先頭（操作可能）
                    btn.onPointerUpObservable.add(() => selectStack(i));
                    btn.thickness = 3;
                } else {
                    // btn.alpha = 0.4; // 下手に色を変えると、分かりにくくなる
                    btn.thickness = 1;
                }
                stackPanels[i].addControl(btn);
                ++irank;
            }
        }
    }

    // ユーザー操作：スタックからの選択のみ
    function selectStack(colIndex) {
        if (gameState.gameOver || gameState.gameClear) return;
        if (gameState.workArea.length >= 5) return; // ワークエリア満杯
        let stack = gameState.stacks[colIndex];
        if (stack.length === 0) return;
        let bucketDef = stack.pop();
        gameState.workArea.push({
            colorIdx: bucketDef.colorIdx,
            capacity: bucketDef.capacity,
            count: 0
        });
        updateUI();
    }

    // --- 6. 自動吸収ループ (フレーム処理) ---
    function processAutoAbsorption() {
        if (gameState.gameOver || gameState.gameClear) return;

        let updatedInstances = false;

        // ワークエリアの各バケットで自動吸収を実施
        for (let bucket of gameState.workArea) {
            if (bucket.count >= bucket.capacity) continue;
            let outerSet = gameOuterSets[bucket.colorIdx];
            if (outerSet.size > 0) {
                // 外側にある同じ色のブロックを1つ取り出す
                let targetIdx = outerSet.values().next().value;
                // ブロック消滅
                gameAlive[targetIdx] = 0;
                outerSet.delete(targetIdx);
                bucket.count++;
                gameState.blocksLeft--;
                // ThinInstance の Matrix をスケール0にして消去
                dummyMatrix00.copyToArray(matrixBuffer, targetIdx * 16);
                updatedInstances = true;
                // 隣接ブロックの開放処理
                let tx = targetIdx % GRID_W;
                let ty = Math.floor(targetIdx / GRID_W);
                const adj = [
                    ty > 0 ? getIndex(tx, ty - 1) : -1,
                    ty < GRID_H - 1 ? getIndex(tx, ty + 1) : -1,
                    tx > 0 ? getIndex(tx - 1, ty) : -1,
                    tx < GRID_W - 1 ? getIndex(tx + 1, ty) : -1
                ];
                for (let nIdx of adj) {
                    if (nIdx !== -1 && gameAlive[nIdx]) {
                        gameNeighbors[nIdx]--;
                        if (gameNeighbors[nIdx] === 3) {
                            gameOuterSets[colorIndices[nIdx]].add(nIdx);
                        }
                    }
                }
            }
        }

        // 薄型インスタンスの描画更新
        if (updatedInstances) {
            baseBox.thinInstanceBufferUpdated("matrix");
        }

        // 満杯バケットの消去
        let prevCount = gameState.workArea.length;
        gameState.workArea = gameState.workArea.filter(b => b.count < b.capacity);
        if (prevCount !== gameState.workArea.length) {
            updateUI_workArea()
        } else if (updatedInstances) {
            updateUI_workVal()
        }

        // 勝敗判定
        if (gameState.blocksLeft <= 0 && !gameState.gameClear) {
            gameState.gameClear = true;
            showEndMessage("CLEAR!!");
            setTimeout(() => {
                nextStage();
            }, 4*1000);

                let s = "\n";
                for (let bucket of gameState.workArea) {
                    s += "colorIdx:"+bucket.colorIdx+" "+bucket.count+"/"+bucket.capacity;
                }
                console.log(s);

        } else if (gameState.workArea.length >= 5 && !gameState.gameOver) {
            // 5枠全て埋まり、吸収可能な外側ブロックが1つもない場合
            let canAbsorb = gameState.workArea.some(b => gameOuterSets[b.colorIdx].size > 0);
            if (!canAbsorb) {
                gameState.gameOver = true;
                showEndMessage("GAME OVER\n(No moves left)");

                let s = "\n";
                for (let bucket of gameState.workArea) {
                    s += "colorIdx:"+bucket.colorIdx+" "+bucket.count+"/"+bucket.capacity;
                }
                console.log(s);
            }
        }
    }

    let renderobj1 = null;
    // 毎秒数回のペースで自動吸収を進行
    let timer = 0;
    let renderfun1 = function() {
        timer++;
        if (timer % timerMod === 0) { // timerMod フレームごとに1個吸い込む（スピード調整）
            processAutoAbsorption();
        }
    }


    function showEndMessage(msg) {
        let rect = new BABYLON.GUI.Rectangle();
        rect.width = "100%"; rect.height = "100%";
        rect.background = "rgba(0,0,0,0.75)"; rect.thickness = 0;
        adt.addControl(rect);
        let txt = new BABYLON.GUI.TextBlock();
        txt.text = msg; txt.color = "white"; txt.fontSize = 60; txt.fontWeight = "bold";
        rect.addControl(txt);
        // 一定時間後にメッセージ解除
        setTimeout(() => {
            adt.removeControl(rect);
            rect.dispose();
        }, 3*1000);
    }


    createStageSafe(istage);

    return scene;
};

 export var createScene = createScene_test_3433; // ボタンの反応向上

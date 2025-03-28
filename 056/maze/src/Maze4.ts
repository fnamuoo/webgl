// -*- mode:javascript; coding:utf-8 -*-
// 通路と壁が同じサイズの迷路(maze1の3D版

function shuffle(array: number[]) {
  let currentIndex = array.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
}

function eqv3(p1: number[], p2: number[]): boolean {
  return ((p1[0] == p2[0]) && (p1[1] == p2[1]) && (p1[2] == p2[2]));
}


// 座標軸は cannonjs に合わせる
//   |y
//   |____ x
//   /
//  /z

// ６方向と対応するベクトル
//   [x, y ,z]
export const IDIR: number[][] =
    [[ 0, 0, 1],   // 0 南
     [ 1, 0, 0],   // 1 東
     [ 0, 1, 0],   // 2 上
     [ 0, 0,-1],   // 3 北
     [-1, 0, 0],   // 4 西
     [ 0,-1, 0],   // 5 下
    ];
const IDIRrv: {[key: string]: number} =
    {"0,0,1":2,
     "1,0,0":0,
     "0,1,0":1,
     "0,0,-1":5,
     "-1,0,0":3,
     "0,-1,0":4,
    };


export class Maze4 {
  // 壁と通路が同じ大きさの3D(x,y,z)迷路
  readonly type_: number = 4;
  nx_: number;
  ny_: number;
  nz_: number;
  nxz_: number;
  nxyz_: number;
  nx_1: number;
  ny_1: number;
  nz_1: number;
  pStart_: number[];
  pGoalList_: number[][];
  // 壁情報
  // [ix][iy][iz] = -1:かべ, 0:通路, 1以上:坂
  data_: number[][][];
  // 最短経路
  path2_: number[] = [];  // 幅優先用 / seekPath2

  constructor(nx: number=3, ny: number=3, nz: number=3) {
    this.nx_ = nx;
    this.ny_ = ny;
    this.nz_ = nz;
    this.nxz_ = this.nx_*this.nz_;
    this.nxyz_ = this.nx_*this.ny_*this.nz_;
    this.nx_1 = this.nx_-1;
    this.ny_1 = this.ny_-1;
    this.nz_1 = this.nz_-1;
    this.init(0);
    this.pStart_ = [1,1,1];
    this.pGoalList_ = []; // ゴールが複数の場合
  }

  init(defval: number): number[][][] {
    this.data_ = Array.from(new Array(this.nx_), () => {
      return Array.from(new Array(this.ny_), () => new Array(this.nz_).fill(defval));
    });
    return this.data_;
  }

  clearPath(): void {
    this.path2_ = [];  // 幅優先用 / seekPath2
  }

  isWall(ix: number, iy: number, iz: number): boolean {
    return (this.data_[ix][iy][iz] == -1);
  }
  isWall_s(ix: number, iy: number, iz: number): boolean {
    if ((ix < 0) || (iy < 0) || (iz < 0) || (ix >= this.nx_) || (iy >= this.ny_) || (iz >= this.nz_)) {
      return true;
    }
    return (this.isWall(ix, iy, iz));
  }

  isWallPosiDir(p: number[], idir: number): boolean {
    // 位置(posi)から 方向(idir)に壁があるか？
    let ix = p[0] + IDIR[idir][0], iy = p[1] + IDIR[idir][1], iz = p[2] + IDIR[idir][2];
    if ((ix < 0) || (iy < 0) || (iz < 0) || (ix >= this.nx_) || (iy >= this.ny_) || (iz >= this.nz_)) {
      return true;
    }
    return (this.data_[ix][iy][iz] == 1);
  }

  nWall(p: number[]): number {
    // 壁の数を数える .. 3:= 袋小路（行き止まり) 2:= 通路、 1:= 分岐(T字路)、0:=分岐(十字路)
    let icount = 0;
    for (let idir = 0; idir < 6; ++idir) {
      if (this.isWallPosiDir(p, idir)) {
        ++icount;
      }
    }
    return icount;
  }

  enableDig_s(ix: number, iy: number, iz: number): boolean {
    // 壁を掘れるか／壁があるか？（境界位置を加味して、境界なら優先して禁止／false)
    if ((ix < 0) || (iy < 0) || (iz < 0) || (ix >= this.nx_) || (iy >= this.ny_) || (iz >= this.nz_)) {
      return false;
    }
    return (this.data_[ix][iy][iz] == 1); // 壁なら true
  }

  isStreet(ix: number, iy: number, iz: number): boolean {
    return (this.data_[ix][iy][iz] == 0);
  }
  isStreet_s(ix: number, iy: number, iz: number): boolean {
    if ((ix < 0) || (iy < 0) || (iz < 0) || (ix >= this.nx_) || (iy >= this.ny_) || (iz >= this.nz_)) {
      return false;
    }
    return (this.isStreet(ix, iy, iz));
  }

  create(method: number = 20): void {
    if (method == 20) {
      // 穴掘り法 （垂直抗）
      this.create_dig_20();
    } else if (method == 21) {
      // 穴掘り法 （垂直抗）複数経路
      this.create_dig_21();

    } else if (method == 30) {
      // 穴掘り法 （斜抗）
      this.create_dig_30();

    } else if (method == 40) {
      // 穴掘り法 （斜抗：緩）
      this.create_dig_40();

    }
  }

  create_from(sdata: any): void {
    // テキストから作成
    //  SS:スタート地点
    //  GG:ゴール地点
    //  ##:壁
    //
    //  // 上下の層をつなぐ坂／スロープ；下層を示す；上層は壁無し
    //  //    値 := {種別}{方位}{距離}{高さ}
    //  //             種別:={0:垂直抗,1:w10h20,2:w30h20}
    //  //             方位:={0:北,1:西,2:南,3:東}
    //  //             距離:={下層踊り場からの距離}
    //  //             高さ:={0:下層,1:中層,2:上層}
    //  // x2
    //  N1/W1/S1/E1 :坂(2x2) 向き(上/左/下/右)  下層側
    //  N2/W2/S2/E2 :坂(2x2) 向き(上/左/下/右)　上層側
    //
    //  種別1  断面  w10 h20
    //     [xx] [xx] [  ]    xx:掘削禁止
    //     [xx]  412
    ///    [  ]  411
    //
    //  種別2  断面  w30 h20
    //     [xx] [xx] [xx] [xx] [  ]
    //     [xx] (412) 422  432
    ///    [  ]  411  421 (431)
    let mapType = sdata.shift() as number;
    this.ny_ = sdata.length;
    this.nz_ = sdata[0].length;
    this.nx_ = sdata[0][0].length/2;
    this.nxz_ = this.nx_*this.nz_;
    this.nxyz_ = this.nx_*this.ny_*this.nz_;
    this.nx_1 = this.nx_-1;
    this.ny_1 = this.ny_-1;
    this.nz_1 = this.nz_-1;
    this.init(0);
    this.pGoalList_ = [];
    for (let iy = 0; iy < this.ny_; ++iy) {
      let splane = sdata.shift() as string[];
      for (let iz = 0; iz < this.nz_; ++iz) {
        let sline = splane.shift() as string;
        for (let ix = 0; ix < this.nx_; ++ix) {
          let sgen = sline.substr(0, 2); // 通路
          sline = sline.substr(2, sline.length); // 次に備えて３文字分切り詰める
          if (sgen == 'SS') {
            this.pStart_ = [ix, iy, iz];
          } else if (sgen == 'GG') {
            this.pGoalList_.push([ix, iy, iz]);
          } else if (sgen == '##') {
            this.data_[ix][iy][iz] = -1;
          } else {
              if (mapType == 20) {
                // 垂直抗
                this.data_[ix][iy][iz] = 0;
              } else if (mapType == 30) {
                // 斜抗
                const mGen2Val = {'N0':1010,
                                  'N1':1011,
                                  'W0':1110,
                                  'W1':1111,
                                  'S0':1210,
                                  'S1':1211,
                                  'E0':1310,
                                  'E1':1311,
                                  };
                this.data_[ix][iy][iz] = mGen2Val[sgen];
              } else if (mapType == 40) {
                // 斜抗(緩)
                const mGen2Val = {'N0':2010,
                                  'N1':2020,
                                  'N2':2021,
                                  'N3':2031,
                                  'W0':2110,
                                  'W1':2120,
                                  'W2':2121,
                                  'W3':2131,
                                  'S0':2210,
                                  'S1':2220,
                                  'S2':2221,
                                  'S3':2231,
                                  'E0':2310,
                                  'E1':2320,
                                  'E2':2321,
                                  'E3':2331,
                                  };
                this.data_[ix][iy][iz] = mGen2Val[sgen];
              }
            }
          }
        }
      }
  }


  create_dig_20(): void {
      // 穴掘り法 （垂直抗）
      // - ２マスずつ進む
      // ref) https://zenn.dev/baroqueengine/books/a19140f2d9fc1a/viewer/49a601
      // 上記の x-y 平面の穴掘りを 3D(x,y,z)に拡張する
      this.init(-1);  // 全部を壁に
      let hist: number[][] = [];
      // 開始位置を決める
      let ix = Math.floor(Math.random()*((this.nx_1)/2-1))*2+1;
      let iy = Math.floor(Math.random()*((this.ny_1)/2-1))*2+1;
      let iz = Math.floor(Math.random()*((this.nz_1)/2-1))*2+1;
      this.data_[ix][iy][iz] = 0; // 通路
      hist.push([ix,iy,iz]);
      // let iilist = [...Array(6)].map((_, i) => i); // [0,5]の数列を持つ配列 (各方向が等確率)
      let iilist = [0,0,0,1,1,1,2,3,3,3,4,4,4,5]; // 水平移動の確率を3倍に
      while (hist.length > 0) {
        let p = hist.pop() as number[];
        shuffle(iilist);
        for (let ii of iilist) {
          let idirsh2 = IDIR[ii];
          let p1 = [p[0]+idirsh2[0]  , p[1]+idirsh2[1]  , p[2]+idirsh2[2]];
          let p2 = [p[0]+idirsh2[0]*2, p[1]+idirsh2[1]*2, p[2]+idirsh2[2]*2];
          if ((0 < p2[0]) && (p2[0] < this.nx_) &&
              (0 < p2[1]) && (p2[1] < this.ny_) &&
              (0 < p2[2]) && (p2[2] < this.nz_) &&
              (this.data_[p2[0]][p2[1]][p2[2]] == -1)) {
            this.data_[p1[0]][p1[1]][p1[2]] = 0; // 通路
            this.data_[p2[0]][p2[1]][p2[2]] = 0; // 通路
            hist.push(p);
            hist.push(p2);
            break;
          }
        }
      }
      // スタート位置の設定
      this.pStart_ = [1, 1, 1];
      // ゴール位置を再配置／nx,ny,nz が偶数の場合に、右下の上部（ゴール地点）が壁のまま／削りきれないので..
      let g = [this.nx_1-1, this.ny_1-1, this.nz_1-1];
      if ((this.nx_ % 2) == 0) {
        g[0] = this.nx_1 -2;
      }
      if ((this.ny_ % 2) == 0) {
        g[1] = this.ny_1 -2;
      }
      if ((this.nz_ % 2) == 0) {
        g[2] = this.nz_1 -2;
      }
      this.pGoalList_ = [g];
  }

  create_dig_21(pAperture: number = 0): void {
    // 穴掘り法 （垂直抗）複数経路
    if (pAperture == 0) {
        let pAperture = 10 / (this.nxyz_);
    }
    this.init(-1);  // 全部を壁に
    let hist: number[][] = [];
    // 開始位置を決める
    let ix = Math.floor(Math.random()*((this.nx_1)/2-1))*2+1;
    let iy = Math.floor(Math.random()*((this.ny_1)/2-1))*2+1;
    let iz = Math.floor(Math.random()*((this.nz_1)/2-1))*2+1;
    this.data_[ix][iy][iz] = 0; // 通路
    hist.push([ix,iy,iz]);
    let iilist = [0,0,0,1,1,1,2,3,3,3,4,4,4,5]; // 水平移動の確率を3倍に
    while (hist.length > 0) {
      let p = hist.pop() as number[];
      shuffle(iilist);
      for (let ii of iilist) {
        let idirsh2 = IDIR[ii];
        let p1 = [p[0]+idirsh2[0]  , p[1]+idirsh2[1]  , p[2]+idirsh2[2]];
        let p2 = [p[0]+idirsh2[0]*2, p[1]+idirsh2[1]*2, p[2]+idirsh2[2]*2];
        if ((0 < p2[0]) && (p2[0] < this.nx_) &&
            (0 < p2[1]) && (p2[1] < this.ny_) &&
            (0 < p2[2]) && (p2[2] < this.nz_)) {
          if (this.data_[p2[0]][p2[1]][p2[2]] == -1) {
            this.data_[p1[0]][p1[1]][p1[2]] = 0; // 通路
            this.data_[p2[0]][p2[1]][p2[2]] = 0; // 通路
            hist.push(p);
            hist.push(p2);
            break;
          } else if ((this.data_[p1[0]][p1[1]][p1[2]] == -1) && (Math.random() < pAperture)) {
            this.data_[p1[0]][p1[1]][p1[2]] = 0; // 通路
            break;
          }
        }
      }
    }
    // スタート位置の設定
    this.pStart_ = [1, 1, 1];
    // ゴール位置を再配置／nx,ny,nz が偶数の場合に、右下の上部（ゴール地点）が壁のまま／削りきれないので..
    let g = [this.nx_1-1, this.ny_1-1, this.nz_1-1];
    if ((this.nx_ % 2) == 0) {
        g[0] = this.nx_1 -2;
    }
    if ((this.ny_ % 2) == 0) {
        g[1] = this.ny_1 -2;
    }
    if ((this.nz_ % 2) == 0) {
        g[2] = this.nz_1 -2;
    }
    this.pGoalList_ = [g];
  }


  // 斜抗（１）移動方向と対応するベクトル
  //   [x, y ,z]
  readonly IC1IDIR: number[][] = [
      [ 0, 0, 1],   // 南
      [ 1, 0, 0],   // 東
      [ 0, 0,-1],   // 北
      [-1, 0, 0],   // 西
      [ 0, 1, 1],   // 南（上層へ
      [ 1, 1, 0],   // 東（上層へ
      [ 0, 1,-1],   // 北（上層へ
      [-1, 1, 0],   // 西（上層へ
      [ 0,-1, 1],   // 南（下層へ
      [ 1,-1, 0],   // 東（下層へ
      [ 0,-1,-1],   // 北（下層へ
      [-1,-1, 0],   // 西（下層へ
  ];
  // 斜抗（１）掘削禁止マス(掘削前：１つでも通路になっていれば掘削できない、掘削後：該当マスを接続禁止マスに)
  readonly IC1IDIRBAN: number[][][] = [
      [],   // 南
      [],   // 東
      [],   // 北                                  踊り場上層のデッドスペースになる（デバッグのため禁止に
      [],   // 西                                    ↓      ↓踊り場上層の床  下層の床、
      [[0,1,0],[0,2,0],  [0,0,1],[0,1,1],[0,2,1],  [0,0,2],[0,1,2],   [0,-1,0]],   // 南（上層へ
      [[0,1,0],[0,2,0],  [1,0,0],[1,1,0],[1,2,0],  [2,0,0],[2,1,0],   [0,-1,0]],   // 東（上層へ
      [[0,1,0],[0,2,0],  [0,0,-1],[0,1,-1],[0,2,-1],  [0,0,-2],[0,1,-2],  [0,-1,0]],   // 北（上層へ
      [[0,1,0],[0,2,0],  [-1,0,0],[-1,1,0],[-1,2,0],  [-2,0,0],[-2,1,0],  [0,-1,0]],   // 西（上層へ
      [[0,0,1],[0,-1,1],[0,-2,1],  [0,0,2],[0,-1,2],  [0,-2,0],[0,-1,0],  [0,-3,2]],   // 南（下層へ
      [[1,0,0],[1,-1,0],[1,-2,0],  [2,0,0],[2,-1,0],  [0,-2,0],[0,-1,0],  [2,-3,0]],   // 東（下層へ
      [[0,0,-1],[0,-1,-1],[0,-2,-1],  [0,0,-2],[0,-1,-2],  [0,-2,0],[0,-1,0],  [0,-3,-2]],   // 北（下層へ
      [[-1,0,0],[-1,-1,0],[-1,-2,0],  [-2,0,0],[-2,-1,0],  [0,-2,0],[0,-1,0],  [-2,-3,0]],   // 西（下層へ
  ];
  // 斜抗（１）禁止マス位置のdata_／斜抗ID  {種別:=1}{方位:=0/4:北,1/5:西,2/6:南,3/7:東}{距離:=1}{高さ:=0:下層,1:中層,2:上層}
  readonly IC1IDIRGEO: number[][] = [
      [],   // 南
      [],   // 東
      [],   // 北
      [],   // 西
      [0,-1,  1210,1211,0,  -1,-1,  -1],   // 南（上層へ
      [0,-1,  1310,1311,0,  -1,-1,  -1],   // 東（上層へ
      [0,-1,  1010,1011,0,  -1,-1,  -1],   // 北（上層へ
      [0,-1,  1110,1111,0,  -1,-1,  -1],   // 西（上層へ
      [0,1011,1010,  -1,0,  -1,-1,  -1],   // 南（下層へ = 上層へ
      [0,1111,1110,  -1,0,  -1,-1,  -1],   // 東（下層へ = 西（上層へ
      [0,1211,1210,  -1,0,  -1,-1,  -1],   // 北（下層へ = 南（上層へ
      [0,1311,1310,  -1,0,  -1,-1,  -1],   // 西（下層へ = 東（上層へ
  ];
  create_dig_30(): void {
    // 穴掘り法 （斜抗:incline）
    // 断面
    //            *1)上層 踊り場 
    //   +---+---+---+
    //   |xxx|xxx| *1|       xxx:掘削禁止マス
    //   +---+---+---+
    //   |xxx|x／|xxx|
    //   +---+---+---+
    //   | *2|／x|xxx|
    //   +---+---+---+
    //   |xxx|   |   |
    //   +---+---+---+
    //  *2)下層 踊り場 
    this.init(-1);  // 全部を壁に
    // 禁止エリア
    let distBan = Array.from(new Array(this.nx_), () => {
        return Array.from(new Array(this.ny_), () => new Array(this.nz_).fill(false));
    });
    let hist:number[][] = [];
    // 開始位置を決める
    let ix = Math.floor(Math.random()*((this.nx_)/2-1))*2+1;
    let iy = Math.floor(Math.random()*((this.ny_)/2-1))*2+1;
    let iz = Math.floor(Math.random()*((this.nz_)/2-1))*2+1;
    this.pStart_ = [ix,iy,iz]; // [1,1,1]が通路になる保証がないので、始点をスタートにしておく
    this.pGoalList_ = [[ix,iy,iz]];
    let lenS2G = 0;
    this.data_[ix][iy][iz] = 0; // 通路
    hist.push([ix,iy,iz]);
    let iilist = [0,0,0,1,1,1,2,2,2,3,3,3,4,5,6,7,8,9,10,11]; // 水平移動の確率を3倍に
    while (hist.length > 0) {
      let p = hist.pop() as number[];
      shuffle(iilist);
      for (let ii of iilist) {
        let idirsh2 = this.IC1IDIR[ii];
        let p1 = [p[0]+idirsh2[0]  , p[1]+idirsh2[1]  , p[2]+idirsh2[2]];
        let p2 = [p[0]+idirsh2[0]*2, p[1]+idirsh2[1]*2, p[2]+idirsh2[2]*2];
        if ((0 < p2[0]) && (p2[0] < this.nx_) &&  // 範囲内である
            (0 < p2[1]) && (p2[1] < this.ny_) &&
            (0 < p2[2]) && (p2[2] < this.nz_) &&
            (this.data_[p2[0]][p2[1]][p2[2]] == -1) &&  // 移動先が壁
            (distBan[p2[0]][p2[1]][p2[2]] == false) &&   // 禁止エリアに抵触していない
            (distBan[p1[0]][p1[1]][p1[2]] == false)) {
          // 更に、禁止エリアが通路になっていないかを確認
          let banxyzlist = this.IC1IDIRBAN[ii];
          let bcheck = false;
          if (banxyzlist.length > 0) {
            for (let bxyz of banxyzlist) {
                let p3 = [p[0]+bxyz[0], p[1]+bxyz[1], p[2]+bxyz[2]];
                if (this.data_[p3[0]][p3[1]][p3[2]] != -1) {
                bcheck = true; // 禁止エリアが通路／斜抗
                break;
              }
            }
          }
          if (bcheck) {
              continue; // 禁止エリアが通路
          }
          // 問題ないので該当エリアの data_ を通路／斜抗に
          if (banxyzlist.length == 0) {
            this.data_[p1[0]][p1[1]][p1[2]] = 0; // 通路
            this.data_[p2[0]][p2[1]][p2[2]] = 0; // 通路
          } else {
            this.data_[p2[0]][p2[1]][p2[2]] = 0; // 通路(移動先の踊り場)
            // 斜抗の設定
            let geoidlist = this.IC1IDIRGEO[ii];
            for (let jj = 0; jj < banxyzlist.length; ++jj) {
              let bxyz = banxyzlist[jj];
              let geoid = geoidlist[jj];
              let p3 = [p[0]+bxyz[0], p[1]+bxyz[1], p[2]+bxyz[2]];
              this.data_[p3[0]][p3[1]][p3[2]] = geoid;
              distBan[p3[0]][p3[1]][p3[2]] = true;
            }
          }
          hist.push(p);
          hist.push(p2);
          {
            let lenS2G_ = Math.abs(p2[0]-this.pStart_[0]) + Math.abs(p2[1]-this.pStart_[1]) + Math.abs(p2[2]-this.pStart_[2]);
            if (lenS2G < lenS2G_) {
              lenS2G = lenS2G_;
              this.pGoalList_ = [p2];
            }
          }
          break;
        }
      }
    }
  }


  // 斜抗（２）移動方向と対応するベクトル
  //   [x, y ,z]
  readonly IC2IDIR: number[][] = [
      [ 0, 0, 1],   // 南
      [ 1, 0, 0],   // 東
      [ 0, 0,-1],   // 北
      [-1, 0, 0],   // 西
      [ 0, 1, 2],   // 南（上層へ
      [ 2, 1, 0],   // 東（上層へ
      [ 0, 1,-2],   // 北（上層へ
      [-2, 1, 0],   // 西（上層へ
      [ 0,-1, 2],   // 南（下層へ
      [ 2,-1, 0],   // 東（下層へ
      [ 0,-1,-2],   // 北（下層へ
      [-2,-1, 0],   // 西（下層へ
  ];
  // 斜抗（２）掘削禁止マス(掘削前：１つでも通路になっていれば掘削できない、掘削後：該当マスを接続禁止マスに)
  readonly IC2IDIRBAN: number[][][] = [
      [],   // 南
      [],   // 東
      [],   // 北                                                                                     踊り場上層のデッドスペースになる（デバッグのため禁止に
      [],   // 西                                                                                       ↓      ↓踊り場上層の床  下層の床、
      [[0,1,0],[0,2,0],  [0,0,1],[0,1,1],[0,2,1],  [0,0,2],[0,1,2],[0,2,2],  [0,0,3],[0,1,3],[0,2,3],  [0,0,4],[0,1,4],   [0,-1,0]],   // 南（上層へ
      [[0,1,0],[0,2,0],  [1,0,0],[1,1,0],[1,2,0],  [2,0,0],[2,1,0],[2,2,0],  [3,0,0],[3,1,0],[3,2,0],  [4,0,0],[4,1,0],   [0,-1,0]],   // 東（上層へ
      [[0,1,0],[0,2,0],  [0,0,-1],[0,1,-1],[0,2,-1],  [0,0,-2],[0,1,-2],[0,2,-2],  [0,0,-3],[0,1,-3],[0,2,-3],  [0,0,-4],[0,1,-4],  [0,-1,0]],   // 北（上層へ
      [[0,1,0],[0,2,0],  [-1,0,0],[-1,1,0],[-1,2,0],  [-2,0,0],[-2,1,0],[-2,2,0],  [-3,0,0],[-3,1,0],[-3,2,0],  [-4,0,0],[-4,1,0],  [0,-1,0]],   // 西（上層へ
      [[0,0,1],[0,-1,1],[0,-2,1],  [0,0,2],[0,-1,2],[0,-2,2],  [0,0,3],[0,-1,3],[0,-2,3],  [0,0,4],[0,-1,4],  [0,-2,0],[0,-1,0],  [0,-3,4]],   // 南（下層へ
      [[1,0,0],[1,-1,0],[1,-2,0],  [2,0,0],[2,-1,0],[2,-2,0],  [3,0,0],[3,-1,0],[3,-2,0],  [4,0,0],[4,-1,0],  [0,-2,0],[0,-1,0],  [4,-3,0]],   // 東（下層へ
      [[0,0,-1],[0,-1,-1],[0,-2,-1],  [0,0,-2],[0,-1,-2],[0,-2,-2],  [0,0,-3],[0,-1,-3],[0,-2,-3],  [0,0,-4],[0,-1,-4],  [0,-2,0],[0,-1,0],  [0,-3,-4]],   // 北（下層へ
      [[-1,0,0],[-1,-1,0],[-1,-2,0],  [-2,0,0],[-2,-1,0],[-2,-2,0],  [-3,0,0],[-3,-1,0],[-3,-2,0],  [-4,0,0],[-4,-1,0],  [0,-2,0],[0,-1,0],  [-4,-3,0]],   // 西（下層へ
  ];
  // 斜抗（２）禁止マス位置のdata_／斜抗ID  {種別:=1}{方位:=0/4:北,1/5:西,2/6:南,3/7:東}{距離:=1}{高さ:=0:下層,1:中層,2:上層}
  readonly IC2IDIRGEO: number[][] = [
      [],   // 南
      [],   // 東
      [],   // 北
      [],   // 西
      [0,-1,  2210,0,0,  2220,2221,0,  0,2231,0,  -1,-1,  -1],   // 南（上層へ
      [0,-1,  2310,0,0,  2320,2321,0,  0,2331,0,  -1,-1,  -1],   // 東（上層へ
      [0,-1,  2010,0,0,  2020,2021,0,  0,2031,0,  -1,-1,  -1],   // 北（上層へ
      [0,-1,  2110,0,0,  2120,2121,0,  0,2131,0,  -1,-1,  -1],   // 西（上層へ
      [0,2031,0,  0,2021,2020,  0,0,2010,  -1,0,  -1,-1,  -1],   // [0,2611,0,  0,2621,2620,  0,0,2630,  0,0,  -1,-1,  -1],   // 南（下層へ = 北（上層へ
      [0,2131,0,  0,2121,2120,  0,0,2110,  -1,0,  -1,-1,  -1],   // [0,2711,0,  0,2721,2720,  0,0,2730,  0,0,  -1,-1,  -1],   // 東（下層へ = 西（上層へ
      [0,2231,0,  0,2221,2220,  0,0,2210,  -1,0,  -1,-1,  -1],   // [0,2411,0,  0,2421,2420,  0,0,2430,  0,0,  -1,-1,  -1],   // 北（下層へ = 南（上層へ
      [0,2331,0,  0,2321,2320,  0,0,2310,  -1,0,  -1,-1,  -1],   // [0,2511,0,  0,2521,2520,  0,0,2530,  0,0,  -1,-1,  -1],   // 西（下層へ = 東（上層へ
  ];
  create_dig_40(): void {
    // 穴掘り法 （斜抗:incline）より傾斜の緩い
    // 断面
    //                    *1)上層 踊り場 
    //   +---+---+---+---+---+
    //   |xxx|xxx|xxx|xxx| *1|       xxx:掘削禁止マス・解放空間に
    //   +---+---+---+---+---+
    //   |xxx|xxx|x／|x／|xxx|
    //   +---+---+---+---+---+
    //   | *2|／x|／x|xxx|xxx|
    //   +---+---+---+---+---+
    //   |xxx|   |   |   |   |
    //   +---+---+---+---+---+
    //  *2)下層 踊り場 
    this.init(-1);  // 全部を壁に
    // 禁止エリア
    let distBan = Array.from(new Array(this.nx_), () => {
        return Array.from(new Array(this.ny_), () => new Array(this.nz_).fill(false));
    });
    let hist:number[][] = [];
    // 開始位置を決める
    let ix = Math.floor(Math.random()*((this.nx_)/2-1))*2+1;
    let iy = Math.floor(Math.random()*((this.ny_)/2-1))*2+1;
    let iz = Math.floor(Math.random()*((this.nz_)/2-1))*2+1;
    this.pStart_ = [ix,iy,iz]; // [1,1,1]が通路になる保証がないので、始点をスタートにしておく
    this.pGoalList_ = [[ix,iy,iz]];
    let lenS2G = 0;
    this.data_[ix][iy][iz] = 0; // 通路
    hist.push([ix,iy,iz]);
    let iilist = [0,0,0,1,1,1,2,2,2,3,3,3,4,5,6,7,8,9,10,11]; // 水平移動の確率を3倍に
    while (hist.length > 0) {
      let p = hist.pop() as number[];
      shuffle(iilist);
      for (let ii of iilist) {
        let idirsh2 = this.IC2IDIR[ii];
        let p1 = [p[0]+idirsh2[0]  , p[1]+idirsh2[1]  , p[2]+idirsh2[2]];
        let p2 = [p[0]+idirsh2[0]*2, p[1]+idirsh2[1]*2, p[2]+idirsh2[2]*2];
        if ((0 < p2[0]) && (p2[0] < this.nx_) &&  // 範囲内である
            (0 < p2[1]) && (p2[1] < this.ny_) &&
            (0 < p2[2]) && (p2[2] < this.nz_) &&
            (this.data_[p2[0]][p2[1]][p2[2]] == -1) &&  // 移動先が壁
            (distBan[p2[0]][p2[1]][p2[2]] == false) &&   // 禁止エリアに抵触していない
            (distBan[p1[0]][p1[1]][p1[2]] == false)) {
          // 更に、禁止エリアが通路になっていないかを確認
          let banxyzlist = this.IC2IDIRBAN[ii];
          let bcheck = false;
          if (banxyzlist.length > 0) {
            for (let bxyz of banxyzlist) {
              let p3 = [p[0]+bxyz[0], p[1]+bxyz[1], p[2]+bxyz[2]];
              if (this.data_[p3[0]][p3[1]][p3[2]] != -1) {
                bcheck = true; // 禁止エリアが通路／斜抗
                break;
              }
            }
          }
          if (bcheck) {
            continue; // 確認した箇所（禁止エリア）がすでに通路なのでスキップ
          }
          // 問題ないので該当エリアの data_ を通路／斜抗に
          if (banxyzlist.length == 0) {
            // よこ抗の場合
            this.data_[p1[0]][p1[1]][p1[2]] = 0; // 通路
            this.data_[p2[0]][p2[1]][p2[2]] = 0; // 通路
          } else {
            // 斜抗の場合
            this.data_[p2[0]][p2[1]][p2[2]] = 0; // 通路(移動先の踊り場)
            let geoidlist = this.IC2IDIRGEO[ii];
            for (let jj = 0; jj < banxyzlist.length; ++jj) {
              let bxyz = banxyzlist[jj];
              let geoid = geoidlist[jj];
              let p3 = [p[0]+bxyz[0], p[1]+bxyz[1], p[2]+bxyz[2]];
              this.data_[p3[0]][p3[1]][p3[2]] = geoid;
              distBan[p3[0]][p3[1]][p3[2]] = true;
            }
          }
          hist.push(p);
          hist.push(p2);
          {
            // スタート地点から遠い点をゴール地点に
            let lenS2G_ = Math.abs(p2[0]-this.pStart_[0]) + Math.abs(p2[1]-this.pStart_[1]) + Math.abs(p2[2]-this.pStart_[2]);
            if (lenS2G < lenS2G_) {
              lenS2G = lenS2G_;
              this.pGoalList_ = [p2];
            }
          }
          break;
        }
      }
    }
  }

  isGoal(p: number[]): boolean {
    for (let i = 0; i < this.pGoalList_.length; ++i) {
        if (eqv3(this.pGoalList_[i], p)) {
          return true;
        }
    }
    return false;
  }

  setStartGoal(s: number[] = [-1, -1, -1], g: number[] = [-1, -1, -1]): void {
    // 設定した場所が通路とは限らないので注意
    if ((s[0] == -1) || (s[1] == -1) || (s[2] == -1)) {
      s = [1, 1, 1];
    }
    if ((g[0] == -1) || (g[1] == -1) || (g[2] == -1)) {
      g = [this.nx_1-1, this.ny_1-1, this.nz_1-1];
    }
    this.pStart_ = s;
    this.pGoalList_ = [g];
  }

  resetStartGoal(): void {
    // スタート、ゴールの位置をリセット
    // .. 最遠方に置き直す
    let pGoal = this.seekFarPoint(this.pStart_);
    this.pStart_ = this.seekFarPoint(pGoal);
    pGoal = this.seekFarPoint(this.pStart_);
    this.pStart_ = this.seekFarPoint(pGoal);
    this.pGoalList_ = [pGoal];
  }

  // ------------------------------

  xyz2idx(p: number[]): number {
    return p[1]*this.nxz_ + p[2]*this.nx_ + p[0];
  }

  seekPath2(): [number, number[]] {
    // BFS（幅優先探索）縦横上下（斜め無し）
    let distS2E = -1; // 最短距離
    // スタート地点からの距離を保存する配列
    let distS = Array.from(new Array(this.nx_), () => {
      return Array.from(new Array(this.ny_), () => new Array(this.nz_).fill(-1));
    });
    distS[this.pStart_[0]][this.pStart_[1]][this.pStart_[2]] = 0; // スタート位置
    // 探索済みマスを管理する配列
    let visited  = Array.from(new Array(this.nx_), () => {
      return Array.from(new Array(this.ny_), () => new Array(this.nz_).fill(false));
    });
    visited[this.pStart_[0]][this.pStart_[1]][this.pStart_[2]] = true; // スタート位置
    let candi = [this.pStart_]; // 探索候補
    let pGoal = this.pGoalList_[0];
    // 通路以外、ブロックに相当するIDのリスト
    const blockIDs = [-1,
                      1010, 1110, 1210, 1310,
                      2010, 2110, 2210, 2310,
                      2020, 2120, 2220, 2320,
                      2031, 2131, 2231, 2331];
    while (candi.length > 0) {
      let p = candi.shift() as number[]; // 配列の先頭を取得
      // ゴールに到達
      if (this.isGoal(p)) {
        distS2E = distS[p[0]][p[1]][p[2]];
        pGoal = [p[0], p[1], p[2]];
        break;
      }
      // 上下左右を探索
      for (let idir = 0; idir < 6; ++idir) {
        let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1], p[2]+IDIR[idir][2]];
        // テーブルの範囲内かつ道かつ未探索の場合
        if ((0 <= q[0] && q[0] < this.nx_) &&  // 有効領域の判定（壁で覆われていれば不要）
            (0 <= q[1] && q[1] < this.ny_) &&
            (0 <= q[2] && q[2] < this.nz_) &&
            !blockIDs.includes(this.data_[q[0]][q[1]][q[2]]) &&  // 通路
            !visited[q[0]][q[1]][q[2]]) {  // 未訪問
          candi.push(q);  // 次の候補を末尾に（幅優先）
          visited[q[0]][q[1]][q[2]]  = true; // 訪問済みに
          distS[q[0]][q[1]][q[2]] = distS[p[0]][p[1]][p[2]] + 1; // qの距離を p+1に
        }
      }
    }
    let path: number[] = []
    if (distS2E > 0) {
      // ゴール位置から逆にたどる
      let p = pGoal;
      path.unshift(this.xyz2idx(p)); // 配列の先頭に入れる
      let dist = distS2E-1;
      while (dist > 0) {
        // 上下左右を探索
        let bfound = false;
        for (let idir = 0; idir < 6; ++idir) {
          let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1], p[2]+IDIR[idir][2]];
            if ((0 <= q[0] && q[0] < this.nx_) &&  // 有効領域の判定（壁で覆われていれば不要）
                (0 <= q[1] && q[1] < this.ny_) &&
                (0 <= q[2] && q[2] < this.nz_) &&
                (distS[q[0]][q[1]][q[2]] == dist)) {
            path.unshift(this.xyz2idx(q)); // 配列の先頭に入れる
            p = q;
            --dist;
            bfound = true;
            break;
          }
        }
        console.assert(bfound);
      }
      p = this.pStart_;
      path.unshift(this.xyz2idx(p)); // 配列の先頭に入れる
    }
    this.path2_ = path;
    return [distS2E, path];
  }

  seekFarPoint(pStart: number[]): number[] {
    // BFS（幅優先探索） で最遠方にある点を返す
    let distSmax = -1; // 最短距離の最大値
    let pSmax = [0, 0, 0];
    // スタート地点からの距離を保存する配列
    let distS = Array.from(new Array(this.nx_), () => {
      return Array.from(new Array(this.ny_), () => new Array(this.nz_).fill(-1));
    });
    distS[pStart[0]][pStart[1]][pStart[2]] = 0; // スタート位置
    // 探索済みマスを管理する配列
    let visited  = Array.from(new Array(this.nx_), () => {
      return Array.from(new Array(this.ny_), () => new Array(this.nz_).fill(false));
    });
    visited[pStart[0]][pStart[1]][pStart[2]] = true; // スタート位置
    let candi = [pStart]; // 探索候補
    let nRest = 0; // 探査可能な個数
      for (let iy = 0; iy < this.ny_; ++iy) {
        for (let iz = 0; iz < this.nz_; ++iz) {
          for (let ix = 0; ix < this.nx_; ++ix) {
            if (this.data_[ix][iy][iz] == 0) {
              ++nRest;
            }
        }
      }
    }
    --nRest; // スタート地点を抜く
    while (candi.length > 0) {
      let p = candi.shift() as number[]; // 配列の先頭を取得
      // 未調査がない
      if (nRest == 0) {
        break;
      }
      // 上下左右を探索
      for (let idir = 0; idir < 6; ++idir) {
        let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1], p[2]+IDIR[idir][2]];
        // テーブルの範囲内かつ道かつ未探索の場合
        if ((0 <= q[0] && q[0] < this.nx_) &&  // 有効領域の判定（壁で覆われていれば不要）
            (0 <= q[1] && q[1] < this.ny_) &&
            (0 <= q[2] && q[2] < this.nz_) &&
            this.data_[q[0]][q[1]][q[2]] == 0 &&  // 通路
            !visited[q[0]][q[1]][q[2]]) {  // 未訪問
          --nRest;
          candi.push(q);  // 次の候補を末尾に（幅優先）
          visited[q[0]][q[1]][q[2]]  = true; // 訪問済みに
          distS[q[0]][q[1]][q[2]] = distS[p[0]][p[1]][p[2]] + 1; // qの距離を p+1に
          if (distSmax < distS[q[0]][q[1]][q[2]]) { // 最長位置の更新
            distSmax = distS[q[0]][q[1]][q[2]];
            pSmax = [q[0], q[1], q[2]];
          }
        }
      }
    }
    return pSmax;
  }

  printPathAndWall(str: string, path: number[]): string {
    for (let iy = 0; iy < this.ny_; ++iy) {
      str += "\niy="+iy+"\n";
      for (let iz = 0; iz < this.nz_; ++iz) {
        for (let ix = 0; ix < this.nx_; ++ix) {
          let p = [ix,iy,iz];
          let idx1 = this.xyz2idx([ix,iy,iz]);
          if (eqv3(this.pStart_, p)) {
            str += "SS";
          } else if (this.isGoal(p)) {
            str += "GG";
          } else if (this.data_[ix][iy][iz] == -1) {
            str += "##";
          } else if (path.includes(idx1)) {
            str += "..";
          } else {
            if (this.data_[ix][iy][iz] >= 1000) {
              // 斜抗
              let v = this.data_[ix][iy][iz];
              let v4 = Math.floor(v/1000);
              let v3 = Math.floor((v-v4*1000)/100);
              let v2 = Math.floor((v-v4*1000-v3*100)/10);
              let v1 = v%10;
              if (v4 == 1) {
                const headDir = ["N", "W", "S", "E", "n", "w", "s", "e"];
                str += headDir[v3] + v1;
              } else if (v4 == 2) {
                const headDir = ["N", "W", "S", "E", "n", "w", "s", "e"];
                const mNo = {10:0, 20:1, 21:2, 31:3};
                let v21 = v2*10+v1;
                str += headDir[v3] + mNo[v21];
              }
            } else if (((iy > 0) && (iy < this.ny_1)) && (this.data_[ix][iy-1][iz] == -1) && (this.data_[ix][iy+1][iz] == 0)) {
              // 垂直抗の底
              str += "[_";
            } else if (((iy > 0) && (iy < this.ny_1)) && (this.data_[ix][iy-1][iz] == 0) && (this.data_[ix][iy+1][iz] == 0)) {
              // 垂直抗の中間
              str += "[-";
            } else if (((iy > 0) && (iy < this.ny_1)) && (this.data_[ix][iy-1][iz] == 0) && (this.data_[ix][iy+1][iz] == -1)) {
              // 垂直抗の上（天井
              str += "[`";
            } else {
              str += "  ";
            }
          }
        }
        str += "\n";
      }
    }
    return str;
  }

  strMap(): string {
    // デバッグ表示
    let str = '\n';
    if (this.path2_.length > 0) {
      str += "最短経路(path2)を表示\n"
      let path = this.path2_;
      str = this.printPathAndWall(str, path);
    } else {
      str = this.printPathAndWall(str, []);
    }
    return str;
  }
};

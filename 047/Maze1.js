// mode:javascript
// 通路と壁が同じサイズの迷路

"use strict"

import * as Maze1data from "Maze1data";

function shuffle(array) {
  let currentIndex = array.length;
  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
}

const shuffle2 = (arr) =>
  arr.map((value) => ({ value, random: Math.random() }))
    .sort((a, b) => a.random - b.random)
    .map(({ value }) => value);


// ４方向と対応するベクトル
//                  [row, col]
export const IDIR = [[0, 1],   // 東／右／→
                     [1, 0],   // 南／下／↓
                     [0, -1],  // 西／左／←
                     [-1, 0]   // 北／上／↑
                    ]
const IDIRrv = {"0,1":0,   // 東／右／→
                "1,0":1,   // 南／下／↓
                "0,-1":2,  // 西／左／←
                "-1,0":3}  // 北／上／↑
function rc2idir(p1,p2) {
    let q = [p2[0]-p1[0], p2[1]-p1[1]];
    let key = q.join(",");
    return IDIRrv[key];
}

export class MazeData01 {
  // 壁と通路が同じ大きさの迷路
  type_ = 1;
  nrow_;
  ncol_;
  nrow_1;
  ncol_1;
  // 壁情報
  // [irow][icol] = 1:かべ, 0:通路
  data_;
  // 最短経路
  path2_ = [];  // 幅優先用 / seekPath2
  path3_ = [];  // 深さ優先用 / seekPath3
  path6_ = [];  // A* 用 / seekPath6
  path99_ = [];  // 一般・共用
  deadend1_ = []; // 行き止まり

  constructor(nrow=3, ncol=3) {
    this.nrow_ = nrow;
    this.ncol_ = ncol;
    this.nrow_1 = nrow-1;
    this.ncol_1 = ncol-1;
    this.init();
    this.pStart_ = [1,1];
    this.pGoal_ = [nrow-2, ncol-2];
  }

  init(defval = 1) {
    this.data_ = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(defval));
    return this.data_;
  }

  clearPath() {
    this.path2_ = [];  // 幅優先用 / seekPath2
    this.path3_ = [];  // 深さ優先用 / seekPath3
    this.path6_ = [];  // A* 用 / seekPath6
    this.path99_ = [];  // 一般・共用
    this.deadend1_ = []; // 行き止まり
  }

  isWall(irow, icol) {
    return (this.data_[irow][icol] == 1);
  }
  isWall_s(irow, icol) {
    if ((irow < 0) || (icol < 0) || (irow >= this.nrow_) || (icol >= this.ncol_)) {
      return true;
    }
    return (this.isWall(irow, icol));
  }

  isWallPosiDir(posi, idir) {
    // 位置(posi)から 方向(idir)に壁があるか？
    let irow = posi[0] + IDIR[idir][0], icol = posi[1] + IDIR[idir][1];
    return (this.data_[irow][icol] == 1);
  }

  nWall(posi) {
    // 壁の数を数える .. 3:= 袋小路（行き止まり) 2:= 通路、 1:= 分岐(T字路)、0:=分岐(十字路)
    let icount = 0;
    for (let idir = 0; idir < 4; ++idir) {
      if (this.isWallPosiDir(posi, idir)) {
        ++icount;
      }
    }
    return icount;
  }

  enableDig_s(irow, icol) {
    // 壁を掘れるか／壁があるか？（境界位置を加味して、境界なら優先して禁止／false)
    if ((irow < 0) || (icol < 0) || (irow >= this.nrow_) || (icol >= this.ncol_)) {
      return false;
    }
    return (this.data_[irow][icol] == 1); // 壁なら true
  }

  isStreet(irow, icol) {
    return (this.data_[irow][icol] == 0);
  }
  isStreet_s(irow, icol) {
    if ((irow < 0) || (icol < 0) || (irow >= this.nrow_) || (icol >= this.ncol_)) {
      return false;
    }
    return (this.isStreet(irow, icol));
  }

  create(method = 10) {
    if (method == 10) {
      // 棒倒し法
      this.create_pull();
    } else if (method == 11) {
      // 棒倒し法 .. 壁を重ねる .. 複数経路あり
      this.create_pull_0();

    } else if (method == 20) {
      // 穴掘り法
      this.create_dig();
    } else if (method == 21) {
      // 穴掘り法＋壁に穴開け
      this.create_dig_1();
    } else if (method == 22) {
      // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路 / 中庸：ななめより、ややストレートが多め
      this.create_dig_2_1();
    } else if (method == 23) {
      // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路 / ななめを多め（の割にちょいちょいストレートも散見）
      this.create_dig_2_2();
    } else if (method == 24) {
      // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路 / ストレート多め
      this.create_dig_2_3();

    } else if (method == 30) {
      // 壁のばし法
      this.create_extendwall();
    } else if (method == 31) {
      // 壁のばし法＋中央からも .. 複数経路
      this.create_extendwall_2();

    } else if (method == 40) {
      // マップ生成(1)
      this.create_areamap();
    } else if (method == 41) {
      // マップ生成  パーリンノイズの2値化
      this.create_areamap_perling_0();
    } else if (method == 42) {
      // パーリンノイズを折り返し、一定値以上(0.8)を壁とする
      this.create_areamap_perling_1();
    } else if (method == 43) {
      // マップ生成  パーリンノイズの2値化＋穴掘り .. 広間のある迷路
      this.create_areamap_perling_3_dig();
    }

    // スタート・ゴールを設定
    this.setStartGoal();
  }

  create_from(sdata) {
    // テキストから作成
    this.nrow_ = sdata.length;
    this.ncol_ = sdata[0].length;
    this.init(0);
    this.setStartGoal();
    for (let irow = 0; irow < this.nrow_; ++irow) {
      for (let icol = 0; icol < this.ncol_; ++icol) {
        if (sdata[irow][icol] == 'S') {
          this.pStart_ = [irow, icol];
        } else if (sdata[irow][icol] == 'G') {
          this.pGoal_ = [irow, icol];
        } else if (sdata[irow][icol] == '#') {
          this.data_[irow][icol] = 1;
        } else {
          this.data_[irow][icol] = 0;
        }
      }
    }
  }

  // 固定の迷路を作る（結局呼び出し側で切り替えるのが便利なので使わずに
  create_from_sample1() {
    let mapname = 'sdata22';
    let mapdata = Maze1data.get_map_data(mapname);
    this.create_from(mapdata);
  }

  create_pull() {
    // 棒倒し法
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    for (let irow = 0; irow < this.nrow_; ++irow) {
      for (let icol = 0; icol < this.ncol_; ++icol) {
        this.data_[irow][icol] = 0; // 通路
        if ((irow == 0) || (irow == nrow__) || (icol == 0) || (icol == ncol__)) {
          // 最も外側の壁
          this.data_[irow][icol] = 1;
        } else if (((irow % 2) == 0) && ((icol % 2) == 0)) {
          // 柱
          this.data_[irow][icol] = 1;
        }
      }
    }
    // 棒倒しで、既に壁があればスキップ／空きのあるところに作成する
    for (let irow = 2; irow < this.nrow_-1; irow+=2) {
      let ndir = 3;
      if (irow == 2) {
        ndir = 4;
      }
      for (let icol = 2; icol < this.ncol_-1; icol+=2) {
        let iloop = 0;
        while (true) {
          let idir = Math.floor(Math.random() * ndir);
          let irow2 = irow + IDIR[idir][0];
          let icol2 = icol + IDIR[idir][1];
          if (this.data_[irow2][icol2] == 0) {
            this.data_[irow2][icol2] = 1;
            break;
          }
          if (++iloop > ndir) {
            break;
          }
        }
      }
    }
    // nrow,ncol が偶数の場合に、右下（ゴール地点）が壁に囲まれるので削る
    if ((this.nrow_ % 2) == 0) {
      this.data_[nrow__-1][ncol__-1] = 0;
      this.data_[nrow__-2][ncol__-1] = 0;
    }
    if ((this.ncol_ % 2) == 0) {
      this.data_[nrow__-1][ncol__-1] = 0;
      this.data_[nrow__-1][ncol__-2] = 0;
    }
  }

  create_pull_0() {
    // 棒倒し法 .. 壁を重ねる .. 複数経路あり
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    for (let irow = 0; irow < this.nrow_; ++irow) {
      for (let icol = 0; icol < this.ncol_; ++icol) {
        this.data_[irow][icol] = 0; // 通路
        if ((irow == 0) || (irow == nrow__) || (icol == 0) || (icol == ncol__)) {
          // 最も外側の壁
          this.data_[irow][icol] = 1;
        } else if (((irow % 2) == 0) && ((icol % 2) == 0)) {
          // 柱
          this.data_[irow][icol] = 1;
        }
      }
    }
    for (let irow = 2; irow < this.nrow_-1; irow+=2) {
      let ndir = 3;
      if (irow == 2) {
        ndir = 4;
      }
      for (let icol = 2; icol < this.ncol_-1; icol+=2) {
        let idir = Math.floor(Math.random() * ndir);
        let irow2 = irow + IDIR[idir][0];
        let icol2 = icol + IDIR[idir][1];
        this.data_[irow2][icol2] = 1;
      }
    }
    // nrow,ncol が偶数の場合に、右下（ゴール地点）が壁に囲まれるので削る
    if ((this.nrow_ % 2) == 0) {
      this.data_[nrow__-1][ncol__-1] = 0;
      this.data_[nrow__-2][ncol__-1] = 0;
    }
    if ((this.ncol_ % 2) == 0) {
      this.data_[nrow__-1][ncol__-1] = 0;
      this.data_[nrow__-1][ncol__-2] = 0;
    }
  }

  create_dig() {
    // 穴掘り法
    // - ２マスずつ進む
    // ref) https://zenn.dev/baroqueengine/books/a19140f2d9fc1a/viewer/49a601
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    this.init(1);
    let hist = [];
    let irow = Math.floor(Math.random()*((this.nrow_-1)/2-1))*2+1;
    let icol = Math.floor(Math.random()*((this.ncol_-1)/2-1))*2+1;
    this.data_[irow][icol] = 0; // 通路
    hist.push([irow,icol]);
    let IDIRSH = JSON.parse(JSON.stringify(IDIR));
    while (hist.length > 0) {
      let posi = hist.pop();
      irow = posi[0];
      icol = posi[1];
      {
        IDIRSH = shuffle2(IDIRSH);
        for (let idirsh2 of IDIRSH) {
          let irow1 = posi[0] + idirsh2[0], icol1 = posi[1] + idirsh2[1];
          let irow2 = posi[0] + idirsh2[0]*2, icol2 = posi[1] + idirsh2[1]*2;
          if ((0 < irow2) && (irow2 < nrow__) && (0 < icol2) && (icol2 < ncol__) && (this.data_[irow2][icol2] == 1)) {
            this.data_[irow1][icol1] = 0; // 通路
            this.data_[irow2][icol2] = 0; // 通路
            hist.push([irow,icol]);
            hist.push([irow2,icol2]);
            break;
          }
        }
      }
    }
    // nrow,ncol が偶数の場合に、右下（ゴール地点）が壁のまま／削りきれないので..
    if ((this.nrow_ % 2) == 0) {
      this.data_[nrow__-1][ncol__-1] = 0;
      this.data_[nrow__-2][ncol__-1] = 0;
    }
    if ((this.ncol_ % 2) == 0) {
      this.data_[nrow__-1][ncol__-1] = 0;
      this.data_[nrow__-1][ncol__-2] = 0;
    }
  }

  create_dig_1() {
    // 穴掘り法＋壁に穴開け .. 複数経路
    // ref) https://www.kerislab.jp/posts/2020-03-23-maze-generator/
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    let pAperture = 10 / (nrow__ * ncol__);
    this.init(1);
    let hist = [];
    let irow = Math.floor(Math.random()*((this.nrow_-1)/2-1))*2+1;
    let icol = Math.floor(Math.random()*((this.ncol_-1)/2-1))*2+1;
    this.data_[irow][icol] = 0; // 通路
    hist.push([irow,icol]);
    let IDIRSH = JSON.parse(JSON.stringify(IDIR));
    while (hist.length > 0) {
      let posi = hist.pop();
      irow = posi[0];
      icol = posi[1];
      {
        IDIRSH = shuffle2(IDIRSH);
        for (let idirsh2 of IDIRSH) {
          let irow1 = posi[0] + idirsh2[0], icol1 = posi[1] + idirsh2[1];
          let irow2 = posi[0] + idirsh2[0]*2, icol2 = posi[1] + idirsh2[1]*2;
          if ((0 < irow2) && (irow2 < nrow__) && (0 < icol2) && (icol2 < ncol__)) {
            if (this.data_[irow2][icol2] == 1) {
              this.data_[irow1][icol1] = 0; // 通路
              this.data_[irow2][icol2] = 0; // 通路
              hist.push([irow,icol]);
              hist.push([irow2,icol2]);
              break;
            } else if ((this.data_[irow1][icol1] == 1) && (Math.random() < pAperture)) {
              this.data_[irow1][icol1] = 0; // 通路
              break;
            }
          }
        }
      }
    }
    // nrow,ncol が偶数の場合に、右下（ゴール地点）が壁のまま／削りきれないので..
    if ((this.nrow_ % 2) == 0) {
      this.data_[nrow__-1][ncol__-1] = 0;
      this.data_[nrow__-2][ncol__-1] = 0;
    }
    if ((this.ncol_ % 2) == 0) {
      this.data_[nrow__-1][ncol__-1] = 0;
      this.data_[nrow__-1][ncol__-2] = 0;
    }
  }

  create_dig_2_1() {
    // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路 / 中庸：ななめより、ややストレートが多め
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    const pAperture = 10 / (nrow__ * ncol__); // 壁の穴あけの確率
    const wStraight = 0.1;  // 直線の重み
    const wSlash = 0.4;     // ななめの重み
    this.create_dig_2(pAperture, wStraight, wSlash)
  }

  create_dig_2_2() {
    // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路 / ななめを多め（の割にちょいちょいストレートも散見）
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    const pAperture = 10 / (nrow__ * ncol__); // 壁の穴あけの確率
    const wStraight = 0;    // 直線の重み
    const wSlash = 0.8;     // ななめの重み
    this.create_dig_2(pAperture, wStraight, wSlash)
  }

  create_dig_2_3() {
    // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路 / ストレート多め
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    const pAperture = 10 / (nrow__ * ncol__); // 壁の穴あけの確率
    const wStraight = 0.9;  // 直線の重み
    const wSlash = 0.1;     // ななめの重み
    this.create_dig_2(pAperture, wStraight, wSlash)
  }

  create_dig_2(pAperture, wStraight, wSlash) {
    // // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路
    // // ref) https://www.kerislab.jp/posts/2020-03-23-maze-generator/
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    this.init(1);
    let hist = [];
    let irow = Math.floor(Math.random()*((this.nrow_-1)/2-1))*2+1;
    let icol = Math.floor(Math.random()*((this.ncol_-1)/2-1))*2+1;
    this.data_[irow][icol] = 0; // 通路
    hist.push([irow,icol]);
    let IDIRSH = JSON.parse(JSON.stringify(IDIR));
    while (hist.length > 0) {
      let posi = hist.pop();
      irow = posi[0];
      icol = posi[1];
      {
        {
          // 恣意的に方向を決める
          console.assert(this.data_[irow][icol] == 0); // 起点は通路のはず
          let dirPary = [{dir:0, p:0.1},
                         {dir:1, p:0.1},
                         {dir:2, p:0.1},
                         {dir:3, p:0.1}];
          // 隣接する通路を確認
          for (let idir = 0; idir < 4; ++idir) {
            let irow1 = irow + IDIR[idir][0], icol1 = icol + IDIR[idir][1];
            let irow2 = irow + IDIR[idir][0]*2, icol2 = icol + IDIR[idir][1]*2;
            if (this.isStreet(irow1, icol1)) {
              let idirOpo = (idir+2) % 4;
              dirPary[idirOpo].p += wStraight; // 反対側、直線状の重み
              // 通路の隣接、右側
              let idirR = (idir+1) % 4;
              let idirL = (idir+3) % 4;
              let irow2R = irow2 + IDIR[idirR][0], icol2R = icol2 + IDIR[idirR][1];
              if (this.isStreet(irow2R, icol2R)) {
                dirPary[idirL].p += wSlash; // ななめの重み
              }
              let irow2L = irow2 + IDIR[idirL][0], icol2L = icol2 + IDIR[idirL][1];
              if (this.isStreet(irow2L, icol2L)) {
                dirPary[idirR].p += wSlash; // ななめの重み
              }
            }
          }
          IDIRSH = [];
          while (true) {
            let wsum = 0;
            // 重みの和を求め...
            for (let i = 0; i < dirPary.length; ++i) {
              wsum += dirPary[i].p;
            }
            if (wsum == 0) {
              // 和が 0 ならそのまま選択肢に追加
              for (let i = 0; i < dirPary.length; ++i) {
                let idir = dirPary[i].dir;
                IDIRSH.push([IDIR[idir][0], IDIR[idir][1]]);
              }
              break;
            } else {
              // 和を使って、重みを正規化
              for (let i = 0; i < dirPary.length; ++i) {
                dirPary[i].p = dirPary[i].p/wsum;
              }
              // 重みでソート
              dirPary.sort((v1,v2) => v1.p > v2.p ? 1 : -1);
              // さいころをふって（確率で）合致する確率の項目を選択肢に追加
              let p = Math.random();
              for (let i = 0; i < dirPary.length; ++i) {
                if (p <= dirPary[i].p) {
                  let idir = dirPary[i].dir;
                  IDIRSH.push([IDIR[idir][0], IDIR[idir][1]]);
                  dirPary.splice(i, 1);
                  break;
                } else {
                  p -= dirPary[i].p;
                }
                if (i == dirPary.length-1) {
                  let idir = dirPary[i].dir;
                  IDIRSH.push([IDIR[idir][0], IDIR[idir][1]]);
                  dirPary.splice(i, 1);
                  break;
                }
              }
              if (dirPary.length == 0) {
                break;
              }
            }
          }
          console.assert(IDIRSH.length == 4);
        }
        for (let idirsh2 of IDIRSH) {
          let irow1 = posi[0] + idirsh2[0], icol1 = posi[1] + idirsh2[1];
          let irow2 = posi[0] + idirsh2[0]*2, icol2 = posi[1] + idirsh2[1]*2;
          if ((0 < irow2) && (irow2 < nrow__) && (0 < icol2) && (icol2 < ncol__)) {
            if (this.isWall(irow2, icol2)) {
              this.data_[irow1][icol1] = 0; // 通路
              this.data_[irow2][icol2] = 0; // 通路
              hist.push([irow,icol]);
              hist.push([irow2,icol2]);
              break;
            } else if ((this.isWall(irow1, icol1)) && (Math.random() < pAperture)) {
              this.data_[irow1][icol1] = 0; // 通路
              break;
            }
          }
        }
      }
    }
    // nrow,ncol が偶数の場合に、右下（ゴール地点）が壁のまま／削りきれないので..
    if ((this.nrow_ % 2) == 0) {
      this.data_[nrow__-1][ncol__-1] = 0;
      this.data_[nrow__-2][ncol__-1] = 0;
    }
    if ((this.ncol_ % 2) == 0) {
      this.data_[nrow__-1][ncol__-1] = 0;
      this.data_[nrow__-1][ncol__-2] = 0;
    }
  }

  create_extendwall() {
    // 壁のばし法
    // - ２マスずつ進む
    // ref) https://zenn.dev/baroqueengine/books/a19140f2d9fc1a/viewer/49a601
    // 偶数だとアルゴリズムが破綻するので奇数にする
    if ((this.nrow_ % 2) == 0) {
      this.nrow_ = this.nrow_-1;
      this.nrow_1 = this.nrow_-1;
    }
    if ((this.ncol_ % 2) == 0) {
      this.ncol_ = this.ncol_-1;
      this.ncol_1 = this.ncol_-1;
    }
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    this.init(0);
    // 最も外側の壁
    for (let irow = 0; irow < this.nrow_; ++irow) {
      this.data_[irow][0] = 1;
      this.data_[irow][ncol__] = 1;
    }
    for (let icol = 0; icol < this.ncol_; ++icol) {
      this.data_[0][icol] = 1;
      this.data_[nrow__][icol] = 1;
    }
    // 壁を派生させる候補
    let candi = [];
    for (let irow = 2; irow < this.nrow_; irow+=2) {
      candi.push([irow, 0]);
      candi.push([irow, ncol__]);
    }
    for (let icol = 2; icol < this.ncol_; icol+=2) {
      candi.push([0, icol]);
      candi.push([nrow__, icol]);
    }
    candi = shuffle2(candi);
    let IDIRSH = JSON.parse(JSON.stringify(IDIR));
    while (candi.length > 0) {
      let posi = candi.shift();
      let irow = posi[0];
      let icol = posi[1];
      {
        IDIRSH = shuffle2(IDIRSH);
        for (let idirsh2 of IDIRSH) {
          let irow1 = posi[0] + idirsh2[0], icol1 = posi[1] + idirsh2[1];
          let irow2 = posi[0] + idirsh2[0]*2, icol2 = posi[1] + idirsh2[1]*2;
          if ((0 < irow2) && (irow2 < nrow__) && (0 < icol2) && (icol2 < ncol__) && (this.data_[irow2][icol2] == 0)) {
            this.data_[irow1][icol1] = 1; // 壁
            this.data_[irow2][icol2] = 1; // 壁
            candi.unshift([irow2,icol2]);
            candi.push([irow,icol]);
            break;
          }
        }
      }
    }
  }

  create_extendwall_2() {
    // 壁のばし法＋中央からも .. 複数経路のある迷路
    // - ２マスずつ進む
    // ref) https://zenn.dev/baroqueengine/books/a19140f2d9fc1a/viewer/49a601
    // 偶数だとアルゴリズムが破綻するので奇数にする
    if ((this.nrow_ % 2) == 0) {
      this.nrow_ = this.nrow_-1;
      this.nrow_1 = this.nrow_-1;
    }
    if ((this.ncol_ % 2) == 0) {
      this.ncol_ = this.ncol_-1;
      this.ncol_1 = this.ncol_-1;
    }
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    this.init(0);
    // 最も外側の壁
    for (let irow = 0; irow < this.nrow_; ++irow) {
      this.data_[irow][0] = 1;
      this.data_[irow][ncol__] = 1;
    }
    for (let icol = 0; icol < this.ncol_; ++icol) {
      this.data_[0][icol] = 1;
      this.data_[nrow__][icol] = 1;
    }
    // 壁を派生させる候補
    let candi = [];
    // 壁から派生
    for (let irow = 2; irow < this.nrow_; irow+=2) {
      candi.push([irow, 0]);
      candi.push([irow, ncol__]);
    }
    for (let icol = 2; icol < this.ncol_; icol+=2) {
      candi.push([0, icol]);
      candi.push([nrow__, icol]);
    }
    candi = shuffle2(candi);
    // 中央の空間から
    for (let iloop = Math.ceil(nrow__*ncol__/100); iloop >= 0; --iloop) {
      let irow = Math.floor(Math.random()*((this.nrow_-1)/2-2))*2+2;
      let icol = Math.floor(Math.random()*((this.ncol_-1)/2-2))*2+2;
      candi.unshift([irow, irow]);
    }
    let IDIRSH = JSON.parse(JSON.stringify(IDIR));
    while (candi.length > 0) {
      let posi = candi.shift();
      let irow = posi[0];
      let icol = posi[1];
      if (this.data_[irow][icol] == 0) {
        this.data_[irow][icol] == 1;
      }
      {
        IDIRSH = shuffle2(IDIRSH);
        for (let idirsh2 of IDIRSH) {
          let irow1 = posi[0] + idirsh2[0], icol1 = posi[1] + idirsh2[1];
          let irow2 = posi[0] + idirsh2[0]*2, icol2 = posi[1] + idirsh2[1]*2;
          if ((0 < irow2) && (irow2 < nrow__) && (0 < icol2) && (icol2 < ncol__) &&
              (this.data_[irow2][icol2] == 0) && (this.data_[irow1][icol1] == 0)) {
            this.data_[irow1][icol1] = 1; // 壁
            this.data_[irow2][icol2] = 1; // 壁
            candi.unshift([irow2,icol2]);
            break;
          }
        }
      }
    }
    // nrow,ncol が偶数の場合に、右下（ゴール地点）が壁のことがあるので..
    if ((this.nrow_ % 2) == 0) {
      this.data_[nrow__-1][ncol__-1] = 0;
      this.data_[nrow__-2][ncol__-1] = 0;
    }
    if ((this.ncol_ % 2) == 0) {
      this.data_[nrow__-1][ncol__-1] = 0;
      this.data_[nrow__-1][ncol__-2] = 0;
    }
  }

  create_areamap() {
    // マップ生成(1)  ライフゲーム／太らせ・細らせ の亜種
    // ref) https://zenn.dev/baroqueengine/books/a19140f2d9fc1a/viewer/4d814f
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    this.init(0);
    for (let irow = 0; irow < this.nrow_; ++irow) {
      for (let icol = 0; icol < this.ncol_; ++icol) {
        this.data_[irow][icol] = 0; // 通路
        if ((irow == 0) || (irow == nrow__) || (icol == 0) || (icol == ncol__)) {
          // 最も外側の壁
          this.data_[irow][icol] = 1;
        } else if (Math.random() < 0.3) {
          // 柱
          this.data_[irow][icol] = 1;
        }
      }
    }
    let iloop = 3;
    function ncnt3rnd(irow, icol, data) {
      let count = 0;
      for (let iirow = irow-1; iirow <= irow+1; ++iirow) {
        for (let iicol = icol-1; iicol <= icol+1; ++iicol) {
          count += data[iirow][iicol];
        }
      }
      return count;
    };
    function ncnt5rnd(irow, icol, data) {
      let count = 0;
      let iirowL = Math.max(0, irow-2);
      let iirowH = Math.min(nrow__, irow+2);
      let iicolL = Math.max(0, icol-2);
      let iicolH = Math.min(ncol__, icol+2);
      for (let iirow = iirowL; iirow <= iirowH; ++iirow) {
        for (let iicol = iicolL; iicol <= iicolH; ++iicol) {
          count += data[iirow][iicol];
        }
      }
      return count;
    };
    while (iloop > 0) {
      --iloop;
      let tdata = JSON.parse(JSON.stringify(this.data_));
      for (let irow = 1; irow < nrow__; ++irow) {
        for (let icol = 1; icol < ncol__; ++icol) {
          let ncnt3 = ncnt3rnd(irow, icol, tdata);
          if (ncnt3 >= 5) {
            this.data_[irow][icol] = 1;
            continue;
          }
          let ncnt5 = ncnt5rnd(irow, icol, tdata);
          if (ncnt5 <= 2) {
            this.data_[irow][icol] = 1;
            continue;
          }
          this.data_[irow][icol] = 0;
        }
      }
    }
  }


  create_areamap_perling_0() {
    // マップ生成  パーリンノイズの2値化
    // ref) https://zenn.dev/msakuta/articles/ef996762a9daf2
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    let mm = new Date().getMinutes(); // 分単位でパーリンノイズを変化させる
    this.init(0);
    // 大まかな空洞・壁を作成
    for (let irow = 0; irow < this.nrow_; ++irow) {
      for (let icol = 0; icol < this.ncol_; ++icol) {
        this.data_[irow][icol] = 0; // 通路
        if ((irow == 0) || (irow == nrow__) || (icol == 0) || (icol == ncol__)) {
          // 最も外側の壁
          this.data_[irow][icol] = 1;
        } else  {
          let v = noise.perlin2(icol*0.1 ,irow*0.1, mm);
          if (v < 0) {
            this.data_[irow][icol] = 1;
          }
        }
      }
    }
  }

  create_areamap_perling_1() {
    // マップ生成
    // パーリンノイズを折り返し、一定値以上(0.8)を壁とする
    // ref) https://note.com/k1togami/n/ncbcfc17f429c
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    let mm = new Date().getMinutes(); // 分単位でパーリンノイズを変化させる
    this.init(0);
    // 大まかな空洞・壁を作成
    // パーリンノイズを折り返し、一定値以上(0.8)を壁とする
    for (let irow = 0; irow < this.nrow_; ++irow) {
      for (let icol = 0; icol < this.ncol_; ++icol) {
        this.data_[irow][icol] = 0; // 通路
        if ((irow == 0) || (irow == nrow__) || (icol == 0) || (icol == ncol__)) {
          // 最も外側の壁
          this.data_[irow][icol] = 1;
        } else {
          let v = noise.perlin3(icol*0.1 ,irow*0.1, mm);
          v = 1 - Math.abs(v)*2;
          if (v >= 0.8) {
            this.data_[irow][icol] = 1;
          }
        }
      }
    }
  }

  create_areamap_perling_3_dig() {
    // マップ生成  パーリンノイズの2値化＋穴掘り .. 広間のある迷路
    // ref) https://zenn.dev/msakuta/articles/ef996762a9daf2
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    this.init(0);
    // 大まかな空洞・壁を作成
    for (let irow = 0; irow < this.nrow_; ++irow) {
      for (let icol = 0; icol < this.ncol_; ++icol) {
        this.data_[irow][icol] = 0; // 通路
        if ((irow == 0) || (irow == nrow__) || (icol == 0) || (icol == ncol__)) {
          // 最も外側の壁
          this.data_[irow][icol] = 1;
        } else if (noise.perlin2(icol*0.1 ,irow*0.1) < 0) {
          this.data_[irow][icol] = 1;
        }
      }
    }
    // 穴掘り箇所の候補
    let hist = [];
    for (let iloop = Math.floor(nrow__*ncol__/10); iloop >= 0; --iloop) {
        let irow = Math.floor(Math.random()*this.nrow_);
        let icol = Math.floor(Math.random()*this.ncol_);
        if (this.data_[irow][icol] == 1) {
          hist.push([irow, icol]);
        }
    }
    let IDIRSH = JSON.parse(JSON.stringify(IDIR));
    function ncnt3rnd(irow, icol, data) {
      let count = 0;
      for (let iirow = irow-1; iirow <= irow+1; ++iirow) {
        for (let iicol = icol-1; iicol <= icol+1; ++iicol) {
          count += data[iirow][iicol];
        }
      }
      return count;
    };
    // そのまま穴掘りのアルゴリズムを適用すると削りすぎるので
    // (irow1,icol1)の周りの壁の数が閾値(5)以上なら削る
    while (hist.length > 0) {
      let posi = hist.pop();
      let irow = posi[0];
      let icol = posi[1];
      {
        IDIRSH = shuffle2(IDIRSH);
        for (let idirsh2 of IDIRSH) {
          let irow1 = posi[0] + idirsh2[0], icol1 = posi[1] + idirsh2[1];
          let irow2 = posi[0] + idirsh2[0]*2, icol2 = posi[1] + idirsh2[1]*2;
          if ((0 < irow2) && (irow2 < nrow__) && (0 < icol2) && (icol2 < ncol__) &&
              (this.data_[irow2][icol2] == 1) &&
              (ncnt3rnd(irow1, icol1, this.data_) >= 5)) {
            this.data_[irow1][icol1] = 0; // 通路
            this.data_[irow2][icol2] = 0; // 通路
            hist.push([irow,icol]);
            hist.push([irow2,icol2]);
            break;
          }
        }
      }
    }
  }

  setStartGoal(s = [null, null], g = [null, null]) {
    let nrow__ = this.nrow_ - 1;
    let ncol__ = this.ncol_ - 1;
    if ((s[0] == null) || (s[1] == null)) {
      s = [1, 1];
    }
    if ((g[0] == null) || (g[1] == null)) {
      g = [nrow__-1, ncol__-1];
    }
    this.pStart_ = s;
    this.pGoal_ = g;
  }

  resetStartGoal() {
    // スタート、ゴールの位置をリセット
    // .. 最遠方に置き直す
    this.pGoal_ = this.seekFarPoint(this.pStart_);
    this.pStart_ = this.seekFarPoint(this.pGoal_);
    this.pGoal_ = this.seekFarPoint(this.pStart_);
    this.pStart_ = this.seekFarPoint(this.pGoal_);
  }

  // ------------------------------

  rc2idx(irow, icol) {
    return irow*this.ncol_ + icol;
  }

  idx2rc(index) {
      let icol = index % this.ncol_;
      let irow = Math.round((index-icol) / this.ncol_);
    return [irow, icol];
  }

  seekPath2() {
    // BFS（幅優先探索）
    let distS2E = -1; // 最短距離
    // スタート地点からの距離を保存する配列
    let distS = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(-1));
    distS[this.pStart_[0]][this.pStart_[1]] = 0; // スタート位置
    // 探索済みマスを管理する配列
    let visited  = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(false));
    visited[this.pStart_[0]][this.pStart_[1]] = true; // スタート位置
    let candi = [this.pStart_]; // 探索候補
    while (candi.length > 0) {
      let p = candi.shift(); // 配列の先頭を取得
      // ゴールに到達
      if (p[0] === this.pGoal_[0] && p[1] === this.pGoal_[1]) {
        distS2E = distS[p[0]][p[1]];
        break;
      }
      // 上下左右を探索
      for (let idir = 0; idir < 4; ++idir) {
        let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1]];
        // テーブルの範囲内かつ道かつ未探索の場合
        if ((0 <= q[0] && q[0] < this.nrow_) &&  // 有効領域の判定（壁で覆われていれば不要）
            (0 <= q[1] && q[1] < this.ncol_) &&
            this.data_[q[0]][q[1]] == 0 &&  // 通路
            !visited[q[0]][q[1]]) {  // 未訪問
          candi.push(q);  // 次の候補を末尾に（幅優先）
          visited[q[0]][q[1]]  = true; // 訪問済みに
          distS[q[0]][q[1]] = distS[p[0]][p[1]] + 1; // qの距離を p+1に
        }
      }
    }
    let path = []
    if (distS2E > 0) {
      // ゴール位置から逆にたどる
      let p = this.pGoal_;
      path.unshift(p[0]*this.ncol_ + p[1]); // 配列の先頭に入れる
      let dist = distS2E-1;
      while (dist > 0) {
        // 上下左右を探索
        let bfound = false;
        for (let idir = 0; idir < 4; ++idir) {
          let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1]];
          if (distS[q[0]][q[1]] == dist) {
            path.unshift(q[0]*this.ncol_ + q[1]); // 配列の先頭に入れる
            // this.path2_.unshift(q[0]*this.ncol_ + q[1]); // 配列の先頭に入れる
            p = q;
            --dist;
            bfound = true;
            break;
          }
        }
        if (bfound == false) {
          // 複数経路で間違った方向に進んだかも？
          console.assert(0);
        }
      }
      p = this.pStart_;
      path.unshift(p[0]*this.ncol_ + p[1]); // 配列の先頭に入れる
    }
    this.path2_ = path;
    return [distS2E, path];
  }

  seekPath3() {
    // DFS(深さ優先探索)
    let distS2E = -1; // 最短距離
    // スタート地点からの距離を保存する配列
    let distS = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(-1));
    distS[this.pStart_[0]][this.pStart_[1]] = 0; // スタート位置
    // 探索済みマスを管理する配列
    let visited  = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(false));
    visited[this.pStart_[0]][this.pStart_[1]] = true; // スタート位置
    let candi = [this.pStart_]; // 探索候補
    while (candi.length > 0) {
      let p = candi.shift(); // 配列の先頭を取得
      // ゴールに到達
      if (p[0] === this.pGoal_[0] && p[1] === this.pGoal_[1]) {
        distS2E = distS[p[0]][p[1]];
        break;
      }
      // 上下左右を探索
      for (let idir = 0; idir < 4; ++idir) {
        let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1]];
        // テーブルの範囲内かつ道かつ未探索の場合
        if ((0 <= q[0] && q[0] < this.nrow_) &&  // 有効領域の判定（壁で覆われていれば不要）
            (0 <= q[1] && q[1] < this.ncol_) &&
            this.data_[q[0]][q[1]] == 0 &&  // 通路
            !visited[q[0]][q[1]]) {  // 未訪問
          // candi.push(q);  // 次の候補を末尾に（幅優先） seekPath2
          candi.unshift(q);  // 次の候補を先頭に（深さ優先）seekPath3
          visited[q[0]][q[1]]  = true; // 訪問済みに
          distS[q[0]][q[1]] = distS[p[0]][p[1]] + 1; // qの距離を p+1に
        }
      }
    }
    let path = []
    if (distS2E > 0) {
      // ゴール位置から逆にたどる
      let p = this.pGoal_;
      path.unshift(p[0]*this.ncol_ + p[1]); // 配列の先頭に入れる
      let dist = distS2E-1;
      while (dist > 0) {
        // 上下左右を探索
        let bfound = false;
        for (let idir = 0; idir < 4; ++idir) {
          let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1]];
          if (distS[q[0]][q[1]] == dist) {
            path.unshift(q[0]*this.ncol_ + q[1]); // 配列の先頭に入れる
            // this.path3_.unshift(q[0]*this.ncol_ + q[1]); // 配列の先頭に入れる
            p = q;
            --dist;
            bfound = true;
            break;
          }
        }
        if (bfound == false) {
          // 複数経路で間違った方向に進んだかも？
          console.assert(0);
        }
      }
      p = this.pStart_;
      path.unshift(p[0]*this.ncol_ + p[1]); // 配列の先頭に入れる
    }
    this.path3_ = path;
    return [distS2E, path];
  }

  seekPath6() {
    // A*
    let costS2E = -1; // スタートからゴールまでの距離／コスト
    // スタート地点からの距離／コストを保存する配列
    let costS = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(-1));
    costS[this.pStart_[0]][this.pStart_[1]] = 0; // スタート位置
    // 探索済みマスを管理する配列
    let visited  = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(false));
    visited[this.pStart_[0]][this.pStart_[1]] = true; // スタート位置
    function dist2goal(q, pGoal) {
        let vr = q[0] - pGoal[0], vc = q[1] - pGoal[1];
        return vr**2 + vc**2;
    }
    let candi = [{rc:this.pStart_, // 座標(row,col)
                  d:dist2goal(this.pStart_, this.pGoal_),   // goalまでの距離(ソート用のキー)
                 }]; // 探索候補
    let waitSort, nwaitSort = 6;
    waitSort = nwaitSort;
    while (candi.length > 0) {
      let vv = candi.shift(); // 配列の先頭を取得
      let p = vv.rc;
      // ゴールに到達
      if (p[0] === this.pGoal_[0] && p[1] === this.pGoal_[1]) {
        costS2E = costS[p[0]][p[1]];
        break;
      }
      // 上下左右を探索
      for (let idir = 0; idir < 4; ++idir) {
        let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1]];
        // テーブルの範囲内かつ道かつ未探索の場合
        if ((0 <= q[0] && q[0] < this.nrow_) &&  // 有効領域の判定（壁で覆われていれば不要）
            (0 <= q[1] && q[1] < this.ncol_) &&
            this.data_[q[0]][q[1]] == 0) {
          // 通路
          if (!visited[q[0]][q[1]]) {  // 未訪問
            candi.push({rc:q,
                        d:dist2goal(q, this.pGoal_)});
            visited[q[0]][q[1]]  = true; // 訪問済みに
            costS[q[0]][q[1]] = costS[p[0]][p[1]] + 1; // qの距離を p+1に
          } else if (costS[q[0]][q[1]] > costS[p[0]][p[1]] + 1) {
            // 新しいパスがコストが低い／近い  ..ので上書き
            candi.push({rc:q,
                        d:dist2goal(q, this.pGoal_)});
            visited[q[0]][q[1]]  = true; // 訪問済みに
            costS[q[0]][q[1]] = costS[p[0]][p[1]] + 1; // qの距離を p+1に
          }
        }
      }
      if (--waitSort < 0) {
        // 頻繁にソートしない／深さ優先にしすぎない／若干幅優先にもなるように、クールタイムを設ける
        waitSort = nwaitSort;
        // candi を d(ゴールまでの距離)でソート
        candi.sort((a,b) => a.d > b.d ? 1 : -1);
      }
    }
    let path = []
    if (costS2E > 0) {
      // ゴール位置から逆にたどる
      let p = this.pGoal_;
      path.unshift(p[0]*this.ncol_ + p[1]); // 配列の先頭に入れる
      let cost = costS2E;
      let iloop = 0;
      while (cost > 1) {
        if (++iloop > 100) {
          break;
        }
        // 上下左右を探索
        let bfound = false;
        let costMin = cost;
        let qmin = [0, 0];
        for (let idir = 0; idir < 4; ++idir) {
          let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1]];
          if ((costS[q[0]][q[1]] > 0) && (costMin > costS[q[0]][q[1]])) {
            costMin = costS[q[0]][q[1]];
            qmin = [q[0], q[1]];
          }
        }
        if (cost > costMin) {
          path.unshift(qmin[0]*this.ncol_ + qmin[1]); // 配列の先頭に入れる
          // this.path6_.unshift(qmin[0]*this.ncol_ + qmin[1]); // 配列の先頭に入れる
          p = qmin;
          cost = costMin;
          bfound = true;
        }
        if (bfound == false) {
          // 複数経路で間違った方向に進んだかも？
          console.assert(0);
        }
      }
      p = this.pStart_;
      path.unshift(p[0]*this.ncol_ + p[1]); // 配列の先頭に入れる
    }
    this.path6_ = path;
    return [costS2E, path];
  }

  seekSomePath2() {
    // 複数の経路をもとめる
    // seekPath2 を使う版
    this.seekPath = this.seekPath2;
    let pathList = this.seekSomePathBase();
    delete this.seekPath;
    if (pathList.length > 0) {
      this.path2_ = pathList[0];
    }
    return pathList;
  }

  seekSomePath6() {
    // 複数の経路をもとめる
    // seekPath6 を使う版
    this.seekPath = this.seekPath6;
    let pathList = this.seekSomePathBase();
    delete this.seekPath;
    if (pathList.length > 0) {
      this.path6_ = pathList[0];
    }
    return pathList;
  }

  seekSomePathBase() {
    // 複数の経路をもとめる
    // - 「最短経路を求めたあと、経路の一部を通行止めにして別の最短経路を求める」
    //    を繰り返して、複数の経路を探す
    this.clearPath();
    let somePath = {};
    let criticalIdx = []; // 致命的な座標（最短経路が見つからない／ゴールへのパスを潰すセル）
    let candiOrg = [];
    let dataOrg = JSON.parse(JSON.stringify(this.data_));
    {
      // 初回用の候補を取得
      let [cost, path] = this.seekPath();
      if (cost >= 0) {
        let key = path.join(",");
        somePath[key] = path;
      }
      // 経路から行き止まり候補を抜き出す（すべてでもよいけど２おきにしてみる
      for (let i = 1; i < path.length-1; i += 2) {
        candiOrg.push(path[i]);
      }
    }
    // メインループ（地図をリセットして、通行止めを新規に配置しなおす
    // サブループ（通行止めの箇所を増やして、別の経路を探す。ただしこの解は局所解の可能性あり
    let mainLoop = 3;
    while (--mainLoop > 0) {
      let candi = JSON.parse(JSON.stringify(candiOrg));
      let subLoop = Math.ceil(Math.log(candi.length))*2;
      this.data_ = JSON.parse(JSON.stringify(dataOrg)); // 地図をリセット
      while (--subLoop > 0) {
        shuffle(candi);
        let idx = candi.shift();
        if (criticalIdx.includes(idx)) {
          continue;
        }
        // 通路をブロックするまえにバックアップを取る
        let dataBackup = JSON.parse(JSON.stringify(this.data_));
        // p の位置を通行止め／該当位置を壁に
        let p = this.idx2rc(idx);
        this.data_[p[0]][p[1]] = 1;
        let [cost, path] = this.seekPath();
        if (cost< 0) {
          // 最短経路が見つからなかった..失敗 .. 地図を戻す
          this.data_ = dataBackup;
          criticalIdx.push(idx);
          continue;
        }
        // 最短経路が見つかった
        let key = path.join(",");
        if (!(key in somePath)) {
          somePath[key] = path;
          // 経路から行き止まり候補を抜き出す（すべてでもよいけど２おきにしてみる
          for (let i = 1; i < path.length-1; i += 2) {
            if (!candi.includes(path[i])) {
              candi.push(path[i]);
            }
            if (!candiOrg.includes(path[i])) {
              candiOrg.push(path[i]);
            }
          }
          mainLoop += 3;
        }
      }
    }
    // データの持ち方を変更
    let pathList = []
    for (let key in somePath) {
      let path = somePath[key];
      pathList.push(path);
    }
    if (pathList.length > 0) {
      // 重複チェックとして、任意の２つのパスで、短い方のパスの８割と一致したら長い方は重複しているとして削除
      let matchingRateTh = 0.8;
      let delFlag = new Array(pathList.length).fill(false);
      for (let i = 0; i < pathList.length-1; ++i) {
        for (let j = i+1; j < pathList.length; ++j) {
          let path1 = pathList[i];
          let path2 = pathList[j];
          let bswap = false;
          if (path1.length > path2.length) {
            [path1, path2] = [path2, path1];
            bswap = true;
          }
          let matchFlag = {};
          for (let k = 0; k < path2.length; ++k) {
            matchFlag[path2[k]] = 1;
          }
          let count = 0;
          for (let k = 0; k < path1.length; ++k) {
            if (matchFlag[path1[k]] == 1) {
              ++count;
            }
          }
          if (count/path1.length >= matchingRateTh) {
            if (!bswap) {
              delFlag[j] = true;
            } else {
              delFlag[i] = true;
            }
          }
        }
      }
      let pathList2 = [];
      for (let i = 0; i < pathList.length; ++i) {
        if (!delFlag[i]) {
          pathList2.push(pathList[i]);
        }
      }
      pathList = pathList2;
    }
    this.clearPath(); // 下記パス表示のために、上記処理で求めた this.path*_をクリアしておく
    this.data_ = dataOrg;
    for (let i = 0; i < pathList.length; ++i) {
      let path = pathList[i];
      this.path99_ = path;
      let [nwalk, nturn] = this.evalPathIdx(path);
      console.log("walk=", nwalk, ", turn=", nturn, ", path=\n",path);
      this.dbgPrintMap();
    }
    this.clearPath();
    return pathList;
  }

  seekFarPoint(pStart) {
    // BFS（幅優先探索） で最遠方にある点を返す
    let distSmax = -1; // 最短距離の最大値
    let pSmax = [0, 0];
    // スタート地点からの距離を保存する配列
    let distS = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(-1));
    distS[pStart[0]][pStart[1]] = 0; // スタート位置
    // 探索済みマスを管理する配列
    let visited  = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(false));
    visited[pStart[0]][pStart[1]] = true; // スタート位置
    let candi = [pStart]; // 探索候補
    let nRest = 0; // 探査可能な個数
    for (let irow  = 0; irow < this.nrow_; ++irow) {
      for (let icol  = 0; icol < this.ncol_; ++icol) {
        if (this.data_[irow][icol] == 0) {
          ++nRest;
        }
      }
    }
    --nRest; // スタート地点を抜く
    while (candi.length > 0) {
      let p = candi.shift(); // 配列の先頭を取得
      // 未調査がない
      if (nRest == 0) {
        break;
      }
      // 上下左右を探索
      for (let idir = 0; idir < 4; ++idir) {
        let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1]];
        // テーブルの範囲内かつ道かつ未探索の場合
        if ((0 <= q[0] && q[0] < this.nrow_) &&  // 有効領域の判定（壁で覆われていれば不要）
            (0 <= q[1] && q[1] < this.ncol_) &&
            this.data_[q[0]][q[1]] == 0 &&  // 通路
            !visited[q[0]][q[1]]) {  // 未訪問
          --nRest;
          candi.push(q);  // 次の候補を末尾に（幅優先）
          visited[q[0]][q[1]]  = true; // 訪問済みに
          distS[q[0]][q[1]] = distS[p[0]][p[1]] + 1; // qの距離を p+1に
          if (distSmax < distS[q[0]][q[1]]) { // 最長位置の更新
            distSmax = distS[q[0]][q[1]];
            pSmax = [q[0], q[1]];
          }
        }
      }
    }
    return pSmax;
  }

  nWallwDead(posi, deadend) {
    // 壁の数を数える .. 3:= 袋小路（行き止まり) 2:= 通路、 1:= 分岐、0:=分岐(三叉路)
    let icount = 0;
    for (let idir = 0; idir < 4; ++idir) {
      let irow = posi[0] + IDIR[idir][0], icol = posi[1] + IDIR[idir][1];
      if (this.data_[irow][icol] == 1) {
        ++icount;
      } else if (deadend[irow][icol] == 1) {
        ++icount;
      }
    }
    return icount;
  }

  evalPathIdx(idxlist) {
    // パスの評価（簡単に「歩数」と「方向転換」）
    let ntrun = 0; // 折れ：idir4単位(90度)を２とする(maze2, maze3とそろえるため)
    let nwalk = 0; // 歩数：縦横と斜めを等しく１とする
    let rclist = idxlist.map(idx => this.idx2rc(idx));
    let nlist = rclist.length, nlist_=nlist-1;
    let idirold = -1;
    for (let i = 0; i < nlist_; ++i) {
      let p1 = rclist[i];
      let p2 = rclist[i+1];
      let idir = rc2idir(p1,p2);
      if (i) {
        let diffidir = Math.abs(idir - idirold);
        if (diffidir > 2) {
          diffidir = 4 - diffidir;
        }
        ntrun += diffidir*2;
      }
      idirold = idir;
    }
    nwalk = nlist_;
    return [nwalk, ntrun];
  }

  seekDeadEnd() {
    // 行き止まりのパスを求める
    // 行き止まりのマップフラグ(1:行き止まりのパス)
    let deadend = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(0));
    // 4方向すべて確認したマスを管理する配列
    let visited  = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(false));
    visited[this.pStart_[0]][this.pStart_[1]] = true; // スタート位置
    visited[this.pGoal_[0]][this.pGoal_[1]] = true; // ゴール位置
    // 三方向が壁（袋小路）の場所を探す
    let candi = [];
    this.deadend1_ = [];
    for (let irow = 0; irow < this.nrow_; ++irow) {
      for (let icol = 0; icol < this.ncol_; ++icol) {
        if (this.data_[irow][icol] == 1 || visited[irow][icol] == 1) {
          // 壁｜訪問済みならスキップ
          continue;
        }
        let nwall = this.nWallwDead([irow, icol], deadend);
        if (nwall == 3) {
          candi.push([irow,icol]);
        }
      }
    }
    while (candi.length > 0) {
      let p = candi.shift(); // 配列の先頭を取得
      deadend[p[0]][p[1]] = 1;
      this.deadend1_.push((p[0]*this.ncol_ + p[1]));
      // 上下左右を探索
      let badd = false;
      for (let idir = 0; idir < 4; ++idir) {
        let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1]];
        if ((this.data_[q[0]][q[1]] == 1) || (visited[q[0]][q[1]])) {
          // 壁 | 訪問済み
          continue;
        }
        let nwall = this.nWallwDead(q, deadend);
        let badd = false;
        if (nwall >= 3) {
          // 移動元を埋めているので、３方向以上が通路（２以下なら分岐）
          // 深さ優先にするため candiの先頭に
          // ４方向の確認が取れてないので、再度確認のため追加
          candi.unshift(p);
          candi.unshift(q);
          badd = true;
          break;
        }
      }
      if (badd == false) {
        // ４方向の確認が済んだので、自身を訪問済み／進入禁止に
        visited[p[0]][p[1]] = true;
      }
    }
  }


  printPathAndWall(str, path) {
    for (let irow = 0; irow < this.nrow_; ++irow) {
      for (let icol = 0; icol < this.ncol_; ++icol) {
        let idx1 = this.rc2idx(irow,icol);
        if ((this.pStart_[0] == irow) && (this.pStart_[1] == icol)) {
            str += "S";
        } else if ((this.pGoal_[0] == irow) && (this.pGoal_[1] == icol)) {
            str += "G";
        } else if (this.data_[irow][icol] == 1) {
            str += "#";
        } else if (path.includes(idx1)) {
            str += ".";
        } else {
            str += " ";
        }
      }
      str += "\n";
    }
    return str;
  }

  dbgPrintMap() {
    // デバッグ表示
    let str = '\n';
    if (this.path2_.length > 0) {
      str += "最短経路(path2)を表示\n"
      let path = this.path2_;
      str = this.printPathAndWall(str, path);
    } else if (this.path3_.length > 0) {
      str += "経路(path3)を表示\n"
      let path = this.path3_;
      str = this.printPathAndWall(str, path);
    } else if (this.path6_.length > 0) {
      str += "最短経路(path6)を表示\n"
      let path = this.path6_;
      str = this.printPathAndWall(str, path);
    } else if (this.path99_.length > 0) {
      str += "経路(path99)を表示\n"
      let path = this.path99_;
      str = this.printPathAndWall(str, path);
    } else if (this.deadend1_.length > 0) {
      str += "行き止まり(deadend1)を表示\n"
      let path = this.deadend1_;
      for (let irow = 0; irow < this.nrow_; ++irow) {
        for (let icol = 0; icol < this.ncol_; ++icol) {
          let idx1 = this.rc2idx(irow,icol);
          if ((this.pStart_[0] == irow) && (this.pStart_[1] == icol)) {
              str += "S";
          } else if ((this.pGoal_[0] == irow) && (this.pGoal_[1] == icol)) {
              str += "G";
          } else if (this.data_[irow][icol] == 1) {
              str += "#";
          } else if (path.includes(idx1)) {
              str += "x";
          } else {
              str += " ";
          }
        }
        str += "\n";
      }
    } else {
      str = this.printPathAndWall(str, []);
    }
    console.log(str);
  }
};

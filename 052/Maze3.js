// mode:javascript
// 薄い壁の迷路で斜め移動を考慮した迷路

"use strict"

import * as Maze2 from "Maze2";

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

const IDIR8 = [[0, 1],   // 東／右／→
               [1, 1],   // 南東／右下
               [1, 0],   // 南／下／↓
               [1, -1],  // 南西／左下
               [0, -1],  // 西／左／←
               [-1,-1],  // 北西／左上／
               [-1, 0],  // 北／上／↑
               [-1, 1]   // 北東／右上／
              ]
const nDIR8 = IDIR8.length;

const IDIR8rv = {"0,1":0,   // 東／右／→
                 "1,1":1,   // 南東／右下
                 "1,0":2,   // 南／下／↓
                 "1,-1":3,  // 南西／左下
                 "0,-1":4,  // 西／左／←
                 "-1,-1":5,  // 北西／左上／
                 "-1,0":6,  // 北／上／↑
                 "-1,1":7,} // 北東／右上／
function rc2idir8(p1,p2) {
    let q = [p2[0]-p1[0], p2[1]-p1[1]];
    let key = q.join(",");
    return IDIR8rv[key];
}

export class MazeData03 {
  // - マイクロマウス用のマップデータ

  type_ = 3;
  nrow_;
  ncol_;
  nrow_1;
  ncol_1;
  // 壁情報
  //  {行方向}{列方向}{東｜南} =  1:かべ, 0:通路
  // [irow][icol][idir]
  data_;
  // 最短経路
  path2_ = [];  // 幅優先用 / seekPath2
  path3_ = [];  // 深さ優先用 / seekPath3
  path6_ = [];  // A* 用 / seekPath6
  path7_ = [];  // 直線／斜め優先
  path8_ = [];  // 力技、総当たり
  path99_ = [];  // 複数の経路探索用 / seekSomePath
  deadend1_ = []; // 行き止まり

  constructor(nrow=2, ncol=2) {
    this.nrowOrg_ = nrow;
    this.ncolOrg_ = ncol;
    this.nrow_ = nrow*2+1;
    this.ncol_ = ncol*2+1;
    this.nrow_1 = this.nrow_-1;
    this.ncol_1 = this.ncol_-1;
    this.nrow_2 = this.nrow_-2;
    this.ncol_2 = this.ncol_-2;
    this.init(0);
    this.pStart_ = [0, 0];
    this.pGoalList_ = [this.pGoal_]; // ゴールは複数とする
  }

  init(defval = 1) {
    this.data_ = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(defval));
    return this.data_;
  }

  clearPath() {
    this.path2_ = [];  // 幅優先用 / seekPath2
    this.path3_ = [];  // 深さ優先用 / seekPath3
    this.path6_ = [];  // A* 用 / seekPath6
    this.path7_ = [];  // 直線・ななめ優先 / seekPath7
    this.path8_ = [];
    this.path99_ = [];
    this.deadend1_ = []; // 行き止まり
  }

  isBoundary(posi, idir) {
    if ((idir == 0 && posi[1] >= this.ncol_1) ||  // 東向きで右端
        (idir == 1 && posi[0] >= this.nrow_1) ||  // 南向きで下端
        (idir == 2 && posi[1] <= 1) ||  // 西向きで左端
        (idir == 3 && posi[0] <= 1)) {  // 北向きで上端
      return true;
    }
    return false;
  }

  isBoundary8(posi, idir8) {
    if ((idir8 == 0 && posi[1] >= this.ncol_1) ||  // 東向きで右端
        (idir8 == 1 && ((posi[1] >= this.ncol_1) || (posi[0] >= this.nrow_1))) ||  // 南東向きで右下端
        (idir8 == 2 && posi[0] >= this.nrow_1) ||  // 南向きで下端
        (idir8 == 3 && ((posi[0] >= this.nrow_1) || (posi[1] <= 1))) ||  // 南西向きで左下端
        (idir8 == 4 && posi[1] <= 1) ||  // 西向きで左端
        (idir8 == 5 && ((posi[0] <= 1) || (posi[1] <= 1))) ||   // 北西向きで左上端
        (idir8 == 6 && posi[0] <= 1) ||   // 北向きで上端
        (idir8 == 7 && ((posi[0] <= 1) || (posi[1] >= this.ncol_1)))    // 北東向きで右上端
        ) {
      return true;
    }
    return false;
  }

  isWallPosiDir(posi, idir) {
    // 位置(posi)から 方向(idir)に壁があるか？
    let irow = posi[0] + IDIR[idir][0], icol = posi[1] + IDIR[idir][1];
    return (this.data_[irow][icol] == 1);
  }

  isWallPosiDir8(posi, idir8) {
    if (this.isBoundary8(posi, idir8)) {
      return true;
    }
    if ((idir8 % 2) == 0) {
      if (idir8 == 0) {
        return (this.data_[posi[0]][posi[1]+1] == 1);
      } else if (idir8 == 2) {
        return (this.data_[posi[0]+1][posi[1]] == 1);
      } else if (idir8 == 4) {
        return (this.data_[posi[0]][posi[1]-1] == 1);
      } else if (idir8 == 6) {
        return (this.data_[posi[0]-1][posi[1]] == 1);
      }
    // 以下、斜め方向は、ななめが壁か もしくは 右手左手両方壁なら、壁とする
    } else if (idir8 == 1) {
      return ((this.data_[posi[0]+1][posi[1]+1] == 1) ||   // ななめ
              ((this.data_[posi[0]+1][posi[1]] == 1) &&    // 右手
               (this.data_[posi[0]][posi[1]+1] == 1)));    // 左手
    } else if (idir8 == 3) {
      return ((this.data_[posi[0]+1][posi[1]-1] == 1) ||    // ななめ
              ((this.data_[posi[0]][posi[1]-1] == 1) &&     // 右手
              (this.data_[posi[0]+1][posi[1]] == 1)));     // 左手
    } else if (idir8 == 5) {
      return ((this.data_[posi[0]-1][posi[1]-1] == 1) ||   // ななめ
              ((this.data_[posi[0]-1][posi[1]] == 1) &&    // 右手
              (this.data_[posi[0]][posi[1]-1] == 1)));    // 左手
    } else if (idir8 == 7) {
      return ((this.data_[posi[0]-1][posi[1]+1] == 1) ||    // ななめ
              ((this.data_[posi[0]][posi[1]+1] == 1) &&     // 右手
              (this.data_[posi[0]-1][posi[1]] == 1)));     // 左手
    }
    console.assert(0);
    return true;
  }

  nWall(posi) {
    // 壁の数を数える .. 3:= 袋小路（行き止まり) 2:= 通路、 1:= 分岐(T字路)、0:=分岐(十字路)
    let icount = 0;
    { // 東向き
      if (posi[1] == this.ncol_1) {
        ++icount
      } else if (this.data_[posi[0]][posi[1]+1] == 1) {
        ++icount
      }
    }
    { // 南向き
      if (posi[0] == this.nrow_1) {
        ++icount
      } else if (this.data_[posi[0]+1][posi[1]] == 1) {
        ++icount
      }
    }
    { // 西向き
      if (posi[1] == 0)  {
        ++icount
      } else if (this.data_[posi[0]][posi[1]-1] == 1) {
        ++icount
      }
    }
    {  // 北向き
      if (posi[0] == 0) {
        ++icount
      } else if (this.data_[posi[0]-1][posi[1]] == 1) {
        ++icount
      }
    }
    return icount;
  }

  enableDig(posi, idir) {  // [row,col]
    // 壁を掘れるか／壁があるか？（境界位置を加味して、境界なら優先して禁止／false)
    if (idir == 0) {
      if (posi[1] == this.ncol_1) { // 東向きで右端
        return false;
      }
      return (this.data_[posi[0]][posi[1]+1] == 1);
    } else if (idir == 1) {
      if (posi[0] == this.nrow_1) {  // 南向きで下端
        return false;
      }
      return (this.data_[posi[0]+1][posi[1]] == 1);
    } else if (idir == 2) {
      if (posi[1] == 0) {  // 西向きで左端
        return false;
      }
      return (this.data_[posi[0]][posi[1]-1] == 1);
    } else if (idir == 3) {
      if (posi[0] == 0) {  // 北向きで上端
        return false;
      }
      return (this.data_[posi[0]-1][posi[1]] == 1);
    }
    console.assert(0);
    return true;
  }

  create(method = 1) {
    let mzdata2 = new Maze2.MazeData02(this.nrowOrg_, this.ncolOrg_);
    mzdata2.create(method);
    this.create_from_maze2(mzdata2);
  }

  // maze2 のデータから作成する
  create_from_maze2(maze2) {
    this.nrow_ = maze2.nrow_*2+1;
    this.ncol_ = maze2.ncol_*2+1;
    this.nrow_1 = this.nrow_-1;
    this.ncol_1 = this.ncol_-1;
    this.nrow_2 = this.nrow_-2;
    this.ncol_2 = this.ncol_-2;
    this.init(0);
    let jrow, jcol;
    // 外枠（上側と左側
    for (let irow = 0; irow < this.nrow_; ++irow) {
      this.data_[irow][0] = 1;
    }
    for (let icol = 0; icol < this.ncol_; ++icol) {
      this.data_[0][icol] = 1;
    }
    for (let irow = 0; irow < maze2.nrow_; ++irow) {
      for (let icol = 0; icol < maze2.ncol_; ++icol) {
        for (let idir = 0; idir < 2; ++idir) {
          if (maze2.isWallPosiDir([irow,icol], idir)) {
            // 壁アリ
            if (idir == 0) {
              jrow = irow*2+0;
              jcol = icol*2+2;
              this.data_[jrow][jcol] = 1;
              jrow = irow*2+1;
              jcol = icol*2+2;
              this.data_[jrow][jcol] = 1;
              jrow = irow*2+2;
              jcol = icol*2+2;
              this.data_[jrow][jcol] = 1;
            } else if (idir == 1) {
              jrow = irow*2+2;
              jcol = icol*2;
              this.data_[jrow][jcol] = 1;
              jrow = irow*2+2;
              jcol = icol*2+1;
              this.data_[jrow][jcol] = 1;
              jrow = irow*2+2;
              jcol = icol*2+2;
              this.data_[jrow][jcol] = 1;
            }
          }
        }
      }
    }

    let p = maze2.pStart_;
    this.pStart_ = [p[0]*2+1, p[1]*2+1];
    this.pGoalList_ = maze2.pGoalList_.map(p => [p[0]*2+1, p[1]*2+1]);
  }

  isGoal(irow,icol) {
    for (let i = 0; i < this.pGoalList_.length; ++i) {
      if ((this.pGoalList_[i][0] == irow) && (this.pGoalList_[i][1] == icol)) {
        return true;
      }
    }
    return false;
  }

  setStartGoal(s = [null, null], g = [null, null]) {
    if ((s[0] == null) || (s[1] == null)) {
      s = [1, 1];
    }
    if ((g[0] == null) || (g[1] == null)) {
      g = [this.nrow_1, this.ncol_1];
    }
    this.pStart_ = s;
    this.pGoalList_ = [g];
  }

  // 必要なら maze2 のデータで実施
  // resetStartGoal() {
  // }

  rc2idx(irow, icol) {
    return irow*this.ncol_ + icol;
  }

  idx2rc(index) {
      let icol = index % this.ncol_;
      let irow = Math.round((index-icol) / this.ncol_);
    return [irow, icol];
  }

  // ------------------------------

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
    let pGoal = this.pGoalList_[0];
    while (candi.length > 0) {
      let p = candi.shift(); // 配列の先頭を取得
      // ゴールに到達
      if (this.isGoal(p[0], p[1])) {
        distS2E = distS[p[0]][p[1]];
        pGoal = [p[0], p[1]];
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
    // console.log("distS2E=",distS2E);
    let path = []
    if (distS2E > 0) {
      // ゴール位置から逆にたどる
      let p = pGoal;
      path.unshift(p[0]*this.ncol_ + p[1]); // 配列の先頭に入れる
      let dist = distS2E-1;
      while (dist > 0) {
        // 上下左右を探索
        let bfound = false;
        for (let idir = 0; idir < 4; ++idir) {
          if (this.isWallPosiDir(p, idir)) {
            continue;
          }
          let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1]];
          if (distS[q[0]][q[1]] == dist) {
            path.unshift(q[0]*this.ncol_ + q[1]); // 配列の先頭に入れる
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


  seekPath7() {
    // 直進が得意で、方向転換が苦手なケース
    // 斜めのコース取りが微妙にちがう
    // return this.seekPath7_0();
    return this.seekPath7_1();

    // 極端に、方向転換が得意なケース
    // return this.seekPath7_2();
  }

  seekPath7_0() {
    // 直進が得意で、方向転換が苦手なケース
    const costMove = [1, 1.4, 1, 1.4, 1, 1.4, 1, 1.4];
    const costTurn = [0, 0.5, 5, 6, 8];
    return this.seekPath7base(costMove, costTurn);
  }

  seekPath7_1() {
    // 直進が得意で、方向転換が苦手なケース(2)
    const costMove = [1, 1.5, 1, 1.5, 1, 1.5, 1, 1.5];
    const costTurn = [0, 0.3, 3, 4, 5];
    return this.seekPath7base(costMove, costTurn);
  }


  seekPath7_2() {
    // 極端に、方向転換が得意なケース
    const costMove = [1, 2, 1, 2, 1, 2, 1, 2];
    const costTurn = [0, 0, 0, 0, 0];
    return this.seekPath7base(costMove, costTurn);
  }

  seekPath7base(costMove, costTurn) {
    // 直進優先を考慮した最短経路
    let costS2E = -1; // スタートからゴールまでのコスト
    // コスト分布：座標値のコストを保存する配列
    let costDist = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(-1));
    costDist[this.pStart_[0]][this.pStart_[1]] = 0; // スタート位置
    // 探索済みマスを管理する配列
    let visited  = Array.from(new Array(this.nrow_), _ => new Array(this.ncol_).fill(false));
    visited[this.pStart_[0]][this.pStart_[1]] = true; // スタート位置
    // 探索候補(位置、方向)
    let candi = [];
    for (let idir8 = 0; idir8 < nDIR8; ++idir8) {
      if (this.isWallPosiDir8(this.pStart_, idir8) == false) {
        candi.push([this.pStart_, idir8]);
      }
    }
    let pGoal = this.pGoalList_[0];
    let _iloop = 0, _nloop = this.nrow_ * this.ncol_ * 4;
    while (candi.length > 0) {
      if (++_iloop > _nloop) {
        // 無限ループ対策
        console.assert(0);
        break;
      }
      let [p,idir8org] = candi.shift(); // 配列の先頭を取得／移動元の座標、方向、連続回数
      // ゴールに到達
      if (this.isGoal(p[0], p[1])) {
        if (costS2E < 0) {
          costS2E = costDist[p[0]][p[1]];
          pGoal = [p[0], p[1]];
        } else if (costS2E > costDist[p[0]][p[1]]) {
          costS2E = costDist[p[0]][p[1]];
          pGoal = [p[0], p[1]];
        }
      }
      // 周囲を探索
      for (let idir8 = 0; idir8 < 8; ++idir8) {
        if (this.isWallPosiDir8(p, idir8)) {
          continue;
        }
        let q = [p[0]+IDIR8[idir8][0], p[1]+IDIR8[idir8][1]];
        let diffidir8 = Math.abs(idir8 - idir8org);
        if (diffidir8 > 4) {
          diffidir8 = 8 - diffidir8;
        }
        let newCost = costDist[p[0]][p[1]] + costMove[idir8] + costTurn[diffidir8];
        if (!visited[q[0]][q[1]]) {
          // 未訪問／新規登録
          visited[q[0]][q[1]]  = true; // 訪問済みに
          costDist[q[0]][q[1]] = newCost;
          candi.push([[q[0],q[1]], idir8]);  // 移動先を候補を追加
        } else if (visited[q[0]][q[1]] && costDist[q[0]][q[1]] > newCost) {
          // コストを更新
          costDist[q[0]][q[1]] = newCost;
          candi.push([[q[0],q[1]], idir8]);  // 移動先を候補を追加
        }
      }
    }
    if (0) {
      // コスト分布の表示
      let text = "\ncostDist=\n";
      let nx = costDist[0].length, ny = costDist.length, nx_ = nx-1;
      for (let iy = 0; iy < ny; ++iy) {
        for (let ix = 0; ix < nx; ++ix) {
          let v = costDist[iy][ix];
          v = ( '000' + v.toFixed(2) ).slice( -5 );
          text += v;
          if (ix < nx_) {
            text += ", ";
          }
        }
        text += "\n";
      }
      console.log(text);
    }
    let path = [];
    if (costS2E > 0) {
      // ゴール位置から逆にたどる
      let p = pGoal;
      let cost = costS2E;
      path.unshift(this.rc2idx(p[0],p[1])); // 配列の先頭に入れる
      for (let i = 0; i < this.pGoalList_.length; ++i) {
        let pg = this.pGoalList_[i];
        let v = costDist[pg[0]][pg[1]];
        if (cost > v) {
          cost = v;
          p = pg;
        }
      }
      let _iloop = 0, _nloop = this.nrow_ * this.ncol_ * 4;
      while (cost > 0) {
        if (++_iloop > _nloop) {
          // 無限ループ対策
          console.assert(0);
          break;
        }
        if ((p[0] == this.pStart_[0]) && (p[1] == this.pStart_[1])) {
          break;
        }
        // 周辺を探索、最小値のコストを持つ方向に進む
        let bfound = false;
        let costMin = cost;
        let qmin = [0, 0];
        let idir8min = -1;
        let nextDir8 = [];
        for (let idir8 = 0; idir8 < nDIR8; ++idir8) {
          if (this.isWallPosiDir8(p, idir8)) {
            continue;
          }
          let q = [p[0]+IDIR8[idir8][0], p[1]+IDIR8[idir8][1]];
          if ((costDist[q[0]][q[1]] >= 0) && (costMin > costDist[q[0]][q[1]])) {
            costMin = costDist[q[0]][q[1]];
            qmin = [q[0], q[1]];
            idir8min = idir8;
          }
        }
        if (cost > costMin) {
          path.unshift(this.rc2idx(qmin[0],qmin[1])); // 配列の先頭に入れる
          p = qmin;
          cost = costMin;
          bfound = true;
        }
        if (bfound == false) {
          // 複数経路で間違った方向に進んだかも？
          console.assert(0);
        }
      }
    }
    this.path7_ = path;
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

  seekSomePath7() {
    // 複数の経路をもとめる
    // seekPath7 を使う版
    this.seekPath = this.seekPath7;
    let pathList = this.seekSomePathBase();
    delete this.seekPath;
    if (pathList.length > 0) {
      this.path7_ = pathList[0];
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

  seekPath8() {
    // 力技で全探査・全パスを取得
    //   - 次の候補に指向性を持たせる (90度以内 idx8 の差が2以下)
    //     それでも複数経路／広間があると組み合わせ爆発がおこる
    //   - 小規模もしくは一本道の場合に有効
    // .
    // 全パス（探索途中のもの）  .. idx で保持
    let path = [this.rc2idx(this.pStart_[0], this.pStart_[1])]; // 最初のパス
    let pathList =[path];
    let overlap = []; // 重複チェックに、一度作成したpathのキー path.join(",")を記録しておく
    overlap.push(path.join(","));
    // ゴールにたどり着いたパス
    let compPathList = [];
    while (pathList.length > 0) {
      let path = pathList.shift();
      let newidx = [];  // 追加可能な隣接するセルのindex
      // 直近の座標
      let pidx = path[path.length-1];
      let p = this.idx2rc(pidx);
      if (path.length >= 2) {
        // 直近の１つ前の座標
        let oidx = path[path.length-2];
        let o = this.idx2rc(oidx);
        // 「直近の座標」と「その前の座標」から進行方向を求め、新規点の方向を制限する
        let idir8base = rc2idir8(o,p);
        // console.log("  o=",o, ", p=",p, ", idir8base=",idir8base);
        for (let idir8 = 0; idir8 < nDIR8; ++idir8) {
          let diffidir8 = Math.abs(idir8 - idir8base);
          if (diffidir8 > 4) {
            diffidir8 = 8 - diffidir8;
          }
          if (diffidir8 > 2) {
            // 指向性チェックで90度を超える場合はスキップ（回り道対策）
            continue;
          }
          if (this.isWallPosiDir8(p, idir8)) {
            continue;
          }
          let q = [p[0]+IDIR8[idir8][0], p[1]+IDIR8[idir8][1]];
          let qidx = this.rc2idx(q[0], q[1]);
          if (this.isGoal(q[0], q[1])) {
            let path2 = JSON.parse(JSON.stringify(path));
            path2.push(qidx);
            compPathList.push(path2);
            let path2key = path2.join(",");
            overlap.push(path2key);
            continue;
          }
          if (path.includes(qidx)) {
            continue;
          }
          newidx.push(qidx);
        }
      } else {
        // 「直近の座標」しか取れない場合は、８方向すべてを新規点の候補とする
        for (let idir8 = 0; idir8 < nDIR8; ++idir8) {
          if (this.isWallPosiDir8(p, idir8)) {
            continue;
          }
          let q = [p[0]+IDIR8[idir8][0], p[1]+IDIR8[idir8][1]];
          let qidx = this.rc2idx(q[0], q[1]);
          if (this.isGoal(q[0], q[1])) {
            let path2 = JSON.parse(JSON.stringify(path));
            path2.push(qidx);
            compPathList.push(path2);
            let path2key = path2.join(",");
            overlap.push(path2key);
            continue;
          }
          if (path.includes(qidx)) {
            continue;
          }
          newidx.push(qidx);
        }
      }
      //上で見つかった候補点を、既存のパス（コピー）の末尾に追加して、次のサーチリストとする
      for (let i = 0; i < newidx.length; ++i) {
        let qidx = newidx[i];
        let path2 = JSON.parse(JSON.stringify(path));
        path2.push(qidx);
        let path2key = path2.join(",");
        if (!overlap.includes(path2key)) {
          pathList.push(path2);
          overlap.push(path2key);
        }
      }
    }
    this.path8_ = [];
    if (compPathList.length > 0) {
      // 重複チェックとして、任意の２つのパスで、短い方のパスの８割と一致したら長い方は重複しているとして削除
      let matchingRateTh = 0.8;
      let delFlag = new Array(compPathList.length).fill(false);
      for (let i = 0; i < compPathList.length-1; ++i) {
        for (let j = i+1; j < compPathList.length; ++j) {
          let path1 = compPathList[i];
          let path2 = compPathList[j];
          let bswap = false;
          if (path1.length > path2.length) {
            [path1, path2] = [path2, path1];
            bswap = true;
          }
          let matchFlag = {};
          for (let k = 0; k < path2.length; ++k) {
            matchFlag[path2[k]] = 1;x_1494
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
      let compPathList2 = [];
      for (let i = 0; i < compPathList.length; ++i) {
        if (!delFlag[i]) {
          compPathList2.push(compPathList[i]);
        }
      }
      this.path8_ = compPathList2[0];
      // for (let i = 0; i < compPathList2.length; ++i) {
      //   console.log("  path,i="+i+"\n",compPathList2[i]);
      // }
    }
  }

  nWallwDead(posi, deadend) {
    // 壁の数を数える .. 3:= 袋小路（行き止まり) 2:= 通路、 1:= 分岐、0:=分岐(三叉路)
    let icount = 0;
    for (let idir = 0; idir < 4; ++idir) {
      if (this.isWallPosiDir(posi, idir)) {
        ++icount;
      } else {
        let irow = posi[0] + IDIR[idir][0], icol = posi[1] + IDIR[idir][1];
        if (deadend[irow][icol] == 1) {
          ++icount;
        }
      }
    }
    return icount;
  }

  evalPathIdx(idxlist) {
    // パスの評価（簡単に「歩数」と「方向転換」）
    let ntrun = 0; // 折れ：idir8単位(45度)を１とする
    let nwalk = 0; // 歩数：縦横と斜めを等しく１とする
    let rclist = idxlist.map(idx => this.idx2rc(idx));
    let nlist = rclist.length, nlist_=nlist-1;
    let idir8old = -1;
    for (let i = 0; i < nlist_; ++i) {
      let p1 = rclist[i];
      let p2 = rclist[i+1];
      let idir8 = rc2idir8(p1,p2);
      if (i) {
        let diffidir8 = Math.abs(idir8 - idir8old);
        if (diffidir8 > 4) {
          diffidir8 = 8 - diffidir8;
        }
        ntrun += diffidir8;
      }
      idir8old = idir8;
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
    for (let i = 0; i < this.pGoalList_.length; ++i) {
      visited[this.pGoalList_[i][0]][this.pGoalList_[i][1]] = true; // ゴール位置
    }
    // 三方向が壁（袋小路）の場所を探す
    let candi = [];
    this.deadend1_ = [];
    for (let irow = 0; irow < this.nrow_; ++irow) {
      for (let icol = 0; icol < this.ncol_; ++icol) {
        if (this.data_[irow][icol] == 1 || visited[irow][icol] == 1) {
          // 訪問済みならスキップ
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
        if (this.isWallPosiDir(p, idir)) {
          // 壁
          continue;
        }
        let q = [p[0]+IDIR[idir][0], p[1]+IDIR[idir][1]];
        if (visited[q[0]][q[1]]) {
          // 訪問済み
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

  dbgPrintMap00() {
    let str = '\n';
    if (this.path2_.length > 0) {
    } else {
      for (let irow = 0; irow < this.nrow_; ++irow) {
        for (let icol = 0; icol < this.ncol_; ++icol) {
          if ((this.pStart_[0] == irow) && (this.pStart_[1] == icol)) {
            str += "S";
          } else if (this.isGoal(irow,icol)) {
            str += "G";
          } else if (this.data_[irow][icol] == 1) {
            str += "#";
          } else {
            str += " ";
          }
        }
        str += "\n";
      }
    }
    console.log(str);
  }

  printPathAndWall(str, path) {
    let irow = 0, icol = 0, idx1, idx2, idx3, idx4;
    {
      // 一番上の壁
      let irow = 0, icol = 0;
      str += (this.data_[irow][icol]) ? "#" : "+";
      for (let icol = 1; icol < this.ncol_; ++icol) {
        str += ((this.data_[irow][icol-1]) && (this.data_[irow][icol])) ? "##" : "--";
        str += (this.data_[irow][icol]) ? "#" : "+";
      }
      str += "\n";
    }
    let str1, str2;
    for (let irow = 1; irow < this.nrow_; ++irow) {
      icol = 0;
      // セルの上半分
      str1 = ((this.data_[irow-1][icol]) && (this.data_[irow][icol])) ? "#" : "[";
      str2 = (this.data_[irow][icol]) ? "#" : "+";
      for (let icol = 1; icol < this.ncol_; ++icol) {
        // セル左上
        {
          idx1 = this.rc2idx(irow-1,icol); idx2 = this.rc2idx(irow,icol-1);
          idx3 = this.rc2idx(irow-1,icol-1); idx4 = this.rc2idx(irow,icol);
          if (path.includes(idx1) && path.includes(idx2) && (Math.abs(path.indexOf(idx1)-path.indexOf(idx2))==1)) {
            str1 += "//";
          } else if (path.includes(idx3) && path.includes(idx4) && (Math.abs(path.indexOf(idx3)-path.indexOf(idx4))==1)) {
            str1 += "\\\\";
          } else {
            str1 += "  ";
          }
          idx1 = this.rc2idx(irow,icol-1); idx2 = this.rc2idx(irow,icol);
          if (path.includes(idx1) && path.includes(idx2)) {
            str2 += "--";
          }else if ((this.data_[irow][icol-1]) && (this.data_[irow][icol])) {
            str2 += "##";
          } else {
            str2 += "  ";
          }
        }
        // セル上中央
        {
          idx1 = this.rc2idx(irow-1,icol); idx2 = this.rc2idx(irow,icol);
          if (path.includes(idx1) && path.includes(idx2)) {
            str1 += "|";
          } else if ((this.data_[irow-1][icol]) && (this.data_[irow][icol])) {
            str1 += "#";
          } else {
            str1 += " ";
          }
          if ((this.pStart_[0] == irow) && (this.pStart_[1] == icol)) {
            str2 += "S";
          } else if (this.isGoal(irow, icol)) {
            str2 += "G";
          } else if (path.includes(idx2)) {
            str2 += "+";
          } else if (this.data_[irow][icol]) {
            str2 += "#";
          } else {
            str2 += ".";
          }
        }
        ++icol;
        // セル右上
        {
          idx1 = this.rc2idx(irow-1,icol-1); idx2 = this.rc2idx(irow,icol);
          idx3 = this.rc2idx(irow-1,icol); idx4 = this.rc2idx(irow,icol-1);
          if (path.includes(idx1) && path.includes(idx2) && (Math.abs(path.indexOf(idx1)-path.indexOf(idx2))==1)) {
            str1 += "\\\\";
          } else if (path.includes(idx3) && path.includes(idx4) && (Math.abs(path.indexOf(idx3)-path.indexOf(idx4))==1)) {
            str1 += "//";
          } else {
            str1 += "  ";
          }
          idx1 = this.rc2idx(irow,icol-1); idx2 = this.rc2idx(irow,icol);
          if (path.includes(idx1) && path.includes(idx2)) {
            str2 += "--";
          } else {
            str2 += "  ";
          }
        }
        // セル上右端
        {
          idx1 = this.rc2idx(irow-1,icol); idx2 = this.rc2idx(irow,icol);
          if (path.includes(idx1) && path.includes(idx2)) {
            str1 += "|"; str2 += "+";
          } else {
            str1 += ((this.data_[irow-1][icol]) && (this.data_[irow][icol])) ? "#" : " ";
            if (path.includes(idx2)) {
              str2 += "+";
            } else {
              str2 += (this.data_[irow][icol]) ? "#" : " ";
            }
          }
        }
      }
      str += (str1 + "\n");
      str += (str2 + "\n");
      ++irow;
      // セルの下半分
      icol = 0;
      str1 = ((this.data_[irow-1][icol]) && (this.data_[irow][icol])) ? "#" : "[";
      str2 = (this.data_[irow][icol]) ? "#" : "+";
      for (let icol = 1; icol < this.ncol_; ++icol) {
        // セル左下
        {
          idx1 = this.rc2idx(irow-1,icol-1); idx2 = this.rc2idx(irow,icol);
          idx3 = this.rc2idx(irow-1,icol); idx4 = this.rc2idx(irow,icol-1);
          if (path.includes(idx1) && path.includes(idx2) && (Math.abs(path.indexOf(idx1)-path.indexOf(idx2))==1)) {
            str1 += "\\\\";
          } else if (path.includes(idx3) && path.includes(idx4) && (Math.abs(path.indexOf(idx3)-path.indexOf(idx4))==1)) {
            str1 += "//";
          } else {
            str1 += "  ";
          }
          idx1 = this.rc2idx(irow,icol-1); idx2 = this.rc2idx(irow,icol);
          if (path.includes(idx1) && path.includes(idx2)) {
            str2 += "--";
          } else if ((this.data_[irow][icol-1]) && (this.data_[irow][icol])) {
            str2 += "##";
          } else {
            str2 += "  ";
          }
        }
        // セル下中央
        {
          idx1 = this.rc2idx(irow-1,icol); idx2 = this.rc2idx(irow,icol);
          if (path.includes(idx1) && path.includes(idx2)) {
            str1 += "|";
            str2 += "+";
          } else {
            str1 += ((this.data_[irow-1][icol]) && (this.data_[irow][icol])) ? "#" : " ";
            if (path.includes(idx2)) {
              str2 += "+";
            } else {
              str2 += (this.data_[irow][icol]) ? "#" : " ";
            }
          }
        }
        ++icol;
        // セル右下
        {
          idx1 = this.rc2idx(irow,icol-1); idx2 = this.rc2idx(irow-1,icol);
          idx3 = this.rc2idx(irow-1,icol-1); idx4 = this.rc2idx(irow,icol);
          if (path.includes(idx1) && path.includes(idx2) && (Math.abs(path.indexOf(idx1)-path.indexOf(idx2))==1)) {
            str1 += "//";
          } else if (path.includes(idx3) && path.includes(idx4) && (Math.abs(path.indexOf(idx3)-path.indexOf(idx4))==1)) {
            str1 += "\\\\";
          } else {
            str1 += "  ";
          }
          idx1 = this.rc2idx(irow,icol-1); idx2 = this.rc2idx(irow,icol);
          if (path.includes(idx1) && path.includes(idx2)) {
            str2 += "--";
          } else if ((this.data_[irow][icol-1]) && (this.data_[irow][icol])) {
            str2 += "##";
          } else {
            str2 += "  ";
          }
        }
        // セル下右端
        {
          idx1 = this.rc2idx(irow-1,icol); idx2 = this.rc2idx(irow,icol);
          if (path.includes(idx1) && path.includes(idx2)) {
            str1 += "|";
          } else if ((this.data_[irow-1][icol]) && (this.data_[irow][icol])) {
            str1 += "#";
          } else {
            str1 += " ";
          }
          if (path.includes(idx2)) {
            str2 += "+";
          } else {
            str2 += (this.data_[irow][icol]) ? "#" : " ";
          }
        }
      }
      str += (str1 + "\n");
      str += (str2 + "\n");
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
    } else if (this.path7_.length > 0) {
      str += "経路(path7)を表示\n";
      let path = this.path7_;
      str = this.printPathAndWall(str, path);
    } else if (this.path99_.length > 0) {
      str += "経路(path99)を表示\n";
      let path = this.path99_;
      str = this.printPathAndWall(str, path);
    } else if (this.deadend1_.length > 0) {
      str += "行き止まり(deadend1)を表示\n";
      let path = this.deadend1_;
      let irow = 0, icol = 0, idx1, idx2;
      {
        // 一番上の壁
        let irow = 0, icol = 0;
        str += (this.data_[irow][icol]) ? "#" : "+";
        for (let icol = 1; icol < this.ncol_; ++icol) {
          // str += "==";
          str += ((this.data_[irow][icol-1]) && (this.data_[irow][icol])) ? "##" : "--";
          str += (this.data_[irow][icol]) ? "#" : "+";
        }
        str += "\n";
      }
      let str1, str2;
      for (let irow = 1; irow < this.nrow_; ++irow) {
        icol = 0;
        // セルの上半分
        str1 = ((this.data_[irow-1][icol]) && (this.data_[irow][icol])) ? "#" : "[";
        str2 = (this.data_[irow][icol]) ? "#" : "+";
        for (let icol = 1; icol < this.ncol_; ++icol) {
          // セル左上
          {
            idx1 = this.rc2idx(irow,icol);
            if (path.includes(idx1)) {
              str1 += "XX";
              str2 += "XX";
            } else {
              str1 += "  ";
              str2 += "  ";
            }
          }
          // セル上中央
          {
            if ((this.data_[irow-1][icol]) && (this.data_[irow][icol])) {
              str1 += "#";
            } else if (path.includes(idx1)) {
              str1 += "X";
            } else {
              str1 += " ";
            }
            if ((this.pStart_[0] == irow) && (this.pStart_[1] == icol)) {
              str2 += "S";
            } else if (this.isGoal(irow, icol)) {
              str2 += "G";
            } else if (this.data_[irow][icol]) {
              str2 += "#";
            } else if (path.includes(idx1)) {
              str2 += "X";
            } else {
              str2 += ".";
            }
          }
          ++icol;
          // セル右上
          {
            idx1 = this.rc2idx(irow,icol-1);
            if (path.includes(idx1)) {
              str1 += "XX";
              str2 += "XX";
            } else {
              str1 += "  ";
              str2 += "  ";
            }
          }
          // セル上右端
          {
            idx1 = this.rc2idx(irow,icol);
            if ((this.data_[irow-1][icol]) && (this.data_[irow][icol])) {
              str1 += "#";
            } else if (path.includes(idx1)) {
              str1 += "X";
            } else {
              str1 += " ";
            }
            if (this.data_[irow][icol]) {
              str2 += "#";
            } else if (path.includes(idx1)) {
              str2 += "X";
            } else {
              str2 += " ";
            }
          }
        }
        str += (str1 + "\n");
        str += (str2 + "\n");
        ++irow;
        // セルの下半分
        icol = 0;
        str1 = ((this.data_[irow-1][icol]) && (this.data_[irow][icol])) ? "#" : "[";
        str2 = (this.data_[irow][icol]) ? "#" : "+";
        for (let icol = 1; icol < this.ncol_; ++icol) {
          // セル左下
          {
            idx1 = this.rc2idx(irow-1,icol);
            if (path.includes(idx1)) {
              str1 += "XX";
            } else {
              str1 += "  ";
            }
            idx1 = this.rc2idx(irow,icol);
            if ((this.data_[irow][icol-1]) && (this.data_[irow][icol])) {
              str2 += "##";
            } else if (path.includes(idx1)) {
              str2 += "XX";
            } else {
              str2 += "  ";
            }
          }
          // セル下中央
          {
            idx1 = this.rc2idx(irow-1,icol);
            if ((this.data_[irow-1][icol]) && (this.data_[irow][icol])) {
              str1 += "#";
            } else if (path.includes(idx1)) {
              str1 += "X";
            } else {
              str1 += " ";
            }
            idx1 = this.rc2idx(irow,icol);
            if (this.data_[irow][icol]) {
              str2 += "#";
            } else if (path.includes(idx1)) {
              str2 += "X";
            } else {
              str2 += " ";
            }
          }
          ++icol;
          // セル右下
          {
            idx1 = this.rc2idx(irow-1,icol-1);
            if (path.includes(idx1)) {
              str1 += "XX";
            } else {
              str1 += "  ";
            }
            idx1 = this.rc2idx(irow,icol-1);
            if ((this.data_[irow][icol-1]) && (this.data_[irow][icol])) {
              str2 += "##";
            } else if (path.includes(idx1)) {
              str2 += "XX";
            } else {
              str2 += "  ";
            }
          }
          // セル下右端
          {
            idx1 = this.rc2idx(irow-1,icol);
            if ((this.data_[irow-1][icol]) && (this.data_[irow][icol])) {
              str1 += "#";
            } else if (path.includes(idx1)) {
              str1 += "X";
            } else {
              str1 += " ";
            }
            if (this.data_[irow][icol]) {
              str2 += "#";
            } else if (path.includes(idx1)) {
              str2 += "X";
            } else {
              str2 += " ";
            }
          }
        }
        str += (str1 + "\n");
        str += (str2 + "\n");
      }

    } else {
      str += "格子＋壁(debug用)の表示\n";
      str = this.printPathAndWall(str, []);
    }
    console.log(str);

  }
};

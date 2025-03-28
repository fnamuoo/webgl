// -*- mode:javascript; coding:utf-8 -*-

// - 下記テストは超手抜きで正常動作していることだけを確認する
// - 本来なら既知のデータを使って丁寧に確認すべきだが、手間がかかるので割愛
//   - 時間のある時に手を付けることにする

import { Maze1 } from "../src/Maze1";

test("const.case1", () => {
  let maze = new Maze1();
  expect(maze instanceof Maze1).toBe(true);
});

test("const.case2", () => {
  let maze = new Maze1(10, 10);
  expect(maze instanceof Maze1).toBe(true);
});

test("const.case3", () => {
  let maze = new Maze1(10, 10);
  let smap:string = maze.strMap();
});

test("const.case4", () => {
  try {
    let maze = new Maze1(10, 10);
  } catch (err) {
    expect(err).toBe(false);
  }
});



test("create_def.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create();
  let smap:string = maze.strMap();
});

test("create_10.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  let smap:string = maze.strMap();
});

test("create_10.case2", () => {
  let maze = new Maze1(8, 10);
  maze.create(10);
  let smap:string = maze.strMap();
});


test("create_11.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(11);
  let smap:string = maze.strMap();
});

test("create_11.case2", () => {
  let maze = new Maze1(8, 10);
  maze.create(11);
  let smap:string = maze.strMap();
});

test("create_20.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(20);
  let smap:string = maze.strMap();
});

test("create_20.case2", () => {
  let maze = new Maze1(8, 10);
  maze.create(20);
  let smap:string = maze.strMap();
});

test("create_21.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(21);
  let smap:string = maze.strMap();
});

test("create_21.case2", () => {
  let maze = new Maze1(8, 10);
  maze.create(21);
  let smap:string = maze.strMap();
});

test("create_22.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(22);
  let smap:string = maze.strMap();
});

test("create_22.case2", () => {
  let maze = new Maze1(8, 10);
  maze.create(22);
  let smap:string = maze.strMap();
});

test("create_22.case3", () => {
  for (let i = 0; i < 3; ++i) {
    let maze = new Maze1(64, 64);
    maze.create(22);
    // let smap:string = maze.strMap();
    // console.log(smap);
  }
});

test("create_23.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(23);
  let smap:string = maze.strMap();
});

test("create_23.case2", () => {
  let maze = new Maze1(8, 10);
  maze.create(23);
  let smap:string = maze.strMap();
});

test("create_23.case3", () => {
  for (let i = 0; i < 3; ++i) {
    let maze = new Maze1(64, 64);
    maze.create(23);
  }
});

test("create_24.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(24);
  let smap:string = maze.strMap();
});

test("create_24.case2", () => {
  let maze = new Maze1(8, 10);
  maze.create(24);
  let smap:string = maze.strMap();
});

test("create_24.case3", () => {
  for (let i = 0; i < 3; ++i) {
    let maze = new Maze1(64, 64);
    maze.create(24);
  }
});

test("create_30.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(30);
  let smap:string = maze.strMap();
});

test("create_30.case2", () => {
  let maze = new Maze1(8, 10);
  maze.create(30);
  let smap:string = maze.strMap();
});

test("create_31.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(31);
  let smap:string = maze.strMap();
});

test("create_31.case2", () => {
  let maze = new Maze1(8, 10);
  maze.create(31);
  let smap:string = maze.strMap();
});

test("create_99.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(99);
  let smap:string = maze.strMap();
});


test("resetStartGoal.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  maze.resetStartGoal();
  let smap:string = maze.strMap();
});



test("seekPath2.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  maze.seekPath2();
  let smap:string = maze.strMap();
});

test("seekPath3.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  maze.seekPath3();
  let smap:string = maze.strMap();
});

test("seekPath6.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  maze.seekPath6();
  let smap:string = maze.strMap();
});



test("seekSomePath2.case1", () => {
  let maze = new Maze1(32, 32);
  maze.create(11);
  let pathList = maze.seekSomePath2();
});

test("seekSomePath2.case2", () => {
  for (let i = 0; i < 1; ++i) {
    let maze = new Maze1(64, 64);
    maze.create(11);
    let pathList = maze.seekSomePath2();
  }
});


test("seekSomePath6.case1", () => {
  let maze = new Maze1(32, 32);
  maze.create(11);
  let pathList = maze.seekSomePath6();
});

test("seekSomePath6.case2", () => {
  for (let i = 0; i < 1; ++i) {
    let maze = new Maze1(64, 64);
    maze.create(11);
    let pathList = maze.seekSomePath6();
  }
});



test("evalPathIdx.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  let pathList = maze.seekSomePath2();
  for (let i = 0; i < pathList.length; ++i) {
    let path = pathList[i];
    let [nwalk, nturn] = maze.evalPathIdx(path);
//    console.log("walk=", nwalk, ", turn=", nturn, ", path=\n",path);
  }
});



test("seekDeadEnd.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  maze.seekDeadEnd();
  let smap:string = maze.strMap();
});


test("strMap.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  let smap:string;
    smap = maze.strMap();
    maze.clearPath();
    maze.seekPath2();
    smap = maze.strMap();
    maze.clearPath();
    maze.seekPath3();
    smap = maze.strMap();
    maze.clearPath();
    maze.seekPath6();
    smap = maze.strMap();
    maze.clearPath();
    maze.seekDeadEnd();
    smap = maze.strMap();
});




test("isWall_s.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  for (let irow = 0; irow < maze.nrow_; ++irow) {
    for (let icol = 0; icol < maze.ncol_; ++icol) {
      let bwall = maze.isWall(irow, icol);
      let bwalls = maze.isWall_s(irow, icol);
      expect(bwalls).toBe(bwall);
    }
  }
  {
    let bwalls = maze.isWall_s(-1, -1);
    expect(bwalls).toBe(true);
  }
});


test("isWallPosiDir.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  for (let irow = 0; irow < maze.nrow_; ++irow) {
    for (let icol = 0; icol < maze.ncol_; ++icol) {
      for (let idir = 0; idir < 4; ++idir) {
        let bwall = maze.isWallPosiDir([irow, icol], idir);
        // expect(bwalls).toBe(bwall);
      }
    }
  }
});

test("nWall.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  for (let irow = 0; irow < maze.nrow_; ++irow) {
    for (let icol = 0; icol < maze.ncol_; ++icol) {
      let nwall = maze.nWall([irow, icol]);
      // expect(bwalls).toBe(bwall);
    }
  }
});


test("enableDig_s.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  for (let irow = 0; irow < maze.nrow_; ++irow) {
    for (let icol = 0; icol < maze.ncol_; ++icol) {
      let ena = maze.enableDig_s(irow, icol);
      // expect(bwalls).toBe(bwall);
    }
  }
  {
    let ena = maze.enableDig_s(-1, -1);
  }
});


test("isStreet_s.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  for (let irow = 0; irow < maze.nrow_; ++irow) {
    for (let icol = 0; icol < maze.ncol_; ++icol) {
      let bst = maze.isStreet(irow, icol);
      let bsts = maze.isStreet_s(irow, icol);
      expect(bsts).toBe(bst);
    }
  }
  {
    let bst = maze.isStreet_s(-1, -1);
    expect(bst).toBe(false);
  }
});



test("setStartGoal.case1", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  maze.setStartGoal();
  let smap:string = maze.strMap();
});

test("setStartGoal.case2", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  maze.setStartGoal([-1,-1], [-1,-1]);
  let smap:string = maze.strMap();
});

test("setStartGoal.case3", () => {
  let maze = new Maze1(7, 9);
  maze.create(10);
  maze.setStartGoal([1,-1], [1,-1]);
  let smap:string = maze.strMap();
});

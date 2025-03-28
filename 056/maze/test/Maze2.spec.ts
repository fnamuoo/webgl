// -*- mode:javascript; coding:utf-8 -*-

import { Maze2 } from "../src/Maze2";

test("const.case1", () => {
  let maze = new Maze2();
  expect(maze instanceof Maze2).toBe(true);
});

test("const.case2", () => {
  let maze = new Maze2(10, 10);
  expect(maze instanceof Maze2).toBe(true);
});

test("const.case3", () => {
  let maze = new Maze2(10, 10);
  let smap:string = maze.strMap();
});

test("const.case4", () => {
  try {
    let maze = new Maze2(10, 10);
  } catch (err) {
    expect(err).toBe(false);
  }
});



test("create_def.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create();
  let smap:string = maze.strMap();
});

test("create_10.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(10);
  let smap:string = maze.strMap();
});


test("create_11.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(11);
  let smap:string = maze.strMap();
});

test("create_20.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(20);
  let smap:string = maze.strMap();
});

test("create_21.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(21);
  let smap:string = maze.strMap();
});

test("create_22.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(22);
  let smap:string = maze.strMap();
});

test("create_22.case3", () => {
  for (let i = 0; i < 3; ++i) {
    let maze = new Maze2(64, 64);
    maze.create(22);
  }
});

test("create_23.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(23);
  let smap:string = maze.strMap();
});

test("create_23.case3", () => {
  for (let i = 0; i < 3; ++i) {
    let maze = new Maze2(64, 64);
    maze.create(23);
    // let smap:string = maze.strMap();
  }
});

test("create_24.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(24);
  let smap:string = maze.strMap();
});

test("create_24.case3", () => {
  for (let i = 0; i < 3; ++i) {
    let maze = new Maze2(64, 64);
    maze.create(24);
    // let smap:string = maze.strMap();
  }
});

test("create_30.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(30);
  let smap:string = maze.strMap();
});

test("create_31.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(31);
  let smap:string = maze.strMap();
});

test("create_99.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(99);
  let smap:string = maze.strMap();
});



test("resetStartGoal.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(10);
  maze.resetStartGoal();
  let smap:string = maze.strMap();
});



test("seekPath2.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(10);
  maze.seekPath2();
  let smap:string = maze.strMap();
});

test("seekPath3.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(10);
  maze.seekPath3();
  let smap:string = maze.strMap();
});

test("seekPath6.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(10);
  maze.seekPath6();
  let smap:string = maze.strMap();
});

test("seekPath7.case1", () => {
  let maze = new Maze2(16, 16);
  maze.create(22);
  maze.seekPath7();
  let smap:string = maze.strMap();
});

test("seekPath7_0.case1", () => {
  let maze = new Maze2(16, 16);
  maze.create(22);
  maze.seekPath7_0();
  let smap:string = maze.strMap();
});

test("seekPath7_1.case1", () => {
  let maze = new Maze2(16, 16);
  maze.create(22);
  maze.seekPath7_1();
  let smap:string = maze.strMap();
});

test("seekPath7_2.case1", () => {
  let maze = new Maze2(16, 16);
  maze.create(22);
  maze.seekPath7_2();
  let smap:string = maze.strMap();
});


test("seekSomePath2.case1", () => {
  let maze = new Maze2(16, 16);
  maze.create(11);
  let pathList = maze.seekSomePath2();
});

test("seekSomePath2.case2", () => {
  for (let i = 0; i < 2; ++i) {
    let maze = new Maze2(16, 16);
    maze.create(11);
    let pathList = maze.seekSomePath2();
  }
});


test("seekSomePath7.case1", () => {
  let maze = new Maze2(16, 16);
  maze.create(11);
  let pathList = maze.seekSomePath7();
});

test("seekSomePath7.case2", () => {
  for (let i = 0; i < 1; ++i) {
    let maze = new Maze2(16, 16);
    maze.create(11);
    let pathList = maze.seekSomePath7();
  }
});



test("evalPathIdx.case1", () => {
  let maze = new Maze2(16, 16);
  maze.create(10);
  let pathList = maze.seekSomePath2();
  for (let i = 0; i < pathList.length; ++i) {
    let path = pathList[i];
    let [nwalk, nturn] = maze.evalPathIdx(path);
//    console.log("walk=", nwalk, ", turn=", nturn, ", path=\n",path);
  }
});

test("seekFarPoint.case1", () => {
  for (let i = 0; i < 3; ++i) {
    let maze = new Maze2(7, 7);
    maze.create(11);
    maze.seekFarPoint([0,0]);
  }
});

test("seekFarPoint.case2", () => {
  for (let i = 0; i < 3; ++i) {
    let maze = new Maze2(7, 7);
    maze.create(11);
    maze.seekFarPoint([maze.nrow_1, maze.ncol_1]);
  }
});


test("seekDeadEnd.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(10);
  maze.seekDeadEnd();
  let smap:string = maze.strMap();
});


test("strMap.case1", () => {
  let maze = new Maze2(7, 7);
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
    maze.seekPath7();
    smap = maze.strMap();
    maze.clearPath();
    maze.seekDeadEnd();
    smap = maze.strMap();
});



test("nWall.case1", () => {
  let maze = new Maze2(7, 7);
  maze.create(11);
  for (let irow = 0; irow < maze.nrow_; ++irow) {
    for (let icol = 0; icol < maze.ncol_; ++icol) {
      let nwall = maze.nWall([irow, icol]);
    }
  }
});




test("setStartGoal.case1", () => {
  let maze = new Maze2(7, 9);
  maze.create(10);
  maze.setStartGoal();
  let smap:string = maze.strMap();
});

test("setStartGoal.case2", () => {
  let maze = new Maze2(7, 9);
  maze.create(10);
  maze.setStartGoal([-1,-1], [-1,-1]);
  let smap:string = maze.strMap();
});

test("setStartGoal.case3", () => {
  let maze = new Maze2(7, 9);
  maze.create(10);
  maze.setStartGoal([1,-1], [1,-1]);
  let smap:string = maze.strMap();
});

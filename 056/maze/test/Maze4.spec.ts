// -*- mode:javascript; coding:utf-8 -*-

import { Maze4 } from "../src/Maze4";

test("const.case1", () => {
  let maze = new Maze4();
  expect(maze instanceof Maze4).toBe(true);
});

test("const.case2", () => {
  let maze = new Maze4(7, 7, 7);
  expect(maze instanceof Maze4).toBe(true);
});

test("const.case3", () => {
  let maze = new Maze4(8, 8, 8);
  let smap:string = maze.strMap();
//  console.log(smap);
});

test("const.case4", () => {
  try {
    let maze = new Maze4(8, 8, 8);
  } catch (err) {
    expect(err).toBe(false);
  }
});



test("create_def.case1", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create();
  let smap:string = maze.strMap();
});

test("create_20.case1", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(20);
  let smap:string = maze.strMap();
});

test("create_20.case2", () => {
  let maze = new Maze4(8, 8, 8);
  maze.create(20);
  let smap:string = maze.strMap();
});

test("create_21.case1", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(21);
  let smap:string = maze.strMap();
});

test("create_21.case2", () => {
  let maze = new Maze4(8, 8, 8);
  maze.create(21);
  let smap:string = maze.strMap();
});

test("create_21.case3", () => {
  for (let i = 0; i < 3; ++i) {
    let maze = new Maze4(13, 11, 13);
    maze.create(21);
    let smap:string = maze.strMap();
  }
});

test("create_21.case4", () => {
  let maze = new Maze4(9, 9, 9);
  maze.create_dig_21(0.3);
  let smap:string = maze.strMap();
});


test("create_30.case1", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(30);
  let smap:string = maze.strMap();
});

test("create_30.case2", () => {
  let maze = new Maze4(8, 8, 8);
  maze.create(30);
  let smap:string = maze.strMap();
});

test("create_40.case1", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(40);
  let smap:string = maze.strMap();
});

test("create_40.case2", () => {
  let maze = new Maze4(8, 8, 8);
  maze.create(40);
  let smap:string = maze.strMap();
});

test("create_99.case1", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(99);
  let smap:string = maze.strMap();
});



test("resetStartGoal.case1", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(40);
  maze.resetStartGoal();
  let smap:string = maze.strMap();
});



test("seekPath2.case1", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(40);
  maze.seekPath2();
  let smap:string = maze.strMap();
});



test("seekFarPoint.case1", () => {
  for (let i = 0; i < 3; ++i) {
    let maze = new Maze4(7, 7, 7);
    maze.create(40);
    maze.seekFarPoint([1,1,1]);
  }
});

test("seekFarPoint.case2", () => {
  for (let i = 0; i < 3; ++i) {
    let maze = new Maze4(7, 7, 7);
    maze.create(40);
    maze.seekFarPoint([maze.nx_1, maze.ny_1, maze.nz_1]);
  }
});



test("strMap.case1", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(20);
  let smap:string;
    maze.clearPath();
    maze.seekPath2();
    smap = maze.strMap();
});

test("strMap.case2", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(21);
  let smap:string;
    maze.clearPath();
    maze.seekPath2();
    smap = maze.strMap();
});

test("strMap.case3", () => {
  for (let i = 0; i < 4; ++i) {
    let maze = new Maze4(11, 7, 11);
    maze.create(30);
    let smap:string;
    maze.clearPath();
    maze.seekPath2();
    smap = maze.strMap();
  }
});

test("strMap.case4", () => {
  for (let i = 0; i < 4; ++i) {
    let maze = new Maze4(13, 7, 13);
    maze.create(40);
    let smap:string;
    maze.clearPath();
    maze.seekPath2();
    smap = maze.strMap();
  }
});




test("isWall_s.case1", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(11);
  for (let ix = 0; ix < maze.nx_; ++ix) {
    for (let iy = 0; iy < maze.ny_; ++iy) {
      for (let iz = 0; iz < maze.nz_; ++iz) {
        let bwall = maze.isWall(ix, iy, iz);
        let bwalls = maze.isWall_s(ix, iy, iz);
        expect(bwalls).toBe(bwall);
      }
    }
  }
  {
    let bwalls = maze.isWall_s(-1, -1, -1);
    expect(bwalls).toBe(true);
  }
});


test("nWall.case1", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(11);
  for (let ix = 0; ix < maze.nx_; ++ix) {
    for (let iy = 0; iy < maze.ny_; ++iy) {
      for (let iz = 0; iz < maze.nz_; ++iz) {
        let nwall = maze.nWall([ix, iy, iz]);
      }
    }
  }
});


test("enableDig_s.case1", () => {
  let maze = new Maze4(5, 5, 5);
  maze.create(10);
  for (let ix = 0; ix < maze.nx_; ++ix) {
    for (let iy = 0; iy < maze.ny_; ++iy) {
      for (let iz = 0; iz < maze.nz_; ++iz) {
        let ena = maze.enableDig_s(ix, iy, iz);
      }
    }
  }
  {
    let ena;
    ena = maze.enableDig_s(-1, 0, 0);
    expect(ena).toBe(false);
    ena = maze.enableDig_s(0, -1, 0);
    expect(ena).toBe(false);
    ena = maze.enableDig_s(0, 0, -1);
    expect(ena).toBe(false);
    ena = maze.enableDig_s(maze.nx_, 0, 0);
    expect(ena).toBe(false);
    ena = maze.enableDig_s(0, maze.ny_, 0);
    expect(ena).toBe(false);
    ena = maze.enableDig_s(0, 0, maze.nz_);
    expect(ena).toBe(false);
  }
});


test("isStreet_s.case1", () => {
  let maze = new Maze4(7, 9);
  maze.create(10);
  for (let ix = 0; ix < maze.nx_; ++ix) {
    for (let iy = 0; iy < maze.ny_; ++iy) {
      for (let iz = 0; iz < maze.nz_; ++iz) {
        let bst = maze.isStreet(ix, iy, iz);
        let bsts = maze.isStreet_s(ix, iy, iz);
        expect(bsts).toBe(bst);
      }
    }
  }
  {
    let bst = maze.isStreet_s(-1, -1, -1);
    expect(bst).toBe(false);
  }
});



test("setStartGoal.case1", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(10);
  maze.setStartGoal();
  let smap:string = maze.strMap();
});

test("setStartGoal.case2", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(10);
  maze.setStartGoal([-1,-1,-1], [-1,-1,-1]);
  let smap:string = maze.strMap();
});

test("setStartGoal.case3", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(10);
  maze.setStartGoal([1,-1,-1], [1,-1,-1]);
  let smap:string = maze.strMap();
});

test("setStartGoal.case4", () => {
  let maze = new Maze4(7, 7, 7);
  maze.create(10);
  maze.setStartGoal([1,1,-1], [1,1,-1]);
  let smap:string = maze.strMap();
});

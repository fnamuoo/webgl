// -*- mode:javascript; coding:utf-8 -*-

import { Maze1 } from "../src/Maze1";
import { getMapData } from "../src/Maze1data";

test("getMapData_sdata01", () => {
  let maze = new Maze1();
  let smap1 = getMapData("sdata01")
  let smap1r = smap1.join("\n");
  maze.create_from(smap1);
  let smap2 = maze.strMap();
  smap2 = smap2.replace("S", " ");
  smap2 = smap2.replace("G", " ");
  smap2 = smap2.trim();
  expect(smap2).toBe(smap1r);
  maze.clearPath();
  maze.seekPath2();
  maze.clearPath();
  maze.seekPath3();
  maze.clearPath();
  maze.seekPath6();
  maze.clearPath();
  maze.seekDeadEnd();
});


test("getMapData_sdata0x", () => {
  let mnamelist = ["sdata02", "sdata03", "sdata04", "sdata05",
                   "sdata06", "sdata07", "sdata08", "sdata09"];
  for (let mname of mnamelist) {
    let maze = new Maze1();
    let smap1 = getMapData(mname)
    maze.create_from(smap1);
    maze.clearPath();
    maze.seekPath2();
    maze.clearPath();
    maze.seekPath3();
    maze.clearPath();
    maze.seekPath6();
    maze.clearPath();
    maze.seekDeadEnd();
  }
});


test("getMapData_sdata1x", () => {
  let mnamelist = ["sdata10", "sdata11", "sdata12", "sdata13", "sdata14",
                   "sdata21", "sdata22", "sdata23",
                   "sdata31", "sdata32", "sdata33", "sdata34", "sdata36", "sdata37", "sdata38",
                   "sdata40", "sdata41",
                   "sdata51", "sdata52", "sdata53", "sdata54",
                   "sdata61", "sdata62", "sdata63", "sdata64", "sdata65",
                  ];
  for (let mname of mnamelist) {
    let maze = new Maze1();
    let smap1 = getMapData(mname)
    maze.create_from(smap1);
    maze.clearPath();
    maze.seekPath2();
    maze.clearPath();
    maze.seekPath3();
    maze.clearPath();
    maze.seekPath6();
    maze.clearPath();
    maze.seekDeadEnd();
  }
});




test("getMapData_sdata71", () => {
  let maze = new Maze1();
  let smap1 = getMapData("sdata71")
  maze.create_from(smap1);
  maze.resetStartGoal();
});


test("getMapData_sdata72", () => {
  let mnamelist = ["sdata72", "sdata73", "sdata74",
                  ];
  for (let mname of mnamelist) {
    let maze = new Maze1();
    let smap1 = getMapData(mname)
    maze.create_from(smap1);
    maze.clearPath();
    maze.seekDeadEnd();
  }
});

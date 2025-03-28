// -*- mode:javascript; coding:utf-8 -*-

import { Maze4 } from "../src/Maze4";
import { getMapData } from "../src/Maze4data";


test("getMapData_sdata01", () => {
  let maze = new Maze4();
  let smap = getMapData("sdata00")
  maze.create_from(smap);
  maze.strMap();
  maze.seekPath2();
  maze.strMap();
});


test("getMapData_sdata0x", () => {
  let mnamelist = ["sdata01", "sdata02"];
  for (let mname of mnamelist) {
    let maze = new Maze4();
    let smap = getMapData(mname)
    maze.create_from(smap);
    maze.seekPath2();
    maze.strMap();
  }
});

test("getMapData_sdata1x", () => {
  let mnamelist = ["sdata10", "sdata11", "sdata12", "sdata13", "sdata14", "sdata15"];
  for (let mname of mnamelist) {
    let maze = new Maze4();
    let smap = getMapData(mname)
    maze.create_from(smap);
    maze.seekPath2();
    maze.strMap();
  }
});

test("getMapData_sdata2x", () => {
  let mnamelist = ["sdata20", "sdata21", "sdata22", "sdata23", "sdata24",
                   "sdata25", "sdata26", "sdata27"];
  for (let mname of mnamelist) {
    let maze = new Maze4();
    let smap = getMapData(mname)
    maze.create_from(smap);
    maze.seekPath2();
    maze.strMap();
  }
});

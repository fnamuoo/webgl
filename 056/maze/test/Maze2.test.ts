// -*- mode:javascript; coding:utf-8 -*-

import { Maze2 } from "../src/Maze2";
import { getMapData } from "../src/Maze2data";


test("getMapData_sdata01", () => {
  let maze = new Maze2();
  let smap1 = getMapData("sdata01")
  let smap1r = smap1.join("\n");
  maze.create_from(smap1);
  let smap2 = maze.strMap();
  smap2 = smap2.replace("SS", "  ");
  smap2 = smap2.replace("GG", "  ");
  smap2 = smap2.trim();
  expect(smap2).toBe(smap1r);
  maze.clearPath();
  maze.seekPath2();
  maze.clearPath();
  maze.seekPath3();
  maze.clearPath();
  maze.seekPath6();
  maze.clearPath();
  maze.seekPath7();
  maze.clearPath();
  maze.seekDeadEnd();
});


test("getMapData_sdata0x", () => {
  let mnamelist = ["sdata02", "sdata03", "sdata04", "sdata05",
                   "sdata06", "sdata07", "sdata08", "sdata09"];
  for (let mname of mnamelist) {
    let maze = new Maze2();
    let smap1 = getMapData(mname)
    maze.create_from(smap1);
    maze.clearPath();
    maze.seekPath2();
    maze.clearPath();
    maze.seekPath3();
    maze.clearPath();
    maze.seekPath6();
    maze.clearPath();
    maze.seekPath7();
    maze.clearPath();
    maze.seekDeadEnd();
  }
});


test("getMapData_sdata1x", () => {
  let mnamelist = ["sdata10", "sdata11", "sdata12", "sdata13", "sdata14",
                   "sdata21", "sdata22", "sdata23",
                   "sdata31", "sdata32", "sdata33", "sdata34", "sdata36", "sdata37",
                   "sdata40", "sdata41",
                   "sdata51", "sdata52", "sdata53", "sdata54",
                   "sdata65",
                  ];
  for (let mname of mnamelist) {
    // console.log(mname);
    let maze = new Maze2();
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



test("getMapData_sdata72", () => {
  let mnamelist = ["sdata72", "sdata73",
                  ];
  for (let mname of mnamelist) {
    let maze = new Maze2();
    let smap1 = getMapData(mname)
    maze.create_from(smap1);
    maze.clearPath();
    maze.seekDeadEnd();
  }
});

test("getMapData_sdata74", () => {
  let mnamelist = ["sdata74", "sdata75", "sdata76", "sdata77", "sdata78", "sdata79",
                  ];
  for (let mname of mnamelist) {
    let maze = new Maze2();
    let smap1 = getMapData(mname)
    maze.create_from(smap1);
    maze.seekPath7();
  }
});

test("getMapData_mm", () => {
  let mnamelist = ["sdatamm2015final",
                   "sdatamm2016final",
                   "sdatamm2017final",
                   "sdatamm2018final", "sdatamm2018classic",
                   "sdatamm2019final",
                   "sdatamm2023final", "sdatamm2023semifinal",
                   ];
  for (let mname of mnamelist) {
    let maze = new Maze2();
    let smap1 = getMapData(mname)
    maze.create_from(smap1);
    maze.clearPath();
    maze.seekPath2();
    maze.clearPath();
    maze.seekPath7();
  }
});

// -*- mode:javascript; coding:utf-8 -*-

import { getMapData } from "../src/Maze2data";
import { Maze2 } from "../src/Maze2";
import { Maze3 } from "../src/Maze3";

test("mm.all", () => {
  const keylist = [
      'sdatamm2015final',
      'sdatamm2016final',
      'sdatamm2017final',
      'sdatamm2018final',
      'sdatamm2018classic',
      'sdatamm2019final',
      'sdatamm2023final',
      'sdatamm2023semifinal',
      'sdatamm2024final',
      'sdatamm2024semifinal',
  ]

  for (let key of keylist) {
    let smap1 = getMapData(key)
    let maze2 = new Maze2();
    maze2.create_from(smap1);
    let maze = new Maze3();
    maze.create_from_maze2(maze2);
    maze.seekPath2();
    let smap:string = maze.strMap();
//    console.log(smap);
    maze.clearPath();
    maze.seekPath7();
    smap = maze.strMap();
//    console.log(smap);
  }
});

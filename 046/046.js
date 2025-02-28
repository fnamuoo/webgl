// mode:javascript

// 迷路

import * as Maze1 from "Maze1";
import * as Maze1data from "Maze1data";
import * as Maze2 from "Maze2";
import * as Maze2data from "Maze2data";
import * as Maze3 from "Maze3";

// ブラウザのコンソール(Ctrl-Shift-I) で迷路をテキスト表示
//
window.onload = () => {

  // !!!!
  if (1) {
      let nrow = 11, ncol = 15;
      let stMap = 'sdata65';  // path2 != path3 != path6
      if (1) {
          let mzdata = new Maze1.MazeData01(nrow, ncol);
          mzdata.create(10); // 棒倒し法
          mzdata.dbgPrintMap();

// ###############
// #S        #   #
// # ### # # # # #
// # #   # #   # #
// # ### # # ### #
// # #   # #   # #
// ######### ### #
// #           # #
// # ### ### #####
// #   # #      G#
// ###############
      }
      if (1) {
          let mzdata = new Maze1.MazeData01(nrow, ncol);
          mzdata.create(11); // 棒倒し法 複数経路
          mzdata.dbgPrintMap();

// ###############
// #S# #         #
// # # # ### # ###
// #       # #   #
// # # ### ##### #
// # #   #   #   #
// # ### # ##### #
// #     #       #
// # ### ##### # #
// # #     #   #G#
// ###############
      }
      if (1) {
          let mzdata = new Maze1.MazeData01(nrow, ncol);
          mzdata.create(20); // 穴掘り法
          mzdata.dbgPrintMap();

// ###############
// #S# #         #
// # # ####### # #
// #   #       # #
// # ### ####### #
// #     #     # #
// ######### ### #
// #   #     #   #
// # ### # ### ###
// #     #      G#
// ###############
      }
      if (1) {
          let mzdata = new Maze1.MazeData01(nrow, ncol);
          mzdata.create(21); // 穴掘り法＋壁に穴開け .. 複数経路
          mzdata.dbgPrintMap();

// ###############
// #S      #   # #
// # ####### # # #
// #           # #
// # ######### # #
// #         #   #
// ######### # # #
// #       # # # #
// # # # ### ### #
// #            G#
// ###############
      }
      if (1) {
          let mzdata = new Maze1.MazeData01(nrow, ncol);
          mzdata.create(22); // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路 / 中庸
          mzdata.dbgPrintMap();

// ###############
// #S            #
// # # ####### # #
// # # #         #
// ### ### # # # #
// #   #   #   # #
// # # # # ##### #
// # #           #
// # # ### ### # #
// #   #     #  G#
// ###############
      }
      if (1) {
          let mzdata = new Maze1.MazeData01(nrow, ncol);
          mzdata.create(23); // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路 / ななめを多め
          mzdata.dbgPrintMap();

// ###############
// #S        #   #
// # ### # # # # #
// # #   # #     #
// # ### # # ### #
// #   # #   #   #
// # # ### ### ###
// # #   # # #   #
// # ### ### ### #
// #   #        G#
// ###############
      }
      if (1) {
          let mzdata = new Maze1.MazeData01(nrow, ncol);
          mzdata.create(24); // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路 / ストレート多め
          mzdata.dbgPrintMap();

// ###############
// #S      #     #
// # # ### # ### #
// # #     #   # #
// # # # # ### # #
// #   # #       #
// # ### # #######
// # #           #
// # # ### ##### #
// #            G#
// ###############
      }
      if (1) {
          let mzdata = new Maze1.MazeData01(nrow, ncol);
          mzdata.create(30); // 壁のばし法
          mzdata.dbgPrintMap();

// ###############
// #S      #     #
// # # ### ##### #
// # # #       # #
// ### ### ##### #
// #     # #     #
// # ### # ##### #
// # #   #     # #
// # ### ####### #
// #   #        G#
// ###############
      }
      if (1) {
          let mzdata = new Maze1.MazeData01(nrow, ncol);
          mzdata.create(31); // 壁のばし法＋中央からも .. 複数経路のある迷路
          mzdata.dbgPrintMap();

// ###############
// #S            #
// # ########### #
// # #         # #
// # # ####### # #
// # # #     # # #
// # # ##### # # #
// # #     # # # #
// # ####### ### #
// #            G#
// ###############
      }
      if (1) {
          let mzdata = new Maze1.MazeData01(nrow, ncol);
          mzdata.create(41); // マップ生成  パーリンノイズの2値化
          mzdata.dbgPrintMap();

// ###############
// #S##########  #
// ############# #
// # #############
// # #############
// #  ############
// #   ###########
// #   ###########
// #    ##########
// #    ########G#
// ###############
      }
      if (1) {
          let mzdata = new Maze1.MazeData01(nrow, ncol);
          mzdata.create(43); // マップ生成  パーリンノイズの2値化＋穴掘り .. 広間のある迷路
          mzdata.dbgPrintMap();

// ###############
// #S            #
// ##   #        #
// # ## ### ######
// #             #
// #  ### # ###  #
// #      #   #  #
// #   ## #####  #
// #            ##
// #     #######G#
// ###############
      }
      if (1) {
          let mzdata = new Maze1.MazeData01();
          mzdata.create_from(Maze1data.get_map_data(stMap));
          mzdata.dbgPrintMap();

// #######################################
// #S                                    #
// # ### ### ### ### ### ### ### ### ### #
// # ### ### ### ### ### ### ### ### ### #
// #                                     #
// # ### ### ### ### ### ### ### ### ### #
// # ### ### ### ### ### ### ### ### ### #
// #                                     #
// # ### ### ### ### ### ### ### ### ### #
// # ### ### ### ### ### ### ### ### ### #
// #                                     #
// # ### ### ### ### ### ### ### ### ### #
// # ### ### ### ### ### ### ### ### ### #
// #                                    G#
// #######################################
      }
      if (1) {
          let mzdata = new Maze1.MazeData01();
          mzdata.create_from(Maze1data.get_map_data(stMap));
          mzdata.seekPath2();  // 最短経路(幅優先)
          mzdata.dbgPrintMap();

// 最短経路(path2)を表示
// #######################################
// #S                                    #
// #.### ### ### ### ### ### ### ### ### #
// #.### ### ### ### ### ### ### ### ### #
// #.                                    #
// #.### ### ### ### ### ### ### ### ### #
// #.### ### ### ### ### ### ### ### ### #
// #.                                    #
// #.### ### ### ### ### ### ### ### ### #
// #.### ### ### ### ### ### ### ### ### #
// #.                                    #
// #.### ### ### ### ### ### ### ### ### #
// #.### ### ### ### ### ### ### ### ### #
// #....................................G#
// #######################################
      }
      if (1) {
          let mzdata = new Maze1.MazeData01();
          mzdata.create_from(Maze1data.get_map_data(stMap));
          mzdata.seekPath3();  // 深さ優先
          mzdata.dbgPrintMap();

// 経路(path3)を表示
// #######################################
// #S   .....   .....   .....   .....    #
// #.###.###.###.###.###.###.###.###.### #
// #.###.###.###.###.###.###.###.###.### #
// #.   .   .   .   .   .   .   .   .    #
// #.###.###.###.###.###.###.###.###.### #
// #.###.###.###.###.###.###.###.###.### #
// #.   .   .   .   .   .   .   .   .    #
// #.###.###.###.###.###.###.###.###.### #
// #.###.###.###.###.###.###.###.###.### #
// #.   .   .   .   .   .   .   .   .    #
// #.###.###.###.###.###.###.###.###.### #
// #.###.###.###.###.###.###.###.###.### #
// #.....   .....   .....   .....   ....G#
// #######################################
      }
      if (1) {
          let mzdata = new Maze1.MazeData01();
          mzdata.create_from(Maze1data.get_map_data(stMap));
          mzdata.seekPath6();  // A*
          mzdata.dbgPrintMap();

// 最短経路(path6)を表示
// #######################################
// #S                                    #
// #.### ### ### ### ### ### ### ### ### #
// #.### ### ### ### ### ### ### ### ### #
// #.                                    #
// #.### ### ### ### ### ### ### ### ### #
// #.### ### ### ### ### ### ### ### ### #
// #.                                    #
// #.### ### ### ### ### ### ### ### ### #
// #.### ### ### ### ### ### ### ### ### #
// #.........                            #
// # ### ###.### ### ### ### ### ### ### #
// # ### ###.### ### ### ### ### ### ### #
// #        ............................G#
// #######################################
      }
      if (1) {
          stMap = 'sdata74';
          let mzdata = new Maze1.MazeData01();
          mzdata.create_from(Maze1data.get_map_data(stMap));
          mzdata.dbgPrintMap();
          mzdata.seekDeadEnd();  // 行き止まり
          mzdata.dbgPrintMap();

// ####################
// #S                 #
// # ####### ##### ## #
// #    #     #       #
// # #### ### ####### #
// #    #     # #    G#
// ####################

// 行き止まり(deadend1)を表示
// ####################
// #S                 #
// #x####### ##### ## #
// #xxxx#     #xxx    #
// #x#### ### ####### #
// #xxxx#     # #xxxxG#
// ####################
      }
      if (1) {
          stMap = 'sdata74';
          let mzdata = new Maze1.MazeData01();
          mzdata.create_from(Maze1data.get_map_data(stMap));
          mzdata.dbgPrintMap();
          mzdata.resetStartGoal(); // スタート・ゴールを最遠方に再配置
          mzdata.dbgPrintMap();

// ####################
// #S                 #
// # ####### ##### ## #
// #    #     #       #
// # #### ### ####### #
// #    #     # #    G#
// ####################

// ####################
// #                  #
// # ####### ##### ## #
// #    #     #       #
// # #### ### ####### #
// #   S#     # #G    #
// ####################
      }
      if (1) {
          stMap = 'sdata10';
          let mzdata = new Maze1.MazeData01();
          mzdata.create_from(Maze1data.get_map_data(stMap));
          mzdata.seekSomePath2();  // 複数経路の探索(幅優先)

// walk= 10 , turn= 2 , path=
//  (11) [10, 19, 28, 37, 46, 47, 48, 49, 50, 51, 52]
// Maze1.js:1598 
// 経路(path99)を表示
// #########
// #S      #
// #.##### #
// #.      #
// #.##### #
// #......G#
// #########

// Maze1.js:1321 walk= 10 , turn= 4 , path=
//  (11) [10, 19, 28, 29, 30, 31, 32, 33, 34, 43, 52]
// Maze1.js:1598 
// 経路(path99)を表示
// #########
// #S      #
// #.##### #
// #.......#
// # #####.#
// #      G#
// #########

// Maze1.js:1321 walk= 10 , turn= 2 , path=
//  (11) [10, 11, 12, 13, 14, 15, 16, 25, 34, 43, 52]
// Maze1.js:1598 
// 経路(path99)を表示
// #########
// #S......#
// # #####.#
// #      .#
// # #####.#
// #      G#
// #########
      }
      if (1) {
        stMap = 'sdata10';
        let mzdata = new Maze1.MazeData01();
        mzdata.create_from(Maze1data.get_map_data(stMap));
        mzdata.seekSomePath6();  // 複数経路の探索　（A*

    //     walk= 10 , turn= 4 , path=
    //     (11) [10, 19, 28, 29, 30, 31, 32, 33, 34, 43, 52]
    //    Maze1.js:1598 
    //    経路(path99)を表示
    //    #########
    //    #S      #
    //    #.##### #
    //    #.......#
    //    # #####.#
    //    #      G#
    //    #########
       
    //    Maze1.js:1321 walk= 10 , turn= 2 , path=
    //     (11) [10, 19, 28, 37, 46, 47, 48, 49, 50, 51, 52]
    //    Maze1.js:1598 
    //    経路(path99)を表示
    //    #########
    //    #S      #
    //    #.##### #
    //    #.      #
    //    #.##### #
    //    #......G#
    //    #########
       
    //    Maze1.js:1321 walk= 10 , turn= 2 , path=
    //     (11) [10, 11, 12, 13, 14, 15, 16, 25, 34, 43, 52]
    //    Maze1.js:1598 
    //    経路(path99)を表示
    //    #########
    //    #S......#
    //    # #####.#
    //    #      .#
    //    # #####.#
    //    #      G#
    //    #########
      }
  }

  // !!!!
  if (0) {
      let nrow = 6, ncol = 6;
      // let stMap = 'sdata51';  // path2 != path3 != path6
      let stMap = 'sdata65';  // path2 != path3 != path6
      if (1) {
          let mzdata = new Maze2.MazeData02(nrow, ncol);
          mzdata.create(10); // 棒倒し法
          mzdata.dbgPrintMap();

// +--+--+--+--+--+--+
// |SS      |        |
// +--+--+  +  +--+--+
// |        |  |     |
// +  +--+  +  +--+  +
// |  |  |     |  |  |
// +  +--+--+  +  +  +
// |     |     |     |
// +--+  +  +  +  +--+
// |     |  |     |  |
// +  +  +  +--+  +  +
// |  |     |      GG|
// +--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02(nrow, ncol);
          mzdata.create(11); // 棒倒し法 複数経路
          mzdata.dbgPrintMap();

// +--+--+--+--+--+--+
// |SS               |
// +  +  +  +  +--+  +
// |  |  |  |  |     |
// +  +  +--+  +--+  +
// |  |     |     |  |
// +--+--+  +  +  +  +
// |        |  |     |
// +--+--+  +--+--+  +
// |  |        |     |
// +  +--+  +  +  +--+
// |        |      GG|
// +--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02(nrow, ncol);
          mzdata.create(20); // 穴掘り法
          mzdata.dbgPrintMap();

// +--+--+--+--+--+--+
// |SS|        |     |
// +  +  +  +  +  +  +
// |  |  |  |  |  |  |
// +  +--+  +  +  +--+
// |        |  |     |
// +--+--+--+  +--+  +
// |     |     |     |
// +  +  +  +--+  +  +
// |  |     |     |  |
// +  +--+--+  +--+  +
// |           |   GG|
// +--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02(nrow, ncol);
          mzdata.create(21); // 穴掘り法＋壁に穴開け .. 複数経路
          mzdata.dbgPrintMap();

// +--+--+--+--+--+--+
// |SS   |           |
// +--+  +--+  +  +  +
// |  |     |     |  |
// +  +--+  +--+  +  +
// |     |  |     |  |
// +  +--+  +  +  +  +
// |        |        |
// +  +  +  +  +--+  +
// |              |  |
// +--+  +  +--+--+  +
// |               GG|
// +--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02(nrow, ncol);
          mzdata.create(22); // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路 / 中庸
          mzdata.dbgPrintMap();

// +--+--+--+--+--+--+
// |SS|              |
// +  +  +  +--+--+  +
// |     |           |
// +--+  +--+  +--+--+
// |  |     |        |
// +  +--+  +--+  +  +
// |     |     |  |  |
// +  +  +--+  +  +  +
// |  |     |  |  |  |
// +  +  +  +  +--+  +
// |     |         GG|
// +--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02(nrow, ncol);
          mzdata.create(23); // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路 / ななめを多め
          mzdata.dbgPrintMap();

// +--+--+--+--+--+--+
// |SS|        |     |
// +  +--+  +--+  +  +
// |     |        |  |
// +--+  +--+  +  +  +
// |  |     |     |  |
// +  +  +  +--+  +  +
// |     |     |  |  |
// +  +  +--+  +--+  +
// |        |     |  |
// +  +--+--+--+  +  +
// |               GG|
// +--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02(nrow, ncol);
          mzdata.create(24); // 穴掘り法＋壁に穴開け＋直線・ななめの確率高く .. 複数経路＋直線経路 / ストレート多め
          mzdata.dbgPrintMap();

// +--+--+--+--+--+--+
// |SS               |
// +--+--+--+  +  +  +
// |              |  |
// +  +--+--+--+  +  +
// |  |        |  |  |
// +  +  +--+--+  +  +
// |  |           |  |
// +  +  +--+--+  +  +
// |           |  |  |
// +  +--+  +--+  +  +
// |               GG|
// +--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02(nrow, ncol);
          mzdata.create(30); // 壁のばし法
          mzdata.dbgPrintMap();

// +--+--+--+--+--+--+
// |SS         |  |  |
// +  +--+--+--+  +  +
// |  |           |  |
// +  +  +--+  +--+  +
// |     |           |
// +  +--+  +--+  +  +
// |  |        |  |  |
// +  +  +--+  +--+  +
// |  |     |  |     |
// +--+  +--+  +  +--+
// |     |     |   GG|
// +--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02(nrow, ncol);
          mzdata.create(31); // 壁のばし法＋中央からも .. 複数経路のある迷路
          mzdata.dbgPrintMap();

// +--+--+--+--+--+--+
// |SS               |
// +  +  +--+--+  +--+
// |  |  |     |     |
// +  +  +--+  +--+  +
// |  |  |  |        |
// +--+  +--+  +--+  +
// |        |  |  |  |
// +  +--+  +--+  +  +
// |  |           |  |
// +  +--+--+--+--+  +
// |               GG|
// +--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02();
          mzdata.create_from(Maze2data.get_map_data(stMap))
          mzdata.dbgPrintMap();

// +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
// |SS                                          |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |                                            |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |                                            |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |                                            |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |                                          GG|
// +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02();
          mzdata.create_from(Maze2data.get_map_data(stMap))
          mzdata.seekPath2();  // 最短経路(幅優先)
          mzdata.dbgPrintMap();

// 最短経路(path2)を表示
// +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
// |SS                                          |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>                                          |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>                                          |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>                                          |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<> <> <> <> <> <> <> <> <> <> <> <> <> <> GG|
// +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02();
          mzdata.create_from(Maze2data.get_map_data(stMap))
          mzdata.seekPath3();  // 深さ優先
          mzdata.dbgPrintMap();

// 経路(path3)を表示
// +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
// |SS    <> <> <>    <> <> <>    <> <> <>      |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>|  |<>|  |<>|  |<>|  |<>|  |<>|  |<>|  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>    <>    <>    <>    <>    <>    <>      |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>|  |<>|  |<>|  |<>|  |<>|  |<>|  |<>|  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>    <>    <>    <>    <>    <>    <>      |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>|  |<>|  |<>|  |<>|  |<>|  |<>|  |<>|  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>    <>    <>    <>    <>    <>    <>      |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>|  |<>|  |<>|  |<>|  |<>|  |<>|  |<>|  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<> <> <>    <> <> <>    <> <> <>    <> <> GG|
// +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02();
          mzdata.create_from(Maze2data.get_map_data(stMap))
          mzdata.seekPath6();  // A*
          mzdata.dbgPrintMap();

// 経路(path6)を表示
// +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
// |SS                                          |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>                                          |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>                                          |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<>|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |<> <> <>                                    |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |  |  |<>|  |  |  |  |  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |      <> <> <> <> <> <> <> <> <> <> <> <> GG|
// +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02();
          mzdata.create_from(Maze2data.get_map_data(stMap))
          mzdata.seekPath7();  // 斜めあり
          mzdata.dbgPrintMap();

// 経路(path7)を表示
// +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
// |SS <> <> <> <> <>                           |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |  |  |  |  |  |  |<>|  |  |  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |                     <>                     |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |  |  |  |  |  |  |  |  |<>|  |  |  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |                           <>               |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |  |  |  |  |  |  |  |  |  |  |<>|  |  |  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |                                 <>         |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |  |  |  |  |  |  |  |  |  |  |  |  |<>|  |  |
// +  +--+  +--+  +--+  +--+  +--+  +--+  +--+  +
// |                                       <> GG|
// +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02();
          mzdata.create_from(Maze2data.get_map_data("sdata81"))
          mzdata.seekPath8();  // 斜めあり・総当たり力技
          mzdata.dbgPrintMap();

// 最短経路(path8)を表示
// +--+--+--+--+--+--+--+--+
// |SS <> <> <> <> <>      |
// +--+--+--+--+--+--+  +  +
// |  |     |        |<>   |
// +  +--+  +  +--+  +--+  +
// |  |        |        |<>|
// +  +--+--+--+--+--+  +  +
// |                    |GG|
// +--+--+--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02();
          mzdata.create_from(Maze2data.get_map_data("sdata73"))
          mzdata.seekDeadEnd();  // 行き止まり
          mzdata.dbgPrintMap();

// 行き止まり(deadend1)を表示
// +--+--+--+--+--+--+--+--+--+--+--+
// |SS                              |
// +  +--+--+--+--+  +--+--+  +--+  +
// |xx xx xx|xx xx    xx|xx         |
// +  +--+--+--+--+  +--+--+--+--+  +
// |xx xx xx|           |xx xx xx|  |
// +  +--+--+  +--+--+  +  +--+--+  +
// |xx xx xx|           |xx|xx xx GG|
// +--+--+--+--+--+--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02();
          mzdata.create_from(Maze2data.get_map_data("sdata73"))
          mzdata.resetStartGoal(); // スタート・ゴールを最遠方に再配置
          mzdata.dbgPrintMap();

// +--+--+--+--+--+--+--+--+--+--+--+
// |                                |
// +  +--+--+--+--+  +--+--+  +--+  +
// |        |           |           |
// +  +--+--+--+--+  +--+--+--+--+  +
// |        |           |        |  |
// +  +--+--+  +--+--+  +  +--+--+  +
// |      SS|           |  |GG      |
// +--+--+--+--+--+--+--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02();
          mzdata.create_from(Maze2data.get_map_data("sdata10"))
          mzdata.dbgPrintMap();
          mzdata.seekSomePath2();  // 複数経路の探索（幅優先)
          mzdata.dbgPrintMap();


// +--+--+--+--+--+
// |SS            |
// +  +--+--+--+  +
// |              |
// +  +--+--+--+  +
// |            GG|
// +--+--+--+--+--+

// walk= 6 , turn= 2 , path=
//  Array(7)
// 経路(path99)を表示
// +--+--+--+--+--+
// |SS            |
// +  +--+--+--+  +
// |<>            |
// +  +--+--+--+  +
// |<> <> <> <> GG|
// +--+--+--+--+--+

// walk= 6 , turn= 4 , path=
//  Array(7)
// 経路(path99)を表示
// +--+--+--+--+--+
// |SS            |
// +  +--+--+--+  +
// |<> <> <> <> <>|
// +  +--+--+--+  +
// |            GG|
// +--+--+--+--+--+

// walk= 6 , turn= 2 , path=
//  Array(7)
// 経路(path99)を表示
// +--+--+--+--+--+
// |SS <> <> <> <>|
// +  +--+--+--+  +
// |            <>|
// +  +--+--+--+  +
// |            GG|
// +--+--+--+--+--+

// 最短経路(path2)を表示
// +--+--+--+--+--+
// |SS            |
// +  +--+--+--+  +
// |<>            |
// +  +--+--+--+  +
// |<> <> <> <> GG|
// +--+--+--+--+--+
      }
      if (1) {
          let mzdata = new Maze2.MazeData02();
          mzdata.create_from(Maze2data.get_map_data("sdata10"))
          mzdata.dbgPrintMap();
          mzdata.seekSomePath7();  // 複数経路の探索（斜めあり
          mzdata.dbgPrintMap();

// +--+--+--+--+--+
// |SS            |
// +  +--+--+--+  +
// |              |
// +  +--+--+--+  +
// |            GG|
// +--+--+--+--+--+

// walk= 4 , turn= 2 , path=
//  Array(5)
// 経路(path99)を表示
// +--+--+--+--+--+
// |SS            |
// +  +--+--+--+  +
// |   <> <> <>   |
// +  +--+--+--+  +
// |            GG|
// +--+--+--+--+--+

// walk= 5 , turn= 2 , path=
//  Array(6)
// 経路(path99)を表示
// +--+--+--+--+--+
// |SS <> <> <>   |
// +  +--+--+--+  +
// |            <>|
// +  +--+--+--+  +
// |            GG|
// +--+--+--+--+--+

// walk= 5 , turn= 2 , path=
//  Array(6)
// 経路(path99)を表示
// +--+--+--+--+--+
// |SS            |
// +  +--+--+--+  +
// |<>            |
// +  +--+--+--+  +
// |   <> <> <> GG|
// +--+--+--+--+--+

// 経路(path7)を表示
// +--+--+--+--+--+
// |SS            |
// +  +--+--+--+  +
// |   <> <> <>   |
// +  +--+--+--+  +
// |            GG|
// +--+--+--+--+--+
      }
  }

}


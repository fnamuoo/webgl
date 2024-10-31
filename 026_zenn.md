# Three.js Cannon.es 調査資料 - マップ分割（１）平面

## この記事のスナップショット

走行中スナップショット
![](https://storage.googleapis.com/zenn-user-upload/434431fde476-20241031.jpg)

ソース

https://github.com/fnamuoo/webgl/blob/main/026


動かし方

- ソース一式を WEB サーバ上に配置してください
- 車の操作法
  - カーソル上 .. アクセル
  - カーソル下 .. バック
  - カーソル左、カーソル右 .. ハンドル
  - 'b' .. ブレーキ
  - 'c' .. カメラ視点の変更
  - 'r' .. 姿勢を戻す
  - マウス操作 .. カメラ位置の変更
  - '1' .. 車変更：FR低出力
  - '2' .. 車変更：FR高出力
  - '3' .. 車変更：FF低出力
  - '4' .. 車変更：FF高出力
  - '5' .. 車変更：4WD低出力
  - '6' .. 車変更：4WD高出力

## 概要

どうにか大きなサイズの地図上を走らせたい！という一念で、マップの分割表示にチャレンジします。
最終目標は、国土地理院の3Dデータを分割して表示することになります。
今回はその第一弾として「平面の分割」にチャレンジです。

## やったこと

平面地図を 10x10 のブロックに分割して、常に表示するブロックは 5x5 とします。
中心のブロックに自車を配置して、中心のブロックからはみ出たら、（中心のブロックに収まるよう）自車を１ブロック分反対方向に瞬間移動させ、一方で表示している 5x5 ブロック（地図）は進行方向に車が進んだように１ブロックずらします。
なお、端は周期的境界として、反対側のブロックを用います。
本来なら地図データをキャッシュ化してメモリコピーしたかったのですが、ハマってしまい、泣く泣く全データをロードし直すことをしています。

```js
    // 自車の座標値がカレントブロックの境界(curblkBoundary) を超えたら、地面パネルの移動とテクスチャ張替
    var changeCurHW = 0;
    var px, py, pz;
    if (vposi.x < curblkBoundary[0]) {
      changeCurHW = 1;
      curw = (curw-1+ncurw) % ncurw;
      [px, py, pz] = vehicle.getPosition();
      px = px + grndw*2; 
      vehicle.setPosition2(px, py, pz);
    } else if (vposi.x > curblkBoundary[2]) {
      changeCurHW = 1;
      curw = (curw+1) % ncurw;
      [px, py, pz] = vehicle.getPosition();
      px = px - grndw*2; 
      vehicle.setPosition2(px, py, pz);
    } else if (vposi.z < curblkBoundary[1]) {
      changeCurHW = 1;
      curh = (curh-1+ncurh) % ncurh;
      [px, py, pz] = vehicle.getPosition();
      pz = pz + grndh*2; 
      vehicle.setPosition2(px, py, pz);
    } else if (vposi.z > curblkBoundary[3]) {
      changeCurHW = 1;
      curh = (curh+1) % ncurh;
      [px, py, pz] = vehicle.getPosition();
      pz = pz - grndh*2; 
      vehicle.setPosition2(px, py, pz);
    }
    if (changeCurHW == 1) {
      // テクスチャを張り替える
      for (let _ih = 0; _ih < nh; ++_ih) {
        var ih = (_ih -1 + curh + ncurh) % ncurh;
        for (let _iw = 0; _iw < nw; ++_iw) {
          var iw = (_iw - 1 + curw + ncurw) % ncurw;
          const fpath = "pic/FujiSpeedway_out/out_" + ih + "_" + iw + ".png";
          const texture = new THREE.TextureLoader().load(fpath); 
          var viGround2Mtr = viGround2Mtrs[_ih][_iw];
          viGround2Mtr.map = texture;
        }
      }
    }
}
```

## 実行

切り替わりがわからないほどスムーズに動いている感じがします。
この方向性で大丈夫みたいですね。


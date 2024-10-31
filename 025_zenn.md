# Three.js Cannon.es 調査資料 - javascript でのクラス・派生

## この記事のスナップショット

FRスナップショット
![](https://storage.googleapis.com/zenn-user-upload/ce4080f62176-20241031.jpg)

FFスナップショット
![](https://storage.googleapis.com/zenn-user-upload/7ed82df6985e-20241031.jpg)

4WDスナップショット
![](https://storage.googleapis.com/zenn-user-upload/7630d720ce11-20241031.jpg)

ソース

https://github.com/fnamuoo/webgl/blob/main/025

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

今回は車モデルのクラス化の話です。

先述の記事、「ビーナスライン走ってみた」で紹介済みではありますが、駆動系の違う車（FR, FF, 4WD）のパラメータ違い（低出力・高出力）で走ってみたいという欲求を満たしつつ、かつパラメータのメンテナンスを簡単にしたいという点を満たすために、車モデルをクラス化してます。

## やったこと

javascript でのクラス化の方法は専門書や有識者の方から紹介されているので、ここでは車モデルでの実装例を示します。

すべてのクラスの根幹にあたる基底クラスが VehicleBase です。
ここから、駆動系（FR, FF, 4WD）別の基本クラスとなる VehicleFRBase, VehicleFFBase Vechile4WDBase があり、そこからセッティングごとにパラメータを上書きしたクラスを用意しています。

コンストラクタでは上書きしたパラメータを使ってくれないようなので、コンストラクタを呼び出した後に、明示的にinit関数を呼び出す手順を取ってます。

```fig
[VehicleBase]
　△
　├─[VehicleFRBase]  .. FR用クラス
　│　　△
　│　　├─[VehicleFR01] .. FR・低出力・グリップ用
　│　　├─[VehicleFR02] .. FR・高出力・グリップ用
　│　　├─[VehicleFR11] .. FR・高出力・ドリフト用
　│　　├─[VehicleFR12] .. FR・高出力・ドリフト用
　│
　├─[VehicleFFBase]  .. FF用クラス
　│　　△
　│　　├─[VehicleFF02]  .. FF・低出力
　│　　├─[VehicleFF02]  .. FF・高出力
　│　　├─[VehicleFF11]  .. FF・低出力・ドリフト用
　│　　├─[VehicleFF12]  .. FF・高出力・ドリフト用
　│
　├─[Vehicle4WDBase]  .. 4WD用クラス
　│　　△
　│　　├─[Vehicle4WD01]  .. 4WD・低出力
　│　　├─[Vehicle4WD02]  .. 4WD・高出力
　│　　├─[Vehicle4WD11]  .. 4WD・低出力・ドリフト用
　│　　├─[Vehicle4WD12]  .. 4WD・高出力・ドリフト用
```

定義したクラスを公開するために export をつけてクラス宣言しておきます。
他は export を付けずに隠蔽してます。

```js:VehicleBase.js
class VehicleBase {
   ...
}

class VehicleFRBase extends VehicleBase {
  ...
}

export class VehicleFR01 extends VehicleFRBase {
  ...
}
...
```

クラス定義したファイル（VehicleBase.js）をモジュールファイルとして使うこととします。
呼び出す側（main.js）では import 宣言で vb の接頭辞をつけて利用することにします。

```js:main.js
import * as THREE from "three";
import * as CANNON from "cannon";

import { OrbitControls } from "orbitcontrols";
import * as vb from "VehicleBase";

window.onload = () => {
    ...
    var vehicleList = []
    const vehicle1 = new vb.VehicleFR01(scene, world, moGroundMtr);
    vehicle1.init();
    ...
}
```

html 側でモジュール宣言し、ファイルの場所・名称を宣言します。

```html:index.html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
    {
      "imports": {
        "three"          : "./js/three@0.165.0/three.module.js",
        "orbitcontrols"  : "./js/three@0.165.0/OrbitControls.js",
        "cannon"         : "./js/cannon-es@0.20.0/cannon-es.min.js",
        "VehicleBase"    : "./VehicleBase.js"
      }
    }
  </script>
  <script src="js/perlin.js"></script>
  <script type="module" src="main.js"></script>
</head>
...
```

## 雑感

javascriptでクラス（継承）が使えて、格段にパラメータ管理が楽になり感激です。

惜しむらくは、ドリフト用のセッティングがいまいちな点です。調整に難儀して放置してます。

# Babylon.js で物理演算(Havok)：4足・6足タイプの物理モデル作成

## この記事のスナップショット

![](https://static.zenn.studio/user-upload/bfadc218a66d-20260501.gif)
*6足歩行の物理モデル*

https://playground.babylonjs.com/?BabylonToolkit#VWTQ2K

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

## ソース

https://github.com/fnamuoo/webgl/blob/main/142

- `142_1_mecha_4LEG`      .. 4足歩行
- `142_2_mecha_4LEG_jump` .. 4足両足ジャンプ
- `142_3_mecha_6LEG`      .. 6足歩行

:::message
ローカルで動かす場合、上記ソースに加え、別途 git 内の [136/js](https://github.com/fnamuoo/webgl/tree/main/136/js) を ./js として配置してください。
:::

## 概要

前回の2足歩行で『この程度なの？』と思われるのは癪なので、4足・6足でよりシャキシャキ歩く物理モデルを作成しました。

参考にしたのは TAMIYAの下記 3作品になります。
- [メカ・キリン （4足歩行タイプ）](https://www.tamiya.com/japan/products/71105/index.html)
- [メカ・カンガルー （両足ジャンプタイプ）](https://www.tamiya.com/japan/products/71102/index.html)
- [2チャンネル リモコン・インセクト （6足歩行タイプ）](https://www.tamiya.com/japan/products/71107/index.html)

大して調整していないのですが、それでも 2足より4足、4足より6足が安定した動きです。（想定通りです）

![](https://static.zenn.studio/user-upload/0cf2d2fe46db-20260501.gif)
*4足歩行の様子*

![](https://static.zenn.studio/user-upload/78b132ba6b88-20260501.gif)
*4足両足ジャンプの様子*

![](https://static.zenn.studio/user-upload/bfadc218a66d-20260501.gif)
*6足歩行の様子*

細かい製作過程については前回の記事 [Babylon.js + Havokで二足歩行を安定させる：クランク機構を「壊れない形で作る3ステップ」](https://zenn.dev/fnamuoo/articles/eae23c1ca82cc3) で触れており、同じ手法で作成しています。制作過程が気になる方は上述の記事をご覧ください。

## やったこと

実際は 3ステップで物理モデルを構築していますが、下記の説明では2ステップ目の「無重力環境でのモデル作成」を割愛しています。（正しい位置に配置・結合していることを確認するだけの内輪の話なので説明をスキップしました）

- 4足歩行タイプ
  - 4足歩行の設計（メッシュ動作）
  - 4足歩行の物理モデル（重力下で歩行）
- 4足両足ジャンプタイプ
  - 4足両足ジャンプの設計（メッシュ動作）
  - 4足両足ジャンプの物理モデル（重力下で歩行）
- 6足歩行タイプ
  - 6足歩行の設計（メッシュ動作）
  - 6足歩行の物理モデル（重力下で歩行）

### 4足歩行の設計（メッシュ動作）

参考資料の [4足歩行の完成図](https://www.tamiya.com/japan/products/71105/index.html) や [4足歩行の組み立て説明書](https://d7z22c0gz59ng.cloudfront.net/cms/japan/download/pdf/robot/71105.pdf) から 動作機構、固定点・可動点・連結点を大まかに設計します。

```text
//    P5(o)-_   _-(o)P3
//       |   -_-   |
// P0  P2|  _- -_  | P1
// (s)--(a)-     -(s)
//       |         |
//    P6(o)       (o)P4
// (s):固定点
// (a):可動点
// (o):連結点／端点
```

左右を１８０度位相をずらした動きとして、点と線でだけで表現すると次のような様子になります。この段階では基本的な動作を確認する段階なので最終的な長さとは異なります。

![](https://static.zenn.studio/user-upload/c6b17ee4db00-20260501.gif)
*4足歩行のメッシュ動作*

### 4足歩行の物理モデル（重力下で歩行）

下記条件で物理モデルを作ってます。

- クランク機構はシンプルに、余分なフレームをつけないようにする。
- 物理拘束は hinge のみ。回転軸は Binormal方向。
- モーター（可動点）部分は重く、回転摩擦をやや大きく、やや強い力で回す（ソルバの安定化と大きなトルクをかけることを狙う）。
- メッシュ同士の衝突判定を無効化

![](https://static.zenn.studio/user-upload/0cf2d2fe46db-20260501.gif)
*4足歩行の物理モデル*

### 4足両足ジャンプの設計（メッシュ動作）

こちらでも同様に [両足ジャンプの完成図](https://www.tamiya.com/japan/products/71102/index.html) や [両足ジャンプの組み立て説明書](https://d7z22c0gz59ng.cloudfront.net/cms/japan/download/pdf/robot/71102.pdf) から 動作機構、固定点・可動点・連結点を大まかに設計します。

```text
//          _-(o)P5
//        _-   |
//  P1  _-   P4|  P0
//  (s)-      (a)-(s)_
//   |         |      ~-(s)P3
//  (s)P2     (o)P6   
// (s):固定点
// (a):可動点
// (o):連結点／端点
```

点と線でだけで表現すると次のような様子になります。
この段階では基本的な動作を確認する段階なので最終的な長さとは異なります。

![](https://static.zenn.studio/user-upload/da2200c826f2-20260501.gif)
*4足両足ジャンプのメッシュ動作*

### 4足両足ジャンプの物理モデル（重力下で歩行）

下記条件で物理モデルを作ってます。

- (※4足歩行の設定を踏襲)
- 前足部分の摩擦係数を低く、滑るように。
- しっぽとしてのおもりは割愛。

![](https://static.zenn.studio/user-upload/78b132ba6b88-20260501.gif)
*4足両足ジャンプの物理モデル*

### 6足歩行の設計（メッシュ動作）

同様に [2チャンネル リモコン・インセクト （6足歩行タイプ）](https://www.tamiya.com/japan/products/71107/index.html) や [6足歩行の組み立て説明書](https://d7z22c0gz59ng.cloudfront.net/cms/japan/download/pdf/robot/71107.pdf) から 動作機構、固定点・可動点・連結点を大まかに設計します。

```text
// (o)P4       (o)P6      _-(o)P8
//  |   -       |   -_   -   |
//  |    -_     |P1   -_-    |
//  |      -_   |(s) _- -_   |
//  |       -_  |/ _-    -_  |
// (s)        -(a)-        -(s)
//  |P0         |P3          |P2
//  |           |            |
//  |           |            |
// (o)P5       (o)P7        (o)P9
// (s):固定点
// (a):可動点
// (o):連結点／端点
```

点と線だけで表現すると次のような様子になります。
歩行の様子を確認すべく、左右（位相を１８０度ずらしたもの）を重ねて、足の運びを確認しておきます。

![](https://static.zenn.studio/user-upload/2a44b915d0cd-20260501.gif)
*6足歩行のメッシュ動作*

### 6足歩行の物理モデル（重力下で歩行）

下記条件で物理モデルを作ってます。

- (※4足歩行の設定を踏襲)

![](https://static.zenn.studio/user-upload/bfadc218a66d-20260501.gif)
*6足歩行の物理モデル*

## まとめ・雑感

計算ドリルを解くがごとく、3つのケースについて試作してみました。
物理モデルを作るところまでは慣れてきましたが、高速に動かすことについては後々。

しかし、TAMIYAさんの [ロボクラフトシリーズ](https://www.tamiya.com/japan/products/list.html?genre_item=404010) は勉強になります。

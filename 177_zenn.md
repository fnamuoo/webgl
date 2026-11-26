## この記事のスナップショット

![](https://static.zenn.studio/user-upload/a720b57577f4-20261127.gif)
*sample (5倍速)*

## デモ＆ソース

- [サンプル Playground](https://playground.babylonjs.com/?BabylonToolkit#GQ5PW9)
- [お掃除ゲーム Playground](https://playground.babylonjs.com/?BabylonToolkit#GQ5PW9#1)
  - 上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに表示できます。歯車マークから「FULLSCREEN」を選べば全画面表示になります。
- [ソース](https://github.com/fnamuoo/webgl/blob/main/177/)
  - ローカルで動かす場合、上記ソースに加え、別途 git 内の [136/js](https://github.com/fnamuoo/webgl/tree/main/136/js) を ./js として配置してください。


## 概要

- 高圧洗浄風のお掃除ゲームを作ってみたかった。
- Babylon.jsでは、Decal Mapを使うことで、メッシュの表面にデカール（汚れなどの模様）をテクスチャとして描画できる。
  - ref：[decal](https://doc.babylonjs.com/features/featuresDeepDive/mesh/decals/)
- しかし、汚れを部分的に消す方法が分からなかった。
- 生成AIに相談して、レイヤーを分ける方法を試したところ、うまく表現できていることを確認した。
- その仕組みを使ってゲームにしてみた。


補足：  
Babylon.js の公式ドキュメントでは、メッシュに貼り付けるデカールの方式として、Mesh Decals と Decal Maps が区別されています。
今回の実装で使用しているのは MeshUVSpaceRenderer による Decal Map になります。


## 今回作成したゲーム

項目   | 内容
-------|-----------------
掃除対象 | 球体、ダイヤモンドカット形状、キャンバス状の直方体など
画像表示 | 直方体メッシュに任意の画像を貼り付けて掃除対象にする
掃除状態 | きれいになった割合をパーセント表示
クリア条件       | 95%以上きれいになればクリア
ステージ切り替え | 次のメッシュや画像に切り替える
初期状態         | きれい度10%以下、つまり汚れた状態から開始


## 技術調査：クリーン方法

生成AIに質問した内容と、その回答を以下に示します。

> babylon.js 9 以上で、decal でメッシュを汚して、一方で decal の汚れを部分的にきれいにする方法はあるか？


::::details Claude 回答

まず Babylon.js 9 時点での decal 周りの現行機能を確認します。

結論から言うと、Babylon.js 9 の標準 decalMap（`MeshUVSpaceRenderer`）には部分的に消す API はありません。
decalMap は `renderTexture` でデカールを追加していく仕組みで、9.18 の型定義を見ても公開メソッドは `renderTexture` と `clear` だけです。
つまり「足す」か「全消し」しかできません。ただし、レイヤーを分ければ実現できます。

## 方法1（推奨）: 汚れレイヤーと「きれいにしたマスク」を別々に持つ

`MeshUVSpaceRenderer` を2つ作ります。一方に汚れを描き、もう一方に掃除した場所を白で描き、
シェーダーで `汚れ × (1 − 掃除マスク)` として合成します。
通常のアルファブレンドで描くため、同じ場所を何度もこすると掃除マスクが1に近づき、徐々にきれいになります。

```ts
import { MeshUVSpaceRenderer } from "@babylonjs/core/Meshes/meshUVSpaceRenderer";

const opts = { width: 2048, height: 2048, uvEdgeBlending: true };
const dirtLayer = new MeshUVSpaceRenderer(mesh, scene, opts); // 汚れ用
const cleanMask = new MeshUVSpaceRenderer(mesh, scene, opts); // 掃除マスク用

// 汚す: 汚れ画像（アルファ付き）をデカールとして描く
dirtLayer.renderTexture(dirtSplatTex, hitPoint, hitNormal,
  new Vector3(0.4, 0.4, 0.4), Math.random() * Math.PI * 2);

// きれいにする: 白+アルファのソフトブラシを同じ位置に描く
cleanMask.renderTexture(softBrushTex, hitPoint, hitNormal,
  new Vector3(0.3, 0.3, 0.3));
```

合成側は、`dirtLayer.texture` と `cleanMask.texture` を2枚のサンプラーとして渡し、次のように混ぜます（GLSL のイメージ）。

```glsl
vec4 dirt = texture2D(dirtSampler, vMainUV1);
float clean = texture2D(cleanSampler, vMainUV1).a;
surfaceAlbedo = mix(surfaceAlbedo, dirt.rgb, dirt.a * (1.0 - clean));
```

組み込み先は次のどちらかです。

- **NodeMaterial**: Texture ブロック2つ → Mix で組めます。GLSL/WGSL を書かずに済み、WebGPU でも動かしやすいです。
- **MaterialPluginBase**: PBRMaterial に差し込みます。上記のコードはアルベド更新のフックに入れる想定ですが、フック名や WGSL 版は実装時に確認してください。


(Claude 回答ここまで)
::::


## サンプル作成からブラッシュアップまで

生成AIにサンプルを作成してもらい、ゲーム化するまでの手順（プロンプト）を抜粋して紹介します。

- サンプル作成
  - 目的 : プロトタイプ
  - プロンプト:
    >  babylon.js 9 の playground(javascript)で動くサンプルを作成して。
- 形状切り替え
  - 目的 : 球体以外でも使えるか確認
  - プロンプト:
    > 上記で、球メッシュの他に、直方体やダイヤモンドカットのメッシュに切り替えられるようにして

- 画像付きメッシュ
  - 目的 : 任意の画像を掃除対象にする
  - プロンプト:
    > 直方体を薄くしてキャンバス状にして、任意の画像を貼り付けたうえで、汚したり、きれいにしたりできるようにして。
    > 画像は外部URLを指定して、複数の画像を切り替えられるように。
    > 直方体が不都合なら、平面に変更してもよい。

- きれい度の表示
  - 目的 : 進行状況を表示
  - プロンプト:
    > クリーン状態（パーセント表示）と、クリア判定（９５％以上きれいになったらクリア表示＋次のメッシュ・画像に）は可能か？


### 画像生成

別途、生成AIで一枚絵の画像を作ってもらいました。
画像は別途アップロードし、そのURLを紐づけています。

画像生成って便利なんですけど、ものによっては、はめ込み画像（アイコラ）のように見えるのが少し残念です。特に絵画系が難しいです。今回、はめ込み画像のように見えるものや、等身に違和感があるものは除外しました。下記は、違和感があったもののアニメ風に加工して違和感を抑えてみた画像です。

![](https://static.zenn.studio/user-upload/60f765becac3-20261127.jpg)
*モナリザ風*

## まとめ・雑感

- **技術面**：汚れレイヤーと掃除マスクを分けることで、部分的に汚れを落とす仕組みを実現できた。
- **ゲーム面**：画像を貼り付けることで、掃除しながら絵が現れる楽しさを作れた。モチーフ次第でモチベーションも上がりそう。
- **アイデア**：大掃除をテーマに家の汚れや街中の落書きなどを対象にすると面白そうだが、メッシュ構成や処理負荷の設計が課題になることが分かった。


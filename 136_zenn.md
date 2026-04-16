# Babylon.js：鉄道模型のレイアウト作成にチャレンジ

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/c96fe343d940-20260416.gif)
*スナップショット*

https://playground.babylonjs.com/?BabylonToolkit#NIQ66P

:::message
上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。
:::

## ソース

https://github.com/fnamuoo/webgl/blob/main/136

:::message
ローカルで動かす場合、上記ソースを HTTPサーバ上に配置してください。./js 以下のbabylon.js ライブラリは 9.1.0 に更新しています。
:::

## 概要

以前の記事  [Babylon.js：ribbonで作る列車／車メッシュ](https://zenn.dev/fnamuoo/articles/b29bcfeeb7bf72) でせっかく列車メッシュをつくったので、鉄道模型のレイアウト（ジオラマ）にチャレンジしました。地面と列車だけでは物寂しいので、都市部や湖畔、山間部といったコンセプトで装飾を施しました。
ただ、「列車メッシュのサイズ」と「レール軌道のスケール感」が合わずにレール軌道を作り直したり、作ったレイアウトに違和感／物寂しさを感じて、装飾を追加（遠方に丘陵地を設置）したり試行錯誤しました。

![](https://storage.googleapis.com/zenn-user-upload/c96fe343d940-20260416.gif)
*都市部*

![](https://storage.googleapis.com/zenn-user-upload/43e6e6434af3-20260416.gif)
*湖畔*

![](https://storage.googleapis.com/zenn-user-upload/b69f66a31313-20260416.gif)
*山間部*

## やったこと

- 都市部のレイアウト
  - 都市部のコンセプト
  - ホームに停車する列車
  - 都市部の装飾
- 湖畔のレイアウト
  - 湖畔のコンセプト
  - 湖畔をつくる
  - 湖畔の装飾
- 山間部のレイアウト
  - 山間部のコンセプト
  - 機関車と貨物列車
  - 山間部の装飾
- カメラワーク調整
- レール軌道を作成する

### 都市部のレイアウト

#### 都市部のコンセプト

複数の列車が走る感じ、のぼりとくだりで対向するだけでなく、普通と特急の合計４本の列車を走らせます。ただ周回するだけでは単調になりがちなので、ホームに停車・発進する動きにチャレンジしました。

#### ホームに停車する列車

列車の制御についての設計／アルゴリズムの基本指針は次のとおりです。実装では「加速（強制）」の状態を追加したりと一工夫入れてます。

列車を停止・発進させようとすると、列車に状態（一定速・減速・停止・加速）を持たせる必要があります。レール上に停止位置だけを決めておきます。停止位置の手前、速度から逆算できる停止距離の区間に入ったら減速させます。停止位置前で停止しないように最低限の速度で徐行させます。停止位置で停止させたら一定ループ待ちを発生させ、その後に発進、加速させます。加速中、最大速度に達したら等速運動させます。

::::details 列車の走行状態を変化させる処理
```js
            let brakeR = 150.0;
            if (data.actState == "stop") {
                if (data.stopCnt > 0) {
                    data.stopCnt -= 1;
                    continue;
                } else {
                    data.actState = "accForce";
                }
            } else {
                if (data.vmax > 0) {
                    if ((data.actState == "accForce") || (data.actState == "acc")) {
                        // 加速
                        data.v += data.vmax*0.01;
                        if (data.v > data.vmax) {
                            data.v = data.vmax;
                            data.actState = "run";
                        } else if (data.v > data.vmax_) {
                            data.actState = "acc";
                        }
                    }
                    if ((data.actState == "run") || (data.actState == "acc"))  {
                        for (let pstop of data.stopList) {
                            let drest = pstop - data.p; // 停止位置までの距離
                            let brakingdist = brakeR*data.v; // 制動距離
                            if (drest >= 0 && drest <= brakingdist) {
                                data.actState = "brake";
                                data.pstopCur = pstop;
                                break;
                            }
                        }
                    }
                    if (data.actState == "brake") {
                        let drest = data.pstopCur - data.p; // 停止位置までの距離
                        if (drest < 0 || drest <= data.vmin) {
                            data.actState = "stop";
                            data.v = 0;
                            data.stopCnt = data.stopCntMax;
                        } else {
                            let brakingdist = brakeR*data.v; // 制動距離
                            if (drest <= brakingdist) {
                                data.v *= 0.99;
                                data.v = Math.max(data.v, data.vmin);
                            }
                        }
                    }
                } else {
                    if ((data.actState == "accForce") || (data.actState == "acc")) {
                        // 加速
                        data.v += data.vmax*0.01;
                        if (data.v < data.vmax) {
                            data.v = data.vmax;
                            data.actState = "run";
                        } else if (data.v < data.vmax_) {
                            data.actState = "acc";
                        }
                    }
                    if ((data.actState == "run") || (data.actState == "acc"))  {
                        for (let pstop of data.stopList) {
                            let drest = data.p - pstop; // 停止位置までの距離
                            let brakingdist = -brakeR*data.v; // 制動距離
                            if (drest >= 0 && drest <= brakingdist) {
                                data.actState = "brake";
                                data.pstopCur = pstop;
                                break;
                            }
                        }
                    }
                    if (data.actState == "brake") {
                        let drest = data.p - data.pstopCur; // 停止位置までの距離
                        if (drest < 0 || drest <= data.vmin) {
                            data.actState = "stop";
                            data.v = 0;
                            data.stopCnt = data.stopCntMax;
                        } else {
                            let brakingdist = -brakeR*data.v; // 制動距離
                            if (drest <= brakingdist) {
                                data.v *= 0.99;
                                data.v = Math.min(data.v, data.vmin);
                            }
                        }
                    }
                }
            }
```
::::

生成ＡＩに頼らずに自前で設計・実装しました。もっと効率的でクールな方法があるかもしれません。動作を見て、特に違和感はなかったので大きく外していないと思います。
ちなみに、車両１つ１つごとに判断させたら、列車がバラバラになることがありました。データの持ち方を変更し、複数車両を「列車」としてまとめて管理し、描画だけは複数車両まとめて行うようにしたら動作が安定しました。

#### 都市部の装飾

レール軌道のラインデータを使って、  [extrude](https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/param/extrude_shape/)  でレールと枕木を作成します。これは [Babylon.js で物理演算(havok)：カートレース](https://zenn.dev/fnamuoo/articles/7af076bef4cc25) でのコース描画の流用です。ただこの方法の欠点として枕木の描画が斜めに歪む場合があります。厳密に処理するなら [Building a Track for a Carriage to Follow](https://doc.babylonjs.com/guidedLearning/workshop/Track/) にあるローラーコースターの例のように、メッシュで枕木を作るのがよさそうです。


駅舎（建物）は面倒なのでプラットフォームの模した直方体だけを配置しています。

都市部に欠かせないビルディングは [Immutable Solid Particle Systems](https://doc.babylonjs.com/features/featuresDeepDive/particles/solid_particle_system/immutable_sps/) から拝借しています。レールの軌道上と交差判定として、レールのPath3D との距離が近いものは、建物のサイズを 0 にして見えなくしています。

高架橋については、レールの点座標から一定の高さ以上の地点を抜き出し、extrude で面を描かせています。あと一定間隔ごとに支柱（円柱）を配置して建造物っぽくしています。


### 湖畔のレイアウト

#### 湖畔のコンセプト

cs20さんの作品 [列車を追随するカメラーワーク／水上都市バージョン](https://scrapbox.io/babylonjs/%E5%88%97%E8%BB%8A%E3%82%92%E8%BF%BD%E9%9A%8F%E3%81%99%E3%82%8B%E3%82%AB%E3%83%A1%E3%83%A9%E3%83%BC%E3%83%AF%E3%83%BC%E3%82%AF) に触発されて、水面に移り込む列車、水面を走る列車にチャレンジしました。

#### 湖畔をつくる

湖には [WaterMaterial](https://doc.babylonjs.com/toolsAndResources/assetLibraries/materialsLibrary/waterMat/) を使います。参考にしたコードでは、水面にさざ波がたっているようで、映り込みがぼやけていました。そこで、波の高さ（効果）を０にしました。

::::details 水面のパラメータ
```js
変更前（さざ波）
                waterMaterial.waveLength = 0.01;
                waterMaterial.waveHeight = 0.015;
                waterMaterial.waterDirection = new BABYLON.Vector2(0, 1);
------------------------------
変更後（鏡面）
                waterMaterial.waveLength = 0.0;
                waterMaterial.waveHeight = 0.0;
                waterMaterial.waterDirection = new BABYLON.Vector2(0, 0.01);
```
::::

地面を一面水面にするのも芸がないと思い、地面の面の中央をくりぬいて湖っぽくします。

面をくりぬくには [Polygon Mesh Builder](https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/param/polyMeshBuilder/) を参考にしました。

#### 湖畔の装飾

地面／岸には草のテクスチャをはりつけたものの、遠方まで平面が広がる空間に違和感が残ります。

そこで盆地になるように、湖周辺の地形を造成します。ここでは簡単に [heightmap](https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/set/ground_hmap/) を使って丘陵地を作ります。湖を囲むように広い範囲で、中央の湖部分に該当する部分の高さが０になるように画像を準備します。適当なものがなかったので公式の textures にある distortion.png を画像ツールで編集し、中央部分を黒くしました。砂丘っぽく砂のテクスチャを貼り付けてみましたが、「砂漠の中のオアシス」っぽくなったでしょうか？

今回、遠方に丘陵地を配置してみましたが、植林（上記「都市」のビルの代わりに木を配置）したり、[fog](https://doc.babylonjs.com/features/featuresDeepDive/environment/environment_introduction/)で遠方をぼかしたりしてもよかったのかもしれません。ただ、fogにすると空（skybox)の写り込みがなくなるので良し悪しですが。

尚、ここではレールテクスチャの表現は止めて、線分のみにしています。レールの表現を試しましたが「枕木の斜めが目立つ」ことと、「レールが無くて浮いた感じが湖面に映える」ので線分にしています。

### 山間部のレイアウト

#### 山間部のコンセプト

アルプス山脈を登る長い列車をイメージしました。ここは客車にすべきなんでしょうが貨物列車の方が長いイメージなので貨車にします。また長さは適当に60両にしました。

また、山につきものな雲について２つ試作しました。「雲海の上を走るパターン」と「中層の雲を抜けて景色が一変するパターン」です。今回のレールのレイアウトでは「雲海の上を走る」感じが十分に生かせていないです。レールをひいた時にそこまで想定していなかったので仕方なしです。

#### 機関車と貨物列車

貨物列車といえば、ディーゼル機関車（赤橙）を連想してしまうので、DD51をイメージした車両を作成しました。また、貨物車両には、コンテナ車両と、円筒形っぽいタンク車両（個人的にお気に入り）を用意しました。

![](https://storage.googleapis.com/zenn-user-upload/a3276dc73483-20260416.jpg)
*機関車*

![](https://storage.googleapis.com/zenn-user-upload/2b6d7bf31fcc-20260416.jpg)
*貨物車両１（コンテナ）*

![](https://storage.googleapis.com/zenn-user-upload/ec7fdb3d7dd6-20260416.jpg)
*貨物車両２（コンテナ）*

![](https://storage.googleapis.com/zenn-user-upload/e7205ba1962a-20260416.jpg)
*貨物車両３（タンク）*

#### 山間部の装飾

ribbon で地形を生成します。作り方は以前の記事、[Babylon.js で物理演算(havok)：ＡＩに頼りつつ「道路に合わせた地形」を作成する](https://zenn.dev/fnamuoo/articles/7e6a69684326f9) の方法を流用します。

また、雲を発生させる方法は [Babylon.js：サンプルを生成ＡＩで幻想的にしてみる](https://zenn.dev/fnamuoo/articles/cf5769f0d62a81) で利用した方法を流用します。

「雲海の上を走るパターン」には、頂上付近で広範囲に雲を分布させてみました。
「中層の雲を抜けて景色が一変するパターン」では、中層に局所的に雲が発生しているかのように分布させてみました。仕上がりが気になる方は下記 playground で確認してみてください。

「雲海の上を走るパターン」
@[card](https://playground.babylonjs.com/?BabylonToolkit#NIQ66P)

「中層の雲を抜けて景色が一変するパターン」
@[card](https://playground.babylonjs.com/?BabylonToolkit#NIQ66P#1)

尚、こちらでもレールテクスチャの表現は止めてます。レールの表現をするとレールがねじれてしまうことが確実にわかっているので試してもいませんｗ

### カメラワーク調整

以前の [Babylon.js：マルチカメラとビューポート分割（銀河鉄道デモ）](https://zenn.dev/fnamuoo/articles/910202f04ef987) と比べ、今回は地面があるため、少々問題が発生しました。

上部からの見下ろす分には問題ありませんが、「ドライバー視点」や「前方から見上げる視点」「定点」では、`カメラ位置が低すぎて地表の裏側まで見える` 状況でした。
まず最初の調整として、カメラ位置を少し高めに設定しなおします。
「ドライバー視点」の場合、列車のメッシュ自体が小さいので、カメラの視点(camera.lockedTarget)用のメッシュを先頭列車の前面上部に配置します。このテクニックは
[Babylon.js で物理演算(havok)：カートレース](https://zenn.dev/fnamuoo/articles/7af076bef4cc25) のワイプ画面でも使ってます。このときはバードビューの視点が低すぎたので、視線を上にあげるために不可視のメッシュを配置していました。

::::details カメラ視点調整用のメッシュ
```js
{
    // カメラ用のメッシュ
    let meshCamTrg = BABYLON.MeshBuilder.CreateBox("", {size:0.5});
    meshCamTrg.position.set(0, 0.25, -1);
    meshCamTrg.visibility = 0; // 不可視に
    meshCamTrg.parent = mesh;
    mesh._meshCamTrg = meshCamTrg;
}
```
::::

![](https://storage.googleapis.com/zenn-user-upload/5bdf34dbd3f0-20260416.jpg)
*カメラ（ドライバー視点）調整前*

![](https://storage.googleapis.com/zenn-user-upload/d8f905501846-20260416.jpg)
*カメラ（ドライバー視点）調整後*

### レール軌道を作成する

今回はレール軌道を自作します。
プログラムでコースを作る方法を応用して、ここから３Ｄのライン情報だけを抽出して「レール軌道」とします。「プログラムでコースを作る方法」については、過去でいくつか紹介しています。

- [スロープトイ：コース編](https://zenn.dev/fnamuoo/articles/de902f7fb73851)
- [Babylon.js で物理演算(havok)：パイプ内をボードで滑る](https://zenn.dev/fnamuoo/articles/9fd3c690e013d3)
- [Babylon.js で物理演算(havok)：パイプ内をボードで滑る（２）](https://zenn.dev/fnamuoo/articles/c328ed27f7f907)

レール軌道を作る際、列車のサイズ(width:0.5, height:0.5, depth:2)を意識していましたが、実際に列車を走らせてみるとミスマッチが発生しました。複線で並走／対向して走らせるつもりなのに やたら離れていたり、ホームを想定した軌道が思った以上に膨らんでいて「プラットフォームが広い」となっていたりと車両の大きさと合ったおらず、結局作り直しました。軌道を考えて作っているときは楽しいのですが、列車を動かしての確認も必要だと痛感した次第です。

## まとめ・雑感

本格的な [鉄道模型シミュレーター](https://www.imagic.co.jp/hobby/) にかなうわけもありません。なのでフリーで作れる「なんちゃって」ですが、素人にしてはよくできたと思いたいです。

リアルの鉄道模型のジオラマ／レイアウトって見かけますけど、今回と同じようなものをリアルで作ったらと思うと、手間（時間）、コスト（お金）、場所のことを考えて、ちょっと恐ろしくなりました。いったいいくらかかるのやら。

今回の列車は同じサイズで作っていたはずでしたが、新幹線もどきは思ったよりも横に広がっていました。丸角の列車と同じように配置して動かしてみると、すれ違う時に列車どうしが重なっていました。列車のサイズを小さくしたらメッシュ形状がちょっと変わってとんがり過ぎる事態に。結果、レール軌道を大きくすることで落ち着きました。いやぁ、統一規格って必要ですねｗ。もうすこし考えて列車（メッシュ）を作るべきでした。
レール軌道を作っているときもそうでしたが、ＧＵＩなんて高度なインタフェースがあるわけでもないので、「レール軌道をプログラムしては描画」を繰り返しているわけで、目視しながら直感で作ることができないことの弊害ですね。（モデリングツールを使いこなせば、設計ツールとして応用できるのかなぁ）



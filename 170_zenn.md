# Babylon.js で物理演算(Havok) ：ジャンプ・ゴルフ

## この記事のスナップショット

![](https://static.zenn.studio/user-upload/5e4e83813d33-20261006.gif)
*sample (4倍速)*

https://playground.babylonjs.com/?BabylonToolkit#FM10XD#1

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

## ソース

https://github.com/fnamuoo/webgl/blob/main/170

:::message
ローカルで動かす場合、上記ソースに加え、別途 git 内の [136/js](https://github.com/fnamuoo/webgl/tree/main/136/js) を ./js として配置してください。
:::

## 概要

ボールを「引っ張って、離す」だけのゴルフゲームを作りました。

物理演算(Havok)を使って、重力下でのボールの動き、摩擦・dampingによる運動エネルギーの減衰をさせています。しかし、ボールを回転させるだけでは、スライス・フック（右に曲げたり、左に曲げたり）させたり、バックスピンで止めたりすることができなかったので、力を加えてそれっぽく見せています。
さらに、パワー、スピン、クラブ、ボールを選択できるようにして様々な打ち方ができるようにしつつ、ホール数も全8ホールと少しは楽しめるようにしてみました。

## やったこと

- 遊び方
  - ボールの飛ばし方
  - 画面：アイコン説明
  - ホール説明
- 技術要素
  - 試作（生成AIのゴルフ）
  - ボールの動作
  - ホール
  - カメラ操作(飛翔感)

## 遊び方

### ボールの飛ばし方

ボールを飛ばすには、ボールをクリック／タップして、飛ばしたい方向と逆に引っ張り、リリースします。これを応用すれば壁際でも、横や後ろに飛ばすこともできます。ドラッグする方向・距離に応じて、ボールの飛行ラインを線で表示します。ただ、このラインは厳密には表現できていません。落下位置が微妙にズレていたり、パットの距離が違ったり、スライス・フックに対応していなかったりします。

![](https://static.zenn.studio/user-upload/6d7f173be263-20261006.gif)
*ボールを飛ばす操作*

ボールを飛ばさずにキャンセルするには、ドラッグを戻して、ボールに合わせてリリースしてください。

![](https://static.zenn.studio/user-upload/acb645f09be8-20261006.gif)
*キャンセル操作*
  
### 画面：アイコン説明

画面に配置してあるアイコンで様々な操作ができます。

アイコン | 選択肢 | 効果
---------|--------|---------------
パワー   | 1/2/5/10倍                 | 飛距離
スピン   | なし/トップ/バック/左/右   | 転がり・曲がり
クラブ   | ウッド/アイアン/パター     | 飛距離・打ち上げ角
ボール   | ゴルフ/シャトル/ボウリング | 質量・damping

####  パワー

ボールを飛ばすパワーを変化させます。1倍、2倍、5倍、10倍から選ぶことができます。

![](https://static.zenn.studio/user-upload/48bdbc1188e9-20261006.jpg)
*パワーアイコン*
        
![](https://static.zenn.studio/user-upload/feb36766ebec-20261006.gif)
*1倍時の飛距離 (4倍速)*

![](https://static.zenn.studio/user-upload/d2ccd924b811-20261006.gif)
*10倍時の飛距離 (4倍速)*
  
#### スピン

便宜上、「スピン」と呼称しますが、スピンをかけたような動き、前方により転がせたり、転がりにくくさせたり、左右にボールを曲げたりさせます。詳しくは後述しますが、回転による摩擦だけでは上手く動いてくれないので、力を加えて変化させています。

![](https://static.zenn.studio/user-upload/db71f80dbbf6-20261006.jpg)
*スピンアイコン*

![](https://static.zenn.studio/user-upload/01ad19e188ed-20261006.gif)
*スピンなし (2倍速)*

![](https://static.zenn.studio/user-upload/468cec519646-20261006.gif)
*トップスピン (2倍速)*

![](https://static.zenn.studio/user-upload/ea24810df250-20261006.gif)
*バックスピン (2倍速)*

![](https://static.zenn.studio/user-upload/c762f4f454f8-20261006.gif)
*左スピン (2倍速)*

![](https://static.zenn.studio/user-upload/cd0b65efcb5c-20261006.gif)
*右スピン (2倍速)*

#### クラブ

クラブに応じて飛距離、打ち上げ角度が変わります。
ゲームなので 3本（ウッド、アイアン、パター）に絞りました。

![](https://static.zenn.studio/user-upload/a25d511c53d5-20261006.jpg)
*クラブアイコン*
        
![](https://static.zenn.studio/user-upload/ad67844abef3-20261006.gif)
*ウッド (2倍速)*

![](https://static.zenn.studio/user-upload/7c10182e9f65-20261006.gif)
*アイアン (2倍速)*

![](https://static.zenn.studio/user-upload/52d979567ff1-20261006.gif)
*パター (2倍速)*

#### ボール

せっかくなので、物理特性の違うボールを 3種類用意しました。
普通のゴルフボール、空気抵抗で速度が減衰する（LinearDampingの効いた）シャトルのようなボール、質量の大きなボウリングの玉のようなボールです。使い分ける必要もない感じではありますが、それぞれの挙動を楽しんでいただけると幸いです。

![](https://static.zenn.studio/user-upload/3c1954ae8f56-20261006.jpg)
*ボールアイコン*

![](https://static.zenn.studio/user-upload/fdd3ec45996c-20261006.gif)
*ゴルフボール (2倍速)*

![](https://static.zenn.studio/user-upload/543ba2cef3de-20261006.gif)
*シャトル (2倍速)*

![](https://static.zenn.studio/user-upload/ecdeb3b4da8b-20261006.gif)
*ボウリングボール (2倍速)*

#### コントロール

情報表示（ホール情報）や、ホールの切り替え・リセットができるような機能を設けています。
「情報」といってもホール番号や現在の打数を表示する程度です。各ホールのスコアについては console.log に出力してはいるものの画面上に表示していないので、不十分です。
一方で、「前のホール」、「現在のホールのリセット（打数もリセット）」、「次のホール」にホールの切り替えができます。

![](https://static.zenn.studio/user-upload/3dbde2ddd972-20261006.jpg)
*コントロールアイコン（左より「情報」「前ホール」「リセット」「次ホール」）*

### ホール説明

全8ホールのうち3つを紹介します。

#### ホール1

ショートコースです。ウッドでは飛びすぎ、アイアンでは届かない距離です。
初心者向けにホールの奥に壁があるので、飛ばしすぎても跳ね返って安心です。

![](https://static.zenn.studio/user-upload/faa0f2580a28-20261006.jpg)
*ホール1*

#### ホール2

グリーンが浮島のようになっており、場外(OB)しやすいです。
ティーグランドからグリーンに乗せるにはアイアンのパワー2倍、バックスピンでいけると思います。

![](https://static.zenn.studio/user-upload/c606c4078972-20261006.jpg)
*ホール2*

#### ホール3

ロングコースです（ホール8ほどではないが長めのコース）。

![](https://static.zenn.studio/user-upload/9e9919099dfc-20261006.jpg)
*ホール3*

## 技術要素

今回のゴルフゲームの技術的な要素を説明します。

### 試作（生成AIのゴルフ）

生成AIでアイデア出しをして、その挙動を作らせてみたところ、いい感じのサンプルを作ってくれました。

```
// アイデアだし
babylon.js の Havok を使い、ゴルフのようにボールのジャンプのみで移動・目的地を目指すゲームを考えてください。
// サンプル作成
Babylon.jsとHavokで、マウスドラッグを使ってボールを引っ張って飛ばす（applyImpulse）具体的なコードの実装方法を教えてください。
```

Claude Sonnet 5 (エフォート高)で作成させたサンプル

https://playground.babylonjs.com/?BabylonToolkit#FM10XD

### ボールの動作

ボールを飛ばした後、転がりすぎないように、ボール自体に摩擦と damping を設定しつつも、フィールドにも摩擦を設定します。

スライス・フック（ボールを左右に曲げる）ことを考えたとき、ボールの回転だけでは曲がらないので、力を加えることで疑似的に曲がったように見せます。
トップスピンなら効きすぎるぐらいに転がりますが、バックスピンだといくら力を強くしても止まってくれません。なのでバックスピンに限っては後ろ向きに力を加えます。
左右や後ろ向きに力を加えるとき、力を加えすぎるとおかしな挙動になるので、レンダリングのループ回数で制限をかけています。ベストではないですが、暫定の手法として実装しています。

damping が強すぎると、シャトルのように減速して落下するだけになります。動きとして面白いので、性質の違うボールとして残します。同様に質量の大きなボールも用意してみましたが、十分に生かせるホールがなく死蔵になってます。

```js
// ゴルフボールの作成
let mesh = BABYLON.MeshBuilder.CreateSphere("", { diameter: 0.2 }, scene);
// ボールの摩擦(friction)、反射係数(restitution)、damping
mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, friction:0.6, restitution:0.1}, scene);
mesh.physicsBody.setLinearDamping(0.01);
mesh.physicsBody.setAngularDamping(10);
```

### ホール

フィールドには摩擦と反発係数を設定するだけです。フェアウェイとラフの違いを摩擦だけで作るのは難しいので断念しました。結果、フィールドはフェアウェイ想定です。おそらく地面（接地しているメッシュ）に応じて速度を減衰させるといった処理も入れないとダメな感じです。

グリーンは平面のみです。凹凸のグリーンは今後の課題です。一方でカップの穴は円柱型で切り抜いています。切り抜き方については CSG 機能の [Merging Meshes](https://doc.babylonjs.com/features/featuresDeepDive/mesh/mergeMeshes/) を参照してください。
また、カップで切り抜いただけでは場所が分かりにくいのでポールと旗をつけます。物理的な形状を持たせているので、某漫画のように旗包みはできないですが、旗にボールをぶつけることはできます。

![](https://static.zenn.studio/user-upload/f48cafddade9-20261006.gif)
*グリーン(カップインの様子) (2倍速)*

![](https://static.zenn.studio/user-upload/9ae43e7e7d50-20261006.gif)
*グリーン(旗包みもどき) (2倍速)*

バンカーの再現も試みました。楕円形で切り抜きつつも、エッジができるように中心を下方にずらして切り抜いています。結果、このエッジに引っかかってバンカーにとらわれることがあります。

![](https://static.zenn.studio/user-upload/5ca8986e532b-20261006.gif)
*バンカー (2倍速)*

### カメラ操作(飛翔感)

ボールをカメラで追いかけたいのですが、FollowCamera を使うとボールの姿勢／回転に応じてカメラも回転するので使いものになりません。

![](https://static.zenn.studio/user-upload/7af9059843cf-20261006.gif)
*FollowCameraの例*

ArcRotateCamera を使うと、手動で視点を変更でき、かつボールを追っかけることができ、悪くはないです。ただ、常に画面中央に捉えているので、動いている感じが弱いです。

![](https://static.zenn.studio/user-upload/82b30931dbd1-20261006.gif)
*ArcRotateCameraの例*

今回は ArcRotateCamera に工夫を加えました。
不可視のメッシュを用意して、不可視メッシュがボールを追っかけるように Lerp で遅延して移動するようにして、カメラは不可視メッシュを targetとします。これによりボールをやや遅れて追跡する FollowCameraのような動きになります。これだけで飛翔感が増します。
普通は [TrailMesh](https://doc.babylonjs.com/features/featuresDeepDive/mesh/trailMesh/) で軌跡をつけるのが定石な気がしますが、カメラ操作で飛翔感が表現できたので割愛しました。
このテクニックは、 [Babylon.js で物理演算(havok)：ドミノ倒しで一筆書き](https://zenn.dev/fnamuoo/articles/a395ed2578d0d4) の倒壊を追跡するカメラでも使っているので気になる方はこちらもどうぞ。

![](https://static.zenn.studio/user-upload/a8791df05360-20261006.gif)
*ArcRotateCamera改の例*

```js
// 視点の回転操作を可能とし、ボールを遅延させて追跡するカメラワークのカメラ生成コード
let bcrCamera54Ini = true;
let crCamera54 = function(meshTrg) {
    // ボール(meshTrg)を遅延させて追跡させるカメラワーク
    let mesh = BABYLON.MeshBuilder.CreateBox("", {size:0.01}); // ボールクリック時に選択しないよう小さくしておく
    mesh.visibility = 0; // 不可視（描画しない）
    let _camera = new BABYLON.ArcRotateCamera("Camera", 0,0,0, new BABYLON.Vector3(0, 1, -4), scene);
    _camera.setTarget(BABYLON.Vector3.Zero());
    _camera.attachControl(canvas, true);
    _camera.lockedTarget = mesh;
    _camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput"); // カーソルキーによる回転を削除
    _camera._type = 54;
    _camera._meshTrg = mesh;
    _camera._meshOrg = meshTrg;
    if (bcrCamera54Ini == true) {
        bcrCamera54Ini = false;
        scene.onBeforeRenderObservable.add((scene) => {
            if (camera._type == 54 && camera.lockedTarget != null) {
                // meshTrg を meshOrg に近づける
                let vlerp = 0.1;
                let vlv = BABYLON.Vector3.Lerp(camera._meshTrg.position, camera._meshOrg.position, vlerp);
                camera._meshTrg.position.copyFrom(vlv);
                // meshTrg とカメラ位置に応じて ヨー回転
                let myMesh = camera.lockedTarget;
                let vt = myMesh.position.subtract(camera.position).normalize();
                let rad = Math.atan2(vt.x, vt.z);
                camera.alpha = -rad - Math.PI/2;
            }
        })
    }
    return _camera;
}
```

カメラ            | 利点                     | 欠点
------------------|--------------------------|--------
FollowCamera      | 自動追従                 | ボールの回転に引きずられる
ArcRotateCamera   | 視点を手動で動かせる     | 常に中央で動きが弱い
ArcRotateCamera改 | 遅れて追従し飛翔感が出る | (特になし/要追記)


## まとめ・雑感

ゴルフを題材にしたゲームはたくさんあり、今更感が半端なく、恐縮です。
[Babylon.js で物理演算(Havok) ：ボール（摩擦）でコースを走ってみる](https://zenn.dev/fnamuoo/articles/459db73217d4ac)
に着想を得て、ボールをジャンプさせるゴルフゲームの素案を生成AIに作らせてみたら思いのほかよくできていたので、カスタマイズして仕上げてみました。
少々作りが荒いですが、テストプレイで楽しめたので自分的としては満足してます。

超ロングコース（ホール8）でかっ飛ばすとストレス解消になるかも？！

![](https://static.zenn.studio/user-upload/f7a293f28b5a-20261006.gif)
*ホール8 (10倍速)*



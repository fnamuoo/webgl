# Babylon.js で物理演算(havok)：タワーディフェンスのゲームをつくる

## この記事のスナップショット

プレイ画面（２倍速）  
![](https://storage.googleapis.com/zenn-user-upload/3e7da427ad12-20251114.gif)

https://playground.babylonjs.com/#3WMTIR

（コードを表示した場合でもツールバーの歯車マークから「EDITOR」のチェックを外せば画面いっぱいになります。）

ソース

https://github.com/fnamuoo/webgl/blob/main/103

ローカルで動かす場合、上記ソースに加え、別途 git 内の 069/js を追加して ./js に配置してください。

※最新版でglbの読み込み、APIの挙動が変わったようで playground版（上記URLの版）ではスナップショットにあるような EnergyBall（黄色いボール）の表示ができていません。m(_ _)m


## 概要

物理的にブロックを積み上げただけのタワーを守るタワーディフェンスです。
敵の攻撃（体当たり）を守るたびに層が増えていきます。更にタワーを守るための砲台をタワーに積み重ねるようにしました。

敵を迎撃する様子＋爆発のエフェクト  
![](https://storage.googleapis.com/zenn-user-upload/276dac654975-20251114.gif)

タワーが崩れる様子（２倍速）  
![](https://storage.googleapis.com/zenn-user-upload/6cc0d1c6a4fd-20251114.gif)


敵（ボール）の爆発のエフェクトに [Exploding Meshes](https://doc.babylonjs.com/features/featuresDeepDive/mesh/meshExploder/) を使います。

砲台は自動的に敵に向かって弾を発射します。砲台の向きが変わるたびに微妙に位置がずれてタワーが傾いてきます。そこでタワーに積み上がったブロックと砲台を整列する機能を設けています。また、このときのエフェクトに魔法陣のアニメを使ってます。

魔法陣  
![](https://storage.googleapis.com/zenn-user-upload/750fc8244ca1-20251114.gif)


## やったこと

- 塔をつくる（ブロック／砲台を積む）
- 発射のアルゴリズム
- 砲台の弾と敵（球）との当たり判定
- 塔の積み上げを整列させる
- ゲームっぽく仕上げる


### 塔をつくる（ブロック／砲台を積む）

砲台は簡単に、球と直方体で作成します。
「ノーマル」「速射」「長距離」の種類を用意しました。

砲台（ノーマル）  
![](https://storage.googleapis.com/zenn-user-upload/c97b0335f2c0-20251114.jpg)

砲台（速射）  
![](https://storage.googleapis.com/zenn-user-upload/fbff1720b0c9-20251114.jpg)

砲台（長距離）  
![](https://storage.googleapis.com/zenn-user-upload/a7954f134b1b-20251114.jpg)

砲台に合わせて砲弾の形状やサイズ、発射速度（砲弾に加える力）を変えてます。

### 発射のアルゴリズム

砲台の射程距離に入ったら砲弾を発射します。
距離の判定に、射程距離と同じ大きさの（見えない）球を作成し、この不可視のメッシュと敵メッシュとの交差(intersectsMesh)で判定します。

### 砲台の弾と敵（球）との当たり判定

砲弾と敵との当たり判定には、上記と同じメッシュの交差(intersectsMesh)で判定します。しかし、お互いに物理形状をもっているのでこの判定では100%ではなく、たまに失敗、ぶつかったと判定するまえに弾き飛ばすことがあります。逆にこの動作が「クリティカルヒット」っぽく、面白いのでそのままとしています。
もし物理系の衝突を正しく検知したいなら、[Collisions](https://doc.babylonjs.com/features/featuresDeepDive/physics/collisionEvents/)にあるように onTriggerCollisionObservable を使うべきと思います。

### 塔の積み上げを整列させる

塔はブロックや砲台を縦に重ねているだけです。なので砲台が方向転換するたびに少しずつズレてきます。これを放置すると自壊するので、手動のコマンド（スペースキー）もしくは右下のアイコンでブロック／砲台を整列、中心位置（x=0,z=0）に座標を修正するようにしています。ただ修正するだけでは物足りないのでエフェクトとして、[The Meshes Library](https://doc.babylonjs.com/toolsAndResources/assetLibraries/availableMeshes/)にある、[Trail Mesh Spell](https://playground.babylonjs.com/#AAP917#39)の魔法陣を使います。
これをアニメーション機能で塔の下から上まで移動させます。変化させるパラメータは位置(osition)と大きさ(scaling)になります。

魔法陣が移動している様子  
![](https://storage.googleapis.com/zenn-user-upload/750fc8244ca1-20251114.gif)

上記のメッシュライブラリには EnergyBall があるのでこちらも利用して、ブロックの内部に配置してます。ただ、魔法陣も EnergyBall も動的に作成する方法がわからなかったので、メッシュデータ(glb)を読み込んだときに作成したを使いまわすようにしています。
~~今回複数のメッシュを読み込むために AssetsManager を使っているのですが、それぞれ addContainerTask と addMeshTask で読み込まないとメッシュが動かない・表示されるだけということがありました。~~(バージョンが変わって挙動が変わった様子)
この辺の情報が少なくて難儀しています。

### ゲームっぽく仕上げる

ここまでの作りこみで基本骨格はできたので、ゲームっぽく仕上げるためにブラッシュアップしていきます。

- スコアの導入
  - 敵を倒したり、守り切れたらスコアに加算して、砲台の設置や塔の整列でスコアを減算します。

- GUI／アイコンの設置
  - 入力イベントにはキーボードからの他に、アイコンをクリックしたときにも同様とします。
  - 砲台の設置には一定上のスコア値と必要とさせ、基準に満たない（設置できない）ときは、アイコンのalpha値を小さくしてグレー（無効）っぽく見せてます。

画面上のアイコン  
![](https://storage.googleapis.com/zenn-user-upload/a464ed8ff7d2-20251114.png)

## まとめ・雑感

敵のバリエーションを増やすところまでは手が回りませんでした。

今回、敵をやっつけたとき、タワーからブロック／砲台が落下したときのエフェクトに Exploding Meshes を使いました。
見た目にこだわらなければ／同じように演出できるなら[Particle System](https://doc.babylonjs.com/features/featuresDeepDive/particles/particle_system/)が軽く、様々なエフェクトもつけやすい気がします。

心残りは glb の読み込みの挙動が変わったこと。
自分の環境の babylonjs では上手く動いていたのに playgroundに貼り付けたら動かない（泣
公開直前に気づくなんて。すぐに直せそうにないのでこのまま公開することにします。ごめんなさい。
近いうちに自分の環境のアップデートが必要っぽい。


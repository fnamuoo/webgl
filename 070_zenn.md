# Babylon.js で物理演算(havok)：パイプ内をボードで滑る

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/3c4d933d0cfb-20250508.jpg)

ボール版
https://playground.babylonjs.com/full.html#J2AMBS

ボード版
https://playground.babylonjs.com/full.html#J2AMBS#1

（コードを見たい人はURLから `full.html` を消したURLを指定してください）

ソース

https://github.com/fnamuoo/webgl/blob/main/069

- 070_slide2_ball  .. ボール版
- 070_slide3_board .. ボード版

ローカルで動かす場合、 ./js 以下のライブラリは 069/js を利用してください。

## 概要

前回、滑り台を作ったものの、自機をキャラクターコントローラーにしていたので、「すべる」ということがいまいちでした。そこで今回は、自分が滑りおりることに注力して、ボールにしたり楕円形にしたりしてみました。

ボール  
![](https://storage.googleapis.com/zenn-user-upload/5c4a25dd9b0e-20250508.jpg)

ボード  
![](https://storage.googleapis.com/zenn-user-upload/3c4d933d0cfb-20250508.jpg)

## やったこと

- ボールで転がる
- カプセルですべる（失敗）
- 楕円形ですべる

### ボールで転がる

手始めにボールで転がってみます。
挙動としては、以前つくった[ボーリング](https://zenn.dev/fnamuoo/articles/e5f208a4cfd641)と同様に、ボールに回転(applyAngularImpulse)させて移動します。

ここでちょっと問題が発生します。ボーリングの時はカメラの相対位置が固定だったのでボールの回転軸は固定でしたが、今回はボールの進行方向の背後からカメラが追いかける挙動（前回の記事のFreeCameraの説明）なので、カメラ位置に応じて回転軸も変化させることにします。つまりカメラ位置とボールの位置関係から進行方向を定め、進行方向から９０度回転したピッチ角の軸で前後に回転、進行方向の軸／ロール角で左右に回転させることにします。

```js
if (map["w"] || map["ArrowUp"]) {
    // 進行方向に対し、前回転
    let vdir = camera.position.subtract(myMesh.position).normalize().scale(-vforce);
    vdir = vdir.applyRotationQuaternion(qYR90);
    myMesh.physicsBody.applyAngularImpulse(vdir);
} else if (map["s"] || map["ArrowDown"]) {
    // 進行方向に対し、後ろ回転
    let vdir = camera.position.subtract(myMesh.position).normalize().scale(vforce);
    vdir = vdir.applyRotationQuaternion(qYR90);
    myMesh.physicsBody.applyAngularImpulse(vdir);
}
if (map["a"] || map["ArrowLeft"]) {
    // 進行方向に対し、その向きで左回転
    let vdir = camera.position.subtract(myMesh.position).normalize().scale(-vforce);
    myMesh.physicsBody.applyAngularImpulse(vdir);
} else if (map["d"] || map["ArrowRight"]) {
    // 進行方向に対し、その向きで右回転
    let vdir = camera.position.subtract(myMesh.position).normalize().scale(vforce);
    myMesh.physicsBody.applyAngularImpulse(vdir);
}
...
```

下りでは加速させて下ることができたのでとりあえずＯＫかな。

ただ上りはノロノロになりますが登れます。傾斜がキツイのか、回転が足りないのか、質量が重いのか。
でもまぁ最低限はクリアできたのでここまでとします。

ボールで転がる（４倍速）  
![](https://storage.googleapis.com/zenn-user-upload/5229a8dedf78-20250508.gif)

### カプセルですべる（失敗）

ボブスレーっぽく滑りたく、メッシュをカプセル形状にしてみましたが失敗。

まー回る回る、長軸での回転だけでなく向きもコロコロと。後者はカプセルをもっと長くすれば回避できそうですが、長軸で回転／上下が簡単にひっくり返ってしまうのはちょっと。
でも結果、「球をつぶして楕円形にすればいけるかも」という光明が見えました。

カプセルでころころ回る（４倍速）  
![](https://storage.googleapis.com/zenn-user-upload/474a1c9eb378-20250508.gif)

### 楕円形ですべる

楕円形（ボード状）にしてすべらせたところ、いい感じだったのでブラッシュアップしていきます。

すべることが目的なので摩擦は小さめ／すべりやすく設定（friction: 0.1）。
PhysicsShapeType.MESHだと動きがガタガタするので CONVEX_HULL にしてます。
また、形状の上下がわかりやすいように material のグラデーションで色付けしてます。

```js
// Player/楕円形
let myMesh = BABYLON.MeshBuilder.CreateSphere("target", { diameterX: 1.0, diameterY: 0.5, diameterZ: 4.0, segments: 8 }, scene);
let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, friction: 0.1, restitution:0.05}, scene);

let mat = new BABYLON.GradientMaterial("grad", scene);
mat.topColor = new BABYLON.Color3(1, 1, 1);
mat.bottomColor = new BABYLON.Color3(1, 0.6, 0.6);
mat.smoothness = -0.1;
myMesh.material = mat;
```

自機（楕円形）  
![](https://storage.googleapis.com/zenn-user-upload/3142e704f8f9-20250508.jpg)

何度かすべらせてみて、自機に対する挙動／操作は下記でよさそう。

- ヨー回転／進行方向の向きを左右に（カーソル左右）
- ロール回転／上下ひっくり返ったときに（カーソル左右＋上）
- 前後を180度回転／スタート時に前後逆なときに（キーr）

キーの割り当てについてですが、ヨー回転で自機の向きをコースにあわせるといい感じにすべれるのがわかったので、一旦ヨー回転をしやすいキーを選んで割り当ててます。ロール回転もコーナリングに必要なのか判断できてないのですが、迷いつつもちょっと面倒な割り当て（２つのキーを同時押し）にしてます。

ステージについては、前の記事（キャラクターコントローラー）の段階ではチューブの断面にわざと凸凹感をだして６角にしてましたが、円に近づけた方がカーブでせりあがるので64角（tessellation: 64）に戻しました。

あと、らせんのステージで傾斜の角度を調整してます。
半径が大きくなるほど水平に近かったので、しっかりすべりだすよう傾き(r**2の項)をいれました。

```js
x = r*Math.cos(irad); y = i*stepy + (r**2)*0.05 + adjy; z = r*Math.sin(irad);
```

ボール（３個）と一緒にすべったときに、ボールにぶつかってなかなか抜けないので、ボールとボードはすり抜けるようfilterCollideMask を設定しています。すり抜けるよりぶつかった方が良いかは下記のコメントを入れ替えてください。

```js
// ボール側設定
// trgAgg.shape.filterCollideMask = FILTER_GROUP_GROUND | FILTER_GROUP_TUBE | FILTER_GROUP_BOARD; // ボードとの衝突あり
trgAgg.shape.filterCollideMask = FILTER_GROUP_GROUND | FILTER_GROUP_TUBE; // ボードとの衝突なし

// 自機側設定
// myAgg.shape.filterCollideMask = FILTER_GROUP_BALL | FILTER_GROUP_GROUND | FILTER_GROUP_TUBE; //ballと衝突あり
myAgg.shape.filterCollideMask = FILTER_GROUP_GROUND | FILTER_GROUP_TUBE; //ballと衝突なし
```

ボードですべってみる（ボール無し）（４倍速）  
![](https://storage.googleapis.com/zenn-user-upload/ffd3244ac0a5-20250508.gif)

ボードですべってみる（ボールあり）（４倍速）  
![](https://storage.googleapis.com/zenn-user-upload/0f5f92fc2e82-20250508.gif)

倍速再生だと乗り物酔いしそうで申し訳ないです。
アップの都合上、ファイルサイズと再生時間のジレンマで仕方なく。

## まとめ・雑感

ボールは思った通りの挙動で、まぁ可もなく不可もなくという感じでしょうか。
ボードの方は、バランスゲームぽくなって面白い仕上がりになったかなと思いますがいかがでしょうか。

すべった感じ、ステージの難度は下記のような感じです。
乱数（左右）のステージはボードの向きとコースがそろうとスムーズにすべれて楽しいです。
乱数（直線＋左右）だと、直線あとのクランク（左右）があるとスピードが乗りすぎて、切り返しが間に合わず激突することが何度もあって難しいです。ちょいブレーキ（カーソル下／s）を入れるとよいかな。

```txt
（初級）＝コイル　＜　らせん ＜　乱数で左右　＜　乱数で直進＋左右＝（上級）
```

最後に少しだけ。  
ボードがすべりすぎて難しいという方は LinearDamping に 0.03 くらいを設定すると扱い易くなります。逆に摩擦(friction=0.08)をもっと小さくするとスピードがでて扱いずらくなります。レッツ魔改造！

```js
let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.CONVEX_HULL, { mass: 1, friction: 0.08, restitution:0.05}, scene);
let linearDampingBase = 0.0; // 0.03;  // スピードが乗りすぎるときはこちらで調整
let linearDampingBrake = 2; // ブレーキ時
```


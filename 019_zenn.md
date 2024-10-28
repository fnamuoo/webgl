# Three.js Cannon.es 調査資料 - Constraint確認／ConeTwistConstraint

## この記事のスナップショット

ConeTwistConstraintの挙動
![](https://storage.googleapis.com/zenn-user-upload/922fc9d15af6-20241029.jpg)

ソース

https://github.com/fnamuoo/webgl/blob/main/019

動かし方

- ソース一式を WEB サーバ上に配置してください
- 各種操作
  - 'q' .. アンカーをx軸正に回転
  - 'a' .. アンカーをx軸負に回転
  - 'w' .. アンカーをy軸正に回転
  - 's' .. アンカーをy軸負に回転
  - 'e' .. アンカーをz軸正に回転
  - 'd' .. アンカーをz軸負に回転
  - マウス操作 .. カメラ位置の変更

## 概要

- ConeTwistConstraint の挙動を確認します。

## CANNON の制約(constraint)

物理エンジン Cannon.es において古典力学のふるまい、とりわけ2つの物体の動きを制限するものとして下記があります。

クラス名               | 説明・例
-----------------------|-----------------------------
Spring                 | バネ
DistanceConstraint     | 中心同士を一定の長さで固定。
PointToPointConstraint | 点結合。振り子。
LockConstraint         | 点で固定。
HingeConstraint        | 軸結合。扉のちょうつがい。回転モーター。
ConeTwistConstraint    | 扇型の稼働＋ひねり。ragdoll の関節。

残念ながら平行移動（slider）はサポートされてないようです。

今回は ConeTwistConstraint について取り上げます。

## やったこと

ConeTwist の予備知識なく、とりあえずパラメーターをいろいろいじって、動きを確認しようと思ったのですが難解でした。お手上げです。どうしてこのような動きになるのかわかりません。
とりあえず、試したことを示します。

回転軸（axisA, axisB）を (1,0,0) に固定にして、物体の配置も軸方向に串刺しする方向に直列にならべ、扇の可動域（angle）とひねり（twistAngle）の組み合わせを次のように配置しています。

視野の左右の配置として、

- 扇の可動域（angle）を PI/2（=90度） .. 左から1つ目（左端）
- 扇の可動域（angle）を PI/3（=60度） .. 左から2つ目
- 扇の可動域（angle）を PI/6（=30度） .. 左から3つ目
- 扇の可動域（angle）を PI/36（=5度）.. 左から4つ目（右端）

さらに奥行き方向の配置として、

- ひねり（twistAngle）を 0 .. 手前
- ひねり（twistAngle）を PI/6（=30度） .. 中間
- ひねり（twistAngle）を PI/3（=60度） .. 最奥

これを x軸、y軸、z軸ごとに行い、手前、中、最奥に配置しました。

ConeTwistConstraint の使い方は、繋ぎたい2つのオブジェクトの他にオプションとして扇の可動域（angle）、回転軸（axisA, axisB）、接続位置（pivotA, pivotB）、ひねり（twistAngle）を指定できます。

下記では1番目（左端、手前）の例を示します。

```js
  const moBox1AShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  const moBox1ABody = new CANNON.Body({ mass: 0, shape: moBox1AShape, position: new CANNON.Vec3(-10, 5, 10) })
  world.addBody(moBox1ABody)
  const viBox1AGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox1AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox1AMesh = new THREE.Mesh(viBox1AGeo, viBox1AMtr);
  viBox1AMesh.position.copy(moBox1ABody.position);
  viBox1AMesh.quaternion.copy(moBox1ABody.quaternion);
  scene.add(viBox1AMesh);
  //
  const moBox1BShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
    // 適当な初期位置を与えても、制約に準じた位置に強制移動されるが、実装依存になる
  const moBox1BBody = new CANNON.Body({ mass: 1, shape: moBox1BShape, position: new CANNON.Vec3(-14, 5, 10) })
  world.addBody(moBox1BBody)
  const viBox1BGeo = new THREE.BoxGeometry(2, 2, 2);
  const viBox1BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox1BMesh = new THREE.Mesh(viBox1BGeo, viBox1BMtr);
  viBox1BMesh.position.copy(moBox1BBody.position);
  viBox1BMesh.quaternion.copy(moBox1BBody.quaternion);
  scene.add(viBox1BMesh);
  // 
  const moBox1Const = new CANNON.ConeTwistConstraint(moBox1ABody, moBox1BBody, {
      angle: Math.PI/2, // PI/2=90[degree] の2倍が 可動域（扇）
      axisA: new CANNON.Vec3(1, 0, 0),  // bodyAから見た 回転軸
      axisB: new CANNON.Vec3(1, 0, 0),  // bodyB の回転軸（ローカル)
      pivotA: new CANNON.Vec3(-2, 0, 0),
      pivotB: new CANNON.Vec3( 2, 0, 0),
      twistAngle: 0,  // 可動域（扇）のひねり角
    });
  world.addConstraint(moBox1Const);
  moBox1BBody.applyImpulse(new CANNON.Vec3(-1, 0, 0), new CANNON.Vec3( 0, 0, 1));
  // 接続線の表示
  const viBox1Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viBox1Points = [];
  viBox1Points.push( moBox1ABody.position );
  viBox1Points.push( moBox1ABody.position.vadd(new CANNON.Vec3(-2, 0, 0)) );
  viBox1Points.push( moBox1BBody.position );
  const viBox1Geo = new THREE.BufferGeometry().setFromPoints(viBox1Points);
  const viBox1Line = new THREE.Line(viBox1Geo, viBox1Mtr);
  scene.add(viBox1Line);
```

アンカーを回転させて動きを確認きるようにしています。
 qキー、aキーでx軸回転、
 wキー、sキーでy軸回転、
 eキー、dキーでz軸回転させることができます。

制約（constraint）についての調査・確認はここまでとしておきます。

次は車をトラック、コンテナ付にしてみます。


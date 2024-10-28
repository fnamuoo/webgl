# Three.js Cannon.es 調査資料 - Constraint確認／PointToPointConstraint

## この記事のスナップショット

DistanceConstraintの挙動
![](https://storage.googleapis.com/zenn-user-upload/d762d8e0b838-20241029.jpg)

ソース

https://github.com/fnamuoo/webgl/blob/main/016

動かし方

- ソース一式を WEB サーバ上に配置してください
- マウス操作 .. カメラ位置の変更

## 概要

- PointToPointConstraint の挙動を確認します。

## CANNON の制約(constraint)

物理エンジン Cannon.es において古典力学のふるまい、とりわけ2つの物体の動きを制限するものとして下記があります。

クラス名               | 説明・例
-----------------------|-----------------------------
Spring                 | バネ
DistanceConstraint     | 中心同士を一定の長さで固定。
PointToPointConstraint | 点結合。振り子。
LockConstraint         | 固定。
HingeConstraint        | 軸結合。扉のちょうつがい。回転モーター。
ConeTwistConstraint    | 軸結合＋ひねり。ragdoll の関節。

残念ながら平行移動（slider）はサポートされてないようです。

今回は PointToPointConstraint について取り上げます。

## やったこと

まず5つの状態を用意しました。

- 球同士を横につなぐように、側面に結合位置をおく .. 左から1つ目（左端）
- 立方体を上下につなぐように、片方の底面と片方の上面に結合位置をおく .. 左から2つ目
- 立方体を左右につなぐように、側面に結合位置をおく .. 左から3つ目（中央）
- 立方体を左右につなぎつつも、側面から離れた位置でに結合する .. 左から4つ目
- 立方体を左右につなぐように、側面に結合位置をおく。ただし初期位置を適当＋外力を与えておく .. 左から5つ目（右端）

PointToPointConstraint の使い方は、繋ぎたい2つのオブジェクトを指定し、さらに結合する位置をそれぞれのオブジェクトからのベクトルで指定します。

下記では1番目（球を横につなげる）の例を示します。ここではアンカー（固定）となるmoObj1ABodyの表面 [-radius, 0, 0] の位置ともう1つのオブジェクトmoObj1BBodyの表面 [radius, 0, 0] の位置で結合させます。

```js
  const radius = 1;
  const moObj1AShape = new CANNON.Sphere(radius);
  const moObj1ABody = new CANNON.Body({mass: 0, shape: moObj1AShape, position: new CANNON.Vec3(-10, 5, 0)});
  world.addBody(moObj1ABody)
  const viObj1AGeo = new THREE.SphereGeometry(radius, 6, 6);
  const viObj1AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viObj1AMesh = new THREE.Mesh(viObj1AGeo, viObj1AMtr);
  viObj1AMesh.position.copy(moObj1ABody.position);
  viObj1AMesh.quaternion.copy(moObj1ABody.quaternion);
  scene.add(viObj1AMesh);
  //
  const moObj1BShape = new CANNON.Sphere(radius);
  const moObj1BBody = new CANNON.Body({mass: 1, shape: moObj1BShape, position: new CANNON.Vec3(-11, 1, 0)});
  world.addBody(moObj1BBody)
  const viObj1BGeo = new THREE.SphereGeometry(radius, 6, 6);
  const viObj1BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viObj1BMesh = new THREE.Mesh(viObj1BGeo, viObj1BMtr);
  viObj1BMesh.position.copy(moObj1BBody.position);
  viObj1BMesh.quaternion.copy(moObj1BBody.quaternion);
  scene.add(viObj1BMesh);
  //
  const moObj1Const = new CANNON.PointToPointConstraint(
      moObj1ABody, new CANNON.Vec3(-radius, 0, 0),
      moObj1BBody, new CANNON.Vec3( radius, 0, 0),
  );
  world.addConstraint(moObj1Const);
```

1つ目の球の表面でつなげた場合、あそびが発生するのか、つなげた球が重力に引かれてやや下がっています。

2つ目の立方体を上下につなげた場合、ぴったりとつながってます。ただ時間がたつと動きに揺らぎが発生するのかつながったままひねりが生じてきます。PointToPointConstraint は点でつながり、ここでは面同士を点でつなげているので、つなげた点で回転するのは納得で、回転軸があるようにふるまいます。

3つ目の立方体を左右につなげた場合、片方が回転していますが、これは回転が加わるように力を加えているためです。この外力がないと横につながったままで、時間とともに少しずつひねりが生じるのは 2つ目と同様です。

```js
  moBox3BBody.applyImpulse(new CANNON.Vec3(0, 1, 0), new CANNON.Vec3(0, 0, 1));
```

4つ目は距離をおいて立方体をつなげた場合です。もともと点でつなげているので、振り子のような自由度のある動きをします。4つ目は両方のオブジェクトから離れた点でつないでいるので、ランプや提灯のような動きですが、アンカーからの距離を0にしてつないだ場合は振り子のような動きになります。（4つ目奥に配置）

```js
  const moBox5Const = new CANNON.PointToPointConstraint(
      moBox5ABody, new CANNON.Vec3(0, 0, 0),  // アンカー側の距離を０にする
      moBox5BBody, new CANNON.Vec3(0, 0, -3),
  );
  world.addConstraint(moBox5Const);
```

5つ目は立方体を横につなげる場合ですが、初期位置がズレていたり、大きな外力かかっていた場合です。開始直後は離れていますが、つながろうとする強制力がすぐに働いて、くっついた状態になります。
ただし、強制的につなげる都合なのか運動エネルギー？がそのまま回転運動に反映されてしまうようです。

次はLockConstraintを扱います。


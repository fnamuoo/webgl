# Three.js Cannon.es 調査資料 - バネの挙動確認

## この記事のスナップショット

バネの挙動
![](https://storage.googleapis.com/zenn-user-upload/890253bd0efe-20241027.jpg)

ソース

https://github.com/fnamuoo/webgl/blob/main/014

動かし方

- ソース一式を WEB サーバ上に配置してください
- マウス操作 .. カメラ位置の変更

## 概要

- バネの挙動を確認します。

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

今回は Spring について取り上げます。

## やったこと

4つの状態を用意しました。

- バネを付けなかったとき .. 左に配置
- バネを付けたとき（中心につけたとき）.. 中央手前に配置
- バネを付けたとき（端につけたとき）.. 右に配置
- バネを付けたとき（中心につけたとき＆減衰を0）.. 中央奥に配置

バネの付け方は簡単で、2つのオブジェクト（CANNON.Body）を引数にCANNON.Springを作成し、描画の更新（animete()）時にapplyForce()を呼び出すだけです。

ただ、このままではバネが表示されないので、バネでつないだ2つのオブジェクトの重心どうしに線を引いて、バネを可視化します。

尚、2つのオブジェクトの内、上にあるものを固定（mass=0）しておきます。

下記では2番目（中心位置にバネでつなげた場合）を示します。

```js
  const moBox2AShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
  const moBox2ABody = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(0, 6, 0) })
  moBox2ABody.addShape(moBox2AShape)
  world.addBody(moBox2ABody)
  const viBox2AGeo = new THREE.BoxGeometry(4, 1, 2,  4, 1, 2);
  const viBox2AMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox2AMesh = new THREE.Mesh(viBox2AGeo, viBox2AMtr);
  viBox2AMesh.position.copy(moBox2ABody.position);
  viBox2AMesh.quaternion.copy(moBox2ABody.quaternion);
  scene.add(viBox2AMesh);
  //
  const moBox2BShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1))
  const moBox2BBody = new CANNON.Body({ mass: 1, position: new CANNON.Vec3(0, 1, 0) })
  moBox2BBody.addShape(moBox2BShape)
  world.addBody(moBox2BBody)
  const viBox2BGeo = new THREE.BoxGeometry(4, 1, 2,  4, 1, 2);
  const viBox2BMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viBox2BMesh = new THREE.Mesh(viBox2BGeo, viBox2BMtr);
  viBox2BMesh.position.copy(moBox2BBody.position);
  viBox2BMesh.quaternion.copy(moBox2BBody.quaternion);
  scene.add(viBox2BMesh);
  // バネを付ける
  const moSpringBox2 = new CANNON.Spring(moBox2ABody, moBox2BBody, {
    restLength: 2,
    stiffness: 18,
    damping: 1,
  })
  // バネの可視化
  const viSpringBox2Mtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viSpringBox2Points = [];
  viSpringBox2Points.push( moBox2ABody.position );
  viSpringBox2Points.push( moBox2BBody.position );
  const viSpringBox2Geo = new THREE.BufferGeometry().setFromPoints(viSpringBox2Points);
  const viSpringBox2Line = new THREE.Line(viSpringBox2Geo, viSpringBox2Mtr);
  scene.add(viSpringBox2Line);
```

描画の更新では、オブジェクトの位置（position）、姿勢（quaternion）を更新しつつ、
バネも更新（applyForce）し、バネの表示も更新します。

```js
  function animate() {
    requestAnimationFrame(animate)

    const timeStep = 1 / 60;
    world.step(timeStep)

    viBox2AMesh.position.copy(moBox2ABody.position);
    viBox2AMesh.quaternion.copy(moBox2ABody.quaternion);
    viBox2BMesh.position.copy(moBox2BBody.position);
    viBox2BMesh.quaternion.copy(moBox2BBody.quaternion);
    moSpringBox2.applyForce();
    viSpringBox2Points[1].copy(moBox2BBody.position);
    viSpringBox2Geo.setFromPoints(viSpringBox2Points);
```

## 動かしてみる

バネのないものはそのまま床に落下。

バネが中心にあるものは、姿勢を保ったまま上下に動き、やがて停止。

バネが端についたものは不規則に姿勢を変えながら上下しつつ、やがて停止。

最後にバネの減衰がない（damping=0）のものが動き続ける。

という結果でした。

実はバネの減衰の他にもオブジェクトの移動の抵抗なし（linearDamping=0, angularDamping=0）にしたものの、何かの抵抗が働いているようで振動が減衰して止まっていました。ただこの摩擦がどこからくるものなのかわからなかったので、仕方なく質量を重く（mass=2000）、バネの弾性係数を強く（stiffness=18000）することで回避しています。

次は DistanceConstraint を扱います。


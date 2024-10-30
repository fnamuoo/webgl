# Three.js Cannon.es 調査資料 - 車をショベルカー(アーム２節とバケット)に

## この記事のスナップショット

ショベルカー
![](https://storage.googleapis.com/zenn-user-upload/5f85f2031d97-20241030.jpg)
    
ソース

https://github.com/fnamuoo/webgl/blob/main/022

動かし方

- ソース一式を WEB サーバ上に配置してください
- 車の操作法
  - カーソル上 .. アクセル
  - カーソル下 .. バック
  - カーソル左、カーソル右 .. ハンドル
  - 'b' .. ブレーキ
  - 'c' .. カメラ視点の変更
  - 'w' .. 腕（1）の回転（車側の腕を上げる）
  - 's' .. 腕（1）の回転（車側の腕を下げる）
  - 'e' .. 腕（2）の回転（バケット側の腕を上げる）
  - 'd' .. 腕（2）の回転（バケット側の腕を下げる）
  - 'r' .. バケットの回転（バケットを上げる）
  - 'f' .. バケットの回転（バケットを下げる）
  - 'g' .. 回転台の回転（右回転）
  - 'a' .. 回転台の回転（左回転）
  - マウス操作 .. カメラ位置の変更

## 概要

- 車をショベルカーにします。
- RaycastVehicle に回転台とアームを2本、さらにバケットもどきを付けます。

## やったこと

ショベルカーは、回転台、腕2つ、バケットから構成します。
結合・回転を制御するヒンジを4つ設けます。

- 車と回転台のY軸回転（方位角）
- 回転台と腕（1）のZ軸回転（仰角）
- 腕（1）と腕（2）のZ軸回転（仰角）
- 腕（2）とバケットのZ軸回転（仰角）

バケットは簡単にするため、四角い面4つで構成します。

```js
  const moShovelMtr = new CANNON.Material('cannon')

  // 回転台
  const moShovelfoundShape = new CANNON.Box(new CANNON.Vec3(0.4, 0.2, 0.4))
  const moShovelfoundBody = new CANNON.Body({
      mass: 0.2,
      shape: moShovelfoundShape,
      position: new CANNON.Vec3(0, 5, 0),
      // type: CANNON.Body.KINEMATIC,
      collisionFilterGroup: 0,  // 回転台と腕が埋まる／重なるように
      material: moShovelMtr,
  })
  world.addBody(moShovelfoundBody)
  const viShovelfoundGeo = new THREE.BoxGeometry(0.8, 0.4, 0.8);
  const viShovelfoundMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viShovelfoundMesh = new THREE.Mesh(viShovelfoundGeo, viShovelfoundMtr);
  viShovelfoundMesh.position.copy(moShovelfoundBody.position);
  viShovelfoundMesh.quaternion.copy(moShovelfoundBody.quaternion);
  scene.add(viShovelfoundMesh);

  // 車体と回転台をヒンジ（旋回方向）でつなぐ
  const moVehicleShovelfoundConst = new CANNON.HingeConstraint(moChassisBody, moShovelfoundBody, {
      axisA: CANNON.Vec3.UNIT_Y,
      axisB: CANNON.Vec3.UNIT_Y,
      pivotA: new CANNON.Vec3(0, 0.5, 0),
      pivotB: new CANNON.Vec3(0, -0.2, 0),
  });
  world.addConstraint(moVehicleShovelfoundConst);
  moVehicleShovelfoundConst.enableMotor();


  // 腕（１）
  const moArm1Shape = new CANNON.Box(new CANNON.Vec3(2.2, 0.1, 0.1))
  const moArm1Body = new CANNON.Body({
      mass: 0.001,
      shape: moArm1Shape,
      position: new CANNON.Vec3(-2.2, 7, 0),
      // collisionFilterGroup: 0,  // 腕が車体に埋まらないよう comment out
      material: moShovelMtr,
      // angularDamping: 0.99, // def=0.01,  // これでは 腕が徐々に下がるのを制御できない
      // linearDamping: 0.99, // def=0.01,
  })
  world.addBody(moArm1Body)
  const viArm1Geo = new THREE.BoxGeometry(4.4, 0.2, 0.2);
  const viArm1Mtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viArm1Mesh = new THREE.Mesh(viArm1Geo, viArm1Mtr);
  viArm1Mesh.position.copy(moArm1Body.position);
  viArm1Mesh.quaternion.copy(moArm1Body.quaternion);
  scene.add(viArm1Mesh);

  const moVehicleArm1Const = new CANNON.HingeConstraint(moShovelfoundBody, moArm1Body, {
      axisA: CANNON.Vec3.UNIT_Z,
      axisB: CANNON.Vec3.UNIT_Z,
      pivotA: new CANNON.Vec3(0, 0, 0),
      pivotB: new CANNON.Vec3(2, 0, 0), // 重心からずらして結合すると、砲身が徐々に下がる（重さmassにも関係
  });
  world.addConstraint(moVehicleArm1Const);
  moVehicleArm1Const.enableMotor();

  // 腕（２）
  const moArm2Shape = new CANNON.Box(new CANNON.Vec3(2.2, 0.1, 0.1))
  const moArm2Body = new CANNON.Body({
      mass: 0.001,
      shape: moArm2Shape,
      position: new CANNON.Vec3(-6.6, 7, 0),
      // collisionFilterGroup: 0,  // 腕が車体に埋まらないよう comment out
      material: moShovelMtr,
      // angularDamping: 0.99, // def=0.01,  // これでは 腕が徐々に下がるのを制御できない
      // linearDamping: 0.99, // def=0.01,
  })
  world.addBody(moArm2Body)
  const viArm2Geo = new THREE.BoxGeometry(4.4, 0.2, 0.2);
  const viArm2Mtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viArm2Mesh = new THREE.Mesh(viArm2Geo, viArm2Mtr);
  viArm2Mesh.position.copy(moArm2Body.position);
  viArm2Mesh.quaternion.copy(moArm2Body.quaternion);
  scene.add(viArm2Mesh);

  const moVehicleArm2Const = new CANNON.HingeConstraint(moArm1Body, moArm2Body, {
      axisA: CANNON.Vec3.UNIT_Z,
      axisB: CANNON.Vec3.UNIT_Z,
      pivotA: new CANNON.Vec3(-2, 0, 0),
      pivotB: new CANNON.Vec3(2, 0, 0), // 重心からずらして結合すると、腕が徐々に下がる（重さmassにも関係
  });
  world.addConstraint(moVehicleArm2Const);
  moVehicleArm2Const.enableMotor();

  // バケット
  // 
  // const moBucketShape = new CANNON.Box(new CANNON.Vec3(1.2, 0.1, 0.1));
  // 簡単のため Boxを板代わりにして、４枚くっつける
  const moBucketBody = new CANNON.Body({
      mass: 0.001,
      position: new CANNON.Vec3(-7, 7, 0),
      collisionFilterGroup: 1,
      material: moShovelMtr,
  })
  moBucketBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 0.01, 1)),  // 上面
                        new CANNON.Vec3(0, 1, 0))
  moBucketBody.addShape(new CANNON.Box(new CANNON.Vec3(0.01, 1, 1)),  // 奥面
                        new CANNON.Vec3(-1, 0, 0))
  moBucketBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 0.01)),  // 右面
                        new CANNON.Vec3( 0, 0, -1))
  moBucketBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 0.01)),
                        new CANNON.Vec3( 0, 0, 1))
  world.addBody(moBucketBody)
  const viBucketMesh = new THREE.Group()
  const viBucketMtr = new THREE.MeshNormalMaterial({wireframe: true});

  const viBucket1Geo = new THREE.BoxGeometry(2, 0.02, 2);
  const viBucket1Mesh = new THREE.Mesh(viBucket1Geo, viBucketMtr);
  viBucketMesh.add(viBucket1Mesh);
  // // viBucket1Mesh.position.copy(moBucketBody.shapes[0].body.position);
  viBucket1Mesh.position.copy(new THREE.Vector3(0, 1, 0));

  const viBucket2Geo = new THREE.BoxGeometry(0.02, 2, 2);
  const viBucket2Mesh = new THREE.Mesh(viBucket2Geo, viBucketMtr);
  viBucketMesh.add(viBucket2Mesh);
  // // viBucket2Mesh.position.copy(moBucketBody.shapes[1].body.position);
  viBucket2Mesh.position.copy(new THREE.Vector3(-1, 0, 0));

  const viBucket3Geo = new THREE.BoxGeometry(2, 2, 0.02);
  const viBucket3Mesh = new THREE.Mesh(viBucket3Geo, viBucketMtr);
  viBucketMesh.add(viBucket3Mesh);
  // // viBucket3Mesh.position.copy(moBucketBody.shapes[2].body.position);
  viBucket3Mesh.position.copy(new THREE.Vector3(0, 0, -1));

  const viBucket4Geo = new THREE.BoxGeometry(2, 2, 0.02);
  const viBucket4Mesh = new THREE.Mesh(viBucket4Geo, viBucketMtr);
  viBucketMesh.add(viBucket4Mesh);
  // viBucket4Mesh.position.copy(moBucketBody.shapes[3].body.position);
  viBucket4Mesh.position.copy(new THREE.Vector3(0, 0, 1));

  viBucketMesh.position.copy(moBucketBody.position);
  viBucketMesh.quaternion.copy(moBucketBody.quaternion);
  scene.add(viBucketMesh);

  const moVehicleBucketConst = new CANNON.HingeConstraint(moArm2Body, moBucketBody, {
      axisA: CANNON.Vec3.UNIT_Z,
      axisB: CANNON.Vec3.UNIT_Z,
      pivotA: new CANNON.Vec3(-2.2, 0, 0),
      pivotB: new CANNON.Vec3(1, 1, 0),
  });
  world.addConstraint(moVehicleBucketConst);
  moVehicleBucketConst.enableMotor();
```

運搬用の資材として、小さな box 10x10x10 を車の左側に配置します。

```js
  // ショベルカー、運搬対象用の資材を用意
  // const moBoxMtr = new CANNON.Material({name: 'box3', restitution: 1});
  const moBoxMtr = new CANNON.Material({name: 'box3', restitution: 0, friction: 1e7});
  var viBoxMeshs = [];
  var moBoxBodys = [];
  for (let z = 0; z < 10; ++z) {
  for (let y = 0; y < 10; ++y) {
  for (let x = 0; x < 10; ++x) {
  const moBoxBody = new CANNON.Body({
    mass: 0.00001,   // 軽くしないと拾えない
    shape: new CANNON.Box(new CANNON.Vec3(0.05, 0.05, 0.05)),
    position: new CANNON.Vec3(x*0.1, y*0.1+0.05, z*0.1 + 3),
    material: moBoxMtr
  });
  world.addBody(moBoxBody);
  const viBoxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const viBoxMtr = new THREE.MeshNormalMaterial();
  const viBoxMesh = new THREE.Mesh(viBoxGeo, viBoxMtr);
  viBoxMesh.position.copy(moBoxBody.position);
  viBoxMesh.quaternion.copy(moBoxBody.quaternion);
  scene.add(viBoxMesh);
  viBoxMeshs.push(viBoxMesh);
  moBoxBodys.push(moBoxBody);
  }
  }
  }
```

## 実行

操作が難しい。とくにアームが勝手に下がってるので余計に難し。  
回転台を旋回させたときに、アームがねじれてしまうのはなんででしょう？
ヒンジのねじれ角が有効になっているからでしょうか？！

一応、資材をすくって、別の場所に置くことはできてました。少量でしたけど。

ちなみに運搬用資材が自然と崩れてしまうのは仕様みたいです。
積み上げ方を工夫してレンガのような積み上げ方をすればOKっぽいらしいです。
配置位置や摩擦係数などをいじって調整はしたものの勝手に動いてしまいます。ほんと謎。

次は本題に戻り、「地図データの加工」を紹介します。


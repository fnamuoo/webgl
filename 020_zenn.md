# Three.js Cannon.es 調査資料 - 車をトラック、コンテナ付に

## この記事のスナップショット

トラック

![](https://storage.googleapis.com/zenn-user-upload/eda4bd0ca5b6-20241030.jpg)

ソース

https://github.com/fnamuoo/webgl/blob/main/020

動かし方

- ソース一式を WEB サーバ上に配置してください

- 車の操作法
  - カーソル上 .. アクセル
  - カーソル下 .. バック
  - カーソル左、カーソル右 .. ハンドル
  - 'b' .. ブレーキ
  - 'c' .. カメラ視点の変更
  - 'r' .. 姿勢を戻せない（コンテナが戻らない）
  - マウス操作 .. カメラ位置の変更

## 概要

- 車を改造してトラックにします。RaycastVehicle を牽引車として、トレーラー／コンテナもどきの直方体（以下コンテナと呼称）を後ろにつけて車輪を付けます。

## やったこと

簡単にするため、コンテナを直方体で表現します。

```js
  // コンテナ（荷台）
  const moContenaMtr = new CANNON.Material({name: 'container', restitution: 0}); // 反発 0:= 跳ねない
  // var contenaLen = 10;
  var contenaLen = 4;  // 全長 (x軸方向
  var contenaHigh = 1;  // 高さ (y軸方向
  var contenaWidth = 1;  // 横幅 (z軸方向
  const moContenaShape = new CANNON.Box(new CANNON.Vec3(contenaLen, contenaHigh, contenaWidth))
  const moContenaBody = new CANNON.Body({
      mass: 10,
      shape: moContenaShape,
      position: new CANNON.Vec3(contenaLen+4, 3, 0),
      material: moContenaMtr,
  })
  world.addBody(moContenaBody)
  const viContenaGeo = new THREE.BoxGeometry(contenaLen*2, contenaHigh*2, contenaWidth*2,  contenaLen, contenaHigh, contenaWidth);
  const viContenaMtr = new THREE.MeshNormalMaterial({wireframe: true});
  const viContenaMesh = new THREE.Mesh(viContenaGeo, viContenaMtr);
  viContenaMesh.position.copy(moContenaBody.position);
  viContenaMesh.quaternion.copy(moContenaBody.quaternion);
  scene.add(viContenaMesh);
```

車とコンテナを後ろに距離あけてつなぐ感じで、PointToPointConstraint でつないでみます。

```js
  // コンテナと車をつなぐ
  // 点でつないでみる(後ろに距離あけてつなぐ感じで)
  var contGap = 1;
  const moVJointConst = new CANNON.PointToPointConstraint(
      moChassisBody, new CANNON.Vec3(2+contGap, -0.5, 0),
      moContenaBody, new CANNON.Vec3(-contenaLen-contGap, -contenaHigh, 0),
  );
  world.addConstraint(moVJointConst);
  // 結合を線で表示
  const viContenaJoinMtr = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  const viContenaJoinPoints = [];
  viContenaJoinPoints.push( moChassisBody.position );
  viContenaJoinPoints.push( moChassisBody.position.vadd(moChassisBody.quaternion.vmult(new CANNON.Vec3(2+contGap, 0.01, 0))) );
  viContenaJoinPoints.push( moContenaBody.position );
  const viContenaJoinGeo = new THREE.BufferGeometry().setFromPoints(viContenaJoinPoints);
  const viContenaJoinLine = new THREE.Line(viContenaJoinGeo, viContenaJoinMtr);
  scene.add(viContenaJoinLine);
```

さらにコンテナにホイールを付けます。（下記では片方のみ紹介）

```js
  // 荷台のホイール
  var moContWheelBodys = []
  var viContWheelMeshes = []
  const contWheelRadius = 0.5
  const moContWheelMtr = new CANNON.Material({name: 'contWheel'});
  {
    const moContWheelShape = new CANNON.Cylinder(contWheelRadius, contWheelRadius, contWheelRadius*0.5, 20)
    const moContWheelBody = new CANNON.Body({
        mass: 1,
        material: moContWheelMtr,
        shape: moContWheelShape,
        position: moContenaBody.position.vadd(new CANNON.Vec3(contenaLen-0.2, -contenaHigh+0.2, contenaWidth+contWheelRadius*0.5+0.1)),
        quaternion: new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0),
    })
    world.addBody(moContWheelBody)
    moContWheelBodys.push(moContWheelBody)
    const viContWheelGeo = new THREE.CylinderGeometry(contWheelRadius, contWheelRadius, contWheelRadius*0.5, 20);
    const viContWheelMtr = new THREE.MeshNormalMaterial({wireframe:true});
    const viContWheelMesh = new THREE.Mesh(viContWheelGeo, viContWheelMtr);
    viContWheelMesh.position.copy(moContWheelBody.position);
    viContWheelMesh.quaternion.copy(moContWheelBody.quaternion);
    scene.add(viContWheelMesh);
    viContWheelMeshes.push(viContWheelMesh)
    const moContWheelConst = new CANNON.HingeConstraint(moContenaBody, moContWheelBody, {
        axisA: CANNON.Vec3.UNIT_Z,
        axisB: CANNON.Vec3.UNIT_Y,
        pivotA: new CANNON.Vec3(contenaLen-0.1, -contenaHigh-0.1, contenaWidth+0.1), // 左後方
        pivotB: new CANNON.Vec3(0, contWheelRadius*0.5, 0),
    });
    world.addConstraint(moContWheelConst);
  }
  // .. 右後輪は割愛
```

## 実行

走ってみるとホイールが角ばっているのかコンテナが跳ねます（RigidVehicle のよう）。  急旋回するとコンテナが転がってしまいます。  ですが当初の目的は達したのでこれで良しとします。

Constraint をキチンと確認する前に、適当に接合したらひどい目に合いました。
基本は大事ですね。

次は車に砲台と砲身を付けて、戦車にしてみます。


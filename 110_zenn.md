# Babylon.js で物理演算(havok)：raycastで浮かせたボードを作成する

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/e188dbe51835-20251212.gif)

https://playground.babylonjs.com/?inspectorv2=true?BabylonToolkit#NL0KDG

（ツールバーの歯車マークから「EDITOR」のチェックを外せば画面いっぱいになります。）

ソース

https://github.com/fnamuoo/webgl/blob/main/110

ローカルで動かす場合、上記ソースに加え、別途 git 内の 104/js を ./js として配置してください。

## 概要

raycast で浮き上がったボード（移動体）を作成してみました。

浮き上がったボード  
![](https://storage.googleapis.com/zenn-user-upload/812797a49baa-20251212.jpg)

raycast を長めにすることで、床が斜めやひっくり返った状態でも、接地面の方向に吸いつくようにしました。結果、背面走行が可能になりました。（飛行機が上下さかさまになって飛ぶ「背面飛行」になぞらえて、上下さかさまで走行するさまを「背面走行」と呼称しています）

ひっくり返った状態  
![](https://storage.googleapis.com/zenn-user-upload/085ba30c2202-20251212.jpg)

参考）[BabylonJS + cannon-es + raycastVehicle](https://forum.babylonjs.com/t/babylonjs-cannon-es-raycastvehicle/33194/2)

## やったこと

- raycast の移動体を作る
- raycast 操作
- カメラ操作

### raycast の移動体を作る

こんな感じでメッシュを用意します。普通にメッシュを作成して、重力の効果をカットしておき、摩擦の代わりに damping で減衰させます。

::::details メッシュ作成
```js
// フロート(3) 浮遊体)  斜めな地面に対応
let mw=1, mh=0.5, md=2;
myMesh = BABYLON.MeshBuilder.CreateSphere("me", { diameterX: mw, diameterY: mh, diameterZ: md, segments: 8 }, scene);
myMesh.material = new BABYLON.StandardMaterial("mat", scene);
myMesh.material.emissiveColor = BABYLON.Color3.Blue();
myMesh.material.alpha=.5;
let myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.8, restitution:0.05}, scene);
myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.ACTION);
myMesh._agg=myAgg;
myMesh._acc =0;
myMesh._dampLmax = 100000; // ブレーキ用
myMesh.physicsBody.disablePreStep = false;
myMesh.physicsBody.setGravityFactor(0.0);   // 重力の効果
myAgg.body.setLinearDamping(0.6); // def:0
myAgg.body.setAngularDamping(100.0); // def: 0.1  ..逆回転の力を抑え込むための摩擦
```
::::

### raycast 操作

肝となる raycast の操作はこんな感じで。raycast の配置は自身（myMesh）の前後左右から下方向に配置します。raycast が自身（myMesh）とぶつかると面倒なのでこのようにしましたが、深く調べれば解決策があったのかもしれません。

:::: details レイキャスト操作
```js
// raycast の交差を見つけるところ

// 開始位置
let quat = myMesh.rotationQuaternion;
let vd = BABYLON.Vector3.Forward().applyRotationQuaternion(quat).scale(myMesh._md_);
let vw = BABYLON.Vector3.Right().applyRotationQuaternion(quat).scale(myMesh._mw_);
let vdown = BABYLON.Vector3.Down().applyRotationQuaternion(quat).scale(susLen);
let vg = BABYLON.Vector3.Down().applyRotationQuaternion(quat).scale(9.8);
let pstartList = [
    myMesh.position.add(vd), // 前
    myMesh.position.subtract(vd),  //後
    myMesh.position.add(vw), // 右
    myMesh.position.subtract(vd), // 左
];
const physEngine = scene.getPhysicsEngine();
const raycastResult = new BABYLON.PhysicsRaycastResult();
for (let pstart of pstartList) {
    let pend = pstart.add(vdown)
    physEngine.raycastToRef(pstart, pend, raycastResult)
    if (!raycastResult.hasHit) {
        // 離れすぎ
        // 地面に張り付かせる力 の代わりに姿勢の下方向へ力
        myMesh._agg.body.applyForce(vg, pstart);
        continue;
    }
    // 接地している
```
::::

raycastで交差したメッシュ（接地面）との法線方向にバネを利かせます。離れすぎなら近づくように、近づきすぎなら離れるようにします。結果、接地面に対してくっついたような感じになり、壁や天井にそって移動することができます。
減衰を入れ忘れたので上下に揺れます。LinearDampingで多少減衰しますが、明示的に入れないと乗り心地はよくないみたいです。

::::details バネ操作のところ
```js
// バネ操作のところ

    // 縮んだ距離 = サスペンションの長さ - 始点から交点位置 ＋ちょっと足して浮かせた感じに
    let compLen  = susLen - raycastResult.hitDistance -7.8;
    const grav = -9.8;
    myMesh._agg.body.applyForce(raycastResult.hitNormalWorld.scale(grav + susPower*compLen), pstart);

```
::::

このままでは接地面と傾いた状態なので、法線方向に姿勢を正すようにします。
これで壁に乗り上げても壁の向きに姿勢を正します。

::::details 姿勢をただすところ
```js
// 姿勢をただすところ

    // 地面に垂直な方向(raycastResult.hitNormalWorld)に傾ける
    let v1 = raycastResult.hitNormalWorld.normalize();
    let v2 = BABYLON.Vector3.Up().applyRotationQuaternion(quat).normalize();
    let v3 = BABYLON.Vector3.Cross(v2, v1).scale(0.1);
    myMesh._agg.body.applyAngularImpulse(v3);
}
```
::::

斜めな箇所で垂直になる様子（２倍速）  
![](https://storage.googleapis.com/zenn-user-upload/598af88c47d4-20251212.gif)

### カメラ操作

メッシュが横になったり、上下さかさまになるような場合、カメラの上方向(upVector)を設定しないと意図しない視線になってしまいます。

レンダリングするときに、メッシュの上方向をカメラのupVectorに設定します。

::::details カメラ設定
```js
let quat = myMesh.rotationQuaternion;
camera.upVector = BABYLON.Vector3.Up().applyRotationQuaternion(quat);
```
::::

upVectorを設定しなかった場合（４倍速）  
![](https://storage.googleapis.com/zenn-user-upload/c8189873b482-20251212.gif)

upVectorを設定した場合（４倍速）  
![](https://storage.googleapis.com/zenn-user-upload/cb66ffb30041-20251212.gif)

## まとめ・雑感

簡単ではありますが raycast を使った移動体を作成することができました。サスペンションのところを安易にバネモデルで作ってしまったために、振動して乗り物酔い起こしそうです。減衰する機能は必須っぽいです。

とりあえず壁や天井を走れるようになったことで、次回、extrude でつくったねじれたコースを走ってみたいと思います。


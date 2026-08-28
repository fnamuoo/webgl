# Babylon.js で物理演算(Havok) ：FPS3（微改修）

## この記事のスナップショット

![](https://static.zenn.studio/user-upload/38bab47a021b-20260828.gif)
*sample*

https://playground.babylonjs.com/?BabylonToolkit#VUU1PN

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

## ソース

https://github.com/fnamuoo/webgl/blob/main/164

:::message
ローカルで動かす場合、上記ソースに加え、別途 git 内の [136/js](https://github.com/fnamuoo/webgl/tree/main/136/js) を ./js として配置してください。
:::

## 概要

今回、以前作成した [Babylon.js で物理演算(Havok) ：FPSゲーム２（手探り中）](https://zenn.dev/fnamuoo/articles/5b32f78657df90) から改造を行い、FPSとしての操作を少し整理するとともに、敵キャラを物理演算で倒す部分をもう少しゲームらしくしてみました。

前回は敵を「一定の高さより下に落ちたら倒れた」と判定していましたが、今回は敵の姿勢を見て倒れたかどうかを判定するようにしました。また、何度か攻撃しないと倒れないようにVITを導入しています。

## やったこと

- FPS視点への限定
- 武器の変更
- 敵キャラの移動方法変更
- 倒れ判定の変更
- VITの導入

### FPS視点への限定

プレイヤー視点のみにカメラを限定しました。
ただ、FPSでよくある「上下に揺れて」歩く感じは実装していません。
（個人的にあまり好きではないので）

### 武器の変更

オートでの攻撃をやめて、マウスでフォーカス・クリックして射撃する武器のみに限定しました。

武器については更に手を加え、マシンガンは連射するように、ライフルは貫通力があるように加速と質量を大きくし、大砲もサイズを大きく、加速、質量を調整しました。

![](https://static.zenn.studio/user-upload/38bab47a021b-20260828.gif)
*マシンガン*

![](https://static.zenn.studio/user-upload/a9ac3d545196-20260828.gif)
*ライフル*

![](https://static.zenn.studio/user-upload/3fd40797203d-20260828.gif)
*大砲*

### 敵キャラの移動方法変更

敵キャラを移動させるとき、台座に乗せたうえで台座を移動させてます。
回転寿司のように移動させることができるか試してみた結果です。

ところで台座に乗せたときに敵キャラを動かすときに少々問題が発生し、敵キャラがふらつくことが多くありました。そこで重心をやや下に下げることで安定させてます。ただ、重心を下げすぎるとぶつかった時の挙動（回転するさま）が、「起き上がりこぼし」のようになるのでそこまでの挙動にならないように（重心を下げ過ぎないように）しています。

```js
//重心を中心位置から -0.8 下げた位置に設定する
mesh = BABYLON.MeshBuilder.CreateBox("", {width:0.6, height:s, depth:0.2}, scene);
mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:mass, friction:1, restitution:0.01}, scene);
let pc  = new BABYLON.Vector3(0, -0.8, 0);
mesh._agg.body.setMassProperties({centerOfMass:pc});
```

![](https://static.zenn.studio/user-upload/842bd8b352b0-20260828.gif)
*台座に乗せて移動させている様子*

試みて面白くはあるのですが、後述のVIT導入したら、初回衝突で台座から落ちてしまうことがあり良し悪しです。VITが尽きるまでは台座の上で鎮座できればよかったのですが、「武器を変えても一律に」ということが難しいです。

### 倒れ判定の変更

いろんな場所（高所など）に敵キャラを配置できるように、前回の衝突判定（ある高さより下に位置したら倒れた判定）を見直しました。具体的には姿勢（角度）で判定します。

敵キャラのクォータニオンからオイラー角を取得して、傾きを判定しています。

```js
let quat = m.physicsBody.transformNode.rotationQuaternion;
let vrot = quat.toEulerAngles();
if ((Math.abs(vrot.x) > 0.1)  || (Math.abs(vrot.z) > 0.1) ) {
    // 傾きを検知
```

結果、高所に敵キャラを配置しても「やられた／倒れた」判定ができるようになってます。

### VITの導入

ボスを見据えて、一発でノックアウトしない、倒れても起き上がるようにVIT（vitality）を導入して、倒れてもVITが残っているときは、復帰する（姿勢を戻す）ようにしました。

このとき１つ問題があり、姿勢を正す設定(setTargetTransform)と移動を正す設定(setLinearVelocity, setAngularVelocity)を同時に実行できず、タイミングをずらして実行する必要がある点です。

というのも、下記の挙動になっているためです。

> setTargetTransform は指定した位置・回転へ瞬間移動させる関数ではなく、目標位置に到達するように速度を計算してボディに設定するメソッドです。
> setTargetTransform のあとに setLinearVelocity してしまうと、setTargetTransform が無効になります。

つまり、「移動させる」と「移動｜回転を止める」を連続して指定すると「移動させる」が無効になるので、下記コードのようにしています。
一旦移動させたら、別のタイミングで「移動｜回転を止める」ように処理しています。

```js
if (m._v0 == 1) {
    // タイミングをずらして速度を止める
    m._v0 = 0;
    m.physicsBody.setLinearVelocity(new BABYLON.Vector3(0, 0, 0)); // 移動を止める
    m.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
} else if ((Math.abs(vrot.x) > 0.1)  || (Math.abs(vrot.z) > 0.1) ) {
    // 倒れたことを検知
    if (--m._vit > 0) {
        // まず位置だけを修正
        let p = m.position.clone();
        let q = BABYLON.Quaternion.Identity();
        m._agg.body.setTargetTransform(p, q);
        m._v0 = 1; // タイミングをずらして速度を止めるフラグ
    }
}
```

しかし、この判定方法は安定していないのか、実際に動かしてみると VIT にセットした値からブレてしまうように感じます。原因についてはまだ切り分けられていません。

一方でゲーム的には体力ゲージのような視覚的なモノがないと分かりづらくて微妙な感じです。

![](https://static.zenn.studio/user-upload/ff7c665666e0-20260828.gif)
*数回当てないと倒れない様子（2倍速）*

ちなみに数発で倒す裏技として、敵キャラの端に当てて、回転・スライドさせながら場外に落とすことで倒す（場外にする）こともできます。

![](https://static.zenn.studio/user-upload/e5e306392351-20260828.gif)
*裏技（2倍速）*

## まとめ・雑感

今回 FPS の改修を行いました。
完成度はあまり上がっていません。

また一方で、下記の課題も見えてきました。

- VIT処理の安定化
- 台座による移動とVIT
- 体力ゲージの必要性

まだまだ道半ばです。


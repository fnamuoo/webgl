# Babylon.js で物理演算(Havok) ：球の表面を移動する

## この記事のスナップショット

![](https://static.zenn.studio/user-upload/69f3d9942da1-20260807.gif)
*sample*

- キャラクターコントローラーで移動
  - https://playground.babylonjs.com/?BabylonToolkit#3UD992

- Boxで移動
  - https://playground.babylonjs.com/?BabylonToolkit#3UD992#1

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

## ソース

https://github.com/fnamuoo/webgl/blob/main/160

:::message
ローカルで動かす場合、上記ソースに加え、別途 git 内の [136/js](https://github.com/fnamuoo/webgl/tree/main/136/js) を ./js として配置してください。
:::

## 概要

球の表面上を移動する移動体として、キャラクターコントローラーとBoxの 2つを試作し、どちらがよいかを検証してみました。

球の表面を移動させるので、位置によって重力の向きが変わることに注意が必要です。つまり、上方向（法線方向）の変化に合わせてメッシュの姿勢および移動方向を変化させる必要がありました。結果、キャラクターコントローラーは一見上手くいきますが、赤道付近で斜めに射影したように変形し、南半球での挙動が怪しくなります。

また Boxの場合は初期姿勢や初期位置が上手くいっていません。
そこに目をつぶれば、まあまあな出来です。

## やったこと

- キャラクターコントローラーで移動
- Boxで移動

### キャラクターコントローラーで移動

[キャラクターコントローラー](https://doc.babylonjs.com/features/featuresDeepDive/physics/characterController/)
の挙動をいじって、位置に応じて重力方向を計算し、姿勢（クォータニオン）を修正します。

```js
scene.onAfterPhysicsObservable.add((_) => {
    ...

    // 重力方向を再計算
    let vU = myMesh.position.subtract(meshGrnd.position).normalize();
    characterGravity = vU.scale(-accG);
    // 重力方向に合わせ、姿勢を正す
    let vForward = BABYLON.Vector3.Backward().applyRotationQuaternion(characterOrientation);
    let quat0 = BABYLON.Quaternion.FromLookDirectionLH(vForward, vU);
    let rlerp = 0.2;
    characterOrientation = BABYLON.Quaternion.Slerp(characterOrientation, quat0, rlerp);
    myMesh.rotationQuaternion = characterOrientation;
    // カメラの上方を再設定
    camera.upVector = vU;
}
```

動かしてみると分かりますが、赤道付近の挙動があやしく姿勢がブレます。もしかしたら内部でオイラー角による姿勢制御をしているのかもしれません。

また、南半球ではジャンプができません。これはキャラクターコントローラーの挙動、接地判定（Grounded check）がグローバル座標の真下（-Y方向）に固定されているためと思われます。

一旦、今はここまでとしておきます。

![](https://static.zenn.studio/user-upload/69f3d9942da1-20260807.gif)
*キャラクターコントローラーでの移動（赤道付近で挙動が怪しくなる様子）；４倍速*

### Boxで移動

こちらでは シンプルなBoxを使って、自前で重力効果や姿勢制御を試してみました。キャラクターコントローラーと違って仕組みが単純な一方、色々と作り込む必要があります。

移動は力を加えることで実現していますが、dampingやfrictionを設定して滑り過ぎないようにしています。

また、初期位置で任意に配置したり、横転時の姿勢リセット（Enterキー）を実装してみましたがこちらは上手くいっていません。位置positionについては正しい位置に配置できているようですが、姿勢が全然だめです。AIにデバッグさせて修正してみましたが直っていません。AI曰く、physicsBody.setTargetTransform を使うべきで、mesh.position や mesh.rotationQuaternion に設定するとダメ(物理演算と競合する）と言われるのですが、使い方がまずいのか、別途 mesh.position を操作しないと指定した位置にならないし、姿勢についても想定した姿勢にならず、何かが足りない・ズレている感じがします。
結果、初期位置と初期姿勢が直っておらず、キー操作(wasd)でBoxを横転・姿勢を補正できるようにしました。

![](https://static.zenn.studio/user-upload/7e053ff191e8-20260807.gif)
*Boxでの移動の様子；２倍速*

#### 球面上にブロック

Boxのときのみ、球面上にブロック（三角柱）を配置しています。
これは [Babylon.js ：球面ゲーム用のメッシュ基盤を作る](https://zenn.dev/fnamuoo/articles/851e7703bd1575) のときの迷路のコードを再利用しています。スムーズに動いたら迷路にする予定でしたが、その名残です。


## まとめ・雑感

初期の想定では、球面上に迷路を作ってその中を移動させることでした。スタート位置（青の柱）にプレイヤーを配置させることができず、不具合対応に時間がかかりすぎ、結果時間切れです。

方向性としては、キャラクターコントローラーは不向き、自前で制御するしかなさそうです。
ただ、自前の処理(Box)はまだ望みがありそうだけど解消すべき懸念事項が残っている状態です。

AI にデバッグさせても上手くいかないのは、まだ知見が足りないのか、Claude Fable じゃないからか...精進が必要です。今は無理でも将来の自分かAIが解決してくれることでしょう。きっと。


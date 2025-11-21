# Babylon.js で物理演算(havok)：車モデル

## この記事のスナップショット

走行の様子（2倍速）  
![](https://storage.googleapis.com/zenn-user-upload/f149a32a236b-20251121.gif)

https://playground.babylonjs.com/full.html#L00J3C#1

（コードを見たい人はURLから `full.html` を削除したURLを指定してください。上記はフル画面表示用です。コードを表示した場合でもツールバーの歯車マークから「EDITOR」のチェックを外せば画面いっぱいになります。）

ソース

https://github.com/fnamuoo/webgl/blob/main/105

ローカルで動かす場合、上記ソースに加え、別途 git 内の 104/js を ./js として配置してください。

## 概要

Babylon.js のフォーラムには車の記事がいくつかあります。
Babylon.js だと ammo や cannon は Legacy 扱いで対応するメッシュ／物理形状に制限があります。
なので havok に対応した３番目の raycastモデルに着目し、さらに改造してみました。

- [AmmoJS Vehicle Demo](https://forum.babylonjs.com/t/ammojs-vehicle-demo/453)
  - [https://playground.babylonjs.com/#609QKP#7](https://playground.babylonjs.com/#609QKP#7)
  - [https://playground.babylonjs.com/#609QKP#11](https://playground.babylonjs.com/#609QKP#11)
  - Raggar氏の作品？
  - 所感：ammo の Vehicleモデルを使ったサンプル

- [BabylonJS + cannon-es + raycastVehicle](https://forum.babylonjs.com/t/babylonjs-cannon-es-raycastvehicle/33194/2)
  - [https://www.babylonjs-playground.com/#UGMIH#15](https://www.babylonjs-playground.com/#UGMIH#15)
  - Raggar氏の作品
  - 所感：cannon の RigidVehicleモデルを使ったサンプル

- [Arcade Raycast Vehicle](https://forum.babylonjs.com/t/arcade-raycast-vehicle/45088)
  - [https://playground.babylonjs.com/#8WQIA8](https://playground.babylonjs.com/#8WQIA8)
  - [https://playground.babylonjs.com/#8WQIA8#10](https://playground.babylonjs.com/#8WQIA8#10)
  - Raggar氏の作品
  - 所感：cannonjs の raycastモデルをカスタマイズして havokに移植したもの

ちなみに３番目のコードをChatGPTに投げて説明をお願いすると、下記のような答えが返ってきました。

```
提示されたコードは Babylon.js（＋物理プラグインを想定）で「レイキャストによる車両（Raycast Vehicle）」を自前で実装したものです。
物理ボディ（this.body、シャーシ）に対して、各ホイールごとにレイキャストで路面接触判定を行い、
サスペンション力・横（スリップ）力・駆動力・アンチロール力などを物理ボディに applyForce して車両挙動を再現します。
RaycastVehicle が全体制御、RaycastWheel がホイール単位のデータと可視 Transform を持ちます。
```

## やったこと

- モデルの改造
  - 元の姿勢に戻す挙動を指定したタイミングのみ実行
  - ステアリングの挙動をクイックに
  - グリップ走行よりドリフト走行に
  - ブレーキの実装
- 走り比べられる環境づくり

### モデルの改造１：元の姿勢に戻す挙動を指定したタイミングのみ実行

ひっくり返っても戻る挙動としてupdateVehiclePredictiveLanding()が組み込まれてます。
便利なのですが手動でONするようにします。
update()で毎回実施していた updateVehiclePredictiveLanding()を、「ホイールがすべて地面に接地するまで」を条件として実施します。
特定のキーを押下時に上に（真上だとそのまま着地するのでやや傾けて）上昇させる力を加えて、updateVehiclePredictiveLanding()を実行して姿勢を戻します。

### モデルの改造２：ステアリングの挙動をクイックに

ステアリング操作がリアルっぽく、キー押下の時間に応じて徐々に角度が深くなるようになってます。
これだと操作が難しいので、キーのON/OFFで最大角まで変化させます。


舵角（ステアリング）を徐々に深くする／浅くする挙動を

```js
if(controls.left) steerDirection = -1
if(controls.right) steerDirection = 1
steerValue += steerDirection*steeringIncrement
steerValue = Math.min(Math.max(steerValue, -maxSteerValue), maxSteerValue)
steerValue *= 1-(1-Math.abs(steerDirection))*steerRecover
vehicle.wheels[2].steering = steerValue
vehicle.wheels[3].steering = steerValue
```

これをON/OFF時にmaxまでハンドルを切ります

```js
if(keyAction.left) steerDirection = -1
if(keyAction.right) steerDirection = 1
vehicle._steerValue = steerDirection*vehicle._maxSteerValue*vquick;
vehicle.wheels[2].steering = vehicle._steerValue
vehicle.wheels[3].steering = vehicle._steerValue
```


### モデルの改造３：グリップ走行よりドリフト走行に

コーナリング時の挙動が変で、オーバーステア気味なのにスピンせずにクイックに方向転換します。
この挙動（グリップ走行？）がちょっと気持ち悪いので、グリップ走行を犠牲にしてドリフトよりの設定にします。
これはホイールにある「横向きの力を加えるパラメータ」を調整します。
旋回時に発生する横滑りをこのパラメータで打ち消しているようです。リアルな物理シミュレーションだと変な感じですが、簡易モデルとしてはありかも？といったところです。
ここの値を小さくしていくと、グリップ走行からドリフト走行の挙動になります。グリップ／ドリフトと呼称することに異論は認めすが便宜上そのように呼称しておきます。

```js
const wheelConfig = {
    ...
    // sideForce:40,                            //Force applied to counter wheel drifting
    sideForce:6, // ski な感じ
    // sideForce:4, //drift
    // sideForce:2, //heavy drift
    ...
}
```

### モデルの改造４：ブレーキの実装

ブレーキの機能を追加で実装します。
ブレーキ時にはシャーシの線形ベクトル速度(getLinearVelocity)を取得して、逆向きの定数倍にして力を加えます。
加速の関数 updateWheelForce(wheel) を参考にして、シャーシの速度ベクトルに逆向きにして定数倍します。
リアルならシャーシの質量とか考えるべきですが、いま車は固定（１種類）なので係数を固定して処理します。

```js
updateWheelBrake(wheel) {
    if(!wheel.inContact) return;
    if(wheel.brake !== 0) {
        let vec = this.body.getLinearVelocity();
        // 質量(暫定で１)で割って、係数：ブレーキ（最大）をかけ、逆向き(-1)にする
        vec.scaleInPlace(-wheel.brakeForce)
        // 力を接地点に適用
        this.body.applyForce(vec, this.tmp2.copyFrom(wheel.hitPoint));
    }
}
```

オリジナルにはブレーキが実装されてなかったのですが、バックにすればブレーキになるという考えで実装されてなかったのかも？

### 走り比べをするための環境づくり

地面にコースの画像を貼り付けて即席のコース場を作ります。
平面なコース、正面奥に傾斜／斜面のコース、右手にパーリンノイズで凹凸を作ったコースを用意してます。

平面なコース場  
![](https://storage.googleapis.com/zenn-user-upload/d13ea42c79e9-20251121.jpg)

凹凸のあるコース場  
![](https://storage.googleapis.com/zenn-user-upload/76383db16b4c-20251121.jpg)

一方で、車の違いを感じられるようにしました。キー（m）で切り替わります。
比較対象にオリジナルの車と今回カスタマイズした車を用意してます。

オリジナルの車  
![](https://storage.googleapis.com/zenn-user-upload/3abc942e1db5-20251121.jpg)

カスタマイズした車  
![](https://storage.googleapis.com/zenn-user-upload/109c99d57ba2-20251121.jpg)

## まとめ・雑感

どうしても車モデルでの動作を諦めきれず、フォーラムから関連記事をみつけ、コードを拾ってきて改造してみました。
当面これで遊べそうです。


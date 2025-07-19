# Babylon.js で物理演算(havok)：RigidVehicleをつくってみたけど..

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/e1f37c67543a-20250719.jpg)

083_car3_rigidCar .. RigidCar  
https://playground.babylonjs.com/full.html#R5OR11#3

（コードを見たい人はURLから `full.html` を消したURLを指定してください）

[ソース](083/)
- 083_car1_wheel  .. ホイール（テスト）
- 083_car2_draft  .. RigidCar（テスト）
- 083_car3_rigidCar .. RigidCar

ローカルで動かす場合、./js 以下のライブラリは 069/js を利用してください。

## 概要

物理エンジンhavok上で、Physics6DoFConstraint を使ってホイールをつくり、サスペンションのない車を作ってみました。
結果、それっぽくはなったけどイマイチな車ができあがりました。

## やったこと

- ホイールをつくる
- 車モデルをつくる


### ホイールをつくる

[Motor Constraints](https://playground.babylonjs.com/#5KKGOT#1)を見て、「車のホイール」を作れるかなと試行錯誤。２つの Physics6DoFConstraint を使えばできそうだとわかりました。１つ目はホイールの回転に、２つ目は舵角を制御するのに使います。

ホイールのメッシュを円柱で作っているため中心軸がY軸（縦向き）になってます。９０度回転させた状態で使いたいのですが、回転させているためか、ホイールを立てて動かすことがうまくいかず失敗。毎回、ホイールが倒れた状態で動きます。

車輪の回転軸に対し、傾斜角（舵角）がずれている版（４倍速）  
![](https://storage.googleapis.com/zenn-user-upload/976ebc08f3da-20250719.gif)

https://playground.babylonjs.com/#R5OR11


結果、TransformNode を親に、９０度回転させた円柱を子としたメッシュを用意して回避しました。（接続する座標や軸で解決できそうな気がしますが、うまくいかず...）
不格好ですが一応ホイールができました。

左：車輪の回転軸に対し、傾斜角が正しい版（自動で回転）と  
右：車輪の回転軸に対し、傾斜角・回転を操作の版（wsadで操作）（４倍速）  
![](https://storage.googleapis.com/zenn-user-upload/73970d1099d8-20250719.gif)

083_car1_wheel  .. ホイール（テスト）  
https://playground.babylonjs.com/#R5OR11#1

余談  
当初質量(mass)を軽めにつくってましたが、ホイールを傾けるとグラグラします。回転していると特にブレます。原因がわからずに質量を増やすと安定した動きになりました。よくわらないけど、そういうもんなんでしょう。

グラグラするホイール（質量が軽いとき）（４倍速）  
![](https://storage.googleapis.com/zenn-user-upload/6cdc71957db0-20250719.gif)

083_car3_draft  .. RigidCar（テスト）  
https://playground.babylonjs.com/#R5OR11#2

### 車モデルをつくる

ホイール（駆動系）がなんとかできたので、車としての体裁を整えるため下記をつくりこみます。

- キー入力操作
- 加速・減速
- ハンドル／舵角操作
- 姿勢のリセット(横転、スピン対応)

![](https://storage.googleapis.com/zenn-user-upload/e1f37c67543a-20250719.jpg)

083_car3_rigidCar .. RigidCar  
https://playground.babylonjs.com/full.html#R5OR11#3

いざ、うごかしてみると...

- 開始時にスピン状態。部品の座標が正しくない・ズレているためと思われる
- たまにホイールが地面にめり込んで、ぬけだせなくなる
  - 何かの拍子に、地面（平面）を突き抜けてしまった？
- 駆動系を FR にすると、前輪がロック状態（舵角はうごく）
- スピードを出すと車体がブレる／ボディが傾く／不安定（サスが無いので仕方ない）。
  重力を大きくすれば安定するかも？

直進させた場合（４倍速）  
![](https://storage.googleapis.com/zenn-user-upload/08e23f496760-20250719.gif)

## まとめ・雑感

cannon.js にある RigidVehicleモデルと同じような機構なので、ある程度の使いにくさは想定してましたが、それ以上の残念さ。フォーラムに車のサンプルがありますが、使い方が「さっぱりわからん」なので、自作にチャレンジしたわけですが。これならhovokをあきらめて、cannon や ammo の車モデルを使った方が良いかも？
このまま断念するには気がかりが多い。機を見て再チャレです。


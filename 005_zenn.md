# Three.js Cannon.es 調査資料 - ソースの整形／統一、車モデルの比較まとめ

## この記事のスナップショット

コード整形後のRaycastVehicleデモ画像
![](https://storage.googleapis.com/zenn-user-upload/12c5d9ebcc29-20241026.jpg)

コード整形後のRigidVehicleデモ画像
![](https://storage.googleapis.com/zenn-user-upload/1b9277242f58-20241026.jpg)

[ソース](005/)

動かし方

- ソース一式を WEB サーバ上に配置してください
- 車の操作法
  - カーソル上 .. アクセル
  - カーソル下 .. バック
  - カーソル左、カーソル右 .. ハンドル
  - 'b' .. ブレーキ
  - 'c' .. カメラ視点の変更
  - 'r' .. 姿勢を戻す

## 概要

- ソースコードの整形
  - 変数名の統一
- 車の形状の統一（ホイールを円柱に）

## やったこと

[最新ライブラリ対応（cannon-es@0.20.0, three@0.165.0）](https://zenn.dev/fnamuoo/articles/d690ba20caa925)のソースをベースにして、RaycastVehicle モデルと RigidVehicle モデルを比較しやすいよう、ソースコードの整形を行い、変数名を統一します。

また、車の見た目を同じに、ホイールを円柱に統一します。

とどのつまり、リファクタリングです。

## 車モデルの比較まとめ

ソースも見やすくなった？ところで、RaycastVehicle モデルと RigidVehicle モデルを比較します。

項目            | Rigid vehicle      | Raycast vehicle
----------------|--------------------|------------------
加速            | setWheelForce()    | applyEngineForce()
ブレーキ        | (なし)             | setBrake()
ハンドル        | setSteeringValue() | setSteeringValue()
ホイールモデル  | Bodyクラス(*1)     | WheelInfoクラス(*2)

*1: 一般的な物理モデルの形状を示すクラス  
*2: ホイールを示す専用のクラス。サスペンションやダンパーといった概念あり


- Rigid vehicle
  - 良い点
    - シンプルなモデル
  - 悪い
    - 平面を直進するだけで車がガタつく
    - 姿勢の回復が面倒

- Raycast vehicle
  - 良い点
    - より詳細にカスタマイズできる
    - 足回りのセッティングができることでグリップにもドリフトにも対応可能
    - 姿勢の回復が容易
  - 悪い
    - モデル構築時のホイールの軸の向き指定がわかりにくい

結論として次のような想定かなと思います。

- Rigid vehicle
  - 車っぽく動かしつつも最低限の機能があればよいとき
  - 多くの車を同時に、低速で動かすシーン等
- Raycast vehicle
  - レースゲームのように車の挙動をコントロールしたいとき
  - 車の挙動のシミュレーション

グランツーリスモに感銘を受けた身としては、以降、Raycast vehicleモデルにフォーカスします。



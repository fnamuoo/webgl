# Babylon.js：ひまわりの迷路

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/da66ae949c48-20250805.jpg)

ひまわりの迷路  
https://playground.babylonjs.com/full.html#00QD7S

（コードを見たい人はURLから `full.html` を消したURLを指定してください）

ソース

https://github.com/fnamuoo/webgl/blob/main/086

ローカルで動かす場合、./js 以下のライブラリは 069/js を利用してください。

## 概要

「夏」といえば「ひまわり」。「ひまわり」といえば「迷路」。ということで、ひまわりの迷路を作ってみました。おまけで迷路内に子供たちを走らせてます。
どうせなので、ラベンダーやアヤメ、麦のステージも用意しました。

## やったこと

- ひまわりの迷路をつくる
- 迷路内に子供を配置
- 他の植物のステージ

### ひまわりの迷路をつくる

迷路の作成には、以前作成した迷路モジュールを使います。壁と通路が同じ大きさの迷路を使い、壁の部分を低くして、植物を植える畝（うね）の部分にします。
植物／ひまわりをたくさん配置するために、スプライト機能で１万本作成します。

ひまわりの迷路  
![](https://storage.googleapis.com/zenn-user-upload/da66ae949c48-20250805.jpg)

ちなみに植物の画像は[いらすとや](https://www.irasutoya.com/)さんから

### 迷路内に子供を配置

[ぴぽや倉庫](https://pipoya.net/blog/)からフリー素材、子供のキャラクターチップを使います。
立体にテクスチャを張ってもよいのですが、透過画像（アルファチャンネル）を有効にすると「浮き出ている感」があります。平面２枚を交差させて、テクスチャを張りつければ、３Ｄモデルっぽく見えるのでこの方法を採用します。（できればこれにアニメーションしたかったけど...）

透過させないときの交差面（上）と立体（下）  
![](https://storage.googleapis.com/zenn-user-upload/d705a6563291-20250805.gif)

透過させたときの交差面（上）と立体（下）  
![](https://storage.googleapis.com/zenn-user-upload/69fff82d9f66-20250805.gif)


### 他の植物のステージ

「ひまわり」を他の植物に変えるには、スプライトで読み込む画像を別のファイルに差し替えます。
あと、植物によって高さを変えてます。

ラベンダー  
![](https://storage.googleapis.com/zenn-user-upload/6e7823872cca-20250805.jpg)

アヤメ  
![](https://storage.googleapis.com/zenn-user-upload/fcbadfca1f50-20250805.jpg)

麦  
![](https://storage.googleapis.com/zenn-user-upload/c31c1e5c5553-20250805.jpg)


## まとめ・雑感

ひまわりの隙間から見えるこどもの頭や、また上手く曲がれずに行き過ぎるさまが「まよっているよう」でちょっとかわいい。

迷っている感（４倍速）  
![](https://storage.googleapis.com/zenn-user-upload/f4bf8960aa15-20250805.gif)



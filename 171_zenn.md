# Babylon.js ：Crowd Navigation System で人流のテスト

## この記事のスナップショット

![](https://static.zenn.studio/user-upload/d7cf780e0f18-20261016.gif)
*sample(2倍速)*

https://playground.babylonjs.com/?BabylonToolkit#UAF9DB

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

## ソース

https://github.com/fnamuoo/webgl/blob/main/170

:::message
ローカルで動かす場合、上記ソースに加え、別途 git 内の [136/js](https://github.com/fnamuoo/webgl/tree/main/136/js) を ./js として配置してください。
:::

## 概要

Babylon.js の Crowd Navigation System を使って、複数のエージェントが移動する状況を試してみました。

まず、隊列による狭所の通過や、エージェントの巡回による人流の形成を試しました。
そのうえで、人流の中をプレイヤーが移動し、流れに乗ったり、逆らったりする様子を確認できるシミュレーターを作成しました。

隊列による通過時間の違いや、人流の形成については、明確な結果を得られたとは言えません。
今回は厳密な検証ではなく、Crowd Navigation System を使ってどのような動きが見られるかを試すことが目的です。

## 隊列による通り抜けの差

門や狭所を、隊列を組んで通過する場合と、一斉に押し寄せる場合で、通過に時間がかかるかな（差ができるか？）というサンプルです。

サンプルは生成AIで作成しました。

```md
babylon.js の CrowdNavigationSystem を使ったエージェントの動きにおいて、
扉などの狭い箇所を大勢の人数で通過する際、
陣形によって通り抜けの時間が違うのか？
自由に群がる場合や隊列を組んだ場合で違いはでるのか？
サンプルコードは version 9 以上で、playground 環境で動くコードとし、
export const createScene = function () {}
の形式で記述してください。

```
このサンプルでは大きな差は確認ができないですが、多少は動きが見て取れたのでよしとします。

隊列による通り抜けの差
https://playground.babylonjs.com/?BabylonToolkit#UAF9DB#1

![](https://static.zenn.studio/user-upload/673f7bc20d41-20261016.gif)
*隊列による通り抜け(1.5倍速)*


## 人流の形成

適当にエージェントを配置して、目的地を２つ設定し、巡回させたら人流ができるかなというサンプルです。

サンプルは生成AIで作成しました。

```prompt
babylon.js の CrowdNavigationSystem を使ったエージェントの動きにおいて、
人流が形成されるようにするにはどうすればよいか？
サンプルコードは version 9 以上で、playground 環境で動くコードとし、
export const createScene = function () {}
の形式で記述してください。
```

正直、人流が形成できているかは微妙です。
それっぽいものが出来ているような気もするし、勘違いな気もするし。
まぁ専門家ではないし、検証したいわけでもないのでこの程度で。

人流の形成
https://playground.babylonjs.com/?BabylonToolkit#UAF9DB#4

![](https://static.zenn.studio/user-upload/6338a4823ef6-20261016.gif)
*人流の形成(1.5倍速)*


## 人流中のプレイヤー操作

意図的に人流（発生源と目的地）をつくり、人の波に乗ったり、逆らって移動することを確認するシミュレーターです。
ここは生成AIを使わず、頑張って独力で作成しました。

幾つかのパターン（ステージ）をつくって、目的地に辿り着けるかを確認・プレイできます。


プレイヤーの操作は、移動先・目的地をクリックするだけです。
最終目的地（青い四角）に2回到達したらそのステージをクリアです。

![](https://static.zenn.studio/user-upload/c1c2c1cef9ad-20261016.gif)
*sample(2倍速)*

## まとめ・雑感

Crowd Navigation System の新機能、ジャンプ機能の紹介記事を考えていたのですが、いいネタが思いつかず、結果、無難なネタになってしまい、正直、技術的目新しさはあまりありません。

新規機能のジャンプ機能は見送りです。。通過できるエージェントの量が制限されるようで、今回の人流と相性が悪くて生かしきれませんでした。個人的には「エリアコスト」が非常に気になるところで、実装されているっぽいけどAPIが公開されてないようで非常に残念です。エリアによる移動の違いが実現できるかと期待していたのですが。近いうちにバージョンアップされることを期待します。


# Babylon.js：ミニチュアに挑戦

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/bae15dffe36e-20250806.jpg)

ミニチュアなひまわり畑
https://playground.babylonjs.com/full.html#261L95

ミニチュアな渋谷
https://playground.babylonjs.com/full.html#261L95#1

(L)キーでレンズ効果（焦点距離、開口）を変更します。

（コードを見たい人はURLから `full.html` を消したURLを指定してください）

ソース

https://github.com/fnamuoo/webgl/blob/main/087

- 087_lensEffect .. ひまわり畑
- 087_lensEffect2 .. 渋谷

ローカルで動かす場合、./js 以下のライブラリは 069/js を利用してください。

## 概要

ぼかし（blur）機能をシーンの上下にいれるとミニチュアっぽいものができるらしいと知って、[Depth of Field and Other Lens Effects](https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/dofLenseEffects)にある LensRenderingPipeline をつかえば実現できそうなのでやってみました。

- 参考資料
  - [ミニチュア風写真を10年ほど研究して学んだポイント](https://note.com/fladdict/n/n7cb50ddc2650)
  - [ミニチュア風写真の作り方（インスタグラムでもできるよ！](https://bibinbaleo.hatenablog.com/entry/2019/02/15/203623)

## やったこと

- レンズ効果を確かめる
- モチーフをかえてみる

### レンズ効果を確かめる

ざっくりと焦点距離(dof_focus_distance)と開口(dof_aperture)をいじって、中央付近に焦点をあわせ、遠近にぼかしをいれるようにします。

焦点距離＝30、開口＝10の場合  
![](https://storage.googleapis.com/zenn-user-upload/bae15dffe36e-20250806.jpg)

ちなみに、焦点距離を変更すれば、手前や奥に焦点をあわせることができます。

焦点距離＝22、開口＝10の場合  
![](https://storage.googleapis.com/zenn-user-upload/77ff65b76cef-20250806.jpg)

焦点距離＝50、開口＝10の場合  
![](https://storage.googleapis.com/zenn-user-upload/a8ec649fecb5-20250806.jpg)

開口を変更すれば、ピントをあわせる範囲を広げたり、せばめたりできます。

焦点距離＝30、開口＝1の場合  
![](https://storage.googleapis.com/zenn-user-upload/1446fc7e47bf-20250806.jpg)

焦点距離＝30、開口＝100の場合  
![](https://storage.googleapis.com/zenn-user-upload/94e8aa10b6a0-20250806.jpg)

焦点距離や開口は、被写体（ひまわり畑）とカメラの位置関係／距離に依存するので、シーンごとに調整する必要があります。

### モチーフをかえてみる

ひまわり畑だけとミニチュア感がいまいち出ないないので、過去に作った「渋谷の3Dモデル」を使ってみました。
ちょっとよくなったけど、人や車を配置しないとミニチュアっぽさが足りない。

![](https://storage.googleapis.com/zenn-user-upload/e085604a4610-20250806.jpg)

## まとめ・雑感

ぼかし(LensRenderingPipeline)を使うには、距離の指定が難しかったです。
モチーフはクリア／詳細な方がよいみたい。ぼかしのかかった部分とクリアな部分が明確になっていないと「よくわからん」になってしまいます。


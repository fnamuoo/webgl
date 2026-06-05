## この記事のスナップショット

![](https://static.zenn.studio/user-upload/863fe8495b30-20260605.gif)
*方向転換トリック31*

![](https://static.zenn.studio/user-upload/1f33f4f310c8-20260605.gif)
*方向転換トリック16*

![](https://static.zenn.studio/user-upload/a52986bb1e9c-20260605.gif)
*交差トリック37*

https://playground.babylonjs.com/?BabylonToolkit#VPKBS8

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

## ソース

https://github.com/fnamuoo/webgl/blob/main/149

:::message
ローカルで動かす場合、上記ソースに加え、別途 git 内の [136/js](https://github.com/fnamuoo/webgl/tree/main/136/js) を ./js として配置してください。
:::

## 概要

ドミノ倒しの第二弾です。（全 3回予定）

YouTube にはドミノ倒しの動画がたくさんあります。ここではドミノ倒しのトリック、Viele Dominoes氏の [50 Domino Tricks](https://www.youtube.com/watch?v=o6tTgjoRxWw)、 [100 Domino Tricks](https://www.youtube.com/watch?v=kHQRLo5OMgs) から幾つかを抜粋して Havok で再現してみました。

高く積み上げるトリックは物理演算には不向きなので、今回は対象外としました。摩擦係数や反発係数がデフォルト値のままだと 4層程度が限界です。係数を調整しても 8層程度しかならない上に逆に崩れにくくなります。このあたりがリアルとシミュレーションの違いです。
また、斜めに傾けるトリックは配置（位置や角度の調整）に時間がかかるのでパスしました。 1つ 2つならなんとか作れますが数多くなると作業コストが高すぎます。しかし「見せるトリック」ではあるので数個のトリックに限定しました。

今回の記事のもう一つの目的として、ブロックを並べる際の方向転換やドミノ列の交差の `簡単なやり方を知ること` です。なので深入りはしません。

## やったこと

- トリックの見せ方
- 再現したトリック

### トリックの見せ方

トリックごとに小さなステージ（ブロックを並べたもの）を用意しました。
マウス操作で回転、ズームができるので、色々な方向からブロックの配置を確認できます。
またトリックのキーとなるブロックを色付けしてわかりやすくしてみました。

一時停止やスロー再生はできませんが、何度でも繰り返して再生する（ブロックを倒す）ことはできます。（[Space]キーで開始、[Enter]キーでリセット）
ステージの変更は[n]/[b]キーで行えます。

![](https://static.zenn.studio/user-upload/81c6416620a7-20260606.jpg)
*ステージの例*

### 再現したトリック

再現しているトリックは下記の通りです。
最後の「塔・かべ・やま」は上手く崩れない場合があります。
なお、トリックのNoは開発上のもので意味はありません。（当初は動画のNoと同期させていましたが途中からずれて無意味になってます）

- 直線
  - ![](https://static.zenn.studio/user-upload/687622477f53-20260606.gif)
    *トリック1（時間がたつと滑ってずれてきます）*
  - ![](https://static.zenn.studio/user-upload/1a71b58db4e6-20260606.gif)
    *トリック5*
  - ![](https://static.zenn.studio/user-upload/fed80e22771a-20260605.gif)
    *トリック6*
  - ![](https://static.zenn.studio/user-upload/ba3d7820d3a6-20260605.gif)
    *トリック10*
  - ![](https://static.zenn.studio/user-upload/c70e60f1a082-20260605.gif)
    *トリック12*
  - ![](https://static.zenn.studio/user-upload/003691c8600c-20260605.gif)
    *トリック13*
  - ![](https://static.zenn.studio/user-upload/83c80e85b1aa-20260605.gif)
    *トリック14*
  - ![](https://static.zenn.studio/user-upload/096725883e2d-20260605.gif)
    *トリック302*

- 直線ずれ
  - ![](https://static.zenn.studio/user-upload/4afaf6b84885-20260605.gif)
    *トリック2*
  - ![](https://static.zenn.studio/user-upload/5fe3c8282978-20260605.gif)
    *トリック7（右のブロックは奥に立てかける感じに配置）*
  - ![](https://static.zenn.studio/user-upload/627897169e43-20260605.gif)
    *トリック203*

- 方向転換 (90度)
  - ![](https://static.zenn.studio/user-upload/820d9f973f5d-20260605.gif)
    *トリック3*
  - ![](https://static.zenn.studio/user-upload/fce6ab718a64-20260605.gif)
    *トリック242*
  - ![](https://static.zenn.studio/user-upload/863fe8495b30-20260605.gif)
    *トリック31*
  - ![](https://static.zenn.studio/user-upload/3ae0e8bb8d8c-20260605.gif)
    *トリック216*

- 方向転換 (180度)
  - ![](https://static.zenn.studio/user-upload/1f33f4f310c8-20260605.gif)
    *トリック16（押されるブロックは倒れやすいよう斜めに配置）*
  - ![](https://static.zenn.studio/user-upload/bb342b84d4b8-20260605.gif)
    *トリック18*
  - ![](https://static.zenn.studio/user-upload/6a219e5bc7a8-20260605.gif)
    *トリック22*
  - ![](https://static.zenn.studio/user-upload/1c78f94e545e-20260605.gif)
    *トリック23*
  - ![](https://static.zenn.studio/user-upload/29fa021dff65-20260605.gif)
    *トリック27*
  - ![](https://static.zenn.studio/user-upload/5c88f4bfe40c-20260605.gif)
    *トリック30（最後のブロックは倒れやすいようやや手前にずらす）*
  - ![](https://static.zenn.studio/user-upload/edbce8e6e4aa-20260605.gif)
    *トリック209*

- 交差
  - ![](https://static.zenn.studio/user-upload/1e157967d2f2-20260605.gif)
    *トリック35*
  - ![](https://static.zenn.studio/user-upload/24e6de58cdcf-20260605.gif)
    *トリック36*
  - ![](https://static.zenn.studio/user-upload/a52986bb1e9c-20260605.gif)
    *トリック37*
  - ![](https://static.zenn.studio/user-upload/7e7534014307-20260605.gif)
    *トリック39*
  - ![](https://static.zenn.studio/user-upload/0ebe491db82f-20260605.gif)
    *トリック207*
  - ![](https://static.zenn.studio/user-upload/1d3a8352e84a-20260605.gif)
    *トリック211*
  - ![](https://static.zenn.studio/user-upload/8a534c24d24c-20260605.gif)
    *トリック210*

- 分岐
  - ![](https://static.zenn.studio/user-upload/675339fa405e-20260605.gif)
    *トリック4*
  - ![](https://static.zenn.studio/user-upload/cff29c60dc35-20260605.gif)
    *トリック202*
  - ![](https://static.zenn.studio/user-upload/61cef299b594-20260605.gif)
    *トリック218（T字の両端に隣接するブロックはやや斜めに配置）*

- 塔・かべ・やま
  - ![](https://static.zenn.studio/user-upload/ac2f89d5c142-20260605.gif)
    *トリック8*
  - ![](https://static.zenn.studio/user-upload/7aedb97b095c-20260605.gif)
    *トリック15*
  - ![](https://static.zenn.studio/user-upload/d1935940ee73-20260605.gif)
    *トリック33（時間がたつと自壊します）*
  - ![](https://static.zenn.studio/user-upload/dd2faa092d23-20260605.gif)
    *トリック205（摩擦を高くしており倒れにくい）*
  - ![](https://static.zenn.studio/user-upload/b9d28f6deaea-20260605.gif)
    *トリック214（摩擦を高くしており倒れにくい）*
  - ![](https://static.zenn.studio/user-upload/026b247b7cbe-20260605.gif)
    *トリック301*



## まとめ・雑感

ドミノ倒しの方向転換やドミノ列の交差のやり方を調べていたら色々な方法があることを知り、
お試しがてら再現デモを作ってみました。動画と違って、違う角度から眺めたり、拡大縮小ができるのが利点ですね。

一応、紹介サイト風にまとめはしたものの、次につなげるための個人メモ的なものです。少々雑な点は勘弁してください。

これらのトリックを使って、次回、ドミノ倒しでラインアートに挑戦です。


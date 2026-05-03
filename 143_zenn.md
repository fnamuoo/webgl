# Babylon.js で物理演算(havok)：クランクの高速動作

## この記事のスナップショット

![](https://static.zenn.studio/user-upload/060a45c57493-20260504.gif)
*スナップショット*

https://playground.babylonjs.com/?BabylonToolkit#HJWASU

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

## ソース

https://github.com/fnamuoo/webgl/blob/main/143

:::message
ローカルで動かす場合、上記ソースに加え、別途 git 内の [136/js](https://github.com/fnamuoo/webgl/tree/main/136/js) を ./js として配置してください。
:::

## 概要

今一度、物理演算（havok）を使ったクランク機構について改めて検証しなおしました。

クランク機構は今まで幾つか作成しました。

- [Babylon.js で物理演算(havok)：テオ・ヤンセン機構で歩かせてみる](https://zenn.dev/fnamuoo/articles/faf274102dac5f)
- [Babylon.js で物理演算(havok)：SLのクランク動作で三輪車を動かす](https://zenn.dev/fnamuoo/articles/41327f6c1a9458)
- [Babylon.js + Havokで二足歩行を安定させる：クランク機構を「壊れない形で作る3ステップ」](https://zenn.dev/fnamuoo/articles/eae23c1ca82cc3)
- [Babylon.js で物理演算(Havok)：4足・6足タイプの物理モデル作成](https://zenn.dev/fnamuoo/articles/29c671578da30c)


ゆっくりとした動作なら既存の作り方で問題ないのですが、高速化すると物理モデルに誤差が累積するのか、破綻することに（予期しない動作に）なります。
今回高速回転による動作でも動きが安定する方法（平面による物理拘束、スライドの追加、質量の増大）を紹介します。

![](https://static.zenn.studio/user-upload/58c72858adcd-20260504.gif)
*てこクランク：高速回転で破綻する様子*

![](https://static.zenn.studio/user-upload/060a45c57493-20260504.gif)
*てこクランク：物理拘束を追加して安定した様子*

![](https://static.zenn.studio/user-upload/276d4186ceab-20260504.gif)
*スライダークランク：高速回転でスライダーの先端がブレている様子*

![](https://static.zenn.studio/user-upload/aee2d2934f2d-20260504.gif)
*スライダークランク：物理拘束を追加して先端のブレが収まった様子*

:::message
生成AIの補足：  

「クランク機構」は回転運動を往復運動（またはその逆）に変える機械要素の基本です。物理演算でこれらが「破綻」するのは、各パーツを繋ぐ「ジョイント（関節）」部分に、計算上のわずかな「遊び」が生じ、高速回転の遠心力によってその遊びが拡大してしまうためです。

筆者が行った「LINEAR_Zの制限」は、このジョイントの「遊び」が想定外の方向（Z軸方向）に逃げないように壁を作る作業と言えます。これにより、デジタルな世界でも安定した機械動作が可能になります。
:::

## やったこと

- てこクランクをつくる
- てこクランクを高速回転
- スライダークランクをつくる
- スライダークランクを高速回転
- てこクランク亜種（仮名）をつくる
- てこクランク亜種（仮名）を高速回転

### てこクランクをつくる

改めて「てこクランク」をメッシュで作ります。

![](https://static.zenn.studio/user-upload/ca33b4fe594a-20260504.gif)
*てこクランクのメッシュ*

これに対し、物理モデルを作ります。設計方針は以下のとおりです。

- 自身のフレームの重なりは無視する。
- ベースとなるボディを用意し、固定点はここに紐づける。
- 固定点と力点は同じメッシュ（モーター）にする。
- モーター部分は重く、回転摩擦をやや大きく、やや強い力で回す（ソルバの安定化と大きなトルクをかけることを狙う）。
- 物理拘束は hinge のみ。回転軸は binormal方向。

出来上がった物理モデルは以下のような感じになります。

![](https://static.zenn.studio/user-upload/3c4f97752322-20260504.gif)
*てこクランクの物理モデル*

### てこクランクを高速回転

上記で作った「てこクランク」の物理モデルを高速回転させると、動きが破綻します。

![](https://static.zenn.studio/user-upload/58c72858adcd-20260504.gif)
*てこクランク：高速回転で破綻する様子*

本来は平面内を動作するはずの頂点が、大きく軌道をはずれていることがわかります。
そこで、平面内で動くように物理拘束をかけます。

::::details てこクランクの物理拘束
```js
// x-y平面のみで動くための物理拘束
// P3の位置が大きくずれないようにするため（P0P1の反対側に裏返らないように）の拘束
// P3がZ平面内を動く／平面から距離を取らないハズなのでその平面内の動作に制限する
let sixdof = new BABYLON.Physics6DoFConstraint(
    { pivotA: new BABYLON.Vector3(v2list[3].x+adjx, v2list[3].y+adjy, 0),
      pivotB: new BABYLON.Vector3(pplen[13]/2, 0, 0),},
    [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_Z, minLimit:z, maxLimit:z, },
    ],
    scene);
meshbody._agg.body.addConstraint(mesh._agg.body, sixdof);
```
::::

![](https://static.zenn.studio/user-upload/060a45c57493-20260504.gif)
*てこクランク：物理拘束を追加して安定した様子*

これは興味深い知見で、ある点の動作が平面上にあるはずなのにズレることがあれば同様な手法で安定化させることができます。
上記はx-y平面(`PhysicsConstraintAxis.LINEAR_Z`)でしたが、同様にy-z平面(`PhysicsConstraintAxis.LINEAR_X`)、x-z平面(`PhysicsConstraintAxis.LINEAR_Y`)でも簡単に応用できることがわかると思います。この３つで十分事足りると思いますが、任意の方向を向いた平面であっても、平面上の点との距離(PhysicsConstraintAxis.LINEAR_DISTANCE)を制約することができます。

### スライダークランクをつくる

「スライダークランク」をメッシュで作ります。

![](https://static.zenn.studio/user-upload/163425a40650-20260504.gif)
*スライダークランクのメッシュ*

これに対して物理モデルを作ります。設計方針は てこクランク のときと同じなので割愛します。

出来上がった物理モデルは以下のような感じになります。

![](https://static.zenn.studio/user-upload/19e0b47c398f-20260504.gif)
*スライダークランクの物理モデル*

### スライダークランクを高速回転

上記で作った「スライダークランク」の物理モデルを高速回転させると、スライダーの先端がブレており、上下に動いていることが見て取れます。

![](https://static.zenn.studio/user-upload/276d4186ceab-20260504.gif)
*スライダークランク：高速回転でスライダーの先端がブレている様子*

これはスライダの結合部分が平行移動の物理拘束(Prismatic)になっているため棒の根本だけを掴んだ状態、もう一方の端点が自由端になっていると想像できます。そこで自由端になっている側も物理拘束(Prismatic)で固定します。

::::details スライダークランクの物理拘束
```js
// 高速回転で安定させるための物理拘束
let slider2 = new BABYLON.PrismaticConstraint(
    new BABYLON.Vector3(v_.x+pplen[23]+adjx, v_.y+adjy, z),
    new BABYLON.Vector3(pplen[23]/2, 0, 0), // 反対側の端点
    new BABYLON.Vector3(1, 0, 0),
    new BABYLON.Vector3(1, 0, 0),
    scene
);
meshbody._agg.body.addConstraint(mesh._agg.body, slider2);
```
::::

![](https://static.zenn.studio/user-upload/aee2d2934f2d-20260504.gif)
*スライダークランク：物理拘束を追加して先端のブレが収まった様子*

ちなみに、平行移動の拘束に関して SliderConstraint（移動軸の回転：ロールを許す）でも PrismaticConstraint（移動軸の回転：ロールを許さない）でも大きな違いは見て取れず、スライダークランクにおいてはどちらでも大差ないようです。

### てこクランク亜種（仮名）をつくる

「てこクランク亜種（仮名）」と変な名称ですが、正式な呼称がわからずに暫定で命名しました。
動きは「てこクランク」っぽいですが、辺は２本になり、「てこ」側が固定点でなく穴で動きを拘束するものになります。

[手漕ぎボート](https://www.tamiya.com/japan/products/70114/index.html) のオールをこぐ「手の動き」がこのような動きなので、再現できるのかとチャレンジした次第です。

![](https://static.zenn.studio/user-upload/ce2186832da7-20260504.gif)
*てこクランク亜種（仮名）のメッシュ*

これに対して物理モデルを作ります。設計方針は てこクランク のときと同じなので割愛します。

出来上がった物理モデルは以下のような感じになります。

ちなみに「穴」の物理拘束は、ヒンジ（角度が可変）で且つスライドするという特徴をもちます。
１つにまとめることは出来ないので、ボディメッシュとアンカーメッシュでヒンジ、アンカーメッシュとクランクでスライドという２つの物理拘束で実現させてます。

![](https://static.zenn.studio/user-upload/6cf8762d82a6-20260504.gif)
*てこクランク亜種（仮名）の物理モデル*

### てこクランク亜種（仮名）を高速回転

上記で作った「てこクランク亜種（仮名）」の物理モデルを高速回転させると、右側の固定しているはずの位置からズレていることがわかります。

![](https://static.zenn.studio/user-upload/5b514a57483c-20260504.gif)
*てこクランク亜種（仮名）：高速回転で挙動がブレている様子*

今回に限っては物理拘束では安定化せず、アンカーの質量を大きく、重くすることで安定化しました。

```js
// アンカーのパラメータ
// mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:40}, scene);//軽め：ぶれる
mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.BOX, {mass:500}, scene);//重め：安定させる
```

一方で6DoFで物理拘束を追加しても変化が見られなかったので、同様な処置が入っているのかもしれません。

またバーの質量を軽くしたり、dampingを大きくした場合は効果が非常に小さいものでした。
改善方針として外してはいないもののベストアンサーではなかった様子です。

そもそも２段階で接続して、やや複雑な系になっていることもあり不安定な要素が多いのかもしれません。

![](https://static.zenn.studio/user-upload/d20c5926dee8-20260504.gif)
*てこクランク亜種（仮名）：高速回転で挙動が安定している様子*

## まとめ・雑感

３番目の「てこクランク亜種（仮名）」が本命だったりします。 [手漕ぎボート](https://www.tamiya.com/japan/products/70114/index.html) のムービーをみていると結構な高速回転だったので、「そのような動きができるのか！？」とチャレンジして、ついでに他のクランク機構も確認してみた次第です。

結果的に、脇道（てこクランク、スライダークランク）の検証の方が興味深い結果になりました。
この知見を生かせば、今まで挙動が不安定だった物理モデルも安定して高速に動かせるかもしれません。


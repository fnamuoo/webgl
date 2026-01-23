# Babylon.js で物理演算(havok)：電荷をもったボールを転がす

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/424e3c17e107-20260124.gif)
*正と負の電荷をもったボールの様子（２倍速）*

![](https://storage.googleapis.com/zenn-user-upload/7ae7f9788e31-20260124.gif)
*同じ電荷（負）をもったボールの様子（２倍速）*

https://playground.babylonjs.com/?inspectorv2=true?BabylonToolkit#UVPHV0

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

ソース

https://github.com/fnamuoo/webgl/blob/main/121

ローカルで動かす場合、上記ソースに加え、別途 git 内の [104/js](https://github.com/fnamuoo/webgl/tree/main/104/js) を ./js として配置してください。

## 概要

電荷を持ったボールの簡単なシミュレーションを作成しました。

物理エンジン(havok)では剛体系や衝突は再現できても、クーロン力には対応していないので、別途クーロン力（引力・斥力）の機能を組み込みました。シミュレーションとしては２つの物体・球に電荷をあたえ、坂を転がして球の動きを追跡します。
「見える化」として、ストロボ写真のように残像を残す機能もつけてみました。

## やったこと

- クーロン力をつける
- 坂を転がす
- 残像をつける
- ステージをつくる

### クーロン力をつける

２つの球（mesh1, mesh2）の距離とそれぞれの電荷（._q）からクーロン力を算出し、applyImpulse()で力を加えます。

:::details クーロン力を追加
```js
// クーロン力を追加
scene.onBeforeRenderObservable.add((scene) => {
        let v12 = mesh2.position.subtract(mesh1.position);
        let distsq = v12.lengthSquared();
        let v12n = v12.normalize();
        // クーロン力
        let f = k * mesh1._q * mesh2._q / distsq;
        mesh1._agg.body.applyImpulse(v12n.scale(-f), mesh1.absolutePosition);
        mesh2._agg.body.applyImpulse(v12n.scale(f), mesh2.absolutePosition);
});
```
::::

![](https://storage.googleapis.com/zenn-user-upload/0e8d834577fb-20260124.gif)
*クーロン力なし（２倍速）*

![](https://storage.googleapis.com/zenn-user-upload/16d855c88c23-20260124.gif)
*クーロン力あり（２倍速）*

なお、物理シミュレーションとしては簡略化しています。

- クーロン定数 k はデモ時に任意に設定した値、デモの動きが明確になるように定める
- 体積をもった剛体同士（直径１の球）の距離計算なので０割は考えない（disteq!=0）
- 摩擦(friction)は小さく抑える
- 空気抵抗(damping)は考慮しない

### 坂を転がす

坂を用意してもよいですが、配置する際の位置関係を考えるのが面倒です。
水平面を用意し、重力を斜めにすることでシーンの構成を簡単にします。

::::details 斜めに重力をかける
```js
// 斜めに重力をかける
const hk = new BABYLON.HavokPlugin(false);
const R30 = Math.PI/6;
let ag = -9.8;
scene.enablePhysics(new BABYLON.Vector3(0, ag*Math.cos(R30), ag*Math.sin(R30)), hk);
```
::::

### 残像をつける

レンダリング時に、一定間隔ごとにメッシュのコピーを作成することで、ストロボ写真・残像をつくることができます。

::::details 残像のメッシュを追加
```js
// 残像のメッシュを追加
scene.onBeforeRenderObservable.add((scene) => {
    if (iloop >= 0) {
        if (++iloop > iloopstep) {
            iloop = 0;
            ++iiloop;
            if (STROBO) {
                // mesh1の残像
                let mesh = meshcp1.clone();
                mesh.position.copyFrom(mesh1.position)
                meshInfo.push(mesh);
                // mesh2の残像
                mesh = meshcp2.clone();
                mesh.position.copyFrom(mesh2.position)
                meshInfo.push(mesh);
            }
            if (iiloop > 100) {
                // 更新をスキップ／停止させる
                iloop = -1;
            }
        }
    }
});
```
::::

![](https://storage.googleapis.com/zenn-user-upload/16d855c88c23-20260124.gif)
*残像なし*

![](https://storage.googleapis.com/zenn-user-upload/7ae7f9788e31-20260124.gif)
*残像あり*

### ステージをつくる

ステージには、落下する球を接近させるように壁を設置します。
「左右対称な壁」と「非対称な壁（角度をずらしたもの」）を用意しました。

![](https://storage.googleapis.com/zenn-user-upload/424e3c17e107-20260124.gif)
*対称なステージ*

![](https://storage.googleapis.com/zenn-user-upload/d9a727009b45-20260124.gif)
*非対称なステージ*

## まとめ・雑感

物理エンジンを拡張し、見せ方をちょっと工夫した物理シミュレーションを作成しました。
なんか、学習教材のデモっぽくなってしまいました。

このサンプルは、

- 物理エンジンの拡張例
- 力学と電磁気の融合デモ

として、教育・デモ用途に使えるかもしれません。



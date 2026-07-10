# Babylon.js ：地球儀で玉乗り

## この記事のスナップショット

![](https://static.zenn.studio/user-upload/725d6283276e-20260710.gif)
*sample*

![](https://static.zenn.studio/user-upload/3fa0a96d0eee-20260710.gif)
*サンタバージョン（４倍速）*

https://playground.babylonjs.com/?BabylonToolkit#DOLY33

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

## ソース

https://github.com/fnamuoo/webgl/blob/main/156

:::message
ローカルで動かす場合、上記ソースに加え、別途 git 内の [136/js](https://github.com/fnamuoo/webgl/tree/main/136/js) を ./js として配置してください。
:::

## 概要

球面移動を考えている際に、試しにキャラクターではなく地面／球面を回転させたところ、玉乗りしているような演出になりました。

キャラクターを球面に沿って移動させる方法はいくつかありますが、ここではキャラクターはほぼ中心に置いたまま、球の方を転がします。球の頂点位置／中央位置からのズレに応じた回転角にしています。

地球上の球面移動するデモ、地球儀を玉に見立てて、玉乗りするようなデモを作成しました。球（地球儀）を周回するオブジェクトとして人工衛星を配置、プレイヤーキャラをエンジェル／サンタとしています。

## やったこと

- 球の回転
- 人工衛星の配置と移動
- プレイヤーの用意（エンジェルとサンタ）

### 球の回転

球に地球のテクスチャを貼って、地球儀っぽくしています。

球は原点に配置しています。なのでキャラクターが中心位置からズレたら、その方向に対し、移動方向と上向きベクトルに垂直な方向（binormal方向）を回転軸として、球を回転させます。

![](https://static.zenn.studio/user-upload/725d6283276e-20260710.gif)
*後退＆回転の様子*

::::details 回転操作
```js
// meshMe と meshGrnd の位置関係に応じて meshGrnd を回転させる
let rotMeshGrnd = function() {
    let vdir = meshGrnd.position.subtract(meshMe.position);
    vdir.y = 0;
    let v = vdir.length() * 0.0005;
    if (v == 0) { return; }
    vdir.normalize();
    let vroll = vdir.cross(BABYLON.Vector3.Up()).normalize();
    let quatR = BABYLON.Quaternion.RotationAxis(vroll, v);
    let quat = meshGrnd.rotationQuaternion;
    quat = quatR.multiply(quat);
    meshGrnd.rotationQuaternion = quat;
}

scene.onBeforeRenderObservable.add(()=>{
    rotMeshGrnd();
})
```
::::

### 人工衛星の配置と移動

せっかく、球が地球儀っぽいので、人工衛星を周回させてみます。
こちらのメッシュは、 [Babylon.js ：標準メッシュだけで飛行機・記号・生物を作ってみた](https://zenn.dev/fnamuoo/articles/cf78f87eb44e1a) で作成済みなので、これを利用します。

移動は、適当に周回させるだけですが、向き・姿勢については気をつかって、Ｙ軸マイナス向き（下向き）を地球に向けるようにします。

![](https://static.zenn.studio/user-upload/52f9d988539b-20260710.gif)
*スケールを変更しての周回の様子*

::::details 周回操作
```js
{
    let mesh1 = crPlane49(); // 宇宙：人工衛星
    mesh1._pc = meshGrnd.position;
    mesh1._r1 = grndY+5; // 衛星と地面の距離
    mesh1._rad = 0;
    mesh1._radstep = 0.002;
    mesh1._a = 1;
    mesh1._b = 0.1; // 1;
    mesh1._aph = 0; // R90;
    mesh1._bph = 0; // R90;
    mesh1._pold = mesh1.position.clone();
    mesh1.rotationQuaternion = new BABYLON.Quaternion();
    const R360 = Math.PI*2;
    scene.onBeforeRenderObservable.add(()=>{
        mesh1._rad += mesh1._radstep;
        if (mesh1._rad > 1e5) { mesh1._rad -= 1e5; }
        let rad1 = mesh1._a*mesh1._rad + mesh1._aph;
        let rad2 = mesh1._b*mesh1._rad + mesh1._bph;
        let x = mesh1._r1*Math.sin(rad1)*Math.cos(rad2);
        let y = mesh1._r1*Math.sin(rad1)*Math.sin(rad2);
        let z = mesh1._r1*Math.cos(rad1);
        let p = new BABYLON.Vector3(x,y,z);
        mesh1._pold.copyFrom(mesh1.position);
        mesh1.position = mesh1._pc.add(p);
        if (1) {
            // 衛星向け：meshのz方向を進行方向に向かせたまま、_pc が下向きになるよう姿勢制御
            // 衛星から_pc方向
            let vUn = mesh1._pc.subtract(mesh1.position).normalize().negate();
            // 移動方向ベクトル
            let tangent = mesh1._pold.subtract(mesh1.position).normalize();
            mesh1.rotationQuaternion = BABYLON.Quaternion.FromLookDirectionLH(tangent, vUn);
        }
    });
}
```
::::

### プレイヤーの用意（エンジェルとサンタ）

プレイヤーの移動にはキャラクターコントローラーを用います。
メッシュにはデフォルトで、カプセル型を利用していますが、今回は以前作成した「エンジェル」
を使います。詳しくはこちら、 [Babylon.js ：標準メッシュだけで飛行機・記号・生物を作ってみた](https://zenn.dev/fnamuoo/articles/cf78f87eb44e1a)

また、別バージョンの「サンタ」も用意しました。
といっても、 [Babylon.js で物理演算(havok)：扇風機／UFOでレース](https://zenn.dev/fnamuoo/articles/149b359ba21eeb) で使っていたパネルを流用します。
カメラ位置を斜め後方にずらして、パネルと分かりづらいようにしておきます。

![](https://static.zenn.studio/user-upload/3fa0a96d0eee-20260710.gif)
*サンタバージョン（４倍速）*

クリスマス時期に、サンタの位置をトレースしたニュースがあったなぁと思い出し、悪ノリしましたｗ
気になる方はこちら
> NORAD（北米航空宇宙防衛司令部）による[「サンタ・トラッカー」](https://www.noradsanta.org/en/map)

今の時期（７月）だとサンタさんはバカンス中かな？

## まとめ・雑感

球面移動を考えていたところ、「キャラクターを動かす」のではなく「地球を回転させる」という方法でも十分にそれらしく見せられることが分かりました。

シンプルな処理ながら、地球儀・玉乗り・人工衛星などさまざまな演出へ発展させられるので、球面を舞台にしたゲームのアイデアとしても面白いと感じています。

欠点としては、球の端に寄せすぎてしまうと球から落ちてしまうことや、
球に対して垂直に立っていない（プレイヤーが傾かない）といったところでしょうか。



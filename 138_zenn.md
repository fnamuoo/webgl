# Babylon.js で物理演算(havok)：水汲み水車

## この記事のスナップショット

![](https://static.zenn.studio/user-upload/1de1e370f08f-20260421.gif)
*水汲み水車（２倍速）*

https://playground.babylonjs.com/?BabylonToolkit#AHWR2O

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

## ソース

https://github.com/fnamuoo/webgl/blob/main/138

:::message
ローカルで動かす場合、上記ソースに加え、別途 git 内の [136/js](https://github.com/fnamuoo/webgl/tree/main/136/js) を ./js として配置してください。
:::

## 概要

水流をボールで表現した、水汲み水車の物理シミュレーションを作ってみました。

ちなみに [Babylon.js Tips集](https://scrapbox.io/babylonjs/) に似たものがありました。ただし、こちらはメッシュのみでの動作です。

- [電気回路の仕組み](https://scrapbox.io/babylonjs/%E9%9B%BB%E6%B0%97%E5%9B%9E%E8%B7%AF%E3%81%AE%E4%BB%95%E7%B5%84%E3%81%BF)

## やったこと

- 水路を作る
- 水車を作る（boxで作る）
- 水車を作る（円柱を使う）
- 水汲み水車にする

### 水路を作る

まず、ボールを流す水路というか樋（とい）を作ります。
凹の形状を extrude で伸ばして、形状を作ります。

::::details といの作り方
```js
        // とい（水流／ボールを流す経路）
        let sw=1, sw_=sw/2, sh=2, sh_=sh/2, dslp=0.01;
        const myShape = [
	    new BABYLON.Vector3(-sw_, 0, 0),
	    new BABYLON.Vector3(-sw_, -sh_, 0),
	    new BABYLON.Vector3(sw_, -sh_, 0),
	    new BABYLON.Vector3(sw_, 0, 0),
        ];
        const myPath = [
	    new BABYLON.Vector3(0, -dslp*1.3, -6),
	    new BABYLON.Vector3(0, -dslp*1.0, -4),
	    new BABYLON.Vector3(0, -dslp*0.5, -2),
	    new BABYLON.Vector3(0, 0, 0),
	    new BABYLON.Vector3(0, dslp, 2),
	    new BABYLON.Vector3(0, dslp*2, 4),
	    new BABYLON.Vector3(0, dslp*4+sh_*0.5, 6),
	    new BABYLON.Vector3(0, dslp*6+sh_*0.6, 8),
	    new BABYLON.Vector3(0, dslp*8+sh_*0.8, 10),
	    new BABYLON.Vector3(0, dslp*10+sh_*1.1, 10.1),
        ];
        const scaling = (index, distance) => {
            if (index == myPath.length-1) {
                return 0.001;
            } else if (index > 8) {
                return 1.5;
            }
	    return 1;
        };
        let mesh = BABYLON.MeshBuilder.ExtrudeShapeCustom("star", {shape: myShape, closeShape: false, path: myPath, scaleFunction: scaling, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, { mass: 0, restitution:1.0, friction:0.001}, scene);
        mesh.material = new BABYLON.StandardMaterial("");
        mesh.material.diffuseColor = BABYLON.Color3.Green();
        mesh.material.alpha=0.6;
```
::::

ここに水の代わりにボールを大量に発生させて、水流を再現します。
物理パラメータとして restitution:0.1, friction:0.001 にしています。

frictionの指定し忘れていると粘性の高い油のようになかなか流れないので注意が必要です。

![](https://static.zenn.studio/user-upload/957c22bfec55-20260421.gif)
*といを流れるボールの様子（２倍速）*

### 水車を作る（boxで作る）

水車は、３つの部分、軸（固定）とボディ（回転する部分）と羽（水を受けるところ）に分けて作り上げます。

最初は見た目にこだわらず BOX（直方体）で作ります。ここで見た目にこだわって円柱を使ってしまうと回転軸を考慮する手間が増えるので、BOXで作ったあとに改めて考えることにします。とい（水の流れ）をZ軸マイナス方向に向かうように流すので、水車の回転軸をX軸にします。軸とボディはヒンジでX軸で回転するようにします。

あと、各パーツの幾何的な重なりを無視するように filterMembershipMask, filterCollideMask を設定しておきます。

::::details 軸とボディ
```js
        // 軸／アンカー
        let mesha = null;
        if (1) {
            mesha = BABYLON.MeshBuilder.CreateBox("", {width:3, height:0.2, depth:0.2});
            mesha._agg = new BABYLON.PhysicsAggregate(mesha, BABYLON.PhysicsShapeType.MESH, {mass:0, restitution:1.0, friction:0.001}, scene);
            mesha._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            mesha._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            mesha.physicsBody.disablePreStep = false;
            mesha.position.y = 2;
        }

        let r=2, bladed=1, wwr=r+bladed, www=0.9;
        // ボディ／本体
        mesh = BABYLON.MeshBuilder.CreateBox("", {width:www, height:r*2*0.7, depth:r*2*0.7});
        mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, {mass:100, restitution:1.0, friction:0.001}, scene);
        mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
        mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
        mesh.physicsBody.disablePreStep = false;
        mesh.position.y = 2;
        {
            let hinge = new BABYLON.HingeConstraint(
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(1, 0, 0),
                new BABYLON.Vector3(1, 0, 0),
                scene
            );
            mesha._agg.body.addConstraint(mesh._agg.body, hinge);
        }
```
::::

ボディと羽は LockConstraint で固定したいところですが、角度を付けて固定することができないようなので 6DoFConstraint で（接続角度指定のLOCK）として固定させます。

::::details ボディと羽
```js
        // 羽
        let nrad=4;
        for (let irad=0; irad<nrad; ++irad) {
            let rad=irad*R45;

            // ブレードを傾けて固定するために 6dof を使う
            let meshb = BABYLON.MeshBuilder.CreateBox("", {width:www, height:0.1, depth:wwr*1.98});
            meshb._agg = new BABYLON.PhysicsAggregate(meshb, BABYLON.PhysicsShapeType.BOX, {mass:1, restitution:1.0, friction:0.001}, scene);
            meshb._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
            meshb._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
            meshb.physicsBody.disablePreStep = false;
            meshb.rotation = new BABYLON.Vector3(rad, 0, 0);
            meshb.position.y = 2;
            let joint = new BABYLON.Physics6DoFConstraint(
                { pivotA: new BABYLON.Vector3(0, 0, 0),
                  pivotB: new BABYLON.Vector3(0, 0, 0),},
                [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit:0, maxLimit:0, },
                 { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit:rad, maxLimit:rad, },
                 { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit:0, maxLimit:0, },
                 { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit:0, maxLimit:0, },
                ],
                scene);
            mesh._agg.body.addConstraint(meshb._agg.body, joint);
        }

```
::::

ボールを流してみて、水車がうまく回ってくれました。

![](https://static.zenn.studio/user-upload/6820332a07c4-20260421.gif)
*水車（四角）が回る様子（４倍速）*

### 水車を作る（円柱を使う）

軸、ボディに円柱を使って、水車っぽく仕上げます。
しかし、円柱は軸がデフォルトでY軸になっているので、X軸に傾ける必要があります。見た目を回転させるだけでなく、ヒンジで指定する軸にも注意する必要がありました。

::::details 軸とボディ
```js
// 見た目（回転軸をX軸）にするための回転
//.. hingeの軸指定がY成分になっていることに注意
// 軸（アンカー
let mesha = null;
if (1) {
    mesha = BABYLON.MeshBuilder.CreateCylinder("", {height:3, diameter:0.2});
    // mesha = BABYLON.MeshBuilder.CreateBox("", {width:3, height:0.2, depth:0.2});
    mesha._agg = new BABYLON.PhysicsAggregate(mesha, BABYLON.PhysicsShapeType.MESH, {mass:0, restitution:1.0, friction:0.001}, scene);
    mesha._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
    mesha._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
    mesha.physicsBody.disablePreStep = false;
    mesha.rotation = new BABYLON.Vector3(0, 0,R90);  // <-- 見た目の回転を追加
    mesha.position.y = 2;
}

let r=2, bladed=1, wwr=r+bladed, www=0.9;
// 本体
mesh = BABYLON.MeshBuilder.CreateCylinder("", {height:www, diameter:r*2});
// mesh = BABYLON.MeshBuilder.CreateBox("", {width:www, height:r*2*0.7, depth:r*2*0.7});
mesh._agg = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, {mass:100, restitution:1.0, friction:0.001}, scene);
mesh._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
mesh._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
mesh.physicsBody.disablePreStep = false;
mesh.rotation = new BABYLON.Vector3(0, 0,R90);  // <-- 見た目の回転を追加
mesh.position.y = 2;
{
    let hinge = new BABYLON.HingeConstraint(
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 1, 0),  // <-- 回転軸を Y軸に変更
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    mesha._agg.body.addConstraint(mesh._agg.body, hinge);
}
```
::::

ボディが傾いている都合上、ボディと羽の固定の仕方も変わります。

::::details ボディと羽
```js
// 羽の接続位置・成分を変更して指定
// 羽
let nrad=4;
for (let irad=0; irad<nrad; ++irad) {
    let rad=irad*R45;

    // ブレードを傾けて固定するために 6dof を使う
    let meshb = BABYLON.MeshBuilder.CreateBox("", {width:0.1, height:www, depth:wwr*1.98});
    meshb._agg = new BABYLON.PhysicsAggregate(meshb, BABYLON.PhysicsShapeType.BOX, {mass:1, restitution:1.0, friction:0.001}, scene);
    meshb._agg.shape.filterMembershipMask = FILTER_GROUP_ARCH_1;
    meshb._agg.shape.filterCollideMask = FILTER_GROUP_GRND;
    meshb.physicsBody.disablePreStep = false;
    meshb.rotation = new BABYLON.Vector3(rad, 0, R90);  // ボディに合わせて回転を変更
    meshb.position.y = 2;
    let joint = new BABYLON.Physics6DoFConstraint(
        { pivotA: new BABYLON.Vector3(0, 0, 0),
          pivotB: new BABYLON.Vector3(0, 0, 0),},
        [{ axis: BABYLON.PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit:0, maxLimit:0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_X, minLimit:0, maxLimit:0, },
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Y, minLimit:rad, maxLimit:rad, },  // ボディに合わせて角度の指定軸を変更
         { axis: BABYLON.PhysicsConstraintAxis.ANGULAR_Z, minLimit:0, maxLimit:0, },
        ],
        scene);
    mesh._agg.body.addConstraint(meshb._agg.body, joint);

}
```
::::

![](https://static.zenn.studio/user-upload/06284be8bc9d-20260421.gif)
*水車（円柱）が回る様子（４倍速）*

### 水汲み水車にする

水汲み水車にするために、水車の厚みを半分にして、削った半分の空間に水を汲むメッシュを配置します。水を汲むメッシュは球を半分にしたお椀を羽の横に固定します。また、水をすくうような角度をつけて取り付けます。

![](https://static.zenn.studio/user-upload/690fa122876e-20260421.jpg)
*水をくみ上げるメッシュ*

またくみ上げた水を受ける「とい」を水路と同じように作成します。

![](https://static.zenn.studio/user-upload/23b3d73317cf-20260421.jpg)
*くみ上げた水を受ける「とい」*

今回もまずはBOXで確認した上で、円柱の水車に適用します。

![](https://static.zenn.studio/user-upload/ea46b0e9fc27-20260421.gif)
*水汲み水車（四角）（２倍速）*

![](https://static.zenn.studio/user-upload/1de1e370f08f-20260421.gif)
*水汲み水車（円柱）（２倍速）*

## まとめ・雑感

最初の「水路にボールを流す」がうまく動作せず（しばらく摩擦のことに気が付かず）につまずき、水車を組み上げるところでも羽の向きや円柱との結合に一苦労しました。
あと思いのほかボールが多くないとお椀でボールをすくい上げることができなかったので、大量にボールを湧き出させており かなり処理が重いです。ボールを大きくしたら数を減らして、処理を軽くできそうだけど、「すくい上げる」ことが難しくなりそうだし、流れが無いと水車が回らないので、ある程度の水路の距離を確保しないといけないので悩ましい限りです。
大量の粒子が必須な今回の物理シミュレーションは少々厳しかったかもですね。


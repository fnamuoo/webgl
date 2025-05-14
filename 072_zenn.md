# Babylon.js の基礎調査：perlinノイズを使ってみる

## この記事のスナップショット

二次元のperlinノイズを濃淡で示したもの  
![](https://storage.googleapis.com/zenn-user-upload/7b2a9d4d60ba-20250514.jpg)

二次元のperlinノイズで地形を作ったもの  
![](https://storage.googleapis.com/zenn-user-upload/09097d6df867-20250514.jpg)

NoiseBlock.noiseのデモ  
https://playground.babylonjs.com/#TBVYQF

perlinノイズで凹凸した地形に道路を通す  
https://playground.babylonjs.com/full.html#TBVYQF#3


（コードを見たい人はURLから `full.html` を消したURLを指定してください）

ソース

https://github.com/fnamuoo/webgl/blob/main/072

- 072_perlin_v1 .. perlin@josephgのデモ  
- 072_perlin_v2 .. NoiseBlock.noiseのデモ  
- 072_perlin_v3 .. NoiseBlock.noiseで地形を作成
- 072_perlin_v5 .. 凹凸な地形に道路を通す

ローカルで動かす場合、./js 以下のライブラリは 069/js を利用してください。

## 概要

babylonjs で実装されているperlinノイズ使ってみます。
ドキュメントで説明されている[proceduralTextures](https://doc.babylonjs.com/features/featuresDeepDive/materials/using/proceduralTextures/)はテクスチャ寄りの説明で、関数として使うには不向きです。
そこでperlinノイズの機能が実装されていると思われるNoiseBlockクラスのnoiseを使います。

perlinノイズで地形の凹凸を作ったところ  
![](https://storage.googleapis.com/zenn-user-upload/09097d6df867-20250514.jpg)

一方で、javascriptのperlin ノイズといえば、josephgさまの[git](https://github.com/josephg/noisejs)にあるperlin.jsが検索上位でよくお見掛けします。
運よくPlayGround でこのライブラリを使った[デモ](https://www.babylonjs-playground.com/#WP23KY)をみかけたので、これも交えつつみていきたいとおもいます。

## やったこと

- josephgさまのperlinノイズをみる
- NoiseBlock.noiseのperlinノイズ
- perlinノイズを使ってみる

### josephgさまのperlinノイズをみる

みつけた[デモ](https://www.babylonjs-playground.com/#WP23KY)はよくできているのですが、残念なことに関数の使い方が間違えてます。
ライブラリの関数noise.perlin2(x,y)やnoise.perlin3(x,y,z)は値域が[-1,1]です。
デモのように絶対値をとると 0付近の勾配が急になってしまいます。[0,1]の範囲で取得したいならば
プラス１して２で割る `(perlin3()+1)/2` ことをしないと正しくありません。

```js
// 間違った使い方
let color = Math.abs(noise.perlin3(px / MAX * 4, py / MAX * 4, time));
// 正しい使い方
let color = Math.abs((noise.perlin3(px / MAX * 4, py / MAX * 4, time)+1)/2);
```

正しい使い方のデモ  
https://playground.babylonjs.com/#TBVYQF

perlin@josephgさまのデモ  
![](https://storage.googleapis.com/zenn-user-upload/7b2a9d4d60ba-20250514.jpg)

perlin.jsをPlayGroundで使うには今回のようにソースにコピペするのが確実です。[Playgroundで外部JSを使用する方法](https://scrapbox.io/babylonjs/Playground%E3%81%A7%E5%A4%96%E9%83%A8JS%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95)があるみたいなんですが、自分のところでは上手くいかず、不安定ながら下記コードをcreateSceneの前に記載して動くことを確認してます。

```js
// たまに失敗するけど、たまに成功する
const SCRIPT_URL = "https://raw.githubusercontent.com/josephg/noisejs/master/perlin.js";
fetch(SCRIPT_URL).then(r=>{return r.text()}).then(t=>eval(t)).then(()=>{
    noise.seed(1); // for perlin
})
```

あとあと調べたらサンプルがありました。
[マイクラ風の地形](https://scrapbox.io/babylonjs/%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%A9%E9%A2%A8%E3%81%AE%E5%9C%B0%E5%BD%A2)
でも、複数のライブラリだと入れ子になるのかな？

いや babylonjs ならこんな苦労せずともperlinノイズくらい実装済みだよね？と探してたどり着いたのが次のNoiseBlockクラスです。

### NoiseBlock.noiseのperlinノイズ

NoiseBlockクラスのnoise関数について説明や使用例がなかったので使い方は手探りです。

公式のドキュメント[NoiseBlock](https://doc.babylonjs.com/typedoc/classes/BABYLON.NoiseBlock#noise)には

```js
noise(
    octaves: number,
    roughness: number,
    _position: Vector3,
    offset: Vector3,
    scale: number,
): number
```

のみで、まともな説明がありません。
newしたインスタンスをconsole.log で出力させ変数名やその値を確認したり、goolgeのAI検索結果(keys=perlin,octaves,roughness)から引数はおおよそ次のような意味であろうと結論付けました。

引数      | データ型 |デフォルト値（範囲）|説明
----------|----------|--------------------|---------------------
octaves   | number   | 2 [0, 16]          |複数のオクターブ（周波数）の重ね合わせ
roughness | number   | 0.5 [0, 1]         |粗さ。小さいほど低周波・滑らかに、大きいほど高周波・粗く
_position | Vector3  | --                 |座標
offset    | Vector3  | --                 |座標をずらすオフセット、相対ベクトル
scale     | number   | 1[-MAX,MAX]        |座標の倍率

- octaves
  - 0 が重ね合わせのない perlinノイズ。1,2,..と増やすごとに、より周期の短いperlinノイズを重ね合わせていく

   - octaves=0 のとき  
     ![](https://storage.googleapis.com/zenn-user-upload/8561dd299aeb-20250514.jpg)

   - octaves=1 のとき  
    ![](https://storage.googleapis.com/zenn-user-upload/6fa900b64c56-20250514.jpg)

   - octaves=2 のとき  
    ![](https://storage.googleapis.com/zenn-user-upload/aff9cb4413f6-20250514.jpg)

  - perlinノイズで地形を作る際、周波数の違うものを重ねて作ることがよくあります。
    [webgl_geometry_minecraft](https://threejs.org/examples/?q=geo#webgl_geometry_minecraft)
    ```js
    let quality = 2;
    for ( let j = 0; j < 4; j ++ ) { // ４層のperlinノイズを重ね合わせ
    	if ( j === 0 ) for ( let i = 0; i < size; i ++ ) data[ i ] = 0;
    	for ( let i = 0; i < size; i ++ ) {
    		const x = i % width, y = ( i / width ) | 0;
    		data[ i ] += perlin.noise( x / quality, y / quality, z ) * quality;
    	}
    	quality *= 4;
    }
    ```
    そのような重ね合わせの手間をoctavesで省いてくれます。

- roughness
  - 今回、粗さ、滑らかさの違いがわかりやすい事例が作れなかったので説明をスキップ

- scale
  - このスケールを変更することで同じ「等間隔の座標値」を渡しても文様が変わってきます。

   - scale=1 のとき  
    ![](https://storage.googleapis.com/zenn-user-upload/f56ad5da118d-20250514.jpg)

   - scale=1/2 のとき  
    ![](https://storage.googleapis.com/zenn-user-upload/4540b02ca76c-20250514.jpg)

   - scale=1/4 のとき  
    ![](https://storage.googleapis.com/zenn-user-upload/8561dd299aeb-20250514.jpg)

  - このスケールは座標(x,y,z)のすべてに一様に変更します。
    二次元(x,y)を時間で変化させる(x,y,time)のような使い方をするときに
    スケールを指定すると時間軸まで影響されるので(x,y)のみスケーリングするよう注意が必要です。

seedがありませんが、offsetでランダムな位置を指定するか、二次元なら座標のzを使えば回避できます。

NoiseBlock.noiseのデモ  
https://playground.babylonjs.com/#TBVYQF#1

### perlinノイズを使ってみる

perlinノイズで凹凸のある地形を作ってみます。

```js
let nb = new BABYLON.NoiseBlock();
const nbvzero = new BABYLON.Vector3(0,0,0);
// perlinの文様を変えずに meshサイズを変更するには nbscale*gridratio=一定とする
let gridratio = 0.1, nbscale = 0.02/gridratio;
let rootPath = [];
let size = 100, size_ = size/2;
let nmin = -size_, nmax = size_+1;
let yratio = 5; // 高低差の倍率
for (let iz = nmin; iz < nmax; ++iz) {
    let z = iz*gridratio;
    let path = []
    for (let ix = nmin; ix < nmax; ++ix) {
        let x = ix*gridratio;
        let y = nb.noise(8,   // octaves: number, def=2 [0, 16]
                          0.5, // roughness: number,  def=0.5 [0, 1]  小:= 低周波・滑 -- 大:= 高周波・粗
                          new BABYLON.Vector3(x,z,0), // _position: Vector3,
                          nbvzero, // offset: Vector3,
                          nbscale  // scale :number  def=1 [-MAX,MAX]  x,y,zの係数
                        );
        y *= yratio;
        path.push(new BABYLON.Vector3(x, y, z));
    }
    rootPath.push(path);
}
trgMesh = BABYLON.MeshBuilder.CreateRibbon("ribbon", {pathArray: rootPath, sideOrientation: BABYLON.Mesh.DOUBLESIDE});
trgMesh.material = new BABYLON.GradientMaterial("grad", scene);
trgMesh.material.topColor = new BABYLON.Color3(0.9, 0.2, 0.2);
trgMesh.material.bottomColor = new BABYLON.Color3(0.2, 0.2, 0.9);
trgMesh.material.smoothness = 0.6*yratio; // 高低差yratioを変えてmaterialを変えないために、yratio に比例させる
trgMesh.material.scale = 0.08*yratio;     // (同上)
trgMesh.material.wireframe = true;
trgAgg = new BABYLON.PhysicsAggregate(trgMesh, BABYLON.PhysicsShapeType.MESH, { mass: 0.0, restitution:0.05}, scene);
```

perlinノイズの凹凸地形  
![](https://storage.googleapis.com/zenn-user-upload/09097d6df867-20250514.jpg)

おまけとして、メッシュのサイズを大きくして、円を地形に合わせて高さを上下（スプラインで補間）したものを表示。

地形に合わせて上下させた円  
![](https://storage.googleapis.com/zenn-user-upload/8e024a362ed4-20250514.jpg)

そこにExtrudeShapeで（凹）を押し出して道を作り、キャラクターコントローラーを配置してみました。

地形にあわせた道路の接地（修正前）  
![](https://storage.googleapis.com/zenn-user-upload/1a26055e7623-20250514.jpg)

道路の上に地形のメッシュが重なっているところを何とかしたいけど、地形がribbonで面なためか[CSG2](https://doc.babylonjs.com/features/featuresDeepDive/mesh/mergeMeshes/)の差分（subtract）は使えないので、力技で地形データをいじって、道路より下になるよう高さを調整しました。

地形にあわせた道路の接地（高さ修正後）  
![](https://storage.googleapis.com/zenn-user-upload/faa7c3a85c97-20250514.jpg)

perlinノイズで凹凸した地形に道路を通す  
https://playground.babylonjs.com/full.html#TBVYQF#3

## まとめ・雑感

babylonjsもバージョン8になっているから、perlinノイズくらい実装されているだろうと調べ始めたらほとんど資料がなくて苦労しました。みんなどうしているのかな？

パフォーマンスを確認したわけではないですが、josephgさまのperlin.jsの方が速い感じがします。
ただオクターブの重ね合わせ等の使い勝手を考えるとNoiseBlock.noiseも悪くない気がします。

今回紹介したNoiseBlockの使い方は暫定で申し訳ないです。
もっと効率的に扱う方法がありそうだけれど、開発ソースを読み解かないとわからないのでこれ以上はちょっと。


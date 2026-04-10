# Babylon.js で物理演算(havok)：ミー散乱と奇岩で山霞をつくる

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/fc79f9f2c8a8-20260410.gif)
*スナップショット（２倍速）*

https://playground.babylonjs.com/?BabylonToolkit#6FNK9V

:::message
上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。
:::

### ソース

https://github.com/fnamuoo/webgl/blob/main/134

:::message
ローカルで動かす場合、上記ソースに加え、別途 git 内の [104/js](https://github.com/fnamuoo/webgl/tree/main/104/js) を ./js として配置してください。
:::

## 概要

[Babylon.js 9.0 Release Video](https://www.youtube.com/watch?v=Th9mD_D5DrQ) には、 [Atmosphere](https://doc.babylonjs.com/addons/atmosphere/) を使ったシーンがあります。

![](https://storage.googleapis.com/zenn-user-upload/d2db1bf65d12-20260410.jpg)
*デモムービーのスナップショット*

この表現を再現したくて、似たものを作りました。

![](https://storage.googleapis.com/zenn-user-upload/e7ebb2fcba20-20260410.jpg)
*再現*

公式のデモ、 [Increased Mie Scattering](https://playground.babylonjs.com/#K1Y1Q8#84) をベースにして、これに地形（六角柱の奇岩／柱状節理を表現）や太陽を追加し、スライダ（太陽の動き）を自動化しました。また Atmosphereを使うにあたっての「ハマりどころ」（注意点）についても述べ、関連する「霧」についても少し述べます。

なお、作成にあたり公式のドキュメント [Atmosphere](https://doc.babylonjs.com/addons/atmosphere/) を見てもヒントになるものは書かれていませんでした。playground を検索して [Atmosphere on cloudy terrain](https://playground.babylonjs.com/#RG1SRM#0) を見つけたことで一気に解決しました。（これはデモムービーで使われていたもの、若しくはそれに類するものらしいです）
これが見つからなかったら作成を諦めていました。

## やったこと

本作品について、下記項目について概要を説明します。

- 大気
- 地形
- 太陽
- 太陽の移動アニメーション

### 大気

[Atmosphere](https://doc.babylonjs.com/addons/atmosphere/) の「レイリー散乱」と「ミー散乱」を使います。
それぞれ以下のような効果を持ってます。詳細な説明は優良なサイトが外部にありますので専門家にお任せします。

- レイリー散乱
  - 空の青さ
  - 夕焼けの赤み
- ミー散乱
  - 霞（かすみ）
  - 霧や雲っぽい効果


```js
        // レイリー散乱
        // atmosphere.physicalProperties.rayleighScatteringScale = 0.6; // 効果がわかりにくい
        atmosphere.physicalProperties.rayleighScatteringScale = 2.0;
        // atmosphere.physicalProperties.rayleighScatteringScale = 5.0; // 朝焼け・夕焼けの赤みが強くなる
```

![](https://storage.googleapis.com/zenn-user-upload/4eee98025f27-20260410.jpg)
*レイリー散乱の様子*

![](https://storage.googleapis.com/zenn-user-upload/b8bf53b7dab1-20260410.jpg)
*レイリー散乱（効果強：rayleighScatteringScale = 5.0）の様子*

```js
        // ミー散乱
        atmosphere.physicalProperties.mieScatteringScale = 10;
        // atmosphere.physicalProperties.mieScatteringScale = 200; // 霧におおわれた感じ
        // atmosphere.physicalProperties.mieScatteringScale = 1000; // 雲にすっぽり埋もれた感じ
```

![](https://storage.googleapis.com/zenn-user-upload/5695cd2045d7-20260410.jpg)
*ミー散乱の様子*

![](https://storage.googleapis.com/zenn-user-upload/3b10b68c27a5-20260410.jpg)
*ミー散乱の様子（効果強：mieScatteringScale = 200）*

![](https://storage.googleapis.com/zenn-user-upload/17345934d25e-20260410.jpg)
*ミー散乱の様子（効果極：mieScatteringScale = 1000）*

「レイリー散乱」と「ミー散乱」を １つのAtmosphereモジュールで実行すればよいのですが、
２つのAtmosphereモジュールでそれぞれ定義して、効果を重ね合わせるように実行すると「夕焼け」がきれいに再現できたのでこちらの方法を利用します。

![](https://storage.googleapis.com/zenn-user-upload/1820ce2ebfe2-20260410.jpg)
*レイリー散乱＋ミー散乱（一緒）の夕焼け*

![](https://storage.googleapis.com/zenn-user-upload/3ef2a7b086d5-20260410.jpg)
*レイリー散乱＋ミー散乱（別々で重ね）の夕焼け*

### 地形

デモムービーでは凹凸のある平面で地形を表現していました。ここでは六角柱で地形の凹凸を表現します。

最初は四角柱で作っていましたが柱状節理ぽい見た目でした。ならばと、柱状節理に寄せて、形状もメジャーな六角柱にしました。作成には円柱(Cylinder)の tessellation:6 を指定して六角柱にします。尚、高さについては perlinノイズで座標値に基づいて決定しています。perlinノイズは、 [Babylon.js の基礎調査：perlinノイズを使ってみる](https://zenn.dev/fnamuoo/articles/535eac8879957a) で、また六角柱の配置には、 [Solid Particle System](https://doc.babylonjs.com/features/featuresDeepDive/particles/solid_particle_system/) のこちらのデモ [Simple example of an immutable town with 80,000 buildings](https://playground.babylonjs.com/#2FPT1A#36) を参考にしました。大き目のスケール、200,000 x 200,000の範囲に 200,000個のmeshを最大の高さ 5,000で配置しています。また、散乱の効果を最大限見せるために、光源側に地形を移動させています。

![](https://storage.googleapis.com/zenn-user-upload/3b204f81140a-20260410.jpg)
*柱状節理*

### 太陽

デモ [Increased Mie Scattering](https://playground.babylonjs.com/#K1Y1Q8#84) では太陽がないので、光源の方向にあたる位置に太陽のメッシュを配置します。太陽は [VolumetricLightScatteringPostProcess](https://doc.babylonjs.com/features/featuresDeepDive/lights/volumetricLightScattering/) で表現します。これは [Babylon.js：日食／ダイヤモンドリング](https://zenn.dev/fnamuoo/articles/923d2db380e3c7) でも使った手法になります。

今回は（スライダの操作時に）光源の方向（照らす方向）を計算していることを利用して、逆向きのベクトル位置をもとめ、太陽を配置しています。表示しているスケール（１００万程）が大きいので倍率も同程度必要になります。

```js
godrays.mesh.position = light.direction.scale(-1000000);
```

これにより太陽の動きと大気の変化の様子が連動してわかり易くなりました。

![](https://storage.googleapis.com/zenn-user-upload/13a1495d9781-20260410.gif)
*太陽の動き（日の入り）４倍速*

### 太陽の移動アニメーション

デモ、 [Increased Mie Scattering](https://playground.babylonjs.com/#K1Y1Q8#84) には、スライダがついていますが、これを自動で動かすための機能を加えます。GUI に ON/OFF のチェックボックスを追加します。レンダリング時の処理でチェックがONのときはスライダの値を増やすようにします。（スライダの値が変わると光源の方向・位置を再計算する仕組みは出来上がっているので特別な処理は不要です）ただ、日没後から日の出前までは代り映えしないので、スライダを速めに進めます。

::::details スライダ／太陽を自動で移動
```js
    scene.registerAfterRender(function() {
        if (bAutoSlide) {
            let vrate = sunSlider.value/sunSlider.maximum;
            if (vrate < 0.2 || vrate > 0.8) {
                // 深夜は速めに動かす
                ++sunSlider.value;
            } else {
                // 日中はゆっくり動かす
                sunSlider.value += 0.1;
            }
            if (sunSlider.value >= sunSlider.maximum) {
                sunSlider.value = sunSlider.minimum;
            }
        }
    });
```
::::

![](https://storage.googleapis.com/zenn-user-upload/3247fdb4b3c8-20260410.jpg)
*GUI／チェックボックス*

## ハマりどころ（重要）

本記事の核心といっても過言ではありません。試行錯誤したうえでの結論であり、今後のAPI変更で変わるかもしれません。過信はしないことをお勧めします。

  - スケール
  - メッシュ形状
  - 材質
  - 光源
  - カメラの向き
  - 処理する順番


### スケール

本作品のスケールで「200,000」と記述している通り、大きなスケールにしないと散乱の効果が出ません。「10,000」でもなんとか可能ですが「1,000」まで落とすと効果がなくなります。これは Atmosphereが「現実スケール前提」のためのようです。距離の単位がメートルであることを踏まえると 1,000(=1km)では散乱が発生しないことを再現しているようです。

![](https://storage.googleapis.com/zenn-user-upload/762728b1f5a9-20260410.jpg)
*スケール10,000*

![](https://storage.googleapis.com/zenn-user-upload/9a0d18862c1e-20260410.jpg)
*スケール1,000*

またスケールが大きくなる都合上、カメラの maxZ を 0 にしておかないとダメなようです。

```js
    camera.maxZ = 0.0; // 0 for an infinite far plane
```

### メッシュ形状

対象とする地形メッシュを表現するものが、平面でも Solid Particle System でも大丈夫ですが、形状には気を付ける必要があります。perlinノイズや正弦波のように起伏があるのが望ましいです。ランダム(Math.random()や均一な高さだと散乱の効果がわからなくなります。

形状          | 散乱の効果
--------------|:---------:
凹凸（perlin) |  ○
凹凸（sin)    |  ○
凹凸（random) |  ×
均一          |  ×

![](https://storage.googleapis.com/zenn-user-upload/004ea452e074-20260410.jpg)
*perlinノイズの地形*

![](https://storage.googleapis.com/zenn-user-upload/4ebb2a70e762-20260410.jpg)
*sin波の地形*

![](https://storage.googleapis.com/zenn-user-upload/2956c317e578-20260410.jpg)
*ランダムの地形*

![](https://storage.googleapis.com/zenn-user-upload/3a1f3a18afe2-20260410.jpg)
*均一な高さの地形*

### 材質

material には PBRMaterial を指定するのが良いみたいです。
公式ドキュメント [PBRMaterial](https://doc.babylonjs.com/addons/atmosphere/#pbrmaterial) では PBRMaterial を勧めています。これを使うことで散乱しているように見えます。テクスチャを指定したメッシュを使っていると散乱の効果が確認できませんでした。

![](https://storage.googleapis.com/zenn-user-upload/53f9656bf612-20260410.jpg)
*PBRMaterialを使っている場合*

![](https://storage.googleapis.com/zenn-user-upload/53093cd0b74b-20260410.jpg)
*テクスチャを指定した場合*

![](https://storage.googleapis.com/zenn-user-upload/109c1f1062a7-20260410.jpg)
*material 指定なし*

### 光源

光源の位置、光線の方向によって見え方が大きく変わります。
光源が地平線より下のとき、光源が頂点にあるとき、地平線近く、ではそれぞれ見栄え、散乱の効果がかなり変わります。

![](https://storage.googleapis.com/zenn-user-upload/2177b38e39f2-20260410.jpg)
*光源が地平線より下*

![](https://storage.googleapis.com/zenn-user-upload/dcd0c23a539a-20260410.jpg)
*光源が地平線近く*

![](https://storage.googleapis.com/zenn-user-upload/5e483fd20bdd-20260410.jpg)
*光源が頂点*

#### カメラの向き

光源に関連して、カメラの向きも重要です。
逆光の位置（光源にカメラを向ける）が効果を一番確認しやすいです。逆に順光（光の向きと同じ向き）でカメラを向けると効果がわかりにくくなります。このため、順光方向よりも逆光方向にメッシュを配置するのが効果的になります。

![](https://storage.googleapis.com/zenn-user-upload/66f19690978a-20260410.jpg)
*昼間の逆光方向*

![](https://storage.googleapis.com/zenn-user-upload/006b638c990f-20260410.jpg)
*昼間の順光方向*

![](https://storage.googleapis.com/zenn-user-upload/c5b2dbef1427-20260410.jpg)
*夕日の逆光方向*

![](https://storage.googleapis.com/zenn-user-upload/23ab00b4ba59-20260410.jpg)
*夕日の順光方向*

#### 処理する順番

処理の記述順を

```
Light -> Atmosphere -> Mesh
```

の順番で記述しないとダメらしく、

```
Light -> Mesh -> Atmosphere
```

の順番で記述していると散乱の効果が正しく表示されませんでした。

経験則で、理由はわかっていません。

## 余談：霧

今回の [Atmosphere](https://doc.babylonjs.com/addons/atmosphere/) を使わずとも [Fog](https://doc.babylonjs.com/features/featuresDeepDive/environment/environment_introduction/) でも似たような効果は作れます。
こちらは小さなスケールでも使えますが、ただ全域（全方向）に影響してしまうのが難点です。

![](https://storage.googleapis.com/zenn-user-upload/f87e4096d40a-20260410.jpg)
*fog*

Atmosphere では skyboxが使えません（Atmosphereが優先される）が、fogなら skybox と併用できます。ゲームづくりなどでお手軽に効果を望むなら fog がお勧めです。

## まとめ・雑感

Atmosphereに関する資料が少なく APIとしては荒削りな感じなんですかね？

生成ＡＩに
「babylon.js で遠方の景色が大気の層の効果でかすむようにするには？」
と聞いても fog での方法しか答えてくれないのは Atmosphereの知名度が低いからかもしれません。これから Atmosphereを使った作品が増えてくれることを期待します。


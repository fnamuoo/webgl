# Babylon.js：日食／ダイヤモンドリング

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/c7e98e63ebdd-20260103.jpg)  
*ダイヤモンドリング*

https://playground.babylonjs.com/?inspectorv2=true?BabylonToolkit#U3KVTN

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

ソース

https://github.com/fnamuoo/webgl/blob/main/118

ローカルで動かす場合、上記ソースに加え、別途 git 内の [104/js](https://github.com/fnamuoo/webgl/tree/main/104/js) を ./js として配置してください。

## 概要

[Volumetric Light Scattering Post Process](https://doc.babylonjs.com/features/featuresDeepDive/lights/volumetricLightScattering/) にある サンプル [Basic Example](https://playground.babylonjs.com/?inspectorv2=true#AU5641) を改修して日食を再現しました。更にダイヤモンドリングになるよう、光源を追加してみたり、レンズフレアを追加してみました。

## やったこと

- 日食をつくる
- 光源を追加してダイヤモンドリングをつくる
- レンズフレアでダイヤモンドリングをつくる
- ブラッシュアップ

### 日食をつくる

サンプル [Basic Example](https://playground.babylonjs.com/?inspectorv2=true#AU5641) のドクロを球に置き換えれば、簡単に日食が再現できます。

Ver.1.0  
https://playground.babylonjs.com/?inspectorv2=true?BabylonToolkit#U3KVTN#1

マウス操作で回転させたり、ズームイン／ズームアウトしていると、金環日食のときにダイヤモンドリングっぽくならないことに気が付きます。

babylon.js 的には精一杯表現しているのかもしれませんが、物足りないので次に示す細工を施します。


### 光源を追加してダイヤモンドリングをつくる

「光が足りないなら足せばいいじゃないか」という発想で光源を追加します。

追加するといっても、配置した位置によっては影？をつくってしまうので奥に配置します。

![](https://storage.googleapis.com/zenn-user-upload/385c41650398-20260103.jpg)  
*第二光源を適当に配置して影ができている様子*

Ver.2.0  
https://playground.babylonjs.com/?inspectorv2=true?BabylonToolkit#U3KVTN#2

試作品を動かしてみると、（月－太陽－カメラ）の角度が大きくなった時に、余計な主張をしていることがわかります。光源をそのまま配置しているので仕方ないのですが目ざわりです。

![](https://storage.googleapis.com/zenn-user-upload/f10fff0f4a5f-20260103.jpg)  
*第二光源の余計な主張*

そこで（月－太陽－カメラ）の角度／内積および（月－第二光源－カメラ）の角度／内積を確認して、所定の範囲内に角度が収まっていれば第二光源を表示、外れていれば表示しないようにします。光源を表示しない方法として dispose以外に見当たらなかったので、太陽と座標を重ねることで隠すようにします。

Ver.2.1  
https://playground.babylonjs.com/?inspectorv2=true?BabylonToolkit#U3KVTN#3

即席の対応で完ぺきではないですが、まぁまぁの出来と思います。

![](https://storage.googleapis.com/zenn-user-upload/a5722e5c732e-20260103.jpg)  
*完璧でない例（日食のリングと光源がずれているケース）*

### レンズフレアでダイヤモンドリングをつくる

レンズフレア [Lens Flares](https://doc.babylonjs.com/features/featuresDeepDive/environment/lenseFlare/) で同様にダイヤモンドリングを作れないか試してみます。リング状のダイヤ（宝石）にあたる部分を表現したいので、レンズフレアは大きく１つのみにします。

Ver.3.0  
https://playground.babylonjs.com/?inspectorv2=true?BabylonToolkit#U3KVTN#4

![](https://storage.googleapis.com/zenn-user-upload/bdc25682531f-20260103.jpg)  
*理想的なレンズフレアの位置*

試作品を動かしてみると、期待していないとき（太陽が隠れているときなど）にレンズフレアが表示されていることがわかります。

![](https://storage.googleapis.com/zenn-user-upload/b49c9f0341d5-20260103.jpg)  
*期待していないレンズフレアの表示（内側に）*

![](https://storage.googleapis.com/zenn-user-upload/e730fa3930f9-20260103.jpg)  
*期待していないレンズフレアの表示（外側に）*

なので、ここでも（月－太陽－カメラ）の角度／内積を確認して、範囲内ならレンズフレアを表示、範囲外ならレンズフレアを非表示（サイズを０）にします。

Ver.3.1  
https://playground.babylonjs.com/?inspectorv2=true?BabylonToolkit#U3KVTN#5

### ブラッシュアップ

最後の仕上げとして、月もどきの球に「月」のテクスチャを張ります。適当にテクスチャを張り付けているので、月の裏側が見えているかもしれません。

また、skyboxを宇宙っぽくします。ただし、日食と背景がけんかしないよう、暗めの宇宙 [CubeTextures](https://doc.babylonjs.com/toolsAndResources/assetLibraries/availableTextures/#cubetextures)にある space を使います。

![](https://storage.googleapis.com/zenn-user-upload/6bbe7187c554-20260103.jpg)  
*金環日食時（背景が黒に）*

![](https://storage.googleapis.com/zenn-user-upload/3894601f6a07-20260103.gif)  
*カメラを回転させて月が見える様子（２倍速）*

## まとめ・雑感

理科の教材（小学校高学年向け？）に使えそうなものがお手軽にできました。

ダイヤモンドリングになるよう、光源を配置したり、レンズフレアを使ってみたりしました。「光源」による方法は位置が固定なうえ、想定しない挙動（思ったタイミングで光源が表示されてしまう）があります。その点、「レンズフレア」の方法はダイヤの部分を任意に発生させられる上に、コードが簡素になる分、こちらがよいかもです。

太陽といえば、こちら [ParticleSystemSet](https://doc.babylonjs.com/features/featuresDeepDive/particles/particle_system/particleHelper/#available-effects) にある [Particle Sun Demo](https://playground.babylonjs.com/#1VGT5D#2) を連想する人もいるかもしれません。こちらを使って「太陽のみを隠してプロミネンスのみを観測」といったことを期待しても、なぜか常に最前面に太陽が表示されるため、他のメッシュで隠すということができません。以前、[Babylon.js で物理演算(havok)：SpringConstraintで太陽系](https://zenn.dev/fnamuoo/articles/b44746c2c216c2)でこの太陽を使ったデモ[重力あり・平板あり（木星まで、彗星あり）](https://playground.babylonjs.com/full.html#KNRKJW#2)で、他の惑星よりも前面に表示されてて困った覚えがあります。出来が良いだけでに他に活用しづらいのは残念です。

最後に１つだけ。
**まちがっても、太陽は直視しないでください。危険です。**


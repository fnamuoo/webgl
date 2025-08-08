# Babylon.js：富士山の一日

## この記事のスナップショット

天の川と富士山の山影  
![](https://storage.googleapis.com/zenn-user-upload/2713ebf05e8c-20250809.jpg)

富士山の一日  
https://playground.babylonjs.com/full.html#ITJ4U9

（コードを見たい人はURLから `full.html` を消したURLを指定してください）

ソース

https://github.com/fnamuoo/webgl/blob/main/089

ローカルで動かす場合、./js 以下のライブラリは 069/js を利用してください。

## 概要

skybox を２重にして、切り替えることで昼夜を表現できるかなと思い、挑戦してみました。
ただ昼夜切り替えるだけでは物足りないので、夜空のときに回転させて「星の動き」を模倣してみたり、朝焼け・夕焼けの効果を加えてみました。
シーンに前回の富士山の３Ｄメッシュを利用します。

## やったこと

- skyboxを多重にして切り替える
- 夜空を回転させる
- 夜に照明を落とす
- 朝焼け・夕焼けをつける


### skyboxを多重にして切り替える

２つのskybox、「TropicalSunnyDay」と「天の川」の２つを使い、昼のskyboxは大きなサイズで、夜のskyboxは小さなサイズで作成します。

```js
let skybox = null;
// Skybox
let skyboxTextPath = "textures/TropicalSunnyDay";
skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:4000.0}, scene);
var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
skyboxMaterial.backFaceCulling = false;
skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxTextPath, scene);
skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
skybox.material = skyboxMaterial;

// ２つ目のskybox
// ここから引用
// https://scrapbox.io/babylonjs/%E5%9C%B0%E7%90%83%E3%82%92%E5%9B%9E%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B
let skybox2 = null;
skybox2 = BABYLON.Mesh.CreateBox("skyBox", 2000, scene);
const cubeTexture = new BABYLON.CubeTexture(
    "https://rawcdn.githack.com/mrdoob/three.js/d8b547a7c1535e9ff044d196b72043f5998091ee/examples/textures/cube/MilkyWay/",
    scene,
    ["dark-s_px.jpg", "dark-s_py.jpg", "dark-s_pz.jpg", "dark-s_nx.jpg", "dark-s_ny.jpg", "dark-s_nz.jpg"]
);
const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
skyboxMaterial.backFaceCulling = false;
skyboxMaterial.reflectionTexture = cubeTexture;
skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
skyboxMaterial.disableLighting = true;
skybox2.material = skyboxMaterial;
```

昼夜を切り替えるには、内側（夜）のskyboxの透明度を変化させます。

```js
let t=0, tstep=0.01, alpha;
scene.registerAfterRender(function() {
    // 夜空のskyboxを透明度を変化させる（skyboxを切り替える効果
    t += tstep;
    if (t >= 24) { t = t-24; }
    alpha = Math.sin(t/24*R360)**2;
    skybox2.material.alpha = alpha;
}
````

夜のskyboxの透明度を変化させる（１０倍速）  
![](https://storage.googleapis.com/zenn-user-upload/d5243edb891c-20250809.gif)

### 夜空を回転させる

昼夜をうまいこと切り替えることができましたが、星の動きが変なので、夜のskyboxを回転させます。北極星を中心に回転させれば理想的ですが、そこまでこだわらず、Ｚ軸で回転させます。

```js
scene.registerAfterRender(function() {
    ...
    // 夜空のskyboxの回転
    skybox2.rotate(BABYLON.Vector3.Forward(), rotSkybox, BABYLON.Space.WORLD);
}
```

夜のskyboxを回転させる（１０倍速）  
![](https://storage.googleapis.com/zenn-user-upload/bfaa74781098-20250809.gif)

### 夜に照明を落とす

今度は夜のシーンで、富士山（地形のメッシュ）が明るいのが気になります。
そこで夜に合わせて照明を落とすことにします。


```js
scene.registerAfterRender(function() {
    ...
    // 夜にかけて、照明を落とす
    light.intensity = 0.1 + 0.6*(1-alpha);
}
```

夜に照明をおとす（１０倍速）  
![](https://storage.googleapis.com/zenn-user-upload/0096699f591c-20250809.gif)

### 朝焼け・夕焼けをつける

せっかくなので、朝焼け・夕焼けの効果をつけたいと思います。

公式のドキュメント[imageprocessing](https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/usePostProcesses/#imageprocessing)にある[ColorGrading Texture Post Process](https://playground.babylonjs.com/#17VHYI#15)を参考にします。

```js
// 朝焼け、夕焼けの演出（事前準備
var colorGrading = new BABYLON.ColorGradingTexture("./textures/LateSunset.3dl", scene);
skybox.material.cameraColorGradingTexture = colorGrading;
skybox.material.cameraColorGradingEnabled = true;

scene.registerAfterRender(function() {
    ...
    // 朝焼け、夕焼けの演出
    cgrad = Math.abs(Math.sin(t/24*R360*2))**2;
    colorGrading.level = cgrad; 
});
```

もう少し赤みを強めたい気もしますが、まぁ良しとします。

朝焼け・夕焼けをつける（１０倍速）  
![](https://storage.googleapis.com/zenn-user-upload/2f71953226d7-20250809.gif)

## まとめ・雑感

観賞用に動きをもっと遅くしたいところですが、動作確認のため速めにうごかしてます。また、昼夜の切り替わるタイミングと星の動き（夜のskyboxの回転）が連動していませんが、わざとです。
上は見ないでください。昼のskybox（TropicalSunnyDay）には頂上に太陽が...太陽が動いていないのに夜になったり、朝になったり（汗
当初の目的（skyboxの切り替え確認）はクリアしたものとしてここまでとします。


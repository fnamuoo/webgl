# Babylon.js - 環境構築（自分用メモ）

## この記事のスナップショット

スナップショットはありません

ソース

https://github.com/fnamuoo/webgl/blob/main/055

## 概要

Babylon の開発環境、動作環境を構築する自分用メモ

Babylon v7.54.0 (2025/03/20)が対象

## やったこと

手法                            | 開始コスト| 開発  | 公開
--------------------------------|-----------|-------|-----
PlayGround コードのローカル利用 | 低        | JS    | 簡易
ローカルWEBサーバの構築         | 中        | JS    | 私的利用向け
git ソースからのコンパイル      | 高        | JS/TS | --


### PlayGround コードのローカル利用

PlayGround

https://playground.babylonjs.com/

ローカルで動かす場合は、
PlayGround のソースを tmp_app.js に保存。
tmp_app.html, babylon.js と一緒に配置。
（tmp_app.js を改名するときは tmp_app.html 内のファイル名も変更する）

babylon.js の CDNリンクは非推奨。ローカルにコピーしておくのがベターっぽい。

:::details テンプレートファイル
```js:createScene() 内をそのまま貼り付け
// tmp_app.js
// https://doc.babylonjs.com/features/introductionToFeatures/chap1/first_scene/
const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    const box = BABYLON.MeshBuilder.CreateBox("box", {}, scene);
    return scene;
};

```

```html:テンプレート
<!-- tmp_app.html -->
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Babylon Template</title>
    <style>
      html,
      body {
        overflow: hidden;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
      }
      #renderCanvas {
        width: 100%;
        height: 100%;
        touch-action: none;
      }
    </style>
    <!-- <script src="https://cdn.babylonjs.com/babylon.js"></script> -->
    <script src="babylon.js"></script>
    <!-- <script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script> -->
    <script src="tmp_app.js"></script>
  </head>
  <body>
    <canvas id="renderCanvas" touch-action="none"></canvas>
    <script>
      const canvas = document.getElementById("renderCanvas"); // Get the canvas element
      const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
      // Add your code here matching the playground format
//      const createScene = function () {
//      };
      const scene = createScene(); //Call the createScene function
      engine.runRenderLoop(function () {
        scene.render();
      });
      // Watch for browser/canvas resize events
      window.addEventListener("resize", function () {
        engine.resize();
      });
    </script>
  </body>
</html>
<!--
https://doc.babylonjs.com/features/introductionToFeatures/chap1/first_app/
-->
```
:::

上記のサンプルなら、サーバ不要、ブラウザのみで動作。

詳細はこちら

https://doc.babylonjs.com/features/introductionToFeatures/chap1/first_app/

### ローカルWEBサーバの構築

- 前提：WindowsOS で nodejs, npm が必要

- サーバ用のソース(4KB) を以下からダウンロード

  https://github.com/aWeirdo/babylonJs_sample_server/archive/master.zip

- ソース展開して、設定

   ```
   Windows_NPM_INSTALL.BAT
   ```

   を実行（サーバ用のモジュール(約3MB)をDL）

- サーバ起動

    ```
    Windows_START.BAT
    ```

    を実行（ポート80でサーバを起動。ソースは ./public 以下に）  
    `ポート80は外部から攻撃されやすいので立ち上げっぱなしに注意。`

    ブラウザで以下にアクセス。

    http://localhost/


- 詳細はこちら

  https://doc.babylonjs.com/setup/support/Running_a_local_webserver_for_BabylonJs/

- 補足

  - public の下に、今まで公開した CANNON のソースを一式もってくれば動きます。
    （動作を BABYLON に限りません）

  - Visual Studio Code(VSCode)をお持ちなら、拡張機能の Live Server でも代用できます。

### git ソースからのコンパイル

- nodejs(npm) をインストール／最新版に更新

  - 公式にアクセス .msi をDLしてインストール(上書き)

    https://nodejs.org/ja/download/

    ```
    # PowerShell でバージョン確認
    node -v
    v22.14.0
    npm -v
    10.9.2
    ```


- git からソース(zip)をダウンロード

  - バージョン：Release 463  v7.54.0  2025/03/20 

    https://github.com/BabylonJS/Babylon.js

- zip を展開、root で "npm install"

  ```
  npm install
  ```

- コンパイル

  ```
  ## これだけでよいっぽい
  npm run build:dev
  ## (最初にこれを実行してしまったけど..)
  npm run build:umd
  ## 
  npm run build:babylonjs
  ```

- 動作確認

  ```
  npm run start
  ```

  ブラウザで http://localhost:1337/ にアクセス。人形が表示される。

- ローカルでツール起動

  - PlayGroundを起動

    PowerShell で２つウィンドウを開いて

    ```
    npm run serve -w @tools/babylon-server
    npm run serve -w @tools/playground
    ```

    http://localhost:1338/ にアクセス。

  - Sandboxを起動

    ```
    npm run serve -w @tools/babylon-server
    npm run serve -w @tools/sandbox
    ```

    http://localhost:1339/

  - Node Editorを起動

    ```
    npm run serve -w @tools/babylon-server
    npm run serve -w @tools/node-editor
    ```

    http://localhost:1340/

    それとも、、どれが正解？

    ```
    npm run serve -w @tools/node-geometry-editor
    ```

    http://localhost:1343/


    ```
    npm run serve -w @tools/node-render-graph-editor
    ```

    http://localhost:1344/

  - GUI Editorを起動

    ```
    npm run serve -w @tools/babylon-server
    npm run serve -w @tools/gui-editor
    ```

    http://localhost:1341/


## まとめ・雑感

着手時につまずくとモチベが下がりやすくなるのでこれで敷居が下がるとよいですね。
参考になれば幸いです。

## 参考資料

https://doc.babylonjs.com/

https://www.crossroad-tech.com/entry/babylonjs-v5-how-to-build


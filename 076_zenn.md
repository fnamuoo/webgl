# Babylon.js の基礎調査：外部jsの読み込み方法

## この記事のスナップショット

スナップショットはありません。

ソース

https://github.com/fnamuoo/webgl/blob/main/076

- 076_1async .. 非同期処理、createScene内でimport
- 076_2sync  .. 同期処理、createScene内でimport
- 076_3async .. 非同期処理、createSceneより前方でimport
- 076_4sync  .. 同期処理、createSceneより前方でimport

ローカルで動かす場合、./js 以下のライブラリは 069/js を利用してください。

## 概要

外部ファイル（gitに配置したjsモジュール）を PlayGround にimportする際の手順をまとめます。
前回の記事で少し触れていますが、今回深掘りして色々調査したまとめになります。

Babylon.js Tips集の[Playgroundで外部JSを使用する方法](https://scrapbox.io/babylonjs/Playground%E3%81%A7%E5%A4%96%E9%83%A8JS%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95)についても再度検証しました。こちらで紹介されている方法１～３（方法４については上手くいかずにスキップ、欠番に）と、discordで話題に上がった手法（ImportMap, LoadScript）＋独自調査の方法を加えた５～８を示します。

## コードサンプル早見

ここでは早見表のようなコード例を示します。
実際のコード例は後述で示します。

### 非同期(async createScene)

async createScene関数内で宣言します。
該当ソースは 076_1async になります。

ES Modules も CommonJS もスコープ外で関数を呼び出すには InitializeCSG2Async() を呼び出し後で可能になります。

- ES Modules

  importしたものをモジュール名として {ModuleName} に割り当てれば、{ModuleName}.{FuncName} の形式で呼び出せるようになります。

  - 方法１

    ```js
    let ModuleName;
    import(SCRIPT_URL).then((obj) => {ModuleName = obj;});
    ```

  - 方法２

    ```js
    let ModuleName;
    await import(SCRIPT_URL).then((obj) => {ModuleName = obj;});
    ```

  - 方法５

    ```js
    let ModuleName1, ModuleName2;
    function loadModule() {
        const importMap = {
            imports: {
                "Module1": SCRIPT_URL1,
                "Module2": SCRIPT_URL2
            }
        };
        const script = document.createElement('script');
        script.type = 'importmap';
        script.textContent = JSON.stringify(importMap);
        document.body.appendChild(script);
        import("Module1").then((obj) => {ModuleName1 = obj;});
        import("Module2").then((obj) => {ModuleName2 = obj;});
    }
    await loadModule();
    ```

- CommonJS
  - 方法３

    ```js
    BABYLON.Tools.LoadScript(SCRIPT_URL, () => {
        noise.seed(1);
        console.log("noise3,", noise.perlin3(0.2,0.2,0));
    });
    ```

  - 方法６

    ```js
    await new Promise((resolve, reject) => {
        BABYLON.Tools.LoadScript(SCRIPT_URL1, resolve, reject);
    });
    await new Promise((resolve, reject) => {
        BABYLON.Tools.LoadScript(SCRIPT_URL2, resolve, reject);
    });
    ```

  - 方法７

    ```js
    BABYLON.Tools.LoadScriptAsync(SCRIPT_URL).then(() => {
        // do something on success
    });
    ```

  - 方法８  ３番目のみ成功
    - perlinモジュール（きちんとmoduleとして作られたもの）のみ可能みたいです。exportを消しただけでのjsは失敗します。

    ```js
    fetch(SCRIPT_URL).then(r=>{return r.text()}).then(t=>eval(t)).then(()=>{
        noise.seed(1);
        let v3 = noise.perlin3(0.2,0.2,0);
        console.log("v3=", v3);
    })
    ```

### 同期(createScene)

createScene関数より前もしくは関数内で宣言します。
ローカル環境なら createScene関数より前で import すれば importの遅延が発生しにくいですが確実ではありません。
createScene関数内ならほぼ確実に importの遅延が発生することを確認してます。

該当ソースは 076_2sync, 076_3aync, 076_4sync になります。

- ES Modules

  - 方法１
    ```js
    let ModuleName;
    import(SCRIPT_URL).then((obj) => {ModuleName = obj;});
    ```

- CommonJS

  - 方法３

    ```js
    BABYLON.Tools.LoadScript(SCRIPT_URL, () => {
        // do something on success
    },(e) => {
        console.log("error=", e);
    });
    ```

  - 方法６(改)
    「方法６」からawaitを取り除いた方法になります

    ```js
    new Promise((resolve, reject) => {
        BABYLON.Tools.LoadScript(SCRIPT_URL, resolve, reject);
    });
    ```

  - 方法７

    ```js
    BABYLON.Tools.LoadScriptAsync(SCRIPT_URL).then(() => {
        // do something on success
    },(e) => {
        console.log("error=", e);
    });
    ```

  - 方法８  ３番目のみ成功
    - perlinモジュール（きちんとmoduleとして作られたもの）のみ可能みたいです。exportを消しただけでのjsは失敗します。

    ```js
    fetch(SCRIPT_URL).then(r=>{return r.text()}).then(t=>eval(t)).then(()=>{
        noise.seed(1);
        let v3 = noise.perlin3(0.2,0.2,0);
        console.log("v3=", v3);
    })
    ```

## 説明

- js のタイプ、CommonJS と ES Modules で読み込み方法が違います
  - 簡単には次のとおり。
    - CommonJS は旧来のjsで、html内の <script src="foo.js"></script> や js内の requireで読み込む。export 宣言がない。
    - ES Modules は新しいjsで、html内の <script type="module" src="bar.js"></script> や js内の importで読み込む。export 宣言がある。
  - 詳細については[ESModules・CommonJSとは何か？](https://qiita.com/skanno/items/cd57fa5a7e78d2d5ebd5)や[CommonJSとES Modulesについてまとめる](https://zenn.dev/yodaka/articles/596f441acf1cf3)が参考になります。
  - 実行例のES Modules には自作の迷路モジュールを[Maze.js](https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js)を使い、CommonJS には上記の迷路モジュールからexportを消したものおよび、[noisejs](https://github.com/josephg/noisejs)のperlinノイズのライブラリを使います。

- 処理方法(createScene)は非同期処理(aync)の方が幅広く対応できます。同期でもやれなくないですが遅延が発生します。
  - PlayGround で createScene を非同期にするには function() の前に async を付けるだけです。更に import のあとで `await BABYLON.InitializeCSG2Async()` をコールしておけば、import 待ちしてくれます。
  - await を使う方法は非同期（async）でのみ利用できます。同期では利用できません。createScene()の範囲外でawaitは利用できません。
  - 結果、awaitを利用する方法は async creaetScene内のみで利用できます。
  - 同期処理（async/awaitなし）の場合は、一回限りのimportでよい／遅延が発生してもよい場合に有効と思われます。

    ```js
    // 同期
    var createScene = function () {
        ...
    ```

    ```js
    // 非同期
    var createScene = async function () {
        import(SCRIPT_URL);
        // import 待ち
        await BABYLON.InitializeCSG2Async();
        ...
    ```

- ファイルの置き場が github の場合 raw.githubusercontent.com ドメインではなく cdn.jsdelivr.net ドメインにすることが必要になります。
  - github にある（画像やシーンデータ）を読み込む場合 raw.githubusercontent.com で参照します。詳細／方法については[Playgroundで外部アセットを使用する](https://scrapbox.io/babylonjs/Playground%E3%81%A7%E5%A4%96%E9%83%A8%E3%82%A2%E3%82%BB%E3%83%83%E3%83%88%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%99%E3%82%8B)を参照してください。しかしJavaScriptファイルで同様な処理をすると MIME が text/plain だと言われて失敗します。
  - github にある JavaScript ファイルを読み込みたい場合は[using-jsdelivrcom](https://doc.babylonjs.com/toolsAndResources/thePlayground/externalPGAssets#using-jsdelivrcom)を参考にcdn.jsdelivr.netのドメインに書き換える必要があります。

```text
// 書き換えの例
github.com ドメイン
https://github.com/fnamuoo/webgl/blob/main/075/Maze.js

raw.githubusercontent.com ドメイン（画像やシーンデータ向け）
https://raw.githubusercontent.com/fnamuoo/webgl/refs/heads/main/075/Maze.js

cdn.jsdelivr.net ドメイン（JSファイル向け）
https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js
```

## コード例

- 具体的な実行例のコードを紹介します。
- 方法によって、非同期処理／awaitがついている場合もありますが、awaitを削って 同期処理の動作確認としています。つまり、本来は非同期処理として使う方法ですが、強引に同期処理として動かした場合を確認してます。
- github に置いているソースを使う場合は ifブロックを有効（if (1)）にして実行してください。
  - PlayGroundでgitのソースを動かす場合、連続してifブロックを切り替えて動かしていると多重宣言でエラーになることがあります。そのときは一度保存してからリセット／再読み込み（Ctrl-R）してみてください。

### 非同期のコード例／ES Modules版

076_1async.js より抜粋

```js:方法１
const SCRIPT_URL_ESM_GIT_1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";
const SCRIPT_URL_ESM_GIT_2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData.js";
var createScene = async function () {
    let Maze = null;
    let MazeData = null;
    // 方法１
    import(SCRIPT_URL_ESM_GIT_1).then((obj) => {Maze = obj; console.log("obj=",obj)});
    import(SCRIPT_URL_ESM_GIT_2).then((obj) => {MazeData = obj; console.log("obj=",obj)});
    await BABYLON.InitializeCSG2Async();
    ...
```

```js:方法２
const SCRIPT_URL_ESM_GIT_1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";
const SCRIPT_URL_ESM_GIT_2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData.js";
var createScene = async function () {
    let Maze = null;
    let MazeData = null;
    // 方法２
    await import(SCRIPT_URL_ESM_GIT_1).then((obj) => {Maze = obj; console.log("obj=",obj)});
    await import(SCRIPT_URL_ESM_GIT_2).then((obj) => {MazeData = obj; console.log("obj=",obj)});
    await BABYLON.InitializeCSG2Async();
    ...
```

```js:方法５
const SCRIPT_URL_ESM_GIT_1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";
const SCRIPT_URL_ESM_GIT_2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData.js";
var createScene = async function () {
    let Maze = null;
    let MazeData = null;
    // 方法５
    // ref) https://playground.babylonjs.com/#MU96WB#28
    function loadModule() {
        const importMap = {
            imports: {
                "Maze": SCRIPT_URL_ESM_GIT_1,
                "MazeData": SCRIPT_URL_ESM_GIT_2
            }
        };
        const script = document.createElement('script');
        script.type = 'importmap';
        script.textContent = JSON.stringify(importMap);
        document.body.appendChild(script);
        import("Maze").then((obj) => {Maze = obj;});
        import("MazeData").then((obj) => {MazeData = obj;});
    }
    await loadModule();
    await BABYLON.InitializeCSG2Async();
    ...
```

### 非同期のコード例／CommonJS版

076_1async.js より抜粋


```js:方法３
const SCRIPT_URL_CJS_GIT_1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze_.js";
const SCRIPT_URL_CJS_GIT_2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData_.js";
const SCRIPT_URL_CJS_GIT_3 = "https://cdn.jsdelivr.net/gh/josephg/noisejs@master/perlin.js";
var createScene = async function () {
    let maze = null;
    // 方法３
    BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_1, () => {
        maze = new Maze2();
        console.log("Maze=",Maze);
    },(e) => {
        console.log("failed ?", e);
    });
    BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_2, () => {
        let v2 = getMap2Data('sdatamm2015final');
        console.log("v2=",v2.slice(0,3));
    });
    BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_3, () => {
        noise.seed(1);
        let v3 = noise.perlin3(0.2,0.2,0);
        console.log("v3=", v3);
    });
    await BABYLON.InitializeCSG2Async();
    ...
```


```js:方法６
const SCRIPT_URL_CJS_GIT_1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze_.js";
const SCRIPT_URL_CJS_GIT_2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData_.js";
const SCRIPT_URL_CJS_GIT_3 = "https://cdn.jsdelivr.net/gh/josephg/noisejs@master/perlin.js";
var createScene = async function () {
    // 方法６
    await new Promise((resolve, reject) => {
        BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_1, resolve, reject);
    });
    await new Promise((resolve, reject) => {
        BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_2, resolve, reject);
    });
    await new Promise((resolve, reject) => {
        BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_3, resolve, reject);
    });
    await BABYLON.InitializeCSG2Async();
    ...
```

```js:方法７
const SCRIPT_URL_CJS_GIT_1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze_.js";
const SCRIPT_URL_CJS_GIT_2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData_.js";
const SCRIPT_URL_CJS_GIT_3 = "https://cdn.jsdelivr.net/gh/josephg/noisejs@master/perlin.js";
var createScene = async function () {
    // 方法７
    BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_CJS_GIT_1).then(() => {
        Maze = new Maze2();
    },(e) => {
        console.log("failed ?", e);
    });
    BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_CJS_GIT_2).then(() => {
        let v2 = getMap2Data('sdatamm2015final');
        console.log("v2=",v2.slice(0,3));
    });
    BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_CJS_GIT_3).then(() => {
        noise.seed(1);
        let v3 = noise.perlin3(0.2,0.2,0);
        console.log("v3=", v3);
    });
    await BABYLON.InitializeCSG2Async();
    ...
```

```js:方法８
const SCRIPT_URL_CJS_GIT_3 = "https://cdn.jsdelivr.net/gh/josephg/noisejs@master/perlin.js";
var createScene = async function () {
    // 方法８  ３番目のみ成功
    fetch(SCRIPT_URL_CJS_GIT_3).then(r=>{return r.text()}).then(t=>eval(t)).then(()=>{
        noise.seed(1);
        let v3 = noise.perlin3(0.2,0.2,0);
        console.log("v3=", v3);
    })
    await BABYLON.InitializeCSG2Async();
    ...
```

### 同期のコード例／ES Modules版

076_4sync.js より抜粋

```js:方法１
const SCRIPT_URL_ESM_GIT_1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze.js";
const SCRIPT_URL_ESM_GIT_2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData.js";
let Maze = null;
let MazeData = null;
// 方法１
import(SCRIPT_URL_ESM_GIT_1).then((obj) => {Maze = obj; console.log("obj=",obj)});
import(SCRIPT_URL_ESM_GIT_2).then((obj) => {MazeData = obj; console.log("obj=",obj)});
var createScene = function () {
    ...
```

### 同期のコード例／CommonJS版

076_4sync.js より抜粋

```js:方法３
const SCRIPT_URL_CJS_GIT_1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze_.js";
const SCRIPT_URL_CJS_GIT_2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData_.js";
const SCRIPT_URL_CJS_GIT_3 = "https://cdn.jsdelivr.net/gh/josephg/noisejs@master/perlin.js";
// 方法３
BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_1, () => {
    Maze = new Maze2();
    console.log("Maze=",Maze);
},(e) => {
    console.log("failed ?", e);
});
BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_2, () => {
    let v2 = getMap2Data('sdatamm2015final');
    console.log("v2=",v2.slice(0,3));
});
BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_3, () => {
    noise.seed(1);
    let v3 = noise.perlin3(0.2,0.2,0);
    console.log("v3=", v3);
});
var createScene = function () {
    ...
```

```js:方法６(改)
const SCRIPT_URL_CJS_GIT_1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze_.js";
const SCRIPT_URL_CJS_GIT_2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData_.js";
const SCRIPT_URL_CJS_GIT_3 = "https://cdn.jsdelivr.net/gh/josephg/noisejs@master/perlin.js";
// 方法６(改)
new Promise((resolve, reject) => {
    BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_1, resolve, reject);
});
new Promise((resolve, reject) => {
    BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_2, resolve, reject);
});
new Promise((resolve, reject) => {
    BABYLON.Tools.LoadScript(SCRIPT_URL_CJS_GIT_3, resolve, reject);
});
var createScene = function () {
    ...
```

```js:方法７
const SCRIPT_URL_CJS_GIT_1 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/Maze_.js";
const SCRIPT_URL_CJS_GIT_2 = "https://cdn.jsdelivr.net/gh/fnamuoo/webgl@main/075/MazeData_.js";
const SCRIPT_URL_CJS_GIT_3 = "https://cdn.jsdelivr.net/gh/josephg/noisejs@master/perlin.js";
// 方法７
BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_CJS_GIT_1).then(() => {
    Maze = new Maze2();
},(e) => {
    console.log("failed ?", e);
});
BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_CJS_GIT_2).then(() => {
    let v2 = getMap2Data('sdatamm2015final');
    console.log("v2=",v2.slice(0,3));
});
BABYLON.Tools.LoadScriptAsync(SCRIPT_URL_CJS_GIT_3).then(() => {
    noise.seed(1);
    let v3 = noise.perlin3(0.2,0.2,0);
    console.log("v3=", v3);
});
var createScene = function () {
    ...
```

```js:方法８
const SCRIPT_URL_CJS_GIT_3 = "https://cdn.jsdelivr.net/gh/josephg/noisejs@master/perlin.js";
// 方法８  ３番目のみ成功
fetch(SCRIPT_URL_CJS_GIT_3).then(r=>{return r.text()}).then(t=>eval(t)).then(()=>{
    noise.seed(1);
    let v3 = noise.perlin3(0.2,0.2,0);
    console.log("v3=", v3);
})
var createScene = function () {
    ...
```

## まとめ・雑感

正直、自分のメモ用の資料です。説明のわかりにくいところはご容赦。
今回、相対パスでも可能とわかって収穫は大きかったです。これで同じファイルをUPせずにすみます。


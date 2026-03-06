# Babylon.js ：Path3D上で複数メッシュを動かす

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/75b897e9a5c3-20260306.gif)
*同一ラインを追いかけっこ（２倍速）*

![](https://storage.googleapis.com/zenn-user-upload/40d96859b801-20260306.gif)
*電車［台車付］（車両長め）（２倍速）*

https://playground.babylonjs.com/?BabylonToolkit#YHDJJ1

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

### ソース

https://github.com/fnamuoo/webgl/blob/main/127

ローカルで動かす場合、上記ソースに加え、別途 git 内の [104/js](https://github.com/fnamuoo/webgl/tree/main/104/js) を ./js として配置してください。

## 概要

目標は「列車を動かす」ことになります。
といっても簡素なもので、レールは３次元の点列（線分）であらわすこととし、車両は四角のメッシュとしておきます。

実装方法をＡＩに確認しつつ、簡単な例で使い方を確認／試作した上で、列車風に改造します。

## やったこと

- ＡＩに聞いてみる
  - ChatGPTの例
  - geminiの例
- 設計・概要
- 例：太陽系っぽいもの
- 例：電子（楕円）
- 例：電車（単線）
- 例：電車（複線）
- 例：電車（複線）／複数

### ＡＩに聞いてみる

生成ＡＩに「babylon.js で 3Dの経路（(x,y,z)の点列)の上を複数のメッシュが同時に動くようにするには？」と聞いてみました。

#### ChatGPTの例

ChatGPTの回答はこちらになります。

::::details ChatGPTの回答
> Babylon.js で **3D 経路（(x,y,z) の点列）に沿って複数メッシュを同時に動かす**方法は、用途によっていくつかの定石があります。
> ここでは **実装の実用度が高い順**に整理します。
> 
> ---
> 
> ## 1. Animation + Path3D（最も素直・軽量）
> 
> ### 概要
> 
> * `(x,y,z)` 点列 → `BABYLON.Path3D`
> * パラメータ `t ∈ [0,1]` を進めて位置を補間
> * **各メッシュは「開始オフセット」だけ違う**
> 
> ### 実装の骨子
> 
> ```js
> const points = [
>   new BABYLON.Vector3(0,0,0),
>   new BABYLON.Vector3(5,2,3),
>   new BABYLON.Vector3(10,0,8),
>   new BABYLON.Vector3(20,3,12)
> ];
> 
> const path3d = new BABYLON.Path3D(points);
> const curve = path3d.getCurve();
> ```
> 
> #### 位置補間関数（等速）
> 
> ```js
> function getPointAt(t) {
>   const n = curve.length - 1;
>   const f = t * n;
>   const i = Math.floor(f);
>   const r = f - i;
>   return BABYLON.Vector3.Lerp(curve[i], curve[i+1], r);
> }
> ```
> 
> #### 複数メッシュを同時に動かす
> 
> ```js
> const meshes = [];
> for (let i = 0; i < 5; i++) {
>   const m = BABYLON.MeshBuilder.CreateBox("b"+i);
>   meshes.push({
>     mesh: m,
>     offset: i * 0.15,   // 経路上の位相差
>     speed: 0.1
>   });
> }
> 
> scene.onBeforeRenderObservable.add(() => {
>   const dt = scene.getEngine().getDeltaTime() / 1000;
>   meshes.forEach(o => {
>     o.offset = (o.offset + o.speed * dt) % 1;
>     o.mesh.position.copyFrom(getPointAt(o.offset));
>   });
> });
> ```
> 
> ### 特徴
> 
> | 項目   | 評価       |
> | ---- | -------- |
> | 複数同時 | ◎        |
> | 等速制御 | △（要自前補正） |
> | 回転制御 | ○（後述）    |
> | 実装難度 | ★☆☆      |
> 
> ---
> 
> ## 2. Path3D + Tangent / Normal で向きを合わせる（移動体向け）
> 
> ### 向き（進行方向）を自動追従
> 
> ```js
> const tangents = path3d.getTangents();
> 
> function getTangentAt(t) {
>   const n = tangents.length - 1;
>   const f = t * n;
>   const i = Math.floor(f);
>   return tangents[i];
> }
> ```
> 
> ```js
> const dir = getTangentAt(o.offset);
> o.mesh.rotationQuaternion =
>   BABYLON.Quaternion.FromLookDirectionLH(dir, BABYLON.Vector3.Up());
> ```
> 
> ### 向いている物
> 
> * 車・キャラクタ・列車
> * カメラ追従
> 
> ---
> 
> ## 3. FollowPathBehavior（簡単・ただし自由度低）
> 
> Babylon.js には既成 Behavior があります。
> 
> ```js
> const behavior = new BABYLON.FollowPathBehavior();
> behavior.path = points;
> behavior.speed = 2;
> 
> mesh.addBehavior(behavior);
> ```
> 
> ### 複数同時
> 
> * **各メッシュに Behavior を付けるだけ**
> 
> ### 注意点
> 
> * 細かい同期制御がしにくい
> * 位相差制御が弱い
> 
> ➡ **デモ用途・軽い用途向け**
> 
> ---
> 
> ## 4. Physics（Havok）で「レール上を進ませる」
> 
> ### 概要
> 
> * 経路上に invisible な guide mesh
> * 力・拘束で沿わせる
> 
> ### 向いている用途
> 
> * 重力・慣性・衝突が重要
> * 列車・ジェットコースター
> 
> ### 欠点
> 
> * 実装が重い
> * 複数同期は難しい
> 
> ---
> 
> ## 5. 実務でよく使う構成（おすすめ）
> 
> ### ✔ 推奨アーキテクチャ
> 
> ```text
> Path3D（点列）
>    ↓
> 距離累積テーブル（等速化）
>    ↓
> t → position / tangent
>    ↓
> 複数メッシュ（offsetだけ違う）
> ```
> 
> ### なぜこれが良いか
> 
> * 複数同時が簡単
> * 速度・間隔・停止が制御しやすい
> * 後から物理・演出を足せる
> 
> ---
> 
> ## 6. 典型的な応用パターン
> 
> | 用途        | 実装                 |
> | --------- | ------------------ |
> | 車列・電車     | Path3D + offset    |
> | NPC行進     | AnimationGroup     |
> | 弾幕        | Path補間             |
> | カメラレール    | FollowPathBehavior |
> | ジェットコースター | Physics + Path     |
> 
> ---
> 
> ## 結論（短く）
> 
> > **点列がすでにあるなら**
> > 👉 **Path3D + 自前更新 + offset方式** が最も汎用・安定。
> 
> もし次に
> 
> * 「等速で正確に動かしたい」
> * 「曲率に応じて傾けたい（バンク）」
> * 「ねじれを抑えたい（フレネフレーム問題）」
> 
> などがあれば、その前提で具体コードを出せます。
::::

※注意：FollowPathBehavior は最新の API には含まれていません。

上記のコードに補足して、動かしてみました。

![](https://storage.googleapis.com/zenn-user-upload/32814551d5bd-20260306.gif)
*ChatGPTの例（２倍速）*


#### geminiの例

geminiの回答はこちらになります。

::::details geminiの回答
> Babylon.js で複数のメッシュを同じ経路（点列）に沿って動かすには、**`BABYLON.Path3D`** クラスを利用するのが最も効率的でスマートな方法です。
> 
> これを使うと、点列から滑らかな曲線を作成し、その曲線上の任意の地点（0～1の進捗率）の座標や向きを簡単に取得できます。
> 
> ---
> 
> ### 実装のポイント
> 
> 1. **`Path3D` の作成**: 点列（`Vector3` の配列）を渡してパスを生成します。
> 2. **進捗の管理**: 各メッシュに `percentage`（0.0 ～ 1.0）を持たせます。
> 3. **フレームごとの更新**: `scene.onBeforeRender` 内で、各メッシュの進捗を更新し、`path3d.getPointAt(t)` で座標を、`path3d.getTangentAt(t)` で進行方向を更新します。
> 
> ---
> 
> ### サンプルコード
> 
> 以下のコードは、1つのパスに対して3つのボックスを時間差で走らせる例です。
> 
> ```javascript
> // 1. 経路となる点列を作成
> const points = [
>     new BABYLON.Vector3(-10, 0, -10),
>     new BABYLON.Vector3(0, 5, 0),
>     new BABYLON.Vector3(10, 0, 10),
>     new BABYLON.Vector3(15, 2, 0)
> ];
> 
> // 2. Path3D オブジェクトを生成
> // 第2引数は法線計算用（デフォルトでOK）、第3引数をtrueにすると閉じられたループになります
> const path3d = new BABYLON.Path3D(points);
> const curve = path3d.getCurve(); // 視覚確認用の曲線
> 
> // パスを可視化（デバッグ用）
> const pathLine = BABYLON.MeshBuilder.CreateLines("lines", {points: curve}, scene);
> 
> // 3. 動かしたいメッシュを複数作成
> const meshes = [];
> const numMeshes = 3;
> 
> for (let i = 0; i < numMeshes; i++) {
>     const box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {size: 1}, scene);
>     
>     // 各メッシュに個別の進捗と速度を持たせる
>     meshes.push({
>         mesh: box,
>         speed: 0.002 + (i * 0.001), // 個別に速度を変える場合
>         percentage: i * 0.2         // 開始地点をずらす（オフセット）
>     });
> }
> 
> // 4. アニメーションループ
> scene.onBeforeRender = () => {
>     meshes.forEach((item) => {
>         // 進捗を更新（1.0を超えたら0に戻る）
>         item.percentage += item.speed;
>         if (item.percentage > 1) item.percentage = 0;
> 
>         // パス上の座標を取得
>         const pos = path3d.getPointAt(item.percentage);
>         item.mesh.position.copyFrom(pos);
> 
>         // 進行方向（接線）を向かせる
>         const tangent = path3d.getTangentAt(item.percentage);
>         item.mesh.lookAt(pos.add(tangent));
>     });
> };
> 
> ```
> 
> ---
> 
> ### 知っておくと便利なテクニック
> 
> #### 1. 曲線を滑らかにする (`CatmullRomSpline`)
> 
> 入力する点列が角張っている場合、そのまま `Path3D` に入れると動きがカクつきます。その場合は `CreateCatmullRomSpline` で補完すると滑らかになります。
> 
> ```javascript
> const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 20); // 20は分割数
> const path3d = new BABYLON.Path3D(catmullRom.getPoints());
> 
> ```
> 
> #### 2. 等速運動の維持
> 
> `Path3D` のデフォルトの `getPointAt(t)` は、点の密度に影響されず、経路の全行程を  から  の割合で計算するため、基本的には等速になります。
> 
> #### 3. 向きの制御 (Rotation)
> 
> `lookAt()` だけでなく、`path3d.getBinormalAt(t)` を併用することで、ジェットコースターのような「ひねり」のある動きも制御可能です。
> 
> ---
> 
> この実装方法で、特定の配列データに基づいた複雑な軍団の移動なども制御できるようになります。
> 
> 次に、**「特定の地点で停止させる」** や **「マウス操作に合わせて動かす」** といった機能を追加したい場合はありますか？必要であればロジックを提案します！
::::

上記のコードに補足して、動かしてみました。

![](https://storage.googleapis.com/zenn-user-upload/c7eca1b31039-20260306.gif)
*geminiの例（２倍速）*

### 設計・概要

ＡＩに確認した結果、Path3Dで処理するのが王道っぽいのでこれを使うことにします。

Path3Dに対して getPointAt() で [0, 1]の範囲の値を渡すと、それに応じた座標値を返してくれる便利な関数があるのでこれを使います。また、姿勢・向きについても接線方向を取得する関数 getTangentAt()があるのでこれを利用してレンダリングを変更します。

::::details src
```js
    // 3. 動かしたいメッシュを複数作成
    let meshes = [];
    const numMeshes = 3;
    for (let i = 0; i < numMeshes; i++) {
        let box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {size: 1}, scene);
        // 各メッシュに個別の進捗と速度を持たせる
        meshes.push({
            mesh: box,
            speed: 0.002 + (i * 0.001), // 個別に速度を変える場合
            percentage: i * 0.2         // 開始地点をずらす（オフセット）
        });
    }

    // 4. アニメーションループ
    scene.onBeforeRenderObservable.add((scene) => {
        meshes.forEach((item) => {
            // 進捗を更新（1.0を超えたら0に戻る）
            item.percentage += item.speed;
            if (item.percentage > 1) item.percentage = 0;

            // パス上の座標を取得
            const pos = path3d.getPointAt(item.percentage);
            item.mesh.position.copyFrom(pos);

            // 進行方向（接線）を向かせる
            const tangent = path3d.getTangentAt(item.percentage);
            item.mesh.lookAt(pos.add(tangent));
        });
    });
```
::::

### 例：太陽系っぽいもの

パスを３つ用意して、反時計回りに点列を配置してみます。メッシュは四角のままで球ではありませんが試作なのでご了承ください。
（球だと向きが変わってもわからないので四角のまま）

![](https://storage.googleapis.com/zenn-user-upload/1ac69480af8a-20260306.gif)
*太陽系っぽいもの（２倍速）*


### 例：電子（楕円）

原子の周辺を回る電子を模して、楕円軌道を描くような動きを試してみます。
正確に楕円ではなく、座標をそれっぽく位置取りしています。

![](https://storage.googleapis.com/zenn-user-upload/8aa5b09e81f7-20260306.gif)
*電子（楕円）（２倍速）*

### 例：電車（単線）

電車（複数の車両）っぽく見せるには、同じ速度で、位置をずらせばそれっぽく見えます。

接線方向に向きを合わせているだけなので、車両が長く／急カーブがあると、動きがおかしくなります。より正確な動きにしたいなら台車（車輪）を考慮して、その上に車両の乗せるべきかと思います。ここでは厳密さを求めない上に、コスパ（実装コストや処理に対する見た目の良さ）は今一つな感じがするのでこのまま進めることにします。

![](https://storage.googleapis.com/zenn-user-upload/459a5bafb793-20260306.gif)
*電車（単線）（２倍速）*

### 例：電車（複線）

２つのライン、内回りと外回りで動かしてみます。

![](https://storage.googleapis.com/zenn-user-upload/f2d1568bfd3a-20260306.gif)
*電車（複線）（２倍速）*

### 例：電車（複線）／複数車両

２つのライン（内回りと外回り）で、さらに複数の列車を配置してみます。

![](https://storage.googleapis.com/zenn-user-upload/aec3d9926efc-20260306.gif)
*電車（複線）／複数車両（２倍速）*

### 例：電車［台車付］（単線）

上述までは、「簡単な車両」（１点のみで位置と向きを表す）でした。
ここでは台車・車輪と車両をわけて車両Ｎに対し、車輪位置をＮ＋１を使い、車両位置は隣接する車輪の中間位置とします。計算量が少々増えるので、列車の車両や本数を増やして描画させようとするとちょっと重いかもです。

下記、例では、車両をやや長めにして挙動を確認しています。
車両を長く／急カーブでも違和感がかなり軽減されたと思います。急カーブを通過するときに車輪の位置が若干おかしい（車両が詰まる）感じがして、車両がめり込むのはご愛嬌です。

車両の向きを台車の２点から Math.atan2() で求めていますが平面上なので良しとします。レールにアップダウン（ピッチ角）やバンク（車両のロール）があると破綻します。台車の中間地点の getTangentAt() を使えば良いかもしれません。ここではそこまで求めないのでこれ(atan2)で良しとします。

![](https://storage.googleapis.com/zenn-user-upload/ee7cdbab0c51-20260306.gif)
*電車［台車付］（２倍速）*

![](https://storage.googleapis.com/zenn-user-upload/40d96859b801-20260306.gif)
*電車［台車付］（車両長め）（２倍速）*

::::details src
```js
    const numMeshes = 4;
    let meshes = []; // 車両のメッシュ
    let datalist = []; // 台車・車輪位置

    for (let i = 0; i <= numMeshes; ++i) {
        if (i < numMeshes) {
            // let box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {width:0.5, height:0.5, depth:3}, scene);
            let box = BABYLON.MeshBuilder.CreateBox(`box${i}`, {width:0.5, height:0.5, depth:4}, scene);
            meshes.push({
                i: i,
                mesh: box,
            });
        }
        datalist.push({
            i: i,
            speed: 0.002,
            // percentage: i * 0.055, // for depth=3
            percentage: i * 0.070,
            p: new BABYLON.Vector3(),
        });
    }

    scene.onBeforeRenderObservable.add((scene) => {
        datalist.forEach((data) => {
            let i = data.i;
            data.percentage += data.speed;
            if (data.percentage > 1) data.percentage -= 1;
            data.p.copyFrom(path3d.getPointAt(data.percentage));
            if (i > 0) {
                let p_ = datalist[i-1].p;
                let mesh = meshes[i-1].mesh;
                let pc = data.p.add(p_).scale(0.5); // １つ前との重心位置
                let vec = data.p.subtract(p_); // １つ前との方向ベクトル
                mesh.position.copyFrom(pc); // 重心位置にメッシュを配置
                let vrot = Math.atan2(vec.x, vec.z); // 方向ベクトルから回転角（ヨー）を求める
                mesh.rotation = new BABYLON.Vector3(0, 0, 0); // 一度 初期状態に戻して
                mesh.rotate(BABYLON.Vector3.Up(), vrot);
            }
        });
    });
```
::::

## まとめ・雑感

簡単な例ではありますが、ライン上に車両を走らせることができました。
処理を簡略化しているために、よく見ると動きに対する違和感があります。車両が長くなったり、急カーブがあると顕在化します。精緻さ／正確さを求めないのであれば十分な出来と思います。

一応、台車を考慮した列車の動きもトライしました。
より精緻にはなりますが、計算コストはちょっと無視できないかもです。

今回、動き回るシンプルな版でした。
後日どこかの路線を対象にしたシミュレーションにチャレンジします。


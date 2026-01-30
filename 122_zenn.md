# Babylon.js：セルオートマトン（ライフゲーム）／WebGPU・ComputeShaderingで実装する

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/ade5d6ce9801-20260130.gif)
*ライフゲーム：GPUtexture4000x4000*

WebGPU/texture版  
https://playground.babylonjs.com/?BabylonToolkit#O8Q5A3

WebGPU/thinInstance版  
https://playground.babylonjs.com/?BabylonToolkit#O8Q5A3#1

WEBGPU版です。PlayGroundの設定（右上のメニューバー）が WEBGL2 なら `WEBGPU` に切り替えてください。
（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

ソース

https://github.com/fnamuoo/webgl/blob/main/122

  - 122_lifegame_txt      .. WebGPU/texture版
  - 122_lifegame_thinInst .. WebGPU/thinInstance版

ローカルで動かす場合、上記ソースに加え、別途 git 内の [104/js](https://github.com/fnamuoo/webgl/tree/main/104/js) を ./js として配置してください。

## 概要

以前の記事、[Babylon.js：サイズの限界をセルオートマトン（ライフゲーム）／CPU版で検証する](https://zenn.dev/fnamuoo/articles/3c8774b6d3b243) を WebGPU・[Compute Shaders](https://doc.babylonjs.com/features/featuresDeepDive/materials/shaders/computeShader/) で再実装した版を紹介します。

Compute Shadering については勉強中で習熟しているわけではないのですが、理解した範囲での成果になります。今回は texture と thinInstance に適用した版を紹介します。
なおCPU版との比較では次のような結果になりました。

| N           | Nx,Ny       | CPU:Thin  | CPU:Texture | GPU:Thin    | GPU:Texture
|------------:|:-----------:|-----------|-------------|-------------|-------------
|   1,000,000 |  1000x1000  |  ◎       |  ◎         |  ◎         |  ◎
|   4,000,000 |  2000x2000  |  △       |  △         |  △         |  ◎
|  16,000,000 |  4000x4000  |           |             |  ×         |  ○
| 100,000,000 | 10000x10000 |  ×       |  ×         |  ×         |  ×

（凡例：◎：快適、○：やや遅延、△：動作が重い、×：動作しない ／ 動作環境 Win11, Intel Core i7, 16 GB-MEM）

## やったこと

- compute shadering の教材
- texture版を作成
- thinInstance版を作成
- 蛇足：compute shaderingで詰まったところ
- 蛇足：生成AIをつかってみる

### compute shadering の教材

まず資料は少ないです。
その中でも、とっかかりの読み物としては以下がわかり易かったです。

- [軽率にBabylon.jsの WebGPUエンジンを使って ComputeShaderに入門した](https://speakerdeck.com/drumath2237/learn-about-babylonjs-webgpu-computeshader)
- [The Compute Shader Tutorial #1](https://barthpaleologue.github.io/Blog/posts/the-compute-shader-tutorial-1/)

脱初学者をめざして知識を深めたいところですが、適当な資料が見つけられなかったのでサンプル／実装例を見ながら、実際の使い方を勉強していきました。
といっても初学者に公式サンプルは難読なので後回しにして、「Babylon.js Tips集」の方をみていきます。

やみくもにソースを眺めても理解できないので、まず情報をまとめます。
粒子数、出力対象（dispatch後の反映先）、CSで計算対象の変数などを対象に表にします（下記）
情報をまとめながらコードを確認して中で、いくつか読み取れたこともありました。

- WGSL で座標値などを計算しておいて、dispatch後にメッシュに反映させている（大部分のサンプルでの方法）
- WGSL で座標値、色など計算しておき、WGSL から texture に反映させる方法がある

情報がそろってきたことで、サンプルを改修すれば「ライフゲーム」をつくれそうだと見えてきたので次節で着手します。

::::details まとめ
```
file                | N        | OUTPUT             | VAL    | MEMO
--------------------|----------|--------------------|--------|-------
tips_cs             |   90,000 | PointsCloudSystem  |xyz     | N体シミュ／銀河系？
--------------------|----------|--------------------|--------|-------
tips_cs_2           |   10,000 | ParticleSystem     |xyz/8   | N体シミュ
--------------------|----------|--------------------|--------|-------
tips_cs_3           |  100,000 | VertexData／Mesh   |xyz     | 点の分布
--------------------|----------|--------------------|--------|-------
tips_cs_4           |    1,500 | Plane              |xyVxVy,c| boid／三角形の群れ
--------------------|----------|--------------------|--------|-------
tips_cs_5           |1,000,000 | VertexData         |xyz,c   | ハーモノグラフ／曲線
--------------------|----------|--------------------|--------|-------
tips_cs_6_1         |    2,601 | PointsCloudSystem  | xyz    | 波面
tips_cs_6_2         |    2,601 | thinInstance       |xyz/16,c| 波面
tips_cs_6_3         |    2,601 | Plane              | z      | 波面
tips_cs_6_4         |    4,096 | VertexData／Mesh   | xyz,c  | 波面
--------------------|----------|--------------------|--------|-------
tips_cs_7           |    4,096 | VertexData／Mesh   | xyz,c  | 3Dリサージュ図形
--------------------|----------|--------------------|--------|-------
tips_8_1            |    1,000 | thinInstance       |xyz/16,c| boid／角すい
tips_8_2            |    1,000 | createInstance     |xyz/16,c| boid／球
tips_8_3            |    1,000 | createInstance     |xyz/16,c| boid／あひる
tips_8_4            |    1,000 | createInstance     |xyz/16,c| boid／あひる
tips_8_5            |    5,000 | thinInstance       |xyz/16,c| boid／あひる
tips_8_6            |    5,000 | thinInstance       |xyz/16,c| boid／水槽＋魚
tips_8_7            |    5,000 | thinInstance       |xyz/16,c| boid／PBRマテリアル使用
--------------------|----------|--------------------|--------|-------
tips_9              |    5,000 | createInstance     |xyz/8   | 球／噴水
--------------------|----------|--------------------|--------|-------
tips_cs_10_1        |    5,000 | createInstance     |xyz/8   | Box／火山
tips_cs_10_2        |    5,000 | thinInstance       |xyz/16,c| Box／火山
tips_cs_10_3        |    1,000 | createInstance     |xyz/8   | Plane／火山
tips_cs_10_4        |    8,000 | createInstance     |xyz/8   | Plane／火山
--------------------|----------|--------------------|--------|-------
tips_cs_11          |   16.641 | Plane              | y      | 波面＋アヒル(10)
--------------------|----------|--------------------|--------|-------
tips_cs_12_1        |  262,144 | Texture／画素      | c      | テクスチャ／砂嵐
tips_cs_12_2        |  262,144 | Texture／画素      | c      | テクスチャ／砂嵐
--------------------|----------|--------------------|--------|-------
tips_cs_13          |   15,000 | Mesh／頂点         |xyz,c,N | 球面調和関数
--------------------|----------|--------------------|--------|-------
tips_cs_14_1        |   65,536 | VertexData／Mesh   |xyz,c,N | 地形生成
tips_cs_14_2        |   65,536 | VertexData／Mesh   |xyz,c,N | 地形生成／グラウンドキャニオン
--------------------|----------|--------------------|--------|-------
tips_cs_15_1        |  120,000 | VertexData／Mesh   | xyz,c  | Simone Attractor
tips_cs_15_2        |  100,000 | VertexData／Mesh   | xyz,c  | Lorenz attractor
--------------------|----------|--------------------|--------|-------
tips_cs_16_11       |  100,000 | PointsCloudSystem  |p,c     | アヒルを点で、落下／addSurfacePoints を使用した
tips_cs_16_12       |  100,000 | PointsCloudSystem  |p,c     | アヒルを点で、落下／頂点情報ベースの方式
tips_cs_16_13       |  200,000 | VertexData／Mesh   |p,v,c   | アヒルを点で、磁場で動く粒子群エフェクト
tips_cs_16_21       |  100,000 | PointsCloudSystem  |p,v,c   | バギーを点で、落下／addSurfacePoints を使用した
tips_cs_16_22       |  100,000 | PointsCloudSystem  |p,v,c   | バギーを点で、落下／頂点情報ベースの方式
--------------------|----------|--------------------|--------|-------
tips_cs_17          |  262,144 | Plane/texture      | c      | gray-scott 反応拡散
--------------------|----------|--------------------|--------|-------
tips_cs_18          |4,194,304 | Plane/texture      | c      | メロン
--------------------|----------|--------------------|--------|-------
tips_cs_19_1        |  250,000 | VertexData／Mesh   | p,c    | 点群表示/boid cons
tips_cs_19_2        |  200,000 | VertexData／Mesh   | p,c    | 点群表示/粘菌＋BOID  / ハイブリッド行動
tips_cs_19_3        |  150,000 | VertexData／Mesh   | p,c    | 点群表示/粘菌＋BOID / 捕食者-被食者
tips_cs_19_4        |  200,000 | VertexData／Mesh   | p,c    | 点群表示/粘菌＋BOID / 状態遷移
tips_cs_19_5        |   20,000 | thinInstance       | p/16,c | 点群表示/粘菌＋BOID / 状態遷移(2)
--------------------|----------|--------------------|--------|-------
official_1          |  262,144 | Plane/texture      | c      | 球、面、行列
official_2          |1,048,576 | Plane/texture      | c      | 面blur
official_3          |    1,500 | plane/Vertices     | p,v    | boid
official_4          |1,048,576 | VertexData／Mesh   | h      | 地形の浸食
official_5          |  250,000 | Layer/texture      | c      | スライム　シミュ
official_6          |   65,535 | ???                | ???    | 海／荒波
```
::::

::::details 参照先リンク
- Babylon.js Tips集
  - [WebGPU＋ComputeShader](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader)
  - [WebGPU＋ComputeShader（その２）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE%EF%BC%92%EF%BC%89)
  - [WebGPU＋ComputeShader（その３）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE%EF%BC%93%EF%BC%89)
  - [WebGPU＋ComputeShader（その４）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE%EF%BC%94%EF%BC%89)
  - [WebGPU＋ComputeShader（その５）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE%EF%BC%95%EF%BC%89)
  - [WebGPU＋ComputeShader（その６）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE%EF%BC%96%EF%BC%89)
    1. [Points Cloud System で描画](https://playground.babylonjs.com/?webgpu#Y2UGQ5#65)
    2. [Thin Instance で描画](https://playground.babylonjs.com/?webgpu#Y2UGQ5#66)
    3. [Plane で描画](https://playground.babylonjs.com/?webgpu#Y2UGQ5#67)
    4. [Plane で描画](https://playground.babylonjs.com/?webgpu#Y2UGQ5#68)
  - [WebGPU＋ComputeShader（その７）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE%EF%BC%97%EF%BC%89)
  - [WebGPU＋ComputeShader（その８）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE%EF%BC%98%EF%BC%89)
    1. [さんかく](https://playground.babylonjs.com/?webgpu#3URR7V#462)
    2. [キャラクタを某菌類に変更した版](https://playground.babylonjs.com/?webgpu#3URR7V#463)
    3. [キャラクタをglTFのDuckに変更した版](https://playground.babylonjs.com/?webgpu#3URR7V#464)
    4. [床を湖に変更。インスタンシング版。アヒル×1000羽](https://playground.babylonjs.com/?webgpu#3URR7V#465)
    5. [Thin Instance版。アヒル×5000羽](https://playground.babylonjs.com/?webgpu#3URR7V#466)
    6. [水槽＋魚](https://playground.babylonjs.com/?webgpu#3URR7V#467)
    7. [PBRマテリアル使用](https://playground.babylonjs.com/?webgpu#3URR7V#469)
  - [WebGPU＋ComputeShader（その９）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE%EF%BC%99%EF%BC%89)
  - [WebGPU＋ComputeShader（その10）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE10%EF%BC%89)
    1. [インスタンシング版](https://playground.babylonjs.com/?webgpu#FUOZ4E#21)
    2. [Thin Instance版](https://playground.babylonjs.com/?webgpu#FUOZ4E#22)
    3. [噴石をメッシュでなくテクスチャで表現](https://playground.babylonjs.com/?webgpu#FUOZ4E#23)
    4. [噴煙を追加](https://playground.babylonjs.com/?webgpu#FUOZ4E#25)
  - [WebGPU＋ComputeShader（その11）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE11%EF%BC%89)
  - [WebGPU＋ComputeShader（その12）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE12%EF%BC%89)
    1. [すなあらし](https://playground.babylonjs.com/?webgpu#Y2UGQ5#32 )
    2. [ファイル分割](https://playground.babylonjs.com/?webgpu=&inspectorv2=true#Y2UGQ5#60)
  - [WebGPU＋ComputeShader（その13）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE13%EF%BC%89)
  - [WebGPU＋ComputeShader（その14）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE14%EF%BC%89)
    1. [地形生成](https://playground.babylonjs.com/?webgpu#Y2UGQ5#72)
    2. [グラウンドキャニオンモード](https://playground.babylonjs.com/?webgpu#Y2UGQ5#74)
  - [WebGPU＋ComputeShader（その15）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE15%EF%BC%89)
  - [WebGPU＋ComputeShader（その16）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE16%EF%BC%89)
    11. [addSurfacePoints を使用したサンプリング方式](https://playground.babylonjs.com/?webgpu#2T9IE4#27)
    12. [頂点情報ベースの方式](https://playground.babylonjs.com/?webgpu#2T9IE4#24)
    13. [磁場で動く粒子群エフェクト](https://playground.babylonjs.com/?webgpu#MQQ77M#8)
    21. [addSurfacePoints を使用したサンプリング方式](https://playground.babylonjs.com/?webgpu#2T9IE4#26)
    22. [頂点情報ベースの方式](https://playground.babylonjs.com/?webgpu#2T9IE4#25)
  - [WebGPU＋ComputeShader（その17）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE17%EF%BC%89)
  - [WebGPU＋ComputeShader（その18）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE18%EF%BC%89)
  - [WebGPU＋ComputeShader（その19）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE19%EF%BC%89)
    1. [boid cons](https://playground.babylonjs.com/?webgpu#MQQ77M#20)
    2. [粘菌＋BOID / ハイブリッド行動モデル](https://playground.babylonjs.com/?webgpu#MQQ77M#22)
    3. [粘菌＋BOID / 捕食者-被食者モデル](https://playground.babylonjs.com/?webgpu#MQQ77M#23)
    4. [粘菌＋BOID / 状態遷移モデル](https://playground.babylonjs.com/?webgpu#MQQ77M#26)
    5. [粘菌＋BOID / 状態遷移モデル(2)](https://playground.babylonjs.com/?webgpu#MQQ77M#28)

- 公式[Compute Shaders](https://doc.babylonjs.com/features/featuresDeepDive/materials/shaders/computeShader/)
  1. [Simple compute shaders](https://playground.babylonjs.com/?webgpu#3URR7V#183)
  2. [Blur compute shader](https://playground.babylonjs.com/?webgpu#3URR7V#273)
  3. [Boids compute shader](https://playground.babylonjs.com/?webgpu#3URR7V#186)
  4. [Hydraulic erosion](https://playground.babylonjs.com/?webgpu#C90R62#16)
  5. [Slime simulation](https://playground.babylonjs.com/?webgpu#GXJ3FZ#51)
  6. [Ocean demo](https://playground.babylonjs.com/?webgpu#YX6IB8#758)
::::


### texture版を作成

[WebGPU＋ComputeShader（その17）](https://scrapbox.io/babylonjs/WebGPU%EF%BC%8BComputeShader%EF%BC%88%E3%81%9D%E3%81%AE17%EF%BC%89) のコードをもとに「ライフゲーム」を作成します。
WebGPU 側で計算し、さらにWebGPU側からテクスチャに反映するのでCPU負荷が少なく軽量で動いてくれます。

ComputeShadering では次の２つの処理を WGSL で書き直します。

- 処理１：セルオートマトン処理
  - 隣接セルの値を確認して、自身のセルの値を変更する（次世代のバッファ gridOut に書き込み）
- 処理２：テクスチャに反映
  - 次世代のバッファをテクスチャに反映

::::details セルオートマトン処理
```wgsl
// セルオートマトン処理
@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read> gridIn: array<f32>;
@group(0) @binding(2) var<storage, read_write> gridOut: array<f32>;

fn xy2i(x: i32, y: i32) -> i32 {
    let size = i32(params.gridSize);
    let wx = (x + size) % size;
    let wy = (y + size) % size;
    return wy * size + wx;
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let ux = gid.x;
    let uy = gid.y;
    let ix = i32(ux);
    let iy = i32(uy);
    
    if (ux >= params.gridSize || uy >= params.gridSize) {
        return;
    }

    let idx = xy2i(ix, iy);
    var curVal:u32 = u32(gridIn[idx]);
    var neighbors: u32 = 0u;
    for (var dy:i32 = -1; dy <= 1; dy++) {
        for (var dx:i32 = -1; dx <= 1; dx++) {
            neighbors += u32(gridIn[xy2i(ix+dx, iy+dy)]);
        }
    }
    neighbors -= curVal;

    if (curVal == 1u && (neighbors < 2u || neighbors > 3u)) {
        curVal = 0u;
    } else if (curVal == 0u && neighbors == 3u) {
        curVal = 1u;
    }

    gridOut[idx] = f32(curVal);
    
}
```

```wgsl
// テクスチャに反映
@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read> grid: array<f32>;
@group(0) @binding(2) var outputTexture: texture_storage_2d<rgba8unorm, write>;


@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let x = gid.x;
    let y = gid.y;
    
    if (x >= params.gridSize || y >= params.gridSize) {
        return;
    }
    
    let id = y * params.gridSize + x;
    let v = grid[id];
    
    // 白黒を反転
    let rv = 1-v;
    let color: vec3<f32> = vec3<f32>(rv, rv, rv);
    // テクスチャに反映    
    textureStore(outputTexture, vec2<i32>(i32(x), i32(y)), vec4<f32>(color, 1.0));
}
```
::::

![](https://storage.googleapis.com/zenn-user-upload/8dac321ede3f-20260130.gif)
*ライフゲーム：GPUtexture1000x1000*

### thinInstance版を作成

内部状態を GPU 側で計算したら、CPU側にバッファを受け取ってメッシュに反映させます。
個々のメッシュに反映させるのではなく、バッファで一律に反映させるので効率は悪くない思います。

ComputeShadering では次の２つの処理を WGSL で書き直します。

- 処理１：セルオートマトン処理
  - 隣接セルの値を確認して、自身のセルの値を変更する（次世代のバッファ gridOut に書き込み）
  - カラーバッファに結果を書き込み

::::details ソース
```wgsl
@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read_write> colors: array<f32>;
@group(0) @binding(2) var<storage, read> gridIn: array<u32>;
@group(0) @binding(3) var<storage, read_write> gridOut: array<u32>;

fn xy2i(x: i32, y: i32) -> i32 {
    let size = i32(params.gridSize);
    let wx = (x + size) % size;
    let wy = (y + size) % size;
    return wy * size + wx;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let ux = gid.x;
    let uy = gid.y;
    let ix = i32(ux);
    let iy = i32(uy);
    
    if (ux >= params.gridSize || uy >= params.gridSize) {
        return;
    }

    let idx = xy2i(ix, iy);
    var curVal:u32 = gridIn[idx];
    var neighbors: u32 = 0u;
    for (var dy:i32 = -1; dy <= 1; dy++) {
        for (var dx:i32 = -1; dx <= 1; dx++) {
            neighbors += gridIn[xy2i(ix+dx, iy+dy)];
        }
    }
    neighbors -= curVal;

    if (curVal == 1u && (neighbors < 2u || neighbors > 3u)) {
        curVal = 0u;
    } else if (curVal == 0u && neighbors == 3u) {
        curVal = 1u;
    }

    gridOut[idx] = curVal;

    let v = f32(1u - gridOut[idx]);
    let colIdx = idx * 4;
    colors[colIdx] = v;
    colors[colIdx + 1] = v;
    colors[colIdx + 2] = v;

}
```
::::

![](https://storage.googleapis.com/zenn-user-upload/aeedf7787172-20260130.gif)
*ライフゲーム：GPUthin1000x1000*

### 蛇足：compute shaderingで詰まったところ

- データ型が厳密
  - JavaScriptに慣れてしまっていると WGSLの厳格な変数の扱いにちょっと戸惑いました
- 宣言だけして使わない変数があるとダメ
  - `@group(0) @binding(..` して内部で使ってないと原因・該当箇所のはっきりしないエラーになってしまいました
- union のパラメータは定義だけではだめ、updateも必要
  - 既存コードを利用して、誤ってコメントアウトしたことに気づかずに、原因不明なエラーで詰みました
  - 結果、コードを戻して少しずつ変更しながら探って、原因を判明

### 蛇足：生成AIをつかってみる

実は知識ゼロの状態で、生成AIに丸投げしてソースコードを作ってもらいました。
が、さすがに無謀が過ぎました。
結果、中途半端に動くコードは作ってくれるのですが、何がわるいのかさっぱりでした。
やっぱり基礎知識くらいは身につけないとだめですね。

```text
# プロンプト
babylon.js で compute shadering と thinInstance を使い、セルオートマトン／ライフゲームの実装、コードを表示して。
babylon.js で compute shadering と texture を使い、セルオートマトン／ライフゲームの実装、コードを表示して。
```

## まとめ・雑感

thinInstance ではCPUでの計算をGPUに置き換えた一方で、解像度の限界は変わりませんでした（想定内）。一方で texture の方は想定外に限界が増えました。理由はよくわかってないですが、メモリ使用効率が良かったのかもしれません。

WGSL側からの効率的な反映のさせ方でわかっているのはテクスチャのみです。
thinInstance 版でも同様にGPU側から変更したかったのですが、わからずじまいで現状の形になりました。なにかしらの方法がありそうなのですが引き続き調査です。

textureなら画面の解像度のサイズまで出来るとわかったのは収穫でした。


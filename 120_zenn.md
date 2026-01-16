# Babylon.js：サイズの限界をセルオートマトン（ライフゲーム）／CPU版で検証する

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/7a0a125646bf-20260116.gif)
*ライフゲーム*

https://playground.babylonjs.com/?inspectorv2=true?BabylonToolkit#51L7PQ

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

ソース

https://github.com/fnamuoo/webgl/blob/main/120


ローカルで動かす場合、上記ソースに加え、別途 git 内の [104/js](https://github.com/fnamuoo/webgl/tree/main/104/js) を ./js として配置してください。

## 概要

[セルオートマトン（Cellular Automaton, CA）](https://ja.wikipedia.org/wiki/%E3%82%BB%E3%83%AB%E3%83%BB%E3%82%AA%E3%83%BC%E3%83%88%E3%83%9E%E3%83%88%E3%83%B3)とは、格子状に並んだ「セル（細胞や小部屋）」が、隣接するセルの状態に基づいて単純なルールに従って自身の状態を変化させていく数学的なモデルです。代表的な例として「[ライフゲーム](https://ja.wikipedia.org/wiki/%E3%83%A9%E3%82%A4%E3%83%95%E3%82%B2%E3%83%BC%E3%83%A0)」があります。

Babylon.js でセルオートマトンを表現する場合、いくつかの方法が考えられます。下記は公式の関連項目とサンプル（要素数）を示しています。

- メッシュを使う場合
  - [Mesh](https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/set/box/)
  - [Clones](https://doc.babylonjs.com/features/featuresDeepDive/mesh/copies/clones/)
  - [Instances](https://doc.babylonjs.com/features/featuresDeepDive/mesh/copies/instances/)
    - [Instancing Advanced Control](https://playground.babylonjs.com/?inspectorv2=true#HJGC2G) .. 20,000
  - [ThinInstance](https://doc.babylonjs.com/features/featuresDeepDive/mesh/copies/thinInstances/)
    - [Thin Instances Example](https://playground.babylonjs.com/?inspectorv2=true#V1JE4Z#1) .. 64,000
- 粒子を使う場合
  - [Solid Perticle System](https://doc.babylonjs.com/features/featuresDeepDive/particles/solid_particle_system/)
    - [Solid Particles With Colors and Rotations](https://playground.babylonjs.com/?inspectorv2=true#2FPT1A#9) .. 20,000
  - [Point Cloud System](https://doc.babylonjs.com/features/featuresDeepDive/particles/point_cloud_system/)
    - [Surface Color from Imported Mesh Texture](https://playground.babylonjs.com/?inspectorv2=true#UI95UC#28) .. 100,000
- テクスチャを使う場合
  - [DynamicTexture](https://doc.babylonjs.com/features/featuresDeepDive/materials/using/dynamicTexture/)
    - [Slime simulation](https://playground.babylonjs.com/?webgpu#GXJ3FZ#51) .. 50,000 ～ 250,000

今回、ライフゲームを例にそれぞれの方法でのサイズの限界、どこまで大きくできるかを探ってみました。結果、メッシュのThinInstance, もしくはテクスチャの方法なら 1000x1000(100万要素)を表示できることが確認できました。
尚、今回は CPU ベースで GPU/Compute Shaders については（勉強中にて）触れません。

## やったこと

- ライフゲーム／内部データの扱い
- Mesh で作る
- clone で作る
- instance で作る
  - 白のブロック群と黒のブロック群の２層を用意する版
  - 片面が黒で、もう片面が白のメッシュを用意する版
- thinInstance で作る
- 粒子：SolidPerticleSystem で作る
- 粒子：PointCloudSystem で作る
- DynamicTexture で作る
  - DynamicTexture(Panel)で作る
  - DynamicTexture(Layer)で作る


### ライフゲーム／内部データの扱い

ライフゲームの詳細はリンク先（[ライフゲーム](https://ja.wikipedia.org/wiki/%E3%83%A9%E3%82%A4%E3%83%95%E3%82%B2%E3%83%BC%E3%83%A0)）を参照してください。
内部状態として、「カレントの状態」と「次のステップ／世代の状態」の２状態を持たせた設計で実装しました。

::::details ライフゲーム・ルール適用の様子
```js
// ライフゲーム・ルール適用の様子

// 該当セルの隣接の「生存(v=1)」をカウントする
let getAliveCell = function(ix, iy) {
    let ncell = 0;
    if (ix == 0) {
        if (iy == 0) {
            // X*
            // **
            return dataMtrx[ix+1][iy] + dataMtrx[ix][iy+1] + dataMtrx[ix+1][iy+1];
        } else if (iy == ny_) {
            // **
            // X*
            return dataMtrx[ix][iy-1] + dataMtrx[ix+1][iy-1] + dataMtrx[ix+1][iy];
        } else {
            // **
            // X*
            // **
            return dataMtrx[ix][iy-1] + dataMtrx[ix+1][iy-1] + dataMtrx[ix+1][iy] + dataMtrx[ix][iy+1] + dataMtrx[ix+1][iy+1];
        }
    } else if (ix == nx_) {
        if (iy == 0) {
            // *X
            // **
            return dataMtrx[ix-1][iy] + dataMtrx[ix-1][iy+1] + dataMtrx[ix][iy+1];
        } else if (iy == ny_) {
            // **
            // *X
            return dataMtrx[ix-1][iy-1] + dataMtrx[ix-1][iy-1] + dataMtrx[ix-1][iy];
        } else {
            // **
            // *X
            // **
            return dataMtrx[ix-1][iy-1] + dataMtrx[ix-1][iy-1] + dataMtrx[ix-1][iy] + dataMtrx[ix-1][iy+1] + dataMtrx[ix][iy+1];
        }
    } else {
        if (iy == 0) {
            // *X*
            // ***
            return dataMtrx[ix-1][iy] + dataMtrx[ix+1][iy] + dataMtrx[ix-1][iy+1] + dataMtrx[ix][iy+1] + dataMtrx[ix+1][iy+1];
        } else if (iy == ny_) {
            // ***
            // *X*
            return dataMtrx[ix-1][iy-1] + dataMtrx[ix][iy-1] + dataMtrx[ix+1][iy-1] + dataMtrx[ix-1][iy] + dataMtrx[ix+1][iy];
        } else {
            // ***
            // *X*
            // ***
            return dataMtrx[ix-1][iy-1] + dataMtrx[ix][iy-1] + dataMtrx[ix+1][iy-1] + dataMtrx[ix-1][iy] + dataMtrx[ix+1][iy] + dataMtrx[ix-1][iy+1] + dataMtrx[ix][iy+1] + dataMtrx[ix+1][iy+1];
        }
    }
    return -1;
}

let applyRule = function() {
    // ルールの適用（カレント状態 dataMtrx をみて、次世代の状態 dataMtrxNxt をセットする）
    for (let iy = 0; iy < ny; ++iy) {
        for (let ix = 0; ix < nx; ++ix) {
            dataMtrxNxt[ix][iy] = dataMtrx[ix][iy];
            let nac = getAliveCell(ix,iy);
            if (dataMtrx[ix][iy] == 0 && nac == 3) {
                // 誕生: 死んでいるセルに隣接する生きたセルがちょうど3つあれば、次の世代が誕生
                dataMtrxNxt[ix][iy] = 1;
            }
            if (dataMtrx[ix][iy] == 1) {
                if (nac <= 1) {
                    // 過疎: 生きているセルに隣接する生きたセルが1つ以下ならば、過疎により死滅
                    dataMtrxNxt[ix][iy] = 0;
                } else if (nac >= 4) {
                    // 過密: 生きているセルに隣接する生きたセルが4つ以上ならば、過密により死滅
                    dataMtrxNxt[ix][iy] = 0;
                } else {
                    // 生存: 生きているセルに隣接する生きたセルが2つか3つならば、次の世代でも生存
                }
            }
        }
    }
}
```
::::

内部データの書き換え、「次のステップ」を「カレント」とするときに、表示を更新します。
各座標値の値（0, 1）に応じて、色を（白, 黒）に変更します。どのように見せるかはメッシュの場合とテクスチャの場合で表現方法が変わってくるのでそれぞれの手法で説明します。

### Mesh で作る

１つずつ BABYLON.MeshBuilder.CreateBox() でメッシュを作成するので一番効率が悪いです。
メッシュは座標ごとにそれぞれの場所に作成します。下記では Box で生成していますが、Plane で作成してもパフォーマンスに大差ありませんでした。

::::details Mesh 作成
```js
// Mesh 作成
let adjx=-(nx-1)/2, adjy=(ny-1)/2;
// meshMtrxを [ix][iy] で参照したいために x のループを外側、y のループを内側に
meshMtrx = [];
for (let ix = 0; ix < nx; ++ix) {
    let tmeshlist = [];
    for (let iy = 0; iy < ny; ++iy) {
        let mesh = BABYLON.MeshBuilder.CreateBox("target", { size:scale }, scene);
        mesh.position.set((ix+adjx)*scale,(-iy+adjy)*scale,0);
        tmeshlist.push(mesh);
    }
    meshMtrx.push(tmeshlist);
}
```
::::

内部データ（生存・死滅を示す 0/1）の値に対して、それぞれの material（０を示す白、１を示す黒）を割り当てます。

::::details Meshの表示変更ルーチン
```js
// Meshの表示変更ルーチン
// 死を示す(value=0)
let mat0 = new BABYLON.StandardMaterial("m0", scene);
mat0.diffuseColor = new BABYLON.Color3(1, 1, 1);
mat0.emissiveColor = new BABYLON.Color3(1, 1, 1);
// 生を示す(value=1)
let mat1 = new BABYLON.StandardMaterial("m1", scene);
mat1.diffuseColor = new BABYLON.Color3(0, 0, 0);
mat1.emissiveColor = new BABYLON.Color3(0, 0, 0);
let matList = [mat0, mat1];

// 表示を変更するルーチン
for (let iy = 0; iy < ny; ++iy) {
    for (let ix = 0; ix < nx; ++ix) {
        // 次世代の値をカレントに書き換え
        dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
        // 値に応じてメッシュのmaterialを変更する
        meshMtrx[ix][iy].material = matList[dataMtrx[ix][iy]];
    }
}
```
::::

![](https://storage.googleapis.com/zenn-user-upload/801b0414ed70-20260116.gif)
*メッシュ（50x50）の様子*

### Mesh.clone で作る

Mesh.clone() は特定のメッシュの複製を作成する技術です。clone で複製を作成する場合、幾何情報は浅いコピーとなり形状は共有されます。一方で位置と material は個別に指定できます。
生成にはコピー元（オリジナル）のメッシュmesh0 を作成し、各座標値に clone を配置します。

::::details Mesh.clone() での作成
```js
// Mesh.clone() での作成
let adjx=-(nx-1)/2, adjy=(ny-1)/2;
meshMtrx = [];
const mesh0 = BABYLON.MeshBuilder.CreateBox("target", { size:scale }, scene);
for (let ix = 0; ix < nx; ++ix) {
    let tmeshlist = [];
    for (let iy = 0; iy < ny; ++iy) {
        let mesh = mesh0.clone();
        mesh.position.set((ix+adjx)*scale,(-iy+adjy)*scale,0);
        mesh.material = mat0;
        meshInfo.push(mesh);
        tmeshlist.push(mesh);
    }
    meshMtrx.push(tmeshlist);
}
```
::::

内部状態を反映／色を変更する際は、状態に対応する material を割り当てます。（meshの場合と同様です）

::::details Mesh.clone() の表示変更ルーチン
```js
// Mesh.clone() の表示変更ルーチン
// 表示を変更するルーチン
for (let iy = 0; iy < ny; ++iy) {
    for (let ix = 0; ix < nx; ++ix) {
        dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
        meshMtrx[ix][iy].material = matList[dataMtrx[ix][iy]];
    }
}
```
::::

### Mesh.createInstance で作る

Mesh.createInstance() は特定のメッシュの複製を作成する技術です。
createInstance で複製を作成する場合、幾何情報および material も共有してしまうため、色を変更することはできません。位置は個別に指定できます。上述の mesh のように 「状態に対応する material を割り当てる」方法は使えませんが、次のような方法が考えられます。

- 白のブロック群と黒のブロック群を事前に見えない位置に配置して、状態に応じて見える位置に再配置する。ここでは白のブロック群と黒のブロック群を前後に配置して、内部状態の値に応じて、座標値における白と黒のブロックの位置・前後を入れ替えます。
- リバーシのように片面が黒で、もう片面が白のメッシュを並べて、内部状態に応じてひっくり返して、白および黒が見えるようにします。

結果的にどちらの版でもパフォーマンスに大きな差はありませんでした。

#### 白のブロック群と黒のブロック群の２層を用意する版

１か所に対し、２つのメッシュ（白と黒）を用意します。白と黒を切り替える場合は位置を入れ替える（一方を隠す）ことで表現します。メモリ効率を考えれば、必要な分を動的に用意し、不要になったらプールするのが良さげです。しかし管理する機構が複雑になるので、ここでは処理を簡略化するために、メッシュを二重に持たせた機構とします。

::::details Mesh.createInstance() での作成
```js
// Mesh.createInstance() での作成
meshMtrx30 = []; //v=0:white
meshMtrx31 = []; //v=1:black
mesh30 = BABYLON.MeshBuilder.CreateBox("target", { size:scale }, scene);
mesh30.material = new BABYLON.StandardMaterial("", scene);
mesh30.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
mesh30.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
mesh30.position.z = 0.5;

mesh31 = BABYLON.MeshBuilder.CreateBox("target", { size:scale }, scene);
mesh31.material = new BABYLON.StandardMaterial("", scene);
mesh31.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
mesh31.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
mesh31.position.z = 0.5;

let mesh;
for (let ix = 0; ix < nx; ++ix) {
    let tmeshlist0 = [], tmeshlist1 = [];
    for (let iy = 0; iy < ny; ++iy) {
        mesh = mesh30.createInstance("c0_"+ix+","+iy);
        mesh.skeleton = null;
        mesh.position.set((ix+adjx)*scale,(-iy+adjy)*scale,0);
        meshInfo.push(mesh);
        tmeshlist0.push(mesh);
        mesh = mesh31.createInstance("c1_"+ix+","+iy);
        mesh.skeleton = null;
        mesh.position.set((ix+adjx)*scale,(-iy+adjy)*scale,1);
        meshInfo.push(mesh);
        tmeshlist1.push(mesh);
    }
    meshMtrx30.push(tmeshlist0);
    meshMtrx31.push(tmeshlist1);
}
```
::::

内部状態を反映／色を変更する際は、同じindex(同じx,y)の白と黒のメッシュの z座標を入れ替えます。z=0が見える側、z=1が隠れる側になります。

::::details Mesh.createInstance() での表示変更
```js
// Mesh.createInstance() での表示変更
for (let iy = 0; iy < ny; ++iy) {
    for (let ix = 0; ix < nx; ++ix) {
        dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
        if (dataMtrx[ix][iy]) {
            // meshMtrx31を前に
            meshMtrx30[ix][iy].position.z = 1;
            meshMtrx31[ix][iy].position.z = 0;
        } else {
            // meshMtrx30を前に
            meshMtrx30[ix][iy].position.z = 0;
            meshMtrx31[ix][iy].position.z = 1;
        }
    }
}
```
::::

#### 片面が黒で、もう片面が白のメッシュを用意する版

この場合事前にテクスチャを準備しておく必要があります。

![](https://storage.googleapis.com/zenn-user-upload/62cbaacb090e-20260116.png)
*リバーシ用のテクスチャ*

並べて表示した際、モアレ縞が発生することがあります。とくにサイズを変更すると顕著になります。原因は裏表に指定するテクスチャの範囲っぽく、モアレが出来ないように余分に切り取って指定しています。

:::details Mesh.createInstance() での作成(2)
```js
// Mesh.createInstance() での作成(2)
let adjx=-(nx-1)/2, adjy=(ny-1)/2;
meshMtrx = [];
let uvB = new BABYLON.Vector4(0.2, 0, 0.3, 1); // モアレ縞がでるのでマージン多めに切り取る
let uvF = new BABYLON.Vector4(0.7, 0, 0.8, 1);
const mesh_ = BABYLON.MeshBuilder.CreatePlane("", {size:scale, frontUVs: uvF, backUVs: uvB, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
mesh_.material = new BABYLON.StandardMaterial("mat", scene);
mesh_.material.diffuseTexture = new BABYLON.Texture(fpath, scene);
mesh_.material.emissiveColor = BABYLON.Color3.White();
mesh_.position.z = -1;
let mesh;
for (let ix = 0; ix < nx; ++ix) {
    let tmeshlist = [];
    for (let iy = 0; iy < ny; ++iy) {
        mesh = mesh_.createInstance("c0_"+ix+","+iy);
        mesh.skeleton = null;
        mesh.position.set((ix+adjx)*scale,(-iy+adjy)*scale,0);
        meshInfo.push(mesh);
        tmeshlist.push(mesh);
    }
    meshMtrx.push(tmeshlist);
}
```
::::

表示を切り替えるには、メッシュを180度回転させるだけです。

::::details Mesh.createInstance() での表示変更(2)
```js
// Mesh.createInstance() での表示変更(2)
for (let iy = 0; iy < ny; ++iy) {
    for (let ix = 0; ix < nx; ++ix) {
        dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
        meshMtrx[ix][iy].rotation.x = R180*dataMtrx[ix][iy];
    }
}
```
::::

### ThinInstance で作る

ThinInstance は特定のメッシュの複製を作成する技術です。名前こそ instance と似ていますが手順は大きく違います。複製先の座標やmaterial情報を事前に用意して、対象のメッシュから軽量のインスタンス（複製）を多く作成します。こちらのサンプル[Thin Instances Example](https://playground.babylonjs.com/?inspectorv2=true#V1JE4Z#1)を参考に実装しました。

作成時に座標バッファ posiData と色バッファ colorData を設定してメッシュを作成します。
座標バッファは作成時のみ、一回だけの設定になります。一方で色バッファは固定値（alpha値）のみを設定します。RGB値の方は内部状態に応じて変化させます。

::::details ThinInstance 作成の様子
```js
// ThinInstance 作成の様子
let adjx=-(nx-1)/2, adjy=(ny-1)/2;
// 事前に、複製先の 座標バッファ posiData、色バッファ colorData を作成する
let posiData = new Float32Array(16 * n);
colorData = new Float32Array(4 * n);
let m = BABYLON.Matrix.Identity();
let index = 0;
for (let ix = 0; ix < nx; ++ix) {
    m.m[12] = (ix+adjx)*scale;
    for (let iy = 0; iy < ny; ++iy) {
        m.m[13] = (-iy+adjy)*scale;
        // m.m[14] = 0;
        m.copyToArray(posiData, index * 16);
        colorData[index * 4 + 3] = 1.0;
        ++index;
    }
}
// thinInstance で複製を作成する
let mesh = BABYLON.MeshBuilder.CreateBox("target", { size:scale }, scene);
mesh.thinInstanceSetBuffer("matrix", posiData, 16);
mesh.thinInstanceSetBuffer("color", colorData, 4);
```
::::

内部状態を反映／色を変更する際は、色バッファのRGB値を変更して、メッシュに反映させます。

::::details ThinInstance での表示変更
```js
// ThinInstance での表示変更
let index = 0;
for (let ix = 0; ix < nx; ++ix) {
    for (let iy = 0; iy < ny; ++iy) {
        dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
        if (dataMtrx[ix][iy] == 0) {
            colorData[index] = 1;
            colorData[index + 1] = 1;
            colorData[index + 2] = 1;
        } else {
            colorData[index] = 0;
            colorData[index + 1] = 0;
            colorData[index + 2] = 0;
        }
        index += 4;
    }
}
mesh.thinInstanceSetBuffer("color", colorData, 4);
```
::::

![](https://storage.googleapis.com/zenn-user-upload/2f97b9a87544-20260116.gif)
*ThinInstance（50x50）の様子*

### 粒子：SolidPerticleSystem で作る

SolidPerticleSystem(SPS) は多量の粒子（メッシュ）をつくる機能です。通常は個々の粒子の挙動を設定する関数を作り込む必要がありますが、ここでは座標は固定のまま、色だけを変更します。

::::details SPSでの作成の様子
```js
// SPSでの作成の様子
sps = new BABYLON.SolidParticleSystem('SPS', scene);
{
    // 粒子のメッシュを追加
    let mesh = BABYLON.MeshBuilder.CreateBox("b", { size:scale }, scene);
    sps.addShape(mesh, n);
    mesh.dispose();
}
let mesh4 = sps.buildMesh();
mesh4.material = new BABYLON.StandardMaterial();
mesh4.material.emissiveColor = BABYLON.Color3.White();
sps.isAlwaysVisible = true;

sps.initParticles = function() {
    let adjx=-(nx-1)/2, adjy=(ny-1)/2;
    let index = 0;
    for (let ix = 0; ix < nx; ++ix) {
        let x = (ix+adjx)*scale;
        for (let iy = 0; iy < ny; ++iy) {
            let y = (-iy+adjy)*scale;
            let pA = sps.particles[index];
            pA.position.set(x, y, 0);
            ++index;
        }
    }
}
sps.initParticles();
// 移動させないので、効率化（気持ち軽量に？
sps.mesh.freezeWorldMatrix();
sps.mesh.freezeNormals();
```
::::

内部状態を反映／色を変更する際は、粒子の色 color を変更し、更新 setParticles() を呼び出しておきます。

::::details SPSでの表示変更
```js
// SPSでの表示変更
let clist = [new BABYLON.Color3(1, 1, 1), new BABYLON.Color3(0, 0, 0)];
let index = 0;
let v, pA;
for (let ix = 0; ix < nx; ++ix) {
    for (let iy = 0; iy < ny; ++iy) {
        v = dataMtrxNxt[ix][iy]
        dataMtrx[ix][iy] = v;
        pA = sps.particles[index];
        pA.color = clist[v];
        ++index;
    }
}
sps.setParticles();
```
::::

![](https://storage.googleapis.com/zenn-user-upload/50dac0e873e8-20260116.gif)
*SolidPerticleSystem（50x50）の様子*

### 粒子：PointCloudSystem で作る

PointCloudSystem(PCS) は多量の粒子（点）をつくる機能です。SPSが任意のメッシュ形状を対象としているのに対し PCS では点となります。点といってもサイズを大きくすれば正方形になるので、画素の代わりとして十分です。
PCS作成時に scale*30 としていますが、30倍しないと隙間ができてしまうので調整として追加しました。

::::details PCSでの作成の様子
```js
// PCSでの作成の様子
pcs = new BABYLON.PointsCloudSystem('pcs', scale*30, scene);
let adjx=-(nx-1)/2, adjy=(ny-1)/2, ix, iy, x, y;
let inifunc = function (particle, i, s) {
    ix = i % nx;
    iy = Math.floor(i/nx);
    x = (ix+adjx)*scale;
    y = (-iy+adjy)*scale;
    particle.position = new BABYLON.Vector3(x, y, 0);
    particle.color = clist[0];
};
pcs.addPoints(n, inifunc);

let mesh = pcs.buildMeshAsync();
mesh.material = new BABYLON.StandardMaterial();
mesh.material.emissiveColor = BABYLON.Color3.White();
meshInfo.push(pcs);
```
::::

表示を切り替えるには、点の色を変更します。

::::details PCSでの表示変更
```js
// PCSでの表示変更
let index = 0, v, ix, iy, pA;
for (let icol = 0; icol < mcol; ++icol) {
    for (let irow = 0; irow < mrow; ++irow) {
        v = dmtrx[irow][icol];
        ix = icol, iy = irow;
        dataMtrx[ix][iy] = v;
        pA = pcs.particles[index];
        pA.color = clist[v];
        ++index;
    }
}
```
::::

### DynamicTexture で作る

他の手法がメッシュを区画としてセルオートマトンを表現するのに対し、DynamicTextureでは画像の画素自体を区画としてセルオートマトンを表現します。
動的に画像データ img を編集して、テクスチャとして反映します。尚、テクスチャを貼り付けるメッシュは平面とします。平面には Plane や Layer が使えます。Plane は３Ｄ内の平面としてシーン内に配置できますが、Layer はフルスクリーンの２Ｄレイヤーとなります。どちらもパフォーマンスに大差はありませんが、作成手順が異なるので両方紹介します。また画像を貼り付ける都合上、メッシュのサイズが画像サイズの等倍になっていないとボケた画像になってしまいます。

![](https://storage.googleapis.com/zenn-user-upload/5ff48056e5cb-20260116.gif)
*DynamicTexture（50x50）の様子*

#### DynamicTexture(Panel)で作る

画像データとして ImageData のインスタンスを用意します。また画像を material に反映するために DynamicTexture を用います。

::::details DynamicTexture(Panel) での作成の様子
```js
// DynamicTexture(Panel) での作成の様子
img = new ImageData(nx, ny);
let index = 0;
for (let i = 0; i < n; ++i) {
    img.data[index] = 255;
    img.data[index+1] = 255;
    img.data[index+2] = 255;
    img.data[index+3] = 255; // alpha
    index += 4;
}
let sw=nx*scale, sh=ny*scale;
let mesh = BABYLON.MeshBuilder.CreatePlane("target", {width:sw, height:sh}, scene);
let dytxt = new BABYLON.DynamicTexture('dt', {width:nx, height:ny}, scene)
let ctx = dytxt.getContext();
// 初回のテクスチャ反映
ctx.putImageData(img, 0, 0);
dytxt.update(false);
```
::::

内部状態を反映／色を変更する際は、画像データ img を変更して、メッシュに反映します。

::::details DynamicTexture(Panel) での表示変更
```js
// DynamicTexture(Panel) での表示変更
let index = 0;
for (let iy = ny-1; iy >= 0; --iy) {
    for (let ix = 0; ix < nx; ++ix) {
        dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
        if (dataMtrx[ix][iy] == 0) {
            img.data[index] = 255;
            img.data[index+1] = 255;
            img.data[index+2] = 255;
        } else {
            img.data[index] = 0;
            img.data[index+1] = 0;
            img.data[index+2] = 0;
        }
        index += 4;
    }
}
ctx.putImageData(img, 0, 0);
dytxt.update(false);
```
::::

#### DynamicTexture(Layer)で作る

Layer を作成する際、画像のサイズで作成するとフレーム／ウィンドウに合わせて間延びするので、ウィンドウサイズに合わせてLayerのサイズを決めます。結果、右もしくは下に余白のある表示になります。

::::details DynamicTexture(Layer) での作成の様子
```js
// DynamicTexture(Layer) での作成の様子
img = new ImageData(nx, ny);
let index = 0;
for (let i = 0; i < n; ++i) {
    img.data[index] = 255;
    img.data[index+1] = 255;
    img.data[index+2] = 255;
    img.data[index+3] = 255; // alpha
    index += 4;
}
let sw=nx*scale, sh=ny*scale;
mesh = new BABYLON.Layer("target", "", scene, true);
// ウィンドウサイズに合わせて、テクスチャのサイズを変更する
let rw = engine.getRenderWidth(), rh = engine.getRenderHeight();
let nx2, ny2;
if (rw >= rh) {
    nx2 = rw/rh*nx;
    ny2 = nx;
} else {
    nx2 = nx;
    ny2 = rh/rw*nx;
}
let dytxt = new BABYLON.DynamicTexture('dt', {width:nx2, height:ny2}, scene)
let ctx = dytxt.getContext();
ctx.putImageData(img, 0, 0);
dytxt.update(false);
mesh.texture = dytxt;
mesh._dytxt = dytxt;
mesh._ctx = ctx;
meshInfo.push(mesh);
```
::::

画像データをメッシュ(Layer)に反映する際は、material ではなく texture に反映させます。

::::details DynamicTexture(Layer) での表示変更
```js
// DynamicTexture(Layer) での表示変更
let index = 0;
// ImageDataの index 並びにあわせるために
// ループの ix と iy が入れ替わっていること、iy が逆順になっていることに注意
for (let iy = ny-1; iy >= 0; --iy) {
    for (let ix = 0; ix < nx; ++ix) {
        dataMtrx[ix][iy] = dataMtrxNxt[ix][iy];
        if (dataMtrx[ix][iy] == 0) {
            img.data[index] = 255;
            img.data[index+1] = 255;
            img.data[index+2] = 255;
        } else {
            img.data[index] = 0;
            img.data[index+1] = 0;
            img.data[index+2] = 0;
        }
        index += 4;
    }
}
mesh._ctx.putImageData(img, 0, 0);
mesh._dytxt.update(false);
```
::::

## まとめ・雑感

個数と動きを観察すると以下のようになりました。

| N           | Nx,Ny       | Mesh  | clone | inst  | Thin  | SPS   | PCS   | DT
|------------:|:-----------:|-------|-------|-------|-------|-------|-------|------
|         400 |       20x20 |  ◎   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎
|       2,500 |       50x50 |  ◎   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎
|      10,000 |     100x100 |  ○   |  ○   |  ◎   |  ◎   |  ◎   |  ◎   |  ◎
|      40,000 |     200x200 |  △   |  △   |  ○   |  ◎   |  ◎   |  ◎   |  ◎
|     160,000 |     400x400 |  ×   |  △   |  △   |  ◎   |  △   |  ◎   |  ◎
|   1,000,000 |   1000x1000 |  ×   |  ×   |  ×   |  ◎   |  ×   |  △   |  ◎
|   4,000,000 |   2000x2000 |  ×   |  ×   |  ×   |  △   |  ×   |  △   |  △
| 100,000,000 | 10000x10000 |  ×   |  ×   |  ×   |  ×   |  ×   |  ×   |  ×

（凡例：◎：快適、○：やや遅延、△：動作が重い、×：動作しない ／ 動作環境 Win11, Intel Core i7, 16 GB-MEM）

Mesh と clone、instance は大きく変わらない結果でした。instanceは手間がかかる割に大きく改善できなかったのは残念でした。

SPS は updatable=false を設定できればもう一桁ぐらい多くいけると思われますが、色を変更する必要があったため updatable=true の設定で動作させてます。
結果、Meshを使うよりやや多くまで対応できる程度でした。
SPSに比べ PCS は幾何情報が少ないためかより多くまでいけました

結果、一番多く表示ができたのが ThinInstance, DynamicTexture で、100万要素あたりが快適に動く限界でした。両方ともあまり実装の手間は変わりませんが、DynamicTextureはボケやすい（メッシュサイズと解像度を調整する必要がある）点を考えると、大規模なセルオートマトンを行う場合 ThinInstance を使うのが良いと言えそうです。

パフォーマンスを考えると、やはり[GPU/Compute Shaders](https://doc.babylonjs.com/features/featuresDeepDive/materials/shaders/computeShader/)は外せないと思ってます。といっても、上記のテーブルで「×」が「◎」になることはない、よくても「△」が「◎」になる位だとは思いますが。

![](https://storage.googleapis.com/zenn-user-upload/ad7fb9864b0c-20260116.gif)
*thinInstance(1000x1000)：ランダム*


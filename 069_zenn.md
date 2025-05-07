# Babylon.js で物理演算(havok)：滑り台と複数カメラ

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/22bc0c9eddf5-20250507.jpg)

https://playground.babylonjs.com/full.html#E767LD

（コードを見たい人はURLから `full.html` を消したURLを指定してください）

ソース

https://github.com/fnamuoo/webgl/blob/main/069

- 069_slide1_charctrl

./js 以下の babylonjs ライブラリを v8.6.1 に入れ替えてます。

## 概要

滑り台を作ってみました。
キャラクターコントローラーで移動できますが手動操作です。自動では滑りません。そこで滑り台の頂上にボールを配置して転がるようにしました。ボールが転がる様子はワイプ映像（スクリーン右上の小窓）で見れるようにしました。

ワイプ  
![](https://storage.googleapis.com/zenn-user-upload/80bc516c5dd5-20250507.jpg)

ワイプ（メインと入れ替え）  
![](https://storage.googleapis.com/zenn-user-upload/b64f85e4967f-20250507.jpg)


## やったこと

- 滑り台を作る
- すべる！
- 複数のカメラで表示

### 滑り台を作る

滑り台は tube で作成しました。中心位置の座標列を作成すればよいので大助かりです。下記、コードは座標列(myPath)の作り方のみを紹介します。
まずは簡単なものから作成して、最終的に乱数で左右にカーブするものを作ります。

滑り台１：円形（コイル）

下から上に向かって座標値を作成します。

```js
// 円形（コイル）、等幅で上昇
let nloop = 2, loopy = 8, r = 10;
let n = nloop*72, stepy = loopy/72;
for (let i = 0; i < n; ++i) {
    irad = i * R5;
    x = r*Math.cos(irad); y = i*stepy + adjy; z = r*Math.sin(irad);
    myPath.push(new BABYLON.Vector3(x, y, z));
}
```

コイルのステージ  
![](https://storage.googleapis.com/zenn-user-upload/a2837e3b2858-20250507.jpg)

滑り台２：円形（らせん）

徐々に半径を大きくしていきます。

```js
// らせん／円で半径を徐々に大きく、等幅で上昇
let nloop = 2, loopy = 8, r = 5, rstep = 0.1;
let n = nloop*72, stepy = loopy/72;
for (let i = 0; i < n; ++i) {
    irad = i * R5;
    x = r*Math.cos(irad); y = i*stepy + adjy; z = r*Math.sin(irad);
    myPath.push(new BABYLON.Vector3(x, y, z));
    r += rstep;
}
```

らせんのステージ  
![](https://storage.googleapis.com/zenn-user-upload/382d8c8e07aa-20250507.jpg)

滑り台３：乱数で左右（９０度旋回）

乱数で左右９０度の円弧、どちらかをつなげていきます。
円弧の向きが切り替わるときに円の中心位置が変わるので、現在の向き／角度に応じた座標補正を行います。

かなり曲がりくねった滑り台になります。

```js
// 乱数（等確率）で右／左の円弧(90度ごと)、等幅で上昇
let narc = 8, arcy = 2, r = 10;
let stepy = arcy/18, jarc = 0, x0=0, z0=0, arcType, arcTypeOld = true, i = 0;
for (let iarc = 0; iarc < narc; ++iarc) {
    arcType = (Math.random() < 0.5);
    if (arcType) {
        // 左円弧
        if (arcTypeOld != arcType) {
            x0 += -2*r*Math.cos(jarc*R90); z0 += -2*r*Math.sin(jarc*R90);
        }
        for (let j = 0; j < 18; ++j) {
            irad = j * R5 + jarc*R90;
            x = x0 + r*Math.cos(irad); y = i*stepy + adjy; z = z0 + r*Math.sin(irad);
            myPath.push(new BABYLON.Vector3(x, y, z));
            ++i;
        }
        jarc = (jarc+1)%4;
    } else {
        // 右円弧
        if (arcTypeOld != arcType) {
            x0 += 2*r*Math.cos(jarc*R90); z0 += 2*r*Math.sin(jarc*R90);
        }
        for (let j = 0; j < 18; ++j) {
            irad = -j*R5 + jarc*R90 + R180;
            x = x0 + r*Math.cos(irad); y = i*stepy + adjy; z = z0 + r*Math.sin(irad);
            myPath.push(new BABYLON.Vector3(x, y, z));
            ++i;
        }
        jarc = (jarc+3)%4;
    }
    arcTypeOld = arcType;
}
```

左右（９０度旋回）のステージ  
![](https://storage.googleapis.com/zenn-user-upload/24548a5669c9-20250507.jpg)


滑り台４：乱数で直進＋左右旋回

乱数で３種、直進＋左右旋回、いずれかをつなげていきます。

進行方向ベクトルと旋回のクォータニオンで経路を作成します。
babylonjs のベクトル、クォータニオンを利用するので、アルゴリズムがかなり単純になってます。

```js
// 乱数（等確率）で３種（直進、左右の旋回）、等幅で上昇
let narc = 24, roty = R5, stepy = 0.2, nloop = 15, vst = 1;
if ('narc' in geo) { narc = geo.narc; }   // 方向転換の数
if ('stepy' in geo) { stepy = geo.stepy; } // ｙ方向／垂直方向の増分
if ('vst' in geo) { vst = geo.vst; } // 進行方向の増分
const quatL = BABYLON.Quaternion.FromEulerAngles(0, roty, 0);
const quatR = BABYLON.Quaternion.FromEulerAngles(0, -roty, 0);
const quat0 = new BABYLON.Quaternion();
let vposi = new BABYLON.Vector3(0, 0, 0); // 座標位置(x,zのみ利用)
let vdir = new BABYLON.Vector3(0, 0, vst); // 進行方向ベクトル
let jarc = 0, i = 0, x=0, y=adjy, z=0, idir, quat;
for (let iarc = 0; iarc < narc; ++iarc) {
    idir = Math.floor(Math.random()*3);
    // idir = 2;
    quat = quat0; // 直進
    if (idir == 0) {
        // 左折
        quat = quatL;
    } else if (idir == 1) {
        // 右折
        quat = quatR;
    }
    for (let iloop = 0; iloop < nloop; ++iloop) {
        vdir = vdir.applyRotationQuaternion(quat); // 進行方向ベクトルの方位を変える
        vposi.addInPlace(vdir);
        myPath.push(new BABYLON.Vector3(vposi.x, y, vposi.z));
        y += stepy;
    }
}
```

直進＋左右旋回のステージ  
![](https://storage.googleapis.com/zenn-user-upload/6d5e697ae64f-20250507.jpg)

最後に、これらの滑り台（ステージ）は キー(n)で切り替えられるようにしてます。

### すべる！

滑り台をすべるために一度だけ登りましたが最初の一回でもうお腹いっぱい。
滑り台の頂上付近にワープする機能を設けました。といっても、滑り台を作ったときの最後の座標位置を記録しておいて、キャラクターコントローラーのpositionに適用するだけです。
キー(Enter)で、スタート位置（コースの終点）と頂上の２か所にワープできるようにしました。

```js
//スタート位置を記録
let characterPosition = new BABYLON.Vector3(3., 0.5, -8.);
iPosiList.unshift(characterPosition);
...

// ステージ作成時に末尾の座標(lastPosi)を取り出し記録
[stageMesh, stageAgg, lastPosi] = createTube({type:'type4', narc:50, x:0, y:0, z:0}, mat2, scene);
iPosiList.push(lastPosi);

// Enterキー押下時にワープ
scene.onKeyboardObservable.add((kbInfo) => {
    } else if (kbInfo.event.key === 'Enter') {
        ...
        iPosi = (iPosi+1) % iPosiList.length;
        characterController._position = iPosiList[iPosi].clone();
```

これで移動問題は解決！
これで心置きなく滑れる..けれども手動で滑るのはちとツライ。ダッシュ機能（shiftで３倍速、スペース／ジャンプで解除）を付けたものの面倒。

そこで代わりに滑ってくれるもの、ボールを転がすことにしました。
キー(b)で、頂上にボール３つを出現させるようにしました。

### 複数のカメラで表示

さて、ボールを出現させたものの、それをキャラクターコントローラーで追っかけるのは本末転倒。
そこで、カメラで追跡させるたい訳ですが、FollowCamera だと同じ姿勢でカメラ位置が決まる都合上、ボールが転がることで姿勢も変わるので「前から撮る」「後ろから撮る」が目まぐるしく切り替わり見てられない状況になります。さりとて ArcRotateCamera でもまぁいいのですが、これだと固定された方向からのカメラアングルでもの足りない。

そこでボールの転がっているさまを後ろからついていくように FreeCamera で自前で座標を計算することにします。といってもボールのメッシュの位置(position)とカメラの位置(position)から相対ベクトルを求め、規格化のちに定数倍して、一定の距離を保った向き(vdir)を求めます。ここでカメラの高さは固定(y=1)にしておきます。あとはポールの位置にvdirを足したものをカメラ位置とします。最初はボールの進行方向と違う向きなこともありますが、ボールが移動するにつれてボールを後追いするように収束します。

```js
let camera2B = new BABYLON.FreeCamera("Camera2B", new BABYLON.Vector3(2, 5, -10), scene);

scene.onBeforeRenderObservable.add((scene) => {
    ...
    // 追跡用カメラ(camera2B)の座標処理
    let ballMesh = balls[0][0];
    let vdir = camera2B.position.subtract(ballMesh.position).normalize().scale(5);
    vdir.y = 1;
    camera2B.position = ballMesh.position.add(vdir);
});
```

あとはメインカメラ（キャラクターコントローラー用）の映像とボール後追いのサブカメラをどうするかですが、ワイプ（画面左上に小さく表示）で２画面構成にします。

ワイプ  
![](https://storage.googleapis.com/zenn-user-upload/80bc516c5dd5-20250507.jpg)

最初は メインカメラだけ Scene.activeCameras に追加しておきます。

```js
scene.activeCameras.push(camera);
```

ワイプ画像として、メインは全体で表示するように、サブカメラは右上に小さく表示するようにしておきます。

```js
// メインは全体で表示
camera.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
// サブカメラは右上に小さく表示
camera2.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);
camera2B.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);
```

ワイプで２画面にするときは、そのタイミングでサブを Scene.activeCameras に追加します。

```js
scene.activeCameras.push(camera2);
```

このactiveCamerasに出し入れすることでワイプのカメラを入れ替えたり、メインとサブのワイプを入れ替えたりできるようです。
ちなみにキー(v)でワイプ構成を切り替えられるようにしてます。

```js
// メイン(camera)とサブ(camera2,camera2B)の複数カメラワーク
camera2type = (camera2type+1) % 4;
if (camera2type == 0) {
    // メインのみ
    while (scene.activeCameras.length > 0) {
        scene.activeCameras.pop();
    }
    scene.activeCameras.push(camera);
    camera.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
    camera2B.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);
} else if (camera2type == 1) {
    // メイン（全画面）＋サブ（ワイプ）
    if (scene.activeCameras.length >= 2) {
        scene.activeCameras.pop();
    }
    scene.activeCameras.push(camera2);
} else if (camera2type == 2) {
    // メイン（全画面）＋サブ（ワイプ）：サブのカメラを入れ替え
    if (scene.activeCameras.length >= 2) {
        scene.activeCameras.pop();
    }
    scene.activeCameras.push(camera2B);
} else if (camera2type == 3) {
    // サブ（全画面）＋メイン（ワイプ）：メインとサブを入れ替え
    while (scene.activeCameras.length > 0) {
        scene.activeCameras.pop();
    }
    scene.activeCameras.push(camera2B);
    scene.activeCameras.push(camera);
    camera2B.viewport = new BABYLON.Viewport(0, 0, 1.0, 1.0);
    camera.viewport = new BABYLON.Viewport(0.7, 0.7, 0.3, 0.3);
}
```

メインのみ  
![](https://storage.googleapis.com/zenn-user-upload/c420237c4cdd-20250507.jpg)

メイン（全画面）＋サブ（ワイプ）  
![](https://storage.googleapis.com/zenn-user-upload/cdcad47ab598-20250507.jpg)

メイン（全画面）＋サブ（ワイプ）：サブのカメラを入れ替え  
![](https://storage.googleapis.com/zenn-user-upload/416d9200e16e-20250507.jpg)

サブ（全画面）＋メイン（ワイプ）：メインとサブを入れ替え  
![](https://storage.googleapis.com/zenn-user-upload/6858ecd87eb2-20250507.jpg)

４倍速  
![](https://storage.googleapis.com/zenn-user-upload/e466e34fae00-20250507.gif)


## まとめ・雑感

滑り台にしてはちょっと長いかな。

キャラクターコントローラーをすべらせるにはちょっと面倒そうだったので代わりにボールを転がしましたが、予期せぬ方向に脱線しました。結果、複数のカメラ操作について知見を深めることができたので良しとします。

次回、「すべる」について改めます。


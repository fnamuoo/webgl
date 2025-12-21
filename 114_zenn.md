# Babylon.js で物理演算(havok)：アルペンスキー

## この記事のスナップショット

傾斜５度の様子（２倍速）  
![](https://storage.googleapis.com/zenn-user-upload/69efe17ae40e-20251221.gif)

傾斜３０度の様子（２倍速）  
![](https://storage.googleapis.com/zenn-user-upload/ae2d8dab5bc6-20251221.gif)

https://playground.babylonjs.com/?inspectorv2=true?BabylonToolkit#F3I65U

操作方法は (h)キーを押して確認してください。

（ツールバーの歯車マークから「EDITOR」のチェックを外せば画面いっぱいになります。）

ソース

https://github.com/fnamuoo/webgl/blob/main/114

ローカルで動かす場合、上記ソースに加え、別途 git 内の [104/js](https://github.com/fnamuoo/webgl/tree/main/104/js) を ./js として配置してください。

## 概要

[Babylon.js で物理演算(havok)：スキージャンプ](https://zenn.dev/fnamuoo/articles/e33eb194402674)、[Babylon.js で物理演算(havok)：ハーフパイプ](https://zenn.dev/fnamuoo/articles/09a1ab76ee8860)につづく、ウインタースポーツの第三段。アルペンスキー（滑空、回転）です。
例のごとく RaycastVehicle をスキーヤーに見立てて、ゲレンデを滑走します。旗門（きもん）は簡単にブロックで表現します。

コースは「傾斜の違い（４種）」×「直線と曲線（２種）」（ダウンヒルとスラローム）の計８種になります。

プレイヤーにスキータイプ（前後輪で舵角をつける）とスノーボード（前輪のみ舵角）を用意しました。

スキー競技に詳しくなく、滑空（ダウンヒル）や回転（スラローム）などの違いがよくわかってない人間が作っているのでツッコミはご容赦ください。

傾斜１０度（直線）  
![](https://storage.googleapis.com/zenn-user-upload/628c667b9fb7-20251221.jpg)

傾斜１０度（曲線）  
![](https://storage.googleapis.com/zenn-user-upload/42ced39b4877-20251221.jpg)


## やったこと

- コースを作る
- プレイヤーを用意する
- 旗門を設置する
- 雪煙の効果をつける
- オートスタート

### コースを作る

[Babylon.js で物理演算(havok)：スキージャンプ](https://zenn.dev/fnamuoo/articles/e33eb194402674)での経験を活かし、ゲレンデを ribbon で作成します。ただし、傾斜は線形（一定の角度）とし、パーリンノイズで表面に凹凸をつけます。パーリンノイズについてはこちら、[Babylon.js で物理演算(havok)：パーリンノイズから渓谷を作ってみる](https://zenn.dev/fnamuoo/articles/0c980a69002d9d)

この段階で試走してみるとなかなか良さげだったので、角度の違うゲレンデ（約５度、約１０度、約１５度、３０度）を用意しました。

傾斜５度（直線）  
![](https://storage.googleapis.com/zenn-user-upload/565b34e6d355-20251221.jpg)

傾斜３０度急（直線）  
![](https://storage.googleapis.com/zenn-user-upload/55e764133082-20251221.jpg)

車モデルに摩擦や抵抗がないからか、１５度でも楽に 100km/h 超えます。３０度だとスピードが乗りすぎて直進すらコントロールできなくなるのでブレーキ／減速が必須かもしれません。ちなみに初級１０度以下、中級１０～２５度、上級２５度以上らしいです。

### プレイヤーを用意する

[Babylon.js で物理演算(havok)：スキージャンプ](https://zenn.dev/fnamuoo/articles/e33eb194402674)のときと同じように、車モデル（RaycastVehicle）を使って、見かけだけスキーヤーにします。この状態でゲレンデを滑ってみると思うように曲がれません。そこで後輪にも舵角をつけることで旋回しやすくします。この場合車を操縦する感覚で操るとすぐにスピンしてしまいます。

スキーヤー  
![](https://storage.googleapis.com/zenn-user-upload/22c9e63ba180-20251221.jpg)

旧来の車モデル、前輪だけに舵角をつけるモデルも用意し、見かけをスノーボーダーとしておきます。「スノーボーダー」はCtrlキーを使った急旋回でスキーヤーを同じように旋回できます。「スキーヤー」では曲がりすぎと感じる人は「ボーダー」をおすすめします。リアルとは違う（スノボよりスキーが曲がりやすいわけではない）のでご注意ください。ここだけの話になります。

スノーボーダー  
![](https://storage.googleapis.com/zenn-user-upload/a1dcbd3ac169-20251221.jpg)

### 旗門を設置する

旗門は見た目を簡単にするために直方体のブロックとしました。また、交差判定では接触（通過）したら見た目を薄くします。

旗門を通過する様子（２倍速）  
![](https://storage.googleapis.com/zenn-user-upload/1c5c85e84072-20251221.gif)

旗門との交差判定には Mesh.intersectsMesh() を使います。すべての旗門と交差判定するのではなく、直前の旗門のみ１つと判定します。「直前の旗門」とはプレイヤーよりゴール方向（Z軸マイナス方向）にある旗門を選びます。旗門のZ軸位置をみて、プレイヤーがその位置を通過したら次の旗門を「直前の旗門」とします。また時間計測のために、最初の旗門を通過したらスタートとして、最後の旗門の通過までを計測します。ただし全ての旗門を通過したときのみタイムを有効とします。１つでも通過しそこねると失格とします。

::::details ゲートの通過、時間計測
```js
// ゲートの通過、時間計測
if (myMesh.intersectsMesh(meshgatelist[igate], true)) {
    // ゲートとの接触を確認
    passGateList[igate] = 1; // 通過フラグを立てる
    console.log("gate["+igate+"]=o");
    if (meshgatelist[igate] == meshGateLast) {
        // タイマー停止
        let pftimeEnd = performance.now();
        timeCur = Math.floor(pftimeEnd-pftime)/1000;
        let goalenable = true;
        for (let v of passGateList) {
            if (v < 0) {
                goalenable = false;
                break;
            }
        }
        if (goalenable) {
            console.log("GOAL!! time=", timeCur);
            if (stageTimeList[imymesh][istage][0] > timeCur) {
                setText2("Cong!!! 1st prize! time="+timeCur);
                setNextStage();
            } else if (stageTimeList[imymesh][istage][1] > timeCur) {
                setText2("Great!! 2nd prize! time="+timeCur);
                setNextStage();
            } else if (stageTimeList[imymesh][istage][2] > timeCur) {
                setText2("Good!   3rd prize! time="+timeCur);
                setNextStage();
            } else {
                setText2("GOAL!! time="+timeCur);
                setRestart();
            }
            console.log("stage=",istage, "org", stageTimeList[imymesh][istage]);
            let tlist = stageTimeList[imymesh][istage];
            tlist.push(timeCur);
            tlist.sort();
            tlist.pop();
            // updateRecoard();
            stageTimeList[imymesh][istage] = tlist;
            console.log("stage=",istage, "new", stageTimeList[imymesh][istage]);
        } else {
            setText2("Disqualified (;_;)");
            timeCur = 0; // 失格。未公認記録
            setRestart();
        }
    } else if (meshgatelist[igate] == meshGate1st) {
        // タイマー開始
        pftime = performance.now();
        timeCur = -1;
    }
    meshgatelist[igate].material.alpha = 0.1; // 通過したゲートをより透明に
    ++igate;
    return;
}

if (myMesh.position.z < gzlist[igate]) {
    // ゲートを外れて通過した場合
    if (passGateList[igate] == 0) {
        passGateList[igate] = -1; // 未通過フラグを立てる
        console.log("gate["+igate+"]=xxx");
    }
    ++igate;
    if (igate == ngate) {
        setText2("miss GOAL (x_x)");
        setRestart();
    }
}
```
::::

また直線なコースだと単調になりがちなので、三角関数で湾曲させたコースも用意しました。

傾斜５度（曲線）  
![](https://storage.googleapis.com/zenn-user-upload/e42c00570d44-20251221.jpg)

傾斜３０度（曲線）  
![](https://storage.googleapis.com/zenn-user-upload/b29dd747cc2d-20251221.jpg)

### 雪煙の効果をつける

一定のスピード以上かつ、姿勢の向きと進行方向がある程度ずれている（横滑りしている）ときに雪煙を出す演出を行います。演出には[Particle System](https://doc.babylonjs.com/features/featuresDeepDive/particles/particle_system/)を使いますが、[Particle Spray](https://doc.babylonjs.com/features/introductionToFeatures/chap6/particlespray/)の噴水の例をもとにしています。

演出のON/OFFの切り替えはレンダリング時に判断します。

::::details ParticleSystemの設定 と 雪煙のON/OFF処理
```js
// ParticleSystemの設定 と 雪煙のON/OFF処理

let particleSystem = null;
let createParticleSystem = function() {
    if (bSnowSpray==false) {
        return;
    }
    if (particleSystem!=null) {
        particleSystem.dispose();
    }
    particleSystem = new BABYLON.ParticleSystem("particles", 5000, scene);
    //Texture of each particle
    particleSystem.particleTexture = new BABYLON.Texture(fpathFrame, scene);
    // Where the particles come from
    particleSystem.emitter = myMesh; // new BABYLON.Vector3(0, 10, 0); // the starting object, the emitter
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.2, -0.1, 1.5); // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(-0.2, -0.1, -2); // To...
    // Colors of all particles
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
    // Size of each particle (random between...
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    // Life time of each particle (random between...
    particleSystem.minLifeTime = 0.8;
    particleSystem.maxLifeTime = 1.2;
    // Emission rate
    // particleSystem.emitRate = 1500;
    particleSystem.emitRate = 500;
    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    // Set the gravity of all particles
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new BABYLON.Vector3(-3, 4, 0.5);
    particleSystem.direction2 = new BABYLON.Vector3(-3, 4, -1);
    // Angular speed, in radians
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    // Speed
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.025;
}
var startParticleSystem = function() {
    // Start the particle system
    particleSystem.start();
};
var stopParticleSystem = function() {
    particleSystem.stop();
};
var setEmitSide = function(iside) {
    if (iside == 0) {
        // 左側
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.3, -0.5, 1.5); // Starting all from
        particleSystem.maxEmitBox = new BABYLON.Vector3(-0.3, -0.5, -2); // To...
        particleSystem.direction1 = new BABYLON.Vector3(-1, 1, 0.1);
        particleSystem.direction2 = new BABYLON.Vector3(-1, 1, -0.5);
    } else {
        // 右側
        particleSystem.minEmitBox = new BABYLON.Vector3(0.3, -0.5, 1.5); // Starting all from
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.3, -0.5, -2); // To...
        particleSystem.direction1 = new BABYLON.Vector3(1, 1, 0.1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 1, -0.5);
    }
}


// 雪煙の効果のON/OFFの切り替え処理
scene.registerAfterRender(function() {
    if (getSpeed() < 15) { // 15*3.6=54[km/h]未満ならskip
        stopParticleSystem();
        return;
    }
    // 姿勢の前方ベクトル
    let quat = myMesh.rotationQuaternion;
    let vforward = BABYLON.Vector3.Forward().applyRotationQuaternion(quat);
    // 移動ベクトル・速度ベクトル
    let vMove = myMesh._vehicle.body.getLinearVelocity();
    // 前方と移動のズレを外積でもとめる
    let vCross = vforward.cross(vMove);
    if (Math.abs(vCross.length()) < 5) {
        // スピードがあっても、向きと移動がズレていなければ無視
        stopParticleSystem();
        return;
    }
    startParticleSystem();
    if (vCross.y > 0) {
        // 右側にエフェクト
        setEmitSide(1);
    } else {
        // 左側にエフェクト
        setEmitSide(0);
    }
})
```
::::

雪煙（２倍速）  
![](https://storage.googleapis.com/zenn-user-upload/bf5872888e0a-20251221.gif)

最初はいいかなと思ったのですが、だんだんウザく感じたので、オフにする機能（ハードコードのフラグでON/OFF）を設けました（笑。

### オートスタート

３位までに入賞したら自動で次のステージに移動するように、入賞できなかった／失格になった場合は同じステージを自動で再スタートするようにしました。「せかさないで欲しい」「ゴールしたら余韻を楽しみたい／まったりしたい」という方は自動スタートのフラグをOFF(false)にしてください。

ステージ切り替えは、キーボードの(N)、(P)で行えますし、同じステージを再チャレンジしたいときは(R)で行えます。

::::details 再スタート処理
```js
// 再スタート処理

// ステージクリア（３位入賞）時の自動でステージ変更
let bAutoNextStage = true;
// ステージクリア失敗時の自動で再スタート
let bAutoStart = true;

// ３位入賞時に次のステージに自動で変更
let nextStage = function() {
    let i = istagelist.indexOf(istage);
    console.assert(i >= 0);
    i = (i+1)%istagelist.length;
    istage = istagelist[i];
    createStage(istage);
    resetMyPosi();
}
// ６秒後にステージ変更を呼び出す
let setNextStage = function() {
    if (bAutoNextStage) {
        setTimeout(nextStage, 6000);
    }
}
// 入賞できず／失格の場合：同じステージを再スタート
let setRestart = function() {
    if (bAutoStart) {
        setTimeout(resetMyPosi, 6000);
    }
}
```
::::

## まとめ・雑感

車の物理モデルとして開発された RaycastVehicle を、「ドリフトの挙動がスキーに似てる」という面だけで、スキー／スノボに転用してみました。プレイヤーのクイックな方向転換が「前後輪の舵角」で再現できたのは行幸でした。雪煙の再現にも挑戦してみました。リアルなスキーシミュレーションではありませんが、適度にリアルに寄せたゲームに仕上がったと思います。上述でも触れてますが「車モデルに摩擦や抵抗がない」ことで、逆にスピード感が出てよかったと思います。傾斜によるスピードの違いもよく表現できたと思います。リアルだとここまでの加速はないでしょうけど。

一方で、何度も試走していて完走できない、旗門を通過できないことが多発したので、調整用のフラグを導入しました。といってもパーリンノイズによる凹凸の高さを調整するだけです。イージーなら凹凸なしのフラットなゲレンデに。ハードなら凹凸で軽くジャンプする／コントロールが難しい状態になるようにしてます。ただハードモードがあまりにも難しいので、ハードモードだけ旗門の幅をやや広くしてます。デフォルトをノーマルにしてますが、難しい／ぬる過ぎると感じる方は、イージー／ハードをお試しください。ゲームと割り切るなら凹凸なし（イージー）に限定してしまうのも「アリ」な気はします。

```js
// ゲームレベル
// let gameLevel = gameLevelEasy; // 凹凸(パーリンノイズ）なし
let gameLevel = gameLevelNormal; // 凹凸(パーリンノイズ）１倍
// let gameLevel = gameLevelHard;  // 凹凸(パーリンノイズ）２倍
```

ちなみにハードコードしているコースレコード（タイム）ですが、ハードモードでのレコード＋α[秒]に設定しています。操作に慣れてきたら楽に更新できると思います。

今回ある程度うまくいくと思ってましたが、予想より楽しくて深掘りしちゃいました。

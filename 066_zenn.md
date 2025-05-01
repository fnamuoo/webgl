# Babylon.js で物理演算(havok)：自作移動体でクイックな動作／ドリフト走行＋ゴースト表示

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/51f262701271-20250430.jpg)
4倍速  
![](https://storage.googleapis.com/zenn-user-upload/b618a48f328c-20250430.gif)

（クイックな動作）  
https://playground.babylonjs.com/full.html#ZLZEIV

（カーレース、ゴースト版）  
https://playground.babylonjs.com/full.html#ZLZEIV#1

（カーレース、実体版）  
https://playground.babylonjs.com/full.html#ZLZEIV#2

（コードを見たい人はURLから `full.html` を消したURLを指定してください）

ソース

https://github.com/fnamuoo/webgl/blob/main/066

- 066a_quick  .. クイックな動作
- 066b_carrace_ghost  .. カーレース、ゴースト版
- 066c_carrace_realbody .. カーレース、実体版

ローカルで動かす場合、 ./js 以下のライブラリは 057/js を利用してください。


## 概要

「力で移動」の改修版になります。
クイックな動作を探してパラメータを調整したらなんとかモノになりました。一方でパラメータ次第で車のドリフトっぽい挙動にもなったので、レースゲームっぽく仕上げてみました。タイム計測を入れたり、自分の走行ラインを記録してゴースト表示ができるようにしてます。

## やったこと

- クイックに動かす（前進／後進）
- クイックに動かす（回転）
- ラップタイム計測（トリガーと計測方法）
- ゴーストカー表示（実体無し／メッシュのみ）
- ゴーストカーの走行データの出力と読み込み
- ゴーストカーの走行データの出力と反映のさせ方
- ゴーストカー表示（実体あり／衝突あり）

### クイックに動かす（前進／後進）

素早く移動を開始するには加える力(applyForce)で、素早く止めるには抵抗(LinearDamping)で調整します。LinearDampingはいうなれば空気抵抗／流体の粘性抵抗に相当します。抵抗値が違う場合に同じような速度を出すには抵抗値に応じて力を上げる必要があります。例えば、同じような速度感を出すときの力と抵抗値の組み合わせとして、試行錯誤の結果、次の組み合わせを使ってます。

ApplyForce | LinearDamping | 所感
-----------|---------------|---------------------------------
3.5        | 0.3           | スノー／ダートコースを走る感じ
4          | 0.5           | ドリフト車の感じ
18         | 3             | クイックに動かす／グリップ走行の車

大きな抵抗に合わせて力を大きくした場合、初動が速い（グッと飛び出す）一方で直ぐに止まります。
といっても制動距離が０になるわけではないです。また加速しても直ぐに最高速（一定速度）に到達する感じになります。

小さな抵抗・小さな力の場合、初動が遅いと感じる一方で、止まりにくくなります。またゆっくり加速して最高速が伸びる感じがあります。実際は最高速の定常状態まで時間がかかっているだけですが。ちなみに「止まりにくい」ことに関して、「ブレーキ操作」と称して抵抗を一時的に大きくすることでブレーキで減速するかのような動きを模倣できます。

```js
// 抵抗値を設定する例
let linearDumpNmr = 3;
myMesh.physicsBody.setLinearDamping(linearDumpNmr);

// 力を加える例
let vdir = new BABYLON.Vector3(0 ,0, 18);
let quat = myMesh.rotationQuaternion;
let vForce = vdir.applyRotationQuaternion(quat);
myAgg.body.applyForce(vForce, myMesh.absolutePosition);
```

ちなみに、物性を制御するパラメータとして摩擦(friction)がありますが、姿勢が崩れて制御が難しくなるので触りません。摩擦は無くして（0.001）います。

```js
// 地面に摩擦係数、反射係数を設定する
var groundAggregate = new BABYLON.PhysicsAggregate(groundMesh, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.001, restitution:0.01}, scene);

// 自機（立方体）
const myMesh = BABYLON.MeshBuilder.CreateBox("my", { size: 2 }, scene);
var myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.001, restitution:0.05}, scene);
```

### クイックに動かす（回転）

キー入力の左右（カーソルキーの左右／adキー）では、その場でY軸回転して方向転換するようにしてますが、ここに前進、後進で力が加わると逆向きの回転速度（回転モーメント）が発生して元の向きに戻ろうとします。車の挙動でいうところの「アンダーステア」が強めに発生します。
角速度が発生しそうなタイミング（キーアクション時）でAngularVelocityを常に０を設定します。

```js
myMesh.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, 0, 0)); // 回転を止める
```

また念のために回転角の抵抗AngularDampingにもやや強めの値(2)を設定しておきます。

```js
myMesh.physicsBody.setAngularDamping(2);
```

以上から、「力で移動」で、クイックな動作をさせるには下記の設定で良さげです。

- 直線抵抗値（LinearDamping）と移動に加える力（applyForce）を高めに設定
- 回転モーメントを０にする
- 回転角の抵抗AngularDampingを高めに設定

（クイックな動作）  
https://playground.babylonjs.com/full.html#ZLZEIV

ということで当初の目標（クイック動作）は以上で達成となります。

以降は、レースゲーム化します。

### ラップタイム計測（トリガーと計測方法）

スタート地点／ゴール地点にアクショントリガーを追加したくて、公式の資料[collisionEvents（公式）](https://doc.babylonjs.com/features/featuresDeepDive/physics/collisionEvents/)
を参考に、タイム計測の機能を追加します。

検知する形状は球形から直方体に変更します。
時間計測には performance を使います。自機(my)が該当領域に入ったら現時刻を取得（performance.now()）して、レコードタイム（timeBest）を更新します。

::::details スタート／ゴールラインでのタイム計測

```js
// スタート／ゴールラインでのタイム計測
var triggerShapeExtents = new BABYLON.Vector3(3, 2, 10);
let posiTriger = new BABYLON.Vector3(0.6, 1.1, 48);
var triggerPhys = new BABYLON.PhysicsShapeBox(posiTriger, new BABYLON.Quaternion(), triggerShapeExtents, scene);
const triggerMesh = BABYLON.MeshBuilder.CreateBox("triggerMesh", {width:3, height:2, depth:10}, scene);
triggerMesh.material = new BABYLON.StandardMaterial("mat");
triggerMesh.material.alpha = 0.7;
triggerMesh.material.diffuseColor = BABYLON.Color3.Red();
triggerPhys.isTrigger = true;

var triggerTransform = new BABYLON.TransformNode("triggerTransform");
var triggerBody = new BABYLON.PhysicsBody(triggerTransform, BABYLON.PhysicsMotionType.STATIC, false, scene);
triggerBody.shape = triggerPhys;
triggerMesh.position = posiTriger;

let pftime = null;
physicsPlugin.onTriggerCollisionObservable.add((ev) => {
    if (ev.type === 'TRIGGER_ENTERED' && ev.collider.transformNode.name === 'my') {
        // トリガーエリアに入ったとき
        if (pftime != null) {
            let pftimeEnd = performance.now();
            timeCur = Math.floor(pftimeEnd-pftime)/1000;
            console.log("\ntime=",timeCur);
            if (timeBest == null) {
                timeBest = timeCur
            } else if (timeBest > timeCur) {
                timeBest = timeCur;
            }
            dispTime(timeCur, timeBest);
        }
    } else if (ev.type === 'TRIGGER_EXITED' && ev.collider.transformNode.name === 'my') {
        // トリガーエリアから出たとき
        pftime = performance.now();
    }
});
```

::::

一方で、走行中のタイムを表示するために画面中央上部に表示欄を設け、表示テキスト（dispTime()でguiText2.text）を変更すれば書き変わるようにしておきます。

::::details 中央上部にタイムを表示

```js
// 中央上部にタイムを表示
let timeCur = 0;
let timeBest = null;
let advancedTexture2 = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
let guiLabelRect2 = new BABYLON.GUI.Rectangle();
guiLabelRect2.adaptWidthToChildren = true;
guiLabelRect2.height = "40px";
guiLabelRect2.cornerRadius = 5;
guiLabelRect2.color = "Blue";
guiLabelRect2.thickness = 4;
guiLabelRect2.background = "Black";
advancedTexture2.addControl(guiLabelRect2);    
let guiText2 = new BABYLON.GUI.TextBlock();
guiText2.text = timeCur.toFixed(3).padStart(7,' ');
guiText2.color = "white";
guiText2.width = "100px";
guiText2.fontSize = 12;
guiText2.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
guiText2.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
guiText2.paddingLeft = 12;
guiLabelRect2.addControl(guiText2);    
guiLabelRect2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
guiLabelRect2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

function dispTime(timeCur, timeBest) {
    if (timeBest == null) {
        guiText2.text = timeCur.toFixed(3).padStart(7,' ');
    } else {
        guiText2.text = timeCur.toFixed(3).padStart(7,' ') + "\n" + timeBest.toFixed(3).padStart(7,' ') + " (best)";
    }
}
```

::::

あとはレンダラー処理内で開始時間との差分を求め、dispTimeで表示させます。

::::details time表示

```js
scene.onBeforeRenderObservable.add(() => {
    ...
    if (pftime != null) {
        let pftimeEnd = performance.now();
        timeCur = Math.floor(pftimeEnd-pftime)/1000;
        dispTime(timeCur, timeBest);
    }
});
```

::::

![](https://storage.googleapis.com/zenn-user-upload/3831d84e7360-20250430.jpg)

### ゴーストカー表示（実体無し／メッシュのみ）

「スタート／ゴール」のアクショントリガーを実装しているので、便乗して、自身の走行を記録させてゴーストカーを表示させたいと思います。
仕組みとしては、１週目で走行データ（自機の位置と向き）を記録し、２週目以降で再生します。
トリガー領域から出たら記録を開始し（２週目以降なら別途退避させた記録データを再生）、トリガー領域に入ったら記録を停止します。
ゴーストカーは簡単にメッシュ／表示のみ（物理形状は無し）としておきます。

::::details ゴーストカー記録の仕方

```js
// ゴーストカー記録の仕方
// ghost car に関するデータ
let bGhostEnable = true; // "g"キーの on/off
let bOnRecord = false;
let gcarPosiList = [];   // 一時記録先（座標[x,y,z]とY軸回転）
const gcarMesh1 = BABYLON.MeshBuilder.CreateBox("ghost", { size: 2 }, scene);

scene.onBeforeRenderObservable.add(() => {
    if (bGhostEnable) {
        if (bOnRecord) {
            // 走行データの記録
            gcarPosiList.unshift([myMesh.position.clone(), myMesh.rotationQuaternion.toEulerAngles().y]);
        }
        ...
}

physicsPlugin.onTriggerCollisionObservable.add((ev) => {
    // console.log(ev.type, ':', ev.collider.transformNode.name, '-', ev.collidedAgainst.transformNode.name);
    if (ev.type === 'TRIGGER_ENTERED' && ev.collider.transformNode.name === 'my') {
        bOnRecord = false; // 記録停止
        if (gcarPosiList1.length == 0) {
                gcarPosiList1 = gcarPosiList;
        } else if (gcarPosiList1.length > gcarPosiList.length) {
            gcariframe1 = -1;  // 再生中の対策
            gcarPosiList1 = gcarPosiList;
        }
        gcarPosiList = [];
        ...
    } else if (ev.type === 'TRIGGER_EXITED' && ev.collider.transformNode.name === 'my') {
        bOnRecord = true; // 記録開始
        if (gcarPosiList1.length > 0) {
            gcariframe1 = gcarPosiList1.length-1;
        }
        ...
}
```

::::

走行データを逆順(unshift)で配列gcarPosiListに格納していますが、再生時に処理をちょっとだけ簡単（データ数との比較ではなく、index値自身の判定：０以上）にするための小細工です。

::::details ゴーストカーの表示の仕方

```js
// ゴーストカーの表示の仕方
scene.onBeforeRenderObservable.add(() => {
    if (bGhostEnable) {
        // ghost car の表示
        if (gcariframe1 >= 0) {
            let [vposi, roty] = gcarPosiList1[gcariframe1];
            gcarMesh1.position = vposi;
            gcarMesh1.rotation.y = roty;
            --gcariframe1;
            if (gcariframe1 < 0){
                gcarMesh1.position = new BABYLON.Vector3(0, -2, 0);
                gcarMesh1.rotation.y = 0;
            }
        }
        ...
}
```

::::

最終的にはもう少し手を入れてます。
- ゴーストカーを３つまで
- コースレコードの更新処理をちょっと複雑に（ずるしたと思われる極端に短いものはカット）

4倍速  
![](https://storage.googleapis.com/zenn-user-upload/b618a48f328c-20250430.gif)

### ゴーストカーの走行データの出力と読み込み

せっかくのコースレコードも、今のままではブラウザ上でリセット／再読み込み（Ctrl-R）すると消えてしまいます。
そこでアウトプットとインプット、走行データを文字列としてconsole.logに表示する機能（outputRunningData）と、手動で走行データ（文字列）をソースにハードコード／埋め込んでしまえばあとはそのデータを読み込んでゴーストカーの走行データとする機能（inputRunningData）を設けました。

さて、出力するデータですが、座標x,y,zとY軸角度の４変数のfloatが、１秒間に６０フレームで、コース１週あたり約６０秒のデータになるわけですが、そのままテキストで出力するとちょっと大変なことになります。

例えば３秒程度のデータ（４変数*195レコード）でもそのままなら約5000文字

```js
// 数値をべた書き（無圧縮）
[3.5315005779266357,0.9999944567680359,48.1636962890625,2.0400003688194834,3.7133071422576904,0.9999944567680359,...
```

素人考えで、桁数・精度を小数点第一まで落として出力。
小数点以下固定なので10倍にして出力してもこの例では約2500文字。

```js
// 数値をべた書き（小数点第一まで ＆ 10倍
[35,9,481,20,37,9,480,20,38,9,480,20,40,9,479,20,42,9,478,20,44,9,477,20,46,9,476,20,47,9,476,20,49,9,475,20,51,9,...
```

そもそも 無圧縮（float32）のまま base64 にした場合では約4000文字。

```js
GwRiQKP/fz+gp0BCXo8CQNOmbUCj/38/k1RAQl6PAkDXOXlAof9/P4wCQEJejwJAM3qCQKX/fz8MsD9CXo8CQC40iECm/38/IWA/Ql6PAkBn7o1Aof...
```

桁落ちさせても十分な精度の float16 にして base64 した場合は約2000文字。

```js
EEMAPAVSFEBtQwA8A1IUQMpDADwAUhRAFEQAPP5RFEBCRAA8+1EUQG9EADz5URRAnkQAPPZRFEDMRAA89FEUQPxEADzxURRAKUUAPO9RFEBXRQA87F...
```

出力形式                               |サイズ例  | 所感
---------------------------------------|----------|----------
数値をべた書き（無圧縮）               | 約5000   |動きは◎、データを編集可
数値をべた書き（小数点第一まで＆10倍   | 約2500   |動きは△、データを編集可
無圧縮（float32）＋base64              | 約4000   |動きは◎
桁落ちのfloat16＋base64                | 約2000   |動きは◎

以上のことから float16 ＋ base64でエンコード、デコードします。

ちなみに outputRunningData, inputRunningData 内の処理に関して、一度 x,y,z,roty の成分を配列に格納して base64化、もしくはbase64から復元してVector3の配列化処理をしてます。

ML081(081 ML)さまの[【JavaScript】Number型の配列をFloat32Arrayへ変換して、バイナリのままbase64で保存【データ圧縮】](https://qiita.com/ML081/items/a0f97af022613410138e)
を参考にさせていただきました。

::::details 走行データのエンコード／デコード

```js
// 走行データからのbase64化
function outputRunningData() {
    ...
    for (let tmplist2 of [gcarPosiList1, gcarPosiList2, gcarPosiList3]) {
        if (tmplist2.length == 0) {
            console.log("empty, skip");
            continue;
        }
        let tmplist = [];
        for (let [vposi,roty] of tmplist2) {
            tmplist.push(vposi.x);
            tmplist.push(vposi.y);
            tmplist.push(vposi.z);
            tmplist.push(roty);
        }
        tmplist = arrayToFloat16Array(tmplist);
        tmplist = float32ArrayToBase64(tmplist);
        console.log(tmplist);
    }
    ...
}

function arrayToFloat16Array(array) {
    const f16 = new Float16Array(array.length);
    array.forEach(function(elm, i) {
	f16[i] = elm;
    });
    return f16;
}

function float32ArrayToBase64(f32) {
    var uint8 = new Uint8Array(f32.buffer);
    return btoa(uint8.reduce(function(data, byte) {
        return data + String.fromCharCode(byte);
    }, ''));
}


// base64から走行データの復元
function inputRunningData() {
    ...
    tmplist = base64ToFloat16Array(RUNDATA1_5);
    for (let i = 0; i < tmplist.length; ++i) {
        let vx = tmplist[i]; ++i;
        let vy = tmplist[i]; ++i;
        let vz = tmplist[i]; ++i;
        let roty = tmplist[i];
        let v3 = new BABYLON.Vector3(vx, vy, vz);
        gcarPosiList1.push([v3, roty])
    }
    ...
}

function base64ToFloat16Array(base64) {
    var binary = atob(base64),
    len = binary.length,
    bytes = new Uint8Array(len),
    i;
    for(i = 0; i < len; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Float16Array(bytes.buffer);
}
```

::::

### ゴーストカーの走行データの出力と反映のさせ方

自分好みに走行データにカスタマイズする方法を説明します。

1. 最初に、データを読み込んでいる関数inputRunningDataをコメントアウトして、ゴーストカーの走行データを読み込まないようにします。

  ```js
  // inputRunningData();
  ```

2. 次に実際にプレイして、赤いボックスを通過して１週して再び赤いボックスに触れます。
   １周だけでなく何周してもかまいませんが記録されるのはベスト３までです。

3. 次に Ctrl-Shift-I を押してブラウザのデバッグツール、コンソールを表示さます。

4. 画面上で z キーを押下すると、走行データの文字列がコンソールに出力されます。
   記録の良い／短いものから順に出力されます。

5. コンソールに出力された文字列をコピーして、ソース末尾の変数 RUNDATA1_5, RUNDATA2_5, RUNDATA3_5 のいずれかと書き換えます。

6. 関数inputRunningDataのコメントを外します。

  ```js
  inputRunningData();
  ```

### ゴースト表示（実体あり／衝突あり）

ゴーストカーでも実体があると、ぶつけたり、ぶつけられたりとちょっと楽しいかも。

ゴーストカーの実体を用意するには PhysicsAggregate でインスタンス（gcarAgg1）を用意します。
さらに下記を設定しておきます。

  - setMotionType(PhysicsMotionType.ANIMATED)
  - setPrestepType(PhysicsPrestepType.TELEPORT)

この設定がないとき、デフォルトの設定のままでは、座標を操作する前後で physicsBody.disablePreStep の ture/false の呼び出しが必要になります。上記の設定をしておくことで既存のコードに手を入れることなく、変更前と同じ動作をさせることができます。

```js
// ghost car に関するデータ
const gcarMesh1 = BABYLON.MeshBuilder.CreateBox("ghost", { size: 2 }, scene);
var gcarAgg1 = new BABYLON.PhysicsAggregate(gcarMesh1, BABYLON.PhysicsShapeType.BOX, { mass: 3.0, friction: 0.01, restitution:0.05}, scene);
gcarAgg1.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
gcarAgg1.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
```

自機の方でも physicsBody.disablePreStep を呼び出さなくてよいように設定しておきます。
自機には setMotionType に DYNAMIC を指定していますが、これはゴーストカーにぶつかったときの反応を自分に返すためのものです。

```js
// 自機（立方体）
const myMesh = BABYLON.MeshBuilder.CreateBox("my", { size: 2 }, scene);
var myAgg = new BABYLON.PhysicsAggregate(myMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1.0, friction: 0.001, restitution:0.05}, scene);
myAgg.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
myAgg.body.setPrestepType(BABYLON.PhysicsPrestepType.TELEPORT);
```

ゴーストカーの方を ANIMATED ではなく（自機と同じ）DYNAMICにすると、自機とぶつかったときの衝撃でゴーストカーが回転／スピンすることがあります。でも走行ラインはデータ通りなので、ちょっと不思議な感じの動きに。なので、自機からの影響を与えない ANIMATED にしています。

## まとめ・雑感

もともとはキャラクターコントローラーに Constraints をつなげる方法がわからなくて、適当な移動体を探していたのが発端です。思わぬ拾い物、レースゲームの車のような挙動を見つけてしまい、寄り道してしまいました。

抵抗が大きいと、アクセルオフで急減速（ブレーキ）になって「エンジンブレーキかっ！」とか思ったり、ジャンプするとゆ～～～っくり落ちてきたりと、なんだかぁな感じですが楽しいので良しとします。
抵抗が小さいとスピードが伸びてくるので、抜きつ抜かれつがちょっと楽しい。
更に、立方体じゃなく車のモデルを使えばよりリアリティがでて楽しそうだけど、読者にお任せｗ

あと、カスタマイズの仕方が面倒くさくてごめんなさい。Save／Loadのボタンで処理できればよかったのですがちょっと面倒な仕組みが必要そうで、一番簡単に回避できる方法で済ませました。

デモ走行が遅すぎる／速すぎるという方は上記手順で書き換えてください。ソースに添付しているデモ走行は適当に走った記録を採用しているので、直ぐに抜けると思います。ガチにチャレンジしたい人は、データ読み込み時に調整しているデータの削除をコメントアウトしてください。
あとは、レギュレーションごと（mキー切り替えの「グリップ」「ドリフト」「滑りやすい」）で切り替えるとか、逆走用の走行データを作るとかしても楽しいかも。

mキー切り替えでびっくりした方には申し訳ないです。自機のカラーリングが変わるのは不評かとも思いつつも、切り替えの確認方法に悩んだ結果です。ポップアップなメッセージ（自動でフェードアウト）なものがあれば一番でしたが、直ぐには見つからず。でも走行中に頻繁に変えるものでもないので、こんな小細工をしなくてもよかったかも。


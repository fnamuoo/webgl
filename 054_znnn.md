# Three.js Cannon.es - 車で吹っ飛ばし／飛び道具

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/2e486f013fd3-20250320.jpg)
![](https://storage.googleapis.com/zenn-user-upload/dea22d7d3bf2-20250320.jpg)

![](https://storage.googleapis.com/zenn-user-upload/03e080556852-20250320.jpg)
![](https://storage.googleapis.com/zenn-user-upload/8a3476596d65-20250320.jpg)

ソース

https://github.com/fnamuoo/webgl/blob/main/054


動かし方

- ソース一式を WEB サーバ上に配置してください
- 操作法
  - {カーソルキー左右}／左スティック／十字キー（左右）  .. 車操作（ハンドル）
  - {カーソルキー上}／右スティック上／Aボタン           .. 車操作（アクセル）
  - 'b'／右スティック下／Bボタン                        .. 車操作（ブレーキ）
  - {カーソルキー下}／／Yボタン                         .. 車操作（バック）
  - 'n'(ON/OFFの切り替え)／Yボタン(押したときだけ有効)  .. 車操作（サイドブレーキ）
  - 'c'／RBボタン／LBボタン .. カメラ視点の変更
    - 俯瞰（ふかん）：遠方から
    - バードビュー（後方・上空から正面を向いて）
    - ドライバーズビュー（中心から正面を向いて）
    - 周りを公転
  - 'r'／RTボタン .. 姿勢リセット
  - ' '（スペース） .. ジャンプ
  - LTボタン      .. マップリセット
  - '1','2','6','7','8','9','0'／Startボタン／Backボタン .. 装備の切り替え
  - 'z','x' .. マップ切り替え
  - 'q' .. キーボードからゲームパッドへフォーカス変更
  - 'Enter'／LTボタン .. 場外判定（すべて場外時に次のステージに）

## 概要

ストレス解消の第二弾？車の装備に遠距離攻撃を追加しました。
旧装備（ブレードやドリル）はそのまま使えます。

車の装備 | 説明
--------|--------
放水             | 前方向に水（小さい粒子）を多量に放出（キー'6'に割り当て）
螺旋キューブ      | 回転するキューブを全方位に射出し、地面に半分潜航しつつ追尾（キー'7'）
竜巻             | 前方に上昇する粒子を多量に発生（キー'8'）
メテオストライク  | 大質量の球が上空から落下（キー'9'）

ステージにもちょっと工夫をこらしてみました。

ステージ | 説明
--------|--------
stage13 | ボールとスタンドをピラミッド状に配置
stage14 | タワー（立体）×４（自壊）
stage15 | タワー（ジェンガ積み）
stage16 | タワー（レンガ積み）
stage17 | ピラミッド
stage18 | テーブル
stage19 | ９パネル
stage20 | 高速コース
stage21 | 迷路

## やったこと

- 車の装備
  - 放水
  - 螺旋キューブ
  - 竜巻
  - メテオストライク

- ステージ
  - stage13：ボールとスタンドをピラミッド状に配置
  - stage14：タワー（立体）×４（自壊）
  - stage15：タワー（ジェンガ積み）
  - stage16：タワー（レンガ積み）
  - stage17：ピラミッド
  - stage18：テーブル
  - stage19：９パネル
  - stage20：高速コース
  - stage21：迷路

### 車の装備

- 放水

![](https://storage.googleapis.com/zenn-user-upload/2e486f013fd3-20250320.jpg)
![](https://storage.googleapis.com/zenn-user-upload/d8e9882950c1-20250320.gif)

まず飛び道具の基本としては、モノを直線に投げる／飛ばすものを。
試作品があまりに残念だったので、一度に表示する個数を増やして放水っぽくしました。ラスト〇ォーっぽいと思ったのは内緒。

投げ飛ばすものは小さい球で、弾数と射出間隔、ライフタイムを設けてます。弾数を制御して処理落ちにならないように、射出間隔を調整して連射になりすぎないように、弾のライフタイムで回収して再利用（再度放出）するようにしてます。途中で弾切れになるのは、偶然とはいえよいアクセントになったかなと。

:::details 弾を射出するコード

```js
    this.eq8nbullet_ = 700;  // 弾数
    this.cooltime8_ = 0;
    this.cooltime8max_ = 1; // 発射の間隔（連射しないための間隔
}

fireEq8() {
    // 弾を射出する関数
    if (this.eq8bullet_.length > 0) {
        // 射出した弾について..
        let bullet = [];
        for (let [mo,vi] of this.eq8bullet_) {
            mo.life_ = mo.life_-1; // ライフを１つ減らす
            if (mo.life_ > 0) {
                bullet.push([mo,vi]);
            } else {
                // ライフがなくなったらリサイクルに
                this.eq8recycle_.push([mo,vi]);
            }
        }
        this.eq8bullet_ = bullet;
    }
    if ((this.cooltime8_ > 0) || (this.eq8bullet_.length > this.eq8nbullet_)) {
        // クールタイムが残っている or 弾数がいっぱい
        this.cooltime8_ = this.cooltime8_-1; // 発射後のクールタイムを１つ減らす
        return;
    }
    // 発射
    this.cooltime8_ = this.cooltime8max_;
    let vposi = this.moVehicle_.chassisBody.position;
    let vquat = this.moVehicle_.chassisBody.quaternion;
    let life = 150;
    let appImp = 500;
    let radius = 0.1,  mass = 10;
    for (let ii = 0; ii < 10; ++ii) {
        // 基本、前方方向に向けつつもランダムで左右に
        let vv = vquat.vmult(new CANNON.Vec3(-3.2, 0, (Math.random()-0.5)/4));  // 前方、高さ、左右
        // 射出位置もランダムで
        let adjx = Math.random()/4-0.25;
        let adjy = Math.random()/4-0.25;
        let adjz = Math.random()/4-0.25;
        if (this.eq8recycle_.length > 0) {
            let [mo8, vi8] = this.eq8recycle_.pop();
            mo8.life_ = life;
            mo8.position = new CANNON.Vec3(vposi.x+vv.x+adjx, vposi.y+vv.y+adjy, vposi.z+vv.z+adjz);
            vi8.position.copy(mo8.position);
            // 再利用前の影響を無くすために速度、回転速度をリセットする
            mo8.velocity = new CANNON.Vec3(0, 0, 0);
            mo8.angularVelocity = new CANNON.Vec3(0, 0, 0);
            mo8.applyImpulse(vv.scale(appImp));
            this.eq8bullet_.push([mo8, vi8]);
        } else {
            let mo8 = new CANNON.Body({mass: mass,
                                        shape: new CANNON.Sphere(radius),
                                        position: new CANNON.Vec3(vposi.x+vv.x+adjx, vposi.y+vv.y+adjy, vposi.z+vv.z+adjz),
                                        material: this.moWheelMtr_,
                                      });
            mo8.life_ = life;
            let vi8 = new THREE.Mesh(new THREE.SphereGeometry(radius),
                                      new THREE.MeshBasicMaterial({color:0xc0d0ff}));
            this.world_.addBody(mo8)
            this.scene_.add(vi8);
            this.world_.addEventListener('postStep', () => {
                vi8.position.copy(mo8.position);
            })
            mo8.applyImpulse(vv.scale(appImp));
            this.eq8bullet_.push([mo8, vi8]);
        }
    }
}
```
:::

- 螺旋キューブ

![](https://storage.googleapis.com/zenn-user-upload/dea22d7d3bf2-20250320.jpg)
![](https://storage.googleapis.com/zenn-user-upload/6fe3921e75ed-20250320.gif)

単に直線的に射出するだけでは芸がないので対象のブロックに対して追尾するようにしました。
対象のブロックは場外判定で使った連想配列（id2movi）に格納済みなのでこれを使います。

ブロックの選択は適当に、場内に残っているものとします。選ぶものが完全にばらけないように、でも同じものを選び続けないように、ランダムで４種類ぐらいにばらけるようにしています。

```js
// 対象のブロックをランダムで選択
choiceBlock() {
    let defmo = this.id2movi_[0][0]; // デフォルト(見つからなかったときのため
    let re = Math.floor(Math.random()*4);  // リトライ回数
    for (const id in this.id2movi_) {
        const [moBlock2Body, viBlock2Mesh] = this.id2movi_[id];
        if (moBlock2Body.isIN_ == false) {
            continue;
        }
        let posi = moBlock2Body.position;
        if (posi.x < this.borderRng_[0] || this.borderRng_[2] < posi.x ||
            posi.z < this.borderRng_[1] || this.borderRng_[3] < posi.z) {
            moBlock2Body.isIN_ = false;
            continue;
        }
        // 場内に残っているものを選ぶ
        defmo = moBlock2Body;
        if (re > 0) {
            --re;
            continue;
        }
        return moBlock2Body;
    }
    return defmo;
}
```

追尾するには、弾とブロック（的）の位置関係から相対位置を求め、さらに的の移動速度を加えて移動先を先読みして、弾の移動を補正／力を加えます。また弾にかかる重力を打ち消すように力を加えて、上昇しやすくしておきます。ちなみに、移動速度を加味しない／先読みしない場合、少し前の場所にめがけて移動することになり、逃げられやすくなかなか当たらない状態になります。

```js
// 進行方向を修正
let trgp = mo.trg_.position;  // 的の座標
let vsub = trgp.vsub(mo.position); // 自身の座標(mo.posi)を差し引いて相対位置を算出
let trgv = mo.trg_.velocity;
vsub = vsub.vadd(trgv.scale(5));  // 的の速度を加えて、移動先を先読み
vsub.normalize();
mo.applyImpulse(vsub.scale(20)); // 力を加えて弾の移動先を補正する
const vUpF = new CANNON.Vec3(0, 2.5, 0); // 重力を打ち消す感じの力
mo.applyImpulse(vUpF); // 弾にかかる重力を打ち消す力を加えて上昇しやすくする
```

弾と地面の物性／剛性を小さく（ここでは1e2と）することで、地面に半分めり込むような挙動になり、
小さな／薄いブロックでもぶつかりやすくなります。

```js
const ground_eq11 = new CANNON.ContactMaterial(this.moGroundMtr_, this.moEq11Mtr_, {
    friction: 0.001,    // 摩擦係数(def=0.3)
    restitution: 0.3, // 反発係数 (def=0.3)
    contactEquationStiffness: 1e2,  // 剛性(def=1e7)
})
this.world_.addContactMaterial(ground_eq11);
```

なお、螺旋〇っぽくするために、生成時の角速度（angularVelocity）をいじって、乱数を割り当ててます。

```js
let mo11 = new CANNON.Body({mass: mass,
                            shape: new CANNON.Box(new CANNON.Vec3(sx_, sy_, sz_)),
                            position: new CANNON.Vec3(vposi.x+vv.x+adjx, vposi.y+vv.y+adjy, vposi.z+vv.z+adjz),
                            material: this.moEq11Mtr_,
                            angularVelocity: new CANNON.Vec3(Math.random()*100, Math.random()*100, Math.random()*100),
                            });
```

- 竜巻

![](https://storage.googleapis.com/zenn-user-upload/b005ff13be25-20250320.jpg)
![](https://storage.googleapis.com/zenn-user-upload/e15432b49fef-20250320.gif)

縦方向／上方に粒子を射出したら、竜巻っぽくなるかな？という発想からやってみました。

円形の範囲を粒子の生成範囲として、上空の中心の１点に向けて射出させます。このとき粒子が少ないと持ち上げられないので同時に生成する数を100にしています。処理落ちしないように、ライフタイムを短めにして大量に射出つづけられるようにしています。

できればトルネードのように渦を巻く感じにしたかったのですがちょっと難しす。でも、それっぽく吹っ飛ばすことに成功したので良しとします。ただ見た目が残念なことが心残り。


- メテオストライク

![](https://storage.googleapis.com/zenn-user-upload/eeae921cbc96-20250320.jpg)
![](https://storage.googleapis.com/zenn-user-upload/b2fdd40e4b13-20250320.gif)

巨大な体積、質量をもった巨石（球）を落下させます。
遠距離攻撃というよりマップ兵器ですが。

最初にまっすぐ落とすだけのものを作ったのですが、インパクトがあったのでそのまま採用。流星のように斜めに落とすことも考えてましたが、うまくエフェクトがつくれないし断念。googleで「流星」と検索して満足してください（謎）

巨石は弾数を１，クールタイムを長めにとって、連発できないようにしてます。

ちなみに質量０の固定オブジェクトを配置したときに、巨石が止まるという困ったことが発生。
解決策として、質量０の材質と巨石の物性／剛性をデフォルト(1e7)から変更して小さく(1e-3)しておきます。剛性が小さいときにめり込んでしまい、十分な厚みがないとすり抜けてしまう特性を利用します。

```js
// 巨石がmass0の物質をすり抜けるようにするための設定
const mass0_eq10 = new CANNON.ContactMaterial(this.moBlockMass0Mtr_, this.moEq10Mtr_, {
    friction: 0.3,    // 摩擦係数(def=0.3)
    restitution: 0.3, // 反発係数 (def=0.3)
    contactEquationStiffness: 1e-3,  // 剛性(def=1e7)
})
this.world_.addContactMaterial(mass0_eq10);
```


### ステージ

遠距離攻撃を生かせるステージをいくつか用意しました。

stage13：ボールとスタンドをピラミッド状に配置

![](https://storage.googleapis.com/zenn-user-upload/03e080556852-20250320.jpg)

高所に対象（ボール）を置いてみました。
追尾のアルゴリズムでは、最初に登録されたものから選び出す特性があるので、このステージでは高所にあるボールから登録するようにしてます。

螺旋キューブで狙い撃つ！
![](https://storage.googleapis.com/zenn-user-upload/ed5fb02f36aa-20250320.gif)

stage14-16：タワー

![](https://storage.googleapis.com/zenn-user-upload/dea1f06df8e8-20250320.jpg)
![](https://storage.googleapis.com/zenn-user-upload/63f116efabcd-20250320.jpg)
![](https://storage.googleapis.com/zenn-user-upload/8dacf2c133ea-20250320.jpg)

タワー系として立体／直方体を積み上げたものを用意しました。
立体を積み上げたものは自壊しにくいよう、摩擦といじってます。

```js
// 摩擦を最大(1)にしてブロック同士が滑りにくくする
const moBlockMtr = new CANNON.Material({name: 'block',
                                        friction: 1,
                                        restitution: 0.001})
```

立方体で構成したタワーはどうしても崩れるので、それを逆手にタワーの根本に対象（球）を置いてます。ちなみにタワー自体は場外の対象ではないので場外に出してもカウントダウンしません。

自壊する様子（通常の16倍で再生）
![](https://storage.googleapis.com/zenn-user-upload/76e31cded79c-20250320.gif)

タワーの自壊を防止するべく積み方に工夫したものが「ジェンガ積み」と「レンガ積み」になります。
「ジェンガ積み」は層ごとに縦のみ、横のみで積み上げたものです。ランダムで当たり（場外対象）を入れてます。
「レンガ積み」は縦横交互に入れ替えて並べて、積み上げたものです。

(レンガの肥後屋)[https://www.gb-higoya.co.jp/%E6%8A%80%E8%A1%93%E8%B3%87%E6%96%99/%E8%88%97%E8%A3%85%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3/] 
さんによると、「あじろ」という組み方らしいです。

:::details レンガを敷き詰めるアルゴリズム
```js
for (let iiz = iizs; iiz < iize; ++iiz) {
    let pz = iiz * sz;
    for (let iix = iixs; iix < iixe; ++iix) {
        let px = iix * sx;
        let imd = (ii0 + iix + iiz + iiy) % 4; // 縦横の座標(ix,iz)の和の端数でレンガの向きを決める
        ssx = sx; ssz = sz;
        ppx = px; ppz = pz;
        let cff = 0x9C4836;
        if (imd == 0) {
            if (iix < iixe-1) {
                // 横長のレンガ
                ssx = s2; ssz = sz; ppx = px + sx_; cff = 0x9b5b36;
            }
        } else if (imd == 2) {
            if (iiz < iize-1) {
                // 縦長のレンガ
                ssx = sx; ssz = s2; ppz = pz + sz_; cff = 0x9b6f36;
            }
        } else if ((imd == 1) && (iix == iixs)) {
            // 境界では立方体のレンガを
        } else if ((imd == 3) && (iiz == iizs)) {
            // 境界では立方体のレンガを
        } else {
            continue;
        }
        const viWall2Mtr = new THREE.MeshBasicMaterial({color:cff, transparent: true, opacity: 0.9});
        createBox(ssx, sy, ssz, ppx, py, ppz, adjx, adjy, adjz, mass, moBlockMtr, viWall2Mtr);
    }
}
```
:::

stage17：ピラミッド

![](https://storage.googleapis.com/zenn-user-upload/8a3476596d65-20250320.jpg)

立方体をピラミッド状に配置したものです。
頂上と玄室っぽいところに球を配置してます。


stage18：テーブル
stage19：９パネル

![](https://storage.googleapis.com/zenn-user-upload/0aaa358c53c7-20250320.jpg)
![](https://storage.googleapis.com/zenn-user-upload/87106c2e6713-20250320.jpg)

某アングリー〇ードのようにぶつけることを意図してレイアウトしてみました。
結局、思い通りに飛ばすことは無理ということで没にしたかったけど悔しいので掲載。

「９パネル」に至っては適切な角度に吹っ飛ばすことをあきらめて、車の方にジャンプ機能を追加しました。
ちなみに「ジャンプ」はそれなりの速度を保ったうえでスペースキーを押さないと高く飛びません。また、ジャンプ中に重ねてジャンプもできますが、ジャンプ時に車体を傾ける仕様なので、ジャンプしまくるとトンデモナイ方向を向くことに。ちなみにバック中にジャンプすることを想定してなかったのでおかしな挙動になります。

ジャンプの様子
![](https://storage.googleapis.com/zenn-user-upload/71c9d59da277-20250320.gif)


stage20：高速コース

![](https://storage.googleapis.com/zenn-user-upload/524b0401d537-20250320.jpg)

心機一転、車であることを生かした高速なコースです。
オススメはドリル装備ですが、装備無しでも攻略できるかも？
こういったシンプルなものが自分的に好み。

stage21：迷路

![](https://storage.googleapis.com/zenn-user-upload/e2b9ab48ad0f-20250320.jpg)

迷路モジュールとのコラボです。
迷路の上部と下部に穴をあけて、迷路中央に対象の球を配置してます。最短経路は、入口（下部のゲート）から中央の球までを示してます。

```js
// Maze2(通路と薄い壁の迷路) を使った迷路
let mapnrow = 16, mapncol = 16;
let mzdata = new Maze2.MazeData02(mapnrow, mapncol);
let imapnrow_ = Math.floor(mapnrow/2);
let imapncol_ = Math.floor(mapncol/2);
mzdata.create(22); // 穴掘り法（改） 複数経路
mzdata.setStartGoal([mapnrow-1, imapncol_], [imapnrow_,imapncol_]); // スタート・ゴールを設置
mzdata.seekPath2(); // 最短経路を求める
```

ちなみに、中央から入口まで押して運ぶことをチャレンジしましたが、あまりの面倒くささにメテオストライクしちゃいました。

## まとめ・雑感

前回につづいてストレス発散系（？）の遠距離／飛び道具版です。
思いついたアイデアを追加していったらごった煮な感じになってしまいました。一方で、発展・応用したらまとまりそうなヒントもあったかな。

- 放水車となって街中の火災現場を消して回る
- 崩壊する建物の間をすり抜ける／崩れ落ちる橋・土手の上を走り抜ける
- 妨害（薄氷やら追尾）を回避しながらチェックポイントをめぐる
- 貫一お宮の間欠泉を再現したコース
- 潜水艦になって、潜航したり、浮上したり、魚雷を打ったり

こういうのを考えているとちょっと楽しい。


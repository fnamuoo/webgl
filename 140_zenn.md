# Babylon.js で物理演算(havok)：SLのクランク動作で三輪車を動かす

## この記事のスナップショット

![](https://static.zenn.studio/user-upload/758f1f0db8fe-20260426.gif)
*スナップショット*

https://playground.babylonjs.com/?BabylonToolkit#QMIZ9P

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

## ソース

https://github.com/fnamuoo/webgl/blob/main/140

:::message
ローカルで動かす場合、上記ソースに加え、別途 git 内の [136/js](https://github.com/fnamuoo/webgl/tree/main/136/js) を ./js として配置してください。
:::

## 概要

本記事では、Babylon.js と Havok Physics を用いて、 蒸気機関車のスライダクランク機構を物理的に再現し、その作成手順を説明します。

単なるアニメーションではなく、

- 回転運動（クランク）
- リンク機構（コンロッド）
- 往復運動（ピストン）

をすべて 物理拘束（Constraint）で構築します。

正直見た目だけならクランク側を回転させて、それに合わせてコンロッド・ピストンを動かすのが簡単です。ですが、ピストン側を前後に動かすことに こだわります。

ピストン側を前後に動かしてクランクを回転運動にするため、クランク・コンロッド・ピストンが直線に並んだ状態（機械工学的にいうところの「死点でのロック」）に注意する必要があります。そこで、SL（蒸気機関車）のように２つのクランク－コンロッド－ピストンの機構を並べて、９０度ずらしてクランクと結合します。

SLまで作り上げる想定でしたが、手っ取り早く三輪車にして走らせてみたら上手くいったので、ここで切り上げることにしました。

## やったこと

- SLのクランク動作（駆動形式）を生成ＡＩで確認
- メッシュでスライダクランク機構再現
- 物理モデルにしてクランクを動かす
- 物理モデルにしてピストンを動かす
- 重力環境下で三輪車を走らせてみる

### SLのクランク動作（駆動形式）を生成ＡＩで確認

複数の生成ＡＩに「SLのクランク動作の作り方」について確認してみました。

構造的には以下のように考えればよさそうです。
また、部品や物理拘束は簡素にするのがよさそうなことも見て取れました。

![](https://static.zenn.studio/user-upload/61d1c3504051-20260426.jpg)
*クランク動作の模式図*


#### 生成ＡＩの回答

```prompt
// プロンプト
babylon.js の物理エンジンHavokでSLのクランク動作を再現するには？
```

::::details ChatGPTの回答
> SL（蒸気機関車）のクランク機構を Babylon.js + Havok Physics で再現する場合、単なる「回転」ではなく **拘束条件（constraint）の設計**が本質になります。
> 特に「回転 → 往復 → 回転」の運動変換をどうモデル化するかがポイントです。
> 
> ---
> 
> # 1. SLクランク機構の分解（物理モデル化）
> 
> まず構造を分解します：
> 
> ![Image](https://images.openai.com/static-rsc-4/DJ1S4OfitTEQOjRgFHowCzKeLVjgr-xS5s_gJKjVQB1yl8ZcyDNEWm5TxqYDJR13pa5UAQhSj6WwsMjhC0myt-Qgq_nS8zKC6XxGp9ApHxKCvvMUlTBzgMM1SOtkTOZw8SSWLflJmo-lpFgF6O4hB5YpTfaIzvxQPMHQLYlzWrISt52_Akc2CxBF6a6o9wba?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/ZDo3-wflk1DPWo-XN9_fCjuj6SpGSvF7ExVBd9P6p_3I5tiNu0Umj_HUCKv3EQNJeOs1YA3iKGqG70ytsTJdsvC8AFXJaAnITSJyz6O9Jiub8V2NsXai6dEaaem1anpGDj3skAT_qQ0R0s4DlEgiBgUEBa9JKGEoiOVJLE9JiwXwW3ew0TIKKKK6AoBO2L2R?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/_Be_K3FlFi9cBefKKeefDMPfazKEgL8xlFqbzUYiI-Gp9anDyRKurxcfb3Vqis6DtKDm3Y3vIYNUCqq34rboxK3M9LjTMAMqxuoAf0_ugHrOVwwnq58LqnBKli-BUdE90STmaUktZqZ_WuxsXd-PD3S6PqwUHt_pK40w2-QoPyAVR0tpp334wb9sfSWK4pUC?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/emC94BwrK4rDhyHNAVetdiQvbPfXQ6mXlkYug6W0oN8Ew43Hmc5wstI9AEzVir16TsEHeoSaZwB9Gzk2XVWiuopFUROptnVzoj3mduwBVmQS73cHv_9xiumc1Iyk1a3KAwuWw1b5sxttirlb0vnrDXH_HrYoKwLeNGCAvWYjLo9dMtrbr00J-k5QjtdkyVkR?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/p32p8K7BnbFGHlgEP9xWPMlgo5HcSUsaUXbLTfb64DOcEtzFbz95xItdwaDq87wW7ZMKFD8k-Tg4u38Lyi_k0juYQ6eIDva8xnGYsVoBUAJhu_5FbJ9o2eySStc3W_370Plhj492PMkvluNMreJ7r3THYjEuSOkqvybOuIlcbP6GpxjIRTztlM_ZwpQ5WnVR?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/fhF8pS_0YUD5yTY4Ba4orCler7SAIs1A8vaO5rYwvbqgUWEZYCpTN81bxwCcQmROpo3A4OKT91n9uOxffA_7E3O8hgwrLOWVOF_YRood9JOJzQNxG18s8NlhOXZBL16JHa-M6dm7nmBQQpcIWXqL_Jxb0je5GyYMvZKcqkq-G6Ho0I6pJKyoqo0uCu0MoQo4?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/oSJn8Fy6S6sQdsjU4E4y_o-KtOfPb3OAiLYHwBuFLz9J2cIka0y6i3Y5fKt2SVTzQoITWJK4Yq6WlBx_cDZCaVbeK9J7BcQYnJA2rcaDulZ5g1r6tAlzx7f-oU4SaIcAKBhPTRoDTY-tgHpmbTAiSWEB2Xsdbgnu_Vnl2_s96tRydFjNBEYwT_GidHGpnIA9?purpose=fullsize)
> 
> 構成要素：
> 
> * 駆動輪（回転体）
> * クランクピン（車輪のオフセット点）
> * コンロッド（連接棒）
> * クロスヘッド（直線運動）
> * ピストン（シリンダ内）
> 
> ---
> 
> # 2. Havokでの対応コンポーネント
> 
> Havok Physics（Babylon.js）では以下に対応します：
> 
> | 機構     | Havok要素                  |
> | ------ | ------------------------ |
> | 車輪回転   | `HingeConstraint`（回転拘束）  |
> | クランクピン | 車輪に固定されたローカルオフセット        |
> | コンロッド  | 剛体 + 両端ジョイント             |
> | クロスヘッド | `SliderConstraint`（直動拘束） |
> | ピストン   | スライダーに接続された剛体            |
> 
> ---
> 
> # 3. 最小構成（コア設計）
> 
> ## (1) 駆動輪（回転）
> 
> ```js
> const wheel = BABYLON.MeshBuilder.CreateCylinder("wheel", {...});
> const wheelBody = new BABYLON.PhysicsBody(wheel, BABYLON.PhysicsMotionType.DYNAMIC);
> 
> const hinge = new BABYLON.HingeConstraint(
>     pivotA, axisA,
>     pivotB, axisB
> );
> ```
> 
> * 軸：Z軸など
> * モーターONで回転させる
> 
> ---
> 
> ## (2) クランクピン（重要ポイント）
> 
> クランクピンは**別メッシュにしない方が安定**です：
> 
> ```js
> const crankLocal = new BABYLON.Vector3(r, 0, 0); // 半径r
> ```
> 
> 👉 これを **constraintのpivotとして使う**
> 
> ---
> 
> ## (3) コンロッド（連接棒）
> 
> ```js
> const rod = BABYLON.MeshBuilder.CreateBox("rod", {...});
> const rodBody = new BABYLON.PhysicsBody(rod, DYNAMIC);
> ```
> 
> 両端を接続：
> 
> * 車輪側 → Hinge
> * クロスヘッド側 → Ball or Hinge
> 
> ---
> 
> ## (4) クロスヘッド（直動）
> 
> ```js
> const slider = new BABYLON.SliderConstraint(
>     pivotA, axisA,
>     pivotB, axisB
> );
> ```
> 
> * 軸方向のみ移動可
> * 回転は禁止（重要）
> 
> ---
> 
> # 4. 接続構造（全体）
> 
> ```
> [Wheel]
>    └─(オフセット pivot)
>         ↓ Hinge
>       [Rod]
>         ↓ Ball/Hinge
>    [Crosshead]
>         ↓ Slider
>      [Rail]
> ```
> 
> ---
> 
> # 5. 安定させるための設計ノウハウ（重要）
> 
> SLクランクは「閉ループ機構」なので、Havokでは不安定になりやすいです。
> 
> ## ✔ 重要パラメータ
> 
> ### ① 剛体の質量バランス
> 
> ```js
> wheel.mass = 10;
> rod.mass   = 1;
> slider.mass= 2;
> ```
> 
> 👉 車輪を重くする（慣性の主軸）
> 
> ---
> 
> ### ② Constraint stiffness / damping
> 
> ```js
> constraint.setStiffness(0.9);
> constraint.setDamping(0.2);
> ```
> 
> ---
> 
> ### ③ Solver iteration増加
> 
> ```js
> scene.getPhysicsEngine().setSubTimeStep(1/120);
> ```
> 
> ---
> 
> ### ④ スライダーの自由度制限
> 
> * 回転ロック必須
> * 軸ズレ禁止
> 
> ---
> 
> # 6. よくある失敗
> 
> ### ❌ クランクピンを独立剛体にする
> 
> → 振動・爆発の原因
> 
> ### ❌ Rodを軽すぎにする
> 
> → 発散
> 
> ### ❌ Constraint多すぎ
> 
> → 解が不安定
> 
> ---
> 
> # 7. 簡易版（安定優先）
> 
> 物理で完全再現せず：
> 
> * 車輪：物理回転
> * ロッド：**位置を手動計算で追従**
> 
> ```js
> rod.position = crankWorldPosition.subtract(slider.position);
> ```
> 
> 👉 実務ではこれが一番安定
> 
> ---
> 
> # 8. 数式モデル（参考）
> 
> クランク機構は以下：
> 
> * クランク角：θ
> * 半径：r
> * ロッド長：L
> 
> ピストン位置：
> 
> ```
> x = r cosθ + √(L² - r² sin²θ)
> ```
> 
> 👉 アニメーション駆動にも使える
> 
> ---
> 
> # まとめ
> 
> HavokでSLクランクを作るには：
> 
> * 回転 → HingeConstraint
> * 往復 → SliderConstraint
> * 接続 → Rod + pivotオフセット
> * **閉ループの安定化が最重要**
> 
> ---
> 
> 必要なら：
> 
> * 実際に動く Babylon.js サンプルコード
> * テンダー機関車（複数輪連動）
> * バルブギア（ワルシャート式）
> 
> まで踏み込んで解説できます。
::::

::::details Geminiの回答
> SL（蒸気機関車）のクランク機構（スライダークランク機構）をBabylon.jsとHavok物理エンジンで再現するのは、物理シミュレーションの醍醐味とも言える素晴らしい挑戦ですね！
> 
> 複雑に見えるSLの足回りですが、基本となる**「動輪」「主連棒（コネクティングロッド）」「ピストン（クロスヘッド）」**の3つのパーツと、それらをつなぐ**「拘束（Constraints）」**を正しく設定すれば、Havokの強力な演算でリアルに動かすことができます。
> 
> 実装のステップと重要なポイントをまとめました。
> 
> ---
> 
> ## 🛠️ 基本となる3つの要素と拘束（Constraints）
> 
> SLのクランク機構を最もシンプルに分解すると、以下の図のような「スライダークランク機構」になります。
> 
> 
> 
> これをHavokで再現するために、3つの剛体（Physics Body）とそれらを繋ぐ拘束を設定します。
> 
> ### 1. 動輪（Wheel）
> * **物理形状:** 円柱（Cylinder）または球（Sphere）。
> * **拘束:** **`HINGE`（ヒンジ）**
>     * 車体（または空間の固定点）に対して、回転軸だけを許可して固定します。
> 
> ### 2. ピストン / クロスヘッド（Piston）
> * **物理形状:** 箱（Box）など。
> * **拘束:** **`PRISMATIC`（プリズマティック / スライダー）**
>     * 車体に対して、**特定の1軸方向の直線移動のみ**を許可し、回転や他の方向への移動を完全にロックします。
> 
> ### 3. 主連棒（Connecting Rod）
> * **物理形状:** 細長い箱（Box）。
> * **拘束:** 動輪とピストンを繋ぐために**2つの `HINGE`** を使います。
>     * **拘束A:** 動輪の「中心からズレた位置（クランクピン）」と、主連棒の端を `HINGE` で接続。
>     * **拘束B:** 主連棒のもう一方の端と、ピストンを `HINGE` で接続。
> 
> ---
> 
> ## 💻 Babylon.js + Havok での実装コード例
> 
> 以下は、TypeScript/JavaScriptで拘束を設定する際のエッセンスです。
> 
> ```javascript
> // 1. 動輪をワールド（または車体）にヒンジ結合
> const wheelToWorld = new BABYLON.PhysicsConstraint(
>     BABYLON.PhysicsConstraintType.HINGE,
>     {
>         pivotA: new BABYLON.Vector3(0, 0, 0), // 車輪の中心
>         axisA: new BABYLON.Vector3(0, 0, 1),  // 回転軸（Z軸など）
>         pivotB: wheelPosition,                 // ワールド座標
>         axisB: new BABYLON.Vector3(0, 0, 1),
>     },
>     scene
> );
> wheelBody.addConstraint(worldBody, wheelToWorld);
> 
> // 2. ピストンをワールド（または車体）にスライダー結合
> const pistonToWorld = new BABYLON.PhysicsConstraint(
>     BABYLON.PhysicsConstraintType.PRISMATIC,
>     {
>         pivotA: new BABYLON.Vector3(0, 0, 0),
>         axisA: new BABYLON.Vector3(1, 0, 0), // X軸方向のみ移動許可
>         pivotB: pistonStartPosition,
>         axisB: new BABYLON.Vector3(1, 0, 0),
>     },
>     scene
> );
> pistonBody.addConstraint(worldBody, pistonToWorld);
> 
> // 3. 車輪のピンとロッドをヒンジ結合
> const wheelToRod = new BABYLON.PhysicsConstraint(
>     BABYLON.PhysicsConstraintType.HINGE,
>     {
>         pivotA: new BABYLON.Vector3(1.5, 0, 0), // 中心から1.5ズレたクランクピンの位置
>         axisA: new BABYLON.Vector3(0, 0, 1),
>         pivotB: new BABYLON.Vector3(-2, 0, 0), // ロッドの端
>         axisB: new BABYLON.Vector3(0, 0, 1),
>     },
>     scene
> );
> wheelBody.addConstraint(rodBody, wheelToRod);
> ```
> 
> ---
> 
> ## 💡 物理エンジンを暴走させないための3つのコツ
> 
> Havokは非常に安定していますが、クランクのような「閉じたリンク機構（閉ループ）」は物理エンジンが最も苦手とするものの1つです。パーツが吹き飛んだり、ガタガタ震えたりするのを防ぐためのコツをご紹介します。
> 
> 1.  **パーツ間の衝突をオフにする**
>     * 動輪、ロッド、ピストンが互いにぶつかり合うと計算が破綻します。`disableCollisionsBetweenLinkedBodies: true` を設定するか、コリジョングループを分けて**お互いの衝突を無効化**してください。
> 2.  **質量のバランス（Mass Ratio）**
>     * 例えば、巨大で重い動輪に対して、ロッドの質量を極端に軽く（例: 1000対1など）設定すると、計算が不安定になります。質量比はせいぜい **1:10** の範囲に収めるのがベストです。
> 3.  **動力は「動輪」か「ピストン」の片方だけに与える**
>     * 動輪に `pivotA` の回転モーター（Motor）を設定して回すか、ピストンを力（Force）で押し出すか、どちらか一方にしてください。両方から力を加えると喧嘩して壊れます。
> 
> ---
> 
> まずはこのシンプルな1セットを動かしてみて、上手くいったら「弁装置（ワルシャート式など）」のより複雑なリンクに挑戦するのがおすすめです！
> 
> もしよろしければ、**実際に動くコードの雛形（HTMLやTypeScript）を作成してみましょうか？** それとも、特定の拘束（ヒンジやプリズマティック）のパラメータ設定についてもっと詳しく掘り下げますか？
::::

::::details Claudeの回答
> Babylon.jsのHavok物理エンジンでスコッチヨーク（SL）クランク機構を再現する方法を説明します。まず、SLクランク機構の仕組みを図解してから、Babylon.js + Havokでの実装コードを解説します。## Babylon.js + Havok でのSLクランク実装
> 
> ### 基本構成
> 
> SLクランク（スコッチヨーク）は以下の3要素で構成され、Havokでは**PhysicsConstraint**で連結します。
> 
> ```
> クランク軸（回転体）→ HingeConstraint
>        ↕ピン接続
> スライダーブロック → SliderConstraint（直線拘束）
> ```
> 
> ---
> 
> ### 実装コード
> 
> ```typescript
> import HavokPhysics from "@babylonjs/havok";
> import { HavokPlugin, PhysicsBody, PhysicsMotionType,
>          PhysicsShapeBox, PhysicConstraintAxis,
>          HingeConstraint, SliderConstraint,
>          MotorEnabledJoint } from "@babylonjs/core";
> 
> async function createSLCrank(scene: Scene) {
>   // 1. Havok 初期化
>   const havokInstance = await HavokPhysics();
>   const hkPlugin = new HavokPlugin(true, havokInstance);
>   scene.enablePhysics(new Vector3(0, -9.81, 0), hkPlugin);
> 
>   // ── クランク軸（Kinematic / モーター駆動） ──────────────
>   const crankMesh = MeshBuilder.CreateCylinder("crank", {
>     height: 0.2, diameter: 0.1
>   }, scene);
>   crankMesh.position = new Vector3(0, 1, 0);
> 
>   const crankBody = new PhysicsBody(
>     crankMesh,
>     PhysicsMotionType.ANIMATED,   // ← Kinematicに相当
>     false, scene
>   );
>   new PhysicsShapeBox(new Vector3(0,0,0), Quaternion.Identity(),
>     new Vector3(0.1, 0.2, 0.1), scene
>   ).setAsBodyShape(crankBody);
> 
>   // ── クランクアーム ──────────────────────────────────────
>   const armMesh = MeshBuilder.CreateBox("arm", {
>     width: 0.5, height: 0.05, depth: 0.05
>   }, scene);
>   armMesh.position = new Vector3(0.25, 1, 0);
> 
>   const armBody = new PhysicsBody(
>     armMesh,
>     PhysicsMotionType.DYNAMIC,
>     false, scene
>   );
>   new PhysicsShapeBox(new Vector3(0,0,0), Quaternion.Identity(),
>     new Vector3(0.5, 0.05, 0.05), scene
>   ).setAsBodyShape(armBody);
>   armBody.setMassProperties({ mass: 1 });
> 
>   // Hinge: クランク軸とアームをZ軸周りに回転連結
>   const hingeConstraint = new HingeConstraint(
>     new Vector3(0.25, 0, 0),   // アーム側ピボット
>     new Vector3(0, 0, 0),      // クランク軸側ピボット
>     new Vector3(0, 0, 1),      // 回転軸 = Z軸
>     new Vector3(0, 0, 1),
>     scene
>   );
>   armBody.addConstraint(crankBody, hingeConstraint);
> 
>   // ── スライダーブロック ───────────────────────────────────
>   const sliderMesh = MeshBuilder.CreateBox("slider", {
>     width: 0.2, height: 0.2, depth: 0.15
>   }, scene);
>   sliderMesh.position = new Vector3(0.5, 1, 0);
> 
>   const sliderBody = new PhysicsBody(
>     sliderMesh,
>     PhysicsMotionType.DYNAMIC,
>     false, scene
>   );
>   new PhysicsShapeBox(new Vector3(0,0,0), Quaternion.Identity(),
>     new Vector3(0.2, 0.2, 0.15), scene
>   ).setAsBodyShape(sliderBody);
>   sliderBody.setMassProperties({ mass: 2 });
> 
>   // Slider Constraint: X軸方向のみ移動を許可（SLの直線拘束）
>   const sliderConstraint = new SliderConstraint(
>     new Vector3(0, 0, 0),         // スライダー側
>     new Vector3(0.5, 0, 0),       // アーム先端側
>     new Vector3(1, 0, 0),         // スライド方向 = X軸
>     new Vector3(1, 0, 0),
>     scene
>   );
>   sliderBody.addConstraint(armBody, sliderConstraint);
> 
>   // ── クランク軸を一定角速度で回転（モーター） ─────────────
>   const RPM = 60;                     // 毎分回転数
>   const omega = (RPM * 2 * Math.PI) / 60;  // rad/s
> 
>   scene.onBeforeRenderObservable.add(() => {
>     const dt = scene.getEngine().getDeltaTime() / 1000;
>     const currentRot = crankMesh.rotationQuaternion
>       ?? Quaternion.Identity();
> 
>     // Z軸周りに増分回転
>     const deltaRot = Quaternion.RotationAxis(
>       Vector3.Forward(), omega * dt
>     );
>     crankMesh.rotationQuaternion = currentRot.multiply(deltaRot);
> 
>     // ANIMATED BodyにはsetTargetTransformで同期が必要
>     crankBody.setTargetTransform(
>       crankMesh.position,
>       crankMesh.rotationQuaternion
>     );
>   });
> }
> ```
> 
> ---
> 
> ### 設計上のポイント
> 
> **1. PhysicsMotionType の選択**
> クランク軸は物理演算に支配されず一定速で回すため `ANIMATED`（Kinematic）を使います。スライダーとアームは `DYNAMIC` で慣性・摩擦が効きます。
> 
> **2. SliderConstraint の軸合わせ**
> SLクランクの核心はスロット（溝）でピンが拘束される部分です。Havokでは `SliderConstraint` の局所軸を正確にX軸に揃えることで、純粋な正弦波往復運動 `x = R·cos(ωt)` が得られます。
> 
> **3. setTargetTransform の必須呼び出し**
> `ANIMATED` ボディはメッシュの `position/rotationQuaternion` を直接書き換えただけでは物理ワールドに反映されません。毎フレーム `setTargetTransform()` で同期してください。
> 
> **4. スロット（溝）の再現**
> 物理的な溝形状を再現するなら `PhysicsShapeBox` でスロット形状を作り、ピンメッシュと `SliderConstraint` を組み合わせるか、あるいは数値制御（Kinematic）でピン位置を直接計算する方法も現実的です。
> 
> ---
> 
> ### 参考：完全な動作デモ
> 
> Babylon.js Playground でそのまま試せる構成にするには `@babylonjs/havok` をCDNから読み込む必要があります。公式Playgroundでは以下のURLでHavokが利用可能です。
> 
> ```
> https://cdn.babylonjs.com/havok/HavokPhysics.umd.js
> ```
> 
> 何か詰まっている部分（ジョイントのパラメータ調整、モーターの速度制御、スロット形状の物理コライダー設定など）があればお気軽にどうぞ！
::::

### メッシュでスライダクランク機構再現

まずはメッシュのみで、スライダクランク機構を再現します。
メッシュ位置を計算する関数を作っておけば、次の物理構造のときの初期位置に使えるので無駄にならないです。[Babylon.js で物理演算(havok)：テオ・ヤンセン機構で歩かせてみる](https://zenn.dev/fnamuoo/articles/faf274102dac5f) を経験した後だと、非常に簡単です。

::::details クランク機構の座標計算
```js
// クランク機構の座標計算
let calcPosi = function(rad_, v2list_, pplen) {
    // 点P1の座標値
    v2list_[1].x = pplen[1]*Math.cos(rad_);
    v2list_[1].y = pplen[1]*Math.sin(rad_);
    // 点P2の座標値
    let ry12 = Math.atan2(pplen[12],v2list_[1].y)
    v2list_[2].x = v2list_[1].x + pplen[12]*Math.sin(ry12);
    v2list_[2].y = 0;
    // 点P3の座標値
    v2list_[3].x = v2list_[2].x + pplen[23];
    v2list_[3].y = 0;
    return v2list_;
}
```
::::

![](https://static.zenn.studio/user-upload/a0bdb32075be-20260426.jpg)
*メッシュ（点）でのスライダクランク機構*

車輪（動輪）やピストン、スライダをつけて装飾したら、以下のような感じになります。

![](https://static.zenn.studio/user-upload/9c8396aad1a4-20260426.gif)
*メッシュ（車輪・スライダ）でのスライダクランク機構*

### 物理モデルにしてクランクを動かす

次の段階として、メッシュに物理メッシュ（体積、質量）や物理拘束を施します。

スライダクランク機構に必須なメッシュおよびアンカー（固定部）用のボディを用意します。ここで車輪は見た目だけのメッシュに留めて、クランクに固定（親子指定）しているだけです。

動作確認として、
「無重力環境下で完全に静止していること」、
「クランク側を回転させてスムーズに動くこと」
になっているかを確認します。

![](https://static.zenn.studio/user-upload/44920fb5f661-20260426.gif)
*物理形状のスライダクランク機構（クランク動作）*

### 物理モデルにしてピストンを動かす

ピストン側を動かすために、スライダクランク機構を二重にして９０度ずらして配置します。
ピストンを動かす場合、車輪の傾き（角度）に応じて、力を加える向きを切り替えます。

::::details ピストン側を動かす
```js
 // ピストン側を動かす
 let impF = 1; // 前進:=正 / 後進:=負
 scene.onBeforeRenderObservable.add(() => {
     let quat = mesh0.rotationQuaternion;
     let radorg = quat.toEulerAngles();
     let ii = -1;
     for (let r of radinilist) {
         ++ii;
         let mesh = meshlist[ii]; // ピストンのメッシュ
         let rad = radorg.z + r;
         while (rad <= -R180) { rad += R360; }
         while (rad > R180) { rad -= R360; }
         if (rad > 0) {
             mesh._agg.body.applyImpulse(BABYLON.Vector3.Right().scale(impF), mesh.absolutePosition);
         } else {
             mesh._agg.body.applyImpulse(BABYLON.Vector3.Right().scale(-impF), mesh.absolutePosition);
         }
     }
 })
```
::::

![](https://static.zenn.studio/user-upload/806cd890ade0-20260426.gif)
*物理形状のスライダクランク機構（ピストン動作）*

### 重力環境下で三輪車を走らせてみる

上述までで、スムーズに動くことが確認できたので、車輪を物理化（体積、質量、摩擦係数）を付けて、ボディも固定化(mass=0)を解除して質量を指定(mass=1)し、可動できるようにします。重力を有効にして、質量・摩擦係数・ピストンの力を調整して、なんとか直進することができました。

![](https://static.zenn.studio/user-upload/7b23df6cb65b-20260426.gif)
*重力下でのテスト走行*

せっかくなので、４カメラで走行状態を確認してみました。

![](https://static.zenn.studio/user-upload/758f1f0db8fe-20260426.gif)
*走行時の様子*

スピードが出てくるとスライダクランク機構の動きが影響するようで、三輪車がフラフラします。気になる方は上記の Playground のリンクでご確認ください。

## まとめ・雑感

三輪車のテスト走行で満足してしまいました。そして４カメラを実装して気力が尽きました。

物理演算で安定な走行を目指して「パラメータ調整の沼」にハマるのは勘弁願いたいところです。SLを走らせるならメッシュで十分な気がする、いやそうすべきですね。ピストン駆動でもクランク駆動でも、見た目は一緒だし。


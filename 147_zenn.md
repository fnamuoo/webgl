# Babylon.js：クラスター照明を使ってみる

## この記事のスナップショット

![](https://static.zenn.studio/user-upload/5317ac355e90-20260522.gif)
*スナップショット：ストーンサークル*

![](https://static.zenn.studio/user-upload/fa1462e6ad0d-20260522.gif)
*スナップショット：信号機（2倍速）*

![](https://static.zenn.studio/user-upload/e647ffb22ebe-20260522.gif)
*スナップショット：灯篭*

https://playground.babylonjs.com/?BabylonToolkit#2I54ZD

（上記のURLにおいて、ツールバーの歯車マークから「EDITOR」のチェックを外せばウィンドウいっぱいに、歯車マークから「FULLSCREEN」を選べば画面いっぱいになります。）

## ソース

https://github.com/fnamuoo/webgl/blob/main/147

:::message
ローカルで動かす場合、上記ソースに加え、別途 git 内の [136/js](https://github.com/fnamuoo/webgl/tree/main/136/js) を ./js として配置してください。
:::

## 概要

クラスター照明[Clustered Lighting](https://doc.babylonjs.com/features/featuresDeepDive/lights/clusteredLighting/)を使った例を３つ作ってみました。Google Chromeで日本語訳すると「クラスター照明」と表示されるのでこの用語を用います。

- １つ目は「ストーンサークル」、APIの確認がてら作成しました。光源にあたる部分に玉を配置しています。
- ２つ目は「信号機」、青黄赤にあたる部分に光源を割り当てて、時間で切り替えた作品です。
- ３つ目は「灯篭」、炎のように明かりが揺らぐ様子を再現してみました。

光源はいくつでも作成できますが、同時に処理できる光源の数には制限があります[limitations](https://doc.babylonjs.com/features/featuresDeepDive/lights/lights_introduction/#limitations)。

maxSimultaneousLights を変更することで同時に使える光源の数を変更できます。
デフォルトでは４つで、自分の環境/Babylon.js 9.1.0 だと最大 10 でした。

クラスター照明ではこの数の制限を超えて1000個の照明 [Sponza scene with 1000 lights](https://playground.babylonjs.com/#CSCJO2#899) を使うこともできます。


## やったこと

- 試作１：「ストーンサークル」
- 試作２：「信号機」
- 試作３：「灯篭」
- 影をつくる検証

### 試作１：「ストーンサークル」

半径と角度を調整して、渦巻き状に柱を配置し、その上に光源をおきます。

::::details 渦巻き状に配置する方法
```js
// 石柱
let nmesh=200, meshH = 0.3, meshH_=meshH/2, r=0.75, rad=0, radstep=0.55, x,y,z;
y = meshH_;
// らせん状に配置する
let mesh01 = null, mesh02 = null;
for (let iz = 0; iz < nmesh; iz += 1) {
    let mesh = null;
    // 石柱（支柱）のメッシュ作成
    mesh = BABYLON.MeshBuilder.CreateCylinder("cylinder", {diameter:0.1, height:meshH, tessellation:6});
    mesh.material = mat2;
    x = r*Math.cos(rad);
    z = r*Math.sin(rad);
    mesh.position.set(x, y, z);
    // 半径を大きくしつつ、回転角度を小さくしていく
    r *= 1.017;
    rad += radstep;
    radstep *= 0.992;
}
```
::::

![](https://static.zenn.studio/user-upload/6a2f2f5a9819-20260522.jpg)
*らせん状の配置*


光源自体はメッシュを持たないのでそこに明かりがあるとはわかりません。そこで中心に光源があるように、玉のメッシュを配置して光源代わりにします。

そのままでは配置したメッシュを光がすり抜けてしまいます。しかし、メッシュの面(sideOrientation)を BABYLON.Mesh.BACKSIDE とすることで、裏返った状態で見せることができます。

::::details 石柱の上の玉
```js
// 内側に配置予定の光源による反射を外に見せるためにBACKSIDE
let mesh2 = BABYLON.MeshBuilder.CreateSphere("", {diameter:0.1, sideOrientation:BABYLON.Mesh.BACKSIDE});
mesh2.position.set(0, meshH_+0.05, 0);
mesh2.material = new BABYLON.StandardMaterial("mat", scene);
mesh2.material.alpha = 0.6;
mesh2.parent = mesh;
```
::::

![](https://static.zenn.studio/user-upload/799d6266f99b-20260522.jpg)
*sideOrientation:BABYLON.Mesh.FRONTSIDE(default)の様子*

![](https://static.zenn.studio/user-upload/f7555b2c7eba-20260522.jpg)
*sideOrientation:BABYLON.Mesh.BACKSIDEの様子*

### 試作２：「信号機」

信号機の青黄赤のそれぞれに光源を割り当てて、光の強度(intensity)でON/OFFを調整します。
レンダリング時のカウント値でON/OFFを切り替えることで、あたかも時間で信号が切り替わっているかのように見せています。

::::details レンダリング時の信号の切り替えの様子
```js
//レンダリング時の信号の切り替えの様子
scene.onBeforeRenderObservable.add(() => {
    ++icount;
    if (icount==cntB) {
        // 青->黄
        for (let llist of allLight) {
            llist[0].intensity = 0.1;
            llist[1].intensity = 1;
        }
    } else if (icount==cntY) {
        // 黄->赤
        for (let llist of allLight) {
            llist[1].intensity = 0.1;
            llist[2].intensity = 1;
        }
    } else if (icount==cntR) {
        // 赤->青
        for (let llist of allLight) {
            llist[2].intensity = 0.1;
            llist[0].intensity = 1;
        }
        icount = 0;
    }
});
```
::::

![](https://static.zenn.studio/user-upload/dc400c324565-20260522.gif)
*信号が切り替わる様子（2倍速）*

### 試作３：「灯篭」

前述で触れた光の強度(intensity)をランダムに変化させると、炎のゆらぎのようにみせることができます。

::::details 明かりのゆらぎ
```js
// 明かりのゆらぎ
let iloop = 0, nloop = 2;
scene.onBeforeRenderObservable.add(() => {
    if (++iloop == nloop) {
        iloop = 0;
        for (let light of allLight) {
            light.intensity = 0.8 + 0.2*Math.random();
        }
    }
});
```
::::

![](https://static.zenn.studio/user-upload/72b44fbe32cc-20260522.gif)
*灯篭のひかりが揺らぐ様子*

### 影をつくる検証

試作３の灯篭の下の部分をよく見てみると、灯篭自身の影がなく土台（基礎）の部分まで照らされているし、隣の灯篭からの明かりで影ができていないことがわかります。

ここでは「クラスター照明」での影を試してみました。

執筆時(2026/4/16, v9.2.2)の公式ドキュメントでは、「クラスター照明」と「影」に関する記述がないので未対応・未実装の可能性があるのでその確認を行いました。

まず灯篭で影ができる状況として、spotlight で影ができる様子を確認しました。

![](https://static.zenn.studio/user-upload/e659e66cea0b-20260522.jpg)
*spotlightを使った時*

光源を spotlight のまま、ClusteredLightContainer を使ってみると、影が消えてしまいました。

![](https://static.zenn.studio/user-upload/f69737bd0646-20260522.jpg)
*spotlight+ClusteredLightContainerを使った時*

一方で光源を spotlight（影のできるコード） から pointlight に変更してみたところ、こちらでも影が消えてしまいました

![](https://static.zenn.studio/user-upload/00a26b8a9aad-20260522.jpg)
*pointlightを使った時*

やはり現段階において、「クラスター照明」の影の処理は、未対応・未実装のようです。
今後に期待です。

## まとめ・雑感

クラスター照明を使ったサンプルを３つ作ってみました。
また、影についての検証も行ってみました。

生成AIに使用例となる題材を聞いてみたら的確な回答が...こちらを先に確認すればよかったかな!?

```prompt
// プロンプト
Clustered Lighting を使ったサンプルになりそうな題材は？
```

::::details ChatGPTの回答
> Clustered Lighting（クラスタード・ライティング）は「多数の動的ライトを効率よく扱う」ことに本質があります。したがって題材選びは「ライト数が多い」「空間的に分布する」「動的変化がある」の3条件を満たすと効果が明確に出ます。
> 
> 以下、用途別に“サンプルとして成立する題材”を整理します。
> 
> ---
> 
> ## 1. 視覚的インパクト重視（定番デモ系）
> 
> ### ネオン街・サイバーパンク都市
> 
> ![Image](https://images.openai.com/static-rsc-4/8NxtHrtzLw1H5-Y1qBuF-liAm1PeuilLoW7_bmjjefQ6R7oir0kjcwdmLpSWZoZ58FdFjgwOoUbDEXFJLOstgcd493NhoK6Igf5frlkhuP2M_1gqQLow5K48F5tS5J_HUz64cZaLsZek00oRSJHMePu5TITQKt1CTszCApyx04ptgR26nE6ZEM1tx9o2TmH4?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/ghybzVErpLqX36jVa17hEOUyU88EOn0gAw0fBMYmHGYNDCFxOdGYvUcspKFq0uCUtnJL7B-tK4fm4YbY_6n6vD3lVyn_DFOiTkqKfyZ87p66MxuyfpXydoxoni83pct-ZX20diNQ-hCcDbBkjhX5m7VrvAa51RPcSTTbzgd6xywQ04442CfKWiA-A7qEe8SG?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/RuDOcjMLZcD3btm_cDmqyAamvLKNt3qnA40xgNbBrs5WWdsM6dE4-DVMqpfqqtOordgC10MQkWX9xrhWrToJLFWDZkVABSBcPCaF4oY_7jCqU405XuMypxCow7_gnTHXGj3tdDpf3-PL0PTU1BmkMJZDvT7VDAmpBt-P-Pl42o3hQ2HBUmGkvPAOv44-RE9Z?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/VKhJGDAHkA7z_E_rftqfgdpiyn_Ys4diUzofPeb4RPs2CqyqUskScLgi9O-Ymizt3-4iz0NrJOf-jvr98Sac4WfodLSZN8pNiUedMG_AghKgnCE2rtynFeu629BAu5PG4ccTlhJXkwLcs9hfyBKbu2lc-ViyfS8o2AsaxUNVn4UKJNjW1FvEOg9PBcTE5jkg?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/0uxuNnUJ4eSq7Tbg_d563eddVSIwd71P-V4G_4a3js16ppTe8nCDS3AMDk0C36ixKqTw5she-col1HmjaqAJarsF3HNavoqHkNScm18NCoS8VLtqvuzEREF0Z2tO_k3zNsuuV7S5OLXNRBaI0SdyRVMjJI-FhnRTYD5Pd4xgEcFAU4obRsSImwm4MRzm4hRx?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/FD-3M_NMKr-ULqF1tVqtrsfPUzzSnwRyfJvTLhjIwrvibbJNvzZmsgaANt7K5XvMyQSLxbYpgtAp_c6QVEqSgonUq_O8BO6rSQUzeV6gdocnmEYgbPiMVjH1JcMGD7Zy-HxUSPQO-LvIXlo2blw9b4ctyvHETdbP6nksdRjPVrEeg_vsvA1TRPCG8V9Ai9rr?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/pWIEzXNlhC1ADFWGGVn_heAGPX5vxJoa22xi7spqPzlRucydUUjXLHXdfAVbp3siyyHw7UKWOlF1f-ood943x6Q9HJ46QGRwFLjunyNhq_bCBY5gvgt22WRLfjhtkIs_tV_2tgZ3Qk_rD9kNHaqJMqFWYD6NSXv_tceHQDbM5_L3R3JYS2l-KT1JjLM_xMmB?purpose=fullsize)
> 
> * 数百～数千のポイントライト（看板・窓・街灯）
> * 反射・霧（フォグ）と相性が良い
> * 「Clusteredでないと破綻する」典型例
> 
> 👉 技術的ポイント
> 
> * ライトの空間分布が3D的（高さ方向も重要）
> * カメラ移動時のクラスタ再構築が確認しやすい
> 
> ---
> 
> ### 洞窟＋松明 / クリスタル発光
> 
> ![Image](https://images.openai.com/static-rsc-4/Gdi8Zzc_LxnjgegxhzL5GwzWxL3T2SJQXqb1X2HjzNuXOVtL5UpstUxOi3QlQ_1JW_Fdolwt3DDgNAfao8lQGIjNDePJL17ilWpPDDdtQVb_IsmFP-ElVzil-afmygEvAy394XsdGh4Nyi0_ztu8lf2PhzxTQlpMUvCiawsoSpBhuq28wN1lT8N5oWfN_7D9?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/vUGICz7VPdhNXwMeMmoSLdkeYn8S7eP1iOEo8yOe33mMDSYcFEMfa_9EpfSqHcTUw4rxwnJ5cm36OBFyKUFf7_TDomwOB_FtfwZZPsAMlO2OaJrFs8FdGYwwaqDNC9BBUpU2bPX8InYTdvnaRrTN3s6yP56gD5JraUSZ92VnHhM7_QCyGCLKNx5wqIcaN_8Y?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/kltxnkvRMKliwdINoJ_smYEyvtTj9gqj-eskIp4pCDI2VKdkpoZQCeaHPFUvjWh-EAVfA3jEdQuKZMWx1JolrBXHIiC5zIBqfEQJIwkMvVF-rj84Z4nWFAxYplkOgh5T44qk4a1a6fv3yI0bqL26ElVYNReuGtjJBeUZH_Ul3xr6KdDxgULHK5WENs5X12ZE?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/D85D6rLOHxCe623O2qvmmy7ypKQSgkcBq-ds_g05vkKfCoAtxRIfL9cek75aCkaJ-F7Dci5IghuwOOQ25cj3sx6E6ubxzU21xgAuaA3GxVjcjNsQf4hpEEDTSOBMchBZO69hWTemNnSmMKEudkWmipT1q4IRsyI1s0qQQ3_Kyy5wsy4wx064WB2vPu7c5Mml?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/ynnMSA37-1R4wlGdf7QoepNP2a-62HMONt9dZe4b7QRmJf3xpMqgMUEPIn_AKgNydZ4pbMsLzYln-lY2de63Ji3XaaSEeuMEIdXXcfABaxHm68OJiH4jMRqR_etF-LvRU22vkprSLPLdZxngRV0Z6skpvaHV08CD6NvdIdOBu8VHhOXkS5hfZe4UokIu92CS?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/ovYsDFbLF7SgBvMjVxk7F6zcgjVMVtp3STqKVVILhoQR4cEfIfAkXwJsqaLN7ZkUoE_n5gKsmY97WC4ke0UmXUDlVpNE7KoZ6_EVotemPWFLnNdxMcUckM-PMd2juVMz85gpy8Wpt4bUDF1jllKQcnyYvuyCQIKDZ6Fnyi1nh54WMLAb93jZaFYil6L1Tq43?purpose=fullsize)
> 
> * 局所的に密集するライト
> * シャドウあり・なしの比較がしやすい
> * フォールオフの違いが視覚化しやすい
> 
> 👉 技術的ポイント
> 
> * クラスタ内ライト数の偏り（ホットスポット）
> * タイルベースとの比較にも使える
> 
> ---
> 
> ## 2. 技術検証・ベンチマーク系
> 
> ### ランダム移動する多数の球＋ライト
> 
> ![Image](https://images.openai.com/static-rsc-4/y2ZGH7H60lWY2GjRjvdBojQ5cBOsXAhAmuAsZ9qQCqxa0ESKJ09MocOIshg_uy7NLNU_ZxJC5CvxRr39eSOP3bqHsKuoWgC51R5z5Borfs_8AvhytrLjV_3bk2xNW5hY68iCLgPkuNqpigMmvOZR9aZzHBaC3rwYnWLW8kIENYXmsctVUB3v2Mr7UVOwWsFw?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/Co9C_6oUoPdl7w0SlMufvHE1tRBmsHhm3VBtTWSMNb2JM1scbri2Cb0Cyt-c_tGJDv6vRIzXcbr_wm1ZqeoosZk52b8-UC-Z0roDAXNAxFa7zvUoaRIXjztbvIihnL_rCFqAI-PBenEKCI26Rxynf91enJuztnhkk8uJTZSg_B7_GdGLKOtPosFxFV8obSY8?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/ZJcxoRpxKcRQp0u72L2IKv3TnMup1UvZtD6hrGqIS3n_I6qIHZRIexvj3KflCkB5yLKYFzzGwbARTk8Z3OPvzTfGe6ZoPsNoCY8TMEAUtfSsiGZKH6Sdlsyktp6wE244Ce0JvJLJTYO0zBQhta80ZnnlndKFp2Ks67dDGxvD-1GD5DZrLem5-nMyGmf-2FrV?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/_PgmPfcV4MzZ8kfHq1zEfX60jwUu0L_tXk8gyOO12Bf2N18kB18AzRcEvNgG21YsFjQ8HB28e9K0OJ_Zjbe4o5VbgC_uwy-rO0rNG9v9KMWbetTy9EkSLQynsMy5hRnnX-JrHHG1yE8nH5sN4B9so9iim8KhNVvkqVQeqx878lSQyb9tMeTFOeKniHKC3YFE?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/0p0LVUt9h-Fc8Y5X_CpDkd6-CpBnoigOCfberw_JLuiJLDZic6iTWEO3Ttg9z5AriH1tQ2HMI68z2AXOHJ-DYpk-33HBdBFZNVzFSYHx3EwCC_nDRmyY261YrVDS2vDDEKecu4AulDffJZZhFNd7v_AVMIPdVZPTOXgDRwR2hff5jyRy6yEbYxk46SnwWgc5?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/gV0HXvMjt3021Gv8J68YLnSdFXNccD8s0kC1eHHkBnURNf97L1RDYg3fjG6pPTqrBTK2Uvz8DQz9uufJqbJkbyP0I6FvvDxk-yEa2im9eAKhGh4bO_nkkcBqD292AwA8Z1Ie1QpvH_A8Zik8XiF3QaKL_inMaGog6SIGe0rMGiIgTvqDAr-y1-N3CcNjI6rG?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/aFGLgSBf6aw5dD6q1M7Wet9DvLc_JjW9vfskHFmTGSjn3LUZhWH1VmhYBhQvY9wzOkhySBABfHOipeXiYznavAfBWprBoRILgN_bg9wwU62UTcPYDN_mP4JRn8jkJ8-bVfuWg2_UXKv_-yQSngHt0PqkoGxzLKsYeW-ehFwvQ-ACn1YHDMXnkD1kZEfKlBHL?purpose=fullsize)
> 
> * 各オブジェクトにライトを持たせる（例：500～2000）
> * 動的更新で負荷を可視化
> 
> 👉 技術的ポイント
> 
> * CPU/GPU負荷比較（Forward vs Deferred vs Clustered）
> * フレーム時間の安定性検証
> 
> ---
> 
> ### パーティクル＋ライト（火花・爆発）
> 
> ![Image](https://images.openai.com/static-rsc-4/Udq0aJXaiJ3pMgDBOozqIy9eklaiAEuK_iQY8-LIMPAufU0BwJpUu17Xm8zJoT1iOaKAHgm1uAIeAeofWS8sZocmKsd-XRA-ZKvnxmHN_nXViSwjpmcO-3ltECMpSq-cdt-_-h3ZdwYoKBIT_IDXoGWqzD1q_YL7I3ZfzWQs2QYUTLPSKlop5EeWDDtaK5e8?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/0wj17u5qPpqWfTSjHFnPtTgX-Y1PXc5OysKqAYbp0ygLRSgkSjgYqc2cPECsgcThS8DyET2zhY5XUoLVt-JHPhvMiojtHwJYruQS6fhCJ1qzLN8yAsC1DDRiqxwTfquFkSmgQCUM_atEB4E1ABSqexAXAx9IKAZbUxZPaAXiPALQK6ojqYLBZGLFtbmGx3qC?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/vyVmNIfX2P5vXMCbEmzIEXhBtaGLW9mVDkfTCrzh-qZhLO2BD8A46pA6aYZ7FD0r0F39H4pLW02gufFqawVZGM_rpdF3VMrDQf8-DwB3RofQOC9QZRSbSMCKMoqx_wbRDlODP6k9hktCYorchGsvlIa90n3ihL9C03HVCgQMXpjabzcW9lw20TqMB4KTqj40?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/v6xhd1GKbJ8-Vj7CCwKuHevq-OqTr9ldQGifyn4TznuSbVsmMm_wxl8mIzVrrnQJP1vlFckol7nu191jKSokzs_1lZISiIVLy12UNVIoqVam3LKh7TFHm0os-g3kLPIEJuQ1aSUgViuSTDNLEgr7oBQ0W_ESk-R_TIlXDWc7mT2axq0aQAXfFsd7_ZNxwzY8?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/vWud4EIyNjt4Wt1ZQt-uvb6ObZZbEW2_8mxVh6IZiUh9ncKXWi9l-6cuFEKrbQeruyTW2SCujLScsgdAXsBU6wYvrFFXykSYOgpHU-sw9S5vb95x9L8bgCyU7ESHZYUg1h5zcz8GMYDBxlM9FORgHai9hb8a9t22BKDFWp-Bbd-SK1usdOB6MdCrHrNFqMy_?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/aHyENv-EiSgjNAJEa9fiOstXhwSXScwgRNDByM_5CibpYZNioYwLZwbImateTfNWn8_iwTzB3uXVrxH_uxlmiY5vFQMFhq3no-FyoM2WU0AK2G_EuWk6mLnHniiXc3vw5D-OaHCHOKbyBKcdtaUq8LeHRaFG4DVkKCo6FtJlGc6F_-z0UsX_8dJ_ZnyzLu5u?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/u2fbvJlaxzkLRnsuENVGr1LPU5rBxCDbu3Lad3c60tWJ_tllvQrICsW5ovTms0Kj4sU04PnS4DkaqbJQCAiNPvF9dnhmd-btWa7AYxMoP0-e51AkGs3DZZmwCdnJhZBuxGyqYOwCP0klTABMOXl0G6RQSIeV3kK0ZcJhZZfwt39v1oh0DyPnR3s5Tr1j9ZHW?purpose=fullsize)
> 
> * 各パーティクルが短寿命ライト
> * 一時的にライト数が急増
> 
> 👉 技術的ポイント
> 
> * ライトの生成/破棄コスト
> * クラスタ更新のスパイク耐性
> 
> ---
> 
> ## 3. 実用寄り（ゲーム・インタラクション）
> 
> ### FPS / TPS の銃撃＋マズルフラッシュ
> 
> ![Image](https://images.openai.com/static-rsc-4/etjt4Q0QSkBr-IDUaipD-HqbyAnSb8bK4G34YDkZFaUri52iK5c0elkivqOf7X4mFAx7AAoG5anKq6tnCLlTF_gGZ8n4J0-pePfR4qx2iIJTFZks3J8ESSKb38sPo7bmnSLkBMHYotkcVFvwmiV_mfvtyPJ9uV1wV3UAI2-xjrHkv7zzkN_Ulw41wnfwCU5B?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/du42ReCvuM7UfMpL2GHuA7QPeRu8BMm2VXS8nr1irfa66W4rQ2isGzpvKVI4ERr-_vNYTBXVPKHvNMQOvHGuVce3Cf2pe8zDnV42L1lriYrPTc422xjAWue9_VQDOx9B8oq9Gr5LyrOYnpccgiG7e_eGrL5LPYXZUHO_2cdR30e0e4gDnd8qYgoO2Er8s10r?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/NaOEaq3Gqsjc7u78d0uIHOwJDzbMswgEGrMHek9Fll0XZ5c5_WO3JgSLDq1BEzb9isaJZAXn4kVmhQeiAJ5Rt7Fys5mHfZ7Jb8sXwEurISRhjlq8oXmjbr9hjjMKun4Gvdh59_luIOx1lo_8GkBpy1VapNF0kdB_nu_eJxMSCkg5x_3PqbjgCiXe4A0tllEm?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/lER0n7QOmpyYR4hisNLpt3DodEgLVNkDHbe9g1uzudhisaRgNjRTBwWHF6OfkvQa-aartlrJ42rhR61u12U3tPxgOVYjgeJrp2m4NHSZnRaFysRy5owoVlJ7GuaRTzBTUZ7R9SFiOnTP5w0rK2zZQzRkyxT3H6VQEHEwP5EdW0JqOaGmTF1ED7kUBqrgPXRQ?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/XVRz9CBgTfyiv02yz88oWsbVICXKzxipgXoV1M9pV9LnWjDTcp5zIUcU4EMK4y4rC_TxbcItD8tSiIl7fh3yuFcaJoJURObmpFTCYXhb4bquy-erZF-49LHAFmd5JHHsrbKzRDxlbUKy7V07rYcIkkAq4bR43RVJ7lY6QZii8expIBArlfD2GuciraB0NQuZ?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/YCMYtvGPjGSD60Qp7NZ5MgmH-mDP-FT51l_CNIYLGQsyndSbJNbTaH1T8o5QBHtJYntpsnAOlL31-GPcAxyCze7ZKa4fNsELV9_nTod_efmqqx-ozZkP3cxdG7Czd_98Mlm99Rie2DBGIcic-RloyZf8O0efwx7U8WQBfld7wZnRLA4WUSug9O1Elrl7_VyK?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/GEashNEgyJMKSRuo7kfrj6enyjttVvGtJ4XYTmdv36L6WuuufBaTfbrUof1RIshRNhMMJUeWvNoxe8ofp51JvgTviRR1Nz_QXyOK3GYfUecQ90L6vyNEmzKTrhm0jvPVnE3OYiZ0YBgLpUEpC_CFpKGp1wziSAnoRofO4yH5iiH12CvUPkvthAm2p50FX9QH?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/72lr3TY8oum2ftAmJlGGNc6bNtT6cB7NtU6P8kJSwWyIrJj0CR7yVvIG7lScDdxzn8UjZYUHt2AF2SXD_c77TcPrY9-u-02WsWehJTdXUghMbe7oAT51sT4pDQcrP_TPV0Qg1d0oc7LY9qeoBsEZaIzNuZH9zhQQyK5rGqyzo7BxdYkuvigYnZ0W_FQe7rbi?purpose=fullsize)
> 
> * 短時間・高輝度ライト
> * 敵や環境に対する影響が重要
> 
> 👉 技術的ポイント
> 
> * フレーム単位のライト追加・削除
> * 視点中心（カメラ近傍クラスタ）の挙動
> 
> ---
> 
> ### 車のヘッドライト＋都市交通
> 
> ![Image](https://images.openai.com/static-rsc-4/zXJJ5GBhKSWACOkClvkoXZSzRRcDuh6FC8bYPsIWPsvXuP-9HsKl2S9PbKSBQny5oXxtxF3MKVgx5VAxvyD3y72cnPcDck_3gYfMUQuTKKIUw1fgBfd9_Apufe6r0idlgxOY0BvpGfrerZNUqudPnC5LOOzvX_iijDOTHMuZrSc2iT7l8YQWNYNGND_mhXwH?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/lamh9aaRyKyXFkEcZacLaE68jI7CVISZTE9-n6YODX7VTUykW_V8Vo4ucVg5mIO0mkBK8koIYDBrtlF0ZLUu8VluS_V_DASD7rqkYmIsraYsvQmotmcvYLeNyPxoya5DJW_4mHimz8rEUV3YMQQu1PNOxyTq1KOENaV_YZdUYjUhnxA8Mg8f_lv4hQBUufkq?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/YKpsCeqWKo_3AxCazKSbx6bPIAIdj6tUfRSrcHOtPB8stQoFf7_ZtQNHEYheqWHYBcPa6PLrHAL57THabMdp6ZQRUM0YXVZxtgQ2_BIIpjQafi8AHEnHT_CMVu-L4J-XkiHK2sTiVEX4u2iZcV5guG6pNue6Wo-kAubblZ-r0jcFtxXmbPwY9QXhNB1ECCja?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/Oyb8JciQYW5NpM6OgJVEYquCM37z7-loJsZXZQTRwXdwqV87DAEORI3JYXwEXsDFntv5A1a8rYtgmKwjMlBNo5lwzSrsJNYaMIWb8d31FxeuC_MP4wEa5ncCg2OFm_fj0OptoS9RTWGFE6l07uKKWj9O5_RDhZbn7dA-gC33eqdbH-_8h3KKl9q21p93F_9H?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/AE-pUdraA-ld976oF_fsN5-FwD1WcuaeggxVEM5PkArCKb7f-h1jSFCwDY3AgjUjcj8g7lsJNj4pAYqWNQ1xNiWZMapEupnDEqpdnGdEAfvRk8Z7BbL4M0jK6mN8pincGcH0bRFeQ9o0lnnaTMWhuXFAiYniVTXg_PCdZi0Z0aR2NAMA5-4MX3Vu7trFtylh?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/9_XQT_-66HN_y8sf5UeLNzZBaX5vf8S1vrMMGfyEibnizcM13hsuRDtOrAKjMNpuvkCyvvIpM3JfxdvcpwQdvvh5BkBJ24TEt0QoEiPOE9gttsMSTzwcYNoG_qApiKfu5ULPntZPn-UWUro5JqwhDGMI92shmD7qK7BH9l-tmo2QkBmaCqz2JHp0MxdQAZF8?purpose=fullsize)
> 
> ![Image](https://images.openai.com/static-rsc-4/IO8QEixzKvl0-YcKu2HPU-aW1r5Fwi119D4cuH-1j1g2B67sbOqycKikaEjUbl1M2Ec0g6ohdVNZxzsJFnI5pmMId7DPMHQq16wICY6dINhYFjYBr2sCeVztz5kVc70bqpQcTIJvwF_EvPeEVT-nL-QArXJKB8vUl7yVIVZ7VfaQnsVp4tCYPpy0EngiHRTu?purpose=fullsize)
> 
> * 移動するスポットライトが大量に存在
> * 方向性ライト（スポット）のテストに最適
> 
> 👉 技術的ポイント
> 
> * スポットライトのクラスタ分類
> * カメラ距離によるライト選別
> 
> ---
> 
> ## 4. アルゴリズム理解向け（可視化系）
> 
> ### クラスタ分割の可視化デモ
> 
> （※これは画像なしでもよいが重要）
> 
> * 画面をグリッド（+Z分割）で色分け
> * 各クラスタに含まれるライト数を表示
> 
> 👉 技術的ポイント
> 
> * Clustered Lightingの本質理解
> * デバッグ用途として非常に有効
> 
> ---
> 
> ## まとめ（選定指針）
> 
> 題材選びは次の軸で決めると外しません：
> 
> * **ライト数が多いか（100以上が目安）**
> * **空間的に偏りがあるか**
> * **動的に変化するか**
> * **視覚的に違いが分かるか**
> 
> ---
> 
> もしBabylon.js前提なら、
> 
> * 「Forward+（疑似Clustered）」寄りの実装
> * Compute Shaderベースのクラスタ生成
> 
> のどちらを狙うかで最適な題材も変わります。
> 
> 必要なら「Babylon.jsで実装しやすい題材」と「具体コード構成（クラス設計）」まで踏み込みます。
::::


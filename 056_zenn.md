# TypeScript で迷路モジュール

## この記事のスナップショット

![](https://storage.googleapis.com/zenn-user-upload/ffef8fd96f95-20250328.jpg)

ソース

https://github.com/fnamuoo/webgl/blob/main/056

## 概要

TypeScript のテスト環境を整備。
以前JavaScriptで書いた迷路モジュールをTypeScriptで書き直しました。

環境構築、インフラ回りの話は陳腐化しやすいのでご注意。
閲覧時に時間がたっていたら、複数の情報／裏付けで確認を。

迷路モジュールの中身については触れません。気になる方はこちらから。

https://zenn.dev/fnamuoo/articles/ebd8f752af9b11
https://zenn.dev/fnamuoo/articles/d7be7200b644cd

## やったこと

TypeScriptの勉強がてら、テスト環境(jest)を使って、JavaScriptからTypeScriptへ移植を行いました。ユースケースとして以前作成した迷路モジュールを対象とします。テストではカバレッジ100%を目指します。

### クイックスタート

```
# ソース(git)から jest.config.ts, package.json をコピー
npm install
npm test
```

### はじめに

npm で環境構築します。

- nodejs がインストール済み

  ```sh
  # 当方の利用環境(Windwos)
  node -v
  v22.14.0
  npm -v
  10.9.2
  ```
- エディタは VSCode

### 環境構築

下記に最初からの手順を示しますが、手っ取り早く始めたい方はソース(git)から jest.config.ts, package.json をコピーして下記コマンド

```sh
npm install
```

で準備できます。
1から環境を整えるなら、適当なフォルダで下記を実施。

```sh
npm install --save-dev @types/jest jest ts-jest typescript ts-node
npm init jest@latest
```

`init jest` の応答には下記の感じで。

```sh
PS>npm init jest@latest
The following questions will help Jest to create a suitable configuration for your project

√ Would you like to use Jest when running "test" script in "package.json"? ... yes
  <<<  ■(default)
√ Would you like to use Typescript for the configuration file? ... yes
  <<<  ■[Yes]
√ Choose the test environment that will be used for testing » node
  <<<  ■(default)
√ Do you want Jest to add coverage reports? ... yes
  <<<  ■[Yes]
√ Which provider should be used to instrument code for coverage? » v8
  <<<  ■(default)
√ Automatically clear mock calls, instances, contexts and results before every test? ... yes
  <<<  ■[Yes] 
```

あとは .ts を配置して、テストファイルを作成。テスト実施は `npm test` で

```sh
npm test
```

レポート結果がコンソールに表示。もしくは html に出力。

```sh
test/coverage/lcov-report/index.html
```

### 迷路モジュールの TypeScript化

ファイル構成は次のように。

```sh
maze/src/*.ts   .. ソース
     test/*.ts  .. 単体テスト、結合テスト
node_modules/
jest.config.ts
package.json
```

TypeScript化は次のような手順で行いました。

- ファイルの拡張子を .js -> .ts
- リファクタ
  - console.log を消す
  - use strict 文を消す(自動で組み込まれるので不要)
  - 単体で動くように／他のモジュール・ライブラリとの依存を減らす／なくす

- (繰り返し)
  - 「型」をつける
    - まずは public な関数を優先して
    - 余力があればすべての関数に
    - メンバ変数にも
  - tsc src/～.ts でコンパイル。error を修正。最終的に～.js は消しておく

- (繰り返し)
  - VSCode の eslint のメッセージにわかる範囲で対応
    - 配列は型宣言しておく
    - `{データ型} | undefined の恐れがある` には `as {データ型}`で対応

- (繰り返し)
  - テストファイルを作成して、テスト(npm test)しながら、90%以上を目指す
    - 単体テストは ～.spec.ts、結合テストは ～.test.ts に
    - テストの内容について、可能なら
      - アルゴリズムの挙動すべてを確認するようにデータ／パラ調整
      - 処理ブロック(if文の分岐)を通過するようにデータ／パラ調整
      - 最初は関数を呼び出すだけのテストでも。
        可能なら結果の判定／正常動作を確認できる判定を導入。
    - 他には
        - コーディング規約に従った命名の修正
        - コメント文の削除

コードカバレッジ 100% になるとこんな感じ。
テストケースが乱数頼みなところがあって 100% にならないときもあります。
（本来なら、乱数に依存しないテストケースを用意すべきなんですけど..）

![](https://storage.googleapis.com/zenn-user-upload/ffef8fd96f95-20250328.jpg)

## まとめ・雑感

本末転倒な気がしつつもコードカバレッジを100%にするために機能を削りました。
移植時にケアレスミスを見つけることもでき、モジュールの頑健性があがったかな？
テストが適当すぎて「これでいいの？！」な感じですが、ご容赦。

迷路モジュール自体のバージョンアップはありません。
ちょっと申し訳ないので代わりに2024年度のマイクロマウスのファイナル／セミファイナルのコースを Maze2data に追加してます。

ぶっちゃけ babylonjs に向けた布石でした。

### 参考資料

https://zenn.dev/aew2sbee/articles/typescript-jest-coverage

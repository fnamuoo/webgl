// 'use strict';

/* ============================================================
   3次元格子上の「分岐なし・再訪禁止の最長経路」探索アルゴリズム
   ============================================================
   問題の性質:
     - これは本質的に「最長路問題(Longest Path Problem)」であり、
       格子グラフ上のハミルトン路探索に相当する。
     - 一般にNP困難なため、任意の格子サイズで厳密最適解を
       多項式時間で求めるアルゴリズムは存在しない。
     - そのため、以下の2種類を用意する。

       A) findLongestPathBacktracking
          制限時間付きバックトラッキング（Warnsdorffの規則で枝刈り）
          -> 小～中規模の格子向け。時間内なら最適に近い解、
             場合によっては完全なハミルトン路を発見できる。

       B) findLongestPathHeuristic
          貪欲法 + 経路回転法(Pósaのローテーション)による延長
          -> 大規模格子向け。高速に「そこそこ長い」経路を求める。
   ============================================================ */

// ---------------- 格子の表現 ----------------

function key(p) {
  return p[0] + ',' + p[1] + ',' + p[2];
}

// 6方向(前後・上下・左右)のみに隣接を限定する
const DIRECTIONS = [
  [1, 0, 0], [-1, 0, 0],   // 左右
  [0, 1, 0], [0, -1, 0],   // 前後
  [0, 0, 1], [0, 0, -1],   // 上下
];

/**
 * 有限領域内の格子点集合を作成する。
 * isValid(x,y,z) を渡せば、直方体以外の任意形状の領域も指定できる
 * (例: 球状領域、中身の抜けた形状など)。
 */
export function makeGrid(bounds, isValid = () => true) {
  const { minX, maxX, minY, maxY, minZ, maxZ } = bounds;
  const set = new Set();
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        if (isValid(x, y, z)) set.add(key([x, y, z]));
      }
    }
  }
  return set;
}

// 格子内かつ未訪問の隣接点だけを返す
export function neighbors(grid, visited, p) {
  const result = [];
  for (const [dx, dy, dz] of DIRECTIONS) {
    const np = [p[0] + dx, p[1] + dy, p[2] + dz];
    const k = key(np);
    if (grid.has(k) && !visited.has(k)) result.push(np);
  }
  return result;
}

// ---------------- アルゴリズム A: 制限時間付きバックトラッキング ----------------

/**
 * Warnsdorffの規則（次に進んだ先の選択肢が少ない点を優先）で
 * 探索順を並べ替えながらバックトラッキングし、
 * 見つかった中で最長の経路を返す。
 *
 * @param grid        makeGrid() で作った格子点集合
 * @param start       開始点 [x,y,z]
 * @param timeLimitMs 探索の制限時間(ms)
 */
export function findLongestPathBacktracking(grid, start, timeLimitMs = 5000) {
  const startKey = key(start);
  if (!grid.has(startKey)) throw new Error('start point is not in grid');

  const deadline = Date.now() + timeLimitMs;
  const visited = new Set([startKey]);
  const path = [start];
  let best = [start];
  let timedOut = false;

  function dfs() {
    if (timedOut) return;
    if (Date.now() > deadline) { timedOut = true; return; }
    if (path.length > best.length) best = path.slice();
    if (best.length === grid.size) return; // 全点走破(ハミルトン路完成)

    let cands = neighbors(grid, visited, path[path.length - 1]);
    if (cands.length === 0) return;

    // Warnsdorffの規則: 次の点から辿れる未訪問点が少ない順に試す
    // (行き止まりになりやすい枝を先に消費し、袋小路での早期失敗を防ぐ)
    cands = cands
      .map((p) => [p, neighbors(grid, visited, p).length])
      .sort((a, b) => a[1] - b[1])
      .map((e) => e[0]);

    for (const c of cands) {
      if (timedOut || best.length === grid.size) return;
      const k = key(c);
      visited.add(k);
      path.push(c);
      dfs();
      path.pop();
      visited.delete(k);
    }
  }

  dfs();
  return {
    path: best,
    length: best.length,
    complete: best.length === grid.size,
    timedOut,
  };
}

// ---------------- アルゴリズム B: 貪欲法 + 回転法による延長 ----------------

function isAdjacent(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) === 1;
}

// Warnsdorffの規則で行き詰まるまで貪欲に経路を延長する
function greedyExtend(grid, path, visited) {
  for (;;) {
    const cur = path[path.length - 1];
    let cands = neighbors(grid, visited, cur);
    if (cands.length === 0) return;

    cands = cands.map((p) => [p, neighbors(grid, visited, p).length]);
    const minDeg = Math.min(...cands.map((c) => c[1]));
    const tied = cands.filter((c) => c[1] === minDeg).map((c) => c[0]);
    const choice = tied[Math.floor(Math.random() * tied.length)];

    visited.add(key(choice));
    path.push(choice);
  }
}

// 行き詰まった経路をPósa風の「回転」で延長できないか試す。
// 終点 end が経路の途中の点 path[i] と隣接していれば、
// path[i+1..end] を反転させることで、別の点を新しい終点にできる。
// (訪問済み集合は変わらず、経路のつなぎ替えだけを行う)
function rotateOnce(path) {
  const end = path[path.length - 1];
  const candidateIndices = [];
  for (let i = 0; i < path.length - 2; i++) {
    if (isAdjacent(path[i], end)) candidateIndices.push(i);
  }
  if (candidateIndices.length === 0) return false;

  const i = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
  const head = path.slice(0, i + 1);
  const tail = path.slice(i + 1).reverse();
  const rotated = head.concat(tail);
  path.length = 0;
  path.push(...rotated);
  return true;
}

/**
 * 貪欲法(Warnsdorffの規則) + 回転法による延長を複数回試行し、
 * その中で最長の経路を返す。大規模な格子でも高速に動作する。
 *
 * @param grid             makeGrid() で作った格子点集合
 * @param start            開始点 [x,y,z]
 * @param restarts         試行(リスタート)回数
 * @param rotationAttempts 1試行あたりの回転法の最大試行回数
 */
export function findLongestPathHeuristic(grid, start, restarts = 30, rotationAttempts = 300) {
  const startKey = key(start);
  if (!grid.has(startKey)) throw new Error('start point is not in grid');

  let best = [start];

  for (let r = 0; r < restarts; r++) {
    const visited = new Set([startKey]);
    const path = [start];
    greedyExtend(grid, path, visited);

    for (let a = 0; a < rotationAttempts && path.length < grid.size; a++) {
      if (!rotateOnce(path)) break;
      greedyExtend(grid, path, visited);
    }

    if (path.length > best.length) best = path.slice();
    if (best.length === grid.size) break; // ハミルトン路完成
  }

  return { path: best, length: best.length, complete: best.length === grid.size };
}

// ---------------- 検証用ユーティリティ ----------------

// 経路が制約(格子内・隣接接続のみ・重複なし)を満たしているか確認する
export function validatePath(grid, path) {
  const seen = new Set();
  for (let i = 0; i < path.length; i++) {
    const k = key(path[i]);
    if (!grid.has(k)) return { ok: false, reason: `格子外の点: ${k}` };
    if (seen.has(k)) return { ok: false, reason: `点の重複: ${k}` };
    seen.add(k);
    if (i > 0 && !isAdjacent(path[i - 1], path[i])) {
      return { ok: false, reason: `非隣接な接続: ${key(path[i-1])} -> ${k}` };
    }
  }
  return { ok: true };
}

// module.exports = {
//   makeGrid,
//   neighbors,
//   findLongestPathBacktracking,
//   findLongestPathHeuristic,
//   validatePath,
// };

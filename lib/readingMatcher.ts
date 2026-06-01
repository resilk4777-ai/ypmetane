/**
 * 音読判定ロジック
 * ひらがな・カタカナの差異、句読点・記号・空白を吸収してゆるく判定する
 */

// カタカナ→ひらがな変換
function toHiragana(str: string): string {
  return str.replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// 正規化: ひらがな統一、句読点・記号・空白除去
export function normalize(text: string): string {
  return toHiragana(text)
    .replace(/[、。！？!?「」『』【】（）\(\)\[\]・…‥〜～\s]/g, '')
    .toLowerCase();
}

// 2文字列の一致率 (0〜1)
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  // 短い方が長い方に含まれる場合
  if (b.includes(a) || a.includes(b)) return 0.9;

  // 編集距離ベースの類似度
  const maxLen = Math.max(a.length, b.length);
  const dist = editDistance(a, b);
  return 1 - dist / maxLen;
}

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export const MATCH_THRESHOLD = 0.7;

/**
 * segmentText（フレーズ）が spokenText に含まれているか判定する
 */
export function isSegmentMatched(segmentText: string, spokenText: string): boolean {
  const seg = normalize(segmentText);
  const spoken = normalize(spokenText);

  if (seg.length === 0) return true;
  if (spoken.length === 0) return false;

  // 完全一致
  if (spoken.includes(seg)) return true;

  // 部分マッチ (ウィンドウスライド)
  const winLen = seg.length;
  for (let i = 0; i <= spoken.length - Math.max(1, winLen - 2); i++) {
    const window = spoken.slice(i, i + winLen + 2);
    if (similarity(seg, window.slice(0, winLen)) >= MATCH_THRESHOLD) return true;
    if (winLen > 2 && similarity(seg, window) >= MATCH_THRESHOLD) return true;
  }

  // 短いセグメントは全体との類似度で判定
  if (seg.length <= 4) {
    return similarity(seg, spoken) >= MATCH_THRESHOLD;
  }

  return false;
}

/**
 * 本文をフレーズ単位に分割する
 * 句読点・改行・一定文字数で区切る
 */
export function splitIntoSegments(body: string): string[] {
  // 句読点・改行で分割し、空文字除去
  const raw = body
    .split(/([、。！？!?\n]+)/)
    .reduce<string[]>((acc, part) => {
      if (/^[、。！？!?\n]+$/.test(part)) {
        if (acc.length > 0) acc[acc.length - 1] += part;
      } else if (part.trim()) {
        // 長い場合はさらに分割（10文字程度）
        const chunks = splitLongPhrase(part.trim());
        acc.push(...chunks);
      }
      return acc;
    }, []);

  return raw.filter((s) => s.trim().length > 0);
}

function splitLongPhrase(text: string): string[] {
  const MAX = 12;
  if (text.length <= MAX) return [text];

  const result: string[] = [];
  let i = 0;
  while (i < text.length) {
    result.push(text.slice(i, i + MAX));
    i += MAX;
  }
  return result;
}

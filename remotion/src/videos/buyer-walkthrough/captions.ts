import type { BuyerSceneConfig, Caption } from "./types";

const MAX_CAPTION_CHARACTERS = 72;
const MAX_LINE_CHARACTERS = 34;

const nearestBreakIndex = (text: string, midpoint: number) => {
  let bestIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < text.length; index++) {
    if (text[index] !== " ") {
      continue;
    }

    const distance = Math.abs(index - midpoint);
    if (distance < bestDistance) {
      bestIndex = index;
      bestDistance = distance;
    }
  }

  return bestIndex;
};

const balanceCaptionLines = (text: string) => {
  if (text.length <= MAX_LINE_CHARACTERS) {
    return text;
  }

  const midpoint = Math.floor(text.length / 2);
  const breakIndex = nearestBreakIndex(text, midpoint);

  if (breakIndex === -1) {
    return text;
  }

  return `${text.slice(0, breakIndex).trim()}\n${text.slice(breakIndex + 1).trim()}`;
};

const splitSentence = (sentence: string) => {
  if (sentence.length <= MAX_CAPTION_CHARACTERS) {
    return [balanceCaptionLines(sentence)];
  }

  const words = sentence.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let currentChunk = "";

  words.forEach((word) => {
    const candidate = currentChunk ? `${currentChunk} ${word}` : word;

    if (candidate.length <= MAX_CAPTION_CHARACTERS) {
      currentChunk = candidate;
      return;
    }

    if (currentChunk) {
      chunks.push(balanceCaptionLines(currentChunk));
    }

    currentChunk = word;
  });

  if (currentChunk) {
    chunks.push(balanceCaptionLines(currentChunk));
  }

  return chunks;
};

export const captionPagesFromText = (text: string) => {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .flatMap((sentence) => splitSentence(sentence));
};

export const buildFallbackCaptions = (
  scene: BuyerSceneConfig,
  durationInFrames: number,
  fps: number,
): Caption[] => {
  const pages = captionPagesFromText(scene.voiceoverText);
  const totalDurationMs = Math.max((durationInFrames / fps) * 1000, pages.length * 900);
  const totalWordCount = pages.reduce((sum, page) => {
    return sum + page.replace(/\n/g, " ").split(/\s+/).filter(Boolean).length;
  }, 0);

  let currentStart = 0;

  return pages.map((page, index) => {
    const wordCount = page.replace(/\n/g, " ").split(/\s+/).filter(Boolean).length;
    const isLastPage = index === pages.length - 1;
    const proportionalDuration =
      totalWordCount === 0 ? totalDurationMs / pages.length : (wordCount / totalWordCount) * totalDurationMs;
    const durationMs = Math.max(1100, proportionalDuration);
    const endMs = isLastPage
      ? Math.round(totalDurationMs)
      : Math.round(Math.min(totalDurationMs, currentStart + durationMs));

    const caption: Caption = {
      text: page,
      startMs: Math.round(currentStart),
      endMs,
      timestampMs: Math.round(currentStart),
      confidence: null,
    };

    currentStart = endMs;
    return caption;
  });
};

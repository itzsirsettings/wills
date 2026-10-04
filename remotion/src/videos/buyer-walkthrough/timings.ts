import type { BuyerSceneConfig, SceneTiming } from "./types";

export const BUYER_WALKTHROUGH_OVERLAP_IN_FRAMES = 8;

export const getSceneTimings = (
  scenes: BuyerSceneConfig[],
  sceneDurationsInFrames: number[],
  overlapInFrames: number,
): SceneTiming[] => {
  let cursor = 0;

  return scenes.map((scene, index) => {
    const durationInFrames =
      sceneDurationsInFrames[index] ?? scene.fallbackDurationInFrames;
    const from = index === 0 ? 0 : cursor - overlapInFrames;
    const end = from + durationInFrames;

    cursor = end;

    return {
      id: scene.id,
      from,
      durationInFrames,
      end,
    };
  });
};

export const getTotalDurationInFrames = (
  sceneDurationsInFrames: number[],
  overlapInFrames: number,
) => {
  if (sceneDurationsInFrames.length === 0) {
    return 0;
  }

  return sceneDurationsInFrames.reduce((sum, duration) => sum + duration, 0) -
    overlapInFrames * (sceneDurationsInFrames.length - 1);
};

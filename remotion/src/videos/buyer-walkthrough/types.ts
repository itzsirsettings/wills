export type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
};

export type BuyerWalkthroughVisualVariant =
  | "platform-overview"
  | "landing-site"
  | "storefront"
  | "checkout"
  | "analytics"
  | "product-management";

export type BuyerSceneConfig = {
  id: string;
  headline: string;
  subcopy: string;
  voiceoverText: string;
  keyProofPoints: string[];
  visualVariant: BuyerWalkthroughVisualVariant;
  fallbackDurationInFrames: number;
};

export type BuyerWalkthroughVideoProps = {
  scenes: BuyerSceneConfig[];
  sceneDurationsInFrames: number[];
  sceneAudioFiles: Record<string, string | null>;
  sceneCaptionFiles: Record<string, string | null>;
  overlapInFrames: number;
};

export type SceneTiming = {
  id: string;
  from: number;
  durationInFrames: number;
  end: number;
};

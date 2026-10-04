import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useDelayRender,
  useCurrentFrame,
  type CalculateMetadataFunction,
} from "remotion";
import { getAudioDurationOrNull } from "./audio";
import { buildFallbackCaptions } from "./captions";
import { CaptionOverlay, SceneLayout, fontFamily, palette } from "./components";
import sceneConfigData from "./scene-config.json";
import { BUYER_WALKTHROUGH_OVERLAP_IN_FRAMES, getSceneTimings, getTotalDurationInFrames } from "./timings";
import type { BuyerSceneConfig, BuyerWalkthroughVideoProps, Caption } from "./types";
import {
  AnalyticsVisual,
  CheckoutVisual,
  LandingSiteVisual,
  PlatformOverviewVisual,
  ProductManagementVisual,
  StorefrontVisual,
} from "./visuals";
import voiceoverManifest from "./voiceover-manifest.json";

export const BUYER_WALKTHROUGH_WIDTH = 1280;
export const BUYER_WALKTHROUGH_HEIGHT = 720;
export const BUYER_WALKTHROUGH_FPS = 30;
export const BUYER_WALKTHROUGH_PLACEHOLDER_DURATION = 1620;

const buyerScenes = sceneConfigData as BuyerSceneConfig[];
const manifest = voiceoverManifest as {
  sceneDurationsInFrames: number[];
  sceneAudioFiles: Record<string, string | null>;
};

const captionFilePathForScene = (sceneId: string) => `captions/buyer-walkthrough/${sceneId}.json`;

const captionFileMap = Object.fromEntries(
  buyerScenes.map((scene) => [scene.id, captionFilePathForScene(scene.id)]),
) as Record<string, string | null>;

const fallbackCaptionMap = Object.fromEntries(
  buyerScenes.map((scene, index) => [
    scene.id,
    buildFallbackCaptions(
      scene,
      manifest.sceneDurationsInFrames[index] ?? scene.fallbackDurationInFrames,
      BUYER_WALKTHROUGH_FPS,
    ),
  ]),
) as Record<string, Caption[]>;

const eyebrowBySceneId: Record<string, string> = {
  "scene-01-platform": "Premium Platform",
  "scene-02-landing": "Trust Layer",
  "scene-03-store": "Product Discovery",
  "scene-04-checkout": "Secure Checkout",
  "scene-05-analytics": "Owner Visibility",
  "scene-06-admin-ops": "Operational Control",
};

export const BUYER_WALKTHROUGH_DEFAULT_PROPS: BuyerWalkthroughVideoProps = {
  scenes: buyerScenes,
  sceneDurationsInFrames: buyerScenes.map((scene, index) => {
    return manifest.sceneDurationsInFrames[index] ?? scene.fallbackDurationInFrames;
  }),
  sceneAudioFiles: Object.fromEntries(
    buyerScenes.map((scene) => [
      scene.id,
      manifest.sceneAudioFiles[scene.id] ?? null,
    ]),
  ) as Record<string, string | null>,
  sceneCaptionFiles: captionFileMap,
  overlapInFrames: BUYER_WALKTHROUGH_OVERLAP_IN_FRAMES,
};

const resolveSceneDurations = async (props: BuyerWalkthroughVideoProps) => {
  const resolvedDurations = [...props.sceneDurationsInFrames];

  if (typeof window === "undefined") {
    return resolvedDurations.map((duration, index) => {
      return Math.max(duration ?? 0, props.scenes[index]?.fallbackDurationInFrames ?? 0);
    });
  }

  await Promise.all(
    props.scenes.map(async (scene, index) => {
      const audioFile = props.sceneAudioFiles[scene.id];

      if (!audioFile) {
        resolvedDurations[index] = Math.max(
          resolvedDurations[index] ?? 0,
          scene.fallbackDurationInFrames,
        );
        return;
      }

      const source = new URL(staticFile(audioFile), window.location.origin).href;
      const durationInSeconds = await getAudioDurationOrNull(source);

      if (!durationInSeconds) {
        resolvedDurations[index] = Math.max(
          resolvedDurations[index] ?? 0,
          scene.fallbackDurationInFrames,
        );
        return;
      }

      resolvedDurations[index] = Math.max(
        Math.ceil(durationInSeconds * BUYER_WALKTHROUGH_FPS) + 18,
        scene.fallbackDurationInFrames,
      );
    }),
  );

  return resolvedDurations;
};

export const calculateBuyerWalkthroughMetadata: CalculateMetadataFunction<BuyerWalkthroughVideoProps> = async ({
  props,
}) => {
  const sceneDurationsInFrames = await resolveSceneDurations(props);

  return {
    durationInFrames: getTotalDurationInFrames(
      sceneDurationsInFrames,
      props.overlapInFrames,
    ),
    props: {
      ...props,
      sceneDurationsInFrames,
    },
  };
};

const renderSceneVisual = (scene: BuyerSceneConfig) => {
  switch (scene.visualVariant) {
    case "platform-overview":
      return <PlatformOverviewVisual />;
    case "landing-site":
      return <LandingSiteVisual />;
    case "storefront":
      return <StorefrontVisual />;
    case "checkout":
      return <CheckoutVisual />;
    case "analytics":
      return <AnalyticsVisual />;
    case "product-management":
      return <ProductManagementVisual />;
    default:
      return null;
  }
};

const BuyerWalkthroughScene = ({
  scene,
  captions,
  durationInFrames,
}: {
  scene: BuyerSceneConfig;
  captions: Caption[];
  durationInFrames: number;
}) => {
  const frame = useCurrentFrame();
  const labelOpacity = Math.min(1, Math.max(0, frame / 12));
  const outroOpacity = Math.min(1, Math.max(0, (durationInFrames - frame) / 18));

  return (
    <AbsoluteFill>
      <SceneLayout
        eyebrow={eyebrowBySceneId[scene.id] ?? "Buyer Walkthrough"}
        headline={scene.headline}
        subcopy={scene.subcopy}
        proofPoints={scene.keyProofPoints}
      >
        {renderSceneVisual(scene)}
      </SceneLayout>
      <div
        style={{
          position: "absolute",
          right: 56,
          top: 48,
          padding: "10px 14px",
          borderRadius: 999,
          backgroundColor: "rgba(255, 250, 243, 0.9)",
          border: `1px solid ${palette.line}`,
          color: palette.burgundy,
          fontFamily: fontFamily.body,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          opacity: Math.min(labelOpacity, outroOpacity),
        }}
      >
        Buyer Demo
      </div>
      <CaptionOverlay captions={captions} />
    </AbsoluteFill>
  );
};

export const BuyerWalkthroughVideo = (props: BuyerWalkthroughVideoProps) => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Loading buyer walkthrough captions"));
  const [captionsByScene, setCaptionsByScene] = useState<Record<string, Caption[]>>(fallbackCaptionMap);

  useEffect(() => {
    let mounted = true;

    Promise.all(
      props.scenes.map(async (scene, index) => {
        const captionFile = props.sceneCaptionFiles[scene.id];

        if (!captionFile) {
          return [
            scene.id,
            buildFallbackCaptions(
              scene,
              props.sceneDurationsInFrames[index] ?? scene.fallbackDurationInFrames,
              BUYER_WALKTHROUGH_FPS,
            ),
          ] as const;
        }

        try {
          const response = await fetch(staticFile(captionFile));

          if (!response.ok) {
            throw new Error(`Failed to load captions for ${scene.id}`);
          }

          const captions = (await response.json()) as Caption[];
          return [scene.id, captions] as const;
        } catch {
          return [
            scene.id,
            buildFallbackCaptions(
              scene,
              props.sceneDurationsInFrames[index] ?? scene.fallbackDurationInFrames,
              BUYER_WALKTHROUGH_FPS,
            ),
          ] as const;
        }
      }),
    )
      .then((entries) => {
        if (!mounted) {
          return;
        }

        setCaptionsByScene(Object.fromEntries(entries));
        continueRender(handle);
      })
      .catch((error: unknown) => {
        if (!mounted) {
          return;
        }

        cancelRender(error instanceof Error ? error : new Error("Failed to load captions"));
      });

    return () => {
      mounted = false;
    };
  }, [
    cancelRender,
    continueRender,
    handle,
    props.sceneCaptionFiles,
    props.sceneDurationsInFrames,
    props.scenes,
  ]);

  const timings = getSceneTimings(
    props.scenes,
    props.sceneDurationsInFrames,
    props.overlapInFrames,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: palette.shell }}>
      {timings.map((timing, index) => {
        const scene = props.scenes[index];
        const captions = captionsByScene[scene.id] ?? fallbackCaptionMap[scene.id];

        return (
          <Sequence
            key={scene.id}
            from={timing.from}
            durationInFrames={timing.durationInFrames}
            premountFor={BUYER_WALKTHROUGH_FPS}
          >
            <BuyerWalkthroughScene
              scene={scene}
              captions={captions}
              durationInFrames={timing.durationInFrames}
            />
          </Sequence>
        );
      })}
      {timings.map((timing, index) => {
        const scene = props.scenes[index];
        const audioFile = props.sceneAudioFiles[scene.id];

        if (!audioFile) {
          return null;
        }

        return (
          <Sequence
            key={`${scene.id}-audio`}
            from={timing.from}
            durationInFrames={timing.durationInFrames}
            premountFor={BUYER_WALKTHROUGH_FPS}
          >
            <Audio src={staticFile(audioFile)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

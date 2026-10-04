import { Composition, Folder } from "remotion";
import {
  BuyerWalkthroughVideo,
  BUYER_WALKTHROUGH_DEFAULT_PROPS,
  BUYER_WALKTHROUGH_FPS,
  BUYER_WALKTHROUGH_HEIGHT,
  BUYER_WALKTHROUGH_PLACEHOLDER_DURATION,
  BUYER_WALKTHROUGH_WIDTH,
  calculateBuyerWalkthroughMetadata,
} from "./videos/buyer-walkthrough/BuyerWalkthroughVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Marketing">
        <Composition
          id="BuyerWalkthrough"
          component={BuyerWalkthroughVideo}
          durationInFrames={BUYER_WALKTHROUGH_PLACEHOLDER_DURATION}
          fps={BUYER_WALKTHROUGH_FPS}
          width={BUYER_WALKTHROUGH_WIDTH}
          height={BUYER_WALKTHROUGH_HEIGHT}
          defaultProps={BUYER_WALKTHROUGH_DEFAULT_PROPS}
          calculateMetadata={calculateBuyerWalkthroughMetadata}
        />
      </Folder>
    </>
  );
};

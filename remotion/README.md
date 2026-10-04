# Buyer Walkthrough Video

This Remotion workspace contains the buyer-facing `BuyerWalkthrough` sales video for the app.

## Commands

Install dependencies:

```console
npm i
```

Open Remotion Studio:

```console
npm run preview:buyer-walkthrough
```

Generate captions and the voiceover manifest:

```console
npm run voiceover:buyer-walkthrough
```

If `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` are available, the script also generates scene MP3 files in `public/voiceover/buyer-walkthrough/`. Without those credentials it still refreshes caption JSON and fallback timing metadata so the composition remains renderable.

Render the final video:

```console
npm run render:buyer-walkthrough
```

## Output Structure

- `src/videos/buyer-walkthrough/`: composition code, scene config, and generated timing manifest
- `public/captions/buyer-walkthrough/`: timed caption JSON per scene
- `public/voiceover/buyer-walkthrough/`: generated MP3 voiceover files

## Environment

Optional voiceover generation variables:

```console
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id
```

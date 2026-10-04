import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_FORMATS, FilePathSource, Input, UrlSource } from "mediabunny";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const remotionDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(remotionDir, "..");

const FPS = 30;
const FRAME_PADDING = 18;
const sceneConfigPath = path.join(
  remotionDir,
  "src",
  "videos",
  "buyer-walkthrough",
  "scene-config.json",
);
const manifestPath = path.join(
  remotionDir,
  "src",
  "videos",
  "buyer-walkthrough",
  "voiceover-manifest.json",
);
const captionsDir = path.join(
  remotionDir,
  "public",
  "captions",
  "buyer-walkthrough",
);
const voiceoverDir = path.join(
  remotionDir,
  "public",
  "voiceover",
  "buyer-walkthrough",
);

const MAX_CAPTION_CHARACTERS = 72;
const MAX_LINE_CHARACTERS = 34;

const exists = async (targetPath) => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const parseEnvFile = (content) => {
  const parsed = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
};

const loadEnvironment = async () => {
  const envFiles = [
    path.join(repoRoot, ".env"),
    path.join(remotionDir, ".env"),
  ];

  const merged = { ...process.env };

  for (const envFile of envFiles) {
    if (!(await exists(envFile))) {
      continue;
    }

    const parsed = parseEnvFile(await readFile(envFile, "utf8"));

    for (const [key, value] of Object.entries(parsed)) {
      if (!merged[key]) {
        merged[key] = value;
      }
    }
  }

  return merged;
};

const nearestBreakIndex = (text, midpoint) => {
  let bestIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== " ") {
      continue;
    }

    const distance = Math.abs(index - midpoint);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return bestIndex;
};

const balanceCaptionLines = (text) => {
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

const splitSentence = (sentence) => {
  if (sentence.length <= MAX_CAPTION_CHARACTERS) {
    return [balanceCaptionLines(sentence)];
  }

  const words = sentence.split(/\s+/).filter(Boolean);
  const chunks = [];
  let currentChunk = "";

  for (const word of words) {
    const candidate = currentChunk ? `${currentChunk} ${word}` : word;

    if (candidate.length <= MAX_CAPTION_CHARACTERS) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk) {
      chunks.push(balanceCaptionLines(currentChunk));
    }

    currentChunk = word;
  }

  if (currentChunk) {
    chunks.push(balanceCaptionLines(currentChunk));
  }

  return chunks;
};

const captionPagesFromText = (text) => {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .flatMap((sentence) => splitSentence(sentence));
};

const buildCaptions = (text, durationMs) => {
  const pages = captionPagesFromText(text);
  const totalWordCount = pages.reduce((sum, page) => {
    return sum + page.replace(/\n/g, " ").split(/\s+/).filter(Boolean).length;
  }, 0);

  let currentStart = 0;

  return pages.map((page, index) => {
    const wordCount = page.replace(/\n/g, " ").split(/\s+/).filter(Boolean).length;
    const proportionalDuration =
      totalWordCount === 0
        ? durationMs / Math.max(1, pages.length)
        : (wordCount / totalWordCount) * durationMs;
    const captionDuration = Math.max(1100, proportionalDuration);
    const isLastPage = index === pages.length - 1;
    const endMs = isLastPage
      ? Math.round(durationMs)
      : Math.round(Math.min(durationMs, currentStart + captionDuration));

    const entry = {
      text: page,
      startMs: Math.round(currentStart),
      endMs,
      timestampMs: Math.round(currentStart),
      confidence: null,
    };

    currentStart = endMs;
    return entry;
  });
};

const getAudioDurationInSeconds = async (audioFilePath) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new FilePathSource(audioFilePath),
  });

  try {
    return await input.computeDuration();
  } finally {
    await input.dispose();
  }
};

const generateWithElevenLabs = async ({
  apiKey,
  voiceId,
  text,
  outputPath,
}) => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.72,
          style: 0.28,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `ElevenLabs request failed (${response.status}): ${details.slice(0, 220)}`,
    );
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, audioBuffer);
};

const main = async () => {
  const environment = await loadEnvironment();
  const apiKey = environment.ELEVENLABS_API_KEY ?? "";
  const voiceId = environment.ELEVENLABS_VOICE_ID ?? "";
  const scenes = JSON.parse(await readFile(sceneConfigPath, "utf8"));

  await mkdir(captionsDir, { recursive: true });
  await mkdir(voiceoverDir, { recursive: true });

  const manifest = {
    sceneDurationsInFrames: [],
    sceneAudioFiles: {},
  };

  const canGenerateAudio = Boolean(apiKey && voiceId);

  if (!canGenerateAudio) {
    console.log(
      "ElevenLabs credentials were not found. Reusing existing audio when available and generating caption placeholders.",
    );
  }

  for (const scene of scenes) {
    const outputAudioPath = path.join(voiceoverDir, `${scene.id}.mp3`);
    const captionOutputPath = path.join(captionsDir, `${scene.id}.json`);
    const audioExists = await exists(outputAudioPath);
    let audioDurationInSeconds = null;
    let relativeAudioPath = null;

    if (canGenerateAudio) {
      console.log(`Generating voiceover for ${scene.id}...`);
      await generateWithElevenLabs({
        apiKey,
        voiceId,
        text: scene.voiceoverText,
        outputPath: outputAudioPath,
      });
      audioDurationInSeconds = await getAudioDurationInSeconds(outputAudioPath);
      relativeAudioPath = `voiceover/buyer-walkthrough/${scene.id}.mp3`;
    } else if (audioExists) {
      console.log(`Reusing existing audio for ${scene.id}...`);
      audioDurationInSeconds = await getAudioDurationInSeconds(outputAudioPath);
      relativeAudioPath = `voiceover/buyer-walkthrough/${scene.id}.mp3`;
    } else {
      console.log(`No audio available for ${scene.id}; using fallback timing.`);
    }

    const durationInFrames = audioDurationInSeconds
      ? Math.max(
          scene.fallbackDurationInFrames,
          Math.ceil(audioDurationInSeconds * FPS) + FRAME_PADDING,
        )
      : scene.fallbackDurationInFrames;
    const durationMs = audioDurationInSeconds
      ? Math.round(audioDurationInSeconds * 1000)
      : Math.round((durationInFrames / FPS) * 1000);
    const captions = buildCaptions(scene.voiceoverText, durationMs);

    manifest.sceneDurationsInFrames.push(durationInFrames);
    manifest.sceneAudioFiles[scene.id] = relativeAudioPath;

    await writeFile(captionOutputPath, `${JSON.stringify(captions, null, 2)}\n`);
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Updated buyer walkthrough assets in ${voiceoverDir}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

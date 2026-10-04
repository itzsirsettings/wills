import { ALL_FORMATS, Input, UrlSource } from "mediabunny";

export const getAudioDurationInSeconds = async (src: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  return input.computeDuration();
};

export const getAudioDurationOrNull = async (src: string) => {
  try {
    return await getAudioDurationInSeconds(src);
  } catch {
    return null;
  }
};

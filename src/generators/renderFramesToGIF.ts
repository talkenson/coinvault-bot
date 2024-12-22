import { Frame, GIF, Image } from "imagescript";

export type RenderOptions = { width: number; height: number };

export const renderFramesToGIF = async (
  images: Buffer[],
  options: RenderOptions,
) => {
  const frames = (
    await Promise.all(images.map((imageBuffer) => Image.decode(imageBuffer)))
  ).map((image) => Frame.from(image, 64));

  const gif = new GIF(frames, 0);

  return gif.encode();
};

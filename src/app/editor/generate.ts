import { RefObject } from "react";
import { canvasSize } from "./consts";
import { CaptureContext, snapdom } from "@zumer/snapdom";
import { encode } from "@jsquash/webp";
import "./dep";
import { canvasStroke } from "./canvasStroke";

function arrayBufferToBase64(buffer: BufferSource) {
  var binary = "";
  var bytes = new Uint8Array(buffer as ArrayBuffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function generateSticker(
  containerRef: RefObject<HTMLDivElement>
): Promise<string> {
  const container = containerRef.current;
  if (!container) throw new Error("Container not found");
  const parentElement = container.parentElement;
  if (!parentElement) throw new Error("Container has no parent");

  const canvasNode = await snapdom.toCanvas(container, {
    width: canvasSize,
    height: canvasSize,
    dpr: 1,
    embedFonts: true,
    plugins: [
      {
        name: "strokeHook",
        afterClone: (context: CaptureContext) => {
          context.clone?.querySelector("[data-ref='text']")?.remove();
        },
      },
    ],
  });
  await canvasStroke(canvasNode, parentElement.style.getPropertyValue("--field-stroke-color") || "white");
  const ctx = canvasNode.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const imgBuffer = ctx.getImageData(0, 0, 512, 512);

  const encodedBuffer = await encode(imgBuffer);

  if (process.env.NODE_ENV === "development") {
    // For development, convert to base64 and log the data URL
    const base64 = arrayBufferToBase64(encodedBuffer);
    const dataUrl = `data:image/webp;base64,${base64}`;
    console.log("Generated WebP Data URL:", dataUrl);

    // show the image in a new window for testing
    const imgWindow = window.open("");
    if (imgWindow) {
      // add checker background
      imgWindow.document.body.style.background = `repeating-conic-gradient(#ccc 0 25%, #0000 0 50%) 50% / 20px 20px`;
      imgWindow.document.body.innerHTML = `<img src="${dataUrl}" />`;
    }

    return dataUrl; // Return the Data URL for development purposes
  }

  const response = await fetch("/api/upload", {
    method: "POST",
    body: encodedBuffer,
  });
  const responseJson = await response.json();
  return responseJson.fileId as string;
}

const webpOptions = {
  quality: 75,
  target_size: 0,
  target_PSNR: 0,
  method: 4,
  sns_strength: 50,
  filter_strength: 60,
  filter_sharpness: 0,
  filter_type: 1,
  partitions: 0,
  segments: 4,
  pass: 1,
  show_compressed: 0,
  preprocessing: 0,
  autofilter: 0,
  partition_limit: 0,
  alpha_compression: 1,
  alpha_filtering: 1,
  alpha_quality: 100,
  lossless: 0,
  exact: 0,
  image_hint: 0,
  emulate_jpeg_size: 0,
  thread_level: 0,
  low_memory: 0,
  near_lossless: 100,
  use_delta_palette: 0,
  use_sharp_yuv: 0,
};

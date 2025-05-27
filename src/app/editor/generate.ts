import { RefObject } from "react";
import { canvasSize } from "./consts";
import html2canvas from "html2canvas";
import domtoimage from "dom-to-image-more";
import { encode } from "@jsquash/webp";
import "./dep";

function draw(
  domNode: Node,
  options: domtoimage.DomToImageOptions,
  parentElement: HTMLElement
): Promise<HTMLCanvasElement> {
  options = options || {};
  return domtoimage
    .toSvg(domNode, options)
    .then(domtoimage.impl.util.makeImage)
    .then(function (image) {
      const scale = typeof options.scale !== "number" ? 1 : options.scale;
      const canvas = newCanvas(domNode, scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }
      if (image) {
        ctx.scale(scale, scale);
        ctx.imageSmoothingEnabled = false;
        ctx.lineJoin = "round";
        ctx.drawImage(image, 0, 0);
      }
      return canvas;
    });

  function newCanvas(node: Node, scale: number) {
    let width = options.width || domtoimage.impl.util.width(node);
    let height = options.height || domtoimage.impl.util.height(node);

    // per https://www.w3.org/TR/CSS2/visudet.html#inline-replaced-width the default width should be 300px if height
    // not set, otherwise should be 2:1 aspect ratio for whatever height is specified
    if (domtoimage.impl.util.isDimensionMissing(width)) {
      width = domtoimage.impl.util.isDimensionMissing(height)
        ? 300
        : height * 2.0;
    }

    if (domtoimage.impl.util.isDimensionMissing(height)) {
      height = width / 2.0;
    }

    const canvas = document.createElement("canvas");
    parentElement.appendChild(canvas);
    canvas.width = width * scale;
    canvas.height = height * scale;

    if (options.bgcolor) {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }
      ctx.fillStyle = options.bgcolor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return canvas;
  }
}

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

  // const canvasNode = document.createElement("canvas");
  // parentElement.appendChild(canvasNode);
  // canvasNode.width = canvasSize;
  // canvasNode.height = canvasSize;
  // const ctx = canvasNode.getContext("2d");
  // if (!ctx) throw new Error("Failed to get canvas context");

  // ctx.lineJoin = "round";
  const oldScale = parentElement.style.scale;
  parentElement.style.scale = "1";
  // await html2canvas(container, {
  //   backgroundColor: null,
  //   scale: 1,
  //   canvas: canvasNode,
  // });
  const options: domtoimage.DomToImageOptions = {
    // bgcolor: "transparent",
    width: canvasSize,
    height: canvasSize,
    scale: 1,
  };
  const canvasNode = await draw(container, options, parentElement);
  const ctx = canvasNode.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  canvasNode.remove();
  parentElement.style.scale = oldScale;
  const imgBuffer = ctx.getImageData(0, 0, 512, 512);
  console.log(
    "width",
    imgBuffer.width,
    "height",
    imgBuffer.height,
    "colorSpace",
    imgBuffer.colorSpace,
    "data",
    imgBuffer.data.length
  );

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

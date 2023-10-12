import { RefObject } from "react";
import { canvasSize } from "./consts";
import html2canvas from "html2canvas";
import { encode } from '@jsquash/webp';
import './dep';

function arrayBufferToBase64(buffer: BufferSource) {
    var binary = '';
    var bytes = new Uint8Array(buffer as ArrayBuffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export async function generateSticker(containerRef: RefObject<HTMLDivElement>): Promise<string> {
    const container = containerRef.current;
    if (!container) throw new Error("Container not found");
    const parentElement = container.parentElement;
    if (!parentElement) throw new Error("Container has no parent");

    const canvasNode = document.createElement("canvas");
    parentElement.appendChild(canvasNode);
    canvasNode.width = canvasSize;
    canvasNode.height = canvasSize;
    const ctx = canvasNode.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    ctx.lineJoin = "round";
    const oldScale = parentElement.style.scale;
    parentElement.style.scale = "1";
    await html2canvas(container, {
        backgroundColor: null,
        scale: 1,
        canvas: canvasNode,
    });

    canvasNode.remove();
    parentElement.style.scale = oldScale;
    const imgBuffer = ctx.getImageData(0, 0, 512, 512);
    console.log("width", imgBuffer.width, "height", imgBuffer.height, "colorSpace", imgBuffer.colorSpace, "data", imgBuffer.data.length);

    const encodedBuffer = await encode(imgBuffer);

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
    use_sharp_yuv: 0
};
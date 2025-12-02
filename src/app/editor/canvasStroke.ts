export async function canvasStroke(
	canvas: HTMLCanvasElement,
	fillStyle: string | CanvasGradient | CanvasPattern = 'white',
	thickness: number = 10,
	samples: number = 36
): Promise<HTMLCanvasElement> {
	const x = 0, // 1px buffer in case of rounding errors etc.
		y = 0;

	const ctx = canvas.getContext('2d')!;

  const img = new Image();
  img.src = canvas.toDataURL();
  await img.decode();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (let angle = 0; angle < 360; angle += 360 / samples) {
		ctx.drawImage(
			img,
			thickness * Math.sin((Math.PI * 2 * angle) / 360) + x,
			thickness * Math.cos((Math.PI * 2 * angle) / 360) + y
		);
	}

	ctx.globalCompositeOperation = 'source-in';
	ctx.fillStyle = fillStyle;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.globalCompositeOperation = 'source-over';
	ctx.drawImage(img, x, y);

  return canvas;
}
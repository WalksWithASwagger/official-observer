/**
 * Custom sigma node-hover drawer: sigma's default paints a white pill behind
 * the label, which is illegible with our light label color on a dark canvas.
 */
export function drawNodeHover(
  context: CanvasRenderingContext2D,
  data: { x: number; y: number; size: number; label?: string | null },
  settings: { labelSize: number; labelFont: string; labelWeight: string },
): void {
  const { label } = data;
  if (!label) return;

  const size = settings.labelSize;
  context.font = `${settings.labelWeight} ${size}px ${settings.labelFont}`;
  const textWidth = context.measureText(label).width;

  const x = Math.round(data.x + data.size + 5);
  const y = Math.round(data.y);
  const w = textWidth + 14;
  const h = size + 10;

  context.save();
  context.beginPath();
  if (typeof context.roundRect === "function") {
    context.roundRect(x, y - h / 2, w, h, 6);
  } else {
    context.rect(x, y - h / 2, w, h);
  }
  context.fillStyle = "rgba(8, 15, 34, 0.92)";
  context.fill();
  context.strokeStyle = "rgba(148, 163, 184, 0.4)";
  context.lineWidth = 1;
  context.stroke();

  context.fillStyle = "#e2e8f0";
  context.textBaseline = "middle";
  context.fillText(label, x + 7, y + 1);
  context.restore();
}

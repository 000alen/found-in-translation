export type Point = { x: number; y: number };

export type LocalRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TriangleLinkOptions = {
  /** Width of the triangle base at the source edge */
  sourceSpread?: number;
  /** Width of the triangle base at the target edge */
  targetSpread?: number;
  /** How far triangle tips extend into the gutter */
  tipDepth?: number;
};

export function domRectToLocal(rect: DOMRect, container: DOMRect): LocalRect {
  return {
    x: rect.left - container.left,
    y: rect.top - container.top,
    width: rect.width,
    height: rect.height,
  };
}

function centerY(rect: LocalRect) {
  return rect.y + rect.height / 2;
}

function sourceEdgeX(rect: LocalRect) {
  return rect.x + rect.width;
}

function targetEdgeX(rect: LocalRect) {
  return rect.x;
}

/**
 * Builds a closed SVG path: source triangle (pointing right) → tapered body → target triangle (pointing left).
 * Matches the "parallel pages, visibly connected" wedge style.
 */
export function buildTriangleLinkPath(
  source: LocalRect,
  target: LocalRect,
  options: TriangleLinkOptions = {}
): string {
  const sourceSpread = options.sourceSpread ?? Math.max(10, Math.min(source.height * 0.42, 22));
  const targetSpread = options.targetSpread ?? Math.max(8, Math.min(target.height * 0.32, 16));
  const tipDepth = options.tipDepth ?? 10;

  const sx = sourceEdgeX(source);
  const sy = centerY(source);
  const tx = targetEdgeX(target);
  const ty = centerY(target);

  const sTop = { x: sx, y: sy - sourceSpread };
  const sBot = { x: sx, y: sy + sourceSpread };
  const sTip = { x: sx + tipDepth, y: sy };

  const tTop = { x: tx, y: ty - targetSpread };
  const tBot = { x: tx, y: ty + targetSpread };
  const tTip = { x: tx - tipDepth, y: ty };

  const dx = tx - sx;
  const bend = Math.min(Math.abs(dx) * 0.38, 120);

  return [
    `M ${sTop.x} ${sTop.y}`,
    `L ${sTip.x} ${sTip.y}`,
    `L ${sBot.x} ${sBot.y}`,
    `C ${sx + bend} ${sBot.y}, ${tx - bend} ${tBot.y}, ${tBot.x} ${tBot.y}`,
    `L ${tTip.x} ${tTip.y}`,
    `L ${tTop.x} ${tTop.y}`,
    `C ${tx - bend} ${tTop.y}, ${sx + bend} ${sTop.y}, ${sTop.x} ${sTop.y}`,
    "Z",
  ].join(" ");
}

export function buildStandaloneTriangle(
  anchor: Point,
  direction: "left" | "right",
  spread: number,
  depth: number
): string {
  if (direction === "right") {
    const tip = { x: anchor.x + depth, y: anchor.y };
    return `M ${anchor.x} ${anchor.y - spread} L ${tip.x} ${tip.y} L ${anchor.x} ${anchor.y + spread} Z`;
  }

  const tip = { x: anchor.x - depth, y: anchor.y };
  return `M ${anchor.x} ${anchor.y - spread} L ${tip.x} ${tip.y} L ${anchor.x} ${anchor.y + spread} Z`;
}

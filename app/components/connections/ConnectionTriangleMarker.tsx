import { buildStandaloneTriangle } from "@/lib/connections/geometry";
import type { ConnectionTheme } from "@/lib/connections/types";

type ConnectionTriangleMarkerProps = {
  id: string;
  x: number;
  y: number;
  direction: "left" | "right";
  spread?: number;
  depth?: number;
  theme: ConnectionTheme;
};

/** Small standalone triangle anchor on a passage edge. */
export function ConnectionTriangleMarker({
  id,
  x,
  y,
  direction,
  spread = 8,
  depth = 7,
  theme,
}: ConnectionTriangleMarkerProps) {
  const path = buildStandaloneTriangle({ x, y }, direction, spread, depth);

  return (
    <path
      id={id}
      d={path}
      fill={theme.fill}
      stroke={theme.stroke}
      strokeWidth={theme.strokeWidth ?? 1}
      strokeLinejoin="round"
    />
  );
}

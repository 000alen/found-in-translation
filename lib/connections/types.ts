export type ConnectionEndpoint = {
  id: string;
  rect: { x: number; y: number; width: number; height: number };
};

export type ConnectionRenderLink = {
  id: string;
  sourceId: string;
  targetId: string;
  path: string;
};

export type ConnectionTheme = {
  fill: string;
  stroke: string;
  strokeWidth?: number;
};

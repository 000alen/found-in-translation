"use client";

import type { Alignment } from "@/lib/types";
import type { ConnectionTheme } from "@/lib/connections/types";
import { ConnectionLink } from "./ConnectionLink";
import { useConnectionLayout } from "./useConnectionLayout";

export type ConnectionOverlayProps = {
  alignment: Alignment | null;
  containerRef: React.RefObject<HTMLDivElement>;
  leftScrollRef: React.RefObject<HTMLDivElement>;
  rightScrollRef: React.RefObject<HTMLDivElement>;
  getElement: (segmentId: string) => HTMLElement | null;
  theme: ConnectionTheme;
  visible: boolean;
};

/**
 * SVG overlay that draws tapered triangle links between aligned passages.
 * Positions are computed from live DOM measurements (scroll/resize safe).
 */
export function ConnectionOverlay({
  alignment,
  containerRef,
  leftScrollRef,
  rightScrollRef,
  getElement,
  theme,
  visible,
}: ConnectionOverlayProps) {
  const { links } = useConnectionLayout({
    alignment,
    containerRef,
    leftScrollRef,
    rightScrollRef,
    getElement,
    visible,
  });

  if (!visible || !alignment || links.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 overflow-visible"
      aria-hidden
      width="100%"
      height="100%"
    >
      {links.map((link) => (
        <ConnectionLink key={link.id} id={link.id} path={link.path} theme={theme} />
      ))}
    </svg>
  );
}

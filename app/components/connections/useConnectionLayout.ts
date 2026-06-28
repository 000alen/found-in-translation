"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Alignment } from "@/lib/types";
import { buildTriangleLinkPath, domRectToLocal } from "@/lib/connections/geometry";
import type { ConnectionRenderLink } from "@/lib/connections/types";

type UseConnectionLayoutOptions = {
  alignment: Alignment | null;
  containerRef: React.RefObject<HTMLDivElement>;
  leftScrollRef: React.RefObject<HTMLDivElement>;
  rightScrollRef: React.RefObject<HTMLDivElement>;
  getElement: (segmentId: string) => HTMLElement | null;
  visible: boolean;
};

export function useConnectionLayout({
  alignment,
  containerRef,
  leftScrollRef,
  rightScrollRef,
  getElement,
  visible,
}: UseConnectionLayoutOptions) {
  const [links, setLinks] = useState<ConnectionRenderLink[]>([]);
  const rafRef = useRef<number | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container || !visible || !alignment) {
      setLinks([]);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const nextLinks: ConnectionRenderLink[] = [];

    for (const sourceId of alignment.sourceSegmentIds) {
      for (const targetId of alignment.targetSegmentIds) {
        const sourceEl = getElement(sourceId);
        const targetEl = getElement(targetId);
        if (!sourceEl || !targetEl) continue;

        const source = domRectToLocal(sourceEl.getBoundingClientRect(), containerRect);
        const target = domRectToLocal(targetEl.getBoundingClientRect(), containerRect);

        nextLinks.push({
          id: `link-${sourceId}-${targetId}`,
          sourceId,
          targetId,
          path: buildTriangleLinkPath(source, target),
        });
      }
    }

    setLinks(nextLinks);
  }, [alignment, containerRef, getElement, visible]);

  const scheduleMeasure = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(measure);
  }, [measure]);

  useEffect(() => {
    scheduleMeasure();

    window.addEventListener("resize", scheduleMeasure);

    const container = containerRef.current;
    const resizeObserver = container ? new ResizeObserver(scheduleMeasure) : null;
    if (container && resizeObserver) resizeObserver.observe(container);

    const scrollCleanups = [leftScrollRef.current, rightScrollRef.current]
      .filter((element): element is HTMLDivElement => Boolean(element))
      .map((element) => {
        element.addEventListener("scroll", scheduleMeasure, { passive: true });
        return () => element.removeEventListener("scroll", scheduleMeasure);
      });

    return () => {
      window.removeEventListener("resize", scheduleMeasure);
      if (resizeObserver && container) resizeObserver.unobserve(container);
      scrollCleanups.forEach((cleanup) => cleanup());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, leftScrollRef, rightScrollRef, scheduleMeasure]);

  return { links, remeasure: scheduleMeasure };
}

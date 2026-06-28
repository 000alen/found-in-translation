"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Alignment } from "@/lib/types";
import { getAnchorsForAlignment } from "@/lib/alignments";
import { buildTriangleLinkPath, domRectToLocal } from "@/lib/connections/geometry";
import type { ConnectionRenderLink } from "@/lib/connections/types";

type UseConnectionLayoutOptions = {
  alignment: Alignment | null;
  containerRef: React.RefObject<HTMLDivElement>;
  leftScrollRef: React.RefObject<HTMLDivElement>;
  rightScrollRef: React.RefObject<HTMLDivElement>;
  getElement: (anchorId: string) => HTMLElement | null;
  visible: boolean;
};

function resolveAnchorElement(
  anchorId: string,
  container: HTMLElement | null,
  getElement: (anchorId: string) => HTMLElement | null
): HTMLElement | null {
  const fromMap = getElement(anchorId);
  if (fromMap) return fromMap;
  if (!container) return null;
  return container.querySelector<HTMLElement>(`[data-anchor-id="${anchorId}"]`);
}

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
    const { source, target } = getAnchorsForAlignment(alignment);
    const nextLinks: ConnectionRenderLink[] = [];

    for (const sourceAnchor of source) {
      for (const targetAnchor of target) {
        const sourceEl = resolveAnchorElement(sourceAnchor.id, container, getElement);
        const targetEl = resolveAnchorElement(targetAnchor.id, container, getElement);
        if (!sourceEl || !targetEl) continue;

        const sourceRect = domRectToLocal(sourceEl.getBoundingClientRect(), containerRect);
        const targetRect = domRectToLocal(targetEl.getBoundingClientRect(), containerRect);

        nextLinks.push({
          id: `link-${sourceAnchor.id}-${targetAnchor.id}`,
          sourceId: sourceAnchor.id,
          targetId: targetAnchor.id,
          path: buildTriangleLinkPath(sourceRect, targetRect),
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
    const retry = window.setTimeout(scheduleMeasure, 50);
    const retry2 = window.setTimeout(scheduleMeasure, 200);

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
      window.clearTimeout(retry);
      window.clearTimeout(retry2);
      window.removeEventListener("resize", scheduleMeasure);
      if (resizeObserver && container) resizeObserver.unobserve(container);
      scrollCleanups.forEach((cleanup) => cleanup());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [alignment?.id, containerRef, leftScrollRef, rightScrollRef, scheduleMeasure]);

  return { links, remeasure: scheduleMeasure };
}

"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Alignment } from "@/lib/types";

type LinkCanvasProps = {
  alignments: Alignment[];
  activeSegmentIds: Set<string>;
  containerRef: React.RefObject<HTMLDivElement>;
  getElement: (segmentId: string) => HTMLElement | null;
  visible: boolean;
};

type Point = { x: number; y: number };

function getAnchorPoint(element: HTMLElement, containerRect: DOMRect, side: "left" | "right"): Point {
  const rect = element.getBoundingClientRect();
  return {
    x: side === "left" ? rect.right - containerRect.left : rect.left - containerRect.left,
    y: rect.top - containerRect.top + rect.height / 2,
  };
}

function buildCurvePath(start: Point, end: Point, kind: Alignment["kind"]) {
  const dx = end.x - start.x;
  const controlOffset = Math.min(Math.abs(dx) * 0.45, 80);

  if (kind === "cross") {
    const midY = (start.y + end.y) / 2;
    return `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${midY}, ${(start.x + end.x) / 2} ${midY} C ${start.x + controlOffset} ${midY}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`;
  }

  return `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`;
}

export function LinkCanvas({
  alignments,
  activeSegmentIds,
  containerRef,
  getElement,
  visible,
}: LinkCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const rect = container.getBoundingClientRect();
    svg.setAttribute("width", String(rect.width));
    svg.setAttribute("height", String(rect.height));
    svg.innerHTML = "";

    for (const alignment of alignments) {
      for (const sourceId of alignment.sourceSegmentIds) {
        for (const targetId of alignment.targetSegmentIds) {
          const sourceEl = getElement(sourceId);
          const targetEl = getElement(targetId);
          if (!sourceEl || !targetEl) continue;

          const start = getAnchorPoint(sourceEl, rect, "left");
          const end = getAnchorPoint(targetEl, rect, "right");
          const isActive =
            activeSegmentIds.has(sourceId) || activeSegmentIds.has(targetId);

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", buildCurvePath(start, end, alignment.kind));
          path.setAttribute("fill", "none");
          path.setAttribute(
            "stroke",
            isActive ? "var(--color-accent)" : "var(--color-link-muted)"
          );
          path.setAttribute("stroke-width", isActive ? "2.5" : "1.5");
          path.setAttribute("opacity", visible ? (isActive ? "0.9" : "0.35") : "0");
          path.setAttribute("stroke-linecap", "round");
          path.style.transition = "opacity 200ms ease, stroke 200ms ease";
          svg.appendChild(path);
        }
      }
    }
  }, [activeSegmentIds, alignments, containerRef, getElement, visible]);

  useEffect(() => {
    const scheduleDraw = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    };

    scheduleDraw();
    window.addEventListener("resize", scheduleDraw);

    const container = containerRef.current;
    const observer = container
      ? new ResizeObserver(scheduleDraw)
      : null;
    if (container && observer) observer.observe(container);

    return () => {
      window.removeEventListener("resize", scheduleDraw);
      if (observer && container) observer.unobserve(container);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, draw]);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 z-10 overflow-visible"
      aria-hidden
    />
  );
}

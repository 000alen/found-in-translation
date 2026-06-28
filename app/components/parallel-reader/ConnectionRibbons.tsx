"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Alignment } from "@/lib/types";

type Point = { x: number; y: number };

type ConnectionRibbonsProps = {
  alignment: Alignment | null;
  containerRef: React.RefObject<HTMLDivElement>;
  leftScrollRef: React.RefObject<HTMLDivElement>;
  rightScrollRef: React.RefObject<HTMLDivElement>;
  getElement: (segmentId: string) => HTMLElement | null;
  ribbonColor: string;
  visible: boolean;
};

function toLocalPoint(rect: DOMRect, container: DOMRect, edge: "left" | "right"): Point {
  return {
    x: (edge === "right" ? rect.right : rect.left) - container.left,
    y: rect.top + rect.height / 2 - container.top,
  };
}

function ribbonCurve(start: Point, end: Point): string {
  const dx = end.x - start.x;
  const bend = Math.min(Math.abs(dx) * 0.44, 140);

  return `M ${start.x} ${start.y} C ${start.x + bend} ${start.y}, ${end.x - bend} ${end.y}, ${end.x} ${end.y}`;
}

export function ConnectionRibbons({
  alignment,
  containerRef,
  leftScrollRef,
  rightScrollRef,
  getElement,
  ribbonColor,
  visible,
}: ConnectionRibbonsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg || !visible || !alignment) {
      if (svg) svg.innerHTML = "";
      return;
    }

    const containerRect = container.getBoundingClientRect();
    svg.setAttribute("width", String(containerRect.width));
    svg.setAttribute("height", String(containerRect.height));
    svg.innerHTML = "";

    for (const sourceId of alignment.sourceSegmentIds) {
      for (const targetId of alignment.targetSegmentIds) {
        const sourceEl = getElement(sourceId);
        const targetEl = getElement(targetId);
        if (!sourceEl || !targetEl) continue;

        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const start = toLocalPoint(sourceRect, containerRect, "right");
        const end = toLocalPoint(targetRect, containerRect, "left");
        const strokeWidth = Math.max(20, Math.min(sourceRect.height, targetRect.height) * 0.78);

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", ribbonCurve(start, end));
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", ribbonColor);
        path.setAttribute("stroke-width", String(strokeWidth));
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        svg.appendChild(path);
      }
    }
  }, [alignment, containerRef, getElement, ribbonColor, visible]);

  const scheduleDraw = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
  }, [draw]);

  useEffect(() => {
    scheduleDraw();

    window.addEventListener("resize", scheduleDraw);

    const container = containerRef.current;
    const resizeObserver = container ? new ResizeObserver(scheduleDraw) : null;
    if (container && resizeObserver) resizeObserver.observe(container);

    const scrollCleanups = [leftScrollRef.current, rightScrollRef.current]
      .filter((element): element is HTMLDivElement => Boolean(element))
      .map((element) => {
        element.addEventListener("scroll", scheduleDraw, { passive: true });
        return () => element.removeEventListener("scroll", scheduleDraw);
      });

    return () => {
      window.removeEventListener("resize", scheduleDraw);
      if (resizeObserver && container) resizeObserver.unobserve(container);
      scrollCleanups.forEach((cleanup) => cleanup());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, leftScrollRef, rightScrollRef, scheduleDraw]);

  if (!visible || !alignment) return null;

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 z-[5] overflow-visible"
      aria-hidden
    />
  );
}

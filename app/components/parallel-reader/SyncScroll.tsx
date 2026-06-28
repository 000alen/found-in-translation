"use client";

import { useCallback, useEffect, useRef } from "react";

type SyncScrollProps = {
  leftRef: React.RefObject<HTMLDivElement>;
  rightRef: React.RefObject<HTMLDivElement>;
  enabled: boolean;
};

export function useSyncScroll({ leftRef, rightRef, enabled }: SyncScrollProps) {
  const syncing = useRef(false);

  const sync = useCallback(
    (source: HTMLDivElement, target: HTMLDivElement) => {
      if (!enabled || syncing.current) return;
      syncing.current = true;

      const sourceMax = source.scrollHeight - source.clientHeight;
      const targetMax = target.scrollHeight - target.clientHeight;
      const ratio = sourceMax > 0 ? source.scrollTop / sourceMax : 0;
      target.scrollTop = ratio * targetMax;

      requestAnimationFrame(() => {
        syncing.current = false;
      });
    },
    [enabled]
  );

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right || !enabled) return;

    const onLeftScroll = () => sync(left, right);
    const onRightScroll = () => sync(right, left);

    left.addEventListener("scroll", onLeftScroll, { passive: true });
    right.addEventListener("scroll", onRightScroll, { passive: true });

    return () => {
      left.removeEventListener("scroll", onLeftScroll);
      right.removeEventListener("scroll", onRightScroll);
    };
  }, [enabled, leftRef, rightRef, sync]);
}

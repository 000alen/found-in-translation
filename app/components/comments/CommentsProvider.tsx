"use client";

import { createContext, useContext, useMemo } from "react";
import { LiveblocksProvider } from "@liveblocks/react";

type CommentsProviderProps = {
  children: React.ReactNode;
};

const LiveblocksEnabledContext = createContext(false);

export function useLiveblocksEnabled() {
  return useContext(LiveblocksEnabledContext);
}

export function CommentsProvider({ children }: CommentsProviderProps) {
  const publicKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;
  const enabled = Boolean(publicKey);

  const value = useMemo(() => enabled, [enabled]);

  if (!enabled) {
    return (
      <LiveblocksEnabledContext.Provider value={value}>
        {children}
      </LiveblocksEnabledContext.Provider>
    );
  }

  return (
    <LiveblocksEnabledContext.Provider value={value}>
      <LiveblocksProvider publicApiKey={publicKey!}>{children}</LiveblocksProvider>
    </LiveblocksEnabledContext.Provider>
  );
}

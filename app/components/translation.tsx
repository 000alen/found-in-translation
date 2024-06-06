"use client";

import { Recogito } from "@recogito/recogito-js";
import "@recogito/recogito-js/dist/recogito.min.css";
import { useCallback, useEffect, useRef, useState } from "react";

export function Left({ children }) {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function Right({ children }) {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <p className="w-full flex flex-col items-center justify-center">
        {children}
      </p>
    </div>
  );
}

export function Translation({ children }) {
  const [mode, setMode] = useState<"RELATIONS" | "ANNOTATION">("ANNOTATION");
  const recognito = useRef<any>(null);

  const toggle = useCallback(() => {
    if (mode === "RELATIONS") setMode("ANNOTATION");
    else setMode("RELATIONS");
  }, []);

  useEffect(() => {
    if (!recognito.current) return;

    if (mode === "RELATIONS") {
      recognito.current!.setMode("RELATIONS");
    } else {
      recognito.current!.setMode("ANNOTATION");
    }
  }, [mode]);

  useEffect(() => {
    recognito.current = new Recogito({
      content: "translation",
    });
  }, []);

  return (
    <>
      <button onClick={toggle}>toggle</button>
      <div
        id="translation"
        className="flex flex-row w-full items-center justify-center"
      >
        {children}
      </div>
    </>
  );
}

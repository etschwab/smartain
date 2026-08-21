"use client";

import { useEffect } from "react";
import { GradientWaves } from "@/components/effects/gradient-waves";

const colors = {
  horizonColor: "#21070D",
  waveColor: "#6E1F32",
  crestColor: "#F33F55"
} as const;

export function GradientWavesBackground() {
  useEffect(() => {
    const relayPointer = (event: PointerEvent) => {
      document.querySelector<HTMLCanvasElement>(".global-gradient-waves canvas")?.dispatchEvent(
        new PointerEvent("pointermove", { clientX: event.clientX, clientY: event.clientY })
      );
    };

    window.addEventListener("pointermove", relayPointer, { passive: true });
    return () => window.removeEventListener("pointermove", relayPointer);
  }, []);

  return <GradientWaves className="global-gradient-waves" {...colors} />;
}

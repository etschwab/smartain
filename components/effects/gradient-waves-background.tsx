"use client";

import { useEffect } from "react";
import { GradientWaves } from "@/components/effects/gradient-waves";

const colors = {
  horizonColor: "#12080B",
  waveColor: "#351117",
  crestColor: "#8F2835"
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

"use client";

import { Maximize2, QrCode, X } from "lucide-react";
import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

type InviteQrCodeProps = {
  url: string;
  teamName: string;
  active: boolean;
};

function QrGraphic({ url, teamName, large = false }: { url: string; teamName: string; large?: boolean }) {
  return (
    <QRCodeSVG
      value={url}
      title={`Einladung zu ${teamName} scannen`}
      level="M"
      marginSize={4}
      size={large ? 512 : 208}
      bgColor="#ffffff"
      fgColor="#111111"
      className={large ? "h-auto w-full max-w-[min(72vw,65vh)]" : "h-auto w-full max-w-52"}
    />
  );
}

export function InviteQrCode({ url, teamName, active }: InviteQrCodeProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (!active) {
    return (
      <div className="grid min-h-52 w-full place-items-center rounded-xl border border-dashed border-border p-6 text-center sm:w-60">
        <div>
          <QrCode className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">QR-Code pausiert</p>
          <p className="mt-1 text-sm text-muted-foreground">Aktiviere den Link, damit Mitglieder beitreten können.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center rounded-xl border border-border bg-white p-4 text-center text-zinc-950 sm:w-60">
      <QrGraphic url={url} teamName={teamName} />
      <p className="mt-2 text-sm font-bold">Scannen & beitreten</p>
      <p className="mt-1 text-xs text-zinc-600">Kamera öffnen und QR-Code scannen</p>
      <Button type="button" variant="secondary" size="sm" className="mt-4 w-full" onClick={() => dialogRef.current?.showModal()}>
        <Maximize2 className="h-4 w-4" />Groß anzeigen
      </Button>

      <dialog ref={dialogRef} className="m-auto max-h-none max-w-none rounded-2xl bg-white p-0 text-zinc-950 shadow-2xl backdrop:bg-black/80">
        <div className="relative flex min-h-[min(90vh,760px)] w-[min(92vw,760px)] flex-col items-center justify-center p-6 sm:p-10">
          <form method="dialog" className="absolute right-4 top-4">
            <Button type="submit" variant="secondary" size="icon" aria-label="QR-Code schließen">
              <X className="h-5 w-5" />
            </Button>
          </form>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">Team beitreten</p>
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-4xl">{teamName}</h2>
          <QrGraphic url={url} teamName={teamName} large />
          <p className="mt-6 text-center text-lg font-bold">Mit der Handykamera scannen</p>
          <p className="mt-2 max-w-lg break-all text-center text-sm text-zinc-600">{url}</p>
        </div>
      </dialog>
    </div>
  );
}

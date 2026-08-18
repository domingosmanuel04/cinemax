"use client";

import { useEffect, useRef, useState } from "react";

type DetectorCtor = new (options?: { formats?: string[] }) => {
  detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
};

export function QrCamera({ onCode }: { onCode: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    let stopped = false;

    async function run() {
      const Detector = (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
      if (!Detector) {
        setError("A leitura por câmara requer Chrome ou Edge. Introduza o código manualmente.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new Detector({ formats: ["qr_code"] });
        const tick = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) {
              onCode(codes[0].rawValue);
              stopped = true;
              stream?.getTracks().forEach((t) => t.stop());
              setActive(false);
              return;
            }
          } catch {
            /* frame skip */
          }
          timer = window.setTimeout(tick, 350);
        };
        tick();
      } catch {
        setError("Não foi possível aceder à câmara.");
      }
    }
    run();
    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active, onCode]);

  return (
    <div className="mt-4">
      {active ? (
        <video ref={videoRef} className="h-56 w-full rounded-2xl bg-black object-cover" muted playsInline />
      ) : (
        <button type="button" onClick={() => { setError(""); setActive(true); }} className="rounded-full border border-white/20 px-4 py-2 text-sm">
          Abrir câmara QR
        </button>
      )}
      {error ? <p className="mt-2 text-xs text-cx-gold">{error}</p> : null}
      <label className="mt-3 block text-xs text-cx-muted">
        Ou carregue uma foto do QR
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="mt-2 block w-full text-xs"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const Detector = (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
            if (!Detector) {
              setError("A leitura por imagem requer Chrome ou Edge. Cole o código TKT no campo acima.");
              return;
            }
            try {
              const bmp = await createImageBitmap(file);
              const codes = await new Detector({ formats: ["qr_code"] }).detect(bmp);
              if (codes[0]?.rawValue) onCode(codes[0].rawValue);
              else setError("Não foi possível ler o QR nesta imagem.");
            } catch {
              setError("Não foi possível ler o QR nesta imagem.");
            }
          }}
        />
      </label>
    </div>
  );
}

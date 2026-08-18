"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function Preloader({ enabled }: { enabled: boolean }) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled || reduce) return;
    const skipped = sessionStorage.getItem("cinemax-skip-intro") === "1";
    const disabled = localStorage.getItem("cinemax-preloader") === "off";
    if (skipped || disabled) return;
    setShow(true);
    const t = setTimeout(() => finish(), 5200);
    return () => clearTimeout(t);
  }, [enabled, reduce]);

  function finish() {
    sessionStorage.setItem("cinemax-skip-intro", "1");
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          role="dialog"
          aria-label="Introdução CINEMAX"
        >
          <div className="animate-projector pointer-events-none absolute left-1/2 top-[-10%] h-[70vh] w-[70vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,244,220,0.18),transparent_60%)]" />
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/70"
              style={{
                left: `${20 + (i * 7) % 60}%`,
                bottom: "10%",
                animation: `dust ${3 + (i % 5)}s linear ${i * 0.12}s infinite`,
              }}
            />
          ))}
          <div className="absolute top-1/3 w-[200%] overflow-hidden opacity-40">
            <div className="animate-film-strip flex">
              {[0, 1].map((n) => (
                <div key={n} className="flex w-1/2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="mx-1 h-16 w-24 border-y-8 border-black bg-neutral-800" />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex h-full flex-col items-center justify-center">
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.6em" }}
              animate={{ opacity: 1, letterSpacing: "0.35em" }}
              transition={{ delay: 1.4, duration: 1.1 }}
              className="font-display text-5xl text-white md:text-7xl"
            >
              CINE<span className="text-cx-red">MAX</span>
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4, duration: 1 }}
              className="mt-4 text-xs tracking-[0.5em] text-cx-gold-soft uppercase"
            >
              Your Movie. Your Moment.
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2.6, duration: 1.2 }}
              className="mt-8 h-px w-48 origin-center bg-gradient-to-r from-transparent via-cx-red to-transparent"
            />
          </div>
          <button
            type="button"
            onClick={finish}
            className="absolute right-6 bottom-6 text-xs tracking-[0.2em] text-cx-muted uppercase hover:text-white"
          >
            Saltar introdução
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

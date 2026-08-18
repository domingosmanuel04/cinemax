"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({
  kicker,
  title,
  href,
}: {
  kicker?: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {kicker ? (
          <p className="mb-1 text-[11px] font-semibold tracking-[0.35em] text-cx-red uppercase">{kicker}</p>
        ) : null}
        <h2 className="font-display text-2xl text-white md:text-3xl">{title}</h2>
      </div>
      {href ? (
        <a href={href} className="text-sm text-cx-muted transition hover:text-white">
          Ver todos →
        </a>
      ) : null}
    </div>
  );
}

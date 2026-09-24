"use client";

import type { ReactNode } from "react";

export default function RevealItem({ index, skip, children }: { index: number; skip?: boolean; children: ReactNode }) {
  return (
    <div
      style={{ animation: skip ? "none" : `reveal-up 0.35s ease-out ${index * 120}ms both` }}
    >
      {children}
    </div>
  );
}

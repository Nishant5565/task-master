import { COLOR_PALETTE } from "@/lib/schema";
import React from "react";

/**
 * This component is invisible and serves only to force Tailwind to generate
 * the CSS classes used dynamically in the application (e.g. from COLOR_PALETTE).
 * Since these classes are constructed or used from an external file,
 * the Tailwind scanner might miss them during purging.
 */
export default function ColorSafelist() {
  return (
    <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
      {COLOR_PALETTE.map((c, i) => (
        <div key={i} className={`${c.bg} ${c.text}`}></div>
      ))}
    </div>
  );
}

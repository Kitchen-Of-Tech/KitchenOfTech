"use client";

/**
 * StudioClient — the single "use client" boundary for Sanity Studio.
 *
 * Both sanity.config AND NextStudio are loaded lazily inside the dynamic
 * import so Turbopack only processes them as part of the lazy client chunk,
 * never during the initial static analysis of this module.
 */

import dynamic from "next/dynamic";

const NextStudioDynamic = dynamic(
  async () => {
    // Both imports happen inside the lazy chunk — Turbopack processes
    // them only in the browser, after hydration. This avoids:
    //   1. Server-side evaluation of the Sanity/history module tree
    //   2. Non-serialisable config crossing the server→client boundary
    //   3. Turbopack static analysis of history (CJS) at build time
    const [{ NextStudio }, config] = await Promise.all([
      import("next-sanity/studio/client-component"),
      import("@/sanity.config"),
    ]);
    // Return a component that closes over both values
    function Studio() {
      return <NextStudio config={config.default} />;
    }
    return Studio;
  },
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "sans-serif",
          fontSize: "16px",
          color: "#666",
        }}
      >
        Loading Studio…
      </div>
    ),
  }
);

export default function StudioClient(): React.ReactNode {
  return <NextStudioDynamic />;
}

import React, { memo } from 'react';

/**
 * Global Blue Animated Background Layer (Opal Native Video Backdrop)
 * Renders the authoritative ACC 2026 Blue-sky video animation with SVG fallback poster
 * and frosted scrim, positioned behind all application views.
 */
export const BlueAnimatedBackground = memo(() => {
  return (
    <div
      className="fixed inset-0 w-full h-full min-h-screen pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
      style={{
        background: "#d8e8fc url('/Blue-sky-2048x1166.svg') center center / cover no-repeat",
      }}
    >
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-95 pointer-events-none"
        style={{
          filter: "saturate(1.10) brightness(1.02)",
          transform: "translate3d(0, 0, 0)",
          WebkitTransform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
        autoPlay
        loop
        muted
        playsInline
        // @ts-ignore
        webkit-playsinline="true"
        disablePictureInPicture
        poster="/Blue-sky-2048x1166.svg"
        preload="auto"
      >
        <source src="/Blue-sky.mp4" type="video/mp4" />
        <source src="/Blue sky.mp4" type="video/mp4" />
      </video>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 30%, rgba(246, 249, 255, 0.12) 0%, rgba(246, 249, 255, 0.32) 100%)",
        }}
      />
    </div>
  );
});

BlueAnimatedBackground.displayName = 'BlueAnimatedBackground';

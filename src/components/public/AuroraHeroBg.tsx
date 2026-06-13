'use client';

import React from "react";

export function AuroraHeroBg() {
  // Safely URL-encoded SVG string for the fluted glass effect
  const filterImageHref = "data:image/svg+xml," + encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1' color-interpolation-filters='sRGB'>
      <g>
        <rect width='1' height='1' fill='black' />
        <rect width='1' height='1' fill='url(#red)' style='mix-blend-mode:screen' />
        <rect width='1' height='1' fill='url(#green)' style='mix-blend-mode:screen' />
        <rect width='1' height='1' fill='url(#yellow)' style='mix-blend-mode:screen' />
      </g>
      <defs>
        <radialGradient id='yellow' cx='0' cy='0' r='1' >
          <stop stop-color='yellow' />
          <stop stop-color='yellow' offset='1' stop-opacity='0' />
        </radialGradient>
        <radialGradient id='green' cx='1' cy='0' r='1' >
          <stop stop-color='green' />
          <stop stop-color='green' offset='1' stop-opacity='0' />
        </radialGradient>
        <radialGradient id='red' cx='0' cy='1' r='1' >
          <stop stop-color='red' />
          <stop stop-color='red' offset='1' stop-opacity='0' />
        </radialGradient>
      </defs>
    </svg>
  `);

  return (
    <>
      <style>{`
        .aurora-hero-bg-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 650px;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
          --stripe-color: #000;
          --bg-filter: blur(10px) opacity(50%) saturate(200%);
          background: #05070a;
          mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
        }
        @keyframes smoothBg {
          from { background-position: 50% 50%, 50% 50%; }
          to { background-position: 350% 50%, 350% 50%; }
        }
        .aurora-hero-bg {
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0;
          --stripes: repeating-linear-gradient(
            100deg, 
            var(--stripe-color) 0%, 
            var(--stripe-color) 7%, 
            transparent 10%, 
            transparent 12%, 
            var(--stripe-color) 16%
          );
          --rainbow: repeating-linear-gradient(
            100deg, 
            #60a5fa 10%, 
            #e879f9 15%, 
            #60a5fa 20%, 
            #5eead4 25%, 
            #60a5fa 30%
          );
          background-image: var(--stripes), var(--rainbow);
          background-size: 300%, 200%;
          background-position: 50% 50%, 50% 50%;
          filter: var(--bg-filter);
          mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
        }
        .aurora-hero-bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: var(--stripes), var(--rainbow);
          background-size: 200%, 100%;
          animation: smoothBg 60s linear infinite;
          background-attachment: fixed;
          mix-blend-mode: difference;
        }
        .aurora-fluted-glass {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: contrast(0.95) blur(6px) url(#fluted);
          -webkit-backdrop-filter: contrast(0.95) blur(6px) url(#fluted);
        }
      `}</style>

      <div className="aurora-hero-bg-container">
        <div className="aurora-hero-bg"></div>
        <div className="aurora-fluted-glass"></div>
      </div>

      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        colorInterpolationFilters="sRGB"
        style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none" }}
        aria-hidden="true"
        focusable="false"
      >
        <filter id="fluted" primitiveUnits="objectBoundingBox">
          <feImage
            x="0"
            y="0"
            result="image_0"
            crossOrigin="anonymous"
            href={filterImageHref}
            preserveAspectRatio="none meet"
            width=".03"
            height="1"
          />
          <feTile in="image_0" result="tile_0" />
          <feGaussianBlur stdDeviation=".0001" edgeMode="none" in="tile_0" result="bar_smoothness" x="0" y="0" />
          <feDisplacementMap scale=".08" xChannelSelector="R" yChannelSelector="G" in="SourceGraphic" in2="bar_smoothness" result="displacement_0" />
        </filter>
      </svg>
    </>
  );
}

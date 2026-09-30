import { type PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

import { PRODUCT_NAME } from '@/theme/appIdentity';

/**
 * Web-only document shell (Expo Router SSG). Carries the Pixel Arcadia web-facing
 * metadata: title, description and theme colour. The browser-tab icon is the
 * simplified Portal Mosaic favicon (M17C.1) — Expo generates a multi-size `favicon.ico`
 * (16 / 32 / 48) from `web.favicon` (`assets/favicon.png`), and `public/`
 * ships the standalone 16 / 32 / 64 PNGs. Technical identifiers (slug `orbitide`,
 * scheme `orbitide`) are unaffected.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>{PRODUCT_NAME}</title>
        <meta name="description" content="Pixel Arcadia — a one-thumb pixel-art puzzle game." />
        <meta name="theme-color" content="#3B63E8" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        <ScrollViewStyleReset />
        <style>{`html,body{background-color:#3B63E8;}`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}

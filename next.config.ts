import type { NextConfig } from "next";

/**
 * Export 100 % statique : `next build` produit un dossier `out/` servable par
 * n'importe quel hébergeur statique (VPS/nginx, Cloudflare Pages…), sans serveur
 * Node ni base de données. Le jour où l'app est fusionnée dans Tsuno, on retire
 * `output: "export"` et les routes/composants s'exécutent tels quels côté Next.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  // Cohérent avec Tsuno : le type-check est fait via `tsc --noEmit`, pas au build.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;

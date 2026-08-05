import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? "/Roman-Poll" : "",
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/Roman-Poll" : "" },
};

export default nextConfig;

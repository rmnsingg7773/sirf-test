import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // इस IP को डेवलपमेंट में अनुमति देना
  allowedDevOrigins: ["192.168.31.48"],
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add webpack configuration for FFmpeg.wasm
  webpack: (config, { isServer }) => {
    // Skip certain webpack configurations during server compilation
    if (!isServer) {
      // Disable the default handling of wasm files
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
      
      // Add fallbacks for node.js core modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
      };
    }
    
    return config;
  },
  // Set security headers for SharedArrayBuffer support
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig; 
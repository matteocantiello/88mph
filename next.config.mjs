/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://i.scdn.co https://img.youtube.com https://*.googleusercontent.com https://flagcdn.com",
              "font-src 'self' https://fonts.gstatic.com",
              "media-src 'self' https://p.scdn.co",
              "frame-src https://www.youtube.com https://open.spotify.com",
              "connect-src 'self' https://api.spotify.com https://accounts.spotify.com https://va.vercel-scripts.com https://cdn.jsdelivr.net",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

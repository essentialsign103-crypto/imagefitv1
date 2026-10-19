/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  distDir: ".next",
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;

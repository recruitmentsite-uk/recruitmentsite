/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@placeuk/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

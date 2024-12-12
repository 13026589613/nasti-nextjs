import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.1.81",
        port: "8090",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "nasti.hiwintech.com",
        port: "9070",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "freebird-dev.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gateway.uat.getnasti.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "freebird-uat.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "freebird-qa-environment.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    // https://react-svgr.com/docs/next/
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    // public alias
    config.resolve.alias["~"] = path.resolve(__dirname);
    return config;
  },
  reactStrictMode: false,
};

export default nextConfig;

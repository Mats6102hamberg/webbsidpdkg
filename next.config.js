/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fixar workspace-root-varningen nar flera lockfiles finns.
  outputFileTracingRoot: __dirname
};

module.exports = nextConfig;

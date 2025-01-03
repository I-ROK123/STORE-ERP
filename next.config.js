/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@radix-ui/react-select', '@radix-ui/react-dialog'],
    webpack: (config) => {
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      });
      return config;
    }
  };
  
  module.exports = nextConfig;
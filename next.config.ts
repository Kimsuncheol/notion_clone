import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Experimental settings for better Turbopack compatibility
  experimental: {
    // Only enable turbopack if explicitly requested
    // turbo: {
    //   rules: {
    //     '*.woff2': {
    //       loaders: ['file-loader'],
    //       as: '*.woff2'
    //     }
    //   }
    // }
  },
  
  // Webpack configuration for font handling
  webpack: (config) => {
    // Better font handling
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });
    
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
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
  
  // Webpack configuration for font handling and Firebase compatibility
  webpack: (config, { isServer }) => {
    // Better font handling
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });
    
    // Fix Firebase module resolution issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Optimize Firebase and other large dependencies
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
    };
    
    return config;
  },
  
  // Transpile Firebase packages for better compatibility
  transpilePackages: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore'],
};

export default nextConfig;

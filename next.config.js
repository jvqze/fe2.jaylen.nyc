/** @type {import('next').NextConfig} */
module.exports = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
            };
        }
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"],
        });
        return config;
    },
    reactStrictMode: true,
    experimental: {
        serverActions: {
          bodySizeLimit: '30mb',
        },
      },
    images: {
        domains: ["cdn.jaylen.nyc", "cdn.discordapp.com"],
    },
};

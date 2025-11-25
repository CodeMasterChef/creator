/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.coindesk.com',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'www.coindesk.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.sanity.io',
            },
            {
                protocol: 'https',
                hostname: 'images.cointelegraph.com',
            },
        ],
    },
};

export default nextConfig;

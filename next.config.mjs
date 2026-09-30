/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '5mb' }, // permite anexos maiores no chamado
  },
};

export default nextConfig;

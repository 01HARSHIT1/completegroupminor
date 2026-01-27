/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'your-camera-ip'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001',
    WS_URL: process.env.WS_URL || 'ws://localhost:3001',
  },
}

module.exports = nextConfig

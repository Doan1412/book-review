/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
  reactStrictMode: true,
  compiler: {
      styledComponents: true,
  },
  images : {
    domains : ['127.0.0.1:8000', 'localhost'] // <== Domain name
  }
};

module.exports = nextConfig;

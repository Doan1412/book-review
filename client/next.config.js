/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
  images: {
    domains: ['127.0.0.1'],
  },
};

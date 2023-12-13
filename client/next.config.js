/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
  images: {
    domains: ['192.168.1.181'],
  },
};

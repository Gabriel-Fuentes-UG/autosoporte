/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'odbc': 'commonjs odbc',
        'mock-aws-s3': 'mock-aws-s3',
        'aws-sdk': 'aws-sdk',
        'nock': 'nock'
      });
    }
    
    config.module.rules.push({
      test: /\.html$/,
      use: 'ignore-loader'
    });
    
    return config;
  },
}

module.exports = nextConfig
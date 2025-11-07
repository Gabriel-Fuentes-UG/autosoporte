/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  typescript: {
    ignoreBuildErrors: false,
  },
  // Desactivar minificación completamente para evitar errores de Terser
  swcMinify: false,
  experimental: {
    // Deshabilitar precomputación de páginas durante el build
    isrMemoryCacheSize: 0,
  },
  webpack: (config, { isServer }) => {
    // Deshabilitar minificación completamente
    config.optimization.minimize = false;
    
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
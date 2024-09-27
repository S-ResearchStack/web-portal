const path = require('path');

const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { DefinePlugin, ProvidePlugin } = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const CircularDependencyPlugin = require('circular-dependency-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'build');

const styledComponentsTransformer = createStyledComponentsTransformer();

const transformEnvDefine = (env) =>
  Object.keys(env).reduce((res, k) => {
    res[`process.env.${k}`] = JSON.stringify(env[k]);
    return res;
  }, {});

module.exports = (env, argv) => {
  const isDev = argv.mode !== 'production';

  const PUBLIC_PATH = process.env.PUBLIC_PATH
    ? ['', ...process.env.PUBLIC_PATH.trim().split('/').filter(Boolean), ''].join('/')
    : '/';

  const useApiProxy = !!process.env.USE_API_PROXY;
  let API_URL = process.env.API_URL;
  let proxy = undefined;
  if (useApiProxy && API_URL) {
    proxy = {
      '/api': {
        target: API_URL,
        pathRewrite: { '^/api': '' },
      },
      logLevel: 'debug',
    };
    API_URL = '/api';
  }

  return {
    entry: './src/index.tsx',
    devtool: isDev ? 'inline-source-map' : undefined,
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            {
              loader: 'style-loader',
              options: {
                esModule: false,
              },
            },
            !isDev && MiniCssExtractPlugin.loader,
            'css-loader',
          ].filter(Boolean),
        },
        {
          test: /\.tsx?$/,
          exclude: [/node_modules/, /\.stories\.tsx?$/, /\.test\.tsx?$/],
          ...(isDev
            ? {
                loader: 'ts-loader',
                options: {
                  getCustomTransformers: () => ({ before: [styledComponentsTransformer] }),
                },
              }
            : { use: 'ts-loader' }),
        },
        {
          test: /\.svg$/i,
          type: 'asset',
          resourceQuery: /url/,
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          resourceQuery: { not: [/url/] },
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeViewBox: false,
                          cleanupIDs: false,
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, 'src/'),
      },
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: '[name].[contenthash].js',
      path: BUILD_DIR,
      clean: true,
      publicPath: PUBLIC_PATH,
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
      minimize: !isDev,
      minimizer: [new CssMinimizerPlugin()],
    },
    plugins: [
      new NodePolyfillPlugin(),
      isDev && new ReactRefreshPlugin(),
      !isDev && new MiniCssExtractPlugin(),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      isDev && new ForkTsCheckerWebpackPlugin(),
      env.analyzeBundle === 'true' && new BundleAnalyzerPlugin(),
      new DefinePlugin(
        transformEnvDefine({
          NODE_ENV: argv.mode,
          API_URL,
          GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
          AUTHENTICATION_MODE: process.env.AUTHENTICATION_MODE,
          GOOGLE_OAUTH_URL: process.env.GOOGLE_OAUTH_URL || "https://accounts.google.com/gsi/client",
          PUBLIC_PATH,
          MOCK_API: process.env.MOCK_API,
          VERSION: require('./package.json').version,
        })
      ),
      new ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      isDev &&
        new CircularDependencyPlugin({
          exclude: /node_modules/,
          include: /src/,
          failOnError: true,
          allowAsyncCycles: false,
          cwd: process.cwd(),
        }),
    ].filter(Boolean),
    devServer: {
      historyApiFallback: true,
      hot: true,
      proxy,
      port: process.env.PORT,
    },
  };
};

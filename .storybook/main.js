const path = require('path');
const { DefinePlugin, ProvidePlugin } = require('webpack');

const baseWebpackConfig = require('../webpack.config')({}, {});

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5',
  },
  webpackFinal: (config) => {
    config.resolve.alias = {
      src: path.resolve(__dirname, '..', 'src/'),
    };

    const fileLoaderRule = config.module.rules.find((rule) => rule.test && rule.test.test('.svg'));
    fileLoaderRule.exclude = /\.svg$/;

    config.module.rules = [
      ...config.module.rules,
      ...baseWebpackConfig.module.rules.filter((r) => r.test.test('.svg')),
    ];

    baseWebpackConfig.plugins
      .filter((p) => [ProvidePlugin, DefinePlugin].some((pt) => p instanceof pt))
      .forEach((p) => config.plugins.push(p));

    return config;
  },
};

/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

const resolve = (...target) => path.resolve(__dirname, ...target);

module.exports = {
  entry: {
    main: './src/index.ts',
  },
  mode: 'development',
  output: {
    filename: '[name].[hash:8].js',
    path: resolve('dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
  devServer: {
    open: true
  }
};

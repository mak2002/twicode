const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const baseConfig = {
  mode: 'production', // or 'development' for development mode
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // Add any other loaders you need for your project
    ],
  },
  target: 'web',
};

const webviewConfig = {
  ...baseConfig,
  target: 'web',
  entry: './src/webview/main.ts',
  output: {
    filename: 'webview.js',
    path: path.resolve(__dirname, 'out'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: './src/webview/*.css',
          to: './style.css',
        },
      ],
    }),
  ],
};

const extensionConfig = {
  target: 'node',
  mode: 'none',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: 'log',
  },
};

module.exports = [extensionConfig, webviewConfig];

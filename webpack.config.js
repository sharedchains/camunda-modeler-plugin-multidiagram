const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const CamundaModelerWebpackPlugin = require('camunda-modeler-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './client/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'client.js'
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: 'react-svg-loader'
      }
    ]
  },
  devtool: 'cheap-module-source-map',
  plugins: [
    new CamundaModelerWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './client/style.css'),
          to: path.resolve(__dirname, './dist/')
        },
        {
          from: path.resolve(__dirname, './index.prod.js'),
          to: path.resolve(__dirname, './dist/index.js')
        }
      ]
    }),
    new ZipPlugin({
      filename: process.env.npm_package_name + '-' + process.env.npm_package_version + '.zip',
      pathPrefix: process.env.npm_package_name + '/',
      pathMapper: function(assetPath) {
        if (assetPath.startsWith('client') || assetPath.startsWith('style')) {
          return path.join(path.dirname(assetPath), 'client', path.basename(assetPath));
        }
        return assetPath;
      }
    })
  ]
};
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

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
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [ '@babel/preset-react' ]
          }
        }
      },
      {
        test: /\.svg$/,
        use: 'react-svg-loader'
      }
    ]
  },
  resolve: {
    alias: {
      'react': 'camunda-modeler-plugin-helpers/react'
    }
  },
  devtool: 'cheap-module-source-map',
  plugins: [
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
      filename: 'camunda-modeler-plugin-multidiagram-' + process.env.npm_package_version + '.zip',
      pathPrefix: 'camunda-modeler-plugin-multidiagram/',
      pathMapper: function(assetPath) {
        if (assetPath.startsWith('client') || assetPath.startsWith('style')) {
          return path.join(path.dirname(assetPath), 'client', path.basename(assetPath));
        }
        return assetPath;
      }
    })
  ]
};
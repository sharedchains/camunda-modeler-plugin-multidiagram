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
            plugins: [
              [ '@babel/plugin-transform-react-jsx', {
                'importSource': '@bpmn-io/properties-panel/preact',
                'runtime': 'automatic'
              } ]
            ]
          }
        }
      },

      // apply loaders, falling back to file-loader, if non matches
      {
        oneOf: [
          {
            test: /\/[A-Z][^/]+\.svg$/,
            use: 'react-svg-loader'
          },
          {
            test: /\.(bpmn|cmmn|dmn)$/,
            use: 'raw-loader'
          },
          {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader'
            ]
          },
          {
            test: /\.less$/,
            use: [
              'style-loader',
              'css-loader',
              'less-loader'
            ]
          },
          {

            // exclude files served otherwise
            exclude: [ /\.(js|jsx|mjs)$/, /\.html$/, /\.json$/ ],
            loader: 'file-loader',
            options: {
              name: 'static/media/[name].[hash:8].[ext]'
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      'react': '@bpmn-io/properties-panel/preact/compat'
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
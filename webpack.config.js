const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');
const bootstrapEntryPoints = require("./webpack.bootstrap.config");
const glob = require('glob');
const PurifyCSSPlugin = require('purifycss-webpack');

const isProduction = process.env.NODE_ENV === 'production';
const cssDev = ['style-loader', 'css-loader', 'sass-loader'];
const cssProd = ExtractTextPlugin.extract({ //module to compile e load css and sass
  fallback: 'style-loader',
  loader: ['css-loader', 'sass-loader'],
  publicPath: './'
});

const cssConfig = isProduction ? cssProd : cssDev;

const bootstrapConfig = isProduction ? bootstrapEntryPoints.prod : bootstrapEntryPoints.dev;

module.exports = {
  entry: {
    app: './src/app.js',
    bootstrap: bootstrapConfig,
    vendor: ['angular'],
    contact: "./src/contact.js"
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[hash].js'
  },
  module: {
    rules: [{
        test: /\.js$/, // Check for all js files
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['es2015']
          }
        }]
      },
      {
        test: /\.scss$/,
        use: cssConfig
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: ['file-loader?name=images/[name].[ext]'] // 'image-webpack-loader']
      },
      {
        test: /\.(woff2?|svg)$/,
        loader: 'url-loader?limit=10000&name=fonts/[name].[ext]'
      },
      {
        test: /\.(ttf|eot)$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
      },
      {
        test: /bootstrap-sass[\/\\]assets[\/\\]javascripts[\/\\]/,
        loader: 'imports-loader?jQuery=jquery'
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
    stats: "errors-only",
    hot: true,
    open: true //reload browser
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      /*minChunks: function (module) {
        // this assumes your vendor imports exist in the node_modules directory
        return module.context && module.context.indexOf('node_modules') !== -1;
      }*/
      minChuncks: Infinity
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest' //But since there are no more common modules between them we end up with just the runtime code included in the manifest file
    }),
    new HtmlWebpackPlugin({ //plugins to add js in index.html
      title: 'Project Demo',
      //minify: {
      //  collapseWhitespace: true
      //},
      hash: true,
      excludeChunks: ['contact'],
      //filename: './../index.html',
      template: './src/index.html'
    }),
    new HtmlWebpackPlugin({ //plugins to add js in index.html
      title: 'Contact Demo',
      hash: true,
      chunks: ['contact'],
      filename: 'contact.html',
      template: './src/contact.html'
    }),
    new ExtractTextPlugin({ //plugins to add app.css in index.html with all style
      filename: 'css/[name].css',
      disable: !isProduction,
      allChunks: true
    }),
    // Make sure this is after ExtractTextPlugin!
    new PurifyCSSPlugin({
      // Give paths to parse for rules. These should be absolute!
      paths: glob.sync(path.join(__dirname, 'src/*.html')),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  ],
  stats: {
    colors: true
  },
  devtool: 'source-map'
}
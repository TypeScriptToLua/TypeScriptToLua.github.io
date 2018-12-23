const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  module: {
    rules: [
      {test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/},
      {test: /\.css$/, use: ['style-loader', 'css-loader']}, {
        test: /\.(png|svg|jpg|gif|ico)$/,
        use: [{
          loader: 'url-loader',
          options: {name: '[path][name].[ext]?hash=[hash:20]', limit: 8192}
        }]
      },
      {test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader']},
      {test: /\.webmanifest?$/, use: 'file-loader'},
    ]
  },
  plugins: [],
  resolve: {extensions: ['.tsx', '.ts', '.js']},
  output: {path: path.resolve(__dirname, '../dist')},
};
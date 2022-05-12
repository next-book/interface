const path = require('path');

module.exports = {
  entry: './src/js/standalone.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      fs: false,
      path: false,
    },
  },
  output: {
    filename: 'interface.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

const path = require('path');

module.exports = {
  entry: './src/js/standalone.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            allowTsInNodeModules: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'interface.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  devtool: 'hidden-source-map',
  entry: {
    'functions/index': path.join(__dirname, '../api/index.ts'),
  },
  output: {
    path: path.join(__dirname, '../../'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.coffee?$/i,
        use: {
          loader: 'coffee-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.yml$/i,
        use: [
          'json-loader',
          {
            loader: 'yaml-loader',
            options: {
              merge: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.coffee'],
  },
  externals: [
    nodeExternals({
      allowlist: [],
    }),
  ],
}

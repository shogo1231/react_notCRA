const path = require('path');

module.exports = {
  mode: 'development',
  // mode: 'production',
  entry: './src/index.tsx',
  output: {
    // path: path.join(`${__dirname}/`),
    path: path.join(__dirname, 'dist'),
    publicPath: '/training',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      /* TypeScriptのモジュール */
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: { presets: ['@babel/preset-env', '@babel/react'] },
          },
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
          },
        ]
      },
      /* CSSのモジュール */
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ]
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
      publicPath: '/training',
    },
    port: 4000,
    host: '133.130.91.178',
    allowedHosts: ['gosho-techplay.com'],
    client: {
      webSocketURL: 'wss://0.0.0.0/ws',
      //reconnect: false,
      webSocketTransport: 'ws',
      progress: true,
    },
    // react-router-domで画面遷移する際の404エラー対策
    // この設定について詳細確認が必要
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  target: 'web',
};
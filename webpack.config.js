//@ts-check

"use strict";

const webpack = require("webpack");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ file .env

/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: "node",
  mode: "none",

  entry: "./src/extension.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
  },
  externals: {
    vscode: "commonjs vscode",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  devtool: "nosources-source-map",
  infrastructureLogging: {
    level: "log",
  },

  // ✅ THÊM ĐOẠN NÀY
  plugins: [
    new webpack.DefinePlugin({
      "process.env.OPENAI_API_KEY": JSON.stringify(process.env.OPENAI_API_KEY),
    }),
  ],
};

module.exports = [extensionConfig];

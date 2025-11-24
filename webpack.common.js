const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: {
		app: "./src/index.js",
	},
	plugins: [
		new HTMLWebpackPlugin({  
		    template: "./src/index.html",
			title: 'Production',
		}),
	],
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
	module: {
		rules: [
	      {
	        test: /\.html$/i,
	        loader: "html-loader",
	      },
	      {
	        test: /\.(png|svg|jpg|jpeg|gif)$/i,
	        type: "asset/resource",
	      },
    ],
  },
};
const webpack = require("webpack");
const path = require("path");

module.exports = {

    devtool: "inline-source-map", // 用于调试

    entry: [
        "webpack-dev-server/client?http://127.0.0.1:8080/",
        "webpack/hot/only-dev-server",
        "./src"                    // 'src'文件下的所用js文件
    ],
    output: {
        path: path.join(__dirname, "public"), // '__dirname'表示当前根目录路径
        filename: "bundle.js"   // 标准输出文件
    },

    // webpack 寻找所需要的文件
    resolve: {
        moduleDirectories: ["node_modules", "src"],
        extension: ["", ".js"] ,
        alias: {
            Images: path.resolve('public', 'statics', 'img'),
          },
    },
    // 注意事项：
    // 1. "loaders" 不能写成 "loader"
    // 2. "babel?presets[]=react,presets[]=es2015"
    // 不能写成"babel?presets[]=es2015,presets[]=react"
    // 因为babel转换是有先后顺序的，从you'dao'zuo
    module: {
        loaders: [
        {
            test: /\.jsx?$/,
            exculde: /node_modules/,
            loaders: ["react-hot-loader/webpack", "babel?presets[]=react, presets[]es2015"]
        }
        ],
        rules: [
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: "assets/",   //输出图片放置的位置
                    publicPath: './asserts', //html的img标签src所指向图片的位置，与outputPath一致
                }
                }]
            }
            
        ]
    },

    plugins: {
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorPlugin()  // 查看错误
    },
  imageHash: true,


}
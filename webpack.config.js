const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const EncodingPlugin = require('webpack-encoding-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
    {
        mode: 'development',
        //mode: 'production',
        //entry: './wwwroot/dev/ts/app',
        entry: {
            "styles/treeview": ['./src/styles/app.less'],
            "scripts/treeview": ['./src/scripts/app.ts']
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader'
                },
                {
                    test: /\.less$/,
                    exclude: /node_modules/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
                },
                { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader' }
            ]
        },
        resolve: {
            extensions: ['.js', '.ts']
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: path.resolve(__dirname, "src/font"), to: "font"},
                    { from: path.resolve(__dirname, "src/scripts/app.d.ts"), to: "types"},
                    //{ from: path.resolve(__dirname, "src/scripts/classes/grid-settings.d.ts"), to: "types/classes/" },
                    //{ from: path.resolve(__dirname, "src/scripts/classes/column-options.d.ts"), to: "types/classes/" }
                ],
            }),
            new CssMinimizerPlugin(),
            new MiniCssExtractPlugin({
                filename: '[name].css'
            }),
            new EncodingPlugin({
                encoding: 'windows-1251'
            })
        ],
        //devtool: 'source-map',
        watch: true,
        output: {
            path: path.resolve(__dirname, './dist'),
            library:"treeview",
            libraryTarget: "umd"
        }
    }
]
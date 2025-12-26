const path = require('path')

module.exports = (env, argv)=>{
    const isProd = argv.mode === 'production'

    return {
        entry:"./src/main.js",
        output:{
            path: path.resolve(__dirname, "../static/bundles"),
            filename: 'app.bundle.js',
            clean: true,
        },
        devtool: isProd ? 'source-map' : 'eval-source-map',
        
        module:{
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                        presets: [
                                ["@babel/preset-env", { targets: "defaults" }],
                            ],
                        },
                    },
                },
            ]
        },
    }
}
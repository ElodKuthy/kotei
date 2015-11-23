module.exports = {
    entry: './client/entry.js',
    output: {
        path: 'public',
        filename: 'kotei.js'
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: 'style!css'
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass?includePaths[]=./node_modules/foundation-sites/scss/'
            },
            {
                test: /\.js?$/,
                exclude: /(node_modules|api)/,
                loader: 'ng-annotate?add=true!babel?presets[]=es2015'
            },
            {
                test: /\.html$/,
                loader: 'ng-cache'
            }
        ]
    }
};
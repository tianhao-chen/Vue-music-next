const registerRouter = require('./backend/router')

module.exports = {
    css:{
        loaderOptions: {
            sass:{
                // golbal import mixin and variables
                additionalData: `
                @import "@/assets/scss/variable.scss";
                @import "@/assets/scss/mixin.scss";   
                `
            }
        }
    },
    devServer: {
        before(app) {
          registerRouter(app)
        }
    },
    configureWebpack: (config) => {
        if (process.env.npm_config_report) {
            const BundleAnalyzePlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
            config.plugins.push(new BundleAnalyzePlugin())
        }
    },
    productionSourceMap: false,
    publicPath: process.env.NODE_ENV === 'production' ? '/vue-music/' : '/'
}
 
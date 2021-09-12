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
      }
}

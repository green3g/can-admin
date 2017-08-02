
var stealTools = require('steal-tools');

stealTools.export({
    steal: {
        config: __dirname + '/package.json!npm'
    },
    outputs: {
        '+amd': {
            ignore: false
        },
        '+cjs': {
            ignore: false
        },
        '+global-js': {
            modules: ['can-admin/behaviors/flask-restless/index'],
            ignore: false
        }
    }
}).catch(function (e) {

    setTimeout(function () {
        throw e;
    }, 1);

});

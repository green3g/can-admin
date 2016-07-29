var stealTools = require("steal-tools");
var path = require("path");

stealTools.export({
	system: {
		config: path.join(__dirname, "package.json!npm")
	},
	outputs: {
		"+amd": {
			ignore: false
		},
		"+cjs": {
			ignore: false
		},
		"+global-js": {
			modules: ['app/viewer/viewer'],
			ignore: false
		},
		'+global-css': {}
	}
}).catch(function(e){

	setTimeout(function(){
		throw e;
	},1);
});

var exec = require('child_process').exec;

module.exports = function(req, res, next) {
	if (req.params.version && req.params.version == 1) {
		exec('git describe --tags --always', function(err, stdout, stderr) {
			res.jsonp({
				name: "sharecount-service",
				apiVersion: 1,
				appVersion: stdout.replace(/^v?(.*?)\s?$/, '$1'),
				dateCreated: "2013-12-31",
				docs: "http://sharecount.origami.trib.tv/",
				support: "andrew.betts@ft.com",
				supportStatus: "active"
			});
		})
	} else if (!req.params.version) {
		res.jsonp({
			name: "sharecount-service",
			versions: [
				"http://sharecount.origami.trib.tv/v1"
			]
		});
	} else {
		next();
	}
}

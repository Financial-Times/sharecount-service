
var health = require('../../modules/health');

module.exports = function(req, res, next) {

	// Display current version healthcheck if no version is specified
	if (!req.params.version || req.params.version == 1) {
		health.get(function(data) {
			res.set('Cache-control', 'max-age=0, no-cache, must-revalidate');
			res.jsonp({
				schemaVersion: 1,
				name: 'sharecount-service',
				description: 'Fetches interaction counts for URLs on social network services',
				checks: data
			});
		});
	} else {
		next();
	}
}

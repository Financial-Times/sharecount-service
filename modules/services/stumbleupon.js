var req = require('request');
var deferred = require('deferred');

exports.fetch = function(urls, metrics) {
	return deferred.map(urls, function(url) {
		var def = deferred();
		req.get("http://www.stumbleupon.com/services/1.01/badge.getinfo?url="+encodeURIComponent(url), function(err, respobj, resp) {
			resp = JSON.parse(resp);
			def.resolve({url:url, metric:'shares', count:(resp.result.views ? resp.result.views : 0)});
		});
		return def.promise;
	});
}
exports.getMetrics = function() {
	return ['shares'];
}

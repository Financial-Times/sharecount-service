var req = require('request');
var deferred = require('deferred');

exports.fetch = function(urls, metrics) {
	return deferred.map(urls, function(url) {
		var def = deferred();
		req.get("http://urls.api.twitter.com/1/urls/count.json?url="+encodeURIComponent(url), function(err, respobj, resp) {
			try {
				resp = JSON.parse(resp);
				def.resolve({url:url, metric:'shares', count:resp.count});
			} catch (e) {
				def.resolve({});
			}
		});
		return def.promise;
	});
}
exports.getMetrics = function() {
	return ['shares'];
}

var req = require('request');
var deferred = require('deferred');

exports.fetch = function(urls, metrics) {
	if (metrics.indexOf('shares') === -1) {
		var def = deferred();
		def.resolve(null);
		return def.promise;
	}
	return deferred.map(urls, function(url) {
		var def = deferred();
		req.get("http://urls.api.twitter.com/1/urls/count.json?url="+encodeURIComponent(url), function(err, respobj, resp) {
			resp = JSON.parse(resp);
			def.resolve({url:url, metric:'shares', count:resp.count});
		});
		return def.promise;
	});
}

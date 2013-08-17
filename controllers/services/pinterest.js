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
		req.get("http://api.pinterest.com/v1/urls/count.json?callback=&url="+encodeURIComponent(url), function(err, respobj, resp) {
			var data = JSON.parse(resp.replace(/^\(/, '').replace(/\)$/, ''));
			def.resolve({url:url, metric:'shares', count:(data.count ? data.count : 0)});
		});
		return def.promise;
	});
}

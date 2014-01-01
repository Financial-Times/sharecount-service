var req = require('request');
var deferred = require('deferred');

exports.fetch = function(urls, metrics) {
	return deferred.map(urls, function(url) {
		var def = deferred();
		req.get("http://www.linkedin.com/countserv/count/share?url="+encodeURIComponent(url), function(err, resp, body) {
			var data = JSON.parse(body.replace(/^[^\{]+/, '').replace(/[^\}]+$/, ''));
			def.resolve({url:url, metric:'shares', count:(data.count ? data.count : 0)});
		});
		return def.promise;
	});
}
exports.getMetrics = function() {
	return ['shares'];
}

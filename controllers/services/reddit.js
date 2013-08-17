var req = require('request');
var deferred = require('deferred');

exports.fetch = function(urls, metrics) {
	if (metrics.indexOf('endorsements') === -1) {
		var def = deferred();
		def.resolve(null);
		return def.promise;
	}
	return deferred.map(urls, function(url) {
		var def = deferred();
		req.get("http://buttons.reddit.com/button_info.json?url="+encodeURIComponent(url), function(err, resp, body) {
			var data = JSON.parse(body);
			def.resolve({url:url, metric:'endorsements', count:(data.data.children.length ? data.data.children[0].data.score : 0)});
		});
		return def.promise;
	});
}

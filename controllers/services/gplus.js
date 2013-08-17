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
		req.get("https://plusone.google.com/_/+1/fastbutton?url="+encodeURIComponent(url)+"&count=true", function(err, respobj, resp) {
			var count = resp.replace(/^[\s\S]*? \{c\:\s*(\d+)[\s\S]+$/, '$1');
			def.resolve({url:url, metric:'shares', count:(!isNaN(count) ? parseInt(count,10) : 0)});
		});
		return def.promise;
	});
}

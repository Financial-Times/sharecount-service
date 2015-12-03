var req = require('request');

exports.fetch = function(urls, metrics) {
	var promises = urls.map(url => {
		return new Promise((resolve, reject) => {
			req.get("http://urls.api.twitter.com/1/urls/count.json?url="+encodeURIComponent(url), function(err, respobj, resp) {
				resp = JSON.parse(resp)
				if (resp.errors) {
					resolve({error:resp.errors});
				} else {
					resolve({url:url, metric:'shares', count:resp.count});
				}
			});
		});
	});

	return Promise.all(promises);
}

exports.getMetrics = function() {
	return ['shares'];
}

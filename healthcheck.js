module.exports = (checks) => {
  var promises = checks.map(check => {
    return new Promise(function(resolve, reject) {
      check.fetch(['http://www.ft.com'], ['shares']).then(function(result) {
	if (Array.isArray(result) && result[0] && result[0].url) {
	  resolve(result);
	} else {
	  var err = new Error('Check failure');
	  err.output = result;
	  reject(err);
	}
      });
    });
  });
  return Promise.all(promises);
};

/*
 * Documentation controller
 *
 * URL controller for home page.  Displays information on how to use the service
 */

module.exports = function(req, res) {
	res.sendfile('views/info.html');
}

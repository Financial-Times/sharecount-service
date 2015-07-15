module.exports = {
	memcached: {
		servers: process.env.MEMCACHIER_SERVERS || "127.0.0.1:11211",
		options: {"timeout":100}
	},
	port: process.env.PORT || 3001
}

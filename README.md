# Share count service

This is an [Origami](http://origami.ft.com) web service that fetches interaction counts for URLs on social network services (eg it can tell you the number of times a specific URL was liked on Facebook)

To use the service and for usage instructions, visit http://sharecount.webservices.ft.com

## Requirements

To run this service you will need:

* NodeJS (tested on 0.10.15)
* NPM (tested on 1.3.5)
* Memcached (tested on 1.4.13)

## Installation

1. Clone this repository
1. Edit `config.json` to tweak any settings as desired (for example, you may want to run the service on a different port)
1. Run `npm run-script prepare`, to install dependencies using NPM
1. Run `npm start` to launch the server

To update to the most recent version of the service, run `npm run-script prepare` again, and then `npm stop` and `npm start`

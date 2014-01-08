"use strict";

var config = require('./config/app');

var express = require('express');
var engine  = require('express-hbs');

var mongo = require('co-easymongo')(config.dbname);

var routes = require('./routes');
var server = express();

routes(server);

require('http').createServer(server).listen(config.port, function() {
  console.log('Run server on ' + config.port + ' port');
});
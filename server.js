"use strict";

var express = require('express');
var engine  = require('express-hbs');

var routes = require('./routes');
var server = express();

routes(server);

require('http').createServer(server).listen(3000, function() {
  console.log("Run server on port 3000");
});
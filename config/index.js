"use strict";

var fs = require('fs');
var nconf = module.exports = require('nconf');

var env = process.env.NODE_ENV || 'development';
var config = './config/app.' + env + '.json';

nconf.overrides({'env': env});
nconf.env(['port', 'yapi']);

if (fs.existsSync(config)) {
  nconf.file('custom', config);
}

nconf.file('./config/app.json');
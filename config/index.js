"use strict";

var fs = require('fs'),
nconf = module.exports = require('nconf'),

env = process.env.NODE_ENV || 'development',
config = './config/app.' + env + '.json';

nconf.overrides({'env': env});
nconf.env(['port', 'dbname', 'yapi']);

if (fs.existsSync(config)) {
  nconf.file('custom', config);
}

nconf.file('./config/app.json');
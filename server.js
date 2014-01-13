"use strict";

var config = require('./config'),

express = require('express'),
thunkify = require('co-express'),
engine = require('express-hbs'),

app = thunkify(express()),

mongo = require('co-easymongo')({
  dbname: config.get('dbname')
}),

routes = require('./routes');

app.response.yamb = require('yamb')({
  storage: mongo.collection(config.get('collection')),
  yapi: config.get('yapi')
});

routes(app);

require('http').createServer(app).listen(config.get('port'), function() {
  console.log('Run server on ' + config.get('port') + ' port');
});
"use strict";

var config = require('./config');

var express = require('express');
var parser = require('body-parser')
var hbs = require('express-hbs');
var helpers = require('./lib/helpers');

var app = module.exports = express();

var mongo = require('co-easymongo')({
  dbname: config.get('dbname')
});

var routes = require('./routes');

if ('development' === app.settings.env) {
  var morgan = require('morgan');

  app.use(morgan('dev'));
  app.use(express.static(__dirname + '/public'));
}

for (var helper in helpers) {
  if (!helpers.hasOwnProperty(helper)) {
    continue;
  }

  hbs.registerHelper(helper, helpers[helper]);
}

app.engine('hbs', hbs.express3({
  defaultLayout: __dirname + '/views/layout'
}));

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(parser.urlencoded({extended: false}));
app.use(parser.json())

app.response.yamb = require('yamb')({
  storage: mongo.collection(config.get('collection')),
  yapi: config.get('yapi')
});

app.response.error = require('./lib/notfound');

routes(app);

if (!module.parent) {
  app.listen(config.get('port'));
  console.log('\n  running yamb on port ' + config.get('port') + '\n');
}
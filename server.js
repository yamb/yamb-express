"use strict";

var config = require('./config'),

express = require('express'),
thunkify = require('co-express'),
handlebars = require('express-hbs'),

app = module.exports = thunkify(express()),

mongo = require('co-easymongo')({
  dbname: config.get('dbname')
}),

routes = require('./routes');

if ('development' === app.settings.env) {
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
}

app.engine('hbs', handlebars.express3());

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

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
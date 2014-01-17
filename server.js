"use strict";

var config = require('./config'),

express = require('express'),
thunkify = require('co-express'),
hbs = require('express-hbs'),
helpers = require('hbs-helpers'),

app = module.exports = thunkify(express()),

mongo = require('co-easymongo')({
  dbname: config.get('dbname')
}),

routes = require('./routes');

if ('development' === app.settings.env) {
  app.use(express.logger('dev'));
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
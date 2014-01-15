"use strict";

var middleware = require('./../middleware');

module.exports = function(app) {
  app.param('yamb', middleware.yamb);

  require('./yamb')(app, middleware);
  require('./admin')(app, middleware);
};
"use strict";

var middleware = require('./../middleware');

module.exports = function(app) {
  app.param('yamb', middleware.yamb);

  require('./admin')(app, middleware);
  require('./yamb')(app, middleware);
};
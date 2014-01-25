"use strict";

module.exports = function(app, middleware) {
  var action = require('./../controllers/yamb');

  app.get('/', action.index);
  app.get('/:year/:month/:slug', action.show);
};
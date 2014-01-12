"use strict";

module.exports = function(app) {
  var action = require('./../controllers/yamb');

  app.get('/', action.index);
};
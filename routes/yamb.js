"use strict";

module.exports = function(server) {
  var action = require('./../controllers/yamb');

  server.get('/', action.index);
};